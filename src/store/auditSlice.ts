/**
 * Redux Slice pour l'audit et la détection d'anomalies
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuditResult, AuditAnomalie } from '@/types'

interface AuditState {
  currentAudit: AuditResult | null
  auditHistory: AuditResult[]
  anomalies: AuditAnomalie[]
  selectedAnomalie: AuditAnomalie | null
  filters: {
    type?: 'ERROR' | 'WARNING' | 'INFO'
    priorite?: 'HAUTE' | 'MOYENNE' | 'BASSE'
    compte?: string
    dateFrom?: string
    dateTo?: string
    resolved?: boolean
  }
  isRunning: boolean
  isLoading: boolean
  error: string | null
  progress: {
    current: number
    total: number
    stage: string
  }
  statistics: {
    totalAnomalies: number
    byType: Record<string, number>
    byPriority: Record<string, number>
    resolvedCount: number
    avgResolutionTime: number
  }
}

const initialState: AuditState = {
  currentAudit: null,
  auditHistory: [],
  anomalies: [],
  selectedAnomalie: null,
  filters: {},
  isRunning: false,
  isLoading: false,
  error: null,
  progress: {
    current: 0,
    total: 0,
    stage: '',
  },
  statistics: {
    totalAnomalies: 0,
    byType: {},
    byPriority: {},
    resolvedCount: 0,
    avgResolutionTime: 0,
  },
}

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    // Actions pour l'audit principal
    setCurrentAudit: (state, action: PayloadAction<AuditResult>) => {
      state.currentAudit = action.payload
      state.auditHistory.unshift(action.payload)
      // Garder seulement les 10 derniers audits
      state.auditHistory = state.auditHistory.slice(0, 10)
    },
    clearCurrentAudit: (state) => {
      state.currentAudit = null
    },

    // Actions pour les anomalies
    setAnomalies: (state, action: PayloadAction<AuditAnomalie[]>) => {
      state.anomalies = action.payload
    },
    addAnomalie: (state, action: PayloadAction<AuditAnomalie>) => {
      state.anomalies.push(action.payload)
    },
    updateAnomalie: (state, action: PayloadAction<AuditAnomalie>) => {
      const index = state.anomalies.findIndex(a => a.id === action.payload.id)
      if (index !== -1) {
        state.anomalies[index] = action.payload
      }
    },
    removeAnomalie: (state, action: PayloadAction<string>) => {
      state.anomalies = state.anomalies.filter(a => a.id !== action.payload)
    },
    setSelectedAnomalie: (state, action: PayloadAction<AuditAnomalie | null>) => {
      state.selectedAnomalie = action.payload
    },

    // Actions pour les filtres
    setAuditFilters: (state, action: PayloadAction<Partial<AuditState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearAuditFilters: (state) => {
      state.filters = {}
    },

    // Actions pour l'exécution de l'audit
    startAudit: (state) => {
      state.isRunning = true
      state.error = null
      state.progress = { current: 0, total: 0, stage: 'Initialisation...' }
    },
    stopAudit: (state) => {
      state.isRunning = false
      state.progress = { current: 0, total: 0, stage: '' }
    },
    setAuditProgress: (state, action: PayloadAction<Partial<AuditState['progress']>>) => {
      state.progress = { ...state.progress, ...action.payload }
    },

    // Actions pour le chargement
    setAuditLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setAuditError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isRunning = false
    },
    clearAuditError: (state) => {
      state.error = null
    },

    // Actions pour les statistiques
    setAuditStatistics: (state, action: PayloadAction<Partial<AuditState['statistics']>>) => {
      state.statistics = { ...state.statistics, ...action.payload }
    },
    updateAuditStatistics: (state) => {
      // Recalculer les statistiques basées sur les anomalies actuelles
      const totalAnomalies = state.anomalies.length
      const byType = state.anomalies.reduce((acc, anomalie) => {
        acc[anomalie.type] = (acc[anomalie.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      const byPriority = state.anomalies.reduce((acc, anomalie) => {
        acc[anomalie.priorite] = (acc[anomalie.priorite] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      state.statistics = {
        ...state.statistics,
        totalAnomalies,
        byType,
        byPriority,
      }
    },

    // Actions utilitaires
    resetAuditState: (state) => {
      return { ...initialState }
    },
  },
})

export const {
  setCurrentAudit,
  clearCurrentAudit,
  setAnomalies,
  addAnomalie,
  updateAnomalie,
  removeAnomalie,
  setSelectedAnomalie,
  setAuditFilters,
  clearAuditFilters,
  startAudit,
  stopAudit,
  setAuditProgress,
  setAuditLoading,
  setAuditError,
  clearAuditError,
  setAuditStatistics,
  updateAuditStatistics,
  resetAuditState,
} = auditSlice.actions

export default auditSlice.reducer