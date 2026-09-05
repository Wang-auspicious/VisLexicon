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
const HOME_URL = 'https://www.toools.design/'
const DEFAULT_HOME_HTML = resolve(DEMO_ROOT, 'toools-home.html')
const DEFAULT_OUTPUT = resolve(DEMO_ROOT, 'data/sources/toools-design.raw.json')
const USER_AGENT = 'VisLexicon catalog collector/1.0 (+public directory research)'
const REDIRECT_HOST_PATTERN = /(?:^|\.)(?:amzn\.to|pxf\.io|sjv\.io|partnerlinks\.io|jdoqocy\.com)$|^1\.envato\.market$|^go\.streamlinehq\.com$/i

const FALLBACK_CATEGORY_PAGES = [
  ['/ai-design-tools', 'AI Tools'],
  ['/ui-web-design-inspiration-websites', 'Inspiration'],
  ['/free-open-source-icon-libraries', 'Icons'],
  ['/free-open-source-illustrations', 'Illustrations'],
  ['/mockups-ui-kits-and-freebies', 'Mocks + UI Kits'],
  ['/free-stock-images-videos', 'Stock Photos'],
  ['/learn-ui-ux-design', 'Learning'],
  ['/design-communities', 'Community'],
  ['/best-design-blogs-and-magazines', 'Blogs & Mags'],
  ['/best-design-podcasts', 'Podcasts'],
  ['/books-for-designers', 'Books'],
  ['/productivity-tools-for-design-and-poduct-teams', 'Productivity'],
  ['/best-design-tools', 'Design Tools'],
  ['/best-ux-tools', 'UX Tools'],
  ['/best-color-inspiration-tools', 'Color Tools'],
  ['/font-library-and-inspiration', 'Typography'],
  ['/marketing-tools', 'Marketing'],
  ['/best-no-code-website-builders', 'Web Builders'],
]

function decodeHtml(value = '') {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  }

  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] ?? entity)
}

function cleanText(value = '') {
  return decodeHtml(value)
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function absoluteTooolsUrl(pathOrUrl) {
  return new URL(decodeHtml(pathOrUrl), HOME_URL).href
}

export function extractCategoryPages(html) {
  const pages = []
  const seen = new Set()
  const linkPattern = /<a\b[^>]*href="([^"]+)"[^>]*class="[^"]*categories_link[^"]*"[^>]*>([\s\S]*?)<\/a>/gi

  for (const match of html.matchAll(linkPattern)) {
    const path = new URL(absoluteTooolsUrl(match[1])).pathname.replace(/\/$/, '') || '/'
    const name = cleanText(match[2])
    if (!name || seen.has(path)) continue
    seen.add(path)
    pages.push({ name, path, url: absoluteTooolsUrl(path) })
  }

  if (pages.length >= 18) return pages

  for (const [path, name] of FALLBACK_CATEGORY_PAGES) {
    if (seen.has(path)) continue
    pages.push({ name, path, url: absoluteTooolsUrl(path) })
  }
  return pages
}

export function extractResourceObservations(
  html,
  listing,
  { observedAt = new Date().toISOString() } = {},
) {
  const observations = []
  const cardPattern = /<a\b([^>]*\bclass="[^"]*card_global\s+(?:resources|books)-card[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi

  for (const [ordinal, match] of [...html.matchAll(cardPattern)].entries()) {
    const attributes = match[1]
    const body = match[2]
    const href = attributes.match(/\bhref="([^"]+)"/i)?.[1]
    const name = cleanText(body.match(/<h3\b[^>]*class="[^"]*headline_3[^"]*"[^>]*>([\s\S]*?)<\/h3>/i)?.[1])
    const originalDescription = cleanText(
      body.match(/<p\b[^>]*class="[^"]*resources_description[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.[1],
    )
    const pricing = cleanText(
      body.match(/<div\b[^>]*class="[^"]*pricing-tag[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)?.[1] ??
        body.match(/<div\b[^>]*class="[^"]*pricing-tag[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1],
    )
    const imageUrl = decodeHtml(
      body.match(/<img\b[^>]*\bsrc="([^"]+)"[^>]*class="[^"]*img_resource[^"]*"/i)?.[1] ?? '',
    )

    let originalUrl = href ? decodeHtml(href) : null
    let disposition = { status: 'accepted', reason: 'resource-card' }
    if (!href) disposition = { status: 'rejected', reason: 'missing-original-url' }
    else if (!/^https?:\/\//i.test(originalUrl)) {
      disposition = { status: 'rejected', reason: 'malformed-original-url' }
    } else {
      try {
        originalUrl = new URL(originalUrl).href
        if (new URL(originalUrl).hostname.replace(/^www\./, '') === 'toools.design') {
          disposition = { status: 'rejected', reason: 'source-directory-url' }
        }
      } catch {
        disposition = { status: 'rejected', reason: 'malformed-original-url' }
      }
    }
    if (disposition.status === 'accepted' && !name) {
      disposition = { status: 'rejected', reason: 'missing-name' }
    } else if (disposition.status === 'accepted' && !originalDescription) {
      disposition = { status: 'rejected', reason: 'missing-description' }
    }

    observations.push(
      createSourceObservation({
        sourceId: 'toools-design',
        observedAt,
        request: { requestId: `toools:listing:${listing.path}`, listingUrl: listing.url },
        ordinal,
        raw: {
          name,
          originalUrl,
          originalDescription,
          pricing: pricing || 'Unknown',
          categoryOriginal: listing.name,
          listingUrl: listing.url,
          imageUrl: imageUrl || null,
          rawHref: href ?? null,
        },
        disposition,
      }),
    )
  }

  return observations
}

