// vite.config.ts
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@types": path.resolve(__dirname, "src/types"),
      constants: path.resolve(__dirname, "src/constants"),
      services: path.resolve(__dirname, "src/services"),
      components: path.resolve(__dirname, "src/components"),
      pages: path.resolve(__dirname, "src/pages"),
      hooks: path.resolve(__dirname, "src/hooks"),
    },
  },
});
