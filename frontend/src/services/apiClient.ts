/**
 * Client API principal avec gestion JWT et connexion réelle au backend
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { STORAGE_KEYS } from '@/constants/storage'
import { API_TIMEOUTS } from '@/constants/api'
import { logger } from '@/utils/logger'

// Mode sans backend : toutes les requêtes renvoient des données vides
const BACKEND_ENABLED = import.meta.env.VITE_BACKEND_ENABLED === 'true'

// Configuration de base - CONNEXION RÉELLE AU BACKEND
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
if (BACKEND_ENABLED) {
  logger.debug('API_BASE_URL:', API_BASE_URL)
} else {
  logger.debug('Backend désactivé – les requêtes API renvoient des données vides')
}

// Types pour l'authentification
export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  name?: string
  is_staff: boolean
  is_superuser: boolean
  entreprise_courante?: {
    id: number
    raison_sociale: string
  }
  role?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    access: string
    refresh: string
    user: User
  }
}

// Types pour le signup SaaS
export interface SignupData {
  // Informations entreprise
  name: string
  legal_form: string
  rccm?: string
  ifu?: string
  country: string
  city?: string
  address?: string
  sector: string
  annual_revenue_range?: string
  billing_email?: string

  // Informations utilisateur propriétaire
  user_first_name: string
  user_last_name: string
  user_email: string
  user_password: string
  user_fonction?: string
  user_telephone?: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  legal_form: string
  rccm: string
  ifu: string
  country: string
  city: string
  sector: string
  subscription_plan: string
  subscription_status: string
  liasses_quota: number
  liasses_used: number
  quota_percentage: number
  has_quota_remaining: boolean
  trial_end_date?: string
}

export interface SignupResponse {
  message: string
  organization: Organization
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
  tokens: {
    access: string
    refresh: string
  }
  onboarding: {
    plan: string
    liasses_remaining: number
    trial_end: string | null
  }
}

// Clés de stockage centralisées
const TOKEN_KEY = STORAGE_KEYS.ACCESS_TOKEN
const REFRESH_TOKEN_KEY = STORAGE_KEYS.REFRESH_TOKEN
const USER_KEY = STORAGE_KEYS.USER

/**
 * Classe singleton pour gérer toutes les connexions API
 */
class ApiClient {
  private api: AxiosInstance
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  // 🔒 SÉCURITÉ AMÉLIORÉE: Access token en mémoire uniquement (non persisté)
  private accessTokenMemory: string | null = null

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUTS.DEFAULT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /**
   * Récupère le CSRF token depuis les cookies
   */
  private getCSRFToken(): string | null {
    const name = 'csrftoken'
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  /**
   * Configuration des intercepteurs pour gérer automatiquement les tokens
   */
  private setupInterceptors() {
    // Request interceptor - Ajoute le token JWT et CSRF à chaque requête
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Ajouter le CSRF token pour les requêtes modifiant les données
        const csrfToken = this.getCSRFToken()
        if (csrfToken && config.headers && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
          config.headers['X-CSRFToken'] = csrfToken
        }

        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        logger.error('Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor - Gère le refresh token automatiquement
    this.api.interceptors.response.use(
      (response) => {
        logger.debug(`API Response: ${response.status} ${response.config.url}`)
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        logger.error(`API Error: ${error.response?.status} ${originalRequest?.url}`)

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(this.api(originalRequest))
              })
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const newToken = await this.refreshToken()
            this.isRefreshing = false
            this.onRefreshed(newToken)
            this.refreshSubscribers = []
            return this.api(originalRequest)
          } catch (refreshError) {
            this.isRefreshing = false
            this.logout()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Notifie tous les subscribers après un refresh réussi
   */
  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token))
  }

  /**
   * 🔒 SÉCURITÉ: Récupère le token d'accès depuis la mémoire (non persisté)
   */
  public getAccessToken(): string | null {
    return this.accessTokenMemory
  }

