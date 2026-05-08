/**
 * Thème Liass'Pilot — Premium UI tokens "Nordic Slate"
 *
 * Design philosophy :
 *  - Neutres warm-stone (Tailwind's "stone" scale) — non bleus, organiques
 *  - Accent teal #0f766e (deep teal) — moderne, fintech, distinct du gold
 *  - Police Dosis (humanist sans-serif élégant)
 *  - 4-layer shadow system pour hiérarchie visuelle
 *  - Border-radius unifié 8/12/16
 *  - Micro-interactions 180ms ease-out
 *
 * Inspiration : Linear · Vercel · Notion · Stripe
 */

import { createTheme } from '@mui/material/styles'

export const fiscasyncPalette = {
  // Neutres "stone" warm — légère teinte chaude (~3-5° vers cream)
  primary50:  '#fafaf9',  // Fond de page secondary, cards alternées
  primary100: '#f5f5f4',  // Fond de cartes hover, surfaces lifted
  primary200: '#e7e5e4',  // Bordures par défaut
  primary300: '#d6d3d1',  // Bordures actives, dividers visibles
  primary400: '#a8a29e',  // Placeholder, icons inactifs
  primary500: '#78716c',  // Texte secondaire
  primary600: '#57534e',  // Labels, sub-headings
  primary700: '#44403c',  // Boutons ghost, navigation inactive
  primary800: '#292524',  // Hover boutons sombres
  primary900: '#1c1917',  // Texte principal (charcoal warm)
  primary950: '#0c0a09',  // États actifs (charcoal deep)

  // Accent "Teal" — deep teal moderne
  tealLight:  '#5eead4',  // Hover glow, accent doux
  teal:       '#0f766e',  // Accent primaire
  tealDark:   '#115e59',  // Pressed, deep accent
  tealBg:     '#f0fdfa',  // Background tint accent (très doux)
  tealBgStrong: '#ccfbf1',  // Background tint plus saturé (chips, badges)
  tealBorder: '#99f6e4',  // Bordure accent (cards highlighted)

  // Aliases legacy "gold" pour ne pas casser le code existant
  // qui référence goldX → maintenant teal
  goldLight:  '#5eead4',
  gold:       '#0f766e',
  goldDark:   '#115e59',
  goldMuted:  '#14b8a6',

  // Statuts (palette refinée, plus saturée)
  success:     '#15803d',
  successBg:   '#dcfce7',
  successText: '#14532d',
  warning:     '#b45309',
  warningBg:   '#fef3c7',
  warningText: '#78350f',
  error:       '#b91c1c',
  errorBg:     '#fee2e2',
  errorText:   '#7f1d1d',
  info:        '#0369a1',  // Sky deep (cohérence avec teal accent)
  infoBg:      '#e0f2fe',
  infoText:    '#0c4a6e',

  // Sévérité audit (légèrement adaptée au warm theme)
  low:      '#78716c',
  medium:   '#b45309',
  high:     '#b91c1c',
  critical: '#7f1d1d',

  // Aliases
  white: '#ffffff',
  black: '#000000',
}

// ── Premium 4-layer shadow system ──
export const shadows = {
  /** Hover subtil sur une carte au repos */
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  /** Card par défaut */
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
  /** Card hover, popover */
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
  /** Modal, drawer */
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
  /** Highlights premium — accent teal */
  tealGlow: '0 0 0 3px rgba(15, 118, 110, 0.15)',
  /** Focus ring neutre */
  focusRing: '0 0 0 3px rgba(28, 25, 23, 0.08)',
  /** Backwards compat */
  goldGlow: '0 0 0 3px rgba(15, 118, 110, 0.15)',
}

