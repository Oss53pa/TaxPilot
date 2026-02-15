import React from 'react'
import { Stack, Typography, IconButton, Tooltip, useTheme } from '@mui/material'
import { Print as PrintIcon, GetApp as ExportIcon } from '@mui/icons-material'

interface SheetHeaderProps {
  title: string
  icon: React.ReactElement
  onPrint?: () => void
  onExport?: () => void
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({ title, icon, onPrint, onExport }) => {
  const theme = useTheme()

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        {React.cloneElement(icon, { color: 'primary', sx: { fontSize: 28 } })}
        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {title}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Tooltip title="Imprimer">
          <IconButton size="small" onClick={onPrint}>
            <PrintIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Exporter">
          <IconButton size="small" onClick={onExport}>
            <ExportIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  )
}
