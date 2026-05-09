/**
 * Store Zustand pour l'authentification — Supabase Auth
 */
import { create } from 'zustand'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { useOrganizationStore } from './organizationStore'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

export interface AppUser {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: 'entreprise' | 'cabinet'
  avatarUrl?: string
}

interface AuthState {
  user: AppUser | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  initialized: boolean

  // Actions
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setError: (error: string | null) => void
  clearError: () => void
}

function mapSupabaseUser(user: SupabaseUser): AppUser {
  const meta = user.user_metadata || {}
  // Source de vérité: meta.account_type (aligné sur profiles.account_type Supabase,
  // posé par l'edge function atlas-sso à chaque SSO depuis Atlas Studio).
  // Fallback meta.user_type pour rétrocompat avec d'anciens tokens.
  const accountType = meta.account_type || meta.user_type
  const userType: 'entreprise' | 'cabinet' =
    accountType === 'cabinet' || accountType === 'entreprise' ? accountType : 'entreprise'
  return {
    id: user.id,
    email: user.email || '',
    firstName: meta.first_name || '',
    lastName: meta.last_name || '',
    userType,
    avatarUrl: meta.avatar_url,
  }
}

/**
 * Fallback: pour un user existant en BDD mais dont user_metadata ne contient pas
 * account_type (ex: profil créé avant le déploiement de l'edge function corrigée),
 * on lit profiles.account_type directement et on enrichit l'AppUser.
 */
async function hydrateAccountTypeFromProfile(
  baseUser: AppUser,
  client: NonNullable<typeof supabase>
): Promise<AppUser> {
  try {
    const { data, error } = await client
      .from('profiles')
      .select('account_type')
      .eq('id', baseUser.id)
      .maybeSingle()
    if (error || !data?.account_type) return baseUser
    if (data.account_type === 'cabinet' || data.account_type === 'entreprise') {
      return { ...baseUser, userType: data.account_type }
    }
  } catch {
    // Silencieux: on garde le fallback 'entreprise' du mapper
  }
  return baseUser
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return

    if (!isSupabaseEnabled || !supabase) {
      set({ isLoading: false, initialized: true, isAuthenticated: false })
      return
    }

    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      if (session?.user) {
        const baseUser = mapSupabaseUser(session.user)
        set({
          user: baseUser,
          session,
          isAuthenticated: true,
          isLoading: false,
          initialized: true,
        })
        // Enrichissement async depuis profiles.account_type si user_metadata ne le porte pas
        if (!session.user.user_metadata?.account_type && supabase) {
          hydrateAccountTypeFromProfile(baseUser, supabase).then((enriched) => {
            if (enriched.userType !== baseUser.userType) set({ user: enriched })
          })
        }
      } else {
        set({ isLoading: false, initialized: true, isAuthenticated: false })
      }

      // Listen for auth state changes (token refresh, sign out from other tab, etc.)
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const baseUser = mapSupabaseUser(session.user)
          set({
            user: baseUser,
            session,
            isAuthenticated: true,
          })
          if (!session.user.user_metadata?.account_type && supabase) {
            hydrateAccountTypeFromProfile(baseUser, supabase).then((enriched) => {
              if (enriched.userType !== baseUser.userType) set({ user: enriched })
            })
          }
        } else {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          })
          useOrganizationStore.getState().clearOrganization()
        }
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erreur d\'initialisation',
        isLoading: false,
        initialized: true,
        isAuthenticated: false,
      })
    }
  },

  login: async (email: string, password: string) => {
    if (!isSupabaseEnabled || !supabase) {
      set({ error: 'Supabase non configuré' })
      throw new Error('Supabase non configuré')
    }

    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
      if (!data.user) throw new Error('Connexion échouée')

      set({
        user: mapSupabaseUser(data.user),
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur de connexion'
      set({ error: msg, isLoading: false, isAuthenticated: false })
      throw error
    }
  },

  signup: async (email: string, password: string, firstName: string, lastName: string) => {
    if (!isSupabaseEnabled || !supabase) {
      set({ error: 'Supabase non configuré' })
      throw new Error('Supabase non configuré')
    }

    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      })
      if (error) throw new Error(error.message)
      if (!data.user) throw new Error('Inscription échouée')

      // If email confirmation is required, user won't have a session yet
      if (data.session) {
        set({
          user: mapSupabaseUser(data.user),
          session: data.session,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        // Email confirmation required
        set({ isLoading: false })
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
      set({ error: msg, isLoading: false, isAuthenticated: false })
      throw error
    }
  },

  logout: async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      error: null,
    })
    useOrganizationStore.getState().clearOrganization()
    // Clear any localStorage remnants
    localStorage.removeItem('fiscasync-auth')
    localStorage.removeItem('fiscasync-organization')
  },

  resetPassword: async (email: string) => {
    if (!isSupabaseEnabled || !supabase) {
      throw new Error('Supabase non configuré')
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    if (error) throw new Error(error.message)
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}))
