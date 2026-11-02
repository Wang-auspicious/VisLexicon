import test from 'node:test'
import assert from 'node:assert/strict'
import dataviz, { ATLAS_A_TOKENS, createAtlasAChartArt } from '../src/data/effects-fx/dataviz.js'

const decodeSvg = dataUrl => decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',') + 1))

test('Atlas A tokens update multiple chart SVGs and defaults restore cleanly', () => {
  const original = createAtlasAChartArt()
  const changed = createAtlasAChartArt({ ...ATLAS_A_TOKENS, mistBlue: '#123456', axis: '#abcdef' })
  const restored = createAtlasAChartArt(ATLAS_A_TOKENS)

  for (const id of ['histogram', 'parallelSets']) {
    const before = decodeSvg(original[id].en)
    const after = decodeSvg(changed[id].en)
    assert.match(before, /--mistBlue:#BFDDF4/)
    assert.match(after, /--mistBlue:#123456/)
    assert.match(after, /--axis:#abcdef/)
    assert.equal(decodeSvg(restored[id].en), before)
    assert.equal((after.match(/<svg\b/g) || []).length, 1)
    assert.doesNotMatch(after, /<rect\s+width="480"\s+height="300"/)
  }

  assert.equal(ATLAS_A_TOKENS.mistBlue, '#BFDDF4')
  assert.ok(Object.isFrozen(ATLAS_A_TOKENS))
})

test('all eight Atlas A chart illustrations use the shared palette and transparent SVG shells', () => {
  const art = createAtlasAChartArt()
  assert.equal(Object.keys(art).length, 8)
  for (const [id, languages] of Object.entries(art)) {
    for (const svgUrl of Object.values(languages)) {
      const svg = decodeSvg(svgUrl)
      assert.match(svg, /--mistBlue:#BFDDF4/, id)
      assert.match(svg, /--crystalPink:#F2CBDD/, id)
      assert.match(svg, /--lakeGreen:#C5E2D7/, id)
      assert.match(svg, /--marbleWhite:#F6F7F5/, id)
      assert.doesNotMatch(svg, /--(?:amber|orange)|#d08a55|#c27c4e|#d27669|#bd6c82|#b96b80/, id)
      assert.doesNotMatch(svg, /<rect\s+width="480"\s+height="300"/, id)
    }
  }
})

test('revised Pyramid and Venn examples show their documented regions and order', () => {
  const pyramid = dataviz.items.find(item => item.id === 'population-pyramid')
  const pyramidSvg = decodeSvg(pyramid.chartSvg.en)
  assert.ok(pyramidSvg.indexOf('60+') < pyramidSvg.indexOf('0–14'))
  assert.match(pyramid.chartAlt.en, /oldest 60\+ group at the top.*youngest 0–14 group at the bottom/)

  const venn = dataviz.items.find(item => item.id === 'venn-diagram')
  const vennSvg = decodeSvg(venn.chartSvg.en)
  assert.match(vennSvg, /<rect x="88" y="60" width="332" height="234"/)
  assert.match(vennSvg, /<text x="390" y="248"[^>]*>h<\/text>/)
  assert.match(vennSvg, /in U, outside A\/B\/C/)
  assert.match(venn.chartAlt.en, /h inside U but outside all three sets/)

  const stem = dataviz.items.find(item => item.id === 'stem-and-leaf-plot')
  assert.equal(stem.en, 'Stem & Leaf Plot')
})
