import {
  CURATION_ESSENCES,
  taxonomySelectionErrors,
} from '../data/curation-taxonomy-v2-legacy.js'
import {
  canonicalizeFacets,
  classificationErrors,
  facetsErrors,
  isPublishableClassification,
} from '../data/curation-taxonomy.js'
import { normalizeIdentityUrl } from './site-identity.js'

const ROLE_ORDER = ['identity', 'breadth', 'proof']
const ROLE_SET = new Set(ROLE_ORDER)
const OFFICIAL_FACT_FIELDS = new Set([
  'author',
  'organization',
  'repository',
  'license',
])
const LINK_FACT_FIELDS = new Set(['repository', 'official-page'])
const SOURCE_SCOPED_FACT_FIELDS = new Set([
  'repository',
  'official-page',
  'license',
])
const SHARED_CODE_HOSTS = new Set([
  'bitbucket.org',
  'github.com',
  'gitlab.com',
])
export const FORBIDDEN_DESCRIPTION_PHRASES = Object.freeze([
  '归类为',
  'AI 设计工具站。',
  '以付费为主。',
])
const ESSENCE_BY_ID = new Map(
  CURATION_ESSENCES.map((record) => [record.id, record]),
)
const ISO_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|([+-])(\d{2}):(\d{2}))$/u
const SITE_ID = /^[a-z0-9][a-z0-9_-]{0,127}$/u
const SHA_256 = /^[a-f\d]{64}$/iu
const SHOT_FILENAME = /^[a-z\d][a-z\d._-]*\.(?:jpe?g|png|webp)$/iu
const ARRAY_INDEX = /^(?:0|[1-9]\d*)$/u
const V2_BUNDLE_FIELDS = new Set([
  'schemaVersion',
  'siteId',
  'entityKey',
  'attemptId',
  'status',
  'official',
  'curation',
  'pages',
  'facts',
  'qa',
])
const V3_BUNDLE_FIELDS = new Set([
  'schemaVersion',
  'entryId',
  'entityId',
  'attemptId',
  'status',
  'official',
  'editorial',
  'classification',
  'facets',
  'pages',
  'facts',
  'qa',
])
const OFFICIAL_FIELDS = new Set(['inputUrl', 'finalUrl', 'checkedAt'])
const CURATION_FIELDS = new Set([
  'name',
  'descriptionZh',
  'resourceEssence',
  'subcategory',
  'score',
  'tags',
  'pricing',
])
const EDITORIAL_FIELDS = new Set(['name', 'descriptionZh', 'pricing'])
const CLASSIFICATION_FIELDS = new Set([
  'recordLevel',
  'entityId',
  'entryId',
  'primaryCategory',
  'subcategory',
  'status',
  'alternatives',
  'reasons',
  'curatorId',
  'reviewerId',
  'confirmedAt',
])
const PAGE_FIELDS = new Set([
  'role',
  'sourceUrl',
  'finalUrl',
  'title',
  'selectionRationale',
  'captureRecipe',
  'shot',
])
const SHOT_FIELDS = new Set(['src', 'sha256', 'width', 'height', 'bytes', 'alt'])
const FACT_FIELDS = new Set([
  'field',
  'value',
  'sourceUrl',
  'evidence',
  'confidence',
])
const QA_FIELDS = new Set([
  'curatorId',
  'technicalPassed',
  'semanticReviewerId',
  'semanticPassed',
  'editorialReviewerId',
])

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function inspectPlainRecord(value, label, allowedFields, errors) {
  let isArray
  try {
    isArray = Array.isArray(value)
  } catch {
    errors.push(`${label} could not be inspected safely`)
    return null
  }

  if (value === null || typeof value !== 'object' || isArray) {
    errors.push(`${label} must be a plain object`)
    return null
  }

  let prototype
  let keys
  try {
    prototype = Reflect.getPrototypeOf(value)
    keys = Reflect.ownKeys(value)
  } catch {
    errors.push(`${label} could not be inspected safely`)
    return null
  }

  if (prototype !== Object.prototype && prototype !== null) {
    errors.push(`${label} must be a plain object`)
    return null
  }

  const values = new Map()
  for (const key of keys) {
    if (typeof key !== 'string') {
      errors.push(`${label} contains an unexpected symbol property`)
      continue
    }
    if (allowedFields && !allowedFields.has(key)) {
      errors.push(`${label}.${key} is not allowed`)
      continue
    }

    let descriptor
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, key)
    } catch {
      errors.push(`${label}.${key} could not be inspected safely`)
      continue
    }

    if (!descriptor) {
      errors.push(`${label}.${key} could not be inspected safely`)
    } else if (!Object.hasOwn(descriptor, 'value')) {
      errors.push(`${label}.${key} must be a data property`)
      values.set(key, undefined)
    } else {
      values.set(key, descriptor.value)
    }
  }

  return values
}

