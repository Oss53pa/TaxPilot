/**
 * Service d'authentification pour FiscaSync
 */

import { apiService, type AuthResponse } from './api'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
  last_login?: string
  date_joined?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

class AuthService {
  // Authentification
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.login(credentials.username, credentials.password)
      return response
    } catch (error) {
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      // TODO: Appeler l'endpoint de logout côté serveur si nécessaire
      apiService.logout()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Forcer la déconnexion locale même si l'API échoue
      apiService.logout()
    }
  }

  async refreshToken(): Promise<string | null> {
    return apiService.refreshToken()
  }

  // État de l'authentification
  isAuthenticated(): boolean {
    return apiService.isAuthenticated()
  }

  getCurrentUser(): User | null {
    return apiService.getCurrentUser()
  }

  // Vérification de permissions
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Super admin a tous les droits
    if (user.is_superuser) return true

    // TODO: Implémenter la logique de permissions granulaires
    // Vérifier les permissions spécifiques dans user.permissions

    return false
  }

  canAccessEntreprise(entrepriseId: string): boolean {
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

  // Utilitaires
  async checkHealth(): Promise<boolean> {
    try {
      await apiService.healthCheck()
      return true
    } catch (error) {
      return false
    }
  }
}

export const authService = new AuthService()
export default authService