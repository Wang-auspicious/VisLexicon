/* 把 LLM 手写翻译合并进 visual-atlas 翻译缓存 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { translationKey } from './translate-visual-atlas.mjs'
import { normalizeSourceText } from './visual-atlas/web-collectors.mjs'
import { NEW_ATLAS_TRANSLATIONS } from '../data/visual-atlas-translations.new.js'

const DEMO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..')
const CACHE_PATH = resolve(DEMO_ROOT, 'data/visual-atlas-translations.zh.json')

const cache = JSON.parse(await readFile(CACHE_PATH, 'utf8'))
let added = 0
let skipped = 0
for (const [rawOriginal, translationZh] of Object.entries(NEW_ATLAS_TRANSLATIONS)) {
  const original = normalizeSourceText(rawOriginal)
  const key = translationKey(original)
  const existing = cache.translations[key]
  if (existing && existing.original === original && existing.translationZh) {
    skipped += 1
    continue
  }
  if (!/[\u3400-\u9fff]/u.test(translationZh)) {
    throw new Error(`translation missing Chinese text: ${original}`)
  }
  cache.translations[key] = { original, translationZh, quality: 'machine' }
  added += 1
}

// 复核缓存一致性
for (const [key, item] of Object.entries(cache.translations)) {
  if (translationKey(item.original) !== key) throw new Error(`cache key mismatch: ${item.original}`)
  if (!item.translationZh) throw new Error(`empty translation: ${item.original}`)
}

cache.translationCount = Object.keys(cache.translations).length
cache.collectedAt = new Date().toISOString().slice(0, 10)
await writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`)
console.log(`merged: added=${added} skipped=${skipped} total=${cache.translationCount}`)
