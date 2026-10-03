#!/usr/bin/env node
/**
 * Read-only social discovery adapter for X and Xiaohongshu.
 *
 * The adapter deliberately stops at a curation candidate inbox:
 *   social post -> raw observation -> link evidence -> identity resolution
 *   -> candidate (needs-review)
 *
 * It does not follow accounts, publish a site, or merge same-origin paths.
 * Every raw post, extracted link and command attempt is persisted in the run
 * bundle so a later curator can reproduce the decision.
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

// The public product branch is flattened and does not ship the research
// checkout's identity resolver. Keep the same strong identity semantics local
// to this read-only adapter so it remains runnable as a standalone CLI.
function normalizeIdentityUrl(input) {
  if (typeof input !== 'string' || !input.trim()) throw new TypeError('Identity URL must be a non-empty string.')
  const url = new URL(input.trim())
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new TypeError('Identity URL must use public HTTP(S) without credentials.')
  const hostname = url.hostname.toLowerCase().replace(/^www\./u, '').replace(/\.+$/u, '')
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.local') || /^(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/u.test(hostname)) throw new TypeError('Identity URL host is not publicly verifiable.')
  url.protocol = 'https:'
  url.hostname = hostname
  if (url.port === '443') url.port = ''
  url.hash = ''
  for (const key of [...url.searchParams.keys()]) if (/^(?:utm_|xsec_token|xsec_source|spm|from|ref|referrer|si|feature|igshid)/iu.test(key)) url.searchParams.delete(key)
  const query = [...url.searchParams.entries()].sort(([a, b]) => a.localeCompare(b))
  url.search = ''
  for (const [key, value] of query) url.searchParams.append(key, value)
  return url.toString().replace(/\/$/u, '')
}

const execFileAsync = promisify(execFile)
const HERE = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(HERE, '..')
export const DEFAULT_WATCHLIST = path.join(ROOT, 'data/social-discovery/watchlist.json')
export const DEFAULT_RUNTIME_ROOT = path.join(ROOT, 'data/social-discovery/runtime')
export const DEFAULT_CATALOGS = [
  path.join(ROOT, 'public/data/site-index.json'),
  path.join(ROOT, 'public/data/curation-review/site-catalog-index.json'),
]

const RUN_SCHEMA = 'vislexicon-social-discovery/1'
const MAX_LINKS_PER_POST = 80
const MAX_REDIRECTS = 5
const RESOLVE_TIMEOUT_MS = 8000
const SOCIAL_HOSTS = new Set([
  'x.com', 'twitter.com', 't.co', 'mobile.twitter.com',
  'xiaohongshu.com', 'www.xiaohongshu.com', 'rednote.com',
  'douyin.com', 'www.douyin.com', 'instagram.com', 'www.instagram.com',
  'facebook.com', 'www.facebook.com', 'youtube.com', 'youtu.be',
  'bilibili.com', 'www.bilibili.com', 't.me', 'linkedin.com',
])
const TRACKING_KEYS = /^(?:utm_[^=]+|xsec_token|xsec_source|channel_type|parent_page_channel_type|spm|from|ref|referrer|si|feature|igshid)$/iu
const PROMOTION_CUES = [
  /design\s+(?:tools?|resources?|websites?|inspiration|systems?)/iu,
  /ui\s+(?:tools?|resources?|kits?|components?)/iu,
  /(?:web|website|landing\s*page|interface)\s+design/iu,
  /(?:bookmark|curated|collection|directory|resources?|tools?\s+you)/iu,
  /(?:设计|网页|网站|界面|组件|素材|灵感|工具|资源|字体|图标|动效|模板|合集|收藏|推荐)/u,
]
const ACTION_CUES = [
  /(?:save|bookmark|discover|introducing|try|check\s+out|must\s+have)/iu,
  /(?:分享|推荐|盘点|整理|收藏|合集|试试|值得|安利|设计师)/u,
]

function sha(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex')
}

function nowIso() {
  return new Date().toISOString()
}

function slug(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .slice(0, 64) || 'source'
}

function parseArgs(argv) {
  const out = { _: [] }
  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      out._.push(arg)
      continue
    }
    const index = arg.indexOf('=')
    if (index < 0) out[arg.slice(2)] = true
    else out[arg.slice(2, index)] = arg.slice(index + 1)
  }
  return out
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8').replace(/^\uFEFF/u, ''))
}

function readRows(file) {
  const text = fs.readFileSync(path.resolve(file), 'utf8').replace(/^\uFEFF/u, '').trim()
  if (!text) return []
  if (file.toLowerCase().endsWith('.jsonl')) {
    return text.split(/\r?\n/u).filter(Boolean).map((line, index) => {
      try { return JSON.parse(line) } catch (error) { throw new Error(`INVALID_JSONL:${file}:line-${index + 1}:${error.message}`) }
    })
  }
  const value = JSON.parse(text)
  if (Array.isArray(value)) return value
  for (const key of ['observations', 'items', 'posts', 'data']) {
    if (Array.isArray(value?.[key])) return value[key]
  }
  return [value]
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function appendJsonl(file, rows) {
  if (!rows.length) return
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.appendFileSync(file, rows.map((row) => `${JSON.stringify(row)}\n`).join(''), 'utf8')
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function hostOf(value) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./u, '') } catch { return '' }
}

function isSocialUrl(value) {
  const host = hostOf(value)
  return SOCIAL_HOSTS.has(host) || [...SOCIAL_HOSTS].some((candidate) => host.endsWith(`.${candidate}`))
}

function redactSocialUrl(value) {
  if (!isHttpUrl(value)) return null
  try {
    const url = new URL(value)
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_KEYS.test(key)) url.searchParams.delete(key)
    }
    url.hash = ''
    // XHS search_result links are ephemeral wrappers. Preserve the note id as
    // a canonical, token-free observation URL when it is available.
    if (hostOf(url.href) === 'xiaohongshu.com' && /\/search_result\//u.test(url.pathname)) {
      const id = url.pathname.split('/').filter(Boolean).at(-1)
      if (id) return `https://www.xiaohongshu.com/explore/${id}`
    }
    return url.toString().replace(/\/$/u, '')
  } catch {
    return null
  }
}

function stripTrailingPunctuation(value) {
  return String(value)
    .replace(/[\u200b\uFEFF]/gu, '')
    .replace(/[.,;:!?\]})>"'，。；：！？）》」』】]+$/gu, '')
}

function collectUrlValues(value, pathName = 'unknown', out = []) {
  if (!value) return out
  if (typeof value === 'string') {
    for (const match of value.match(/https?:\/\/[^\s<>"'“”‘’]+/giu) || []) {
      out.push({ rawUrl: stripTrailingPunctuation(match), source: pathName })
    }
    return out
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectUrlValues(item, `${pathName}[${index}]`, out))
    return out
  }
  if (typeof value !== 'object') return out
  const preferred = [
    ['expanded_url', 'expanded_url'], ['expandedUrl', 'expandedUrl'],
    ['url', 'url'], ['href', 'href'], ['link', 'link'],
  ]
  for (const [key, label] of preferred) if (typeof value[key] === 'string') collectUrlValues(value[key], `${pathName}.${label}`, out)
  for (const [key, nested] of Object.entries(value)) {
    if (['url', 'href', 'link', 'expanded_url', 'expandedUrl'].includes(key)) continue
    if (['media_urls', 'mediaUrl', 'media', 'poster', 'media_posters'].includes(key)) continue
    if (['text', 'description', 'desc', 'content', 'title'].includes(key)) collectUrlValues(nested, `${pathName}.${key}`, out)
  }
  return out
}

function parseNativeId(value, platform) {
  if (value?.nativeId) return String(value.nativeId)
  if (value?.id) return String(value.id)
  const url = value?.url || value?.sourceUrl || value?.observedCanonicalHref || ''
  const x = /\/status\/(\d+)/u.exec(url)
  if (x) return x[1]
  const xhs = /\/(?:explore|search_result)\/([a-z\d]+)/iu.exec(url)
  if (xhs) return xhs[1]
  return `${platform || 'social'}-${sha(JSON.stringify(value)).slice(0, 16)}`
}

function textFromDetail(value, depth = 0) {
  if (!value || depth > 3) return ''
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) return value.map((item) => textFromDetail(item, depth + 1)).filter(Boolean).join('\n')
  if (typeof value !== 'object') return ''
  const preferred = ['text', 'content', 'desc', 'description', 'body', 'markdown', 'title']
  const direct = preferred.map((key) => textFromDetail(value[key], depth + 1)).filter(Boolean)
  if (direct.length) return direct.join('\n')
  return Object.values(value).slice(0, 12).map((item) => textFromDetail(item, depth + 1)).filter(Boolean).join('\n')
}

function inferPlatform(row, source = {}) {
  const value = String(source.platform || row.platform || row.source || '').toLowerCase()
  if (value.includes('xiaohong') || value === 'xhs' || value.includes('rednote')) return 'xiaohongshu'
  if (value === 'x' || value.includes('twitter')) return 'x'
  const url = row.url || row.sourceUrl || row.observedCanonicalHref || ''
  if (hostOf(url).includes('xiaohongshu')) return 'xiaohongshu'
  return 'x'
}

export function normalizePost(row, source = {}) {
  const sourceInfo = row?._socialSource || source
  const platform = inferPlatform(row, sourceInfo)
  const nativeId = parseNativeId(row, platform)
  const postUrl = redactSocialUrl(row.url || row.sourceUrl || row.observedCanonicalHref || '')
  const detailText = String(row.detailText || textFromDetail(row.noteDetail || row.detail)).trim()
  const text = [row.text, row.content, row.desc, row.description, detailText, row.title].filter(Boolean).join('\n').trim()
  const title = String(row.title ?? '').trim()
  const author = String(row.author ?? row.creator ?? row.user?.screen_name ?? row.user?.name ?? '').trim() || null
  const query = String(sourceInfo.query ?? row.query ?? '').trim() || null
  const urls = collectUrlValues({
    text, title, entities: row.entities, card: row.card, links: row.links,
    expandedUrls: row.expandedUrls, noteDetail: row.noteDetail, quoted_tweet: row.quoted_tweet, quotedTweet: row.quotedTweet,
  })
  const observedAt = String(row.checkedAt ?? row.observedAt ?? sourceInfo.checkedAt ?? nowIso())
  const rawRow = Object.fromEntries(Object.entries(row).filter(([key]) => key !== '_socialSource'))
  return {
    observationId: `${slug(sourceInfo.id || `${platform}-${query || 'feed'}`)}-${slug(nativeId)}`,
    observationKey: `${platform}:${nativeId}`,
    platform, nativeId, postUrl, author, title, text, query,
    publishedAt: row.created_at ?? row.createdAt ?? row.published_at ?? row.publishedAt ?? null,
    observedAt, sourceId: sourceInfo.id || `${platform}-manual-import`,
    sourceMethod: sourceInfo.method || 'external-read-only-export', raw: rawRow,
    extractedUrls: urls.slice(0, MAX_LINKS_PER_POST),
  }
}

export function promotionSignal(post) {
  const text = `${post.title || ''}\n${post.text || ''}`
  const designCues = PROMOTION_CUES.filter((cue) => cue.test(text)).length
  const actionCues = ACTION_CUES.filter((cue) => cue.test(text)).length
  const links = post.extractedUrls?.length || 0
  const score = Math.min(1, designCues * 0.14 + actionCues * 0.12 + (links >= 2 ? 0.28 : links === 1 ? 0.12 : 0))
  const reasons = []
  if (designCues) reasons.push(`${designCues}-design-cues`)
  if (actionCues) reasons.push(`${actionCues}-recommendation-cues`)
  if (links >= 2) reasons.push('multi-link-post')
  // A multi-link post alone is not a design lead: broad X searches also return
  // job, crypto and giveaway threads. Require a design cue before promotion can
  // create a site candidate; the raw post and link dispositions are still kept.
  return { score: Number(score.toFixed(3)), designCues, actionCues, linkCount: links, reasons, promotional: designCues > 0 && score >= 0.28 }
}

function normalizedSiteUrl(value) {
  try { return normalizeIdentityUrl(value) } catch { return null }
}

function flattenCatalogRows(value, file, rows = []) {
  if (!value || typeof value !== 'object') return rows
  const list = Array.isArray(value) ? value : value.items || value.entries || value.identityGroups
  if (!Array.isArray(list)) return rows
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue
    const urls = [entry.canonicalUrl, entry.homepage, entry.primaryUrl, ...(entry.normalizedUrls || []), ...(entry.urlAliases || []), ...(entry.aliases || [])]
    for (const rawUrl of urls) {
      const normalizedUrl = normalizedSiteUrl(rawUrl)
      if (normalizedUrl) rows.push({ normalizedUrl, file, id: entry.entryId || entry.entityId || entry.id || entry.identityGroupKey || null, name: entry.name || entry.canonicalName || null, status: entry.status || entry.reviewStatus || 'candidate' })
    }
    for (const observation of entry.observations || []) {
      for (const rawUrl of [observation.originalUrl, observation.resolvedUrl, observation.sourceUrl]) {
        const normalizedUrl = normalizedSiteUrl(rawUrl)
        if (normalizedUrl) rows.push({ normalizedUrl, file, id: entry.entryId || entry.entityId || entry.id || entry.identityGroupKey || null, name: entry.name || null, status: entry.status || entry.reviewStatus || 'candidate', observation: true })
      }
    }
  }
  return rows
}

export function buildIdentityIndex(catalogValues = []) {
  const rows = catalogValues.flatMap(({ value, file }) => flattenCatalogRows(value, file))
  const exact = new Map()
  const origins = new Map()
  for (const row of rows) {
    exact.set(row.normalizedUrl, exact.get(row.normalizedUrl) || row)
    let origin = null
    try { origin = new URL(row.normalizedUrl).origin } catch { /* invalid rows are ignored */ }
    if (origin) {
      const list = origins.get(origin) || []
      if (!list.some((item) => item.normalizedUrl === row.normalizedUrl)) list.push(row)
      origins.set(origin, list)
    }
  }
  return { exact, origins, rows }
}

