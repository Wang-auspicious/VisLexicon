import fs from 'node:fs/promises'
import sync from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { sourceInventory, sourceKey } from '../harvest/sources.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const OUT = path.join(ROOT, 'data/ingest-v6/screenshots')
const write = async (file, value) => { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, typeof value === 'string' ? value : JSON.stringify(value, null, 2)) }
const readRows = async file => (await fs.readFile(file, 'utf8').catch(() => '')).split('\n').filter(Boolean).map(line => JSON.parse(line))
const sha = value => createHash('sha256').update(value).digest('hex')
const alive = pid => { try { process.kill(pid, 0); return true } catch { return false } }

export async function prepareScreenshotIntake() {
  await fs.mkdir(path.join(OUT, 'raw'), { recursive: true })
  const raw = path.join(OUT, 'raw/screenshot-coverage.json')
  try { await fs.access(raw) } catch { await fs.copyFile(path.join(ROOT, 'data/ingest-v6/screenshot-coverage.json'), raw, sync.constants.COPYFILE_EXCL) }
  const bytes = await fs.readFile(raw), original = JSON.parse(bytes.toString('utf8'))
  const observations = original.entries
  if (observations.length !== 474) throw new Error(`Screenshot source observation count changed: ${observations.length}`)
  const candidates = observations.map((entry, observationIndex) => ({ id: entry.entryId, name: entry.name, url: entry.homepage, observationIndex, existingCaptureRows: entry.validCaptureRows ?? 0 }))
    .sort((a, b) => Number(Boolean(a.existingCaptureRows)) - Number(Boolean(b.existingCaptureRows)) || a.observationIndex - b.observationIndex)
  const inventory = sourceInventory(candidates)
  if (inventory.dispositions.length !== 474 || inventory.uniqueStartUrls + inventory.aliases + inventory.invalid !== 474) throw new Error('Screenshot source count conservation failed')
  const target = path.join(OUT, 'site-candidates.json'), candidateBytes = JSON.stringify(candidates, null, 2)
  try { if ((await fs.readFile(target, 'utf8')) !== candidateBytes) throw new Error('Frozen batch sources differ; do not overwrite an active batch') } catch (error) { if (error.code !== 'ENOENT') throw error; await fs.writeFile(target, candidateBytes, { flag: 'wx' }) }
  await write(path.join(OUT, 'source-input-receipt.json'), { rawDigest: sha(bytes), rawBytes: bytes.length, rawObservationCount: observations.length, uniqueStartUrls: inventory.uniqueStartUrls, duplicateObservations: inventory.aliases, invalid: inventory.invalid, preservedOriginalIds: true, sourceSnapshotDigest: sha(candidateBytes) })
  return { candidates, inventory }
}

export async function screenshotIntakeStatus() {
  const { candidates, inventory } = await prepareScreenshotIntake()
  const sites = await readRows(path.join(OUT, 'sites.jsonl'))
  const captures = await readRows(path.join(OUT, 'capture.jsonl'))
  const descriptions = await readRows(path.join(OUT, 'described.jsonl'))
  const failedDescriptions = await readRows(path.join(OUT, 'describe-failed.jsonl'))
  const latest = new Map(sites.map(site => [sourceKey(site), site]))
  const dispositions = inventory.dispositions.map(row => ({ ...row, attempt: latest.get(row.key)?.completion ?? (latest.has(row.key) ? 'attempted' : 'pending'), saved: latest.get(row.key)?.saved ?? 0, fatal: latest.get(row.key)?.fatal ?? null }))
  await write(path.join(OUT, 'source-attempt-dispositions.json'), { observations: dispositions, countConserved: dispositions.length === 474 })
  const status = { at: new Date().toISOString(), rawObservations: candidates.length, uniqueStartUrls: inventory.uniqueStartUrls, duplicates: inventory.aliases, attemptedStartUrls: latest.size, pendingStartUrls: inventory.uniqueStartUrls - latest.size, recordedCaptures: captures.length, described: descriptions.length, failedDescriptions: failedDescriptions.length, sourceCoverageComplete: dispositions.every(d => d.attempt === 'complete'), providerStopped: sync.existsSync(path.join(OUT, 'describe-provider-stop.json')), capturePassFinished: sync.existsSync(path.join(OUT, 'capture.done')) }
  await write(path.join(OUT, 'summary.json'), status)
  return status
}

export async function runScreenshotIntake() {
  await prepareScreenshotIntake()
  const lock = path.join(OUT, 'intake.lock')
  try { const owner = JSON.parse(await fs.readFile(lock, 'utf8')); if (alive(owner.pid)) throw new Error(`Screenshot intake already running: ${owner.pid}`) } catch (error) { if (error.code !== 'ENOENT' && !error.message.includes('already running')) {} else if (error.message.includes('already running')) throw error }
  await write(lock, { pid: process.pid, at: new Date().toISOString() })
  const launch = (script, args, log, extra = {}) => {
    const handle = sync.openSync(path.join(OUT, log), 'a')
    const child = spawn(process.execPath, [script, ...args], { cwd: ROOT, windowsHide: true, env: { ...process.env, NODE_USE_ENV_PROXY: '1', ...extra }, stdio: ['ignore', handle, handle] })
    sync.closeSync(handle)
    return child
  }
  const capture = launch('scripts/harvest/capture.mjs', [`--sources=${path.join(OUT, 'site-candidates.json')}`, `--out=${OUT}`, '--baseline=data/harvest-v4', '--story-variants=all', '--conc=3', '--pages=100000', '--stages=100000', '--minutes=30'], 'capture-worker.log')
  let captureExit = null, description = null, descriptionExit = null
  capture.once('exit', code => { captureExit = code ?? -1 })
  capture.once('error', () => { captureExit = -1 })
  try {
    for (;;) {
      if (!description && sync.existsSync(path.join(OUT, 'capture.jsonl')) && !sync.existsSync(path.join(OUT, 'describe-provider-stop.json'))) {
        description = launch('--import', [pathToFileURL(path.join(ROOT, 'scripts/ingest-v6/describe-quota-guard.mjs')).href, 'scripts/harvest/describe.mjs', `--out=${OUT}`, '--model=deepseek-v4.1-flash', '--conc=2'], 'describe-worker.log', { VISLEXICON_SCREENSHOT_BATCH: OUT })
        description.once('exit', code => { descriptionExit = code ?? -1 })
        description.once('error', () => { descriptionExit = -1 })
      }
      await write(path.join(OUT, 'workers.json'), { at: new Date().toISOString(), intakePid: process.pid, capturePid: capture.pid, captureExit, descriptionPid: description?.pid ?? null, descriptionExit, model: 'deepseek-v4.1-flash', outputDirectory: OUT })
      if (captureExit !== null && (!description || descriptionExit !== null)) break
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  } finally { await fs.unlink(lock).catch(() => {}) }
  console.log(JSON.stringify(await screenshotIntakeStatus()))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] ?? 'status'
  if (command === 'run') await runScreenshotIntake()
  else if (command === 'prepare') { const { inventory } = await prepareScreenshotIntake(); console.log(JSON.stringify({ observations: inventory.rawCandidates, unique: inventory.uniqueStartUrls, duplicates: inventory.aliases, invalid: inventory.invalid })) }
  else if (command === 'stop') { await write(path.join(OUT, 'capture.stop'), new Date().toISOString()); console.log('Stop requested for this screenshot batch only.') }
  else console.log(JSON.stringify(await screenshotIntakeStatus()))
}
