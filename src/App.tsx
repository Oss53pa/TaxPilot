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

// FiscaSync-Lite: Données locales au lieu du backend
import { seedDatabase } from './data/seedData'
import { LiasseDataProvider } from './components/liasse/DataProvider'

// Initialiser la base de données locale au chargement
seedDatabase()

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

// Modules de base
const Parametrage = React.lazy(() => import('@/pages/Parametrage'))
const ModernImportBalance = React.lazy(() => import('@/pages/import/ModernImportBalance'))
const ModernBalance = React.lazy(() => import('@/pages/balance/ModernBalance'))
const PlanSYSCOHADARevise = React.lazy(() => import('@/pages/plans/PlanSYSCOHADARevise'))

// Modules de production - VERSION CONSOLIDÉE ✅
const LiasseFiscaleOfficial = React.lazy(() => import('@/pages/liasse/LiasseFiscaleOfficial'))
const ModernDocuments = React.lazy(() => import('@/pages/documents/ModernDocuments'))
const ModernGeneration = React.lazy(() => import('@/pages/generation/ModernGeneration'))

// ANCIENNES VERSIONS (à déprécier) ⚠️
// const DirectLiasseAccess = React.lazy(() => import('@/pages/DirectLiasseAccess'))
// const ModernLiasseComplete = React.lazy(() => import('@/pages/liasse/ModernLiasseComplete'))
// const ModernLiasseProduction = React.lazy(() => import('@/pages/liasse/ModernLiasseProduction'))
// const LiasseCompleteFinal = React.lazy(() => import('@/pages/LiasseCompleteFinal'))

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

// Modules Organization (Multi-tenant SaaS) - NOUVEAU!
const OrganizationWrapper = React.lazy(() => import('@/pages/organization/OrganizationWrapper'))
const OrganizationMembersPage = React.lazy(() => import('@/pages/organization/OrganizationMembersPage'))
const SubscriptionPage = React.lazy(() => import('@/pages/organization/SubscriptionPage'))
const InvitationsPage = React.lazy(() => import('@/pages/organization/InvitationsPage'))

// Pages publiques (non authentifié)
const Landing = React.lazy(() => import('@/pages/public/Landing'))
const Pricing = React.lazy(() => import('@/pages/public/Pricing'))
const Signup = React.lazy(() => import('@/pages/public/Signup'))

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
  }, [checkAuth])

  // Routes publiques - sans authentification requise
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    )
  }

  // Routes authentifiées - avec layout
  return (
    <ErrorBoundary>
      {/* <UniversalBackendProvider> */}
        <ModernLayout>
          <OnboardingTour />
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/" element={<Navigate to="/liasse" replace />} />
            <Route path="/dashboard" element={<ModernDashboard />} />

            {/* Modules de base */}
            <Route path="/parametrage/*" element={<Parametrage />} />
            <Route path="/import-balance" element={<ModernImportBalance />} />
            <Route path="/balance" element={<ModernBalance />} />
            <Route path="/plans-comptables" element={<PlanSYSCOHADARevise />} />
            <Route path="/plan-syscohada" element={<PlanSYSCOHADARevise />} />

            {/* Modules de production - VERSION CONSOLIDÉE ✅ */}
            <Route path="/liasse" element={<LiasseDataProvider><LiasseFiscaleOfficial /></LiasseDataProvider>} />
            <Route path="/production-liasse" element={<LiasseDataProvider><LiasseFiscaleOfficial /></LiasseDataProvider>} />
            <Route path="/liasse-complete" element={<LiasseDataProvider><LiasseFiscaleOfficial /></LiasseDataProvider>} />
            <Route path="/direct-liasse" element={<LiasseDataProvider><LiasseFiscaleOfficial /></LiasseDataProvider>} />
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

            {/* Modules Organization (Multi-tenant SaaS) - NOUVEAU! */}
            <Route
              path="/organization/:slug/members"
              element={
                <OrganizationWrapper>
                  {(slug) => <OrganizationMembersPage organizationSlug={slug} />}
                </OrganizationWrapper>
              }
            />
            <Route
              path="/organization/:slug/subscription"
              element={
                <OrganizationWrapper>
                  {(slug) => <SubscriptionPage organizationSlug={slug} />}
                </OrganizationWrapper>
              }
            />
            <Route
              path="/organization/:slug/invitations"
              element={
                <OrganizationWrapper>
                  {(slug) => <InvitationsPage organizationSlug={slug} />}
                </OrganizationWrapper>
              }
            />
            {/* Routes alternatives sans slug (utilise l'org courante) */}
            <Route
              path="/settings/members"
              element={
                <OrganizationWrapper>
                  {(slug) => <OrganizationMembersPage organizationSlug={slug} />}
                </OrganizationWrapper>
              }
            />
            <Route
              path="/settings/subscription"
              element={
                <OrganizationWrapper>
                  {(slug) => <SubscriptionPage organizationSlug={slug} />}
                </OrganizationWrapper>
              }
            />
            <Route
              path="/settings/invitations"
              element={
                <OrganizationWrapper>
                  {(slug) => <InvitationsPage organizationSlug={slug} />}
                </OrganizationWrapper>
              }
            />

            {/* Pages de test */}
            <Route path="/test" element={<TestComponents />} />
            <Route path="/debug" element={<ButtonTest />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
            </Suspense>
          </ModernLayout>
      {/* </UniversalBackendProvider> */}
    </ErrorBoundary>
  )
}

export default App