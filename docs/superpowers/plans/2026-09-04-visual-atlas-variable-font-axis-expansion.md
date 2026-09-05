# Visual Atlas Variable Font Axis Expansion Plan

> **For agentic workers:** Execute inline with test-driven development. This workspace is not a Git repository; use tests, hashes, and inventories instead of commits.

**Goal:** Add all 57 current Google Fonts Axis Registry definitions as evidence-backed variable-font-axis candidates without changing the frozen UI.

**Architecture:** Pin the Apache-2.0 official upstream registry revision, treat each `Lib/axisregistry/data/*.textproto` file as one raw observation, and parse only its axis identity, official description, range, default, precision, and presentation flag. Fallback positions and SVG illustrations remain metadata/assets and never inflate the lexeme count.

**Tech Stack:** Node.js ESM, GitHub first-party tree/raw endpoints, Node test runner, isolated Argos translation fallback, oxlint, Vite.

---

### Task 1: Test and implement textproto parsing

**Files:**
- Modify: `demo/tests/visual-atlas-parsers.test.mjs`
- Modify: `demo/scripts/visual-atlas/source-parsers.mjs`

- [x] Write a failing parser test with a multiline description and several fallback blocks.
- [x] Implement `parseGoogleFontsAxisTextproto(source)` and require tag, display name, numeric min/default/max, integer precision, boolean fallback-only, and non-empty description.
- [x] Prove fallback positions do not create records and quoted description fragments join exactly once.

### Task 2: Collect and preserve 57 upstream records

**Files:**
- Modify: `demo/scripts/visual-atlas/web-collectors.mjs`
- Modify: `demo/tests/visual-atlas-data.test.mjs`
- Create: `demo/data/visual-atlas-sources/google-fonts-axis-registry.raw.json`

- [x] Add the source manifest for `googlefonts/axisregistry`, branch `main`, Apache-2.0, exact count 57.
- [x] Fetch the fixed recursive tree, select only top-level axis `.textproto` files, fetch every file, and fail on count/ID/evidence drift.
- [x] Emit `Variable font axis: <display name>`, preserve the four-character tag and display name as aliases, and retain range/default/precision metadata.
- [x] Add `['google-fonts-axis-registry', 57]` to the source inventory and update total records from 2,390 to 2,447; verify RED before collection and GREEN after.

### Task 3: Classify, translate, build, and verify

**Files:**
- Modify: `demo/scripts/build-visual-atlas.mjs`
- Modify: `demo/scripts/translate-visual-atlas.mjs`
- Modify (generated): translation cache, full Atlas, public index, and detail endpoints
- Create: `docs/verification/2026-09-04-visual-atlas-variable-font-axis-expansion.md`
- Modify: `HANDOFF-2026-09-02.md`

- [x] Add a failing classification test, then map the source to aesthetic/design-phenomenon with `font/opentype` and `web/css` bindings.
- [x] Translate only missing SHA keys with zero failures and rebuild.
- [x] Run Atlas, stage, full-suite, targeted/full lint, and Vite build gates.
- [x] Verify two actual rebuilds are byte-identical, then record source revision, 57-record conservation, hashes, counts, and unchanged candidate/routing boundaries.
