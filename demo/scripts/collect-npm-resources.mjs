/* 从 npm registry search 采集设计/前端资源类站点。原始命中先记录为 observation，再派生去重 records。 */
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
const OUTPUT = resolve(DEMO_ROOT, 'data/sources/npm-resources.raw.json')
const UA = 'VisLexicon catalog collector/2.0 (+public npm registry research)'

export const NPM_QUERIES = [
  ['react ui components', 'React UI Libraries', 'React UI 库'],
  ['vue ui components', 'Vue UI Libraries', 'Vue UI 库'],
  ['svelte ui components', 'Svelte UI Libraries', 'Svelte UI 库'],
  ['angular ui components', 'Angular UI Libraries', 'Angular UI 库'],
  ['react native ui components', 'React Native UI Libraries', 'React Native UI 库'],
  ['css framework', 'CSS Frameworks', 'CSS 框架'],
  ['tailwind css components', 'React UI Libraries', 'Tailwind 组件'],
  ['animation library javascript', 'Javascript Animation Libraries', 'JavaScript 动效库'],
  ['icon library', 'Icons', '图标库'],
  ['icon font', 'Icon Fonts', '图标字体'],
  ['font library', 'Fonts', '字体与排版'],
  ['chart library javascript', 'Javascript Chart Libraries', 'JavaScript 图表库'],
  ['color palette generator', 'Color Tools', '色彩工具'],
  ['gradient generator', 'Color Tools', '色彩工具'],
  ['figma plugin', 'Design Tools', 'Figma 插件'],
  ['design system react', 'Design Systems & Style Guides', '设计系统与样式指南'],
  ['3d javascript library', 'Javascript Animation Libraries', 'Three.js 与 3D'],
  ['form builder javascript', 'Design Tools', '表单构建'],
  ['rich text editor', 'Design Tools', '富文本编辑器'],
  ['ui kit tailwind', 'UI Components & Kits', 'Tailwind 组件'],
]

const EXCLUDED_HOSTS = new Set([
  'npmjs.com',
  'www.npmjs.com',
  'github.io',
  'jsdelivr.net',
  'unpkg.com',
  'w3.org',
  'example.com',
])

function normalizeHttpUrl(value) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    url.hash = ''
    url.search = ''
    return url.href.replace(/\/$/, '')
  } catch {
    return null
  }
}

function classifyPackage(pkg, score, minPopularity) {
  const description = String(pkg.description ?? '').trim()
  const popularity = score?.detail?.popularity ?? 0
  const homepage = pkg.links?.homepage ?? null
  const repository = pkg.links?.repository ?? null
  const originalUrl = normalizeHttpUrl(homepage) || normalizeHttpUrl(repository)

  if (description.length < 25) return { status: 'rejected', reason: 'description-too-short', originalUrl }
  if (popularity < minPopularity) return { status: 'rejected', reason: 'below-minimum-popularity', originalUrl }
  if (!originalUrl) {
    return {
      status: 'rejected',
      reason: homepage || repository ? 'malformed-site-url' : 'missing-site-url',
      originalUrl: null,
    }
  }
  if (/\/blob\/|\/tree\//.test(originalUrl)) {
    return { status: 'rejected', reason: 'repository-file-or-tree-url', originalUrl }
  }
  const host = new URL(originalUrl).hostname.replace(/^www\./, '')
  if (EXCLUDED_HOSTS.has(host)) return { status: 'rejected', reason: 'excluded-host', originalUrl }
  return { status: 'accepted', reason: 'eligible', originalUrl }
}

export function observeNpmResult({ result, query, from, index, minPopularity, observedAt }) {
  const pkg = result?.package ?? {}
  const popularity = result?.score?.detail?.popularity ?? 0
  const disposition = classifyPackage(pkg, result?.score, minPopularity)
  return createSourceObservation({
    sourceId: 'npm-resources',
    observedAt,
    request: { requestId: `npm:${query}:${from}`, query, from },
    ordinal: index,
    raw: {
      name: pkg.name ?? '',
      npmName: pkg.name ?? '',
      homepage: pkg.links?.homepage ?? null,
      repository: pkg.links?.repository ?? null,
      description: pkg.description ?? '',
      popularity,
      originalUrl: disposition.originalUrl,
      originalDescription: String(pkg.description ?? '').trim(),
      pricing: 'Free',
    },
    disposition: { status: disposition.status, reason: disposition.reason },
  })
}

