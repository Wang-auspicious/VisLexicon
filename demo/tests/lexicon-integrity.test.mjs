import test from 'node:test'
import assert from 'node:assert/strict'
import { ENTRIES } from '../src/entries.js'
import { buildLexiconOrder, familyNameFor, describeComparison } from '../src/lib/lexicon-integrity.js'
import { autopsyProfileFor } from '../src/lib/autopsy-profile.js'

test('every lexicon entry resolves to a visible family name exactly once', () => {
  const order = buildLexiconOrder()
  assert.equal(order.length, ENTRIES.length)
  assert.equal(new Set(order.map((entry) => entry.id)).size, ENTRIES.length)
  for (const entry of ENTRIES) assert.notEqual(familyNameFor(entry), 'undefined')
  for (const entry of order) assert.ok(entry.famName && entry.famName !== 'undefined')
})

test('comparison copy is derived from actual shared and unique parameters', () => {
  const a = { id: 'a', axis: 'motion', params: [{ k: 'duration', def: 300 }, { k: 'delay', def: 0 }] }
  const b = { id: 'b', axis: 'motion', params: [{ k: 'duration', def: 300 }, { k: 'stiffness', def: 120 }] }
  const result = describeComparison(a, b, { duration: 420 }, { duration: 300 })
  assert.match(result, /duration/)
  assert.match(result, /delay/)
  assert.match(result, /stiffness/)
})

test('autopsy profiles vary by entry implementation and expose non-applicable timing honestly', () => {
  const staticEntry = { id: 'grid', axis: 'layout', notation: 'G[grid]', code: 'display:grid', params: [], genes: [] }
  const motionEntry = {
    id: 'fade', axis: 'motion', notation: 'M[fade] · opacity:0→1', code: 'animation:fade 600ms ease',
    params: [{ k: 'duration', def: 600 }], genes: [{ g: 'opacity', v: '0→1' }],
  }
  assert.equal(autopsyProfileFor(staticEntry, {}).easing, null)
  assert.equal(autopsyProfileFor(staticEntry, {}).render, '布局计算（Grid）')
  assert.equal(autopsyProfileFor(motionEntry, {}).durationMs, 600)
  assert.match(autopsyProfileFor(motionEntry, {}).trajectory, /opacity/)
})
