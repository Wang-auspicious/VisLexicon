import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { loadDiscoveryIndex } from '../server/discovery-index.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const sites = read('public/data/site-index.json').items
const prompts = read('src/data/image-prompts.json')
const missing = new Set()
function checkAssets(value) {
  if (typeof value === 'string' && /^\/(images|shots|fonts|source-icons|practice-previews|prototype-assets|effects-atlas|data\/discovery\/previews)\//.test(value)) {
    const asset = value.split(/[?#]/)[0]
    if (!fs.existsSync(path.join(root, 'public', asset))) missing.add(asset)
  } else if (Array.isArray(value)) value.forEach(checkAssets)
  else if (value && typeof value === 'object') Object.values(value).forEach(checkAssets)
}
for (const site of sites) {
  checkAssets(site)
  checkAssets(read(`public/data/site/${site.entryId}.json`))
  for (const file of [`public/r/${site.entryId}.json`, `public/site/${site.entryId}.md`]) assert.ok(fs.existsSync(path.join(root, file)), file)
}
for (const prompt of prompts) checkAssets(prompt)
assert.equal(new Set(prompts.map(p => p.id)).size, prompts.length)
for (const scope of ['curation', 'atlas', 'skills', 'ppt', 'science']) {
  const index = await loadDiscoveryIndex(root, scope)
  checkAssets(index)
}
assert.deepEqual([...missing], [], 'Missing demo assets')
assert.equal((await loadDiscoveryIndex(root, 'skills', 'image')).units.length, prompts.length)
console.log(`Demo verified: ${sites.length} sites, ${prompts.length} image resources, all referenced assets present.`)
