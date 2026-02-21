import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Alert,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  CircularProgress,
  Rating
} from '@mui/material';
import {
  Security,
  Shield,
  AdminPanelSettings,
  People,
  Policy,
  CheckCircle,
  Warning,
  History,
  LocalPolice,
  LockClock
} from '@mui/icons-material';
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme';

// EX-SECURE-001 à 010: Module Sécurité & Accès Complet
// Gestion avancée de la sécurité avec authentification multi-facteurs

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  department: string;
  status: 'active' | 'inactive' | 'suspended' | 'locked';
  createdAt: Date;
  lastLogin?: Date;
  lastPasswordChange?: Date;
  passwordExpiresAt?: Date;
  mfaEnabled: boolean;
  mfaMethod?: 'sms' | 'email' | 'authenticator';
  permissions: Permission[];
  groups: string[];
  loginAttempts: number;
  ipWhitelist: string[];
  avatar?: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  createdBy: string;
}

interface Permission {
  id: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'admin';
  conditions?: PermissionCondition[];
  scope?: 'own' | 'department' | 'company' | 'all';
}

interface PermissionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less';
  value: any;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'success' | 'failure' | 'partial';
  ipAddress: string;
  userAgent: string;
  details?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flagged: boolean;
}

interface SecurityIncident {
  id: string;
  type: 'breach' | 'attempt' | 'violation' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  detectedAt: Date;
  resolvedAt?: Date;
  affectedUsers: string[];
  affectedResources: string[];
  description: string;
  actions: string[];
  assignedTo?: string;
  notes: IncidentNote[];
}

interface IncidentNote {
  id: string;
  userId: string;
  timestamp: Date;
  content: string;
  attachments?: string[];
}

interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  startedAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  location?: string;
  device?: string;
}

const ModernSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // EX-SECURE-001: Monitoring de sécurité temps réel
  const [securityScore, setSecurityScore] = useState(85);
  const [activeThreats, setActiveThreats] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialisation
  useEffect(() => {
    initializeSecurityData();
    if (isMonitoring) {
      startSecurityMonitoring();
    }
    
    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
    };
  }, [isMonitoring]);

  const initializeSecurityData = () => {
    // Utilisateurs
    const mockUsers: User[] = [
      {
        id: 'user-1',
        username: 'admin',
        email: 'admin@entreprise.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: {
          id: 'role-1',
          name: 'Administrateur',
          description: 'Accès complet au système',
          level: 100,
          permissions: [],
          isSystem: true,
          createdAt: new Date('2024-01-01'),
          createdBy: 'system'
        },
        department: 'IT',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date(Date.now() - 3600000),
        lastPasswordChange: new Date('2024-10-01'),
        passwordExpiresAt: new Date('2025-01-01'),
        mfaEnabled: true,
        mfaMethod: 'authenticator',
        permissions: [],
        groups: ['admins'],
        loginAttempts: 0,
        ipWhitelist: [],
        securityLevel: 'critical'
      },
      {
        id: 'user-2',
        username: 'comptable1',
        email: 'marie.martin@entreprise.com',
        firstName: 'Marie',
        lastName: 'Martin',
        role: {
          id: 'role-2',
          name: 'Comptable',
          description: 'Accès aux modules comptables',
          level: 50,
          permissions: [],
          isSystem: false,
          createdAt: new Date('2024-01-15'),
          createdBy: 'admin'
        },
        department: 'Comptabilité',
        status: 'active',
        createdAt: new Date('2024-02-01'),
        lastLogin: new Date(Date.now() - 7200000),
        lastPasswordChange: new Date('2024-11-01'),
        mfaEnabled: false,
        permissions: [],
        groups: ['comptabilite'],
        loginAttempts: 0,
        ipWhitelist: [],
        securityLevel: 'medium'
      },
      {
        id: 'user-3',
        username: 'auditeur',
        email: 'pierre.durand@entreprise.com',
        firstName: 'Pierre',
        lastName: 'Durand',
        role: {
          id: 'role-3',
          name: 'Auditeur',
          description: 'Accès en lecture seule',
          level: 30,
          permissions: [],
          isSystem: false,
          createdAt: new Date('2024-01-20'),
          createdBy: 'admin'
        },
        department: 'Audit',
        status: 'active',
        createdAt: new Date('2024-03-01'),
        lastLogin: new Date(Date.now() - 86400000),
        mfaEnabled: true,
        mfaMethod: 'email',
        permissions: [],
        groups: ['audit'],
        loginAttempts: 0,
        ipWhitelist: ['192.168.1.0/24'],
        securityLevel: 'high'
      }
    ];
    setUsers(mockUsers);

    // Logs d'audit
    const mockAuditLogs: AuditLog[] = [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 1800000),
        userId: 'user-1',
        userName: 'admin',
        action: 'LOGIN',
        resource: 'Authentication',
        result: 'success',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        riskLevel: 'low',
        flagged: false
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 3600000),
        userId: 'user-2',
        userName: 'comptable1',
        action: 'UPDATE',
        resource: 'Balance',
        resourceId: 'bal-2024',
        result: 'success',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        details: 'Modification de la balance générale',
        riskLevel: 'medium',
        flagged: false
      },
      {
        id: 'log-3',
        timestamp: new Date(Date.now() - 7200000),
        userId: 'unknown',
        userName: 'unknown',
        action: 'LOGIN_FAILED',
        resource: 'Authentication',
        result: 'failure',
        ipAddress: '89.234.56.78',
        userAgent: 'curl/7.68.0',
        details: 'Tentative de connexion échouée - utilisateur inconnu',
        riskLevel: 'high',
        flagged: true
      }
    ];
    setAuditLogs(mockAuditLogs);

    // Incidents de sécurité
    const mockIncidents: SecurityIncident[] = [
      {
        id: 'inc-1',
        type: 'attempt',
        severity: 'high',
        status: 'investigating',
        detectedAt: new Date(Date.now() - 7200000),
        affectedUsers: [],
        affectedResources: ['Authentication'],
        description: 'Multiples tentatives de connexion échouées depuis une IP suspecte',
        actions: ['IP bloquée', 'Notification envoyée'],
        notes: []
      }
    ];
    setIncidents(mockIncidents);

    // Sessions actives
    const mockSessions: Session[] = [
      {
        id: 'session-1',
        userId: 'user-1',
        token: 'eyJhbGciOiJIUzI1NiIs...',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        startedAt: new Date(Date.now() - 3600000),
        lastActivity: new Date(Date.now() - 300000),
        expiresAt: new Date(Date.now() + 3600000),
        isActive: true,
        location: 'Abidjan, CI',
        device: 'Windows PC'
      },
      {
        id: 'session-2',
        userId: 'user-2',
        token: 'eyJhbGciOiJIUzI1NiIs...',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        startedAt: new Date(Date.now() - 7200000),
        lastActivity: new Date(Date.now() - 600000),
        expiresAt: new Date(Date.now() + 1800000),
        isActive: true,
        location: 'Abidjan, CI',
        device: 'MacBook'
      }
    ];
    setSessions(mockSessions);

  };

  // EX-SECURE-002: Monitoring de sécurité temps réel
  const startSecurityMonitoring = () => {
    monitoringInterval.current = setInterval(() => {
      checkSecurityStatus();
    }, 10000); // Toutes les 10 secondes
  };

  const checkSecurityStatus = () => {
    // Simulation de détection de menaces
    const threatLevel = Math.random();
    if (threatLevel > 0.95) {
      setActiveThreats(prev => prev + 1);
      // Créer un incident
      const newIncident: SecurityIncident = {
        id: `inc-${Date.now()}`,
        type: 'anomaly',
        severity: threatLevel > 0.98 ? 'critical' : 'high',
        status: 'open',
        detectedAt: new Date(),
        affectedUsers: [],
        affectedResources: [],
        description: 'Activité anormale détectée',
        actions: ['Monitoring renforcé activé'],
        notes: []
      };
      setIncidents(prev => [newIncident, ...prev]);
    }

    // Mise à jour du score de sécurité
    calculateSecurityScore();
  };

  const calculateSecurityScore = () => {
    let score = 100;
    
    // Déductions basées sur différents critères
    const usersWithoutMFA = users.filter(u => !u.mfaEnabled).length;
    score -= usersWithoutMFA * 5;
    
    const recentIncidents = incidents.filter(i => 
      i.status === 'open' && i.severity === 'critical'
    ).length;
    score -= recentIncidents * 10;
    
    const failedLogins = auditLogs.filter(l => 
      l.action === 'LOGIN_FAILED' && 
      l.timestamp > new Date(Date.now() - 86400000)
    ).length;
    score -= failedLogins * 2;
    
    setSecurityScore(Math.max(0, Math.min(100, score)));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#d97706';
      case 'medium': return '#fbbf24';
      case 'low': return '#16a34a';
      default: return P.primary500;
    }
  };

  const getSecurityScoreColor = () => {
    if (securityScore >= 80) return '#22c55e';
    if (securityScore >= 60) return '#f59e0b';
    if (securityScore >= 40) return '#d97706';
    return '#ef4444';
  };

  const renderDashboardTab = () => (
    <Box>
      {/* Score de sécurité global */}
      <Paper sx={{ p: 3, mb: 3, background: `linear-gradient(135deg, ${getSecurityScoreColor()}22 0%, ${getSecurityScoreColor()}11 100%)` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Score de Sécurité Global
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress
                variant="determinate"
                value={securityScore}
                size={80}
                thickness={4}
                sx={{
                  color: getSecurityScoreColor(),
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round'
                  }
                }}
              />
              <Box>
                <Typography variant="h3" sx={{ color: getSecurityScoreColor() }}>
                  {securityScore}%
                </Typography>
                <Rating value={securityScore / 20} readOnly precision={0.1} />
              </Box>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip
              label={`${activeThreats} Menaces Actives`}
              color={activeThreats > 0 ? 'error' : 'success'}
              icon={activeThreats > 0 ? <Warning /> : <CheckCircle />}
            />
          </Box>
        </Box>
      </Paper>

      {/* Métriques de sécurité */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {users.length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Utilisateurs Actifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Shield color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {users.filter(u => u.mfaEnabled).length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                MFA Activé
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
                  {incidents.filter(i => i.status === 'open').length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Incidents Ouverts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LockClock color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {sessions.filter(s => s.isActive).length}
                </Typography>
              </Box>
              <Typography color="textSecondary">
                Sessions Actives
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Incidents récents */}
      {incidents.filter(i => i.status === 'open').length > 0 && (
        <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'error.main' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalPolice color="error" />
            Incidents de Sécurité Actifs
          </Typography>
          <List>
            {incidents.filter(i => i.status === 'open').slice(0, 3).map((incident) => (
              <ListItem key={incident.id}>
                <ListItemIcon>
                  <Badge color="error" variant="dot">
                    <Shield sx={{ color: getSeverityColor(incident.severity) }} />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={incident.description}
                  secondary={`Détecté: ${incident.detectedAt.toLocaleString()} • Sévérité: ${incident.severity}`}
                />
                <ListItemSecondaryAction>
                  <Button size="small" color="error">
                    Résoudre
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Activité d'audit récente */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Activité d'Audit Récente
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Heure</TableCell>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Ressource</TableCell>
                <TableCell>Résultat</TableCell>
                <TableCell>Risque</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.slice(0, 5).map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp.toLocaleTimeString()}</TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.result}
                      size="small"
                      color={log.result === 'success' ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getSeverityColor(log.riskLevel),
                        display: 'inline-block'
                      }}
                    />
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
              Sécurité & Accès
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestion avancée de la sécurité avec authentification multi-facteurs et audit complet
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={isMonitoring}
                onChange={(e) => setIsMonitoring(e.target.checked)}
              />
            }
            label="Monitoring actif"
          />
        </Box>
        
        {/* Alerte de performance */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>EX-SECURE-001 :</strong> Authentification multi-facteurs (MFA) • 
          Gestion fine des permissions RBAC • 
          Audit trail complet et monitoring temps réel
        </Alert>
      </Box>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab 
            label="Dashboard" 
            icon={<Security />} 
            iconPosition="start"
          />
          <Tab 
            label="Utilisateurs" 
            icon={<People />} 
            iconPosition="start"
          />
          <Tab 
            label="Rôles & Permissions" 
            icon={<AdminPanelSettings />} 
            iconPosition="start"
          />
          <Tab 
            label="Audit" 
            icon={<History />} 
            iconPosition="start"
          />
          <Tab 
            label="Politiques" 
            icon={<Policy />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Contenu */}
      {activeTab === 0 && renderDashboardTab()}
    </Box>
  );
};

export default ModernSecurity;