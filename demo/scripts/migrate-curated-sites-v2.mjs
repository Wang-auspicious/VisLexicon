import { createHash, randomUUID } from 'node:crypto'
import {
  access,
  mkdir,
  open,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
} from 'node:fs/promises'
import {
  basename,
  dirname,
  join,
  resolve,
} from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import {
  CURATION_SUBCATEGORIES,
  scoreWithinEssenceBand,
} from '../src/data/curation-taxonomy-v2-legacy.js'
import { CURATED_SITES } from '../src/data/curated-sites.js'
import { evidenceBundleErrors } from '../src/lib/curation-evidence.js'
import { readImageMetadata } from './curation/image-metadata.mjs'

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIRECTORY, '..')
const QUEUE_REVISION = 'curation-work-queue-20260901'
const REVIEWED_CAPTURE_PATH = join(
  DEMO_ROOT,
  'data',
  'curation',
  'reviewed-capture-v2.json',
)
const REVIEWED_CAPTURE_FINGERPRINT = '351ac591a1a70b728dfce2a3aa4b40e60df19f3a2513cef65a53c5b15090751b'
const REVIEWED_SOURCE_FINGERPRINTS = Object.freeze({
  'magic-ui': '9c7f0b29b07424c4632a40d0aa83ce267274ffdaba0dbf228bd6db85e46f0c2a',
  'origin-ui': '96333c7ac2874e2e8c311c45aff36e51a039a20affc4245a54805b0272f6781f',
  'hover-dev': 'ecd44f9cbbd37f11cd3348146d5dd67e9eb56acd9e5e4564ed177610c0a83933',
  'shadcn-ui': '818abfc9fcebb21c6d9aaf20e7bfed371ddced4b37396ae36e825adb6b207f72',
  uiverse: '592ea48477bf4ebfd54c5fa51c34af65d8556c41c1ec4e698f80797342ebbf3b',
  '21st-dev': '40eb3629ee896f06d852627560b60a86c4775cdc9bb7c346aa9bc66c51434241',
})
const APPROVED_SITE_IDS = Object.freeze([
  'magic-ui',
  'origin-ui',
  'hover-dev',
  'shadcn-ui',
  'uiverse',
  '21st-dev',
])
const PAGE_ROLES = Object.freeze(['identity', 'breadth', 'proof'])
const QA = Object.freeze({
  curatorId: 'capture-tool-v2',
  technicalPassed: true,
  semanticReviewerId: 'root-contact-sheet-review-20260901',
  semanticPassed: true,
})

const SITE_MIGRATION_DETAILS = Object.freeze({
  'magic-ui': Object.freeze({
    descriptionZh: '面向营销官网的动效组件库，提供 150+ 个可复制的 React + Tailwind 组件，覆盖 Bento、Aurora、Marquee 与粒子效果。文档包含实时预览和一键 npx 安装命令，便于快速搭建高视觉冲击的落地页。',
    subcategory: 'marketing-sections',
    titles: Object.freeze([
      'Magic UI — Animated UI Components',
      'Magic UI Components',
      'Magic UI Glyph Matrix',
    ]),
    rationales: Object.freeze([
      '首页明确展示 Magic UI 的名称、营销场景定位与动效视觉语言。',
      '组件目录呈现可复用区块的分类范围与实时预览入口。',
      'Glyph Matrix 文档展示单个动效组件的效果、用法与安装入口。',
    ]),
    license: Object.freeze({
      value: 'MIT',
      sourceUrl: 'https://github.com/magicuidesign/magicui',
      evidence: '旧人工核验记录明确标注该项目全部开源，并记录 MIT 许可证。',
    }),
  }),
  'origin-ui': Object.freeze({
    subcategory: 'application-dashboard-ui',
    titles: Object.freeze([
      'Coss UI — Origin UI Components',
      'Coss UI Particles',
      'Coss UI Calendar',
    ]),
    rationales: Object.freeze([
      '首页展示 Coss UI 身份、Base UI 技术基础与应用组件示例。',
      'Particles 目录体现大量可筛选界面组件及其覆盖范围。',
      'Calendar 文档通过日期选择器实例证明组件可用于真实应用界面。',
    ]),
    license: Object.freeze({
      value: 'Open source (specific license not recorded)',
      sourceUrl: 'https://coss.com/ui',
      evidence: '旧人工核验记录明确说明这些组件全部开源，但未记录许可证标识符。',
    }),
  }),
  'hover-dev': Object.freeze({
    subcategory: 'motion-interaction-code',
    titles: Object.freeze([
      'Hover.dev — Animated React Components',
      'Hover.dev Buttons',
      'Hover.dev Three D Components',
    ]),
    rationales: Object.freeze([
      '首页直接呈现 Hover.dev 的 React 动效组件定位与交互风格。',
      'Buttons 分类展示多种可复制按钮及不同悬停反馈。',
      'Three D 分类以交互式魔方证明其三维微交互实现能力。',
    ]),
  }),
  'shadcn-ui': Object.freeze({
    subcategory: 'design-system-primitives',
    titles: Object.freeze([
      'shadcn/ui — Build Your Component Library',
      'shadcn/ui Components',
      'shadcn/ui Blocks',
    ]),
    rationales: Object.freeze([
      '首页组合示例清楚表达可复制代码与自主定制的设计系统定位。',
      '组件文档目录展示无障碍原语和基础控件的完整范围。',
      'Blocks 页面以后台区块证明这些原语能组合成应用级界面。',
    ]),
    license: Object.freeze({
      value: 'Open source (specific license not recorded)',
      sourceUrl: 'https://github.com/shadcn-ui/ui',
      evidence: '旧人工核验记录将该项目标为免费开源，但未记录许可证标识符。',
    }),
  }),
  uiverse: Object.freeze({
    subcategory: 'ui-components-general',
    titles: Object.freeze([
      'Uiverse — Community UI Elements',
      'Uiverse Elements',
      'Fresh Lizard 20 — Uiverse',
    ]),
    rationales: Object.freeze([
      '首页展示 Uiverse 身份、社区元素画廊与代码搜索入口。',
      'Elements 瀑布流体现加载器、按钮、卡片等组件的广度。',
      '单个 Loader 页面同时展示实时效果和可复制的 HTML/CSS 源码。',
    ]),
    license: Object.freeze({
      value: 'Open source; free commercial use (specific license not recorded)',
      sourceUrl: 'https://uiverse.io/',
      evidence: '旧人工核验记录标明元素开放源码且可免费商用，但未记录许可证标识符。',
    }),
  }),
  '21st-dev': Object.freeze({
    subcategory: 'ui-components-general',
    titles: Object.freeze([
      '21st.dev — The NPM for Design Engineers',
      '21st.dev Community Components',
      '21st.dev Community Themes',
    ]),
    rationales: Object.freeze([
      '首页呈现 21st.dev 的社区组件注册表身份与精选资源。',
      'Community Components 目录展示多类别组件和营销区块覆盖面。',
      'Community Themes 画廊证明资源可直接服务 shadcn 主题配置。',
    ]),
  }),
})

export function reviewedSemanticContract() {
  const sourceById = new Map(CURATED_SITES.map((site) => [site.id, site]))
  const sites = {}
  for (const siteId of APPROVED_SITE_IDS) {
    const details = SITE_MIGRATION_DETAILS[siteId]
    const source = sourceById.get(siteId)
    sites[siteId] = {
      descriptionZh: details.descriptionZh ?? source.about,
      descriptionBasis: details.descriptionZh
        ? 'reviewed-migration-override'
        : 'locked-reviewed-source-about',
      subcategory: details.subcategory,
      titles: [...details.titles],
      rationales: [...details.rationales],
      license: details.license ? { ...details.license } : null,
    }
  }
  return {
    schemaVersion: 1,
    resourceEssence: 'reusable-implementation',
    scorePolicy: {
      strategy: 'scoreWithinEssenceBand',
      resourceEssence: 'reusable-implementation',
      expectedScore: scoreWithinEssenceBand('reusable-implementation'),
    },
    qa: { ...QA },
    sites,
  }
}

export function semanticContractFingerprint(
  contract = reviewedSemanticContract(),
) {
  return createHash('sha256')
    .update(JSON.stringify(contract))
    .digest('hex')
}

function jsonBytes(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function normalizedTag(value) {
  return value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/&/gu, ' and ')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
}

function migratedTags(site, hasOpenSourceEvidence) {
  const tags = []
  const seen = new Set()
  for (const value of [...site.stacks, ...site.themes]) {
    const tag = normalizedTag(value)
    if (!tag || seen.has(tag)) continue
    seen.add(tag)
    tags.push(tag)
  }
  if (hasOpenSourceEvidence) tags.push('open-source')
  return tags
}

