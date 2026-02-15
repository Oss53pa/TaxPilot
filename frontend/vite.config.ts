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
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui/') || id.includes('@emotion/')) {
              return 'mui-vendor';
            }
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) {
              return 'react-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/yup/')) {
              return 'form-vendor';
            }
            if (id.includes('/axios/') || id.includes('/zustand/') || id.includes('/dayjs/')) {
              return 'utils-vendor';
            }
          }
        },
      },
    },
  },
})