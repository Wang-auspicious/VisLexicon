/* 试构建：toools + external + saaslandingpage + npm（暂不含 ecosystem） */
import { buildSiteCatalog, validateSiteCatalog, buildPublicSiteIndex } from './build-site-catalog.mjs'

const options = {
  toools: 'data/sources/toools-design.raw.json',
  external: 'data/sources/design-resources-for-developers.raw.json',
  saaslandingpage: 'data/sources/saaslandingpage.raw.json',
  npm: 'data/sources/npm-resources.raw.json',
  ecosystem: null,
  translations: 'data/sources/site-descriptions.zh.raw.json',
  output: 'src/data/site-catalog.json',
  indexOutput: 'public/data/site-catalog-index.json',
}

// minimal: build with ecosystem absent — construct rawSources manually
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEMO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..')
const paths = [options.toools, options.external, options.saaslandingpage, options.npm].map((p) => resolve(DEMO_ROOT, p))
const rawSources = await Promise.all(paths.map(async (p) => JSON.parse(await readFile(p, 'utf8'))))
const translationCache = JSON.parse(await readFile(resolve(DEMO_ROOT, options.translations), 'utf8'))

// reuse merge logic via a temporary hack: monkey-build by importing internals is not exported;
// so call buildSiteCatalog with a stub ecosystem file if it doesn't exist
import { existsSync } from 'node:fs'
if (!existsSync(resolve(DEMO_ROOT, 'data/sources/ecosystem-repos.raw.json'))) {
  // create empty ecosystem file so the build runs
  await import('node:fs/promises').then((fs) => fs.writeFile(
    resolve(DEMO_ROOT, 'data/sources/ecosystem-repos.raw.json'),
    JSON.stringify({ schemaVersion: 1, source: { id: 'ecosystem-repos', name: 'x', url: 'https://repos.ecosyste.ms/', collectedAt: '2026-08-31', rawRecordCount: 0, failures: [] }, records: [] }, null, 2) + '\n',
  ))
  console.log('created empty ecosystem stub')
}

const catalog = await buildSiteCatalog(options)
const errors = validateSiteCatalog(catalog)
console.log('entries:', catalog.entries.length)
console.log('byCategory:', JSON.stringify(catalog.stats.byCategory))
console.log('bySource:', JSON.stringify(catalog.stats.sourceCoverage))
console.log('fallback:', catalog.stats.chineseDescriptions.taxonomyFallback, 'translated:', catalog.stats.chineseDescriptions.machineTranslated)
console.log('errors:', errors.length, errors.slice(0, 10))
const index = buildPublicSiteIndex(catalog)
console.log('index bytes:', Buffer.byteLength(JSON.stringify(index)))
