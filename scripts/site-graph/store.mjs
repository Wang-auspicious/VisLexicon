import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { curationIssues, evidenceStageOutcome, reviewedClassification, sourceEntityIssues } from './gates.mjs'

export const GRAPH_SCHEMA = 'vislexicon/site-entry-graph/1'
export const STAGES = Object.freeze(['probe', 'explore', 'curate', 'validate', 'review'])
export const STAGE_DEPENDENCIES = Object.freeze({
  probe: [],
  explore: ['probe'],
  curate: ['explore'],
  validate: ['curate'],
  review: ['validate'],
})
export const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data/discovery/site-graph')

const DEFAULT_POLICY = Object.freeze({
  maxAttempts: 3,
  leaseMs: 300000,
  requiredEvidenceRoles: ['identity', 'breadth', 'proof'],
  minimumProofShots: 1,
  requireChineseDescription: true,
  requireIndependentReview: true,
  requireReviewReport: true,
  minimumReviewChecks: 3,
})

function nowIso() { return new Date().toISOString() }

export function stable(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`
}

export function sha256(value) {
  return crypto.createHash('sha256').update(Buffer.isBuffer(value) || typeof value === 'string' ? value : stable(value)).digest('hex')
}

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)) }
function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label}-required`)
  return value.trim()
}

