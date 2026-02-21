import { logger } from '@/utils/logger'
/**
 * Module Export vers Templates - Gestion avancée des modèles d'export
 * Conforme aux exigences EX-EXPORT-001 à EX-EXPORT-010
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
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle,
  LinearProgress,
  Divider,
  Stack,
  Avatar,
  Tooltip,
  FormControlLabel,
  Checkbox,
  FormGroup,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material'
import {
  Description as DocIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Article as WordIcon,
  Code as XmlIcon,
  DataObject as JsonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as PreviewIcon,
  GetApp as DownloadIcon,
  Schedule as ScheduleIcon,
  PlayArrow as RunIcon,
  DragIndicator as DragIcon,
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  Assessment as ReportIcon,
  Functions as FormulaIcon,
  FilterList as ConditionIcon,
  Palette as FormatIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  CloudDownload as CloudDownloadIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

interface Template {
  id: string
  name: string
  description: string
  category: 'syscohada' | 'ifrs' | 'bank' | 'management' | 'custom'
  format: 'excel' | 'word' | 'pdf' | 'xml' | 'json'
  type: 'official' | 'enterprise' | 'personal'
  version: string
  lastModified: string
  author: string
  size: string
  tags: string[]
  variables: TemplateVariable[]
  conditions: TemplateCondition[]
  status: 'active' | 'draft' | 'archived'
  usage: number
}

interface TemplateVariable {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'list' | 'table'
  source: string
  format?: string
  defaultValue?: any
}

interface TemplateCondition {
  id: string
  name: string
  condition: string
  thenAction: string
  elseAction?: string
}

interface ExportJob {
  id: string
  templateId: string
  templateName: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  startTime: string
  endTime?: string
  outputFile?: string
  error?: string
  scheduled?: boolean
  schedulePattern?: string
}

const ModernTemplates: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [batchMode, setBatchMode] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Templates préconçus conformes aux exigences
  const templates: Template[] = [
    {
      id: '1',
      name: 'Liasse Fiscale SYSCOHADA Complète',
      description: 'Modèle officiel de liasse fiscale conforme SYSCOHADA avec tous les tableaux',
      category: 'syscohada',
      format: 'excel',
      type: 'official',
      version: '2024.1',
      lastModified: '2024-12-01',
      author: 'OHADA',
      size: '2.4 MB',
      tags: ['fiscal', 'officiel', 'syscohada', 'complet'],
      variables: [
        { id: 'v1', name: 'exercice', type: 'date', source: 'params.exercice' },
        { id: 'v2', name: 'company_name', type: 'text', source: 'company.name' },
        { id: 'v3', name: 'balance_data', type: 'table', source: 'balance.accounts' }
      ],
      conditions: [
        { id: 'c1', name: 'check_regime', condition: 'regime == "normal"', thenAction: 'include_all_tables' }
      ],
      status: 'active',
      usage: 156
    },
    {
      id: '2',
      name: 'États Financiers IFRS',
      description: 'Modèle conforme aux normes IFRS internationales',
      category: 'ifrs',
      format: 'excel',
      type: 'official',
      version: '2024.2',
      lastModified: '2024-11-28',
      author: 'IASB',
      size: '1.8 MB',
      tags: ['ifrs', 'international', 'consolidation'],
      variables: [],
      conditions: [],
      status: 'active',
      usage: 89
    },
    {
      id: '3',
      name: 'Dossier de Crédit Bancaire',
      description: 'Format standard pour demande de financement bancaire',
      category: 'bank',
      format: 'pdf',
      type: 'enterprise',
      version: '3.2',
      lastModified: '2024-12-10',
      author: 'Finance Team',
      size: '850 KB',
      tags: ['banque', 'crédit', 'financement'],
      variables: [],
      conditions: [],
      status: 'active',
      usage: 45
    },
    {
      id: '4',
      name: 'Tableau de Bord Excel Dynamique',
      description: 'Dashboard avec graphiques et KPIs automatisés',
      category: 'management',
      format: 'excel',
      type: 'enterprise',
      version: '2.5',
      lastModified: '2024-12-05',
      author: 'Contrôle de Gestion',
      size: '3.1 MB',
      tags: ['dashboard', 'kpi', 'graphiques', 'dynamique'],
      variables: [],
      conditions: [],
      status: 'active',
      usage: 234
    },
    {
      id: '5',
      name: 'Rapport Mensuel PowerPoint',
      description: 'Présentation automatisée avec données financières',
      category: 'management',
      format: 'pdf',
      type: 'personal',
      version: '1.0',
      lastModified: '2024-12-12',
      author: 'Direction',
      size: '1.2 MB',
      tags: ['présentation', 'mensuel', 'direction'],
      variables: [],
      conditions: [],
      status: 'draft',
      usage: 12
    }
  ]

  const exportJobs: ExportJob[] = [
    {
      id: '1',
      templateId: '1',
      templateName: 'Liasse Fiscale SYSCOHADA',
      status: 'completed',
      progress: 100,
      startTime: '2024-12-16 14:30',
      endTime: '2024-12-16 14:32',
      outputFile: 'liasse_2024_final.xlsx',
      scheduled: false
    },
    {
      id: '2',
      templateId: '4',
      templateName: 'Tableau de Bord Excel',
      status: 'processing',
      progress: 65,
      startTime: '2024-12-16 15:45',
      scheduled: true,
      schedulePattern: 'Tous les lundis à 9h00'
    },
    {
      id: '3',
      templateId: '2',
      templateName: 'États Financiers IFRS',
      status: 'error',
      progress: 0,
      startTime: '2024-12-16 13:20',
      error: 'Données source manquantes',
      scheduled: false
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'syscohada': return <BankIcon />
      case 'ifrs': return <BusinessIcon />
      case 'bank': return <BankIcon />
      case 'management': return <ReportIcon />
      case 'custom': return <SettingsIcon />
      default: return <DocIcon />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'syscohada': return theme.palette.primary.main
      case 'ifrs': return theme.palette.info.main
      case 'bank': return theme.palette.success.main
      case 'management': return theme.palette.warning.main
      case 'custom': return theme.palette.secondary.main
      default: return theme.palette.grey[500]
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'excel': return <ExcelIcon />
      case 'word': return <WordIcon />
      case 'pdf': return <PdfIcon />
      case 'xml': return <XmlIcon />
      case 'json': return <JsonIcon />
      default: return <DocIcon />
    }
  }

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'excel': return '#22c55e'
      case 'word': return '#3b82f6'
      case 'pdf': return '#ef4444'
      case 'xml': return '#f59e0b'
      case 'json': return P.primary900
      default: return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon />
      case 'processing': return <ScheduleIcon />
      case 'error': return <ErrorIcon />
      case 'pending': return <ScheduleIcon />
      default: return <ScheduleIcon />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main
      case 'processing': return theme.palette.warning.main
      case 'error': return theme.palette.error.main
      case 'pending': return theme.palette.info.main
      default: return theme.palette.grey[500]
    }
  }

  const handleExport = () => {
    // Simuler l'export avec préservation des formules Excel (EX-EXPORT-002)
    logger.debug('Export avec préservation des formules')
    setExportDialogOpen(false)
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
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Templates & Export
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestion des modèles d'export multi-formats avec mapping dynamique
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            {batchMode && (
              <Chip
                label={`${selectedTemplates.length} sélectionnés`}
                color="primary"
                onDelete={() => {
                  setBatchMode(false)
                  setSelectedTemplates([])
                }}
              />
            )}
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
            >
              Importer
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={() => setBatchMode(!batchMode)}
            >
              {batchMode ? 'Mode simple' : 'Mode batch'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setEditorOpen(true)}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Créer template
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
                      {templates.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Templates disponibles
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <DocIcon />
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
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main }}>
                      536
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Exports réussis
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                    }}
                  >
                    <CloudDownloadIcon />
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
                      12
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Exports programmés
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
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.info.main }}>
                      {"< 10s"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Temps moyen d'export
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  >
                    <RunIcon />
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
                <Tab label="Tous les templates" />
                <Tab label="SYSCOHADA" />
                <Tab label="IFRS" />
                <Tab label="Personnalisés" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Rechercher un template..."
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: '🔍',
                    }}
                  />
                </Box>

                <List>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={100} />
                      </Box>
                    ))
                  ) : (
                    templates.map((template, index) => (
                      <React.Fragment key={template.id}>
                        <ListItem
                          sx={{
                            py: 2,
                            px: 0,
                            backgroundColor: selectedTemplates.includes(template.id) 
                              ? alpha(theme.palette.primary.main, 0.05) 
                              : 'transparent',
                            borderRadius: 1,
                          }}
                        >
                          {batchMode && (
                            <Checkbox
                              checked={selectedTemplates.includes(template.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTemplates([...selectedTemplates, template.id])
                                } else {
                                  setSelectedTemplates(selectedTemplates.filter(id => id !== template.id))
                                }
                              }}
                              sx={{ mr: 2 }}
                            />
                          )}
                          <ListItemIcon>
                            <Avatar
                              sx={{
                                backgroundColor: alpha(getCategoryColor(template.category), 0.1),
                                color: getCategoryColor(template.category),
                                width: 48,
                                height: 48,
                              }}
                            >
                              {getCategoryIcon(template.category)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {template.name}
                                </Typography>
                                <Chip
                                  label={template.type === 'official' ? 'Officiel' : 
                                         template.type === 'enterprise' ? 'Entreprise' : 'Personnel'}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(
                                      template.type === 'official' ? theme.palette.success.main :
                                      template.type === 'enterprise' ? theme.palette.info.main :
                                      theme.palette.grey[500],
                                      0.1
                                    ),
                                    color: template.type === 'official' ? theme.palette.success.main :
                                           template.type === 'enterprise' ? theme.palette.info.main :
                                           theme.palette.grey[500],
                                  }}
                                />
                                <Avatar
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    backgroundColor: alpha(getFormatColor(template.format), 0.1),
                                    color: getFormatColor(template.format),
                                  }}
                                >
                                  {getFormatIcon(template.format)}
                                </Avatar>
                                <Typography variant="caption" color="text.secondary">
                                  v{template.version}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {template.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Par {template.author}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {template.size}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Utilisé {template.usage} fois
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Modifié le {template.lastModified}
                                  </Typography>
                                </Box>
                                {template.tags.length > 0 && (
                                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                    {template.tags.map((tag) => (
                                      <Chip
                                        key={tag}
                                        label={tag}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.75rem' }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Aperçu">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedTemplate(template)
                                    setPreviewOpen(true)
                                  }}
                                >
                                  <PreviewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Éditer">
                                <IconButton size="small">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Exporter">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setSelectedTemplate(template)
                                    setExportDialogOpen(true)
                                  }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < templates.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  )}
                </List>

                {batchMode && selectedTemplates.length > 0 && (
                  <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Actions batch ({selectedTemplates.length} templates)
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<DownloadIcon />}
                      >
                        Exporter tous
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ScheduleIcon />}
                      >
                        Programmer
                      </Button>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <CardContent sx={{ p: 3 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Templates SYSCOHADA</AlertTitle>
                  Modèles officiels conformes aux normes OHADA pour tous les pays membres.
                </Alert>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Rechercher dans les templates SYSCOHADA..."
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: '🔍',
                    }}
                  />
                </Box>

                <List>
                  {loading ? (
                    Array.from({ length: 2 }).map((_, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={100} />
                      </Box>
                    ))
                  ) : (
                    templates
                      .filter(t => t.category === 'syscohada')
                      .map((template, index, filtered) => (
                        <React.Fragment key={template.id}>
                          <ListItem
                            sx={{
                              py: 2,
                              px: 0,
                              backgroundColor: selectedTemplates.includes(template.id)
                                ? alpha(theme.palette.primary.main, 0.05)
                                : 'transparent',
                              borderRadius: 1,
                            }}
                          >
                            {batchMode && (
                              <Checkbox
                                checked={selectedTemplates.includes(template.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTemplates([...selectedTemplates, template.id])
                                  } else {
                                    setSelectedTemplates(selectedTemplates.filter(id => id !== template.id))
                                  }
                                }}
                                sx={{ mr: 2 }}
                              />
                            )}
                            <ListItemIcon>
                              <Avatar
                                sx={{
                                  backgroundColor: alpha(getCategoryColor(template.category), 0.1),
                                  color: getCategoryColor(template.category),
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                {getCategoryIcon(template.category)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {template.name}
                                  </Typography>
                                  <Chip
                                    label={template.type === 'official' ? 'Officiel' :
                                           template.type === 'enterprise' ? 'Entreprise' : 'Personnel'}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(
                                        template.type === 'official' ? theme.palette.success.main :
                                        template.type === 'enterprise' ? theme.palette.info.main :
                                        theme.palette.grey[500],
                                        0.1
                                      ),
                                      color: template.type === 'official' ? theme.palette.success.main :
                                             template.type === 'enterprise' ? theme.palette.info.main :
                                             theme.palette.grey[500],
                                    }}
                                  />
                                  <Avatar
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      backgroundColor: alpha(getFormatColor(template.format), 0.1),
                                      color: getFormatColor(template.format),
                                    }}
                                  >
                                    {getFormatIcon(template.format)}
                                  </Avatar>
                                  <Typography variant="caption" color="text.secondary">
                                    v{template.version}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {template.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Par {template.author}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {template.size}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Utilisé {template.usage} fois
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Modifié le {template.lastModified}
                                    </Typography>
                                  </Box>
                                  {template.tags.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                      {template.tags.map((tag) => (
                                        <Chip
                                          key={tag}
                                          label={tag}
                                          size="small"
                                          variant="outlined"
                                          sx={{ height: 20, fontSize: '0.75rem' }}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Aperçu">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedTemplate(template)
                                      setPreviewOpen(true)
                                    }}
                                  >
                                    <PreviewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Éditer">
                                  <IconButton size="small">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Exporter">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => {
                                      setSelectedTemplate(template)
                                      setExportDialogOpen(true)
                                    }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < filtered.length - 1 && <Divider />}
                        </React.Fragment>
                      ))
                  )}
                </List>

                {!loading && templates.filter(t => t.category === 'syscohada').length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucun template SYSCOHADA disponible
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => setEditorOpen(true)}
                    >
                      Créer un template
                    </Button>
                  </Box>
                )}
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <CardContent sx={{ p: 3 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Templates IFRS</AlertTitle>
                  Modèles conformes aux normes internationales IFRS.
                </Alert>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Rechercher dans les templates IFRS..."
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: '🔍',
                    }}
                  />
                </Box>

                <List>
                  {loading ? (
                    Array.from({ length: 2 }).map((_, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={100} />
                      </Box>
                    ))
                  ) : (
                    templates
                      .filter(t => t.category === 'ifrs')
                      .map((template, index, filtered) => (
                        <React.Fragment key={template.id}>
                          <ListItem
                            sx={{
                              py: 2,
                              px: 0,
                              backgroundColor: selectedTemplates.includes(template.id)
                                ? alpha(theme.palette.primary.main, 0.05)
                                : 'transparent',
                              borderRadius: 1,
                            }}
                          >
                            {batchMode && (
                              <Checkbox
                                checked={selectedTemplates.includes(template.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTemplates([...selectedTemplates, template.id])
                                  } else {
                                    setSelectedTemplates(selectedTemplates.filter(id => id !== template.id))
                                  }
                                }}
                                sx={{ mr: 2 }}
                              />
                            )}
                            <ListItemIcon>
                              <Avatar
                                sx={{
                                  backgroundColor: alpha(getCategoryColor(template.category), 0.1),
                                  color: getCategoryColor(template.category),
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                {getCategoryIcon(template.category)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {template.name}
                                  </Typography>
                                  <Chip
                                    label={template.type === 'official' ? 'Officiel' :
                                           template.type === 'enterprise' ? 'Entreprise' : 'Personnel'}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(
                                        template.type === 'official' ? theme.palette.success.main :
                                        template.type === 'enterprise' ? theme.palette.info.main :
                                        theme.palette.grey[500],
                                        0.1
                                      ),
                                      color: template.type === 'official' ? theme.palette.success.main :
                                             template.type === 'enterprise' ? theme.palette.info.main :
                                             theme.palette.grey[500],
                                    }}
                                  />
                                  <Avatar
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      backgroundColor: alpha(getFormatColor(template.format), 0.1),
                                      color: getFormatColor(template.format),
                                    }}
                                  >
                                    {getFormatIcon(template.format)}
                                  </Avatar>
                                  <Typography variant="caption" color="text.secondary">
                                    v{template.version}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {template.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Par {template.author}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {template.size}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Utilisé {template.usage} fois
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Modifié le {template.lastModified}
                                    </Typography>
                                  </Box>
                                  {template.tags.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                      {template.tags.map((tag) => (
                                        <Chip
                                          key={tag}
                                          label={tag}
                                          size="small"
                                          variant="outlined"
                                          sx={{ height: 20, fontSize: '0.75rem' }}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Aperçu">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedTemplate(template)
                                      setPreviewOpen(true)
                                    }}
                                  >
                                    <PreviewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Éditer">
                                  <IconButton size="small">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Exporter">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => {
                                      setSelectedTemplate(template)
                                      setExportDialogOpen(true)
                                    }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < filtered.length - 1 && <Divider />}
                        </React.Fragment>
                      ))
                  )}
                </List>

                {!loading && templates.filter(t => t.category === 'ifrs').length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucun template IFRS disponible
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => setEditorOpen(true)}
                    >
                      Créer un template
                    </Button>
                  </Box>
                )}
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <CardContent sx={{ p: 3 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Templates personnalisés</AlertTitle>
                  Vos modèles personnalisés créés avec l'éditeur visuel.
                </Alert>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Rechercher dans vos templates..."
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: '🔍',
                    }}
                  />
                </Box>

                <List>
                  {loading ? (
                    Array.from({ length: 2 }).map((_, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={100} />
                      </Box>
                    ))
                  ) : (
                    templates
                      .filter(t => t.type === 'personal')
                      .map((template, index, filtered) => (
                        <React.Fragment key={template.id}>
                          <ListItem
                            sx={{
                              py: 2,
                              px: 0,
                              backgroundColor: selectedTemplates.includes(template.id)
                                ? alpha(theme.palette.primary.main, 0.05)
                                : 'transparent',
                              borderRadius: 1,
                            }}
                          >
                            {batchMode && (
                              <Checkbox
                                checked={selectedTemplates.includes(template.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTemplates([...selectedTemplates, template.id])
                                  } else {
                                    setSelectedTemplates(selectedTemplates.filter(id => id !== template.id))
                                  }
                                }}
                                sx={{ mr: 2 }}
                              />
                            )}
                            <ListItemIcon>
                              <Avatar
                                sx={{
                                  backgroundColor: alpha(getCategoryColor(template.category), 0.1),
                                  color: getCategoryColor(template.category),
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                {getCategoryIcon(template.category)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {template.name}
                                  </Typography>
                                  <Chip
                                    label={template.status === 'active' ? 'Actif' :
                                           template.status === 'draft' ? 'Brouillon' : 'Archivé'}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(
                                        template.status === 'active' ? theme.palette.success.main :
                                        template.status === 'draft' ? theme.palette.warning.main :
                                        theme.palette.grey[500],
                                        0.1
                                      ),
                                      color: template.status === 'active' ? theme.palette.success.main :
                                             template.status === 'draft' ? theme.palette.warning.main :
                                             theme.palette.grey[500],
                                    }}
                                  />
                                  <Avatar
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      backgroundColor: alpha(getFormatColor(template.format), 0.1),
                                      color: getFormatColor(template.format),
                                    }}
                                  >
                                    {getFormatIcon(template.format)}
                                  </Avatar>
                                  <Typography variant="caption" color="text.secondary">
                                    v{template.version}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {template.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Par {template.author}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {template.size}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Utilisé {template.usage} fois
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Modifié le {template.lastModified}
                                    </Typography>
                                  </Box>
                                  {template.tags.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                      {template.tags.map((tag) => (
                                        <Chip
                                          key={tag}
                                          label={tag}
                                          size="small"
                                          variant="outlined"
                                          sx={{ height: 20, fontSize: '0.75rem' }}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Aperçu">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedTemplate(template)
                                      setPreviewOpen(true)
                                    }}
                                  >
                                    <PreviewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Éditer">
                                  <IconButton size="small">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Exporter">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => {
                                      setSelectedTemplate(template)
                                      setExportDialogOpen(true)
                                    }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < filtered.length - 1 && <Divider />}
                        </React.Fragment>
                      ))
                  )}
                </List>

                {!loading && templates.filter(t => t.type === 'personal').length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucun template personnalisé
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => setEditorOpen(true)}
                    >
                      Créer votre premier template
                    </Button>
                  </Box>
                )}
              </CardContent>
            </TabPanel>
          </Card>
        </Grid>

        {/* Panneau latéral */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Éditeur de template */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Éditeur visuel
                </Typography>
                
                <Box sx={{ p: 3, backgroundColor: alpha(theme.palette.primary.main, 0.02), borderRadius: 1, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Créez vos templates avec notre éditeur drag & drop
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DragIcon fontSize="small" color="action" />
                      <Typography variant="caption">Interface drag & drop intuitive</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormulaIcon fontSize="small" color="action" />
                      <Typography variant="caption">Variables dynamiques {'{{variable}}'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ConditionIcon fontSize="small" color="action" />
                      <Typography variant="caption">Conditions et boucles</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormatIcon fontSize="small" color="action" />
                      <Typography variant="caption">Formatage avancé</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PreviewIcon fontSize="small" color="action" />
                      <Typography variant="caption">Prévisualisation instantanée</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setEditorOpen(true)}
                >
                  Ouvrir l'éditeur
                </Button>
              </CardContent>
            </Card>

            {/* Jobs d'export */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Exports récents
                  </Typography>
                  <IconButton size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>

                <List disablePadding>
                  {exportJobs.map((job, index) => (
                    <React.Fragment key={job.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: alpha(getStatusColor(job.status), 0.1),
                              color: getStatusColor(job.status),
                            }}
                          >
                            {getStatusIcon(job.status)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {job.templateName}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              {job.status === 'processing' && (
                                <LinearProgress
                                  variant="determinate"
                                  value={job.progress}
                                  sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    my: 1,
                                    backgroundColor: alpha(theme.palette.divider, 0.1),
                                  }}
                                />
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {job.scheduled && `${job.schedulePattern} • `}
                                {job.startTime}
                              </Typography>
                              {job.outputFile && (
                                <Typography variant="caption" sx={{ display: 'block', color: 'primary.main' }}>
                                  {job.outputFile}
                                </Typography>
                              )}
                              {job.error && (
                                <Typography variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                                  {job.error}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < exportJobs.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Dialog Export avec mapping dynamique (EX-EXPORT-003) */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Export avec template
          {selectedTemplate && (
            <Typography variant="body2" color="text.secondary">
              {selectedTemplate.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Configuration de l'export</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Période</InputLabel>
                      <Select defaultValue="2024">
                        <MenuItem value="2024">Exercice 2024</MenuItem>
                        <MenuItem value="2023">Exercice 2023</MenuItem>
                        <MenuItem value="custom">Période personnalisée</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup>
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label="Préserver les formules Excel (EX-EXPORT-002)"
                      />
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label="Inclure les graphiques dynamiques (EX-EXPORT-004)"
                      />
                      <FormControlLabel
                        control={<Checkbox />}
                        label="Fusion de données avancée (Mail merge)"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                    sx={{ mr: 1 }}
                  >
                    Continuer
                  </Button>
                  <Button onClick={() => setExportDialogOpen(false)}>
                    Annuler
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Mapping des données</StepLabel>
              <StepContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Mapping dynamique automatique détecté (EX-EXPORT-003)
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Les champs suivants seront automatiquement mappés :
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="balance.total_actif → Cellule B15"
                      secondary="Total actif du bilan"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="company.name → En-tête document"
                      secondary="Nom de l'entreprise"
                    />
                  </ListItem>
                </List>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(2)}
                    sx={{ mr: 1 }}
                  >
                    Continuer
                  </Button>
                  <Button onClick={() => setActiveStep(0)}>
                    Retour
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Aperçu et validation</StepLabel>
              <StepContent>
                <Paper sx={{ p: 2, mb: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Aperçu en temps réel (EX-EXPORT-008)
                  </Typography>
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Aperçu du document généré
                    </Typography>
                  </Box>
                </Paper>
                <Alert severity="success">
                  Export prêt - Temps estimé: {"< 10 secondes"} (EX-EXPORT-009)
                </Alert>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleExport}
                    sx={{ mr: 1 }}
                  >
                    Exporter
                  </Button>
                  <Button onClick={() => setActiveStep(1)}>
                    Retour
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
      </Dialog>

      {/* Dialog Éditeur de template (EX-EXPORT-006) */}
      <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Éditeur visuel de template
          <Typography variant="body2" color="text.secondary">
            Interface drag & drop avec variables et conditions
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ height: 600 }}>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, height: '100%', backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Composants
                </Typography>
                <Stack spacing={1}>
                  <Paper sx={{ p: 1, cursor: 'move' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DragIcon fontSize="small" />
                      <Typography variant="caption">Texte</Typography>
                    </Box>
                  </Paper>
                  <Paper sx={{ p: 1, cursor: 'move' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DragIcon fontSize="small" />
                      <Typography variant="caption">Tableau</Typography>
                    </Box>
                  </Paper>
                  <Paper sx={{ p: 1, cursor: 'move' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DragIcon fontSize="small" />
                      <Typography variant="caption">Variable {'{{}}'}</Typography>
                    </Box>
                  </Paper>
                  <Paper sx={{ p: 1, cursor: 'move' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DragIcon fontSize="small" />
                      <Typography variant="caption">Condition</Typography>
                    </Box>
                  </Paper>
                  <Paper sx={{ p: 1, cursor: 'move' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DragIcon fontSize="small" />
                      <Typography variant="caption">Boucle</Typography>
                    </Box>
                  </Paper>
                </Stack>
              </Paper>
            </Grid>
            
            <Grid item xs={6}>
              <Paper sx={{ p: 2, height: '100%', border: `2px dashed ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Zone de conception
                </Typography>
                <Box sx={{ height: 'calc(100% - 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Glissez-déposez les composants ici
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={3}>
              <Paper sx={{ p: 2, height: '100%', backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Propriétés
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sélectionnez un élément pour voir ses propriétés
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)}>
            Annuler
          </Button>
          <Button variant="contained" startIcon={<SaveIcon />}>
            Enregistrer template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Aperçu (EX-EXPORT-008) */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Aperçu du template
          {selectedTemplate && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedTemplate.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  icon={getFormatIcon(selectedTemplate.format)}
                  label={selectedTemplate.format.toUpperCase()}
                  size="small"
                  sx={{ backgroundColor: alpha(getFormatColor(selectedTemplate.format), 0.1) }}
                />
                <Chip
                  label={`v${selectedTemplate.version}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${selectedTemplate.size}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{
            minHeight: 600,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 3,
            backgroundColor: alpha(theme.palette.grey[100], 0.3)
          }}>
            {selectedTemplate ? (
              <>
                {/* Aperçu pour template SYSCOHADA */}
                {selectedTemplate.category === 'syscohada' && (
                  <Box>
                    <Paper sx={{ p: 3, mb: 2, backgroundColor: 'white' }}>
                      <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                        LIASSE FISCALE SYSCOHADA 2024
                      </Typography>
                      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Entreprise ABC Commerce SARL
                      </Typography>
                      <Divider sx={{ mb: 3 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Exercice fiscal</Typography>
                          <Typography variant="body1" fontWeight={600}>2024</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Régime</Typography>
                          <Typography variant="body1" fontWeight={600}>Système Normal</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Secteur d'activité</Typography>
                          <Typography variant="body1" fontWeight={600}>Commerce de détail</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Juridiction</Typography>
                          <Typography variant="body1" fontWeight={600}>OHADA - Côte d'Ivoire</Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    <Paper sx={{ p: 3, mb: 2, backgroundColor: 'white' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Bilan Actif (Extrait)
                      </Typography>
                      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                        <Box component="thead" sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                          <Box component="tr">
                            <Box component="th" sx={{ p: 1, textAlign: 'left', borderBottom: 1, borderColor: 'divider' }}>
                              <Typography variant="caption" fontWeight={600}>Poste</Typography>
                            </Box>
                            <Box component="th" sx={{ p: 1, textAlign: 'right', borderBottom: 1, borderColor: 'divider' }}>
                              <Typography variant="caption" fontWeight={600}>N</Typography>
                            </Box>
                            <Box component="th" sx={{ p: 1, textAlign: 'right', borderBottom: 1, borderColor: 'divider' }}>
                              <Typography variant="caption" fontWeight={600}>N-1</Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Box component="tbody">
                          {[
                            { label: 'Immobilisations incorporelles', n: '2 500 000', n1: '2 200 000' },
                            { label: 'Immobilisations corporelles', n: '15 800 000', n1: '14 500 000' },
                            { label: 'Stocks et en-cours', n: '8 400 000', n1: '7 900 000' },
                            { label: 'Créances clients', n: '5 200 000', n1: '4 800 000' },
                            { label: 'Trésorerie', n: '3 100 000', n1: '2 600 000' }
                          ].map((row, index) => (
                            <Box component="tr" key={index}>
                              <Box component="td" sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="body2">{row.label}</Typography>
                              </Box>
                              <Box component="td" sx={{ p: 1, textAlign: 'right', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="body2">{row.n}</Typography>
                              </Box>
                              <Box component="td" sx={{ p: 1, textAlign: 'right', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="body2">{row.n1}</Typography>
                              </Box>
                            </Box>
                          ))}
                          <Box component="tr">
                            <Box component="td" sx={{ p: 1, borderTop: 2, borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight={700}>TOTAL ACTIF</Typography>
                            </Box>
                            <Box component="td" sx={{ p: 1, textAlign: 'right', borderTop: 2, borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight={700}>35 000 000</Typography>
                            </Box>
                            <Box component="td" sx={{ p: 1, textAlign: 'right', borderTop: 2, borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight={700}>32 000 000</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>

                    <Alert severity="info" icon={<FormulaIcon />}>
                      <AlertTitle>Variables mappées automatiquement</AlertTitle>
                      <Typography variant="caption">
                        • {'{'}{'{'} company.name {'}'}{'}'}  → ABC Commerce SARL<br/>
                        • {'{'}{'{'} exercice {'}'}{'}'}  → 2024<br/>
                        • {'{'}{'{'} balance.total_actif {'}'}{'}'}  → 35 000 000
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {/* Aperçu pour template IFRS */}
                {selectedTemplate.category === 'ifrs' && (
                  <Box>
                    <Paper sx={{ p: 3, mb: 2, backgroundColor: 'white' }}>
                      <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                        ÉTATS FINANCIERS IFRS
                      </Typography>
                      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Conforme aux normes internationales
                      </Typography>
                      <Divider sx={{ mb: 3 }} />

                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Statement of Financial Position (Position Financière)
                      </Typography>
                      <Grid container spacing={2}>
                        {[
                          { label: 'Non-current Assets', value: '18 300 000' },
                          { label: 'Current Assets', value: '16 700 000' },
                          { label: 'Total Assets', value: '35 000 000' },
                          { label: 'Equity', value: '15 000 000' },
                          { label: 'Non-current Liabilities', value: '12 000 000' },
                          { label: 'Current Liabilities', value: '8 000 000' }
                        ].map((item, index) => (
                          <Grid item xs={6} key={index}>
                            <Box sx={{
                              p: 2,
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 1,
                              backgroundColor: index >= 3 ? alpha(theme.palette.info.main, 0.05) : 'transparent'
                            }}>
                              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                              <Typography variant="h6" fontWeight={600}>{item.value}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>

                    <Alert severity="success" icon={<CheckIcon />}>
                      <AlertTitle>Conformité IFRS validée</AlertTitle>
                      <Typography variant="caption">
                        Ce template respecte les normes IAS 1, IAS 7, et IFRS 15
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {/* Aperçu pour templates bancaires */}
                {selectedTemplate.category === 'bank' && (
                  <Box>
                    <Paper sx={{ p: 3, mb: 2, backgroundColor: 'white' }}>
                      <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                        DOSSIER DE DEMANDE DE CRÉDIT
                      </Typography>
                      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Entreprise ABC Commerce SARL
                      </Typography>
                      <Divider sx={{ mb: 3 }} />

                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Synthèse Financière
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">Chiffre d'affaires</Typography>
                            <Typography variant="h5" fontWeight={700} color="primary.main">42M</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">Résultat Net</Typography>
                            <Typography variant="h5" fontWeight={700} color="success.main">3.2M</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">Fonds Propres</Typography>
                            <Typography variant="h5" fontWeight={700} color="info.main">15M</Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Ratios Financiers
                      </Typography>
                      <Grid container spacing={2}>
                        {[
                          { label: 'Ratio de liquidité', value: '1.85', status: 'success' },
                          { label: 'Ratio d\'endettement', value: '57%', status: 'warning' },
                          { label: 'ROE', value: '21.3%', status: 'success' },
                          { label: 'Couverture intérêts', value: '4.2x', status: 'success' }
                        ].map((ratio, index) => (
                          <Grid item xs={6} key={index}>
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1.5,
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 1
                            }}>
                              <Typography variant="body2">{ratio.label}</Typography>
                              <Chip
                                label={ratio.value}
                                size="small"
                                color={ratio.status as 'success' | 'warning'}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>

                    <Alert severity="info" icon={<BankIcon />}>
                      <AlertTitle>Format bancaire standard</AlertTitle>
                      <Typography variant="caption">
                        Compatible avec les exigences de BCEAO, BICICI, SIB, et principales banques de la zone OHADA
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {/* Aperçu pour templates de gestion */}
                {selectedTemplate.category === 'management' && (
                  <Box>
                    <Paper sx={{ p: 3, mb: 2, backgroundColor: 'white' }}>
                      <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                        TABLEAU DE BORD DIRECTION
                      </Typography>
                      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Période: Décembre 2024
                      </Typography>
                      <Divider sx={{ mb: 3 }} />

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        {[
                          { label: 'CA Mensuel', value: '3.5M', evolution: '+12%', color: 'success' },
                          { label: 'Marge Brute', value: '28.5%', evolution: '+2.1%', color: 'success' },
                          { label: 'Charges Fixes', value: '850K', evolution: '-5%', color: 'success' },
                          { label: 'Trésorerie', value: '2.1M', evolution: '+8%', color: 'info' }
                        ].map((kpi, index) => (
                          <Grid item xs={6} key={index}>
                            <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette[kpi.color as 'success' | 'info'].main, 0.05) }}>
                              <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                                <Typography variant="h5" fontWeight={700}>{kpi.value}</Typography>
                                <Chip
                                  label={kpi.evolution}
                                  size="small"
                                  color={kpi.color as 'success' | 'info'}
                                  icon={kpi.evolution.startsWith('+') ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                />
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>

                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Top 5 Clients du Mois
                      </Typography>
                      {[
                        { name: 'Client A', ca: '850 000', part: '24%' },
                        { name: 'Client B', ca: '620 000', part: '18%' },
                        { name: 'Client C', ca: '480 000', part: '14%' },
                        { name: 'Client D', ca: '390 000', part: '11%' },
                        { name: 'Client E', ca: '310 000', part: '9%' }
                      ].map((client, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                            {index + 1}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>{client.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {client.ca}
                            </Typography>
                          </Box>
                          <Chip label={client.part} size="small" />
                        </Box>
                      ))}
                    </Paper>

                    <Alert severity="warning" icon={<WarningIcon />}>
                      <AlertTitle>Alertes & Indicateurs</AlertTitle>
                      <Typography variant="caption">
                        • 2 factures impayées depuis plus de 60 jours<br/>
                        • Stock produit X en rupture prévue dans 5 jours<br/>
                        • Objectif CA mensuel atteint à 105%
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {/* Aperçu pour templates personnalisés */}
                {selectedTemplate.type === 'personal' && (
                  <Box>
                    <Paper sx={{ p: 3, mb: 2, backgroundColor: 'white' }}>
                      <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                        {selectedTemplate.name.toUpperCase()}
                      </Typography>
                      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Template personnalisé - Version {selectedTemplate.version}
                      </Typography>
                      <Divider sx={{ mb: 3 }} />

                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <FormatIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                          Aperçu du template personnalisé
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Les données seront injectées dynamiquement selon votre configuration<br/>
                          Variables disponibles: {selectedTemplate.variables.length}<br/>
                          Conditions définies: {selectedTemplate.conditions.length}
                        </Typography>
                      </Box>

                      {selectedTemplate.variables.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Variables configurées:
                          </Typography>
                          <Stack spacing={1}>
                            {selectedTemplate.variables.map((variable) => (
                              <Chip
                                key={variable.id}
                                label={`{{${variable.name}}} → ${variable.source}`}
                                size="small"
                                variant="outlined"
                                icon={<FormulaIcon />}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Paper>

                    <Alert severity="info" icon={<SettingsIcon />}>
                      <AlertTitle>Template en brouillon</AlertTitle>
                      <Typography variant="caption">
                        Utilisez l'éditeur visuel pour compléter la configuration de ce template
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <PreviewIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Sélectionnez un template pour voir son aperçu
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Fermer
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              setPreviewOpen(false)
              setEditorOpen(true)
            }}
          >
            Éditer
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              setPreviewOpen(false)
              setExportDialogOpen(true)
            }}
          >
            Exporter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModernTemplates