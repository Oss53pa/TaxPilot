/**
 * Layout principal avec navbar TaxPilot
 */

import React, { useState } from 'react'
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
} from '@mui/material'
import {
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
  ArrowDropDown,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const PRIMARY_COLOR = '#171717'

interface LayoutWithNavbarProps {
  children: React.ReactNode
}

const LayoutWithNavbar: React.FC<LayoutWithNavbarProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const { user, logout } = useAuthStore()
  
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorElUser(null)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, menuKey: string) => {
    setAnchorElMenu(event.currentTarget)
    setActiveMenu(menuKey)
  }

  const handleMenuClose = () => {
    setAnchorElMenu(null)
    setActiveMenu(null)
  }

  const handleLogout = () => {
    logout()
    handleUserMenuClose()
    navigate('/login')
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    handleMenuClose()
  }

  // Organisation des menus par catégorie
  const menuCategories = {
    'Gestion': [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Paramétrage', icon: <Settings />, path: '/parametrage' },
      { text: 'Balance', icon: <AccountBalance />, path: '/balance' },
    ],
    'Liasses': [
      { text: 'Liasses Fiscales', icon: <Assignment />, path: '/liasses' },
      { text: 'Liasse Complète', icon: <Assignment />, path: '/liasse-complete' },
    ],
    'Production': [
      { text: 'Audit Intelligent', icon: <Security />, path: '/audit' },
      { text: 'Génération Auto', icon: <Description />, path: '/generation' },
      { text: 'Templates Export', icon: <CloudUpload />, path: '/templates' },
      { text: 'Télédéclaration', icon: <Analytics />, path: '/teledeclaration' },
    ]
  }

  const isActiveSection = (items: any[]) => {
    return items.some(item => location.pathname.startsWith(item.path))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Navbar principale */}
      <AppBar position="static" sx={{ backgroundColor: PRIMARY_COLOR, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: 'white', 
              mr: 4,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={() => navigate('/dashboard')}
          >
            TaxPilot
          </Typography>

          {/* Navigation par catégories */}
          <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
            {Object.entries(menuCategories).map(([category, items]) => (
              <Button
                key={category}
                color="inherit"
                endIcon={<ArrowDropDown />}
                onClick={(e) => handleMenuOpen(e, category)}
                sx={{
                  textTransform: 'none',
                  fontWeight: isActiveSection(items) ? 700 : 500,
                  backgroundColor: activeMenu === category || isActiveSection(items) 
                    ? 'rgba(255,255,255,0.15)' 
                    : 'transparent',
                  borderRadius: 1,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                {category}
              </Button>
            ))}
          </Box>

          {/* Menu utilisateur */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Bienvenue, {user?.name || 'Utilisateur'}
            </Typography>
            
            <IconButton
              size="large"
              onClick={handleUserMenuOpen}
              color="inherit"
              sx={{
                border: '2px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <Avatar sx={{ width: 32, height: 32, backgroundColor: 'white', color: PRIMARY_COLOR }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menu dropdown des catégories */}
      <Menu
        anchorEl={anchorElMenu}
        open={Boolean(anchorElMenu) && activeMenu !== null}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: `1px solid ${PRIMARY_COLOR}`,
          },
        }}
      >
        {activeMenu && menuCategories[activeMenu as keyof typeof menuCategories]?.map((item) => (
          <MenuItem
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname.startsWith(item.path)}
            sx={{
              py: 1.5,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 25, 25, 0.08)',
                fontWeight: 600,
              },
              '&:hover': {
                backgroundColor: 'rgba(25, 25, 25, 0.04)',
              },
            }}
          >
            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', color: PRIMARY_COLOR }}>
              {item.icon}
            </Box>
            {item.text}
          </MenuItem>
        ))}
      </Menu>

      {/* Menu utilisateur */}
      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
        }}
      >
        <MenuItem onClick={() => navigate('/profile')} sx={{ py: 1.5 }}>
          <AccountCircle sx={{ mr: 2 }} />
          Mon Profil
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <Logout sx={{ mr: 2 }} />
          Déconnexion
        </MenuItem>
      </Menu>

      {/* Zone de contenu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', backgroundColor: '#f5f5f5' }}>
        {children}
      </Box>

      {/* Footer optionnel */}
      <Box 
        sx={{ 
          backgroundColor: PRIMARY_COLOR, 
          color: 'white', 
          py: 1, 
          px: 3,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          © 2025 Atlas Studio. Tous droits réservés. TaxPilot est une marque d'Atlas Studio.
        </Typography>
      </Box>
    </Box>
  )
}

export default LayoutWithNavbar