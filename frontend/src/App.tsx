import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box, Typography, Paper, Chip } from '@mui/material'
import ModernLayout from './components/shared/Layout'
import ErrorBoundary from './components/ui/ErrorBoundary'
import DossierGuard from './components/guards/DossierGuard'

import './styles/liasse-fixes.css'
import './styles/wcag-conformity.css'
import './styles/liasse-text-fix.css'


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
const ArchivesPage = React.lazy(() => import('@/pages/archives/ArchivesPage'))
const ModernVeilleReglementaire = React.lazy(() => import('@/pages/veille/ModernVeilleReglementaire'))
const ModernCollaboration = React.lazy(() => import('@/pages/collaboration/ModernCollaboration'))
const ModernIntegrations = React.lazy(() => import('@/pages/integrations/ModernIntegrations'))
const ModernSecurity = React.lazy(() => import('@/pages/security/ModernSecurity'))
const OrganizationWrapper = React.lazy(() => import('@/pages/organization/OrganizationWrapper'))
const OrganizationMembersPage = React.lazy(() => import('@/pages/organization/OrganizationMembersPage'))
const SubscriptionPage = React.lazy(() => import('@/pages/organization/SubscriptionPage'))
const InvitationsPage = React.lazy(() => import('@/pages/organization/InvitationsPage'))

// P1: Onboarding & dossiers
const ModeSelection = React.lazy(() => import('@/pages/onboarding/ModeSelection'))
const OnboardingWizard = React.lazy(() => import('@/pages/onboarding/OnboardingWizard'))
const DossiersPage = React.lazy(() => import('@/pages/dossiers/DossiersPage'))

// P2-3: Auth pages
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'))

import { useAuthStore } from './store/authStore'
import { useModeStore } from './store/modeStore'
import { Construction as ConstructionIcon, People as PeopleIcon, CreditCard, Mail } from '@mui/icons-material'

/** Placeholder pour les modules admin pas encore connectés à Supabase */
const AdminPlaceholder: React.FC<{ title: string; description: string; icon: string }> = ({ title, description, icon }) => {
  const icons: Record<string, React.ReactNode> = {
    people: <PeopleIcon sx={{ fontSize: 48, color: '#9e9e9e' }} />,
    subscription: <CreditCard sx={{ fontSize: 48, color: '#9e9e9e' }} />,
    invite: <Mail sx={{ fontSize: 48, color: '#9e9e9e' }} />,
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
      {icons[icon] || <ConstructionIcon sx={{ fontSize: 48, color: '#9e9e9e' }} />}
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#424242' }}>{title}</Typography>
      <Typography variant="body1" sx={{ color: '#757575', textAlign: 'center', maxWidth: 480 }}>{description}</Typography>
      <Chip label="Disponible avec Supabase" size="small" sx={{ mt: 1, bgcolor: '#f5f5f5', color: '#757575' }} />
    </Box>
  )
}

/** Wrapper: page avec sidebar */
const WithSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ModernLayout>
    {children}
  </ModernLayout>
)

/** Shortcut: sidebar only (no dossier guard) */
const S: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WithSidebar>{children}</WithSidebar>
)

/** Shortcut: sidebar + dossier guard (cabinet mode requires active dossier) */
const DS: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WithSidebar>
    <DossierGuard>{children}</DossierGuard>
  </WithSidebar>
)

// Purge seed/mock data from FiscaSync-Lite on first run
function purgeSeedData() {
  const PURGED_KEY = 'fiscasync_seed_purged_v3'
  if (localStorage.getItem(PURGED_KEY)) return
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.startsWith('fiscasync_db_') ||
      key.startsWith('fiscasync_audit_') ||
      key.startsWith('fiscasync_collab_') ||
      key.startsWith('fiscasync_security_') ||
      key.startsWith('fiscasync_veille_')
    )) keysToRemove.push(key)
  }
  if (keysToRemove.length > 0) {
    keysToRemove.forEach(k => localStorage.removeItem(k))
    console.log(`[FiscaSync] Purged ${keysToRemove.length} seed data keys:`, keysToRemove)
  }
  localStorage.setItem(PURGED_KEY, new Date().toISOString())
}

