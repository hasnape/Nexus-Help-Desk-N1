// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
      '@': '/src',
    },
  },
});
