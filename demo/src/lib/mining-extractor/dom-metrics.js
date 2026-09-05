// 抽取器 Tier 2：渲染层。把浏览器探针的原始读数换算成 mining-signals 用的度量名。
// 规格：docs/superpowers/specs/2026-09-02-routed-deep-mining-and-threshold-design.md
//
// 分工：浏览器只负责「读」——量到什么就报什么，不做判断、不做换算。
// 亮度、对比度、占比这些换算全部放在这里，因为放在页面里就没法用夹具测试了。
// 探针 payload 是带版本号的合同；版本不认识就整体拒绝，绝不按旧字段猜。

import {
  contrastRatio,
  isSerifFamily,
  parseColor,
  relativeLuminance,
} from './css-metrics.js'

export const PROBE_CONTRACT_VERSION = 1

const MIN_CONTRAST_RATIO = 4.5
// craft.responsive-verified 要求三档。测不够就整块不发布，不许拿一档冒充结论。
const REQUIRED_BREAKPOINTS = 3
// craft.a11y-contrast-ok 要求 10 个样本。采不够就只发布 maxContrastRatio，不发布通过与否。
const REQUIRED_CONTRAST_SAMPLES = 10

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function readObject(source, key) {
  if (!isPlainObject(source) || !Object.hasOwn(source, key)) return null
  const value = source[key]
  return isPlainObject(value) ? value : null
}

function readArray(source, key) {
  if (!isPlainObject(source) || !Object.hasOwn(source, key)) return []
  const value = source[key]
  return Array.isArray(value) ? value : []
}

