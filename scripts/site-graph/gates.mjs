import { CURATION_SUBCATEGORIES, classificationErrors, facetsErrors } from '../../src/data/curation-taxonomy.js'

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
export function sourceEntityIssues(record, { entities = null } = {}) {
  const issues = []
  const entityId = record?.entityId ?? record?.sourceEntity?.entityId
  const entity = entities ? entities[entityId] : record?.sourceEntity
  if (!entityId || entityId === record?.entryId || !/^entity[-:]/u.test(entityId)) issues.push('curate-source-entity-namespace-invalid')
  if (record?.classification?.entityId !== entityId) issues.push('curate-source-entity-reference-mismatch')
  if (!entity || entity.entityId !== entityId) return [...issues, 'curate-source-entity-missing']
  if (!String(entity.canonicalName || '').trim() || !/^https:\/\/[^\s]+$/u.test(entity.primaryUrl || '')) issues.push('curate-source-entity-identity-invalid')
  for (const field of ['nameAliases', 'urlAliases']) if (!Array.isArray(entity[field]) || entity[field].some(value => typeof value !== 'string' || !value.trim())) issues.push(`curate-source-entity-${field}-invalid`)
  if (!String(entity.providerType || '').trim() || entity.status !== 'confirmed' || !Number.isInteger(entity.revision) || entity.revision < 1) issues.push('curate-source-entity-state-invalid')
  if (entity.classification || entity.primaryCategory || entity.subcategory) issues.push('curate-source-entity-must-not-be-classified')
  if (!entity.identityEvidence?.some(item => String(item.statement || '').trim() && /^https:\/\/[^\s]+$/u.test(item.evidenceUrl || '') && Array.isArray(item.evidenceIds) && item.evidenceIds.length)) issues.push('curate-source-entity-direct-evidence-missing')
  return issues
}

export function reviewedClassification(record, review) {
  if (review?.decision !== 'approved') return record?.classification
  return { ...record.classification, entityId: record.entityId, status: 'confirmed', curatorId: record.curatorId,
    reviewerId: review.reviewer, confirmedAt: review.reviewedAt }
}

export function curationIssues(record, { entities = null, review = null } = {}) {
  const issues = []
  const classification = record?.classification
  if (classification?.recordLevel !== 'entry') issues.push('curate-record-level-not-entry')
  if (classification?.status !== 'confirmed' && !(classification?.status === 'needs-review' && record?.classificationReadyForReview === true)) issues.push('curate-classification-not-confirmed')
  for (const error of classificationErrors({ ...classification, status: 'needs-review' })) issues.push(`curate-classification-invalid:${error}`)
  if (review) for (const error of classificationErrors(reviewedClassification(record, review))) issues.push(`curate-reviewed-classification-invalid:${error}`)
  issues.push(...sourceEntityIssues(record, { entities }))
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
