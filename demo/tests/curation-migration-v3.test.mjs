import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import * as nodeFs from 'node:fs/promises'
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  convertV2BundleToV3,
  main,
  migrateCuratedSitesV3,
} from '../scripts/migrate-curated-sites-v3.mjs'
import {
  evidenceBundleErrors,
  toPublicSite,
} from '../src/lib/curation-evidence.js'

const TEST_DIRECTORY = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = join(TEST_DIRECTORY, '..')
const APPROVED_V2_DIRECTORY = join(DEMO_ROOT, 'data', 'curation', 'approved')
const REAL_REVIEW_MANIFEST_PATH = join(
  DEMO_ROOT,
  'data',
  'curation',
  'reviews',
  '2026-09-02-six-v3-editorial-review.json',
)
const SITE_IDS = Object.freeze([
  'magic-ui',
  'origin-ui',
  'hover-dev',
  'shadcn-ui',
  'uiverse',
  '21st-dev',
])
const SUBCATEGORY_BY_SITE_ID = Object.freeze({
  'magic-ui': 'page-blocks-embeddable-controls',
  'origin-ui': 'general-ui-components',
  'hover-dev': 'page-blocks-embeddable-controls',
  'shadcn-ui': 'design-system-suites',
  uiverse: 'general-ui-components',
  '21st-dev': 'general-ui-components',
})

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

async function readV2Fixture(siteId) {
  const bytes = await readFile(join(APPROVED_V2_DIRECTORY, `${siteId}.json`))
  return { bundle: JSON.parse(bytes), bytes, hash: sha256(bytes) }
}

async function makeScratch(t) {
  const root = await mkdtemp(join(tmpdir(), 'vislexicon-curation-v3-'))
  const resolvedTemp = resolve(tmpdir())
  assert.equal(resolve(root).startsWith(`${resolvedTemp}\\`) || process.platform !== 'win32', true)
  t.after(() => rm(root, { recursive: true, force: true }))
  return root
}

function controlledFacets(license = 'MIT', access = 'open-source') {
  return {
    scenarios: [],
    deliverables: ['component'],
    actions: ['browse', 'preview', 'copy'],
    media: ['ui'],
    platforms: ['web'],
    technologies: ['react'],
    workflowStages: ['discovery', 'build'],
    audiences: ['designer', 'developer'],
    access: [access],
    licenses: [license],
    contentOrganization: ['component-registry'],
    languages: ['en'],
  }
}

function reviewFor(bundle, bundleHash, overrides = {}) {
  const reasons = [{
    statement: '官方组件目录和实例页共同证明该入口主要提供可预览、复制并复用的界面组件。',
    evidenceUrl: bundle.pages.find(({ role }) => role === 'breadth').finalUrl,
  }]
  return {
    siteId: bundle.siteId,
    sourceSiteId: bundle.siteId,
    sourceV2BundleSha256: bundleHash,
    sourceBundleSha256: bundleHash,
    entryId: bundle.siteId,
    entityId: `entity-${bundle.siteId}`,
    descriptionZh: bundle.curation.descriptionZh,
    editorial: {
      name: bundle.curation.name,
      descriptionZh: bundle.curation.descriptionZh,
      pricing: bundle.curation.pricing,
      evidence: [
        {
          field: 'name',
          evidenceUrl: bundle.official.finalUrl,
          statement: '官方入口直接显示当前项目名称。',
        },
        {
          field: 'descriptionZh',
          evidenceUrl: bundle.pages.find(({ role }) => role === 'breadth').finalUrl,
          statement: '身份、范围与实例页共同支持最终人工中文简介。',
        },
        {
          field: 'pricing',
          evidenceUrl: bundle.official.finalUrl,
          statement: '官方入口直接支持当前访问与价格状态。',
        },
      ],
      verdict: 'PASS',
    },
    primaryCategory: 'ui-implementation',
    subcategory: 'page-blocks-embeddable-controls',
    classificationStatus: 'confirmed',
    facets: controlledFacets(),
    classificationReasons: structuredClone(reasons),
    reasons: structuredClone(reasons),
    editorialReviewerId: 'fixture-editorial-reviewer',
    reviewedAt: '2026-09-02T01:02:03.000Z',
    verdict: 'PASS',
    factCorrections: [],
    factVerdicts: bundle.facts.map((fact) => ({
      field: fact.field,
      finalValue: fact.value,
      sourceUrl: fact.sourceUrl,
      evidence: fact.evidence,
      confidence: fact.confidence,
      verdict: 'PASS',
    })),
    pageVerdicts: bundle.pages.map((page) => ({
      role: page.role,
      sourceUrl: page.sourceUrl,
      finalUrl: page.finalUrl,
      title: page.title,
      verdict: 'PASS',
      evidence: `独立复核确认 ${page.role} 页面与所述角色相符。`,
    })),
    shotVerdicts: bundle.pages.map((page) => ({
      role: page.role,
      src: page.shot.src,
      sha256: page.shot.sha256,
      width: page.shot.width,
      height: page.shot.height,
      verdict: 'PASS',
      evidence: `独立复核确认 ${page.role} 截图清晰且与页面一致。`,
    })),
    scopeNotes: '该记录分类的是稳定站内入口，不把整个来源实体压成单一类别。',
    rightsNotes: '许可证事实与官方或已确认仓库范围中的直接证据一致。',
    ...overrides,
  }
}

