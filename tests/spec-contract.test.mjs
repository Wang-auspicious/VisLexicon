import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createDesignSpec,
  parseDesignSpec,
  serializeDesignSpec,
} from '../src/lib/spec-contract.js'
import {
  addBoardItem,
  exportBoard,
  importBoard,
  removeBoardItem,
} from '../src/lib/local-board.js'

function spec(overrides = {}) {
  return createDesignSpec({
    releaseId: 'release-test',
    stageId: 'agent-composer',
    termId: 'composer',
    selection: { objectId: 'agent-composer', revision: 'revision-a', stageId: 'agent-composer', termId: 'composer', label: 'Composer' },
    source: { urls: ['https://example.test'], releaseId: 'release-test', revision: 'revision-a', rights: { license: 'unknown', sourceUrl: 'unknown', evidence: 'unknown', reuseability: 'unknown' } },
    capabilities: { required: ['auto-grow'], verified: [], toImplement: ['auto-grow'], unknown: ['streaming'] },
    parameters: { radius: { value: 14, unit: 'px' } },
    environment: { framework: 'react' },
    acceptance: [{ id: 'keyboard', statement: 'Enter behavior is checked', status: 'unknown' }],
    ...overrides,
  })
}

test('creates a rights-aware spec with unknown reuseability', () => {
  const value = spec()
  assert.equal(value.source.rights.license, 'unknown')
  assert.equal(value.source.rights.reuseability, 'unknown')
  assert.doesNotMatch(serializeDesignSpec(value), /reuseability": "allowed/u)
})

test('serialize and parse preserve selection, revision, parameters, and checks', () => {
  const value = spec()
  const roundTrip = parseDesignSpec(serializeDesignSpec(value))
  assert.deepEqual(roundTrip.selection, value.selection)
  assert.deepEqual(roundTrip.parameters, value.parameters)
  assert.deepEqual(roundTrip.acceptance, value.acceptance)
})

test('future or malformed versions are rejected', () => {
  assert.throws(() => parseDesignSpec(JSON.stringify({ schema: 'vislexicon.design-spec.v9' })), /schema/)
  assert.throws(() => createDesignSpec({ source: { rights: { license: 'unknown', reuseability: 'allowed' } } }), /reuseability/)
})

test('board add and remove are immutable and round-trip through JSON', () => {
  const first = spec()
  const board = []
  const next = addBoardItem(board, { key: 'composer:revision-a', spec: first })
  assert.deepEqual(board, [])
  assert.equal(next.length, 1)
  const imported = importBoard(exportBoard(next))
  assert.equal(imported[0].key, 'composer:revision-a')
  assert.deepEqual(removeBoardItem(imported, 'composer:revision-a'), [])
})
