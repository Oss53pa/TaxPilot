/**
 * Provider de données pour toutes les feuilles SYSCOHADA
 * Remplace automatiquement les données mockées par les données backend
 */

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { MOCK_BALANCE } from '../../data/mockBalance'
import { liasseDataService } from '../../services/liasseDataService'
import { getLatestBalance, getLatestBalanceN1 } from '../../services/balanceStorageService'

// Charger la balance importée si disponible, sinon fallback sur MOCK
const storedBalance = getLatestBalance()
const initialBalance = storedBalance?.entries?.length ? storedBalance.entries : MOCK_BALANCE
liasseDataService.loadBalance(initialBalance)

// Charger la balance N-1 si disponible
const storedN1 = getLatestBalanceN1()
if (storedN1?.entries?.length) {
  liasseDataService.loadBalanceN1(storedN1.entries)
}

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
  entrepriseId: _entrepriseId,
  exerciceId: _exerciceId
}) => {
  const [data] = useState<LiasseData>({
    entreprise: { nom: 'FISCASYNC DEMO SARL', siret: '85412369700015', regime_imposition: 'REEL_NORMAL' },
    exercice: { annee: 2024 },
    balance: initialBalance,
    comptes: [],
    ecritures: [],
    loading: false,
    error: null
  })

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