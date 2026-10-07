/*
 * SiteEntry graph adapters.
 *
 * These adapters deliberately stop at evidence.  They do not classify an
 * entry, write a Chinese description, approve a review, or publish a public
 * file.  The graph is the owner of those transitions; this module only turns
 * a URL into bounded, hash-addressed observations that the graph can settle.
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { lookup } from 'node:dns/promises'
import { normalizeIdentityUrl } from '../../src/lib/site-identity.js'

export const PROBE_DEFAULTS = Object.freeze({
  timeoutMs: 20_000,
  maxBytes: 4 * 1024 * 1024,
  maxRedirects: 8,
  maxAttempts: 3,
  retryDelayMs: 350,
  userAgent: 'VisLexiconSiteGraph/1.0 (+evidence capture; contact via site)',
})

export const EXPLORE_DEFAULTS = Object.freeze({
  width: 1280,
  height: 900,
  dpr: 1,
  settleMs: 1100,
  maxLinks: 500,
  maxBodyLinks: 1000,
  timeoutMs: 25_000,
  contexts: 2,
  recycleEvery: 30,
})

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const nowIso = (clock = Date) => new Date(clock.now()).toISOString()
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const withDefaults = (defaults, supplied = {}) => ({ ...defaults,
  ...Object.fromEntries(Object.entries(supplied).filter(([, value]) => value !== undefined)) })

function asUrl(value, field = 'url') {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field}-required`)
  let url
  try { url = new URL(value.trim()) } catch { throw new Error(`${field}-invalid`) }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`${field}-protocol`)
  // Use the established safety check without using its identity projection:
  // routes, hashes and query parameters are original evidence, not aliases.
  try { normalizeIdentityUrl(url.href) } catch { throw new Error(`${field}-not-public`) }
  return url
}

export async function assertPublicUrl(value, { resolveHost = lookup } = {}) {
  const url = asUrl(value)
  const addresses = await resolveHost(url.hostname.replace(/^\[|\]$/gu, ''), { all: true, verbatim: true })
  const rows = Array.isArray(addresses) ? addresses : [addresses]
  if (!rows.length) throw new Error('dns-empty')
  for (const row of rows) {
    if (!row?.address) throw new Error('dns-address-missing')
    const host = row.address.includes(':') ? `[${row.address}]` : row.address
    try { normalizeIdentityUrl(`https://${host}/`) } catch { throw new Error('dns-non-public-address') }
  }
  return { url: url.href, addresses: rows.map(row => ({ address: row.address, family: row.family })) }
}

function siteHost(value) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./u, '') } catch { return '' }
}

export function sameSite(left, right) {
  const a = siteHost(left)
  const b = siteHost(right)
  return Boolean(a && b && a === b)
}

function retryableStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500
}

function boundedText(buffer, contentType) {
  if (!/^(?:text\/|application\/(?:json|ld\+json|xhtml\+xml|javascript))/iu.test(contentType || '')) return ''
  return buffer.toString('utf8')
}

async function readBoundedBody(response, maxBytes) {
  const reader = response.body?.getReader?.()
  if (!reader) {
    const bytes = Buffer.from(await response.arrayBuffer())
    return { bytes: bytes.subarray(0, maxBytes), truncated: bytes.length > maxBytes, totalBytes: bytes.length }
  }
  const chunks = []
  let totalBytes = 0
  let keptBytes = 0
  let truncated = false
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = Buffer.from(value)
      totalBytes += chunk.length
      if (keptBytes < maxBytes) {
        const kept = chunk.subarray(0, Math.max(0, maxBytes - keptBytes))
        chunks.push(kept)
        keptBytes += kept.length
      }
      if (totalBytes > maxBytes) {
        truncated = true
        await reader.cancel().catch(() => {})
        break
      }
    }
  } finally {
    reader.releaseLock?.()
  }
  return { bytes: Buffer.concat(chunks), truncated, totalBytes }
}

function extractFacts(text, headers, bodyBytes) {
  const visible = text
    .replace(/<script[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style[\s\S]*?<\/style>/giu, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/giu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
  const attribute = (pattern) => {
    const match = pattern.exec(text)
    return match ? match[1].replace(/&amp;/gu, '&').replace(/&quot;/gu, '"').trim() : null
  }
  const jsonLdTypes = []
  for (const match of text.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/giu)) {
    try {
      const parsed = JSON.parse(match[1])
      for (const row of (Array.isArray(parsed) ? parsed : [parsed])) if (row?.['@type']) jsonLdTypes.push(String(row['@type']))
    } catch { /* malformed page JSON-LD is an observed fact, not a fatal probe */ }
  }
  return {
    title: attribute(/<title[^>]*>([\s\S]*?)<\/title>/iu),
    canonical: attribute(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/iu),
    description: attribute(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/iu),
    ogImage: attribute(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/iu),
    jsonLdTypes: [...new Set(jsonLdTypes)],
    htmlBytes: bodyBytes.length,
    textChars: visible.length,
    firstScreenText: visible.slice(0, 400),
    contentType: headers.get?.('content-type') || headers['content-type'] || '',
    etag: headers.get?.('etag') || headers.etag || null,
    lastModified: headers.get?.('last-modified') || headers['last-modified'] || null,
  }
}

