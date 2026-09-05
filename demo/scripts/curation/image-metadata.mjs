import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { inflateSync } from 'node:zlib'

const PNG_SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex')
const JPEG_START_OF_FRAME_MARKERS = new Set([
  0xc0,
  0xc1,
  0xc2,
  0xc3,
  0xc5,
  0xc6,
  0xc7,
  0xc9,
  0xca,
  0xcb,
  0xcd,
  0xce,
  0xcf,
])
const PNG_CHANNELS_BY_COLOR_TYPE = new Map([
  [0, 1],
  [2, 3],
  [3, 1],
  [4, 2],
  [6, 4],
])
const PNG_BIT_DEPTHS_BY_COLOR_TYPE = new Map([
  [0, new Set([1, 2, 4, 8, 16])],
  [2, new Set([8, 16])],
  [3, new Set([1, 2, 4, 8])],
  [4, new Set([8, 16])],
  [6, new Set([8, 16])],
])
const ADAM7_PASSES = [
  [0, 0, 8, 8],
  [4, 0, 8, 8],
  [0, 4, 4, 8],
  [2, 0, 4, 4],
  [0, 2, 2, 4],
  [1, 0, 2, 2],
  [0, 1, 1, 2],
]
const DEFAULT_MAX_PNG_INPUT_BYTES = 64 * 1024 * 1024
const DEFAULT_MAX_PNG_IDAT_BYTES = 64 * 1024 * 1024
const DEFAULT_MAX_PNG_DECODED_BYTES = 64 * 1024 * 1024
const DEFAULT_MAX_PNG_CHUNKS = 4_096

function corrupt(format, source, detail) {
  throw new TypeError(`Corrupt ${format} image ${source}: ${detail}`)
}

function imageBuffer(input, source) {
  if (!Buffer.isBuffer(input) && !(input instanceof Uint8Array)) {
    throw new TypeError(`${source} must be image bytes`)
  }
  return Buffer.isBuffer(input)
    ? input
    : Buffer.from(input.buffer, input.byteOffset, input.byteLength)
}

