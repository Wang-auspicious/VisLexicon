import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { dirname, join, parse, resolve } from 'node:path'
import { test } from 'node:test'
import { deflateSync } from 'node:zlib'

import {
  CAPTURE_MANIFEST,
  CDP_SCREENSHOT_OPTIONS,
  normalizeBrowserUserAgent,
  validateCaptureBatch,
  validateCaptureManifest,
  verifyPngOutput,
} from '../scripts/curation/capture-reviewed-pages.mjs'

const ROLES = ['identity', 'breadth', 'proof']

function validManifest(siteId = 'example-ui') {
  return ROLES.map((role) => ({
    id: `${siteId}-${role}`,
    siteId,
    role,
    url: `https://example.com/${role}`,
    outputPath: `public/shots/${siteId}/v2-${role}.png`,
    viewport: { width: 1280, height: 900 },
  }))
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const chunk = Buffer.alloc(12 + data.length)
  chunk.writeUInt32BE(data.length, 0)
  chunk.write(type, 4, 'ascii')
  data.copy(chunk, 8)
  chunk.writeUInt32BE(crc32(chunk.subarray(4, 8 + data.length)), 8 + data.length)
  return chunk
}

const syntheticPngCache = new Map()

function syntheticPng(width = 1280, height = 900, mode = 'random') {
  const cacheKey = `${width}:${height}:${mode}`
  const cached = syntheticPngCache.get(cacheKey)
  if (cached) return Buffer.from(cached)

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr.set([8, 0, 0, 0, 0], 8)
  const rowBytes = width + 1
  const scanlines = Buffer.alloc(rowBytes * height)
  let state = 0x9e3779b9
  for (let row = 0; row < height; row += 1) {
    const rowOffset = row * rowBytes
    scanlines[rowOffset] = 0
    if (mode !== 'random') continue
    for (let column = 1; column < rowBytes; column += 1) {
      state ^= state << 13
      state ^= state >>> 17
      state ^= state << 5
      scanlines[rowOffset + column] = state & 0xff
    }
  }
  const level = mode === 'uniform-stored' ? 0 : mode === 'random' ? 1 : 9
  const idat = deflateSync(scanlines, { level })
  const png = Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
  syntheticPngCache.set(cacheKey, png)
  return Buffer.from(png)
}

function healthyPageSnapshot(overrides = {}) {
  return {
    finalURL: 'https://example.com/identity',
    title: 'Example UI library',
    heading: 'Reusable interface components',
    bodyTextLength: 480,
    bodyTextStart: 'A substantial catalog of reusable interface components and documentation.',
    selectorFound: true,
    selectorTextLength: 180,
    visibleLoadingPlaceholderCount: 0,
    ...overrides,
  }
}

async function fakeCapture(capturePageWithCdp, png, options = {}) {
  const entry = {
    ...validManifest()[0],
    selector: 'main',
    scrollY: 0,
    waitMs: 0,
  }
  const calls = []
  const writes = []
  let networkListener
  const connection = {
    on(method, sessionId, listener) {
      if (method === 'Network.responseReceived') networkListener = listener
      return () => {}
    },
    waitForEvent() {
      if (options.loadEventError) return Promise.reject(options.loadEventError)
      return Promise.resolve({})
    },
    async send(method, params = {}, sessionId) {
      calls.push({ method, params, sessionId })
      if (method === 'Target.createTarget') return { targetId: 'target-1' }
      if (method === 'Target.attachToTarget') return { sessionId: 'session-1' }
      if (method === 'Page.navigate') {
        if (options.navigateError) throw options.navigateError
        for (const event of options.documentEvents ?? [{
          frameId: 'main-frame',
          loaderId: 'main-loader',
          response: { status: 200, url: entry.url },
          type: 'Document',
        }]) {
          networkListener?.(event)
        }
        return options.navigation ?? {
          frameId: 'main-frame',
          loaderId: 'main-loader',
        }
      }
      if (method === 'Page.captureScreenshot') {
        return { data: png.toString('base64') }
      }
      return {}
    },
  }
  const snapshot = healthyPageSnapshot()
  const result = await capturePageWithCdp(
    { connection, userAgent: 'Mozilla/5.0 Chrome/152.0 Safari/537.36' },
    entry,
    {
      evaluate: async (_connection, _sessionId, expression) => (
        expression.includes('finalURL:') ? snapshot : true
      ),
      pause: async () => {},
      waitForCondition: async () => {},
      waitForImages: async () => {},
      ensureDirectory: async () => {},
      resolveOutputPath: () => join(tmpdir(), 'not-written', 'capture.png'),
      writeOutput: async (outputPath, bytes) => {
        writes.push({ outputPath, bytes })
      },
    },
  )
  return { calls, entry, result, writes }
}

