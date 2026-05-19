import { logger } from '@/utils/logger'
/**
 * Dialog réutilisable pour inviter un nouveau membre à une organisation.
 *
 * Flux :
 *  1. L'administrateur saisit email + rôle.
 *  2. L'invitation est créée côté serveur (qui doit envoyer un email avec
 *     le lien d'accès).
 *  3. Sécurité : le lien d'accès direct est affiché dans le dialog,
 *     permettant à l'admin de le transmettre manuellement (Slack, WhatsApp,
 *     SMS…) sans dépendre exclusivement du SMTP backend.
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
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Email as EmailIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import organizationService from '../../services/organizationService'

interface InviteMemberDialogProps {
  open: boolean
  onClose: () => void
  organizationSlug: string
  onSuccess?: () => void
}

type RoleType = 'ADMIN' | 'MEMBER' | 'VIEWER'

const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  open,
  onClose,
  organizationSlug,
  onSuccess,
}) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<RoleType>('MEMBER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accessUrl, setAccessUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const resetForm = () => {
    setEmail('')
    setRole('MEMBER')
    setError(null)
    setAccessUrl(null)
    setCopied(false)
  }

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

      const invitation = await organizationService.sendInvitation({
        organization: organizationSlug,
        email: email.trim(),
        role,
      })

      // Construit l'URL d'accès pour permettre à l'admin de la copier
      // directement, indépendamment de l'envoi email (résilience SMTP).
      if (invitation?.token) {
        const url = organizationService.buildInvitationUrl(invitation.token)
        setAccessUrl(url)
      }

      // Call success callback (e.g. refresh list)
      if (onSuccess) {
        onSuccess()
      }
      // Note: on ne ferme PAS le dialog ici, on affiche le lien d'accès.
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'invitation'
      logger.error('Error sending invitation:', err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAccessUrl = async () => {
    if (!accessUrl) return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(accessUrl)
      } else {
        // Fallback pour environnements sans Clipboard API
        const ta = document.createElement('textarea')
        ta.value = accessUrl
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      logger.error('Error copying access URL:', err)
      setError('Impossible de copier le lien — copiez-le manuellement')
    }
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {accessUrl ? 'Invitation envoyée' : 'Inviter un nouveau membre'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {accessUrl ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }} icon={<CheckIcon />}>
              Un email a été envoyé à <strong>{email}</strong>. Le destinataire
              définira son mot de passe lors de sa première connexion.
            </Alert>

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Lien d'accès direct à l'application
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1.5, display: 'block' }}>
              Si l'email tarde à arriver, copiez et transmettez ce lien manuellement.
              Il reste valable pendant 7 jours.
            </Typography>

            <TextField
              fullWidth
              value={accessUrl}
              size="small"
              InputProps={{
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: 13 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleCopyAccessUrl}
                      color={copied ? 'success' : 'default'}
                      title={copied ? 'Copié !' : 'Copier le lien'}
                    >
                      {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onFocus={(e) => e.currentTarget.select()}
            />
          </Box>
        ) : (
          <>
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
                onChange={(e) => setRole(e.target.value as RoleType)}
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
              Un email d'invitation sera envoyé à cette adresse. Le destinataire aura 7 jours
              pour définir son mot de passe et accéder à l'application.
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions>
        {accessUrl ? (
          <Button onClick={handleClose} variant="contained">
            Fermer
          </Button>
        ) : (
          <>
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
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default InviteMemberDialog
