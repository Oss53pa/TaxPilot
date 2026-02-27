/**
 * Hook pour la gestion centralisée des erreurs API
 * Version FiscaSync-Lite sans dépendance Axios
 */

import { useCallback } from 'react'

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
    console.error('🚨 API Error:', error)

    if (error instanceof Error) {
      if (error.message.includes('non trouvee')) {
        return {
          message: 'Ressource non trouvée',
          code: 'NOT_FOUND',
          status: 404
        }
      }

      if (error.message.includes('Identifiants invalides')) {
        return {
          message: 'Non autorisé - Veuillez vous reconnecter',
          code: 'AUTH_ERROR',
          status: 401
        }
      }

      return {
        message: error.message,
        code: 'GENERIC_ERROR'
      }
    }

    return {
      message: 'Une erreur inattendue s\'est produite',
      code: 'UNKNOWN_ERROR',
      details: error
    }
  }, [])

  const getErrorMessage = useCallback((error: unknown): string => {
    return handleError(error).message
  }, [handleError])

  const isNetworkError = useCallback((_error: unknown): boolean => {
    // Pas d'erreurs réseau en mode local
    return false
  }, [])

  const isAuthError = useCallback((error: unknown): boolean => {
    if (error instanceof Error) {
      return error.message.includes('Identifiants') || error.message.includes('autorisé')
    }
    return false
  }, [])

  const isValidationError = useCallback((error: unknown): boolean => {
    if (error instanceof Error) {
      return error.message.includes('invalide') || error.message.includes('validation')
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
