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
    }
  }
});