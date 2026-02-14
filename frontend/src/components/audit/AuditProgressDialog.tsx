/**
 * Modal de progression pendant l'execution de l'audit
 */

import React, { useRef, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import type { ResultatControle, NiveauControle } from '@/types/audit.types'
import { NIVEAUX_NOMS } from '@/types/audit.types'

interface AuditProgressDialogProps {
  open: boolean
  niveauCourant: NiveauControle
  pourcentage: number
  resultatsEnCours: ResultatControle[]
  isRunning: boolean
  onCancel: () => void
  onClose: () => void
}

const severiteIcon = (sev: string) => {
  switch (sev) {
    case 'BLOQUANT': return <ErrorIcon sx={{ color: '#dc2626' }} fontSize="small" />
    case 'MAJEUR': return <WarningIcon sx={{ color: '#d97706' }} fontSize="small" />
    case 'MINEUR': return <WarningIcon sx={{ color: '#fbbf24' }} fontSize="small" />
    case 'INFO': return <InfoIcon sx={{ color: '#0ea5e9' }} fontSize="small" />
    case 'OK': return <CheckIcon sx={{ color: '#16a34a' }} fontSize="small" />
    default: return <InfoIcon fontSize="small" />
  }
}

const AuditProgressDialog: React.FC<AuditProgressDialogProps> = ({
  open,
  niveauCourant,
  pourcentage,
  resultatsEnCours,
  isRunning,
  onCancel,
  onClose,
}) => {
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [resultatsEnCours.length])

  const derniers = resultatsEnCours.slice(-20)

  return (
    <Dialog open={open} onClose={isRunning ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isRunning ? 'Audit en cours...' : 'Audit termine'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Niveau {niveauCourant} - {NIVEAUX_NOMS[niveauCourant] || ''}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {pourcentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pourcentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {!isRunning && resultatsEnCours.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(['BLOQUANT', 'MAJEUR', 'MINEUR', 'INFO', 'OK'] as const).map((sev) => {
              const count = resultatsEnCours.filter((r) => r.severite === sev).length
              if (count === 0) return null
              const colors: Record<string, string> = {
                BLOQUANT: '#dc2626', MAJEUR: '#d97706', MINEUR: '#fbbf24', INFO: '#0ea5e9', OK: '#16a34a'
              }
              return (
                <Chip
                  key={sev}
                  label={`${sev}: ${count}`}
                  size="small"
                  sx={{ bgcolor: colors[sev] + '20', color: colors[sev], fontWeight: 600 }}
                />
              )
            })}
          </Box>
        )}

        <Box
          ref={logRef}
          sx={{
            maxHeight: 300,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'grey.50',
          }}
        >
          <List dense disablePadding>
            {derniers.map((r, i) => (
              <ListItem key={i} sx={{ py: 0.5, px: 1 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {severiteIcon(r.severite)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="caption" component="span" sx={{ fontFamily: 'monospace' }}>
                      [{r.ref}] {r.message}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        {isRunning ? (
          <Button onClick={onCancel} color="error">
            Annuler
          </Button>
        ) : (
          <Button onClick={onClose} variant="contained">
            Fermer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default AuditProgressDialog
