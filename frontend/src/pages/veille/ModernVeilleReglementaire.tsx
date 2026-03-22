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
  Badge,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  Collapse,
  Tooltip
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
  NotificationImportant,
  Search,
  Bookmark,
  BookmarkBorder,
  ExpandMore,
  ExpandLess,
  Add,
  Delete,
  DoneAll,
  NotificationsOff,
  FilterList
} from '@mui/icons-material';
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme';
import * as veilleService from '@/services/veilleStorageService';
import type {
  VeilleRegulation,
  ComplianceTask,
  RegulatoryAlert,
} from '@/services/veilleStorageService';

const ModernVeilleReglementaire: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [regulations, setRegulations] = useState<VeilleRegulation[]>([]);
  const [complianceTasks, setComplianceTasks] = useState<ComplianceTask[]>([]);
  const [alerts, setAlerts] = useState<RegulatoryAlert[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const [lastCheck, setLastCheck] = useState(new Date());

  // Filters
  const [regCategoryFilter, setRegCategoryFilter] = useState('');
  const [regJurisdictionFilter, setRegJurisdictionFilter] = useState('');
  const [regPriorityFilter, setRegPriorityFilter] = useState('');
  const [regSearchTerm, setRegSearchTerm] = useState('');
  const [expandedRegId, setExpandedRegId] = useState<string | null>(null);

  // Task dialog
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', regulationId: '', dueDate: '', priority: 'medium' as const });

  // Alert filters
  const [showDismissed, setShowDismissed] = useState(false);

  const loadData = () => {
    setRegulations(veilleService.getAllRegulations());
    setComplianceTasks(veilleService.getAllTasks());
    setAlerts(veilleService.getAllAlerts());
  };

  useEffect(() => {
    veilleService.seedVeilleData();
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('fiscasync:veille-updated', handleUpdate);

    if (isAutoRefresh) {
      refreshInterval.current = setInterval(() => {
        setLastCheck(new Date());
        logger.debug('Vérification des mises à jour réglementaires...');
      }, 3600000);
    }

    return () => {
      window.removeEventListener('fiscasync:veille-updated', handleUpdate);
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [isAutoRefresh]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#d97706';
      case 'medium': return '#2563eb';
      case 'low': return '#16a34a';
      default: return P.primary500;
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

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'non-compliant': return 'error';
      case 'in-progress': return 'warning';
      default: return 'default';
    }
  };

  const getComplianceLabel = (status: string) => {
    switch (status) {
      case 'compliant': return 'Conforme';
      case 'non-compliant': return 'Non conforme';
      case 'in-progress': return 'En cours';
      case 'not-applicable': return 'N/A';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'law': return 'Loi';
      case 'decree': return 'Décret';
      case 'circular': return 'Circulaire';
      case 'instruction': return 'Instruction';
      case 'convention': return 'Convention';
      case 'standard': return 'Norme';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'overdue': return 'En retard';
      default: return status;
    }
  };

  const toggleBookmark = (id: string) => {
    const reg = regulations.find(r => r.id === id);
    if (reg) veilleService.updateRegulation(id, { isBookmarked: !reg.isBookmarked });
  };

  const toggleCheckpoint = (taskId: string, checkpointId: string) => {
    const task = complianceTasks.find(t => t.id === taskId);
    if (!task) return;
    const checkpoints = task.checkpoints.map(c =>
      c.id === checkpointId ? { ...c, isCompleted: !c.isCompleted, completedAt: !c.isCompleted ? new Date().toISOString() : undefined } : c
    );
    const completed = checkpoints.filter(c => c.isCompleted).length;
    const progress = checkpoints.length > 0 ? Math.round((completed / checkpoints.length) * 100) : 0;
    const status = progress === 100 ? 'completed' : task.status;
    veilleService.updateTask(taskId, { checkpoints, progress, status, completedAt: progress === 100 ? new Date().toISOString() : undefined });
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.dueDate) return;
    veilleService.createTask({
      title: newTask.title,
      description: newTask.description,
      regulationId: newTask.regulationId,
      dueDate: newTask.dueDate,
      assignedTo: [],
      status: 'pending',
      priority: newTask.priority,
      progress: 0,
      checkpoints: [],
    });
    setNewTask({ title: '', description: '', regulationId: '', dueDate: '', priority: 'medium' });
    setTaskDialogOpen(false);
  };

  // ────────── Dashboard Tab ──────────

  const renderDashboardTab = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Gavel color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{regulations.length}</Typography>
              </Box>
              <Typography color="textSecondary">Réglementations Surveillées</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">{regulations.filter(r => r.complianceStatus === 'compliant').length}</Typography>
              </Box>
              <Typography color="textSecondary">Conformes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">{complianceTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length}</Typography>
              </Box>
              <Typography color="textSecondary">Actions en Cours</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <NotificationImportant color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">{alerts.filter(a => a.type === 'critical' && a.isActive).length}</Typography>
              </Box>
              <Typography color="textSecondary">Alertes Critiques</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {alerts.filter(a => a.isActive).length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Alertes Réglementaires</Typography>
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
                      <Typography variant="body2" color="text.secondary">{alert.message}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {alert.jurisdictions.map(j => (<Chip key={j} label={j} size="small" />))}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(alert.date).toLocaleDateString()}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Changements Réglementaires Récents</Typography>
        <Timeline position="alternate">
          {regulations.slice(0, 5).map((regulation, index) => (
            <TimelineItem key={regulation.id}>
              <TimelineOppositeContent sx={{ m: 'auto 0' }} align={index % 2 === 0 ? 'right' : 'left'} variant="body2" color="text.secondary">
                {new Date(regulation.publicationDate).toLocaleDateString()}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot color={regulation.priority === 'critical' ? 'error' : 'primary'}>
                  <Gavel />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Typography variant="h6" component="span">{regulation.title}</Typography>
                <Typography variant="body2" color="text.secondary">{regulation.summary}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip label={regulation.jurisdiction} size="small" sx={{ mr: 1 }} />
                  <Chip label={regulation.category} size="small" variant="outlined" />
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Tâches de Mise en Conformité</Typography>
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
                    <Typography variant="body2" fontWeight="medium">{task.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{task.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getPriorityColor(task.priority), display: 'inline-block', mr: 1 }} />
                    {task.priority}
                  </TableCell>
                  <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={task.progress} sx={{ width: 100, height: 6, borderRadius: 3 }} />
                      <Typography variant="caption">{task.progress}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={getStatusLabel(task.status)} size="small" color={task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : task.status === 'overdue' ? 'error' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small"><Visibility /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  // ────────── Réglementations Tab ──────────

  const renderReglementationsTab = () => {
    let filtered = [...regulations];
    if (regCategoryFilter) filtered = filtered.filter(r => r.category === regCategoryFilter);
    if (regJurisdictionFilter) filtered = filtered.filter(r => r.jurisdiction === regJurisdictionFilter);
    if (regPriorityFilter) filtered = filtered.filter(r => r.priority === regPriorityFilter);
    if (regSearchTerm) {
      const term = regSearchTerm.toLowerCase();
      filtered = filtered.filter(r => r.title.toLowerCase().includes(term) || r.summary.toLowerCase().includes(term) || r.referenceNumber.toLowerCase().includes(term));
    }

    return (
      <Box>
        {/* Filtres */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField size="small" placeholder="Rechercher..." value={regSearchTerm} onChange={e => setRegSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ minWidth: 250 }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select value={regCategoryFilter} label="Catégorie" onChange={e => setRegCategoryFilter(e.target.value)}>
                <MenuItem value="">Toutes</MenuItem>
                <MenuItem value="fiscal">Fiscal</MenuItem>
                <MenuItem value="social">Social</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="accounting">Comptable</MenuItem>
                <MenuItem value="customs">Douanier</MenuItem>
                <MenuItem value="environmental">Environnemental</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Juridiction</InputLabel>
              <Select value={regJurisdictionFilter} label="Juridiction" onChange={e => setRegJurisdictionFilter(e.target.value)}>
                <MenuItem value="">Toutes</MenuItem>
                <MenuItem value="UEMOA">UEMOA</MenuItem>
                <MenuItem value="OHADA">OHADA</MenuItem>
                <MenuItem value="National">National</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priorité</InputLabel>
              <Select value={regPriorityFilter} label="Priorité" onChange={e => setRegPriorityFilter(e.target.value)}>
                <MenuItem value="">Toutes</MenuItem>
                <MenuItem value="critical">Critique</MenuItem>
                <MenuItem value="high">Haute</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="low">Basse</MenuItem>
              </Select>
            </FormControl>
            <Chip icon={<FilterList />} label={`${filtered.length} résultat(s)`} variant="outlined" />
          </Box>
        </Paper>

        {/* Table des réglementations */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={30}></TableCell>
                  <TableCell>Titre</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Juridiction</TableCell>
                  <TableCell>Priorité</TableCell>
                  <TableCell>Date Effective</TableCell>
                  <TableCell>Conformité</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(reg => (
                  <React.Fragment key={reg.id}>
                    <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setExpandedRegId(expandedRegId === reg.id ? null : reg.id)}>
                      <TableCell>
                        <IconButton size="small">
                          {expandedRegId === reg.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {reg.readStatus === 'unread' && <Badge color="primary" variant="dot"><Box /></Badge>}
                          <Box>
                            <Typography variant="body2" fontWeight="medium">{reg.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{reg.referenceNumber}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={getTypeLabel(reg.type)} size="small" variant="outlined" /></TableCell>
                      <TableCell><Chip label={reg.jurisdiction} size="small" /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getPriorityColor(reg.priority) }} />
                          <Typography variant="body2">{reg.priority}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(reg.effectiveDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip label={getComplianceLabel(reg.complianceStatus)} size="small" color={getComplianceColor(reg.complianceStatus) as any} />
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <IconButton size="small" onClick={() => toggleBookmark(reg.id)}>
                          {reg.isBookmarked ? <Bookmark color="warning" /> : <BookmarkBorder />}
                        </IconButton>
                        <IconButton size="small" onClick={() => {
                          if (reg.readStatus === 'unread') veilleService.updateRegulation(reg.id, { readStatus: 'read' });
                        }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 0, borderBottom: expandedRegId === reg.id ? undefined : 'none' }}>
                        <Collapse in={expandedRegId === reg.id} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Résumé</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{reg.summary}</Typography>

                            <Typography variant="subtitle2" gutterBottom>Informations</Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Autorité</Typography><Typography variant="body2">{reg.authority}</Typography></Grid>
                              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Pays</Typography><Typography variant="body2">{reg.country}</Typography></Grid>
                              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Publication</Typography><Typography variant="body2">{new Date(reg.publicationDate).toLocaleDateString()}</Typography></Grid>
                              <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Statut</Typography><Typography variant="body2">{reg.status}</Typography></Grid>
                            </Grid>

                            {reg.impacts.length > 0 && (
                              <>
                                <Typography variant="subtitle2" gutterBottom>Impacts ({reg.impacts.length})</Typography>
                                {reg.impacts.map(impact => (
                                  <Paper key={impact.id} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Box>
                                        <Typography variant="body2" fontWeight="medium">{impact.area}</Typography>
                                        <Typography variant="caption" color="text.secondary">{impact.description}</Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Chip label={impact.severity} size="small" sx={{ backgroundColor: getPriorityColor(impact.severity), color: 'white' }} />
                                        <Chip label={getStatusLabel(impact.status)} size="small" variant="outlined" />
                                      </Box>
                                    </Box>
                                    {impact.deadline && <Typography variant="caption" color="error">Échéance: {new Date(impact.deadline).toLocaleDateString()}</Typography>}
                                  </Paper>
                                ))}
                              </>
                            )}

                            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                              {reg.tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  };

  // ────────── Conformité Tab ──────────

  const renderConformiteTab = () => {
    const tasksByStatus = {
      pending: complianceTasks.filter(t => t.status === 'pending'),
      'in-progress': complianceTasks.filter(t => t.status === 'in-progress'),
      completed: complianceTasks.filter(t => t.status === 'completed'),
      overdue: complianceTasks.filter(t => t.status === 'overdue'),
    };

    const totalTasks = complianceTasks.length;
    const completedTasks = tasksByStatus.completed.length;
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const renderTaskCard = (task: ComplianceTask) => {
      const reg = regulations.find(r => r.id === task.regulationId);
      return (
        <Paper key={task.id} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="body2" fontWeight="medium">{task.title}</Typography>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: getPriorityColor(task.priority), flexShrink: 0, mt: 0.5 }} />
          </Box>
          {reg && <Chip label={reg.title} size="small" variant="outlined" sx={{ mb: 1, maxWidth: '100%' }} />}
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Échéance: {new Date(task.dueDate).toLocaleDateString()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LinearProgress variant="determinate" value={task.progress} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
            <Typography variant="caption">{task.progress}%</Typography>
          </Box>
          {task.checkpoints.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {task.checkpoints.map(cp => (
                <Box key={cp.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Checkbox size="small" checked={cp.isCompleted} onChange={() => toggleCheckpoint(task.id, cp.id)} />
                  <Typography variant="caption" sx={{ textDecoration: cp.isCompleted ? 'line-through' : 'none', color: cp.isCompleted ? 'text.disabled' : 'text.primary' }}>
                    {cp.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          {task.assignedTo.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              {task.assignedTo.map(a => <Chip key={a} label={a} size="small" variant="outlined" />)}
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 0.5 }}>
            {task.status !== 'completed' && task.status !== 'overdue' && (
              <Tooltip title="Marquer en cours">
                <IconButton size="small" onClick={() => veilleService.updateTask(task.id, { status: 'in-progress' })}>
                  <AssignmentTurnedIn fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Supprimer">
              <IconButton size="small" onClick={() => veilleService.deleteTask(task.id)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      );
    };

    return (
      <Box>
        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{totalTasks}</Typography>
              <Typography variant="caption" color="text.secondary">Total</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">{completedTasks}</Typography>
              <Typography variant="caption" color="text.secondary">Terminées</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">{tasksByStatus['in-progress'].length}</Typography>
              <Typography variant="caption" color="text.secondary">En cours</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{overallProgress}%</Typography>
              <LinearProgress variant="determinate" value={overallProgress} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
            </CardContent></Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setTaskDialogOpen(true)}>
            Nouvelle Tâche
          </Button>
        </Box>

        {/* Kanban */}
        <Grid container spacing={2}>
          {([
            { key: 'pending', label: 'En attente', color: P.primary400 },
            { key: 'in-progress', label: 'En cours', color: '#f59e0b' },
            { key: 'completed', label: 'Terminé', color: '#22c55e' },
            { key: 'overdue', label: 'En retard', color: '#ef4444' },
          ] as const).map(col => (
            <Grid item xs={12} sm={6} md={3} key={col.key}>
              <Paper sx={{ p: 2, minHeight: 200, borderTop: `3px solid ${col.color}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">{col.label}</Typography>
                  <Chip label={tasksByStatus[col.key].length} size="small" />
                </Box>
                {tasksByStatus[col.key].map(renderTaskCard)}
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Dialog nouvelle tâche */}
        <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nouvelle Tâche de Conformité</DialogTitle>
          <DialogContent>
            <TextField label="Titre" fullWidth margin="normal" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
            <TextField label="Description" fullWidth margin="normal" multiline rows={2} value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Réglementation liée</InputLabel>
              <Select value={newTask.regulationId} label="Réglementation liée" onChange={e => setNewTask({ ...newTask, regulationId: e.target.value })}>
                <MenuItem value="">Aucune</MenuItem>
                {regulations.map(r => <MenuItem key={r.id} value={r.id}>{r.title}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Échéance" type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priorité</InputLabel>
              <Select value={newTask.priority} label="Priorité" onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}>
                <MenuItem value="low">Basse</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="high">Haute</MenuItem>
                <MenuItem value="critical">Critique</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTaskDialogOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleCreateTask}>Créer</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // ────────── Alertes Tab ──────────

  const renderAlertesTab = () => {
    const activeAlerts = alerts.filter(a => a.isActive && !a.isDismissed);
    const dismissedAlerts = alerts.filter(a => a.isDismissed);

    return (
      <Box>
        {/* Alertes actives */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Alertes Actives ({activeAlerts.length})
          </Typography>
          {activeAlerts.length === 0 ? (
            <Alert severity="success">Aucune alerte active</Alert>
          ) : (
            <List>
              {activeAlerts.map(alert => (
                <ListItem key={alert.id} sx={{
                  mb: 1, borderRadius: 1,
                  borderLeft: `4px solid ${alert.type === 'critical' ? '#dc2626' : alert.type === 'warning' ? '#f59e0b' : '#3b82f6'}`,
                  backgroundColor: alert.type === 'critical' ? '#fef2f2' : alert.type === 'warning' ? '#fffbeb' : '#eff6ff',
                }}>
                  <ListItemIcon>
                    <NotificationImportant sx={{ color: alert.type === 'critical' ? '#dc2626' : alert.type === 'warning' ? '#f59e0b' : '#3b82f6' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body1" fontWeight="medium">{alert.title}</Typography>}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{alert.message}</Typography>
                        <Typography variant="caption" color="text.secondary">Source: {alert.source}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          {alert.jurisdictions.map(j => <Chip key={j} label={j} size="small" />)}
                          {alert.categories.map(c => <Chip key={c} label={c} size="small" variant="outlined" />)}
                        </Box>
                        {alert.expiresAt && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Expire le: {new Date(alert.expiresAt).toLocaleDateString()}
                          </Typography>
                        )}
                        {alert.actions.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" fontWeight="medium">Actions requises:</Typography>
                            {alert.actions.map((action, i) => (
                              <Typography key={i} variant="caption" display="block" sx={{ pl: 1 }}>• {action}</Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Tooltip title="Marquer comme lu">
                        <IconButton size="small" onClick={() => veilleService.dismissAlert(alert.id)}>
                          <DoneAll fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ignorer">
                        <IconButton size="small" onClick={() => veilleService.dismissAlert(alert.id)}>
                          <NotificationsOff fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {/* Historique des alertes */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Historique des Alertes ({dismissedAlerts.length})</Typography>
            <FormControlLabel
              control={<Switch checked={showDismissed} onChange={e => setShowDismissed(e.target.checked)} size="small" />}
              label="Afficher"
            />
          </Box>
          {showDismissed && (
            <List>
              {dismissedAlerts.map(alert => (
                <ListItem key={alert.id} sx={{ opacity: 0.6 }}>
                  <ListItemIcon>
                    <NotificationsOff color="disabled" />
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.title}
                    secondary={`${alert.source} • ${new Date(alert.date).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip label={alert.type} size="small" color={getAlertColor(alert.type) as any} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    );
  };

  // ────────── Render principal ──────────

  return (
    <Box sx={{ p: 3 }}>
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
              control={<Switch checked={isAutoRefresh} onChange={(e) => setIsAutoRefresh(e.target.checked)} />}
              label="Actualisation auto"
            />
            <Typography variant="caption" color="text.secondary">
              Dernière vérif: {lastCheck.toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Dashboard" icon={<Gavel />} iconPosition="start" />
          <Tab label="Réglementations" icon={<Policy />} iconPosition="start" />
          <Tab label="Conformité" icon={<AssignmentTurnedIn />} iconPosition="start" />
          <Tab label="Alertes" icon={<Notifications />} iconPosition="start" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderDashboardTab()}
      {activeTab === 1 && renderReglementationsTab()}
      {activeTab === 2 && renderConformiteTab()}
      {activeTab === 3 && renderAlertesTab()}
    </Box>
  );
};

export default ModernVeilleReglementaire;
