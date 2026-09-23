import crypto from 'node:crypto'
import { applyModelRanking, rerankPool } from '../src/lib/component-discovery.js'

// A search response keeps the full qualified set, including matches beyond the
// first page of cards. The browser only carries a short, opaque handle.
export function createRefinementStore({ maxEntries = 512 } = {}) {
  const snapshots = new Map()

  function resolve(token, query, index) {
    if (!token) return { mode: 'initial' }
    const snapshot = snapshots.get(token)
    if (!snapshot) return { mode: 'reset', reason: 'expired' }
    if (snapshot.scope !== index.scope || snapshot.theme !== index.theme || snapshot.indexVersion !== index.generatedAt) {
      return { mode: 'reset', reason: 'index-or-topic-changed' }
    }
    if (!query.startsWith(snapshot.query) || query.length <= snapshot.query.length) {
      return { mode: 'reset', reason: 'query-changed' }
    }
    snapshots.delete(token)
    snapshots.set(token, snapshot)
    return { mode: 'refined', ids: snapshot.ids, previousQuery: snapshot.query }
  }

  function save(query, index, candidates, rows) {
    const ids = applyModelRanking(query, candidates.map(row => row.unit), rows)
      .filter(row => row.score >= 1.4)
      .map(row => row.unit.id)
    const token = crypto.randomBytes(16).toString('hex')
    const candidateDigest = crypto.createHash('sha256').update(JSON.stringify(ids)).digest('hex')
    snapshots.set(token, { query, scope: index.scope, theme: index.theme, indexVersion: index.generatedAt, ids, candidateDigest })
    while (snapshots.size > maxEntries) snapshots.delete(snapshots.keys().next().value)
    return token
  }

  function page(token, index, byId, offset = 0, limit = 12) {
    const snapshot = snapshots.get(token)
    if (!snapshot || snapshot.scope !== index.scope || snapshot.theme !== index.theme || snapshot.indexVersion !== index.generatedAt) return null
    snapshots.delete(token)
    snapshots.set(token, snapshot)
    return {
      total: snapshot.ids.length,
      units: snapshot.ids.slice(offset, offset + limit).map(id => byId.get(id)).filter(Boolean),
    }
  }

  return { resolve, save, page }
}

export function selectDiscoveryCandidates(query, index, byId, store, token, limit = 32) {
  const refinement = store.resolve(token, query, index)
  const source = refinement.mode === 'refined'
    ? refinement.ids.map(id => byId.get(id)).filter(Boolean)
    : index.units
  return {
    candidates: rerankPool(query, source, limit),
    sourceCandidateCount: source.length,
    refinement: refinement.mode,
    resetReason: refinement.reason,
  }
}

// Card payloads exclude the large measured/search-only fields. Ranking and
// explicit constraints have already been applied on the server.
export function projectDiscoveryCard(unit) {
  const { id, kind, nameZh, nameEn, descriptionZh, descriptionEn, sectionsZh, sectionsEn,
    previewUrl, previewKind, source, sourceUrl, offers, relatedSites, tags, tagFacets,
    detailUrl, resourceType } = unit
  return { id, kind, nameZh, nameEn, descriptionZh, descriptionEn, sectionsZh, sectionsEn,
    previewUrl, previewKind, source, sourceUrl, offers, relatedSites, tags, tagFacets,
    detailUrl, resourceType }
}

export function summarizeDiscoveryIndex(index) {
  const meta = new Map([['', { count: 0, componentCount: 0, curatedSiteCount: 0, examples: [] }]])
  for (const theme of index.themes) meta.set(theme, { count: 0, componentCount: 0, curatedSiteCount: 0, examples: [] })
  for (const unit of index.units) {
    const themes = new Set(['', unit.theme, ...(unit.themes || [])].filter(theme => theme !== undefined && theme !== null))
    for (const theme of themes) {
      const row = meta.get(theme)
      if (!row) continue
      row.count++
      if (unit.kind === 'website-component') row.componentCount++
      if (unit.kind === 'curated-site') row.curatedSiteCount++
      for (const example of unit.exampleQueries || []) {
        if (row.examples.length >= 4) break
        if (!row.examples.includes(example)) row.examples.push(example)
      }
    }
  }
  return {
    schemaVersion: index.schemaVersion,
    generatedAt: index.generatedAt,
    scope: index.scope,
    theme: index.theme,
    themes: index.themes,
    counts: index.counts,
    examples: index.examples,
    themeMeta: Object.fromEntries(meta),
  }
}
