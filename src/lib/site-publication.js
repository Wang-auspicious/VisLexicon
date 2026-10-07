// A source bundle can say APPROVED while still missing the evidence required
// for a public Site Entry. Keep that source record intact and gate projection.
import { isPublishableClassification, facetsErrors } from '../data/curation-taxonomy.js'

export const SITE_PUBLICATION_POLICY_VERSION = 'site-evidence-v2'

const REQUIRED_ROLES = ['identity', 'breadth', 'proof']
const isText = (value) => typeof value === 'string' && value.trim().length > 0

export function sitePublicationIssues(bundle) {
  const issues = []
  if (bundle?.status !== 'APPROVED') issues.push('source-not-approved')
  if (!isText(bundle?.editorial?.descriptionZh) || !/\p{Script=Han}/u.test(bundle.editorial.descriptionZh)) {
    issues.push('chinese-description-missing')
  }
  if (!Array.isArray(bundle?.facts) || !bundle.facts.length || bundle.facts.some((fact) => !isText(fact.sourceUrl))) {
    issues.push('direct-fact-sources-missing')
  }

  const pages = Array.isArray(bundle?.pages) ? bundle.pages : []
  const requiredPages = REQUIRED_ROLES.map((role) => pages.find((page) => page.role === role))
  if (!isPublishableClassification(bundle?.classification, {
    name: bundle?.editorial?.name,
    evidencePageCount: requiredPages.filter(Boolean).length,
    manualShowcaseReason: bundle?.editorial?.showcaseReasonZh,
    designRelevanceConfirmed: bundle?.editorial?.designRelevanceConfirmed,
  })) issues.push('confirmed-classification-missing-or-invalid')
  if (facetsErrors(bundle?.facets).length) issues.push('controlled-facets-missing-or-invalid')
  if (requiredPages.some((page) => !page)) {
    issues.push('identity-breadth-proof-missing')
  } else {
    const shots = requiredPages.map((page) => page.shot)
    if (shots.some((shot) => !isText(shot?.src) || !/^[a-f0-9]{64}$/u.test(shot.sha256 || '')
      || !Number.isInteger(shot.width) || shot.width <= 0 || !Number.isInteger(shot.height) || shot.height <= 0)
      || new Set(shots.map((shot) => shot.sha256)).size !== REQUIRED_ROLES.length) {
      issues.push('three-distinct-screenshots-missing')
    }
  }

  const qa = bundle?.qa || {}
  if (qa.technicalPassed !== true || qa.semanticPassed !== true || !isText(qa.curatorId)
    || !isText(qa.semanticReviewerId) || qa.semanticReviewerId === qa.curatorId) {
    issues.push('independent-review-missing')
  }
  return issues
}
