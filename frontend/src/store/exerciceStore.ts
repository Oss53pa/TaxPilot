/**
 * Store Zustand pour l'exercice fiscal actif
 * Gere le switching d'exercice et met a jour les balances latest/latest_n1
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ExerciceRecord } from '../services/exerciceStorageService'
import { getAllExercices, getOrCreateExercice } from '../services/exerciceStorageService'

interface ExerciceState {
  activeExercice: ExerciceRecord | null
  exercices: ExerciceRecord[]

  // Actions
  loadExercices: () => void
  setActiveExercice: (annee: string) => void
  createExercice: (annee: string) => ExerciceRecord
  refreshExercices: () => void
}

/**
 * Met a jour fiscasync_balance_latest et latest_n1 pour pointer
 * sur les balances de l'exercice choisi
 */
function switchBalancePointers(annee: string): void {
  const PREFIX = 'fiscasync_balance_'
  try {
    const raw = localStorage.getItem(PREFIX + 'list')
    if (!raw) return
    const list = JSON.parse(raw) as Array<{ exercice: string; version?: number }>

    // Balance N = la plus recente pour l'annee choisie
    const balancesN = list
      .filter(b => b.exercice === annee)
      .sort((a, b) => (b.version || 1) - (a.version || 1))

    if (balancesN.length > 0) {
      localStorage.setItem(PREFIX + 'latest', JSON.stringify(balancesN[0]))
    }

    // Balance N-1 = la plus recente pour l'annee precedente
    const anneeN1 = String(parseInt(annee) - 1)
    const balancesN1 = list
      .filter(b => b.exercice === anneeN1)
      .sort((a, b) => (b.version || 1) - (a.version || 1))

    if (balancesN1.length > 0) {
      localStorage.setItem(PREFIX + 'latest_n1', JSON.stringify(balancesN1[0]))
    } else {
      localStorage.removeItem(PREFIX + 'latest_n1')
    }
  } catch {
    // ignore
  }
}

export const useExerciceStore = create<ExerciceState>()(
  persist(
    (set, get) => ({
      activeExercice: null,
      exercices: [],

      loadExercices: () => {
        const exercices = getAllExercices()
        set({ exercices })

        // Si pas d'exercice actif mais des exercices existent, activer le plus recent
        if (!get().activeExercice && exercices.length > 0) {
          const latest = exercices[0] // deja trie par annee desc
          set({ activeExercice: latest })
          switchBalancePointers(latest.annee)
        }
      },

      setActiveExercice: (annee: string) => {
        const exercice = getOrCreateExercice(annee)
        set({ activeExercice: exercice })

        // Mettre a jour les pointeurs de balance
        switchBalancePointers(annee)

        // Rafraichir la liste
        set({ exercices: getAllExercices() })

        // Notifier l'app du changement
        window.dispatchEvent(new CustomEvent('fiscasync:exercice-changed', {
          detail: { annee, exercice },
        }))
      },

      createExercice: (annee: string) => {
        const exercice = getOrCreateExercice(annee)
        set({
          activeExercice: exercice,
          exercices: getAllExercices(),
        })
        switchBalancePointers(annee)
        window.dispatchEvent(new CustomEvent('fiscasync:exercice-changed', {
          detail: { annee, exercice },
        }))
        return exercice
      },

      refreshExercices: () => {
        set({ exercices: getAllExercices() })
      },
    }),
    {
      name: 'fiscasync-exercice',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeExercice: state.activeExercice,
      }),
    }
  )
)
