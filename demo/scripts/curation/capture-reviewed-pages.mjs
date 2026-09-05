import { spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { constants as fsConstants } from 'node:fs'
import {
  access,
  mkdir,
  mkdtemp,
  open,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { inspectPngBuffer, readImageMetadata } from './image-metadata.mjs'

const VIEWPORT = Object.freeze({ width: 1280, height: 900 })
const CAPTURE_ROLES = Object.freeze(['identity', 'breadth', 'proof'])
const ROLE_SET = new Set(CAPTURE_ROLES)
const MIN_PNG_BYTES = 20_000
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const CDP_COMMAND_TIMEOUT_MS = 60_000

export const CDP_SCREENSHOT_OPTIONS = Object.freeze({
  format: 'png',
  fromSurface: true,
  captureBeyondViewport: false,
  optimizeForSpeed: true,
})

function capture(siteId, role, url, options = {}) {
  return Object.freeze({
    id: `${siteId}-${role}`,
    siteId,
    role,
    url,
    outputPath: `public/shots/${siteId}/v2-${role}.png`,
    viewport: VIEWPORT,
    selector: 'main',
    scrollY: 0,
    waitMs: 1_800,
    ...options,
  })
}

export const CAPTURE_MANIFEST = Object.freeze([
  capture('magic-ui', 'identity', 'https://magicui.design/', { waitMs: 2_400 }),
  capture('magic-ui', 'breadth', 'https://magicui.design/docs/components', {
    scrollY: 220,
  }),
  capture('magic-ui', 'proof', 'https://magicui.design/docs/components/glyph-matrix', {
    scrollY: 170,
    waitMs: 4_000,
  }),
  capture('origin-ui', 'identity', 'https://coss.com/ui', {
    selector: 'body',
    waitMs: 2_200,
  }),
  capture('origin-ui', 'breadth', 'https://coss.com/ui/particles', {
    selector: 'body',
    scrollY: 240,
    waitMs: 2_200,
  }),
  capture('origin-ui', 'proof', 'https://coss.com/ui/docs/components/calendar', {
    scrollY: 260,
  }),
  capture('hover-dev', 'identity', 'https://www.hover.dev/', { waitMs: 2_400 }),
  capture('hover-dev', 'breadth', 'https://www.hover.dev/components/buttons', {
    scrollY: 280,
    waitMs: 2_200,
  }),
  capture('hover-dev', 'proof', 'https://www.hover.dev/components/three-d', {
    scrollY: 0,
    waitMs: 4_000,
  }),
  capture('shadcn-ui', 'identity', 'https://ui.shadcn.com/', { waitMs: 2_200 }),
  capture('shadcn-ui', 'breadth', 'https://ui.shadcn.com/docs/components', {
    scrollY: 260,
  }),
  capture('shadcn-ui', 'proof', 'https://ui.shadcn.com/blocks', {
    scrollY: 240,
    waitMs: 2_400,
  }),
  capture('uiverse', 'identity', 'https://uiverse.io/', {
    selector: 'body',
    waitMs: 2_400,
  }),
  capture('uiverse', 'breadth', 'https://uiverse.io/elements', {
    selector: 'body',
    scrollY: 320,
    waitMs: 2_200,
  }),
  capture('uiverse', 'proof', 'https://uiverse.io/kennyotsu/fresh-lizard-20', {
    selector: 'body',
    scrollY: 240,
    waitMs: 2_200,
  }),
  capture('21st-dev', 'identity', 'https://21st.dev/', {
    selector: 'body',
    waitMs: 2_400,
  }),
  capture('21st-dev', 'breadth', 'https://21st.dev/community/components', {
    scrollY: 300,
    waitMs: 2_200,
  }),
  capture('21st-dev', 'proof', 'https://21st.dev/community/themes', {
    scrollY: 260,
    waitMs: 2_200,
  }),
])

function manifestError(detail) {
  throw new TypeError(`Invalid capture manifest: ${detail}`)
}

export function validateCaptureBatch(manifest, options = {}) {
  const requireCompleteSites = options.requireCompleteSites !== false
  if (!Array.isArray(manifest) || manifest.length === 0) {
    manifestError('expected a non-empty array')
  }

  const ids = new Set()
  const outputPaths = new Set()
  const sites = new Map()

  for (const [index, entry] of manifest.entries()) {
    if (!entry || typeof entry !== 'object') {
      manifestError(`entry ${index} must be an object`)
    }
    if (typeof entry.id !== 'string' || entry.id.trim() === '') {
      manifestError(`entry ${index} must have a non-empty id`)
    }
    const normalizedId = entry.id.toLowerCase()
    if (ids.has(normalizedId)) manifestError(`duplicate id: ${entry.id}`)
    ids.add(normalizedId)

    if (
      typeof entry.siteId !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.siteId)
    ) {
      manifestError(`entry ${entry.id} has an invalid siteId`)
    }
    if (!ROLE_SET.has(entry.role)) {
      manifestError(`entry ${entry.id} has an invalid role: ${entry.role}`)
    }

    let parsedUrl
    try {
      parsedUrl = new URL(entry.url)
    } catch {
      manifestError(`entry ${entry.id} must use a valid HTTPS URL`)
    }
    if (parsedUrl.protocol !== 'https:') {
      manifestError(`entry ${entry.id} must use HTTPS`)
    }

    if (
      entry.viewport?.width !== VIEWPORT.width ||
      entry.viewport?.height !== VIEWPORT.height
    ) {
      manifestError(`entry ${entry.id} viewport must be exactly 1280 by 900`)
    }

    const normalizedOutput = String(entry.outputPath).toLowerCase()
    if (outputPaths.has(normalizedOutput)) {
      manifestError(`duplicate output path: ${entry.outputPath}`)
    }
    outputPaths.add(normalizedOutput)
    const expectedOutput = `public/shots/${entry.siteId}/v2-${entry.role}.png`
    if (entry.outputPath !== expectedOutput) {
      manifestError(
        `entry ${entry.id} output path must be ${expectedOutput}`,
      )
    }

    if (
      entry.selector !== undefined &&
      (typeof entry.selector !== 'string' || entry.selector.trim() === '')
    ) {
      manifestError(`entry ${entry.id} selector must be a non-empty string`)
    }
    if (
      entry.scrollY !== undefined &&
      (!Number.isFinite(entry.scrollY) || entry.scrollY < 0)
    ) {
      manifestError(`entry ${entry.id} scrollY must be a non-negative number`)
    }
    if (
      entry.waitMs !== undefined &&
      (!Number.isFinite(entry.waitMs) || entry.waitMs < 0 || entry.waitMs > 30_000)
    ) {
      manifestError(`entry ${entry.id} waitMs must be between 0 and 30000`)
    }

    const siteRoles = sites.get(entry.siteId) ?? []
    siteRoles.push(entry.role)
    sites.set(entry.siteId, siteRoles)
  }

  if (requireCompleteSites) {
    for (const [siteId, roles] of sites) {
      const uniqueRoles = new Set(roles)
      if (
        roles.length !== CAPTURE_ROLES.length ||
        CAPTURE_ROLES.some((role) => !uniqueRoles.has(role))
      ) {
        manifestError(
          `site ${siteId} must have exactly identity, breadth, and proof roles`,
        )
      }
    }
  }

  return manifest
}

export function validateCaptureManifest(manifest) {
  return validateCaptureBatch(manifest, { requireCompleteSites: true })
}

export function verifyPngOutput(input, options = {}) {
  const source = options.source ?? 'capture output'
  if (!Buffer.isBuffer(input) && !(input instanceof Uint8Array)) {
    throw new TypeError(`${source} must be PNG bytes`)
  }
  const buffer = Buffer.isBuffer(input)
    ? input
    : Buffer.from(input.buffer, input.byteOffset, input.byteLength)

  if (buffer.length <= MIN_PNG_BYTES) {
    throw new TypeError(`${source} must contain more than 20000 bytes`)
  }
  const { width, height } = inspectPngBuffer(buffer, source)
  const expectedWidth = options.width ?? VIEWPORT.width
  const expectedHeight = options.height ?? VIEWPORT.height
  if (width !== expectedWidth || height !== expectedHeight) {
    throw new TypeError(
      `${source} must be exactly ${expectedWidth} by ${expectedHeight}; received ${width} by ${height}`,
    )
  }

  const payload = buffer.subarray(24)
  const sampleSize = Math.min(payload.length, 4_096)
  const uniqueBytes = new Set()
  for (let index = 0; index < sampleSize; index += 1) {
    uniqueBytes.add(payload[Math.floor((index * payload.length) / sampleSize)])
  }
  if (uniqueBytes.size < 8) {
    throw new TypeError(`${source} has an extremely uniform, low-entropy payload`)
  }

  return { width, height, bytes: buffer.length }
}

async function fileExists(filePath, fsAdapter) {
  try {
    await fsAdapter.access(filePath, fsConstants.F_OK)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

async function writeAll(handle, buffer) {
  let offset = 0
  while (offset < buffer.length) {
    const { bytesWritten } = await handle.write(
      buffer,
      offset,
      buffer.length - offset,
      offset,
    )
    if (!Number.isSafeInteger(bytesWritten) || bytesWritten <= 0) {
      throw new Error('Screenshot temp write made no forward progress')
    }
    offset += bytesWritten
  }
}

export async function writePngAtomically(targetPath, input, options = {}) {
  const buffer = Buffer.isBuffer(input)
    ? input
    : Buffer.from(input.buffer, input.byteOffset, input.byteLength)
  const expected = options.expected ?? {
    ...inspectPngBuffer(buffer, targetPath),
    bytes: buffer.length,
  }
  const expectedSha256 = createHash('sha256').update(buffer).digest('hex')
  const fsAdapter = options.fs ?? {
    access,
    mkdir,
    open,
    rename,
    rm,
  }
  const inspectTemp = options.inspectTemp ?? readImageMetadata
  const uniqueId = (options.uniqueId ?? randomUUID)()
  const targetDirectory = dirname(targetPath)
  const targetName = basename(targetPath)
  const tempPath = join(
    targetDirectory,
    `${targetName}.vislexicon-capture-${uniqueId}.tmp`,
  )
  const backupPath = join(
    targetDirectory,
    `${targetName}.vislexicon-capture-${uniqueId}.bak`,
  )
  let handle
  let backupHoldsOriginal = false

  await fsAdapter.mkdir(targetDirectory, { recursive: true })
  try {
    handle = await fsAdapter.open(tempPath, 'wx')
    await writeAll(handle, buffer)
    await handle.sync()
    await handle.close()
    handle = undefined

    const tempMetadata = await inspectTemp(tempPath)
    if (
      tempMetadata?.verification !== 'decoded' ||
      tempMetadata.width !== expected.width ||
      tempMetadata.height !== expected.height ||
      tempMetadata.bytes !== buffer.length ||
      tempMetadata.sha256 !== expectedSha256
    ) {
      throw new TypeError(`Screenshot temp verification failed for ${targetPath}`)
    }

    if (await fileExists(targetPath, fsAdapter)) {
      await fsAdapter.rename(targetPath, backupPath)
      backupHoldsOriginal = true
    }

    try {
      await fsAdapter.rename(tempPath, targetPath)
    } catch (publishError) {
      if (backupHoldsOriginal) {
        let restoreError
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            await fsAdapter.rename(backupPath, targetPath)
            backupHoldsOriginal = false
            restoreError = undefined
            break
          } catch (error) {
            restoreError = error
          }
        }
        if (restoreError) {
          throw new AggregateError(
            [publishError, restoreError],
            `Screenshot publish and restore failed for ${targetPath}`,
          )
        }
      }
      throw publishError
    }

    if (backupHoldsOriginal) {
      await fsAdapter.rm(backupPath, { force: true })
      backupHoldsOriginal = false
    }
    return tempMetadata
  } finally {
    if (handle) {
      try {
        await handle.close()
      } catch {
        // The primary write/sync/close failure remains authoritative.
      }
    }
    await fsAdapter.rm(tempPath, { force: true })
  }
}

export function normalizeBrowserUserAgent(userAgent) {
  if (typeof userAgent !== 'string' || userAgent.trim() === '') {
    throw new TypeError('Browser user agent must be a non-empty string')
  }
  return userAgent.replace(/\bHeadlessChrome\//, 'Chrome/')
}

export function createChromeLaunchArgs(profileDir) {
  if (typeof profileDir !== 'string' || profileDir.trim() === '') {
    throw new TypeError('Browser profile directory must be a non-empty path')
  }
  return [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-features=Translate,MediaRouter',
    '--disable-renderer-backgrounding',
    '--disable-sync',
    '--hide-scrollbars',
    '--metrics-recording-only',
    '--mute-audio',
    '--remote-allow-origins=*',
    '--force-device-scale-factor=1',
    '--high-dpi-support=1',
    '--window-size=1280,900',
    'about:blank',
  ]
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds))
}

