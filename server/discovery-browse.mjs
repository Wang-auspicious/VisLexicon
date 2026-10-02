import { projectDiscoveryCard } from './discovery-refinement.mjs'

function sourceKey(unit) {
  try { return new URL(unit.sourceUrl).hostname } catch { return 'unknown' }
}
// The caller supplies the published curation index. Drafts and other scopes
// never enter this catalog; browsing does not invoke semantic ranking.
export function browseComponents(index, { source = '', type = '', q = '', page = 1, limit = 24 } = {}) {
  if (index.scope !== 'curation') throw Error('INVALID_SCOPE')
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 48 || q.length > 200) throw Error('INVALID_PAGE')
  const components = index.units.filter(unit => unit.kind === 'website-component')
  const sources = new Map(), types = new Map()
  for (const unit of components) {
    const id = sourceKey(unit)
    const existing = sources.get(id) || { id, name: unit.source?.name || id, count: 0 }
    existing.count++
    sources.set(id, existing)
    const componentType = unit.componentType || 'component'
    types.set(componentType, (types.get(componentType) || 0) + 1)
  }
  const query = q.trim().toLowerCase()
  const matching = components.filter(unit => (!source || sourceKey(unit) === source)
    && (!type || (unit.componentType || 'component') === type)
    && (!query || [unit.nameZh, unit.nameEn, unit.source?.name, unit.componentType, ...(unit.tags || [])].join(' ').toLowerCase().includes(query)))
  // A stable ID order makes every record reachable without skips or duplicates.
  matching.sort((a, b) => a.id.localeCompare(b.id, 'en'))
  const pages = Math.max(1, Math.ceil(matching.length / limit))
  const current = Math.min(page, pages)
  return {
    scope: 'curation', indexVersion: index.generatedAt, total: matching.length, allCount: components.length,
    page: current, pages, limit,
    sources: [...sources.values()].sort((a, b) => a.name.localeCompare(b.name, 'en')),
    types: [...types].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([id, count]) => ({ id, count })),
    units: matching.slice((current - 1) * limit, current * limit).map(projectDiscoveryCard),
  }
}
