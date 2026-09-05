import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import test from 'node:test'

import {
  ALLOWED_CATEGORIES,
  canonicalizeUrl,
  validateSiteCatalog,
} from '../scripts/build-site-catalog.mjs'

const catalogUrl = new URL('../src/data/site-catalog.json', import.meta.url)
const publicIndexUrl = new URL('../public/data/site-catalog-index.json', import.meta.url)
const collectorUrl = new URL('../scripts/collect-design-resources.mjs', import.meta.url)
const builderUrl = new URL('../scripts/build-site-catalog.mjs', import.meta.url)

async function loadCatalog() {
  return JSON.parse(await readFile(catalogUrl, 'utf8'))
}

test('URL canonicalization removes tracking noise while preserving meaningful paths', () => {
  assert.equal(
    canonicalizeUrl('http://WWW.Example.com/path/?utm_source=toools&ref=directory#hero'),
    'https://example.com/path',
  )
  assert.equal(
    canonicalizeUrl('https://github.com/acme/tool/?tab=readme-ov-file'),
    'https://github.com/acme/tool',
  )
})

test('generated site catalog satisfies the import contract', async () => {
  const catalog = await loadCatalog()

  assert.equal(catalog.schemaVersion, 1)
  assert.ok(Array.isArray(catalog.sources) && catalog.sources.length >= 4)
  assert.ok(Array.isArray(catalog.entries) && catalog.entries.length >= 8_000)
  assert.equal(catalog.stats.totalEntries, catalog.entries.length)
  assert.equal(
    catalog.stats.mergedDuplicateRows,
    catalog.stats.rawRecords - catalog.stats.totalEntries,
  )
  assert.equal(
    catalog.stats.mergedDuplicateRows,
    catalog.stats.withinSourceDuplicateRows + catalog.stats.crossSourceOverlaps,
  )
  assert.deepEqual(validateSiteCatalog(catalog), [])
})

test('catalog validation rejects fallback-tainted sources and dishonest publication states', async () => {
  const catalog = await loadCatalog()
  const broken = structuredClone(catalog)
  broken.sources[0].failures = [{ message: 'network failed', usedFallback: true }]
  broken.entries[0].reviewStatus = 'published'
  broken.entries[0].evidenceLevel = 'unknown'

  const errors = validateSiteCatalog(broken)
  assert.ok(errors.some((error) => error.includes('source failures')))
  assert.ok(errors.some((error) => error.includes('reviewStatus')))
  assert.ok(errors.some((error) => error.includes('evidenceLevel')))
})

test('collectors fail closed and the builder validates before atomic replacement', async () => {
  const collector = await readFile(collectorUrl, 'utf8')
  const builder = await readFile(builderUrl, 'utf8')

  assert.match(collector, /if \(options\.offline\)[\s\S]*?collectFromFallback/)
  assert.doesNotMatch(collector, /catch \(error\)[\s\S]*?collectFromFallback/)
  assert.match(builder, /const errors = validateSiteCatalog\(catalog\)[\s\S]*?writeCatalogOutputsAtomically/)
  assert.match(builder, /rename\(fullTemp, output\)/)
  assert.match(builder, /rename\(indexTemp, indexOutput\)/)
})

