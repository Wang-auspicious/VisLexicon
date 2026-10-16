import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const digest = value => createHash('sha256').update(value).digest('hex')
const markerValues = [['private-network', ['10', '50', ''].join('.')], ['private-account', ['mir', 'ukj'].join('')]]
const zeroOid = /^0+$/

export function makePatterns(secrets = []) {
  const patterns = markerValues.map(([kind, value]) => ({ kind, value: Buffer.from(value), fingerprint: digest(value).slice(0, 12) }))
  if (secrets.some(value => typeof value === 'string' && value.length > 0 && value.length < 8)) throw Error('SECRET_CONFIG_KEY_TOO_SHORT')
  for (const secret of new Set(secrets.filter(value => typeof value === 'string' && value.length >= 8))) {
    const fingerprint = digest(secret).slice(0, 12)
    for (const value of [Buffer.from(secret), Buffer.from(secret, 'utf16le')]) patterns.push({ kind: 'configured-secret', value, fingerprint })
    if (secret.length > 16) patterns.push({ kind: 'configured-secret-prefix', value: Buffer.from(secret.slice(0, 16)), fingerprint })
  }
  return patterns
}

export function createContentScanner(patterns) {
  const hash = createHash('sha256'), hits = new Map()
  const overlap = Math.max(...patterns.map(pattern => pattern.value.length), 1) - 1
  let tail = Buffer.alloc(0), bytes = 0
  return {
    write(chunk) {
      hash.update(chunk); bytes += chunk.length
      const window = tail.length ? Buffer.concat([tail, chunk]) : chunk
      for (const pattern of patterns) if (window.includes(pattern.value)) hits.set(`${pattern.kind}:${pattern.fingerprint}`, { kind: pattern.kind, fingerprint: pattern.fingerprint })
      tail = overlap ? Buffer.from(window.subarray(Math.max(0, window.length - overlap))) : Buffer.alloc(0)
    },
    finish() { return { bytes, sha256: hash.digest('hex'), matches: [...hits.values()] } },
  }
}

export async function loadSecretPatterns({ env = process.env, home = os.homedir() } = {}) {
  const secrets = [env.OPENCODE_API_KEY]
  const files = [...new Set([
    env.VISLEXICON_JEV_CONFIG,
    env.EASY_WORKFLOW_DECISION_MODEL_CONFIG,
    path.join(home, '.pi/agent/easy-workflow/decision-model.json'),
    env.VISLEXICON_OPENCODE_AUTH || path.join(home, '.local/share/opencode/auth.json'),
  ].filter(Boolean))]
  let configuredFiles = 0
  const collect = value => {
    if (!value || typeof value !== 'object') return
    for (const [name, child] of Object.entries(value)) {
      if (/^(apiKey|api_key|key|token|access_token|refresh_token|secret)$/i.test(name) && typeof child === 'string') secrets.push(child)
      else if (child && typeof child === 'object') collect(child)
    }
  }
  for (const filename of files) {
    let raw
    try { raw = await fs.readFile(filename, 'utf8') } catch (error) { if (error.code === 'ENOENT') continue; throw Error('SECRET_CONFIG_UNREADABLE') }
    try { collect(JSON.parse(raw.replace(/^\uFEFF/, ''))); configuredFiles++ } catch { throw Error('SECRET_CONFIG_INVALID') }
  }
  return { patterns: makePatterns(secrets), configuredFiles, configuredSecrets: new Set(secrets.filter(Boolean)).size }
}

function gitProcess(repo, args) { return spawn('git', ['-C', repo, ...args], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] }) }
async function gitText(repo, args) {
  const child = gitProcess(repo, args), chunks = []
  child.stdin.end(); child.stderr.resume()
  child.stdout.on('data', chunk => chunks.push(chunk))
  await new Promise((resolve, reject) => { child.on('error', () => reject(Error('GIT_UNAVAILABLE'))); child.on('close', code => code === 0 ? resolve() : reject(Error('GIT_COMMAND_FAILED'))) })
  return Buffer.concat(chunks).toString('utf8')
}

function safeLabel(label, patterns) {
  let result = String(label)
  for (const pattern of patterns) {
    const text = pattern.value.toString('utf8')
    if (text && !text.includes('\0')) result = result.split(text).join('[redacted]')
  }
  return result.replace(/[\r\n\0]/g, '_')
}

async function scanObjects(repo, revisionSets, patterns, findings) {
  const objects = new Map()
  for (const revisions of revisionSets) {
    const listing = await gitText(repo, ['rev-list', '--objects', ...revisions, '--'])
    for (const row of listing.split('\n').filter(Boolean)) {
      const match = row.match(/^([a-f0-9]{40,64})(?: (.*))?$/)
      if (!match) throw Error('INVALID_OBJECT_LIST')
      objects.set(match[1], match[2] || '<git-object>')
    }
  }
  if (!objects.size) return 0
  const child = gitProcess(repo, ['cat-file', '--batch'])
  child.stderr.resume()
  const done = new Promise((resolve, reject) => { child.on('error', () => reject(Error('GIT_UNAVAILABLE'))); child.on('close', code => code === 0 ? resolve() : reject(Error('GIT_OBJECT_READ_FAILED'))) })
  // Send one request per consumed object; this bounds both buffers and pipe use.
  const ids = objects.keys()
  child.stdin.write(`${ids.next().value}\n`)
  let header = Buffer.alloc(0), current = null, delimiter = false, scanned = 0
  for await (const chunk of child.stdout) {
    let offset = 0
    while (offset < chunk.length) {
      if (delimiter) {
        if (chunk[offset++] !== 10) throw Error('INVALID_GIT_OBJECT_DELIMITER')
        delimiter = false
        const next = ids.next()
        if (next.done) child.stdin.end(); else child.stdin.write(`${next.value}\n`)
        continue
      }
      if (!current) {
        const newline = chunk.indexOf(10, offset)
        if (newline < 0) { header = Buffer.concat([header, chunk.subarray(offset)]); break }
        header = Buffer.concat([header, chunk.subarray(offset, newline)])
        const match = header.toString('ascii').match(/^([a-f0-9]{40,64}) (blob|tree|commit|tag) (\d+)$/)
        if (!match) throw Error('INVALID_GIT_OBJECT_HEADER')
        current = { oid: match[1], type: match[2], remaining: Number(match[3]), scanner: createContentScanner(patterns) }
        header = Buffer.alloc(0); offset = newline + 1
      }
      const count = Math.min(current.remaining, chunk.length - offset)
      current.scanner.write(chunk.subarray(offset, offset + count)); current.remaining -= count; offset += count
      if (current.remaining === 0) {
        const result = current.scanner.finish(); scanned++
        if (result.matches.length) findings.push({ source: 'git-object', oid: current.oid, type: current.type, path: safeLabel(objects.get(current.oid), patterns), ...result })
        current = null; delimiter = true
      }
    }
  }
  await done
  if (scanned !== objects.size) throw Error('GIT_OBJECT_SCAN_INCOMPLETE')
  return scanned
}

