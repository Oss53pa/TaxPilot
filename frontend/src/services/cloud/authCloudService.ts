/**
 * Cloud Auth Service — Supabase Auth + RBAC Permissions
 * Replaces the localStorage-based authService when Supabase is enabled.
 */

import { supabase } from '@/config/supabase'
import type { Profile, UserRole, PermissionResource, PermissionAction } from '@/types/cloud'
import type { User } from '@/services/apiClient'

// ============================================================
// Permissions cache (loaded once per session)
// ============================================================
let permissionsCache: Map<string, boolean> | null = null

async function loadPermissions(): Promise<Map<string, boolean>> {
  if (permissionsCache) return permissionsCache

  const { data, error } = await supabase
    .from('permissions')
    .select('role, resource, action, allowed')
  if (error) {
    console.error('Failed to load permissions:', error)
    return new Map()
  }

  const map = new Map<string, boolean>()
  for (const p of data ?? []) {
    map.set(`${p.role}:${p.resource}:${p.action}`, p.allowed)
  }
  permissionsCache = map
  return map
}

export function clearPermissionsCache(): void {
  permissionsCache = null
}

// ============================================================
// Auth operations
// ============================================================

export async function signUp(email: string, password: string, fullName: string): Promise<{ user: Profile | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) return { user: null, error: error.message }

  // Profile is auto-created by DB trigger
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    return { user: profile, error: null }
  }
  return { user: null, error: null }
}

export async function signIn(email: string, password: string): Promise<{ user: User; profile: Profile }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)

  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()
  if (profErr) throw new Error('Profile not found')

  // Update last login
  await supabase
    .from('profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.user.id)

  // Map to legacy User type for compatibility with existing authStore
  const user: User = {
    id: parseInt(data.user.id.substring(0, 8), 16) || 1,
    username: profile.full_name || email.split('@')[0],
    email,
    first_name: (profile.full_name || '').split(' ')[0] || '',
    last_name: (profile.full_name || '').split(' ').slice(1).join(' ') || '',
    is_staff: profile.role === 'OWNER' || profile.role === 'ADMIN',
    is_superuser: profile.role === 'OWNER',
  }

  return { user, profile }
}

export async function signOut(): Promise<void> {
  clearPermissionsCache()
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Sign out error:', error)
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session
}

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
}

// ============================================================
// Permission checks
// ============================================================

export async function hasPermission(resource: PermissionResource, action: PermissionAction): Promise<boolean> {
  const profile = await getProfile()
  if (!profile) return false

  // OWNER bypasses all checks
  if (profile.role === 'OWNER') return true

  const perms = await loadPermissions()
  const key = `${profile.role}:${resource}:${action}`
  return perms.get(key) ?? false
}

export async function checkPermission(resource: PermissionResource, action: PermissionAction): Promise<void> {
  const allowed = await hasPermission(resource, action)
  if (!allowed) {
    throw new Error(`Permission denied: ${resource}:${action}`)
  }
}

export function hasPermissionSync(role: UserRole, resource: PermissionResource, action: PermissionAction): boolean {
  if (role === 'OWNER') return true
  if (!permissionsCache) return false
  return permissionsCache.get(`${role}:${resource}:${action}`) ?? false
}

// ============================================================
// Quota checks
// ============================================================

export async function checkLiasseQuota(): Promise<{ allowed: boolean; used: number; quota: number }> {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('liasses_used, liasses_quota, plan')
    .limit(1)
    .single()

  if (!tenant) return { allowed: false, used: 0, quota: 0 }
  if (tenant.plan === 'ENTERPRISE') return { allowed: true, used: tenant.liasses_used, quota: 999999 }

  return {
    allowed: tenant.liasses_used < tenant.liasses_quota,
    used: tenant.liasses_used,
    quota: tenant.liasses_quota,
  }
}

export async function incrementLiasseCount(): Promise<void> {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, liasses_used')
    .limit(1)
    .single()
  if (!tenant) return

  await supabase
    .from('tenants')
    .update({ liasses_used: tenant.liasses_used + 1 })
    .eq('id', tenant.id)
}

// ============================================================
// Auth state listener
// ============================================================

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      clearPermissionsCache()
    }
    callback(event, session)
  })
}
