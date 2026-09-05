import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  parseAnimationVocabulary,
  parseGovukFrontmatter,
  parseMdxFrontmatter,
  parseOpenUiResearch,
  parseTypedArraySource,
  parseWaiPattern,
} from './visual-atlas/source-parsers.mjs'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIR, '..')
const DEFAULT_OUTPUT_DIR = resolve(DEMO_ROOT, 'data/visual-atlas-sources')
const RETRIEVED_AT = '2026-08-31'
const USER_AGENT = 'VisLexicon Visual Atlas collector/1.0 (+first-party public research)'

const SOURCE_MANIFEST = {
  'animations-dev': {
    name: 'animations.dev Animation Vocabulary',
    url: 'https://animations.dev/vocabulary',
    repository: 'emilkowalski/skills',
    branch: 'main',
    license: 'MIT',
    licenseUrl: 'https://github.com/emilkowalski/skills/blob/main/LICENSE',
    verifiedCount: 91,
  },
  'ai-interaction-atlas': {
    name: 'AI Interaction Atlas',
    url: 'https://ai-interaction.com/atlas',
    repository: 'quietloudlab/ai-interaction-atlas',
    branch: 'main',
    license: 'Apache-2.0',
    licenseUrl: 'https://github.com/quietloudlab/ai-interaction-atlas/blob/main/LICENSE',
    verifiedCount: 194,
    countedAtlas: false,
  },
  'assistant-ui': {
    name: 'assistant-ui Elements',
    url: 'https://www.assistant-ui.com/elements',
    repository: 'assistant-ui/assistant-ui',
    branch: 'main',
    license: 'MIT',
    licenseUrl: 'https://github.com/assistant-ui/assistant-ui/blob/main/LICENSE',
    verifiedCount: 120,
  },
  'govuk-design-system': {
    name: 'GOV.UK Design System',
    url: 'https://design-system.service.gov.uk/',
    repository: 'alphagov/govuk-design-system',
    branch: 'main',
    license: 'MIT',
    licenseUrl: 'https://github.com/alphagov/govuk-design-system/blob/main/LICENSE',
    verifiedCount: 72,
  },
  'ai-elements': {
    name: 'Vercel AI Elements',
    url: 'https://elements.ai-sdk.dev/components',
    repository: 'vercel/ai-elements',
    branch: 'main',
    license: 'Apache-2.0',
    licenseUrl: 'https://github.com/vercel/ai-elements/blob/main/LICENSE',
    verifiedCount: 48,
  },
  'prompt-kit': {
    name: 'Prompt Kit',
    url: 'https://www.prompt-kit.com/chat-ui',
    repository: 'ibelick/prompt-kit',
    branch: 'main',
    license: 'MIT',
    licenseUrl: 'https://github.com/ibelick/prompt-kit/blob/main/LICENSE',
    verifiedCount: 21,
  },
  loquix: {
    name: 'Loquix',
    url: 'https://loquix.dev/',
    repository: 'loquix-dev/loquix',
    branch: 'main',
    license: 'MIT',
    licenseUrl: 'https://github.com/loquix-dev/loquix/blob/main/LICENSE',
    verifiedCount: 53,
  },
  'wai-aria-apg': {
    name: 'WAI-ARIA Authoring Practices Guide',
    url: 'https://www.w3.org/WAI/ARIA/apg/patterns/',
    repository: 'w3c/aria-practices',
    branch: 'main',
    license: 'W3C Software and Document License',
    licenseUrl: 'https://github.com/w3c/aria-practices/blob/main/LICENSE.md',
    verifiedCount: 30,
  },
  'open-ui': {
    name: 'Open UI',
    url: 'https://open-ui.org/',
    repository: 'openui/open-ui',
    branch: 'main',
    license: 'W3C Software and Document License',
    licenseUrl: 'https://github.com/openui/open-ui/blob/main/LICENSE.md',
    verifiedCount: 31,
  },
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': USER_AGENT },
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return response.json()
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return response.text()
}

function rawUrl(repository, revision, path) {
  return `https://raw.githubusercontent.com/${repository}/${revision}/${path}`
}

function githubFileUrl(repository, revision, path) {
  return `https://github.com/${repository}/blob/${revision}/${path}`
}

async function repositoryContext(manifest) {
  const commit = await fetchJson(
    `https://api.github.com/repos/${manifest.repository}/commits/${manifest.branch}`,
  )
  const revision = commit.sha
  const tree = await fetchJson(
    `https://api.github.com/repos/${manifest.repository}/git/trees/${revision}?recursive=1`,
  )
  if (tree.truncated) throw new Error(`${manifest.repository} returned a truncated Git tree`)
  return { revision, paths: tree.tree.filter(({ type }) => type === 'blob').map(({ path }) => path) }
}

