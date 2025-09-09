/**
 * Layout principal simplifié de l'application FiscaSync
 */

import React, { useState } from 'react'
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
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import NotificationCenter from '../notifications/NotificationCenter'

const DRAWER_WIDTH = 280

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
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    
    // ÉTAPE 1: CONFIGURATION
    { text: 'Configuration', icon: <Settings />, path: '/parametrage', divider: 'Configuration' },
    { text: 'Plans Comptables', icon: <AccountBalance />, path: '/plans-comptables' },
    { text: 'Points de Contrôle IA', icon: <Security />, path: '/control-points' },
    
    // ÉTAPE 2: IMPORT & CONTRÔLE  
    { text: 'Import Balance', icon: <CloudUpload />, path: '/import-balance', divider: 'Import & Contrôle' },
    { text: 'Consultation Balance', icon: <AccountBalance />, path: '/balance' },
    { text: 'Audit & Corrections', icon: <Security />, path: '/audit' },
    
    // ÉTAPE 3: PRODUCTION LIASSE
    { text: 'Liasses SYSCOHADA', icon: <Assignment />, path: '/direct-liasse', divider: 'Production Liasse' },
    { text: 'Génération Auto', icon: <Description />, path: '/generation' },
    { text: 'Contrôle de Liasse', icon: <Security />, path: '/validation-liasse' },
    { text: 'Templates Export', icon: <CloudUpload />, path: '/templates' },
    
    // ÉTAPE 4: FINALISATION
    { text: 'Télédéclaration', icon: <Analytics />, path: '/teledeclaration', divider: 'Finalisation' },
    { text: 'Reporting', icon: <Analytics />, path: '/reporting' },
  ]

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          FiscaSync
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.text}>
            {/* Afficher le divider de section si défini */}
            {item.divider && index > 0 && (
              <>
                <Divider sx={{ my: 1, borderColor: '#949597', opacity: 0.4 }} />
                <ListItem sx={{ py: 1, px: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: '#FFFFFF',  // Blanc pur pour maximum de contraste
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      fontSize: '0.7rem',
                      opacity: 0.9,
                      background: 'rgba(148, 149, 151, 0.2)',  // Fond léger pour lisibilité
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      width: '100%',
                      textAlign: 'center'
                    }}
                  >
                    {item.divider}
                  </Typography>
                </ListItem>
              </>
            )}
            
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.startsWith(item.path)}
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) setMobileOpen(false)
                }}
                sx={{ 
                  borderRadius: 1, 
                  mx: 1,
                  color: '#FFFFFF',  // Force blanc pour tous les textes
                  '&:hover': {
                    backgroundColor: '#949597',
                    color: '#FFFFFF'
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#949597',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    '& .MuiListItemIcon-root': { color: '#FFFFFF' },
                    '& .MuiListItemText-primary': { color: '#FFFFFF', fontWeight: 600 }
                  },
                  '& .MuiListItemIcon-root': { color: '#FFFFFF' },
                  '& .MuiListItemText-primary': { color: '#FFFFFF' }
                }}
              >
                <ListItemIcon sx={{ color: '#FFFFFF' }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{ 
                    '& .MuiTypography-root': { 
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      fontWeight: 500
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
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'primary.main',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
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
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            FiscaSync
          </Typography>

          {/* Centre de notifications */}
          <NotificationCenter />

          {/* Menu utilisateur */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
          >
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
            >
              {user?.first_name?.[0] || user?.username?.[0] || <AccountCircle />}
            </Avatar>
          </IconButton>
          
          <Menu
            id="user-menu"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
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
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: '#2c2c2c',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              position: 'relative',
              backgroundColor: '#2c2c2c',
              height: '100vh',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout