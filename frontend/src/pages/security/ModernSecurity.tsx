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
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  IconButton,
  TablePagination,
  Tooltip
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
  LockClock,
  Add,
  VpnKey,
  Download,
  Save,
  PersonOff,
  PersonAdd
} from '@mui/icons-material';
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme';
import * as secService from '@/services/securityStorageService';
import type { SecUser, SecRole, AuditLog, SecurityIncident, SecSession, SecurityPolicy } from '@/services/securityStorageService';

const RESOURCES = ['Balance', 'Liasse', 'Declarations', 'Dossiers', 'Utilisateurs', 'Audit', 'Facturation', 'Veille'];
const ACTIONS: Array<'create' | 'read' | 'update' | 'delete'> = ['create', 'read', 'update', 'delete'];

const ModernSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<SecUser[]>([]);
  const [roles, setRoles] = useState<SecRole[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [sessions, setSessions] = useState<SecSession[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);

  const [securityScore, setSecurityScore] = useState(85);
  const [activeThreats, setActiveThreats] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);

  // Dialogs
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', username: '', roleId: '', department: '' });
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', level: 50 });

  // Audit filters
  const [auditUserFilter, setAuditUserFilter] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditRiskFilter, setAuditRiskFilter] = useState('');
  const [auditPage, setAuditPage] = useState(0);
  const [auditRowsPerPage, setAuditRowsPerPage] = useState(10);

  // Selected role for permissions
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const loadData = () => {
    setUsers(secService.getAllUsers());
    setRoles(secService.getAllRoles());
    setAuditLogs(secService.getAllAuditLogs());
    setIncidents(secService.getAllIncidents());
    setSessions(secService.getAllSessions());
    setPolicies(secService.getAllPolicies());
  };

  useEffect(() => {
    secService.seedSecurityData();
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('fiscasync:security-updated', handleUpdate);

    if (isMonitoring) {
      monitoringInterval.current = setInterval(() => {
        const threatLevel = Math.random();
        if (threatLevel > 0.95) {
          setActiveThreats(prev => prev + 1);
          secService.createIncident({
            type: 'anomaly',
            severity: threatLevel > 0.98 ? 'critical' : 'high',
            status: 'open',
            detectedAt: new Date().toISOString(),
            affectedUsers: [],
            affectedResources: [],
            description: 'Activité anormale détectée',
            actions: ['Monitoring renforcé activé'],
          });
        }
        calculateSecurityScore();
      }, 10000);
    }

    return () => {
      window.removeEventListener('fiscasync:security-updated', handleUpdate);
      if (monitoringInterval.current) clearInterval(monitoringInterval.current);
    };
  }, [isMonitoring]);

  const calculateSecurityScore = () => {
    const currentUsers = secService.getAllUsers();
    const currentIncidents = secService.getAllIncidents();
    const currentLogs = secService.getAllAuditLogs();

    let score = 100;
    score -= currentUsers.filter(u => !u.mfaEnabled).length * 5;
    score -= currentIncidents.filter(i => i.status === 'open' && i.severity === 'critical').length * 10;
    score -= currentLogs.filter(l => l.action === 'LOGIN_FAILED').length * 2;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'warning';
      case 'locked': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'suspended': return 'Suspendu';
      case 'locked': return 'Verrouillé';
      default: return status;
    }
  };

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || roleId;
  };

  const handleCreateUser = () => {
    if (!newUser.firstName || !newUser.email || !newUser.roleId) return;
    secService.createUser({
      ...newUser,
      status: 'active',
      mfaEnabled: false,
      groups: [],
      loginAttempts: 0,
      ipWhitelist: [],
      securityLevel: 'medium',
    });
    setNewUser({ firstName: '', lastName: '', email: '', username: '', roleId: '', department: '' });
    setUserDialogOpen(false);
  };

  const handleCreateRole = () => {
    if (!newRole.name) return;
    secService.createRole({
      ...newRole,
      permissions: [],
      isSystem: false,
      createdBy: 'admin',
    });
    setNewRole({ name: '', description: '', level: 50 });
    setRoleDialogOpen(false);
  };

  const togglePermission = (roleId: string, resource: string, action: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.isSystem) return;

    const existing = role.permissions.find(p => p.resource === resource && p.action === action);
    let updatedPerms;
    if (existing) {
      updatedPerms = role.permissions.filter(p => !(p.resource === resource && p.action === action));
    } else {
      updatedPerms = [...role.permissions, { id: `p-${Date.now()}`, resource, action: action as any, scope: 'all' as const }];
    }
    secService.updateRole(roleId, { permissions: updatedPerms });
  };

  const hasPermission = (roleId: string, resource: string, action: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return false;
    return role.permissions.some(p => (p.resource === resource && (p.action === action || p.action === 'admin')));
  };

  // ────────── Dashboard Tab ──────────

  const renderDashboardTab = () => (
    <Box>
      <Paper sx={{ p: 3, mb: 3, background: `linear-gradient(135deg, ${getSecurityScoreColor()}22 0%, ${getSecurityScoreColor()}11 100%)` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" gutterBottom>Score de Sécurité Global</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress variant="determinate" value={securityScore} size={80} thickness={4}
                sx={{ color: getSecurityScoreColor(), '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
              <Box>
                <Typography variant="h3" sx={{ color: getSecurityScoreColor() }}>{securityScore}%</Typography>
                <Rating value={securityScore / 20} readOnly precision={0.1} />
              </Box>
            </Box>
          </Box>
          <Chip label={`${activeThreats} Menaces Actives`} color={activeThreats > 0 ? 'error' : 'success'} icon={activeThreats > 0 ? <Warning /> : <CheckCircle />} />
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><People color="primary" sx={{ mr: 1 }} /><Typography variant="h6">{users.length}</Typography></Box>
            <Typography color="textSecondary">Utilisateurs Actifs</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Shield color="success" sx={{ mr: 1 }} /><Typography variant="h6">{users.filter(u => u.mfaEnabled).length}</Typography></Box>
            <Typography color="textSecondary">MFA Activé</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Warning color="warning" sx={{ mr: 1 }} /><Typography variant="h6">{incidents.filter(i => i.status === 'open').length}</Typography></Box>
            <Typography color="textSecondary">Incidents Ouverts</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><LockClock color="info" sx={{ mr: 1 }} /><Typography variant="h6">{sessions.filter(s => s.isActive).length}</Typography></Box>
            <Typography color="textSecondary">Sessions Actives</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length > 0 && (
        <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'error.main' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalPolice color="error" /> Incidents de Sécurité Actifs
          </Typography>
          <List>
            {incidents.filter(i => i.status === 'open' || i.status === 'investigating').slice(0, 3).map(incident => (
              <ListItem key={incident.id}>
                <ListItemIcon><Badge color="error" variant="dot"><Shield sx={{ color: getSeverityColor(incident.severity) }} /></Badge></ListItemIcon>
                <ListItemText primary={incident.description} secondary={`Détecté: ${new Date(incident.detectedAt).toLocaleString()} • Sévérité: ${incident.severity}`} />
                <ListItemSecondaryAction>
                  <Button size="small" color="error" onClick={() => secService.updateIncident(incident.id, { status: 'resolved', resolvedAt: new Date().toISOString() })}>
                    Résoudre
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Activité d'Audit Récente</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Heure</TableCell><TableCell>Utilisateur</TableCell><TableCell>Action</TableCell>
                <TableCell>Ressource</TableCell><TableCell>Résultat</TableCell><TableCell>Risque</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.slice(0, 5).map(log => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell><Chip label={log.result} size="small" color={log.result === 'success' ? 'success' : 'error'} /></TableCell>
                  <TableCell><Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getSeverityColor(log.riskLevel), display: 'inline-block' }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  // ────────── Utilisateurs Tab ──────────

  const renderUsersTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setUserDialogOpen(true)}>
          Ajouter Utilisateur
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell><TableCell>Email</TableCell><TableCell>Rôle</TableCell>
                <TableCell>Département</TableCell><TableCell>Statut</TableCell><TableCell>MFA</TableCell>
                <TableCell>Niveau Séc.</TableCell><TableCell>Dernière Connexion</TableCell><TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">{user.firstName} {user.lastName}</Typography>
                    <Typography variant="caption" color="text.secondary">@{user.username}</Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Chip label={getRoleName(user.roleId)} size="small" /></TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell><Chip label={getStatusLabel(user.status)} size="small" color={getStatusColor(user.status) as any} /></TableCell>
                  <TableCell>
                    <Switch size="small" checked={user.mfaEnabled}
                      onChange={() => secService.updateUser(user.id, { mfaEnabled: !user.mfaEnabled, mfaMethod: !user.mfaEnabled ? 'email' : undefined })} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getSeverityColor(user.securityLevel) }} />
                      <Typography variant="caption">{user.securityLevel}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Jamais'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Réinitialiser mot de passe">
                      <IconButton size="small" onClick={() => {
                        secService.updateUser(user.id, { lastPasswordChange: new Date().toISOString() });
                        secService.addAuditLog({ timestamp: new Date().toISOString(), userId: 'admin', userName: 'admin', action: 'PASSWORD_RESET', resource: 'User', resourceId: user.id, result: 'success', ipAddress: '127.0.0.1', userAgent: 'FiscaSync', riskLevel: 'medium', flagged: false });
                      }}>
                        <VpnKey fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={user.status === 'active' ? 'Désactiver' : 'Activer'}>
                      <IconButton size="small" onClick={() => secService.updateUser(user.id, { status: user.status === 'active' ? 'suspended' : 'active' })}>
                        {user.status === 'active' ? <PersonOff fontSize="small" /> : <CheckCircle fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un Utilisateur</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}><TextField label="Prénom" fullWidth value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Nom" fullWidth value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} /></Grid>
          </Grid>
          <TextField label="Email" fullWidth margin="normal" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
          <TextField label="Nom d'utilisateur" fullWidth margin="normal" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rôle</InputLabel>
            <Select value={newUser.roleId} label="Rôle" onChange={e => setNewUser({ ...newUser, roleId: e.target.value })}>
              {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Département" fullWidth margin="normal" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateUser}>Ajouter</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // ────────── Rôles & Permissions Tab ──────────

  const renderRolesTab = () => {
    const selectedRole = roles.find(r => r.id === selectedRoleId);

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setRoleDialogOpen(true)}>
            Nouveau Rôle
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {roles.map(role => (
            <Grid item xs={12} sm={6} md={3} key={role.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedRoleId === role.id ? '2px solid' : '1px solid',
                  borderColor: selectedRoleId === role.id ? 'primary.main' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: 4 },
                }}
                onClick={() => setSelectedRoleId(role.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{role.name}</Typography>
                    {role.isSystem && <Chip label="Système" size="small" color="primary" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{role.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`Niveau ${role.level}`} size="small" variant="outlined" />
                    <Chip label={`${role.permissions.length} permissions`} size="small" variant="outlined" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {selectedRole && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Matrice de Permissions — {selectedRole.name}
              {selectedRole.isSystem && <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>(lecture seule)</Typography>}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ressource</TableCell>
                    {ACTIONS.map(a => <TableCell key={a} align="center">{a === 'create' ? 'Créer' : a === 'read' ? 'Lire' : a === 'update' ? 'Modifier' : 'Supprimer'}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {RESOURCES.map(resource => (
                    <TableRow key={resource}>
                      <TableCell>{resource}</TableCell>
                      {ACTIONS.map(action => (
                        <TableCell key={action} align="center">
                          <Checkbox
                            size="small"
                            checked={hasPermission(selectedRole.id, resource, action)}
                            onChange={() => togglePermission(selectedRole.id, resource, action)}
                            disabled={selectedRole.isSystem}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nouveau Rôle</DialogTitle>
          <DialogContent>
            <TextField label="Nom du rôle" fullWidth margin="normal" value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} />
            <TextField label="Description" fullWidth margin="normal" multiline rows={2} value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} />
            <TextField label="Niveau (1-100)" type="number" fullWidth margin="normal" value={newRole.level} onChange={e => setNewRole({ ...newRole, level: Number(e.target.value) })} inputProps={{ min: 1, max: 100 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoleDialogOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleCreateRole}>Créer</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // ────────── Audit Tab ──────────

  const renderAuditTab = () => {
    let filtered = [...auditLogs];
    if (auditUserFilter) filtered = filtered.filter(l => l.userName.toLowerCase().includes(auditUserFilter.toLowerCase()));
    if (auditActionFilter) filtered = filtered.filter(l => l.action === auditActionFilter);
    if (auditRiskFilter) filtered = filtered.filter(l => l.riskLevel === auditRiskFilter);

    const paginatedLogs = filtered.slice(auditPage * auditRowsPerPage, auditPage * auditRowsPerPage + auditRowsPerPage);

    return (
      <Box>
        {/* Filtres */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField size="small" placeholder="Utilisateur..." value={auditUserFilter} onChange={e => setAuditUserFilter(e.target.value)} sx={{ minWidth: 180 }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Action</InputLabel>
              <Select value={auditActionFilter} label="Action" onChange={e => setAuditActionFilter(e.target.value)}>
                <MenuItem value="">Toutes</MenuItem>
                <MenuItem value="LOGIN">Connexion</MenuItem>
                <MenuItem value="LOGIN_FAILED">Connexion échouée</MenuItem>
                <MenuItem value="UPDATE">Modification</MenuItem>
                <MenuItem value="CREATE">Création</MenuItem>
                <MenuItem value="DELETE">Suppression</MenuItem>
                <MenuItem value="PASSWORD_RESET">Réinit. MDP</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Risque</InputLabel>
              <Select value={auditRiskFilter} label="Risque" onChange={e => setAuditRiskFilter(e.target.value)}>
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="low">Bas</MenuItem>
                <MenuItem value="medium">Moyen</MenuItem>
                <MenuItem value="high">Élevé</MenuItem>
                <MenuItem value="critical">Critique</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<Download />} size="small">
              Exporter
            </Button>
          </Box>
        </Paper>

        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date/Heure</TableCell><TableCell>Utilisateur</TableCell><TableCell>Action</TableCell>
                  <TableCell>Ressource</TableCell><TableCell>Résultat</TableCell><TableCell>IP</TableCell>
                  <TableCell>Risque</TableCell><TableCell>Détails</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.map(log => (
                  <TableRow key={log.id} sx={{ backgroundColor: log.flagged ? '#fef2f2' : 'inherit' }}>
                    <TableCell><Typography variant="caption">{new Date(log.timestamp).toLocaleString()}</Typography></TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell><Chip label={log.action} size="small" variant="outlined" /></TableCell>
                    <TableCell>{log.resource}{log.resourceId && <Typography variant="caption" color="text.secondary"> ({log.resourceId})</Typography>}</TableCell>
                    <TableCell><Chip label={log.result} size="small" color={log.result === 'success' ? 'success' : 'error'} /></TableCell>
                    <TableCell><Typography variant="caption">{log.ipAddress}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getSeverityColor(log.riskLevel) }} />
                        <Typography variant="caption">{log.riskLevel}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{log.details || '-'}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={auditPage}
            onPageChange={(_, p) => setAuditPage(p)}
            rowsPerPage={auditRowsPerPage}
            onRowsPerPageChange={e => { setAuditRowsPerPage(parseInt(e.target.value, 10)); setAuditPage(0); }}
            labelRowsPerPage="Lignes par page"
          />
        </Paper>
      </Box>
    );
  };

  // ────────── Politiques Tab ──────────

  const renderPoliciesTab = () => {
    const passwordPolicy = policies.find(p => p.type === 'password');
    const sessionPolicy = policies.find(p => p.type === 'session');
    const mfaPolicy = policies.find(p => p.type === 'mfa');

    const pwConfig = (passwordPolicy?.config || { minLength: 8, requireUppercase: true, requireNumber: true, requireSpecial: true, expiryDays: 90, historyCount: 5 }) as Record<string, any>;
    const sessConfig = (sessionPolicy?.config || { maxSessions: 3, timeoutMinutes: 30, ipRestriction: false }) as Record<string, any>;
    const mfaConfig = (mfaPolicy?.config || { requiredForRoles: ['Administrateur'], allowedMethods: ['authenticator', 'email', 'sms'], gracePeriodDays: 7 }) as Record<string, any>;

    const savePolicyConfig = (type: string, name: string, config: Record<string, any>) => {
      const existing = policies.find(p => p.type === type);
      secService.savePolicy({
        id: existing?.id || `pol-${Date.now()}`,
        name,
        type: type as any,
        config,
        updatedAt: new Date().toISOString(),
      });
    };

    return (
      <Box>
        <Grid container spacing={3}>
          {/* Politique Mots de Passe */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VpnKey color="primary" /> Mots de Passe
              </Typography>
              <TextField label="Longueur minimale" type="number" fullWidth margin="dense" size="small" defaultValue={pwConfig.minLength} inputProps={{ min: 6, max: 32 }}
                onChange={e => { pwConfig.minLength = Number(e.target.value) }} />
              <FormControlLabel control={<Switch defaultChecked={pwConfig.requireUppercase} onChange={e => { pwConfig.requireUppercase = e.target.checked }} size="small" />} label="Majuscule requise" />
              <FormControlLabel control={<Switch defaultChecked={pwConfig.requireNumber} onChange={e => { pwConfig.requireNumber = e.target.checked }} size="small" />} label="Chiffre requis" />
              <FormControlLabel control={<Switch defaultChecked={pwConfig.requireSpecial} onChange={e => { pwConfig.requireSpecial = e.target.checked }} size="small" />} label="Caractère spécial requis" />
              <TextField label="Expiration (jours)" type="number" fullWidth margin="dense" size="small" defaultValue={pwConfig.expiryDays}
                onChange={e => { pwConfig.expiryDays = Number(e.target.value) }} />
              <TextField label="Historique (nb anciens MDP)" type="number" fullWidth margin="dense" size="small" defaultValue={pwConfig.historyCount}
                onChange={e => { pwConfig.historyCount = Number(e.target.value) }} />
              <Button variant="contained" startIcon={<Save />} fullWidth sx={{ mt: 2 }}
                onClick={() => savePolicyConfig('password', 'Politique de Mots de Passe', pwConfig)}>
                Enregistrer
              </Button>
            </Paper>
          </Grid>

          {/* Politique Sessions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockClock color="primary" /> Sessions
              </Typography>
              <TextField label="Sessions max simultanées" type="number" fullWidth margin="dense" size="small" defaultValue={sessConfig.maxSessions}
                onChange={e => { sessConfig.maxSessions = Number(e.target.value) }} />
              <TextField label="Timeout d'inactivité (min)" type="number" fullWidth margin="dense" size="small" defaultValue={sessConfig.timeoutMinutes}
                onChange={e => { sessConfig.timeoutMinutes = Number(e.target.value) }} />
              <FormControlLabel control={<Switch defaultChecked={sessConfig.ipRestriction} onChange={e => { sessConfig.ipRestriction = e.target.checked }} size="small" />} label="Restriction IP activée" />

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Sessions Actives</Typography>
              {sessions.filter(s => s.isActive).map(session => {
                const user = users.find(u => u.id === session.userId);
                return (
                  <Paper key={session.id} variant="outlined" sx={{ p: 1, mb: 1 }}>
                    <Typography variant="body2">{user ? `${user.firstName} ${user.lastName}` : session.userId}</Typography>
                    <Typography variant="caption" color="text.secondary">{session.device} • {session.location} • {session.ipAddress}</Typography>
                  </Paper>
                );
              })}

              <Button variant="contained" startIcon={<Save />} fullWidth sx={{ mt: 2 }}
                onClick={() => savePolicyConfig('session', 'Politique de Session', sessConfig)}>
                Enregistrer
              </Button>
            </Paper>
          </Grid>

          {/* Politique MFA */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield color="primary" /> MFA
              </Typography>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Rôles nécessitant MFA</Typography>
              {roles.map(role => (
                <FormControlLabel key={role.id} control={
                  <Checkbox size="small" defaultChecked={mfaConfig.requiredForRoles?.includes(role.name)}
                    onChange={e => {
                      const arr = [...(mfaConfig.requiredForRoles || [])];
                      if (e.target.checked) arr.push(role.name); else arr.splice(arr.indexOf(role.name), 1);
                      mfaConfig.requiredForRoles = arr;
                    }} />
                } label={role.name} />
              ))}

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Méthodes autorisées</Typography>
              {['authenticator', 'email', 'sms'].map(method => (
                <FormControlLabel key={method} control={
                  <Checkbox size="small" defaultChecked={mfaConfig.allowedMethods?.includes(method)}
                    onChange={e => {
                      const arr = [...(mfaConfig.allowedMethods || [])];
                      if (e.target.checked) arr.push(method); else arr.splice(arr.indexOf(method), 1);
                      mfaConfig.allowedMethods = arr;
                    }} />
                } label={method === 'authenticator' ? 'Authenticator App' : method === 'email' ? 'Email' : 'SMS'} />
              ))}

              <TextField label="Période de grâce (jours)" type="number" fullWidth margin="dense" size="small" defaultValue={mfaConfig.gracePeriodDays}
                onChange={e => { mfaConfig.gracePeriodDays = Number(e.target.value) }} />

              <Button variant="contained" startIcon={<Save />} fullWidth sx={{ mt: 2 }}
                onClick={() => savePolicyConfig('mfa', 'Politique MFA', mfaConfig)}>
                Enregistrer
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // ────────── Render principal ──────────

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Sécurité & Accès</Typography>
            <Typography variant="body1" color="text.secondary">
              Gestion avancée de la sécurité avec authentification multi-facteurs et audit complet
            </Typography>
          </Box>
          <FormControlLabel control={<Switch checked={isMonitoring} onChange={(e) => setIsMonitoring(e.target.checked)} />} label="Monitoring actif" />
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Dashboard" icon={<Security />} iconPosition="start" />
          <Tab label="Utilisateurs" icon={<People />} iconPosition="start" />
          <Tab label="Rôles & Permissions" icon={<AdminPanelSettings />} iconPosition="start" />
          <Tab label="Audit" icon={<History />} iconPosition="start" />
          <Tab label="Politiques" icon={<Policy />} iconPosition="start" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderDashboardTab()}
      {activeTab === 1 && renderUsersTab()}
      {activeTab === 2 && renderRolesTab()}
      {activeTab === 3 && renderAuditTab()}
      {activeTab === 4 && renderPoliciesTab()}
    </Box>
  );
};

export default ModernSecurity;
