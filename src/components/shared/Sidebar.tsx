/**
 * Sidebar de navigation pour FiscaSync
 */

import React from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
  Collapse,
} from '@mui/material'
import {
  Dashboard,
  Settings,
  AccountBalance,
  Assessment,
  Receipt,
  CloudUpload,
  FindInPage,
  AutoAwesome,
  BarChart,
  Business,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface MenuItem {
  title: string
  icon: React.ReactElement
  path?: string
  children?: MenuItem[]
  badge?: string | number
  roles?: string[]
}

const menuItems: MenuItem[] = [
  {
    title: 'Tableau de Bord',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    title: 'Paramétrage',
    icon: <Settings />,
    children: [
      {
        title: 'Entreprise',
        icon: <Business />,
        path: '/parametrage/entreprise',
      },
      {
        title: 'Utilisateurs',
        icon: <Settings />,
        path: '/parametrage/utilisateurs',
      },
      {
        title: 'Plans Comptables',
        icon: <AccountBalance />,
        path: '/parametrage/plans-comptables',
      },
    ],
  },
  {
    title: 'Balance',
    icon: <AccountBalance />,
    children: [
      {
        title: 'Import Balance',
        icon: <CloudUpload />,
        path: '/balance/import',
      },
      {
        title: 'Consultation',
        icon: <FindInPage />,
        path: '/balance/consultation',
      },
      {
        title: 'Validation',
        icon: <Assessment />,
        path: '/balance/validation',
      },
    ],
  },
  {
    title: 'Audit',
    icon: <FindInPage />,
    children: [
      {
        title: 'Lancer Audit',
        icon: <AutoAwesome />,
        path: '/audit/execution',
      },
      {
        title: 'Anomalies',
        icon: <Assessment />,
        path: '/audit/anomalies',
        badge: 'New',
      },
      {
        title: 'Historique',
        icon: <BarChart />,
        path: '/audit/historique',
      },
    ],
  },
  {
    title: 'Génération',
    icon: <Receipt />,
    children: [
      {
        title: 'Liasse Fiscale',
        icon: <Receipt />,
        path: '/generation/liasse',
      },
      {
        title: 'Écritures Correctives',
        icon: <AutoAwesome />,
        path: '/generation/ecritures',
      },
    ],
  },
  {
    title: 'Templates',
    icon: <CloudUpload />,
    children: [
      {
        title: 'Gestionnaire',
        icon: <CloudUpload />,
        path: '/templates/gestionnaire',
      },
      {
        title: 'Éditeur',
        icon: <Settings />,
        path: '/templates/editeur',
      },
    ],
  },
  {
    title: 'Reporting',
    icon: <BarChart />,
    children: [
      {
        title: 'Tableaux de Bord',
        icon: <Dashboard />,
        path: '/reporting/dashboards',
      },
      {
        title: 'Analyses',
        icon: <Assessment />,
        path: '/reporting/analyses',
      },
    ],
  },
]

interface SidebarProps {
  onNavigate?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({})

  const handleItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path)
      onNavigate?.()
    } else if (item.children) {
      setOpenItems(prev => ({
        ...prev,
        [item.title]: !prev[item.title]
      }))
    }
  }

  const isSelected = (path?: string) => {
    if (!path) return false
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isOpen = openItems[item.title]
    const selected = isSelected(item.path)

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            selected={selected}
            sx={{
              minHeight: 48,
              px: 2.5,
              pl: level * 2 + 2.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 3,
                justifyContent: 'center',
                color: selected ? 'inherit' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: selected ? 600 : 500,
              }}
            />
            
            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                color="secondary"
                sx={{ height: 20, fontSize: '0.75rem' }}
              />
            )}
            
            {hasChildren && (
              isOpen ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header du Sidebar */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          FiscaSync
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Solution Fiscale OHADA
        </Typography>
        
        {user?.entreprise_courante && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user.entreprise_courante.raison_sociale}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.role}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ pt: 2 }}>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer du Sidebar */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Version 1.0.0
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          © 2024 FiscaSync
        </Typography>
      </Box>
    </Box>
  )
}

export default Sidebar