function App() {
  const { checkAuth } = useAuthStore()
  const { userMode, onboardingCompleted } = useModeStore()

  React.useEffect(() => {
    checkAuth()
    purgeSeedData()
  }, [checkAuth])

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* P2-3: Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* P1-1: First launch → mode selection if no mode chosen yet */}
          <Route path="/mode-selection" element={<ModeSelection />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />

          {/* Landing page — redirect based on mode */}
          <Route path="/" element={
            !userMode ? <Navigate to="/mode-selection" replace /> :
            !onboardingCompleted ? <Navigate to="/onboarding" replace /> :
            userMode === 'cabinet' ? <Navigate to="/dossiers" replace /> :
            <Navigate to="/dashboard" replace />
          } />
          <Route path="/accueil" element={
            !userMode ? <Navigate to="/mode-selection" replace /> :
            !onboardingCompleted ? <Navigate to="/onboarding" replace /> :
            <ModernDashboard />
          } />

          {/* Pages accessibles sans dossier actif (cabinet: liste dossiers, paramètres) */}
          <Route path="/dossiers" element={<S><DossiersPage /></S>} />
          <Route path="/veille" element={<S><ModernVeilleReglementaire /></S>} />
          <Route path="/collaboration" element={<S><ModernCollaboration /></S>} />
          <Route path="/integrations" element={<S><ModernIntegrations /></S>} />
          <Route path="/security" element={<S><ModernSecurity /></S>} />
          <Route path="/organization/:slug/members" element={<S><OrganizationWrapper>{(slug) => <OrganizationMembersPage organizationSlug={slug} />}</OrganizationWrapper></S>} />
          <Route path="/organization/:slug/subscription" element={<S><OrganizationWrapper>{(slug) => <SubscriptionPage organizationSlug={slug} />}</OrganizationWrapper></S>} />
          <Route path="/organization/:slug/invitations" element={<S><OrganizationWrapper>{(slug) => <InvitationsPage organizationSlug={slug} />}</OrganizationWrapper></S>} />
          <Route path="/settings/members" element={<S><AdminPlaceholder title="Membres & Rôles" description="Gérez les collaborateurs de votre cabinet, attribuez des rôles (administrateur, collaborateur, observateur) et contrôlez les accès." icon="people" /></S>} />
          <Route path="/settings/subscription" element={<S><AdminPlaceholder title="Abonnement" description="Consultez votre plan actuel, suivez vos quotas (liasses, stockage) et gérez la facturation." icon="subscription" /></S>} />
          <Route path="/settings/invitations" element={<S><AdminPlaceholder title="Invitations" description="Envoyez des invitations par email à vos collaborateurs pour rejoindre le cabinet." icon="invite" /></S>} />

          {/* Pages métier — nécessitent un dossier actif en mode cabinet */}
          <Route path="/dashboard" element={<DS><AppDashboard /></DS>} />
          <Route path="/parametrage/*" element={<DS><Parametrage /></DS>} />
          <Route path="/import-balance" element={<DS><ModernImportBalance /></DS>} />
          <Route path="/import-history" element={<DS><ImportHistoryPage /></DS>} />
          <Route path="/balance" element={<DS><ModernBalance /></DS>} />
          <Route path="/plans-comptables" element={<DS><PlanSYSCOHADARevise /></DS>} />
          <Route path="/plan-syscohada" element={<DS><PlanSYSCOHADARevise /></DS>} />
          <Route path="/operations-syscohada" element={<DS><OperationsSpecifiques /></DS>} />

          <Route path="/liasse" element={<Navigate to="/liasse-fiscale" replace />} />
          <Route path="/production-liasse" element={<Navigate to="/liasse-fiscale" replace />} />
          <Route path="/liasse-complete" element={<Navigate to="/liasse-fiscale" replace />} />
          <Route path="/direct-liasse" element={<Navigate to="/liasse-fiscale" replace />} />
          <Route path="/liasse-fiscale" element={<DS><LiasseFiscale /></DS>} />
          <Route path="/documents" element={<DS><ModernDocuments /></DS>} />
          <Route path="/generation" element={<DS><ModernGeneration /></DS>} />

          <Route path="/audit" element={<DS><ModernAudit /></DS>} />
          <Route path="/control-points" element={<DS><ControlPointsManager /></DS>} />
          <Route path="/validation-liasse" element={<DS><LiasseControlInterface /></DS>} />
          <Route path="/teledeclaration" element={<DS><ModernTeledeclaration /></DS>} />
          <Route path="/compliance" element={<DS><ModernCompliance /></DS>} />
          <Route path="/calendar" element={<DS><ModernFiscalCalendar /></DS>} />

          <Route path="/templates" element={<DS><ModernTemplates /></DS>} />
          <Route path="/consolidation" element={<DS><ModernConsolidation /></DS>} />
          <Route path="/reporting" element={<DS><ModernReporting /></DS>} />
          <Route path="/archives" element={<DS><ArchivesPage /></DS>} />

          {/* Debug routes removed for production */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
