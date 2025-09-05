/**
 * Modal de Validation - Validation complète de la liasse fiscale
 */

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Box,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  PlayArrow as StartIcon,
  Done as DoneIcon,
} from '@mui/icons-material'

interface ValidationStep {
  id: string
  label: string
  description: string
  status: 'pending' | 'running' | 'success' | 'error'
  details?: string
}

interface ValidationModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
  sheets: Array<{
    id: string
    name: string
    required: boolean
    status: 'empty' | 'partial' | 'complete' | 'error'
  }>
}

const ValidationModal: React.FC<ValidationModalProps> = ({
  open,
  onClose,
  onComplete,
  sheets
}) => {
  const [isValidating, setIsValidating] = useState(false)
  const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([
    {
      id: 'structure',
      label: 'Vérification de la structure',
      description: 'Contrôle de la cohérence des données',
      status: 'pending'
    },
    {
      id: 'completude',
      label: 'Vérification de la complétude',
      description: 'Contrôle des champs obligatoires',
      status: 'pending'
    },
    {
      id: 'calculs',
      label: 'Validation des calculs',
      description: 'Vérification des formules et totaux',
      status: 'pending'
    },
    {
      id: 'coherence',
      label: 'Contrôle de cohérence',
      description: 'Validation croisée entre les états',
      status: 'pending'
    },
    {
      id: 'conformite',
      label: 'Contrôle de conformité',
      description: 'Vérification des normes SYSCOHADA',
      status: 'pending'
    }
  ])
  const [currentStep, setCurrentStep] = useState(0)
  const [globalProgress, setGlobalProgress] = useState(0)

  const startValidation = async () => {
    setIsValidating(true)
    setCurrentStep(0)
    
    for (let i = 0; i < validationSteps.length; i++) {
      // Marquer l'étape courante comme en cours
      setValidationSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? 'running' : index < i ? 'success' : 'pending'
      })))
      
      setCurrentStep(i)
      setGlobalProgress((i / validationSteps.length) * 100)
      
      // Simuler la validation (remplacer par vraie logique)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Marquer comme réussie (ou échec selon la logique)
      const success = Math.random() > 0.1 // 90% de chance de succès
      
      setValidationSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? (success ? 'success' : 'error') : step.status,
        details: index === i && !success ? 'Erreur détectée dans cette étape' : undefined
      })))
      
      if (!success) {
        setIsValidating(false)
        return
      }
    }
    
    setGlobalProgress(100)
    setIsValidating(false)
    
    // Délai avant completion
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  const handleClose = () => {
    if (!isValidating) {
      onClose()
    }
  }

  const requiredSheets = sheets.filter(s => s.required)
  const completedRequired = requiredSheets.filter(s => s.status === 'complete').length
  const allStepsCompleted = validationSteps.every(step => step.status === 'success')
  const hasErrors = validationSteps.some(step => step.status === 'error')

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isValidating}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Validation de la Liasse Fiscale
          </Typography>
          <Chip
            label={`${completedRequired}/${requiredSheets.length} états requis`}
            color={completedRequired === requiredSheets.length ? 'success' : 'warning'}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {!isValidating && !allStepsCompleted && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Cette validation va contrôler la cohérence et la complétude de votre liasse fiscale.
              Assurez-vous que tous les états requis sont complétés avant de commencer.
            </Typography>
          </Alert>
        )}

        {hasErrors && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Des erreurs ont été détectées pendant la validation. Veuillez corriger les problèmes signalés.
            </Typography>
          </Alert>
        )}

        {allStepsCompleted && !hasErrors && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Validation réussie ! Votre liasse fiscale est conforme et prête pour transmission.
            </Typography>
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Progression globale
          </Typography>
          <LinearProgress
            variant="determinate"
            value={globalProgress}
            sx={{ height: 8, borderRadius: 4 }}
            color={hasErrors ? 'error' : allStepsCompleted ? 'success' : 'primary'}
          />
          <Typography variant="caption" color="text.secondary">
            {globalProgress.toFixed(0)}% complété
          </Typography>
        </Box>

        <Stepper activeStep={currentStep} orientation="vertical">
          {validationSteps.map((step, index) => (
            <Step key={step.id}>
              <StepLabel
                StepIconComponent={() => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {step.status === 'running' && <CircularProgress size={20} />}
                    {step.status === 'success' && <CheckIcon color="success" />}
                    {step.status === 'error' && <ErrorIcon color="error" />}
                    {step.status === 'pending' && <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'grey.300' }} />}
                  </Box>
                )}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {step.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
                {step.details && (
                  <Typography variant="caption" color="error">
                    {step.details}
                  </Typography>
                )}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            États de la liasse
          </Typography>
          <List dense>
            {requiredSheets.slice(0, 5).map((sheet) => (
              <ListItem key={sheet.id}>
                <ListItemIcon>
                  {sheet.status === 'complete' && <CheckIcon color="success" />}
                  {sheet.status === 'partial' && <WarningIcon color="warning" />}
                  {sheet.status === 'empty' && <ErrorIcon color="error" />}
                </ListItemIcon>
                <ListItemText
                  primary={sheet.name}
                  secondary={
                    sheet.status === 'complete' ? 'Complété' :
                    sheet.status === 'partial' ? 'Partiellement complété' : 'Non complété'
                  }
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={sheet.status}
                    size="small"
                    color={
                      sheet.status === 'complete' ? 'success' :
                      sheet.status === 'partial' ? 'warning' : 'error'
                    }
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {requiredSheets.length > 5 && (
              <ListItem>
                <ListItemText
                  primary={`... et ${requiredSheets.length - 5} autres états`}
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isValidating}>
          {allStepsCompleted && !hasErrors ? 'Fermer' : 'Annuler'}
        </Button>
        
        {!allStepsCompleted && !isValidating && (
          <Button
            variant="contained"
            startIcon={<StartIcon />}
            onClick={startValidation}
            disabled={completedRequired === 0}
          >
            Lancer la validation
          </Button>
        )}

        {allStepsCompleted && !hasErrors && (
          <Button
            variant="contained"
            startIcon={<DoneIcon />}
            onClick={onComplete}
            color="success"
          >
            Terminer la validation
          </Button>
        )}

        {hasErrors && (
          <Button
            variant="outlined"
            onClick={() => {
              setValidationSteps(prev => prev.map(step => ({ ...step, status: 'pending' })))
              setCurrentStep(0)
              setGlobalProgress(0)
            }}
          >
            Relancer la validation
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ValidationModal