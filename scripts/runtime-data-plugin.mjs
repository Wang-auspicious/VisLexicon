import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { brotliCompressSync, gzipSync, constants } from 'node:zlib'

const DATA_FILES = new Set(['image-prompts.json', 'image-prompts.en.json', 'creative-practices.json', 'resource-studies.json', 'design-documents.json', 'presentation-resources.json', 'graphics-resources.json', 'visual-atlas.json'])
const PREFIX = '\0vislexicon-runtime-data:'

// Keep the Node authoring/test imports intact. Only the browser build replaces
// large JSON modules with separately cached data, loaded with their route.
export function runtimeDataPlugin() {
  return {
    name: 'vislexicon-runtime-data', enforce: 'pre', apply: 'build',
    resolveId(source, importer) {
      if (!importer || !DATA_FILES.has(path.basename(source))) return null
      const file = path.resolve(path.dirname(importer), source)
      if (!file.replaceAll('\\', '/').includes('/src/data/')) return null
      return PREFIX + file + '.runtime.js'
    },
    async load(id) {
      if (!id.startsWith(PREFIX)) return null
      const file = id.slice(PREFIX.length, -'.runtime.js'.length)
      const content = JSON.stringify(JSON.parse(await fs.readFile(file, 'utf8')))
      const hash = createHash('sha256').update(content).digest('hex').slice(0, 16)
      const fileName = `data/runtime/${path.basename(file, '.json')}.${hash}.json`
      this.emitFile({ type: 'asset', fileName, source: content })
      return `const response = await fetch(${JSON.stringify('/' + fileName)}); if (!response.ok) throw new Error('Resource data unavailable'); export default await response.json();`
    },
  }
}

export function isPublicAsset(relative) {
  const name = relative.replaceAll('\\', '/')
  if (name === 'data/discovery') return true
  if (name.startsWith('data/discovery/')) return name === 'data/discovery/scopes' || /^data\/discovery\/scopes\/[a-z-]+\.json$/.test(name)
  if (/^(?:data\/curation-review|agents\/private)(?:\/|$)/.test(name)) return false
  return !/(?:^|\/)(?:\.DS_Store|Thumbs\.db|desktop\.ini)$/.test(name)
}

// Vite normally copies all of public/, including the local capture archive.
// This explicit boundary keeps public outputs independent of local research.
export function publicAssetsPlugin() {
  let root, outDir
  return {
    name: 'vislexicon-public-assets', apply: 'build',
    configResolved(config) { root = config.root; outDir = path.resolve(root, config.build.outDir) },
    async transformIndexHtml() {
      const release = JSON.parse(await fs.readFile(path.join(root, 'public/release.json'), 'utf8'))
      return [
        { tag: 'link', attrs: { rel: 'preload', href: '/release.json', as: 'fetch', crossorigin: '' }, injectTo: 'head' },
        ...(release.endpoints.siteCards ? [{ tag: 'link', attrs: { rel: 'preload', href: release.endpoints.siteCards, as: 'fetch', crossorigin: '' }, injectTo: 'head' }] : []),
        { tag: 'link', attrs: { rel: 'preload', href: '/fonts/anthropic-sans-roman.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'preload', href: '/fonts/anthropic-serif-roman.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }, injectTo: 'head' },
      ]
    },
    async closeBundle() {
      const source = path.join(root, 'public')
      const referencedShots = new Set()
      const remember = value => {
        if (typeof value === 'string' && /^\/shots\//.test(value)) referencedShots.add(value.slice(1))
        else if (value && typeof value === 'object') Object.values(value).forEach(remember)
      }
      remember(JSON.parse(await fs.readFile(path.join(source, 'data/site-index.json'), 'utf8')))
      for (const file of await fs.readdir(path.join(source, 'data/site'))) remember(JSON.parse(await fs.readFile(path.join(source, 'data/site', file), 'utf8')))
      const shotDirs = new Set([...referencedShots].flatMap(file => { const parts = file.split('/'); return parts.map((_, i) => parts.slice(0, i + 1).join('/')) }))
      await fs.cp(source, outDir, { recursive: true, filter: file => {
        const relative = path.relative(source, file).replaceAll('\\', '/')
        if (relative.startsWith('shots/')) return shotDirs.has(relative)
        return isPublicAsset(relative)
      } })
      // Cloudflare Pages compresses on its own and counts every file against its
      // 20,000-file limit, so the Pages build skips the .br/.gz copies.
      if (process.env.VISLEXICON_PRECOMPRESS === '0') return
      for (const entry of await fs.readdir(outDir, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !/\.(?:js|css|json|html|svg|txt|md)$/.test(entry.name)) continue
        const file = path.join(entry.parentPath, entry.name)
        const bytes = await fs.readFile(file)
        if (bytes.length < 1024) continue
        await fs.writeFile(file + '.br', brotliCompressSync(bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } }))
        await fs.writeFile(file + '.gz', gzipSync(bytes))
      }
    },
  }
}

export function compressedPreviewPlugin() {
  return {
    name: 'vislexicon-compressed-preview',
    configurePreviewServer(server) {
      const dist = path.resolve(server.config.root, server.config.build.outDir)
      server.middlewares.use(async (req, res, next) => {
        if (!['GET', 'HEAD'].includes(req.method)) return next()
        let pathname
        try {
          const url = new URL(req.url, 'http://localhost')
          pathname = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)
        } catch {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end('Invalid request path')
          return
        }
        const file = path.resolve(dist, '.' + pathname)
        if (!file.startsWith(dist + path.sep)) return next()
        const encoding = /\bbr\b/.test(req.headers['accept-encoding'] || '') ? 'br' : /\bgzip\b/.test(req.headers['accept-encoding'] || '') ? 'gzip' : null
        if (!encoding) return next()
        try {
          const bytes = await fs.readFile(file + (encoding === 'br' ? '.br' : '.gz'))
          const type = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.html': 'text/html', '.svg': 'image/svg+xml', '.md': 'text/markdown', '.txt': 'text/plain' }[path.extname(file)]
          res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8`, 'Content-Encoding': encoding, Vary: 'Accept-Encoding', 'Content-Length': bytes.length,
            'Cache-Control': /\/(?:assets|data\/runtime)\/|\/site-list\.[a-f0-9]+\.json$/.test(pathname) ? 'public, max-age=31536000, immutable' : 'no-cache' })
          res.end(req.method === 'HEAD' ? undefined : bytes)
        } catch { next() }
      })
    },
  }
}
