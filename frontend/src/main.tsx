import { logger } from '@/utils/logger'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { Provider } from 'react-redux'
import App from './App.tsx'
import { store } from './store/index.ts'
import fiscasyncTheme from './theme/fiscasyncTheme.ts'
import './index.css'
import './styles/contrast-fix.css'

// Configuration du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Ne pas retry pour les erreurs d'authentification
        if (error?.response?.status === 401) return false
        return failureCount < 3
      }
    }
  }
})

// Global unhandled promise rejection handler
// Prevents silent failures and logs errors for debugging
window.addEventListener('unhandledrejection', (event) => {
  logger.error('🚨 Unhandled promise rejection:', event.reason)

  // Log detailed error information for debugging
  if (event.reason instanceof Error) {
    logger.error('Error name:', event.reason.name)
    logger.error('Error message:', event.reason.message)
    logger.error('Error stack:', event.reason.stack)
  }

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // if (window.Sentry) {
  //   window.Sentry.captureException(event.reason)
  // }

  // Prevent the default browser error logging
  event.preventDefault()
})

// Global error handler for synchronous errors
window.addEventListener('error', (event) => {
  logger.error('🚨 Global error:', event.error || event.message)

  // TODO: Send to error tracking service
  // if (window.Sentry) {
  //   window.Sentry.captureException(event.error)
  // }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={fiscasyncTheme}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={4000}
          >
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <App />
            </BrowserRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)