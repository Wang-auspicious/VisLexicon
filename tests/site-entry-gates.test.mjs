import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { probeSource, exploreSource } from '../scripts/site-graph/adapters.mjs'
import { evidenceStageOutcome } from '../scripts/site-graph/gates.mjs'
import { SiteGraph } from '../scripts/site-graph/store.mjs'
import { curationIssues } from '../scripts/site-graph/gates.mjs'

test('probe uses the global fetch fallback when no fetchImpl is supplied', async () => {
  const prior = globalThis.fetch
  let calls = 0
  globalThis.fetch = async () => {
    calls++
    return new Response('<html><title>Official page</title></html>', { status: 200, headers: { 'content-type': 'text/html' } })
  }
  try {
    const result = await probeSource({ url: 'https://example.com' }, {
      maxAttempts: 1, resolveHost: async () => [{ address: '93.184.216.34', family: 4 }],
    })
    assert.equal(calls, 1)
    assert.equal(result.status, 'success')
    assert.equal(result.facts.title, 'Official page')
  } finally { globalThis.fetch = prior }
})

test('a blocked HTTP probe is retained but cannot unlock browser exploration', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vislexicon-probe-gate-'))
  const graph = new SiteGraph({ root })
  try {
    graph.ingest({ batchId: 'blocked', rows: [{ url: 'https://example.com' }] })
    const claim = graph.claim({ worker: 'http', stage: 'probe' })[0]
    const result = { status: 'blocked', sourceSnapshot: { requestedUrl: claim.url, status: 403 }, failures: [{ reason: 'http-403' }] }
    graph.settle({ token: claim.token, result, ...evidenceStageOutcome('probe', result) })
    assert.equal(graph.claim({ worker: 'browser', stage: 'explore' }).length, 0)
    assert.equal(graph.explain(claim.entryId).entry.stages.probe.result.failures[0].reason, 'http-403')
    assert.equal(graph.verify().ok, true)
  } finally { graph.close(); fs.rmSync(root, { recursive: true, force: true }) }
})

test('same-origin paths remain separate, reviewable and resumable without corrupting the graph', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vislexicon-split-gate-'))
  let graph = new SiteGraph({ root })
  try {
    graph.ingest({ batchId: 'distinct-paths', rows: [{ url: 'https://example.com/components' }, { url: 'https://example.com/fonts' }] })
    assert.equal(graph.status().entries, 2)
    assert.equal(graph.verify().ok, true)
    assert.equal(graph.close().ok, true)
    graph = new SiteGraph({ root })
    const projection = graph.export()
    assert.equal(projection.rows.length, 0)
    assert.ok(projection.held.some(row => row.reasons.includes('identity-conflict-unresolved')))
  } finally { graph.close(); fs.rmSync(root, { recursive: true, force: true }) }
})

test('a ready outbox can claim its exact entry without leasing unrelated entries or bypassing dependencies', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vislexicon-targeted-claim-'))
  const graph = new SiteGraph({ root })
  try {
    graph.ingest({ batchId: 'outbox', rows: [{ url: 'https://example.com/components' }, { url: 'https://example.org/fonts' }] })
    const entries = Object.values(graph.state().entries).sort((a, b) => a.entryId.localeCompare(b.entryId))
    const selected = entries[1].entryId
    const claims = graph.claim({ worker: 'outbox-merger', stage: 'probe', limit: 10, entryIds: [selected] })
    assert.deepEqual(claims.map(claim => claim.entryId), [selected])
    assert.equal(graph.explain(entries[0].entryId).entry.stages.probe.status, 'pending')
    assert.equal(graph.explain(entries[0].entryId).entry.stages.probe.attempts.length, 0)
    assert.equal(graph.claim({ worker: 'second-worker', stage: 'probe', entryIds: [selected] }).length, 0)
    assert.equal(graph.claim({ worker: 'curator', stage: 'curate', entryIds: [selected] }).length, 0)
    assert.equal(graph.claim({ worker: 'no-targets', stage: 'probe', entryIds: [] }).length, 0)
  } finally { graph.close(); fs.rmSync(root, { recursive: true, force: true }) }
})

test('retryable probes and partial three-page evidence cannot be marked succeeded', () => {
  assert.equal(evidenceStageOutcome('probe', { status: 'retryable-failure' }).status, 'retryable')
  assert.equal(evidenceStageOutcome('explore', { status: 'partial', evidence: [] }).status, 'retryable')
  assert.notEqual(evidenceStageOutcome('explore', { status: 'success', evidence: [{ role: 'identity', sha256: 'same' }, { role: 'breadth', sha256: 'same' }, { role: 'proof', sha256: 'same' }] }).status, 'succeeded')
})

