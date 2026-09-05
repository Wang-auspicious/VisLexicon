import assert from 'node:assert/strict'
import test from 'node:test'

import { classifySourceRecord } from '../scripts/build-visual-atlas.mjs'
import {
  parseAnimationVocabulary,
  parseFigmaPluginVocabulary,
  parseGoogleFontsAxisTextproto,
  parseGovukFrontmatter,
  parseMdxFrontmatter,
  parseOpenUiResearch,
  parseTypedArraySource,
  parseWaiPattern,
} from '../scripts/visual-atlas/source-parsers.mjs'

test('Google Fonts axis parser keeps one axis and ignores fallback positions', () => {
  const source = `
# opsz axis
tag: "opsz"
display_name: "Optical Size"
min_value: 5   
max_value: 1200
default_value: 14 # family-specific default
precision: -1
fallback {
  name: "6pt"
  value: 6
}
fallback {
  name: "12pt"
  value: 12
}
fallback_only: false
description:
  "Adapt the style to specific text sizes."
  " At smaller sizes, letters become more legible."
`

  assert.deepEqual(parseGoogleFontsAxisTextproto(source), {
    tag: 'opsz',
    displayName: 'Optical Size',
    minValue: 5,
    defaultValue: 14,
    maxValue: 1200,
    precision: -1,
    fallbackOnly: false,
    description: 'Adapt the style to specific text sizes. At smaller sizes, letters become more legible.',
  })
})

test('Figma typings parser preserves vocabulary namespaces and interface unions', () => {
  const source = `
type BlendMode = 'NORMAL' | 'MULTIPLY'
type TextCase = 'ORIGINAL' | 'UPPER'
type TextDecoration = 'NONE' | 'UNDERLINE'
type ConstraintType = 'MIN' | 'CENTER'
type OverlayPositionType = 'CENTER' | 'MANUAL'

interface SimpleTransition {
  readonly type: 'DISSOLVE' | 'SMART_ANIMATE'
  readonly duration: number
}
interface DirectionalTransition {
  readonly type: 'MOVE_IN' | 'PUSH'
  readonly direction: 'LEFT' | 'RIGHT'
}
interface Easing {
  readonly type: 'EASE_IN' | 'CUSTOM_SPRING'
}
interface AutoLayoutMixin {
  layoutMode: 'NONE' | 'HORIZONTAL'
  layoutWrap: 'NO_WRAP' | 'WRAP'
  primaryAxisAlignItems: 'MIN' | 'CENTER'
  counterAxisAlignItems: 'MIN' | 'CENTER'
  counterAxisAlignContent: 'AUTO' | 'SPACE_BETWEEN'
}
`

  const records = parseFigmaPluginVocabulary(source)
  assert.equal(records.length, 28)
  assert.equal(new Set(records.map(({ sourceRecordId }) => sourceRecordId)).size, records.length)
  assert.ok(records.some(({ termEn }) => termEn === 'Blend mode: Multiply'))
  assert.ok(records.some(({ termEn }) => termEn === 'Simple transition: Dissolve'))
  assert.ok(records.some(({ termEn }) => termEn === 'Transition direction: Left'))
  assert.ok(records.some(({ termEn }) => termEn === 'Auto layout wrap: Wrap'))

  const centers = records.filter(({ sourceMetadata }) => sourceMetadata.literal === 'CENTER')
  assert.deepEqual(
    centers.map(({ sourceMetadata }) => sourceMetadata.namespace).sort(),
    ['constraint', 'counter-axis-alignment', 'overlay-position', 'primary-axis-alignment'],
  )
})

test('MDN CSS records map to deterministic visual and interaction axes', () => {
  assert.deepEqual(
    classifySourceRecord('mdn-css', {
      termEn: 'animation',
      sourceCategory: 'css-shorthand-property',
    }),
    { axis: 'motion', recordType: 'design-phenomenon' },
  )
  assert.deepEqual(
    classifySourceRecord('mdn-css', {
      termEn: 'grid-template-columns',
      sourceCategory: 'css-property',
    }),
    { axis: 'layout', recordType: 'design-phenomenon' },
  )
  assert.deepEqual(
    classifySourceRecord('mdn-css', {
      termEn: ':focus-visible',
      sourceCategory: 'css-pseudo-class',
    }),
    { axis: 'interaction', recordType: 'design-phenomenon' },
  )
  assert.deepEqual(
    classifySourceRecord('mdn-css', {
      termEn: 'box-shadow',
      sourceCategory: 'css-property',
    }),
    { axis: 'aesthetic', recordType: 'design-phenomenon' },
  )
  assert.deepEqual(
    classifySourceRecord('mdn-css', {
      termEn: '@media',
      sourceCategory: 'css-at-rule',
    }),
    { axis: 'layout', recordType: 'pattern' },
  )
  assert.deepEqual(
    classifySourceRecord('mdn-css', {
      termEn: 'Child combinator',
      sourceCategory: 'css-combinator',
    }),
    { axis: 'interaction', recordType: 'pattern' },
  )
})

test('Figma vocabulary namespaces map to visual, layout, and motion axes', () => {
  assert.deepEqual(
    classifySourceRecord('figma-plugin-vocabularies', {
      termEn: 'Blend mode: Multiply',
      sourceCategory: 'figma-aesthetic',
    }),
    { axis: 'aesthetic', recordType: 'design-phenomenon' },
  )
  assert.deepEqual(
    classifySourceRecord('figma-plugin-vocabularies', {
      termEn: 'Overlay position: Top left',
      sourceCategory: 'figma-layout',
    }),
    { axis: 'layout', recordType: 'design-phenomenon' },
  )
  assert.deepEqual(
    classifySourceRecord('figma-plugin-vocabularies', {
      termEn: 'Easing: Custom spring',
      sourceCategory: 'figma-motion',
    }),
    { axis: 'motion', recordType: 'design-phenomenon' },
  )
})

