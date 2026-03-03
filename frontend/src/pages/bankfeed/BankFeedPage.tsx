/**
 * Page Rapprochement Bancaire — Import, Mapping & Reconciliation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Stack,
  Avatar,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material'
import {
  AccountBalance as BankIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  AutoFixHigh as AutoIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  SwapHoriz as ReconcileIcon,
  Receipt as TransactionIcon,
  Settings as RulesIcon,
} from '@mui/icons-material'
import {
  type BankAccount,
  type BankTransaction,
  type MappingRule,
  saveBankAccount,
  getAllBankAccounts,
  deleteBankAccount,
  saveTransactions,
  getTransactions,
  reconcileTransaction,
  unreconcileTransaction,
  getMappingRules,
  saveMappingRule,
  deleteMappingRule,
  suggestOHADAAccount,
  autoReconcileByRules,
  getBankFeedStats,
} from '@/services/bankFeedStorageService'
import {
  parseOFXFile,
  parseCAMT053File,
  parseBankCSV,
  detectFileType,
  detectCSVSeparator,
  DEFAULT_CSV_CONFIG,
} from '@/services/bankStatementParserService'

const BankFeedPage: React.FC = () => {
  const theme = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState(0)
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [rules, setRules] = useState<MappingRule[]>([])
  const [stats, setStats] = useState(getBankFeedStats())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterReconciled, setFilterReconciled] = useState<'all' | 'yes' | 'no'>('all')

  // Dialogs
  const [accountDialog, setAccountDialog] = useState(false)
  const [ruleDialog, setRuleDialog] = useState(false)
  const [reconcileDialog, setReconcileDialog] = useState<BankTransaction | null>(null)

  // Forms
  const [newAccount, setNewAccount] = useState({ bankName: '', accountNumber: '', accountLabel: '', compteComptable: '5211', currency: 'XOF', solde: 0 })
  const [newRule, setNewRule] = useState({ keywords: '', compteComptable: '', compteLabel: '', priority: 10 })
  const [reconcileCompte, setReconcileCompte] = useState('')

  // Import state
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ count: number; type: string } | null>(null)

  const loadData = useCallback(() => {
    setAccounts(getAllBankAccounts())
    setRules(getMappingRules())
    setStats(getBankFeedStats())
  }, [])

  const loadTransactions = useCallback(() => {
    const filters: Parameters<typeof getTransactions>[0] = {}
    if (selectedAccountId) filters.bankAccountId = selectedAccountId
    if (filterReconciled === 'yes') filters.reconciled = true
    if (filterReconciled === 'no') filters.reconciled = false
    if (searchTerm) filters.search = searchTerm
    setTransactions(getTransactions(filters))
  }, [selectedAccountId, filterReconciled, searchTerm])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { loadTransactions() }, [loadTransactions])

  // ── Account CRUD ──
  const handleSaveAccount = () => {
    if (!newAccount.bankName || !newAccount.accountNumber) return
    saveBankAccount(newAccount)
    setAccountDialog(false)
    setNewAccount({ bankName: '', accountNumber: '', accountLabel: '', compteComptable: '5211', currency: 'XOF', solde: 0 })
    loadData()
  }

  const handleDeleteAccount = (id: string) => {
    deleteBankAccount(id)
    if (selectedAccountId === id) setSelectedAccountId('')
    loadData()
    loadTransactions()
  }

  // ── File Import ──
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedAccountId) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const fileType = detectFileType(text)

      let rawTxns: ReturnType<typeof parseOFXFile> = []
      switch (fileType) {
        case 'OFX':
          rawTxns = parseOFXFile(text, selectedAccountId)
          break
        case 'CAMT053':
          rawTxns = parseCAMT053File(text, selectedAccountId)
          break
        case 'CSV': {
          const sep = detectCSVSeparator(text)
          rawTxns = parseBankCSV(text, selectedAccountId, { ...DEFAULT_CSV_CONFIG, separator: sep })
          break
        }
        default:
          // Try CSV as fallback
          rawTxns = parseBankCSV(text, selectedAccountId, DEFAULT_CSV_CONFIG)
      }

      // Apply auto-suggestions
      const withSuggestions = rawTxns.map(t => {
        const suggestion = suggestOHADAAccount(t.label)
        if (suggestion) {
          return { ...t, suggestedCompte: suggestion.compteComptable, suggestionConfidence: suggestion.confidence }
        }
        return t
      })

      saveTransactions(withSuggestions)
      setImportResult({ count: withSuggestions.length, type: fileType || 'CSV' })
      loadTransactions()
      loadData()
    } catch (err) {
      console.error('Import error:', err)
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Auto-reconcile ──
  const handleAutoReconcile = () => {
    if (!selectedAccountId) return
    const result = autoReconcileByRules(selectedAccountId)
    setImportResult({ count: result.reconciled, type: `auto-reconciliees (${result.skipped} ignorees)` })
    loadTransactions()
    loadData()
  }

  // ── Manual reconcile ──
  const handleManualReconcile = () => {
    if (!reconcileDialog || !reconcileCompte) return
    reconcileTransaction(reconcileDialog.id, reconcileCompte)
    setReconcileDialog(null)
    setReconcileCompte('')
    loadTransactions()
    loadData()
  }

  // ── Save Rule ──
  const handleSaveRule = () => {
    if (!newRule.keywords || !newRule.compteComptable) return
    saveMappingRule({
      keywords: newRule.keywords.split(',').map(k => k.trim()).filter(Boolean),
      compteComptable: newRule.compteComptable,
      compteLabel: newRule.compteLabel,
      priority: newRule.priority,
      isDefault: false,
    })
    setRuleDialog(false)
    setNewRule({ keywords: '', compteComptable: '', compteLabel: '', priority: 10 })
    loadData()
  }

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({ children, value, index }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  )

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Rapprochement Bancaire
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Import de releves, mapping OHADA automatique et reconciliation
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setAccountDialog(true)}>
              Nouveau Compte
            </Button>
            {selectedAccountId && (
              <>
                <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => fileInputRef.current?.click()}>
                  Importer Releve
                </Button>
                <Button variant="contained" startIcon={<AutoIcon />} onClick={handleAutoReconcile}>
                  Auto-Reconcilier
                </Button>
              </>
            )}
          </Stack>
        </Box>
        <input ref={fileInputRef} type="file" hidden accept=".ofx,.qfx,.xml,.csv,.txt" onChange={handleFileImport} />
      </Box>

      {importing && <LinearProgress sx={{ mb: 2 }} />}

      {importResult && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setImportResult(null)}>
          <AlertTitle>Import reussi</AlertTitle>
          {importResult.count} transactions {importResult.type}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Comptes Bancaires', value: stats.totalAccounts, color: theme.palette.primary.main, icon: <BankIcon /> },
          { label: 'Transactions', value: stats.totalTransactions, color: theme.palette.info.main, icon: <TransactionIcon /> },
          { label: 'Reconciliees', value: stats.reconciledCount, color: theme.palette.success.main, icon: <CheckIcon /> },
          { label: 'En Attente', value: stats.pendingCount, color: theme.palette.warning.main, icon: <ReconcileIcon /> },
        ].map(s => (
          <Grid item xs={12} sm={6} lg={3} key={s.label}>
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: s.color }}>{s.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  </Box>
                  <Avatar sx={{ backgroundColor: alpha(s.color, 0.1), color: s.color }}>{s.icon}</Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="Comptes & Transactions" icon={<BankIcon />} iconPosition="start" />
            <Tab label="Regles de Mapping" icon={<RulesIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab 0: Accounts & Transactions */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3, pb: 3 }}>
            {/* Account selector + filters */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel>Compte Bancaire</InputLabel>
                <Select value={selectedAccountId} label="Compte Bancaire" onChange={e => setSelectedAccountId(e.target.value)}>
                  <MenuItem value="">Tous les comptes</MenuItem>
                  {accounts.map(a => (
                    <MenuItem key={a.id} value={a.id}>{a.bankName} — {a.accountNumber} ({a.compteComptable})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Statut</InputLabel>
                <Select value={filterReconciled} label="Statut" onChange={e => setFilterReconciled(e.target.value as typeof filterReconciled)}>
                  <MenuItem value="all">Toutes</MenuItem>
                  <MenuItem value="yes">Reconciliees</MenuItem>
                  <MenuItem value="no">Non reconciliees</MenuItem>
                </Select>
              </FormControl>
              <TextField size="small" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.disabled' }} /> }}
              />
            </Stack>

            {/* Accounts list (compact) */}
            {accounts.length > 0 && !selectedAccountId && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {accounts.map(a => (
                  <Grid item xs={12} sm={6} md={4} key={a.id}>
                    <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: theme.palette.primary.main } }}
                      onClick={() => setSelectedAccountId(a.id)}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{a.bankName}</Typography>
                            <Typography variant="caption" color="text.secondary">{a.accountNumber} — {a.compteComptable}</Typography>
                          </Box>
                          <IconButton size="small" onClick={e => { e.stopPropagation(); handleDeleteAccount(a.id) }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                          {a.solde.toLocaleString('fr-FR')} {a.currency}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Transactions table */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Libelle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Montant</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Compte OHADA</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          {accounts.length === 0
                            ? 'Ajoutez un compte bancaire puis importez un releve (OFX, CAMT.053, CSV)'
                            : 'Aucune transaction. Importez un releve bancaire.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.slice(0, 100).map(txn => (
                      <TableRow key={txn.id} hover>
                        <TableCell><Typography variant="body2">{txn.date}</Typography></TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {txn.label}
                          </Typography>
                        </TableCell>
                        <TableCell><Typography variant="caption" color="text.secondary">{txn.reference}</Typography></TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: txn.amount >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                            {txn.amount >= 0 ? '+' : ''}{txn.amount.toLocaleString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {txn.compteComptable ? (
                            <Chip label={txn.compteComptable} size="small" color="primary" variant="outlined" />
                          ) : txn.suggestedCompte ? (
                            <Tooltip title={`Suggestion auto (${Math.round(txn.suggestionConfidence * 100)}%)`}>
                              <Chip label={txn.suggestedCompte} size="small" color="warning" variant="outlined"
                                onClick={() => { setReconcileDialog(txn); setReconcileCompte(txn.suggestedCompte!) }} />
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={txn.reconciled ? 'Reconciliee' : 'En attente'}
                            size="small"
                            sx={{
                              backgroundColor: alpha(txn.reconciled ? theme.palette.success.main : theme.palette.warning.main, 0.1),
                              color: txn.reconciled ? theme.palette.success.main : theme.palette.warning.main,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            {!txn.reconciled ? (
                              <Tooltip title="Reconcilier">
                                <IconButton size="small" color="primary" onClick={() => {
                                  setReconcileDialog(txn)
                                  setReconcileCompte(txn.suggestedCompte || '')
                                }}>
                                  <ReconcileIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Annuler reconciliation">
                                <IconButton size="small" onClick={() => { unreconcileTransaction(txn.id); loadTransactions(); loadData() }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {transactions.length > 100 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Affichage des 100 premieres transactions sur {transactions.length}
              </Typography>
            )}
          </Box>
        </TabPanel>

        {/* Tab 1: Mapping Rules */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3, pb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Regles de Mapping OHADA</Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setRuleDialog(true)}>Nouvelle Regle</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Mots-cles</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Compte OHADA</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Libelle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Priorite</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rules.map(rule => (
                    <TableRow key={rule.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {rule.keywords.map(kw => <Chip key={kw} label={kw} size="small" variant="outlined" />)}
                        </Stack>
                      </TableCell>
                      <TableCell><Chip label={rule.compteComptable} size="small" color="primary" /></TableCell>
                      <TableCell><Typography variant="body2">{rule.compteLabel}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{rule.priority}</Typography></TableCell>
                      <TableCell>
                        <Chip label={rule.isDefault ? 'Defaut' : 'Personnalisee'} size="small"
                          color={rule.isDefault ? 'default' : 'info'} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {!rule.isDefault && (
                          <IconButton size="small" onClick={() => { deleteMappingRule(rule.id); loadData() }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Card>

      {/* Dialog: New Account */}
      <Dialog open={accountDialog} onClose={() => setAccountDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau Compte Bancaire</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nom de la banque" fullWidth value={newAccount.bankName} onChange={e => setNewAccount(p => ({ ...p, bankName: e.target.value }))} />
            <TextField label="Numero de compte" fullWidth value={newAccount.accountNumber} onChange={e => setNewAccount(p => ({ ...p, accountNumber: e.target.value }))} />
            <TextField label="Libelle du compte" fullWidth value={newAccount.accountLabel} onChange={e => setNewAccount(p => ({ ...p, accountLabel: e.target.value }))} />
            <TextField label="Compte comptable OHADA (ex: 5211)" fullWidth value={newAccount.compteComptable} onChange={e => setNewAccount(p => ({ ...p, compteComptable: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Devise</InputLabel>
              <Select value={newAccount.currency} label="Devise" onChange={e => setNewAccount(p => ({ ...p, currency: e.target.value }))}>
                <MenuItem value="XOF">XOF (FCFA BCEAO)</MenuItem>
                <MenuItem value="XAF">XAF (FCFA BEAC)</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccountDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveAccount} disabled={!newAccount.bankName || !newAccount.accountNumber}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: New Rule */}
      <Dialog open={ruleDialog} onClose={() => setRuleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Regle de Mapping</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Mots-cles (separes par virgule)" fullWidth value={newRule.keywords}
              onChange={e => setNewRule(p => ({ ...p, keywords: e.target.value }))}
              helperText="Ex: loyer, bail, location" />
            <TextField label="Compte OHADA" fullWidth value={newRule.compteComptable}
              onChange={e => setNewRule(p => ({ ...p, compteComptable: e.target.value }))} />
            <TextField label="Libelle du compte" fullWidth value={newRule.compteLabel}
              onChange={e => setNewRule(p => ({ ...p, compteLabel: e.target.value }))} />
            <TextField label="Priorite" type="number" fullWidth value={newRule.priority}
              onChange={e => setNewRule(p => ({ ...p, priority: parseInt(e.target.value) || 10 }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRuleDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveRule} disabled={!newRule.keywords || !newRule.compteComptable}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Reconcile Transaction */}
      <Dialog open={!!reconcileDialog} onClose={() => setReconcileDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reconcilier la Transaction</DialogTitle>
        <DialogContent>
          {reconcileDialog && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                <AlertTitle>{reconcileDialog.label}</AlertTitle>
                {reconcileDialog.date} — {reconcileDialog.amount.toLocaleString('fr-FR')} {reconcileDialog.source}
              </Alert>
              <TextField label="Compte OHADA" fullWidth value={reconcileCompte}
                onChange={e => setReconcileCompte(e.target.value)}
                helperText={reconcileDialog.suggestedCompte ? `Suggestion automatique: ${reconcileDialog.suggestedCompte}` : ''} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReconcileDialog(null)}>Annuler</Button>
          <Button variant="contained" onClick={handleManualReconcile} disabled={!reconcileCompte}>Reconcilier</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BankFeedPage
