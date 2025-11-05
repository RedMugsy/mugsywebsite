import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Staging build: outputs to ../staging with base "/staging/" so it can
// live alongside the current production site without interfering.
export default defineConfig({
  plugins: [react()],
  base: '/staging/',
  build: {
    // Emit the built site at repo root under /staging
    outDir: '../staging',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
})

