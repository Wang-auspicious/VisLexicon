// 抽取器 Tier 1：静态 CSS 层。不开浏览器，可在 8,000+ 站上跑。
// 规格：docs/superpowers/specs/2026-09-02-routed-deep-mining-and-threshold-design.md
//
// 输入是 @projectwallace/css-analyzer (MIT) 的分析结果，输出是 mining-signals 用的度量名。
// 本文件保持纯函数：不 import 分析器、不做网络、不读文件，便于用夹具测试。
//
// 命名纪律：只有当这一层真的能测准某个度量时才用规格里的正式度量名。
// 声明级统计推不出元素级事实的（例如「零圆角元素占比」），一律用 *Declaration* 后缀的提示名，
// 由渲染层给出正式名。宁可缺度量——缺度量在阈值门里等于「不支持该标签」，是安全默认。

const PX_PER_UNIT = Object.freeze({
  px: 1,
  rem: 16,
  em: 16,
  pt: 96 / 72,
  pc: 16,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  q: 96 / 101.6,
})

const SERIF_FAMILY_HINTS = [
  'serif',
  'georgia',
  'times',
  'garamond',
  'baskerville',
  'playfair',
  'freight',
  'tiempos',
  'canela',
  'lora',
  'merriweather',
  'spectral',
  'source serif',
  'noto serif',
  'songti',
  '宋体',
]

// 只放常见且无歧义的具名色；其余具名色计入未解析，由覆盖率门决定是否发布该度量。
const NAMED_COLORS = Object.freeze({
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  lime: [0, 255, 0],
  green: [0, 128, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  aqua: [0, 255, 255],
  magenta: [255, 0, 255],
  fuchsia: [255, 0, 255],
  silver: [192, 192, 192],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  maroon: [128, 0, 0],
  olive: [128, 128, 0],
  navy: [0, 0, 128],
  teal: [0, 128, 128],
  purple: [128, 0, 128],
  orange: [255, 165, 0],
})

const IGNORED_COLOR_KEYWORDS = new Set([
  'transparent',
  'currentcolor',
  'inherit',
  'initial',
  'unset',
  'revert',
  'none',
  'auto',
])

const MIN_PARSE_COVERAGE = 0.8
const CHROMATIC_THRESHOLD = 0.15

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function uniqueCounts(collection) {
  if (!isPlainObject(collection)) return []
  const unique = collection.unique
  if (!isPlainObject(unique)) return []
  const entries = []
  for (const key of Object.keys(unique)) {
    const count = unique[key]
    if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
      entries.push([key, count])
    }
  }
  return entries
}

function totalOf(collection) {
  if (!isPlainObject(collection)) return 0
  const total = collection.total
  return typeof total === 'number' && Number.isFinite(total) ? total : 0
}

function totalUniqueOf(collection) {
  if (!isPlainObject(collection)) return 0
  const total = collection.totalUnique
  return typeof total === 'number' && Number.isFinite(total) ? total : 0
}

/* -------------------------------------------------------------------------- */
/* 解析原语                                                                    */
/* -------------------------------------------------------------------------- */