function dimensions(width, height, format, source) {
  if (!Number.isSafeInteger(width) || width <= 0) {
    corrupt(format, source, 'width must be a positive integer')
  }
  if (!Number.isSafeInteger(height) || height <= 0) {
    corrupt(format, source, 'height must be a positive integer')
  }
  return { width, height }
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

function pngScanlineLayout(
  width,
  height,
  bitDepth,
  colorType,
  interlace,
  source,
  maxDecodedBytes,
) {
  const channels = PNG_CHANNELS_BY_COLOR_TYPE.get(colorType)
  const bitsPerPixel = channels * bitDepth
  const passes = interlace === 0
    ? [[0, 0, 1, 1]]
    : ADAM7_PASSES
  const rows = []
  let decodedBytes = 0
  for (const [startX, startY, stepX, stepY] of passes) {
    if (width <= startX || height <= startY) continue
    const passWidth = Math.ceil((width - startX) / stepX)
    const passHeight = Math.ceil((height - startY) / stepY)
    const scanlineBytes = Math.ceil((passWidth * bitsPerPixel) / 8)
    const passBytes = passHeight * (scanlineBytes + 1)
    if (!Number.isSafeInteger(passBytes)) {
      corrupt('PNG', source, 'decoded scanline size is unsafe')
    }
    decodedBytes += passBytes
    if (
      !Number.isSafeInteger(decodedBytes) ||
      decodedBytes > maxDecodedBytes
    ) {
      corrupt('PNG', source, 'decoded scanlines exceed the safety limit')
    }
    rows.push({ count: passHeight, scanlineBytes })
  }
  return { decodedBytes, rows }
}

function validatePngIhdr(buffer, dataOffset, source) {
  const bitDepth = buffer[dataOffset + 8]
  const colorType = buffer[dataOffset + 9]
  const compression = buffer[dataOffset + 10]
  const filter = buffer[dataOffset + 11]
  const interlace = buffer[dataOffset + 12]
  if (!PNG_BIT_DEPTHS_BY_COLOR_TYPE.get(colorType)?.has(bitDepth)) {
    corrupt('PNG', source, `invalid IHDR bit depth ${bitDepth} for color type ${colorType}`)
  }
  if (compression !== 0) corrupt('PNG', source, 'IHDR compression method must be 0')
  if (filter !== 0) corrupt('PNG', source, 'IHDR filter method must be 0')
  if (interlace !== 0 && interlace !== 1) {
    corrupt('PNG', source, 'IHDR interlace method must be 0 or 1')
  }
  return { bitDepth, colorType, interlace }
}

export function inspectPngBuffer(input, source = 'image buffer', options = {}) {
  const buffer = imageBuffer(input, source)
  const maxInputBytes = options.maxInputBytes ?? DEFAULT_MAX_PNG_INPUT_BYTES
  const maxIdatBytes = options.maxIdatBytes ?? DEFAULT_MAX_PNG_IDAT_BYTES
  const maxDecodedBytes = options.maxDecodedBytes ?? DEFAULT_MAX_PNG_DECODED_BYTES
  const maxChunkCount = options.maxChunkCount ?? DEFAULT_MAX_PNG_CHUNKS
  if (buffer.length > maxInputBytes) {
    corrupt('PNG', source, `input byte limit is ${maxInputBytes}`)
  }
  if (
    buffer.length < PNG_SIGNATURE.length ||
    !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
  ) {
    corrupt('PNG', source, 'invalid signature')
  }

  let offset = PNG_SIGNATURE.length
  let chunkIndex = 0
  let imageSize
  let ihdr
  let hasImageData = false
  let hasEnd = false
  let idatClosed = false
  let idatBytes = 0
  const idatParts = []

  while (offset < buffer.length) {
    if (chunkIndex >= maxChunkCount) {
      corrupt('PNG', source, `chunk count exceeds limit ${maxChunkCount}`)
    }
    if (offset + 12 > buffer.length) {
      corrupt('PNG', source, 'truncated chunk header or CRC')
    }
    const chunkLength = buffer.readUInt32BE(offset)
    const chunkType = buffer.toString('ascii', offset + 4, offset + 8)
    const dataOffset = offset + 8
    const dataEnd = dataOffset + chunkLength
    const chunkEnd = dataEnd + 4
    if (chunkEnd > buffer.length) {
      corrupt('PNG', source, `truncated ${chunkType || 'unknown'} chunk`)
    }
    const storedCrc = buffer.readUInt32BE(dataEnd)
    const actualCrc = crc32(buffer.subarray(offset + 4, dataEnd))
    if (storedCrc !== actualCrc) {
      corrupt('PNG', source, `${chunkType || 'unknown'} chunk CRC mismatch`)
    }

    if (chunkIndex === 0) {
      if (chunkType !== 'IHDR' || chunkLength !== 13) {
        corrupt('PNG', source, 'the first complete chunk must be IHDR with length 13')
      }
      imageSize = dimensions(
        buffer.readUInt32BE(dataOffset),
        buffer.readUInt32BE(dataOffset + 4),
        'PNG',
        source,
      )
      ihdr = validatePngIhdr(buffer, dataOffset, source)
    } else if (chunkType === 'IHDR') {
      corrupt('PNG', source, 'IHDR must appear exactly once at the start')
    }

    if (chunkType === 'IDAT') {
      if (idatClosed) corrupt('PNG', source, 'IDAT chunks must be consecutive')
      if (chunkLength > 0) {
        hasImageData = true
        idatBytes += chunkLength
        if (idatBytes > maxIdatBytes) {
          corrupt('PNG', source, `IDAT byte limit is ${maxIdatBytes}`)
        }
        idatParts.push(buffer.subarray(dataOffset, dataEnd))
      }
    } else if (hasImageData) {
      idatClosed = true
    }
    if (chunkType === 'IEND') {
      if (chunkLength !== 0) corrupt('PNG', source, 'IEND must have length 0')
      if (chunkEnd !== buffer.length) {
        corrupt('PNG', source, 'IEND must be the final complete chunk')
      }
      hasEnd = true
    }

    offset = chunkEnd
    chunkIndex += 1
  }

  if (!imageSize) corrupt('PNG', source, 'missing IHDR dimensions')
  if (!hasImageData) corrupt('PNG', source, 'missing non-empty IDAT image data')
  if (!hasEnd) corrupt('PNG', source, 'missing IEND chunk')
  const layout = pngScanlineLayout(
    imageSize.width,
    imageSize.height,
    ihdr.bitDepth,
    ihdr.colorType,
    ihdr.interlace,
    source,
    maxDecodedBytes,
  )
  let decoded
  try {
    decoded = inflateSync(Buffer.concat(idatParts), {
      maxOutputLength: layout.decodedBytes,
    })
  } catch (error) {
    corrupt('PNG', source, `IDAT inflate failed: ${error.message}`)
  }
  if (decoded.length !== layout.decodedBytes) {
    corrupt(
      'PNG',
      source,
      `inflated scanline length must be ${layout.decodedBytes}; received ${decoded.length}`,
    )
  }
  let decodedOffset = 0
  for (const { count, scanlineBytes } of layout.rows) {
    for (let row = 0; row < count; row += 1) {
      const filterType = decoded[decodedOffset]
      if (filterType < 0 || filterType > 4) {
        corrupt('PNG', source, `scanline filter byte ${filterType} must be between 0 and 4`)
      }
      decodedOffset += scanlineBytes + 1
    }
  }
  return { format: 'PNG', ...imageSize, verification: 'decoded' }
}

function inspectJpegBuffer(input, source) {
  const buffer = imageBuffer(input, source)
  if (buffer.length < 2 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    corrupt('JPEG', source, 'invalid start-of-image marker')
  }

  let offset = 2
  let imageSize
  let hasScan = false
  let imageDataBytes = 0

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      corrupt('JPEG', source, 'expected a complete segment marker')
    }
    const markerOffset = offset
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1
    if (offset >= buffer.length) corrupt('JPEG', source, 'truncated segment marker')

    const marker = buffer[offset]
    offset += 1
    if (marker === 0x00) corrupt('JPEG', source, 'unexpected stuffed byte outside scan data')
    if (marker === 0xd9) {
      if (offset !== buffer.length) {
        corrupt('JPEG', source, 'EOI must be the final marker')
      }
      if (!imageSize) corrupt('JPEG', source, 'no supported start-of-frame segment')
      if (!hasScan) corrupt('JPEG', source, 'missing SOS image scan')
      if (imageDataBytes === 0) corrupt('JPEG', source, 'SOS has no image data')
      return { format: 'JPEG', ...imageSize }
    }
    if (marker === 0xd8) corrupt('JPEG', source, 'duplicate start-of-image marker')
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
    if (offset + 2 > buffer.length) corrupt('JPEG', source, 'truncated segment length')

    const segmentLength = buffer.readUInt16BE(offset)
    const segmentEnd = offset + segmentLength
    if (segmentLength < 2 || segmentEnd > buffer.length) {
      corrupt('JPEG', source, 'invalid or truncated segment bounds')
    }

    if (JPEG_START_OF_FRAME_MARKERS.has(marker)) {
      if (segmentLength < 11) {
        corrupt('JPEG', source, 'truncated start-of-frame segment')
      }
      const componentCount = buffer[offset + 7]
      if (componentCount === 0 || segmentLength !== 8 + componentCount * 3) {
        corrupt('JPEG', source, 'invalid start-of-frame component bounds')
      }
      const nextSize = dimensions(
        buffer.readUInt16BE(offset + 5),
        buffer.readUInt16BE(offset + 3),
        'JPEG',
        source,
      )
      if (imageSize) corrupt('JPEG', source, 'multiple start-of-frame segments')
      imageSize = nextSize
    }

    if (marker !== 0xda) {
      offset = segmentEnd
      continue
    }

    const scanComponentCount = buffer[offset + 2]
    if (
      segmentLength < 8 ||
      scanComponentCount === 0 ||
      segmentLength !== 6 + scanComponentCount * 2
    ) {
      corrupt('JPEG', source, 'invalid SOS segment bounds')
    }
    hasScan = true
    offset = segmentEnd

    let foundNextMarker = false
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        imageDataBytes += 1
        offset += 1
        continue
      }

      const scanMarkerOffset = offset
      offset += 1
      while (offset < buffer.length && buffer[offset] === 0xff) offset += 1
      if (offset >= buffer.length) corrupt('JPEG', source, 'truncated scan marker')
      const scanMarker = buffer[offset]
      if (scanMarker === 0x00) {
        imageDataBytes += 1
        offset += 1
        continue
      }
      if (scanMarker >= 0xd0 && scanMarker <= 0xd7) {
        offset += 1
        continue
      }
      offset = scanMarkerOffset
      foundNextMarker = true
      break
    }
    if (!foundNextMarker) corrupt('JPEG', source, 'missing final EOI marker')

    if (offset <= markerOffset) corrupt('JPEG', source, 'invalid scan bounds')
  }

  corrupt('JPEG', source, 'missing final EOI marker')
}

