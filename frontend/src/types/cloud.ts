/**
 * Cloud Types — Liass'Pilot Multi-Tenant
 * Maps to Supabase tables defined in 001_multi_tenant_schema.sql
 */

// ============================================================
// Tenant (Cabinet / Organisation)
// ============================================================
export interface Tenant {
  id: string
  nom: string
  slug: string
  plan: TenantPlan
  pays: string
  devise: string
  logo_url: string | null
  liasses_quota: number
  liasses_used: number
  storage_quota_mb: number
  storage_used_mb: number
  users_quota: number
  trial_ends_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TenantPlan = 'STARTER' | 'BUSINESS' | 'ENTERPRISE'

// ============================================================
// Profile (extends auth.users)
// ============================================================
export interface Profile {
  id: string
  tenant_id: string | null
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export type UserRole = 'OWNER' | 'ADMIN' | 'COMPTABLE' | 'AUDITEUR' | 'VIEWER'

// ============================================================
// Permission (RBAC)
// ============================================================
export interface Permission {
  id: string
  role: UserRole
  resource: PermissionResource
  action: PermissionAction
  allowed: boolean
}

export type PermissionResource = 'balance' | 'liasse' | 'audit' | 'parametrage' | 'users' | 'billing'
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'validate' | 'declare'

// ============================================================
// Entity (Entreprise gérée)
// ============================================================
export interface TenantEntity {
  id: string
  tenant_id: string
  raison_sociale: string
  forme_juridique: string | null
  numero_contribuable: string | null
  rccm: string | null
  ifu: string | null
  adresse: string | null
  ville: string | null
  pays: string
  telephone: string | null
  email: string | null
  nom_dirigeant: string | null
  fonction_dirigeant: string | null
  regime_imposition: 'REEL_NORMAL' | 'REEL_SIMPLIFIE' | 'SYNTHETIQUE'
  centre_impots: string | null
  secteur_activite: string | null
  type_liasse: LiasseType
  chiffre_affaires_annuel: number
  devise: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type LiasseType = 'SN' | 'SMT' | 'CONSO' | 'BANQUE' | 'ASSURANCE' | 'MICROFINANCE' | 'EBNL'

// ============================================================
// Exercice
// ============================================================
export interface Exercice {
  id: string
  tenant_id: string
  entity_id: string
  code: string
  date_debut: string
  date_fin: string
  duree_mois: number
  statut: ExerciceStatut
  is_current: boolean
  created_at: string
  updated_at: string
}

export type ExerciceStatut = 'en_cours' | 'cloture' | 'valide' | 'depose'

// ============================================================
// Audit Trail Entry (OHADA Art. 19-24)
// ============================================================
export interface AuditTrailEntry {
  id: number
  tenant_id: string
  user_id: string | null
  action: AuditAction
  resource: string
  resource_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  prev_hash: string
  hash: string
  created_at: string
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VALIDATE' | 'DECLARE' | 'EXPORT' | 'LOGIN' | 'LOGOUT'

// ============================================================
// Invitation
// ============================================================
export interface Invitation {
  id: string
  tenant_id: string
  email: string
  role: UserRole
  invited_by: string | null
  token: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'
  expires_at: string
  created_at: string
}

// ============================================================
// Supabase mode flag
// ============================================================
export function isSupabaseEnabled(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!(url && key && !url.includes('YOUR_PROJECT'))
}
