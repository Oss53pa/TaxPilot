/**
 * DossiersPage.tsx — Client portfolio view for Cabinet mode.
 * Lists all dossiers with actions: open, duplicate, delete, create new.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const { dossiers, activeDossierId, addDossier, setActiveDossier, duplicateDossier, deleteDossier } = useDossierStore()
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

  const handleCreateDossier = () => {
    if (!form.nomClient.trim()) return
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
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={() => setNewOpen(true)}
          sx={{
            bgcolor: '#212121',
            '&:hover': { bgcolor: '#424242' },
            px: 4,
            py: 1.5,
          }}
        >
          Nouveau dossier
        </Button>

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
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewOpen(true)}
          sx={{
            bgcolor: '#212121',
            '&:hover': { bgcolor: '#424242' },
          }}
        >
          Nouveau dossier
        </Button>
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
                    borderLeft: isActive ? '4px solid #212121' : '4px solid transparent',
                    bgcolor: isActive ? '#fafafa' : 'transparent',
                    '&:hover': { bgcolor: '#f5f5f5' },
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
