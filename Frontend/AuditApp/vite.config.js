// E:\Laragon\www\PA\Frontend\AuditApp\vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // 🚨 BARU: Minta Vite untuk secara eksplisit me-resolve/pre-bundle package ini
  optimizeDeps: {
    include: ['axios', 'react-icons'], // Masukkan semua dependency yang gagal di-resolve
  },
  
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('@remix-run/router')) {
              return 'vendor-react';
            }
            if (id.includes('axios') || id.includes('react-hot-toast') || id.includes('pusher-js') || id.includes('laravel-echo')) {
              return 'vendor-utils';
            }
          }
        }
      }
    }
  },

  
  server: {
    fs: {
      allow: [
        '.', 
        path.resolve(__dirname, '..', 'Shared'), 
      ],
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '..', 'Shared'),
    },
    dedupe: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'react-router',
      '@remix-run/router',
      'axios', 
      'react-hot-toast', 
      'react-icons'
    ]
  }
});