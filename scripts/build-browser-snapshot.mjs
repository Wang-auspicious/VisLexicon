// Derive browser payloads only from the checked-in public product snapshot.
// This export never imports local research ledgers or rebuilds site membership.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { projectSiteCard } from './site-list-projection.mjs'
import { siteWideCounts } from '../src/lib/counts.js'
import { MANIFESTS } from '../src/stages/manifests.js'
import { RESOURCE_KITS } from '../src/lib/resource-kits.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const read = file => fs.readFile(path.join(root, file), 'utf8').then(JSON.parse)
const write = (file, value) => fs.writeFile(path.join(root, file), JSON.stringify(value, null, 2) + '\n')
const [index, release, atlas] = await Promise.all([read('public/data/site-index.json'), read('public/release.json'), read('src/data/visual-atlas.json')])
if (index.releaseId !== release.releaseId) throw Error('Public snapshot release mismatch')
const cards = { ...index, counts: siteWideCounts({ items: index.items, atlas, manifests: MANIFESTS }), items: index.items.map(projectSiteCard) }
const bytes = JSON.stringify(cards)
const name = `site-list.${createHash('sha256').update(bytes).digest('hex').slice(0, 16)}.json`
await fs.writeFile(path.join(root, 'public/data', name), bytes)
release.endpoints.siteCards = `/data/${name}`
await write('public/release.json', release)
for (const scope of ['ppt', 'science', 'graphics']) {
  const file = `public/data/discovery/scopes/${scope}.json`, previous = await read(file)
  const kits = RESOURCE_KITS.filter(item => item.category === scope).map(item => ({
    id: `resource--${item.id}`, scope, theme: scope, themes: [...item.kz, ...item.kw], kind: 'creative-resource', componentType: 'resource-kit',
    nameZh: item.zh, nameEn: item.en, descriptionZh: item.dz, descriptionEn: item.de,
    sectionsZh: [{ label: '用途', text: item.dz }], sectionsEn: [{ label: 'Purpose', text: item.de }],
    previewKind: 'image', previewUrl: item.preview, sourceUrl: item.sourceUrl || `#/${scope}?id=${item.id}`, detailUrl: `#/${scope}?id=${item.id}`,
    source: { name: item.sourceName, iconUrl: '/favicon.svg' }, tags: [...item.kz, ...item.kw, item.execution.runtime], offers: item.offers,
    verification: 'executed-resource-kit', exampleQueries: [], interaction: {},
  }))
  const ids = new Set(kits.map(item => item.id))
  const units = [...kits, ...previous.units.filter(item => !ids.has(item.id))]
  const revision = createHash('sha256').update(JSON.stringify(units)).digest('hex')
  if (JSON.stringify(units) !== JSON.stringify(previous.units)) await write(file, { ...previous, revision, units })
}
console.log(`Browser snapshot: ${index.items.length} existing sites; ${RESOURCE_KITS.length} resource kits; ${Buffer.byteLength(bytes)} card bytes.`)
