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
        /**
         * Split minimal pour stabilité prod :
         *   - xlsx → chunk dédié (utilisé seulement à l'import/export,
         *     gain ~140 KB gzip sur le critical path)
         *   - tout le reste → chunk unique `vendor`
         *
         * Pourquoi pas plus de splits ?
         * Les tentatives de split par lib (react-vendor / mui / mui-icons /
         * charts / supabase / sentry / stripe) ont produit en cascade :
         *   - `TypeError: createContext undefined` (notistack/framer-motion
         *     avant react)
         *   - `TypeError: jsx undefined` (mui-icons avant react)
         *   - `TypeError: AsyncMode setter on undefined` (react-is interop
         *     CommonJS cassé entre chunks)
         *
         * Le problème : Rollup ne garantit PAS l'ordre d'évaluation entre
         * chunks non liés par dépendance directe + l'interop CommonJS/ESM
         * de certaines libs (react-is, prop-types, hoist-non-react-statics)
         * casse quand elles sont split de React.
         *
         * Trade-off accepté : un seul `vendor` de ~530 KB gzip au premier
         * paint, identique à l'état d'avant la première PR perf. Les vraies
         * optimisations bundle viennent du code-splitting par ROUTE (84+
         * chunks page lazy via React.lazy + Suspense) — chunk vendor
         * monolithique mais stable, immuable entre versions.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // xlsx — seul split SAFE (vanilla JS, parsing Excel, aucune dep React).
          // Lazy-chargé seulement quand l'utilisateur visite import/export.
          if (id.includes('xlsx') || id.includes('exceljs')) return 'xlsx'
          // Tout le reste dans un seul chunk vendor pour éliminer
          // les races d'ordre d'évaluation entre libs React-dependent.
          return 'vendor'
        },
      },
    },
  },
})