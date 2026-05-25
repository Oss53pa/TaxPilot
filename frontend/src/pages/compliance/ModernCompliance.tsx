/**
 * Module de Conformité Multi-juridictionnelle - Gestion multi-entités/pays
 * Conforme aux exigences section 2.2.6 du cahier des charges
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab'
import {
  Business as BusinessIcon,
  Update as UpdateIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Description as DocumentIcon,
  Assessment as ReportIcon,
  Sync as SyncIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Article as ArticleIcon,
  VerifiedUser as ComplianceIcon,
  Calculate as CalculateIcon,
  Schedule as ScheduleIcon,
  CompareArrows as CompareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment,
} from '@mui/icons-material'

interface Entity {
  id: string
  name: string
  type: 'parent' | 'subsidiary' | 'branch'
  country: string
  jurisdiction: string
  registrationNumber: string
  taxId: string
  currency: string
  status: 'active' | 'inactive' | 'pending'
  complianceScore: number
  lastAudit: string
}

interface Jurisdiction {
  id: string
  code: string
  name: string
  country: string
  flag: string
  taxSystem: string
  vatRate: number
  corporateTaxRate: number
  filingDeadlines: FilingDeadline[]
  regulations: Regulation[]
  lastUpdate: string
  complianceLevel: 'high' | 'medium' | 'low'
}

interface FilingDeadline {
  type: string
  frequency: string
  deadline: string
  penalty: string
}

interface Regulation {
  id: string
  code: string
  title: string
  category: 'tax' | 'accounting' | 'social' | 'environmental' | 'other'
  effectiveDate: string
  description: string
  impact: 'high' | 'medium' | 'low'
  status: 'active' | 'pending' | 'obsolete'
}

interface ComplianceIssue {
  id: string
  type: 'violation' | 'risk' | 'gap' | 'warning'
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  regulation: string
  deadline?: string
  penalty?: number
  status: 'open' | 'in_progress' | 'resolved'
}

interface RegulatoryUpdate {
  id: string
  jurisdictionId: string
  type: 'new' | 'amendment' | 'repeal'
  regulation: string
  description: string
  effectiveDate: string
  impact: string[]
  actionRequired: boolean
  status: 'pending_review' | 'reviewed' | 'implemented'
}

const ModernCompliance: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [entityDialogOpen, setEntityDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [])

  // Données multi-entités/multi-pays
  const entities: Entity[] = [
    {
      id: '1',
      name: 'Holding Principal SA',
      type: 'parent',
      country: 'CI',
      jurisdiction: 'Côte d\'Ivoire',
      registrationNumber: 'CI-ABJ-2020-A-12345',
      taxId: 'CI123456789',
      currency: 'XOF',
      status: 'active',
      complianceScore: 94,
      lastAudit: '2024-11-15'
    },
    {
      id: '2',
      name: 'Filiale Sénégal SARL',
      type: 'subsidiary',
      country: 'SN',
      jurisdiction: 'Sénégal',
      registrationNumber: 'SN-DKR-2021-B-54321',
      taxId: 'SN987654321',
      currency: 'XOF',
      status: 'active',
      complianceScore: 88,
      lastAudit: '2024-10-20'
    },
    {
      id: '3',
      name: 'Succursale Burkina',
      type: 'branch',
      country: 'BF',
      jurisdiction: 'Burkina Faso',
      registrationNumber: 'BF-OUA-2022-C-11111',
      taxId: 'BF111222333',
      currency: 'XOF',
      status: 'active',
      complianceScore: 91,
      lastAudit: '2024-09-10'
    },
    {
      id: '4',
      name: 'Filiale France SAS',
      type: 'subsidiary',
      country: 'FR',
      jurisdiction: 'France',
      registrationNumber: 'FR-75-2023-D-99999',
      taxId: 'FR99988877766',
      currency: 'EUR',
      status: 'active',
      complianceScore: 96,
      lastAudit: '2024-12-01'
    }
  ]

  const jurisdictions: Jurisdiction[] = [
    {
      id: '1',
      code: 'CI',
      name: 'Côte d\'Ivoire',
      country: 'Côte d\'Ivoire',
      flag: '🇨🇮',
      taxSystem: 'SYSCOHADA',
      vatRate: 18,
      corporateTaxRate: 25,
      filingDeadlines: [
        { type: 'TVA', frequency: 'Mensuelle', deadline: '15 du mois', penalty: '10% + intérêts' },
        { type: 'IS', frequency: 'Annuelle', deadline: '30 avril', penalty: '5% par mois' }
      ],
      regulations: [],
      lastUpdate: '2024-12-01',
      complianceLevel: 'high'
    },
    {
      id: '2',
      code: 'SN',
      name: 'Sénégal',
      country: 'Sénégal',
      flag: '🇸🇳',
      taxSystem: 'SYSCOHADA',
      vatRate: 18,
      corporateTaxRate: 30,
      filingDeadlines: [
        { type: 'TVA', frequency: 'Mensuelle', deadline: '15 du mois', penalty: '0.5% par jour' },
        { type: 'IS', frequency: 'Annuelle', deadline: '30 avril', penalty: '25% majoration' }
      ],
      regulations: [],
      lastUpdate: '2024-11-28',
      complianceLevel: 'high'
    },
    {
      id: '3',
      code: 'BF',
      name: 'Burkina Faso',
      country: 'Burkina Faso',
      flag: '🇧🇫',
      taxSystem: 'SYSCOHADA',
      vatRate: 18,
      corporateTaxRate: 27.5,
      filingDeadlines: [
        { type: 'TVA', frequency: 'Mensuelle', deadline: '20 du mois', penalty: '10% + 2% par mois' }
      ],
      regulations: [],
      lastUpdate: '2024-11-15',
      complianceLevel: 'medium'
    },
    {
      id: '4',
      code: 'FR',
      name: 'France',
      country: 'France',
      flag: '🇫🇷',
      taxSystem: 'EU/IFRS',
      vatRate: 20,
      corporateTaxRate: 25,
      filingDeadlines: [
        { type: 'TVA', frequency: 'Mensuelle', deadline: 'Variable', penalty: '0.4% par mois' },
        { type: 'IS', frequency: 'Annuelle', deadline: '15 mai', penalty: '5% majoration' }
      ],
      regulations: [],
      lastUpdate: '2024-12-10',
      complianceLevel: 'high'
    }
  ]

  const regulations: Regulation[] = [
    {
      id: '1',
      code: 'OHADA-2024-001',
      title: 'Nouveau Plan Comptable SYSCOHADA Révisé',
      category: 'accounting',
      effectiveDate: '2025-01-01',
      description: 'Mise à jour majeure du plan comptable avec nouvelles subdivisions',
      impact: 'high',
      status: 'pending'
    },
    {
      id: '2',
      code: 'CI-FIS-2024-15',
      title: 'Modification taux TVA secteur numérique',
      category: 'tax',
      effectiveDate: '2025-03-01',
      description: 'TVA réduite à 10% pour les services numériques',
      impact: 'medium',
      status: 'pending'
    },
    {
      id: '3',
      code: 'EU-2024-CSRD',
      title: 'Directive CSRD - Reporting durabilité',
      category: 'environmental',
      effectiveDate: '2025-01-01',
      description: 'Nouveau reporting ESG obligatoire pour les grandes entreprises',
      impact: 'high',
      status: 'active'
    }
  ]

  const complianceIssues: ComplianceIssue[] = [
    {
      id: '1',
      type: 'risk',
      severity: 'high',
      description: 'Risque de non-conformité TVA transfrontalière',
      regulation: 'UEMOA-TVA-2024',
      deadline: '2025-01-31',
      penalty: 500000,
      status: 'open'
    },
    {
      id: '2',
      type: 'gap',
      severity: 'medium',
      description: 'Documentation prix de transfert incomplète',
      regulation: 'BEPS-Action-13',
      status: 'in_progress'
    },
    {
      id: '3',
      type: 'warning',
      severity: 'low',
      description: 'Mise à jour nécessaire des statuts sociaux',
      regulation: 'OHADA-Acte-Uniforme',
      deadline: '2025-06-30',
      status: 'open'
    }
  ]

  void regulations;

  const regulatoryUpdates: RegulatoryUpdate[] = [
    {
      id: '1',
      jurisdictionId: '1',
      type: 'new',
      regulation: 'Loi de finances 2025',
      description: 'Nouvelles dispositions fiscales incluant crédit d\'impôt innovation',
      effectiveDate: '2025-01-01',
      impact: ['Réduction IS possible', 'Nouvelles obligations déclaratives'],
      actionRequired: true,
      status: 'pending_review'
    },
    {
      id: '2',
      jurisdictionId: '4',
      type: 'amendment',
      regulation: 'Code général des impôts',
      description: 'Modification des seuils de TVA intracommunautaire',
      effectiveDate: '2025-07-01',
      impact: ['Changement de régime TVA possible'],
      actionRequired: false,
      status: 'reviewed'
    }
  ]

  const getComplianceColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main
    if (score >= 70) return theme.palette.warning.main
    return theme.palette.error.main
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main
      case 'high': return theme.palette.warning.main
      case 'medium': return theme.palette.info.main
      case 'low': return theme.palette.grey[500]
      default: return theme.palette.grey[500]
    }
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
                Conformité Multi-juridictionnelle
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestion de la conformité pour {entities.length} entités dans {jurisdictions.length} juridictions
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                />
              }
              label="Mises à jour auto"
            />
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
            >
              Synchroniser
            </Button>
            <Button
              variant="contained"
              startIcon={<ReportIcon />}
              onClick={() => setReportDialogOpen(true)}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Rapport consolidé
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Métriques globales */}
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
                      92%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Score global conformité
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                    }}
                  >
                    <ComplianceIcon />
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
                      {entities.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Entités gérées
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <BusinessIcon />
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
                      {complianceIssues.filter(i => i.status === 'open').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Problèmes ouverts
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                    }}
                  >
                    <WarningIcon />
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
                      {regulatoryUpdates.filter(u => u.status === 'pending_review').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mises à jour en attente
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  >
                    <UpdateIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contenu principal */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Vue d'ensemble" />
                <Tab label="Par juridiction" />
                <Tab label="Règlementations" />
                <Tab label="Rapports" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              {/* Vue d'ensemble multi-entités */}
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tableau de bord multi-entités
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<BusinessIcon />}
                    onClick={() => setEntityDialogOpen(true)}
                  >
                    Ajouter entité
                  </Button>
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Entité</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Juridiction</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Score conformité</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Dernier audit</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                          <TableRow key={index}>
                            {Array.from({ length: 6 }).map((_, cellIndex) => (
                              <TableCell key={cellIndex}>
                                <Skeleton variant="text" height={20} />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        entities.map((entity) => (
                          <TableRow key={entity.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    backgroundColor: alpha(
                                      entity.type === 'parent' ? theme.palette.primary.main :
                                      entity.type === 'subsidiary' ? theme.palette.success.main :
                                      theme.palette.info.main,
                                      0.1
                                    ),
                                    color: entity.type === 'parent' ? theme.palette.primary.main :
                                           entity.type === 'subsidiary' ? theme.palette.success.main :
                                           theme.palette.info.main,
                                  }}
                                >
                                  <BusinessIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {entity.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {entity.registrationNumber}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>{jurisdictions.find(j => j.code === entity.country)?.flag}</span>
                                {entity.jurisdiction}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  entity.type === 'parent' ? 'Société mère' :
                                  entity.type === 'subsidiary' ? 'Filiale' : 'Succursale'
                                }
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={entity.complianceScore}
                                  sx={{
                                    width: 60,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: alpha(theme.palette.divider, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: getComplianceColor(entity.complianceScore),
                                    },
                                  }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: getComplianceColor(entity.complianceScore) }}>
                                  {entity.complianceScore}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(entity.lastAudit).toLocaleDateString('fr-FR')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Voir détails">
                                  <IconButton size="small">
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Rapport">
                                  <IconButton size="small" color="primary">
                                    <ReportIcon fontSize="small" />
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

                {/* Matrice de conformité */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Matrice de conformité croisée
                  </Typography>
                  
                  <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                    <Grid container spacing={2}>
                      {entities.map((entity) => (
                        <Grid item xs={12} sm={6} key={entity.id}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              {entity.name}
                            </Typography>
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption">Conformité fiscale</Typography>
                                <Chip label="95%" size="small" color="success" />
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption">Conformité sociale</Typography>
                                <Chip label="88%" size="small" color="warning" />
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption">Conformité comptable</Typography>
                                <Chip label="92%" size="small" color="success" />
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Box>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              {/* Règles fiscales par juridiction */}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Règles fiscales et réglementaires par pays
                </Typography>

                {jurisdictions.map((jurisdiction) => (
                  <Accordion key={jurisdiction.id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <span style={{ fontSize: '1.5rem' }}>{jurisdiction.flag}</span>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {jurisdiction.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Système: {jurisdiction.taxSystem} • TVA: {jurisdiction.vatRate}% • IS: {jurisdiction.corporateTaxRate}%
                          </Typography>
                        </Box>
                        <Chip
                          label={jurisdiction.complianceLevel === 'high' ? 'Haute' : 
                                 jurisdiction.complianceLevel === 'medium' ? 'Moyenne' : 'Faible'}
                          size="small"
                          color={jurisdiction.complianceLevel === 'high' ? 'success' : 
                                 jurisdiction.complianceLevel === 'medium' ? 'warning' : 'error'}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            Échéances fiscales
                          </Typography>
                          <List dense>
                            {jurisdiction.filingDeadlines.map((deadline, index) => (
                              <ListItem key={index} sx={{ px: 0 }}>
                                <ListItemIcon>
                                  <ScheduleIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`${deadline.type} - ${deadline.frequency}`}
                                  secondary={`Échéance: ${deadline.deadline} • Pénalité: ${deadline.penalty}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            Informations clés
                          </Typography>
                          <Stack spacing={1}>
                            <Typography variant="body2">
                              <strong>Système fiscal:</strong> {jurisdiction.taxSystem}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Dernière mise à jour:</strong> {new Date(jurisdiction.lastUpdate).toLocaleDateString('fr-FR')}
                            </Typography>
                            <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
                              Guide fiscal {jurisdiction.code}
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              {/* Mises à jour réglementaires */}
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Veille réglementaire automatique
                  </Typography>
                  <Chip
                    icon={<UpdateIcon />}
                    label="Dernière sync: il y a 2h"
                    size="small"
                    color="primary"
                  />
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Mises à jour automatiques activées</AlertTitle>
                  Le système surveille en permanence les changements réglementaires dans toutes vos juridictions.
                </Alert>

                <Timeline>
                  {regulatoryUpdates.map((update) => (
                    <TimelineItem key={update.id}>
                      <TimelineSeparator>
                        <TimelineDot
                          color={update.type === 'new' ? 'primary' : 
                                 update.type === 'amendment' ? 'warning' : 'error'}
                        >
                          {update.type === 'new' ? <ArticleIcon /> :
                           update.type === 'amendment' ? <EditIcon /> : <DeleteIcon />}
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper sx={{ p: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {update.regulation}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {jurisdictions.find(j => j.id === update.jurisdictionId)?.name} • 
                                Effectif le {new Date(update.effectiveDate).toLocaleDateString('fr-FR')}
                              </Typography>
                            </Box>
                            {update.actionRequired && (
                              <Chip label="Action requise" size="small" color="error" />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {update.description}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              Impact:
                            </Typography>
                            <List dense>
                              {update.impact.map((impact, index) => (
                                <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                                  <ListItemText
                                    primary={
                                      <Typography variant="caption">
                                        • {impact}
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined">
                              Voir détails
                            </Button>
                            {update.status === 'pending_review' && (
                              <Button size="small" variant="contained" color="primary">
                                Marquer comme lu
                              </Button>
                            )}
                          </Stack>
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              {/* Rapports de conformité consolidés */}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Rapports de conformité consolidés
                </Typography>

                <Stack spacing={3}>
                  <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.success.main, 0.02) }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Rapport Q4 2024 - Groupe consolidé
                      </Typography>
                      <Chip label="Généré" size="small" color="success" />
                    </Box>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                            92%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Score global
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                            3
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Problèmes identifiés
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                            12
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Recommandations
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" spacing={2}>
                      <Button variant="outlined" startIcon={<DownloadIcon />}>
                        Télécharger PDF
                      </Button>
                      <Button variant="outlined" startIcon={<CompareIcon />}>
                        Comparer périodes
                      </Button>
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Historique des rapports
                    </Typography>
                    <List>
                      {['Q3 2024', 'Q2 2024', 'Q1 2024'].map((period) => (
                        <ListItem key={period} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <DocumentIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Rapport ${period}`}
                            secondary="Généré le 15 du mois suivant"
                          />
                          <ListItemSecondaryAction>
                            <IconButton size="small">
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Stack>
              </CardContent>
            </TabPanel>
          </Card>
        </Grid>

        {/* Panneau latéral */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Problèmes de conformité */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Problèmes actifs
                  </Typography>
                  <Badge badgeContent={complianceIssues.filter(i => i.status === 'open').length} color="error">
                    <WarningIcon />
                  </Badge>
                </Box>

                <List disablePadding>
                  {complianceIssues.map((issue, index) => (
                    <React.Fragment key={issue.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: alpha(getSeverityColor(issue.severity), 0.1),
                              color: getSeverityColor(issue.severity),
                            }}
                          >
                            {issue.type === 'violation' ? <ErrorIcon fontSize="small" /> :
                             issue.type === 'risk' ? <WarningIcon fontSize="small" /> :
                             issue.type === 'gap' ? <InfoIcon fontSize="small" /> :
                             <WarningIcon fontSize="small" />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {issue.description}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {issue.regulation}
                              </Typography>
                              {issue.deadline && (
                                <Typography variant="caption" color="error.main" sx={{ display: 'block' }}>
                                  Échéance: {new Date(issue.deadline).toLocaleDateString('fr-FR')}
                                </Typography>
                              )}
                              {issue.penalty && (
                                <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>
                                  Pénalité potentielle: {issue.penalty.toLocaleString()}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < complianceIssues.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  startIcon={<Assessment />}
                >
                  Plan d'action
                </Button>
              </CardContent>
            </Card>

            {/* Comparaison multi-juridictions */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Analyse comparative
                </Typography>

                <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02), mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Taux d'imposition effectifs
                  </Typography>
                  <Stack spacing={1}>
                    {jurisdictions.map((jurisdiction) => (
                      <Box key={jurisdiction.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{jurisdiction.flag}</span>
                          <Typography variant="caption">{jurisdiction.code}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {jurisdiction.corporateTaxRate}%
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CalculateIcon />}
                >
                  Optimisation fiscale
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Dialog nouvelle entité */}
      <Dialog open={entityDialogOpen} onClose={() => setEntityDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter une nouvelle entité</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'entité"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type d'entité</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="parent">Société mère</MenuItem>
                  <MenuItem value="subsidiary">Filiale</MenuItem>
                  <MenuItem value="branch">Succursale</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Juridiction</InputLabel>
                <Select defaultValue="">
                  {jurisdictions.map((jurisdiction) => (
                    <MenuItem key={jurisdiction.id} value={jurisdiction.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{jurisdiction.flag}</span>
                        {jurisdiction.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Numéro d'immatriculation"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Identifiant fiscal"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEntityDialogOpen(false)}>
            Annuler
          </Button>
          <Button variant="contained">
            Ajouter l'entité
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog rapport consolidé */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Générer rapport de conformité consolidé</DialogTitle>
        <DialogContent>
          <Stepper activeStep={0} orientation="vertical">
            <Step>
              <StepLabel>Sélection des entités</StepLabel>
            </Step>
            <Step>
              <StepLabel>Période et paramètres</StepLabel>
            </Step>
            <Step>
              <StepLabel>Génération et export</StepLabel>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>
            Annuler
          </Button>
          <Button variant="contained">
            Générer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModernCompliance