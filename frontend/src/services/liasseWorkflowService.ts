/**
 * liasseWorkflowService — workflow de statut de la liasse (Supabase).
 *
 * Cycle OHADA : BROUILLON → VALIDEE → VERROUILLEE (immuable, empreinte SHA-256)
 * → DECLAREE → ARCHIVEE. Mode-agnostic (table lp_liasse_status, dossier_id
 * optionnel '' en mode Entreprise). RLS par user ; immuabilité garantie par
 * trigger côté DB (pas de dé-verrouillage).
 *
 * Best-effort : si Supabase est indisponible, getStatus renvoie un BROUILLON
 * non persisté et les transitions lèvent une erreur explicite.
 */
import { supabase } from '@/lib/supabase'
import { getActiveDossierId } from '@/services/dossierScopeService'
import { logger } from '@/utils/logger'

export type LiasseStatut = 'BROUILLON' | 'VALIDEE' | 'VERROUILLEE' | 'DECLAREE' | 'ARCHIVEE'
export type WorkflowActionKey = 'valider' | 'verrouiller' | 'remettre_brouillon' | 'declarer' | 'archiver'

export interface LiasseStatus {
  statut: LiasseStatut
  isLocked: boolean
  hash: string | null
  exercice: string
  typeLiasse: string
  validatedAt: string | null
  lockedAt: string | null
  declaredAt: string | null
  archivedAt: string | null
}

export interface WorkflowAction {
  action: WorkflowActionKey
  label: string
  color: 'primary' | 'success' | 'warning' | 'error' | 'inherit'
  irreversible: boolean
  confirmation?: string
}

export const STATUT_LABELS: Record<LiasseStatut, string> = {
  BROUILLON: 'Brouillon',
  VALIDEE: 'Validée',
  VERROUILLEE: 'Verrouillée',
  DECLAREE: 'Déclarée',
  ARCHIVEE: 'Archivée',
}

export const STATUT_ORDER: LiasseStatut[] = ['BROUILLON', 'VALIDEE', 'VERROUILLEE', 'DECLAREE', 'ARCHIVEE']

const ACTIONS_BY_STATUT: Record<LiasseStatut, WorkflowAction[]> = {
  BROUILLON: [
    { action: 'valider', label: 'Valider', color: 'success', irreversible: false },
  ],
  VALIDEE: [
    {
      action: 'verrouiller',
      label: 'Verrouiller (immuable)',
      color: 'warning',
      irreversible: true,
      confirmation:
        'Le verrouillage est IRRÉVERSIBLE : la liasse devient immuable et son empreinte SHA-256 est figée. Continuer ?',
    },
    { action: 'remettre_brouillon', label: 'Remettre en brouillon', color: 'inherit', irreversible: false },
  ],
  VERROUILLEE: [
    { action: 'declarer', label: 'Marquer déclarée', color: 'primary', irreversible: false },
  ],
  DECLAREE: [
    { action: 'archiver', label: 'Archiver', color: 'primary', irreversible: false },
  ],
  ARCHIVEE: [],
}

export function getAvailableActions(statut: LiasseStatut): WorkflowAction[] {
  return ACTIONS_BY_STATUT[statut] ?? []
}

interface StatusRow {
  statut: LiasseStatut
  is_locked: boolean
  hash_sha256: string | null
  type_liasse: string
  validated_at: string | null
  locked_at: string | null
  declared_at: string | null
  archived_at: string | null
}

function defaultStatus(exercice: string, typeLiasse: string): LiasseStatus {
  return {
    statut: 'BROUILLON', isLocked: false, hash: null, exercice, typeLiasse,
    validatedAt: null, lockedAt: null, declaredAt: null, archivedAt: null,
  }
}

async function uid(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.user?.id ?? null
  } catch {
    return null
  }
}

async function sha256Json(value: unknown): Promise<string | null> {
  try {
    if (typeof crypto === 'undefined' || !crypto.subtle) return null
    const data = new TextEncoder().encode(JSON.stringify(value))
    const digest = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return null
  }
}

/** Statut courant pour (user, dossier actif, exercice). BROUILLON par défaut. */
export async function getLiasseStatus(exercice: string, typeLiasse = 'SN'): Promise<LiasseStatus> {
  if (!supabase) return defaultStatus(exercice, typeLiasse)
  const userId = await uid()
  if (!userId) return defaultStatus(exercice, typeLiasse)
  try {
    const { data, error } = await supabase
      .from('lp_liasse_status')
      .select('statut, is_locked, hash_sha256, type_liasse, validated_at, locked_at, declared_at, archived_at')
      .eq('user_id', userId)
      .eq('dossier_id', getActiveDossierId() || '')
      .eq('exercice', exercice)
      .maybeSingle()
    if (error || !data) return defaultStatus(exercice, typeLiasse)
    const r = data as StatusRow
    return {
      statut: r.statut, isLocked: r.is_locked, hash: r.hash_sha256, exercice,
      typeLiasse: r.type_liasse || typeLiasse,
      validatedAt: r.validated_at, lockedAt: r.locked_at, declaredAt: r.declared_at, archivedAt: r.archived_at,
    }
  } catch {
    return defaultStatus(exercice, typeLiasse)
  }
}

/** Applique une transition de workflow. Lève une erreur si indisponible/refusée. */
export async function transitionLiasse(
  exercice: string,
  action: WorkflowActionKey,
  typeLiasse = 'SN',
): Promise<void> {
  if (!supabase) throw new Error('Supabase non configuré — workflow indisponible.')
  const userId = await uid()
  if (!userId) throw new Error('Session requise.')
  const dossierId = getActiveDossierId() || ''
  const now = new Date().toISOString()

  const patch: Record<string, unknown> = {}
  switch (action) {
    case 'valider':
      patch.statut = 'VALIDEE'; patch.validated_at = now; break
    case 'remettre_brouillon':
      patch.statut = 'BROUILLON'; break
    case 'verrouiller': {
      patch.statut = 'VERROUILLEE'; patch.is_locked = true; patch.locked_at = now
      // Empreinte SHA-256 du contenu de la liasse (intégrité).
      try {
        const { liasseDataService } = await import('./liasseDataService')
        const snapshot = {
          actif: liasseDataService.generateBilanActif(typeLiasse as never),
          passif: liasseDataService.generateBilanPassif(typeLiasse as never),
          cr: liasseDataService.generateCompteResultat(typeLiasse as never),
        }
        patch.hash_sha256 = await sha256Json(snapshot)
      } catch {
        patch.hash_sha256 = await sha256Json({ exercice, typeLiasse, at: now })
      }
      break
    }
    case 'declarer':
      patch.statut = 'DECLAREE'; patch.declared_at = now; break
    case 'archiver':
      patch.statut = 'ARCHIVEE'; patch.archived_at = now; break
    default:
      throw new Error(`Action inconnue : ${action}`)
  }

  // Garantit l'existence de la ligne (BROUILLON) sans toucher aux champs verrouillés,
  // puis applique le patch ciblé (n'envoie jamais hash/is_locked pour declarer/archiver).
  await supabase.from('lp_liasse_status').upsert(
    { user_id: userId, dossier_id: dossierId, exercice, type_liasse: typeLiasse },
    { onConflict: 'user_id,dossier_id,exercice', ignoreDuplicates: true },
  )
  const { error } = await supabase
    .from('lp_liasse_status')
    .update(patch)
    .match({ user_id: userId, dossier_id: dossierId, exercice })
  if (error) {
    logger.warn('[liasseWorkflow] transition error:', error.message)
    throw new Error(error.message)
  }
}
