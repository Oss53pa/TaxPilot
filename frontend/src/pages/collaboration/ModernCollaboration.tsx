import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Badge,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Switch,
  FormControlLabel,
  IconButton,
  ListItemButton,
  Divider,
  Collapse,
  Tooltip
} from '@mui/material';
import {
  People,
  Group,
  Chat,
  Description,
  Folder,
  Star,
  Task,
  Dashboard,
  Sync,
  SyncProblem,
  Add,
  ExpandMore,
  ExpandLess,
  Send,
  PersonRemove,
  FolderOpen,
  InsertDriveFile,
  Image,
  TableChart,
  Slideshow,
  Lock
} from '@mui/icons-material';
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme';
import * as collabService from '@/services/collaborationStorageService';
import type {
  CollabUser, CollabTeam, CollabWorkspace,
  CollabActivity, CollabChannel, CollabMessage
} from '@/services/collaborationStorageService';

const ModernCollaboration: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [workspaces, setWorkspaces] = useState<CollabWorkspace[]>([]);
  const [teams, setTeams] = useState<CollabTeam[]>([]);
  const [users, setUsers] = useState<CollabUser[]>([]);
  const [activities, setActivities] = useState<CollabActivity[]>([]);
  const [channels, setChannels] = useState<CollabChannel[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const syncInterval = useRef<NodeJS.Timeout | null>(null);

  // Workspace
  const [wsDialogOpen, setWsDialogOpen] = useState(false);
  const [newWs, setNewWs] = useState({ name: '', description: '', type: 'project' as const });
  const [expandedWsId, setExpandedWsId] = useState<string | null>(null);
  const [wsFilter, setWsFilter] = useState<string>('active');

  // Task dialog
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskWsId, setTaskWsId] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const, dueDate: '' });

  // Team
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', isPrivate: false });
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Messages
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [messages, setMessages] = useState<CollabMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadData = () => {
    setUsers(collabService.getAllUsers());
    setWorkspaces(collabService.getAllWorkspaces());
    setTeams(collabService.getAllTeams());
    setActivities(collabService.getAllActivities());
    setChannels(collabService.getAllChannels());
    const u = collabService.getAllUsers();
    setOnlineUsers(u.filter(usr => usr.status === 'online').map(usr => usr.id));
  };

  useEffect(() => {
    collabService.seedCollabData();
    loadData();

    const handleUpdate = () => loadData();
    const handleMessage = () => {
      if (selectedChannelId) setMessages(collabService.getMessages(selectedChannelId));
    };
    window.addEventListener('fiscasync:collab-updated', handleUpdate);
    window.addEventListener('fiscasync:collab-message', handleMessage);

    syncInterval.current = setInterval(() => {
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('synced'), 500);
    }, 10000);

    return () => {
      window.removeEventListener('fiscasync:collab-updated', handleUpdate);
      window.removeEventListener('fiscasync:collab-message', handleMessage);
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, [selectedChannelId]);

  useEffect(() => {
    if (selectedChannelId) {
      setMessages(collabService.getMessages(selectedChannelId));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [selectedChannelId]);

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const getStatusColor = (status: string) => {
    switch (status) { case 'online': return '#22c55e'; case 'away': return '#f59e0b'; case 'busy': return '#ef4444'; default: return P.primary400; }
  };

  const getDocIcon = (type: string) => {
    switch (type) { case 'spreadsheet': return <TableChart fontSize="small" color="success" />; case 'presentation': return <Slideshow fontSize="small" color="warning" />; case 'image': return <Image fontSize="small" color="info" />; default: return <InsertDriveFile fontSize="small" color="primary" />; }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleCreateWorkspace = () => {
    if (!newWs.name) return;
    collabService.createWorkspace({ name: newWs.name, description: newWs.description, type: newWs.type, owner: 'user-1', teams: [], status: 'active', progress: 0 });
    setNewWs({ name: '', description: '', type: 'project' });
    setWsDialogOpen(false);
  };

  const handleCreateTask = () => {
    if (!newTask.title || !taskWsId) return;
    collabService.addTaskToWorkspace(taskWsId, {
      title: newTask.title, description: newTask.description, assignees: [], priority: newTask.priority,
      status: 'todo', createdBy: 'user-1', dueDate: newTask.dueDate || undefined,
    });
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
    setTaskDialogOpen(false);
  };

  const handleCreateTeam = () => {
    if (!newTeam.name) return;
    collabService.createTeam({
      name: newTeam.name, description: newTeam.description, members: [{ userId: 'user-1', role: 'owner', joinedAt: new Date().toISOString(), permissions: ['all'] }],
      projects: [], createdBy: 'user-1', isPrivate: newTeam.isPrivate,
      settings: { allowGuestAccess: false, requireApproval: true, notificationsEnabled: true, defaultPermissions: ['read'] },
    });
    setNewTeam({ name: '', description: '', isPrivate: false });
    setTeamDialogOpen(false);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChannelId) return;
    collabService.sendMessage({ channelId: selectedChannelId, senderId: 'user-1', content: messageInput.trim(), attachments: [] });
    setMessageInput('');
    setMessages(collabService.getMessages(selectedChannelId));
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // ────────── Dashboard Tab ──────────

  const renderDashboardTab = () => (
    <Box>
      <Alert severity={syncStatus === 'synced' ? 'success' : syncStatus === 'syncing' ? 'info' : 'error'}
        icon={syncStatus === 'synced' ? <Sync /> : syncStatus === 'syncing' ? <CircularProgress size={20} /> : <SyncProblem />}
        sx={{ mb: 3 }}>
        {syncStatus === 'synced' && 'Collaboration en temps réel activée'}
        {syncStatus === 'syncing' && 'Synchronisation en cours...'}
        {syncStatus === 'error' && 'Problème de connexion'}
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Équipe en Ligne ({onlineUsers.length})</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {users.filter(u => u.status === 'online').map(user => (
            <Chip key={user.id} avatar={<Avatar sx={{ bgcolor: getStatusColor(user.status) }}>{user.name.charAt(0)}</Avatar>}
              label={user.name} variant="outlined" />
          ))}
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>Espaces de Travail Actifs</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {workspaces.filter(ws => ws.status === 'active').map(workspace => (
          <Grid item xs={12} md={6} lg={4} key={workspace.id}>
            <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 8 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>{workspace.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{workspace.description}</Typography>
                  </Box>
                  <Chip label={`${workspace.progress}%`} size="small" color={workspace.progress >= 75 ? 'success' : workspace.progress >= 50 ? 'warning' : 'default'} />
                </Box>
                <LinearProgress variant="determinate" value={workspace.progress} sx={{ height: 6, borderRadius: 3, mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip icon={<Description />} label={workspace.documents.length} size="small" variant="outlined" />
                    <Chip icon={<Task />} label={workspace.tasks.length} size="small" variant="outlined" />
                  </Box>
                  <AvatarGroup max={3}>
                    {workspace.teams.map(teamId => {
                      const team = teams.find(t => t.id === teamId);
                      return team?.members.slice(0, 3).map(member => {
                        const user = getUserById(member.userId);
                        return <Avatar key={member.userId} sx={{ width: 24, height: 24 }}>{user?.name.charAt(0)}</Avatar>;
                      });
                    })}
                  </AvatarGroup>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Activité Récente</Typography>
        <List>
          {activities.slice(0, 5).map(activity => {
            const user = getUserById(activity.userId);
            return (
              <ListItem key={activity.id}>
                <ListItemAvatar><Avatar sx={{ bgcolor: 'primary.main' }}>{user?.name.charAt(0)}</Avatar></ListItemAvatar>
                <ListItemText
                  primary={<Box><strong>{user?.name}</strong> {activity.action} {activity.targetName && <strong>{activity.targetName}</strong>}</Box>}
                  secondary={new Date(activity.timestamp).toLocaleString()}
                />
                {activity.isImportant && <ListItemSecondaryAction><Star color="warning" /></ListItemSecondaryAction>}
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );

  // ────────── Espaces Tab ──────────

  const renderEspacesTab = () => {
    const filtered = wsFilter ? workspaces.filter(ws => ws.status === wsFilter) : workspaces;

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['active', 'archived', 'completed'].map(status => (
              <Chip key={status} label={status === 'active' ? 'Actifs' : status === 'archived' ? 'Archivés' : 'Terminés'}
                color={wsFilter === status ? 'primary' : 'default'} onClick={() => setWsFilter(status)} />
            ))}
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setWsDialogOpen(true)}>Nouvel Espace</Button>
        </Box>

        {filtered.map(ws => (
          <Paper key={ws.id} sx={{ mb: 2 }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setExpandedWsId(expandedWsId === ws.id ? null : ws.id)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FolderOpen color="primary" />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">{ws.name}</Typography>
                    <Chip label={ws.type === 'project' ? 'Projet' : ws.type === 'department' ? 'Département' : 'Temporaire'} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{ws.description}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
                  <LinearProgress variant="determinate" value={ws.progress} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                  <Typography variant="caption">{ws.progress}%</Typography>
                </Box>
                <Chip icon={<Description />} label={ws.documents.length} size="small" />
                <Chip icon={<Task />} label={ws.tasks.length} size="small" />
                <IconButton size="small">{expandedWsId === ws.id ? <ExpandLess /> : <ExpandMore />}</IconButton>
              </Box>
            </Box>

            <Collapse in={expandedWsId === ws.id} unmountOnExit>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                  {/* Documents */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Documents ({ws.documents.length})</Typography>
                    {ws.documents.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">Aucun document</Typography>
                    ) : (
                      <List dense>
                        {ws.documents.map(doc => {
                          const owner = getUserById(doc.owner);
                          return (
                            <ListItem key={doc.id}>
                              <ListItemAvatar>{getDocIcon(doc.type)}</ListItemAvatar>
                              <ListItemText
                                primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {doc.name}
                                  {doc.isLocked && <Lock fontSize="inherit" color="warning" />}
                                </Box>}
                                secondary={`${formatSize(doc.size)} • v${doc.version} • ${owner?.name || doc.owner} • ${new Date(doc.lastModified).toLocaleDateString()}`}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                  </Grid>

                  {/* Tâches */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">Tâches ({ws.tasks.length})</Typography>
                      <IconButton size="small" onClick={() => { setTaskWsId(ws.id); setTaskDialogOpen(true); }}><Add fontSize="small" /></IconButton>
                    </Box>
                    {ws.tasks.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">Aucune tâche</Typography>
                    ) : (
                      <List dense>
                        {ws.tasks.map(task => (
                          <ListItem key={task.id}>
                            <ListItemText
                              primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: task.priority === 'urgent' ? '#dc2626' : task.priority === 'high' ? '#d97706' : task.priority === 'medium' ? '#2563eb' : '#16a34a' }} />
                                {task.title}
                              </Box>}
                              secondary={
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  <Chip label={task.status === 'todo' ? 'À faire' : task.status === 'in-progress' ? 'En cours' : task.status === 'review' ? 'Revue' : 'Fait'} size="small"
                                    color={task.status === 'done' ? 'success' : task.status === 'in-progress' ? 'warning' : 'default'} />
                                  {task.dueDate && <Typography variant="caption">{new Date(task.dueDate).toLocaleDateString()}</Typography>}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                  {ws.status === 'active' && (
                    <Button size="small" onClick={() => collabService.updateWorkspace(ws.id, { status: 'archived' })}>Archiver</Button>
                  )}
                  <Button size="small" color="error" onClick={() => collabService.deleteWorkspace(ws.id)}>Supprimer</Button>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        ))}

        {/* Dialog Nouvel Espace */}
        <Dialog open={wsDialogOpen} onClose={() => setWsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nouvel Espace de Travail</DialogTitle>
          <DialogContent>
            <TextField label="Nom" fullWidth margin="normal" value={newWs.name} onChange={e => setNewWs({ ...newWs, name: e.target.value })} />
            <TextField label="Description" fullWidth margin="normal" multiline rows={2} value={newWs.description} onChange={e => setNewWs({ ...newWs, description: e.target.value })} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select value={newWs.type} label="Type" onChange={e => setNewWs({ ...newWs, type: e.target.value as any })}>
                <MenuItem value="project">Projet</MenuItem>
                <MenuItem value="department">Département</MenuItem>
                <MenuItem value="temporary">Temporaire</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWsDialogOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleCreateWorkspace}>Créer</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Nouvelle Tâche */}
        <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nouvelle Tâche</DialogTitle>
          <DialogContent>
            <TextField label="Titre" fullWidth margin="normal" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
            <TextField label="Description" fullWidth margin="normal" multiline rows={2} value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
            <TextField label="Échéance" type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priorité</InputLabel>
              <Select value={newTask.priority} label="Priorité" onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}>
                <MenuItem value="low">Basse</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="high">Haute</MenuItem>
                <MenuItem value="urgent">Urgente</MenuItem>
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

  // ────────── Équipes Tab ──────────

  const renderEquipesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setTeamDialogOpen(true)}>Nouvelle Équipe</Button>
      </Box>

      <Grid container spacing={3}>
        {teams.map(team => (
          <Grid item xs={12} md={6} key={team.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, cursor: 'pointer' }}
                  onClick={() => setExpandedTeamId(expandedTeamId === team.id ? null : team.id)}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">{team.name}</Typography>
                      {team.isPrivate && <Lock fontSize="small" color="action" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary">{team.description}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip icon={<People />} label={team.members.length} size="small" />
                    <Chip icon={<Folder />} label={team.projects.length} size="small" variant="outlined" />
                    <IconButton size="small">{expandedTeamId === team.id ? <ExpandLess /> : <ExpandMore />}</IconButton>
                  </Box>
                </Box>

                <AvatarGroup max={5} sx={{ justifyContent: 'flex-start' }}>
                  {team.members.map(m => {
                    const user = getUserById(m.userId);
                    return <Tooltip key={m.userId} title={user?.name || m.userId}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: m.role === 'owner' ? 'primary.main' : m.role === 'admin' ? 'warning.main' : 'grey.400' }}>
                        {user?.name.charAt(0)}
                      </Avatar>
                    </Tooltip>;
                  })}
                </AvatarGroup>

                <Collapse in={expandedTeamId === team.id} unmountOnExit>
                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>Membres</Typography>
                  <List dense>
                    {team.members.map(member => {
                      const user = getUserById(member.userId);
                      return (
                        <ListItem key={member.userId}>
                          <ListItemAvatar>
                            <Badge color={user?.status === 'online' ? 'success' : user?.status === 'away' ? 'warning' : 'default'} variant="dot" overlap="circular">
                              <Avatar sx={{ width: 28, height: 28 }}>{user?.name.charAt(0)}</Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={user?.name || member.userId}
                            secondary={`${member.role === 'owner' ? 'Propriétaire' : member.role === 'admin' ? 'Admin' : member.role === 'guest' ? 'Invité' : 'Membre'} • ${user?.department || ''}`}
                          />
                          {member.role !== 'owner' && (
                            <ListItemSecondaryAction>
                              <IconButton size="small" onClick={() => collabService.removeMemberFromTeam(team.id, member.userId)}>
                                <PersonRemove fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      );
                    })}
                  </List>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Paramètres</Typography>
                  <FormControlLabel control={<Switch size="small" checked={team.settings.allowGuestAccess}
                    onChange={e => collabService.updateTeam(team.id, { settings: { ...team.settings, allowGuestAccess: e.target.checked } })} />}
                    label="Accès invités" />
                  <FormControlLabel control={<Switch size="small" checked={team.settings.requireApproval}
                    onChange={e => collabService.updateTeam(team.id, { settings: { ...team.settings, requireApproval: e.target.checked } })} />}
                    label="Approbation requise" />
                  <FormControlLabel control={<Switch size="small" checked={team.settings.notificationsEnabled}
                    onChange={e => collabService.updateTeam(team.id, { settings: { ...team.settings, notificationsEnabled: e.target.checked } })} />}
                    label="Notifications" />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button size="small" color="error" onClick={() => collabService.deleteTeam(team.id)}>Supprimer l'équipe</Button>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Équipe</DialogTitle>
        <DialogContent>
          <TextField label="Nom de l'équipe" fullWidth margin="normal" value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} />
          <TextField label="Description" fullWidth margin="normal" multiline rows={2} value={newTeam.description} onChange={e => setNewTeam({ ...newTeam, description: e.target.value })} />
          <FormControlLabel control={<Switch checked={newTeam.isPrivate} onChange={e => setNewTeam({ ...newTeam, isPrivate: e.target.checked })} />} label="Équipe privée" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateTeam}>Créer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // ────────── Messages Tab ──────────

  const renderMessagesTab = () => {
    const currentChannel = channels.find(c => c.id === selectedChannelId);

    return (
      <Box sx={{ display: 'flex', height: 'calc(100vh - 350px)', minHeight: 400 }}>
        {/* Liste des canaux */}
        <Paper sx={{ width: 280, mr: 2, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2">Canaux</Typography>
          </Box>
          <List dense sx={{ flex: 1, overflow: 'auto' }}>
            {channels.filter(c => c.type === 'channel').map(channel => (
              <ListItemButton key={channel.id} selected={selectedChannelId === channel.id}
                onClick={() => setSelectedChannelId(channel.id)}>
                <ListItemText
                  primary={channel.name}
                  secondary={channel.lastMessage ? (channel.lastMessage.length > 30 ? channel.lastMessage.substring(0, 30) + '...' : channel.lastMessage) : 'Aucun message'}
                />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2">Messages Directs</Typography>
          </Box>
          <List dense sx={{ overflow: 'auto' }}>
            {channels.filter(c => c.type === 'direct').map(channel => (
              <ListItemButton key={channel.id} selected={selectedChannelId === channel.id}
                onClick={() => setSelectedChannelId(channel.id)}>
                <ListItemText primary={channel.name} />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        {/* Zone de messages */}
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selectedChannelId ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Sélectionnez un canal pour commencer</Typography>
            </Box>
          ) : (
            <>
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{currentChannel?.name}</Typography>
                  {currentChannel?.description && <Typography variant="caption" color="text.secondary">{currentChannel.description}</Typography>}
                </Box>
                <Chip label={`${currentChannel?.members.length || 0} membres`} size="small" icon={<People />} />
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Chat sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">Aucun message dans ce canal</Typography>
                    <Typography variant="caption" color="text.secondary">Soyez le premier à écrire!</Typography>
                  </Box>
                ) : (
                  messages.map(msg => {
                    const sender = getUserById(msg.senderId);
                    const isCurrentUser = msg.senderId === 'user-1';
                    return (
                      <Box key={msg.id} sx={{ display: 'flex', mb: 2, flexDirection: isCurrentUser ? 'row-reverse' : 'row', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: isCurrentUser ? 'primary.main' : 'grey.400' }}>
                          {sender?.name.charAt(0) || '?'}
                        </Avatar>
                        <Box sx={{ maxWidth: '70%' }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', flexDirection: isCurrentUser ? 'row-reverse' : 'row' }}>
                            <Typography variant="caption" fontWeight="bold">{sender?.name || msg.senderId}</Typography>
                            <Typography variant="caption" color="text.secondary">{new Date(msg.timestamp).toLocaleString()}</Typography>
                          </Box>
                          <Paper sx={{
                            p: 1.5, mt: 0.5,
                            backgroundColor: isCurrentUser ? 'primary.main' : 'grey.100',
                            color: isCurrentUser ? 'white' : 'text.primary',
                            borderRadius: 2,
                          }}>
                            <Typography variant="body2">{msg.content}</Typography>
                          </Paper>
                        </Box>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" placeholder="Écrire un message..." value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                />
                <IconButton color="primary" onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send />
                </IconButton>
              </Box>
            </>
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
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Collaboration</Typography>
            <Typography variant="body1" color="text.secondary">
              Espaces de travail collaboratifs avec communication temps réel
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge color="success" variant="dot"><People /></Badge>
            <Typography variant="body2">{onlineUsers.length} en ligne</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Dashboard" icon={<Dashboard />} iconPosition="start" />
          <Tab label="Espaces" icon={<Folder />} iconPosition="start" />
          <Tab label="Équipes" icon={<Group />} iconPosition="start" />
          <Tab label="Messages" icon={<Chat />} iconPosition="start" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderDashboardTab()}
      {activeTab === 1 && renderEspacesTab()}
      {activeTab === 2 && renderEquipesTab()}
      {activeTab === 3 && renderMessagesTab()}
    </Box>
  );
};

export default ModernCollaboration;
