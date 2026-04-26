import { defineConfig, loadEnv } from 'vite'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTargetEnv = env.VITE_API_TARGET || "http://127.0.0.1:8080";
  const whatsappServiceTargetEnv = env.VITE_WHATSAPP_SERVICE_TARGET || "http://127.0.0.1:3001";
  const apiTarget = /^https?:\/\//i.test(apiTargetEnv)
    ? apiTargetEnv
    : "http://127.0.0.1:8080";
  const whatsappServiceTarget = /^https?:\/\//i.test(whatsappServiceTargetEnv)
    ? whatsappServiceTargetEnv
    : "http://127.0.0.1:3001";

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
        "/whatsapp-api": {
          target: whatsappServiceTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) => requestPath.replace(/^\/whatsapp-api/, ""),
        },
      },
    }
  }
})
