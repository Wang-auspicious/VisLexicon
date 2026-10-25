// Copy screenshot-lane captures from the local harvest into public/shots and
// write their descriptions and source links to src/generated/shots.json.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATALOG } from '../src/catalog.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FRONTEND = fs.existsSync(path.resolve(ROOT, '../frontend/package.json')) ? path.resolve(ROOT, '../frontend') : path.resolve(ROOT, '..')
const SHOTS = path.join(FRONTEND, 'data/discovery/local-public/v4/shots')
const lines = file => fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line))
const wanted = new Set(CATALOG.filter(entry => entry.lane === 'screenshot').map(entry => entry.shotId))
if (!fs.existsSync(path.join(FRONTEND, 'data/harvest-v4/capture.jsonl'))) {
  const bundled = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/shots.json'), 'utf8'))
  for (const id of wanted) {
    if (!bundled[id]?.frames?.length || bundled[id].frames.some(frame => !fs.existsSync(path.join(ROOT, 'public', frame.src)))) throw new Error(`Bundled original screenshot is missing: ${id}`)
  }
  console.log(`Verified ${wanted.size} bundled original screenshot fixtures; no local raw capture archive required.`)
  process.exit(0)
}
const described = new Map(lines(path.join(FRONTEND, 'data/harvest-v4/described.jsonl')).filter(d => wanted.has(d.id)).map(d => [d.id, d]))
const captured = new Map(lines(path.join(FRONTEND, 'data/harvest-v4/capture.jsonl')).filter(c => wanted.has(c.id)).map(c => [c.id, c]))

fs.mkdirSync(path.join(ROOT, 'public/shots'), { recursive: true })
const out = {}
for (const id of wanted) {
  const d = described.get(id), c = captured.get(id)
  if (!d || !c) throw new Error(`missing harvest record ${id}`)
  const frames = []
  for (const [kind, file] of [['default', c.shot], ['hover', c.hover], ['frame2', c.frame2]]) {
    if (!file || !fs.existsSync(path.join(SHOTS, file))) continue
    fs.copyFileSync(path.join(SHOTS, file), path.join(ROOT, 'public/shots', file))
    frames.push({ kind, src: `shots/${file}` })
  }
  out[id] = {
    zh: d.nameZh, en: d.nameEn, type: d.type,
    summaryZh: d.lookZh, summaryEn: d.lookEn, motionZh: d.motionZh, motionEn: d.motionEn, useZh: d.useZh, useEn: d.useEn,
    style: d.style, colors: d.colors, prompt: d.prompt,
    site: c.site, host: c.host, page: c.sourceUrl, capturedAt: c.capturedAt, size: c.size, animated: c.animated, frames,
  }
}
fs.mkdirSync(path.join(ROOT, 'src/generated'), { recursive: true })
fs.writeFileSync(path.join(ROOT, 'src/generated/shots.json'), JSON.stringify(out, null, 1))
console.log(Object.entries(out).map(([id, s]) => `${id} ${s.frames.map(f => f.kind).join('+')} ${s.page}`).join('\n'))
