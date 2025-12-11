import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import rollupNodePolyfills from 'rollup-plugin-node-polyfills'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const processPolyfill = require.resolve('process/browser')

export default defineConfig({
  plugins: [react()],
  base: '/', // Keep base as root
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
      process: processPolyfill,
      'process/browser': processPolyfill,
      vm: 'vm-browserify',
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyfills() as unknown as PluginOption],
      output: {
        // Nuclear cache busting - make every file completely unique with timestamp
        entryFileNames: 'v20251119104500/[name]-[hash].js',
        chunkFileNames: 'v20251119104500/[name]-[hash].js', 
        assetFileNames: 'v20251119104500/[name]-[hash].[ext]'
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
