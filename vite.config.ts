import { defineConfig, loadEnv } from 'vite'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTargetEnv = env.VITE_API_TARGET || "http://127.0.0.1:8080";
  const apiTarget = /^https?:\/\//i.test(apiTargetEnv)
    ? apiTargetEnv
    : "http://127.0.0.1:8080";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      }
    },
    server: {
      host: "0.0.0.0",
      port: Number(process.env.PORT) || 5173,
      hmr: {
        host: process.env.HMR_HOST ?? "localhost",
        port: Number(process.env.HMR_PORT) || 5173,
      },
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) => requestPath.replace(/^\/api/, ""),
        },
      },
    }
  }
})