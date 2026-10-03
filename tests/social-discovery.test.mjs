import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  buildDiscoveryRun,
  buildIdentityIndex,
  normalizePost,
  persistRun,
  promotionSignal,
  verifyRun,
} from '../scripts/social-discovery.mjs'

test('normalizes X and XHS rows while removing token-bearing social URLs from safe fields', () => {
  const x = normalizePost({
    id: '123', author: 'designer', text: '收藏这些设计网站 https://t.co/example', url: 'https://x.com/i/status/123',
  }, { id: 'x-seed', platform: 'x', query: 'design tools' })
  assert.equal(x.platform, 'x')
  assert.equal(x.nativeId, '123')
  assert.equal(x.postUrl, 'https://x.com/i/status/123')
  assert.equal(x.extractedUrls[0].rawUrl, 'https://t.co/example')

  const xhs = normalizePost({
    nativeId: 'abc123', author: '设计师', title: '设计灵感网站',
    observedCanonicalHref: 'https://www.xiaohongshu.com/search_result/abc123?xsec_token=secret&xsec_source=pc_search',
  }, { id: 'xhs-seed', platform: 'xiaohongshu', query: '设计网站' })
  assert.equal(xhs.postUrl, 'https://www.xiaohongshu.com/explore/abc123')
  assert.equal(xhs.observationKey, 'xiaohongshu:abc123')
})

test('promotion signal recognizes multi-link design recommendations but keeps weak mentions below the gate', () => {
  const strong = promotionSignal({ title: 'Design resources', text: 'Bookmark these UI resources and design tools', extractedUrls: [{}, {}, {}] })
  assert.equal(strong.promotional, true)
  assert.ok(strong.score >= 0.28)
  const weak = promotionSignal({ title: 'My project', text: 'A new landing page', extractedUrls: [{}] })
  assert.equal(weak.promotional, false)
  const genericMultiLink = promotionSignal({ title: 'Jobs', text: 'Open roles and hiring updates', extractedUrls: [{}, {}, {}] })
  assert.equal(genericMultiLink.promotional, false)
})

test('same normalized URL is a duplicate, same origin is review-only, and new links become candidates', async () => {
  const catalog = buildIdentityIndex([{ file: 'catalog.json', value: { entries: [{ id: 'known', canonicalUrl: 'https://known.example' }] } }])
  assert.equal(catalog.exact.has('https://known.example'), true)
  const run = await buildDiscoveryRun({
    rows: [
      { id: '1', author: 'a', text: '设计网站 https://new.example/a https://new.example/a https://known.example', url: 'https://x.com/i/status/1' },
      { id: '1', author: 'a', text: '设计网站 https://new.example/a', url: 'https://x.com/i/status/1' },
      { id: '2', author: 'b', text: '设计网站 https://known.example/other', url: 'https://x.com/i/status/2' },
    ],
    source: { id: 'fixture', platform: 'x', query: 'design tools' },
    catalogValues: [{ file: 'catalog.json', value: { entries: [{ id: 'known', canonicalUrl: 'https://known.example' }] } }],
    runId: 'fixture-run',
  })
  const dispositions = run.linkDispositions.map((row) => row.disposition)
  assert.ok(dispositions.includes('new-candidate'))
  assert.ok(dispositions.includes('duplicate-link'))
  assert.ok(dispositions.includes('known-alias'))
  assert.ok(dispositions.includes('suspected-duplicate'))
  assert.equal(run.summary.rawHitCount, 3)
  assert.equal(run.summary.postDispositionCount, 3)
  assert.equal(verifyRun(run).ok, true)
})

test('run persistence keeps raw, disposition and candidate files auditable', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vislexicon-social-'))
  try {
    const run = await buildDiscoveryRun({
      rows: [{ id: '1', author: 'a', text: '推荐这些设计网站 https://example.com https://example.org', url: 'https://x.com/i/status/1' }],
      source: { id: 'fixture', platform: 'x' },
      runId: 'persist-fixture',
    })
    const directory = persistRun(run, { runtimeRoot: root })
    const raw = await readFile(join(directory, 'raw-observations.jsonl'), 'utf8')
    const candidates = JSON.parse(await readFile(join(directory, 'candidates.json'), 'utf8'))
    assert.equal(raw.trim().split(/\n/u).length, 1)
    assert.equal(candidates.publish, false)
    assert.equal(candidates.candidates[0].classification.status, 'needs-review')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

