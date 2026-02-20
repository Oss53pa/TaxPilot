/**
 * Thème TaxPilot - Palette Grayscale professionnelle monochrome
 */

import { createTheme } from '@mui/material/styles'

export const fiscasyncPalette = {
  // Grayscale
  primary50:  '#fafafa',  // Fond de page
  primary100: '#f5f5f5',  // Fond de cartes
  primary200: '#e5e5e5',  // Bordures
  primary300: '#d4d4d4',  // Bordures subtiles
  primary400: '#a3a3a3',  // Placeholder
  primary500: '#737373',  // Texte secondaire
  primary600: '#525252',  // Labels
  primary700: '#404040',  // Boutons ghost
  primary800: '#262626',  // Hover boutons
  primary900: '#171717',  // Texte principal
  primary950: '#0a0a0a',  // États actifs

  // Statuts
  success: '#22c55e',
  warning: '#f59e0b',
  error:   '#ef4444',
  info:    '#3b82f6',

  // Sévérité
  low:      '#6b7280',
  medium:   '#f59e0b',
  high:     '#ef4444',
  critical: '#7f1d1d',

  // Aliases
  white: '#ffffff',
}

export const fiscasyncTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: fiscasyncPalette.primary900,
      light: fiscasyncPalette.primary500,
      dark: fiscasyncPalette.primary950,
      contrastText: fiscasyncPalette.white,
    },
    secondary: {
      main: fiscasyncPalette.primary500,
      light: fiscasyncPalette.primary300,
      dark: fiscasyncPalette.primary700,
      contrastText: fiscasyncPalette.white,
    },
    background: {
      default: fiscasyncPalette.primary50,
      paper: fiscasyncPalette.white,
    },
    text: {
      primary: fiscasyncPalette.primary900,
      secondary: fiscasyncPalette.primary500,
    },
    divider: fiscasyncPalette.primary200,
    success: { main: fiscasyncPalette.success },
    warning: { main: fiscasyncPalette.warning },
    error:   { main: fiscasyncPalette.error },
    info:    { main: fiscasyncPalette.info },
    grey: {
      50:  fiscasyncPalette.primary50,
      100: fiscasyncPalette.primary100,
      200: fiscasyncPalette.primary200,
      300: fiscasyncPalette.primary300,
      400: fiscasyncPalette.primary400,
      500: fiscasyncPalette.primary500,
      600: fiscasyncPalette.primary600,
      700: fiscasyncPalette.primary700,
      800: fiscasyncPalette.primary800,
      900: fiscasyncPalette.primary900,
    },
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: [
      '"Exo 2"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),

    h1: { fontSize: '2.5rem', fontWeight: 700, color: fiscasyncPalette.primary900 },
    h2: { fontSize: '2rem',   fontWeight: 700, color: fiscasyncPalette.primary900 },
    h3: { fontSize: '1.5rem', fontWeight: 600, color: fiscasyncPalette.primary900 },
    h4: { fontSize: '1.25rem', fontWeight: 600, color: fiscasyncPalette.primary900 },
    h5: { fontSize: '1.125rem', fontWeight: 600, color: fiscasyncPalette.primary900 },
    h6: { fontSize: '1rem',    fontWeight: 600, color: fiscasyncPalette.primary900 },
    body1: { color: fiscasyncPalette.primary900 },
    body2: { color: fiscasyncPalette.primary500 },
    caption: { color: fiscasyncPalette.primary500 },
  },

  components: {
    // ── AppBar ──
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.primary900,
          color: fiscasyncPalette.white,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },

    // ── Drawer (Sidebar) ──
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: fiscasyncPalette.primary900,
          color: fiscasyncPalette.primary200,
          borderRight: 'none',
        },
      },
    },

    // ── Divider ──
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: fiscasyncPalette.primary200,
          opacity: 0.6,
        },
      },
    },

    // ── Navigation ──
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          margin: '2px 8px',
          color: fiscasyncPalette.primary300,
          minHeight: '44px',
          '&:hover': {
            backgroundColor: fiscasyncPalette.primary800,
            color: fiscasyncPalette.white,
          },
          '&.Mui-selected': {
            backgroundColor: fiscasyncPalette.primary700,
            color: fiscasyncPalette.white,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: fiscasyncPalette.primary600,
            },
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: fiscasyncPalette.primary400,
          minWidth: '36px',
          '& .MuiSvgIcon-root': { fontSize: '1.25rem' },
        },
      },
    },

    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      },
    },

    // ── Cards ──
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.white,
          borderRadius: '16px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          border: `1px solid ${fiscasyncPalette.primary200}`,
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.white,
          borderRadius: '12px',
        },
        elevation1: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },

    // ── Buttons ──
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none' as const,
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: fiscasyncPalette.primary900,
          color: `${fiscasyncPalette.white} !important`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          '&:hover': {
            backgroundColor: fiscasyncPalette.primary800,
            color: `${fiscasyncPalette.white} !important`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        },
        containedSecondary: {
          color: `${fiscasyncPalette.white} !important`,
          '&:hover': {
            color: `${fiscasyncPalette.white} !important`,
          },
        },
        outlined: {
          borderColor: fiscasyncPalette.primary200,
          color: fiscasyncPalette.primary600,
          '&:hover': {
            backgroundColor: fiscasyncPalette.primary50,
            borderColor: fiscasyncPalette.primary400,
            color: fiscasyncPalette.primary900,
          },
        },
        text: {
          color: fiscasyncPalette.primary500,
          '&:hover': {
            backgroundColor: fiscasyncPalette.primary100,
          },
        },
      },
    },

    // ── Tables ──
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
          },
        },
      },
    },

    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            '&:nth-of-type(odd)': { backgroundColor: fiscasyncPalette.primary50 },
            '&:nth-of-type(even)': { backgroundColor: fiscasyncPalette.white },
            '&:hover': { backgroundColor: fiscasyncPalette.primary100 },
          },
        },
      },
    },

    // ── TextField ──
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: fiscasyncPalette.white,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: fiscasyncPalette.primary400,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: fiscasyncPalette.primary900,
              boxShadow: '0 0 0 3px rgba(23,23,23,0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: fiscasyncPalette.primary500,
            '&.Mui-focused': { color: fiscasyncPalette.primary900 },
          },
        },
      },
    },

    // ── Alerts ──
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: '#f0fdf4',
          color: '#166534',
          '& .MuiAlert-icon': { color: fiscasyncPalette.success },
        },
        standardWarning: {
          backgroundColor: '#fffbeb',
          color: '#92400e',
          '& .MuiAlert-icon': { color: fiscasyncPalette.warning },
        },
        standardError: {
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          '& .MuiAlert-icon': { color: fiscasyncPalette.error },
        },
        standardInfo: {
          backgroundColor: '#eff6ff',
          color: '#1e40af',
          '& .MuiAlert-icon': { color: fiscasyncPalette.info },
        },
      },
    },

    // ── Chips ──
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          fontWeight: 500,
        },
        filled: {
          backgroundColor: fiscasyncPalette.primary100,
          color: fiscasyncPalette.primary700,
        },
        outlined: {
          borderColor: fiscasyncPalette.primary200,
          color: fiscasyncPalette.primary600,
        },
      },
    },

    // ── Toolbar ──
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.primary900,
          color: fiscasyncPalette.white,
          '& .MuiTypography-h6': { color: fiscasyncPalette.white },
        },
      },
    },
  },
})

export default fiscasyncTheme
