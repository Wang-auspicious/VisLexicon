import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const readJson = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'))
const fail = message => { throw new Error(`PUBLIC_BUDGET_FAILED: ${message}`) }

const prompts = readJson('src/data/image-prompts.json')
if (!Array.isArray(prompts) || prompts.length > 12) fail(`image prompt examples: ${prompts.length}`)
if (prompts.some(item => /xhs[-_]|小红书/iu.test(JSON.stringify(item)))) fail('private social collection marker found in prompt examples')

const siteIndex = readJson('public/data/site-index.json')
if (!Array.isArray(siteIndex.items) || siteIndex.items.length > 6) fail(`site examples: ${siteIndex.items?.length}`)

for (const scope of ['curation', 'atlas', 'skills', 'ppt', 'science', 'graphics']) {
  const index = readJson(`public/data/discovery/scopes/${scope}.json`)
  if (!Array.isArray(index.units) || index.units.length > 12) fail(`${scope} discovery examples: ${index.units?.length}`)
}

const forbidden = [
  'public/data/harvest-v4',
  'public/data/discovery/v4-full-private',
  'public/images/image-prompts/xhs-',
  'public/images/image-prompts/xhs-liked-',
  'public/images/image-prompts/xhs-meituhub-',
]
for (const relative of forbidden) {
  if (fs.existsSync(path.join(root, relative))) fail(`private path present: ${relative}`)
}

const imageDir = path.join(root, 'public/images/image-prompts')
const imageCount = fs.existsSync(imageDir) ? fs.readdirSync(imageDir).length : 0
if (imageCount > 24) fail(`image prompt assets: ${imageCount}`)

console.log(`Public budget verified: ${prompts.length} prompts, ${siteIndex.items.length} sites, <=12 examples per discovery scope, ${imageCount} prompt images.`)
