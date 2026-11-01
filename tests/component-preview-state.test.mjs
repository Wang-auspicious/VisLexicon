import test from 'node:test'
import assert from 'node:assert/strict'
import { guardLegacyScreenshot, isScreenshotPreview } from '../src/lib/component-preview-state.js'

test('contradictory v4 metadata cannot assert a source or license', () => {
  const original = { id: 'v4-example', offers: [{ verified: true, sourceAvailable: true, license: 'MIT' }], codeResource: { previewStatus: 'verified', previewUrl: null, sourceAvailable: true, license: 'MIT', controls: [{ key: 'fake' }] } }
  const safe = guardLegacyScreenshot(original)
  assert.deepEqual(safe.offers, [])
  assert.equal(safe.codeResource.previewStatus, 'screenshot')
  assert.equal(safe.codeResource.sourceAvailable, false)
  assert.equal(safe.codeResource.license, null)
  assert.deepEqual(safe.codeResource.controls, [])
  assert.equal(original.offers.length, 1)
  assert.equal(original.codeResource.sourceAvailable, true)
})

test('verified live and honest source-only entries keep their source facts', () => {
  for (const unit of [
    { id: 'v4-valid', codeResource: { previewStatus: 'verified', previewUrl: '/data/component-code/previews/valid/index.html', sourceAvailable: true } },
    { id: 'v4-source', codeResource: { previewStatus: 'unverified', previewUrl: null, sourceAvailable: true } },
    { id: 'registry-source', codeResource: { previewStatus: 'verified', previewUrl: null, sourceAvailable: true } },
  ]) assert.equal(guardLegacyScreenshot(unit), unit)
})

test('detail follows explicit screenshot status despite conflicting source flags', () => {
  const item = { lane: 'registry', preview: { status: 'screenshot' }, files: [{ content: 'unrelated' }] }
  const unit = { previewKind: 'image', codeResource: { sourceAvailable: true } }
  assert.equal(isScreenshotPreview(item, unit, null), true)
  assert.equal(isScreenshotPreview({ lane: 'screenshot', preview: { status: 'verified' } }, unit, '/component-bench/?solo=example'), false)
  assert.equal(isScreenshotPreview({ preview: { status: 'unverified' } }, unit, null), false)
})

test('legacy slim indexes cannot use unverifiable source offers as positive filters', () => {
  const unit = { id: 'v4-slim', offers: [{ verified: true, sourceAvailable: true }], codeResource: { sourceId: 'example' } }
  const safe = guardLegacyScreenshot(unit)
  assert.deepEqual(safe.offers, [])
  assert.equal(safe.codeResource.previewStatus, 'unverified')
  assert.equal(safe.codeResource.sourceAvailable, false)
  assert.equal(unit.offers.length, 1)
})

test('static slim index and hydrated card both suppress contradictory source claims', async () => {
  const { createStaticDiscoveryApi } = await import('../src/lib/static-discovery-api.js')
  const slim = { id: 'v4-slim', scope: 'curation', kind: 'website-component', componentType: 'button', nameZh: '按钮', nameEn: 'Button', tags: ['button'], sourceUrl: 'https://example.test/button', source: { name: 'Example' }, codeResource: { sourceId: 'example' }, offers: [{ verified: true, sourceAvailable: true, license: 'MIT' }] }
  const full = { ...slim, codeResource: { sourceId: 'example', previewStatus: 'verified', previewUrl: null, sourceAvailable: true, license: 'MIT' } }
  const docs = {
    '/search-data/manifest.json': { scopes: { curation: { file: 'curation.json' } } },
    '/search-data/curation.json': { scope: 'curation', theme: '', themes: [], generatedAt: 'test', slimUnits: true, units: [slim] },
    '/search-data/u/v4-slim.json': full,
  }
  const api = createStaticDiscoveryApi({ fetchImpl: async url => {
    const pathname = new URL(String(url), 'http://localhost').pathname
    return new Response(JSON.stringify(docs[pathname] ?? {}), { status: docs[pathname] ? 200 : 404 })
  } })
  const response = await api('http://localhost/api/discovery/browse')
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.total, 1)
  assert.deepEqual(body.units[0].offers, [])
  assert.equal(body.units[0].codeResource.previewStatus, 'screenshot')
  assert.equal(body.units[0].codeResource.sourceAvailable, false)
})
