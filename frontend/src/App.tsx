import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box, Typography, Chip } from '@mui/material'
import ModernLayout from './components/shared/Layout'
import ErrorBoundary from './components/ui/ErrorBoundary'
import DossierGuard from './components/guards/DossierGuard'
import AuthGuard from './components/guards/AuthGuard'

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
const SupportPage = React.lazy(() => import('@/pages/support/SupportPage'))
const FAQPage = React.lazy(() => import('@/pages/support/FAQPage'))
const FormationPage = React.lazy(() => import('@/pages/formation/FormationPage'))
const DocumentationPage = React.lazy(() => import('@/pages/documentation/DocumentationPage'))
const ApiKeysPage = React.lazy(() => import('@/pages/parametrage/ApiKeysPage'))
const ApiDocsPage = React.lazy(() => import('@/pages/documentation/ApiDocsPage'))
const ModernVeilleReglementaire = React.lazy(() => import('@/pages/veille/ModernVeilleReglementaire'))
const ModernCollaboration = React.lazy(() => import('@/pages/collaboration/ModernCollaboration'))
const ModernIntegrations = React.lazy(() => import('@/pages/integrations/ModernIntegrations'))
const ModernSecurity = React.lazy(() => import('@/pages/security/ModernSecurity'))
const OrganizationWrapper = React.lazy(() => import('@/pages/organization/OrganizationWrapper'))
const OrganizationMembersPage = React.lazy(() => import('@/pages/organization/OrganizationMembersPage'))
const SubscriptionPage = React.lazy(() => import('@/pages/organization/SubscriptionPage'))
const InvitationsPage = React.lazy(() => import('@/pages/organization/InvitationsPage'))
const TeamSettingsPage = React.lazy(() => import('@/pages/settings/TeamSettingsPage'))

// Legal pages
const MentionsLegales = React.lazy(() => import('@/pages/legal/MentionsLegales'))
const CGU = React.lazy(() => import('@/pages/legal/CGU'))
const PolitiqueConfidentialite = React.lazy(() => import('@/pages/legal/PolitiqueConfidentialite'))

// P1: Onboarding & dossiers
const ModeSelection = React.lazy(() => import('@/pages/onboarding/ModeSelection'))
const OnboardingWizard = React.lazy(() => import('@/pages/onboarding/OnboardingWizard'))
const DossiersPage = React.lazy(() => import('@/pages/dossiers/DossiersPage'))

// P2-3: Auth pages
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ExternalAuthPage = React.lazy(() => import('@/pages/auth/ExternalAuthPage'))
const Landing = React.lazy(() => import('@/pages/public/Landing'))
const Modules = React.lazy(() => import('@/pages/public/Modules'))
const Pricing = React.lazy(() => import('@/pages/public/Pricing'))
const Demo = React.lazy(() => import('@/pages/public/Demo'))
const DemoPage = React.lazy(() => import('@/pages/DemoPage'))
const FAQ = React.lazy(() => import('@/pages/public/FAQ'))
const Contact = React.lazy(() => import('@/pages/public/Contact'))
const Blog = React.lazy(() => import('@/pages/public/Blog'))
const About = React.lazy(() => import('@/pages/public/About'))

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

/** Shortcut: sidebar only (no dossier guard) — requires authentication */
const S: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard><WithSidebar>{children}</WithSidebar></AuthGuard>
)

/** Shortcut: sidebar + dossier guard (cabinet mode requires active dossier) — requires authentication */
const DS: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard>
    <WithSidebar>
      <DossierGuard>{children}</DossierGuard>
    </WithSidebar>
  </AuthGuard>
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
  const { initialize, isAuthenticated, user } = useAuthStore()
  const { userMode: storedMode, onboardingCompleted, setUserMode } = useModeStore()

  React.useEffect(() => {
    initialize()
    purgeSeedData()
  }, [initialize])

  // Source de vérité: profiles.user_type Supabase (défini à l'achat via Atlas Studio).
  // Si présent, on hydrate le modeStore local pour rester rétro-compat avec les composants
  // qui consomment encore useModeStore. Sinon (legacy/edge cases), on retombe sur le store local.
  React.useEffect(() => {
    if (user?.userType && user.userType !== storedMode) {
      setUserMode(user.userType)
    }
  }, [user?.userType, storedMode, setUserMode])

  // userMode effectif = Supabase d'abord, store local en fallback (auto-hydraté au login)
  const userMode = user?.userType ?? storedMode

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public pages (landing, modules, pricing, demo, faq, contact) */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/demo-legacy" element={<Demo />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />

          {/* P2-3: Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth" element={<ExternalAuthPage />} />

          {/* P1-1: First launch → mode selection if no mode chosen yet */}
          <Route path="/mode-selection" element={<AuthGuard><ModeSelection /></AuthGuard>} />
          <Route path="/onboarding" element={<AuthGuard><OnboardingWizard /></AuthGuard>} />

          {/* "/" — Landing for visitors, redirect for authenticated users */}
          <Route path="/" element={
            !isAuthenticated ? <Landing /> :
            !userMode ? <Navigate to="/mode-selection" replace /> :
            !onboardingCompleted ? <Navigate to="/onboarding" replace /> :
            userMode === 'cabinet' ? <Navigate to="/dossiers" replace /> :
            <Navigate to="/dashboard" replace />
          } />
          <Route path="/accueil" element={
            <AuthGuard>
              {!userMode ? <Navigate to="/mode-selection" replace /> :
              !onboardingCompleted ? <Navigate to="/onboarding" replace /> :
              <ModernDashboard />}
            </AuthGuard>
          } />

          {/* Pages accessibles sans dossier actif (cabinet: liste dossiers, paramètres) */}
          <Route path="/dossiers" element={<S><DossiersPage /></S>} />
          <Route path="/veille" element={<S><ModernVeilleReglementaire /></S>} />
          <Route path="/collaboration" element={<S><ModernCollaboration /></S>} />
          <Route path="/integrations" element={<S><ModernIntegrations /></S>} />
          <Route path="/settings/team" element={<S><TeamSettingsPage /></S>} />
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

          {/* Support & Formation */}
          <Route path="/support" element={<S><SupportPage /></S>} />
          <Route path="/faq" element={<S><FAQPage /></S>} />
          <Route path="/formation" element={<S><FormationPage /></S>} />
          <Route path="/documentation" element={<S><DocumentationPage /></S>} />

          {/* Public API: management UI requires auth, but the docs page is public */}
          <Route path="/parametrage/api-keys" element={<S><ApiKeysPage /></S>} />
          <Route path="/api-docs" element={<ApiDocsPage />} />

          {/* Debug routes removed for production */}

          {/* Legal pages — publicly accessible */}
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/confidentialite" element={<PolitiqueConfidentialite />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
