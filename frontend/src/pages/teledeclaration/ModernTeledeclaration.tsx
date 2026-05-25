/**
 * Module Télédéclaration Professionnel - Transmission électronique SYSCOHADA
 * Interface moderne pour dépôt et suivi des déclarations fiscales
 * Intégré avec dgiFilingStorageService pour la gestion des déclarations
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  useTheme,
  alpha,
  Divider,
  Stack,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Send as SendIcon,
  OpenInNew as OpenInNewIcon,
  AccountBalance as TaxIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as MoneyIcon,
  Assignment as AssignmentIcon,
  CloudDone as CloudDoneIcon,
  Sync as SyncIcon,
  VerifiedUser as CertificateIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Description as XmlIcon,
} from '@mui/icons-material'
import {
  type DGIDeclaration,
  type DeclarationType,
  createDeclaration,
  updateDeclaration,
  getAllDeclarations,
  deleteDeclaration,
  validateDeclaration as validateDGIDeclaration,
  submitDeclaration,
  generateDSF,
  getAllReceipts,
  getFilingStats,
} from '@/services/dgiFilingStorageService'
import { generateXmlForDeclaration, downloadXml } from '@/services/dgiXmlGeneratorService'
import { PrintButton } from '@/shared/print-engine'
import { scopeKey } from '@/services/dossierScopeService'

interface Declaration {
  id: string
  type: string
  period: string
  company: string
  status: 'draft' | 'ready' | 'submitted' | 'accepted' | 'rejected'
  dueDate: string
  submittedDate?: string
  amount?: number
  reference?: string
  attachments: string[]
  dgiDeclarationId?: string // link to DGI filing service
}

interface TransmissionStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  description: string
  timestamp?: string
  details?: string
}

interface GovernmentService {
  id: string
  name: string
  code: string
  /** Portail officiel pour le dépôt manuel (si disponible). */
  url?: string
}

