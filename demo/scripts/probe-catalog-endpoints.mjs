/* Probe data endpoints for catalog sources */
import { writeFileSync } from 'node:fs'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) })
  const text = await r.text()
  return { status: r.status, text, length: text.length }
}

// 1. landingfolio nuxt payload
{
  const { status, text, length } = await get('https://www.landingfolio.com/_payload.json')
  writeFileSync('data/probes/landingfolio-payload.json', text)
  console.log(`landingfolio payload: ${status} ${(length / 1024).toFixed(0)}KB`)
  try {
    const json = JSON.parse(text)
    const keys = Object.keys(json).slice(0, 20)
    console.log('top keys:', keys.join(', '))
  } catch { console.log('not pure JSON (probably JS wrapper)') }
}

// 2. curated.design rss
{
  const { status, text, length } = await get('https://curated.design/rss.xml')
  writeFileSync('data/probes/curated-rss.xml', text)
  const items = (text.match(/<item>/g) || []).length
  console.log(`curated rss: ${status} ${(length / 1024).toFixed(0)}KB items=${items}`)
}

// 3. saaslandingpage page/2 article cards
{
  const { status, text, length } = await get('https://saaslandingpage.com/page/2/')
  writeFileSync('data/probes/saaslandingpage-p2.html', text)
  const h2 = (text.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || []).slice(0, 5).map((h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
  const articles = (text.match(/<article[\s\S]*?<\/article>/gi) || []).length
  console.log(`saaslandingpage p2: ${status} ${(length / 1024).toFixed(0)}KB articles=${articles}`)
  console.log('h2s:', h2.join(' | '))
}

// 4. designresourc.es RSC payload — look for resource urls
{
  const html = (await get('https://designresourc.es/')).text
  const urls = [...new Set([...html.matchAll(/"(https?:\/\/[^"\\]+)"/g)].map((m) => m[1]))].filter((u) => !/designresourc\.es|plausible|next\/static|w3\.org/.test(u))
  console.log(`designresources external urls in HTML: ${urls.length}`)
  console.log(urls.slice(0, 15).join('\n'))
}

// 5. designsystemsrepo examples
{
  const { status, text, length } = await get('https://www.designsystemsrepo.com/examples')
  writeFileSync('data/probes/dsr-examples.html', text)
  const links = [...new Set([...text.matchAll(/href="(https?:\/\/[^"#]+)"/g)].map((m) => m[1]))].filter((u) => !/designsystemsrepo/.test(u))
  console.log(`dsr /examples: ${status} ${(length / 1024).toFixed(0)}KB external links=${links.length}`)
  console.log(links.slice(0, 10).join('\n'))
}
