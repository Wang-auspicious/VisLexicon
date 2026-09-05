import assert from 'node:assert/strict'
import test from 'node:test'

const css = await import('../src/lib/mining-extractor/css-metrics.js')
const dom = await import('../src/lib/mining-extractor/dom-metrics.js')
const extractor = await import('../src/lib/mining-extractor/index.js')
const analyzer = await import('@projectwallace/css-analyzer')

const {
  colorChroma,
  contrastRatio,
  cssMetricsFromAnalysis,
  isOvershootTimingFunction,
  isSerifFamily,
  parseColor,
  parseDurationSeconds,
  parseLengthPx,
  relativeLuminance,
} = css
const { PROBE_CONTRACT_VERSION, domMetricsFromProbe, mergeProbeReadings } = dom
const probeModule = await import('../src/lib/mining-extractor/browser-probe.js')
const { probeExpression } = probeModule
const { extractMetrics, mergeMetricTiers, tagDecidability } = extractor

/* -------------------------------------------------------------------------- */
/* 解析原语                                                                    */
/* -------------------------------------------------------------------------- */

test('durations parse in both s and ms, and nothing else', () => {
  assert.equal(parseDurationSeconds('.5s'), 0.5)
  assert.equal(parseDurationSeconds('300ms'), 0.3)
  assert.equal(parseDurationSeconds('0'), null)
  assert.equal(parseDurationSeconds('var(--d)'), null)
})

test('lengths convert to px only for units with a fixed ratio', () => {
  assert.equal(parseLengthPx('0'), 0)
  assert.equal(parseLengthPx('16px'), 16)
  assert.equal(parseLengthPx('1rem'), 16)
  assert.equal(parseLengthPx('12pt'), 16)
  assert.equal(parseLengthPx('5vw'), null)
  assert.equal(parseLengthPx('clamp(1rem, 2vw, 3rem)'), null)
})

test('overshoot easing is detected by control points leaving 0..1', () => {
  assert.equal(isOvershootTimingFunction('cubic-bezier(0.52,0.01,0,1)'), false)
  assert.equal(isOvershootTimingFunction('cubic-bezier(0.34,1.56,0.64,1)'), true)
  assert.equal(isOvershootTimingFunction('spring(1, 80, 10, 0)'), true)
  assert.equal(isOvershootTimingFunction('ease-in-out'), false)
})

test('colors parse across hex, rgb, hsl and a small named set', () => {
  assert.deepEqual(parseColor('#101010'), { rgb: [16, 16, 16], alpha: 1 })
  assert.deepEqual(parseColor('#fff'), { rgb: [255, 255, 255], alpha: 1 })
  assert.deepEqual(parseColor('rgb(16, 16, 16)'), { rgb: [16, 16, 16], alpha: 1 })
  assert.deepEqual(parseColor('rgba(0,0,0,0.5)'), { rgb: [0, 0, 0], alpha: 0.5 })
  assert.deepEqual(parseColor('hsl(0, 100%, 50%)'), { rgb: [255, 0, 0], alpha: 1 })
  assert.equal(parseColor('transparent'), null)
  assert.equal(parseColor('var(--brand)'), null)
})

test('modern oklch colours parse, because Tailwind v4 emits them by default', () => {
  assert.deepEqual(parseColor('oklch(1 0 0)'), { rgb: [255, 255, 255], alpha: 1 })
  assert.deepEqual(parseColor('oklch(0 0 0)'), { rgb: [0, 0, 0], alpha: 1 })
  assert.deepEqual(parseColor('oklch(0.628 0.2577 29.23)'), { rgb: [255, 0, 0], alpha: 1 })
  assert.equal(parseColor('oklch(0.5 0.2 180 / 0.5)').alpha, 0.5)
  // 分量里有变量或需要求值的函数时，静态层求不出，必须判不可解析。
  assert.equal(parseColor('oklch(var(--l) 0.1 200)'), null)
  assert.equal(parseColor('color-mix(in oklch, red, blue)'), null)
})

