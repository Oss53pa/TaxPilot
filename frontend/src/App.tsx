import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import ModernLayout from './components/shared/Layout'
import ErrorBoundary from './components/ui/ErrorBoundary'
import './styles/liasse-fixes.css'
import './styles/wcag-conformity.css'
import './styles/liasse-text-fix.css'

// LiasseDataProvider no longer used - all liasse routes redirect to /liasse-fiscale
import { Proph3tFloatingBall } from './components/prophet'

const PageLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
    <CircularProgress />
  </Box>
)

// Pages
const ModernDashboard = React.lazy(() => import('@/pages/dashboard/ModernDashboard'))
const AppDashboard = React.lazy(() => import('@/pages/dashboard/AppDashboard'))
const Parametrage = React.lazy(() => import('@/pages/Parametrage'))
const ModernImportBalance = React.lazy(() => import('@/pages/import/ModernImportBalance'))
const ImportHistoryPage = React.lazy(() => import('@/pages/import/ImportHistoryPage'))
const ModernBalance = React.lazy(() => import('@/pages/balance/ModernBalance'))
const PlanSYSCOHADARevise = React.lazy(() => import('@/pages/plans/PlanSYSCOHADARevise'))
const OperationsSpecifiques = React.lazy(() => import('@/pages/plans/OperationsSpecifiques'))
// const LiasseFiscaleOfficial = React.lazy(() => import('@/pages/liasse/LiasseFiscaleOfficial'))
const LiasseFiscale = React.lazy(() => import('@/pages/liasse/LiasseFiscale'))
const ModernDocuments = React.lazy(() => import('@/pages/documents/ModernDocuments'))
const ModernGeneration = React.lazy(() => import('@/pages/generation/ModernGeneration'))
const ModernAudit = React.lazy(() => import('@/pages/audit/ModernAudit'))
const ControlPointsManager = React.lazy(() => import('@/pages/audit/ControlPointsManager'))
const LiasseControlInterface = React.lazy(() => import('@/pages/validation/LiasseControlInterface'))
const ModernTeledeclaration = React.lazy(() => import('@/pages/teledeclaration/ModernTeledeclaration'))
const ModernCompliance = React.lazy(() => import('@/pages/compliance/ModernCompliance'))
const ModernFiscalCalendar = React.lazy(() => import('@/pages/calendar/ModernFiscalCalendar'))
const ModernTemplates = React.lazy(() => import('@/pages/templates/ModernTemplates'))
const ModernConsolidation = React.lazy(() => import('@/pages/consolidation/ModernConsolidation'))
const ModernReporting = React.lazy(() => import('@/pages/reporting/ModernReporting'))
const ModernVeilleReglementaire = React.lazy(() => import('@/pages/veille/ModernVeilleReglementaire'))
const ModernCollaboration = React.lazy(() => import('@/pages/collaboration/ModernCollaboration'))
const ModernIntegrations = React.lazy(() => import('@/pages/integrations/ModernIntegrations'))
const ModernSecurity = React.lazy(() => import('@/pages/security/ModernSecurity'))
const OrganizationWrapper = React.lazy(() => import('@/pages/organization/OrganizationWrapper'))
const OrganizationMembersPage = React.lazy(() => import('@/pages/organization/OrganizationMembersPage'))
const SubscriptionPage = React.lazy(() => import('@/pages/organization/SubscriptionPage'))
const InvitationsPage = React.lazy(() => import('@/pages/organization/InvitationsPage'))

import { useAuthStore } from './store/authStore'
import TestComponents from './components/shared/TestComponents'
import ButtonTest from './components/debug/ButtonTest'

/** Wrapper: page avec sidebar */
const WithSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ModernLayout>
    {children}
  </ModernLayout>
)

/** Shortcut */
const S: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WithSidebar>{children}</WithSidebar>
)

// Purge seed/mock data from FiscaSync-Lite on first run
function purgeSeedData() {
  const PURGED_KEY = 'fiscasync_seed_purged'
  if (localStorage.getItem(PURGED_KEY)) return
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('fiscasync_db_')) keysToRemove.push(key)
  }
  if (keysToRemove.length > 0) {
    keysToRemove.forEach(k => localStorage.removeItem(k))
    console.log(`[FiscaSync] Purged ${keysToRemove.length} seed data keys:`, keysToRemove)
  }
  localStorage.setItem(PURGED_KEY, new Date().toISOString())
}

