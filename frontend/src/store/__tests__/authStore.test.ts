/**
 * Tests unitaires pour le store d'authentification Zustand
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAuthStore } from '../authStore'
import { authService } from '@/services/authService'

// Mock du service d'authentification
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
  }
}))

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset du store avant chaque test
    useAuthStore.getState().logout()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initialise avec l\'état par défaut', () => {
    const { result } = renderHook(() => useAuthStore())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('gère le login avec succès', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_staff: false,
      is_superuser: false
    }

    const mockResponse = {
      success: true,
      message: 'Login successful',
      data: {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: mockUser
      }
    }

    vi.mocked(authService.login).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.login('testuser', 'password')
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser', 
      password: 'password'
    })
  })

  it('gère les erreurs de login', async () => {
    const errorMessage = 'Identifiants incorrects'
    
    vi.mocked(authService.login).mockRejectedValue(
      new Error(errorMessage)
    )

    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      try {
        await result.current.login('wronguser', 'wrongpass')
      } catch (error) {
        // Erreur attendue
      }
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
  })

  it('gère le logout', () => {
    const { result } = renderHook(() => useAuthStore())

    // Simuler un utilisateur connecté
    act(() => {
      result.current.setUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_staff: false,
        is_superuser: false
      })
    })

    expect(result.current.isAuthenticated).toBe(false) // Doit être false car setUser ne change pas isAuthenticated

    // Logout
    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBeNull()
    expect(authService.logout).toHaveBeenCalled()
  })

  it('vérifie l\'authentification existante', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_staff: false,
      is_superuser: false
    }

    vi.mocked(authService.isAuthenticated).mockReturnValue(true)
    vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser)

    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.checkAuth()
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('gère les états de loading', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.isLoading).toBe(true)

    act(() => {
      result.current.setLoading(false)
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('gère les erreurs manuelles', () => {
    const { result } = renderHook(() => useAuthStore())

    const errorMessage = 'Erreur personnalisée'

    act(() => {
      result.current.setError(errorMessage)
    })

    expect(result.current.error).toBe(errorMessage)

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('persiste l\'état dans localStorage', () => {
    const mockUser = {
      id: 1,
      username: 'testuser', 
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_staff: false,
      is_superuser: false
    }

    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setUser(mockUser)
    })

    // Vérifier que localStorage contient les données
    const stored = localStorage.getItem('fiscasync-auth')
    expect(stored).toBeTruthy()
    
    if (stored) {
      const parsed = JSON.parse(stored)
      expect(parsed.state.user).toEqual(mockUser)
    }
  })
})