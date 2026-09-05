# Visual Atlas Neutral Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the term/Agent-GUI-biased dictionary default with a neutral discovery hub and connect all 419 sourced Visual Atlas Records through honest Published/Candidate search, facets, pagination, and evidence routes.

**Architecture:** Keep the existing hash SPA and 62 Published Lexemes. Add deterministic thin/per-record atlas endpoints, a framework-free catalog/query module, URL-state helpers, and route-scoped React components. `#/lexicon` renders no selected scene or specimen; users explicitly choose search, design domains/scenes, five axes, complete atlas, or the existing executable lexeme directory.

**Tech Stack:** React 19, Vite 8, native CSS, Node built-in test runner, static JSON endpoints.

---

> Repository note: the workspace has no `.git`, so worktree and commit steps are unavailable. Every task ends with a fresh targeted test and build checkpoint.

## File map

- `demo/scripts/build-visual-atlas.mjs`: full corpus plus thin index and per-record evidence endpoints.
- `demo/src/lib/atlas-catalog.js`: schema adaptation, exact folding, ranking, facets, pagination.
- `demo/src/lib/atlas-route-state.js`: URL query serialization and parsing.
- `demo/src/data/design-domains.js`: neutral domain/scene taxonomy; Agent GUI is nested, never default.
- `demo/src/views/Lexicon.jsx`: discovery-mode orchestrator.
- `demo/src/components/lexicon/DiscoveryHub.jsx`: neutral default.
- `demo/src/components/lexicon/PublishedLexicon.jsx`: existing 62-entry tree/stage, opened explicitly.
- `demo/src/components/lexicon/AtlasExplorer.jsx`: Candidate/Published search and facets.
- `demo/src/views/AtlasRecord.jsx`: source-evidence-only Candidate page.
- `demo/src/styles/lexicon-atlas.css`: route-scoped discovery/atlas styles.

### Task 1: Generate thin and per-record Atlas endpoints

**Files:**
- Modify: `demo/scripts/build-visual-atlas.mjs`
- Modify: `demo/tests/visual-atlas-data.test.mjs`
- Create: `demo/public/data/visual-atlas-index.json`
- Create: `demo/public/atlas/<id>.json`

- [ ] **Step 1: Write failing endpoint assertions**

Add a test that loads the generated index and asserts:

```js
assert.equal(index.totalEntries, atlas.entries.length)
assert.equal(index.candidateEntries, 417)
assert.equal(index.publishedMatches, 2)
assert.equal(index.entries.length, 419)
assert.ok(index.entries.every((entry) => !('sourceEvidence' in entry)))
assert.ok(indexStats.size <= 750_000)
for (const entry of atlas.entries) {
  const endpoint = JSON.parse(await readFile(new URL(`../public/atlas/${entry.id}.json`, import.meta.url)))
  assert.equal(endpoint.id, entry.id)
  assert.deepEqual(endpoint.sourceEvidence, entry.sourceEvidence)
}
```

- [ ] **Step 2: Run the test and confirm missing-index/per-record failure**

Run: `node --test tests/visual-atlas-data.test.mjs`  
Expected: FAIL because `public/data/visual-atlas-index.json` and record endpoints do not exist.

- [ ] **Step 3: Add deterministic derived-output builders**

Implement:

```js
export function buildVisualAtlasIndex(atlas) {
  return {
    schemaVersion: 1,
    generatedAt: atlas.generatedAt,
    totalEntries: atlas.entries.length,
    candidateEntries: atlas.entries.filter((entry) => entry.status === 'candidate').length,
    publishedMatches: atlas.entries.filter((entry) => entry.localLexemeId).length,
    counts: atlas.stats,
    entries: atlas.entries.map(({ sourceEvidence, sourceDefinition, ...entry }) => ({
      ...entry,
      sourceDefinition,
      sourceIds: [...new Set(sourceEvidence.map(({ sourceId }) => sourceId))],
    })),
  }
}
```

