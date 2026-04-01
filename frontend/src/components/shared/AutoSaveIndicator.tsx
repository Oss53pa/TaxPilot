import React from 'react'
import { Chip } from '@mui/material'
import { CloudDone, CloudSync, CloudOff } from '@mui/icons-material'

interface AutoSaveIndicatorProps {
  status: 'saved' | 'saving' | 'error' | 'idle'
  lastSaved?: string
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ status, lastSaved }) => {
  const config = {
    saved: { icon: <CloudDone fontSize="small" />, label: 'Sauvegardé', color: 'success' as const },
    saving: { icon: <CloudSync fontSize="small" />, label: 'Sauvegarde...', color: 'info' as const },
    error: { icon: <CloudOff fontSize="small" />, label: 'Erreur sauvegarde', color: 'error' as const },
    idle: { icon: <CloudDone fontSize="small" />, label: 'Brouillon local', color: 'default' as const },
  }

  const { icon, label, color } = config[status]

  return (
    <Chip
      icon={icon}
      label={lastSaved ? `${label} · ${new Date(lastSaved).toLocaleTimeString('fr-FR')}` : label}
      size="small"
      color={color}
      variant="outlined"
      sx={{ fontSize: '0.75rem' }}
    />
  )
}

export default AutoSaveIndicator
