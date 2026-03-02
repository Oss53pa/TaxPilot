/**
 * Tenant Store — Zustand store for multi-tenant context
 * Tracks the active tenant, entity, and exercice across the app.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Tenant, TenantEntity, Exercice, Profile, UserRole } from '@/types/cloud'

interface TenantState {
  // Current context
  tenant: Tenant | null
  profile: Profile | null
  activeEntity: TenantEntity | null
  activeExercice: Exercice | null
  entities: TenantEntity[]
  exercices: Exercice[]

  // Cloud mode
  isCloudMode: boolean

  // Actions
  setTenant: (tenant: Tenant | null) => void
  setProfile: (profile: Profile | null) => void
  setActiveEntity: (entity: TenantEntity | null) => void
  setActiveExercice: (exercice: Exercice | null) => void
  setEntities: (entities: TenantEntity[]) => void
  setExercices: (exercices: Exercice[]) => void
  setCloudMode: (enabled: boolean) => void
  reset: () => void

  // Helpers
  getRole: () => UserRole
  getTenantId: () => string | null
  getEntityId: () => string | null
  getExerciceId: () => string | null
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      tenant: null,
      profile: null,
      activeEntity: null,
      activeExercice: null,
      entities: [],
      exercices: [],
      isCloudMode: false,

      setTenant: (tenant) => set({ tenant }),
      setProfile: (profile) => set({ profile }),
      setActiveEntity: (entity) => {
        set({ activeEntity: entity })
        // Dispatch event so other components can react
        window.dispatchEvent(new CustomEvent('fiscasync:entity-changed', { detail: entity }))
      },
      setActiveExercice: (exercice) => {
        set({ activeExercice: exercice })
        window.dispatchEvent(new CustomEvent('fiscasync:exercice-changed', { detail: exercice }))
      },
      setEntities: (entities) => set({ entities }),
      setExercices: (exercices) => set({ exercices }),
      setCloudMode: (enabled) => set({ isCloudMode: enabled }),

      reset: () => set({
        tenant: null,
        profile: null,
        activeEntity: null,
        activeExercice: null,
        entities: [],
        exercices: [],
        isCloudMode: false,
      }),

      getRole: () => get().profile?.role ?? 'VIEWER',
      getTenantId: () => get().tenant?.id ?? null,
      getEntityId: () => get().activeEntity?.id ?? null,
      getExerciceId: () => get().activeExercice?.id ?? null,
    }),
    {
      name: 'fiscasync-tenant',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeEntity: state.activeEntity,
        activeExercice: state.activeExercice,
        isCloudMode: state.isCloudMode,
      }),
    }
  )
)
