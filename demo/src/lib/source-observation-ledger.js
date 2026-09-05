import { createHash } from 'node:crypto'
import { types } from 'node:util'

const canonicalObservations = new WeakSet()

function fail(path, message) {
  throw new TypeError(`${path}: ${message}`)
}

function snapshotJson(value, path = '$', ancestors = new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail(path, 'number must be finite')
    return value
  }
  if (typeof value !== 'object') fail(path, `unsupported ${typeof value} value`)
  if (types.isProxy(value)) fail(path, 'proxy values are not allowed')
  if (ancestors.has(value)) fail(path, 'cyclic values are not allowed')

  const isArray = Array.isArray(value)
  const prototype = Object.getPrototypeOf(value)
  if (isArray ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) {
    fail(path, 'exotic prototypes are not allowed')
  }

  const descriptors = Object.getOwnPropertyDescriptors(value)
  const descriptorKeys = Reflect.ownKeys(descriptors)
  if (descriptorKeys.some((key) => typeof key === 'symbol')) fail(path, 'symbol keys are not allowed')
  if (descriptorKeys.includes('__proto__')) fail(path, '__proto__ keys are not allowed')
  for (const key of descriptorKeys) {
    const descriptor = descriptors[key]
    if ('get' in descriptor || 'set' in descriptor) fail(`${path}.${String(key)}`, 'accessors are not allowed')
  }

  ancestors.add(value)
  try {
    if (isArray) {
      const lengthDescriptor = descriptors.length
      const length = lengthDescriptor?.value
      if (!Number.isSafeInteger(length) || length < 0) fail(path, 'array length must be a safe integer')
      const itemKeys = descriptorKeys.filter((key) => key !== 'length')
      if (itemKeys.length !== length) fail(path, 'sparse arrays and custom array properties are not allowed')
      const result = new Array(length)
      for (let index = 0; index < length; index += 1) {
        const key = String(index)
        const descriptor = descriptors[key]
        if (!descriptor?.enumerable) fail(`${path}[${index}]`, 'dense enumerable array item is required')
        result[index] = snapshotJson(descriptor.value, `${path}[${index}]`, ancestors)
      }
      return result
    }

    const result = {}
    for (const key of descriptorKeys.sort()) {
      const descriptor = descriptors[key]
      if (!descriptor.enumerable) fail(`${path}.${key}`, 'non-enumerable properties are not allowed')
      Object.defineProperty(result, key, {
        value: snapshotJson(descriptor.value, `${path}.${key}`, ancestors),
        enumerable: true,
        writable: true,
        configurable: true,
      })
    }
    return result
  } finally {
    ancestors.delete(value)
  }
}

export function stableStringify(value) {
  return JSON.stringify(snapshotJson(value))
}

function sha256(snapshot) {
  return createHash('sha256').update(JSON.stringify(snapshot)).digest('hex')
}

function deepFreezeSnapshot(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  const descriptors = Object.getOwnPropertyDescriptors(value)
  for (const key of Reflect.ownKeys(descriptors)) deepFreezeSnapshot(descriptors[key].value)
  return Object.freeze(value)
}

function nonEmptyString(value, path) {
  if (typeof value !== 'string' || value.trim() === '') fail(path, 'must be a non-empty string')
}

function canonicalIso(value, path) {
  nonEmptyString(value, path)
  let normalized
  try {
    normalized = new Date(value).toISOString()
  } catch {
    fail(path, 'must be a canonical ISO timestamp')
  }
  if (normalized !== value) fail(path, 'must be a canonical ISO timestamp')
}

function nonNegativeSafeInteger(value, path) {
  if (!Number.isSafeInteger(value) || value < 0) fail(path, 'must be a non-negative safe integer')
}

function observationFromSnapshot(snapshot) {
  nonEmptyString(snapshot.sourceId, '$.sourceId')
  canonicalIso(snapshot.observedAt, '$.observedAt')
  if (!snapshot.request || typeof snapshot.request !== 'object' || Array.isArray(snapshot.request)) {
    fail('$.request', 'must be a plain object')
  }
  nonEmptyString(snapshot.request.requestId, '$.request.requestId')
  nonNegativeSafeInteger(snapshot.ordinal, '$.ordinal')
  if (!snapshot.raw || typeof snapshot.raw !== 'object' || Array.isArray(snapshot.raw)) {
    fail('$.raw', 'must be a plain object')
  }
  if (!snapshot.disposition || typeof snapshot.disposition !== 'object') {
    fail('$.disposition', 'must be a plain object')
  }
  if (!['accepted', 'rejected'].includes(snapshot.disposition.status)) {
    fail('$.disposition.status', 'must be accepted or rejected')
  }
  nonEmptyString(snapshot.disposition.reason, '$.disposition.reason')

  const body = { ...snapshot }
  delete body.observationId
  const observation = deepFreezeSnapshot({ observationId: `obs-${sha256(body)}`, ...body })
  canonicalObservations.add(observation)
  return observation
}

export function createSourceObservation(input) {
  return observationFromSnapshot(snapshotJson(input))
}

