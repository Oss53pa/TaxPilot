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
         * ⚠️ IMPORTANT — Ordre d'évaluation React / écosystème React :
         *
         * Bug initial : `TypeError: Cannot read properties of undefined
         * (reading 'createContext')` au boot en prod.
         *
         * Cause racine : Rollup ne garantit pas l'ordre de chargement entre
         * chunks NON liés par dépendance directe. Si un chunk contient une
         * lib comme `notistack` / `react-hook-form` / `framer-motion` /
         * `react-redux` / `@tanstack/react-query` qui appelle
         * `React.createContext()` au module-load, et qu'il s'évalue AVANT
         * le chunk contenant React, ça plante.
         *
         * Fix : TOUT l'écosystème React (React core + libs qui dépendent
         * de React en peer/runtime) va dans un chunk unique `react-vendor`.
         * Rollup garantit alors l'ordre topologique interne au chunk.
         *
         * Les chunks isolables car indépendants de React au module-load :
         *   - xlsx, supabase (clients), stripe (loader async), sentry
         *     (lazy via requestIdleCallback), recharts (lazy par route)
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // Excel — gros, utilisé uniquement à l'import/export (lazy par route)
          if (id.includes('xlsx') || id.includes('exceljs')) return 'xlsx'
          // MUI X (DataGrid + DatePickers + TreeView) — dépend de React, doit
          // être groupé avec react-vendor pour respecter l'ordre.
          // (avant : chunk séparé `mui-x` → risque même bug createContext)
          if (id.includes('@mui/x-')) return 'react-vendor'
          // Icons MUI — gros même si tree-shaké, gardés à part pour cache
          // long (les icônes ne déclarent pas de contexte React au module-load,
          // safe en chunk séparé)
          if (id.includes('@mui/icons-material')) return 'mui-icons'
          // ÉCOSYSTÈME REACT — tout ce qui consomme React.createContext()
          // au module-load doit être dans le même chunk que React lui-même
          // pour garantir l'ordre d'évaluation Rollup.
          if (
            // React core + Emotion CSS-in-JS
            id.includes('@mui/') ||
            id.includes('@emotion/') ||
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('node_modules/use-sync-external-store/') ||
            // Libs qui créent un Context React au module-load
            id.includes('notistack') ||
            id.includes('framer-motion') ||
            id.includes('react-hook-form') ||
            id.includes('@hookform/') ||
            id.includes('react-redux') ||
            id.includes('@reduxjs/toolkit') ||
            id.includes('@tanstack/react-query') ||
            id.includes('react-pdf') ||
            id.includes('react-i18next') ||
            // Toute lib `react-XXX` ou `@XXX/react-YYY` (filet de sécurité
            // pour les transitive deps non listées ci-dessus)
            id.includes('node_modules/react-') ||
            /node_modules\/@[^/]+\/react-/.test(id)
          ) return 'react-vendor'
          // Sentry — lazy import async via requestIdleCallback en main.tsx,
          // pas de touche au DOM/Context au load → safe à séparer
          if (id.includes('@sentry/')) return 'sentry'
          // Supabase client — pas de React au module-load
          if (id.includes('@supabase/')) return 'supabase'
          // Stripe — script externe chargé via @stripe/stripe-js
          if (id.includes('@stripe/')) return 'stripe'
          // Recharts + d3 — utilisé lazy par routes reporting/dashboard
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          // Reste = vendor (decimal.js, yup, dayjs, axios, file-saver, etc.)
          // Ces libs sont vanilla JS sans Context React → safe à isoler
          return 'vendor'
        },
      },
    },
  },
})