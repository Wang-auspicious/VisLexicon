/* 找出图鉴构建所需的、尚未翻译的原文，生成 pending 清单供人工/LLM 补译。
 * 用法：node scripts/atlas-translation-pending.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { translationKey } from './translate-visual-atlas.mjs'
import { normalizeSourceText } from './visual-atlas/web-collectors.mjs'
import { COUNTED_SOURCE_IDS } from './build-visual-atlas.mjs'

const DEMO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..')
const RAW_DIR = resolve(DEMO_ROOT, 'data/visual-atlas-sources')
const TRANSLATIONS = resolve(DEMO_ROOT, 'data/visual-atlas-translations.zh.json')

const cache = JSON.parse(await readFile(TRANSLATIONS, 'utf8'))
const pending = new Map()

for (const sourceId of COUNTED_SOURCE_IDS) {
  let snapshot
  try {
    snapshot = JSON.parse(await readFile(resolve(RAW_DIR, `${sourceId}.raw.json`), 'utf8'))
  } catch (error) {
    console.log(`skip ${sourceId}: ${error.message}`)
    continue
  }
  for (const record of snapshot.records) {
    if (record.sourceMetadata?.nativeZh) continue // 原生中文，无需缓存翻译
    for (const [kind, rawOriginal] of [['term', record.termEn], ['definition', record.sourceDefinition]]) {
      const original = normalizeSourceText(rawOriginal)
      const key = translationKey(original)
      const item = cache.translations[key]
      if (item && item.original === original && item.translationZh) continue
      pending.set(key, { key, kind, sourceId, original })
    }
  }
}

const output = resolve(DEMO_ROOT, 'data/visual-atlas-translations.pending.json')
await writeFile(output, `${JSON.stringify({ count: pending.size, items: [...pending.values()] }, null, 2)}\n`)
console.log(`pending translations: ${pending.size}`)
for (const item of pending.values()) {
  console.log(`[${item.sourceId}/${item.kind}] ${item.original.slice(0, 90)}`)
}
