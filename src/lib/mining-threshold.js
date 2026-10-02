// 分流深挖流水线 v1：三层阈值门 + 批次断路器。纯函数，无 IO。
// 规格：docs/superpowers/specs/2026-09-02-routed-deep-mining-and-threshold-design.md
//
// 阈值不是给站点打分。它是三组布尔条件（硬否决 / 必答完备 / 一致性），
// 加上一组批次级健康度断路器——后者才是「人工设定的阈值」的真正落点：
// 防止门禁整体失灵之后全量放行。

import {
  MINING_BATCH_BREAKERS,
  MINING_THRESHOLD_VERSION,
  R2_REQUIRED_SHOT_COUNT,
  SIGNAL_TAG_IDS,
  STYLE_DOSSIER_MINIMUMS,
  STYLE_DOSSIER_REQUIRED_BLOCKS,
  evaluateSignalTags,
  miningRoute,
} from '../data/mining-signals.js'
import { CURATION_CATEGORIES } from '../data/curation-taxonomy.js'
import { FORBIDDEN_DESCRIPTION_PHRASES } from './curation-evidence.js'

export const MINED_STATUS = Object.freeze({
  CONFIRMED: 'MINED_CONFIRMED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  EXCLUDED: 'EXCLUDED',
})

const CATEGORY_IDS = new Set(CURATION_CATEGORIES.map((category) => category.id))
const SIGNAL_TAG_ID_SET = new Set(SIGNAL_TAG_IDS)
const MAX_LITERAL_OVERLAP = 0.6
const MIN_MAIN_TEXT_LENGTH = 200
const MIN_CONTENT_IMAGES = 3
const MIN_TIMEOUT_PROBES_FOR_VETO = 3
const MAX_ERROR_PAGE_ELEMENTS = 60
const RESTRICTIVE_LICENSE_CLAUSES = new Set([
  'commons-clause',
  'no-resale',
  'no-compete',
])

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function readObject(source, key) {
  if (!isPlainObject(source) || !Object.hasOwn(source, key)) return null
  const value = source[key]
  return isPlainObject(value) ? value : null
}

function readArray(source, key) {
  if (!isPlainObject(source) || !Object.hasOwn(source, key)) return []
  const value = source[key]
  return Array.isArray(value) ? value : []
}

