/**
 * ApiKeysPage.tsx — Manage REST API keys for external ERP integrations.
 *
 * Security notes:
 * - The plain API key is shown to the user ONCE immediately after creation,
 *   then never again. Only the SHA-256 hash is stored server-side.
 * - Users can revoke (soft-disable) or permanently delete a key.
 */
import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
} from '@mui/material'
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Block as RevokeIcon,
  Delete as DeleteIcon,
  VpnKey as KeyIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import {
  ApiKey,
  createApiKey,
  deleteApiKey,
  listApiKeys,
  revokeApiKey,
} from '@/services/apiKeysService'
import { supabase } from '@/lib/supabase'

interface DossierOption {
  id: string
  nom: string
}

const ApiKeysPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [dossiers, setDossiers] = useState<DossierOption[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDossierId, setNewDossierId] = useState<string>('')
  const [newExpiresAt, setNewExpiresAt] = useState<string>('')
  const [creating, setCreating] = useState(false)

  // Reveal modal state (shown ONCE after key creation)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)

  const loadKeys = async () => {
    try {
      setLoading(true)
      const data = await listApiKeys()
      setKeys(data)
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Erreur de chargement', {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDossiers = async () => {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from('dossiers')
        .select('id, nom_client, raison_sociale')
        .order('created_at', { ascending: false })
      if (error) throw error
      setDossiers(
        (data || []).map((d: Record<string, unknown>) => ({
          id: d.id as string,
          nom:
            (d.nom_client as string) ||
            (d.raison_sociale as string) ||
            'Dossier sans nom',
        }))
      )
    } catch {
      // Dossiers table may not be populated yet or column names may differ; degrade gracefully
      setDossiers([])
    }
  }

  useEffect(() => {
    loadKeys()
    loadDossiers()
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) {
      enqueueSnackbar('Veuillez renseigner un nom pour la cle', { variant: 'warning' })
      return
    }
    try {
      setCreating(true)
      const { key } = await createApiKey({
        name: newName.trim(),
        dossierId: newDossierId || null,
        expiresAt: newExpiresAt || null,
      })
      setRevealedKey(key)
      setCreateOpen(false)
      setNewName('')
      setNewDossierId('')
      setNewExpiresAt('')
      await loadKeys()
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Erreur de creation', {
        variant: 'error',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoquer cette cle API ? Elle ne pourra plus etre utilisee.')) return
    try {
      await revokeApiKey(id)
      enqueueSnackbar('Cle revoquee', { variant: 'success' })
      await loadKeys()
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Erreur', { variant: 'error' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer definitivement cette cle ? Cette action est irreversible.')) return
    try {
      await deleteApiKey(id)
      enqueueSnackbar('Cle supprimee', { variant: 'success' })
      await loadKeys()
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'Erreur', { variant: 'error' })
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      enqueueSnackbar('Copie dans le presse-papier', { variant: 'success' })
    } catch {
      enqueueSnackbar('Impossible de copier', { variant: 'error' })
    }
  }

  const dossierNameFor = (id: string | null): string => {
    if (!id) return 'Tous les dossiers'
    const d = dossiers.find(x => x.id === id)
    return d ? d.nom : id.substring(0, 8) + '...'
  }

  return (
    <Box sx={{ p: 3, width: '100%', minHeight: '100vh' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            <KeyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Cles API
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generez des cles pour permettre a vos logiciels comptables (SAGE,
            CEGID, Odoo...) d'envoyer automatiquement les balances dans FiscaSync.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Nouvelle cle
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Documentation</AlertTitle>
        Consultez la{' '}
        <a href="/api-docs" target="_blank" rel="noopener noreferrer">
          documentation de l'API d'import de balance
        </a>{' '}
        pour integrer votre logiciel comptable.
      </Alert>

      <Paper>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : keys.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Aucune cle API creee pour le moment.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Prefixe</TableCell>
                  <TableCell>Dossier</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Derniere utilisation</TableCell>
                  <TableCell>Expire le</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id} hover>
                    <TableCell>{k.name}</TableCell>
                    <TableCell>
                      <code>{k.keyPrefix}</code>
                    </TableCell>
                    <TableCell>{dossierNameFor(k.dossierId)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {k.scopes.map((s) => (
                          <Chip key={s} label={s} size="small" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {k.lastUsedAt
                        ? new Date(k.lastUsedAt).toLocaleString('fr-FR')
                        : 'Jamais'}
                    </TableCell>
                    <TableCell>
                      {k.expiresAt
                        ? new Date(k.expiresAt).toLocaleDateString('fr-FR')
                        : 'Pas d\'expiration'}
                    </TableCell>
                    <TableCell>
                      {k.isActive ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : (
                        <Chip label="Revoquee" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {k.isActive && (
                        <Tooltip title="Revoquer">
                          <IconButton
                            size="small"
                            onClick={() => handleRevoke(k.id)}
                          >
                            <RevokeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(k.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle cle API</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nom de la cle"
              placeholder="Ex: SAGE Production"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
              autoFocus
              helperText="Un nom descriptif pour identifier cette cle"
            />
            <FormControl fullWidth>
              <InputLabel>Dossier (optionnel)</InputLabel>
              <Select
                value={newDossierId}
                label="Dossier (optionnel)"
                onChange={(e) => setNewDossierId(e.target.value as string)}
              >
                <MenuItem value="">
                  <em>Tous les dossiers (l'ERP devra preciser dossier_id)</em>
                </MenuItem>
                {dossiers.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Date d'expiration (optionnelle)"
              type="date"
              value={newExpiresAt}
              onChange={(e) => setNewExpiresAt(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Alert severity="warning" icon={<WarningIcon />}>
              La cle generee ne sera affichee qu'une seule fois. Conservez-la en
              lieu sur, elle ne pourra plus etre recuperee.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
          >
            {creating ? <CircularProgress size={18} /> : 'Generer la cle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reveal dialog — shown ONCE */}
      <Dialog
        open={!!revealedKey}
        onClose={() => setRevealedKey(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />
          Votre nouvelle cle API
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Copiez cette cle maintenant !</AlertTitle>
            Elle ne sera <strong>jamais reaffichee</strong>. Si vous la perdez,
            vous devrez en creer une nouvelle.
          </Alert>
          <Paper
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box sx={{ flex: 1 }}>{revealedKey}</Box>
            <IconButton
              onClick={() => revealedKey && copyToClipboard(revealedKey)}
              size="small"
            >
              <CopyIcon />
            </IconButton>
          </Paper>
          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
            Utilisez cette cle dans l'en-tete{' '}
            <code>Authorization: Bearer {revealedKey?.substring(0, 16)}...</code>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => revealedKey && copyToClipboard(revealedKey)}>
            Copier
          </Button>
          <Button
            variant="contained"
            onClick={() => setRevealedKey(null)}
          >
            J'ai sauvegarde la cle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ApiKeysPage
