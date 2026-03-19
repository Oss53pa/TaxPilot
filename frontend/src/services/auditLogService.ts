/**
 * auditLogService.ts — P2-5: Piste d'audit horodatée
 * Enregistre chaque action utilisateur dans Supabase (ou localStorage en fallback).
 */
import { supabase, isSupabaseEnabled } from '@/lib/supabase'

export interface AuditEntry {
  id?: string
  dossierId?: string
  userId?: string
  action: string
  details?: Record<string, unknown>
  createdAt?: string
}

const LOCAL_KEY = 'fiscasync_audit_log'
const MAX_LOCAL_ENTRIES = 500

/**
 * Log an action to the audit trail.
 */
export async function logAuditAction(entry: Omit<AuditEntry, 'id' | 'createdAt'>): Promise<void> {
  const timestamp = new Date().toISOString()

  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from('audit_log').insert({
      dossier_id: entry.dossierId || null,
      user_id: entry.userId || null,
      action: entry.action,
      details: entry.details || {},
      created_at: timestamp,
    })
    if (error) console.error('[Audit] Erreur Supabase:', error)
    return
  }

  // Fallback localStorage
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const entries: AuditEntry[] = raw ? JSON.parse(raw) : []
    entries.unshift({ ...entry, id: Date.now().toString(36), createdAt: timestamp })
    // Keep only last MAX entries
    if (entries.length > MAX_LOCAL_ENTRIES) entries.length = MAX_LOCAL_ENTRIES
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries))
  } catch {
    console.error('[Audit] Erreur localStorage')
  }
}

/**
 * Fetch audit log entries, optionally filtered by dossier.
 */
export async function fetchAuditLog(dossierId?: string, limit = 100): Promise<AuditEntry[]> {
  if (isSupabaseEnabled && supabase) {
    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (dossierId) {
      query = query.eq('dossier_id', dossierId)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []).map(row => ({
      id: row.id,
      dossierId: row.dossier_id,
      userId: row.user_id,
      action: row.action,
      details: row.details,
      createdAt: row.created_at,
    }))
  }

  // Fallback localStorage
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const entries: AuditEntry[] = raw ? JSON.parse(raw) : []
    const filtered = dossierId ? entries.filter(e => e.dossierId === dossierId) : entries
    return filtered.slice(0, limit)
  } catch {
    return []
  }
}
