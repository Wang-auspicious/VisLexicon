// 分流深挖流水线 v1：路由、必答题、可测信号标签字典。
// 规格：docs/superpowers/specs/2026-09-02-routed-deep-mining-and-threshold-design.md
//
// 本文件只放数据与判定条件，不做抓取，也不做 IO。
// 核心约束：任何主观风格标签都必须绑定一条纯机器可测的触发条件。

export const MINING_THRESHOLD_VERSION = 'mining-threshold-v1'

function deepFreeze(value) {
  if (value === null || typeof value !== 'object') return value
  for (const key of Object.getOwnPropertyNames(value)) {
    deepFreeze(value[key])
  }
  return Object.freeze(value)
}

/* -------------------------------------------------------------------------- */
/* 路由                                                                        */
/* -------------------------------------------------------------------------- */

export const MINING_ROUTES = deepFreeze([
  {
    id: 'R1',
    key: 'code-implementation',
    label: '代码实现',
    allowedCategories: ['ui-implementation', 'visual-implementation'],
    requiredProbes: [
      'implementationIndexUrl',
      'acquisitionMethod',
      'license',
      'repositoryUrl',
      'lastUpdatedAt',
      'runnableEvidence',
    ],
  },
  {
    id: 'R2',
    key: 'visual-specimen',
    label: '视觉样本',
    allowedCategories: ['single-site-showcase', 'case-inspiration-collections'],
    requiredProbes: [
      'siteRole',
      'rightsStatus',
      'signatureTechniqueSupport',
    ],
  },
  {
    id: 'R3',
    key: 'directory-index',
    label: '目录索引',
    allowedCategories: ['directories-indexes'],
    requiredProbes: [
      'outboundSample',
      'collectionSubject',
      'internalTaxonomy',
      'freshnessSignal',
      'affiliateDisclosure',
    ],
  },
  {
    id: 'R4',
    key: 'asset-library',
    label: '素材库',
    allowedCategories: ['visual-assets', 'templates-design-files'],
    requiredProbes: [
      'assetTypes',
      'fileFormats',
      'license',
      'downloadAccess',
      'codeWrapper',
    ],
  },
  {
    id: 'R5',
    key: 'editorial-content',
    label: '内容出版',
    allowedCategories: ['learning-editorial', 'reference-standards'],
    requiredProbes: [
      'contentForm',
      'recentDates',
      'primaryLanguage',
      'authorIdentity',
      'subscriptionOutlet',
    ],
  },
  {
    id: 'R6',
    key: 'tool-service',
    label: '工具服务',
    allowedCategories: [
      'creation-tools',
      'delivery-development-tools',
      'research-quality-tools',
    ],
    requiredProbes: [
      'inputOutput',
      'accessModel',
      'exportFormats',
      'runtimeLocation',
      'runThroughEvidence',
    ],
  },
])

export const MINING_ROUTE_IDS = deepFreeze(MINING_ROUTES.map((route) => route.id))

const ROUTE_BY_ID = new Map(MINING_ROUTES.map((route) => [route.id, route]))

export function miningRoute(routeId) {
  return ROUTE_BY_ID.get(routeId) ?? null
}

// R2 的必答题里不含 styleDossier / shots，它们由专门的结构门检查（见 STYLE_DOSSIER_REQUIRED_BLOCKS）。
export const STYLE_DOSSIER_REQUIRED_BLOCKS = deepFreeze([
  'colors',
  'typographyFamilies',
  'typographyScale',
  'spacing',
  'radii',
  'motion',
  'layout',
  'components',
])

export const STYLE_DOSSIER_MINIMUMS = deepFreeze({
  colors: 3,
  typographyFamilies: 1,
  typographyScale: 4,
  spacing: 4,
  radii: 1,
  components: 3,
})

export const R2_REQUIRED_SHOT_COUNT = 3

/* -------------------------------------------------------------------------- */
/* 可测信号标签                                                                */
/* -------------------------------------------------------------------------- */

