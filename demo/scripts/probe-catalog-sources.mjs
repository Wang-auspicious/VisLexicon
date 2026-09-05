/* Probe directory listing sites for catalog expansion */
import { writeFileSync, mkdirSync } from 'node:fs'

mkdirSync('data/probes', { recursive: true })
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) })
  return { status: r.status, html: await r.text() }
}

function clean(value) {
  return String(value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

const targets = [
  ['godly', 'https://godly.website/'],
  ['landingfolio', 'https://www.landingfolio.com/'],
  ['saaslandingpage', 'https://saaslandingpage.com/'],
  ['designresources', 'https://designresourc.es/'],
  ['designsystemsrepo', 'https://www.designsystemsrepo.com/'],
  ['curated', 'https://curated.design/'],
  ['hackerthemes', 'https://hackerthemes.com/'],
]

for (const [name, url] of targets) {
  try {
    const { status, html } = await get(url)
    writeFileSync(`data/probes/${name}.html`, html)
    const links = [...new Set([...html.matchAll(/href="([^"#]+)"/g)].map((m) => m[1]))].filter((l) => /^https?:\/\//.test(l) || l.startsWith('/'))
    const text = clean(html)
    console.log(`== ${name} ${status} ${(html.length / 1024).toFixed(0)}KB links=${links.length}`)
    console.log('   text:', text.slice(0, 220))
    console.log('   sample links:', links.slice(0, 12).join(' | '))
  } catch (e) {
    console.log(`== ${name} ERR ${e.cause?.code || e.message}`)
  }
}
