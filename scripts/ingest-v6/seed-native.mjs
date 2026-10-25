// Approved small fixtures are served through the original website's
// component catalogue. /component-bench/?solo= is only an isolated renderer.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { componentTypeFor, sourceOffers } from './publish.mjs'

const FRONT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const sibling = path.resolve(FRONT, '../component-bench')
const BENCH = await fs.access(path.join(sibling, 'package.json')).then(() => sibling).catch(() => path.join(FRONT, 'component-bench'))
const { ENTRIES } = await import(pathToFileURL(path.join(BENCH, 'src/lib/model.js')))
const notices = JSON.parse(await fs.readFile(path.join(BENCH, 'THIRD_PARTY_NOTICES.json'), 'utf8'))
const root = path.join(FRONT, 'public/data/component-code')
await fs.mkdir(path.join(root, 'items'), { recursive: true })
const asset = value => /^https?:\/\//.test(value) ? value : '/component-bench/' + value.replace(/^\//, '')
const selectedId = process.argv.includes('--id') ? process.argv[process.argv.indexOf('--id') + 1] : null
const allEntries = selectedId ? ENTRIES.filter(entry => entry.id === selectedId) : ENTRIES
if (selectedId && !allEntries.length) throw Error(`Unknown catalog entry: ${selectedId}`)
const units = []
const captures = JSON.parse(await fs.readFile(path.join(FRONT, 'data/discovery/local-public/index.json'), 'utf8').catch(() => '{"units":[]}'))
const capturedById = new Map((captures.units ?? []).map(u => [u.id, u]))
const previousManifest = JSON.parse(await fs.readFile(path.join(root, 'sample-manifest.json'), 'utf8').catch(() => '{"dispositions":[]}'))
const portableByFixture = new Map((previousManifest.dispositions ?? []).map(row => [row.fixture, row]))
const dispositions = []
for (const entry of ENTRIES) {
  const notice = notices.sources.find(n => n.repo === entry.source.repo && n.commit === entry.source.commit)
  let license = { spdx: null, redistributable: false }
  if (notice) {
    const bytes = await fs.readFile(path.join(BENCH, notice.file))
    if (createHash('sha256').update(bytes).digest('hex') !== notice.sha256) throw Error(`Seed notice changed: ${entry.id}`)
    const licenseText = bytes.toString('utf8')
    const existing = JSON.parse(await fs.readFile(path.join(root, 'items', `seed-${entry.id}.json`), 'utf8').catch(() => 'null'))
    const sameVerifiedGrant = existing?.commit === entry.source.commit && existing.license?.spdx === notice.license && existing.license?.text === licenseText
    license = { spdx: notice.license, url: notice.url, text: licenseText, redistributable: true, verifiedAt: entry.source.licenseCheckedAt ?? (sameVerifiedGrant ? existing.license.verifiedAt : new Date().toISOString()) }
  }
  const files = []
  for (const relative of entry.source.files ?? []) {
    const filename = path.resolve(BENCH, relative)
    if (!filename.startsWith(BENCH + path.sep)) throw Error('Seed path escaped renderer')
    const bytes = await fs.readFile(filename)
    const origin = entry.source.fileOrigins?.[relative]
    if (origin && createHash('sha256').update(bytes).digest('hex') !== origin.sha256) throw Error(`Original source changed: ${relative}`)
    files.push({ path: relative, content: bytes.toString('utf8'), ...(origin ? { originalPath: origin.path, sourceUrl: origin.url, sha256: origin.sha256, gitBlob: origin.gitBlob } : {}) })
  }
  const live = entry.lane !== 'screenshot'
  let unitId = `seed-${entry.id}`
  if (!live) {
    const existing = capturedById.get(`v4-${entry.shotId}`)
    if (existing && existing.sourceUrl === entry.source.page) {
      const relative = existing.previewUrl.replace(/^\/data\/discovery\//, '')
      const original = await fs.readFile(path.join(FRONT, 'data/discovery/local-public', relative))
      const fixture = await fs.readFile(path.join(BENCH, 'public', entry.poster))
      if (createHash('sha256').update(original).digest('hex') !== createHash('sha256').update(fixture).digest('hex')) throw Error(`Screenshot fixture identity changed: ${entry.id}`)
      unitId = existing.id
      dispositions.push({ fixture: entry.id, unitId, disposition: 'reuse-exact-captured-instance', basis: 'Exact capture ID, exact original URL and byte-identical screenshot' })
    } else {
      const portable = portableByFixture.get(entry.id)
      if (portable && /^[a-zA-Z0-9_.-]+$/.test(portable.unitId)) {
        const previous = JSON.parse(await fs.readFile(path.join(root, 'items', portable.unitId + '.json'), 'utf8').catch(() => 'null'))
        if (previous?.sourceUrl === entry.source.page && previous.poster === asset(entry.poster)) unitId = portable.unitId
      }
      dispositions.push({ fixture: entry.id, unitId, disposition: unitId.startsWith('v4-') ? 'portable-captured-fixture' : 'small-screenshot-fixture', basis: 'Bundled original screenshot, source URL and portable sample identity retained; no private capture archive required' })
    }
  } else dispositions.push({ fixture: entry.id, unitId, disposition: 'live-source-fixture' })
  const poster = asset(entry.poster)
  const preview = live ? { status: 'verified', url: `/component-bench/?solo=${encodeURIComponent(entry.id)}&embed=1`, posterUrl: poster, controls: entry.controls, verification: entry.previewVerification ?? 'actual-source-render; transparent lossless poster; type-derived controls' } : { status: 'screenshot' }
  const item = { id: unitId, name: entry.en, title: { zh: entry.zh, en: entry.en }, description: { zh: entry.summaryZh, en: entry.summaryEn }, sourceName: entry.source.site, sourceUrl: entry.source.page ?? entry.source.home, source: entry.source, lane: entry.lane, license, files, controls: entry.controls, preview, install: entry.source.install, commit: entry.source.commit, frames: entry.shot?.frames.map(f => ({ ...f, src: asset(f.src) })), poster, reconstructionPrompt: entry.shot?.prompt, status: files.length ? 'source-ready' : live ? 'package-preview' : 'screenshot' }
  item.offers = entry.offer ? [entry.offer] : sourceOffers(item)
  await fs.writeFile(path.join(root, 'items', item.id + '.json'), JSON.stringify(item))
  units.push({ id: item.id, kind: 'website-component', scope: 'curation', theme: entry.category, componentType: componentTypeFor({ name: entry.id, category: entry.category }), nameZh: entry.zh, nameEn: entry.en, descriptionZh: entry.summaryZh, descriptionEn: entry.summaryEn, sourceUrl: item.sourceUrl, source: { name: entry.source.site }, previewKind: 'image', previewUrl: poster, tags: entry.tags, offers: item.offers, verification: entry.verification ?? (live ? 'source-demo-fixture' : 'existing-source-screenshot'), codeResource: { id: item.id, sourceId: entry.source.repo ?? new URL(item.sourceUrl).hostname, detailUrl: `/data/component-code/items/${item.id}.json`, previewUrl: preview.url, previewStatus: preview.status, sourceAvailable: files.length > 0, controls: entry.controls, poster, excerpt: files[0]?.content.slice(0, 500), license: license.spdx } })
}
const discoveryPath = path.join(root, 'discovery.json')
const manifestPath = path.join(root, 'sample-manifest.json')
if (selectedId) {
  const previous = JSON.parse(await fs.readFile(discoveryPath, 'utf8'))
  const priorManifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  const replacementIds = new Set(units.map(unit => unit.id))
  const merged = (previous.units ?? []).filter(unit => !replacementIds.has(unit.id))
  const byId = new Map(merged.map(unit => [unit.id, unit]))
  for (const unit of units) byId.set(unit.id, unit)
  const updatedUnits = [...byId.values()]
  const updatedDispositions = (priorManifest.dispositions ?? []).filter(row => row.fixture !== selectedId)
  const newDisposition = dispositions.find(row => row.fixture === selectedId)
  if (newDisposition) updatedDispositions.push(newDisposition)
  await fs.writeFile(discoveryPath, JSON.stringify({ generatedAt: new Date().toISOString(), units: updatedUnits }))
  await fs.writeFile(manifestPath, JSON.stringify({ version: 1, examples: updatedUnits.length, live: updatedUnits.filter(u => u.codeResource.previewStatus === 'verified').length, screenshot: updatedUnits.filter(u => u.codeResource.previewStatus === 'screenshot').length, dispositions: updatedDispositions }, null, 2))
  console.log(JSON.stringify({ seededEntry: selectedId, seedUnits: updatedUnits.length, live: updatedUnits.filter(u => u.codeResource.previewStatus === 'verified').length, directory: root }))
} else {
  await fs.writeFile(discoveryPath, JSON.stringify({ generatedAt: new Date().toISOString(), units }))
  await fs.writeFile(manifestPath, JSON.stringify({ version: 1, examples: units.length, live: units.filter(u => u.codeResource.previewStatus === 'verified').length, screenshot: units.filter(u => u.codeResource.previewStatus === 'screenshot').length, dispositions }, null, 2))
  console.log(JSON.stringify({ seedUnits: units.length, live: units.filter(u => u.codeResource.previewStatus === 'verified').length, directory: root }))
}