test('CIE lab and lch parse, because Chromium serialises computed colours that way', () => {
  // 真实抓取里 shadcn 的 computed background 回传的就是 lab(2.75381 0 0)。
  assert.deepEqual(parseColor('lab(100 0 0)'), { rgb: [255, 255, 255], alpha: 1 })
  assert.deepEqual(parseColor('lab(0 0 0)'), { rgb: [0, 0, 0], alpha: 1 })
  assert.deepEqual(parseColor('lab(54.29 80.8 69.89)'), { rgb: [255, 0, 0], alpha: 1 })
  assert.deepEqual(parseColor('lch(54.29 106.84 40.85)'), { rgb: [255, 0, 0], alpha: 1 })
  assert.equal(parseColor('lab(2.75381 0 0)').rgb[0], 10)
  assert.equal(parseColor('lab(var(--l) 0 0)'), null)
})

test('easing hidden behind custom properties is not reported as a dominant curve', () => {
  // 这是 shadcn 上真实抓到的形态：缓动写在 transition-timing-function 长写属性里，值是自定义属性。
  const framework = [
    ...Array.from({ length: 9 }, (unused, index) => (
      `.t${index}{transition-timing-function:var(--tw-ease,var(--default-transition-timing-function))}`
    )),
    '.real{transition-timing-function:ease-out}',
  ].join('')
  const { metrics, notes } = cssMetricsFromAnalysis(analyze(framework))
  assert.ok(!Object.hasOwn(metrics, 'dominantEasing'))
  assert.ok(!Object.hasOwn(metrics, 'dominantEasingShare'))
  assert.ok(notes.some((note) => note.includes('easing parse coverage')))
})

test('near-white and near-black count as neutral, not as colour', () => {
  // HSL saturation would score #fffdf9 near 1.0 and call this site chromatic.
  assert.ok(colorChroma([255, 253, 249]) < 0.05)
  assert.ok(colorChroma([16, 16, 16]) < 0.05)
  assert.ok(colorChroma([255, 42, 42]) > 0.8)
  assert.ok(colorChroma([111, 135, 156]) > 0.15)
})

test('luminance and contrast follow the WCAG formula', () => {
  assert.equal(relativeLuminance([255, 255, 255]), 1)
  assert.equal(relativeLuminance([0, 0, 0]), 0)
  assert.equal(Math.round(contrastRatio([255, 255, 255], [0, 0, 0])), 21)
  assert.ok(contrastRatio([255, 253, 249], [16, 16, 16]) > 15)
})

test('sans-serif families are not mistaken for serif ones', () => {
  assert.equal(isSerifFamily('Georgia, serif'), true)
  assert.equal(isSerifFamily('Neue Montreal, sans-serif'), false)
  assert.equal(isSerifFamily('Inter'), false)
})

/* -------------------------------------------------------------------------- */
/* Tier 1：静态 CSS                                                            */
/* -------------------------------------------------------------------------- */

// 用真实的 css-analyzer 跑真实的 CSS，避免夹具与上游 schema 漂移。
function analyze(cssText) {
  return analyzer.analyze(cssText)
}

const RESTRAINED_CSS = `
  .a { transition: opacity .5s cubic-bezier(0.52,0.01,0,1); }
  .b { transition: transform .5s cubic-bezier(0.52,0.01,0,1); }
  .c { transition: color .5s cubic-bezier(0.52,0.01,0,1); }
  .d { transition: border-color .3s ease; }
  .e { color: #fffdf9; background: #101010; border-color: #403f3f; }
  h1 { font-family: 'Neue Montreal', sans-serif; font-size: 136px; }
  h2 { font-size: 56px; }
  p  { font-size: 20px; }
  small { font-size: 15px; }
  .card { border-radius: 15px; }
  .btn  { border-radius: 0; }
`

