import { runInNewContext } from 'node:vm'

import { normalizeTerm } from './normalize.mjs'

function unquote(value) {
  const trimmed = String(value ?? '').trim()
  const quoted = trimmed.match(/^(["'])([\s\S]*)\1$/)
  return quoted ? quoted[2] : trimmed
}

export function parseAnimationVocabulary(markdown) {
  const records = []
  let inGlossary = false
  let sourceCategory = ''

  for (const line of markdown.split(/\r?\n/)) {
    if (line.trim() === '## Glossary') {
      inGlossary = true
      continue
    }
    if (!inGlossary) continue

    const heading = line.match(/^###\s+(.+?)\s*$/)?.[1]
    if (heading) {
      sourceCategory = heading.split(/\s+—\s+/)[0].trim()
      continue
    }

    const item = line.match(/^- \*\*(.+?)\*\*\s+—\s+(.+?)\s*$/)
    if (!item) continue
    const termEn = item[1].trim()
    records.push({
      sourceRecordId: normalizeTerm(termEn),
      termEn,
      sourceDefinition: item[2].trim(),
      sourceCategory,
    })
  }

  return records
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function parseTypedArraySource(source, exportName) {
  const escapedName = escapeRegExp(exportName)
  const match = source.match(
    new RegExp(`export\\s+const\\s+${escapedName}\\s*:[^=]+?=\\s*(\\[[\\s\\S]*\\]);\\s*$`),
  )
  if (!match) throw new Error(`Unable to find typed array export ${exportName}`)

  const value = runInNewContext(`(${match[1]})`, Object.create(null), { timeout: 1_000 })
  if (!Array.isArray(value)) throw new TypeError(`${exportName} must evaluate to an array`)
  return structuredClone(value)
}

export const FIGMA_PLUGIN_VOCABULARIES = [
  { namespace: 'blend-mode', label: 'Blend mode', kind: 'type', owner: 'BlendMode', expectedCount: 19, category: 'figma-aesthetic', doc: 'BlendMode' },
  { namespace: 'text-case', label: 'Text case', kind: 'type', owner: 'TextCase', expectedCount: 6, category: 'figma-aesthetic', doc: 'TextCase' },
  { namespace: 'text-decoration', label: 'Text decoration', kind: 'type', owner: 'TextDecoration', expectedCount: 3, category: 'figma-aesthetic', doc: 'TextDecoration' },
  { namespace: 'constraint', label: 'Constraint', kind: 'type', owner: 'ConstraintType', expectedCount: 5, category: 'figma-layout', doc: 'Constraints' },
  { namespace: 'overlay-position', label: 'Overlay position', kind: 'type', owner: 'OverlayPositionType', expectedCount: 8, category: 'figma-layout', doc: 'Overlay' },
  { namespace: 'simple-transition', label: 'Simple transition', kind: 'interface', owner: 'SimpleTransition', property: 'type', expectedCount: 3, category: 'figma-motion', doc: 'Transition' },
  { namespace: 'directional-transition', label: 'Directional transition', kind: 'interface', owner: 'DirectionalTransition', property: 'type', expectedCount: 5, category: 'figma-motion', doc: 'Transition' },
  { namespace: 'transition-direction', label: 'Transition direction', kind: 'interface', owner: 'DirectionalTransition', property: 'direction', expectedCount: 4, category: 'figma-motion', doc: 'Transition' },
  { namespace: 'easing', label: 'Easing', kind: 'interface', owner: 'Easing', property: 'type', expectedCount: 13, category: 'figma-motion', doc: 'Transition' },
  { namespace: 'auto-layout-mode', label: 'Auto layout mode', kind: 'interface', owner: 'AutoLayoutMixin', property: 'layoutMode', expectedCount: 4, category: 'figma-layout', doc: 'AutoLayoutMixin' },
  { namespace: 'auto-layout-wrap', label: 'Auto layout wrap', kind: 'interface', owner: 'AutoLayoutMixin', property: 'layoutWrap', expectedCount: 2, category: 'figma-layout', doc: 'AutoLayoutMixin' },
  { namespace: 'primary-axis-alignment', label: 'Primary axis alignment', kind: 'interface', owner: 'AutoLayoutMixin', property: 'primaryAxisAlignItems', expectedCount: 6, category: 'figma-layout', doc: 'AutoLayoutMixin' },
  { namespace: 'counter-axis-alignment', label: 'Counter axis alignment', kind: 'interface', owner: 'AutoLayoutMixin', property: 'counterAxisAlignItems', expectedCount: 4, category: 'figma-layout', doc: 'AutoLayoutMixin' },
  { namespace: 'counter-axis-track-alignment', label: 'Counter axis track alignment', kind: 'interface', owner: 'AutoLayoutMixin', property: 'counterAxisAlignContent', expectedCount: 2, category: 'figma-layout', doc: 'AutoLayoutMixin' },
]

function withoutTypeScriptComments(source) {
  return String(source)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
}

function stringLiterals(value) {
  return [...value.matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1])
}

function typeExpression(source, name) {
  const escapedName = escapeRegExp(name)
  const match = source.match(
    new RegExp(`\\btype\\s+${escapedName}\\s*=([\\s\\S]*?)(?=\\n(?:type|interface|declare|const|function|class|namespace)\\s+|$)`),
  )
  if (!match) throw new Error(`Unable to find Figma type ${name}`)
  return match[1]
}

function interfaceBody(source, name) {
  const escapedName = escapeRegExp(name)
  const match = new RegExp(`\\binterface\\s+${escapedName}\\s*\\{`).exec(source)
  if (!match) throw new Error(`Unable to find Figma interface ${name}`)
  const brace = source.indexOf('{', match.index)
  let depth = 0
  let quote = ''
  for (let index = brace; index < source.length; index += 1) {
    const character = source[index]
    if (quote) {
      if (character === quote && source[index - 1] !== '\\') quote = ''
      continue
    }
    if (character === "'" || character === '"' || character === '`') {
      quote = character
      continue
    }
    if (character === '{') depth += 1
    else if (character === '}') {
      depth -= 1
      if (depth === 0) return source.slice(brace + 1, index)
    }
  }
  throw new Error(`Unclosed Figma interface ${name}`)
}

function interfacePropertyExpression(source, interfaceName, propertyName) {
  const body = interfaceBody(source, interfaceName)
  const escapedProperty = escapeRegExp(propertyName)
  const match = new RegExp(`(?:readonly\\s+)?${escapedProperty}\\??\\s*:`).exec(body)
  if (!match) throw new Error(`Unable to find Figma property ${interfaceName}.${propertyName}`)
  const tail = body.slice(match.index + match[0].length)
  const boundary = tail.search(/\n\s*(?:readonly\s+)?[A-Za-z_$][\w$]*\??\s*:/)
  return boundary >= 0 ? tail.slice(0, boundary) : tail
}

function humanizeFigmaLiteral(value) {
  return value
    .toLocaleLowerCase('en-US')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase('en-US') + word.slice(1))
    .join(' ')
}

export function parseFigmaPluginVocabulary(source) {
  const cleanSource = withoutTypeScriptComments(source)
  return FIGMA_PLUGIN_VOCABULARIES.flatMap((spec) => {
    const expression = spec.kind === 'type'
      ? typeExpression(cleanSource, spec.owner)
      : interfacePropertyExpression(cleanSource, spec.owner, spec.property)
    const values = stringLiterals(expression)
    if (values.length === 0) throw new Error(`Figma vocabulary ${spec.namespace} is empty`)
    return values.map((literal) => ({
      sourceRecordId: `${spec.namespace}-${normalizeTerm(literal)}`,
      termEn: `${spec.label}: ${humanizeFigmaLiteral(literal)}`,
      sourceDefinition: `Figma Plugin API declares ${literal} as a ${spec.label.toLocaleLowerCase('en-US')} option.`,
      sourceCategory: spec.category,
      sourceMetadata: {
        namespace: spec.namespace,
        literal,
        declaration: spec.property ? `${spec.owner}.${spec.property}` : spec.owner,
        aliases: [literal],
        summaryQuality: 'taxonomy-summary',
      },
    }))
  })
}

function textprotoQuotedField(source, field) {
  const escapedField = escapeRegExp(field)
  const match = new RegExp(`^${escapedField}:\\s*("(?:\\\\.|[^"\\\\])*")\\s*$`, 'm').exec(source)
  if (!match) throw new Error(`Axis textproto is missing ${field}`)
  return JSON.parse(match[1])
}

function textprotoNumberField(source, field) {
  const escapedField = escapeRegExp(field)
  const match = new RegExp(
    `^${escapedField}:\\s*(-?(?:\\d+(?:\\.\\d*)?|\\.\\d+))\\s*(?:#.*)?$`,
    'm',
  ).exec(source)
  if (!match) throw new Error(`Axis textproto is missing numeric ${field}`)
  const value = Number(match[1])
  if (!Number.isFinite(value)) throw new Error(`Axis textproto has invalid ${field}`)
  return value
}

function textprotoBooleanField(source, field) {
  const escapedField = escapeRegExp(field)
  const match = new RegExp(`^${escapedField}:\\s*(true|false)\\s*$`, 'm').exec(source)
  if (!match) throw new Error(`Axis textproto is missing boolean ${field}`)
  return match[1] === 'true'
}

function textprotoDescription(source) {
  const lines = String(source).split(/\r?\n/)
  const start = lines.findIndex((line) => /^description:\s*/.test(line))
  if (start < 0) throw new Error('Axis textproto is missing description')
  const block = [lines[start].replace(/^description:\s*/, '')]
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^[A-Za-z_][\w]*:\s*/.test(lines[index])) break
    block.push(lines[index])
  }
  const fragments = [...block.join('\n').matchAll(/"(?:\\.|[^"\\])*"/g)]
    .map((match) => JSON.parse(match[0]))
  const description = fragments.join('').replace(/\s+/g, ' ').trim()
  if (!description) throw new Error('Axis textproto has an empty description')
  return description
}

export function parseGoogleFontsAxisTextproto(source) {
  const minValue = textprotoNumberField(source, 'min_value')
  const defaultValue = textprotoNumberField(source, 'default_value')
  const maxValue = textprotoNumberField(source, 'max_value')
  const precision = textprotoNumberField(source, 'precision')
  if (!Number.isInteger(precision)) throw new Error('Axis textproto precision must be an integer')
  if (minValue > defaultValue || defaultValue > maxValue) {
    throw new Error('Axis textproto default must be within its range')
  }

  return {
    tag: textprotoQuotedField(source, 'tag'),
    displayName: textprotoQuotedField(source, 'display_name'),
    minValue,
    defaultValue,
    maxValue,
    precision,
    fallbackOnly: textprotoBooleanField(source, 'fallback_only'),
    description: textprotoDescription(source),
  }
}

function frontmatterFields(source) {
  const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  if (!block) throw new Error('Missing frontmatter')

  const fields = {}
  for (const line of block.split(/\r?\n/)) {
    const split = line.indexOf(':')
    if (split < 0) continue
    fields[line.slice(0, split).trim()] = unquote(line.slice(split + 1))
  }

  return fields
}

function frontmatterResult(fields, description) {
  if (!fields.title) throw new Error('Frontmatter is missing title')
  if (!description) throw new Error('Frontmatter is missing description')

  return {
    title: fields.title,
    description,
    aliases: fields.aliases
      ? fields.aliases.split(',').map((value) => value.trim()).filter(Boolean)
      : [],
    section: fields.section || '',
  }
}

export function parseMdxFrontmatter(source) {
  const fields = frontmatterFields(source)
  return frontmatterResult(fields, fields.description)
}

function firstSourceParagraph(source) {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '')
  const paragraph = body
    .split(/\r?\n\s*\r?\n/)
    .map((value) => value.trim())
    .find((value) => value && !/^(?:#|\{[%{]|<!--)/.test(value))
  return String(paragraph ?? '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseGovukFrontmatter(source) {
  const fields = frontmatterFields(source)
  return frontmatterResult(fields, fields.description || firstSourceParagraph(source))
}

function cleanMarkup(value) {
  return String(value ?? '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;|&#38;|&#x26;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&#x27;|&apos;/gi, "'")
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseWaiPattern(source) {
  const rawTitle = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  const about = source.match(
    /<section[^>]+id=["']about["'][^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i,
  )?.[1]
  const title = cleanMarkup(rawTitle).replace(/\s+Pattern(?:\s*\(.*\))?$/i, '').trim()
  const description = cleanMarkup(about)
  if (!title) throw new Error('WAI pattern is missing title')
  if (!description) throw new Error(`WAI pattern is missing About summary: ${title}`)
  return { title, description }
}

function firstMarkdownParagraph(source) {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '')
  const paragraph = body
    .split(/\r?\n\s*\r?\n/)
    .map((value) => value.trim())
    .find((value) =>
      value &&
      !/^(?:import\s|export\s|#|<|\{[%{]|<!--)/.test(value),
    )
  return cleanMarkup(paragraph)
}

export function parseOpenUiResearch(source) {
  const fields = frontmatterFields(source)
  const title = fields.name || fields.title
  if (!title) throw new Error('Open UI research page is missing name')
  const prose = firstMarkdownParagraph(source)
  return {
    title,
    description: prose || `Open UI research topic: ${title}.`,
    summaryQuality: prose ? 'source-prose' : 'taxonomy-summary',
  }
}
