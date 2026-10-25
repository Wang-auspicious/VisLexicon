import test from 'node:test'
import assert from 'node:assert/strict'
import { createComponentDetailCache } from '../src/lib/component-code-details.js'
const url = id => `/data/component-code/items/${id}.json`
const response = value => ({ ok: true, text: async () => JSON.stringify(value) })
test('deep links and repeated effects share one in-flight detail and fulfilled result', async () => {
  let calls = 0, release
  const cache = createComponentDetailCache({ fetcher: () => { calls++; return new Promise(resolve => { release = resolve }) } })
  const a = cache.read(url('a')), b = cache.read(url('a'))
  assert.equal(calls, 1); assert.equal(a, b)
  release(response({ id: 'a' })); assert.equal((await a).id, 'a')
  await cache.read(url('a')); assert.equal(calls, 1)
})
test('failed requests retry; fulfilled entries are evicted to a finite memory budget', async () => {
  let calls = 0
  const cache = createComponentDetailCache({ maxEntries: 2, maxBytes: 1000, fetcher: async () => { calls++; if (calls === 1) throw Error('offline'); return response({ text: 'x'.repeat(100) }) } })
  await assert.rejects(cache.read(url('a')), /offline/)
  await cache.read(url('a')); await cache.read(url('b')); await cache.read(url('c'))
  assert.equal(cache.stats().entries, 2); assert.ok(cache.stats().bytes < 1000)
  await assert.rejects(cache.read('https://example.com/private'), /INVALID_COMPONENT_DETAIL_URL/)
})
