import fs from 'node:fs'
import path from 'node:path'
import {createHash} from 'node:crypto'

// The additional allowance is limited to the user's independently reviewed batch.
// Raw observations, queues and unreviewed corpus exports receive no allowance.
export function verifiedCurationAllowance(root, siteIndex) {
  const fail = message => { throw new Error(`VERIFIED_CURATION_FAILED: ${message}`) }
  const ids = new Set()
  const batches = [
    {batchId: 'extra-200-20261013', target: 200},
    {batchId: 'h2-intake-20261015', target: 142},
  ]
  for (const contract of batches) {
    const auditPath = path.join(root, 'public/data/curation-batches', contract.batchId + '.json')
    if (!fs.existsSync(auditPath)) continue
    const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'))
    if (audit.batchId !== contract.batchId || audit.target !== contract.target || !Array.isArray(audit.entries) || audit.entries.length > contract.target) fail('unexpected batch')
    if (audit.releaseId !== siteIndex.releaseId) fail('batch release mismatch')
    for (const entry of audit.entries) {
      if (!/^[a-z0-9][a-z0-9._-]*$/i.test(entry.entryId) || ids.has(entry.entryId)) fail('invalid or duplicate entry')
      ids.add(entry.entryId)
      if (!/^[a-f0-9]{64}$/.test(entry.contentDigest)) fail('invalid material digest')
      const kinds = entry.independentReviewKinds
      if (!Array.isArray(kinds) || kinds.length !== 5 || !['classification', 'shots', 'facts', 'copy', 'final'].every(kind => kinds.includes(kind))) fail('review incomplete')
      const h2 = contract.batchId === 'h2-intake-20261015'
      if (h2 && !Number.isFinite(Date.parse(entry.reviewedAt))) fail('review incomplete')
      if (h2 && entry.contentDigest !== entry.revision) fail('material digest/revision mismatch')
      const item = siteIndex.items.find(item => item.entryId === entry.entryId)
      const detail = JSON.parse(fs.readFileSync(path.join(root, 'public/data/site', entry.entryId + '.json'), 'utf8'))
      if (item?.status !== 'APPROVED' || detail.status !== 'APPROVED' || item.revision !== entry.revision || detail.revision !== entry.revision || detail.releaseId !== audit.releaseId) fail('projection mismatch')
      if (!Array.isArray(entry.screenshots) || entry.screenshots.length !== 3) fail('three screenshots required')
      for (const role of ['identity', 'breadth', 'proof']) {
        const shot = entry.screenshots.find(shot => shot.role === role)
        const actual = detail.pages?.find(page => page.role === role)?.shot
        const prefix = `/shots/${contract.batchId}/${entry.entryId}/`
        if (typeof shot?.src !== 'string' || !shot.src.startsWith(prefix) || shot.src.includes('..') || shot.src.includes('\\') || actual?.src !== shot.src || actual.sha256 !== shot.sha256 || actual.width !== 1280 || actual.height !== 800) fail('screenshot identity mismatch')
        if (h2 && !/^[a-z0-9][a-z0-9._-]*\.webp$/i.test(shot.src.slice(prefix.length))) fail('screenshot identity mismatch')
        const bytes = fs.readFileSync(path.join(root, 'public', shot.src))
        if (createHash('sha256').update(bytes).digest('hex') !== shot.sha256) fail('screenshot bytes changed')
      }
    }
  }
  return ids
}
