#!/usr/bin/env node
/* ============ 公共数据投影（WP-A） ============
 * 输入：../content-samples/approved-v3/*.json（唯一真源，只投影 status=APPROVED）
 * 输出：
 *   public/data/site-index.json      前台列表/卡片层（12 轴 facets 完整保留）
 *   public/data/site/<entryId>.json  前台详情层（去掉内部过程字段）
 *   public/r/registry.json           Agent 索引端点（licenses/access/checkedAt 进索引）
 *   public/r/<entryId>.json          Agent 详情端点
 *   public/site/<entryId>.md         DESIGN.md（Google Labs 规范 + 出处三件套扩展）
 *   public/llms.txt                  端点清单
 *
 * 纪律（方案 §8）：
 *   1. 任何数量都由数据算出（口径统一走 src/lib/counts.js），不写死统计量。
 *   2. 内部过程字段（attemptId / curatorId / reviewerId / qa）绝不进公开产物。
 *   3. 找不到的值写 unknown / null，不猜。
 *   4. 幂等：每次运行先清空自己的输出目录，再整体重写。
 */

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { MANIFESTS } from '../src/stages/manifests.js'
import { FACET_AXES, siteWideCounts } from '../src/lib/counts.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FRONTEND = path.resolve(HERE, '..')
const SOURCE_DIR = path.resolve(FRONTEND, '../content-samples/approved-v3')
const PUBLIC_DIR = path.resolve(FRONTEND, 'public')
const ATLAS_FILE = path.resolve(FRONTEND, 'src/data/visual-atlas.json')
/* 候选池规模不在本仓库的语料里，只在样本包的自述字段中。取不到就是 null。 */
const SAMPLE_INFO_FILE = path.resolve(FRONTEND, 'src/data/site-catalog.json')

const OUT_SITE_INDEX = path.join(PUBLIC_DIR, 'data/site-index.json')
const OUT_SITE_DIR = path.join(PUBLIC_DIR, 'data/site')
const OUT_REGISTRY_DIR = path.join(PUBLIC_DIR, 'r')
const OUT_MD_DIR = path.join(PUBLIC_DIR, 'site')
const OUT_LLMS = path.join(PUBLIC_DIR, 'llms.txt')

/* 站点根地址。端点里的绝对 URL 由它拼出，部署到别的域名时用环境变量覆盖。 */
const ORIGIN = (process.env.VL_SITE_ORIGIN || 'https://vislexicon.com').replace(/\/+$/u, '')

const SCHEMA_REGISTRY = `${ORIGIN}/schema/registry.json`
const SCHEMA_REGISTRY_ITEM = `${ORIGIN}/schema/registry-item.json`

/* 公开产物中禁止出现的内部过程字段（方案 §6.2、research/02 §6.1）。 */
const FORBIDDEN_KEYS = ['attemptId', 'curatorId', 'reviewerId', 'qa']

/* 宽松许可：可机器判定、可再分发、需保留版权声明。
 * 不在这张表里的一律不推导为「可安全再分发」。 */
const PERMISSIVE_SPDX = new Set(['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'CC0-1.0'])

/* 复检间隔：Origin UI 一年内换域名 + 换归属 + 许可从 MIT 变成 MIT/AGPLv3 混合
 * （research/02 §6.3 第 3 条），所以给出的是一个机械策略，不是人工承诺。 */
/* v3 语料里「没查到定价」被写成一句英文元说明而不是值。它是过程记录，不是定价，
 * 投影层把它归一成 unknown，原句留在 pricingNote 里以便追溯（方案 §8 的诚实纪律）。 */
const PRICING_UNSTATED = /^\s*pricing not (?:stated|specified|available|disclosed|found)\b/iu

const RECHECK_POLICY = 'checkedAt + P180D'
const RECHECK_DAYS = 180
const MS_PER_DAY = 86400000

/* ---------- 小工具 ---------- */

const fail = (message) => {
  throw new Error(`[build-public-data] ${message}`)
}

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

function readJsonIfExists(file) {
  return fs.existsSync(file) ? readJson(file) : null
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function writeText(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, value, 'utf8')
}

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./u, '')
  } catch {
    return null
  }
}

