/**
 * Liasse Fiscale Complète Finale - Interface de finalisation et génération
 * Module de production finale avec contrôles de cohérence SYSCOHADA
 */

import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  useTheme,
  alpha,
  Fab,
  Badge,
  Zoom,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Print as PrintIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  VerifiedUser as VerifiedIcon,
  History as HistoryIcon,
  CalendarToday as CalendarIcon,
  CompareArrows as CompareIcon,
  Gavel as LegalIcon,
  Settings as SettingsIcon,
  Flag as FlagIcon,
  Lock as LockIcon,
} from '@mui/icons-material'

interface LiasseSection {
  id: string
  name: string
  type: 'balance' | 'result' | 'tresorerie' | 'annexes'
  completion: number
  status: 'complete' | 'warning' | 'error' | 'pending'
  controls: ControlResult[]
  lastModified: string
  lockedBy?: string
}

interface ControlResult {
  id: string
  rule: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  suggestion?: string
  reference?: string
}

interface GenerationStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  duration?: number
  result?: any
}

interface ValidationReport {
  id: string
  timestamp: string
  validator: string
  status: 'approved' | 'rejected' | 'pending'
  comments: string
  signature?: string
}

const LiasseCompleteFinal: React.FC = () => {
  const theme = useTheme()
  const [activeStep] = useState(0)
  const [, setLoading] = useState(false)
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [controlsDialogOpen, setControlsDialogOpen] = useState(false)
  const [generationInProgress, setGenerationInProgress] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  
  // États des contrôles
  const [overallProgress] = useState(85)
  const [criticalErrorsCount] = useState(2)
  const [warningsCount] = useState(5)
  
  const liasseSections: LiasseSection[] = [
    {
      id: 'bilan',
      name: 'Bilan SYSCOHADA',
      type: 'balance',
      completion: 100,
      status: 'complete',
      controls: [
        {
          id: 'b1',
          rule: 'Équilibre Actif/Passif',
          status: 'pass',
          message: 'Bilan équilibré: 2,450,000,000',
          severity: 'critical',
          reference: 'Art. 25 SYSCOHADA'
        },
        {
          id: 'b2',
          rule: 'Cohérence avec Grand Livre',
          status: 'pass',
          message: 'Soldes cohérents avec la comptabilité',
          severity: 'critical'
        }
      ],
      lastModified: '2024-12-16 15:30',
      lockedBy: 'Expert-comptable'
    },
    {
      id: 'resultat',
      name: 'Compte de Résultat',
      type: 'result',
      completion: 95,
      status: 'warning',
      controls: [
        {
          id: 'r1',
          rule: 'Cohérence Charges/Produits',
          status: 'warning',
          message: 'Écart de 50 000 détecté',
          severity: 'medium',
          suggestion: 'Vérifier les écritures de régularisation',
          reference: 'Art. 59 SYSCOHADA'
        },
        {
          id: 'r2',
          rule: 'Calcul du Résultat Net',
          status: 'pass',
          message: 'Résultat net: 245,000,000',
          severity: 'critical'
        }
      ],
      lastModified: '2024-12-16 14:15'
    },
    {
      id: 'tresorerie',
      name: 'Tableau des Flux de Trésorerie',
      type: 'tresorerie',
      completion: 80,
      status: 'error',
      controls: [
        {
          id: 't1',
          rule: 'Variation de Trésorerie',
          status: 'fail',
          message: 'Flux non réconciliés avec le bilan',
          severity: 'critical',
          suggestion: 'Revoir les flux d\'exploitation et d\'investissement',
          reference: 'Art. 26 SYSCOHADA'
        }
      ],
      lastModified: '2024-12-16 11:20'
    },
    {
      id: 'annexes',
      name: 'État Annexé et Notes',
      type: 'annexes',
      completion: 70,
      status: 'warning',
      controls: [
        {
          id: 'a1',
          rule: 'Informations Obligatoires',
          status: 'warning',
          message: '3 notes explicatives manquantes',
          severity: 'medium',
          suggestion: 'Compléter les notes sur les méthodes comptables',
          reference: 'Art. 27-31 SYSCOHADA'
        }
      ],
      lastModified: '2024-12-16 10:05'
    }
  ]

  const generationSteps: GenerationStep[] = [
    {
      id: 'validation',
      name: 'Contrôles de cohérence',
      description: 'Vérification des règles SYSCOHADA',
      status: criticalErrorsCount > 0 ? 'error' : 'completed',
      progress: criticalErrorsCount > 0 ? 85 : 100,
      duration: 45
    },
    {
      id: 'compilation',
      name: 'Compilation des données',
      description: 'Agrégation et mise en forme',
      status: 'pending',
      progress: 0
    },
    {
      id: 'generation',
      name: 'Génération PDF/XLSX',
      description: 'Production des fichiers finaux',
      status: 'pending',
      progress: 0
    },
    {
      id: 'signature',
      name: 'Signature électronique',
      description: 'Authentification et horodatage',
      status: 'pending',
      progress: 0
    },
    {
      id: 'transmission',
      name: 'Transmission DGI',
      description: 'Envoi sécurisé aux autorités',
      status: 'pending',
      progress: 0
    }
  ]

  const validationReports: ValidationReport[] = [
    {
      id: '1',
      timestamp: '2024-12-16 15:30',
      validator: 'Marie KOUASSI - Expert-comptable',
      status: 'approved',
      comments: 'Bilan validé conforme aux normes SYSCOHADA',
      signature: 'e-signature-12345'
    },
    {
      id: '2',
      timestamp: '2024-12-16 14:15',
      validator: 'Jean KONE - Responsable comptabilité',
      status: 'pending',
      comments: 'En attente de corrections sur le tableau de flux'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': case 'pass': case 'approved': return theme.palette.success.main
      case 'warning': return theme.palette.warning.main
      case 'error': case 'fail': case 'rejected': return theme.palette.error.main
      case 'pending': return theme.palette.info.main
      default: return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': case 'pass': case 'approved': return <CheckIcon />
      case 'warning': return <WarningIcon />
      case 'error': case 'fail': case 'rejected': return <ErrorIcon />
      case 'pending': return <ScheduleIcon />
      default: return <ScheduleIcon />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'complete': return 'Complète'
      case 'warning': return 'Avertissements'
      case 'error': return 'Erreurs'
      case 'pending': return 'En attente'
      case 'pass': return 'Validé'
      case 'fail': return 'Échec'
      case 'approved': return 'Approuvé'
      case 'rejected': return 'Rejeté'
      default: return status
    }
  }

  const handleGeneration = async () => {
    if (criticalErrorsCount > 0) {
      alert('Impossible de générer la liasse: des erreurs critiques sont présentes')
      return
    }
    
    setGenerationInProgress(true)
    setLoading(true)
    
    // Simulation de la génération
    setTimeout(() => {
      setGenerationInProgress(false)
      setLoading(false)
      alert('Liasse fiscale générée avec succès!')
    }, 5000)
  }

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId)
    setControlsDialogOpen(true)
  }

  const selectedSectionData = liasseSections.find(s => s.id === selectedSection)

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Liasse Fiscale Finale
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Finalisation et génération de la liasse fiscale SYSCOHADA 2024
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Actualiser
            </Button>
            <Button
              variant="outlined"
              startIcon={<ViewIcon />}
              onClick={() => setValidationDialogOpen(true)}
            >
              Validations
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handleGeneration}
              disabled={criticalErrorsCount > 0}
              sx={{ 
                backgroundColor: theme.palette.primary.main,
                '&:disabled': {
                  backgroundColor: theme.palette.grey[300]
                }
              }}
            >
              Générer Liasse
            </Button>
          </Stack>
        </Box>
        
        {/* Barre de progression globale */}
        <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Progression globale: {overallProgress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={overallProgress}
              sx={{ 
                flexGrow: 1, 
                height: 8, 
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.divider, 0.1),
              }}
            />
            {overallProgress === 100 ? (
              <Chip
                icon={<CheckIcon />}
                label="Prête"
                size="small"
                color="success"
              />
            ) : (
              <Chip
                label={`${criticalErrorsCount} erreurs`}
                size="small"
                color="error"
              />
            )}
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Chip
              icon={<ErrorIcon />}
              label={`${criticalErrorsCount} erreurs critiques`}
              size="small"
              color={criticalErrorsCount > 0 ? 'error' : 'success'}
              variant={criticalErrorsCount > 0 ? 'filled' : 'outlined'}
            />
            <Chip
              icon={<WarningIcon />}
              label={`${warningsCount} avertissements`}
              size="small"
              color="warning"
              variant="outlined"
            />
            <Chip
              icon={<VerifiedIcon />}
              label="Conforme SYSCOHADA"
              size="small"
              color="success"
              variant="outlined"
            />
          </Stack>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {/* Vue d'ensemble des sections */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                États financiers SYSCOHADA
              </Typography>
              
              <Grid container spacing={2}>
                {liasseSections.map((section) => (
                  <Grid item xs={12} md={6} key={section.id}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        border: `1px solid ${alpha(getStatusColor(section.status), 0.3)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                          transform: 'translateY(-2px)',
                        }
                      }}
                      onClick={() => handleSectionClick(section.id)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {section.name}
                          </Typography>
                          <Avatar
                            sx={{
                              backgroundColor: alpha(getStatusColor(section.status), 0.1),
                              color: getStatusColor(section.status),
                              width: 32,
                              height: 32,
                            }}
                          >
                            {getStatusIcon(section.status)}
                          </Avatar>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Complétude
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {section.completion}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={section.completion}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: alpha(theme.palette.divider, 0.1),
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label={getStatusLabel(section.status)}
                            size="small"
                            sx={{
                              backgroundColor: alpha(getStatusColor(section.status), 0.1),
                              color: getStatusColor(section.status),
                              fontSize: '0.75rem',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {section.lastModified}
                          </Typography>
                        </Box>
                        
                        {section.lockedBy && (
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LockIcon fontSize="small" color="warning" />
                            <Typography variant="caption" color="text.secondary">
                              Verrouillé par {section.lockedBy}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Processus de génération */}
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Processus de génération
              </Typography>
              
              <Stepper activeStep={activeStep} orientation="vertical">
                {generationSteps.map((step) => (
                  <Step key={step.id}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Avatar
                          sx={{
                            backgroundColor: alpha(getStatusColor(step.status), 0.1),
                            color: getStatusColor(step.status),
                            width: 32,
                            height: 32,
                          }}
                        >
                          {getStatusIcon(step.status)}
                        </Avatar>
                      )}
                    >
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {step.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </StepLabel>
                    <StepContent>
                      {step.status === 'running' && (
                        <LinearProgress
                          variant="determinate"
                          value={step.progress}
                          sx={{ my: 2 }}
                        />
                      )}
                      {step.duration && step.status === 'completed' && (
                        <Typography variant="caption" color="text.secondary">
                          Terminé en {step.duration}s
                        </Typography>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Panneau latéral - Contrôles et actions */}
        <Grid item xs={12} lg={4}>
          {/* Résumé des contrôles */}
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Contrôles de cohérence
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <CheckIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      12 contrôles réussis
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Conformité SYSCOHADA validée
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <Badge badgeContent={warningsCount} color="warning">
                      <WarningIcon />
                    </Badge>
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {warningsCount} avertissements
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Actions recommandées
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <Badge badgeContent={criticalErrorsCount} color="error">
                      <ErrorIcon />
                    </Badge>
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {criticalErrorsCount} erreurs critiques
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Corrections requises
                    </Typography>
                  </Box>
                </Box>
              </Stack>
              
              <Alert severity={criticalErrorsCount > 0 ? 'error' : 'success'} sx={{ mt: 3 }}>
                <AlertTitle>
                  {criticalErrorsCount > 0 ? 'Génération bloquée' : 'Prête pour génération'}
                </AlertTitle>
                {criticalErrorsCount > 0 
                  ? 'Corrigez les erreurs critiques avant de continuer'
                  : 'Tous les contrôles sont validés'
                }
              </Alert>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Actions rapides
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EditIcon />}
                  size="large"
                >
                  Modifier sections
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CompareIcon />}
                  size="large"
                >
                  Comparer N-1
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  size="large"
                >
                  Historique versions
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  size="large"
                >
                  Paramètres export
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Informations juridiques */}
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Conformité réglementaire
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <FlagIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="SYSCOHADA 2017"
                    secondary="Norme comptable respectée"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LegalIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Code des impôts CI"
                    secondary="Articles 12 et 16 appliqués"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Échéance DGI"
                    secondary="30 avril 2025"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FAB pour génération */}
      <Zoom in={!generationInProgress && criticalErrorsCount === 0}>
        <Fab
          color="primary"
          size="large"
          onClick={handleGeneration}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
          }}
        >
          <PrintIcon />
        </Fab>
      </Zoom>

      {/* Dialog des contrôles détaillés */}
      <Dialog 
        open={controlsDialogOpen} 
        onClose={() => setControlsDialogOpen(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Contrôles détaillés - {selectedSectionData?.name}
        </DialogTitle>
        <DialogContent>
          {selectedSectionData && (
            <Box>
              <Alert 
                severity={
                  selectedSectionData.status === 'complete' ? 'success' :
                  selectedSectionData.status === 'warning' ? 'warning' : 'error'
                } 
                sx={{ mb: 3 }}
              >
                <AlertTitle>
                  Statut: {getStatusLabel(selectedSectionData.status)}
                </AlertTitle>
                Complétude: {selectedSectionData.completion}% • 
                Dernière modification: {selectedSectionData.lastModified}
              </Alert>
              
              <List>
                {selectedSectionData.controls.map((control) => (
                  <ListItem key={control.id} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, mb: 1, borderRadius: 1 }}>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          backgroundColor: alpha(getStatusColor(control.status), 0.1),
                          color: getStatusColor(control.status),
                          width: 32,
                          height: 32,
                        }}
                      >
                        {getStatusIcon(control.status)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={control.rule}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.primary">
                            {control.message}
                          </Typography>
                          {control.suggestion && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              💡 {control.suggestion}
                            </Typography>
                          )}
                          {control.reference && (
                            <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                              📋 {control.reference}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={control.severity}
                        size="small"
                        color={
                          control.severity === 'critical' ? 'error' :
                          control.severity === 'high' ? 'warning' :
                          control.severity === 'medium' ? 'info' : 'default'
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setControlsDialogOpen(false)}>
            Fermer
          </Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            Corriger
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog des validations */}
      <Dialog 
        open={validationDialogOpen} 
        onClose={() => setValidationDialogOpen(false)}
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>Rapports de validation</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Horodatage</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Validateur</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Commentaires</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Signature</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {validationReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.timestamp}</TableCell>
                    <TableCell>{report.validator}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(report.status)}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getStatusColor(report.status), 0.1),
                          color: getStatusColor(report.status),
                        }}
                      />
                    </TableCell>
                    <TableCell>{report.comments}</TableCell>
                    <TableCell>
                      {report.signature && (
                        <Tooltip title={`Signature: ${report.signature}`}>
                          <VerifiedIcon color="success" fontSize="small" />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDialogOpen(false)}>
            Fermer
          </Button>
          <Button variant="contained" startIcon={<SendIcon />}>
            Nouvelle validation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading overlay during generation */}
      {generationInProgress && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.common.black, 0.7),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', minWidth: 300 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Génération en cours...
            </Typography>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Production de la liasse fiscale SYSCOHADA
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  )
}

export default LiasseCompleteFinal