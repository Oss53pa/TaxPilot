/**
 * Composant de gestion des transitions de statut d'une liasse
 * Connecté au backend via generationService.getTransitions() et transition()
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Chip,
  Button,
  Menu,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Lock,
  CheckCircle,
  Archive,
  Undo,
  Error as ErrorIcon,
  Send,
  ArrowDropDown,
  Edit,
} from '@mui/icons-material'
import { generationService, LiasseGeneration } from '@/services/generationService'

interface StatusAction {
  action: string
  label: string
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'error'
  confirmation?: string
  requires_confirmation: boolean
}

interface LiasseStatusWorkflowProps {
  liasse: LiasseGeneration
  onStatusChange?: () => void
}

const LiasseStatusWorkflow: React.FC<LiasseStatusWorkflowProps> = ({
  liasse,
  onStatusChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [availableActions, setAvailableActions] = useState<StatusAction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<StatusAction | null>(null)
  const [executing, setExecuting] = useState(false)

  // Charger les transitions disponibles
  useEffect(() => {
    loadAvailableTransitions()
  }, [liasse.id, liasse.statut])

  const loadAvailableTransitions = async () => {
    try {
      setLoading(true)
      setError(null)
      const transitions = await generationService.getTransitions(liasse.id) as any[]

      const actions: StatusAction[] = transitions.map((t: any) => ({
        action: t.action,
        label: t.label,
        icon: getIconForAction(t.action),
        color: getColorForAction(t.action),
        confirmation: t.confirmation_message,
        requires_confirmation: t.requires_confirmation || false,
      }))

      setAvailableActions(actions)
    } catch (err: any) {
      console.error('Failed to load transitions:', err)
      setError('Impossible de charger les transitions disponibles')
      setAvailableActions([])
    } finally {
      setLoading(false)
    }
  }

  const handleActionClick = (action: StatusAction) => {
    setSelectedAction(action)
    setAnchorEl(null)

    if (action.requires_confirmation) {
      setConfirmDialogOpen(true)
    } else {
      executeAction(action)
    }
  }

  const executeAction = async (action: StatusAction) => {
    try {
      setExecuting(true)
      await generationService.transition(liasse.id, action.action)

      // Success
      if (onStatusChange) {
        onStatusChange()
      }

      setConfirmDialogOpen(false)
      setSelectedAction(null)
    } catch (err: any) {
      console.error('Transition failed:', err)
      setError(err.message || `Erreur lors de l'action "${action.label}"`)
    } finally {
      setExecuting(false)
    }
  }

  const handleConfirmAction = () => {
    if (selectedAction) {
      executeAction(selectedAction)
    }
  }

  // Définir les étapes du workflow
  const statusSteps = ['BROUILLON', 'EN_PREPARATION', 'VALIDEE', 'FINALISEE', 'ARCHIVEE']
  const currentStepIndex = statusSteps.findIndex(s => s === liasse.statut)
  const activeStep = currentStepIndex >= 0 ? currentStepIndex : 0

  return (
    <Box>
      {/* Stepper visuel du workflow */}
      <Stepper activeStep={activeStep} sx={{ mb: 3 }} alternativeLabel>
        {statusSteps.map((status) => (
          <Step key={status}>
            <StepLabel>{status}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Statut actuel et actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Statut actuel:
        </Typography>

        <Chip
          label={liasse.statut}
          color={getStatusColor(liasse.statut) as any}
          size="medium"
          sx={{ fontWeight: 600 }}
        />

        {/* Menu actions disponibles */}
        {availableActions.length > 0 && (
          <>
            <Button
              variant="outlined"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              endIcon={<ArrowDropDown />}
              disabled={loading}
            >
              Changer le statut
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {availableActions.map((action) => (
                <MenuItem
                  key={action.action}
                  onClick={() => handleActionClick(action)}
                >
                  <ListItemIcon>{action.icon}</ListItemIcon>
                  <ListItemText>{action.label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

        {availableActions.length === 0 && !loading && (
          <Chip
            label="Aucune action disponible"
            size="small"
            variant="outlined"
            color="default"
          />
        )}

        {loading && <CircularProgress size={20} />}
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => !executing && setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmer l'action
        </DialogTitle>

        <DialogContent>
          {selectedAction && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {selectedAction.confirmation || `Êtes-vous sûr de vouloir ${selectedAction.label}?`}
                </Typography>
              </Alert>

              <Typography variant="body2" color="text.secondary">
                Cette action va modifier le statut de la liasse de <strong>{liasse.statut}</strong> à un nouveau statut.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            disabled={executing}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={selectedAction?.color || 'primary'}
            disabled={executing}
            startIcon={executing ? <CircularProgress size={20} /> : selectedAction?.icon}
          >
            {executing ? 'En cours...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Helper functions
function getIconForAction(action: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    verrouiller: <Lock />,
    finaliser: <CheckCircle />,
    archiver: <Archive />,
    invalider: <ErrorIcon />,
    remettre_brouillon: <Undo />,
    declarer: <Send />,
    valider: <CheckCircle />,
  }
  return icons[action] || <Edit />
}

function getColorForAction(action: string): 'primary' | 'success' | 'warning' | 'error' {
  const colors: Record<string, any> = {
    verrouiller: 'warning',
    finaliser: 'success',
    archiver: 'primary',
    invalider: 'error',
    remettre_brouillon: 'warning',
    declarer: 'success',
    valider: 'success',
  }
  return colors[action] || 'primary'
}

function getStatusColor(statut: string): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  const colors: Record<string, any> = {
    BROUILLON: 'default',
    EN_PREPARATION: 'primary',
    EN_COURS: 'primary',
    VALIDEE: 'success',
    FINALISEE: 'success',
    TERMINEE: 'success',
    ERREUR: 'error',
    ARCHIVEE: 'default',
  }
  return colors[statut] || 'default'
}

export default LiasseStatusWorkflow