function resolveIdentity(normalizedUrl, identityIndex) {
  const exact = identityIndex.exact.get(normalizedUrl)
  if (exact) return { disposition: 'known-alias', normalizedUrl, matches: [exact] }
  let origin = null
  try { origin = new URL(normalizedUrl).origin } catch { /* handled by caller */ }
  const sameOrigin = origin ? identityIndex.origins.get(origin) || [] : []
  if (sameOrigin.length) return { disposition: 'suspected-duplicate', normalizedUrl, matches: sameOrigin.slice(0, 3) }
  return { disposition: 'new-link', normalizedUrl, matches: [] }
}

function linkId(post, index, rawUrl) {
  return `${post.observationId}-link-${String(index + 1).padStart(3, '0')}-${sha(rawUrl).slice(0, 10)}`
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || RESOLVE_TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: 'manual', headers: { 'user-agent': 'VisLexiconSocialDiscovery/1.0 (+read-only curation)', ...(options.headers || {}) } })
  } finally {
    clearTimeout(timer)
  }
}

export async function resolvePublicUrl(inputUrl, { fetchImpl = fetchWithTimeout } = {}) {
  let current = inputUrl
  const chain = []
  for (let step = 0; step <= MAX_REDIRECTS; step += 1) {
    const normalized = normalizedSiteUrl(current)
    if (!normalized) return { ok: false, reason: 'unverifiable-url', chain }
    chain.push(normalized)
    const response = await fetchImpl(normalized, { method: 'HEAD', timeoutMs: RESOLVE_TIMEOUT_MS })
    const location = response.headers?.get?.('location')
    if (response.status >= 300 && response.status < 400 && location) {
      current = new URL(location, normalized).toString()
      continue
    }
    if ([403, 405, 429].includes(response.status)) {
      const fallback = await fetchImpl(normalized, { method: 'GET', headers: { range: 'bytes=0-0' }, timeoutMs: RESOLVE_TIMEOUT_MS })
      const fallbackLocation = fallback.headers?.get?.('location')
      if (fallback.status >= 300 && fallback.status < 400 && fallbackLocation) {
        current = new URL(fallbackLocation, normalized).toString()
        continue
      }
      return { ok: fallback.status >= 200 && fallback.status < 400, status: fallback.status, finalUrl: normalized, chain }
    }
    return { ok: response.status >= 200 && response.status < 400, status: response.status, finalUrl: normalized, chain }
  }
  return { ok: false, reason: 'redirect-limit', chain }
}

