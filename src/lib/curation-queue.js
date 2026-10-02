import { evidenceBundleErrors } from './curation-evidence.js'
import { normalizeIdentityUrl } from './site-identity.js'

const REASON_ORDER = [
  'IDENTITY_CONFLICT',
  'ENTRY_SPLIT_REVIEW',
  'EVIDENCE_GATE_FAILED',
  'MISSING_APPROVED_EVIDENCE',
  'MISSING_SCREENSHOTS',
  'SCREENSHOTS_UNVERIFIED',
  'DESCRIPTION_TEMPLATE',
  'MACHINE_TRANSLATION',
  'LINK_ANOMALY',
]
const TEMPLATE_DESCRIPTION_PHRASES = [
  '归类为',
  'AI 设计工具站。',
  '以付费为主。',
]
const SHARED_CODE_HOSTS = new Set([
  'bitbucket.org',
  'github.com',
  'gitlab.com',
])
const REPOSITORY_EVIDENCE_PATHS = new Set([
  'actions',
  'blob',
  'commit',
  'commits',
  'discussions',
  'issues',
  'projects',
  'pull',
  'pulls',
  'releases',
  'security',
  'tree',
  'wiki',
])

function compareText(left, right) {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

function sortedUnique(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined))]
    .sort(compareText)
}

function asNonEmptyString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalizeOrNull(value) {
  try {
    return normalizeIdentityUrl(value)
  } catch {
    return null
  }
}

function repositoryBase(normalizedUrl) {
  const url = new URL(normalizedUrl)
  const pieces = url.pathname.split('/').filter(Boolean)

  if (
    (url.hostname === 'github.com' || url.hostname === 'bitbucket.org') &&
    pieces.length >= 2
  ) {
    return `${url.origin}/${pieces[0].toLowerCase()}/${pieces[1]
      .replace(/\.git$/iu, '')
      .toLowerCase()}`
  }
  return null
}

function stableRepositoryIdentity(normalizedUrl) {
  const base = repositoryBase(normalizedUrl)
  if (!base) return null

  const url = new URL(normalizedUrl)
  const pieces = url.pathname.split('/').filter(Boolean)
  const firstNestedSegment = pieces[2]?.toLowerCase()
  if (!firstNestedSegment || REPOSITORY_EVIDENCE_PATHS.has(firstNestedSegment)) {
    return base
  }

  // Arbitrary deep paths can be independently curated packages/content units
  // in a monorepo. They need an explicit entityKey/packageId before merging.
  return null
}

function isKnownMalformedUrl(rawUrl) {
  return rawUrl === 'https://.' || /^https:\/\/git\+https\//iu.test(rawUrl)
}

function fallbackSourceIds(candidate) {
  return Array.isArray(candidate?.sourceIds)
    ? candidate.sourceIds.filter((value) => asNonEmptyString(value))
    : []
}

function sourceObservation(candidate, evidence) {
  return {
    candidateId: candidate.id,
    sourceId: asNonEmptyString(evidence?.sourceId) ?? 'unknown-source',
    listingUrl: asNonEmptyString(evidence?.listingUrl),
    originalUrl:
      asNonEmptyString(evidence?.originalUrl) ?? candidate.canonicalUrl,
    resolvedUrl: asNonEmptyString(evidence?.resolvedUrl),
  }
}

function observationKey(observation) {
  return [
    observation.candidateId,
    observation.sourceId,
    observation.listingUrl ?? '',
    observation.originalUrl,
    observation.resolvedUrl ?? '',
  ].join('\u0000')
}

function compareObservations(left, right) {
  return (
    compareText(left.sourceId, right.sourceId) ||
    compareText(left.originalUrl, right.originalUrl) ||
    compareText(left.candidateId, right.candidateId) ||
    compareText(left.listingUrl ?? '', right.listingUrl ?? '') ||
    compareText(left.resolvedUrl ?? '', right.resolvedUrl ?? '')
  )
}

