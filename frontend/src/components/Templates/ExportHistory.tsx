/**
 * ExportHistory — Full export history table with filters, pagination, actions
 */

import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
} from '@mui/material'
import {
  GetApp as DownloadIcon,
  Visibility as PreviewIcon,
  Refresh as ReExportIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
  FilterList as FilterIcon,
  CloudDownload as BulkDownloadIcon,
} from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import {
  type ExportHistoryRecord,
  type ExportFormatId,
  EXPORT_FORMATS,
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from './exportTypes'

const REGIME_LABELS: Record<string, string> = {
  reel_normal: 'Systeme Normal',
  reel_simplifie: 'Systeme Minimal',
  forfaitaire: 'Forfaitaire',
  micro: 'Micro-Entreprise',
}

interface Props {
  onReExport?: (record: ExportHistoryRecord) => void
}

const ExportHistory: React.FC<Props> = ({ onReExport }) => {
  const theme = useTheme()
  const [records, setRecords] = useState<ExportHistoryRecord[]>(() =>
    loadFromStorage<ExportHistoryRecord[]>(STORAGE_KEYS.EXPORT_HISTORY, [])
  )

  // Filters
  const [filterFormat, setFilterFormat] = useState('')
  const [filterRegime, setFilterRegime] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Delete
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterFormat && r.format !== filterFormat) return false
      if (filterRegime && r.regime !== filterRegime) return false
      if (filterStatus && r.status !== filterStatus) return false
      if (filterSearch) {
        const q = filterSearch.toLowerCase()
        if (!r.company.toLowerCase().includes(q) && !r.fileName.toLowerCase().includes(q) && !r.profileName.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [records, filterFormat, filterRegime, filterStatus, filterSearch])

  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [filteredRecords, page, rowsPerPage])

  const handleDelete = useCallback((id: string) => {
    const updated = records.filter(r => r.id !== id)
    setRecords(updated)
    saveToStorage(STORAGE_KEYS.EXPORT_HISTORY, updated)
    setDeleteDialog(null)
  }, [records])

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'completed': return <Chip icon={<CheckIcon />} label="Termine" size="small" color="success" sx={{ height: 24 }} />
      case 'error': return <Chip icon={<ErrorIcon />} label="Erreur" size="small" color="error" sx={{ height: 24 }} />
      case 'cancelled': return <Chip icon={<CancelIcon />} label="Annule" size="small" variant="outlined" sx={{ height: 24 }} />
      default: return <Chip label={status} size="small" variant="outlined" sx={{ height: 24 }} />
    }
  }

  const getFormatChip = (format: ExportFormatId) => {
    const f = EXPORT_FORMATS.find(x => x.id === format)
    return (
      <Chip
        label={f?.label || format}
        size="small"
        sx={{
          height: 22,
          fontSize: '0.7rem',
          backgroundColor: alpha(f?.color || P.primary400, 0.1),
          color: f?.color || P.primary400,
          fontWeight: 600,
        }}
      />
    )
  }

  const activeFilters = [filterFormat, filterRegime, filterStatus, filterSearch].filter(Boolean).length

  return (
    <Box>
      {/* Toolbar */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          placeholder="Rechercher..."
          size="small"
          value={filterSearch}
          onChange={(e) => { setFilterSearch(e.target.value); setPage(0) }}
          sx={{ flex: 1, maxWidth: 300 }}
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={<FilterIcon />}
          onClick={() => setShowFilters(!showFilters)}
          color={activeFilters > 0 ? 'primary' : 'inherit'}
        >
          Filtres {activeFilters > 0 ? `(${activeFilters})` : ''}
        </Button>
        <Button variant="outlined" size="small" startIcon={<BulkDownloadIcon />} disabled={filteredRecords.filter(r => r.status === 'completed').length === 0}>
          Tout telecharger
        </Button>
        <Typography variant="caption" color="text.secondary">
          {filteredRecords.length} resultat{filteredRecords.length > 1 ? 's' : ''}
        </Typography>
      </Stack>

      {/* Filters row */}
      {showFilters && (
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Format</InputLabel>
            <Select value={filterFormat} label="Format" onChange={(e) => { setFilterFormat(e.target.value); setPage(0) }}>
              <MenuItem value="">Tous</MenuItem>
              {EXPORT_FORMATS.map(f => <MenuItem key={f.id} value={f.id}>{f.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Regime</InputLabel>
            <Select value={filterRegime} label="Regime" onChange={(e) => { setFilterRegime(e.target.value); setPage(0) }}>
              <MenuItem value="">Tous</MenuItem>
              {Object.entries(REGIME_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Statut</InputLabel>
            <Select value={filterStatus} label="Statut" onChange={(e) => { setFilterStatus(e.target.value); setPage(0) }}>
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="completed">Termine</MenuItem>
              <MenuItem value="error">Erreur</MenuItem>
              <MenuItem value="cancelled">Annule</MenuItem>
            </Select>
          </FormControl>
          {activeFilters > 0 && (
            <Button size="small" onClick={() => { setFilterFormat(''); setFilterRegime(''); setFilterStatus(''); setFilterSearch(''); setPage(0) }}>
              Reinitialiser
            </Button>
          )}
        </Stack>
      )}

      {/* Table */}
      <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: P.primary50 }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Regime</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Format</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Entreprise</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Exercice</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Pays</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Profil</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Taille</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucun export dans l'historique
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map(record => (
                  <TableRow key={record.id} hover sx={{ '&:hover': { backgroundColor: alpha(theme.palette.divider, 0.03) } }}>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {new Date(record.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{record.regimeLabel}</TableCell>
                    <TableCell>{getFormatChip(record.format)}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{record.company}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{record.fiscalYear}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{record.countryLabel}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{record.profileName}</TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{record.fileSize}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0} justifyContent="flex-end">
                        {record.status === 'completed' && (
                          <>
                            <Tooltip title="Telecharger">
                              <IconButton size="small"><DownloadIcon fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title="Apercu">
                              <IconButton size="small"><PreviewIcon fontSize="small" /></IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Re-exporter">
                          <IconButton size="small" onClick={() => onReExport?.(record)}>
                            <ReExportIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" onClick={() => setDeleteDialog(record.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredRecords.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Card>

      {/* Delete dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Supprimer cet enregistrement ?</DialogTitle>
        <DialogContent>
          <Typography>L'enregistrement sera supprime de l'historique. Le fichier exporte n'est pas affecte.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={() => deleteDialog && handleDelete(deleteDialog)}>Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ExportHistory
