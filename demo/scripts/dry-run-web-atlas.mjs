/* Dry-run web atlas collectors and report counts + sample quality */
import {
  WEB_SOURCE_MANIFEST,
  WEB_COLLECTORS,
} from './visual-atlas/web-collectors.mjs'

const sources = process.argv.slice(2)
const ids = sources.length > 0 ? sources : Object.keys(WEB_COLLECTORS)

for (const id of ids) {
  const started = Date.now()
  try {
    const snapshot = await WEB_COLLECTORS[id]()
    const manifest = WEB_SOURCE_MANIFEST[id]
    const drift = snapshot.records.length === manifest.verifiedCount ? '' : ` DRIFT: manifest says ${manifest.verifiedCount}`
    console.log(`[ok] ${id}: ${snapshot.records.length} records (${((Date.now() - started) / 1000).toFixed(0)}s)${drift}`)
    for (const record of snapshot.records.slice(0, 3)) {
      console.log(`     - ${record.termEn} :: ${record.sourceDefinition.slice(0, 90)}`)
    }
    const empty = snapshot.records.filter((r) => !r.sourceDefinition || r.sourceDefinition.includes(' is a ') === false).length
    console.log(`     records with real prose: ${snapshot.records.length - snapshot.records.filter((r) => r.sourceDefinition.includes(' is a ')).length}/${snapshot.records.length}`)
  } catch (error) {
    console.log(`[ERR] ${id}: ${error.message}`)
  }
}
