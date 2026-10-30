// Cloudflare Pages Function: POST /api/rank — AI re-ranking for the public site.
//
// The model key lives only here (secret JEV_API_KEY). The function is not a
// general model proxy: it accepts a query plus catalogue candidates, builds the
// fixed scoring prompt itself (server/jev-rank-core.mjs) and returns numeric
// scores per candidate id, nothing else.
//
// Settings (Pages → Settings → Variables and Secrets / Bindings):
//   JEV_API_KEY        secret, required
//   JEV_MODEL          default jev-1.13-free
//   JEV_ALLOW_COST     "1" when the account is paid (otherwise a non-zero cost is refused)
//   RANK_DAILY_LIMIT   default 300 model searches per day, site-wide
//   RANK_KV            KV binding: holds the daily counter (no binding = no daily cap)
//   RANK_LIMITER       Rate Limiting binding keyed by client IP (no binding = no per-IP cap)
import { rankWithClient } from '../../server/jev-rank-core.mjs'
import { FREE_MODEL, JEV_ENDPOINT, failure, readResponse, systemOnePayload, validateResponse } from '../../server/jev-protocol.mjs'
import { fnvDigest } from '../../server/fnv-digest.mjs'

const MAX_BODY = 256 * 1024
const MAX_CANDIDATES = 60
const json = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } })

function jevClient(env) {
  const config = { provider: 'opencode', model: env.JEV_MODEL || FREE_MODEL, allowCost: env.JEV_ALLOW_COST === '1' }
  return {
    provider: config.provider,
    model: config.model,
    payload: (request) => systemOnePayload(request, config.model, config.provider),
    async decide(request, { signal } = {}) {
      const body = systemOnePayload(request, config.model, config.provider)
      const bounded = signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000)
      const response = await fetch(env.JEV_ENDPOINT || JEV_ENDPOINT, { method: 'POST', signal: bounded, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.JEV_API_KEY}` }, body })
      if (!response.ok) {
        const detail = [400, 413, 422].includes(response.status) ? await response.text() : (await response.body?.cancel(), '')
        if (/max_tokens_exceeded|context_length_exceeded|request_too_large|over the [\d,]+-token limit|total question-row work exceeds [\d,]+ tokens/iu.test(detail)) throw failure('JEV_REQUEST_TOO_LARGE')
        throw failure(response.status === 429 ? 'MODEL_BUSY' : `JEV_HTTP_${response.status}`)
      }
      return validateResponse(await readResponse(response), request, config)
    },
  }
}

const validCandidate = (unit) => unit && typeof unit === 'object' && typeof unit.id === 'string' && unit.id.length > 0 && unit.id.length <= 240
  && typeof unit.nameZh === 'string' && (unit.tags === undefined || Array.isArray(unit.tags))

export async function onRequestPost({ request, env, waitUntil }) {
  if (!env.JEV_API_KEY) return json(503, { error: 'RANK_UNAVAILABLE' })
  // Same-origin pages only. (Not a security boundary on its own; the limits below are.)
  const origin = request.headers.get('Origin')
  if (origin && origin !== new URL(request.url).origin) return json(403, { error: 'FORBIDDEN_ORIGIN' })
  if (!String(request.headers.get('Content-Type')).startsWith('application/json')) return json(415, { error: 'JSON_REQUIRED' })
  const text = await request.text()
  if (text.length > MAX_BODY) return json(413, { error: 'REQUEST_TOO_LARGE' })
  let query, candidates
  try { ({ query, candidates } = JSON.parse(text)) } catch { return json(400, { error: 'INVALID_JSON' }) }
  if (typeof query !== 'string' || !query.trim() || query.length > 1500) return json(400, { error: 'QUERY_LENGTH' })
  if (!Array.isArray(candidates) || !candidates.length || candidates.length > MAX_CANDIDATES || !candidates.every(validCandidate)) return json(400, { error: 'INVALID_CANDIDATES' })
  const rows = candidates.map((unit) => ({ unit: { ...unit, tags: unit.tags || [] } }))

  // Identical requests are answered from the edge cache for a day.
  const cacheKey = new Request(`${new URL(request.url).origin}/api/rank-cache/${fnvDigest(JSON.stringify({ query: query.trim(), rows }))}`)
  const cache = caches.default
  const hit = await cache.match(cacheKey)
  if (hit) return new Response(hit.body, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Rank-Cache': 'hit' } })

  if (env.RANK_LIMITER) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const { success } = await env.RANK_LIMITER.limit({ key: ip })
    if (!success) return json(429, { error: 'RANK_RATE_LIMITED' })
  }
  let counterKey = null, used = 0
  if (env.RANK_KV) {
    counterKey = `rank:${new Date().toISOString().slice(0, 10)}`
    used = Number(await env.RANK_KV.get(counterKey)) || 0
    if (used >= Number(env.RANK_DAILY_LIMIT || 300)) return json(429, { error: 'RANK_DAILY_LIMIT' })
  }

  try {
    const result = await rankWithClient(query.trim(), rows, jevClient(env), { signal: request.signal })
    const body = JSON.stringify({ mode: result.mode, provider: result.provider, model: result.model, rows: result.rows, latencyMs: result.latencyMs, cost: result.cost, costStatus: result.costStatus })
    // KV is eventually consistent, so the cap is approximate; that is acceptable for a spend guard.
    if (counterKey) waitUntil(env.RANK_KV.put(counterKey, String(used + 1), { expirationTtl: 3 * 86400 }))
    waitUntil(cache.put(cacheKey, new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } })))
    return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } })
  } catch (error) {
    const code = /^(JEV_HTTP_\d+|JEV_REQUEST_TOO_LARGE_FOR_ONE_CANDIDATE|MODEL_BUSY|FREE_MODEL_COST_CHANGED|UNEXPECTED_MODEL|INVALID_MODEL_SCORE|INVALID_MODEL_RESPONSE|JEV_REQUEST_TOO_LARGE)$/.test(error.message) ? error.message : 'RANK_UNAVAILABLE'
    return json(code === 'MODEL_BUSY' ? 429 : 503, { error: code })
  }
}
