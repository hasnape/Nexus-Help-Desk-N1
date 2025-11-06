// vite.config.ts
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const debug = process.env.VITE_DEBUG_BUNDLE === '1';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: debug,
    minify: debug ? false : 'esbuild',
    rollupOptions: debug ? { treeshake: false } : {},
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
});
