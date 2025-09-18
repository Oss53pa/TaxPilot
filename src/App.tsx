import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import ModernLayout from './components/shared/Layout'
import ErrorBoundary from './components/ui/ErrorBoundary'
import './styles/liasse-fixes.css'
import './styles/sidebar-fix.css'
import './styles/wcag-conformity.css'
import './styles/liasse-text-fix.css'
import './styles/sidebar-ultimate-fix.css'

// INTÉGRATION BACKEND GLOBALE - Active automatiquement pour TOUS les composants
import { initializeBackendConnections } from './config/globalBackendIntegration'
import { LiasseDataProvider } from './components/liasse/DataProvider'
import { UniversalBackendProvider } from './components/UniversalBackendWrapper'

// Composant de loading pour le lazy loading
const PageLoader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="400px"
  >
    <CircularProgress />
  </Box>
)

// Lazy loading des pages principales avec connexion backend automatique
const ModernDashboard = React.lazy(() => import('@/pages/dashboard/ModernDashboard'))

// Accès direct aux liasses
const DirectLiasseAccess = React.lazy(() => import('@/pages/DirectLiasseAccess'))

// Modules de base
const Parametrage = React.lazy(() => import('@/pages/Parametrage'))
const ModernImportBalance = React.lazy(() => import('@/pages/import/ModernImportBalance'))
const ModernBalance = React.lazy(() => import('@/pages/balance/ModernBalance'))
const PlanSYSCOHADARevise = React.lazy(() => import('@/pages/plans/PlanSYSCOHADARevise'))

// Modules de production
const ModernLiasseComplete = React.lazy(() => import('@/pages/liasse/ModernLiasseComplete'))
const ModernLiasseProduction = React.lazy(() => import('@/pages/liasse/ModernLiasseProduction'))
const LiasseCompleteFinal = React.lazy(() => import('@/pages/LiasseCompleteFinal'))
const ModernDocuments = React.lazy(() => import('@/pages/documents/ModernDocuments'))
const ModernGeneration = React.lazy(() => import('@/pages/generation/ModernGeneration'))

// Modules de conformité
const ModernAudit = React.lazy(() => import('@/pages/audit/ModernAudit'))
const ControlPointsManager = React.lazy(() => import('@/pages/audit/ControlPointsManager'))
const LiasseControlInterface = React.lazy(() => import('@/pages/validation/LiasseControlInterface'))
const ModernTeledeclaration = React.lazy(() => import('@/pages/teledeclaration/ModernTeledeclaration'))
const ModernCompliance = React.lazy(() => import('@/pages/compliance/ModernCompliance'))
const ModernFiscalCalendar = React.lazy(() => import('@/pages/calendar/ModernFiscalCalendar'))

// Modules avancés
const ModernTemplates = React.lazy(() => import('@/pages/templates/ModernTemplates'))
const ModernConsolidation = React.lazy(() => import('@/pages/consolidation/ModernConsolidation'))
const ModernReporting = React.lazy(() => import('@/pages/reporting/ModernReporting'))
const ModernVeilleReglementaire = React.lazy(() => import('@/pages/veille/ModernVeilleReglementaire'))

// Modules collaboration et intégration
const ModernCollaboration = React.lazy(() => import('@/pages/collaboration/ModernCollaboration'))
const ModernIntegrations = React.lazy(() => import('@/pages/integrations/ModernIntegrations'))
const ModernSecurity = React.lazy(() => import('@/pages/security/ModernSecurity'))

// Authentification
import Login from './pages/auth/Login'
import { useAuthStore } from './store/authStore'
import OnboardingTour from './components/onboarding/OnboardingTour'

// Composants de test
import TestComponents from './components/shared/TestComponents'
import ButtonTest from './components/debug/ButtonTest'

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore()

  React.useEffect(() => {
    // Vérifier l'authentification au démarrage
    checkAuth()

    // INITIALISER LES CONNEXIONS BACKEND GLOBALES
    if (isAuthenticated) {
      console.log('🚀 Initializing global backend connections...')
      initializeBackendConnections()
    }
  }, [checkAuth, isAuthenticated])

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    // ThemeProvider et CssBaseline déjà fournis par main.tsx
    <ErrorBoundary>
      <UniversalBackendProvider>
        <ModernLayout>
          <OnboardingTour />
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/" element={<Navigate to="/direct-liasse" replace />} />
            <Route path="/dashboard" element={<ModernDashboard />} />
            <Route path="/direct-liasse" element={<DirectLiasseAccess />} />

            {/* Modules de base */}
            <Route path="/parametrage/*" element={<Parametrage />} />
            <Route path="/import-balance" element={<ModernImportBalance />} />
            <Route path="/balance" element={<ModernBalance />} />
            <Route path="/plans-comptables" element={<PlanSYSCOHADARevise />} />
            <Route path="/plan-syscohada" element={<PlanSYSCOHADARevise />} />

            {/* Modules de production - AVEC DONNÉES BACKEND */}
            <Route path="/liasse" element={<LiasseDataProvider><ModernLiasseComplete /></LiasseDataProvider>} />
            <Route path="/production-liasse" element={<LiasseDataProvider><ModernLiasseProduction /></LiasseDataProvider>} />
            <Route path="/liasse-complete-final" element={<LiasseDataProvider><LiasseCompleteFinal /></LiasseDataProvider>} />
            <Route path="/documents" element={<ModernDocuments />} />
            <Route path="/generation" element={<ModernGeneration />} />

            {/* Modules de conformité */}
            <Route path="/audit" element={<ModernAudit />} />
            <Route path="/control-points" element={<ControlPointsManager />} />
            <Route path="/validation-liasse" element={<LiasseControlInterface />} />
            <Route path="/teledeclaration" element={<ModernTeledeclaration />} />
            <Route path="/compliance" element={<ModernCompliance />} />
            <Route path="/calendar" element={<ModernFiscalCalendar />} />

            {/* Modules avancés */}
            <Route path="/templates" element={<ModernTemplates />} />
            <Route path="/consolidation" element={<ModernConsolidation />} />
            <Route path="/reporting" element={<ModernReporting />} />
            <Route path="/veille" element={<ModernVeilleReglementaire />} />

            {/* Modules collaboration et intégration */}
            <Route path="/collaboration" element={<ModernCollaboration />} />
            <Route path="/integrations" element={<ModernIntegrations />} />
            <Route path="/security" element={<ModernSecurity />} />

            {/* Pages de test */}
            <Route path="/test" element={<TestComponents />} />
            <Route path="/debug" element={<ButtonTest />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
            </Suspense>
          </ModernLayout>
      </UniversalBackendProvider>
    </ErrorBoundary>
  )
}

export default App