async function firstExistingPath(candidates) {
  for (const candidate of candidates.filter(Boolean)) {
    try {
      await access(candidate, fsConstants.F_OK)
      return candidate
    } catch {
      // Try the next known browser installation path.
    }
  }
  return undefined
}

async function findBrowserExecutable() {
  const programFiles = process.env.ProgramFiles
  const programFilesX86 = process.env['ProgramFiles(x86)']
  const localAppData = process.env.LOCALAPPDATA

  const executable = await firstExistingPath([
    programFiles && join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    programFilesX86 &&
      join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    localAppData &&
      join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    programFiles && join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    programFilesX86 &&
      join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    localAppData &&
      join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ])

  if (!executable) {
    throw new Error('Could not find an installed Google Chrome or Microsoft Edge executable')
  }
  return executable
}

function collectProcessOutput(stream) {
  let output = ''
  stream?.setEncoding('utf8')
  stream?.on('data', (chunk) => {
    output = `${output}${chunk}`.slice(-20_000)
  })
  return () => output.trim()
}

function cdpAbortError(method) {
  const error = new Error(`Cancelled while waiting for ${method}`)
  error.name = 'AbortError'
  return error
}

export function waitForCdpEvent(
  connection,
  method,
  sessionId,
  timeoutMs,
  options = {},
) {
  const { signal } = options
  if (signal?.aborted) return Promise.reject(cdpAbortError(method))
  return new Promise((resolveEvent, rejectEvent) => {
    let settled = false
    let removeListener
    let timeout
    const settle = (error, params) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      removeListener?.()
      signal?.removeEventListener('abort', onAbort)
      if (error) rejectEvent(error)
      else resolveEvent(params)
    }
    const onAbort = () => settle(cdpAbortError(method))
    removeListener = connection.on(method, sessionId, (params) => settle(null, params))
    timeout = setTimeout(
      () => settle(new Error(`Timed out waiting for ${method}`)),
      timeoutMs,
    )
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

async function waitForDevToolsEndpoint(profileDir, child, processOutput) {
  const portFile = join(profileDir, 'DevToolsActivePort')
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Headless browser exited during startup (${child.exitCode})${
          processOutput() ? `: ${processOutput()}` : ''
        }`,
      )
    }
    try {
      const [portLine, browserPath] = (await readFile(portFile, 'utf8'))
        .trim()
        .split(/\r?\n/)
      const port = Number.parseInt(portLine, 10)
      if (Number.isSafeInteger(port) && port > 0 && browserPath?.startsWith('/')) {
        return {
          port,
          webSocketUrl: `ws://127.0.0.1:${port}${browserPath}`,
        }
      }
    } catch {
      // Chrome writes DevToolsActivePort once its CDP server is ready.
    }
    await delay(100)
  }

  throw new Error(
    `Timed out waiting for the headless browser CDP endpoint${
      processOutput() ? `: ${processOutput()}` : ''
    }`,
  )
}

