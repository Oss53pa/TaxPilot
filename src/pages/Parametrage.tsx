/**
 * Page de paramétrage de l'entreprise
 */

import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Container,
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
} from '@mui/icons-material'
import EntrepriseSettings from '@/components/Parametrage/EntrepriseSettings'
import UserManagement from '@/components/Parametrage/UserManagement'
import PlanComptableSettings from '@/components/Parametrage/PlanComptableSettings'

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
    ]
    
    navigate(tabPaths[newValue])
  }

  React.useEffect(() => {
    setActiveTab(getActiveTab())
  }, [location.pathname])

  return (
    <Container maxWidth="lg">
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
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Paramètres de Sécurité
            </Typography>
            <Typography color="text.secondary">
              Configuration de la sécurité et des accès (À implémenter)
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Paramètres de Notifications
            </Typography>
            <Typography color="text.secondary">
              Configuration des notifications et alertes (À implémenter)
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  )
}

export default Parametrage