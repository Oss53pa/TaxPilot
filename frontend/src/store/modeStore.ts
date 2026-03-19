/**
 * modeStore.ts — P1-1: User mode management (Entreprise vs Cabinet)
 * Persisted in localStorage, will migrate to Supabase in P2.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserMode = 'entreprise' | 'cabinet'

interface ModeState {
  /** null = first launch, mode not yet selected */
  userMode: UserMode | null
  /** Whether the onboarding wizard has been completed */
  onboardingCompleted: boolean
  /** Cabinet name (cabinet mode only) */
  nomCabinet: string
  /** OEC number (cabinet mode only) */
  numeroOEC: string
  /** Responsible person (cabinet mode only) */
  responsable: string

  // Actions
  setUserMode: (mode: UserMode) => void
  completeOnboarding: () => void
  setCabinetInfo: (info: { nomCabinet: string; numeroOEC: string; responsable: string }) => void
  reset: () => void
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      userMode: null,
      onboardingCompleted: false,
      nomCabinet: '',
      numeroOEC: '',
      responsable: '',

      setUserMode: (mode) => set({ userMode: mode }),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      setCabinetInfo: (info) => set(info),
      reset: () => set({ userMode: null, onboardingCompleted: false, nomCabinet: '', numeroOEC: '', responsable: '' }),
    }),
    { name: 'fiscasync-mode' }
  )
)
