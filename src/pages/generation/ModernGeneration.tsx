/**
 * Module Génération Professionnel - Création de documents SYSCOHADA
 * Interface moderne pour génération de liasses, états financiers et déclarations
 */

import React, { useState, useEffect } from 'react'
import { generationService, templatesService, entrepriseService } from '@/services'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  FormLabel,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
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
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  GetApp as DownloadIcon,
  Visibility as PreviewIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Description as DocIcon,
  TableChart as TableIcon,
  PictureAsPdf as PdfIcon,
  TableView as ExcelIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material'

interface GenerationTemplate {
  id: string
  name: string
  description: string
  category: 'liasse' | 'declaration' | 'report' | 'custom'
  format: 'pdf' | 'excel' | 'word' | 'html'
  status: 'active' | 'draft' | 'deprecated'
  lastModified: string
  version: string
}

interface GenerationTask {
  id: string
  templateId: string
  templateName: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  createdAt: string
  completedAt?: string
  outputFile?: string
  parameters: Record<string, any>
}

interface CompanyData {
  id: string
  name: string
  siret: string
  address: string
  exercice: string
  regime: string
}

const ModernGeneration: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [generationParams, setGenerationParams] = useState<Record<string, any>>({})
  const [previewDialog, setPreviewDialog] = useState(false)

  // Données du backend
  const [generationTemplates, setGenerationTemplates] = useState<GenerationTemplate[]>([])
  const [companies, setCompanies] = useState<CompanyData[]>([])
  const [generationTasks, setGenerationTasks] = useState<GenerationTask[]>([])

  useEffect(() => {
    loadBackendData()
  }, [])

  const loadBackendData = async () => {
    setLoading(true)
    try {
      console.log('📤 Loading generation data from backend...')

      // Charger les templates
      const templatesRes = await templatesService.getTemplates({ page_size: 100 })
      const templates = (templatesRes.results || []).map((t: any) => ({
        id: t.id,
        name: t.nom || t.name || 'Template',
        description: t.description || '',
        category: t.type_document || 'liasse',
        format: t.format || 'pdf',
        status: t.actif ? 'active' : 'draft',
        lastModified: t.date_modification || new Date().toISOString(),
        version: t.version || '1.0'
      }))

      // Charger les entreprises
      const entreprisesRes = await entrepriseService.getEntreprises({ page_size: 100 })
      const entreprises = (entreprisesRes.results || []).map((e: any) => ({
        id: e.id,
        name: e.raison_sociale || e.nom || 'Entreprise',
        siret: e.numero_contribuable || '',
        address: e.adresse || '',
        exercice: new Date().getFullYear().toString(),
        regime: e.regime_imposition || 'Réel normal'
      }))

      // Charger les tâches de génération
      const generationsRes = await generationService.getLiasseGenerations({ page_size: 20 })
      const tasks = (generationsRes.results || []).map((g: any) => ({
        id: g.id,
        templateId: g.template_id || '1',
        templateName: g.type_liasse || 'Liasse fiscale',
        status: g.statut === 'TERMINE' ? 'completed' : g.statut === 'EN_COURS' ? 'running' : g.statut === 'ERREUR' ? 'error' : 'pending',
        progress: g.progression || 0,
        createdAt: g.date_creation || new Date().toISOString(),
        completedAt: g.date_fin,
        outputFile: g.fichier_genere || g.fichier_url,
        parameters: g.parametres || {}
      }))

      setGenerationTemplates(templates.length > 0 ? templates : getDefaultTemplates())
      setCompanies(entreprises.length > 0 ? entreprises : getDefaultCompanies())
      setGenerationTasks(tasks)

      console.log('✅ Generation data loaded:', { templates: templates.length, entreprises: entreprises.length, tasks: tasks.length })
    } catch (error) {
      console.error('❌ Error loading generation data:', error)
      // Utiliser les données par défaut en cas d'erreur
      setGenerationTemplates(getDefaultTemplates())
      setCompanies(getDefaultCompanies())
      setGenerationTasks([])
    } finally {
      setLoading(false)
    }
  }

  // Données par défaut si le backend ne répond pas
  const getDefaultTemplates = (): GenerationTemplate[] => [
    {
      id: '1',
      name: 'Liasse fiscale complète SYSCOHADA',
      description: 'Génération automatique de la liasse fiscale avec tous les tableaux obligatoires',
      category: 'liasse',
      format: 'pdf',
      status: 'active',
      lastModified: new Date().toISOString(),
      version: '2.1'
    },
    {
      id: '2',
      name: 'Bilan comptable',
      description: 'Bilan actif/passif selon le modèle SYSCOHADA',
      category: 'report',
      format: 'excel',
      status: 'active',
      lastModified: new Date().toISOString(),
      version: '1.5'
    }
  ]

  const getDefaultCompanies = (): CompanyData[] => [
    {
      id: '1',
      name: 'Entreprise Demo',
      siret: '000000000',
      address: 'Abidjan, Côte d\'Ivoire',
      exercice: new Date().getFullYear().toString(),
      regime: 'Réel normal'
    }
  ]

  // Fonction pour générer un document
  const generateDocument = async () => {
    if (!selectedTemplate || !selectedCompany) {
      console.error('Template ou entreprise non sélectionné')
      return
    }

    try {
      console.log('📤 Generating document via backend...')

      const params = {
        template_id: selectedTemplate,
        entreprise_id: selectedCompany,
        exercice: generationParams.exercice || new Date().getFullYear(),
        ...generationParams
      }

      const response = await generationService.generateLiasse(params)

      if (response?.id) {
        // Ajouter la nouvelle tâche à la liste
        const newTask: GenerationTask = {
          id: response.id,
          templateId: selectedTemplate,
          templateName: generationTemplates.find(t => t.id === selectedTemplate)?.name || 'Document',
          status: 'running',
          progress: 0,
          createdAt: new Date().toISOString(),
          parameters: params
        }

        setGenerationTasks(prev => [newTask, ...prev])

        // Vérifier le statut périodiquement
        checkGenerationStatus(response.id)
      }

      console.log('✅ Document generation started')
    } catch (error) {
      console.error('❌ Error generating document:', error)
    }
  }

  // Vérifier le statut d'une génération
  const checkGenerationStatus = async (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await generationService.getGenerationStatus(taskId)

        if (status) {
          setGenerationTasks(prev => prev.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  status: status.statut === 'TERMINE' ? 'completed' : status.statut === 'ERREUR' ? 'error' : 'running',
                  progress: status.progression || task.progress,
                  completedAt: status.date_fin,
                  outputFile: status.fichier_url
                }
              : task
          ))

          // Arrêter la vérification si terminé ou en erreur
          if (status.statut === 'TERMINE' || status.statut === 'ERREUR') {
            clearInterval(interval)
          }
        }
      } catch (error) {
        console.error('❌ Error checking generation status:', error)
        clearInterval(interval)
      }
    }, 3000) // Vérifier toutes les 3 secondes
  }

  const steps = [
    'Sélection du modèle',
    'Configuration des paramètres',
    'Validation et génération',
    'Téléchargement'
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'liasse': return <AssignmentIcon />
      case 'declaration': return <ReceiptIcon />
      case 'report': return <ReportIcon />
      case 'custom': return <DocIcon />
      default: return <DocIcon />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'liasse': return theme.palette.primary.main
      case 'declaration': return theme.palette.warning.main
      case 'report': return theme.palette.info.main
      case 'custom': return theme.palette.secondary.main
      default: return theme.palette.grey[500]
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <PdfIcon />
      case 'excel': return <ExcelIcon />
      case 'word': return <DocIcon />
      case 'html': return <TableIcon />
      default: return <DocIcon />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main
      case 'running': return theme.palette.warning.main
      case 'error': return theme.palette.error.main
      case 'pending': return theme.palette.info.main
      default: return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon />
      case 'running': return <ScheduleIcon />
      case 'error': return <ErrorIcon />
      case 'pending': return <ScheduleIcon />
      default: return <ScheduleIcon />
    }
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    setSelectedTemplate('')
    setSelectedCompany('')
    setGenerationParams({})
  }

  const handleGenerate = () => {
    // Simuler la génération
    console.log('Génération avec:', {
      template: selectedTemplate,
      company: selectedCompany,
      params: generationParams
    })
    handleNext()
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
              Génération de documents
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Création automatique de liasses, déclarations et états financiers
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
            >
              Modèles
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Nouveau modèle
            </Button>
          </Stack>
        </Box>
      </Box>

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
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
                      24
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Documents générés ce mois
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <AssignmentIcon />
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
                      12
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Modèles disponibles
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
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
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main }}>
                      3
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Générations en cours
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
                      98%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taux de réussite
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  >
                    <CheckIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Assistant de génération */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Assistant de génération
              </Typography>

              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      {index === 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Choisissez le type de document à générer
                          </Typography>
                          <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Modèle de document</InputLabel>
                            <Select
                              value={selectedTemplate}
                              label="Modèle de document"
                              onChange={(e) => setSelectedTemplate(e.target.value)}
                            >
                              {generationTemplates.map((template) => (
                                <MenuItem key={template.id} value={template.id}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Avatar
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        backgroundColor: alpha(getCategoryColor(template.category), 0.1),
                                        color: getCategoryColor(template.category),
                                      }}
                                    >
                                      {getCategoryIcon(template.category)}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {template.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {template.description}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      {getFormatIcon(template.format)}
                                      <Typography variant="caption">
                                        v{template.version}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      )}

                      {index === 1 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Sélectionnez l'entreprise et configurez les paramètres
                          </Typography>
                          <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Entreprise</InputLabel>
                            <Select
                              value={selectedCompany}
                              label="Entreprise"
                              onChange={(e) => setSelectedCompany(e.target.value)}
                            >
                              {companies.map((company) => (
                                <MenuItem key={company.id} value={company.id}>
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                      {company.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      SIRET: {company.siret} - Exercice {company.exercice}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Période de génération"
                                type="month"
                                InputLabelProps={{ shrink: true }}
                                value={generationParams.periode || '2024-12'}
                                onChange={(e) => setGenerationParams({...generationParams, periode: e.target.value})}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth>
                                <FormLabel>Options d'export</FormLabel>
                                <FormGroup row>
                                  <FormControlLabel
                                    control={<Checkbox defaultChecked />}
                                    label="Inclure notes"
                                  />
                                  <FormControlLabel
                                    control={<Checkbox />}
                                    label="Détail par compte"
                                  />
                                </FormGroup>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {index === 2 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Vérifiez les paramètres avant génération
                          </Typography>
                          
                          <Paper sx={{ p: 2, mb: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              Résumé de la génération
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Modèle:</Typography>
                                <Typography variant="body2">
                                  {generationTemplates.find(t => t.id === selectedTemplate)?.name}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Entreprise:</Typography>
                                <Typography variant="body2">
                                  {companies.find(c => c.id === selectedCompany)?.name}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>

                          <Alert severity="info">
                            <AlertTitle>Information</AlertTitle>
                            La génération peut prendre quelques minutes selon la complexité du document.
                          </Alert>
                        </Box>
                      )}

                      {index === 3 && (
                        <Box sx={{ mb: 2 }}>
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <AlertTitle>Génération terminée</AlertTitle>
                            Votre document a été généré avec succès.
                          </Alert>
                          
                          <Stack direction="row" spacing={2}>
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              color="primary"
                            >
                              Télécharger
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<PreviewIcon />}
                            >
                              Aperçu
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<EmailIcon />}
                            >
                              Envoyer
                            </Button>
                          </Stack>
                        </Box>
                      )}

                      <Box sx={{ mb: 1 }}>
                        <Button
                          variant="contained"
                          onClick={index === steps.length - 1 ? handleReset : index === 2 ? handleGenerate : handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={
                            (index === 0 && !selectedTemplate) ||
                            (index === 1 && !selectedCompany)
                          }
                        >
                          {index === steps.length - 1 ? 'Nouvelle génération' : index === 2 ? 'Générer' : 'Continuer'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Retour
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Historique et tâches */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Historique" />
                <Tab label="En cours" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Générations récentes
                </Typography>

                <List disablePadding>
                  {generationTasks.filter(task => task.status === 'completed').map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              backgroundColor: alpha(getStatusColor(task.status), 0.1),
                              color: getStatusColor(task.status),
                              width: 32,
                              height: 32,
                            }}
                          >
                            {getStatusIcon(task.status)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {task.templateName}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {task.completedAt}
                              </Typography>
                              {task.outputFile && (
                                <Typography variant="caption" sx={{ display: 'block', color: 'primary.main' }}>
                                  {task.outputFile}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton size="small">
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small">
                              <PreviewIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < generationTasks.filter(task => task.status === 'completed').length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Tâches en cours
                </Typography>

                <List disablePadding>
                  {generationTasks.filter(task => task.status !== 'completed').map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              backgroundColor: alpha(getStatusColor(task.status), 0.1),
                              color: getStatusColor(task.status),
                              width: 32,
                              height: 32,
                            }}
                          >
                            {getStatusIcon(task.status)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                {task.templateName}
                              </Typography>
                              {task.status === 'running' && (
                                <Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={task.progress}
                                    sx={{ 
                                      height: 6, 
                                      borderRadius: 3,
                                      mb: 1,
                                      backgroundColor: alpha(theme.palette.divider, 0.1),
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {task.progress}% terminé
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Démarré le {task.createdAt}
                              </Typography>
                              {task.status === 'error' && (
                                <Typography variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                                  Erreur lors de la génération
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {task.status === 'error' && (
                            <IconButton size="small">
                              <RefreshIcon fontSize="small" />
                            </IconButton>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < generationTasks.filter(task => task.status !== 'completed').length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </TabPanel>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ModernGeneration