import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const colorDiff = await import('../src/lib/color-diff.js').catch(() => ({}))
const { deltaE2000, rgbToLab, summarizeDiff } = colorDiff

test('identical Lab colors have zero CIEDE2000 difference', () => {
  assert.equal(typeof deltaE2000, 'function', 'deltaE2000 must be exported')
  assert.equal(deltaE2000([42, -8, 17], [42, -8, 17]), 0)
})

test('CIEDE2000 matches the Sharma reference pair', () => {
  assert.equal(typeof deltaE2000, 'function', 'deltaE2000 must be exported')
  const actual = deltaE2000(
    [50, 2.6772, -79.7751],
    [50, 0, -82.7485],
  )
  assert.ok(Math.abs(actual - 2.0425) < 1e-4, `expected 2.0425, received ${actual}`)
})

test('sRGB black and white convert to plausible D65 Lab values', () => {
  assert.equal(typeof rgbToLab, 'function', 'rgbToLab must be exported')
  const black = rgbToLab([0, 0, 0])
  const white = rgbToLab([255, 255, 255])

  assert.ok(Math.abs(black[0]) < 1e-10)
  assert.ok(Math.abs(black[1]) < 1e-10)
  assert.ok(Math.abs(black[2]) < 1e-10)
  assert.ok(Math.abs(white[0] - 100) < 1e-3)
  assert.ok(Math.abs(white[1]) < 0.02)
  assert.ok(Math.abs(white[2]) < 0.02)
})

test('summarizeDiff reports statistics and descending hotspots', () => {
  assert.equal(typeof summarizeDiff, 'function', 'summarizeDiff must be exported')
  const cells = [
    { i: 0, d: 2 },
    { i: 1, d: 20 },
    { i: 2, d: 10 },
    { i: 3, d: 40 },
    { i: 4, d: 30 },
  ]

  const summary = summarizeDiff(cells, 15)

  assert.equal(summary.mean, 20.4)
  assert.equal(summary.p95, 40)
  assert.equal(summary.max, 40)
  assert.deepEqual(summary.hotspots.map(({ i, d }) => ({ i, d })), [
    { i: 3, d: 40 },
    { i: 4, d: 30 },
    { i: 1, d: 20 },
  ])
})

test('Diff tool is wired to CIEDE2000 metrics and flat hotspot instructions', () => {
  const source = readFileSync(new URL('../src/views/Tools.jsx', import.meta.url), 'utf8')

  assert.match(source, /import \{ deltaE2000, rgbToLab, summarizeDiff \} from '\.\.\/lib\/color-diff\.js'/)
  assert.doesNotMatch(source, /const deltaE =/)
  assert.match(source, /summary\.p95/)
  assert.match(source, /summary\.max/)
  assert.doesNotMatch(source, /\.\.\.\[hotCells\.slice/)
  assert.match(source, /\.\.\.hotCells\.slice\(0, 5\)\.map/)
})

test('Extractor recovers from decode failures and releases every preview Blob URL', () => {
  const source = readFileSync(new URL('../src/views/Tools.jsx', import.meta.url), 'utf8')
  const extractor = source.slice(
    source.indexOf('function Extractor()'),
    source.indexOf('/* ============ 工具二：Diff 描述器 ============ */'),
  )

  assert.match(extractor, /const previewUrlRef = useRef\(null\)/)
  assert.match(extractor, /const loadRequestRef = useRef\(0\)/)
  assert.match(extractor, /useEffect\(\(\) => \(\) => \{[\s\S]*URL\.revokeObjectURL\(url\)[\s\S]*\}, \[\]\)/)
  assert.match(extractor, /const previousUrl = previewUrlRef\.current[\s\S]*URL\.revokeObjectURL\(previousUrl\)/)
  assert.match(extractor, /catch \{[\s\S]*setState\('error'\)[\s\S]*setError\(/)
  assert.match(extractor, /state === 'error'/)
  assert.match(extractor, /ev\.target\.value = ''/)
})
