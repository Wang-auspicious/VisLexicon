import { strict as assert } from 'node:assert'
import test from 'node:test'
import { progressiveWindow, RESOURCE_PAGE_SIZE } from '../src/lib/progressive-list.js'

test('resource gallery mounts a bounded first window', () => {
  const source = Array.from({ length: 882 }, (_, index) => ({ id: index }))
  const first = progressiveWindow(source)
  assert.equal(RESOURCE_PAGE_SIZE, 48)
  assert.equal(first.items.length, 48)
  assert.equal(first.items[0].id, 0)
  assert.equal(first.items.at(-1).id, 47)
  assert.equal(first.hasMore, true)
  assert.equal(first.nextLimit, 96)
})

test('resource gallery grows by one window without mutating source', () => {
  const source = Array.from({ length: 50 }, (_, index) => index)
  const second = progressiveWindow(source, 48 + RESOURCE_PAGE_SIZE)
  assert.deepEqual(second.items, source)
  assert.equal(second.hasMore, false)
  assert.equal(second.nextLimit, 50)
  assert.equal(source.length, 50)
})
