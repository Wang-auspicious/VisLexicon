// Fetch original component source into src/vendor/.
// Registry items resolve registryDependencies recursively and keep their file
// paths, so relative imports between files keep working. GitHub files are read
// at a pinned commit. Run with NODE_USE_ENV_PROXY=1 on this machine.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = path.join(ROOT, 'registry-cache')
const VENDOR = path.join(ROOT, 'src/vendor')

export const REGISTRY = {
  magicui: { base: 'https://magicui.design/r/', items: ['number-ticker', 'flickering-grid', 'border-beam', 'shimmer-button', 'animated-circular-progress-bar', 'dock'] },
  fancy: { base: 'https://fancy-ui.rama.app/r/', items: ['pixel-loader', 'tick-nav'] },
}
export const GITHUB = [
  { repo: 'shadcn-ui/ui', commit: 'e55b60b1014cccfb9ac62f97e0d20b5b649f4a54', file: 'apps/v4/registry/new-york-v4/ui/chart.tsx', to: 'shadcn/chart.tsx' },
  {"repo":"xyflow/xyflow","commit":"8523d8dd9f1551954bc221dccabd6a3119ef9e22","file":"packages/react/src/container/ReactFlow/index.tsx","to":"packages/flow-canvas/packages/react/src/container/ReactFlow/index.tsx"},
  {"repo":"bvaughn/react-resizable-panels","commit":"c19f0a93a96e4f214e9bd7b77eaec155f31f50d7","file":"lib/components/group/Group.tsx","to":"packages/resizable-panels/lib/components/group/Group.tsx"},
  {"repo":"bvaughn/react-resizable-panels","commit":"c19f0a93a96e4f214e9bd7b77eaec155f31f50d7","file":"lib/components/panel/Panel.tsx","to":"packages/resizable-panels/lib/components/panel/Panel.tsx"},
  {"repo":"react-grid-layout/react-grid-layout","commit":"866f646fe9989f604a0d26dba756fab630f07d23","file":"src/react/components/GridLayout.tsx","to":"packages/grid-layout/src/react/components/GridLayout.tsx"},
  {"repo":"Hacker0x01/react-datepicker","commit":"548a1f3464c30741f2581c78f27fe1f20f9aeac6","file":"src/index.tsx","to":"packages/date-picker/src/index.tsx"},
  {"repo":"remarkjs/react-markdown","commit":"f9ca66ec73d218127bff56b41a583bba1fb96125","file":"lib/index.js","to":"packages/markdown/lib/index.js"},
]

fs.mkdirSync(CACHE, { recursive: true })
fs.mkdirSync(VENDOR, { recursive: true })

async function item(site, nameOrUrl) {
  const url = nameOrUrl.startsWith('http') ? nameOrUrl : nameOrUrl.startsWith('@') ? `${REGISTRY[site].base}${nameOrUrl.split('/')[1]}.json` : `${REGISTRY[site].base}${nameOrUrl}.json`
  const name = url.split('/').pop().replace(/\.json$/, '')
  const cached = path.join(CACHE, `${site}__${name}.json`)
  if (fs.existsSync(cached)) return JSON.parse(fs.readFileSync(cached, 'utf8'))
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${url} → ${response.status}`)
  const body = await response.json()
  fs.writeFileSync(cached, JSON.stringify(body, null, 1))
  return body
}

/** Registry `css` objects are nested rule maps; write them back as CSS text. */
function cssText(rules, indent = '') {
  return Object.entries(rules).map(([selector, value]) => typeof value === 'string'
    ? `${indent}${selector}: ${value};`
    : `${indent}${selector} {\n${cssText(value, indent + '  ')}\n${indent}}`).join('\n')
}

const manifest = { generatedAt: new Date().toISOString(), registry: {}, github: [], dependencies: new Set() }
const css = []
const theme = []
for (const [site, config] of Object.entries(REGISTRY)) {
  const seen = new Set()
  const visit = async ref => {
    const body = await item(site, ref)
    if (seen.has(body.name)) return
    seen.add(body.name)
    for (const dep of body.dependencies ?? []) manifest.dependencies.add(dep.replace(/@[\^~]?[\d.]+$/, ''))
    for (const file of body.files) {
      // Magic UI ships registry/magicui/x.tsx; fancy-ui ships react/src/... paths.
      const relative = site === 'magicui' ? file.path.replace(/^registry\/magicui\//, '') : file.path
      const target = path.join(VENDOR, site, relative)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, file.content)
    }
    if (body.css) css.push(`/* ${site}/${body.name} */\n${cssText(body.css)}`)
    for (const [key, value] of Object.entries(body.cssVars?.theme ?? {})) theme.push(`  --${key}: ${value};`)
    manifest.registry[`${site}/${body.name}`] = { type: body.type, files: body.files.map(f => f.path), dependencies: body.dependencies ?? [], registryDependencies: body.registryDependencies ?? [] }
    for (const dep of body.registryDependencies ?? []) if (dep.startsWith('http') || dep.startsWith('@')) await visit(dep)
  }
  for (const name of config.items) await visit(name)
}
for (const source of GITHUB) {
  const content = execFileSync('gh', ['api', `repos/${source.repo}/contents/${source.file}?ref=${source.commit}`, '-H', 'Accept: application/vnd.github.raw'], { encoding: 'utf8', maxBuffer: 8 << 20 })
  const target = path.join(VENDOR, source.to)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, content)
  manifest.github.push({ ...source, bytes: Buffer.byteLength(content) })
}
// Shared helper that Magic UI and shadcn import as @/lib/utils.
fs.mkdirSync(path.join(VENDOR, 'lib'), { recursive: true })
fs.writeFileSync(path.join(VENDOR, 'lib/utils.ts'), 'import { clsx, type ClassValue } from "clsx"\nimport { twMerge } from "tailwind-merge"\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs))\n}\n')
fs.writeFileSync(path.join(VENDOR, 'registry.css'), `@theme {\n${theme.join('\n')}\n}\n\n${css.join('\n\n')}\n`)
fs.writeFileSync(path.join(VENDOR, 'manifest.json'), JSON.stringify({ ...manifest, dependencies: [...manifest.dependencies].sort() }, null, 1))
console.log(`registry items ${Object.keys(manifest.registry).length}, github files ${manifest.github.length}, deps ${[...manifest.dependencies].join(', ')}`)
