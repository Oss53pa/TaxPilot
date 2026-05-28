/**
 * Client API — stub pour mode frontend-only (localStorage)
 * Toutes les requêtes renvoient des données vides.
 */

import { STORAGE_KEYS } from '@/constants/storage'
import { logger } from '@/utils/logger'

logger.debug('Mode frontend-only — les requêtes API renvoient des données vides')

/**
 * Stub HTTP — Liass'Pilot n'a AUCUN backend REST (100% Supabase + local).
 * Remplace l'ancienne instance axios. Les anciennes méthodes export/download
 * qui appelaient `apiClient.client.get(...)` rejettent désormais proprement
 * (comme l'ancien 404), sans dépendance réseau ni axios. Les exports réels
 * passent par le moteur client-side (exportService / balanceTemplateService).
 */
interface StubHttpClient {
  // `data: any` reproduit le comportement de l'ancien AxiosResponse pour que les
  // anciennes méthodes export (response.data → Blob) compilent sans modification.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(url: string, config?: unknown): Promise<{ data: any; headers: Record<string, string> }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post(url: string, data?: unknown, config?: unknown): Promise<{ data: any; headers: Record<string, string> }>
}

const NO_BACKEND_MSG =
  "Aucun backend REST — Liass'Pilot fonctionne en Supabase + local. Utilisez l'export client-side."

const stubHttpClient: StubHttpClient = {
  get: () => Promise.reject(new Error(NO_BACKEND_MSG)),
  post: () => Promise.reject(new Error(NO_BACKEND_MSG)),
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

const TOKEN_KEY = STORAGE_KEYS.ACCESS_TOKEN
const REFRESH_TOKEN_KEY = STORAGE_KEYS.REFRESH_TOKEN
const USER_KEY = STORAGE_KEYS.USER

/**
 * Client API stub — toutes les méthodes renvoient des données vides
 */
class ApiClient {
  public getAccessToken(): string | null {
    return null
  }

  public getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  public async login(_credentials: LoginCredentials): Promise<AuthResponse> {
    throw new Error('Mode frontend-only : connexion non disponible')
  }

  public async signup(_signupData: SignupData): Promise<SignupResponse> {
    throw new Error('Mode frontend-only : inscription non disponible')
  }

  public logout() {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(STORAGE_KEYS.ORGANIZATION)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(STORAGE_KEYS.ORGANIZATION)
  }

  public isAuthenticated(): boolean {
    return false
  }

  public get client(): StubHttpClient {
    return stubHttpClient
  }

  public async get<T>(_url: string, _params?: object): Promise<T> {
    return { results: [], count: 0 } as unknown as T
  }

  public async post<T>(_url: string, _data?: unknown): Promise<T> {
    return {} as T
  }

  public async put<T>(_url: string, _data?: unknown): Promise<T> {
    return {} as T
  }

  public async patch<T>(_url: string, _data?: unknown): Promise<T> {
    return {} as T
  }

  public async delete<T>(_url: string): Promise<T> {
    return {} as T
  }

  public async upload<T>(_url: string, _file: File, _additionalData?: object): Promise<T> {
    return {} as T
  }
}

export const apiClient = new ApiClient()
export default apiClient