async function mapConcurrent(values, limit, mapper) {
  const results = new Array(values.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(values[index], index)
    }
  })
  await Promise.all(workers)
  return results
}

function sourceEnvelope(sourceId, manifest, revision, records) {
  if (records.length !== manifest.verifiedCount) {
    throw new Error(
      `${sourceId} count drift: expected ${manifest.verifiedCount}, received ${records.length}`,
    )
  }
  const ids = new Set()
  for (const record of records) {
    if (!record.sourceRecordId || !record.termEn || !record.sourceDefinition) {
      throw new Error(`${sourceId} emitted an incomplete raw record`)
    }
    if (ids.has(record.sourceRecordId)) {
      throw new Error(`${sourceId} emitted duplicate id ${record.sourceRecordId}`)
    }
    ids.add(record.sourceRecordId)
  }
  return {
    schemaVersion: 1,
    source: {
      id: sourceId,
      name: manifest.name,
      url: manifest.url,
      repository: `https://github.com/${manifest.repository}`,
      license: manifest.license,
      licenseUrl: manifest.licenseUrl,
      retrievedAt: RETRIEVED_AT,
      revision,
      verifiedCount: manifest.verifiedCount,
      countedAtlas: manifest.countedAtlas !== false,
    },
    records,
  }
}

async function collectAnimations() {
  const sourceId = 'animations-dev'
  const manifest = SOURCE_MANIFEST[sourceId]
  const { revision } = await repositoryContext(manifest)
  const sourcePath = 'skills/animation-vocabulary/SKILL.md'
  const markdown = await fetchText(rawUrl(manifest.repository, revision, sourcePath))
  const records = parseAnimationVocabulary(markdown).map((record) => ({
    ...record,
    sourceUrl: manifest.url,
    sourcePath,
    sourceMetadata: { category: record.sourceCategory },
  }))
  return sourceEnvelope(sourceId, manifest, revision, records)
}

const ATLAS_FILES = [
  ['data/ai_tasks.ts', 'AI_TASKS', 'ai-task'],
  ['data/human_tasks.ts', 'HUMAN_TASKS', 'human-action'],
  ['data/system_tasks.ts', 'SYSTEM_TASKS', 'system-operation'],
  ['data/artifacts.ts', 'DATA_ARTIFACTS', 'data-artifact'],
  ['data/constraints.ts', 'CONSTRAINTS', 'constraint'],
  ['data/touchpoints.ts', 'TOUCHPOINTS', 'touchpoint'],
]

async function collectAiInteractionAtlas() {
  const sourceId = 'ai-interaction-atlas'
  const manifest = SOURCE_MANIFEST[sourceId]
  const { revision } = await repositoryContext(manifest)
  const groups = await mapConcurrent(ATLAS_FILES, 6, async ([sourcePath, exportName, kind]) => {
    const source = await fetchText(rawUrl(manifest.repository, revision, sourcePath))
    return parseTypedArraySource(source, exportName).map((item) => ({
      sourceRecordId: item.id,
      termEn: item.name,
      sourceDefinition:
        item.elevator_pitch || item.description || item.ux_note || `${item.name} ${kind}`,
      sourceCategory: kind,
      sourceUrl: githubFileUrl(manifest.repository, revision, sourcePath),
      sourcePath,
      sourceMetadata: structuredClone(item),
      countedAtlas: false,
    }))
  })
  return sourceEnvelope(sourceId, manifest, revision, groups.flat())
}

function titleFromSlug(value) {
  return String(value)
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase('en-US') + word.slice(1))
    .join(' ')
}

async function collectAiElements() {
  const sourceId = 'ai-elements'
  const manifest = SOURCE_MANIFEST[sourceId]
  const { revision, paths } = await repositoryContext(manifest)
  const html = await fetchText('https://elements.ai-sdk.dev/')
  const slugs = [...html.matchAll(/href=["']\/components\/([^/"'#?]+)["']/g)]
    .map(([, slug]) => slug)
    .filter((slug, index, values) => values.indexOf(slug) === index)
    .sort()
  const records = await mapConcurrent(slugs, 8, async (slug) => {
    const item = await fetchJson(`https://elements.ai-sdk.dev/api/registry/${slug}`)
    const sourcePath = paths.find(
      (path) => path.startsWith('apps/docs/content/components/') && path.endsWith(`/${slug}.mdx`),
    )
    if (!sourcePath) throw new Error(`AI Elements source path missing for live component ${slug}`)
    return {
      sourceRecordId: slug,
      termEn: item.title || titleFromSlug(slug),
      sourceDefinition: item.description,
      sourceCategory: 'ai-component',
      sourceUrl: `https://elements.ai-sdk.dev/components/${slug}`,
      sourcePath,
      sourceMetadata: {
        registryType: item.type,
        dependencies: item.dependencies ?? [],
        registryDependencies: item.registryDependencies ?? [],
      },
    }
  })
  return sourceEnvelope(sourceId, manifest, revision, records)
}

