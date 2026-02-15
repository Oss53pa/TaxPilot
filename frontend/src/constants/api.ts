/**
 * Constantes API centralisées
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login/',
    LOGOUT: '/api/v1/auth/logout/',
    REGISTER: '/api/v1/auth/register/',
    REFRESH: '/api/v1/auth/token/refresh/',
    SIGNUP: '/api/v1/auth/signup/',
  },
  BALANCE: '/api/v1/balance',
  ENTREPRISE: '/api/v1/entreprises',
  LIASSE: '/api/v1/liasses',
  AUDIT: '/api/v1/audit',
  TEMPLATES: '/api/v1/templates',
  USERS: '/api/v1/users',
  NOTIFICATIONS: '/api/v1/notifications',
  ORGANIZATIONS: '/api/v1/organizations',
} as const

export const API_TIMEOUTS = {
  DEFAULT: 30_000,
  UPLOAD: 120_000,
  EXPORT: 60_000,
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 25, 50] as number[],
} as const
