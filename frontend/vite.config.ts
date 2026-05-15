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
         * Avant ce fix : un seul `vendor.js` de 1.67 MB / 527 KB gzip était tiré
         * dès le premier paint (MUI + xlsx + Sentry + recharts + Stripe…),
         * peu importe la route. Le manualChunks fonction-style match d'abord
         * les paquets connus (split déterministe), puis fallback `vendor`
         * pour le reste.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // Excel — gros, utilisé uniquement à l'import/export
          if (id.includes('xlsx') || id.includes('exceljs')) return 'xlsx'
          // MUI X (DataGrid + DatePickers + TreeView) — utilisé sur quelques pages métier
          if (id.includes('@mui/x-')) return 'mui-x'
          // Icons MUI — gros même si tree-shaké, regroupés pour cache long
          if (id.includes('@mui/icons-material')) return 'mui-icons'
          // MUI core
          if (id.includes('@mui/') || id.includes('@emotion/')) return 'mui'
          // Sentry — observabilité, isolable
          if (id.includes('@sentry/')) return 'sentry'
          // Supabase client
          if (id.includes('@supabase/')) return 'supabase'
          // Stripe (paiement)
          if (id.includes('@stripe/')) return 'stripe'
          // Recharts + chart deps
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          // React core
          if (id.includes('react-dom') || id.includes('react/') || id.includes('react-router')) return 'react'
          // Reste = vendor
          return 'vendor'
        },
      },
    },
  },
})