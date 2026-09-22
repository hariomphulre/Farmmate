import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // In production, the client is served from the same origin as the server
  // (Nginx proxies /api/* to the Node server), so no proxy needed.
  // In development, proxy API calls to avoid CORS issues.
  server: {
    host: '0.0.0.0',   // needed for Docker dev mode
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/detect_results': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/crop_imgs': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Generate source maps for production debugging (disable if bundle size matters)
    sourcemap: false,
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts:  ['chart.js', 'react-chartjs-2', 'recharts'],
        },
      },
    },
  },
})
