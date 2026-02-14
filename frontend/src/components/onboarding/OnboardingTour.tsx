/**
 * Tour guidé interactif pour nouveaux utilisateurs TaxPilot
 * Améliore l'adoption et l'autonomie utilisateur
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Dialog,
  DialogContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  LinearProgress,
  Alert,
} from '@mui/material'
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Dashboard as DashboardIcon,
  Settings as ConfigIcon,
  AccountBalance as BalanceIcon,
  Assignment as LiasseIcon,
  Security as AuditIcon,
  Analytics as ReportIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface TourStep {
  id: number
  title: string
  description: string
  icon: React.ReactElement
  route: string
  highlights: string[]
  action?: string
}

const OnboardingTour: React.FC = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])

  // Vérifier si l'utilisateur a déjà fait le tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('fiscasync_tour_completed')
    if (!hasSeenTour) {
      setOpen(true)
    }
  }, [])

  const tourSteps: TourStep[] = [
    {
      id: 0,
      title: 'Bienvenue dans TaxPilot !',
      description: 'Solution complète de comptabilité SYSCOHADA avec IA intégrée',
      icon: <DashboardIcon color="primary" />,
      route: '/dashboard',
      highlights: [
        'Interface moderne et intuitive',
        'Conformité SYSCOHADA garantie',
        'Audit automatique par IA',
        'Développé par Preadium Tech'
      ]
    },
    {
      id: 1,
      title: 'Configuration Entreprise',
      description: 'Première étape : Configurez les informations de votre entreprise',
      icon: <ConfigIcon color="primary" />,
      route: '/parametrage',
      highlights: [
        'Informations légales (SIRET, forme juridique)',
        'Paramètres de sécurité',
        'Gestion des utilisateurs',
        'Configuration notifications'
      ],
      action: 'Configurer mon entreprise'
    },
    {
      id: 2,
      title: 'Import de Balance',
      description: 'Importez votre balance comptable pour commencer',
      icon: <BalanceIcon color="success" />,
      route: '/import-balance',
      highlights: [
        'Import Excel/CSV automatique',
        'Validation des données',
        'Détection d\'erreurs IA',
        'Synchronisation temps réel'
      ],
      action: 'Importer ma balance'
    },
    {
      id: 3,
      title: 'Audit IA Automatique',
      description: 'L\'IA vérifie automatiquement la cohérence de vos données',
      icon: <AuditIcon color="warning" />,
      route: '/control-points',
      highlights: [
        '64+ points de contrôle',
        'Algorithmes SYSCOHADA',
        'Détection anomalies',
        'Corrections automatiques'
      ],
      action: 'Voir les contrôles IA'
    },
    {
      id: 4,
      title: 'Génération Liasse Fiscale',
      description: 'Créez vos états financiers SYSCOHADA en un clic',
      icon: <LiasseIcon color="secondary" />,
      route: '/direct-liasse',
      highlights: [
        'États financiers automatiques',
        'Conformité SYSCOHADA',
        'Notes annexes complètes',
        'Export multi-formats'
      ],
      action: 'Créer ma liasse'
    },
    {
      id: 5,
      title: 'Reporting & Analytics',
      description: 'Analysez vos performances avec des rapports avancés',
      icon: <ReportIcon color="info" />,
      route: '/reporting',
      highlights: [
        'Tableaux de bord interactifs',
        'Analyses prédictives IA',
        'Rapports personnalisés',
        'Export automatique'
      ],
      action: 'Explorer les rapports'
    }
  ]

  const handleNext = () => {
    if (activeStep < tourSteps.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleStepAction = () => {
    const step = tourSteps[activeStep]
    setCompleted([...completed, step.id])
    
    if (step.route) {
      navigate(step.route)
      setOpen(false)
    }
  }

  const handleSkipTour = () => {
    localStorage.setItem('fiscasync_tour_completed', 'true')
    setOpen(false)
  }

  const handleFinishTour = () => {
    localStorage.setItem('fiscasync_tour_completed', 'true')
    setOpen(false)
    navigate('/dashboard')
  }

  const isLastStep = activeStep === tourSteps.length - 1
  const currentStep = tourSteps[activeStep]

  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          bgcolor: 'background.paper',
          backgroundImage: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
        }
      }}
    >
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <IconButton onClick={handleSkipTour} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {/* Progress */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Tour de découverte TaxPilot
            </Typography>
            <Chip 
              label={`${activeStep + 1}/${tourSteps.length}`} 
              color="primary" 
              size="small"
            />
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(activeStep / (tourSteps.length - 1)) * 100}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {tourSteps.map((step) => (
            <Step key={step.id} completed={completed.includes(step.id)}>
              <StepLabel
                icon={step.icon}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: completed.includes(step.id) ? 600 : 400
                  }
                }}
              >
                {step.title}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Contenu de l'étape actuelle */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              {currentStep.icon}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {currentStep.title}
              </Typography>
            </Stack>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {currentStep.description}
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Ce que vous découvrirez :
            </Typography>
            
            <Stack spacing={1}>
              {currentStep.highlights.map((highlight, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CompleteIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    {highlight}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {currentStep.action && (
              <Button
                variant="contained"
                fullWidth
                onClick={handleStepAction}
                sx={{ mt: 3 }}
              >
                {currentStep.action}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<BackIcon />}
            variant="outlined"
          >
            Précédent
          </Button>

          <Button
            onClick={handleSkipTour}
            color="inherit"
          >
            Passer le tour
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleFinishTour}
              variant="contained"
              endIcon={<CompleteIcon />}
            >
              Terminer le tour
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={<NextIcon />}
            >
              Suivant
            </Button>
          )}
        </Stack>

        {/* Message de fin */}
        {isLastStep && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <strong>Félicitations !</strong> Vous êtes maintenant prêt à utiliser TaxPilot. 
            Notre équipe support est disponible si vous avez des questions.
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default OnboardingTour