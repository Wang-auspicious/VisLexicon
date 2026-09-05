# Visual Atlas Data Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build checked-in raw snapshots and a deterministic Visual Atlas artifact with at least 400 counted records from eight licensed visual/interaction sources, while keeping 194 AI Interaction Atlas records as non-counted coverage dimensions.

**Architecture:** A networked collector refreshes source snapshots, but the compiler and tests run fully offline from checked-in JSON. Pure normalization and parser modules keep source extraction, candidate mapping, exact-key deduplication, translation lookup, and output validation independently testable.

**Tech Stack:** Node.js ESM, built-in `node:test`, built-in `fetch`, GitHub public APIs/raw content, existing Google Translate curl workflow, JSON snapshots.

---

### Task 1: Lock the pure normalization and merge contract

**Files:**
- Create: `demo/tests/visual-atlas-data.test.mjs`
- Create: `demo/scripts/visual-atlas/normalize.mjs`

- [ ] **Step 1: Write the failing normalization tests**

The first test file imports `normalizeTerm`, `duplicateKey`, `stableAtlasId`, and `mergeCandidates`. It asserts NFKC/punctuation normalization, stable IDs, exact collision evidence merging, and separation when `axis` or `recordType` differs.

```js
test('exact duplicate keys merge evidence without erasing distinct axes', () => {
  const base = candidate({ termEn: 'Tool call', axis: 'component', recordType: 'component' })
  const duplicate = candidate({ termEn: 'tool-call', axis: 'component', recordType: 'component', sourceId: 'b' })
  const motion = candidate({ termEn: 'Tool call', axis: 'motion', recordType: 'design-phenomenon' })
  const merged = mergeCandidates([base, duplicate, motion])
  assert.equal(merged.length, 2)
  assert.equal(merged.find(({ axis }) => axis === 'component').sourceEvidence.length, 2)
})
```

- [ ] **Step 2: Run the test and verify RED**

Run from `demo`:

```powershell
node --test tests/visual-atlas-data.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/visual-atlas/normalize.mjs`.

- [ ] **Step 3: Implement the minimal pure module**

Implement:

```js
function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))].sort()
}

export function normalizeTerm(value) {
  return String(value)
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replaceAll('&', ' and ')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\u3400-\u9fff]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

export function duplicateKey(record) {
  return [normalizeTerm(record.termEn), record.recordType, record.axis].join('|')
}

export function stableAtlasId(record) {
  return `atlas-${record.axis}-${record.recordType}-${normalizeTerm(record.termEn)}`
}

export function mergeCandidates(records) {
  const merged = new Map()
  for (const record of records) {
    const key = duplicateKey(record)
    const current = merged.get(key)
    if (!current) {
      merged.set(key, {
        ...structuredClone(record),
        id: stableAtlasId(record),
        aliases: unique(record.aliases),
        scenes: unique(record.scenes),
        mediaBindings: unique(record.mediaBindings),
      })
      continue
    }
    current.aliases = unique([...current.aliases, ...(record.aliases ?? [])])
    current.scenes = unique([...current.scenes, ...(record.scenes ?? [])])
    current.mediaBindings = unique([...current.mediaBindings, ...(record.mediaBindings ?? [])])
    const evidence = [...current.sourceEvidence, ...record.sourceEvidence]
    current.sourceEvidence = evidence.filter((item, index) =>
      evidence.findIndex((candidate) =>
        candidate.sourceId === item.sourceId && candidate.sourceRecordId === item.sourceRecordId,
      ) === index,
    )
  }
  return [...merged.values()].sort((a, b) => a.id.localeCompare(b.id))
}
```

No fuzzy matching, stemming, or singularization is permitted.

- [ ] **Step 4: Run the test and verify GREEN**

Run the same command. Expected: all Task 1 tests PASS with no warnings.

- [ ] **Step 5: Record the no-Git checkpoint**

Run:

```powershell
Get-FileHash tests/visual-atlas-data.test.mjs, scripts/visual-atlas/normalize.mjs -Algorithm SHA256
```

Save the command output in the final task summary; the workspace has no `.git` directory.

### Task 2: Parse all approved first-party source formats

**Files:**
- Create: `demo/tests/visual-atlas-parsers.test.mjs`
- Create: `demo/scripts/visual-atlas/source-parsers.mjs`

- [ ] **Step 1: Write parser fixture tests**

Use minimal real-format fixture strings and assert:

- animations.dev parses only glossary bullets below `## Glossary` and returns 91 when run on the real official skill snapshot.
- AI Interaction Atlas strips the import/type declaration wrapper, evaluates only the array literal, and maps top-level IDs into coverage records only.
- assistant-ui reads YAML-like MDX frontmatter `title` and `description`.
- GOV.UK reads `index.md` frontmatter `title`, `description`, `section`, and `aliases`.
- AI Elements and Prompt Kit read live first-party registry JSON.
- Loquix reads `custom-elements.json` and the README category table.
- WAI-ARIA APG reads one canonical pattern page per directory.
- Open UI normalizes multiple `*.research*.mdx` files to one base research topic.

```js
assert.deepEqual(parseMdxFrontmatter('---\ntitle: "Composer"\ndescription: "The unified input."\n---\n'), {
  title: 'Composer',
  description: 'The unified input.',
  aliases: [],
})
```

- [ ] **Step 2: Verify RED**

```powershell
node --test tests/visual-atlas-parsers.test.mjs
```

Expected: FAIL because `source-parsers.mjs` does not exist.

- [ ] **Step 3: Implement parser functions**

Export:

```js
import { runInNewContext } from 'node:vm'

function unquote(value) {
  const trimmed = String(value ?? '').trim()
  return trimmed.replace(/^(["'])([\s\S]*)\1$/, '$2')
}

export function parseAnimationVocabulary(markdown) {
  const records = []
  let inGlossary = false
  let category = ''
  for (const line of markdown.split(/\r?\n/)) {
    if (line === '## Glossary') { inGlossary = true; continue }
    if (!inGlossary) continue
    const heading = line.match(/^###\s+(.+?)(?:\s+—.*)?$/)?.[1]
    if (heading) { category = heading.trim(); continue }
    const item = line.match(/^- \*\*(.+?)\*\*\s+—\s+(.+)$/)
    if (item) records.push({ termEn: item[1].trim(), sourceDefinition: item[2].trim(), sourceCategory: category })
  }
  return records
}

export function parseTypedArraySource(source, exportName) {
  const escaped = exportName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`export const ${escaped}\\s*:[^=]+?=\\s*(\\[[\\s\\S]*\\]);\\s*$`))
  if (!match) throw new Error(`Unable to find typed array export ${exportName}`)
  const value = runInNewContext(`(${match[1]})`, Object.create(null), { timeout: 1_000 })
  if (!Array.isArray(value)) throw new TypeError(`${exportName} must evaluate to an array`)
  return value
}

export function parseMdxFrontmatter(source) {
  const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  if (!block) throw new Error('Missing frontmatter')
  const fields = Object.fromEntries(block.split(/\r?\n/).map((line) => {
    const split = line.indexOf(':')
    return split < 0 ? [line.trim(), ''] : [line.slice(0, split).trim(), unquote(line.slice(split + 1))]
  }))
  return {
    title: fields.title,
    description: fields.description,
    aliases: fields.aliases ? fields.aliases.split(',').map((value) => value.trim()).filter(Boolean) : [],
    section: fields.section || '',
  }
}

export const parseGovukFrontmatter = parseMdxFrontmatter
```

`parseTypedArraySource` accepts only a matched `export const NAME: Type[] = [ ... ];` array expression and evaluates it in an empty `vm` context with a timeout. It must reject unmatched exports and non-array results.

- [ ] **Step 4: Verify GREEN**

