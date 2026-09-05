import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { EventEmitter } from 'node:events'
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { deflateSync } from 'node:zlib'

import {
  CURATION_SUBCATEGORIES,
} from '../src/data/curation-taxonomy-v2-legacy.js'
import { CURATED_SITES } from '../src/data/curated-sites.js'
import { evidenceBundleErrors } from '../src/lib/curation-evidence.js'

const DEMO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const EXPECTED_SITE_IDS = [
  'magic-ui',
  'origin-ui',
  'hover-dev',
  'shadcn-ui',
  'uiverse',
  '21st-dev',
]
const REJECTED_SITE_IDS = ['aceternity-ui', 'animata']
const EXPECTED_PAGE_ROLES = ['identity', 'breadth', 'proof']
const EXPECTED_SUBCATEGORIES = {
  'magic-ui': 'marketing-sections',
  'origin-ui': 'application-dashboard-ui',
  'hover-dev': 'motion-interaction-code',
  'shadcn-ui': 'design-system-primitives',
  uiverse: 'ui-components-general',
  '21st-dev': 'ui-components-general',
}
const OPEN_SOURCE_SITE_IDS = new Set([
  'magic-ui',
  'origin-ui',
  'shadcn-ui',
  'uiverse',
])
const MIGRATED_MAGIC_UI_DESCRIPTION = '面向营销官网的动效组件库，提供 150+ 个可复制的 React + Tailwind 组件，覆盖 Bento、Aurora、Marquee 与粒子效果。文档包含实时预览和一键 npx 安装命令，便于快速搭建高视觉冲击的落地页。'
const EXPECTED_QA = {
  curatorId: 'capture-tool-v2',
  technicalPassed: true,
  semanticReviewerId: 'root-contact-sheet-review-20260901',
  semanticPassed: true,
}

function normalizeLegacyTag(value) {
  return value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/&/gu, ' and ')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
}

function expectedTags(site) {
  const tags = []
  const seen = new Set()
  for (const value of [...site.stacks, ...site.themes]) {
    const tag = normalizeLegacyTag(value)
    if (!tag || seen.has(tag)) continue
    seen.add(tag)
    tags.push(tag)
  }
  if (OPEN_SOURCE_SITE_IDS.has(site.id)) tags.push('open-source')
  return tags
}

function expectedQueueOrder() {
  return Object.entries(CURATION_SUBCATEGORIES).flatMap(
    ([essenceId, records]) => records.map(({ id: subcategoryId }) => ({
      essenceId,
      subcategoryId,
    })),
  )
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function makeScratch(t) {
  const root = await mkdtemp(join(tmpdir(), 'vislexicon-curation-migration-'))
  t.after(async () => {
    await rm(root, { force: true, recursive: true })
  })
  return root
}

async function copyApprovedShots(publicRoot) {
  for (const siteId of EXPECTED_SITE_IDS) {
    for (const role of EXPECTED_PAGE_ROLES) {
      const relativePath = `shots/${siteId}/v2-${role}.png`
      const sourcePath = join(DEMO_ROOT, 'public', relativePath)
      const destinationPath = join(publicRoot, relativePath)
      await mkdir(dirname(destinationPath), { recursive: true })
      await copyFile(sourcePath, destinationPath)
    }
  }
}

async function outputSnapshot(approvedDir, queuePath) {
  const snapshot = new Map()
  for (const siteId of EXPECTED_SITE_IDS) {
    const filePath = join(approvedDir, `${siteId}.json`)
    snapshot.set(filePath, await readFile(filePath))
  }
  snapshot.set(queuePath, await readFile(queuePath))
  return snapshot
}

function completeJpeg(width = 1280, height = 900) {
  const buffer = Buffer.from([
    0xff, 0xd8,
    0xff, 0xc0, 0x00, 0x0b, 0x08,
    0x00, 0x00,
    0x00, 0x00,
    0x01, 0x01, 0x11, 0x00,
    0xff, 0xda, 0x00, 0x08,
    0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
    0x11, 0x22, 0xff, 0x00, 0x33,
    0xff, 0xd9,
  ])
  buffer.writeUInt16BE(height, 7)
  buffer.writeUInt16BE(width, 9)
  return buffer
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunkRecord(buffer, expectedType) {
  let offset = 8
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    const dataOffset = offset + 8
    const dataEnd = dataOffset + length
    if (type === expectedType) {
      return { crcOffset: dataEnd, dataEnd, dataOffset, length, offset, type }
    }
    offset = dataEnd + 4
  }
  throw new Error(`missing PNG chunk ${expectedType}`)
}

function rewritePngChunkCrc(buffer, chunk) {
  buffer.writeUInt32BE(
    crc32(buffer.subarray(chunk.offset + 4, chunk.dataEnd)),
    chunk.crcOffset,
  )
}

function pngChunkBytes(type, data) {
  const chunk = Buffer.alloc(12 + data.length)
  chunk.writeUInt32BE(data.length, 0)
  chunk.write(type, 4, 'ascii')
  data.copy(chunk, 8)
  rewritePngChunkCrc(chunk, {
    crcOffset: 8 + data.length,
    dataEnd: 8 + data.length,
    offset: 0,
  })
  return chunk
}

function grayscalePng(width, height, raw, ancillaryChunks = []) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr.set([8, 0, 0, 0, 0], 8)
  return Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    pngChunkBytes('IHDR', ihdr),
    ...ancillaryChunks,
    pngChunkBytes('IDAT', deflateSync(raw)),
    pngChunkBytes('IEND', Buffer.alloc(0)),
  ])
}

function vp8xOnlyWebp(width = 1280, height = 900) {
  const webp = Buffer.alloc(30)
  webp.write('RIFF', 0, 'ascii')
  webp.writeUInt32LE(22, 4)
  webp.write('WEBPVP8X', 8, 'ascii')
  webp.writeUInt32LE(10, 16)
  webp.writeUIntLE(width - 1, 24, 3)
  webp.writeUIntLE(height - 1, 27, 3)
  return webp
}

function webpChunk(type, data) {
  const chunk = Buffer.alloc(8 + data.length + (data.length % 2))
  chunk.write(type, 0, 'ascii')
  chunk.writeUInt32LE(data.length, 4)
  data.copy(chunk, 8)
  return chunk
}

function animatedWebp() {
  const knownValidVp8 = Buffer.from(
    'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
    'base64',
  ).subarray(20)
  const vp8x = Buffer.alloc(10)
  vp8x[0] = 0x02
  const animationHeader = Buffer.alloc(6)
  const frameHeader = Buffer.alloc(16)
  frameHeader.writeUIntLE(1, 12, 3)
  const frame = Buffer.concat([
    frameHeader,
    webpChunk('VP8 ', knownValidVp8),
  ])
  const payload = Buffer.concat([
    Buffer.from('WEBP', 'ascii'),
    webpChunk('VP8X', vp8x),
    webpChunk('ANIM', animationHeader),
    webpChunk('ANMF', frame),
  ])
  const header = Buffer.alloc(8)
  header.write('RIFF', 0, 'ascii')
  header.writeUInt32LE(payload.length, 4)
  return Buffer.concat([header, payload])
}

function transactionOwner(lockPath, runId, targetPaths) {
  return {
    schemaVersion: 1,
    kind: 'VISLEXICON_CURATION_OWNER',
    runId,
    pid: 999,
    startedAt: '2026-09-01T00:00:00.000Z',
    journalPrefix: `journal.${runId}.`,
    lockPath,
    targets: targetPaths,
  }
}

function transactionSnapshot({ owner, operations, seq, state }) {
  const body = {
    schemaVersion: 1,
    runId: owner.runId,
    seq,
    state,
    decision: state === 'COMMITTED' ? 'COMMITTED' : 'PRE_COMMIT',
    owner: {
      pid: owner.pid,
      startedAt: owner.startedAt,
    },
    operations,
    errors: [],
  }
  return {
    ...body,
    checksum: createHash('sha256').update(JSON.stringify(body)).digest('hex'),
  }
}

function transactionJournalPath(lockPath, runId, seq) {
  return join(
    dirname(lockPath),
    `journal.${runId}.${String(seq).padStart(8, '0')}.json`,
  )
}

function transactionOperation(target, runId, index, overrides = {}) {
  const targetName = basename(target.targetPath)
  const parent = dirname(target.targetPath)
  return {
    index,
    kind: target.kind,
    targetPath: target.targetPath,
    tempPath: join(parent, `${targetName}.vislexicon-v2.${runId}.${index}.tmp`),
    backupPath: join(parent, `${targetName}.vislexicon-v2.${runId}.${index}.bak`),
    existed: true,
    backupActive: true,
    published: true,
    operation: 'PUBLISHED',
    expectedSha256: createHash('sha256').update(target.bytes).digest('hex'),
    expectedBytes: target.bytes.length,
    ...overrides,
  }
}

