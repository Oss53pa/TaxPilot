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

          // ────────────────────────────────────────────────────────────
          // VANILLA JS chunks — pas de React/JSX au module-load → safe.
          // Ces libs peuvent être chargées dans n'importe quel ordre.
          // ────────────────────────────────────────────────────────────

          // Excel — gros, utilisé uniquement à l'import/export (lazy par route)
          if (id.includes('xlsx') || id.includes('exceljs')) return 'xlsx'
          // Sentry — lazy import async via requestIdleCallback en main.tsx
          if (id.includes('@sentry/')) return 'sentry'
          // Supabase client — SDK pur, pas de JSX
          if (id.includes('@supabase/')) return 'supabase'
          // Stripe — script externe chargé via @stripe/stripe-js (vanilla)
          if (id.includes('@stripe/')) return 'stripe'

          // ────────────────────────────────────────────────────────────
          // ÉCOSYSTÈME REACT — tout ce qui importe React ou JSX au
          // module-load doit être dans le même chunk pour garantir
          // l'ordre d'évaluation Rollup.
          //
          // Inclut : core React, MUI (core + X + icons), Emotion,
          // toutes les libs qui consomment React.createContext() ou
          // React.jsx (jsx-runtime) au load, plus recharts/d3 et tout
          // le reste qui dépend de React via peer/runtime.
          //
          // Note perf : ce chunk est gros (~700 KB / 220 KB gzip) mais
          // c'est la seule façon SAFE de déployer en prod sans
          // `TypeError: Cannot read properties of undefined (reading
          // 'createContext'|'jsx')`. Les optimisations de cache
          // viennent du code-splitting par route (lazy pages) — le
          // chunk react-vendor lui-même est immuable entre versions.
          // ────────────────────────────────────────────────────────────
          if (
            // React core + JSX runtime + scheduler
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('node_modules/use-sync-external-store/') ||
            // MUI complet (core + X + icons) — TOUT dépend de React/JSX
            id.includes('@mui/') ||
            id.includes('@emotion/') ||
            // Libs qui créent un Context React ou utilisent JSX au module-load
            id.includes('notistack') ||
            id.includes('framer-motion') ||
            id.includes('react-hook-form') ||
            id.includes('@hookform/') ||
            id.includes('react-redux') ||
            id.includes('@reduxjs/toolkit') ||
            id.includes('@tanstack/react-query') ||
            id.includes('react-pdf') ||
            id.includes('react-i18next') ||
            // Charts (recharts importe React au module-load)
            id.includes('recharts') ||
            id.includes('d3-') ||
            // Filet de sécurité : toute lib `react-XXX` ou `@XXX/react-YYY`
            id.includes('node_modules/react-') ||
            /node_modules\/@[^/]+\/react-/.test(id)
          ) return 'react-vendor'

          // Reste = vendor (decimal.js, yup, dayjs, axios, file-saver, lodash, etc.)
          // Ces libs sont vanilla JS sans React/JSX → safe à isoler.
          return 'vendor'
        },
      },
    },
  },
})