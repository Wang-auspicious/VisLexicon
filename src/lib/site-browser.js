/* ============ 全部站点：加载、筛选、排序、URL 状态（纯函数） ============
 * 这个模块不认识 React。它只做四件事：
 *   1. 取一次 site-index.json（同一份 promise 复用，两个视图不会各拉一遍）
 *   2. hash query ↔ 浏览状态 的双向翻译（筛选状态必须可分享、可后退）
 *   3. 筛选 / 排序 / 搜索
 *   4. 空结果时算出「哪个条件排除得最多」——这句话必须由数据算，不能写死
 */

import * as router from '../router.js'
import { DECISION_AXES } from './facet-chips.js'
import { loadPublicSiteIndex } from './public-data.js'

export const SITE_INDEX_URL = '/data/site-index.json'

export const SORTS = [
  { id: 'checked', labelZh: '最近核验', labelEn: 'Last verified' },
  { id: 'name', labelZh: '名称', labelEn: 'Name' },
]

export const DEFAULT_SORT = 'checked'

const asArray = (value) => (Array.isArray(value) ? value : [])

/* ---------- 1. 数据 ---------- */

let indexPromise = null

/** 取站点索引。失败时抛错，由调用方渲染 role="alert"。 */
export function loadSiteIndex({ reload = false } = {}) {
  if (reload) indexPromise = null
  if (!indexPromise) indexPromise = loadPublicSiteIndex({ reload })
  return indexPromise
}

/* ---------- 2. URL 状态 ---------- */

/** 从 `#/sites?q=x&licenses=MIT,custom` 里取出 query 部分。 */
export function hashQuery(hash = window.location.hash) {
  const at = String(hash).indexOf('?')
  return new URLSearchParams(at === -1 ? '' : String(hash).slice(at + 1))
}

/** hash → 浏览状态。未知参数一律忽略，坏值退回默认，不抛错。 */
export function readSitesState(hash = window.location.hash) {
  const params = hashQuery(hash)
  const selections = {}
  for (const axis of DECISION_AXES) {
    const raw = params.get(axis)
    if (!raw) continue
    const values = raw.split(',').map((value) => value.trim()).filter(Boolean)
    if (values.length) selections[axis] = values
  }
  const sort = params.get('sort')
  return {
    q: params.get('q') ?? '',
    sort: SORTS.some((item) => item.id === sort) ? sort : DEFAULT_SORT,
    selections,
  }
}

/** 浏览状态 → hash。空值不进 URL，于是默认状态的地址就是干净的 `#/sites`。 */
export function writeSitesHash({ q = '', sort = DEFAULT_SORT, selections = {} } = {}) {
  const params = new URLSearchParams()
  if (q.trim()) params.set('q', q.trim())
  for (const axis of DECISION_AXES) {
    const values = asArray(selections[axis])
    if (values.length) params.set(axis, values.join(','))
  }
  if (sort && sort !== DEFAULT_SORT) params.set('sort', sort)
  const query = params.toString()
  return query ? `#/sites?${query}` : '#/sites'
}

/** 切换一个 chip，返回新的 selections（不改原对象）。 */
export function toggleSelection(selections, axis, value) {
  const current = asArray(selections[axis])
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]
  const result = { ...selections }
  if (next.length) result[axis] = next
  else delete result[axis]
  return result
}

export function countSelections(selections = {}) {
  return DECISION_AXES.reduce((sum, axis) => sum + asArray(selections[axis]).length, 0)
}

/* ---------- 3. 筛选与排序 ---------- */

/** 搜索命中的字段：名称 / 域名 / 简介 / 一句拿走什么 / 全部切面值。
 *
 * 结果按条目对象缓存。条目的筛选文本只取决于条目自身，而条目对象在一次加载里是
 * 稳定的（`site-index.json` 解析出来就不再变），所以这张缓存不会读到旧值。
 *
 * 为什么要缓存：搜索框每敲一个字符都会对**全量**条目跑一遍匹配。236 条时这行代码
 * 一秒能跑几千遍；到近万条时，每次敲键都要重建约九千个字符串（flatMap + join +
 * toLowerCase），实测一个「react」要 3.1 秒——平均每个字符 500 毫秒，是能感觉到的卡。
 * 用 WeakMap 而不是 Map：条目被替换之后旧键会被自动回收，不会攒成一份常驻副本。 */
const haystackCache = new WeakMap()

