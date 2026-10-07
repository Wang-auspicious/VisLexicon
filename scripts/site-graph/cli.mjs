#!/usr/bin/env node
/*
 * SiteEntry graph CLI.  This file is intentionally a thin adapter: all state,
 * leases, revisions and publication decisions live behind SiteGraph.  A CLI
 * invocation may capture evidence, but it never writes public/ by itself.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import {
  exploreBatch,
  importCurationEvidence,
  probeSource,
  stripBinary,
} from './adapters.mjs'
import { curationIssues, evidenceStageOutcome } from './gates.mjs'

function parseArgs(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) { out._.push(arg); continue }
    const equal = arg.indexOf('=')
    if (equal >= 0) out[arg.slice(2, equal)] = arg.slice(equal + 1)
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[arg.slice(2)] = argv[++i]
    else out[arg.slice(2)] = true
  }
  return out
}

function jsonFile(file) {
  const text = fs.readFileSync(path.resolve(file), 'utf8').replace(/^\uFEFF/u, '').trim()
  if (!text) return null
  if (file.toLowerCase().endsWith('.jsonl')) return text.split(/\r?\n/u).filter(Boolean).map(line => JSON.parse(line))
  return JSON.parse(text)
}

function inputRows(file) {
  const value = jsonFile(file)
  if (value == null) return []
  if (Array.isArray(value)) return value
  if (Array.isArray(value.rows)) return value.rows
  if (Array.isArray(value.candidates)) return value.candidates
  return [value]
}

function numberOption(args, name, fallback) {
  const value = args[name]
  if (value == null || value === true || value === '') return fallback
  const number = Number(value)
  if (!Number.isFinite(number)) throw new Error(`INVALID_${name.toUpperCase()}`)
  return number
}

async function loadGraph(args) {
  // Keep the adapter compatible with either the public SiteGraph facade or a
  // factory exported by the implementation while its internal split settles.
  const candidates = ['./core.mjs', './store.mjs']
  let lastError = null
  for (const relative of candidates) {
    try {
      const module = await import(new URL(relative, import.meta.url))
      const Constructor = module.SiteGraph || module.default?.SiteGraph
      if (typeof Constructor === 'function') return new Constructor({ root: args.root ? path.resolve(args.root) : undefined, clock: module.clock })
      if (typeof module.createSiteGraph === 'function') return module.createSiteGraph({ root: args.root ? path.resolve(args.root) : undefined })
    } catch (error) { lastError = error }
  }
  throw new Error(`SITE_GRAPH_IMPLEMENTATION_MISSING: ${lastError?.message || 'core.mjs/store.mjs'}`)
}

function sourceArg(args) {
  if (args.sourceFile || args['source-file']) return jsonFile(args.sourceFile || args['source-file'])
  if (args.source && String(args.source).trim().startsWith('{')) return JSON.parse(args.source)
  if (args.source) return { sourceUrl: String(args.source) }
  return null
}

function pageManifestFor(args) {
  if (!args.pages || typeof args.pages !== 'string' || !fs.existsSync(path.resolve(args.pages))) return null
  const value = jsonFile(args.pages)
  if (Array.isArray(value)) return new Map(value.filter(row => row?.entryId).map(row => [row.entryId, row.pages || row]))
  if (value?.entries && Array.isArray(value.entries)) return new Map(value.entries.filter(row => row?.entryId).map(row => [row.entryId, row.pages || row]))
  return new Map(Object.entries(value || {}))
}

function claimArgs(args, stage) {
  return {
    worker: String(args.worker || `site-graph-${stage}-${process.pid}`),
    stage,
    limit: numberOption(args, 'limit', 1),
    leaseMs: numberOption(args, 'lease-ms', 300_000),
    entryIds: args['entry-ids'] ? String(args['entry-ids']).split(',').map(id => id.trim()).filter(Boolean)
      : args.entry ? [String(args.entry)] : null,
  }
}

async function putBlob(graph, bytes, metadata) {
  if (!bytes || !bytes.length || typeof graph.putBlob !== 'function') return null
  return graph.putBlob(bytes, metadata)
}

async function settle(graph, claim, result, { error = null, retryable = false, status = null } = {}) {
  // The facade intentionally has one completion seam.  Do not mutate a job
  // object directly when an adapter fails; settle records the failed attempt.
  const payload = { token: claim.token, result, error, retryable, ...(status ? { status } : {}) }
  return graph.settle(payload)
}

async function persistProbe(graph, claim, result) {
  const { bodyBytes, ...withoutBytes } = result
  if (bodyBytes?.length) {
    const blob = await putBlob(graph, bodyBytes, {
      mediaType: result.body?.mediaType || 'application/octet-stream',
      sourceUrl: result.finalUrl || result.inputUrl,
      role: 'probe-body',
    })
    withoutBytes.body = { ...(result.body || {}), blob }
  }
  return stripBinary(withoutBytes)
}

async function persistExplore(graph, result) {
  const pages = []
  const evidence = []
  for (const page of result.pages || []) {
    const next = { ...page }
    if (page.screenshot?.bytes?.length) {
      const blob = await putBlob(graph, page.screenshot.bytes, {
        mediaType: page.screenshot.mediaType || 'image/png',
        sourceUrl: page.sourceUrl || page.inputUrl,
        role: `explore-${page.role}`,
      })
      next.screenshot = { ...page.screenshot, bytes: undefined, blob }
      delete next.screenshot.bytes
      evidence.push({ evidenceId: `${result.entryId || 'entry'}--${page.role}--${page.screenshot.sha256.slice(0, 16)}`,
        role: page.role, ref: blob?.ref, sha256: blob?.sha256 || page.screenshot.sha256,
        bytes: page.screenshot.bytesLength, mediaType: page.screenshot.mediaType || 'image/png',
        sourceUrl: page.sourceUrl || page.inputUrl, finalUrl: page.sourceUrl || page.inputUrl, capturedAt: result.checkedAt || null, method: 'browser-screenshot' })
    }
    pages.push(next)
  }
  return stripBinary({ ...result, pages, evidence, screenshots: pages.map(page => ({ role: page.role, ...(page.screenshot || {}) })) })
}

async function runProbeClaims(graph, claims, args) {
  const concurrency = Math.max(1, Math.min(numberOption(args, 'concurrency', 4), claims.length || 1))
  const out = new Array(claims.length)
  let cursor = 0
  await Promise.all(Array.from({ length: concurrency }, async () => {
    for (;;) {
      const index = cursor++
      if (index >= claims.length) return
      const claim = claims[index]
      try {
        const result = await probeSource({ url: claim.url, rawUrl: claim.url, entryId: claim.entryId }, {
          timeoutMs: numberOption(args, 'timeout-ms', undefined),
          maxBytes: numberOption(args, 'max-bytes', undefined),
        })
        const persisted = await persistProbe(graph, claim, result)
        out[index] = await settle(graph, claim, persisted, evidenceStageOutcome('probe', persisted))
      } catch (error) {
        out[index] = await settle(graph, claim, null, { error: String(error?.message || error), retryable: true })
      }
    }
  }))
  return out
}

async function runExploreClaims(graph, claims, args) {
  if (!claims.length) return []
  const manifest = pageManifestFor(args)
  const preparedClaims = claims.map(claim => ({ ...claim, pages: claim.pages || manifest?.get(claim.entryId) || null }))
  const raw = await exploreBatch(preparedClaims, {
    contexts: numberOption(args, 'concurrency', 2),
    width: numberOption(args, 'width', undefined),
    height: numberOption(args, 'height', undefined),
    dpr: numberOption(args, 'dpr', undefined),
    settleMs: numberOption(args, 'settle-ms', undefined),
    executablePath: args.executable,
  })
  const results = []
  for (let index = 0; index < preparedClaims.length; index += 1) {
    const claim = preparedClaims[index]
    try {
      const persisted = await persistExplore(graph, raw[index])
      results.push(await settle(graph, claim, persisted, evidenceStageOutcome('explore', persisted)))
    } catch (error) {
      results.push(await settle(graph, claim, null, { error: String(error?.message || error), retryable: true }))
    }
  }
  return results
}

async function runValidateClaims(graph, claims) {
  const results = []
  for (const claim of claims) {
    try {
      // A graph implementation may expose a richer validator.  The adapter
      // still has a deterministic fallback so a missing optional method never
      // turns a held entry into a successful validation by accident.
      let result = typeof graph.validate === 'function'
        ? await graph.validate({ token: claim.token, entryId: claim.entryId, revision: claim.revision })
        : validateClaim(claim)
      result = { stage: 'validate', ...result }
      const issues = Array.isArray(result.issues) ? result.issues : []
      result.passed = result.passed === true || (result.gate === 'passed' && issues.length === 0)
      results.push(await settle(graph, claim, result, { error: issues.length ? 'VALIDATION_HELD' : null, retryable: false }))
    } catch (error) {
      results.push(await settle(graph, claim, null, { error: String(error?.message || error), retryable: false }))
    }
  }
  return results
}

/** Structural gate only.  It cannot approve editorial copy or classification. */
export function validateClaim(claim) {
  const inputs = claim?.inputs || {}
  const issues = []
  const probe = inputs.probe?.result || inputs.probe
  const explore = inputs.explore?.result || inputs.explore
  const curate = inputs.curate?.result || inputs.curate
  if (!probe?.sourceSnapshot?.requestedUrl || !probe.sourceSnapshot.finalUrl) issues.push('probe-source-snapshot-missing')
  if (probe?.failures?.some?.(failure => !failure.retryable)) issues.push('probe-terminal-failure')
  const evidence = explore?.evidence || []
  const roles = new Set(evidence.map(item => item.role).filter(Boolean))
  for (const role of ['identity', 'breadth', 'proof']) if (!roles.has(role)) issues.push(`explore-${role}-evidence-missing`)
  if (new Set(evidence.map(item => item.sha256).filter(Boolean)).size < 3) issues.push('explore-distinct-evidence-missing')
  issues.push(...curationIssues(curate))
  return { gate: issues.length ? 'held' : 'passed', issues, evidenceIds: evidence.map(item => item.evidenceId).filter(Boolean) }
}

