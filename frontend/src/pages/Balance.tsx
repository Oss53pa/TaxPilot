/**
 * Page de gestion de la balance comptable
 */

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
} from '@mui/material'
import {
  CloudUpload,
  FindInPage,
  Assessment,
  History,
} from '@mui/icons-material'
import { useAppSelector } from '@/store'
import BalanceImport from '@/components/Balance/BalanceImport'
import BalanceConsultation from '@/components/Balance/BalanceConsultation'
import BalanceValidation from '@/components/Balance/BalanceValidation'
import ValidationHistory from '@/components/Balance/ValidationHistory'
import { TabPanel } from '@/components/shared/TabPanel'

const Balance: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { balances, isImporting } = useAppSelector(state => state.balance)
  
  // Déterminer l'onglet actif basé sur l'URL
  const getActiveTab = React.useCallback(() => {
    const path = location.pathname
    if (path.includes('/import')) return 0
    if (path.includes('/consultation')) return 1
    if (path.includes('/validation')) return 2
    if (path.includes('/historique')) return 3
    return 0
  }, [location.pathname])

  const [activeTab, setActiveTab] = React.useState(() => getActiveTab())

  const handleTabChange = React.useCallback((_event: React.SyntheticEvent, newValue: number) => {
    // Éviter de naviguer si on est déjà sur la bonne tab
    if (newValue === activeTab) return
    
    setActiveTab(newValue)
    
    const tabPaths = [
      '/balance/import',
      '/balance/consultation',
      '/balance/validation',
      '/balance/historique',
    ]
    
    navigate(tabPaths[newValue])
  }, [activeTab, navigate])

  React.useEffect(() => {
    const newTab = getActiveTab()
    // Éviter de mettre à jour si la tab est déjà correcte
    if (newTab !== activeTab) {
      setActiveTab(newTab)
    }
  }, [getActiveTab, activeTab])

  // Calculer les statistiques de la balance
  const totalBalance = balances.length
  const totalDebit = balances.reduce((sum, b) => sum + b.debit, 0)
  const totalCredit = balances.reduce((sum, b) => sum + b.credit, 0)
  const isEquilibree = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Gestion de la Balance
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Import, consultation et validation de votre balance comptable
            </Typography>
          </Box>
          
          {/* Indicateurs rapides */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`${totalBalance.toLocaleString()} lignes`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={isEquilibree ? 'Équilibrée' : 'Déséquilibrée'}
              color={isEquilibree ? 'success' : 'error'}
            />
            {isImporting && (
              <Chip
                label="Import en cours..."
                color="warning"
                variant="filled"
              />
            )}
          </Box>
        </Box>

        {/* Résumé des montants */}
        {totalBalance > 0 && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip
              label={`Débit: ${totalDebit.toLocaleString()}`}
              color="info"
              variant="outlined"
            />
            <Chip
              label={`Crédit: ${totalCredit.toLocaleString()}`}
              color="info"
              variant="outlined"
            />
            <Chip
              label={`Écart: ${Math.abs(totalDebit - totalCredit).toLocaleString()}`}
              color={isEquilibree ? 'success' : 'error'}
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      <Paper sx={{ width: '100%' }}>
        {/* Onglets de navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Balance tabs"
          >
            <Tab
              label="Import"
              icon={<CloudUpload />}
              iconPosition="start"
              id="balance-tab-0"
              aria-controls="balance-tabpanel-0"
            />
            <Tab
              label={`Consultation (${totalBalance})`}
              icon={<FindInPage />}
              iconPosition="start"
              id="balance-tab-1"
              aria-controls="balance-tabpanel-1"
            />
            <Tab
              label="Validation"
              icon={<Assessment />}
              iconPosition="start"
              id="balance-tab-2"
              aria-controls="balance-tabpanel-2"
            />
            <Tab
              label="Historique Validations"
              icon={<History />}
              iconPosition="start"
              id="balance-tab-3"
              aria-controls="balance-tabpanel-3"
            />
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        <TabPanel value={activeTab} index={0}>
          <BalanceImport />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <BalanceConsultation />
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <BalanceValidation />
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          <ValidationHistory />
        </TabPanel>
      </Paper>
    </Container>
  )
}

export default Balance