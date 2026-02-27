/**
 * Palettes de couleurs pour FiscaSync - Grayscale Monochrome
 */

export interface ColorPalette {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    background: {
      default: string
      paper: string
    }
    text: {
      primary: string
      secondary: string
    }
    success: string
    warning: string
    error: string
    info: string
  }
}

export const colorPalettes: ColorPalette[] = [
  {
    id: 'grayscale-mono',
    name: 'Grayscale Monochrome',
    description: 'Design system monochrome professionnel - #fafafa a #0a0a0a',
    colors: {
      primary: '#171717',
      secondary: '#737373',
      background: {
        default: '#fafafa',
        paper: '#ffffff',
      },
      text: {
        primary: '#171717',
        secondary: '#525252',
      },
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    }
  },
]

export const defaultPaletteId = 'grayscale-mono'

export const getPaletteById = (id: string): ColorPalette => {
  return colorPalettes.find(p => p.id === id) || colorPalettes[0]
}

export const createThemeFromPalette = (palette: ColorPalette, mode: 'light' | 'dark' = 'light') => {
  if (mode === 'dark') {
    return {
      palette: {
        mode,
        primary: {
          main: '#e5e5e5',
          light: '#f5f5f5',
          dark: '#d4d4d4',
          contrastText: '#171717',
        },
        secondary: {
          main: '#a3a3a3',
          light: '#d4d4d4',
          dark: '#737373',
          contrastText: '#171717',
        },
        background: {
          default: '#171717',
          paper: '#262626',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a3a3a3',
        },
        success: {
          main: palette.colors.success,
          light: '#4ade80',
          dark: '#15803d',
        },
        warning: {
          main: palette.colors.warning,
          light: '#fbbf24',
          dark: '#d97706',
        },
        error: {
          main: palette.colors.error,
          light: '#f87171',
          dark: '#dc2626',
        },
        info: {
          main: palette.colors.info,
          light: '#60a5fa',
          dark: '#2563eb',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
      }
    }
  }

  return {
    palette: {
      mode,
      primary: {
        main: palette.colors.primary,
        light: '#525252',
        dark: '#0a0a0a',
        contrastText: '#ffffff',
      },
      secondary: {
        main: palette.colors.secondary,
        light: '#a3a3a3',
        dark: '#404040',
        contrastText: '#ffffff',
      },
      background: palette.colors.background,
      text: palette.colors.text,
      success: {
        main: palette.colors.success,
        light: '#4ade80',
        dark: '#15803d',
      },
      warning: {
        main: palette.colors.warning,
        light: '#fbbf24',
        dark: '#d97706',
      },
      error: {
        main: palette.colors.error,
        light: '#f87171',
        dark: '#dc2626',
      },
      info: {
        main: palette.colors.info,
        light: '#60a5fa',
        dark: '#2563eb',
      },
      divider: 'rgba(23, 23, 23, 0.08)',
    }
  }
}
