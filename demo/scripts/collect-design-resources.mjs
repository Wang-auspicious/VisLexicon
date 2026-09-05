import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  createRequestFailure,
  createSourceObservation,
  deriveSourceRecords,
  summarizeRequests,
  validateCountConservation,
} from '../src/lib/source-observation-ledger.js'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIR, '..')
const REPOSITORY = 'bradtraversy/design-resources-for-developers'
const REPOSITORY_URL = `https://github.com/${REPOSITORY}`
const CONTENTS_API = `https://api.github.com/repos/${REPOSITORY}/contents`
const DEFAULT_FALLBACK = resolve(DEMO_ROOT, 'parsed-design-sites.json')
const DEFAULT_OUTPUT = resolve(
  DEMO_ROOT,
  'data/sources/design-resources-for-developers.raw.json',
)
const USER_AGENT = 'VisLexicon catalog collector/1.0 (+public GitHub research)'

function cleanMarkdown(value = '') {
  return String(value)
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/\\\|/g, '|')
    .replace(/\s+/g, ' ')
    .trim()
}

function headingSlug(value) {
  return value
    .toLocaleLowerCase('en-US')
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function validHttpUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

export function parseMarkdownResourceObservations(
  markdown,
  sourceMeta,
  { observedAt = `${sourceMeta.collectedAt}T00:00:00.000Z` } = {},
) {
  const observations = []
  let categoryOriginal = ''
  let ordinal = 0

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*$/)?.[1]
    if (heading) {
      categoryOriginal = cleanMarkdown(heading)
      continue
    }
    if (!categoryOriginal || categoryOriginal === 'Table of Contents') continue

    const row = line.match(/^\|\s*\[([^\]]*)\]\(([^)]*)\)\s*\|\s*(.*?)\s*\|\s*$/)
    if (!row) continue

    const name = cleanMarkdown(row[1])
    const originalUrl = row[2].trim()
    const originalDescription = cleanMarkdown(row[3])
    let disposition = { status: 'accepted', reason: 'directory-row' }
    if (!originalUrl) disposition = { status: 'rejected', reason: 'missing-original-url' }
    else if (!validHttpUrl(originalUrl)) {
      disposition = { status: 'rejected', reason: 'malformed-original-url' }
    } else if (!name) disposition = { status: 'rejected', reason: 'missing-name' }
    else if (!originalDescription) disposition = { status: 'rejected', reason: 'missing-description' }

    const listingUrl = `${REPOSITORY_URL}/blob/${sourceMeta.defaultBranch}/${sourceMeta.readmePath}#${headingSlug(categoryOriginal)}`
    observations.push(
      createSourceObservation({
        sourceId: 'design-resources-for-developers',
        observedAt,
        request: { requestId: 'design-resources:readme', listingUrl },
        ordinal,
        raw: {
          name,
          originalUrl,
          originalDescription,
          pricing: 'Unknown',
          categoryOriginal,
          listingUrl,
          collectedAt: sourceMeta.collectedAt,
        },
        disposition,
      }),
    )
    ordinal += 1
  }

  return observations
}

export function parseMarkdownResources(markdown, sourceMeta) {
  return deriveSourceRecords(parseMarkdownResourceObservations(markdown, sourceMeta), {
    key: (observation) => observation.observationId,
    project: (observation) => observation.raw,
  })
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': USER_AGENT },
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return response.json()
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return response.text()
}

async function collectFromGithub() {
  const repository = await fetchJson(`https://api.github.com/repos/${REPOSITORY}`)
  const contents = await fetchJson(CONTENTS_API)
  const readme = contents.find(
    ({ type, name }) => type === 'file' && name.toLocaleLowerCase('en-US') === 'readme.md',
  )
  if (!readme?.download_url) throw new Error('GitHub contents API did not expose the README')

  const observedAt = new Date().toISOString()
  const collectedAt = observedAt.slice(0, 10)
  const sourceMeta = {
    defaultBranch: repository.default_branch,
    readmePath: readme.path,
    readmeUrl: readme.html_url,
    rawUrl: readme.download_url,
    commitSha: readme.sha,
    collectedAt,
  }
  const markdown = await fetchText(readme.download_url)
  return {
    observations: parseMarkdownResourceObservations(markdown, sourceMeta, { observedAt }),
    sourceMeta,
    requestAttempts: 3,
    successfulRequests: 3,
    failures: [],
  }
}

