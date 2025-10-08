import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      external: [
        "express",
        "cors",
        "dotenv",
        "fs",
        "path",
        "os"
      ]
    }
  },
  optimizeDeps: {
    exclude: [
      "express",
      "cors",
      "dotenv",
      "fs",
      "path",
      "os"
    ]
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
  

})