Run both test files. Expected: PASS.

### Task 3: Collect and validate checked-in raw snapshots

**Files:**
- Create: `demo/scripts/collect-visual-atlas.mjs`
- Create: `demo/data/visual-atlas-sources/animations-dev.raw.json`
- Create: `demo/data/visual-atlas-sources/assistant-ui.raw.json`
- Create: `demo/data/visual-atlas-sources/govuk-design-system.raw.json`
- Create: `demo/data/visual-atlas-sources/ai-elements.raw.json`
- Create: `demo/data/visual-atlas-sources/prompt-kit.raw.json`
- Create: `demo/data/visual-atlas-sources/loquix.raw.json`
- Create: `demo/data/visual-atlas-sources/wai-aria-apg.raw.json`
- Create: `demo/data/visual-atlas-sources/open-ui.raw.json`
- Create: `demo/data/visual-atlas-sources/ai-interaction-atlas.coverage.raw.json`
- Modify: `demo/tests/visual-atlas-data.test.mjs`

- [ ] **Step 1: Add failing raw-contract tests**

The test loads eight counted files with exact counts `91`, `120`, `72`, `48`, `21`, `53`, `30`, and `31`, plus one 194-record coverage file. It requires unique `sourceRecordId` values, source-owned English definitions or conservative source summaries, repository revisions, and resolvable evidence paths. Coverage records must all have `countedAtlas: false`.

- [ ] **Step 2: Verify RED**

```powershell
node --test tests/visual-atlas-data.test.mjs
```

Expected: FAIL with `ENOENT` for the raw snapshot directory.

- [ ] **Step 3: Implement the collector**

The collector uses one repository metadata/tree request per source, raw GitHub content URLs for files, bounded concurrency of eight, and atomic `.tmp` to final renames. It writes this source envelope:

```js
{
  schemaVersion: 1,
  source: { id, name, url, license, retrievedAt, revision, verifiedCount },
  records: [{ sourceRecordId, termEn, sourceDefinition, sourceCategory, sourceUrl, sourcePath, sourceMetadata }]
}
```

It aborts before rename unless record counts equal the fixed verified counts.

- [ ] **Step 4: Run collection**

```powershell
node scripts/collect-visual-atlas.mjs
```

Expected JSON summary: counted source total `466`, coverage total `194`, nine outputs, and no failures.

- [ ] **Step 5: Verify GREEN**

```powershell
node --test tests/visual-atlas-data.test.mjs tests/visual-atlas-parsers.test.mjs
```

Expected: PASS.

### Task 4: Build the Chinese translation cache with explicit quality markers

**Files:**
- Create: `demo/scripts/translate-visual-atlas.mjs`
- Create: `demo/data/visual-atlas-translations.zh.json`
- Modify: `demo/tests/visual-atlas-data.test.mjs`

- [ ] **Step 1: Add failing translation-cache tests**

Assert every unique raw `termEn` and `sourceDefinition` has a cache entry whose `original` matches exactly, whose `translationZh` contains Chinese text, and whose quality is `machine`.

- [ ] **Step 2: Verify RED**

Expected: FAIL with `ENOENT` for the cache.

- [ ] **Step 3: Implement the translator**

Reuse the repository's proven curl-based Google Translate batching design. Cache keys are the first 16 hex characters of SHA-256 over exact source text. Each stored item is:

```js
{ original, translationZh, quality: 'machine' }
```

The script writes incrementally every ten batches and never overwrites a matching cached translation.

- [ ] **Step 4: Run translation and verify cache coverage**

```powershell
node scripts/translate-visual-atlas.mjs
node --test tests/visual-atlas-data.test.mjs
```

Expected: translator reports zero missing unique texts; tests PASS.

### Task 5: Compile the merged Visual Atlas artifact

**Files:**
- Create: `demo/scripts/build-visual-atlas.mjs`
- Create: `demo/src/data/visual-atlas.json`
- Modify: `demo/tests/visual-atlas-data.test.mjs`
- Modify: `demo/package.json`

