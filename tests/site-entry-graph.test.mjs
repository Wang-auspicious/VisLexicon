import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { probeSource } from '../scripts/site-graph/adapters.mjs'
import { SiteGraph } from '../scripts/site-graph/store.mjs'

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'vislexicon-site-graph-'))
}

function withGraph(fn) {
  const root = tempRoot()
  const graph = new SiteGraph({ root, runId: 'test-run' })
  try { return fn(graph, root) } finally {
    try { graph.close() } finally { fs.rmSync(root, { recursive: true, force: true }) }
  }
}

test('raw observations are conserved and identical batches are idempotent', () => withGraph((graph) => {
  const rows = [{ url: 'https://example.com/#one', title: 'same' }, { url: 'https://example.com/#one', title: 'same' }]
  assert.equal(graph.ingest({ batchId: 'batch-1', sourceId: 'fixture', rows }).length, 2)
  assert.equal(graph.ingest({ batchId: 'batch-1', sourceId: 'fixture', rows }).length, 2)
  assert.throws(() => graph.ingest({ batchId: 'batch-1', sourceId: 'fixture', rows: [{ ...rows[0], title: 'changed' }, rows[1]] }), /BATCH_SNAPSHOT_CONFLICT/)
  assert.equal(graph.status().observations, 2)
  assert.equal(graph.state().observations['obs:batch-1:00000001'].rawUrl, rows[0].url)
  graph.dispose({ observationId: 'obs:batch-1:00000001', disposition: 'duplicate', reason: 'same raw hit retained as occurrence' })
  assert.equal(graph.status().rawSettled, 1)
  assert.equal(graph.verify().ok, true)
}))

test('stale and unknown settlements stay in the audit trail without advancing a stage', () => withGraph((graph) => {
  graph.ingest({ batchId: 'batch-1', rows: [{ url: 'https://example.com' }] })
  const claim = graph.claim({ worker: 'worker-a', stage: 'probe', leaseMs: -1 })[0]
  const late = graph.settle({ token: claim.token, result: {}, retryable: true })
  const unknown = graph.settle({ token: 'missing-token', result: {}, retryable: true })
  assert.equal(late.accepted, false)
  assert.equal(unknown.accepted, false)
  assert.equal(graph.state().lateSettlements.length, 2)
  assert.equal(graph.state().entries[claim.entryId].stages.probe.status, 'pending')
  assert.equal(graph.verify().ok, true)
}))

for (const decision of ['needs-changes', 'rejected']) {
  test(`${decision} preserves failed checks for an incomplete entry without approving it`, () => withGraph((graph, root) => {
    graph.ingest({ batchId: 'negative-review', rows: [{ url: 'https://example.com/incomplete' }] })
    const entryId = graph.state().observations['obs:negative-review:00000001'].entryId
    const packet = graph.packet(entryId)
    const checks = [{ name: 'validation-prerequisite', passed: false }, { name: 'exact-entry-identity', passed: true }, { name: 'original-evidence-incomplete', passed: false }]
    const report = { entryId, decision, packetDigest: packet.packetDigest, checks, notes: 'The missing prerequisites are the reason for this negative review.' }
    assert.throws(() => graph.review({ entryId, reviewer: 'independent-reviewer', decision, packetDigest: '0'.repeat(64), checks, report }), /REVIEW_PACKET_STALE/)
    assert.throws(() => graph.review({ entryId, reviewer: 'independent-reviewer', decision, packetDigest: packet.packetDigest, checks }), /REVIEW_REPORT_REQUIRED/)
    const review = graph.review({ entryId, reviewer: 'independent-reviewer', decision, packetDigest: packet.packetDigest, checks, report })
    assert.deepEqual(review.checks, checks)
    assert.equal(graph.state().entries[entryId].status, 'held')
    assert.equal(graph.state().entries[entryId].stages.review.status, 'blocked')
    assert.equal(graph.state().entries[entryId].stages.validate.status, 'pending')
    assert.deepEqual(graph.state().reviewHistory[0].checks, checks)
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, review.report.ref))).checks, checks)
    assert.equal(graph.export().rows.length, 0)
    assert.equal(graph.verify().ok, true)
  }))
}

test('probe keeps the requested fragment and records a bounded body hash', async () => {
  const result = await probeSource({ url: 'https://example.com/docs#intro' }, {
    maxAttempts: 1,
    resolveHost: async () => [{ address: '93.184.216.34', family: 4 }],
    fetchImpl: async () => new Response('<html><title>Example</title></html>', { status: 200, headers: { 'content-type': 'text/html' } }),
  })
  assert.equal(result.status, 'success')
  assert.equal(result.inputUrl, 'https://example.com/docs#intro')
  assert.match(result.body.sha256, /^[a-f0-9]{64}$/)
  assert.equal(result.requests.length, 1)
})

