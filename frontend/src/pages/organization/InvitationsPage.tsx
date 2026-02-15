import { logger } from '@/utils/logger'
/**
 * Page de gestion des invitations (envoyées et reçues)
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  // Dialog,
  // DialogTitle,
  // DialogContent,
  // DialogActions,
} from '@mui/material'
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import organizationService, { Invitation } from '../../services/organizationService'
import InviteMemberDialog from '../../components/organization/InviteMemberDialog'
import { TabPanel } from '@/components/shared/TabPanel'

interface InvitationsPageProps {
  organizationSlug: string
}

const InvitationsPage: React.FC<InvitationsPageProps> = ({ organizationSlug }) => {
  const [tabValue, setTabValue] = useState(0)
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([])
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [acceptingInvitation, setAcceptingInvitation] = useState<string | null>(null)
  const [cancellingInvitation, setCancellingInvitation] = useState<string | null>(null)
  const [resendingInvitation, setResendingInvitation] = useState<string | null>(null)

  useEffect(() => {
    loadInvitations()
  }, [organizationSlug])

  const loadInvitations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Charger les invitations envoyées par cette organisation
      const sent = await organizationService.getInvitations(organizationSlug)
      setSentInvitations(sent)

      // Charger les invitations reçues par l'utilisateur (toutes organisations)
      const pending = await organizationService.getPendingInvitations()
      setReceivedInvitations(pending)
    } catch (err: any) {
      logger.error('Error loading invitations:', err)
      setError(err.message || 'Erreur lors du chargement des invitations')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async (invitation: Invitation) => {
    try {
      setAcceptingInvitation(invitation.id)
      setError(null)

      await organizationService.acceptInvitation(invitation.token)

      setSuccess('Invitation acceptée avec succès!')
      loadInvitations()
    } catch (err: any) {
      logger.error('Error accepting invitation:', err)
      setError(err.message || 'Erreur lors de l\'acceptation de l\'invitation')
    } finally {
      setAcceptingInvitation(null)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette invitation ?')) {
      return
    }

    try {
      setCancellingInvitation(invitationId)
      setError(null)

      await organizationService.cancelInvitation(invitationId)

      setSuccess('Invitation annulée avec succès!')
      loadInvitations()
    } catch (err: any) {
      logger.error('Error cancelling invitation:', err)
      setError(err.message || 'Erreur lors de l\'annulation de l\'invitation')
    } finally {
      setCancellingInvitation(null)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      setResendingInvitation(invitationId)
      setError(null)

      await organizationService.resendInvitation(invitationId)

      setSuccess('Invitation renvoyée avec succès!')
      loadInvitations()
    } catch (err: any) {
      logger.error('Error resending invitation:', err)
      setError(err.message || 'Erreur lors du renvoi de l\'invitation')
    } finally {
      setResendingInvitation(null)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2">
              Gestion des invitations
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadInvitations}
              >
                Actualiser
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                onClick={() => setInviteDialogOpen(true)}
              >
                Nouvelle invitation
              </Button>
            </Box>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab
              label={`Invitations envoyées (${sentInvitations.length})`}
              id="invitations-tab-0"
            />
            <Tab
              label={`Invitations reçues (${receivedInvitations.length})`}
              id="invitations-tab-1"
            />
          </Tabs>

          {/* Invitations envoyées */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Invité par</TableCell>
                    <TableCell>Date d'envoi</TableCell>
                    <TableCell>Expire le</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sentInvitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="textSecondary">
                          Aucune invitation envoyée
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sentInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={organizationService.getMemberRoleLabel(invitation.role as any)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={organizationService.getInvitationStatusLabel(invitation.status)}
                            size="small"
                            style={{
                              backgroundColor: organizationService.getInvitationStatusColor(invitation.status),
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {invitation.invited_by_detail
                            ? `${invitation.invited_by_detail.first_name} ${invitation.invited_by_detail.last_name}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell align="right">
                          {invitation.status === 'PENDING' && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleResendInvitation(invitation.id)}
                                disabled={resendingInvitation === invitation.id}
                                title="Renvoyer l'invitation"
                              >
                                {resendingInvitation === invitation.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <RefreshIcon />
                                )}
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancelInvitation(invitation.id)}
                                disabled={cancellingInvitation === invitation.id}
                                title="Annuler l'invitation"
                              >
                                {cancellingInvitation === invitation.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <CancelIcon />
                                )}
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Invitations reçues */}
          <TabPanel value={tabValue} index={1}>
            {receivedInvitations.length === 0 ? (
              <Alert severity="info">
                Vous n'avez aucune invitation en attente.
              </Alert>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {receivedInvitations.map((invitation) => (
                  <Paper key={invitation.id} sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {invitation.organization_detail?.name || 'Organisation'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Vous avez été invité(e) en tant que{' '}
                          <strong>{organizationService.getMemberRoleLabel(invitation.role as any)}</strong>
                        </Typography>
                        <Box display="flex" gap={1} mt={1}>
                          <Chip
                            icon={<ScheduleIcon />}
                            label={`Envoyée le ${new Date(invitation.created_at).toLocaleDateString('fr-FR')}`}
                            size="small"
                          />
                          <Chip
                            icon={<ScheduleIcon />}
                            label={`Expire le ${new Date(invitation.expires_at).toLocaleDateString('fr-FR')}`}
                            size="small"
                            color="warning"
                          />
                        </Box>
                        {invitation.message && (
                          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                            "{invitation.message}"
                          </Typography>
                        )}
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={acceptingInvitation === invitation.id ? <CircularProgress size={16} /> : <CheckIcon />}
                          onClick={() => handleAcceptInvitation(invitation)}
                          disabled={acceptingInvitation === invitation.id}
                        >
                          Accepter
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancelInvitation(invitation.id)}
                          disabled={cancellingInvitation === invitation.id}
                        >
                          Refuser
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Dialog d'invitation */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        organizationSlug={organizationSlug}
        onSuccess={() => {
          setSuccess('Invitation envoyée avec succès!')
          loadInvitations()
        }}
      />
    </Box>
  )
}

export default InvitationsPage
