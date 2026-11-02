import test from 'node:test'
import assert from 'node:assert/strict'
import dataviz, { ATLAS_A_TOKENS, createAtlasAChartArt } from '../src/data/effects-fx/dataviz.js'

const decodeSvg = dataUrl => decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',') + 1))

test('Atlas A tokens update multiple chart SVGs and defaults restore cleanly', () => {
  const original = createAtlasAChartArt()
  const changed = createAtlasAChartArt({ ...ATLAS_A_TOKENS, mistBlue: '#123456', axis: '#abcdef' })
  const restored = createAtlasAChartArt(ATLAS_A_TOKENS)

  for (const id of ['histogram', 'parallelSets', 'arcDiagram', 'flowChart', 'tallyChart', 'wordCloud', 'flowMap', 'networkDiagram', 'sankey', 'chordDiagram']) {
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

test('all sixteen Atlas A chart illustrations use the shared palette and transparent SVG shells', () => {
  const art = createAtlasAChartArt()
  assert.equal(Object.keys(art).length, 16)
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

test('Batch 04 chart examples keep their stated counts and visual encodings', () => {
  const arc = dataviz.items.find(item => item.id === 'arc-diagram')
  const arcSvg = decodeSvg(arc.chartSvg.en)
  assert.match(arc.chartAlt.en, /five linearly ordered nodes.*five undirected arcs/)
  assert.match(arcSvg, /co-occurrences; undirected/)
  assert.match(arcSvg, /total = 12 co-occurrences/)

  const flow = dataviz.items.find(item => item.id === 'flow-chart')
  assert.match(flow.chartAlt.en, /decision diamond.*No branch loops to the check step/)
  assert.match(decodeSvg(flow.chartSvg.en), /Add evidence/)

  const tally = dataviz.items.find(item => item.id === 'tally-chart')
  assert.match(tally.chartAlt.en, /6\/8\/4\/7/)
  assert.match(tally.chartAlt.en, /sum to 25/)

  const cloud = dataviz.items.find(item => item.id === 'word-cloud')
  assert.match(cloud.chartAlt.en, /seven terms show example mention counts/)
  assert.match(decodeSvg(cloud.chartSvg.en), /color carries no second variable/)
})

test('Batch 05 chart examples preserve spatial, network, stage and pair values', () => {
  const flowMap = dataviz.items.find(item => item.id === 'flow-map')
  assert.match(flowMap.chartAlt.en, /four schematic places.*counts 8, 6, 4 and 2/)
  assert.match(decodeSvg(flowMap.chartSvg.en), /arrows = direction/)

  const network = dataviz.items.find(item => item.id === 'network-diagram')
  assert.match(network.chartAlt.en, /six nodes form two clusters.*C–D is the only cross-cluster bridge/)
  assert.match(decodeSvg(network.chartSvg.en), /undirected · C–D bridges groups/)

  const sankey = dataviz.items.find(item => item.id === 'sankey-diagram')
  assert.match(sankey.chartAlt.en, /100 visits split into 65 continuing and 35 exiting.*40 completing and 25 leaving/)
  assert.match(decodeSvg(sankey.chartSvg.en), /band width ∝ flow · example total 100/)

  const chord = dataviz.items.find(item => item.id === 'chord-diagram')
  assert.match(chord.chartAlt.en, /four nodes lie on one circle.*8\/4\/6\/3\/2.*decorative colors/)
  assert.match(decodeSvg(chord.chartSvg.en), /A–B 8 · A–C 4 · B–C 6 · B–D 3 · C–D 2/)
  assert.match(decodeSvg(chord.chartSvg.en), /<circle cx="240" cy="162" r="78"/)
  assert.match(decodeSvg(chord.chartSvg.en), /<circle cx="240" cy="84" r="14"/)
  assert.match(decodeSvg(chord.chartSvg.en), /<circle cx="318" cy="162" r="14"/)
  assert.match(decodeSvg(chord.chartSvg.en), /color is decorative/)
  assert.match(decodeSvg(chord.chartSvg.en), /stroke-width="4\.4"/)
  assert.match(decodeSvg(chord.chartSvg.en), /stroke-width="2\.2"/)
  assert.match(decodeSvg(chord.chartSvg.en), /stroke-width="3\.3"/)
})