test('accepts one complete three-role capture set', () => {
  const manifest = validManifest()

  assert.equal(validateCaptureManifest(manifest), manifest)
})

test('retry batches may contain only missing roles while review manifests remain complete', () => {
  const missingRole = [validManifest()[2]]

  assert.equal(validateCaptureBatch(missingRole, { requireCompleteSites: false }), missingRole)
  assert.throws(() => validateCaptureManifest(missingRole), /exactly identity, breadth, and proof/iu)
})

test('ships the reviewed 18-page v2 capture manifest', () => {
  assert.equal(CAPTURE_MANIFEST.length, 18)
  assert.deepEqual(
    CAPTURE_MANIFEST.map(({ url }) => url),
    [
      'https://magicui.design/',
      'https://magicui.design/docs/components',
      'https://magicui.design/docs/components/glyph-matrix',
      'https://coss.com/ui',
      'https://coss.com/ui/particles',
      'https://coss.com/ui/docs/components/calendar',
      'https://www.hover.dev/',
      'https://www.hover.dev/components/buttons',
      'https://www.hover.dev/components/three-d',
      'https://ui.shadcn.com/',
      'https://ui.shadcn.com/docs/components',
      'https://ui.shadcn.com/blocks',
      'https://uiverse.io/',
      'https://uiverse.io/elements',
      'https://uiverse.io/kennyotsu/fresh-lizard-20',
      'https://21st.dev/',
      'https://21st.dev/community/components',
      'https://21st.dev/community/themes',
    ],
  )
  assert.deepEqual(
    CAPTURE_MANIFEST.map(({ outputPath }) => outputPath),
    [
      'public/shots/magic-ui/v2-identity.png',
      'public/shots/magic-ui/v2-breadth.png',
      'public/shots/magic-ui/v2-proof.png',
      'public/shots/origin-ui/v2-identity.png',
      'public/shots/origin-ui/v2-breadth.png',
      'public/shots/origin-ui/v2-proof.png',
      'public/shots/hover-dev/v2-identity.png',
      'public/shots/hover-dev/v2-breadth.png',
      'public/shots/hover-dev/v2-proof.png',
      'public/shots/shadcn-ui/v2-identity.png',
      'public/shots/shadcn-ui/v2-breadth.png',
      'public/shots/shadcn-ui/v2-proof.png',
      'public/shots/uiverse/v2-identity.png',
      'public/shots/uiverse/v2-breadth.png',
      'public/shots/uiverse/v2-proof.png',
      'public/shots/21st-dev/v2-identity.png',
      'public/shots/21st-dev/v2-breadth.png',
      'public/shots/21st-dev/v2-proof.png',
    ],
  )
  assert.equal(validateCaptureManifest(CAPTURE_MANIFEST), CAPTURE_MANIFEST)
})

test('uses observed body roots where the reviewed sites do not expose main', () => {
  const selectors = Object.fromEntries(
    CAPTURE_MANIFEST.map(({ id, selector }) => [id, selector]),
  )

  assert.equal(selectors['origin-ui-identity'], 'body')
  assert.equal(selectors['origin-ui-breadth'], 'body')
  assert.equal(selectors['uiverse-identity'], 'body')
  assert.equal(selectors['uiverse-breadth'], 'body')
  assert.equal(selectors['uiverse-proof'], 'body')
  assert.equal(selectors['21st-dev-identity'], 'body')
})