function locationOf(response) {
  return response.headers?.get?.('location') || response.headers?.location || null
}

function publicRedirect(next, previous) {
  try {
    const target = asUrl(next, 'redirect')
    // Cross-origin identity changes are a reviewable result.  Do not follow a
    // new host automatically; retain its exact Location for the identity step.
    if (!sameSite(target.href, previous.href)) return { ok: false, reason: 'cross-site-redirect', url: target.href }
    if (previous.protocol === 'https:' && target.protocol !== 'https:') return { ok: false, reason: 'https-downgrade-redirect', url: target.href }
    return { ok: true, url: target.href }
  } catch (error) {
    return { ok: false, reason: error.message, url: String(next || '') }
  }
}

async function requestOnce(url, { fetchImpl, timeoutMs, maxBytes, userAgent, clock = Date, resolveHost = lookup }) {
  const startedAt = nowIso(clock)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const addressCheck = await Promise.race([assertPublicUrl(url, { resolveHost }), new Promise((_, reject) => {
      controller.signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true })
    })])
    const response = await fetchImpl(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'user-agent': userAgent, accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8' },
    })
    const contentType = String(response.headers?.get?.('content-type') || response.headers?.['content-type'] || '')
    const body = response.status >= 300 && response.status < 400
      ? { bytes: Buffer.alloc(0), truncated: false, totalBytes: 0 }
      : await readBoundedBody(response, maxBytes)
    const finishedAt = nowIso(clock)
    return {
      ok: true,
      status: response.status,
      headers: { contentType, location: locationOf(response), etag: response.headers?.get?.('etag') || null },
      body,
      addressCheck,
      startedAt,
      finishedAt,
    }
  } catch (error) {
    return {
      ok: false,
      error: controller.signal.aborted ? 'timeout' : String(error?.message || error),
      startedAt,
      finishedAt: nowIso(clock),
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Probe one public URL.  The returned `bodyBytes` is intentionally kept out of
 * JSON records by `runProbe`; callers must pass it through graph.putBlob().
 */
export async function probeSource(input, options = {}) {
  const config = withDefaults(PROBE_DEFAULTS, options)
  const fetchImpl = config.fetchImpl || globalThis.fetch
  if (typeof fetchImpl !== 'function') throw new Error('fetch-unavailable')
  const initial = asUrl(input.url || input.rawUrl || input.canonicalUrl, 'source-url')
  const requests = []
  const redirects = []
  const failures = []
  let current = initial
  let final = null
  let bodyBytes = Buffer.alloc(0)
  let bodyMeta = null
  let attempts = 0
  let redirectHops = 0

  while (redirectHops <= config.maxRedirects) {
    let result
    for (let retry = 0; retry < config.maxAttempts; retry += 1) {
      attempts += 1
      result = await requestOnce(current.href, { ...config, fetchImpl })
      requests.push({ url: current.href, retry, ...result, body: undefined })
      const networkFailure = !result.ok && /(?:network|fetch failed|econn|enotfound|dns|socket)/iu.test(String(result.error || ''))
      if ((result.ok && !retryableStatus(result.status || 0)) || retry + 1 >= config.maxAttempts || (result.ok ? !retryableStatus(result.status || 0) : !networkFailure && result.error !== 'timeout')) break
      await sleep(config.retryDelayMs * 2 ** retry)
    }
    if (!result.ok) {
      failures.push({ url: current.href, reason: result.error, retryable: result.error === 'timeout' || /(?:network|fetch failed|econn|enotfound|dns|socket)/iu.test(String(result.error || '')) })
      break
    }
    if (result.status >= 300 && result.status < 400) {
      const location = result.headers.location
      if (!location) {
        failures.push({ url: current.href, status: result.status, reason: 'redirect-without-location', retryable: false })
        break
      }
      const next = publicRedirect(new URL(location, current.href).href, current)
      redirects.push({ from: current.href, to: next.url, status: result.status, safe: next.ok })
      if (!next.ok) {
        failures.push({ url: current.href, status: result.status, reason: next.reason, retryable: false })
        break
      }
      current = asUrl(next.url, 'redirect')
      redirectHops += 1
      continue
    }
    final = { url: current.href, status: result.status, headers: result.headers, startedAt: result.startedAt, finishedAt: result.finishedAt }
    bodyBytes = result.body.bytes
    bodyMeta = { bytes: result.body.bytes.length, totalBytes: result.body.totalBytes, truncated: result.body.truncated,
      sha256: sha256(result.body.bytes), mediaType: result.headers.contentType || 'application/octet-stream' }
    if (result.status >= 400) failures.push({ url: current.href, status: result.status, reason: `http-${result.status}`, retryable: retryableStatus(result.status) })
    break
  }
  if (!final && !failures.length) failures.push({ url: current.href, reason: 'redirect-limit', retryable: true })
  const text = final ? boundedText(bodyBytes, final.headers.contentType) : ''
  const status = final && final.status >= 200 && final.status < 400 ? 'success' : failures.some(f => f.retryable) ? 'retryable-failure' : 'blocked'
  const sourceSnapshot = {
    requestedUrl: initial.href,
    finalUrl: final?.url || null,
    redirects,
    codeSha: bodyMeta?.sha256 || null,
    bodySha: bodyMeta?.sha256 || null,
    status: final?.status || null,
  }
  return {
    adapterVersion: 'site-graph-probe-1', stage: 'probe', status,
    rawUrl: input.rawUrl || input.url || input.canonicalUrl, inputUrl: initial.href,
    finalUrl: final?.url || null, checkedAt: nowIso(config.clock),
    requests: requests.map(({ body: _body, ...request }) => request), redirects, failures,
    official: final ? { inputUrl: initial.href, finalUrl: final.url, status: final.status, checkedAt: final.finishedAt } : null,
    facts: final ? extractFacts(text, new Headers({ 'content-type': final.headers.contentType || '' }), bodyBytes) : null,
    body: bodyMeta,
    sourceSnapshot,
    bodyBytes,
  }
}

function normalizeLinks(value, baseUrl, maxLinks) {
  const seen = new Set()
  const links = []
  for (const row of value || []) {
    let href
    try { href = new URL(row.href, baseUrl).href } catch { continue }
    if (!/^https?:/iu.test(href) || seen.has(href)) continue
    seen.add(href)
    links.push({ href, text: String(row.text || '').trim().slice(0, 240), rel: String(row.rel || '').trim(),
      target: String(row.target || '').trim(), sameSite: sameSite(href, baseUrl) })
    if (links.length >= maxLinks) break
  }
  return links
}

async function pageInfo(page, url, config) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs })
  await page.waitForLoadState('load', { timeout: 4_000 }).catch(() => {})
  await sleep(config.settleMs)
  const info = await page.evaluate((maxLinks) => {
    const text = document.body?.innerText || ''
    const links = [...document.querySelectorAll('a[href]')].slice(0, maxLinks).map((anchor) => ({
      href: anchor.getAttribute('href'), text: anchor.innerText || anchor.textContent || '',
      rel: anchor.getAttribute('rel') || '', target: anchor.getAttribute('target') || '',
    }))
    return { title: document.title || null, h1: document.querySelector('h1')?.innerText?.trim() || null,
      textChars: text.length, firstScreenText: text.replace(/\s+/gu, ' ').trim().slice(0, 400), links }
  }, config.maxBodyLinks)
  return { status: response?.status?.() || 0, finalUrl: page.url(), info }
}

