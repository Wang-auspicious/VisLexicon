# Unified Curation Foundation Implementation Plan

> **2026-09-01 计划更新：** 本计划中的旧 7/59 taxonomy、固定类别分数、`agent-ai-ui` 优先队列与 UI 布局任务已失效，不得继续执行。底层分类改按 [站点实体、入口、内容单元与分类标签 v3](../specs/2026-09-01-site-entry-taxonomy-v3-design.md) 实施；布局冻结。本计划中已完成的 identity、evidence gate、截图与安全事务基础仍保留。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the split featured-site/directory experience with one evidence-gated curation surface backed by explicit taxonomy, identity-aware deduplication, revisioned publication, a truthful progress axis, and submission preflight.

**Architecture:** Keep the current React/Vite shell, but separate private observations from approved public records. Pure framework-free modules own taxonomy, identity resolution, evidence validation, search/ranking, and submission matching. A single Node publisher builds immutable revision files and atomically advances a small manifest; React reads only that manifest and the approved revision.

**Tech Stack:** React 19, Vite 8, Node 24 ESM, `node:test`, existing CSS system, local JSON evidence bundles.

**Repository note:** The workspace has no Git repository. Replace each commit step with a filesystem checkpoint: list changed files, run the task tests, and do not overwrite unrelated user files.

---

## File map

- `demo/src/data/curation-taxonomy.js` — canonical seven-class taxonomy, subcategories, labels, and score bands.
- `demo/src/lib/site-identity.js` — URL/Git normalization and thin resolver matching.
- `demo/src/lib/curation-evidence.js` — approved evidence bundle and public record validation.
- `demo/src/lib/unified-curation-browser.js` — prepare, rank, filter, paginate, and progress projection.
- `demo/data/curation/approved/*.json` — immutable approved bundles for the six existing reviewed sites.
- `demo/data/curation/work-queue.json` — real task states used by the progress axis.
- `demo/scripts/migrate-curated-sites-v2.mjs` — one-time conversion of the six reviewed legacy records.
- `demo/scripts/curation/image-metadata.mjs` — dependency-free PNG/JPEG/WebP dimensions and SHA-256 used by migration and publication.
- `demo/scripts/build-curation-public.mjs` — revisioned index, resolver index, progress, and manifest publisher.
- `demo/public/data/curation/manifest.json` — small commit pointer fetched with `no-store`.
- `demo/public/data/curation/site-index.<revision>.json` — immutable approved public records.
- `demo/public/data/curation/resolver.<revision>.json` — thin exact/alias/candidate preflight data.
- `demo/src/components/curation/CurationProgressRail.jsx` — narrow sticky vertical progress axis.
- `demo/src/components/curation/UnifiedSiteCard.jsx` — the only public site card.
- `demo/src/components/curation/UnifiedCuration.jsx` — data loading, filters, paging, and modal orchestration.
- `demo/src/views/IndexView.jsx` — mounts only `UnifiedCuration`.
- `demo/src/components/SiteDetailModal.jsx` — consumes the new public record schema.
- `demo/src/views/Submit.jsx` — read-only duplicate preflight for site submissions.
- `demo/src/App.css` — unified curation and progress-axis styling.
- `demo/tests/curation-taxonomy.test.mjs` — taxonomy contract.
- `demo/tests/site-identity.test.mjs` — URL normalization and resolver behavior.
- `demo/tests/curation-evidence.test.mjs` — publication gates.
- `demo/tests/curation-publisher.test.mjs` — revision and atomic manifest contract.
- `demo/tests/curation-migration.test.mjs` — six-record migration, asset metadata, and quarantine boundary.
- `demo/tests/unified-curation-browser.test.mjs` — ranking/filter/progress behavior.
- `demo/tests/unified-curation-ui.test.mjs` — single-surface SSR contract.
- `demo/tests/submission-form.test.mjs` — duplicate-preflight states without fake submission.

### Task 1: Canonical taxonomy and objective ranking bands

**Files:**
- Create: `demo/src/data/curation-taxonomy.js`
- Create: `demo/tests/curation-taxonomy.test.mjs`