function memoryTransactionFs(files) {
  return {
    access: async (path) => {
      if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
    },
    mkdir: async () => {},
    open: async (path, flags) => {
      if (flags === 'wx' && files.has(path)) {
        throw Object.assign(new Error('exists'), { code: 'EEXIST' })
      }
      files.set(path, Buffer.alloc(0))
      return {
        async write(buffer, offset, length, position) {
          const current = files.get(path)
          const next = Buffer.alloc(Math.max(current.length, position + length))
          current.copy(next)
          buffer.copy(next, position, offset, offset + length)
          files.set(path, next)
          return { bytesWritten: length }
        },
        async truncate(length) {
          files.set(path, files.get(path).subarray(0, length))
        },
        async sync() {},
        async close() {},
      }
    },
    readFile: async (path) => {
      if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
      return Buffer.from(files.get(path))
    },
    readdir: async (path) => [...files.keys()]
      .filter((filePath) => dirname(filePath) === path)
      .map((filePath) => basename(filePath)),
    realpath: async (path) => resolve(path),
    rename: async (from, to) => {
      if (!files.has(from)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
      files.set(to, files.get(from))
      files.delete(from)
    },
    rm: async (path) => {
      files.delete(path)
    },
    stat: async (path) => {
      if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
      return { dev: 1, ino: path, size: files.get(path).length }
    },
  }
}

test('migrates only the six human-approved sites into stable validated v2 bundles and a real queue skeleton', async (t) => {
  const [{ migrateCuratedSitesV2 }, { readImageMetadata }] = await Promise.all([
    import('../scripts/migrate-curated-sites-v2.mjs'),
    import('../scripts/curation/image-metadata.mjs'),
  ])
  const scratchRoot = await makeScratch(t)
  const publicRoot = join(scratchRoot, 'public-without-legacy-catalog')
  const approvedDir = join(scratchRoot, 'data', 'curation', 'approved')
  const queuePath = join(scratchRoot, 'data', 'curation', 'work-queue.json')
  const stagingDir = join(scratchRoot, 'migration-staging')
  await copyApprovedShots(publicRoot)
  await mkdir(approvedDir, { recursive: true })

  const unrelatedPath = join(approvedDir, 'keep-me.json')
  const rejectedPath = join(approvedDir, 'aceternity-ui.json')
  await writeFile(unrelatedPath, '{"owner":"other-script"}\n')
  await writeFile(rejectedPath, '{"status":"REJECTED"}\n')
  await writeFile(join(approvedDir, 'magic-ui.json'), '{"stale":true}\n')

  const firstResult = await migrateCuratedSitesV2({
    approvedDir,
    publicRoot,
    queuePath,
    stagingDir,
  })

  assert.deepEqual(firstResult.siteIds, EXPECTED_SITE_IDS)
  assert.equal(await readFile(unrelatedPath, 'utf8'), '{"owner":"other-script"}\n')
  assert.equal(await readFile(rejectedPath, 'utf8'), '{"status":"REJECTED"}\n')

  const approvedNames = (await readdir(approvedDir)).sort()
  assert.deepEqual(
    approvedNames,
    [...EXPECTED_SITE_IDS.map((siteId) => `${siteId}.json`), 'aceternity-ui.json', 'keep-me.json'].sort(),
  )

  const sourceSites = new Map(CURATED_SITES.map((site) => [site.id, site]))
  const captureReview = await readJson(join(
    DEMO_ROOT,
    'data',
    'curation',
    'reviewed-capture-v2.json',
  ))
  const reviewSites = new Map(captureReview.sites.map((site) => [site.siteId, site]))
  const allHashes = new Set()
  const firstAttemptIds = new Map()

  for (const siteId of EXPECTED_SITE_IDS) {
    const sourceSite = sourceSites.get(siteId)
    const reviewSite = reviewSites.get(siteId)
    const bundle = await readJson(join(approvedDir, `${siteId}.json`))
    assert.deepEqual(evidenceBundleErrors(bundle), [], `${siteId} must satisfy the v2 validator`)
    assert.equal(bundle.schemaVersion, 2)
    assert.equal(bundle.siteId, siteId)
    assert.ok(bundle.entityKey.startsWith(`${siteId}:`))
    assert.ok(bundle.attemptId.includes(siteId))
    assert.equal(bundle.status, 'APPROVED')
    assert.equal(bundle.official.inputUrl, sourceSite.site)
    assert.equal(bundle.official.finalUrl, reviewSite.official.finalUrl)
    assert.equal(bundle.official.checkedAt, reviewSite.official.checkedAt)
    assert.equal(bundle.curation.resourceEssence, 'reusable-implementation')
    assert.equal(bundle.curation.subcategory, EXPECTED_SUBCATEGORIES[siteId])
    assert.equal(bundle.curation.score, 90)
    assert.deepEqual(bundle.curation.tags, expectedTags(sourceSite))
    assert.equal(
      new Set(bundle.curation.tags.map((tag) => tag.toLowerCase())).size,
      bundle.curation.tags.length,
    )
    assert.ok([...bundle.curation.descriptionZh.trim()].length >= 60)
    assert.ok([...bundle.curation.descriptionZh.trim()].length <= 120)
    assert.equal(
      bundle.curation.descriptionZh,
      siteId === 'magic-ui' ? MIGRATED_MAGIC_UI_DESCRIPTION : sourceSite.about,
    )
    firstAttemptIds.set(siteId, bundle.attemptId)

    assert.deepEqual(bundle.pages.map(({ role }) => role), EXPECTED_PAGE_ROLES)
    assert.equal(new Set(bundle.pages.map(({ selectionRationale }) => selectionRationale.trim())).size, 3)

    for (let index = 0; index < bundle.pages.length; index += 1) {
      const page = bundle.pages[index]
      const sourcePage = sourceSite.shots[index]
      const reviewedPage = reviewSite.pages[index]
      const expectedShotSrc = `/shots/${siteId}/v2-${page.role}.png`
      assert.equal(page.sourceUrl, sourcePage.sourceUrl)
      assert.equal(page.finalUrl, reviewedPage.finalUrl)
      assert.ok(page.title.trim().length > 0)
      assert.ok([...page.selectionRationale.trim()].length >= 12)
      assert.equal(page.shot.src, expectedShotSrc)
      assert.equal(page.shot.alt, sourcePage.alt)

      const imagePath = join(publicRoot, expectedShotSrc.replace(/^\//u, ''))
      const metadata = await readImageMetadata(imagePath)
      const imageBytes = await readFile(imagePath)
      const imageStats = await stat(imagePath)
      assert.equal(metadata.sha256, createHash('sha256').update(imageBytes).digest('hex'))
      assert.equal(metadata.bytes, imageStats.size)
      assert.equal(metadata.verification, 'decoded')
      assert.equal(metadata.bytes, imageBytes.length)
      assert.equal(page.shot.sha256, metadata.sha256)
      assert.equal(page.shot.width, metadata.width)
      assert.equal(page.shot.height, metadata.height)
      assert.equal(page.shot.bytes, metadata.bytes)
      assert.equal(page.shot.bytes, imageBytes.length)
      assert.equal(page.shot.bytes, imageStats.size)
      assert.ok(metadata.width >= 1280)
      assert.ok(metadata.height >= 900)
      assert.ok(page.shot.bytes > 20_000)
      assert.equal(allHashes.has(metadata.sha256), false, `${expectedShotSrc} must have unique bytes`)
      allHashes.add(metadata.sha256)
    }

    const author = bundle.facts.find(({ field }) => field === 'author')
    assert.equal(author.value, sourceSite.author)
    assert.equal(author.sourceUrl, sourceSite.site)
    const repository = bundle.facts.find(({ field }) => field === 'repository')
    if (sourceSite.repo) {
      assert.equal(repository.value, `https://github.com/${sourceSite.repo}`)
    } else {
      assert.equal(repository, undefined)
    }
    const license = bundle.facts.find(({ field }) => field === 'license')
    assert.equal(Boolean(license), OPEN_SOURCE_SITE_IDS.has(siteId))
    assert.equal(bundle.curation.tags.includes('open-source'), OPEN_SOURCE_SITE_IDS.has(siteId))
    assert.deepEqual(bundle.qa, EXPECTED_QA)
  }

  assert.equal(allHashes.size, EXPECTED_SITE_IDS.length * 3)
  for (const rejectedId of REJECTED_SITE_IDS) {
    assert.equal(sourceSites.has(rejectedId), false)
    assert.equal(firstResult.siteIds.includes(rejectedId), false)
  }

  const queue = await readJson(queuePath)
  const expectedOrder = expectedQueueOrder()
  assert.equal(queue.schemaVersion, 1)
  assert.equal(queue.revision, 'curation-work-queue-20260901')
  assert.equal(queue.activeEssence, 'reusable-implementation')
  assert.equal(queue.activeSubcategory, 'agent-ai-ui')
  assert.equal(queue.tasks.length, EXPECTED_SITE_IDS.length)
  for (const siteId of EXPECTED_SITE_IDS) {
    const bundle = await readJson(join(approvedDir, `${siteId}.json`))
    assert.deepEqual(
      queue.tasks.find(({ entityId }) => entityId === bundle.entityKey),
      {
        taskId: `legacy-approved-${siteId}-20260901`,
        entityId: bundle.entityKey,
        subcategoryId: bundle.curation.subcategory,
        status: 'APPROVED',
      },
    )
  }
  assert.equal(queue.subcategories.length, 59)
  assert.deepEqual(
    queue.subcategories.map(({ essenceId, subcategoryId }) => ({ essenceId, subcategoryId })),
    expectedOrder,
  )
  for (const subcategory of queue.subcategories) {
    assert.equal(
      subcategory.state,
      subcategory.subcategoryId === 'agent-ai-ui' ? 'READY' : 'NOT_STARTED',
    )
    assert.equal(subcategory.assignedCount, 0)
    const expectedApproved = {
      'ui-components-general': 2,
      'marketing-sections': 1,
      'application-dashboard-ui': 1,
      'motion-interaction-code': 1,
      'design-system-primitives': 1,
    }[subcategory.subcategoryId] ?? 0
    assert.equal(subcategory.approvedCount, expectedApproved)
  }

  const firstBytes = await outputSnapshot(approvedDir, queuePath)
  const secondResult = await migrateCuratedSitesV2({
    approvedDir,
    publicRoot,
    queuePath,
    stagingDir,
  })
  const secondBytes = await outputSnapshot(approvedDir, queuePath)
  assert.deepEqual(secondResult.siteIds, EXPECTED_SITE_IDS)
  assert.deepEqual(secondBytes, firstBytes)
  for (const siteId of EXPECTED_SITE_IDS) {
    const bundle = await readJson(join(approvedDir, `${siteId}.json`))
    assert.equal(bundle.attemptId, firstAttemptIds.get(siteId))
  }
})

test('validates every bundle before replacing any existing output', async (t) => {
  const { migrateCuratedSitesV2 } = await import('../scripts/migrate-curated-sites-v2.mjs')
  const scratchRoot = await makeScratch(t)
  const approvedDir = join(scratchRoot, 'approved')
  const queuePath = join(scratchRoot, 'work-queue.json')
  const stagingDir = join(scratchRoot, 'staging')
  const existingApproved = join(approvedDir, 'magic-ui.json')
  await mkdir(approvedDir, { recursive: true })
  await writeFile(existingApproved, '{"must":"survive"}\n')
  await writeFile(queuePath, '{"must":"also survive"}\n')

  const invalidSites = structuredClone(CURATED_SITES)
  invalidSites[1].about = '描述太短'

  await assert.rejects(
    migrateCuratedSitesV2({
      approvedDir,
      curatedSites: invalidSites,
      publicRoot: join(DEMO_ROOT, 'public'),
      queuePath,
      stagingDir,
    }),
    /source fingerprint mismatch.*origin-ui/isu,
  )
  assert.equal(await readFile(existingApproved, 'utf8'), '{"must":"survive"}\n')
  assert.equal(await readFile(queuePath, 'utf8'), '{"must":"also survive"}\n')
  assert.deepEqual(await readdir(approvedDir), ['magic-ui.json'])
})

test('locks approval to reviewed legacy source fingerprints', async (t) => {
  const {
    migrateCuratedSitesV2,
    sourceRecordFingerprint,
    validateReviewedProvenance,
  } = await import('../scripts/migrate-curated-sites-v2.mjs')
  assert.equal(typeof sourceRecordFingerprint, 'function')
  assert.equal(typeof validateReviewedProvenance, 'function')
  const reviewManifest = await readJson(join(
    DEMO_ROOT,
    'data',
    'curation',
    'reviewed-capture-v2.json',
  ))
  assert.equal(validateReviewedProvenance(CURATED_SITES, reviewManifest).sites.length, 6)

  const mutations = [
    ['author', (sites) => { sites[0].author = 'Unreviewed Author' }],
    ['about', (sites) => { sites[1].about = `${sites[1].about} 未复核变更` }],
    ['shot path', (sites) => { sites[2].shots[0].src = '/shots/changed.png' }],
    ['shot URL', (sites) => { sites[3].shots[1].sourceUrl = 'https://example.com/changed' }],
  ]
  for (const [label, mutate] of mutations) {
    const scratchRoot = await makeScratch(t)
    const sites = structuredClone(CURATED_SITES)
    mutate(sites)
    await assert.rejects(
      migrateCuratedSitesV2({
        approvedDir: join(scratchRoot, 'approved'),
        captureReviewManifest: reviewManifest,
        curatedSites: sites,
        publicRoot: join(DEMO_ROOT, 'public'),
        queuePath: join(scratchRoot, 'work-queue.json'),
      }),
      new RegExp(`source fingerprint.*${sites.find((site, index) => sourceRecordFingerprint(site) !== sourceRecordFingerprint(CURATED_SITES[index]))?.id ?? ''}|${label}`, 'iu'),
    )
  }
})

test('rejects any capture ledger hash, final URL, or independent reviewer change', async (t) => {
  const { migrateCuratedSitesV2 } = await import('../scripts/migrate-curated-sites-v2.mjs')
  const committed = await readJson(join(
    DEMO_ROOT,
    'data',
    'curation',
    'reviewed-capture-v2.json',
  ))
  const mutations = [
    (manifest) => { manifest.sites[0].pages[0].sha256 = '0'.repeat(64) },
    (manifest) => { manifest.sites[1].pages[1].finalUrl = 'https://example.com/changed' },
    (manifest) => { manifest.visualReviewerId = 'capture-tool-v2' },
  ]
  for (const mutate of mutations) {
    const scratchRoot = await makeScratch(t)
    const manifest = structuredClone(committed)
    mutate(manifest)
    await assert.rejects(
      migrateCuratedSitesV2({
        approvedDir: join(scratchRoot, 'approved'),
        captureReviewManifest: manifest,
        publicRoot: join(DEMO_ROOT, 'public'),
        queuePath: join(scratchRoot, 'work-queue.json'),
      }),
      /capture review manifest fingerprint|capture review.*mismatch|independent visual reviewer/iu,
    )
  }
})

test('semantic contract fingerprint locks descriptions, categories, rationales, licenses, QA, and score policy', async (t) => {
  const {
    migrateCuratedSitesV2,
    reviewedSemanticContract,
    semanticContractFingerprint,
  } = await import('../scripts/migrate-curated-sites-v2.mjs')
  assert.equal(typeof reviewedSemanticContract, 'function')
  assert.equal(typeof semanticContractFingerprint, 'function')
  const committed = await readJson(join(
    DEMO_ROOT,
    'data',
    'curation',
    'reviewed-capture-v2.json',
  ))
  const contract = reviewedSemanticContract()
  assert.equal(
    committed.semanticContractFingerprint,
    semanticContractFingerprint(contract),
  )

  const mutations = [
    (value) => { value.sites['magic-ui'].descriptionZh += ' changed' },
    (value) => { value.sites['origin-ui'].subcategory = 'ui-components-general' },
    (value) => { value.sites['hover-dev'].rationales[0] += ' changed' },
    (value) => { value.sites['shadcn-ui'].license.value = 'Changed license' },
    (value) => { value.qa.semanticReviewerId = 'same-as-capture-agent' },
    (value) => { value.scorePolicy.expectedScore = 91 },
  ]
  for (const mutate of mutations) {
    const scratchRoot = await makeScratch(t)
    const changedContract = structuredClone(contract)
    mutate(changedContract)
    await assert.rejects(
      migrateCuratedSitesV2({
        approvedDir: join(scratchRoot, 'approved'),
        publicRoot: join(DEMO_ROOT, 'public'),
        queuePath: join(scratchRoot, 'work-queue.json'),
        semanticContract: changedContract,
      }),
      /semantic contract fingerprint mismatch/iu,
    )
  }
})

test('publishes the seven-target set with sibling temps, exclusive lock, and full rollback', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  assert.equal(typeof publishOutputTransaction, 'function')
  const root = join(tmpdir(), 'vislexicon-transaction-unit')
  const lockPath = join(root, 'queue', '.vislexicon-curation-v2.lock')
  const targets = [
    {
      kind: 'bundle',
      targetPath: join(root, 'approved', 'a.json'),
      bytes: Buffer.from('new-a'),
    },
    {
      kind: 'bundle',
      targetPath: join(root, 'approved', 'b.json'),
      bytes: Buffer.from('new-b'),
    },
    {
      kind: 'queue',
      targetPath: join(root, 'queue', 'work-queue.json'),
      bytes: Buffer.from('new-queue'),
    },
  ]
  const initial = new Map([
    [targets[0].targetPath, Buffer.from('old-a')],
    [targets[2].targetPath, Buffer.from('old-queue')],
  ])
  const snapshot = (files) => [...files]
    .map(([path, bytes]) => [path, bytes.toString('hex')])
    .sort(([left], [right]) => left.localeCompare(right))

  function harness({ failRenameAt, lockExists = false } = {}) {
    const files = new Map(
      [...initial].map(([path, bytes]) => [path, Buffer.from(bytes)]),
    )
    if (lockExists) files.set(lockPath, Buffer.from(JSON.stringify({
      runId: 'other-run',
      pid: 999,
      startedAt: '2026-09-01T00:00:00.000Z',
      state: 'ACTIVE',
      targets: [],
      errors: [],
    })))
    const opened = []
    let renameCount = 0
    const fs = {
      access: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
      },
      mkdir: async () => {},
      open: async (path, flags) => {
        assert.equal(flags, 'wx')
        if (files.has(path)) throw Object.assign(new Error('exists'), { code: 'EEXIST' })
        files.set(path, Buffer.alloc(0))
        opened.push(path)
        return {
          async write(buffer, offset, length, position) {
            const next = Buffer.alloc(Math.max(files.get(path).length, position + length))
            files.get(path).copy(next)
            buffer.copy(next, position, offset, offset + length)
            files.set(path, next)
            return { bytesWritten: length }
          },
          async sync() {},
          async truncate(length) {
            files.set(path, files.get(path).subarray(0, length))
          },
          async close() {},
        }
      },
      readFile: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        return Buffer.from(files.get(path))
      },
      readdir: async (path) => [...files.keys()]
        .filter((filePath) => dirname(filePath) === path)
        .map((filePath) => basename(filePath)),
      realpath: async (path) => resolve(path),
      rename: async (from, to) => {
        renameCount += 1
        if (renameCount === failRenameAt) {
          throw new Error(`injected rename ${renameCount}`)
        }
        if (!files.has(from)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        files.set(to, files.get(from))
        files.delete(from)
      },
      rm: async (path) => {
        files.delete(path)
      },
      stat: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        return { dev: 1, ino: path }
      },
    }
    return { files, fs, opened }
  }

  await assert.rejects(
    publishOutputTransaction(
      [targets[0], { ...targets[2], targetPath: targets[0].targetPath }],
      { lockPath, runId: () => 'collision', fs: harness().fs },
    ),
    /distinct|collision|queue.*bundle/iu,
  )

  const locked = harness({ lockExists: true })
  await assert.rejects(
    publishOutputTransaction(targets, {
      isProcessAlive: async () => true,
      lockPath,
      runId: () => 'locked',
      fs: locked.fs,
    }),
    /lock|concurrent|already/iu,
  )
  assert.equal(locked.files.has(lockPath), true)
  assert.deepEqual(
    snapshot(new Map([...locked.files].filter(([path]) => path !== lockPath))),
    snapshot(initial),
  )

  const success = harness()
  await publishOutputTransaction(targets, {
    lockPath,
    runId: () => 'success',
    fs: success.fs,
  })
  assert.deepEqual(
    targets.map(({ targetPath }) => success.files.get(targetPath).toString()),
    ['new-a', 'new-b', 'new-queue'],
  )
  assert.equal(success.files.size, targets.length)
  const stagedPaths = success.opened.filter((path) => (
    path !== lockPath && !basename(path).startsWith('journal.')
  ))
  assert.equal(stagedPaths.length, targets.length)
  for (let index = 0; index < targets.length; index += 1) {
    assert.equal(dirname(stagedPaths[index]), dirname(targets[index].targetPath))
  }

  for (const failRenameAt of [1, 2, 3, 4, 5]) {
    const failed = harness({ failRenameAt })
    await assert.rejects(
      publishOutputTransaction(targets, {
        lockPath,
        runId: () => `failure-${failRenameAt}`,
        fs: failed.fs,
      }),
      /injected rename/iu,
    )
    assert.deepEqual(
      snapshot(failed.files),
      snapshot(initial),
      `rename ${failRenameAt} must restore existing targets and remove new targets`,
    )
  }
})

