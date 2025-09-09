/**
 * Store Zustand pour l'authentification
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService, type User } from '../services/authService'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Utiliser le service d'authentification
          const response = await authService.login({ username, password })
          
          if (response.success && response.data.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error(response.message || 'Échec de l\'authentification')
          }
        } catch (error: any) {
          set({
            error: error.message || 'Erreur de connexion',
            isLoading: false,
            isAuthenticated: false,
          })
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        })
      },

      setUser: (user: User) => {
        set({ user })
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

      checkAuth: () => {
        const isAuth = authService.isAuthenticated()
        const user = authService.getCurrentUser()
        
        set({
          isAuthenticated: isAuth,
          user: user,
        })
      },
    }),
    {
      name: 'fiscasync-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)