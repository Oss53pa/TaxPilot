/**
 * Store Zustand pour les taux fiscaux paramétrables
 * Les overrides utilisateur sont persistés dans localStorage
 * La fonction getTauxFiscaux() merge defaults + overrides
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TAUX_FISCAUX_CI } from '@/config/taux-fiscaux-ci'

// Type aplati pour les overrides : "section.clé" → valeur
// Seuls les taux simples (number) sont éditables, pas les tableaux de tranches
type TauxPath = string // ex: "IS.taux_normal", "TVA.taux_normal", "IMF.minimum"

interface TauxFiscauxState {
  overrides: Record<TauxPath, number>
  setTaux: (path: TauxPath, value: number) => void
  resetToDefaults: () => void
  resetSection: (section: string) => void
}

export const useTauxFiscauxStore = create<TauxFiscauxState>()(
  persist(
    (set) => ({
      overrides: {},

      setTaux: (path, value) =>
        set((state) => ({
          overrides: { ...state.overrides, [path]: value },
        })),

      resetToDefaults: () => set({ overrides: {} }),

      resetSection: (section) =>
        set((state) => {
          const newOverrides = { ...state.overrides }
          for (const key of Object.keys(newOverrides)) {
            if (key.startsWith(`${section}.`)) {
              delete newOverrides[key]
            }
          }
          return { overrides: newOverrides }
        }),
    }),
    {
      name: 'fiscasync_taux_fiscaux',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

/**
 * Retourne l'objet TAUX_FISCAUX_CI avec les overrides utilisateur appliqués.
 * Fonction non-hook, utilisable dans les services et helpers.
 */
export function getTauxFiscaux(): typeof TAUX_FISCAUX_CI {
  const { overrides } = useTauxFiscauxStore.getState()

  if (Object.keys(overrides).length === 0) {
    return TAUX_FISCAUX_CI
  }

  // Deep clone mutable des defaults
  const merged = JSON.parse(JSON.stringify(TAUX_FISCAUX_CI))

  for (const [path, value] of Object.entries(overrides)) {
    const parts = path.split('.')
    let target: any = merged
    for (let i = 0; i < parts.length - 1; i++) {
      if (target[parts[i]] !== undefined) {
        target = target[parts[i]]
      }
    }
    const lastKey = parts[parts.length - 1]
    if (target && lastKey in target && typeof target[lastKey] === 'number') {
      target[lastKey] = value
    }
  }

  return merged
}
