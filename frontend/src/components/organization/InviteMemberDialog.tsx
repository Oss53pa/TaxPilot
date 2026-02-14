/**
 * Dialog réutilisable pour inviter un nouveau membre à une organisation
 */

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import { Email as EmailIcon } from '@mui/icons-material'
import organizationService from '../../services/organizationService'

interface InviteMemberDialogProps {
  open: boolean
  onClose: () => void
  organizationSlug: string
  onSuccess?: () => void
}

const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  open,
  onClose,
  organizationSlug,
  onSuccess,
}) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Veuillez entrer une adresse email')
      return
    }

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Adresse email invalide')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await organizationService.sendInvitation({
        organization: organizationSlug,
        email: email.trim(),
        role,
      })

      // Reset form
      setEmail('')
      setRole('MEMBER')

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

      // Close dialog
      onClose()
    } catch (err: any) {
      console.error('Error sending invitation:', err)
      setError(err.message || 'Erreur lors de l\'envoi de l\'invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setEmail('')
      setRole('MEMBER')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Inviter un nouveau membre</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Adresse email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="exemple@entreprise.com"
          disabled={loading}
          sx={{ mb: 2, mt: 1 }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit()
            }
          }}
        />

        <FormControl fullWidth disabled={loading}>
          <InputLabel>Rôle</InputLabel>
          <Select
            value={role}
            label="Rôle"
            onChange={(e) => setRole(e.target.value as any)}
          >
            <MenuItem value="ADMIN">
              <div>
                <Typography variant="body2">Administrateur</Typography>
                <Typography variant="caption" color="textSecondary">
                  Peut gérer les membres et les paramètres
                </Typography>
              </div>
            </MenuItem>
            <MenuItem value="MEMBER">
              <div>
                <Typography variant="body2">Membre</Typography>
                <Typography variant="caption" color="textSecondary">
                  Peut créer et modifier des liasses
                </Typography>
              </div>
            </MenuItem>
            <MenuItem value="VIEWER">
              <div>
                <Typography variant="body2">Observateur</Typography>
                <Typography variant="caption" color="textSecondary">
                  Peut uniquement consulter les données
                </Typography>
              </div>
            </MenuItem>
          </Select>
        </FormControl>

        <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
          Un email d'invitation sera envoyé à cette adresse. Le destinataire aura 7 jours pour accepter l'invitation.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !email.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <EmailIcon />}
        >
          {loading ? 'Envoi...' : 'Envoyer l\'invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InviteMemberDialog
