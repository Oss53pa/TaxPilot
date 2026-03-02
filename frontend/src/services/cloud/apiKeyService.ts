/**
 * API Key Management Service
 * Create, list, revoke API keys for integrations.
 * Keys are SHA-256 hashed before storage — raw key is only shown once at creation.
 */

import { supabase } from '@/config/supabase'
import type { UserRole } from '@/types/cloud'

export interface ApiKey {
  id: string
  tenant_id: string
  name: string
  key_prefix: string
  role: UserRole
  is_active: boolean
  rate_limit: number
  requests_today: number
  last_request_at: string | null
  expires_at: string | null
  created_at: string
}

/**
 * Generate a cryptographically random API key
 * Format: lp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx (40 chars)
 */
function generateRawKey(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  return `lp_live_${hex}`
}

/**
 * SHA-256 hash of the raw key
 */
async function hashKey(rawKey: string): Promise<string> {
  const data = new TextEncoder().encode(rawKey)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Create a new API key — returns the raw key (only shown once!)
 */
export async function createApiKey(params: {
  name: string
  role?: UserRole
  rate_limit?: number
  expires_at?: string
}): Promise<{ key: ApiKey; rawKey: string }> {
  const rawKey = generateRawKey()
  const keyHash = await hashKey(rawKey)
  const keyPrefix = rawKey.substring(0, 12) + '...'

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      name: params.name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      role: params.role || 'COMPTABLE',
      rate_limit: params.rate_limit ?? 1000,
      expires_at: params.expires_at || null,
      created_by: user?.id || null,
    })
    .select()
    .single()

  if (error) throw error
  return { key: data, rawKey }
}

/**
 * List all API keys for the current tenant
 */
export async function listApiKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/**
 * Revoke (deactivate) an API key
 */
export async function revokeApiKey(id: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}

/**
 * Update API key settings
 */
export async function updateApiKey(id: string, changes: { name?: string; rate_limit?: number; role?: UserRole }): Promise<ApiKey> {
  const { data, error } = await supabase
    .from('api_keys')
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(id: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
  if (error) throw error
}
