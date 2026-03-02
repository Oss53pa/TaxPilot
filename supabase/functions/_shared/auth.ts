/**
 * Shared auth utilities for Supabase Edge Functions
 * Supports both Supabase JWT (browser) and API key (integrations)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

export function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

export interface AuthContext {
  userId: string
  tenantId: string
  role: string
  method: 'jwt' | 'api_key'
}

/**
 * Authenticate a request — supports JWT bearer token OR x-api-key header
 */
export async function authenticate(req: Request): Promise<AuthContext> {
  const supabase = getServiceClient()

  // Method 1: API Key authentication
  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const { data: key, error } = await supabase
      .from('api_keys')
      .select('tenant_id, role, is_active, rate_limit, requests_today, last_request_at')
      .eq('key_hash', await hashApiKey(apiKey))
      .single()

    if (error || !key || !key.is_active) {
      throw new Error('Invalid or inactive API key')
    }

    // Rate limiting
    if (key.rate_limit > 0 && key.requests_today >= key.rate_limit) {
      throw new Error('Rate limit exceeded')
    }

    // Update request count
    const today = new Date().toISOString().split('T')[0]
    const lastDay = key.last_request_at ? key.last_request_at.split('T')[0] : ''
    await supabase
      .from('api_keys')
      .update({
        requests_today: today === lastDay ? key.requests_today + 1 : 1,
        last_request_at: new Date().toISOString(),
      })
      .eq('key_hash', await hashApiKey(apiKey))

    return {
      userId: 'api-key',
      tenantId: key.tenant_id,
      role: key.role,
      method: 'api_key',
    }
  }

  // Method 2: JWT bearer token
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    throw new Error('Invalid JWT token')
  }

  // Get profile for tenant_id and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    throw new Error('User has no tenant association')
  }

  return {
    userId: user.id,
    tenantId: profile.tenant_id,
    role: profile.role,
    method: 'jwt',
  }
}

/**
 * Hash an API key using SHA-256 (we store hashes, not raw keys)
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Check if the role has permission for a resource/action
 */
export async function checkPermission(ctx: AuthContext, resource: string, action: string): Promise<boolean> {
  if (ctx.role === 'OWNER') return true

  const supabase = getServiceClient()
  const { data } = await supabase
    .from('permissions')
    .select('allowed')
    .eq('role', ctx.role)
    .eq('resource', resource)
    .eq('action', action)
    .single()

  return data?.allowed ?? false
}

/**
 * Log an action to the audit trail
 */
export async function auditLog(
  ctx: AuthContext,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>,
): Promise<void> {
  const supabase = getServiceClient()

  // Get previous hash
  const { data: lastEntry } = await supabase
    .from('audit_trail')
    .select('hash')
    .eq('tenant_id', ctx.tenantId)
    .order('id', { ascending: false })
    .limit(1)
    .single()

  const prevHash = lastEntry?.hash ?? '0000000000000000000000000000000000000000000000000000000000000000'
  const timestamp = new Date().toISOString()
  const payload = [
    ctx.tenantId,
    ctx.userId,
    action,
    resource,
    resourceId ?? '',
    JSON.stringify(details ?? {}),
    prevHash,
    timestamp,
  ].join('|')

  const hashData = new TextEncoder().encode(payload)
  const hashBuffer = await crypto.subtle.digest('SHA-256', hashData)
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

  await supabase.from('audit_trail').insert({
    tenant_id: ctx.tenantId,
    user_id: ctx.userId === 'api-key' ? null : ctx.userId,
    action,
    resource,
    resource_id: resourceId,
    details: details ?? {},
    prev_hash: prevHash,
    hash,
    created_at: timestamp,
  })
}
