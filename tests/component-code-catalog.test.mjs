import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
const catalogModule = fs.existsSync(new URL('../../component-bench/src/lib/remote-catalog.js', import.meta.url)) ? new URL('../../component-bench/src/lib/remote-catalog.js', import.meta.url) : new URL('../component-bench/src/lib/remote-catalog.js', import.meta.url)
const { availabilityOf, categoryFor, mergeCatalog, normalizeRemoteEntry, readCatalogShards } = await import(catalogModule)

test('unverified previews never enter the executable frame or expose controls', () => {
  const item = normalizeRemoteEntry({ id: 'button', name: 'Button', sourceName: 'Example', sourceUrl: 'https://example.com/r/button.json', registryUrl: 'https://example.com/r/button.json', previewUrl: '/unverified.html', controls: [{ key: 'value', default: 5 }], preview: { status: 'failed' }, license: { spdx: 'MIT' } })
  assert.equal(item.previewUrl, null)
  assert.deepEqual(item.controls, [])
  assert.equal(item.source.page, 'https://example.com/r/button.json')
  assert.equal(item.category, 'button')
})

test('verified source records preserve source, license, prop types and preview image', () => {
  const item = normalizeRemoteEntry({ id: 'counter', name: 'Counter', sourceName: 'Example', sourceUrl: 'https://example.com/r/counter.json', license: { spdx: 'MIT', text: 'Copyright Example', url: 'https://example.com/LICENSE' }, preview: { status: 'verified', url: '/data/component-code/previews/counter/index.html', posterUrl: '/data/component-code/previews/counter/poster.png', controls: [{ key: 'count', prop: 'count', type: 'number', kind: 'slider', default: 10, min: 0, max: 100 }] }, files: [{ path: 'counter.tsx', content: 'export const Counter = () => null' }] })
  assert.equal(item.previewUrl, '/data/component-code/previews/counter/index.html')
  assert.equal(item.poster, '/data/component-code/previews/counter/poster.png')
  assert.equal(item.controls[0].prop, 'count')
  assert.equal(item.licenseRecord.text, 'Copyright Example')
  assert.equal(item.files[0].content, 'export const Counter = () => null')
})

test('catalog merge keeps seed examples and stable source identities', () => {
  const seed = [{ id: 'demo' }]
  const merged = mergeCatalog(seed, { entries: [{ id: 'demo' }, { id: 'registry-a', name: 'A' }, { id: 'registry-a', name: 'A again' }, { id: 'registry-b', name: 'B' }] })
  assert.deepEqual(merged.map(e => e.id), ['demo', 'registry-a', 'registry-b'])
  assert.deepEqual(mergeCatalog(seed, { items: [{ id: 'c' }] }).map(e => e.id), ['demo', 'c'])
})

test('source URLs reject executable and protocol-relative schemes', () => {
  const item = normalizeRemoteEntry({ id: 'a', sourceUrl: 'javascript:alert(1)', preview: { status: 'verified', url: '//untrusted.test/frame' } })
  assert.equal(item.source.page, null)
  assert.equal(item.previewUrl, null)
})

test('registry support files stay distinct from page sections in the browsing taxonomy', () => {
  assert.equal(categoryFor({ name: 'button-demo', type: 'registry:example' }), 'button')
  assert.equal(categoryFor({ name: 'dashboard', type: 'registry:block' }), 'section')
})

test('reference-only records stay outside the default usable shelf', () => {
  assert.equal(availabilityOf(normalizeRemoteEntry({ id: 'reference', status: 'reference-only', name: 'Button' })), 'reference')
  assert.equal(availabilityOf(normalizeRemoteEntry({ id: 'source', status: 'source-ready', name: 'Button' })), 'source')
})

test('progressive catalog fetch verifies each batch and retains successful batches on partial failure', async () => {
  const originalFetch = globalThis.fetch
  let inFlight = 0, maxInFlight = 0
  const a = JSON.stringify([{ id: 'a' }]), b = JSON.stringify([{ id: 'b' }])
  const manifest = { total: 4, items: [{ id: 'seed' }], shards: [
    { url: '/data/component-code/catalog/00001.json', count: 1, sha256: createHash('sha256').update(a).digest('hex') },
    { url: '/data/component-code/catalog/00002.json', count: 1, sha256: createHash('sha256').update(b).digest('hex') },
    { url: '/data/component-code/catalog/00003.json', count: 1, sha256: '0'.repeat(64) },
  ] }
  globalThis.fetch = async url => {
    inFlight++; maxInFlight = Math.max(maxInFlight, inFlight)
    await new Promise(resolve => setTimeout(resolve, 1)); inFlight--
    return new Response(url.includes('00001') ? a : b)
  }
  try {
    const chunks = [], progress = []
    const result = await readCatalogShards(manifest, { onChunk: rows => chunks.push(...rows), onProgress: state => progress.push(state) })
    assert.equal(maxInFlight, 2)
    assert.deepEqual(chunks.map(row => row.id).sort(), ['a', 'b'])
    assert.equal(result.loaded, 3)
    assert.equal(result.total, 4)
    assert.equal(result.failed.length, 1)
    assert.equal(result.failed[0].error, 'CATALOG_SHARD_DIGEST_MISMATCH')
    assert.equal(progress.at(-1).failed, 1)
  } finally { globalThis.fetch = originalFetch }
})
