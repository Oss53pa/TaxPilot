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
import type { BalanceEntry } from '@/services/liasseDataService'
import { getLatestBalance, getLatestBalanceN1 } from '@/services/balanceStorageService'

interface DisplayEntry {
  id: string
  compte: string
  intitule: string
  classe: string
  debit: number
  credit: number
  soldeDebiteur: number
  soldeCrediteur: number
  debitN1: number
  creditN1: number
  soldeDebiteurN1: number
  soldeCrediteurN1: number
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
  }, [])

  const loadBalanceData = () => {
    try {
      setLoading(true)

      const stored = getLatestBalance()
      const storedN1 = getLatestBalanceN1()

      if (!stored?.entries?.length) {
        setEntries([])
        setFilteredData([])
        return
      }

      const n1Map = new Map<string, BalanceEntry>()
      if (storedN1?.entries) {
        storedN1.entries.forEach(e => n1Map.set(e.compte, e))
      }

      const data: DisplayEntry[] = stored.entries.map((entry, idx) => {
        const n1 = n1Map.get(entry.compte)
        return {
          id: String(idx + 1),
          compte: entry.compte,
          intitule: entry.intitule,
          classe: entry.compte.charAt(0),
          debit: entry.debit || 0,
          credit: entry.credit || 0,
          soldeDebiteur: entry.solde_debit || 0,
          soldeCrediteur: entry.solde_credit || 0,
          debitN1: n1?.debit || 0,
          creditN1: n1?.credit || 0,
          soldeDebiteurN1: n1?.solde_debit || 0,
          soldeCrediteurN1: n1?.solde_credit || 0,
        }
      })

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
    const totalDebit = entries.reduce((s, e) => s + e.debit, 0)
    const totalCredit = entries.reduce((s, e) => s + e.credit, 0)
    const totalSD = entries.reduce((s, e) => s + e.soldeDebiteur, 0)
    const totalSC = entries.reduce((s, e) => s + e.soldeCrediteur, 0)
    const ecart = Math.abs(totalSD - totalSC)
    return { totalDebit, totalCredit, totalSD, totalSC, ecart, balanced: ecart < 1 }
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
    debit: filteredData.reduce((s, e) => s + e.debit, 0),
    credit: filteredData.reduce((s, e) => s + e.credit, 0),
    soldeDebiteur: filteredData.reduce((s, e) => s + e.soldeDebiteur, 0),
    soldeCrediteur: filteredData.reduce((s, e) => s + e.soldeCrediteur, 0),
    debitN1: filteredData.reduce((s, e) => s + e.debitN1, 0),
    creditN1: filteredData.reduce((s, e) => s + e.creditN1, 0),
    soldeDebiteurN1: filteredData.reduce((s, e) => s + e.soldeDebiteurN1, 0),
    soldeCrediteurN1: filteredData.reduce((s, e) => s + e.soldeCrediteurN1, 0),
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
            title="Total Débit"
            value={fmt(stats.totalDebit)}
            color={theme.palette.info.main}
            icon={<TrendingUpIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Crédit"
            value={fmt(stats.totalCredit)}
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
                  <TableCell rowSpan={2} sx={{ ...hdr, minWidth: 90 }}>N° Compte</TableCell>
                  <TableCell rowSpan={2} sx={{ ...hdr, minWidth: 200 }}>Intitulé</TableCell>
                  <TableCell colSpan={4} align="center" sx={{
                    ...hdr,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                  }}>
                    Exercice N
                  </TableCell>
                  <TableCell colSpan={4} align="center" sx={{
                    ...hdr,
                    backgroundColor: alpha(theme.palette.grey[500], 0.08),
                    borderBottom: `2px solid ${theme.palette.grey[500]}`,
                  }}>
                    Exercice N-1
                  </TableCell>
                  <TableCell rowSpan={2} sx={{ width: 50 }} />
                </TableRow>
                {/* Sous-colonnes */}
                <TableRow>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: nBg }}>Débit</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: nBg }}>Crédit</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: nBg }}>Solde Débiteur</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: nBg }}>Solde Créditeur</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: n1Bg }}>Débit</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: n1Bg }}>Crédit</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: n1Bg }}>Solde Débiteur</TableCell>
                  <TableCell align="right" sx={{ ...hdr, backgroundColor: n1Bg }}>Solde Créditeur</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 11 }).map((_, j) => (
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
                        {/* N */}
                        <TableCell align="right" sx={{ ...mono, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                          {fmt(entry.debit)}
                        </TableCell>
                        <TableCell align="right" sx={{ ...mono, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                          {fmt(entry.credit)}
                        </TableCell>
                        <TableCell align="right" sx={{
                          ...mono, fontWeight: 600,
                          color: entry.soldeDebiteur > 0 ? theme.palette.success.main : undefined,
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        }}>
                          {fmt(entry.soldeDebiteur)}
                        </TableCell>
                        <TableCell align="right" sx={{
                          ...mono, fontWeight: 600,
                          color: entry.soldeCrediteur > 0 ? theme.palette.error.main : undefined,
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        }}>
                          {fmt(entry.soldeCrediteur)}
                        </TableCell>
                        {/* N-1 */}
                        <TableCell align="right" sx={{ ...mono, color: theme.palette.text.secondary, backgroundColor: alpha(theme.palette.grey[500], 0.02) }}>
                          {fmt(entry.debitN1)}
                        </TableCell>
                        <TableCell align="right" sx={{ ...mono, color: theme.palette.text.secondary, backgroundColor: alpha(theme.palette.grey[500], 0.02) }}>
                          {fmt(entry.creditN1)}
                        </TableCell>
                        <TableCell align="right" sx={{ ...mono, color: theme.palette.text.secondary, backgroundColor: alpha(theme.palette.grey[500], 0.02) }}>
                          {fmt(entry.soldeDebiteurN1)}
                        </TableCell>
                        <TableCell align="right" sx={{ ...mono, color: theme.palette.text.secondary, backgroundColor: alpha(theme.palette.grey[500], 0.02) }}>
                          {fmt(entry.soldeCrediteurN1)}
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
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono }}>{fmt(totals.debit)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono }}>{fmt(totals.credit)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono }}>{fmt(totals.soldeDebiteur)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono }}>{fmt(totals.soldeCrediteur)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono, color: 'text.secondary' }}>{fmt(totals.debitN1)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono, color: 'text.secondary' }}>{fmt(totals.creditN1)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono, color: 'text.secondary' }}>{fmt(totals.soldeDebiteurN1)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, ...mono, color: 'text.secondary' }}>{fmt(totals.soldeCrediteurN1)}</TableCell>
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
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Exercice N</Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Débit</Typography>
                  <Typography variant="h6">{fmt(selectedEntry.debit)}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Crédit</Typography>
                  <Typography variant="h6">{fmt(selectedEntry.credit)}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Solde Débiteur</Typography>
                  <Typography variant="h6" color="success.main">{fmt(selectedEntry.soldeDebiteur)}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Solde Créditeur</Typography>
                  <Typography variant="h6" color="error.main">{fmt(selectedEntry.soldeCrediteur)}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Exercice N-1</Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Débit</Typography>
                  <Typography variant="h6" color="text.secondary">{fmt(selectedEntry.debitN1)}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Crédit</Typography>
                  <Typography variant="h6" color="text.secondary">{fmt(selectedEntry.creditN1)}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Solde Débiteur</Typography>
                  <Typography variant="h6" color="text.secondary">{fmt(selectedEntry.soldeDebiteurN1)}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" color="text.secondary">Solde Créditeur</Typography>
                  <Typography variant="h6" color="text.secondary">{fmt(selectedEntry.soldeCrediteurN1)}</Typography>
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
