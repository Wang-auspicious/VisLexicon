import { readFileSync } from 'node:fs'
const snap = JSON.parse(readFileSync('data/visual-atlas-sources/ant-design.raw.json', 'utf8'))
for (const r of snap.records.slice(0, 8)) {
  console.log('---', r.sourceRecordId)
  console.log('termEn:', r.termEn)
  console.log('def:', (r.sourceDefinition || '').slice(0, 90))
  console.log('nativeZh:', JSON.stringify(r.sourceMetadata?.nativeZh))
}
