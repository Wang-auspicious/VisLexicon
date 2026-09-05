import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { evidenceBundleErrors } from '../../src/lib/curation-evidence.js'
import { readImageMetadata } from './image-metadata.mjs'

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIRECTORY, '../..')
const SAFE_ID = /^[a-z0-9][a-z0-9_-]{0,127}$/u

function fail(message, cause) {
  throw new TypeError(message, cause ? { cause } : undefined)
}

function jsonBytes(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function clone(value) {
  return structuredClone(value)
}

function reviewFactToEvidence(fact, facets = {}) {
  if (!fact || fact.verdict !== 'PASS') fail(`fact ${fact?.field ?? '<unknown>'} is not PASS`)
  if (typeof fact.field !== 'string' || !fact.field.trim()) fail('review fact field is required')
  if (typeof fact.confirmedValue !== 'string' || !fact.confirmedValue.trim()) {
    fail(`review fact ${fact.field} has no confirmedValue`)
  }
  if (!Array.isArray(fact.sourceUrls) || fact.sourceUrls.length === 0) {
    fail(`review fact ${fact.field} must include a direct source URL`)
  }
  const sourceUrl = fact.sourceUrls.find((url) => {
    try { return new URL(url).protocol === 'https:' } catch { return false }
  })
  if (!sourceUrl) fail(`review fact ${fact.field} has no HTTPS source URL`)
  const sources = fact.sourceUrls.join('；')
  const evidence = [fact.scopeNote, fact.reason, `独立复核来源：${sources}`]
    .filter((value) => typeof value === 'string' && value.trim())
    .join('；')
  let field = fact.field.trim()
  const reviewedValue = fact.confirmedValue.trim()
  // Link facts have a stricter validator contract. Preserve an independently
  // reviewed "unknown repository" as a status fact instead of emitting an
  // invalid non-URL value under the repository link field.
  if (field.toLowerCase() === 'repository' && !/^https:\/\//iu.test(reviewedValue)) {
    field = 'repositoryStatus'
  }
  // The v3 facet dictionary intentionally uses `custom` for licenses that are
  // explicit but not a single SPDX identifier (for example CC BY-NC-ND).
  // Keep the exact reviewed wording in evidence while projecting the
  // controlled license value to `custom` so the rights gate remains honest.
  const value = field.toLowerCase() === 'license' &&
    Array.isArray(facets.licenses) &&
    facets.licenses.length === 1 &&
    facets.licenses[0] === 'custom' &&
    reviewedValue.toLowerCase() !== 'custom'
    ? 'custom'
    : reviewedValue
  return {
    field,
    value,
    sourceUrl,
    evidence: evidence || `独立复核确认 ${fact.field}`,
    confidence: 1,
  }
}

function mergePage(draftPage, reviewPage, reviewShot, entryId) {
  if (!draftPage || !reviewPage || !reviewShot) fail(`review page record is incomplete for ${entryId}`)
  if (reviewPage.verdict !== 'PASS' || reviewShot.verdict !== 'PASS') {
    fail(`review page or shot is not PASS for ${entryId}/${draftPage.role}`)
  }
  const src = typeof draftPage.shot?.src === 'string'
    ? draftPage.shot.src.replace(/^\/shots\/[^/]+\//u, `/shots/${entryId}/`)
    : null
  if (!src) fail(`draft shot path is missing for ${entryId}/${draftPage.role}`)
  if (reviewShot.src && reviewShot.src.replace(/^\/shots\/[^/]+\//u, `/shots/${entryId}/`) !== src) {
    fail(`review shot path mismatch for ${entryId}/${draftPage.role}`)
  }
  if (reviewShot.sha256 && reviewShot.sha256 !== draftPage.shot.sha256) {
    fail(`review shot hash mismatch for ${entryId}/${draftPage.role}`)
  }
  return {
    role: draftPage.role,
    sourceUrl: draftPage.sourceUrl,
    finalUrl: draftPage.finalUrl,
    title: draftPage.title,
    selectionRationale: draftPage.selectionRationale,
    shot: {
      ...clone(draftPage.shot),
      src,
    },
  }
}

async function assembleDraft(draft, review, options) {
  if (!review || review.verdict !== 'PASS' || review.reviewPassed !== true) {
    fail(`independent review is not PASS for ${draft.siteId}`)
  }
  const confirmed = review.confirmedClassification
  if (!confirmed || confirmed.status !== 'confirmed') fail(`confirmed classification missing for ${draft.siteId}`)
  const entryId = confirmed.entryId ?? draft.classification?.entryId
  const entityId = confirmed.entityId ?? draft.entity?.entityId
  if (!SAFE_ID.test(entryId ?? '') || !SAFE_ID.test(entityId ?? '')) {
    fail(`entry/entity id is unsafe for ${draft.siteId}`)
  }
  const classification = clone(confirmed)
  delete classification.name
  if (classification.recordLevel === 'entry') delete classification.entryId
  classification.entityId = entityId
  classification.alternatives = []
  classification.status = 'confirmed'
  classification.curatorId = draft.qa?.curatorId ?? classification.curatorId
  classification.reviewerId = review.reviewerId ?? classification.reviewerId
  classification.confirmedAt = review.reviewedAt ?? classification.confirmedAt

  const reviewFacts = Array.isArray(review.facts) ? review.facts : []
  const facts = reviewFacts.map((fact) => reviewFactToEvidence(fact, review.confirmedFacets))
  const fields = facts.map(({ field }) => field.toLowerCase())
  if (new Set(fields).size !== fields.length) fail(`review facts contain duplicate fields for ${draft.siteId}`)
  const pricingFact = facts.find(({ field }) => field.toLowerCase() === 'pricing')
  const pagesByRole = new Map((review.pageVerdicts ?? []).map((page) => [page.role, page]))
  const shotsByRole = new Map((review.shotVerdicts ?? []).map((shot) => [shot.role, shot]))
  const pages = (draft.pages ?? []).map((page) => mergePage(
    page,
    pagesByRole.get(page.role),
    shotsByRole.get(page.role),
    entryId,
  ))
  const bundle = {
    schemaVersion: 3,
    entryId,
    entityId,
    attemptId: `editorial-${draft.batchId ?? 'batch'}-${draft.siteId}-v3-${sha256(Buffer.from(JSON.stringify(draft))).slice(0, 12)}`,
    status: 'APPROVED',
    official: clone(draft.official),
    editorial: {
      name: draft.research?.name ?? draft.classification?.name ?? draft.entity?.name ?? draft.siteId,
      descriptionZh: draft.research?.descriptionZh,
      pricing: pricingFact?.value ?? 'Pricing not stated in reviewed facts',
    },
    classification,
    facets: clone(review.confirmedFacets),
    pages,
    facts,
    qa: {
      curatorId: classification.curatorId,
      technicalPassed: true,
      semanticReviewerId: classification.reviewerId,
      semanticPassed: true,
      editorialReviewerId: classification.reviewerId,
    },
  }
  const errors = evidenceBundleErrors(bundle)
  if (errors.length > 0) fail(`assembled v3 bundle is invalid for ${draft.siteId}: ${errors.join('; ')}`)

  if (options.publicRoot) {
    for (const page of bundle.pages) {
      const filePath = join(resolve(options.publicRoot), page.shot.src.replace(/^\//u, ''))
      const metadata = await readImageMetadata(filePath)
      if (
        metadata.sha256 !== page.shot.sha256 ||
        metadata.width !== page.shot.width ||
        metadata.height !== page.shot.height ||
        metadata.bytes !== page.shot.bytes
      ) {
        fail(`shot metadata mismatch for ${draft.siteId}/${page.role}`)
      }
    }
  }
  return bundle
}

export async function assembleReviewedBatch(options = {}) {
  const batchDir = resolve(options.batchDir ?? join(DEMO_ROOT, 'data', 'curation', 'research', '2026-09-01-batch-01'))
  const reviewPath = resolve(options.reviewPath ?? join(batchDir, 'independent-review.json'))
  const outputDir = resolve(options.outputDir ?? join(DEMO_ROOT, 'data', 'curation', 'staging', 'batch-v3'))
  const review = JSON.parse(await readFile(reviewPath, 'utf8'))
  const reviewById = new Map((review.sites ?? []).map((site) => [site.siteId, site]))
  const names = (await readdir(batchDir)).filter((name) => (
    name.endsWith('.json') &&
    name !== basename(reviewPath) &&
    name !== 'independent-review.json' &&
    !name.includes('report')
  ))
  const drafts = []
  for (const name of names.sort()) drafts.push(JSON.parse(await readFile(join(batchDir, name), 'utf8')))
  if (drafts.length === 0) fail('no batch drafts found')
  const bundles = []
  for (const draft of drafts) bundles.push(await assembleDraft(draft, reviewById.get(draft.siteId), options))
  bundles.sort((left, right) => left.entryId.localeCompare(right.entryId))
  const seenShots = new Set()
  for (const bundle of bundles) {
    for (const page of bundle.pages) {
      if (seenShots.has(page.shot.sha256)) fail(`duplicate screenshot hash in batch: ${page.shot.sha256}`)
      seenShots.add(page.shot.sha256)
    }
  }
  await mkdir(outputDir, { recursive: true })
  for (const bundle of bundles) {
    await writeFile(join(outputDir, `${bundle.entryId}.json`), jsonBytes(bundle), 'utf8')
  }
  return { batchDir, outputDir, entryIds: bundles.map(({ entryId }) => entryId), bundles }
}

export async function main() {
  const result = await assembleReviewedBatch({ publicRoot: join(DEMO_ROOT, 'public') })
  console.log(`Assembled ${result.entryIds.length} reviewed v3 bundles in ${result.outputDir}`)
  return result
}

const invokedPath = process.argv[1]
if (invokedPath && pathToFileURL(resolve(invokedPath)).href === import.meta.url) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
