# Visual Atlas Data Pipeline Design

## Goal

Produce at least 400 counted, deduplicated Visual Atlas Records from traceable first-party visual or interaction sources, while preserving the boundary between an Atlas Candidate and a Published Lexeme. AI Interaction Atlas records remain available as non-counted coverage dimensions. The checked-in launch artifact is `demo/src/data/visual-atlas.json`; no existing UI or CSS consumes it in this task.

## Domain boundary

- A **Visual Atlas Record** is a sourced discovery record, not a finished local demo.
- Every imported item has `status: "candidate"` unless its normalized English name exactly matches an existing local lexeme and the compiler can attach `localLexemeId` without inference.
- A **Design Phenomenon** is medium-independent. Tool-specific names remain **Medium Bindings** or aliases rather than duplicate canonical records.
- animations.dev derivatives such as Moro, Vikingz, and motion-vocabulary are evidence/rendering references on the same source concept. They never create additional candidate rows.
- AI Interaction Atlas is officially a shared language for tasks, actions, operations, data, constraints, and touchpoints, not a UI framework. Its 194 records are stored under `coverageDimensions` with `countedAtlas: false`; they never enter `entries` or `stats.totalEntries`.
- Machine-translated Chinese fields are explicitly marked `translationQuality: "machine"`; the English source label and source summary remain the evidence-bearing fields.

## Source set

The counted release uses eight structured visual/interaction sources with explicit reusable licenses. AI Interaction Atlas is collected separately for coverage:

| Source | Verified records | License | Primary contribution |
|---|---:|---|---|
| animations.dev official `animation-vocabulary` skill | 91 | MIT | Motion, interaction, performance, principles |
| assistant-ui official element documentation | 120 | MIT | Agent GUI components, substates, trust/tool/reasoning surfaces |
| GOV.UK Design System source directories | 72 | MIT | UI components and service/task patterns |
| Vercel AI Elements live catalog | 48 | Apache-2.0 | AI-native components with live registry JSON |
| Prompt Kit public registry UI items | 21 | MIT | AI UI primitives; two composed recipes excluded |
| Loquix custom-elements manifest | 53 | MIT | Framework-agnostic AI chat components |
| WAI-ARIA APG pattern directories | 30 | W3C Software and Document License | Accessible interaction contracts |
| Open UI normalized research topics | 31 | W3C Software and Document License | Component naming, structure, and standards research |
| AI Interaction Atlas coverage dimensions | 194 | Apache-2.0 | Non-counted coverage matrix only |

The counted input pool is 466 records. Exact normalization collisions across the component libraries are expected, but the normalized result must retain at least 400 counted records. AI Interaction Atlas contributes 194 coverage records and zero counted records. If the counted result falls below 400, the compiler fails; it does not reclassify coverage metadata or synthesize records.

## Files and responsibilities

- `demo/tests/visual-atlas-data.test.mjs` — executable data contract, source-count invariants, duplicate rules, and minimum merged count.
- `demo/scripts/visual-atlas/normalize.mjs` — pure normalization, ID construction, axis/record-type mapping, exact duplicate keys, evidence merging.
- `demo/scripts/collect-visual-atlas.mjs` — refresh command that fetches official GitHub source files and emits one checked-in raw snapshot per source.
- `demo/scripts/build-visual-atlas.mjs` — deterministic offline compiler from raw snapshots to the merged artifact.
- `demo/data/visual-atlas-sources/animations-dev.raw.json` — 91 source records.
- `demo/data/visual-atlas-sources/assistant-ui.raw.json` — 120 source records.
- `demo/data/visual-atlas-sources/govuk-design-system.raw.json` — 72 source records.
- `demo/data/visual-atlas-sources/ai-elements.raw.json` — 48 live component records.
- `demo/data/visual-atlas-sources/prompt-kit.raw.json` — 21 UI registry records.
- `demo/data/visual-atlas-sources/loquix.raw.json` — 53 custom elements.
- `demo/data/visual-atlas-sources/wai-aria-apg.raw.json` — 30 patterns.
- `demo/data/visual-atlas-sources/open-ui.raw.json` — 31 normalized research topics.
- `demo/data/visual-atlas-sources/ai-interaction-atlas.coverage.raw.json` — 194 non-counted coverage records.
- `demo/data/visual-atlas-translations.zh.json` — checked-in translation cache keyed by source record identity and English source text.
- `demo/src/data/visual-atlas.json` — merged, stable, importable Visual Atlas artifact.

## Raw snapshot contract

Each raw snapshot contains source metadata plus records that preserve source-owned text:

```json
{
  "source": {
    "id": "animations-dev",
    "name": "animations.dev Animation Vocabulary",
    "url": "https://animations.dev/vocabulary",
    "license": "MIT",
    "retrievedAt": "2026-08-31",
    "revision": "git commit recorded by the collector",
    "verifiedCount": 91
  },
  "records": [
    {
      "sourceRecordId": "fade-in-fade-out",
      "termEn": "Fade in / Fade out",
      "sourceDefinition": "Element appears or disappears by changing opacity.",
      "sourceCategory": "Entrances & Exits",
      "sourceUrl": "https://animations.dev/vocabulary#entrances-and-exits",
      "sourcePath": "skills/animation-vocabulary/SKILL.md"
    }
  ]
}
```

The collector never writes a record without `sourceRecordId`, `termEn`, `sourceDefinition` or a conservative source summary, and a resolvable `sourceUrl` or `sourcePath`.

## Merged Visual Atlas Record contract