class CdpConnection {
  constructor(socket) {
    this.socket = socket
    this.nextId = 1
    this.pending = new Map()
    this.listeners = new Set()

    socket.addEventListener('message', (event) => this.#handleMessage(event.data))
    socket.addEventListener('close', () => this.#handleClose())
  }

  static async connect(webSocketUrl) {
    if (typeof WebSocket !== 'function') {
      throw new Error('Node.js 22 or newer is required for native WebSocket support')
    }
    const socket = new WebSocket(webSocketUrl)
    await new Promise((resolveOpen, rejectOpen) => {
      const timeout = setTimeout(
        () => rejectOpen(new Error('Timed out connecting to the CDP WebSocket')),
        15_000,
      )
      socket.addEventListener(
        'open',
        () => {
          clearTimeout(timeout)
          resolveOpen()
        },
        { once: true },
      )
      socket.addEventListener(
        'error',
        () => {
          clearTimeout(timeout)
          rejectOpen(new Error('Could not connect to the CDP WebSocket'))
        },
        { once: true },
      )
    })
    return new CdpConnection(socket)
  }

  #handleMessage(data) {
    const message = JSON.parse(String(data))
    if (message.id !== undefined) {
      const pending = this.pending.get(message.id)
      if (!pending) return
      this.pending.delete(message.id)
      clearTimeout(pending.timeout)
      pending.abortCleanup?.()
      if (message.error) {
        pending.reject(
          new Error(`${pending.method} failed: ${message.error.message ?? 'CDP error'}`),
        )
      } else {
        pending.resolve(message.result ?? {})
      }
      return
    }

    for (const listener of this.listeners) {
      if (
        listener.method === message.method &&
        (listener.sessionId === undefined || listener.sessionId === message.sessionId)
      ) {
        listener.callback(message.params ?? {})
      }
    }
  }

  #handleClose() {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timeout)
      pending.abortCleanup?.()
      pending.reject(new Error(`CDP WebSocket closed while running ${pending.method}`))
    }
    this.pending.clear()
  }

  send(method, params = {}, sessionId, options = {}) {
    const { signal } = options
    if (signal?.aborted) return Promise.reject(cdpAbortError(method))
    const id = this.nextId
    this.nextId += 1

    return new Promise((resolveCommand, rejectCommand) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id)
        signal?.removeEventListener('abort', onAbort)
        rejectCommand(new Error(`${method} timed out after ${CDP_COMMAND_TIMEOUT_MS}ms`))
      }, CDP_COMMAND_TIMEOUT_MS)
      const onAbort = () => {
        const pending = this.pending.get(id)
        if (!pending) return
        this.pending.delete(id)
        clearTimeout(timeout)
        signal?.removeEventListener('abort', onAbort)
        rejectCommand(cdpAbortError(method))
      }
      this.pending.set(id, {
        abortCleanup: () => signal?.removeEventListener('abort', onAbort),
        method,
        resolve: resolveCommand,
        reject: rejectCommand,
        timeout,
      })
      signal?.addEventListener('abort', onAbort, { once: true })
      this.socket.send(JSON.stringify({ id, method, params, sessionId }))
    })
  }

  on(method, sessionId, callback) {
    const listener = { method, sessionId, callback }
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  waitForEvent(method, sessionId, timeoutMs, options = {}) {
    return waitForCdpEvent(this, method, sessionId, timeoutMs, options)
  }

  close() {
    if (this.socket.readyState < WebSocket.CLOSING) this.socket.close()
  }
}

