import test from 'node:test'
import assert from 'node:assert/strict'
import { atlasFrameUrl, stageCategoryFor, termTail } from '../src/lib/atlas-deeplink.js'

test('atlasFrameUrl encodes locale, theme and deep-link ids', () => {
  assert.equal(
    atlasFrameUrl({ origin: 'https://vislexicon.test', locale: 'en', theme: 'dark', stageId: 'form-anatomy', termId: 'atlas-component-component-combobox' }),
    'https://vislexicon.test/effects-atlas/index.html?lang=en&theme=dark&stageId=form-anatomy&termId=atlas-component-component-combobox',
  )
})

test('atlasFrameUrl carries a term search query for unclaimed atlas results', () => {
  assert.equal(
    atlasFrameUrl({ origin: 'https://vislexicon.test', locale: 'zh', theme: 'light', query: 'dialog modal' }),
    'https://vislexicon.test/effects-atlas/index.html?lang=zh&theme=light&q=dialog+modal',
  )
})

test('stageCategoryFor maps stage manifests to the iframe categories', () => {
  assert.equal(stageCategoryFor('form-anatomy'), 'form')
  assert.equal(stageCategoryFor('navigation'), 'nav')
  assert.equal(stageCategoryFor('unknown'), 'unknown')
})

test('termTail strips the stable atlas prefix for deterministic resolution', () => {
  assert.equal(termTail('atlas-component-component-combobox'), 'combobox')
  assert.equal(termTail(''), '')
})
