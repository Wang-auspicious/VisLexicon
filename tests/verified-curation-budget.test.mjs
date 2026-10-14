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