export async function launchHeadlessBrowser() {
  const executable = await findBrowserExecutable()
  const profileDir = await mkdtemp(join(tmpdir(), 'vislexicon-capture-'))
  const child = spawn(
    executable,
    createChromeLaunchArgs(profileDir),
    {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  const stdout = collectProcessOutput(child.stdout)
  const stderr = collectProcessOutput(child.stderr)
  const processOutput = () => [stdout(), stderr()].filter(Boolean).join('\n')

  try {
    const endpoint = await waitForDevToolsEndpoint(profileDir, child, processOutput)
    const connection = await CdpConnection.connect(endpoint.webSocketUrl)
    const version = await connection.send('Browser.getVersion')
    const userAgent = normalizeBrowserUserAgent(version.userAgent)
    return { child, connection, executable, profileDir, userAgent, ...endpoint }
  } catch (error) {
    await cleanupFailedBrowserLaunch(child, profileDir)
    throw error
  }
}

async function evaluate(connection, sessionId, expression, awaitPromise = false) {
  const response = await connection.send(
    'Runtime.evaluate',
    {
      expression,
      awaitPromise,
      returnByValue: true,
    },
    sessionId,
  )
  if (response.exceptionDetails) {
    const detail =
      response.exceptionDetails.exception?.description ??
      response.exceptionDetails.text ??
      'unknown exception'
    throw new Error(`Page evaluation failed: ${detail}`)
  }
  return response.result?.value
}

async function waitForCondition(
  connection,
  sessionId,
  expression,
  description,
  timeoutMs = 30_000,
) {
  const deadline = Date.now() + timeoutMs
  let lastError
  while (Date.now() < deadline) {
    try {
      if (await evaluate(connection, sessionId, expression)) return
    } catch (error) {
      lastError = error
    }
    await delay(150)
  }
  throw new Error(
    `Timed out waiting for ${description}${lastError ? `: ${lastError.message}` : ''}`,
  )
}

async function waitForImages(connection, sessionId, timeoutMs = 8_000) {
  return evaluate(
    connection,
    sessionId,
    `(async () => {
      const images = Array.from(document.images).filter((image) => {
        const rect = image.getBoundingClientRect()
        return rect.bottom >= -window.innerHeight && rect.top <= window.innerHeight * 2
      })
      const pending = images.filter((image) => !image.complete)
      let timedOut = false
      await Promise.race([
        Promise.allSettled(pending.map((image) => new Promise((resolveImage) => {
          image.addEventListener('load', resolveImage, { once: true })
          image.addEventListener('error', resolveImage, { once: true })
        }))),
        new Promise((resolveTimeout) => setTimeout(() => {
          timedOut = true
          resolveTimeout()
        }, ${timeoutMs})),
      ])
      return {
        considered: images.length,
        complete: images.filter((image) => image.complete).length,
        timedOut,
      }
    })()`,
    true,
  )
}

function comparableHostname(hostname) {
  return hostname.toLowerCase().replace(/^www\./, '')
}

export function validatePageState(entry, snapshot, documentResponse) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error(`${entry.id} did not expose a valid page snapshot`)
  }
  let finalUrl
  try {
    finalUrl = new URL(snapshot.finalURL)
  } catch {
    throw new Error(`${entry.id} ended on an invalid URL: ${snapshot.finalURL}`)
  }
  const requestedUrl = new URL(entry.url)
  if (
    finalUrl.protocol !== 'https:' ||
    comparableHostname(finalUrl.hostname) !== comparableHostname(requestedUrl.hostname)
  ) {
    throw new Error(`${entry.id} redirected outside its official HTTPS host: ${snapshot.finalURL}`)
  }
  if (
    !documentResponse ||
    !Number.isFinite(documentResponse.status) ||
    documentResponse.status < 200 ||
    documentResponse.status >= 400
  ) {
    if (!documentResponse) {
      throw new Error(`${entry.id} did not expose a final HTTP document response`)
    }
    throw new Error(
      `${entry.id} returned HTTP ${documentResponse.status} at ${documentResponse.url}`,
    )
  }
  if (!snapshot.title) throw new Error(`${entry.id} has an empty document title`)
  if (
    snapshot.bodyTextLength < 120 ||
    snapshot.selectorFound !== true ||
    snapshot.selectorTextLength < 40
  ) {
    throw new Error(
      `${entry.id} did not expose enough primary content (body=${snapshot.bodyTextLength}, selector=${snapshot.selectorTextLength})`,
    )
  }
  if (
    !Number.isSafeInteger(snapshot.visibleLoadingPlaceholderCount) ||
    snapshot.visibleLoadingPlaceholderCount < 0
  ) {
    throw new Error(`${entry.id} did not expose a valid loading placeholder count`)
  }
  if (snapshot.visibleLoadingPlaceholderCount > 0) {
    throw new Error(
      `${entry.id} still exposes ${snapshot.visibleLoadingPlaceholderCount} visible loading placeholder or skeleton element(s)`,
    )
  }

  const pageText = `${snapshot.title}\n${snapshot.heading}\n${snapshot.bodyTextStart}`.toLowerCase()
  if (/\b404\b|page not found|not found|page doesn't exist|page does not exist/.test(pageText)) {
    throw new Error(`${entry.id} appears to be a missing or 404 page`)
  }
  if (
    /verify you are human|checking your browser|just a moment|access denied|sorry, you have been blocked|enable javascript and cookies|captcha challenge/.test(
      pageText,
    )
  ) {
    throw new Error(`${entry.id} is blocked by an access wall or challenge`)
  }
  return snapshot
}

