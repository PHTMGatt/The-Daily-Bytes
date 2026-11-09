import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// DB_API_TARGET lets the dev client talk to another API (e.g. the live Render server) for UI work.
const apiTarget = process.env.DB_API_TARGET || 'http://localhost:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  proxy: {
  '/api': {
    target: apiTarget,
    changeOrigin: true,
    secure: false,
  },
  '/auth': {
    target: apiTarget,
    changeOrigin: true,
    secure: false,
  },
    },
    // 👇 This is the real fix
    fs: {
      strict: false,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
