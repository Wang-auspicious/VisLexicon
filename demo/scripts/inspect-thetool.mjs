/* Inspect thetool.io structure + landing.love pagination */
import { readFileSync } from 'node:fs'
import { get as _get } from 'node:https'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

// thetool.io
{
  const html = readFileSync('data/probes/thetool.html', 'utf8')
  const links = [...new Set([...html.matchAll(/href="(https?:\/\/[^"#]+)"/g)].map((m) => m[1]))]
    .filter((u) => !/thetool\.io|facebook|twitter|linkedin|google|cloudflare|schema\.org/.test(u))
  console.log(`thetool external: ${links.length}`)
  console.log(links.slice(0, 25).join('\n'))
  const cats = [...new Set([...html.matchAll(/href="(https:\/\/thetool\.io\/[a-z0-9-]+)/g)].map((m) => m[1]))]
  console.log('\nthetool internal category links:', cats.slice(0, 30).join('\n'))
}

// landing.love pagination
{
  const html = readFileSync('data/probes/landinglove.html', 'utf8')
  const pages = [...new Set([...html.matchAll(/href="(https:\/\/www\.landing\.love\/[a-z0-9/]*)"|href="(\/page\/\d+\/)"/g)].map((m) => m[1] || m[2]))]
  console.log('\nlanding.love internal links:', pages.slice(0, 20).join(', '))
  const itemLinks = [...new Set([...html.matchAll(/href="(https:\/\/[a-z0-9.-]+\.[a-z]{2,}[^"#]*)"[^>]*>/g)].map((m) => m[1]))].filter((u) => !/landing\.love/.test(u))
  console.log('landing.love external:', itemLinks.length)
  console.log(itemLinks.slice(0, 10).join('\n'))
}
