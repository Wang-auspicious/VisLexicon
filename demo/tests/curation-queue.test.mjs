import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  buildCurationQueue,
  serializeCurationQueue,
} from '../src/lib/curation-queue.js'

const validApprovedBundle = JSON.parse(
  await readFile(
    new URL('../data/curation/approved/magic-ui.json', import.meta.url),
    'utf8',
  ),
)

function candidate(overrides = {}) {
  return {
    id: 'alpha-directory-row',
    name: 'Alpha',
    canonicalUrl: 'https://www.alpha.example/?utm_source=directory',
    descriptionZh: '这是一段尚未经过人工复核的候选简介。',
    sourceIds: ['directory-a'],
    shots: [],
    ...overrides,
  }
}

function sourceEntry(overrides = {}) {
  return {
    id: 'alpha-directory-row',
    canonicalUrl: 'https://alpha.example',
    descriptionQuality: 'machine-translation',
    canonicalizationStatus: 'normalized',
    sourceEvidence: [
      {
        sourceId: 'directory-a',
        listingUrl: 'https://directory.example/alpha',
        originalUrl: 'http://www.alpha.example/?utm_source=directory',
        resolvedUrl: 'https://alpha.example/',
        resolutionStatus: 'resolved',
      },
    ],
    ...overrides,
  }
}

test('merges candidates by normalized URL or entityKey and preserves every source observation', () => {
  const candidateIndex = {
    entries: [
      candidate(),
      candidate({
        id: 'alpha-second-row',
        canonicalUrl: 'https://alpha.example/#overview',
        sourceIds: ['directory-b'],
      }),
      candidate({
        id: 'alpha-repository-row',
        entityKey: 'alpha:official',
        canonicalUrl: 'https://github.com/acme/alpha',
        sourceIds: ['repository-index'],
      }),
      candidate({
        id: 'alpha-home-row',
        entityKey: 'alpha:official',
        canonicalUrl: 'https://alpha.example',
        sourceIds: ['manual-import'],
      }),
    ],
  }
  const sourceCatalog = {
    entries: [
      sourceEntry(),
      sourceEntry({
        id: 'alpha-second-row',
        sourceEvidence: [
          {
            sourceId: 'directory-b',
            listingUrl: 'https://other-directory.example/item/42',
            originalUrl: 'https://alpha.example/#overview',
            resolvedUrl: null,
            resolutionStatus: 'not-required',
          },
        ],
      }),
    ],
  }

  const queue = buildCurationQueue({
    candidateIndex,
    sourceCatalog,
    approvedBundles: [],
    revision: 'fixture-v2',
  })

  assert.equal(queue.summary.inputCandidates, 4)
  assert.equal(queue.summary.provisionalIdentityGroups, 1)
  assert.equal(queue.summary.duplicateClusters, 1)
  assert.deepEqual(queue.identityGroups[0].candidateIds, [
    'alpha-directory-row',
    'alpha-home-row',
    'alpha-repository-row',
    'alpha-second-row',
  ])
  assert.equal(queue.identityGroups[0].identityGroupKey, 'alpha:official')
  assert.equal(queue.identityGroups[0].recordLevelStatus, 'unresolved')
  assert.deepEqual(
    queue.identityGroups[0].observations.map(({ sourceId, originalUrl }) => [
      sourceId,
      originalUrl,
    ]),
    [
      ['directory-a', 'http://www.alpha.example/?utm_source=directory'],
      ['directory-b', 'https://alpha.example/#overview'],
      ['manual-import', 'https://alpha.example'],
      ['repository-index', 'https://github.com/acme/alpha'],
    ],
  )
})

