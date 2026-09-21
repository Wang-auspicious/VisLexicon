/* ============ 全站口径数字（WP-A） ============
 * 页面上任何数字必须由当前已加载的数据算出（方案 §8 的数字纪律）。
 * 这个模块是唯一出口：它只有纯函数，不 import 任何数据文件，
 * 模块内不出现任何「表示统计量」的字面量——每个对外的数字都由传进来的数据算出。
 * （循环里的 0/1 是计数器初值与步长，不是统计量。）
 *
 * 调用方：构建脚本 scripts/build-public-data.mjs、关于页口径表、首页。
 */

/* 12 个正交切面轴。这是结构常量（轴的名字），不是统计量。
 * 投影层必须保留这 12 个轴，绝不合并成一个 tags 袋子（方案 §3.4 结尾）。 */
export const FACET_AXES = [
  'scenarios',
  'deliverables',
  'actions',
  'media',
  'platforms',
  'technologies',
  'workflowStages',
  'audiences',
  'access',
  'licenses',
  'contentOrganization',
  'languages',
]

const asArray = (value) => (Array.isArray(value) ? value : [])

/* site-index.json 既可能整份传进来，也可能只传 items[]。两种都接。 */
function itemsOf(source) {
  if (Array.isArray(source)) return source
  return asArray(source?.items)
}

/* ---------- 站点侧 ---------- */

/** 已审核条目数：等于投影出来的条目个数，没有第二个来源。 */
export function countApprovedEntries(siteIndex) {
  return itemsOf(siteIndex).length
}

/** 某个切面轴上「值 → 命中条目数」，按命中数降序。 */
export function countFacetValues(siteIndex, axis) {
  const counts = new Map()
  for (const item of itemsOf(siteIndex)) {
    for (const value of new Set(asArray(item?.facets?.[axis]))) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value, 'en'))
}

/** 每个切面轴上各有几个不同的值——用来说明「12 个轴」这句话本身。 */
export function countFacetAxes(siteIndex) {
  return FACET_AXES.map((axis) => ({ axis, values: countFacetValues(siteIndex, axis).length }))
}

/** 有独立复核记录（整理人 ≠ 复核人）的条目数。 */
export function countIndependentlyReviewed(siteIndex) {
  return itemsOf(siteIndex).filter((item) => item?.independentlyReviewed === true).length
}

/** 许可证登记为 unknown 的条目数——空值本身是差异化，要能被数出来。 */
export function countUnknownLicense(siteIndex) {
  return itemsOf(siteIndex).filter((item) => asArray(item?.licenses).includes('unknown')).length
}

/** 已补写 takeawayZh 的条目数（WP-H 的进度可被机器读出，不靠人自述）。 */
export function countWithTakeaway(siteIndex) {
  return itemsOf(siteIndex).filter((item) => typeof item?.takeawayZh === 'string' && item.takeawayZh.trim()).length
}

/** 已标注 atlasTerms 的条目数。 */
export function countWithAtlasTerms(siteIndex) {
  return itemsOf(siteIndex).filter((item) => asArray(item?.atlasTerms).length > 0).length
}

/** 最近一次核验时间（ISO 字符串），没有条目时为 null。 */
export function latestCheckedAt(siteIndex) {
  const stamps = itemsOf(siteIndex)
    .map((item) => item?.checkedAt)
    .filter((value) => typeof value === 'string' && !Number.isNaN(Date.parse(value)))
    .sort()
  return stamps.length ? stamps[stamps.length - 1] : null
}

/* ---------- 图鉴侧 ---------- */

const atlasEntriesOf = (atlas) => asArray(atlas?.entries)

/** 图鉴条目数：数 entries 本身，不读 stats.totalEntries（那是流水线自述）。 */
export function countAtlasTerms(atlas) {
  return atlasEntriesOf(atlas).length
}