function reviewedSourceSnapshot(site) {
  return {
    id: site.id,
    name: site.name,
    site: site.site,
    about: site.about,
    author: site.author,
    repo: site.repo ?? null,
    pricing: site.pricing,
    stacks: [...site.stacks],
    themes: [...site.themes],
    shots: site.shots.map(({ src, sourceUrl, alt }) => ({
      src,
      sourceUrl,
      alt,
    })),
  }
}

export function sourceRecordFingerprint(site) {
  return createHash('sha256')
    .update(JSON.stringify(reviewedSourceSnapshot(site)))
    .digest('hex')
}

function captureManifestFingerprint(manifest) {
  return createHash('sha256')
    .update(JSON.stringify(manifest))
    .digest('hex')
}

export function validateReviewedProvenance(curatedSites, manifest, options = {}) {
  const sites = selectApprovedSites(curatedSites)
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new TypeError('capture review manifest must be an object')
  }
  const manifestFingerprint = captureManifestFingerprint(manifest)
  if (manifestFingerprint !== REVIEWED_CAPTURE_FINGERPRINT) {
    throw new TypeError(
      `capture review manifest fingerprint mismatch: ${manifestFingerprint}`,
    )
  }
  if (
    manifest.schemaVersion !== 1 ||
    manifest.reviewId !== 'reviewed-capture-v2-20260901' ||
    manifest.captureAgentId !== 'capture-tool-v2' ||
    manifest.visualReviewerId !== 'root-contact-sheet-review-20260901' ||
    manifest.visualReviewerId === manifest.captureAgentId ||
    manifest.reviewMethod !== '960x1350 contact sheet + metadata'
  ) {
    throw new TypeError('capture review manifest lacks the locked independent visual reviewer provenance')
  }
  const semanticFingerprint = semanticContractFingerprint(
    options.semanticContract ?? reviewedSemanticContract(),
  )
  if (manifest.semanticContractFingerprint !== semanticFingerprint) {
    throw new TypeError(
      `semantic contract fingerprint mismatch: ${semanticFingerprint}`,
    )
  }
  if (!Array.isArray(manifest.sites) || manifest.sites.length !== sites.length) {
    throw new TypeError('capture review manifest must contain exactly six reviewed sites')
  }

  const reviewById = new Map()
  for (const reviewSite of manifest.sites) {
    if (!reviewSite || reviewById.has(reviewSite.siteId)) {
      throw new TypeError(`capture review site is invalid or duplicated: ${reviewSite?.siteId}`)
    }
    reviewById.set(reviewSite.siteId, reviewSite)
  }
  for (const site of sites) {
    const fingerprint = sourceRecordFingerprint(site)
    const expectedFingerprint = REVIEWED_SOURCE_FINGERPRINTS[site.id]
    const reviewSite = reviewById.get(site.id)
    if (
      fingerprint !== expectedFingerprint ||
      reviewSite?.sourceFingerprint !== expectedFingerprint
    ) {
      throw new TypeError(`source fingerprint mismatch for ${site.id}; approval requires re-review`)
    }
    if (
      reviewSite.official?.inputUrl !== site.site ||
      !Array.isArray(reviewSite.pages) ||
      reviewSite.pages.length !== PAGE_ROLES.length
    ) {
      throw new TypeError(`capture review record mismatch for ${site.id}`)
    }
    for (let index = 0; index < PAGE_ROLES.length; index += 1) {
      const page = reviewSite.pages[index]
      const sourcePage = site.shots[index]
      if (
        page?.role !== PAGE_ROLES[index] ||
        page.inputUrl !== sourcePage.sourceUrl ||
        page.finalUrl !== sourcePage.sourceUrl ||
        page.titleBasis !== 'curated-label' ||
        page.bodyTextLengthBasis !== 'capture-agent-final-report' ||
        page.timeBasis !== 'file-mtime-after-cdp-capture' ||
        !Number.isSafeInteger(page.bodyTextLength) ||
        page.bodyTextLength < 120
      ) {
        throw new TypeError(`capture review page mismatch for ${site.id}/${PAGE_ROLES[index]}`)
      }
    }
  }
  return {
    curatedSites: sites,
    fingerprint: manifestFingerprint,
    reviewById,
    sites: manifest.sites,
  }
}

function selectApprovedSites(curatedSites) {
  if (!Array.isArray(curatedSites)) throw new TypeError('curatedSites must be an array')
  const sitesById = new Map()
  for (const site of curatedSites) {
    if (!site || typeof site.id !== 'string') {
      throw new TypeError('every curated site must have a string id')
    }
    if (sitesById.has(site.id)) throw new TypeError(`duplicate curated site id: ${site.id}`)
    sitesById.set(site.id, site)
  }

  const unexpectedIds = [...sitesById.keys()].filter((siteId) => (
    !APPROVED_SITE_IDS.includes(siteId)
  ))
  const missingIds = APPROVED_SITE_IDS.filter((siteId) => !sitesById.has(siteId))
  if (unexpectedIds.length > 0 || missingIds.length > 0) {
    throw new TypeError(
      `curated site set must be exactly ${APPROVED_SITE_IDS.join(', ')}; ` +
      `unexpected: ${unexpectedIds.join(', ') || 'none'}; missing: ${missingIds.join(', ') || 'none'}`,
    )
  }
  return APPROVED_SITE_IDS.map((siteId) => sitesById.get(siteId))
}

function repositoryFact(site) {
  if (!site.repo) return null
  const repositoryUrl = `https://github.com/${site.repo}`
  return {
    field: 'repository',
    value: repositoryUrl,
    sourceUrl: repositoryUrl,
    evidence: `旧人工核验记录为 ${site.name} 保存了该完整 GitHub 仓库路径。`,
    confidence: 1,
  }
}

function factsForSite(site, details) {
  const facts = [{
    field: 'author',
    value: site.author,
    sourceUrl: site.site,
    evidence: `旧人工核验记录将 ${site.name} 的作者或维护方记为“${site.author}”。`,
    confidence: 1,
  }]
  const repository = repositoryFact(site)
  if (repository) facts.push(repository)
  if (details.license) {
    facts.push({
      field: 'license',
      ...details.license,
      confidence: 1,
    })
  }
  return facts
}

