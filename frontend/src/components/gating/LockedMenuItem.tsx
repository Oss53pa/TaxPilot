/**
 * LockedMenuItem — Entree de menu grisee, non-cliquable, avec badge "Cabinet"
 * Utilise pour signaler dans les sidebars/menus une entree reservee au plan Cabinet.
 *
 * Clic → redirige vers /settings/billing (CTA upgrade).
 */
import React from 'react'
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
  Box,
} from '@mui/material'
import { Lock as LockIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface LockedMenuItemProps {
  label: string
  icon?: React.ReactNode
  requiredPlan?: string
  /** Si fourni, affiche une explication au survol */
  tooltip?: string
  /** Si true, l'element est utilise dans une sidebar compacte (juste icone + badge) */
  compact?: boolean
}

const LockedMenuItem: React.FC<LockedMenuItemProps> = ({
  label,
  icon,
  requiredPlan = 'Cabinet',
  tooltip,
  compact = false,
}) => {
  const navigate = useNavigate()

  const tooltipText =
    tooltip || `Cette fonctionnalite est disponible dans le plan ${requiredPlan}. Cliquez pour voir les offres.`

  const content = (
    <ListItem disablePadding data-feature-locked="true">
      <ListItemButton
        onClick={() => navigate('/settings/billing')}
        sx={{
          opacity: 0.55,
          transition: 'opacity 0.15s',
          '&:hover': {
            opacity: 0.85,
            backgroundColor: 'rgba(239, 159, 39, 0.08)',
          },
          borderLeft: '2px solid transparent',
          '&:hover .MuiListItemIcon-root': {
            color: '#EF9F27',
          },
        }}
      >
        {icon && (
          <ListItemIcon
            sx={{
              color: 'text.disabled',
              minWidth: compact ? 0 : 40,
              justifyContent: compact ? 'center' : 'flex-start',
            }}
          >
            {icon}
          </ListItemIcon>
        )}
        {!compact && (
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ color: '#9e9e9e' }}>{label}</span>
                <LockIcon sx={{ fontSize: 13, color: '#EF9F27' }} />
              </Box>
            }
            primaryTypographyProps={{ fontSize: '0.9rem' }}
          />
        )}
        {!compact && (
          <Chip
            label={requiredPlan}
            size="small"
            sx={{
              backgroundColor: 'rgba(239, 159, 39, 0.15)',
              color: '#EF9F27',
              border: '1px solid rgba(239, 159, 39, 0.35)',
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 18,
              ml: 0.5,
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  )

  return (
    <Tooltip title={tooltipText} placement="right" arrow>
      {content}
    </Tooltip>
  )
}

export default LockedMenuItem
