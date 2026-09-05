import { readFileSync } from 'node:fs'

const html = readFileSync('data/probes/primer.html', 'utf8')
const patterns = [
  [/href="(\/components\/[a-z0-9-]+)"/g, 'relative /components/*'],
  [/href="([^"]*primer\.style[^"]*)"/g, 'absolute primer.style'],
  [/href="([^"]*\/product\/[^"]*)"/g, '/product/*'],
]
for (const [pattern, label] of patterns) {
  const links = [...new Set([...html.matchAll(pattern)].map((m) => m[1]))].sort()
  console.log(`== ${label} == ${links.length}`)
  console.log(links.slice(0, 30).join('\n'))
}
