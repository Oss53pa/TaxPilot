import { logger } from '@/utils/logger'
import * as Sentry from '@sentry/react'
/**
 * Error Boundary pour capturer les erreurs React et API
 */

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  reloading: boolean
}

/**
 * Détecte une erreur de chargement de chunk périmé. Survient quand un onglet
 * resté ouvert pointe vers d'anciens fichiers hashés (`*-XXXX.js`) qui n'existent
 * plus après un nouveau déploiement → l'import dynamique (React.lazy) échoue.
 * Messages selon le navigateur : Chrome « Failed to fetch dynamically imported
 * module », Firefox « error loading dynamically imported module », Safari
 * « Importing a module script failed ».
 */
function isChunkLoadError(error: Error | null): boolean {
  if (!error) return false
  if (error.name === 'ChunkLoadError') return true
  const msg = `${error.name}: ${error.message}`.toLowerCase()
  return (
    msg.includes('dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module')
  )
}

const RELOAD_TS_KEY = 'liasspilot:chunk-reload-ts'

/** Recharge la page au plus une fois par fenêtre de 10 s (anti-boucle). */
function reloadOnceForStaleChunk(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_TS_KEY) || 0)
    if (Date.now() - last > 10000) {
      sessionStorage.setItem(RELOAD_TS_KEY, String(Date.now()))
      window.location.reload()
      return true
    }
  } catch {
    // sessionStorage indisponible (mode privé strict) → recharge quand même une fois
    window.location.reload()
    return true
  }
  return false
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    reloading: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      // Chunk périmé → on affichera un écran « mise à jour » (pas l'erreur), le
      // rechargement est déclenché dans componentDidCatch.
      reloading: isChunkLoadError(error)
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Reprise automatique après déploiement : recharger pour récupérer le nouvel
    // index.html (SW navigation = network-first) et les bons fichiers hashés.
    if (isChunkLoadError(error) && reloadOnceForStaleChunk()) {
      return
    }

    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } })
    logger.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      reloading: false
    })
  }

  public render() {
    if (this.state.hasError) {
      // Chunk périmé après déploiement : écran neutre de rechargement plutôt que
      // l'UI d'erreur (le reload est déjà déclenché dans componentDidCatch).
      if (this.state.reloading) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div
                style={{
                  width: 28, height: 28, border: '3px solid #e5e5e5', borderTopColor: '#0f766e',
                  borderRadius: '50%', margin: '0 auto 12px', animation: 'liasspilot-spin 0.8s linear infinite',
                }}
              />
              <p className="text-sm text-gray-600">Nouvelle version disponible — mise à jour…</p>
              <style>{'@keyframes liasspilot-spin{to{transform:rotate(360deg)}}'}</style>
            </div>
          </div>
        )
      }

      // Fallback UI personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback
      }

      // UI d'erreur par défaut
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.768 0L3.046 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Une erreur s'est produite
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                L'application a rencontré une erreur inattendue. Nos équipes ont été notifiées.
              </p>

              {!import.meta.env.PROD && this.state.error && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    Détails techniques (développement)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                    <div className="text-red-600 font-semibold mb-2">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <pre className="whitespace-pre-wrap text-gray-700">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Accueil
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary