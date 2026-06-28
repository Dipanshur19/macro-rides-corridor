import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use a relative base so the production build works on any static host
  // (GitHub Pages subpath, Netlify, Vercel, S3, etc.) without extra config.
  base: './',
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          h3: ['h3-js'],
          leaflet: ['leaflet', 'react-leaflet'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