function readValue(source, key) {
  if (!isPlainObject(source) || !Object.hasOwn(source, key)) return undefined
  return source[key]
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function countOf(value) {
  if (Array.isArray(value)) return value.length
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (isPlainObject(value)) return Object.keys(value).length
  return 0
}

/* -------------------------------------------------------------------------- */
/* 第一层：硬否决                                                              */
/* -------------------------------------------------------------------------- */

/**
 * 任一命中即 EXCLUDED。单次网络失败不构成否决。
 * 与设计无关必须两个通道同时否定，单通道说不相关不算。
 */
export function vetoReasons(record) {
  const reasons = []
  if (!isPlainObject(record)) return ['record must be a plain object']

  const fetchInfo = readObject(record, 'fetch')
  const status = readValue(fetchInfo, 'finalStatus')
  if (typeof status === 'number' && Number.isFinite(status) && status >= 400) {
    reasons.push(`final URL returned ${status}`)
  }
  const timeoutProbes = readValue(fetchInfo, 'timeoutProbes')
  if (
    typeof timeoutProbes === 'number' &&
    timeoutProbes >= MIN_TIMEOUT_PROBES_FOR_VETO
  ) {
    reasons.push(`timed out on ${timeoutProbes} separate probes`)
  }

  if (readValue(readObject(record, 'robots'), 'disallowed') === true) {
    reasons.push('robots.txt disallows crawling this path')
  }

  const page = readObject(record, 'page')
  const mainTextLength = readValue(page, 'mainTextLength')
  const canvasCount = countOf(readValue(page, 'canvasCount'))
  const contentImageCount = countOf(readValue(page, 'contentImageCount'))
  if (
    typeof mainTextLength === 'number' &&
    mainTextLength < MIN_MAIN_TEXT_LENGTH &&
    canvasCount === 0 &&
    contentImageCount < MIN_CONTENT_IMAGES
  ) {
    reasons.push('rendered shell has no meaningful text, canvas, or imagery')
  }

  // 浏览器的网络错误页会保留原始 URL，因此只比对 origin 抓不出来。
  // 它的特征是：一个样式表都没加载，且 DOM 极小。真实站点几乎不可能同时满足这两条。
  const styleSheetCount = readValue(page, 'styleSheetCount')
  const domElementCount = readValue(page, 'domElementCount')
  if (
    typeof styleSheetCount === 'number' && styleSheetCount === 0 &&
    typeof domElementCount === 'number' && domElementCount < MAX_ERROR_PAGE_ELEMENTS
  ) {
    reasons.push(
      `rendered page loaded no stylesheet and only ${domElementCount} elements — browser error page, not the site`,
    )
  }

  const flags = readObject(record, 'flags')
  if (readValue(flags, 'parkedDomain') === true) {
    reasons.push('domain parking or for-sale placeholder detected')
  }
  const prohibited = readArray(flags, 'prohibitedContent').filter(isNonEmptyString)
  if (prohibited.length > 0) {
    reasons.push(`prohibited content: ${prohibited.join(', ')}`)
  }

  const routeSignals = readObject(record, 'routeSignals')
  const channelA = readArray(routeSignals, 'channelA').filter(isNonEmptyString)
  const channelBRelevant = readValue(routeSignals, 'channelBDesignRelevant')
  if (channelA.length === 0 && channelBRelevant === false) {
    reasons.push('both channels judged the site unrelated to design work')
  }

  return reasons
}

/* -------------------------------------------------------------------------- */
/* 第二层：必答完备                                                            */
/* -------------------------------------------------------------------------- */

function probeMap(record) {
  const map = new Map()
  for (const probe of readArray(record, 'probes')) {
    if (!isPlainObject(probe)) continue
    const key = readValue(probe, 'key')
    if (!isNonEmptyString(key) || map.has(key)) continue
    map.set(key, probe)
  }
  return map
}

function styleDossierErrors(dossier) {
  const errors = []
  if (!isPlainObject(dossier)) return ['styleDossier is required for route R2']
  for (const block of STYLE_DOSSIER_REQUIRED_BLOCKS) {
    if (!Object.hasOwn(dossier, block)) {
      errors.push(`styleDossier.${block} is missing`)
      continue
    }
    const minimum = STYLE_DOSSIER_MINIMUMS[block]
    if (minimum === undefined) {
      if (!isPlainObject(dossier[block]) && !Array.isArray(dossier[block])) {
        errors.push(`styleDossier.${block} must be an object or array`)
      }
      continue
    }
    const size = countOf(dossier[block])
    if (size < minimum) {
      errors.push(`styleDossier.${block} needs at least ${minimum} entries, got ${size}`)
    }
  }

  const colors = readValue(dossier, 'colors')
  if (Array.isArray(colors)) {
    for (let index = 0; index < colors.length; index += 1) {
      const color = colors[index]
      if (!isPlainObject(color) || !isNonEmptyString(readValue(color, 'role'))) {
        errors.push(`styleDossier.colors[${index}] needs a measured role`)
      }
    }
  }
  return errors
}

/**
 * 缺证据不等于没价值：完备性失败一律进 NEEDS_REVIEW，从不进 EXCLUDED。
 */
export function completenessErrors(record) {
  const errors = []
  if (!isPlainObject(record)) return ['record must be a plain object']

  const routeId = readValue(record, 'route')
  const route = isNonEmptyString(routeId) ? miningRoute(routeId) : null
  if (!route) return [`unknown mining route: ${String(routeId)}`]

  const probes = probeMap(record)
  for (const key of route.requiredProbes) {
    const probe = probes.get(key)
    if (!probe) {
      errors.push(`missing required probe: ${key}`)
      continue
    }
    if (readValue(probe, 'value') === undefined || readValue(probe, 'value') === null) {
      errors.push(`probe ${key} has no value`)
    }
    if (!isNonEmptyString(readValue(probe, 'evidenceUrl'))) {
      errors.push(`probe ${key} has no evidenceUrl`)
    } else if (readValue(probe, 'evidenceReachable') !== true) {
      errors.push(`probe ${key} evidenceUrl was not reachable`)
    }
  }

  if (route.id === 'R2') {
    for (const error of styleDossierErrors(readValue(record, 'styleDossier'))) {
      errors.push(error)
    }
    const shots = readArray(record, 'shots')
    const passing = shots.filter((shot) => (
      isPlainObject(shot) && readValue(shot, 'qaPassed') === true
    ))
    if (passing.length !== R2_REQUIRED_SHOT_COUNT) {
      errors.push(
        `route R2 needs exactly ${R2_REQUIRED_SHOT_COUNT} QA-passing shots, got ${passing.length}`,
      )
    }
  }

  return errors
}

/* -------------------------------------------------------------------------- */
/* 第三层：一致性                                                              */
/* -------------------------------------------------------------------------- */

function accessLicenseErrors(record) {
  const errors = []
  const facets = readObject(record, 'facets')
  const access = readArray(facets, 'access').filter(isNonEmptyString)
  const licenses = readArray(facets, 'licenses').filter(isNonEmptyString)
  const rights = readObject(record, 'rights')
  const clauses = readArray(rights, 'restrictiveClauses')
    .filter(isNonEmptyString)
    .map((clause) => clause.trim().toLowerCase())
  const hasRestrictiveClause = clauses.some((clause) => RESTRICTIVE_LICENSE_CLAUSES.has(clause))

  const claimsOpenSource = access.includes('open-source')
  const claimsSourceAvailable = access.includes('source-available')

  if (claimsOpenSource && claimsSourceAvailable) {
    errors.push('access cannot claim open-source and source-available at once')
  }
  if (claimsOpenSource) {
    const resolved = licenses.filter((license) => license !== 'unknown')
    if (resolved.length === 0) {
      errors.push('open-source claim requires a resolved SPDX license')
    }
    if (readValue(rights, 'repositoryReachable') !== true) {
      errors.push('open-source claim requires a reachable repository')
    }
    if (hasRestrictiveClause) {
      errors.push('restrictive clause present: must be source-available, not open-source')
    }
  }
  if (hasRestrictiveClause && !claimsSourceAvailable && !claimsOpenSource) {
    errors.push('restrictive clause present but access does not record source-available')
  }
  return errors
}

/**
 * 通道 A 与通道 B 必须一致，不做加权平均，不折中。
 * 模型提名但实测不成立的标签一律使该记录降级。
 */
export function consistencyErrors(record) {
  const errors = []
  if (!isPlainObject(record)) return ['record must be a plain object']

  const routeId = readValue(record, 'route')
  const route = isNonEmptyString(routeId) ? miningRoute(routeId) : null
  if (!route) return [`unknown mining route: ${String(routeId)}`]

  const routeSignals = readObject(record, 'routeSignals')
  const channelA = readArray(routeSignals, 'channelA').filter(isNonEmptyString)
  const channelB = readValue(routeSignals, 'channelB')
  if (channelA.length === 0) {
    errors.push('channel A produced no strong route signal')
  } else if (!channelA.includes(route.id)) {
    errors.push(`channel A strong routes ${channelA.join('/')} do not include ${route.id}`)
  }
  if (channelB !== route.id) {
    errors.push(`channel B route ${String(channelB)} disagrees with ${route.id}`)
  }

  const classification = readObject(record, 'classification')
  const primaryCategory = readValue(classification, 'primaryCategory')
  if (!isNonEmptyString(primaryCategory) || !CATEGORY_IDS.has(primaryCategory)) {
    errors.push(`unknown primary category: ${String(primaryCategory)}`)
  } else if (!route.allowedCategories.includes(primaryCategory)) {
    errors.push(`primary category ${primaryCategory} is not allowed on route ${route.id}`)
  }
  if (readValue(classification, 'status') !== 'machine-confirmed') {
    errors.push('mined records must use classification.status "machine-confirmed"')
  }

  const metrics = readObject(record, 'metrics') ?? {}
  const claimed = readArray(record, 'claimedSignalTags')
  const tagResult = evaluateSignalTags(metrics, claimed)
  for (const tagId of tagResult.unknownTagClaims) {
    errors.push(`unknown signal tag claimed: ${tagId}`)
  }
  for (const tagId of tagResult.unsupportedTagClaims) {
    errors.push(`signal tag ${tagId} has no measured support`)
  }
  for (const entry of readArray(record, 'signalTags')) {
    const tagId = isPlainObject(entry) ? readValue(entry, 'tag') : entry
    if (!isNonEmptyString(tagId) || !SIGNAL_TAG_ID_SET.has(tagId)) {
      errors.push(`unknown signal tag stored: ${String(tagId)}`)
    }
  }

  for (const error of accessLicenseErrors(record)) errors.push(error)

  const subject = readValue(record, 'collectionSubject')
  if (subject !== null && subject !== undefined) {
    if (!isPlainObject(subject)) {
      errors.push('collectionSubject must be a plain object or null')
    } else {
      const ofCategory = readValue(subject, 'ofCategory')
      if (!isNonEmptyString(ofCategory) || !CATEGORY_IDS.has(ofCategory)) {
        errors.push(`collectionSubject.ofCategory is not a known category: ${String(ofCategory)}`)
      } else if (ofCategory === primaryCategory) {
        errors.push('collectionSubject.ofCategory must differ from the record primary category')
      }
      if (!isNonEmptyString(readValue(subject, 'evidenceUrl'))) {
        errors.push('collectionSubject requires an evidenceUrl')
      }
    }
  }

  const language = readObject(record, 'language')
  const declared = readValue(language, 'declared')
  const measured = readValue(language, 'measured')
  if (isNonEmptyString(declared) && isNonEmptyString(measured) && declared !== measured) {
    errors.push(`declared language ${declared} disagrees with measured ${measured}`)
  }

  const editorial = readObject(record, 'editorial')
  const description = readValue(editorial, 'description')
  if (isNonEmptyString(description)) {
    for (const phrase of FORBIDDEN_DESCRIPTION_PHRASES) {
      if (description.includes(phrase)) {
        errors.push(`description contains forbidden phrase: ${phrase}`)
      }
    }
  }
  const overlap = readValue(editorial, 'literalOverlapWithSource')
  if (typeof overlap === 'number' && overlap >= MAX_LITERAL_OVERLAP) {
    errors.push(`description literal overlap with source is ${overlap}, must stay under ${MAX_LITERAL_OVERLAP}`)
  }

  return errors
}

/* -------------------------------------------------------------------------- */
/* 组合门                                                                      */
/* -------------------------------------------------------------------------- */

export function evaluateMinedRecord(record) {
  const veto = vetoReasons(record)
  if (veto.length > 0) {
    return {
      status: MINED_STATUS.EXCLUDED,
      veto,
      completeness: [],
      consistency: [],
      thresholdVersion: MINING_THRESHOLD_VERSION,
    }
  }
  const completeness = completenessErrors(record)
  const consistency = consistencyErrors(record)
  const status = completeness.length === 0 && consistency.length === 0
    ? MINED_STATUS.CONFIRMED
    : MINED_STATUS.NEEDS_REVIEW
  return {
    status,
    veto,
    completeness,
    consistency,
    thresholdVersion: MINING_THRESHOLD_VERSION,
  }
}

/* -------------------------------------------------------------------------- */
/* 批次断路器                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * 自动化最大的失效模式不是单站判错，是门禁整体失灵后全量放行。
 * 任一断路器触发 → 整批不写入，全部落 NEEDS_REVIEW，人工抽样后再决定。
 */
export function evaluateMinedBatch(results, options = {}) {
  const rows = Array.isArray(results) ? results : []
  const breakers = MINING_BATCH_BREAKERS
  const total = rows.length
  const tripped = []

  const counts = { total, confirmed: 0, needsReview: 0, excluded: 0 }
  const routeCounts = new Map()
  const tagCounts = new Map()
  let taggedTotal = 0

  for (const row of rows) {
    if (!isPlainObject(row)) continue
    const status = readValue(row, 'status')
    if (status === MINED_STATUS.CONFIRMED) counts.confirmed += 1
    else if (status === MINED_STATUS.EXCLUDED) counts.excluded += 1
    else counts.needsReview += 1

    const routeId = readValue(row, 'route')
    if (isNonEmptyString(routeId)) {
      routeCounts.set(routeId, (routeCounts.get(routeId) ?? 0) + 1)
    }
    const tags = readArray(row, 'signalTags')
    taggedTotal += tags.length
    const seen = new Set()
    for (const entry of tags) {
      const tagId = isPlainObject(entry) ? readValue(entry, 'tag') : entry
      if (!isNonEmptyString(tagId) || seen.has(tagId)) continue
      seen.add(tagId)
      tagCounts.set(tagId, (tagCounts.get(tagId) ?? 0) + 1)
    }
  }

  if (total === 0) {
    return {
      released: false,
      counts,
      confirmedShare: 0,
      averageTagsPerRecord: 0,
      routeShares: {},
      tagHitRates: {},
      trippedBreakers: ['empty batch'],
      manualSampleSize: breakers.manualSampleSize,
      thresholdVersion: MINING_THRESHOLD_VERSION,
    }
  }

  const confirmedShare = counts.confirmed / total
  const averageTagsPerRecord = taggedTotal / total
  const routeShares = {}
  for (const [routeId, count] of routeCounts) routeShares[routeId] = count / total
  const tagHitRates = {}
  for (const [tagId, count] of tagCounts) tagHitRates[tagId] = count / total

  if (confirmedShare > breakers.maxConfirmedShare) {
    tripped.push(`confirmed share ${confirmedShare.toFixed(3)} exceeds ${breakers.maxConfirmedShare}`)
  }
  if (confirmedShare < breakers.minConfirmedShare) {
    tripped.push(`confirmed share ${confirmedShare.toFixed(3)} below ${breakers.minConfirmedShare}`)
  }
  for (const [routeId, share] of Object.entries(routeShares)) {
    if (share > breakers.maxRouteShare) {
      tripped.push(`route ${routeId} share ${share.toFixed(3)} exceeds ${breakers.maxRouteShare}`)
    }
  }
  for (const [tagId, rate] of Object.entries(tagHitRates)) {
    if (rate > breakers.maxSingleTagHitRate) {
      tripped.push(`signal tag ${tagId} hit rate ${rate.toFixed(3)} exceeds ${breakers.maxSingleTagHitRate}`)
    }
  }
  if (averageTagsPerRecord < breakers.minAverageTagsPerRecord) {
    tripped.push(
      `average tags per record ${averageTagsPerRecord.toFixed(2)} below ${breakers.minAverageTagsPerRecord}`,
    )
  }

  const routineErrorRate = readValue(options, 'routineErrorRate')
  if (
    typeof routineErrorRate === 'number' &&
    routineErrorRate > breakers.maxRoutineErrorRate
  ) {
    tripped.push(
      `routine sample error rate ${routineErrorRate} exceeds ${breakers.maxRoutineErrorRate}`,
    )
  }

  return {
    released: tripped.length === 0,
    counts,
    confirmedShare,
    averageTagsPerRecord,
    routeShares,
    tagHitRates,
    trippedBreakers: tripped,
    manualSampleSize: breakers.manualSampleSize,
    thresholdVersion: MINING_THRESHOLD_VERSION,
  }
}