function chooseRoleUrls(entry, identity, pages) {
  const provided = pages && typeof pages === 'object' && !Array.isArray(pages) ? pages : {}
  const identityUrl = provided.identity || entry.finalUrl || entry.url || entry.sourceUrl || entry.canonicalUrl
  const allLinks = [...(identity.info?.links || [])]
  const catalog = entry.inputs?.probe?.deliverables?.catalog || entry.probe?.deliverables?.catalog
  const catalogUrl = catalog?.source || catalog?.url
  const breadthCandidate = provided.breadth || catalogUrl || allLinks.find(link => /component|block|template|icon|library|catalog|gallery|showcase|browse|example|doc/iu.test(`${link.text} ${link.href}`))?.href
  const proofLinks = allLinks.filter(link => link.sameSite && link.href !== identityUrl && link.href !== breadthCandidate)
  const proofCandidate = provided.proof || proofLinks.find(link => /\/(?:components?|blocks?|templates?|icons?|elements?|examples?)\/[^/]+/iu.test(link.href))?.href || proofLinks[0]?.href
  return { identity: identityUrl, breadth: breadthCandidate || null, proof: proofCandidate || null }
}

/**
 * Explore one SiteEntry in a fresh context.  If a browser/context is supplied
 * it is reused by the batch runner; otherwise this function owns and closes a
 * temporary browser.  Screenshots remain Buffers until the CLI stores them as
 * graph blobs.
 */
