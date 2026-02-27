/**
 * Store Zustand pour la gestion de l'organisation (SaaS Multi-Tenant)
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Organization } from '@/services/apiClient'

interface OrganizationState {
  organization: Organization | null
  isLoading: boolean
  error: string | null

  // Actions
  setOrganization: (organization: Organization) => void
  clearOrganization: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // Quota helpers
  canCreateLiasse: () => boolean
  getQuotaRemaining: () => number | 'unlimited'
  getQuotaPercentage: () => number
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organization: null,
      isLoading: false,
      error: null,

      setOrganization: (organization: Organization) => {
        set({ organization, error: null })
      },

      clearOrganization: () => {
        set({ organization: null, error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      // Vérifier si on peut créer une liasse
      canCreateLiasse: () => {
        const { organization } = get()
        if (!organization) return false

        // Plan ENTERPRISE = illimité
        if (organization.subscription_plan === 'ENTERPRISE') {
          return true
        }

        // Vérifier le quota
        return organization.liasses_used < organization.liasses_quota
      },

      // Obtenir le quota restant
      getQuotaRemaining: () => {
        const { organization } = get()
        if (!organization) return 0

        // Plan ENTERPRISE = illimité
        if (organization.subscription_plan === 'ENTERPRISE') {
          return 'unlimited'
        }

        return Math.max(0, organization.liasses_quota - organization.liasses_used)
      },

      // Obtenir le pourcentage du quota utilisé
      getQuotaPercentage: () => {
        const { organization } = get()
        if (!organization) return 0

        // Plan ENTERPRISE = 0% (illimité)
        if (organization.subscription_plan === 'ENTERPRISE') {
          return 0
        }

        if (organization.liasses_quota === 0) return 0

        return Math.round((organization.liasses_used / organization.liasses_quota) * 100)
      },
    }),
    {
      name: 'fiscasync-organization',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        organization: state.organization,
      }),
    }
  )
)
