/**
 * Tests unitaires pour le store d'authentification Zustand (Supabase Auth)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAuthStore } from '../authStore'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
  isSupabaseEnabled: true,
}))

// Mock organizationStore
vi.mock('../organizationStore', () => ({
  useOrganizationStore: {
    getState: () => ({
      clearOrganization: vi.fn(),
    }),
  },
}))

describe('AuthStore', () => {
  beforeEach(async () => {
    // Reset the store state
    const store = useAuthStore.getState()
    await act(async () => {
      await store.logout()
    })
    // Reset initialized so initialize() can run again
    useAuthStore.setState({ initialized: false, isLoading: true })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initialise avec l\'etat par defaut', () => {
    const { result } = renderHook(() => useAuthStore())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('gere les erreurs de login', async () => {
    const { supabase } = await import('@/lib/supabase')
    vi.mocked(supabase!.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 } as any,
    })

    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      try {
        await result.current.login('wrong@example.com', 'wrongpass')
      } catch {
        // Expected
      }
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe('Invalid login credentials')
  })

  it('gere le logout', async () => {
    const { supabase } = await import('@/lib/supabase')
    vi.mocked(supabase!.auth.signOut).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('gere les erreurs manuelles', () => {
    const { result } = renderHook(() => useAuthStore())

    const errorMessage = 'Erreur personnalisee'

    act(() => {
      result.current.setError(errorMessage)
    })

    expect(result.current.error).toBe(errorMessage)

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })
})
