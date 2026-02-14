/**
 * Bouton de validation de balance avec dialog de confirmation
 * Connecté au backend via balanceService.validateBalance()
 */

import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material'
import { balanceService, Balance } from '@/services/balanceService'

interface BalanceValidationButtonProps {
  balance: Balance
  onValidationSuccess?: () => void
  onValidationError?: (error: string) => void
  variant?: 'contained' | 'outlined' | 'text'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

const BalanceValidationButton: React.FC<BalanceValidationButtonProps> = ({
  balance,
  onValidationSuccess,
  onValidationError,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const canValidate = balance.statut === 'BROUILLON'

  const handleOpenDialog = () => {
    setDialogOpen(true)
    setError(null)
    setValidationResult(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setError(null)
    setValidationResult(null)
  }

  const handleValidate = async () => {
    try {
      setValidating(true)
      setError(null)

      const result = await balanceService.validateBalance(balance.id)

      setValidationResult(result)

      // Appeler le callback de succès après un court délai
      setTimeout(() => {
        if (onValidationSuccess) {
          onValidationSuccess()
        }
        handleCloseDialog()
      }, 2000)
    } catch (err: any) {
      console.error('Validation failed:', err)
      const errorMsg = err.message || 'Erreur lors de la validation de la balance'
      setError(errorMsg)

      if (onValidationError) {
        onValidationError(errorMsg)
      }
    } finally {
      setValidating(false)
    }
  }

  // Pré-vérifications avant validation
  const preValidationChecks = [
    {
      label: 'Équilibre débit/crédit',
      status: Math.abs(balance.total_debit - balance.total_credit) < 0.01 ? 'success' : 'error',
      message: Math.abs(balance.total_debit - balance.total_credit) < 0.01
        ? 'Balance équilibrée'
        : `Écart de ${Math.abs(balance.total_debit - balance.total_credit).toLocaleString()}`,
    },
    {
      label: 'Nombre de lignes',
      status: balance.nb_lignes > 0 ? 'success' : 'error',
      message: `${balance.nb_lignes} ligne(s)`,
    },
    {
      label: 'Entreprise associée',
      status: balance.entreprise ? 'success' : 'error',
      message: balance.entreprise_detail?.raison_sociale || balance.entreprise || 'Non définie',
    },
    {
      label: 'Exercice associé',
      status: balance.exercice ? 'success' : 'error',
      message: balance.exercice_detail?.nom || balance.exercice || 'Non défini',
    },
  ]

  const hasErrors = preValidationChecks.some(check => check.status === 'error')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />
      case 'error':
        return <Error color="error" />
      case 'warning':
        return <Warning color="warning" />
      default:
        return <Info color="info" />
    }
  }

  return (
    <>
      {/* Bouton de validation */}
      <Button
        variant={variant}
        color="success"
        size={size}
        fullWidth={fullWidth}
        onClick={handleOpenDialog}
        disabled={!canValidate}
        startIcon={<CheckCircle />}
      >
        Valider la Balance
      </Button>

      {/* Dialog de confirmation */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="primary" />
            <Typography variant="h6">Validation de la Balance</Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Info balance */}
            <Alert severity="info" icon={false}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {balance.nom}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {balance.entreprise_detail?.raison_sociale} - {balance.exercice_detail?.nom}
              </Typography>
            </Alert>

            {/* Pré-vérifications */}
            {!validationResult && !validating && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Pré-vérifications :
                </Typography>
                <List dense>
                  {preValidationChecks.map((check, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getStatusIcon(check.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={check.label}
                        secondary={check.message}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>

                {hasErrors && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Des erreurs bloquantes ont été détectées. Veuillez les corriger avant de valider.
                  </Alert>
                )}

                {!hasErrors && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Toutes les pré-vérifications sont passées. Vous pouvez procéder à la validation.
                  </Alert>
                )}
              </Box>
            )}

            {/* En cours de validation */}
            {validating && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Validation en cours...
                </Typography>
              </Box>
            )}

            {/* Résultat de validation */}
            {validationResult && (
              <Alert severity="success">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Balance validée avec succès !
                </Typography>
                <Typography variant="caption">
                  La balance est maintenant en statut VALIDEE
                </Typography>
              </Alert>
            )}

            {/* Erreur */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={validating}>
            {validationResult ? 'Fermer' : 'Annuler'}
          </Button>
          {!validationResult && (
            <Button
              onClick={handleValidate}
              variant="contained"
              color="success"
              disabled={validating || hasErrors}
              startIcon={validating ? <CircularProgress size={20} /> : <CheckCircle />}
            >
              {validating ? 'Validation...' : 'Confirmer la Validation'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BalanceValidationButton
