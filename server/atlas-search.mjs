import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

const cache = new Map()
const hash = bytes => createHash('sha256').update(bytes).digest('hex')

async function manifest(root) {
  const filename = path.join(root, 'public/effects-atlas/catalog.json')
  const bytes = await fs.readFile(filename)
  const data = JSON.parse(bytes)
  // Search the same content-addressed prose as the actual Atlas UI, without
  // importing preview modules and keeping their descriptions cached forever.
  if (!/^\/effects-atlas\/search-index\.[a-f0-9]{16}\.json$/.test(data.searchIndex) || !Array.isArray(data.categories)) throw Error('ATLAS_SEARCH_CATALOG_INVALID')
  return { data, filename, revision: hash(bytes), searchFile: path.join(root, 'public', data.searchIndex) }
}

export async function atlasSearchFiles(root) {
  const record = await manifest(root)
  return [record.filename, record.searchFile]
}

export async function atlasSearchUnits(root) {
  const record = await manifest(root)
  const stat = await fs.stat(record.searchFile)
  const version = `${record.revision}/${stat.mtimeMs}/${stat.ctimeMs}/${stat.size}`
  const previous = cache.get(root)
  if (previous?.version === version) return previous.units
  const bytes = await fs.readFile(record.searchFile)
  if (!record.data.searchIndex.endsWith(`.${hash(bytes).slice(0, 16)}.json`)) throw Error('ATLAS_SEARCH_DIGEST_MISMATCH')
  const categories = JSON.parse(bytes)
  const fxCategories = new Set(record.data.categories.filter(category => category.file).map(category => category.id))
  const units = categories.filter(category => fxCategories.has(category.id)).flatMap(category => category.items.map(item => ({
    id: `atlas-term--${category.id}--${item.id}`, kind: 'atlas-term', componentType: 'term', scope: 'atlas', theme: category.id,
    nameZh: item.zh, nameEn: item.en,
    descriptionZh: [item.dz, item.pz].filter(Boolean).join('。'), descriptionEn: [item.de, item.pe].filter(Boolean).join('. '),
    tags: [category.zh, category.en, item.zh, item.en], source: { name: 'VisLexicon · 图鉴' },
    sourceUrl: `#/atlas/${encodeURIComponent(category.id)}/${encodeURIComponent(item.id)}`,
    detailUrl: `#/atlas/${encodeURIComponent(category.id)}/${encodeURIComponent(item.id)}`,
  })))
  cache.set(root, { version, units })
  return units
}
