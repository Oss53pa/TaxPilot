import { logger } from '@/utils/logger'
/**
 * Hook pour la gestion centralisée des erreurs API
 */

import { useCallback } from 'react'
import { AxiosError } from 'axios'

interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

interface UseApiErrorReturn {
  handleError: (error: unknown) => ApiError
  getErrorMessage: (error: unknown) => string
  isNetworkError: (error: unknown) => boolean
  isAuthError: (error: unknown) => boolean
  isValidationError: (error: unknown) => boolean
}

export const useApiError = (): UseApiErrorReturn => {
  const handleError = useCallback((error: unknown): ApiError => {
    logger.error('🚨 API Error:', error)

    // Erreur Axios (réponse du serveur)
    if (error instanceof AxiosError) {
      const status = error.response?.status
      const data = error.response?.data

      // Messages d'erreur spécifiques par status
      const statusMessages: Record<number, string> = {
        400: 'Données invalides',
        401: 'Non autorisé - Veuillez vous reconnecter',
        403: 'Accès interdit',
        404: 'Ressource non trouvée',
        422: 'Données de validation échouées',
        429: 'Trop de requêtes - Veuillez patienter',
        500: 'Erreur serveur interne',
        502: 'Serveur indisponible',
        503: 'Service temporairement indisponible',
        504: 'Timeout du serveur'
      }

      let message = statusMessages[status || 0] || 'Erreur de connexion'

      // Utiliser le message du serveur si disponible
      if (data?.message) {
        message = data.message
      } else if (data?.detail) {
        message = data.detail
      } else if (data?.error) {
        message = data.error
      }

      return {
        message,
        code: data?.code || error.code,
        status,
        details: data
      }
    }

    // Erreur réseau
    if (error instanceof Error) {
      if (error.message.includes('Network Error')) {
        return {
          message: 'Erreur de connexion réseau - Vérifiez votre connexion internet',
          code: 'NETWORK_ERROR'
        }
      }

      if (error.message.includes('timeout')) {
        return {
          message: 'Délai d\'attente dépassé - Le serveur met trop de temps à répondre',
          code: 'TIMEOUT_ERROR'
        }
      }

      return {
        message: error.message,
        code: 'GENERIC_ERROR'
      }
    }

    // Erreur inconnue
    return {
      message: 'Une erreur inattendue s\'est produite',
      code: 'UNKNOWN_ERROR',
      details: error
    }
  }, [])

  const getErrorMessage = useCallback((error: unknown): string => {
    return handleError(error).message
  }, [handleError])

  const isNetworkError = useCallback((error: unknown): boolean => {
    if (error instanceof AxiosError) {
      return !error.response && (
        error.code === 'NETWORK_ERROR' ||
        error.message.includes('Network Error')
      )
    }
    return false
  }, [])

  const isAuthError = useCallback((error: unknown): boolean => {
    if (error instanceof AxiosError) {
      return error.response?.status === 401
    }
    return false
  }, [])

  const isValidationError = useCallback((error: unknown): boolean => {
    if (error instanceof AxiosError) {
      return error.response?.status === 400 || error.response?.status === 422
    }
    return false
  }, [])

  return {
    handleError,
    getErrorMessage,
    isNetworkError,
    isAuthError,
    isValidationError
  }
}

export default useApiError