export async function capturePageWithCdp(browser, entry, adapters = {}) {
  const { connection } = browser
  const evaluatePage = adapters.evaluate ?? evaluate
  const pause = adapters.pause ?? delay
  const waitForPageCondition = adapters.waitForCondition ?? waitForCondition
  const waitForPageImages = adapters.waitForImages ?? waitForImages
  const ensureDirectory = adapters.ensureDirectory ?? mkdir
  const resolveOutputPath = adapters.resolveOutputPath ?? ((captureEntry) => (
    resolve(PROJECT_ROOT, ...captureEntry.outputPath.split('/'))
  ))
  const writeOutput = adapters.writeOutput ?? writePngAtomically
  const { targetId } = await connection.send('Target.createTarget', {
    url: 'about:blank',
    background: false,
  })
  const { sessionId } = await connection.send('Target.attachToTarget', {
    targetId,
    flatten: true,
  })
  let documentResponse
  let navigationIdentity
  const documentResponses = []
  const considerDocumentResponse = (candidate) => {
    if (
      navigationIdentity &&
      candidate.frameId === navigationIdentity.frameId &&
      candidate.loaderId === navigationIdentity.loaderId
    ) {
      documentResponse = {
        status: candidate.response.status,
        url: candidate.response.url,
      }
    }
  }
  const removeNetworkListener = connection.on(
    'Network.responseReceived',
    sessionId,
    ({ frameId, loaderId, response, type }) => {
      if (type === 'Document') {
        const candidate = { frameId, loaderId, response }
        documentResponses.push(candidate)
        considerDocumentResponse(candidate)
      }
    },
  )
  let loadController
  let loadEvent
  let loadOutcome
  let navigationOutcome

  try {
    await connection.send('Page.enable', {}, sessionId)
    await connection.send('Runtime.enable', {}, sessionId)
    await connection.send('Network.enable', {}, sessionId)
    await connection.send(
      'Network.setUserAgentOverride',
      { userAgent: browser.userAgent },
      sessionId,
    )
    await connection.send(
      'Emulation.setDeviceMetricsOverride',
      {
        width: entry.viewport.width,
        height: entry.viewport.height,
        deviceScaleFactor: 1,
        mobile: false,
      },
      sessionId,
    )
    try {
      await connection.send('Emulation.setScrollbarsHidden', { hidden: true }, sessionId)
    } catch {
      // Older Chromium builds still receive the CSS scrollbar fallback below.
    }
    await connection.send('Target.activateTarget', { targetId })
    await connection.send('Page.bringToFront', {}, sessionId)
    try {
      await connection.send(
        'Emulation.setFocusEmulationEnabled',
        { enabled: true },
        sessionId,
      )
    } catch {
      // Focus emulation is advisory; active-target rendering remains the fallback.
    }

    loadController = new AbortController()
    loadEvent = connection.waitForEvent(
      'Page.loadEventFired',
      sessionId,
      45_000,
      { signal: loadController.signal },
    )
    loadOutcome = loadEvent.then(
      (value) => ({ ok: true, source: 'load', value }),
      (error) => ({ error, ok: false, source: 'load' }),
    )
    const navigationPromise = connection.send(
      'Page.navigate',
      { url: entry.url },
      sessionId,
      { signal: loadController.signal },
    )
    navigationOutcome = navigationPromise.then(
      (value) => ({ ok: true, source: 'navigation', value }),
      (error) => ({ error, ok: false, source: 'navigation' }),
    )
    const navigationState = await navigationOutcome
    if (!navigationState.ok) throw navigationState.error
    const navigation = navigationState.value
    if (navigation.errorText) {
      throw new Error(`${entry.id} navigation failed: ${navigation.errorText}`)
    }
    if (!navigation.frameId || !navigation.loaderId) {
      throw new Error(`${entry.id} navigation did not return a main frame and loader identity`)
    }
    navigationIdentity = {
      frameId: navigation.frameId,
      loaderId: navigation.loaderId,
    }
    for (const candidate of documentResponses) considerDocumentResponse(candidate)

    await waitForPageCondition(
      connection,
      sessionId,
      `location.href !== 'about:blank' && document.readyState === 'complete'`,
      'loader-bound document.readyState complete',
    )
    loadController.abort()
    await loadOutcome
    await evaluatePage(
      connection,
      sessionId,
      `(async () => {
        if (!document.fonts?.ready) return true
        await Promise.race([
          document.fonts.ready,
          new Promise((resolveFontTimeout) => setTimeout(resolveFontTimeout, 8000)),
        ])
        return true
      })()`,
      true,
    )

    const selector = entry.selector ?? 'main'
    await waitForPageCondition(
      connection,
      sessionId,
      `(() => {
        const node = document.querySelector(${JSON.stringify(selector)})
        const text = (node?.innerText ?? node?.textContent ?? '').replace(/\\s+/g, ' ').trim()
        return Boolean(node && text.length >= 40)
      })()`,
      `primary content selector ${selector}`,
    )

    await evaluatePage(
      connection,
      sessionId,
      `(() => {
        let style = document.getElementById('vislexicon-capture-style')
        if (!style) {
          style = document.createElement('style')
          style.id = 'vislexicon-capture-style'
          style.textContent = 'html { scrollbar-width: none !important; } ::-webkit-scrollbar { display: none !important; }'
          document.documentElement.append(style)
        }
        window.scrollTo({ top: ${entry.scrollY ?? 0}, left: 0, behavior: 'instant' })
        return { x: window.scrollX, y: window.scrollY }
      })()`,
    )
    await pause(250)
    await waitForPageImages(connection, sessionId)
    await pause(entry.waitMs ?? 1_800)

    const snapshot = await evaluatePage(
      connection,
      sessionId,
      `(() => {
        const primary = document.querySelector(${JSON.stringify(selector)})
        const normalize = (value) => (value ?? '').replace(/\\s+/g, ' ').trim()
        const bodyText = normalize(document.body?.innerText ?? document.body?.textContent)
        const selectorText = normalize(primary?.innerText ?? primary?.textContent)
        const visibleLoadingPlaceholderCount = Array.from(document.querySelectorAll(
          '[aria-busy="true"], [data-loading="true"], [data-state="loading"], [class*="skeleton" i]'
        )).filter((node) => {
          const rect = node.getBoundingClientRect()
          const style = getComputedStyle(node)
          return (
            rect.width * rect.height >= 400 &&
            rect.bottom >= 0 &&
            rect.top <= window.innerHeight &&
            rect.right >= 0 &&
            rect.left <= window.innerWidth &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            Number(style.opacity || 1) > 0
          )
        }).length
        return {
          finalURL: location.href,
          title: normalize(document.title),
          heading: normalize(document.querySelector('h1')?.innerText ?? document.querySelector('h1')?.textContent),
          bodyTextLength: bodyText.length,
          bodyTextStart: bodyText.slice(0, 2000),
          selectorFound: Boolean(primary),
          selectorTextLength: selectorText.length,
          visibleLoadingPlaceholderCount,
        }
      })()`,
    )
    validatePageState(entry, snapshot, documentResponse)

    await connection.send('Target.activateTarget', { targetId })
    await connection.send('Page.bringToFront', {}, sessionId)
    await pause(100)
    const screenshot = await connection.send(
      'Page.captureScreenshot',
      CDP_SCREENSHOT_OPTIONS,
      sessionId,
    )
    const buffer = Buffer.from(screenshot.data, 'base64')
    const metadata = verifyPngOutput(buffer, {
      source: entry.outputPath,
      width: entry.viewport.width,
      height: entry.viewport.height,
    })
    const absoluteOutput = resolveOutputPath(entry)
    await ensureDirectory(dirname(absoluteOutput), { recursive: true })
    await writeOutput(absoluteOutput, buffer, { expected: metadata })
    const capturedAt = (adapters.now ?? (() => new Date()))().toISOString()

    return {
      id: entry.id,
      outputPath: entry.outputPath,
      finalURL: snapshot.finalURL,
      title: snapshot.title,
      bodyTextLength: snapshot.bodyTextLength,
      capturedAt,
      sha256: createHash('sha256').update(buffer).digest('hex'),
      ...metadata,
    }
  } finally {
    loadController?.abort()
    await Promise.allSettled(
      [loadOutcome, navigationOutcome].filter(Boolean),
    )
    removeNetworkListener()
    try {
      await connection.send('Target.closeTarget', { targetId })
    } catch {
      // Browser shutdown or a failed renderer may already have closed the target.
    }
  }
}