function correctedFactRecords(bundle, corrections) {
  const facts = structuredClone(bundle.facts)
  for (const correction of corrections) {
    const fact = {
      field: correction.field,
      value: correction.value,
      sourceUrl: correction.sourceUrl,
      evidence: correction.evidence,
      ...(Object.hasOwn(correction, 'confidence')
        ? { confidence: correction.confidence }
        : {}),
    }
    const index = facts.findIndex(({ field }) => field === correction.field)
    if (correction.operation === 'add') facts.push(fact)
    else facts[index] = fact
  }
  return facts
}

function completeReviewFor(bundle, bundleHash) {
  const priorLicense = bundle.facts.find(({ field }) => field === 'license')
  const keepsMit = priorLicense?.value === 'MIT'
  const factCorrections = keepsMit
    ? []
    : [{
      operation: priorLicense ? 'replace' : 'add',
      field: 'license',
      value: 'proprietary',
      sourceUrl: bundle.official.finalUrl,
      evidence: 'Fixture editorial review directly verified the current proprietary rights notice.',
      confidence: 1,
    }]
  const finalFacts = correctedFactRecords(bundle, factCorrections)
  return reviewFor(bundle, bundleHash, {
    subcategory: SUBCATEGORY_BY_SITE_ID[bundle.siteId],
    facets: keepsMit
      ? controlledFacets('MIT', 'open-source')
      : controlledFacets('proprietary', 'closed-source'),
    factCorrections,
    factVerdicts: finalFacts.map((fact) => ({
      field: fact.field,
      finalValue: fact.value,
      sourceUrl: fact.sourceUrl,
      evidence: fact.evidence,
      ...(Object.hasOwn(fact, 'confidence') ? { confidence: fact.confidence } : {}),
      verdict: 'PASS',
    })),
  })
}

async function prepareSixSiteFixture(t) {
  const root = await makeScratch(t)
  const inputDir = join(root, 'approved-v2')
  const outputDir = join(root, 'approved-v3')
  await mkdir(inputDir, { recursive: true })
  const fixtures = []
  for (const siteId of SITE_IDS) {
    const fixture = await readV2Fixture(siteId)
    fixtures.push(fixture)
    await writeFile(join(inputDir, `${siteId}.json`), fixture.bytes)
  }
  const sites = fixtures.map(({ bundle, hash }) => completeReviewFor(bundle, hash))
  const reviewedAt = '2026-09-02T01:02:03.000Z'
  const reviewManifest = {
    schemaVersion: 1,
    manifestId: 'fixture-editorial-review-manifest-v3',
    reviewerId: 'fixture-editorial-reviewer',
    overallVerdict: 'PASS',
    reviewedAt,
    siteIds: [...SITE_IDS],
    inputHashes: Object.fromEntries(fixtures.map(({ bundle, hash }) => [bundle.siteId, hash])),
    sites,
  }
  return { fixtures, inputDir, outputDir, reviewManifest, root }
}

async function assertMissing(path) {
  await assert.rejects(
    readFile(path),
    (error) => error?.code === 'ENOENT',
  )
}

test('pure conversion preserves v2 evidence and produces a canonical publishable v3 bundle', async () => {
  const { bundle, bytes, hash } = await readV2Fixture('magic-ui')
  const review = reviewFor(bundle, hash)
  const beforeBundle = structuredClone(bundle)
  const beforeReview = structuredClone(review)

  const converted = convertV2BundleToV3(bundle, review, {
    sourceBundleSha256: hash,
    sourceBundleBytes: bytes,
  })

  assert.deepEqual(evidenceBundleErrors(converted), [])
  assert.equal(converted.schemaVersion, 3)
  assert.equal(converted.entryId, 'magic-ui')
  assert.equal(converted.entityId, 'entity-magic-ui')
  assert.equal(converted.attemptId, `${bundle.attemptId}-v3-${hash.slice(0, 12)}`)
  assert.deepEqual(converted.official, bundle.official)
  assert.deepEqual(converted.pages, bundle.pages)
  assert.deepEqual(converted.facts, bundle.facts)
  assert.deepEqual(converted.editorial, {
    name: review.editorial.name,
    descriptionZh: review.editorial.descriptionZh,
    pricing: review.editorial.pricing,
  })
  assert.equal(converted.classification.status, 'confirmed')
  assert.equal(converted.classification.confirmedAt, review.reviewedAt)
  assert.deepEqual(converted.classification.reasons, review.classificationReasons)
  assert.equal(converted.qa.curatorId, bundle.qa.semanticReviewerId)
  assert.equal(converted.qa.semanticReviewerId, review.editorialReviewerId)
  assert.equal(converted.qa.editorialReviewerId, review.editorialReviewerId)
  for (const legacyField of ['siteId', 'entityKey', 'curation', 'resourceEssence', 'score', 'tags']) {
    assert.equal(Object.hasOwn(converted, legacyField), false)
  }
  assert.deepEqual(bundle, beforeBundle)
  assert.deepEqual(review, beforeReview)
})

test('migration keeps distinct registered entity and entry identities', async () => {
  const fixture = await readV2Fixture('magic-ui')
  const review = reviewFor(fixture.bundle, fixture.hash, {
    entityId: 'entity-magic-ui',
  })
  const converted = convertV2BundleToV3(fixture.bundle, review, {
    sourceBundleSha256: fixture.hash,
    sourceBundleBytes: fixture.bytes,
  })
  assert.equal(converted.entryId, 'magic-ui')
  assert.equal(converted.entityId, 'entity-magic-ui')
  assert.equal(converted.classification.entityId, 'entity-magic-ui')

  const equalIdentityReview = reviewFor(fixture.bundle, fixture.hash, {
    entityId: 'magic-ui',
  })
  assert.throws(
    () => convertV2BundleToV3(fixture.bundle, equalIdentityReview, {
      sourceBundleSha256: fixture.hash,
      sourceBundleBytes: fixture.bytes,
    }),
    /entityId.*entity-magic-ui|entityId.*registered|entityId.*distinct/iu,
  )
})

