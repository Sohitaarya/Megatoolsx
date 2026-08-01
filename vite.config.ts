import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: "/",   // 👈 यह लाइन जोड़ें

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor'
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide') || id.includes('node_modules/recharts')) return 'ui'
          if (id.includes('tools.csv')) return 'data'
          if (id.includes('papaparse')) return 'csv-parser'
        },
      },
    },
  },
})