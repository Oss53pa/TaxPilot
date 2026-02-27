/**
 * Theme FiscaSync - Design System Grayscale Monochrome
 * Palette: #fafafa → #0a0a0a
 * Fonts: Exo 2 (sans), Grand Hotel (decoratif), JetBrains Mono (mono)
 */

import { createTheme, alpha } from '@mui/material/styles'

export const fiscasyncPalette = {
  // Grayscale
  white: '#ffffff',
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#e5e5e5',
  gray300: '#d4d4d4',
  gray400: '#a3a3a3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  gray950: '#0a0a0a',

  // Status colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Severity
  critical: '#7f1d1d',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280',
}

export const fiscasyncTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: fiscasyncPalette.gray900,
      light: fiscasyncPalette.gray600,
      dark: fiscasyncPalette.gray950,
      contrastText: fiscasyncPalette.white,
    },
    secondary: {
      main: fiscasyncPalette.gray500,
      light: fiscasyncPalette.gray300,
      dark: fiscasyncPalette.gray700,
      contrastText: fiscasyncPalette.white,
    },
    background: {
      default: fiscasyncPalette.gray50,
      paper: fiscasyncPalette.white,
    },
    text: {
      primary: fiscasyncPalette.gray900,
      secondary: fiscasyncPalette.gray500,
    },
    divider: alpha(fiscasyncPalette.gray900, 0.08),
    success: {
      main: fiscasyncPalette.success,
      light: '#4ade80',
      dark: '#15803d',
      contrastText: fiscasyncPalette.white,
    },
    warning: {
      main: fiscasyncPalette.warning,
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: fiscasyncPalette.white,
    },
    error: {
      main: fiscasyncPalette.error,
      light: '#f87171',
      dark: '#dc2626',
      contrastText: fiscasyncPalette.white,
    },
    info: {
      main: fiscasyncPalette.info,
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: fiscasyncPalette.white,
    },
    grey: {
      50: fiscasyncPalette.gray50,
      100: fiscasyncPalette.gray100,
      200: fiscasyncPalette.gray200,
      300: fiscasyncPalette.gray300,
      400: fiscasyncPalette.gray400,
      500: fiscasyncPalette.gray500,
      600: fiscasyncPalette.gray600,
      700: fiscasyncPalette.gray700,
      800: fiscasyncPalette.gray800,
      900: fiscasyncPalette.gray900,
    },
  },

  typography: {
    fontFamily: [
      '"Exo 2"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),

    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: fiscasyncPalette.gray900,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: fiscasyncPalette.gray900,
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: fiscasyncPalette.gray900,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: fiscasyncPalette.gray900,
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: fiscasyncPalette.gray800,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: fiscasyncPalette.gray800,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: fiscasyncPalette.gray900,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: fiscasyncPalette.gray500,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      color: fiscasyncPalette.gray400,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none' as const,
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    // AppBar (Header)
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.gray900,
          color: fiscasyncPalette.white,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          backgroundImage: 'none',
        },
      },
    },

    // Toolbar
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.gray900,
          color: fiscasyncPalette.white,
          '& .MuiTypography-h6': {
            color: fiscasyncPalette.white,
          },
        },
      },
    },

    // Drawer (Sidebar)
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: fiscasyncPalette.gray900,
          color: fiscasyncPalette.gray200,
          borderRight: 'none',
          width: 260,
        },
      },
    },

    // Divider
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(fiscasyncPalette.gray900, 0.08),
          margin: '8px 0',
        },
      },
    },

    // Navigation
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '2px 8px',
          color: fiscasyncPalette.gray300,
          minHeight: '44px',
          transition: 'all 200ms ease',
          '&:hover': {
            backgroundColor: alpha(fiscasyncPalette.white, 0.08),
            color: fiscasyncPalette.white,
          },
          '&.Mui-selected': {
            backgroundColor: alpha(fiscasyncPalette.white, 0.12),
            color: fiscasyncPalette.white,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: alpha(fiscasyncPalette.white, 0.16),
            },
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: fiscasyncPalette.gray400,
          minWidth: '36px',
          '& .MuiSvgIcon-root': {
            fontSize: '1.25rem',
          },
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

    // Cards
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.white,
          borderRadius: '16px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${fiscasyncPalette.gray200}`,
          transition: 'all 200ms ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
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
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        },
      },
    },

    // Buttons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none' as const,
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 200ms ease',
        },
        containedPrimary: {
          backgroundColor: fiscasyncPalette.gray900,
          color: '#ffffff !important',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            backgroundColor: fiscasyncPalette.gray800,
            color: '#ffffff !important',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
          },
        },
        containedSecondary: {
          color: '#ffffff !important',
          '&:hover': {
            color: '#ffffff !important',
          },
        },
        outlined: {
          borderColor: fiscasyncPalette.gray300,
          color: fiscasyncPalette.gray700,
          '&:hover': {
            backgroundColor: fiscasyncPalette.gray50,
            borderColor: fiscasyncPalette.gray400,
            color: fiscasyncPalette.gray900,
          },
        },
        text: {
          color: fiscasyncPalette.gray600,
          '&:hover': {
            backgroundColor: fiscasyncPalette.gray100,
          },
        },
      },
    },

    // Tables
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.gray100,
          '& .MuiTableCell-head': {
            color: fiscasyncPalette.gray700,
            fontWeight: 600,
            backgroundColor: fiscasyncPalette.gray100,
            fontSize: '0.875rem',
          },
        },
      },
    },

    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            '&:nth-of-type(odd)': {
              backgroundColor: fiscasyncPalette.white,
            },
            '&:nth-of-type(even)': {
              backgroundColor: fiscasyncPalette.gray50,
            },
            '&:hover': {
              backgroundColor: fiscasyncPalette.gray100,
            },
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        body: {
          fontSize: '0.875rem',
        },
      },
    },

    // Text Fields
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: fiscasyncPalette.white,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: fiscasyncPalette.gray400,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: fiscasyncPalette.gray900,
            },
          },
          '& .MuiInputLabel-root': {
            color: fiscasyncPalette.gray500,
            '&.Mui-focused': {
              color: fiscasyncPalette.gray900,
            },
          },
        },
      },
    },

    // Alerts
    MuiAlert: {
      styleOverrides: {
        standardInfo: {
          backgroundColor: alpha(fiscasyncPalette.info, 0.08),
          color: fiscasyncPalette.gray900,
          '& .MuiAlert-icon': {
            color: fiscasyncPalette.info,
          },
        },
        standardSuccess: {
          backgroundColor: alpha(fiscasyncPalette.success, 0.08),
          color: fiscasyncPalette.gray900,
          '& .MuiAlert-icon': {
            color: fiscasyncPalette.success,
          },
        },
        standardWarning: {
          backgroundColor: alpha(fiscasyncPalette.warning, 0.08),
          color: fiscasyncPalette.gray900,
          '& .MuiAlert-icon': {
            color: fiscasyncPalette.warning,
          },
        },
        standardError: {
          backgroundColor: alpha(fiscasyncPalette.error, 0.08),
          color: fiscasyncPalette.gray900,
          '& .MuiAlert-icon': {
            color: fiscasyncPalette.error,
          },
        },
      },
    },

    // Chips
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          fontWeight: 500,
        },
        filled: {
          backgroundColor: fiscasyncPalette.gray100,
          color: fiscasyncPalette.gray700,
        },
        outlined: {
          borderColor: fiscasyncPalette.gray300,
          color: fiscasyncPalette.gray600,
        },
      },
    },

    MuiBox: {
      styleOverrides: {
        root: {},
      },
    },
  },
})

export default fiscasyncTheme