function haystack(item) {
  if (item && typeof item === 'object') {
    const cached = haystackCache.get(item)
    if (cached !== undefined) return cached
  }
  const facetValues = Object.values(item?.facets ?? {}).flatMap((values) => asArray(values))
  const text = [item?.name, item?.domain, item?.descriptionZh, item?.takeawayZh, ...facetValues]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  if (item && typeof item === 'object') haystackCache.set(item, text)
  return text
}

export function matchesQuery(item, q) {
  const needle = String(q ?? '').trim().toLowerCase()
  if (!needle) return true
  return haystack(item).includes(needle)
}

/** 同一轴内多选是「或」，跨轴是「且」——这是切面筛选的通行语义。 */
export function matchesSelections(item, selections = {}) {
  for (const axis of DECISION_AXES) {
    const wanted = asArray(selections[axis])
    if (!wanted.length) continue
    const owned = new Set(asArray(item?.facets?.[axis]))
    if (!wanted.some((value) => owned.has(value))) return false
  }
  return true
}

export function filterSites(items, { q = '', selections = {} } = {}) {
  return asArray(items).filter((item) => matchesQuery(item, q) && matchesSelections(item, selections))
}

/* 排序用的比较器只建一次。
 * `String.prototype.localeCompare` 每次调用都要重新解析 locale 规则；排序近万条时
 * 那是十几万次解析。`Intl.Collator` 把规则编译一次，之后每次比较只是查表。 */
const nameCollator = new Intl.Collator('en', { sensitivity: 'variant' })

export function sortSites(items, sort = DEFAULT_SORT) {
  const list = [...asArray(items)]
  if (sort === 'name') {
    return list.sort((a, b) => nameCollator.compare(String(a?.name ?? ''), String(b?.name ?? '')))
  }
  /* 最近核验在前；同日按名称，免得每次刷新顺序都在抖。
   * checkedAt 是 ISO 字符串，字典序就是时间序，直接比字符比走 collator 快得多。 */
  return list.sort((a, b) => {
    const left = String(b?.checkedAt ?? '')
    const right = String(a?.checkedAt ?? '')
    if (left !== right) return left < right ? -1 : 1
    return nameCollator.compare(String(a?.name ?? ''), String(b?.name ?? ''))
  })
}

/**
 * 空结果时：逐个条件试着松开，看松开哪一个能放回来的条目最多。
 * 返回按「放回条目数」降序的清单，调用方只用第一条。
 * 搜索词也算一个条件——很多时候排除得最多的正是它。
 */
export function exclusionBreakdown(items, { q = '', selections = {} } = {}) {
  const list = asArray(items)
  const rows = []

  if (String(q ?? '').trim()) {
    rows.push({
      kind: 'q',
      value: String(q).trim(),
      restored: filterSites(list, { q: '', selections }).length,
    })
  }

  for (const axis of DECISION_AXES) {
    for (const value of asArray(selections[axis])) {
      const relaxed = { ...selections, [axis]: asArray(selections[axis]).filter((v) => v !== value) }
      if (!relaxed[axis].length) delete relaxed[axis]
      rows.push({
        kind: 'facet',
        axis,
        value,
        restored: filterSites(list, { q, selections: relaxed }).length,
      })
    }
  }

  return rows.sort((a, b) => b.restored - a.restored)
}

/* ---------- 3.5 显示格式 ---------- */

/** 核验时间统一显示为 YYYY-MM-DD（源值是 ISO UTC，直接截前十位，不做时区换算）。 */
export function formatCheckedAt(iso) {
  const text = String(iso ?? '')
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : ''
}

/** 许可微标：licenses 为空时是「未知」，不是空白——空值本身是结论。 */
export function licenseValues(item) {
  const values = asArray(item?.licenses)
  return values.length ? values : ['unknown']
}

/* ---------- 4. 导航 ---------- */

/**
 * 卡片点击：`#/site/<id>` 是一条真路由，同时把「从哪来」写进 history.state，
 * 详情关闭时才能回到原来的列表而不是首页。
 *
 * WP-C 会在 router.js 里导出 navigate(hash, state)；它落地之前用等价的本地实现。
 * 用命名空间 import 是为了在那个导出还不存在时不炸模块解析。
 */
export function navigateTo(href, from = window.location.hash) {
  if (typeof router.navigate === 'function') {
    router.navigate(href, { from })
    return
  }
  window.history.pushState({ from }, '', href)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

/** ⌘ / Ctrl / Shift / 中键交给浏览器原生行为——新标签页是免费拿到的。 */
export function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}