// ── Transitions premium ──
export const transitions = {
  fast:   '120ms cubic-bezier(0.4, 0, 0.2, 1)',
  base:   '180ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow:   '300ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// ── Police premium (Dosis : humanist sans-serif élégant, légèrement étendu) ──
const FONT_PRIMARY = '"Dosis", "Inter", "Exo 2", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const FONT_DISPLAY = '"Dosis", "Inter", "Exo 2", -apple-system, BlinkMacSystemFont, sans-serif'
const FONT_MONO    = '"JetBrains Mono", "SF Mono", Consolas, monospace'

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
      main: fiscasyncPalette.teal,        // Teal accent (Nordic Slate)
      light: fiscasyncPalette.tealLight,
      dark: fiscasyncPalette.tealDark,
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
    fontFamily: FONT_PRIMARY,
    // Hiérarchie premium adaptée à Dosis (humanist, métrique légèrement étendue)
    // → letter-spacing 0 ou très léger, weights 500/600/700 pour bonne lisibilité
    h1: {
      fontFamily: FONT_DISPLAY, fontSize: '2.5rem', fontWeight: 700,
      letterSpacing: '-0.01em', lineHeight: 1.15, color: fiscasyncPalette.primary900,
    },
    h2: {
      fontFamily: FONT_DISPLAY, fontSize: '2rem', fontWeight: 700,
      letterSpacing: '-0.008em', lineHeight: 1.2, color: fiscasyncPalette.primary900,
    },
    h3: {
      fontFamily: FONT_DISPLAY, fontSize: '1.5rem', fontWeight: 600,
      letterSpacing: '-0.005em', lineHeight: 1.3, color: fiscasyncPalette.primary900,
    },
    h4: {
      fontFamily: FONT_DISPLAY, fontSize: '1.25rem', fontWeight: 600,
      letterSpacing: 0, lineHeight: 1.35, color: fiscasyncPalette.primary900,
    },
    h5: {
      fontFamily: FONT_DISPLAY, fontSize: '1.075rem', fontWeight: 600,
      letterSpacing: 0, lineHeight: 1.4, color: fiscasyncPalette.primary900,
    },
    h6: {
      fontFamily: FONT_DISPLAY, fontSize: '0.95rem', fontWeight: 600,
      letterSpacing: '0.005em', lineHeight: 1.45, color: fiscasyncPalette.primary900,
    },
    subtitle1: { fontWeight: 500, lineHeight: 1.5, color: fiscasyncPalette.primary900 },
    subtitle2: { fontWeight: 500, lineHeight: 1.5, color: fiscasyncPalette.primary600, fontSize: '0.875rem' },
    // Dosis 400 peut sembler léger : on monte le poids body à 400 mais avec leading généreux
    body1: { fontWeight: 400, lineHeight: 1.65, color: fiscasyncPalette.primary900, letterSpacing: '0.005em' },
    body2: { fontWeight: 400, lineHeight: 1.65, color: fiscasyncPalette.primary500, fontSize: '0.875rem', letterSpacing: '0.005em' },
    button: { textTransform: 'none' as const, fontWeight: 500, letterSpacing: '0.015em' },
    caption: { color: fiscasyncPalette.primary500, fontSize: '0.78rem', letterSpacing: '0.015em' },
    overline: { textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontWeight: 600, fontSize: '0.7rem' },
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

    // ── Cards (premium 4-layer shadow + lift on hover) ──
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.white,
          borderRadius: '14px',
          boxShadow: shadows.sm,
          border: `1px solid ${fiscasyncPalette.primary200}`,
          transition: `box-shadow ${transitions.base}, transform ${transitions.base}, border-color ${transitions.base}`,
          '&:hover': {
            boxShadow: shadows.md,
            borderColor: fiscasyncPalette.primary300,
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.white,
          borderRadius: '12px',
          backgroundImage: 'none', // évite le filtre MUI sur dark mode
        },
        elevation1: { boxShadow: shadows.xs },
        elevation2: { boxShadow: shadows.sm },
        elevation3: { boxShadow: shadows.md },
        elevation4: { boxShadow: shadows.lg },
      },
    },

    // ── Buttons (premium : transitions, focus ring, lift) ──
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: '10px',
          textTransform: 'none' as const,
          fontWeight: 500,
          letterSpacing: '0.01em',
          transition: `background-color ${transitions.base}, color ${transitions.base}, box-shadow ${transitions.base}, transform ${transitions.fast}, border-color ${transitions.base}`,
          '&:active': { transform: 'translateY(0.5px)' },
          '&:focus-visible': { boxShadow: shadows.focusRing },
        },
        sizeSmall: { padding: '5px 12px', fontSize: '0.82rem' },
        sizeMedium: { padding: '7px 16px', fontSize: '0.875rem' },
        sizeLarge: { padding: '10px 22px', fontSize: '0.95rem' },
        containedPrimary: {
          backgroundColor: fiscasyncPalette.primary900,
          color: `${fiscasyncPalette.white} !important`,
          boxShadow: shadows.xs,
          '&:hover': {
            backgroundColor: fiscasyncPalette.primary800,
            color: `${fiscasyncPalette.white} !important`,
            boxShadow: shadows.sm,
          },
        },
        containedSecondary: {
          color: `${fiscasyncPalette.white} !important`,
          '&:hover': { color: `${fiscasyncPalette.white} !important` },
        },
        outlined: {
          borderColor: fiscasyncPalette.primary200,
          color: fiscasyncPalette.primary700,
          '&:hover': {
            backgroundColor: fiscasyncPalette.primary50,
            borderColor: fiscasyncPalette.primary400,
            color: fiscasyncPalette.primary900,
          },
        },
        text: {
          color: fiscasyncPalette.primary600,
          '&:hover': {
            backgroundColor: fiscasyncPalette.primary100,
            color: fiscasyncPalette.primary900,
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
          '& .MuiTableRow-root:not(.total-row)': {
            '&:nth-of-type(odd)': { backgroundColor: fiscasyncPalette.primary50 },
            '&:nth-of-type(even)': { backgroundColor: fiscasyncPalette.white },
            '&:hover': { backgroundColor: fiscasyncPalette.primary100 },
          },
        },
      },
    },

    // ── TextField (premium : focus ring + transitions douces) ──
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: fiscasyncPalette.white,
            transition: `border-color ${transitions.base}, box-shadow ${transitions.base}`,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: fiscasyncPalette.primary200,
              transition: `border-color ${transitions.base}`,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: fiscasyncPalette.primary400,
            },
            '&.Mui-focused': {
              boxShadow: shadows.tealGlow,  // Focus ring teal (Nordic Slate accent)
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: fiscasyncPalette.teal,
                borderWidth: '1px',
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: fiscasyncPalette.primary500,
            fontSize: '0.92rem',
            '&.Mui-focused': { color: fiscasyncPalette.primary900 },
          },
        },
      },
    },

    // ── Alerts ──
    // Use root with nested selectors for higher specificity than MuiPaper.root
    MuiAlert: {
      styleOverrides: {
        root: {
          '&.MuiAlert-standardSuccess': {
            backgroundColor: fiscasyncPalette.successBg,
            color: fiscasyncPalette.successText,
            '& .MuiAlert-icon': { color: fiscasyncPalette.success },
          },
          '&.MuiAlert-standardWarning': {
            backgroundColor: fiscasyncPalette.warningBg,
            color: fiscasyncPalette.warningText,
            '& .MuiAlert-icon': { color: fiscasyncPalette.warning },
          },
          '&.MuiAlert-standardError': {
            backgroundColor: fiscasyncPalette.errorBg,
            color: fiscasyncPalette.errorText,
            '& .MuiAlert-icon': { color: fiscasyncPalette.error },
          },
          '&.MuiAlert-standardInfo': {
            backgroundColor: fiscasyncPalette.infoBg,
            color: fiscasyncPalette.infoText,
            '& .MuiAlert-icon': { color: fiscasyncPalette.info },
          },
          '&.MuiAlert-filledSuccess': {
            backgroundColor: fiscasyncPalette.success,
            color: '#ffffff',
          },
          '&.MuiAlert-filledWarning': {
            backgroundColor: fiscasyncPalette.warning,
            color: '#ffffff',
          },
          '&.MuiAlert-filledError': {
            backgroundColor: fiscasyncPalette.error,
            color: '#ffffff',
          },
          '&.MuiAlert-filledInfo': {
            backgroundColor: fiscasyncPalette.info,
            color: '#ffffff',
          },
        },
      },
    },

    // ── Snackbar ──
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: fiscasyncPalette.primary900,
          color: fiscasyncPalette.white,
        },
      },
    },

    // ── Chips (premium : taille raffinée, hover doux) ──
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          fontSize: '0.78rem',
          letterSpacing: '0.005em',
          transition: `background-color ${transitions.base}, border-color ${transitions.base}, color ${transitions.base}`,
          height: 24,
        },
        filled: {
          backgroundColor: fiscasyncPalette.primary200,
          color: fiscasyncPalette.primary900,
          '&.MuiChip-colorPrimary': {
            backgroundColor: fiscasyncPalette.primary900,
            color: fiscasyncPalette.white,
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: fiscasyncPalette.success,
            color: fiscasyncPalette.white,
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: fiscasyncPalette.warning,
            color: fiscasyncPalette.white,
          },
          '&.MuiChip-colorError': {
            backgroundColor: fiscasyncPalette.error,
            color: fiscasyncPalette.white,
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: fiscasyncPalette.info,
            color: fiscasyncPalette.white,
          },
        },
        outlined: {
          borderColor: fiscasyncPalette.primary400,
          color: fiscasyncPalette.primary900,
          '&.MuiChip-colorPrimary': {
            borderColor: fiscasyncPalette.primary900,
            color: fiscasyncPalette.primary900,
          },
          '&.MuiChip-colorSuccess': {
            borderColor: fiscasyncPalette.success,
            color: fiscasyncPalette.success,
          },
          '&.MuiChip-colorWarning': {
            borderColor: fiscasyncPalette.warning,
            color: '#92400e',
          },
          '&.MuiChip-colorError': {
            borderColor: fiscasyncPalette.error,
            color: fiscasyncPalette.error,
          },
          '&.MuiChip-colorInfo': {
            borderColor: fiscasyncPalette.info,
            color: fiscasyncPalette.info,
          },
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

    // ── IconButton (premium hover ring) ──
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          transition: `background-color ${transitions.base}, color ${transitions.base}`,
          '&:focus-visible': { boxShadow: shadows.focusRing },
        },
      },
    },

    // ── Tooltip (premium typo) ──
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: fiscasyncPalette.primary900,
          color: fiscasyncPalette.white,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '6px 10px',
          borderRadius: '6px',
          boxShadow: shadows.md,
        },
        arrow: { color: fiscasyncPalette.primary900 },
      },
    },

    // ── Switch (premium track) ──
    MuiSwitch: {
      styleOverrides: {
        track: {
          borderRadius: 11,
          opacity: 1,
          backgroundColor: fiscasyncPalette.primary300,
        },
        thumb: { boxShadow: shadows.sm },
      },
    },

    // ── LinearProgress (premium thin) ──
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 4,
          borderRadius: 2,
          backgroundColor: fiscasyncPalette.primary100,
        },
        bar: { borderRadius: 2 },
      },
    },

    // ── Tabs (premium underline) ──
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 2,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          backgroundColor: fiscasyncPalette.primary900,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          fontSize: '0.875rem',
          letterSpacing: '0.005em',
          minHeight: 42,
          color: fiscasyncPalette.primary500,
          transition: `color ${transitions.base}`,
          '&.Mui-selected': { color: fiscasyncPalette.primary900, fontWeight: 600 },
          '&:hover:not(.Mui-selected)': { color: fiscasyncPalette.primary700 },
        },
      },
    },

    // ── Dialog (premium spacing) ──
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          boxShadow: shadows.lg,
        },
      },
    },

    // ── Menu (premium dropdown) ──
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: '10px',
          boxShadow: shadows.md,
          border: `1px solid ${fiscasyncPalette.primary200}`,
          marginTop: 4,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '0 4px',
          fontSize: '0.875rem',
          minHeight: 36,
          transition: `background-color ${transitions.fast}`,
        },
      },
    },
  },
})

