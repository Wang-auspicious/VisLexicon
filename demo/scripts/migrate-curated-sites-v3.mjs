import { createHash } from 'node:crypto'
import {
  access,
  mkdir,
  open,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
} from 'node:fs/promises'
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { canonicalizeFacets, facetsErrors } from '../src/data/curation-taxonomy.js'
import { evidenceBundleErrors, toPublicSite } from '../src/lib/curation-evidence.js'
import { publishOutputTransaction } from './migrate-curated-sites-v2.mjs'

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIRECTORY, '..')
const SHA_256 = /^[a-f\d]{64}$/u
const ARRAY_INDEX = /^(?:0|[1-9]\d*)$/u
const SITE_IDS = Object.freeze([
  'magic-ui',
  'origin-ui',
  'hover-dev',
  'shadcn-ui',
  'uiverse',
  '21st-dev',
])
const ENTITY_ID_BY_SITE_ID = Object.freeze({
  'magic-ui': 'entity-magic-ui',
  'origin-ui': 'entity-origin-ui',
  'hover-dev': 'entity-hover-dev',
  'shadcn-ui': 'entity-shadcn-ui',
  uiverse: 'entity-uiverse',
  '21st-dev': 'entity-21st-dev',
})
const MIGRATION_CLASSIFICATION_BY_SITE_ID = Object.freeze({
  'magic-ui': Object.freeze({
    primaryCategory: 'ui-implementation',
    subcategory: 'page-blocks-embeddable-controls',
  }),
  'origin-ui': Object.freeze({
    primaryCategory: 'ui-implementation',
    subcategory: 'general-ui-components',
  }),
  'hover-dev': Object.freeze({
    primaryCategory: 'ui-implementation',
    subcategory: 'page-blocks-embeddable-controls',
  }),
  'shadcn-ui': Object.freeze({
    primaryCategory: 'ui-implementation',
    subcategory: 'design-system-suites',
  }),
  uiverse: Object.freeze({
    primaryCategory: 'ui-implementation',
    subcategory: 'general-ui-components',
  }),
  '21st-dev': Object.freeze({
    primaryCategory: 'ui-implementation',
    subcategory: 'general-ui-components',
  }),
})
const MANIFEST_FIELDS = new Set([
  'schemaVersion',
  'manifestId',
  'reviewerId',
  'overallVerdict',
  'reviewedAt',
  'siteIds',
  'inputHashes',
  'sites',
])
const REVIEW_SITE_FIELDS = new Set([
  'siteId',
  'sourceSiteId',
  'sourceV2BundleSha256',
  'sourceBundleSha256',
  'entryId',
  'entityId',
  'descriptionZh',
  'editorial',
  'primaryCategory',
  'subcategory',
  'classificationStatus',
  'facets',
  'classificationReasons',
  'reasons',
  'editorialReviewerId',
  'reviewedAt',
  'verdict',
  'factCorrections',
  'factVerdicts',
  'pageVerdicts',
  'shotVerdicts',
  'scopeNotes',
  'rightsNotes',
])
const EDITORIAL_FIELDS = new Set([
  'name',
  'descriptionZh',
  'pricing',
  'evidence',
  'verdict',
])
const EDITORIAL_EVIDENCE_FIELDS = new Set(['field', 'evidenceUrl', 'statement'])
const REASON_FIELDS = new Set(['statement', 'evidenceUrl'])
const FACT_CORRECTION_FIELDS = new Set([
  'operation',
  'field',
  'value',
  'sourceUrl',
  'evidence',
  'confidence',
])
const FACT_VERDICT_FIELDS = new Set([
  'field',
  'finalValue',
  'sourceUrl',
  'evidence',
  'confidence',
  'verdict',
])
const PAGE_VERDICT_FIELDS = new Set([
  'role',
  'sourceUrl',
  'finalUrl',
  'title',
  'verdict',
  'evidence',
])
const SHOT_VERDICT_FIELDS = new Set([
  'role',
  'src',
  'sha256',
  'width',
  'height',
  'verdict',
  'evidence',
])

function fail(message) {
  throw new TypeError(message)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function assertAllowedKeys(value, label, allowedFields) {
  if (
    value === null ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    (Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null)
  ) {
    fail(`${label} must be a plain object`)
  }
  const unexpected = Object.keys(value).filter((field) => !allowedFields.has(field))
  if (unexpected.length > 0) {
    fail(`${label}.${unexpected.join(', ')} ${unexpected.length === 1 ? 'is' : 'are'} not allowed`)
  }
}

function codePointLength(value) {
  return Array.from(value).length
}

function canonicalTimestamp(value, label) {
  if (!isNonEmptyString(value)) fail(`${label} must be a canonical ISO timestamp`)
  const parsed = new Date(value)
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    fail(`${label} must be a canonical ISO timestamp`)
  }
  return value
}

