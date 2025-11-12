import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // AGGRESSIVE cache busting - forces new files every build
    rollupOptions: {
      output: {
        // Use timestamp + hash for maximum cache busting
        entryFileNames: `assets/[name]-${Date.now()}-[hash].js`,
        chunkFileNames: `assets/[name]-${Date.now()}-[hash].js`, 
        assetFileNames: `assets/[name]-${Date.now()}-[hash].[ext]`
      }
    },
    // Force rebuild of everything
    emptyOutDir: true,
    manifest: true,
    minify: 'esbuild',
    // Add version to build
    define: {
      __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString())
    }
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