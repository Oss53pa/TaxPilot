/**
 * Configuration principale de l'API pour FiscaSync
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// Configuration de base
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8003'

// Interface pour les réponses d'authentification
export interface AuthResponse {
  success: boolean
  message: string
  data: {
    access: string
    refresh: string
    user: {
      id: number
      username: string
      email: string
      first_name: string
      last_name: string
      is_staff: boolean
      is_superuser: boolean
    }
  }
}

// Interface pour les erreurs API
export interface ApiError {
  message: string
  field?: string
  code?: string
  detail?: string
}

class ApiService {
  private api: AxiosInstance

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

  private setupInterceptors() {
    // Request interceptor - Ajouter le token d'authentification
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - Gérer les erreurs et le refresh token
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
          (originalRequest as any)._retry = true

          try {
            const newToken = await this.refreshToken()
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return this.api(originalRequest)
            }
          } catch (refreshError) {
            this.logout()
            window.location.href = '/login'
          }
        }

        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const data = error.response.data as any
      return {
        message: data.message || data.detail || 'Une erreur est survenue',
        field: data.field,
        code: data.code,
        detail: data.detail
      }
    }

    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      return {
        message: 'Erreur de connexion au serveur',
        code: 'NETWORK_ERROR'
      }
    }

    return {
      message: error.message || 'Une erreur inattendue est survenue'
    }
  }

  // Gestion des tokens
  private getAccessToken(): string | null {
    return localStorage.getItem('fiscasync_access_token')
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('fiscasync_refresh_token')
  }

  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('fiscasync_access_token', accessToken)
    localStorage.setItem('fiscasync_refresh_token', refreshToken)
  }

  private clearTokens() {
    localStorage.removeItem('fiscasync_access_token')
    localStorage.removeItem('fiscasync_refresh_token')
    localStorage.removeItem('fiscasync_user')
  }

  // Authentification
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/api/v1/auth/login/', {
        username,
        password
      })

      if (response.data.success && response.data.data) {
        this.setTokens(response.data.data.access, response.data.data.refresh)
        localStorage.setItem('fiscasync_user', JSON.stringify(response.data.data.user))
      }

      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }

  async refreshToken(): Promise<string | null> {
    const refresh = this.getRefreshToken()
    if (!refresh) return null

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh/`, {
        refresh
      })

      const newAccessToken = response.data.access
      localStorage.setItem('fiscasync_access_token', newAccessToken)
      return newAccessToken
    } catch (error) {
      this.clearTokens()
      return null
    }
  }

  logout() {
    this.clearTokens()
  }

  // Méthodes génériques pour les requêtes
  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.api.get<T>(url, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }

  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data)
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }

  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data)
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, data)
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.api.delete<T>(url)
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }

  // Vérifier l'état de connexion
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    const user = localStorage.getItem('fiscasync_user')
    return !!(token && user)
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('fiscasync_user')
    return userStr ? JSON.parse(userStr) : null
  }

  // Health check
  async healthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL}/health/`)
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError)
    }
  }
}

// Instance singleton
export const apiService = new ApiService()
export default apiService