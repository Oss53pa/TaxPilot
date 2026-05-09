/** @type {import('tailwindcss').Config} */
export default {
  // Important = false par défaut.
  // On garde le préfixe vide pour ne pas changer toutes les classes existantes
  // dans DemoPage.tsx (~900 classes Tailwind dans le fichier).
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Désactive le préflight pour ne pas écraser MUI CssBaseline
  // (MUI gère déjà le reset). On veut juste les utilities.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Nordic Slate palette (alignée sur fiscasyncTheme.ts + public/theme.ts)
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',  // Accent primaire Liass'Pilot
          800: '#115e59',  // Pressed
          900: '#134e4a',
          950: '#042f2e',
        },
        stone: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      fontFamily: {
        sans: ['Dosis', 'Inter', 'Exo 2', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        brand: ['"Grand Hotel"', 'cursive'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
