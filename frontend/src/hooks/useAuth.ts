import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const store = useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(async (email: string, password: string) => {
    await store.login(email, password)
    navigate('/')
  }, [store, navigate])

  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    await store.signup(email, password, firstName, lastName)
  }, [store])

  const logout = useCallback(async () => {
    await store.logout()
    navigate('/login')
  }, [store, navigate])

  const resetPassword = useCallback(async (email: string) => {
    await store.resetPassword(email)
  }, [store])

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    initialized: store.initialized,
    login,
    signup,
    logout,
    resetPassword,
    clearError: store.clearError,
  }
}
