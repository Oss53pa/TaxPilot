/**
 * Modern Layout - Architecture SaaS Professionnelle
 * Inspiré des meilleures interfaces comme Linear, Notion, Stripe Dashboard
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Chip,
  Collapse,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  Dashboard as DashboardIcon,
  AccountBalance as BalanceIcon,
  Assignment as AssignmentIcon,
  CloudUpload as CloudIcon,
  Tune as ConfigIcon,
  TrendingUp as TrendingIcon,
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  Brightness4 as ThemeIcon,
  ExpandLess,
  ExpandMore,
  Upload as ImportIcon,
  AccountTree as PlansIcon,
  Article as DocumentsIcon,
  Factory as ProductionIcon,
  Gavel as ComplianceIcon,
  Send as TeledeclarationIcon,
  CalendarMonth as CalendarIcon,
  Hub as ConsolidationIcon,
  Assessment as ReportingIcon,
  Policy as VeilleIcon,
  Groups as CollaborationIcon,
  Api as IntegrationsIcon,
  Shield as SecurityAdminIcon,
  BugReport as AuditIcon,
  Folder as TemplatesIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const DRAWER_WIDTH = 280
const COLLAPSED_DRAWER_WIDTH = 64

interface ModernLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactElement
  path?: string
  badge?: number
  children?: NavigationItem[]
  category?: string
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const navigate = useNavigate()
  const location = useLocation()
  
  const { user, logout } = useAuthStore()
  
  // États du layout
  const [drawerOpen, setDrawerOpen] = useState(!isMobile)
  const [drawerCollapsed, setDrawerCollapsed] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null)
  const [expandedItems, setExpandedItems] = useState<string[]>(['workspace', 'financials'])

  // Structure de navigation moderne complète
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: <DashboardIcon />,
      path: '/dashboard',
      category: 'main'
    },
    {
      id: 'comptabilite',
      label: 'Comptabilité',
      icon: <BalanceIcon />,
      category: 'main',
      children: [
        {
          id: 'import-balance',
          label: 'Import Balance',
          icon: <ImportIcon />,
          path: '/import-balance'
        },
        {
          id: 'balance',
          label: 'Balance Générale',
          icon: <BalanceIcon />,
          path: '/balance'
        },
        {
          id: 'plans-comptables',
          label: 'Plans Comptables',
          icon: <PlansIcon />,
          path: '/plans-comptables'
        }
      ]
    },
    {
      id: 'production',
      label: 'Production',
      icon: <ProductionIcon />,
      category: 'main',
      children: [
        {
          id: 'liasse',
          label: 'Liasse Fiscale',
          icon: <AssignmentIcon />,
          path: '/liasse'
        },
        {
          id: 'production-liasse',
          label: 'Production Liasse',
          icon: <ProductionIcon />,
          path: '/production-liasse'
        },
        {
          id: 'documents',
          label: 'Documents',
          icon: <DocumentsIcon />,
          path: '/documents'
        },
        {
          id: 'generation',
          label: 'Génération Auto',
          icon: <CloudIcon />,
          path: '/generation'
        }
      ]
    },
    {
      id: 'conformite',
      label: 'Conformité',
      icon: <ComplianceIcon />,
      category: 'main',
      children: [
        {
          id: 'audit',
          label: 'Audit',
          icon: <AuditIcon />,
          path: '/audit'
        },
        {
          id: 'teledeclaration',
          label: 'Télédéclaration',
          icon: <TeledeclarationIcon />,
          path: '/teledeclaration'
        },
        {
          id: 'compliance',
          label: 'Compliance',
          icon: <ComplianceIcon />,
          path: '/compliance'
        },
        {
          id: 'calendar',
          label: 'Calendrier Fiscal',
          icon: <CalendarIcon />,
          path: '/calendar'
        }
      ]
    },
    {
      id: 'avance',
      label: 'Modules Avancés',
      icon: <TrendingIcon />,
      category: 'tools',
      children: [
        {
          id: 'templates',
          label: 'Templates',
          icon: <TemplatesIcon />,
          path: '/templates'
        },
        {
          id: 'consolidation',
          label: 'Consolidation',
          icon: <ConsolidationIcon />,
          path: '/consolidation'
        },
        {
          id: 'reporting',
          label: 'Reporting',
          icon: <ReportingIcon />,
          path: '/reporting'
        },
        {
          id: 'veille',
          label: 'Veille Réglementaire',
          icon: <VeilleIcon />,
          path: '/veille'
        }
      ]
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: <CollaborationIcon />,
      category: 'tools',
      children: [
        {
          id: 'collaboration',
          label: 'Espaces de Travail',
          icon: <CollaborationIcon />,
          path: '/collaboration'
        },
        {
          id: 'integrations',
          label: 'APIs & Intégrations',
          icon: <IntegrationsIcon />,
          path: '/integrations'
        }
      ]
    },
    {
      id: 'administration',
      label: 'Administration',
      icon: <ConfigIcon />,
      category: 'tools',
      children: [
        {
          id: 'parametrage',
          label: 'Paramétrage',
          icon: <ConfigIcon />,
          path: '/parametrage'
        },
        {
          id: 'security',
          label: 'Sécurité & Accès',
          icon: <SecurityAdminIcon />,
          path: '/security'
        }
      ]
    }
  ]

  // Gestion responsive avec prévention des re-renders inutiles
  useEffect(() => {
    // Seulement mettre à jour si on passe en mode mobile
    if (isMobile && (drawerOpen || drawerCollapsed)) {
      setDrawerOpen(false)
      setDrawerCollapsed(false)
    }
  }, [isMobile, drawerOpen, drawerCollapsed])

  // Handlers
  const handleDrawerToggle = () => {
    if (isMobile) {
      setDrawerOpen(!drawerOpen)
    } else {
      setDrawerCollapsed(!drawerCollapsed)
    }
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget)
  }

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null)
  }

  const handleLogout = () => {
    logout()
    handleUserMenuClose()
    navigate('/login')
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      setDrawerOpen(false)
    }
  }

  const toggleExpandedItem = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const isParentActive = (item: NavigationItem) => {
    return item.children?.some(child => child.path && isActive(child.path))
  }

  // Composant Navigation Item
  const NavigationItemComponent: React.FC<{ item: NavigationItem; level: number }> = ({ item, level }) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const active = item.path ? isActive(item.path) : isParentActive(item)

    return (
      <>
        <ListItem disablePadding sx={{ px: drawerCollapsed ? 1 : 2 }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                toggleExpandedItem(item.id)
              } else if (item.path) {
                handleNavigation(item.path)
              }
            }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              minHeight: 44,
              backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              borderLeft: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
              pl: level * 2 + (drawerCollapsed ? 0 : 1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
              transition: theme.transitions.create(['background-color', 'border-left'], {
                duration: theme.transitions.duration.short,
              }),
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: drawerCollapsed ? 0 : 40,
                justifyContent: 'center',
                color: active ? theme.palette.primary.main : theme.palette.text.secondary,
              }}
            >
              {item.icon}
            </ListItemIcon>
            
            {!drawerCollapsed && (
              <>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 400,
                      color: active ? theme.palette.primary.main : theme.palette.text.primary,
                    }
                  }}
                />
                
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                )}
                
                {hasChildren && (
                  <IconButton size="small" sx={{ ml: 1 }}>
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && !drawerCollapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children!.map(child => (
                <NavigationItemComponent key={child.id} item={child} level={level + 1} />
              ))}
            </List>
          </Collapse>
        )}
      </>
    )
  }

  // Contenu du drawer
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo & Brand */}
      <Box
        sx={{
          p: drawerCollapsed ? 1 : 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: theme.palette.primary.main,
              fontSize: '1.2rem',
              fontWeight: 700,
            }}
          >
            F
          </Avatar>
          {!drawerCollapsed && (
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                FiscaSync
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Comptabilité intelligente
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Navigation principale */}
      <Box sx={{ flexGrow: 1, py: 1 }}>
        <List disablePadding>
          {navigationItems
            .filter(item => item.category === 'main')
            .map(item => (
              <NavigationItemComponent key={item.id} item={item} level={0} />
            ))}
        </List>

        {!drawerCollapsed && (
          <>
            <Divider sx={{ my: 2, mx: 2 }} />
            <Typography
              variant="overline"
              sx={{
                px: 3,
                mb: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                display: 'block',
              }}
            >
              Outils
            </Typography>
          </>
        )}

        <List disablePadding>
          {navigationItems
            .filter(item => item.category === 'tools')
            .map(item => (
              <NavigationItemComponent key={item.id} item={item} level={0} />
            ))}
        </List>
      </Box>

      {/* Quick actions */}
      {!drawerCollapsed && (
        <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AssignmentIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: theme.palette.primary.main,
              mb: 1,
            }}
          >
            Nouvelle liasse
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<HelpIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Support
          </Button>
        </Box>
      )}
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      {/* Navigation Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                onClick={handleDrawerToggle}
                sx={{
                  mr: 2,
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <MenuIcon />
              </IconButton>

              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {location.pathname === '/dashboard' ? 'Tableau de bord' : 
                 location.pathname.includes('liasse') ? 'Liasses fiscales' :
                 location.pathname.includes('balance') ? 'Balance comptable' :
                 'FiscaSync'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Search */}
              <IconButton
                size="large"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                }}
              >
                <SearchIcon />
              </IconButton>

              {/* Notifications */}
              <IconButton
                size="large"
                onClick={handleNotificationsOpen}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* User Menu */}
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  ml: 1,
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: theme.palette.primary.main,
                    fontSize: '0.9rem',
                  }}
                >
                  {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            backgroundColor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          },
        }}
      >
        <MenuItem onClick={() => navigate('/profile')} sx={{ py: 1.5 }}>
          <ProfileIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
          Mon profil
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')} sx={{ py: 1.5 }}>
          <SettingsIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
          Paramètres
        </MenuItem>
        <MenuItem sx={{ py: 1.5 }}>
          <ThemeIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
          Thème
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
          Déconnexion
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            maxWidth: 400,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        <MenuItem sx={{ py: 2, alignItems: 'flex-start' }}>
          <Avatar sx={{ mr: 2, width: 32, height: 32, backgroundColor: 'success.main' }}>
            <AssignmentIcon sx={{ fontSize: '1rem' }} />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Liasse 2024 validée
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Il y a 2 heures
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ModernLayout