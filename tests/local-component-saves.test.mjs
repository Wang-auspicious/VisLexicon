import test from 'node:test'
import assert from 'node:assert/strict'
import { readComponentSaves, toggleComponentSave } from '../src/lib/local-component-saves.js'

test('legacy IDs survive saving a source component; stored rows stay small and can be removed', () => {
  let text = JSON.stringify(['v4-existing', 'v4-existing'])
  const storage = { getItem: () => text, setItem: (_, value) => { text = value } }
  const unit = { id: 'seed-flow-canvas', nameZh: '流程图', previewUrl: '/component-bench/posters/flow-canvas.webp', files: [{ content: 'large source' }], codeResource: { detailUrl: '/data/component-code/items/seed-flow-canvas.json' } }
  assert.equal(toggleComponentSave(unit, storage), true)
  assert.deepEqual(readComponentSaves(storage).map(row => row.id), ['seed-flow-canvas', 'v4-existing'])
  assert.equal(readComponentSaves(storage)[0].nameZh, '流程图')
  assert.equal(text.includes('large source'), false)
  assert.equal(toggleComponentSave(unit, storage), false)
  assert.deepEqual(readComponentSaves(storage), [{ id: 'v4-existing' }])
})

test('a storage error propagates instead of reporting a successful save', () => {
  const storage = { getItem: () => '[]', setItem: () => { throw Error('quota') } }
  assert.throws(() => toggleComponentSave({ id: 'seed-number-ticker' }, storage), /quota/)
})
