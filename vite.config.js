import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { discoveryPlugin } from './server/discovery-api.mjs'
import { componentBenchPlugin } from './server/component-bench.mjs'
import { runtimeDataPlugin, publicAssetsPlugin, compressedPreviewPlugin } from './scripts/runtime-data-plugin.mjs'

// The deployed site's search files (scripts/build-static-search.mjs), served
// locally so the static search path can be tried with VITE_STATIC_API=1.
const STATIC_SEARCH_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'data/static-search')
function staticSearchData() {
  // Block body: returning use()'s result would register it as a post hook.
  const serve = (server) => { server.middlewares.use(async (req, res, next) => {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname
    if (!pathname.startsWith('/search-data/')) return next()
    const file = path.resolve(STATIC_SEARCH_DIR, decodeURIComponent(pathname.slice('/search-data/'.length)))
    if (!file.startsWith(STATIC_SEARCH_DIR + path.sep)) return next()
    try {
      const bytes = await fs.readFile(file)
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
      res.end(bytes)
    } catch (error) { if (error.code === 'ENOENT') { res.writeHead(404); res.end() } else next(error) }
  }) }
  return { name: 'vislexicon-static-search-data', configureServer: serve, configurePreviewServer: serve }
}

export default defineConfig({
  build: { target: 'es2022', copyPublicDir: false },
  optimizeDeps: { noDiscovery: true, include: ['react', 'react-dom/client', 'react/jsx-runtime'] },
  plugins: [runtimeDataPlugin(), react(), componentBenchPlugin(), discoveryPlugin(), publicAssetsPlugin(), staticSearchData(), compressedPreviewPlugin()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    watch: { ignored: ['**/public/shots/**', '**/public/images/**', '**/public/data/discovery/**', '**/public/data/site/**', '**/public/r/**', '**/public/site/**'] },
  },
})
