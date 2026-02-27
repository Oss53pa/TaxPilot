/**
 * Page de paramétrage de l'entreprise
 */

import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
  Security,
  Notifications,
  Palette,
  Public,
  Backup,
} from '@mui/icons-material'
import EntrepriseSettings from '@/components/Parametrage/EntrepriseSettings'
import UserManagement from '@/components/Parametrage/UserManagement'
import PlanComptableSettings from '@/components/Parametrage/PlanComptableSettings'
import SecuritySettings from '@/components/Parametrage/SecuritySettings'
import NotificationSettings from '@/components/Parametrage/NotificationSettings'
import ThemeSettings from '@/pages/ThemeSettings'
import RegionalSettings from '@/components/Parametrage/RegionalSettings'
import BackupRestoreSettings from '@/components/Parametrage/BackupRestoreSettings'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`parametrage-tabpanel-${index}`}
    aria-labelledby={`parametrage-tab-${index}`}
  >
    {value === index && (
      <Box sx={{ py: 3 }}>
        {children}
      </Box>
    )}
  </div>
)

const Parametrage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Déterminer l'onglet actif basé sur l'URL
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/entreprise')) return 0
    if (path.includes('/utilisateurs')) return 1
    if (path.includes('/plans-comptables')) return 2
    if (path.includes('/securite')) return 3
    if (path.includes('/notifications')) return 4
    if (path.includes('/theme')) return 5
    if (path.includes('/regional')) return 6
    if (path.includes('/sauvegarde')) return 7
    return 0
  }

  const [activeTab, setActiveTab] = React.useState(getActiveTab())

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    
    const tabPaths = [
      '/parametrage/entreprise',
      '/parametrage/utilisateurs',
      '/parametrage/plans-comptables',
      '/parametrage/securite',
      '/parametrage/notifications',
      '/parametrage/theme',
      '/parametrage/regional',
      '/parametrage/sauvegarde',
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
              label="Utilisateurs"
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
              label="Sécurité"
              icon={<Security />}
              iconPosition="start"
              id="parametrage-tab-3"
              aria-controls="parametrage-tabpanel-3"
            />
            <Tab
              label="Notifications"
              icon={<Notifications />}
              iconPosition="start"
              id="parametrage-tab-4"
              aria-controls="parametrage-tabpanel-4"
            />
            <Tab
              label="Thème"
              icon={<Palette />}
              iconPosition="start"
              id="parametrage-tab-5"
              aria-controls="parametrage-tabpanel-5"
            />
            <Tab
              label="Régional"
              icon={<Public />}
              iconPosition="start"
              id="parametrage-tab-6"
              aria-controls="parametrage-tabpanel-6"
            />
            <Tab
              label="Sauvegarde"
              icon={<Backup />}
              iconPosition="start"
              id="parametrage-tab-7"
              aria-controls="parametrage-tabpanel-7"
            />
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        <TabPanel value={activeTab} index={0}>
          <EntrepriseSettings />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <UserManagement />
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <PlanComptableSettings />
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          <SecuritySettings />
        </TabPanel>
        
        <TabPanel value={activeTab} index={4}>
          <NotificationSettings />
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <ThemeSettings />
        </TabPanel>

        <TabPanel value={activeTab} index={6}>
          <RegionalSettings />
        </TabPanel>

        <TabPanel value={activeTab} index={7}>
          <BackupRestoreSettings />
        </TabPanel>
      </Paper>
    </Box>
  )
}

export default Parametrage