test('curation imports verify the screenshot bytes before graph persistence', async () => {
  const root = tempRoot()
  const shot = path.join(root, 'identity.png')
  fs.writeFileSync(shot, Buffer.from('real-shot'))
  const { importCurationEvidence } = await import('../scripts/site-graph/adapters.mjs')
  const result = importCurationEvidence({ entryId: 'site-a', capturedAt: '2026-01-01T00:00:00.000Z', pages: [{ role: 'identity', shot: 'identity.png' }] }, { root })
  assert.equal(result.evidence[0].bytes, 9)
  assert.equal(result.pages[0].screenshot.bytes.length, 9)
  fs.rmSync(root, { recursive: true, force: true })
})

test('approved projection requires the full evidence and review gate and strips internal references', () => withGraph((graph, root) => {
  graph.ingest({ batchId: 'batch-1', rows: [{ url: 'https://example.com' }] })
  const entryId = graph.state().observations['obs:batch-1:00000001'].entryId
  const probe = graph.claim({ worker: 'probe', stage: 'probe' })[0]
  graph.settle({ token: probe.token, result: { status: 'success', sourceSnapshot: { requestedUrl: 'https://example.com', finalUrl: 'https://example.com', status: 200 } } })
  const explore = graph.claim({ worker: 'explore', stage: 'explore' })[0]
  const evidence = ['identity', 'breadth', 'proof'].map((role, index) => {
    const blob = graph.putBlob(Buffer.from(`shot-${index}`), { mediaType: 'image/png', sourceUrl: 'https://example.com', role })
    return { evidenceId: `${entryId}-${role}`, role, ref: blob.ref, sha256: blob.sha256, bytes: blob.bytes, mediaType: blob.mediaType, sourceUrl: 'https://example.com', method: 'fixture' }
  })
  graph.settle({ token: explore.token, result: { status: 'success', pages: evidence.map((item) => ({ role: item.role, sourceUrl: item.sourceUrl, title: item.role })), evidence } })
  const curate = graph.claim({ worker: 'curator', stage: 'curate' })[0]
  const sourceEntity = { entityId: 'entity-example', canonicalName: 'Example', nameAliases: [], primaryUrl: 'https://example.com', urlAliases: [], providerType: 'project', status: 'confirmed', revision: 1, identityEvidence: [{ statement: '官网身份页显示项目名称。', evidenceUrl: 'https://example.com', evidenceIds: [evidence[0].evidenceId] }] }
  graph.settle({ token: curate.token, result: { sourceEntity, classificationReadyForReview: true, editorial: { name: 'Example', descriptionZh: '一个经过真实探索的组件示例站点。' }, classification: { entityId: sourceEntity.entityId, recordLevel: 'entry', status: 'needs-review', primaryCategory: 'ui-implementation', subcategory: 'general-ui-components', alternatives: [], reasons: [{ statement: '提供可嵌入的组件示例。', evidenceUrl: 'https://example.com' }] }, facts: [{ field: 'title', value: 'Example', sourceUrl: 'https://example.com', evidenceIds: [evidence[0].evidenceId] }], curatorId: 'curator-1' } })
  const validate = graph.claim({ worker: 'validator', stage: 'validate' })[0]
  graph.settle({ token: validate.token, result: { stage: 'validate', gate: 'passed', passed: true, issues: [] } })
  const packet = graph.packet(entryId)
  assert.throws(() => graph.review({ entryId, reviewer: 'reviewer-1', decision: 'approved', packetDigest: packet.packetDigest, checks: [{ name: 'identity', passed: true }, { name: 'breadth', passed: true }, { name: 'proof', passed: false }], report: { entryId } }), /REVIEW_CHECK_FAILED/)
  assert.equal(graph.state().reviews[entryId], undefined)
  const review = graph.review({ entryId, reviewer: 'reviewer-1', decision: 'approved', packetDigest: packet.packetDigest, checks: ['identity', 'breadth', 'proof'], report: { entryId, decision: 'approved', packetDigest: packet.packetDigest } })
  assert.equal(review.decision, 'approved')
  assert.equal(graph.packet(entryId).packetDigest, packet.packetDigest)
  assert.equal(graph.verify().ok, true)
  const projection = graph.export(path.join(root, 'projection'))
  assert.equal(projection.rows.length, 1)
  assert.equal(projection.held.length, 0)
  assert.equal(projection.rows[0].entityId, sourceEntity.entityId)
  assert.equal(projection.rows[0].classification.status, 'confirmed')
  assert.equal(projection.rows[0].classification.reviewerId, review.reviewer)
  assert.equal(projection.rows[0].classification.confirmedAt, review.reviewedAt)
  const serialized = JSON.stringify(projection.rows[0])
  assert.equal(serialized.includes('evidenceId'), false)
  assert.equal(serialized.includes('graphRef'), false)
  assert.equal(serialized.includes(path.join(root, 'blobs')), false)
  graph._transact((state) => { state.entries[entryId].editorial.descriptionZh = '复核之后被修改的简介。' })
  const stale = graph.export()
  assert.equal(stale.rows.length, 0)
  assert.ok(stale.held[0].reasons.includes('independent-review-digest-stale'))
}))
