import assert from 'node:assert/strict'
import test from 'node:test'

import {
  evidenceBundleErrors,
  toPublicSite,
} from '../src/lib/curation-evidence.js'

const DESCRIPTION = '该入口将可组合的设计令牌、组件示例与直接可复制的实现文档集中呈现，官方页面同时提供完整范围、使用方式与源码证据，便于设计师和开发者评估并安全复用。'

function makeValidV3Bundle() {
  return {
    schemaVersion: 3,
    entryId: 'open-props',
    entityId: 'open-props-entity',
    attemptId: 'attempt-2026-09-01-001',
    status: 'APPROVED',
    official: {
      inputUrl: 'https://open-props.style/',
      finalUrl: 'https://open-props.style/',
      checkedAt: '2026-09-01T12:34:56.000Z',
    },
    editorial: {
      name: 'Open Props',
      descriptionZh: DESCRIPTION,
      pricing: 'Free · Open source',
    },
    classification: {
      recordLevel: 'entry',
      entityId: 'open-props-entity',
      primaryCategory: 'ui-implementation',
      subcategory: 'design-system-suites',
      status: 'confirmed',
      alternatives: [],
      reasons: [{
        statement: '官方组件页展示可直接预览、复制并复用的设计系统实现。',
        evidenceUrl: 'https://open-props.style/components',
      }],
      curatorId: 'curator-alice',
      reviewerId: 'reviewer-bob',
      confirmedAt: '2026-09-01T13:00:00.000Z',
    },
    facets: {
      scenarios: [],
      deliverables: ['component', 'standard'],
      actions: ['preview', 'copy'],
      media: ['ui', 'typography'],
      platforms: ['Web'],
      technologies: ['CSS', 'ＣＳＳ'],
      workflowStages: ['design', 'build'],
      audiences: ['designer', 'developer'],
      access: ['open-source'],
      licenses: ['mit', 'MIT'],
      contentOrganization: ['component-registry', 'standards-documentation'],
      languages: ['zh-Hans', 'en'],
    },
    pages: [
      {
        role: 'proof',
        sourceUrl: 'https://github.com/argyleink/open-props/tree/main/src',
        finalUrl: 'https://github.com/argyleink/open-props/tree/main/src',
        title: 'Open Props source tokens',
        selectionRationale: '仓库源码展示令牌文件与可复用实现细节。',
        shot: {
          src: '/shots/open-props/03.webp',
          sha256: '3'.repeat(64),
          width: 1440,
          height: 1000,
          bytes: 23_003,
          alt: 'Open Props 仓库中的 CSS 令牌源码目录',
        },
      },
      {
        role: 'identity',
        sourceUrl: 'https://open-props.style/',
        finalUrl: 'https://open-props.style/',
        title: 'Open Props',
        selectionRationale: '首页清楚呈现项目身份、核心价值与视觉语言。',
        shot: {
          src: '/shots/open-props/01.webp',
          sha256: '1'.repeat(64),
          width: 1440,
          height: 1000,
          bytes: 21_001,
          alt: 'Open Props 首页的项目名称与核心介绍',
        },
      },
      {
        role: 'breadth',
        sourceUrl: 'https://open-props.style/learn/theming',
        finalUrl: 'https://open-props.style/learn/theming',
        title: 'Open Props catalog',
        selectionRationale: '令牌目录覆盖颜色、尺寸、排版与动效等主要范围。',
        shot: {
          src: '/shots/open-props/02.webp',
          sha256: '2'.repeat(64),
          width: 1440,
          height: 1000,
          bytes: 22_002,
          alt: 'Open Props 文档中的令牌分类与示例',
        },
      },
    ],
    facts: [
      {
        field: 'author',
        value: 'Adam Argyle',
        sourceUrl: 'https://open-props.style/',
        evidence: 'The official page credits Adam Argyle as the creator.',
        confidence: 1,
      },
      {
        field: 'organization',
        value: 'Open Props',
        sourceUrl: 'https://open-props.style/',
        evidence: 'The official project identity is Open Props.',
      },
      {
        field: 'repository',
        value: 'https://github.com/argyleink/open-props',
        sourceUrl: 'https://github.com/argyleink/open-props',
        evidence: 'The official site links to this project repository.',
      },
      {
        field: 'license',
        value: 'MIT',
        sourceUrl: 'https://github.com/argyleink/open-props/blob/main/LICENSE',
        evidence: 'The repository license file identifies the MIT license.',
      },
    ],
    qa: {
      curatorId: 'curator-alice',
      technicalPassed: true,
      semanticReviewerId: 'reviewer-bob',
      semanticPassed: true,
      editorialReviewerId: 'editor-carol',
    },
  }
}

