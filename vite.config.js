import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { version } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  assetsInclude: ['**/*.json', '**/*.webmanifest'],
  define: {
    'process.env.APP_VERSION': JSON.stringify(version)
  },
  server: {
    historyApiFallback: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});