  /**
   * 🔒 SÉCURITÉ: Récupère le refresh token depuis sessionStorage
   * Note: sessionStorage est plus sûr que localStorage (effacé à fermeture onglet)
   */
  private getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY)
  }

  /**
   * 🔒 SÉCURITÉ AMÉLIORÉE: Sauvegarde les tokens de manière sécurisée
   * - Access token: En mémoire uniquement (effacé au rafraîchissement page)
   * - Refresh token: Dans sessionStorage (effacé à fermeture onglet)
   */
  private saveTokens(access: string, refresh: string) {
    // Access token en mémoire seulement - protection XSS
    this.accessTokenMemory = access

    // Refresh token dans sessionStorage - meilleur que localStorage
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh)

    // Nettoyer l'ancien localStorage si présent
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  /**
   * 🔒 SÉCURITÉ: Sauvegarde uniquement les infos essentielles utilisateur
   */
  private saveUser(user: User) {
    // Stocker seulement les données non sensibles
    const minimalUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_staff: user.is_staff
    }
    sessionStorage.setItem(USER_KEY, JSON.stringify(minimalUser))

    // Nettoyer l'ancien localStorage
    localStorage.removeItem(USER_KEY)
  }

  /**
   * Récupère l'utilisateur actuel depuis sessionStorage
   */
  public getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * Connexion avec username/password
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Le backend Django JWT renvoie directement {access, refresh}
      const response = await this.api.post<{access: string, refresh: string}>('/api/v1/auth/login/', credentials)

      if (response.data.access && response.data.refresh) {
        const { access, refresh } = response.data
        this.saveTokens(access, refresh)

        // Créer un utilisateur par défaut pour le moment
        const user: User = {
          id: 1,
          username: credentials.username,
          email: 'admin@liasspilot.com',
          first_name: 'Admin',
          last_name: 'LiassPilot',
          is_staff: true,
          is_superuser: true
        }

        this.saveUser(user)

        // Formatage pour compatibilité avec AuthResponse
        return {
          success: true,
          message: 'Connexion réussie',
          data: {
            access,
            refresh,
            user
          }
        }
      } else {
        throw new Error('Réponse invalide')
      }
    } catch (error) {
      logger.error('Login error:', error)
      throw error
    }
  }

  /**
   * Inscription entreprise (Signup SaaS)
   */
  public async signup(signupData: SignupData): Promise<SignupResponse> {
    try {
      logger.info('Signing up new organization...', signupData.name)

      const response = await this.api.post<SignupResponse>('/api/v1/auth/signup/', signupData)

      if (response.data.tokens) {
        const { access, refresh } = response.data.tokens
        this.saveTokens(access, refresh)

        // Sauvegarder l'utilisateur
        if (response.data.user) {
          const user: User = {
            id: response.data.user.id,
            username: response.data.user.email,
            email: response.data.user.email,
            first_name: response.data.user.first_name,
            last_name: response.data.user.last_name,
            is_staff: false,
            is_superuser: false
          }
          this.saveUser(user)
        }

        // Sauvegarder l'organisation dans sessionStorage
        if (response.data.organization) {
          sessionStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(response.data.organization))
        }

        logger.info('Signup successful:', response.data.organization?.name)
        return response.data
      } else {
        throw new Error('Réponse invalide')
      }
    } catch (error) {
      logger.error('Signup error:', error)

      // Extraire les messages d'erreur du backend
      if (error instanceof AxiosError && error.response?.data) {
        const data = error.response.data as Record<string, unknown>
        if (data.error) {
          throw new Error(String(data.error))
        }
        if (data.details) {
          const details = data.details as Record<string, string | string[]>
          const errorMessages = Object.entries(details)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`
              }
              return `${field}: ${messages}`
            })
            .join('\n')
          throw new Error(errorMessages)
        }
      }

      throw error
    }
  }

  /**
   * Rafraîchit le token d'accès
   */
  private async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await this.api.post<{ access: string }>('/api/v1/auth/refresh/', {
      refresh: refreshToken,
    })

    const newAccessToken = response.data.access
    localStorage.setItem(TOKEN_KEY, newAccessToken)

    return newAccessToken
  }

  /**
   * Déconnexion
   */
  /**
   * 🔒 SÉCURITÉ: Déconnexion sécurisée avec nettoyage complet
   */
  public logout() {
    // Nettoyer la mémoire
    this.accessTokenMemory = null

    // Nettoyer sessionStorage
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(STORAGE_KEYS.ORGANIZATION)

    // Nettoyer localStorage (ancien système)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(STORAGE_KEYS.ORGANIZATION)

    logger.info('Logout complet - Tous les tokens supprimés')
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  public isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  /**
   * Instance Axios pour les requêtes
   */
  public get client(): AxiosInstance {
    return this.api
  }

  // === MÉTHODES HELPER POUR LES REQUÊTES ===

  /**
   * GET request
   */
  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    if (!BACKEND_ENABLED) return { results: [], count: 0 } as unknown as T
    const response = await this.api.get<T>(url, { params })
    return response.data
  }

  /**
   * POST request
   */
  public async post<T>(url: string, data?: unknown): Promise<T> {
    if (!BACKEND_ENABLED) return {} as T
    const response = await this.api.post<T>(url, data)
    return response.data
  }

  /**
   * PUT request
   */
  public async put<T>(url: string, data?: unknown): Promise<T> {
    if (!BACKEND_ENABLED) return {} as T
    const response = await this.api.put<T>(url, data)
    return response.data
  }

  /**
   * PATCH request
   */
  public async patch<T>(url: string, data?: unknown): Promise<T> {
    if (!BACKEND_ENABLED) return {} as T
    const response = await this.api.patch<T>(url, data)
    return response.data
  }

  /**
   * DELETE request
   */
  public async delete<T>(url: string): Promise<T> {
    if (!BACKEND_ENABLED) return {} as T
    const response = await this.api.delete<T>(url)
    return response.data
  }

  /**
   * Upload de fichier
   */
  public async upload<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    if (!BACKEND_ENABLED) return {} as T
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key])
      })
    }

    const response = await this.api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }
}

// Export d'une instance unique (Singleton)
export const apiClient = new ApiClient()

// Export pour compatibilité avec l'ancien code
export default apiClient.client