export async function exploreSource(input, options = {}) {
  const config = withDefaults(EXPLORE_DEFAULTS, options)
  const entry = input.entry || input
  const providedBrowser = options.browser
  const providedContext = options.context
  let browser = providedBrowser
  let context = providedContext
  let ownsBrowser = false
  try {
    if (!context) {
      if (!browser) {
        const { chromium } = await import('playwright-core')
        let executablePath = options.executablePath
        if (!executablePath) {
          try { ({ resolveChromium: executablePath } = await import('../../playwright.config.js')) } catch { executablePath = undefined }
          if (typeof executablePath === 'function') executablePath = executablePath()
        }
        browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true,
          args: ['--disable-dev-shm-usage', '--disable-gpu', '--hide-scrollbars'] })
        ownsBrowser = true
      }
      context = await browser.newContext({ viewport: { width: config.width, height: config.height }, deviceScaleFactor: config.dpr,
        reducedMotion: 'reduce', locale: 'en-US' })
    }
    const visited = new Set()
    const pages = []
    const roleUrls = chooseRoleUrls(entry, { info: { links: [] } }, options.pages)
    const openRole = async (role, url) => {
      if (!url) return null
      let normalized
      try { normalized = asUrl(url, `${role}-url`).href } catch (error) { return { role, url, blocked: true, reason: error.message } }
      if (visited.has(normalized)) return { role, url: normalized, blocked: true, reason: 'duplicate-page-url' }
      visited.add(normalized)
      const page = await context.newPage()
      try {
        const loaded = await pageInfo(page, normalized, config)
        const shot = await page.screenshot({ type: 'png', animations: 'disabled', caret: 'hide' })
        const links = normalizeLinks(loaded.info.links, loaded.finalUrl, config.maxLinks)
        const blockedReason = loaded.status < 200 || loaded.status >= 400
          ? `http-${loaded.status}`
          : /^(?:just a moment|access denied|attention required|403 forbidden|verify you are|security verification)/iu.test(loaded.info.title || '')
            ? 'access-challenge' : null
        const pageRecord = { role, inputUrl: normalized, sourceUrl: loaded.finalUrl, status: loaded.status,
          ...(blockedReason ? { blocked: true, reason: blockedReason } : {}),
          title: loaded.info.title, h1: loaded.info.h1, facts: { textChars: loaded.info.textChars, firstScreenText: loaded.info.firstScreenText },
          outgoingLinks: links, screenshot: { bytes: shot, sha256: sha256(shot), bytesLength: shot.length,
            mediaType: 'image/png', width: config.width, height: config.height, dpr: config.dpr },
        }
        pages.push(pageRecord)
        return pageRecord
      } catch (error) {
        const record = { role, inputUrl: normalized, sourceUrl: page.url(), blocked: true,
          reason: String(error?.message || error).slice(0, 500), outgoingLinks: [] }
        pages.push(record)
        return record
      } finally { await page.close().catch(() => {}) }
    }
    const identity = await openRole('identity', roleUrls.identity)
    if (!options.pages || !options.pages.breadth || !options.pages.proof) {
      const links = identity?.outgoingLinks || []
      const dynamic = chooseRoleUrls({ ...entry, finalUrl: identity?.sourceUrl || roleUrls.identity }, { info: { links } }, options.pages)
      if (!roleUrls.breadth) roleUrls.breadth = dynamic.breadth
      if (!roleUrls.proof) roleUrls.proof = dynamic.proof
    }
    await openRole('breadth', roleUrls.breadth)
    const breadth = pages.find(page => page.role === 'breadth')
    if (!roleUrls.proof && breadth) {
      roleUrls.proof = breadth.outgoingLinks?.find(link => link.sameSite && /\/(?:components?|blocks?|templates?|icons?|elements?|examples?)\/[^/]+/iu.test(link.href))?.href
    }
    await openRole('proof', roleUrls.proof)
    const roles = new Set(pages.filter(page => !page.blocked && page.screenshot).map(page => page.role))
    const pending = []
    for (const role of ['identity', 'breadth', 'proof']) if (!roles.has(role)) pending.push({ role, reason: pages.find(page => page.role === role)?.reason || 'no-safe-candidate' })
    return { adapterVersion: 'site-graph-explore-1', stage: 'explore', status: pending.length ? 'partial' : 'success',
      entryId: entry.entryId, checkedAt: nowIso(config.clock), viewport: { width: config.width, height: config.height, dpr: config.dpr },
      pages, pending, scope: { captured: 'first viewport after DOMContentLoaded/load and settle delay',
        notCovered: ['pagination', 'login-only content', 'collapsed or delayed sections', 'states requiring user interaction'] },
      evidence: pages.filter(page => page.screenshot).map(page => ({
        evidenceId: `${entry.entryId || 'entry'}--${page.role}--${page.screenshot.sha256.slice(0, 16)}`,
        role: page.role, ref: page.screenshot.sha256, sha256: page.screenshot.sha256,
        bytes: page.screenshot.bytesLength, mediaType: page.screenshot.mediaType,
        sourceUrl: page.sourceUrl || page.inputUrl, capturedAt: nowIso(config.clock), method: 'browser-screenshot',
      })),
      screenshots: pages.filter(page => page.screenshot).map(page => ({ role: page.role, ...page.screenshot })),
    }
  } finally {
    if (!providedContext && context) await context.close().catch(() => {})
    if (ownsBrowser && browser) await browser.close().catch(() => {})
  }
}

