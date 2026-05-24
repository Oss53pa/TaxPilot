/**
 * PageHeader — en-tête de page signature "Nordic Slate".
 *
 * Barre d'accent teal en dégradé + titre fort + sous-titre, avec un emplacement
 * d'actions aligné à droite. Unifie la hiérarchie visuelle de toutes les pages
 * intérieures de l'application (Import, Balance, Audit, Reporting, etc.).
 */
import React from 'react'
import { Box, Typography, Stack } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

const ACCENT = 'linear-gradient(135deg, #14b8a6 0%, #0f766e 55%, #115e59 100%)'

interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  sx?: SxProps<Theme>
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, sx }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: 2,
      mb: 4,
      ...sx,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.75, minWidth: 0 }}>
      <Box sx={{ width: 4, borderRadius: 2, flexShrink: 0, background: ACCENT }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.01em', mb: subtitle ? 0.75 : 0 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {actions && (
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
        {actions}
      </Stack>
    )}
  </Box>
)

export default PageHeader
