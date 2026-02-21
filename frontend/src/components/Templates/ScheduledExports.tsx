/**
 * ScheduledExports — Exports programmes avec frequence, statut, activation
 */

import React, { useState, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Divider,
  FormControlLabel,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material'
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as ActiveIcon,
  Pause as PausedIcon,
  Error as ErrorIcon,
  Notifications as NotifyIcon,
} from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import {
  type ScheduledExport,
  type ExportFormatId,
  type ExportProfile,
  EXPORT_FORMATS,
  loadFromStorage,
  saveToStorage,
  generateId,
  STORAGE_KEYS,
} from './exportTypes'

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' },
  { value: 'custom', label: 'Personnalise' },
]

const REGIME_OPTIONS = [
  { value: 'reel_normal', label: 'Systeme Normal (SN)' },
  { value: 'reel_simplifie', label: 'Systeme Minimal (SMT)' },
  { value: 'forfaitaire', label: 'Forfaitaire' },
  { value: 'micro', label: 'Micro-Entreprise' },
]

interface Props {
  profiles: ExportProfile[]
}

const ScheduledExports: React.FC<Props> = ({ profiles }) => {
  const theme = useTheme()
  const [schedules, setSchedules] = useState<ScheduledExport[]>(() =>
    loadFromStorage<ScheduledExport[]>(STORAGE_KEYS.SCHEDULED_EXPORTS, [])
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ScheduledExport | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    name: '',
    regime: 'reel_normal',
    format: 'pdf' as ExportFormatId,
    profileId: '',
    frequency: 'monthly' as ScheduledExport['frequency'],
    customCron: '',
    notifyOnComplete: true,
    notifyEmail: '',
  })

  const persist = useCallback((updated: ScheduledExport[]) => {
    setSchedules(updated)
    saveToStorage(STORAGE_KEYS.SCHEDULED_EXPORTS, updated)
  }, [])

  const handleOpenCreate = () => {
    setEditing(null)
    setForm({
      name: '',
      regime: 'reel_normal',
      format: 'pdf',
      profileId: '',
      frequency: 'monthly',
      customCron: '',
      notifyOnComplete: true,
      notifyEmail: '',
    })
    setDialogOpen(true)
  }

  const handleOpenEdit = (schedule: ScheduledExport) => {
    setEditing(schedule)
    setForm({
      name: schedule.name,
      regime: schedule.regime,
      format: schedule.format,
      profileId: schedule.profileId,
      frequency: schedule.frequency,
      customCron: schedule.customCron || '',
      notifyOnComplete: schedule.notifyOnComplete,
      notifyEmail: schedule.notifyEmail,
    })
    setDialogOpen(true)
  }

  const getNextRun = (frequency: string): string => {
    const now = new Date()
    switch (frequency) {
      case 'daily': now.setDate(now.getDate() + 1); break
      case 'weekly': now.setDate(now.getDate() + 7); break
      case 'monthly': now.setMonth(now.getMonth() + 1); break
      default: now.setMonth(now.getMonth() + 1); break
    }
    return now.toISOString()
  }

  const handleSave = useCallback(() => {
    if (!form.name.trim()) return
    if (editing) {
      persist(schedules.map(s => s.id === editing.id ? {
        ...s,
        ...form,
        profileName: profiles.find(p => p.id === form.profileId)?.name || 'Defaut',
        nextRun: getNextRun(form.frequency),
      } : s))
    } else {
      const newSchedule: ScheduledExport = {
        id: generateId(),
        ...form,
        profileName: profiles.find(p => p.id === form.profileId)?.name || 'Defaut',
        enabled: true,
        createdAt: new Date().toISOString(),
        nextRun: getNextRun(form.frequency),
        status: 'active',
      }
      persist([...schedules, newSchedule])
    }
    setDialogOpen(false)
  }, [form, editing, schedules, profiles, persist])

  const handleToggle = useCallback((id: string) => {
    persist(schedules.map(s => s.id === id ? {
      ...s,
      enabled: !s.enabled,
      status: !s.enabled ? 'active' as const : 'paused' as const,
    } : s))
  }, [schedules, persist])

  const handleDelete = useCallback((id: string) => {
    persist(schedules.filter(s => s.id !== id))
    setDeleteDialog(null)
  }, [schedules, persist])

  const getStatusChip = (schedule: ScheduledExport) => {
    if (!schedule.enabled) {
      return <Chip icon={<PausedIcon />} label="En pause" size="small" variant="outlined" sx={{ height: 24 }} />
    }
    switch (schedule.status) {
      case 'active':
        return <Chip icon={<ActiveIcon />} label="Actif" size="small" color="success" sx={{ height: 24 }} />
      case 'error':
        return <Chip icon={<ErrorIcon />} label="Erreur" size="small" color="error" sx={{ height: 24 }} />
      default:
        return <Chip icon={<PausedIcon />} label="En pause" size="small" variant="outlined" sx={{ height: 24 }} />
    }
  }

  return (
    <Box>
      {schedules.length === 0 ? (
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ScheduleIcon sx={{ fontSize: 48, color: P.primary300, mb: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Aucun export programme
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Programmez des exports automatiques pour ne jamais oublier vos echeances.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
              sx={{ backgroundColor: P.primary900, '&:hover': { backgroundColor: P.primary800 } }}>
              Programmer un export
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {schedules.length} export{schedules.length > 1 ? 's' : ''} programme{schedules.length > 1 ? 's' : ''}
            </Typography>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenCreate}
              sx={{ backgroundColor: P.primary900, '&:hover': { backgroundColor: P.primary800 } }}>
              Programmer un export
            </Button>
          </Stack>

          <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
            {schedules.map((schedule, index) => {
              const formatInfo = EXPORT_FORMATS.find(f => f.id === schedule.format)
              return (
                <React.Fragment key={schedule.id}>
                  <ListItem sx={{ py: 2 }}>
                    <Avatar sx={{ mr: 2, backgroundColor: alpha(formatInfo?.color || P.primary900, 0.1), color: formatInfo?.color || P.primary900 }}>
                      <ScheduleIcon />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{schedule.name}</Typography>
                          {getStatusChip(schedule)}
                          <Chip label={formatInfo?.label || schedule.format} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                          <Chip label={FREQUENCY_OPTIONS.find(f => f.value === schedule.frequency)?.label || schedule.frequency}
                            size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Stack>
                      }
                      secondary={
                        <Stack direction="row" spacing={2}>
                          <Typography variant="caption" color="text.secondary">
                            Profil : {schedule.profileName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Prochaine execution : {new Date(schedule.nextRun).toLocaleDateString('fr-FR')}
                          </Typography>
                          {schedule.lastRun && (
                            <Typography variant="caption" color="text.secondary">
                              Derniere : {new Date(schedule.lastRun).toLocaleDateString('fr-FR')}
                            </Typography>
                          )}
                          {schedule.notifyOnComplete && (
                            <Chip icon={<NotifyIcon />} label="Notification" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
                          )}
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title={schedule.enabled ? 'Desactiver' : 'Activer'}>
                          <Switch size="small" checked={schedule.enabled} onChange={() => handleToggle(schedule.id)} />
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => handleOpenEdit(schedule)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" onClick={() => setDeleteDialog(schedule.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < schedules.length - 1 && <Divider />}
                </React.Fragment>
              )
            })}
          </List>
        </>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Modifier l\'export programme' : 'Programmer un export'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Nom de l'export programme"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Liasse SN mensuelle"
            />
            <FormControl fullWidth>
              <InputLabel>Regime fiscal</InputLabel>
              <Select value={form.regime} label="Regime fiscal" onChange={(e) => setForm(prev => ({ ...prev, regime: e.target.value }))}>
                {REGIME_OPTIONS.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Format de sortie</InputLabel>
              <Select value={form.format} label="Format de sortie" onChange={(e) => setForm(prev => ({ ...prev, format: e.target.value as ExportFormatId }))}>
                {EXPORT_FORMATS.map(f => <MenuItem key={f.id} value={f.id}>{f.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Profil d'export</InputLabel>
              <Select value={form.profileId} label="Profil d'export" onChange={(e) => setForm(prev => ({ ...prev, profileId: e.target.value }))}>
                <MenuItem value="">Defaut (aucun profil)</MenuItem>
                {profiles.filter(p => p.status === 'active').map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Frequence</InputLabel>
              <Select value={form.frequency} label="Frequence" onChange={(e) => setForm(prev => ({ ...prev, frequency: e.target.value as ScheduledExport['frequency'] }))}>
                {FREQUENCY_OPTIONS.map(f => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
              </Select>
            </FormControl>
            {form.frequency === 'custom' && (
              <TextField
                fullWidth
                label="Expression CRON"
                value={form.customCron}
                onChange={(e) => setForm(prev => ({ ...prev, customCron: e.target.value }))}
                placeholder="Ex: 0 8 1 * *"
                helperText="Format : minute heure jour mois jour-semaine"
              />
            )}
            <Divider />
            <FormControlLabel
              control={<Switch checked={form.notifyOnComplete} onChange={(e) => setForm(prev => ({ ...prev, notifyOnComplete: e.target.checked }))} />}
              label="Notifier quand l'export est pret"
            />
            {form.notifyOnComplete && (
              <TextField
                fullWidth
                label="Email de notification"
                type="email"
                value={form.notifyEmail}
                onChange={(e) => setForm(prev => ({ ...prev, notifyEmail: e.target.value }))}
                placeholder="email@exemple.com"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name.trim()}
            sx={{ backgroundColor: P.primary900, '&:hover': { backgroundColor: P.primary800 } }}>
            {editing ? 'Enregistrer' : 'Programmer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Supprimer l'export programme ?</DialogTitle>
        <DialogContent>
          <Typography>Cette action supprimera definitivement cet export programme.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={() => deleteDialog && handleDelete(deleteDialog)}>Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ScheduledExports