test('the css tier reads motion character straight out of declaration counts', () => {
  const { metrics } = cssMetricsFromAnalysis(analyze(RESTRAINED_CSS))
  assert.equal(metrics.motionDeclarations, 4)
  assert.equal(metrics.durationFamilies, 2)
  assert.equal(metrics.medianDuration, 0.5)
  assert.equal(metrics.dominantEasing, 'cubic-bezier(0.52,0.01,0,1)')
  assert.equal(metrics.dominantEasingShare, 0.75)
  assert.equal(metrics.hasSpringOrBounce, false)
})

test('the css tier counts colors and grades chroma', () => {
  const { metrics } = cssMetricsFromAnalysis(analyze(RESTRAINED_CSS))
  assert.equal(metrics.uniqueColors, 3)
  assert.equal(metrics.chromaticColors, 0)
  assert.equal(metrics.gradientDeclarations, 0)
})

test('the css tier derives the type scale and its discipline', () => {
  const { metrics } = cssMetricsFromAnalysis(analyze(RESTRAINED_CSS))
  assert.equal(metrics.typeSizeCount, 4)
  assert.ok(Math.abs(metrics.maxMinSizeRatio - (136 / 15)) < 1e-9)
  assert.ok(metrics.scaleRatioStdDev > 0)
})

test('declaration-level radius never pretends to be the element-level metric', () => {
  const { metrics } = cssMetricsFromAnalysis(analyze(RESTRAINED_CSS))
  assert.equal(metrics.zeroRadiusDeclarationShare, 0.5)
  assert.ok(!Object.hasOwn(metrics, 'zeroRadiusShare'))
})

test('durations hidden in custom properties leave the metric unpublished, with a reason', () => {
  const { metrics, notes } = cssMetricsFromAnalysis(analyze(`
    .a { transition: opacity var(--fast) ease; }
    .b { transition: color var(--fast) ease; }
    .c { transition: transform var(--fast) ease; }
  `))
  assert.equal(metrics.dominantEasing, 'ease')
  assert.ok(!Object.hasOwn(metrics, 'motionDeclarations'))
  assert.ok(!Object.hasOwn(metrics, 'medianDuration'))
  assert.ok(notes.some((note) => note.includes('no literal durations')))
})

test('mixed-unit durations below the coverage floor suppress the median', () => {
  const mixed = [
    ...Array.from({ length: 8 }, (unused, index) => `.v${index}{transition:opacity var(--fast) ease}`),
    '.a{animation-duration:.5s}',
  ].join('')
  const { metrics } = cssMetricsFromAnalysis(analyze(mixed))
  assert.equal(metrics.motionDeclarations, 1)
  assert.equal(metrics.medianDuration, 0.5)
})

test('backdrop-filter is counted, and its absence is a measured zero', () => {
  const withGlass = cssMetricsFromAnalysis(analyze('.a{backdrop-filter:blur(8px)}.b{backdrop-filter:blur(4px)}'))
  assert.equal(withGlass.metrics.backdropBlurRules, 2)
  const withoutGlass = cssMetricsFromAnalysis(analyze(RESTRAINED_CSS))
  assert.equal(withoutGlass.metrics.backdropBlurRules, 0)
})

test('a garbage analysis yields no metrics rather than throwing', () => {
  assert.deepEqual(cssMetricsFromAnalysis(null).metrics, {})
  assert.deepEqual(cssMetricsFromAnalysis(42).metrics, {})
})

/* -------------------------------------------------------------------------- */
/* Tier 2：渲染层                                                              */
/* -------------------------------------------------------------------------- */

