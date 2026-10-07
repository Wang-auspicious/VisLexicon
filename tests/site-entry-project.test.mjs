import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { deflateSync } from 'node:zlib'
import { SiteGraph, sha256 } from '../scripts/site-graph/store.mjs'
import { graphSiteBundle, projectApprovedSites } from '../scripts/site-graph/project.mjs'

function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function screenshotFixture(value) {
  const chunk = (type, bytes) => {
    const name = Buffer.from(type), size = Buffer.alloc(4), crc = Buffer.alloc(4)
    size.writeUInt32BE(bytes.length)
    crc.writeUInt32BE(crc32(Buffer.concat([name, bytes])))
    return Buffer.concat([size, name, bytes, crc])
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(640, 0); header.writeUInt32BE(360, 4); header[8] = 8; header[9] = 2
  const pixels = Buffer.alloc((640 * 3 + 1) * 360, value)
  for (let row = 0; row < 360; row++) pixels[row * (640 * 3 + 1)] = 0
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))])
}

function reviewedFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vislexicon-project-'))
  const graph = new SiteGraph({ root: path.join(root, 'graph') })
  graph.ingest({ batchId: 'source', rows: [{ url: 'https://example.com' }] })
  const probe = graph.claim({ worker: 'probe', stage: 'probe' })[0]
  graph.settle({ token: probe.token, result: { status: 'success', checkedAt: '2026-10-07T00:00:00.000Z', sourceSnapshot: { requestedUrl: probe.url, finalUrl: probe.url, status: 200 } } })
  const explore = graph.claim({ worker: 'explore', stage: 'explore' })[0]
  const evidence = ['identity', 'breadth', 'proof'].map((role, index) => {
    const blob = graph.putBlob(screenshotFixture(40 + index * 40), { mediaType: 'image/png' })
    return { ...blob, evidenceId: `shot-${role}`, role, sourceUrl: `https://example.com/${role}`, capturedAt: null }
  })
  graph.settle({ token: explore.token, result: { status: 'success', evidence, pages: evidence.map(shot => ({ role: shot.role, sourceUrl: shot.sourceUrl, title: `Example ${shot.role}`, screenshot: { sha256: shot.sha256 } })) } })
  const sourceEntity = { entityId: 'entity-example', canonicalName: 'Example', nameAliases: [], primaryUrl: 'https://example.com', urlAliases: [], providerType: 'project', status: 'confirmed', revision: 1, identityEvidence: [{ statement: '官网明确显示项目名称。', evidenceUrl: 'https://example.com/identity', evidenceIds: ['shot-identity'] }] }
  const curate = graph.claim({ worker: 'curator', stage: 'curate' })[0]
  graph.settle({ token: curate.token, result: { sourceEntity, classificationReadyForReview: true, curatorId: 'curator', editorial: { name: 'Example', descriptionZh: '可查阅和复制组件示例的界面工具库。' }, classification: { recordLevel: 'entry', entityId: sourceEntity.entityId, status: 'needs-review', primaryCategory: 'ui-implementation', subcategory: 'general-ui-components', alternatives: [], reasons: [{ statement: '提供可复制的界面组件。', evidenceUrl: 'https://example.com/proof' }] }, facts: evidence.map(shot => ({ field: shot.role, value: shot.role, claim: `该 ${shot.role} 页面展示已复核的组件内容。`, sourceUrl: shot.sourceUrl, evidenceIds: [shot.evidenceId] })) } })
  const validate = graph.claim({ worker: 'validator', stage: 'validate' })[0]
  graph.settle({ token: validate.token, result: { passed: true } })
  const packet = graph.packet(probe.entryId)
  graph.review({ entryId: probe.entryId, reviewer: 'independent', decision: 'approved', packetDigest: packet.packetDigest, checks: ['identity', 'breadth', 'proof'], report: { fixture: true } })
  return { root, graph, entryId: probe.entryId, evidence }
}

