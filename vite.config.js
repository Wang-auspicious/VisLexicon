import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { discoveryPlugin } from './server/discovery-api.mjs'

export default defineConfig({
  plugins: [react(), discoveryPlugin()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    watch: { ignored: ['**/public/shots/**', '**/public/data/site/**', '**/public/r/**', '**/public/site/**'] },
  },
})
