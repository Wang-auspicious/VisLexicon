import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import test from 'node:test'

import { buildCurationPublic } from '../scripts/build-curation-public.mjs'

const DESCRIPTION = '该入口将可组合的设计令牌、组件示例与直接可复制的实现文档集中呈现，官方页面同时提供完整范围、使用方式与源码证据，便于设计师和开发者评估并安全复用。'

function validBundle({ entryId = 'fixture-ui', entityId = 'fixture-entity' } = {}) {
  return {
    schemaVersion: 3,
    entryId,
    entityId,
    attemptId: `attempt-${entryId}`,
    status: 'APPROVED',
    official: {
      inputUrl: 'https://fixture.example/',
      finalUrl: 'https://fixture.example/',
      checkedAt: '2026-09-02T00:00:00.000Z',
    },
    editorial: {
      name: 'Fixture UI',
      descriptionZh: DESCRIPTION,
      pricing: 'Free · Open source',
    },
    classification: {
      recordLevel: 'entry',
      entityId,
      primaryCategory: 'ui-implementation',
      subcategory: 'general-ui-components',
      status: 'confirmed',
      alternatives: [],
      reasons: [{
        statement: '官方页面展示可直接预览并复用的界面组件实现。',
        evidenceUrl: 'https://fixture.example/components',
      }],
      curatorId: 'fixture-curator',
      reviewerId: 'fixture-reviewer',
      confirmedAt: '2026-09-02T00:00:00.000Z',
    },
    facets: {
      scenarios: [],
      deliverables: ['component'],
      actions: ['preview', 'copy'],
      media: ['ui'],
      platforms: ['web'],
      technologies: ['react'],
      workflowStages: ['design', 'build'],
      audiences: ['designer', 'developer'],
      access: ['open-source'],
      licenses: ['MIT'],
      contentOrganization: ['component-registry'],
      languages: ['en'],
    },
    pages: ['identity', 'breadth', 'proof'].map((role, index) => ({
      role,
      sourceUrl: `https://fixture.example/${role}`,
      finalUrl: `https://fixture.example/${role}`,
      title: `Fixture ${role}`,
      selectionRationale: `该页面展示 ${role} 证据与可复用内容。`,
      shot: {
        src: `/shots/${entryId}/${role}.png`,
        sha256: String(index + 1).repeat(64),
        width: 1280,
        height: 900,
        bytes: 21001 + index,
        alt: `Fixture ${role} screenshot`,
      },
    })),
    facts: [{
      field: 'license',
      value: 'MIT',
      sourceUrl: 'https://github.com/fixture/ui/blob/main/LICENSE',
      evidence: '官方仓库许可证文件标明 MIT。',
      confidence: 1,
    }, {
      field: 'repository',
      value: 'https://github.com/fixture/ui',
      sourceUrl: 'https://fixture.example/',
      evidence: '官网链接到官方仓库。',
    }],
    qa: {
      curatorId: 'fixture-curator',
      technicalPassed: true,
      semanticReviewerId: 'fixture-reviewer',
      semanticPassed: true,
      editorialReviewerId: 'fixture-editor',
    },
  }
}

async function scratch(t) {
  const root = await mkdtemp(join(tmpdir(), 'vislexicon-publisher-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return root
}

test('publishes only approved v3 bundles and writes immutable revision files before manifest', async (t) => {
  const root = await scratch(t)
  const approvedDir = join(root, 'approved-v3')
  const outputDir = join(root, 'public', 'data', 'curation')
  await mkdir(approvedDir, { recursive: true })
  await writeFile(join(approvedDir, 'fixture-ui.json'), JSON.stringify(validBundle()))
  await writeFile(join(approvedDir, 'quarantined.json'), JSON.stringify({
    ...validBundle({ entryId: 'quarantined-ui', entityId: 'quarantined-entity' }),
    status: 'QUARANTINED',
  }))

  const result = await buildCurationPublic({
    approvedDir,
    outputDir,
    candidateCatalog: {
      entries: [{
        id: 'candidate-1',
        name: 'Candidate',
        canonicalUrl: 'https://candidate.example',
        sourceEvidence: [{
          sourceId: 'fixture-source',
          listingUrl: 'https://directory.example',
          originalUrl: 'https://candidate.example/?utm_source=x',
        }],
      }],
    },
  })

  assert.equal(result.index.entries.length, 1)
  assert.equal(result.index.entries[0].id, 'fixture-ui')
  assert.match(result.manifest.indexUrl, /site-index\.[a-f0-9]{12}\.json$/u)
  assert.match(result.manifest.resolverUrl, /resolver\.[a-f0-9]{12}\.json$/u)
  assert.ok(await readFile(join(outputDir, basename(result.manifest.indexUrl))))
  assert.ok(await readFile(join(outputDir, basename(result.manifest.resolverUrl))))
  assert.equal(result.resolver.rows.some((row) => row.status === 'candidate'), true)
  assert.equal(result.manifest.publishedCount, 1)
})

test('rerunning with the same inputs is byte deterministic and does not overwrite an immutable revision', async (t) => {
  const root = await scratch(t)
  const approvedDir = join(root, 'approved-v3')
  const outputDir = join(root, 'public', 'data', 'curation')
  await mkdir(approvedDir, { recursive: true })
  await writeFile(join(approvedDir, 'fixture-ui.json'), JSON.stringify(validBundle()))
  const first = await buildCurationPublic({ approvedDir, outputDir, candidateCatalog: [] })
  const second = await buildCurationPublic({ approvedDir, outputDir, candidateCatalog: [] })
  assert.equal(second.revision, first.revision)
  assert.deepEqual(second.manifest, first.manifest)
  assert.deepEqual(
    await readFile(join(outputDir, basename(first.manifest.indexUrl))),
    await readFile(join(outputDir, basename(second.manifest.indexUrl))),
  )
})
