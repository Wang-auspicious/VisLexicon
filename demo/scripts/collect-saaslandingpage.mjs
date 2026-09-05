/* 采集 saaslandingpage.com。每个 article 先记录为 observation，只在派生 records 时去重。 */
import { mkdir, writeFile } from 'node:fs/promises'
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
const OUTPUT = resolve(DEMO_ROOT, 'data/sources/saaslandingpage.raw.json')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const DEFAULT_MAX_PAGES = Number(process.env.MAX_PAGES ?? 45)

function clean(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function validHttpUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

export function parseSaasLandingPage(
  html,
  { listingUrl = 'https://saaslandingpage.com/', page = 1, observedAt = new Date().toISOString() } = {},
) {
  const observations = []
  const request = { requestId: `saaslandingpage:page:${page}`, listingUrl, page }
  for (const [ordinal, article] of [...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)].entries()) {
    const body = article[1]
    const href = body.match(/href="([^"]+)"/i)?.[1] ?? null
    const heading = clean(
      body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ??
        body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1],
    )
    const title = clean(body.match(/title="([^"]+)"/i)?.[1])
    const description = clean(
      body.match(/<p[^>]*class="[^"]*(?:desc|excerpt|subtitle)[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.[1],
    )
    const tags = [...new Set([...body.matchAll(/\btag-([a-z0-9-]+)/g)].map((match) => match[1]))]
    const technologies = [
      ...new Set([...body.matchAll(/\btechnology-([a-z0-9-]+)/g)].map((match) => match[1])),
    ]
    let disposition = { status: 'accepted', reason: 'eligible' }
    if (!href) disposition = { status: 'rejected', reason: 'missing-original-url' }
    else if (!validHttpUrl(href)) disposition = { status: 'rejected', reason: 'malformed-original-url' }
    else if (!heading && !title) disposition = { status: 'rejected', reason: 'missing-name' }

    observations.push(
      createSourceObservation({
        sourceId: 'saaslandingpage',
        observedAt,
        request,
        ordinal,
        raw: {
          name: title || heading,
          originalUrl: href,
          originalDescription: description || heading,
          pricing: 'Unknown',
          categoryOriginal: 'Landing Pages',
          tags,
          technologies,
          listingUrl,
          page,
        },
        disposition,
      }),
    )
  }
  return observations
}

function saasRecords(observations) {
  return deriveSourceRecords(observations, {
    key: (item) => item.raw.originalUrl,
    project: (item) => ({
      name: item.raw.name,
      originalUrl: item.raw.originalUrl,
      originalDescription: item.raw.originalDescription,
      pricing: item.raw.pricing ?? 'Unknown',
      categoryOriginal: item.raw.categoryOriginal ?? 'Landing Pages',
      tags: item.raw.tags ?? [],
      technologies: item.raw.technologies ?? [],
      ...(item.raw.listingUrl ? { listingUrl: item.raw.listingUrl } : {}),
    }),
    merge: (_existing, next) => next,
  })
}

export function buildSaasPayload({
  observations,
  failures,
  requestAttempts,
  successfulRequests,
  collectedAt,
}) {
  const records = saasRecords(observations)
  const acceptedObservationCount = observations.filter(
    ({ disposition }) => disposition.status === 'accepted',
  ).length
  const requestSummary = summarizeRequests({ requestAttempts, successfulRequests, observations, failures })
  const payload = {
    schemaVersion: 2,
    source: {
      id: 'saaslandingpage',
      name: 'SaaS Landing Page',
      url: 'https://saaslandingpage.com/',
      description: 'SaaS landing page examples and design inspiration directory.',
      collectedAt,
      rawRecordCount: observations.length,
      failures,
    },
    listingPages: [
      {
        name: 'Landing Pages',
        path: '/',
        url: 'https://saaslandingpage.com/',
        observationCount: observations.length,
        acceptedObservationCount,
        recordCount: records.length,
        failedRequestCount: failures.length,
        status: failures.length === 0 ? 'complete' : observations.length === 0 ? 'failed' : 'partial',
      },
    ],
    observations,
    requestSummary,
    rawRecordCount: observations.length,
    records,
    failures,
  }
  const errors = validateCountConservation(payload)
  if (errors.length > 0) throw new Error(`SaaS count conservation failed: ${errors.join('; ')}`)
  return payload
}

export async function collectSaasLandingPage({
  fetchImpl = globalThis.fetch,
  maxPages = DEFAULT_MAX_PAGES,
  observedAt = new Date().toISOString(),
  collectedAt = observedAt.slice(0, 10),
  delayMs = 500,
  maxFailures = 3,
} = {}) {
  const observations = []
  const failures = []
  let requestAttempts = 0
  let successfulRequests = 0

  for (let page = 1; page <= maxPages; page += 1) {
    const url = page === 1 ? 'https://saaslandingpage.com/' : `https://saaslandingpage.com/page/${page}/`
    const requestId = `saaslandingpage:page:${page}`
    requestAttempts += 1
    try {
      const response = await fetchImpl(url, {
        headers: { 'User-Agent': UA },
        redirect: 'follow',
        signal: AbortSignal.timeout(20_000),
      })
      if (!response.ok) throw new Error(`${response.status}`)
      const html = await response.text()
      successfulRequests += 1
      observations.push(...parseSaasLandingPage(html, { listingUrl: url, page, observedAt }))
      if (delayMs > 0) await new Promise((resolveDelay) => setTimeout(resolveDelay, delayMs))
    } catch (error) {
      failures.push(
        createRequestFailure({
          sourceId: 'saaslandingpage',
          requestId,
          url,
          page,
          message: error.message,
          failedAt: observedAt,
        }),
      )
      if (failures.length >= maxFailures) break
    }
  }
  return buildSaasPayload({ observations, failures, requestAttempts, successfulRequests, collectedAt })
}

async function main() {
  const payload = await collectSaasLandingPage()
  await mkdir(dirname(OUTPUT), { recursive: true })
  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`)
  process.stdout.write(
    `saaslandingpage: raw=${payload.rawRecordCount} unique=${payload.records.length} failures=${payload.failures.length}\n`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
