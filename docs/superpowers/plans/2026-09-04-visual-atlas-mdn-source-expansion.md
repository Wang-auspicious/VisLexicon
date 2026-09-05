# Visual Atlas MDN Source Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use the test-driven-development workflow and execute this plan inline. This workspace is not a Git repository; every checkpoint uses tests, hashes, and file inventories instead of commits.

**Goal:** Resume the interrupted content-first Atlas work by adding the already-implemented MDN CSS collector as a complete, traceable 751-record source without changing page layout.

**Architecture:** Preserve the live first-party MDN records as one immutable raw snapshot, classify each record through a deterministic pure function, cache machine translations, and rebuild the generated Atlas artifacts. The batch deliberately increases the candidate corpus before stage routing; no record is promoted to a published lexeme merely because it was collected.

**Tech Stack:** Node.js ESM, Node test runner, existing GitHub/MDN collectors, Google Translate cache, Vite/oxlint.

---

### Task 1: Lock the MDN source and classification contracts

**Files:**
- Modify: `demo/tests/visual-atlas-data.test.mjs`
- Modify: `demo/tests/visual-atlas-parsers.test.mjs`
- Modify: `demo/scripts/build-visual-atlas.mjs`

- [x] Add `['mdn-css', 751]` to the fixed raw-source inventory and update the raw-record conservation expectation from `1555` to `2306`.
- [x] Add failing unit assertions for representative MDN records:

```js
assert.deepEqual(classifySourceRecord('mdn-css', { termEn: 'animation', sourceCategory: 'css-shorthand-property' }), {
  axis: 'motion', recordType: 'design-phenomenon',
})
assert.deepEqual(classifySourceRecord('mdn-css', { termEn: 'grid-template-columns', sourceCategory: 'css-property' }), {
  axis: 'layout', recordType: 'design-phenomenon',
})
assert.deepEqual(classifySourceRecord('mdn-css', { termEn: ':focus-visible', sourceCategory: 'css-pseudo-class' }), {
  axis: 'interaction', recordType: 'design-phenomenon',
})
assert.deepEqual(classifySourceRecord('mdn-css', { termEn: 'box-shadow', sourceCategory: 'css-property' }), {
  axis: 'aesthetic', recordType: 'design-phenomenon',
})
assert.deepEqual(classifySourceRecord('mdn-css', { termEn: '@media', sourceCategory: 'css-at-rule' }), {
  axis: 'layout', recordType: 'pattern',
})
```

- [x] Run the focused tests and confirm RED because `classifySourceRecord` is not exported and `mdn-css.raw.json` does not yet exist.
- [x] Export `classifySourceRecord(sourceId, record)` and implement MDN mapping with explicit motion, layout, and interaction name sets/prefixes; default visual CSS properties and pseudo-elements to `aesthetic`. Selectors, combinators, and at-rules are `pattern`; properties and pseudo states are `design-phenomenon`.
- [x] Re-run the pure classification assertions and keep the inventory test red only for the missing raw snapshot.

### Task 2: Persist the first-party MDN snapshot

**Files:**
- Create: `demo/data/visual-atlas-sources/mdn-css.raw.json`

- [x] Run `node scripts/collect-web-atlas.mjs mdn-css`.
- [x] Verify exactly 751 records, seven source categories, unique `sourceRecordId` values, revision `366bcbeeeb196a0bc34eaa4e6cdbf244c4ee8354` or a newer 40-character commit, retrieval date `2026-09-04`, and `CC-BY-SA-2.5` provenance.
- [x] Re-run the raw-source test and confirm its MDN inventory assertions pass while translation coverage remains red.

### Task 3: Complete translation and build integration

**Files:**
- Modify: `demo/scripts/translate-visual-atlas.mjs`
- Modify: `demo/scripts/build-visual-atlas.mjs`
- Modify (generated): `demo/data/visual-atlas-translations.zh.json`

- [x] Add `mdn-css` to both hard allowlists.
- [x] Run `node scripts/translate-visual-atlas.mjs`; require zero failures and exact cache-key coverage for every non-native MDN term and definition.
- [x] Derive `generatedAt` from the maximum `source.retrievedAt` across counted and coverage snapshots instead of the stale hard-coded `2026-08-31`.
- [x] Run `node scripts/build-visual-atlas.mjs` and record source, merged-entry, axis, type, candidate, and published counts.

### Task 4: Remove stale count assumptions and verify generated outputs

**Files:**
- Modify: `demo/tests/visual-atlas-data.test.mjs`
- Modify (generated): `demo/src/data/visual-atlas.json`
- Modify (generated): `demo/public/data/visual-atlas-index.json`
- Create/modify (generated): `demo/public/atlas/atlas-*.json`

- [x] Keep the fixed per-source count and total `2306` as the source snapshot contract, while deriving entry/index/status assertions from the rebuilt artifact.
- [x] Raise the thin-index byte ceiling only if the real 751-record addition exceeds the old bound; set the smallest measured ceiling with limited headroom.
- [x] Run `npm run atlas:test`, `node --test tests/stage-index.test.mjs`, `npm run lint`, and `npm run build`.
- [x] Hash the raw snapshot, translation cache, full Atlas, and public index; verify a second Atlas build is byte-identical.

### Task 5: Record the continuation checkpoint

**Files:**
- Create: `docs/verification/2026-09-04-visual-atlas-mdn-source-expansion.md`
- Modify: `HANDOFF-2026-09-02.md`

- [x] Record the exact before/after counts, source revision, licenses, hashes, test outputs, and the deliberate remaining gap: stage routing is not part of this source-first batch.
- [x] Name the next content-first source families from the approved master taxonomy, but do not invent records or alter the frozen layout.
