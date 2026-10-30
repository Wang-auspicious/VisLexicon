import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import net from 'node:net'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'

import { FREE_MODEL, JEV_ENDPOINT, record, failure, systemOnePayload, readResponse, validateResponse } from './jev-protocol.mjs'
export { FREE_MODEL, JEV_ENDPOINT, JEV_LIMITS, systemOnePayload } from './jev-protocol.mjs'


function validateConfig(raw) {
  if (!record(raw)) throw failure('JEV_CONFIG_INVALID')
  let url
  try { url = new URL(raw.baseUrl) } catch { throw failure('JEV_CONFIG_INVALID') }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
    typeof raw.model !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._/-]{0,95}$/.test(raw.model) ||
    typeof raw.apiKey !== 'string' || !raw.apiKey.trim() || raw.apiKey.length > 8192 || /[\r\n\0]/.test(raw.apiKey) || raw.model.includes(raw.apiKey)) throw failure('JEV_CONFIG_INVALID')
  for (const [key, min, max] of [['maxConcurrent', 1, 4], ['maxQueued', 0, 16], ['timeoutMs', 1, 60000], ['queueTimeoutMs', 1, 20000]]) {
    if (raw[key] !== undefined && (!Number.isSafeInteger(raw[key]) || raw[key] < min || raw[key] > max)) throw failure('JEV_CONFIG_INVALID')
  }
  if (raw.ssh && (url.hostname !== '127.0.0.1' || Number(url.port) !== raw.ssh.localPort ||
    !/^[A-Za-z0-9_.-]+$/.test(raw.ssh.host) || !/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(raw.ssh.user) ||
    [raw.ssh.localPort, raw.ssh.remotePort, raw.ssh.port ?? 22].some(port => !Number.isInteger(port) || port < 1 || port > 65535))) throw failure('JEV_CONFIG_INVALID')
  return { ...raw, baseUrl: url.origin, ssh: raw.ssh ? { ...raw.ssh } : undefined }
}

export function withLoopbackNoProxy(env = process.env) {
  const values = new Set(`${env.NO_PROXY || ''},${env.no_proxy || ''},127.0.0.1,localhost,::1,[::1]`.split(',').map(value => value.trim()).filter(Boolean))
  return { ...env, NODE_USE_ENV_PROXY: '1', NO_PROXY: [...values].join(','), no_proxy: [...values].join(',') }
}

export async function localCredential({ env = process.env, home = os.homedir(), readFile = fs.readFile } = {}) {
  if (env.OPENCODE_API_KEY) return env.OPENCODE_API_KEY
  try {
    const auth = JSON.parse((await readFile(env.VISLEXICON_OPENCODE_AUTH || path.join(home, '.local/share/opencode/auth.json'), 'utf8')).replace(/^\uFEFF/, ''))
    const key = auth['opencode-go']?.key || auth.opencode?.key
    if (typeof key === 'string' && key) return key
  } catch { /* Auth paths and file contents never reach the response or logs. */ }
  throw failure('LOCAL_CREDENTIAL_UNAVAILABLE')
}

export async function resolveJevConfig({ env = process.env, home = os.homedir(), readFile = fs.readFile } = {}) {
  const filename = env.VISLEXICON_JEV_CONFIG || env.EASY_WORKFLOW_DECISION_MODEL_CONFIG || path.join(home, '.pi/agent/easy-workflow/decision-model.json')
  let content
  try { content = await readFile(filename, 'utf8') } catch (error) {
    if (error.code !== 'ENOENT' || env.VISLEXICON_JEV_CONFIG || env.EASY_WORKFLOW_DECISION_MODEL_CONFIG) throw failure('JEV_CONFIG_UNAVAILABLE')
  }
  if (content !== undefined) {
    let raw
    try { raw = JSON.parse(content.replace(/^\uFEFF/, '')) } catch { throw failure('JEV_CONFIG_INVALID') }
    if (raw.enabled === false) throw failure('JEV_DISABLED')
    // H2's hosted form names the opencode free model and keeps the self-hosted
    // Kev settings under selfHosted. The credential comes from the local auth file.
    if (raw.provider === 'opencode' && raw.baseUrl === undefined) {
      if (raw.model !== FREE_MODEL) throw failure('JEV_CONFIG_INVALID')
      const limits = Object.fromEntries(['maxConcurrent', 'maxQueued', 'timeoutMs', 'queueTimeoutMs'].filter(key => raw[key] !== undefined).map(key => [key, raw[key]]))
      return { ...validateConfig({ baseUrl: 'https://opencode.ai', model: FREE_MODEL, apiKey: await localCredential({ env, home, readFile }), timeoutMs: 18000, ...limits }), provider: 'opencode' }
    }
    // projects[] controls H2's automatic factory dispatch. VisLexicon consumes
    // the configured endpoint explicitly, without changing that local allowlist.
    return { ...validateConfig(raw), provider: 'kev' }
  }
  return { provider: 'opencode', model: FREE_MODEL, baseUrl: 'https://opencode.ai', apiKey: await localCredential({ env, home, readFile }), maxConcurrent: 4, maxQueued: 16, timeoutMs: 18000, queueTimeoutMs: 20000 }
}