async function scanDirectory(directory, patterns, findings) {
  let count = 0
  async function visit(folder) {
    for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
      const filename = path.join(folder, entry.name)
      if (entry.isSymbolicLink()) throw Error('DIST_SYMLINK_REQUIRES_REVIEW')
      if (entry.isDirectory()) await visit(filename)
      else if (entry.isFile()) {
        const scanner = createContentScanner(patterns), handle = await fs.open(filename, 'r')
        try { for await (const chunk of handle.createReadStream()) scanner.write(chunk) } finally { await handle.close() }
        const result = scanner.finish(); count++
        if (result.matches.length) findings.push({ source: 'dist', path: safeLabel(path.relative(directory, filename), patterns), ...result })
      }
    }
  }
  await visit(directory)
  return count
}

export async function scanPush({ repo, ranges = [], updates = [], history = false, dist, patterns }) {
  const findings = [], revisionSets = []
  if (history) revisionSets.push(['--all'])
  for (const range of ranges) {
    if (!/^[^-\s][^\s]*\.\.[^\s]+$/.test(range) || range.includes('...')) throw Error('INVALID_REVISION_RANGE')
    revisionSets.push([range])
  }
  for (const update of updates) {
    if (zeroOid.test(update.localOid)) continue
    if (!/^[a-f0-9]{40,64}$/.test(update.localOid) || !/^[a-f0-9]{40,64}$/.test(update.remoteOid)) throw Error('INVALID_PUSH_REVISION')
    if (!zeroOid.test(update.remoteOid)) revisionSets.push([`${update.remoteOid}..${update.localOid}`])
    else {
      // A new branch has no remote tip. Scan its complete reachable history;
      // this also covers objects hidden by stale local remote-tracking refs.
      revisionSets.push([update.localOid])
    }
  }
  if (!revisionSets.length && !updates.length) throw Error('PUSH_RANGE_REQUIRED')
  const objects = await scanObjects(repo, revisionSets, patterns, findings)
  let historyPatch = null
  if (history) {
    const child = gitProcess(repo, ['log', '--all', '-p', '--binary', '--no-ext-diff', '--format=commit %H'])
    child.stdin.end(); child.stderr.resume()
    const done = new Promise((resolve, reject) => { child.on('error', () => reject(Error('GIT_UNAVAILABLE'))); child.on('close', code => code === 0 ? resolve() : reject(Error('HISTORY_SCAN_FAILED'))) })
    const scanner = createContentScanner(patterns)
    for await (const chunk of child.stdout) scanner.write(chunk)
    await done; historyPatch = scanner.finish()
    if (historyPatch.matches.length) findings.push({ source: 'history-patch', path: '<history-patch>', ...historyPatch })
  }
  const distFiles = dist ? await scanDirectory(dist, patterns, findings) : 0
  return { passed: findings.length === 0, objects, distFiles, historyPatch: historyPatch ? { bytes: historyPatch.bytes, sha256: historyPatch.sha256 } : null, findings }
}

async function main() {
  const args = process.argv.slice(2), values = name => args.flatMap((arg, index) => arg === name ? [args[index + 1]] : [])
  const repo = values('--repo')[0] || process.cwd()
  const { patterns, configuredFiles, configuredSecrets } = await loadSecretPatterns()
  const updates = []
  if (args.includes('--pre-push')) {
    let stdin = ''; for await (const chunk of process.stdin) stdin += chunk
    for (const line of stdin.trim().split('\n').filter(Boolean)) { const fields = line.trim().split(/\s+/); if (fields.length !== 4) throw Error('INVALID_PUSH_INPUT'); updates.push({ localOid: fields[1], remoteOid: fields[3] }) }
    if (!updates.length) { console.log(JSON.stringify({ passed: true, objects: 0, distFiles: 0, reason: 'no-ref-updates' })); return }
  }
  const result = await scanPush({ repo, patterns, ranges: values('--range'), updates, remote: values('--remote')[0], history: args.includes('--history'), dist: args.includes('--skip-dist') ? null : values('--dist')[0] || fileURLToPath(new URL('../dist/', import.meta.url)) })
  console.log(JSON.stringify({ ...result, configuredFiles, configuredSecrets }, null, 2))
  if (!result.passed) process.exitCode = 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(JSON.stringify({ passed: false, error: /^[A-Z_]+$/.test(error.message) ? error.message : 'SECRET_SCAN_FAILED' })); process.exitCode = 1 })
