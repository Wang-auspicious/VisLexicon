import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createRequestFailure,
  createSourceObservation,
  deriveSourceRecords,
  stableStringify,
  summarizeRequests,
  validateCountConservation,
} from '../src/lib/source-observation-ledger.js'
import {
  buildNpmPayload,
  collectNpmResources,
} from '../scripts/collect-npm-resources.mjs'
import {
  buildSaasPayload,
  parseSaasLandingPage,
} from '../scripts/collect-saaslandingpage.mjs'
import {
  buildTooolsPayload,
  extractResourceObservations,
} from '../scripts/collect-toools.mjs'
import {
  buildDesignResourcesPayload,
  parseMarkdownResourceObservations,
} from '../scripts/collect-design-resources.mjs'

const observedAt = '2026-09-01T00:00:00.000Z'

function observation(overrides = {}) {
  return createSourceObservation({
    sourceId: 'fixture',
    observedAt,
    request: { requestId: 'request-1', query: 'icons', from: 0 },
    ordinal: 0,
    raw: {
      name: 'Fixture',
      originalUrl: 'https://example.com',
      originalDescription: 'A sufficiently detailed fixture description.',
    },
    disposition: { status: 'accepted', reason: 'eligible' },
    ...overrides,
  })
}

test('source observations are deeply immutable and have stable bytes and IDs', () => {
  const input = {
    sourceId: 'fixture',
    observedAt,
    request: { query: 'icons', requestId: 'request-1', from: 0 },
    ordinal: 0,
    raw: { originalUrl: 'https://example.com', name: 'Fixture' },
    disposition: { reason: 'eligible', status: 'accepted' },
  }
  const before = structuredClone(input)
  const first = createSourceObservation(input)
  const second = createSourceObservation({
    disposition: { status: 'accepted', reason: 'eligible' },
    raw: { name: 'Fixture', originalUrl: 'https://example.com' },
    ordinal: 0,
    request: { from: 0, requestId: 'request-1', query: 'icons' },
    observedAt,
    sourceId: 'fixture',
  })

  assert.deepEqual(input, before, 'creating an observation must not mutate input')
  assert.equal(first.observationId, second.observationId)
  assert.equal(stableStringify(first), stableStringify(second))
  assert.equal(Object.isFrozen(first), true)
  assert.equal(Object.isFrozen(first.raw), true)
  assert.throws(() => {
    first.raw.name = 'Changed'
  }, TypeError)
})

test('dedupe is derived after accepted and rejected duplicate observations are retained', () => {
  const acceptedA = observation({
    request: { requestId: 'request-1', query: 'icons', from: 0 },
    raw: {
      name: 'Fixture',
      originalUrl: 'https://example.com',
      originalDescription: 'Short but sufficiently detailed description.',
      popularity: 0.4,
    },
  })
  const acceptedB = observation({
    request: { requestId: 'request-2', query: 'design system', from: 0 },
    raw: {
      name: 'Fixture UI',
      originalUrl: 'https://example.com',
      originalDescription: 'A longer and more useful description for the same source URL.',
      popularity: 0.8,
    },
  })
  const rejected = observation({
    ordinal: 1,
    raw: { name: 'Broken', originalUrl: 'not a url' },
    disposition: { status: 'rejected', reason: 'malformed-site-url' },
  })
  const observations = [acceptedA, acceptedB, rejected]

  const records = deriveSourceRecords(observations, {
    key: (item) => item.raw.originalUrl,
    project: (item) => item.raw,
    merge: (existing, next) => ({
      ...existing,
      originalDescription:
        existing.originalDescription.length >= next.originalDescription.length
          ? existing.originalDescription
          : next.originalDescription,
      popularity: Math.max(existing.popularity, next.popularity),
    }),
  })

  assert.equal(observations.length, 3)
  assert.equal(records.length, 1)
  assert.equal(records[0].popularity, 0.8)
  assert.equal(records[0].originalDescription, acceptedB.raw.originalDescription)
  assert.equal(rejected.disposition.reason, 'malformed-site-url')
})

