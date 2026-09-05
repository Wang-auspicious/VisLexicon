/* 把站点富化结果合并进浏览器目录索引（public/data/site-catalog-index.json）。
 * 运行：node scripts/merge-enrichment.mjs
 * 富化按站点独立落盘（data/enrichment/sites/{id}.json），本脚本可随时重跑、增量生效。
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIR, '..')
const ENRICH_DIR = resolve(DEMO_ROOT, 'data/enrichment/sites')
const CATALOG_PATH = resolve(DEMO_ROOT, 'src/data/site-catalog.json')
const INDEX_PATH = resolve(DEMO_ROOT, 'public/data/site-catalog-index.json')

async function main() {
  const catalog = JSON.parse(await readFile(CATALOG_PATH, 'utf8'))
  const index = JSON.parse(await readFile(INDEX_PATH, 'utf8'))
  const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]))

  const enrichments = new Map()
  let files
  try {
    files = await readdir(ENRICH_DIR)
  } catch {
    files = []
  }
  for (const filename of files) {
    if (!filename.endsWith('.json')) continue
    const payload = JSON.parse(await readFile(resolve(ENRICH_DIR, filename), 'utf8'))
    if (payload?.id) enrichments.set(payload.id, payload)
  }

  let merged = 0
  let enrichedDesc = 0
  for (const entry of index.entries) {
    const enrichment = enrichments.get(entry.id)
    if (!enrichment) continue
    merged += 1
    const shots = (enrichment.shots ?? []).filter((shot) => shot?.src)
    if (shots.length > 0) entry.shots = shots.slice(0, 3)
    if (enrichment.author?.author) {
      entry.author = enrichment.author.author
    }
    if (Array.isArray(enrichment.github) && enrichment.github.length > 0) {
      entry.github = enrichment.github[0]
    }
    if (enrichment.liveTitle) entry.liveTitle = enrichment.liveTitle
    if (enrichment.liveDescription) entry.liveDescription = enrichment.liveDescription
    if (Array.isArray(enrichment.tech) && enrichment.tech.length > 0) {
      entry.tech = enrichment.tech
    }
    if (enrichment.status) entry.siteStatus = enrichment.status
    if (enrichment.error) entry.siteError = enrichment.error
    if (enrichment.descriptionZh && enrichment.status !== 'unreachable') {
      entry.descriptionZh = enrichment.descriptionZh
      enrichedDesc += 1
    }
    // 复用目录证据里的仓库地址作为 GitHub 兜底
    if (!entry.github) {
      const repoEvidence = byId.get(entry.id)?.sourceEvidence?.find((item) =>
        /^https:\/\/github\.com\//.test(item.originalUrl ?? ''),
      )
      if (repoEvidence) entry.github = repoEvidence.originalUrl
    }
  }

  await mkdir(dirname(INDEX_PATH), { recursive: true })
  await writeFile(INDEX_PATH, `${JSON.stringify(index)}\n`)
  console.log(`merge-enrichment: enrichmentFiles=${enrichments.size} merged=${merged} enrichedDesc=${enrichedDesc} indexEntries=${index.entries.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