function observationsForCandidate(candidate, sourceEntry) {
  const sourceEvidence = Array.isArray(sourceEntry?.sourceEvidence)
    ? sourceEntry.sourceEvidence
    : []
  const observations = sourceEvidence.length > 0
    ? sourceEvidence.map((evidence) => sourceObservation(candidate, evidence))
    : fallbackSourceIds(candidate).map((sourceId) =>
      sourceObservation(candidate, {
        sourceId,
        originalUrl: candidate.canonicalUrl,
      }),
    )

  if (observations.length === 0) {
    observations.push(
      sourceObservation(candidate, {
        sourceId: 'unknown-source',
        originalUrl: candidate.canonicalUrl,
      }),
    )
  }

  const unique = new Map()
  for (const observation of observations) {
    unique.set(observationKey(observation), observation)
  }
  return [...unique.values()].sort(compareObservations)
}

function unwrapApprovedBundle(value, index) {
  if (value && typeof value === 'object' && value.bundle) {
    return {
      file: asNonEmptyString(value.file) ?? `approved[${index}]`,
      bundle: value.bundle,
    }
  }
  return { file: `approved[${index}]`, bundle: value }
}

class DisjointSet {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, index) => index)
  }

  find(index) {
    let root = index
    while (this.parent[root] !== root) root = this.parent[root]
    while (this.parent[index] !== index) {
      const parent = this.parent[index]
      this.parent[index] = root
      index = parent
    }
    return root
  }

  union(left, right) {
    const leftRoot = this.find(left)
    const rightRoot = this.find(right)
    if (leftRoot === rightRoot) return
    const winner = Math.min(leftRoot, rightRoot)
    const loser = Math.max(leftRoot, rightRoot)
    this.parent[loser] = winner
  }
}

function unionIdentityTokens(nodes, disjointSet) {
  const tokenOwner = new Map()
  for (let index = 0; index < nodes.length; index += 1) {
    for (const token of sortedUnique(nodes[index].identityTokens)) {
      const owner = tokenOwner.get(token)
      if (owner === undefined) tokenOwner.set(token, index)
      else disjointSet.union(owner, index)
    }
  }
}

function groupNodes(nodes, disjointSet) {
  const groups = new Map()
  for (let index = 0; index < nodes.length; index += 1) {
    const root = disjointSet.find(index)
    const group = groups.get(root) ?? []
    group.push(nodes[index])
    groups.set(root, group)
  }
  return [...groups.values()]
}

function reasonSort(left, right) {
  return REASON_ORDER.indexOf(left) - REASON_ORDER.indexOf(right)
}

function candidateHasTemplateDescription(candidate, sourceEntry) {
  const description = asNonEmptyString(candidate.descriptionZh) ?? ''
  return (
    sourceEntry?.descriptionQuality === 'taxonomy-summary' ||
    TEMPLATE_DESCRIPTION_PHRASES.some((phrase) => description.includes(phrase))
  )
}

function candidateHasLinkAnomaly(sourceEntry) {
  if (!sourceEntry) return false
  if (
    sourceEntry.canonicalizationStatus &&
    sourceEntry.canonicalizationStatus !== 'normalized'
  ) {
    return true
  }
  return (sourceEntry.sourceEvidence ?? []).some(({ resolutionStatus }) =>
    ['failed', 'unchanged', 'unresolved'].includes(resolutionStatus),
  )
}

function approvedAttempt(node) {
  const bundle = node.bundle
  return {
    file: node.file,
    attemptId: asNonEmptyString(bundle?.attemptId),
    entityKey: asNonEmptyString(bundle?.entityKey),
    canonicalUrl: node.normalizedUrls[0] ?? null,
    gatePassed: node.gateErrors.length === 0,
    gateErrors: [...node.gateErrors],
  }
}