async function collectPromptKit() {
  const sourceId = 'prompt-kit'
  const manifest = SOURCE_MANIFEST[sourceId]
  const { revision } = await repositoryContext(manifest)
  const registryUrl = 'https://www.prompt-kit.com/c/registry.json'
  const registry = await fetchJson(registryUrl)
  const records = registry.items
    .filter(({ type }) => type === 'registry:ui')
    .map((item) => ({
      sourceRecordId: item.name,
      termEn: item.title || titleFromSlug(item.name),
      sourceDefinition: item.description,
      sourceCategory: 'ai-component',
      sourceUrl: registryUrl,
      sourcePath: 'public/c/registry.json',
      sourceMetadata: { registryType: item.type },
    }))
  return sourceEnvelope(sourceId, manifest, revision, records)
}

async function collectLoquix() {
  const sourceId = 'loquix'
  const manifest = SOURCE_MANIFEST[sourceId]
  const { revision } = await repositoryContext(manifest)
  const sourcePath = 'packages/core/custom-elements.json'
  const customElements = JSON.parse(
    await fetchText(rawUrl(manifest.repository, revision, sourcePath)),
  )
  const records = customElements.modules.flatMap((module) =>
    (module.declarations ?? [])
      .filter(({ tagName }) => tagName)
      .map((declaration) => {
        const slug = declaration.tagName.replace(/^loquix-/, '')
        return {
          sourceRecordId: declaration.tagName,
          termEn: titleFromSlug(slug),
          sourceDefinition:
            declaration.description ||
            `${declaration.tagName} is a framework-agnostic Loquix Web Component for AI chat interfaces.`,
          sourceCategory: 'ai-web-component',
          sourceUrl: manifest.url,
          sourcePath: module.path || sourcePath,
          sourceMetadata: {
            tagName: declaration.tagName,
            className: declaration.name,
            summaryQuality: declaration.description ? 'source-description' : 'taxonomy-summary',
          },
        }
      }),
  )
  return sourceEnvelope(sourceId, manifest, revision, records)
}

async function collectWaiAriaApg() {
  const sourceId = 'wai-aria-apg'
  const manifest = SOURCE_MANIFEST[sourceId]
  const { revision, paths } = await repositoryContext(manifest)
  const patternPaths = paths
    .filter((path) => /^content\/patterns\/[^/]+\/[^/]+-pattern\.html$/.test(path))
    .sort()
  const records = await mapConcurrent(patternPaths, 8, async (sourcePath) => {
    const source = await fetchText(rawUrl(manifest.repository, revision, sourcePath))
    const parsed = parseWaiPattern(source)
    const sourceRecordId = sourcePath.split('/')[2]
    return {
      sourceRecordId,
      termEn: parsed.title,
      sourceDefinition: parsed.description,
      sourceCategory: 'accessibility-pattern',
      sourceUrl: `https://www.w3.org/WAI/ARIA/apg/patterns/${sourceRecordId}/`,
      sourcePath,
      sourceMetadata: { summaryQuality: 'source-prose' },
    }
  })
  return sourceEnvelope(sourceId, manifest, revision, records)
}

async function collectOpenUi() {
  const sourceId = 'open-ui'
  const manifest = SOURCE_MANIFEST[sourceId]
  const { revision, paths } = await repositoryContext(manifest)
  const researchPaths = paths
    .filter((path) => /^site\/src\/pages\/components\/[^/]+\.research.*\.mdx$/.test(path))
    .sort()
  const grouped = new Map()
  for (const path of researchPaths) {
    const filename = path.split('/').at(-1)
    const topic = filename.split('.research')[0]
    if (!grouped.has(topic)) grouped.set(topic, [])
    grouped.get(topic).push(path)
  }
  const records = await mapConcurrent([...grouped].sort(([a], [b]) => a.localeCompare(b)), 8, async ([topic, topicPaths]) => {
    const preferred = topicPaths.find((path) => path.endsWith(`${topic}.research.mdx`)) || topicPaths[0]
    const source = await fetchText(rawUrl(manifest.repository, revision, preferred))
    const parsed = parseOpenUiResearch(source)
    return {
      sourceRecordId: topic,
      termEn: parsed.title,
      sourceDefinition: parsed.description,
      sourceCategory: 'component-research',
      sourceUrl: githubFileUrl(manifest.repository, revision, preferred),
      sourcePath: preferred,
      sourceMetadata: {
        sourcePaths: topicPaths,
        summaryQuality: parsed.summaryQuality,
      },
    }
  })
  return sourceEnvelope(sourceId, manifest, revision, records)
}

