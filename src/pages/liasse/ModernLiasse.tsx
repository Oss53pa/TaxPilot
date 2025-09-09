/**
 * Module Liasse Fiscale Moderne - Interface SaaS Professionnelle SYSCOHADA
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
  AppBar,
  Toolbar,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  ListItemSecondaryAction,
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  AccountBalance as BalanceIcon,
  TrendingUp as TrendingIcon,
  TableChart as TableIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon,
  Notes as NotesIcon,
  Assessment as AssessmentIcon,
  Description as DocIcon,
  Calculate as CalcIcon,
  Security as SecurityIcon,
  GetApp as ExportIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Visibility as ViewIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CompleteIcon,
  RadioButtonUnchecked as EmptyIcon,
  HourglassEmpty as PartialIcon,
} from '@mui/icons-material'

// Import des composants de tableaux
import BilanActif from '../../components/liasse/sheets/BilanActif'
import { LIASSE_SHEETS, SHEET_CATEGORIES, SheetConfig } from '../../config/liasseFiscaleSheets'
import '../../styles/liasse-fixes.css'

const DRAWER_WIDTH = 360

interface LiasseSection {
  id: string
  title: string
  icon: React.ReactElement
  completion: number
  status: 'complete' | 'partial' | 'empty' | 'error'
  category: 'financials' | 'notes' | 'declarations'
  subsections?: LiasseSection[]
}

interface LiasseNote {
  id: string
  number: string
  title: string
  content: any
  completion: number
  status: 'complete' | 'partial' | 'empty'
}

interface BilanEntry {
  ref: string
  label: string
  exerciceN: number | null
  exerciceN1: number | null
  note?: string
  isHeader?: boolean
  isSubHeader?: boolean
  isTotal?: boolean
  level?: number
}

const ModernLiasse: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('bilan-actif')
  const [currentNote, setCurrentNote] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState(['financials', 'notes'])

  // Structure complète de la liasse SYSCOHADA
  const liasseSections: LiasseSection[] = [
    {
      id: 'bilan-actif',
      title: 'Bilan - Actif',
      icon: <BalanceIcon />,
      completion: 95,
      status: 'complete',
      category: 'financials'
    },
    {
      id: 'bilan-passif',
      title: 'Bilan - Passif',
      icon: <BalanceIcon />,
      completion: 92,
      status: 'complete',
      category: 'financials'
    },
    {
      id: 'compte-resultat',
      title: 'Compte de Résultat',
      icon: <TrendingIcon />,
      completion: 88,
      status: 'complete',
      category: 'financials'
    },
    {
      id: 'tafire',
      title: 'TAFIRE',
      icon: <TableIcon />,
      completion: 75,
      status: 'partial',
      category: 'financials'
    },
    {
      id: 'flux-tresorerie',
      title: 'Flux de Trésorerie',
      icon: <MoneyIcon />,
      completion: 70,
      status: 'partial',
      category: 'financials'
    },
    {
      id: 'variation-capitaux',
      title: 'Variation Capitaux Propres',
      icon: <TimelineIcon />,
      completion: 65,
      status: 'partial',
      category: 'financials'
    },
    {
      id: 'notes-annexes',
      title: 'Notes Annexes',
      icon: <NotesIcon />,
      completion: 80,
      status: 'partial',
      category: 'notes'
    },
    {
      id: 'dsf',
      title: 'DSF',
      icon: <AssessmentIcon />,
      completion: 60,
      status: 'partial',
      category: 'declarations'
    },
    {
      id: 'fiches-impots',
      title: 'Fiches Impôts',
      icon: <CalcIcon />,
      completion: 45,
      status: 'partial',
      category: 'declarations'
    }
  ]

  // Notes annexes
  const liasseNotes: LiasseNote[] = [
    {
      id: '1',
      number: 'NOTE ANNEXE N° 1',
      title: 'RÈGLES ET MÉTHODES COMPTABLES',
      content: {
        'Référentiel comptable': 'Système Comptable OHADA révisé',
        'Méthode d\'évaluation': 'Coût historique',
        'Monnaie de présentation': 'Franc CFA (XOF)'
      },
      completion: 100,
      status: 'complete'
    },
    {
      id: '2',
      number: 'NOTE ANNEXE N° 2',
      title: 'IMMOBILISATIONS INCORPORELLES',
      content: {
        tableau: {
          colonnes: ['Libellé', 'Valeur brute N-1', 'Acquisitions', 'Cessions', 'Valeur brute N', 'Amortissements', 'VNC N'],
          lignes: [
            ['Logiciels', '3 500 000', '1 200 000', '0', '4 700 000', '2 200 000', '2 500 000'],
            ['Brevets', '800 000', '0', '0', '800 000', '450 000', '350 000'],
            ['TOTAL', '4 300 000', '1 200 000', '0', '5 500 000', '2 650 000', '2 850 000']
          ]
        }
      },
      completion: 95,
      status: 'complete'
    }
  ]

  // Données du bilan actif
  const bilanActifData: BilanEntry[] = [
    {
      ref: 'AA',
      label: 'ACTIF IMMOBILISÉ',
      exerciceN: null,
      exerciceN1: null,
      isHeader: true,
      level: 0
    },
    {
      ref: 'AB',
      label: 'Charges immobilisées',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      level: 1
    },
    {
      ref: 'AC',
      label: 'Frais de développement',
      exerciceN: 0,
      exerciceN1: 0,
      note: '2.1',
      level: 2
    },
    {
      ref: 'AD',
      label: 'Brevets, licences, logiciels',
      exerciceN: 2500000,
      exerciceN1: 1800000,
      note: '2.2',
      level: 2
    },
    {
      ref: 'AE',
      label: 'Fonds commercial',
      exerciceN: 0,
      exerciceN1: 0,
      note: '2.3',
      level: 2
    },
    {
      ref: 'AF',
      label: 'Autres immobilisations incorporelles',
      exerciceN: 350000,
      exerciceN1: 280000,
      note: '2.4',
      level: 2
    },
    {
      ref: 'AG',
      label: 'Immobilisations corporelles',
      exerciceN: null,
      exerciceN1: null,
      isSubHeader: true,
      level: 1
    },
    {
      ref: 'AH',
      label: 'Terrains',
      exerciceN: 45000000,
      exerciceN1: 45000000,
      note: '3.1',
      level: 2
    },
    {
      ref: 'AI',
      label: 'Bâtiments',
      exerciceN: 125000000,
      exerciceN1: 135000000,
      note: '3.2',
      level: 2
    },
    {
      ref: 'AJ',
      label: 'Matériel et outillage',
      exerciceN: 18500000,
      exerciceN1: 22000000,
      note: '3.3',
      level: 2
    },
    {
      ref: 'AZ',
      label: 'TOTAL ACTIF IMMOBILISÉ',
      exerciceN: 191350000,
      exerciceN1: 204080000,
      isTotal: true,
      level: 0
    }
  ]

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return theme.palette.success.main
      case 'partial': return theme.palette.warning.main
      case 'empty': return theme.palette.info.main
      case 'error': return theme.palette.error.main
      default: return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckIcon fontSize="small" />
      case 'partial': return <WarningIcon fontSize="small" />
      case 'empty': return <ErrorIcon fontSize="small" />
      case 'error': return <ErrorIcon fontSize="small" />
      default: return null
    }
  }

  const formatAmount = (amount: number | null) => {
    if (amount === null) return ''
    if (amount === 0) return '-'
    return new Intl.NumberFormat('fr-FR').format(amount)
  }

  const getRowStyle = (entry: BilanEntry) => {
    if (entry.isHeader) {
      return {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.text.primary,
        fontWeight: 700,
        fontSize: '1.1rem'
      }
    }
    if (entry.isSubHeader) {
      return {
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        color: theme.palette.text.primary,
        fontWeight: 600,
        fontStyle: 'italic'
      }
    }
    if (entry.isTotal) {
      return {
        backgroundColor: alpha(theme.palette.success.main, 0.1),
        color: theme.palette.text.primary,
        fontWeight: 700,
        borderTop: `2px solid ${theme.palette.success.main}`,
        borderBottom: `2px solid ${theme.palette.success.main}`
      }
    }
    return {
      color: theme.palette.text.primary
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const getCurrentSection = () => {
    return liasseSections.find(section => section.id === activeSection)
  }

  const globalCompletion = Math.round(
    liasseSections.reduce((sum, section) => sum + section.completion, 0) / liasseSections.length
  )

  const renderBilanActif = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: theme.palette.primary.main }}>
        BILAN - ACTIF (en FCFA)
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Les montants doivent être exprimés en FCFA. Référentiel SYSCOHADA révisé.
      </Alert>

      <TableContainer component={Paper} elevation={0} sx={{ border: `2px solid ${theme.palette.primary.main}` }}>
        <Table size="small" className="liasse-table">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '60px' }}>Réf</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>ACTIF</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '60px' }} align="center">Note</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                Exercice N<br />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  31/12/2024
                </Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                Exercice N-1<br />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  31/12/2023
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bilanActifData.map((entry, index) => (
              <TableRow key={index} sx={getRowStyle(entry)}>
                <TableCell sx={{ 
                  fontWeight: entry.isHeader || entry.isTotal ? 700 : 400,
                  color: 'inherit'
                }}>
                  {entry.ref}
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: entry.isHeader || entry.isTotal ? 700 : entry.isSubHeader ? 600 : 400,
                  pl: (entry.level || 0) * 3 + 1,
                  color: 'inherit'
                }}>
                  {entry.label}
                </TableCell>
                <TableCell align="center" sx={{ color: 'inherit' }}>
                  {entry.note && (
                    <Chip 
                      label={entry.note} 
                      size="small" 
                      color="info"
                      sx={{ fontSize: '0.7rem', height: '18px' }}
                    />
                  )}
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'inherit' }}>
                  {editMode && entry.exerciceN !== null && !entry.isHeader && !entry.isSubHeader && !entry.isTotal ? (
                    <TextField
                      size="small"
                      type="number"
                      defaultValue={entry.exerciceN}
                      variant="standard"
                      sx={{ width: '120px' }}
                      inputProps={{ 
                        style: { 
                          textAlign: 'right', 
                          fontSize: '0.875rem',
                          fontFamily: 'monospace'
                        } 
                      }}
                    />
                  ) : (
                    formatAmount(entry.exerciceN)
                  )}
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'inherit' }}>
                  {formatAmount(entry.exerciceN1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  const renderNotes = () => {
    const note = liasseNotes[currentNote]
    if (!note) return null

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {note.number}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {note.title}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Note {currentNote + 1} sur {liasseNotes.length}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 1 }}>
          <IconButton 
            onClick={() => setCurrentNote(Math.max(0, currentNote - 1))} 
            disabled={currentNote === 0}
          >
            <PrevIcon />
          </IconButton>
          
          <Chip 
            label={`${currentNote + 1} / ${liasseNotes.length}`}
            sx={{ 
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              fontWeight: 600,
              minWidth: 80
            }}
          />
          
          <IconButton 
            onClick={() => setCurrentNote(Math.min(liasseNotes.length - 1, currentNote + 1))} 
            disabled={currentNote === liasseNotes.length - 1}
          >
            <NextIcon />
          </IconButton>
        </Box>

        <Paper sx={{ p: 3, minHeight: '400px' }}>
          {note.content.tableau ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                    {note.content.tableau.colonnes.map((col: string, index: number) => (
                      <TableCell key={index} sx={{ color: 'white', fontWeight: 700 }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {note.content.tableau.lignes.map((row: string[], index: number) => (
                    <TableRow key={index}>
                      {row.map((cell: string, cellIndex: number) => (
                        <TableCell 
                          key={cellIndex} 
                          sx={{
                            fontWeight: cell.includes('TOTAL') ? 700 : 400,
                            backgroundColor: cell.includes('TOTAL') ? alpha(theme.palette.primary.main, 0.1) : 'inherit'
                          }}
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box>
              {Object.entries(note.content).map(([key, value]) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {key}
                  </Typography>
                  <Typography variant="body1">
                    {value as string}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'bilan-actif':
        return renderBilanActif()
      case 'notes-annexes':
        return renderNotes()
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {getCurrentSection()?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contenu détaillé en cours d'implémentation...
            </Typography>
          </Box>
        )
    }
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      {/* Sidebar */}
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
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Liasse SYSCOHADA 2024
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            SARL DEMO FISCASYNC
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Complétude globale
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {globalCompletion}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={globalCompletion}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.divider, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }}
            />
          </Box>

          <Chip 
            label={globalCompletion >= 80 ? 'Prête à soumettre' : 'En cours'}
            color={globalCompletion >= 80 ? 'success' : 'warning'}
            size="small"
          />
        </Box>

        <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
          {['financials', 'notes', 'declarations'].map(category => {
            const categoryTitle = 
              category === 'financials' ? 'États financiers' :
              category === 'notes' ? 'Notes annexes' : 'Déclarations'
            
            const categorySections = liasseSections.filter(section => section.category === category)
            const isExpanded = expandedCategories.includes(category)

            return (
              <Box key={category}>
                <ListItem 
                  button 
                  onClick={() => toggleCategory(category)}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                  }}
                >
                  <ListItemText 
                    primary={categoryTitle}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: 'white'
                    }}
                  />
                  {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                </ListItem>

                {isExpanded && categorySections.map(section => (
                  <ListItem key={section.id} disablePadding>
                    <ListItemButton
                      selected={activeSection === section.id}
                      onClick={() => setActiveSection(section.id)}
                      sx={{
                        pl: 3,
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          borderRight: `3px solid ${theme.palette.primary.main}`,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Badge 
                          badgeContent={getStatusIcon(section.status)}
                          overlap="circular"
                        >
                          {section.icon}
                        </Badge>
                      </ListItemIcon>
                      <ListItemText 
                        primary={section.title}
                        primaryTypographyProps={{
                          sx: { color: 'white', fontWeight: 500 }
                        }}
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={section.completion}
                              size="small"
                              sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.divider, 0.2),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getStatusColor(section.status),
                                  borderRadius: 2,
                                }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              {section.completion}% complété
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </Box>
            )
          })}
        </List>

        <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ExportIcon />}
            sx={{ mb: 1 }}
          >
            Exporter liasse
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<PrintIcon />}
          >
            Imprimer
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {getCurrentSection()?.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Liasse fiscale SYSCOHADA - Exercice 2024
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Chip 
                icon={getStatusIcon(getCurrentSection()?.status || '')}
                label={`${getCurrentSection()?.completion}% complété`}
                color={getCurrentSection()?.status === 'complete' ? 'success' : 
                       getCurrentSection()?.status === 'partial' ? 'warning' : 'default'}
                size="small"
              />
              
              <Divider orientation="vertical" flexItem />
              
              <Button
                variant={editMode ? 'contained' : 'outlined'}
                size="small"
                startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Sauvegarder' : 'Éditer'}
              </Button>
              
              <IconButton size="small" color="primary">
                <ViewIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {loading ? (
            <Box>
              <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={400} />
            </Box>
          ) : (
            <Paper elevation={1} sx={{ p: 3 }}>
              {renderContent()}
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default ModernLiasse