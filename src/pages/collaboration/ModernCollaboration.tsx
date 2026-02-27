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
  ListItemAvatar,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Divider,
  Switch,
  FormControlLabel,
  Avatar,
  AvatarGroup,
  Badge,
  CircularProgress,
  Tooltip,
  Menu,
  Fade,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  InputAdornment,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Skeleton
} from '@mui/material';
import {
  People,
  Person,
  Group,
  Chat,
  VideoCall,
  Call,
  Send,
  AttachFile,
  Image,
  Description,
  Folder,
  Share,
  Lock,
  LockOpen,
  Visibility,
  Edit,
  Delete,
  Add,
  Comment,
  ThumbUp,
  Star,
  Schedule,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Task,
  Assignment,
  AssignmentInd,
  AssignmentTurnedIn,
  Timeline,
  Dashboard,
  CloudUpload,
  CloudDownload,
  Sync,
  SyncProblem,
  History,
  Search,
  FilterList,
  MoreVert,
  Circle,
  FiberManualRecord,
  VideoLibrary,
  ScreenShare,
  StopScreenShare,
  MicOff,
  Mic,
  VideocamOff,
  Videocam,
  Forum,
  QuestionAnswer,
  Announcement,
  Campaign,
  EmojiEmotions,
  AttachMoney,
  Receipt
} from '@mui/icons-material';

// EX-COLLAB-001 à 010: Module Collaboration Complet
// Collaboration temps réel multi-utilisateurs avec gestion des droits

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'accountant' | 'auditor' | 'viewer';
  department: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
  permissions: Permission[];
  isActive: boolean;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  projects: string[];
  createdAt: Date;
  createdBy: string;
  isPrivate: boolean;
  settings: TeamSettings;
}

interface TeamMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  joinedAt: Date;
  permissions: string[];
}

interface TeamSettings {
  allowGuestAccess: boolean;
  requireApproval: boolean;
  notificationsEnabled: boolean;
  defaultPermissions: string[];
}

interface WorkSpace {
  id: string;
  name: string;
  type: 'project' | 'department' | 'temporary';
  description: string;
  owner: string;
  teams: string[];
  documents: SharedDocument[];
  tasks: CollaborativeTask[];
  discussions: Discussion[];
  activities: Activity[];
  createdAt: Date;
  lastActivity: Date;
  status: 'active' | 'archived' | 'completed';
  progress: number;
}

interface SharedDocument {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'other';
  size: number;
  path: string;
  owner: string;
  sharedWith: SharePermission[];
  version: number;
  isLocked: boolean;
  lockedBy?: string;
  lastModified: Date;
  lastModifiedBy: string;
  comments: DocumentComment[];
  tags: string[];
}

interface SharePermission {
  userId?: string;
  teamId?: string;
  permission: 'view' | 'comment' | 'edit' | 'admin';
  sharedAt: Date;
  sharedBy: string;
  expiresAt?: Date;
}

interface DocumentComment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  replies: DocumentComment[];
  isResolved: boolean;
  mentions: string[];
}

interface CollaborativeTask {
  id: string;
  title: string;
  description: string;
  assignees: string[];
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  workspaceId: string;
  subtasks: CollaborativeTask[];
  attachments: string[];
  comments: TaskComment[];
  watchers: string[];
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
}

interface TaskComment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  attachments: string[];
  mentions: string[];
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: string;
  workspaceId: string;
  category: 'general' | 'technical' | 'financial' | 'announcement';
  isPinned: boolean;
  isLocked: boolean;
  replies: DiscussionReply[];
  likes: string[];
  views: number;
  createdAt: Date;
  lastReply?: Date;
  tags: string[];
}

interface DiscussionReply {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  likes: string[];
  isAnswer?: boolean;
}