function probe(overrides = {}) {
  return {
    probeVersion: PROBE_CONTRACT_VERSION,
    url: 'https://example.com',
    hero: { backgroundColor: '#101010', coverage: 0.82 },
    radii: { measuredElements: 40, zeroRadiusElements: 34 },
    borders: { thickElements: 7 },
    typography: { headingFamilies: ['Neue Montreal', 'sans-serif'], bodyMeasureCh: 68 },
    motion: {
      transformProperties: ['translate', 'scale', 'rotate', 'translate'],
      scrollDriven: true,
      scrollTransformSites: 9,
      scalePopKeyframes: 0,
    },
    render: {
      webglContexts: 0,
      threeJsSignature: false,
      imageRenderingPixelated: false,
      pixelFontMatch: false,
      largeAreaGradients: 1,
    },
    viewports: [
      { label: 'mobile', width: 320, horizontalOverflowPx: 0, overlapHits: 0 },
      { label: 'tablet', width: 768, horizontalOverflowPx: 0, overlapHits: 0 },
      { label: 'desktop', width: 1440, horizontalOverflowPx: 0, overlapHits: 0 },
    ],
    contrastSamples: Array.from({ length: 12 }, () => ({
      foreground: '#fffdf9',
      background: '#101010',
    })),
    ...overrides,
  }
}

test('the render tier converts raw readings into the spec metric names', () => {
  const { metrics } = domMetricsFromProbe(probe())
  assert.ok(metrics.heroBackgroundLuminance < 0.02)
  assert.equal(metrics.heroBackgroundCoverage, 0.82)
  assert.equal(metrics.zeroRadiusShare, 0.85)
  assert.equal(metrics.thickBorderElements, 7)
  assert.equal(metrics.hasSerifHeading, false)
  assert.equal(metrics.transformDimensions, 3)
  assert.equal(metrics.responsiveBreakpointsTested, 3)
  assert.equal(metrics.responsiveOverflowHits, 0)
  assert.equal(metrics.contrastSamples, 12)
  assert.equal(metrics.contrastFailures, 0)
})

test('an unknown probe version is refused rather than read with old field names', () => {
  const result = domMetricsFromProbe(probe({ probeVersion: 99 }))
  assert.deepEqual(result.metrics, {})
  assert.deepEqual(result.notes, ['unsupported probe contract version: 99'])
})

test('failing contrast pairs are counted, not averaged away', () => {
  const result = domMetricsFromProbe(probe({
    contrastSamples: [
      ...Array.from({ length: 8 }, () => ({ foreground: '#fffdf9', background: '#101010' })),
      ...Array.from({ length: 4 }, () => ({ foreground: '#403f3f', background: '#101010' })),
    ],
  }))
  assert.equal(result.metrics.contrastSamples, 12)
  assert.equal(result.metrics.contrastFailures, 4)
})

test('translucent samples are skipped instead of being scored as passing', () => {
  const result = domMetricsFromProbe(probe({
    contrastSamples: [
      ...Array.from({ length: 10 }, () => ({ foreground: '#fffdf9', background: '#101010' })),
      { foreground: 'rgba(255,255,255,0.4)', background: '#101010' },
    ],
  }))
  assert.equal(result.metrics.contrastSamples, 10)
})

test('too few contrast pairs withhold the verdict but still yield the max ratio', () => {
  const result = domMetricsFromProbe(probe({
    contrastSamples: [
      { foreground: '#fffdf9', background: '#101010' },
      { foreground: '#403f3f', background: '#101010' },
    ],
  }))
  assert.ok(!Object.hasOwn(result.metrics, 'contrastSamples'))
  assert.ok(!Object.hasOwn(result.metrics, 'contrastFailures'))
  assert.ok(result.metrics.maxContrastRatio > 15)
  assert.ok(result.notes.some((note) => note.includes('pass/fail withheld')))
  const decided = tagDecidability(result.metrics)
  assert.ok(decided.undecidable.some((entry) => entry.tag === 'craft.a11y-contrast-ok'))
})

test('an inconsistent radius reading is reported, not divided', () => {
  const result = domMetricsFromProbe(probe({ radii: { measuredElements: 10, zeroRadiusElements: 40 } }))
  assert.ok(!Object.hasOwn(result.metrics, 'zeroRadiusShare'))
  assert.ok(result.notes.some((note) => note.includes('inconsistent')))
})