async function bundleForSite(site, publicRoot, reviewSite) {
  const details = SITE_MIGRATION_DETAILS[site.id]
  const pages = []
  for (let index = 0; index < PAGE_ROLES.length; index += 1) {
    const role = PAGE_ROLES[index]
    const sourcePage = site.shots[index]
    const reviewedPage = reviewSite.pages[index]
    const shotSrc = reviewedPage.src
    const filePath = join(publicRoot, shotSrc.replace(/^\//u, ''))
    const metadata = await readImageMetadata(filePath)
    if (metadata.verification !== 'decoded') {
      throw new TypeError(`screenshot decode verification failed for ${shotSrc}`)
    }
    for (const field of ['sha256', 'bytes', 'width', 'height']) {
      if (metadata[field] !== reviewedPage[field]) {
        throw new TypeError(
          `capture review screenshot metadata mismatch for ${site.id}/${role}: ${field}`,
        )
      }
    }
    pages.push({
      role,
      sourceUrl: reviewedPage.inputUrl,
      finalUrl: reviewedPage.finalUrl,
      title: reviewedPage.title,
      selectionRationale: details.rationales[index],
      shot: {
        src: shotSrc,
        sha256: metadata.sha256,
        width: metadata.width,
        height: metadata.height,
        bytes: metadata.bytes,
        alt: sourcePage.alt,
      },
    })
  }

  const hostname = new URL(site.site).hostname.toLowerCase().replace(/^www\./u, '')
  return {
    schemaVersion: 2,
    siteId: site.id,
    entityKey: `${site.id}:${hostname}`,
    attemptId: `legacy-curation-v2-${site.id}-20260901`,
    status: 'APPROVED',
    official: {
      inputUrl: reviewSite.official.inputUrl,
      finalUrl: reviewSite.official.finalUrl,
      checkedAt: reviewSite.official.checkedAt,
    },
    curation: {
      name: site.name,
      descriptionZh: details.descriptionZh ?? site.about,
      resourceEssence: 'reusable-implementation',
      subcategory: details.subcategory,
      score: scoreWithinEssenceBand('reusable-implementation'),
      tags: migratedTags(site, Boolean(details.license)),
      pricing: site.pricing,
    },
    pages,
    facts: factsForSite(site, details),
    qa: { ...QA },
  }
}

function queueSubcategoryRecords() {
  return Object.entries(CURATION_SUBCATEGORIES).flatMap(
    ([essenceId, records]) => records.map(({ id: subcategoryId }) => ({
      essenceId,
      subcategoryId,
    })),
  )
}

export function createWorkQueue(tasks = []) {
  if (!Array.isArray(tasks)) throw new TypeError('tasks must be an array')
  const records = queueSubcategoryRecords()
  const knownSubcategories = new Set(records.map(({ subcategoryId }) => subcategoryId))
  for (const task of tasks) {
    if (!task || !knownSubcategories.has(task.subcategoryId)) {
      throw new TypeError(`queue task has unknown subcategory: ${task?.subcategoryId}`)
    }
  }

  return {
    schemaVersion: 1,
    revision: QUEUE_REVISION,
    activeEssence: 'reusable-implementation',
    activeSubcategory: 'agent-ai-ui',
    tasks: structuredClone(tasks),
    subcategories: records.map(({ essenceId, subcategoryId }, index) => ({
      order: index + 1,
      essenceId,
      subcategoryId,
      state: subcategoryId === 'agent-ai-ui' ? 'READY' : 'NOT_STARTED',
      assignedCount: tasks.filter((task) => (
        task.subcategoryId === subcategoryId && task.status === 'ASSIGNED'
      )).length,
      approvedCount: tasks.filter((task) => (
        task.subcategoryId === subcategoryId && task.status === 'APPROVED'
      )).length,
    })),
  }
}

function queueTasksForBundles(bundles) {
  return bundles.map((bundle) => ({
    taskId: `legacy-approved-${bundle.siteId}-20260901`,
    entityId: bundle.entityKey,
    subcategoryId: bundle.curation.subcategory,
    status: 'APPROVED',
  }))
}

function validateBundles(bundles) {
  const failures = []
  const hashes = new Map()
  for (const bundle of bundles) {
    const errors = evidenceBundleErrors(bundle)
    if (errors.length > 0) {
      failures.push(`bundle validation failed for ${bundle.siteId}: ${errors.join('; ')}`)
    }
    for (const page of bundle.pages) {
      const priorShot = hashes.get(page.shot.sha256)
      if (priorShot) {
        failures.push(
          `bundle validation failed for ${bundle.siteId}: ${page.shot.src} reuses image bytes from ${priorShot}`,
        )
      } else {
        hashes.set(page.shot.sha256, page.shot.src)
      }
    }
  }
  if (failures.length > 0) throw new TypeError(failures.join('\n'))
}

function validateQueue(queue) {
  const expectedRecords = queueSubcategoryRecords()
  const failures = []
  if (queue.schemaVersion !== 1) failures.push('schemaVersion must be 1')
  if (queue.activeEssence !== 'reusable-implementation') {
    failures.push('activeEssence must be reusable-implementation')
  }
  if (queue.activeSubcategory !== 'agent-ai-ui') {
    failures.push('activeSubcategory must be agent-ai-ui')
  }
  if (queue.subcategories.length !== expectedRecords.length) {
    failures.push(`subcategories must contain ${expectedRecords.length} records`)
  }
  for (let index = 0; index < expectedRecords.length; index += 1) {
    const actual = queue.subcategories[index]
    const expected = expectedRecords[index]
    if (
      !actual ||
      actual.essenceId !== expected.essenceId ||
      actual.subcategoryId !== expected.subcategoryId
    ) {
      failures.push(`subcategory order mismatch at position ${index + 1}`)
      continue
    }
    const expectedState = actual.subcategoryId === 'agent-ai-ui' ? 'READY' : 'NOT_STARTED'
    if (actual.state !== expectedState) {
      failures.push(`${actual.subcategoryId} state must be ${expectedState}`)
    }
    const assignedCount = queue.tasks.filter((task) => (
      task.subcategoryId === actual.subcategoryId && task.status === 'ASSIGNED'
    )).length
    const approvedCount = queue.tasks.filter((task) => (
      task.subcategoryId === actual.subcategoryId && task.status === 'APPROVED'
    )).length
    if (actual.assignedCount !== assignedCount || actual.approvedCount !== approvedCount) {
      failures.push(`${actual.subcategoryId} counts must be derived from tasks`)
    }
  }
  if (failures.length > 0) throw new TypeError(`queue validation failed: ${failures.join('; ')}`)
}

function comparableOutputPath(filePath) {
  const absolutePath = resolve(filePath)
  return process.platform === 'win32' ? absolutePath.toLowerCase() : absolutePath
}

export async function assertDistinctOutputTargets(targets, fsAdapter = {}) {
  const ensureDirectory = fsAdapter.mkdir ?? mkdir
  const resolveParent = fsAdapter.realpath ?? realpath
  const readStat = fsAdapter.stat ?? stat
  const canonicalKeys = []
  const inodeKeys = []
  for (const [index, target] of targets.entries()) {
    if (!target || typeof target.targetPath !== 'string') {
      throw new TypeError(`output target ${index} must have a targetPath`)
    }
    const targetPath = resolve(target.targetPath)
    const parent = dirname(targetPath)
    await ensureDirectory(parent, { recursive: true })
    const canonicalParent = await resolveParent(parent)
    canonicalKeys.push(comparableOutputPath(join(canonicalParent, basename(targetPath))))
    try {
      const metadata = await readStat(targetPath)
      if (metadata?.dev !== undefined && metadata?.ino !== undefined) {
        inodeKeys.push(`${String(metadata.dev)}:${String(metadata.ino)}`)
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }
  if (new Set(canonicalKeys).size !== canonicalKeys.length) {
    throw new TypeError('output target realpath alias collision; targets must be distinct')
  }
  if (new Set(inodeKeys).size !== inodeKeys.length) {
    throw new TypeError('output target hardlink inode alias collision; targets must be distinct')
  }
}

async function assertTransactionNamespace({
  claimPath,
  fsAdapter,
  lockPath,
  protectedPaths = [],
  operations,
  runId,
  targets,
}) {
  const journalDirectory = dirname(lockPath)
  const journalPrefix = `journal.${runId}.`
  const plannedJournalCount = 5 * targets.length + 3
  const plannedJournalNames = new Set(
    Array.from({ length: plannedJournalCount }, (_, index) => (
      basename(journalPath(lockPath, runId, index + 1))
    )),
  )
  const entries = [
    ...protectedPaths.map((path, index) => ({
      label: `protected path ${index}`,
      path,
    })),
    ...targets.map(({ targetPath }, index) => ({
      label: `target ${index}`,
      path: targetPath,
    })),
    { label: 'owner lock', path: lockPath },
    { label: 'recovery claim', path: claimPath },
    ...operations.flatMap((operation) => [
      { label: `operation ${operation.index} temp`, path: operation.tempPath },
      { label: `operation ${operation.index} backup`, path: operation.backupPath },
    ]),
    ...Array.from({ length: plannedJournalCount }, (_, index) => ({
      label: `journal ${index + 1}`,
      path: journalPath(lockPath, runId, index + 1),
    })),
  ]
  if (typeof fsAdapter.readdir === 'function') {
    await fsAdapter.mkdir(journalDirectory, { recursive: true })
    const names = await fsAdapter.readdir(journalDirectory)
    for (const name of names) {
      if (
        typeof name === 'string' &&
        basename(name) === name &&
        name.startsWith(journalPrefix) &&
        !plannedJournalNames.has(name)
      ) {
        entries.push({ label: 'existing journal artifact', path: join(journalDirectory, name) })
      }
    }
  }

  const lexicalOwners = new Map()
  for (const entry of entries) {
    const key = comparableOutputPath(entry.path)
    const prior = lexicalOwners.get(key)
    if (prior) {
      throw new TypeError(
        `transaction namespace collision between ${prior.label} and ${entry.label}`,
      )
    }
    lexicalOwners.set(key, entry)
  }
  const comparableJournalDirectory = comparableOutputPath(journalDirectory)
  const comparableJournalPrefix = process.platform === 'win32'
    ? journalPrefix.toLowerCase()
    : journalPrefix
  for (const entry of entries.slice(0, targets.length + 2 + operations.length * 2)) {
    const entryName = process.platform === 'win32'
      ? basename(entry.path).toLowerCase()
      : basename(entry.path)
    if (
      comparableOutputPath(dirname(entry.path)) === comparableJournalDirectory &&
      entryName.startsWith(comparableJournalPrefix)
    ) {
      throw new TypeError(`${entry.label} collides with the reserved journal namespace`)
    }
  }

  const canonicalOwners = new Map()
  const inodeOwners = new Map()
  for (const entry of entries) {
    const parent = dirname(entry.path)
    await fsAdapter.mkdir(parent, { recursive: true })
    let canonicalPath
    try {
      const metadata = await fsAdapter.stat(entry.path)
      canonicalPath = await fsAdapter.realpath(entry.path)
      if (metadata?.dev !== undefined && metadata?.ino !== undefined) {
        const inodeKey = `${String(metadata.dev)}:${String(metadata.ino)}`
        const prior = inodeOwners.get(inodeKey)
        if (prior && !sameOutputPath(prior.path, entry.path)) {
          throw new TypeError(
            `transaction namespace inode alias between ${prior.label} and ${entry.label}`,
          )
        }
        inodeOwners.set(inodeKey, entry)
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
      canonicalPath = join(await fsAdapter.realpath(parent), basename(entry.path))
    }
    const canonicalKey = comparableOutputPath(canonicalPath)
    const prior = canonicalOwners.get(canonicalKey)
    if (prior && !sameOutputPath(prior.path, entry.path)) {
      throw new TypeError(
        `transaction namespace realpath alias between ${prior.label} and ${entry.label}`,
      )
    }
    canonicalOwners.set(canonicalKey, entry)
  }
}

async function outputExists(filePath, fsAdapter) {
  try {
    await fsAdapter.access(filePath)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

async function writeOutputBytes(filePath, bytes, fsAdapter, onOpen) {
  let handle
  try {
    handle = await fsAdapter.open(filePath, 'wx')
    onOpen?.()
    let offset = 0
    while (offset < bytes.length) {
      const { bytesWritten } = await handle.write(
        bytes,
        offset,
        bytes.length - offset,
        offset,
      )
      if (!Number.isSafeInteger(bytesWritten) || bytesWritten <= 0) {
        throw new Error(`staging write made no progress for ${filePath}`)
      }
      offset += bytesWritten
    }
    await handle.sync()
    await handle.close()
    handle = undefined
  } finally {
    if (handle) {
      try {
        await handle.close()
      } catch {
        // Preserve the staging failure that triggered cleanup.
      }
    }
  }
}

// Immutable owner and journal helpers are defined below.

const TRANSACTION_OWNER_KIND = 'VISLEXICON_CURATION_OWNER'
const TRANSACTION_RECOVERY_CLAIM_KIND = 'VISLEXICON_CURATION_RECOVERY_CLAIM'
const TRANSACTION_SCHEMA_VERSION = 1
const TRANSACTION_STATES = new Set(['ACTIVE', 'COMMITTED', 'RECOVERY_REQUIRED'])
const OPERATION_STATES = new Set([
  'PENDING',
  'STAGED',
  'BACKUP_INTENT',
  'BACKED_UP',
  'PUBLISH_INTENT',
  'PUBLISHED',
  'ROLLED_BACK',
])

function transactionFs(overrides) {
  const supplied = overrides && typeof overrides === 'object' ? overrides : {}
  return {
    access: supplied.access ?? access,
    mkdir: supplied.mkdir ?? mkdir,
    open: supplied.open ?? open,
    readFile: supplied.readFile ?? readFile,
    readdir: overrides == null ? readdir : supplied.readdir,
    realpath: supplied.realpath ?? realpath,
    rename: supplied.rename ?? rename,
    rm: supplied.rm ?? rm,
    stat: supplied.stat ?? stat,
  }
}

function safeRunId(value) {
  return (
    typeof value === 'string' &&
    /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/u.test(value)
  )
}

function selectedRunId(option) {
  const value = typeof option === 'function'
    ? option()
    : (option ?? randomUUID())
  if (!safeRunId(value)) {
    throw new TypeError('transaction runId must be one safe ASCII path segment')
  }
  return value
}

function sameOutputPath(left, right) {
  return comparableOutputPath(left) === comparableOutputPath(right)
}

function normalizedProtectedPaths(protectedPaths) {
  if (protectedPaths == null) return []
  if (!Array.isArray(protectedPaths)) {
    throw new TypeError('protectedPaths must be an array of filesystem paths')
  }
  return protectedPaths.map((protectedPath, index) => {
    if (typeof protectedPath !== 'string' || protectedPath.length === 0) {
      throw new TypeError(`protected path ${index} must be a non-empty string`)
    }
    return resolve(protectedPath)
  })
}

function normalizedTransactionTargets(targets) {
  if (!Array.isArray(targets) || targets.length === 0) {
    throw new TypeError('transaction targets must be a non-empty array')
  }
  return targets.map((target, index) => {
    if (
      !target ||
      (target.kind !== 'bundle' && target.kind !== 'queue') ||
      typeof target.targetPath !== 'string' ||
      target.targetPath.length === 0 ||
      !(Buffer.isBuffer(target.bytes) || target.bytes instanceof Uint8Array)
    ) {
      throw new TypeError(`transaction target ${index} is invalid`)
    }
    return {
      kind: target.kind,
      targetPath: resolve(target.targetPath),
      bytes: Buffer.from(target.bytes),
    }
  })
}

function operationPaths(target, runId, index) {
  const targetName = basename(target.targetPath)
  const parent = dirname(target.targetPath)
  return {
    tempPath: join(parent, `${targetName}.vislexicon-v2.${runId}.${index}.tmp`),
    backupPath: join(parent, `${targetName}.vislexicon-v2.${runId}.${index}.bak`),
  }
}

function transactionOperations(targets, runId) {
  return targets.map((target, index) => ({
    index,
    kind: target.kind,
    targetPath: target.targetPath,
    ...operationPaths(target, runId, index),
    existed: false,
    backupActive: false,
    published: false,
    operation: 'PENDING',
    expectedSha256: createHash('sha256').update(target.bytes).digest('hex'),
    expectedBytes: target.bytes.length,
  }))
}

function transactionOwner(lockPath, runId, targets) {
  return {
    schemaVersion: TRANSACTION_SCHEMA_VERSION,
    kind: TRANSACTION_OWNER_KIND,
    runId,
    pid: process.pid,
    startedAt: new Date().toISOString(),
    journalPrefix: `journal.${runId}.`,
    lockPath,
    targets: targets.map(({ targetPath }) => targetPath),
  }
}

function errorText(error) {
  if (error instanceof Error) return `${error.name}: ${error.message}`
  return String(error)
}

function contextualError(label, error) {
  return new Error(`${label}: ${errorText(error)}`, { cause: error })
}

function transactionSnapshot(owner, operations, seq, state, errors = []) {
  const body = {
    schemaVersion: TRANSACTION_SCHEMA_VERSION,
    runId: owner.runId,
    seq,
    state,
    decision: state === 'COMMITTED' ? 'COMMITTED' : 'PRE_COMMIT',
    owner: {
      pid: owner.pid,
      startedAt: owner.startedAt,
    },
    operations: structuredClone(operations),
    errors: errors.map(errorText),
  }
  return {
    ...body,
    checksum: createHash('sha256').update(JSON.stringify(body)).digest('hex'),
  }
}

function journalPath(lockPath, runId, seq) {
  return join(
    dirname(lockPath),
    `journal.${runId}.${String(seq).padStart(8, '0')}.json`,
  )
}

function recoveryClaimPath(lockPath) {
  return `${lockPath}.recovery`
}

function recoveryClaim(owner, lockPath, observedOwnerBytes) {
  return {
    schemaVersion: TRANSACTION_SCHEMA_VERSION,
    kind: TRANSACTION_RECOVERY_CLAIM_KIND,
    claimId: owner.runId,
    pid: owner.pid,
    startedAt: owner.startedAt,
    lockPath,
    ownerChecksum: createHash('sha256').update(observedOwnerBytes).digest('hex'),
  }
}

async function writeHandleBytes(handle, filePath, bytes) {
  let offset = 0
  while (offset < bytes.length) {
    const { bytesWritten } = await handle.write(
      bytes,
      offset,
      bytes.length - offset,
      offset,
    )
    if (!Number.isSafeInteger(bytesWritten) || bytesWritten <= 0) {
      throw new Error(`journal write made no progress for ${filePath}`)
    }
    offset += bytesWritten
  }
  if (typeof handle.truncate === 'function') await handle.truncate(bytes.length)
  await handle.sync()
}

async function recordTransactionState(context, state, errors = []) {
  if (context.immutableJournal) {
    context.seq += 1
    const filePath = journalPath(
      context.lockPath,
      context.owner.runId,
      context.seq,
    )
    const snapshot = transactionSnapshot(
      context.owner,
      context.operations,
      context.seq,
      state,
      errors,
    )
    await writeOutputBytes(filePath, Buffer.from(JSON.stringify(snapshot)), context.fs, () => {
      context.journalPaths.push(filePath)
    })
    return
  }

  const compatibilityJournal = {
    runId: context.owner.runId,
    pid: context.owner.pid,
    startedAt: context.owner.startedAt,
    state,
    targets: structuredClone(context.operations),
    errors: errors.map(errorText),
  }
  if (context.ownerHandle) {
    await writeHandleBytes(
      context.ownerHandle,
      context.lockPath,
      Buffer.from(JSON.stringify(compatibilityJournal)),
    )
  }
}

function assertExactKeys(value, expectedKeys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`)
  }
  const actual = Object.keys(value).sort()
  const expected = [...expectedKeys].sort()
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw new TypeError(`${label} schema contains unexpected or missing fields`)
  }
}

function isCanonicalTimestamp(value) {
  if (typeof value !== 'string') return false
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value
}

function validateOwner(owner, lockPath, targets) {
  assertExactKeys(owner, [
    'schemaVersion',
    'kind',
    'runId',
    'pid',
    'startedAt',
    'journalPrefix',
    'lockPath',
    'targets',
  ], 'transaction owner')
  if (
    owner.schemaVersion !== TRANSACTION_SCHEMA_VERSION ||
    owner.kind !== TRANSACTION_OWNER_KIND ||
    !safeRunId(owner.runId) ||
    !Number.isSafeInteger(owner.pid) ||
    owner.pid <= 0 ||
    !isCanonicalTimestamp(owner.startedAt) ||
    owner.journalPrefix !== `journal.${owner.runId}.` ||
    typeof owner.lockPath !== 'string' ||
    !sameOutputPath(owner.lockPath, lockPath) ||
    !Array.isArray(owner.targets) ||
    owner.targets.length !== targets.length
  ) {
    throw new TypeError('transaction owner schema, path, or runId is unsafe')
  }
  for (const [index, targetPath] of owner.targets.entries()) {
    if (
      typeof targetPath !== 'string' ||
      !sameOutputPath(targetPath, targets[index].targetPath)
    ) {
      throw new TypeError('transaction owner contains a path outside the allowed targets')
    }
  }
  return owner
}

function validateOperation(operation, target, runId, index) {
  assertExactKeys(operation, [
    'index',
    'kind',
    'targetPath',
    'tempPath',
    'backupPath',
    'existed',
    'backupActive',
    'published',
    'operation',
    'expectedSha256',
    'expectedBytes',
  ], `transaction operation ${index}`)
  const expectedPaths = operationPaths(target, runId, index)
  const expectedHash = createHash('sha256').update(target.bytes).digest('hex')
  if (
    operation.index !== index ||
    operation.kind !== target.kind ||
    typeof operation.targetPath !== 'string' ||
    !sameOutputPath(operation.targetPath, target.targetPath) ||
    typeof operation.tempPath !== 'string' ||
    !sameOutputPath(operation.tempPath, expectedPaths.tempPath) ||
    typeof operation.backupPath !== 'string' ||
    !sameOutputPath(operation.backupPath, expectedPaths.backupPath) ||
    typeof operation.existed !== 'boolean' ||
    typeof operation.backupActive !== 'boolean' ||
    typeof operation.published !== 'boolean' ||
    !OPERATION_STATES.has(operation.operation) ||
    operation.expectedSha256 !== expectedHash ||
    operation.expectedBytes !== target.bytes.length
  ) {
    throw new TypeError(`transaction journal operation ${index} has an unsafe path or schema`)
  }
  if (
    operation.backupActive && !operation.existed ||
    operation.operation === 'BACKUP_INTENT' &&
      (!operation.backupActive || operation.published) ||
    operation.operation === 'BACKED_UP' &&
      (!operation.backupActive || operation.published) ||
    operation.operation === 'PUBLISH_INTENT' && !operation.published ||
    operation.operation === 'PUBLISHED' && !operation.published ||
    operation.existed && operation.published && !operation.backupActive
  ) {
    throw new TypeError(`transaction journal operation ${index} has inconsistent state`)
  }
  return operation
}

function snapshotBody(snapshot) {
  return {
    schemaVersion: snapshot.schemaVersion,
    runId: snapshot.runId,
    seq: snapshot.seq,
    state: snapshot.state,
    decision: snapshot.decision,
    owner: snapshot.owner,
    operations: snapshot.operations,
    errors: snapshot.errors,
  }
}

function hasValidSnapshotChecksum(snapshot) {
  if (
    !snapshot ||
    typeof snapshot !== 'object' ||
    Array.isArray(snapshot) ||
    !/^[a-f0-9]{64}$/u.test(snapshot.checksum ?? '')
  ) {
    return false
  }
  const checksum = createHash('sha256')
    .update(JSON.stringify(snapshotBody(snapshot)))
    .digest('hex')
  return checksum === snapshot.checksum
}

function validateSnapshot(snapshot, owner, targets, expectedSeq) {
  assertExactKeys(snapshot, [
    'schemaVersion',
    'runId',
    'seq',
    'state',
    'decision',
    'owner',
    'operations',
    'errors',
    'checksum',
  ], 'transaction journal snapshot')
  assertExactKeys(snapshot.owner, ['pid', 'startedAt'], 'transaction journal owner')
  if (
    snapshot.schemaVersion !== TRANSACTION_SCHEMA_VERSION ||
    snapshot.runId !== owner.runId ||
    snapshot.seq !== expectedSeq ||
    !Number.isSafeInteger(snapshot.seq) ||
    snapshot.seq <= 0 ||
    !TRANSACTION_STATES.has(snapshot.state) ||
    snapshot.decision !== (snapshot.state === 'COMMITTED' ? 'COMMITTED' : 'PRE_COMMIT') ||
    snapshot.owner.pid !== owner.pid ||
    snapshot.owner.startedAt !== owner.startedAt ||
    !Array.isArray(snapshot.operations) ||
    snapshot.operations.length !== targets.length ||
    !Array.isArray(snapshot.errors) ||
    snapshot.errors.some((error) => typeof error !== 'string')
  ) {
    throw new TypeError('transaction journal snapshot schema, owner, or runId is unsafe')
  }
  snapshot.operations.forEach((operation, index) => {
    validateOperation(operation, targets[index], owner.runId, index)
  })
  if (
    snapshot.state === 'COMMITTED' &&
    snapshot.operations.some((operation) => !operation.published)
  ) {
    throw new TypeError('committed transaction journal is missing a published operation')
  }
  return snapshot
}

function parseJsonBytes(bytes, label) {
  try {
    return JSON.parse(Buffer.from(bytes).toString('utf8'))
  } catch (error) {
    throw new TypeError(`${label} is not valid JSON`, { cause: error })
  }
}

function escapedRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

async function immutableRecoveryRecord(owner, lockPath, targets, fsAdapter) {
  const directory = dirname(lockPath)
  const names = await fsAdapter.readdir(directory)
  const escapedRunId = escapedRegExp(owner.runId)
  const snapshotPattern = new RegExp(
    `^journal\\.${escapedRunId}\\.(\\d{8})\\.json$`,
    'u',
  )
  const artifactPattern = new RegExp(
    `^journal\\.${escapedRunId}\\.\\d{8}\\.json(?:\\.tmp(?:-[A-Za-z0-9_-]+)?)?$`,
    'u',
  )
  const candidates = []
  const artifactPaths = []
  for (const name of names) {
    if (typeof name !== 'string' || basename(name) !== name) continue
    if (artifactPattern.test(name)) artifactPaths.push(join(directory, name))
    const match = snapshotPattern.exec(name)
    if (match) candidates.push({
      filePath: join(directory, name),
      seq: Number.parseInt(match[1], 10),
    })
  }
  candidates.sort((left, right) => right.seq - left.seq)

  for (const candidate of candidates) {
    let snapshot
    try {
      snapshot = parseJsonBytes(
        await fsAdapter.readFile(candidate.filePath),
        'transaction journal snapshot',
      )
    } catch {
      continue
    }
    if (!hasValidSnapshotChecksum(snapshot)) continue
    validateSnapshot(snapshot, owner, targets, candidate.seq)
    return {
      artifactPaths,
      operations: snapshot.operations,
      seq: candidate.seq,
      state: snapshot.state,
    }
  }
  if (candidates.length > 0 || artifactPaths.length > 0) {
    throw new TypeError('transaction journal has no complete valid checksum snapshot')
  }
  return null
}

function validateLegacyRecoveryRecord(record, targets) {
  if (
    !record ||
    typeof record !== 'object' ||
    Array.isArray(record) ||
    !safeRunId(record.runId) ||
    !Number.isSafeInteger(record.pid) ||
    record.pid <= 0 ||
    !isCanonicalTimestamp(record.startedAt) ||
    !TRANSACTION_STATES.has(record.state) ||
    !Array.isArray(record.targets) ||
    !Array.isArray(record.errors) ||
    record.errors.some((error) => typeof error !== 'string')
  ) {
    throw new TypeError('legacy transaction lock journal is unsafe')
  }
  if (record.targets.length !== 0 && record.targets.length !== targets.length) {
    throw new TypeError('legacy transaction lock contains targets outside the allowed target set')
  }
  record.targets.forEach((operation, index) => {
    validateOperation(operation, targets[index], record.runId, index)
  })
  return record
}

async function defaultIsProcessAlive(pid) {
  if (pid === process.pid) return true
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    if (error?.code === 'ESRCH') return false
    if (error?.code === 'EPERM') return true
    throw error
  }
}

async function readOptionalBytes(filePath, fsAdapter) {
  try {
    return Buffer.from(await fsAdapter.readFile(filePath))
  } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

function bytesMatchOperation(bytes, operation) {
  return Boolean(bytes) &&
    bytes.length === operation.expectedBytes &&
    createHash('sha256').update(bytes).digest('hex') === operation.expectedSha256
}

async function preflightRollback(operations, fsAdapter) {
  const recoveredOperations = []
  for (const operation of operations) {
    const [targetBytes, backupBytes] = await Promise.all([
      readOptionalBytes(operation.targetPath, fsAdapter),
      readOptionalBytes(operation.backupPath, fsAdapter),
    ])
    if (operation.backupActive) {
      if (!backupBytes) {
        if (targetBytes && !bytesMatchOperation(targetBytes, operation)) {
          recoveredOperations.push(operation)
          continue
        }
        throw new Error(`recovery backup is missing for ${operation.targetPath}`)
      }
      if (targetBytes && !bytesMatchOperation(targetBytes, operation)) {
        throw new Error(`unsafe changed target blocks rollback: ${operation.targetPath}`)
      }
    } else if (operation.published && !operation.existed) {
      if (targetBytes && !bytesMatchOperation(targetBytes, operation)) {
        throw new Error(`unsafe changed target blocks rollback: ${operation.targetPath}`)
      }
    }
  }
  for (const operation of recoveredOperations) {
    operation.backupActive = false
    operation.published = false
    operation.operation = 'ROLLED_BACK'
  }
}

async function removeKnownPath(filePath, fsAdapter) {
  try {
    await fsAdapter.rm(filePath, { force: true })
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

async function rollbackOnce(operations, fsAdapter, cleanupPendingTemps = false) {
  const errors = []
  try {
    await preflightRollback(operations, fsAdapter)
  } catch (error) {
    return [contextualError('rollback preflight failed', error)]
  }
  for (const operation of [...operations].reverse()) {
    if (operation.backupActive) {
      let targetRemoved = false
      try {
        await removeKnownPath(operation.targetPath, fsAdapter)
        targetRemoved = true
      } catch (error) {
        errors.push(contextualError(`rollback target cleanup ${operation.targetPath}`, error))
      }
      if (targetRemoved) {
        try {
          await fsAdapter.rename(operation.backupPath, operation.targetPath)
          operation.backupActive = false
          operation.published = false
          operation.operation = 'ROLLED_BACK'
        } catch (error) {
          errors.push(contextualError(`rollback restore ${operation.targetPath}`, error))
        }
      }
    } else if (operation.published && !operation.existed) {
      try {
        await removeKnownPath(operation.targetPath, fsAdapter)
        operation.published = false
        operation.operation = 'ROLLED_BACK'
      } catch (error) {
        errors.push(contextualError(`rollback remove ${operation.targetPath}`, error))
      }
    }
    if (cleanupPendingTemps || operation.operation !== 'PENDING') {
      try {
        await removeKnownPath(operation.tempPath, fsAdapter)
      } catch (error) {
        errors.push(contextualError(`rollback temp cleanup ${operation.tempPath}`, error))
      }
    }
  }
  return errors
}

async function rollbackTwice(operations, fsAdapter, cleanupPendingTemps = false) {
  let errors = await rollbackOnce(operations, fsAdapter, cleanupPendingTemps)
  if (errors.length > 0) {
    errors = await rollbackOnce(operations, fsAdapter, cleanupPendingTemps)
  }
  return errors
}

async function preflightCommittedCleanup(operations, fsAdapter) {
  for (const operation of operations) {
    const targetBytes = await readOptionalBytes(operation.targetPath, fsAdapter)
    if (!bytesMatchOperation(targetBytes, operation)) {
      throw new Error(`committed target bytes do not match journal: ${operation.targetPath}`)
    }
  }
}

async function cleanupPaths(paths, fsAdapter, label) {
  const errors = []
  const seen = new Set()
  for (const filePath of paths) {
    const key = comparableOutputPath(filePath)
    if (seen.has(key)) continue
    seen.add(key)
    try {
      await removeKnownPath(filePath, fsAdapter)
    } catch (error) {
      errors.push(contextualError(`${label} ${filePath}`, error))
    }
  }
  return errors
}

async function cleanupOperationArtifacts(operations, fsAdapter) {
  return cleanupPaths(
    operations.flatMap((operation) => [
      ...(operation.operation === 'PENDING' ? [] : [operation.tempPath]),
      ...(operation.backupActive ? [operation.backupPath] : []),
    ]),
    fsAdapter,
    'transaction temp/backup cleanup failed for',
  )
}

async function persistRecoveryState(context, state, errors) {
  try {
    await recordTransactionState(context, state, errors)
    return []
  } catch (error) {
    return [contextualError('failed to persist recovery journal', error)]
  }
}

async function closeCompatibilityOwner(context) {
  if (!context.ownerHandle) return []
  const handle = context.ownerHandle
  context.ownerHandle = undefined
  try {
    await handle.close()
    return []
  } catch (error) {
    return [contextualError('transaction owner close failed', error)]
  }
}

async function recoverRecordedTransaction(record, context) {
  if (record.state === 'COMMITTED') {
    try {
      await preflightCommittedCleanup(record.operations, context.fs)
    } catch (error) {
      throw new Error(`RECOVERY_INCOMPLETE: ${errorText(error)}`, { cause: error })
    }
  } else {
    const rollbackErrors = await rollbackTwice(record.operations, context.fs, true)
    if (rollbackErrors.length > 0) {
      const persistenceErrors = await persistRecoveryState(
        context,
        'RECOVERY_REQUIRED',
        rollbackErrors,
      )
      throw new AggregateError(
        [...rollbackErrors, ...persistenceErrors],
        'RECOVERY_INCOMPLETE: rollback remains incomplete; RECOVERY_REQUIRED',
      )
    }
  }

  const operationCleanupErrors = await cleanupOperationArtifacts(
    record.operations,
    context.fs,
  )
  if (operationCleanupErrors.length > 0) {
    const state = record.state === 'COMMITTED' ? 'COMMITTED' : 'RECOVERY_REQUIRED'
    const persistenceErrors = await persistRecoveryState(
      context,
      state,
      operationCleanupErrors,
    )
    throw new AggregateError(
      [...operationCleanupErrors, ...persistenceErrors],
      'RECOVERY_INCOMPLETE: transaction artifact cleanup failed',
    )
  }

  const journalCleanupErrors = await cleanupPaths(
    record.artifactPaths,
    context.fs,
    'transaction journal cleanup failed for',
  )
  if (journalCleanupErrors.length > 0) {
    const state = record.state === 'COMMITTED' ? 'COMMITTED' : 'RECOVERY_REQUIRED'
    const persistenceErrors = await persistRecoveryState(
      context,
      state,
      journalCleanupErrors,
    )
    throw new AggregateError(
      [...journalCleanupErrors, ...persistenceErrors],
      'RECOVERY_INCOMPLETE: immutable journal cleanup failed',
    )
  }

  try {
    await removeKnownPath(context.lockPath, context.fs)
  } catch (error) {
    const persistenceErrors = await persistRecoveryState(
      context,
      record.state === 'COMMITTED' ? 'COMMITTED' : 'RECOVERY_REQUIRED',
      [error],
    )
    throw new AggregateError(
      [contextualError('recovered lock removal failed', error), ...persistenceErrors],
      'RECOVERY_INCOMPLETE: recovered transaction lock removal failed',
    )
  }
}

async function recoverExistingLock(context, isOwnerAlive, expectedLockBytes) {
  const actualLockBytes = Buffer.from(await context.fs.readFile(context.lockPath))
  if (expectedLockBytes && !actualLockBytes.equals(expectedLockBytes)) {
    throw new Error('transaction owner changed while the recovery claim was held')
  }
  let lockRecord
  try {
    lockRecord = parseJsonBytes(actualLockBytes, 'transaction lock')
  } catch (error) {
    throw new Error(
      'RECOVERY_INCOMPLETE: owner lock is empty, truncated, corrupt, or invalid JSON; evidence was preserved',
      { cause: error },
    )
  }
  if (lockRecord.kind === TRANSACTION_OWNER_KIND) {
    const owner = validateOwner(lockRecord, context.lockPath, context.targets)
    if (await isOwnerAlive(owner)) {
      throw new Error('live transaction owner already holds the concurrent publication lock')
    }
    if (typeof context.fs.readdir !== 'function') {
      throw new Error('RECOVERY_INCOMPLETE: immutable journal recovery requires readdir')
    }
    const recoveryRecord = await immutableRecoveryRecord(
      owner,
      context.lockPath,
      context.targets,
      context.fs,
    )
    if (!recoveryRecord) {
      const possibleArtifacts = context.targets.flatMap((target, index) => {
        const paths = operationPaths(target, owner.runId, index)
        return [paths.tempPath, paths.backupPath]
      })
      for (const filePath of possibleArtifacts) {
        if (await outputExists(filePath, context.fs)) {
          throw new Error('RECOVERY_INCOMPLETE: owner has artifacts but no valid journal')
        }
      }
      try {
        await removeKnownPath(context.lockPath, context.fs)
      } catch (error) {
        throw new Error('RECOVERY_INCOMPLETE: stale owner lock removal failed', {
          cause: error,
        })
      }
      return 'CLEARED_EMPTY_OWNER'
    }
    const recoveryContext = {
      ...context,
      immutableJournal: true,
      journalPaths: [...recoveryRecord.artifactPaths],
      operations: recoveryRecord.operations,
      owner,
      seq: recoveryRecord.seq,
    }
    await recoverRecordedTransaction(recoveryRecord, recoveryContext)
    return 'RECOVERED_TRANSACTION'
  }

  const legacy = validateLegacyRecoveryRecord(lockRecord, context.targets)
  if (await isOwnerAlive(legacy)) {
    throw new Error('live transaction owner already holds the concurrent publication lock')
  }
  if (legacy.targets.length === 0) {
    try {
      await removeKnownPath(context.lockPath, context.fs)
    } catch (error) {
      throw new Error('RECOVERY_INCOMPLETE: stale lock removal failed', { cause: error })
    }
    return 'CLEARED_EMPTY_OWNER'
  }
  const recoveryContext = {
    ...context,
    immutableJournal: false,
    journalPaths: [],
    operations: legacy.targets,
    owner: {
      runId: legacy.runId,
      pid: legacy.pid,
      startedAt: legacy.startedAt,
    },
    seq: 0,
  }
  await recoverRecordedTransaction({
    artifactPaths: [],
    operations: legacy.targets,
    state: legacy.state,
  }, recoveryContext)
  return 'RECOVERED_TRANSACTION'
}

async function releaseRecoveryClaim(context, claim) {
  let actualBytes
  try {
    actualBytes = Buffer.from(await context.fs.readFile(context.claimPath))
  } catch (error) {
    throw new Error('RECOVERY_INCOMPLETE: recovery claim disappeared before release', {
      cause: error,
    })
  }
  if (!actualBytes.equals(claim.bytes)) {
    throw new Error('RECOVERY_INCOMPLETE: recovery claim identity changed before release')
  }
  try {
    await removeKnownPath(context.claimPath, context.fs)
  } catch (error) {
    throw new Error('RECOVERY_INCOMPLETE: recovery claim removal failed', {
      cause: error,
    })
  }
}

async function acquireRecoveryClaim(context) {
  const observedOwnerBytes = Buffer.from(await context.fs.readFile(context.lockPath))
  const record = recoveryClaim(
    context.owner,
    context.lockPath,
    observedOwnerBytes,
  )
  const bytes = Buffer.from(JSON.stringify(record))
  let created = false
  try {
    await writeOutputBytes(context.claimPath, bytes, context.fs, () => {
      created = true
    })
  } catch (error) {
    if (!created && error?.code === 'EEXIST') {
      throw new Error(
        'RECOVERY_INCOMPLETE: recovery claim already exists; it may be live, stale, or corrupt',
        { cause: error },
      )
    }
    if (created) {
      try {
        await removeKnownPath(context.claimPath, context.fs)
      } catch (cleanupError) {
        throw new AggregateError(
          [error, cleanupError],
          'RECOVERY_INCOMPLETE: failed recovery claim creation could not be cleaned',
        )
      }
    }
    throw error
  }
  const confirmedOwnerBytes = Buffer.from(await context.fs.readFile(context.lockPath))
  if (!confirmedOwnerBytes.equals(observedOwnerBytes)) {
    await releaseRecoveryClaim(context, { bytes })
    throw new Error('transaction owner changed during recovery claim acquisition')
  }
  return { bytes, observedOwnerBytes }
}

async function acquireTransactionOwner(context, isOwnerAlive) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let created = false
    context.ownerCreated = false
    let ownerHandle
    try {
      ownerHandle = await context.fs.open(context.lockPath, 'wx')
      created = true
      context.ownerCreated = true
      await writeHandleBytes(
        ownerHandle,
        context.lockPath,
        Buffer.from(JSON.stringify(context.owner)),
      )
      if (context.immutableJournal) {
        await ownerHandle.close()
      } else {
        context.ownerHandle = ownerHandle
      }
      ownerHandle = undefined
      return
    } catch (error) {
      if (ownerHandle) {
        try {
          await ownerHandle.close()
        } catch {
          // Preserve the owner creation failure.
        }
      }
      if (created) {
        throw error
      }
      if (error?.code !== 'EEXIST') throw error
    }
    const claim = await acquireRecoveryClaim(context)
    let result
    let releaseClaim = false
    try {
      result = await recoverExistingLock(
        context,
        isOwnerAlive,
        claim.observedOwnerBytes,
      )
      if (result === 'CLEARED_EMPTY_OWNER') {
        let ownerHandle
        try {
          ownerHandle = await context.fs.open(context.lockPath, 'wx')
          context.ownerCreated = true
          await writeHandleBytes(
            ownerHandle,
            context.lockPath,
            Buffer.from(JSON.stringify(context.owner)),
          )
          if (context.immutableJournal) {
            await ownerHandle.close()
          } else {
            context.ownerHandle = ownerHandle
          }
          ownerHandle = undefined
        } finally {
          if (ownerHandle) {
            try {
              await ownerHandle.close()
            } catch {
              // Preserve the owner acquisition error.
            }
          }
        }
      }
      releaseClaim = true
    } catch (error) {
      const message = errorText(error)
      if (
        /live transaction owner/iu.test(message) ||
        /owner changed/iu.test(message)
      ) {
        releaseClaim = true
      }
      throw error
    } finally {
      if (releaseClaim) await releaseRecoveryClaim(context, claim)
    }
    if (result === 'RECOVERED_TRANSACTION') {
      throw new Error('Recovered stale transaction; rerun publication')
    }
    if (result === 'CLEARED_EMPTY_OWNER') {
      return
    }
  }
  throw new Error('concurrent publication lock changed repeatedly; retry later')
}

async function cleanupAfterAcquisitionFailure(context, primaryError) {
  const cleanupErrors = await cleanupOperationArtifacts(context.operations, context.fs)
  try {
    await removeKnownPath(context.lockPath, context.fs)
  } catch (error) {
    cleanupErrors.push(contextualError('transaction lock cleanup failed', error))
  }
  if (cleanupErrors.length > 0) {
    throw new AggregateError(
      [primaryError, ...cleanupErrors],
      'Transaction failed with multiple temp/lock cleanup errors',
    )
  }
  throw primaryError
}

async function handlePreCommitFailure(context, primaryError) {
  const rollbackErrors = await rollbackTwice(context.operations, context.fs)
  if (rollbackErrors.length > 0) {
    const persistenceErrors = await persistRecoveryState(
      context,
      'RECOVERY_REQUIRED',
      [primaryError, ...rollbackErrors],
    )
    const ownerCloseErrors = await closeCompatibilityOwner(context)
    throw new AggregateError(
      [primaryError, ...rollbackErrors, ...persistenceErrors, ...ownerCloseErrors],
      'Transaction rollback incomplete; RECOVERY_REQUIRED',
    )
  }

  const ownerCloseErrors = await closeCompatibilityOwner(context)
  const operationCleanupErrors = await cleanupOperationArtifacts(
    context.operations,
    context.fs,
  )
  if (ownerCloseErrors.length > 0 || operationCleanupErrors.length > 0) {
    const persistenceErrors = await persistRecoveryState(
      context,
      'RECOVERY_REQUIRED',
      [primaryError, ...ownerCloseErrors, ...operationCleanupErrors],
    )
    throw new AggregateError(
      [
        primaryError,
        ...ownerCloseErrors,
        ...operationCleanupErrors,
        ...persistenceErrors,
      ],
      'Transaction failed with multiple temp/backup cleanup errors; RECOVERY_REQUIRED',
    )
  }

  const journalCleanupErrors = await cleanupPaths(
    context.journalPaths,
    context.fs,
    'transaction journal cleanup failed for',
  )
  if (journalCleanupErrors.length > 0) {
    const persistenceErrors = await persistRecoveryState(
      context,
      'RECOVERY_REQUIRED',
      [primaryError, ...journalCleanupErrors],
    )
    throw new AggregateError(
      [primaryError, ...journalCleanupErrors, ...persistenceErrors],
      'Transaction failed with multiple journal cleanup errors; RECOVERY_REQUIRED',
    )
  }

  try {
    await removeKnownPath(context.lockPath, context.fs)
  } catch (error) {
    const persistenceErrors = await persistRecoveryState(
      context,
      'RECOVERY_REQUIRED',
      [primaryError, error],
    )
    throw new AggregateError(
      [primaryError, contextualError('transaction lock cleanup failed', error), ...persistenceErrors],
      'Transaction failed and lock cleanup was incomplete; RECOVERY_REQUIRED',
    )
  }
  throw primaryError
}

async function finishCommittedTransaction(context) {
  const ownerCloseErrors = await closeCompatibilityOwner(context)
  const operationCleanupErrors = await cleanupOperationArtifacts(
    context.operations,
    context.fs,
  )
  const journalCleanupErrors = await cleanupPaths(
    context.journalPaths,
    context.fs,
    'transaction journal cleanup failed for',
  )
  const cleanupErrors = [
    ...ownerCloseErrors,
    ...operationCleanupErrors,
    ...journalCleanupErrors,
  ]
  if (cleanupErrors.length > 0) {
    if (!context.immutableJournal) {
      try {
        await removeKnownPath(context.lockPath, context.fs)
      } catch (error) {
        cleanupErrors.push(contextualError('committed transaction lock cleanup failed', error))
      }
      throw new AggregateError(
        cleanupErrors,
        'Committed transaction has multiple temp/journal/lock cleanup errors',
      )
    }
    const persistenceErrors = await persistRecoveryState(
      context,
      'COMMITTED',
      cleanupErrors,
    )
    throw new AggregateError(
      [...cleanupErrors, ...persistenceErrors],
      'Committed transaction cleanup incomplete; RECOVERY_REQUIRED',
    )
  }

  try {
    await removeKnownPath(context.lockPath, context.fs)
  } catch (error) {
    const persistenceErrors = await persistRecoveryState(
      context,
      'COMMITTED',
      [error],
    )
    throw new AggregateError(
      [contextualError('committed transaction lock cleanup failed', error), ...persistenceErrors],
      'Committed transaction lock cleanup incomplete; RECOVERY_REQUIRED',
    )
  }
}

export async function publishOutputTransaction(targets, options = {}) {
  const normalizedTargets = normalizedTransactionTargets(targets)
  const fsAdapter = transactionFs(options.fs)
  if (typeof fsAdapter.readdir !== 'function') {
    throw new TypeError('immutable transaction journal requires a readdir-capable fs adapter')
  }
  const lockPath = resolve(options.lockPath)
  const protectedPaths = normalizedProtectedPaths(options.protectedPaths)
  if (normalizedTargets.some((target) => sameOutputPath(target.targetPath, lockPath))) {
    throw new TypeError('publication lock collides with an output target')
  }
  await assertDistinctOutputTargets(normalizedTargets, fsAdapter)
  await fsAdapter.mkdir(dirname(lockPath), { recursive: true })

  const runId = selectedRunId(options.runId)
  const owner = transactionOwner(lockPath, runId, normalizedTargets)
  const operations = transactionOperations(normalizedTargets, runId)
  const claimPath = recoveryClaimPath(lockPath)
  await assertTransactionNamespace({
    claimPath,
    fsAdapter,
    lockPath,
    protectedPaths,
    operations,
    runId,
    targets: normalizedTargets,
  })
  const context = {
    claimPath,
    fs: fsAdapter,
    immutableJournal: typeof fsAdapter.readdir === 'function',
    journalPaths: [],
    lockPath,
    operations,
    owner,
    ownerCreated: false,
    ownerHandle: undefined,
    seq: 0,
    targets: normalizedTargets,
  }
  const isProcessAlive = options.isProcessAlive ?? defaultIsProcessAlive
  const isOwnerAlive = options.isOwnerAlive ?? ((identity) => (
    isProcessAlive(identity.pid, {
      kind: identity.kind,
      runId: identity.runId,
      startedAt: identity.startedAt,
    })
  ))

  try {
    await acquireTransactionOwner(context, isOwnerAlive)
  } catch (error) {
    if (context.ownerCreated) {
      await cleanupAfterAcquisitionFailure(context, error)
    }
    throw error
  }

  try {
    for (const operation of operations) {
      operation.existed = await outputExists(operation.targetPath, fsAdapter)
    }
    await recordTransactionState(context, 'ACTIVE')

    for (const [index, operation] of operations.entries()) {
      await writeOutputBytes(
        operation.tempPath,
        normalizedTargets[index].bytes,
        fsAdapter,
        () => {
          operation.operation = 'STAGED'
        },
      )
      await recordTransactionState(context, 'ACTIVE')
    }

    await assertTransactionNamespace({
      claimPath,
      fsAdapter,
      lockPath,
      protectedPaths,
      operations,
      runId,
      targets: normalizedTargets,
    })

    for (const operation of operations) {
      if (operation.existed) {
        if (await outputExists(operation.backupPath, fsAdapter)) {
          throw new Error(`transaction backup already exists: ${operation.backupPath}`)
        }
        operation.backupActive = true
        operation.operation = 'BACKUP_INTENT'
        await recordTransactionState(context, 'ACTIVE')
        await fsAdapter.rename(operation.targetPath, operation.backupPath)
        operation.operation = 'BACKED_UP'
        await recordTransactionState(context, 'ACTIVE')
      }
      operation.published = true
      operation.operation = 'PUBLISH_INTENT'
      await recordTransactionState(context, 'ACTIVE')
      await fsAdapter.rename(operation.tempPath, operation.targetPath)
      operation.operation = 'PUBLISHED'
      await recordTransactionState(context, 'ACTIVE')
    }
    await recordTransactionState(context, 'COMMITTED')
  } catch (error) {
    await handlePreCommitFailure(context, error)
  }

  await finishCommittedTransaction(context)
}

export async function migrateCuratedSitesV2(options = {}) {
  const approvedDir = resolve(
    options.approvedDir ?? join(DEMO_ROOT, 'data', 'curation', 'approved'),
  )
  const publicRoot = resolve(options.publicRoot ?? join(DEMO_ROOT, 'public'))
  const queuePath = resolve(
    options.queuePath ?? join(DEMO_ROOT, 'data', 'curation', 'work-queue.json'),
  )
  const captureReviewManifest = options.captureReviewManifest ?? JSON.parse(
    await readFile(options.captureReviewPath ?? REVIEWED_CAPTURE_PATH, 'utf8'),
  )
  const provenance = validateReviewedProvenance(
    options.curatedSites ?? CURATED_SITES,
    captureReviewManifest,
    { semanticContract: options.semanticContract },
  )
  const curatedSites = provenance.curatedSites
  const bundles = []
  for (const site of curatedSites) {
    bundles.push(await bundleForSite(
      site,
      publicRoot,
      provenance.reviewById.get(site.id),
    ))
  }
  validateBundles(bundles)
  const queue = createWorkQueue(queueTasksForBundles(bundles))
  validateQueue(queue)
  const targets = [
    ...bundles.map((bundle) => ({
      kind: 'bundle',
      targetPath: join(approvedDir, `${bundle.siteId}.json`),
      bytes: Buffer.from(jsonBytes(bundle)),
    })),
    {
      kind: 'queue',
      targetPath: queuePath,
      bytes: Buffer.from(jsonBytes(queue)),
    },
  ]
  await publishOutputTransaction(targets, {
    fs: options.fs,
    lockPath: options.lockPath ?? join(dirname(queuePath), '.vislexicon-curation-v2.lock'),
    runId: options.runId,
  })

  return {
    siteIds: bundles.map(({ siteId }) => siteId),
    approvedDir,
    queuePath,
  }
}

export async function main() {
  const result = await migrateCuratedSitesV2()
  console.log(
    `Migrated ${result.siteIds.length} approved curation bundles and wrote ${result.queuePath}`,
  )
  return result
}

const invokedPath = process.argv[1]
if (invokedPath && pathToFileURL(resolve(invokedPath)).href === import.meta.url) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
