/**
 * Composant de gestion des utilisateurs
 */

import React, { useState } from 'react'
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
} from '@mui/material'
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle,
  People,
  Email,
  AdminPanelSettings,
} from '@mui/icons-material'
import { UtilisateurEntreprise } from '@/types'
import dayjs from 'dayjs'

// Données factices pour la démo
const mockUsers: UtilisateurEntreprise[] = [
  {
    id: '1',
    user: {
      id: '1',
      username: 'jean.dupont',
      email: 'jean.dupont@demo-taxpilot.com',
      first_name: 'Jean',
      last_name: 'Dupont',
      is_active: true,
    },
    entreprise: '1',
    role: 'ADMIN',
    modules_acces: {
      parametrage: true,
      balance: true,
      audit: true,
      generation: true,
      templates: true,
      reporting: true,
    },
    permissions_speciales: {},
    date_invitation: '2024-01-15T10:00:00Z',
    date_activation: '2024-01-15T14:30:00Z',
    est_actif: true,
    derniere_connexion: '2024-08-31T08:15:00Z',
    langue_preferee: 'fr',
    theme_interface: 'light',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-08-31T08:15:00Z',
    is_active: true,
  },
  {
    id: '2',
    user: {
      id: '2',
      username: 'marie.martin',
      email: 'marie.martin@demo-taxpilot.com',
      first_name: 'Marie',
      last_name: 'Martin',
      is_active: true,
    },
    entreprise: '1',
    role: 'COMPTABLE_SENIOR',
    modules_acces: {
      parametrage: false,
      balance: true,
      audit: true,
      generation: true,
      templates: false,
      reporting: true,
    },
    permissions_speciales: {},
    date_invitation: '2024-02-01T09:00:00Z',
    date_activation: '2024-02-01T16:20:00Z',
    est_actif: true,
    derniere_connexion: '2024-08-30T17:45:00Z',
    langue_preferee: 'fr',
    theme_interface: 'dark',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-08-30T17:45:00Z',
    is_active: true,
  },
]

const roles = [
  { value: 'SUPER_ADMIN', label: 'Super Administrateur', color: 'error' },
  { value: 'ADMIN', label: 'Administrateur', color: 'primary' },
  { value: 'COMPTABLE_SENIOR', label: 'Comptable Senior', color: 'info' },
  { value: 'COMPTABLE_JUNIOR', label: 'Comptable Junior', color: 'info' },
  { value: 'AUDITEUR', label: 'Auditeur', color: 'warning' },
  { value: 'EXPERT_COMPTABLE', label: 'Expert-Comptable', color: 'success' },
  { value: 'DAF', label: 'Directeur Financier', color: 'primary' },
  { value: 'LECTURE_SEULE', label: 'Lecture Seule', color: 'default' },
]

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UtilisateurEntreprise[]>(mockUsers)
  const [selectedUser, setSelectedUser] = useState<UtilisateurEntreprise | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedMenuUser, setSelectedMenuUser] = useState<UtilisateurEntreprise | null>(null)

  const getRoleConfig = (role: string) => {
    return roles.find(r => r.value === role) || { value: role, label: role, color: 'default' }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UtilisateurEntreprise) => {
    setMenuAnchor(event.currentTarget)
    setSelectedMenuUser(user)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedMenuUser(null)
  }

  const handleEdit = () => {
    setSelectedUser(selectedMenuUser)
    setDialogOpen(true)
    handleMenuClose()
  }

  const handleToggleStatus = () => {
    if (selectedMenuUser) {
      setUsers(users.map(u => 
        u.id === selectedMenuUser.id 
          ? { ...u, est_actif: !u.est_actif }
          : u
      ))
    }
    handleMenuClose()
  }

  const handleDelete = () => {
    if (selectedMenuUser) {
      setUsers(users.filter(u => u.id !== selectedMenuUser.id))
    }
    handleMenuClose()
  }

  const renderUserStatus = (user: UtilisateurEntreprise) => {
    if (!user.est_actif) {
      return <Chip label="Désactivé" color="error" size="small" />
    }
    if (!user.date_activation) {
      return <Chip label="En attente" color="warning" size="small" />
    }
    return <Chip label="Actif" color="success" size="small" />
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Gestion des Utilisateurs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {users.length} utilisateur(s) configuré(s)
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedUser(null)
            setDialogOpen(true)
          }}
        >
          Inviter Utilisateur
        </Button>
      </Box>

      {/* Statistiques rapides */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip
          icon={<People />}
          label={`${users.filter(u => u.est_actif).length} Actifs`}
          color="success"
          variant="outlined"
        />
        <Chip
          icon={<AdminPanelSettings />}
          label={`${users.filter(u => u.role === 'ADMIN').length} Admins`}
          color="primary"
          variant="outlined"
        />
        <Chip
          icon={<Email />}
          label={`${users.filter(u => !u.date_activation).length} En attente`}
          color="warning"
          variant="outlined"
        />
      </Box>

      {/* Table des utilisateurs */}
      <Card>
        <CardHeader
          title="Liste des Utilisateurs"
          avatar={<People color="primary" />}
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Dernière Connexion</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{ 
                            bgcolor: user.est_actif ? 'primary.main' : 'grey.400',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {user.user.first_name[0]}{user.user.last_name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.user.first_name} {user.user.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={getRoleConfig(user.role).label}
                        color={getRoleConfig(user.role).color as any}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      {renderUserStatus(user)}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {user.derniere_connexion 
                          ? dayjs(user.derniere_connexion).format('DD/MM/YYYY HH:mm')
                          : 'Jamais'
                        }
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Modifier
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {selectedMenuUser?.est_actif ? (
            <>
              <Block sx={{ mr: 1 }} fontSize="small" />
              Désactiver
            </>
          ) : (
            <>
              <CheckCircle sx={{ mr: 1 }} fontSize="small" />
              Activer
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Supprimer
        </MenuItem>
      </Menu>

      {/* Dialog d'édition/création */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? 'Modifier Utilisateur' : 'Inviter Nouvel Utilisateur'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Fonctionnalité en cours de développement
          </Alert>
          <Typography color="text.secondary">
            L'interface de gestion des utilisateurs sera disponible prochainement.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserManagement