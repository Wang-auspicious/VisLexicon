import fs from 'node:fs'
import path from 'node:path'
import {verifiedCurationAllowance} from './verified-curation-budget.mjs'

const root = process.cwd()
const readJson = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'))
const fail = message => { throw new Error(`PUBLIC_BUDGET_FAILED: ${message}`) }

const prompts = readJson('src/data/image-prompts.json')
if (!Array.isArray(prompts) || prompts.length > 12) fail(`image prompt examples: ${prompts.length}`)
if (prompts.some(item => /xhs[-_]|小红书/iu.test(JSON.stringify(item)))) fail('private social collection marker found in prompt examples')

const release = readJson('public/release.json')
const siteIndex = readJson('public/data/site-index.json')
if (!Array.isArray(siteIndex.items)) fail('site items missing')
const verified = verifiedCurationAllowance(root, siteIndex, release)
if (siteIndex.items.filter(item => !verified.has(item.entryId)).length > 6) fail(`unbatched site examples: ${siteIndex.items.length - verified.size}`)

for (const scope of ['curation', 'atlas', 'skills', 'ppt', 'science', 'graphics']) {
  const index = readJson(`public/data/discovery/scopes/${scope}.json`)
  if (!Array.isArray(index.units) || index.units.filter(item => scope !== 'curation' || !verified.has(item.entryId)).length > 12) fail(`${scope} discovery examples: ${index.units?.length}`)
  if (index.units.length > 12 + (scope === 'curation' ? verified.size : 0)) fail(`${scope} repeated batch entries`)
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

console.log(`Public budget verified: ${prompts.length} prompts, ${siteIndex.items.length} sites (${verified.size} independently reviewed additions), <=12 unbatched examples per discovery scope, ${imageCount} prompt images.`)
