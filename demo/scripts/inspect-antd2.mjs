/* Inspect antd records without count gate */
import { collectAntd } from './visual-atlas/web-collectors.mjs'

// bypass envelope gate by monkey-patching: replicate collectAntd internals via re-import
const source = await import('./visual-atlas/web-collectors.mjs')
// temporarily call the internal collect logic: easiest is to import and run with gate relaxed
// we cannot relax the gate, so instead re-implement: reuse the collector but catch drift by reading records
try {
  const snapshot = await collectAntd()
  inspect(snapshot.records)
} catch (error) {
  // drift error: reconstruct from the error? instead, temporarily patch verifiedCount
  console.log('drift:', error.message)
}

function inspect(records) {
  console.log('records:', records.length)
  const withNative = records.filter((r) => r.sourceMetadata?.nativeZh).length
  const fallback = records.filter((r) => r.sourceDefinition.includes('是 Ant Design 的组件')).length
  console.log('nativeZh:', withNative, 'fallback:', fallback)
  for (const r of records.slice(0, 10)) {
    console.log('-', r.sourceRecordId, '|', r.termEn, '|', r.sourceMetadata?.nativeZh?.termZh || '(no native)', '|', (r.sourceDefinition || '').slice(0, 50))
  }
}