const DURATION = /^([+-]?(?:\d+\.?\d*|\.\d+))(ms|s)$/iu
const LENGTH = /^([+-]?(?:\d+\.?\d*|\.\d+))([a-z]+)$/iu
const CUBIC_BEZIER = /^cubic-bezier\(\s*([^)]+)\)$/iu
const HEX = /^#([\da-f]{3,8})$/iu
const RGB_FN = /^rgba?\(\s*([^)]+)\)$/iu
const HSL_FN = /^hsla?\(\s*([^)]+)\)$/iu
const OKLCH_FN = /^(oklch|oklab)\(\s*([^)]+)\)$/iu
const LAB_FN = /^(lab|lch)\(\s*([^)]+)\)$/iu
// 只有能真正解析成一条曲线的值才算「主导缓动」。var()/自定义属性是变量名，不是曲线。
const RESOLVABLE_EASING = /^(cubic-bezier\(|linear\(|steps\(|spring\(|ease|linear$|step-)/iu

export function parseDurationSeconds(raw) {
  if (typeof raw !== 'string') return null
  const match = DURATION.exec(raw.trim())
  if (!match) return null
  const amount = Number.parseFloat(match[1])
  if (!Number.isFinite(amount)) return null
  return match[2].toLowerCase() === 'ms' ? amount / 1000 : amount
}

export function parseLengthPx(raw) {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (trimmed === '0') return 0
  const match = LENGTH.exec(trimmed)
  if (!match) return null
  const amount = Number.parseFloat(match[1])
  const factor = PX_PER_UNIT[match[2].toLowerCase()]
  if (!Number.isFinite(amount) || factor === undefined) return null
  return amount * factor
}

/**
 * 过冲曲线即弹性感：cubic-bezier 的控制点纵坐标越界，或用了 spring()/带过冲的 linear()。
 */
export function isOvershootTimingFunction(raw) {
  if (typeof raw !== 'string') return false
  const value = raw.trim().toLowerCase()
  if (value.startsWith('spring(')) return true
  if (value === 'ease-in-out-back' || value.includes('back') || value.includes('elastic') || value.includes('bounce')) {
    return true
  }
  const match = CUBIC_BEZIER.exec(value)
  if (!match) return false
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()))
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return false
  return parts[1] < 0 || parts[1] > 1 || parts[3] < 0 || parts[3] > 1
}

function srgbChannel(value) {
  const channel = value / 255
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance([red, green, blue]) {
  return 0.2126 * srgbChannel(red) + 0.7152 * srgbChannel(green) + 0.0722 * srgbChannel(blue)
}

export function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground)
  const second = relativeLuminance(background)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

function hslToRgb(hue, saturation, lightness) {
  const h = ((hue % 360) + 360) % 360
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lightness - c / 2
  let rgb = [0, 0, 0]
  if (h < 60) rgb = [c, x, 0]
  else if (h < 120) rgb = [x, c, 0]
  else if (h < 180) rgb = [0, c, x]
  else if (h < 240) rgb = [0, x, c]
  else if (h < 300) rgb = [x, 0, c]
  else rgb = [c, 0, x]
  return rgb.map((channel) => Math.round((channel + m) * 255))
}

/**
 * 返回 { rgb, alpha } 或 null。解析不了就返回 null，绝不猜。
 */
export function parseColor(raw) {
  if (typeof raw !== 'string') return null
  const value = raw.trim().toLowerCase()
  if (value === '' || IGNORED_COLOR_KEYWORDS.has(value)) return null

  if (Object.hasOwn(NAMED_COLORS, value)) {
    return { rgb: NAMED_COLORS[value], alpha: 1 }
  }

  const hex = HEX.exec(value)
  if (hex) {
    const digits = hex[1]
    const expand = (part) => Number.parseInt(part.length === 1 ? part + part : part, 16)
    if (digits.length === 3 || digits.length === 4) {
      const rgb = [expand(digits[0]), expand(digits[1]), expand(digits[2])]
      const alpha = digits.length === 4 ? expand(digits[3]) / 255 : 1
      return { rgb, alpha }
    }
    if (digits.length === 6 || digits.length === 8) {
      const rgb = [
        Number.parseInt(digits.slice(0, 2), 16),
        Number.parseInt(digits.slice(2, 4), 16),
        Number.parseInt(digits.slice(4, 6), 16),
      ]
      const alpha = digits.length === 8 ? Number.parseInt(digits.slice(6, 8), 16) / 255 : 1
      return { rgb, alpha }
    }
    return null
  }

  const rgbFn = RGB_FN.exec(value)
  if (rgbFn) {
    const parts = rgbFn[1].replaceAll('/', ' ').split(/[\s,]+/u).filter(Boolean)
    if (parts.length < 3) return null
    const channels = parts.slice(0, 3).map((part) => (
      part.endsWith('%')
        ? Math.round((Number.parseFloat(part) / 100) * 255)
        : Number.parseFloat(part)
    ))
    if (channels.some((channel) => !Number.isFinite(channel))) return null
    const alphaPart = parts[3]
    const alpha = alphaPart === undefined
      ? 1
      : (alphaPart.endsWith('%') ? Number.parseFloat(alphaPart) / 100 : Number.parseFloat(alphaPart))
    if (!Number.isFinite(alpha)) return null
    return { rgb: channels.map((channel) => Math.min(255, Math.max(0, Math.round(channel)))), alpha }
  }

  const oklchFn = OKLCH_FN.exec(value)
  if (oklchFn) {
    const parts = oklchFn[2].replaceAll('/', ' ').split(/[\s,]+/u).filter(Boolean)
    if (parts.length < 3) return null
    // 含 var()/calc() 的分量无法在静态层求值，直接判为不可解析。
    if (parts.some((part) => /var\(|calc\(/iu.test(part))) return null
    const lightness = parts[0].endsWith('%')
      ? Number.parseFloat(parts[0]) / 100
      : Number.parseFloat(parts[0])
    const chroma = parts[1].endsWith('%')
      ? (Number.parseFloat(parts[1]) / 100) * 0.4
      : Number.parseFloat(parts[1])
    const hue = Number.parseFloat(parts[2])
    if (![lightness, chroma, hue].every(Number.isFinite)) return null
    const alphaPart = parts[3]
    const alpha = alphaPart === undefined
      ? 1
      : (alphaPart.endsWith('%') ? Number.parseFloat(alphaPart) / 100 : Number.parseFloat(alphaPart))
    if (!Number.isFinite(alpha)) return null
    const isPolar = oklchFn[1].toLowerCase() === 'oklch'
    const aAxis = isPolar ? chroma * Math.cos((hue * Math.PI) / 180) : chroma
    const bAxis = isPolar ? chroma * Math.sin((hue * Math.PI) / 180) : hue
    return { rgb: oklabToRgb(lightness, aAxis, bAxis), alpha }
  }

  const labFn = LAB_FN.exec(value)
  if (labFn) {
    const parts = labFn[2].replaceAll('/', ' ').split(/[\s,]+/u).filter(Boolean)
    if (parts.length < 3) return null
    if (parts.some((part) => /var\(|calc\(/iu.test(part))) return null
    const lightness = Number.parseFloat(parts[0])
    // lab/lch 的 a/b/C 用百分号时 100% 对应 125（CSS Color 4）。
    const second = parts[1].endsWith('%')
      ? (Number.parseFloat(parts[1]) / 100) * 125
      : Number.parseFloat(parts[1])
    const third = Number.parseFloat(parts[2])
    if (![lightness, second, third].every(Number.isFinite)) return null
    const alphaPart = parts[3]
    const alpha = alphaPart === undefined
      ? 1
      : (alphaPart.endsWith('%') ? Number.parseFloat(alphaPart) / 100 : Number.parseFloat(alphaPart))
    if (!Number.isFinite(alpha)) return null
    const isPolar = labFn[1].toLowerCase() === 'lch'
    const aAxis = isPolar ? second * Math.cos((third * Math.PI) / 180) : second
    const bAxis = isPolar ? second * Math.sin((third * Math.PI) / 180) : third
    return { rgb: labToRgb(lightness, aAxis, bAxis), alpha }
  }

  const hslFn = HSL_FN.exec(value)
  if (hslFn) {
    const parts = hslFn[1].replaceAll('/', ' ').split(/[\s,]+/u).filter(Boolean)
    if (parts.length < 3) return null
    const hue = Number.parseFloat(parts[0])
    const saturation = Number.parseFloat(parts[1]) / 100
    const lightness = Number.parseFloat(parts[2]) / 100
    if (![hue, saturation, lightness].every(Number.isFinite)) return null
    const alphaPart = parts[3]
    const alpha = alphaPart === undefined
      ? 1
      : (alphaPart.endsWith('%') ? Number.parseFloat(alphaPart) / 100 : Number.parseFloat(alphaPart))
    if (!Number.isFinite(alpha)) return null
    return { rgb: hslToRgb(hue, saturation, lightness), alpha }
  }

  return null
}

function linearToSrgb(channel) {
  const value = channel <= 0.0031308
    ? channel * 12.92
    : 1.055 * channel ** (1 / 2.4) - 0.055
  return Math.min(255, Math.max(0, Math.round(value * 255)))
}

/**
 * OKLab → sRGB。Tailwind v4 起默认用 oklch 输出调色板，2026 年不支持它等于
 * 在大量现代站点上直接丧失颜色度量。
 */
function oklabToRgb(lightness, aAxis, bAxis) {
  const l = (lightness + 0.396_337_777_4 * aAxis + 0.215_803_757_3 * bAxis) ** 3
  const m = (lightness - 0.105_561_345_8 * aAxis - 0.063_854_172_8 * bAxis) ** 3
  const s = (lightness - 0.089_484_177_5 * aAxis - 1.291_485_548 * bAxis) ** 3
  return [
    linearToSrgb(4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s),
    linearToSrgb(-1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s),
    linearToSrgb(-0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701 * s),
  ]
}

// CIE Lab（D50 白点）→ sRGB。
// Chromium 会把 oklch 作者色在 computed style 里序列化成 lab()，所以渲染层必须认识它，
// 否则现代站点的颜色读数会整批解析失败——这是真实抓取里量出来的，不是理论顾虑。
const LAB_EPSILON = 216 / 24_389
const LAB_KAPPA = 24_389 / 27
const D50_WHITE = [0.964_295_676_429_567_7, 1, 0.825_104_602_510_460_2]

function labToRgb(lightness, aAxis, bAxis) {
  const fy = (lightness + 16) / 116
  const fx = fy + aAxis / 500
  const fz = fy - bAxis / 200
  const cube = (value) => value ** 3
  const xr = cube(fx) > LAB_EPSILON ? cube(fx) : (116 * fx - 16) / LAB_KAPPA
  const yr = lightness > LAB_KAPPA * LAB_EPSILON ? cube(fy) : lightness / LAB_KAPPA
  const zr = cube(fz) > LAB_EPSILON ? cube(fz) : (116 * fz - 16) / LAB_KAPPA
  const x = xr * D50_WHITE[0]
  const y = yr * D50_WHITE[1]
  const z = zr * D50_WHITE[2]
  return [
    linearToSrgb(3.134_135_956_995_870_7 * x - 1.617_386_332_161_253_8 * y - 0.490_661_946_008_353_2 * z),
    linearToSrgb(-0.978_768_445_661_307_5 * x + 1.916_141_544_005_931_5 * y + 0.033_445_409_329_791_52 * z),
    linearToSrgb(0.071_955_379_884_116_77 * x - 0.228_976_826_415_832_2 * y + 1.405_377_700_485_332_7 * z),
  ]
}

export function isSerifFamily(raw) {
  if (typeof raw !== 'string') return false
  const lowered = raw.toLowerCase()
  if (lowered.includes('sans-serif')) return false
  return SERIF_FAMILY_HINTS.some((hint) => lowered.includes(hint))
}

/**
 * 色度 = 通道极差 / 255。
 *
 * 这里刻意不用 HSL 饱和度：在明暗两端它会失真——#fffdf9 这种近白色的 HSL 饱和度
 * 接近 1.0，会被误判成彩色。色度对"这个颜色带不带色"这个问题是稳定的。
 */
export function colorChroma([red, green, blue]) {
  return (Math.max(red, green, blue) - Math.min(red, green, blue)) / 255
}

/* -------------------------------------------------------------------------- */
/* 度量推导                                                                    */
/* -------------------------------------------------------------------------- */

function weightedMedian(entries) {
  const rows = entries
    .filter(([value]) => value !== null)
    .sort((left, right) => left[0] - right[0])
  const total = rows.reduce((sum, [, count]) => sum + count, 0)
  if (total === 0) return null
  const target = total / 2
  let cumulative = 0
  for (const [value, count] of rows) {
    cumulative += count
    if (cumulative >= target) return value
  }
  return rows[rows.length - 1][0]
}

function populationStdDev(values) {
  if (values.length === 0) return null
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function motionMetrics(analysis, metrics, notes) {
  const animations = isPlainObject(analysis.values) ? analysis.values.animations : null
  const durations = isPlainObject(animations) ? animations.durations : null
  const timings = isPlainObject(animations) ? animations.timingFunctions : null

  const timingTotalForNotes = totalOf(timings)
  const durationTotal = totalOf(durations)
  if (durationTotal === 0 && timingTotalForNotes > 0) {
    // 时长写在自定义属性里时分析器数不到它。宁可不发布 motionDeclarations
    // 让标签落到 undecidable，也不要拿曲线数量顶替时长数量。
    notes.push('timing functions present but no literal durations were declared')
  }
  if (durationTotal > 0) {
    metrics.motionDeclarations = durationTotal
    metrics.durationFamilies = totalUniqueOf(durations)

    const parsed = []
    let parsedCount = 0
    for (const [raw, count] of uniqueCounts(durations)) {
      const seconds = parseDurationSeconds(raw)
      if (seconds === null) continue
      parsed.push([seconds, count])
      parsedCount += count
    }
    const coverage = parsedCount / durationTotal
    if (coverage >= MIN_PARSE_COVERAGE) {
      const median = weightedMedian(parsed)
      if (median !== null) metrics.medianDuration = median
    } else {
      notes.push(`duration parse coverage ${coverage.toFixed(2)} below ${MIN_PARSE_COVERAGE}`)
    }
  }

  const timingTotal = totalOf(timings)
  if (timingTotal > 0) {
    let dominant = null
    let dominantCount = 0
    let resolvable = 0
    let overshoot = false
    for (const [raw, count] of uniqueCounts(timings)) {
      if (!RESOLVABLE_EASING.test(raw.trim())) continue
      resolvable += count
      if (count > dominantCount) {
        dominant = raw
        dominantCount = count
      }
      if (isOvershootTimingFunction(raw)) overshoot = true
    }
    const coverage = resolvable / timingTotal
    if (dominant !== null && coverage >= MIN_PARSE_COVERAGE) {
      metrics.dominantEasing = dominant
      metrics.dominantEasingShare = dominantCount / timingTotal
    } else {
      // Tailwind v4 之类把缓动放在自定义属性里，统计到的是 `var(--tw-ease,…)` 这种变量名。
      // 把变量名当成「主导曲线」会得出一个看着精确、实际无意义的数字。
      notes.push(`easing parse coverage ${coverage.toFixed(2)} below ${MIN_PARSE_COVERAGE}`)
    }
    metrics.hasSpringOrBounce = overshoot
  }

  const keyframes = isPlainObject(analysis.atrules) ? analysis.atrules.keyframes : null
  const keyframeTotal = totalUniqueOf(keyframes)
  if (isPlainObject(keyframes)) metrics.keyframeAnimations = keyframeTotal
}

function colorMetrics(analysis, metrics, notes) {
  const colors = isPlainObject(analysis.values) ? analysis.values.colors : null
  const entries = uniqueCounts(colors)
  if (entries.length === 0) return

  metrics.uniqueColors = totalUniqueOf(colors)

  let parsed = 0
  const chromatic = new Set()
  for (const [raw] of entries) {
    const color = parseColor(raw)
    if (!color) continue
    parsed += 1
    if (color.alpha === 0) continue
    if (colorChroma(color.rgb) > CHROMATIC_THRESHOLD) {
      chromatic.add(color.rgb.join(','))
    }
  }
  const coverage = parsed / entries.length
  if (coverage >= MIN_PARSE_COVERAGE) {
    metrics.chromaticColors = chromatic.size
  } else {
    notes.push(`color parse coverage ${coverage.toFixed(2)} below ${MIN_PARSE_COVERAGE}`)
  }

  const gradients = isPlainObject(analysis.values) ? analysis.values.gradients : null
  if (isPlainObject(gradients)) metrics.gradientDeclarations = totalOf(gradients)
}

function typographyMetrics(analysis, metrics, notes) {
  const values = isPlainObject(analysis.values) ? analysis.values : {}
  const fontSizes = values.fontSizes
  const sizeEntries = uniqueCounts(fontSizes)
  if (sizeEntries.length > 0) {
    const pixels = []
    for (const [raw] of sizeEntries) {
      const px = parseLengthPx(raw)
      if (px !== null && px > 0) pixels.push(px)
    }
    const coverage = pixels.length / sizeEntries.length
    if (coverage >= MIN_PARSE_COVERAGE && pixels.length > 0) {
      const sorted = [...new Set(pixels)].sort((left, right) => left - right)
      metrics.typeSizeCount = sorted.length
      metrics.maxMinSizeRatio = sorted[sorted.length - 1] / sorted[0]
      if (sorted.length >= 3) {
        const ratios = []
        for (let index = 1; index < sorted.length; index += 1) {
          ratios.push(sorted[index] / sorted[index - 1])
        }
        const deviation = populationStdDev(ratios)
        if (deviation !== null) metrics.scaleRatioStdDev = deviation
      }
    } else {
      notes.push(`font-size parse coverage ${coverage.toFixed(2)} below ${MIN_PARSE_COVERAGE}`)
    }
  }

  const families = uniqueCounts(values.fontFamilies)
  if (families.length > 0) {
    metrics.hasSerifFamilyDeclaration = families.some(([raw]) => isSerifFamily(raw))
  }
}

function shapeAndEffectMetrics(analysis, metrics) {
  const values = isPlainObject(analysis.values) ? analysis.values : {}
  const radii = uniqueCounts(values.borderRadiuses)
  if (radii.length > 0) {
    let zero = 0
    let total = 0
    for (const [raw, count] of radii) {
      total += count
      const px = parseLengthPx(raw)
      if (px === 0) zero += count
    }
    if (total > 0) metrics.zeroRadiusDeclarationShare = zero / total
  }

  const properties = isPlainObject(analysis.properties) ? analysis.properties : {}
  const unique = isPlainObject(properties.unique) ? properties.unique : {}
  const countProperty = (name) => {
    const count = unique[name]
    return typeof count === 'number' && Number.isFinite(count) ? count : 0
  }
  const blurRules = countProperty('backdrop-filter') + countProperty('-webkit-backdrop-filter')
  if (Object.hasOwn(unique, 'backdrop-filter') || Object.hasOwn(unique, '-webkit-backdrop-filter')) {
    metrics.backdropBlurRules = blurRules
  } else if (Object.keys(unique).length > 0) {
    metrics.backdropBlurRules = 0
  }

  if (Object.keys(unique).length > 0) {
    metrics.cssScrollTimelineDeclarations =
      countProperty('animation-timeline') + countProperty('scroll-timeline') + countProperty('view-timeline')
    metrics.imageRenderingDeclarations = countProperty('image-rendering')
  }
}

/**
 * 从 css-analyzer 的分析结果推出 Tier 1 度量。
 * 返回 { metrics, notes }：notes 记录因解析覆盖率不足而**故意没有发布**的度量。
 */
export function cssMetricsFromAnalysis(analysis) {
  const metrics = {}
  const notes = []
  if (!isPlainObject(analysis)) return { metrics, notes: ['analysis must be a plain object'] }

  motionMetrics(analysis, metrics, notes)
  colorMetrics(analysis, metrics, notes)
  typographyMetrics(analysis, metrics, notes)
  shapeAndEffectMetrics(analysis, metrics)

  return { metrics, notes }
}

export const CSS_TIER_METRIC_NAMES = Object.freeze([
  'motionDeclarations',
  'durationFamilies',
  'medianDuration',
  'dominantEasing',
  'dominantEasingShare',
  'hasSpringOrBounce',
  'keyframeAnimations',
  'uniqueColors',
  'chromaticColors',
  'gradientDeclarations',
  'typeSizeCount',
  'maxMinSizeRatio',
  'scaleRatioStdDev',
  'hasSerifFamilyDeclaration',
  'zeroRadiusDeclarationShare',
  'backdropBlurRules',
  'cssScrollTimelineDeclarations',
  'imageRenderingDeclarations',
])
