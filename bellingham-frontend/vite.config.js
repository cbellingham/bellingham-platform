import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'signature_pad/dist/signature_pad.js': 'signature_pad',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
