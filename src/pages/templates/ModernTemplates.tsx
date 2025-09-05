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
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
  useTheme,
  alpha,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
  GetApp as DownloadIcon,
  Schedule as ScheduleIcon,
  PlayArrow as RunIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  Assessment as ReportIcon,
  Functions as FormulaIcon,
  MergeType as MergeIcon,
  Loop as LoopIcon,
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
} from '@mui/icons-material'

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

interface MappingField {
  id: string
  sourceField: string
  targetField: string
  transformation?: string
  format?: string
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
      case 'excel': return '#107C41'
      case 'word': return '#2B579A'
      case 'pdf': return '#F40F02'
      case 'xml': return '#FF6600'
      case 'json': return '#000000'
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
    console.log('Export avec préservation des formules')
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
              <CardContent>
                <Alert severity="info">
                  <AlertTitle>Templates SYSCOHADA</AlertTitle>
                  Modèles officiels conformes aux normes OHADA pour tous les pays membres.
                </Alert>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <CardContent>
                <Alert severity="info">
                  <AlertTitle>Templates IFRS</AlertTitle>
                  Modèles conformes aux normes internationales IFRS.
                </Alert>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <CardContent>
                <Alert severity="info">
                  <AlertTitle>Templates personnalisés</AlertTitle>
                  Vos modèles personnalisés créés avec l'éditeur visuel.
                </Alert>
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
            <Typography variant="body2" color="text.secondary">
              {selectedTemplate.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 600, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, p: 2 }}>
            <Typography variant="body1" align="center" color="text.secondary">
              Aperçu en temps réel du template avec données d'exemple
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Fermer
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Exporter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModernTemplates