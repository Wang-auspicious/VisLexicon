import assert from 'node:assert/strict'
import test from 'node:test'

import {
  evidenceBundleErrors,
  toPublicSite,
} from '../src/lib/curation-evidence.js'

const DESCRIPTION = 'Open Props 将可组合的 CSS 自定义属性整理为颜色、尺寸、排版与动效令牌，文档给出可直接复制的用法、主题示例和仓库实现，适合团队快速建立轻量且可审查的界面基础层。'

function makeValidBundle() {
  return {
    schemaVersion: 2,
    siteId: 'open-props',
    entityKey: 'open-props.style',
    attemptId: 'attempt-2026-08-31-001',
    status: 'APPROVED',
    official: {
      inputUrl: 'https://open-props.style/',
      finalUrl: 'https://open-props.style/',
      checkedAt: '2026-08-31T12:34:56.000Z',
    },
    curation: {
      name: 'Open Props',
      descriptionZh: DESCRIPTION,
      resourceEssence: 'reusable-implementation',
      subcategory: 'design-system-primitives',
      score: 92,
      tags: ['css', 'design-tokens', 'open-source'],
      pricing: 'Free · Open source',
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
        selectionRationale: '首页清楚呈现产品身份、核心价值与视觉语言。',
        shot: {
          src: '/shots/open-props/01.webp',
          sha256: '1'.repeat(64),
          width: 1440,
          height: 1000,
          bytes: 21_001,
          alt: 'Open Props 首页的产品名称与核心介绍',
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
    },
  }
}

test('accepts a complete approved v2 bundle and emits the fixed public schema', () => {
  const bundle = makeValidBundle()

  assert.deepEqual(evidenceBundleErrors(bundle), [])
  assert.deepEqual(toPublicSite(bundle), {
    id: 'open-props',
    name: 'Open Props',
    canonicalUrl: 'https://open-props.style',
    descriptionZh: DESCRIPTION,
    resourceEssence: 'reusable-implementation',
    subcategory: 'design-system-primitives',
    score: 92,
    tags: ['css', 'design-tokens', 'open-source'],
    pricing: 'Free · Open source',
    shots: [
      {
        role: 'identity',
        src: '/shots/open-props/01.webp',
        sourceUrl: 'https://open-props.style',
        alt: 'Open Props 首页的产品名称与核心介绍',
        sha256: '1'.repeat(64),
        width: 1440,
        height: 1000,
      },
      {
        role: 'breadth',
        src: '/shots/open-props/02.webp',
        sourceUrl: 'https://open-props.style/learn/theming',
        alt: 'Open Props 文档中的令牌分类与示例',
        sha256: '2'.repeat(64),
        width: 1440,
        height: 1000,
      },
      {
        role: 'proof',
        src: '/shots/open-props/03.webp',
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
    evidenceRevision: 'attempt-2026-08-31-001',
  })
  assert.equal(
    toPublicSite(bundle).shots.some((shot) => Object.hasOwn(shot, 'bytes')),
    false,
    'the public catalog stays a thin index; byte evidence remains bundle-only',
  )
})

function changed(mutator) {
  const bundle = makeValidBundle()
  mutator(bundle)
  return bundle
}

function assertHasErrors(bundle, expectedPatterns) {
  const errors = evidenceBundleErrors(bundle)
  assert.ok(Array.isArray(errors), 'validation result must be an array')

  for (const pattern of expectedPatterns) {
    assert.ok(
      errors.some((error) => pattern.test(error)),
      `expected an error matching ${pattern}, received ${JSON.stringify(errors)}`,
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

test('rejects non-object bundles and invalid v2 publication identity fields', () => {
  for (const value of [null, [], new Date()]) {
    assertHasErrors(value, [/bundle must be a plain object/u])
    assert.throws(() => toPublicSite(value), TypeError)
  }

  assertHasErrors(changed((bundle) => {
    bundle.schemaVersion = 1
    bundle.siteId = ' '
    bundle.entityKey = ''
    bundle.attemptId = null
  }), [
    /schemaVersion must be 2/u,
    /siteId must be a non-empty string/u,
    /entityKey must be a non-empty string/u,
    /attemptId must be a non-empty string/u,
  ])
})

test('requires siteId to be one safe lowercase ASCII path segment', () => {
  for (const siteId of [
    '.',
    '..',
    'open/props',
    'open\\props',
    '%2e%2e',
    '%2fetc',
    'Open-Props',
    '_open-props',
    '视元',
    `a${'b'.repeat(128)}`,
  ]) {
    const bundle = changed((candidate) => {
      candidate.siteId = siteId
      for (let index = 0; index < candidate.pages.length; index += 1) {
        candidate.pages[index].shot.src = `/shots/${siteId}/0${index + 1}.webp`
      }
    })

    assertHasErrors(bundle, [
      /siteId must match \^\[a-z0-9\]\[a-z0-9_-\]\{0,127\}\$/u,
      /pages\[0\]\.shot\.src must match/u,
    ])
    assert.throws(() => toPublicSite(bundle), TypeError)
  }
})

test('rejects candidates and explicitly quarantines legacy evidence', () => {
  for (const status of ['CANDIDATE', 'DRAFT']) {
    assertHasErrors(changed((bundle) => {
      bundle.status = status
    }), [/status must be APPROVED/u])
  }

  assertHasErrors(changed((bundle) => {
    bundle.status = 'QUARANTINED_LEGACY'
  }), [/QUARANTINED_LEGACY/u, /cannot be published/u])
})

test('rejects unsafe official and page URLs plus invalid checkedAt timestamps', () => {
  const cases = [
    {
      mutate: (bundle) => { bundle.official.inputUrl = 'http://open-props.style/' },
      pattern: /official\.inputUrl must be a safe HTTPS URL/u,
    },
    {
      mutate: (bundle) => { bundle.official.finalUrl = 'https://127.0.0.1/admin' },
      pattern: /official\.finalUrl must be a safe HTTPS URL/u,
    },
    {
      mutate: (bundle) => { bundle.pages[0].sourceUrl = 'ftp://github.com/file' },
      pattern: /pages\[0\]\.sourceUrl must be a safe HTTPS URL/u,
    },
    {
      mutate: (bundle) => {
        bundle.pages[0].finalUrl = 'https://user:secret@github.com/argyleink/open-props'
      },
      pattern: /pages\[0\]\.finalUrl must be a safe HTTPS URL/u,
    },
    {
      mutate: (bundle) => { bundle.official.checkedAt = 'August sometime' },
      pattern: /official\.checkedAt must be a valid ISO timestamp/u,
    },
  ]

  for (const { mutate, pattern } of cases) {
    assertHasErrors(changed(mutate), [pattern])
  }
})

test('rejects unknown or mismatched taxonomy selections and scores outside their band', () => {
  assertHasErrors(changed((bundle) => {
    bundle.curation.resourceEssence = 'unknown-essence'
    bundle.curation.subcategory = 'unknown-subcategory'
  }), [
    /unknown resource essence/u,
    /unknown subcategory/u,
  ])

  assertHasErrors(changed((bundle) => {
    bundle.curation.subcategory = 'icons-symbols'
  }), [/does not belong to reusable-implementation/u])

  for (const score of [79, 101, Number.NaN, Number.POSITIVE_INFINITY]) {
    assertHasErrors(changed((bundle) => {
      bundle.curation.score = score
    }), [/curation\.score/u])
  }
})

test('requires unique non-empty tags and a substantive non-template description', () => {
  assertHasErrors(changed((bundle) => {
    bundle.curation.name = ' '
    bundle.curation.tags = []
    bundle.curation.descriptionZh = '字'.repeat(59)
  }), [
    /curation\.name must be a non-empty string/u,
    /curation\.tags must contain at least one tag/u,
    /curation\.descriptionZh must contain 60 to 120 Unicode code points/u,
  ])

  assertHasErrors(changed((bundle) => {
    bundle.curation.tags = ['css', ' ', 'css']
    bundle.curation.descriptionZh = '字'.repeat(121)
  }), [
    /curation\.tags\[1\] must be a non-empty string/u,
    /curation\.tags values must be unique/u,
    /curation\.descriptionZh must contain 60 to 120 Unicode code points/u,
  ])

  for (const templatePhrase of ['归类为「', 'AI 设计工具站。', '以付费为主。']) {
    assertHasErrors(changed((bundle) => {
      bundle.curation.descriptionZh = `${'这是一段自然说明文字，'.repeat(7)}${templatePhrase}`
    }), [/curation\.descriptionZh contains forbidden template phrase/u])
  }
})

test('rejects the template stem 归类为 with any quote style or no quotes', () => {
  for (const templateText of [
    '归类为“设计系统”',
    '归类为"设计系统"',
    '归类为设计系统',
  ]) {
    assertHasErrors(changed((bundle) => {
      bundle.curation.descriptionZh = `${'这是一段自然说明文字，'.repeat(7)}${templateText}`
    }), [/curation\.descriptionZh contains forbidden template phrase/u])
  }
})

test('requires exactly one identity, breadth, and proof page', () => {
  for (const count of [1, 2, 4]) {
    assertHasErrors(changed((bundle) => {
      if (count < 3) {
        bundle.pages = bundle.pages.slice(0, count)
        return
      }

      const extra = structuredClone(bundle.pages[1])
      extra.sourceUrl = 'https://open-props.style/extra'
      extra.finalUrl = 'https://open-props.style/extra'
      extra.shot.src = '/shots/open-props/04.webp'
      extra.shot.sha256 = '4'.repeat(64)
      bundle.pages.push(extra)
    }), [/pages must contain exactly 3 entries/u])
  }

  assertHasErrors(changed((bundle) => {
    bundle.pages[2].role = 'identity'
  }), [
    /page role identity must appear exactly once/u,
    /page role breadth must appear exactly once/u,
  ])
})

test('requires page URL, shot path, and shot hash uniqueness independently', () => {
  const cases = [
    {
      mutate: (bundle) => { bundle.pages[2].sourceUrl = bundle.pages[1].sourceUrl },
      pattern: /page sourceUrl values must be unique/u,
    },
    {
      mutate: (bundle) => { bundle.pages[2].finalUrl = bundle.pages[1].finalUrl },
      pattern: /page finalUrl values must be unique/u,
    },
    {
      mutate: (bundle) => { bundle.pages[2].shot.src = bundle.pages[1].shot.src },
      pattern: /page shot\.src values must be unique/u,
    },
    {
      mutate: (bundle) => { bundle.pages[2].shot.sha256 = bundle.pages[1].shot.sha256 },
      pattern: /page shot\.sha256 values must be unique/u,
    },
  ]

  for (const { mutate, pattern } of cases) {
    assertHasErrors(changed(mutate), [pattern])
  }
})

test('requires unique page selection rationales after trimming', () => {
  const rationale = '该页面理由内容足够具体，并且超过十二个 Unicode 字符。'
  const duplicateCounts = [2, 3]

  for (const duplicateCount of duplicateCounts) {
    assertHasErrors(changed((bundle) => {
      for (let index = 0; index < duplicateCount; index += 1) {
        bundle.pages[index].selectionRationale = index === 0
          ? rationale
          : `  ${rationale}\n`
      }
    }), [/page selectionRationale values must be unique/u])
  }
})

test('rejects blank page evidence, short rationale, invalid paths, hashes, and dimensions', () => {
  assertHasErrors(changed((bundle) => {
    bundle.pages[1].title = ' '
    bundle.pages[1].selectionRationale = '不足十二字'
    bundle.pages[1].shot.alt = '\t'
    bundle.pages[1].shot.sha256 = 'not-a-hash'
    bundle.pages[1].shot.width = 1279
    bundle.pages[1].shot.height = 899
  }), [
    /pages\[1\]\.title must be a non-empty string/u,
    /pages\[1\]\.selectionRationale must contain at least 12 Unicode code points/u,
    /pages\[1\]\.shot\.alt must be a non-empty string/u,
    /pages\[1\]\.shot\.sha256 must be 64 hexadecimal characters/u,
    /pages\[1\]\.shot\.width must be an integer at least 1280/u,
    /pages\[1\]\.shot\.height must be an integer at least 900/u,
  ])

  for (const path of [
    '/shots/open-props/../evil.webp',
    '/shots/open-props/nested/evil.webp',
    '\\shots\\open-props\\01.webp',
    '/shots/wrong-site/01.webp',
    '/shots/open-props/01.gif',
  ]) {
    assertHasErrors(changed((bundle) => {
      bundle.pages[1].shot.src = path
    }), [/pages\[1\]\.shot\.src must match/u])
  }
})

test('requires shot.bytes to be a safe integer greater than 20000', () => {
  const missing = changed((bundle) => {
    delete bundle.pages[0].shot.bytes
  })
  assertHasErrors(missing, [
    /pages\[0\]\.shot\.bytes must be a safe integer greater than 20000/u,
  ])

  for (const bytes of [20_000, 0, -1, 20_000.5, Number.MAX_SAFE_INTEGER + 1]) {
    assertHasErrors(changed((bundle) => {
      bundle.pages[1].shot.bytes = bytes
    }), [
      /pages\[1\]\.shot\.bytes must be a safe integer greater than 20000/u,
    ])
  }
})

test('requires independent technical and semantic approval', () => {
  assertHasErrors(changed((bundle) => {
    bundle.qa.curatorId = 'same-person'
    bundle.qa.semanticReviewerId = 'same-person'
    bundle.qa.technicalPassed = false
    bundle.qa.semanticPassed = false
  }), [
    /qa\.technicalPassed must be true/u,
    /qa\.semanticPassed must be true/u,
    /qa curatorId and semanticReviewerId must be different/u,
  ])

  assertHasErrors(changed((bundle) => {
    bundle.qa.curatorId = ' '
    bundle.qa.semanticReviewerId = null
  }), [
    /qa\.curatorId must be a non-empty string/u,
    /qa\.semanticReviewerId must be a non-empty string/u,
  ])
})

test('validates fact structure, safe sources, field uniqueness, and confidence', () => {
  assertHasErrors(changed((bundle) => {
    bundle.facts[0].field = ' '
    bundle.facts[0].value = ''
    bundle.facts[0].evidence = '\n'
    bundle.facts[0].sourceUrl = 'http://open-props.style/'
    bundle.facts[0].confidence = 2
  }), [
    /facts\[0\]\.field must be a non-empty string/u,
    /facts\[0\]\.value must be a non-empty string/u,
    /facts\[0\]\.evidence must be a non-empty string/u,
    /facts\[0\]\.sourceUrl must be a safe HTTPS URL/u,
    /facts\[0\]\.confidence must be between 0 and 1/u,
  ])

  assertHasErrors(changed((bundle) => {
    bundle.facts[1].field = 'author'
  }), [/fact field values must be unique/u])
})

test('open-source tagging requires a separate populated license fact', () => {
  assertHasErrors(changed((bundle) => {
    bundle.facts = bundle.facts.filter(({ field }) => field !== 'license')
  }), [/open-source requires a license fact with value and evidence/u])

  assertHasErrors(changed((bundle) => {
    const license = bundle.facts.find(({ field }) => field === 'license')
    license.value = ' '
    license.evidence = ''
  }), [/open-source requires a license fact with value and evidence/u])
})

test('uses lowercase canonical tags for license policy while preserving display tags', () => {
  const missingLicense = changed((bundle) => {
    bundle.curation.tags = ['CSS', 'Open-Source']
    bundle.facts = bundle.facts.filter(({ field }) => field !== 'license')
  })
  assertHasErrors(missingLicense, [
    /open-source requires a license fact with value and evidence/u,
  ])

  const approved = changed((bundle) => {
    bundle.curation.tags = ['CSS', 'Open-Source']
  })
  assert.deepEqual(evidenceBundleErrors(approved), [])
  assert.deepEqual(toPublicSite(approved).tags, ['CSS', 'Open-Source'])

  assertHasErrors(changed((bundle) => {
    bundle.curation.tags = ['Open-Source', 'open-source']
  }), [/curation\.tags values must be unique/u])
})

test('accepts fact evidence from the official site and confirmed repository scope', () => {
  const officialSiteEvidence = changed((bundle) => {
    const repository = bundle.facts.find(({ field }) => field === 'repository')
    repository.sourceUrl = 'https://open-props.style/learn/getting-started'
  })
  assert.deepEqual(evidenceBundleErrors(officialSiteEvidence), [])

  const repositoryEvidence = changed((bundle) => {
    const license = bundle.facts.find(({ field }) => field === 'license')
    license.sourceUrl = 'https://github.com/argyleink/open-props/blob/main/LICENSE'
  })
  assert.deepEqual(evidenceBundleErrors(repositoryEvidence), [])
})

test('rejects official-page and license claims sourced from an unrelated origin', () => {
  const unrelatedOfficialPage = changed((bundle) => {
    const docsUrl = 'https://docs.open-props.dev/implementation'
    bundle.pages[0].sourceUrl = docsUrl
    bundle.pages[0].finalUrl = docsUrl
    bundle.facts.push({
      field: 'official-page',
      value: 'https://docs.open-props.dev/',
      sourceUrl: 'https://unrelated.example/claim',
      evidence: 'An unrelated page claims this is the official documentation.',
    })
  })
  assertHasErrors(unrelatedOfficialPage, [
    /facts\[4\]\.sourceUrl must be within the official site or a confirmed repository scope/u,
    /pages\[0\] crosses the official origin without a matching repository or official-page fact/u,
  ])

  const unrelatedLicense = changed((bundle) => {
    const license = bundle.facts.find(({ field }) => field === 'license')
    license.sourceUrl = 'https://unrelated.example/license-claim'
  })
  assertHasErrors(unrelatedLicense, [
    /facts\[3\]\.sourceUrl must be within the official site or a confirmed repository scope/u,
    /open-source requires a license fact with value and evidence/u,
  ])
})

test('rejects an unrelated cross-origin GitHub page despite a repository fact', () => {
  assertHasErrors(changed((bundle) => {
    bundle.pages[0].sourceUrl = 'https://github.com/someone/ai-article/blob/main/README.md'
    bundle.pages[0].finalUrl = 'https://github.com/someone/ai-article/blob/main/README.md'
  }), [/pages\[0\] crosses the official origin without a matching repository or official-page fact/u])
})

test('does not let an official-page evidence source masquerade as its linked value', () => {
  const bundle = changed((candidate) => {
    const articleUrl = 'https://github.com/someone/ai-article/blob/main/README.md'
    candidate.pages[0].sourceUrl = articleUrl
    candidate.pages[0].finalUrl = articleUrl
    candidate.facts.push({
      field: 'official-page',
      value: 'Generic AI article',
      sourceUrl: articleUrl,
      evidence: 'This source mentions AI but does not link the curated entity.',
    })
  })

  assertHasErrors(bundle, [
    /facts\[4\]\.value must be a safe HTTPS URL for official-page facts/u,
    /pages\[0\] crosses the official origin without a matching repository or official-page fact/u,
  ])
  assert.throws(() => toPublicSite(bundle), TypeError)
})

test('rejects and never projects a repository fact whose value is not an HTTPS URL', () => {
  const bundle = changed((candidate) => {
    const repository = candidate.facts.find(({ field }) => field === 'repository')
    repository.value = 'argyleink/open-props'
  })

  assertHasErrors(bundle, [
    /facts\[2\]\.value must be a safe HTTPS URL for repository facts/u,
    /pages\[0\] crosses the official origin without a matching repository or official-page fact/u,
  ])
  assert.throws(() => toPublicSite(bundle), TypeError)
})

test('requires a repository fact for official repository page bundles', () => {
  assertHasErrors(changed((bundle) => {
    bundle.official.inputUrl = 'https://github.com/argyleink/open-props'
    bundle.official.finalUrl = 'https://github.com/argyleink/open-props'
    bundle.pages[1].sourceUrl = 'https://github.com/argyleink/open-props'
    bundle.pages[1].finalUrl = 'https://github.com/argyleink/open-props'
    bundle.pages[2].sourceUrl = 'https://github.com/argyleink/open-props/blob/main/README.md'
    bundle.pages[2].finalUrl = 'https://github.com/argyleink/open-props/blob/main/README.md'
    bundle.curation.tags = ['css']
    bundle.facts = bundle.facts.filter(({ field }) => !['repository', 'license'].includes(field))
  }), [/shared code-host pages require a matching repository fact/u])
})

test('accepts README, tree, and blob roles from a repository with an explicit repository fact', () => {
  const bundle = changed((candidate) => {
    candidate.official.inputUrl = 'https://github.com/argyleink/open-props'
    candidate.official.finalUrl = 'https://github.com/argyleink/open-props'
    candidate.pages[1].sourceUrl = 'https://github.com/argyleink/open-props'
    candidate.pages[1].finalUrl = 'https://github.com/argyleink/open-props'
    candidate.pages[2].sourceUrl = 'https://github.com/argyleink/open-props/blob/main/README.md'
    candidate.pages[2].finalUrl = 'https://github.com/argyleink/open-props/blob/main/README.md'
  })

  assert.deepEqual(evidenceBundleErrors(bundle), [])
})

test('allows an official repository bundle to link a separately evidenced docs origin', () => {
  const bundle = changed((candidate) => {
    candidate.official.inputUrl = 'https://github.com/argyleink/open-props'
    candidate.official.finalUrl = 'https://github.com/argyleink/open-props'
    candidate.pages[1].sourceUrl = 'https://github.com/argyleink/open-props'
    candidate.pages[1].finalUrl = 'https://github.com/argyleink/open-props'
    candidate.pages[2].sourceUrl = 'https://docs.open-props.dev/implementation'
    candidate.pages[2].finalUrl = 'https://docs.open-props.dev/implementation'
    candidate.facts.push({
      field: 'official-page',
      value: 'https://docs.open-props.dev/',
      sourceUrl: 'https://github.com/argyleink/open-props/blob/main/README.md',
      evidence: 'The official repository links to this documentation origin.',
    })
  })

  assert.deepEqual(evidenceBundleErrors(bundle), [])
})

test('accepts a cross-origin official page only when an official-page fact links it', () => {
  const bundle = changed((candidate) => {
    candidate.pages[0].sourceUrl = 'https://docs.open-props.dev/implementation'
    candidate.pages[0].finalUrl = 'https://docs.open-props.dev/implementation'
    candidate.facts.push({
      field: 'official-page',
      value: 'https://docs.open-props.dev/',
      sourceUrl: 'https://open-props.style/',
      evidence: 'The official site links this documentation origin.',
    })
  })

  assert.deepEqual(evidenceBundleErrors(bundle), [])
})

test('public official metadata is extracted only from named facts and never guessed', () => {
  const bundle = changed((candidate) => {
    candidate.curation.tags = ['css']
    candidate.pages[0].sourceUrl = 'https://open-props.style/implementation'
    candidate.pages[0].finalUrl = 'https://open-props.style/implementation'
    candidate.facts = [{
      field: 'homepage-title',
      value: 'Open Props by Adam Argyle',
      sourceUrl: 'https://open-props.style/',
      evidence: 'The homepage title contains the project and creator names.',
    }]
  })

  assert.deepEqual(evidenceBundleErrors(bundle), [])
  assert.deepEqual(toPublicSite(bundle).official, {})
})

test('projects canonical URLs from the validated snapshot without dropping meaningful query', () => {
  const canonical = changed((bundle) => {
    bundle.official.inputUrl = 'https://open-props.style'
    bundle.official.finalUrl = 'https://open-props.style'
    bundle.pages[0].sourceUrl = 'https://github.com/argyleink/open-props/tree/main/src?mode=raw'
    bundle.pages[0].finalUrl = 'https://github.com/argyleink/open-props/tree/main/src?mode=raw'
    bundle.pages[1].sourceUrl = 'https://open-props.style'
    bundle.pages[1].finalUrl = 'https://open-props.style'
    bundle.pages[2].sourceUrl = 'https://open-props.style/learn/theming?tab=dark'
    bundle.pages[2].finalUrl = 'https://open-props.style/learn/theming?tab=dark'
    const repository = bundle.facts.find(({ field }) => field === 'repository')
    repository.value = 'https://github.com/argyleink/open-props?ref=main'
  })
  const equivalent = changed((bundle) => {
    bundle.official.inputUrl = ' https://www.open-props.style/?utm_source=input#start '
    bundle.official.finalUrl = 'https://www.open-props.style/?utm_campaign=review#top'
    bundle.pages[0].sourceUrl = 'https://www.github.com/ArgyleInk/Open-Props/tree/main/src?utm_source=qa&mode=raw#tokens'
    bundle.pages[0].finalUrl = 'https://www.github.com/ArgyleInk/Open-Props/tree/main/src?mode=raw&utm_medium=test#tokens'
    bundle.pages[1].sourceUrl = 'https://www.open-props.style/?utm_source=qa#hero'
    bundle.pages[1].finalUrl = 'https://www.open-props.style/?utm_source=qa#hero'
    bundle.pages[2].sourceUrl = 'https://www.open-props.style/learn/theming?utm_campaign=qa&tab=dark#themes'
    bundle.pages[2].finalUrl = 'https://www.open-props.style/learn/theming?tab=dark&utm_medium=test#themes'
    const repository = bundle.facts.find(({ field }) => field === 'repository')
    repository.value = 'https://www.github.com/ArgyleInk/Open-Props.git?utm_source=qa&ref=main#readme'
    repository.sourceUrl = 'https://www.github.com/ArgyleInk/Open-Props/blob/main/README.md?utm_source=qa#repository'
    const license = bundle.facts.find(({ field }) => field === 'license')
    license.sourceUrl = 'https://www.github.com/ArgyleInk/Open-Props/blob/main/LICENSE?utm_source=qa#license'
  })

  const canonicalPublic = toPublicSite(canonical)
  const equivalentPublic = toPublicSite(equivalent)

  assert.deepEqual(equivalentPublic, canonicalPublic)
  assert.equal(equivalentPublic.evidenceRevision, canonicalPublic.evidenceRevision)
  assert.equal(equivalentPublic.canonicalUrl, 'https://open-props.style')
  assert.equal(
    equivalentPublic.shots.find(({ role }) => role === 'proof').sourceUrl,
    'https://github.com/argyleink/open-props/tree/main/src?mode=raw',
  )
  assert.equal(
    equivalentPublic.shots.find(({ role }) => role === 'breadth').sourceUrl,
    'https://open-props.style/learn/theming?tab=dark',
  )
  assert.equal(
    equivalentPublic.official.repository,
    'https://github.com/argyleink/open-props?ref=main',
  )
})

test('toPublicSite rejects atomically and includes every validation detail', () => {
  const bundle = changed((candidate) => {
    candidate.schemaVersion = 1
    candidate.status = 'CANDIDATE'
    candidate.official.checkedAt = 'not-a-time'
    candidate.curation.tags = ['css', 'css']
  })
  const errors = evidenceBundleErrors(bundle)

  assert.ok(errors.length >= 4)
  assert.throws(
    () => toPublicSite(bundle),
    (error) => {
      assert.ok(error instanceof TypeError || error instanceof AggregateError)
      for (const detail of errors) assert.match(error.message, new RegExp(detail.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'))
      return true
    },
  )
})

test('aggregates non-data properties without invoking accessors or array overrides', () => {
  const bundle = makeValidBundle()
  let getterCalls = 0
  bundle.status = 'CANDIDATE'
  Object.defineProperty(bundle.curation, 'name', {
    configurable: true,
    enumerable: true,
    get() {
      getterCalls += 1
      throw new Error('raw getter detail must not escape')
    },
  })
  bundle.facts.map = null
  bundle.pages[0].publish = () => 'unexpected method'

  let errors
  assert.doesNotThrow(() => {
    errors = evidenceBundleErrors(bundle)
  })
  assert.equal(getterCalls, 0)
  for (const pattern of [
    /status must be APPROVED/u,
    /curation\.name must be a data property/u,
    /facts\.map is not allowed/u,
    /pages\[0\]\.publish is not allowed/u,
  ]) {
    assert.ok(errors.some((error) => pattern.test(error)), JSON.stringify(errors))
  }
  assert.ok(errors.every((error) => !error.includes('raw getter detail')))

  assert.throws(
    () => toPublicSite(bundle),
    (error) => {
      assert.equal(error.name, 'TypeError')
      for (const detail of errors) assert.ok(error.message.includes(detail))
      assert.doesNotMatch(error.message, /raw getter detail/u)
      return true
    },
  )
  assert.equal(getterCalls, 0)
})

test('contains a throwing getPrototypeOf proxy trap as a validation error', () => {
  const proxy = new Proxy(makeValidBundle(), {
    getPrototypeOf() {
      throw new Error('raw proxy trap detail must not escape')
    },
  })
  let errors

  assert.doesNotThrow(() => {
    errors = evidenceBundleErrors(proxy)
  })
  assert.ok(errors.some((error) => /bundle could not be inspected safely/u.test(error)))
  assert.ok(errors.every((error) => !error.includes('raw proxy trap detail')))
  assert.throws(() => toPublicSite(proxy), {
    name: 'TypeError',
    message: /bundle could not be inspected safely/u,
  })
})

test('snapshots JSON own __proto__ data without changing any object prototype', () => {
  const bundle = changed((candidate) => {
    candidate.curation.pricing = JSON.parse(
      '{"label":"Free","__proto__":{"polluted":"snapshot"}}',
    )
  })

  const publicSite = toPublicSite(bundle)
  const pricingPrototype = Object.getPrototypeOf(publicSite.pricing)

  assert.equal(Object.hasOwn(publicSite.pricing, '__proto__'), true)
  assert.deepEqual(publicSite.pricing.__proto__, { polluted: 'snapshot' })
  assert.equal(pricingPrototype, Object.prototype)
  assert.equal(publicSite.pricing.polluted, undefined)
  assert.equal(Object.prototype.polluted, undefined)

  const rejected = makeValidBundle()
  Object.defineProperty(rejected, '__proto__', {
    configurable: true,
    enumerable: true,
    value: { polluted: 'bundle' },
    writable: true,
  })
  assertHasErrors(rejected, [/bundle\.__proto__ is not allowed/u])
  assert.equal(Object.prototype.polluted, undefined)
})

test('reads every proxy field once through one stable descriptor snapshot', () => {
  const target = makeValidBundle()
  const descriptorReads = new Map()
  const proxy = new Proxy(target, {
    get() {
      throw new Error('ordinary property reads must not occur')
    },
    getOwnPropertyDescriptor(object, property) {
      const readCount = (descriptorReads.get(property) ?? 0) + 1
      descriptorReads.set(property, readCount)
      const descriptor = Reflect.getOwnPropertyDescriptor(object, property)
      if (property === 'attemptId') {
        return {
          ...descriptor,
          value: `descriptor-attempt-${readCount}`,
        }
      }
      return descriptor
    },
  })

  const publicSite = toPublicSite(proxy)

  assert.equal(publicSite.evidenceRevision, 'descriptor-attempt-1')
  for (const field of Reflect.ownKeys(target)) {
    assert.equal(
      descriptorReads.get(field),
      1,
      `${String(field)} descriptor must be read exactly once`,
    )
  }
})

test('validation and projection do not mutate deeply frozen input', () => {
  const bundle = deepFreeze(makeValidBundle())
  const before = JSON.stringify(bundle)

  assert.deepEqual(evidenceBundleErrors(bundle), [])
  const publicSite = toPublicSite(bundle)

  assert.equal(JSON.stringify(bundle), before)
  assert.notEqual(publicSite.tags, bundle.curation.tags)
  assert.notEqual(publicSite.shots[0], bundle.pages[1].shot)
})
