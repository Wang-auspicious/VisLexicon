/* ============ 全部站点：加载、筛选、排序、URL 状态（纯函数） ============
 * 这个模块不认识 React。它只做四件事：
 *   1. 取一次 site-index.json（同一份 promise 复用，两个视图不会各拉一遍）
 *   2. hash query ↔ 浏览状态 的双向翻译（筛选状态必须可分享、可后退）
 *   3. 筛选 / 排序 / 搜索
 *   4. 空结果时算出「哪个条件排除得最多」——这句话必须由数据算，不能写死
 */

import * as router from '../router.js'
import { DECISION_AXES } from './facet-chips.js'

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
  if (!indexPromise) {
    indexPromise = fetch(SITE_INDEX_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`站点索引加载失败（HTTP ${response.status}）`)
        return response.json()
      })
      .catch((error) => {
        indexPromise = null
        throw error
      })
  }
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

/** 搜索命中的字段：名称 / 域名 / 简介 / 一句拿走什么 / 全部切面值。 */
function haystack(item) {
  const facetValues = Object.values(item?.facets ?? {}).flatMap((values) => asArray(values))
  return [item?.name, item?.domain, item?.descriptionZh, item?.takeawayZh, ...facetValues]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
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

export function sortSites(items, sort = DEFAULT_SORT) {
  const list = [...asArray(items)]
  if (sort === 'name') {
    return list.sort((a, b) => String(a?.name ?? '').localeCompare(String(b?.name ?? ''), 'en'))
  }
  /* 最近核验在前；同日按名称，免得每次刷新顺序都在抖 */
  return list.sort(
    (a, b) =>
      String(b?.checkedAt ?? '').localeCompare(String(a?.checkedAt ?? '')) ||
      String(a?.name ?? '').localeCompare(String(b?.name ?? ''), 'en'),
  )
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