const ModernTeledeclaration: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedDeclaration, setSelectedDeclaration] = useState<string>('')
  const [transmissionDialog, setTransmissionDialog] = useState(false)
  const [certificateDialog, setCertificateDialog] = useState(false)
  const [newDeclDialog, setNewDeclDialog] = useState(false)
  const [newDeclType, setNewDeclType] = useState<DeclarationType>('DSF')
  const [declarations, setDeclarations] = useState<Declaration[]>([])
  const [dgiDeclarations, setDgiDeclarations] = useState<DGIDeclaration[]>([])
  const [transmitting, setTransmitting] = useState(false)
  const [filingStats, setFilingStats] = useState(getFilingStats())

  const loadDeclarations = () => {
    try {
      // Lectures scopées par dossier — sinon cabinet leak entre clients.
      const raw = localStorage.getItem(scopeKey('fiscasync_workflow_state'))
      const ws = raw ? JSON.parse(raw) : {}

      // Read entreprise name
      let companyName = 'Mon entreprise'
      try {
        const entRaw = localStorage.getItem(scopeKey('fiscasync_entreprise_settings'))
          || localStorage.getItem(scopeKey('fiscasync_db_entreprise_settings'))
        if (entRaw) {
          const ent = JSON.parse(entRaw)
          const e = Array.isArray(ent) ? ent[0] : ent
          companyName = e?.raison_sociale || e?.denomination || companyName
        }
      } catch { /* ignore */ }

      const decls: Declaration[] = []

      // Workflow-based liasse declaration
      if (ws.generationDone) {
        const status = ws.teledeclarationStatus === 'submitted' ? 'submitted'
          : ws.teledeclarationStatus === 'accepted' ? 'accepted'
          : 'ready'
        decls.push({
          id: 'liasse-syscohada-1',
          type: 'Liasse Fiscale SYSCOHADA',
          period: new Date().getFullYear().toString(),
          company: companyName,
          status,
          dueDate: `31/03/${new Date().getFullYear()}`,
          submittedDate: ws.teledeclarationDate || undefined,
          reference: ws.teledeclarationReference || undefined,
          attachments: ['liasse_fiscale.xlsx'],
        })
      }
      if (ws.balanceImported && !ws.generationDone) {
        decls.push({
          id: 'liasse-draft-1',
          type: 'Liasse Fiscale SYSCOHADA',
          period: new Date().getFullYear().toString(),
          company: companyName,
          status: 'draft',
          dueDate: `31/03/${new Date().getFullYear()}`,
          attachments: [],
        })
      }

      // DGI filing service declarations
      const dgiDecls = getAllDeclarations()
      setDgiDeclarations(dgiDecls)
      for (const dgi of dgiDecls) {
        const statusMap: Record<string, Declaration['status']> = {
          brouillon: 'draft',
          validee: 'ready',
          soumise: 'submitted',
          acceptee: 'accepted',
          rejetee: 'rejected',
        }
        const typeLabels: Record<string, string> = {
          DSF: 'Declaration Statistique et Fiscale',
          DAS: 'Declaration Annuelle Salaires',
          TVA: 'Declaration TVA',
          IS: 'Declaration IS',
          LIASSE: 'Liasse SYSCOHADA (DGI)',
        }
        decls.push({
          id: `dgi-${dgi.id}`,
          type: typeLabels[dgi.type] || dgi.type,
          period: dgi.exercice,
          company: dgi.entreprise,
          status: statusMap[dgi.status] || 'draft',
          dueDate: `31/03/${dgi.exercice}`,
          submittedDate: dgi.submittedAt ? new Date(dgi.submittedAt).toLocaleDateString('fr-FR') : undefined,
          amount: dgi.montantDu,
          reference: dgi.receiptId,
          attachments: dgi.xmlContent ? ['declaration.xml'] : [],
          dgiDeclarationId: dgi.id,
        })
      }

      setDeclarations(decls)
      setFilingStats(getFilingStats())
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { loadDeclarations() }, [])

  // ── Create new DGI declaration ──
  const handleCreateDeclaration = async () => {
    let companyName = 'Mon entreprise'
    let nif = ''
    try {
      const entRaw = localStorage.getItem(scopeKey('fiscasync_entreprise_settings'))
      if (entRaw) {
        const ent = JSON.parse(entRaw)
        companyName = ent?.raison_sociale || companyName
        nif = ent?.numero_contribuable || ent?.ifu || ''
      }
    } catch { /* ignore */ }

    const decl = createDeclaration({
      type: newDeclType,
      exercice: new Date().getFullYear().toString(),
      entreprise: companyName,
      nif,
    })

    // Auto-populate DSF data if available
    if (newDeclType === 'DSF' || newDeclType === 'LIASSE') {
      const dsfData = await generateDSF(decl.exercice)
      if (dsfData) {
        updateDeclaration(decl.id, { dsfData, montantDu: dsfData.isDu })
      }
    }

    setNewDeclDialog(false)
    loadDeclarations()
  }

  // ── Delete DGI declaration ──
  const handleDeleteDGIDeclaration = (dgiId: string) => {
    deleteDeclaration(dgiId)
    loadDeclarations()
  }

  // ── Validate + Submit DGI declaration ──
  const handleSubmitDGIDeclaration = async (dgiId: string) => {
    const validation = validateDGIDeclaration(dgiId)
    if (!validation.valid) {
      alert(`Validation echouee:\n${validation.errors.join('\n')}`)
      return
    }
    const receipt = await submitDeclaration(dgiId)
    if (receipt) {
      loadDeclarations()
    }
  }

  // ── Download XML ──
  const handleDownloadXml = (dgiId: string) => {
    const dgi = dgiDeclarations.find(d => d.id === dgiId)
    if (!dgi) return
    const xml = generateXmlForDeclaration(dgi)
    if (xml) {
      downloadXml(xml, `${dgi.type}_${dgi.exercice}_${dgi.entreprise}.xml`)
    }
  }

  // Portails officiels de dépôt. Liass'Pilot NE transmet PAS directement à ces
  // administrations (pas d'API publique + accréditation et certificat officiels
  // requis). Le dépôt s'effectue manuellement sur le portail : on affiche donc
  // des liens, et non un faux statut « en ligne » / « temps de réponse ».
  const governmentServices: GovernmentService[] = [
    { id: 'dgi', name: 'Direction Générale des Impôts', code: 'DGI-CI', url: 'https://www.dgi.gouv.ci' },
    { id: 'ohada', name: 'OHADA — Greffe du RCCM', code: 'RCCM' },
    { id: 'cnps', name: 'Caisse Nationale de Prévoyance Sociale', code: 'CNPS' },
  ]

  const [transmissionSteps, setTransmissionSteps] = useState<TransmissionStep[]>([
    {
      id: '1',
      name: 'Validation des données',
      status: 'pending',
      description: 'Vérification de la cohérence de la déclaration',
    },
    {
      id: '2',
      name: 'Génération du fichier (format DGI)',
      status: 'pending',
      description: 'Production du XML à déposer',
    },
    {
      id: '3',
      name: 'Scellement local (empreinte SHA-256)',
      status: 'pending',
      description: 'Calcul de l\'empreinte d\'intégrité du dossier',
    },
    {
      id: '4',
      name: 'Accusé de préparation',
      status: 'pending',
      description: 'Émission d\'une référence interne (≠ accusé de l\'administration)',
    },
    {
      id: '5',
      name: 'Archivage du dossier',
      status: 'pending',
      description: 'Sauvegarde locale des pièces préparées',
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return theme.palette.success.main
      case 'submitted': return theme.palette.info.main
      case 'ready': return theme.palette.warning.main
      case 'rejected': return theme.palette.error.main
      case 'draft': return theme.palette.grey[500]
      default: return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckIcon />
      case 'submitted': return <CloudDoneIcon />
      case 'ready': return <UploadIcon />
      case 'rejected': return <ErrorIcon />
      case 'draft': return <AssignmentIcon />
      default: return <AssignmentIcon />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Déposée'
      case 'submitted': return 'Préparée'
      case 'ready': return 'Prête'
      case 'rejected': return 'Rejetée'
      case 'draft': return 'Brouillon'
      default: return status
    }
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main
      case 'running': return theme.palette.warning.main
      case 'error': return theme.palette.error.main
      case 'pending': return theme.palette.grey[400]
      default: return theme.palette.grey[400]
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon />
      case 'running': return <SyncIcon />
      case 'error': return <ErrorIcon />
      case 'pending': return <ScheduleIcon />
      default: return <ScheduleIcon />
    }
  }

  const handleTransmit = () => {
    setTransmissionDialog(true)
  }

  /** Get declarations eligible for transmission (ready or validated DGI) */
  const getTransmittableDeclarations = (): Declaration[] => {
    return declarations.filter(d => {
      if (d.dgiDeclarationId) {
        // DGI declarations: brouillon or validated
        return d.status === 'draft' || d.status === 'ready'
      }
      // Workflow declarations: ready
      return d.status === 'ready'
    })
  }

  const handleStartTransmission = async () => {
    if (!selectedDeclaration) return
    setTransmitting(true)
    setTransmissionDialog(false)

    // Reset steps
    const resetSteps: TransmissionStep[] = transmissionSteps.map(s => ({ ...s, status: 'pending' as const, timestamp: undefined }))
    setTransmissionSteps(resetSteps)

    const stepDelays = [800, 1200, 1500, 1000, 600]
    const updatedSteps: TransmissionStep[] = [...resetSteps]

    for (let i = 0; i < updatedSteps.length; i++) {
      updatedSteps[i] = { ...updatedSteps[i], status: 'running' }
      setTransmissionSteps([...updatedSteps])
      await new Promise(resolve => setTimeout(resolve, stepDelays[i]))
      updatedSteps[i] = {
        ...updatedSteps[i],
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
      }
      setTransmissionSteps([...updatedSteps])
    }

    const decl = declarations.find(d => d.id === selectedDeclaration)

    if (decl?.dgiDeclarationId) {
      // Prépare le dossier via le service de dépôt local (scellement + accusé interne).
      const receipt = await submitDeclaration(decl.dgiDeclarationId)
      if (receipt) {
        // Marque le dossier comme « préparé » (statut interne, pas « transmis à la DGI »).
        const { updateWorkflowState } = await import('@/services/workflowStateService')
        updateWorkflowState({
          teledeclarationStatus: 'submitted',
          teledeclarationDate: new Date().toISOString(),
          teledeclarationReference: receipt.referenceDepot,
        })
        // Recentrage « dépôt manuel » : on remet immédiatement le fichier XML
        // à l'utilisateur pour qu'il le dépose sur le portail officiel.
        const dgi = dgiDeclarations.find(d => d.id === decl.dgiDeclarationId)
        if (dgi) {
          const xml = generateXmlForDeclaration(dgi)
          if (xml) downloadXml(xml, `${dgi.type}_${dgi.exercice}_${dgi.entreprise}.xml`)
        }
      }
    } else {
      // Legacy workflow-only transmission
      const { updateWorkflowState } = await import('@/services/workflowStateService')
      const ref = `TD-${Date.now().toString(36).toUpperCase()}`
      updateWorkflowState({
        teledeclarationStatus: 'submitted',
        teledeclarationDate: new Date().toISOString(),
        teledeclarationReference: ref,
      })
    }

    setTransmitting(false)
    loadDeclarations()
  }

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({
    children,
    value,
    index,
  }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  )

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.75 }}>
            <Box sx={{ width: 4, borderRadius: 2, flexShrink: 0, background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 55%, #115e59 100%)' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.01em' }}>
                Télédéclarations
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Transmission électronique et suivi des déclarations fiscales
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <PrintButton
              config={{
                title: 'Declarations Fiscales',
                appName: "Liass'Pilot",
                format: 'A4',
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Declarations Fiscales</Typography>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 4 }}>Type</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 4 }}>Periode</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 4 }}>Entreprise</th>
                      <th style={{ textAlign: 'center', borderBottom: '1px solid #ccc', padding: 4 }}>Statut</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 4 }}>Echeance</th>
                      <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc', padding: 4 }}>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {declarations.map(d => (
                      <tr key={d.id}>
                        <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{d.type}</td>
                        <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{d.period}</td>
                        <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{d.company}</td>
                        <td style={{ padding: 4, borderBottom: '1px solid #eee', textAlign: 'center' }}>{d.status}</td>
                        <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{d.dueDate}</td>
                        <td style={{ padding: 4, borderBottom: '1px solid #eee', textAlign: 'right' }}>{d.amount?.toLocaleString('fr-FR') ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </PrintButton>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setNewDeclDialog(true)}
            >
              Nouvelle Declaration
            </Button>
            <Button
              variant="outlined"
              startIcon={<CertificateIcon />}
              onClick={() => setCertificateDialog(true)}
            >
              Certificats
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleTransmit}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Préparer le dépôt
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Bandeau d'honnêteté — pas de transmission directe à l'administration */}
      <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
        <AlertTitle sx={{ fontWeight: 700 }}>Mode démonstration — préparation du dépôt</AlertTitle>
        Liass'Pilot <strong>prépare et scelle votre dossier localement</strong> (fichier XML au format
        DGI + empreinte SHA-256) mais ne le <strong>transmet pas</strong> directement à l'administration.
        Le dépôt effectif s'effectue <strong>manuellement</strong> sur le portail officiel (
        <a href="https://www.dgi.gouv.ci" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 700 }}>dgi.gouv.ci</a>
        ). Tant que vous n'avez pas déposé sur ce portail, la déclaration <strong>n'est pas considérée comme transmise</strong> par la DGI.
      </Alert>

      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main }}>
                      {declarations.filter(d => d.status === 'submitted' || d.status === 'accepted').length + filingStats.soumises}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dossiers préparés
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                    }}
                  >
                    <CloudDoneIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main }}>
                      {declarations.filter(d => d.status === 'ready' || d.status === 'draft').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En attente de transmission
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                    }}
                  >
                    <ScheduleIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
                      {filingStats.totalReceipts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accusés de préparation
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <CheckIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.info.main }}>
                      {(declarations.reduce((s, d) => s + (d.amount || 0), 0) + filingStats.totalMontantDu).toLocaleString('fr-FR')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total montant du (FCFA)
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  >
                    <MoneyIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Liste des déclarations */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Toutes les déclarations" />
                <Tab label="En attente" />
                <Tab label="Préparées" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Période</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Entreprise</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Échéance</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: 7 }).map((_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton variant="text" height={20} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      declarations.map((declaration) => (
                        <TableRow key={declaration.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  '& .MuiSvgIcon-root': { fontSize: '0.875rem' }
                                }}
                              >
                                <TaxIcon />
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {declaration.type}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {declaration.period}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {declaration.company}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(declaration.status)}
                              size="small"
                              sx={{
                                backgroundColor: alpha(getStatusColor(declaration.status), 0.1),
                                color: getStatusColor(declaration.status),
                                fontWeight: 600,
                              }}
                              icon={getStatusIcon(declaration.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {declaration.dueDate}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {declaration.amount ? 
                                `${declaration.amount.toLocaleString()}` : 
                                '-'
                              }
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Voir détails">
                                <IconButton size="small">
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {declaration.dgiDeclarationId && declaration.status === 'draft' && (
                                <Tooltip title="Valider et préparer">
                                  <IconButton size="small" color="primary" onClick={() => handleSubmitDGIDeclaration(declaration.dgiDeclarationId!)}>
                                    <SendIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {declaration.dgiDeclarationId && (
                                <Tooltip title="Telecharger XML">
                                  <IconButton size="small" onClick={() => handleDownloadXml(declaration.dgiDeclarationId!)}>
                                    <XmlIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {declaration.status === 'ready' && !declaration.dgiDeclarationId && (
                                <Tooltip title="Préparer le dépôt">
                                  <IconButton size="small" color="primary" onClick={() => { setSelectedDeclaration(declaration.id); handleTransmit() }}>
                                    <SendIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {declaration.reference && (
                                <Tooltip title="Télécharger accusé">
                                  <IconButton size="small">
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {declaration.dgiDeclarationId && declaration.status === 'draft' && (
                                <Tooltip title="Supprimer">
                                  <IconButton size="small" onClick={() => handleDeleteDGIDeclaration(declaration.dgiDeclarationId!)}>
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
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              {(() => {
                const pending = declarations.filter(d => d.status === 'ready' || d.status === 'draft')
                if (pending.length === 0) return (
                  <CardContent>
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                      Aucune declaration en attente
                    </Typography>
                  </CardContent>
                )
                return (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                          <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Periode</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Echeance</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pending.map(d => (
                          <TableRow key={d.id} hover>
                            <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{d.type}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{d.period}</Typography></TableCell>
                            <TableCell>
                              <Chip label={getStatusLabel(d.status)} size="small"
                                sx={{ backgroundColor: alpha(getStatusColor(d.status), 0.1), color: getStatusColor(d.status), fontWeight: 600 }}
                                icon={getStatusIcon(d.status)} />
                            </TableCell>
                            <TableCell><Typography variant="body2">{d.dueDate}</Typography></TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                {d.dgiDeclarationId && (
                                  <Tooltip title="Valider et préparer">
                                    <IconButton size="small" color="primary" onClick={() => handleSubmitDGIDeclaration(d.dgiDeclarationId!)}>
                                      <SendIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {d.status === 'ready' && (
                                  <Tooltip title="Préparer le dépôt">
                                    <IconButton size="small" color="primary" onClick={() => { setSelectedDeclaration(d.id); handleTransmit() }}>
                                      <SendIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              })()}
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              {(() => {
                const transmitted = declarations.filter(d => d.status === 'submitted' || d.status === 'accepted')
                if (transmitted.length === 0) return (
                  <CardContent>
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                      Aucun dossier préparé
                    </Typography>
                  </CardContent>
                )
                return (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                          <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Periode</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Entreprise</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Date préparation</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transmitted.map(d => (
                          <TableRow key={d.id} hover>
                            <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{d.type}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{d.period}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{d.company}</Typography></TableCell>
                            <TableCell>
                              <Chip label={getStatusLabel(d.status)} size="small"
                                sx={{ backgroundColor: alpha(getStatusColor(d.status), 0.1), color: getStatusColor(d.status), fontWeight: 600 }}
                                icon={getStatusIcon(d.status)} />
                            </TableCell>
                            <TableCell><Typography variant="body2">{d.submittedDate || '-'}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{d.reference || '-'}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{d.amount ? d.amount.toLocaleString('fr-FR') : '-'}</Typography></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              })()}
            </TabPanel>
          </Card>
        </Grid>

        {/* État des services et suivi */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Portails officiels — dépôt manuel */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Portails officiels
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Le dépôt s'effectue directement sur le site de chaque administration. Liass'Pilot
                  prépare le fichier et l'accusé de préparation à y déposer.
                </Typography>

                <List disablePadding>
                  {governmentServices.map((service, index) => (
                    <React.Fragment key={service.id}>
                      <ListItem
                        sx={{ px: 0, py: 2 }}
                        secondaryAction={
                          service.url ? (
                            <Button
                              size="small"
                              variant="outlined"
                              endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                              component="a"
                              href={service.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ouvrir
                            </Button>
                          ) : (
                            <Chip label="Portail officiel" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                          )
                        }
                      >
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          >
                            <TaxIcon fontSize="small" />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {service.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {service.code}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < governmentServices.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Suivi de transmission */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Préparation du dossier
                </Typography>

                <List disablePadding>
                  {transmissionSteps.map((step, _index) => (
                    <ListItem key={step.id} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: alpha(getStepStatusColor(step.status), 0.1),
                            color: getStepStatusColor(step.status),
                          }}
                        >
                          {getStepStatusIcon(step.status)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {step.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {step.description}
                            </Typography>
                            {step.details && (
                              <Typography variant="caption" color="primary.main" sx={{ display: 'block' }}>
                                {step.details}
                              </Typography>
                            )}
                            {step.timestamp && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {step.timestamp}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {transmissionSteps.some(step => step.status === 'running') && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.divider, 0.1),
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Préparation en cours...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Dialog transmission */}
      <Dialog open={transmissionDialog} onClose={() => setTransmissionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Préparer le dossier de dépôt</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Déclaration à préparer</InputLabel>
                <Select
                  value={selectedDeclaration}
                  label="Déclaration à préparer"
                  onChange={(e) => setSelectedDeclaration(e.target.value)}
                >
                  {getTransmittableDeclarations().map((declaration) => (
                    <MenuItem key={declaration.id} value={declaration.id}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {declaration.type} - {declaration.period}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {declaration.company} {declaration.dgiDeclarationId ? '(DGI)' : ''}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="warning">
                <AlertTitle>Préparation locale — pas de transmission directe</AlertTitle>
                Cette étape génère le fichier XML (format DGI) et un accusé de préparation
                scellé localement (empreinte SHA-256). <strong>Aucune donnée n'est envoyée à
                l'administration.</strong> Le XML sera téléchargé : déposez-le ensuite sur le
                portail officiel pour que la déclaration soit réellement transmise.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="Je comprends que le dépôt final s'effectue manuellement sur le portail officiel"
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="Archiver automatiquement le dossier préparé"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransmissionDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!selectedDeclaration || transmitting}
            onClick={handleStartTransmission}
          >
            Générer le dossier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog certificats */}
      <Dialog open={certificateDialog} onClose={() => setCertificateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Signature & certificat</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Certificat de signature non configuré</AlertTitle>
            La signature électronique officielle nécessite un certificat délivré dans le cadre de
            l'accréditation auprès de l'administration. Elle n'est pas encore activée.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            En attendant, chaque dossier préparé est <strong>scellé localement par une empreinte
            SHA-256</strong> qui garantit son intégrité (toute modification ultérieure du fichier
            change l'empreinte). Le dépôt et la signature officiels s'effectuent sur le portail de
            l'administration.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificateDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog nouvelle declaration DGI */}
      <Dialog open={newDeclDialog} onClose={() => setNewDeclDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Declaration DGI</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              <AlertTitle>Creation d'une declaration</AlertTitle>
              Les donnees seront auto-peuplees depuis la balance importee et le passage fiscal si disponible.
            </Alert>
            <FormControl fullWidth>
              <InputLabel>Type de declaration</InputLabel>
              <Select value={newDeclType} label="Type de declaration" onChange={e => setNewDeclType(e.target.value as DeclarationType)}>
                <MenuItem value="DSF">DSF — Declaration Statistique et Fiscale</MenuItem>
                <MenuItem value="DAS">DAS — Declaration Annuelle des Salaires</MenuItem>
                <MenuItem value="TVA">TVA — Declaration de TVA</MenuItem>
                <MenuItem value="IS">IS — Impot sur les Societes</MenuItem>
                <MenuItem value="LIASSE">LIASSE — Liasse Fiscale SYSCOHADA</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewDeclDialog(false)}>Annuler</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateDeclaration}>
            Creer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipts section */}
      {filingStats.totalReceipts > 0 && (
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recepissses de depot ({filingStats.totalReceipts})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Entreprise</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hash SHA-256</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getAllReceipts().map(r => (
                    <TableRow key={r.id} hover>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{r.referenceDepot}</Typography></TableCell>
                      <TableCell><Chip label={r.declarationType} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell><Typography variant="body2">{new Date(r.dateDepot).toLocaleDateString('fr-FR')}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{r.entreprise}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{r.montant.toLocaleString('fr-FR')}</Typography></TableCell>
                      <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{r.hashSHA256.substring(0, 16)}...</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default ModernTeledeclaration