export default fiscasyncTheme

export const fiscasyncDarkPalette = {
  primary50: '#1a1a1a',
  primary100: '#262626',
  primary200: '#333333',
  primary300: '#404040',
  primary400: '#666666',
  primary500: '#999999',
  primary600: '#b3b3b3',
  primary700: '#cccccc',
  primary800: '#e5e5e5',
  primary900: '#f0f0f0',
  primary950: '#fafafa',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}

export function createFiscaSyncTheme(mode: 'light' | 'dark') {
  const palette = mode === 'dark' ? fiscasyncDarkPalette : fiscasyncPalette

  return createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#e5e5e5' : '#171717' },
      secondary: { main: mode === 'dark' ? '#999999' : '#737373' },
      background: {
        default: mode === 'dark' ? '#0a0a0a' : '#fafafa',
        paper: mode === 'dark' ? '#171717' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f0f0f0' : '#171717',
        secondary: mode === 'dark' ? '#999999' : '#737373',
      },
      error: { main: palette.error },
      warning: { main: palette.warning },
      success: { main: palette.success },
      info: { main: palette.info },
      divider: mode === 'dark' ? '#333333' : '#e5e5e5',
    },
    typography: {
      fontFamily: '"Exo 2", "Poppins", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: mode === 'dark' ? '#171717' : '#ffffff',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${mode === 'dark' ? '#333333' : '#e5e5e5'}`,
            backgroundColor: mode === 'dark' ? '#171717' : '#ffffff',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            backgroundColor: mode === 'dark' ? '#e5e5e5' : '#171717',
            color: mode === 'dark' ? '#0a0a0a' : '#ffffff',
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#cccccc' : '#333333',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#0a0a0a' : '#ffffff',
            borderRight: `1px solid ${mode === 'dark' ? '#262626' : '#e5e5e5'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#0a0a0a' : '#ffffff',
            color: mode === 'dark' ? '#f0f0f0' : '#171717',
          },
        },
      },
    },
  })
}
