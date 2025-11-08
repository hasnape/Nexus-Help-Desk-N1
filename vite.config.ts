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
      '@': '/src',
    , "@": require("node:path").resolve(__dirname,"src"), "@types": require("node:path").resolve(__dirname,"src/types") },
    dedupe: ['react', 'react-dom'],
  },
});
