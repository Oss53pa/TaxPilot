/**
 * Design System TaxPilot - Standards Professionnels Internationaux
 * Inspiré des meilleures pratiques de design systems modernes (Material 3, Ant Design, Chakra UI)
 */

import { createTheme, alpha } from '@mui/material/styles'

// === PALETTE DE COULEURS PROFESSIONNELLE ===
const colors = {
  // Primary - Couleur principale sophistiquée
  primary: {
    50: '#fafafa',
    100: '#f1f3f4',
    200: '#e8eaed',
    300: '#dadce0',
    400: '#bdc1c6',
    500: '#9aa0a6',
    600: '#80868b',
    700: '#5f6368',
    800: '#3c4043',
    900: '#171717', // Votre couleur de base
    main: '#171717',
    light: '#5f6368',
    dark: '#000000',
  },

  // Secondary - Accent moderne
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    main: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0369a1',
  },

  // Success - Vert professionnel
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    main: '#22c55e',
    light: '#4ade80',
    dark: '#15803d',
  },

  // Warning - Orange élégant
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    main: '#f97316',
    light: '#fb923c',
    dark: '#c2410c',
  },

  // Error - Rouge moderne
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    main: '#ef4444',
    light: '#f87171',
    dark: '#b91c1c',
  },

  // Info - Bleu information
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#1d4ed8',
  },

  // Neutrals - Palette de gris sophistiquée
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Backgrounds & Surfaces
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    elevated: '#ffffff',
    glass: alpha('#ffffff', 0.8),
    overlay: alpha('#000000', 0.6),
  },

  // Text colors optimized for readability
  text: {
    primary: '#171717',
    secondary: '#525252',
    disabled: '#a3a3a3',
    hint: '#737373',
    inverse: '#ffffff',
  },

  // Dividers and borders
  divider: alpha('#171717', 0.08),
  border: {
    light: alpha('#171717', 0.08),
    medium: alpha('#171717', 0.12),
    strong: alpha('#171717', 0.16),
  },
}

// === TYPOGRAPHY PROFESSIONNELLE ===
const typography = {
  // Font families optimized for business applications
  fontFamily: {
    primary: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    secondary: '"Poppins", "Inter", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
  },

  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Font sizes with perfect scaling
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },

  // Line heights for optimal readability
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
}

// === SPACING SYSTEM ===
const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
}

// === SHADOWS PROFESSIONNELLES ===
const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
}

// === BORDER RADIUS ===
const borderRadius = {
  none: '0px',
  sm: '0.25rem',  // 4px
  base: '0.375rem', // 6px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',  // 32px
  full: '9999px',
}

// === TRANSITIONS & ANIMATIONS ===
const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  }
}

// === BREAKPOINTS RESPONSIFS ===
const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// === THÈME MATERIAL UI CONFIGURÉ ===
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
    background: colors.background,
    text: colors.text,
    divider: colors.divider,
  },

  typography: {
    fontFamily: typography.fontFamily.primary,
    h1: {
      fontSize: typography.fontSize['5xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
    },
    h4: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
    },
    h5: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
    },
    h6: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
    },
    body1: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.relaxed,
      color: colors.text.primary,
    },
    body2: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.secondary,
    },
    caption: {
      fontSize: typography.fontSize.xs,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.disabled,
    },
  },

  shape: {
    borderRadius: parseInt(borderRadius.md),
  },

  spacing: 8, // Base spacing unit

  shadows: [
    "none",
    shadows.sm,
    shadows.base,
    shadows.md,
    shadows.lg,
    shadows.xl,
    shadows['2xl'],
    shadows.glass,
    ...Array(16).fill(shadows.lg), // Remplir le reste
  ] as any,

  breakpoints: {
    values: {
      xs: parseInt(breakpoints.xs),
      sm: parseInt(breakpoints.sm),
      md: parseInt(breakpoints.md),
      lg: parseInt(breakpoints.lg),
      xl: parseInt(breakpoints.xl),
    },
  },

  components: {
    // Configuration globale des composants
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          fontSize: '16px',
          lineHeight: 1.5,
        },
        body: {
          backgroundColor: colors.background.default,
          color: colors.text.primary,
          fontFamily: typography.fontFamily.primary,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: typography.fontWeight.medium,
          borderRadius: borderRadius.md,
          transition: `all ${transitions.duration.base} ${transitions.timing.ease}`,
          boxShadow: shadows.sm,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: shadows.md,
          },
        },
        contained: {
          '&:hover': {
            boxShadow: shadows.lg,
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          boxShadow: shadows.base,
          border: `1px solid ${colors.border.light}`,
          transition: `all ${transitions.duration.base} ${transitions.timing.ease}`,
          '&:hover': {
            boxShadow: shadows.md,
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.md,
            transition: `all ${transitions.duration.base} ${transitions.timing.ease}`,
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary[400],
              },
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(colors.primary.main, 0.1)}`,
            },
          },
        },
      },
    },
  },
})

// Export des tokens de design
export const designTokens = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  breakpoints,
}

export default theme