/* Probe npm registry search for catalog-quality resource sites */
const UA = 'VisLexicon catalog probe/1.0'

async function search(text, from = 0) {
  const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(text)}&size=250&from=${from}`
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) })
  if (!r.ok) throw new Error(`${r.status}`)
  return r.json()
}

const queries = ['react ui components', 'vue ui components', 'css framework', 'tailwind css components', 'icon library']

for (const query of queries) {
  try {
    const data = await search(query)
    const objects = data.objects || []
    const withHomepage = objects.filter((o) => o.package.links?.homepage || o.package.links?.repository)
    console.log(`== ${query}: total=${data.total} returned=${objects.length} withSite=${withHomepage.length}`)
    for (const o of objects.slice(0, 5)) {
      const p = o.package
      console.log(`   - ${p.name} :: ${(p.description || '').slice(0, 60)} :: ${p.links?.homepage || p.links?.repository || ''}`)
    }
  } catch (e) {
    console.log(`== ${query} ERR ${e.message}`)
  }
}