test('defines native CDP screenshot options for the active viewport surface', () => {
  assert.deepEqual(CDP_SCREENSHOT_OPTIONS, {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
    optimizeForSpeed: true,
  })
})

test('normalizes only the headless marker in the browser reported user agent', () => {
  assert.equal(
    normalizeBrowserUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HeadlessChrome/152.0.7977.65 Safari/537.36',
    ),
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/152.0.7977.65 Safari/537.36',
  )
  assert.equal(
    normalizeBrowserUserAgent('Mozilla/5.0 Chrome/152.0.7977.65 Safari/537.36'),
    'Mozilla/5.0 Chrome/152.0.7977.65 Safari/537.36',
  )
})

test('rejects duplicate capture ids', () => {
  const manifest = validManifest()
  manifest[1].id = manifest[0].id

  assert.throws(() => validateCaptureManifest(manifest), /duplicate id/i)
})

test('rejects duplicate output paths', () => {
  const manifest = validManifest()
  manifest[1].outputPath = manifest[0].outputPath

  assert.throws(() => validateCaptureManifest(manifest), /duplicate output path/i)
})

test('rejects non-HTTPS capture URLs', () => {
  const manifest = validManifest()
  manifest[0].url = 'http://example.com/'

  assert.throws(() => validateCaptureManifest(manifest), /https/i)
})

test('rejects viewports other than 1280 by 900', () => {
  const manifest = validManifest()
  manifest[0].viewport = { width: 1265, height: 889 }

  assert.throws(() => validateCaptureManifest(manifest), /1280.*900/i)
})

test('rejects output paths outside the site v2 screenshot directory', () => {
  const manifest = validManifest()
  manifest[0].outputPath = 'public/shots/another-site/v2-identity.png'

  assert.throws(() => validateCaptureManifest(manifest), /output path/i)
})

test('rejects traversal in output paths', () => {
  const manifest = validManifest()
  manifest[0].outputPath = 'public/shots/example-ui/../../outside/v2-identity.png'

  assert.throws(() => validateCaptureManifest(manifest), /output path/i)
})

test('rejects capture roles outside identity, breadth, and proof', () => {
  const manifest = validManifest()
  manifest[0].role = 'detail'

  assert.throws(() => validateCaptureManifest(manifest), /role/i)
})

test('requires exactly one identity, breadth, and proof capture per site', () => {
  const manifest = validManifest()
  manifest.pop()

  assert.throws(() => validateCaptureManifest(manifest), /exactly.*identity.*breadth.*proof/i)
})

test('reads exact PNG IHDR dimensions and byte count', () => {
  const png = syntheticPng()
  assert.deepEqual(verifyPngOutput(png), {
    width: 1280,
    height: 900,
    bytes: png.length,
  })
})

test('rejects PNG output with the wrong viewport dimensions', () => {
  assert.throws(
    () => verifyPngOutput(syntheticPng(1265, 889)),
    /1280.*900/i,
  )
})

test('rejects undersized PNG output even when dimensions match', () => {
  assert.throws(
    () => verifyPngOutput(syntheticPng(1280, 900, 'uniform-compressed')),
    /more than 20000 bytes/i,
  )
})

test('rejects PNG output with an extremely uniform payload', () => {
  const buffer = syntheticPng(1280, 900, 'uniform-stored')

  assert.throws(() => verifyPngOutput(buffer), /entropy|uniform/i)
})

test('rejects PNG output truncated after valid dimensions are readable', () => {
  const buffer = syntheticPng().subarray(0, -12)

  assert.throws(() => verifyPngOutput(buffer), /corrupt PNG|IEND/i)
})

test('rejects files without a PNG signature and IHDR header', () => {
  const buffer = syntheticPng()
  buffer.fill(0, 0, 24)

  assert.throws(() => verifyPngOutput(buffer), /PNG|IHDR/i)
})