function changed(mutator) {
  const bundle = makeValidV3Bundle()
  mutator(bundle)
  return bundle
}

function assertHasErrors(bundle, expectedPatterns) {
  const errors = evidenceBundleErrors(bundle)
  assert.ok(Array.isArray(errors))
  for (const pattern of expectedPatterns) {
    assert.ok(
      errors.some((error) => pattern.test(error)),
      `expected ${pattern}, received ${JSON.stringify(errors)}`,
    )
  }
  return errors
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const nested of Object.values(value)) deepFreeze(nested)
  }
  return value
}

test('accepts a complete approved v3 evidence bundle', () => {
  assert.deepEqual(evidenceBundleErrors(makeValidV3Bundle()), [])
})

test('projects the exact thin v3 public schema without legacy scoring fields', () => {
  const publicSite = toPublicSite(makeValidV3Bundle())
  assert.deepEqual(publicSite, {
    id: 'open-props',
    entityId: 'open-props-entity',
    name: 'Open Props',
    canonicalUrl: 'https://open-props.style',
    descriptionZh: DESCRIPTION,
    primaryCategory: 'ui-implementation',
    subcategory: 'design-system-suites',
    facets: {
      scenarios: [],
      deliverables: ['component', 'standard'],
      actions: ['preview', 'copy'],
      media: ['ui', 'typography'],
      platforms: ['web'],
      technologies: ['css'],
      workflowStages: ['design', 'build'],
      audiences: ['designer', 'developer'],
      access: ['open-source'],
      licenses: ['MIT'],
      contentOrganization: ['component-registry', 'standards-documentation'],
      languages: ['zh-hans', 'en'],
    },
    pricing: 'Free · Open source',
    shots: [
      {
        role: 'identity',
        title: 'Open Props',
        selectionRationale: '首页清楚呈现项目身份、核心价值与视觉语言。',
        src: '/shots/open-props/01.webp',
        inputUrl: 'https://open-props.style',
        sourceUrl: 'https://open-props.style',
        alt: 'Open Props 首页的项目名称与核心介绍',
        sha256: '1'.repeat(64),
        width: 1440,
        height: 1000,
      },
      {
        role: 'breadth',
        title: 'Open Props catalog',
        selectionRationale: '令牌目录覆盖颜色、尺寸、排版与动效等主要范围。',
        src: '/shots/open-props/02.webp',
        inputUrl: 'https://open-props.style/learn/theming',
        sourceUrl: 'https://open-props.style/learn/theming',
        alt: 'Open Props 文档中的令牌分类与示例',
        sha256: '2'.repeat(64),
        width: 1440,
        height: 1000,
      },
      {
        role: 'proof',
        title: 'Open Props source tokens',
        selectionRationale: '仓库源码展示令牌文件与可复用实现细节。',
        src: '/shots/open-props/03.webp',
        inputUrl: 'https://github.com/argyleink/open-props/tree/main/src',
        sourceUrl: 'https://github.com/argyleink/open-props/tree/main/src',
        alt: 'Open Props 仓库中的 CSS 令牌源码目录',
        sha256: '3'.repeat(64),
        width: 1440,
        height: 1000,
      },
    ],
    official: {
      author: 'Adam Argyle',
      organization: 'Open Props',
      repository: 'https://github.com/argyleink/open-props',
      license: 'MIT',
    },
    quality: {
      identityVerified: true,
      sourceLinkHealthy: true,
      evidenceCompleteness: 'complete',
      screenshotQaPassed: true,
      descriptionQaPassed: true,
      rightsStatus: 'MIT',
      verifiedAt: '2026-09-01T12:34:56.000Z',
    },
    evidenceRevision: 'attempt-2026-09-01-001',
  })
  for (const legacyField of ['resourceEssence', 'score', 'tags']) {
    assert.equal(Object.hasOwn(publicSite, legacyField), false)
  }
})

