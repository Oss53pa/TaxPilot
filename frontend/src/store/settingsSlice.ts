/**
 * Redux Slice pour les paramètres utilisateur
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
  theme: 'light' | 'dark' | 'auto'
  language: 'fr' | 'en' | 'pt'
  currency: string
  dateFormat: string
  numberFormat: {
    decimal: string
    thousands: string
    precision: number
  }
  notifications: {
    email: boolean
    push: boolean
    audit: boolean
    deadlines: boolean
  }
  dashboard: {
    refreshInterval: number
    defaultView: string
    widgets: string[]
  }
  isLoading: boolean
  error: string | null
}

const initialState: SettingsState = {
  theme: 'light',
  language: 'fr',
  currency: 'XOF',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: {
    decimal: ',',
    thousands: ' ',
    precision: 2,
  },
  notifications: {
    email: true,
    push: true,
    audit: true,
    deadlines: true,
  },
  dashboard: {
    refreshInterval: 300, // 5 minutes
    defaultView: 'overview',
    widgets: ['kpi', 'audit', 'balance', 'recent'],
  },
  isLoading: false,
  error: null,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload
    },
    updateLanguage: (state, action: PayloadAction<'fr' | 'en' | 'pt'>) => {
      state.language = action.payload
    },
    updateCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload
    },
    updateDateFormat: (state, action: PayloadAction<string>) => {
      state.dateFormat = action.payload
    },
    updateNumberFormat: (state, action: PayloadAction<Partial<SettingsState['numberFormat']>>) => {
      state.numberFormat = { ...state.numberFormat, ...action.payload }
    },
    updateNotifications: (state, action: PayloadAction<Partial<SettingsState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload }
    },
    updateDashboard: (state, action: PayloadAction<Partial<SettingsState['dashboard']>>) => {
      state.dashboard = { ...state.dashboard, ...action.payload }
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload }
    },
    setSettingsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setSettingsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearSettingsError: (state) => {
      state.error = null
    },
  },
})

export const {
  updateTheme,
  updateLanguage,
  updateCurrency,
  updateDateFormat,
  updateNumberFormat,
  updateNotifications,
  updateDashboard,
  updateSettings,
  setSettingsLoading,
  setSettingsError,
  clearSettingsError,
} = settingsSlice.actions

export default settingsSlice.reducer