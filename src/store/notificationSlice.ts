/**
 * Redux Slice pour les notifications
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Notification } from '@/types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  filters: {
    type?: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
    read?: boolean
    dateFrom?: string
    dateTo?: string
  }
  isLoading: boolean
  error: string | null
  realTimeEnabled: boolean
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  filters: {},
  isLoading: false,
  error: null,
  realTimeEnabled: true,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Actions pour les notifications
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.lue).length
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.lue) {
        state.unreadCount += 1
      }
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id)
      if (index !== -1) {
        const wasUnread = !state.notifications[index].lue
        const isNowRead = action.payload.lue
        
        state.notifications[index] = action.payload
        
        // Mettre à jour le compteur non lues
        if (wasUnread && isNowRead) {
          state.unreadCount -= 1
        } else if (!wasUnread && !isNowRead) {
          state.unreadCount += 1
        }
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.lue) {
        state.unreadCount -= 1
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },

    // Actions pour marquer comme lu
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.lue) {
        notification.lue = true
        notification.date_lecture = new Date().toISOString()
        state.unreadCount -= 1
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.lue) {
          notification.lue = true
          notification.date_lecture = new Date().toISOString()
        }
      })
      state.unreadCount = 0
    },

    // Actions pour les filtres
    setNotificationFilters: (state, action: PayloadAction<Partial<NotificationState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearNotificationFilters: (state) => {
      state.filters = {}
    },

    // Actions pour le chargement
    setNotificationLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setNotificationError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearNotificationError: (state) => {
      state.error = null
    },

    // Actions pour le temps réel
    setRealTimeEnabled: (state, action: PayloadAction<boolean>) => {
      state.realTimeEnabled = action.payload
    },

    // Actions utilitaires
    clearOldNotifications: (state, action: PayloadAction<number>) => {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - action.payload)
      
      const _beforeCount = state.notifications.length
      state.notifications = state.notifications.filter(
        n => new Date(n.created_at) > cutoffDate
      )
      
      // Recalculer le nombre de non lues
      state.unreadCount = state.notifications.filter(n => !n.lue).length
    },
    resetNotificationState: (_state) => {
      return { ...initialState }
    },
  },
})

export const {
  setNotifications,
  addNotification,
  updateNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  setNotificationFilters,
  clearNotificationFilters,
  setNotificationLoading,
  setNotificationError,
  clearNotificationError,
  setRealTimeEnabled,
  clearOldNotifications,
  resetNotificationState,
} = notificationSlice.actions

export default notificationSlice.reducer