import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          leaflet: ['leaflet', 'react-leaflet', 'leaflet.heat'],
          h3: ['h3-js'],
          deck: [
            '@deck.gl/core',
            '@deck.gl/react',
            '@deck.gl/layers',
            '@deck.gl/geo-layers',
          ],
          three: ['three', '@react-three/fiber'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
