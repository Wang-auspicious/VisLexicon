/* ============ 图鉴术语 → 已核验站点 的反查（方案 §2.2 导流点 L6） ============
 *
 * 「这条术语在真实网站里长什么样」有两条来路，成色不同，必须分开标：
 *
 *   1. 编辑标注（annotation）—— 站点条目的 `curation.atlasTerms[]` 明写了
 *      「这个站示范了这条术语」，还带 evidenceUrl 与一句 note。成色由
 *      `atlasTermsStatus` 自述（本轮 12/12 是 editor-draft，前台标「编辑草稿」）。
 *   2. 域名反查（domain）—— 术语的 sourceEvidence 里那条 URL 的域名，恰好
 *      等于某个已核验站点的域名。它只说明「这条词的出处正好是这个站」，
 *      不等于「这个站示范了这条词」，所以在界面上说法要弱一档。
 *
 * 同一个站两条来路都命中时，按编辑标注算（它更强），不重复出现。
 * 本模块是纯函数，不 import 任何数据文件，也不含统计量字面量。
 */

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

const itemsOf = (siteIndex) => {
  if (Array.isArray(siteIndex)) return siteIndex
  if (Array.isArray(siteIndex?.items)) return siteIndex.items
  if (Array.isArray(siteIndex?.entries)) return siteIndex.entries
  return []
}

/** 一条站点条目在术语面板里要显示的那几个字段。 */
function siteRef(item) {
  return {
    entryId: item?.entryId ?? item?.id ?? '',
    name: item?.name ?? item?.entryId ?? '',
    domain: item?.domain ?? hostOf(item?.homepage || item?.canonicalUrl || '') ?? '',
    atlasTermsStatus: item?.atlasTermsStatus ?? null,
  }
}

/** 域名 → 站点条目。同域只留第一条。 */
export function buildDomainIndex(siteIndex) {
  const map = new Map()
  for (const item of itemsOf(siteIndex)) {
    const key = String(item?.domain || hostOf(item?.homepage || item?.canonicalUrl || ''))
      .replace(/^www\./, '')
      .toLowerCase()
    if (key && !map.has(key)) map.set(key, item)
  }
  return map
}

/**
 * 术语 id → 标注了它的站点列表（编辑标注侧的反向索引）。
 * 一个站可以标注同一条术语多次（不同 stageId），这里按 entryId 去重取第一条。
 */
export function buildAtlasTermIndex(siteIndex) {
  const map = new Map()
  for (const item of itemsOf(siteIndex)) {
    for (const ref of item?.atlasTerms ?? []) {
      const termId = ref?.termId
      if (!termId) continue
      if (!map.has(termId)) map.set(termId, [])
      const bucket = map.get(termId)
      if (bucket.some((hit) => hit.entryId === (item?.entryId ?? item?.id))) continue
      bucket.push({
        ...siteRef(item),
        matchedBy: 'annotation',
        stageId: ref?.stageId ?? null,
        evidenceUrl: ref?.evidenceUrl ?? null,
        noteZh: ref?.note ?? null,
      })
    }
  }
  return map
}

/** 两份索引一次建齐，供舞台页在挂载时构建一次后复用。 */
export function buildSiteLinkIndexes(siteIndex) {
  return {
    byTerm: buildAtlasTermIndex(siteIndex),
    byDomain: buildDomainIndex(siteIndex),
  }
}

/**
 * 一条术语在站点库里的示范条目。编辑标注在前，域名反查在后。
 * @param {object} term 一条 visual-atlas.json 的 entry
 * @param {{byTerm?: Map, byDomain?: Map}} indexes buildSiteLinkIndexes 的产物
 */
export function sitesForTerm(term, indexes) {
  const out = []
  const seen = new Set()

  for (const hit of indexes?.byTerm?.get?.(term?.id) ?? []) {
    if (seen.has(hit.entryId)) continue
    seen.add(hit.entryId)
    out.push(hit)
  }

  const byDomain = indexes?.byDomain
  if (byDomain) {
    for (const evidence of term?.sourceEvidence ?? []) {
      const host = hostOf(evidence?.url || '')
      if (!host) continue
      const item = byDomain.get(host)
      if (!item) continue
      const ref = siteRef(item)
      if (!ref.entryId || seen.has(ref.entryId)) continue
      seen.add(ref.entryId)
      out.push({
        ...ref,
        matchedBy: 'domain',
        stageId: null,
        evidenceUrl: evidence?.url ?? null,
        noteZh: null,
      })
    }
  }

  return out
}