// 条件 DSL：
//   { metric, op, value }            单条比较
//   { metric, op: 'between', value: [min, max] }
//   { allOf: [...] } / { anyOf: [...] }
// 支持的 op：gte lte gt lt eq neq between
const OPS = {
  gte: (a, b) => a >= b,
  lte: (a, b) => a <= b,
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
}

export const SIGNAL_TAGS = deepFreeze([
  {
    id: 'motion.coherent',
    label: '动效连贯',
    condition: {
      allOf: [
        { metric: 'motionDeclarations', op: 'gte', value: 12 },
        { metric: 'dominantEasingShare', op: 'gte', value: 0.55 },
        { metric: 'medianDuration', op: 'between', value: [0.15, 0.8] },
        { metric: 'durationFamilies', op: 'lte', value: 3 },
      ],
    },
  },
  {
    id: 'motion.still',
    label: '克制近静',
    condition: {
      allOf: [
        { metric: 'motionDeclarations', op: 'gte', value: 4 },
        { metric: 'hasSpringOrBounce', op: 'eq', value: false },
        { metric: 'medianDuration', op: 'gte', value: 0.4 },
        { metric: 'scalePopKeyframes', op: 'eq', value: 0 },
      ],
    },
  },
  {
    id: 'motion.expressive',
    label: '动效张扬',
    condition: {
      anyOf: [
        {
          allOf: [
            { metric: 'keyframeAnimations', op: 'gte', value: 6 },
            { metric: 'transformDimensions', op: 'gte', value: 3 },
          ],
        },
        { metric: 'hasSpringOrBounce', op: 'eq', value: true },
      ],
    },
  },
  {
    id: 'motion.scroll-driven',
    label: '滚动驱动',
    condition: {
      allOf: [
        { metric: 'scrollDriven', op: 'eq', value: true },
        { metric: 'scrollTransformSites', op: 'gte', value: 5 },
      ],
    },
  },
  {
    id: 'style.dark-canvas',
    label: '暗底画布',
    condition: {
      allOf: [
        { metric: 'heroBackgroundLuminance', op: 'lt', value: 0.2 },
        { metric: 'heroBackgroundCoverage', op: 'gte', value: 0.7 },
      ],
    },
  },
  {
    id: 'style.pixel-art',
    label: '像素风',
    // 曾经有过第三条分支「主色 ≤16 且无渐变」。真实抓取里它在 example.com 这种
    // 两色纯文本页上就会命中——极简和像素风共享「调色板小」这个特征，但它们不是一回事。
    // 调色板规模不是像素风的证据，只有渲染意图（pixelated）或字体选择才是。
    condition: {
      anyOf: [
        { metric: 'imageRenderingPixelated', op: 'eq', value: true },
        { metric: 'pixelFontMatch', op: 'eq', value: true },
      ],
    },
  },
  {
    id: 'style.brutalist',
    label: '粗野',
    condition: {
      allOf: [
        { metric: 'zeroRadiusShare', op: 'gte', value: 0.8 },
        { metric: 'thickBorderElements', op: 'gte', value: 5 },
        { metric: 'maxContrastRatio', op: 'gte', value: 12 },
      ],
    },
  },
  {
    id: 'style.editorial',
    label: '编辑排版',
    condition: {
      allOf: [
        { metric: 'hasSerifHeading', op: 'eq', value: true },
        { metric: 'maxMinSizeRatio', op: 'gte', value: 6 },
        { metric: 'bodyMeasureCh', op: 'lte', value: 80 },
      ],
    },
  },
  {
    id: 'style.glass',
    label: '玻璃拟态',
    condition: { metric: 'backdropBlurRules', op: 'gte', value: 2 },
  },
  {
    id: 'style.gradient-led',
    label: '渐变主导',
    condition: {
      allOf: [
        { metric: 'gradientDeclarations', op: 'gte', value: 6 },
        { metric: 'largeAreaGradients', op: 'gte', value: 2 },
      ],
    },
  },
  {
    id: 'style.3d-webgl',
    label: '3D / WebGL',
    condition: {
      anyOf: [
        { metric: 'hasWebGLContext', op: 'eq', value: true },
        { metric: 'threeJsSignature', op: 'eq', value: true },
      ],
    },
  },
  {
    id: 'style.monochrome',
    // 度量只看 CSS 声明的颜色，看不到 SVG 插画与图片里的用色。标签名必须说清这个范围：
    // Vivid+Co 的界面确实是单色的，它的彩虹色散全在品牌插画里，不是 UI token。
    label: 'UI 层单色',
    condition: { metric: 'chromaticColors', op: 'lte', value: 1 },
  },
  {
    id: 'craft.type-scale-disciplined',
    label: '排版有纪律',
    condition: {
      allOf: [
        { metric: 'typeSizeCount', op: 'lte', value: 10 },
        { metric: 'scaleRatioStdDev', op: 'lte', value: 0.12 },
      ],
    },
  },
  {
    id: 'craft.color-restraint',
    label: 'UI 层用色克制',
    condition: { metric: 'chromaticColors', op: 'lte', value: 3 },
  },
  {
    id: 'craft.responsive-verified',
    label: '响应式实测',
    condition: {
      allOf: [
        { metric: 'responsiveBreakpointsTested', op: 'gte', value: 3 },
        { metric: 'responsiveOverflowHits', op: 'eq', value: 0 },
        { metric: 'responsiveOverlapHits', op: 'eq', value: 0 },
      ],
    },
  },
  {
    id: 'craft.a11y-contrast-ok',
    label: '对比达标',
    condition: {
      allOf: [
        { metric: 'contrastSamples', op: 'gte', value: 10 },
        { metric: 'contrastFailures', op: 'eq', value: 0 },
      ],
    },
  },
])

