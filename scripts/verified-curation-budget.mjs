import fs from 'node:fs'
import path from 'node:path'
import {createHash} from 'node:crypto'

// The additional allowance is limited to the user's independently reviewed batch.
// Raw observations, queues and unreviewed corpus exports receive no allowance.
export function verifiedCurationAllowance(root, siteIndex, release = {}) {
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
    if (!(new Set([siteIndex.releaseId, ...(release.releaseAncestors || [])])).has(audit.releaseId)) fail('batch release mismatch')
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
      if (item?.status !== 'APPROVED' || item.releaseId !== siteIndex.releaseId || detail.status !== 'APPROVED' || item.revision !== entry.revision || detail.revision !== entry.revision || detail.releaseId !== siteIndex.releaseId) fail('projection mismatch')
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
  // Site-proof batches extend approved entries with digest-bound breadth/proof
  // evidence. Their source facts and copy were already approved in the base
  // bundle; this receipt validates the new screenshots and independent review.
  const siteProofDir = path.join(root, 'public/data/curation-batches')
  const siteProofFiles = fs.existsSync(siteProofDir)
    ? fs.readdirSync(siteProofDir).filter(name => /^site-proof-[a-z0-9-]+\.json$/.test(name)).sort()
    : []
  for (const file of siteProofFiles) {
    const siteProofPath = path.join(siteProofDir, file)
    const audit = JSON.parse(fs.readFileSync(siteProofPath, 'utf8'))
    if (audit.batchId !== path.basename(file, '.json') || !Number.isSafeInteger(audit.target) || audit.target < 1 || audit.entries?.length !== audit.target) fail('unexpected site-proof batch')
    if (!(new Set([siteIndex.releaseId, ...(release.releaseAncestors || [])])).has(audit.releaseId)) fail('site-proof batch release mismatch')
    for (const entry of audit.entries) {
      if (!/^[a-z0-9][a-z0-9._-]*$/i.test(entry.entryId) || ids.has(entry.entryId)) fail('invalid or duplicate site-proof entry')
      ids.add(entry.entryId)
      if (!/^[a-f0-9]{64}$/.test(entry.contentDigest) || entry.contentDigest !== entry.revision || !/^[a-f0-9]{64}$/.test(entry.sourceBundleSha256)) fail('invalid site-proof material digest')
      const review = entry.review
      const checks = ['breadthIsCatalog', 'proofIsItem', 'sameSiteNoErrors', 'textMatchesShots', 'chineseConcrete']
      if (review?.independent !== true || !/^[a-f0-9]{64}$/.test(review.curatorHash || '') || !/^[a-f0-9]{64}$/.test(review.reviewerHash || '')
        || review.curatorHash === review.reviewerHash || !/^[a-f0-9]{64}$/.test(entry.reviewSha256 || '')
        || review.verdict !== 'pass' || !Number.isFinite(Date.parse(review.reviewedAt))
        || !/^[a-f0-9]{64}$/.test(review.notesSha256 || '') || !checks.every(key => review.checks?.[key] === true)) fail('site-proof review incomplete')
      const item = siteIndex.items.find(item => item.entryId === entry.entryId)
      const detail = JSON.parse(fs.readFileSync(path.join(root, 'public/data/site', entry.entryId + '.json'), 'utf8'))
      if (item?.status !== 'APPROVED' || item.independentlyReviewed !== true || detail.status !== 'APPROVED'
        || item.releaseId !== siteIndex.releaseId || item.revision !== entry.revision || detail.revision !== entry.revision || detail.releaseId !== siteIndex.releaseId) fail('site-proof projection mismatch')
      const pages = Object.fromEntries((detail.pages || []).map(page => [page.role, page]))
      const roles = ['identity', 'breadth', 'proof']
      if (!roles.every(role => pages[role]?.shot?.src) || !Array.isArray(entry.screenshots) || entry.screenshots.length !== 3) fail('site-proof screenshots missing')
      const selection = {}
      for (const role of ['breadth', 'proof']) {
        const page = pages[role]
        selection[role] = {selectionRationale: page.selectionRationale, alt: page.shot.alt}
        if (entry.selection?.[role]?.selectionRationale !== page.selectionRationale || entry.selection?.[role]?.alt !== page.shot.alt) fail('site-proof notes differ from public copy')
      }
      if (!/^[a-f0-9]{64}$/.test(entry.selectionDigest || '')
        || createHash('sha256').update(JSON.stringify(selection)).digest('hex') !== entry.selectionDigest) fail('site-proof selection digest mismatch')
      const expectedReviewShots = [pages.breadth.shot.sha256, pages.proof.shot.sha256]
      if (JSON.stringify(review.shotSha256) !== JSON.stringify(expectedReviewShots)) fail('site-proof review not bound to current screenshots')
      for (const role of roles) {
        const shot = entry.screenshots.find(shot => shot.role === role)
        const actual = pages[role].shot
        const prefix = `/shots/${entry.entryId}/`
        if (typeof shot?.src !== 'string' || !shot.src.startsWith(prefix) || shot.src.includes('..') || shot.src.includes('\\')
          || actual.src !== shot.src || actual.sha256 !== shot.sha256 || actual.width !== 1280 || actual.height !== 900
          || !/^[a-f0-9]{64}$/.test(shot.sha256)) fail('site-proof screenshot identity mismatch')
        const bytes = fs.readFileSync(path.join(root, 'public', shot.src))
        if (createHash('sha256').update(bytes).digest('hex') !== shot.sha256) fail('site-proof screenshot bytes changed')
      }
    }
  }
  return ids
}
