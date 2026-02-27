/**
 * Store pour la gestion des themes et palettes de couleurs
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createTheme, Theme } from '@mui/material/styles'
import { colorPalettes, getPaletteById, defaultPaletteId, createThemeFromPalette, type ColorPalette } from '../utils/colorPalettes'

interface ThemeState {
  currentPaletteId: string
  currentPalette: ColorPalette
  isDarkMode: boolean
  currentTheme: Theme

  setPalette: (paletteId: string) => void
  toggleDarkMode: () => void
  resetToDefault: () => void

  getAvailablePalettes: () => ColorPalette[]
  getCurrentPaletteName: () => string
}

const baseThemeConfig = {
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
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    button: {
      textTransform: 'none' as any,
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none' as any,
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
        },
        outlined: {
          borderWidth: 1,
          borderColor: '#d4d4d4',
          '&:hover': {
            borderWidth: 1,
            backgroundColor: '#fafafa',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e5e5e5',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f5f5f5',
          fontSize: '0.875rem',
        },
        body: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '1px 0 4px rgba(0, 0, 0, 0.04)',
        },
      },
    },
  },
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => {
      const defaultPalette = getPaletteById(defaultPaletteId);
      const initialTheme = createTheme({
        ...baseThemeConfig,
        ...createThemeFromPalette(defaultPalette, 'light'),
      });

      return {
        currentPaletteId: defaultPaletteId,
        currentPalette: defaultPalette,
        isDarkMode: false,
        currentTheme: initialTheme,

      setPalette: (paletteId: string) => {
        const palette = getPaletteById(paletteId)
        const paletteConfig = createThemeFromPalette(palette, get().isDarkMode ? 'dark' : 'light')
        const newTheme = createTheme({
          ...baseThemeConfig,
          ...paletteConfig,
        })

        set({
          currentPaletteId: paletteId,
          currentPalette: palette,
          currentTheme: newTheme,
        })
      },

      toggleDarkMode: () => {
        const state = get()
        const newIsDark = !state.isDarkMode
        const paletteConfig = createThemeFromPalette(state.currentPalette, newIsDark ? 'dark' : 'light')
        const newTheme = createTheme({
          ...baseThemeConfig,
          ...paletteConfig,
        })

        set({
          isDarkMode: newIsDark,
          currentTheme: newTheme,
        })
      },

      resetToDefault: () => {
        const defaultPal = getPaletteById(defaultPaletteId)
        const paletteConfig = createThemeFromPalette(defaultPal)
        const newTheme = createTheme({
          ...baseThemeConfig,
          ...paletteConfig,
        })

        set({
          currentPaletteId: defaultPaletteId,
          currentPalette: defaultPal,
          isDarkMode: false,
          currentTheme: newTheme,
        })
      },

      getAvailablePalettes: () => colorPalettes,

        getCurrentPaletteName: () => get().currentPalette.name,
      };
    },
    {
      name: 'fiscasync-theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentPaletteId: state.currentPaletteId,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
)