test('transaction journal preserves failed rollback and safely handles live, stale, and cleanup failures', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  const root = join(tmpdir(), 'vislexicon-recovery-unit')
  const lockPath = join(root, '.vislexicon-curation-v2.lock')
  const targetPath = join(root, 'approved.json')
  const targets = [{
    kind: 'bundle',
    targetPath,
    bytes: Buffer.from('new-approved'),
  }]

  function harness({
    existingLock,
    failRenameNumbers = [],
    tempCleanupFailures = 0,
  } = {}) {
    const files = new Map([[targetPath, Buffer.from('old-approved')]])
    if (existingLock) files.set(lockPath, Buffer.from(JSON.stringify(existingLock)))
    const failedRenames = new Set(failRenameNumbers)
    const cleanupAttempts = []
    let remainingTempCleanupFailures = tempCleanupFailures
    let renameCount = 0
    const fs = {
      access: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
      },
      mkdir: async () => {},
      open: async (path, flags) => {
        if (flags === 'wx' && files.has(path)) {
          throw Object.assign(new Error('exists'), { code: 'EEXIST' })
        }
        files.set(path, files.get(path) ?? Buffer.alloc(0))
        return {
          async write(buffer, offset, length, position) {
            const current = files.get(path)
            const next = Buffer.alloc(Math.max(current.length, position + length))
            current.copy(next)
            buffer.copy(next, position, offset, offset + length)
            files.set(path, next)
            return { bytesWritten: length }
          },
          async truncate(length) {
            files.set(path, files.get(path).subarray(0, length))
          },
          async sync() {},
          async close() {},
        }
      },
      readFile: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        return Buffer.from(files.get(path))
      },
      readdir: async (path) => [...files.keys()]
        .filter((filePath) => dirname(filePath) === path)
        .map((filePath) => basename(filePath)),
      realpath: async (path) => resolve(path),
      rename: async (from, to) => {
        renameCount += 1
        if (failedRenames.has(renameCount)) {
          throw new Error(`injected rename ${renameCount}`)
        }
        if (!files.has(from)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        files.set(to, files.get(from))
        files.delete(from)
      },
      rm: async (path) => {
        cleanupAttempts.push(path)
        if (path.endsWith('.tmp') && remainingTempCleanupFailures > 0) {
          remainingTempCleanupFailures -= 1
          throw new Error(`injected temp cleanup failure: ${path}`)
        }
        files.delete(path)
      },
      stat: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        return { dev: 1, ino: path }
      },
    }
    return {
      cleanupAttempts,
      files,
      fs,
    }
  }

  const brokenRollback = harness({ failRenameNumbers: [2, 3, 4] })
  await assert.rejects(
    publishOutputTransaction(targets, {
      fs: brokenRollback.fs,
      isProcessAlive: async () => false,
      lockPath,
      runId: () => 'broken-rollback',
    }),
    /rollback.*incomplete|RECOVERY_REQUIRED/iu,
  )
  assert.equal(brokenRollback.files.has(lockPath), true)
  const recoveryJournalPath = [...brokenRollback.files.keys()]
    .filter((path) => basename(path).startsWith('journal.broken-rollback.'))
    .sort()
    .at(-1)
  const recoveryJournal = JSON.parse(brokenRollback.files.get(recoveryJournalPath).toString())
  assert.equal(recoveryJournal.state, 'RECOVERY_REQUIRED')
  assert.ok(recoveryJournal.errors.length > 0)
  assert.equal(recoveryJournal.operations[0].targetPath, targetPath)
  assert.equal(brokenRollback.files.has(recoveryJournal.operations[0].backupPath), true)

  await assert.rejects(
    publishOutputTransaction(targets, {
      fs: brokenRollback.fs,
      isProcessAlive: async () => false,
      lockPath,
      runId: () => 'recovery-run',
    }),
    /recovered.*rerun/iu,
  )
  assert.equal(brokenRollback.files.get(targetPath).toString(), 'old-approved')
  assert.equal(
    [...brokenRollback.files.keys()].some((path) => /\.bak$|\.tmp$|\.lock$/u.test(path)),
    false,
  )

  const liveJournal = {
    runId: 'live-run',
    pid: 999,
    startedAt: '2026-09-01T00:00:00.000Z',
    state: 'ACTIVE',
    targets: [],
    errors: [],
  }
  const live = harness({ existingLock: liveJournal })
  await assert.rejects(
    publishOutputTransaction(targets, {
      fs: live.fs,
      isProcessAlive: async () => true,
      lockPath,
      runId: () => 'blocked-run',
    }),
    /live|concurrent|already/iu,
  )
  assert.deepEqual(JSON.parse(live.files.get(lockPath).toString()), liveJournal)

  const stale = harness({ existingLock: { ...liveJournal, runId: 'dead-run' } })
  await publishOutputTransaction(targets, {
    fs: stale.fs,
    isProcessAlive: async () => false,
    lockPath,
    runId: () => 'stale-takeover',
  })
  assert.equal(stale.files.get(targetPath).toString(), 'new-approved')
  assert.equal(stale.files.has(lockPath), false)

  const cleanupFailure = harness({
    tempCleanupFailures: 2,
  })
  await assert.rejects(
    publishOutputTransaction([
      ...targets,
      {
        kind: 'queue',
        targetPath: join(root, 'queue.json'),
        bytes: Buffer.from('new-queue'),
      },
    ], {
      fs: cleanupFailure.fs,
      isProcessAlive: async () => false,
      lockPath,
      runId: () => 'cleanup-failures',
    }),
    /cleanup|multiple|AggregateError|temp/iu,
  )
  assert.equal(cleanupFailure.files.has(lockPath), true)
  assert.ok(cleanupFailure.cleanupAttempts.filter((path) => path.endsWith('.tmp')).length >= 2)
})

