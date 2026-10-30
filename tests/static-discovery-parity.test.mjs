// The static production search must return what the local server returns.
// Browse and summaries are exact. The slim index keeps English prose as
// de-duplicated words, so lexical order may shift slightly: top results must overlap.
// Needs local data: run scripts/build-static-search.mjs first.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadDiscoveryIndex } from '../server/discovery-index.mjs'
import { createDiscoveryHandler, createIndexContexts } from '../server/discovery-handler.mjs'
import { createStaticDiscoveryApi } from '../src/lib/static-discovery-api.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const STATIC = path.join(ROOT, 'data/static-search')
const ready = fs.existsSync(path.join(STATIC, 'manifest.json'))
// A deploy build points media at the R2 origin; compare against local paths.
const mediaOrigin = ready ? JSON.parse(fs.readFileSync(path.join(STATIC, 'manifest.json'), 'utf8')).mediaOrigin || '' : ''
const local = (value) => JSON.parse(mediaOrigin ? JSON.stringify(value).replaceAll(mediaOrigin, '') : JSON.stringify(value))

// Deterministic stand-in for Jev: score by position so ordering is checkable.
const fakeRanker = async (_query, candidates) => ({ mode: 'jev', rows: candidates.map(({ unit }, i) => ({ id: unit.id, score: i % 4 === 3 ? 0 : 3 - (i % 3) * 0.5, confidence: 1 })) })

const diskFetch = async (url, init) => {
  const { pathname } = new URL(String(url), 'http://localhost')
  if (pathname === '/api/rank') {
    const { query, candidates } = JSON.parse(init.body)
    return new Response(JSON.stringify(await fakeRanker(query, candidates.map((unit) => ({ unit })))), { status: 200 })
  }
  const file = path.join(STATIC, decodeURIComponent(pathname.replace(/^\/search-data\//, '')))
  return fs.existsSync(file) ? new Response(fs.readFileSync(file), { status: 200 }) : new Response('{}', { status: 404 })
}

const post = (pathname, body) => ({ method: 'POST', pathname, body: JSON.stringify(body), contentType: 'application/json' })
const QUERIES = [
  ['curation', '蓝色描边按钮'], ['curation', 'glass card with soft shadow'], ['curation', '免费开源的日期选择器'],
  ['curation', '登录页表单'], ['atlas', '弹簧回弹'], ['skills', '极简海报生图'],
]

test('static search matches the local server for prepare, search, page and browse', { skip: !ready && 'build static search first' }, async () => {
  const server = createDiscoveryHandler({ getIndex: createIndexContexts((scope) => loadDiscoveryIndex(ROOT, scope, '')), ranker: fakeRanker })
  const staticFetch = createStaticDiscoveryApi({ fetchImpl: diskFetch })
  const viaStatic = async (request) => {
    const url = new URL(request.pathname + (request.query ? `?${request.query}` : ''), 'http://localhost')
    const response = await staticFetch(url.href, { method: request.method, body: request.body, headers: { 'Content-Type': request.contentType || '' } })
    return { status: response.status, body: await response.json() }
  }
  const ids = (body) => (body.units || []).map((unit) => unit.id)
  const overlap = (a, b, k) => { const head = new Set(a.slice(0, k)); return b.slice(0, k).filter((id) => head.has(id)).length / Math.max(1, Math.min(k, a.length)) }
  for (const [scope, query] of QUERIES) {
    for (const route of ['/api/discovery/prepare', '/api/discovery/search']) {
      const request = post(route, { query, scope, theme: '', limit: 24 })
      const [a, b] = [await server(request), await viaStatic(request)]
      assert.equal(b.status, a.status, `${route} ${query}`)
      assert.equal(b.body.eligibleCount, a.body.eligibleCount, `${route} ${query} eligible`)
      assert.ok(overlap(ids(a.body), ids(b.body), 12) >= (route.endsWith('prepare') ? 0.9 : 0.75), `${route} ${query} top-12 overlap`)
      // Cards from the slim index are hydrated back to the full projection.
      const serverCards = new Map(a.body.units.map((unit) => [unit.id, unit]))
      for (const card of b.body.units.filter((unit) => serverCards.has(unit.id))) assert.deepEqual(local({ ...card, matchStatus: null }), local({ ...serverCards.get(card.id), matchStatus: null }))
      const page = { method: 'GET', pathname: '/api/discovery/page', query: new URLSearchParams({ scope, theme: '', offset: '12', limit: '12', token: b.body.refineToken }).toString() }
      const serverPage = await server({ ...page, params: new URLSearchParams({ scope, theme: '', offset: '12', limit: '12', token: a.body.refineToken }) })
      const staticPage = await viaStatic(page)
      assert.equal(staticPage.body.total, serverPage.body.total, `${route} ${query} page total`)
      assert.ok(overlap(ids(serverPage.body), ids(staticPage.body), 12) >= 0.5, `${route} ${query} page 2 overlap`)
    }
  }
  const browse = new URLSearchParams({ type: 'button', page: '3' })
  const [a, b] = [await server({ method: 'GET', pathname: '/api/discovery/browse', params: browse }), await viaStatic({ method: 'GET', pathname: '/api/discovery/browse', query: browse.toString() })]
  assert.equal(b.body.total, a.body.total)
  assert.deepEqual(b.body.units.map((unit) => unit.id), a.body.units.map((unit) => unit.id))
  assert.deepEqual(local(b.body.units[0]), local(a.body.units[0]))
  const [sa, sb] = [await server({ method: 'GET', pathname: '/api/discovery/index', params: new URLSearchParams('scope=curation&summary=1') }), await viaStatic({ method: 'GET', pathname: '/api/discovery/index', query: 'scope=curation&summary=1' })]
  assert.deepEqual(sb.body.themeMeta, sa.body.themeMeta)
})