export async function exploreBatch(claims, options = {}) {
  const config = withDefaults(EXPLORE_DEFAULTS, options)
  const { chromium } = await import('playwright-core')
  let executablePath = options.executablePath
  if (!executablePath) {
    try { const configModule = await import('../../playwright.config.js'); executablePath = configModule.resolveChromium() } catch { /* playwright can resolve its bundled browser */ }
  }
  const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true,
    args: ['--disable-dev-shm-usage', '--disable-gpu', '--hide-scrollbars'] })
  const contexts = await Promise.all(Array.from({ length: Math.max(1, Math.min(config.contexts, claims.length || 1)) }, () => browser.newContext({
    viewport: { width: config.width, height: config.height }, deviceScaleFactor: config.dpr, reducedMotion: 'reduce', locale: 'en-US',
  })))
  const results = new Array(claims.length)
  let cursor = 0
  try {
    await Promise.all(contexts.map(async (context) => {
      for (;;) {
        const index = cursor++
        if (index >= claims.length) return
        results[index] = await exploreSource({ entry: claims[index] }, { ...config, browser, context, pages: claims[index].pages || options.pages })
      }
    }))
    return results
  } finally {
    await Promise.all(contexts.map(context => context.close().catch(() => {})))
    await browser.close().catch(() => {})
  }
}

