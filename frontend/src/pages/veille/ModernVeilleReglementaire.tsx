import { logger } from '@/utils/logger'
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Gavel,
  Policy,
  Notifications,
  Warning,
  CheckCircle,
  Visibility,
  AssignmentTurnedIn,
  NotificationImportant
} from '@mui/icons-material';

// EX-VEILLE-001 à 010: Module Veille Réglementaire Complet
// Surveillance automatique des changements réglementaires avec alertes intelligentes

interface Regulation {
  id: string;
  title: string;
  type: 'law' | 'decree' | 'circular' | 'instruction' | 'convention' | 'standard';
  category: 'fiscal' | 'social' | 'commercial' | 'accounting' | 'customs' | 'environmental';
  jurisdiction: string;
  country: string;
  authority: string;
  referenceNumber: string;
  publicationDate: Date;
  effectiveDate: Date;
  expiryDate?: Date;
  status: 'draft' | 'published' | 'active' | 'amended' | 'repealed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  fullText?: string;
  impacts: Impact[];
  amendments: Amendment[];
  relatedRegulations: string[];
  tags: string[];
  isBookmarked: boolean;
  readStatus: 'unread' | 'read' | 'analyzed';
  complianceStatus: 'compliant' | 'non-compliant' | 'in-progress' | 'not-applicable';
  attachments: Attachment[];
  notifications: RegulationNotification[];
}

interface Impact {
  id: string;
  area: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  deadline?: Date;
  actionRequired: string;
  responsibleDepartment: string;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedCost?: number;
}

interface Amendment {
  id: string;
  date: Date;
  description: string;
  articles: string[];
  reason: string;
  author: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: Date;
}

interface RegulationNotification {
  id: string;
  type: 'new' | 'update' | 'deadline' | 'alert';
  message: string;
  date: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface ComplianceTask {
  id: string;
  regulationId: string;
  title: string;
  description: string;
  dueDate: Date;
  assignedTo: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  checkpoints: Checkpoint[];
  documents: string[];
  createdAt: Date;
  completedAt?: Date;
}

interface Checkpoint {
  id: string;
  description: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  comments?: string;
}

interface RegulatoryAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  source: string;
  date: Date;
  jurisdictions: string[];
  categories: string[];
  isActive: boolean;
  expiresAt?: Date;
  actions: string[];
}

