import React from 'react'
import { Box, Paper, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'

const LIASSE_FONT = '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

interface LiassePageProps {
  children: React.ReactNode
  orientation?: 'portrait' | 'landscape'
  zoom?: number
}

const LiassePage: React.FC<LiassePageProps> = ({ children, orientation = 'portrait', zoom = 100 }) => {
  const theme = useTheme()
  const isLandscape = orientation === 'landscape'
  const scale = zoom / 100

  return (
    <Box sx={{
      // Compensate height when zoomed out to avoid empty space
      height: scale < 1 ? `calc(${scale} * 100%)` : 'auto',
      overflow: 'visible',
    }}>
    <Paper
      elevation={0}
      className={isLandscape ? 'landscape' : undefined}
      sx={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: isLandscape ? '297mm' : '210mm',
        minHeight: isLandscape ? '210mm' : '297mm',
        mx: 'auto',
        my: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: '12mm 15mm',
        position: 'relative',
        overflow: 'visible',
        fontFamily: LIASSE_FONT,
        fontSize: 11,
        lineHeight: 1.45,
        color: theme.palette.text.primary,

        // ── Cascading overrides for ALL child tables (84 pages) ──
        '& table': {
          borderCollapse: 'collapse',
          fontFamily: `${LIASSE_FONT} !important`,
          fontSize: 11,
          width: '100%',
        },
        '& th': {
          backgroundColor: theme.palette.grey[100],
          fontWeight: 600,
          fontSize: 10,
          border: `1px solid ${theme.palette.divider}`,
          padding: '4px 6px',
          textAlign: 'center',
          fontFamily: `${LIASSE_FONT} !important`,
        },
        '& td': {
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          padding: '3px 6px',
          fontSize: 11,
          fontFamily: `${LIASSE_FONT} !important`,
        },
        // Row hover
        '& tbody tr:hover': {
          backgroundColor: `${alpha(theme.palette.action.hover, 0.05)} !important`,
        },
        // Override total rows (inline bg rgb(229,229,229))
        '& tr[style*="background-color: rgb(229"]': {
          backgroundColor: `${alpha(theme.palette.warning.main, 0.05)} !important`,
          fontWeight: 600,
        },
        // Override subtotal rows (inline bg rgb(245,245,245))
        '& tr[style*="background-color: rgb(245"]': {
          backgroundColor: `${alpha(theme.palette.info.main, 0.03)} !important`,
        },
        // Override any leftover monospace — force Open Sans everywhere
        '& *': {
          fontFamily: 'inherit !important',
        },

        '@media print': {
          transform: 'none !important',
          boxShadow: 'none',
          border: 'none',
          borderRadius: 0,
          m: 0,
          p: '10mm',
          pageBreakAfter: 'always',
        },
      }}
    >
      {children}
    </Paper>
    </Box>
  )
}

export default LiassePage