/** Read an existing curation-evidence record without changing its review status. */
export function importCurationEvidence(value, { file = null, root = process.cwd() } = {}) {
  const record = typeof value === 'string' ? JSON.parse(fs.readFileSync(path.resolve(root, value), 'utf8')) : value
  if (!record || typeof record !== 'object') throw new Error('CURATION_EVIDENCE_OBJECT_REQUIRED')
  const roles = (record.pages || []).map(page => page.role).filter(Boolean)
  const screenshotRefs = (record.pages || []).map(page => ({ page, shot: page.shot })).filter(({ shot }) => shot).map(({ page, shot }) => {
    const source = typeof shot === 'string' ? shot : shot.src
    if (!source) throw new Error(`CURATION_SHOT_SOURCE_MISSING:${page.role || 'unknown'}`)
    const absolute = path.resolve(root, source)
    if (!absolute.startsWith(`${path.resolve(root)}${path.sep}`) || !fs.existsSync(absolute)) throw new Error(`CURATION_SHOT_MISSING:${source}`)
    const bytesData = fs.readFileSync(absolute)
    const digest = sha256(bytesData)
    if (typeof shot === 'object' && shot.sha256 && shot.sha256 !== digest) throw new Error(`CURATION_SHOT_HASH_MISMATCH:${source}`)
    return { role: page.role || null, src: source, sha256: digest,
      bytes: bytesData.length, width: typeof shot === 'object' ? shot.width : null, height: typeof shot === 'object' ? shot.height : null, mediaType: 'image/png', bytesData }
  })
  const pages = (record.pages || []).map((page) => {
    const shot = screenshotRefs.find(item => item.role === page.role)
    return shot ? { ...page, screenshot: { bytes: shot.bytesData, sha256: shot.sha256, bytesLength: shot.bytes, width: shot.width, height: shot.height, mediaType: shot.mediaType } } : page
  })
  return { adapterVersion: 'site-graph-curation-import-1', stage: 'explore', status: record.skipped ? 'blocked' : roles.includes('identity') && roles.includes('breadth') && roles.includes('proof') ? 'success' : 'partial',
    entryId: record.entryId, sourceFile: file, checkedAt: record.capturedAt || null, pages, deliverables: record.deliverables || null,
    scope: record.coverage || null, pending: record.skipped ? [{ reason: record.reason || 'curation-evidence-skipped' }] : ['identity', 'breadth', 'proof'].filter(role => !roles.includes(role)).map(role => ({ role, reason: 'missing-imported-role' })),
    evidence: screenshotRefs.map(shot => ({ evidenceId: `${record.entryId || 'entry'}--${shot.role}--${String(shot.sha256 || '').slice(0, 16)}`, role: shot.role,
      ref: shot.src, sha256: shot.sha256, bytes: shot.bytes, mediaType: shot.mediaType, sourceUrl: record.pages.find(page => page.role === shot.role)?.sourceUrl || null,
      capturedAt: record.capturedAt || null, method: 'imported-curation-evidence' })),
    screenshotRefs,
  }
}

export function stripBinary(value) {
  if (Buffer.isBuffer(value)) return undefined
  if (Array.isArray(value)) return value.map(stripBinary)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => {
    const clean = stripBinary(item)
    return clean === undefined ? [] : [[key, clean]]
  }))
}

export { sha256 }
