import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import createPaypalSandboxPlugin from "./paypalSandboxPlugin.js";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, globalThis.process.cwd(), "");

  return {
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
    plugins: [react(), tailwindcss(), createPaypalSandboxPlugin(env)],
  };
});