function safeResolvedUrl(value) {
  const redacted = redactSocialUrl(value)
  return redacted && !isSocialUrl(redacted) ? redacted : null
}

async function maybeResolve(rawUrl, expandedUrl, { resolve = false, resolver = resolvePublicUrl } = {}) {
  const expanded = safeResolvedUrl(expandedUrl)
  if (expanded) return { rawUrl, expandedUrl: expanded, resolution: 'provided' }
  const safeRaw = redactSocialUrl(rawUrl)
  if (!safeRaw || (isSocialUrl(safeRaw) && hostOf(safeRaw) !== 't.co') || (!resolve && isSocialUrl(safeRaw))) {
    return { rawUrl, expandedUrl: null, resolution: 'social-or-invalid' }
  }
  if (!resolve) return { rawUrl, expandedUrl: safeRaw, resolution: 'not-requested' }
  try {
    const result = await resolver(safeRaw)
    return { rawUrl, expandedUrl: safeResolvedUrl(result.finalUrl) || safeRaw, resolution: result.ok ? 'resolved' : 'failed', status: result.status || null, chain: result.chain || [] }
  } catch (error) {
    return { rawUrl, expandedUrl: safeRaw, resolution: 'failed', error: String(error.message || error) }
  }
}

async function mapLimit(values, limit, worker) {
  const output = new Array(values.length)
  let cursor = 0
  async function take() {
    for (;;) {
      const index = cursor
      cursor += 1
      if (index >= values.length) return
      output[index] = await worker(values[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, () => take()))
  return output
}

export async function buildDiscoveryRun({ rows, source = {}, catalogValues = [], runId = null, resolve = false, resolver = resolvePublicUrl }) {
  const posts = rows.map((row) => normalizePost(row, source))
  const identityIndex = buildIdentityIndex(catalogValues)
  const runKey = runId || `social-${new Date().toISOString().replace(/[-:.TZ]/gu, '').slice(0, 14)}-${sha(JSON.stringify(posts.map((post) => post.observationKey))).slice(0, 10)}`
  const seenPosts = new Map()
  const seenLinks = new Map()
  const postDispositions = []
  const linkDispositions = []
  const candidates = new Map()

  for (const post of posts) {
    const duplicateOf = seenPosts.get(post.observationKey) || null
    if (!duplicateOf) seenPosts.set(post.observationKey, post.observationId)
    const signal = promotionSignal(post)
    let candidateLinks = 0
    const resolvedLinks = await mapLimit(post.extractedUrls, 4, (link) => maybeResolve(link.rawUrl, link.expandedUrl || link.url || null, { resolve, resolver }))
    for (let index = 0; index < post.extractedUrls.length; index += 1) {
      const link = post.extractedUrls[index]
      const currentLinkId = linkId(post, index, link.rawUrl)
      const resolved = resolvedLinks[index]
      const safeTarget = resolved.expandedUrl
      let disposition = 'unverifiable'
      let normalizedUrl = null
      let matches = []
      let reason = null
      if (duplicateOf) {
        disposition = 'duplicate-observation'
        reason = `same-native-id-as:${duplicateOf}`
      } else if (!safeTarget) {
        disposition = 'unverifiable'
        reason = resolved.resolution === 'social-or-invalid' ? 'social-or-invalid-link' : 'short-link-not-expanded'
      } else if (isSocialUrl(safeTarget)) {
        disposition = 'not-a-design-link'
        reason = 'social-platform-link'
      } else {
        normalizedUrl = normalizedSiteUrl(safeTarget)
        if (!normalizedUrl) {
          disposition = 'unverifiable'
          reason = 'identity-url-rejected'
        } else {
          const priorLink = seenLinks.get(normalizedUrl)
          if (priorLink) {
            disposition = 'duplicate-link'
            reason = `same-normalized-url-as:${priorLink}`
          } else {
            const identity = resolveIdentity(normalizedUrl, identityIndex)
            matches = identity.matches
            disposition = identity.disposition
            if (disposition === 'new-link' && signal.promotional) {
              disposition = 'new-candidate'
              candidateLinks += 1
            } else if (disposition === 'new-link') {
              disposition = 'mentioned-link'
              reason = 'post-has-no-promotion-signal'
            }
            seenLinks.set(normalizedUrl, currentLinkId)
          }
        }
      }
      linkDispositions.push({
        runId: runKey, linkId: currentLinkId, observationId: post.observationId, observationKey: post.observationKey,
        platform: post.platform, author: post.author, postUrl: post.postUrl, rawUrl: link.rawUrl,
        expandedUrl: safeTarget, normalizedUrl, resolution: resolved.resolution, status: resolved.status || null,
        disposition, reason, matches: matches.map((item) => ({ id: item.id, name: item.name, normalizedUrl: item.normalizedUrl, status: item.status })),
      })
      if (['new-candidate', 'duplicate-link'].includes(disposition) && normalizedUrl) {
        const candidate = candidates.get(normalizedUrl) || {
          candidateId: `social-site-${sha(normalizedUrl).slice(0, 16)}`,
          canonicalUrl: normalizedUrl, status: 'candidate', publish: false,
          classification: { recordLevel: 'entry', primaryCategory: null, subcategory: null, status: 'needs-review', alternatives: [], reasons: [] },
          sourceEvidence: [], signal: { score: 0, reasons: [] },
        }
        candidate.sourceEvidence.push({
          observationId: post.observationId, linkId: currentLinkId, platform: post.platform, nativeId: post.nativeId,
          author: post.author, postUrl: post.postUrl, title: post.title || null, query: post.query,
          rawUrl: link.rawUrl, expandedUrl: safeTarget, normalizedUrl,
        })
        candidate.signal.score = Math.max(candidate.signal.score, signal.score)
        candidate.signal.reasons = [...new Set([...candidate.signal.reasons, ...signal.reasons])]
        candidates.set(normalizedUrl, candidate)
      }
    }
    const postDisposition = duplicateOf
      ? 'duplicate-observation'
      : candidateLinks > 0
        ? 'promotional-links-found'
        : post.extractedUrls.length > 0
          ? 'links-held-for-review'
          : 'no-links'
    postDispositions.push({
      runId: runKey, observationId: post.observationId, observationKey: post.observationKey,
      platform: post.platform, nativeId: post.nativeId, author: post.author, postUrl: post.postUrl,
      query: post.query, disposition: postDisposition, duplicateOf, promotion: signal,
    })
  }

  for (const candidate of candidates.values()) {
    candidate.sourceEvidence.sort((a, b) => `${a.platform}:${a.nativeId}:${a.linkId}`.localeCompare(`${b.platform}:${b.nativeId}:${b.linkId}`))
    candidate.classification.reasons = [{
      statement: 'Candidate came from a read-only social post that contains a design-resource link; identity, breadth, proof screenshots and human description are still required.',
      evidenceUrl: candidate.sourceEvidence[0]?.expandedUrl || candidate.canonicalUrl,
    }]
  }
  const run = {
    schema: RUN_SCHEMA, runId: runKey, collectedAt: nowIso(), source: { ...source, method: source.method || 'read-only social export' },
    rawObservations: posts, postDispositions, linkDispositions, candidates: [...candidates.values()],
    summary: {
      rawHitCount: posts.length, postDispositionCount: postDispositions.length, linkObservationCount: linkDispositions.length,
      candidateCount: candidates.size, requestAttempts: source.requestAttempts || [],
      counts: Object.fromEntries([...new Set(postDispositions.map((row) => row.disposition))].map((key) => [key, postDispositions.filter((row) => row.disposition === key).length])),
    },
  }
  run.digest = `sha256:${sha(JSON.stringify({ ...run, digest: undefined }))}`
  return run
}

export function verifyRun(run) {
  const errors = []
  if (run?.schema !== RUN_SCHEMA) errors.push('schema-mismatch')
  const posts = Array.isArray(run?.rawObservations) ? run.rawObservations : []
  const postDispositions = Array.isArray(run?.postDispositions) ? run.postDispositions : []
  const links = Array.isArray(run?.linkDispositions) ? run.linkDispositions : []
  if (posts.length !== run?.summary?.rawHitCount) errors.push('raw-hit-count-mismatch')
  if (postDispositions.length !== posts.length) errors.push('post-disposition-count-mismatch')
  if (links.length !== run?.summary?.linkObservationCount) errors.push('link-observation-count-mismatch')
  const postCounts = new Map()
  const dispositionCounts = new Map()
  for (const post of posts) postCounts.set(post.observationId, (postCounts.get(post.observationId) || 0) + 1)
  for (const disposition of postDispositions) dispositionCounts.set(disposition.observationId, (dispositionCounts.get(disposition.observationId) || 0) + 1)
  for (const [id, count] of postCounts) if (dispositionCounts.get(id) !== count) errors.push(`post-disposition-conservation:${id}`)
  const postIds = new Set(posts.map((post) => post.observationId))
  for (const link of links) if (!postIds.has(link.observationId)) errors.push(`link-without-post:${link.linkId}`)
  for (const candidate of run?.candidates || []) {
    if (!candidate.canonicalUrl || !candidate.candidateId || candidate.publish !== false) errors.push(`candidate-gate:${candidate.candidateId || 'missing'}`)
  }
  const attempts = run?.summary?.requestAttempts || []
  if (attempts.length && attempts.some((attempt) => !['succeeded', 'failed', 'parse-failed'].includes(attempt.status))) errors.push('request-attempt-without-terminal-status')
  return { ok: errors.length === 0, errors }
}

function candidateIndexValues(catalogFiles) {
  const values = []
  for (const file of catalogFiles) {
    if (!file || !fs.existsSync(file)) continue
    try { values.push({ file, value: readJson(file) }) } catch { /* catalog is an optional advisory index */ }
  }
  return values
}

function openCliCommand(platform, source) {
  const query = source.query || ''
  if (platform === 'x') {
    if (source.mode === 'user-posts') return ['twitter', 'tweets', String(source.handle || '').replace(/^@/u, ''), '--limit', String(source.limit || 30), '-f', 'json']
    return ['twitter', 'search', query, '--limit', String(source.limit || 30), '--product', 'live', '-f', 'json']
  }
  if (source.mode === 'user') return ['xiaohongshu', 'user', String(source.userId || source.handle || ''), '-f', 'json']
  return ['xiaohongshu', 'search', query, '-f', 'json']
}

function openCliDetailCommand(platform, row) {
  if (platform !== 'xiaohongshu') return null
  const url = row.url || row.sourceUrl || row.observedCanonicalHref || row.raw?.url || ''
  return url ? ['xiaohongshu', 'note', url, '-f', 'json'] : null
}

async function runOpenCli(args) {
  const commands = process.platform === 'win32' ? ['opencli.cmd', 'opencli'] : ['opencli']
  let lastError = null
  for (const command of commands) {
    try {
      // Windows exposes OpenCLI as a .cmd shim; Node needs a shell to execute
      // that shim. The arguments originate in the local watchlist, never from
      // an untrusted social post.
      const shellArgs = process.platform === 'win32'
        ? args.map((value) => `"${String(value).replace(/(["^&|<>])/gu, '^$1')}"`)
        : args
      const result = await execFileAsync(command, shellArgs, { windowsHide: true, shell: process.platform === 'win32', maxBuffer: 16 * 1024 * 1024 })
      return { command, args, status: 'succeeded', stdout: result.stdout, stderr: result.stderr }
    } catch (error) {
      lastError = error
      if (error.code !== 'ENOENT') return { command, args, status: 'failed', stdout: error.stdout || '', stderr: error.stderr || error.message, exitCode: error.code || null }
    }
  }
  return { command: commands.at(-1), args, status: 'failed', stdout: '', stderr: String(lastError?.message || 'opencli-not-found'), exitCode: null }
}

function parseCliJson(text) {
  const source = String(text || '').trim()
  if (!source) throw new Error('EMPTY_OPENCLI_OUTPUT')
  const starts = [source.indexOf('['), source.indexOf('{')].filter((index) => index >= 0).sort((a, b) => a - b)
  for (const start of starts) {
    for (let end = source.length; end > start; end -= 1) {
      const tail = source.slice(start, end).trim()
      if (!/[\]}]$/u.test(tail)) continue
      try { return JSON.parse(tail) } catch { /* stdout may have a warning after JSON */ }
    }
  }
  throw new Error('OPENCLI_JSON_PARSE_FAILED')
}