test('immutable journal recovery uses the highest valid snapshot and separates rollback from roll-forward', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  const root = join(tmpdir(), 'vislexicon-immutable-journal-unit')
  const lockPath = join(root, '.vislexicon-curation-v2.lock')
  const targets = Array.from({ length: 7 }, (_, index) => ({
    kind: index === 6 ? 'queue' : 'bundle',
    targetPath: join(root, index === 6 ? 'queue' : 'approved', `${index}.json`),
    bytes: Buffer.from(`new-${index}`),
  }))

  function harness({
    committed = false,
    corruptHigherSeq = false,
    failLockRemoval = false,
    malicious,
  } = {}) {
    const runId = 'crashed-run'
    const owner = transactionOwner(lockPath, runId, targets.map(({ targetPath }) => targetPath))
    const operations = targets.map((target, index) => transactionOperation(
      target,
      runId,
      index,
    ))
    if (malicious) malicious({ operations, owner })
    const snapshot = transactionSnapshot({
      owner,
      operations,
      seq: 4,
      state: committed ? 'COMMITTED' : 'ACTIVE',
    })
    const files = new Map([
      [lockPath, Buffer.from(JSON.stringify(owner))],
      [transactionJournalPath(lockPath, runId, 4), Buffer.from(JSON.stringify(snapshot))],
    ])
    for (const [index, operation] of operations.entries()) {
      files.set(operation.targetPath, Buffer.from(`new-${index}`))
      files.set(operation.backupPath, Buffer.from(`old-${index}`))
      files.set(operation.tempPath, Buffer.from(`temp-${index}`))
    }
    if (committed) {
      for (const operation of operations.slice(0, 3)) files.delete(operation.backupPath)
    }
    if (corruptHigherSeq) {
      files.set(
        transactionJournalPath(lockPath, runId, 5),
        Buffer.from('{"truncated":'),
      )
      files.set(
        `${transactionJournalPath(lockPath, runId, 6)}.tmp-partial`,
        Buffer.from('{"partial":'),
      )
    }
    let mutationCalls = 0
    const cleanupAttempts = []
    const fs = {
      access: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
      },
      mkdir: async () => {},
      open: async (path, flags) => {
        if (flags === 'wx' && files.has(path)) {
          throw Object.assign(new Error('exists'), { code: 'EEXIST' })
        }
        files.set(path, Buffer.alloc(0))
        return {
          async write(buffer, offset, length, position) {
            const current = files.get(path)
            const next = Buffer.alloc(Math.max(current.length, position + length))
            current.copy(next)
            buffer.copy(next, position, offset, offset + length)
            files.set(path, next)
            return { bytesWritten: length }
          },
          async sync() {},
          async close() {},
        }
      },
      readFile: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        return Buffer.from(files.get(path))
      },
      readdir: async (path) => [...files.keys()]
        .filter((filePath) => dirname(filePath) === path)
        .map((filePath) => basename(filePath)),
      realpath: async (path) => resolve(path),
      rename: async (from, to) => {
        mutationCalls += 1
        if (!files.has(from)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        files.set(to, files.get(from))
        files.delete(from)
      },
      rm: async (path) => {
        mutationCalls += 1
        cleanupAttempts.push(path)
        if (failLockRemoval && path === lockPath) {
          throw new Error('injected recovered lock removal failure')
        }
        files.delete(path)
      },
      stat: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        return { dev: 1, ino: path, size: files.get(path).length }
      },
    }
    return {
      cleanupAttempts,
      files,
      fs,
      get mutationCalls() {
        return mutationCalls
      },
      operations,
      owner,
    }
  }

  const rollback = harness({ corruptHigherSeq: true })
  await assert.rejects(
    publishOutputTransaction(targets, {
      fs: rollback.fs,
      isProcessAlive: async () => false,
      lockPath,
      runId: () => 'recovery-attempt',
    }),
    /recovered.*rerun/iu,
  )
  for (let index = 0; index < targets.length; index += 1) {
    assert.equal(rollback.files.get(targets[index].targetPath).toString(), `old-${index}`)
  }
  assert.equal(
    [...rollback.files.keys()].some((path) => /journal\.|\.tmp|\.bak|\.lock/u.test(path)),
    false,
  )

  const rollForward = harness({ committed: true })
  await assert.rejects(
    publishOutputTransaction(targets, {
      fs: rollForward.fs,
      isProcessAlive: async () => false,
      lockPath,
      runId: () => 'roll-forward-attempt',
    }),
    /recovered.*rerun/iu,
  )
  for (let index = 0; index < targets.length; index += 1) {
    assert.equal(rollForward.files.get(targets[index].targetPath).toString(), `new-${index}`)
  }
  assert.equal(
    [...rollForward.files.keys()].some((path) => /journal\.|\.tmp|\.bak|\.lock/u.test(path)),
    false,
  )

  const maliciousCases = [
    ({ operations }) => {
      operations[0].targetPath = 'C:\\outside\\stolen.json'
    },
    ({ operations }) => {
      operations[0].tempPath = resolve(dirname(operations[0].targetPath), '..', 'escape.tmp')
    },
    ({ operations }) => {
      operations[0].backupPath = operations[0].backupPath.replace('crashed-run', 'wrong-run')
    },
    ({ owner }) => {
      owner.runId = 'wrong-owner-run'
    },
  ]
  for (const malicious of maliciousCases) {
    const unsafe = harness({ malicious })
    await assert.rejects(
      publishOutputTransaction(targets, {
        fs: unsafe.fs,
        isProcessAlive: async () => false,
        lockPath,
        runId: () => 'unsafe-attempt',
      }),
      /journal|path|runId|allowed target|unsafe|checksum/iu,
    )
    assert.equal(unsafe.mutationCalls, 0)
  }

  const cleanupFailure = harness({ failLockRemoval: true })
  await assert.rejects(
    publishOutputTransaction(targets, {
      fs: cleanupFailure.fs,
      isProcessAlive: async () => false,
      lockPath,
      runId: () => 'cleanup-attempt',
    }),
    /RECOVERY_INCOMPLETE|lock removal/iu,
  )
  assert.equal(cleanupFailure.files.has(lockPath), true)
})