async function waitForProcessExit(child, timeoutMs) {
  if (child.exitCode !== null) return true
  return new Promise((resolveExit) => {
    const timeout = setTimeout(() => {
      child.removeListener('exit', onExit)
      resolveExit(false)
    }, timeoutMs)
    function onExit() {
      clearTimeout(timeout)
      resolveExit(true)
    }
    child.once('exit', onExit)
  })
}

async function forceStopOwnProcess(child) {
  if (!child.pid || child.exitCode !== null) return
  child.kill()
  if (await waitForProcessExit(child, 5_000)) return

  if (process.platform === 'win32') {
    const taskkill = spawn(
      'taskkill.exe',
      ['/PID', String(child.pid), '/T', '/F'],
      { windowsHide: true, stdio: 'ignore' },
    )
    await waitForProcessExit(taskkill, 10_000)
    await waitForProcessExit(child, 5_000)
  }
}

export async function cleanupFailedBrowserLaunch(child, profileDir, adapters = {}) {
  const stopProcess = adapters.stopProcess ?? forceStopOwnProcess
  const removeProfile = adapters.removeProfile ?? safelyRemoveCaptureTemp
  await stopProcess(child)
  await removeProfile(profileDir)
}

function comparablePath(filePath) {
  const absolutePath = resolve(filePath)
  return process.platform === 'win32' ? absolutePath.toLowerCase() : absolutePath
}

