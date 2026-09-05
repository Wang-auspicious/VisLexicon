/* Deep-inspect landingfolio payload + saaslandingpage card structure */
import { readFileSync } from 'node:fs'

// landingfolio payload
const payload = JSON.parse(readFileSync('data/probes/landingfolio-payload.json', 'utf8'))
console.log('payload keys:', Object.keys(payload).slice(0, 8))
const first = payload[0]
console.log('payload[0] type:', typeof first, first ? JSON.stringify(first).slice(0, 300) : '')

// saaslandingpage article card
const html = readFileSync('data/probes/saaslandingpage-p2.html', 'utf8')
const article = html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? ''
console.log('\nsaaslandingpage article sample:')
console.log(article.replace(/\s+/g, ' ').slice(0, 800))