test('a viewport missing its readings is dropped from the tested count', () => {
  const result = domMetricsFromProbe(probe({
    viewports: [
      { label: 'mobile', horizontalOverflowPx: 0, overlapHits: 0 },
      { label: 'tablet', horizontalOverflowPx: 0, overlapHits: 0 },
      { label: 'desktop', horizontalOverflowPx: 12, overlapHits: 2 },
      { label: 'broken' },
    ],
  }))
  assert.equal(result.metrics.responsiveBreakpointsTested, 3)
  assert.equal(result.metrics.responsiveOverflowHits, 1)
  assert.equal(result.metrics.responsiveOverlapHits, 2)
  assert.ok(result.notes.some((note) => note.includes('broken')))
})

test('measuring too few breakpoints withholds the metric instead of failing the site', () => {
  const result = domMetricsFromProbe(probe({
    viewports: [{ label: 'desktop', width: 1440, horizontalOverflowPx: 0, overlapHits: 0 }],
  }))
  assert.ok(!Object.hasOwn(result.metrics, 'responsiveBreakpointsTested'))
  assert.ok(!Object.hasOwn(result.metrics, 'responsiveOverflowHits'))
  assert.ok(result.notes.some((note) => note.includes('responsive metrics withheld')))
  const decided = tagDecidability(result.metrics)
  assert.ok(decided.undecidable.some((entry) => entry.tag === 'craft.responsive-verified'))
  assert.ok(!decided.refuted.some((entry) => entry.tag === 'craft.responsive-verified'))
})

/* -------------------------------------------------------------------------- */
/* 合流                                                                        */
/* -------------------------------------------------------------------------- */

test('the render tier wins a same-name conflict but the disagreement is kept', () => {
  const merged = mergeMetricTiers({
    css: { backdropBlurRules: 0, uniqueColors: 3 },
    dom: { backdropBlurRules: 4 },
  })
  assert.equal(merged.metrics.backdropBlurRules, 4)
  assert.equal(merged.provenance.backdropBlurRules, 'dom')
  assert.equal(merged.provenance.uniqueColors, 'css')
  assert.equal(merged.conflicts.length, 1)
  assert.deepEqual(merged.conflicts[0], {
    metric: 'backdropBlurRules',
    css: 0,
    dom: 4,
    resolvedBy: 'dom',
  })
})

test('missing measurements are undecidable, never a quiet no', () => {
  const cssOnly = tagDecidability(cssMetricsFromAnalysis(analyze(RESTRAINED_CSS)).metrics)
  const supported = cssOnly.supported.map((entry) => entry.tag)
  const undecidable = cssOnly.undecidable.map((entry) => entry.tag)
  assert.ok(supported.includes('craft.color-restraint'))
  assert.ok(undecidable.includes('style.dark-canvas'))
  assert.ok(undecidable.includes('style.brutalist'))
  const brutalist = cssOnly.undecidable.find((entry) => entry.tag === 'style.brutalist')
  assert.ok(brutalist.missingMetrics.includes('zeroRadiusShare'))
})

test('running both tiers turns undecidable tags into decided ones', () => {
  const cssOnly = extractMetrics({ cssAnalysis: analyze(RESTRAINED_CSS) })
  const bothTiers = extractMetrics({ cssAnalysis: analyze(RESTRAINED_CSS), probe: probe() })
  assert.deepEqual(cssOnly.tiersRun, ['css'])
  assert.deepEqual(bothTiers.tiersRun, ['css', 'dom'])
  assert.ok(bothTiers.undecidableTags.length < cssOnly.undecidableTags.length)
  const tags = bothTiers.signalTags.map((entry) => entry.tag)
  assert.ok(tags.includes('style.dark-canvas'))
  assert.ok(tags.includes('motion.coherent') === false, 'four declarations is below the coherence floor')
  assert.ok(tags.includes('craft.responsive-verified'))
  assert.ok(tags.includes('craft.a11y-contrast-ok'))
})

