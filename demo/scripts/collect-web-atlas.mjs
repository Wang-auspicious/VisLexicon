/* 采集 web 类图鉴来源（GitHub 不可达时独立运行，写 raw snapshot 供 build 使用）。
 * 用法：node scripts/collect-web-atlas.mjs [sourceId...]
 */
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  WEB_SOURCE_MANIFEST,
  WEB_COLLECTORS,
} from './visual-atlas/web-collectors.mjs'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIR, '..')
const DEFAULT_OUTPUT_DIR = resolve(DEMO_ROOT, 'data/visual-atlas-sources')

async function writeAtomically(path, payload) {
  const temporary = `${path}.tmp-${process.pid}`
  await mkdir(dirname(path), { recursive: true })
  await writeFile(temporary, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  await rm(path, { force: true })
  await rename(temporary, path)
}

const requested = process.argv.slice(2)
const ids = requested.length > 0 ? requested : Object.keys(WEB_COLLECTORS)

const results = []
for (const sourceId of ids) {
  const started = Date.now()
  try {
    const snapshot = await WEB_COLLECTORS[sourceId]()
    await writeAtomically(resolve(DEFAULT_OUTPUT_DIR, `${sourceId}.raw.json`), snapshot)
    results.push({ id: sourceId, records: snapshot.records.length, seconds: ((Date.now() - started) / 1000).toFixed(0) })
    console.log(`[ok] ${sourceId}: ${snapshot.records.length} records (${results.at(-1).seconds}s)`)
  } catch (error) {
    results.push({ id: sourceId, error: error.message })
    console.log(`[ERR] ${sourceId}: ${error.message}`)
  }
}

const total = results.filter((r) => r.records).reduce((sum, r) => sum + r.records, 0)
console.log(JSON.stringify({ webSources: results.length, totalRecords: total, results }, null, 2))
