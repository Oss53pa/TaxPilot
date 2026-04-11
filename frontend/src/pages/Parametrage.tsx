/**
 * Page de paramétrage de l'entreprise
 */

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
} from '@mui/material'
import {
  Business,
  People,
  AccountBalance,
  Calculate,
  Security,
  Notifications,
  Palette,
  Public,
  Backup,
  MenuBook,
  Description,
  RestartAlt,
  Flag,
} from '@mui/icons-material'
import EntrepriseSettings from '@/components/Parametrage/EntrepriseSettings'
import UserManagement from '@/components/Parametrage/UserManagement'
import PlanComptableSettings from '@/components/Parametrage/PlanComptableSettings'
import TauxFiscauxSettings from '@/components/Parametrage/TauxFiscauxSettings'
import SecuritySettings from '@/components/Parametrage/SecuritySettings'
import NotificationSettings from '@/components/Parametrage/NotificationSettings'
import ThemeSettings from '@/pages/ThemeSettings'
import RegionalSettings from '@/components/Parametrage/RegionalSettings'
import BackupRestoreSettings from '@/components/Parametrage/BackupRestoreSettings'
import DocumentationJuridique from '@/components/Parametrage/DocumentationJuridique'
import ResetSettings from '@/components/Parametrage/ResetSettings'
import BrandingPage from '@/pages/parametres/BrandingPage'
import FiscalConfigPage from '@/pages/parametrage/FiscalConfigPage'
import { TabPanel } from '@/components/shared/TabPanel'
import { FeatureGate, UpgradeBanner } from '@/components/gating'
import { useTenantPlan } from '@/hooks/useTenantPlan'
import { Lock as LockIcon } from '@mui/icons-material'

