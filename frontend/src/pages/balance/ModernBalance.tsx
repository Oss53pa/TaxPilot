/**
 * Module Balance - Liasse Fiscale SYSCOHADA
 * Colonnes: N° Compte | Intitulé | Débit | Crédit | Solde Débiteur | Solde Créditeur
 *           | Débit N-1 | Crédit N-1 | Solde Débiteur N-1 | Solde Créditeur N-1
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Skeleton,
  useTheme,
  alpha,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material'
import {
  Search as SearchIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
  CheckCircle as ValidatedIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { StatCard } from '@/components/shared/StatCard'
import { getLatestBalance } from '@/services/balanceStorageService'

interface DisplayEntry {
  id: string
  compte: string
  intitule: string
  classe: string
  soldeDebitN1: number
  soldeCreditN1: number
  mouvementDebit: number
  mouvementCredit: number
  soldeDebit: number
  soldeCredit: number
}

const ModernBalance: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<DisplayEntry[]>([])
  const [filteredData, setFilteredData] = useState<DisplayEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [selectedEntry, setSelectedEntry] = useState<DisplayEntry | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  useEffect(() => {
    loadBalanceData()

    // Reload on exercise switch, balance import, or page focus
    const handler = () => loadBalanceData()
    window.addEventListener('fiscasync:exercice-changed', handler)
    window.addEventListener('fiscasync:balance-imported', handler)
    window.addEventListener('focus', handler)
    return () => {
      window.removeEventListener('fiscasync:exercice-changed', handler)
      window.removeEventListener('fiscasync:balance-imported', handler)
      window.removeEventListener('focus', handler)
    }
  }, [])

  const loadBalanceData = () => {
    try {
      setLoading(true)

      const stored = getLatestBalance()

      if (!stored?.entries?.length) {
        setEntries([])
        setFilteredData([])
        return
      }

      const data: DisplayEntry[] = stored.entries.map((entry, idx) => ({
        id: String(idx + 1),
        compte: entry.compte,
        intitule: entry.intitule,
        classe: entry.compte.charAt(0),
        soldeDebitN1: entry.solde_debit_n1 ?? 0,
        soldeCreditN1: entry.solde_credit_n1 ?? 0,
        mouvementDebit: entry.debit || 0,
        mouvementCredit: entry.credit || 0,
        soldeDebit: entry.solde_debit || 0,
        soldeCredit: entry.solde_credit || 0,
      }))

      setEntries(data)
      setFilteredData(data)
    } catch {
      setEntries([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const totalSD = entries.reduce((s, e) => s + e.soldeDebit, 0)
    const totalSC = entries.reduce((s, e) => s + e.soldeCredit, 0)
    const ecart = Math.abs(totalSD - totalSC)
    return { totalSD, totalSC, ecart, balanced: ecart < 1 }
  }, [entries])

  useEffect(() => {
    let filtered = entries
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(e =>
        e.compte.toLowerCase().includes(term) || e.intitule.toLowerCase().includes(term)
      )
    }
    if (selectedClass !== 'all') {
      filtered = filtered.filter(e => e.classe === selectedClass)
    }
    setFilteredData(filtered)
    setPage(0)
  }, [entries, searchTerm, selectedClass])

  const fmt = (amount: number) => {
    if (amount === 0) return '-'
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount))
  }

  const totals = useMemo(() => ({
    soldeDebitN1: filteredData.reduce((s, e) => s + e.soldeDebitN1, 0),
    soldeCreditN1: filteredData.reduce((s, e) => s + e.soldeCreditN1, 0),
    mouvementDebit: filteredData.reduce((s, e) => s + e.mouvementDebit, 0),
    mouvementCredit: filteredData.reduce((s, e) => s + e.mouvementCredit, 0),
    soldeDebit: filteredData.reduce((s, e) => s + e.soldeDebit, 0),
    soldeCredit: filteredData.reduce((s, e) => s + e.soldeCredit, 0),
  }), [filteredData])

  const hdr = { fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' as const }
  const nBg = alpha(theme.palette.primary.main, 0.04)
  const n1Bg = alpha(theme.palette.grey[500], 0.04)
  const mono = { fontFamily: 'monospace' }

  return (
    <>
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Balance comptable
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Balance générale SYSCOHADA — Exercice N / N-1
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadBalanceData}>
            Actualiser
          </Button>
          <Button variant="outlined" startIcon={<ExportIcon />}>
            Exporter
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            Importer balance
          </Button>
        </Stack>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Comptes"
            value={entries.length}
            color={theme.palette.primary.main}
            icon={<BalanceIcon />}
            subtitle={`${new Set(entries.map(e => e.classe)).size} classes`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Solde Débit N"
            value={fmt(stats.totalSD)}
            color={theme.palette.info.main}
            icon={<TrendingUpIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Solde Crédit N"
            value={fmt(stats.totalSC)}
            color={theme.palette.warning.main}
            icon={<TrendingDownIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Écart Soldes"
            value={fmt(stats.ecart)}
            color={stats.balanced ? theme.palette.success.main : theme.palette.error.main}
            icon={stats.balanced ? <ValidatedIcon /> : <WarningIcon />}
            subtitle={stats.balanced ? 'Balance équilibrée' : 'Déséquilibre !'}
          />
        </Grid>
      </Grid>

      {/* Alerte */}
      {entries.length > 0 && (
        stats.balanced ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Balance équilibrée — Solde Débiteur = Solde Créditeur ({fmt(stats.totalSD)})
            </Typography>
          </Alert>
        ) : (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Déséquilibre : écart de {fmt(stats.ecart)} FCFA
            </Typography>
          </Alert>
        )
      )}

      {entries.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Aucune balance importée. Importez un fichier Excel contenant votre balance pour commencer.
        </Alert>
      )}

      {/* Table */}
      <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <CardContent sx={{ p: 0 }}>
          {/* Filtres */}
          <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Rechercher un compte ou libellé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Classe</InputLabel>
                  <Select value={selectedClass} label="Classe" onChange={(e) => setSelectedClass(e.target.value)}>
                    <MenuItem value="all">Toutes les classes</MenuItem>
                    <MenuItem value="1">1 - Capitaux</MenuItem>
                    <MenuItem value="2">2 - Immobilisations</MenuItem>
                    <MenuItem value="3">3 - Stocks</MenuItem>
                    <MenuItem value="4">4 - Tiers</MenuItem>
                    <MenuItem value="5">5 - Trésorerie</MenuItem>
                    <MenuItem value="6">6 - Charges</MenuItem>
                    <MenuItem value="7">7 - Produits</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Chip label={`${filteredData.length} comptes`} variant="outlined" color="primary" />
              </Grid>
            </Grid>
          </Box>

          {/* Tableau */}
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                {/* Ligne groupement */}
                <TableRow>
                  <TableCell rowSpan={2} sx={{ ...hdr, minWidth: 90 }}>Compte</TableCell>
                  <TableCell rowSpan={2} sx={{ ...hdr, minWidth: 200 }}>Description</TableCell>
                  <TableCell colSpan={2} align="center" sx={{
                    ...hdr,
                    backgroundColor: alpha(theme.palette.grey[500], 0.08),
                    borderBottom: `2px solid ${theme.palette.grey[500]}`,
                  }}>
                    Exercice N-1
                  </TableCell>
                  <TableCell colSpan={2} align="center" sx={{
                    ...hdr,
                    backgroundColor: alpha(theme.palette.info.main, 0.08),
                    borderBottom: `2px solid ${theme.palette.info.main}`,
                  }}>
                    Mouvements N
                  </TableCell>
                  <TableCell colSpan={2} align="center" sx={{
                    ...hdr,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                  }}>
                    Soldes N
                  </TableCell>
                  <TableCell rowSpan={2} sx={{ width: 50 }} />
                </TableRow>
                {/* Sous-colonnes */}
                <TableRow>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: n1Bg }}>Solde Débit</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: n1Bg }}>Solde Crédit</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: alpha(theme.palette.info.main, 0.04) }}>Mvt Débit</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: alpha(theme.palette.info.main, 0.04) }}>Mvt Crédit</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: nBg }}>Solde Débit</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: nBg }}>Solde Crédit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" height={20} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((entry) => (
                      <TableRow key={entry.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, ...mono }}>
                            {entry.compte}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                            {entry.intitule}
                          </Typography>
                        </TableCell>
                        {/* N-1 Soldes */}
                        <TableCell align="right" sx={{ ...mono, color: theme.palette.text.secondary, backgroundColor: alpha(theme.palette.grey[500], 0.02) }}>
                          {fmt(entry.soldeDebitN1)}
                        </TableCell>
                        <TableCell align="right" sx={{ ...mono, color: theme.palette.text.secondary, backgroundColor: alpha(theme.palette.grey[500], 0.02) }}>
                          {fmt(entry.soldeCreditN1)}
                        </TableCell>
                        {/* Mouvements N */}
                        <TableCell align="right" sx={{ ...mono, backgroundColor: alpha(theme.palette.info.main, 0.02) }}>
                          {fmt(entry.mouvementDebit)}
                        </TableCell>
                        <TableCell align="right" sx={{ ...mono, backgroundColor: alpha(theme.palette.info.main, 0.02) }}>
                          {fmt(entry.mouvementCredit)}
                        </TableCell>
                        {/* Soldes N */}
                        <TableCell align="right" sx={{
                          ...mono, fontWeight: 600,
                          color: entry.soldeDebit > 0 ? theme.palette.success.main : undefined,
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        }}>
                          {fmt(entry.soldeDebit)}
                        </TableCell>
                        <TableCell align="right" sx={{
                          ...mono, fontWeight: 600,
                          color: entry.soldeCredit > 0 ? theme.palette.error.main : undefined,
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        }}>
                          {fmt(entry.soldeCredit)}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Détails">
                            <IconButton size="small" onClick={() => { setSelectedEntry(entry); setDetailModalOpen(true) }}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                )}
                {/* Totaux */}
                {!loading && filteredData.length > 0 && (
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableCell colSpan={2}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>TOTAUX</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono, color: 'text.secondary' }}>{fmt(totals.soldeDebitN1)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono, color: 'text.secondary' }}>{fmt(totals.soldeCreditN1)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono }}>{fmt(totals.mouvementDebit)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono }}>{fmt(totals.mouvementCredit)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono }}>{fmt(totals.soldeDebit)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono }}>{fmt(totals.soldeCredit)}</TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
            rowsPerPageOptions={[25, 50, 100, 500]}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </CardContent>
      </Card>

      {/* Modal détails */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Détails du Compte</Typography>
          <IconButton onClick={() => setDetailModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEntry && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">N° Compte</Typography>
                <Typography variant="h6" sx={mono}>{selectedEntry.compte}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Intitulé</Typography>
                <Typography variant="body1">{selectedEntry.intitule}</Typography>
              </Box>
              <Divider />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Soldes N-1</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Solde Débit N-1</Typography>
                  <Typography variant="h6" color="text.secondary">{fmt(selectedEntry.soldeDebitN1)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Solde Crédit N-1</Typography>
                  <Typography variant="h6" color="text.secondary">{fmt(selectedEntry.soldeCreditN1)}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Mouvements N</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Mouvement Débit</Typography>
                  <Typography variant="h6">{fmt(selectedEntry.mouvementDebit)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Mouvement Crédit</Typography>
                  <Typography variant="h6">{fmt(selectedEntry.mouvementCredit)}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Soldes N</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Solde Débit</Typography>
                  <Typography variant="h6" color="success.main">{fmt(selectedEntry.soldeDebit)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Solde Crédit</Typography>
                  <Typography variant="h6" color="error.main">{fmt(selectedEntry.soldeCredit)}</Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
    </>
  )
}

export default ModernBalance
