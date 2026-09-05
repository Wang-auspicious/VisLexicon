/* Inspect description quality without count gates */
import { WEB_COLLECTORS, WEB_SOURCE_MANIFEST } from './visual-atlas/web-collectors.mjs'

const id = process.argv[2]
const snapshot = await WEB_COLLECTORS[id]()
const records = snapshot.records
const fallback = records.filter((r) => r.sourceDefinition.includes(` is a `) || r.sourceDefinition.includes(' is an ')).length
console.log(`${id}: ${records.length} records, ${fallback} fallback descriptions`)
for (const record of records) {
  console.log(`- ${record.termEn} :: ${record.sourceDefinition.slice(0, 110)}`)
}