- [ ] **Step 1: Write the failing taxonomy test**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CURATION_ESSENCES,
  CURATION_SUBCATEGORIES,
  taxonomySelectionErrors,
} from '../src/data/curation-taxonomy.js'

test('taxonomy exposes seven public essences with globally unique fine-category ids', () => {
  assert.equal(CURATION_ESSENCES.length, 7)
  assert.deepEqual(CURATION_ESSENCES.map(({ id }) => id), [
    'reusable-implementation',
    'reusable-asset',
    'knowledge-vocabulary',
    'operational-tool',
    'resource-aggregator',
    'inspiration-collection',
    'showcase-commercial',
  ])
  const ids = Object.values(CURATION_SUBCATEGORIES).flat().map(({ id }) => id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(ids.includes('agent-ai-ui'))
  assert.ok(ids.includes('icons-symbols'))
})

test('a fine category must belong to the selected essence', () => {
  assert.deepEqual(taxonomySelectionErrors({
    resourceEssence: 'reusable-implementation',
    subcategory: 'icons-symbols',
  }), ['icons-symbols does not belong to reusable-implementation'])
})
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/curation-taxonomy.test.mjs` from `demo`  
Expected: FAIL because `curation-taxonomy.js` does not exist.

- [ ] **Step 3: Implement the taxonomy registry**

Create immutable records with `id`, Chinese `label`, `baseScore`, `minScore`, `maxScore`, and ordered subcategories. Export `taxonomySelectionErrors(record)` and `scoreWithinEssenceBand(essenceId, modifiers)`.

```js
const essence = (id, label, baseScore, minScore, maxScore) =>
  Object.freeze({ id, label, baseScore, minScore, maxScore })

export const CURATION_ESSENCES = Object.freeze([
  essence('reusable-implementation', '可复用实现', 90, 80, 100),
  essence('reusable-asset', '可复用素材', 88, 80, 100),
  essence('knowledge-vocabulary', '专业知识与命名', 88, 80, 100),
  essence('operational-tool', '可操作工具', 70, 60, 79),
  essence('resource-aggregator', '资源聚合与导航', 54, 45, 64),
  essence('inspiration-collection', '灵感与案例', 48, 35, 59),
  essence('showcase-commercial', '单站展示与商业官网', 22, 10, 34),
])

export function scoreWithinEssenceBand(essenceId, modifiers = []) {
  const essenceRecord = CURATION_ESSENCES.find(({ id }) => id === essenceId)
  if (!essenceRecord) throw new TypeError(`unknown resource essence: ${essenceId}`)
  const score = essenceRecord.baseScore + modifiers.reduce((sum, value) => sum + value, 0)
  return Math.max(essenceRecord.minScore, Math.min(essenceRecord.maxScore, score))
}
```

Populate every fine category from the approved specification, preserving its displayed order.

- [ ] **Step 4: Run taxonomy tests and checkpoint**

Run: `node --test tests/curation-taxonomy.test.mjs`  
Expected: PASS. Record the two created files in the checkpoint.

### Task 2: Identity normalization and continuous duplicate resolution

**Files:**
- Create: `demo/src/lib/site-identity.js`
- Create: `demo/tests/site-identity.test.mjs`

- [ ] **Step 1: Write failing normalization and resolver tests**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeIdentityUrl, resolveSubmittedUrl } from '../src/lib/site-identity.js'

test('identity normalization removes known tracking and Git transport noise', () => {
  assert.equal(normalizeIdentityUrl('https://designmodo.com/postcards?u=toools'), 'https://designmodo.com/postcards')
  assert.equal(normalizeIdentityUrl('git+https://github.com/Kiho/react-form-builder.git'), 'https://github.com/kiho/react-form-builder')
  assert.equal(normalizeIdentityUrl('github:Azure/azure-sdk-for-js'), 'https://github.com/azure/azure-sdk-for-js')
})

test('resolver distinguishes exact, alias, suspected and new URLs', () => {
  const rows = [
    { entityId: 'site_lucide', status: 'published', primaryUrl: 'https://lucide.dev', aliases: ['https://lucide.netlify.app'] },
    { entityId: 'site_bits', status: 'candidate', primaryUrl: 'https://bits-ui.com', aliases: ['https://github.com/huntabyte/bits-ui'] },
  ]
  assert.equal(resolveSubmittedUrl('https://lucide.dev', rows).kind, 'published')
  assert.equal(resolveSubmittedUrl('https://lucide.netlify.app', rows).kind, 'known-alias')
  assert.equal(resolveSubmittedUrl('https://github.com/huntabyte/bits-ui', rows).kind, 'candidate')
  assert.equal(resolveSubmittedUrl('https://new.example', rows).kind, 'new-link')
})
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/site-identity.test.mjs`  
Expected: FAIL because exports do not exist.

- [ ] **Step 3: Implement strict URL parsing**

Implement pre-parsing for `github:owner/repo`, `git+https://`, `git://`, and trailing `.git`. Reject credentials, non-HTTP(S), localhost, private IPv4 ranges, malformed hostnames, and URLs whose normalized host begins `git+` or `http.`. Lowercase GitHub owner/repo, remove fragments, remove known tracking keys (`utm_*`, `fpr`, `atp`, `u`, `ep`, `ir_*`, `session`) and sort remaining parameters.

```js
export function normalizeIdentityUrl(input) {
  const prepared = prepareGitUrl(String(input).trim())
  const url = new URL(prepared)
  assertSafePublicHttpUrl(url)
  url.hash = ''
  stripTracking(url.searchParams)
  normalizeProviderPath(url)
  return `${url.protocol}//${normalizeHost(url.hostname)}${normalizePath(url)}${normalizedSearch(url)}`
}
```

Implement `resolveSubmittedUrl(input, rows)` with exact primary match before alias match. A weak same-domain/name signal may return `suspected-duplicate`, but never auto-merge.

- [ ] **Step 4: Add regression fixtures from the audit**

Cover Headless UI old/new domain, Lucide old/new domain, two GitHub case duplicates, Adobe Color root/create, Pika same-name distinct products, Skeleton distinct products, and a redirect target to a private IP.

- [ ] **Step 5: Run tests and checkpoint**

Run: `node --test tests/site-identity.test.mjs`  
Expected: PASS with all named regressions.

### Task 3: Evidence bundle publication gate

**Files:**
- Create: `demo/src/lib/curation-evidence.js`
- Create: `demo/tests/curation-evidence.test.mjs`

- [ ] **Step 1: Write the failing approved-bundle test**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { evidenceBundleErrors, toPublicSite } from '../src/lib/curation-evidence.js'

const bundle = {
  schemaVersion: 2,
  siteId: 'site_fixture',
  entityKey: 'fixture',
  attemptId: 'attempt_fixture_1',
  status: 'APPROVED',
  official: { inputUrl: 'https://fixture.example', finalUrl: 'https://fixture.example', checkedAt: '2026-09-01T00:00:00Z' },
  curation: {
    name: 'Fixture',
    descriptionZh: 'Fixture 提供可直接复制到项目中的界面组件，并用完整文档说明安装、组合方式和许可边界，适合需要快速搭建设计系统的团队。',
    resourceEssence: 'reusable-implementation',
    subcategory: 'ui-components-general',
    score: 90,
    tags: ['React'],
  },
  pages: ['identity', 'breadth', 'proof'].map((role, index) => ({
    role,
    sourceUrl: `https://fixture.example/${index || ''}`,
    finalUrl: `https://fixture.example/${index || ''}`,
    title: `${role} page`,
    selectionRationale: `${role} proves a distinct part of the product`,
    shot: { src: `/shots/site_fixture/0${index + 1}.jpg`, sha256: `${index + 1}`.repeat(64), width: 1280, height: 900 },
  })),
  qa: { curatorId: 'agent-a', technicalPassed: true, semanticReviewerId: 'agent-b', semanticPassed: true },
}