function webpChunks(buffer, start, end, source, scope) {
  const chunks = []
  let offset = start
  while (offset < end) {
    if (offset + 8 > end) corrupt('WebP', source, `truncated ${scope} chunk header`)
    const type = buffer.toString('ascii', offset, offset + 4)
    const length = buffer.readUInt32LE(offset + 4)
    const dataOffset = offset + 8
    const dataEnd = dataOffset + length
    const paddedEnd = dataEnd + (length % 2)
    if (dataEnd > end || paddedEnd > end) {
      corrupt('WebP', source, `truncated ${type || scope} chunk bounds`)
    }
    chunks.push({ type, length, dataOffset, dataEnd })
    offset = paddedEnd
  }
  if (offset !== end) corrupt('WebP', source, `invalid ${scope} chunk bounds`)
  return chunks
}

function webpFrameSize(buffer, chunk, source) {
  if (chunk.type === 'VP8 ') {
    if (
      chunk.length <= 10 ||
      buffer[chunk.dataOffset + 3] !== 0x9d ||
      buffer[chunk.dataOffset + 4] !== 0x01 ||
      buffer[chunk.dataOffset + 5] !== 0x2a
    ) {
      corrupt('WebP', source, 'invalid or empty VP8 frame payload')
    }
    return dimensions(
      buffer.readUInt16LE(chunk.dataOffset + 6) & 0x3fff,
      buffer.readUInt16LE(chunk.dataOffset + 8) & 0x3fff,
      'WebP',
      source,
    )
  }
  if (chunk.type === 'VP8L') {
    if (chunk.length <= 5 || buffer[chunk.dataOffset] !== 0x2f) {
      corrupt('WebP', source, 'invalid or empty VP8L frame payload')
    }
    const first = buffer[chunk.dataOffset + 1]
    const second = buffer[chunk.dataOffset + 2]
    const third = buffer[chunk.dataOffset + 3]
    const fourth = buffer[chunk.dataOffset + 4]
    return dimensions(
      1 + first + ((second & 0x3f) << 8),
      1 + (second >> 6) + (third << 2) + ((fourth & 0x0f) << 10),
      'WebP',
      source,
    )
  }
  return null
}