test('migration rejects a taxonomy-valid classification outside the fixed six-site mapping', async () => {
  const fixture = await readV2Fixture('magic-ui')
  const review = reviewFor(fixture.bundle, fixture.hash, {
    primaryCategory: 'ui-implementation',
    subcategory: 'general-ui-components',
  })
  assert.throws(
    () => convertV2BundleToV3(fixture.bundle, review, {
      sourceBundleSha256: fixture.hash,
      sourceBundleBytes: fixture.bytes,
    }),
    /fixed classification mapping|page-blocks-embeddable-controls/iu,
  )
})

test('v3 provenance assigns classification curation to the v2 semantic reviewer and fingerprints the attempt', async () => {
  const fixture = await readV2Fixture('magic-ui')
  const review = reviewFor(fixture.bundle, fixture.hash)
  const converted = convertV2BundleToV3(fixture.bundle, review, {
    sourceBundleSha256: fixture.hash,
    sourceBundleBytes: fixture.bytes,
  })

  assert.equal(
    converted.attemptId,
    'legacy-curation-v2-magic-ui-20260901-v3-63b47bc7d261',
  )
  assert.equal(converted.classification.curatorId, fixture.bundle.qa.semanticReviewerId)
  assert.equal(converted.classification.reviewerId, review.editorialReviewerId)
  assert.deepEqual(converted.qa, {
    curatorId: fixture.bundle.qa.semanticReviewerId,
    technicalPassed: fixture.bundle.qa.technicalPassed,
    semanticReviewerId: review.editorialReviewerId,
    semanticPassed: true,
    editorialReviewerId: review.editorialReviewerId,
  })
  assert.notEqual(converted.qa.curatorId, fixture.bundle.qa.curatorId)
  assert.deepEqual(evidenceBundleErrors(converted), [])
})

test('reviewed editorial accepts multiple direct evidence records for the same field', async () => {
  const fixture = await readV2Fixture('magic-ui')
  const review = reviewFor(fixture.bundle, fixture.hash)
  review.editorial.evidence.push({
    field: 'descriptionZh',
    evidenceUrl: fixture.bundle.pages.find(({ role }) => role === 'proof').finalUrl,
    statement: '具体组件页补充证明简介中的安装、预览与实现方式。',
  })
  const converted = convertV2BundleToV3(fixture.bundle, review, {
    sourceBundleSha256: fixture.hash,
    sourceBundleBytes: fixture.bytes,
  })
  assert.deepEqual(evidenceBundleErrors(converted), [])
  assert.equal(converted.editorial.descriptionZh, review.editorial.descriptionZh)
})

test('fact verdicts match final facts by unique field rather than array position', async () => {
  const fixture = await readV2Fixture('magic-ui')
  const reorderedReview = reviewFor(fixture.bundle, fixture.hash)
  reorderedReview.factVerdicts.reverse()
  const converted = convertV2BundleToV3(fixture.bundle, reorderedReview, {
    sourceBundleSha256: fixture.hash,
    sourceBundleBytes: fixture.bytes,
  })
  assert.deepEqual(evidenceBundleErrors(converted), [])

  const duplicateReview = reviewFor(fixture.bundle, fixture.hash)
  duplicateReview.factVerdicts[1] = structuredClone(duplicateReview.factVerdicts[0])
  assert.throws(
    () => convertV2BundleToV3(fixture.bundle, duplicateReview, {
      sourceBundleSha256: fixture.hash,
      sourceBundleBytes: fixture.bytes,
    }),
    /factVerdicts.*duplicate|factVerdicts.*missing|exactly one PASS/iu,
  )
})

test('fact correction contract rejects implicit additions, missing replacements, duplicates, and omitted verdicts', async () => {
  const fixture = await readV2Fixture('magic-ui')
  const cases = [
    {
      label: 'implicit-addition',
      pattern: /factVerdicts must contain exactly|missing final fact/iu,
      mutate(review) {
        review.factVerdicts.push({
          field: 'organization',
          finalValue: 'Imaginary Organization',
          sourceUrl: fixture.bundle.official.finalUrl,
          evidence: 'No correction exists for this attempted addition.',
          confidence: 1,
          verdict: 'PASS',
        })
      },
    },
    {
      label: 'missing-replacement',
      pattern: /replace field does not exist/iu,
      mutate(review) {
        review.factCorrections.push({
          operation: 'replace',
          field: 'organization',
          value: 'Imaginary Organization',
          sourceUrl: fixture.bundle.official.finalUrl,
          evidence: 'A replacement cannot create a missing field.',
          confidence: 1,
        })
      },
    },
    {
      label: 'duplicate-correction',
      pattern: /factCorrections contains duplicate field/iu,
      mutate(review) {
        const correction = {
          operation: 'replace',
          field: 'author',
          value: fixture.bundle.facts.find(({ field }) => field === 'author').value,
          sourceUrl: fixture.bundle.official.finalUrl,
          evidence: 'The same field cannot be corrected twice.',
          confidence: 1,
        }
        review.factCorrections.push(correction, structuredClone(correction))
      },
    },
    {
      label: 'omitted-verdict',
      pattern: /factVerdicts must contain exactly|missing final fact/iu,
      mutate(review) {
        review.factVerdicts.pop()
      },
    },
  ]
  for (const invalidCase of cases) {
    const review = reviewFor(fixture.bundle, fixture.hash)
    invalidCase.mutate(review)
    assert.throws(
      () => convertV2BundleToV3(fixture.bundle, review, {
        sourceBundleSha256: fixture.hash,
        sourceBundleBytes: fixture.bytes,
      }),
      invalidCase.pattern,
      invalidCase.label,
    )
  }
})

