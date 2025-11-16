import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    include: ['axios', 'js-cookie'], 
  },

  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../Shared'),
    }
  },

  server: {
    fs: {
      allow: [
        path.resolve(__dirname),          // project root
        path.resolve(__dirname, '../Shared') // allow Shared folder
      ]
    }
  }
});
