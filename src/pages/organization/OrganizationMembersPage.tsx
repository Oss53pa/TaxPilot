/**
 * Page de gestion des membres d'une organisation
 * Permet de voir, ajouter, modifier et supprimer des membres
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
} from '@mui/icons-material'
import organizationService, { OrganizationMember } from '../../services/organizationService'

interface OrganizationMembersPageProps {
  organizationSlug: string
}

const OrganizationMembersPage: React.FC<OrganizationMembersPageProps> = ({ organizationSlug }) => {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // État pour le dialogue d'invitation
  const [openInviteDialog, setOpenInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER')
  const [inviting, setInviting] = useState(false)

  // État pour le dialogue d'édition
  const [editMember, setEditMember] = useState<OrganizationMember | null>(null)
  const [editRole, setEditRole] = useState<string>('')
  const [updating, setUpdating] = useState(false)

  // État pour la confirmation de suppression
  const [deleteMember, setDeleteMember] = useState<OrganizationMember | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadMembers()
  }, [organizationSlug])

  const loadMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await organizationService.getMembers(organizationSlug)
      setMembers(data)
    } catch (err: any) {
      console.error('Error loading members:', err)
      setError(err.message || 'Erreur lors du chargement des membres')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setError('Veuillez entrer une adresse email')
      return
    }

    try {
      setInviting(true)
      setError(null)

      await organizationService.sendInvitation({
        organization: organizationSlug,
        email: inviteEmail,
        role: inviteRole,
      })

      setSuccess('Invitation envoyée avec succès!')
      setOpenInviteDialog(false)
      setInviteEmail('')
      setInviteRole('MEMBER')

      // Recharger la liste
      setTimeout(() => loadMembers(), 1000)
    } catch (err: any) {
      console.error('Error inviting member:', err)
      setError(err.message || 'Erreur lors de l\'envoi de l\'invitation')
    } finally {
      setInviting(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!editMember) return

    try {
      setUpdating(true)
      setError(null)

      await organizationService.updateMemberRole(editMember.id, editRole)

      setSuccess('Rôle mis à jour avec succès!')
      setEditMember(null)
      setEditRole('')

      // Recharger la liste
      loadMembers()
    } catch (err: any) {
      console.error('Error updating member role:', err)
      setError(err.message || 'Erreur lors de la mise à jour du rôle')
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!deleteMember) return

    try {
      setDeleting(true)
      setError(null)

      await organizationService.removeMember(deleteMember.id)

      setSuccess('Membre retiré avec succès!')
      setDeleteMember(null)

      // Recharger la liste
      loadMembers()
    } catch (err: any) {
      console.error('Error removing member:', err)
      setError(err.message || 'Erreur lors de la suppression du membre')
    } finally {
      setDeleting(false)
    }
  }

  const openEditDialog = (member: OrganizationMember) => {
    setEditMember(member)
    setEditRole(member.role)
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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              Membres de l'organisation
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenInviteDialog(true)}
            >
              Inviter un membre
            </Button>
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

          {/* Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Date d'ajout</TableCell>
                  <TableCell>Invité par</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="textSecondary">
                        Aucun membre pour le moment
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.user.first_name} {member.user.last_name}
                      </TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={organizationService.getMemberRoleLabel(member.role)}
                          size="small"
                          style={{
                            backgroundColor: organizationService.getMemberRoleColor(member.role),
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {member.invited_by_detail
                          ? `${member.invited_by_detail.first_name} ${member.invited_by_detail.last_name}`
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {member.role !== 'OWNER' && (
                          <>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openEditDialog(member)}
                              title="Modifier le rôle"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteMember(member)}
                              title="Retirer le membre"
                            >
                              <DeleteIcon />
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
        </CardContent>
      </Card>

      {/* Dialog d'invitation */}
      <Dialog open={openInviteDialog} onClose={() => setOpenInviteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Inviter un nouveau membre</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Adresse email"
            type="email"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="exemple@entreprise.com"
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth>
            <InputLabel>Rôle</InputLabel>
            <Select
              value={inviteRole}
              label="Rôle"
              onChange={(e) => setInviteRole(e.target.value as any)}
            >
              <MenuItem value="ADMIN">Administrateur</MenuItem>
              <MenuItem value="MEMBER">Membre</MenuItem>
              <MenuItem value="VIEWER">Observateur</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Un email d'invitation sera envoyé à cette adresse.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInviteDialog(false)}>Annuler</Button>
          <Button
            onClick={handleInvite}
            variant="contained"
            disabled={inviting}
            startIcon={inviting ? <CircularProgress size={16} /> : <EmailIcon />}
          >
            {inviting ? 'Envoi...' : 'Envoyer l\'invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'édition de rôle */}
      <Dialog open={!!editMember} onClose={() => setEditMember(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier le rôle</DialogTitle>
        <DialogContent>
          {editMember && (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Membre: {editMember.user.first_name} {editMember.user.last_name} ({editMember.user.email})
              </Typography>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Nouveau rôle</InputLabel>
                <Select
                  value={editRole}
                  label="Nouveau rôle"
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <MenuItem value="ADMIN">Administrateur</MenuItem>
                  <MenuItem value="MEMBER">Membre</MenuItem>
                  <MenuItem value="VIEWER">Observateur</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMember(null)}>Annuler</Button>
          <Button
            onClick={handleUpdateRole}
            variant="contained"
            disabled={updating}
          >
            {updating ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!deleteMember} onClose={() => setDeleteMember(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          {deleteMember && (
            <Typography>
              Êtes-vous sûr de vouloir retirer <strong>{deleteMember.user.first_name} {deleteMember.user.last_name}</strong> de l'organisation ?
              Cette action est irréversible.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteMember(null)}>Annuler</Button>
          <Button
            onClick={handleRemoveMember}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Suppression...' : 'Retirer le membre'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default OrganizationMembersPage