test('uses the independently reviewed editorial description instead of a disproven v2 description', async () => {
  const fixture = await readV2Fixture('origin-ui')
  const finalDescription = 'Coss UI 是 Cal.com 官方设计系统提供的现代界面组件入口，基于 Base UI 展示可筛选的应用控件、完整文档与可复用实例，方便团队核对组件范围、交互方式和源码证据。'
  const correction = {
    operation: 'replace',
    field: 'license',
    value: 'proprietary',
    sourceUrl: fixture.bundle.official.finalUrl,
    evidence: 'Fixture editorial review directly verified the current proprietary rights notice.',
    confidence: 1,
  }
  const finalFacts = correctedFactRecords(fixture.bundle, [correction])
  const review = reviewFor(fixture.bundle, fixture.hash, {
    descriptionZh: finalDescription,
    editorial: {
      name: 'Coss UI',
      descriptionZh: finalDescription,
      pricing: 'Free',
      evidence: [
        {
          field: 'name',
          evidenceUrl: fixture.bundle.official.finalUrl,
          statement: '官方入口直接显示 Coss UI 名称。',
        },
        {
          field: 'descriptionZh',
          evidenceUrl: fixture.bundle.pages.find(({ role }) => role === 'breadth').finalUrl,
          statement: '官方范围页支持重新撰写后的事实描述。',
        },
        {
          field: 'pricing',
          evidenceUrl: fixture.bundle.official.finalUrl,
          statement: '官方入口支持当前免费访问状态。',
        },
      ],
      verdict: 'PASS',
    },
    subcategory: 'general-ui-components',
    facets: controlledFacets('proprietary', 'closed-source'),
    factCorrections: [correction],
    factVerdicts: finalFacts.map((fact) => ({
      field: fact.field,
      finalValue: fact.value,
      sourceUrl: fact.sourceUrl,
      evidence: fact.evidence,
      ...(Object.hasOwn(fact, 'confidence') ? { confidence: fact.confidence } : {}),
      verdict: 'PASS',
    })),
  })

  const converted = convertV2BundleToV3(fixture.bundle, review, {
    sourceBundleSha256: fixture.hash,
    sourceBundleBytes: fixture.bytes,
  })
  assert.equal(converted.editorial.descriptionZh, finalDescription)
  assert.equal(converted.editorial.pricing, 'Free')
  assert.notEqual(converted.editorial.descriptionZh, fixture.bundle.curation.descriptionZh)
  assert.deepEqual(converted.pages, fixture.bundle.pages)
  assert.deepEqual(converted.official, fixture.bundle.official)
  assert.deepEqual(evidenceBundleErrors(converted), [])
})

test('applies only explicit hash-locked add and replace fact corrections', async () => {
  const hoverFixture = await readV2Fixture('hover-dev')
  const addCorrection = {
    operation: 'add',
    field: 'license',
    value: 'proprietary',
    sourceUrl: hoverFixture.bundle.official.finalUrl,
    evidence: 'Fixture editorial review directly verified the published proprietary rights notice.',
    confidence: 1,
  }
  const hoverReview = reviewFor(hoverFixture.bundle, hoverFixture.hash, {
    facets: controlledFacets('proprietary', 'closed-source'),
    factCorrections: [addCorrection],
    factVerdicts: [
      ...hoverFixture.bundle.facts.map((fact) => ({
        field: fact.field,
        finalValue: fact.value,
        sourceUrl: fact.sourceUrl,
        evidence: fact.evidence,
        confidence: fact.confidence,
        verdict: 'PASS',
      })),
      {
        field: addCorrection.field,
        finalValue: addCorrection.value,
        sourceUrl: addCorrection.sourceUrl,
        evidence: addCorrection.evidence,
        confidence: addCorrection.confidence,
        verdict: 'PASS',
      },
    ],
  })
  const hoverBefore = structuredClone(hoverFixture.bundle)
  const hoverV3 = convertV2BundleToV3(hoverFixture.bundle, hoverReview, {
    sourceBundleSha256: hoverFixture.hash,
    sourceBundleBytes: hoverFixture.bytes,
  })
  assert.deepEqual(evidenceBundleErrors(hoverV3), [])
  assert.deepEqual(hoverV3.facts.slice(0, -1), hoverFixture.bundle.facts)
  assert.deepEqual(hoverV3.facts.at(-1), {
    field: addCorrection.field,
    value: addCorrection.value,
    sourceUrl: addCorrection.sourceUrl,
    evidence: addCorrection.evidence,
    confidence: addCorrection.confidence,
  })
  assert.deepEqual(hoverFixture.bundle, hoverBefore)

  const originFixture = await readV2Fixture('origin-ui')
  const replaceCorrection = {
    operation: 'replace',
    field: 'license',
    value: 'proprietary',
    sourceUrl: originFixture.bundle.official.finalUrl,
    evidence: 'Fixture editorial review directly verified the replacement proprietary rights notice.',
    confidence: 1,
  }
  const originReview = reviewFor(originFixture.bundle, originFixture.hash, {
    subcategory: 'general-ui-components',
    facets: controlledFacets('proprietary', 'closed-source'),
    factCorrections: [replaceCorrection],
    factVerdicts: originFixture.bundle.facts.map((fact) => (
      fact.field === 'license'
        ? {
          field: replaceCorrection.field,
          finalValue: replaceCorrection.value,
          sourceUrl: replaceCorrection.sourceUrl,
          evidence: replaceCorrection.evidence,
          confidence: replaceCorrection.confidence,
          verdict: 'PASS',
        }
        : {
          field: fact.field,
          finalValue: fact.value,
          sourceUrl: fact.sourceUrl,
          evidence: fact.evidence,
          confidence: fact.confidence,
          verdict: 'PASS',
        }
    )),
  })
  const originV3 = convertV2BundleToV3(originFixture.bundle, originReview, {
    sourceBundleSha256: originFixture.hash,
    sourceBundleBytes: originFixture.bytes,
  })
  assert.deepEqual(evidenceBundleErrors(originV3), [])
  assert.deepEqual(
    originV3.facts.filter(({ field }) => field !== 'license'),
    originFixture.bundle.facts.filter(({ field }) => field !== 'license'),
  )
  assert.deepEqual(originV3.facts.find(({ field }) => field === 'license'), {
    field: replaceCorrection.field,
    value: replaceCorrection.value,
    sourceUrl: replaceCorrection.sourceUrl,
    evidence: replaceCorrection.evidence,
    confidence: replaceCorrection.confidence,
  })
})

