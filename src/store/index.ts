/**
 * Configuration du store Redux pour FiscaSync
 */

import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import settingsReducer from './settingsSlice'
import balanceReducer from './balanceSlice'
import auditReducer from './auditSlice'
import notificationReducer from './notificationSlice'

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    balance: balanceReducer,
    audit: auditReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Types pour une utilisation simplifiée
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector