/**
 * Dialog de validation complète d'une liasse fiscale
 * Connecté au backend via generationService.validateComplete()
 */

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material'
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Close,
} from '@mui/icons-material'
import { generationService, LiasseGeneration } from '@/services/generationService'

interface ValidationDialogProps {
  liasse: LiasseGeneration
  open: boolean
  onClose: () => void
  onValidationSuccess?: () => void
}

interface ValidationError {
  field: string
  message: string
  severite: 'ERROR' | 'WARNING' | 'INFO'
  suggestion?: string
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  info: ValidationError[]
  summary: string
}

const ValidationDialog: React.FC<ValidationDialogProps> = ({
  liasse,
  open,
  onClose,
  onValidationSuccess,
}) => {
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const validationSteps = [
    'Vérification données',
    'Contrôle cohérence',
    'Validation SYSCOHADA',
    'Confirmation finale',
  ]

  const handleValidate = async () => {
    setValidating(true)
    setError(null)

    try {
      // Étape 1: Vérification préliminaire
      setActiveStep(0)
      await generationService.checkPrerequisites(liasse.id)
      await new Promise(resolve => setTimeout(resolve, 800)) // Pause visuelle

      // Étape 2: Validation complète
      setActiveStep(1)
      const result = await generationService.validateComplete(liasse.id)
      await new Promise(resolve => setTimeout(resolve, 800))

      setActiveStep(2)
      setValidationResult(result as any)

      if ((result as any).valid) {
        setActiveStep(3)

        // Succès - fermer après 2 secondes
        setTimeout(() => {
          if (onValidationSuccess) {
            onValidationSuccess()
          }
          handleClose()
        }, 2000)
      }
    } catch (err: any) {
      console.error('Validation failed:', err)
      setError(err.message || 'Erreur lors de la validation')
    } finally {
      setValidating(false)
    }
  }

  const handleClose = () => {
    setValidationResult(null)
    setActiveStep(0)
    setError(null)
    onClose()
  }

  const getSeverityIcon = (severite: string) => {
    switch (severite) {
      case 'ERROR':
        return <Error color="error" />
      case 'WARNING':
        return <Warning color="warning" />
      case 'INFO':
        return <Info color="info" />
      default:
        return <Info />
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="primary" />
          <Typography variant="h6">Validation de la Liasse Fiscale</Typography>
        </Box>
        <Close
          sx={{ cursor: 'pointer', color: 'text.secondary' }}
          onClick={handleClose}
        />
      </DialogTitle>

      <DialogContent dividers>
        {/* Info liasse */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {liasse.entreprise_detail?.raison_sociale || liasse.entreprise}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {liasse.exercice_detail?.nom || liasse.exercice} - Type: {liasse.type_liasse}
          </Typography>
        </Paper>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {validationSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* En cours de validation */}
        {validating && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {validationSteps[activeStep]}...
            </Typography>
          </Box>
        )}

        {/* Résultat de validation */}
        {validationResult && !validating && (
          <Box>
            {/* Résumé */}
            {validationResult.valid ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ✅ Liasse validée avec succès !
                </Typography>
                <Typography variant="caption">
                  {validationResult.summary || 'Toutes les vérifications sont passées'}
                </Typography>
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ❌ {validationResult.errors.length} erreur(s) détectée(s)
                </Typography>
                <Typography variant="caption">
                  Veuillez corriger les erreurs avant de valider
                </Typography>
              </Alert>
            )}

            {/* Erreurs */}
            {validationResult.errors && validationResult.errors.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'error.main' }}>
                  Erreurs bloquantes :
                </Typography>
                <List dense>
                  {validationResult.errors.map((err, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        bgcolor: 'error.lighter',
                        borderRadius: 1,
                        mb: 0.5,
                        border: '1px solid',
                        borderColor: 'error.light',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getSeverityIcon(err.severite)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <strong>{err.field}:</strong> {err.message}
                          </Typography>
                        }
                        secondary={
                          err.suggestion && (
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              💡 {err.suggestion}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Avertissements */}
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'warning.main' }}>
                  ⚠️ {validationResult.warnings.length} avertissement(s) :
                </Typography>
                <List dense>
                  {validationResult.warnings.map((warning, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        bgcolor: 'warning.lighter',
                        borderRadius: 1,
                        mb: 0.5,
                        border: '1px solid',
                        borderColor: 'warning.light',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getSeverityIcon(warning.severite)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <strong>{warning.field}:</strong> {warning.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Informations */}
            {validationResult.info && validationResult.info.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'info.main' }}>
                  ℹ️ Informations :
                </Typography>
                <List dense>
                  {validationResult.info.map((info, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Info color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2">{info.message}</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}

        {/* Erreur générale */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={validating}>
          {validationResult?.valid ? 'Fermer' : 'Annuler'}
        </Button>
        {!validationResult && (
          <Button
            onClick={handleValidate}
            variant="contained"
            color="success"
            disabled={validating}
            startIcon={validating ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {validating ? 'Validation...' : 'Valider la Liasse'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ValidationDialog