test('a genuinely coherent motion system is recognised once declarations pass the floor', () => {
  const many = Array.from({ length: 14 }, (unused, index) => (
    `.m${index}{transition:opacity .5s cubic-bezier(0.52,0.01,0,1)}`
  )).join('')
  const result = extractMetrics({ cssAnalysis: analyze(many) })
  const tags = result.signalTags.map((entry) => entry.tag)
  assert.ok(tags.includes('motion.coherent'))
  const evidence = result.signalTags.find((entry) => entry.tag === 'motion.coherent').evidence
  assert.equal(evidence.motionDeclarations, 14)
  assert.equal(evidence.dominantEasingShare, 1)
})

test('extraction reports which tier produced each metric', () => {
  const result = extractMetrics({ cssAnalysis: analyze(RESTRAINED_CSS), probe: probe() })
  assert.equal(result.provenance.dominantEasingShare, 'css')
  assert.equal(result.provenance.zeroRadiusShare, 'dom')
  assert.equal(result.extractorVersion, 'mining-extractor-v1')
})

/* -------------------------------------------------------------------------- */
/* 多视口合并与探针序列化                                                      */
/* -------------------------------------------------------------------------- */

function reading(label, width, overrides = {}) {
  return {
    probeVersion: PROBE_CONTRACT_VERSION,
    url: 'https://example.com',
    capturedAt: '2026-09-02T00:00:00.000Z',
    viewport: { label, width, horizontalOverflowPx: 0, overlapHits: 0 },
    hero: { backgroundColor: '#101010', coverage: 0.8 },
    radii: { measuredElements: 40, zeroRadiusElements: 34 },
    contrastSamples: [{ foreground: '#fffdf9', background: '#101010' }],
    ...overrides,
  }
}

test('viewport readings stay per breakpoint instead of being averaged', () => {
  const { payload } = mergeProbeReadings([
    reading('mobile', 320, { viewport: { label: 'mobile', width: 320, horizontalOverflowPx: 24, overlapHits: 3 } }),
    reading('tablet', 768),
    reading('desktop', 1440, { primary: true }),
  ])
  assert.equal(payload.viewports.length, 3)
  const metrics = domMetricsFromProbe(payload).metrics
  assert.equal(metrics.responsiveBreakpointsTested, 3)
  assert.equal(metrics.responsiveOverflowHits, 1)
  assert.equal(metrics.responsiveOverlapHits, 3)
})

test('the widest reading becomes primary when none is flagged', () => {
  const { payload } = mergeProbeReadings([
    reading('mobile', 320, { hero: { backgroundColor: '#ffffff', coverage: 0.5 } }),
    reading('desktop', 1440, { hero: { backgroundColor: '#101010', coverage: 0.9 } }),
  ])
  assert.equal(payload.hero.coverage, 0.9)
})

test('readings from an unknown probe version are dropped and reported', () => {
  const { payload, notes } = mergeProbeReadings([
    reading('desktop', 1440),
    { probeVersion: 99, viewport: { label: 'x', width: 1, horizontalOverflowPx: 0, overlapHits: 0 } },
  ])
  assert.equal(payload.viewports.length, 1)
  assert.ok(notes.some((note) => note.includes('unsupported probe version')))
})

test('the probe serialises into a self-contained injectable expression', () => {
  const expression = probeExpression({ label: 'desktop', primary: true })
  assert.ok(expression.startsWith('(function'))
  assert.ok(expression.endsWith('({"label":"desktop","primary":true})'))
  // 注入的代码不得引用模块作用域：出现 import/require 就说明它不再自足。
  assert.ok(!expression.includes('import('))
  assert.ok(!expression.includes('require('))
})

test('extraction with no input yields nothing decidable and no crash', () => {
  const result = extractMetrics()
  assert.deepEqual(result.tiersRun, [])
  assert.deepEqual(result.signalTags, [])
  assert.equal(result.undecidableTags.length > 0, true)
})
