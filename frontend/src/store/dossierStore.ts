/**
 * dossierStore.ts — P1-4: Multi-dossier management for Cabinet mode
 * Each dossier = one client entity for one fiscal year.
 * Persisted in localStorage, will migrate to Supabase in P2.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Dossier {
  id: string
  nomClient: string
  rccm: string
  ncc: string
  exerciceN: number
  exerciceN1: number
  regime: 'normal' | 'simplifie' | 'forfaitaire'
  statut: 'en_cours' | 'validee' | 'exportee'
  dateCreation: string
  dateDerniereModification: string
  /** Serialized balance data key in localStorage */
  balanceKey: string
  balanceN1Key: string
}

interface DossierState {
  dossiers: Dossier[]
  /** ID of the currently active dossier (null = no dossier selected) */
  activeDossierId: string | null

  // Computed
  getActiveDossier: () => Dossier | null

  // Actions
  addDossier: (dossier: Omit<Dossier, 'id' | 'dateCreation' | 'dateDerniereModification' | 'statut' | 'balanceKey' | 'balanceN1Key'>) => string
  updateDossier: (id: string, updates: Partial<Dossier>) => void
  deleteDossier: (id: string) => void
  setActiveDossier: (id: string | null) => void
  duplicateDossier: (id: string, newExerciceN: number) => string
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export const useDossierStore = create<DossierState>()(
  persist(
    (set, get) => ({
      dossiers: [],
      activeDossierId: null,

      getActiveDossier: () => {
        const { dossiers, activeDossierId } = get()
        return dossiers.find(d => d.id === activeDossierId) || null
      },

      addDossier: (data) => {
        const id = generateId()
        const now = new Date().toISOString()
        const dossier: Dossier = {
          ...data,
          id,
          statut: 'en_cours',
          dateCreation: now,
          dateDerniereModification: now,
          balanceKey: `fiscasync_balance_${id}`,
          balanceN1Key: `fiscasync_balance_n1_${id}`,
        }
        set(state => ({ dossiers: [...state.dossiers, dossier] }))
        return id
      },

      updateDossier: (id, updates) => {
        set(state => ({
          dossiers: state.dossiers.map(d =>
            d.id === id ? { ...d, ...updates, dateDerniereModification: new Date().toISOString() } : d
          ),
        }))
      },

      deleteDossier: (id) => {
        // Clean up localStorage balance data for this dossier
        const dossier = get().dossiers.find(d => d.id === id)
        if (dossier) {
          localStorage.removeItem(dossier.balanceKey)
          localStorage.removeItem(dossier.balanceN1Key)
        }
        set(state => ({
          dossiers: state.dossiers.filter(d => d.id !== id),
          activeDossierId: state.activeDossierId === id ? null : state.activeDossierId,
        }))
      },

      setActiveDossier: (id) => set({ activeDossierId: id }),

      duplicateDossier: (id, newExerciceN) => {
        const source = get().dossiers.find(d => d.id === id)
        if (!source) return ''
        const newId = generateId()
        const now = new Date().toISOString()
        const duplicate: Dossier = {
          ...source,
          id: newId,
          exerciceN: newExerciceN,
          exerciceN1: newExerciceN - 1,
          statut: 'en_cours',
          dateCreation: now,
          dateDerniereModification: now,
          balanceKey: `fiscasync_balance_${newId}`,
          balanceN1Key: `fiscasync_balance_n1_${newId}`,
        }
        set(state => ({ dossiers: [...state.dossiers, duplicate] }))
        return newId
      },
    }),
    { name: 'fiscasync-dossiers' }
  )
)
