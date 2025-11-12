import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Enable cache busting with content hashes
    rollupOptions: {
      output: {
        // Add hash to JS/CSS files to prevent caching issues
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Generate manifest for cache invalidation
    manifest: true,
    // Clean output directory
    emptyOutDir: true,
    // Optimize for production
    minify: 'esbuild',
    sourcemap: false
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