function absoluteUrl(maybePath) {
  if (!isNonEmptyString(maybePath)) return null
  if (/^https?:\/\//u.test(maybePath)) return maybePath
  return `${ORIGIN}${maybePath.startsWith('/') ? '' : '/'}${maybePath}`
}

function pricingOf(bundle) {
  const raw = bundle.editorial?.pricing
  if (!isNonEmptyString(raw)) return { value: null, note: null }
  if (PRICING_UNSTATED.test(raw)) return { value: 'unknown', note: raw }
  return { value: raw, note: null }
}

function factOf(bundle, field) {
  return (bundle.facts || []).find((fact) => fact.field === field) || null
}

/* ---------- 图鉴术语：把 termId 解析成人能读的名字 ---------- */

/* termId → 图鉴里的英文正名。visual-atlas.json 是 674kB，前台不该为了三五个
 * 名字整份 import 它，所以在构建期就把名字投影进产物。 */
let ATLAS_TERM_EN = null
function atlasTermEn(termId) {
  if (!ATLAS_TERM_EN) {
    const atlas = readJsonIfExists(ATLAS_FILE)
    if (!atlas) fail(`找不到图鉴语料 ${ATLAS_FILE}，无法解析 curation.atlasTerms 的术语名`)
    ATLAS_TERM_EN = new Map((atlas.entries || []).map((entry) => [entry.id, entry.termEn]))
  }
  return ATLAS_TERM_EN.get(termId) ?? null
}

/* termId → 舞台清单里人工校订的中文名。语料自带的 termZh 是机器翻译
 * （"Skeleton"→"骷髅"），不能上界面，所以只认 claims[].termZhFix，没有就是 null。 */
let ATLAS_TERM_ZH_FIX = null
function atlasTermZh(termId) {
  if (!ATLAS_TERM_ZH_FIX) {
    ATLAS_TERM_ZH_FIX = new Map()
    for (const manifest of MANIFESTS) {
      for (const claim of manifest.claims || []) {
        if (isNonEmptyString(claim.termZhFix)) ATLAS_TERM_ZH_FIX.set(claim.termId, claim.termZhFix)
      }
    }
  }
  return ATLAS_TERM_ZH_FIX.get(termId) ?? null
}

/* 每条标注补上 termEn / termZh。termId 在图鉴里查不到就是数据错，构建期失败——
 * 前台没有别的名字可显示，落到界面上就是一串 id。 */
function atlasTermsOf(bundle) {
  return (bundle.curation?.atlasTerms ?? []).map((term) => {
    const termEn = atlasTermEn(term.termId)
    if (!isNonEmptyString(termEn)) {
      fail(`${bundle.entryId} 的 curation.atlasTerms 引用了图鉴里没有的 termId：${term.termId}`)
    }
    return { ...term, termEn, termZh: atlasTermZh(term.termId) }
  })
}

/* ---------- 入口校验：投影之前先证明源数据够用 ---------- */

function assertBundle(bundle, file) {
  const where = path.basename(file)
  if (bundle.status !== 'APPROVED') fail(`${where} 的 status 不是 APPROVED，不得进入公开产物`)
  if (!isNonEmptyString(bundle.entryId)) fail(`${where} 缺少 entryId`)
  if (!isNonEmptyString(bundle.editorial?.name)) fail(`${where} 缺少 editorial.name（方案 §4.2：不可缺）`)
  if (!isNonEmptyString(bundle.official?.checkedAt)) fail(`${where} 缺少 official.checkedAt（方案 §4.2：不可缺）`)
  if (!isNonEmptyString(bundle.official?.finalUrl)) fail(`${where} 缺少 official.finalUrl`)

  const pages = bundle.pages || []
  if (pages.length === 0) fail(`${where} 没有 pages[]`)
  pages.forEach((page, i) => {
    if (!isNonEmptyString(page.role)) fail(`${where} pages[${i}] 缺少 role`)
    if (!isNonEmptyString(page.selectionRationale)) fail(`${where} pages[${i}] 缺少 selectionRationale`)
    if (!isNonEmptyString(page.sourceUrl)) fail(`${where} pages[${i}] 缺少 sourceUrl`)
    if (!isNonEmptyString(page.shot?.src)) fail(`${where} pages[${i}] 缺少 shot.src`)
  })
  if (!pages.some((page) => page.role === 'identity')) fail(`${where} 没有 role=identity 的页面`)

  if ((bundle.facts || []).length === 0) fail(`${where} 没有 facts[]（这是差异化资产，不许空）`)
  if ((bundle.classification?.reasons || []).length === 0) {
    fail(`${where} 没有 classification.reasons[]`)
  }

  const facets = bundle.facets || {}
  const missing = FACET_AXES.filter((axis) => !Array.isArray(facets[axis]))
  if (missing.length) fail(`${where} 的 facets 缺少轴：${missing.join(' / ')}（12 轴结构必须完整）`)
}

/* ---------- 派生字段 ---------- */

/* 「有人独立复核过」只投影布尔，不投影 ID（方案 §4.6 ⑤）。 */
function independentlyReviewed(bundle) {
  const curator = bundle.classification?.curatorId
  const reviewer = bundle.classification?.reviewerId
  if (!isNonEmptyString(curator) || !isNonEmptyString(reviewer)) return false
  return curator !== reviewer
}

function licenseSummary(bundle) {
  const fact = factOf(bundle, 'license')
  const axis = bundle.facets?.licenses || []
  const spdxLike = axis.filter((value) => value !== 'unknown' && value !== 'custom')
  return {
    /* 卡片微标用 facets.licenses（短、可枚举）；详情与 md 用 facts 的原值（长、带证据）。 */
    value: fact?.value ?? null,
    axis,
    sourceUrl: fact?.sourceUrl ?? null,
    evidence: fact?.evidence ?? null,
    confidence: fact?.confidence ?? null,
    machineReadable: axis.length > 0 && spdxLike.length === axis.length
      && axis.every((value) => PERMISSIVE_SPDX.has(value) || /^[A-Za-z0-9.+-]+$/u.test(value)),
    permissive: axis.length > 0 && axis.every((value) => PERMISSIVE_SPDX.has(value)),
    unknown: axis.includes('unknown') || axis.length === 0,
  }
}

/* agentGuidance 全部由 facets / facts 机械推导，不做人工法务判断；
 * basis 把推导规则写进产物本身，免得下游把它当成结论。 */
function agentGuidanceOf(bundle) {
  const license = licenseSummary(bundle)
  const access = bundle.facets?.access || []
  const cautions = []

  if (license.unknown) {
    cautions.push('站点上未找到明确的许可声明，本条记录按 v3 规格记为 unknown；再分发或商用前必须自行确认。')
  } else if (!license.permissive) {
    const detail = license.evidence ? `${license.value}：${license.evidence}` : String(license.value)
    cautions.push(`许可不是通用宽松协议，逐条确认条款后再使用。${detail}`)
  }
  if (license.axis.length > 1) {
    cautions.push(`该条目登记了多个许可值（${license.axis.join(' / ')}），目录之间可能不同，逐目录确认。`)
  }
  if (access.includes('login-required')) cautions.push('部分内容需要登录后才能访问，抓取前先确认其服务条款。')
  if (access.includes('paid') || access.includes('freemium')) {
    const { value: pricing } = pricingOf(bundle)
    const stated = isNonEmptyString(pricing) && pricing !== 'unknown'
    cautions.push(`存在付费层${stated ? `：${pricing}` : ''}。`)
  }
  if (access.includes('closed-source')) cautions.push('源码不公开，站上展示的实现不可直接取用。')

  const checked = Date.parse(bundle.official.checkedAt)
  const recheckAfter = Number.isNaN(checked)
    ? null
    : new Date(checked + RECHECK_DAYS * MS_PER_DAY).toISOString().slice(0, 'YYYY-MM-DD'.length)

  return {
    safeToRedistributeCode: license.unknown ? null : license.permissive,
    requiresAttribution: license.unknown ? null : license.permissive,
    licenseMachineReadable: license.unknown ? false : license.machineReadable,
    cautions,
    recheckAfter,
    recheckPolicy: RECHECK_POLICY,
    basis: '由 facets.licenses、facets.access 与 facts[field=license] 机械推导；未经法务判断，null 表示数据不足以判定。',
  }
}

/* ---------- 三层投影 ---------- */

function toIndexItem(bundle) {
  const identity = bundle.pages.find((page) => page.role === 'identity')
  const license = licenseSummary(bundle)
  return {
    entryId: bundle.entryId,
    name: bundle.editorial.name,
    domain: domainOf(bundle.official.finalUrl),
    homepage: bundle.official.finalUrl,
    descriptionZh: bundle.editorial.descriptionZh ?? null,
    /* WP-H 尚未补写时为 null，前台按方案 §4.2 显示「未写」，不许用简介截断冒充。 */
    takeawayZh: bundle.editorial.takeawayZh ?? null,
    /* 编辑手记：详情页的正文主体。没写就是 null，前台显示占位，不用简介顶替。 */
    noteZh: bundle.editorial.noteZh ?? null,
    /* 这条记录的编辑语气成色（如 exemplar）。界面不据此加任何标记，只做内部盘点。 */
    voiceStatus: bundle.editorialVoice?.status ?? null,
    /* 12 个正交轴原样保留，绝不合并成 tags[]（方案 §3.4 结尾）。 */
    facets: Object.fromEntries(FACET_AXES.map((axis) => [axis, bundle.facets[axis]])),
    /* 后台字段：端点保留，前台一处不渲染（方案 §3.5）。 */
    primaryCategory: bundle.classification?.primaryCategory ?? null,
    subcategory: bundle.classification?.subcategory ?? null,
    license: license.value,
    licenses: license.axis,
    licenseSourceUrl: license.sourceUrl,
    access: bundle.facets.access,
    checkedAt: bundle.official.checkedAt,
    pricing: pricingOf(bundle).value,
    pricingNote: pricingOf(bundle).note,
    shot: {
      src: identity.shot.src,
      alt: identity.shot.alt ?? null,
      width: identity.shot.width ?? null,
      height: identity.shot.height ?? null,
    },
    /* WP-H 尚未标注时为空数组，前台不渲染该段。 */
    atlasTerms: atlasTermsOf(bundle),
    /* 标注本身的成色（如 editor-draft），前台据此决定是否标「草稿」。 */
    atlasTermsStatus: bundle.curation?.atlasTermsStatus ?? null,
    independentlyReviewed: independentlyReviewed(bundle),
    detailUrl: `/data/site/${bundle.entryId}.json`,
    designMdUrl: `/site/${bundle.entryId}.md`,
    registryUrl: `/r/${bundle.entryId}.json`,
  }
}

function toSiteDetail(bundle, generatedAt) {
  const { classification = {} } = bundle
  return {
    schemaVersion: bundle.schemaVersion,
    generatedAt,
    entryId: bundle.entryId,
    entityId: bundle.entityId,
    status: bundle.status,
    voiceStatus: bundle.editorialVoice?.status ?? null,
    domain: domainOf(bundle.official.finalUrl),
    official: { ...bundle.official },
    editorial: {
      name: bundle.editorial.name,
      descriptionZh: bundle.editorial.descriptionZh ?? null,
      takeawayZh: bundle.editorial.takeawayZh ?? null,
      noteZh: bundle.editorial.noteZh ?? null,
      pricing: pricingOf(bundle).value,
      pricingNote: pricingOf(bundle).note,
    },
    classification: {
      recordLevel: classification.recordLevel ?? null,
      primaryCategory: classification.primaryCategory ?? null,
      subcategory: classification.subcategory ?? null,
      status: classification.status ?? null,
      alternatives: classification.alternatives ?? [],
      reasons: classification.reasons ?? [],
      confirmedAt: classification.confirmedAt ?? null,
      /* curatorId / reviewerId 不出场，只留布尔。 */
      independentlyReviewed: independentlyReviewed(bundle),
    },
    facets: Object.fromEntries(FACET_AXES.map((axis) => [axis, bundle.facets[axis]])),
    pages: bundle.pages.map((page) => ({
      role: page.role,
      sourceUrl: page.sourceUrl,
      finalUrl: page.finalUrl ?? null,
      title: page.title ?? null,
      selectionRationale: page.selectionRationale,
      shot: { ...page.shot },
    })),
    facts: bundle.facts.map((fact) => ({ ...fact })),
    curation: {
      atlasTerms: atlasTermsOf(bundle),
      atlasTermsStatus: bundle.curation?.atlasTermsStatus ?? null,
    },
    agentGuidance: agentGuidanceOf(bundle),
    designMdUrl: `/site/${bundle.entryId}.md`,
    registryUrl: `/r/${bundle.entryId}.json`,
  }
}

function toRegistryItem(bundle, generatedAt) {
  const detail = toSiteDetail(bundle, generatedAt)
  const license = licenseSummary(bundle)
  return {
    $schema: SCHEMA_REGISTRY_ITEM,
    schemaVersion: bundle.schemaVersion,
    generatedAt,
    entryId: detail.entryId,
    entityId: detail.entityId,
    status: detail.status,
    voiceStatus: detail.voiceStatus,
    official: detail.official,
    editorial: detail.editorial,
    classification: detail.classification,
    facets: detail.facets,
    /* shot.src 换成绝对 URL；sha256 / width / height / bytes 保留，它们是可核验性的一部分。 */
    pages: detail.pages.map((page) => ({
      ...page,
      shot: { ...page.shot, src: absoluteUrl(page.shot.src) },
    })),
    facts: detail.facts,
    curation: detail.curation,
    agentGuidance: detail.agentGuidance,
    meta: {
      vislexiconUrl: `${ORIGIN}/#/site/${detail.entryId}`,
      designMdUrl: `${ORIGIN}/site/${detail.entryId}.md`,
      checkedAt: detail.official.checkedAt,
      license: license.axis.join(' / ') || 'unknown',
    },
  }
}

function toRegistryIndexItem(bundle) {
  return {
    entryId: bundle.entryId,
    name: bundle.editorial.name,
    url: `${ORIGIN}/r/${bundle.entryId}.json`,
    homepage: bundle.official.finalUrl,
    primaryCategory: bundle.classification?.primaryCategory ?? null,
    subcategory: bundle.classification?.subcategory ?? null,
    /* licenses / access / checkedAt 放在索引层：Agent 一次调用就能排除
     * 「不能商用」与「很久没核验」的条目（research/02 §6.1）。 */
    licenses: bundle.facets.licenses,
    access: bundle.facets.access,
    checkedAt: bundle.official.checkedAt,
  }
}

/* ---------- DESIGN.md ---------- */

function yamlString(value) {
  const text = String(value)
  return /^[\w./:+-]+$/u.test(text) ? text : JSON.stringify(text)
}

/* Google Labs DESIGN.md：YAML frontmatter + 若干可选 `##` 章节，name 是唯一必填。
 * Colors / Typography / Spacing 一律不生成——本轮语料没有实测值，
 * 填推断值就是在犯 research/04 §A 点名的那个错。 */
function toDesignMd(bundle) {
  const license = licenseSummary(bundle)
  const guidance = agentGuidanceOf(bundle)
  const lines = ['---', `version: "${bundle.schemaVersion}"`, `name: ${yamlString(bundle.editorial.name)}`]

  if (isNonEmptyString(bundle.editorial.takeawayZh)) {
    lines.push(`description: ${yamlString(bundle.editorial.takeawayZh)}`)
  }

  lines.push('# —— 以下为 VisLexicon 扩展，规范未定义但不冲突')
  lines.push(`source: ${yamlString(bundle.official.finalUrl)}`)
  lines.push(`checkedAt: ${yamlString(bundle.official.checkedAt)}`)
  lines.push(`license: ${yamlString(license.value ?? license.axis.join(' / ') ?? 'unknown')}`)
  lines.push(`licenseEvidence: ${yamlString(license.sourceUrl ?? 'unknown')}`)
  if (license.confidence !== null) lines.push(`confidence: ${license.confidence}`)
  lines.push(`independentlyReviewed: ${independentlyReviewed(bundle)}`)
  lines.push(`vislexiconUrl: ${yamlString(`${ORIGIN}/#/site/${bundle.entryId}`)}`)
  lines.push('---', '')

  if (isNonEmptyString(bundle.editorial.descriptionZh)) {
    lines.push('## Overview', '', bundle.editorial.descriptionZh, '')
  }

  /* 只在数据真有依据时写；每条都能追回 facets / facts，没有依据就整节省略。
   * 许可那一条原句照抄 facts[field=license].evidence——Ant Design / Chakra 的
   * 「仅限核心仓库」这类范围限定就在那句话里，改写它等于把限定丢掉。 */
  const doDont = [...guidance.cautions]
  if (license.permissive) {
    doDont.push(`许可登记为 ${license.axis.join(' / ')}（宽松 SPDX），再分发时须保留版权与许可声明。`)
  }
  if (isNonEmptyString(license.evidence)) {
    const cite = license.sourceUrl ? `（证据：${license.sourceUrl}）` : ''
    doDont.push(`许可原始记录 ${license.value}：${license.evidence}${cite}`)
  }
  if (doDont.length) {
    lines.push("## Do's and Don'ts", '')
    for (const bullet of doDont) lines.push(`- ${bullet}`)
    lines.push('')
  }

  return lines.join('\n')
}

/* ---------- llms.txt ---------- */

function toLlmsTxt(bundles, counts) {
  const lines = [
    '# VisLexicon',
    '',
    '> 会查证的视觉知识层。每个条目由人工进站核验，带来源 URL、许可证证据与核验时间戳。',
    '',
    '## 机器接口',
    '',
    `- [注册表索引](${ORIGIN}/r/registry.json)：全部已审核条目的轻量索引，含许可证、访问方式与核验时间`,
    '',
    `## 已审核条目（${counts.approvedEntries}）`,
    '',
  ]
  for (const bundle of bundles) {
    const license = licenseSummary(bundle)
    const label = license.axis.join(' / ') || 'unknown'
    lines.push(
      `- [${bundle.editorial.name}](${ORIGIN}/r/${bundle.entryId}.json)：许可 ${label}；核验于 ${bundle.official.checkedAt}；DESIGN.md 见 ${ORIGIN}/site/${bundle.entryId}.md`,
    )
  }
  lines.push('', '## Optional', '', `- [口径与方法](${ORIGIN}/#/about)：每个数字的定义与算法`, '')
  return lines.join('\n')
}

/* ---------- 主流程 ---------- */

function main() {
  if (!fs.existsSync(SOURCE_DIR)) fail(`找不到源目录 ${SOURCE_DIR}`)
  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => path.join(SOURCE_DIR, name))
  if (files.length === 0) fail(`${SOURCE_DIR} 下没有任何条目`)

  const bundles = files.map((file) => {
    const bundle = readJson(file)
    assertBundle(bundle, file)
    return bundle
  })

  const seen = new Set()
  for (const bundle of bundles) {
    if (seen.has(bundle.entryId)) fail(`entryId 重复：${bundle.entryId}`)
    seen.add(bundle.entryId)
  }

  const generatedAt = new Date().toISOString()

  /* 幂等：先清空本包拥有的输出目录，再整体重写。 */
  resetDir(OUT_SITE_DIR)
  resetDir(OUT_REGISTRY_DIR)
  resetDir(OUT_MD_DIR)

  const items = bundles.map((bundle) => toIndexItem(bundle))
  const counts = siteWideCounts({
    items,
    atlas: readJsonIfExists(ATLAS_FILE),
    manifests: MANIFESTS,
    sampleInfo: readJsonIfExists(SAMPLE_INFO_FILE)?.sampleInfo,
  })

  /* 验收断言：counts.approvedEntries 必须等于源文件数，不许写常量。 */
  if (counts.approvedEntries !== files.length) {
    fail(`counts.approvedEntries=${counts.approvedEntries} 与源文件数 ${files.length} 不一致`)
  }

  writeJson(OUT_SITE_INDEX, {
    schemaVersion: bundles[0].schemaVersion,
    generatedAt,
    counts: { approvedEntries: counts.approvedEntries },
    items,
  })

  for (const bundle of bundles) {
    writeJson(path.join(OUT_SITE_DIR, `${bundle.entryId}.json`), toSiteDetail(bundle, generatedAt))
    writeJson(path.join(OUT_REGISTRY_DIR, `${bundle.entryId}.json`), toRegistryItem(bundle, generatedAt))
    writeText(path.join(OUT_MD_DIR, `${bundle.entryId}.md`), toDesignMd(bundle))
  }

  writeJson(path.join(OUT_REGISTRY_DIR, 'registry.json'), {
    $schema: SCHEMA_REGISTRY,
    name: 'vislexicon',
    homepage: ORIGIN,
    schemaVersion: bundles[0].schemaVersion,
    generatedAt,
    counts: {
      approvedEntries: counts.approvedEntries,
      /* 候选池规模来自样本包自述；样本包没给就是 null，不编。 */
      candidateEntries: counts.candidateEntries,
      atlasTerms: counts.atlasTerms,
      atlasTermsOnStage: counts.atlasTermsOnStage,
      candidateEntriesSource: 'src/data/site-catalog.json 的 sampleInfo.productionCandidateCount（样本包自述）',
      note: 'candidate 条目不出现在本索引中，仅计数公开。atlasTerms / atlasTermsOnStage 为本样本包内的图鉴条目数，不是生产总量。',
    },
    items: bundles.map((bundle) => toRegistryIndexItem(bundle)),
  })

  writeText(OUT_LLMS, toLlmsTxt(bundles, counts))

  assertNoInternalFields()

  const digest = createHash('sha256')
    .update(fs.readFileSync(OUT_SITE_INDEX))
    .digest('hex')
    .slice(0, 'abcdefgh'.length)
  process.stdout.write(
    `[build-public-data] ${counts.approvedEntries} 条已审核条目 → site-index(${digest}) / data/site / r / site/*.md / llms.txt\n`,
  )
}

/* 写完之后再扫一遍公开目录，把「内部过程字段泄漏」变成构建期失败而不是 code review 靠眼睛。 */
function assertNoInternalFields() {
  const targets = [OUT_SITE_INDEX, OUT_LLMS]
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      if (fs.statSync(full).isDirectory()) walk(full)
      else targets.push(full)
    }
  }
  walk(OUT_SITE_DIR)
  walk(OUT_REGISTRY_DIR)
  walk(OUT_MD_DIR)

  const hits = []
  for (const file of targets) {
    const text = fs.readFileSync(file, 'utf8')
    for (const key of FORBIDDEN_KEYS) {
      if (text.includes(key)) hits.push(`${path.relative(PUBLIC_DIR, file)} 含 ${key}`)
    }
  }
  if (hits.length) fail(`公开产物泄漏内部过程字段：\n- ${hits.join('\n- ')}`)
}

main()
