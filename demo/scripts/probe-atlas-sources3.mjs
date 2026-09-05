import { readFileSync } from 'node:fs'

const show = (name, pattern) => {
  const html = readFileSync(`data/probes/${name}.html`, 'utf8')
  const links = [...new Set([...html.matchAll(pattern)].map((m) => m[1]))].sort()
  console.log(`== ${name} == ${links.length}`)
  console.log(links.slice(0, 40).join('\n'))
}

show('mui', /href="([^"#]*react[^"#]*)"/g)
show('bulma', /href="(https:\/\/bulma\.io\/documentation\/[^"#]*)"/g)
show('primer', /href="(https:\/\/primer\.style\/components\/[^"#]*)"/g)
