/* Probe ecosyste.ms ordering options */
const UA = 'VisLexicon-probe/1.0'
const base = 'https://repos.ecosyste.ms/api/v1/hosts/GitHub/repositories?topic=design-system&per_page=100&page=1'

async function check(label, url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) })
    const json = await r.json()
    const stars = json.map((x) => x.stargazers_count ?? 0)
    const positive = stars.filter((s) => s > 0).length
    console.log(`${label}: ${json.length} repos, positive-stars=${positive}, max=${Math.max(...stars, 0)}`)
    const good = json.filter((x) => (x.stargazers_count ?? 0) >= 100).slice(0, 3)
    for (const g of good) console.log('   ', g.full_name, g.stargazers_count, g.homepage || '')
  } catch (e) {
    console.log(`${label}: ERR ${e.cause?.code || e.message}`)
  }
}

await check('plain p1', `${base}`)
await check('sort=stargazers_count', `${base}&sort=stargazers_count`)
await check('sort=stars', `${base}&sort=stars`)
await check('order=desc', `${base}&order=desc&sort=stargazers_count`)
await check('page=20', `${base.replace('page=1', 'page=20')}`)
await check('page=50', `${base.replace('page=1', 'page=50')}`)
await check('page=100', `${base.replace('page=1', 'page=100')}`)