test('legacy evidence preserves an explicitly unknown capture time across persistence', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vislexicon-evidence-date-'))
  let graph = new SiteGraph({ root })
  try {
    graph.ingest({ batchId: 'legacy', rows: [{ url: 'https://example.com' }] })
    const probe = graph.claim({ worker: 'probe', stage: 'probe' })[0]
    graph.settle({ token: probe.token, result: { status: 'success' } })
    const explore = graph.claim({ worker: 'explore', stage: 'explore' })[0]
    const captureTimes = [undefined, null, '2026-01-01T00:00:00.000Z']
    const evidence = ['identity', 'breadth', 'proof'].map((role, index) => {
      const blob = graph.putBlob(Buffer.from(`dated-shot-${index}`), { mediaType: 'image/png' })
      return { evidenceId: `dated-${role}`, role, ref: blob.ref, sha256: blob.sha256, bytes: blob.bytes, capturedAt: captureTimes[index] }
    })
    graph.settle({ token: explore.token, result: { status: 'success', evidence } })
    graph.close()
    graph = new SiteGraph({ root })
    assert.ok(Number.isFinite(Date.parse(graph.state().evidence['dated-identity'].capturedAt)))
    assert.equal(graph.state().evidence['dated-breadth'].capturedAt, null)
    assert.equal(graph.state().evidence['dated-proof'].capturedAt, captureTimes[2])
  } finally { graph.close(); fs.rmSync(root, { recursive: true, force: true }) }
})

test('recovered observations retain unknown source dates separately from ingestion time', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vislexicon-observation-date-'))
  const graph = new SiteGraph({ root })
  try {
    const observations = graph.ingest({ batchId: 'recovered', rows: [{ url: 'https://example.com', observedAt: null }, { url: 'https://example.org', observedAt: '2026-09-01T00:00:00.000Z' }] })
    assert.equal(observations[0].observedAt, null)
    assert.equal(observations[1].observedAt, '2026-09-01T00:00:00.000Z')
    assert.ok(observations.every(item => Number.isFinite(Date.parse(item.ingestedAt))))
    assert.equal(graph.status().rawTotal, 2)
    assert.equal(graph.verify().ok, true)
  } finally { graph.close(); fs.rmSync(root, { recursive: true, force: true }) }
})

test('source entities require explicit evidence and binding invalidates prior validation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vislexicon-entity-bind-'))
  const graph = new SiteGraph({ root })
  try {
    graph.ingest({ batchId: 'entities', rows: [{ url: 'https://example.com/components' }, { url: 'https://example.com/icons' }] })
    const claims = graph.claim({ worker: 'probe', stage: 'probe', limit: 2 })
    for (const claim of claims) graph.settle({ token: claim.token, result: { status: 'success' } })
    const selected = claims[0].entryId
    const explore = graph.claim({ worker: 'explore', stage: 'explore', entryIds: [selected] })[0]
    const evidence = ['identity', 'breadth', 'proof'].map((role, index) => {
      const blob = graph.putBlob(Buffer.from(`entity-shot-${index}`), { mediaType: 'image/png' })
      return { evidenceId: `entity-${role}`, role, ref: blob.ref, sha256: blob.sha256, bytes: blob.bytes }
    })
    graph.settle({ token: explore.token, result: { status: 'success', evidence } })
    const curate = graph.claim({ worker: 'curator', stage: 'curate', entryIds: [selected] })[0]
    graph.settle({ token: curate.token, result: { curatorId: 'curator', classificationReadyForReview: true, editorial: { name: 'Example', descriptionZh: '包含可预览组件的项目。' }, classification: { recordLevel: 'entry', status: 'needs-review', alternatives: [], primaryCategory: 'ui-implementation', subcategory: 'general-ui-components', reasons: [{ statement: '提供可复用组件。', evidenceUrl: 'https://example.com/components' }] } } })
    const validate = graph.claim({ worker: 'validate', stage: 'validate', entryIds: [selected] })[0]
    graph.settle({ token: validate.token, result: { passed: true } })
    const before = graph.packet(selected)
    assert.throws(() => graph.review({ entryId: selected, reviewer: 'independent', decision: 'approved', packetDigest: before.packetDigest, checks: ['identity', 'breadth', 'proof'], report: {} }), /curate-source-entity/)
    const sourceEntity = { entityId: 'entity-example', canonicalName: 'Example', nameAliases: [], primaryUrl: 'https://example.com/components', urlAliases: [], providerType: 'project', status: 'confirmed', revision: 1, identityEvidence: [{ statement: '直接页面显示项目名称。', evidenceUrl: 'https://example.com/components', evidenceIds: [evidence[0].evidenceId] }] }
    assert.throws(() => graph.bindEntity(selected, { sourceEntity: { ...sourceEntity, entityId: selected }, actor: 'curator', reason: 'Direct identity evidence' }), /namespace-invalid/)
    assert.throws(() => graph.bindEntity(selected, { sourceEntity: { ...sourceEntity, identityEvidence: [{ ...sourceEntity.identityEvidence[0], evidenceIds: ['missing'] }] }, actor: 'curator', reason: 'Direct identity evidence' }), /EVIDENCE_NOT_BOUND/)
    graph.bindEntity(selected, { sourceEntity, actor: 'curator', reason: '直接身份图和官网名称一致，明确绑定该项目。' })
    const after = graph.packet(selected)
    assert.notEqual(after.packetDigest, before.packetDigest)
    assert.equal(graph.explain(selected).entry.stages.validate.status, 'pending')
    assert.equal(graph.explain(claims[1].entryId).entry.entityId, null)
    assert.throws(() => graph.bindEntity(selected, { sourceEntity: { ...sourceEntity, canonicalName: 'Different project' }, actor: 'curator', reason: 'Same domain' }), /CONTENT_CONFLICT/)
    assert.equal(curationIssues(graph.explain(selected).entry, { entities: graph.state().entities }).length, 0)
    assert.equal(graph.export().rows.length, 0)
    assert.equal(graph.verify().ok, true)
  } finally { graph.close(); fs.rmSync(root, { recursive: true, force: true }) }
})

