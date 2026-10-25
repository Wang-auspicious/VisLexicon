// Build real upstream React examples, isolated from the application. No upstream
// build scripts run. A successful compilation is NOT a verified live preview.
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const FRONT = path.resolve(HERE, '../..')
const BENCH = existsSync(path.resolve(FRONT, '../component-bench/package.json')) ? path.resolve(FRONT, '../component-bench') : path.join(FRONT, 'component-bench')
const require = createRequire(path.join(BENCH, 'package.json'))
const esbuild = require('esbuild')
const ts = require('typescript')
const { compile } = require('@tailwindcss/node')
const { Scanner } = require('@tailwindcss/oxide')
const LOCAL = path.join(FRONT, 'data/ingest-v6')
const runtimeRequire = existsSync(path.join(LOCAL, 'runtime/package.json')) ? createRequire(path.join(LOCAL, 'runtime/package.json')) : require
export const PUBLIC = path.join(LOCAL, 'public')
const posix = p => p.replaceAll('\\', '/').replace(/^\.\//, '')
export const digest = x => createHash('sha256').update(typeof x === 'string' || Buffer.isBuffer(x) ? x : JSON.stringify(x)).digest('hex')
const read = async (p, fallback) => { try { return JSON.parse(await fs.readFile(p, 'utf8')) } catch (e) { if (e.code === 'ENOENT') return fallback; throw e } }
const write = async (p, value) => { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, typeof value === 'string' ? value : JSON.stringify(value)) }
const permissive = value => ['mit', 'isc', 'apache-2.0', 'bsd-2-clause', 'bsd-3-clause', '0bsd'].includes(String(value).toLowerCase())
const packageRoot = value => value.startsWith('@') ? value.split('/').slice(0, 2).join('/').replace(/@[^@/]+$/, '') : value.split('/')[0].split('@')[0]

export function resolveAlias(spec, importer, item, files) {
  const scope = (item.aliasScopes ?? []).filter(s => !s.directory || importer === s.directory || importer.startsWith(s.directory.replace(/\/$/, '') + '/')).sort((a,b) => (b.directory?.length ?? 0) - (a.directory?.length ?? 0))[0]
  const aliases = { ...(item.packageAliases ?? {}), ...(item.aliases ?? {}), ...(scope?.paths ?? {}) }
  for (const [key, values] of Object.entries(aliases)) {
    const star = key.indexOf('*'), match = star < 0 ? spec === key ? '' : null : spec.startsWith(key.slice(0, star)) && spec.endsWith(key.slice(star + 1)) ? spec.slice(star, spec.length - (key.length - star - 1)) : null
    if (match === null) continue
    for (const value of Array.isArray(values) ? values : [values]) {
      const resolved = resolveSource(value.replace('*', match), importer, files)
      if (resolved) return resolved
    }
  }
  return null
}