export const SIGNAL_TAG_IDS = deepFreeze(SIGNAL_TAGS.map((tag) => tag.id))

const SIGNAL_TAG_BY_ID = new Map(SIGNAL_TAGS.map((tag) => [tag.id, tag]))

export function signalTag(tagId) {
  return SIGNAL_TAG_BY_ID.get(tagId) ?? null
}

function collectMetricNames(condition, into) {
  if (!condition || typeof condition !== 'object') return into
  if (Array.isArray(condition.allOf)) {
    for (const child of condition.allOf) collectMetricNames(child, into)
    return into
  }
  if (Array.isArray(condition.anyOf)) {
    for (const child of condition.anyOf) collectMetricNames(child, into)
    return into
  }
  if (typeof condition.metric === 'string') into.add(condition.metric)
  return into
}

/**
 * 一个标签的判定需要读哪些度量。用于回答「为什么这个站没打这个标签」：
 * 是实测不成立，还是根本没测到。
 */
export function signalTagMetricNames(tagId) {
  const tag = SIGNAL_TAG_BY_ID.get(tagId)
  if (!tag) return []
  return [...collectMetricNames(tag.condition, new Set())]
}

export const TRUE = 'true'
export const FALSE = 'false'
export const UNKNOWN = 'unknown'

/**
 * 三值（Kleene）求值。缺度量得到 UNKNOWN，而不是 FALSE。
 *
 * 这个区别是实质性的：`allOf` 里只要有一项**确定为假**，整条就已经确定为假，
 * 哪怕另一项没测到——一个零动效的站不该因为「没测到弹性曲线」而卡在无法判定。
 * 反过来，`anyOf` 里只要有一支确定为真，整条就为真。
 * 只有在「没有任何一项能决定结果」时才返回 UNKNOWN。
 */
