import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const root = path.join(frontend, 'public/effects-atlas/fx')
const index = await import(pathToFileURL(path.join(root, 'index.js')))
const filenames = (await fs.readdir(root)).filter(n => n.endsWith('.js') && !['index.js', 'mapdata.js'].includes(n)).sort()
const categories = []
const problems = []
const exactIds = new Set()
const titles = new Map()
const cssHashes = new Map()
const bilingualFields = ['zh', 'en', 'dz', 'de', 'pz', 'pe']
const copyDifferences = []
const templateLike = []
const hash = data => createHash('sha256').update(data).digest('hex')
const record = (map, key, id) => map.set(key, [...(map.get(key) || []), id])

for (const name of filenames) {
  const category = (await import(pathToFileURL(path.join(root, name)))).default
  if (!category?.items) { problems.push({ file: name, issue: 'Missing default category.items' }); continue }
  categories.push({ id: category.id, zh: category.zh, en: category.en, count: category.items.length })
  for (const item of category.items) {
    const key = `${category.id}/${item.id}`
    if (exactIds.has(key)) problems.push({ id: key, issue: 'Duplicate identity' })
    exactIds.add(key)
    for (const field of bilingualFields) {
      if (typeof item[field] !== 'string' || !item[field].trim()) problems.push({ id: key, issue: `Missing ${field}` })
    }
    for (const field of ['en', 'de', 'pe']) {
      if (/[\u3400-\u9fff]/u.test(item[field] || '')) problems.push({ id: key, issue: `Chinese text in ${field}`, text: item[field] })
    }
    if (!index.STAGES[item.demo] || !index.BASE[item.demo]) problems.push({ id: key, issue: `Unknown demo ${item.demo}` })
    if (!item.css?.trim()) problems.push({ id: key, issue: 'Empty CSS' })
    if (/用于建立可解释的/.test(item.dz || '') || /creates an explainable/.test(item.de || '') || /使用令牌和约束表达/.test(item.pz || '') || /Express .* with tokens and constraints/.test(item.pe || '')) templateLike.push({ id: key, issue: 'Template-like explanation' })
    record(titles, `${item.en}`.normalize('NFKC').trim().toLowerCase(), key)
    record(cssHashes, hash(item.css || ''), key)
  }
  const sourceCopy = path.join(frontend, 'src/data/effects-fx', name)
  try {
    if (hash(await fs.readFile(sourceCopy)) !== hash(await fs.readFile(path.join(root, name)))) copyDifferences.push(name)
  } catch { copyDifferences.push(name) }
}

const loaded = new Set(categories.map(c => c.id))
const report = {
  generatedAt: new Date().toISOString(),
  actualDataDirectory: 'frontend/public/effects-atlas/fx',
  total: categories.reduce((n, c) => n + c.count, 0),
  uniqueIdentities: exactIds.size,
  modules: categories.length,
  categories,
  missingModules: index.CATEGORY_FILES.filter(id => !loaded.has(id)),
  groups: index.GROUPS.map(g => ({ id: g.id, zh: g.zh, count: categories.filter(c => g.of.includes(c.id)).reduce((n, c) => n + c.count, 0) })),
  problems,
  templateLike,
  duplicateTitleCandidates: [...titles].filter(([, ids]) => ids.length > 1).map(([title, ids]) => ({ title, ids })),
  identicalCssCandidates: [...cssHashes].filter(([, ids]) => ids.length > 1).map(([sha256, ids]) => ({ sha256, ids })),
  sourceCopyDifferences: copyDifferences,
  identities: [...exactIds].sort(),
}
const output = process.argv.find(a => a.startsWith('--output='))?.slice('--output='.length)
if (output) {
  await fs.mkdir(path.dirname(path.resolve(output)), { recursive: true })
  await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n')
}
console.log(JSON.stringify({ total: report.total, uniqueIdentities: report.uniqueIdentities, modules: report.modules, missingModules: report.missingModules, problems: problems.length, templateLike: templateLike.length, duplicateTitleGroups: report.duplicateTitleCandidates.length, identicalCssGroups: report.identicalCssCandidates.length, sourceCopyDifferences: copyDifferences, output }, null, 2))
if (process.argv.includes('--strict') && problems.length) process.exitCode = 1
