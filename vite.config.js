import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { discoveryPlugin } from './server/discovery-api.mjs'
import { componentBenchPlugin } from './server/component-bench.mjs'
import { runtimeDataPlugin, publicAssetsPlugin, compressedPreviewPlugin } from './scripts/runtime-data-plugin.mjs'

export default defineConfig({
  build: { target: 'es2022', copyPublicDir: false },
  optimizeDeps: { noDiscovery: true, include: ['react', 'react-dom/client', 'react/jsx-runtime'] },
  plugins: [runtimeDataPlugin(), react(), componentBenchPlugin(), discoveryPlugin(), publicAssetsPlugin(), compressedPreviewPlugin()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    watch: { ignored: ['**/public/shots/**', '**/public/images/**', '**/public/data/discovery/**', '**/public/data/site/**', '**/public/r/**', '**/public/site/**'] },
  },
})
