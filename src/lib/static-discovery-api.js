// Production builds have no Node server. This answers /api/discovery/* in the
// browser by running the same handler as the local middleware over the static
// files from scripts/build-static-search.mjs. Only AI ranking leaves the page:
// it goes to the Cloudflare function at /api/rank, which holds the model key.
import { createDiscoveryHandler, createIndexContexts } from '../../server/discovery-handler.mjs'
import { STATIC_SEARCH_BASE, unitFileName } from './static-search-paths.js'

// Fields compactCandidate (server/jev-rank-core.mjs) reads; the rank function
// rebuilds and truncates the prompt itself, so nothing else needs to travel.
const RANK_FIELDS = ['id', 'kind', 'componentType', 'nameZh', 'nameEn', 'prompt', 'descriptionZh', 'tags', 'tagFacets', 'offers', 'visual', 'interaction', 'unknowns']

export function createStaticDiscoveryApi({ fetchImpl = globalThis.fetch.bind(globalThis), base = STATIC_SEARCH_BASE, rankUrl = '/api/rank' } = {}) {
  const json = async (url) => {
    const response = await fetchImpl(url)
    if (!response.ok) throw new Error('INDEX_UNAVAILABLE')
    return response.json()
  }
  let manifest = null
  const slimIds = new Set()
  const loader = async (scope) => {
    manifest ??= json(`${base}/manifest.json`).catch((error) => { manifest = null; throw error })
    const entry = (await manifest).scopes?.[scope]
    if (!entry) throw new Error('INVALID_SCOPE')
    const index = await json(`${base}/${entry.file}`)
    // Large scopes are split into parts (Pages caps files at 25 MiB); fetched in parallel.
    if (index.unitParts) index.units = (await Promise.all(index.unitParts.map((file) => json(`${base}/${file}`)))).flatMap((part) => part.units)
    if (index.slimUnits) for (const unit of index.units) slimIds.add(unit.id)
    return index
  }
  const cards = new Map()
  const hydrate = (list) => Promise.all(list.map(async (card) => {
    if (!slimIds.has(card.id)) return card
    const cardsBase = (await manifest).cardsBase || `${base}/u`
    if (!cards.has(card.id)) cards.set(card.id, json(`${cardsBase}/${unitFileName(card.id)}`).catch((error) => { cards.delete(card.id); throw error }))
    const full = await cards.get(card.id)
    return card.matchStatus ? { ...full, matchStatus: card.matchStatus } : full
  }))
  const ranker = async (query, candidates, { signal } = {}) => {
    const response = await fetchImpl(rankUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
      body: JSON.stringify({ query, candidates: candidates.map(({ unit }) => Object.fromEntries(RANK_FIELDS.filter((key) => unit[key] !== undefined).map((key) => [key, unit[key]]))) }),
    })
    const data = await response.json().catch(() => ({}))
    // Any upstream failure (bad key, model down) reads as RANK_*, so the handler
    // keeps the first-pass results instead of failing the search.
    if (!response.ok) throw new Error(/^RANK_/.test(data.error) ? data.error : 'RANK_UNAVAILABLE')
    return data
  }
  const getIndex = createIndexContexts(loader)
  const handle = createDiscoveryHandler({ getIndex, ranker, hydrate, statusReader: async () => ({ mode: 'static', rankUrl }) })

  async function staticFetch(input, init = {}) {
    const request = input instanceof Request ? input : null
    const url = new URL(request ? request.url : String(input), globalThis.location?.origin || 'http://localhost')
    const signal = init.signal || request?.signal
    const method = (init.method || request?.method || 'GET').toUpperCase()
    const body = init.body !== undefined ? String(init.body) : request && method !== 'GET' ? await request.text() : ''
    const headers = new Headers(init.headers || request?.headers)
    const result = await handle({ method, pathname: url.pathname, params: url.searchParams, body, contentType: headers.get('content-type') || '', signal, closed: () => Boolean(signal?.aborted) })
    if (!result) throw new DOMException('The operation was aborted.', 'AbortError')
    return new Response(JSON.stringify(result.body), { status: result.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
  // Start downloading the component index before the first query is typed.
  staticFetch.warm = () => getIndex('curation').catch(() => {})
  return staticFetch
}

// Route only /api/discovery/* through the static handler; everything else,
// including /api/rank and /api/submit, still goes to the network.
export function installStaticDiscoveryApi() {
  const network = globalThis.fetch.bind(globalThis)
  const local = createStaticDiscoveryApi({ fetchImpl: network })
  // The component index is the largest download: fetch it once someone reaches for search.
  const warm = (event) => {
    if (!event.target?.matches?.('input[type=search], [role=combobox], [role=searchbox]')) return
    globalThis.document.removeEventListener('focusin', warm)
    local.warm()
  }
  globalThis.document?.addEventListener('focusin', warm)
  globalThis.fetch = (input, init) => {
    const raw = input instanceof Request ? input.url : String(input)
    const pathname = new URL(raw, globalThis.location.origin).pathname
    return pathname.startsWith('/api/discovery/') ? local(input, init) : network(input, init)
  }
}
