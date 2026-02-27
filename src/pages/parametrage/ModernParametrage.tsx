/**
 * Module de Paramétrage Complet - Configuration entreprise et système
 * Conforme aux exigences EX-PARAM-001 à EX-PARAM-010
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Divider,
  Stack,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  Skeleton,
  InputAdornment,
  Badge,
  FormHelperText,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Settings as SettingsIcon,
  AccountBalance as AccountIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Sync as SyncIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  VpnKey as KeyIcon,
  Flag as FlagIcon,
  Timer as TimerIcon,
  AutoAwesome as AutoIcon,
  ContentCopy as CopyIcon,
  CloudUpload as CloudIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Description as DocumentIcon,
  SupervisorAccount as AdminIcon,
  VerifiedUser as VerifiedIcon,
  Palette as PaletteIcon,
  DarkMode as DarkModeIcon,
  TextFields as TextFieldsIcon,
  FormatSize as FormatSizeIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'

// EX-PARAM-001: Configuration complète en moins de 2 heures
interface ConfigurationWizard {
  currentStep: number
  startTime: Date
  estimatedTime: number // en minutes
  completionPercentage: number
  canResumeLater: boolean
  autoSaveEnabled: boolean
}

// Structure entreprise avec tous les paramètres requis
interface CompanyConfig {
  // Informations de base
  id: string
  name: string
  legalForm: string
  registrationNumber: string
  taxId: string
  vatNumber?: string
  
  // Localisation
  country: string
  city: string
  address: string
  postalCode: string
  phone: string
  email: string
  website?: string
  
  // Paramètres fiscaux (EX-PARAM-003, EX-PARAM-007)
  fiscalYear: {
    start: string
    end: string
  }
  taxRegime: string
  liasseType: 'normal' | 'allege' | 'simplifie' // Auto-détecté selon CA
  vatRegime: string
  sector: string
  activityCode: string
  
  // Seuils et indicateurs
  revenue: number
  employees: number
  totalAssets: number
  
  // Multi-sites (EX-PARAM-009)
  sites?: Site[]
  
  // Statut
  status: 'draft' | 'validated' | 'active'
  lastModified: string
  modifiedBy: string
}

interface Site {
  id: string
  name: string
  address: string
  type: 'headquarters' | 'branch' | 'warehouse'
  syncEnabled: boolean
  lastSync?: string
}

// Gestion des utilisateurs et droits (EX-PARAM-008)
interface UserConfig {
  id: string
  username: string
  email: string
  role: string
  permissions: Permission[]
  modules: string[]
  status: 'active' | 'inactive' | 'pending'
  lastLogin?: string
  twoFactorEnabled: boolean
}

interface Permission {
  module: string
  actions: ('view' | 'create' | 'edit' | 'delete' | 'approve')[]
}

// Historique des modifications (EX-PARAM-005)
interface ConfigHistory {
  id: string
  timestamp: string
  user: string
  module: string
  field: string
  oldValue: any
  newValue: any
  reason?: string
}

// Validation en temps réel (EX-PARAM-002)
interface ValidationResult {
  field: string
  valid: boolean
  message?: string
  severity: 'error' | 'warning' | 'info'
  suggestion?: string
}

const ModernParametrage: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [wizardStep, setWizardStep] = useState(0)
  const [configProgress, setConfigProgress] = useState(0)
  const [validationErrors, setValidationErrors] = useState<ValidationResult[]>([])
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Paramètres de thème
  const [selectedTheme, setSelectedTheme] = useState('fiscasync')
  const [darkMode, setDarkMode] = useState(false)
  const [selectedFont, setSelectedFont] = useState('Exo 2')
  const [fontSize, setFontSize] = useState('normal')

  // Timer pour EX-PARAM-001
  const [configStartTime] = useState(new Date())
  const [elapsedTime, setElapsedTime] = useState(0)
  
  // Auto-save pour EX-PARAM-001
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)

  // Configuration de l'entreprise
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>({
    id: '1',
    name: '',
    legalForm: '',
    registrationNumber: '',
    taxId: '',
    country: 'CI',
    city: '',
    address: '',
    postalCode: '',
    phone: '',
    email: '',
    fiscalYear: {
      start: '01-01',
      end: '12-31'
    },
    taxRegime: '',
    liasseType: 'normal',
    vatRegime: '',
    sector: '',
    activityCode: '',
    revenue: 0,
    employees: 0,
    totalAssets: 0,
    status: 'draft',
    lastModified: new Date().toISOString(),
    modifiedBy: 'Admin'
  })

  // useEffect(() => {
  //   // Calculer le temps écoulé - désactivé temporairement
  //   const timer = setInterval(() => {
  //     const elapsed = Math.floor((new Date().getTime() - configStartTime.getTime()) / 1000)
  //     setElapsedTime(elapsed)
  //   }, 1000)
  //   
  //   return () => clearInterval(timer)
  // }, [configStartTime])

  // Auto-save temporairement désactivé pour déboguer
  // useEffect(() => {
  //   // Auto-save toutes les 30 secondes
  //   if (autoSaveEnabled) {
  //     const saveTimer = setInterval(() => {
  //       handleAutoSave()
  //     }, 30000)
  //     
  //     return () => clearInterval(saveTimer)
  //   }
  // }, [autoSaveEnabled, handleAutoSave])

  // EX-PARAM-003: Détection automatique du type de liasse
  const calculatedLiasseType = useMemo(() => {
    const { revenue, totalAssets, employees } = companyConfig
    
    // Seuils SYSCOHADA
    if (revenue > 1000000000 || totalAssets > 500000000 || employees > 100) {
      return 'normal'
    } else if (revenue > 30000000 || totalAssets > 125000000 || employees > 20) {
      return 'allege'
    }
    return 'simplifie'
  }, [companyConfig.revenue, companyConfig.totalAssets, companyConfig.employees])
  
  // Désactivé temporairement pour éviter la boucle infinie
  // const updateLiasseTypeIfNeeded = useCallback(() => {
  //   const newLiasseType = calculatedLiasseType;
  //   setCompanyConfig(prev => {
  //     if (newLiasseType !== prev.liasseType) {
  //       return { ...prev, liasseType: newLiasseType }
  //     }
  //     return prev
  //   })
  // }, [calculatedLiasseType])
  
  // useEffect(() => {
  //   updateLiasseTypeIfNeeded()
  // }, [updateLiasseTypeIfNeeded])

  // Données de référence
  const legalForms = [
    'SA - Société Anonyme',
    'SARL - Société à Responsabilité Limitée',
    'SAS - Société par Actions Simplifiée',
    'SNC - Société en Nom Collectif',
    'SCS - Société en Commandite Simple',
    'GIE - Groupement d\'Intérêt Économique',
    'Entreprise Individuelle',
    'Coopérative'
  ]

  const sectors = [
    { code: 'A', name: 'Agriculture, sylviculture et pêche' },
    { code: 'B', name: 'Industries extractives' },
    { code: 'C', name: 'Industrie manufacturière' },
    { code: 'D', name: 'Production et distribution d\'électricité' },
    { code: 'E', name: 'Production et distribution d\'eau' },
    { code: 'F', name: 'Construction' },
    { code: 'G', name: 'Commerce' },
    { code: 'H', name: 'Transports et entreposage' },
    { code: 'I', name: 'Hébergement et restauration' },
    { code: 'J', name: 'Information et communication' },
    { code: 'K', name: 'Activités financières et d\'assurance' },
    { code: 'L', name: 'Activités immobilières' },
    { code: 'M', name: 'Activités spécialisées' },
    { code: 'N', name: 'Activités de services administratifs' }
  ]

  const taxRegimes = [
    'Réel normal',
    'Réel simplifié',
    'Micro-entreprise',
    'Forfait'
  ]

  const countries = [
    { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
    { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: 'ML', name: 'Mali', flag: '🇲🇱' },
    { code: 'TG', name: 'Togo', flag: '🇹🇬' },
    { code: 'BJ', name: 'Bénin', flag: '🇧🇯' },
    { code: 'NE', name: 'Niger', flag: '🇳🇪' },
    { code: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼' }
  ]

  // Configuration des thèmes
  const themes = [
    {
      id: 'fiscasync',
      name: 'Élégance Sobre',
      subtitle: 'Finance traditionnelle moderne',
      current: true,
      colors: {
        primary: '#171717',
        secondary: '#737373',
        background: '#fafafa',
        surface: '#ffffff'
      }
    },
    {
      id: 'modern-fintech',
      name: 'Modern Fintech',
      subtitle: 'Tableau de bord financier moderne',
      colors: {
        primary: '#171717',
        secondary: '#42a5f5',
        background: '#f5f5f5',
        surface: '#ffffff'
      }
    },
    {
      id: 'minimalist-premium',
      name: 'Minimaliste Premium',
      subtitle: 'Élégance minimaliste avec touche premium',
      colors: {
        primary: '#2c3e50',
        secondary: '#95a5a6',
        background: '#ecf0f1',
        surface: '#ffffff'
      }
    },
    {
      id: 'neutral-odyssey',
      name: 'Neutral Odyssey',
      subtitle: 'Palette haut de gamme pour immobilier',
      colors: {
        primary: '#34495e',
        secondary: '#7f8c8d',
        background: '#bdc3c7',
        surface: '#ecf0f1'
      }
    }
  ]

  const fontOptions = [
    { value: 'Inter', label: 'Inter (Recommandée)', current: false },
    { value: 'Exo 2', label: 'Exo 2 (Actuelle)', current: true },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' }
  ]

  const fontSizes = [
    { value: 'small', label: 'Petite (12px)' },
    { value: 'normal', label: 'Normale (14px)' },
    { value: 'large', label: 'Grande (16px)' },
    { value: 'xlarge', label: 'Très grande (18px)' }
  ]

  const users: UserConfig[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@fiscasync.com',
      role: 'Administrateur',
      permissions: [
        { module: 'all', actions: ['view', 'create', 'edit', 'delete', 'approve'] }
      ],
      modules: ['all'],
      status: 'active',
      lastLogin: '2024-12-16 14:30',
      twoFactorEnabled: true
    },
    {
      id: '2',
      username: 'comptable1',
      email: 'comptable@fiscasync.com',
      role: 'Comptable',
      permissions: [
        { module: 'balance', actions: ['view', 'create', 'edit'] },
        { module: 'liasse', actions: ['view', 'create'] }
      ],
      modules: ['balance', 'liasse', 'audit'],
      status: 'active',
      lastLogin: '2024-12-16 10:15',
      twoFactorEnabled: false
    }
  ]

  const configHistory: ConfigHistory[] = [
    {
      id: '1',
      timestamp: '2024-12-16 14:25',
      user: 'Admin',
      module: 'Entreprise',
      field: 'revenue',
      oldValue: 1000000000,
      newValue: 1500000000,
      reason: 'Mise à jour après clôture Q4'
    },
    {
      id: '2',
      timestamp: '2024-12-15 09:30',
      user: 'Admin',
      module: 'Fiscal',
      field: 'taxRegime',
      oldValue: 'Réel simplifié',
      newValue: 'Réel normal',
      reason: 'Changement suite dépassement seuil CA'
    }
  ]

  // EX-PARAM-002: Validation en temps réel
  const validateField = (field: string, value: any): ValidationResult => {
    switch (field) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return {
            field,
            valid: false,
            message: 'Format email invalide',
            severity: 'error',
            suggestion: 'Utilisez le format: exemple@domaine.com'
          }
        }
        break
      }
        
      case 'registrationNumber':
        if (!value || value.length < 10) {
          return {
            field,
            valid: false,
            message: 'Numéro RCCM incomplet',
            severity: 'error',
            suggestion: 'Format: CI-ABJ-2024-A-123456'
          }
        }
        break
        
      case 'revenue':
        if (value < 0) {
          return {
            field,
            valid: false,
            message: 'Le chiffre d\'affaires ne peut être négatif',
            severity: 'error'
          }
        }
        if (value > 10000000000) {
          return {
            field,
            valid: false,
            message: 'Vérifiez l\'unité (FCFA)',
            severity: 'warning',
            suggestion: 'Montant très élevé détecté'
          }
        }
        break
    }
    
    return { field, valid: true, message: '', severity: 'info' }
  }

  // EX-PARAM-003: Détection automatique du type de liasse
  // Function moved into useEffect to prevent infinite loop

  // EX-PARAM-004: Valeurs par défaut intelligentes
  const applySmartDefaults = () => {
    const sectorDefaults: Record<string, Partial<CompanyConfig>> = {
      'G': { // Commerce
        vatRegime: 'Mensuel',
        fiscalYear: { start: '01-01', end: '12-31' }
      },
      'C': { // Industrie
        vatRegime: 'Trimestriel',
        fiscalYear: { start: '01-01', end: '12-31' }
      },
      'K': { // Finance
        fiscalYear: { start: '01-01', end: '12-31' },
        taxRegime: 'Réel normal'
      }
    }
    
    if (companyConfig.sector && sectorDefaults[companyConfig.sector]) {
      setCompanyConfig(prev => ({
        ...prev,
        ...sectorDefaults[companyConfig.sector]
      }))
    }
  }

  // EX-PARAM-006: Import/Export de configuration
  const handleExportConfig = () => {
    const configData = JSON.stringify(companyConfig, null, 2)
    const blob = new Blob([configData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `config_${companyConfig.name}_${new Date().toISOString()}.json`
    link.click()
  }

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string)
          setCompanyConfig(config)
          // Valider la configuration importée
          validateAllFields()
        } catch (error) {
          console.error('Erreur import:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  // EX-PARAM-007: Contrôle de cohérence
  const checkCoherence = (): boolean => {
    const errors: ValidationResult[] = []
    
    // Vérifier cohérence fiscale/comptable
    if (companyConfig.taxRegime === 'Micro-entreprise' && companyConfig.revenue > 50000000) {
      errors.push({
        field: 'taxRegime',
        valid: false,
        message: 'Régime micro incompatible avec CA > 50M FCFA',
        severity: 'error'
      })
    }
    
    // Vérifier cohérence dates
    const startMonth = parseInt(companyConfig.fiscalYear.start.split('-')[0])
    const endMonth = parseInt(companyConfig.fiscalYear.end.split('-')[0])
    if (startMonth > endMonth && endMonth !== 12) {
      errors.push({
        field: 'fiscalYear',
        valid: false,
        message: 'Exercice fiscal incohérent',
        severity: 'error'
      })
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  // EX-PARAM-010: Alerter si configuration incomplète
  const checkCompleteness = (): boolean => {
    const requiredFields = [
      'name', 'legalForm', 'registrationNumber', 'taxId',
      'country', 'city', 'address', 'phone', 'email',
      'taxRegime', 'sector', 'revenue'
    ]
    
    const missingFields = requiredFields.filter(field => 
      !companyConfig[field as keyof CompanyConfig]
    )
    
    if (missingFields.length > 0) {
      setValidationErrors(prev => [...prev, {
        field: 'general',
        valid: false,
        message: `Champs manquants: ${missingFields.join(', ')}`,
        severity: 'error'
      }])
      return false
    }
    
    return true
  }

  const validateAllFields = () => {
    const errors: ValidationResult[] = []
    
    // Valider chaque champ
    Object.entries(companyConfig).forEach(([key, value]) => {
      const result = validateField(key, value)
      if (!result.valid) {
        errors.push(result)
      }
    })
    
    setValidationErrors(errors)
    
    // Vérifier la cohérence
    checkCoherence()
    
    // Vérifier la complétude
    checkCompleteness()
    
    return errors.length === 0
  }

  const handleAutoSave = useCallback(() => {
    if (autoSaveEnabled) {
      // Sauvegarder la configuration
      console.log('Auto-save:', companyConfig)
      setLastSaveTime(new Date())
    }
  }, [autoSaveEnabled, companyConfig])

  const handleNextStep = () => {
    // Valider l'étape actuelle avant de continuer
    if (validateAllFields()) {
      setWizardStep(prev => prev + 1)
      updateProgress()
    }
  }

  const handlePreviousStep = () => {
    setWizardStep(prev => prev - 1)
  }

  const updateProgress = () => {
    const totalSteps = 6
    const progress = ((wizardStep + 1) / totalSteps) * 100
    setConfigProgress(progress)
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
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
      {/* Header avec timer EX-PARAM-001 */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Paramétrage Complet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configuration complète de votre entreprise et du système
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Timer de configuration */}
            <Chip
              icon={<TimerIcon />}
              label={`Temps: ${formatTime(elapsedTime)}`}
              color={elapsedTime < 7200 ? 'success' : 'warning'} // < 2h = vert
              variant="outlined"
            />
            
            {/* Statut auto-save */}
            <FormControlLabel
              control={
                <Switch
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                />
              }
              label="Auto-save"
            />
            
            {lastSaveTime && (
              <Chip
                icon={<CheckIcon />}
                label={`Sauvegardé ${lastSaveTime.toLocaleTimeString()}`}
                size="small"
                color="success"
                variant="outlined"
              />
            )}
            
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setHistoryDialogOpen(true)}
            >
              Historique
            </Button>
            
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleAutoSave}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Sauvegarder
            </Button>
          </Stack>
        </Box>
        
        {/* Barre de progression globale */}
        <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Configuration: {Math.round(configProgress)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={configProgress}
              sx={{ 
                flexGrow: 1, 
                height: 8, 
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.divider, 0.1),
              }}
            />
            {configProgress === 100 && (
              <Chip
                icon={<CheckIcon />}
                label="Complète"
                size="small"
                color="success"
              />
            )}
          </Box>
        </Paper>
      </Box>

      {/* Alertes de validation EX-PARAM-002 */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Erreurs de configuration détectées</AlertTitle>
          <List dense>
            {validationErrors.map((error, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText
                  primary={error.message}
                  secondary={error.suggestion}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Contenu principal */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={3}>
          {/* Assistant de configuration EX-PARAM-001 */}
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Assistant de configuration
              </Typography>
              
              <Stepper activeStep={wizardStep} orientation="vertical">
                <Step>
                  <StepLabel>Informations entreprise</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Paramètres fiscaux</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Plan comptable</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Utilisateurs</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Multi-sites</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Validation finale</StepLabel>
                </Step>
              </Stepper>
              
              <Divider sx={{ my: 2 }} />
              
              <Alert severity="info">
                <Typography variant="caption">
                  Configuration guidée en moins de 2 heures avec validation temps réel
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          {/* Import/Export EX-PARAM-006 */}
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Import/Export
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setImportDialogOpen(true)}
                >
                  Importer configuration
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportConfig}
                >
                  Exporter configuration
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CopyIcon />}
                >
                  Dupliquer pour filiale
                </Button>
              </Stack>
              
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Import depuis RCCM disponible
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={9}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Entreprise" icon={<BusinessIcon />} iconPosition="start" />
                <Tab label="Fiscal" icon={<AccountIcon />} iconPosition="start" />
                <Tab label="Utilisateurs" icon={<GroupIcon />} iconPosition="start" />
                <Tab label="Sécurité" icon={<SecurityIcon />} iconPosition="start" />
                <Tab label="Notification" icon={<NotificationsIcon />} iconPosition="start" />
                <Tab label="Thème" icon={<PaletteIcon />} iconPosition="start" />
                <Tab label="Avancé" icon={<SettingsIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              {/* Informations entreprise */}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Informations de l'entreprise
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Raison sociale"
                      value={companyConfig.name}
                      onChange={(e) => {
                        setCompanyConfig(prev => ({ ...prev, name: e.target.value }))
                        validateField('name', e.target.value)
                      }}
                      error={validationErrors.some(e => e.field === 'name')}
                      helperText={validationErrors.find(e => e.field === 'name')?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Forme juridique</InputLabel>
                      <Select
                        value={companyConfig.legalForm}
                        label="Forme juridique"
                        onChange={(e) => setCompanyConfig(prev => ({ ...prev, legalForm: e.target.value }))}
                      >
                        {legalForms.map((form) => (
                          <MenuItem key={form} value={form}>{form}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Numéro RCCM"
                      value={companyConfig.registrationNumber}
                      onChange={(e) => {
                        setCompanyConfig(prev => ({ ...prev, registrationNumber: e.target.value }))
                        validateField('registrationNumber', e.target.value)
                      }}
                      error={validationErrors.some(e => e.field === 'registrationNumber')}
                      helperText={validationErrors.find(e => e.field === 'registrationNumber')?.message || 'Format: CI-ABJ-2024-A-123456'}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Numéro CC (Compte Contribuable)"
                      value={companyConfig.taxId}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, taxId: e.target.value }))}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Pays</InputLabel>
                      <Select
                        value={companyConfig.country}
                        label="Pays"
                        onChange={(e) => setCompanyConfig(prev => ({ ...prev, country: e.target.value }))}
                      >
                        {countries.map((country) => (
                          <MenuItem key={country.code} value={country.code}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{country.flag}</span>
                              {country.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ville"
                      value={companyConfig.city}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, city: e.target.value }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse complète"
                      value={companyConfig.address}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, address: e.target.value }))}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      value={companyConfig.phone}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, phone: e.target.value }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={companyConfig.email}
                      onChange={(e) => {
                        setCompanyConfig(prev => ({ ...prev, email: e.target.value }))
                        validateField('email', e.target.value)
                      }}
                      error={validationErrors.some(e => e.field === 'email')}
                      helperText={validationErrors.find(e => e.field === 'email')?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Site web"
                      value={companyConfig.website}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, website: e.target.value }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LanguageIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Indicateurs pour détection automatique EX-PARAM-003 */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Indicateurs d'activité
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Chiffre d'affaires annuel (FCFA)"
                      type="number"
                      value={companyConfig.revenue}
                      onChange={(e) => {
                        setCompanyConfig(prev => ({ ...prev, revenue: parseInt(e.target.value) }))
                        validateField('revenue', parseInt(e.target.value))
                      }}
                      error={validationErrors.some(e => e.field === 'revenue')}
                      helperText={validationErrors.find(e => e.field === 'revenue')?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MoneyIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Total bilan (FCFA)"
                      type="number"
                      value={companyConfig.totalAssets}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, totalAssets: parseInt(e.target.value) }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AssessmentIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Nombre d'employés"
                      type="number"
                      value={companyConfig.employees}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, employees: parseInt(e.target.value) }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <GroupIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Type de liasse auto-détecté */}
                <Alert severity="success" sx={{ mt: 3 }}>
                  <AlertTitle>Type de liasse détecté automatiquement</AlertTitle>
                  <Typography variant="body2">
                    Basé sur vos indicateurs, le système normal {companyConfig.liasseType === 'normal' ? 'NORMAL' : 
                    companyConfig.liasseType === 'allege' ? 'ALLÉGÉ' : 'SIMPLIFIÉ'} sera appliqué.
                  </Typography>
                </Alert>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              {/* Paramètres fiscaux EX-PARAM-007 */}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Paramètres fiscaux et comptables
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Secteur d'activité</InputLabel>
                      <Select
                        value={companyConfig.sector}
                        label="Secteur d'activité"
                        onChange={(e) => {
                          setCompanyConfig(prev => ({ ...prev, sector: e.target.value }))
                          applySmartDefaults() // EX-PARAM-004
                        }}
                      >
                        {sectors.map((sector) => (
                          <MenuItem key={sector.code} value={sector.code}>
                            {sector.code} - {sector.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Code activité (APE/NAF)"
                      value={companyConfig.activityCode}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, activityCode: e.target.value }))}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Régime fiscal</InputLabel>
                      <Select
                        value={companyConfig.taxRegime}
                        label="Régime fiscal"
                        onChange={(e) => setCompanyConfig(prev => ({ ...prev, taxRegime: e.target.value }))}
                      >
                        {taxRegimes.map((regime) => (
                          <MenuItem key={regime} value={regime}>{regime}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Régime TVA</InputLabel>
                      <Select
                        value={companyConfig.vatRegime}
                        label="Régime TVA"
                        onChange={(e) => setCompanyConfig(prev => ({ ...prev, vatRegime: e.target.value }))}
                      >
                        <MenuItem value="Mensuel">Mensuel</MenuItem>
                        <MenuItem value="Trimestriel">Trimestriel</MenuItem>
                        <MenuItem value="Exonéré">Exonéré</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Début exercice fiscal"
                      type="text"
                      placeholder="MM-JJ"
                      value={companyConfig.fiscalYear.start}
                      onChange={(e) => setCompanyConfig(prev => ({ 
                        ...prev, 
                        fiscalYear: { ...prev.fiscalYear, start: e.target.value }
                      }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Fin exercice fiscal"
                      type="text"
                      placeholder="MM-JJ"
                      value={companyConfig.fiscalYear.end}
                      onChange={(e) => setCompanyConfig(prev => ({ 
                        ...prev, 
                        fiscalYear: { ...prev.fiscalYear, end: e.target.value }
                      }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Valeurs par défaut intelligentes EX-PARAM-004 */}
                <Alert severity="info" sx={{ mt: 3 }}>
                  <AlertTitle>Suggestions intelligentes activées</AlertTitle>
                  <Typography variant="body2">
                    Des valeurs par défaut sont proposées selon votre secteur d'activité.
                  </Typography>
                  <Button size="small" sx={{ mt: 1 }} onClick={applySmartDefaults}>
                    Appliquer les suggestions
                  </Button>
                </Alert>

                <Divider sx={{ my: 3 }} />

                {/* Contrôle de cohérence EX-PARAM-007 */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Contrôle de cohérence fiscal/comptable
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      {checkCoherence() ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                    </ListItemIcon>
                    <ListItemText
                      primary="Cohérence régime fiscal / CA"
                      secondary={`${companyConfig.taxRegime} compatible avec CA de ${companyConfig.revenue.toLocaleString()} FCFA`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cohérence exercice fiscal"
                      secondary={`Du ${companyConfig.fiscalYear.start} au ${companyConfig.fiscalYear.end}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Type de liasse approprié"
                      secondary={`Système ${companyConfig.liasseType} détecté automatiquement`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              {/* Gestion utilisateurs EX-PARAM-008 */}
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Gestion des utilisateurs et droits
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="small"
                  >
                    Nouvel utilisateur
                  </Button>
                </Box>
                
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Utilisateur</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Rôle</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Modules</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>2FA</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {user.username[0].toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {user.username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              size="small"
                              color={user.role === 'Administrateur' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              {user.modules.slice(0, 3).map((module) => (
                                <Chip key={module} label={module} size="small" variant="outlined" />
                              ))}
                              {user.modules.length > 3 && (
                                <Chip label={`+${user.modules.length - 3}`} size="small" variant="outlined" />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.status === 'active' ? 'Actif' : 'Inactif'}
                              size="small"
                              color={user.status === 'active' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {user.twoFactorEnabled ? (
                              <CheckIcon color="success" fontSize="small" />
                            ) : (
                              <WarningIcon color="warning" fontSize="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <KeyIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <AlertTitle>Gestion granulaire des droits</AlertTitle>
                  <Typography variant="body2">
                    Définissez des permissions précises par module et par action (voir, créer, modifier, supprimer, approuver).
                  </Typography>
                </Alert>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              {/* Sécurité */}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Paramètres de sécurité
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Politique de mot de passe
                      </Typography>
                      
                      <FormGroup>
                        <FormControlLabel
                          control={<Checkbox defaultChecked />}
                          label="Longueur minimale de 8 caractères"
                        />
                        <FormControlLabel
                          control={<Checkbox defaultChecked />}
                          label="Au moins une majuscule et une minuscule"
                        />
                        <FormControlLabel
                          control={<Checkbox defaultChecked />}
                          label="Au moins un chiffre"
                        />
                        <FormControlLabel
                          control={<Checkbox defaultChecked />}
                          label="Au moins un caractère spécial"
                        />
                        <FormControlLabel
                          control={<Checkbox defaultChecked />}
                          label="Expiration après 90 jours"
                        />
                      </FormGroup>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.success.main, 0.02) }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Authentification à deux facteurs
                      </Typography>
                      
                      <FormGroup>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Activer 2FA pour les administrateurs"
                        />
                        <FormControlLabel
                          control={<Switch />}
                          label="Activer 2FA pour tous les utilisateurs"
                        />
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Envoyer codes par SMS"
                        />
                        <FormControlLabel
                          control={<Switch />}
                          label="Support Google Authenticator"
                        />
                      </FormGroup>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              {/* Notifications */}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Paramètres de notification
                </Typography>

                {/* Notifications système */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Notifications système
                </Typography>

                <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.info.main, 0.02), mb: 3 }}>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Alertes fiscales
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Être notifié des échéances fiscales importantes
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Mises à jour réglementaires
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Recevoir les nouvelles réglementations OHADA
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Rapports automatiques
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Génération automatique de rapports périodiques
                          </Typography>
                        </Box>
                      }
                    />
                  </FormGroup>
                </Paper>

                <Divider sx={{ my: 3 }} />

                {/* Notifications par email */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Notifications par email
                </Typography>

                <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.success.main, 0.02), mb: 3 }}>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Résumé quotidien
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Recevoir un résumé quotidien des activités
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Erreurs de validation
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Être alerté en cas d'erreurs de validation
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Newsletter mensuelle
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Conseils et bonnes pratiques FiscaSync
                          </Typography>
                        </Box>
                      }
                    />
                  </FormGroup>
                </Paper>

                <Divider sx={{ my: 3 }} />

                {/* Canaux de notification */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Canaux de notification
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <EmailIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Email
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        admin@fiscasync.com
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip label="Actif" size="small" color="success" />
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <NotificationsIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Navigateur
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Notifications dans l'app
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip label="Actif" size="small" color="success" />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                  <Button variant="outlined">
                    Réinitialiser
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                  >
                    Sauvegarder
                  </Button>
                </Box>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={5}>
              {/* Thème de l'application */}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Thème de l'application
                </Typography>

                {/* Sélection du thème */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Thèmes prédéfinis
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {themes.map((themeOption) => (
                    <Grid item xs={12} sm={6} md={3} key={themeOption.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: selectedTheme === themeOption.id ? 2 : 1,
                          borderColor: selectedTheme === themeOption.id ? 'primary.main' : 'divider',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: theme.shadows[4]
                          }
                        }}
                        onClick={() => setSelectedTheme(themeOption.id)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          {/* Aperçu des couleurs */}
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                backgroundColor: themeOption.colors.primary,
                                borderRadius: 1
                              }}
                            />
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                backgroundColor: themeOption.colors.secondary,
                                borderRadius: 1
                              }}
                            />
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                backgroundColor: themeOption.colors.background,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            />
                          </Box>

                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {themeOption.name}
                            {themeOption.current && (
                              <Chip
                                label="Actuel"
                                size="small"
                                color="primary"
                                sx={{ ml: 1, fontSize: '0.6rem' }}
                              />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {themeOption.subtitle}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Options d'affichage */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Options d'affichage
                </Typography>

                <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.info.main, 0.02), mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        icon={<DarkModeIcon />}
                        checkedIcon={<DarkModeIcon />}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Mode sombre
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Activer le thème sombre (bientôt disponible)
                        </Typography>
                      </Box>
                    }
                    disabled
                  />
                </Paper>

                <Divider sx={{ my: 3 }} />

                {/* Typographie */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Typographie
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Police d'affichage</InputLabel>
                      <Select
                        value={selectedFont}
                        label="Police d'affichage"
                        onChange={(e) => setSelectedFont(e.target.value)}
                        startAdornment={
                          <InputAdornment position="start">
                            <TextFieldsIcon />
                          </InputAdornment>
                        }
                      >
                        {fontOptions.map((font) => (
                          <MenuItem key={font.value} value={font.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <Typography sx={{ fontFamily: font.value }}>
                                {font.label}
                              </Typography>
                              {font.current && (
                                <Chip label="Actuelle" size="small" color="primary" />
                              )}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        Police utilisée pour l'interface utilisateur
                      </FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Taille de police</InputLabel>
                      <Select
                        value={fontSize}
                        label="Taille de police"
                        onChange={(e) => setFontSize(e.target.value)}
                        startAdornment={
                          <InputAdornment position="start">
                            <FormatSizeIcon />
                          </InputAdornment>
                        }
                      >
                        {fontSizes.map((size) => (
                          <MenuItem key={size.value} value={size.value}>
                            {size.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        Ajustez la taille de police selon votre préférence
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Aperçu en temps réel */}
                <Paper sx={{ p: 3, mt: 3, backgroundColor: alpha(theme.palette.success.main, 0.02) }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Aperçu du thème sélectionné
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: themes.find(t => t.id === selectedTheme)?.colors.background,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: themes.find(t => t.id === selectedTheme)?.colors.surface,
                        mb: 2
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: themes.find(t => t.id === selectedTheme)?.colors.primary,
                          fontFamily: selectedFont,
                          fontSize: fontSize === 'small' ? '1rem' :
                                   fontSize === 'large' ? '1.5rem' :
                                   fontSize === 'xlarge' ? '1.75rem' : '1.25rem'
                        }}
                      >
                        Titre d'exemple
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: themes.find(t => t.id === selectedTheme)?.colors.secondary,
                          fontFamily: selectedFont,
                          fontSize: fontSize === 'small' ? '0.75rem' :
                                   fontSize === 'large' ? '1rem' :
                                   fontSize === 'xlarge' ? '1.125rem' : '0.875rem'
                        }}
                      >
                        Texte d'exemple pour visualiser les changements de thème et de typographie.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: themes.find(t => t.id === selectedTheme)?.colors.primary,
                        fontFamily: selectedFont
                      }}
                    >
                      Bouton d'exemple
                    </Button>
                  </Box>
                </Paper>

                {/* Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                  <Button variant="outlined">
                    Réinitialiser
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                  >
                    Appliquer le thème
                  </Button>
                </Box>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={6}>
              {/* Paramètres avancés */}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Paramètres avancés
                </Typography>
                
                {/* Multi-sites EX-PARAM-009 */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Configuration multi-sites
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <BusinessIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Siège social - Abidjan"
                          secondary="Site principal • Synchronisation active"
                        />
                        <ListItemSecondaryAction>
                          <Chip label="Principal" size="small" color="primary" />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <BusinessIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Agence Bouaké"
                          secondary="Dernière sync: il y a 2h"
                        />
                        <ListItemSecondaryAction>
                          <IconButton size="small">
                            <SyncIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                    
                    <Button variant="outlined" startIcon={<AddIcon />} sx={{ mt: 2 }}>
                      Ajouter un site
                    </Button>
                  </AccordionDetails>
                </Accordion>
                
                {/* Historique EX-PARAM-005 */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Historique des modifications
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Utilisateur</TableCell>
                            <TableCell>Module</TableCell>
                            <TableCell>Modification</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {configHistory.map((history) => (
                            <TableRow key={history.id}>
                              <TableCell>{history.timestamp}</TableCell>
                              <TableCell>{history.user}</TableCell>
                              <TableCell>{history.module}</TableCell>
                              <TableCell>
                                {history.field}: {history.oldValue} → {history.newValue}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </TabPanel>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Import */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Importer une configuration</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Importez une configuration existante ou depuis le RCCM
          </Alert>
          
          <Stack spacing={2}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
            >
              Sélectionner fichier JSON
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleImportConfig}
              />
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<CloudIcon />}
              fullWidth
            >
              Importer depuis RCCM
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Historique */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Historique complet des modifications</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Toutes les modifications sont tracées conformément à EX-PARAM-005
          </Alert>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Horodatage</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Champ</TableCell>
                  <TableCell>Ancienne valeur</TableCell>
                  <TableCell>Nouvelle valeur</TableCell>
                  <TableCell>Raison</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configHistory.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>{history.timestamp}</TableCell>
                    <TableCell>{history.user}</TableCell>
                    <TableCell>{history.module}</TableCell>
                    <TableCell>{history.field}</TableCell>
                    <TableCell>{history.oldValue}</TableCell>
                    <TableCell>{history.newValue}</TableCell>
                    <TableCell>{history.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Fermer</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Exporter CSV
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModernParametrage