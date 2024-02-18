import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pageMarkdown, pageMatter } from './plugin'

export default defineConfig({
  plugins: [
    pageMatter(),
    pageMarkdown(),
    react(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
})