test('pure conversion computes the source hash from bytes and rejects a mismatched object', async () => {
  const fixture = await readV2Fixture('magic-ui')
  const tamperedBundle = structuredClone(fixture.bundle)
  tamperedBundle.curation.name = 'Tampered Magic UI'
  const review = reviewFor(tamperedBundle, fixture.hash, {
    editorial: {
      ...reviewFor(tamperedBundle, fixture.hash).editorial,
      name: 'Tampered Magic UI',
    },
  })
  assert.throws(
    () => convertV2BundleToV3(tamperedBundle, review, {
      sourceBundleSha256: fixture.hash,
      sourceBundleBytes: fixture.bytes,
    }),
    /source bundle object.*bytes|source bytes.*mismatch/iu,
  )
})

test('migrates the exact six-site set atomically with stable bytes and thin public projections', async (t) => {
  const fixture = await prepareSixSiteFixture(t)
  const inputBefore = new Map(await Promise.all(SITE_IDS.map(async (siteId) => [
    siteId,
    await readFile(join(fixture.inputDir, `${siteId}.json`)),
  ])))

  const first = await migrateCuratedSitesV3({
    inputDir: fixture.inputDir,
    outputDir: fixture.outputDir,
    reviewManifest: fixture.reviewManifest,
    lockPath: join(fixture.root, '.fixture-v3.lock'),
    runId: () => 'fixture-v3-first',
  })
  assert.deepEqual(first.siteIds, SITE_IDS)
  assert.deepEqual((await readdir(fixture.outputDir)).sort(), SITE_IDS.map((id) => `${id}.json`).sort())

  const firstBytes = new Map()
  for (const siteId of SITE_IDS) {
    const outputBytes = await readFile(join(fixture.outputDir, `${siteId}.json`))
    firstBytes.set(siteId, outputBytes)
    const bundle = JSON.parse(outputBytes)
    assert.deepEqual(evidenceBundleErrors(bundle), [])
    const publicSite = toPublicSite(bundle)
    for (const legacyField of ['resourceEssence', 'score', 'tags']) {
      assert.equal(Object.hasOwn(publicSite, legacyField), false)
    }
    assert.equal(publicSite.shots.length, 3)
    for (const shot of publicSite.shots) {
      for (const field of ['title', 'selectionRationale', 'inputUrl', 'sourceUrl']) {
        assert.equal(typeof shot[field], 'string')
        assert.ok(shot[field].length > 0)
      }
    }
    assert.deepEqual(
      await readFile(join(fixture.inputDir, `${siteId}.json`)),
      inputBefore.get(siteId),
    )
  }

  const second = await migrateCuratedSitesV3({
    inputDir: fixture.inputDir,
    outputDir: fixture.outputDir,
    reviewManifest: fixture.reviewManifest,
    lockPath: join(fixture.root, '.fixture-v3.lock'),
    runId: () => 'fixture-v3-second',
  })
  assert.deepEqual(second.siteIds, SITE_IDS)
  for (const siteId of SITE_IDS) {
    assert.deepEqual(
      await readFile(join(fixture.outputDir, `${siteId}.json`)),
      firstBytes.get(siteId),
      `${siteId} output must be byte-stable across reruns`,
    )
  }
})

test('real six-site editorial manifest migrates current raw v2 bytes only into a temporary output', async (t) => {
  const root = await makeScratch(t)
  const outputDir = join(root, 'real-manifest-v3')
  const inputBefore = new Map(await Promise.all(SITE_IDS.map(async (siteId) => [
    siteId,
    await readFile(join(APPROVED_V2_DIRECTORY, `${siteId}.json`)),
  ])))

  const result = await migrateCuratedSitesV3({
    inputDir: APPROVED_V2_DIRECTORY,
    outputDir,
    reviewManifestPath: REAL_REVIEW_MANIFEST_PATH,
    lockPath: join(root, '.real-manifest-v3.lock'),
    runId: () => 'real-manifest-v3',
  })
  assert.deepEqual(result.siteIds, SITE_IDS)
  for (const siteId of SITE_IDS) {
    const bundle = JSON.parse(await readFile(join(outputDir, `${siteId}.json`)))
    assert.deepEqual(evidenceBundleErrors(bundle), [], siteId)
    assert.equal(bundle.entityId, `entity-${siteId}`)
    assert.equal(bundle.entryId, siteId)
    assert.deepEqual(
      await readFile(join(APPROVED_V2_DIRECTORY, `${siteId}.json`)),
      inputBefore.get(siteId),
    )
  }
})

