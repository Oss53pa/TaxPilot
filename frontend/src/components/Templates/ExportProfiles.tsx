/**
 * ExportProfiles — Gestion des profils d'export
 * List, create, edit, delete, duplicate, archive, share, version history
 */

import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  TextField,
  Alert,
  Tooltip,
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
  Menu,
  MenuItem,
  alpha,
  useTheme,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Share as ShareIcon,
  History as HistoryIcon,
  MoreVert as MoreIcon,
  GetApp as DownloadIcon,
  Upload as UploadIcon,
  Description as DocIcon,
  CheckCircle as ActiveIcon,
} from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import {
  type ExportProfile,
  OHADA_COUNTRIES,
  EXPORT_FORMATS,
  loadFromStorage,
  saveToStorage,
  generateId,
  createDefaultProfile,
  getCountryFromConfig,
  STORAGE_KEYS,
} from './exportTypes'

interface Props {
  onEditProfile?: (profile: ExportProfile) => void
}

const ExportProfiles: React.FC<Props> = ({ onEditProfile }) => {
  const theme = useTheme()
  const [profiles, setProfiles] = useState<ExportProfile[]>(() =>
    loadFromStorage<ExportProfile[]>(STORAGE_KEYS.EXPORT_PROFILES, [])
  )
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; profileId: string } | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [historyDialog, setHistoryDialog] = useState<ExportProfile | null>(null)
  const [shareDialog, setShareDialog] = useState<ExportProfile | null>(null)

  const persist = useCallback((updated: ExportProfile[]) => {
    setProfiles(updated)
    saveToStorage(STORAGE_KEYS.EXPORT_PROFILES, updated)
  }, [])

  const filteredProfiles = useMemo(() => {
    return profiles
      .filter(p => showArchived ? p.status === 'archived' : p.status === 'active')
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  }, [profiles, search, showArchived])

  const handleCreate = useCallback(() => {
    const country = getCountryFromConfig()
    const newProfile = { ...createDefaultProfile(country.code), name: `Nouveau profil ${profiles.length + 1}` }
    persist([...profiles, newProfile])
    onEditProfile?.(newProfile)
  }, [profiles, persist, onEditProfile])

  const handleDuplicate = useCallback((id: string) => {
    const source = profiles.find(p => p.id === id)
    if (!source) return
    const dup: ExportProfile = {
      ...source,
      id: generateId(),
      name: `${source.name} (copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      versions: [],
    }
    persist([...profiles, dup])
    setMenuAnchor(null)
  }, [profiles, persist])

  const handleArchive = useCallback((id: string) => {
    persist(profiles.map(p => p.id === id ? { ...p, status: p.status === 'archived' ? 'active' as const : 'archived' as const, updatedAt: new Date().toISOString() } : p))
    setMenuAnchor(null)
  }, [profiles, persist])

  const handleDelete = useCallback((id: string) => {
    persist(profiles.filter(p => p.id !== id))
    setDeleteDialog(null)
    setMenuAnchor(null)
  }, [profiles, persist])

  const handleExportDefinition = useCallback((profile: ExportProfile) => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profil-export-${profile.name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMenuAnchor(null)
  }, [])

  const handleImportDefinition = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string) as ExportProfile
        imported.id = generateId()
        imported.createdAt = new Date().toISOString()
        imported.updatedAt = new Date().toISOString()
        persist([...profiles, imported])
      } catch { /* ignore invalid */ }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [profiles, persist])

  const getCountryLabel = (code: string) => {
    const c = OHADA_COUNTRIES.find(c => c.code === code)
    return c ? `${c.flag} ${c.name}` : code
  }

  return (
    <Box>
      {/* Toolbar */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <TextField
          placeholder="Rechercher un profil..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, maxWidth: 400 }}
        />
        <Chip
          label={showArchived ? 'Archives' : 'Actifs'}
          variant={showArchived ? 'filled' : 'outlined'}
          color={showArchived ? 'default' : 'primary'}
          onClick={() => setShowArchived(!showArchived)}
        />
        <Button variant="outlined" size="small" startIcon={<UploadIcon />} component="label">
          Importer
          <input type="file" hidden accept=".json" onChange={handleImportDefinition} />
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}
          sx={{ backgroundColor: P.primary900, '&:hover': { backgroundColor: P.primary800 } }}>
          Nouveau profil
        </Button>
      </Stack>

      {/* Profile list */}
      {filteredProfiles.length === 0 ? (
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <DocIcon sx={{ fontSize: 48, color: P.primary300, mb: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {showArchived ? 'Aucun profil archive' : 'Aucun profil d\'export'}
            </Typography>
            {!showArchived && (
              <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleCreate}>
                Creer votre premier profil
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
          {filteredProfiles.map((profile, index) => {
            const formatInfo = EXPORT_FORMATS.find(f => f.id === profile.format)
            return (
              <React.Fragment key={profile.id}>
                <ListItem sx={{ py: 2 }}>
                  <Avatar
                    sx={{
                      mr: 2,
                      width: 44,
                      height: 44,
                      backgroundColor: alpha(formatInfo?.color || P.primary900, 0.1),
                      color: formatInfo?.color || P.primary900,
                    }}
                  >
                    <DocIcon />
                  </Avatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{profile.name}</Typography>
                        <Chip
                          label={profile.status === 'active' ? 'Actif' : 'Archive'}
                          size="small"
                          icon={profile.status === 'active' ? <ActiveIcon /> : <ArchiveIcon />}
                          sx={{ height: 22, fontSize: '0.7rem',
                            backgroundColor: alpha(profile.status === 'active' ? theme.palette.success.main : P.primary400, 0.1),
                            color: profile.status === 'active' ? theme.palette.success.main : P.primary400,
                          }}
                        />
                        <Chip label={formatInfo?.label || profile.format} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        <Chip label={`v${profile.version}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                      </Stack>
                    }
                    secondary={
                      <Box>
                        {profile.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{profile.description}</Typography>
                        )}
                        <Stack direction="row" spacing={2}>
                          <Typography variant="caption" color="text.secondary">
                            {getCountryLabel(profile.country)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Modifie le {new Date(profile.updatedAt).toLocaleDateString('fr-FR')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {profile.excludedPages.length > 0 ? `${profile.excludedPages.length} pages exclues` : 'Toutes les pages'}
                          </Typography>
                        </Stack>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Editer">
                        <IconButton size="small" onClick={() => onEditProfile?.(profile)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Dupliquer">
                        <IconButton size="small" onClick={() => handleDuplicate(profile.id)}>
                          <DuplicateIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" onClick={(e) => setMenuAnchor({ el: e.currentTarget, profileId: profile.id })}>
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredProfiles.length - 1 && <Divider />}
              </React.Fragment>
            )
          })}
        </List>
      )}

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          const p = profiles.find(x => x.id === menuAnchor?.profileId)
          if (p) handleArchive(p.id)
        }}>
          {profiles.find(x => x.id === menuAnchor?.profileId)?.status === 'archived'
            ? <><UnarchiveIcon fontSize="small" sx={{ mr: 1 }} /> Restaurer</>
            : <><ArchiveIcon fontSize="small" sx={{ mr: 1 }} /> Archiver</>}
        </MenuItem>
        <MenuItem onClick={() => {
          const p = profiles.find(x => x.id === menuAnchor?.profileId)
          if (p) { setShareDialog(p); setMenuAnchor(null) }
        }}>
          <ShareIcon fontSize="small" sx={{ mr: 1 }} /> Partager
        </MenuItem>
        <MenuItem onClick={() => {
          const p = profiles.find(x => x.id === menuAnchor?.profileId)
          if (p) { setHistoryDialog(p); setMenuAnchor(null) }
        }}>
          <HistoryIcon fontSize="small" sx={{ mr: 1 }} /> Historique des versions
        </MenuItem>
        <MenuItem onClick={() => {
          const p = profiles.find(x => x.id === menuAnchor?.profileId)
          if (p) handleExportDefinition(p)
        }}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Exporter la definition
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setDeleteDialog(menuAnchor?.profileId || null); setMenuAnchor(null) }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Supprimer
        </MenuItem>
      </Menu>

      {/* Delete confirmation */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Supprimer le profil ?</DialogTitle>
        <DialogContent>
          <Typography>Cette action est irreversible. Le profil sera definitivement supprime.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={() => deleteDialog && handleDelete(deleteDialog)}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version history dialog */}
      <Dialog open={!!historyDialog} onClose={() => setHistoryDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Historique des versions — {historyDialog?.name}</DialogTitle>
        <DialogContent>
          {historyDialog?.versions && historyDialog.versions.length > 0 ? (
            <List>
              {historyDialog.versions.map((v, i) => (
                <ListItem key={i}>
                  <ListItemText
                    primary={`Version ${v.version} — ${new Date(v.date).toLocaleDateString('fr-FR')}`}
                    secondary={v.changes}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">Aucun historique de versions disponible pour ce profil.</Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Version actuelle : v{historyDialog?.version} — Derniere modification : {historyDialog?.updatedAt ? new Date(historyDialog.updatedAt).toLocaleDateString('fr-FR') : '-'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Share dialog */}
      <Dialog open={!!shareDialog} onClose={() => setShareDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Partager le profil — {shareDialog?.name}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Exportez la definition du profil en fichier JSON pour la partager avec vos collegues.
          </Alert>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => shareDialog && handleExportDefinition(shareDialog)}
              fullWidth
            >
              Telecharger le fichier de definition (.json)
            </Button>
            <Typography variant="caption" color="text.secondary">
              Le destinataire pourra importer ce fichier via le bouton "Importer" de la page Profils d'export.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ExportProfiles
