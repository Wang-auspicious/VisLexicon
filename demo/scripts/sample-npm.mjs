/* Sample npm-resources records for quality judgment */
import { readFileSync } from 'node:fs'

const raw = JSON.parse(readFileSync('data/sources/npm-resources.raw.json', 'utf8'))
console.log('total:', raw.records.length)
const githubHosted = raw.records.filter((r) => /github\.com/.test(r.originalUrl)).length
console.log('github.com hosted:', githubHosted, `(${((githubHosted / raw.records.length) * 100).toFixed(0)}%)`)
const topByDescription = [...raw.records].sort((a, b) => b.originalDescription.length - a.originalDescription.length)
console.log('\n--- 20 random samples ---')
for (const r of raw.records.sort(() => Math.random() - 0.5).slice(0, 20)) {
  console.log(`- [${r.categoryOriginal}] ${r.name} :: ${r.originalDescription.slice(0, 70)} :: ${r.originalUrl.slice(0, 60)}`)
}