test('v3 shots preserve editorial context and distinguish redirect input from final deep link', () => {
  const bundle = changed((candidate) => {
    const proof = candidate.pages.find(({ role }) => role === 'proof')
    proof.sourceUrl = 'https://github.com/argyleink/open-props/tree/main/src?utm_source=review'
    proof.finalUrl = 'https://github.com/argyleink/open-props/blob/main/src/props.colors.css'
  })
  const proof = toPublicSite(bundle).shots.find(({ role }) => role === 'proof')
  assert.deepEqual(proof, {
    role: 'proof',
    title: 'Open Props source tokens',
    selectionRationale: '仓库源码展示令牌文件与可复用实现细节。',
    src: '/shots/open-props/03.webp',
    inputUrl: 'https://github.com/argyleink/open-props/tree/main/src',
    sourceUrl: 'https://github.com/argyleink/open-props/blob/main/src/props.colors.css',
    alt: 'Open Props 仓库中的 CSS 令牌源码目录',
    sha256: '3'.repeat(64),
    width: 1440,
    height: 1000,
  })
})

test('dispatch keeps schema v2 validation semantics available', () => {
  const errors = evidenceBundleErrors({ schemaVersion: 2 })
  assert.equal(errors.some((error) => /schemaVersion must be 2/u.test(error)), false)
  assert.ok(errors.some((error) => /siteId/u.test(error)))
})

test('v3 rejects non-approved and non-confirmed classification states and entity classification', () => {
  assertHasErrors(changed((bundle) => {
    bundle.status = 'CANDIDATE'
  }), [/status must be APPROVED/u])
  for (const status of ['needs-review', 'excluded']) {
    assertHasErrors(changed((bundle) => {
      bundle.classification.status = status
    }), [/classification.*publishable|classification.*confirmed/iu])
  }
  assertHasErrors(changed((bundle) => {
    bundle.classification.recordLevel = 'entity'
  }), [/classification.*entity|classification.*publishable/iu])
})

test('v3 enforces top-level and classification entity/entry relationships', () => {
  assertHasErrors(changed((bundle) => {
    bundle.classification.entityId = 'different-entity'
  }), [/classification\.entityId must match entityId/u])

  const unit = changed((bundle) => {
    bundle.classification.recordLevel = 'unit'
    bundle.classification.entryId = bundle.entryId
  })
  assert.deepEqual(evidenceBundleErrors(unit), [])
  assertHasErrors(changed((bundle) => {
    bundle.classification.recordLevel = 'unit'
    bundle.classification.entryId = 'different-entry'
  }), [/classification\.entryId must match entryId/u])
})

test('v3 classification review identities must match independent QA identities', () => {
  assertHasErrors(changed((bundle) => {
    bundle.qa.curatorId = 'different-curator'
  }), [/classification\.curatorId must match qa\.curatorId/u])
  assertHasErrors(changed((bundle) => {
    bundle.qa.semanticReviewerId = 'different-reviewer'
  }), [/classification\.reviewerId must match qa\.semanticReviewerId/u])
  assertHasErrors(changed((bundle) => {
    bundle.qa.editorialReviewerId = ''
  }), [/qa\.editorialReviewerId must be a non-empty string/u])
})

