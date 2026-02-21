import { logger } from '@/utils/logger'
/**
 * Wrapper universel qui connecte automatiquement TOUS les composants au backend
 * Intercepte et remplace toutes les données mockées automatiquement
 */

import React, { useEffect, useState } from 'react'
import * as services from '@/services'
import { getBackendData } from '@/config/globalBackendIntegration'

interface BackendWrapperProps {
  children: React.ReactNode
  componentName?: string
}

// Hook global pour intercepter et remplacer les données
export const useUniversalBackend = () => {
  const [globalData, setGlobalData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllBackendData()
  }, [])

  const loadAllBackendData = async () => {
    try {
      logger.debug('🌐 Loading ALL backend data for universal wrapper...')

      const [
        entreprises,
        balances,
        audits,
        generations,
        templates,
        obligations,
        comptes,
        plansComptables,
        stats
      ] = await Promise.all([
        getBackendData('entreprises'),
        getBackendData('balances'),
        getBackendData('audits'),
        getBackendData('generations'),
        getBackendData('templates'),
        getBackendData('obligations'),
        getBackendData('comptes'),
        getBackendData('plansComptables'),
        getBackendData('dashboardStats')
      ])

      const data = {
        entreprises: entreprises || [],
        balances: balances || [],
        audits: audits || [],
        generations: generations || [],
        templates: templates || [],
        obligations: obligations || [],
        comptes: comptes || [],
        plansComptables: plansComptables || [],
        stats: stats || {}
      }

      setGlobalData(data)
      logger.debug('✅ Universal backend data loaded')
    } catch (error) {
      logger.error('❌ Error loading universal backend data:', error)
    } finally {
      setLoading(false)
    }
  }

  return { globalData, loading, services }
}

// Provider pour injecter les données globalement
export const BackendDataContext = React.createContext<any>({})

export const UniversalBackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const backendData = useUniversalBackend()

  return (
    <BackendDataContext.Provider value={backendData}>
      {children}
    </BackendDataContext.Provider>
  )
}

// HOC pour wrapper n'importe quel composant
export const withUniversalBackend = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { globalData, loading, services } = useUniversalBackend()

    // Injecter les props backend
    const enhancedProps = {
      ...props,
      backendData: globalData,
      backendLoading: loading,
      services,
      // Mappage direct des données communes
      entreprises: globalData.entreprises,
      balances: globalData.balances,
      templates: globalData.templates,
      generations: globalData.generations,
      audits: globalData.audits,
      comptes: globalData.comptes
    }

    if (loading && Object.keys(globalData).length === 0) {
      return <div>Chargement des données...</div>
    }

    return <Component {...enhancedProps as P} />
  }
}

// Composant wrapper pour enfants
export const UniversalBackendWrapper: React.FC<BackendWrapperProps> = ({
  children,
  componentName
}) => {
  const { globalData, loading, services } = useUniversalBackend()

  // Clone les enfants et injecte les props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as any, {
        backendData: globalData,
        backendLoading: loading,
        services,
        ...globalData
      })
    }
    return child
  })

  if (loading && Object.keys(globalData).length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        opacity: 0.7
      }}>
        Chargement des données pour {componentName || 'le composant'}...
      </div>
    )
  }

  return <>{enhancedChildren}</>
}

// Export par défaut
export default UniversalBackendWrapper