test('rejects every incomplete or unsafe review manifest before writing any output', async (t) => {
  const fixture = await prepareSixSiteFixture(t)
  const cases = [
    {
      label: 'missing-site',
      pattern: /exactly six|exactly.*records/iu,
      mutate(manifest) {
        manifest.sites.pop()
      },
    },
    {
      label: 'wrong-hash',
      pattern: /hash mismatch/iu,
      mutate(manifest) {
        const review = manifest.sites[0]
        const wrongHash = '0'.repeat(64)
        review.sourceV2BundleSha256 = wrongHash
        review.sourceBundleSha256 = wrongHash
        manifest.inputHashes[review.siteId] = wrongHash
      },
    },
    {
      label: 'same-reviewer',
      pattern: /must differ from the v2 curator and semantic reviewer/iu,
      mutate(manifest) {
        manifest.reviewerId = 'capture-tool-v2'
        for (const review of manifest.sites) {
          review.editorialReviewerId = manifest.reviewerId
        }
      },
    },
    {
      label: 'needs-review',
      pattern: /classificationStatus must be confirmed/iu,
      mutate(manifest) {
        manifest.sites[0].classificationStatus = 'needs-review'
      },
    },
    {
      label: 'unknown-facet',
      pattern: /unknown technologies facet/iu,
      mutate(manifest) {
        manifest.sites[0].facets.technologies.push('made-up-agent-runtime')
      },
    },
    {
      label: 'legacy-agent-category',
      pattern: /fixed classification mapping|unknown primary category|converted v3 bundle is invalid/iu,
      mutate(manifest) {
        manifest.sites[0].primaryCategory = 'agent-ai-ui'
      },
    },
    {
      label: 'legacy-review-fields',
      pattern: /review site.*(?:resourceEssence|score|tags).*not allowed/iu,
      mutate(manifest) {
        manifest.sites[0].resourceEssence = 'reusable-implementation'
        manifest.sites[0].score = 90
        manifest.sites[0].tags = ['free-form-agent-ui']
      },
    },
    {
      label: 'correction-without-evidence',
      pattern: /factCorrections.*evidence.*non-empty/iu,
      mutate(manifest) {
        const review = manifest.sites.find(({ factCorrections }) => factCorrections.length > 0)
        review.factCorrections[0].evidence = ''
      },
    },
    {
      label: 'editorial-not-passed',
      pattern: /editorial verdict must be PASS/iu,
      mutate(manifest) {
        manifest.sites[0].editorial.verdict = 'NEEDS_REVIEW'
      },
    },
  ]

  for (const [index, invalidCase] of cases.entries()) {
    const manifest = structuredClone(fixture.reviewManifest)
    invalidCase.mutate(manifest)
    const outputDir = join(fixture.root, `rejected-${index}-${invalidCase.label}`)
    const lockPath = join(fixture.root, `rejected-${index}.lock`)
    await assert.rejects(
      migrateCuratedSitesV3({
        inputDir: fixture.inputDir,
        outputDir,
        reviewManifest: manifest,
        lockPath,
        runId: () => `rejected-${index}`,
      }),
      invalidCase.pattern,
    )
    await assertMissing(join(outputDir, 'magic-ui.json'))
    await assertMissing(lockPath)
  }
})

test('API and CLI refuse to invent a default editorial review and write nothing', async (t) => {
  const fixture = await prepareSixSiteFixture(t)
  const outputDir = join(fixture.root, 'no-review-output')
  await assert.rejects(
    migrateCuratedSitesV3({
      inputDir: fixture.inputDir,
      outputDir,
      lockPath: join(fixture.root, 'no-review.lock'),
    }),
    /exactly one external reviewManifest or reviewManifestPath/iu,
  )
  await assert.rejects(
    main([]),
    /requires an explicit --review-manifest/iu,
  )
  await assertMissing(join(outputDir, 'magic-ui.json'))
  await assertMissing(join(fixture.root, 'no-review.lock'))
})

test('transaction failure restores all six prior outputs and removes its artifacts', async (t) => {
  const fixture = await prepareSixSiteFixture(t)
  await mkdir(fixture.outputDir, { recursive: true })
  const priorBytes = new Map()
  for (const siteId of SITE_IDS) {
    const bytes = Buffer.from(`prior-v3-output:${siteId}\n`)
    priorBytes.set(siteId, bytes)
    await writeFile(join(fixture.outputDir, `${siteId}.json`), bytes)
  }

  const runId = 'atomic-v3-fixture'
  let publishRenames = 0
  const fs = {
    ...nodeFs,
    async rename(from, to) {
      if (String(from).includes('.tmp') && String(to).endsWith('.json')) {
        publishRenames += 1
        if (publishRenames === 3) throw new Error('injected third v3 publish failure')
      }
      return nodeFs.rename(from, to)
    },
  }
  const lockPath = join(fixture.root, '.atomic-v3.lock')
  await assert.rejects(
    migrateCuratedSitesV3({
      inputDir: fixture.inputDir,
      outputDir: fixture.outputDir,
      reviewManifest: fixture.reviewManifest,
      fs,
      lockPath,
      runId: () => runId,
    }),
    /injected third v3 publish failure/iu,
  )
  for (const siteId of SITE_IDS) {
    assert.deepEqual(
      await readFile(join(fixture.outputDir, `${siteId}.json`)),
      priorBytes.get(siteId),
    )
  }
  await assertMissing(lockPath)
  const remainingNames = await readdir(fixture.root, { recursive: true })
  assert.equal(remainingNames.some((name) => String(name).includes(runId)), false)
})

