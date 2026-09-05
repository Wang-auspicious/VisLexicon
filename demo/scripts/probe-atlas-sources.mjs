/* Probe listing structures for atlas source candidates */
import { writeFileSync, existsSync, readFileSync } from 'node:fs'

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

const targets = [
  ['antd-home', 'https://ant.design/'],
  ['chakra-home', 'https://chakra-ui.com/'],
  ['headlessui-home', 'https://headlessui.com/'],
]

for (const [name, url] of targets) {
  try {
    const { status, html } = await get(url)
    writeFileSync(`data/probes/${name}.html`, html)
    const compLinks = extractLinks(html, /href="(\/[^"]*(?:component|docs|primitives|ui)[^"]*)"/gi).slice(0, 20)
    console.log(`== ${name} ${status} ${(html.length / 1024).toFixed(0)}KB`)
    console.log('candidate links:', compLinks.slice(0, 10).join(' | '))
    console.log('text:', textOf(html).slice(0, 160))
  } catch (e) {
    console.log(`== ${name} ERR`, e.cause?.code || e.message)
  }
}

// radix: component page -> sidebar links
{
  const { html } = await get('https://www.radix-ui.com/primitives/docs/components/accordion')
  writeFileSync('data/probes/radix-accordion.html', html)
  const links = extractLinks(html, /href="(\/primitives\/docs\/components\/[a-z0-9-]+)"/g)
  console.log(`\n== radix primitives sidebar: ${links.length}`)
  console.log(links.slice(0, 60).join(' '))
}

// bootstrap: one component page -> sidebar links
{
  const { html } = await get('https://getbootstrap.com/docs/5.3/components/accordion')
  writeFileSync('data/probes/bootstrap-accordion.html', html)
  const links = extractLinks(html, /href="(\/docs\/5\.3\/components\/[a-z0-9-]+)"/g)
  console.log(`\n== bootstrap components sidebar: ${links.length}`)
  console.log([...new Set(links)].join(' '))
}

// mui: all-components page anchors
{
  const html = existsSync('data/probes/mui.html') ? readFileSync('data/probes/mui.html', 'utf8') : (await get('https://mui.com/material-ui/all-components/')).html
  const anchors = extractLinks(html, /href="(\/material-ui\/react-[a-z0-9-]+)"/g)
  console.log(`\n== mui anchors: ${anchors.length}`)
  console.log(anchors.slice(0, 40).join(' '))
}
