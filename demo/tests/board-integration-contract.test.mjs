import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const compare = readFileSync(new URL('../src/views/Compare.jsx', import.meta.url), 'utf8')
const keyView = readFileSync(new URL('../src/views/KeyView.jsx', import.meta.url), 'utf8')

test('Compare subscribes to the board snapshot before deriving button state', () => {
  assert.match(compare, /useStore\(\)/)
  assert.match(compare, /board\.some\(/)
  assert.doesNotMatch(compare, /\binBoard\(/)
})

test('KeyView subscribes to the board snapshot and preserves an existing item', () => {
  assert.match(keyView, /useStore\(\)/)
  assert.match(keyView, /board\.find\(/)
  assert.match(keyView, /disabled=\{Boolean\(boardItem\)\}/)
  assert.doesNotMatch(keyView, /saveBoardItem\(result\.id,\s*\{\}\)/)
  assert.doesNotMatch(keyView, /\binBoard\(/)
})

