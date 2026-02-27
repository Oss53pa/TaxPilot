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
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunks par fonctionnalité métier
          'liasse-core': [
            './src/pages/liasse/ModernLiasseComplete',
            './src/pages/liasse/ModernLiasseProduction',
            './src/pages/LiasseCompleteFinal',
            './src/components/liasse/LiasseTableauGenerique',
          ],
          'liasse-sheets': [
            './src/components/liasse/sheets/BilanActifSYSCOHADA',
            './src/components/liasse/sheets/BilanPassifSYSCOHADA',
            './src/components/liasse/BilanActif',
            './src/components/liasse/CompteResultat',
          ],
          'balance-module': [
            './src/pages/balance/ModernBalance',
            './src/pages/import/ModernImportBalance',
            './src/components/Balance/BalanceConsultation',
            './src/components/Balance/BalanceImport',
          ],
          'audit-compliance': [
            './src/pages/audit/ModernAudit',
            './src/pages/compliance/ModernCompliance',
            './src/pages/teledeclaration/ModernTeledeclaration',
          ],
          'advanced-modules': [
            './src/pages/consolidation/ModernConsolidation',
            './src/pages/templates/ModernTemplates',
            './src/pages/reporting/ModernReporting',
          ],
          // Vendors
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@mui/lab',
            '@mui/x-data-grid',
          ],
          'react-vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          'form-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'yup',
          ],
          'utils-vendor': [
            'zustand',
            'dayjs',
          ],
        },
      },
    },
  },
})
