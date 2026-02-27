/**
 * Service d'authentification pour FiscaSync-Lite
 * Version locale - toutes les donnees dans localStorage
 */

import { apiClient, type AuthResponse, type User, type LoginCredentials, type SignupData, type SignupResponse } from './apiClient'

// Exports des types depuis apiClient pour compatibilité
export type { User, LoginCredentials, AuthResponse, SignupData, SignupResponse }

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Logging in locally...', credentials.username)
      const response = await apiClient.login(credentials)
      console.log('✅ Login successful:', response.success)
      return response
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    }
  }

  async signup(signupData: SignupData): Promise<SignupResponse> {
    try {
      console.log('📝 Signing up new organization...', signupData.name)
      const response = await apiClient.signup(signupData)
      console.log('✅ Signup successful:', response.organization.name)
      return response
    } catch (error) {
      console.error('❌ Signup failed:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    apiClient.logout()
    console.log('✅ Logout successful')
  }

  async refreshToken(): Promise<string | null> {
    return apiClient.getAccessToken()
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated()
  }

  getCurrentUser(): User | null {
    return apiClient.getCurrentUser()
  }

  hasPermission(_permission: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false
    if (user.is_superuser) return true
    return false
  }

  canAccessEntreprise(_entrepriseId: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false
    if (user.is_superuser) return true
    return true
  }

  isStaff(): boolean {
    const user = this.getCurrentUser()
    return user?.is_staff || false
  }

  isSuperUser(): boolean {
    const user = this.getCurrentUser()
    return user?.is_superuser || false
  }

  getFullName(): string {
    const user = this.getCurrentUser()
    if (!user) return ''
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()
    return fullName || user.username
  }

  getInitials(): string {
    const user = this.getCurrentUser()
    if (!user) return '??'
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user.username.substring(0, 2).toUpperCase()
  }

  async checkHealth(): Promise<boolean> {
    // Toujours disponible en mode local
    return true
  }

  async getCurrentUserFromAPI(): Promise<User | null> {
    // Lit directement depuis localStorage
    return this.getCurrentUser()
  }

  async updateProfile(updates: Partial<User>): Promise<User | null> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return null
    const updated = { ...currentUser, ...updates }
    localStorage.setItem('fiscasync_user', JSON.stringify(updated))
    return updated
  }
}

export const authService = new AuthService()
export default authService
