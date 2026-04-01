import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { logger } from '@/utils/logger'

export interface DataRequest {
  id: string
  requestType: 'export' | 'delete'
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  reason?: string
  exportUrl?: string
  expiresAt?: string
  createdAt: string
}

export interface RetentionPolicy {
  dataType: string
  retentionYears: number
  legalBasis: string
  description: string
}

/**
 * Request a full data export (RGPD Art. 20 - Portability)
 */
export async function requestDataExport(userId: string): Promise<string> {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Service non disponible en mode hors-ligne')
  }

  const { data, error } = await supabase
    .from('data_requests')
    .insert({
      user_id: userId,
      request_type: 'export',
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  logger.info(`[RGPD] Data export request created: ${data.id}`)
  return data.id
}

/**
 * Request account deletion (RGPD Art. 17 - Right to erasure)
 */
export async function requestAccountDeletion(userId: string, reason?: string): Promise<string> {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Service non disponible en mode hors-ligne')
  }

  const { data, error } = await supabase
    .from('data_requests')
    .insert({
      user_id: userId,
      request_type: 'delete',
      status: 'pending',
      reason,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Mark profile as deletion-requested
  await supabase
    .from('profiles')
    .update({ deletion_requested_at: new Date().toISOString() })
    .eq('id', userId)

  logger.info(`[RGPD] Account deletion request created: ${data.id}`)
  return data.id
}

/**
 * Get user's data requests history
 */
export async function getDataRequests(userId: string): Promise<DataRequest[]> {
  if (!isSupabaseEnabled || !supabase) return []

  const { data, error } = await supabase
    .from('data_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data || []).map(row => ({
    id: row.id,
    requestType: row.request_type,
    status: row.status,
    reason: row.reason,
    exportUrl: row.export_url,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }))
}

/**
 * Get all retention policies
 */
export async function getRetentionPolicies(): Promise<RetentionPolicy[]> {
  if (!isSupabaseEnabled || !supabase) {
    // Return default policies when offline
    return [
      { dataType: 'balance_sheets', retentionYears: 10, legalBasis: 'OHADA Art. 24', description: 'Balances comptables' },
      { dataType: 'liasses_fiscales', retentionYears: 10, legalBasis: 'OHADA Art. 24 + CGI', description: 'Liasses fiscales' },
      { dataType: 'audit_logs', retentionYears: 10, legalBasis: 'OHADA Art. 24', description: 'Journal d\'audit' },
      { dataType: 'user_profiles', retentionYears: 3, legalBasis: 'RGPD Art. 17', description: 'Données personnelles' },
    ]
  }

  const { data, error } = await supabase
    .from('retention_policies')
    .select('*')
    .order('retention_years', { ascending: false })

  if (error) throw new Error(error.message)

  return (data || []).map(row => ({
    dataType: row.data_type,
    retentionYears: row.retention_years,
    legalBasis: row.legal_basis,
    description: row.description,
  }))
}
