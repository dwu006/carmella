import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses including 127.0.0.1 and localhost
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Three.js into its own chunk
          three: ['three'],
          // Separate React Three Fiber and Drei
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          // Separate React into its own chunk
          react: ['react', 'react-dom'],
          // Separate router
          router: ['react-router-dom']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1100,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  }
})
