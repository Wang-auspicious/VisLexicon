import test from 'node:test'
import assert from 'node:assert/strict'
import { ATLAS_A_TOKENS, createAtlasAChartArt } from '../src/data/effects-fx/dataviz.js'

const decodeSvg = dataUrl => decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',') + 1))

test('Atlas A token changes update distinct published charts and defaults restore', () => {
  const original = createAtlasAChartArt()
  const changed = createAtlasAChartArt({ ...ATLAS_A_TOKENS, blue: '#123456', axis: '#abcdef' })
  const restored = createAtlasAChartArt(ATLAS_A_TOKENS)
  for (const id of ['histogram', 'errorBars']) {
    const before = decodeSvg(original[id].en)
    const after = decodeSvg(changed[id].en)
    assert.match(before, /--blue:#4d8ba6/)
    assert.match(after, /--blue:#123456/)
    assert.match(after, /--axis:#abcdef/)
    assert.equal(decodeSvg(restored[id].en), before)
  }
  assert.equal(ATLAS_A_TOKENS.blue, '#4d8ba6')
  assert.ok(Object.isFrozen(ATLAS_A_TOKENS))
})

test('four currently published chart illustrations use shared tokens and transparent shells', () => {
  const art = createAtlasAChartArt()
  assert.deepEqual(Object.keys(art), ['histogram', 'density', 'matrix', 'errorBars'])
  for (const [id, languages] of Object.entries(art)) for (const value of Object.values(languages)) {
    const svg = decodeSvg(value)
    assert.match(svg, /--blue:#4d8ba6/, id)
    assert.doesNotMatch(svg, /<rect\s+width="480"\s+height="300"/, id)
  }
})