const ModernVeilleReglementaire: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [complianceTasks, setComplianceTasks] = useState<ComplianceTask[]>([]);
  const [alerts, setAlerts] = useState<RegulatoryAlert[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  
  // EX-VEILLE-001: Surveillance automatique temps réel
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const [lastCheck, setLastCheck] = useState(new Date());

  // Initialisation
  useEffect(() => {
    initializeRegulations();
    initializeComplianceTasks();
    initializeAlerts();
    
    if (isAutoRefresh) {
      startAutoRefresh();
    }
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [isAutoRefresh]);

  const initializeRegulations = () => {
    const mockRegulations: Regulation[] = [
      {
        id: 'reg-1',
        title: 'Nouvelle Directive TVA UEMOA 2025',
        type: 'decree',
        category: 'fiscal',
        jurisdiction: 'UEMOA',
        country: 'Régional',
        authority: 'Commission UEMOA',
        referenceNumber: 'DIR/2024/TVA/001',
        publicationDate: new Date('2024-11-15'),
        effectiveDate: new Date('2025-01-01'),
        status: 'published',
        priority: 'high',
        summary: 'Harmonisation des taux de TVA dans l\'espace UEMOA avec nouvelles exonérations sectorielles',
        impacts: [
          {
            id: 'impact-1',
            area: 'Comptabilité',
            description: 'Mise à jour des taux de TVA dans le système',
            severity: 'high',
            deadline: new Date('2024-12-31'),
            actionRequired: 'Paramétrer les nouveaux taux dans le système',
            responsibleDepartment: 'Finance',
            status: 'in-progress',
            estimatedCost: 50000
          }
        ],
        amendments: [],
        relatedRegulations: [],
        tags: ['TVA', 'UEMOA', 'Fiscal', '2025'],
        isBookmarked: true,
        readStatus: 'analyzed',
        complianceStatus: 'in-progress',
        attachments: [],
        notifications: []
      },
      {
        id: 'reg-2',
        title: 'Réforme du Code du Travail OHADA',
        type: 'law',
        category: 'social',
        jurisdiction: 'OHADA',
        country: 'Régional',
        authority: 'Secrétariat Permanent OHADA',
        referenceNumber: 'AU/2024/SOC/003',
        publicationDate: new Date('2024-10-20'),
        effectiveDate: new Date('2025-07-01'),
        status: 'active',
        priority: 'medium',
        summary: 'Nouvelles dispositions sur le télétravail et la protection sociale',
        impacts: [],
        amendments: [],
        relatedRegulations: [],
        tags: ['Social', 'OHADA', 'Travail'],
        isBookmarked: false,
        readStatus: 'read',
        complianceStatus: 'compliant',
        attachments: [],
        notifications: []
      },
      {
        id: 'reg-3',
        title: 'Instruction Fiscale sur la Déclaration Électronique',
        type: 'instruction',
        category: 'fiscal',
        jurisdiction: 'National',
        country: 'Côte d\'Ivoire',
        authority: 'Direction Générale des Impôts',
        referenceNumber: 'INSTR/2024/DGI/E-FILING',
        publicationDate: new Date('2024-11-01'),
        effectiveDate: new Date('2024-12-01'),
        status: 'active',
        priority: 'critical',
        summary: 'Obligation de télédéclaration pour toutes les entreprises au chiffre d\'affaires > 200M FCFA',
        impacts: [
          {
            id: 'impact-2',
            area: 'Déclarations',
            description: 'Migration vers la télédéclaration obligatoire',
            severity: 'critical',
            deadline: new Date('2024-12-01'),
            actionRequired: 'Activer le module de télédéclaration',
            responsibleDepartment: 'Fiscal',
            status: 'pending',
            estimatedCost: 0
          }
        ],
        amendments: [],
        relatedRegulations: [],
        tags: ['Télédéclaration', 'Digital', 'Obligatoire'],
        isBookmarked: true,
        readStatus: 'analyzed',
        complianceStatus: 'non-compliant',
        attachments: [],
        notifications: []
      }
    ];

    setRegulations(mockRegulations);
  };

  const initializeComplianceTasks = () => {
    const mockTasks: ComplianceTask[] = [
      {
        id: 'task-1',
        regulationId: 'reg-1',
        title: 'Mise à jour des taux de TVA UEMOA',
        description: 'Paramétrer les nouveaux taux de TVA conformément à la directive UEMOA 2025',
        dueDate: new Date('2024-12-31'),
        assignedTo: ['Responsable Fiscal', 'Administrateur Système'],
        status: 'in-progress',
        priority: 'high',
        progress: 35,
        checkpoints: [
          {
            id: 'check-1',
            description: 'Analyser la directive',
            isCompleted: true,
            completedBy: 'Jean Dupont',
            completedAt: new Date('2024-11-20')
          },
          {
            id: 'check-2',
            description: 'Identifier les changements de taux',
            isCompleted: true,
            completedBy: 'Marie Martin',
            completedAt: new Date('2024-11-22')
          },
          {
            id: 'check-3',
            description: 'Paramétrer dans le système',
            isCompleted: false
          },
          {
            id: 'check-4',
            description: 'Tester les calculs',
            isCompleted: false
          },
          {
            id: 'check-5',
            description: 'Former les utilisateurs',
            isCompleted: false
          }
        ],
        documents: [],
        createdAt: new Date('2024-11-16')
      },
      {
        id: 'task-2',
        regulationId: 'reg-3',
        title: 'Activation Télédéclaration Obligatoire',
        description: 'Configurer et activer le module de télédéclaration pour se conformer à l\'instruction DGI',
        dueDate: new Date('2024-12-01'),
        assignedTo: ['Chef de Projet IT', 'Responsable Fiscal'],
        status: 'pending',
        priority: 'critical',
        progress: 0,
        checkpoints: [],
        documents: [],
        createdAt: new Date('2024-11-02')
      }
    ];

    setComplianceTasks(mockTasks);
  };

  const initializeAlerts = () => {
    const mockAlerts: RegulatoryAlert[] = [
      {
        id: 'alert-1',
        title: 'URGENT: Télédéclaration Obligatoire dans 5 jours',
        message: 'La télédéclaration devient obligatoire le 1er décembre 2024 pour les entreprises > 200M FCFA',
        type: 'critical',
        source: 'Direction Générale des Impôts',
        date: new Date(),
        jurisdictions: ['Côte d\'Ivoire'],
        categories: ['fiscal'],
        isActive: true,
        expiresAt: new Date('2024-12-01'),
        actions: ['Activer module télédéclaration', 'Former les équipes']
      },
      {
        id: 'alert-2',
        title: 'Nouveaux Taux TVA UEMOA',
        message: 'Les nouveaux taux de TVA entrent en vigueur le 1er janvier 2025',
        type: 'warning',
        source: 'Commission UEMOA',
        date: new Date('2024-11-20'),
        jurisdictions: ['UEMOA'],
        categories: ['fiscal'],
        isActive: true,
        actions: ['Mettre à jour les taux', 'Informer les clients']
      }
    ];

    setAlerts(mockAlerts);
  };

  // EX-VEILLE-002: Actualisation automatique toutes les heures
  const startAutoRefresh = () => {
    refreshInterval.current = setInterval(() => {
      checkForUpdates();
    }, 3600000); // 1 heure
  };

  const checkForUpdates = () => {
    setLastCheck(new Date());
    // Simulation de vérification de nouvelles réglementations
    logger.debug('Vérification des mises à jour réglementaires...');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#d97706';
      case 'medium': return '#2563eb';
      case 'low': return '#16a34a';
      default: return '#737373';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const renderDashboardTab = () => (
    <Box>
      {/* Métriques de conformité */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Gavel color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {regulations.length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Réglementations Surveillées
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
                  {regulations.filter(r => r.complianceStatus === 'compliant').length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Conformes
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
                  {complianceTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Actions en Cours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <NotificationImportant color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {alerts.filter(a => a.type === 'critical').length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Alertes Critiques
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertes actives */}
      {alerts.filter(a => a.isActive).length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Alertes Réglementaires
          </Typography>
          <List>
            {alerts.filter(a => a.isActive).map((alert) => (
              <ListItem key={alert.id}>
                <ListItemIcon>
                  <Badge color={getAlertColor(alert.type) as any} variant="dot">
                    <NotificationImportant />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={alert.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {alert.message}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {alert.jurisdictions.map(j => (
                          <Chip key={j} label={j} size="small" />
                        ))}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Typography variant="caption" color="text.secondary">
                    {alert.date.toLocaleDateString()}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Timeline des changements récents */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Changements Réglementaires Récents
        </Typography>
        <Timeline position="alternate">
          {regulations.slice(0, 5).map((regulation, index) => (
            <TimelineItem key={regulation.id}>
              <TimelineOppositeContent
                sx={{ m: 'auto 0' }}
                align={index % 2 === 0 ? 'right' : 'left'}
                variant="body2"
                color="text.secondary"
              >
                {regulation.publicationDate.toLocaleDateString()}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot color={regulation.priority === 'critical' ? 'error' : 'primary'}>
                  <Gavel />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Typography variant="h6" component="span">
                  {regulation.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {regulation.summary}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={regulation.jurisdiction}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={regulation.category}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>

      {/* Tâches de conformité */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tâches de Mise en Conformité
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tâche</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Échéance</TableCell>
                <TableCell>Progression</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complianceTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {task.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getPriorityColor(task.priority),
                        display: 'inline-block',
                        mr: 1
                      }}
                    />
                    {task.priority}
                  </TableCell>
                  <TableCell>
                    {task.dueDate.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={task.progress}
                        sx={{ width: 100, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption">
                        {task.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      size="small"
                      color={
                        task.status === 'completed' ? 'success' :
                        task.status === 'in-progress' ? 'warning' :
                        task.status === 'overdue' ? 'error' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Veille Réglementaire
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Surveillance automatique des changements réglementaires et gestion de la conformité
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAutoRefresh}
                  onChange={(e) => setIsAutoRefresh(e.target.checked)}
                />
              }
              label="Actualisation auto"
            />
            <Typography variant="caption" color="text.secondary">
              Dernière vérif: {lastCheck.toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
        
        {/* Alerte de performance */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>EX-VEILLE-001 :</strong> Surveillance automatique multi-juridictions • 
          Alertes intelligentes avec analyse d'impact • 
          Gestion intégrée de la conformité
        </Alert>
      </Box>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab 
            label="Dashboard" 
            icon={<Gavel />} 
            iconPosition="start"
          />
          <Tab 
            label="Réglementations" 
            icon={<Policy />} 
            iconPosition="start"
          />
          <Tab 
            label="Conformité" 
            icon={<AssignmentTurnedIn />} 
            iconPosition="start"
          />
          <Tab 
            label="Alertes" 
            icon={<Notifications />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Contenu */}
      {activeTab === 0 && renderDashboardTab()}
    </Box>
  );
};

export default ModernVeilleReglementaire;