/**
 * Client API principal avec gestion JWT et connexion réelle au backend
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

// Configuration de base - CONNEXION RÉELLE AU BACKEND
const API_BASE_URL = 'http://localhost:8001'
console.log('🔧 API_BASE_URL forced to:', API_BASE_URL)

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
  is_staff: boolean
  is_superuser: boolean
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

// Clés de stockage
const TOKEN_KEY = 'fiscasync_access_token'
const REFRESH_TOKEN_KEY = 'fiscasync_refresh_token'
const USER_KEY = 'fiscasync_user'

/**
 * Classe singleton pour gérer toutes les connexions API
 */
class ApiClient {
  private api: AxiosInstance
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /**
   * Configuration des intercepteurs pour gérer automatiquement les tokens
   */
  private setupInterceptors() {
    // Request interceptor - Ajoute le token JWT à chaque requête
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor - Gère le refresh token automatiquement
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        console.error(`❌ API Error: ${error.response?.status} ${originalRequest?.url}`)

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
   * Récupère le token d'accès depuis le localStorage
   */
  public getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  /**
   * Récupère le refresh token depuis le localStorage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  /**
   * Sauvegarde les tokens dans le localStorage
   */
  private saveTokens(access: string, refresh: string) {
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  }

  /**
   * Sauvegarde les informations utilisateur
   */
  private saveUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  /**
   * Récupère l'utilisateur actuel
   */
  public getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY)
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
          email: 'admin@fiscasync.com',
          first_name: 'Admin',
          last_name: 'FiscaSync',
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
        throw new Error('Réponse invalide du serveur')
      }
    } catch (error) {
      console.error('Login error:', error)
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
  public logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
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
  public async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<T>(url, { params })
    return response.data
  }

  /**
   * POST request
   */
  public async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<T>(url, data)
    return response.data
  }

  /**
   * PUT request
   */
  public async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<T>(url, data)
    return response.data
  }

  /**
   * PATCH request
   */
  public async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.patch<T>(url, data)
    return response.data
  }

  /**
   * DELETE request
   */
  public async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<T>(url)
    return response.data
  }

  /**
   * Upload de fichier
   */
  public async upload<T>(url: string, file: File, additionalData?: any): Promise<T> {
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