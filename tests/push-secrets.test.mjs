import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { makePatterns, createContentScanner, scanPush, loadSecretPatterns } from '../scripts/check-push-secrets.mjs'

const fakeKey = ['fixture', 'credential', '1234567890abcdef'].join('-')
const privateNetwork = ['10', '50', ''].join('.')
const privateAccount = ['mir', 'ukj'].join('')
const git = (repo, ...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }).trim()

test('stream scan catches split prefixes and binary UTF-16 secrets without returning content', () => {
  assert.throws(() => makePatterns(['short']), /SECRET_CONFIG_KEY_TOO_SHORT/)
  const scanner = createContentScanner(makePatterns([fakeKey]))
  scanner.write(Buffer.from(`safe ${fakeKey.slice(0, 7)}`))
  scanner.write(Buffer.from(fakeKey.slice(7)))
  scanner.write(Buffer.from([0, 255, 0]))
  scanner.write(Buffer.from(fakeKey, 'utf16le'))
  const result = scanner.finish()
  assert.ok(result.matches.some(row => row.kind === 'configured-secret'))
  assert.ok(result.matches.some(row => row.kind === 'configured-secret-prefix'))
  assert.match(result.sha256, /^[a-f0-9]{64}$/)
  assert.ok(!JSON.stringify(result).includes(fakeKey))
})

test('scan reads both config overrides and nested optional provider credentials', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'vl-config-scan-'))
  t.after(() => fs.rm(directory, { recursive: true, force: true }))
  const first = path.join(directory, 'first.json'), second = path.join(directory, 'second.json'), auth = path.join(directory, 'auth.json')
  await fs.writeFile(first, JSON.stringify({ apiKey: fakeKey }))
  await fs.writeFile(second, JSON.stringify({ apiKey: `${fakeKey}-second` }))
  await fs.writeFile(auth, JSON.stringify({ provider: { key: `${fakeKey}-nested` } }))
  const result = await loadSecretPatterns({ home: directory, env: { VISLEXICON_JEV_CONFIG: first, EASY_WORKFLOW_DECISION_MODEL_CONFIG: second, VISLEXICON_OPENCODE_AUTH: auth } })
  assert.equal(result.configuredFiles, 3)
  assert.equal(result.configuredSecrets, 3)
})

test('outgoing objects include removed secrets, dist binary chunks and safe path reporting', async t => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'vl-push-scan-'))
  t.after(() => fs.rm(repo, { recursive: true, force: true }))
  git(repo, 'init', '--quiet')
  git(repo, 'config', 'user.name', 'Fixture')
  git(repo, 'config', 'user.email', 'fixture@example.invalid')
  await fs.writeFile(path.join(repo, 'safe.txt'), 'safe')
  git(repo, 'add', '.'); git(repo, 'commit', '--quiet', '-m', 'base')
  const base = git(repo, 'rev-parse', 'HEAD')
  await fs.writeFile(path.join(repo, 'payload.bin'), Buffer.concat([Buffer.from([0, 255]), Buffer.from(fakeKey)]))
  await fs.writeFile(path.join(repo, `${privateAccount}.txt`), privateNetwork)
  git(repo, 'add', '.'); git(repo, 'commit', '--quiet', '-m', 'introduced fixture')
  await fs.unlink(path.join(repo, 'payload.bin')); await fs.unlink(path.join(repo, `${privateAccount}.txt`))
  git(repo, 'add', '-A'); git(repo, 'commit', '--quiet', '-m', 'removed fixture')
  const dist = path.join(repo, 'dist'); await fs.mkdir(dist)
  await fs.writeFile(path.join(dist, 'bundle.wasm'), Buffer.concat([Buffer.alloc(262143), Buffer.from(fakeKey)]))
  const patterns = makePatterns([fakeKey])
  const result = await scanPush({ repo, ranges: [`${base}..HEAD`], dist, patterns })
  assert.equal(result.passed, false)
  assert.ok(result.findings.some(row => row.source === 'git-object' && row.type === 'blob' && row.matches.some(match => match.kind === 'configured-secret')))
  assert.ok(result.findings.some(row => row.source === 'dist'))
  assert.ok(result.findings.some(row => row.path.includes('[redacted]')))
  assert.ok(!JSON.stringify(result).includes(fakeKey))
  assert.ok(!JSON.stringify(result).includes(privateAccount))
  assert.ok(!JSON.stringify(result).includes(privateNetwork))
  const history = await scanPush({ repo, history: true, patterns })
  assert.ok(history.historyPatch.bytes > 0)
  assert.ok(history.findings.some(row => row.source === 'history-patch'))
  const clean = await scanPush({ repo, ranges: ['HEAD..HEAD'], patterns })
  assert.equal(clean.passed, true)
  assert.equal(clean.objects, 0)
})
