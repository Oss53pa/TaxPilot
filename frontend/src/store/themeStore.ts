import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  resolvedMode: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
}

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light' as ThemeMode,
      resolvedMode: 'light' as 'light' | 'dark',

      setMode: (mode: ThemeMode) => {
        const resolved = mode === 'system' ? getSystemPreference() : mode
        set({ mode, resolvedMode: resolved })
      },
    }),
    {
      name: 'fiscasync-theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.resolvedMode = state.mode === 'system' ? getSystemPreference() : state.mode
        }
      },
    }
  )
)