export function isSafeCaptureTempPath(profilePath, temporaryRoot = tmpdir()) {
  if (
    typeof profilePath !== 'string' ||
    profilePath.trim() === '' ||
    typeof temporaryRoot !== 'string' ||
    temporaryRoot.trim() === ''
  ) {
    return false
  }
  const resolvedProfile = resolve(profilePath)
  const resolvedRoot = resolve(temporaryRoot)
  return (
    comparablePath(dirname(resolvedProfile)) === comparablePath(resolvedRoot) &&
    basename(resolvedProfile).startsWith('vislexicon-capture-')
  )
}

export async function safelyRemoveCaptureTemp(profileDir, adapters = {}) {
  const resolveRealPath = adapters.realpath ?? realpath
  const remove = adapters.remove ?? rm
  const reportUnsafe = adapters.reportUnsafe ?? console.error
  const temporaryRootPath = adapters.temporaryRoot ?? tmpdir()
  try {
    const temporaryRoot = await resolveRealPath(temporaryRootPath)
    const profileRealPath = await resolveRealPath(profileDir)
    if (!isSafeCaptureTempPath(profileRealPath, temporaryRoot)) {
      reportUnsafe(`Retaining browser profile because its path is unsafe: ${profileDir}`)
      return false
    }
    await remove(profileRealPath, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 250,
    })
    return true
  } catch (error) {
    reportUnsafe(
      `Retaining browser profile because safe cleanup failed: ${profileDir} (${error.message})`,
    )
    return false
  }
}

