export const PUBLIC_RELEASE_SCHEMA = 'vislexicon.public-release.v1'

export const FORBIDDEN_PUBLIC_KEYS = Object.freeze([
  'attemptId',
  'curatorId',
  'reviewerId',
  'qa',
])

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
)

const requireString = (value, path) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${path} must be a non-empty string`)
  }
  return value
}

const requireObject = (value, path) => {
  if (!isPlainObject(value)) throw new Error(`${path} must be an object`)
  return value
}

const requireSchemaVersion = (value, path) => {
  const validNumber = typeof value === 'number' && Number.isSafeInteger(value) && value > 0
  const validString = typeof value === 'string' && value.trim() !== ''
  if (!validNumber && !validString) throw new Error(`${path} must be a positive number or non-empty string`)
  return value
}

const requireApprovedItem = (item, path) => {
  const record = requireObject(item, path)
  requireString(record.entryId, `${path}.entryId`)
  requireString(record.releaseId, `${path}.releaseId`)
  requireString(record.revision, `${path}.revision`)
  if (record.status !== 'APPROVED') throw new Error(`${path}.status must be APPROVED`)
  return record
}

export function assertNoInternalKeys(value, path = '$', ancestors = new WeakSet()) {
  if (value === null || typeof value !== 'object') return value
  if (ancestors.has(value)) throw new Error(`${path} must not contain a cycle`)
  ancestors.add(value)
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoInternalKeys(item, `${path}[${index}]`, ancestors))
  } else {
    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_PUBLIC_KEYS.includes(key)) throw new Error(`${path}.${key} is forbidden in public output`)
      assertNoInternalKeys(child, `${path}.${key}`, ancestors)
    }
  }
  ancestors.delete(value)
  return value
}

export function assertReleaseManifest(value) {
  const release = requireObject(value, '$')
  requireString(release.schema, '$.schema')
  if (release.schema !== PUBLIC_RELEASE_SCHEMA) throw new Error('$.schema is not the supported public release schema')
  requireString(release.releaseId, '$.releaseId')
  requireSchemaVersion(release.schemaVersion, '$.schemaVersion')
  requireString(release.generatedAt, '$.generatedAt')
  requireString(release.sourceDigest, '$.sourceDigest')
  requireObject(release.counts, '$.counts')
  if (!Number.isInteger(release.counts.approvedEntries) || release.counts.approvedEntries < 0) {
    throw new Error('$.counts.approvedEntries must be a non-negative integer')
  }
  if (!Number.isInteger(release.counts.quarantinedEntries) || release.counts.quarantinedEntries < 0) {
    throw new Error('$.counts.quarantinedEntries must be a non-negative integer')
  }
  if (!Array.isArray(release.quarantined)) throw new Error('$.quarantined must be an array')
  release.quarantined.forEach((item, index) => {
    const candidate = requireObject(item, `$.quarantined[${index}]`)
    requireString(candidate.entryId, `$.quarantined[${index}].entryId`)
    requireString(candidate.status, `$.quarantined[${index}].status`)
    if (candidate.status === 'APPROVED') throw new Error(`$.quarantined[${index}] cannot be APPROVED`)
  })
  requireObject(release.endpoints, '$.endpoints')
  for (const key of ['siteIndex', 'registry', 'llms']) requireString(release.endpoints[key], `$.endpoints.${key}`)
  assertNoInternalKeys(release)
  return release
}

export function assertPublicIndex(value) {
  const index = requireObject(value, '$')
  requireString(index.releaseId, '$.releaseId')
  requireSchemaVersion(index.schemaVersion, '$.schemaVersion')
  requireString(index.generatedAt, '$.generatedAt')
  if (!Array.isArray(index.items)) throw new Error('$.items must be an array')
  index.items.forEach((item, indexValue) => requireApprovedItem(item, `$.items[${indexValue}]`))
  assertNoInternalKeys(index)
  return index
}

export function assertPublicDetail(value) {
  const detail = requireObject(value, '$')
  requireString(detail.entryId, '$.entryId')
  requireString(detail.releaseId, '$.releaseId')
  requireString(detail.revision, '$.revision')
  if (detail.status !== 'APPROVED') throw new Error('$.status must be APPROVED')
  assertNoInternalKeys(detail)
  return detail
}

export function assertRegistry(value) {
  const registry = requireObject(value, '$')
  requireString(registry.releaseId, '$.releaseId')
  requireSchemaVersion(registry.schemaVersion, '$.schemaVersion')
  requireString(registry.generatedAt, '$.generatedAt')
  if (!Array.isArray(registry.items)) throw new Error('$.items must be an array')
  registry.items.forEach((item, indexValue) => requireApprovedItem(item, `$.items[${indexValue}]`))
  assertNoInternalKeys(registry)
  return registry
}

export function publicEndpoint(release, path) {
  assertReleaseManifest(release)
  const cleanPath = String(path || '').replace(/^\/+/, '')
  if (!cleanPath) throw new Error('path must be non-empty')
  return `/${cleanPath}`
}

/* 隔离候选的泄漏判据。
 *
 * 旧实现在 validate 脚本里对每个公开文件做整文件子串扫描
 * （`text.includes(candidateId)`），被真实数据点着：隔离 id `layercake`
 * 是已发布条目 `layercake-graphics`（域名 layercake.graphics）的子串，
 * 于是整个发布校验恒失败。而「这串字母出现过」并不是泄漏。
 *
 * 泄漏的定义是「隔离条目作为一个条目出现在公开产物里」，所以按身份判：
 *   - 它的 entryId 出现在索引或 registry 里
 *   - 它的入口端点文件存在（data/site、r、site 三处）
 *   - 文本以完整端点引用了它（`/r/<id>.json`、`/site/<id>.md`）
 *
 * 端点正则只认「id 紧跟 .json/.md/.png/.jpg」，且左侧不能是 slug 字符，
 * 因此 `layercake-graphics.json` 与 `layercake.graphics` 都不会命中，
 * 而 `/r/layercake.json` 会。 */
export function quarantinedEndpointPattern(entryId) {
  if (typeof entryId !== 'string' || entryId === '') {
    throw new Error('entryId must be a non-empty string')
  }
  const escaped = entryId.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  return new RegExp(`(?<![A-Za-z0-9.-])${escaped}\\.(?:json|md|png|jpg)(?![A-Za-z0-9-])`, 'u')
}

const QUARANTINE_ARTIFACTS = [
  (id) => `data/site/${id}.json`,
  (id) => `r/${id}.json`,
  (id) => `site/${id}.md`,
]

export function quarantineArtifactsFor(entryId) {
  return QUARANTINE_ARTIFACTS.map((build) => build(entryId))
}

export function findPublishedQuarantineLeaks(quarantined, items) {
  const ids = new Set((quarantined || []).map((candidate) => candidate.entryId))
  const seen = new Set()
  for (const item of items || []) {
    if (ids.has(item?.entryId)) seen.add(item.entryId)
  }
  return [...seen]
}
