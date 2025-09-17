import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server:{
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,        // adjust the Host header for the target
        secure: false,             // ignore self-signed https certs (if needed)
        rewrite: (path) => path.replace(/^\/api/, '') // optional: drop "/api" prefix
      }
    }

  },
  plugins: [react()],
})