test('v3 rejects unknown facets and canonicalizes duplicate Unicode/case variants', () => {
  assertHasErrors(changed((bundle) => {
    bundle.facets.technologies.push('unknown-runtime')
  }), [/unknown technologies facet: unknown-runtime/u])

  const publicSite = toPublicSite(makeValidV3Bundle())
  assert.deepEqual(publicSite.facets.technologies, ['css'])
  assert.deepEqual(publicSite.facets.licenses, ['MIT'])
})

test('v3 rejects legacy fields, unknown schema fields, and Visit Website', () => {
  assertHasErrors(changed((bundle) => {
    bundle.siteId = 'legacy-id'
    bundle.resourceEssence = 'reusable-implementation'
    bundle.score = 92
    bundle.tags = ['css']
    bundle.editorial.resourceEssence = 'reusable-implementation'
    bundle.editorial.score = 92
    bundle.editorial.tags = ['css']
    bundle.classification.score = 92
  }), [
    /bundle\.siteId is not allowed/u,
    /bundle\.resourceEssence is not allowed/u,
    /bundle\.score is not allowed/u,
    /bundle\.tags is not allowed/u,
    /bundle\.editorial\.resourceEssence is not allowed/u,
    /bundle\.editorial\.score is not allowed/u,
    /bundle\.editorial\.tags is not allowed/u,
    /bundle\.classification\.score is not allowed/u,
  ])
  assertHasErrors(changed((bundle) => {
    bundle.editorial.name = 'Visit Website'
  }), [/Visit Website|publishable/iu])
})

test('single-site showcase requires three pages and a direct human design rationale', () => {
  const showcase = changed((bundle) => {
    bundle.classification.primaryCategory = 'single-site-showcase'
    bundle.classification.subcategory = 'product-company-sites'
    bundle.classification.reasons = [{
      statement: '该站的版式、视觉叙事与交互细节具有可直接研究和复盘的设计价值。',
      evidenceUrl: 'https://open-props.style/showcase-evidence',
    }]
  })
  assert.deepEqual(evidenceBundleErrors(showcase), [])

  assertHasErrors(changed((bundle) => {
    bundle.classification.primaryCategory = 'single-site-showcase'
    bundle.classification.subcategory = 'product-company-sites'
    bundle.classification.reasons = [{
      statement: '这是一个普通的官方网站。',
      evidenceUrl: 'https://open-props.style/showcase-evidence',
    }]
  }), [/single-site|showcase|publishable/iu])

  assertHasErrors(changed((bundle) => {
    bundle.classification.primaryCategory = 'single-site-showcase'
    bundle.classification.subcategory = 'product-company-sites'
    bundle.classification.reasons = showcase.classification.reasons
    bundle.pages.pop()
  }), [/three|3|pages|showcase|publishable/iu])
})

test('open-source facets require a matching trusted license fact', () => {
  assertHasErrors(changed((bundle) => {
    bundle.facts = bundle.facts.filter(({ field }) => field !== 'license')
  }), [/open-source.*license|rights/iu])
  assertHasErrors(changed((bundle) => {
    bundle.facts.find(({ field }) => field === 'license').value = 'Apache-2.0'
  }), [/license.*match|rights/iu])
  assertHasErrors(changed((bundle) => {
    bundle.facts.find(({ field }) => field === 'license').sourceUrl = 'https://unrelated.example/license'
  }), [/license|official site|repository scope/iu])

  const sourceAvailable = changed((bundle) => {
    bundle.facets.access = ['source-available']
    bundle.facets.licenses = ['custom']
    bundle.facts.find(({ field }) => field === 'license').value = 'MIT with Commons Clause'
  })
  assert.deepEqual(evidenceBundleErrors(sourceAvailable), [])
  assert.deepEqual(toPublicSite(sourceAvailable).facets.access, ['source-available'])
  assert.equal(toPublicSite(sourceAvailable).facets.access.includes('open-source'), false)
  assert.equal(toPublicSite(sourceAvailable).quality.rightsStatus, 'MIT with Commons Clause')
  assertHasErrors(changed((bundle) => {
    bundle.facets.access = ['source-available']
    bundle.facts = bundle.facts.filter(({ field }) => field !== 'license')
  }), [/source-available.*license|rights/iu])
})

