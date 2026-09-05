/* ============ 图鉴的两套正交标签 ============
 * 方案 §5.5。硬约束：candidate 不许伪装成已审核内容。
 *
 * 一条术语身上有两件互不相干的事，合成一个字段就会把其中一件说没了：
 *   建档深度 depth        —— 我们对这条词做到哪一步（我们的功劳）
 *   术语地位 termStatus   —— 这个词在行业里算什么（跟我们无关）
 * 例：`backdrop-filter` 地位是标准术语，但我们只是采集了它，没上台；
 *     `产物画布` 已经上了台，但它的地位只是厂商用语。两者必须能分别显示。
 *
 * 本模块是纯函数：不 import 数据文件，不含任何统计量字面量。
 */

/* ---------------- 建档深度 ---------------- */

export const DEPTHS = ['staged', 'evidenced', 'collected']

export const DEPTH_LABEL = {
  staged: '已入台',
  evidenced: '有证据',
  collected: '仅采集',
}

export const DEPTH_DEFINITION = {
  staged: '有活体演示：被某个舞台的 manifest 认领，能在台上调、能高亮。',
  evidenced: '有定义与来源，但还没有活体演示。',
  collected: '只有采集记录，连一条来源证据都没有。',
}

/**
 * 一条语料记录的建档深度。
 *
 * 判定规则（依次短路）：
 * 1. `stageIndex.byTerm` 里有这条 id  → `staged`（有台可上，这是最强的一档）
 * 2. `sourceEvidence` 非空数组        → `evidenced`（有出处，但没演示）
 * 3. 其余                             → `collected`
 *
 * 只认 `byTerm`，不认 `entry.status`：`status` 是采集流水线自己写的
 * （220 条里 219 条是 candidate），它说不了「我们做到哪一步」。
 *
 * @param {object} record 一条 visual-atlas.json 的 entry
 * @param {{byTerm?: Map<string, unknown[]>}} [stageIndex] buildStageIndex 的产物；缺省视为「没有任何台」
 * @returns {'staged'|'evidenced'|'collected'}
 */
export function depthOf(record, stageIndex) {
  if (!record) return 'collected'
  const claims = stageIndex?.byTerm?.get?.(record.id)
  if (Array.isArray(claims) && claims.length) return 'staged'
  if (Array.isArray(record.sourceEvidence) && record.sourceEvidence.length) return 'evidenced'
  return 'collected'
}

/* ---------------- 术语地位 ---------------- */

export const TERM_STATUSES = ['standard', 'common', 'vendor', 'pending']

export const TERM_STATUS_LABEL = {
  standard: '标准术语',
  common: '行业通行',
  vendor: '厂商用语',
  pending: '待定',
}

export const TERM_STATUS_DEFINITION = {
  standard: '规范制定方对它有正式定义（W3C / WAI-ARIA APG / Open UI / WHATWG 规范的 MDN 参考）。',
  common: '至少两个互相独立的设计系统在用同一个名字。',
  vendor: '只有单一来源在用，多半是某一家自己的叫法。',
  pending: '没有任何来源证据，无法判定。',
}

/* 规范制定方的来源 id。判据是「这个来源自己就是规范或规范的官方参考」：
 *   wai-aria-apg  W3C WAI-ARIA Authoring Practices Guide（W3C 文档许可）
 *   open-ui       W3C Open UI Community Group（W3C 文档许可）
 *   mdn-css       MDN CSS Reference，条目本体是 CSS 规范里的属性
 * 其余全部按设计系统计——包括 govuk-design-system：它是一家机构的设计系统，
 * 不是规范制定方（这一条与方案 §5.5 的示例列表不同，见完成报告）。 */
export const STANDARD_SOURCE_IDS = ['wai-aria-apg', 'open-ui', 'mdn-css']

/** 一条记录用到的、去重后的来源 id。 */
export function sourceIdsOf(record) {
  const evidence = Array.isArray(record?.sourceEvidence) ? record.sourceEvidence : []
  return [...new Set(evidence.map((e) => e?.sourceId).filter(Boolean))]
}

/**
 * 一条语料记录的术语地位（自动初判，人工可覆盖）。
 *
 * 判定规则（依次短路）：
 * 1. 没有来源证据                                → `pending`
 * 2. 来源里含 STANDARD_SOURCE_IDS 任一           → `standard`
 * 3. 去重后的来源数 ≥ 2                          → `common`
 * 4. 去重后的来源数 = 1                          → `vendor`
 *
 * 人工覆盖：记录上若有 `termStanding` 且取值合法，直接采用，不再自动判。
 * 本轮语料里没有任何一条带这个字段，全部走自动判。
 *
 * @param {object} record 一条 visual-atlas.json 的 entry
 * @returns {'standard'|'common'|'vendor'|'pending'}
 */
export function termStatusOf(record) {
  if (record && TERM_STATUSES.includes(record.termStanding)) return record.termStanding
  const ids = sourceIdsOf(record)
  if (!ids.length) return 'pending'
  if (ids.some((id) => STANDARD_SOURCE_IDS.includes(id))) return 'standard'
  return ids.length >= 2 ? 'common' : 'vendor'
}

/**
 * 人工复核日期。**只有真的存在人工复核字段时才返回日期，否则返回 null。**
 *
 * 采集时间（`sourceEvidence[].retrievedAt`）不是人工复核，不能拿来顶替：
 * 前者是机器抓取的时刻，后者是有人看过并认可。当前 220 条语料一条都没有
 * 复核字段，所以本函数对全部记录返回 null，界面上显示为空而不是编一个日期。
 *
 * @param {object} record 一条 visual-atlas.json 的 entry
 * @returns {string|null} ISO 日期字符串，或 null
 */
export function reviewedAt(record) {
  const value = record?.reviewedAt || record?.humanReviewedAt || record?.review?.reviewedAt
  return typeof value === 'string' && value.trim() ? value : null
}

/* 台上有多少条中文名还是机器译名（译名欠账的记录侧判定）。
 * claim 侧的统计在 stage-index.js 的 machineNameDebt()，两边口径一致：
 * 语料标了 machine 且舞台没订正，才算欠账。 */
export function machineNameUnfixed(record, claim) {
  return record?.translationQuality === 'machine' && !claim?.termZhFix
}

/* 一条记录的两套标签一次取齐，给右栏用。 */
export function statusLabelsOf(record, stageIndex) {
  const depth = depthOf(record, stageIndex)
  const status = termStatusOf(record)
  return {
    depth,
    depthLabelZh: DEPTH_LABEL[depth],
    termStatus: status,
    termStatusLabelZh: TERM_STATUS_LABEL[status],
    reviewedAt: reviewedAt(record),
    sourceIds: sourceIdsOf(record),
  }
}

/* 分布统计：给关于页口径表与完成报告用。数字全部由传入的 entries 算出。 */
export function statusDistribution(entries, stageIndex) {
  const list = Array.isArray(entries) ? entries : []
  const depth = Object.fromEntries(DEPTHS.map((d) => [d, 0]))
  const termStatus = Object.fromEntries(TERM_STATUSES.map((s) => [s, 0]))
  let reviewed = 0
  for (const record of list) {
    depth[depthOf(record, stageIndex)] += 1
    termStatus[termStatusOf(record)] += 1
    if (reviewedAt(record)) reviewed += 1
  }
  return { total: list.length, depth, termStatus, reviewed }
}
