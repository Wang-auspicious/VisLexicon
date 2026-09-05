# VisLexicon Full-Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a truthful, production-ready VisLexicon whose homepage is an Oreo-faithful external-site curation gallery while the lexicon, autopsy, tools, and submission channels retain their own professional structures.

**Architecture:** Keep the existing React/Vite single-page shell and hash router. Separate testable domain logic into framework-free modules, keep curated content in a validated data module, and use route-scoped CSS so the Oreo visual language cannot leak into professional channels. Static endpoint generation remains the deployable integration layer.

**Tech Stack:** React 19, Vite 8, native CSS, Node.js built-in test runner, static JSON/Markdown endpoints.

---

> Repository note: `D:\Desktop\VisLexicon  视元` has no `.git`, so worktree creation and commit steps are unavailable. Each task ends with a fresh test/build checkpoint instead.

## File map

- `demo/src/App.jsx`, `demo/src/router.js`: global shell, default route, restrained header.
- `demo/src/App.css`: recovered complete component styles plus route-scoped shell/Oreo overrides.
- `demo/src/data/curated-sites.js`: publishable curation records and screenshot provenance.
- `demo/src/lib/curation.js`: pure validation, filtering, and category/stack extraction.
- `demo/src/views/IndexView.jsx`: Oreo-only external-site gallery.
- `demo/src/lib/store-core.js`, `demo/src/store.js`: immutable board operations and browser persistence adapter.
- `demo/src/lib/color-diff.js`, `demo/src/views/Tools.jsx`: image sampling, Lab/CIEDE2000, heatmap and instructions.
- `demo/src/views/{Lexicon,Entry,Compare,Variants}.jsx`, `demo/src/variants.jsx`, `demo/src/autopsy.jsx`: professional dictionary flows.
- `demo/src/{Palette,SpecPanel}.jsx`, `demo/src/views/Submit.jsx`: accessible overlays and honest offline workflows.
- `demo/scripts/gen-endpoints.mjs`: deterministic static endpoints without undefined values.
- `demo/tests/*.test.mjs`: Node-level regression tests.
- `demo/public/shots/<site-id>/*.webp`: three source-specific screenshots per published site.

### Task 1: Restore the full style baseline and lock the shell contract

**Files:**
- Replace: `demo/src/App.css` from Claude history snapshot `33794446abd8e2e8@v5`
- Modify: `demo/src/App.jsx`
- Modify: `demo/src/router.js`
- Create: `demo/tests/shell-contract.test.mjs`

