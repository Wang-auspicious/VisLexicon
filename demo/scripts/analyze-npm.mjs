/* Analyze npm-resources popularity distribution */
import { readFileSync } from 'node:fs'

const raw = JSON.parse(readFileSync('data/sources/npm-resources.raw.json', 'utf8'))
const records = raw.records
console.log('total:', records.length)
const pops = records.map((r) => r.popularity).sort((a, b) => a - b)
const quantile = (q) => pops[Math.floor(pops.length * q)]
console.log('popularity p10/p25/p50/p75/p90:', [0.1, 0.25, 0.5, 0.75, 0.9].map((q) => quantile(q).toFixed(3)).join(' / '))
console.log('github.com hosted:', records.filter((r) => /github\.com/.test(r.originalUrl)).length)
console.log('\n--- 15 samples with popularity >= 0.5 ---')
for (const r of records.filter((r) => r.popularity >= 0.5).sort(() => Math.random() - 0.5).slice(0, 15)) {
  console.log(`- [${r.categoryOriginal}] ${r.name} :: ${r.originalDescription.slice(0, 60)} :: ${r.originalUrl.slice(0, 55)} :: pop=${r.popularity}`)
}
