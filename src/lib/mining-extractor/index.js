// 抽取器合流层：把 Tier 1（静态 CSS）与 Tier 2（渲染）的度量合成一份，并记录每个度量来自哪一层。
// 规格：docs/superpowers/specs/2026-09-02-routed-deep-mining-and-threshold-design.md
//
// 冲突规则：同名度量以渲染层为准——渲染出来的事实压过声明级统计——但分歧必须记下来，
// 因为「声明里写了一套、渲染出来是另一套」本身就是值得复核的信号，不该被静默吞掉。

import {
  FALSE,
  SIGNAL_TAG_IDS,
  TRUE,
  evaluateSignalTag,
} from '../../data/mining-signals.js'
import { cssMetricsFromAnalysis } from './css-metrics.js'
import { domMetricsFromProbe } from './dom-metrics.js'

export const EXTRACTOR_VERSION = 'mining-extractor-v1'

const TIER_PRECEDENCE = Object.freeze(['css', 'dom'])
const NUMERIC_TOLERANCE = 1e-9

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function differs(left, right) {
  if (typeof left === 'number' && typeof right === 'number') {
    return Math.abs(left - right) > NUMERIC_TOLERANCE
  }
  return left !== right
}

/**
 * 合并各层度量。tiers 形如 { css: {...}, dom: {...} }，按 TIER_PRECEDENCE 从低到高覆盖。
 */
export function mergeMetricTiers(tiers) {
  const metrics = {}
  const provenance = {}
  const conflicts = []
  if (!isPlainObject(tiers)) return { metrics, provenance, conflicts }

  for (const tier of TIER_PRECEDENCE) {
    const source = isPlainObject(tiers[tier]) ? tiers[tier] : null
    if (!source) continue
    for (const name of Object.keys(source)) {
      const value = source[name]
      if (value === undefined) continue
      if (Object.hasOwn(metrics, name) && differs(metrics[name], value)) {
        conflicts.push({
          metric: name,
          [provenance[name]]: metrics[name],
          [tier]: value,
          resolvedBy: tier,
        })
      }
      metrics[name] = value
      provenance[name] = tier
    }
  }

  return { metrics, provenance, conflicts }
}

/**
 * 每个标签落在三态之一：
 *   supported   实测成立
 *   refuted     度量齐全但条件不成立
 *   undecidable 缺度量，无法判定
 *
 * undecidable 不是「没有」。把它和 refuted 混为一谈，就等于让抽取失败伪装成风格判断。
 */
export function tagDecidability(metrics) {
  const source = isPlainObject(metrics) ? metrics : {}
  const supported = []
  const refuted = []
  const undecidable = []

  for (const tagId of SIGNAL_TAG_IDS) {
    const result = evaluateSignalTag(tagId, source)
    if (result.state === TRUE) {
      supported.push({ tag: tagId, evidence: result.evidence })
    } else if (result.state === FALSE) {
      // 三值求值：条件里已有一项确定为假就算证否，不必等缺失的度量补齐。
      refuted.push({ tag: tagId, evidence: result.evidence })
    } else {
      undecidable.push({ tag: tagId, missingMetrics: result.missingMetrics })
    }
  }

  return { supported, refuted, undecidable }
}

/**
 * 一次抽取的完整结果。
 * cssAnalysis 缺席时只跑渲染层；probe 缺席时只跑 CSS 层——两层都是可选的，
 * 但缺席会直接反映为 undecidable 标签变多，不会被伪装成「这个站就是没这些特征」。
 */
export function extractMetrics({ cssAnalysis = null, probe = null } = {}) {
  const notes = []
  const tiers = {}

  if (cssAnalysis !== null) {
    const css = cssMetricsFromAnalysis(cssAnalysis)
    tiers.css = css.metrics
    for (const note of css.notes) notes.push(`css: ${note}`)
  }
  if (probe !== null) {
    const dom = domMetricsFromProbe(probe)
    tiers.dom = dom.metrics
    for (const note of dom.notes) notes.push(`dom: ${note}`)
  }

  const { metrics, provenance, conflicts } = mergeMetricTiers(tiers)
  const decidability = tagDecidability(metrics)

  return {
    extractorVersion: EXTRACTOR_VERSION,
    tiersRun: Object.keys(tiers),
    metrics,
    provenance,
    conflicts,
    signalTags: decidability.supported,
    refutedTags: decidability.refuted.map((entry) => entry.tag),
    undecidableTags: decidability.undecidable,
    notes,
  }
}
