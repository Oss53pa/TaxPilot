/**
 * Store Zustand pour les taux fiscaux paramétrables
 * Les overrides utilisateur sont persistés dans localStorage
 * La fonction getTauxFiscaux() merge defaults + overrides
 *
 * Multi-pays : le pays actif détermine les taux de base (defaults).
 * Les overrides s'appliquent par-dessus les taux du pays actif.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TAUX_FISCAUX_CI } from '@/config/taux-fiscaux-ci'
import { getPaysConfig, type PaysOHADA } from '@/config/pays-ohada'

// Type aplati pour les overrides : "section.clé" → valeur
// Seuls les taux simples (number) sont éditables, pas les tableaux de tranches
type TauxPath = string // ex: "IS.taux_normal", "TVA.taux_normal", "IMF.minimum"

interface TauxFiscauxState {
  activePays: string  // ISO code, default 'CI'
  overrides: Record<TauxPath, number>
  setActivePays: (code: string) => void
  setTaux: (path: TauxPath, value: number) => void
  resetToDefaults: () => void
  resetSection: (section: string) => void
}

export const useTauxFiscauxStore = create<TauxFiscauxState>()(
  persist(
    (set) => ({
      activePays: 'CI',
      overrides: {},

      setActivePays: (code) => set({ activePays: code, overrides: {} }),

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
 * Build a TAUX_FISCAUX_CI-shaped object from any OHADA country config.
 * Maps the pays-ohada structure to the legacy CI structure for backward compat.
 */
function buildTauxFromPays(pays: PaysOHADA): typeof TAUX_FISCAUX_CI {
  // Start with CI defaults (full structure including salary brackets, CNPS, etc.)
  const base = JSON.parse(JSON.stringify(TAUX_FISCAUX_CI))

  // Override the main rates with the active country's rates
  base.IS.taux_normal = pays.fiscalite.IS.taux_normal
  if (pays.fiscalite.IS.taux_pme !== undefined) {
    base.IS.taux_pme = pays.fiscalite.IS.taux_pme
  }
  base.TVA.taux_normal = pays.fiscalite.TVA.taux_normal
  if (pays.fiscalite.TVA.taux_reduit !== undefined) {
    base.TVA.taux_reduit = pays.fiscalite.TVA.taux_reduit
  }
  base.IMF.taux = pays.fiscalite.IMF.taux
  base.IMF.minimum = pays.fiscalite.IMF.minimum
  base.IMF.maximum = pays.fiscalite.IMF.maximum
  base.RETENUES.airsi = pays.fiscalite.retenue_source.taux_prestation
  base.RETENUES.irc_resident = pays.fiscalite.retenue_source.taux_loyer
  base.RETENUES.ircm = pays.fiscalite.retenue_source.taux_dividende

  return base
}

/**
 * Retourne l'objet TAUX_FISCAUX avec les taux du pays actif + overrides utilisateur.
 * Fonction non-hook, utilisable dans les services et helpers.
 */
export function getTauxFiscaux(): typeof TAUX_FISCAUX_CI {
  const { activePays, overrides } = useTauxFiscauxStore.getState()

  // Build base rates from active country
  const pays = getPaysConfig(activePays)
  const base = buildTauxFromPays(pays)

  if (Object.keys(overrides).length === 0) {
    return base
  }

  // Apply user overrides
  for (const [path, value] of Object.entries(overrides)) {
    const parts = path.split('.')
    let target: any = base
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

  return base
}

/**
 * Get the active country code
 */
export function getActivePays(): string {
  return useTauxFiscauxStore.getState().activePays
}
