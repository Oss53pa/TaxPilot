/**
 * UserManagement — gestion réelle des collaborateurs.
 *
 * Remplace l'ancienne maquette (mockUsers + « Fonctionnalité en cours »).
 * Branché sur userManagementService :
 *   - liste réelle (lp_org_members via RLS),
 *   - invitation par email (edge function invite-user → email HTML Resend),
 *   - changement de rôle / activation / renvoi / suppression (RPC definer).
 *
 * Réservé aux admins (la page Paramètres elle-même est gatée par useUserRole).
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  TextField,
  CircularProgress,
  Stack,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Add,
  MoreVert,
  Delete,
  Block,
  CheckCircle,
  People,
  Email,
  AdminPanelSettings,
  Send,
  ContentCopy,
  Refresh,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { format } from 'date-fns'
import { useTenantPlan } from '@/hooks/useTenantPlan'
import { useAuthStore } from '@/store/authStore'
import {
  userManagementService,
  ROLE_OPTIONS,
  ROLE_LABELS,
  type OrgMember,
  type MemberRole,
  type MemberStatus,
} from '@/services/userManagementService'

const ROLE_CHIP_COLOR: Record<MemberRole, 'primary' | 'info' | 'warning' | 'default'> = {
  admin: 'primary',
  comptable: 'info',
  auditeur: 'warning',
  viewer: 'default',
}

const STATUS_CHIP: Record<MemberStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  active: { label: 'Actif', color: 'success' },
  pending: { label: 'En attente', color: 'warning' },
  disabled: { label: 'Désactivé', color: 'error' },
}

const UserManagement: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const currentUserEmail = useAuthStore((s) => s.user?.email?.toLowerCase() || '')

  const supabaseAvailable = userManagementService.isAvailable()

  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<MemberRole>('comptable')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [lastLink, setLastLink] = useState<string | null>(null)

  // Row menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuMember, setMenuMember] = useState<OrgMember | null>(null)

  // Plan gating : max_users plafonne le nombre de collaborateurs actifs.
  const { plan } = useTenantPlan()
  const activeCount = members.filter((m) => m.active).length
  const userLimitReached = plan.max_users !== null && activeCount >= plan.max_users
  const inviteTooltip = userLimitReached
    ? `Votre plan ${plan.displayName} autorise jusqu'à ${plan.max_users} collaborateurs actifs. Passez en plan Cabinet pour une équipe illimitée.`
    : ''

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const list = await userManagementService.listMembers()
      setMembers(list)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (supabaseAvailable) {
      void reload()
    } else {
      setLoading(false)
    }
  }, [supabaseAvailable, reload])

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, m: OrgMember) => {
    setMenuAnchor(e.currentTarget)
    setMenuMember(m)
  }
  const handleMenuClose = () => {
    setMenuAnchor(null)
    setMenuMember(null)
  }

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn()
      enqueueSnackbar(successMsg, { variant: 'success' })
      await reload()
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Erreur', { variant: 'error' })
    }
  }

  const handleChangeRole = async (role: MemberRole) => {
    const m = menuMember
    handleMenuClose()
    if (!m) return
    await runAction(() => userManagementService.updateRole(m.email, role), `Rôle mis à jour : ${ROLE_LABELS[role]}`)
  }

  const handleToggleActive = async () => {
    const m = menuMember
    handleMenuClose()
    if (!m) return
    await runAction(
      () => userManagementService.setActive(m.email, !m.active),
      m.active ? 'Collaborateur désactivé' : 'Collaborateur réactivé',
    )
  }

  const handleResend = async () => {
    const m = menuMember
    handleMenuClose()
    if (!m) return
    await runAction(async () => {
      const res = await userManagementService.resend(m)
      if (!res.emailSent && res.link) setLastLink(res.link)
    }, 'Invitation renvoyée')
  }

  const handleRemove = async () => {
    const m = menuMember
    handleMenuClose()
    if (!m) return
    await runAction(() => userManagementService.remove(m.email), 'Collaborateur retiré')
  }

  const resetInviteForm = () => {
    setInviteEmail('')
    setInviteName('')
    setInviteRole('comptable')
    setInviteError(null)
    setLastLink(null)
  }

  const handleInvite = async () => {
    setInviteError(null)
    const email = inviteEmail.trim().toLowerCase()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setInviteError('Adresse email invalide.')
      return
    }
    setInviting(true)
    try {
      const res = await userManagementService.invite({
        email,
        fullName: inviteName.trim(),
        role: inviteRole,
      })
      if (res.emailSent) {
        enqueueSnackbar(`Invitation envoyée à ${email}`, { variant: 'success' })
        setInviteOpen(false)
        resetInviteForm()
      } else {
        // Email non envoyé (Resend non configuré ou erreur) : on affiche le
        // lien à copier manuellement plutôt que de prétendre le contraire.
        setLastLink(res.link)
        setInviteError(
          `Le membre a été créé mais l'email n'a pas pu être envoyé${
            res.emailError ? ` (${res.emailError})` : ''
          }. Copiez le lien ci-dessous et transmettez-le manuellement.`,
        )
      }
      await reload()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Échec de l'invitation")
    } finally {
      setInviting(false)
    }
  }

  const copyLink = () => {
    if (!lastLink) return
    void navigator.clipboard.writeText(lastLink)
    enqueueSnackbar('Lien copié dans le presse-papiers', { variant: 'success' })
  }

  const adminCount = useMemo(() => members.filter((m) => m.role === 'admin').length, [members])
  const pendingCount = useMemo(() => members.filter((m) => m.status === 'pending').length, [members])

  const initials = (name: string, email: string) => {
    const base = (name || email || '?').trim()
    const parts = base.split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return base.slice(0, 2).toUpperCase()
  }

  if (!supabaseAvailable) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          La gestion multi-utilisateurs nécessite la connexion au cloud (Supabase).
          En mode local, l'application fonctionne en mono-utilisateur.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Gestion des Utilisateurs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Invitez vos collaborateurs et gérez leurs rôles. Ils reçoivent un email
            pour confirmer leur compte et définir leur mot de passe.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Rafraîchir">
            <IconButton onClick={() => void reload()} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title={inviteTooltip}>
            <span>
              <Button
                variant="contained"
                startIcon={<Add />}
                disabled={userLimitReached}
                onClick={() => {
                  resetInviteForm()
                  setInviteOpen(true)
                }}
              >
                Inviter un utilisateur
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {/* Statistiques rapides */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip icon={<People />} label={`${activeCount} actif(s)`} color="success" variant="outlined" />
        <Chip icon={<AdminPanelSettings />} label={`${adminCount} admin(s)`} color="primary" variant="outlined" />
        <Chip icon={<Email />} label={`${pendingCount} en attente`} color="warning" variant="outlined" />
      </Box>

      {/* Table des membres */}
      <Card>
        <CardHeader title="Collaborateurs" avatar={<People color="primary" />} />
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : members.length === 0 ? (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Aucun collaborateur pour l'instant. Invitez votre premier collaborateur.
              </Typography>
              <Button variant="outlined" startIcon={<Add />} onClick={() => { resetInviteForm(); setInviteOpen(true) }}>
                Inviter un utilisateur
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Dernière connexion</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((m) => {
                    const isSelf = m.email.toLowerCase() === currentUserEmail
                    return (
                      <TableRow key={m.email} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: m.active ? 'primary.main' : 'grey.400', width: 40, height: 40 }}>
                              {initials(m.name, m.email)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {m.name || m.email}
                                {isSelf && (
                                  <Chip label="vous" size="small" sx={{ ml: 1, height: 18 }} />
                                )}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {m.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={ROLE_LABELS[m.role]} color={ROLE_CHIP_COLOR[m.role]} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={STATUS_CHIP[m.status].label} color={STATUS_CHIP[m.status].color} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {m.lastLoginAt ? format(new Date(m.lastLoginAt), 'dd/MM/yyyy HH:mm') : 'Jamais'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            disabled={m.role === 'admin' && isSelf}
                            onClick={(e) => handleMenuOpen(e, m)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Menu contextuel par ligne */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <Typography variant="overline" sx={{ px: 2, color: 'text.secondary' }}>
          Changer le rôle
        </Typography>
        {ROLE_OPTIONS.map((r) => (
          <MenuItem
            key={r.value}
            selected={menuMember?.role === r.value}
            onClick={() => void handleChangeRole(r.value)}
          >
            <ListItemText primary={r.label} secondary={r.description} />
          </MenuItem>
        ))}
        <Divider />
        {menuMember?.status === 'pending' && (
          <MenuItem onClick={() => void handleResend()}>
            <Send sx={{ mr: 1 }} fontSize="small" />
            Renvoyer l'invitation
          </MenuItem>
        )}
        <MenuItem onClick={() => void handleToggleActive()}>
          {menuMember?.active ? (
            <>
              <Block sx={{ mr: 1 }} fontSize="small" />
              Désactiver
            </>
          ) : (
            <>
              <CheckCircle sx={{ mr: 1 }} fontSize="small" />
              Réactiver
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => void handleRemove()} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Retirer de l'organisation
        </MenuItem>
      </Menu>

      {/* Dialog d'invitation */}
      <Dialog open={inviteOpen} onClose={() => !inviting && setInviteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Inviter un collaborateur</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Le collaborateur recevra un email contenant un lien sécurisé pour confirmer
            son adresse, définir son mot de passe et accéder à l'application.
          </Typography>

          {inviteError && (
            <Alert severity={lastLink ? 'warning' : 'error'} sx={{ mb: 2 }}>
              {inviteError}
            </Alert>
          )}

          {lastLink && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                {lastLink}
              </Typography>
              <Button size="small" startIcon={<ContentCopy />} onClick={copyLink} sx={{ mt: 1 }}>
                Copier le lien
              </Button>
            </Box>
          )}

          <TextField
            fullWidth
            label="Adresse email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            autoComplete="email"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Nom complet"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Rôle"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as MemberRole)}
          >
            {ROLE_OPTIONS.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                <ListItemText primary={r.label} secondary={r.description} />
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)} disabled={inviting}>
            {lastLink ? 'Fermer' : 'Annuler'}
          </Button>
          <Button
            variant="contained"
            startIcon={inviting ? <CircularProgress size={16} color="inherit" /> : <Send />}
            onClick={() => void handleInvite()}
            disabled={inviting}
          >
            Envoyer l'invitation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserManagement
