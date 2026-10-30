#!/usr/bin/env node
/**
 * Local stand-in for the Cloudflare deployment, to check dist-cf/ before uploading.
 *
 *   node scripts/preview-cloudflare.mjs   site on :5175, "media.vislexicon.com" on :5176
 *
 * Site (Pages rules): /x serves x.html, unknown paths fall back to index.html,
 * /api/rank and /api/submit run the real functions/ handlers (local Jev key,
 * in-memory KV and edge cache). Media (R2): /data/discovery/* from
 * data/discovery/local-public, /search-data/u/* from data/static-search/u, with CORS.
 * References to the production media origin are rewritten to the local one.
 */
import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { onRequestPost as rank } from '../functions/api/rank.js'
import { onRequestPost as submit } from '../functions/api/submit.js'
import { localCredential } from '../server/jev-provider.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist-cf')
const SITE_PORT = 5175, MEDIA_PORT = 5176
const PROD_MEDIA = 'https://media.vislexicon.com', LOCAL_MEDIA = `http://127.0.0.1:${MEDIA_PORT}`
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.zip': 'application/zip' }

const memoryKv = () => { const map = new Map(); return { get: async (k) => map.get(k) ?? null, put: async (k, v) => { map.set(k, v) } } }
const edgeCache = new Map()
globalThis.caches ??= { default: { match: async (req) => edgeCache.get(req.url)?.clone(), put: async (req, res) => { edgeCache.set(req.url, res) } } }
const env = { JEV_API_KEY: await localCredential().catch(() => ''), RANK_KV: memoryKv(), SUBMISSIONS: memoryKv() }

async function readFile(file) { try { return await fs.readFile(file) } catch { return null } }
function send(res, status, body, type, extra = {}) { res.writeHead(status, { 'Content-Type': type, ...extra }); res.end(body) }

async function api(req, res, handler) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const request = new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers: req.headers, body: Buffer.concat(chunks) })
  const response = await handler({ request, env, waitUntil: (p) => p.catch(() => {}) })
  send(res, response.status, Buffer.from(await response.arrayBuffer()), response.headers.get('Content-Type') || 'application/json', { 'X-Rank-Cache': response.headers.get('X-Rank-Cache') || '' })
}

http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  if (req.method === 'POST' && pathname === '/api/rank') return api(req, res, rank)
  if (req.method === 'POST' && pathname === '/api/submit') return api(req, res, submit)
  const clean = decodeURIComponent(pathname)
  const candidates = clean.endsWith('/') ? [clean + 'index.html'] : [clean, clean + '.html']
  for (const candidate of candidates) {
    const file = path.join(DIST, candidate)
    if (!file.startsWith(DIST)) break
    let bytes = await readFile(file)
    if (!bytes) continue
    if (candidate.startsWith('/search-data/')) bytes = Buffer.from(bytes.toString('utf8').replaceAll(PROD_MEDIA, LOCAL_MEDIA))
    return send(res, 200, bytes, TYPES[path.extname(file)] || 'application/octet-stream')
  }
  if (clean.startsWith('/api/')) return send(res, 404, '{"error":"NOT_FOUND"}', 'application/json')
  send(res, 200, await fs.readFile(path.join(DIST, 'index.html')), TYPES['.html'])
}).listen(SITE_PORT, '127.0.0.1')

http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  const clean = decodeURIComponent(pathname)
  const file = clean.startsWith('/data/discovery/') ? path.join(ROOT, 'data/discovery/local-public', clean.slice('/data/discovery/'.length))
    : clean.startsWith('/search-data/u/') ? path.join(ROOT, 'data/static-search/u', clean.slice('/search-data/u/'.length)) : null
  const bytes = file && await readFile(file)
  if (!bytes) return send(res, 404, 'not found', 'text/plain', { 'Access-Control-Allow-Origin': '*' })
  send(res, 200, file.endsWith('.json') ? Buffer.from(bytes.toString('utf8').replaceAll(PROD_MEDIA, LOCAL_MEDIA)) : bytes, TYPES[path.extname(file)] || 'application/octet-stream', { 'Access-Control-Allow-Origin': '*' })
}).listen(MEDIA_PORT, '127.0.0.1')

console.log(`[preview-cloudflare] site http://127.0.0.1:${SITE_PORT}  media ${LOCAL_MEDIA}  rank key ${env.JEV_API_KEY ? 'found' : 'missing (search stays preliminary)'}`)
