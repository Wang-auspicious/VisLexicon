// Resolve every bench parameter against the component's own TypeScript types or PropTypes declarations.
// For each live catalog entry this lists the component's own props (not the
// inherited DOM/React attributes), with type, JSDoc, and default value. Defaults
// come from destructuring initializers in vendored source, or from @default /
// "(default: x)" in package typings. A parameter whose prop path does not exist
// fails the run, so the panel can only expose real API.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { CATALOG } from '../src/catalog.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ENTRY = path.join(ROOT, 'src/.props-entry.tsx')
const live = CATALOG.filter(entry => entry.lane !== 'screenshot')

const imports = []
const aliases = new Map() // `${id}:${Export}` -> local alias
live.forEach((entry, i) => {
  const groups = [{ module: entry.module, names: entry.api }, ...(entry.extraApi ?? [])]
  groups.forEach((group, g) => {
    const spec = group.module.startsWith('.') ? group.module.replace(/^\.\//, './') : group.module
    const parts = group.names.map(name => {
      const alias = `C${i}_${g}_${name.replace(/\W/g, '')}`
      aliases.set(`${entry.id}:${name}`, alias)
      return name === 'default' ? null : `${name} as ${alias}`
    })
    const named = parts.filter(Boolean)
    const hasDefault = group.names.includes('default')
    imports.push(`import ${hasDefault ? `${aliases.get(`${entry.id}:default`)}${named.length ? ', ' : ''}` : ''}${named.length ? `{ ${named.join(', ')} }` : ''} from '${spec}'`)
  })
})
fs.writeFileSync(ENTRY, `${imports.join('\n')}\nexport {}\n`)

const program = ts.createProgram([ENTRY], {
  jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, target: ts.ScriptTarget.ES2022,
  strict: true, skipLibCheck: true, noEmit: true, allowJs: true, allowImportingTsExtensions: true, esModuleInterop: true,
  baseUrl: ROOT, paths: { '@/*': ['src/vendor/*'], cn: ['src/vendor/lib/utils.ts'] }, types: [],
})
const checker = program.getTypeChecker()
const entryFile = program.getSourceFile(ENTRY)
const locals = new Map()
for (const statement of entryFile.statements) {
  if (!ts.isImportDeclaration(statement) || !statement.importClause) continue
  const clause = statement.importClause
  if (clause.name) locals.set(clause.name.text, clause.name)
  for (const element of clause.namedBindings?.elements ?? []) locals.set(element.name.text, element.name)
}

const rel = file => path.relative(ROOT, file).replaceAll('\\', '/').replace(/^\.\.\/node_modules\//, 'node_modules/')
const isInherited = file => /node_modules[\\/](@types[\\/]react|csstype|typescript)[\\/]/.test(file)

function componentSymbol(alias) {
  let symbol = checker.getSymbolAtLocation(locals.get(alias))
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol)
  return symbol
}
function propTypesOf(symbol, exportName) {
  const decl = symbol?.valueDeclaration ?? symbol?.declarations?.[0]
  const source = decl?.getSourceFile()
  if (!source || source.isDeclarationFile) return null
  const propsName = ts.isVariableDeclaration(decl) && ts.isIdentifier(decl.name) ? decl.name.text : exportName
  let schema = null, defaults = null
  const visit = node => {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(node.left) && ts.isIdentifier(node.left.expression) && node.left.expression.text === propsName) {
      if (node.left.name.text === 'propTypes' && ts.isObjectLiteralExpression(node.right)) schema = node.right
      if (node.left.name.text === 'defaultProps' && ts.isObjectLiteralExpression(node.right)) defaults = node.right
    }
    node.forEachChild(visit)
  }
  visit(source)
  if (!schema) return null
  const valueOf = node => {
    if (!node) return undefined
    if (ts.isStringLiteralLike(node)) return node.text
    if (ts.isNumericLiteral(node)) return Number(node.text)
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false
    if (node.kind === ts.SyntaxKind.NullKeyword) return null
    return undefined
  }
  const defaultMap = new Map((defaults?.properties ?? []).filter(ts.isPropertyAssignment).map(p => [p.name.getText(source).replaceAll(/["']/g, ''), valueOf(p.initializer)]))
  const result = {}
  for (const prop of schema.properties) {
    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue
    let typeNode = prop.initializer, optional = true, options
    if (ts.isPropertyAccessExpression(typeNode) && typeNode.name.text === 'isRequired') { optional = false; typeNode = typeNode.expression }
    let kind = 'other', type = typeNode.getText(source)
    if (ts.isCallExpression(typeNode) && ts.isPropertyAccessExpression(typeNode.expression) && typeNode.expression.name.text === 'oneOf') {
      const array = typeNode.arguments[0]
      options = ts.isArrayLiteralExpression(array) ? array.elements.map(valueOf).filter(value => value !== undefined) : []
      kind = 'enum'; type = options.map(value => typeof value === 'string' ? JSON.stringify(value) : String(value)).join(' | ')
    } else if (ts.isPropertyAccessExpression(typeNode)) {
      const name = typeNode.name.text
      const known = { bool: ['boolean', 'boolean'], string: ['string', 'string'], number: ['number', 'number'], func: ['function', '(...args: unknown[]) => unknown'], node: ['other', 'ReactNode'], element: ['other', 'ReactElement'], array: ['other', 'unknown[]'], object: ['other', 'object'] }[name]
      if (known) [kind, type] = known
    }
    const comments = (ts.getLeadingCommentRanges(source.text, prop.getFullStart()) ?? []).filter(range => source.text.slice(range.pos, range.end).startsWith('/**'))
    const doc = comments.map(range => source.text.slice(range.pos, range.end).replace(/^\/\*\*|\*\/$/g, '').split(/\r?\n/).map(line => line.replace(/^\s*\* ?/, '').trim()).filter(Boolean).join(' ')).join(' ').slice(0, 300) || undefined
    const key = prop.name.text
    result[key] = { name: key, optional, type, kind, ...(options ? { options } : {}), doc, default: defaultMap.get(key), declaredIn: rel(source.fileName) }
  }
  return result
}
function propsType(symbol) {
  const type = checker.getTypeOfSymbol(symbol)
  const signature = type.getCallSignatures()[0] ?? type.getConstructSignatures()[0]
  if (!signature || !signature.parameters[0]) return null
  const param = signature.parameters[0]
  return checker.getTypeOfSymbolAtLocation(param, param.valueDeclaration ?? locals.values().next().value)
}

/** Destructuring defaults from the component's implementation, when its source is available. */
function sourceDefaults(symbol) {
  const out = {}
  const decl = symbol.valueDeclaration ?? symbol.declarations?.[0]
  if (!decl) return out
  const file = decl.getSourceFile()
  if (file.isDeclarationFile) return out
  let fn = null
  const pick = node => {
    if (!node) return null
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return node
    if (ts.isCallExpression(node)) return node.arguments.map(pick).find(Boolean) ?? null // forwardRef(fn), memo(fn)
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)) return pick(node.expression)
    return null
  }
  fn = ts.isVariableDeclaration(decl) ? pick(decl.initializer) : pick(decl)
  const pattern = fn?.parameters[0]?.name
  if (!pattern || !ts.isObjectBindingPattern(pattern)) return out
  const constants = new Map()
  file.forEachChild(function walk(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && ts.isLiteralExpression(node.initializer)) constants.set(node.name.text, node.initializer)
    else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(node.initializer.kind)) constants.set(node.name.text, node.initializer)
    node.forEachChild(walk)
  })
  const literal = node => {
    if (!node) return undefined
    if (ts.isIdentifier(node) && constants.has(node.text)) return literal(constants.get(node.text))
    // TICK_NAV_DEFAULTS.reach where the object is a (frozen) literal in the same file or an import.
    if (ts.isPropertyAccessExpression(node)) {
      const owner = checker.getSymbolAtLocation(node.expression)
      const target = owner && owner.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(owner) : owner
      let init = target?.valueDeclaration?.initializer
      if (init && ts.isCallExpression(init)) init = init.arguments[0]
      const property = init && ts.isObjectLiteralExpression(init) && init.properties.find(p => p.name?.getText() === node.name.text)
      if (property && ts.isPropertyAssignment(property)) return literal(property.initializer)
    }
    if (ts.isNumericLiteral(node)) return Number(node.text)
    if (node.getSourceFile() !== file && ts.isStringLiteralLike(node)) return node.text
    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) return -Number(node.operand.text)
    if (ts.isStringLiteralLike(node)) return node.text
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false
    return { expression: node.getText(file) }
  }
  for (const element of pattern.elements) {
    const name = (element.propertyName ?? element.name)?.getText(file)
    if (name && element.initializer) out[name] = literal(element.initializer)
  }
  return out
}