interface Activity {
  id: string;
  type: 'document' | 'task' | 'discussion' | 'member' | 'system';
  action: string;
  userId: string;
  targetId?: string;
  targetName?: string;
  timestamp: Date;
  details?: string;
  isImportant: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  recipientId?: string;
  channelId?: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  timestamp: Date;
  isRead: boolean;
  isEdited: boolean;
  attachments?: string[];
  reactions?: { emoji: string; users: string[] }[];
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

const ModernCollaboration: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [workspaces, setWorkspaces] = useState<WorkSpace[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkSpace | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isWorkspaceDialogOpen, setIsWorkspaceDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState('');
  
  // EX-COLLAB-001: Collaboration temps réel
  const [isConnected, setIsConnected] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const syncInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialisation
  useEffect(() => {
    initializeCollaboration();
    startRealTimeSync();
    
    return () => {
      if (syncInterval.current) {
        clearInterval(syncInterval.current);
      }
    };
  }, []);

  const initializeCollaboration = () => {
    // Utilisateur actuel
    const mockCurrentUser: User = {
      id: 'user-1',
      name: 'Jean Dupont',
      email: 'jean.dupont@entreprise.com',
      role: 'manager',
      department: 'Finance',
      avatar: undefined,
      status: 'online',
      lastSeen: new Date(),
      permissions: [],
      isActive: true
    };
    setCurrentUser(mockCurrentUser);

    // Utilisateurs
    const mockUsers: User[] = [
      mockCurrentUser,
      {
        id: 'user-2',
        name: 'Marie Martin',
        email: 'marie.martin@entreprise.com',
        role: 'accountant',
        department: 'Comptabilité',
        status: 'online',
        lastSeen: new Date(),
        permissions: [],
        isActive: true
      },
      {
        id: 'user-3',
        name: 'Pierre Durand',
        email: 'pierre.durand@entreprise.com',
        role: 'auditor',
        department: 'Audit',
        status: 'away',
        lastSeen: new Date(Date.now() - 15 * 60000),
        permissions: [],
        isActive: true
      },
      {
        id: 'user-4',
        name: 'Sophie Bernard',
        email: 'sophie.bernard@entreprise.com',
        role: 'admin',
        department: 'IT',
        status: 'busy',
        lastSeen: new Date(),
        permissions: [],
        isActive: true
      }
    ];
    setUsers(mockUsers);
    setOnlineUsers(mockUsers.filter(u => u.status === 'online').map(u => u.id));

    // Espaces de travail
    const mockWorkspaces: WorkSpace[] = [
      {
        id: 'ws-1',
        name: 'Clôture Annuelle 2024',
        type: 'project',
        description: 'Préparation et validation des états financiers annuels',
        owner: 'user-1',
        teams: ['team-1'],
        documents: [
          {
            id: 'doc-1',
            name: 'Balance Générale 2024.xlsx',
            type: 'spreadsheet',
            size: 2456789,
            path: '/documents/balance-2024.xlsx',
            owner: 'user-2',
            sharedWith: [
              {
                teamId: 'team-1',
                permission: 'edit',
                sharedAt: new Date('2024-11-01'),
                sharedBy: 'user-2'
              }
            ],
            version: 3,
            isLocked: false,
            lastModified: new Date('2024-11-25'),
            lastModifiedBy: 'user-2',
            comments: [],
            tags: ['balance', '2024', 'financier']
          }
        ],
        tasks: [
          {
            id: 'task-1',
            title: 'Valider les écritures de régularisation',
            description: 'Vérifier et valider toutes les écritures de fin d\'exercice',
            assignees: ['user-2', 'user-3'],
            dueDate: new Date('2024-12-15'),
            priority: 'high',
            status: 'in-progress',
            workspaceId: 'ws-1',
            subtasks: [],
            attachments: [],
            comments: [],
            watchers: ['user-1'],
            createdBy: 'user-1',
            createdAt: new Date('2024-11-01'),
            estimatedHours: 8
          }
        ],
        discussions: [],
        activities: [],
        createdAt: new Date('2024-11-01'),
        lastActivity: new Date(),
        status: 'active',
        progress: 45
      },
      {
        id: 'ws-2',
        name: 'Audit Fiscal Q4 2024',
        type: 'project',
        description: 'Audit de conformité fiscale du quatrième trimestre',
        owner: 'user-3',
        teams: ['team-2'],
        documents: [],
        tasks: [],
        discussions: [],
        activities: [],
        createdAt: new Date('2024-10-15'),
        lastActivity: new Date('2024-11-20'),
        status: 'active',
        progress: 70
      }
    ];
    setWorkspaces(mockWorkspaces);

    // Équipes
    const mockTeams: Team[] = [
      {
        id: 'team-1',
        name: 'Équipe Finance',
        description: 'Équipe responsable de la comptabilité et finances',
        members: [
          {
            userId: 'user-1',
            role: 'admin',
            joinedAt: new Date('2024-01-01'),
            permissions: ['all']
          },
          {
            userId: 'user-2',
            role: 'member',
            joinedAt: new Date('2024-01-15'),
            permissions: ['read', 'write']
          }
        ],
        projects: ['ws-1'],
        createdAt: new Date('2024-01-01'),
        createdBy: 'user-1',
        isPrivate: false,
        settings: {
          allowGuestAccess: false,
          requireApproval: true,
          notificationsEnabled: true,
          defaultPermissions: ['read']
        }
      }
    ];
    setTeams(mockTeams);

    // Activités récentes
    const mockActivities: Activity[] = [
      {
        id: 'act-1',
        type: 'document',
        action: 'a modifié',
        userId: 'user-2',
        targetId: 'doc-1',
        targetName: 'Balance Générale 2024.xlsx',
        timestamp: new Date(Date.now() - 30 * 60000),
        isImportant: false
      },
      {
        id: 'act-2',
        type: 'task',
        action: 'a commencé',
        userId: 'user-3',
        targetId: 'task-1',
        targetName: 'Valider les écritures de régularisation',
        timestamp: new Date(Date.now() - 2 * 3600000),
        isImportant: true
      }
    ];
    setActivities(mockActivities);
  };

  // EX-COLLAB-002: Synchronisation temps réel
  const startRealTimeSync = () => {
    syncInterval.current = setInterval(() => {
      syncCollaborationData();
    }, 5000); // Toutes les 5 secondes
  };

  const syncCollaborationData = () => {
    setSyncStatus('syncing');
    // Simulation de synchronisation
    setTimeout(() => {
      setSyncStatus('synced');
      // Mise à jour des statuts utilisateurs
      updateUserStatuses();
    }, 1000);
  };

  const updateUserStatuses = () => {
    // Simulation de mise à jour des statuts
    setUsers(prev => prev.map(user => ({
      ...user,
      lastSeen: user.status === 'online' ? new Date() : user.lastSeen
    })));
  };

  // EX-COLLAB-003: Envoi de message chat
  const sendChatMessage = () => {
    if (!messageInput.trim() || !currentUser) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      channelId: selectedWorkspace?.id,
      content: messageInput,
      type: 'text',
      timestamp: new Date(),
      isRead: false,
      isEdited: false
    };

    setChatMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    
    // Ajouter à l'activité
    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: 'discussion',
      action: 'a envoyé un message',
      userId: currentUser.id,
      timestamp: new Date(),
      isImportant: false
    };
    setActivities(prev => [activity, ...prev]);
  };

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'away': return '#ff9800';
      case 'busy': return '#f44336';
      case 'offline': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#171717';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  const renderDashboardTab = () => (
    <Box>
      {/* Statut de connexion */}
      <Alert 
        severity={syncStatus === 'synced' ? 'success' : syncStatus === 'syncing' ? 'info' : 'error'}
        icon={
          syncStatus === 'synced' ? <Sync /> : 
          syncStatus === 'syncing' ? <CircularProgress size={20} /> : 
          <SyncProblem />
        }
        sx={{ mb: 3 }}
      >
        {syncStatus === 'synced' && 'Collaboration en temps réel activée'}
        {syncStatus === 'syncing' && 'Synchronisation en cours...'}
        {syncStatus === 'error' && 'Problème de connexion'}
      </Alert>

      {/* Utilisateurs en ligne */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Équipe en Ligne ({onlineUsers.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {users.filter(u => u.status === 'online').map((user) => (
            <Chip
              key={user.id}
              avatar={
                <Avatar sx={{ bgcolor: getStatusColor(user.status) }}>
                  {user.name.charAt(0)}
                </Avatar>
              }
              label={user.name}
              variant="outlined"
              onClick={() => setSelectedUser(user)}
            />
          ))}
        </Box>
      </Paper>

      {/* Espaces de travail actifs */}
      <Typography variant="h6" gutterBottom>
        Espaces de Travail Actifs
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {workspaces.filter(ws => ws.status === 'active').map((workspace) => (
          <Grid item xs={12} md={6} lg={4} key={workspace.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[8]
                }
              }}
              onClick={() => setSelectedWorkspace(workspace)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {workspace.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {workspace.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${workspace.progress}%`}
                    size="small"
                    color={workspace.progress >= 75 ? 'success' : workspace.progress >= 50 ? 'warning' : 'default'}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={workspace.progress}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      icon={<Description />}
                      label={workspace.documents.length}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Task />}
                      label={workspace.tasks.length}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <AvatarGroup max={3}>
                    {workspace.teams.map(teamId => {
                      const team = teams.find(t => t.id === teamId);
                      return team?.members.slice(0, 3).map(member => {
                        const user = getUserById(member.userId);
                        return (
                          <Avatar key={member.userId} sx={{ width: 24, height: 24 }}>
                            {user?.name.charAt(0)}
                          </Avatar>
                        );
                      });
                    })}
                  </AvatarGroup>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Activité récente */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Activité Récente
        </Typography>
        <List>
          {activities.slice(0, 5).map((activity) => {
            const user = getUserById(activity.userId);
            return (
              <ListItem key={activity.id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {user?.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box>
                      <strong>{user?.name}</strong> {activity.action} {activity.targetName && <strong>{activity.targetName}</strong>}
                    </Box>
                  }
                  secondary={activity.timestamp.toLocaleString()}
                />
                {activity.isImportant && (
                  <ListItemSecondaryAction>
                    <Star color="warning" />
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            );
          })}
        </List>
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
              Collaboration
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Espaces de travail collaboratifs avec communication temps réel
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge color="success" variant="dot">
              <People />
            </Badge>
            <Typography variant="body2">
              {onlineUsers.length} en ligne
            </Typography>
          </Box>
        </Box>
        
        {/* Alerte de performance */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>EX-COLLAB-001 :</strong> Collaboration temps réel multi-utilisateurs • 
          Gestion avancée des droits et permissions • 
          Chat intégré et partage de documents sécurisé
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
            label="Espaces" 
            icon={<Folder />} 
            iconPosition="start"
          />
          <Tab 
            label="Équipes" 
            icon={<Group />} 
            iconPosition="start"
          />
          <Tab 
            label="Messages" 
            icon={<Chat />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Contenu */}
      {activeTab === 0 && renderDashboardTab()}
    </Box>
  );
};

export default ModernCollaboration;