function npmRecords(observations) {
  return deriveSourceRecords(observations, {
    key: (item) => item.raw.originalUrl,
    project: (item) => ({
      name: item.raw.name ?? '',
      originalUrl: item.raw.originalUrl ?? '',
      originalDescription: item.raw.originalDescription ?? '',
      pricing: item.raw.pricing ?? 'Free',
      categoryOriginal: item.request.categoryOriginal ?? '',
      subcategoryZh: item.request.subcategoryZh ?? '',
      npmName: item.raw.npmName ?? item.raw.name ?? '',
      popularity: Number.isFinite(item.raw.popularity)
        ? Math.round(item.raw.popularity * 1000) / 1000
        : 0,
    }),
    merge: (existing, next) => ({
      ...existing,
      originalDescription:
        existing.originalDescription.length >= next.originalDescription.length
          ? existing.originalDescription
          : next.originalDescription,
      popularity: Math.max(existing.popularity, next.popularity),
    }),
  }).sort((a, b) => b.popularity - a.popularity)
}

export function buildNpmPayload({
  observations,
  failures,
  requestAttempts,
  successfulRequests,
  collectedAt,
  queries = NPM_QUERIES,
}) {
  const requestSummary = summarizeRequests({ requestAttempts, successfulRequests, observations, failures })
  const listingPages = queries.map(([query]) => {
    const queryObservations = observations.filter((item) => item.request.query === query)
    const failedRequestCount = failures.filter((failure) => failure.query === query).length
    return {
      name: query,
      path: `/search?q=${query}`,
      url: `https://www.npmjs.com/search?q=${query}`,
      observationCount: queryObservations.length,
      recordCount: queryObservations.filter(({ disposition }) => disposition.status === 'accepted').length,
      failedRequestCount,
      status:
        failedRequestCount === 0 ? 'complete' : queryObservations.length === 0 ? 'failed' : 'partial',
    }
  })
  const payload = {
    schemaVersion: 2,
    source: {
      id: 'npm-resources',
      name: 'npm registry search (design & frontend resources)',
      url: 'https://registry.npmjs.org/',
      description:
        'Targeted npm registry searches for component libraries, frameworks, icon/font/motion/chart libraries and design tools.',
      collectedAt,
      rawRecordCount: observations.length,
      listingPages,
      failures,
    },
    listingPages,
    observations,
    requestSummary,
    rawRecordCount: observations.length,
    failures,
    records: npmRecords(observations),
  }
  const errors = validateCountConservation(payload)
  if (errors.length > 0) throw new Error(`npm count conservation failed: ${errors.join('; ')}`)
  return payload
}

export async function collectNpmResources({
  fetchImpl = globalThis.fetch,
  queries = NPM_QUERIES,
  fromValues = [0, 250, 500],
  minPopularity = Number(process.env.MIN_POPULARITY ?? 0.2),
  observedAt = new Date().toISOString(),
  collectedAt = observedAt.slice(0, 10),
  delayMs = 250,
} = {}) {
  const observations = []
  const failures = []
  let requestAttempts = 0
  let successfulRequests = 0

  for (const [query, categoryOriginal, subcategoryZh] of queries) {
    for (const from of fromValues) {
      const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=250&from=${from}`
      const requestId = `npm:${query}:${from}`
      requestAttempts += 1
      try {
        const response = await fetchImpl(url, {
          headers: { 'User-Agent': UA },
          signal: AbortSignal.timeout(20_000),
        })
        if (!response.ok) throw new Error(`${response.status} ${url}`)
        const data = await response.json()
        successfulRequests += 1
        for (const [index, result] of (data.objects ?? []).entries()) {
          const base = observeNpmResult({ result, query, from, index, minPopularity, observedAt })
          observations.push(
            createSourceObservation({
              sourceId: base.sourceId,
              observedAt: base.observedAt,
              request: { ...base.request, categoryOriginal, subcategoryZh },
              ordinal: base.ordinal,
              raw: base.raw,
              disposition: base.disposition,
            }),
          )
        }
      } catch (error) {
        failures.push(
          createRequestFailure({
            sourceId: 'npm-resources',
            requestId,
            url,
            query,
            from,
            message: error.message,
            failedAt: observedAt,
          }),
        )
      }
      if (delayMs > 0) await new Promise((resolveDelay) => setTimeout(resolveDelay, delayMs))
    }
  }

  return buildNpmPayload({
    observations,
    failures,
    requestAttempts,
    successfulRequests,
    collectedAt,
    queries,
  })
}

async function main() {
  const payload = await collectNpmResources()
  await mkdir(dirname(OUTPUT), { recursive: true })
  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`)
  process.stdout.write(
    `npm-resources: raw=${payload.rawRecordCount} uniqueSites=${payload.records.length} failures=${payload.failures.length}\n`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
