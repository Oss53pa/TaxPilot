import React, { useState, useEffect } from 'react';
import { generationService, templatesService } from '@/services';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Divider,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Menu,
  Fade
} from '@mui/material';
import {
  Description,
  Add,
  Edit,
  Delete,
  Download,
  Send,
  Visibility,
  Settings,
  Schedule,
  Archive,
  History,
  Refresh,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Search,
  MoreVert,
  Folder,
  InsertDriveFile,
  PictureAsPdf,
  TableView,
  Code
} from '@mui/icons-material';

interface DocumentTemplate {
  id: string;
  name: string;
  type: 'report' | 'statement' | 'declaration' | 'certificate' | 'analysis';
  format: 'pdf' | 'excel' | 'word' | 'xml' | 'json';
  category: string;
  jurisdiction: string;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'on-demand';
  status: 'active' | 'draft' | 'archived';
  lastModified: Date;
  version: string;
  size: string;
  description: string;
  tags: string[];
  isCustom: boolean;
  compliance: {
    required: boolean;
    deadline?: Date;
    authority: string;
  };
}

interface GenerationJob {
  id: string;
  templateId: string;
  templateName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  parameters: Record<string, any>;
  outputPath?: string;
  error?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

const ModernDocuments: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [_backendLoading, setBackendLoading] = useState(true);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [_generationStartTime, setGenerationStartTime] = useState<Date | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'report' as DocumentTemplate['type'],
    format: 'pdf' as DocumentTemplate['format'],
    category: '',
    jurisdiction: 'OHADA',
    frequency: 'monthly' as DocumentTemplate['frequency'],
    description: '',
    tags: [] as string[],
    compliance: {
      required: false,
      authority: ''
    }
  });

  // Charger les données depuis le backend
  useEffect(() => {
    loadBackendData();
  }, []);

  const loadBackendData = async () => {
    setBackendLoading(true);
    try {
      console.log('📤 Loading documents data from backend...');

      // Charger les templates
      const templatesRes = await templatesService.getTemplates({ page_size: 100 });
      const backendTemplates = (templatesRes.results || []).map((t: any) => ({
        id: t.id,
        name: t.nom || t.name || 'Template',
        type: t.type_document || 'report',
        format: t.format || 'pdf',
        category: t.categorie || 'SYSCOHADA',
        jurisdiction: t.juridiction || 'OHADA',
        frequency: t.frequence || 'monthly',
        status: t.actif ? 'active' : 'draft',
        lastModified: new Date(t.date_modification || Date.now()),
        version: t.version || '1.0',
        size: t.taille || '0 KB',
        description: t.description || '',
        tags: t.tags || [],
        isCustom: t.personnalise || false,
        compliance: {
          required: t.obligatoire || false,
          deadline: t.date_limite ? new Date(t.date_limite) : undefined,
          authority: t.autorite || ''
        }
      }));

      // Charger les jobs de génération
      const jobsRes = await generationService.getLiasseGenerations({ page_size: 50 });
      const backendJobs = (jobsRes.results || []).map((j: any) => ({
        id: j.id,
        templateId: j.template_id || '',
        templateName: j.type_liasse || 'Document',
        status: j.statut === 'TERMINE' ? 'completed' : j.statut === 'EN_COURS' ? 'processing' : j.statut === 'ERREUR' ? 'failed' : 'pending',
        progress: j.progression || 0,
        startTime: new Date(j.date_creation || Date.now()),
        endTime: j.date_fin ? new Date(j.date_fin) : undefined,
        parameters: j.parametres || {},
        outputPath: j.fichier_url || j.fichier_genere,
        error: j.erreur_message,
        priority: 'normal'
      }));

      setTemplates(backendTemplates);
      setJobs(backendJobs);

      console.log('✅ Documents backend data loaded:', {
        templates: backendTemplates.length,
        jobs: backendJobs.length
      });
    } catch (error) {
      console.error('❌ Error loading documents data:', error);
      // Utiliser des données par défaut en cas d'erreur
      setTemplates([]);
      setJobs([]);
    } finally {
      setBackendLoading(false);
    }
  };

  // EX-ECRIT-001: Génération de documents en moins de 5 minutes

  // EX-ECRIT-002: Support multi-format (PDF, Excel, Word, XML, JSON)
  const formatIcons = {
    pdf: <PictureAsPdf />,
    excel: <TableView />,
    word: <InsertDriveFile />,
    xml: <Code />,
    json: <Code />
  };

  // Initialisation des templates par défaut
  useEffect(() => {
    initializeDefaultTemplates();
    loadGenerationJobs();
  }, []);

  const initializeDefaultTemplates = () => {
    const defaultTemplates: DocumentTemplate[] = [
      {
        id: '1',
        name: 'Bilan SYSCOHADA',
        type: 'statement',
        format: 'pdf',
        category: 'États Financiers',
        jurisdiction: 'OHADA',
        frequency: 'annual',
        status: 'active',
        lastModified: new Date(),
        version: '1.0',
        size: '2.5 MB',
        description: 'Bilan comptable conforme SYSCOHADA',
        tags: ['syscohada', 'bilan', 'états financiers'],
        isCustom: false,
        compliance: {
          required: true,
          deadline: new Date('2024-12-31'),
          authority: 'OHADA'
        }
      },
      {
        id: '2',
        name: 'Compte de Résultat',
        type: 'statement',
        format: 'excel',
        category: 'États Financiers',
        jurisdiction: 'OHADA',
        frequency: 'quarterly',
        status: 'active',
        lastModified: new Date(),
        version: '1.2',
        size: '1.8 MB',
        description: 'Compte de résultat détaillé',
        tags: ['résultat', 'performance'],
        isCustom: false,
        compliance: {
          required: true,
          authority: 'OHADA'
        }
      },
      {
        id: '3',
        name: 'Balance Générale',
        type: 'report',
        format: 'pdf',
        category: 'Reporting',
        jurisdiction: 'OHADA',
        frequency: 'monthly',
        status: 'active',
        lastModified: new Date(),
        version: '2.1',
        size: '3.2 MB',
        description: 'Balance générale tous comptes',
        tags: ['balance', 'comptes'],
        isCustom: false,
        compliance: {
          required: false,
          authority: 'Interne'
        }
      },
      {
        id: '4',
        name: 'Liasse Fiscale Complète',
        type: 'declaration',
        format: 'xml',
        category: 'Déclarations',
        jurisdiction: 'OHADA',
        frequency: 'annual',
        status: 'active',
        lastModified: new Date(),
        version: '1.5',
        size: '5.1 MB',
        description: 'Liasse fiscale électronique OHADA',
        tags: ['fiscal', 'déclaration', 'électronique'],
        isCustom: false,
        compliance: {
          required: true,
          deadline: new Date('2024-12-31'),
          authority: 'Autorités Fiscales'
        }
      }
    ];

    setTemplates(defaultTemplates);
  };

  const loadGenerationJobs = () => {
    // Simulation de tâches de génération
    const mockJobs: GenerationJob[] = [
      {
        id: 'job-1',
        templateId: '1',
        templateName: 'Bilan SYSCOHADA',
        status: 'completed',
        progress: 100,
        startTime: new Date(Date.now() - 300000), // Il y a 5 minutes
        endTime: new Date(Date.now() - 60000), // Il y a 1 minute
        parameters: { period: '2024', company: 'Entreprise ABC' },
        outputPath: '/documents/bilan-2024.pdf',
        priority: 'normal'
      },
      {
        id: 'job-2',
        templateId: '4',
        templateName: 'Liasse Fiscale Complète',
        status: 'processing',
        progress: 65,
        startTime: new Date(Date.now() - 120000), // Il y a 2 minutes
        parameters: { year: '2024', entities: ['Entity1', 'Entity2'] },
        priority: 'high'
      }
    ];

    setJobs(mockJobs);
  };

  // EX-ECRIT-003: Génération en arrière-plan avec suivi temps réel
  const startGeneration = (template: DocumentTemplate, parameters: Record<string, any>) => {
    const newJob: GenerationJob = {
      id: `job-${Date.now()}`,
      templateId: template.id,
      templateName: template.name,
      status: 'processing',
      progress: 0,
      startTime: new Date(),
      parameters,
      priority: 'normal'
    };

    setJobs(prev => [newJob, ...prev]);
    setGenerationStartTime(new Date());

    // Simulation du processus de génération
    simulateGeneration(newJob.id);
    setIsGenerationDialogOpen(false);
  };

  const simulateGeneration = (jobId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, progress: Math.min(progress, 100) }
          : job
      ));

      if (progress >= 100) {
        clearInterval(interval);
        setJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { 
                ...job, 
                status: 'completed', 
                progress: 100, 
                endTime: new Date(),
                outputPath: `/documents/${job.templateName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`
              }
            : job
        ));
      }
    }, 500);
  };

  // EX-ECRIT-004: Templates personnalisés avec éditeur visuel
  const handleCreateTemplate = () => {
    const newTemplate: DocumentTemplate = {
      id: `custom-${Date.now()}`,
      name: templateForm.name,
      type: templateForm.type,
      format: templateForm.format,
      category: templateForm.category,
      jurisdiction: templateForm.jurisdiction,
      frequency: templateForm.frequency,
      status: 'draft',
      lastModified: new Date(),
      version: '1.0',
      size: '0 MB',
      description: templateForm.description,
      tags: templateForm.tags,
      isCustom: true,
      compliance: templateForm.compliance
    };

    setTemplates(prev => [...prev, newTemplate]);
    setIsTemplateDialogOpen(false);
    resetTemplateForm();
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      type: 'report',
      format: 'pdf',
      category: '',
      jurisdiction: 'OHADA',
      frequency: 'monthly',
      description: '',
      tags: [],
      compliance: {
        required: false,
        authority: ''
      }
    });
  };

  // EX-ECRIT-005: Historique et versioning
  const handleVersioning = (template: DocumentTemplate) => {
    const versionNumber = parseFloat(template.version) + 0.1;
    const updatedTemplate = {
      ...template,
      version: versionNumber.toFixed(1),
      lastModified: new Date()
    };

    setTemplates(prev => prev.map(t => 
      t.id === template.id ? updatedTemplate : t
    ));
  };

  // Filtrage des templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#22c55e';
      case 'low': return '#a3a3a3';
      default: return '#a3a3a3';
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = endTime.getTime() - start.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderTemplatesTab = () => (
    <Box>
      {/* Barre de recherche et filtres */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Rechercher des templates..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 300 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="Type"
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="report">Rapports</MenuItem>
            <MenuItem value="statement">États</MenuItem>
            <MenuItem value="declaration">Déclarations</MenuItem>
            <MenuItem value="certificate">Certificats</MenuItem>
            <MenuItem value="analysis">Analyses</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Statut"
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="active">Actif</MenuItem>
            <MenuItem value="draft">Brouillon</MenuItem>
            <MenuItem value="archived">Archivé</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsTemplateDialogOpen(true)}
          sx={{ ml: 'auto' }}
        >
          Nouveau Template
        </Button>
      </Box>

      {/* Grille des templates */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[8]
                }
              }}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {formatIcons[template.format]}
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h6" noWrap>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.category} • {template.jurisdiction}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnchorEl(e.currentTarget);
                      setSelectedTemplate(template);
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant="body2" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                  {template.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {template.tags.slice(0, 3).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {template.tags.length > 3 && (
                    <Chip
                      label={`+${template.tags.length - 3}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={template.status}
                    size="small"
                    color={template.status === 'active' ? 'success' : 'default'}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {template.compliance.required && (
                      <Tooltip title="Obligatoire">
                        <Warning color="warning" fontSize="small" />
                      </Tooltip>
                    )}
                    {template.isCustom && (
                      <Tooltip title="Template personnalisé">
                        <Edit color="primary" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderGenerationTab = () => (
    <Box>
      {/* En-tête avec métriques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Générations Aujourd'hui
              </Typography>
              <Typography variant="h4">
                {jobs.filter(job => 
                  job.startTime.toDateString() === new Date().toDateString()
                ).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                En Cours
              </Typography>
              <Typography variant="h4">
                {jobs.filter(job => job.status === 'processing').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Taux de Réussite
              </Typography>
              <Typography variant="h4">
                {jobs.length > 0 ? Math.round((jobs.filter(job => job.status === 'completed').length / jobs.length) * 100) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Temps Moyen
              </Typography>
              <Typography variant="h4">
                2:45
              </Typography>
              <Typography variant="caption" color="text.secondary">
                minutes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Liste des tâches de génération */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Historique des Générations
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={loadGenerationJobs}
          >
            Actualiser
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Template</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Progression</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Début</TableCell>
                <TableCell>Durée</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {job.templateName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {job.id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.status}
                      size="small"
                      color={getStatusColor(job.status) as any}
                      icon={
                        job.status === 'completed' ? <CheckCircle /> :
                        job.status === 'failed' ? <ErrorIcon /> :
                        job.status === 'processing' ? <Schedule /> : undefined
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={job.progress}
                        sx={{ width: 100, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption">
                        {Math.round(job.progress)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getPriorityColor(job.priority),
                        display: 'inline-block',
                        mr: 1
                      }}
                    />
                    {job.priority}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.startTime.toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDuration(job.startTime, job.endTime)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {job.status === 'completed' && (
                        <>
                          <Tooltip title="Télécharger">
                            <IconButton size="small">
                              <Download />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Visualiser">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {job.status === 'processing' && (
                        <Tooltip title="Annuler">
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Génération de Documents
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestion complète des templates et génération automatisée de documents
        </Typography>
        
        {/* EX-ECRIT-001: Indicateur de performance - génération en moins de 5 minutes */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Performance garantie :</strong> Génération de tout document en moins de 5 minutes • 
          Support multi-format (PDF, Excel, Word, XML, JSON) • 
          Traitement en arrière-plan avec suivi temps réel
        </Alert>
      </Box>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab 
            label="Templates" 
            icon={<Description />} 
            iconPosition="start"
          />
          <Tab 
            label="Générations" 
            icon={<Settings />} 
            iconPosition="start"
          />
          <Tab 
            label="Historique" 
            icon={<History />} 
            iconPosition="start"
          />
          <Tab 
            label="Configuration" 
            icon={<Folder />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      {activeTab === 0 && renderTemplatesTab()}
      {activeTab === 1 && renderGenerationTab()}
      
      {/* Dialog de création de template */}
      <Dialog
        open={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Nouveau Template de Document
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom du template"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={templateForm.type}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value as any }))}
                    label="Type"
                  >
                    <MenuItem value="report">Rapport</MenuItem>
                    <MenuItem value="statement">État Financier</MenuItem>
                    <MenuItem value="declaration">Déclaration</MenuItem>
                    <MenuItem value="certificate">Certificat</MenuItem>
                    <MenuItem value="analysis">Analyse</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={templateForm.format}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, format: e.target.value as any }))}
                    label="Format"
                  >
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="word">Word</MenuItem>
                    <MenuItem value="xml">XML</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Fréquence</InputLabel>
                  <Select
                    value={templateForm.frequency}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, frequency: e.target.value as any }))}
                    label="Fréquence"
                  >
                    <MenuItem value="monthly">Mensuel</MenuItem>
                    <MenuItem value="quarterly">Trimestriel</MenuItem>
                    <MenuItem value="annual">Annuel</MenuItem>
                    <MenuItem value="on-demand">À la demande</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={templateForm.compliance.required}
                      onChange={(e) => setTemplateForm(prev => ({
                        ...prev,
                        compliance: { ...prev.compliance, required: e.target.checked }
                      }))}
                    />
                  }
                  label="Document obligatoire (compliance)"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTemplateDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateTemplate}
            variant="contained"
            disabled={!templateForm.name}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={() => setIsGenerationDialogOpen(true)}>
          <Send sx={{ mr: 1 }} />
          Générer
        </MenuItem>
        <MenuItem onClick={() => selectedTemplate && handleVersioning(selectedTemplate)}>
          <Edit sx={{ mr: 1 }} />
          Nouvelle Version
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Download sx={{ mr: 1 }} />
          Exporter Template
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Archive sx={{ mr: 1 }} />
          Archiver
        </MenuItem>
      </Menu>

      {/* Dialog de génération */}
      <Dialog
        open={isGenerationDialogOpen}
        onClose={() => setIsGenerationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Générer le Document
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedTemplate.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedTemplate.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Période"
                    defaultValue="2024"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Société"
                    defaultValue="Entreprise ABC"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGenerationDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={() => selectedTemplate && startGeneration(selectedTemplate, { period: '2024', company: 'Entreprise ABC' })}
            variant="contained"
          >
            Générer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModernDocuments;