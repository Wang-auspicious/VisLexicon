import {
  createHash,
  randomUUID,
} from 'node:crypto'
import {
  access,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm,
  stat,
} from 'node:fs/promises'
import {
  dirname,
  join,
  resolve,
} from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import {
  CURATION_CATEGORIES,
  CURATION_SUBCATEGORIES,
} from '../src/data/curation-taxonomy.js'
import { evidenceBundleErrors, toPublicSite } from '../src/lib/curation-evidence.js'
import { normalizeIdentityUrl } from '../src/lib/site-identity.js'
import { readImageMetadata } from './curation/image-metadata.mjs'

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIRECTORY, '..')
const DEFAULT_APPROVED_DIR = join(DEMO_ROOT, 'data', 'curation', 'approved-v3')
const DEFAULT_OUTPUT_DIR = join(DEMO_ROOT, 'public', 'data', 'curation')
const DEFAULT_CANDIDATE_CATALOG = join(DEMO_ROOT, 'src', 'data', 'site-catalog.json')
const SAFE_ID = /^[a-z0-9][a-z0-9_-]{0,127}$/u
const REVISION = /^[a-f0-9]{12}$/u

function fail(message, cause) {
  throw new TypeError(message, cause ? { cause } : undefined)
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function safeSnapshot(value, label = 'value', ancestors = new WeakSet()) {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) return value
  if (typeof value !== 'object') fail(`${label} must contain only JSON data`)

  let isArray
  let prototype
  let keys
  try {
    isArray = Array.isArray(value)
    prototype = Reflect.getPrototypeOf(value)
    keys = Reflect.ownKeys(value)
  } catch (error) {
    fail(`${label} could not be inspected safely`, error)
  }
  if (isArray ? prototype !== Array.prototype : (
    prototype !== Object.prototype && prototype !== null
  )) {
    fail(`${label} must contain only plain JSON objects and arrays`)
  }
  if (ancestors.has(value)) fail(`${label} must not contain a cycle`)
  ancestors.add(value)

  let output
  if (isArray) {
    let lengthDescriptor
    try {
      lengthDescriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
    } catch (error) {
      fail(`${label}.length could not be inspected safely`, error)
    }
    const length = lengthDescriptor?.value
    if (
      !lengthDescriptor ||
      !Object.hasOwn(lengthDescriptor, 'value') ||
      !Number.isSafeInteger(length) ||
      length < 0 ||
      length > 100_000
    ) fail(`${label}.length must be a safe data property`)
    output = new Array(length)
    for (let index = 0; index < length; index += 1) {
      let descriptor
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, String(index))
      } catch (error) {
        fail(`${label}[${index}] could not be inspected safely`, error)
      }
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
        fail(`${label}[${index}] must be a data property`)
      }
      output[index] = safeSnapshot(descriptor.value, `${label}[${index}]`, ancestors)
    }
    for (const key of keys) {
      if (key === 'length') continue
      if (typeof key !== 'string' || !/^(?:0|[1-9]\d*)$/u.test(key) || Number(key) >= length) {
        fail(`${label} contains an unexpected property`)
      }
    }
  } else {
    output = {}
    for (const key of keys) {
      if (typeof key !== 'string') fail(`${label} contains an unexpected symbol property`)
      let descriptor
      try {
        descriptor = Reflect.getOwnPropertyDescriptor(value, key)
      } catch (error) {
        fail(`${label}.${key} could not be inspected safely`, error)
      }
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
        fail(`${label}.${key} must be a data property`)
      }
      Object.defineProperty(output, key, {
        configurable: true,
        enumerable: true,
        value: safeSnapshot(descriptor.value, `${label}.${key}`, ancestors),
        writable: true,
      })
    }
  }
  ancestors.delete(value)
  return output
}

function transactionFs(overrides) {
  const supplied = overrides && typeof overrides === 'object' ? overrides : {}
  return {
    access: supplied.access ?? access,
    mkdir: supplied.mkdir ?? mkdir,
    open: supplied.open ?? open,
    readFile: supplied.readFile ?? readFile,
    readdir: supplied.readdir ?? readdir,
    rename: supplied.rename ?? rename,
    rm: supplied.rm ?? rm,
    stat: supplied.stat ?? stat,
  }
}

async function writeExclusive(filePath, bytes, fsAdapter) {
  let handle
  try {
    handle = await fsAdapter.open(filePath, 'wx')
    let offset = 0
    while (offset < bytes.length) {
      const result = await handle.write(bytes, offset, bytes.length - offset, offset)
      if (!Number.isSafeInteger(result?.bytesWritten) || result.bytesWritten <= 0) {
        fail(`write made no progress for ${filePath}`)
      }
      offset += result.bytesWritten
    }
    if (typeof handle.sync === 'function') await handle.sync()
  } finally {
    if (handle) await handle.close()
  }
}

async function pathExists(filePath, fsAdapter) {
  try {
    await fsAdapter.access(filePath)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

async function readJsonFile(filePath, fsAdapter, label) {
  let raw
  try {
    raw = await fsAdapter.readFile(filePath, 'utf8')
  } catch (error) {
    fail(`unable to read ${label}: ${filePath}`, error)
  }
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    fail(`${label} is not valid JSON: ${filePath}`, error)
  }
  return safeSnapshot(parsed, label)
}

function safeStatus(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : ''
}

function safeId(value, fallback) {
  const candidate = typeof value === 'string' ? value.trim() : ''
  return SAFE_ID.test(candidate) ? candidate : fallback
}

function normalizedUrlOrNull(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    return normalizeIdentityUrl(value)
  } catch {
    return null
  }
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort(compareText)
}

function candidateEntries(catalog) {
  if (Array.isArray(catalog)) return catalog
  if (catalog && Array.isArray(catalog.entries)) return catalog.entries
  if (catalog && Array.isArray(catalog.rows)) return catalog.rows
  return []
}

