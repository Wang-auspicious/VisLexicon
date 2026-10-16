import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { CATEGORY_FILES } from '../public/effects-atlas/fx/index.js'
import { enrichCardSamples } from '../public/effects-atlas/card-samples.js'
import { addPractices } from '../public/effects-atlas/practices.js'
import { syncDiscoveryBrowser } from './sync-discovery-browser.mjs'

const publicRoot = new URL('../public/', import.meta.url)

export async function buildAtlasCatalog() {
  await syncDiscoveryBrowser()
  const modules = await Promise.all(CATEGORY_FILES.map(async file => ({ file, category: (await import(`../public/effects-atlas/fx/${file}.js`)).default })))
  const originalFetch = globalThis.fetch
  let categories
  try {
    globalThis.fetch = async url => {
      if (url !== '/data/creative-practices.json') throw new Error(`Unexpected atlas build request: ${url}`)
      return { ok: true, json: async () => JSON.parse(await fs.readFile(new URL('data/creative-practices.json', publicRoot), 'utf8')) }
    }
    categories = await addPractices(enrichCardSamples(modules.map(row => row.category).filter(category => category?.items?.length)))
  } finally { globalThis.fetch = originalFetch }
  const files = new Map(modules.map(row => [row.category.id, row.file]))
  // The overview needs exact counts and four sample names, never effect CSS.
  const catalog = categories.map(({ items, ...category }) => ({
    ...category,
    file: files.get(category.id) || null,
    hasPractices: items.some(item => item.practice),
    itemCount: items.length,
    items: items.slice(0, 4).map(({ id, zh, en }) => ({ id, zh, en })),
  }))
  // Search loads prose only. The visible result's category supplies its demos.
  const search = categories.map(({ items, ...category }) => ({
    ...category,
    items: items.map(({ id, zh, en, dz, de, pz, pe }) => ({ id, zh, en, dz, de, pz, pe })),
  }))
  const searchJson = JSON.stringify(search)
  const searchName = `search-index.${createHash('sha256').update(searchJson).digest('hex').slice(0, 16)}.json`
  await fs.writeFile(new URL(`effects-atlas/${searchName}`, publicRoot), searchJson)
  await fs.writeFile(new URL('effects-atlas/catalog.json', publicRoot), JSON.stringify({ categories: catalog, searchIndex: `/effects-atlas/${searchName}` }))
  return { categories: catalog.length, items: catalog.reduce((n, category) => n + category.itemCount, 0) }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await buildAtlasCatalog()))