test('write-ahead operation intents recover both rename crash windows', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )

  async function runCrashFixture({ operationOverrides, presentFiles }) {
    const root = join(tmpdir(), `vislexicon-intent-${operationOverrides.operation}`)
    const lockPath = join(root, '.vislexicon-curation-v2.lock')
    const target = {
      kind: 'bundle',
      targetPath: join(root, 'approved.json'),
      bytes: Buffer.from('new-approved'),
    }
    const runId = 'crashed-intent'
    const owner = transactionOwner(lockPath, runId, [target.targetPath])
    const operation = transactionOperation(target, runId, 0, operationOverrides)
    const snapshot = transactionSnapshot({
      owner,
      operations: [operation],
      seq: 2,
      state: 'ACTIVE',
    })
    const files = new Map([
      [lockPath, Buffer.from(JSON.stringify(owner))],
      [transactionJournalPath(lockPath, runId, 2), Buffer.from(JSON.stringify(snapshot))],
      ...presentFiles(operation).map(([path, bytes]) => [path, Buffer.from(bytes)]),
    ])
    const fs = {
      access: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
      },
      mkdir: async () => {},
      open: async (path, flags) => {
        if (flags === 'wx' && files.has(path)) {
          throw Object.assign(new Error('exists'), { code: 'EEXIST' })
        }
        files.set(path, Buffer.alloc(0))
        return {
          async write(buffer, offset, length, position) {
            const next = Buffer.alloc(position + length)
            buffer.copy(next, position, offset, offset + length)
            files.set(path, next)
            return { bytesWritten: length }
          },
          async sync() {},
          async close() {},
        }
      },
      readFile: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        return Buffer.from(files.get(path))
      },
      readdir: async (path) => [...files.keys()]
        .filter((filePath) => dirname(filePath) === path)
        .map((filePath) => basename(filePath)),
      realpath: async (path) => resolve(path),
      rename: async (from, to) => {
        if (!files.has(from)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        files.set(to, files.get(from))
        files.delete(from)
      },
      rm: async (path) => {
        files.delete(path)
      },
      stat: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        return { dev: 1, ino: path, size: files.get(path).length }
      },
    }
    await assert.rejects(
      publishOutputTransaction([target], {
        fs,
        isProcessAlive: async () => false,
        lockPath,
        runId: () => 'recovery-attempt',
      }),
      /recovered.*rerun/iu,
    )
    return { files, operation, target }
  }

  const backupCrash = await runCrashFixture({
    operationOverrides: {
      existed: true,
      backupActive: true,
      published: false,
      operation: 'BACKUP_INTENT',
    },
    presentFiles: (operation) => [
      [operation.backupPath, 'old-approved'],
      [operation.tempPath, 'new-approved'],
    ],
  })
  assert.equal(backupCrash.files.get(backupCrash.target.targetPath).toString(), 'old-approved')

  const publishCrash = await runCrashFixture({
    operationOverrides: {
      existed: false,
      backupActive: false,
      published: true,
      operation: 'PUBLISH_INTENT',
    },
    presentFiles: (operation) => [
      [operation.targetPath, 'new-approved'],
    ],
  })
  assert.equal(publishCrash.files.has(publishCrash.target.targetPath), false)
})

test('recovery removes a partial temp created after a PENDING snapshot', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  const root = join(tmpdir(), 'vislexicon-pending-partial-temp')
  const lockPath = join(root, '.vislexicon-curation-v2.lock')
  const target = {
    kind: 'bundle',
    targetPath: join(root, 'approved.json'),
    bytes: Buffer.from('new-approved'),
  }
  const runId = 'pending-crash'
  const owner = transactionOwner(lockPath, runId, [target.targetPath])
  const operation = transactionOperation(target, runId, 0, {
    existed: false,
    backupActive: false,
    published: false,
    operation: 'PENDING',
  })
  const snapshot = transactionSnapshot({
    owner,
    operations: [operation],
    seq: 1,
    state: 'ACTIVE',
  })
  const journalPath = transactionJournalPath(lockPath, runId, 1)
  const files = new Map([
    [lockPath, Buffer.from(JSON.stringify(owner))],
    [journalPath, Buffer.from(JSON.stringify(snapshot))],
    [operation.tempPath, Buffer.from('partial')],
  ])

  await assert.rejects(
    publishOutputTransaction([target], {
      fs: memoryTransactionFs(files),
      isProcessAlive: async () => false,
      lockPath,
      runId: () => 'pending-recovery',
    }),
    /recovered.*rerun/iu,
  )
  assert.equal(files.has(operation.tempPath), false)
})