- [ ] **Step 1: Add failing merged-artifact tests**

Assert schema version, unique IDs, `entries.length >= 400`, valid axes/types, explicit translation quality, non-empty evidence, exact local lexeme mapping only, absence of Moro/Vikingz/motion-vocabulary as standalone sources, and complete separation of AI Interaction Atlas into `coverageDimensions` with `countedAtlas: false`.

- [ ] **Step 2: Verify RED**

Expected: FAIL with `ENOENT` for `src/data/visual-atlas.json`.

- [ ] **Step 3: Implement the offline compiler**

Map each source according to the approved design, join translations, attach `agent-gui` only to the explicit assistant-ui name allowlist, preserve AI Atlas task/I/O/UX metadata, call `mergeCandidates`, validate, and atomically write:

```js
{
  schemaVersion: 1,
  generatedAt: '2026-08-31',
  sourceRecordCount: 466,
  coverageRecordCount: 194,
  coverageDimensions: [...],
  entries: [...]
}
```

Add package scripts:

```json
"atlas:collect": "node scripts/collect-visual-atlas.mjs",
"atlas:translate": "node scripts/translate-visual-atlas.mjs",
"atlas:build": "node scripts/build-visual-atlas.mjs",
"atlas:test": "node --test tests/visual-atlas-data.test.mjs tests/visual-atlas-parsers.test.mjs"
```

- [ ] **Step 4: Build and verify GREEN**

```powershell
npm run atlas:build
npm run atlas:test
```

Expected: build reports `sourceRecords: 466`, `coverageRecords: 194`, and counted `entries >= 400`; all atlas tests PASS.

- [ ] **Step 5: Prove determinism**

```powershell
$before = (Get-FileHash -LiteralPath '.\src\data\visual-atlas.json' -Algorithm SHA256).Hash
npm run atlas:build
$after = (Get-FileHash -LiteralPath '.\src\data\visual-atlas.json' -Algorithm SHA256).Hash
if ($before -ne $after) { throw 'Visual Atlas build is not deterministic' }
```

Expected: hashes match.

### Task 6: Final repository-wide verification and documentation sync

**Files:**
- Modify: `docs/research/2026-08-31-visual-atlas-400-sources.md`
- Modify: `docs/research/2026-08-31-visual-atlas-source-candidates.json`

- [ ] **Step 1: Run focused and existing verification**

From `demo`:

```powershell
npm run atlas:test
npm run lint
npm run build
node --test tests/*.test.mjs
```

Expected: all commands exit `0`; no UI/CSS file is changed by atlas scripts.

- [ ] **Step 2: Verify file and count boundaries**

```powershell
$atlas = Get-Content -LiteralPath '.\src\data\visual-atlas.json' -Raw | ConvertFrom-Json -Depth 100
if ($atlas.entries.Count -lt 400) { throw 'Counted Visual Atlas is below 400' }
if ($atlas.coverageDimensions.Count -ne 194) { throw 'Coverage dimension count must be 194' }
if (@($atlas.coverageDimensions | Where-Object countedAtlas -ne $false).Count -gt 0) { throw 'Coverage records must not be counted' }
```

- [ ] **Step 3: Update the research report with actual output counts**

Record the exact source count, merged count, duplicates merged, candidate/published split, translation coverage, artifact paths, license boundaries, and refresh commands. Do not claim a unique count from the 25-source research map; use the compiler's actual merged total.

- [ ] **Step 4: Capture final hashes instead of a Git commit**

```powershell
Get-FileHash -LiteralPath '.\src\data\visual-atlas.json' -Algorithm SHA256
Get-ChildItem -LiteralPath '.\data\visual-atlas-sources' -Filter '*.raw.json' | Get-FileHash -Algorithm SHA256
```

Include hashes and test totals in the final handoff.
