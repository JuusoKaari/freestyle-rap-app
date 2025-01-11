import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { version } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  assetsInclude: ['**/*.json'],
  define: {
    'process.env.APP_VERSION': JSON.stringify(version)
  }
});