/** 按 status 分组计数（candidate / published）。 */
export function countAtlasByStatus(atlas) {
  const counts = {}
  for (const entry of atlasEntriesOf(atlas)) {
    const key = entry?.status ?? 'unknown'
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

/** 仍挂机器译名的条目数。 */
export function countAtlasMachineTranslated(atlas) {
  return atlasEntriesOf(atlas).filter((entry) => entry?.translationQuality === 'machine').length
}

/**
 * 已被某个舞台认领（「入台」）的术语数。
 * 直接数 manifest 的 claims ∩ 语料 id，不走 buildStageIndex 的 strict 校验，
 * 免得口径数字被别处的校验错误连坐。
 */
export function countAtlasTermsOnStage(atlas, manifests) {
  const known = new Set(atlasEntriesOf(atlas).map((entry) => entry?.id))
  const routed = new Set()
  for (const manifest of asArray(manifests)) {
    for (const claim of asArray(manifest?.claims)) {
      if (known.has(claim?.termId)) routed.add(claim.termId)
    }
  }
  return routed.size
}

/** 舞台数。 */
export function countStages(manifests) {
  return asArray(manifests).length
}

/* ---------- 候选池 ---------- */

/**
 * 候选（未审核）条目数。它不在本仓库的语料里，只在样本包的自述字段中，
 * 所以取不到就是 null——绝不用任何别的数字顶替。
 */
export function countCandidateEntries(sampleInfo) {
  const value = sampleInfo?.productionCandidateCount
  return Number.isFinite(value) ? value : null
}

/* ---------- 汇总 ---------- */

/**
 * 全站口径的一次性汇总。缺哪份数据，对应的字段就是 null，不猜。
 * @param {object} sources
 * @param {object|Array} sources.items      site-index.json（或它的 items[]）
 * @param {object} [sources.atlas]          visual-atlas.json
 * @param {Array}  [sources.manifests]      舞台清单
 * @param {object} [sources.sampleInfo]     样本包自述（候选池规模的唯一来源）
 */
export function siteWideCounts({ items, atlas, manifests, sampleInfo } = {}) {
  const hasAtlas = Boolean(atlas)
  const hasManifests = Array.isArray(manifests)
  return {
    approvedEntries: countApprovedEntries(items),
    independentlyReviewed: countIndependentlyReviewed(items),
    unknownLicense: countUnknownLicense(items),
    withTakeaway: countWithTakeaway(items),
    withAtlasTerms: countWithAtlasTerms(items),
    latestCheckedAt: latestCheckedAt(items),
    candidateEntries: countCandidateEntries(sampleInfo),
    atlasTerms: hasAtlas ? countAtlasTerms(atlas) : null,
    atlasByStatus: hasAtlas ? countAtlasByStatus(atlas) : null,
    atlasMachineTranslated: hasAtlas ? countAtlasMachineTranslated(atlas) : null,
    atlasTermsOnStage: hasAtlas && hasManifests ? countAtlasTermsOnStage(atlas, manifests) : null,
    stages: hasManifests ? countStages(manifests) : null,
  }
}

/**
 * 口径表的行定义：每个数字「是什么、怎么算的」。
 * 只有定义，没有数值——数值由 siteWideCounts 现算，避免出现第二个分母。
 */
export const COUNT_DEFINITIONS = [
  {
    id: 'approvedEntries',
    labelZh: '已审核站点条目',
    definitionZh: '进站核验、三页证据齐备、且经独立复核确认的站点条目。',
    methodZh: '数 public/data/site-index.json 的 items 个数（等于 content-samples/approved-v3 的文件数）。',
  },
  {
    id: 'candidateEntries',
    labelZh: '候选站点条目',
    definitionZh: '已进入候选池但未经人工核验的站点，不出现在任何浏览页面与端点条目列表里。',
    methodZh: '取样本包自述字段 sampleInfo.productionCandidateCount；取不到显示为未知。',
  },
  {
    id: 'atlasTerms',
    labelZh: '图鉴术语（本样本包）',
    definitionZh: '本样本包内的视觉术语条目，含 candidate 与 published，不是生产总量。',
    methodZh: '数 src/data/visual-atlas.json 的 entries 个数。',
  },
  {
    id: 'atlasTermsOnStage',
    labelZh: '已入台术语',
    definitionZh: '被某个舞台清单认领、可在图鉴里点开演示的术语。',
    methodZh: '数九台 manifest.claims 里去重后、且存在于语料中的 termId。',
  },
  {
    id: 'atlasMachineTranslated',
    labelZh: '仍挂机器译名的术语',
    definitionZh: '中文名来自机器翻译、尚未人工订正的术语。',
    methodZh: '数语料中 translationQuality === "machine" 的条目。',
  },
  {
    id: 'unknownLicense',
    labelZh: '许可证未知的条目',
    definitionZh: '站点上找不到明确许可声明、按规格记为 unknown 的条目。空值本身是结论，不是缺陷。',
    methodZh: '数 facets.licenses 含 "unknown" 的条目。',
  },
]
