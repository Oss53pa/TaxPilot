/**
 * Composant de Soumission de Déclaration Fiscale
 * Workflow complet : validation → soumission → génération PDF
 */

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Chip,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import {
  Send,
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
  GetApp,
  Verified,
  Schedule,
  Receipt,
  Description,
} from '@mui/icons-material'
import { taxService, DeclarationFiscale } from '@/services/taxService'

interface DeclarationSubmissionProps {
  open: boolean
  onClose: () => void
  declaration: DeclarationFiscale | null
  onSubmissionComplete?: () => void
}

interface ValidationError {
  champ: string
  message: string
  code: string
  severite: 'ERROR' | 'WARNING' | 'INFO'
}

interface ValidationResult {
  valide: boolean
  erreurs: ValidationError[]
  avertissements: ValidationError[]
  infos: ValidationError[]
  peut_soumettre: boolean
}

const DeclarationSubmission: React.FC<DeclarationSubmissionProps> = ({
  open,
  onClose,
  declaration,
  onSubmissionComplete,
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [validating, setValidating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [submissionResult, setSubmissionResult] = useState<any>(null)
  const [pdfGenerated, setPdfGenerated] = useState(false)

  const [confirmSubmit, setConfirmSubmit] = useState(false)

  const steps = [
    'Validation des données',
    'Confirmation',
    'Soumission',
    'Téléchargement PDF',
  ]

  useEffect(() => {
    if (open && declaration) {
      // Auto-start validation
      handleValidation()
    } else {
      resetState()
    }
  }, [open, declaration])

  const resetState = () => {
    setActiveStep(0)
    setValidating(false)
    setSubmitting(false)
    setGeneratingPDF(false)
    setError(null)
    setValidationResult(null)
    setSubmissionResult(null)
    setPdfGenerated(false)
    setConfirmSubmit(false)
  }

  const handleValidation = async () => {
    if (!declaration) return

    try {
      setValidating(true)
      setError(null)

      const result = await taxService.validateDeclaration(declaration.id)

      // Simuler une structure de validation
      const mockValidation: ValidationResult = {
        valide: !result.erreurs_validation || result.erreurs_validation.length === 0,
        erreurs: result.erreurs_validation || [],
        avertissements: [],
        infos: [],
        peut_soumettre: result.statut !== 'REJETEE',
      }

      setValidationResult(mockValidation)

      if (mockValidation.valide) {
        setActiveStep(1) // Passer à confirmation
      }
    } catch (err: any) {
      console.error('Validation failed:', err)
      setError(err.message || 'Erreur lors de la validation')
    } finally {
      setValidating(false)
    }
  }

  const handleSubmission = async () => {
    if (!declaration || !confirmSubmit) {
      setError('Veuillez confirmer la soumission')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setActiveStep(2) // Passer à soumission

      const result = await taxService.submitDeclaration(declaration.id)
      setSubmissionResult(result)

      setActiveStep(3) // Passer à génération PDF

      // Auto-générer le PDF
      await handleGeneratePDF()

      if (onSubmissionComplete) {
        onSubmissionComplete()
      }
    } catch (err: any) {
      console.error('Submission failed:', err)
      setError(err.message || 'Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!declaration) return

    try {
      setGeneratingPDF(true)

      const blob = await taxService.generateDeclarationPDF(declaration.id)

      // Téléchargement automatique
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `declaration_${declaration.type_declaration}_${declaration.numero_declaration || declaration.id}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)

      setPdfGenerated(true)
    } catch (err: any) {
      console.error('PDF generation failed:', err)
      setError('Erreur lors de la génération du PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, any> = {
      BROUILLON: 'default',
      VALIDEE: 'info',
      DEPOSEE: 'primary',
      ACCEPTEE: 'success',
      REJETEE: 'error',
    }
    return colors[statut] || 'default'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      IS: 'Impôt sur les Sociétés',
      TVA: 'Taxe sur la Valeur Ajoutée',
      PATENTE: 'Contribution des Patentes',
      BILAN_FISCAL: 'Bilan Fiscal',
    }
    return labels[type] || type
  }

  const handleClose = () => {
    if (!submitting && !generatingPDF) {
      resetState()
      onClose()
    }
  }

  if (!declaration) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send color="primary" />
          <Typography variant="h6">Soumission de Déclaration Fiscale</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={submitting || generatingPDF}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Informations déclaration */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Type de Déclaration
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {getTypeLabel(declaration.type_declaration)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Statut
                </Typography>
                <Chip
                  label={declaration.statut}
                  color={getStatutColor(declaration.statut)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Période
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {formatDate(declaration.periode_debut)} - {formatDate(declaration.periode_fin)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Montant Impôt
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                  {formatMontant(declaration.montant_impot)} FCFA
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Montant à Payer
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    color: declaration.montant_a_payer > 0 ? 'warning.main' : 'success.main',
                  }}
                >
                  {formatMontant(declaration.montant_a_payer)} FCFA
                </Typography>
              </Grid>

              {declaration.numero_declaration && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Numéro de Déclaration
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {declaration.numero_declaration}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Step 1: Validation */}
        {activeStep === 0 && (
          <>
            {validating && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={48} />
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                  Validation des données en cours...
                </Typography>
              </Box>
            )}

            {validationResult && (
              <>
                {validationResult.erreurs.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      ❌ Erreurs Bloquantes ({validationResult.erreurs.length})
                    </Typography>
                    <List dense>
                      {validationResult.erreurs.map((erreur, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Error color="error" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={erreur.message}
                            secondary={`Champ: ${erreur.champ}`}
                            primaryTypographyProps={{ variant: 'caption' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}

                {validationResult.avertissements.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      ⚠️ Avertissements ({validationResult.avertissements.length})
                    </Typography>
                    <List dense>
                      {validationResult.avertissements.map((warning, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Warning color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={warning.message}
                            primaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}

                {validationResult.valide && (
                  <Alert severity="success">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ✅ Validation réussie
                    </Typography>
                    <Typography variant="caption">
                      Votre déclaration est prête à être soumise
                    </Typography>
                  </Alert>
                )}
              </>
            )}
          </>
        )}

        {/* Step 2: Confirmation */}
        {activeStep === 1 && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Confirmation de Soumission
            </Typography>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                ⚠️ Attention
              </Typography>
              <Typography variant="body2">
                Vous êtes sur le point de soumettre cette déclaration à l'administration fiscale.
                Cette action est irréversible.
              </Typography>
            </Alert>

            <List>
              <ListItem>
                <ListItemIcon>
                  <Receipt color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Déclaration validée"
                  secondary="Toutes les données ont été vérifiées"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Schedule color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Soumission immédiate"
                  secondary="La déclaration sera transmise instantanément"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="PDF généré automatiquement"
                  secondary="Vous recevrez une copie PDF pour vos archives"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Verified color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Numéro de confirmation"
                  secondary="Un numéro de déclaration vous sera attribué"
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmSubmit}
                  onChange={(e) => setConfirmSubmit(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  Je confirme que toutes les informations sont exactes et je souhaite soumettre cette déclaration
                </Typography>
              }
            />
          </Paper>
        )}

        {/* Step 3: Soumission */}
        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={64} />
            <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
              Soumission en cours...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Transmission à l'administration fiscale
            </Typography>
            <LinearProgress sx={{ mt: 3, maxWidth: 400, mx: 'auto' }} />
          </Box>
        )}

        {/* Step 4: PDF & Succès */}
        {activeStep === 3 && (
          <>
            {submissionResult && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  ✅ Déclaration soumise avec succès
                </Typography>
                <Typography variant="caption" display="block">
                  Numéro de déclaration: <strong>{submissionResult.numero_declaration || 'En attente'}</strong>
                </Typography>
                <Typography variant="caption" display="block">
                  Date de dépôt: <strong>{submissionResult.date_depot ? formatDate(submissionResult.date_depot) : new Date().toLocaleDateString('fr-FR')}</strong>
                </Typography>
              </Alert>
            )}

            {generatingPDF && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress size={48} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Génération du PDF en cours...
                </Typography>
              </Box>
            )}

            {pdfGenerated && (
              <Alert severity="success" icon={<GetApp />}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  📄 PDF téléchargé
                </Typography>
                <Typography variant="caption">
                  Le PDF de votre déclaration a été téléchargé automatiquement
                </Typography>
              </Alert>
            )}

            {!generatingPDF && !pdfGenerated && (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <GetApp sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" gutterBottom>
                  Téléchargez le PDF de votre déclaration
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleGeneratePDF}
                  startIcon={<GetApp />}
                  sx={{ mt: 2 }}
                >
                  Télécharger PDF
                </Button>
              </Paper>
            )}
          </>
        )}

        {/* Error display */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting || generatingPDF}>
          {activeStep === 3 ? 'Fermer' : 'Annuler'}
        </Button>

        {activeStep === 1 && (
          <Button
            onClick={handleSubmission}
            variant="contained"
            disabled={!confirmSubmit || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
          >
            {submitting ? 'Soumission...' : 'Soumettre'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default DeclarationSubmission
