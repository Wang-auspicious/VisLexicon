import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createHostState,
  isHostState,
  targetOriginForFrame,
} from '../src/lib/effects-host-protocol.js'

test('creates and validates a versioned host state', () => {
  const value = createHostState({ releaseId: 'release-test', locale: 'en', theme: 'dark', stageId: 'agent-composer', query: 'dialog' })
  assert.equal(value.protocol, 'v1')
  assert.equal(value.type, 'vislexicon.host-state')
  assert.equal(value.query, 'dialog')
  assert.equal(isHostState(value), true)
})

test('rejects wrong protocol, type, locale, and theme', () => {
  const value = createHostState({ releaseId: 'release-test' })
  assert.equal(isHostState({ ...value, protocol: 'v2' }), false)
  assert.equal(isHostState({ ...value, type: 'other' }), false)
  assert.equal(isHostState({ ...value, locale: 'fr' }), false)
  assert.equal(isHostState({ ...value, theme: 'sepia' }), false)
  assert.equal(isHostState({ ...value, query: 42 }), false)
})

test('uses the frame origin and never invents a cross-origin target', () => {
  assert.equal(targetOriginForFrame('/effects-atlas/index.html', 'https://vislexicon.test'), 'https://vislexicon.test')
  assert.equal(targetOriginForFrame('https://effects.test/atlas', 'https://vislexicon.test'), 'https://effects.test')
})

