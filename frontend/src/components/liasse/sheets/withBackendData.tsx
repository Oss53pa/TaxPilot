import { logger } from '@/utils/logger'
/**
 * HOC pour connecter automatiquement les feuilles SYSCOHADA au backend
 */

import React, { useEffect, useState } from 'react'
import { useLiasseData } from '../DataProvider'
import { balanceService, accountingService, entrepriseService } from '@/services'

// Fonction pour convertir les données mockées en données backend
export const convertMockToBackendData = (mockData: any[], backendData: any) => {
  if (!backendData || !backendData.comptes || backendData.comptes.length === 0) {
    return mockData // Garder les données mockées si pas de données backend
  }

  // Mapper les données mockées vers les vrais comptes
  return mockData.map(item => {
    const compte = backendData.comptes.find((c: any) =>
      c.numero?.startsWith(item.compte?.substring(0, 2)) ||
      c.numero === item.compte
    )

    if (compte) {
      return {
        ...item,
        compte: compte.numero || item.compte,
        libelle: compte.libelle || item.libelle,
        montant: compte.solde_crediteur || compte.solde_debiteur || item.montant || 0,
        n: compte.solde_crediteur || compte.solde_debiteur || item.n || 0,
        n1: compte.solde_n1 || item.n1 || 0,
        debit: compte.solde_debiteur || item.debit || 0,
        credit: compte.solde_crediteur || item.credit || 0
      }
    }

    return item
  })
}

// HOC pour wrapper automatiquement les composants de feuilles
export function withBackendData<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    const liasseData = useLiasseData()
    const [enhancedData, setEnhancedData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const loadBackendData = async () => {
        try {
          logger.debug('🔄 Loading backend data for SYSCOHADA sheet...')

          // Si on a déjà les données du contexte
          if (liasseData && liasseData.comptes.length > 0) {
            setEnhancedData(liasseData)
            setLoading(false)
            return
          }

          // No DataProvider context and no backend — resolve immediately with empty data
          if (!liasseData || liasseData.comptes.length === 0) {
            setEnhancedData({
              entreprise: null,
              balance: null,
              comptes: [],
              ecritures: [],
              loading: false,
              error: null
            })
            setLoading(false)
            return
          }

          // Sinon charger depuis le backend
          const [entreprises, balances, comptes] = await Promise.all([
            entrepriseService.getEntreprises({ page_size: 10 }),
            balanceService.getBalances({ page_size: 10 }),
            accountingService.getComptes({ page_size: 500 })
          ])

          const data = {
            entreprise: (entreprises as any)?.results?.[0] || null,
            balance: (balances as any)?.results?.[0] || null,
            comptes: (comptes as any)?.results || [],
            exercice: (balances as any)?.results?.[0]?.exercice || new Date().getFullYear(),
            ecritures: [],
            loading: false,
            error: null
          }

          setEnhancedData(data)
          logger.debug('✅ Backend data loaded for SYSCOHADA sheet')
        } catch (error) {
          logger.error('❌ Error loading backend data:', error)
          setEnhancedData({
            entreprise: null,
            balance: null,
            comptes: [],
            ecritures: [],
            loading: false,
            error
          })
        } finally {
          setLoading(false)
        }
      }

      loadBackendData()
    }, [liasseData])

    // Intercepter les props et enrichir avec les données backend
    const enhancedProps = React.useMemo(() => {
      if (!enhancedData || loading) {
        return props
      }

      // Si le composant a des données mockées dans ses props, les convertir
      const propsWithData: any = { ...props }

      // Chercher les propriétés de données communes
      const dataProps = ['data', 'tableData', 'rows', 'items', 'accounts', 'comptes']

      for (const propName of dataProps) {
        if (propsWithData[propName] && Array.isArray(propsWithData[propName])) {
          propsWithData[propName] = convertMockToBackendData(
            propsWithData[propName],
            enhancedData
          )
        }
      }

      // Ajouter les données backend
      propsWithData.backendData = enhancedData
      propsWithData.entreprise = enhancedData.entreprise
      propsWithData.balance = enhancedData.balance
      propsWithData.comptes = enhancedData.comptes

      return propsWithData as P
    }, [props, enhancedData, loading])

    if (loading) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Chargement des données en cours...
        </div>
      )
    }

    return <Component {...enhancedProps} />
  }
}

// Export des services pour usage direct dans les feuilles
export { balanceService, accountingService, entrepriseService }