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
  graph.settle({ token: curate.token, result: { editorial: { name: 'Example', descriptionZh: '一个经过真实探索的组件示例站点。' }, classification: { recordLevel: 'entry', status: 'confirmed', primaryCategory: 'ui-implementation', subcategory: 'general-ui-components', alternatives: [], reasons: [{ statement: '提供可嵌入的组件示例。', evidenceUrl: 'https://example.com' }] }, facts: [{ field: 'title', value: 'Example', sourceUrl: 'https://example.com', evidenceIds: [evidence[0].evidenceId] }], curatorId: 'curator-1' } })
  const validate = graph.claim({ worker: 'validator', stage: 'validate' })[0]
  graph.settle({ token: validate.token, result: { stage: 'validate', gate: 'passed', passed: true, issues: [] } })
  const packet = graph.packet(entryId)
  const review = graph.review({ entryId, reviewer: 'reviewer-1', decision: 'approved', packetDigest: packet.packetDigest, checks: ['identity', 'breadth', 'proof'], report: { entryId, decision: 'approved', packetDigest: packet.packetDigest } })
  assert.equal(review.decision, 'approved')
  assert.equal(graph.packet(entryId).packetDigest, packet.packetDigest)
  assert.equal(graph.verify().ok, true)
  const projection = graph.export(path.join(root, 'projection'))
  assert.equal(projection.rows.length, 1)
  assert.equal(projection.held.length, 0)
  const serialized = JSON.stringify(projection.rows[0])
  assert.equal(serialized.includes('evidenceId'), false)
  assert.equal(serialized.includes('graphRef'), false)
  assert.equal(serialized.includes(path.join(root, 'blobs')), false)
}))
