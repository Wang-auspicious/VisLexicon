import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { componentCodeDocument } from './component-code-store.mjs'
import { gzip } from 'node:zlib'
import { promisify } from 'node:util'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
const compress = promisify(gzip)

// Separate assets keep the bench's component libraries out of the home bundle.
export function createComponentBenchMiddleware({ root, dataRoots, serveBench = true }) {
  const gzipCache = new Map()
  let cachedBytes = 0
  return async (req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method)) return next()
    let pathname
    try { pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname) } catch { return next() }
    if (serveBench && pathname === '/component-bench') { res.writeHead(302, { Location: '/component-bench/' }); res.end(); return }
    const data = pathname.startsWith('/data/component-code/')
    const address = req.socket?.remoteAddress ?? ''
    const localRequest = address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
    let databaseMiss = false
    const item = /^\/data\/component-code\/items\/([a-zA-Z0-9_.-]+)\.json$/.exec(pathname)
    if (item && localRequest) {
      try {
        const document = await componentCodeDocument(ROOT, item[1])
        if (typeof document === 'string') {
          res.writeHead(200, { 'Content-Type': TYPES['.json'], 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' }); res.end(req.method === 'HEAD' ? undefined : document); return
        }
        databaseMiss = document === null
      } catch (error) { return next(error) }
    }
    if (data && /\.(?:sqlite|sqlite-wal|sqlite-shm)$/.test(pathname)) { res.writeHead(404); res.end(); return }
    if (!data && (!serveBench || !pathname.startsWith('/component-bench/'))) return next()
    const directories = data ? databaseMiss || !localRequest ? dataRoots.slice(1) : dataRoots : [root]
    const relative = pathname.slice((data ? '/data/component-code/' : '/component-bench/').length) || 'index.html'
    for (const directory of directories) {
      const file = path.resolve(directory, relative)
      if (!file.startsWith(directory + path.sep) || relative.includes('\0')) { res.writeHead(400); res.end(); return }
      try {
        const info = await fs.stat(file)
        const zipped = info.size > 1024 && /\.(?:json|mjs|js|css|html|svg)$/.test(file) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '') && !/\bgzip\s*;\s*q=0(?:\.0*)?(?:,|$)/.test(req.headers['accept-encoding'] ?? '')
        let bytes
        const cached = gzipCache.get(file)
        if (zipped && cached?.mtime === info.mtimeMs && cached.size === info.size) bytes = cached.bytes
        else {
          bytes = await fs.readFile(file)
          if (zipped) {
            bytes = await compress(bytes, { level: 5 })
            if (cached) { cachedBytes -= cached.bytes.length; gzipCache.delete(file) }
            gzipCache.set(file, { mtime: info.mtimeMs, size: info.size, bytes }); cachedBytes += bytes.length
            while (cachedBytes > 8 * 1024 * 1024 && gzipCache.size) { const oldest = gzipCache.keys().next().value; cachedBytes -= gzipCache.get(oldest).bytes.length; gzipCache.delete(oldest) }
          }
        }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'Content-Length': bytes.length, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache', Vary: 'Accept-Encoding', ...(zipped ? { 'Content-Encoding': 'gzip' } : {}), 'Access-Control-Allow-Origin': '*' })
        res.end(req.method === 'HEAD' ? undefined : bytes)
        return
      } catch (error) { if (error.code !== 'ENOENT') return next(error) }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(data ? 'Component source data unavailable.' : 'Component bench asset unavailable. Run npm run build:bench.')
  }
}

export function componentBenchPlugin({ serveBench = true } = {}) {
  const middleware = (root, dataRoots) => createComponentBenchMiddleware({ root, dataRoots, serveBench })
  return {
    name: 'vislexicon-component-bench',
    configureServer(server) { server.middlewares.use(middleware(path.join(ROOT, 'public/component-bench'), [path.join(ROOT, 'data/ingest-v6/public'), path.join(ROOT, 'public/data/component-code')])) },
    configurePreviewServer(server) { const dist = path.resolve(server.config.root, server.config.build.outDir); server.middlewares.use(middleware(path.join(dist, 'component-bench'), [path.join(ROOT, 'data/ingest-v6/public'), path.join(dist, 'data/component-code')])) },
  }
}
