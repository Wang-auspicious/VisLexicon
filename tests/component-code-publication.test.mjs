import test from 'node:test'
import assert from 'node:assert/strict'
import { previewFor, summarize, classifyResource } from '../scripts/ingest-v6/publish.mjs'

test('a revoked source grant never inherits an old verified preview', () => {
  const proof = { id: 'one', status: 'verified', buildDigest: 'same', url: '/preview' }
  assert.notEqual(previewFor({ id: 'one', status: 'reference-only', license: { redistributable: false } }, new Map([['one', proof]]), new Map([['one', proof]])).status, 'verified')
  assert.equal(previewFor({ id: 'one', status: 'source-ready', license: { redistributable: true } }, new Map([['one', proof]]), new Map([['one', { ...proof, buildDigest: 'changed' }]])).status, 'unverified')
})

test('metadata projection does not preload complete source or license text', () => {
  const item = summarize({ id: 'one', rawDigest: 'private', sourcePath: 'private', description: { zh: '文'.repeat(2000) }, files: [{ path: 'a.tsx', content: 'x'.repeat(8000) }], license: { spdx: 'MIT', text: 'notice'.repeat(1000) }, preview: { status: 'verified', url: '/preview', controls: new Array(100).fill({}) } })
  assert.equal(item.files, undefined); assert.equal(item.rawDigest, undefined); assert.equal(item.sourcePath, undefined)
  assert.equal(item.license.text, undefined); assert.equal(item.description.zh.length, 180); assert.equal(item.codeExcerpt.length, 500)
  assert.equal(item.preview.controls, undefined)
})

test('classification targets the content unit and preserves bilingual query terms', () => {
  const value = classifyResource({ name: 'date-picker', type: 'registry:ui', framework: 'react', tags: ['calendar'] })
  assert.equal(value.category, 'input'); assert.ok(value.tags.includes('输入')); assert.ok(value.tags.includes('calendar'))
})