class Admission {
  active = 0
  waiting = []
  constructor(limit, maxQueued) { this.limit = limit; this.maxQueued = maxQueued }
  async acquire(signal, timeoutMs) {
    signal.throwIfAborted()
    if (this.active < this.limit) { this.active++; return this.release() }
    if (this.waiting.length >= this.maxQueued) throw failure('MODEL_BUSY')
    return new Promise((resolve, reject) => {
      const remove = () => { const index = this.waiting.indexOf(start); if (index >= 0) this.waiting.splice(index, 1); clearTimeout(timer); signal.removeEventListener('abort', abort) }
      const abort = () => { remove(); reject(signal.reason) }
      const start = () => { remove(); this.active++; resolve(this.release()) }
      const timer = setTimeout(() => { remove(); reject(failure('JEV_QUEUE_TIMEOUT')) }, timeoutMs)
      this.waiting.push(start)
      signal.addEventListener('abort', abort, { once: true })
      if (signal.aborted) abort()
    })
  }
  release() {
    let released = false
    return () => { if (released) return; released = true; this.active--; if (this.active < this.limit) this.waiting[0]?.() }
  }
}

export function listening(port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: '127.0.0.1', port })
    let done = false
    const finish = value => { if (done) return; done = true; socket.destroy(); resolve(value) }
    socket.setTimeout(500)
    socket.once('connect', () => finish(true)); socket.once('error', () => finish(false)); socket.once('timeout', () => finish(false))
  })
}
const tunnels = new Map()
function cancellable(promise, signal) {
  signal.throwIfAborted()
  return new Promise((resolve, reject) => {
    const abort = () => { signal.removeEventListener('abort', abort); reject(signal.reason) }
    signal.addEventListener('abort', abort, { once: true })
    promise.then(value => { signal.removeEventListener('abort', abort); if (signal.aborted) reject(signal.reason); else resolve(value) }, error => { signal.removeEventListener('abort', abort); reject(error) })
    if (signal.aborted) abort()
  })
}
export async function ensureJevTransport(config, signal) {
  signal.throwIfAborted()
  if (!config.ssh) return true
  const ssh = config.ssh
  const key = `${ssh.user}@${ssh.host}:${ssh.port ?? 22}/${ssh.localPort}/${ssh.remotePort}`
  const tunnel = tunnels.get(key) || {}; tunnels.set(key, tunnel)
  if (!tunnel.opening) tunnel.opening = (async () => {
    if (await listening(ssh.localPort)) return true
    if (tunnel.child && tunnel.child.exitCode === null) tunnel.child.kill()
    const child = spawn('ssh', ['-N', '-p', String(ssh.port ?? 22), '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes',
      '-o', 'ExitOnForwardFailure=yes', '-o', 'ConnectTimeout=10', '-o', 'ServerAliveInterval=30', '-o', 'ServerAliveCountMax=3',
      '-L', `127.0.0.1:${ssh.localPort}:127.0.0.1:${ssh.remotePort}`, `${ssh.user}@${ssh.host}`], { stdio: 'ignore', windowsHide: true })
    tunnel.child = child; child.on('error', () => {}); child.unref()
    child.once('exit', () => { if (tunnel.child === child) tunnel.child = undefined })
    for (let attempt = 0; attempt < 40; attempt++) {
      if (await listening(ssh.localPort)) return true
      if (child.exitCode !== null || !child.pid) return false
      await new Promise(resolve => setTimeout(resolve, 250))
    }
    child.kill(); return false
  })().finally(() => { tunnel.opening = undefined })
  // Another request can still be using the shared SSH connection after abort.
  return cancellable(tunnel.opening, signal)
}