const Parametrage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { hasFeature } = useTenantPlan()
  const hasBranding = hasFeature('branding_cabinet')
  const hasTeamMgmt = hasFeature('gestion_equipe_cabinet')
  
  // Déterminer l'onglet actif basé sur l'URL
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/entreprise')) return 0
    if (path.includes('/utilisateurs')) return 1
    if (path.includes('/plans-comptables')) return 2
    if (path.includes('/taux-fiscaux')) return 3
    if (path.includes('/securite')) return 4
    if (path.includes('/notifications')) return 5
    if (path.includes('/theme')) return 6
    if (path.includes('/page-de-garde')) return 7
    if (path.includes('/regional')) return 8
    if (path.includes('/sauvegarde')) return 9
    if (path.includes('/documentation-juridique')) return 10
    if (path.includes('/reinitialisation')) return 11
    if (path.includes('/fiscal-config')) return 12
    return 0
  }

  const [activeTab, setActiveTab] = React.useState(getActiveTab())

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    
    const tabPaths = [
      '/parametrage/entreprise',
      '/parametrage/utilisateurs',
      '/parametrage/plans-comptables',
      '/parametrage/taux-fiscaux',
      '/parametrage/securite',
      '/parametrage/notifications',
      '/parametrage/theme',
      '/parametrage/page-de-garde',
      '/parametrage/regional',
      '/parametrage/sauvegarde',
      '/parametrage/documentation-juridique',
      '/parametrage/reinitialisation',
      '/parametrage/fiscal-config',
    ]
    
    navigate(tabPaths[newValue])
  }

  React.useEffect(() => {
    setActiveTab(getActiveTab())
  }, [location.pathname])

  return (
    <Box sx={{ width: '100%', height: '100%', px: 3, py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Paramétrage
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configuration de votre entreprise et de l'application
        </Typography>
      </Box>

      {/* Alertes de configuration */}
      <Alert 
        severity="warning" 
        sx={{ mb: 3 }}
      >
        Certains paramètres sont incomplets. Veuillez compléter la configuration pour optimiser votre expérience.
      </Alert>

      <Paper sx={{ width: '100%' }}>
        {/* Onglets de navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Paramétrage tabs"
          >
            <Tab
              label="Entreprise"
              icon={<Business />}
              iconPosition="start"
              id="parametrage-tab-0"
              aria-controls="parametrage-tabpanel-0"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Utilisateurs
                  {!hasTeamMgmt && <LockIcon sx={{ fontSize: 13, color: '#EF9F27' }} />}
                </Box>
              }
              icon={<People />}
              iconPosition="start"
              id="parametrage-tab-1"
              aria-controls="parametrage-tabpanel-1"
            />
            <Tab
              label="Plans Comptables"
              icon={<AccountBalance />}
              iconPosition="start"
              id="parametrage-tab-2"
              aria-controls="parametrage-tabpanel-2"
            />
            <Tab
              label="Taux Fiscaux"
              icon={<Calculate />}
              iconPosition="start"
              id="parametrage-tab-3"
              aria-controls="parametrage-tabpanel-3"
            />
            <Tab
              label="Sécurité"
              icon={<Security />}
              iconPosition="start"
              id="parametrage-tab-4"
              aria-controls="parametrage-tabpanel-4"
            />
            <Tab
              label="Notifications"
              icon={<Notifications />}
              iconPosition="start"
              id="parametrage-tab-5"
              aria-controls="parametrage-tabpanel-5"
            />
            <Tab
              label="Thème"
              icon={<Palette />}
              iconPosition="start"
              id="parametrage-tab-6"
              aria-controls="parametrage-tabpanel-6"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Page de garde
                  {!hasBranding && <LockIcon sx={{ fontSize: 13, color: '#EF9F27' }} />}
                </Box>
              }
              icon={<Description />}
              iconPosition="start"
              id="parametrage-tab-7"
              aria-controls="parametrage-tabpanel-7"
            />
            <Tab
              label="Régional"
              icon={<Public />}
              iconPosition="start"
              id="parametrage-tab-8"
              aria-controls="parametrage-tabpanel-8"
            />
            <Tab
              label="Sauvegarde"
              icon={<Backup />}
              iconPosition="start"
              id="parametrage-tab-9"
              aria-controls="parametrage-tabpanel-9"
            />
            <Tab
              label="Documentation Juridique"
              icon={<MenuBook />}
              iconPosition="start"
              id="parametrage-tab-10"
              aria-controls="parametrage-tabpanel-10"
            />
            <Tab
              label="Réinitialisation"
              icon={<RestartAlt />}
              iconPosition="start"
              id="parametrage-tab-11"
              aria-controls="parametrage-tabpanel-11"
              sx={{ color: 'error.main' }}
            />
            <Tab
              label="Config. Fiscale"
              icon={<Flag />}
              iconPosition="start"
              id="parametrage-tab-12"
              aria-controls="parametrage-tabpanel-12"
            />
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        <TabPanel value={activeTab} index={0}>
          <EntrepriseSettings />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <FeatureGate
            feature="gestion_equipe_cabinet"
            fallback={
              <Box sx={{ p: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Votre plan Entreprise autorise jusqu'a 5 collaborateurs. Passez en plan Cabinet pour gerer une equipe illimitee.
                </Alert>
                <UserManagement />
              </Box>
            }
          >
            <UserManagement />
          </FeatureGate>
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <PlanComptableSettings />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <TauxFiscauxSettings />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <SecuritySettings />
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <NotificationSettings />
        </TabPanel>

        <TabPanel value={activeTab} index={6}>
          <ThemeSettings />
        </TabPanel>

        <TabPanel value={activeTab} index={7}>
          <FeatureGate
            feature="branding_cabinet"
            fallback={<UpgradeBanner feature="branding_cabinet" />}
          >
            <BrandingPage />
          </FeatureGate>
        </TabPanel>

        <TabPanel value={activeTab} index={8}>
          <RegionalSettings />
        </TabPanel>

        <TabPanel value={activeTab} index={9}>
          <BackupRestoreSettings />
        </TabPanel>

        <TabPanel value={activeTab} index={10}>
          <DocumentationJuridique />
        </TabPanel>

        <TabPanel value={activeTab} index={11}>
          <ResetSettings />
        </TabPanel>

        <TabPanel value={activeTab} index={12}>
          <FiscalConfigPage />
        </TabPanel>
      </Paper>
    </Box>
  )
}

export default Parametrage