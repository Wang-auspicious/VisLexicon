import test from 'node:test'
import assert from 'node:assert/strict'

const { upsertBoard, removeBoard, normalizeStoredState } = await import('../src/lib/store-core.js')

test('upsertBoard updates an existing item instead of removing it', () => {
  const board = [
    { id: 'glassmorphism', params: { blur: 12 } },
    { id: 'masonry', params: { columns: 3 } },
  ]

  const next = upsertBoard(board, 'glassmorphism', { blur: 24 })

  assert.deepEqual(next, [
    { id: 'glassmorphism', params: { blur: 24 } },
    { id: 'masonry', params: { columns: 3 } },
  ])
})

test('board operations do not mutate their inputs', () => {
  const params = { blur: 12 }
  const board = [{ id: 'glassmorphism', params }]
  const before = structuredClone(board)

  const updated = upsertBoard(board, 'glassmorphism', { blur: 24 })
  const removed = removeBoard(board, 'glassmorphism')

  assert.deepEqual(board, before)
  assert.notStrictEqual(updated, board)
  assert.notStrictEqual(updated[0].params, params)
  assert.notStrictEqual(removed, board)
  assert.deepEqual(removed, [])
})

test('normalizeStoredState falls back for malformed JSON and unsupported themes', () => {
  assert.deepEqual(normalizeStoredState('{not json', 'sepia'), {
    board: [],
    theme: 'light',
  })
})

test('normalizeStoredState removes bad records and collapses duplicate ids', () => {
  const storedBoard = JSON.stringify([
    null,
    { id: '', params: { blur: 1 } },
    { id: 'glassmorphism', params: { blur: 12 } },
    { id: 42, params: {} },
    { id: 'masonry', params: 'bad params' },
    { id: 'glassmorphism', params: { blur: 24 } },
    { id: 'terminal' },
  ])

  assert.deepEqual(normalizeStoredState(storedBoard, 'dark'), {
    board: [
      { id: 'glassmorphism', params: { blur: 24 } },
      { id: 'masonry', params: {} },
      { id: 'terminal', params: {} },
    ],
    theme: 'dark',
  })
})