test('rejects input/output, target/lock, and journal namespace collisions', async (t) => {
  const fixture = await prepareSixSiteFixture(t)
  const inputBefore = await Promise.all(SITE_IDS.map((siteId) => (
    readFile(join(fixture.inputDir, `${siteId}.json`))
  )))

  await assert.rejects(
    migrateCuratedSitesV3({
      inputDir: fixture.inputDir,
      outputDir: fixture.inputDir,
      reviewManifest: fixture.reviewManifest,
      lockPath: join(fixture.root, 'overlap.lock'),
      runId: () => 'overlap',
    }),
    /input directory containment|outside the v2 input directory|distinct/iu,
  )
  for (let index = 0; index < SITE_IDS.length; index += 1) {
    assert.deepEqual(
      await readFile(join(fixture.inputDir, `${SITE_IDS[index]}.json`)),
      inputBefore[index],
    )
  }

  const targetLockOutput = join(fixture.root, 'target-lock-output')
  await assert.rejects(
    migrateCuratedSitesV3({
      inputDir: fixture.inputDir,
      outputDir: targetLockOutput,
      reviewManifest: fixture.reviewManifest,
      lockPath: join(targetLockOutput, 'magic-ui.json'),
      runId: () => 'target-lock',
    }),
    /lock collides with an output target/iu,
  )
  await assertMissing(join(targetLockOutput, 'magic-ui.json'))

  const journalOutput = join(fixture.root, 'journal-output')
  const journalRunId = 'journal-clash'
  const journalLockPath = join(
    journalOutput,
    `journal.${journalRunId}.00000001.json`,
  )
  await assert.rejects(
    migrateCuratedSitesV3({
      inputDir: fixture.inputDir,
      outputDir: journalOutput,
      reviewManifest: fixture.reviewManifest,
      lockPath: journalLockPath,
      runId: () => journalRunId,
    }),
    /namespace collision|reserved journal namespace/iu,
  )
  await assertMissing(join(journalOutput, 'magic-ui.json'))
  await assertMissing(journalLockPath)
})

test('path preflight uses the injected filesystem to reject junction and inode aliases before mutation', async (t) => {
  const fixture = await prepareSixSiteFixture(t)
  const outputDir = join(fixture.root, 'lexically-separate-output')
  const lockPath = join(fixture.root, 'lexically-separate.lock')
  const inputRealPath = await nodeFs.realpath(fixture.inputDir)
  const inputStat = await nodeFs.stat(fixture.inputDir)
  let mutationCalls = 0
  const fs = {
    ...nodeFs,
    async realpath(path) {
      if (resolve(path) === resolve(outputDir)) return inputRealPath
      return nodeFs.realpath(path)
    },
    async stat(path) {
      if (resolve(path) === resolve(outputDir)) return inputStat
      return nodeFs.stat(path)
    },
  }
  for (const method of ['mkdir', 'open', 'rename', 'rm']) {
    fs[method] = async () => {
      mutationCalls += 1
      throw new Error(`unexpected ${method} mutation`)
    }
  }

  await assert.rejects(
    migrateCuratedSitesV3({
      inputDir: fixture.inputDir,
      outputDir,
      reviewManifest: fixture.reviewManifest,
      fs,
      lockPath,
      runId: () => 'path-alias-preflight',
    }),
    /output.*input.*alias|output.*inside.*input|inode.*alias/iu,
  )
  assert.equal(mutationCalls, 0)
  for (const siteId of SITE_IDS) {
    assert.deepEqual(
      await readFile(join(fixture.inputDir, `${siteId}.json`)),
      fixture.fixtures.find(({ bundle }) => bundle.siteId === siteId).bytes,
    )
  }
})

test('path preflight rejects lock and output hardlinks to any raw v2 input file', async (t) => {
  const fixture = await prepareSixSiteFixture(t)
  const sourcePath = join(fixture.inputDir, 'magic-ui.json')
  const sourceBytes = await readFile(sourcePath)
  const lockAlias = join(fixture.root, 'input-file-hardlink.lock')
  await nodeFs.link(sourcePath, lockAlias)
  await assert.rejects(
    migrateCuratedSitesV3({
      inputDir: fixture.inputDir,
      outputDir: join(fixture.root, 'hardlink-lock-output'),
      reviewManifest: fixture.reviewManifest,
      lockPath: lockAlias,
      runId: () => 'hardlink-lock',
    }),
    /lock.*hardlink.*input|lock.*inode alias.*input/iu,
  )
  assert.deepEqual(await readFile(sourcePath), sourceBytes)
  await nodeFs.unlink(lockAlias)

  const outputDir = join(fixture.root, 'hardlink-target-output')
  await mkdir(outputDir, { recursive: true })
  const outputAlias = join(outputDir, 'magic-ui.json')
  await nodeFs.link(sourcePath, outputAlias)
  await assert.rejects(
    migrateCuratedSitesV3({
      inputDir: fixture.inputDir,
      outputDir,
      reviewManifest: fixture.reviewManifest,
      lockPath: join(fixture.root, 'hardlink-target.lock'),
      runId: () => 'hardlink-target',
    }),
    /output.*hardlink.*input|output.*inode alias.*input/iu,
  )
  assert.deepEqual(await readFile(sourcePath), sourceBytes)
})

