import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const port = process.env.PORT ? Number(process.env.PORT) : 5173;
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
  ],
  css: {
    postcss: "./postcss.config.js",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port,
    host: true,
  },
  preview: {
    port,
    host: true,
  },
  build: {
    outDir: "dist",
  },
});
