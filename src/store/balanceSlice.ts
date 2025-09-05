/**
 * Redux Slice pour la gestion des balances
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Balance } from '@/types'

interface BalanceState {
  balances: Balance[]
  selectedBalance: Balance | null
  filters: {
    exercice?: string
    compte?: string
    searchTerm?: string
    dateFrom?: string
    dateTo?: string
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
  sortBy: {
    field: string
    direction: 'asc' | 'desc'
  }
  isLoading: boolean
  isImporting: boolean
  error: string | null
  importProgress: {
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
    progress: number
    message: string
    errors: string[]
  }
}

const initialState: BalanceState = {
  balances: [],
  selectedBalance: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
  },
  sortBy: {
    field: 'compte.numero_compte',
    direction: 'asc',
  },
  isLoading: false,
  isImporting: false,
  error: null,
  importProgress: {
    status: 'idle',
    progress: 0,
    message: '',
    errors: [],
  },
}

const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    // Actions pour les balances
    setBalances: (state, action: PayloadAction<Balance[]>) => {
      state.balances = action.payload
    },
    addBalance: (state, action: PayloadAction<Balance>) => {
      state.balances.push(action.payload)
    },
    updateBalance: (state, action: PayloadAction<Balance>) => {
      const index = state.balances.findIndex(b => b.id === action.payload.id)
      if (index !== -1) {
        state.balances[index] = action.payload
      }
    },
    removeBalance: (state, action: PayloadAction<string>) => {
      state.balances = state.balances.filter(b => b.id !== action.payload)
    },
    setSelectedBalance: (state, action: PayloadAction<Balance | null>) => {
      state.selectedBalance = action.payload
    },

    // Actions pour les filtres
    setFilters: (state, action: PayloadAction<Partial<BalanceState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },

    // Actions pour la pagination
    setPagination: (state, action: PayloadAction<Partial<BalanceState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },

    // Actions pour le tri
    setSortBy: (state, action: PayloadAction<{ field: string; direction: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload
    },

    // Actions pour le chargement
    setBalanceLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setBalanceError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    // Actions pour l'import
    setImporting: (state, action: PayloadAction<boolean>) => {
      state.isImporting = action.payload
    },
    setImportProgress: (state, action: PayloadAction<Partial<BalanceState['importProgress']>>) => {
      state.importProgress = { ...state.importProgress, ...action.payload }
    },
    resetImportProgress: (state) => {
      state.importProgress = {
        status: 'idle',
        progress: 0,
        message: '',
        errors: [],
      }
    },

    // Actions utilitaires
    clearBalanceError: (state) => {
      state.error = null
    },
    resetBalanceState: (state) => {
      return { ...initialState }
    },
  },
})

export const {
  setBalances,
  addBalance,
  updateBalance,
  removeBalance,
  setSelectedBalance,
  setFilters,
  clearFilters,
  setPagination,
  setPage,
  setSortBy,
  setBalanceLoading,
  setBalanceError,
  setImporting,
  setImportProgress,
  resetImportProgress,
  clearBalanceError,
  resetBalanceState,
} = balanceSlice.actions

export default balanceSlice.reducer