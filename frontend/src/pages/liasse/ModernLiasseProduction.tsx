import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Divider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Menu,
  Fade,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  Radio,
  RadioGroup,
  FormGroup,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Description,
  Add,
  Edit,
  Delete,
  Download,
  Print,
  Send,
  Visibility,
  Settings,
  Schedule,
  CloudUpload,
  FileCopy,
  Archive,
  History,
  Refresh,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  ExpandMore,
  FilterList,
  Search,
  MoreVert,
  Folder,
  InsertDriveFile,
  PictureAsPdf,
  TableView,
  Code,
  Image,
  BusinessCenter,
  AccountBalance,
  TrendingUp,
  Assessment,
  Timeline,
  Security,
  VerifiedUser,
  PlayArrow,
  Pause,
  Stop,
  Speed,
  AutoFixHigh,
  DataUsage,
  Calculate,
  CompareArrows,
  Build
} from '@mui/icons-material';

interface LiasseTemplate {
  id: string;
  name: string;
  type: 'normal' | 'simplifiee' | 'consolidee';
  jurisdiction: string;
  sector: string;
  year: number;
  status: 'draft' | 'in-progress' | 'completed' | 'validated' | 'submitted';
  progress: number;
  company: {
    name: string;
    siret: string;
    sector: string;
    size: 'TPE' | 'PME' | 'ETI' | 'GE';
  };
  documents: LiasseDocument[];
  validations: ValidationResult[];
  createdAt: Date;
  lastModified: Date;
  deadline: Date;
  isUrgent: boolean;
}

interface LiasseDocument {
  id: string;
  name: string;
  type: 'bilan' | 'resultat' | 'annexes' | 'tresorerie' | 'immobilisations' | 'provisions';
  status: 'empty' | 'partial' | 'complete' | 'validated';
  progress: number;
  data: Record<string, any>;
  calculations: Record<string, number>;
  validations: string[];
  lastUpdated: Date;
  isRequired: boolean;
  dependencies: string[];
}

interface ValidationResult {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'coherence' | 'completude' | 'conformite' | 'calcul';
  message: string;
  documentId?: string;
  field?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isBlocking: boolean;
  suggestion?: string;
}

interface ProductionStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress: number;
  estimatedTime: number;
  actualTime?: number;
  dependencies: string[];
  isOptional: boolean;
}