test('page state gate rejects bad responses, soft 404s, access walls, and weak page state', async () => {
  const { validatePageState } = await import(
    '../scripts/curation/capture-reviewed-pages.mjs'
  )
  assert.equal(typeof validatePageState, 'function')
  const entry = { ...validManifest()[0], selector: 'main' }
  const response = { status: 200, url: entry.url }
  const healthy = healthyPageSnapshot()

  assert.equal(validatePageState(entry, healthy, response), healthy)
  assert.equal(
    validatePageState(entry, healthy, { ...response, status: 302 }),
    healthy,
  )

  for (const status of [199, 400, 503]) {
    assert.throws(
      () => validatePageState(entry, healthy, { ...response, status }),
      /HTTP|status/i,
    )
  }
  assert.throws(() => validatePageState(entry, healthy), /HTTP|response/i)

  for (const bodyTextStart of [
    '404 — page not found',
    'Access denied. You do not have permission to view this page.',
    'Just a moment... Checking your browser before accessing the site.',
  ]) {
    assert.throws(
      () => validatePageState(
        entry,
        healthyPageSnapshot({ bodyTextStart }),
        response,
      ),
      /404|missing|blocked|access wall|challenge/i,
    )
  }

  assert.throws(
    () => validatePageState(
      entry,
      healthyPageSnapshot({ bodyTextLength: 119 }),
      response,
    ),
    /enough primary content/i,
  )
  assert.throws(
    () => validatePageState(
      entry,
      healthyPageSnapshot({ finalURL: 'https://unrelated.example/' }),
      response,
    ),
    /official HTTPS host/i,
  )
  assert.throws(
    () => validatePageState(
      entry,
      healthyPageSnapshot({ selectorFound: false }),
      response,
    ),
    /selector|primary content/i,
  )
  assert.throws(
    () => validatePageState(
      entry,
      healthyPageSnapshot({ visibleLoadingPlaceholderCount: 3 }),
      response,
    ),
    /loading placeholder|skeleton/i,
  )
})

test('fake CDP capture configures the fixed viewport and validates the PNG before writing', async () => {
  const { capturePageWithCdp } = await import(
    '../scripts/curation/capture-reviewed-pages.mjs'
  )
  assert.equal(typeof capturePageWithCdp, 'function')
  const png = syntheticPng()
  const { calls, entry, result, writes } = await fakeCapture(capturePageWithCdp, png)
  const callsFor = (method) => calls.filter((call) => call.method === method)

  assert.deepEqual(callsFor('Page.enable'), [
    { method: 'Page.enable', params: {}, sessionId: 'session-1' },
  ])
  assert.deepEqual(callsFor('Runtime.enable'), [
    { method: 'Runtime.enable', params: {}, sessionId: 'session-1' },
  ])
  assert.deepEqual(callsFor('Emulation.setDeviceMetricsOverride'), [{
    method: 'Emulation.setDeviceMetricsOverride',
    params: {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    },
    sessionId: 'session-1',
  }])
  assert.deepEqual(callsFor('Emulation.setScrollbarsHidden'), [{
    method: 'Emulation.setScrollbarsHidden',
    params: { hidden: true },
    sessionId: 'session-1',
  }])
  assert.deepEqual(callsFor('Page.captureScreenshot'), [{
    method: 'Page.captureScreenshot',
    params: CDP_SCREENSHOT_OPTIONS,
    sessionId: 'session-1',
  }])
  assert.equal(writes.length, 1)
  assert.equal(writes[0].bytes.equals(png), true)
  assert.equal(result.width, 1280)
  assert.equal(result.height, 900)
  assert.equal(result.bytes, png.length)
  assert.equal(result.outputPath, entry.outputPath)

  await assert.rejects(
    fakeCapture(capturePageWithCdp, syntheticPng(1279, 900)),
    /1280.*900/i,
  )
})

test('capture binds HTTP evidence to the Page.navigate main frame and loader', async () => {
  const { capturePageWithCdp } = await import(
    '../scripts/curation/capture-reviewed-pages.mjs'
  )
  const png = syntheticPng()
  await assert.rejects(
    fakeCapture(capturePageWithCdp, png, {
      documentEvents: [
        {
          frameId: 'main-frame',
          loaderId: 'main-loader',
          response: { status: 404, url: 'https://example.com/identity' },
          type: 'Document',
        },
        {
          frameId: 'iframe-child',
          loaderId: 'iframe-loader',
          response: { status: 200, url: 'https://example.com/embedded' },
          type: 'Document',
        },
      ],
    }),
    /HTTP 404/iu,
  )
})