test('quarantines malformed and unsafe links without losing their provenance', () => {
  const queue = buildCurationQueue({
    candidateIndex: {
      entries: [
        candidate({
          id: 'malformed-row',
          canonicalUrl: 'https://git+https/github.com/acme/widget.git',
        }),
        candidate({
          id: 'private-row',
          canonicalUrl: 'https://10.0.0.8/admin',
          sourceIds: ['internal-import'],
        }),
      ],
    },
    sourceCatalog: {
      entries: [
        sourceEntry({
          id: 'malformed-row',
          sourceEvidence: [
            {
              sourceId: 'npm-resources',
              listingUrl: 'https://registry.npmjs.org/',
              originalUrl: 'git+https://github.com/acme/widget.git',
              resolvedUrl: null,
              resolutionStatus: 'not-required',
            },
          ],
        }),
      ],
    },
    approvedBundles: [],
  })

  assert.equal(queue.summary.inputCandidates, 2)
  assert.equal(queue.summary.provisionalIdentityGroups, 0)
  assert.equal(queue.summary.quarantined, 2)
  assert.equal(queue.summary.malformedUrls, 1)
  assert.deepEqual(
    queue.quarantine.map(({ candidateId, reasonCode }) => [
      candidateId,
      reasonCode,
    ]),
    [
      ['malformed-row', 'MALFORMED_URL'],
      ['private-row', 'LINK_UNVERIFIABLE'],
    ],
  )
  assert.equal(
    queue.quarantine[0].observations[0].originalUrl,
    'git+https://github.com/acme/widget.git',
  )
})

test('marks evidence approved only after the strict evidence gate passes', () => {
  const rejectedBundle = structuredClone(validApprovedBundle)
  rejectedBundle.attemptId = 'rejected-missing-proof'
  rejectedBundle.pages = rejectedBundle.pages.slice(0, 2)

  const approvedQueue = buildCurationQueue({
    candidateIndex: { entries: [] },
    sourceCatalog: { entries: [] },
    approvedBundles: [
      { file: 'magic-ui.json', bundle: validApprovedBundle },
    ],
  })
  const rejectedQueue = buildCurationQueue({
    candidateIndex: { entries: [] },
    sourceCatalog: { entries: [] },
    approvedBundles: [
      { file: 'magic-ui-broken.json', bundle: rejectedBundle },
    ],
  })

  assert.equal(approvedQueue.identityGroups[0].status, 'APPROVED')
  assert.equal(approvedQueue.identityGroups[0].recordLevelStatus, 'unresolved')
  assert.deepEqual(approvedQueue.identityGroups[0].reasonCodes, [])
  assert.equal(approvedQueue.identityGroups[0].approvalAttempts[0].gatePassed, true)

  assert.equal(rejectedQueue.identityGroups[0].status, 'NEEDS_REVIEW')
  assert.ok(
    rejectedQueue.identityGroups[0].reasonCodes.includes('EVIDENCE_GATE_FAILED'),
  )
  assert.ok(
    rejectedQueue.identityGroups[0].approvalAttempts[0].gateErrors.some((error) =>
      error.includes('exactly 3'),
    ),
  )
})

test('routes unapproved candidates to explicit evidence, description, link, and identity queues', () => {
  const queue = buildCurationQueue({
    candidateIndex: {
      entries: [
        candidate({
          id: 'conflict-a',
          entityKey: 'entity:a',
          canonicalUrl: 'https://conflict.example',
          descriptionZh: '工具站：AI 设计工具站。归类为「AI 设计工具」，以付费为主。',
          shots: [{}, {}, {}],
        }),
        candidate({
          id: 'conflict-b',
          entityKey: 'entity:b',
          canonicalUrl: 'https://conflict.example/',
          shots: [{}, {}],
        }),
      ],
    },
    sourceCatalog: {
      entries: [
        sourceEntry({
          id: 'conflict-a',
          canonicalizationStatus: 'unresolved-redirect',
        }),
        sourceEntry({
          id: 'conflict-b',
          descriptionQuality: 'taxonomy-summary',
        }),
      ],
    },
    approvedBundles: [],
  })

  assert.deepEqual(queue.identityGroups[0].reasonCodes, [
    'IDENTITY_CONFLICT',
    'MISSING_APPROVED_EVIDENCE',
    'MISSING_SCREENSHOTS',
    'DESCRIPTION_TEMPLATE',
    'MACHINE_TRANSLATION',
    'LINK_ANOMALY',
  ])
  for (const reason of queue.identityGroups[0].reasonCodes) {
    assert.deepEqual(queue.reasonQueues[reason], [queue.identityGroups[0].identityGroupKey])
  }
})

