/**
 * Audit Trail Service — SHA-256 Chained Immutable Log
 * Conformité OHADA Art. 19-24 : traçabilité complète et inaltérable
 *
 * Each entry's hash = SHA-256(id + tenant_id + user_id + action + resource + resource_id + details + prev_hash + timestamp)
 * This creates a tamper-evident chain: modifying any entry breaks the chain.
 */

import { supabase } from '@/config/supabase'
import type { AuditTrailEntry, AuditAction } from '@/types/cloud'

// ============================================================
// SHA-256 hashing (Web Crypto API — works in browser)
// ============================================================

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Genesis hash for the first entry in a tenant's chain */
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000'

// ============================================================
// Core: log an action
// ============================================================

export async function logAction(params: {
  action: AuditAction
  resource: string
  resource_id?: string
  details?: Record<string, unknown>
}): Promise<AuditTrailEntry | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get tenant_id from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    if (!profile?.tenant_id) return null

    const tenantId = profile.tenant_id

    // Get previous hash (last entry for this tenant)
    const { data: lastEntry } = await supabase
      .from('audit_trail')
      .select('hash')
      .eq('tenant_id', tenantId)
      .order('id', { ascending: false })
      .limit(1)
      .single()

    const prevHash = lastEntry?.hash ?? GENESIS_HASH

    // Build hash payload
    const timestamp = new Date().toISOString()
    const detailsStr = JSON.stringify(params.details ?? {})
    const payload = [
      tenantId,
      user.id,
      params.action,
      params.resource,
      params.resource_id ?? '',
      detailsStr,
      prevHash,
      timestamp,
    ].join('|')

    const hash = await sha256(payload)

    // Insert (append-only — DB trigger prevents UPDATE/DELETE)
    const { data: entry, error } = await supabase
      .from('audit_trail')
      .insert({
        tenant_id: tenantId,
        user_id: user.id,
        action: params.action,
        resource: params.resource,
        resource_id: params.resource_id ?? null,
        details: params.details ?? {},
        ip_address: null, // Could be populated via Edge Function
        user_agent: navigator.userAgent.substring(0, 255),
        prev_hash: prevHash,
        hash,
        created_at: timestamp,
      })
      .select()
      .single()

    if (error) {
      console.error('Audit trail insert failed:', error)
      return null
    }

    return entry
  } catch (err) {
    console.error('Audit trail error:', err)
    return null
  }
}

// ============================================================
// Convenience wrappers
// ============================================================

export function logCreate(resource: string, resourceId: string, details?: Record<string, unknown>) {
  return logAction({ action: 'CREATE', resource, resource_id: resourceId, details })
}

export function logUpdate(resource: string, resourceId: string, details?: Record<string, unknown>) {
  return logAction({ action: 'UPDATE', resource, resource_id: resourceId, details })
}

export function logDelete(resource: string, resourceId: string, details?: Record<string, unknown>) {
  return logAction({ action: 'DELETE', resource, resource_id: resourceId, details })
}

export function logValidate(resource: string, resourceId: string, details?: Record<string, unknown>) {
  return logAction({ action: 'VALIDATE', resource, resource_id: resourceId, details })
}

export function logDeclare(resource: string, resourceId: string, details?: Record<string, unknown>) {
  return logAction({ action: 'DECLARE', resource, resource_id: resourceId, details })
}

export function logExport(resource: string, resourceId: string, details?: Record<string, unknown>) {
  return logAction({ action: 'EXPORT', resource, resource_id: resourceId, details })
}

export function logLogin() {
  return logAction({ action: 'LOGIN', resource: 'auth', details: { user_agent: navigator.userAgent } })
}

export function logLogout() {
  return logAction({ action: 'LOGOUT', resource: 'auth' })
}

// ============================================================
// Query: get audit trail entries
// ============================================================

export async function getAuditTrail(params?: {
  resource?: string
  resource_id?: string
  action?: AuditAction
  limit?: number
  offset?: number
}): Promise<{ entries: AuditTrailEntry[]; total: number }> {
  let query = supabase
    .from('audit_trail')
    .select('*', { count: 'exact' })
    .order('id', { ascending: false })

  if (params?.resource) query = query.eq('resource', params.resource)
  if (params?.resource_id) query = query.eq('resource_id', params.resource_id)
  if (params?.action) query = query.eq('action', params.action)

  const limit = params?.limit ?? 50
  const offset = params?.offset ?? 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) throw error

  return { entries: data ?? [], total: count ?? 0 }
}

// ============================================================
// Verify chain integrity
// ============================================================

export async function verifyChainIntegrity(batchSize = 100): Promise<{
  valid: boolean
  checked: number
  brokenAt: number | null
  error: string | null
}> {
  let offset = 0
  let prevHash = GENESIS_HASH
  let checked = 0

  while (true) {
    const { data: entries, error } = await supabase
      .from('audit_trail')
      .select('*')
      .order('id', { ascending: true })
      .range(offset, offset + batchSize - 1)

    if (error) return { valid: false, checked, brokenAt: null, error: error.message }
    if (!entries || entries.length === 0) break

    for (const entry of entries) {
      // Verify prev_hash link
      if (entry.prev_hash !== prevHash) {
        return {
          valid: false,
          checked,
          brokenAt: entry.id,
          error: `Chain broken at entry #${entry.id}: expected prev_hash ${prevHash.substring(0, 16)}..., got ${entry.prev_hash.substring(0, 16)}...`,
        }
      }

      // Recompute hash
      const payload = [
        entry.tenant_id,
        entry.user_id ?? '',
        entry.action,
        entry.resource,
        entry.resource_id ?? '',
        JSON.stringify(entry.details ?? {}),
        entry.prev_hash,
        entry.created_at,
      ].join('|')

      const expectedHash = await sha256(payload)
      if (entry.hash !== expectedHash) {
        return {
          valid: false,
          checked,
          brokenAt: entry.id,
          error: `Hash mismatch at entry #${entry.id}: data has been tampered with`,
        }
      }

      prevHash = entry.hash
      checked++
    }

    offset += batchSize
    if (entries.length < batchSize) break
  }

  return { valid: true, checked, brokenAt: null, error: null }
}
