/**
 * Clés de stockage centralisées (localStorage / sessionStorage)
 */

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'fiscasync_access_token',
  REFRESH_TOKEN: 'fiscasync_refresh_token',
  USER: 'fiscasync_user',
  ORGANIZATION: 'fiscasync_organization',
  DB_PREFIX: 'fiscasync_db_',
  AUDIT_PREFIX: 'fiscasync_audit_',
  BALANCE_PREFIX: 'fiscasync_balance_',
  SUPABASE_AUTH: 'fiscasync_supabase_auth',
  TAUX_FISCAUX: 'fiscasync_taux_fiscaux',
} as const
