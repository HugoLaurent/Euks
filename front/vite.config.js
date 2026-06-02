import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    allowedHosts: [
      "localhost",
      "2d65-2a01-e0a-e9b-e610-8062-62e4-190a-60ba.ngrok-free.app",
    ],
    proxy: {
      "/api/v1": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
      "/audio": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
      "/covers": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
      "/archives": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
      "/seed": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: fileURLToPath(new URL("../back/public", import.meta.url)),
    emptyOutDir: false,
  },
  plugins: [react(), tailwindcss()],
});
