// Sequential per-repository builds bound memory and keep every source export's
// compile disposition. Compilation does not imply a verified/live preview.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { buildPreviews, FRONT } from './build-previews.mjs'

const LOCAL = path.join(FRONT, 'data/ingest-v6')
const INPUT = path.join(LOCAL, 'code/preview-inputs')
const hash = data => createHash('sha256').update(data).digest('hex')
const read = async (file, fallback) => { try { return JSON.parse(await fs.readFile(file, 'utf8')) } catch (e) { if (e.code === 'ENOENT') return fallback; throw e } }
const fileHash = async file => hash(await fs.readFile(file).catch(() => Buffer.from('')))
const write = async (file, value) => { await fs.mkdir(path.dirname(file), { recursive: true }); const temp = file + '.tmp'; await fs.writeFile(temp, JSON.stringify(value)); await fs.rename(temp, file) }

export async function buildCodePreviews({ repo, force = false } = {}) {
  const progressFile = path.join(LOCAL, 'code/preview-builds.json')
  const previous = await read(progressFile, { repositories: [] })
  const environment = hash(JSON.stringify(await Promise.all([
    fileHash(fileURLToPath(import.meta.url)), fileHash(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'build-previews.mjs')),
    fileHash(path.join(LOCAL, 'runtime/package-lock.json')), fileHash(path.join(LOCAL, 'runtime/resolutions.json')),
  ])))
  const files = (await fs.readdir(INPUT)).filter(name => name.endsWith('.json') && !/(?:^index|\.summary|\.dispositions)\.json$/.test(name)).sort()
  const results = []
  for (const filename of files) {
    const key = filename.slice(0, -5)
    if (repo && key !== repo.toLowerCase().replaceAll('/', '--')) continue
    const inputFile = path.join(INPUT, filename), input = await read(inputFile, null)
    if (!input) continue
    const inputDigest = await fileHash(inputFile), runDigest = hash(inputDigest + environment)
    const old = previous.repositories.find(record => record.repoKey === key && record.runDigest === runDigest)
    if (!force && old) { results.push(old); continue }
    const suffix = hash(key).slice(0, 16), ledgerName = 'code-' + suffix, cssName = ledgerName + '.css'
    const record = { repoKey: key, repo: input.repo, inputDigest, runDigest, ledgerName, cssName, inputEntries: input.items.length, status: 'building', startedAt: new Date().toISOString() }
    try {
      const workspaceFiles = input.workspaceFiles ?? []
      const catalog = input.items.map(item => ({ ...item, workspaceFiles, entryFile: item.entryFile ?? item.entryPath }))
      if (catalog.length) {
        const ledger = await buildPreviews({ catalog, ledgerName, cssName })
        record.compiled = ledger.filter(item => item.status === 'compiled').length
        record.failed = ledger.filter(item => item.status === 'failed').length
        record.unsupported = ledger.filter(item => item.status === 'unsupported').length
        record.results = ledger.length
        if (ledger.length !== catalog.length) throw Error(`Compile disposition count ${ledger.length} differs from input export count ${catalog.length}`)
      } else Object.assign(record, { compiled: 0, failed: 0, unsupported: 0, results: 0 })
      record.status = 'attempted'
    } catch (error) { record.status = 'blocked'; record.reason = error.message; record.compiled ??= 0; record.results ??= 0 }
    record.finishedAt = new Date().toISOString()
    results.push(record)
    await write(progressFile, { schemaVersion: 1, updatedAt: new Date().toISOString(), repositories: results, publishedComponents: 0, liveComponents: 0 })
    console.log(`code repo ${key}: ${record.status}, ${record.compiled ?? 0}/${record.inputEntries} compiled`)
  }
  const summary = { schemaVersion: 1, updatedAt: new Date().toISOString(), repositories: results, sourceRepositoriesAttempted: results.length,
    exportInputs: results.reduce((n, r) => n + r.inputEntries, 0), compileDispositions: results.reduce((n, r) => n + (r.results ?? 0), 0),
    compiled: results.reduce((n, r) => n + (r.compiled ?? 0), 0), blockedRepositories: results.filter(r => r.status === 'blocked').length,
    publishedComponents: 0, liveComponents: 0 }
  await write(progressFile, summary)
  console.log(JSON.stringify({ repositories: results.length, exports: summary.exportInputs, compiled: summary.compiled, blockedRepositories: summary.blockedRepositories, publishedComponents: 0, liveComponents: 0 }))
  return summary
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  await buildCodePreviews({ repo: args.includes('--repo') ? args[args.indexOf('--repo') + 1] : undefined, force: args.includes('--force') })
}
