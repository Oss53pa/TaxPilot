/**
 * Dialog de Calcul Automatique de la TVA
 * Calcul intelligent de la TVA avec validation et détails
 */

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material'
import {
  Calculate,
  Close,
  Info,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material'
import { taxService } from '@/services/taxService'

interface CalculTVADialogProps {
  open: boolean
  onClose: () => void
  entrepriseId?: string
  entrepriseName?: string
  onCalculComplete?: (result: any) => void
}

interface TVACalculResult {
  tva_due: number
  tva_collectee: number
  tva_deductible: number
  credit_precedent: number
  montant_a_payer: number
  credit_reporter: number
  details_calcul: Array<{
    etape: string
    description: string
    montant: number
  }>
  avertissements?: string[]
}

const CalculTVADialog: React.FC<CalculTVADialogProps> = ({
  open,
  onClose,
  entrepriseId,
  entrepriseName,
  onCalculComplete,
}) => {
  // Form data
  const [periodeDebut, setPeriodeDebut] = useState<string>('')
  const [periodeFin, setPeriodeFin] = useState<string>('')
  const [tvaCollectee, setTvaCollectee] = useState<string>('')
  const [tvaDeductible, setTvaDeductible] = useState<string>('')
  const [creditPrecedent, setCreditPrecedent] = useState<string>('0')

  // State
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TVACalculResult | null>(null)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setPeriodeDebut('')
    setPeriodeFin('')
    setTvaCollectee('')
    setTvaDeductible('')
    setCreditPrecedent('0')
    setError(null)
    setResult(null)
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!entrepriseId) {
      newErrors.entreprise = 'Entreprise requise'
    }

    if (!periodeDebut) {
      newErrors.periodeDebut = 'Date de début requise'
    }

    if (!periodeFin) {
      newErrors.periodeFin = 'Date de fin requise'
    }

    if (periodeDebut && periodeFin && new Date(periodeDebut) > new Date(periodeFin)) {
      newErrors.periodeFin = 'La date de fin doit être après la date de début'
    }

    if (!tvaCollectee || isNaN(Number(tvaCollectee)) || Number(tvaCollectee) < 0) {
      newErrors.tvaCollectee = 'TVA collectée invalide'
    }

    if (!tvaDeductible || isNaN(Number(tvaDeductible)) || Number(tvaDeductible) < 0) {
      newErrors.tvaDeductible = 'TVA déductible invalide'
    }

    if (isNaN(Number(creditPrecedent)) || Number(creditPrecedent) < 0) {
      newErrors.creditPrecedent = 'Crédit précédent invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCalculate = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setCalculating(true)
      setError(null)

      const data = {
        entreprise_id: entrepriseId!,
        periode_debut: periodeDebut,
        periode_fin: periodeFin,
        tva_collectee: Number(tvaCollectee),
        tva_deductible: Number(tvaDeductible),
        credit_precedent: Number(creditPrecedent),
      }

      const calculResult = await taxService.calculateTVA(data as any)
      setResult(calculResult as TVACalculResult)

      if (onCalculComplete) {
        onCalculComplete(calculResult)
      }
    } catch (err: any) {
      console.error('TVA calculation failed:', err)
      setError(err.message || 'Erreur lors du calcul de la TVA')
      setResult(null)
    } finally {
      setCalculating(false)
    }
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant)
  }

  const handleClose = () => {
    if (!calculating) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calculate color="primary" />
          <Typography variant="h6">Calcul Automatique de la TVA</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={calculating}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Info entreprise */}
        {entrepriseName && (
          <Alert severity="info" icon={false} sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Entreprise:</strong> {entrepriseName}
            </Typography>
          </Alert>
        )}

        {/* Formulaire de saisie */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            📋 Période et montants
          </Typography>

          <Grid container spacing={2}>
            {/* Période */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date début *"
                type="date"
                value={periodeDebut}
                onChange={(e) => setPeriodeDebut(e.target.value)}
                error={Boolean(errors.periodeDebut)}
                helperText={errors.periodeDebut}
                InputLabelProps={{ shrink: true }}
                disabled={calculating || Boolean(result)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date fin *"
                type="date"
                value={periodeFin}
                onChange={(e) => setPeriodeFin(e.target.value)}
                error={Boolean(errors.periodeFin)}
                helperText={errors.periodeFin}
                InputLabelProps={{ shrink: true }}
                disabled={calculating || Boolean(result)}
              />
            </Grid>

            {/* TVA Collectée */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="TVA Collectée *"
                type="number"
                value={tvaCollectee}
                onChange={(e) => setTvaCollectee(e.target.value)}
                error={Boolean(errors.tvaCollectee)}
                helperText={errors.tvaCollectee || 'TVA sur ventes'}
                InputProps={{
                  endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrendingUp color="success" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                disabled={calculating || Boolean(result)}
              />
            </Grid>

            {/* TVA Déductible */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="TVA Déductible *"
                type="number"
                value={tvaDeductible}
                onChange={(e) => setTvaDeductible(e.target.value)}
                error={Boolean(errors.tvaDeductible)}
                helperText={errors.tvaDeductible || 'TVA sur achats'}
                InputProps={{
                  endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrendingDown color="error" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                disabled={calculating || Boolean(result)}
              />
            </Grid>

            {/* Crédit précédent */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Crédit TVA Précédent"
                type="number"
                value={creditPrecedent}
                onChange={(e) => setCreditPrecedent(e.target.value)}
                error={Boolean(errors.creditPrecedent)}
                helperText={errors.creditPrecedent || 'Crédit à reporter (optionnel)'}
                InputProps={{
                  endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                }}
                disabled={calculating || Boolean(result)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Résultats */}
        {result && (
          <>
            {/* Résultat principal */}
            <Card sx={{ mb: 3, bgcolor: result.montant_a_payer > 0 ? 'warning.light' : 'success.light' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      {result.montant_a_payer > 0 ? 'TVA À PAYER' : 'CRÉDIT TVA À REPORTER'}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: result.montant_a_payer > 0 ? 'warning.dark' : 'success.dark',
                      }}
                    >
                      {formatMontant(result.montant_a_payer > 0 ? result.montant_a_payer : result.credit_reporter)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption">TVA Collectée:</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                          {formatMontant(result.tva_collectee)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption">TVA Déductible:</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                          - {formatMontant(result.tva_deductible)}
                        </Typography>
                      </Box>
                      {result.credit_precedent > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Crédit Précédent:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                            - {formatMontant(result.credit_precedent)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Détails du calcul */}
            {result.details_calcul && result.details_calcul.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  📊 Détails du Calcul
                </Typography>
                <List dense>
                  {result.details_calcul.map((detail, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemText
                        primary={detail.etape}
                        secondary={detail.description}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 600, ml: 2 }}
                      >
                        {formatMontant(detail.montant)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Avertissements */}
            {result.avertissements && result.avertissements.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  ⚠️ Avertissements
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {result.avertissements.map((warning, index) => (
                    <li key={index}>
                      <Typography variant="caption">{warning}</Typography>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Succès */}
            <Alert severity="success">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ✅ Calcul TVA effectué avec succès
              </Typography>
              <Typography variant="caption">
                Vous pouvez maintenant créer votre déclaration de TVA
              </Typography>
            </Alert>
          </>
        )}

        {/* Error display */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Info aide */}
        {!result && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.lighter', mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Info color="info" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  <strong>Comment calculer la TVA ?</strong>
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  1. La TVA collectée = TVA facturée à vos clients
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  2. La TVA déductible = TVA payée sur vos achats
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  3. TVA à payer = TVA collectée - TVA déductible - Crédit précédent
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={calculating}>
          {result ? 'Fermer' : 'Annuler'}
        </Button>
        {!result && (
          <Button
            onClick={handleCalculate}
            variant="contained"
            disabled={calculating}
            startIcon={calculating ? <CircularProgress size={20} /> : <Calculate />}
          >
            {calculating ? 'Calcul en cours...' : 'Calculer TVA'}
          </Button>
        )}
        {result && (
          <Button
            onClick={resetForm}
            variant="outlined"
            startIcon={<Calculate />}
          >
            Nouveau Calcul
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default CalculTVADialog