function inspectWebpBuffer(input, source) {
  const buffer = imageBuffer(input, source)
  if (
    buffer.length < 12 ||
    buffer.toString('ascii', 0, 4) !== 'RIFF' ||
    buffer.toString('ascii', 8, 12) !== 'WEBP'
  ) {
    corrupt('WebP', source, 'invalid RIFF header')
  }
  const declaredLength = buffer.readUInt32LE(4) + 8
  if (declaredLength !== buffer.length) {
    corrupt('WebP', source, 'RIFF size must exactly match buffer length')
  }

  const chunks = webpChunks(buffer, 12, buffer.length, source, 'top-level')
  let canvasSize
  let extendedFlags
  let stillSize
  let hasAnimationHeader = false
  let hasAnimationFrame = false

  for (const chunk of chunks) {
    if (chunk.type === 'VP8X') {
      if (canvasSize || chunk.length !== 10) {
        corrupt('WebP', source, 'VP8X must appear once with length 10')
      }
      extendedFlags = buffer[chunk.dataOffset]
      canvasSize = dimensions(
        buffer.readUIntLE(chunk.dataOffset + 4, 3) + 1,
        buffer.readUIntLE(chunk.dataOffset + 7, 3) + 1,
        'WebP',
        source,
      )
      continue
    }

    const frameSize = webpFrameSize(buffer, chunk, source)
    if (frameSize) {
      if (stillSize) corrupt('WebP', source, 'multiple top-level image payloads')
      stillSize = frameSize
      continue
    }

    if (chunk.type === 'ANIM') {
      if (chunk.length !== 6) corrupt('WebP', source, 'ANIM must have length 6')
      hasAnimationHeader = true
      continue
    }

    if (chunk.type === 'ANMF') {
      if (chunk.length <= 24) corrupt('WebP', source, 'ANMF payload is truncated')
      const frameWidth = buffer.readUIntLE(chunk.dataOffset + 6, 3) + 1
      const frameHeight = buffer.readUIntLE(chunk.dataOffset + 9, 3) + 1
      dimensions(frameWidth, frameHeight, 'WebP', source)
      if ((buffer[chunk.dataOffset + 15] & 0xfc) !== 0) {
        corrupt('WebP', source, 'ANMF contains invalid flags')
      }
      const nestedChunks = webpChunks(
        buffer,
        chunk.dataOffset + 16,
        chunk.dataEnd,
        source,
        'ANMF',
      )
      const nestedFrames = nestedChunks.filter((nestedChunk) => (
        webpFrameSize(buffer, nestedChunk, source)
      ))
      if (nestedFrames.length !== 1) {
        corrupt('WebP', source, 'ANMF must contain exactly one VP8 or VP8L payload')
      }
      hasAnimationFrame = true
    }
  }

  const animationFlag = extendedFlags !== undefined && (extendedFlags & 0x02) !== 0
  const hasAnyAnimationChunks = hasAnimationHeader || hasAnimationFrame
  if (animationFlag || hasAnyAnimationChunks) {
    if (!canvasSize || !animationFlag || !hasAnimationHeader || !hasAnimationFrame) {
      corrupt('WebP', source, 'animation requires legal VP8X, ANIM, and ANMF payloads')
    }
    if (stillSize) corrupt('WebP', source, 'animated WebP cannot use a top-level image payload')
    return { format: 'WebP', ...canvasSize }
  }

  if (!stillSize) {
    corrupt('WebP', source, 'VP8X metadata has no VP8 or VP8L image payload')
  }
  return { format: 'WebP', ...(canvasSize ?? stillSize) }
}

