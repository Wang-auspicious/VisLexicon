/**
 * 详情页“风格”一行（Spec §2.6.1）。数据由 scripts/style/site-style.mjs 生成，这里只读。
 *
 * 显示规则：
 * - 不适用（工具、库、知识、合集）→ 不显示这一行（返回 null）；
 * - 无样式组件库 → 「无默认样式」；
 * - 截图里看不到组件、或没通过检查 → 不显示，重拍清单由构建门禁管理；
 * - 多作者社区且风格不一 → 「风格多样」打头，再跟最多两个最常见的词；
 * - 其余 → 词表里的词，最多三个，按主次排。
 */
import data from '../data/site-style.json' with { type: 'json' }

const TEXT = {
  zh: { unstyled: '无默认样式', mixed: '风格多样' },
  en: { unstyled: 'Unstyled', mixed: 'Mixed styles' },
}

export function siteStylePills(entryId, locale) {
  const lang = locale === 'en' ? 'en' : 'zh'
  const entry = data.entries?.[entryId]
  if (!entry || entry.subject === null) return null
  if (entry.unstyled) return [TEXT[lang].unstyled]
  const words = (entry.styles || []).map((style) => data.labels?.[style.id]?.[lang]).filter(Boolean)
  if (entry.subjectVisible === false || words.length === 0 || entry.failed) return null
  return entry.mixed ? [TEXT[lang].mixed, ...words] : words
}

/** 风格签名：一句话说组件长什么样（给 Agent 和检索用；没有就返回空串）。 */
export function siteStyleSignature(entryId) {
  return siteStylePills(entryId, 'zh') ? data.entries?.[entryId]?.signatureZh || '' : ''
}
