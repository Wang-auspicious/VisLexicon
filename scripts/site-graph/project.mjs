import fs from 'node:fs'
import path from 'node:path'
import { FACET_AXES } from '../../src/lib/counts.js'
import { classificationErrors, facetsErrors } from '../../src/data/curation-taxonomy.js'
import { sitePublicationIssues } from '../../src/lib/site-publication.js'
import { curationIssues, reviewedClassification } from './gates.mjs'
import { sha256 } from './store.mjs'

function atomicWrite(file, bytes) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const temporary = `${file}.${process.pid}.tmp`
  fs.writeFileSync(temporary, bytes)
  try { fs.renameSync(temporary, file) } finally { if (fs.existsSync(temporary)) fs.rmSync(temporary) }
}

function identityUrl(value) {
  const url = new URL(value)
  url.hostname = url.hostname.toLowerCase()
  for (const key of [...url.searchParams.keys()]) if (/^(?:utm_|ref|referrer|spm|xsec_|session|token)/iu.test(key)) url.searchParams.delete(key)
  url.search = [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&')
  return url.href.replace(/(?<!:)\/$/u, '')
}

function pngDimensions(bytes) {
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('SITE_BUNDLE_SCREENSHOT_NOT_PNG')
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20)
  if (width < 320 || height < 200) throw new Error('SITE_BUNDLE_SCREENSHOT_UNDERSIZED')
  return { width, height }
}

function safeFile(root, ref) {
  const resolved = path.resolve(root, ref)
  if (!resolved.startsWith(`${path.resolve(root)}${path.sep}`)) throw new Error('SITE_BUNDLE_PATH_OUTSIDE_ROOT')
  return resolved
}

/** Adapt a currently reviewed graph entry to the existing data-only Site shelf. */
export function graphSiteBundle({ entry, sourceEntity, review, packet, evidence, sourceRoot, entryId = entry.entryId, runId }) {
  if (!/^[a-z0-9][a-z0-9-]*$/u.test(entryId)) throw new Error('SITE_BUNDLE_HANDLE_INVALID')
  if (entry.status !== 'approved' || review?.decision !== 'approved' || review.packetDigest !== packet.packetDigest) throw new Error('SITE_BUNDLE_CURRENT_REVIEW_REQUIRED')
  const editorialIssues = curationIssues({ ...entry, sourceEntity }, { review })
  if (editorialIssues.length) throw new Error(`SITE_BUNDLE_EDITORIAL_INVALID:${editorialIssues.join(',')}`)
  const classification = reviewedClassification(entry, review)
  const classificationIssues = classificationErrors(classification)
  if (classificationIssues.length) throw new Error(`SITE_BUNDLE_CLASSIFICATION_INVALID:${classificationIssues.join(',')}`)
  const facets = Object.fromEntries(FACET_AXES.map(axis => [axis, entry.facets?.[axis] || []]))
  if (facetsErrors(facets).length) throw new Error('SITE_BUNDLE_FACETS_INVALID')
  const images = []
  const pages = ['identity', 'breadth', 'proof'].map(role => {
    const page = entry.pages?.find(item => item.role === role)
    const shot = evidence.find(item => item.role === role && item.publicSafe !== false && item.sha256 === (page?.screenshot?.sha256 || page?.shot?.sha256))
    if (!page || !shot) throw new Error(`SITE_BUNDLE_SCREENSHOT_UNBOUND:${role}`)
    const bytes = fs.readFileSync(safeFile(sourceRoot, shot.ref))
    if (sha256(bytes) !== shot.sha256 || bytes.length !== Number(shot.bytes)) throw new Error(`SITE_BUNDLE_SCREENSHOT_HASH_MISMATCH:${role}`)
    const dimensions = pngDimensions(bytes)
    const fact = entry.facts.find(item => item.evidenceIds?.includes(shot.evidenceId) && item.claim)
    const identityReason = sourceEntity?.identityEvidence?.find(item => item.evidenceIds?.includes(shot.evidenceId))
    const selectionRationale = page.selectionRationale || entry.editorial?.pageReasons?.[role] || fact?.claim || identityReason?.statement
    if (!selectionRationale) throw new Error(`SITE_BUNDLE_PAGE_REASON_MISSING:${role}`)
    const src = `/shots/${entryId}/graph-${shot.sha256.slice(0, 24)}-${role}.png`
    images.push({ src, bytes, sha256: shot.sha256 })
    return { role, sourceUrl: page.sourceUrl || page.inputUrl, finalUrl: page.finalUrl || page.sourceUrl,
      title: page.title || entry.editorial.name, selectionRationale, capturedAt: shot.capturedAt ?? null,
      shot: { src, sha256: shot.sha256, bytes: bytes.length, ...dimensions, alt: `${entry.editorial.name}：${selectionRationale}` } }
  })
  const probe = entry.stages.probe.result
  const bundle = { schemaVersion: 3, entryId, entityId: entry.entityId, status: 'APPROVED',
    official: { inputUrl: entry.sourceUrl, finalUrl: probe.sourceSnapshot?.finalUrl || probe.finalUrl, checkedAt: probe.checkedAt || probe.sourceSnapshot?.checkedAt },
    editorial: entry.editorial, classification, facets, sourceEntity,
    curation: { atlasTerms: [], atlasTermsStatus: 'editor-draft' }, pages,
    facts: entry.facts.map(({ evidenceIds: _internalIds, quote, ...item }) => ({ ...item, evidence: item.claim || quote || null })),
    qa: { technicalPassed: true, semanticPassed: true, curatorId: entry.curatorId, semanticReviewerId: review.reviewer, editorialReviewerId: review.reviewer },
    graphProvenance: { runId, graphEntryId: entry.entryId, revision: entry.revision, packetDigest: packet.packetDigest,
      contentDigest: review.contentDigest, evidenceDigest: review.evidenceDigest, reviewedAt: review.reviewedAt, reviewId: review.reviewId },
    editorialVoice: { status: 'written', writtenAt: review.reviewedAt, note: '当前三页证据、具体中文简介、身份与分类已由独立策展代理复核。' } }
  const issues = sitePublicationIssues(bundle)
  if (!bundle.official.checkedAt || !bundle.official.finalUrl) issues.push('current-probe-snapshot-incomplete')
  if (issues.length) throw new Error(`SITE_BUNDLE_PUBLICATION_HELD:${issues.join(',')}`)
  return { bundle, images }
}

