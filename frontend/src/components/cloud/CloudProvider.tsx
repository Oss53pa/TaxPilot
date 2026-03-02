/**
 * CloudProvider — Initializes Supabase auth and tenant context
 * Wraps the app to provide cloud state management.
 *
 * When Supabase is configured:
 *   - Listens to auth state changes
 *   - Loads tenant, profile, entities, exercices
 *   - Shows migration prompt if localStorage data exists
 *
 * When Supabase is NOT configured:
 *   - Falls through to localStorage mode (existing behavior)
 */

import React, { useEffect, useState } from 'react'
import { supabase } from '@/config/supabase'
import { isSupabaseEnabled } from '@/types/cloud'
import { useTenantStore } from '@/store/tenantStore'
import { useAuthStore } from '@/store/authStore'
import * as cloud from '@/services/cloud'
import MigrationBanner from './MigrationBanner'

const CloudProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [migrationNeeded, setMigrationNeeded] = useState(false)
  const { setTenant, setProfile, setEntities, setExercices, setActiveEntity, setActiveExercice, setCloudMode } = useTenantStore()
  const { setUser } = useAuthStore()

  useEffect(() => {
    if (!isSupabaseEnabled()) {
      setCloudMode(false)
      return
    }

    setCloudMode(true)

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadCloudContext()
      } else if (event === 'SIGNED_OUT') {
        setTenant(null)
        setProfile(null)
        setEntities([])
        setExercices([])
        setActiveEntity(null)
        setActiveExercice(null)
      }
    })

    // Check existing session
    loadCloudContext()

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCloudContext() {
    try {
      const session = await cloud.getSession()
      if (!session) return

      // Load profile
      const profile = await cloud.getProfile()
      if (!profile) return
      setProfile(profile)

      // Sync with legacy authStore
      if (profile.email) {
        setUser({
          id: parseInt(profile.id.substring(0, 8), 16) || 1,
          username: profile.full_name || profile.email.split('@')[0],
          email: profile.email,
          first_name: (profile.full_name || '').split(' ')[0] || '',
          last_name: (profile.full_name || '').split(' ').slice(1).join(' ') || '',
          is_staff: profile.role === 'OWNER' || profile.role === 'ADMIN',
          is_superuser: profile.role === 'OWNER',
        })
      }

      // Load tenant
      if (profile.tenant_id) {
        const tenant = await cloud.getCurrentTenant()
        if (tenant) setTenant(tenant)

        // Load entities
        const entities = await cloud.getEntities()
        setEntities(entities)

        // Auto-select first entity if none active
        const currentEntity = useTenantStore.getState().activeEntity
        const entity = entities.find(e => e.id === currentEntity?.id) || entities[0] || null
        if (entity) {
          setActiveEntity(entity)

          // Load exercices for this entity
          const exercices = await cloud.getExercices(entity.id)
          setExercices(exercices)

          // Auto-select current exercice
          const current = exercices.find(e => e.is_current) || exercices[0] || null
          if (current) setActiveExercice(current)
        }

        // Check if localStorage migration is needed
        if (cloud.hasLocalStorageData() && !cloud.getMigrationStatus()) {
          setMigrationNeeded(true)
        }
      }
    } catch (err) {
      console.error('CloudProvider: failed to load context', err)
    }
  }

  return (
    <>
      {migrationNeeded && (
        <MigrationBanner
          onDismiss={() => setMigrationNeeded(false)}
          onMigrate={async () => {
            const tenantId = useTenantStore.getState().tenant?.id
            if (tenantId) {
              await cloud.runMigration(tenantId)
              setMigrationNeeded(false)
              // Reload context after migration
              await loadCloudContext()
            }
          }}
        />
      )}
      {children}
    </>
  )
}

export default CloudProvider
