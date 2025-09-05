/**
 * Page complète de la liasse fiscale SYSCOHADA avec navbar dropdown
 */

import React, { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  Alert,
  LinearProgress,
  Divider,
  ListItemIcon,
  ListItemText,
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
  Calculate,
  CheckCircle,
  Warning,
  Error,
  GetApp,
  Print,
  Save,
  Edit,
  ArrowDropDown,
  ExpandMore,
  FolderOpen,
  Receipt,
  AccountTree,
  BarChart,
  PieChart,
  Timeline,
  Gavel,
  LocalAtm,
  MonetizationOn,
  AccountBalanceWallet,
  ShowChart,
} from '@mui/icons-material'

// Import des composants pour chaque onglet
import BilanActif from '../components/liasse/BilanActif'
import BilanPassif from '../components/liasse/BilanPassif'
import CompteResultat from '../components/liasse/CompteResultat'
import Tafire from '../components/liasse/Tafire'
import FluxTresorerie from '../components/liasse/FluxTresorerie'
import VariationCapitaux from '../components/liasse/VariationCapitaux'
import NotesAnnexesComplete from '../components/liasse/NotesAnnexesComplete'
import BilanComptable from '../components/liasse/BilanComptable'
import GrandLivre from '../components/liasse/GrandLivre'
import BalanceGenerale from '../components/liasse/BalanceGenerale'
import JournalGeneral from '../components/liasse/JournalGeneral'
import EtatSoldesGestion from '../components/liasse/EtatSoldesGestion'
import TableauAmortissements from '../components/liasse/TableauAmortissements'
import TableauProvisions from '../components/liasse/TableauProvisions'
import EtatCreances from '../components/liasse/EtatCreances'
import EtatDettes from '../components/liasse/EtatDettes'
import TableauRepartitionVA from '../components/liasse/TableauRepartitionVA'
import DSF from '../components/liasse/DSF'
import FichesImpots from '../components/liasse/FichesImpots'
import TableauPassageResultat from '../components/liasse/TableauPassageResultat'
import DeterminationResultatFiscal from '../components/liasse/DeterminationResultatFiscal'

// Couleur primary définie
const PRIMARY_COLOR = '#191919'

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