export async function runStage(graph, args) {
  const stage = String(args.stage || '')
  if (!['probe', 'explore', 'validate'].includes(stage)) throw new Error('STAGE_MUST_BE_probe_explore_VALIDATE')
  const claims = await graph.claim(claimArgs(args, stage))
  if (!Array.isArray(claims)) throw new Error('GRAPH_CLAIM_MUST_RETURN_ARRAY')
  if (args.dry) return { stage, claimed: claims.length, dry: true, entries: claims.map(claim => claim.entryId) }
  const settled = stage === 'probe' ? await runProbeClaims(graph, claims, args)
    : stage === 'explore' ? await runExploreClaims(graph, claims, args)
      : await runValidateClaims(graph, claims)
  return { stage, claimed: claims.length, settled: settled.length, results: settled }
}

async function command(args) {
  const verb = args._[0]
  const graph = await loadGraph(args)
  try {
    if (verb === 'ingest') {
      const file = args.file
      if (!file) throw new Error('INGEST_FILE_REQUIRED')
      const rows = inputRows(file)
      const source = sourceArg(args)
      const result = await graph.ingest({ batchId: String(args.batch || path.basename(file)), source, sourceId: args.sourceId || args['source-id'] || source?.sourceId || 'cli', rows })
      return { command: verb, count: result.length, observations: result }
    }
    if (verb === 'status') return { command: verb, ...(await graph.status()) }
    if (verb === 'explain') return await graph.explain(String(args.entry || args.id || args._[1] || ''))
    if (verb === 'run') return await runStage(graph, args)
    if (verb === 'claim') return { claims: await graph.claim(claimArgs(args, String(args.stage || 'curate'))) }
    if (verb === 'settle') {
      const value = jsonFile(args.file)
      if (!value) throw new Error('SETTLE_FILE_REQUIRED')
      const token = args.token || value.token
      if (!token) throw new Error('SETTLE_TOKEN_REQUIRED')
      const result = value.result || (value.stage === 'browser-evidence' ? importCurationEvidence(value, { file: args.file, root: args.root || process.cwd() }) : value)
      return await graph.settle({ token, result, error: value.error || null, retryable: Boolean(value.retryable) })
    }
    if (verb === 'import-evidence') {
      const value = jsonFile(args.file)
      if (!value) throw new Error('EVIDENCE_FILE_REQUIRED')
      const token = args.token || value.token
      if (!token) throw new Error('EVIDENCE_TOKEN_REQUIRED')
      const result = importCurationEvidence(value, { file: args.file, root: args.root || process.cwd() })
      return await graph.settle({ token, result, ...evidenceStageOutcome('explore', result) })
    }
    if (verb === 'packet') return await graph.packet(String(args.entry || args.id || args._[1] || ''))
    if (verb === 'review') {
      const review = jsonFile(args.file)
      if (!review) throw new Error('REVIEW_FILE_REQUIRED')
      return await graph.review({ entryId: args.entry || review.entryId, reviewer: review.reviewer || args.reviewer,
        decision: review.decision, packetDigest: review.packetDigest, checks: review.checks, notes: review.notes,
        report: review.report || (args.report ? jsonFile(args.report) : undefined) })
    }
    if (verb === 'export') return await graph.export(path.resolve(args.dir || args._[1] || 'site-graph-export'))
    if (verb === 'verify') return await graph.verify()
    throw new Error('Usage: site-graph cli ingest|status|explain|run|claim|settle|packet|review|export|verify')
  } finally {
    await graph.close?.()
  }
}

export { parseArgs, inputRows, persistProbe, persistExplore }

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  command(parseArgs(process.argv.slice(2))).then(result => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)).catch(error => {
    process.stderr.write(`${JSON.stringify({ error: String(error?.message || error) })}\n`)
    process.exitCode = 1
  })
}
