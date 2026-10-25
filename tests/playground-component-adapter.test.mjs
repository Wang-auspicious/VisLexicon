import test from 'node:test'
import assert from 'node:assert/strict'
import { addComponentToPlayground, composeWithSourceComponents, loadPlaygroundComponents, verifiedComponentPreview } from '../src/lib/playground-component-adapter.js'

const item = { id: 'seed-example', title: { en: 'Example', zh: '示例' }, sourceUrl: 'https://example.com/component', commit: 'fixed-source-commit', license: { spdx: 'MIT', url: 'https://example.com/LICENSE' }, preview: { status: 'verified', url: '/component-bench/?solo=example' }, controls: [
  { key: 'radius', kind: 'slider', min: 0, max: 20, default: 4 },
  { key: 'text', kind: 'text', default: 'Original' },
  { key: 'enabled', kind: 'toggle', default: true },
] }
function memoryStorage(initial) { const rows = new Map(Object.entries(initial ?? {})); return { getItem: key => rows.get(key) ?? null, setItem: (key, value) => rows.set(key, value) } }
const unit = { id: item.id, nameZh: '示例', nameEn: 'Example', codeResource: { detailUrl: `/data/component-code/items/${item.id}.json` } }

test('adding a verified component preserves the existing canvas and current typed values', () => {
  const storage = memoryStorage({ 'vl-playground-v1': JSON.stringify({ title: 'Existing user canvas', parts: [{ id: 'native1', unitId: 'switch', values: {}, x: 10, y: 20 }] }) })
  const part = addComponentToPlayground({ item, unit, values: { radius: 11, text: '<actual text>', enabled: false } }, storage)
  const canvas = JSON.parse(storage.getItem('vl-playground-v1'))
  assert.equal(canvas.title, 'Existing user canvas'); assert.equal(canvas.parts[0].unitId, 'switch')
  assert.deepEqual(part.values, { radius: 11, text: '<actual text>', enabled: false })
  assert.equal(part.component.license.url, item.license.url); assert.equal(part.component.commit, item.commit)
  canvas.parts[1].x = 40; canvas.parts[1].note = 'User note'; storage.setItem('vl-playground-v1', JSON.stringify(canvas))
  const updated = addComponentToPlayground({ item, unit, values: { radius: 15, text: 'Updated', enabled: true } }, storage)
  assert.equal(updated.id, part.id); assert.equal(updated.x, 40); assert.equal(updated.note, 'User note')
  assert.equal(JSON.parse(storage.getItem('vl-playground-v1')).parts.length, 2)
})

test('unverified, executable URLs and failed writes cannot report a successful add', () => {
  for (const preview of [{ status: 'failed', url: '/component-bench/?solo=example' }, { status: 'verified', url: 'javascript:alert(1)' }, { status: 'verified', url: '//other.test/widget' }]) {
    assert.equal(verifiedComponentPreview({ ...item, preview }), null)
    assert.throws(() => addComponentToPlayground({ item: { ...item, preview }, unit, values: {} }, memoryStorage()))
  }
  const bad = memoryStorage({ 'vl-playground-v1': 'user malformed data' })
  assert.throws(() => addComponentToPlayground({ item, unit, values: {} }, bad)); assert.equal(bad.getItem('vl-playground-v1'), 'user malformed data')
  assert.throws(() => addComponentToPlayground({ item, unit, values: {} }, { getItem: () => null, setItem: () => { throw Error('Quota exceeded') } }))
})

test('saved source parts reload once per identity and export actual params, source and license', async () => {
  const storage = memoryStorage(), part = addComponentToPlayground({ item, unit, values: { radius: 12, text: 'Current text', enabled: false } }, storage)
  let reads = 0
  const sources = await loadPlaygroundComponents([part, { ...part, id: 'duplicate' }], async url => { reads++; assert.equal(url, part.component.detailUrl); return item })
  assert.equal(reads, 1); assert.deepEqual(Object.keys(sources), [`source:${item.id}`])
  const compose = args => ({ parts: args.parts, references: [], prompt: { zh: '原画布', en: 'Original canvas' } })
  const result = composeWithSourceComponents(compose, sources, { parts: [{ unitId: 'switch', values: {} }, { ...part, frame: { x: 520, y: 320 } }] })
  assert.equal(result.parts[0].unitId, 'switch')
  assert.deepEqual(result.parts[1].values, part.values); assert.equal(result.parts[1].source.license.url, item.license.url)
  assert.match(result.prompt.en, /Current text/); assert.match(result.prompt.en, /fixed-source-commit/)
  assert.equal(result.references[0].url, item.sourceUrl)
})

test('a missing archived source remains a removable identifiable part with no executable renderer', async () => {
  const part = addComponentToPlayground({ item, unit, values: {} }, memoryStorage())
  const sources = await loadPlaygroundComponents([part], async () => { throw Error('unavailable') })
  const source = sources[part.unitId]
  assert.equal(source.en, 'Example'); assert.equal(source.source.url, item.sourceUrl)
  assert.equal(source.complete(part.values).radius, part.values.radius)
  assert.equal(source.complete(part.values).text, part.values.text)
  assert.match(source.prompt({}, 'en'), /Original source/)
})
