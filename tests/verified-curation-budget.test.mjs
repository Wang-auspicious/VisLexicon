import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {verifiedCurationAllowance} from '../scripts/verified-curation-budget.mjs'

test('batch allowance follows current review, projection and image bytes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vislexicon-curation-budget-'))
  const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
  const save = (relative, value) => {
    const file = path.join(root, relative)
    fs.mkdirSync(path.dirname(file), {recursive: true})
    fs.writeFileSync(file, JSON.stringify(value))
  }
  try {
    const index = read('public/data/site-index.json')
    assert.equal(verifiedCurationAllowance(root, index).size, 0)
    const audit = read('public/data/curation-batches/extra-200-20261013.json')
    audit.entries = [audit.entries[0]]
    const entry = audit.entries[0]
    const detail = read(`public/data/site/${entry.entryId}.json`)
    save(`public/data/site/${entry.entryId}.json`, detail)
    for (const shot of entry.screenshots) {
      const destination = path.join(root, 'public', shot.src)
      fs.mkdirSync(path.dirname(destination), {recursive: true})
      fs.copyFileSync(path.join('public', shot.src), destination)
    }
    const auditPath = 'public/data/curation-batches/extra-200-20261013.json'
    save(auditPath, audit)
    assert.deepEqual([...verifiedCurationAllowance(root, index)], [entry.entryId])
    const kinds = entry.independentReviewKinds
    entry.independentReviewKinds = kinds.filter(kind => kind !== 'final')
    save(auditPath, audit)
    assert.throws(() => verifiedCurationAllowance(root, index), /review incomplete/)
    entry.independentReviewKinds = kinds
    save(auditPath, audit)
    detail.revision = 'changed'
    save(`public/data/site/${entry.entryId}.json`, detail)
    assert.throws(() => verifiedCurationAllowance(root, index), /projection mismatch/)
    detail.revision = entry.revision
    save(`public/data/site/${entry.entryId}.json`, detail)
    fs.appendFileSync(path.join(root, 'public', entry.screenshots[0].src), 'changed')
    assert.throws(() => verifiedCurationAllowance(root, index), /screenshot bytes changed/)
  } finally {
    const tempRoot = path.resolve(os.tmpdir()) + path.sep
    if (!path.resolve(root).startsWith(tempRoot)) throw new Error('Unexpected cleanup path')
    fs.rmSync(root, {recursive: true, force: true})
  }
})

test('both fixed reviewed batches receive allowance while H2 keeps digest, path and cohort gates', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vislexicon-two-curation-batches-'))
  const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
  const save = (relative, value) => {
    const file = path.join(root, relative)
    fs.mkdirSync(path.dirname(file), {recursive: true})
    fs.writeFileSync(file, JSON.stringify(value))
  }
  try {
    const index = read('public/data/site-index.json')
    const batches = ['extra-200-20261013', 'h2-intake-20261015'].map(batchId => {
      const audit = read(`public/data/curation-batches/${batchId}.json`)
      audit.target = batchId === 'extra-200-20261013' ? 200 : 142
      audit.entries = [audit.entries[0]]
      const entry = audit.entries[0]
      const detail = read(`public/data/site/${entry.entryId}.json`)
      save(`public/data/site/${entry.entryId}.json`, detail)
      for (const shot of entry.screenshots) {
        const destination = path.join(root, 'public', shot.src)
        fs.mkdirSync(path.dirname(destination), {recursive: true})
        fs.copyFileSync(path.join('public', shot.src), destination)
      }
      save(`public/data/curation-batches/${batchId}.json`, audit)
      return {audit, detail}
    })
    assert.deepEqual([...verifiedCurationAllowance(root, index)], batches.map(batch => batch.audit.entries[0].entryId))
    const {audit: h2, detail} = batches[1]
    const auditPath = 'public/data/curation-batches/h2-intake-20261015.json'
    const detailPath = `public/data/site/${h2.entries[0].entryId}.json`
    const validAudit = structuredClone(h2)
    const validDetail = structuredClone(detail)
    const reset = () => { save(auditPath, validAudit); save(detailPath, validDetail) }

    h2.entries[0].independentReviewKinds = ['classification', 'shots', 'facts', 'copy']
    save(auditPath, h2)
    assert.throws(() => verifiedCurationAllowance(root, index), /review incomplete/)
    reset()

    const wrongBytes = structuredClone(validAudit)
    wrongBytes.entries[0].screenshots[0].sha256 = '0'.repeat(64)
    const wrongDetail = structuredClone(validDetail)
    wrongDetail.pages.find(page => page.role === wrongBytes.entries[0].screenshots[0].role).shot.sha256 = '0'.repeat(64)
    save(auditPath, wrongBytes); save(detailPath, wrongDetail)
    assert.throws(() => verifiedCurationAllowance(root, index), /screenshot bytes changed/)
    reset()

    const wrongPath = structuredClone(validAudit)
    const pathDetail = structuredClone(validDetail)
    wrongPath.entries[0].screenshots[0].src = `/shots/extra-200-20261013/${validAudit.entries[0].entryId}/identity.webp`
    pathDetail.pages.find(page => page.role === wrongPath.entries[0].screenshots[0].role).shot.src = wrongPath.entries[0].screenshots[0].src
    save(auditPath, wrongPath); save(detailPath, pathDetail)
    assert.throws(() => verifiedCurationAllowance(root, index), /screenshot identity mismatch/)
    reset()

    const stale = structuredClone(validAudit)
    stale.entries[0].contentDigest = 'f'.repeat(64)
    save(auditPath, stale)
    assert.throws(() => verifiedCurationAllowance(root, index), /digest.*revision|projection mismatch/)
    reset()

    const prepared = structuredClone(validDetail)
    prepared.status = 'PREPARED'
    save(detailPath, prepared)
    assert.throws(() => verifiedCurationAllowance(root, index), /projection mismatch/)
    reset()

    const wrongTarget = structuredClone(validAudit)
    wrongTarget.target = 200
    save(auditPath, wrongTarget)
    assert.throws(() => verifiedCurationAllowance(root, index), /unexpected batch/)
    const oversized = structuredClone(validAudit)
    oversized.entries = Array.from({length: 143}, () => validAudit.entries[0])
    save(auditPath, oversized)
    assert.throws(() => verifiedCurationAllowance(root, index), /unexpected batch/)
    reset()
    assert.equal(verifiedCurationAllowance(root, index).size, 2)
  } finally {
    const tempRoot = path.resolve(os.tmpdir()) + path.sep
    if (!path.resolve(root).startsWith(tempRoot)) throw new Error('Unexpected cleanup path')
    fs.rmSync(root, {recursive: true, force: true})
  }
})