function httpsUrl(value, label) {
  if (!isNonEmptyString(value)) fail(`${label} must be a direct HTTPS URL`)
  try {
    if (new URL(value).protocol !== 'https:') fail(`${label} must be a direct HTTPS URL`)
  } catch {
    fail(`${label} must be a direct HTTPS URL`)
  }
  return value
}

function clone(value) {
  return structuredClone(value)
}

function snapshotPlainData(value, label, ancestors = new WeakSet()) {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return value
  }
  if (typeof value !== 'object') fail(`${label} must contain only JSON data`)

  let isArray
  let prototype
  let keys
  try {
    isArray = Array.isArray(value)
    prototype = Reflect.getPrototypeOf(value)
    keys = Reflect.ownKeys(value)
  } catch (error) {
    throw new TypeError(`${label} could not be inspected safely`, { cause: error })
  }
  if (isArray ? prototype !== Array.prototype : (
    prototype !== Object.prototype && prototype !== null
  )) {
    fail(`${label} must contain only plain JSON objects and arrays`)
  }
  if (ancestors.has(value)) fail(`${label} must not contain a cycle`)
  ancestors.add(value)

  if (isArray) {
    let lengthDescriptor
    try {
      lengthDescriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
    } catch (error) {
      throw new TypeError(`${label}.length could not be inspected safely`, { cause: error })
    }
    const length = lengthDescriptor?.value
    if (
      !lengthDescriptor ||
      !Object.hasOwn(lengthDescriptor, 'value') ||
      !Number.isSafeInteger(length) ||
      length < 0 ||
      length > 10_000
    ) {
      fail(`${label}.length must be a safe data property`)
    }
    const snapshot = new Array(length)
    const observed = new Set()
    for (const key of keys) {
      if (key === 'length') continue
      if (typeof key !== 'string') fail(`${label} contains an unexpected symbol property`)
      if (!ARRAY_INDEX.test(key) || Number(key) >= length) {
        fail(`${label}.${key} is not allowed`)
      }
      const index = Number(key)
      let descriptor
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, key)
      } catch (error) {
        throw new TypeError(`${label}[${index}] could not be inspected safely`, { cause: error })
      }
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
        fail(`${label}[${index}] must be a data property`)
      }
      observed.add(index)
      snapshot[index] = snapshotPlainData(
        descriptor.value,
        `${label}[${index}]`,
        ancestors,
      )
    }
    for (let index = 0; index < length; index += 1) {
      if (!observed.has(index)) fail(`${label}[${index}] must be a data property`)
    }
    ancestors.delete(value)
    return snapshot
  }

  const snapshot = {}
  for (const key of keys) {
    if (typeof key !== 'string') fail(`${label} contains an unexpected symbol property`)
    if (key === '__proto__') fail(`${label}.__proto__ is not allowed`)
    let descriptor
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, key)
    } catch (error) {
      throw new TypeError(`${label}.${key} could not be inspected safely`, { cause: error })
    }
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      fail(`${label}.${key} must be a data property`)
    }
    Object.defineProperty(snapshot, key, {
      configurable: true,
      enumerable: true,
      value: snapshotPlainData(descriptor.value, `${label}.${key}`, ancestors),
      writable: true,
    })
  }
  ancestors.delete(value)
  return snapshot
}

