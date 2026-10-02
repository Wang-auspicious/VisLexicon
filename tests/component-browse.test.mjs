import test from 'node:test'
import assert from 'node:assert/strict'
import { browseComponents } from '../server/discovery-browse.mjs'

const unit = (i, patch = {}) => ({ id: `unit-${String(i).padStart(3, '0')}`, scope: 'curation', kind: 'website-component', componentType: i % 2 ? 'button' : 'card', nameZh: `组件 ${i}`, nameEn: `Component ${i}`, source: { name: i % 2 ? 'Source A' : 'Source B' }, sourceUrl: `https://${i % 2 ? 'a' : 'b'}.example/demo/${i}`, previewUrl: `/shots/${i}.jpg`, tags: i % 3 ? ['blue'] : ['red'], rawObservation: { private: true }, ...patch })
const index = { scope: 'curation', generatedAt: 'v1', units: [unit(90, { kind: 'curated-site' }), unit(91, { kind: 'atlas-effect' }), ...Array.from({ length: 77 }, (_, i) => unit(76 - i))] }

test('browse reaches every published component exactly once with bounded cards', () => {
  const first = browseComponents(index)
  assert.equal(first.allCount, 77)
  assert.equal(first.total, 77)
  assert.equal(first.pages, 4)
  assert.equal(first.units.length, 24)
  const all = Array.from({ length: first.pages }, (_, i) => browseComponents(index, { page: i + 1 }).units).flat()
  assert.equal(new Set(all.map(item => item.id)).size, 77)
  assert.ok(all.every(item => item.kind === 'website-component' && !('rawObservation' in item)))
  assert.deepEqual(all.map(item => item.id), all.map(item => item.id).sort())
  assert.equal(browseComponents(index, { page: 999 }).page, 4)
})

test('source, type and local text filters intersect without semantic ranking', () => {
  const result = browseComponents(index, { source: 'a.example', type: 'button', q: 'red' })
  assert.equal(result.total, index.units.filter(item => item.kind === 'website-component' && item.componentType === 'button' && item.tags.includes('red')).length)
  assert.ok(result.units.every(item => item.sourceUrl.startsWith('https://a.example/')))
  assert.equal(browseComponents(index, { source: 'a.example', type: 'card' }).total, 0)
  assert.equal(browseComponents(index, { q: '组件 1' }).total, 11)
  assert.equal(result.sources.reduce((n, source) => n + source.count, 0), 77)
  assert.equal(result.types.reduce((n, type) => n + type.count, 0), 77)
})

test('browse rejects invalid pages and other scopes', () => {
  for (const params of [{ page: -1 }, { page: 1.5 }, { limit: 10000 }, { limit: 0 }, { q: 'x'.repeat(201) }]) assert.throws(() => browseComponents(index, params), /INVALID_PAGE/)
  assert.throws(() => browseComponents({ ...index, scope: 'atlas' }), /INVALID_SCOPE/)
})
