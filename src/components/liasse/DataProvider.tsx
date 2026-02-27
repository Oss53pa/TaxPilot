/**
 * Provider de données pour toutes les feuilles SYSCOHADA
 * Remplace automatiquement les données mockées par les données backend
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  balanceService,
  entrepriseService,
  generationService,
  accountingService
} from '@/services'
import { liasseDataService } from '../../services/liasseDataService'

interface LiasseData {
  entreprise: any
  exercice: any
  balance: any
  comptes: any[]
  ecritures: any[]
  loading: boolean
  error: Error | null
}

const LiasseDataContext = createContext<LiasseData | null>(null)

export const useLiasseData = () => {
  const context = useContext(LiasseDataContext)
  if (!context) {
    // Retourner des données par défaut si pas de contexte
    return {
      entreprise: null,
      exercice: null,
      balance: null,
      comptes: [],
      ecritures: [],
      loading: false,
      error: null
    }
  }
  return context
}

interface LiasseDataProviderProps {
  children: ReactNode
  entrepriseId?: string
  exerciceId?: string
}

export const LiasseDataProvider: React.FC<LiasseDataProviderProps> = ({
  children,
  entrepriseId,
  exerciceId
}) => {
  const [data, setData] = useState<LiasseData>({
    entreprise: null,
    exercice: null,
    balance: null,
    comptes: [],
    ecritures: [],
    loading: true,
    error: null
  })

  const loadLiasseData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))
      console.log('🔄 Loading liasse data from backend...')

      // Charger toutes les données nécessaires
      const [entreprisesRes, balancesRes, comptesRes] = await Promise.all([
        entrepriseService.getEntreprises({ page_size: 100 }),
        balanceService.getBalances({ page_size: 100 }),
        accountingService.getComptes({ page_size: 500 })
      ])

      // Extraire les données (gestion des types API)
      const entreprise = (entreprisesRes as any)?.results?.[0] || null
      const balance = (balancesRes as any)?.results?.[0] || null
      const comptes = (comptesRes as any)?.results || []

      // Si on a une balance, charger ses lignes
      let balanceDetails = null
      if (balance?.id) {
        try {
          balanceDetails = await balanceService.getLignesBalance(balance.id, { page_size: 1000 })
        } catch (err) {
          console.warn('Could not load balance lines:', err)
        }
      }

      // Initialiser le service liasse avec les lignes de balance
      const balanceLines = (balanceDetails as any)?.results || balanceDetails || []
      if (Array.isArray(balanceLines) && balanceLines.length > 0) {
        liasseDataService.loadBalance(balanceLines)
        console.log(`📊 LiasseDataService initialisé avec ${balanceLines.length} lignes de balance`)
      }

      setData({
        entreprise,
        exercice: balance?.exercice || null,
        balance: balanceDetails || balance,
        comptes,
        ecritures: [],
        loading: false,
        error: null
      })

      console.log('✅ Liasse data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading liasse data:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }))
    }
  }

  useEffect(() => {
    loadLiasseData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Charger seulement au montage

  return (
    <LiasseDataContext.Provider value={data}>
      {children}
    </LiasseDataContext.Provider>
  )
}

// HOC pour wrapper automatiquement les composants avec le provider
export function withLiasseData<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => (
    <LiasseDataProvider>
      <Component {...props} />
    </LiasseDataProvider>
  )
}

// Fonction utilitaire pour convertir les données mockées en données backend
export const convertMockToBackendData = (mockData: any[], liasseData: LiasseData) => {
  if (!liasseData.comptes || liasseData.comptes.length === 0) {
    return mockData // Garder les données mockées si pas de données backend
  }

  // Mapper les données mockées vers les vrais comptes
  return mockData.map(item => {
    const compte = liasseData.comptes.find(c =>
      c.numero?.startsWith(item.compte?.substring(0, 2))
    )

    return {
      ...item,
      compte: compte?.numero || item.compte,
      libelle: compte?.libelle || item.libelle,
      montant: compte?.solde_crediteur || compte?.solde_debiteur || item.montant || 0
    }
  })
}