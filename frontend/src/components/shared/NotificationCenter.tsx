/**
 * Centre de notifications pour TaxPilot
 */

import React from 'react'
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Button,
  Divider,
  Avatar,
} from '@mui/material'
import {
  Close,
  Info,
  Warning,
  Error,
  CheckCircle,
  MarkEmailRead,
  ClearAll,
} from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '@/store'
import { markAsRead, markAllAsRead, clearOldNotifications } from '@/store/notificationSlice'
import { Notification } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch()
  const { notifications, unreadCount, isLoading } = useAppSelector(state => state.notifications)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ERROR':
        return <Error color="error" />
      case 'WARNING':
        return <Warning color="warning" />
      case 'SUCCESS':
        return <CheckCircle color="success" />
      default:
        return <Info color="info" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ERROR':
        return 'error'
      case 'WARNING':
        return 'warning'
      case 'SUCCESS':
        return 'success'
      default:
        return 'info'
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const handleClearOld = () => {
    dispatch(clearOldNotifications(7)) // Supprimer les notifications de plus de 7 jours
  }

  const renderNotification = (notification: Notification) => (
    <ListItem
      key={notification.id}
      sx={{
        bgcolor: notification.lue ? 'background.paper' : 'action.hover',
        borderLeft: 4,
        borderLeftColor: `${getNotificationColor(notification.type_notification)}.main`,
        mb: 1,
        borderRadius: 1,
      }}
    >
      <ListItemIcon>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: `${getNotificationColor(notification.type_notification)}.light`,
          }}
        >
          {getNotificationIcon(notification.type_notification)}
        </Avatar>
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: notification.lue ? 400 : 600 }}>
              {notification.titre}
            </Typography>
            {!notification.lue && (
              <Chip
                label="Nouveau"
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mt: 0.5,
              }}
            >
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
            </Typography>
          </Box>
        }
      />
      
      {!notification.lue && (
        <IconButton
          size="small"
          onClick={() => handleMarkAsRead(notification.id)}
          sx={{ ml: 1 }}
        >
          <MarkEmailRead fontSize="small" />
        </IconButton>
      )}
    </ListItem>
  )

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                color="primary"
                sx={{ ml: 1, height: 24 }}
              />
            )}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            startIcon={<MarkEmailRead />}
          >
            Tout marquer lu
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClearOld}
            startIcon={<ClearAll />}
          >
            Nettoyer
          </Button>
        </Box>

        <Divider />
      </Box>

      {/* Liste des notifications */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        {isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Chargement des notifications...
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              Aucune notification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vous êtes à jour !
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.map(renderNotification)}
          </List>
        )}
      </Box>
    </Drawer>
  )
}

export default NotificationCenter