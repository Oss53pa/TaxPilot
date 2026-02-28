/**
 * Redux Slice pour l'audit et la détection d'anomalies
 * Etendu pour le moteur de controles 108 points
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuditResult, AuditAnomalie } from '@/types'
import type {
  SessionAudit,
  ResultatControle,
  RapportCorrection,
  RapportPartie2,
  Severite,
  NiveauControle,
  PhaseAudit,
  ExerciceConfig,
} from '@/types/audit.types'

interface AuditState {
  // Ancien systeme (compatibilite)
  currentAudit: AuditResult | null
  auditHistory: AuditResult[]
  anomalies: AuditAnomalie[]
  selectedAnomalie: AuditAnomalie | null

  // Nouveau moteur 108 points
  currentSession: SessionAudit | null
  resultats: ResultatControle[]
  correctionReport: RapportCorrection | null
  rapportPartie2: RapportPartie2 | null
  phaseActive: PhaseAudit
  deployReady: boolean
  selectedExercice: ExerciceConfig | null

  filters: {
    type?: 'ERROR' | 'WARNING' | 'INFO'
    priorite?: 'HAUTE' | 'MOYENNE' | 'BASSE'
    compte?: string
    dateFrom?: string
    dateTo?: string
    resolved?: boolean
    severite?: Severite
    niveau?: NiveauControle
    searchText?: string
  }
  isRunning: boolean
  isLoading: boolean
  error: string | null
  progress: {
    current: number
    total: number
    stage: string
    niveauCourant?: NiveauControle
    pourcentage?: number
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

  currentSession: null,
  resultats: [],
  correctionReport: null,
  rapportPartie2: null,
  phaseActive: 'PHASE_1',
  deployReady: false,
  selectedExercice: null,

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
    // --- Actions ancien systeme (compatibilite) ---
    setCurrentAudit: (state, action: PayloadAction<AuditResult>) => {
      state.currentAudit = action.payload
      state.auditHistory.unshift(action.payload)
      state.auditHistory = state.auditHistory.slice(0, 10)
    },
    clearCurrentAudit: (state) => {
      state.currentAudit = null
    },

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

    // --- Actions nouveau moteur ---
    setSession: (state, action: PayloadAction<SessionAudit>) => {
      state.currentSession = action.payload
      state.resultats = action.payload.resultats
    },
    clearSession: (state) => {
      state.currentSession = null
      state.resultats = []
    },
    addResultats: (state, action: PayloadAction<ResultatControle[]>) => {
      state.resultats.push(...action.payload)
    },
    setPhase: (state, action: PayloadAction<PhaseAudit>) => {
      state.phaseActive = action.payload
    },
    setCorrectionReport: (state, action: PayloadAction<RapportCorrection | null>) => {
      state.correctionReport = action.payload
    },
    setRapportPartie2: (state, action: PayloadAction<RapportPartie2 | null>) => {
      state.rapportPartie2 = action.payload
    },
    setDeployReady: (state, action: PayloadAction<boolean>) => {
      state.deployReady = action.payload
    },
    setSelectedExercice: (state, action: PayloadAction<ExerciceConfig | null>) => {
      state.selectedExercice = action.payload
    },

    // --- Actions filtres ---
    setAuditFilters: (state, action: PayloadAction<Partial<AuditState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearAuditFilters: (state) => {
      state.filters = {}
    },

    // --- Actions execution ---
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

    // --- Actions chargement ---
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

    // --- Actions statistiques ---
    setAuditStatistics: (state, action: PayloadAction<Partial<AuditState['statistics']>>) => {
      state.statistics = { ...state.statistics, ...action.payload }
    },
    updateAuditStatistics: (state) => {
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

    // --- Utilitaires ---
    resetAuditState: (_state) => {
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
  setSession,
  clearSession,
  addResultats,
  setPhase,
  setCorrectionReport,
  setRapportPartie2,
  setDeployReady,
  setSelectedExercice,
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