function assertSameJson(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} must exactly lock the reviewed v2 value`)
  }
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function assertExactSet(actual, expected, label) {
  if (!Array.isArray(actual)) fail(`${label} must be an array`)
  const unique = new Set(actual)
  if (
    unique.size !== actual.length ||
    unique.size !== expected.length ||
    expected.some((value) => !unique.has(value))
  ) {
    fail(`${label} must contain exactly ${expected.join(', ')}`)
  }
}

function isWithin(parentPath, candidatePath) {
  const relationship = relative(resolve(parentPath), resolve(candidatePath))
  return relationship === '' || (
    relationship !== '..' &&
    !relationship.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) &&
    !isAbsolute(relationship)
  )
}

function migrationFs(overrides) {
  const supplied = overrides && typeof overrides === 'object' ? overrides : {}
  return {
    access: supplied.access ?? access,
    mkdir: supplied.mkdir ?? mkdir,
    open: supplied.open ?? open,
    readFile: supplied.readFile ?? readFile,
    readdir: supplied.readdir ?? readdir,
    realpath: supplied.realpath ?? realpath,
    rename: supplied.rename ?? rename,
    rm: supplied.rm ?? rm,
    stat: supplied.stat ?? stat,
  }
}

function sameInode(left, right) {
  return (
    left?.metadata?.dev !== undefined &&
    left?.metadata?.ino !== undefined &&
    right?.metadata?.dev !== undefined &&
    right?.metadata?.ino !== undefined &&
    String(left.metadata.dev) === String(right.metadata.dev) &&
    String(left.metadata.ino) === String(right.metadata.ino)
  )
}

function comparablePath(filePath) {
  const absolutePath = resolve(filePath)
  return process.platform === 'win32' ? absolutePath.toLowerCase() : absolutePath
}

function identitiesAlias(left, right) {
  return (
    comparablePath(left.canonicalPath) === comparablePath(right.canonicalPath) ||
    sameInode(left, right)
  )
}

async function resolvedPathIdentity(filePath, fsAdapter, mustExist = false) {
  const absolutePath = resolve(filePath)
  try {
    const [canonicalPath, metadata] = await Promise.all([
      fsAdapter.realpath(absolutePath),
      fsAdapter.stat(absolutePath),
    ])
    return {
      absolutePath,
      canonicalPath: resolve(canonicalPath),
      exists: true,
      metadata,
    }
  } catch (error) {
    if (error?.code !== 'ENOENT' || mustExist) throw error
    const parentPath = dirname(absolutePath)
    if (parentPath === absolutePath) throw error
    const parent = await resolvedPathIdentity(parentPath, fsAdapter, false)
    return {
      absolutePath,
      canonicalPath: join(parent.canonicalPath, basename(absolutePath)),
      exists: false,
      metadata: null,
    }
  }
}

function validateReasons(review) {
  if (!Array.isArray(review.classificationReasons) || review.classificationReasons.length === 0) {
    fail('classificationReasons must contain at least one reviewed reason')
  }
  assertSameJson(review.reasons, review.classificationReasons, 'reasons')
  for (const [index, reason] of review.classificationReasons.entries()) {
    assertAllowedKeys(reason, `classificationReasons[${index}]`, REASON_FIELDS)
    if (!reason || !isNonEmptyString(reason.statement)) {
      fail(`classificationReasons[${index}].statement must be non-empty`)
    }
    httpsUrl(reason.evidenceUrl, `classificationReasons[${index}].evidenceUrl`)
  }
}

function validateReviewedEditorial(review) {
  const editorial = review.editorial
  assertAllowedKeys(editorial, 'review editorial', EDITORIAL_FIELDS)
  if (editorial.verdict !== 'PASS') fail('review editorial verdict must be PASS')
  for (const field of ['name', 'descriptionZh', 'pricing']) {
    if (!isNonEmptyString(editorial[field])) {
      fail(`review editorial.${field} must be non-empty`)
    }
  }
  const descriptionLength = codePointLength(editorial.descriptionZh.trim())
  if (descriptionLength < 60 || descriptionLength > 120) {
    fail('review editorial.descriptionZh must contain 60 to 120 Unicode code points')
  }
  if (review.descriptionZh !== editorial.descriptionZh) {
    fail('review descriptionZh must exactly match editorial.descriptionZh')
  }
  if (!Array.isArray(editorial.evidence)) {
    fail('review editorial.evidence must be an array')
  }
  const requiredFields = ['name', 'descriptionZh', 'pricing']
  for (let index = 0; index < editorial.evidence.length; index += 1) {
    const record = editorial.evidence[index]
    assertAllowedKeys(
      record,
      `review editorial.evidence[${index}]`,
      EDITORIAL_EVIDENCE_FIELDS,
    )
    if (!requiredFields.includes(record.field)) {
      fail(`review editorial.evidence[${index}].field is unknown: ${record.field}`)
    }
    if (!isNonEmptyString(record.statement)) {
      fail(`review editorial.evidence[${index}].statement must be non-empty`)
    }
    httpsUrl(record.evidenceUrl, `review editorial.evidence[${index}].evidenceUrl`)
  }
  for (const field of requiredFields) {
    const matches = editorial.evidence.filter((record) => record?.field === field)
    if (matches.length === 0) {
      fail(`review editorial.evidence must contain at least one ${field} record`)
    }
  }
}

function validateReviewLocks(bundle, review, sourceBundleSha256) {
  assertAllowedKeys(review, 'review site', REVIEW_SITE_FIELDS)
  if (!SHA_256.test(sourceBundleSha256 ?? '')) {
    fail('sourceBundleSha256 must be a lowercase SHA-256 digest')
  }
  if (
    review.sourceV2BundleSha256 !== sourceBundleSha256 ||
    review.sourceBundleSha256 !== sourceBundleSha256
  ) {
    fail(`v2 bundle SHA-256 mismatch for ${bundle.siteId}`)
  }
  if (review.siteId !== bundle.siteId || review.sourceSiteId !== bundle.siteId) {
    fail(`review site identity mismatch for ${bundle.siteId}`)
  }
  if (review.entryId !== bundle.siteId) {
    fail(`review entryId must preserve v2 siteId for ${bundle.siteId}`)
  }
  const registeredEntityId = ENTITY_ID_BY_SITE_ID[bundle.siteId]
  if (review.entityId !== registeredEntityId) {
    fail(`review entityId must equal registered ${registeredEntityId} for ${bundle.siteId}`)
  }
  if (review.verdict !== 'PASS') fail(`editorial review verdict must be PASS for ${bundle.siteId}`)
  validateReviewedEditorial(review)
  if (review.classificationStatus !== 'confirmed') {
    fail(`classificationStatus must be confirmed for ${bundle.siteId}`)
  }
  const expectedClassification = MIGRATION_CLASSIFICATION_BY_SITE_ID[bundle.siteId]
  if (
    review.primaryCategory !== expectedClassification.primaryCategory ||
    review.subcategory !== expectedClassification.subcategory
  ) {
    fail(
      `review must use fixed classification mapping for ${bundle.siteId}: ` +
      `${expectedClassification.primaryCategory}/${expectedClassification.subcategory}`,
    )
  }
  if (!isNonEmptyString(review.editorialReviewerId)) {
    fail('editorialReviewerId must be non-empty')
  }
  const editorialReviewer = review.editorialReviewerId.trim().toLowerCase()
  if (
    editorialReviewer === bundle.qa.curatorId.trim().toLowerCase() ||
    editorialReviewer === bundle.qa.semanticReviewerId.trim().toLowerCase()
  ) {
    fail('editorialReviewerId must differ from the v2 curator and semantic reviewer')
  }
  canonicalTimestamp(review.reviewedAt, 'reviewedAt')
  validateReasons(review)
  const facetValidationErrors = facetsErrors(review.facets)
  if (facetValidationErrors.length > 0) {
    fail(`review facets are invalid: ${facetValidationErrors.join('; ')}`)
  }
  for (const label of ['scopeNotes', 'rightsNotes']) {
    if (!isNonEmptyString(review[label])) fail(`${label} must be non-empty`)
  }
  for (const [label, expectedLength] of [
    ['pageVerdicts', 3],
    ['shotVerdicts', 3],
  ]) {
    if (!Array.isArray(review[label]) || review[label].length !== expectedLength) {
      fail(`${label} must contain exactly ${expectedLength} PASS records`)
    }
    if (review[label].some(({ verdict } = {}) => verdict !== 'PASS')) {
      fail(`${label} must contain only PASS records`)
    }
  }

  for (let index = 0; index < bundle.pages.length; index += 1) {
    const page = bundle.pages[index]
    const pageVerdict = review.pageVerdicts[index]
    const shotVerdict = review.shotVerdicts[index]
    assertAllowedKeys(pageVerdict, `pageVerdicts[${index}]`, PAGE_VERDICT_FIELDS)
    assertAllowedKeys(shotVerdict, `shotVerdicts[${index}]`, SHOT_VERDICT_FIELDS)
    assertSameJson({
      role: pageVerdict.role,
      sourceUrl: pageVerdict.sourceUrl,
      finalUrl: pageVerdict.finalUrl,
      title: pageVerdict.title,
    }, {
      role: page.role,
      sourceUrl: page.sourceUrl,
      finalUrl: page.finalUrl,
      title: page.title,
    }, `pageVerdicts[${index}]`)
    if (!isNonEmptyString(pageVerdict.evidence)) {
      fail(`pageVerdicts[${index}].evidence must be non-empty`)
    }
    assertSameJson({
      role: shotVerdict.role,
      src: shotVerdict.src,
      sha256: shotVerdict.sha256,
      width: shotVerdict.width,
      height: shotVerdict.height,
    }, {
      role: page.role,
      src: page.shot.src,
      sha256: page.shot.sha256,
      width: page.shot.width,
      height: page.shot.height,
    }, `shotVerdicts[${index}]`)
    if (!isNonEmptyString(shotVerdict.evidence)) {
      fail(`shotVerdicts[${index}].evidence must be non-empty`)
    }
  }
}

function factFromCorrection(correction, index) {
  assertAllowedKeys(correction, `factCorrections[${index}]`, FACT_CORRECTION_FIELDS)
  if (correction.operation !== 'add' && correction.operation !== 'replace') {
    fail(`factCorrections[${index}].operation must be add or replace`)
  }
  for (const field of ['field', 'value', 'evidence']) {
    if (!isNonEmptyString(correction[field])) {
      fail(`factCorrections[${index}].${field} must be non-empty`)
    }
  }
  httpsUrl(correction.sourceUrl, `factCorrections[${index}].sourceUrl`)
  if (
    Object.hasOwn(correction, 'confidence') &&
    (!Number.isFinite(correction.confidence) ||
      correction.confidence < 0 ||
      correction.confidence > 1)
  ) {
    fail(`factCorrections[${index}].confidence must be between 0 and 1`)
  }
  return {
    field: correction.field.trim(),
    value: correction.value.trim(),
    sourceUrl: correction.sourceUrl.trim(),
    evidence: correction.evidence.trim(),
    ...(Object.hasOwn(correction, 'confidence')
      ? { confidence: correction.confidence }
      : {}),
  }
}

function validateFactVerdicts(finalFacts, verdicts) {
  if (!Array.isArray(verdicts) || verdicts.length !== finalFacts.length) {
    fail(`factVerdicts must contain exactly ${finalFacts.length} PASS records`)
  }
  const verdictByField = new Map()
  for (let index = 0; index < verdicts.length; index += 1) {
    const verdict = verdicts[index]
    assertAllowedKeys(verdict, `factVerdicts[${index}]`, FACT_VERDICT_FIELDS)
    if (!verdict || verdict.verdict !== 'PASS') {
      fail(`factVerdicts[${index}].verdict must be PASS`)
    }
    if (!isNonEmptyString(verdict.field)) {
      fail(`factVerdicts[${index}].field must be non-empty`)
    }
    if (verdictByField.has(verdict.field)) {
      fail(`factVerdicts contains duplicate field: ${verdict.field}`)
    }
    if (!isNonEmptyString(verdict.evidence)) {
      fail(`factVerdicts[${index}].evidence must be non-empty`)
    }
    httpsUrl(verdict.sourceUrl, `factVerdicts[${index}].sourceUrl`)
    verdictByField.set(verdict.field, { index, verdict })
  }

  for (const fact of finalFacts) {
    const matched = verdictByField.get(fact.field)
    if (!matched) fail(`factVerdicts is missing final fact field: ${fact.field}`)
    const { index, verdict } = matched
    const expected = {
      field: fact.field,
      finalValue: fact.value,
      sourceUrl: fact.sourceUrl,
      ...(Object.hasOwn(fact, 'confidence') ? { confidence: fact.confidence } : {}),
    }
    const actual = {
      field: verdict.field,
      finalValue: verdict.finalValue,
      sourceUrl: verdict.sourceUrl,
      ...(Object.hasOwn(verdict, 'confidence') ? { confidence: verdict.confidence } : {}),
    }
    assertSameJson(actual, expected, `factVerdicts[${index}]`)
  }
}

function correctedFacts(bundle, review) {
  if (!Array.isArray(review.factCorrections)) fail('factCorrections must be an array')
  const facts = clone(bundle.facts)
  const factIndexByField = new Map(facts.map((fact, index) => [fact.field, index]))
  const correctedFields = new Set()
  for (let index = 0; index < review.factCorrections.length; index += 1) {
    const correction = review.factCorrections[index]
    const fact = factFromCorrection(correction, index)
    if (correctedFields.has(fact.field)) {
      fail(`factCorrections contains duplicate field: ${fact.field}`)
    }
    correctedFields.add(fact.field)
    const existingIndex = factIndexByField.get(fact.field)
    if (correction.operation === 'add') {
      if (existingIndex !== undefined) {
        fail(`factCorrections add field already exists: ${fact.field}`)
      }
      factIndexByField.set(fact.field, facts.length)
      facts.push(fact)
    } else {
      if (existingIndex === undefined) {
        fail(`factCorrections replace field does not exist: ${fact.field}`)
      }
      facts[existingIndex] = fact
    }
  }
  validateFactVerdicts(facts, review.factVerdicts)
  return facts
}

function verifiedSourceHash(bundle, options) {
  const bytes = options.sourceBundleBytes
  if (!(Buffer.isBuffer(bytes) || bytes instanceof Uint8Array)) {
    fail('sourceBundleBytes must contain the immutable raw v2 bundle bytes')
  }
  const computedHash = sha256(bytes)
  if (
    Object.hasOwn(options, 'sourceBundleSha256') &&
    options.sourceBundleSha256 !== computedHash
  ) {
    fail('source bytes SHA-256 mismatch with sourceBundleSha256')
  }
  let parsed
  try {
    parsed = JSON.parse(Buffer.from(bytes).toString('utf8'))
  } catch (error) {
    throw new TypeError('sourceBundleBytes must contain valid v2 JSON', { cause: error })
  }
  assertSameJson(bundle, parsed, 'source bundle object and source bytes')
  return computedHash
}

/**
 * Purely converts one already-approved v2 evidence bundle using an external,
 * hash-locked editorial review. It performs no file-system writes.
 */
export function convertV2BundleToV3(bundle, review, options = {}) {
  const sourceErrors = evidenceBundleErrors(bundle)
  if (bundle?.schemaVersion !== 2 || sourceErrors.length > 0) {
    fail(`source v2 bundle is invalid: ${sourceErrors.join('; ')}`)
  }
  const sourceBundleSha256 = verifiedSourceHash(bundle, options)
  const reviewSnapshot = snapshotPlainData(review, 'review site')
  validateReviewLocks(bundle, reviewSnapshot, sourceBundleSha256)
  const classificationCuratorId = bundle.qa.semanticReviewerId
  const independentReviewerId = reviewSnapshot.editorialReviewerId.trim()

  const converted = {
    schemaVersion: 3,
    entryId: reviewSnapshot.entryId,
    entityId: reviewSnapshot.entityId,
    attemptId: `${bundle.attemptId}-v3-${sourceBundleSha256.slice(0, 12)}`,
    status: 'APPROVED',
    official: clone(bundle.official),
    editorial: {
      name: reviewSnapshot.editorial.name.trim(),
      descriptionZh: reviewSnapshot.editorial.descriptionZh.trim(),
      pricing: reviewSnapshot.editorial.pricing.trim(),
    },
    classification: {
      recordLevel: 'entry',
      entityId: reviewSnapshot.entityId,
      primaryCategory: reviewSnapshot.primaryCategory,
      subcategory: reviewSnapshot.subcategory,
      status: 'confirmed',
      alternatives: [],
      reasons: clone(reviewSnapshot.classificationReasons),
      curatorId: classificationCuratorId,
      reviewerId: independentReviewerId,
      confirmedAt: reviewSnapshot.reviewedAt,
    },
    facets: canonicalizeFacets(reviewSnapshot.facets),
    pages: clone(bundle.pages),
    facts: correctedFacts(bundle, reviewSnapshot),
    qa: {
      curatorId: classificationCuratorId,
      technicalPassed: bundle.qa.technicalPassed,
      semanticReviewerId: independentReviewerId,
      semanticPassed: true,
      editorialReviewerId: independentReviewerId,
    },
  }

  const outputErrors = evidenceBundleErrors(converted)
  if (outputErrors.length > 0) {
    fail(`converted v3 bundle is invalid for ${bundle.siteId}: ${outputErrors.join('; ')}`)
  }
  return converted
}

function validateManifest(manifest, sourceRecords) {
  assertAllowedKeys(manifest, 'review manifest', MANIFEST_FIELDS)
  if (manifest.schemaVersion !== 1) fail('review manifest schemaVersion must be 1')
  if (!isNonEmptyString(manifest.manifestId)) fail('review manifestId must be non-empty')
  if (!isNonEmptyString(manifest.reviewerId)) fail('review manifest reviewerId must be non-empty')
  if (manifest.overallVerdict !== 'PASS') fail('review manifest overallVerdict must be PASS')
  canonicalTimestamp(manifest.reviewedAt, 'review manifest reviewedAt')
  assertExactSet(manifest.siteIds, SITE_IDS, 'review manifest siteIds')

  if (!manifest.inputHashes || typeof manifest.inputHashes !== 'object' || Array.isArray(manifest.inputHashes)) {
    fail('review manifest inputHashes must be an object')
  }
  assertExactSet(Object.keys(manifest.inputHashes), SITE_IDS, 'review manifest inputHashes keys')
  if (!Array.isArray(manifest.sites)) fail('review manifest sites must be an array')
  if (manifest.sites.length !== SITE_IDS.length) {
    fail('review manifest sites must contain exactly six records')
  }
  const reviewBySiteId = new Map()
  for (const review of manifest.sites) {
    if (!review || reviewBySiteId.has(review.siteId)) {
      fail(`review manifest contains an invalid or duplicate site: ${review?.siteId}`)
    }
    reviewBySiteId.set(review.siteId, review)
  }
  assertExactSet([...reviewBySiteId.keys()], SITE_IDS, 'review manifest site records')

  for (const source of sourceRecords) {
    if (manifest.inputHashes[source.siteId] !== source.hash) {
      fail(`review manifest input hash mismatch for ${source.siteId}`)
    }
    const review = reviewBySiteId.get(source.siteId)
    if (review.editorialReviewerId !== manifest.reviewerId) {
      fail(`editorial reviewer mismatch for ${source.siteId}`)
    }
  }
  return reviewBySiteId
}

function validatePublicProjection(bundle) {
  const publicSite = toPublicSite(bundle)
  for (const legacyField of ['resourceEssence', 'score', 'tags']) {
    if (Object.hasOwn(publicSite, legacyField)) {
      fail(`public projection contains legacy field: ${legacyField}`)
    }
  }
  if (!Array.isArray(publicSite.shots) || publicSite.shots.length !== 3) {
    fail(`public projection must contain three shots for ${bundle.entryId}`)
  }
  for (const shot of publicSite.shots) {
    for (const field of ['title', 'selectionRationale', 'inputUrl', 'sourceUrl']) {
      if (!isNonEmptyString(shot[field])) {
        fail(`public projection ${bundle.entryId} shot is missing ${field}`)
      }
    }
  }
  return publicSite
}

async function readReviewManifest(options, fsAdapter) {
  const hasObject = Object.hasOwn(options, 'reviewManifest')
  const hasPath = Object.hasOwn(options, 'reviewManifestPath')
  if (hasObject === hasPath) {
    fail('provide exactly one external reviewManifest or reviewManifestPath')
  }
  if (hasPath) {
    const parsed = JSON.parse(await fsAdapter.readFile(resolve(options.reviewManifestPath), 'utf8'))
    return snapshotPlainData(parsed, 'review manifest')
  }
  return snapshotPlainData(options.reviewManifest, 'review manifest')
}

async function assertMigrationPaths(inputDir, outputDir, lockPath, fsAdapter) {
  const [
    input,
    output,
    lock,
    inputParent,
    outputParent,
    lockParent,
  ] = await Promise.all([
    resolvedPathIdentity(inputDir, fsAdapter, true),
    resolvedPathIdentity(outputDir, fsAdapter),
    resolvedPathIdentity(lockPath, fsAdapter),
    resolvedPathIdentity(dirname(inputDir), fsAdapter, true),
    resolvedPathIdentity(dirname(outputDir), fsAdapter),
    resolvedPathIdentity(dirname(lockPath), fsAdapter),
  ])
  if (
    isWithin(input.canonicalPath, output.canonicalPath) ||
    isWithin(output.canonicalPath, input.canonicalPath) ||
    sameInode(input, output)
  ) {
    fail('v3 output directory has an input directory containment or inode alias')
  }
  if (
    isWithin(input.canonicalPath, lock.canonicalPath) ||
    sameInode(input, lock)
  ) {
    fail('v3 publication lock has an input directory containment or inode alias')
  }
  return { input, inputParent, lock, lockParent, output, outputParent }
}

async function assertInputFilePathIsolation(inputDir, outputDir, lockPath, fsAdapter) {
  const inputFiles = await Promise.all(SITE_IDS.map(async (siteId) => ({
    label: `input ${siteId}`,
    identity: await resolvedPathIdentity(
      join(inputDir, `${siteId}.json`),
      fsAdapter,
      true,
    ),
  })))
  for (let leftIndex = 0; leftIndex < inputFiles.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < inputFiles.length; rightIndex += 1) {
      if (identitiesAlias(inputFiles[leftIndex].identity, inputFiles[rightIndex].identity)) {
        fail(`${inputFiles[leftIndex].label} has a hardlink or canonical alias to ${inputFiles[rightIndex].label}`)
      }
    }
  }

  const candidates = [
    {
      label: 'lock path',
      path: lockPath,
    },
    ...SITE_IDS.map((siteId) => ({
      label: `output ${siteId}`,
      path: join(outputDir, `${siteId}.json`),
    })),
  ]
  for (const candidate of candidates) {
    const candidateIdentity = await resolvedPathIdentity(candidate.path, fsAdapter)
    for (const inputFile of inputFiles) {
      if (identitiesAlias(candidateIdentity, inputFile.identity)) {
        fail(`${candidate.label} has a hardlink or canonical inode alias to ${inputFile.label}`)
      }
    }
  }
}

export async function migrateCuratedSitesV3(options = {}) {
  const inputDir = resolve(
    options.inputDir ?? join(DEMO_ROOT, 'data', 'curation', 'approved'),
  )
  const outputDir = resolve(
    options.outputDir ?? join(DEMO_ROOT, 'data', 'curation', 'approved-v3'),
  )
  const lockPath = resolve(
    options.lockPath ?? join(dirname(outputDir), '.vislexicon-curation-v3.lock'),
  )
  const fsAdapter = migrationFs(options.fs)
  await assertMigrationPaths(inputDir, outputDir, lockPath, fsAdapter)

  const inputNames = (await fsAdapter.readdir(inputDir)).filter((name) => name.endsWith('.json'))
  assertExactSet(inputNames, SITE_IDS.map((siteId) => `${siteId}.json`), 'v2 input bundle files')
  await assertInputFilePathIsolation(inputDir, outputDir, lockPath, fsAdapter)
  const sourceRecords = await Promise.all(SITE_IDS.map(async (siteId) => {
    const path = join(inputDir, `${siteId}.json`)
    const bytes = await fsAdapter.readFile(path)
    let bundle
    try {
      bundle = JSON.parse(bytes)
    } catch (error) {
      throw new TypeError(`v2 bundle is not valid JSON for ${siteId}`, { cause: error })
    }
    if (bundle.siteId !== siteId) fail(`v2 filename/siteId mismatch for ${siteId}`)
    return { bundle, bytes, hash: sha256(bytes), path, siteId }
  }))
  const manifest = await readReviewManifest(options, fsAdapter)
  const reviewBySiteId = validateManifest(manifest, sourceRecords)

  const bundles = sourceRecords.map((source) => convertV2BundleToV3(
    source.bundle,
    reviewBySiteId.get(source.siteId),
    {
      sourceBundleBytes: source.bytes,
      sourceBundleSha256: source.hash,
    },
  ))
  const screenshotHashes = new Set()
  for (const bundle of bundles) {
    validatePublicProjection(bundle)
    for (const page of bundle.pages) {
      if (screenshotHashes.has(page.shot.sha256)) {
        fail(`v3 bundles reuse screenshot bytes: ${page.shot.sha256}`)
      }
      screenshotHashes.add(page.shot.sha256)
    }
  }

  // Serialization intentionally happens only after the entire six-site input,
  // manifest, correction set, v3 bundle, and public projection pass validation.
  const targets = bundles.map((bundle) => ({
    kind: 'bundle',
    targetPath: join(outputDir, `${bundle.entryId}.json`),
    bytes: jsonBytes(bundle),
  }))
  await assertMigrationPaths(inputDir, outputDir, lockPath, fsAdapter)
  await assertInputFilePathIsolation(inputDir, outputDir, lockPath, fsAdapter)
  await publishOutputTransaction(targets, {
    fs: fsAdapter,
    lockPath,
    protectedPaths: [
      inputDir,
      ...SITE_IDS.map((siteId) => join(inputDir, `${siteId}.json`)),
    ],
    runId: options.runId,
  })
  return {
    siteIds: bundles.map(({ entryId }) => entryId),
    inputDir,
    outputDir,
  }
}

function parseCliOptions(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!['--review-manifest', '--input-dir', '--output-dir', '--lock-path'].includes(flag)) {
      fail(`unknown CLI option: ${flag}`)
    }
    if (!value || value.startsWith('--')) fail(`${flag} requires a path`)
    if (Object.hasOwn(values, flag)) fail(`duplicate CLI option: ${flag}`)
    values[flag] = value
  }
  if (!values['--review-manifest']) {
    fail('CLI requires an explicit --review-manifest path; no review is generated by default')
  }
  return values
}

export async function main(argv = process.argv.slice(2)) {
  const values = parseCliOptions(argv)
  const result = await migrateCuratedSitesV3({
    reviewManifestPath: values['--review-manifest'],
    ...(values['--input-dir'] ? { inputDir: values['--input-dir'] } : {}),
    ...(values['--output-dir'] ? { outputDir: values['--output-dir'] } : {}),
    ...(values['--lock-path'] ? { lockPath: values['--lock-path'] } : {}),
  })
  console.log(`Migrated ${result.siteIds.length} reviewed v3 curation bundles to ${result.outputDir}`)
  return result
}

const invokedPath = process.argv[1]
if (invokedPath && pathToFileURL(resolve(invokedPath)).href === import.meta.url) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
