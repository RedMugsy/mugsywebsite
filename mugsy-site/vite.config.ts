import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Keep base as root
  build: {
    rollupOptions: {
      output: {
        // Make every file completely unique
        entryFileNames: 'v20251113/[name]-[hash].js',
        chunkFileNames: 'v20251113/[name]-[hash].js', 
        assetFileNames: 'v20251113/[name]-[hash].[ext]'
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