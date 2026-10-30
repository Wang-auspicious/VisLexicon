import test from 'node:test'
import assert from 'node:assert/strict'
import { onRequestPost } from '../functions/api/submit.js'

const ORIGIN = 'https://vislexicon.com'
function setup(envExtra = {}) {
  const kv = new Map()
  const env = { SUBMISSIONS: { get: async (k) => kv.get(k)?.value ?? null, put: async (k, value, options) => { kv.set(k, { value, options }) } }, SUBMIT_DAILY_PER_IP: '2', ...envExtra }
  const call = (body, headers = {}) => onRequestPost({ request: new Request(`${ORIGIN}/api/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.9', ...headers }, body: JSON.stringify(body) }), env })
  const submissions = () => [...kv].filter(([k]) => k.startsWith('sub:')).map(([, v]) => JSON.parse(v.value))
  return { call, kv, submissions }
}

test('a valid submission is stored without the IP address', async () => {
  const { call, kv, submissions } = setup()
  const response = await call({ url: 'https://example.com/ui', kind: 'components', note: '组件很全', name: 'Ann', email: 'ann@example.com' })
  assert.equal(response.status, 200)
  const [saved] = submissions()
  assert.equal(saved.url, 'https://example.com/ui')
  assert.equal(saved.kind, 'components')
  assert.equal(saved.status, 'new')
  assert.ok(![...kv].some(([k, v]) => k.includes('203.0.113.9') || v.value.includes('203.0.113.9')))
})

test('bad input, bots, other origins and repeat senders are refused', async () => {
  const { call, submissions } = setup()
  assert.equal((await (await call({ url: 'not a url' })).json()).error, 'INVALID_URL')
  assert.equal((await (await call({ url: 'javascript:alert(1)' })).json()).error, 'INVALID_URL')
  assert.equal((await (await call({ url: 'https://a.com', email: 'nope' })).json()).error, 'INVALID_EMAIL')
  assert.equal((await call({ url: 'https://a.com' }, { Origin: 'https://evil.example' })).status, 403)
  assert.equal((await call({ url: 'https://bot.com', website: 'spam' })).status, 200)
  assert.equal(submissions().length, 0)
  await call({ url: 'https://one.com' })
  await call({ url: 'https://two.com' })
  assert.equal((await (await call({ url: 'https://three.com' })).json()).error, 'SUBMIT_RATE_LIMITED')
  assert.equal(submissions().length, 2)
})

test('without storage the endpoint says it is unavailable', async () => {
  const response = await onRequestPost({ request: new Request(`${ORIGIN}/api/submit`, { method: 'POST', body: '{}' }), env: {} })
  assert.equal((await response.json()).error, 'SUBMIT_UNAVAILABLE')
})
