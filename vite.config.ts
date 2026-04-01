import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Proxy target precedence:
  // 1) VITE_PROXY_TARGET (explicit proxy override)
  // 2) VITE_API_URL (legacy/local backend URL)
  // 3) localhost:5000 (current local backend default)
  const proxyTarget = env.VITE_PROXY_TARGET ?? env.VITE_API_URL ?? 'http://localhost:5000'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-redux": ["@reduxjs/toolkit", "react-redux"],
            "vendor-map": ["leaflet", "react-leaflet"],
            "vendor-charts": ["recharts"],
          },
        },
      },
    },
  }
})