test('reviewed graph bundles retain original image bytes, unknown dates and the prior record', () => {
  const fixture = reviewedFixture()
  const { root, graph } = fixture
  try {
    const sourceDir = path.join(root, 'approved'), publicDir = path.join(root, 'public')
    fs.mkdirSync(sourceDir)
    const file = path.join(sourceDir, 'example.json')
    const original = Buffer.from(JSON.stringify({ entryId: 'example', status: 'DRAFT', official: { inputUrl: 'https://example.com/' }, editorial: { name: 'Old draft' } }))
    fs.writeFileSync(file, original)
    const options = { sourceDir, publicDir, catalog: [{ entryId: 'example', url: 'https://example.com/' }] }
    const dryRun = projectApprovedSites(graph, options)
    assert.equal(dryRun.prepared.length, 1)
    assert.deepEqual(fs.readFileSync(file), original)
    const applied = projectApprovedSites(graph, { ...options, apply: true })
    assert.equal(applied.held.length, 0)
    assert.equal(applied.prepared[0].replacedExisting, true)
    const bundle = JSON.parse(fs.readFileSync(file))
    assert.equal(bundle.status, 'APPROVED')
    assert.equal(bundle.classification.reviewerId, 'independent')
    assert.equal(bundle.entityId, 'entity-example')
    assert.ok(bundle.facts.every(fact => !Object.hasOwn(fact, 'evidenceIds')))
    for (const page of bundle.pages) {
      assert.equal(page.capturedAt, null)
      const originalShot = fixture.evidence.find(shot => shot.role === page.role)
      const target = path.join(publicDir, page.shot.src.slice(1))
      assert.equal(sha256(fs.readFileSync(target)), originalShot.sha256)
      assert.equal(page.shot.width, 640)
    }
    const backup = path.join(sourceDir, '.graph-revisions', `example-${sha256(original)}.json`)
    assert.deepEqual(fs.readFileSync(backup), original)
    assert.equal(projectApprovedSites(graph, { ...options, apply: true }).prepared[0].changed, false)
  } finally { graph.close(); fs.rmSync(root, { recursive: true, force: true }) }
})

test('projection holds ambiguous handles, stale reviews and changed screenshot files', () => {
  const { root, graph, entryId, evidence } = reviewedFixture()
  try {
    const options = { sourceDir: path.join(root, 'approved'), publicDir: path.join(root, 'public') }
    const conflict = projectApprovedSites(graph, { ...options, catalog: [{ entryId: 'one', url: 'https://example.com/' }, { entryId: 'two', url: 'https://example.com' }] })
    assert.equal(conflict.prepared.length, 0)
    assert.match(conflict.held[0].reason, /HANDLE_AMBIGUOUS/)
    const state = graph.state()
    const value = { entry: state.entries[entryId], sourceEntity: state.entities['entity-example'], review: state.reviews[entryId], packet: { packetDigest: 'stale' }, evidence: Object.values(state.evidence), sourceRoot: graph.root, runId: state.runId }
    assert.throws(() => graphSiteBundle(value), /CURRENT_REVIEW_REQUIRED/)
    fs.writeFileSync(path.join(graph.root, evidence[0].ref), Buffer.from('changed'))
    assert.throws(() => graphSiteBundle({ ...value, packet: graph.packet(entryId) }), /SCREENSHOT_HASH_MISMATCH/)
  } finally { graph.close(); fs.rmSync(root, { recursive: true, force: true }) }
})

test('an explicit exact-URL decision retains the published handle and preserves the duplicate bytes', () => {
  const { root, graph } = reviewedFixture()
  try {
    const sourceDir = path.join(root, 'approved'), publicDir = path.join(root, 'public')
    fs.mkdirSync(sourceDir)
    const recordHashes = {}
    for (const id of ['published', 'alias']) {
      const bytes = Buffer.from(JSON.stringify({ entryId: id, status: 'DRAFT', official: { inputUrl: 'https://example.com/' } }))
      recordHashes[id] = sha256(bytes)
      fs.writeFileSync(path.join(sourceDir, `${id}.json`), bytes)
    }
    const decision = { entryId: 'published', handles: ['alias', 'published'], actor: 'identity-reviewer', reason: 'Exactly the same official entry URL; retain the established public handle.', recordHashes }
    const options = { sourceDir, publicDir, handleDecisions: { 'https://example.com': decision } }
    const stale = projectApprovedSites(graph, { ...options, handleDecisions: { 'https://example.com': { ...decision, recordHashes: {} } }, apply: true })
    assert.equal(stale.prepared.length, 0)
    assert.match(stale.held[0].reason, /DECISION_STALE/)
    const applied = projectApprovedSites(graph, { ...options, apply: true })
    assert.equal(applied.prepared[0].entryId, 'published')
    const alias = JSON.parse(fs.readFileSync(path.join(sourceDir, 'alias.json')))
    assert.equal(alias.status, 'QUARANTINED')
    assert.equal(alias.identityDisposition.canonicalEntryId, 'published')
    assert.equal(sha256(fs.readFileSync(path.join(sourceDir, '.graph-revisions', `alias-${recordHashes.alias}.json`))), recordHashes.alias)
    const repeated = projectApprovedSites(graph, { ...options, apply: true })
    assert.equal(repeated.prepared[0].changed, false)
    assert.equal(repeated.held.length, 0)
  } finally { graph.close(); fs.rmSync(root, { recursive: true, force: true }) }
})
