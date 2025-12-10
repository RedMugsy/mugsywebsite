import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Keep base as root
  build: {
    rollupOptions: {
      output: {
        // Dynamic cache busting using BUILD_VERSION from environment
        entryFileNames: `${process.env.BUILD_VERSION || 'v20251210'}/[name]-[hash].js`,
        chunkFileNames: `${process.env.BUILD_VERSION || 'v20251210'}/[name]-[hash].js`,
        assetFileNames: `${process.env.BUILD_VERSION || 'v20251210'}/[name]-[hash].[ext]`
      }
    },
    emptyOutDir: true,
    minify: 'esbuild'
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
})