export function extractResourceCards(html, listing) {
  return deriveSourceRecords(extractResourceObservations(html, listing), {
    key: (observation) => observation.observationId,
    project: (observation) => {
      const record = { ...observation.raw }
      delete record.rawHref
      return record
    },
  })
}

async function fetchText(url, attempts = 3) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45_000)
    try {
      const response = await fetch(url, {
        headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': USER_AGENT },
        redirect: 'follow',
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      return await response.text()
    } catch (error) {
      lastError = error
      if (attempt < attempts) await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 750))
    } finally {
      clearTimeout(timeout)
    }
  }
  throw lastError
}

async function resolveRedirect(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25_000)
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
      signal: controller.signal,
    })
    return {
      resolvedUrl: response.url || url,
      resolutionHttpStatus: response.status,
      resolutionStatus: response.url && response.url !== url ? 'resolved' : 'unchanged',
    }
  } catch (error) {
    return { resolvedUrl: null, resolutionHttpStatus: null, resolutionStatus: `failed: ${error.message}` }
  } finally {
    clearTimeout(timeout)
  }
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length)
  let cursor = 0
  async function worker() {
    while (cursor < values.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(values[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()))
  return results
}

async function resolveAffiliateRedirects(records) {
  const urls = [
    ...new Set(
      records
        .map(({ originalUrl }) => originalUrl)
        .filter((url) => REDIRECT_HOST_PATTERN.test(new URL(url).hostname)),
    ),
  ]
  const resolutions = await mapWithConcurrency(urls, 8, resolveRedirect)
  const byUrl = new Map(urls.map((url, index) => [url, resolutions[index]]))
  return records.map((record) => ({ ...record, ...(byUrl.get(record.originalUrl) ?? {}) }))
}

function parseArgs(argv) {
  const options = {
    homeHtml: DEFAULT_HOME_HTML,
    output: DEFAULT_OUTPUT,
    offlineDir: null,
    resolveRedirects: true,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--home-html') options.homeHtml = resolve(argv[++index])
    else if (value === '--output') options.output = resolve(argv[++index])
    else if (value === '--offline-dir') options.offlineDir = resolve(argv[++index])
    else if (value === '--skip-redirects') options.resolveRedirects = false
    else throw new Error(`Unknown argument: ${value}`)
  }
  return options
}

async function readListingHtml(listing, options) {
  if (!options.offlineDir) return fetchText(listing.url)
  const filename = `${listing.path.replace(/^\//, '')}.html`
  return readFile(resolve(options.offlineDir, filename), 'utf8')
}

export function buildTooolsPayload({
  observations,
  failures,
  requestAttempts,
  successfulRequests,
  listings,
  collectedAt,
}) {
  const records = deriveSourceRecords(observations, {
    key: (observation) => observation.observationId,
    project: (observation) => {
      const record = { ...observation.raw, collectedAt }
      delete record.rawHref
      return record
    },
  })
  const requestSummary = summarizeRequests({ requestAttempts, successfulRequests, observations, failures })
  const payload = {
    schemaVersion: 2,
    source: {
      id: 'toools-design',
      name: 'TOOOLS.design',
      url: HOME_URL,
      description: 'TOOOLS.design public design-resource category listings.',
      collectedAt,
      rawRecordCount: observations.length,
      failures,
    },
    listingPages: listings,
    observations,
    requestSummary,
    rawRecordCount: observations.length,
    records,
    failures,
  }
  const errors = validateCountConservation(payload)
  if (errors.length > 0) throw new Error(`Toools count conservation failed: ${errors.join('; ')}`)
  return payload
}

export async function collectToools(options) {
  const observedAt = options.observedAt ?? new Date().toISOString()
  const failures = []
  let requestAttempts = 1
  let successfulRequests = 0
  let homeHtml
  try {
    homeHtml = await fetchText(HOME_URL)
    successfulRequests += 1
  } catch (error) {
    failures.push(
      createRequestFailure({
        sourceId: 'toools-design',
        requestId: 'toools:home:network',
        url: HOME_URL,
        message: error.message,
        failedAt: observedAt,
      }),
    )
    requestAttempts += 1
    homeHtml = await readFile(options.homeHtml, 'utf8')
    successfulRequests += 1
  }

  const listings = extractCategoryPages(homeHtml)
  const observations = []

  for (const listing of listings) {
    requestAttempts += 1
    try {
      const html = await readListingHtml(listing, options)
      successfulRequests += 1
      const listingObservations = extractResourceObservations(html, listing, { observedAt })
      if (listingObservations.length === 0) throw new Error('no resource cards found')
      observations.push(...listingObservations)
      listing.observationCount = listingObservations.length
      listing.recordCount = listingObservations.filter(
        ({ disposition }) => disposition.status === 'accepted',
      ).length
    } catch (error) {
      listing.recordCount = 0
      listing.observationCount = 0
      failures.push(
        createRequestFailure({
          sourceId: 'toools-design',
          requestId: `toools:listing:${listing.path}`,
          url: listing.url,
          message: error.message,
          failedAt: observedAt,
        }),
      )
    }
  }

  const collectedAt = options.collectedAt ?? observedAt.slice(0, 10)
  const payload = buildTooolsPayload({
    observations,
    failures,
    requestAttempts,
    successfulRequests,
    listings,
    collectedAt,
  })
  if (options.resolveRedirects) payload.records = await resolveAffiliateRedirects(payload.records)
  return payload
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const result = await collectToools(options)
  await mkdir(dirname(options.output), { recursive: true })
  await writeFile(options.output, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  process.stdout.write(
    `${JSON.stringify({ output: options.output, listings: result.listingPages.length, records: result.rawRecordCount, failures: result.failures }, null, 2)}\n`,
  )
  if (result.failures.length > 0) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