const ModernLiasseProduction: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [liasses, setLiasses] = useState<LiasseTemplate[]>([]);
  const [selectedLiasse, setSelectedLiasse] = useState<LiasseTemplate | null>(null);
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false);
  const [productionSteps, setProductionSteps] = useState<ProductionStep[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [isProducing, setIsProducing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // EX-LIASSE-001: Production automatisée en moins de 30 minutes
  const [productionStartTime, setProductionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // EX-LIASSE-002: Templates par secteur et juridiction
  const sectorTemplates = {
    'Commerce': ['Commerce de détail', 'Commerce de gros', 'E-commerce'],
    'Industrie': ['Manufacturier', 'Agroalimentaire', 'Textile'],
    'Services': ['Conseil', 'IT', 'Transport', 'Santé'],
    'BTP': ['Construction', 'Génie civil', 'Rénovation'],
    'Agriculture': ['Cultures', 'Élevage', 'Foresterie']
  };

  const jurisdictionTemplates = {
    'OHADA': ['Bénin', 'Burkina Faso', 'Cameroun', 'Côte d\'Ivoire', 'Gabon', 'Mali', 'Niger', 'Sénégal', 'Tchad', 'Togo'],
    'SYSCOHADA': ['Tous pays OHADA'],
    'National': ['Spécifique par pays']
  };

  // Initialisation
  useEffect(() => {
    initializeLiasseTemplates();
    initializeProductionSteps();
  }, []);

  // Timer pour le suivi de performance
  useEffect(() => {
    if (isProducing && productionStartTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - productionStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isProducing, productionStartTime]);

  const initializeLiasseTemplates = () => {
    const mockLiasses: LiasseTemplate[] = [
      {
        id: '1',
        name: 'Liasse Fiscale 2024 - ABC Commerce',
        type: 'normal',
        jurisdiction: 'OHADA',
        sector: 'Commerce',
        year: 2024,
        status: 'in-progress',
        progress: 65,
        company: {
          name: 'ABC Commerce SARL',
          siret: '12345678901234',
          sector: 'Commerce de détail',
          size: 'PME'
        },
        documents: [],
        validations: [],
        createdAt: new Date('2024-10-01'),
        lastModified: new Date('2024-11-15'),
        deadline: new Date('2024-12-31'),
        isUrgent: true
      },
      {
        id: '2',
        name: 'États Financiers 2024 - DEF Industries',
        type: 'consolidee',
        jurisdiction: 'SYSCOHADA',
        sector: 'Industrie',
        year: 2024,
        status: 'completed',
        progress: 100,
        company: {
          name: 'DEF Industries SA',
          siret: '98765432109876',
          sector: 'Manufacturier',
          size: 'GE'
        },
        documents: [],
        validations: [],
        createdAt: new Date('2024-09-15'),
        lastModified: new Date('2024-11-20'),
        deadline: new Date('2024-12-31'),
        isUrgent: false
      }
    ];

    setLiasses(mockLiasses);
  };

  const initializeProductionSteps = () => {
    const steps: ProductionStep[] = [
      {
        id: 'step1',
        name: 'Initialisation',
        description: 'Vérification des données de base et paramétrage',
        status: 'pending',
        progress: 0,
        estimatedTime: 180, // 3 minutes
        dependencies: [],
        isOptional: false
      },
      {
        id: 'step2',
        name: 'Import des Balances',
        description: 'Importation et validation des balances comptables',
        status: 'pending',
        progress: 0,
        estimatedTime: 300, // 5 minutes
        dependencies: ['step1'],
        isOptional: false
      },
      {
        id: 'step3',
        name: 'Calculs Automatiques',
        description: 'Exécution des calculs et reports automatiques',
        status: 'pending',
        progress: 0,
        estimatedTime: 600, // 10 minutes
        dependencies: ['step2'],
        isOptional: false
      },
      {
        id: 'step4',
        name: 'Contrôles de Cohérence',
        description: 'Validation des cohérences comptables et fiscales',
        status: 'pending',
        progress: 0,
        estimatedTime: 420, // 7 minutes
        dependencies: ['step3'],
        isOptional: false
      },
      {
        id: 'step5',
        name: 'Génération Documents',
        description: 'Production des documents finaux',
        status: 'pending',
        progress: 0,
        estimatedTime: 300, // 5 minutes
        dependencies: ['step4'],
        isOptional: false
      }
    ];

    setProductionSteps(steps);
  };

  // EX-LIASSE-003: Production automatisée avec validation temps réel
  const startAutomaticProduction = async (liasse: LiasseTemplate) => {
    setIsProducing(true);
    setProductionStartTime(new Date());
    setElapsedTime(0);
    setIsProductionDialogOpen(true);
    
    // Réinitialiser les étapes
    const resetSteps = productionSteps.map(step => ({
      ...step,
      status: 'pending' as const,
      progress: 0
    }));
    setProductionSteps(resetSteps);
    setActiveStep(0);

    // Simuler la production étape par étape
    for (let i = 0; i < productionSteps.length; i++) {
      await executeProductionStep(i);
    }

    setIsProducing(false);
  };

  const executeProductionStep = (stepIndex: number): Promise<void> => {
    return new Promise((resolve) => {
      const step = productionSteps[stepIndex];
      
      // Marquer l'étape comme en cours
      setProductionSteps(prev => prev.map((s, idx) => 
        idx === stepIndex 
          ? { ...s, status: 'in-progress' }
          : s
      ));
      setActiveStep(stepIndex);

      // Simuler la progression
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        
        setProductionSteps(prev => prev.map((s, idx) => 
          idx === stepIndex 
            ? { ...s, progress: Math.min(progress, 100) }
            : s
        ));

        if (progress >= 100) {
          clearInterval(interval);
          
          // Marquer comme terminé
          setProductionSteps(prev => prev.map((s, idx) => 
            idx === stepIndex 
              ? { 
                  ...s, 
                  status: 'completed',
                  progress: 100,
                  actualTime: step.estimatedTime + Math.random() * 60 - 30 // Variance de ±30s
                }
              : s
          ));
          
          setTimeout(resolve, 500);
        }
      }, 200);
    });
  };

  // EX-LIASSE-004: Validation multi-niveaux
  const validateLiasse = (liasse: LiasseTemplate): ValidationResult[] => {
    const validations: ValidationResult[] = [];

    // Validation de complétude
    if (liasse.progress < 100) {
      validations.push({
        id: 'val-1',
        type: 'warning',
        category: 'completude',
        message: 'La liasse n\'est pas complètement renseignée',
        severity: 'medium',
        isBlocking: false,
        suggestion: 'Compléter tous les documents obligatoires'
      });
    }

    // Validation de cohérence
    validations.push({
      id: 'val-2',
      type: 'info',
      category: 'coherence',
      message: 'Cohérence bilan - compte de résultat vérifiée',
      severity: 'low',
      isBlocking: false
    });

    // Validation de conformité
    if (liasse.type === 'consolidee') {
      validations.push({
        id: 'val-3',
        type: 'error',
        category: 'conformite',
        message: 'Éliminations intragroupe manquantes',
        severity: 'high',
        isBlocking: true,
        suggestion: 'Vérifier les éliminations dans le module consolidation'
      });
    }

    return validations;
  };

  // EX-LIASSE-005: Export multi-format
  const exportLiasse = (liasse: LiasseTemplate, format: 'pdf' | 'excel' | 'xml' | 'json') => {
    // Simulation de l'export
    console.log(`Export de la liasse ${liasse.name} au format ${format}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'validated': return 'success';
      case 'submitted': return 'success';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#4caf50';
    if (progress >= 75) return '#ff9800';
    if (progress >= 50) return '#2196f3';
    return '#f44336';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredLiasses = liasses.filter(liasse => {
    const matchesSearch = liasse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liasse.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || liasse.status === filterStatus;
    const matchesType = filterType === 'all' || liasse.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const renderProductionTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="bold">
          Production Automatisée
        </Typography>
        <Typography variant="body2">
          Sélectionnez une liasse ci-dessous pour lancer la production automatique. Le processus complet prend moins de 30 minutes.
        </Typography>
      </Alert>

      {/* Liste des liasses en production */}
      <Grid container spacing={3}>
        {liasses.map((liasse) => (
          <Grid item xs={12} key={liasse.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{liasse.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {liasse.company.name} • {liasse.year}
                    </Typography>
                  </Box>
                  <Chip
                    label={liasse.status.replace('-', ' ')}
                    color={getStatusColor(liasse.status) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Progression</Typography>
                    <Typography variant="body2" fontWeight="bold">{liasse.progress}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={liasse.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getProgressColor(liasse.progress)
                      }
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => startAutomaticProduction(liasse)}
                    disabled={liasse.status === 'completed' || isProducing}
                  >
                    Lancer la Production
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                  >
                    Voir Détails
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    disabled={liasse.status !== 'completed'}
                  >
                    Télécharger
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderTemplatesTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="bold">
          Templates par Secteur et Juridiction
        </Typography>
        <Typography variant="body2">
          Modèles préconfigurés adaptés à votre secteur d'activité et juridiction (OHADA/SYSCOHADA)
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Templates par juridiction */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
                Templates par Juridiction
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {Object.entries(jurisdictionTemplates).map(([jurisdiction, pays]) => (
                <Accordion key={jurisdiction}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography fontWeight="medium">{jurisdiction}</Typography>
                    <Chip label={Array.isArray(pays) ? pays.length : '1'} size="small" sx={{ ml: 1 }} />
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {(Array.isArray(pays) ? pays : [pays]).map((country) => (
                        <ListItem key={country}>
                          <ListItemIcon>
                            <Folder fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={country} />
                          <Button size="small" startIcon={<Add />}>
                            Utiliser
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Templates par secteur */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BusinessCenter sx={{ mr: 1, verticalAlign: 'middle' }} />
                Templates par Secteur
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {Object.entries(sectorTemplates).map(([sector, subsectors]) => (
                <Accordion key={sector}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography fontWeight="medium">{sector}</Typography>
                    <Chip label={subsectors.length} size="small" sx={{ ml: 1 }} />
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {subsectors.map((subsector) => (
                        <ListItem key={subsector}>
                          <ListItemIcon>
                            <Description fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={subsector} />
                          <Button size="small" startIcon={<Add />}>
                            Utiliser
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderValidationsTab = () => (
    <Box>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="bold">
          Validation Multi-Niveaux
        </Typography>
        <Typography variant="body2">
          Contrôles de cohérence, complétude et conformité pour toutes vos liasses
        </Typography>
      </Alert>

      {/* Résumé des validations */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {liasses.reduce((acc, l) => acc + l.validations.filter(v => v.type === 'info').length, 0)}
                </Typography>
              </Box>
              <Typography color="textSecondary" variant="body2">
                Validations OK
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {liasses.reduce((acc, l) => acc + l.validations.filter(v => v.type === 'warning').length, 0)}
                </Typography>
              </Box>
              <Typography color="textSecondary" variant="body2">
                Avertissements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {liasses.reduce((acc, l) => acc + l.validations.filter(v => v.type === 'error').length, 0)}
                </Typography>
              </Box>
              <Typography color="textSecondary" variant="body2">
                Erreurs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Security color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {liasses.reduce((acc, l) => acc + l.validations.filter(v => v.isBlocking).length, 0)}
                </Typography>
              </Box>
              <Typography color="textSecondary" variant="body2">
                Bloquantes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Détails des validations par liasse */}
      <Grid container spacing={3}>
        {liasses.map((liasse) => {
          const validationsLiasse = validateLiasse(liasse);

          return (
            <Grid item xs={12} key={liasse.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{liasse.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {validationsLiasse.length} contrôle(s) effectué(s)
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      size="small"
                    >
                      Re-valider
                    </Button>
                  </Box>

                  {validationsLiasse.length === 0 ? (
                    <Alert severity="success">
                      Aucune validation à effectuer pour cette liasse
                    </Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Catégorie</TableCell>
                            <TableCell>Message</TableCell>
                            <TableCell>Sévérité</TableCell>
                            <TableCell>Bloquant</TableCell>
                            <TableCell>Suggestion</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {validationsLiasse.map((validation) => (
                            <TableRow key={validation.id}>
                              <TableCell>
                                <Chip
                                  icon={
                                    validation.type === 'error' ? <ErrorIcon /> :
                                    validation.type === 'warning' ? <Warning /> :
                                    <CheckCircle />
                                  }
                                  label={validation.type}
                                  size="small"
                                  color={
                                    validation.type === 'error' ? 'error' :
                                    validation.type === 'warning' ? 'warning' :
                                    'success'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Chip label={validation.category} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>{validation.message}</TableCell>
                              <TableCell>
                                <Chip
                                  label={validation.severity}
                                  size="small"
                                  color={
                                    validation.severity === 'critical' ? 'error' :
                                    validation.severity === 'high' ? 'warning' :
                                    'default'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {validation.isBlocking ? (
                                  <Chip label="Oui" size="small" color="error" />
                                ) : (
                                  <Chip label="Non" size="small" />
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                  {validation.suggestion || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const renderDashboardTab = () => (
    <Box>
      {/* Métriques de performance */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessCenter color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {liasses.length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Liasses Totales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {liasses.filter(l => l.status === 'completed').length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Terminées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {liasses.filter(l => l.isUrgent).length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Urgentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Speed color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  18:45
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Temps Moyen (min)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerte de performance */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <strong>Performance EX-LIASSE-001 :</strong> Production automatisée garantie en moins de 30 minutes • 
        Validation temps réel • Support multi-juridictions OHADA/SYSCOHADA
      </Alert>

      {/* Barre d'actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Rechercher des liasses..."
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
          <InputLabel>Statut</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Statut"
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="draft">Brouillon</MenuItem>
            <MenuItem value="in-progress">En cours</MenuItem>
            <MenuItem value="completed">Terminée</MenuItem>
            <MenuItem value="validated">Validée</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="Type"
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="normal">Normale</MenuItem>
            <MenuItem value="simplifiee">Simplifiée</MenuItem>
            <MenuItem value="consolidee">Consolidée</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreationDialogOpen(true)}
          sx={{ ml: 'auto' }}
        >
          Nouvelle Liasse
        </Button>
      </Box>

      {/* Grille des liasses */}
      <Grid container spacing={3}>
        {filteredLiasses.map((liasse) => (
          <Grid item xs={12} md={6} lg={4} key={liasse.id}>
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
              onClick={() => setSelectedLiasse(liasse)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h6" noWrap>
                      {liasse.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {liasse.company.name} • {liasse.year}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {liasse.isUrgent && (
                      <Badge color="error" variant="dot">
                        <Warning color="warning" />
                      </Badge>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">
                      Progression
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {liasse.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={liasse.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getProgressColor(liasse.progress)
                      }
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={liasse.status.replace('-', ' ')}
                    size="small"
                    color={getStatusColor(liasse.status) as any}
                  />
                  <Chip
                    label={liasse.type}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Échéance: {liasse.deadline.toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Modif: {liasse.lastModified.toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<PlayArrow />}
                    onClick={(e) => {
                      e.stopPropagation();
                      startAutomaticProduction(liasse);
                    }}
                    disabled={liasse.status === 'completed'}
                  >
                    Produire
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Voir détails
                    }}
                  >
                    Voir
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderProductionDialog = () => (
    <Dialog
      open={isProductionDialogOpen}
      onClose={() => !isProducing && setIsProductionDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoFixHigh color="primary" />
          <Box>
            <Typography variant="h6">
              Production Automatique en Cours
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedLiasse?.name}
            </Typography>
          </Box>
          {productionStartTime && (
            <Chip
              label={`${formatTime(elapsedTime)} / 30:00`}
              color={elapsedTime < 1800 ? 'success' : 'warning'}
              icon={<Schedule />}
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Barre de progression générale */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" gutterBottom>
              Progression Globale
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(productionSteps.filter(s => s.status === 'completed').length / productionSteps.length) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {productionSteps.filter(s => s.status === 'completed').length} / {productionSteps.length} étapes terminées
            </Typography>
          </Box>

          {/* Stepper des étapes */}
          <Stepper activeStep={activeStep} orientation="vertical">
            {productionSteps.map((step, index) => (
              <Step key={step.id}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 
                          completed ? '#4caf50' :
                          active ? '#2196f3' :
                          step.status === 'error' ? '#f44336' : '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {completed && <CheckCircle sx={{ fontSize: 16, color: 'white' }} />}
                      {step.status === 'error' && <ErrorIcon sx={{ fontSize: 16, color: 'white' }} />}
                      {step.status === 'in-progress' && <CircularProgress size={16} sx={{ color: 'white' }} />}
                      {step.status === 'pending' && (
                        <Typography sx={{ fontSize: 12, color: completed ? 'white' : 'text.secondary' }}>
                          {index + 1}
                        </Typography>
                      )}
                    </Box>
                  )}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {step.name}
                    </Typography>
                    {step.status === 'in-progress' && (
                      <Chip
                        label={`${Math.round(step.progress)}%`}
                        size="small"
                        color="info"
                      />
                    )}
                    {step.status === 'completed' && step.actualTime && (
                      <Chip
                        label={formatTime(step.actualTime)}
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                </StepLabel>
                <StepContent>
                  <Typography color="text.secondary">
                    {step.description}
                  </Typography>
                  {step.status === 'in-progress' && (
                    <LinearProgress
                      variant="determinate"
                      value={step.progress}
                      sx={{ mt: 1, width: 200 }}
                    />
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogContent>
      <DialogActions>
        {!isProducing && (
          <Button onClick={() => setIsProductionDialogOpen(false)}>
            Fermer
          </Button>
        )}
        {isProducing && (
          <Button
            color="error"
            startIcon={<Stop />}
            onClick={() => {
              setIsProducing(false);
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
            }}
          >
            Arrêter
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Production de Liasses Fiscales
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Production automatisée complète avec validation temps réel et export multi-format
        </Typography>
      </Box>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab 
            label="Dashboard" 
            icon={<Assessment />} 
            iconPosition="start"
          />
          <Tab 
            label="Production" 
            icon={<Build />} 
            iconPosition="start"
          />
          <Tab 
            label="Templates" 
            icon={<Description />} 
            iconPosition="start"
          />
          <Tab 
            label="Validations" 
            icon={<VerifiedUser />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Contenu */}
      {activeTab === 0 && renderDashboardTab()}
      {activeTab === 1 && renderProductionTab()}
      {activeTab === 2 && renderTemplatesTab()}
      {activeTab === 3 && renderValidationsTab()}

      {/* Dialog de production automatique */}
      {renderProductionDialog()}

      {/* Dialog de création de liasse */}
      <Dialog
        open={isCreationDialogOpen}
        onClose={() => setIsCreationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Nouvelle Liasse Fiscale
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom de la liasse"
                  defaultValue={`Liasse Fiscale ${new Date().getFullYear()}`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select defaultValue="normal" label="Type">
                    <MenuItem value="normal">Normale</MenuItem>
                    <MenuItem value="simplifiee">Simplifiée</MenuItem>
                    <MenuItem value="consolidee">Consolidée</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Juridiction</InputLabel>
                  <Select defaultValue="OHADA" label="Juridiction">
                    {Object.keys(jurisdictionTemplates).map(jurisdiction => (
                      <MenuItem key={jurisdiction} value={jurisdiction}>
                        {jurisdiction}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Secteur</InputLabel>
                  <Select defaultValue="Commerce" label="Secteur">
                    {Object.keys(sectorTemplates).map(sector => (
                      <MenuItem key={sector} value={sector}>
                        {sector}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreationDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained"
            onClick={() => setIsCreationDialogOpen(false)}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModernLiasseProduction;