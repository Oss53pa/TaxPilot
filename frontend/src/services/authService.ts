/**
 * Service d'authentification pour TaxPilot
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient, type AuthResponse, type User, type LoginCredentials, type SignupData, type SignupResponse } from './apiClient'
import { logger } from '@/utils/logger'

// Exports des types depuis apiClient pour compatibilité
export type { User, LoginCredentials, AuthResponse, SignupData, SignupResponse }

class AuthService {
  // Authentification - CONNEXION RÉELLE AU BACKEND
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      logger.debug('Logging in to backend...', credentials.username)
      const response = await apiClient.login(credentials)
      logger.debug('Login successful:', response.success)
      return response
    } catch (error) {
      logger.error('Login failed:', error)
      throw error
    }
  }

  async signup(signupData: SignupData): Promise<SignupResponse> {
    try {
      logger.debug('Signing up new organization...', signupData.name)
      const response = await apiClient.signup(signupData)
      logger.debug('Signup successful:', response.organization.name)
      return response
    } catch (error) {
      logger.error('Signup failed:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      logger.debug('Logging out...')
      // TODO: Appeler l'endpoint de logout côté serveur si nécessaire
      apiClient.logout()
      logger.debug('Logout successful')
    } catch (error) {
      logger.error('Logout error:', error)
      // Forcer la déconnexion locale même si l'API échoue
      apiClient.logout()
    }
  }

  async refreshToken(): Promise<string | null> {
    logger.debug('Refreshing token...')
    try {
      // Le refreshToken est géré automatiquement par apiClient
      const token = apiClient.getAccessToken()
      logger.debug('Token refresh handled automatically')
      return token
    } catch (error) {
      logger.error('Token refresh failed:', error)
      return null
    }
  }

  // État de l'authentification - CONNEXION RÉELLE AU BACKEND
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated()
  }

  getCurrentUser(): User | null {
    return apiClient.getCurrentUser()
  }

  // Vérification de permissions
  hasPermission(_permission: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Super admin a tous les droits
    if (user.is_superuser) return true

    // TODO: Implémenter la logique de permissions granulaires
    // Vérifier les permissions spécifiques dans user.permissions

    return false
  }

  canAccessEntreprise(_entrepriseId: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Super admin peut accéder à toutes les entreprises
    if (user.is_superuser) return true

    // TODO: Vérifier les droits d'accès par entreprise
    // return user.entreprise_accesses?.includes(entrepriseId)

    return true // Temporaire pour le développement
  }

  isStaff(): boolean {
    const user = this.getCurrentUser()
    return user?.is_staff || false
  }

  isSuperUser(): boolean {
    const user = this.getCurrentUser()
    return user?.is_superuser || false
  }

  // Profil utilisateur
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

  // Utilitaires - CONNEXION RÉELLE AU BACKEND
  async checkHealth(): Promise<boolean> {
    try {
      logger.debug('Checking backend health...')
      await apiClient.get('/api/v1/core/health/')
      logger.debug('Backend is healthy')
      return true
    } catch (error) {
      logger.error('Backend health check failed:', error)
      return false
    }
  }

  // Nouvelles méthodes pour l'API backend
  async getCurrentUserFromAPI(): Promise<User | null> {
    try {
      logger.debug('Fetching current user from backend...')
      const response = await apiClient.get<{ success: boolean; data: User }>('/api/v1/core/auth/me/')
      if (response.success) {
        logger.debug('User fetched from backend:', response.data.username)
        return response.data
      }
      return null
    } catch (error) {
      logger.error('Failed to fetch user from backend:', error)
      return null
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User | null> {
    try {
      logger.debug('Updating user profile...', updates)
      const response = await apiClient.patch<{ success: boolean; data: User }>('/api/v1/core/auth/me/', updates)
      if (response.success) {
        logger.debug('Profile updated successfully')
        return response.data
      }
      return null
    } catch (error) {
      logger.error('Failed to update profile:', error)
      throw error
    }
  }
}

export const authService = new AuthService()
export default authService