import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildCurationQueue,
  serializeCurationQueue,
} from '../src/lib/curation-queue.js'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIR, '..')
const DEFAULT_CANDIDATE_INDEX = resolve(
  DEMO_ROOT,
  'public/data/site-catalog-index.json',
)
const DEFAULT_SOURCE_CATALOG = resolve(DEMO_ROOT, 'src/data/site-catalog.json')
const DEFAULT_APPROVED_DIR = resolve(DEMO_ROOT, 'data/curation/approved')
const DEFAULT_OUTPUT = resolve(DEMO_ROOT, 'data/curation/work-queue-v2.json')
const PROTECTED_OUTPUTS = new Set([
  resolve(DEMO_ROOT, 'data/curation/work-queue.json').toLowerCase(),
  DEFAULT_CANDIDATE_INDEX.toLowerCase(),
])

function parseArgs(argv) {
  const options = {
    candidateIndex: DEFAULT_CANDIDATE_INDEX,
    sourceCatalog: DEFAULT_SOURCE_CATALOG,
    approvedDir: DEFAULT_APPROVED_DIR,
    output: DEFAULT_OUTPUT,
    revision: 'curation-work-queue-v2-20260901',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    const next = () => {
      const value = argv[++index]
      if (!value) throw new TypeError(`${argument} requires a value`)
      return value
    }

    if (argument === '--candidate-index') {
      options.candidateIndex = resolve(next())
    } else if (argument === '--source-catalog') {
      options.sourceCatalog = resolve(next())
    } else if (argument === '--approved-dir') {
      options.approvedDir = resolve(next())
    } else if (argument === '--output') {
      options.output = resolve(next())
    } else if (argument === '--revision') {
      options.revision = next()
    } else {
      throw new TypeError(`Unknown argument: ${argument}`)
    }
  }

  if (PROTECTED_OUTPUTS.has(options.output.toLowerCase())) {
    throw new TypeError(
      'The v2 queue builder cannot overwrite the legacy queue or public candidate index.',
    )
  }
  return options
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function readApprovedBundles(directory) {
  const files = (await readdir(directory))
    .filter((file) => file.endsWith('.json'))
    .sort()
  return Promise.all(
    files.map(async (file) => ({
      file,
      bundle: await readJson(resolve(directory, file)),
    })),
  )
}

async function writeAtomically(output, bytes) {
  const temporary = `${output}.${process.pid}.tmp`
  await mkdir(dirname(output), { recursive: true })
  try {
    await writeFile(temporary, bytes, 'utf8')
    await rename(temporary, output)
  } finally {
    await rm(temporary, { force: true })
  }
}

export async function buildCurationQueueFile(options) {
  const [candidateIndex, sourceCatalog, approvedBundles] = await Promise.all([
    readJson(options.candidateIndex),
    readJson(options.sourceCatalog),
    readApprovedBundles(options.approvedDir),
  ])
  const queue = buildCurationQueue({
    candidateIndex,
    sourceCatalog,
    approvedBundles,
    revision: options.revision,
  })
  const bytes = serializeCurationQueue(queue)
  await writeAtomically(options.output, bytes)
  return {
    output: options.output,
    bytes: Buffer.byteLength(bytes),
    summary: queue.summary,
  }
}

async function main() {
  const report = await buildCurationQueueFile(parseArgs(process.argv.slice(2)))
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