Write the full artifact, thin index, and per-record files only after `validateVisualAtlas(atlas)` returns no errors. Use temporary files plus rename for every output.

- [ ] **Step 4: Rebuild and verify**

Run:

```powershell
npm run atlas:build
node --test tests/visual-atlas-data.test.mjs
```

Expected: all Atlas tests pass; 419 record endpoints exist; thin index stays below 750 KB raw.

### Task 2: Build the unified Atlas catalog module

**Files:**
- Create: `demo/src/lib/atlas-catalog.js`
- Create: `demo/tests/atlas-catalog.test.mjs`

- [ ] **Step 1: Write failing catalog tests**

Cover:

```js
const catalog = createAtlasCatalog({ lexemes: ENTRIES, records: atlas.entries })
assert.deepEqual(catalog.counts(), { published: 62, candidates: 417, total: 479 })
assert.equal(catalog.get('atlas-motion-design-phenomenon-spring')?.kind, 'candidate')
assert.equal(catalog.query({ q: 'Bento Grid' }).items[0].kind, 'published')
assert.equal(catalog.query({ status: 'candidate', axis: 'component' }).items.every((x) => x.kind === 'candidate'), true)
assert.equal(catalog.query({ page: 2 }).items.length, 24)
```

Also assert all `localLexemeId` atlas rows fold into their Published Lexeme and do not increase result count.

- [ ] **Step 2: Run and confirm missing-module failure**

Run: `node --test tests/atlas-catalog.test.mjs`  
Expected: `ERR_MODULE_NOT_FOUND` for `atlas-catalog.js`.

- [ ] **Step 3: Implement normalized view models**

Expose only:

```js
export function createAtlasCatalog({ lexemes, records }) {
  return {
    query(state) {},
    get(id) {},
    counts() {},
    facets(state) {},
  }
}
```

Normalize search text once. Rank exact name/alias, prefix, all-token match, then definition. Filter status, axis, type, domain, scene, and source by intersection. Return 24 items/page plus `page`, `pageCount`, `from`, `to`, and `total`.

- [ ] **Step 4: Run tests and benchmark**

Run:

```powershell
node --test tests/atlas-catalog.test.mjs
```

Expected: PASS; a 100-iteration query benchmark over 479 normalized records has p95 below 5 ms.

### Task 3: Add query-state routing

**Files:**
- Create: `demo/src/lib/atlas-route-state.js`
- Create: `demo/tests/atlas-route-state.test.mjs`
- Modify: `demo/src/router.js`

- [ ] **Step 1: Write failing round-trip tests**

```js
const state = {
  mode: 'atlas', q: 'prompt composer', status: 'candidate', axis: 'component',
  type: 'component', domain: 'digital-product', scene: 'agent-gui', source: 'assistant-ui', page: 3,
}
assert.deepEqual(parseAtlasState(serializeAtlasState(state)), state)
assert.deepEqual(parseHash('#/atlas/atlas-component-component-composer'), {
  view: 'atlas', id: 'atlas-component-component-composer', query: {},
})
```

- [ ] **Step 2: Run and confirm missing-module failure**

Run: `node --test tests/atlas-route-state.test.mjs`.

- [ ] **Step 3: Implement pure helpers and export router parsing**

Hash parsing must split the query string before path segments and return `query: Object.fromEntries(new URLSearchParams(...))`. `go()` and `url()` keep their existing behavior.

- [ ] **Step 4: Run router and shell tests**

Run: `node --test tests/atlas-route-state.test.mjs tests/shell-contract.test.mjs`  
Expected: PASS; existing curation default remains unchanged.

### Task 4: Define neutral design domains and scenes

**Files:**
- Create: `demo/src/data/design-domains.js`
- Create: `demo/tests/design-domains.test.mjs`

- [ ] **Step 1: Write failing neutrality tests**

