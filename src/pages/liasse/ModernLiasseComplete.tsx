/**
 * Module Liasse Fiscale Complet - Gestion de tous les onglets SYSCOHADA
 */

import React, { useState, useEffect, lazy, Suspense } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  AppBar,
  Toolbar,
  Chip,
  LinearProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  useTheme,
  alpha,
  Badge,
  Tooltip,
  Stack,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  Collapse,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material'
import '../../styles/liasse-fixes.css'
import {
  Assignment as AssignmentIcon,
  AccountBalance as BalanceIcon,
  TrendingUp as TrendingIcon,
  TableChart as TableIcon,
  Notes as NotesIcon,
  Assessment as AssessmentIcon,
  Description as DocIcon,
  GetApp as ExportIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CompleteIcon,
  RadioButtonUnchecked as EmptyIcon,
  HourglassEmpty as PartialIcon,
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
} from '@mui/icons-material'

// Import des composants existants
import BilanActifSYSCOHADA from '../../components/liasse/sheets/BilanActifSYSCOHADA'
import BilanPassifSYSCOHADA from '../../components/liasse/sheets/BilanPassifSYSCOHADA'
import CompteResultatSYSCOHADA from '../../components/liasse/sheets/CompteResultatSYSCOHADA'
import TableauFluxTresorerieSYSCOHADA from '../../components/liasse/sheets/TableauFluxTresorerieSYSCOHADA'
import FicheR1SYSCOHADA from '../../components/liasse/sheets/FicheR1SYSCOHADA'
import FicheR2SYSCOHADA from '../../components/liasse/sheets/FicheR2SYSCOHADA'
import FicheR3SYSCOHADA from '../../components/liasse/sheets/FicheR3SYSCOHADA'
import FicheR4SYSCOHADA from '../../components/liasse/sheets/FicheR4SYSCOHADA'
import PageGardeSYSCOHADA from '../../components/liasse/sheets/PageGardeSYSCOHADA'
import NotesAnnexesSYSCOHADA from '../../components/liasse/sheets/NotesAnnexesSYSCOHADA'
import Note1SYSCOHADA from '../../components/liasse/sheets/Note1SYSCOHADA'
import Note6SYSCOHADA from '../../components/liasse/sheets/Note6SYSCOHADA'
import Note8SYSCOHADA from '../../components/liasse/sheets/Note8SYSCOHADA'
import Note11SYSCOHADA from '../../components/liasse/sheets/Note11SYSCOHADA'
import Note14SYSCOHADA from '../../components/liasse/sheets/Note14SYSCOHADA'
import Note17SYSCOHADA from '../../components/liasse/sheets/Note17SYSCOHADA'
import Note19SYSCOHADA from '../../components/liasse/sheets/Note19SYSCOHADA'

// Import des nouveaux composants complets
import Couverture from '../../components/liasse/sheets/Couverture'
import BilanSynthetique from '../../components/liasse/sheets/BilanSynthetique'
import Note36Tables from '../../components/liasse/sheets/Note36Tables'
import Note2SYSCOHADA from '../../components/liasse/sheets/Note2SYSCOHADA'
import Note3SYSCOHADA from '../../components/liasse/sheets/Note3SYSCOHADA'
import Note5SYSCOHADA from '../../components/liasse/sheets/Note5SYSCOHADA'
import PageGarde from '../../components/liasse/sheets/PageGarde'
import Recevabilite from '../../components/liasse/sheets/Recevabilite'
import NotesRestantes, { Note4SYSCOHADA, Note7SYSCOHADA, Note9SYSCOHADA, Note10SYSCOHADA, NOTES_CONFIGS } from '../../components/liasse/sheets/NotesRestantes'

// Import des suppléments et compléments
import ComplementCharges from '../../components/liasse/sheets/ComplementCharges'
import ComplementProduits from '../../components/liasse/sheets/ComplementProduits'
import SupplementTVA from '../../components/liasse/sheets/SupplementTVA'
import SupplementImpotSociete from '../../components/liasse/sheets/SupplementImpotSociete'
import SupplementAvantagesFiscaux from '../../components/liasse/sheets/SupplementAvantagesFiscaux'
import FicheRenseignements from '../../components/liasse/sheets/FicheRenseignements'
import TablesCalculImpots from '../../components/liasse/sheets/TablesCalculImpots'
import TableauxSupplementaires from '../../components/liasse/sheets/TableauxSupplementaires'
import { LIASSE_SHEETS, SHEET_CATEGORIES, SheetConfig } from '../../config/liasseFiscaleSheets'

const DRAWER_WIDTH = 380