```json
{
  "id": "atlas-motion-design-phenomenon-fade-in-fade-out",
  "termEn": "Fade in / Fade out",
  "termZh": "淡入 / 淡出",
  "definitionZh": "元素通过透明度变化出现或消失。",
  "sourceDefinition": "Element appears or disappears by changing opacity.",
  "axis": "motion",
  "recordType": "design-phenomenon",
  "aliases": [],
  "scenes": [],
  "mediaBindings": [],
  "status": "candidate",
  "countedAtlas": true,
  "translationQuality": "machine",
  "sourceEvidence": [
    {
      "sourceId": "animations-dev",
      "sourceRecordId": "fade-in-fade-out",
      "url": "https://animations.dev/vocabulary#entrances-and-exits",
      "license": "MIT",
      "retrievedAt": "2026-08-31",
      "revision": "git commit recorded by the collector"
    }
  ]
}
```

`localLexemeId` is optional and is present only after an exact match to `demo/src/entries.js`. `sourceDefinition` remains English and evidence-bearing; `definitionZh` is a presentation translation.

## Mapping rules

### animations.dev

- `recordType`: `design-phenomenon` except performance/principle categories, which become `pattern`.
- `axis`: `motion` for animation mechanics and performance; `interaction` for Feedback & Interaction; `aesthetic` only for purely visual polish effects.
- `scenes` and `mediaBindings` stay empty unless explicitly named by the source definition.

### AI Interaction Atlas coverage

- All 194 records retain their official six dimensions and source metadata under top-level `coverageDimensions`.
- Every coverage record has `countedAtlas: false` and never receives Atlas status or `localLexemeId`.
- Tasks, constraints, data types, and touchpoints may seed later visual candidates only after a separate GUI source proves an observable component, state, or interaction contract.

### assistant-ui

- Each `apps/docs/content/elements/*.mdx` page becomes one `component` or `pattern` candidate.
- Frontmatter title and description are authoritative. The source path and Git revision are evidence.
- Element names containing composer, message, thread, tool, reasoning, approval, citation, source, attachment, model, agent, or artifact receive the `agent-gui` scene; no other scene is inferred.

### Vercel AI Elements, Prompt Kit, and Loquix

- AI Elements uses the 48 live `/components/{slug}` pages and corresponding `/api/registry/{slug}` JSON; the repository-only unpublished `question` component is excluded.
- Prompt Kit imports only the 21 `registry:ui` records; `chatbot` and `tool-calling` composed recipes are excluded.
- Loquix imports 53 unique `tagName` declarations from `custom-elements.json`; React wrappers, stories, and define files are excluded.
- All three sources map to `component` records in the `component` axis and carry the `agent-gui` scene.

### WAI-ARIA APG and Open UI

- APG contributes 30 named interaction patterns with source-owned pattern summaries.
- Open UI contributes 31 normalized research topics; multiple research/explainer files for one base topic remain one raw record with multiple source paths in metadata.
- These sources provide component/interaction semantics, not visual styling or local executable demos.

### GOV.UK Design System

- `src/components/{slug}` records become `component` candidates.
- `src/patterns/{slug}` records become `pattern` candidates.
- The first source-owned description or metadata summary is retained. If a directory lacks a source-owned description, its label may still be included only when the official index page provides a summary; otherwise collection fails for that item.

## Deduplication and stable IDs

1. Normalize Unicode with NFKC, lowercase, replace `&` with `and`, collapse punctuation and whitespace, and singularize nothing.
2. Build an exact duplicate key from `normalizedTermEn + recordType + axis`.
3. Exact collisions merge `sourceEvidence`, aliases, explicit scenes, explicit medium bindings, and source metadata; the first-party definition with the most specific source path remains `sourceDefinition`.
4. Similar but non-identical names remain separate Atlas Candidates for editorial review. The compiler does not use embeddings or fuzzy merge.
5. Stable ID format is `atlas-{axis}-{recordType}-{normalized-term}`. A deterministic numeric suffix is used only for same-key semantic conflicts that cannot be merged.

This rule intentionally prefers false negatives in deduplication over false positives that erase meaningful distinctions.

## Translation

The collector/compiler never invents Chinese source evidence. English `termEn` and `sourceDefinition` are always retained. Chinese fields are read from `visual-atlas-translations.zh.json`; refresh tooling may call the same public Google Translate endpoint already used by the repository, then stores the result with `translationQuality: "machine"`. Missing translations fail the final build instead of falling back to English in `termZh` or `definitionZh`.

## Error handling and integrity gates

- A raw snapshot fails validation when `records.length !== source.verifiedCount`.
- Duplicate `sourceRecordId` values fail collection.
- Missing source evidence, English term, or source summary fails collection.
- Network refresh failure leaves existing snapshots untouched.
- The offline build fails when counted entries are below 400, IDs are not unique, AI Interaction Atlas appears in counted `entries`, a derivative animation source appears as its own record, or a machine translation lacks its quality marker.
- Every source snapshot records a repository revision so later refreshes can be diffed.

## Testing

Tests run with Node's built-in test runner and verify:

1. The eight counted raw files have counts 91, 120, 72, 48, 21, 53, 30, and 31; the coverage file has 194 records and is explicitly non-counted.
2. Every raw item contains its source identity and source-owned text.
3. Exact duplicates merge evidence instead of creating two records.
4. Same label across different record types or axes remains separate.
5. animations.dev derivative evidence never increases record count.
6. Every merged record satisfies the Visual Atlas Record schema and candidate/published boundary.
7. The final artifact contains at least 400 counted unique IDs, while all 194 AI Interaction Atlas records remain under non-counted `coverageDimensions`.
8. The compiler is deterministic: two runs from the same snapshots produce byte-identical JSON.

## Out of scope

- Rendering or wiring the atlas into existing pages.
- Editing any UI or CSS.
- Promoting candidates to Published Lexemes without local executable specimens and acceptance evidence.
- Semantic/fuzzy deduplication.
- Copying proprietary or unlicensed competitor definitions into the import corpus.
