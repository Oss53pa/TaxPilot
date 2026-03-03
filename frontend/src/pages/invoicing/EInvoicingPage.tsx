/**
 * Page Facturation Electronique — Creation, gestion et export XML
 */

import React, { useState, useEffect, useCallback } from 'react'
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
  Stack,
  Avatar,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
  Divider,
} from '@mui/material'
import {
  Receipt as InvoiceIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Download as DownloadIcon,
  People as ClientIcon,
  Assessment as StatsIcon,
  MonetizationOn as MoneyIcon,
  Undo as AvoirIcon,
  Payment as PaidIcon,
} from '@mui/icons-material'
import {
  type Invoice,
  type InvoiceType,
  type InvoiceDirection,
  type InvoiceStatus,
  type Client,
  type InvoiceParty,
  createInvoice,
  getAllInvoices,
  deleteInvoice,
  validateInvoice,
  markAsPaid,
  createAvoir,
  saveClient,
  getAllClients,
  deleteClient,
  getInvoiceStats,
  getInvoiceSettings,
} from '@/services/einvoiceStorageService'
import { generateUBL21, generateCII, generatePEPPOLBIS3, downloadXml } from '@/services/einvoiceXmlService'
import { getEntreprise } from '@/services/entrepriseStorageService'

const EInvoicingPage: React.FC = () => {
  const theme = useTheme()

  const [activeTab, setActiveTab] = useState(0)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState(getInvoiceStats())

  // Dialogs
  const [invoiceDialog, setInvoiceDialog] = useState(false)
  const [clientDialog, setClientDialog] = useState(false)
  const [xmlDialog, setXmlDialog] = useState<Invoice | null>(null)

  // Invoice form
  const [formType, setFormType] = useState<InvoiceType>('FACTURE')
  const [formDirection, setFormDirection] = useState<InvoiceDirection>('VENTE')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formDueDate, setFormDueDate] = useState('')
  const [formBuyerName, setFormBuyerName] = useState('')
  const [formBuyerTaxId, setFormBuyerTaxId] = useState('')
  const [formBuyerRccm, setFormBuyerRccm] = useState('')
  const [formBuyerAddress, setFormBuyerAddress] = useState('')
  const [formBuyerCity, setFormBuyerCity] = useState('')
  const [formBuyerCountry, setFormBuyerCountry] = useState('CI')
  const [formNotes, setFormNotes] = useState('')
  const [formLines, setFormLines] = useState<Array<{ description: string; quantity: number; unitPrice: number; taxRate: number; compteComptable: string }>>([
    { description: '', quantity: 1, unitPrice: 0, taxRate: 18, compteComptable: '7011' },
  ])

  // Client form
  const [clientForm, setClientForm] = useState({ name: '', taxId: '', rccm: '', type: 'client' as 'client' | 'fournisseur', address: '', city: '', country: 'CI', phone: '', email: '', compteComptable: '4111' })

  const loadData = useCallback(() => {
    setInvoices(getAllInvoices())
    setClients(getAllClients())
    setStats(getInvoiceStats())
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Auto-set due date
  useEffect(() => {
    if (formDate && !formDueDate) {
      const settings = getInvoiceSettings()
      const d = new Date(formDate)
      d.setDate(d.getDate() + settings.defaultPaymentTermDays)
      setFormDueDate(d.toISOString().split('T')[0])
    }
  }, [formDate, formDueDate])

  // ── Create Invoice ──
  const handleCreateInvoice = () => {
    const entreprise = getEntreprise()
    const seller: InvoiceParty = {
      name: entreprise?.raison_sociale || 'Mon Entreprise',
      taxId: entreprise?.numero_contribuable || entreprise?.ifu || '',
      rccm: entreprise?.rccm || '',
      address: entreprise?.adresse_ligne1 || '',
      city: entreprise?.ville || '',
      country: entreprise?.pays || 'CI',
      phone: entreprise?.telephone || '',
      email: entreprise?.email || '',
      compteComptable: '',
    }

    const buyer: InvoiceParty = {
      name: formBuyerName,
      taxId: formBuyerTaxId,
      rccm: formBuyerRccm,
      address: formBuyerAddress,
      city: formBuyerCity,
      country: formBuyerCountry,
      phone: '',
      email: '',
      compteComptable: formDirection === 'VENTE' ? '4111' : '4011',
    }

    const actualSeller = formDirection === 'VENTE' ? seller : buyer
    const actualBuyer = formDirection === 'VENTE' ? buyer : seller

    createInvoice({
      type: formType,
      direction: formDirection,
      date: formDate,
      dueDate: formDueDate,
      seller: actualSeller,
      buyer: actualBuyer,
      lines: formLines.filter(l => l.description && l.unitPrice > 0),
    })

    resetForm()
    setInvoiceDialog(false)
    loadData()
  }

  const resetForm = () => {
    setFormType('FACTURE')
    setFormDirection('VENTE')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormDueDate('')
    setFormBuyerName('')
    setFormBuyerTaxId('')
    setFormBuyerRccm('')
    setFormBuyerAddress('')
    setFormBuyerCity('')
    setFormBuyerCountry('CI')
    setFormNotes('')
    setFormLines([{ description: '', quantity: 1, unitPrice: 0, taxRate: 18, compteComptable: '7011' }])
  }

  // ── Line management ──
  const addLine = () => {
    setFormLines(prev => [...prev, { description: '', quantity: 1, unitPrice: 0, taxRate: 18, compteComptable: formDirection === 'VENTE' ? '7011' : '6011' }])
  }

  const updateLine = (index: number, field: string, value: string | number) => {
    setFormLines(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const removeLine = (index: number) => {
    setFormLines(prev => prev.filter((_, i) => i !== index))
  }

  // ── XML export ──
  const handleExportXml = (invoice: Invoice, format: 'UBL21' | 'CII' | 'PEPPOL') => {
    let xml: string
    switch (format) {
      case 'UBL21': xml = generateUBL21(invoice); break
      case 'CII': xml = generateCII(invoice); break
      case 'PEPPOL': xml = generatePEPPOLBIS3(invoice); break
    }
    downloadXml(xml, `${invoice.number}_${format}.xml`)
  }

  // ── Save client ──
  const handleSaveClient = () => {
    if (!clientForm.name) return
    saveClient(clientForm)
    setClientDialog(false)
    setClientForm({ name: '', taxId: '', rccm: '', type: 'client', address: '', city: '', country: 'CI', phone: '', email: '', compteComptable: '4111' })
    loadData()
  }

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'payee': return theme.palette.success.main
      case 'validee': return theme.palette.info.main
      case 'envoyee': return theme.palette.primary.main
      case 'brouillon': return theme.palette.grey[500]
      case 'annulee': return theme.palette.error.main
    }
  }

  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case 'payee': return 'Payee'
      case 'validee': return 'Validee'
      case 'envoyee': return 'Envoyee'
      case 'brouillon': return 'Brouillon'
      case 'annulee': return 'Annulee'
    }
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
              Facturation Electronique
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Creation de factures, export UBL/CII/PEPPOL et suivi des paiements
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<ClientIcon />} onClick={() => setClientDialog(true)}>
              Nouveau Client
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setInvoiceDialog(true)}>
              Nouvelle Facture
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'CA Ventes HT', value: stats.totalVentesHT.toLocaleString('fr-FR'), color: theme.palette.success.main, icon: <MoneyIcon /> },
          { label: 'TVA Nette', value: stats.tvaNette.toLocaleString('fr-FR'), color: theme.palette.info.main, icon: <StatsIcon /> },
          { label: 'Factures', value: stats.invoiceCount, color: theme.palette.primary.main, icon: <InvoiceIcon /> },
          { label: 'Impayees', value: stats.unpaidAmount.toLocaleString('fr-FR'), color: theme.palette.warning.main, icon: <PaidIcon /> },
        ].map(s => (
          <Grid item xs={12} sm={6} lg={3} key={s.label}>
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: s.color }}>{s.value}</Typography>
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
            <Tab label="Factures" icon={<InvoiceIcon />} iconPosition="start" />
            <Tab label="Clients / Fournisseurs" icon={<ClientIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab 0: Invoices */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3, pb: 3 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Numero</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Client/Fournisseur</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>HT</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>TVA</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>TTC</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">Aucune facture. Cliquez sur "Nouvelle Facture" pour commencer.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map(inv => (
                      <TableRow key={inv.id} hover>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{inv.number}</Typography></TableCell>
                        <TableCell>
                          <Chip label={inv.type === 'AVOIR' ? 'Avoir' : inv.direction === 'VENTE' ? 'Vente' : 'Achat'}
                            size="small" variant="outlined"
                            color={inv.type === 'AVOIR' ? 'error' : inv.direction === 'VENTE' ? 'success' : 'info'} />
                        </TableCell>
                        <TableCell><Typography variant="body2">{inv.date}</Typography></TableCell>
                        <TableCell>
                          <Typography variant="body2">{inv.direction === 'VENTE' ? inv.buyer.name : inv.seller.name}</Typography>
                        </TableCell>
                        <TableCell align="right"><Typography variant="body2">{inv.totalHT.toLocaleString('fr-FR')}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2">{inv.totalTVA.toLocaleString('fr-FR')}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 600 }}>{inv.totalTTC.toLocaleString('fr-FR')}</Typography></TableCell>
                        <TableCell>
                          <Chip label={getStatusLabel(inv.status)} size="small"
                            sx={{ backgroundColor: alpha(getStatusColor(inv.status), 0.1), color: getStatusColor(inv.status), fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            {inv.status === 'brouillon' && (
                              <Tooltip title="Valider">
                                <IconButton size="small" color="primary" onClick={() => { validateInvoice(inv.id); loadData() }}>
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(inv.status === 'validee' || inv.status === 'envoyee') && (
                              <Tooltip title="Marquer payee">
                                <IconButton size="small" color="success" onClick={() => { markAsPaid(inv.id); loadData() }}>
                                  <PaidIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {inv.type === 'FACTURE' && inv.status !== 'annulee' && (
                              <Tooltip title="Creer un avoir">
                                <IconButton size="small" onClick={() => { createAvoir(inv.id); loadData() }}>
                                  <AvoirIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Exporter XML">
                              <IconButton size="small" onClick={() => setXmlDialog(inv)}>
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton size="small" onClick={() => { deleteInvoice(inv.id); loadData() }}>
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
          </Box>
        </TabPanel>

        {/* Tab 1: Clients */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3, pb: 3 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>NIF/IFU</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>RCCM</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ville</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Compte</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">Aucun client/fournisseur. Ajoutez-en un.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map(cl => (
                      <TableRow key={cl.id} hover>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{cl.name}</Typography></TableCell>
                        <TableCell>
                          <Chip label={cl.type === 'client' ? 'Client' : 'Fournisseur'} size="small" variant="outlined"
                            color={cl.type === 'client' ? 'success' : 'info'} />
                        </TableCell>
                        <TableCell><Typography variant="body2">{cl.taxId || '—'}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{cl.rccm || '—'}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{cl.city}</Typography></TableCell>
                        <TableCell><Chip label={cl.compteComptable} size="small" color="primary" variant="outlined" /></TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => { deleteClient(cl.id); loadData() }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Card>

      {/* Dialog: New Invoice */}
      <Dialog open={invoiceDialog} onClose={() => setInvoiceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nouvelle Facture</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={formType} label="Type" onChange={e => setFormType(e.target.value as InvoiceType)}>
                  <MenuItem value="FACTURE">Facture</MenuItem>
                  <MenuItem value="AVOIR">Avoir</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Direction</InputLabel>
                <Select value={formDirection} label="Direction" onChange={e => setFormDirection(e.target.value as InvoiceDirection)}>
                  <MenuItem value="VENTE">Vente</MenuItem>
                  <MenuItem value="ACHAT">Achat</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Date" type="date" fullWidth size="small" value={formDate} onChange={e => setFormDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Echeance" type="date" fullWidth size="small" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formDirection === 'VENTE' ? 'Client (acheteur)' : 'Fournisseur (vendeur)'}
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Raison sociale" fullWidth size="small" value={formBuyerName} onChange={e => setFormBuyerName(e.target.value)} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="NIF/IFU" fullWidth size="small" value={formBuyerTaxId} onChange={e => setFormBuyerTaxId(e.target.value)} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="RCCM" fullWidth size="small" value={formBuyerRccm} onChange={e => setFormBuyerRccm(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Adresse" fullWidth size="small" value={formBuyerAddress} onChange={e => setFormBuyerAddress(e.target.value)} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Ville" fullWidth size="small" value={formBuyerCity} onChange={e => setFormBuyerCity(e.target.value)} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Pays" fullWidth size="small" value={formBuyerCountry} onChange={e => setFormBuyerCountry(e.target.value)} />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">Lignes de facturation</Typography></Divider>
            </Grid>

            {formLines.map((line, i) => (
              <React.Fragment key={i}>
                <Grid item xs={12} sm={4}>
                  <TextField label="Description" fullWidth size="small" value={line.description}
                    onChange={e => updateLine(i, 'description', e.target.value)} />
                </Grid>
                <Grid item xs={3} sm={2}>
                  <TextField label="Qte" type="number" fullWidth size="small" value={line.quantity}
                    onChange={e => updateLine(i, 'quantity', parseFloat(e.target.value) || 0)} />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField label="Prix unit." type="number" fullWidth size="small" value={line.unitPrice}
                    onChange={e => updateLine(i, 'unitPrice', parseFloat(e.target.value) || 0)} />
                </Grid>
                <Grid item xs={3} sm={1}>
                  <TextField label="TVA %" type="number" fullWidth size="small" value={line.taxRate}
                    onChange={e => updateLine(i, 'taxRate', parseFloat(e.target.value) || 0)} />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField label="Compte" fullWidth size="small" value={line.compteComptable}
                    onChange={e => updateLine(i, 'compteComptable', e.target.value)} />
                </Grid>
                <Grid item xs={1}>
                  <IconButton size="small" onClick={() => removeLine(i)} disabled={formLines.length === 1}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Button size="small" startIcon={<AddIcon />} onClick={addLine}>Ajouter une ligne</Button>
            </Grid>

            {/* Total preview */}
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                {(() => {
                  const ht = formLines.reduce((s, l) => s + l.quantity * l.unitPrice, 0)
                  const tva = formLines.reduce((s, l) => s + l.quantity * l.unitPrice * (l.taxRate / 100), 0)
                  return (
                    <Stack spacing={0.5} alignItems="flex-end">
                      <Typography variant="body2">Total HT : <strong>{ht.toLocaleString('fr-FR')} XOF</strong></Typography>
                      <Typography variant="body2">TVA : <strong>{tva.toLocaleString('fr-FR')} XOF</strong></Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>TTC : {(ht + tva).toLocaleString('fr-FR')} XOF</Typography>
                    </Stack>
                  )
                })()}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField label="Notes" fullWidth multiline rows={2} size="small" value={formNotes} onChange={e => setFormNotes(e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateInvoice}
            disabled={!formBuyerName || formLines.every(l => !l.description || l.unitPrice === 0)}>
            Creer la Facture
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: New Client */}
      <Dialog open={clientDialog} onClose={() => setClientDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau Client / Fournisseur</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={clientForm.type} label="Type" onChange={e => setClientForm(p => ({ ...p, type: e.target.value as 'client' | 'fournisseur', compteComptable: e.target.value === 'client' ? '4111' : '4011' }))}>
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="fournisseur">Fournisseur</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Raison sociale" fullWidth value={clientForm.name} onChange={e => setClientForm(p => ({ ...p, name: e.target.value }))} />
            <TextField label="NIF/IFU" fullWidth value={clientForm.taxId} onChange={e => setClientForm(p => ({ ...p, taxId: e.target.value }))} />
            <TextField label="RCCM" fullWidth value={clientForm.rccm} onChange={e => setClientForm(p => ({ ...p, rccm: e.target.value }))} />
            <TextField label="Adresse" fullWidth value={clientForm.address} onChange={e => setClientForm(p => ({ ...p, address: e.target.value }))} />
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Ville" fullWidth value={clientForm.city} onChange={e => setClientForm(p => ({ ...p, city: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField label="Pays" fullWidth value={clientForm.country} onChange={e => setClientForm(p => ({ ...p, country: e.target.value }))} /></Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Telephone" fullWidth value={clientForm.phone} onChange={e => setClientForm(p => ({ ...p, phone: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField label="Email" fullWidth value={clientForm.email} onChange={e => setClientForm(p => ({ ...p, email: e.target.value }))} /></Grid>
            </Grid>
            <TextField label="Compte comptable" fullWidth value={clientForm.compteComptable} onChange={e => setClientForm(p => ({ ...p, compteComptable: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClientDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveClient} disabled={!clientForm.name}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: XML Export */}
      <Dialog open={!!xmlDialog} onClose={() => setXmlDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Exporter en XML — {xmlDialog?.number}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Selectionnez le format XML pour l'export de la facture.
            </Alert>
            <Button variant="outlined" fullWidth startIcon={<DownloadIcon />}
              onClick={() => { if (xmlDialog) { handleExportXml(xmlDialog, 'UBL21'); setXmlDialog(null) } }}>
              UBL 2.1 (Standard europeen)
            </Button>
            <Button variant="outlined" fullWidth startIcon={<DownloadIcon />}
              onClick={() => { if (xmlDialog) { handleExportXml(xmlDialog, 'CII'); setXmlDialog(null) } }}>
              UN/CEFACT CII (Cross Industry Invoice)
            </Button>
            <Button variant="outlined" fullWidth startIcon={<DownloadIcon />}
              onClick={() => { if (xmlDialog) { handleExportXml(xmlDialog, 'PEPPOL'); setXmlDialog(null) } }}>
              PEPPOL BIS 3.0
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setXmlDialog(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EInvoicingPage
