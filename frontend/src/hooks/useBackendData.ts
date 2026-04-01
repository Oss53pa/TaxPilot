import { logger } from '@/utils/logger'
/**
 * Hook personnalisé pour charger les données
 * Remplace automatiquement les données mockées par les vraies données
 */

import { useState, useEffect } from 'react'
import * as services from '@/services'

// Frontend-only : pas d'appels réseau
const BACKEND_ENABLED = false

interface UseBackendDataOptions<T> {
  service: keyof typeof services
  method: string
  params?: Record<string, unknown>
  defaultData?: T | null
  autoLoad?: boolean
}

export const useBackendData = <T = unknown>({
  service,
  method,
  params = {},
  defaultData = null,
  autoLoad = true
}: UseBackendDataOptions<T>) => {
  const [data, setData] = useState<T | null>(defaultData)
  const [loading, setLoading] = useState(BACKEND_ENABLED && autoLoad)
  const [error, setError] = useState<Error | null>(null)

  const loadData = async () => {
    if (!BACKEND_ENABLED) return defaultData

    try {
      setLoading(true)
      setError(null)

      const serviceInstance = services[service] as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>
      if (!serviceInstance || !serviceInstance[method]) {
        throw new Error(`Service ${service}.${method} not found`)
      }

      logger.debug(`🔄 Loading data from ${service}.${method}...`, params)
      const response = await serviceInstance[method](params)

      // Handle paginated responses
      const responseObj = response as Record<string, unknown> | undefined
      const result = (responseObj?.results !== undefined ? responseObj.results : response) as T
      setData(result)

      logger.debug(`✅ Data loaded from ${service}.${method}`)
      return result
    } catch (err) {
      logger.error(`❌ Error loading from ${service}.${method}:`, err)
      setError(err as Error)

      // Use default data if provided
      if (defaultData) {
        setData(defaultData)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (BACKEND_ENABLED && autoLoad) {
      loadData()
    }
  }, [])

  return { data, loading, error, reload: loadData, setData }
}

// Hook spécialisé pour les entreprises
export const useEntreprises = (params?: Record<string, unknown>) => {
  return useBackendData({
    service: 'entrepriseService',
    method: 'getEntreprises',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les balances
export const useBalances = (params?: Record<string, unknown>) => {
  return useBackendData({
    service: 'balanceService',
    method: 'getBalances',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les audits
export const useAudits = (params?: Record<string, unknown>) => {
  return useBackendData({
    service: 'auditService',
    method: 'getAuditSessions',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les générations
export const useGenerations = (params?: Record<string, unknown>) => {
  return useBackendData({
    service: 'generationService',
    method: 'getLiasseGenerations',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les templates
export const useTemplates = (params?: Record<string, unknown>) => {
  return useBackendData({
    service: 'templatesService',
    method: 'getTemplates',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les déclarations fiscales
export const useDeclarationsFiscales = (params?: Record<string, unknown>) => {
  return useBackendData({
    service: 'taxService',
    method: 'getDeclarations',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les plans comptables
export const usePlansComptables = (params?: Record<string, unknown>) => {
  return useBackendData({
    service: 'accountingService',
    method: 'getPlansComptables',
    params,
    defaultData: []
  })
}