import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The browser only ever talks to this dev server (relative /api/* URLs).
 * Vite proxies /api to the small Express API in server/index.js, which is what
 * actually writes content to disk. That keeps the front end origin-safe, so it
 * also works behind any preview/proxy host.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
  build: { outDir: 'dist', sourcemap: false },
});