test('request failures are separate from raw hits and both conservation equations hold', () => {
  const observations = [observation()]
  const failures = [
    createRequestFailure({
      sourceId: 'fixture',
      requestId: 'request-2',
      url: 'https://example.com/page/2',
      message: '503 Service Unavailable',
    }),
  ]
  const requestSummary = summarizeRequests({
    requestAttempts: 2,
    successfulRequests: 1,
    observations,
    failures,
  })

  assert.deepEqual(requestSummary, {
    requestAttempts: 2,
    successfulRequests: 1,
    failedRequests: 1,
    returnedRawHits: 1,
  })
  assert.deepEqual(validateCountConservation({ observations, failures, requestSummary }), [])
  assert.match(
    validateCountConservation({
      observations,
      failures,
      requestSummary: { ...requestSummary, returnedRawHits: 2 },
    })[0],
    /returnedRawHits/,
  )
})

test('npm fixture keeps every result as an observation before deriving compatible records', async () => {
  const requests = []
  const fetchImpl = async (url) => {
    requests.push(url)
    if (url.includes('from=250')) throw new Error('fixture timeout')
    return {
      ok: true,
      json: async () => ({
        objects: [
          {
            package: {
              name: 'valid-a',
              description: 'A valid component library with a sufficiently long description.',
              links: { homepage: 'https://components.example.com' },
            },
            score: { detail: { popularity: 0.7 } },
          },
          {
            package: {
              name: 'valid-b',
              description: 'A longer valid description for the same component library homepage.',
              links: { homepage: 'https://components.example.com' },
            },
            score: { detail: { popularity: 0.9 } },
          },
          {
            package: {
              name: 'malformed',
              description: 'This result is long enough but exposes a malformed homepage URL.',
              links: { homepage: 'not a url' },
            },
            score: { detail: { popularity: 0.9 } },
          },
        ],
      }),
    }
  }

  const payload = await collectNpmResources({
    fetchImpl,
    queries: [['fixture query', 'React UI Libraries', 'React UI 库']],
    fromValues: [0, 250],
    minPopularity: 0.2,
    observedAt,
    collectedAt: '2026-09-01',
    delayMs: 0,
  })

  assert.equal(requests.length, 2)
  assert.equal(payload.schemaVersion, 2)
  assert.equal(payload.observations.length, 3)
  assert.equal(payload.rawRecordCount, 3)
  assert.equal(payload.records.length, 1)
  assert.equal(payload.records[0].popularity, 0.9)
  assert.equal(payload.observations[2].disposition.reason, 'malformed-site-url')
  assert.equal(payload.source.failures.length, 1)
  assert.equal(payload.failures.length, 1)
  assert.deepEqual(validateCountConservation(payload), [])
})

test('SaaS parser preserves duplicate and malformed articles as observations', () => {
  const html = `
    <article><a href="https://one.example"><h2>One</h2><p class="desc">First description</p></a></article>
    <article><a href="https://one.example"><h2>One again</h2></a></article>
    <article><a href="not-a-url"><h2>Broken</h2></a></article>
  `
  const observations = parseSaasLandingPage(html, {
    listingUrl: 'https://saaslandingpage.com/page/2/',
    page: 2,
    observedAt,
  })
  const payload = buildSaasPayload({
    observations,
    failures: [],
    requestAttempts: 1,
    successfulRequests: 1,
    collectedAt: '2026-09-01',
  })

  assert.equal(observations.length, 3)
  assert.deepEqual(observations.map((item) => item.ordinal), [0, 1, 2])
  assert.ok(observations.every((item) => item.raw.listingUrl.endsWith('/page/2/')))
  assert.equal(observations[2].disposition.reason, 'malformed-original-url')
  assert.equal(payload.records.length, 1)
  assert.equal(payload.rawRecordCount, 3)
  assert.deepEqual(validateCountConservation(payload), [])
})