```js
assert.equal(DESIGN_DOMAINS.length, 8)
assert.equal(ROOT_DISCOVERY_METHODS.length, 4)
assert.equal(ROOT_DISCOVERY_METHODS.some((method) => /Agent GUI/i.test(method.label)), false)
const digital = DESIGN_DOMAINS.find(({ id }) => id === 'digital-product')
assert.ok(digital.scenes.some(({ id }) => id === 'agent-gui'))
assert.equal(DESIGN_DOMAINS[0].id === 'agent-gui', false)
```

- [ ] **Step 2: Run and confirm missing-data failure**

Run: `node --test tests/design-domains.test.mjs`.

- [ ] **Step 3: Implement the data**

Define the eight broad domains from the approved spec. Each scene carries `id`, `labelZh`, `labelEn`, `queryState`, and `anatomyStatus`. Agent GUI is nested under `digital-product`; domains with no evidence use `coverageStatus: 'gap'` and never receive guessed counts.

- [ ] **Step 4: Run data tests**

Expected: all neutrality and uniqueness assertions pass.

### Task 5: Preserve the executable lexeme browser as an explicit mode

**Files:**
- Create: `demo/src/components/lexicon/PublishedLexicon.jsx`
- Modify: `demo/src/views/Lexicon.jsx`
- Create: `demo/tests/lexicon-discovery-contract.test.mjs`

- [ ] **Step 1: Write the failing root contract**

Read `Lexicon.jsx` and assert:

```js
assert.match(source, /<DiscoveryHub/)
assert.match(source, /mode === 'published'/)
assert.doesNotMatch(source, /useState\(ORDER_IDS\[0\]\)/)
assert.doesNotMatch(source, /<DemoFrame/)
assert.doesNotMatch(source, /Agent GUI/)
```

Assert `PublishedLexicon.jsx` still contains `DemoFrame`, arrow navigation, the five-axis tree, and `go('entry/...')`, but contains no `<main>` element.

- [ ] **Step 2: Run and verify failure against the current Bento-default view**

Run: `node --test tests/lexicon-discovery-contract.test.mjs`  
Expected: FAIL because `Lexicon.jsx` still selects Bento Grid by default.

- [ ] **Step 3: Move existing browser into `PublishedLexicon`**

Copy the current behavior unchanged, replace nested `<main className="stage">` with `<section className="stage">`, and render it only for `mode=published`.

- [ ] **Step 4: Make `Lexicon` an orchestrator**

`Lexicon` reads `route.query`, defaults to `mode='discover'`, and renders `DiscoveryHub`, `AtlasExplorer`, scene library, or `PublishedLexicon` explicitly. No live specimen mounts in discover mode.

- [ ] **Step 5: Run contract and regression tests**

Run: `node --test tests/lexicon-discovery-contract.test.mjs tests/lexicon-integrity.test.mjs`.

### Task 6: Implement the neutral Discovery Hub

**Files:**
- Create: `demo/src/components/lexicon/DiscoveryHub.jsx`
- Create: `demo/src/styles/lexicon-atlas.css`
- Extend: `demo/tests/lexicon-discovery-contract.test.mjs`

- [ ] **Step 1: Add failing SSR/source assertions**

Require the four exact methods:

```text
知道名称或能描述
知道自己在做什么
知道它属于哪类现象
想系统补全见识
```