async function collectSources({ watchlistFile = DEFAULT_WATCHLIST, sourceId = null, includeDetails = false }) {
  const watchlist = readJson(watchlistFile)
  const sources = (watchlist.sources || []).filter((source) => source.enabled !== false && (!sourceId || source.id === sourceId))
  if (!sources.length) throw new Error(sourceId ? `WATCH_SOURCE_NOT_FOUND:${sourceId}` : 'WATCHLIST_HAS_NO_ENABLED_SOURCES')
  const rows = []
  const attempts = []
  for (const source of sources) {
    const args = openCliCommand(source.platform, source)
    const startedAt = nowIso()
    const result = await runOpenCli(args)
    const attempt = { attemptId: `${source.id}-${sha(startedAt).slice(0, 12)}`, sourceId: source.id, platform: source.platform, command: 'opencli', args, startedAt, endedAt: nowIso(), status: result.status, exitCode: result.exitCode || 0 }
    if (result.status === 'succeeded') {
      try {
        const payload = parseCliJson(result.stdout)
        const incoming = Array.isArray(payload) ? payload : payload.items || payload.observations || []
        const enriched = []
        for (const row of incoming) {
          let next = { ...row }
          if (source.platform === 'xiaohongshu' && (source.detail === true || includeDetails) && enriched.length < Number(source.detailLimit || 20)) {
            const detailArgs = openCliDetailCommand(source.platform, row)
            if (detailArgs) {
              const detailStartedAt = nowIso()
              const detailResult = await runOpenCli(detailArgs)
              const detailAttempt = {
                attemptId: `${source.id}-detail-${sha(`${detailStartedAt}:${row.id || row.nativeId || row.url}`).slice(0, 12)}`,
                sourceId: source.id, platform: source.platform, detailOf: row.id || row.nativeId || row.url || null,
                command: 'opencli', args: detailArgs, startedAt: detailStartedAt, endedAt: nowIso(),
                status: detailResult.status, exitCode: detailResult.exitCode || 0,
              }
              if (detailResult.status === 'succeeded') {
                try {
                  const detail = parseCliJson(detailResult.stdout)
                  const detailText = textFromDetail(detail)
                  next = { ...next, noteDetail: detail, detailText }
                  detailAttempt.rawHitCount = 1
                } catch (error) {
                  detailAttempt.status = 'parse-failed'
                  detailAttempt.error = error.message
                }
              } else {
                detailAttempt.error = String(detailResult.stderr || 'opencli-detail-failed').slice(0, 2000)
              }
              attempts.push({ ...detailAttempt, source })
            }
          }
          enriched.push({ ...next, _socialSource: { ...source, method: 'opencli read-only' } })
        }
        rows.push(...enriched)
        attempt.rawHitCount = incoming.length
      } catch (error) {
        attempt.status = 'parse-failed'
        attempt.error = error.message
        attempt.stderr = String(result.stderr || '').slice(0, 2000)
      }
    } else {
      attempt.error = String(result.stderr || 'opencli-failed').slice(0, 2000)
    }
    attempts.push({ ...attempt, source })
  }
  return { rows, attempts, sources }
}

