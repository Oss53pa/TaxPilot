/**
 * Page complète de la liasse fiscale SYSCOHADA avec sidebar intégrée
 */

import type React from 'react'
import { useState } from 'react'
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
  // Tooltip,
  Badge,
} from '@mui/material'
import {
  Assignment,
  AccountBalance,
  TrendingUp,
  TableChart,
  Description,
  Notes,
  AttachMoney,
  Assessment,
  SwapHoriz,
  AccountTree,
  Calculate,
  CheckCircle,
  Warning,
  Error,
  GetApp,
  Print,
  Save,
  Edit,
  Menu as MenuIcon,
  ChevronLeft,
} from '@mui/icons-material'

// Import des composants pour chaque onglet
import BilanActif from '../components/liasse/BilanActif'
import BilanPassif from '../components/liasse/BilanPassif'
import CompteResultat from '../components/liasse/CompteResultat'
import Tafire from '../components/liasse/Tafire'
import FluxTresorerie from '../components/liasse/FluxTresorerie'
import VariationCapitaux from '../components/liasse/VariationCapitaux'
import NotesAnnexes from '../components/liasse/NotesAnnexes'
import EtatComplements from '../components/liasse/EtatComplements'
import EtatAnnexe from '../components/liasse/EtatAnnexe'
import DSF from '../components/liasse/DSF'
import FichesImpots from '../components/liasse/FichesImpots'

const DRAWER_WIDTH = 280

interface OngletLiasse {
  id: string
  label: string
  icon: React.ReactElement
  component: React.ComponentType<any>
  description: string
  status: 'complete' | 'partial' | 'empty'
  completude: number
  category: string
}

const LiasseComplete: React.FC = () => {
  const [selectedOnglet, setSelectedOnglet] = useState('bilan-actif')
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [modeEdition, setModeEdition] = useState(false)

  // Structure complète des onglets de la liasse SYSCOHADA
  const ongletsLiasse: OngletLiasse[] = [
    // États financiers principaux
    {
      id: 'bilan-actif',
      label: 'Bilan - Actif',
      icon: <AccountBalance />,
      component: BilanActif,
      description: 'État de la situation patrimoniale - Actif',
      status: 'complete',
      completude: 95,
      category: 'États financiers',
    },
    {
      id: 'bilan-passif',
      label: 'Bilan - Passif',
      icon: <AccountBalance />,
      component: BilanPassif,
      description: 'État de la situation patrimoniale - Passif',
      status: 'complete',
      completude: 92,
      category: 'États financiers',
    },
    {
      id: 'compte-resultat',
      label: 'Compte de Résultat',
      icon: <TrendingUp />,
      component: CompteResultat,
      description: 'Performance économique de l\'exercice',
      status: 'complete',
      completude: 88,
      category: 'États financiers',
    },
    {
      id: 'tafire',
      label: 'TAFIRE',
      icon: <TableChart />,
      component: Tafire,
      description: 'Tableau Financier des Ressources et Emplois',
      status: 'complete',
      completude: 95,
      category: 'États financiers',
    },
    {
      id: 'flux-tresorerie',
      label: 'Flux de Trésorerie',
      icon: <AttachMoney />,
      component: FluxTresorerie,
      description: 'Mouvements de trésorerie de l\'exercice',
      status: 'complete',
      completude: 90,
      category: 'États financiers',
    },
    {
      id: 'variation-capitaux',
      label: 'Variation Capitaux Propres',
      icon: <SwapHoriz />,
      component: VariationCapitaux,
      description: 'Évolution des capitaux propres',
      status: 'complete',
      completude: 92,
      category: 'États financiers',
    },
    
    // Notes annexes
    {
      id: 'notes-annexes',
      label: 'Notes Annexes',
      icon: <Notes />,
      component: NotesAnnexes,
      description: 'Notes explicatives aux états financiers',
      status: 'partial',
      completude: 80,
      category: 'Notes et annexes',
    },
    {
      id: 'etat-complements',
      label: 'État Complémentaire',
      icon: <Description />,
      component: EtatComplements,
      description: 'Informations complémentaires',
      status: 'complete',
      completude: 88,
      category: 'Notes et annexes',
    },
    {
      id: 'etat-annexe',
      label: 'État Annexé',
      icon: <AccountTree />,
      component: EtatAnnexe,
      description: 'Détails des postes du bilan',
      status: 'complete',
      completude: 85,
      category: 'Notes et annexes',
    },
    
    // Déclarations fiscales
    {
      id: 'dsf',
      label: 'DSF',
      icon: <Assessment />,
      component: DSF,
      description: 'Déclaration Statistique et Fiscale',
      status: 'complete',
      completude: 90,
      category: 'Déclarations',
    },
    {
      id: 'fiches-impots',
      label: 'Fiches Impôts',
      icon: <Calculate />,
      component: FichesImpots,
      description: 'Détermination des impôts et taxes',
      status: 'complete',
      completude: 92,
      category: 'Déclarations',
    },
  ]

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
      default: return undefined
    }
  }

  const currentOnglet = ongletsLiasse.find(o => o.id === selectedOnglet)
  const CurrentComponent = currentOnglet?.component || (() => <div>Composant non trouvé</div>)

  // Calcul de la complétude globale
  const completudeGlobale = Math.round(
    ongletsLiasse.reduce((acc, o) => acc + o.completude, 0) / ongletsLiasse.length
  )

  // Grouper les onglets par catégorie
  const ongletsByCategory = ongletsLiasse.reduce((acc, onglet) => {
    if (!acc[onglet.category]) {
      acc[onglet.category] = []
    }
    acc[onglet.category].push(onglet)
    return acc
  }, {} as Record<string, typeof ongletsLiasse>)

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
            backgroundColor: '#171717',
          },
        }}
      >
        {/* Header de la sidebar */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              Liasse SYSCOHADA
            </Typography>
            <Typography variant="caption" sx={{ color: 'white' }}>
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
          <Typography variant="body2" sx={{ color: 'white' }} gutterBottom>
            Complétude globale
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={completudeGlobale}
            color={completudeGlobale >= 80 ? 'success' : 'warning'}
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
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
                  backgroundColor: 'grey.700',
                  color: 'white',
                  fontWeight: 600
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
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                        '& .MuiListItemText-primary': {
                          color: 'primary.main',
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
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={onglet.completude}
                            sx={{ 
                              flexGrow: 1, 
                              height: 4, 
                              borderRadius: 2,
                              backgroundColor: 'grey.300',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getStatusColor(onglet.status) + '.main'
                              }
                            }}
                          />
                          <Typography variant="caption" sx={{ minWidth: 35, color: 'white' }}>
                            {onglet.completude}%
                          </Typography>
                        </Box>
                      }
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        color: 'white',
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
            sx={{ mb: 1 }}
          >
            Export complet
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Print />}
            size="small"
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
                <MenuIcon />
              </IconButton>
            )}
            
            <Assignment sx={{ mr: 2, color: 'primary.main' }} />
            
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
              >
                {modeEdition ? 'Sauvegarder' : 'Éditer'}
              </Button>
              
              <IconButton size="small" color="primary">
                <Print />
              </IconButton>
              
              <IconButton size="small" color="primary">
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

export default LiasseComplete