Require `62 个可运行正式词条` and `417 个来源图鉴候选`. Assert the default markup contains no `Agent GUI`, `Bento Grid`, `.demo-frame`, or selected scene.

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/lexicon-discovery-contract.test.mjs`.

- [ ] **Step 3: Implement `DiscoveryHub`**

Render one search input, the numbered method list, eight broad domains, and five controlled axes. Methods call a single `onNavigate(state)` callback. Domain scenes remain collapsed until their parent domain is activated.

- [ ] **Step 4: Add route-scoped CSS**

Use `.lex-discovery` scope only. Desktop is a two-column editorial layout; mobile order is search, methods, domains, axes. All buttons/links are at least 44px. Do not add styles to the Oreo production override section.

- [ ] **Step 5: Run contract and build**

Run:

```powershell
node --test tests/lexicon-discovery-contract.test.mjs
npm run build
```

### Task 7: Implement Atlas Explorer

**Files:**
- Create: `demo/src/components/lexicon/AtlasExplorer.jsx`
- Extend: `demo/tests/lexicon-discovery-contract.test.mjs`

- [ ] **Step 1: Add failing component contracts**

Require fetch of `/data/visual-atlas-index.json`, `useDeferredValue`, the five facets, 24-item pagination, Published/Candidate labels, machine-translation label, and zero-state copy. Forbid `DemoFrame`, `CopyBtn`, Spec, and board operations from the component source.

- [ ] **Step 2: Run and confirm missing-component failure**

Run: `node --test tests/lexicon-discovery-contract.test.mjs`  
Expected: FAIL because `AtlasExplorer.jsx` does not exist and no thin index is loaded by the lexicon route.

- [ ] **Step 3: Implement load, query, and URL updates**

Load the thin index on entry, call `createAtlasCatalog`, and update hash query state through `go()` without resetting unrelated fields. Exact atlas matches attach evidence to Published results and do not create a Candidate row.

- [ ] **Step 4: Implement honest result groups**

Published results render first in a compact executable-results block. Candidates render as dense rows with English name, machine Chinese name, `机译`, axis/type, source count, and evidence link. Pagination is top and bottom, with distinct landmark labels and focus restoration.

- [ ] **Step 5: Run tests and browser interaction checks**

Verify exact search, zero search, each facet, page 2, back/forward state restoration, and 390px no-overflow.

### Task 8: Add Candidate evidence routes

**Files:**
- Create: `demo/src/views/AtlasRecord.jsx`
- Modify: `demo/src/App.jsx`
- Modify: `demo/src/router.js`
- Extend: `demo/tests/shell-contract.test.mjs`
- Extend: `demo/tests/lexicon-discovery-contract.test.mjs`

- [ ] **Step 1: Write failing route and source-safety tests**

Require `route.view === 'atlas'`, the global “词典” match set to include `atlas`, and fetch of `/atlas/${id}.json`. Forbid `DemoFrame`, Spec, Agent-delivery, and board calls from `AtlasRecord.jsx`.

- [ ] **Step 2: Run and confirm failure**

Run:

```powershell
node --test tests/atlas-route-state.test.mjs tests/lexicon-discovery-contract.test.mjs tests/shell-contract.test.mjs
```

Expected: FAIL because the `atlas` view, evidence component, and lexicon navigation match do not exist.

- [ ] **Step 3: Implement evidence view**

Show source English, `机译` Chinese, axis/type, scenes/bindings, original source definition, source URL/license/revision/date, and exact Published match link. Provide loading/error/not-found states and a back link that preserves the prior query.

- [ ] **Step 4: Run route and full tests**

Run: `node --test tests/*.test.mjs`.

### Task 9: Responsive and final verification

**Files:**
- Modify: `docs/verification/2026-08-31-vislexicon-continuation-acceptance.md`
- Create: `docs/verification/images/lexicon-discovery-1280x900.png`
- Create: `docs/verification/images/lexicon-discovery-390x844.png`
- Create: `docs/verification/images/atlas-explorer-1280x900.png`
- Create: `docs/verification/images/atlas-explorer-390x844.png`

- [ ] **Step 1: Run all automated gates**

```powershell
node --test tests/*.test.mjs
npm run lint
npm run build
```

Expected: zero test failures, lint exit 0 with no new warnings, production build success.

- [ ] **Step 2: Browser verification**

At 1280 and 390 verify:

- default route has no selected scene/term/demo;
- Agent GUI is absent from root and appears only after opening Digital product interfaces;
- mobile first screen shows search and neutral methods;
- search/facets/pagination/URL restoration work;
- Candidate page contains evidence only;
- no horizontal overflow or console errors.

- [ ] **Step 3: Save screenshots and update acceptance evidence**

Record exact Published/Candidate counts, thin-index size, final bundle sizes, test count, and the deliberate Oreo inactive-navigation contrast exception.
