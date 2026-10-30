#!/usr/bin/env node
/**
 * Static search data for the production site, which has no Node server.
 * The browser runs server/discovery-handler.mjs over these files
 * (src/lib/static-discovery-api.js); only AI ranking goes over the network.
 *
 * Output: data/static-search/ (bulk component data: deployed, never committed)
 *   manifest.json                 version + file names per scope
 *   <scope>.<hash>.json           the scope index; curation units are slimmed
 *   u/<id>.json                   full card for each curation unit (fetched per result page)
 *
 * VISLEXICON_MEDIA_ORIGIN=https://media.vislexicon.com rewrites /data/discovery/... media
 * paths to the R2 origin, and puts the per-unit cards under <origin>/search-data/u:
 * 31k media files plus 18k cards exceed the Pages 20,000-file limit.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { loadDiscoveryIndex } from '../server/discovery-index.mjs'
import { projectDiscoveryCard } from '../server/discovery-refinement.mjs'
import { DISCOVERY_SCOPES } from '../src/lib/discovery-scopes.js'
import { STATIC_SEARCH_BASE, unitFileName } from '../src/lib/static-search-paths.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'data/static-search')
const MEDIA_ORIGIN = (process.env.VISLEXICON_MEDIA_ORIGIN || '').replace(/\/$/, '')
const PART_BYTES = 12e6

// Everything lexicalCandidates, explicitConflicts, browseComponents, the topic
// views and compactCandidate (ranking) read. Long English prose and
// reconstruction prompts stay in the per-unit card files.
const SLIM_KEYS = ['id', 'kind', 'scope', 'theme', 'themes', 'nameZh', 'nameEn', 'componentType', 'tags', 'descriptionZh',
  'offers', 'dimension', 'visual', 'interaction', 'unknowns', 'sourceUrl', 'verification', 'exampleQueries', 'familyId']
function slim(unit) {
  const out = Object.fromEntries(SLIM_KEYS.filter((key) => unit[key] !== undefined).map((key) => [key, unit[key]]))
  if (unit.source?.name) out.source = { name: unit.source.name }
  if (unit.codeResource?.sourceId) out.codeResource = { sourceId: unit.codeResource.sourceId }
  if (unit.relatedSites?.length) out.relatedSites = unit.relatedSites.map((site) => ({ entryId: site.entryId, offers: site.offers }))
  // lexicalCandidates also matches English prose. Keeping each distinct word once
  // (3+ letters) holds top-12 results equal to the full index at about half the size.
  const english = [unit.descriptionEn, unit.prompt].join(' ').toLowerCase().match(/[a-z0-9]+(?:[-'][a-z0-9]+)*/g) || []
  const searchEn = [...new Set(english)].filter((word) => word.length > 2).join(' ')
  if (searchEn) out.searchEn = searchEn
  if (unit.tagFacets) out.tagFacets = Object.fromEntries(Object.entries(unit.tagFacets).map(([key, values]) =>
    [key, Array.isArray(values) ? values.slice(0, 4).map((value) => (typeof value === 'string' ? value.slice(0, 80) : value)) : values]))
  return out
}
function withMedia(value) {
  if (!MEDIA_ORIGIN) return value
  return JSON.parse(JSON.stringify(value), (_key, item) => (typeof item === 'string' && item.startsWith('/data/discovery/') ? MEDIA_ORIGIN + item : item))
}
const hash = (text) => crypto.createHash('sha256').update(text).digest('hex').slice(0, 12)

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(path.join(OUT, 'u'), { recursive: true })
const manifest = { schemaVersion: 'vislexicon.static-search/1', generatedAt: new Date().toISOString(), mediaOrigin: MEDIA_ORIGIN || null,
  cardsBase: `${MEDIA_ORIGIN}${STATIC_SEARCH_BASE}/u`, scopes: {} }
for (const scope of Object.keys(DISCOVERY_SCOPES)) {
  const index = withMedia(await loadDiscoveryIndex(ROOT, scope))
  const lite = scope === 'curation'
  const units = lite ? index.units.map(slim) : index.units
  const body = JSON.stringify(lite ? { ...index, units, slimUnits: true } : index)
  const file = `${scope}.${hash(body)}.json`
  // Cloudflare Pages caps a file at 25 MiB: larger indexes go out as parts of about
  // 12 MB, listed in unitParts and joined by src/lib/static-discovery-api.js.
  const partCount = Math.ceil(body.length / PART_BYTES)
  if (partCount > 1) {
    const size = Math.ceil(units.length / partCount)
    const unitParts = Array.from({ length: partCount }, (_, i) => {
      const part = JSON.stringify({ units: units.slice(i * size, (i + 1) * size) })
      const name = `${scope}.${hash(part)}.part${i}.json`
      fs.writeFileSync(path.join(OUT, name), part)
      return name
    })
    fs.writeFileSync(path.join(OUT, file), JSON.stringify({ ...index, units: [], unitParts, slimUnits: lite || undefined }))
  } else fs.writeFileSync(path.join(OUT, file), body)
  if (lite) for (const unit of index.units) fs.writeFileSync(path.join(OUT, 'u', unitFileName(unit.id)), JSON.stringify(projectDiscoveryCard(unit)))
  manifest.scopes[scope] = { file, units: index.units.length, bytes: body.length, slimUnits: lite }
  console.log(`[static-search] ${scope}: ${index.units.length} units, ${(body.length / 1e6).toFixed(1)} MB${lite ? ' (slim) + per-unit cards' : ''}`)
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`[static-search] → ${path.relative(ROOT, OUT)}`)