- [ ] **Step 1: Write the failing shell contract test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('shell defaults to curation and preserves the measured header tokens', () => {
  const router = readFileSync(new URL('../src/router.js', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
  assert.match(router, /seg \|\| 'index'/)
  assert.match(css, /--shell-header-height:\s*80px/)
  assert.match(css, /--shell-gutter:\s*36px/)
})
```

- [ ] **Step 2: Run `node --test tests/shell-contract.test.mjs` from `demo/` and confirm it fails because the current default is `lexicon` and the tokens do not exist.**
- [ ] **Step 3: Restore the 2,358-line CSS snapshot, then append one clearly labelled `VISLEXICON 2026 PRODUCTION OVERRIDES` section instead of deleting legacy module styles.**
- [ ] **Step 4: Change the empty hash route to `index`, simplify the top navigation to text-first controls, and keep search/theme/Spec as secondary actions with accessible labels.**
- [ ] **Step 5: Run the shell test and `npm run build`; record output before moving on.**

### Task 2: Create validated curation data and genuine screenshot provenance

**Files:**
- Create: `demo/src/data/curated-sites.js`
- Create: `demo/src/lib/curation.js`
- Create: `demo/tests/curation.test.mjs`
- Create: `demo/public/shots/<site-id>/01.webp`
- Create: `demo/public/shots/<site-id>/02.webp`
- Create: `demo/public/shots/<site-id>/03.webp`

- [ ] **Step 1: Write tests for the desired data contract.**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { CURATED_SITES } from '../src/data/curated-sites.js'
import { validateCuratedSites, filterCuratedSites } from '../src/lib/curation.js'

test('every published site has three unique source-specific screenshots', () => {
  assert.deepEqual(validateCuratedSites(CURATED_SITES), [])
  for (const site of CURATED_SITES) {
    assert.equal(new Set(site.shots.map((shot) => shot.src)).size, 3)
    assert.ok(site.shots.every((shot) => shot.src.includes(`/shots/${site.id}/`)))
    assert.ok(site.shots.every((shot) => new URL(shot.sourceUrl).hostname === new URL(site.site).hostname))
  }
})

test('combined filtering intersects purpose, stack, and query', () => {
  const result = filterCuratedSites(CURATED_SITES, { category: '组件库', stack: 'React', query: 'motion' })
  assert.ok(result.length > 0)
  assert.ok(result.every((site) => site.category === '组件库' && site.stacks.includes('React')))
})
```

- [ ] **Step 2: Run the test and confirm it fails because the modules do not exist.**
- [ ] **Step 3: Implement `validateCuratedSites` to report duplicate IDs, non-HTTPS URLs, wrong shot count, repeated/cross-site paths, hostname-mismatched provenance, and empty metadata.**
- [ ] **Step 4: Implement `filterCuratedSites` as a case-insensitive intersection across category, stack, name, pricing, themes, and descriptive keywords.**
- [ ] **Step 5: Capture three distinct real pages/sections per candidate source site. Publish only candidates that pass provenance and asset checks; omit blocked sites rather than reusing another image.**
- [ ] **Step 6: Run `node --test tests/curation.test.mjs` and inspect every produced image contact sheet.**

### Task 3: Rebuild the curation gallery against measured Oreo geometry

**Files:**
- Modify: `demo/src/views/IndexView.jsx`
- Modify: `demo/src/App.css`
- Extend: `demo/tests/shell-contract.test.mjs`

- [ ] **Step 1: Extend the CSS contract test to require the exact desktop tokens.**

```js
assert.match(css, /--oreo-page:\s*#f9f9f8/)
assert.match(css, /--oreo-board-radius:\s*32px/)
assert.match(css, /--oreo-card-radius:\s*24px/)
assert.match(css, /--oreo-column-gap:\s*9px/)
assert.match(css, /--oreo-row-gap:\s*8px/)
```

- [ ] **Step 2: Run the test and confirm the new assertions fail.**
- [ ] **Step 3: Render cards from `CURATED_SITES`; each card is one anchor and its metadata has exactly three semantic rows. Remove the “Oreo Showcase” imitation brand and all redundant source buttons.**
- [ ] **Step 4: Implement purpose tabs, optional stack chips, search, result count, zero-state, lazy/async images, and descriptive alt text without adding controls inside card anchors.**
- [ ] **Step 5: Implement 1174px/32px/8px board geometry, 380×330/24px cards, 9px columns, 8px rows, 149px right fade and 171px bottom fade. Use two columns at tablet and one at phone sizes.**
- [ ] **Step 6: Make the green theme row a duplicated seamless track; stop animation and expose overflow under reduced motion.**
- [ ] **Step 7: Run the contract test and build, then capture the curation view at 1280, 768, and 390px.**

### Task 4: Make Store, Palette, and Spec workflows deterministic and honest

**Files:**
- Create: `demo/src/lib/store-core.js`
- Create: `demo/tests/store-core.test.mjs`
- Modify: `demo/src/store.js`
- Modify: `demo/src/Palette.jsx`
- Modify: `demo/src/SpecPanel.jsx`
- Modify: `demo/src/App.jsx`

- [ ] **Step 1: Write failing tests for immutable add/update/remove/load behavior.**

```js
test('upsert updates params without removing the board item', () => {
  const one = upsertBoard([], 'spring', { stiffness: 120 })
  const two = upsertBoard(one, 'spring', { stiffness: 180 })
  assert.equal(two.length, 1)
  assert.equal(two[0].params.stiffness, 180)
})

test('normalizeStoredState rejects malformed storage', () => {
  assert.deepEqual(normalizeStoredState('{bad json', 'sepia'), { board: [], theme: 'light' })
})
```

- [ ] **Step 2: Run the tests and confirm they fail because the pure functions do not exist.**
- [ ] **Step 3: Implement `upsertBoard`, `removeBoard`, and `normalizeStoredState`; update `loadStored()` to emit a fresh snapshot immediately. Keep `toggleBoard` only as an explicit compatibility wrapper.**
- [ ] **Step 4: Update Entry/Compare/Key actions to call explicit save/remove operations so a changed parameter set can be saved without accidental deletion.**
- [ ] **Step 5: Give Palette real dialog semantics, focus capture/restore, guarded active-index arithmetic for zero results, and labelled keyboard behavior.**
- [ ] **Step 6: Replace fake Agent delivery state in SpecPanel with truthful Copy JSON / Download JSON / Copy agent prompt actions unless a real endpoint is configured.**
- [ ] **Step 7: Run Store tests and browser keyboard checks for `Cmd/Ctrl+K`, arrows, Enter, and Escape.**

### Task 5: Implement a real perceptual Diff tool and remove runtime crashes

**Files:**
- Create: `demo/src/lib/color-diff.js`
- Create: `demo/tests/color-diff.test.mjs`
- Modify: `demo/src/views/Tools.jsx`
- Modify: `demo/src/App.css`

- [ ] **Step 1: Write known-reference conversion and CIEDE2000 tests.**

```js
test('CIEDE2000 is zero for identical colors', () => {
  assert.equal(deltaE2000(rgbToLab([255, 0, 0]), rgbToLab([255, 0, 0])), 0)
})

test('CIEDE2000 matches a published Sharma pair', () => {
  assert.ok(Math.abs(deltaE2000([50, 2.6772, -79.7751], [50, 0, -82.7485]) - 2.0425) < 0.0001)
})
```

- [ ] **Step 2: Run the tests and confirm missing-module failure.**
- [ ] **Step 3: Implement sRGB linearization, XYZ D65, Lab conversion, CIEDE2000, and a pure `summarizeDiff(cells)` sorter.**
- [ ] **Step 4: Sample both images to the same fixed grid, render every cell as an intensity heatmap, compute mean/P95/max ΔE, and generate instructions from `hotCells.slice(0, 5).map(...)` without the erroneous extra array wrapper.**
- [ ] **Step 5: Add invalid image/size/error states and revoke temporary object URLs. Do not claim pixel-perfect comparison when browsers have rescaled input.**
- [ ] **Step 6: Run color tests, lint, build, and a manual two-image comparison.**

### Task 6: Repair dictionary family, variants, comparison, autopsy, and endpoints

**Files:**
- Modify: `demo/src/views/Lexicon.jsx`
- Modify: `demo/src/views/Entry.jsx`
- Modify: `demo/src/views/Compare.jsx`
- Modify: `demo/src/views/Variants.jsx`
- Modify: `demo/src/variants.jsx`
- Modify: `demo/src/autopsy.jsx`
- Modify: `demo/scripts/gen-endpoints.mjs`
- Create: `demo/tests/lexicon-integrity.test.mjs`
- Create: `demo/tests/endpoints.test.mjs`

- [ ] **Step 1: Write integrity tests that every entry resolves to a non-empty family label, every matrix cell references an existing entry when it is navigable, and generated text contains no `undefined`.**
- [ ] **Step 2: Run the tests and observe the existing family/endpoint failures.**
- [ ] **Step 3: Centralize `familyNameFor(entry)` with `其他` fallback; pass the current entry as `self` to VariantMatrix and make a mapped cell call `go('entry/<id>')`.**
- [ ] **Step 4: Keep independent parameter states in Compare and derive the note from the actual differing parameter keys; do not present unrelated presets as a one-variable experiment.**
- [ ] **Step 5: Derive autopsy duration/easing/transform/keyframe labels from each entry and its current params; show “不适用” when an attribute is not meaningful.**
- [ ] **Step 6: Replace every `e.endpoint` use with `endpointFor(e.id)` and export that helper for the endpoint test.**
- [ ] **Step 7: Run integrity tests, `npm run prebuild`, assert `rg -n "undefined" public/llms*.txt public/lexicon` returns no matches, then build.**

### Task 7: Make submission and global responsive/accessibility behavior truthful

**Files:**
- Modify: `demo/src/views/Submit.jsx`
- Modify: `demo/src/App.css`
- Create: `demo/tests/copy-contract.test.mjs`

- [ ] **Step 1: Write a content contract test that rejects the unsupported success claims `已入队列`, `queued`, and `自动 listed` from Submit.**
- [ ] **Step 2: Run it and confirm it fails against the current form.**
- [ ] **Step 3: Save a validated draft locally, show “已保存在本机，尚未发送”, and provide Download JSON / Copy JSON. Keep a disabled “发送到审核服务” action labelled as unavailable until an endpoint exists.**
- [ ] **Step 4: Add form labels, inline validation, status live region, `:focus-visible`, skip link, 44px phone targets, overflow guards, and reduced-motion rules across all routes.**
- [ ] **Step 5: Run the contract test and manually traverse all routes at 390px with keyboard focus visible.**

### Task 8: Final visual and engineering verification

**Files:**
- Create: `docs/verification/2026-08-30-vislexicon-acceptance.md`
- Create: `docs/verification/images/*.png`

- [ ] **Step 1: Run `node --test tests/*.test.mjs` and record test count/failures.**
- [ ] **Step 2: Run `npm run lint` and record warnings/errors.**
- [ ] **Step 3: Run `npm run build` and record exit code and generated endpoint count.**
- [ ] **Step 4: Capture 1280×900, 768×1024, and 390×844 screenshots for curation plus representative screenshots of dictionary, tools, and submission.**
- [ ] **Step 5: Compare the 1280px curation screenshot against `C:\Users\zjz65\AppData\Local\Temp\oreoui-home-full.png`, recording board width, card dimensions, gaps, radii, colors, fades, and any deliberate product-content deviations.**
- [ ] **Step 6: Inspect all published site screenshots and append a provenance table of site ID, local assets, and source URLs. Remove any record that cannot be proven.**
- [ ] **Step 7: Re-read the design specification line by line and report remaining gaps explicitly; do not call the product complete if any hard requirement is still open.**