test('Google Fonts axes remain aesthetic candidate phenomena', () => {
  assert.deepEqual(
    classifySourceRecord('google-fonts-axis-registry', {
      termEn: 'Variable font axis: Optical Size',
      sourceCategory: 'variable-font-axis',
    }),
    { axis: 'aesthetic', recordType: 'design-phenomenon' },
  )
})

test('animation vocabulary parser ignores examples before the glossary', () => {
  const markdown = `
- **Not a term** — This example must not be imported.

## Glossary

### Entrances & Exits — how elements appear
- **Fade in / Fade out** — Element appears or disappears by changing opacity.
- **Slide in** — Element enters by sliding in from off-screen.

### Performance — what keeps motion smooth
- **Jank** — Visible stutter when the browser drops frames.
`

  assert.deepEqual(parseAnimationVocabulary(markdown), [
    {
      sourceRecordId: 'fade-in-fade-out',
      termEn: 'Fade in / Fade out',
      sourceDefinition: 'Element appears or disappears by changing opacity.',
      sourceCategory: 'Entrances & Exits',
    },
    {
      sourceRecordId: 'slide-in',
      termEn: 'Slide in',
      sourceDefinition: 'Element enters by sliding in from off-screen.',
      sourceCategory: 'Entrances & Exits',
    },
    {
      sourceRecordId: 'jank',
      termEn: 'Jank',
      sourceDefinition: 'Visible stutter when the browser drops frames.',
      sourceCategory: 'Performance',
    },
  ])
})

test('typed array parser returns only the requested official export', () => {
  const source = `
import { Thing } from '../types'
export const THINGS: Thing[] = [
  { id: "thing_one", name: "One", nested: { value: true } },
  { id: "thing_two", name: "Two", labels: ["a", "b"] },
];
`

  assert.deepEqual(parseTypedArraySource(source, 'THINGS'), [
    { id: 'thing_one', name: 'One', nested: { value: true } },
    { id: 'thing_two', name: 'Two', labels: ['a', 'b'] },
  ])
  assert.throws(() => parseTypedArraySource(source, 'MISSING'), /Unable to find/)
})

test('assistant-ui MDX parser reads quoted frontmatter', () => {
  const source = `---
title: "Composer"
description: "The unified input: attachments, commands, mentions, models, voice, and context."
---

Body text.
`

  assert.deepEqual(parseMdxFrontmatter(source), {
    title: 'Composer',
    description: 'The unified input: attachments, commands, mentions, models, voice, and context.',
    aliases: [],
    section: '',
  })
})

test('GOV.UK parser keeps section and comma-separated aliases', () => {
  const source = `---
title: Addresses
description: Help users provide an address
section: Patterns
aliases: postcode, postal address
layout: layout-pane.njk
---
`

  assert.deepEqual(parseGovukFrontmatter(source), {
    title: 'Addresses',
    description: 'Help users provide an address',
    aliases: ['postcode', 'postal address'],
    section: 'Patterns',
  })
})

test('GOV.UK archived patterns use the first source-owned paragraph as their summary', () => {
  const source = `---
title: Gender or sex
layout: layout-archived.njk
ignoreInSitemap: true
---

For up to date information, see the ask users for equality information pattern.
`

  assert.deepEqual(parseGovukFrontmatter(source), {
    title: 'Gender or sex',
    description: 'For up to date information, see the ask users for equality information pattern.',
    aliases: [],
    section: '',
  })
})

test('frontmatter parser fails closed when evidence metadata is missing', () => {
  assert.throws(() => parseMdxFrontmatter('No frontmatter'), /Missing frontmatter/)
  assert.throws(
    () => parseMdxFrontmatter('---\ntitle: Missing description\n---\n'),
    /description/,
  )
})

test('WAI pattern parser extracts the canonical title and About summary', () => {
  const source = `<!doctype html><html><head><title>Accordion Pattern</title></head><body>
  <main><h1>Accordion Pattern (Sections With Show/Hide Functionality)</h1>
  <section id="about"><h2>About This Pattern</h2><p>
    An accordion is a vertically stacked set of interactive headings that reveal or hide content.
  </p></section></main></body></html>`

  assert.deepEqual(parseWaiPattern(source), {
    title: 'Accordion',
    description: 'An accordion is a vertically stacked set of interactive headings that reveal or hide content.',
  })
})

test('Open UI research parser uses prose when present and a bounded topic summary otherwise', () => {
  const withProse = `---
name: Accordion
menu: Research
---

An accordion is a sequence of
[disclosure](/components/disclosure.research)
widgets in a row.
`
  assert.deepEqual(parseOpenUiResearch(withProse), {
    title: 'Accordion',
    description: 'An accordion is a sequence of disclosure widgets in a row.',
    summaryQuality: 'source-prose',
  })

  const withoutProse = `---
name: Avatar
menu: Research
---

import Anatomy from '../../components/anatomy'

## Anatomy

<Anatomy component="Avatar" />
`
  assert.deepEqual(parseOpenUiResearch(withoutProse), {
    title: 'Avatar',
    description: 'Open UI research topic: Avatar.',
    summaryQuality: 'taxonomy-summary',
  })
})