test('all four collector payload builders expose the unified observation contract', () => {
  const accepted = observation()
  const configurations = [
    buildNpmPayload({
      observations: [accepted],
      failures: [],
      requestAttempts: 1,
      successfulRequests: 1,
      collectedAt: '2026-09-01',
      queries: [['icons', 'Icons', '图标']],
    }),
    buildSaasPayload({
      observations: [accepted],
      failures: [],
      requestAttempts: 1,
      successfulRequests: 1,
      collectedAt: '2026-09-01',
    }),
    buildTooolsPayload({
      observations: [accepted],
      failures: [],
      requestAttempts: 1,
      successfulRequests: 1,
      listings: [{ name: 'Icons', path: '/icons', url: 'https://www.toools.design/icons', recordCount: 1 }],
      collectedAt: '2026-09-01',
    }),
    buildDesignResourcesPayload({
      observations: [accepted],
      failures: [],
      requestAttempts: 1,
      successfulRequests: 1,
      sourceMeta: { collectedAt: '2026-09-01' },
    }),
  ]

  for (const payload of configurations) {
    assert.equal(payload.schemaVersion, 2)
    assert.equal(payload.rawRecordCount, payload.observations.length)
    assert.equal(payload.records.length, 1)
    assert.deepEqual(validateCountConservation(payload), [])
  }
})