const LiasseCompleteV2: React.FC = () => {
  const [selectedOnglet, setSelectedOnglet] = useState('bilan-actif')
  const [modeEdition, setModeEdition] = useState(false)
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Structure complète des onglets de la liasse SYSCOHADA
  const ongletsLiasse: OngletLiasse[] = [
    // États financiers principaux
    {
      id: 'bilan-actif',
      label: 'Bilan Actif',
      icon: <AccountBalance />,
      component: BilanActif,
      description: 'État de la situation patrimoniale - Actif',
      status: 'complete',
      completude: 95,
      category: 'États financiers',
    },
    {
      id: 'bilan-passif',
      label: 'Bilan Passif',
      icon: <AccountBalance />,
      component: BilanPassif,
      description: 'État de la situation patrimoniale - Passif',
      status: 'complete',
      completude: 92,
      category: 'États financiers',
    },
    {
      id: 'bilan-comptable',
      label: 'Bilan Comptable',
      icon: <AccountTree />,
      component: BilanComptable,
      description: 'Bilan comptable synthétique',
      status: 'partial',
      completude: 75,
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
      status: 'partial',
      completude: 75,
      category: 'États financiers',
    },
    {
      id: 'flux-tresorerie',
      label: 'Flux de Trésorerie',
      icon: <AttachMoney />,
      component: FluxTresorerie,
      description: 'Mouvements de trésorerie de l\'exercice',
      status: 'partial',
      completude: 65,
      category: 'États financiers',
    },
    {
      id: 'variation-capitaux',
      label: 'Variation Capitaux Propres',
      icon: <ShowChart />,
      component: VariationCapitaux,
      description: 'Évolution des capitaux propres',
      status: 'partial',
      completude: 70,
      category: 'États financiers',
    },
    
    // Documents comptables
    {
      id: 'balance-generale',
      label: 'Balance Générale',
      icon: <BarChart />,
      component: BalanceGenerale,
      description: 'Balance générale des comptes',
      status: 'complete',
      completude: 90,
      category: 'Documents comptables',
    },
    {
      id: 'grand-livre',
      label: 'Grand Livre',
      icon: <FolderOpen />,
      component: GrandLivre,
      description: 'Grand livre des comptes',
      status: 'partial',
      completude: 80,
      category: 'Documents comptables',
    },
    {
      id: 'journal-general',
      label: 'Journal Général',
      icon: <Receipt />,
      component: JournalGeneral,
      description: 'Journal des écritures comptables',
      status: 'partial',
      completude: 85,
      category: 'Documents comptables',
    },
    
    // Tableaux annexes
    {
      id: 'etat-soldes-gestion',
      label: 'État Soldes de Gestion',
      icon: <PieChart />,
      component: EtatSoldesGestion,
      description: 'Soldes intermédiaires de gestion',
      status: 'partial',
      completude: 70,
      category: 'Tableaux annexes',
    },
    {
      id: 'tableau-amortissements',
      label: 'Tableau Amortissements',
      icon: <Timeline />,
      component: TableauAmortissements,
      description: 'Tableau des amortissements',
      status: 'partial',
      completude: 60,
      category: 'Tableaux annexes',
    },
    {
      id: 'tableau-provisions',
      label: 'Tableau Provisions',
      icon: <AccountBalanceWallet />,
      component: TableauProvisions,
      description: 'Tableau des provisions',
      status: 'empty',
      completude: 40,
      category: 'Tableaux annexes',
    },
    {
      id: 'etat-creances',
      label: 'État des Créances',
      icon: <MonetizationOn />,
      component: EtatCreances,
      description: 'État détaillé des créances',
      status: 'partial',
      completude: 55,
      category: 'Tableaux annexes',
    },
    {
      id: 'etat-dettes',
      label: 'État des Dettes',
      icon: <LocalAtm />,
      component: EtatDettes,
      description: 'État détaillé des dettes',
      status: 'partial',
      completude: 50,
      category: 'Tableaux annexes',
    },
    {
      id: 'tableau-repartition-va',
      label: 'Répartition Valeur Ajoutée',
      icon: <Assessment />,
      component: TableauRepartitionVA,
      description: 'Tableau de répartition de la valeur ajoutée',
      status: 'empty',
      completude: 35,
      category: 'Tableaux annexes',
    },
    
    // Notes annexes
    {
      id: 'notes-annexes',
      label: 'Notes Annexes Complètes',
      icon: <Notes />,
      component: NotesAnnexesComplete,
      description: 'Notes explicatives complètes aux états financiers',
      status: 'partial',
      completude: 80,
      category: 'Notes annexes',
    },
    
    // Déclarations fiscales
    {
      id: 'dsf',
      label: 'DSF',
      icon: <Assessment />,
      component: DSF,
      description: 'Déclaration Statistique et Fiscale',
      status: 'partial',
      completude: 60,
      category: 'Déclarations fiscales',
    },
    {
      id: 'tableau-passage-resultat',
      label: 'Passage Résultat Comptable/Fiscal',
      icon: <Gavel />,
      component: TableauPassageResultat,
      description: 'Tableau de passage du résultat comptable au résultat fiscal',
      status: 'empty',
      completude: 30,
      category: 'Déclarations fiscales',
    },
    {
      id: 'determination-resultat-fiscal',
      label: 'Détermination Résultat Fiscal',
      icon: <Calculate />,
      component: DeterminationResultatFiscal,
      description: 'Détermination du résultat fiscal',
      status: 'empty',
      completude: 25,
      category: 'Déclarations fiscales',
    },
    {
      id: 'fiches-impots',
      label: 'Fiches Impôts',
      icon: <Calculate />,
      component: FichesImpots,
      description: 'Détermination des impôts et taxes',
      status: 'empty',
      completude: 25,
      category: 'Déclarations fiscales',
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
      default: return null
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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, category: string) => {
    setAnchorElMenu(event.currentTarget)
    setActiveCategory(category)
  }

  const handleMenuClose = () => {
    setAnchorElMenu(null)
    setActiveCategory(null)
  }

  const handleOngletSelect = (ongletId: string) => {
    setSelectedOnglet(ongletId)
    handleMenuClose()
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Navbar avec dropdowns */}
      <AppBar position="static" sx={{ backgroundColor: PRIMARY_COLOR }}>
        <Toolbar>
          <Assignment sx={{ mr: 2, color: 'white' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mr: 4 }}>
            Liasse Fiscale SYSCOHADA
          </Typography>

          {/* Menus dropdown par catégorie */}
          <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
            {Object.keys(ongletsByCategory).map((category) => (
              <Button
                key={category}
                color="inherit"
                endIcon={<ExpandMore />}
                onClick={(e) => handleMenuClick(e, category)}
                sx={{
                  textTransform: 'none',
                  fontWeight: activeCategory === category ? 600 : 400,
                  backgroundColor: activeCategory === category ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                }}
              >
                {category}
              </Button>
            ))}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={`${completudeGlobale}% complété`}
              color="success"
              size="small"
              sx={{ backgroundColor: 'rgba(76, 175, 80, 0.8)' }}
            />
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            
            <Button
              variant={modeEdition ? 'contained' : 'outlined'}
              size="small"
              startIcon={modeEdition ? <Save /> : <Edit />}
              onClick={() => setModeEdition(!modeEdition)}
              sx={{
                color: modeEdition ? PRIMARY_COLOR : 'white',
                backgroundColor: modeEdition ? 'white' : 'transparent',
                borderColor: 'white',
                '&:hover': {
                  backgroundColor: modeEdition ? '#f0f0f0' : 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                },
              }}
            >
              {modeEdition ? 'Sauvegarder' : 'Éditer'}
            </Button>
            
            <IconButton size="small" sx={{ color: 'white' }}>
              <Print />
            </IconButton>
            
            <IconButton size="small" sx={{ color: 'white' }}>
              <GetApp />
            </IconButton>
          </Box>
        </Toolbar>

        {/* Sous-header avec info de l'onglet actuel */}
        <Box sx={{ backgroundColor: 'rgba(0,0,0,0.2)', px: 3, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {currentOnglet?.icon}
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
              {currentOnglet?.label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {currentOnglet?.description}
            </Typography>
            <Box sx={{ ml: 'auto' }}>
              <Chip 
                icon={getStatusIcon(currentOnglet?.status || '')}
                label={`${currentOnglet?.completude}%`}
                color={getStatusColor(currentOnglet?.status || '') as any}
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </AppBar>

      {/* Menu dropdown */}
      <Menu
        anchorEl={anchorElMenu}
        open={Boolean(anchorElMenu) && activeCategory !== null}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 280,
            maxHeight: 400,
            backgroundColor: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
        }}
      >
        {activeCategory && ongletsByCategory[activeCategory]?.map((onglet) => (
          <MenuItem
            key={onglet.id}
            onClick={() => handleOngletSelect(onglet.id)}
            selected={selectedOnglet === onglet.id}
            sx={{
              py: 1.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 25, 25, 0.08)',
              },
              '&:hover': {
                backgroundColor: 'rgba(25, 25, 25, 0.04)',
              },
            }}
          >
            <ListItemIcon>
              {onglet.icon}
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
                  <Typography variant="caption" sx={{ minWidth: 35 }}>
                    {onglet.completude}%
                  </Typography>
                </Box>
              }
            />
            <Box sx={{ ml: 2 }}>
              {getStatusIcon(onglet.status)}
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Zone de contenu principale */}
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

      {/* Barre de statut */}
      <Box sx={{ 
        backgroundColor: PRIMARY_COLOR, 
        color: 'white', 
        px: 3, 
        py: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="caption">
          SARL DEMO FISCASYNC - Exercice 2024 - N° Contribuable: M051234567890
        </Typography>
        <Typography variant="caption">
          Dernière modification: {new Date().toLocaleString('fr-FR')}
        </Typography>
      </Box>
    </Box>
  )
}

export default LiasseCompleteV2