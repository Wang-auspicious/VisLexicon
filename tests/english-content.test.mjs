import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { englishText, displayName, topicEnglish, hasHan } from '../src/lib/localized-content.js'
import { IMAGE_PROMPT_TOPICS } from '../src/lib/image-prompts.js'

const read = name => JSON.parse(fs.readFileSync(new URL(name, import.meta.url), 'utf8'))
test('every image resource has a complete English prompt and attribution', () => {
  const items = read('../src/data/image-prompts.json')
  const english = read('../src/data/image-prompts.en.json')
  assert.deepEqual(Object.keys(english).sort(), items.map(item => item.id).sort())
  for (const item of items) {
    const translated = english[item.id]
    for (const [field, value] of Object.entries(translated)) assert.ok(!hasHan(value), `${item.id}.${field} contains Chinese`)
    if (item.prompt) assert.ok(translated.prompt?.trim().length > 30, `${item.id} needs its full prompt`)
    if (item.imageCredit) assert.ok(translated.imageCredit)
    if (item.sourceName) assert.ok(translated.sourceName)
    if (item.comparison?.caption) assert.ok(translated.comparisonCaption)
  }
  for (const topic of IMAGE_PROMPT_TOPICS) assert.ok(!hasHan(topicEnglish(topic)))
})

test('English presentation never falls back to Chinese fields', () => {
  assert.equal(englishText('Chinese 中文', 'Source'), 'Source')
  assert.equal(displayName({ name: '中文网站', domain: 'example.com' }, 'en'), 'example.com')
  assert.equal(displayName({ name: '中文网站', nameEn: 'English name' }, 'en'), 'English name')
  assert.equal(displayName({ name: '中文网站' }, 'zh'), '中文网站')
})

test('English creative-practice copy stays English in detail and copy actions', () => {
  for (const item of read('../src/data/creative-practices.json')) {
    for (const key of ['en', 'de', 'pe', 'kw']) assert.ok(!hasHan(JSON.stringify(item[key])), `${item.id}.${key}`)
    for (const [key, value] of Object.entries(item.practice || {})) assert.ok(!hasHan(JSON.stringify(value?.en)), `${item.id}.practice.${key}`)
  }
})
