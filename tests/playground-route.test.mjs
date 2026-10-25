import test from 'node:test'
import assert from 'node:assert/strict'
import { parseRoute } from '../src/router.js'

test('the component Add destination opens Playground and preserves the selected part', () => {
  const route = parseRoute('#/playground?focus=source-123')
  assert.equal(route.name, 'playground')
  assert.equal(route.query.focus, 'source-123')
  assert.equal(parseRoute('#/components').name, 'components')
  assert.equal(parseRoute('#/favorites').name, 'favorites')
})