function inspectPlainArray(value, label, errors) {
  let isArray
  try {
    isArray = Array.isArray(value)
  } catch {
    errors.push(`${label} could not be inspected safely`)
    return null
  }
  if (!isArray) {
    errors.push(`${label} must be an array`)
    return null
  }

  let prototype
  let keys
  let lengthDescriptor
  try {
    prototype = Reflect.getPrototypeOf(value)
    keys = Reflect.ownKeys(value)
    lengthDescriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    errors.push(`${label} could not be inspected safely`)
    return null
  }

  if (prototype !== Array.prototype) {
    errors.push(`${label} must be a plain array`)
    return null
  }
  if (
    !lengthDescriptor ||
    !Object.hasOwn(lengthDescriptor, 'value') ||
    !Number.isSafeInteger(lengthDescriptor.value) ||
    lengthDescriptor.value < 0
  ) {
    errors.push(`${label}.length must be a safe data property`)
    return null
  }

  const length = lengthDescriptor.value
  const values = new Array(length)
  for (const key of keys) {
    if (key === 'length') continue
    if (typeof key !== 'string') {
      errors.push(`${label} contains an unexpected symbol property`)
      continue
    }
    if (!ARRAY_INDEX.test(key) || Number(key) >= length) {
      errors.push(`${label}.${key} is not allowed`)
      continue
    }

    let descriptor
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, key)
    } catch {
      errors.push(`${label}[${key}] could not be inspected safely`)
      continue
    }
    if (!descriptor) {
      errors.push(`${label}[${key}] could not be inspected safely`)
    } else if (!Object.hasOwn(descriptor, 'value')) {
      errors.push(`${label}[${key}] must be a data property`)
    } else {
      values[Number(key)] = descriptor.value
    }
  }

  return values
}

function snapshotPlainValue(value, label, errors, ancestors) {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }
  if (typeof value !== 'object') {
    errors.push(`${label} must contain only plain data`)
    return undefined
  }

  let isArray
  try {
    isArray = Array.isArray(value)
  } catch {
    errors.push(`${label} could not be inspected safely`)
    return undefined
  }
  if (isArray) {
    return snapshotArray(
      value,
      label,
      snapshotPlainValue,
      errors,
      ancestors,
    )
  }

  return snapshotRecord(value, label, null, null, errors, ancestors)
}

function snapshotArray(value, label, itemReader, errors, ancestors) {
  const rawValues = inspectPlainArray(value, label, errors)
  if (!rawValues) return undefined
  if (ancestors.has(value)) {
    errors.push(`${label} must not contain a cycle`)
    return undefined
  }

  ancestors.add(value)
  const snapshot = new Array(rawValues.length)
  for (let index = 0; index < rawValues.length; index += 1) {
    snapshot[index] = itemReader(
      rawValues[index],
      `${label}[${index}]`,
      errors,
      ancestors,
    )
  }
  ancestors.delete(value)
  return Object.freeze(snapshot)
}

function snapshotRecord(
  value,
  label,
  allowedFields,
  readers,
  errors,
  ancestors,
) {
  const rawValues = inspectPlainRecord(value, label, allowedFields, errors)
  if (!rawValues) return undefined
  return snapshotRecordFromValues(
    value,
    rawValues,
    label,
    allowedFields,
    readers,
    errors,
    ancestors,
  )
}

function snapshotRecordFromValues(
  value,
  rawValues,
  label,
  allowedFields,
  readers,
  errors,
  ancestors,
) {
  if (ancestors.has(value)) {
    errors.push(`${label} must not contain a cycle`)
    return undefined
  }

  ancestors.add(value)
  const snapshot = {}
  const fields = allowedFields ?? new Set(rawValues.keys())
  for (const field of fields) {
    if (!rawValues.has(field)) continue
    const reader = readers?.[field] ?? snapshotPlainValue
    const fieldValue = reader(
      rawValues.get(field),
      `${label}.${field}`,
      errors,
      ancestors,
    )
    Object.defineProperty(snapshot, field, {
      configurable: true,
      enumerable: true,
      value: fieldValue,
      writable: true,
    })
  }
  ancestors.delete(value)
  return Object.freeze(snapshot)
}

function snapshotShot(value, label, errors, ancestors) {
  return snapshotRecord(value, label, SHOT_FIELDS, null, errors, ancestors)
}

function snapshotPage(value, label, errors, ancestors) {
  return snapshotRecord(
    value,
    label,
    PAGE_FIELDS,
    {
      shot: snapshotShot,
      captureRecipe: snapshotPlainValue,
    },
    errors,
    ancestors,
  )
}

function snapshotFact(value, label, errors, ancestors) {
  return snapshotRecord(value, label, FACT_FIELDS, null, errors, ancestors)
}

function snapshotOfficial(value, label, errors, ancestors) {
  return snapshotRecord(value, label, OFFICIAL_FIELDS, null, errors, ancestors)
}

function snapshotCuration(value, label, errors, ancestors) {
  return snapshotRecord(
    value,
    label,
    CURATION_FIELDS,
    {
      tags: (tags, tagsLabel, nestedErrors, nestedAncestors) => snapshotArray(
        tags,
        tagsLabel,
        snapshotPlainValue,
        nestedErrors,
        nestedAncestors,
      ),
    },
    errors,
    ancestors,
  )
}

function snapshotEditorial(value, label, errors, ancestors) {
  return snapshotRecord(value, label, EDITORIAL_FIELDS, null, errors, ancestors)
}

function snapshotClassification(value, label, errors, ancestors) {
  return snapshotRecord(
    value,
    label,
    CLASSIFICATION_FIELDS,
    {
      alternatives: snapshotPlainValue,
      reasons: snapshotPlainValue,
    },
    errors,
    ancestors,
  )
}

function snapshotFacets(value, label, errors, ancestors) {
  return snapshotRecord(value, label, null, null, errors, ancestors)
}

function snapshotQa(value, label, errors, ancestors) {
  return snapshotRecord(value, label, QA_FIELDS, null, errors, ancestors)
}

