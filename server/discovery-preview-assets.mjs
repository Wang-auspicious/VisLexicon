import fs from 'node:fs/promises'
import path from 'node:path'
import { discoveryDataFile } from './discovery-index.mjs'

// Local production preview keeps the full capture archive outside dist.
// Only indexed image files are available, under the API's loopback boundary.
export function discoveryPreviewAssets({ root, loadIndex, isLocalRequest }) {
  let revision, allowed = new Set()
  return async (req, res, next) => {
    const pathname = String(req.url || '').split('?')[0]
    if (!pathname.startsWith('/data/discovery/v4/shots/')) return next()
    const reject = status => { res.writeHead(status, { 'Cache-Control': 'no-store' }); res.end() }
    if (!isLocalRequest(req)) return reject(403)
    if (!['GET', 'HEAD'].includes(req.method)) return reject(405)
    if (!/^\/data\/discovery\/v4\/shots\/[a-zA-Z0-9._-]+\.(?:jpe?g|png|webp)$/.test(pathname)) return reject(404)
    try {
      const index = await loadIndex()
      if (revision !== index.generatedAt) {
        allowed = new Set(index.units.filter(unit => unit.kind === 'website-component').map(unit => unit.previewUrl))
        revision = index.generatedAt
      }
      if (!allowed.has(pathname)) return reject(404)
      const selected = await discoveryDataFile(root, pathname.slice('/data/discovery/'.length))
      const [workspace, shots, file] = await Promise.all([fs.realpath(root), fs.realpath(path.dirname(selected)), fs.realpath(selected)])
      const relative = path.relative(workspace, shots)
      if (relative.startsWith('..') || path.isAbsolute(relative) || path.dirname(file) !== shots) return reject(404)
      const bytes = await fs.readFile(file)
      const contentType = /\.png$/.test(file) ? 'image/png' : /\.webp$/.test(file) ? 'image/webp' : 'image/jpeg'
      res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': bytes.length, 'Cache-Control': 'private, max-age=60', 'X-Content-Type-Options': 'nosniff' })
      res.end(req.method === 'HEAD' ? undefined : bytes)
    } catch { reject(404) }
  }
}