test('importing all collectors has no network side effects', async () => {
  const originalFetch = globalThis.fetch
  let calls = 0
  globalThis.fetch = async () => {
    calls += 1
    throw new Error('network should not be called during import')
  }
  try {
    await Promise.all([
      import(`../scripts/collect-npm-resources.mjs?side-effect=${Date.now()}`),
      import(`../scripts/collect-saaslandingpage.mjs?side-effect=${Date.now()}`),
      import(`../scripts/collect-toools.mjs?side-effect=${Date.now()}`),
      import(`../scripts/collect-design-resources.mjs?side-effect=${Date.now()}`),
    ])
    assert.equal(calls, 0)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('safe snapshot rejects active, exotic, cyclic, sparse, symbolic, and prototype-polluting inputs', () => {
  let getterCalls = 0
  const accessor = {
    sourceId: 'fixture',
    observedAt,
    request: { requestId: 'request-1' },
    ordinal: 0,
    raw: {},
    disposition: { status: 'accepted', reason: 'eligible' },
  }
  Object.defineProperty(accessor.raw, 'name', {
    enumerable: true,
    get() {
      getterCalls += 1
      return 'must not run'
    },
  })
  assert.throws(() => createSourceObservation(accessor), /accessor/i)
  assert.equal(getterCalls, 0)

  let proxyTraps = 0
  const proxied = new Proxy(accessor, {
    get() {
      proxyTraps += 1
      return undefined
    },
    ownKeys() {
      proxyTraps += 1
      return []
    },
  })
  assert.throws(() => stableStringify(proxied), /proxy/i)
  assert.equal(proxyTraps, 0)

  const cyclic = {}
  cyclic.self = cyclic
  const sparse = []
  sparse.length = 1
  const symbolic = { okay: true, [Symbol('unsafe')]: true }
  const polluted = { okay: true }
  Object.defineProperty(polluted, '__proto__', { value: {}, enumerable: true })

  for (const unsafe of [new Date(), cyclic, sparse, symbolic, polluted, Number.NaN]) {
    assert.throws(() => stableStringify(unsafe))
  }
})

test('observation IDs are full SHA-256 and separate ordinal, request, and raw-hit identity', () => {
  const base = observation()
  const reordered = createSourceObservation({
    disposition: { reason: 'eligible', status: 'accepted' },
    raw: {
      originalDescription: 'A sufficiently detailed fixture description.',
      originalUrl: 'https://example.com',
      name: 'Fixture',
    },
    ordinal: 0,
    request: { from: 0, query: 'icons', requestId: 'request-1' },
    observedAt,
    sourceId: 'fixture',
  })
  const nextOrdinal = observation({ ordinal: 1 })
  const nextRequest = observation({ request: { requestId: 'request-2', query: 'icons', from: 0 } })
  const nextRaw = observation({
    raw: {
      name: 'Other fixture',
      originalUrl: 'https://other.example.com',
      originalDescription: 'A sufficiently detailed fixture description.',
    },
  })

  assert.match(base.observationId, /^obs-[a-f0-9]{64}$/)
  assert.equal(base.observationId, reordered.observationId)
  assert.equal(new Set([base.observationId, nextOrdinal.observationId, nextRequest.observationId, nextRaw.observationId]).size, 4)
})

test('ledger validates canonical identity strings, ISO time, safe counters, and mirrored failures', () => {
  for (const invalid of [
    { sourceId: '' },
    { sourceId: 'fixture', observedAt: '2026-09-01' },
    { sourceId: 'fixture', observedAt, request: { requestId: ' ' } },
    {
      sourceId: 'fixture',
      observedAt,
      request: { requestId: 'request-1' },
      disposition: { status: 'accepted', reason: '' },
    },
  ]) {
    assert.throws(() =>
      createSourceObservation({
        sourceId: 'fixture',
        observedAt,
        request: { requestId: 'request-1' },
        ordinal: 0,
        raw: {},
        disposition: { status: 'accepted', reason: 'eligible' },
        ...invalid,
      }),
    )
  }

  for (const counts of [
    { requestAttempts: -1, successfulRequests: 0 },
    { requestAttempts: 1.5, successfulRequests: 1 },
    { requestAttempts: Number.MAX_SAFE_INTEGER + 1, successfulRequests: 0 },
  ]) {
    assert.throws(() => summarizeRequests({ ...counts, observations: [], failures: [] }), /safe integer/i)
  }

  const failure = createRequestFailure({
    sourceId: 'fixture',
    requestId: 'request-2',
    message: 'failed',
  })
  const requestSummary = summarizeRequests({
    requestAttempts: 1,
    successfulRequests: 0,
    observations: [],
    failures: [failure],
  })
  const errors = validateCountConservation({
    observations: [],
    failures: [],
    source: { failures: [failure] },
    requestSummary,
    rawRecordCount: 0,
  })
  assert.ok(errors.some((error) => error.includes('root failures')))
})

test('Toools creates an observation for every matching card before rejecting malformed cards', () => {
  const listing = { name: 'Icons', path: '/icons', url: 'https://www.toools.design/icons' }
  const html = `
    <a href="https://valid.example/a" class="card_global resources-card"><h3 class="headline_3">Valid</h3><p class="resources_description">Good description</p></a>
    <a href="https://valid.example/a" class="card_global resources-card"><h3 class="headline_3">Valid</h3><p class="resources_description">Good description</p></a>
    <a class="card_global resources-card"><h3 class="headline_3">No href</h3><p class="resources_description">Description</p></a>
    <a href="not-a-url" class="card_global resources-card"><h3 class="headline_3">Bad URL</h3><p class="resources_description">Description</p></a>
    <a href="https://valid.example/no-description" class="card_global resources-card"><h3 class="headline_3">No description</h3></a>
  `
  const observations = extractResourceObservations(html, listing, { observedAt })
  const payload = buildTooolsPayload({
    observations,
    failures: [],
    requestAttempts: 1,
    successfulRequests: 1,
    listings: [{ ...listing, observationCount: observations.length, recordCount: 2 }],
    collectedAt: '2026-09-01',
  })

  assert.equal(observations.length, 5)
  assert.deepEqual(
    observations.map(({ disposition }) => disposition.reason),
    ['resource-card', 'resource-card', 'missing-original-url', 'malformed-original-url', 'missing-description'],
  )
  assert.equal(payload.records.length, 2, 'valid duplicate directory cards remain distinct records')
  assert.equal(payload.listingPages[0].observationCount, 5)
})

test('Design Resources observes every target Markdown row and keeps valid duplicate rows', () => {
  const markdown = `
## Icons
| Website | Description |
| --- | --- |
| [Valid](https://valid.example/a) | Good description |
| [Valid](https://valid.example/a) | Good description |
| [Bad URL](not-a-url) | Description |
| [](https://valid.example/no-name) | Description |
| [No description](https://valid.example/no-description) | |
  `
  const sourceMeta = {
    defaultBranch: 'main',
    readmePath: 'README.md',
    collectedAt: '2026-09-01',
  }
  const observations = parseMarkdownResourceObservations(markdown, sourceMeta, { observedAt })
  const payload = buildDesignResourcesPayload({
    observations,
    failures: [],
    requestAttempts: 1,
    successfulRequests: 1,
    sourceMeta,
  })

  assert.equal(observations.length, 5)
  assert.deepEqual(
    observations.map(({ disposition }) => disposition.reason),
    ['directory-row', 'directory-row', 'malformed-original-url', 'missing-name', 'missing-description'],
  )
  assert.equal(payload.records.length, 2, 'valid duplicate directory rows remain distinct records')
})

test('npm and SaaS listing manifests distinguish observations, accepted hits, and unique records', () => {
  const npmAccepted = observation({
    sourceId: 'npm-resources',
    request: {
      requestId: 'npm:icons:0',
      query: 'icons',
      from: 0,
      categoryOriginal: 'Icons',
      subcategoryZh: '图标',
    },
  })
  const npmRejected = observation({
    sourceId: 'npm-resources',
    ordinal: 1,
    request: {
      requestId: 'npm:icons:0',
      query: 'icons',
      from: 0,
      categoryOriginal: 'Icons',
      subcategoryZh: '图标',
    },
    disposition: { status: 'rejected', reason: 'missing-site-url' },
  })
  const npm = buildNpmPayload({
    observations: [npmAccepted, npmRejected],
    failures: [],
    requestAttempts: 1,
    successfulRequests: 1,
    collectedAt: '2026-09-01',
    queries: [['icons', 'Icons', '图标']],
  })
  assert.deepEqual(
    {
      observationCount: npm.listingPages[0].observationCount,
      recordCount: npm.listingPages[0].recordCount,
    },
    { observationCount: 2, recordCount: 1 },
  )

  const saas = buildSaasPayload({
    observations: [observation(), observation({ ordinal: 1 })],
    failures: [],
    requestAttempts: 1,
    successfulRequests: 1,
    collectedAt: '2026-09-01',
  })
  assert.equal(saas.listingPages[0].observationCount, 2)
  assert.equal(saas.listingPages[0].acceptedObservationCount, 2)
  assert.equal(saas.listingPages[0].recordCount, 1)

  const npmFailure = createRequestFailure({
    sourceId: 'npm-resources',
    requestId: 'npm:failed query:0',
    query: 'failed query',
    from: 0,
    message: 'fixture failure',
  })
  const failedNpm = buildNpmPayload({
    observations: [],
    failures: [npmFailure],
    requestAttempts: 1,
    successfulRequests: 0,
    collectedAt: '2026-09-01',
    queries: [['failed query', 'Icons', '图标']],
  })
  assert.equal(failedNpm.listingPages[0].status, 'failed')
  assert.equal(failedNpm.listingPages[0].recordCount, 0)

  const saasFailure = createRequestFailure({
    sourceId: 'saaslandingpage',
    requestId: 'saaslandingpage:page:2',
    page: 2,
    message: 'fixture failure',
  })
  const failedSaas = buildSaasPayload({
    observations: [],
    failures: [saasFailure],
    requestAttempts: 1,
    successfulRequests: 0,
    collectedAt: '2026-09-01',
  })
  assert.equal(failedSaas.listingPages[0].status, 'failed')
  assert.equal(failedSaas.listingPages[0].recordCount, 0)
})
