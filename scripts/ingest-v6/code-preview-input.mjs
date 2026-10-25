// Enumerate real upstream React exports without executing upstream source.
// Each output file shares one original-byte workspace across all of its entries.
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FRONT = path.resolve(HERE, '../..')
const BENCH = existsSync(path.resolve(FRONT, '../component-bench/package.json')) ? path.resolve(FRONT, '../component-bench') : path.join(FRONT, 'component-bench')
const require = createRequire(path.join(BENCH, 'package.json'))
const ts = require('typescript')
const execute = promisify(execFile)
const CODE = path.join(FRONT, 'data/ingest-v6/code')
const OUTPUT = path.join(CODE, 'preview-inputs')
const digest = value => createHash('sha256').update(Buffer.isBuffer(value) || typeof value === 'string' ? value : JSON.stringify(value)).digest('hex')
const posix = value => value.replaceAll('\\', '/')
const read = async (file, fallback) => { try { return JSON.parse(await fs.readFile(file, 'utf8')) } catch (e) { if (e.code === 'ENOENT') return fallback; throw e } }
const write = async (file, value) => { await fs.mkdir(path.dirname(file), { recursive: true }); const temp = file + '.tmp'; await fs.writeFile(temp, JSON.stringify(value)); await fs.rename(temp, file) }
const isExport = node => node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
const isDefault = node => node.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)
const unwrap = node => { while (node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isSatisfiesExpression(node))) node = node.expression; return node }
const nameOf = node => node && (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) ? node.text : undefined

function localsOf(source) {
  const locals = new Map()
  for (const node of source.statements) {
    if (ts.isVariableStatement(node)) for (const d of node.declarationList.declarations) if (ts.isIdentifier(d.name)) locals.set(d.name.text, unwrap(d.initializer))
    if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) locals.set(node.name.text, node)
  }
  return locals
}

function resolveLocal(node, locals, seen = new Set()) {
  node = unwrap(node)
  while (node && ts.isIdentifier(node) && locals.has(node.text) && !seen.has(node.text)) { seen.add(node.text); node = unwrap(locals.get(node.text)) }
  return node
}

function prop(object, name) {
  if (!object || !ts.isObjectLiteralExpression(object)) return undefined
  const node = object.properties.find(p => nameOf(p.name) === name)
  return node && ts.isPropertyAssignment(node) ? unwrap(node.initializer) : undefined
}

function filterOf(node) {
  node = unwrap(node)
  if (!node) return null
  if (ts.isArrayLiteralExpression(node) && node.elements.every(ts.isStringLiteral)) return node.elements.map(x => x.text)
  if (ts.isRegularExpressionLiteral(node)) {
    const text = node.getText(), last = text.lastIndexOf('/')
    try { return new RegExp(text.slice(1, last), text.slice(last + 1).replace(/[gy]/g, '')) } catch { return null }
  }
  return { unresolved: true }
}

function matches(filter, name) { return Array.isArray(filter) ? filter.includes(name) : filter instanceof RegExp ? filter.test(name) : false }

function componentValue(node, locals) {
  node = resolveLocal(node, locals)
  if (!node) return false
  if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return true
  if (ts.isClassDeclaration(node)) return node.heritageClauses?.some(c => c.types.some(t => /(?:^|\.)(?:Component|PureComponent)$/.test(t.expression.getText()))) ?? false
  if (ts.isCallExpression(node)) return /(?:^|\.)(?:memo|forwardRef)$/.test(node.expression.getText())
  return false
}

function storyValue(node, locals) {
  node = resolveLocal(node, locals)
  if (!node) return false
  return ts.isObjectLiteralExpression(node) || componentValue(node, locals) || (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'bind')
}