function snapshotEvidenceBundle(value) {
  const errors = []
  const ancestors = new WeakSet()
  const rawValues = inspectPlainRecord(value, 'bundle', null, errors)
  if (!rawValues) return { snapshot: undefined, errors }

  const isV3 = rawValues.get('schemaVersion') === 3
  const fields = isV3 ? V3_BUNDLE_FIELDS : V2_BUNDLE_FIELDS
  for (const key of rawValues.keys()) {
    if (!fields.has(key)) errors.push(`bundle.${key} is not allowed`)
  }
  const readers = isV3
    ? {
      official: snapshotOfficial,
      editorial: snapshotEditorial,
      classification: snapshotClassification,
      facets: snapshotFacets,
      pages: (pages, label, nestedErrors, nestedAncestors) => snapshotArray(
        pages,
        label,
        snapshotPage,
        nestedErrors,
        nestedAncestors,
      ),
      facts: (facts, label, nestedErrors, nestedAncestors) => snapshotArray(
        facts,
        label,
        snapshotFact,
        nestedErrors,
        nestedAncestors,
      ),
      qa: snapshotQa,
    }
    : {
      official: snapshotOfficial,
      curation: snapshotCuration,
      pages: (pages, label, nestedErrors, nestedAncestors) => snapshotArray(
        pages,
        label,
        snapshotPage,
        nestedErrors,
        nestedAncestors,
      ),
      facts: (facts, label, nestedErrors, nestedAncestors) => snapshotArray(
        facts,
        label,
        snapshotFact,
        nestedErrors,
        nestedAncestors,
      ),
      qa: snapshotQa,
    }
  const snapshot = snapshotRecordFromValues(
    value,
    rawValues,
    'bundle',
    fields,
    readers,
    errors,
    ancestors,
  )

  return { snapshot, errors }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function codePointLength(value) {
  return Array.from(value).length
}

function safeHttpsDetails(value) {
  if (!isNonEmptyString(value)) return null

  const input = value.trim()
  try {
    const parsedInput = new URL(input)
    if (parsedInput.protocol !== 'https:') return null

    const normalized = normalizeIdentityUrl(input)
    return { normalized, url: new URL(normalized) }
  } catch {
    return null
  }
}

function isValidIsoTimestamp(value) {
  if (typeof value !== 'string') return false

  const match = ISO_TIMESTAMP.exec(value.trim())
  if (!match || !Number.isFinite(Date.parse(value))) return false

  const [, year, month, day, hour, minute, second, , offsetHour, offsetMinute] = match
  const calendarDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`)
  const hasValidCalendarDate =
    !Number.isNaN(calendarDate.valueOf()) &&
    calendarDate.getUTCFullYear() === Number(year) &&
    calendarDate.getUTCMonth() + 1 === Number(month) &&
    calendarDate.getUTCDate() === Number(day)
  const hasValidClock =
    Number(hour) <= 23 &&
    Number(minute) <= 59 &&
    Number(second) <= 59
  const hasValidOffset =
    offsetHour === undefined ||
    (Number(offsetHour) <= 23 && Number(offsetMinute) <= 59)

  return hasValidCalendarDate && hasValidClock && hasValidOffset
}

function validateHttps(value, label, errors) {
  const details = safeHttpsDetails(value)
  if (!details) errors.push(`${label} must be a safe HTTPS URL`)
  return details
}

function validateNonEmptyString(value, label, errors) {
  if (!isNonEmptyString(value)) {
    errors.push(`${label} must be a non-empty string`)
    return false
  }
  return true
}

function addUniquenessError(values, label, errors) {
  if (new Set(values).size !== values.length) {
    errors.push(`${label} values must be unique`)
  }
}

function isValidShotPath(value, siteId) {
  if (!isNonEmptyString(value) || typeof siteId !== 'string' || !SITE_ID.test(siteId)) {
    return false
  }
  if (value !== value.trim() || value.includes('\\')) return false

  const pieces = value.split('/')
  return (
    pieces.length === 4 &&
    pieces[0] === '' &&
    pieces[1] === 'shots' &&
    pieces[2] === siteId &&
    SHOT_FILENAME.test(pieces[3])
  )
}

function sharedCodeRepositoryScope(details) {
  if (!details || !SHARED_CODE_HOSTS.has(details.url.hostname)) return null

  const pieces = details.url.pathname.split('/').filter(Boolean)
  if (details.url.hostname === 'github.com' || details.url.hostname === 'bitbucket.org') {
    if (pieces.length < 2) return null
    const owner = pieces[0].toLowerCase()
    const repository = pieces[1].replace(/\.git$/iu, '').toLowerCase()
    return `${details.url.origin}/${owner}/${repository}`
  }

  const markerIndex = pieces.indexOf('-')
  const repositoryPieces = markerIndex === -1 ? pieces : pieces.slice(0, markerIndex)
  if (repositoryPieces.length < 2) return null
  return `${details.url.origin}/${repositoryPieces.join('/').toLowerCase()}`
}

function urlsAreExplicitlyRelated(pageDetails, factDetails, factField) {
  if (!pageDetails || !factDetails) return false

  const pageScope = sharedCodeRepositoryScope(pageDetails)
  const factScope = sharedCodeRepositoryScope(factDetails)
  if (pageScope || factScope) {
    return pageScope !== null && pageScope === factScope
  }

  if (pageDetails.url.origin !== factDetails.url.origin) return false
  if (factField === 'official-page') return true

  const factPath = factDetails.url.pathname.replace(/\/+$/u, '')
  const pagePath = pageDetails.url.pathname.replace(/\/+$/u, '')
  return (
    factPath === '' ||
    pagePath === factPath ||
    pagePath.startsWith(`${factPath}/`) ||
    factPath.startsWith(`${pagePath}/`)
  )
}

function factLinksPage(pageUrlDetails, facts, allowedFields = LINK_FACT_FIELDS) {
  return facts.some((fact) => (
    allowedFields.has(fact.field) &&
    fact.urlDetails.some((details) => (
      urlsAreExplicitlyRelated(pageUrlDetails, details, fact.field)
    ))
  ))
}

function validateCuration(curation, errors) {
  if (!isPlainObject(curation)) {
    errors.push('curation must be a plain object')
    return { tags: [] }
  }

  validateNonEmptyString(curation.name, 'curation.name', errors)

  if (typeof curation.descriptionZh !== 'string') {
    errors.push('curation.descriptionZh must contain 60 to 120 Unicode code points')
  } else {
    const description = curation.descriptionZh.trim()
    const length = codePointLength(description)
    if (length < 60 || length > 120) {
      errors.push('curation.descriptionZh must contain 60 to 120 Unicode code points')
    }
    if (FORBIDDEN_DESCRIPTION_PHRASES.some((phrase) => description.includes(phrase))) {
      errors.push('curation.descriptionZh contains forbidden template phrase')
    }
  }

  const resourceEssence = isNonEmptyString(curation.resourceEssence)
    ? curation.resourceEssence.trim()
    : undefined
  const subcategory = isNonEmptyString(curation.subcategory)
    ? curation.subcategory.trim()
    : undefined
  errors.push(...taxonomySelectionErrors({ resourceEssence, subcategory }))

  if (!Number.isFinite(curation.score)) {
    errors.push('curation.score must be a finite number')
  } else {
    const essence = ESSENCE_BY_ID.get(resourceEssence)
    if (
      essence &&
      (curation.score < essence.minScore || curation.score > essence.maxScore)
    ) {
      errors.push(
        `curation.score must be between ${essence.minScore} and ${essence.maxScore} for ${resourceEssence}`,
      )
    }
  }

  const canonicalTags = []
  if (!Array.isArray(curation.tags)) {
    errors.push('curation.tags must be an array containing at least one tag')
  } else {
    if (curation.tags.length === 0) {
      errors.push('curation.tags must contain at least one tag')
    }
    for (let index = 0; index < curation.tags.length; index += 1) {
      const tag = curation.tags[index]
      if (!validateNonEmptyString(tag, `curation.tags[${index}]`, errors)) continue
      canonicalTags.push(tag.trim().toLowerCase())
    }
    addUniquenessError(
      canonicalTags,
      'curation.tags',
      errors,
    )
  }

  return { tags: canonicalTags }
}

function validateEditorial(editorial, errors) {
  if (!isPlainObject(editorial)) {
    errors.push('editorial must be a plain object')
    return
  }

  validateNonEmptyString(editorial.name, 'editorial.name', errors)
  if (typeof editorial.descriptionZh !== 'string') {
    errors.push('editorial.descriptionZh must contain 60 to 120 Unicode code points')
  } else {
    const description = editorial.descriptionZh.trim()
    const length = codePointLength(description)
    if (length < 60 || length > 120) {
      errors.push('editorial.descriptionZh must contain 60 to 120 Unicode code points')
    }
    if (FORBIDDEN_DESCRIPTION_PHRASES.some((phrase) => description.includes(phrase))) {
      errors.push('editorial.descriptionZh contains forbidden template phrase')
    }
  }
}

function validatePages(pages, siteId, errors) {
  if (!Array.isArray(pages)) {
    errors.push('pages must be an array containing exactly 3 entries')
    return { pageUrls: [] }
  }

  if (pages.length !== 3) {
    errors.push('pages must contain exactly 3 entries')
  }

  const roleCounts = new Map(ROLE_ORDER.map((role) => [role, 0]))
  const sourceUrls = []
  const finalUrls = []
  const selectionRationales = []
  const shotPaths = []
  const shotHashes = []
  const pageUrls = []

  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index]
    if (!isPlainObject(page)) {
      errors.push(`pages[${index}] must be a plain object`)
      pageUrls[index] = null
      continue
    }

    if (!ROLE_SET.has(page.role)) {
      errors.push(`pages[${index}].role must be identity, breadth, or proof`)
    } else {
      roleCounts.set(page.role, roleCounts.get(page.role) + 1)
    }

    const sourceUrl = validateHttps(
      page.sourceUrl,
      `pages[${index}].sourceUrl`,
      errors,
    )
    const finalUrl = validateHttps(
      page.finalUrl,
      `pages[${index}].finalUrl`,
      errors,
    )
    if (sourceUrl) sourceUrls.push(sourceUrl.normalized)
    if (finalUrl) finalUrls.push(finalUrl.normalized)
    pageUrls[index] = { sourceUrl, finalUrl }

    validateNonEmptyString(page.title, `pages[${index}].title`, errors)
    if (!isNonEmptyString(page.selectionRationale)) {
      errors.push(`pages[${index}].selectionRationale must be a non-empty string`)
    } else {
      const selectionRationale = page.selectionRationale.trim()
      selectionRationales.push(selectionRationale)
      if (codePointLength(selectionRationale) < 12) {
        errors.push(
          `pages[${index}].selectionRationale must contain at least 12 Unicode code points`,
        )
      }
    }

    const shot = page.shot
    if (!isPlainObject(shot)) {
      errors.push(`pages[${index}].shot must be a plain object`)
      continue
    }

    if (!isValidShotPath(shot.src, siteId)) {
      errors.push(
        `pages[${index}].shot.src must match /shots/<siteId>/<filename>.(jpg|jpeg|png|webp) without nesting or traversal`,
      )
    } else {
      shotPaths.push(shot.src)
    }

    if (typeof shot.sha256 !== 'string' || !SHA_256.test(shot.sha256)) {
      errors.push(`pages[${index}].shot.sha256 must be 64 hexadecimal characters`)
    } else {
      shotHashes.push(shot.sha256.toLowerCase())
    }

    if (!Number.isInteger(shot.width) || shot.width < 1280) {
      errors.push(`pages[${index}].shot.width must be an integer at least 1280`)
    }
    if (!Number.isInteger(shot.height) || shot.height < 900) {
      errors.push(`pages[${index}].shot.height must be an integer at least 900`)
    }
    if (!Number.isSafeInteger(shot.bytes) || shot.bytes <= 20_000) {
      errors.push(
        `pages[${index}].shot.bytes must be a safe integer greater than 20000`,
      )
    }
    validateNonEmptyString(shot.alt, `pages[${index}].shot.alt`, errors)
  }

  for (const role of ROLE_ORDER) {
    if (roleCounts.get(role) !== 1) {
      errors.push(`page role ${role} must appear exactly once`)
    }
  }
  addUniquenessError(sourceUrls, 'page sourceUrl', errors)
  addUniquenessError(finalUrls, 'page finalUrl', errors)
  addUniquenessError(selectionRationales, 'page selectionRationale', errors)
  addUniquenessError(shotPaths, 'page shot.src', errors)
  addUniquenessError(shotHashes, 'page shot.sha256', errors)

  return { pageUrls }
}

function validateFacts(facts, errors) {
  if (!Array.isArray(facts)) {
    errors.push('facts must be an array')
    return { validFacts: [] }
  }

  const fields = []
  const validFacts = []
  for (let index = 0; index < facts.length; index += 1) {
    const fact = facts[index]
    if (!isPlainObject(fact)) {
      errors.push(`facts[${index}] must be a plain object`)
      continue
    }

    const fieldIsValid = validateNonEmptyString(
      fact.field,
      `facts[${index}].field`,
      errors,
    )
    const valueIsValid = validateNonEmptyString(
      fact.value,
      `facts[${index}].value`,
      errors,
    )
    const evidenceIsValid = validateNonEmptyString(
      fact.evidence,
      `facts[${index}].evidence`,
      errors,
    )
    const sourceUrl = validateHttps(
      fact.sourceUrl,
      `facts[${index}].sourceUrl`,
      errors,
    )

    if (
      Object.hasOwn(fact, 'confidence') &&
      (!Number.isFinite(fact.confidence) || fact.confidence < 0 || fact.confidence > 1)
    ) {
      errors.push(`facts[${index}].confidence must be between 0 and 1`)
    }

    const normalizedField = fieldIsValid
      ? fact.field.trim().toLowerCase()
      : null
    const isLinkFact = LINK_FACT_FIELDS.has(normalizedField)
    const valueUrl = isLinkFact && valueIsValid
      ? safeHttpsDetails(fact.value)
      : null
    if (isLinkFact && valueIsValid && !valueUrl) {
      errors.push(
        `facts[${index}].value must be a safe HTTPS URL for ${normalizedField} facts`,
      )
    }

    if (normalizedField) fields.push(normalizedField)
    if (
      normalizedField &&
      valueIsValid &&
      evidenceIsValid &&
      sourceUrl &&
      (!isLinkFact || valueUrl)
    ) {
      validFacts.push({
        index,
        field: normalizedField,
        value: valueUrl ? valueUrl.normalized : fact.value.trim(),
        evidence: fact.evidence.trim(),
        sourceUrl: sourceUrl.normalized,
        sourceUrlDetails: sourceUrl,
        urlDetails: valueUrl ? [valueUrl] : [],
      })
    }
  }

  addUniquenessError(fields, 'fact field', errors)
  return { validFacts }
}

function validateFactSourceScopes(officialFinal, facts, errors) {
  const trustedFacts = new Set()
  const repositoryFacts = facts.filter(({ field }) => field === 'repository')

  for (const fact of repositoryFacts) {
    const sourceIsOfficial = officialFinal && urlsAreExplicitlyRelated(
      fact.sourceUrlDetails,
      officialFinal,
      'official-page',
    )
    const sourceIsRepository = fact.urlDetails.some((repositoryDetails) => (
      urlsAreExplicitlyRelated(
        fact.sourceUrlDetails,
        repositoryDetails,
        'repository',
      )
    ))
    if (sourceIsOfficial || sourceIsRepository) {
      trustedFacts.add(fact)
    } else {
      errors.push(
        `facts[${fact.index}].sourceUrl must be within the official site or a confirmed repository scope`,
      )
    }
  }

  const confirmedRepositoryFacts = repositoryFacts.filter((fact) => (
    trustedFacts.has(fact)
  ))
  for (const fact of facts) {
    if (trustedFacts.has(fact) || !SOURCE_SCOPED_FACT_FIELDS.has(fact.field)) {
      trustedFacts.add(fact)
      continue
    }

    const sourceIsOfficial = officialFinal && urlsAreExplicitlyRelated(
      fact.sourceUrlDetails,
      officialFinal,
      'official-page',
    )
    const sourceIsRepository = confirmedRepositoryFacts.some((repositoryFact) => (
      repositoryFact.urlDetails.some((repositoryDetails) => (
        urlsAreExplicitlyRelated(
          fact.sourceUrlDetails,
          repositoryDetails,
          'repository',
        )
      ))
    ))
    if (sourceIsOfficial || sourceIsRepository) {
      trustedFacts.add(fact)
    } else {
      errors.push(
        `facts[${fact.index}].sourceUrl must be within the official site or a confirmed repository scope`,
      )
    }
  }

  return facts.filter((fact) => trustedFacts.has(fact))
}

function validateQa(qa, errors) {
  if (!isPlainObject(qa)) {
    errors.push('qa must be a plain object')
    return
  }

  const curatorIsValid = validateNonEmptyString(
    qa.curatorId,
    'qa.curatorId',
    errors,
  )
  const reviewerIsValid = validateNonEmptyString(
    qa.semanticReviewerId,
    'qa.semanticReviewerId',
    errors,
  )
  if (qa.technicalPassed !== true) {
    errors.push('qa.technicalPassed must be true')
  }
  if (qa.semanticPassed !== true) {
    errors.push('qa.semanticPassed must be true')
  }
  if (
    curatorIsValid &&
    reviewerIsValid &&
    qa.curatorId.trim().toLowerCase() === qa.semanticReviewerId.trim().toLowerCase()
  ) {
    errors.push('qa curatorId and semanticReviewerId must be different')
  }
}

function validateQaV3(qa, errors) {
  validateQa(qa, errors)
  if (!isPlainObject(qa)) return

  const editorialReviewerIsValid = validateNonEmptyString(
    qa.editorialReviewerId,
    'qa.editorialReviewerId',
    errors,
  )
  if (
    editorialReviewerIsValid &&
    isNonEmptyString(qa.curatorId) &&
    qa.editorialReviewerId.trim().toLowerCase() === qa.curatorId.trim().toLowerCase()
  ) {
    errors.push('qa editorialReviewerId must differ from curatorId')
  }
}

function validatePageOrigins(officialFinal, pageUrls, facts, errors) {
  if (!officialFinal) return

  const officialUsesSharedCodeHost = SHARED_CODE_HOSTS.has(
    officialFinal.url.hostname,
  )
  const repositoryFields = new Set(['repository'])
  const officialRepositoryScope = sharedCodeRepositoryScope(officialFinal)

  if (
    officialUsesSharedCodeHost &&
    !factLinksPage(officialFinal, facts, repositoryFields)
  ) {
    errors.push('shared code-host pages require a matching repository fact')
  }

  for (let index = 0; index < pageUrls.length; index += 1) {
    const page = pageUrls[index]
    if (!page) continue

    const urls = [page.sourceUrl, page.finalUrl].filter(Boolean)
    const hasUnlinkedCrossOriginUrl = urls.some((details) => (
      (
        officialUsesSharedCodeHost
          ? sharedCodeRepositoryScope(details) !== officialRepositoryScope ||
            officialRepositoryScope === null
          : details.url.origin !== officialFinal.url.origin
      ) &&
      !factLinksPage(details, facts)
    ))
    if (hasUnlinkedCrossOriginUrl) {
      errors.push(
        `pages[${index}] crosses the official origin without a matching repository or official-page fact`,
      )
    }
  }
}

function validateEvidenceSnapshotV2(bundle, snapshotErrors) {
  const errors = [...snapshotErrors]
  if (!isPlainObject(bundle)) {
    if (!errors.includes('bundle must be a plain object')) {
      errors.push('bundle must be a plain object')
    }
    return {
      errors,
      normalized: { officialFinal: null, pageUrls: [], validFacts: [] },
    }
  }

  if (bundle.schemaVersion !== 2) {
    errors.push('schemaVersion must be 2')
  }
  if (
    validateNonEmptyString(bundle.siteId, 'siteId', errors) &&
    !SITE_ID.test(bundle.siteId)
  ) {
    errors.push('siteId must match ^[a-z0-9][a-z0-9_-]{0,127}$')
  }
  validateNonEmptyString(bundle.entityKey, 'entityKey', errors)
  validateNonEmptyString(bundle.attemptId, 'attemptId', errors)
  if (bundle.status === 'QUARANTINED_LEGACY') {
    errors.push('status QUARANTINED_LEGACY cannot be published')
  } else if (bundle.status !== 'APPROVED') {
    errors.push('status must be APPROVED')
  }

  let officialFinal = null
  if (!isPlainObject(bundle.official)) {
    errors.push('official must be a plain object')
  } else {
    validateHttps(bundle.official.inputUrl, 'official.inputUrl', errors)
    officialFinal = validateHttps(
      bundle.official.finalUrl,
      'official.finalUrl',
      errors,
    )
    if (!isValidIsoTimestamp(bundle.official.checkedAt)) {
      errors.push('official.checkedAt must be a valid ISO timestamp')
    }
  }

  const { tags } = validateCuration(bundle.curation, errors)
  const { pageUrls } = validatePages(bundle.pages, bundle.siteId, errors)
  const { validFacts: structurallyValidFacts } = validateFacts(bundle.facts, errors)
  const validFacts = validateFactSourceScopes(
    officialFinal,
    structurallyValidFacts,
    errors,
  )
  validateQa(bundle.qa, errors)

  if (tags.includes('open-source')) {
    const license = validFacts.find(({ field }) => field === 'license')
    if (!license || !license.value || !license.evidence) {
      errors.push('open-source requires a license fact with value and evidence')
    }
  }

  validatePageOrigins(officialFinal, pageUrls, validFacts, errors)
  return {
    errors,
    normalized: { officialFinal, pageUrls, validFacts },
  }
}

const SHOWCASE_REASON_TERMS = /(?:设计|视觉|作品|排版|叙事|交互|动效|品牌)/u
const RIGHTS_ACCESS_STATES = new Set([
  'open-source',
  'source-available',
  'closed-source',
])
const NON_OPEN_LICENSE_STATES = new Set(['unknown', 'custom', 'proprietary'])

function validateEvidenceSnapshotV3(bundle, snapshotErrors) {
  const errors = [...snapshotErrors]
  const emptyNormalized = {
    canonicalFacets: null,
    licenseFact: null,
    officialFinal: null,
    pageUrls: [],
    validFacts: [],
  }
  if (!isPlainObject(bundle)) {
    if (!errors.includes('bundle must be a plain object')) {
      errors.push('bundle must be a plain object')
    }
    return { errors, normalized: emptyNormalized }
  }

  if (bundle.schemaVersion !== 3) errors.push('schemaVersion must be 3')
  if (
    validateNonEmptyString(bundle.entryId, 'entryId', errors) &&
    !SITE_ID.test(bundle.entryId)
  ) {
    errors.push('entryId must match ^[a-z0-9][a-z0-9_-]{0,127}$')
  }
  if (
    validateNonEmptyString(bundle.entityId, 'entityId', errors) &&
    !SITE_ID.test(bundle.entityId)
  ) {
    errors.push('entityId must match ^[a-z0-9][a-z0-9_-]{0,127}$')
  }
  validateNonEmptyString(bundle.attemptId, 'attemptId', errors)
  if (bundle.status !== 'APPROVED') errors.push('status must be APPROVED')

  let officialFinal = null
  if (!isPlainObject(bundle.official)) {
    errors.push('official must be a plain object')
  } else {
    validateHttps(bundle.official.inputUrl, 'official.inputUrl', errors)
    officialFinal = validateHttps(bundle.official.finalUrl, 'official.finalUrl', errors)
    if (!isValidIsoTimestamp(bundle.official.checkedAt)) {
      errors.push('official.checkedAt must be a valid ISO timestamp')
    }
  }

  validateEditorial(bundle.editorial, errors)

  let canonicalFacets = null
  const facetValidationErrors = facetsErrors(bundle.facets)
  errors.push(...facetValidationErrors.map((error) => `facets: ${error}`))
  if (facetValidationErrors.length === 0) {
    try {
      canonicalFacets = canonicalizeFacets(bundle.facets)
    } catch {
      errors.push('facets could not be canonicalized safely')
    }
  }

  if (!isPlainObject(bundle.classification)) {
    errors.push('classification must be a plain object')
  } else {
    const taxonomyErrors = classificationErrors(bundle.classification)
    errors.push(...taxonomyErrors.map((error) => `classification: ${error}`))

    if (bundle.classification.entityId !== bundle.entityId) {
      errors.push('classification.entityId must match entityId')
    }
    if (
      bundle.classification.recordLevel === 'unit' &&
      bundle.classification.entryId !== bundle.entryId
    ) {
      errors.push('classification.entryId must match entryId')
    }
    if (
      bundle.classification.recordLevel === 'entry' &&
      Object.hasOwn(bundle.classification, 'entryId')
    ) {
      errors.push('entry classification must not define entryId')
    }
  }

  const { pageUrls } = validatePages(bundle.pages, bundle.entryId, errors)
  const { validFacts: structurallyValidFacts } = validateFacts(bundle.facts, errors)
  const validFacts = validateFactSourceScopes(
    officialFinal,
    structurallyValidFacts,
    errors,
  )
  validateQaV3(bundle.qa, errors)

  if (isPlainObject(bundle.classification) && isPlainObject(bundle.qa)) {
    if (bundle.classification.curatorId !== bundle.qa.curatorId) {
      errors.push('classification.curatorId must match qa.curatorId')
    }
    if (bundle.classification.reviewerId !== bundle.qa.semanticReviewerId) {
      errors.push('classification.reviewerId must match qa.semanticReviewerId')
    }
  }

  const licenseFact = validFacts.find(({ field }) => field === 'license') ?? null
  if (!licenseFact) {
    errors.push('rights gate requires a trusted license fact')
  }
  if (canonicalFacets && licenseFact) {
    const matchingLicense = canonicalFacets.licenses.some((licenseId) => (
      licenseId.toLowerCase() === licenseFact.value.toLowerCase()
    )) || (
      canonicalFacets.access.includes('source-available') &&
      canonicalFacets.licenses.includes('custom')
    )
    if (!matchingLicense) {
      errors.push('facets.licenses must match the trusted license fact')
    }
  }
  if (canonicalFacets) {
    const rightsAccess = canonicalFacets.access.filter((access) => (
      RIGHTS_ACCESS_STATES.has(access)
    ))
    if (rightsAccess.length > 1) {
      errors.push('rights access states are mutually exclusive; select at most one')
    }

    if (canonicalFacets.access.includes('open-source')) {
      const hasExplicitOpenLicense = canonicalFacets.licenses.some((license) => (
        !NON_OPEN_LICENSE_STATES.has(license)
      ))
      if (!licenseFact || !hasExplicitOpenLicense) {
        errors.push(
          'open-source requires a matching trusted SPDX license fact and cannot use unknown, custom, or proprietary',
        )
      }
    }
    if (canonicalFacets.access.includes('source-available')) {
      const usesOnlyCustom = (
        canonicalFacets.licenses.length === 1 &&
        canonicalFacets.licenses[0] === 'custom'
      )
      if (!licenseFact || !usesOnlyCustom) {
        errors.push('source-available requires custom plus a trusted non-empty license fact')
      }
    }
    if (
      canonicalFacets.access.includes('closed-source') &&
      canonicalFacets.licenses.some((license) => !NON_OPEN_LICENSE_STATES.has(license))
    ) {
      errors.push('closed-source cannot use an open-source SPDX license')
    }
  }

  validatePageOrigins(officialFinal, pageUrls, validFacts, errors)

  if (isPlainObject(bundle.classification)) {
    const showcaseReason = Array.isArray(bundle.classification.reasons)
      ? bundle.classification.reasons.find((reason) => (
        isPlainObject(reason) &&
        isNonEmptyString(reason.statement) &&
        safeHttpsDetails(reason.evidenceUrl) &&
        SHOWCASE_REASON_TERMS.test(reason.statement)
      ))
      : null
    const publishable = isPublishableClassification(bundle.classification, {
      name: bundle.editorial?.name,
      evidencePageCount: Array.isArray(bundle.pages) ? bundle.pages.length : 0,
      manualShowcaseReason: showcaseReason?.statement,
      designRelevanceConfirmed: Boolean(showcaseReason),
      validEntityIds: [bundle.entityId],
      validEntryIds: [bundle.entryId],
    })
    if (!publishable) {
      errors.push('classification must be confirmed and publishable')
    }
  }

  return {
    errors,
    normalized: {
      canonicalFacets,
      licenseFact,
      officialFinal,
      pageUrls,
      validFacts,
    },
  }
}

function prepareEvidenceBundle(input) {
  try {
    const { snapshot, errors: snapshotErrors } = snapshotEvidenceBundle(input)
    const validation = snapshot?.schemaVersion === 3
      ? validateEvidenceSnapshotV3(snapshot, snapshotErrors)
      : validateEvidenceSnapshotV2(snapshot, snapshotErrors)
    return {
      snapshot,
      ...validation,
    }
  } catch {
    return {
      snapshot: undefined,
      errors: ['bundle could not be validated safely'],
      normalized: { officialFinal: null, pageUrls: [], validFacts: [] },
    }
  }
}

export function evidenceBundleErrors(bundle) {
  return prepareEvidenceBundle(bundle).errors
}

function projectOfficialFacts(normalized) {
  const official = {}
  for (const fact of normalized.validFacts) {
    const { field } = fact
    if (OFFICIAL_FACT_FIELDS.has(field)) {
      official[field] = fact.value
    }
  }
  return official
}

function projectShots(bundle, normalized) {
  const pageByRole = new Map()
  for (let index = 0; index < bundle.pages.length; index += 1) {
    const page = bundle.pages[index]
    pageByRole.set(page.role, {
      page,
      urls: normalized.pageUrls[index],
    })
  }

  const shots = []
  for (const role of ROLE_ORDER) {
    const { page, urls } = pageByRole.get(role)
    shots.push({
      role,
      src: page.shot.src,
      sourceUrl: urls.sourceUrl.normalized,
      alt: page.shot.alt.trim(),
      sha256: page.shot.sha256.toLowerCase(),
      width: page.shot.width,
      height: page.shot.height,
    })
  }
  return shots
}

function projectV3Shots(bundle, normalized) {
  const pageByRole = new Map()
  for (let index = 0; index < bundle.pages.length; index += 1) {
    pageByRole.set(bundle.pages[index].role, {
      page: bundle.pages[index],
      urls: normalized.pageUrls[index],
    })
  }

  const shots = []
  for (const role of ROLE_ORDER) {
    const { page, urls } = pageByRole.get(role)
    shots.push({
      role,
      title: page.title.trim(),
      selectionRationale: page.selectionRationale.trim(),
      src: page.shot.src,
      inputUrl: urls.sourceUrl.normalized,
      sourceUrl: urls.finalUrl.normalized,
      alt: page.shot.alt.trim(),
      sha256: page.shot.sha256.toLowerCase(),
      width: page.shot.width,
      height: page.shot.height,
    })
  }
  return shots
}

function projectV2PublicSite(bundle, normalized) {
  const official = projectOfficialFacts(normalized)
  const shots = projectShots(bundle, normalized)

  const tags = []
  for (let index = 0; index < bundle.curation.tags.length; index += 1) {
    tags.push(bundle.curation.tags[index].trim())
  }

  return {
    id: bundle.siteId.trim(),
    name: bundle.curation.name.trim(),
    canonicalUrl: normalized.officialFinal.normalized,
    descriptionZh: bundle.curation.descriptionZh.trim(),
    resourceEssence: bundle.curation.resourceEssence.trim(),
    subcategory: bundle.curation.subcategory.trim(),
    score: bundle.curation.score,
    tags,
    pricing: bundle.curation.pricing,
    shots,
    official,
    evidenceRevision: bundle.attemptId.trim(),
  }
}

function projectV3PublicSite(bundle, normalized) {
  return {
    id: bundle.entryId.trim(),
    entityId: bundle.entityId.trim(),
    name: bundle.editorial.name.trim(),
    canonicalUrl: normalized.officialFinal.normalized,
    descriptionZh: bundle.editorial.descriptionZh.trim(),
    primaryCategory: bundle.classification.primaryCategory,
    subcategory: bundle.classification.subcategory,
    facets: normalized.canonicalFacets,
    pricing: bundle.editorial.pricing,
    shots: projectV3Shots(bundle, normalized),
    official: projectOfficialFacts(normalized),
    // These facts were verified in this immutable evidence attempt. They do not
    // claim that the source remains continuously online after verifiedAt.
    quality: {
      identityVerified: true,
      sourceLinkHealthy: true,
      evidenceCompleteness: 'complete',
      screenshotQaPassed: true,
      descriptionQaPassed: true,
      rightsStatus: normalized.licenseFact.value,
      verifiedAt: bundle.official.checkedAt.trim(),
    },
    evidenceRevision: bundle.attemptId.trim(),
  }
}

export function toPublicSite(input) {
  const { snapshot: bundle, errors, normalized } = prepareEvidenceBundle(input)
  if (errors.length > 0) {
    throw new TypeError(
      `Evidence bundle validation failed:\n- ${errors.join('\n- ')}`,
    )
  }

  return bundle.schemaVersion === 3
    ? projectV3PublicSite(bundle, normalized)
    : projectV2PublicSite(bundle, normalized)
}
