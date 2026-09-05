/* Probe per-component page structure for description extraction */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) })
  return { status: r.status, html: await r.text() }
}

function clean(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const targets = [
  ['radix', 'https://www.radix-ui.com/primitives/docs/components/accordion'],
  ['mui', 'https://mui.com/material-ui/react-button/'],
  ['chakra', 'https://chakra-ui.com/docs/components/button'],
  ['primer', 'https://primer.style/product/components/button'],
  ['bulma', 'https://bulma.io/documentation/elements/button/'],
  ['headlessui', 'https://headlessui.com/react/button'],
  ['bootstrap', 'https://getbootstrap.com/docs/5.3/components/accordion'],
]

for (const [name, url] of targets) {
  try {
    const { status, html } = await get(url)
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/is)?.[1] ?? html
    const paragraphs = [...main.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => clean(m[1])).filter((t) => t.length > 40)
    console.log(`== ${name} (${status}) h1: ${clean(h1)}`)
    console.log('   p1:', (paragraphs[0] ?? '(none)').slice(0, 160))
    console.log('   p2:', (paragraphs[1] ?? '(none)').slice(0, 120))
  } catch (e) {
    console.log(`== ${name} ERR ${e.cause?.code || e.message}`)
  }
}