function exportsOf(source, locals) {
  const result = []
  let defaultValue
  for (const node of source.statements) {
    if (ts.isExportAssignment(node) && !node.isExportEquals) { defaultValue = resolveLocal(node.expression, locals); result.push({ name: 'default', node, value: defaultValue }); continue }
    if (isExport(node) && (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node))) {
      const name = isDefault(node) ? 'default' : node.name?.text
      if (name) { result.push({ name, node, value: node }); if (name === 'default') defaultValue = node }
    }
    if (isExport(node) && ts.isVariableStatement(node)) for (const d of node.declarationList.declarations) if (ts.isIdentifier(d.name)) result.push({ name: d.name.text, node: d, value: resolveLocal(d.initializer, locals) })
    if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const element of node.exportClause.elements.filter(e => !e.isTypeOnly)) {
        const name = element.name.text
        const localName = element.propertyName?.text ?? name
        if (!node.moduleSpecifier) { const value = resolveLocal(locals.get(localName), locals); result.push({ name, node: element, value }); if (name === 'default') defaultValue = value }
        else result.push({ name, node: element, reexport: node.moduleSpecifier.text, localName })
      }
    }
    if (ts.isExportDeclaration(node) && !node.isTypeOnly && !node.exportClause) result.push({ name: '*', node, reexport: node.moduleSpecifier?.text, unresolvedStar: true })
  }
  return { exports: [...new Map(result.map(e => [e.name, e])).values()], defaultValue }
}

/** Public for offline tests. An AST candidate remains pending compilation. */
export function enumerateExports(filename, content, { reactPackage = false } = {}) {
  const source = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true, /\.jsx$/.test(filename) ? ts.ScriptKind.JSX : /\.tsx$/.test(filename) ? ts.ScriptKind.TSX : /\.js$/.test(filename) ? ts.ScriptKind.JS : ts.ScriptKind.TS)
  const imports = source.statements.filter(ts.isImportDeclaration).map(n => n.moduleSpecifier.text)
  const incompatible = imports.some(value => /^(?:@storybook\/(?:vue|angular|svelte|web-components|preact|solid)|solid-js|preact|@builder\.io\/qwik|vue(?:\/|$))/.test(value))
  const react = !incompatible && (reactPackage || imports.some(value => /^(?:react(?:\/|$)|react-dom(?:\/|$)|react-native(?:\/|$)|@storybook\/react(?:-|\/|$)|next(?:\/|$))/.test(value)))
  const locals = localsOf(source), exported = exportsOf(source, locals)
  const story = /\.stories\.[jt]sx?$/.test(filename)
  const meta = resolveLocal(exported.defaultValue, locals)
  const include = filterOf(prop(meta, 'includeStories')), exclude = filterOf(prop(meta, 'excludeStories'))
  const titleNode = prop(meta, 'title')
  const title = titleNode && ts.isStringLiteral(titleNode) ? titleNode.text : null
  const entries = [], componentDeclarations = new Map()
  for (const entry of exported.exports) {
    const observation = { name: entry.name, line: source.getLineAndCharacterOfPosition(entry.node.getStart(source)).line + 1, disposition: 'pending-compile', reason: null }
    if (!react) { observation.disposition = 'unsupported-framework'; observation.reason = incompatible ? 'Upstream explicitly imports a non-React runtime' : 'No direct React runtime or package evidence'; entries.push(observation); continue }
    if (entry.unresolvedStar || entry.reexport) { observation.disposition = 'unresolved-reexport'; observation.reason = 'Re-export requires original-module export resolution; retained explicitly'; entries.push(observation); continue }
    if (story) {
      if (entry.name === 'default') { observation.disposition = 'csf-metadata'; observation.reason = 'The default CSF export is metadata, not an example' }
      else if (!meta || !ts.isObjectLiteralExpression(meta)) { observation.disposition = 'unresolved-csf-metadata'; observation.reason = 'Original default CSF metadata cannot be resolved statically' }
      else if (include?.unresolved || exclude?.unresolved) { observation.disposition = 'unresolved-csf-filter'; observation.reason = 'Original includeStories/excludeStories needs runtime evaluation' }
      else if ((include && !matches(include, entry.name)) || (exclude && matches(exclude, entry.name))) { observation.disposition = 'meta-excluded'; observation.reason = 'Excluded by original CSF includeStories/excludeStories' }
      else if (!storyValue(entry.value, locals)) { observation.disposition = 'non-story-export'; observation.reason = 'Export is not an original CSF function, object or Template.bind example' }
      else observation.entryMode = 'csf'
    } else {
      if ((entry.name !== 'default' && !/^[A-Z]/.test(entry.name)) || !componentValue(entry.value, locals)) { observation.disposition = 'non-component-export'; observation.reason = 'Export is not an uppercase/default function, React class, memo or forwardRef component' }
      else {
        const declaration = resolveLocal(entry.value, locals)
        if (componentDeclarations.has(declaration)) {
          observation.disposition = 'duplicate-export-alias'; observation.duplicateOfExport = componentDeclarations.get(declaration)
          observation.reason = 'Named/default alias resolves to the exact same original component declaration'
        } else { componentDeclarations.set(declaration, entry.name); observation.entryMode = 'component' }
      }
    }
    entries.push(observation)
  }
  return { react, story, title, entries, parseErrors: source.parseDiagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')) }
}

