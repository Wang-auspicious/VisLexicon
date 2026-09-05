import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIR, '..')
const DEFAULT_CATALOG = resolve(DEMO_ROOT, 'src/data/site-catalog.json')
const DEFAULT_OUTPUT = resolve(DEMO_ROOT, 'data/sources/site-descriptions.zh.raw.json')
const ENDPOINT = 'https://translate.googleapis.com/translate_a/single'
const USER_AGENT = 'VisLexicon catalog translator/1.0'
const execFileAsync = promisify(execFile)

export function descriptionKey(value) {
  return createHash('sha256').update(String(value).trim()).digest('hex').slice(0, 16)
}

function translationText(payload) {
  return payload?.[0]?.map((segment) => segment?.[0] ?? '').join('') ?? ''
}

function splitTranslation(text, batch) {
  const matches = [...text.matchAll(/VLX(\d{6})\s*[:：]\s*([\s\S]*?)(?=\nVLX\d{6}\s*[:：]|$)/g)]
  const parsed = new Map(matches.map(([, index, value]) => [Number(index), value.trim()]))
  return batch.map((item, index) => ({ ...item, translated: parsed.get(index) || '' }))
}

async function requestTranslation(text, attempts = 4) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      // The endpoint rejects Node/undici's TLS fingerprint with 429 while accepting ordinary
      // curl requests. Use curl directly so collection follows the same public-web route that
      // was manually verified before enabling this batch job.
      const executable = process.platform === 'win32' ? 'curl.exe' : 'curl'
      const { stdout } = await execFileAsync(
        executable,
        [
          '-G',
          '--silent',
          '--show-error',
          '--fail',
          '--max-time',
          '40',
          '-A',
          USER_AGENT,
          ENDPOINT,
          '--data-urlencode',
          'client=gtx',
          '--data-urlencode',
          'sl=en',
          '--data-urlencode',
          'tl=zh-CN',
          '--data-urlencode',
          'dt=t',
          '--data-urlencode',
          `q=${text}`,
        ],
        { maxBuffer: 2_000_000 },
      )
      const translated = translationText(JSON.parse(stdout))
      if (!translated) throw new Error('empty translation response')
      return translated
    } catch (error) {
      lastError = error
      if (attempt < attempts) await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_500 * attempt))
    }
  }
  throw lastError
}

function makeBatches(items, maxItems = 40, maxCharacters = 4_500) {
  const batches = []
  let batch = []
  let characters = 0
  for (const item of items) {
    const addition = item.original.length + 20
    if (batch.length > 0 && (batch.length >= maxItems || characters + addition > maxCharacters)) {
      batches.push(batch)
      batch = []
      characters = 0
    }
    batch.push(item)
    characters += addition
  }
  if (batch.length > 0) batches.push(batch)
  return batches
}

async function translateBatch(batch) {
  const prompt = batch.map((item, index) => `VLX${String(index).padStart(6, '0')}: ${item.original}`).join('\n')
  const result = splitTranslation(await requestTranslation(prompt), batch)
  if (result.every(({ translated }) => translated)) return result
  if (batch.length === 1) return result

  const midpoint = Math.ceil(batch.length / 2)
  return [
    ...(await translateBatch(batch.slice(0, midpoint))),
    ...(await translateBatch(batch.slice(midpoint))),
  ]
}

function parseArgs(argv) {
  const options = { catalog: DEFAULT_CATALOG, output: DEFAULT_OUTPUT, max: Infinity }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--catalog') options.catalog = resolve(argv[++index])
    else if (value === '--output') options.output = resolve(argv[++index])
    else if (value === '--max') options.max = Number(argv[++index])
    else throw new Error(`Unknown argument: ${value}`)
  }
  return options
}

async function loadCache(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    return {
      schemaVersion: 1,
      engine: 'Google Translate public web endpoint',
      endpoint: ENDPOINT,
      collectedAt: new Date().toISOString().slice(0, 10),
      translations: {},
      failures: [],
    }
  }
}

async function persist(path, cache) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(cache, null, 2)}\n`, 'utf8')
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const catalog = JSON.parse(await readFile(options.catalog, 'utf8'))
  const cache = await loadCache(options.output)
  cache.failures = []
  const unique = new Map()
  for (const { descriptionOriginal } of catalog.entries) {
    const original = descriptionOriginal.trim()
    unique.set(descriptionKey(original), original)
  }
  const pending = [...unique]
    .filter(([key]) => !cache.translations[key])
    .map(([key, original]) => ({ key, original }))
    .slice(0, options.max)
  const batches = makeBatches(pending)

  for (let index = 0; index < batches.length; index += 1) {
    try {
      const results = await translateBatch(batches[index])
      for (const { key, original, translated } of results) {
        if (!translated || !/[\u3400-\u9fff]/u.test(translated)) {
          cache.failures.push({ key, original, message: 'translation missing Chinese text' })
          continue
        }
        cache.translations[key] = { original, translationZh: translated }
      }
    } catch (error) {
      for (const { key, original } of batches[index]) {
        cache.failures.push({ key, original, message: error.message })
      }
    }
    if ((index + 1) % 10 === 0) await persist(options.output, cache)
  }

  cache.collectedAt = new Date().toISOString().slice(0, 10)
  cache.translationCount = Object.keys(cache.translations).length
  await persist(options.output, cache)
  process.stdout.write(
    `${JSON.stringify({ output: options.output, uniqueDescriptions: unique.size, requested: pending.length, translated: cache.translationCount, failures: cache.failures.length }, null, 2)}\n`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