test('keeps different paths on one origin distinct and routes them to entry split review', () => {
  const queue = buildCurationQueue({
    candidateIndex: {
      entries: [
        candidate({
          id: 'figma-design',
          canonicalUrl: 'https://figma.example/design',
        }),
        candidate({
          id: 'figma-community',
          canonicalUrl: 'https://figma.example/community',
        }),
      ],
    },
    sourceCatalog: { entries: [] },
    approvedBundles: [],
  })

  assert.equal(queue.summary.provisionalIdentityGroups, 2)
  assert.equal(queue.summary.exactDuplicateClusters, 0)
  assert.equal(queue.summary.exactDuplicateRowsCollapsed, 0)
  assert.equal(queue.summary.sameOriginReviewClusters, 1)
  assert.deepEqual(queue.sameOriginReviewClusters, [
    {
      origin: 'https://figma.example',
      identityGroupKeys: [
        'url:https://figma.example/community',
        'url:https://figma.example/design',
      ],
      canonicalUrls: [
        'https://figma.example/community',
        'https://figma.example/design',
      ],
    },
  ])
  assert.ok(
    queue.identityGroups.every(({ reasonCodes }) =>
      reasonCodes.includes('ENTRY_SPLIT_REVIEW'),
    ),
  )
})

test('collapses deep URLs only when a stable repository identity is available', () => {
  const queue = buildCurationQueue({
    candidateIndex: {
      entries: [
        candidate({
          id: 'repo-home',
          canonicalUrl: 'https://github.com/Acme/Widget',
        }),
        candidate({
          id: 'repo-issues',
          canonicalUrl: 'https://github.com/acme/widget/issues',
        }),
        candidate({
          id: 'other-repo',
          canonicalUrl: 'https://github.com/acme/other',
        }),
      ],
    },
    sourceCatalog: { entries: [] },
    approvedBundles: [],
  })

  assert.equal(queue.summary.provisionalIdentityGroups, 2)
  assert.equal(queue.summary.stableIdentityClusters, 1)
  assert.equal(queue.summary.exactDuplicateClusters, 0)
  assert.equal(queue.summary.exactDuplicateRowsCollapsed, 0)
  assert.deepEqual(
    queue.identityGroups.find(({ candidateIds }) => candidateIds.includes('repo-home'))
      .candidateIds,
    ['repo-home', 'repo-issues'],
  )
  assert.equal(queue.summary.sameOriginReviewClusters, 0)
})

test('keeps distinct monorepo package paths separate and routes the repo scope to split review', () => {
  const queue = buildCurationQueue({
    candidateIndex: {
      entries: [
        candidate({
          id: 'package-alpha',
          canonicalUrl: 'https://github.com/acme/monorepo/packages/alpha',
        }),
        candidate({
          id: 'package-beta',
          canonicalUrl: 'https://github.com/acme/monorepo/packages/beta',
        }),
      ],
    },
    sourceCatalog: { entries: [] },
    approvedBundles: [],
  })

  assert.equal(queue.summary.provisionalIdentityGroups, 2)
  assert.equal(queue.summary.stableIdentityClusters, 0)
  assert.equal(queue.summary.sameOriginReviewClusters, 1)
  assert.deepEqual(queue.sameOriginReviewClusters, [
    {
      origin: 'https://github.com/acme/monorepo',
      identityGroupKeys: [
        'url:https://github.com/acme/monorepo/packages/alpha',
        'url:https://github.com/acme/monorepo/packages/beta',
      ],
      canonicalUrls: [
        'https://github.com/acme/monorepo/packages/alpha',
        'https://github.com/acme/monorepo/packages/beta',
      ],
    },
  ])
})