/** Call only from the graph's single coordinator; default is a reviewable dry run. */
export function projectApprovedSites(graph, { sourceDir, publicDir, catalog = [], historyDir = path.join(sourceDir, '.graph-revisions'), handleDecisions = {}, apply = false } = {}) {
  if (!sourceDir || !publicDir) throw new Error('SITE_BUNDLE_OUTPUT_DIRECTORIES_REQUIRED')
  const projection = graph.export()
  const state = graph.state()
  if (state.revision !== projection.graphRevision) throw new Error('SITE_BUNDLE_GRAPH_CHANGED_DURING_EXPORT')
  const catalogRows = Array.isArray(catalog) ? catalog : catalog.items || catalog.entries || []
  const prepared = [], held = []
  const existingHandles = new Map()
  if (fs.existsSync(sourceDir)) for (const name of fs.readdirSync(sourceDir).filter(name => name.endsWith('.json'))) {
    try {
      const record = JSON.parse(fs.readFileSync(path.join(sourceDir, name), 'utf8'))
      if (!record.entryId) throw new Error('entryId-missing')
      const url = identityUrl(record.official?.inputUrl || record.official?.finalUrl)
      if (record.status === 'QUARANTINED' && record.identityDisposition?.operation === 'duplicate-exact-url' && record.identityDisposition.sourceUrl === url && record.identityDisposition.canonicalEntryId) continue
      const handles = existingHandles.get(url) || new Set()
      handles.add(record.entryId)
      existingHandles.set(url, handles)
    } catch (error) { held.push({ file: name, reason: `existing-record-unreadable:${error.message}` }) }
  }
  for (const row of projection.rows) {
    const entry = state.entries[row.entryId]
    try {
      const handles = existingHandles.has(entry.sourceUrl) ? [...existingHandles.get(entry.sourceUrl)] : [...new Set(catalogRows.filter(item => {
        try { return identityUrl(item.url || item.canonicalUrl || item.sourceUrl || item.homepage) === entry.sourceUrl } catch { return false }
      }).map(item => item.entryId || item.id).filter(Boolean))]
      const suppliedDecision = handleDecisions[entry.sourceUrl]
      const decision = handles.length > 1 ? suppliedDecision : null
      if (suppliedDecision && handles.length === 1 && suppliedDecision.entryId !== handles[0]) throw new Error('SITE_BUNDLE_HANDLE_DECISION_INVALID')
      if (handles.length > 1 && !decision) throw new Error('SITE_BUNDLE_CATALOG_HANDLE_AMBIGUOUS')
      if (decision) {
        if (!handles.includes(decision.entryId) || typeof decision.actor !== 'string' || !decision.actor.trim() || typeof decision.reason !== 'string' || !decision.reason.trim() || !Array.isArray(decision.handles) || JSON.stringify([...handles].sort()) !== JSON.stringify([...decision.handles].sort())) throw new Error('SITE_BUNDLE_HANDLE_DECISION_INVALID')
        for (const handle of handles) if (sha256(fs.readFileSync(safeFile(sourceDir, `${handle}.json`))) !== decision.recordHashes?.[handle]) throw new Error('SITE_BUNDLE_HANDLE_DECISION_STALE')
      }
      const entryId = decision?.entryId || handles[0] || entry.entryId
      const result = graphSiteBundle({ entry, sourceEntity: state.entities?.[entry.entityId], review: state.reviews[entry.entryId],
        packet: graph.packet(entry.entryId), evidence: Object.values(state.evidence).filter(item => item.entryId === entry.entryId), sourceRoot: graph.root, entryId, runId: state.runId })
      const file = safeFile(sourceDir, `${entryId}.json`)
      const bytes = Buffer.from(`${JSON.stringify(result.bundle, null, 2)}\n`)
      const oldBytes = fs.existsSync(file) ? fs.readFileSync(file) : null
      const aliases = []
      if (decision) for (const handle of handles.filter(handle => handle !== entryId)) {
        const aliasFile = safeFile(sourceDir, `${handle}.json`), aliasBytes = fs.readFileSync(aliasFile), alias = JSON.parse(aliasBytes)
        if (identityUrl(alias.official?.inputUrl || alias.official?.finalUrl) !== entry.sourceUrl) throw new Error('SITE_BUNDLE_ALIAS_NOT_EXACT_URL')
        aliases.push({ file: aliasFile, entryId: handle, original: aliasBytes, value: { ...alias, status: 'QUARANTINED', identityDisposition: { operation: 'duplicate-exact-url', canonicalEntryId: entryId, sourceUrl: entry.sourceUrl, actor: decision.actor, reason: decision.reason, originalSha256: sha256(aliasBytes), reviewedPacketDigest: state.reviews[entry.entryId].packetDigest } } })
      }
      if (oldBytes && !oldBytes.equals(bytes)) {
        const prior = JSON.parse(oldBytes)
        if (identityUrl(prior.official?.inputUrl || prior.official?.finalUrl) !== entry.sourceUrl) throw new Error('SITE_BUNDLE_EXISTING_HANDLE_IDENTITY_CONFLICT')
      }
      if (apply) {
        if (oldBytes && !oldBytes.equals(bytes)) atomicWrite(safeFile(historyDir, `${entryId}-${sha256(oldBytes)}.json`), oldBytes)
        for (const image of result.images) {
          const target = safeFile(publicDir, image.src.replace(/^\//u, ''))
          if (fs.existsSync(target)) { if (sha256(fs.readFileSync(target)) !== image.sha256) throw new Error('SITE_BUNDLE_PUBLIC_IMAGE_CONFLICT') }
          else atomicWrite(target, image.bytes)
        }
        if (!oldBytes || !oldBytes.equals(bytes)) atomicWrite(file, bytes)
        for (const alias of aliases) {
          atomicWrite(safeFile(historyDir, `${alias.entryId}-${sha256(alias.original)}.json`), alias.original)
          atomicWrite(alias.file, `${JSON.stringify(alias.value, null, 2)}\n`)
        }
      }
      prepared.push({ graphEntryId: entry.entryId, entryId, file, status: apply ? 'applied' : 'ready', changed: !oldBytes || !oldBytes.equals(bytes), replacedExisting: Boolean(oldBytes), ...(decision ? { handleDecision: decision, aliases: aliases.map(alias => alias.entryId) } : {}), bundleSha256: sha256(bytes), packetDigest: state.reviews[entry.entryId].packetDigest })
    } catch (error) { held.push({ entryId: entry.entryId, reason: error.message }) }
  }
  return { runId: state.runId, graphRevision: state.revision, apply, graphApproved: projection.rows.length, prepared, held,
    publicBuildRequired: true, claimLimits: 'These are reviewed source bundles; actual site-index count is measured after build-public-data.' }
}
