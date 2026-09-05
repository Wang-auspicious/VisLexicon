import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ENTRIES } from '../src/entries.js'
import { endpointFor } from '../src/lib/endpoints.js'

test('every entry has a deterministic static endpoint', () => {
  for (const entry of ENTRIES) assert.equal(endpointFor(entry.id), `/lexicon/${entry.id}.json`)
})

test('the endpoint generator never reads a missing entry.endpoint field', () => {
  const source = readFileSync(new URL('../scripts/gen-endpoints.mjs', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /e\.endpoint/)
})
