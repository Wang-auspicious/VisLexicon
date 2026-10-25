// Project source resources and existing reviewed screenshots into a private,
// on-demand catalogue. Import counts, source counts and live counts stay separate.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const FRONT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const LOCAL = path.join(FRONT, 'data/ingest-v6')
const OUT = path.join(LOCAL, 'public')
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const read = async (p, fallback) => { try { return JSON.parse(await fs.readFile(p, 'utf8')) } catch (e) { if (e.code === 'ENOENT') return fallback; throw e } }
const write = async (p, value) => { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p + '.tmp', JSON.stringify(value)); await fs.rename(p + '.tmp', p) }
const categories = [
  ['section', /hero|pricing|testimonial|landing/i, ['页面区块', 'section', 'block', 'page']],
  ['button', /button/i, ['按钮', 'button', 'cta']],
  ['input', /input|form|select|switch|checkbox|radio|slider|calendar|date|combobox/i, ['表单', '输入', 'form', 'input']],
  ['nav', /nav|menu|dock|breadcrumb|tabs|pagination|sidebar/i, ['导航', '菜单', 'navigation', 'menu']],
  ['feedback', /spinner|loader|loading|toast|alert|progress|skeleton/i, ['反馈', '加载', 'feedback', 'loading']],
  ['data', /chart|table|stat|number|counter|ticker|badge|avatar/i, ['数据', '图表', 'data', 'chart']],
  ['surface', /background|border|beam|gradient|particle/i, ['背景', '边框', 'background', 'border']],
  ['layout', /layout|panel|resize|masonry|split|flex|grid/i, ['布局', 'layout']],
]
export function classifyResource(item) {
  const candidate = `${item.name ?? ''} ${item.componentType ?? ''} ${item.type ?? ''}`
  const found = categories.find(([, regex]) => regex.test(candidate))
  const fallback = /registry:(block|page)/.test(item.type ?? '') ? 'section' : 'content'
  return { category: found?.[0] ?? fallback, tags: [...new Set([...(item.tags ?? []), ...(found?.[2] ?? (fallback === 'section' ? ['页面区块', 'section', 'block'] : ['内容', 'content'])), item.framework, item.type].filter(Boolean))] }
}
export function componentTypeFor(item) {
  const name = `${item.name ?? ''} ${item.title ?? ''}`.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  for (const [type, pattern] of [
    ['button-group', /button.?group/], ['date-picker', /date.?picker|calendar/], ['background-effect', /background|particle|flicker|meteor/], ['border-effect', /border|beam/], ['text-effect', /typewriter|text.?effect|aurora.?text/], ['chart', /chart|bars|sparkline/], ['input', /input|textfield/], ['button', /button/], ['checkbox', /checkbox/], ['radio', /radio/], ['select', /select|combobox/], ['slider', /slider/], ['tabs', /tabs?/], ['menu', /menu/], ['navbar', /navbar|navigation|dock/], ['accordion', /accordion/], ['avatar', /avatar/], ['badge', /badge/], ['card', /card/], ['table', /table/], ['toast', /toast/], ['modal', /dialog|modal/], ['progress', /progress/], ['loader', /loader|spinner|loading/], ['form', /form/], ['divider', /divider|separator/], ['tooltip', /tooltip/], ['skeleton', /skeleton/], ['popover', /popover/], ['switch', /switch|toggle/],
  ]) if (pattern.test(name)) return type
  return item.category === 'section' ? 'feature-section' : 'component'
}
export function sourceOffers(item) {
  if (!item.files?.length || !item.license?.redistributable || !item.license?.url || !item.license?.verifiedAt) return []
  return [{ id: `source-${item.id}`, verified: true, checkedAt: item.license.verifiedAt, subject: 'source-code', scope: 'Exact original files archived from this item', access: 'unknown', sourceAvailable: true, sourceUrl: item.sourceUrl, sourceCost: 'unknown', openSource: true, commercialUse: null, license: item.license.spdx, licenseUrl: item.license.url, evidenceUrls: [item.sourceUrl, item.license.url] }]
}
export function previewFor(item, built, verified, catalog) {
  if (item.status !== 'source-ready' || !item.license?.redistributable) return { status: 'unverified', reason: item.reason || 'No redistributable current source.' }
  const build = built.get(item.id), proof = verified.get(item.id)
  if (catalog && (!build?.sourceDigests?.length || build.sourceDigests.some(d => {
    const current = catalog.get(d.id)
    return !current?.license?.redistributable || current.rawDigest !== d.rawDigest || (current.license.licenseDigest ?? current.license.rawDigest) !== d.licenseDigest
  }))) return { status: 'unverified', reason: 'Source or dependency permission/version changed; rendering must be reverified.' }
  if (proof?.status === 'verified' && proof.buildDigest === build?.buildDigest) return { status: 'verified', url: proof.url, posterUrl: proof.posterUrl, controls: proof.controls, exportName: proof.exportName, entryFile: proof.entryFile, verifiedAt: proof.verifiedAt, buildDigest: proof.buildDigest }
  return { status: 'unverified', reason: proof?.reason || build?.reason || (item.status === 'reference-only' ? item.reason : '源码已保存；尚无通过验证的独立演示。') }
}
export function summarize(item) {
  const { files, license, preview, ...rest } = item
  const description = typeof item.description === 'string' ? item.description.slice(0, 180) : item.description ? Object.fromEntries(Object.entries(item.description).map(([k,v]) => [k, String(v).slice(0, 180)])) : ''
  const keys = ['id', 'name', 'title', 'nameZh', 'nameEn', 'sourceId', 'sourceName', 'sourceUrl', 'type', 'category', 'tags', 'lane', 'status', 'framework', 'registryUrl', 'poster', 'frames', 'reason', 'offers']
  return { ...Object.fromEntries(keys.filter(k => rest[k] !== undefined).map(k => [k, rest[k]])), description, license: license ? { spdx: license.spdx, url: license.url, redistributable: license.redistributable } : null, preview: preview?.status === 'verified' ? { status: 'verified', url: preview.url, posterUrl: preview.posterUrl } : { status: preview?.status }, fileCount: files?.length ?? 0, sourceAvailable: Boolean(files?.length), codeExcerpt: files?.[0]?.content?.slice(0, 500) }
}
let imageProof = new Map(), imageCache = new Map()
let durableImageCache = new Map(), checkedImageCount = 0
async function validImage(url) {
  if (typeof url !== 'string' || !url.startsWith('/data/discovery/')) return false
  if (imageCache.has(url)) return imageCache.get(url)
  const proof = imageProof.get(url)
  if (!proof || proof.status !== 'valid') return false
  const relative = url.slice('/data/discovery/'.length)
  if (relative.includes('..')) return false
  for (const base of [path.join(FRONT, 'data/discovery/local-public'), path.join(FRONT, 'public/data/discovery')]) {
    try {
      const filename = path.join(base, relative), stat = await fs.stat(filename), stamp = `${stat.ctimeMs}/${stat.mtimeMs}/${stat.size}`
      const cached = durableImageCache.get(url)
      if (cached?.stamp === stamp && cached.sha256 === proof.sha256) { imageCache.set(url, true); return true }
      const bytes = await fs.readFile(filename)
      if (hash(bytes) === proof.sha256) {
        imageCache.set(url, true); durableImageCache.set(url, { stamp, sha256: proof.sha256 })
        if (++checkedImageCount % 500 === 0) await write(path.join(LOCAL, 'image-publication-cache.json'), [...durableImageCache])
        return true
      }
    } catch {}
  }
  return false
}
export async function publish() {
  const { DatabaseSync } = await import('node:sqlite')
  await fs.mkdir(path.join(OUT, 'items'), { recursive: true })
  const revision = new Date().toISOString()
  const db = new DatabaseSync(path.join(OUT, 'catalog.sqlite'))
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS entries (id TEXT PRIMARY KEY, document TEXT NOT NULL, digest TEXT NOT NULL, revision TEXT NOT NULL); CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL); BEGIN IMMEDIATE')
  const store = db.prepare('INSERT INTO entries(id,document,digest,revision) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document,digest=excluded.digest,revision=excluded.revision')
  imageProof = new Map((await read(path.join(LOCAL, 'screenshot-images.json'), [])).map(r => [r.url, r])); imageCache = new Map()
  durableImageCache = new Map(await read(path.join(LOCAL, 'image-publication-cache.json'), [])); checkedImageCount = 0
  const registry = await read(path.join(LOCAL, 'registry/catalog.json'), [])
  const catalogById = new Map(registry.map(c => [c.id, c]))
  const built = new Map((await read(path.join(LOCAL, 'previews/build.json'), [])).map(x => [x.id, x]))
  const verified = new Map((await read(path.join(LOCAL, 'previews/verified.json'), [])).map(x => [x.id, x]))
  const index = [], dispositions = [], seen = new Set()
  const counts = { registryEntries: registry.length, registrySourceResources: 0, referenceEntries: 0, supportResources: 0, codeSourceResources: 0, codeStoryFiles: 0, screenshots: 0, livePreviews: 0, unresolved: 0 }
  const emit = async item => {
    if (seen.has(item.id)) throw Error(`Duplicate item identity: ${item.id}`)
    seen.add(item.id)
    const document = JSON.stringify(item)
    store.run(item.id, document, hash(document), revision)
    index.push(summarize({ ...item, offers: sourceOffers(item) }))
  }
  for (const source of registry) {
    const support = source.supportResource || source.status === 'support-resource'
    if (support) { counts.supportResources++; dispositions.push({ id: source.id, disposition: 'support-resource' }); continue }
    const allowed = source.status === 'source-ready' && source.license?.redistributable
    const files = allowed ? (source.files ?? []).map(f => ({ ...f, path: f.path ?? f.target })) : []
    const preview = previewFor(source, built, verified, catalogById)
    if (preview.status === 'verified') counts.livePreviews++
    if (allowed) counts.registrySourceResources++
    else if (source.status === 'reference-only') counts.referenceEntries++
    else counts.unresolved++
    const item = { ...source, ...classifyResource(source), files, lane: 'registry', preview }
    // Internal observation digests stay in the local ledger, not public cards.
    for (const key of ['rawDigest', 'indexItemDigest', 'rawPath', 'observationIds', 'observationId', 'attempts', 'indexDigest']) delete item[key]
    await emit(item)
  }
  const receiptDir = path.join(LOCAL, 'code/source-receipts')
  const codeReady = await read(path.join(LOCAL, 'code/export-ready.json'), null)
  for (const filename of codeReady ? await fs.readdir(receiptDir).catch(() => []) : []) {
    const receipt = await read(path.join(receiptDir, filename), {})
    for (const row of receipt.items ?? []) {
      if (row.kind === 'support-source') continue
      if (!row.license?.redistributable || !['source-ready','source-fetched'].includes(row.status)) { dispositions.push({ id: row.id, disposition: row.status ?? 'unresolved-code' }); continue }
      const file = path.resolve(LOCAL, 'code', row.sourcePath)
      if (!file.startsWith(path.join(LOCAL, 'code/sources') + path.sep)) throw Error(`Invalid source path: ${row.id}`)
      const bytes = await fs.readFile(file)
      if (hash(bytes) !== row.rawDigest) throw Error(`Source digest changed: ${row.id}`)
      const name = path.basename(row.path).replace(/\.[^.]+$/, '')
      const source = { id: row.id, name, title: name, sourceId: row.repo, sourceName: row.repo, sourceUrl: row.sourceUrl, lane: 'github', commit: row.commit, framework: /\.[jt]sx$/.test(row.path) ? 'react' : path.extname(row.path).slice(1), type: row.kind, status: 'source-ready', license: row.license, dependencies: row.dependencies ?? [], files: [{ path: row.path, content: bytes.toString('utf8') }], description: { zh: row.kind === 'story' ? '上游 Storybook 演示源码，保留原始代码、固定版本和许可。' : '上游组件源文件，保留原始代码、固定版本和许可。', en: 'Original upstream source with pinned revision and license.' }, preview: { status: 'unverified', reason: '源文件已按固定提交保存；尚未验证它在本地的演示和工作区依赖。' } }
      counts.codeSourceResources++; if (row.kind === 'story') counts.codeStoryFiles++
      await emit({ ...source, ...classifyResource(source) })
    }
  }
  const screenshots = await read(path.join(FRONT, 'data/discovery/local-public/index.json'), { units: [] })
  for (const row of screenshots.units ?? []) {
    if (row.kind !== 'website-component' || row.previewKind !== 'image') continue
    if (!await validImage(row.previewUrl)) { dispositions.push({ id: row.id, disposition: 'missing-original-image' }); continue }
    const frames = [{ kind: 'default', label: '默认', src: row.previewUrl }]
    if (await validImage(row.hoverPreviewUrl)) frames.push({ kind: 'hover', label: '悬停', src: row.hoverPreviewUrl })
    const source = { id: row.id, name: row.nameEn, title: row.nameZh, nameZh: row.nameZh, nameEn: row.nameEn, description: { zh: row.descriptionZh, en: row.descriptionEn }, sourceId: row.entryId, sourceName: row.source?.name ?? row.sourceEntity, sourceUrl: row.sourceUrl, type: row.componentType, componentType: row.componentType, lane: 'screenshot', status: 'screenshot', poster: row.previewUrl, frames, files: [], tags: row.tags, reconstructionPrompt: row.reconstructionPrompt, license: { spdx: null, redistributable: false }, preview: { status: 'screenshot', reason: '原站实拍；这里的截图记录不证明源码许可。' }, capturedAt: row.capturedAt }
    await emit({ ...source, ...classifyResource(source) }); counts.screenshots++
  }
  const first = index.slice(0, 200), shards = []
  for (let i = 200, part = 1; i < index.length; i += 500, part++) {
    const name = String(part).padStart(5, '0') + '.json'
    const items = index.slice(i, i + 500)
    await write(path.join(OUT, 'catalog', name), { items })
    shards.push({ url: `/data/component-code/catalog/${name}`, count: items.length, sha256: hash(await fs.readFile(path.join(OUT, 'catalog', name))) })
  }
  const report = { version: 'component-code/1', generatedAt: revision, counts, total: index.length, items: first, shards }
  db.prepare('INSERT INTO metadata(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run('active-revision', revision)
  db.exec('COMMIT'); db.close()
  await write(path.join(OUT, 'index.json'), report)
  const sourceUnits = index.filter(r => r.lane !== 'screenshot' && r.sourceAvailable).map(r => ({
    id: r.id, kind: 'website-component', scope: 'curation', theme: r.category, componentType: componentTypeFor(r),
    entryId: r.sourceId, nameZh: r.nameZh || r.title || r.name, nameEn: r.nameEn || r.name || r.title,
    descriptionZh: typeof r.description === 'string' ? r.description : r.description?.zh || r.description?.en || '',
    descriptionEn: typeof r.description === 'string' ? r.description : r.description?.en || r.description?.zh || '',
    previewKind: r.preview?.posterUrl ? 'image' : 'source', previewUrl: r.preview?.posterUrl || '',
    sourceUrl: r.sourceUrl, source: { name: r.sourceName }, tags: r.tags, offers: r.offers, verification: 'source-indexed-resource',
    codeResource: { id: r.id, sourceId: r.sourceId, detailUrl: `/data/component-code/items/${encodeURIComponent(r.id)}.json`, previewUrl: r.preview?.status === 'verified' ? r.preview.url : null, previewStatus: r.preview?.status, poster: r.preview?.posterUrl, excerpt: r.codeExcerpt, sourceAvailable: true, framework: r.framework, license: r.license?.spdx },
  }))
  await write(path.join(LOCAL, 'discovery.json'), { generatedAt: report.generatedAt, counts, units: sourceUnits })
  await write(path.join(LOCAL, 'visual-discovery.json'), { generatedAt: report.generatedAt, counts, units: sourceUnits.filter(u => u.codeResource.previewStatus === 'verified' && u.previewKind === 'image' && u.previewUrl) })
  await write(path.join(LOCAL, 'publication.json'), { ...report, items: undefined, indexedResources: index.length, dispositions, indexDigest: hash(await fs.readFile(path.join(OUT, 'index.json'))) })
  await write(path.join(LOCAL, 'image-publication-cache.json'), [...durableImageCache])
  console.log(JSON.stringify({ ...counts, indexedResources: index.length }))
  return report
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await publish()