function App() {
  const { checkAuth } = useAuthStore()

  React.useEffect(() => {
    checkAuth()
    purgeSeedData()
  }, [checkAuth])

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing page - SANS sidebar */}
          <Route path="/" element={<ModernDashboard />} />

          {/* Toutes les pages app - AVEC sidebar */}
          <Route path="/dashboard" element={<S><AppDashboard /></S>} />
          <Route path="/parametrage/*" element={<S><Parametrage /></S>} />
          <Route path="/import-balance" element={<S><ModernImportBalance /></S>} />
          <Route path="/import-history" element={<S><ImportHistoryPage /></S>} />
          <Route path="/balance" element={<S><ModernBalance /></S>} />
          <Route path="/plans-comptables" element={<S><PlanSYSCOHADARevise /></S>} />
          <Route path="/plan-syscohada" element={<S><PlanSYSCOHADARevise /></S>} />
          <Route path="/operations-syscohada" element={<S><OperationsSpecifiques /></S>} />

          <Route path="/liasse" element={<Navigate to="/liasse-fiscale" replace />} />
          <Route path="/production-liasse" element={<Navigate to="/liasse-fiscale" replace />} />
          <Route path="/liasse-complete" element={<Navigate to="/liasse-fiscale" replace />} />
          <Route path="/direct-liasse" element={<Navigate to="/liasse-fiscale" replace />} />
          <Route path="/liasse-fiscale" element={<S><LiasseFiscale /></S>} />
          <Route path="/documents" element={<S><ModernDocuments /></S>} />
          <Route path="/generation" element={<S><ModernGeneration /></S>} />

          <Route path="/audit" element={<S><ModernAudit /></S>} />
          <Route path="/control-points" element={<S><ControlPointsManager /></S>} />
          <Route path="/validation-liasse" element={<S><LiasseControlInterface /></S>} />
          <Route path="/teledeclaration" element={<S><ModernTeledeclaration /></S>} />
          <Route path="/compliance" element={<S><ModernCompliance /></S>} />
          <Route path="/calendar" element={<S><ModernFiscalCalendar /></S>} />

          <Route path="/templates" element={<S><ModernTemplates /></S>} />
          <Route path="/consolidation" element={<S><ModernConsolidation /></S>} />
          <Route path="/reporting" element={<S><ModernReporting /></S>} />
          <Route path="/veille" element={<S><ModernVeilleReglementaire /></S>} />

          <Route path="/collaboration" element={<S><ModernCollaboration /></S>} />
          <Route path="/integrations" element={<S><ModernIntegrations /></S>} />
          <Route path="/security" element={<S><ModernSecurity /></S>} />

          <Route path="/organization/:slug/members" element={<S><OrganizationWrapper>{(slug) => <OrganizationMembersPage organizationSlug={slug} />}</OrganizationWrapper></S>} />
          <Route path="/organization/:slug/subscription" element={<S><OrganizationWrapper>{(slug) => <SubscriptionPage organizationSlug={slug} />}</OrganizationWrapper></S>} />
          <Route path="/organization/:slug/invitations" element={<S><OrganizationWrapper>{(slug) => <InvitationsPage organizationSlug={slug} />}</OrganizationWrapper></S>} />
          <Route path="/settings/members" element={<S><OrganizationWrapper>{(slug) => <OrganizationMembersPage organizationSlug={slug} />}</OrganizationWrapper></S>} />
          <Route path="/settings/subscription" element={<S><OrganizationWrapper>{(slug) => <SubscriptionPage organizationSlug={slug} />}</OrganizationWrapper></S>} />
          <Route path="/settings/invitations" element={<S><OrganizationWrapper>{(slug) => <InvitationsPage organizationSlug={slug} />}</OrganizationWrapper></S>} />

          <Route path="/test" element={<S><TestComponents /></S>} />
          <Route path="/debug" element={<S><ButtonTest /></S>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Proph3tFloatingBall />
    </ErrorBoundary>
  )
}

export default App
