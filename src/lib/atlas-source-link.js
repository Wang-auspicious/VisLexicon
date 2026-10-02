/* 图鉴术语 → 网站库入口的反查。
 * 术语的 sourceEvidence 里带原始 URL；网站库条目带 domain。
 * 同域即认为是同一个来源实体，右栏据此把"这个词从哪来"接到"去哪个站看更多"。
 */

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

export function buildDomainIndex(catalog) {
  const map = new Map()
  for (const entry of catalog?.entries || []) {
    const key = String(entry.domain || hostOf(entry.canonicalUrl || '')).replace(/^www\./, '').toLowerCase()
    if (key && !map.has(key)) map.set(key, entry)
  }
  return map
}

export function catalogMatchesFor(term, domainIndex) {
  const seen = new Set()
  const out = []
  for (const evidence of term?.sourceEvidence || []) {
    const host = hostOf(evidence.url || '')
    if (!host || seen.has(host)) continue
    seen.add(host)
    const hit = domainIndex.get(host)
    if (hit) out.push({ host, entry: hit })
  }
  return out
}