function preferredApprovedNode(approvedNodes) {
  return [...approvedNodes].sort((left, right) =>
    compareText(asNonEmptyString(left.bundle?.attemptId) ?? '', asNonEmptyString(right.bundle?.attemptId) ?? '') ||
    compareText(left.file, right.file),
  )[0]
}

function buildIdentityGroup(group) {
  const candidateNodes = group.filter(({ kind }) => kind === 'candidate')
  const approvedNodes = group.filter(({ kind }) => kind === 'approved')
  const validApprovedNodes = approvedNodes.filter(
    ({ gateErrors }) => gateErrors.length === 0,
  )
  const explicitKeys = sortedUnique(
    group.map(({ explicitEntityKey }) => explicitEntityKey),
  )
  const normalizedUrls = sortedUnique(
    group.flatMap(({ normalizedUrls: urls }) => urls),
  )
  const approvedWinner = preferredApprovedNode(validApprovedNodes)
  const canonicalUrl = approvedWinner?.normalizedUrls[0] ?? normalizedUrls[0] ?? null
  const identityGroupKey = explicitKeys.length === 1
    ? explicitKeys[0]
    : canonicalUrl
      ? `url:${canonicalUrl}`
      : `attempt:${approvedNodes
        .map(({ bundle }) => asNonEmptyString(bundle?.attemptId) ?? 'unknown')
        .sort(compareText)[0]}`
  const identityConflict = explicitKeys.length > 1
  const approved = validApprovedNodes.length > 0 && !identityConflict
  const reasonCodes = new Set()

  if (!approved) {
    if (identityConflict) reasonCodes.add('IDENTITY_CONFLICT')
    if (approvedNodes.some(({ gateErrors }) => gateErrors.length > 0)) {
      reasonCodes.add('EVIDENCE_GATE_FAILED')
    }
    if (validApprovedNodes.length === 0) {
      reasonCodes.add('MISSING_APPROVED_EVIDENCE')
    }
    if (candidateNodes.length > 0) {
      if (candidateNodes.every(({ candidate }) => candidate.shots?.length === 3)) {
        reasonCodes.add('SCREENSHOTS_UNVERIFIED')
      } else {
        reasonCodes.add('MISSING_SCREENSHOTS')
      }
      if (
        candidateNodes.some(({ candidate, sourceEntry }) =>
          candidateHasTemplateDescription(candidate, sourceEntry),
        )
      ) {
        reasonCodes.add('DESCRIPTION_TEMPLATE')
      }
      if (
        candidateNodes.some(
          ({ sourceEntry }) => sourceEntry?.descriptionQuality === 'machine-translation',
        )
      ) {
        reasonCodes.add('MACHINE_TRANSLATION')
      }
      if (candidateNodes.some(({ sourceEntry }) => candidateHasLinkAnomaly(sourceEntry))) {
        reasonCodes.add('LINK_ANOMALY')
      }
    }
  }

  const observations = candidateNodes
    .flatMap(({ observations: records }) => records)
    .sort(compareObservations)
  const candidateIds = sortedUnique(
    candidateNodes.map(({ candidate }) => candidate.id),
  )
  const candidateNames = sortedUnique(
    candidateNodes.map(({ candidate }) => asNonEmptyString(candidate.name)),
  )
  const approvedName = approvedWinner
    ? asNonEmptyString(approvedWinner.bundle?.curation?.name)
    : null
  const candidateUrlCounts = new Map()
  const repositoryUrls = new Map()
  const explicitKeyCounts = new Map()
  for (const node of candidateNodes) {
    const url = node.normalizedUrls[0]
    candidateUrlCounts.set(url, (candidateUrlCounts.get(url) ?? 0) + 1)
    if (node.explicitEntityKey) {
      explicitKeyCounts.set(
        node.explicitEntityKey,
        (explicitKeyCounts.get(node.explicitEntityKey) ?? 0) + 1,
      )
    }
    for (const token of node.identityTokens) {
      if (!token?.startsWith('repository:')) continue
      const urls = repositoryUrls.get(token) ?? new Set()
      urls.add(url)
      repositoryUrls.set(token, urls)
    }
  }
  const exactRowsCollapsed = [...candidateUrlCounts.values()].reduce(
    (sum, count) => sum + Math.max(0, count - 1),
    0,
  )
  const stableIdentityRowsCollapsed = [...repositoryUrls.values()].reduce(
    (sum, urls) => sum + Math.max(0, urls.size - 1),
    0,
  )
  const explicitEntityKeyMerge = [...explicitKeyCounts.values()].some(
    (count) => count > 1,
  )

  return {
    identityGroupKey,
    canonicalUrl,
    name: approvedName ?? candidateNames[0] ?? identityGroupKey,
    status: approved ? 'APPROVED' : 'NEEDS_REVIEW',
    recordLevelStatus: 'unresolved',
    identityStatus: identityConflict
      ? 'conflict'
      : explicitKeys.length === 1
        ? 'explicit'
        : 'provisional-url-key',
    candidateIds,
    normalizedUrls,
    observations,
    reasonCodes: [...reasonCodes].sort(reasonSort),
    approvalAttempts: approvedNodes
      .map(approvedAttempt)
      .sort((left, right) =>
        compareText(left.attemptId ?? '', right.attemptId ?? '') ||
        compareText(left.file, right.file),
      ),
    _dedupeMetrics: {
      exactRowsCollapsed,
      stableIdentityRowsCollapsed,
      explicitEntityKeyMerge,
    },
  }
}