export function createJevProvider(raw, { fetchImpl = fetch, transport = ensureJevTransport, probe = listening } = {}) {
  const config = validateConfig(raw)
  config.provider = raw.provider || 'kev'
  if (!['kev', 'opencode'].includes(config.provider) || (config.provider === 'opencode' && config.model !== FREE_MODEL)) throw failure('JEV_CONFIG_INVALID')
  const quota = new Admission(config.maxConcurrent ?? 4, config.maxQueued ?? 16)
  const endpoint = config.provider === 'opencode' ? JEV_ENDPOINT : `${config.baseUrl}/v1/systemone`
  return {
    provider: config.provider,
    model: config.model,
    payload: request => systemOnePayload(request, config.model, config.provider),
    async status() {
      const tunnel = config.ssh ? await probe(config.ssh.localPort) ? 'connected' : 'disconnected' : 'not-required'
      return { configured: true, provider: config.provider, model: config.model, tunnel, transport: config.ssh ? 'ssh' : 'http', active: quota.active, queued: quota.waiting.length, maxConcurrent: quota.limit, maxQueued: quota.maxQueued }
    },
    async decide(request, { signal = new AbortController().signal } = {}) {
      const body = systemOnePayload(request, config.model, config.provider)
      const release = await quota.acquire(signal, config.queueTimeoutMs ?? 20000)
      try {
        const bounded = AbortSignal.any([signal, AbortSignal.timeout(config.timeoutMs ?? 60000)])
        if (!await transport(config, bounded)) throw failure('JEV_TUNNEL_DISCONNECTED')
        bounded.throwIfAborted()
        const response = await fetchImpl(endpoint, { method: 'POST', signal: bounded, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` }, body })
        bounded.throwIfAborted()
        if (!response.ok) {
          if ([400, 413, 422].includes(response.status) && typeof response.text === 'function') {
            // Only a recognized error category escapes, never upstream text.
            const detail = await response.text()
            if (/max_tokens_exceeded|context_length_exceeded|request_too_large|over the [\d,]+-token limit|total question-row work exceeds [\d,]+ tokens/iu.test(detail)) throw failure('JEV_REQUEST_TOO_LARGE')
          } else await response.body?.cancel()
          throw failure(`JEV_HTTP_${response.status}`)
        }
        const rawResponse = await readResponse(response)
        bounded.throwIfAborted()
        return validateResponse(rawResponse, request, config)
      } finally { release() }
    },
  }
}

let cachedProvider
export async function getJevProvider({ key, fetchImpl } = {}) {
  // Explicit legacy credentials support existing offline harnesses; ordinary
  // application requests always select local Kev configuration first.
  if (key) return createJevProvider({ provider: 'opencode', model: FREE_MODEL, baseUrl: 'https://opencode.ai', apiKey: key, timeoutMs: 18000 }, { fetchImpl })
  const config = await resolveJevConfig()
  const digest = crypto.createHash('sha256').update(JSON.stringify(config)).digest('hex')
  if (cachedProvider?.digest !== digest) cachedProvider = { digest, client: createJevProvider(config) }
  return cachedProvider.client
}
export async function jevStatus() {
  try { return { ...await (await getJevProvider()).status(), scope: 'loopback-only' } }
  catch (error) {
    const code = ['JEV_DISABLED', 'JEV_CONFIG_INVALID', 'JEV_CONFIG_UNAVAILABLE', 'LOCAL_CREDENTIAL_UNAVAILABLE'].includes(error.message) ? error.message : 'MODEL_UNAVAILABLE'
    return { configured: false, provider: null, model: null, tunnel: 'unavailable', error: code, scope: 'loopback-only' }
  }
}
