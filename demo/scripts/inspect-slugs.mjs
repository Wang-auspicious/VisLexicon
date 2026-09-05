/* Inspect slug extraction per source */
import { extractSlugs } from './visual-atlas/web-collectors.mjs'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36'
async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) })
  return r.text()
}

// mui
{
  const html = await get('https://mui.com/material-ui/all-components/')
  const slugs = [...new Set([...html.matchAll(/href="(\/material-ui\/react-[a-z0-9-]+)\/"/g)].map((m) => m[1].replace(/\/$/, '').split('/').at(-1)))]
  console.log('mui total:', slugs.length)
  console.log(slugs.join(' '))
}
// bulma
{
  const html = await get('https://bulma.io/documentation/')
  const pages = [...new Set([...html.matchAll(/href="(https:\/\/bulma\.io\/documentation\/(?:components|elements|form|layout)\/[a-z-]+\/)"/g)].map((m) => m[1]))]
  console.log('\nbulma pages:', pages.length)
  console.log(pages.map((p) => new URL(p).pathname).join(' '))
}
// primer
{
  const html = await get('https://primer.style/product/components/')
  const withSlash = [...new Set([...html.matchAll(/href="(\/product\/components\/[a-z0-9-]+)\/"/g)].map((m) => m[1]))]
  const any = [...new Set([...html.matchAll(/href="(\/product\/components\/[a-z0-9-]+)\/?"/g)].map((m) => m[1]))]
  console.log('\nprimer with-slash:', withSlash.length, 'any:', any.length)
  console.log(any.map((p) => p.replace(/\/$/, '')).join(' '))
}
// chakra
{
  const html = await get('https://chakra-ui.com/docs/components/concepts/overview')
  const slugs = [...new Set([...html.matchAll(/href="(\/docs\/components\/[a-z0-9-]+)"/g)].map((m) => m[1].split('/').at(-1)))].filter((s) => !s.startsWith('concepts'))
  console.log('\nchakra slugs:', slugs.length)
  console.log(slugs.join(' '))
}