test('capture accepts loader-bound readyState and content when loadEventFired is absent', async () => {
  const { capturePageWithCdp } = await import(
    '../scripts/curation/capture-reviewed-pages.mjs'
  )
  const result = await fakeCapture(capturePageWithCdp, syntheticPng(), {
    loadEventError: new Error('Timed out waiting for Page.loadEventFired'),
  })

  assert.equal(result.result.width, 1280)
  assert.equal(result.writes.length, 1)
})

test('CDP event waits abort and failed navigation leaves no pending load waiter', async () => {
  const {
    capturePageWithCdp,
    waitForCdpEvent,
  } = await import('../scripts/curation/capture-reviewed-pages.mjs')
  assert.equal(typeof waitForCdpEvent, 'function')

  let removed = false
  const listeners = new Set()
  const eventSource = {
    on(_method, _sessionId, listener) {
      listeners.add(listener)
      return () => {
        removed = true
        listeners.delete(listener)
      }
    },
  }
  const abortController = new AbortController()
  const eventWait = waitForCdpEvent(
    eventSource,
    'Page.loadEventFired',
    'session-1',
    45_000,
    { signal: abortController.signal },
  )
  abortController.abort()
  await assert.rejects(eventWait, { name: 'AbortError' })
  assert.equal(removed, true)
  assert.equal(listeners.size, 0)

  for (const navigationFailure of [
    { thrown: new Error('transport failed') },
    { errorText: 'net::ERR_NAME_NOT_RESOLVED' },
  ]) {
    let pendingWaiters = 0
    const connection = {
      on() {
        return () => {}
      },
      waitForEvent(_method, _sessionId, _timeoutMs, waitOptions = {}) {
        pendingWaiters += 1
        return new Promise((resolveWait, rejectWait) => {
          const abort = () => {
            pendingWaiters -= 1
            const error = new Error('event wait aborted')
            error.name = 'AbortError'
            rejectWait(error)
          }
          if (waitOptions.signal?.aborted) abort()
          else waitOptions.signal?.addEventListener('abort', abort, { once: true })
        })
      },
      async send(method) {
        if (method === 'Target.createTarget') return { targetId: 'target-1' }
        if (method === 'Target.attachToTarget') return { sessionId: 'session-1' }
        if (method === 'Page.navigate') {
          if (navigationFailure.thrown) throw navigationFailure.thrown
          return { errorText: navigationFailure.errorText }
        }
        return {}
      },
    }
    await assert.rejects(
      capturePageWithCdp(
        { connection, userAgent: 'Mozilla/5.0 Chrome/152.0 Safari/537.36' },
        { ...validManifest()[0], selector: 'main' },
        {
          pause: async () => {},
          waitForCondition: async () => {},
          waitForImages: async () => {},
        },
      ),
      /transport failed|ERR_NAME_NOT_RESOLVED/iu,
    )
    await new Promise((resolveTurn) => setImmediate(resolveTurn))
    assert.equal(pendingWaiters, 0)
  }
})

