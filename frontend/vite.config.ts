import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/store': path.resolve(__dirname, './src/store'),
    },
  },
  server: {
    port: 3006,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
    },
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        /**
         * Split vendor en chunks ciblés.
         *
         * ⚠️ IMPORTANT — Ordre d'évaluation React / MUI :
         * Avant ce fix : React était dans un chunk séparé `react`. Quand MUI
         * (chunk `mui`) s'évaluait, il pouvait charger AVANT que React soit
         * disponible globalement → `TypeError: Cannot read properties of
         * undefined (reading 'createContext')` au premier paint en prod.
         *
         * Fix : React + MUI + Emotion sont regroupés dans un chunk unique
         * `mui` pour garantir que MUI ne s'évalue qu'après React. Ils
         * partagent le même graphe d'import, donc Rollup peut respecter
         * l'ordre topologique.
         *
         * Les chunks xlsx / sentry / supabase / stripe / charts restent
         * séparés (ils ne dépendent pas critiquement de l'ordre React).
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // Excel — gros, utilisé uniquement à l'import/export
          if (id.includes('xlsx') || id.includes('exceljs')) return 'xlsx'
          // MUI X (DataGrid + DatePickers + TreeView) — utilisé sur quelques pages métier
          if (id.includes('@mui/x-')) return 'mui-x'
          // Icons MUI — gros même si tree-shaké, regroupés pour cache long
          if (id.includes('@mui/icons-material')) return 'mui-icons'
          // MUI core + Emotion + React (groupés pour ordre d'évaluation correct)
          // Inclut explicitement react, react-dom, react-router pour empêcher
          // que Rollup les sorte dans un chunk séparé qui pourrait charger après MUI.
          if (
            id.includes('@mui/') ||
            id.includes('@emotion/') ||
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('node_modules/use-sync-external-store/')
          ) return 'mui'
          // Sentry — observabilité, isolable
          if (id.includes('@sentry/')) return 'sentry'
          // Supabase client
          if (id.includes('@supabase/')) return 'supabase'
          // Stripe (paiement)
          if (id.includes('@stripe/')) return 'stripe'
          // Recharts + chart deps
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          // Reste = vendor (notistack, framer-motion, etc.)
          return 'vendor'
        },
      },
    },
  },
})