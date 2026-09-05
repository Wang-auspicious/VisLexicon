# VisLexicon Neutral Visual Atlas Discovery Design

**Date:** 2026-08-31  
**Status:** approved by user direction — implement  
**Supersedes:** `2026-08-31-visual-atlas-discovery-ui-design.md`  
**Fact baseline:** 62 Published Lexemes, 419 counted Visual Atlas Records, 194 non-counted Coverage Dimensions

## 1. Corrected product decision

The default dictionary route must not open Agent GUI, Bento Grid, or any other particular scene, medium, term, or specimen. The default is a neutral discovery hub that asks what the user knows and how they want to find the design concept.

Scene Anatomy is a discovery method. Agent GUI is one optional scene inside the scene library. Neither defines the root information architecture.

## 2. Default route

`#/lexicon` opens `DiscoveryHub` with no selected term and no running specimen.

The page states two separate facts:

- `62 个可运行正式词条`
- `417 个来源图鉴候选` (the 2 exact atlas matches fold into Published Lexemes)

It does not add these into one “finished entries” number.

The primary question is:

> 你现在知道什么？

Four neutral entry methods follow as an editorial numbered list, not a card grid:

1. **知道名称或能描述** — global name/alias/definition search
2. **知道自己在做什么** — choose a design domain or scene
3. **知道它属于哪类现象** — browse the five controlled axes
4. **想系统补全见识** — open the complete Visual Atlas Explorer

No method is preselected.

## 3. Design-domain library

The scene library is grouped by broad design need, not by the currently richest dataset:

- Digital product interfaces
- Websites and landing pages
- Mobile applications
- Presentations and slides
- Graphic and image design
- Motion and video
- Brand and marketing
- Data and information visualization

Each domain shows its current evidence-backed count. A zero or incomplete domain is shown honestly as `待扩充`, not hidden and not populated with guessed records.

Agent GUI appears only after opening `Digital product interfaces`, alongside dashboard, editor, document, commerce, media, and other product scenes. It is never rendered at root level as the recommended/default path.

## 4. Result surfaces

### 4.1 Published Lexemes

Published Lexemes keep their existing executable specimen, detail route, Autopsy, Agent prompt, and Spec actions. They carry `■ 可运行词条`.

### 4.2 Atlas Candidates

Candidates carry `○ 图鉴候选` and visibly mark machine Chinese fields as `机译`. They show only evidence-backed metadata and source links. They never invent thumbnails, demos, parameters, code, or Spec actions.

Exact `localLexemeId` matches fold into the Published Lexeme as source evidence and do not render twice.

## 5. Atlas Explorer

Search and all non-scene browsing use one deep catalog module:

```js
createAtlasCatalog({ lexemes: ENTRIES, records })
  .query(state)
  .get(id)
  .counts()
```

Search covers English/Chinese names, aliases, source definitions, machine translations, axis, type, scene, and source. Ranking is exact name/alias, prefix, all-token metadata, then definition match. Published wins only as the final tie-breaker.

Facets:

- publication status
- five-axis classification
- record type
- design domain / scene
- source

Results use 24 items per page and serialize `q`, `status`, `axis`, `type`, `domain`, `scene`, `source`, and `page` in the URL.

## 6. Five-axis entry

The five axes remain Layout, Interaction, Aesthetic, Motion, and Component. Toolkit stays an appendix and is not promoted into a sixth design axis.

Each axis reports Published and Candidate counts separately. Selecting an axis opens Atlas Explorer filtered to that axis; it does not auto-open the first lexeme.

## 7. Scene Anatomy

Scene Anatomy is available only after the user selects a scene that has a curated anatomy. The scene library can contain scenes without anatomy, but those route to a filtered atlas list rather than a fake or empty diagram.

Agent GUI may be the first completed anatomy because its source coverage is strong, but it is labeled as one available anatomy inside its parent domain. Its existence does not change root ordering or visual emphasis.

Spatial hotspots and hierarchy are manually curated. Atlas `scenes` tags can filter records but cannot infer coordinates.

## 8. Empty states

- A zero-result query clears any old specimen.
- If a domain has no sourced records, show the gap and a link to submit sources; do not invent entries.
- If a scene lacks anatomy, show matching atlas records and state that no curated anatomy exists yet.
- If the atlas index fails to load, the 62 Published Lexemes remain searchable.

## 9. Responsive behavior

At 1280px the neutral hub uses a restrained two-column editorial composition: intent methods on the left, live counts/domains on the right. It is not a dashboard and not a tile wall.

At 390px the order is:

1. global search
2. four entry methods
3. broad design domains
4. five axes

The old full directory tree cannot consume the first screen. Filters open in a sheet only after the user enters Explorer. Touch targets are at least 44px and the document never overflows horizontally.

## 10. Performance

- Full `visual-atlas.json` stays out of the initial JavaScript bundle.
- Build generates a thin index with gzip target at most 250 KB and one JSON file per candidate.
- Search text normalizes once on load and query rendering is deferred.
- At most 24 Candidate rows render simultaneously.
- No live demo runs on the neutral root.

## 11. Routing

```text
#/lexicon                     neutral DiscoveryHub
#/lexicon?mode=atlas&...      Atlas Explorer with URL state
#/lexicon?mode=scenes         design-domain / scene library
#/lexicon?mode=published      existing Published Lexeme directory
#/atlas/:recordId             Candidate evidence page
#/entry/:lexemeId             existing Published Lexeme page
```

All lexicon and atlas routes keep the global “词典” navigation item current.

## 12. File boundaries

Create:

- `demo/src/lib/atlas-catalog.js`
- `demo/src/lib/atlas-route-state.js`
- `demo/src/data/design-domains.js`
- `demo/src/components/lexicon/DiscoveryHub.jsx`
- `demo/src/components/lexicon/AtlasExplorer.jsx`
- `demo/src/views/AtlasRecord.jsx`
- `demo/src/styles/lexicon-atlas.css`
- matching Node tests

Modify:

- `demo/src/views/Lexicon.jsx`
- `demo/src/router.js`
- `demo/src/App.jsx`
- Visual Atlas build scripts for thin/per-record outputs

Do not modify:

- `demo/src/views/IndexView.jsx`
- Oreo production card/header CSS
- `demo/src/views/Entry.jsx`

## 13. First implementation slice

This implementation builds the neutral root, unified catalog/search, URL-state Explorer, Published/Candidate result separation, and Candidate evidence route. It includes a truthful scene library with Agent GUI nested under Digital product interfaces, but it does not build any Scene Anatomy diagram yet.

Deferring anatomy is intentional: the architecture error was making one anatomy the default. The neutral discovery model must be correct before adding optional scene-specific diagrams.

## 14. Acceptance tests

- `#/lexicon` renders no selected term, Agent GUI scene, or live demo.
- Agent GUI exists only inside Digital product interfaces scene data.
- The root exposes all four neutral entry methods.
- Unified catalog reports 62 Published Lexemes and 417 unmatched Candidates.
- Exact atlas matches fold into Published records.
- Search ranking, five facets, 24-item pagination, and URL round-trip work.
- Candidate views contain no DemoFrame, Spec, board, or Agent-delivery actions.
- Empty search never leaves Bento Grid or another stale specimen visible.
- 1280px and 390px have no horizontal overflow; 390px first screen starts with search/methods, not the old directory tree.
- Full atlas evidence data is absent from the initial production bundle.