interface CategoryState {
  [key: string]: boolean
}

interface SheetProgress {
  [key: string]: {
    completion: number
    status: 'empty' | 'partial' | 'complete' | 'error'
    lastModified?: Date
    hasComments?: boolean
  }
}

const ModernLiasseComplete: React.FC = () => {
  const theme = useTheme()
  const [selectedSheet, setSelectedSheet] = useState<string>('couverture')
  const [expandedCategories, setExpandedCategories] = useState<CategoryState>({})
  const [sheetProgress, setSheetProgress] = useState<SheetProgress>({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [globalProgress, setGlobalProgress] = useState(0)

  // Initialisation des catégories développées
  useEffect(() => {
    const initialExpanded: CategoryState = {}
    SHEET_CATEGORIES.forEach(cat => {
      initialExpanded[cat.id] = cat.id === 'statements' // Ouvrir par défaut les états financiers
    })
    setExpandedCategories(initialExpanded)

    // Initialiser le progrès des feuilles
    const initialProgress: SheetProgress = {}
    LIASSE_SHEETS.forEach(sheet => {
      initialProgress[sheet.id] = {
        completion: 0,
        status: 'empty',
        hasComments: false
      }
    })
    setSheetProgress(initialProgress)
  }, [])

  // Calcul du progrès global
  useEffect(() => {
    const requiredSheets = LIASSE_SHEETS.filter(s => s.required)
    if (requiredSheets.length === 0) return

    const totalProgress = requiredSheets.reduce((sum, sheet) => {
      return sum + (sheetProgress[sheet.id]?.completion || 0)
    }, 0)

    setGlobalProgress(Math.round(totalProgress / requiredSheets.length))
  }, [sheetProgress])

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const handleSheetSelect = (sheetId: string) => {
    setSelectedSheet(sheetId)
  }

  // Actions pour les boutons
  const handleExportLiasse = () => {
    console.log('Export de la liasse en cours...')
    // Simulation de l'export
    const exportData = {
      dateExport: new Date().toISOString(),
      sheets: LIASSE_SHEETS.map(sheet => ({
        id: sheet.id,
        name: sheet.name,
        completed: sheetProgress[sheet.id]?.status === 'complete'
      }))
    }
    
    // Créer un fichier JSON pour l'export
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `liasse_fiscale_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    alert('Export réussi ! Le fichier a été téléchargé.')
  }

  const handlePrintSheet = () => {
    console.log('Impression de la feuille en cours...')
    // Ouvrir la boîte de dialogue d'impression du navigateur
    window.print()
  }

  const handleSaveSheet = () => {
    console.log('Sauvegarde de la feuille en cours...')
    // Simulation de la sauvegarde
    const currentSheet = LIASSE_SHEETS.find(s => s.id === selectedSheet)
    if (currentSheet) {
      // Mettre à jour le statut et la progression
      setSheetProgress(prev => ({
        ...prev,
        [selectedSheet]: {
          ...prev[selectedSheet],
          completion: Math.min((prev[selectedSheet]?.completion || 0) + 25, 100),
          status: (prev[selectedSheet]?.completion || 0) >= 75 ? 'complete' : 'partial',
          lastModified: new Date(),
          hasComments: true
        }
      }))
      
      alert(`Feuille "${currentSheet.name}" sauvegardée avec succès !`)
    }
  }

  const handleValidationComplete = () => {
    setShowValidation(false)
    // Marquer toutes les feuilles requises comme complètes
    const updatedProgress: SheetProgress = { ...sheetProgress }
    LIASSE_SHEETS.filter(s => s.required).forEach(sheet => {
      updatedProgress[sheet.id] = {
        ...updatedProgress[sheet.id],
        completion: 100,
        status: 'complete',
        lastModified: new Date(),
        hasComments: true
      }
    })
    setSheetProgress(updatedProgress)
    alert('Validation de la liasse terminée avec succès !')
  }

  const getSheetIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CompleteIcon color="success" fontSize="small" />
      case 'partial':
        return <PartialIcon color="warning" fontSize="small" />
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />
      default:
        return <EmptyIcon color="disabled" fontSize="small" />
    }
  }

  const getCategoryCompletion = (categoryId: string) => {
    const categorySheets = LIASSE_SHEETS.filter(s => s.category === categoryId)
    if (categorySheets.length === 0) return 0

    const totalCompletion = categorySheets.reduce((sum, sheet) => {
      return sum + (sheetProgress[sheet.id]?.completion || 0)
    }, 0)

    return Math.round(totalCompletion / categorySheets.length)
  }

  const renderSheetContent = () => {
    const sheet = LIASSE_SHEETS.find(s => s.id === selectedSheet)
    if (!sheet) return null

    switch (selectedSheet) {
      // Page de couverture
      case 'couverture':
        return <Couverture />
      
      // États financiers principaux
      case 'bilan':
        return <BilanSynthetique />
      case 'actif':
        return <BilanActifSYSCOHADA />
      case 'passif':
        return <BilanPassifSYSCOHADA />
      case 'resultat':
        return <CompteResultatSYSCOHADA />
      case 'tft':
        return <TableauFluxTresorerieSYSCOHADA />
      
      // Fiches complémentaires
      case 'fiche_r1':
        return <FicheR1SYSCOHADA />
      case 'fiche_r2':
        return <FicheR2SYSCOHADA />
      case 'fiche_r3':
        return <FicheR3SYSCOHADA />
      case 'fiche_r4':
        return <FicheR4SYSCOHADA />
      
      // Pages de garde
      case 'garde':
        return <PageGardeSYSCOHADA />
      case 'page_garde':
        return <PageGarde />
      case 'recevabilite':
        return <Recevabilite />
      
      // Tables de référence et notes
      case 'note36_codes':
      case 'note36_nomenclature':
        return <Note36Tables />
      
      // Notes annexes complètes (NOTE 1 à NOTE 39)
      case 'notes_annexes':
        return <NotesAnnexesSYSCOHADA />
      case 'note1':
        return <Note1SYSCOHADA />
      case 'note2':
        return <Note2SYSCOHADA />
      // Note 3 sub-tabs
      case 'note3a': return <Note3SYSCOHADA initialTab={0} />
      case 'note3b': return <Note3SYSCOHADA initialTab={1} />
      case 'note3c': return <Note3SYSCOHADA initialTab={2} />
      case 'note3c_bis': return <Note3SYSCOHADA initialTab={3} />
      case 'note3d': return <Note3SYSCOHADA initialTab={4} />
      case 'note3e': return <Note3SYSCOHADA initialTab={5} />

      case 'note4':
        return <Note4SYSCOHADA />
      case 'note5':
        return <Note5SYSCOHADA />
      case 'note6':
        return <Note6SYSCOHADA />
      case 'note7':
        return <Note7SYSCOHADA />

      // Note 8 sub-notes
      case 'note8a':
      case 'note8b':
      case 'note8c': {
        const config8 = NOTES_CONFIGS[selectedSheet]
        if (config8) return <NotesRestantes {...config8} />
        return null
      }

      case 'note9':
        return <Note9SYSCOHADA />
      case 'note10':
        return <Note10SYSCOHADA />
      case 'note11':
        return <Note11SYSCOHADA />
      case 'note12':
      case 'note13':
      case 'note18':
      case 'note20':
      case 'note21':
      case 'note22':
      case 'note23':
      case 'note24':
      case 'note25':
      case 'note26':
      case 'note28':
      case 'note29':
      case 'note30':
      case 'note31':
      case 'note32':
      case 'note33':
      case 'note34':
      case 'note35':
      case 'note37':
      case 'note38':
      case 'note39': {
        const noteConfig = NOTES_CONFIGS[selectedSheet]
        if (noteConfig) return <NotesRestantes {...noteConfig} />
        return <NotesRestantes numeroNote={parseInt(selectedSheet.replace('note', ''))}
                             titre={sheet.title.split(' - ')[1] || sheet.title}
                             description={sheet.description || ''}
                             contenuPrevu={[`Contenu de la ${sheet.title}`]}
                             priorite="moyenne" />
      }

      // Note 15 sub-notes
      case 'note15a':
      case 'note15b': {
        const config15 = NOTES_CONFIGS[selectedSheet]
        if (config15) return <NotesRestantes {...config15} />
        return null
      }

      // Note 16 sub-notes
      case 'note16a':
      case 'note16b':
      case 'note16b_bis':
      case 'note16c': {
        const config16 = NOTES_CONFIGS[selectedSheet]
        if (config16) return <NotesRestantes {...config16} />
        return null
      }

      // Note 27 sub-notes
      case 'note27a':
      case 'note27b': {
        const config27 = NOTES_CONFIGS[selectedSheet]
        if (config27) return <NotesRestantes {...config27} />
        return null
      }
      case 'note14':
        return <Note14SYSCOHADA />
      case 'note17':
        return <Note17SYSCOHADA />
      case 'note19':
        return <Note19SYSCOHADA />
      case 'note36_details':
        return <Note36Tables />
      
      // Compléments spécialisés
      case 'comp_charges':
      case 'complement_charges':
        return <ComplementCharges />
      case 'complement_produits':
        return <ComplementProduits />
      case 'comp_tva':
      case 'comp_tva_2':
      case 'supplement_tva':
        return <SupplementTVA />
      case 'supplement_is':
        return <SupplementImpotSociete />
      case 'supplement_avantages':
        return <SupplementAvantagesFiscaux />
      
      // Tous les suppléments (SUPPL1 à SUPPL7)
      case 'suppl1':
        return <SupplementTVA />
      case 'suppl2':
        return <SupplementImpotSociete />
      case 'suppl3':
        return <SupplementAvantagesFiscaux />
      case 'suppl4':
        return <ComplementCharges />
      case 'suppl5':
        return <ComplementProduits />
      case 'suppl6':
        return <FicheRenseignements />
      case 'suppl7':
        return <FicheRenseignements />
      
      // Gardes spécialisées
      case 'garde_dgi_ins':
      case 'garde_bic':
      case 'garde_bnc':
      case 'garde_ba':
      case 'garde_301':
      case 'garde_302':
      case 'garde_3':
        return <PageGarde />
      case 'notes_dgi_ins':
        return <NotesRestantes numeroNote={0} 
                             titre="Notes DGI-INS" 
                             description="Notes spécifiques pour la Direction Générale des Impôts et l'Institut National de la Statistique" 
                             contenuPrevu={['Informations statistiques', 'Données fiscales spécialisées', 'Reporting administratif']} 
                             priorite="moyenne" />
      
      // Tables de calcul des impôts
      case 'tables_calcul_impots':
        return <TablesCalculImpots />
      
      // Tableaux supplémentaires
      case 'tableaux_supplementaires':
        return <TableauxSupplementaires />
      
      // Fiche de renseignements
      case 'fiche_renseignements':
        return <FicheRenseignements />
      
      // Commentaires
      case 'commentaire':
        return <NotesRestantes numeroNote={0} 
                             titre="Commentaires Généraux" 
                             description="Zone de commentaires libres sur la liasse fiscale" 
                             contenuPrevu={['Observations générales', 'Points d\'attention', 'Notes explicatives']} 
                             priorite="basse" />
      
      // Autres composants en développement
      default:
        return (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              {sheet.title}
            </Typography>
            <Typography color="textSecondary" paragraph>
              {sheet.description || 'Ce tableau sera bientôt disponible'}
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Le composant pour "{sheet.name}" est en cours de développement
            </Alert>
          </Paper>
        )
    }
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Drawer de navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {/* En-tête du drawer */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Liasse Fiscale SYSCOHADA
            </Typography>
            
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Progression globale
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {globalProgress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={globalProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: globalProgress === 100
                      ? theme.palette.success.main
                      : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  },
                }}
              />
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip
                label={`${LIASSE_SHEETS.filter(s => sheetProgress[s.id]?.status === 'complete').length} / ${LIASSE_SHEETS.length} complétés`}
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip
                label={`${LIASSE_SHEETS.filter(s => s.required).length} obligatoires`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>
          </Stack>
        </Box>

        {/* Liste des tableaux par catégorie */}
        <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
          {SHEET_CATEGORIES.map(category => {
            const categorySheets = LIASSE_SHEETS.filter(s => s.category === category.id)
            const categoryCompletion = getCategoryCompletion(category.id)
            const isExpanded = expandedCategories[category.id]

            return (
              <Box key={category.id}>
                <ListItemButton
                  onClick={() => handleCategoryToggle(category.id)}
                  sx={{
                    backgroundColor: alpha(category.color, 0.04),
                    '&:hover': {
                      backgroundColor: alpha(category.color, 0.08),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {isExpanded ? <FolderOpenIcon /> : <FolderIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                          {category.label}
                        </Typography>
                        <Chip
                          label={`${categorySheets.length}`}
                          size="small"
                          sx={{ height: 18, fontSize: '0.7rem' }}
                        />
                      </Stack>
                    }
                    secondary={
                      <LinearProgress
                        variant="determinate"
                        value={categoryCompletion}
                        sx={{
                          mt: 0.5,
                          height: 3,
                          borderRadius: 1.5,
                          backgroundColor: alpha(category.color, 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: category.color,
                            borderRadius: 1.5,
                          },
                        }}
                      />
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" size="small">
                      {isExpanded ? <ExpandIcon /> : <CollapseIcon />}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItemButton>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {categorySheets.map(sheet => {
                      const progress = sheetProgress[sheet.id]
                      const isSelected = selectedSheet === sheet.id

                      return (
                        <ListItemButton
                          key={sheet.id}
                          selected={isSelected}
                          onClick={() => handleSheetSelect(sheet.id)}
                          sx={{
                            pl: 4,
                            borderLeft: `3px solid ${isSelected ? category.color : 'transparent'}`,
                            backgroundColor: isSelected
                              ? alpha(theme.palette.primary.main, 0.08)
                              : 'rgba(255, 255, 255, 0.05)',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {getSheetIcon(progress?.status || 'empty')}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                                  {sheet.title}
                                </Typography>
                                {sheet.required && (
                                  <Chip
                                    label="Requis"
                                    size="small"
                                    color="error"
                                    sx={{ height: 16, fontSize: '0.65rem' }}
                                  />
                                )}
                              </Stack>
                            }
                            secondary={
                              progress?.lastModified && (
                                <Typography variant="caption" color="textSecondary">
                                  Modifié {new Date(progress.lastModified).toLocaleDateString('fr-FR')}
                                </Typography>
                              )
                            }
                          />
                        </ListItemButton>
                      )
                    })}
                  </List>
                </Collapse>
              </Box>
            )
          })}
        </List>

        {/* Actions du drawer */}
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Stack spacing={1}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayIcon />}
              onClick={() => setShowValidation(true)}
            >
              Valider la liasse
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ExportIcon />}
              onClick={handleExportLiasse}
            >
              Exporter
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* Zone de contenu principal */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Barre d'outils */}
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
                <Link color="inherit" href="#" underline="hover">
                  Liasse Fiscale
                </Link>
                <Typography color="primary">
                  {LIASSE_SHEETS.find(s => s.id === selectedSheet)?.name || 'Tableau'}
                </Typography>
              </Breadcrumbs>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Tooltip title={isEditMode ? "Mode lecture" : "Mode édition"}>
                <IconButton onClick={() => setIsEditMode(!isEditMode)}>
                  {isEditMode ? <UnlockIcon /> : <LockIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Imprimer">
                <IconButton onClick={handlePrintSheet}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sauvegarder">
                <IconButton onClick={handleSaveSheet}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrevIcon />}
                onClick={() => {
                  const currentIndex = LIASSE_SHEETS.findIndex(s => s.id === selectedSheet)
                  if (currentIndex > 0) {
                    setSelectedSheet(LIASSE_SHEETS[currentIndex - 1].id)
                  }
                }}
                disabled={LIASSE_SHEETS.findIndex(s => s.id === selectedSheet) === 0}
              >
                Précédent
              </Button>
              <Button
                variant="outlined"
                size="small"
                endIcon={<NextIcon />}
                onClick={() => {
                  const currentIndex = LIASSE_SHEETS.findIndex(s => s.id === selectedSheet)
                  if (currentIndex < LIASSE_SHEETS.length - 1) {
                    setSelectedSheet(LIASSE_SHEETS[currentIndex + 1].id)
                  }
                }}
                disabled={LIASSE_SHEETS.findIndex(s => s.id === selectedSheet) === LIASSE_SHEETS.length - 1}
              >
                Suivant
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Zone de contenu scrollable */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            }
          >
            {renderSheetContent()}
          </Suspense>
        </Box>
      </Box>

      {/* Dialog de validation */}
      <Dialog
        open={showValidation}
        onClose={() => setShowValidation(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <AssessmentIcon color="primary" />
            <Typography variant="h6">Validation de la Liasse Fiscale</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity="info">
              La validation vérifie la cohérence et la complétude de votre liasse fiscale
            </Alert>
            
            {/* Résultats de validation par catégorie */}
            {SHEET_CATEGORIES.map(category => {
              const categorySheets = LIASSE_SHEETS.filter(s => s.category === category.id)
              const requiredSheets = categorySheets.filter(s => s.required)
              const completedSheets = categorySheets.filter(s => 
                sheetProgress[s.id]?.status === 'complete'
              )

              return (
                <Paper key={category.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {category.label}
                      </Typography>
                      <Chip
                        label={`${completedSheets.length}/${categorySheets.length}`}
                        size="small"
                        color={completedSheets.length === categorySheets.length ? 'success' : 'default'}
                      />
                    </Stack>
                    
                    {requiredSheets.length > 0 && completedSheets.length < requiredSheets.length && (
                      <Alert severity="warning" sx={{ py: 0.5 }}>
                        {requiredSheets.length - completedSheets.filter(s => s.required).length} tableau(x) obligatoire(s) non complété(s)
                      </Alert>
                    )}
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowValidation(false)}>
            Fermer
          </Button>
          <Button variant="contained" startIcon={<CheckIcon />} onClick={handleValidationComplete}>
            Lancer la validation complète
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModernLiasseComplete