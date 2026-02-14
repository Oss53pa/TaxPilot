/**
 * Centre de notifications temps réel
 * WebSocket + notifications push pour événements critiques
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Button,
  Chip,
} from '@mui/material'
import {
  Notifications as NotificationIcon,
  Circle as DotIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  module: string
  action?: {
    label: string
    route: string
  }
}

const NotificationCenter: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Simulation de notifications temps réel
    const simulateNotifications = () => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Import Balance Réussi',
          message: 'Balance_202412.xlsx importée avec succès - 247 comptes traités',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
          isRead: false,
          module: 'Balance',
          action: { label: 'Voir la balance', route: '/balance' }
        },
        {
          id: '2',
          type: 'warning',
          title: 'Audit IA - 3 Écarts Détectés',
          message: 'Contrôles de cohérence : écarts mineurs sur immobilisations',
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
          isRead: false,
          module: 'Audit',
          action: { label: 'Corriger', route: '/audit' }
        },
        {
          id: '3',
          type: 'info',
          title: 'Échéance TVA',
          message: 'Déclaration TVA Décembre due le 20/01/2025 - 85 000',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
          isRead: true,
          module: 'Fiscal',
          action: { label: 'Préparer', route: '/teledeclaration' }
        }
      ]
      
      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length)
    }

    simulateNotifications()

    // Simulation WebSocket pour nouvelles notifications
    const interval = setInterval(() => {
      // Ajouter une notification aléatoire de temps en temps
      if (Math.random() > 0.95) { // 5% chance toutes les 5s
        const newNotif: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'info' : 'success',
          title: 'Nouvelle Activité',
          message: 'Synchronisation balance automatique effectuée',
          timestamp: new Date(),
          isRead: false,
          module: 'Système'
        }
        
        setNotifications(prev => [newNotif, ...prev])
        setUnreadCount(prev => prev + 1)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    const iconProps = { fontSize: 'small' as const }
    switch (type) {
      case 'success': return <SuccessIcon color="success" {...iconProps} />
      case 'warning': return <WarningIcon color="warning" {...iconProps} />
      case 'error': return <ErrorIcon color="error" {...iconProps} />
      default: return <InfoIcon color="info" {...iconProps} />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return '#22c55e'
      case 'warning': return '#f59e0b'
      case 'error': return '#ef4444'
      default: return '#3b82f6'
    }
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{ color: 'inherit' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top', 
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { 
            width: 380, 
            maxHeight: 500,
            border: 1,
            borderColor: 'divider'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Tout marquer lu
              </Button>
            )}
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">
              Aucune notification
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    py: 1.5,
                    bgcolor: notification.isRead ? 'inherit' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: getNotificationColor(notification.type) + '20',
                      width: 36, 
                      height: 36
                    }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {notification.title}
                        </Typography>
                        <Chip 
                          label={notification.module}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        {!notification.isRead && (
                          <DotIcon sx={{ color: 'primary.main', fontSize: 12 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.timestamp.toLocaleString('fr-FR')}
                        </Typography>
                        {notification.action && (
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ mt: 1, height: 24, fontSize: '0.75rem' }}
                            onClick={() => {
                              // Navigate to action route
                              window.location.hash = notification.action!.route
                              handleClose()
                            }}
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Button size="small" fullWidth variant="outlined">
            Voir toutes les notifications
          </Button>
        </Box>
      </Popover>
    </>
  )
}

export default NotificationCenter