export async function stopHeadlessBrowser(browser) {
  try {
    await browser.connection.send('Browser.close')
  } catch {
    // Browser.close commonly closes the WebSocket before acknowledging the command.
  }
  browser.connection.close()
  await forceStopOwnProcess(browser.child)
  await safelyRemoveCaptureTemp(browser.profileDir)
}

export function createCaptureReviewReport(results, manifest, context = {}) {
  validateCaptureManifest(manifest)
  if (!Array.isArray(results) || results.length !== manifest.length) {
    throw new TypeError('capture report requires one result per manifest entry')
  }
  const resultById = new Map(results.map((result) => [result.id, result]))
  if (resultById.size !== manifest.length) {
    throw new TypeError('capture report result ids must be unique')
  }
  const sites = []
  for (const siteId of [...new Set(manifest.map((entry) => entry.siteId))]) {
    const entries = manifest.filter((entry) => entry.siteId === siteId)
    const sourceFingerprint = context.sourceFingerprints?.[siteId]
    if (
      typeof sourceFingerprint !== 'string' ||
      !/^[a-f\d]{64}$/iu.test(sourceFingerprint)
    ) {
      throw new TypeError(`capture report requires a source fingerprint for ${siteId}`)
    }
    const pages = entries.map((entry) => {
      const result = resultById.get(entry.id)
      if (!result) throw new TypeError(`capture report is missing result ${entry.id}`)
      return {
        role: entry.role,
        inputUrl: entry.url,
        finalUrl: result.finalURL,
        capturedAt: result.capturedAt,
        timeBasis: 'capture-agent-clock',
        title: result.title,
        titleBasis: 'dom-title',
        bodyTextLength: result.bodyTextLength,
        bodyTextLengthBasis: 'capture-agent-final-report',
        src: `/${entry.outputPath.replace(/^public\//u, '')}`,
        sha256: result.sha256,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      }
    })
    const identity = pages.find(({ role }) => role === 'identity')
    const checkedAt = pages
      .map(({ capturedAt }) => capturedAt)
      .sort()
      .at(-1)
    sites.push({
      siteId,
      sourceFingerprint,
      official: {
        inputUrl: entries.find(({ role }) => role === 'identity').url,
        finalUrl: identity.finalUrl,
        checkedAt,
        checkedAtBasis: 'max-page-capture-agent-clock',
      },
      pages,
    })
  }
  return {
    schemaVersion: 1,
    reviewId: context.reviewId ?? 'pending-capture-review',
    captureAgentId: context.captureAgentId ?? 'capture-tool-v2',
    visualReviewerId: context.visualReviewerId ?? null,
    reviewMethod: context.reviewMethod ?? null,
    sourceFingerprintAlgorithm: 'sha256-json-reviewed-source-v1',
    semanticContractFingerprint: context.semanticContractFingerprint ?? null,
    sites,
  }
}

export async function writeCaptureReviewReport(reportPath, report, adapters = {}) {
  const ensureDirectory = adapters.ensureDirectory ?? mkdir
  const writeReportFile = adapters.writeFile ?? writeFile
  await ensureDirectory(dirname(reportPath), { recursive: true })
  await writeReportFile(
    reportPath,
    `${JSON.stringify(report, null, 2)}\n`,
    { encoding: 'utf8', flag: 'wx' },
  )
}

export async function runCaptures(manifest = CAPTURE_MANIFEST, options = {}) {
  validateCaptureBatch(manifest, {
    requireCompleteSites: options.allowPartial !== true,
  })
  if (options.allowPartial === true && options.reportPath) {
    throw new TypeError('partial capture retries cannot write a complete review report')
  }
  const browser = await launchHeadlessBrowser()
  const results = []
  const failures = []

  console.log(
    JSON.stringify({
      event: 'browser-started',
      executable: browser.executable,
      port: browser.port,
      profileDir: browser.profileDir,
    }),
  )
  try {
    for (const entry of manifest) {
      try {
        const result = await capturePageWithCdp(browser, entry)
        results.push(result)
        console.log(JSON.stringify(result))
      } catch (error) {
        const failure = { id: entry.id, url: entry.url, error: error.message }
        failures.push(failure)
        console.error(JSON.stringify(failure))
      }
    }
  } finally {
    await stopHeadlessBrowser(browser)
  }

  if (failures.length > 0) {
    throw new AggregateError(
      failures.map(({ error }) => new Error(error)),
      `${failures.length} of ${manifest.length} captures failed`,
    )
  }
  if (options.reportPath) {
    const report = createCaptureReviewReport(
      results,
      manifest,
      options.reportContext,
    )
    await writeCaptureReviewReport(
      options.reportPath,
      report,
      options.reportAdapters,
    )
  }
  return results
}

function isMainModule() {
  if (!process.argv[1]) return false
  return resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()
}

if (isMainModule()) {
  runCaptures().catch((error) => {
    console.error(error.stack ?? error.message)
    process.exitCode = 1
  })
}