test('slow navigation and a timed-out load event fail closed without pending CDP work', async () => {
  const { capturePageWithCdp } = await import(
    '../scripts/curation/capture-reviewed-pages.mjs'
  )
  let pendingEvents = 0
  let pendingCommands = 0
  let closedTargets = 0
  const unhandled = []
  const onUnhandled = (error) => unhandled.push(error)
  process.on('unhandledRejection', onUnhandled)
  const connection = {
    on() {
      return () => {}
    },
    waitForEvent(_method, _sessionId, _timeoutMs, options = {}) {
      pendingEvents += 1
      return new Promise((resolveWait, rejectWait) => {
        const timeout = setTimeout(() => {
          pendingEvents -= 1
          rejectWait(new Error('Timed out waiting for Page.loadEventFired'))
        }, 0)
        options.signal?.addEventListener('abort', () => {
          clearTimeout(timeout)
          if (pendingEvents > 0) pendingEvents -= 1
          const error = new Error('load aborted')
          error.name = 'AbortError'
          rejectWait(error)
        }, { once: true })
      })
    },
    async send(method, _params, _sessionId, options = {}) {
      if (method === 'Target.createTarget') return { targetId: 'slow-target' }
      if (method === 'Target.attachToTarget') return { sessionId: 'slow-session' }
      if (method === 'Page.navigate') {
        pendingCommands += 1
        return new Promise((resolveNavigate, rejectNavigate) => {
          const timeout = setTimeout(() => {
            pendingCommands -= 1
            resolveNavigate({ frameId: 'main-frame', loaderId: 'main-loader' })
          }, 25)
          options.signal?.addEventListener('abort', () => {
            clearTimeout(timeout)
            if (pendingCommands > 0) pendingCommands -= 1
            const error = new Error('navigate aborted')
            error.name = 'AbortError'
            rejectNavigate(error)
          }, { once: true })
        })
      }
      if (method === 'Target.closeTarget') closedTargets += 1
      return {}
    },
  }
  try {
    await assert.rejects(
      capturePageWithCdp(
        { connection, userAgent: 'Mozilla/5.0 Chrome/152.0 Safari/537.36' },
        { ...validManifest()[0], selector: 'main' },
        {
          pause: async () => {},
          waitForCondition: async () => {},
          waitForImages: async () => {},
        },
      ),
      /page snapshot/iu,
    )
    await new Promise((resolveTurn) => setImmediate(resolveTurn))
    assert.equal(pendingEvents, 0)
    assert.equal(pendingCommands, 0)
    assert.equal(closedTargets, 1)
    assert.deepEqual(unhandled, [])
  } finally {
    process.removeListener('unhandledRejection', onUnhandled)
  }
})

test('Chrome launch args isolate the remote port, profile, viewport, and hidden headless mode', async () => {
  const { createChromeLaunchArgs } = await import(
    '../scripts/curation/capture-reviewed-pages.mjs'
  )
  assert.equal(typeof createChromeLaunchArgs, 'function')
  const profileDir = join(tmpdir(), 'vislexicon-capture-launch-test')
  const args = createChromeLaunchArgs(profileDir)
  const matching = (prefix) => args.filter((argument) => argument.startsWith(prefix))

  assert.deepEqual(matching('--remote-debugging-port='), ['--remote-debugging-port=0'])
  assert.deepEqual(matching('--user-data-dir='), [`--user-data-dir=${profileDir}`])
  assert.deepEqual(matching('--window-size='), ['--window-size=1280,900'])
  assert.deepEqual(matching('--force-device-scale-factor='), [
    '--force-device-scale-factor=1',
  ])
  assert.equal(args.filter((argument) => argument === '--headless=new').length, 1)
  assert.equal(args.filter((argument) => argument === '--hide-scrollbars').length, 1)
})

test('safe temp cleanup calls its remover only for a direct prefixed child of system temp', async () => {
  const {
    isSafeCaptureTempPath,
    safelyRemoveCaptureTemp,
  } = await import('../scripts/curation/capture-reviewed-pages.mjs')
  assert.equal(typeof isSafeCaptureTempPath, 'function')
  assert.equal(typeof safelyRemoveCaptureTemp, 'function')

  const temporaryRoot = resolve(tmpdir())
  const safePath = join(temporaryRoot, 'vislexicon-capture-unit-test')
  const unsafePaths = [
    parse(temporaryRoot).root,
    dirname(temporaryRoot),
    temporaryRoot,
    join(temporaryRoot, 'other-profile'),
    join(temporaryRoot, 'nested', 'vislexicon-capture-unit-test'),
    join(dirname(temporaryRoot), 'vislexicon-capture-unit-test'),
  ]
  assert.equal(isSafeCaptureTempPath(safePath, temporaryRoot), true)
  for (const unsafePath of unsafePaths) {
    assert.equal(isSafeCaptureTempPath(unsafePath, temporaryRoot), false)
  }

  const removed = []
  const adapters = {
    realpath: async (candidate) => resolve(candidate),
    remove: async (candidate, options) => {
      removed.push({ candidate, options })
    },
    reportUnsafe: () => {},
    temporaryRoot,
  }
  for (const unsafePath of unsafePaths) {
    assert.equal(await safelyRemoveCaptureTemp(unsafePath, adapters), false)
  }
  assert.deepEqual(removed, [])

  assert.equal(await safelyRemoveCaptureTemp(safePath, adapters), true)
  assert.deepEqual(removed, [{
    candidate: resolve(safePath),
    options: {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 250,
    },
  }])
})

