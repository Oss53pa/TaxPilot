/**
 * Thème FiscaSync - Palette professionnelle pour applications fiscales
 */

import { createTheme } from '@mui/material/styles'

export const fiscasyncPalette = {
  // Couleurs principales de la palette FiscaSync
  primary: '#373B4D',        // Bleu foncé principal
  secondary: '#949597',      // Gris moyen
  background: '#ECECEF',     // Fond global clair
  surface: '#ECEDEF',        // Fond des cartes/sections
  accent: '#BDBFB7',         // Accent pour encadrés importants
  textPrimary: '#373B4D',    // Texte principal
  textSecondary: '#949597',  // Texte secondaire
  white: '#FFFFFF',          // Blanc pur
  light: '#ECECEF',          // Clair pour navigation active
}

export const fiscasyncTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: fiscasyncPalette.primary,
      light: fiscasyncPalette.secondary,
      dark: '#2A2E3A',
      contrastText: fiscasyncPalette.white,
    },
    secondary: {
      main: fiscasyncPalette.secondary,
      light: fiscasyncPalette.accent,
      dark: '#6A6C6E',
      contrastText: fiscasyncPalette.white,
    },
    background: {
      default: fiscasyncPalette.background,
      paper: fiscasyncPalette.surface,
    },
    text: {
      primary: fiscasyncPalette.textPrimary,
      secondary: fiscasyncPalette.textSecondary,
    },
    divider: fiscasyncPalette.accent,
    
    // Couleurs personnalisées FiscaSync
    grey: {
      50: '#FAFAFA',
      100: fiscasyncPalette.light,
      200: fiscasyncPalette.accent,
      300: fiscasyncPalette.secondary,
      400: '#7A7D7F',
      500: fiscasyncPalette.secondary,
      600: fiscasyncPalette.textSecondary,
      700: fiscasyncPalette.textPrimary,
      800: '#2A2E3A',
      900: '#1F2229',
    },
  },
  
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: fiscasyncPalette.textPrimary,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: fiscasyncPalette.textPrimary,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: fiscasyncPalette.textPrimary,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: fiscasyncPalette.textPrimary,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: fiscasyncPalette.textPrimary,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: fiscasyncPalette.textPrimary,
    },
    body1: {
      color: fiscasyncPalette.textPrimary,
    },
    body2: {
      color: fiscasyncPalette.textSecondary,
    },
    caption: {
      color: fiscasyncPalette.textSecondary,
    },
  },
  
  components: {
    // AppBar (Header)
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.primary,
          color: fiscasyncPalette.white,
          boxShadow: '0 2px 8px rgba(55, 59, 77, 0.15)',
        },
      },
    },
    
    // Drawer (Sidebar)
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: fiscasyncPalette.primary,
          color: fiscasyncPalette.light,
          borderRight: 'none',
          width: 260,
        },
      },
    },
    
    // Divider dans sidebar
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: fiscasyncPalette.secondary,
          opacity: 0.3,
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
          color: fiscasyncPalette.light,
          minHeight: '44px',
          '&:hover': {
            backgroundColor: fiscasyncPalette.secondary,
            color: fiscasyncPalette.white,
          },
          '&.Mui-selected': {
            backgroundColor: fiscasyncPalette.secondary,
            color: fiscasyncPalette.white,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#8A8C8E',
            },
          },
        },
      },
    },
    
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: fiscasyncPalette.white,
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
    
    // Cartes et Surfaces
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.surface,
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(55, 59, 77, 0.1)',
          border: `1px solid ${fiscasyncPalette.accent}20`,
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.surface,
          borderRadius: '8px',
        },
        elevation1: {
          boxShadow: '0 1px 6px rgba(55, 59, 77, 0.1)',
        },
      },
    },
    
    // Boutons
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: fiscasyncPalette.primary,
          color: fiscasyncPalette.white,
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(55, 59, 77, 0.2)',
          '&:hover': {
            backgroundColor: '#4A4F65',
            boxShadow: '0 4px 12px rgba(55, 59, 77, 0.3)',
          },
        },
        outlined: {
          borderColor: fiscasyncPalette.secondary,
          color: fiscasyncPalette.secondary,
          borderRadius: '8px',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: `${fiscasyncPalette.secondary}15`,
            borderColor: fiscasyncPalette.textPrimary,
            color: fiscasyncPalette.textPrimary,
          },
        },
        text: {
          color: fiscasyncPalette.textSecondary,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: `${fiscasyncPalette.accent}20`,
          },
        },
      },
    },
    
    // Tableaux
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.accent,
          '& .MuiTableCell-head': {
            color: fiscasyncPalette.textPrimary,
            fontWeight: 600,
            backgroundColor: fiscasyncPalette.accent,
          },
        },
      },
    },
    
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            '&:nth-of-type(odd)': {
              backgroundColor: fiscasyncPalette.light,
            },
            '&:nth-of-type(even)': {
              backgroundColor: fiscasyncPalette.surface,
            },
            '&:hover': {
              backgroundColor: `${fiscasyncPalette.accent}30`,
            },
          },
        },
      },
    },
    
    // Champs de formulaire
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: fiscasyncPalette.white,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: fiscasyncPalette.secondary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: fiscasyncPalette.primary,
            },
          },
          '& .MuiInputLabel-root': {
            color: fiscasyncPalette.textSecondary,
            '&.Mui-focused': {
              color: fiscasyncPalette.primary,
            },
          },
        },
      },
    },
    
    // Alertes et encadrés importants
    MuiAlert: {
      styleOverrides: {
        standardInfo: {
          backgroundColor: fiscasyncPalette.accent,
          color: fiscasyncPalette.textPrimary,
          '& .MuiAlert-icon': {
            color: fiscasyncPalette.primary,
          },
        },
        standardSuccess: {
          backgroundColor: '#E8F5E8',
          color: fiscasyncPalette.textPrimary,
          '& .MuiAlert-icon': {
            color: '#2E7D0F',
          },
        },
        standardWarning: {
          backgroundColor: '#FFF3CD',
          color: fiscasyncPalette.textPrimary,
          '& .MuiAlert-icon': {
            color: '#8A6914',
          },
        },
        standardError: {
          backgroundColor: '#F8D7DA',
          color: fiscasyncPalette.textPrimary,
          '& .MuiAlert-icon': {
            color: '#842029',
          },
        },
      },
    },
    
    // Chips/Tags
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          fontWeight: 500,
        },
        filled: {
          backgroundColor: fiscasyncPalette.accent,
          color: fiscasyncPalette.textPrimary,
        },
        outlined: {
          borderColor: fiscasyncPalette.secondary,
          color: fiscasyncPalette.textSecondary,
        },
      },
    },
    
    // Diviseurs - configuration combinée
    // MuiDivider déjà défini plus haut
    
    // Toolbar
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.primary,
          color: fiscasyncPalette.white,
          '& .MuiTypography-h6': {
            color: fiscasyncPalette.white,
          },
        },
      },
    },
  },
})

export default fiscasyncTheme