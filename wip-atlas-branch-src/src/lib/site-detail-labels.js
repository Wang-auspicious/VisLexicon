/**
 * 站点详情页用到的中文标签字典。
 *
 * 切面值的中文名**不在这里发明**：一律取自 `src/data/curation-taxonomy.js` 的
 * `CURATION_FACET_AXES`（已审核过的 [id, label] 表）。字典里查不到的值原样显示 id，
 * 不猜、不译。这里只额外定义两组本文件独有的东西：12 条切面轴的中文名，
 * 与 facts[].field 的中文名。
 */
import { CURATION_FACET_AXES } from '../data/curation-taxonomy.js'

const FACET_LABEL_BY_AXIS = new Map(
  Object.entries(CURATION_FACET_AXES).map(([axis, records]) => [
    axis,
    new Map(records.map((record) => [record.id, record.label])),
  ]),
)

/** 切面值 → 中文标签；查不到就原样返回该值。 */
export function facetLabel(axis, value) {
  return FACET_LABEL_BY_AXIS.get(axis)?.get(value) ?? value
}

/** 12 条切面轴的中文名（顺序即档案区的显示顺序）。 */
export const FACET_AXIS_LABELS = Object.freeze({
  deliverables: '产物',
  actions: '可做的动作',
  access: '取用条件',
  licenses: '许可',
  contentOrganization: '内容组织',
  scenarios: '场景',
  media: '媒介',
  platforms: '平台',
  technologies: '技术',
  workflowStages: '流程阶段',
  audiences: '面向谁',
  languages: '语言',
})

/** facts[].field → 中文名；未登记的 field 原样显示。 */
export const FACT_FIELD_LABELS = Object.freeze({
  author: '作者',
  organization: '组织',
  license: '许可',
  pricing: '定价',
  repository: '仓库',
  repositoryStatus: '仓库状态',
  package: '包',
  repositoryLicenseFile: '仓库许可文件',
  officialRelationship: '与官方的关系',
})

export function factFieldLabel(field) {
  return FACT_FIELD_LABELS[field] ?? field
}

/** 三张证据图的角色标签（方案 §4.6）。 */
export const PAGE_ROLE_LABELS = Object.freeze({
  identity: '身份',
  breadth: '范围',
  proof: '事实证明',
})

export function pageRoleLabel(role) {
  return PAGE_ROLE_LABELS[role] ?? role
}

/** unknown 一律显示为「未知」，不隐藏、不留空（方案 §8）。 */
export const UNKNOWN_ZH = '未知'

export function isUnknown(value) {
  return typeof value === 'string' && value.trim().toLowerCase() === 'unknown'
}

/** ISO 时间戳 → YYYY-MM-DD；拿不到就返回 null，由调用方显示「未知」。 */
export function isoDate(value) {
  if (typeof value !== 'string') return null
  const match = value.match(/^\d{4}-\d{2}-\d{2}/)
  return match ? match[0] : null
}

export function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}
