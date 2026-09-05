# Visual Atlas Figma Plugin Vocabulary Expansion Plan

> **For agentic workers:** Execute inline with test-driven development. This workspace is not a Git repository; use tests, hashes, and file inventories instead of commits.

**Goal:** Add the 84 current, namespaced Figma Plugin API visual/layout/motion options as a second source-first Atlas batch without touching the frozen UI.

**Architecture:** Parse the current MIT-licensed `figma/plugin-typings` source at a fixed commit. Preserve 14 namespaces so repeated literals such as `CENTER`, `NONE`, and `AUTO` remain distinct concepts. The live revision contains 84 values rather than the dated audit's 82 because primary-axis alignment now also exposes `SPACE_EVENLY` and `SPACE_AROUND`. Emit conservative taxonomy summaries, retain raw literals as aliases, machine-translate candidates, and rebuild deterministic Atlas artifacts.

**Tech Stack:** Node.js ESM, GitHub first-party source, Node test runner, existing offline Argos fallback, oxlint, Vite.

---

### Task 1: Build and test the Figma typings parser

**Files:**
- Modify: `demo/tests/visual-atlas-parsers.test.mjs`
- Modify: `demo/scripts/visual-atlas/source-parsers.mjs`

- [x] Add a failing fixture test covering named union types and interface-property unions, including duplicate literals in separate namespaces.
- [x] Implement `parseFigmaPluginVocabulary(source)` with brace-aware interface extraction and exact quoted-literal extraction.
- [x] Emit stable records named as `<namespace label>: <humanized literal>`, with `sourceMetadata.literal`, `sourceMetadata.namespace`, raw-literal aliases, and `summaryQuality: taxonomy-summary`.
- [x] Verify the parser keeps `Overlay position: Center` distinct from `Primary axis alignment: Center`.

### Task 2: Add the live first-party collector and raw snapshot

**Files:**
- Modify: `demo/scripts/visual-atlas/web-collectors.mjs`
- Modify: `demo/tests/visual-atlas-data.test.mjs`
- Create: `demo/data/visual-atlas-sources/figma-plugin-vocabularies.raw.json`

- [x] Add the Figma manifest with repository `figma/plugin-typings`, branch `master`, MIT license, and exact count 84.
- [x] Add a collector that fixes the current commit, reads `plugin-api.d.ts`, parses all 14 approved namespaces, attaches official Figma documentation URLs, and fails closed on any count drift.
- [x] Add `['figma-plugin-vocabularies', 84]` to the fixed raw-source inventory and update total raw records from 2,306 to 2,390.
- [x] Run the focused tests RED before snapshot creation, then collect and verify 84 unique IDs, 84 complete evidence records, and a 40-character revision.

### Task 3: Classify, translate, and compile

**Files:**
- Modify: `demo/scripts/build-visual-atlas.mjs`
- Modify: `demo/scripts/translate-visual-atlas.mjs`
- Modify (generated): `demo/data/visual-atlas-translations.zh.json`
- Modify (generated): `demo/src/data/visual-atlas.json`
- Modify (generated): `demo/public/data/visual-atlas-index.json`
- Modify (generated): `demo/public/atlas/atlas-*.json`

- [x] Add failing classification tests: blend/text namespaces → aesthetic, constraints/overlay/auto-layout → layout, transition/easing/direction → motion.
- [x] Add the source to compiler/translator allowlists, expose raw literals as aliases, and bind entries to `design/figma-plugin`.
- [x] Fill only missing SHA-key translations using the isolated Argos fallback; require zero failures.
- [x] Rebuild and record exact source, entry, axis, type, and publication counts.

### Task 4: Verify and document

**Files:**
- Create: `docs/verification/2026-09-04-visual-atlas-figma-vocabulary-expansion.md`
- Modify: `HANDOFF-2026-09-02.md`

- [x] Run Atlas tests, stage-index tests, all Node tests, targeted lint, full lint, and Vite build.
- [x] Run two actual Atlas builds and verify raw/cache/full/index hashes remain byte-identical.
- [x] Record source revision, 14 namespace counts, before/after corpus counts, hashes, known machine-translation debt, and the unchanged layout/routing boundary.