export function createRequestFailure(input) {
  const snapshot = snapshotJson(input)
  nonEmptyString(snapshot.sourceId, '$.sourceId')
  nonEmptyString(snapshot.requestId, '$.requestId')
  nonEmptyString(snapshot.message, '$.message')
  const body = { ...snapshot }
  delete body.failureId
  return deepFreezeSnapshot({ failureId: `failure-${sha256(body)}`, ...body })
}

export function summarizeRequests({ requestAttempts, successfulRequests, observations, failures }) {
  nonNegativeSafeInteger(requestAttempts, '$.requestAttempts')
  nonNegativeSafeInteger(successfulRequests, '$.successfulRequests')
  if (!Array.isArray(observations)) fail('$.observations', 'must be an array')
  if (!Array.isArray(failures)) fail('$.failures', 'must be an array')
  const failedRequests = failures.length
  const returnedRawHits = observations.length
  nonNegativeSafeInteger(failedRequests, '$.failedRequests')
  nonNegativeSafeInteger(returnedRawHits, '$.returnedRawHits')
  return Object.freeze({ requestAttempts, successfulRequests, failedRequests, returnedRawHits })
}

function countError(summary, key, errors) {
  if (!Number.isSafeInteger(summary[key]) || summary[key] < 0) {
    errors.push(`${key} (${summary[key]}) must be a non-negative safe integer`)
    return false
  }
  return true
}

export function validateCountConservation(input) {
  let payload
  try {
    payload = snapshotJson(input)
  } catch (error) {
    return [`unsafe count-conservation payload: ${error.message}`]
  }
  const observations = Array.isArray(payload.observations) ? payload.observations : []
  const hasRootFailures = Object.hasOwn(payload, 'failures')
  const hasSourceFailures = Object.hasOwn(payload.source ?? {}, 'failures')
  const rootFailures = hasRootFailures && Array.isArray(payload.failures) ? payload.failures : []
  const sourceFailures = hasSourceFailures && Array.isArray(payload.source.failures) ? payload.source.failures : []
  const failures = hasRootFailures ? rootFailures : sourceFailures
  const summary = payload.requestSummary ?? {}
  const errors = []

  if (hasRootFailures && hasSourceFailures && JSON.stringify(rootFailures) !== JSON.stringify(sourceFailures)) {
    errors.push('root failures and source.failures must contain identical failure records')
  }
  const attemptsValid = countError(summary, 'requestAttempts', errors)
  const successesValid = countError(summary, 'successfulRequests', errors)
  const failedValid = countError(summary, 'failedRequests', errors)
  const hitsValid = countError(summary, 'returnedRawHits', errors)
  if (hitsValid && summary.returnedRawHits !== observations.length) {
    errors.push(
      `returnedRawHits (${summary.returnedRawHits}) must equal observations.length (${observations.length})`,
    )
  }
  if (
    attemptsValid &&
    successesValid &&
    summary.requestAttempts !== summary.successfulRequests + failures.length
  ) {
    errors.push(
      `requestAttempts (${summary.requestAttempts}) must equal successfulRequests (${summary.successfulRequests}) + failures.length (${failures.length})`,
    )
  }
  if (failedValid && summary.failedRequests !== failures.length) {
    errors.push(`failedRequests (${summary.failedRequests}) must equal failures.length (${failures.length})`)
  }
  if ('rawRecordCount' in payload && payload.rawRecordCount !== observations.length) {
    errors.push(
      `rawRecordCount (${payload.rawRecordCount}) must equal observations.length (${observations.length})`,
    )
  }
  return errors
}

function trustedObservation(value) {
  if (canonicalObservations.has(value)) return value
  const snapshot = snapshotJson(value)
  const suppliedId = snapshot.observationId
  const observation = observationFromSnapshot(snapshot)
  if (suppliedId !== undefined && suppliedId !== observation.observationId) {
    fail('$.observationId', 'does not match observation content')
  }
  return observation
}

export function deriveSourceRecords(
  observations,
  { key = (observation) => observation.raw.originalUrl, project = (observation) => observation.raw, merge },
) {
  if (types.isProxy(observations)) fail('$.observations', 'proxy values are not allowed')
  if (!Array.isArray(observations)) fail('$.observations', 'must be an array')
  const descriptors = Object.getOwnPropertyDescriptors(observations)
  if (Reflect.ownKeys(descriptors).length !== observations.length + 1) {
    fail('$.observations', 'must be a dense array without custom properties')
  }
  const records = new Map()
  for (let index = 0; index < observations.length; index += 1) {
    const descriptor = descriptors[String(index)]
    if (!descriptor || 'get' in descriptor || 'set' in descriptor) {
      fail(`$.observations[${index}]`, 'must be a data property')
    }
    const observation = trustedObservation(descriptor.value)
    if (observation.disposition.status !== 'accepted') continue
    const next = snapshotJson(project(observation), `$.project[${index}]`)
    const recordKey = key(observation, next)
    if (recordKey === null || recordKey === undefined || recordKey === '') continue
    const existing = records.get(recordKey)
    records.set(
      recordKey,
      existing && merge ? snapshotJson(merge(existing, next, observation), '$.merge') : existing ?? next,
    )
  }
  return [...records.values()]
}
