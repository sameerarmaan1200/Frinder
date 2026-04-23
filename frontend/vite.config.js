import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 7410,
    proxy: {
      // API calls -> backend PHP files
      '/api/auth':         { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder/backend') },
      '/api/users':        { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder/backend') },
      '/api/posts':        { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder/backend') },
      '/api/friends':      { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder/backend') },
      '/api/messages':     { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder/backend') },
      '/api/events':       { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder/backend') },
      '/api/safety':       { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder/backend') },
      '/api/admin':        { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder/backend') },
      '/api/verification': { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder/backend') },
      '/api/calls':        { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder/backend') },
      '/api/lookup.php':   { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder/backend') },
      // All uploaded files (posts, selfies, documents, messages) -> /frinder/uploads
      '/api/uploads':      { target: 'http://localhost', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/frinder') },
    }
  }
})