test('Windows junction cannot redirect v3 output into the raw v2 input directory', async (t) => {
  if (process.platform !== 'win32') {
    t.skip('Windows junction behavior is covered by the injected realpath test on this platform')
    return
  }
  const fixture = await prepareSixSiteFixture(t)
  const junctionPath = join(fixture.root, 'approved-v2-junction')
  try {
    await nodeFs.symlink(fixture.inputDir, junctionPath, 'junction')
  } catch (error) {
    if (error?.code === 'EPERM' || error?.code === 'EACCES') {
      t.diagnostic(`junction creation unavailable: ${error.code}`)
      return
    }
    throw error
  }
  const outputThroughJunction = join(junctionPath, 'would-overwrite-input')
  try {
    await assert.rejects(
      migrateCuratedSitesV3({
        inputDir: fixture.inputDir,
        outputDir: outputThroughJunction,
        reviewManifest: fixture.reviewManifest,
        lockPath: join(fixture.root, 'junction.lock'),
        runId: () => 'junction-alias',
      }),
      /output.*input.*containment|output.*inside.*input/iu,
    )
    await assertMissing(join(fixture.inputDir, 'would-overwrite-input', 'magic-ui.json'))
  } finally {
    await nodeFs.unlink(junctionPath)
  }
})

test('post-read path recheck rejects an output junction swapped in after initial preflight', async (t) => {
  const fixture = await prepareSixSiteFixture(t)
  const outputDir = join(fixture.root, 'post-read-swapped-output')
  const lockPath = join(fixture.root, 'post-read-swapped.lock')
  const inputBefore = new Map(await Promise.all(SITE_IDS.map(async (siteId) => [
    siteId,
    await readFile(join(fixture.inputDir, `${siteId}.json`)),
  ])))
  let completedInputReads = 0
  let swapArmed = false
  let junctionCreated = false
  const fs = {
    ...nodeFs,
    async open(path, ...args) {
      const handle = await nodeFs.open(path, ...args)
      if (!String(path).endsWith('.tmp')) return handle
      return {
        async write(...writeArgs) {
          return handle.write(...writeArgs)
        },
        async sync(...syncArgs) {
          return handle.sync(...syncArgs)
        },
        async truncate(...truncateArgs) {
          return handle.truncate(...truncateArgs)
        },
        async close() {
          await handle.close()
          if (swapArmed && !junctionCreated) {
            await nodeFs.rm(outputDir, { force: true, recursive: true })
            await nodeFs.symlink(
              fixture.inputDir,
              outputDir,
              process.platform === 'win32' ? 'junction' : 'dir',
            )
            junctionCreated = true
          }
        },
      }
    },
    async readFile(path, ...args) {
      const bytes = await nodeFs.readFile(path, ...args)
      if (
        dirname(resolve(path)) === resolve(fixture.inputDir) &&
        String(path).endsWith('.json')
      ) {
        completedInputReads += 1
        if (completedInputReads === SITE_IDS.length) {
          swapArmed = true
        }
      }
      return bytes
    },
  }
  try {
    await assert.rejects(
      migrateCuratedSitesV3({
        inputDir: fixture.inputDir,
        outputDir,
        reviewManifest: fixture.reviewManifest,
        fs,
        lockPath,
        runId: () => 'post-read-swap',
      }),
      /output.*input.*containment|protected.*path|post-read.*alias/iu,
    )
    for (const siteId of SITE_IDS) {
      assert.deepEqual(
        await readFile(join(fixture.inputDir, `${siteId}.json`)),
        inputBefore.get(siteId),
      )
    }
    await assertMissing(lockPath)
  } finally {
    if (junctionCreated) {
      await nodeFs.unlink(outputDir).catch((error) => {
        if (error?.code !== 'ENOENT') throw error
      })
    }
  }
})

test('malicious review objects fail closed without invoking getters or writing output', async (t) => {
  const fixture = await prepareSixSiteFixture(t)
  let getterCalls = 0
  const accessorManifest = structuredClone(fixture.reviewManifest)
  const originalName = accessorManifest.sites[0].editorial.name
  Object.defineProperty(accessorManifest.sites[0].editorial, 'name', {
    enumerable: true,
    get() {
      getterCalls += 1
      return originalName
    },
  })
  const symbolManifest = structuredClone(fixture.reviewManifest)
  symbolManifest[Symbol('hidden-review-state')] = true
  const pollutedManifest = structuredClone(fixture.reviewManifest)
  Object.defineProperty(pollutedManifest.sites[0], '__proto__', {
    enumerable: true,
    value: { polluted: true },
  })
  const proxyManifest = new Proxy(structuredClone(fixture.reviewManifest), {
    ownKeys() {
      throw new Error('contained proxy trap')
    },
  })
  const cases = [
    ['accessor', accessorManifest, /data property|accessor/iu],
    ['symbol', symbolManifest, /symbol/iu],
    ['proto', pollutedManifest, /__proto__/iu],
    ['proxy', proxyManifest, /inspect.*safely|snapshot.*safely|proxy/iu],
  ]
  for (const [label, reviewManifest, pattern] of cases) {
    const outputDir = join(fixture.root, `malicious-${label}-output`)
    const lockPath = join(fixture.root, `malicious-${label}.lock`)
    await assert.rejects(
      migrateCuratedSitesV3({
        inputDir: fixture.inputDir,
        outputDir,
        reviewManifest,
        lockPath,
        runId: () => `malicious-${label}`,
      }),
      pattern,
    )
    await assertMissing(join(outputDir, 'magic-ui.json'))
    await assertMissing(lockPath)
  }
  assert.equal(getterCalls, 0)
  assert.equal(Object.prototype.polluted, undefined)
})
