/* Probe more directory sources for catalog expansion */
import { writeFileSync } from 'node:fs'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) })
  const text = await r.text()
  return { status: r.status, text, length: text.length }
}
function clean(v) { return String(v ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }

const targets = [
  ['thetool', 'https://thetool.io/'],
  ['uxtools', 'https://uxtools.co/'],
  ['designresources-dev', 'https://designresources.dev/'],
  ['landinglove', 'https://landing.love/'],
  ['dsr-pagedata', 'https://www.designsystemsrepo.com/page-data/index/page-data.json'],
  ['designvault', 'https://designvault.io/'],
]

for (const [name, url] of targets) {
  try {
    const { status, text, length } = await get(url)
    writeFileSync(`data/probes/${name}.html`, text)
    const links = [...new Set([...text.matchAll(/href="(https?:\/\/[^"#]+)"/g)].map((m) => m[1]))].filter((u) => !new URL(u).hostname.includes(name.split('-')[0]))
    console.log(`== ${name} ${status} ${(length / 1024).toFixed(0)}KB extLinks=${links.length}`)
    console.log('   text:', clean(text).slice(0, 160))
    if (name === 'dsr-pagedata') {
      try {
        const json = JSON.parse(text)
        console.log('   dsr page-data keys:', Object.keys(json).slice(0, 10))
        const results = JSON.stringify(json).match(/designsystemsrepo\.com\/design-systems\/[a-z0-9-]+/g)
        console.log('   dsr design-system links found:', results ? results.length : 0)
      } catch { console.log('   dsr page-data: not json') }
    }
  } catch (e) {
    console.log(`== ${name} ERR ${e.cause?.code || e.message}`)
  }
}
