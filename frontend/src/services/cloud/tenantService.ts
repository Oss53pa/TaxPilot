/**
 * Tenant Service — Multi-tenant CRUD via Supabase
 * All queries automatically filtered by RLS (tenant_id from JWT)
 */

import { supabase } from '@/config/supabase'
import type { Tenant, TenantEntity, Profile, Exercice, UserRole, TenantPlan } from '@/types/cloud'

// ============================================================
// TENANT (Cabinet)
// ============================================================

export async function getCurrentTenant(): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .limit(1)
    .single()
  if (error) return null
  return data
}

export async function updateTenant(id: string, changes: Partial<Tenant>): Promise<Tenant> {
  const { data, error } = await supabase
    .from('tenants')
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function upgradePlan(tenantId: string, plan: TenantPlan): Promise<Tenant> {
  const quotas: Record<TenantPlan, { liasses_quota: number; users_quota: number; storage_quota_mb: number }> = {
    STARTER: { liasses_quota: 2, users_quota: 1, storage_quota_mb: 1024 },
    BUSINESS: { liasses_quota: 12, users_quota: 5, storage_quota_mb: 10240 },
    ENTERPRISE: { liasses_quota: 999999, users_quota: 999999, storage_quota_mb: 999999 },
  }
  return updateTenant(tenantId, { plan, ...quotas[plan] })
}

// ============================================================
// PROFILES (Users within tenant)
// ============================================================

export async function getMyProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error) return null
  return data
}

export async function getTenantMembers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at')
  if (error) throw error
  return data ?? []
}

export async function updateMemberRole(profileId: string, role: UserRole): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', profileId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function linkProfileToTenant(profileId: string, tenantId: string, role: UserRole = 'COMPTABLE'): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ tenant_id: tenantId, role })
    .eq('id', profileId)
  if (error) throw error
}

// ============================================================
// ENTITIES (Entreprises gérées par le cabinet)
// ============================================================

export async function getEntities(): Promise<TenantEntity[]> {
  const { data, error } = await supabase
    .from('tenant_entities')
    .select('*')
    .eq('is_active', true)
    .order('raison_sociale')
  if (error) throw error
  return data ?? []
}

export async function getEntity(id: string): Promise<TenantEntity | null> {
  const { data, error } = await supabase
    .from('tenant_entities')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createEntity(entity: Omit<TenantEntity, 'id' | 'created_at' | 'updated_at'>): Promise<TenantEntity> {
  const { data, error } = await supabase
    .from('tenant_entities')
    .insert(entity)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEntity(id: string, changes: Partial<TenantEntity>): Promise<TenantEntity> {
  const { data, error } = await supabase
    .from('tenant_entities')
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEntity(id: string): Promise<void> {
  const { error } = await supabase
    .from('tenant_entities')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}

// ============================================================
// EXERCICES
// ============================================================

export async function getExercices(entityId: string): Promise<Exercice[]> {
  const { data, error } = await supabase
    .from('exercices')
    .select('*')
    .eq('entity_id', entityId)
    .order('date_debut', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getCurrentExercice(entityId: string): Promise<Exercice | null> {
  const { data } = await supabase
    .from('exercices')
    .select('*')
    .eq('entity_id', entityId)
    .eq('is_current', true)
    .single()
  return data
}

export async function createExercice(exercice: Omit<Exercice, 'id' | 'created_at' | 'updated_at'>): Promise<Exercice> {
  // Unset other current exercices for this entity
  if (exercice.is_current) {
    await supabase
      .from('exercices')
      .update({ is_current: false })
      .eq('entity_id', exercice.entity_id)
      .eq('is_current', true)
  }
  const { data, error } = await supabase
    .from('exercices')
    .insert(exercice)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function closeExercice(id: string): Promise<Exercice> {
  const { data, error } = await supabase
    .from('exercices')
    .update({ statut: 'cloture', is_current: false })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// INVITATIONS
// ============================================================

export async function sendInvitation(email: string, role: UserRole): Promise<void> {
  const profile = await getMyProfile()
  if (!profile?.tenant_id) throw new Error('No tenant context')

  const { error } = await supabase
    .from('invitations')
    .insert({
      tenant_id: profile.tenant_id,
      email,
      role,
      invited_by: profile.id,
    })
  if (error) throw error
}

export async function getInvitations(): Promise<Array<{ id: string; email: string; role: string; status: string; created_at: string }>> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function cancelInvitation(id: string): Promise<void> {
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'CANCELLED' })
    .eq('id', id)
  if (error) throw error
}

export async function acceptInvitation(token: string): Promise<void> {
  // Find invitation by token
  const { data: invite, error: findErr } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'PENDING')
    .single()
  if (findErr || !invite) throw new Error('Invalid or expired invitation')

  // Check expiry
  if (new Date(invite.expires_at) < new Date()) {
    await supabase.from('invitations').update({ status: 'EXPIRED' }).eq('id', invite.id)
    throw new Error('Invitation expired')
  }

  // Link current user to the tenant
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await linkProfileToTenant(user.id, invite.tenant_id, invite.role)

  // Mark invitation as accepted
  await supabase.from('invitations').update({ status: 'ACCEPTED' }).eq('id', invite.id)
}
