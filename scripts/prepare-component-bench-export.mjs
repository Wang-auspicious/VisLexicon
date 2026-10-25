// Export only the small reproducible application and its twenty sample entries.
// Private capture corpora, registry probes and raw receipts never enter this list.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sibling = path.resolve(frontend, '../component-bench')
const bench = await fs.access(path.join(sibling, 'package.json')).then(() => sibling).catch(() => path.join(frontend, 'component-bench'))
const { CATALOG } = await import(pathToFileURL(path.join(bench, 'src/catalog.js')))
const sha = bytes => createHash('sha256').update(bytes).digest('hex')

export async function prepareBenchExport({ refreshLicenses = false, destination } = {}) {
  const sources = [...new Map(CATALOG.filter(e => e.source?.repo).map(e => [e.source.repo, e.source])).values()]
  const licenses = []
  for (const source of sources) {
    let originalPath = new URL(source.licenseUrl).pathname.split('/').slice(5).join('/')
    const name = source.repo.replaceAll('/', '--') + '--' + source.commit.slice(0, 12) + '.txt'
    const licenseFile = `licenses/${name}`
    const target = path.join(bench, licenseFile)
    let bytes = await fs.readFile(target).catch(() => null)
    if (!bytes || refreshLicenses) {
      let result
      try { result = await run('gh', ['api', `repos/${source.repo}/contents/${originalPath}?ref=${source.commit}`, '-H', 'Accept: application/vnd.github.raw'], { encoding: 'buffer', maxBuffer: 1024 * 1024, windowsHide: true }) }
      catch (error) {
        if (!/404/.test(error.stderr?.toString() ?? '')) throw error
        const root = await run('gh', ['api', `repos/${source.repo}/git/trees/${source.commit}`], { encoding: 'utf8', maxBuffer: 1024 * 1024, windowsHide: true })
        const candidates = JSON.parse(root.stdout).tree.filter(entry => /^licen[cs]e(?:\.md|\.txt)?$/i.test(entry.path))
        if (candidates.length !== 1) throw new Error(`License path needs review: ${source.repo}`)
        originalPath = candidates[0].path
        result = await run('gh', ['api', `repos/${source.repo}/contents/${originalPath}?ref=${source.commit}`, '-H', 'Accept: application/vnd.github.raw'], { encoding: 'buffer', maxBuffer: 1024 * 1024, windowsHide: true })
      }
      bytes = result.stdout
      if (!/Permission is hereby granted/.test(bytes.toString('utf8')) || !/THE SOFTWARE IS PROVIDED ["“]AS IS/.test(bytes.toString('utf8'))) throw new Error(`Upstream license is not the expected MIT grant: ${source.repo}`)
      await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, bytes)
    }
    licenses.push({ repo: source.repo, commit: source.commit, license: 'MIT', url: `https://github.com/${source.repo}/blob/${source.commit}/${originalPath}`, file: licenseFile, sha256: sha(bytes), bytes: bytes.length, scope: CATALOG.filter(e => e.source?.repo === source.repo).map(e => e.id) })
  }
  await fs.writeFile(path.join(bench, 'THIRD_PARTY_NOTICES.json'), JSON.stringify({ version: 1, sources: licenses }, null, 2) + '\n')
  await fs.writeFile(path.join(bench, 'THIRD_PARTY_NOTICES.md'), '# Third-party sample notices\n\nThe twenty bundled examples retain their original-source links. Eight source repositories use the MIT grant; the complete license bytes retrieved at the pinned commits are preserved below. Registry source snapshots are preserved byte-for-byte in `src/vendor`; their snapshot hashes are recorded in the export inventory. npm runtime versions are pinned in `package-lock.json`, and npm packages retain their own license notices. Screenshot examples are visual references with direct original-site links; this notice does not assign an open-source license to those screenshots.\n\n' + licenses.map(l => `## ${l.repo}\n\n- License: ${l.license}\n- Repository commit: \`${l.commit}\`\n- Original license: [${l.file}](${l.url})\n- Complete local license: [${l.file}](${l.file})\n- License SHA-256: \`${l.sha256}\`\n`).join('\n'))
  const files = []
  const walk = async relative => {
    const absolute = path.join(bench, relative)
    const info = await fs.stat(absolute)
    if (info.isDirectory()) { for (const entry of await fs.readdir(absolute)) await walk(path.posix.join(relative, entry)); return }
    const bytes = await fs.readFile(absolute)
    files.push({ path: relative, bytes: bytes.length, sha256: sha(bytes) })
  }
  for (const relative of ['index.html', 'package.json', 'package-lock.json', 'vite.config.js', 'THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.json', 'licenses', 'src', 'server', 'scripts', 'public/posters', 'public/shots']) await walk(relative)
  for (const file of files) {
    if (/(?:^|\/)(?:node_modules|dist|registry-cache|data|\.claude)(?:\/|$)/.test(file.path)) throw new Error(`Private or generated corpus escaped export boundary: ${file.path}`)
  }
  const manifest = { version: 1, examples: CATALOG.length, liveExamples: CATALOG.filter(e => e.lane !== 'screenshot').length, screenshotExamples: CATALOG.filter(e => e.lane === 'screenshot').length, files: files.sort((a, b) => a.path.localeCompare(b.path)), bytes: files.reduce((n, f) => n + f.bytes, 0), licenses }
  const receipt = path.join(frontend, 'data/ingest-v6/bench-export-manifest.json')
  await fs.mkdir(path.dirname(receipt), { recursive: true }); await fs.writeFile(receipt, JSON.stringify(manifest, null, 2))
  if (destination) {
    const out = path.resolve(destination)
    for (const file of files) {
      const target = path.resolve(out, file.path)
      if (!target.startsWith(out + path.sep)) throw new Error('Export path escaped destination')
      await fs.mkdir(path.dirname(target), { recursive: true })
      if (path.resolve(path.join(bench, file.path)) !== target) await fs.copyFile(path.join(bench, file.path), target)
      if (sha(await fs.readFile(target)) !== file.sha256) throw new Error(`Export byte mismatch: ${file.path}`)
    }
  }
  console.log(JSON.stringify({ examples: manifest.examples, files: files.length, bytes: manifest.bytes, licenseRepos: licenses.length, receipt, ...(destination ? { destination: path.resolve(destination) } : {}) }))
  return manifest
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareBenchExport({ refreshLicenses: process.argv.includes('--refresh-licenses'), destination: process.argv.includes('--dest') ? process.argv[process.argv.indexOf('--dest') + 1] : undefined })