test('rights access states are mutually exclusive and license-compatible', () => {
  for (const access of [
    ['open-source', 'source-available'],
    ['open-source', 'closed-source'],
    ['source-available', 'closed-source'],
  ]) {
    assertHasErrors(changed((bundle) => {
      bundle.facets.access = access
    }), [/rights access.*mutually exclusive|at most one/iu])
  }

  for (const license of ['unknown', 'custom', 'proprietary']) {
    assertHasErrors(changed((bundle) => {
      bundle.facets.licenses = [license]
      bundle.facts.find(({ field }) => field === 'license').value = license
    }), [/open-source.*(?:SPDX|license|unknown|custom|proprietary)/iu])
  }

  assertHasErrors(changed((bundle) => {
    bundle.facets.access = ['source-available']
  }), [/source-available.*custom/iu])
  assertHasErrors(changed((bundle) => {
    bundle.facets.access = ['closed-source']
  }), [/closed-source.*open-source SPDX|closed-source.*license/iu])

  const proprietary = changed((bundle) => {
    bundle.facets.access = ['closed-source']
    bundle.facets.licenses = ['proprietary']
    bundle.facts.find(({ field }) => field === 'license').value = 'proprietary'
  })
  assert.deepEqual(evidenceBundleErrors(proprietary), [])
  assert.deepEqual(toPublicSite(proprietary).facets.access, ['closed-source'])
})

test('quality verification booleans are scoped to this immutable evidence attempt', () => {
  const bundle = makeValidV3Bundle()
  const quality = toPublicSite(bundle).quality
  assert.equal(quality.identityVerified, true)
  assert.equal(quality.sourceLinkHealthy, true)
  assert.equal(quality.verifiedAt, bundle.official.checkedAt)
  assert.equal(Object.hasOwn(quality, 'currentlyOnline'), false)
})

test('v3 snapshot contains accessors, symbols, __proto__, and sparse facet arrays safely', () => {
  let getterCalls = 0
  const accessorBundle = makeValidV3Bundle()
  Object.defineProperty(accessorBundle.editorial, 'name', {
    enumerable: true,
    get() {
      getterCalls += 1
      return 'unsafe'
    },
  })
  assertHasErrors(accessorBundle, [/bundle\.editorial\.name must be a data property/u])
  assert.equal(getterCalls, 0)

  const polluted = makeValidV3Bundle()
  Object.defineProperty(polluted, '__proto__', {
    enumerable: true,
    value: { polluted: true },
  })
  polluted[Symbol('hidden')] = true
  polluted.facets.technologies = new Array(1)
  assertHasErrors(polluted, [
    /bundle\.__proto__ is not allowed/u,
    /bundle contains an unexpected symbol property/u,
    /facets\.technologies\[0\]|data property|must be a string/u,
  ])
  assert.equal(Object.prototype.polluted, undefined)

  assertHasErrors(new Proxy({}, {
    getPrototypeOf() {
      throw new Error('contained')
    },
  }), [/bundle could not be inspected safely|bundle could not be validated safely/u])
})

test('v3 validation and projection do not mutate deeply frozen input', () => {
  const bundle = deepFreeze(makeValidV3Bundle())
  const before = JSON.stringify(bundle)
  assert.deepEqual(evidenceBundleErrors(bundle), [])
  assert.equal(toPublicSite(bundle).id, 'open-props')
  assert.equal(JSON.stringify(bundle), before)
})