function readNumber(source, key) {
  if (!isPlainObject(source) || !Object.hasOwn(source, key)) return null
  const value = source[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readBoolean(source, key) {
  if (!isPlainObject(source) || !Object.hasOwn(source, key)) return null
  const value = source[key]
  return typeof value === 'boolean' ? value : null
}

function assign(metrics, key, value) {
  if (value === null || value === undefined) return
  metrics[key] = value
}

function heroMetrics(probe, metrics, notes) {
  const hero = readObject(probe, 'hero')
  if (!hero) return
  const raw = hero.backgroundColor
  const color = parseColor(typeof raw === 'string' ? raw : '')
  if (color) {
    // 亮度换算放在 Node，浏览器只报颜色字符串。
    assign(metrics, 'heroBackgroundLuminance', relativeLuminance(color.rgb))
  } else if (raw !== undefined) {
    notes.push(`hero.backgroundColor could not be parsed: ${String(raw)}`)
  }
  const coverage = readNumber(hero, 'coverage')
  if (coverage !== null && coverage >= 0 && coverage <= 1) {
    assign(metrics, 'heroBackgroundCoverage', coverage)
  } else if (coverage !== null) {
    notes.push(`hero.coverage ${coverage} is outside 0..1`)
  }
}

function shapeMetrics(probe, metrics, notes) {
  const radii = readObject(probe, 'radii')
  const total = readNumber(radii, 'measuredElements')
  const zero = readNumber(radii, 'zeroRadiusElements')
  if (total !== null && zero !== null) {
    if (total > 0 && zero >= 0 && zero <= total) {
      assign(metrics, 'zeroRadiusShare', zero / total)
    } else if (total > 0) {
      notes.push(`radii.zeroRadiusElements ${zero} is inconsistent with ${total} measured elements`)
    }
  }
  assign(metrics, 'thickBorderElements', readNumber(readObject(probe, 'borders'), 'thickElements'))
}

function typographyMetrics(probe, metrics) {
  const typography = readObject(probe, 'typography')
  if (!typography) return
  const headingFamilies = readArray(typography, 'headingFamilies').filter(
    (family) => typeof family === 'string',
  )
  if (headingFamilies.length > 0) {
    assign(metrics, 'hasSerifHeading', headingFamilies.some((family) => isSerifFamily(family)))
  }
  assign(metrics, 'bodyMeasureCh', readNumber(typography, 'bodyMeasureCh'))
}

function motionMetrics(probe, metrics) {
  const motion = readObject(probe, 'motion')
  if (!motion) return
  const transformProperties = readArray(motion, 'transformProperties').filter(
    (name) => typeof name === 'string' && name.trim() !== '',
  )
  if (Object.hasOwn(motion, 'transformProperties')) {
    assign(metrics, 'transformDimensions', new Set(transformProperties).size)
  }
  assign(metrics, 'scrollDriven', readBoolean(motion, 'scrollDriven'))
  assign(metrics, 'scrollTransformSites', readNumber(motion, 'scrollTransformSites'))
  assign(metrics, 'scalePopKeyframes', readNumber(motion, 'scalePopKeyframes'))
}

function renderMetrics(probe, metrics) {
  const render = readObject(probe, 'render')
  if (!render) return
  const webglContexts = readNumber(render, 'webglContexts')
  if (webglContexts !== null) assign(metrics, 'hasWebGLContext', webglContexts > 0)
  assign(metrics, 'threeJsSignature', readBoolean(render, 'threeJsSignature'))
  assign(metrics, 'imageRenderingPixelated', readBoolean(render, 'imageRenderingPixelated'))
  assign(metrics, 'pixelFontMatch', readBoolean(render, 'pixelFontMatch'))
  assign(metrics, 'largeAreaGradients', readNumber(render, 'largeAreaGradients'))
}

function responsiveMetrics(probe, metrics, notes) {
  const viewports = readArray(probe, 'viewports').filter(isPlainObject)
  if (viewports.length === 0) return
  let overflow = 0
  let overlap = 0
  let usable = 0
  for (const viewport of viewports) {
    const overflowPx = readNumber(viewport, 'horizontalOverflowPx')
    const overlapHits = readNumber(viewport, 'overlapHits')
    if (overflowPx === null || overlapHits === null) {
      notes.push(`viewport ${String(viewport.label ?? viewport.width)} is missing overflow or overlap readings`)
      continue
    }
    usable += 1
    if (overflowPx > 0) overflow += 1
    overlap += overlapHits
  }
  if (usable === 0) return
  if (usable < REQUIRED_BREAKPOINTS) {
    // 只测了一两档时，发布这些度量会让「没测够」被读成「响应式不合格」。
    // 不发布 → 标签落到 undecidable，这才是实情。
    notes.push(
      `only ${usable} breakpoint(s) measured; responsive metrics withheld (needs ${REQUIRED_BREAKPOINTS})`,
    )
    return
  }
  metrics.responsiveBreakpointsTested = usable
  metrics.responsiveOverflowHits = overflow
  metrics.responsiveOverlapHits = overlap
}

function contrastMetrics(probe, metrics, notes) {
  const samples = readArray(probe, 'contrastSamples').filter(isPlainObject)
  if (samples.length === 0) return
  let measured = 0
  let failures = 0
  let maxRatio = 0
  for (const sample of samples) {
    const foreground = parseColor(typeof sample.foreground === 'string' ? sample.foreground : '')
    const background = parseColor(typeof sample.background === 'string' ? sample.background : '')
    if (!foreground || !background) continue
    // 半透明前景无法在不知道叠层顺序时算准，直接跳过而不是拿它当合格样本。
    if (foreground.alpha < 1 || background.alpha < 1) continue
    measured += 1
    const ratio = contrastRatio(foreground.rgb, background.rgb)
    if (ratio < MIN_CONTRAST_RATIO) failures += 1
    if (ratio > maxRatio) maxRatio = ratio
  }
  if (measured === 0) {
    notes.push('no contrast sample could be parsed into an opaque foreground/background pair')
    return
  }

  // 最大对比对只需要一个样本就有意义（style.brutalist 用它），可以先发布。
  metrics.maxContrastRatio = maxRatio

  if (measured < REQUIRED_CONTRAST_SAMPLES) {
    // 采到 4 个样本全过，不等于这个站对比度达标。样本不足就不发布，
    // 让 craft.a11y-contrast-ok 落到 undecidable，而不是被读成「不合格」。
    notes.push(
      `only ${measured} opaque contrast pair(s) sampled; pass/fail withheld (needs ${REQUIRED_CONTRAST_SAMPLES})`,
    )
    return
  }
  metrics.contrastSamples = measured
  metrics.contrastFailures = failures
}

/**
 * 探针每次只测一个视口。把三档读数拼成一份 payload。
 *
 * 合并规则：
 *   - 视口相关读数逐档保留，不取平均——响应式问题是"在哪一档坏了"，平均掉就没了。
 *   - 非视口读数取主视口（`primary: true`，缺省为最宽的一档）的值，因为大屏读数最接近
 *     站点的设计原意；其余档位的同名读数只用于发现分歧。
 */
export function mergeProbeReadings(readings, meta = {}) {
  const rows = (Array.isArray(readings) ? readings : []).filter(isPlainObject)
  const notes = []
  if (rows.length === 0) return { payload: null, notes: ['no probe readings supplied'] }

  const versioned = rows.filter((row) => readNumber(row, 'probeVersion') === PROBE_CONTRACT_VERSION)
  if (versioned.length !== rows.length) {
    notes.push(`${rows.length - versioned.length} reading(s) had an unsupported probe version`)
  }
  if (versioned.length === 0) return { payload: null, notes }

  const explicitPrimary = versioned.find((row) => row.primary === true)
  const primary = explicitPrimary ?? versioned.reduce((widest, row) => {
    const width = readNumber(readObject(row, 'viewport'), 'width') ?? 0
    const widestWidth = readNumber(readObject(widest, 'viewport'), 'width') ?? 0
    return width > widestWidth ? row : widest
  }, versioned[0])

  const viewports = []
  for (const row of versioned) {
    const viewport = readObject(row, 'viewport')
    if (!viewport) {
      notes.push('a reading carried no viewport block and was dropped')
      continue
    }
    viewports.push({
      label: typeof viewport.label === 'string' ? viewport.label : String(viewport.width ?? 'unknown'),
      width: readNumber(viewport, 'width'),
      horizontalOverflowPx: readNumber(viewport, 'horizontalOverflowPx'),
      overlapHits: readNumber(viewport, 'overlapHits'),
    })
  }

  const payload = {
    probeVersion: PROBE_CONTRACT_VERSION,
    url: typeof meta.url === 'string' ? meta.url : primary.url,
    finalUrl: typeof meta.finalUrl === 'string' ? meta.finalUrl : primary.finalUrl,
    capturedAt: typeof meta.capturedAt === 'string' ? meta.capturedAt : primary.capturedAt,
    viewports,
  }
  for (const key of ['page', 'hero', 'radii', 'borders', 'typography', 'motion', 'render']) {
    const block = readObject(primary, key)
    if (block) payload[key] = block
  }
  const samples = readArray(primary, 'contrastSamples')
  if (samples.length > 0) payload.contrastSamples = samples

  return { payload, notes }
}

/**
 * 把浏览器探针 payload 换算成 Tier 2 度量。
 * 返回 { metrics, notes }。payload 版本不匹配时返回空度量并说明原因。
 */
export function domMetricsFromProbe(probe) {
  const notes = []
  if (!isPlainObject(probe)) return { metrics: {}, notes: ['probe must be a plain object'] }

  const version = readNumber(probe, 'probeVersion')
  if (version !== PROBE_CONTRACT_VERSION) {
    return {
      metrics: {},
      notes: [`unsupported probe contract version: ${String(probe.probeVersion)}`],
    }
  }

  const metrics = {}
  heroMetrics(probe, metrics, notes)
  shapeMetrics(probe, metrics, notes)
  typographyMetrics(probe, metrics)
  motionMetrics(probe, metrics)
  renderMetrics(probe, metrics)
  responsiveMetrics(probe, metrics, notes)
  contrastMetrics(probe, metrics, notes)

  return { metrics, notes }
}

export const DOM_TIER_METRIC_NAMES = Object.freeze([
  'heroBackgroundLuminance',
  'heroBackgroundCoverage',
  'zeroRadiusShare',
  'thickBorderElements',
  'hasSerifHeading',
  'bodyMeasureCh',
  'transformDimensions',
  'scrollDriven',
  'scrollTransformSites',
  'scalePopKeyframes',
  'hasWebGLContext',
  'threeJsSignature',
  'imageRenderingPixelated',
  'pixelFontMatch',
  'largeAreaGradients',
  'responsiveBreakpointsTested',
  'responsiveOverflowHits',
  'responsiveOverlapHits',
  'contrastSamples',
  'contrastFailures',
  'maxContrastRatio',
])