function docDefault(symbol) {
  for (const tag of symbol.getJsDocTags(checker)) if (tag.name === 'default' || tag.name === 'defaultValue') {
    const text = ts.displayPartsToString(tag.text).trim()
    try { return JSON.parse(text.replace(/^'(.*)'$/, '"$1"')) } catch { return text }
  }
  const doc = ts.displayPartsToString(symbol.getDocumentationComment(checker))
  const match = doc.match(/\(default:\s*([^)]+)\)|defaults to\s+[`"]?([\w.#-]+)/i)
  if (!match) return undefined
  const text = (match[1] ?? match[2]).trim().replace(/^["'`]|["'`]$/g, '')
  return text === 'true' ? true : text === 'false' ? false : Number.isFinite(Number(text)) ? Number(text) : text
}

function describeType(type) {
  const t = checker.getNonNullableType(type)
  const parts = t.isUnion() ? t.types : [t]
  const literals = parts.filter(p => p.isStringLiteral()).map(p => p.value)
  const flags = parts.map(p => p.flags)
  if (literals.length && literals.length === parts.length) return { kind: 'enum', options: literals }
  if (parts.every(p => p.flags & ts.TypeFlags.BooleanLike)) return { kind: 'boolean' }
  if (flags.every(f => f & ts.TypeFlags.NumberLike)) return { kind: 'number' }
  if (flags.every(f => f & ts.TypeFlags.StringLike)) return { kind: 'string' }
  if (literals.length && parts.some(p => p.flags & ts.TypeFlags.BooleanLike)) return { kind: 'enum', options: literals, mixed: true }
  if (parts.some(p => p.getCallSignatures().length)) return { kind: 'function' }
  return { kind: 'other' }
}

function propInfo(prop, defaults) {
  const decl = prop.valueDeclaration ?? prop.declarations?.[0]
  const type = checker.getTypeOfSymbol(prop)
  const value = defaults?.[prop.name] ?? docDefault(prop)
  return {
    name: prop.name,
    optional: Boolean(prop.flags & ts.SymbolFlags.Optional),
    type: checker.typeToString(checker.getNonNullableType(type), undefined, ts.TypeFormatFlags.NoTruncation).slice(0, 200),
    ...describeType(type),
    doc: ts.displayPartsToString(prop.getDocumentationComment(checker)).trim().slice(0, 300) || undefined,
    default: value,
    declaredIn: decl ? rel(decl.getSourceFile().fileName) : undefined,
  }
}

const out = {}
const errors = []
for (const entry of live) {
  const record = { exports: {}, params: {} }
  const names = [...entry.api, ...(entry.extraApi ?? []).flatMap(group => group.names)]
  const types = {}
  for (const name of names) {
    const symbol = componentSymbol(aliases.get(`${entry.id}:${name}`))
    const props = symbol && propsType(symbol)
    const propTypes = symbol && propTypesOf(symbol, name)
    if (!props && !propTypes) { errors.push(`${entry.id}: cannot read props of ${name}`); continue }
    const defaults = sourceDefaults(symbol)
    types[name] = { props, defaults, propTypes }
    const own = propTypes ? Object.values(propTypes) : checker.getPropertiesOfType(props).filter(p => {
      const file = (p.valueDeclaration ?? p.declarations?.[0])?.getSourceFile().fileName ?? ''
      return !isInherited(file)
    })
    const decl = symbol.valueDeclaration ?? symbol.declarations?.[0]
    record.exports[name] = { declaredIn: decl ? rel(decl.getSourceFile().fileName) : undefined, propCount: own.length, props: propTypes ? own : own.map(p => propInfo(p, defaults)).slice(0, 120) }
  }
  for (const param of entry.params) {
    if (param.demo) continue
    const [exportName, ...pathParts] = param.prop.split('.')
    const base = types[exportName]
    if (!base) { errors.push(`${entry.id}.${param.key}: unknown export ${exportName}`); continue }
    if (base.propTypes) {
      const info = pathParts.length === 1 ? base.propTypes[pathParts[0]] : null
      if (!info) { errors.push(`${entry.id}.${param.key}: ${param.prop} is not a PropTypes prop`); continue }
      record.params[param.key] = { prop: param.prop, ...info }
      continue
    }
    let type = base.props, symbol = null
    for (const part of pathParts) {
      symbol = checker.getPropertyOfType(checker.getApparentType(checker.getNonNullableType(type)), part)
      if (!symbol) break
      type = checker.getTypeOfSymbol(symbol)
    }
    if (!symbol) { errors.push(`${entry.id}.${param.key}: ${param.prop} is not a prop`); continue }
    record.params[param.key] = { prop: param.prop, ...propInfo(symbol, pathParts.length === 1 ? base.defaults : undefined) }
  }
  out[entry.id] = record
}
fs.rmSync(ENTRY)
fs.mkdirSync(path.join(ROOT, 'src/generated'), { recursive: true })
// props.json is in the startup bundle (parameters only); api.json loads with the API section.
fs.writeFileSync(path.join(ROOT, 'src/generated/props.json'), JSON.stringify(Object.fromEntries(Object.entries(out).map(([id, r]) => [id, { params: r.params, counts: Object.fromEntries(Object.entries(r.exports).map(([n, e]) => [n, e.propCount])) }])), null, 1))
fs.writeFileSync(path.join(ROOT, 'src/generated/api.json'), JSON.stringify(Object.fromEntries(Object.entries(out).map(([id, r]) => [id, r.exports]))))
for (const [id, record] of Object.entries(out)) {
  console.log(`${id.padEnd(18)} ${Object.entries(record.exports).map(([n, e]) => `${n}:${e.propCount}`).join(' ')}  ← ${Object.entries(record.params).map(([k, p]) => `${k}=${p.kind}${p.default !== undefined ? `(${JSON.stringify(p.default).slice(0, 24)})` : ''}`).join(' ')}`)
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