test('an exclusive recovery claim prevents two stale-owner takeovers', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  const root = join(tmpdir(), 'vislexicon-exclusive-recovery-claim')
  const lockPath = join(root, '.vislexicon-curation-v2.lock')
  const target = {
    kind: 'bundle',
    targetPath: join(root, 'approved.json'),
    bytes: Buffer.from('new-approved'),
  }
  const staleOwner = transactionOwner(lockPath, 'stale-owner', [target.targetPath])
  const files = new Map([
    [lockPath, Buffer.from(JSON.stringify(staleOwner))],
    [target.targetPath, Buffer.from('old-approved')],
  ])
  const fs = memoryTransactionFs(files)
  const baseOpen = fs.open
  let acquiredOwnerCount = 0
  fs.open = async (path, flags) => {
    if (path === lockPath && flags === 'wx' && !files.has(path)) {
      acquiredOwnerCount += 1
    }
    return baseOpen(path, flags)
  }

  let releaseFirstLiveness
  let signalFirstLiveness
  const firstLiveness = new Promise((resolvePromise) => {
    signalFirstLiveness = resolvePromise
  })
  const livenessGate = new Promise((resolvePromise) => {
    releaseFirstLiveness = resolvePromise
  })
  let livenessCalls = 0
  const isProcessAlive = async () => {
    livenessCalls += 1
    if (livenessCalls === 1) {
      signalFirstLiveness()
      await livenessGate
    }
    return false
  }
  const first = publishOutputTransaction([target], {
    fs,
    isProcessAlive,
    lockPath,
    runId: () => 'takeover-a',
  })
  await firstLiveness
  const second = publishOutputTransaction([target], {
    fs,
    isProcessAlive,
    lockPath,
    runId: () => 'takeover-b',
  })
  const secondOutcome = await second.then(
    () => ({ status: 'fulfilled' }),
    (reason) => ({ reason, status: 'rejected' }),
  )
  releaseFirstLiveness()
  const firstOutcome = await first.then(
    () => ({ status: 'fulfilled' }),
    (reason) => ({ reason, status: 'rejected' }),
  )
  const outcomes = [firstOutcome, secondOutcome]
  assert.equal(outcomes.filter(({ status }) => status === 'fulfilled').length, 1)
  assert.equal(acquiredOwnerCount, 1)
  assert.match(
    String(outcomes.find(({ status }) => status === 'rejected')?.reason),
    /recovery claim|concurrent|already/iu,
  )
})

test('stale or corrupt recovery claims fail closed and preserve takeover evidence', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  for (const label of ['corrupt', 'stale']) {
    const root = join(tmpdir(), `vislexicon-${label}-claim`)
    const lockPath = join(root, '.vislexicon-curation-v2.lock')
    const claimPath = `${lockPath}.recovery`
    const claimBytes = label === 'corrupt'
      ? Buffer.from('{"truncated":')
      : Buffer.from(JSON.stringify({
        schemaVersion: 1,
        kind: 'VISLEXICON_CURATION_RECOVERY_CLAIM',
        claimId: 'abandoned-claim',
        pid: 999,
        startedAt: '2026-09-01T00:00:00.000Z',
        lockPath,
        ownerChecksum: 'a'.repeat(64),
      }))
    const target = {
      kind: 'bundle',
      targetPath: join(root, 'approved.json'),
      bytes: Buffer.from('new-approved'),
    }
    const owner = transactionOwner(lockPath, 'stale-owner', [target.targetPath])
    const files = new Map([
      [lockPath, Buffer.from(JSON.stringify(owner))],
      [claimPath, claimBytes],
      [target.targetPath, Buffer.from('old-approved')],
    ])
    let mutationCalls = 0
    const fs = memoryTransactionFs(files)
    const baseRename = fs.rename
    const baseRm = fs.rm
    fs.rename = async (...args) => {
      mutationCalls += 1
      return baseRename(...args)
    }
    fs.rm = async (...args) => {
      mutationCalls += 1
      return baseRm(...args)
    }

    await assert.rejects(
      publishOutputTransaction([target], {
        fs,
        isProcessAlive: async () => false,
        lockPath,
        runId: () => `blocked-${label}`,
      }),
      /RECOVERY_INCOMPLETE.*recovery claim/iu,
    )
    assert.equal(mutationCalls, 0)
    assert.deepEqual(files.get(lockPath), Buffer.from(JSON.stringify(owner)))
    assert.deepEqual(files.get(claimPath), claimBytes)
  }
})

test('transaction namespace preflight rejects journal, artifact, and inode aliases', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )

  async function rejectsBeforeOpen(targets, { files = new Map(), fsOverrides = {}, lockPath, runId }) {
    const fs = { ...memoryTransactionFs(files), ...fsOverrides }
    const baseOpen = fs.open
    let openCalls = 0
    fs.open = async (...args) => {
      openCalls += 1
      return baseOpen(...args)
    }
    await assert.rejects(
      publishOutputTransaction(targets, { fs, lockPath, runId: () => runId }),
      /namespace|collision|alias|reserved|distinct/iu,
    )
    assert.equal(openCalls, 0)
  }

  const journalRoot = join(tmpdir(), 'vislexicon-journal-target-collision')
  await rejectsBeforeOpen([{
    kind: 'bundle',
    targetPath: join(journalRoot, 'journal.alias.00000001.json'),
    bytes: Buffer.from('new-journal-alias'),
  }], {
    lockPath: join(journalRoot, '.vislexicon-curation-v2.lock'),
    runId: 'alias',
  })

  const artifactRoot = join(tmpdir(), 'vislexicon-cross-operation-artifact')
  const firstTargetPath = join(artifactRoot, 'a.json')
  await rejectsBeforeOpen([
    {
      kind: 'bundle',
      targetPath: firstTargetPath,
      bytes: Buffer.from('new-a'),
    },
    {
      kind: 'queue',
      targetPath: join(
        artifactRoot,
        `${basename(firstTargetPath)}.vislexicon-v2.cross-op.0.tmp`,
      ),
      bytes: Buffer.from('new-b'),
    },
  ], {
    lockPath: join(artifactRoot, '.vislexicon-curation-v2.lock'),
    runId: 'cross-op',
  })

  const inodeRoot = join(tmpdir(), 'vislexicon-claim-inode-alias')
  const inodeLockPath = join(inodeRoot, '.vislexicon-curation-v2.lock')
  const inodeTarget = {
    kind: 'bundle',
    targetPath: join(inodeRoot, 'approved.json'),
    bytes: Buffer.from('old-approved'),
  }
  const claimPath = `${inodeLockPath}.recovery`
  const inodeFiles = new Map([
    [inodeTarget.targetPath, Buffer.from('old-approved')],
    [claimPath, Buffer.from('hardlink-alias')],
  ])
  await rejectsBeforeOpen([inodeTarget], {
    files: inodeFiles,
    fsOverrides: {
      stat: async (path) => {
        if (!inodeFiles.has(path)) {
          throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        }
        return { dev: 7, ino: 11, size: inodeFiles.get(path).length }
      },
    },
    lockPath: inodeLockPath,
    runId: 'inode-alias',
  })

})

test('protected input paths are rechecked after staging and before the first rename', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  const root = join(tmpdir(), 'vislexicon-protected-paths-recheck')
  const lockPath = join(root, '.vislexicon-curation-v2.lock')
  const protectedPath = join(root, 'input.json')
  const targetPath = join(root, 'published.json')
  const targetBytes = Buffer.from('new-approved')
  const protectedBytes = Buffer.from('protected-input')
  const targetMetadata = { dev: 3, ino: 7, size: targetBytes.length }
  const protectedMetadata = { dev: 11, ino: 13, size: protectedBytes.length }
  const files = new Map([
    [protectedPath, Buffer.from(protectedBytes)],
    [targetPath, Buffer.from('old-approved')],
  ])
  let aliasActivated = false
  let renameCalls = 0
  let stagingClosed = false
  const fs = {
    access: async (path) => {
      if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
    },
    mkdir: async () => {},
    open: async (path, flags) => {
      if (flags === 'wx' && files.has(path)) {
        throw Object.assign(new Error('exists'), { code: 'EEXIST' })
      }
      files.set(path, Buffer.alloc(0))
      return {
        async write(buffer, offset, length, position) {
          const current = files.get(path)
          const next = Buffer.alloc(Math.max(current.length, position + length))
          current.copy(next)
          buffer.copy(next, position, offset, offset + length)
          files.set(path, next)
          return { bytesWritten: length }
        },
        async sync() {},
        async truncate(length) {
          files.set(path, files.get(path).subarray(0, length))
        },
        async close() {
          if (path === join(root, 'published.json.vislexicon-v2.protected-run.0.tmp')) {
            aliasActivated = true
            stagingClosed = true
          }
        },
      }
    },
    readFile: async (path) => {
      if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
      return Buffer.from(files.get(path))
    },
    readdir: async (path) => [...files.keys()]
      .filter((filePath) => dirname(filePath) === path)
      .map((filePath) => basename(filePath)),
    realpath: async (path) => {
      const absolute = resolve(path)
      if (absolute === resolve(protectedPath)) return resolve(protectedPath)
      if (absolute === resolve(targetPath) && aliasActivated) return resolve(protectedPath)
      return absolute
    },
    rename: async () => {
      renameCalls += 1
      throw new Error('unexpected rename after protected-path recheck')
    },
    rm: async (path) => {
      files.delete(path)
    },
    stat: async (path) => {
      const absolute = resolve(path)
      if (absolute === resolve(protectedPath)) return protectedMetadata
      if (absolute === resolve(targetPath) && aliasActivated) return protectedMetadata
      if (absolute === resolve(targetPath)) return targetMetadata
      if (files.has(path)) return { dev: 19, ino: absolute, size: files.get(path).length }
      throw Object.assign(new Error('missing'), { code: 'ENOENT' })
    },
  }

  await assert.rejects(
    publishOutputTransaction([{
      kind: 'bundle',
      targetPath,
      bytes: targetBytes,
    }], {
      fs,
      lockPath,
      protectedPaths: [root, protectedPath],
      runId: () => 'protected-run',
    }),
    /protected path|realpath alias|inode alias|collision/iu,
  )
  assert.equal(stagingClosed, true)
  assert.equal(renameCalls, 0)
  assert.equal(files.get(protectedPath).toString(), protectedBytes.toString())
  assert.equal(files.get(targetPath).toString(), 'old-approved')
})