function evaluateCondition(condition, metrics) {
  if (!condition || typeof condition !== 'object') return UNKNOWN

  if (Array.isArray(condition.allOf)) {
    if (condition.allOf.length === 0) return UNKNOWN
    let unknown = false
    for (const child of condition.allOf) {
      const result = evaluateCondition(child, metrics)
      if (result === FALSE) return FALSE
      if (result === UNKNOWN) unknown = true
    }
    return unknown ? UNKNOWN : TRUE
  }

  if (Array.isArray(condition.anyOf)) {
    if (condition.anyOf.length === 0) return UNKNOWN
    let unknown = false
    for (const child of condition.anyOf) {
      const result = evaluateCondition(child, metrics)
      if (result === TRUE) return TRUE
      if (result === UNKNOWN) unknown = true
    }
    return unknown ? UNKNOWN : FALSE
  }

  if (typeof condition.metric !== 'string') return UNKNOWN
  if (!Object.hasOwn(metrics, condition.metric)) return UNKNOWN
  const actual = metrics[condition.metric]

  if (condition.op === 'between') {
    if (!Array.isArray(condition.value) || condition.value.length !== 2) return UNKNOWN
    if (typeof actual !== 'number' || !Number.isFinite(actual)) return UNKNOWN
    return actual >= condition.value[0] && actual <= condition.value[1] ? TRUE : FALSE
  }

  const op = OPS[condition.op]
  if (!op) return UNKNOWN
  if (condition.op === 'eq' || condition.op === 'neq') {
    return op(actual, condition.value) ? TRUE : FALSE
  }
  if (typeof actual !== 'number' || !Number.isFinite(actual)) return UNKNOWN
  if (typeof condition.value !== 'number') return UNKNOWN
  return op(actual, condition.value) ? TRUE : FALSE
}

/**
 * 一个标签是否被实测支撑，并给出触发它的实测数值。
 * evidence 只包含该标签条件真正读取过的度量，便于页面展开解释。
 */
export function evaluateSignalTag(tagId, metrics) {
  const tag = SIGNAL_TAG_BY_ID.get(tagId)
  if (!tag) {
    return { tag: tagId, known: false, supported: false, state: UNKNOWN, evidence: {}, missingMetrics: [] }
  }
  const source = (metrics && typeof metrics === 'object') ? metrics : {}
  const state = evaluateCondition(tag.condition, source)
  const evidence = {}
  const missingMetrics = []
  for (const name of collectMetricNames(tag.condition, new Set())) {
    if (Object.hasOwn(source, name)) evidence[name] = source[name]
    else missingMetrics.push(name)
  }
  return { tag: tagId, known: true, supported: state === TRUE, state, evidence, missingMetrics }
}

/**
 * 全量评估：模型提名的标签中，哪些有实测支撑，哪些没有。
 * 未被提名但实测成立的标签也会被打上——标签的权威来源是实测，不是模型。
 */
export function evaluateSignalTags(metrics, claimedTagIds = []) {
  const claimed = Array.isArray(claimedTagIds) ? claimedTagIds : []
  const supported = []
  const unsupportedTagClaims = []
  const unknownTagClaims = []

  for (const tagId of SIGNAL_TAG_IDS) {
    const result = evaluateSignalTag(tagId, metrics)
    if (result.supported) {
      supported.push({ tag: tagId, evidence: result.evidence })
    }
  }

  const supportedIds = new Set(supported.map((entry) => entry.tag))
  const seenClaims = new Set()
  for (const raw of claimed) {
    if (typeof raw !== 'string') continue
    const tagId = raw.trim()
    if (tagId === '' || seenClaims.has(tagId)) continue
    seenClaims.add(tagId)
    if (!SIGNAL_TAG_BY_ID.has(tagId)) {
      unknownTagClaims.push(tagId)
    } else if (!supportedIds.has(tagId)) {
      unsupportedTagClaims.push(tagId)
    }
  }

  return { supported, unsupportedTagClaims, unknownTagClaims }
}

/* -------------------------------------------------------------------------- */
/* 批次断路器阈值                                                              */
/* -------------------------------------------------------------------------- */

export const MINING_BATCH_SIZE = 200

export const MINING_BATCH_BREAKERS = deepFreeze({
  maxConfirmedShare: 0.85,
  minConfirmedShare: 0.15,
  maxRouteShare: 0.6,
  maxSingleTagHitRate: 0.5,
  minAverageTagsPerRecord: 1.5,
  manualSampleSize: 30,
  routineSampleShare: 0.05,
  maxRoutineErrorRate: 0.1,
})
