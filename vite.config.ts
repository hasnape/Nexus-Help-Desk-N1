import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const viteEnv = Object.fromEntries(
    Object.entries(env).filter(([key]) => key.startsWith('VITE_'))
  );

  return {
    define: Object.fromEntries(
      Object.entries(viteEnv).map(([key, value]) => [
        `import.meta.env.${key}`,
        JSON.stringify(value),
      ])
    ),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@src': path.resolve(__dirname, 'src'),
        '@types': path.resolve(__dirname, 'types'),
      },
    },
  },
});