test('only a three-role independently reviewed bundle becomes public', () => {
  assert.deepEqual(evidenceBundleErrors(bundle), [])
  assert.equal(toPublicSite(bundle).shots.length, 3)
})
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/curation-evidence.test.mjs`  
Expected: FAIL because `curation-evidence.js` does not exist.

- [ ] **Step 3: Implement validation gates**

Validate: approved status; safe official URL; taxonomy membership; description length 60–120 Chinese characters; exactly `identity/breadth/proof`; unique page URLs, screenshot paths, hashes, and rationales; 1280×900 minimum capture; technical pass; different curator and semantic reviewer; semantic pass; non-empty tags; score inside the essence band. Return an array of concrete errors and never coerce a malformed record.

- [ ] **Step 4: Add negative tests**

Reject one/two/four shots, duplicate hashes, blank or tiny captures, same reviewer, template phrases such as `归类为`, unknown taxonomy ids, a GitHub generic article unrelated to the entity, missing license evidence when `open-source` is claimed, and `QUARANTINED_LEGACY` status.

- [ ] **Step 5: Run tests and checkpoint**

Run: `node --test tests/curation-evidence.test.mjs tests/curation-taxonomy.test.mjs tests/site-identity.test.mjs`  
Expected: PASS.

### Task 4: Migrate the six reviewed records and publish immutable revisions

**Files:**
- Create: `demo/scripts/curation/image-metadata.mjs`
- Create: `demo/scripts/migrate-curated-sites-v2.mjs`
- Create: `demo/scripts/build-curation-public.mjs`
- Create: `demo/data/curation/work-queue.json`
- Generate: `demo/data/curation/approved/*.json`
- Generate: `demo/public/data/curation/manifest.json`
- Generate: `demo/public/data/curation/site-index.<revision>.json`
- Generate: `demo/public/data/curation/resolver.<revision>.json`
- Create: `demo/tests/curation-publisher.test.mjs`
- Create: `demo/tests/curation-migration.test.mjs`

- [ ] **Step 1: Write a failing publisher isolation test**

Create a temporary approved directory with one valid bundle and one quarantined bundle. Assert that the built index contains only the valid record, its URL includes a content revision, the resolver still recognizes the quarantined candidate as `candidate`, and the manifest is written after both revision files exist.

```js
const result = await buildCurationPublic({ approvedDir, candidateCatalog, outputDir })
assert.equal(result.index.entries.length, 1)
assert.match(result.manifest.indexUrl, /site-index\.[a-f0-9]{12}\.json$/)
assert.ok(await fileExists(join(outputDir, basename(result.manifest.indexUrl))))
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/curation-publisher.test.mjs`  
Expected: FAIL because publisher exports do not exist.

- [ ] **Step 3: Implement deterministic revision building**

Read and sort approved bundles by `siteId`, validate all before writing, project through `toPublicSite`, and hash stable JSON to a 12-character revision. Build a resolver containing approved primary/alias URLs plus exact normalized observations from `src/data/site-catalog.json` marked `candidate-observation`. Write revision files through unique temporary names, rename them, and write `manifest.json` last.

The manifest shape is fixed:

```json
{
  "schemaVersion": 1,
  "revision": "0123456789ab",
  "indexUrl": "/data/curation/site-index.0123456789ab.json",
  "resolverUrl": "/data/curation/resolver.0123456789ab.json",
  "publishedCount": 6,
  "progress": {
    "activeEssence": "reusable-implementation",
    "activeSubcategory": "agent-ai-ui",
    "subcategories": []
  }
}
```

- [ ] **Step 4: Implement the migration script**

Import `CURATED_SITES`, map all six to `reusable-implementation`, assign the appropriate fine category, retain their real screenshot paths/source URLs/about/author/repo, add explicit `identity/breadth/proof` rationales, and mark the pre-existing human review as curator/semantic review with distinct migration IDs. Do not import Aceternity or Animata.

- [ ] **Step 5: Seed real queue progress**

Create `work-queue.json` with the full ordered taxonomy. Set `agent-ai-ui` to `READY`; represent the six migrated approved sites as six real `APPROVED` tasks so their fine-category counts are visible (`ui-components-general = 2`; `marketing-sections`, `application-dashboard-ui`, `motion-interaction-code`, and `design-system-primitives = 1` each). Other unstarted categories remain `NOT_STARTED`; all counts come from task/bundle records, never marketing constants.

- [ ] **Step 6: Generate and verify**

Run:

```powershell
node scripts/migrate-curated-sites-v2.mjs
node scripts/build-curation-public.mjs
node --test tests/curation-publisher.test.mjs tests/curation-evidence.test.mjs
```

Expected: six approved public records, no quarantined legacy record, deterministic byte-identical rerun, manifest written last.

### Task 5: Browser model for ranking, filtering, paging, and progress

**Files:**
- Create: `demo/src/lib/unified-curation-browser.js`
- Create: `demo/tests/unified-curation-browser.test.mjs`

- [ ] **Step 1: Write failing behavior tests**

Test that higher utility scores sort first, but `inspiration-collection` remains directly filterable; search intersects essence and subcategory; pagination is 24 cards; progress preserves taxonomy order; no function mutates input.

```js
assert.deepEqual(rankPublishedSites([inspiration, component]).map(x => x.id), [component.id, inspiration.id])
assert.deepEqual(filterPublishedSites([inspiration, component], { resourceEssence: 'inspiration-collection' }).map(x => x.id), [inspiration.id])
assert.equal(pagePublishedSites(Array.from({ length: 25 }, (_, i) => ({ id: i })), 1, 24).items.length, 24)
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/unified-curation-browser.test.mjs`  
Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement pure browser functions**

Export `preparePublishedSites`, `rankPublishedSites`, `filterPublishedSites`, `pagePublishedSites`, `projectProgressAxis`, and `publishedFacets`. Normalize search text once during preparation. Rank by score descending, then name, then stable id.

- [ ] **Step 4: Run tests and checkpoint**

Run: `node --test tests/unified-curation-browser.test.mjs`  
Expected: PASS.

### Task 6: Replace both curation surfaces with one unified UI

**Files:**
- Create: `demo/src/components/curation/CurationProgressRail.jsx`
- Create: `demo/src/components/curation/UnifiedSiteCard.jsx`
- Create: `demo/src/components/curation/UnifiedCuration.jsx`
- Modify: `demo/src/views/IndexView.jsx`
- Modify: `demo/src/components/SiteDetailModal.jsx`
- Modify: `demo/src/App.css`
- Create: `demo/tests/unified-curation-ui.test.mjs`
- Modify: `demo/tests/curation.test.mjs`
- Modify: `demo/tests/shell-contract.test.mjs`

- [ ] **Step 1: Replace legacy SSR expectations with a failing single-surface contract**

Assert:

```js
assert.match(source, /<UnifiedCuration\s*\/>/)
assert.doesNotMatch(source, /CURATED_SITES|<SiteCatalog/)
assert.match(unifiedSource, /fetch\('\/data\/curation\/manifest\.json',\s*\{\s*cache:\s*'no-store'/)
assert.match(unifiedSource, /<CurationProgressRail/)
assert.match(cardSource, /site\.shots\.length === 3/)
assert.doesNotMatch(cardSource, /initial|placeholder|site-trio-empty/i)
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/unified-curation-ui.test.mjs tests/curation.test.mjs tests/shell-contract.test.mjs`  
Expected: FAIL on legacy dual-surface markup.

- [ ] **Step 3: Implement data loading without stale fixed-index cache**

`UnifiedCuration` first fetches the manifest with `cache: 'no-store'`, then fetches `manifest.indexUrl` as immutable content. It shows an honest retry state on failure and never falls back to the 8,684-candidate index.

- [ ] **Step 4: Implement the progress axis**

Desktop markup is a narrow `<nav className="curation-progress-rail">` containing a line and ordered nodes; no bordered/background panel. Each node renders label, state, and `approved / assigned` when assigned is nonzero. Clicking filters that fine category. On screens below 768px, CSS changes it to a horizontal overflow-safe progress strip.

- [ ] **Step 5: Implement the only site card**

The card rejects any non-three-shot input before rendering, uses the existing Oreo 1+2 image composition, renders name/essence/fine-category/score-derived utility label/tags, and opens `SiteDetailModal`. It never renders initials or missing-image placeholders.

- [ ] **Step 6: Simplify `IndexView`**

```jsx
import UnifiedCuration from '../components/curation/UnifiedCuration.jsx'

export default function IndexView() {
  return <UnifiedCuration />
}
```

Do not delete legacy files in this task; leave them unmounted until full verification proves the replacement.

- [ ] **Step 7: Update the modal schema**

Use `canonicalUrl`, `descriptionZh`, `shots`, `official.author`, `official.repository`, `official.license`, `pricing`, and classification fields. Keep the floating overlay interaction and focus behavior. Require three shots; a malformed record must not open.

- [ ] **Step 8: Run UI tests and checkpoint**

Run: `node --test tests/unified-curation-ui.test.mjs tests/curation.test.mjs tests/shell-contract.test.mjs tests/modal-focus.test.mjs`  
Expected: PASS and zero references to the mounted legacy directory.

### Task 7: Submission duplicate preflight without a fake backend

**Files:**
- Modify: `demo/src/lib/submission-form.js`
- Modify: `demo/src/views/Submit.jsx`
- Modify: `demo/tests/submission-form.test.mjs`

- [ ] **Step 1: Write failing resolver-state tests**

```js
test('site draft preflight returns published, alias, candidate and new-link states', () => {
  assert.equal(preflightSiteSubmission('https://lucide.dev', resolver).kind, 'published')
  assert.equal(preflightSiteSubmission('https://lucide.netlify.app', resolver).kind, 'known-alias')
  assert.equal(preflightSiteSubmission('https://bits-ui.com', resolver).kind, 'candidate')
  assert.equal(preflightSiteSubmission('https://new.example', resolver).kind, 'new-link')
})
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/submission-form.test.mjs`  
Expected: FAIL because `preflightSiteSubmission` is absent.

- [ ] **Step 3: Implement pure preflight**

Delegate URL normalization and matching to `site-identity.js`. Return user-facing data for `published`, `candidate`, `known-alias`, `suspected-duplicate`, `new-link`, and `unverifiable`. Never return `submitted` or `queued`.

- [ ] **Step 4: Add honest UI feedback**

When type is `site` and the URL is valid, load the manifest and resolver read-only, run preflight, and display one result. Published/alias/candidate states change the primary suggestion to “补充证据”; new links remain exportable local drafts. Keep the disabled real-send button and existing “尚未发送” language.

- [ ] **Step 5: Run tests and checkpoint**

Run: `node --test tests/submission-form.test.mjs tests/site-identity.test.mjs`  
Expected: PASS.

### Task 8: Foundation verification and acceptance evidence

**Files:**
- Modify: `docs/verification/2026-08-31-vislexicon-continuation-acceptance.md`
- Create: `docs/verification/images/unified-curation-1280x900.png`
- Create: `docs/verification/images/unified-curation-390x844.png`

- [ ] **Step 1: Run all relevant tests**

```powershell
node --test tests/curation-taxonomy.test.mjs tests/site-identity.test.mjs tests/curation-evidence.test.mjs tests/curation-publisher.test.mjs tests/unified-curation-browser.test.mjs tests/unified-curation-ui.test.mjs tests/curation.test.mjs tests/catalog-browser.test.mjs tests/submission-form.test.mjs tests/shell-contract.test.mjs tests/modal-focus.test.mjs
```

Expected: all listed tests pass.

- [ ] **Step 2: Run full project verification**

```powershell
node --test tests/*.test.mjs
npm run lint
npm run build
```

Expected: tests pass, lint exits 0 with only documented pre-existing warnings, build exits 0. If the interrupted Visual Atlas work still fails, record those failures separately and do not claim full-project green.

- [ ] **Step 3: Browser verification at 1280×900**

Verify: one curation surface; exactly the approved records; no initials/placeholders; progress rail is a line rather than a panel; `agent-ai-ui` is visibly current; card click opens the full three-image modal; network requests manifest then revision URL.

- [ ] **Step 4: Browser verification at 390×844**

Verify: progress becomes horizontal; no overflow; search and active category remain above cards; three-image card remains legible; modal focus and close work.

- [ ] **Step 5: Update acceptance evidence**

Record exact published count, active queue category, manifest revision, test/lint/build commands, known Visual Atlas failures, and both screenshot paths. Do not describe 8,684 observations as published or unique sites.

---

## Follow-on plan boundary

After this foundation passes, create a separate plan for the first `agent-ai-ui` evidence batch. That plan selects an entity-deduplicated candidate set, dispatches real-site curator agents, runs independent semantic review, and publishes the first 25-record revision. Visual Atlas 500+ remains a third independent plan.
