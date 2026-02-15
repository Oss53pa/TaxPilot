import { logger } from '@/utils/logger'
/**
 * Connecteur global automatique pour TOUS les composants
 * Ce HOC détecte et injecte automatiquement les données backend
 */

import React, { useEffect, useState } from 'react'
import { getBackendData } from '@/config/globalBackendIntegration'
import * as services from '@/services'

// Configuration globale
const GLOBAL_BACKEND_ENABLED = false

// Cache global pour éviter les appels répétés
const globalCache = new Map<string, { data: any; timestamp: number }>()

// Détecteur automatique de type de données nécessaire
const detectRequiredDataType = (componentName: string): string[] => {
  const name = componentName.toLowerCase()
  const dataTypes: string[] = []

  // Détection basée sur le nom du composant
  if (name.includes('document')) dataTypes.push('documents')
  if (name.includes('generation') || name.includes('generat')) dataTypes.push('generations')
  if (name.includes('template')) dataTypes.push('templates')
  if (name.includes('compliance') || name.includes('conform')) dataTypes.push('obligations')
  if (name.includes('calendar') || name.includes('calendr')) dataTypes.push('obligations')
  if (name.includes('veille') || name.includes('regle')) dataTypes.push('reglementations')
  if (name.includes('collaboration') || name.includes('collab')) dataTypes.push('users')
  if (name.includes('integration') || name.includes('integr')) dataTypes.push('integrations')
  if (name.includes('security') || name.includes('secur')) dataTypes.push('security')
  if (name.includes('balance')) dataTypes.push('balances')
  if (name.includes('audit')) dataTypes.push('audits')
  if (name.includes('entreprise') || name.includes('parametr')) dataTypes.push('entreprises')
  if (name.includes('plan')) dataTypes.push('plansComptables')
  if (name.includes('liasse')) dataTypes.push('generations', 'balances')
  if (name.includes('direct')) dataTypes.push('entreprises', 'balances', 'generations')

  // Si aucune correspondance, charger les données de base
  if (dataTypes.length === 0) {
    dataTypes.push('entreprises', 'dashboardStats')
  }

  return [...new Set(dataTypes)] // Enlever les doublons
}

// Cache timeout constant
const CACHE_TIMEOUT = 5 * 60 * 1000 // 5 minutes

// HOC global pour connecter automatiquement n'importe quel composant
export function withGlobalBackend<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    dataTypes?: string[]
    autoDetect?: boolean
    cacheEnabled?: boolean
  }
): React.ComponentType<P> {
  const componentName = Component.displayName || Component.name || 'Component'

  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const [backendData, setBackendData] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const loadBackendData = async () => {
      try {
        logger.debug(`Auto-connecting ${componentName} to backend...`)

        // Déterminer les types de données à charger
        let dataTypesToLoad = options?.dataTypes || []

        if (options?.autoDetect !== false || dataTypesToLoad.length === 0) {
          dataTypesToLoad = [...dataTypesToLoad, ...detectRequiredDataType(componentName)]
        }

        logger.debug(`Loading data types for ${componentName}:`, dataTypesToLoad)

        // Charger toutes les données nécessaires
        const loadedData: any = {}

        await Promise.all(
          dataTypesToLoad.map(async (dataType) => {
            // Vérifier le cache
            const cacheKey = `${dataType}_global`
            const cached = globalCache.get(cacheKey)

            if (cached && Date.now() - cached.timestamp < CACHE_TIMEOUT) {
              loadedData[dataType] = cached.data
              return
            }

            // Charger depuis le backend
            const data = await getBackendData(dataType)
            if (data) {
              loadedData[dataType] = data
              // Mettre en cache
              globalCache.set(cacheKey, { data, timestamp: Date.now() })
            }
          })
        )

        setBackendData(loadedData)
        logger.debug(`${componentName} connected to backend with ${Object.keys(loadedData).length} data sources`)
      } catch (err) {
        logger.error(`Error connecting ${componentName} to backend:`, err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      if (!GLOBAL_BACKEND_ENABLED) {
        setLoading(false)
        return
      }

      loadBackendData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Enrichir les props avec les données backend et les services
    const enhancedProps = React.useMemo(() => {
      const enhanced: any = { ...props }

      // Injecter les données backend
      enhanced.backendData = backendData
      enhanced.backendLoading = loading
      enhanced.backendError = error

      // Injecter les services directement
      enhanced.services = services

      // Mapper les données spécifiques si disponibles
      if (backendData.entreprises) enhanced.entreprises = backendData.entreprises
      if (backendData.balances) enhanced.balances = backendData.balances
      if (backendData.generations) enhanced.generations = backendData.generations
      if (backendData.templates) enhanced.templates = backendData.templates
      if (backendData.documents) enhanced.documents = backendData.documents
      if (backendData.audits) enhanced.audits = backendData.audits
      if (backendData.dashboardStats) enhanced.stats = backendData.dashboardStats

      // Fonction helper pour recharger les données
      enhanced.reloadBackendData = loadBackendData

      return enhanced as P
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props, backendData, loading, error])

    // Si le composant a une propriété spéciale pour désactiver le loading
    if ((props as any).skipBackendLoading) {
      return <Component {...(props as any)} ref={ref} />
    }

    // Afficher un loader pendant le chargement initial
    if (loading && !error && Object.keys(backendData).length === 0) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          opacity: 0.6
        }}>
          Connexion au backend en cours...
        </div>
      )
    }

    return <Component {...enhancedProps} ref={ref} />
  })

  WrappedComponent.displayName = `withGlobalBackend(${componentName})`

  return WrappedComponent as any as React.ComponentType<P>
}

// Fonction pour appliquer le HOC à plusieurs composants
export const connectMultipleComponents = (components: Record<string, React.ComponentType<any>>) => {
  const connected: Record<string, React.ComponentType<any>> = {}

  for (const [name, Component] of Object.entries(components)) {
    connected[name] = withGlobalBackend(Component, { autoDetect: true })
  }

  return connected
}

// HOC spécialisé pour les pages (avec options prédéfinies)
export const withPageBackend = <P extends object>(Component: React.ComponentType<P>) => {
  return withGlobalBackend(Component, {
    autoDetect: true,
    cacheEnabled: true
  })
}

// HOC pour les modules de génération
export const withGenerationBackend = <P extends object>(Component: React.ComponentType<P>) => {
  return withGlobalBackend(Component, {
    dataTypes: ['generations', 'templates', 'balances', 'entreprises'],
    cacheEnabled: true
  })
}

// HOC pour les modules de documents
export const withDocumentBackend = <P extends object>(Component: React.ComponentType<P>) => {
  return withGlobalBackend(Component, {
    dataTypes: ['documents', 'generations', 'entreprises'],
    cacheEnabled: true
  })
}

// Export par défaut
export default withGlobalBackend
