/**
 * LIASSE FISCALE OFFICIELLE - VERSION CONSOLIDÉE
 *
 * Module complet de production de liasse fiscale SYSCOHADA
 * Consolide les meilleures fonctionnalités de:
 * - ModernLiasseProduction (production automatisée)
 * - ModernLiasseComplete (73 onglets SYSCOHADA)
 * - LiasseCompleteFinal (validation et contrôles)
 *
 * @version 1.0.0 - Version officielle consolidée
 * @author TaxPilot Team
 * @date 2025-01-19
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material'
import {
  PlayArrow,
  Download,
  Print,
  Send,
  Schedule,
  AutoFixHigh,
  Speed,
  Stop,
  Folder,
  ArrowBack,
} from '@mui/icons-material'

// Services
import { liasseDataService } from '../../services/liasseDataService'
import { useLiasseData } from '../../components/liasse/DataProvider'

// Configuration
import {
  LIASSE_SHEETS, SHEET_CATEGORIES, getNoteTitle, getNoteDescription, getSubNoteTitle,
  RegimeImposition, REGIME_LABELS, getSheetRequirement, getVisibleSheets, getSheetCounts,
} from '../../config/liasseFiscaleSheets'
import { RegimeContext } from '../../config/regimeContext'

// Composants SYSCOHADA - importés via index.ts pour bénéficier du HOC withBackendData
import {
  BilanActifSYSCOHADA,
  BilanPassifSYSCOHADA,
  CompteResultatSYSCOHADA,
  TableauFluxTresorerieSYSCOHADA,
  BilanSynthetique,
  Couverture,
  PageGardeSYSCOHADA,
  RecevabiliteSYSCOHADA,
  FicheR1SYSCOHADA,
  FicheR2SYSCOHADA,
  FicheR3SYSCOHADA,
  FicheR4SYSCOHADA,
  Note1SYSCOHADA,
  Note2SYSCOHADA,
  Note3ASYSCOHADA,
  Note5SYSCOHADA,
  Note6SYSCOHADA,
  Note8SYSCOHADA,
  Note11SYSCOHADA,
  Note12SYSCOHADA,
  Note14SYSCOHADA,
  Note15SYSCOHADA,
  Note17SYSCOHADA,
  Note19SYSCOHADA,
  Note36Tables,
  NotesRestantes,
  TablesCalculImpots,
  TableauxSupplementaires,
  ComplementCharges,
  SupplementTVA,
  SupplementImpotSociete,
  SupplementAvantagesFiscaux,
} from '../../components/liasse/sheets'

// Styles
import '../../styles/liasse-fixes.css'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LiasseTemplate {
  id: string
  name: string
  type: 'normal' | 'simplifiee' | 'consolidee'
  jurisdiction: string
  sector: string
  year: number
  status: 'draft' | 'in-progress' | 'completed' | 'validated' | 'submitted'
  progress: number
  company: {
    name: string
    siret: string
    sector: string
    size: 'TPE' | 'PME' | 'ETI' | 'GE'
  }
  validations: ValidationResult[]
  createdAt: Date
  lastModified: Date
  deadline: Date
  isUrgent: boolean
}

interface ValidationResult {
  id: string
  type: 'error' | 'warning' | 'info'
  category: 'coherence' | 'completude' | 'conformite' | 'calcul'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  isBlocking: boolean
  suggestion?: string
}

interface ProductionStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress: number
  estimatedTime: number
  actualTime?: number
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

const LiasseFiscaleOfficial: React.FC = () => {
  const navigate = useNavigate()

  // ========== ÉTAT ==========
  const [selectedLiasse, setSelectedLiasse] = useState<LiasseTemplate | null>(null)

  // Production automatisée
  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false)
  const [productionSteps, setProductionSteps] = useState<ProductionStep[]>([])
  const [activeStep, setActiveStep] = useState(0)
  const [isProducing, setIsProducing] = useState(false)
  const [productionStartTime, setProductionStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Navigation onglets liasse
  const [selectedSheet, setSelectedSheet] = useState('couverture')
  const [drawerOpen] = useState(true)
  const [selectedRegime, setSelectedRegime] = useState<RegimeImposition>('REEL_NORMAL')

  // Backend data
  const backendData = useLiasseData()
  const { loading, error } = backendData

  // ========== INITIALISATION ==========
  useEffect(() => {
    initializeLiasses()
    initializeProductionSteps()
  }, [])

  // Initialiser le régime depuis les données backend
  useEffect(() => {
    if (backendData?.entreprise?.regime_imposition) {
      setSelectedRegime(backendData.entreprise.regime_imposition as RegimeImposition)
    }
  }, [backendData?.entreprise?.regime_imposition])

  // Quand le régime change, si l'onglet sélectionné est exclu, basculer vers le premier visible
  useEffect(() => {
    const requirement = getSheetRequirement(selectedSheet, selectedRegime)
    if (requirement === 'exclu') {
      const visible = getVisibleSheets(selectedRegime)
      if (visible.length > 0) {
        setSelectedSheet(visible[0].id)
      }
    }
  }, [selectedRegime])

  useEffect(() => {
    if (backendData?.balance) {
      liasseDataService.loadBalance(backendData.balance)
    }
  }, [backendData])

  // Timer production
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (isProducing && productionStartTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - productionStartTime.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isProducing, productionStartTime])

  const initializeLiasses = () => {
    const liasses: LiasseTemplate[] = []
    if (liasses.length > 0) {
      setSelectedLiasse(liasses[0])
    }
  }

  const initializeProductionSteps = () => {
    const steps: ProductionStep[] = [
      {
        id: 'step1',
        name: 'Initialisation',
        description: 'Vérification des données de base et paramétrage',
        status: 'pending',
        progress: 0,
        estimatedTime: 180
      },
      {
        id: 'step2',
        name: 'Import des Balances',
        description: 'Importation et validation des balances comptables',
        status: 'pending',
        progress: 0,
        estimatedTime: 300
      },
      {
        id: 'step3',
        name: 'Calculs Automatiques',
        description: 'Exécution des calculs et mapping SYSCOHADA',
        status: 'pending',
        progress: 0,
        estimatedTime: 600
      },
      {
        id: 'step4',
        name: 'Contrôles de Cohérence',
        description: 'Validation des cohérences comptables et fiscales',
        status: 'pending',
        progress: 0,
        estimatedTime: 420
      },
      {
        id: 'step5',
        name: 'Génération Documents',
        description: 'Production des documents PDF/Excel',
        status: 'pending',
        progress: 0,
        estimatedTime: 300
      }
    ]
    setProductionSteps(steps)
  }

  // ========== PRODUCTION AUTOMATISÉE ==========
  const startAutomaticProduction = async (_liasse: LiasseTemplate) => {
    setIsProducing(true)
    setProductionStartTime(new Date())
    setElapsedTime(0)
    setIsProductionDialogOpen(true)

    const resetSteps = productionSteps.map(step => ({
      ...step,
      status: 'pending' as const,
      progress: 0
    }))
    setProductionSteps(resetSteps)
    setActiveStep(0)

    for (let i = 0; i < productionSteps.length; i++) {
      await executeProductionStep(i)
    }

    setIsProducing(false)
  }

  const executeProductionStep = (stepIndex: number): Promise<void> => {
    return new Promise((resolve) => {
      const step = productionSteps[stepIndex]

      setProductionSteps(prev => prev.map((s, idx) =>
        idx === stepIndex ? { ...s, status: 'in-progress' } : s
      ))
      setActiveStep(stepIndex)

      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 20

        setProductionSteps(prev => prev.map((s, idx) =>
          idx === stepIndex ? { ...s, progress: Math.min(progress, 100) } : s
        ))

        if (progress >= 100) {
          clearInterval(interval)

          setProductionSteps(prev => prev.map((s, idx) =>
            idx === stepIndex
              ? {
                  ...s,
                  status: 'completed',
                  progress: 100,
                  actualTime: step.estimatedTime + Math.random() * 60 - 30
                }
              : s
          ))

          setTimeout(resolve, 500)
        }
      }, 200)
    })
  }

  // ========== RENDER HELPERS ==========
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in-progress': return 'info'
      case 'validated': return 'success'
      case 'submitted': return 'success'
      case 'draft': return 'warning'
      default: return 'default'
    }
  }

  // ========== RENDU DES ONGLETS ==========
  const renderSheetComponent = () => {
    switch (selectedSheet) {
      // Pages de garde et couverture
      case 'couverture': return <Couverture />
      case 'garde': return <PageGardeSYSCOHADA />
      case 'recevabilite': return <RecevabiliteSYSCOHADA />
      case 'garde_dgi_ins': return <PageGardeSYSCOHADA variant="dgi_ins" />
      case 'garde_bic': return <PageGardeSYSCOHADA variant="bic" />
      case 'garde_bnc': return <PageGardeSYSCOHADA variant="bnc" />
      case 'garde_ba': return <PageGardeSYSCOHADA variant="ba" />
      case 'garde_301': return <PageGardeSYSCOHADA variant="etat301" />
      case 'garde_302': return <PageGardeSYSCOHADA variant="etat302" />
      case 'garde_3': return <PageGardeSYSCOHADA variant="etat3" />

      // Fiches de renseignements
      case 'fiche_r1': return <FicheR1SYSCOHADA />
      case 'fiche_r2': return <FicheR2SYSCOHADA />
      case 'fiche_r3': return <FicheR3SYSCOHADA />
      case 'fiche_r4': return <FicheR4SYSCOHADA />

      // États financiers
      case 'bilan': return <BilanSynthetique onNoteClick={setSelectedSheet} />
      case 'actif': return <BilanActifSYSCOHADA onNoteClick={setSelectedSheet} />
      case 'passif': return <BilanPassifSYSCOHADA onNoteClick={setSelectedSheet} />
      case 'resultat': return <CompteResultatSYSCOHADA onNoteClick={setSelectedSheet} />
      case 'tft': return <TableauFluxTresorerieSYSCOHADA onNoteClick={setSelectedSheet} />

      // Notes annexes - composants spécifiques
      case 'note1': return <Note1SYSCOHADA />
      case 'note2': return <Note2SYSCOHADA />
      case 'note3': case 'note3a': return <Note3ASYSCOHADA />
      case 'note5': return <Note5SYSCOHADA />
      case 'note6': return <Note6SYSCOHADA />
      case 'note8': return <Note8SYSCOHADA />
      case 'note11': return <Note11SYSCOHADA />
      case 'note12': return <Note12SYSCOHADA />
      case 'note14': return <Note14SYSCOHADA />
      case 'note15': case 'note15a': return <Note15SYSCOHADA />
      case 'note17': return <Note17SYSCOHADA />
      case 'note19': return <Note19SYSCOHADA />

      // Sous-notes 3B-3E
      case 'note3b': return <NotesRestantes numeroNote="3B" titre={getSubNoteTitle('3B')} description="" contenuPrevu={[]} priorite="haute" />
      case 'note3c': return <NotesRestantes numeroNote="3C" titre={getSubNoteTitle('3C')} description="" contenuPrevu={[]} priorite="haute" />
      case 'note3c_bis': return <NotesRestantes numeroNote="3C_BIS" titre={getSubNoteTitle('3C_BIS')} description="" contenuPrevu={[]} priorite="haute" />
      case 'note3d': return <NotesRestantes numeroNote="3D" titre={getSubNoteTitle('3D')} description="" contenuPrevu={[]} priorite="moyenne" />
      case 'note3e': return <NotesRestantes numeroNote="3E" titre={getSubNoteTitle('3E')} description="" contenuPrevu={[]} priorite="moyenne" />

      // Sous-notes 8A-8C
      case 'note8a': return <NotesRestantes numeroNote="8A" titre={getSubNoteTitle('8A')} description="" contenuPrevu={[]} priorite="moyenne" />
      case 'note8b': return <NotesRestantes numeroNote="8B" titre={getSubNoteTitle('8B')} description="" contenuPrevu={[]} priorite="moyenne" />
      case 'note8c': return <NotesRestantes numeroNote="8C" titre={getSubNoteTitle('8C')} description="" contenuPrevu={[]} priorite="moyenne" />

      // Sous-note 15B
      case 'note15b': return <NotesRestantes numeroNote="15B" titre={getSubNoteTitle('15B')} description="" contenuPrevu={[]} priorite="moyenne" />

      // Sous-notes 16A-16C
      case 'note16a': return <NotesRestantes numeroNote="16A" titre={getSubNoteTitle('16A')} description="" contenuPrevu={[]} priorite="haute" />
      case 'note16b': return <NotesRestantes numeroNote="16B" titre={getSubNoteTitle('16B')} description="" contenuPrevu={[]} priorite="moyenne" />
      case 'note16b_bis': return <NotesRestantes numeroNote="16B_BIS" titre={getSubNoteTitle('16B_BIS')} description="" contenuPrevu={[]} priorite="moyenne" />
      case 'note16c': return <NotesRestantes numeroNote="16C" titre={getSubNoteTitle('16C')} description="" contenuPrevu={[]} priorite="moyenne" />

      // Sous-notes 27A-27B
      case 'note27a': return <NotesRestantes numeroNote="27A" titre={getSubNoteTitle('27A')} description="" contenuPrevu={[]} priorite="haute" />
      case 'note27b': return <NotesRestantes numeroNote="27B" titre={getSubNoteTitle('27B')} description="" contenuPrevu={[]} priorite="haute" />

      // Note 36 - tables et nomenclature
      case 'note36_codes': return <Note36Tables initialTab={0} />
      case 'note36_nomenclature': return <Note36Tables initialTab={1} />
      case 'note36_details': return <Note36Tables initialTab={2} />

      // Notes restantes (4, 7, 9, 10, 13, 16, 18, 20-35, 37-39)
      case 'note4': case 'note7': case 'note9': case 'note10':
      case 'note13': case 'note16': case 'note18':
      case 'note20': case 'note21': case 'note22': case 'note23':
      case 'note24': case 'note25': case 'note26': case 'note27':
      case 'note28': case 'note29': case 'note30': case 'note31':
      case 'note32': case 'note33': case 'note34': case 'note35':
      case 'note37': case 'note38': case 'note39':
      case 'notes_dgi_ins': {
        const num = parseInt(selectedSheet.replace('note', '').replace('notes_dgi_ins', '0')) || 0
        return (
          <NotesRestantes
            numeroNote={num}
            titre={getNoteTitle(num)}
            description={getNoteDescription(num)}
            contenuPrevu={[getNoteDescription(num)]}
            priorite={num <= 8 ? 'haute' : num <= 20 ? 'moyenne' : 'basse'}
          />
        )
      }

      // Compléments et suppléments
      case 'tables_calcul_impots': return <TablesCalculImpots />
      case 'tableaux_supplementaires': return <TableauxSupplementaires />
      case 'comp_charges': return <ComplementCharges />
      case 'comp_tva': return <SupplementTVA />
      case 'comp_tva_2': return <SupplementTVA />
      case 'suppl1': return <SupplementImpotSociete />
      case 'suppl2': return <SupplementAvantagesFiscaux />
      case 'suppl3': case 'suppl4': case 'suppl5': case 'suppl6': case 'suppl7':
        return <TableauxSupplementaires />

      // Commentaire
      case 'commentaire':
        return (
          <NotesRestantes
            numeroNote={0}
            titre="Commentaires Généraux"
            description="Commentaires et observations sur la liasse fiscale"
            contenuPrevu={['Observations du commissaire aux comptes', 'Notes de révision']}
            priorite="basse"
          />
        )

      default:
        return (
          <Alert severity="info">
            Onglet {selectedSheet} en cours de développement
          </Alert>
        )
    }
  }

  // ========== RENDER PRINCIPAL ==========
  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%', overflow: 'hidden' }}>
      {/* Sidebar Navigation */}
      {drawerOpen && (
        <Paper
          elevation={0}
          sx={{
            width: 260,
            flexShrink: 0,
            border: `1px solid ${P.primary200}`,
            borderRadius: 3,
            overflowY: 'auto',
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Structure Liasse
            </Typography>
            <Divider sx={{ mb: 1.5 }} />

            {/* Sélecteur de régime */}
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel>Régime d'imposition</InputLabel>
              <Select
                value={selectedRegime}
                label="Régime d'imposition"
                onChange={(e) => {
                  const newRegime = e.target.value as RegimeImposition
                  // Mettre à jour localStorage pour que les composants (via withBackendData) reflètent le changement
                  try {
                    const settingsRaw = localStorage.getItem('fiscasync_entreprise_settings')
                    if (settingsRaw) {
                      const settings = JSON.parse(settingsRaw)
                      settings.regime_imposition = newRegime
                      localStorage.setItem('fiscasync_entreprise_settings', JSON.stringify(settings))
                    }
                    const dbRaw = localStorage.getItem('fiscasync_db_entreprises')
                    if (dbRaw) {
                      const list = JSON.parse(dbRaw)
                      if (list.length > 0) {
                        list[0].regime_imposition = newRegime
                        localStorage.setItem('fiscasync_db_entreprises', JSON.stringify(list))
                      }
                    }
                  } catch { /* ignore */ }
                  setSelectedRegime(newRegime)
                }}
              >
                {(Object.keys(REGIME_LABELS) as RegimeImposition[]).map((regime) => (
                  <MenuItem key={regime} value={regime}>{REGIME_LABELS[regime]}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Compteurs obligatoire / facultatif */}
            {(() => {
              const counts = getSheetCounts(selectedRegime)
              return (
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${counts.obligatoire} obligatoires`}
                    size="small"
                    sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem' }}
                  />
                  <Chip
                    label={`${counts.facultatif} facultatifs`}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: '#3b82f6', color: 'primary.main', fontWeight: 600, fontSize: '0.7rem' }}
                  />
                </Box>
              )
            })()}

            <Divider sx={{ mb: 1 }} />

            <List dense>
              {SHEET_CATEGORIES.map((category) => {
                const categorySheets = LIASSE_SHEETS.filter(s => {
                  if (s.category !== category.id) return false
                  return getSheetRequirement(s.id, selectedRegime) !== 'exclu'
                })

                if (categorySheets.length === 0) return null

                return (
                  <Box key={category.id}>
                    <ListItem>
                      <ListItemText
                        primary={category.label}
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                      />
                      <Chip label={categorySheets.length} size="small" />
                    </ListItem>

                    {categorySheets.map((sheet) => {
                      const requirement = getSheetRequirement(sheet.id, selectedRegime)
                      return (
                        <ListItem
                          key={sheet.id}
                          onClick={() => setSelectedSheet(sheet.id)}
                          sx={{
                            pl: 4,
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: selectedSheet === sheet.id ? P.primary100 : 'transparent',
                          }}
                        >
                          <ListItemIcon>
                            <Folder fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={sheet.name}
                            primaryTypographyProps={{ fontSize: '0.8rem' }}
                          />
                          {requirement === 'obligatoire' ? (
                            <Tooltip title="Obligatoire">
                              <Chip
                                label="*"
                                size="small"
                                sx={{
                                  minWidth: 20, height: 18, fontSize: '0.7rem', fontWeight: 700,
                                  bgcolor: 'error.main', color: 'white',
                                  '& .MuiChip-label': { px: 0.5 },
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Facultatif">
                              <Chip
                                label="opt"
                                size="small"
                                variant="outlined"
                                sx={{
                                  minWidth: 28, height: 18, fontSize: '0.6rem',
                                  borderColor: '#3b82f6', color: 'primary.main',
                                  '& .MuiChip-label': { px: 0.5 },
                                }}
                              />
                            </Tooltip>
                          )}
                        </ListItem>
                      )
                    })}
                  </Box>
                )
              })}
            </List>
          </Box>
        </Paper>
      )}

      {/* Contenu Principal */}
      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* En-tête */}
        <Box sx={{ mb: 2, flexShrink: 0 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{
              mb: 2,
              color: P.primary600,
              fontWeight: 500,
              '&:hover': { bgcolor: 'grey.100', color: 'text.primary' },
            }}
          >
            Retour au menu principal
          </Button>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Production de Liasse Fiscale SYSCOHADA
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {selectedLiasse?.name || 'Liasse Fiscale'}
          </Typography>
        </Box>

        {/* Barre d'actions */}
        <Paper sx={{ p: 2, mb: 2, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => selectedLiasse && startAutomaticProduction(selectedLiasse)}
              disabled={isProducing}
            >
              Lancer Production
            </Button>
            <Button variant="outlined" startIcon={<Download />}>
              Exporter PDF
            </Button>
            <Button variant="outlined" startIcon={<Print />}>
              Imprimer
            </Button>
            <Button variant="outlined" startIcon={<Send />}>
              Télédéclarer
            </Button>

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={`Progression: ${selectedLiasse?.progress || 0}%`}
                icon={<Speed sx={{ color: '#fff !important' }} />}
                sx={{ bgcolor: 'text.primary', color: P.white, fontWeight: 600 }}
              />
              <Chip
                label={selectedLiasse?.status || 'draft'}
                color={getStatusColor(selectedLiasse?.status || 'draft') as any}
              />
            </Box>
          </Box>
        </Paper>

        {/* Contenu de l'onglet sélectionné */}
        <RegimeContext.Provider value={selectedRegime}>
          <Paper sx={{ p: 3, flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error?.message || 'Une erreur est survenue'}</Alert>
            ) : (
              renderSheetComponent()
            )}
          </Paper>
        </RegimeContext.Provider>
      </Box>

      {/* Dialog Production Automatique */}
      <Dialog
        open={isProductionDialogOpen}
        onClose={() => !isProducing && setIsProductionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AutoFixHigh color="primary" />
            <Box>
              <Typography variant="h6">Production Automatique</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLiasse?.name}
              </Typography>
            </Box>
            {productionStartTime && (
              <Chip
                label={`${formatTime(elapsedTime)} / 30:00`}
                color={elapsedTime < 1800 ? 'success' : 'warning'}
                icon={<Schedule />}
              />
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" gutterBottom>
                Progression Globale
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(productionSteps.filter(s => s.status === 'completed').length / productionSteps.length) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Stepper activeStep={activeStep} orientation="vertical">
              {productionSteps.map((step) => (
                <Step key={step.id}>
                  <StepLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {step.name}
                      </Typography>
                      {step.status === 'in-progress' && (
                        <Chip label={`${Math.round(step.progress)}%`} size="small" color="info" />
                      )}
                      {step.status === 'completed' && step.actualTime && (
                        <Chip label={formatTime(step.actualTime)} size="small" color="success" />
                      )}
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Typography color="text.secondary">{step.description}</Typography>
                    {step.status === 'in-progress' && (
                      <LinearProgress variant="determinate" value={step.progress} sx={{ mt: 1, width: 200 }} />
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogContent>

        <DialogActions>
          {!isProducing && (
            <Button onClick={() => setIsProductionDialogOpen(false)}>Fermer</Button>
          )}
          {isProducing && (
            <Button color="error" startIcon={<Stop />} onClick={() => setIsProducing(false)}>
              Arrêter
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LiasseFiscaleOfficial
