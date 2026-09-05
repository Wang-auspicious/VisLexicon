import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import { classificationErrors, facetsErrors } from '../src/data/curation-taxonomy.js'
import { evidenceBundleErrors } from '../src/lib/curation-evidence.js'
import { readImageMetadata } from '../scripts/curation/image-metadata.mjs'

const DEMO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const BATCH_DIR = join(DEMO_ROOT, 'data', 'curation', 'research', '2026-09-02-batch-02')
const PUBLIC_ROOT = join(DEMO_ROOT, 'public')
const SITE_IDS = ['laws-of-ux', 'a11y-project', 'ecomm-design']

async function json(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

test('batch 02 keeps drafts, independent review, and screenshot metadata aligned', async () => {
  const review = await json(join(BATCH_DIR, 'independent-review.json'))
  assert.equal(review.overallVerdict, 'PASS')
  assert.equal(review.publicationEligible, false)
  assert.equal(review.reviewerId, 'independent-batch-02-reviewer')
  assert.deepEqual(review.sites.map(({ siteId }) => siteId), SITE_IDS)

  const hashes = new Set()
  for (const siteId of SITE_IDS) {
    const draft = await json(join(BATCH_DIR, `${siteId}.json`))
    const reviewed = review.sites.find((site) => site.siteId === siteId)
    assert.equal(draft.status, 'CAPTURED_PENDING_INDEPENDENT_REVIEW')
    assert.equal(reviewed.verdict, 'PASS')
    assert.notEqual(draft.qa.curatorId, review.reviewerId)
    assert.ok([...(draft.research.descriptionZh ?? '')].length >= 60)
    assert.ok([...(draft.research.descriptionZh ?? '')].length <= 120)
    assert.deepEqual(classificationErrors(reviewed.confirmedClassification), [])
    assert.deepEqual(facetsErrors(reviewed.confirmedFacets), [])
    assert.deepEqual(draft.pages.map(({ role }) => role).sort(), ['breadth', 'identity', 'proof'])

    for (const page of draft.pages) {
      const shotVerdict = reviewed.shotVerdicts.find(({ role }) => role === page.role)
      assert.equal(shotVerdict.verdict, 'PASS')
      assert.equal(shotVerdict.sha256, page.shot.sha256)
      const metadata = await readImageMetadata(join(PUBLIC_ROOT, page.shot.src.replace(/^\//u, '')))
      assert.deepEqual(
        {
          sha256: metadata.sha256,
          width: metadata.width,
          height: metadata.height,
          bytes: metadata.bytes,
        },
        {
          sha256: page.shot.sha256,
          width: page.shot.width,
          height: page.shot.height,
          bytes: page.shot.bytes,
        },
      )
      assert.equal(hashes.has(metadata.sha256), false)
      hashes.add(metadata.sha256)
    }
  }
  assert.equal(hashes.size, 9)
})

test('batch 02 assembled bundles pass the v3 evidence gate and contain no legacy fields', async () => {
  const directory = join(DEMO_ROOT, 'data', 'curation', 'staging', 'batch-02-v3-20260902')
  const names = (await readdir(directory)).filter((name) => name.endsWith('.json')).sort()
  assert.deepEqual(names, SITE_IDS.map((id) => `${id}.json`).sort())
  for (const name of names) {
    const bundle = await json(join(directory, name))
    assert.equal(bundle.schemaVersion, 3)
    assert.equal(bundle.status, 'APPROVED')
    assert.deepEqual(evidenceBundleErrors(bundle), [])
    for (const field of ['resourceEssence', 'score', 'tags']) assert.equal(Object.hasOwn(bundle, field), false)
  }
})