test('403 and access-challenge screenshots remain partial evidence', async () => {
  for (const [status, title] of [[403, 'Access denied'], [200, 'Just a moment...']]) {
    const context = { newPage: async () => ({
      goto: async () => ({ status: () => status }), waitForLoadState: async () => {},
      evaluate: async () => ({ title, h1: title, textChars: 100, firstScreenText: title, links: [] }),
      screenshot: async () => Buffer.from('fixture-image'), url: () => 'https://example.com', close: async () => {},
    }) }
    const result = await exploreSource({ entryId: 'fixture', url: 'https://example.com' }, { context, settleMs: 0 })
    assert.equal(result.status, 'partial')
    assert.equal(result.pages[0].blocked, true)
    assert.equal(result.evidence.length, 1)
    assert.notEqual(evidenceStageOutcome('explore', result).status, 'succeeded')
  }
})

test('manual validate success cannot approve an unresolved or illegal classification', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vislexicon-editorial-gate-'))
  const graph = new SiteGraph({ root })
  try {
    graph.ingest({ batchId: 'invalid', rows: [{ url: 'https://example.com' }] })
    let claim = graph.claim({ worker: 'probe', stage: 'probe' })[0]
    graph.settle({ token: claim.token, result: { status: 'success' } })
    claim = graph.claim({ worker: 'explore', stage: 'explore' })[0]
    graph.settle({ token: claim.token, result: { status: 'success' } })
    claim = graph.claim({ worker: 'curate', stage: 'curate' })[0]
    graph.settle({ token: claim.token, result: { curatorId: 'curator', editorial: { name: 'Example', descriptionZh: '尚未解决的入口分类。' }, classification: { recordLevel: 'entry', status: 'needs-review', primaryCategory: 'ai', subcategory: 'other' } } })
    claim = graph.claim({ worker: 'validate', stage: 'validate' })[0]
    graph.settle({ token: claim.token, result: { passed: true } })
    const packet = graph.packet(claim.entryId)
    assert.throws(() => graph.review({ entryId: claim.entryId, reviewer: 'independent', decision: 'approved', packetDigest: packet.packetDigest, checks: ['identity', 'classification', 'proof'], report: {} }), /REVIEW_EDITORIAL_INVALID/)
    const projection = graph.export()
    assert.equal(projection.rows.length, 0)
    assert.ok(projection.held[0].reasons.includes('curate-classification-not-confirmed'))
    assert.ok(projection.held[0].reasons.includes('curate-taxonomy-invalid'))
  } finally { graph.close(); fs.rmSync(root, { recursive: true, force: true }) }
})