function runDirectory(runtimeRoot, runId) {
  return path.join(runtimeRoot, slug(runId))
}

export function persistRun(run, { runtimeRoot = DEFAULT_RUNTIME_ROOT } = {}) {
  const dir = runDirectory(runtimeRoot, run.runId)
  fs.mkdirSync(dir, { recursive: true })
  appendJsonl(path.join(dir, 'raw-observations.jsonl'), run.rawObservations)
  appendJsonl(path.join(dir, 'post-dispositions.jsonl'), run.postDispositions)
  appendJsonl(path.join(dir, 'link-dispositions.jsonl'), run.linkDispositions)
  writeJson(path.join(dir, 'candidates.json'), { schema: 'vislexicon-social-candidate-inbox/1', runId: run.runId, publish: false, candidates: run.candidates })
  writeJson(path.join(dir, 'summary.json'), run.summary)
  writeJson(path.join(dir, 'run.json'), run)
  appendJsonl(path.join(runtimeRoot, 'runs.jsonl'), [{ runId: run.runId, schema: run.schema, collectedAt: run.collectedAt, digest: run.digest, summary: run.summary }])
  return dir
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const command = args._[0] || 'help'
  if (command === 'watchlist') {
    console.log(JSON.stringify(readJson(args.watchlist || DEFAULT_WATCHLIST), null, 2))
    return
  }
  if (command === 'verify') {
    const file = path.resolve(args.run || path.join(DEFAULT_RUNTIME_ROOT, String(args.id || ''), 'run.json'))
    const result = verifyRun(readJson(file))
    console.log(JSON.stringify(result, null, 2))
    if (!result.ok) process.exitCode = 1
    return
  }
  if (!['collect', 'ingest'].includes(command)) {
    console.log('Usage: social-discovery.mjs collect|ingest|watchlist|verify [--input=file] [--source=id] [--resolve] [--run-id=id]')
    return
  }
  const catalogFiles = String(args.catalogs || DEFAULT_CATALOGS.join('|')).split('|').filter(Boolean).map((file) => path.resolve(file))
  const catalogValues = candidateIndexValues(catalogFiles)
  let rows
  let source = {}
  let requestAttempts = []
  if (command === 'collect') {
    const collected = await collectSources({ watchlistFile: args.watchlist || DEFAULT_WATCHLIST, sourceId: args.source || null, includeDetails: Boolean(args.details) })
    rows = collected.rows
    requestAttempts = collected.attempts
    source = { id: collected.sources.length === 1 ? collected.sources[0].id : 'social-watchlist', platform: collected.sources.length === 1 ? collected.sources[0].platform : 'mixed', method: 'opencli read-only', requestAttempts }
  } else {
    if (!args.input) throw new Error('--input is required for ingest')
    rows = readRows(args.input)
    source = { id: args.source || 'social-import', platform: args.platform || null, query: args.query || null, method: 'imported read-only export' }
  }
  const run = await buildDiscoveryRun({ rows, source, catalogValues, runId: args['run-id'] || null, resolve: Boolean(args.resolve) })
  run.summary.requestAttempts = requestAttempts
  run.summary.requestAttemptCount = requestAttempts.length
  run.summary.requestFailures = requestAttempts.filter((attempt) => attempt.status !== 'succeeded').length
  run.digest = `sha256:${sha(JSON.stringify({ ...run, digest: undefined }))}`
  const directory = persistRun(run, { runtimeRoot: args.runtime || DEFAULT_RUNTIME_ROOT })
  const check = verifyRun(run)
  console.log(JSON.stringify({ runId: run.runId, directory, summary: run.summary, verification: check }, null, 2))
  if (!check.ok) process.exitCode = 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(JSON.stringify({ error: error.message }, null, 2))
    process.exitCode = 1
  })
}

