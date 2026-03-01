/**
 * Layout principal de l'application TaxPilot
 * Palette Grayscale monochrome
 */

import React, { useState } from 'react'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import '../../styles/liasse-fixes.css'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material'
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Dashboard as DashboardIcon,
  Settings,
  AccountBalance,
  Assignment,
  Security,
  Description,
  CloudUpload,
  Analytics,
  Home as HomeIcon,
  History as HistoryIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import NotificationCenter from '../notifications/NotificationCenter'

const DRAWER_WIDTH = 270

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()

  const { user, logout } = useAuthStore()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorElUser(null)
  }

  const handleLogout = () => {
    logout()
    handleUserMenuClose()
    navigate('/login')
  }

  const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },

    { text: 'Configuration', icon: <Settings />, path: '/parametrage', divider: 'Configuration' },
    { text: 'Plans Comptables', icon: <AccountBalance />, path: '/plans-comptables' },
    { text: 'Points de Contrôle IA', icon: <Security />, path: '/control-points' },

    { text: 'Import Balance', icon: <CloudUpload />, path: '/import-balance', divider: 'Import & Contrôle' },
    { text: 'Journal des Imports', icon: <HistoryIcon />, path: '/import-history' },
    { text: 'Consultation Balance', icon: <AccountBalance />, path: '/balance' },
    { text: 'Audit & Corrections', icon: <Security />, path: '/audit' },

    { text: 'Liasses SYSCOHADA', icon: <Assignment />, path: '/direct-liasse', divider: 'Production Liasse' },
    { text: 'Liasse Fiscale', icon: <Description />, path: '/liasse-fiscale' },
    { text: 'Génération Auto', icon: <Description />, path: '/generation' },
    { text: 'Contrôle de Liasse', icon: <Security />, path: '/validation-liasse' },
    { text: 'Templates Export', icon: <CloudUpload />, path: '/templates' },

    { text: 'Télédéclaration', icon: <Analytics />, path: '/teledeclaration', divider: 'Finalisation' },
    { text: 'Reporting', icon: <Analytics />, path: '/reporting' },
  ]

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo + Accueil */}
      <Toolbar sx={{ px: 2.5, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Grand Hotel', cursive",
            fontSize: '1.6rem',
            fontWeight: 400,
            color: P.white,
            letterSpacing: 0.5,
          }}
        >
          TaxPilot
        </Typography>
        <IconButton
          onClick={() => navigate('/')}
          size="small"
          sx={{
            color: P.primary500,
            '&:hover': { color: P.white, bgcolor: P.primary800 },
          }}
          title="Page d'accueil"
        >
          <HomeIcon fontSize="small" />
        </IconButton>
      </Toolbar>

      <List sx={{ px: 0.5, overflowY: 'auto', flexGrow: 1 }}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.text}>
            {item.divider && index > 0 && (
              <>
                <Divider sx={{ my: 1.5, mx: 2, borderColor: P.primary700, opacity: 0.5 }} />
                <ListItem sx={{ py: 0.5, px: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: P.primary500,
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      fontSize: '0.65rem',
                    }}
                  >
                    {item.divider}
                  </Typography>
                </ListItem>
              </>
            )}

            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))}
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) setMobileOpen(false)
                }}
                sx={{
                  borderRadius: 3,
                  mx: 1,
                  my: 0.25,
                  py: 0.75,
                  color: P.primary300,
                  '&:hover': {
                    backgroundColor: P.primary800,
                    color: P.white,
                    '& .MuiListItemIcon-root': { color: P.white },
                  },
                  '&.Mui-selected': {
                    backgroundColor: P.primary700,
                    color: P.white,
                    '& .MuiListItemIcon-root': { color: P.white },
                    '& .MuiListItemText-primary': { color: P.white, fontWeight: 600 },
                    '&:hover': { backgroundColor: P.primary600 },
                  },
                  '& .MuiListItemIcon-root': { color: P.primary400 },
                  '& .MuiListItemText-primary': { color: P.primary300 },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: '0.85rem',
                      fontWeight: 500,
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${P.primary200}`,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600, color: 'text.primary' }}
          >
            TaxPilot
          </Typography>

          <NotificationCenter />

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
          >
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'text.primary', color: P.white, fontSize: '0.85rem', fontWeight: 600 }}
            >
              {user?.first_name?.[0] || user?.username?.[0] || <AccountCircle />}
            </Avatar>
          </IconButton>

          <Menu
            id="user-menu"
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorElUser)}
            onClose={handleUserMenuClose}
          >
            <MenuItem onClick={handleUserMenuClose} disabled>
              <Typography variant="subtitle2" color="text.secondary">
                {user?.first_name} {user?.last_name}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose} disabled>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} fontSize="small" />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: P.primary900,
              borderRight: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              position: 'relative',
              backgroundColor: P.primary900,
              height: '100vh',
              borderRight: 'none',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'grey.50',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto', minHeight: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