test('empty or truncated owner locks fail closed with recoverable evidence', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  for (const [label, lockBytes] of [
    ['empty', Buffer.alloc(0)],
    ['truncated', Buffer.from('{"schemaVersion":1,"kind":')],
  ]) {
    const root = join(tmpdir(), `vislexicon-${label}-owner-lock`)
    const lockPath = join(root, '.vislexicon-curation-v2.lock')
    const target = {
      kind: 'bundle',
      targetPath: join(root, 'approved.json'),
      bytes: Buffer.from('new-approved'),
    }
    const files = new Map([
      [lockPath, Buffer.from(lockBytes)],
      [target.targetPath, Buffer.from('old-approved')],
    ])
    await assert.rejects(
      publishOutputTransaction([target], {
        fs: memoryTransactionFs(files),
        isProcessAlive: async () => false,
        lockPath,
        runId: () => `blocked-${label}`,
      }),
      /RECOVERY_INCOMPLETE.*(?:owner )?lock.*(?:empty|truncated|corrupt|JSON)/iu,
    )
    assert.deepEqual(files.get(lockPath), lockBytes)
    assert.equal(files.get(target.targetPath).toString(), 'old-approved')
  }
})

test('owner liveness uses the full identity so PID reuse cannot delete a live lock', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  const root = join(tmpdir(), 'vislexicon-owner-identity-liveness')
  const lockPath = join(root, '.vislexicon-curation-v2.lock')
  const target = {
    kind: 'bundle',
    targetPath: join(root, 'approved.json'),
    bytes: Buffer.from('new-approved'),
  }
  const owner = transactionOwner(lockPath, 'identity-owner', [target.targetPath])
  const ownerBytes = Buffer.from(JSON.stringify(owner))
  const files = new Map([
    [lockPath, ownerBytes],
    [target.targetPath, Buffer.from('old-approved')],
  ])
  let observedIdentity

  await assert.rejects(
    publishOutputTransaction([target], {
      fs: memoryTransactionFs(files),
      isOwnerAlive: async (identity) => {
        observedIdentity = identity
        return (
          identity.pid === owner.pid &&
          identity.runId === owner.runId &&
          identity.startedAt === owner.startedAt
        )
      },
      isProcessAlive: async () => false,
      lockPath,
      runId: () => 'identity-contender',
    }),
    /live|concurrent|already/iu,
  )
  assert.deepEqual(observedIdentity, owner)
  assert.deepEqual(files.get(lockPath), ownerBytes)
  assert.equal(files.get(target.targetPath).toString(), 'old-approved')
})

test('owner creation preserves string and frozen errors without leaking its lock', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  for (const [label, injectedError] of [
    ['string', 'injected string owner write failure'],
    ['frozen', Object.freeze(new Error('injected frozen owner write failure'))],
  ]) {
    const root = join(tmpdir(), `vislexicon-${label}-owner-error`)
    const lockPath = join(root, '.vislexicon-curation-v2.lock')
    const target = {
      kind: 'bundle',
      targetPath: join(root, 'approved.json'),
      bytes: Buffer.from('new-approved'),
    }
    const files = new Map()
    const fs = memoryTransactionFs(files)
    const baseOpen = fs.open
    fs.open = async (path, flags) => {
      const handle = await baseOpen(path, flags)
      if (path !== lockPath) return handle
      return {
        ...handle,
        async write() {
          throw injectedError
        },
      }
    }

    const rejection = await publishOutputTransaction([target], {
      fs,
      lockPath,
      runId: () => `owner-error-${label}`,
    }).then(
      () => null,
      (error) => error,
    )
    assert.notEqual(rejection, null)
    assert.match(String(rejection), new RegExp(`injected ${label} owner write failure`, 'iu'))
    assert.equal(files.has(lockPath), false)
  }
})

test('publication refuses a mutable-journal adapter before acquiring any lock', async () => {
  const { publishOutputTransaction } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  const root = join(tmpdir(), 'vislexicon-mutable-journal-unsupported')
  const lockPath = join(root, '.vislexicon-curation-v2.lock')
  const target = {
    kind: 'bundle',
    targetPath: join(root, 'approved.json'),
    bytes: Buffer.from('new-approved'),
  }
  const files = new Map()
  const fs = memoryTransactionFs(files)
  delete fs.readdir
  const baseOpen = fs.open
  let openCalls = 0
  fs.open = async (...args) => {
    openCalls += 1
    return baseOpen(...args)
  }

  await assert.rejects(
    publishOutputTransaction([target], {
      fs,
      lockPath,
      runId: () => 'mutable-unsupported',
    }),
    /immutable.*journal.*readdir|readdir.*required|unsupported.*journal/iu,
  )
  assert.equal(openCalls, 0)
  assert.equal(files.size, 0)
})

test('output target collision detects realpath and hardlink aliases before locking', async () => {
  const { assertDistinctOutputTargets } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  assert.equal(typeof assertDistinctOutputTargets, 'function')
  const root = join(tmpdir(), 'vislexicon-alias-unit')
  const first = join(root, 'one', 'same.json')
  const second = join(root, 'two', 'same.json')
  const baseFs = {
    mkdir: async () => {},
    stat: async () => {
      throw Object.assign(new Error('missing'), { code: 'ENOENT' })
    },
  }
  await assert.rejects(
    assertDistinctOutputTargets(
      [{ targetPath: first }, { targetPath: second }],
      {
        ...baseFs,
        realpath: async () => join(root, 'canonical-parent'),
      },
    ),
    /realpath|alias|collision|distinct/iu,
  )

  await assert.rejects(
    assertDistinctOutputTargets(
      [
        { targetPath: join(root, 'canonical', 'a.json') },
        { targetPath: join(root, 'canonical', 'b.json') },
      ],
      {
        ...baseFs,
        realpath: async (path) => path,
        stat: async () => ({ dev: 7n, ino: 11n }),
      },
    ),
    /hardlink|inode|alias|collision|distinct/iu,
  )
})

test('committed six bundles and queue exactly match a clean locked regeneration', async (t) => {
  const { migrateCuratedSitesV2, validateReviewedProvenance } = await import(
    '../scripts/migrate-curated-sites-v2.mjs'
  )
  const committedReview = await readJson(join(
    DEMO_ROOT,
    'data',
    'curation',
    'reviewed-capture-v2.json',
  ))
  assert.equal(validateReviewedProvenance(CURATED_SITES, committedReview).sites.length, 6)
  const scratchRoot = await makeScratch(t)
  const approvedDir = join(scratchRoot, 'approved')
  const publicRoot = join(scratchRoot, 'public')
  const queuePath = join(scratchRoot, 'work-queue.json')
  await copyApprovedShots(publicRoot)
  await migrateCuratedSitesV2({ approvedDir, publicRoot, queuePath })

  for (const siteId of EXPECTED_SITE_IDS) {
    assert.deepEqual(
      await readFile(join(approvedDir, `${siteId}.json`)),
      await readFile(join(DEMO_ROOT, 'data', 'curation', 'approved', `${siteId}.json`)),
      `${siteId} committed bundle must be byte-identical to clean regeneration`,
    )
  }
  assert.deepEqual(
    await readFile(queuePath),
    await readFile(join(DEMO_ROOT, 'data', 'curation', 'work-queue.json')),
  )
})

test('reads PNG, JPEG, and WebP dimensions with byte-accurate SHA-256 metadata', async (t) => {
  const { inspectImageBuffer, readImageMetadata } = await import(
    '../scripts/curation/image-metadata.mjs'
  )
  const scratchRoot = await makeScratch(t)
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  )
  const jpeg = await readFile(join(
    DEMO_ROOT,
    'public',
    'shots',
    '10web-acb22ccf',
    '01.jpg',
  ))
  const webp = Buffer.from(
    'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
    'base64',
  )

  const fixtures = [
    ['fixture.png', png, 1, 1, 'PNG'],
    ['fixture.jpg', jpeg, 1280, 900, 'JPEG'],
    ['fixture.webp', webp, 1, 1, 'WebP'],
  ]
  for (const [filename, bytes, width, height, format] of fixtures) {
    const filePath = join(scratchRoot, filename)
    await writeFile(filePath, bytes)
    assert.deepEqual(inspectImageBuffer(bytes, filename), {
      format,
      width,
      height,
      ...(format === 'PNG' ? { verification: 'decoded' } : {}),
    })
    assert.deepEqual(await readImageMetadata(filePath), {
      sha256: createHash('sha256').update(bytes).digest('hex'),
      width,
      height,
      bytes: bytes.length,
      verification: 'decoded',
    })
  }
  assert.deepEqual(inspectImageBuffer(animatedWebp(), 'animated.webp'), {
    format: 'WebP',
    width: 1,
    height: 1,
  })
})

