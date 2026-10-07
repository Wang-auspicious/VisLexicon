import test from 'node:test'
import assert from 'node:assert/strict'
import { sitePublicationIssues } from '../src/lib/site-publication.js'

const shot = (key) => ({ src: `/shots/example/${key}.jpg`, sha256: key.repeat(64), width: 1280, height: 900 })
const bundle = () => ({
  status: 'APPROVED',
  editorial: { descriptionZh: '实测的中文描述。' },
  classification: {
    recordLevel: 'entry', entityId: 'entity-example', primaryCategory: 'ui-implementation',
    subcategory: 'general-ui-components', status: 'confirmed', alternatives: [],
    reasons: [{ statement: '原站提供实际界面组件。', evidenceUrl: 'https://example.com/components' }],
    curatorId: 'collector', reviewerId: 'reviewer', confirmedAt: '2026-10-07T19:00:00.000Z',
  },
  facets: { deliverables: ['component'], platforms: ['web'], licenses: ['unknown'] },
  facts: [{ sourceUrl: 'https://example.com/component' }],
  pages: [
    { role: 'identity', shot: shot('a') },
    { role: 'breadth', shot: shot('b') },
    { role: 'proof', shot: shot('c') },
  ],
  qa: { curatorId: 'collector', technicalPassed: true, semanticReviewerId: 'reviewer', semanticPassed: true },
})

test('public Site Entry requires three distinct screenshot roles and independent review', () => {
  assert.deepEqual(sitePublicationIssues(bundle()), [])
  const onePage = bundle()
  onePage.pages = onePage.pages.slice(0, 1)
  assert.ok(sitePublicationIssues(onePage).includes('identity-breadth-proof-missing'))
  const selfReviewed = bundle()
  selfReviewed.qa.semanticReviewerId = selfReviewed.qa.curatorId
  assert.ok(sitePublicationIssues(selfReviewed).includes('independent-review-missing'))
  const repeatedShot = bundle()
  repeatedShot.pages[2].shot = repeatedShot.pages[1].shot
  assert.ok(sitePublicationIssues(repeatedShot).includes('three-distinct-screenshots-missing'))
})

test('old APPROVED records with unresolved classifications or uncontrolled facets stay private', () => {
  const unresolved = bundle()
  unresolved.classification.alternatives = [{ primaryCategory: 'visual-implementation', subcategory: 'motion-interaction-code' }]
  assert.ok(sitePublicationIssues(unresolved).includes('confirmed-classification-missing-or-invalid'))
  const draft = bundle()
  draft.classification.status = 'needs-review'
  assert.ok(sitePublicationIssues(draft).includes('confirmed-classification-missing-or-invalid'))
  const uncontrolled = bundle()
  uncontrolled.facets.technologies = ['unreviewed-framework']
  assert.ok(sitePublicationIssues(uncontrolled).includes('controlled-facets-missing-or-invalid'))
  const showcase = bundle()
  showcase.classification.primaryCategory = 'single-site-showcase'
  showcase.classification.subcategory = 'product-company-sites'
  assert.ok(sitePublicationIssues(showcase).includes('confirmed-classification-missing-or-invalid'))
})