function addSameOriginReviews(identityGroups) {
  const byOrigin = new Map()
  for (const identityGroup of identityGroups) {
    if (!identityGroup.canonicalUrl) continue
    const url = new URL(identityGroup.canonicalUrl)
    const reviewOrigin = SHARED_CODE_HOSTS.has(url.hostname)
      ? repositoryBase(identityGroup.canonicalUrl)
      : url.origin
    if (!reviewOrigin) continue
    const records = byOrigin.get(reviewOrigin) ?? []
    records.push(identityGroup)
    byOrigin.set(reviewOrigin, records)
  }

  const reviewClusters = []
  for (const [origin, records] of byOrigin) {
    const distinctPaths = new Set(
      records.map(({ canonicalUrl }) => new URL(canonicalUrl).pathname),
    )
    if (records.length < 2 || distinctPaths.size < 2) continue

    for (const identityGroup of records) {
      if (identityGroup.status !== 'APPROVED') {
        identityGroup.reasonCodes = sortedUnique([
          ...identityGroup.reasonCodes,
          'ENTRY_SPLIT_REVIEW',
        ]).sort(reasonSort)
      }
    }
    reviewClusters.push({
      origin,
      identityGroupKeys: records
        .map(({ identityGroupKey }) => identityGroupKey)
        .sort(compareText),
      canonicalUrls: records
        .map(({ canonicalUrl }) => canonicalUrl)
        .sort(compareText),
    })
  }

  return reviewClusters.sort((left, right) => compareText(left.origin, right.origin))
}

function buildReasonQueues(identityGroups) {
  const result = {}
  for (const reason of REASON_ORDER) {
    const identityGroupKeys = identityGroups
      .filter(({ reasonCodes }) => reasonCodes.includes(reason))
      .map(({ identityGroupKey }) => identityGroupKey)
      .sort(compareText)
    if (identityGroupKeys.length > 0) result[reason] = identityGroupKeys
  }
  return result
}

function publicIdentityGroup(identityGroup) {
  const { _dedupeMetrics, ...record } = identityGroup
  return record
}