test('atomic screenshot writer fsyncs a sibling temp and preserves an existing target on failures', async () => {
  const { writePngAtomically } = await import(
    '../scripts/curation/capture-reviewed-pages.mjs'
  )
  assert.equal(typeof writePngAtomically, 'function')
  const targetPath = join(tmpdir(), 'capture-output', 'v2-identity.png')
  const oldBytes = Buffer.from('previous reviewed screenshot')
  const newBytes = syntheticPng()

  function harness({ failOperation, failRenameAt } = {}) {
    const files = new Map([[targetPath, Buffer.from(oldBytes)]])
    const openedPaths = []
    const renamedPaths = []
    let renameCount = 0
    let failedOperation = false
    const maybeFail = (operation) => {
      if (operation === failOperation && !failedOperation) {
        failedOperation = true
        throw new Error(`injected ${operation} failure`)
      }
    }
    const fs = {
      access: async (path) => {
        if (!files.has(path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
      },
      mkdir: async () => {},
      open: async (path, flags) => {
        assert.equal(flags, 'wx')
        assert.equal(files.has(path), false)
        openedPaths.push(path)
        files.set(path, Buffer.alloc(0))
        return {
          async write(buffer, offset, length, position) {
            maybeFail('write')
            const next = Buffer.alloc(Math.max(files.get(path).length, position + length))
            files.get(path).copy(next)
            buffer.copy(next, position, offset, offset + length)
            files.set(path, next)
            return { bytesWritten: length }
          },
          async sync() {
            maybeFail('sync')
          },
          async close() {
            maybeFail('close')
          },
        }
      },
      rename: async (from, to) => {
        renameCount += 1
        renamedPaths.push({ from, to })
        if (renameCount === failRenameAt) throw new Error(`injected rename ${renameCount}`)
        if (!files.has(from)) throw Object.assign(new Error('missing'), { code: 'ENOENT' })
        files.set(to, files.get(from))
        files.delete(from)
      },
      rm: async (path) => {
        files.delete(path)
      },
    }
    return {
      files,
      fs,
      inspectTemp: async (path) => ({
        ...verifyPngOutput(files.get(path)),
        sha256: createHash('sha256').update(files.get(path)).digest('hex'),
        verification: 'decoded',
      }),
      openedPaths,
      renamedPaths,
    }
  }

  const success = harness()
  await writePngAtomically(targetPath, newBytes, {
    fs: success.fs,
    inspectTemp: success.inspectTemp,
  })
  assert.equal(success.files.get(targetPath).equals(newBytes), true)
  assert.equal(success.files.size, 1)
  assert.equal(dirname(success.openedPaths[0]), dirname(targetPath))
  assert.match(
    success.openedPaths[0],
    /v2-identity\.png\.vislexicon-capture-[^.]+\.tmp$/u,
  )
  assert.equal(success.renamedPaths.every(({ from, to }) => (
    dirname(from) === dirname(targetPath) && dirname(to) === dirname(targetPath)
  )), true)

  for (const failOperation of ['write', 'sync', 'close']) {
    const failed = harness({ failOperation })
    await assert.rejects(
      writePngAtomically(targetPath, newBytes, {
        fs: failed.fs,
        inspectTemp: failed.inspectTemp,
      }),
      new RegExp(`injected ${failOperation} failure`, 'u'),
    )
    assert.equal(failed.files.get(targetPath).equals(oldBytes), true)
    assert.equal(failed.files.size, 1)
  }

  for (const failRenameAt of [1, 2]) {
    const failed = harness({ failRenameAt })
    await assert.rejects(
      writePngAtomically(targetPath, newBytes, {
        fs: failed.fs,
        inspectTemp: failed.inspectTemp,
      }),
      /injected rename/iu,
    )
    assert.equal(failed.files.get(targetPath).equals(oldBytes), true)
    assert.equal(failed.files.size, 1)
  }

  const wrongHash = harness()
  await assert.rejects(
    writePngAtomically(targetPath, newBytes, {
      fs: wrongHash.fs,
      inspectTemp: async (path) => ({
        ...await wrongHash.inspectTemp(path),
        sha256: '0'.repeat(64),
      }),
    }),
    /hash|sha256|verification/iu,
  )
  assert.equal(wrongHash.files.get(targetPath).equals(oldBytes), true)
})

test('future capture results can write the reviewed-capture report schema without claiming visual review', async () => {
  const {
    createCaptureReviewReport,
    writeCaptureReviewReport,
  } = await import('../scripts/curation/capture-reviewed-pages.mjs')
  assert.equal(typeof createCaptureReviewReport, 'function')
  assert.equal(typeof writeCaptureReviewReport, 'function')
  const sourceFingerprints = Object.fromEntries(
    [...new Set(CAPTURE_MANIFEST.map(({ siteId }) => siteId))]
      .map((siteId, index) => [siteId, index.toString(16).repeat(64)]),
  )
  const results = CAPTURE_MANIFEST.map((entry, index) => ({
    id: entry.id,
    finalURL: entry.url,
    title: `DOM title ${index + 1}`,
    bodyTextLength: 500 + index,
    capturedAt: `2026-09-02T00:${String(index).padStart(2, '0')}:00.000Z`,
    outputPath: entry.outputPath,
    sha256: String(index + 1).padStart(64, '0'),
    bytes: 30_000 + index,
    width: 1280,
    height: 900,
  }))
  const report = createCaptureReviewReport(results, CAPTURE_MANIFEST, {
    sourceFingerprints,
  })
  assert.equal(report.schemaVersion, 1)
  assert.equal(report.captureAgentId, 'capture-tool-v2')
  assert.equal(report.visualReviewerId, null)
  assert.equal(report.reviewMethod, null)
  assert.equal(report.sites.length, 6)
  assert.equal(report.sites.reduce((count, site) => count + site.pages.length, 0), 18)
  assert.equal(report.sites[0].pages[0].titleBasis, 'dom-title')
  assert.equal(report.sites[0].pages[0].bodyTextLengthBasis, 'capture-agent-final-report')

  const writes = []
  await writeCaptureReviewReport('C:\\fake\\review.json', report, {
    ensureDirectory: async () => {},
    writeFile: async (...args) => writes.push(args),
  })
  assert.equal(writes.length, 1)
  assert.equal(writes[0][0], 'C:\\fake\\review.json')
  assert.deepEqual(writes[0][2], { encoding: 'utf8', flag: 'wx' })
  assert.deepEqual(JSON.parse(writes[0][1]), report)
})

test('browser launch failure fully stops its own process before profile cleanup', async () => {
  const { cleanupFailedBrowserLaunch } = await import(
    '../scripts/curation/capture-reviewed-pages.mjs'
  )
  assert.equal(typeof cleanupFailedBrowserLaunch, 'function')
  const events = []
  let releaseStop
  const stopGate = new Promise((resolveStop) => {
    releaseStop = resolveStop
  })
  const cleanup = cleanupFailedBrowserLaunch(
    { pid: 1234, exitCode: null },
    join(tmpdir(), 'vislexicon-capture-launch-failure'),
    {
      removeProfile: async () => {
        events.push('remove-profile')
      },
      stopProcess: async () => {
        events.push('stop-start')
        await stopGate
        events.push('stop-complete')
      },
    },
  )
  await new Promise((resolveTurn) => setImmediate(resolveTurn))
  assert.deepEqual(events, ['stop-start'])
  releaseStop()
  await cleanup
  assert.deepEqual(events, ['stop-start', 'stop-complete', 'remove-profile'])
})
