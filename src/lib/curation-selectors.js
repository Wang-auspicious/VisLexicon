const asArray = (value) => (Array.isArray(value) ? value : [])

function idOf(item) {
  return typeof item?.entryId === 'string' && item.entryId.trim() ? item.entryId.trim() : ''
}

function isPublished(item) {
  return item?.status === 'APPROVED' && Boolean(idOf(item))
}

function compareId(left, right) {
  return idOf(left).localeCompare(idOf(right), 'en')
}

function compareCheckedAt(left, right) {
  return String(right?.checkedAt ?? '').localeCompare(String(left?.checkedAt ?? ''), 'en') || compareId(left, right)
}

export function publishedItems(items) {
  return asArray(items).filter(isPublished)
}

export function selectRecentlyChecked(items, limit = 6) {
  const count = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 6
  return publishedItems(items).sort(compareCheckedAt).slice(0, count)
}

function recommendationOf(item) {
  const value = item?.recommendation ?? item?.editorial?.recommendation
  if (!value || typeof value !== 'object') return null
  const reason = typeof value.reasonZh === 'string' && value.reasonZh.trim()
    ? value.reasonZh.trim()
    : typeof value.reasonEn === 'string' && value.reasonEn.trim()
      ? value.reasonEn.trim()
      : ''
  const curator = typeof value.curator === 'string' && value.curator.trim() ? value.curator.trim() : ''
  const startsAt = typeof value.startsAt === 'string' && value.startsAt.trim() ? value.startsAt.trim() : ''
  return reason && curator && startsAt ? { reason, curator, startsAt } : null
}

export function selectCuratorPicks(items, limit = 6) {
  const count = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 6
  return publishedItems(items)
    .map((item) => ({ item, recommendation: recommendationOf(item) }))
    .filter(({ recommendation }) => recommendation)
    .sort((left, right) => String(right.recommendation.startsAt).localeCompare(String(left.recommendation.startsAt), 'en') || compareId(left.item, right.item))
    .slice(0, count)
    .map(({ item }) => item)
}

export function recommendationReasonOf(item) {
  return recommendationOf(item)?.reason ?? ''
}

/* ============ 收录热度 ============
 * 首页「热门排行」的口径。本站没有访问量数据，也不打算编一个：
 * 这里的分数全部来自本地语料里已经存在、任何人都能复算的四个信号。
 *   · 合辑收录   被几个编辑合辑收进去（collections.js）
 *   · 图鉴关联   链到几个图鉴术语
 *   · 证据完备   evidenceSummary 里过了几类证据
 *   · 独立复核   策展人与复核人不同
 * 分值权重写死在下面，改口径就是改这一处；前台把 methodZh 挂在标题上供核对。
 */
export const HEAT_METHOD_ZH = '收录热度＝合辑收录 ×3 ＋ 图鉴关联 ×2 ＋ 证据完备 ×2 ＋ 独立复核 ×1；不是访问量，本站没有访问量数据。'
export const HEAT_METHOD_EN = 'Coverage heat = collections x3 + atlas links x2 + evidence roles x2 + independent review x1. Not traffic — this site has no traffic data.'

export function heatScoreOf(item, collectionCounts) {
  const collections = Number(collectionCounts?.get?.(idOf(item)) ?? 0)
  const relations = asArray(item?.atlasRelations ?? item?.atlasTerms).length
  const roles = asArray(item?.evidenceSummary?.roles).length
  const reviewed = item?.independentlyReviewed === true ? 1 : 0
  return { collections, relations, roles, reviewed, score: collections * 3 + relations * 2 + roles * 2 + reviewed }
}

export function collectionCountsOf(collections) {
  const counts = new Map()
  for (const group of asArray(collections)) {
    for (const entryId of asArray(group?.entryIds)) {
      const id = String(entryId || '').trim()
      if (id) counts.set(id, (counts.get(id) ?? 0) + 1)
    }
  }
  return counts
}

export function selectHeatRanked(items, collections, limit = 6) {
  const count = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 6
  const counts = collectionCountsOf(collections)
  return publishedItems(items)
    .map((item) => ({ item, ...heatScoreOf(item, counts) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || right.collections - left.collections || compareId(left.item, right.item))
    .slice(0, count)
    .map(({ item }) => item)
}

function finiteNonNegative(value) {
  return Number.isFinite(value) && value >= 0 ? value : null
}

function metricsDate(value) {
  const timestamp = Date.parse(String(value ?? ''))
  return Number.isFinite(timestamp) ? timestamp : null
}

function metricScore(metric) {
  const opens = finiteNonNegative(metric?.detailOpens) ?? 0
  const clicks = finiteNonNegative(metric?.outboundClicks) ?? 0
  const adds = finiteNonNegative(metric?.favoriteAdds) ?? 0
  return opens + clicks * 2 + adds * 3
}

/**
 * Hot ranking is intentionally opt-in. The public snapshot does not invent
 * popularity from catalog order: callers must provide server-aggregated,
 * time-stamped metrics. Stale or malformed batches produce no row.
 */
export function selectTrending(items, metrics, limit = 6, { now = Date.now(), maxAgeDays = 45 } = {}) {
  if (!metrics || typeof metrics !== 'object' || !metrics.byEntry || typeof metrics.byEntry !== 'object') return []
  const asOf = metricsDate(metrics.asOf)
  const maxAge = Math.max(1, Number(maxAgeDays) || 45) * 86400000
  if (asOf === null || !Number.isFinite(now) || now - asOf > maxAge || asOf - now > 86400000) return []
  const count = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 6
  return publishedItems(items)
    .map((item) => {
      const metric = metrics.byEntry[idOf(item)]
      const score = metricScore(metric)
      return { item, score, metric }
    })
    .filter(({ metric, score }) => metric && score > 0)
    .sort((left, right) => right.score - left.score || compareId(left.item, right.item))
    .slice(0, count)
    .map(({ item }) => item)
}

export function atlasRelationsFor(item) {
  if (!isPublished(item)) return []
  return asArray(item.atlasRelations ?? item.atlasTerms)
    .filter((relation) => relation && typeof relation === 'object')
    .map((relation) => ({
      termId: typeof relation.termId === 'string' ? relation.termId.trim() : '',
      termEn: typeof relation.termEn === 'string' ? relation.termEn.trim() : '',
      termZh: typeof relation.termZh === 'string' ? relation.termZh.trim() : '',
      stageId: typeof relation.stageId === 'string' ? relation.stageId.trim() : '',
      relation: typeof relation.relation === 'string' ? relation.relation.trim() : '',
    }))
    .filter((relation) => relation.termId && (relation.termEn || relation.termZh))
    .map((relation) => Object.fromEntries(Object.entries(relation).filter(([, value]) => value)))
}