export function buildCurationQueue({
  candidateIndex,
  sourceCatalog = { entries: [] },
  approvedBundles = [],
  revision = 'curation-work-queue-v2',
}) {
  if (!candidateIndex || !Array.isArray(candidateIndex.entries)) {
    throw new TypeError('candidateIndex.entries must be an array')
  }
  if (!sourceCatalog || !Array.isArray(sourceCatalog.entries)) {
    throw new TypeError('sourceCatalog.entries must be an array')
  }
  if (!Array.isArray(approvedBundles)) {
    throw new TypeError('approvedBundles must be an array')
  }

  const sourceById = new Map(
    sourceCatalog.entries.map((entry) => [entry.id, entry]),
  )
  const nodes = []
  const quarantine = []

  for (const candidate of candidateIndex.entries) {
    const rawUrl = asNonEmptyString(candidate?.canonicalUrl) ?? ''
    const sourceEntry = sourceById.get(candidate?.id)
    const observations = observationsForCandidate(candidate, sourceEntry)
    let normalizedUrl
    try {
      normalizedUrl = normalizeIdentityUrl(rawUrl)
    } catch (error) {
      quarantine.push({
        candidateId: asNonEmptyString(candidate?.id) ?? 'unknown-candidate',
        name: asNonEmptyString(candidate?.name),
        rawUrl,
        reasonCode: isKnownMalformedUrl(rawUrl)
          ? 'MALFORMED_URL'
          : 'LINK_UNVERIFIABLE',
        detail: error instanceof Error ? error.message : 'Identity URL is invalid.',
        observations,
      })
      continue
    }

    const explicitEntityKey = asNonEmptyString(candidate?.entityKey)
    const stableRepository = stableRepositoryIdentity(normalizedUrl)
    const identityTokens = [
      `url:${normalizedUrl}`,
      explicitEntityKey ? `entity:${explicitEntityKey}` : null,
      stableRepository ? `repository:${stableRepository}` : null,
      asNonEmptyString(candidate?.repositoryId)
        ? `repository-id:${candidate.repositoryId.trim()}`
        : null,
      asNonEmptyString(candidate?.packageId)
        ? `package-id:${candidate.packageId.trim()}`
        : null,
    ]
    nodes.push({
      kind: 'candidate',
      candidate,
      sourceEntry,
      explicitEntityKey,
      normalizedUrls: [normalizedUrl],
      observations,
      identityTokens,
    })
  }

  for (let index = 0; index < approvedBundles.length; index += 1) {
    const { file, bundle } = unwrapApprovedBundle(approvedBundles[index], index)
    const gateErrors = evidenceBundleErrors(bundle)
    const explicitEntityKey = asNonEmptyString(bundle?.entityKey)
    const normalizedUrls = sortedUnique([
      normalizeOrNull(bundle?.official?.finalUrl),
      normalizeOrNull(bundle?.official?.inputUrl),
    ])
    nodes.push({
      kind: 'approved',
      bundle,
      file,
      gateErrors,
      explicitEntityKey,
      normalizedUrls,
      observations: [],
      identityTokens: [
        explicitEntityKey ? `entity:${explicitEntityKey}` : null,
        ...normalizedUrls.map((url) => `url:${url}`),
      ],
    })
  }

  const disjointSet = new DisjointSet(nodes.length)
  unionIdentityTokens(nodes, disjointSet)
  const groupedNodes = groupNodes(nodes, disjointSet)
  const internalIdentityGroups = groupedNodes.map(buildIdentityGroup)
  const sameOriginReviewClusters = addSameOriginReviews(internalIdentityGroups)
  internalIdentityGroups.sort((left, right) =>
    compareText(left.canonicalUrl ?? '', right.canonicalUrl ?? '') ||
    compareText(left.identityGroupKey, right.identityGroupKey),
  )

  const duplicateClusters = internalIdentityGroups
    .filter(({ candidateIds }) => candidateIds.length > 1)
    .map((identityGroup) => ({
      identityGroupKey: identityGroup.identityGroupKey,
      mergeKinds: [
        identityGroup._dedupeMetrics.exactRowsCollapsed > 0
          ? 'exact-normalized-identity-url'
          : null,
        identityGroup._dedupeMetrics.stableIdentityRowsCollapsed > 0
          ? 'stable-repository-or-package-id'
          : null,
        identityGroup._dedupeMetrics.explicitEntityKeyMerge
          ? 'explicit-entity-key'
          : null,
      ].filter(Boolean),
      canonicalUrls: identityGroup.normalizedUrls,
      candidateIds: identityGroup.candidateIds,
      observationCount: identityGroup.observations.length,
      exactRowsCollapsed: identityGroup._dedupeMetrics.exactRowsCollapsed,
      stableIdentityRowsCollapsed:
        identityGroup._dedupeMetrics.stableIdentityRowsCollapsed,
    }))
    .sort((left, right) =>
      compareText(left.identityGroupKey, right.identityGroupKey),
    )
  const exactDuplicateClusters = duplicateClusters.filter(
    ({ exactRowsCollapsed }) => exactRowsCollapsed > 0,
  )
  const stableIdentityClusters = duplicateClusters.filter(
    ({ stableIdentityRowsCollapsed }) => stableIdentityRowsCollapsed > 0,
  )
  const identityGroups = internalIdentityGroups.map(publicIdentityGroup)
  quarantine.sort((left, right) =>
    compareText(left.candidateId, right.candidateId) ||
    compareText(left.rawUrl, right.rawUrl),
  )
  const observationCount =
    identityGroups.reduce(
      (sum, identityGroup) => sum + identityGroup.observations.length,
      0,
    ) +
    quarantine.reduce((sum, record) => sum + record.observations.length, 0)

  return {
    schemaVersion: 2,
    revision,
    policy: {
      classificationNeutral: true,
      aiPriority: false,
      granularity: 'provisional-identity-groups',
      automaticMergeSignals: [
        'exact-normalized-identity-url',
        'explicit-entity-key',
        'stable-repository-or-package-id',
      ],
      sameOriginDifferentPath: 'ENTRY_SPLIT_REVIEW',
      approvalGate: 'curation-evidence-v2',
      ordering: 'canonicalUrl-then-identityGroupKey-codepoint',
    },
    summary: {
      inputCandidates: candidateIndex.entries.length,
      validCandidateRows: candidateIndex.entries.length - quarantine.length,
      provisionalIdentityGroups: identityGroups.length,
      duplicateClusters: duplicateClusters.length,
      duplicateRowsCollapsed: duplicateClusters.reduce(
        (sum, cluster) => sum + cluster.candidateIds.length - 1,
        0,
      ),
      exactDuplicateClusters: exactDuplicateClusters.length,
      exactDuplicateRowsCollapsed: exactDuplicateClusters.reduce(
        (sum, cluster) => sum + cluster.exactRowsCollapsed,
        0,
      ),
      stableIdentityClusters: stableIdentityClusters.length,
      stableIdentityRowsCollapsed: stableIdentityClusters.reduce(
        (sum, cluster) => sum + cluster.stableIdentityRowsCollapsed,
        0,
      ),
      sameOriginReviewClusters: sameOriginReviewClusters.length,
      quarantined: quarantine.length,
      malformedUrls: quarantine.filter(
        ({ reasonCode }) => reasonCode === 'MALFORMED_URL',
      ).length,
      approved: identityGroups.filter(({ status }) => status === 'APPROVED').length,
      needsReview: identityGroups.filter(({ status }) => status === 'NEEDS_REVIEW').length,
      observationsPreserved: observationCount,
    },
    identityGroups,
    duplicateClusters,
    sameOriginReviewClusters,
    quarantine,
    reasonQueues: buildReasonQueues(identityGroups),
  }
}

export function serializeCurationQueue(queue) {
  return `${JSON.stringify(queue, null, 2)}\n`
}