export function inspectImageBuffer(input, source = 'image buffer', options = {}) {
  const buffer = imageBuffer(input, source)
  if (buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return inspectPngBuffer(buffer, source, options)
  }
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    return inspectJpegBuffer(buffer, source)
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return inspectWebpBuffer(buffer, source)
  }
  throw new TypeError(`Unsupported image format for ${source}`)
}

function waitForDecoderClose(child, timeoutMs) {
  if (child.exitCode !== undefined && child.exitCode !== null) {
    return Promise.resolve(true)
  }
  return new Promise((resolveClose) => {
    const timeout = setTimeout(() => {
      child.removeListener('close', onClose)
      resolveClose(false)
    }, timeoutMs)
    function onClose() {
      clearTimeout(timeout)
      resolveClose(true)
    }
    child.once('close', onClose)
  })
}

export async function terminateDecoderProcess(child, adapters = {}) {
  const spawnProcess = adapters.spawn ?? spawn
  const graceMs = adapters.graceMs ?? 2_000
  const forceGraceMs = adapters.forceGraceMs ?? 5_000
  child.kill()
  if (await waitForDecoderClose(child, graceMs)) return

  if (process.platform === 'win32' && child.pid) {
    const taskkill = spawnProcess(
      'taskkill.exe',
      ['/PID', String(child.pid), '/T', '/F'],
      { windowsHide: true, stdio: 'ignore' },
    )
    await waitForDecoderClose(taskkill, forceGraceMs)
  } else {
    child.kill('SIGKILL')
  }
  if (!await waitForDecoderClose(child, forceGraceMs)) {
    throw new Error('ffmpeg did not close after forced termination')
  }
}