function exactFile(target, files) {
  target = posix(path.posix.normalize(target)).replace(/^\.\//, '')
  return [target, ...['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'].map(s => target + s)].find(n => files.has(n))
}

function exportTarget(value, packageDir, files) {
  if (typeof value === 'string') return !value.endsWith('.d.ts') && !value.includes('*') ? exactFile(path.posix.join(packageDir, value), files) : null
  if (Array.isArray(value)) return value.map(v => exportTarget(v, packageDir, files)).find(Boolean)
  if (value && typeof value === 'object') for (const key of ['source', 'browser', 'import', 'default', 'require']) { const result = exportTarget(value[key], packageDir, files); if (result) return result }
  return null
}

async function metadataFor(repoKey, commit, workspace) {
  const manifest = await read(path.join(CODE, 'manifests', repoKey + '.json'), { packages: [], typescriptConfigs: [] })
  if (manifest.commit !== commit) return { packages: [], aliasScopes: [], packageAliases: {}, metadataDigests: [] }
  const packages = [], aliasScopes = [], packageAliases = {}, metadataDigests = []
  const files = new Set(workspace.map(f => f.path))
  for (const entry of manifest.packages) {
    try {
      const bytes = await fs.readFile(path.join(CODE, entry.sourcePath))
      if (digest(bytes) !== entry.rawDigest) continue
      const json = JSON.parse(bytes.toString('utf8')), dir = path.posix.dirname(entry.path)
      packages.push({ ...entry, directory: dir, metadata: json }); metadataDigests.push(entry.rawDigest)
      if (json.name) {
        const rootExport = json.exports && (typeof json.exports === 'string' || Array.isArray(json.exports) ? json.exports : json.exports['.'] ?? (!Object.keys(json.exports).some(k => k.startsWith('.')) ? json.exports : null))
        const target = exportTarget(rootExport, dir, files) ?? exportTarget(json.source, dir, files) ?? exportTarget(json.module, dir, files) ?? exportTarget(json.main, dir, files)
        if (target) packageAliases[json.name] = target
        if (json.exports && typeof json.exports === 'object') for (const [subpath, value] of Object.entries(json.exports)) {
          if (!subpath.startsWith('./')) continue
          const resolved = exportTarget(value, dir, files)
          if (resolved) packageAliases[json.name + subpath.slice(1)] = resolved
        }
      }
    } catch { /* Missing/changed metadata stays unavailable; do not guess paths. */ }
  }
  for (const entry of manifest.typescriptConfigs) {
    try {
      const bytes = await fs.readFile(path.join(CODE, entry.sourcePath))
      if (digest(bytes) !== entry.rawDigest) continue
      const parsed = ts.parseConfigFileTextToJson(entry.path, bytes.toString('utf8'))
      if (parsed.error || !parsed.config?.compilerOptions?.paths) continue
      const directory = path.posix.dirname(entry.path), base = path.posix.normalize(path.posix.join(directory, parsed.config.compilerOptions.baseUrl ?? '.'))
      aliasScopes.push({ configPath: entry.path, directory, baseUrl: base, paths: parsed.config.compilerOptions.paths })
      metadataDigests.push(entry.rawDigest)
    } catch { /* Unresolved extends/configs are recorded, never guessed. */ }
  }
  return { packages, aliasScopes, packageAliases, metadataDigests }
}

function packageFor(filename, packages) {
  return packages.filter(p => p.directory === '.' || filename.startsWith(p.directory + '/')).sort((a, b) => b.directory.length - a.directory.length)[0]
}

function aliasesFor(filename, metadata) {
  const aliases = { ...metadata.packageAliases }
  const scopes = metadata.aliasScopes.filter(s => s.directory === '.' || filename.startsWith(s.directory + '/')).sort((a, b) => a.directory.length - b.directory.length)
  for (const scope of scopes) for (const [key, values] of Object.entries(scope.paths)) {
    if (!Array.isArray(values) || values.length !== 1 || typeof values[0] !== 'string') continue
    aliases[key] = path.posix.normalize(path.posix.join(scope.baseUrl, values[0]))
  }
  return aliases
}

export async function generatePreviewInputs({ repo, force = false } = {}) {
  await fs.mkdir(OUTPUT, { recursive: true })
  const names = (await fs.readdir(path.join(CODE, 'source-receipts'))).filter(n => n.endsWith('.json')).sort()
  const index = []
  const scriptDigest = digest(await fs.readFile(fileURLToPath(import.meta.url)))
  for (const filename of names) {
    const repoKey = filename.slice(0, -5)
    if (repo && repoKey !== repo.toLowerCase().replaceAll('/', '--')) continue
    const receiptFile = path.join(CODE, 'source-receipts', filename)
    const destination = path.join(OUTPUT, filename), summaryFile = path.join(OUTPUT, repoKey + '.summary.json')
    const previous = await read(summaryFile, null)
    const metadataFile = path.join(CODE, 'manifests', filename)
    const receiptStat = await fs.stat(receiptFile), metadataStat = await fs.stat(metadataFile).catch(() => null)
    const inputSignature = digest([receiptStat.mtimeMs, receiptStat.size, metadataStat?.mtimeMs, metadataStat?.size, scriptDigest])
    if (!force && previous?.inputSignature === inputSignature && existsSync(destination)) { index.push(previous); continue }
    const receiptBytes = await fs.readFile(receiptFile), receipt = JSON.parse(receiptBytes.toString('utf8')), rows = receipt.items ?? []
    const eligible = rows.filter(r => r.status === 'source-fetched' && r.license?.redistributable)
    const metadataBytes = await fs.readFile(metadataFile).catch(() => Buffer.from(''))
    const inputDigest = digest([digest(receiptBytes), digest(metadataBytes), scriptDigest])
    if (!force && previous?.inputDigest === inputDigest && existsSync(destination)) { index.push(previous); continue }
    if (!eligible.length) {
      const summary = { repoKey, inputDigest, inputSignature, sourceRows: rows.length, eligibleSourceFiles: 0, entries: 0, referenceOnly: rows.length, status: 'reference-only' }
      await write(destination, { schemaVersion: 1, inputDigest, items: [], workspaceFiles: [] }); await write(summaryFile, summary); index.push(summary); continue
    }
    const { stdout } = await execute(process.env.VISLEXICON_PYTHON || 'python', [path.join(HERE, 'code-workspace.py'), receiptFile], { maxBuffer: 512 * 1024 * 1024, windowsHide: true, encoding: 'utf8' })
    const workspace = JSON.parse(stdout)
    if (workspace.receiptDigest !== digest(receiptBytes)) throw Error(`Source receipt changed during preparation: ${repoKey}; rerun resumes from its current version`)
    const { workspaceFiles, integrityBlocked } = workspace, fileRows = new Map(eligible.map(row => [row.path, row]))
    const first = eligible[0], metadata = await metadataFor(repoKey, first.commit, workspaceFiles)
    const workspaceDigest = digest([workspaceFiles.map(f => [f.path, f.rawDigest, f.licenseDigest]).sort((a, b) => a[0].localeCompare(b[0])), metadata.metadataDigests.sort()])
    const items = [], dispositions = [...integrityBlocked]
    let exportObservations = 0, excludedExports = 0
    for (const file of workspaceFiles) {
      const row = fileRows.get(file.path)
      if (!/\.[jt]sx$/.test(file.path) && !/\.stories\.[jt]sx?$/.test(file.path)) { dispositions.push({ parentSourceId: row.id, path: row.path, disposition: 'support-only' }); continue }
      const parentPackage = packageFor(file.path, metadata.packages)
      const deps = { ...parentPackage?.metadata?.dependencies, ...parentPackage?.metadata?.peerDependencies }
      const devDeps = parentPackage?.metadata?.devDependencies ?? {}
      const parsed = enumerateExports(file.path, file.content, { reactPackage: Boolean(deps.react || devDeps['@storybook/react'] || devDeps['@storybook/react-vite'] || devDeps['@storybook/nextjs']) })
      const observations = parsed.entries.map(entry => ({ ...entry }))
      for (const entry of observations) {
        exportObservations++
        if (entry.disposition !== 'pending-compile') { excludedExports++; continue }
        const id = row.id + '-' + digest(entry.name).slice(0, 10)
        const title = [parsed.title || path.posix.basename(file.path).replace(/\.(?:stories\.)?[jt]sx$/, ''), entry.name === 'default' ? null : entry.name].filter(Boolean).join(' · ')
        const aliases = aliasesFor(file.path, metadata)
        items.push({ id, parentSourceId: row.id, name: entry.name, title, description: `来自 ${row.repo} 的原始${entry.entryMode === 'csf' ? ' Storybook 示例' : '组件导出'}，保留源码与默认参数。`,
          sourceId: 'github:' + row.repo.toLowerCase(), sourceName: row.repo, sourceUrl: row.sourceUrl + '#L' + entry.line,
          commit: row.commit, type: entry.entryMode === 'csf' ? 'github:story' : 'github:component', framework: 'react',
          entryMode: entry.entryMode, entryPath: file.path, entryFile: file.path, storyExport: entry.entryMode === 'csf' ? entry.name : undefined,
          componentExport: entry.entryMode === 'component' ? entry.name : undefined, files: [{ path: file.path, content: file.content }],
          workspaceRef: repoKey, workspaceDigest, aliases, dependencies: Object.keys(deps), packageDependencies: deps, registryDependencies: [],
          license: row.license, rawDigest: digest([row.rawDigest, workspaceDigest, entry.name, aliases]), sourceRawDigest: row.rawDigest,
          status: 'pending-compile', reason: 'Original upstream export; compilation, rendering and visual verification pending' })
        entry.id = id
      }
      dispositions.push({ parentSourceId: row.id, path: row.path, disposition: observations.some(e => e.disposition === 'pending-compile') ? 'pending-compile' : parsed.react ? 'no-renderable-export' : 'unsupported-framework', parseErrors: parsed.parseErrors, exports: observations })
    }
    const summary = { repoKey, repo: first.repo, commit: first.commit, inputDigest, inputSignature, workspaceDigest, sourceRows: rows.length, eligibleSourceFiles: eligible.length, workspaceFiles: workspaceFiles.length,
      integrityBlocked: integrityBlocked.length, referenceOnly: rows.length - eligible.length, entries: items.length, exportObservations, excludedExports,
      countConservation: { eligibleSourceFiles: eligible.length, fileDispositions: dispositions.length, exportObservations, exportDispositions: items.length + excludedExports },
      status: 'pending-compile', path: filename, updatedAt: new Date().toISOString() }
    await write(destination, { schemaVersion: 1, ...summary, sourceRoot: `sources/${repoKey}/${first.commit}`, workspaceFiles, aliasScopes: metadata.aliasScopes, packageAliases: metadata.packageAliases, items })
    await write(path.join(OUTPUT, repoKey + '.dispositions.json'), dispositions)
    await write(summaryFile, summary); index.push(summary)
    console.log(`code preview inputs ${first.repo}: ${items.length} exports, ${workspaceFiles.length} source/support files`)
  }
  let aggregate = index
  if (repo) {
    const prior = await read(path.join(OUTPUT, 'index.json'), { list: [] })
    const merged = new Map((prior.list ?? []).map(item => [item.repoKey, item]))
    for (const item of index) merged.set(item.repoKey, item)
    aggregate = [...merged.values()].sort((a, b) => a.repoKey.localeCompare(b.repoKey))
  }
  const summary = { schemaVersion: 1, updatedAt: new Date().toISOString(), repositories: aggregate.length, entries: aggregate.reduce((n, r) => n + r.entries, 0), sourceFiles: aggregate.reduce((n, r) => n + (r.workspaceFiles ?? 0), 0), publishedComponents: 0, liveComponents: 0, list: aggregate }
  await write(path.join(OUTPUT, 'index.json'), summary)
  console.log(JSON.stringify({ repositories: summary.repositories, entries: summary.entries, sourceFiles: summary.sourceFiles, publishedComponents: 0, liveComponents: 0 }))
  return summary
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), repo = args.includes('--repo') ? args[args.indexOf('--repo') + 1] : undefined
  do {
    await generatePreviewInputs({ repo, force: args.includes('--force') })
    if (!args.includes('--watch')) break
    await new Promise(resolve => setTimeout(resolve, 30000))
  } while (true)
}
