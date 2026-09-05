/* Probe ecosyste.ms API params */
const UA = 'VisLexicon-probe/1.0'
async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) })
  const text = await r.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* not json */ }
  return { status: r.status, json, text: text.slice(0, 300) }
}

const probes = [
  'https://repos.ecosyste.ms/api/v1/hosts/GitHub/repositories?topic=ui-components&per_page=3&archived=false&fork=false',
  'https://repos.ecosyste.ms/api/v1/hosts/GitHub/repositories?topic=ui-components&per_page=3&sort=stargazers_count&order=desc',
  'https://repos.ecosyste.ms/api/v1/hosts/GitHub/repositories?topic=design-system&per_page=3&stargazers_count_min=100',
  'https://repos.ecosyste.ms/api/v1/hosts/GitHub/topics/ui-components',
]

for (const url of probes) {
  const { status, json, text } = await get(url)
  console.log(`== ${status} ${url.split('?')[1] || url}`)
  if (Array.isArray(json)) {
    console.log(`   array len=${json.length}`)
    if (json[0]) console.log('   first:', JSON.stringify({ full_name: json[0].full_name, stars: json[0].stargazers_count, homepage: json[0].homepage, archived: json[0].archived, fork: json[0].fork }))
  } else {
    console.log('   text:', text.slice(0, 150))
  }
}