test('serialization is byte-stable, classification-neutral, and gives AI no special priority', () => {
  const entries = [
    candidate({
      id: 'zeta-ai',
      name: 'AI Agent Zeta',
      canonicalUrl: 'https://zeta.example',
      category: 'AI 设计工具',
      score: 100,
    }),
    candidate({
      id: 'alpha-official',
      name: 'Alpha Official',
      canonicalUrl: 'https://alpha.example',
      category: '商业官网',
      score: 1,
    }),
  ]
  const args = {
    candidateIndex: { entries },
    sourceCatalog: { entries: [] },
    approvedBundles: [],
    revision: 'stable-fixture',
  }
  const reversedArgs = {
    ...args,
    candidateIndex: { entries: [...entries].reverse() },
  }

  const first = serializeCurationQueue(buildCurationQueue(args))
  const second = serializeCurationQueue(buildCurationQueue(args))
  const reordered = serializeCurationQueue(buildCurationQueue(reversedArgs))

  assert.equal(first, second)
  assert.equal(first, reordered)
  assert.deepEqual(
    JSON.parse(first).identityGroups.map(({ canonicalUrl }) => canonicalUrl),
    ['https://alpha.example', 'https://zeta.example'],
  )
  assert.doesNotMatch(first, /"(?:category|score|priority)"/u)
  assert.equal(JSON.parse(first).policy.classificationNeutral, true)
  assert.equal(JSON.parse(first).policy.aiPriority, false)
  assert.equal(
    JSON.parse(first).policy.granularity,
    'provisional-identity-groups',
  )
  assert.doesNotMatch(first, /"(?:entities|uniqueEntities|entityKeys)"/u)
})

test('the production corpus retains all 17 known malformed URLs in quarantine', async () => {
  const [candidateIndex, sourceCatalog] = await Promise.all([
    readFile(
      new URL('../public/data/site-catalog-index.json', import.meta.url),
      'utf8',
    ).then(JSON.parse),
    readFile(
      new URL('../src/data/site-catalog.json', import.meta.url),
      'utf8',
    ).then(JSON.parse),
  ])

  const queue = buildCurationQueue({
    candidateIndex,
    sourceCatalog,
    approvedBundles: [],
    revision: 'production-corpus-test',
  })

  assert.equal(queue.summary.inputCandidates, 8_684)
  assert.equal(queue.summary.malformedUrls, 17)
  assert.equal(queue.summary.quarantined, 23)
  assert.equal(queue.summary.exactDuplicateClusters, 5)
  assert.equal(queue.summary.exactDuplicateRowsCollapsed, 5)
  assert.equal(queue.summary.stableIdentityClusters, 0)
  assert.equal(queue.summary.stableIdentityRowsCollapsed, 0)
  assert.equal(
    queue.quarantine.filter(({ reasonCode }) => reasonCode === 'MALFORMED_URL')
      .length,
    17,
  )
  assert.equal(
    queue.summary.inputCandidates,
    queue.summary.validCandidateRows + queue.summary.quarantined,
  )
})

test('the CLI writes only the requested v2 output and reruns byte-identically', async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'curation-queue-v2-'))
  const output = join(temporaryDirectory, 'work-queue-v2.json')
  const script = fileURLToPath(
    new URL('../scripts/build-curation-queue-v2.mjs', import.meta.url),
  )

  try {
    const firstReport = JSON.parse(
      execFileSync(process.execPath, [script, '--output', output], {
        encoding: 'utf8',
      }),
    )
    const firstBytes = await readFile(output)
    const secondReport = JSON.parse(
      execFileSync(process.execPath, [script, '--output', output], {
        encoding: 'utf8',
      }),
    )
    const secondBytes = await readFile(output)

    assert.deepEqual(firstBytes, secondBytes)
    assert.deepEqual(firstReport.summary, secondReport.summary)
    assert.equal(firstReport.summary.approved, 6)
    assert.equal(firstReport.summary.quarantined, 23)
    assert.equal(firstReport.output, output)
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
})