export function resolveSource(spec, importer, files) {
  const names = [...files.keys()]
  const base = spec.startsWith('.') ? path.posix.normalize(path.posix.join(path.posix.dirname(importer), spec)) : spec.replace(/^@\//, '')
  const variants = [base, ...['.tsx', '.ts', '.jsx', '.js', '.css', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'].map(e => base + e)]
  for (const candidate of variants) if (files.has(candidate)) return candidate
  if (spec.startsWith('.') || spec.startsWith('@/')) {
    const tails = [base, base.replace(/^components\//, ''), base.replace(/^components\/ui\//, ''), base.replace(/^components\/magicui\//, '')]
    for (const tail of tails) {
      const matches = names.filter(n => [tail, ...['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'].map(e => tail + e)].some(t => n === t || n.endsWith('/' + t)))
      if (matches.length === 1) return matches[0]
    }
  }
  return null
}

export function chooseExport(files, preferredExport) {
  const choices = []
  for (const f of files.filter(f => /\.[jt]sx$/.test(f.path))) {
    const source = ts.createSourceFile(f.path, f.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    for (const node of source.statements) {
      const mods = node.modifiers ?? []
      if (!mods.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) continue
      const isDefault = mods.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)
      if (ts.isFunctionDeclaration(node) && (isDefault || /^[A-Z]/.test(node.name?.text ?? ''))) choices.push({ file: f.path, name: isDefault ? 'default' : node.name.text, node, source })
      if (ts.isVariableStatement(node)) for (const d of node.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && /^[A-Z]/.test(d.name.text) && d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer))) choices.push({ file: f.path, name: d.name.text, node: d.initializer, source })
      }
      if (ts.isExportAssignment(node) && !node.isExportEquals) choices.push({ file: f.path, name: 'default', source, node: ts.isArrowFunction(node.expression) ? node.expression : null })
    }
  }
  for (const c of choices) c.score = (/demo|example/i.test(c.file) ? 40 : 0) + (/demo|example/i.test(c.name) ? 20 : 0) + (c.name === 'default' ? 10 : 0) - (/provider|context|root|portal/i.test(c.name) ? 30 : 0)
  return choices.filter(c => !preferredExport || c.name === preferredExport).sort((a, b) => b.score - a.score)[0] ?? null
}

const literal = node => {
  if (!node) return undefined
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return ts.isNumericLiteral(node) ? Number(node.text) : node.text
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) return -Number(node.operand.text)
  return undefined
}

// Controls are derived from the chosen export's actual destructured defaults
// and locally declared interface. No fabricated slider ranges or demo content.
export function extractControls(chosen) {
  const parameter = chosen?.node?.parameters?.[0]
  if (!parameter || !ts.isObjectBindingPattern(parameter.name)) return []
  const defaults = new Map(parameter.name.elements.filter(e => ts.isIdentifier(e.name)).map(e => [e.name.text, literal(e.initializer)]))
  let members = []
  const typeName = parameter.type?.getText(chosen.source)
  if (parameter.type && ts.isTypeLiteralNode(parameter.type)) members = parameter.type.members
  if (typeName) for (const n of chosen.source.statements) {
    if ((ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) && n.name.text === typeName) members = n.members ?? (ts.isTypeLiteralNode(n.type) ? n.type.members : [])
  }
  const byName = new Map([...members].filter(m => m.name && m.type).map(m => [m.name.getText(chosen.source).replaceAll('"', '').replaceAll("'", ''), m]))
  const controls = []
  for (const [key, value] of defaults) {
    if (value === undefined || ['className', 'style', 'children', 'id'].includes(key)) continue
    const member = byName.get(key)
    const type = member?.type?.getText(chosen.source) ?? typeof value
    let options
    if (member && ts.isUnionTypeNode(member.type)) {
      const values = member.type.types.map(t => ts.isLiteralTypeNode(t) ? literal(t.literal) : undefined)
      if (values.every(v => typeof v === 'string')) options = values
    }
    if (typeof value === 'string' && !options && /url|src|href|path/i.test(key)) continue
    controls.push({ key, prop: `${chosen.name}.${key}`, type, default: value, sourceDefault: value, control: options ? 'select' : typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : /^#[\da-f]{3,8}$/i.test(value) ? 'color' : 'text', ...(options ? { options } : {}) })
  }
  return controls
}

export function missingRequiredProps(chosen) {
  const parameter = chosen?.node?.parameters?.[0]
  if (!parameter || !ts.isObjectBindingPattern(parameter.name)) return []
  const defaults = new Set(parameter.name.elements.filter(e => e.initializer).map(e => e.name.getText(chosen.source)))
  let members = ts.isTypeLiteralNode(parameter.type ?? {}) ? parameter.type.members : []
  const typeName = parameter.type?.getText(chosen.source)
  for (const n of chosen.source.statements) if ((ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) && n.name.text === typeName) members = n.members ?? (ts.isTypeLiteralNode(n.type) ? n.type.members : [])
  return [...members].filter(m => ts.isPropertySignature(m) && !m.questionToken && !defaults.has(m.name.getText(chosen.source))).map(m => m.name.getText(chosen.source))
}

export function storyControls(file, exportName) {
  const source = ts.createSourceFile(file.path, file.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const declarations = new Map()
  for (const node of source.statements) if (ts.isVariableStatement(node)) for (const d of node.declarationList.declarations) if (ts.isIdentifier(d.name)) declarations.set(d.name.text, d.initializer)
  const parse = (node, seen = new Set()) => {
    if (!node) return undefined
    if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) return parse(node.expression, seen)
    const value = literal(node); if (value !== undefined) return value
    if (ts.isIdentifier(node) && declarations.has(node.text) && !seen.has(node.text)) return parse(declarations.get(node.text), new Set([...seen, node.text]))
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(n => parse(n, seen))
    if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.filter(p => ts.isPropertyAssignment(p)).map(p => [p.name.getText(source).replace(/^['"]|['"]$/g, ''), parse(p.initializer, seen)]))
    return undefined
  }
  const metaNode = source.statements.find(n => ts.isExportAssignment(n))
  const meta = parse(metaNode?.expression) ?? {}, story = parse(declarations.get(exportName)) ?? {}
  const args = { ...meta.args, ...story.args }, types = { ...meta.argTypes, ...story.argTypes }
  return Object.entries(args).filter(([,v]) => ['string', 'number', 'boolean'].includes(typeof v)).map(([key,value]) => {
    const type = types[key] ?? {}, control = typeof type.control === 'object' ? type.control : { type: type.control }
    const options = Array.isArray(type.options) && type.options.every(v => typeof v === 'string') ? type.options : undefined
    const range = typeof control.min === 'number' && typeof control.max === 'number' ? { min: control.min, max: control.max, step: control.step ?? 1 } : {}
    return { key, prop: `${exportName}.args.${key}`, type: typeof value, default: value, sourceDefault: value, control: options ? 'select' : typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? Object.keys(range).length ? 'slider' : 'number' : control.type === 'color' ? 'color' : 'text', ...(options ? { options } : {}), ...range }
  })
}

export function dependencyClosure(item, catalog, namespaces = new Map()) {
  const visited = new Set(), closure = []
  const visit = current => {
    if (visited.has(current.id)) return
    visited.add(current.id); closure.push(current)
    for (const ref of current.registryDependencies ?? []) {
      let dep = catalog.find(c => c.registryUrl === ref)
      if (!dep && ref.startsWith('@')) {
        const [namespace, ...name] = ref.split('/')
        const sourceIds = namespaces.get(namespace) ?? []
        if (sourceIds.length === 1) dep = catalog.find(c => c.sourceId === sourceIds[0] && c.name === name.join('/'))
      }
      // shadcn's item-address specification defines bare names as built-ins,
      // not as same-repository guesses. Relative JSON paths are local only.
      if (!dep && /^[\w-]+$/.test(ref)) dep = catalog.find(c => c.sourceId === 'ui.shadcn.com' && c.name === ref)
      if (!dep && ref.startsWith('./')) dep = catalog.find(c => c.sourceId === current.sourceId && c.name === ref.slice(2).replace(/\.json$/, ''))
      if (dep && dep.license?.redistributable) visit(dep)
    }
  }
  visit(item)
  return closure
}

function cssRules(value) {
  return Object.entries(value ?? {}).map(([key, val]) => typeof val === 'object' && val !== null ? `${key}{${cssRules(val)}}` : `${key}:${String(val)};`).join('\n')
}
const theme = `:root{--background:0 0% 100%;--foreground:240 10% 4%;--card:0 0% 100%;--card-foreground:240 10% 4%;--popover:0 0% 100%;--popover-foreground:240 10% 4%;--primary:240 6% 10%;--primary-foreground:0 0% 98%;--secondary:240 5% 96%;--secondary-foreground:240 6% 10%;--muted:240 5% 96%;--muted-foreground:240 4% 46%;--accent:240 5% 96%;--accent-foreground:240 6% 10%;--destructive:0 84% 60%;--border:240 6% 90%;--input:240 6% 90%;--ring:240 6% 10%;--radius:0.625rem}html,body,#root{min-height:100%;margin:0}body{font-family:system-ui,sans-serif;background:#fafafa;color:#18181b}#root{min-height:100vh;display:grid;place-items:center;padding:32px;box-sizing:border-box}#preview-error{white-space:pre-wrap;color:#b91c1c;padding:24px;font:14px monospace}`

export async function buildPreviews({ catalog, out = PUBLIC, ledgerName = 'build', cssName = 'components.css' } = {}) {
  catalog ??= await read(path.join(LOCAL, 'registry/catalog.json'), [])
  if (!Array.isArray(catalog)) catalog = catalog.items ?? catalog.entries ?? []
  catalog = catalog.map(c => ({ ...c, files: (c.files ?? []).map(f => ({ ...f, path: f.path ?? f.target })).filter(f => typeof f.path === 'string' && typeof f.content === 'string') }))
  const namespaces = new Map()
  const probes = await fs.readFile(path.join(FRONT, 'data/registry-probe/results.jsonl'), 'utf8').catch(() => '')
  for (const line of probes.split(/\r?\n/).filter(Boolean)) {
    const source = JSON.parse(line), sourceId = new URL(source.base).hostname.replace(/^www\./, '')
    for (const registry of source.directory ?? []) if (registry.name?.startsWith('@')) namespaces.set(registry.name, [...new Set([...(namespaces.get(registry.name) ?? []), sourceId])])
  }
  await fs.mkdir(path.join(out, 'shared'), { recursive: true })
  const sharedUrl = '/data/component-code/shared/'
  const bareReact = { name: 'shared-react', setup(b) {
    b.onResolve({ filter: /^react(?:\/.*)?$|^react-dom(?:\/.*)?$/ }, a => ({ path: a.path, namespace: 'react-shim' }))
    b.onResolve({ filter: /^\/data\/component-code\/shared\// }, a => ({ path: a.path, external: true }))
    b.onLoad({ filter: /.*/, namespace: 'react-shim' }, a => {
      const names = Object.keys(require(a.path)).filter(k => /^[A-Za-z_$][\w$]*$/.test(k) && k !== 'default')
      return { contents: `import module from ${JSON.stringify(`${sharedUrl}${a.path.replaceAll('/', '-')}.mjs`)};${names.map(k => `export const ${k}=module.${k};`).join('')}export default module;`, loader: 'js' }
    })
  } }
  const packageBuilds = new Map(), packageEvidence = await read(path.join(out, 'shared/third-party.json'), [])
  const licensedInputs = async result => {
    const visited = new Set()
    for (const filename of Object.keys(result.metafile?.inputs ?? {})) {
      if (filename.startsWith('<') || !filename.includes('node_modules')) continue
      let directory = path.dirname(path.resolve(BENCH, filename)), metadata, licenseText
      for (;;) {
        try { metadata = JSON.parse(await fs.readFile(path.join(directory, 'package.json'), 'utf8')); if (metadata.name) break } catch {}
        const parent = path.dirname(directory); if (parent === directory) throw Error(`Package attribution missing: ${filename}`); directory = parent
      }
      if (visited.has(directory)) continue
      visited.add(directory)
      if (!permissive(metadata.license)) throw Error(`Transitive package license needs review: ${metadata.name}`)
      const licenseName = (await fs.readdir(directory)).find(n => /^licen[cs]e(?:\.(?:md|txt))?$/i.test(n))
      if (licenseName) licenseText = await fs.readFile(path.join(directory, licenseName), 'utf8')
      if (!licenseText) throw Error(`Transitive package license text missing: ${metadata.name}`)
      const noticeName = (await fs.readdir(directory)).find(n => /^notice(?:\.(?:md|txt))?$/i.test(n))
      const notice = noticeName ? await fs.readFile(path.join(directory, noticeName), 'utf8') : undefined
      packageEvidence.push({ package: metadata.name, version: metadata.version, license: metadata.license, text: licenseText, ...(notice ? { notice } : {}) })
    }
  }
  const resolutions = await read(path.join(LOCAL, 'runtime/resolutions.json'), [])
  const packageModule = async (name, closure) => {
    const root = packageRoot(name), subpath = name.slice(root.length)
    const declaration = closure.flatMap(c => c.dependencies ?? []).find(d => packageRoot(d) === root)
    const resolution = resolutions.find(r => r.spec === declaration || r.imports?.includes(declaration)) ?? resolutions.find(r => r.packageName === root && (!declaration || declaration === root))
    if (resolution?.compatibleReact === false) throw Error(`React peer range is incompatible: ${name}`)
    const importedName = (resolution?.installedName ?? root) + subpath
    const cacheKey = importedName + '@' + (resolution?.version ?? 'bench')
    if (!packageBuilds.has(cacheKey)) packageBuilds.set(cacheKey, (async () => {
      let entry, resolveDir = BENCH
      try { entry = runtimeRequire.resolve(importedName); if (runtimeRequire !== require) resolveDir = path.join(LOCAL, 'runtime') } catch { if (resolution) throw Error(`Pinned installed package missing: ${importedName}`); entry = require.resolve(name) }
      let directory = path.dirname(entry), metadata, licenseText
      for (;;) {
        try { metadata = JSON.parse(await fs.readFile(path.join(directory, 'package.json'), 'utf8')); if (metadata.name) break } catch {}
        const parent = path.dirname(directory); if (parent === directory) throw Error(`Package attribution missing: ${name}`); directory = parent
      }
      if (!permissive(metadata.license)) throw Error(`Package license needs review: ${name}`)
      for (const file of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'license.md']) { try { licenseText = await fs.readFile(path.join(directory, file), 'utf8'); break } catch {} }
      if (!licenseText) throw Error(`Package license text missing: ${name}`)
      if (resolution && metadata.version !== resolution.version) throw Error(`Installed package version changed: ${name}`)
      const filename = `pkg-${digest([importedName, metadata.version]).slice(0, 16)}.mjs`
      const outfile = path.join(out, 'shared', filename)
      const bundle = await esbuild.build({ stdin: { contents: `export * from ${JSON.stringify(importedName)};import * as module from ${JSON.stringify(importedName)};export default module.default ?? module`, resolveDir }, absWorkingDir: BENCH, bundle: true, format: 'esm', platform: 'browser', minify: true, metafile: true, define: { 'process.env.NODE_ENV': '"production"' }, plugins: [bareReact], outfile, legalComments: 'inline', logLevel: 'silent', banner: { js: `/* ${metadata.name}@${metadata.version} (${metadata.license}) — full notice in third-party.json */` } })
      await licensedInputs(bundle)
      packageEvidence.push({ import: name, package: metadata.name, version: metadata.version, license: metadata.license, text: licenseText, module: filename })
      return `${sharedUrl}${filename}`
    })())
    return packageBuilds.get(cacheKey)
  }
  for (const name of ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom', 'react-dom/client']) {
    // The wrapper imports its own actual package; only that initial import
    // bypasses the shim. Nested React requires get a statically imported shim.
    const plugins = name === 'react' ? [] : [{ name: 'shared-react-dependencies', setup(b) {
      b.onResolve({ filter: /^react(?:\/.*)?$|^react-dom(?:\/.*)?$/ }, a => {
        if (a.importer === '<stdin>' && a.path === name) return undefined
        return { path: a.path, namespace: 'react-shim' }
      })
      b.onResolve({ filter: /^\/data\/component-code\/shared\// }, a => ({ path: a.path, external: true }))
      b.onLoad({ filter: /.*/, namespace: 'react-shim' }, a => {
        const keys = Object.keys(require(a.path)).filter(k => /^[A-Za-z_$][\w$]*$/.test(k) && k !== 'default')
        return { contents: `import module from ${JSON.stringify(`${sharedUrl}${a.path.replaceAll('/', '-')}.mjs`)};${keys.map(k => `export const ${k}=module.${k};`).join('')}export default module;`, loader: 'js' }
      })
    } }]
    // React's official CJS builds need explicit ESM names; these are our own
    // installed app dependencies, never dynamically executed upstream source.
    const names = Object.keys(require(name)).filter(k => /^[A-Za-z_$][\w$]*$/.test(k) && k !== 'default')
    const bundle = await esbuild.build({ stdin: { contents: `import module from ${JSON.stringify(name)};${names.map(k => `export const ${k}=module.${k};`).join('')}export default module;`, resolveDir: BENCH }, absWorkingDir: BENCH, bundle: true, format: 'esm', platform: 'browser', minify: true, metafile: true, legalComments: 'inline', define: { 'process.env.NODE_ENV': '"production"' }, plugins, outfile: path.join(out, 'shared', name.replaceAll('/', '-') + '.mjs'), logLevel: 'silent' })
    await licensedInputs(bundle)
  }
  const scanner = new Scanner({})
  const collections = new Set()
  for (const item of catalog) if (item.license?.redistributable) { if (item.files) collections.add(item.files); if (item.workspaceFiles) collections.add(item.workspaceFiles) }
  const uniqueFiles = new Map()
  for (const files of collections) for (const file of files) uniqueFiles.set(file.path + digest(file.content), file)
  const contents = [...uniqueFiles.values()].map(f => ({ content: f.content, extension: path.extname(f.path).slice(1) || 'tsx' }))
  const candidates = scanner.scanFiles(contents)
  const tailwind = await compile('@import "tailwindcss"; @theme inline {--color-background:hsl(var(--background));--color-foreground:hsl(var(--foreground));--color-primary:hsl(var(--primary));--color-primary-foreground:hsl(var(--primary-foreground));--color-secondary:hsl(var(--secondary));--color-secondary-foreground:hsl(var(--secondary-foreground));--color-muted:hsl(var(--muted));--color-muted-foreground:hsl(var(--muted-foreground));--color-accent:hsl(var(--accent));--color-accent-foreground:hsl(var(--accent-foreground));--color-border:hsl(var(--border));--color-input:hsl(var(--input));--color-ring:hsl(var(--ring));--color-card:hsl(var(--card));--color-card-foreground:hsl(var(--card-foreground));--color-popover:hsl(var(--popover));--color-popover-foreground:hsl(var(--popover-foreground));--radius-lg:var(--radius)}', { base: BENCH, onDependency() {} })
  await write(path.join(out, 'shared', cssName), tailwind.build(candidates) + '\n' + theme)
  const ledgerPath = path.join(LOCAL, 'previews', ledgerName + '.json')
  const results = [], previous = await read(ledgerPath, [])
  const sharedDigest = digest(await fs.readFile(path.join(out, 'shared', cssName)))
  const environmentDigest = digest([await fs.readFile(fileURLToPath(import.meta.url), 'utf8'), await fs.readFile(path.join(out, 'shared/react.mjs'), 'utf8'), await read(path.join(LOCAL, 'runtime/resolutions.json'), []), await read(path.join(LOCAL, 'runtime/package-lock.json'), {})])
  let count = 0
  for (const item of catalog) {
    if (!item.license?.redistributable || !item.files?.length || /registry:(lib|hook|style|font|theme|file)$/.test(item.type ?? '')) continue
    const closure = dependencyClosure(item, catalog, namespaces)
    const sourceDigests = closure.map(d => ({ id: d.id, rawDigest: d.rawDigest, licenseDigest: d.license?.licenseDigest ?? d.license?.rawDigest }))
    const key = digest([sourceDigests, sharedDigest, environmentDigest])
    const old = previous.find(p => p.id === item.id && p.buildDigest === key)
    if (old) { results.push(old); continue }
    const entry = item.entryMode === 'csf' ? { file: item.entryFile ?? item.files[0]?.path, name: item.storyExport } : item.componentExport ? chooseExport(item.files.filter(f => f.path === item.entryFile), item.componentExport) ?? { file: item.entryFile, name: item.componentExport } : chooseExport(item.files)
    const result = { id: item.id, buildDigest: key, status: 'unsupported', reason: 'No standalone React JSX export; source remains available.' }
    if (entry) {
      try {
        const missing = missingRequiredProps(entry)
        if (missing.length) throw Error(`Original export needs required props with no upstream demo/default: ${missing.join(', ')}`)
        const files = new Map()
        for (const f of item.workspaceFiles ?? []) files.set(posix(f.path), f.content)
        for (const dep of closure.slice().reverse()) for (const f of dep.files) {
          const name = posix(f.path)
          if (files.has(name) && files.get(name) !== f.content) throw Error(`Conflicting dependency source path: ${name}`)
          files.set(name, f.content)
        }
        const controls = item.entryMode === 'csf' ? storyControls(item.files.find(f => f.path === entry.file), entry.name) : extractControls(entry), initial = Object.fromEntries(controls.map(c => [c.key, c.default]))
        const sourceFiles = [...files.keys()]
        const plugin = { name: 'registry-files', setup(b) {
          b.onResolve({ filter: /.*/ }, async a => {
            if (a.namespace === 'file' && a.importer) return undefined
            if (a.path === 'vislexicon-entry') return { path: a.path, namespace: 'registry' }
            if (a.path === 'vislexicon-utils') return { path: a.path, namespace: 'registry' }
            const alias = resolveAlias(a.path, a.importer, item, files)
            if (alias) return { path: alias, namespace: 'registry' }
            const resolved = resolveSource(a.path, a.importer, files)
            if (resolved) return { path: resolved, namespace: 'registry' }
            if (/^@\/lib\/utils$|^cn$/.test(a.path)) return { path: 'vislexicon-utils', namespace: 'registry' }
            if (a.path.startsWith('.') || a.path.startsWith('@/')) throw Error(`Unresolved upstream file: ${a.path} (from ${a.importer})`)
            if (/^(?:https?:|data:)/.test(a.path)) return { path: a.path, external: true }
            try { return { path: await packageModule(a.path, closure), external: true } } catch (error) { throw Error(`Dependency unavailable or license unverified: ${a.path}: ${error.message}`) }
          })
          b.onLoad({ filter: /.*/, namespace: 'registry' }, a => {
            if (a.path === 'vislexicon-utils') return { contents: 'import{clsx}from"clsx";import{twMerge}from"tailwind-merge";export function cn(...v){return twMerge(clsx(v))}export default cn', loader: 'js', resolveDir: BENCH }
            if (a.path === 'vislexicon-entry') {
              const render = item.entryMode === 'csf' ? `const meta=mod.default??{},story=mod[${JSON.stringify(entry.name)}];function Preview(props){const args={...meta.args,...story.args,...props};const Renderer=typeof story==='function'?story:story.render??meta.render??meta.component;if(!Renderer)throw Error('Story requires a Storybook runtime or missing meta.component');let View=()=>React.createElement(Renderer,args);for(const decorator of [...(meta.decorators??[]),...(story.decorators??[])].reverse()){const Previous=View;View=()=>decorator(Previous,{args,globals:{},parameters:{...meta.parameters,...story.parameters}})}return React.createElement(View)}` : `const Preview=mod[${JSON.stringify(entry.name)}];`
              return { contents: `import React,{Component} from 'react';import{createRoot}from'react-dom/client';import * as mod from ${JSON.stringify(entry.file)};${render}class Guard extends Component{state={error:null};static getDerivedStateFromError(e){window.__previewError=String(e);return{error:String(e)}}render(){return this.state.error?React.createElement('pre',{id:'preview-error'},this.state.error):this.props.children}}let values=${JSON.stringify(initial)};const root=createRoot(document.getElementById('root'));function render(){window.__previewValues=values;root.render(React.createElement(Guard,{key:JSON.stringify(values)},React.createElement(Preview,values)))}render();addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='vislexicon:props')return;const v=e.data.values;if(!v||typeof v!=='object')return;for(const key of ${JSON.stringify(controls.map(c => c.key))})if(Object.hasOwn(v,key)&&['string','number','boolean'].includes(typeof v[key]))values[key]=v[key];render()});window.__previewMounted=true;`, loader: 'jsx', resolveDir: BENCH }
            }
            return { contents: files.get(a.path), loader: /\.module\.css$/.test(a.path) ? 'local-css' : path.extname(a.path).slice(1) === 'css' ? 'css' : path.extname(a.path) === '.json' ? 'json' : /\.[jt]sx$/.test(a.path) ? 'tsx' : 'ts', resolveDir: BENCH }
          })
        } }
        const target = path.join(out, 'previews', item.id)
        await fs.mkdir(target, { recursive: true })
        await esbuild.build({ entryPoints: ['vislexicon-entry'], bundle: true, format: 'esm', jsx: 'automatic', platform: 'browser', target: 'es2022', minify: true, plugins: [bareReact, plugin], define: { 'process.env.NODE_ENV': '"production"' }, outfile: path.join(target, 'component.mjs'), logLevel: 'silent' })
        const css = closure.map(c => {
          const vars = { ...c.cssVars?.theme, ...c.cssVars?.light }
          const declarations = Object.entries(vars).filter(([, v]) => typeof v === 'string').map(([k,v]) => `--${k}:${v};`).join('')
          const animations = Object.entries(c.cssVars?.theme ?? {}).filter(([k,v]) => k.startsWith('animate-') && typeof v === 'string').map(([k]) => `.${k}{animation:var(--${k})}`).join('\n')
          const nested = Object.fromEntries(Object.entries(c.cssVars?.theme ?? {}).filter(([,v]) => v && typeof v === 'object'))
          return cssRules(c.css) + '\n:root{' + declarations + '}\n' + animations + '\n' + cssRules(nested)
        }).join('\n')
        await write(path.join(target, 'registry.css'), css)
        const componentCss = await fs.stat(path.join(target, 'component.css')).then(() => '<link rel="stylesheet" href="component.css">').catch(() => '')
        const importmap = Object.fromEntries(['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom', 'react-dom/client'].map(n => [n, `${sharedUrl}${n.replaceAll('/', '-')}.mjs`]))
        await write(path.join(target, 'index.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src https: data: blob:; font-src https: data:; connect-src 'none'; base-uri 'none'; form-action 'none'"><link rel="stylesheet" href="../../shared/${cssName}"><link rel="stylesheet" href="registry.css">${componentCss}<script type="importmap">${JSON.stringify({ imports: importmap })}</script><script>addEventListener('error',e=>{window.__previewError=String(e.message)});addEventListener('unhandledrejection',e=>{window.__previewError=String(e.reason)})</script></head><body><div id="root"></div><script type="module" src="component.mjs"></script></body></html>`)
        Object.assign(result, { status: 'compiled', reason: '', url: `/data/component-code/previews/${item.id}/index.html`, controls, exportName: entry.name, entryFile: entry.file, sourceFiles, dependencyIds: closure.map(c => c.id), sourceDigests, initial })
      } catch (error) { result.status = 'failed'; result.reason = (error.errors?.[0]?.text ?? error.message).slice(0, 1000) }
    }
    results.push(result)
    if (++count % 50 === 0) { await write(ledgerPath, results); console.log(`preview builds: ${count}, compiled ${results.filter(x => x.status === 'compiled').length}`) }
  }
  await write(ledgerPath, results)
  await write(path.join(out, 'shared/third-party.json'), [...new Map(packageEvidence.map(p => [digest(p), p])).values()])
  console.log(JSON.stringify({ total: results.length, compiled: results.filter(x => x.status === 'compiled').length, failed: results.filter(x => x.status === 'failed').length, unsupported: results.filter(x => x.status === 'unsupported').length }))
  return results
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildPreviews()