test('rejects images truncated after dimensions and invalid trailing structure', async (t) => {
  const { inspectImageBuffer, readImageMetadata } = await import(
    '../scripts/curation/image-metadata.mjs'
  )
  assert.equal(typeof inspectImageBuffer, 'function')
  const scratchRoot = await makeScratch(t)
  const completePng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  )
  const cases = [
    ['png-after-ihdr.png', completePng.subarray(0, 33), /corrupt PNG.*IEND|corrupt PNG.*IDAT/iu],
    ['png-missing-iend.png', completePng.subarray(0, -12), /corrupt PNG.*IEND/iu],
    ['jpeg-after-sof.jpg', completeJpeg().subarray(0, 15), /corrupt JPEG.*SOS|corrupt JPEG.*EOI/iu],
    ['jpeg-missing-eoi.jpg', completeJpeg().subarray(0, -2), /corrupt JPEG.*EOI/iu],
    ['webp-vp8x-only.webp', vp8xOnlyWebp(), /corrupt WebP.*VP8X.*image payload/iu],
  ]

  for (const [filename, bytes, pattern] of cases) {
    const filePath = join(scratchRoot, filename)
    await writeFile(filePath, bytes)
    await assert.rejects(readImageMetadata(filePath), pattern)
  }

  const trailingWebp = Buffer.concat([
    Buffer.from(
      'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
      'base64',
    ),
    Buffer.from([0]),
  ])
  assert.throws(
    () => inspectImageBuffer(trailingWebp, 'trailing.webp'),
    /corrupt WebP.*RIFF size/iu,
  )
})

test('PNG decoding verifies every CRC, IHDR semantics, and inflated scanlines', async () => {
  const { inspectImageBuffer } = await import(
    '../scripts/curation/image-metadata.mjs'
  )
  const valid = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  )
  assert.deepEqual(inspectImageBuffer(valid, 'valid.png'), {
    format: 'PNG',
    width: 1,
    height: 1,
    verification: 'decoded',
  })

  const badCrc = Buffer.from(valid)
  const badCrcIdat = pngChunkRecord(badCrc, 'IDAT')
  badCrc[badCrcIdat.crcOffset] ^= 0xff
  assert.throws(
    () => inspectImageBuffer(badCrc, 'bad-crc.png'),
    /corrupt PNG.*IDAT.*CRC/iu,
  )

  const badIhdr = Buffer.from(valid)
  const ihdr = pngChunkRecord(badIhdr, 'IHDR')
  badIhdr[ihdr.dataOffset + 8] = 3
  rewritePngChunkCrc(badIhdr, ihdr)
  assert.throws(
    () => inspectImageBuffer(badIhdr, 'bad-ihdr.png'),
    /corrupt PNG.*bit depth|corrupt PNG.*IHDR/iu,
  )

  const badDeflate = Buffer.from(valid)
  const idat = pngChunkRecord(badDeflate, 'IDAT')
  badDeflate.fill(0, idat.dataOffset, idat.dataEnd)
  rewritePngChunkCrc(badDeflate, idat)
  assert.throws(
    () => inspectImageBuffer(badDeflate, 'bad-deflate.png'),
    /corrupt PNG.*inflate|corrupt PNG.*scanline/iu,
  )
})

test('PNG decoding fails fast on chunk floods, byte limits, bombs, and giant declarations', async () => {
  const { inspectPngBuffer } = await import(
    '../scripts/curation/image-metadata.mjs'
  )
  const valid = grayscalePng(1, 1, Buffer.from([0, 0]))
  assert.throws(
    () => inspectPngBuffer(valid, 'input-limit.png', {
      maxInputBytes: valid.length - 1,
    }),
    /input.*limit|too large/iu,
  )
  assert.throws(
    () => inspectPngBuffer(valid, 'idat-limit.png', { maxIdatBytes: 1 }),
    /IDAT.*limit|too large/iu,
  )

  const chunkFlood = grayscalePng(
    1,
    1,
    Buffer.from([0, 0]),
    Array.from({ length: 4_097 }, () => pngChunkBytes('tEXt', Buffer.alloc(0))),
  )
  assert.throws(
    () => inspectPngBuffer(chunkFlood, 'chunk-flood.png'),
    /chunk count|too many chunks/iu,
  )

  const compressedBomb = grayscalePng(1, 1, Buffer.alloc(1_000_000))
  assert.throws(
    () => inspectPngBuffer(compressedBomb, 'bomb.png'),
    /inflate|scanline|decoded/iu,
  )

  const giant = grayscalePng(
    0xffff_ffff,
    0xffff_ffff,
    Buffer.from([0, 0]),
  )
  assert.throws(
    () => inspectPngBuffer(giant, 'giant.png'),
    /decoded.*limit|scanline size|unsafe/iu,
  )
})

test('JPEG and WebP metadata require an injected decoder to confirm decoded dimensions', async (t) => {
  const { readImageMetadata } = await import('../scripts/curation/image-metadata.mjs')
  const scratchRoot = await makeScratch(t)
  const fixtures = [
    ['decoded.jpg', completeJpeg(), 'JPEG', 1280, 900],
    [
      'decoded.webp',
      Buffer.from(
        'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
        'base64',
      ),
      'WebP',
      1,
      1,
    ],
  ]
  const calls = []
  const decoder = async (filePath, expected) => {
    calls.push({ filePath, expected })
    return { ...expected, verification: 'decoded' }
  }

  for (const [filename, bytes, format, width, height] of fixtures) {
    const filePath = join(scratchRoot, filename)
    await writeFile(filePath, bytes)
    const metadata = await readImageMetadata(filePath, { decoder })
    assert.equal(metadata.verification, 'decoded')
    assert.equal(metadata.width, width)
    assert.equal(metadata.height, height)
    assert.equal(calls.at(-1).filePath, filePath)
    assert.deepEqual(calls.at(-1).expected, { format, width, height })
  }
  assert.equal(calls.length, 2)
})

test('default JPEG/WebP decoder accepts real payloads and fails closed on damaged payloads', async (t) => {
  const { readImageMetadata } = await import('../scripts/curation/image-metadata.mjs')
  const scratchRoot = await makeScratch(t)
  const realJpegPath = join(
    DEMO_ROOT,
    'public',
    'shots',
    '10web-acb22ccf',
    '01.jpg',
  )
  const jpegMetadata = await readImageMetadata(realJpegPath)
  assert.equal(jpegMetadata.verification, 'decoded')

  const validWebp = Buffer.from(
    'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
    'base64',
  )
  const validWebpPath = join(scratchRoot, 'valid.webp')
  await writeFile(validWebpPath, validWebp)
  assert.equal((await readImageMetadata(validWebpPath)).verification, 'decoded')

  const damagedWebp = Buffer.from(validWebp)
  damagedWebp.fill(0xff, 20, 23)
  damagedWebp.fill(0, 30, 42)
  const damagedWebpPath = join(scratchRoot, 'damaged.webp')
  await writeFile(damagedWebpPath, damagedWebp)
  await assert.rejects(
    readImageMetadata(damagedWebpPath),
    /decode|ffmpeg|verification/iu,
  )
})

test('ffmpeg timeout waits for injected graceful-to-force termination before rejecting', async () => {
  const { decodeImageWithFfmpeg } = await import(
    '../scripts/curation/image-metadata.mjs'
  )
  const child = new EventEmitter()
  child.stderr = new EventEmitter()
  child.stderr.setEncoding = () => {}
  child.kill = () => true
  const events = []
  let releaseTermination
  const terminationGate = new Promise((resolveTermination) => {
    releaseTermination = resolveTermination
  })
  let settled = false
  const decodeOutcome = decodeImageWithFfmpeg(
    'fake-timeout.webp',
    { format: 'WebP', width: 1, height: 1 },
    {
      spawn: () => child,
      terminateProcess: async () => {
        events.push('terminate-start')
        await terminationGate
        events.push('terminate-complete')
      },
      timeoutMs: 0,
    },
  ).then(
    (value) => ({ value }),
    (error) => ({ error }),
  ).finally(() => {
    settled = true
  })
  await new Promise((resolveTurn) => setTimeout(resolveTurn, 5))
  assert.deepEqual(events, ['terminate-start'])
  const settledBeforeTermination = settled
  releaseTermination()
  const outcome = await decodeOutcome
  assert.equal(settledBeforeTermination, false)
  assert.match(outcome.error.message, /timed out/iu)
  assert.deepEqual(events, ['terminate-start', 'terminate-complete'])
})

test('rejects unknown and corrupted image data with a clear format error', async (t) => {
  const { readImageMetadata } = await import('../scripts/curation/image-metadata.mjs')
  const scratchRoot = await makeScratch(t)
  const unknownPath = join(scratchRoot, 'unknown.bin')
  const corruptPngPath = join(scratchRoot, 'corrupt.png')
  await writeFile(unknownPath, 'not an image')
  await writeFile(corruptPngPath, Buffer.from('89504e470d0a1a0a', 'hex'))

  await assert.rejects(readImageMetadata(unknownPath), /unsupported image format.*unknown\.bin/iu)
  await assert.rejects(readImageMetadata(corruptPngPath), /corrupt PNG.*corrupt\.png/iu)
})
