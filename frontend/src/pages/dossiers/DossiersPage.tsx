/**
 * DossiersPage.tsx — Client portfolio view for Cabinet mode.
 * Lists all dossiers with actions: open, duplicate, delete, create new.
 */
import { useState } from 'react'
import { logger } from '@/utils/logger'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
} from '@mui/material'
import {
  Add,
  FolderOpen,
  ContentCopy,
  Delete,
  CheckCircle,
  HourglassEmpty,
  CloudDone,
} from '@mui/icons-material'
import { useDossierStore, type Dossier } from '@/store/dossierStore'
import { useTenantPlan } from '@/hooks/useTenantPlan'
import { useAuthStore } from '@/store/authStore'
import { upsertDossier } from '@/services/supabaseDataService'
// useModeStore available if needed for cabinet-specific features

const REGIME_LABELS: Record<Dossier['regime'], string> = {
  normal: 'Normal',
  simplifie: 'Simplifié',
  forfaitaire: 'Forfaitaire',
}

const STATUT_CONFIG: Record<Dossier['statut'], { label: string; color: 'info' | 'success' | 'secondary'; icon: React.ReactElement }> = {
  en_cours: { label: 'En cours', color: 'info', icon: <HourglassEmpty fontSize="small" /> },
  validee: { label: 'Validée', color: 'success', icon: <CheckCircle fontSize="small" /> },
  exportee: { label: 'Exportée', color: 'secondary', icon: <CloudDone fontSize="small" /> },
}

const INITIAL_FORM = {
  nomClient: '',
  rccm: '',
  ncc: '',
  exerciceN: new Date().getFullYear(),
  regime: 'normal' as Dossier['regime'],
}

