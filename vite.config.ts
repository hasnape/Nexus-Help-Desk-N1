import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Charge toutes les variables .env
  const env = loadEnv(mode, process.cwd(), '');

  // Filtrer uniquement celles qui commencent par VITE_
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
      },
    },
  };
});