function atomicWrite(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const temporary = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`
  fs.writeFileSync(temporary, value, 'utf8')
  fs.renameSync(temporary, file)
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/u, '')) } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

function withFileLock(lockFile, fn, staleMs = 900000) {
  fs.mkdirSync(path.dirname(lockFile), { recursive: true })
  try {
    const stat = fs.statSync(lockFile)
    if (Date.now() - stat.mtimeMs > staleMs) fs.rmSync(lockFile, { force: true })
  } catch { /* no lock */ }
  let handle
  try { handle = fs.openSync(lockFile, 'wx') } catch { throw new Error('SITE_GRAPH_LOCKED') }
  try { return fn() } finally {
    fs.closeSync(handle)
    fs.rmSync(lockFile, { force: true })
  }
}

function normalizeUrl(value) {
  const url = new URL(String(value || '').trim())
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('SOURCE_URL_MUST_BE_PUBLIC_HTTP')
  url.hostname = url.hostname.toLowerCase()
  for (const key of [...url.searchParams.keys()]) if (/^(?:utm_|ref|referrer|spm|xsec_|session|token)/iu.test(key)) url.searchParams.delete(key)
  url.search = [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&')
  const valueWithQuery = url.toString()
  return valueWithQuery.replace(/(?<!:)\/$/u, '')
}

function originOf(url) { try { return new URL(url).origin } catch { return '' } }

function emptyState({ runId, policy }) {
  const at = nowIso()
  return {
    schema: GRAPH_SCHEMA,
    version: 1,
    runId,
    policy: { ...DEFAULT_POLICY, ...(policy || {}) },
    createdAt: at,
    updatedAt: at,
    revision: 0,
    eventSeq: 0,
    eventHead: null,
    entries: {},
    entities: {},
    observations: {},
    batches: {},
    dispositions: {},
    jobs: {},
    evidence: {},
    reviews: {},
    decisions: {},
    aliases: {},
    lateSettlements: [],
    reviewHistory: [],
    rawTotal: 0,
    rawSettled: 0,
  }
}

function eventHash(event) {
  const { eventHash: _ignored, ...withoutHash } = event
  return sha256(withoutHash)
}

function entryStage(entry, stage) { return entry.stages?.[stage] || { status: 'pending', attempts: [] } }

function stageInputDigest(entry, stage) {
  const dependencies = (STAGE_DEPENDENCIES[stage] || []).map((dependency) => ({ stage: dependency, result: entry.stages?.[dependency]?.resultDigest || null }))
  return sha256({ entryId: entry.entryId, revision: entry.revision, stage, sourceUrl: entry.sourceUrl, dependencies })
}

function stageReady(state, entry, stage) {
  return (STAGE_DEPENDENCIES[stage] || []).every((dependency) => entryStage(entry, dependency).status === 'succeeded')
}

function isSha256(value) { return typeof value === 'string' && /^[a-f\d]{64}$/iu.test(value) }

function currentPacket(state, entry) {
  const evidence = Object.values(state.evidence).filter((item) => item.entryId === entry.entryId)
    .map(({ evidenceId, role, sourceUrl, finalUrl, sha256: digest, bytes, mediaType, publicSafe, ref, locator, method, capturedAt }) => ({ evidenceId, role, sourceUrl, finalUrl, sha256: digest, bytes, mediaType, publicSafe, ref, locator, method, capturedAt }))
    .sort((a, b) => a.evidenceId.localeCompare(b.evidenceId))
  const stages = Object.fromEntries(STAGES.filter((stage) => stage !== 'review').map((stage) => {
    const current = entryStage(entry, stage)
    return [stage, { status: current.status, inputDigest: current.inputDigest || null, resultDigest: current.resultDigest || null }]
  }))
  const content = JSON.parse(JSON.stringify({ entryId: entry.entryId, entityId: entry.entityId, sourceEntity: state.entities?.[entry.entityId] || null, ...(entry.entityBindingEvidence ? { entityBindingEvidence: entry.entityBindingEvidence } : {}), revision: entry.revision, sourceUrl: entry.sourceUrl, stages, classification: entry.classification, classificationReadyForReview: entry.classificationReadyForReview === true, curatorId: entry.curatorId, editorial: entry.editorial, facts: entry.facts, pages: entry.pages, facets: entry.facets }))
  const stableEvidence = JSON.parse(JSON.stringify(evidence))
  return { contentDigest: sha256(content), evidenceDigest: sha256(stableEvidence), evidence: stableEvidence, content }
}

function entryPublicFields(entry, review) {
  return {
    entryId: entry.entryId,
    entityId: entry.entityId || null,
    sourceUrl: entry.sourceUrl,
    title: entry.editorial?.name || entry.entryId,
    descriptionZh: entry.editorial?.descriptionZh || null,
    classification: reviewedClassification(entry, review) || null,
    facets: entry.facets || null,
    facts: (entry.facts || []).map(({ field, value, sourceUrl, claim }) => ({ field, value, sourceUrl, ...(claim ? { claim } : {}) })),
    pages: (entry.pages || []).map(({ role, sourceUrl, finalUrl, title, publicUrl }) => ({ role, sourceUrl, finalUrl, title, publicUrl })),
  }
}

export class SiteGraph {
  constructor({ root = DEFAULT_ROOT, runId = null, policy = {}, clock = () => new Date(), verifyOnOpen = true } = {}) {
    this.root = path.resolve(root)
    this.clock = clock
    this.files = {
      state: path.join(this.root, 'state.json'),
      events: path.join(this.root, 'events.jsonl'),
      database: path.join(this.root, 'graph.sqlite'),
      lock: path.join(this.root, 'graph.lock'),
      blobs: path.join(this.root, 'blobs'),
    }
    const requestedRunId = runId
    fs.mkdirSync(this.root, { recursive: true })
    this.db = new DatabaseSync(this.files.database)
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = FULL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS graph_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        run_id TEXT NOT NULL,
        revision INTEGER NOT NULL,
        event_seq INTEGER NOT NULL,
        event_head TEXT,
        state_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS graph_events (
        run_id TEXT NOT NULL,
        seq INTEGER NOT NULL,
        event_hash TEXT NOT NULL,
        event_json TEXT NOT NULL,
        PRIMARY KEY (run_id, seq),
        UNIQUE (run_id, event_hash)
      );
    `)
    const row = this.db.prepare('SELECT run_id, state_json FROM graph_state WHERE id = 1').get()
    if (!row) {
      const legacy = readJson(this.files.state, null)
      const initial = legacy?.schema === GRAPH_SCHEMA ? legacy : emptyState({ runId: requestedRunId || `site-${Date.now()}`, policy })
      if (requestedRunId && initial.runId !== requestedRunId && legacy) throw new Error(`SITE_GRAPH_RUN_ID_MISMATCH:${initial.runId}:${requestedRunId}`)
      this.db.exec('BEGIN IMMEDIATE')
      try {
        this.db.prepare('INSERT INTO graph_state (id, run_id, revision, event_seq, event_head, state_json) VALUES (1, ?, ?, ?, ?, ?)')
          .run(initial.runId, initial.revision || 0, initial.eventSeq || 0, initial.eventHead || null, JSON.stringify(initial))
        const legacyEvents = fs.existsSync(this.files.events) ? fs.readFileSync(this.files.events, 'utf8').split(/\r?\n/u).filter(Boolean) : []
        const insertEvent = this.db.prepare('INSERT OR IGNORE INTO graph_events (run_id, seq, event_hash, event_json) VALUES (?, ?, ?, ?)')
        for (const line of legacyEvents) {
          const event = JSON.parse(line)
          insertEvent.run(initial.runId, event.seq, event.eventHash, JSON.stringify(event))
        }
        this.db.exec('COMMIT')
      } catch (error) {
        this.db.exec('ROLLBACK')
        throw error
      }
    }
    if (row && requestedRunId && row.run_id !== requestedRunId) throw new Error(`SITE_GRAPH_RUN_ID_MISMATCH:${row.run_id}:${requestedRunId}`)
    this.runId = this._readState().runId
    this._mirrorFiles()
    if (verifyOnOpen) {
      const audit = this.verify()
      if (!audit.ok) throw new Error(`SITE_GRAPH_CORRUPT:${audit.errors.join(',')}`)
    }
  }

  _readState() {
    const row = this.db.prepare('SELECT state_json FROM graph_state WHERE id = 1').get()
    if (!row) throw new Error('SITE_GRAPH_STATE_MISSING')
    return JSON.parse(row.state_json)
  }

  state() { return this._readState() }

  _mirrorFiles() {
    const state = this._readState()
    atomicWrite(this.files.state, `${JSON.stringify(state, null, 2)}\n`)
    const events = this.db.prepare('SELECT event_json FROM graph_events WHERE run_id = ? ORDER BY seq').all(state.runId)
    atomicWrite(this.files.events, `${events.map((event) => event.event_json).join('\n')}${events.length ? '\n' : ''}`)
  }

  _transact(mutator) {
    return withFileLock(this.files.lock, () => {
      this.db.exec('BEGIN IMMEDIATE')
      try {
        const state = this._readState()
        const events = []
        const ctx = { event: (type, target, payload = {}) => events.push({ schema: 'site-graph/event@1', type, target, payload, at: this.clock().toISOString() }) }
        const result = mutator(state, ctx)
        if (events.length) {
          state.revision = Number(state.revision || 0) + 1
          state.updatedAt = this.clock().toISOString()
          const insertEvent = this.db.prepare('INSERT INTO graph_events (run_id, seq, event_hash, event_json) VALUES (?, ?, ?, ?)')
          for (const raw of events) {
            const event = { ...raw, runId: state.runId, revision: state.revision, seq: state.eventSeq + 1, prevEventHash: state.eventHead }
            event.eventHash = eventHash(event)
            state.eventSeq = event.seq
            state.eventHead = event.eventHash
            insertEvent.run(state.runId, event.seq, event.eventHash, JSON.stringify(event))
          }
        }
        this.db.prepare('UPDATE graph_state SET revision = ?, event_seq = ?, event_head = ?, state_json = ? WHERE id = 1')
          .run(state.revision, state.eventSeq, state.eventHead, JSON.stringify(state))
        this.db.exec('COMMIT')
        this._mirrorFiles()
        return result
      } catch (error) {
        try { this.db.exec('ROLLBACK') } catch { /* transaction already closed */ }
        throw error
      }
    })
  }

  putBlob(value, { mediaType = 'application/octet-stream', sourceUrl = null, role = null } = {}) {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value)
    const digest = sha256(bytes)
    const file = path.join(this.files.blobs, digest)
    fs.mkdirSync(this.files.blobs, { recursive: true })
    if (fs.existsSync(file)) {
      if (sha256(fs.readFileSync(file)) !== digest) throw new Error(`BLOB_HASH_CONFLICT:${digest}`)
    } else {
      const temporary = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`
      fs.writeFileSync(temporary, bytes, { flag: 'wx' })
      try { fs.linkSync(temporary, file) } catch (error) { if (error.code !== 'EEXIST') throw error } finally { fs.rmSync(temporary, { force: true }) }
    }
    return { sha256: digest, bytes: bytes.length, mediaType, sourceUrl, role, ref: path.relative(this.root, file).replaceAll('\\', '/') }
  }

  readBlob(digest) { return fs.readFileSync(path.join(this.files.blobs, digest)) }

  ingest({ batchId, sourceId = 'unknown', source = null, rows = [] } = {}) {
    requireString(batchId, 'batch-id')
    return this._transact((state, ctx) => {
      state.batches ||= {}
      const snapshotSha = sha256(rows)
      const previousBatch = state.batches?.[batchId]
      if (previousBatch) {
        if (previousBatch.snapshotSha !== snapshotSha) throw new Error(`BATCH_SNAPSHOT_CONFLICT:${batchId}`)
        return previousBatch.observationIds.map((observationId) => state.observations[observationId]).filter(Boolean)
      }
      const effectiveSourceId = source?.sourceId || sourceId || 'unknown'
      const imported = []
      for (const [index, row] of rows.entries()) {
        const rawHitId = String(row.rawHitId || row.observationId || row.id || `${batchId}:${index + 1}`)
        const observationId = `obs:${batchId}:${String(index + 1).padStart(8, '0')}`
        const rawUrl = String(row.rawUrl || row.sourceUrl || row.url || row.pageUrl || row.canonicalUrl || '').trim()
        const sourceUrl = normalizeUrl(row.canonicalUrl || rawUrl)
        const fingerprint = row.fingerprint || sha256({ sourceUrl, rawUrl, rawHitId, row })
        if (state.observations[observationId]) throw new Error(`OBSERVATION_ID_CONFLICT:${observationId}`)
        const sameUrl = Object.values(state.entries).find((entry) => entry.sourceUrl === sourceUrl)
        const sameOrigin = Object.values(state.entries).filter((entry) => originOf(entry.sourceUrl) === originOf(sourceUrl))
        let entry = sameUrl
        let identityConflict = null
        if (!entry) {
          const entryId = `site-${sha256(sourceUrl).slice(0, 20)}`
          entry = state.entries[entryId] || {
            entryId, entityId: null, sourceUrl, revision: 1, status: 'candidate',
            stages: Object.fromEntries(STAGES.map((stage) => [stage, { status: 'pending', attempts: [] }])),
            observations: [], evidence: [], pages: [], facts: [], editorial: {}, classification: null, facets: {}, curatorId: null,
            createdAt: nowIso(), updatedAt: nowIso(), identityConflicts: [],
          }
          state.entries[entryId] = entry
          if (sameOrigin.length) {
            identityConflict = sameOrigin.map((item) => item.entryId)
            entry.identityConflicts.push(...identityConflict)
            ctx.event('identity.conflict', `entry:${entryId}`, { candidates: identityConflict, sourceUrl, reason: 'same-origin-different-path' })
          }
        }
        const rawBlob = this.putBlob(Buffer.from(`${JSON.stringify(row)}\n`), { mediaType: 'application/json', sourceUrl, role: 'raw-observation' })
        const observation = { observationId, batchId, ordinal: index, rawHitId, sourceId: effectiveSourceId, rawUrl, sourceUrl, fingerprint, rawRef: rawBlob.ref, rawSha256: rawBlob.sha256, observedAt: row.observedAt === undefined ? nowIso() : row.observedAt, ingestedAt: nowIso(), disposition: 'pending', entryId: entry.entryId, identityConflict }
        state.observations[observationId] = observation
        state.rawTotal += 1
        entry.observations.push(observationId)
        entry.updatedAt = nowIso()
        ctx.event('observation.recorded', `observation:${observationId}`, observation)
        ctx.event('observation.assigned', `observation:${observationId}`, { entryId: entry.entryId })
        imported.push(observation)
      }
      state.batches[batchId] = { batchId, sourceId: effectiveSourceId, snapshotSha, rowCount: imported.length, observationIds: imported.map((row) => row.observationId), ingestedAt: nowIso() }
      ctx.event('batch.ingested', `batch:${batchId}`, { sourceId: effectiveSourceId, count: imported.length, snapshotSha })
      return imported
    })
  }

  dispose({ observationId, disposition, reason = null, actor = 'deterministic', evidenceRefs = [] } = {}) {
    requireString(observationId, 'observation-id')
    requireString(disposition, 'disposition')
    return this._transact((state, ctx) => {
      const observation = state.observations[observationId]
      if (!observation) throw new Error(`UNKNOWN_OBSERVATION:${observationId}`)
      const previous = observation.disposition
      const decision = {
        decisionId: `disposition-${sha256(`${observationId}:${previous}:${disposition}:${state.revision}`).slice(0, 24)}`,
        observationId, previous, disposition, reason, actor, evidenceRefs: [...new Set(evidenceRefs)].sort(), at: nowIso(),
      }
      observation.disposition = disposition
      observation.dispositionHistory ||= []
      observation.dispositionHistory.push(decision)
      if (previous === 'pending' && disposition !== 'pending') state.rawSettled += 1
      if (previous !== 'pending' && disposition === 'pending') state.rawSettled = Math.max(0, state.rawSettled - 1)
      state.dispositions[decision.decisionId] = decision
      ctx.event('observation.disposed', `observation:${observationId}`, decision)
      return decision
    })
  }

  decideIdentity({ entryId, otherEntryId, operation, winnerEntryId = entryId, signals = [], reason, actor = 'curator', evidenceRefs = [] } = {}) {
    requireString(entryId, 'entry-id')
    requireString(otherEntryId, 'other-entry-id')
    requireString(reason, 'identity-reason')
    if (!['merge', 'keep-distinct', 'split', 'undo'].includes(operation)) throw new Error(`UNKNOWN_IDENTITY_OPERATION:${operation}`)
    if (operation !== 'undo' && (!Array.isArray(evidenceRefs) || evidenceRefs.length === 0)) throw new Error('IDENTITY_DECISION_EVIDENCE_REQUIRED')
    const strong = signals.some((signal) => signal && typeof signal === 'object' && signal.verified === true && Array.isArray(signal.evidenceRefs) && signal.evidenceRefs.length > 0 && ['stable-platform-id', 'exact-canonical-url', 'verified-redirect', 'official-bidirectional'].includes(signal.kind))
    if (operation === 'merge' && !strong) throw new Error('MERGE_REQUIRES_STRONG_IDENTITY_SIGNAL')
    return this._transact((state, ctx) => {
      const left = state.entries[entryId]
      const right = state.entries[otherEntryId]
      if (!left || !right) throw new Error('IDENTITY_ENTRY_MISSING')
      const decisionId = `identity-${sha256(`${entryId}:${otherEntryId}:${operation}:${state.revision}:${reason}`).slice(0, 24)}`
      const decision = { decisionId, entryId, otherEntryId, operation, winnerEntryId, signals: clone(signals), reason, actor, evidenceRefs: [...new Set(evidenceRefs)].sort(), at: nowIso() }
      state.decisions[decisionId] = decision
      if (operation === 'merge') {
        const winner = state.entries[winnerEntryId]
        const loserId = winnerEntryId === entryId ? otherEntryId : entryId
        const loser = state.entries[loserId]
        state.aliases[loserId] = winner.entryId
        loser.status = 'superseded'
        loser.supersededBy = winner.entryId
        loser.identityConflicts = []
        winner.identityConflicts = (winner.identityConflicts || []).filter((id) => id !== loserId)
      } else if (operation === 'keep-distinct') {
        left.identityConflicts = (left.identityConflicts || []).filter((id) => id !== otherEntryId)
        right.identityConflicts = (right.identityConflicts || []).filter((id) => id !== entryId)
      }
      ctx.event('identity.decided', `decision:${decisionId}`, decision)
      return decision
    })
  }

  claim({ worker, stage, limit = 1, leaseMs = this.state().policy.leaseMs, entryIds = null } = {}) {
    requireString(worker, 'worker')
    if (!STAGES.includes(stage)) throw new Error(`UNKNOWN_STAGE:${stage}`)
    if (entryIds !== null && !Array.isArray(entryIds)) throw new Error('ENTRY_IDS_MUST_BE_ARRAY')
    const selected = entryIds === null ? null : new Set(entryIds.map(id => requireString(id, 'entry-id')))
    return this._transact((state, ctx) => {
      const claimed = []
      const entries = Object.values(state.entries).sort((a, b) => a.entryId.localeCompare(b.entryId))
      const activeOrigin = new Map()
      for (const entry of entries) {
        const current = entryStage(entry, stage)
        if (current.lease && Date.parse(current.lease.expiresAt) > Date.now()) activeOrigin.set(originOf(entry.sourceUrl), (activeOrigin.get(originOf(entry.sourceUrl)) || 0) + 1)
      }
      for (const entry of entries) {
        if (claimed.length >= limit) break
        if (selected && !selected.has(entry.entryId)) continue
        const current = entryStage(entry, stage)
        if (!stageReady(state, entry, stage) || ['succeeded', 'blocked'].includes(current.status)) continue
        if (current.lease && Date.parse(current.lease.expiresAt) > Date.now()) continue
        if (current.lease && Date.parse(current.lease.expiresAt) <= Date.now()) {
          current.attempts.push({ at: nowIso(), status: 'expired', worker: current.lease.worker })
          current.lease = null
          current.status = 'pending'
          ctx.event('lease.expired', `entry:${entry.entryId}`, { stage, worker: current.attempts.at(-1).worker })
        }
        const origin = originOf(entry.sourceUrl)
        if ((activeOrigin.get(origin) || 0) >= Number(state.policy.maxConcurrentPerOrigin || 4)) continue
        const token = crypto.randomUUID()
        const attempt = current.attempts.length + 1
        const expiresAt = new Date(Date.now() + leaseMs).toISOString()
        current.status = 'running'
        current.inputDigest = stageInputDigest(entry, stage)
        current.lease = { token, worker, attempt, revision: entry.revision, expiresAt }
        current.attempts.push({ attempt, worker, status: 'running', startedAt: nowIso(), inputDigest: current.inputDigest })
        activeOrigin.set(origin, (activeOrigin.get(origin) || 0) + 1)
        ctx.event('lease.acquired', `entry:${entry.entryId}`, { stage, token, worker, attempt, revision: entry.revision, inputDigest: current.inputDigest })
        claimed.push({ token, entryId: entry.entryId, revision: entry.revision, stage, url: entry.sourceUrl, attempt, expiresAt, inputs: { ...entry.stages } })
      }
      return claimed
    })
  }

  settle({ token, result = {}, error = null, status = null, retryable = false } = {}) {
    requireString(token, 'lease-token')
    return this._transact((state, ctx) => {
      const requestedStatus = status || (error ? (retryable ? 'retryable' : 'failed') : 'succeeded')
      if (!['succeeded', 'retryable', 'failed', 'blocked'].includes(requestedStatus)) throw new Error(`UNKNOWN_SETTLEMENT_STATUS:${requestedStatus}`)
      const found = Object.values(state.entries).map((entry) => ({ entry, stage: Object.entries(entry.stages).find(([, value]) => value.lease?.token === token) })).find((item) => item.stage)
      if (!found) {
        state.lateSettlements.push({ token, status: 'rejected', error: 'LEASE_NOT_FOUND', at: nowIso() })
        ctx.event('settlement.rejected', `token:${token}`, { error: 'LEASE_NOT_FOUND' })
        return { accepted: false, status: 'rejected', error: 'LEASE_NOT_FOUND', token }
      }
      const { entry, stage: [stage, current] } = found
      const lease = current.lease
      if (lease.revision !== entry.revision || Date.parse(lease.expiresAt) <= Date.now()) {
        const attempt = current.attempts.at(-1)
        if (attempt) { attempt.status = 'late'; attempt.finishedAt = nowIso() }
        current.lease = null
        current.status = 'pending'
        state.lateSettlements.push({ token, entryId: entry.entryId, stage, status: 'late', at: nowIso(), error: 'STALE_LEASE', evidence: clone(result?.evidence || []) })
        ctx.event('settlement.late', `entry:${entry.entryId}`, { stage, token, error: 'STALE_LEASE', evidence: clone(result?.evidence || []) })
        return { accepted: false, status: 'late', error: 'STALE_LEASE', token, entryId: entry.entryId, stage }
      }
      const attempt = current.attempts.at(-1)
      attempt.finishedAt = nowIso()
      attempt.status = requestedStatus
      attempt.error = error ? String(error).slice(0, 2000) : null
      current.lease = null
      current.result = JSON.parse(JSON.stringify(result || {}))
      current.resultDigest = sha256(current.result)
      current.status = requestedStatus === 'succeeded' ? 'succeeded' : requestedStatus === 'blocked' ? 'blocked' : current.attempts.length < Number(state.policy.maxAttempts || 3) ? 'retryable' : 'blocked'
      if (stage === 'curate' && requestedStatus === 'succeeded') {
        if (result.sourceEntity) this._bindEntity(state, entry, { sourceEntity: result.sourceEntity, bindingEvidence: result.entityBindingEvidence, actor: result.curatorId, reason: result.entityBindingReason || 'Curator explicitly identifies the project from direct source evidence.' }, ctx)
        entry.editorial = result.editorial || entry.editorial
        entry.classification = result.classification || entry.classification
        entry.facets = result.facets || entry.facets
        entry.facts = result.facts || entry.facts
        entry.curatorId = result.curatorId || entry.curatorId
        entry.classificationReadyForReview = result.classificationReadyForReview === true
      }
      if (stage === 'explore' && requestedStatus === 'succeeded') {
        entry.pages = result.pages || entry.pages
        for (const evidence of result.evidence || []) this._registerEvidence(state, entry, evidence, ctx)
      }
      ctx.event('stage.settled', `entry:${entry.entryId}`, { stage, status: current.status, resultDigest: current.resultDigest, error })
      return { accepted: true, entryId: entry.entryId, stage, status: current.status, resultDigest: current.resultDigest }
    })
  }

  _registerEvidence(state, entry, evidence, ctx) {
    const ref = requireString(evidence.sha256 || evidence.ref, 'evidence-ref')
    if (evidence.sha256 && !isSha256(evidence.sha256)) throw new Error(`EVIDENCE_SHA256_INVALID:${ref}`)
    if (!evidence.ref || !evidence.sha256) throw new Error('EVIDENCE_BLOB_REF_AND_SHA_REQUIRED')
    const absolute = path.resolve(this.root, evidence.ref)
    if (!absolute.startsWith(`${path.resolve(this.root)}${path.sep}`)) throw new Error('EVIDENCE_REF_OUTSIDE_ROOT')
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) throw new Error(`EVIDENCE_BLOB_MISSING:${evidence.sha256}`)
    const actualBytes = fs.readFileSync(absolute)
    if (sha256(actualBytes) !== evidence.sha256) throw new Error(`EVIDENCE_BLOB_HASH_MISMATCH:${evidence.sha256}`)
    if (evidence.bytes != null && Number(evidence.bytes) !== actualBytes.length) throw new Error(`EVIDENCE_BLOB_SIZE_MISMATCH:${evidence.sha256}`)
    const evidenceId = evidence.evidenceId || `ev-${sha256(`${entry.entryId}:${evidence.role}:${ref}`).slice(0, 20)}`
    if (!['identity', 'breadth', 'proof', 'direct-fact', 'measurement', 'interaction', 'raw'].includes(evidence.role)) throw new Error(`EVIDENCE_ROLE_INVALID:${evidence.role}`)
    if (!state.evidence[evidenceId]) state.evidence[evidenceId] = {
      evidenceId, entryId: entry.entryId, role: evidence.role, sourceUrl: evidence.sourceUrl || entry.sourceUrl,
      finalUrl: evidence.finalUrl || null, sha256: evidence.sha256 || null, bytes: evidence.bytes || null,
      mediaType: evidence.mediaType || null, publicSafe: evidence.publicSafe !== false, ref: evidence.ref,
      capturedAt: evidence.capturedAt === undefined ? nowIso() : evidence.capturedAt, locator: evidence.locator || null, method: evidence.method || null,
    }
    else if (state.evidence[evidenceId].sha256 !== evidence.sha256 || state.evidence[evidenceId].ref !== evidence.ref) throw new Error(`EVIDENCE_ID_CONTENT_CONFLICT:${evidenceId}`)
    if (!entry.evidence.includes(evidenceId)) entry.evidence.push(evidenceId)
    ctx.event('evidence.registered', `evidence:${evidenceId}`, state.evidence[evidenceId])
  }

  _bindEntity(state, entry, { sourceEntity, bindingEvidence, actor, reason }, ctx) {
    requireString(actor, 'entity-binding-actor')
    requireString(reason, 'entity-binding-reason')
    const entity = clone(sourceEntity)
    const issues = sourceEntityIssues({ entryId: entry.entryId, entityId: entity?.entityId, classification: { entityId: entity?.entityId }, sourceEntity: entity })
    if (issues.length) throw new Error(`SOURCE_ENTITY_INVALID:${issues.join(',')}`)
    if (entry.status === 'approved') throw new Error('SOURCE_ENTITY_APPROVED_ENTRY_REQUIRES_REVISION')
    const relationshipEvidence = bindingEvidence === undefined ? entity.identityEvidence : bindingEvidence
    if (!Array.isArray(relationshipEvidence) || !relationshipEvidence.some(item => String(item.statement || '').trim() && /^https:\/\/[^\s]+$/u.test(item.evidenceUrl || '') && item.evidenceIds?.length && item.evidenceIds.every(id => state.evidence[id]?.entryId === entry.entryId))) throw new Error('SOURCE_ENTITY_EVIDENCE_NOT_BOUND_TO_ENTRY')
    state.entities ||= {}
    const prior = state.entities[entity.entityId]
    if (prior && sha256(prior) !== sha256(entity)) throw new Error(`SOURCE_ENTITY_ID_CONTENT_CONFLICT:${entity.entityId}`)
    state.entities[entity.entityId] = entity
    entry.entityId = entity.entityId
    if (bindingEvidence !== undefined) entry.entityBindingEvidence = clone(bindingEvidence)
    else delete entry.entityBindingEvidence
    if (entry.classification) entry.classification = { ...entry.classification, entityId: entity.entityId }
    for (const stage of ['validate', 'review']) {
      const current = entryStage(entry, stage)
      entry.stages[stage] = { ...current, status: 'pending', lease: null, result: null, resultDigest: null }
    }
    entry.updatedAt = nowIso()
    ctx.event('source-entity.bound', `entry:${entry.entryId}`, { entityId: entity.entityId, sourceEntity: entity, ...(bindingEvidence !== undefined ? { bindingEvidence: clone(bindingEvidence) } : {}), actor, reason })
    return clone(entity)
  }

  bindEntity(entryId, value = {}) {
    return this._transact((state, ctx) => {
      const entry = state.entries[entryId]
      if (!entry) throw new Error(`UNKNOWN_ENTRY:${entryId}`)
      return this._bindEntity(state, entry, value, ctx)
    })
  }

  revise(entryId, { actor, reason } = {}) {
    return this._transact((state, ctx) => {
      const entry = state.entries[entryId]
      if (!entry) throw new Error(`UNKNOWN_ENTRY:${entryId}`)
      entry.revisionHistory ||= []
      entry.revisionHistory.push({ revision: entry.revision, at: nowIso(), actor: actor || null, reason: reason || null, stages: clone(entry.stages), review: clone(state.reviews[entryId] || null) })
      entry.revision += 1
      for (const stage of STAGES) {
        entry.stages[stage] = { status: 'pending', attempts: [] }
      }
      state.reviews[entryId] = null
      entry.status = 'candidate'
      ctx.event('entry.revised', `entry:${entryId}`, { actor, reason, revision: entry.revision, previousRevision: entry.revision - 1 })
      return { entryId, revision: entry.revision }
    })
  }

  packet(entryId) {
    const state = this.state()
    const entry = state.entries[entryId]
    if (!entry) throw new Error(`UNKNOWN_ENTRY:${entryId}`)
    const packet = currentPacket(state, entry)
    const policyDigest = sha256(state.policy)
    return { entryId, revision: entry.revision, ...packet, policy: state.policy, policyDigest, packetDigest: sha256({ contentDigest: packet.contentDigest, evidenceDigest: packet.evidenceDigest, policyDigest }) }
  }

  review({ entryId, reviewer, decision, packetDigest, checks = [], notes = '', report = null } = {}) {
    return this._transact((state, ctx) => {
      const entry = state.entries[entryId]
      if (!entry) throw new Error(`UNKNOWN_ENTRY:${entryId}`)
      if (!['approved', 'rejected', 'needs-changes'].includes(decision)) throw new Error(`UNKNOWN_REVIEW_DECISION:${decision}`)
      requireString(reviewer, 'reviewer')
      if (reviewer === entry.curatorId) throw new Error('REVIEWER_MUST_DIFFER_FROM_CURATOR')
      const editorialIssues = curationIssues(entry, { entities: state.entities, review: { decision, reviewer, reviewedAt: nowIso() } })
      if (decision === 'approved' && editorialIssues.length) throw new Error(`REVIEW_EDITORIAL_INVALID:${editorialIssues.join(',')}`)
      if (!Array.isArray(checks) || checks.length < Number(state.policy.minimumReviewChecks || 3)) throw new Error('REVIEW_CHECKS_INCOMPLETE')
      const checkNames = checks.map((check) => typeof check === 'string' ? check : check?.name).filter(Boolean)
      if (new Set(checkNames).size !== checkNames.length) throw new Error('REVIEW_CHECKS_DUPLICATED')
      if (decision === 'approved') {
        if (checks.some((check) => typeof check === 'object' && check?.passed === false)) throw new Error('REVIEW_CHECK_FAILED')
        for (const stage of ['probe', 'explore', 'curate', 'validate']) if (entryStage(entry, stage).status !== 'succeeded') throw new Error(`REVIEW_STAGE_INCOMPLETE:${stage}`)
        if (['probe', 'explore'].some(stage => evidenceStageOutcome(stage, entry.stages[stage].result).status !== 'succeeded')) throw new Error('REVIEW_EVIDENCE_INCOMPLETE')
        if (entry.stages.validate?.result?.passed !== true && entry.stages.validate?.result?.gate !== 'passed') throw new Error('REVIEW_VALIDATION_NOT_PASSED')
      }
      const packet = currentPacket(state, entry)
      const policyDigest = sha256(state.policy)
      const expected = sha256({ contentDigest: packet.contentDigest, evidenceDigest: packet.evidenceDigest, policyDigest })
      if (packetDigest !== expected) throw new Error('REVIEW_PACKET_STALE')
      let reportMeta = null
      if (state.policy.requireReviewReport) {
        if (!report) throw new Error('REVIEW_REPORT_REQUIRED')
        if (report.ref && report.sha256) {
          const absolute = path.resolve(this.root, report.ref)
          if (!absolute.startsWith(`${path.resolve(this.root)}${path.sep}`) || !fs.existsSync(absolute)) throw new Error('REVIEW_REPORT_BLOB_MISSING')
          const bytes = fs.readFileSync(absolute)
          if (sha256(bytes) !== report.sha256) throw new Error('REVIEW_REPORT_BLOB_HASH_MISMATCH')
          reportMeta = { ref: report.ref, sha256: report.sha256, bytes: bytes.length, mediaType: report.mediaType || 'application/json' }
        } else {
          reportMeta = this.putBlob(Buffer.from(`${JSON.stringify(report, null, 2)}\n`), { mediaType: 'application/json', role: 'review-report' })
        }
      }
      const review = { reviewId: `review-${sha256(`${entryId}:${entry.revision}:${reviewer}:${expected}`).slice(0, 24)}`, entryId, revision: entry.revision, reviewer, decision, packetDigest, contentDigest: packet.contentDigest, evidenceDigest: packet.evidenceDigest, policyDigest, checks, notes, report: reportMeta, reviewedAt: nowIso() }
      state.reviews[entryId] = review
      state.reviewHistory ||= []
      state.reviewHistory.push(clone(review))
      entry.stages.review = { status: decision === 'approved' ? 'succeeded' : 'blocked', attempts: [], result: review, resultDigest: sha256(review), lease: null }
      entry.status = decision === 'approved' ? 'approved' : 'held'
      ctx.event('review.recorded', `entry:${entryId}`, review)
      return review
    })
  }

  explain(entryId) {
    const state = this.state()
    const entry = state.entries[entryId]
    if (!entry) throw new Error(`UNKNOWN_ENTRY:${entryId}`)
    const events = this.db.prepare('SELECT event_json FROM graph_events WHERE run_id = ? ORDER BY seq').all(state.runId)
      .map((row) => JSON.parse(row.event_json)).filter((event) => event.target === `entry:${entryId}` || event.payload?.entryId === entryId)
    return { entry, sourceEntity: state.entities?.[entry.entityId] || null, observations: Object.values(state.observations).filter((row) => row.entryId === entryId), evidence: Object.values(state.evidence).filter((row) => row.entryId === entryId), review: state.reviews[entryId] || null, events }
  }

  status() {
    const state = this.state()
    const stages = Object.fromEntries(STAGES.map((stage) => [stage, Object.values(state.entries).filter((entry) => entryStage(entry, stage).status === 'succeeded').length]))
    return { runId: state.runId, revision: state.revision, entries: Object.keys(state.entries).length, observations: Object.keys(state.observations).length, rawTotal: state.rawTotal, rawSettled: state.rawSettled, stages, approved: Object.values(state.entries).filter((entry) => entry.status === 'approved').length, published: 0 }
  }

  verify() {
    const state = this.state()
    const errors = []
    if (state.schema !== GRAPH_SCHEMA) errors.push('schema-mismatch')
    if (state.rawTotal !== Object.keys(state.observations).length) errors.push('raw-total-mismatch')
    const dispositions = Object.values(state.observations).filter((row) => row.disposition && row.disposition !== 'pending').length
    if (state.rawSettled !== dispositions) errors.push('raw-settled-mismatch')
    let previous = null
    let count = 0
    const events = this.db.prepare('SELECT event_json FROM graph_events WHERE run_id = ? ORDER BY seq').all(state.runId)
    for (const [index, row] of events.entries()) {
      let event
      try { event = JSON.parse(row.event_json) } catch { errors.push(`invalid-event-json:${index + 1}`); continue }
      if (event.seq !== index + 1) errors.push(`event-seq-gap:${event.seq}`)
      if (event.prevEventHash !== previous) errors.push(`event-chain-break:${event.seq}`)
      if (eventHash(event) !== event.eventHash) errors.push(`event-hash-mismatch:${event.seq}`)
      previous = event.eventHash
      count += 1
    }
    if (count !== state.eventSeq || previous !== state.eventHead) errors.push('event-head-mismatch')
    for (const entry of Object.values(state.entries)) {
      if (!entry.sourceUrl) errors.push(`entry-source-missing:${entry.entryId}`)
      for (const stage of STAGES) {
        const current = entryStage(entry, stage)
        if (current.status === 'succeeded' && !current.resultDigest) errors.push(`stage-result-missing:${entry.entryId}:${stage}`)
        if (current.lease && current.lease.revision !== entry.revision) errors.push(`stale-lease:${entry.entryId}:${stage}`)
        if (current.status === 'succeeded' && !stageReady(state, entry, stage) && stage !== 'probe') errors.push(`stage-dependency-missing:${entry.entryId}:${stage}`)
      }
      if (entry.status === 'approved') {
        const packet = currentPacket(state, entry)
        const review = state.reviews[entry.entryId]
        if (!review || review.revision !== entry.revision || review.contentDigest !== packet.contentDigest || review.evidenceDigest !== packet.evidenceDigest || review.policyDigest !== sha256(state.policy) || review.decision !== 'approved') errors.push(`approved-without-current-review:${entry.entryId}`)
      }
      // An unresolved split is a valid pending state. Export still holds it;
      // only approving it would violate the storage invariants.
      if (entry.identityConflicts?.length && entry.status === 'approved') errors.push(`identity-conflict-unresolved:${entry.entryId}`)
    }
    for (const evidence of Object.values(state.evidence)) {
      if (!evidence.ref || !evidence.sha256) { errors.push(`evidence-unbound:${evidence.evidenceId}`); continue }
      const absolute = path.resolve(this.root, evidence.ref)
      if (!absolute.startsWith(`${path.resolve(this.root)}${path.sep}`) || !fs.existsSync(absolute) || sha256(fs.readFileSync(absolute)) !== evidence.sha256) errors.push(`evidence-blob-invalid:${evidence.evidenceId}`)
    }
    for (const [loser, winner] of Object.entries(state.aliases || {})) if (loser === winner || state.aliases[winner] === loser) errors.push(`identity-alias-cycle:${loser}`)
    return { ok: errors.length === 0, errors, status: this.status() }
  }

  export(outputDir, { includeHeld = true } = {}) {
    const state = this.state()
    const rows = []
    const held = []
    for (const entry of Object.values(state.entries)) {
      const packet = currentPacket(state, entry)
      const review = state.reviews[entry.entryId]
      const roles = new Map(packet.evidence.map((item) => [item.role, item]))
      const reasons = []
      reasons.push(...curationIssues(entry, { entities: state.entities, review }))
      for (const stage of ['probe', 'explore']) if (evidenceStageOutcome(stage, entry.stages?.[stage]?.result).status !== 'succeeded') reasons.push(`${stage}-evidence-incomplete`)
      if (entry.status === 'superseded') reasons.push('superseded-entry')
      if (entry.identityConflicts?.length) reasons.push('identity-conflict-unresolved')
      if (entry.classification?.recordLevel !== 'entry') reasons.push('classification-record-level-not-entry')
      if (STAGES.some((stage) => entryStage(entry, stage).status !== 'succeeded')) reasons.push('stage-not-complete')
      if (entry.stages.validate?.result?.passed !== true && entry.stages.validate?.result?.gate !== 'passed') reasons.push('deterministic-validation-not-passed')
      if (!review || review.decision !== 'approved' || review.revision !== entry.revision) reasons.push('independent-review-missing-or-stale')
      if (review && (review.contentDigest !== packet.contentDigest || review.evidenceDigest !== packet.evidenceDigest || review.policyDigest !== sha256(state.policy))) reasons.push('independent-review-digest-stale')
      if (state.policy.requireChineseDescription && !/\p{Script=Han}/u.test(entry.editorial?.descriptionZh || '')) reasons.push('chinese-description-missing')
      for (const role of state.policy.requiredEvidenceRoles || []) if (!roles.has(role)) reasons.push(`evidence-role-missing:${role}`)
      const proof = packet.evidence.filter((item) => item.role === 'proof')
      const requiredEvidence = packet.evidence.filter((item) => (state.policy.requiredEvidenceRoles || []).includes(item.role))
      if (proof.length < Number(state.policy.minimumProofShots || 1) || new Set(requiredEvidence.map((item) => item.sha256).filter(Boolean)).size < (state.policy.requiredEvidenceRoles || []).length) reasons.push('three-distinct-evidence-missing')
      if (!Array.isArray(entry.facts) || entry.facts.filter((fact) => fact.sourceUrl && Array.isArray(fact.evidenceIds) && fact.evidenceIds.length && fact.evidenceIds.every((id) => state.evidence[id]?.entryId === entry.entryId)).length < 1) reasons.push('direct-fact-source-missing')
      if (reasons.length) { if (includeHeld) held.push({ entryId: entry.entryId, reasons }); continue }
      rows.push(entryPublicFields(entry, review))
    }
    const core = { schema: 'vislexicon/site-entry-projection/1', runId: state.runId, graphRevision: state.revision, graphDigest: sha256({ entries: state.entries, entities: state.entities || {}, evidence: state.evidence, reviews: state.reviews }), publish: false, rows, held }
    const serializableCore = JSON.parse(JSON.stringify(core))
    const projectionDigest = sha256(serializableCore)
    const generatedAt = nowIso()
    const projection = { ...serializableCore, projectionDigest, generatedAt }
    const manifestCore = { graphSchema: GRAPH_SCHEMA, projectionSchema: serializableCore.schema, runId: state.runId, graphRevision: state.revision, graphDigest: serializableCore.graphDigest, projectionDigest, rows: rows.length, held: held.length }
    const manifest = { ...manifestCore, manifestDigest: sha256(manifestCore), generatedAt }
    if (outputDir) {
      fs.mkdirSync(outputDir, { recursive: true })
      const generation = path.join(outputDir, 'generations', `${state.revision}-${projectionDigest.slice(0, 16)}`)
      fs.mkdirSync(generation, { recursive: true })
      atomicWrite(path.join(generation, 'projection.json'), `${JSON.stringify(projection, null, 2)}\n`)
      atomicWrite(path.join(generation, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
      const writtenProjection = JSON.parse(fs.readFileSync(path.join(generation, 'projection.json'), 'utf8'))
      delete writtenProjection.projectionDigest
      delete writtenProjection.generatedAt
      if (sha256(writtenProjection) !== projectionDigest) throw new Error('PROJECTION_GENERATION_HASH_MISMATCH')
      atomicWrite(path.join(outputDir, 'CURRENT'), `${JSON.stringify({ generation: path.relative(outputDir, generation).replaceAll('\\', '/'), projectionDigest, manifestDigest: manifest.manifestDigest }, null, 2)}\n`)
      atomicWrite(path.join(outputDir, 'projection.json'), `${JSON.stringify(projection, null, 2)}\n`)
      atomicWrite(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
    }
    return projection
  }

  close() {
    const result = this.verify()
    this.db.close()
    return result
  }
}
