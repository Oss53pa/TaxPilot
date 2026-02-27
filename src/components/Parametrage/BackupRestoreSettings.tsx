/**
 * Composant de gestion des sauvegardes et restauration
 */

import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Paper,
  Alert,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material'
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Schedule as ScheduleIcon,
  CloudQueue as CloudIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Shield as ShieldIcon,
  Sync as SyncIcon,
  History as HistoryIcon,
  Add as AddIcon,
} from '@mui/icons-material'

interface BackupInfo {
  id: string
  name: string
  type: 'complete' | 'incremental' | 'manual'
  size: string
  date: string
  status: 'completed' | 'in_progress' | 'failed'
  location: 'local' | 'cloud' | 'both'
}

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
)

const BackupRestoreSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [createBackupDialog, setCreateBackupDialog] = useState(false)
  const [restoreDialog, setRestoreDialog] = useState(false)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true)

  // Données de sauvegarde simulées
  const backups: BackupInfo[] = [
    {
      id: '1',
      name: 'Sauvegarde complète - Février 2024',
      type: 'complete',
      size: '2.5 GB',
      date: '10/02/2024 03:00:00',
      status: 'completed',
      location: 'both'
    },
    {
      id: '2',
      name: 'Sauvegarde journalière',
      type: 'incremental',
      size: '450 MB',
      date: '10/02/2024 22:00:00',
      status: 'in_progress',
      location: 'cloud'
    },
    {
      id: '3',
      name: 'Export manuel - Audit',
      type: 'manual',
      size: '1.2 GB',
      date: '09/02/2024 14:30:00',
      status: 'completed',
      location: 'local'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon color="success" />
      case 'in_progress':
        return <SyncIcon color="info" sx={{ animation: 'spin 1s linear infinite' }} />
      case 'failed':
        return <ErrorIcon color="error" />
      default:
        return <InfoIcon />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé'
      case 'in_progress':
        return 'En cours'
      case 'failed':
        return 'Échec'
      default:
        return 'Inconnu'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'complete':
        return 'Complète'
      case 'incremental':
        return 'Incrémentale'
      case 'manual':
        return 'Manuelle'
      default:
        return 'Inconnue'
    }
  }

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'local':
        return <StorageIcon />
      case 'cloud':
        return <CloudIcon />
      case 'both':
        return <SyncIcon />
      default:
        return <StorageIcon />
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Sauvegardes & Restauration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gérez vos sauvegardes automatiques et manuelles
      </Typography>

      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Dernière sauvegarde
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                Il y a 2 heures
              </Typography>
              <Typography variant="caption">
                10/02/2024 22:00
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Espace utilisé
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                15.2 GB
              </Typography>
              <Typography variant="caption">
                Sur 100 GB
              </Typography>
              <LinearProgress
                variant="determinate"
                value={15.2}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Sauvegardes
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                24 actives
              </Typography>
              <Typography variant="caption">
                3 planifiées
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Prochaine
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                Dans 20h
              </Typography>
              <Typography variant="caption">
                11/02 22:00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions rapides */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<BackupIcon />}
          onClick={() => setCreateBackupDialog(true)}
        >
          Nouvelle sauvegarde
        </Button>
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={() => setRestoreDialog(true)}
        >
          Restaurer
        </Button>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
        >
          Historique
        </Button>
      </Stack>

      {/* Onglets de contenu */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Vue d'ensemble" />
            <Tab label="Sauvegardes" />
            <Tab label="Planification" />
            <Tab label="Restauration" />
            <Tab label="Paramètres" />
          </Tabs>
        </Box>

        {/* Vue d'ensemble */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* État de protection */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'success.main', backgroundColor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShieldIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      État de Protection
                    </Typography>
                  </Box>

                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Protection active
                    </Typography>
                    <Typography variant="body2">
                      Toutes les données sont sauvegardées
                    </Typography>
                  </Alert>

                  <Chip label="Optimal" color="success" sx={{ mb: 2 }} />

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Sauvegarde automatique</Typography>
                      <CheckIcon color="success" fontSize="small" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Chiffrement AES-256</Typography>
                      <CheckIcon color="success" fontSize="small" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Réplication cloud</Typography>
                      <CheckIcon color="success" fontSize="small" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Vérification intégrité</Typography>
                      <CheckIcon color="success" fontSize="small" />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Stockage */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StorageIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Stockage
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Local</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>8.5 GB / 50 GB</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={17} sx={{ height: 6, borderRadius: 3 }} />
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Cloud (AWS S3)</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>6.7 GB / 100 GB</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={6.7} color="secondary" sx={{ height: 6, borderRadius: 3 }} />
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Archives</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>12.3 GB</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Politique de rétention : 30 jours pour les sauvegardes quotidiennes
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Sauvegardes */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Dernières sauvegardes
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Taille</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Localisation</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {backup.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTypeLabel(backup.type)}
                        size="small"
                        color={backup.type === 'complete' ? 'primary' : backup.type === 'incremental' ? 'secondary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{backup.size}</TableCell>
                    <TableCell>{backup.date}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(backup.status)}
                        <Typography variant="body2">
                          {getStatusLabel(backup.status)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={backup.location === 'both' ? 'Local et Cloud' : backup.location === 'cloud' ? 'Cloud' : 'Local'}>
                        {getLocationIcon(backup.location)}
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <RestoreIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Planification */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Planification des sauvegardes
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Sauvegarde automatique
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoBackupEnabled}
                        onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                      />
                    }
                    label="Activer la sauvegarde automatique"
                  />

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fréquence : Quotidienne à 22:00
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type : Sauvegarde incrémentale
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rétention : 30 jours
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Synchronisation cloud
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={cloudSyncEnabled}
                        onChange={(e) => setCloudSyncEnabled(e.target.checked)}
                      />
                    }
                    label="Synchroniser avec le cloud"
                  />

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Provider : AWS S3
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chiffrement : AES-256
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dernière sync : Il y a 1h
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Restauration */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Restauration de données
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Sélectionnez une sauvegarde dans la liste ci-dessous pour restaurer vos données.
          </Alert>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Points de restauration disponibles
              </Typography>

              <List>
                {backups.filter(b => b.status === 'completed').map((backup) => (
                  <ListItem key={backup.id}>
                    <ListItemIcon>
                      {getLocationIcon(backup.location)}
                    </ListItemIcon>
                    <ListItemText
                      primary={backup.name}
                      secondary={`${backup.size} • ${backup.date}`}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RestoreIcon />}
                        onClick={() => setRestoreDialog(true)}
                      >
                        Restaurer
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Paramètres */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Paramètres de sauvegarde
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Sécurité
                  </Typography>

                  <Stack spacing={2}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Chiffrement des sauvegardes"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Vérification d'intégrité"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Compression des données"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Notifications
                  </Typography>

                  <Stack spacing={2}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Notifier en cas d'échec"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Rapport quotidien"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Alertes d'espace de stockage"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Dialog Nouvelle sauvegarde */}
      <Dialog open={createBackupDialog} onClose={() => setCreateBackupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une nouvelle sauvegarde</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Nom de la sauvegarde"
              defaultValue={`Sauvegarde manuelle - ${new Date().toLocaleDateString()}`}
            />

            <FormControl fullWidth>
              <InputLabel>Type de sauvegarde</InputLabel>
              <Select defaultValue="complete">
                <MenuItem value="complete">Sauvegarde complète</MenuItem>
                <MenuItem value="incremental">Sauvegarde incrémentale</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Destination</InputLabel>
              <Select defaultValue="both">
                <MenuItem value="local">Local uniquement</MenuItem>
                <MenuItem value="cloud">Cloud uniquement</MenuItem>
                <MenuItem value="both">Local et Cloud</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateBackupDialog(false)}>Annuler</Button>
          <Button variant="contained" startIcon={<BackupIcon />}>
            Démarrer la sauvegarde
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Restauration */}
      <Dialog open={restoreDialog} onClose={() => setRestoreDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Restaurer des données</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            La restauration remplacera les données actuelles. Cette action est irréversible.
          </Alert>

          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Point de restauration</InputLabel>
              <Select defaultValue="">
                {backups.filter(b => b.status === 'completed').map((backup) => (
                  <MenuItem key={backup.id} value={backup.id}>
                    {backup.name} - {backup.date}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch />}
              label="Créer une sauvegarde avant restauration"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialog(false)}>Annuler</Button>
          <Button variant="contained" color="warning" startIcon={<RestoreIcon />}>
            Restaurer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BackupRestoreSettings