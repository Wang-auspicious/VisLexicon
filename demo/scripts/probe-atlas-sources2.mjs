/* Probe round 2: mui/chakra/bulma/primer/headlessui structures */
import { writeFileSync, readFileSync } from 'node:fs'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) })
  return { status: r.status, html: await r.text() }
}
function extractLinks(html, pattern) {
  return [...new Set([...html.matchAll(pattern)].map((m) => m[1]))].sort()
}
function textOf(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

// mui
{
  const html = readFileSync('data/probes/mui.html', 'utf8')
  const links = extractLinks(html, /href="(\/material-ui\/[a-z0-9-]+)"/g)
  console.log(`mui links (/material-ui/*): ${links.length}`)
  console.log(links.slice(0, 50).join(' '))
  const breadcrumb = html.match(/<nav[^>]*aria-label="Breadcrumb"[\s\S]*?<\/nav>/i)
  const main = html.match(/<main[\s\S]*?<\/main>/is)
  if (main) console.log('main text:', textOf(main[0]).slice(0, 200))
}

// chakra
{
  const { status, html } = await get('https://chakra-ui.com/docs/components/concepts/overview')
  writeFileSync('data/probes/chakra-components.html', html)
  console.log(`\nchakra components page: ${status} ${(html.length / 1024).toFixed(0)}KB`)
  const links = extractLinks(html, /href="(\/docs\/components\/[a-z0-9-/]+)"/g)
  console.log('chakra links:', links.slice(0, 30).join(' '))
  const text = textOf(html)
  console.log('text:', text.slice(0, 200))
}

// bulma
{
  const html = readFileSync('data/probes/bulma.html', 'utf8')
  const links = extractLinks(html, /href="(\/documentation\/[a-z0-9-/]+)"/g)
  console.log(`\nbulma doc links: ${links.length}`)
  console.log(links.slice(0, 40).join(' '))
}

// primer
{
  const html = readFileSync('data/probes/primer.html', 'utf8')
  const links = extractLinks(html, /href="(\/components\/[a-z0-9-]+)"/g)
  console.log(`\nprimer component links: ${links.length}`)
  console.log(links.slice(0, 40).join(' '))
}

// headlessui home -> nav links
{
  const html = readFileSync('data/probes/headlessui-home.html', 'utf8')
  const links = extractLinks(html, /href="(\/[a-z0-9/-]*)"/g)
  console.log(`\nheadlessui home links: ${links.length}`)
  console.log(links.slice(0, 40).join(' '))
  console.log('text:', textOf(html).slice(0, 300))
}
