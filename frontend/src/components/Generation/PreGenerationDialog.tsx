import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Alert, AlertTitle,
  List, ListItem, ListItemIcon, ListItemText,
  LinearProgress,
} from '@mui/material'
import {
  Block as BlockIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { AuditSeverity, type PreGenerationValidation } from '@/types/audit'

interface PreGenerationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  validation: PreGenerationValidation | null
  isGenerating?: boolean
}

// Severity display config is intentionally kept outside the component
// so it is only created once and can be referenced by tests.
const _severityConfig = {
  [AuditSeverity.BLOCKING]: { icon: <BlockIcon color="error" />, label: 'Bloquant' },
  [AuditSeverity.WARNING]: { icon: <WarningIcon color="warning" />, label: 'Avertissement' },
  [AuditSeverity.INFO]: { icon: <InfoIcon color="info" />, label: 'Information' },
}

// Exported for tests only — not part of the public API.
export { _severityConfig as severityConfig }

const PreGenerationDialog: React.FC<PreGenerationDialogProps> = ({
  open, onClose, onConfirm, validation, isGenerating,
}) => {
  if (!validation) return null

  const progress = validation.totalControls > 0
    ? Math.round((validation.passedControls / validation.totalControls) * 100)
    : 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Validation avant generation
      </DialogTitle>
      <DialogContent dividers>
        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              {validation.passedControls}/{validation.totalControls} controles valides
            </Typography>
            <Typography variant="body2" fontWeight={600}>{progress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={validation.canGenerate ? 'success' : 'error'}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>

        {/* Blocking errors */}
        {validation.blockingErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>
              {validation.blockingErrors.length} erreur(s) bloquante(s)
            </AlertTitle>
            <Typography variant="body2">
              La generation est impossible tant que ces erreurs ne sont pas corrigees.
            </Typography>
            <List dense>
              {validation.blockingErrors.map((err, i) => (
                <ListItem key={i}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <BlockIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`[${err.controlId}] ${err.message}`}
                    secondary={err.suggestion}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>
              {validation.warnings.length} avertissement(s)
            </AlertTitle>
            <List dense>
              {validation.warnings.slice(0, 10).map((w, i) => (
                <ListItem key={i}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <WarningIcon fontSize="small" color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`[${w.controlId}] ${w.message}`}
                    secondary={w.suggestion}
                  />
                </ListItem>
              ))}
              {validation.warnings.length > 10 && (
                <Typography variant="caption" color="text.secondary" sx={{ pl: 5 }}>
                  ... et {validation.warnings.length - 10} autre(s)
                </Typography>
              )}
            </List>
          </Alert>
        )}

        {/* Success */}
        {validation.canGenerate && validation.blockingErrors.length === 0 && (
          <Alert severity="success" icon={<CheckIcon />}>
            <AlertTitle>Pret pour la generation</AlertTitle>
            Tous les controles bloquants sont valides.
            {validation.warnings.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {validation.warnings.length} avertissement(s) detecte(s) — la generation reste possible.
              </Typography>
            )}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={!validation.canGenerate || isGenerating}
        >
          {isGenerating ? 'Generation en cours...' : 'Confirmer et generer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PreGenerationDialog