async function collectFromFallback(fallback) {
  const legacy = JSON.parse(await readFile(fallback, 'utf8'))
  const collectedAt = new Date().toISOString().slice(0, 10)
  return {
    sourceMeta: {
      defaultBranch: 'master',
      readmePath: 'readme.md',
      readmeUrl: `${REPOSITORY_URL}/blob/master/readme.md`,
      rawUrl: null,
      commitSha: null,
      collectedAt,
      fallback: fallback.replaceAll('\\', '/'),
    },
    records: legacy.map(({ name, url, desc, category }) => ({
      name,
      originalUrl: url,
      originalDescription: desc,
      pricing: 'Unknown',
      categoryOriginal: category,
      listingUrl: `${REPOSITORY_URL}/blob/master/readme.md#${headingSlug(category)}`,
      collectedAt,
    })),
    requestAttempts: 1,
    successfulRequests: 0,
    failures: [
      createRequestFailure({
        sourceId: 'design-resources-for-developers',
        requestId: 'design-resources:github:offline',
        url: REPOSITORY_URL,
        message: 'offline mode requested',
        failedAt: `${collectedAt}T00:00:00.000Z`,
        usedFallback: true,
      }),
    ],
  }
}

function parseArgs(argv) {
  const options = { output: DEFAULT_OUTPUT, fallback: DEFAULT_FALLBACK, offline: false }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--output') options.output = resolve(argv[++index])
    else if (value === '--fallback') options.fallback = resolve(argv[++index])
    else if (value === '--offline') options.offline = true
    else throw new Error(`Unknown argument: ${value}`)
  }
  return options
}

export async function collectDesignResources(options) {
  let collected
  if (options.offline) collected = await collectFromFallback(options.fallback)
  else collected = await collectFromGithub()
  const observedAt = options.observedAt ?? `${collected.sourceMeta.collectedAt}T00:00:00.000Z`
  const observations =
    collected.observations ??
    collected.records.map((record, ordinal) =>
      createSourceObservation({
        sourceId: 'design-resources-for-developers',
        observedAt,
        request: {
          requestId: options.offline ? 'design-resources:fallback' : 'design-resources:readme',
          listingUrl: record.listingUrl,
        },
        ordinal,
        raw: record,
        disposition: { status: 'accepted', reason: 'directory-row' },
      }),
    )
  return buildDesignResourcesPayload({
    observations,
    failures: collected.failures,
    requestAttempts: collected.requestAttempts,
    successfulRequests: collected.successfulRequests,
    sourceMeta: collected.sourceMeta,
  })
}

export function buildDesignResourcesPayload({
  observations,
  failures,
  requestAttempts,
  successfulRequests,
  sourceMeta,
}) {
  const records = deriveSourceRecords(observations, {
    key: (observation) => observation.observationId,
    project: (observation) => observation.raw,
  })
  const requestSummary = summarizeRequests({ requestAttempts, successfulRequests, observations, failures })
  const payload = {
    schemaVersion: 2,
    source: {
      id: 'design-resources-for-developers',
      name: 'Design Resources for Developers',
      url: REPOSITORY_URL,
      description: 'Public GitHub directory of design and UI resources for developers.',
      collectedAt: sourceMeta.collectedAt,
      ...sourceMeta,
      rawRecordCount: observations.length,
      failures,
    },
    observations,
    requestSummary,
    rawRecordCount: observations.length,
    records,
    failures,
  }
  const errors = validateCountConservation(payload)
  if (errors.length > 0) throw new Error(`design resources count conservation failed: ${errors.join('; ')}`)
  return payload
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const result = await collectDesignResources(options)
  await mkdir(dirname(options.output), { recursive: true })
  await writeFile(options.output, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  process.stdout.write(
    `${JSON.stringify({ output: options.output, records: result.rawRecordCount, source: result.source, failures: result.failures }, null, 2)}\n`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
