/**
 * Hook personnalisé pour charger les données du backend
 * Remplace automatiquement les données mockées par les vraies données
 */

import { useState, useEffect } from 'react'
import * as services from '@/services'

interface UseBackendDataOptions {
  service: keyof typeof services
  method: string
  params?: any
  defaultData?: any
  autoLoad?: boolean
}

export const useBackendData = <T = any>({
  service,
  method,
  params = {},
  defaultData = null,
  autoLoad = true
}: UseBackendDataOptions) => {
  const [data, setData] = useState<T | null>(defaultData)
  const [loading, setLoading] = useState(autoLoad)
  const [error, setError] = useState<Error | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const serviceInstance = services[service] as any
      if (!serviceInstance || !serviceInstance[method]) {
        throw new Error(`Service ${service}.${method} not found`)
      }

      console.log(`🔄 Loading data from ${service}.${method}...`, params)
      const response = await serviceInstance[method](params)

      // Handle paginated responses
      const result = response?.results !== undefined ? response.results : response
      setData(result)

      console.log(`✅ Data loaded from ${service}.${method}`)
      return result
    } catch (err) {
      console.error(`❌ Error loading from ${service}.${method}:`, err)
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
    if (autoLoad) {
      loadData()
    }
  }, [])

  return { data, loading, error, reload: loadData, setData }
}

// Hook spécialisé pour les entreprises
export const useEntreprises = (params?: any) => {
  return useBackendData({
    service: 'entrepriseService',
    method: 'getEntreprises',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les balances
export const useBalances = (params?: any) => {
  return useBackendData({
    service: 'balanceService',
    method: 'getBalances',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les audits
export const useAudits = (params?: any) => {
  return useBackendData({
    service: 'auditService',
    method: 'getAuditSessions',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les générations
export const useGenerations = (params?: any) => {
  return useBackendData({
    service: 'generationService',
    method: 'getLiasseGenerations',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les templates
export const useTemplates = (params?: any) => {
  return useBackendData({
    service: 'templatesService',
    method: 'getTemplates',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les déclarations fiscales
export const useDeclarationsFiscales = (params?: any) => {
  return useBackendData({
    service: 'taxService',
    method: 'getDeclarations',
    params,
    defaultData: []
  })
}

// Hook spécialisé pour les plans comptables
export const usePlansComptables = (params?: any) => {
  return useBackendData({
    service: 'accountingService',
    method: 'getPlansComptables',
    params,
    defaultData: []
  })
}