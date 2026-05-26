/**
 * userManagementService — gestion réelle des collaborateurs (invitations + rôles).
 *
 * Modèle multi-tenant (migration 015) :
 *   - lp_user_orgs   : appartenance authoritative (RLS), écrite par l'edge
 *                      function / les RPC SECURITY DEFINER uniquement.
 *   - lp_org_members : roster d'affichage indexé par EMAIL (invité visible
 *                      avant même d'avoir accepté).
 *
 * S'appuie sur :
 *   - l'edge function Supabase `invite-user` (création utilisateur + email HTML Resend),
 *   - les RPC SECURITY DEFINER (lp_get_my_role / lp_ensure_org / lp_set_member_*).
 *
 * Si Supabase n'est pas configuré (mode local pur), les méthodes renvoient un
 * état dégradé honnête (liste vide, rôle null = admin local) plutôt que de
 * simuler des données.
 */
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { logger } from '@/utils/logger'

export type MemberRole = 'admin' | 'comptable' | 'auditeur' | 'viewer'
export type MemberStatus = 'pending' | 'active' | 'disabled'

export interface OrgMember {
  email: string
  name: string
  role: MemberRole
  active: boolean
  invitedAt: string | null
  lastLoginAt: string | null
  invitedBy: string | null
  /** Statut dérivé pour l'affichage. */
  status: MemberStatus
}

export interface InvitePayload {
  email: string
  fullName: string
  role: MemberRole
}

export interface InviteResult {
  success: boolean
  email: string
  resent: boolean
  emailSent: boolean
  emailError: string | null
  /** Lien d'activation à copier si l'email n'a pas pu être envoyé. */
  link: string
}

export const ROLE_OPTIONS: { value: MemberRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Administrateur', description: 'Accès complet, gestion des utilisateurs et des paramètres' },
  { value: 'comptable', label: 'Comptable', description: 'Saisie, balance, génération de la liasse' },
  { value: 'auditeur', label: 'Auditeur', description: 'Contrôle et revue, sans modification' },
  { value: 'viewer', label: 'Lecture seule', description: 'Consultation uniquement' },
]

export const ROLE_LABELS: Record<MemberRole, string> = {
  admin: 'Administrateur',
  comptable: 'Comptable',
  auditeur: 'Auditeur',
  viewer: 'Lecture seule',
}

interface RosterRow {
  email: string | null
  name: string | null
  role: MemberRole
  active: boolean
  invited_at: string | null
  last_login_at: string | null
  invited_by: string | null
}

function deriveStatus(active: boolean, lastLogin: string | null): MemberStatus {
  if (!active) return 'disabled'
  if (!lastLogin) return 'pending'
  return 'active'
}

function mapRow(r: RosterRow): OrgMember {
  return {
    email: r.email || '',
    name: r.name || '',
    role: r.role,
    active: r.active,
    invitedAt: r.invited_at,
    lastLoginAt: r.last_login_at,
    invitedBy: r.invited_by,
    status: deriveStatus(r.active, r.last_login_at),
  }
}

export const userManagementService = {
  /** true si Supabase est disponible (sinon mode local mono-utilisateur). */
  isAvailable(): boolean {
    return isSupabaseEnabled && !!supabase
  },

  /**
   * Garantit que le user courant a une org (bootstrap acheteur = admin).
   * Idempotent. Renvoie l'org_id. THROW si le RPC est indisponible (ex:
   * migration 015 pas encore déployée) → le hook décide du fallback.
   */
  async ensureOrg(): Promise<string | null> {
    if (!supabase) return null
    const { data, error } = await supabase.rpc('lp_ensure_org', { p_name: null })
    if (error) {
      logger.warn('[userManagement] ensureOrg error:', error.message)
      throw new Error(error.message)
    }
    return (data as string) ?? null
  },

  /**
   * Rôle de l'utilisateur courant ('admin'|'comptable'|...). null = pas
   * encore d'appartenance (mode local, ou acheteur avant bootstrap).
   * THROW si le RPC est indisponible (migration non déployée) → fallback
   * géré par l'appelant (useUserRole reste permissif = admin).
   */
  async getMyRole(): Promise<MemberRole | null> {
    if (!supabase) return null
    const { data, error } = await supabase.rpc('lp_get_my_role')
    if (error) {
      logger.warn('[userManagement] getMyRole error:', error.message)
      throw new Error(error.message)
    }
    return (data as MemberRole | null) ?? null
  },

  /** Liste des membres de l'org (RLS : admins/membres de l'org). */
  async listMembers(): Promise<OrgMember[]> {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('lp_org_members')
      .select('email, name, role, active, invited_at, last_login_at, invited_by')
      .order('invited_at', { ascending: true })
    if (error) {
      logger.warn('[userManagement] listMembers error:', error.message)
      return []
    }
    return ((data as RosterRow[]) || []).map(mapRow)
  },

  /** Invite (ou renvoie l'invitation à) un collaborateur. */
  async invite(payload: InvitePayload): Promise<InviteResult> {
    if (!supabase) {
      throw new Error('Supabase non configuré : invitation indisponible en mode local.')
    }
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: {
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
      },
    })
    if (error) {
      // L'edge function renvoie un message d'erreur structuré dans le body.
      let detail = error.message
      try {
        const ctx = (error as { context?: { body?: unknown } }).context
        if (ctx?.body) {
          const parsed = typeof ctx.body === 'string' ? JSON.parse(ctx.body) : ctx.body
          if (parsed && typeof parsed === 'object' && 'error' in parsed) {
            detail = String((parsed as { error: unknown }).error)
          }
        }
      } catch { /* ignore */ }
      throw new Error(detail)
    }
    if (!data?.success) {
      throw new Error(data?.error || "Échec de l'invitation")
    }
    return data as InviteResult
  },

  /** Renvoie l'invitation (lien de récupération) à un membre existant. */
  async resend(member: OrgMember): Promise<InviteResult> {
    return this.invite({ email: member.email, fullName: member.name, role: member.role })
  },

  async updateRole(email: string, role: MemberRole): Promise<void> {
    if (!supabase) throw new Error('Supabase non configuré')
    const { error } = await supabase.rpc('lp_set_member_role', { p_email: email, p_role: role })
    if (error) throw new Error(error.message)
  },

  async setActive(email: string, active: boolean): Promise<void> {
    if (!supabase) throw new Error('Supabase non configuré')
    const { error } = await supabase.rpc('lp_set_member_active', { p_email: email, p_active: active })
    if (error) throw new Error(error.message)
  },

  async remove(email: string): Promise<void> {
    if (!supabase) throw new Error('Supabase non configuré')
    const { error } = await supabase.rpc('lp_remove_member', { p_email: email })
    if (error) throw new Error(error.message)
  },

  /** Best-effort : marque la connexion (last_login_at). */
  async touchLogin(): Promise<void> {
    if (!supabase) return
    try {
      await supabase.rpc('lp_touch_member_login')
    } catch {
      /* non bloquant */
    }
  },
}

export default userManagementService
