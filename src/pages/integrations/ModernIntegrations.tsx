import React, { useState, useEffect, useRef } from 'react';
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
  ListItemSecondaryAction,
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
  Badge,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Skeleton
} from '@mui/material';
import {
  Api,
  IntegrationInstructions,
  Cable,
  CloudSync,
  Webhook,
  DataObject,
  Code,
  Key,
  Lock,
  LockOpen,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Settings,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Schedule,
  Timeline,
  Speed,
  Storage,
  CloudUpload,
  CloudDownload,
  Sync,
  SyncProblem,
  SyncAlt,
  CompareArrows,
  SwapHoriz,
  SwapVert,
  Transform,
  AccountTree,
  Hub,
  Lan,
  Router,
  DeviceHub,
  SettingsInputComponent,
  SettingsEthernet,
  DeveloperMode,
  Terminal,
  BugReport,
  Science,
  ExpandMore,
  ContentCopy,
  Visibility,
  VisibilityOff,
  VpnKey,
  Security,
  Shield,
  VerifiedUser,
  Dashboard
} from '@mui/icons-material';

// EX-API-001 à 010: Module APIs & Intégrations Complet
// Connecteurs multi-systèmes avec synchronisation temps réel

interface APIEndpoint {
  id: string;
  name: string;
  type: 'rest' | 'soap' | 'graphql' | 'webhook';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  description: string;
  authentication: AuthMethod;
  headers: Record<string, string>;
  parameters: APIParameter[];
  responseSchema: any;
  rateLimit?: RateLimit;
  timeout: number;
  retryPolicy: RetryPolicy;
  isActive: boolean;
  lastCall?: Date;
  successRate: number;
  averageResponseTime: number;
  documentation?: string;
}

interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: string;
}

interface AuthMethod {
  type: 'none' | 'api-key' | 'bearer' | 'oauth2' | 'basic' | 'certificate';
  credentials?: {
    key?: string;
    secret?: string;
    token?: string;
    username?: string;
    password?: string;
    certificate?: string;
  };
  expiresAt?: Date;
}

interface RateLimit {
  requests: number;
  period: 'second' | 'minute' | 'hour' | 'day';
  remaining: number;
  resetsAt: Date;
}

interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  initialDelay: number;
  maxDelay: number;
}

interface Integration {
  id: string;
  name: string;
  type: 'erp' | 'crm' | 'banking' | 'tax' | 'payroll' | 'custom';
  provider: string;
  description: string;
  icon?: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  connectionDetails: ConnectionDetails;
  syncSettings: SyncSettings;
  mappings: DataMapping[];
  lastSync?: Date;
  nextSync?: Date;
  statistics: IntegrationStats;
  webhooks: Webhook[];
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

interface ConnectionDetails {
  host: string;
  port?: number;
  database?: string;
  schema?: string;
  ssl: boolean;
  authentication: AuthMethod;
  testConnection: boolean;
  lastTestDate?: Date;
  lastTestResult?: 'success' | 'failed';
}

interface SyncSettings {
  mode: 'manual' | 'scheduled' | 'realtime';
  frequency?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  direction: 'import' | 'export' | 'bidirectional';
  conflictResolution: 'source' | 'target' | 'newest' | 'manual';
  dataFilters: DataFilter[];
  transformations: DataTransformation[];
  errorHandling: 'stop' | 'skip' | 'retry';
  notifyOnError: boolean;
  notifyOnSuccess: boolean;
}

interface DataMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  isRequired: boolean;
  defaultValue?: any;
  validation?: string;
}

interface DataFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  isActive: boolean;
}

interface DataTransformation {
  type: 'format' | 'calculate' | 'lookup' | 'custom';
  source: string;
  target: string;
  expression: string;
  isActive: boolean;
}

interface IntegrationStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  recordsProcessed: number;
  recordsFailed: number;
  averageDuration: number;
  lastError?: string;
  uptime: number;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  lastTriggered?: Date;
  successRate: number;
}

interface APILog {
  id: string;
  timestamp: Date;
  endpoint: string;
  method: string;
  request: any;
  response: any;
  statusCode: number;
  duration: number;
  error?: string;
  userId?: string;
}

const ModernIntegrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [apiLogs, setApiLogs] = useState<APILog[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [isEndpointDialogOpen, setIsEndpointDialogOpen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showApiKey, setShowApiKey] = useState(false);
  const [syncStatus, setSyncStatus] = useState<Record<string, 'idle' | 'syncing' | 'success' | 'error'>>({});
  
  // EX-API-001: Monitoring temps réel des APIs
  const [apiHealth, setApiHealth] = useState<Record<string, boolean>>({});
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialisation
  useEffect(() => {
    initializeIntegrations();
    initializeEndpoints();
    startAPIMonitoring();
    
    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
    };
  }, []);

  const initializeIntegrations = () => {
    const mockIntegrations: Integration[] = [
      {
        id: 'int-1',
        name: 'SAP Business One',
        type: 'erp',
        provider: 'SAP',
        description: 'Intégration ERP SAP pour synchronisation des données comptables',
        status: 'connected',
        connectionDetails: {
          host: 'sap.entreprise.com',
          port: 8080,
          database: 'PROD',
          ssl: true,
          authentication: {
            type: 'oauth2',
            credentials: {
              token: 'eyJhbGciOiJIUzI1NiIs...'
            }
          },
          testConnection: true,
          lastTestDate: new Date(),
          lastTestResult: 'success'
        },
        syncSettings: {
          mode: 'scheduled',
          frequency: 'daily',
          direction: 'bidirectional',
          conflictResolution: 'newest',
          dataFilters: [],
          transformations: [],
          errorHandling: 'retry',
          notifyOnError: true,
          notifyOnSuccess: false
        },
        mappings: [],
        lastSync: new Date(Date.now() - 3600000),
        nextSync: new Date(Date.now() + 20 * 3600000),
        statistics: {
          totalSyncs: 145,
          successfulSyncs: 142,
          failedSyncs: 3,
          recordsProcessed: 15420,
          recordsFailed: 12,
          averageDuration: 45,
          uptime: 99.8
        },
        webhooks: [],
        isActive: true,
        createdAt: new Date('2024-01-15'),
        createdBy: 'admin'
      },
      {
        id: 'int-2',
        name: 'Banque Centrale API',
        type: 'banking',
        provider: 'BCEAO',
        description: 'API bancaire pour récupération automatique des relevés',
        status: 'connected',
        connectionDetails: {
          host: 'api.bceao.int',
          ssl: true,
          authentication: {
            type: 'api-key',
            credentials: {
              key: 'pk_live_abc123...'
            }
          },
          testConnection: true,
          lastTestDate: new Date(),
          lastTestResult: 'success'
        },
        syncSettings: {
          mode: 'realtime',
          direction: 'import',
          conflictResolution: 'source',
          dataFilters: [],
          transformations: [],
          errorHandling: 'skip',
          notifyOnError: true,
          notifyOnSuccess: false
        },
        mappings: [],
        lastSync: new Date(Date.now() - 600000),
        statistics: {
          totalSyncs: 3420,
          successfulSyncs: 3415,
          failedSyncs: 5,
          recordsProcessed: 45230,
          recordsFailed: 5,
          averageDuration: 2,
          uptime: 99.9
        },
        webhooks: [
          {
            id: 'wh-1',
            name: 'Transaction Notification',
            url: 'https://api.entreprise.com/webhooks/bank-transaction',
            events: ['transaction.created', 'transaction.updated'],
            isActive: true,
            successRate: 98.5
          }
        ],
        isActive: true,
        createdAt: new Date('2024-02-01'),
        createdBy: 'admin'
      },
      {
        id: 'int-3',
        name: 'DGI Télédéclaration',
        type: 'tax',
        provider: 'Direction Générale des Impôts',
        description: 'Interface de télédéclaration fiscale',
        status: 'disconnected',
        connectionDetails: {
          host: 'teledeclaration.dgi.ci',
          ssl: true,
          authentication: {
            type: 'certificate',
            credentials: {
              certificate: '-----BEGIN CERTIFICATE-----...'
            }
          },
          testConnection: false
        },
        syncSettings: {
          mode: 'manual',
          direction: 'export',
          conflictResolution: 'manual',
          dataFilters: [],
          transformations: [],
          errorHandling: 'stop',
          notifyOnError: true,
          notifyOnSuccess: true
        },
        mappings: [],
        statistics: {
          totalSyncs: 24,
          successfulSyncs: 24,
          failedSyncs: 0,
          recordsProcessed: 24,
          recordsFailed: 0,
          averageDuration: 120,
          uptime: 100
        },
        webhooks: [],
        isActive: false,
        createdAt: new Date('2024-03-01'),
        createdBy: 'admin'
      }
    ];

    setIntegrations(mockIntegrations);
    
    // Initialiser les statuts de synchronisation
    const statuses: Record<string, 'idle' | 'syncing' | 'success' | 'error'> = {};
    mockIntegrations.forEach(int => {
      statuses[int.id] = 'idle';
    });
    setSyncStatus(statuses);
  };

  const initializeEndpoints = () => {
    const mockEndpoints: APIEndpoint[] = [
      {
        id: 'ep-1',
        name: 'Get Account Balance',
        type: 'rest',
        method: 'GET',
        url: '/api/v1/accounts/{accountId}/balance',
        description: 'Récupère le solde d\'un compte',
        authentication: {
          type: 'bearer'
        },
        headers: {
          'Content-Type': 'application/json'
        },
        parameters: [
          {
            name: 'accountId',
            type: 'string',
            required: true,
            description: 'Identifiant du compte'
          }
        ],
        responseSchema: {},
        timeout: 30000,
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000
        },
        isActive: true,
        lastCall: new Date(Date.now() - 300000),
        successRate: 99.5,
        averageResponseTime: 250
      },
      {
        id: 'ep-2',
        name: 'Submit Tax Declaration',
        type: 'rest',
        method: 'POST',
        url: '/api/v1/declarations/submit',
        description: 'Soumet une déclaration fiscale',
        authentication: {
          type: 'certificate'
        },
        headers: {
          'Content-Type': 'application/xml'
        },
        parameters: [],
        responseSchema: {},
        timeout: 60000,
        retryPolicy: {
          maxAttempts: 1,
          backoffStrategy: 'linear',
          initialDelay: 0,
          maxDelay: 0
        },
        isActive: true,
        successRate: 100,
        averageResponseTime: 1500
      }
    ];

    setEndpoints(mockEndpoints);
  };

  // EX-API-002: Monitoring de santé des APIs
  const startAPIMonitoring = () => {
    monitoringInterval.current = setInterval(() => {
      checkAPIHealth();
    }, 30000); // Toutes les 30 secondes
  };

  const checkAPIHealth = () => {
    integrations.forEach(integration => {
      // Simulation de vérification de santé
      const isHealthy = Math.random() > 0.1; // 90% de chance d'être healthy
      setApiHealth(prev => ({
        ...prev,
        [integration.id]: isHealthy
      }));
    });
  };

  // EX-API-003: Test de connexion
  const testConnection = async (integration: Integration) => {
    setIsTestingConnection(true);
    
    // Simulation de test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.2; // 80% de succès
    
    setIntegrations(prev => prev.map(int => 
      int.id === integration.id
        ? {
            ...int,
            connectionDetails: {
              ...int.connectionDetails,
              lastTestDate: new Date(),
              lastTestResult: success ? 'success' : 'failed'
            }
          }
        : int
    ));
    
    setIsTestingConnection(false);
  };

  // EX-API-004: Synchronisation manuelle
  const syncIntegration = async (integrationId: string) => {
    setSyncStatus(prev => ({ ...prev, [integrationId]: 'syncing' }));
    
    // Simulation de synchronisation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const success = Math.random() > 0.1; // 90% de succès
    
    setSyncStatus(prev => ({ 
      ...prev, 
      [integrationId]: success ? 'success' : 'error' 
    }));
    
    // Reset après 3 secondes
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, [integrationId]: 'idle' }));
    }, 3000);
    
    if (success) {
      setIntegrations(prev => prev.map(int => 
        int.id === integrationId
          ? { ...int, lastSync: new Date() }
          : int
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'default';
      case 'error': return 'error';
      case 'syncing': return 'info';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'erp': return <AccountTree />;
      case 'crm': return <People />;
      case 'banking': return <AccountBalance />;
      case 'tax': return <Receipt />;
      case 'payroll': return <AttachMoney />;
      default: return <IntegrationInstructions />;
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || integration.type === filterType;
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const renderDashboardTab = () => (
    <Box>
      {/* Métriques d'intégration */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Hub color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {integrations.length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Intégrations Totales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {integrations.filter(i => i.status === 'connected').length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Connectées
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
                  {endpoints.length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Endpoints API
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timeline color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  99.5%
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Uptime Moyen
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Intégrations actives */}
      <Typography variant="h6" gutterBottom>
        Intégrations Actives
      </Typography>
      <Grid container spacing={3}>
        {filteredIntegrations.map((integration) => (
          <Grid item xs={12} md={6} lg={4} key={integration.id}>
            <Card
              sx={{
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[8]
                }
              }}
              onClick={() => setSelectedIntegration(integration)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {getTypeIcon(integration.type)}
                    <Box>
                      <Typography variant="h6">
                        {integration.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {integration.provider}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={integration.status}
                    size="small"
                    color={getStatusColor(integration.status) as any}
                    icon={
                      syncStatus[integration.id] === 'syncing' ? 
                        <CircularProgress size={16} /> : undefined
                    }
                  />
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {integration.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Uptime
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {integration.statistics.uptime}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={integration.statistics.uptime}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Dernière sync: {integration.lastSync?.toLocaleString() || 'Jamais'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Tester la connexion">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          testConnection(integration);
                        }}
                        disabled={isTestingConnection}
                      >
                        <Cable />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Synchroniser maintenant">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          syncIntegration(integration.id);
                        }}
                        disabled={syncStatus[integration.id] === 'syncing'}
                      >
                        <Sync />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          APIs & Intégrations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestion des connecteurs et APIs avec synchronisation temps réel
        </Typography>
        
        {/* Alerte de performance */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>EX-API-001 :</strong> Connecteurs multi-systèmes (ERP, CRM, Banques) • 
          Synchronisation bidirectionnelle temps réel • 
          Monitoring et logs détaillés des APIs
        </Alert>
      </Box>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab 
            label="Dashboard" 
            icon={<Dashboard />} 
            iconPosition="start"
          />
          <Tab 
            label="Intégrations" 
            icon={<Hub />} 
            iconPosition="start"
          />
          <Tab 
            label="Endpoints" 
            icon={<Api />} 
            iconPosition="start"
          />
          <Tab 
            label="Logs" 
            icon={<Timeline />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Contenu */}
      {activeTab === 0 && renderDashboardTab()}
    </Box>
  );
};

export default ModernIntegrations;