import test from 'node:test'
import assert from 'node:assert/strict'
import { onRequestPost } from '../functions/api/rank.js'

const ORIGIN = 'https://vislexicon.com'
const unit = (id) => ({ id, kind: 'website-component', componentType: 'button', nameZh: `按钮 ${id}`, tags: ['button'], descriptionZh: '蓝色描边按钮' })

function setup({ kvCount = 0, limiterOk = true } = {}) {
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push(String(url))
    const request = JSON.parse(init.body)
    const answers = Object.fromEntries(Object.keys(request.questions).map((id, i) => [id, { type: 'score', score: i % 4 }]))
    return new Response(JSON.stringify({ model: 'jev-1.13-free', answers, cost: 0 }), { status: 200 })
  }
  const store = new Map()
  globalThis.caches = { default: { match: async (r) => store.get(r.url)?.clone(), put: async (r, res) => { store.set(r.url, res) } } }
  const kv = new Map([[`rank:${new Date().toISOString().slice(0, 10)}`, String(kvCount)]])
  const env = { JEV_API_KEY: 'test-key', RANK_DAILY_LIMIT: '2', RANK_KV: { get: async (k) => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v) } }, RANK_LIMITER: { limit: async () => ({ success: limiterOk }) } }
  const pending = []
  const call = (body, headers = {}) => onRequestPost({ request: new Request(`${ORIGIN}/api/rank`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }), env, waitUntil: (p) => pending.push(p) })
  return { call, calls, kv, settle: () => Promise.all(pending) }
}

test('rank function scores candidates and returns only ids and scores', async () => {
  const { call, calls, settle } = setup()
  const response = await call({ query: '蓝色描边按钮', candidates: [unit('a'), unit('b'), unit('c')] })
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.deepEqual(body.rows.map((row) => [row.id, row.score]), [['a', 0], ['b', 1], ['c', 2]])
  assert.deepEqual(Object.keys(body).sort(), ['cost', 'costStatus', 'latencyMs', 'mode', 'model', 'provider', 'rows'])
  assert.equal(calls.length, 1)
  await settle()
  // An identical request is served from cache without another model call.
  const again = await call({ query: '蓝色描边按钮', candidates: [unit('a'), unit('b'), unit('c')] })
  assert.equal(again.headers.get('X-Rank-Cache'), 'hit')
  assert.equal(calls.length, 1)
})

test('rank function rejects bad input, other origins and spent quotas', async () => {
  const { call } = setup()
  assert.equal((await call({ query: '', candidates: [unit('a')] })).status, 400)
  assert.equal((await call({ query: 'x', candidates: [{ id: 'a' }] })).status, 400)
  assert.equal((await call({ query: 'x', candidates: Array.from({ length: 61 }, (_, i) => unit(String(i))) })).status, 400)
  assert.equal((await call({ query: 'x', candidates: [unit('a')] }, { Origin: 'https://evil.example' })).status, 403)
  const spent = setup({ kvCount: 2 })
  const daily = await spent.call({ query: 'new query', candidates: [unit('a')] })
  assert.equal(daily.status, 429)
  assert.equal((await daily.json()).error, 'RANK_DAILY_LIMIT')
  assert.equal(spent.calls.length, 0)
  const limited = setup({ limiterOk: false })
  assert.equal((await (await limited.call({ query: 'other', candidates: [unit('a')] })).json()).error, 'RANK_RATE_LIMITED')
})

test('rank function counts model searches against the daily cap', async () => {
  const { call, kv, settle } = setup()
  await call({ query: 'first', candidates: [unit('a')] })
  await settle()
  assert.equal(kv.get(`rank:${new Date().toISOString().slice(0, 10)}`), '1')
})
