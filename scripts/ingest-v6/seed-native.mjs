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
for (const entry of allEntries) {
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

function classifyComponent(s, r) {
  const text = [
    s.name, s.primaryCategory, s.subcategory,
    ...(s.facets?.deliverables || []),
    ...(s.facets?.technologies || []),
    ...(s.facets?.media || []),
    s.takeawayZh, s.descriptionZh,
    r.pages?.[2]?.title, r.pages?.[2]?.selectionRationale,
    ...(r.curation?.atlasTerms || []).map(t => `${t.termZh} ${t.termEn} ${t.termId}`)
  ].filter(Boolean).join(' ').toLowerCase()

  let theme = 'content', componentType = 'component'
  if (/chart|图表|visualization|viz|plot|echarts|g2|d3/i.test(text)) { theme = 'data'; componentType = 'chart' }
  else if (/table|表格|sheet|grid-layout|matrix/i.test(text)) { theme = 'data'; componentType = 'table' }
  else if (/button|按钮|cta/i.test(text)) { theme = 'button'; componentType = 'button' }
  else if (/date.?picker|日历|calendar/i.test(text)) { theme = 'input'; componentType = 'date-picker' }
  else if (/command|menu|navbar|nav|navigation|dock|tabs|标签页|导航|菜单/i.test(text)) { theme = 'nav'; componentType = /tabs|标签/i.test(text) ? 'tabs' : /nav|dock|header/i.test(text) ? 'navbar' : 'menu' }
  else if (/input|select|form|switch|checkbox|radio|combobox|表单|输入/i.test(text)) { theme = 'input'; componentType = 'input' }
  else if (/modal|dialog|drawer|tooltip|toast|alert|spinner|loader|弹窗|提示|加载/i.test(text)) { theme = 'feedback'; componentType = /modal|dialog/i.test(text) ? 'modal' : /tooltip/i.test(text) ? 'tooltip' : /toast|alert/i.test(text) ? 'toast' : 'loader' }
  else if (/carousel|swiper|slider|轮播|滑块/i.test(text)) { theme = 'data'; componentType = /slider/i.test(text) ? 'slider' : 'carousel' }
  else if (/3d|webgl|canvas|three|particle|background|mesh|背景|粒子/i.test(text)) { theme = 'surface'; componentType = 'background-effect' }
  else if (/layout|panel|masonry|布局/i.test(text)) { theme = 'layout'; componentType = 'layout' }
  else if (/hero|landing|section|落地页|区块/i.test(text)) { theme = 'section'; componentType = 'feature-section' }

  return { theme, componentType }
}

function buildReconstructionPrompt(s, r, proofPage) {
  const tech = (s.facets?.technologies || []).slice(0, 4).join(', ') || 'React, Tailwind CSS, TypeScript'
  const roleDesc = proofPage?.selectionRationale || s.takeawayZh || s.descriptionZh
  const note = r.editorial?.noteZh || ''
  const terms = (r.curation?.atlasTerms || []).map(t => t.termZh || t.termEn).filter(Boolean).join('、')
  return `Build a high-quality, production-ready component inspired by ${s.name} (${s.homepage}).
Technology stack: ${tech}.
Component specification: ${roleDesc}
${terms ? `Key visual & interaction patterns: ${terms}.` : ''}
${note ? `Visual details from source observation: ${note}` : ''}
Ensure clean semantic markup, fully accessible ARIA roles and keyboard interactions, responsive layout across desktop and mobile, crisp typography, and fluid state transitions (default, hover, active, focus).`.trim()
}

function extractSiteOffers(site, detail) {
  const checkedAt = site.checkedAt || detail.official?.checkedAt || new Date().toISOString()
  if (Array.isArray(detail.offers) && detail.offers.length > 0) return detail.offers
  const facts = (detail.facts || []).filter(f => Number(f.confidence) >= .8 && f.sourceUrl && f.evidence)
  const pricing = facts.find(f => f.field === 'pricing')
  const repo = facts.find(f => f.field === 'repository' && /^https?:\/\//.test(f.value))
  const license = facts.find(f => f.field === 'license')
  const priceText = pricing ? `${pricing.value} ${pricing.evidence}` : ''
  const free = Boolean(pricing) && /free|免费|open.source|开源/iu.test(priceText) && !/not free|不免费|并非免费/iu.test(priceText) && (site.access || []).some(x => ['free', 'freemium', 'open-source'].includes(x))
  const mixed = /paid|付费|另售|收费|freemium/iu.test(String(pricing?.value || '').replace(/(?:no|without|not)\s+(?:paid|payment|paywall)|未见(?:付费|收费)墙|没有(?:付费|收费)/giu, ''))
  const permissive = Boolean(license) && /^(MIT|Apache[- ]?2(?:\.0)?|BSD(?:[- ]\d[- ]Clause)?|ISC|CC0(?:[- ]1\.0)?)$/iu.test(String(license.value).trim()) && !/commons clause|non.commercial|禁止商用|仅限个人/iu.test(license.evidence)
  const sourceAvailable = Boolean(repo)
  const sourceCost = free && sourceAvailable && permissive ? 'free' : 'unknown'
  if (!pricing && !repo && !license) return []
  return [{
    id: `${site.entryId}/reviewed-offer`,
    verified: true,
    checkedAt,
    access: free ? (mixed ? 'partial-free' : 'free') : 'unknown',
    sourceAvailable,
    sourceUrl: repo?.value || null,
    sourceCost,
    openSource: sourceAvailable && permissive,
    commercialUse: sourceAvailable && permissive,
    license: license?.value || site.license || null,
    licenseUrl: license?.sourceUrl || null,
    scope: pricing?.value || license?.evidence || repo?.evidence,
    evidenceUrls: [...new Set([pricing?.sourceUrl, repo?.sourceUrl, license?.sourceUrl].filter(Boolean))]
  }]
}

if (!selectedId) {
  const siteIndex = JSON.parse(await fs.readFile(path.join(FRONT, 'public/data/site-index.json'), 'utf8').catch(() => '{"items":[]}'))
  const seededIds = new Set(units.map(u => u.id))
  for (const s of siteIndex.items || []) {
    const unitId = `v4-${s.entryId}`
    if (seededIds.has(unitId) || seededIds.has(`seed-${s.entryId}`)) continue

    let r = {}
    try { r = JSON.parse(await fs.readFile(path.join(FRONT, 'public/r', `${s.entryId}.json`), 'utf8')) } catch {}
    const pages = r.pages || []
    const proofPage = pages.find(p => p.role === 'proof') || pages[2] || pages[0]
    const breadthPage = pages.find(p => p.role === 'breadth') || pages[1] || pages[0]
    const identityPage = pages.find(p => p.role === 'identity') || pages[0]

    const norm = src => src ? src.replace(/^https?:\/\/vislexicon\.com\//, '').replace(/^\/?/, '/') : ''
    const proofShot = norm(proofPage?.shot?.src || s.shots?.find(x => x.src?.includes('proof'))?.src || s.shot?.src)
    const breadthShot = norm(breadthPage?.shot?.src || s.shots?.find(x => x.src?.includes('breadth'))?.src || proofShot)
    const identityShot = norm(identityPage?.shot?.src || s.shots?.find(x => x.src?.includes('identity'))?.src || s.shot?.src)

    const classification = classifyComponent(s, r)
    const theme = classification.theme
    const compType = classification.componentType

    const primaryTerm = r.curation?.atlasTerms?.[0]
    const cleanProofTitle = (proofPage?.title || '').replace(/\s*[-|·—–].*$/, '').trim()
    const nameZh = primaryTerm?.termZh ? `${s.name} · ${primaryTerm.termZh}` : `${s.name} · ${s.takeawayZh ? s.takeawayZh.replace(/，.*$/, '').slice(0, 14) : '核心组件'}`
    const nameEn = primaryTerm?.termEn ? `${s.name} · ${primaryTerm.termEn}` : (cleanProofTitle.length > 2 && cleanProofTitle.length < 35 ? `${s.name} · ${cleanProofTitle}` : `${s.name} Component`)

    const descZh = proofPage?.selectionRationale ? `${proofPage.selectionRationale} ${s.descriptionZh || ''}`.trim() : (s.descriptionZh || '')
    const descEn = s.descriptionEn || s.descriptionZh || ''

    const prompt = buildReconstructionPrompt(s, r, proofPage)
    const offers = extractSiteOffers(s, r)
    let host = ''
    try { host = new URL(s.homepage).hostname } catch { host = s.entryId }

    const item = {
      id: unitId,
      name: nameEn,
      title: { zh: nameZh, en: nameEn },
      description: { zh: descZh, en: descEn },
      sourceName: s.name,
      sourceUrl: proofPage?.sourceUrl || s.homepage,
      source: { site: s.name, home: s.homepage, page: proofPage?.sourceUrl || s.homepage, license: s.license || null },
      lane: 'screenshot',
      license: { spdx: s.license || null, redistributable: false },
      files: [],
      controls: [],
      preview: { status: 'screenshot' },
      frames: [
        { kind: 'default', src: proofShot },
        { kind: 'hover', src: breadthShot },
        { kind: 'frame2', src: identityShot }
      ],
      poster: proofShot,
      reconstructionPrompt: prompt,
      status: 'screenshot',
      offers
    }
    await fs.writeFile(path.join(root, 'items', `${item.id}.json`), JSON.stringify(item))

    const tags = [...new Set([
      s.primaryCategory,
      s.subcategory,
      theme,
      compType,
      ...(s.facets?.deliverables || []),
      ...(s.facets?.technologies || []),
      ...(s.facets?.media || []),
      s.name
    ].filter(Boolean))]

    units.push({
      id: item.id,
      kind: 'website-component',
      scope: 'curation',
      theme,
      componentType: compType,
      nameZh,
      nameEn,
      descriptionZh: descZh,
      descriptionEn: descEn,
      sectionsZh: [{ label: '说明', text: descZh }, ...(s.takeawayZh ? [{ label: '适合', text: s.takeawayZh }] : [])],
      sectionsEn: [{ label: 'About', text: descEn }],
      sourceUrl: item.sourceUrl,
      source: { name: s.name },
      previewKind: 'image',
      previewUrl: proofShot,
      tags,
      offers,
      verification: 'existing-source-screenshot',
      codeResource: {
        id: item.id,
        sourceId: host,
        detailUrl: `/data/component-code/items/${item.id}.json`,
        previewStatus: 'screenshot',
        sourceAvailable: false,
        controls: [],
        poster: proofShot,
        license: s.license || null
      }
    })

    dispositions.push({
      fixture: s.entryId,
      unitId,
      disposition: 'portable-captured-fixture',
      basis: 'Bundled original screenshot, source URL and portable sample identity retained; no private capture archive required'
    })
  }
}
// Verified source previews are exported as standalone, immutable assets. Keep
// them across normal seed rebuilds; source without a real preview stays private.
if (!selectedId) {
  const extras = JSON.parse(await fs.readFile(path.join(root, 'verified-extra.json'), 'utf8').catch(error => {
    if (error.code === 'ENOENT') return '{"version":1,"units":[]}'
    throw error
  }))
  if (extras.version !== 1 || !Array.isArray(extras.units)) throw Error('Invalid verified source extras')
  for (const extra of extras.units) {
    if (!/^[a-zA-Z0-9_.-]+$/.test(extra.id ?? '') || extra.codeResource?.previewStatus !== 'verified' || extra.previewKind !== 'image' || !extra.previewUrl?.startsWith('/data/component-code/')) throw Error('Invalid verified source unit')
    if (units.some(unit => unit.id === extra.id)) throw Error(`Duplicate verified source unit: ${extra.id}`)
    const detail = JSON.parse(await fs.readFile(path.join(root, 'items', `${extra.id}.json`), 'utf8'))
    if (detail.id !== extra.id || detail.preview?.status !== 'verified' || !detail.license?.redistributable || !detail.files?.length) throw Error(`Invalid verified source detail: ${extra.id}`)
    for (const url of [extra.previewUrl, extra.codeResource.previewUrl]) {
      if (!url?.startsWith('/data/component-code/') || url.includes('..')) throw Error(`Invalid verified source asset: ${extra.id}`)
      await fs.access(path.join(root, url.slice('/data/component-code/'.length)))
    }
    units.push(extra)
    dispositions.push({ fixture: extra.id, unitId: extra.id, disposition: 'live-source-fixture' })
  }
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
