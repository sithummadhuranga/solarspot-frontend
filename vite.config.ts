import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(() => {
  // VITE_PROXY_TARGET is injected by Docker compose (http://backend:5000).
  // Falls back to localhost:5000 for plain local development outside Docker.
  const proxyTarget = process.env.VITE_PROXY_TARGET ?? 'http://localhost:5000'

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