import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: "/",

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    cssCodeSplit: true,
    sourcemap: false,
    // Router pages are code-split so first paint loads a tiny kernel;
    // heavy libraries (framer-motion, recharts, react-markdown) load lazily.
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router') || id.includes('node_modules/zustand') || id.includes('node_modules/@tanstack')) return 'vendor'
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide')) return 'ui-motion'
          if (id.includes('node_modules/recharts')) return 'charts'
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/papaparse')) return 'parsers'
          // Large generated tools module (data/tools.ts) — cached separately, lazy where possible
          if (id.includes('/data/tools.ts')) return 'tool-data'
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },

  server: {
    port: 3000,
  },

  preview: {
    port: 4173,
  },
})