async function collectAssistantUi() {
  const sourceId = 'assistant-ui'
  const manifest = SOURCE_MANIFEST[sourceId]
  const { revision, paths } = await repositoryContext(manifest)
  const elementPaths = paths
    .filter((path) => /^apps\/docs\/content\/elements\/[^/]+\.mdx$/.test(path))
    .sort()
  const records = await mapConcurrent(elementPaths, 8, async (sourcePath) => {
    const source = await fetchText(rawUrl(manifest.repository, revision, sourcePath))
    const frontmatter = parseMdxFrontmatter(source)
    const sourceRecordId = sourcePath.split('/').at(-1).replace(/\.mdx$/, '')
    return {
      sourceRecordId,
      termEn: frontmatter.title,
      sourceDefinition: frontmatter.description,
      sourceCategory: 'element',
      sourceUrl: `https://www.assistant-ui.com/elements/${sourceRecordId}`,
      sourcePath,
      sourceMetadata: { slug: sourceRecordId },
    }
  })
  return sourceEnvelope(sourceId, manifest, revision, records)
}

async function collectGovuk() {
  const sourceId = 'govuk-design-system'
  const manifest = SOURCE_MANIFEST[sourceId]
  const { revision, paths } = await repositoryContext(manifest)
  const contentPaths = paths
    .filter((path) => /^src\/(components|patterns)\/[^/]+\/index\.md$/.test(path))
    .sort()
  const records = await mapConcurrent(contentPaths, 8, async (sourcePath) => {
    const source = await fetchText(rawUrl(manifest.repository, revision, sourcePath))
    const frontmatter = parseGovukFrontmatter(source)
    const [, sourceGroup, slug] = sourcePath.split('/')
    return {
      sourceRecordId: `${sourceGroup}:${slug}`,
      termEn: frontmatter.title,
      sourceDefinition: frontmatter.description,
      sourceCategory: sourceGroup === 'components' ? 'component' : 'service-pattern',
      sourceUrl: `https://design-system.service.gov.uk/${sourceGroup}/${slug}/`,
      sourcePath,
      sourceMetadata: {
        section: frontmatter.section,
        aliases: frontmatter.aliases,
        slug,
      },
    }
  })
  return sourceEnvelope(sourceId, manifest, revision, records)
}

async function writeAtomically(path, payload) {
  const temporary = `${path}.tmp-${process.pid}`
  await mkdir(dirname(path), { recursive: true })
  await writeFile(temporary, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  await rm(path, { force: true })
  await rename(temporary, path)
}

function parseArgs(argv) {
  const options = { outputDir: DEFAULT_OUTPUT_DIR }
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--output-dir') options.outputDir = resolve(argv[++index])
    else throw new Error(`Unknown argument: ${argv[index]}`)
  }
  return options
}

export async function collectVisualAtlas(options = { outputDir: DEFAULT_OUTPUT_DIR }) {
  const snapshots = await Promise.all([
    collectAnimations(),
    collectAssistantUi(),
    collectGovuk(),
    collectAiElements(),
    collectPromptKit(),
    collectLoquix(),
    collectWaiAriaApg(),
    collectOpenUi(),
    collectAiInteractionAtlas(),
  ])
  const counted = snapshots.filter(({ source }) => source.countedAtlas)
  const coverage = snapshots.filter(({ source }) => !source.countedAtlas)
  const countedTotal = counted.reduce((sum, snapshot) => sum + snapshot.records.length, 0)
  const coverageTotal = coverage.reduce((sum, snapshot) => sum + snapshot.records.length, 0)
  if (countedTotal !== 466) {
    throw new Error(`Visual Atlas counted source drift: expected 466, received ${countedTotal}`)
  }
  if (coverageTotal !== 194) {
    throw new Error(`Visual Atlas coverage source drift: expected 194, received ${coverageTotal}`)
  }

  for (const snapshot of snapshots) {
    const outputId = snapshot.source.countedAtlas
      ? snapshot.source.id
      : `${snapshot.source.id}.coverage`
    await writeAtomically(
      resolve(options.outputDir, `${outputId}.raw.json`),
      snapshot,
    )
  }
  await rm(resolve(options.outputDir, 'ai-interaction-atlas.raw.json'), { force: true })
  return snapshots
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const snapshots = await collectVisualAtlas(options)
  process.stdout.write(
    `${JSON.stringify({
      outputDir: options.outputDir,
      countedTotal: snapshots
        .filter(({ source }) => source.countedAtlas)
        .reduce((sum, snapshot) => sum + snapshot.records.length, 0),
      coverageTotal: snapshots
        .filter(({ source }) => !source.countedAtlas)
        .reduce((sum, snapshot) => sum + snapshot.records.length, 0),
      sources: snapshots.map(({ source, records }) => ({
        id: source.id,
        records: records.length,
        revision: source.revision,
      })),
    }, null, 2)}\n`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