export async function decodeImageWithFfmpeg(filePath, expected, adapters = {}) {
  const spawnProcess = adapters.spawn ?? spawn
  const terminateProcess = adapters.terminateProcess ?? ((child) => (
    terminateDecoderProcess(child, { spawn: spawnProcess })
  ))
  const timeoutMs = adapters.timeoutMs ?? 30_000
  return new Promise((resolveDecode, rejectDecode) => {
    let settled = false
    let stderr = ''
    let timingOut = false
    const child = spawnProcess(
      adapters.executable ?? 'ffmpeg',
      [
        '-v',
        'error',
        '-xerror',
        '-nostdin',
        '-i',
        filePath,
        '-map',
        '0:v:0',
        '-frames:v',
        '1',
        '-f',
        'null',
        '-',
      ],
      {
        windowsHide: true,
        stdio: ['ignore', 'ignore', 'pipe'],
      },
    )
    child.stderr?.setEncoding('utf8')
    child.stderr?.on('data', (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-20_000)
    })

    const settle = (error) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      if (error) rejectDecode(error)
      else resolveDecode({ ...expected, verification: 'decoded' })
    }
    const timeout = setTimeout(() => {
      timingOut = true
      void terminateProcess(child).then(
        () => settle(new TypeError(`Image decode verification timed out for ${filePath}`)),
        (error) => settle(new TypeError(
          `Image decode verification timed out for ${filePath}; termination failed: ${error.message}`,
        )),
      )
    }, timeoutMs)
    child.once('error', (error) => {
      settle(new TypeError(`Image decode verification could not start for ${filePath}: ${error.message}`))
    })
    child.once('close', (code, signal) => {
      if (timingOut) return
      if (code === 0) {
        settle()
        return
      }
      const detail = stderr.trim() || `exit=${code} signal=${signal ?? 'none'}`
      settle(new TypeError(`Image decode verification failed for ${filePath}: ${detail}`))
    })
  })
}

export async function readImageMetadata(filePath, options = {}) {
  const buffer = await readFile(filePath)
  const inspected = inspectImageBuffer(buffer, filePath)
  const { format, width, height } = inspected
  let verification = inspected.verification
  if (verification !== 'decoded') {
    const decoder = options.decoder ?? decodeImageWithFfmpeg
    if (typeof decoder !== 'function') {
      throw new TypeError(`Image decode verification is unavailable for ${filePath}`)
    }
    const decoded = await decoder(filePath, { format, width, height })
    if (
      decoded?.verification !== 'decoded' ||
      decoded.width !== width ||
      decoded.height !== height
    ) {
      throw new TypeError(
        `Image decode verification did not confirm ${width} by ${height} for ${filePath}`,
      )
    }
    verification = 'decoded'
  }
  return {
    sha256: createHash('sha256').update(buffer).digest('hex'),
    width,
    height,
    bytes: buffer.length,
    verification,
  }
}
