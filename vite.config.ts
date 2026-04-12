import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const proxyOverride = env.VITE_PROXY_TARGET?.trim() || undefined
  const apiUrl = env.VITE_API_URL?.trim() || undefined
  const proxyTarget = proxyOverride || apiUrl || 'http://localhost:5000'

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