test('catalog entries are canonical, de-duplicated, categorized, Chinese-described, and evidenced', async () => {
  const { entries } = await loadCatalog()
  const ids = new Set()
  const canonicalUrls = new Set()

  for (const entry of entries) {
    assert.match(entry.id, /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{8}$/)
    assert.equal(ids.has(entry.id), false, `duplicate id: ${entry.id}`)
    ids.add(entry.id)

    assert.equal(entry.canonicalUrl, canonicalizeUrl(entry.canonicalUrl))
    assert.equal(canonicalUrls.has(entry.canonicalUrl), false, `duplicate URL: ${entry.canonicalUrl}`)
    canonicalUrls.add(entry.canonicalUrl)

    assert.ok(ALLOWED_CATEGORIES.includes(entry.category), `unknown category: ${entry.category}`)
    assert.match(entry.descriptionZh, /[\u3400-\u9fff]/u, `${entry.id} needs a Chinese intro`)
    assert.ok(entry.descriptionZh.length >= 8 && entry.descriptionZh.length <= 120)
    assert.ok(['machine-translation', 'taxonomy-summary'].includes(entry.descriptionQuality))
    assert.ok(['normalized', 'unresolved-redirect'].includes(entry.canonicalizationStatus))
    assert.ok(Array.isArray(entry.sourceEvidence) && entry.sourceEvidence.length > 0)

    for (const evidence of entry.sourceEvidence) {
      assert.match(evidence.sourceId, /^[a-z0-9-]+$/)
      assert.match(evidence.listingUrl, /^https:\/\//)
      assert.ok(evidence.originalUrl)
      assert.ok(evidence.originalDescription)
      assert.match(evidence.collectedAt, /^\d{4}-\d{2}-\d{2}$/)
    }
  }
})

test('Chinese descriptions are aligned to exact source text with a bounded safe fallback', async () => {
  const catalog = await loadCatalog()
  const translated = catalog.entries.filter(
    ({ descriptionQuality }) => descriptionQuality === 'machine-translation',
  )
  const fallback = catalog.entries.filter(
    ({ descriptionQuality }) => descriptionQuality === 'taxonomy-summary',
  )

  // 原始 3224 条机器翻译保持不变；新增的大规模候选源（npm/ecosystem/saaslandingpage）
  // 暂用 taxonomy 摘要兜底，随后由站点富化（enrich-sites）用真实访问信息替换。
  assert.ok(translated.length >= 3_200)
  assert.ok(fallback.length >= 4_000)
  assert.equal(catalog.stats.chineseDescriptions.machineTranslated, translated.length)
  assert.equal(catalog.stats.chineseDescriptions.taxonomyFallback, fallback.length)
  assert.equal(catalog.transformations.chineseDescriptions.failureCount, 3)
})

test('Toools provenance covers every declared category page', async () => {
  const catalog = await loadCatalog()
  const source = catalog.sources.find(({ id }) => id === 'toools-design')
  const evidencedEntries = catalog.entries.filter((entry) =>
    entry.sourceEvidence.some(({ sourceId }) => sourceId === 'toools-design'),
  )

  assert.ok(source, 'missing Toools source manifest')
  assert.ok(source.listingPages.length >= 18, 'Toools must include every category page')
  assert.ok(source.listingPages.every(({ recordCount }) => recordCount > 0))
  assert.ok(source.rawRecordCount >= 2_200, 'Toools currently declares a 2,200+ directory')
  assert.equal(source.recordCount, evidencedEntries.length)
  assert.ok(source.recordCount >= 2_200)
})

test('the outside expansion retains at least one thousand evidenced GitHub directory entries', async () => {
  const catalog = await loadCatalog()
  const source = catalog.sources.find(({ id }) => id === 'design-resources-for-developers')
  const evidencedEntries = catalog.entries.filter((entry) =>
    entry.sourceEvidence.some(({ sourceId }) => sourceId === source.id),
  )

  assert.ok(source)
  assert.ok(source.rawRecordCount >= 1_000)
  assert.equal(source.recordCount, evidencedEntries.length)
  assert.ok(source.recordCount >= 1_000)
})

test('browser index keeps every candidate under two megabytes without provenance payloads', async () => {
  const catalog = await loadCatalog()
  const index = JSON.parse(await readFile(publicIndexUrl, 'utf8'))
  const indexStats = await stat(publicIndexUrl)

  assert.equal(index.schemaVersion, 1)
  assert.equal(index.generatedAt, catalog.generatedAt)
  assert.equal(index.total, catalog.entries.length)
  assert.deepEqual(index.categoryCounts, catalog.stats.byCategory)
  assert.equal(index.entries.length, catalog.entries.length)
  assert.ok(indexStats.size <= 6_000_000, `browser index is ${indexStats.size} bytes`)

  const requiredKeys = [
    'canonicalUrl',
    'category',
    'descriptionZh',
    'evidenceLevel',
    'id',
    'name',
    'pricing',
    'reviewStatus',
    'sourceIds',
    'subcategories',
    'tags',
  ]
  const optionalKeys = [
    'shots',
    'author',
    'github',
    'liveTitle',
    'liveDescription',
    'tech',
    'siteStatus',
    'siteError',
  ]
  for (const [entryIndex, entry] of index.entries.entries()) {
    for (const key of requiredKeys) {
      assert.ok(key in entry, `entry ${entryIndex} missing required key ${key}`)
    }
    for (const key of Object.keys(entry)) {
      assert.ok(
        requiredKeys.includes(key) || optionalKeys.includes(key),
        `entry ${entryIndex} has unexpected key ${key}`,
      )
    }
    assert.deepEqual(Object.keys(entry.pricing), ['model'])
    assert.ok(entry.sourceIds.length > 0, `entry ${entryIndex} needs source ids`)
    assert.equal('sourceEvidence' in entry, false)
    assert.equal('descriptionOriginal' in entry, false)
  }
})
