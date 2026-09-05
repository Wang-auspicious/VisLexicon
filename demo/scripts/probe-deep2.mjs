/* Check landingfolio embedded data + saaslandingpage descriptions/pagination */
import { readFileSync } from 'node:fs'

// landingfolio: grep for real site links
{
  const html = readFileSync('data/probes/landingfolio.html', 'utf8')
  const links = [...new Set([...html.matchAll(/https:\/\/[a-z0-9.-]+\.[a-z]{2,}[^"'\s<]*/g)].map((m) => m[0]))]
    .filter((u) => !/landingfolio|nuxt|schema\.org|w3\.org|googleapis/.test(u))
  console.log(`landingfolio external links: ${links.length}`)
  console.log(links.slice(0, 15).join('\n'))
  const ldjson = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)
  console.log('ld+json blocks:', ldjson ? ldjson.length : 0)
}

// saaslandingpage: description + pagination
{
  const html = readFileSync('data/probes/saaslandingpage-p2.html', 'utf8')
  const pDesc = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi)?.slice(0, 6).map((p) => p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter((t) => t.length > 40)
  console.log('\nsaaslandingpage long paragraphs:', pDesc?.slice(0, 3))
  const pagination = html.match(/href="(https:\/\/saaslandingpage\.com\/page\/(\d+)\/)"[^>]*>([\s\S]*?)<\/a>/g)?.slice(0, 10)
  console.log('pagination links:', pagination?.join(' | ') ?? 'none')
  const pageNums = [...html.matchAll(/page\/(\d+)\//g)].map((m) => Number(m[1]))
  console.log('max page seen:', pageNums.length ? Math.max(...pageNums) : '?')
}