function candidateObservationRecords(catalog) {
  const records = []
  const entries = candidateEntries(catalog)
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
    const candidateId = safeId(entry.id, `candidate-${index + 1}`)
    const candidateName = typeof entry.name === 'string' && entry.name.trim()
      ? entry.name.trim()
      : candidateId
    const canonicalUrl = normalizedUrlOrNull(entry.canonicalUrl ?? entry.url)
    const evidence = Array.isArray(entry.sourceEvidence) ? entry.sourceEvidence : []
    const observations = evidence.length > 0 ? evidence : [{}]
    for (let observationIndex = 0; observationIndex < observations.length; observationIndex += 1) {
      const observation = observations[observationIndex]
      if (!observation || typeof observation !== 'object' || Array.isArray(observation)) continue
      const originalUrl = normalizedUrlOrNull(observation.originalUrl)
      const resolvedUrl = normalizedUrlOrNull(observation.resolvedUrl)
      const normalizedUrl = resolvedUrl ?? originalUrl ?? canonicalUrl
      if (!normalizedUrl) continue
      records.push({
        candidateId,
        candidateName,
        canonicalUrl,
        sourceId: typeof observation.sourceId === 'string' && observation.sourceId.trim()
          ? observation.sourceId.trim()
          : 'unknown-source',
        listingUrl: normalizedUrlOrNull(observation.listingUrl),
        originalUrl: originalUrl ?? normalizedUrl,
        resolvedUrl,
        normalizedUrl,
      })
    }
    if (canonicalUrl && !records.some((record) => (
      record.candidateId === candidateId && record.normalizedUrl === canonicalUrl
    ))) {
      records.push({
        candidateId,
        candidateName,
        canonicalUrl,
        sourceId: 'catalog-canonical',
        listingUrl: null,
        originalUrl: canonicalUrl,
        resolvedUrl: null,
        normalizedUrl: canonicalUrl,
      })
    }
  }
  const seen = new Set()
  return records
    .filter((record) => {
      const key = JSON.stringify(record)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((left, right) => (
      compareText(left.normalizedUrl, right.normalizedUrl) ||
      compareText(left.candidateId, right.candidateId) ||
      compareText(left.sourceId, right.sourceId) ||
      compareText(left.listingUrl ?? '', right.listingUrl ?? '') ||
      compareText(left.originalUrl, right.originalUrl) ||
      compareText(left.resolvedUrl ?? '', right.resolvedUrl ?? '')
    ))
}

function approvedAliases(bundle, primaryUrl) {
  const aliases = []
  if (bundle.official?.inputUrl) aliases.push(bundle.official.inputUrl)
  if (bundle.official?.finalUrl) aliases.push(bundle.official.finalUrl)
  for (const fact of Array.isArray(bundle.facts) ? bundle.facts : []) {
    if (fact?.field === 'repository' && typeof fact.value === 'string') aliases.push(fact.value)
  }
  return uniqueSorted(aliases.map(normalizedUrlOrNull).filter((url) => url && url !== primaryUrl))
}

function buildPublishedRows(publicRecords, bundles) {
  const rows = []
  const owned = new Map()
  for (let index = 0; index < publicRecords.length; index += 1) {
    const publicSite = publicRecords[index]
    const bundle = bundles[index]
    const primaryUrl = normalizedUrlOrNull(bundle.official?.inputUrl) ??
      normalizedUrlOrNull(bundle.official?.finalUrl)
    if (!primaryUrl) fail(`approved bundle ${publicSite.id} has no safe official URL`)
    const aliases = approvedAliases(bundle, primaryUrl)
    const urls = [primaryUrl, ...aliases]
    for (const url of urls) {
      const prior = owned.get(url)
      if (prior && prior !== publicSite.entityId) {
        fail(`published resolver URL is owned by multiple entities: ${url}`)
      }
      owned.set(url, publicSite.entityId)
    }
    rows.push({
      entityId: publicSite.entityId,
      canonicalName: publicSite.name,
      status: 'published',
      primaryUrl,
      aliases,
    })
  }
  return { rows, owned }
}

function buildResolver(publicRecords, bundles, catalog) {
  const published = buildPublishedRows(publicRecords, bundles)
  const candidateRecords = candidateObservationRecords(catalog)
  const candidateById = new Map()
  const candidateOwned = new Map(published.owned)
  // A catalog observation may retain an affiliate/query URL that is not the
  // same normalized string as the published root. If that candidate's
  // canonical URL is already published, suppress the whole candidate row while
  // retaining every raw observation below; otherwise the resolver would expose
  // one entity with a published primary URL under a second entity id.
  const publishedCandidateIds = new Set(
    candidateRecords
      .filter((record) => record.canonicalUrl && published.owned.has(record.canonicalUrl))
      .map((record) => record.candidateId),
  )

  for (const observation of candidateRecords) {
    if (publishedCandidateIds.has(observation.candidateId)) continue
    if (published.owned.has(observation.normalizedUrl)) continue
    const current = candidateById.get(observation.candidateId) ?? {
      entityId: observation.candidateId,
      canonicalName: observation.candidateName,
      status: 'candidate',
      primaryUrl: observation.canonicalUrl ?? observation.normalizedUrl,
      aliases: [],
    }
    const owner = candidateOwned.get(observation.normalizedUrl)
    if (owner && owner !== observation.candidateId) continue
    if (!owner) candidateOwned.set(observation.normalizedUrl, observation.candidateId)
    if (observation.normalizedUrl !== current.primaryUrl) current.aliases.push(observation.normalizedUrl)
    candidateById.set(observation.candidateId, current)
  }

  const rows = [
    ...published.rows,
    ...[...candidateById.values()]
      .map((row) => ({ ...row, aliases: uniqueSorted(row.aliases.filter((url) => url !== row.primaryUrl)) }))
      .sort((left, right) => compareText(left.entityId, right.entityId)),
  ]
  const observations = candidateRecords.map((record) => ({
    candidateId: record.candidateId,
    sourceId: record.sourceId,
    listingUrl: record.listingUrl,
    originalUrl: record.originalUrl,
    resolvedUrl: record.resolvedUrl,
    normalizedUrl: record.normalizedUrl,
    status: 'candidate-observation',
  }))
  return {
    schemaVersion: 1,
    rows,
    observations,
  }
}

function flattenTaxonomy() {
  const records = []
  let order = 0
  for (const category of CURATION_CATEGORIES) {
    for (const subcategory of CURATION_SUBCATEGORIES[category.id] ?? []) {
      order += 1
      records.push({
        order,
        categoryId: category.id,
        categoryLabel: category.label,
        subcategoryId: subcategory.id,
        subcategoryLabel: subcategory.label,
      })
    }
  }
  return records
}

function buildProgress(publicRecords, queue) {
  const counts = new Map()
  for (const record of publicRecords) {
    const key = `${record.primaryCategory}\u0000${record.subcategory}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const taskRecords = Array.isArray(queue?.tasks) ? queue.tasks : []
  for (const task of taskRecords) {
    if (!task || typeof task !== 'object') continue
    if (task.status !== 'APPROVED') continue
    const categoryId = typeof task.categoryId === 'string' ? task.categoryId : null
    const subcategoryId = typeof task.subcategoryId === 'string' ? task.subcategoryId : null
    if (!categoryId || !subcategoryId) continue
    const key = `${categoryId}\u0000${subcategoryId}`
    if (!counts.has(key)) counts.set(key, 1)
  }

  const subcategories = flattenTaxonomy().map((record) => {
    const key = `${record.categoryId}\u0000${record.subcategoryId}`
    const approvedCount = counts.get(key) ?? 0
    return {
      ...record,
      state: approvedCount > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
      assignedCount: 0,
      approvedCount,
    }
  })
  const firstActive = subcategories.find((record) => record.approvedCount > 0) ?? subcategories[0]
  return {
    schemaVersion: 1,
    activeCategory: firstActive?.categoryId ?? null,
    activeSubcategory: firstActive?.subcategoryId ?? null,
    subcategories,
  }
}

function computeRevision(index, resolver, progress) {
  const payload = jsonBytes({ index, resolver, progress })
  return sha256(payload).slice(0, 12)
}

async function verifyBundleShots(bundle, publicRoot) {
  const root = resolve(publicRoot)
  for (const page of bundle.pages) {
    const relativePath = page.shot.src.replace(/^\//u, '')
    const filePath = resolve(root, relativePath)
    const rootPrefix = root.endsWith('\\') || root.endsWith('/') ? root : `${root}${process.platform === 'win32' ? '\\' : '/'}`
    const comparableFilePath = process.platform === 'win32' ? filePath.toLowerCase() : filePath
    const comparableRootPrefix = process.platform === 'win32' ? rootPrefix.toLowerCase() : rootPrefix
    if (!comparableFilePath.startsWith(comparableRootPrefix)) {
      fail(`shot path escapes public root for ${bundle.entryId}: ${page.shot.src}`)
    }
    let metadata
    try {
      metadata = await readImageMetadata(filePath)
    } catch (error) {
      fail(`unable to verify shot for ${bundle.entryId}/${page.role}: ${filePath}`, error)
    }
    if (
      metadata.sha256 !== page.shot.sha256 ||
      metadata.width !== page.shot.width ||
      metadata.height !== page.shot.height ||
      metadata.bytes !== page.shot.bytes
    ) {
      fail(`shot metadata mismatch for ${bundle.entryId}/${page.role}`)
    }
  }
}

function outputFile(outputDir, filename) {
  const resolvedOutput = resolve(outputDir)
  const candidate = resolve(outputDir, filename)
  if (dirname(candidate) !== resolvedOutput) fail(`output filename escapes output directory: ${filename}`)
  return candidate
}

/**
 * Build and atomically publish the immutable v3 public curation revision.
 * No file is written until every approved bundle and projection has passed its
 * evidence gate. Existing revision files are immutable; only manifest.json is
 * advanced after all revision files are present.
 */
export async function buildCurationPublic(options = {}) {
  const fsAdapter = transactionFs(options.fs)
  const approvedDir = resolve(options.approvedDir ?? DEFAULT_APPROVED_DIR)
  const outputDir = resolve(options.outputDir ?? DEFAULT_OUTPUT_DIR)
  const catalogPath = options.candidateCatalogPath
    ? resolve(options.candidateCatalogPath)
    : DEFAULT_CANDIDATE_CATALOG

  const catalog = Object.hasOwn(options, 'candidateCatalog')
    ? safeSnapshot(options.candidateCatalog, 'candidate catalog')
    : await readJsonFile(catalogPath, fsAdapter, 'candidate catalog')
  const names = (await fsAdapter.readdir(approvedDir))
    .filter((name) => typeof name === 'string' && name.endsWith('.json'))
    .sort(compareText)
  const approvedBundles = []
  const quarantinedBundles = []
  for (const name of names) {
    const filePath = join(approvedDir, name)
    const parsed = await readJsonFile(filePath, fsAdapter, `approved bundle ${name}`)
    const status = safeStatus(parsed.status)
    if (status === 'APPROVED') {
      if (!SAFE_ID.test(parsed.entryId ?? '')) fail(`approved bundle entryId is unsafe: ${name}`)
      const errors = evidenceBundleErrors(parsed)
      if (errors.length > 0) fail(`approved bundle validation failed for ${name}: ${errors.join('; ')}`)
      if (options.verifyShots === true) {
        await verifyBundleShots(parsed, options.publicRoot ?? join(DEMO_ROOT, 'public'))
      }
      approvedBundles.push({ bundle: parsed, filePath: name, publicSite: toPublicSite(parsed) })
    } else if (status.startsWith('QUARANTINED') || status === 'CANDIDATE' || status === 'NEEDS_REVIEW') {
      quarantinedBundles.push({ bundle: parsed, filePath: name })
    } else {
      fail(`unsupported approved-directory bundle status in ${name}: ${parsed.status}`)
    }
  }

  approvedBundles.sort((left, right) => compareText(left.publicSite.id, right.publicSite.id))
  const publicRecords = approvedBundles.map(({ publicSite }) => publicSite)
  const bundles = approvedBundles.map(({ bundle }) => bundle)
  const index = {
    schemaVersion: 1,
    entries: publicRecords,
  }
  const resolver = buildResolver(publicRecords, bundles, catalog)
  const queue = Object.hasOwn(options, 'queue')
    ? safeSnapshot(options.queue, 'queue')
    : (options.queuePath
      ? await readJsonFile(resolve(options.queuePath), fsAdapter, 'queue')
      : null)
  const progress = buildProgress(publicRecords, queue)
  const revision = computeRevision(index, resolver, progress)
  if (!REVISION.test(revision)) fail('computed revision is invalid')

  const revisionIndex = { ...index, revision }
  const revisionResolver = { ...resolver, revision }
  const revisionProgress = { ...progress, revision }
  const indexName = `site-index.${revision}.json`
  const resolverName = `resolver.${revision}.json`
  const progressName = `progress.${revision}.json`
  const manifestName = 'manifest.json'
  const files = [
    [indexName, jsonBytes(revisionIndex)],
    [resolverName, jsonBytes(revisionResolver)],
    [progressName, jsonBytes(revisionProgress)],
  ]
  const manifest = {
    schemaVersion: 1,
    revision,
    indexUrl: `/data/curation/${indexName}`,
    resolverUrl: `/data/curation/${resolverName}`,
    publishedCount: publicRecords.length,
    progress: revisionProgress,
  }
  const manifestBytes = jsonBytes(manifest)
  await fsAdapter.mkdir(outputDir, { recursive: true })

  const token = typeof options.runId === 'string' && /^[A-Za-z0-9_-]{1,80}$/u.test(options.runId)
    ? options.runId
    : randomUUID().replace(/-/gu, '')
  const temporaryPaths = []
  try {
    for (const [name, bytes] of files) {
      const target = outputFile(outputDir, name)
      if (await pathExists(target, fsAdapter)) {
        const existing = Buffer.from(await fsAdapter.readFile(target))
        if (!existing.equals(bytes)) fail(`immutable revision already exists with different bytes: ${target}`)
      } else {
        const temp = outputFile(outputDir, `.${name}.${token}.tmp`)
        temporaryPaths.push(temp)
        await writeExclusive(temp, bytes, fsAdapter)
        await fsAdapter.rename(temp, target)
        temporaryPaths.pop()
      }
    }

    const manifestPath = outputFile(outputDir, manifestName)
    const manifestTemp = outputFile(outputDir, `.${manifestName}.${token}.tmp`)
    temporaryPaths.push(manifestTemp)
    await writeExclusive(manifestTemp, manifestBytes, fsAdapter)
    await fsAdapter.rename(manifestTemp, manifestPath)
    temporaryPaths.pop()
  } catch (error) {
    for (const temporary of temporaryPaths) {
      try { await fsAdapter.rm(temporary, { force: true }) } catch { /* preserve primary error */ }
    }
    throw error
  }

  return {
    revision,
    index: revisionIndex,
    resolver: revisionResolver,
    progress: revisionProgress,
    manifest,
    quarantined: quarantinedBundles.map(({ filePath }) => filePath),
    outputDir,
  }
}

export { buildProgress, buildResolver, computeRevision, safeSnapshot }

export async function main() {
  const result = await buildCurationPublic({ verifyShots: true, publicRoot: join(DEMO_ROOT, 'public') })
  console.log(`Published ${result.manifest.publishedCount} approved entries at revision ${result.revision}`)
  return result
}

const invokedPath = process.argv[1]
if (invokedPath && pathToFileURL(resolve(invokedPath)).href === import.meta.url) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
