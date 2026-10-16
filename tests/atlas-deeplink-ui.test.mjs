import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const html = await fs.readFile(new URL('../public/effects-atlas/index.html', import.meta.url), 'utf8')

test('effects host reads deep-link query and resolves a known category item', () => {
  assert.match(html, /hostParams\.get\('stageId'\)/)
  assert.match(html, /hostParams\.get\('termId'\)/)
  assert.match(html, /hostParams\.get\('q'\)/)
  assert.match(html, /stageCategory = \(stageId\) =>/)
  assert.match(html, /resolveTerm = \(termId, cat\) =>/)
  assert.match(html, /return exact \|\| null/)
  assert.doesNotMatch(html, /tokens\.reduce\(/)
  assert.match(html, /setState\(\{ lang \}, applyHostDeepLink\)/)
  assert.match(html, /mode: 'detail'/)
  assert.match(html, /const query = String\(this\._hostQuery/)
})

test('effects host exposes a visible localized deep-link error instead of a blank stage', () => {
  assert.match(html, /deepLinkError/)
  assert.match(html, /gridOn: !s\.deepLinkError/)
  assert.match(html, /wallEmpty: !!mod && pool === 0/)
  assert.match(html, /emptyLabel: s\.deepLinkError \|\| t\.empty/)
  assert.match(html, /这个术语在当前舞台中没有可用演示/)
  assert.match(html, /This atlas term is not available in the selected stage/)
})