export default function DossiersPage() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { dossiers, activeDossierId, addDossier, setActiveDossier, duplicateDossier, deleteDossier } = useDossierStore()
  const { plan, canCreateDossier } = useTenantPlan()
  // Source de vérité quota :
  //   - plan.max_companies (UI hint local — Cabinet illimité vs Entreprise 1)
  //   - canCreateDossier (RPC Supabase, source de vérité serveur via trigger DB)
  // On bloque si l'une OU l'autre dit non — défense en profondeur.
  const localLimitReached =
    plan.max_companies !== null && dossiers.length >= plan.max_companies
  const dossierLimitReached = localLimitReached || !canCreateDossier
  const upgradeTooltip = !canCreateDossier
    ? 'Quota de dossiers atteint — passez à un plan supérieur (Cabinet illimité)'
    : 'Passez en plan Cabinet pour gerer un portefeuille illimite'
  // New dossier dialog
  const [newOpen, setNewOpen] = useState(false)
  const [form, setForm] = useState({ ...INITIAL_FORM })

  // Duplicate dialog
  const [dupOpen, setDupOpen] = useState(false)
  const [dupTargetId, setDupTargetId] = useState<string | null>(null)
  const [dupYear, setDupYear] = useState(new Date().getFullYear())

  // Delete confirmation dialog
  const [delOpen, setDelOpen] = useState(false)
  const [delTargetId, setDelTargetId] = useState<string | null>(null)

  // --- Handlers ---

  const handleOpenDossier = (dossier: Dossier) => {
    setActiveDossier(dossier.id)
    navigate('/dashboard')
  }

  const handleCreateDossier = async () => {
    if (!form.nomClient.trim()) return

    // 1. Garde-fou côté client (UX rapide — évite un round-trip si on sait déjà)
    if (!canCreateDossier) {
      enqueueSnackbar(
        'Quota de dossiers atteint pour votre plan. Passez à un plan supérieur pour en créer davantage.',
        { variant: 'warning' }
      )
      return
    }

    // 2. Tentative d'insert côté Supabase (source de vérité serveur via trigger).
    //    Si Supabase indisponible ou user non auth, fallback Zustand local seul.
    let remoteOk = true
    if (user?.id) {
      try {
        await upsertDossier({
          user_id: user.id,
          nom_client: form.nomClient.trim(),
          rccm: form.rccm.trim() || undefined,
          ncc: form.ncc.trim() || undefined,
          exercice_n: form.exerciceN,
          exercice_n1: form.exerciceN - 1,
          regime: form.regime,
          statut: 'en_cours',
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        // Trigger BEFORE INSERT enforce_dossier_quota lève une exception avec
        // ce libellé. cf migration 014 plan_gating.
        if (msg.includes('dossiers_quota_exceeded')) {
          enqueueSnackbar(
            'Quota atteint — votre plan Liass’Pilot n’autorise pas un dossier supplémentaire. Passez à un plan supérieur.',
            { variant: 'error', autoHideDuration: 6000 }
          )
          // Rafraîchit la cache pour bloquer le bouton "Nouveau" cohéremment
          queryClient.invalidateQueries({ queryKey: ['can-create-dossier'] })
          return
        }
        // Autre erreur (réseau, RLS, etc.) — log + fallback local-only.
        // Le dossier sera créé localement et resyncé plus tard si possible.
        // eslint-disable-next-line no-console
        logger.warn('[DossiersPage] Supabase upsert failed, falling back to local-only:', err)
        remoteOk = false
        enqueueSnackbar(
          'Le dossier sera enregistré localement (synchronisation cloud indisponible).',
          { variant: 'info' }
        )
      }
    }

    // 3. Persistence locale Zustand (toujours, source de vérité du store React)
    const id = addDossier({
      nomClient: form.nomClient.trim(),
      rccm: form.rccm.trim(),
      ncc: form.ncc.trim(),
      exerciceN: form.exerciceN,
      exerciceN1: form.exerciceN - 1,
      regime: form.regime,
    })
    setActiveDossier(id)
    setForm({ ...INITIAL_FORM })
    setNewOpen(false)

    // 4. Invalide la cache canCreateDossier pour resync du compteur
    if (remoteOk) {
      queryClient.invalidateQueries({ queryKey: ['can-create-dossier'] })
    }
  }

  const handleDuplicate = () => {
    if (!dupTargetId) return
    duplicateDossier(dupTargetId, dupYear)
    setDupOpen(false)
    setDupTargetId(null)
  }

  const handleDelete = () => {
    if (!delTargetId) return
    deleteDossier(delTargetId)
    setDelOpen(false)
    setDelTargetId(null)
  }

  const openDupDialog = (id: string, currentYear: number) => {
    setDupTargetId(id)
    setDupYear(currentYear + 1)
    setDupOpen(true)
  }

  const openDelDialog = (id: string) => {
    setDelTargetId(id)
    setDelOpen(true)
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  // --- Empty state ---
  if (dossiers.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 3 }}>
        <FolderOpen sx={{ fontSize: 80, color: '#9e9e9e' }} />
        <Typography variant="h6" sx={{ color: '#616161' }}>
          Aucun dossier. Créez votre premier dossier client.
        </Typography>
        <Tooltip title={dossierLimitReached ? upgradeTooltip : ''}>
          <span>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => setNewOpen(true)}
              disabled={dossierLimitReached}
              sx={{
                bgcolor: '#212121',
                '&:hover': { bgcolor: '#424242' },
                px: 4,
                py: 1.5,
              }}
            >
              Nouveau dossier
            </Button>
          </span>
        </Tooltip>

        {/* New dossier dialog (shared) */}
        {renderNewDossierDialog()}
      </Box>
    )
  }

  // --- Main view ---
  function renderNewDossierDialog() {
    return (
      <Dialog open={newOpen} onClose={() => setNewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Nouveau dossier client</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Nom du client"
            value={form.nomClient}
            onChange={e => setForm(f => ({ ...f, nomClient: e.target.value }))}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="RCCM"
            value={form.rccm}
            onChange={e => setForm(f => ({ ...f, rccm: e.target.value }))}
            fullWidth
            size="small"
          />
          <TextField
            label="NCC"
            value={form.ncc}
            onChange={e => setForm(f => ({ ...f, ncc: e.target.value }))}
            fullWidth
            size="small"
          />
          <TextField
            label="Exercice N"
            type="number"
            value={form.exerciceN}
            onChange={e => setForm(f => ({ ...f, exerciceN: parseInt(e.target.value, 10) || new Date().getFullYear() }))}
            fullWidth
            size="small"
          />
          <TextField
            label="Régime"
            select
            value={form.regime}
            onChange={e => setForm(f => ({ ...f, regime: e.target.value as Dossier['regime'] }))}
            fullWidth
            size="small"
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="simplifie">Simplifié</MenuItem>
            <MenuItem value="forfaitaire">Forfaitaire</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNewOpen(false)} sx={{ color: '#616161' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateDossier}
            disabled={!form.nomClient.trim()}
            sx={{ bgcolor: '#212121', '&:hover': { bgcolor: '#424242' } }}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#212121' }}>
          Portefeuille Clients
        </Typography>
        <Tooltip title={dossierLimitReached ? upgradeTooltip : ''}>
          <span>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setNewOpen(true)}
              disabled={dossierLimitReached}
              sx={{
                bgcolor: '#212121',
                '&:hover': { bgcolor: '#424242' },
              }}
            >
              Nouveau dossier
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Nom client</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242' }}>RCCM</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Exercice</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Régime</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242' }}>Dernière modification</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dossiers.map(dossier => {
              const isActive = dossier.id === activeDossierId
              const statutCfg = STATUT_CONFIG[dossier.statut]

              return (
                <TableRow
                  key={dossier.id}
                  sx={{
                    // Dossier actif = bord vertical + tint teal Nordic Slate
                    borderLeft: isActive ? '4px solid #0f766e' : '4px solid transparent',
                    bgcolor: isActive ? 'rgba(15, 118, 110, 0.06)' : 'transparent',
                    transition: 'background-color 180ms cubic-bezier(0.4, 0, 0.2, 1), border-left-color 180ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { bgcolor: isActive ? 'rgba(15, 118, 110, 0.10)' : '#f5f5f4' },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: isActive ? 600 : 400 }}>
                      {dossier.nomClient}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#616161' }}>
                      {dossier.rccm || '\u2014'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {dossier.exerciceN}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#616161' }}>
                      {REGIME_LABELS[dossier.regime]}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={statutCfg.icon}
                      label={statutCfg.label}
                      color={statutCfg.color}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.8rem' }}>
                      {formatDate(dossier.dateDerniereModification)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Button
                        size="small"
                        startIcon={<FolderOpen />}
                        onClick={() => handleOpenDossier(dossier)}
                        sx={{ color: '#212121', textTransform: 'none', fontWeight: 500 }}
                      >
                        Ouvrir
                      </Button>
                      <Tooltip title="Dupliquer pour un nouvel exercice">
                        <IconButton
                          size="small"
                          onClick={() => openDupDialog(dossier.id, dossier.exerciceN)}
                          sx={{ color: '#757575' }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          onClick={() => openDelDialog(dossier.id)}
                          sx={{ color: '#bdbdbd', '&:hover': { color: '#d32f2f' } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New dossier dialog */}
      {renderNewDossierDialog()}

      {/* Duplicate dialog */}
      <Dialog open={dupOpen} onClose={() => setDupOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Dupliquer le dossier</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField
            label="Nouvel exercice N"
            type="number"
            value={dupYear}
            onChange={e => setDupYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDupOpen(false)} sx={{ color: '#616161' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleDuplicate}
            sx={{ bgcolor: '#212121', '&:hover': { bgcolor: '#424242' } }}
          >
            Dupliquer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={delOpen} onClose={() => setDelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#616161' }}>
            Cette action est irréversible. Le dossier et toutes ses données de balance seront supprimés.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDelOpen(false)} sx={{ color: '#616161' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
