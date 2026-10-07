import { CURATION_SUBCATEGORIES, facetsErrors } from '../../src/data/curation-taxonomy.js'

/** Evidence failures are useful audit results, but cannot satisfy the DAG. */
export function evidenceStageOutcome(stage, result) {
  let complete = result?.status === 'success'
  if (stage === 'explore' && complete) {
    const evidence = result.evidence || []
    const roles = ['identity', 'breadth', 'proof']
    complete = roles.every(role => evidence.some(item => item.role === role))
      && new Set(evidence.filter(item => roles.includes(item.role)).map(item => item.sha256).filter(Boolean)).size >= 3
      && !(result.pages || []).some(page => page.blocked || (page.status != null && (page.status < 200 || page.status >= 400)))
  }
  if (complete) return { status: 'succeeded', error: null, retryable: false }
  const retryable = result?.status === 'retryable-failure' || result?.status === 'partial'
  return { status: retryable ? 'retryable' : 'blocked', error: `${stage.toUpperCase()}_EVIDENCE_INCOMPLETE`, retryable }
}

/** Recheck editorial fields even when a caller supplies validate.passed=true. */
export function curationIssues(record) {
  const issues = []
  const classification = record?.classification
  if (classification?.recordLevel !== 'entry') issues.push('curate-record-level-not-entry')
  if (classification?.status !== 'confirmed') issues.push('curate-classification-not-confirmed')
  const subcategories = CURATION_SUBCATEGORIES[classification?.primaryCategory]
  if (!subcategories?.some(item => item.id === classification?.subcategory)) issues.push('curate-taxonomy-invalid')
  if (!Array.isArray(classification?.alternatives) || classification.alternatives.length) issues.push('curate-classification-alternatives-unresolved')
  if (!classification?.reasons?.some(reason => typeof reason?.statement === 'string' && reason.statement.trim()
    && /^https:\/\/[^\s]+$/iu.test(reason.evidenceUrl || ''))) issues.push('curate-direct-reason-missing')
  if (!/\p{Script=Han}/u.test(record?.editorial?.descriptionZh || '')) issues.push('curate-chinese-description-missing')
  if (!String(record?.curatorId || classification?.curatorId || '').trim()) issues.push('curate-author-missing')
  if (facetsErrors(record?.facets || {}).length) issues.push('curate-facets-invalid')
  if (classification?.primaryCategory === 'single-site-showcase'
    && (!record?.editorial?.showcaseReasonZh || record.editorial.designRelevanceConfirmed !== true)) issues.push('curate-showcase-relevance-unconfirmed')
  return issues
}
