import test from 'node:test'
import assert from 'node:assert/strict'
import { composePrompt } from '../public/effects-atlas/fx/index.js'

test('prompt stays entirely in the selected language', () => {
  const item = { zh: '渐变文字', en: 'Gradient text', dz: '颜色从左到右变化', de: 'Colour changes from left to right', pz: '使用渐变填充', pe: 'Use a gradient fill' }
  const cat = { zh: '文字效果', en: 'Text effects' }
  const zh = composePrompt(item, cat, 'zh', {}, {})
  const en = composePrompt(item, cat, 'en', {}, {})
  assert.match(zh, /渐变文字/)
  assert.doesNotMatch(zh, /Gradient text/)
  assert.match(en, /Gradient text/)
  assert.doesNotMatch(en, /渐变文字/)
})
