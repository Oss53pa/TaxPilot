import './i18n'
import { logger } from '@/utils/logger'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, CssBaseline, styled } from '@mui/material'
import { SnackbarProvider, MaterialDesignContent } from 'notistack'
import { Provider } from 'react-redux'
import App from './App.tsx'
import { store } from './store/index.ts'
import { fiscasyncPalette, createFiscaSyncTheme } from './theme/fiscasyncTheme.ts'
import { useThemeStore } from './store/themeStore.ts'
import './index.css'

// Notistack styled snackbar variants - prevent white-on-white from MuiPaper override
const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  '&.notistack-MuiContent-success': {
    backgroundColor: fiscasyncPalette.success,
    color: '#ffffff',
  },
  '&.notistack-MuiContent-error': {
    backgroundColor: fiscasyncPalette.error,
    color: '#ffffff',
  },
  '&.notistack-MuiContent-warning': {
    backgroundColor: fiscasyncPalette.warning,
    color: '#ffffff',
  },
  '&.notistack-MuiContent-info': {
    backgroundColor: fiscasyncPalette.info,
    color: '#ffffff',
  },
  '&.notistack-MuiContent-default': {
    backgroundColor: fiscasyncPalette.primary900,
    color: '#ffffff',
  },
}))
import './styles/contrast-fix.css'

/**
 * Sentry — initialisation différée hors du critical path.
 *
 * Avant ce fix : `import * as Sentry from '@sentry/react'` en eager + init()
 * synchrone au boot tirait Sentry (browser tracing + replay integration ≈
 * 50 KB minifié) dans le bundle main. Ralentit le TTI inutilement, surtout
 * en dev où tracesSampleRate était 1.0.
 *
 * Après : Sentry n'est chargé qu'en production via dynamic import +
 * requestIdleCallback (ou setTimeout fallback). Les erreurs survenues
 * pendant la fenêtre d'init différée sont bufferisées via _pendingErrors
 * et flushées au moment de l'init.
 */
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
const _pendingErrors: unknown[] = []
let _sentryReady: typeof import('@sentry/react') | null = null

function captureSafe(err: unknown) {
  if (_sentryReady) _sentryReady.captureException(err)
  else _pendingErrors.push(err)
}

if (sentryDsn && import.meta.env.MODE === 'production') {
  const initSentry = async () => {
    const Sentry = await import('@sentry/react')
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
    _sentryReady = Sentry
    // Flush buffered errors capturées avant l'init
    for (const err of _pendingErrors) Sentry.captureException(err)
    _pendingErrors.length = 0
  }

  const w = window as Window & { requestIdleCallback?: (cb: () => void) => void }
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(() => { void initSentry() })
  } else {
    setTimeout(() => { void initSentry() }, 2000)
  }
}

// Configuration du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: unknown) => {
        // Ne pas retry pour les erreurs d'authentification
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } }
          if (axiosError.response?.status === 401) return false
        }
        return failureCount < 3
      }
    }
  }
})

// Global unhandled promise rejection handler
// Prevents silent failures and logs errors for debugging
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection:', event.reason)
  if (sentryDsn) captureSafe(event.reason)
  event.preventDefault()
})

window.addEventListener('error', (event) => {
  logger.error('Global error:', event.error || event.message)
  if (sentryDsn) captureSafe(event.error)
})

function ThemedApp() {
  const { resolvedMode } = useThemeStore()
  const theme = React.useMemo(() => createFiscaSyncTheme(resolvedMode), [resolvedMode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={4000}
        Components={{
          success: StyledMaterialDesignContent,
          error: StyledMaterialDesignContent,
          warning: StyledMaterialDesignContent,
          info: StyledMaterialDesignContent,
          default: StyledMaterialDesignContent,
        }}
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
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemedApp />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)