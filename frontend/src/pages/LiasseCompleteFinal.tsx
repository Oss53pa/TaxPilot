/**
 * Page complète de la liasse fiscale SYSCOHADA avec sidebar
 */

import React, { useState } from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Chip,
  Divider,
  Paper,
  Alert,
  LinearProgress,
  Badge,
} from '@mui/material'
import {
  Assignment,
  CheckCircle,
  Warning,
  Error,
  GetApp,
  Print,
  Save,
  Edit,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material'

// Import de la configuration des composants
import { 
  LIASSE_COMPONENTS, 
  getComponentsByCategory, 
  getGlobalCompletude, 
  getStatusStats
} from '../config/liasseComponents'

const DRAWER_WIDTH = 280
// Palette TaxPilot
const PRIMARY_COLOR = '#171717'        // Bleu foncé principal
const ACCENT_COLOR = '#e5e5e5'         // Accent pour encadrés
const TEXT_PRIMARY = '#171717'         // Texte principal
const TEXT_SECONDARY = '#737373'       // Texte secondaire

const LiasseCompleteFinal: React.FC = () => {
  const [selectedOnglet, setSelectedOnglet] = useState('couverture')
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [modeEdition, setModeEdition] = useState(false)

  // Utiliser la configuration centralisée
  const ongletsLiasse = LIASSE_COMPONENTS.filter(comp => comp.isVisible)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'success'
      case 'partial': return 'warning'
      case 'empty': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle fontSize="small" />
      case 'partial': return <Warning fontSize="small" />
      case 'empty': return <Error fontSize="small" />
      default: return null
    }
  }

  const currentOnglet = ongletsLiasse.find(o => o.id === selectedOnglet)
  const CurrentComponent = currentOnglet?.component || (() => <div>Composant non trouvé</div>)

  // Utiliser les fonctions utilitaires
  const completudeGlobale = getGlobalCompletude()
  const ongletsByCategory = getComponentsByCategory()
  const _statusStats = getStatusStats()

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar avec liste des onglets */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {/* Header de la sidebar */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: PRIMARY_COLOR, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Liasse SYSCOHADA
            </Typography>
            <Typography variant="caption">
              Exercice 2024
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setDrawerOpen(false)} 
            sx={{ color: 'white' }}
            size="small"
          >
            <ChevronLeft />
          </IconButton>
        </Box>

        {/* Barre de progression globale */}
        <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY }} gutterBottom>
            Complétude globale
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={completudeGlobale}
            color={completudeGlobale >= 80 ? 'success' : 'warning'}
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY_COLOR }}>
            {completudeGlobale}%
          </Typography>
        </Box>

        <Divider />

        {/* Liste des onglets par catégorie */}
        <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
          {Object.entries(ongletsByCategory).map(([category, onglets]) => (
            <Box key={category}>
              <Typography 
                variant="overline" 
                sx={{ 
                  px: 2, 
                  py: 1, 
                  display: 'block',
                  backgroundColor: ACCENT_COLOR,
                  color: TEXT_PRIMARY,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: 1
                }}
              >
                {category}
              </Typography>
              
              {onglets.map((onglet) => (
                <ListItem key={onglet.id} disablePadding>
                  <ListItemButton
                    selected={selectedOnglet === onglet.id}
                    onClick={() => setSelectedOnglet(onglet.id)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: `${PRIMARY_COLOR}15`,
                        borderRight: `3px solid ${PRIMARY_COLOR}`,
                        '&:hover': {
                          backgroundColor: `${PRIMARY_COLOR}25`,
                        },
                        '& .MuiListItemText-primary': {
                          color: PRIMARY_COLOR,
                          fontWeight: 600,
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Badge 
                        badgeContent={getStatusIcon(onglet.status)}
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                      >
                        {onglet.icon}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary={onglet.label}
                      secondary={`${onglet.completude}% - ${onglet.description}`}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        color: TEXT_PRIMARY,
                        fontWeight: 500
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </Box>
          ))}
        </List>

        {/* Footer de la sidebar */}
        <Divider />
        <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<GetApp />}
            size="small"
            sx={{ mb: 1, backgroundColor: PRIMARY_COLOR }}
          >
            Export complet
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Print />}
            size="small"
            sx={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
          >
            Imprimer tout
          </Button>
        </Box>
      </Drawer>

      {/* Contenu principal */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Toolbar>
            {!drawerOpen && (
              <IconButton
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <ChevronRight />
              </IconButton>
            )}
            
            <Assignment sx={{ mr: 2, color: PRIMARY_COLOR }} />
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {currentOnglet?.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentOnglet?.description}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                icon={getStatusIcon(currentOnglet?.status || '')}
                label={`${currentOnglet?.completude}% complété`}
                color={getStatusColor(currentOnglet?.status || '') as any}
                size="small"
              />
              
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              
              <Button
                variant={modeEdition ? 'contained' : 'outlined'}
                size="small"
                startIcon={modeEdition ? <Save /> : <Edit />}
                onClick={() => setModeEdition(!modeEdition)}
                sx={{
                  backgroundColor: modeEdition ? PRIMARY_COLOR : 'transparent',
                  borderColor: PRIMARY_COLOR,
                  color: modeEdition ? 'white' : PRIMARY_COLOR,
                  '&:hover': {
                    backgroundColor: modeEdition ? '#2a2a2a' : `${PRIMARY_COLOR}15`,
                    borderColor: PRIMARY_COLOR,
                  },
                }}
              >
                {modeEdition ? 'Sauvegarder' : 'Éditer'}
              </Button>
              
              <IconButton size="small" sx={{ color: PRIMARY_COLOR }}>
                <Print />
              </IconButton>
              
              <IconButton size="small" sx={{ color: PRIMARY_COLOR }}>
                <GetApp />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Zone de contenu avec le composant de l'onglet sélectionné */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {currentOnglet?.status === 'empty' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Cet état n'a pas encore été rempli. Veuillez compléter les informations requises.
            </Alert>
          )}
          
          <Paper elevation={1} sx={{ p: 3, backgroundColor: 'white' }}>
            <CurrentComponent modeEdition={modeEdition} />
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default LiasseCompleteFinal