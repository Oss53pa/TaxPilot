/**
 * Store pour la gestion des thèmes et palettes de couleurs
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createTheme, Theme } from '@mui/material/styles'
import { colorPalettes, getPaletteById, defaultPaletteId, createThemeFromPalette, type ColorPalette } from '../utils/colorPalettes'

interface ThemeState {
  // État actuel
  currentPaletteId: string
  currentPalette: ColorPalette
  isDarkMode: boolean
  currentTheme: Theme
  
  // Actions
  setPalette: (paletteId: string) => void
  toggleDarkMode: () => void
  resetToDefault: () => void
  
  // Getters
  getAvailablePalettes: () => ColorPalette[]
  getCurrentPaletteName: () => string
}

// Configuration de base du thème Material-UI
const baseThemeConfig = {
  typography: {
    fontFamily: [
      'Quicksand',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
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
          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
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
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
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
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
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