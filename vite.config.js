import { defineConfig } from 'vite';
import { version } from './package.json';

export default defineConfig({
  base: 'freestyle-rap-app/',
  define: {
    'process.env.APP_VERSION': JSON.stringify(version)
  }
});
