/* ============ 跨语料搜索索引（方案 §3.6） ============
 * 全站只有一个搜索框，跨两份语料，结果分两组。纯前端、无网络、无 LLM：
 * 索引在客户端一次性构建，之后只做子串匹配。
 *
 * 索引字段（方案 §3.6 第 4 条）：
 *   术语侧：termEn / termZh / claim.termZhFix / aliases[] / definitionZh 前 60 字
 *   站点侧：name / domain / descriptionZh / takeawayZh / facets 全部值
 *          + curation.atlasTerms 的 termId 与 note（相对方案的扩充，见 WP-C 完成报告）
 *
 * 本模块是纯函数，不 import 任何数据文件，也不出现任何统计量字面量
 * （60 是「定义摘要截断长度」这一编辑参数，不是统计量）。
 */

/** definitionZh 进索引的截断长度。 */
export const DEFINITION_INDEX_CHARS = 60

const asArray = (value) => (Array.isArray(value) ? value : [])
const asText = (value) => (typeof value === 'string' ? value : '')

function normalize(text) {
  return asText(text).toLowerCase().trim()
}

/** 把若干片段拼成一条可子串匹配的检索文本。 */
function haystack(parts) {
  return parts.filter((part) => typeof part === 'string' && part).join('  ').toLowerCase()
}

/**
 * 术语侧索引。
 * @param {object} atlas   visual-atlas.json（`{ entries: [...] }`）
 * @param {Array}  manifests 九台清单，提供 claim.termZhFix 与 stageId
 */
export function buildTermIndex(atlas, manifests) {
  /* termId → { stageId, termZhFix }。同一术语被多台认领时取第一台，
   * 跳链需要一个确定的 stageId；其余台在图鉴内部仍可互引。 */
  const claimed = new Map()
  for (const manifest of asArray(manifests)) {
    for (const claim of asArray(manifest?.claims)) {
      const termId = claim?.termId
      if (!termId || claimed.has(termId)) continue
      claimed.set(termId, {
        stageId: manifest?.id ?? null,
        stageTitleZh: manifest?.titleZh ?? null,
        termZhFix: asText(claim?.termZhFix) || null,
        slot: claim?.slot ?? null,
      })
    }
  }

  return asArray(atlas?.entries).map((entry) => {
    const claim = claimed.get(entry?.id) ?? null
    const definition = asText(entry?.definitionZh)
    const aliases = asArray(entry?.aliases).map(asText).filter(Boolean)
    return {
      kind: 'term',
      id: entry?.id ?? '',
      termEn: asText(entry?.termEn),
      termZh: asText(entry?.termZh),
      termZhFix: claim?.termZhFix ?? null,
      aliases,
      definitionZh: definition,
      stageId: claim?.stageId ?? null,
      stageTitleZh: claim?.stageTitleZh ?? null,
      slot: claim?.slot ?? null,
      text: haystack([
        entry?.termEn,
        entry?.termZh,
        claim?.termZhFix,
        ...aliases,
        definition.slice(0, DEFINITION_INDEX_CHARS),
      ]),
    }
  })
}

/**
 * 站点侧索引。
 * @param {object|Array} siteIndex site-index.json 或它的 items[]
 */
export function buildSiteIndex(siteIndex) {
  const items = Array.isArray(siteIndex) ? siteIndex : asArray(siteIndex?.items)
  return items.map((item) => {
    const facetValues = []
    for (const values of Object.values(item?.facets ?? {})) {
      for (const value of asArray(values)) facetValues.push(asText(value))
    }
    /* 编辑标注的「这个站示范了哪些术语」也进索引：没有它，搜 skeleton
     * 只会命中图鉴一组，而实际上有 4 个站被人工标注示范了这条术语。
     * 这是站点侧字段清单相对方案 §3.6 的一处扩充，见 WP-C 完成报告。 */
    const atlasTermText = []
    for (const term of asArray(item?.atlasTerms)) {
      atlasTermText.push(asText(term?.termId).replace(/-/g, ' '))
      atlasTermText.push(asText(term?.note))
    }
    return {
      kind: 'site',
      id: item?.entryId ?? '',
      name: asText(item?.name),
      domain: asText(item?.domain),
      takeawayZh: item?.takeawayZh ?? null,
      descriptionZh: item?.descriptionZh ?? null,
      text: haystack([
        item?.name,
        item?.domain,
        item?.descriptionZh,
        item?.takeawayZh,
        ...facetValues,
        ...atlasTermText,
      ]),
    }
  })
}

/** 一次建齐两侧。缺哪份数据，对应的组就是空数组，不用另一组顶替。 */
export function buildSearchIndex({ atlas, manifests, siteIndex } = {}) {
  return {
    terms: atlas ? buildTermIndex(atlas, manifests) : [],
    sites: siteIndex ? buildSiteIndex(siteIndex) : [],
  }
}

/* 命中位置越靠前、字段越「像名字」，排得越前。这里只有排序权重，没有统计量。 */
function scoreOf(record, keyword) {
  const names = record.kind === 'term'
    ? [record.termEn, record.termZh, record.termZhFix, ...record.aliases]
    : [record.name, record.domain]
  const nameHit = names.some((name) => normalize(name).includes(keyword))
  const nameStart = names.some((name) => normalize(name).startsWith(keyword))
  const position = record.text.indexOf(keyword)
  return (nameStart ? 4 : 0) + (nameHit ? 2 : 0) - Math.min(position, 200) / 1000
}

/**
 * 在一组索引记录里做子串匹配，按权重降序。
 * @param {Array} records buildTermIndex / buildSiteIndex 的产物
 * @param {string} keyword 用户输入
 * @param {number} [limit] 截断条数（调用方给，模块内不写默认条数）
 */
export function searchRecords(records, keyword, limit) {
  const kw = normalize(keyword)
  if (!kw) return []
  const hits = asArray(records)
    .filter((record) => record.text.includes(kw))
    .map((record) => ({ record, score: scoreOf(record, kw) }))
    .sort((left, right) => right.score - left.score
      || String(left.record.id).localeCompare(String(right.record.id), 'en'))
    .map((hit) => hit.record)
  return Number.isFinite(limit) ? hits.slice(0, limit) : hits
}

/** 两组结果 + 各自的总命中数（「查看全部」要显示的就是这个总数）。 */
export function searchAll(index, keyword, limit) {
  const terms = searchRecords(index?.terms, keyword, undefined)
  const sites = searchRecords(index?.sites, keyword, undefined)
  return {
    terms: Number.isFinite(limit) ? terms.slice(0, limit) : terms,
    sites: Number.isFinite(limit) ? sites.slice(0, limit) : sites,
    termTotal: terms.length,
    siteTotal: sites.length,
  }
}

/** 一条术语结果的目标 hash：入台的进舞台，未入台的只能回图鉴索引并带上关键词。 */
export function termHref(record, keyword) {
  if (record?.stageId && record?.id) return `#/atlas/${record.stageId}/${record.id}`
  return `#/atlas?q=${encodeURIComponent(keyword ?? '')}`
}

/** 一条站点结果的目标 hash。 */
export function siteHref(record) {
  return `#/site/${record?.id ?? ''}`
}
