/**
 * Palettes de couleurs pour FiscaSync
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
  // 🎨 Palette 1 – FiscaSync Default (actuel)
  {
    id: 'fiscasync-default',
    name: 'FiscaSync Default',
    description: 'Thème par défaut de FiscaSync - Minimaliste Premium',
    colors: {
      primary: '#B87333', // Cuivre rosé
      secondary: '#6A8A82', // Vert sauge
      background: {
        default: '#ECECEC', // Gris clair perle
        paper: '#FFFFFF',
      },
      text: {
        primary: '#191919', // Noir fumé
        secondary: '#444444', // Anthracite doux
      },
      success: '#6A8A82', // Vert sauge
      warning: '#B87333', // Cuivre rosé
      error: '#DC2626',
      info: '#6366F1',
    }
  },

  // 🎨 Palette 2 – Élégance sobre (finance traditionnelle moderne)
  {
    id: 'elegance-sobre',
    name: 'Élégance Sobre',
    description: 'Finance traditionnelle moderne - sérieux, luxe discret, rassurant',
    colors: {
      primary: '#2E7D69', // Vert émeraude
      secondary: '#D4AF37', // Or pâle
      background: {
        default: '#F5F5F7', // Gris clair neutre
        paper: '#FFFFFF',
      },
      text: {
        primary: '#1E1E2F', // Charbon profond
        secondary: '#C2C7CE', // Gris moyen
      },
      success: '#2E7D69', // Vert émeraude
      warning: '#D4AF37', // Or pâle
      error: '#B91C1C',
      info: '#2563EB',
    }
  },

  // 🎨 Palette 3 – Modern Fintech
  {
    id: 'modern-fintech',
    name: 'Modern Fintech',
    description: 'Moderne, clair, orienté tableau de bord financier',
    colors: {
      primary: '#2C3E50', // Bleu nuit désaturé
      secondary: '#27AE60', // Vert doux
      background: {
        default: '#FAFAFA', // Blanc cassé
        paper: '#FFFFFF',
      },
      text: {
        primary: '#2C3E50', // Bleu nuit désaturé
        secondary: '#7F8C8D', // Gris ardoise
      },
      success: '#27AE60', // Vert doux
      warning: '#F39C12',
      error: '#C0392B', // Rouge bourgogne
      info: '#3498DB',
    }
  },

  // 🎨 Palette 4 – Minimaliste premium
  {
    id: 'minimaliste-premium',
    name: 'Minimaliste Premium',
    description: 'Élégance minimaliste avec touche premium - Cuivre rosé et vert sauge',
    colors: {
      primary: '#B87333', // Cuivre rosé
      secondary: '#6A8A82', // Vert sauge
      background: {
        default: '#ECECEC', // Gris clair perle
        paper: '#FFFFFF',
      },
      text: {
        primary: '#191919', // Noir fumé
        secondary: '#444444', // Anthracite doux
      },
      success: '#6A8A82', // Vert sauge
      warning: '#B87333', // Cuivre rosé
      error: '#DC2626',
      info: '#6366F1',
    }
  },

  // 🎨 Palette 5 – Neutral Odyssey
  {
    id: 'neutral-odyssey',
    name: 'Neutral Odyssey',
    description: 'Couleurs neutres et apaisantes',
    colors: {
      primary: '#74b9ff', // Bleu ciel
      secondary: '#55a3ff', // Bleu moyen
      background: {
        default: '#FAFAFA', // Blanc cassé
        paper: '#FFFFFF',
      },
      text: {
        primary: '#333333', // Gris foncé
        secondary: '#666666', // Gris moyen
      },
      success: '#00b894', // Vert menthe
      warning: '#fdcb6e', // Jaune doré
      error: '#d63031', // Rouge
      info: '#74b9ff', // Bleu ciel
    }
  },
]

// Palette par défaut
export const defaultPaletteId = 'fiscasync-default'

// Fonction pour obtenir une palette par ID
export const getPaletteById = (id: string): ColorPalette => {
  return colorPalettes.find(p => p.id === id) || colorPalettes.find(p => p.id === defaultPaletteId)!
}

// Fonction pour créer un thème Material-UI à partir d'une palette
export const createThemeFromPalette = (palette: ColorPalette, mode: 'light' | 'dark' = 'light') => {
  return {
    palette: {
      mode,
      primary: {
        main: palette.colors.primary,
        light: lightenColor(palette.colors.primary, 20),
        dark: darkenColor(palette.colors.primary, 20),
        contrastText: '#ffffff',
      },
      secondary: {
        main: palette.colors.secondary,
        light: lightenColor(palette.colors.secondary, 20),
        dark: darkenColor(palette.colors.secondary, 20),
        contrastText: '#ffffff',
      },
      background: palette.colors.background,
      text: palette.colors.text,
      success: {
        main: palette.colors.success,
        light: lightenColor(palette.colors.success, 20),
        dark: darkenColor(palette.colors.success, 20),
      },
      warning: {
        main: palette.colors.warning,
        light: lightenColor(palette.colors.warning, 20),
        dark: darkenColor(palette.colors.warning, 20),
      },
      error: {
        main: palette.colors.error,
        light: lightenColor(palette.colors.error, 20),
        dark: darkenColor(palette.colors.error, 20),
      },
      info: {
        main: palette.colors.info,
        light: lightenColor(palette.colors.info, 20),
        dark: darkenColor(palette.colors.info, 20),
      },
    }
  }
}

// Utilitaires pour éclaircir/assombrir les couleurs
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) - amt
  const G = (num >> 8 & 0x00FF) - amt
  const B = (num & 0x0000FF) - amt
  return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1)
}