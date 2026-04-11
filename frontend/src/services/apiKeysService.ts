/**
 * apiKeysService.ts — Manage REST API keys for external ERP integrations.
 * Keys are generated client-side, hashed (SHA-256), and only the hash is stored.
 * The plain key is shown to the user ONCE and is never retrievable afterwards.
 */
import { supabase } from '@/lib/supabase'

export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  dossierId: string | null
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateApiKey(): string {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  const hex = Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return `lp_${hex}`
}

export async function createApiKey(params: {
  name: string
  dossierId?: string | null
  expiresAt?: string | null
}): Promise<{ key: string; record: ApiKey }> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const key = generateApiKey()
  const keyHash = await sha256(key)
  const keyPrefix = key.substring(0, 12) + '...'

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      name: params.name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      dossier_id: params.dossierId || null,
      expires_at: params.expiresAt || null,
      scopes: ['balance:write'],
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return {
    key, // Plain key returned ONCE — never stored anywhere, never retrievable again
    record: mapRow(data as Record<string, unknown>),
  }
}

export async function listApiKeys(): Promise<ApiKey[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map((row) => mapRow(row as Record<string, unknown>))
}

export async function revokeApiKey(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteApiKey(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('api_keys').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

function mapRow(row: Record<string, unknown>): ApiKey {
  return {
    id: row.id as string,
    name: row.name as string,
    keyPrefix: row.key_prefix as string,
    scopes: (row.scopes as string[]) || [],
    dossierId: (row.dossier_id as string | null) || null,
    lastUsedAt: (row.last_used_at as string | null) || null,
    expiresAt: (row.expires_at as string | null) || null,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  }
}
