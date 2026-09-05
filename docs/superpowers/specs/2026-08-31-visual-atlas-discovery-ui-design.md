# VisLexicon Visual Atlas Discovery UI Design

**Date:** 2026-08-31  
**Status:** rejected — do not implement  
**Fact baseline:** 62 Published Lexemes, 419 counted Visual Atlas Records, 194 non-counted Coverage Dimensions

## Rejection record

The user rejected this design because it made Agent GUI the default discovery view. Agent GUI was only an example of the Scene Anatomy method and represents one narrow design need among many. The root discovery experience must remain medium- and scenario-neutral; Agent GUI belongs inside a broader scene library and cannot define the default information architecture.

## 1. Goal

Turn the dictionary channel into a scene-first discovery surface where a person can find the correct name even when they do not know what to search for. The interface must expose all 419 sourced atlas records without presenting Atlas Candidates as completed local demos.

The product promise is stated as two separate facts:

- `62 个可运行正式词条`
- `417 个待编辑图鉴候选` plus 2 atlas records folded into their exact Published Lexeme matches

The UI never adds these into a misleading “479 finished entries” number.

## 2. Information architecture

```text
#/lexicon
├─ default: Agent GUI Scene Anatomy
├─ search or facet change: Atlas Explorer
├─ scene deep link: ?scene=agent-gui&part=prompt-composer
│
├─ #/atlas/:recordId   Atlas Candidate evidence page
└─ #/entry/:lexemeId   existing Published Lexeme page
```

The existing curation route, Oreo cards, global header geometry, Entry page, and Spec workflow remain unchanged.

## 3. Discovery modes

### 3.1 Find by position: Scene Anatomy

Scene Anatomy is the default view. It solves the case “I know where the thing is, but I do not know its name.” The first curated scene is Agent GUI.

The full scene contains ten primary hotspots:

1. Session Sidebar
2. Message Turn
3. Streaming Text
4. Thinking Block
5. Tool Call Card
6. Approval Prompt
7. Citation / Source Chip
8. Todo / Task List
9. Artifact Panel
10. Prompt Composer

Selecting Prompt Composer opens a focused anatomy with seven secondary hotspots:

- Composer Editor
- Attachment Bar
- Slash Command Menu
- Mention Popover
- Model / Config Menu
- Token Meter
- Send / Stop Control

Terminal Output belongs under Tool Call Card. Diff Viewer belongs under Artifact Panel. Context Assembly is an invisible mechanism, and Empty State is a state, so neither appears as a spatial hotspot.

Coordinates and parent-child relationships live in manually curated `scene-anatomies.js`. They are never inferred from atlas `scenes` tags.

### 3.2 Find by name or attribute: Atlas Explorer

Typing a query or selecting a facet switches the main area to Atlas Explorer. It combines Published Lexemes and Visual Atlas Records through one catalog module so the UI does not need to understand their source schemas.

The five facets are:

- status: Published / Candidate
- axis: Layout / Interaction / Aesthetic / Motion / Component
- record type: component / pattern / design phenomenon
- scene: Agent GUI and future curated scenes
- source

Search covers English name, Chinese name, aliases, machine-translated Chinese definition, original English source definition, axis, type, scene, and source ID.

Ranking order:

1. exact English, Chinese, or alias match
2. name prefix match
3. all-token metadata match
4. source-definition match
5. Published before Candidate only when the relevance score is otherwise equal

Results use 24 records per page. Query state is round-trippable in the URL: `q`, `axis`, `status`, `type`, `scene`, `source`, and `page`.

## 4. Honest result hierarchy

Published and Candidate records do not use the same visual promise.

| Published Lexeme | Atlas Candidate |
|---|---|
| `■ 可运行词条` | `○ 图鉴候选` |
| local executable specimen | no invented thumbnail or demo |
| may open Autopsy, copy prompt, and join Spec | may only inspect metadata and sources |
| editorial Chinese name | machine Chinese fields carry a visible `机译` marker |
| stable `lex:id` | `atlas:id`, never presented as a lexeme |
| CTA: `打开词条` | CTA: `查看证据` |

Atlas records with `localLexemeId` fold into the matching Published Lexeme as extra source evidence and do not render a duplicate result.

Published matches appear in a compact “可运行结果” group. Candidates use a dense editorial list with English name, machine Chinese name, type, axis, source count, and one evidence-backed sentence. The mixed result surface is not a uniform card wall.

## 5. Candidate evidence page

`#/atlas/:recordId` shows only what the sources prove:

- English source name
- machine Chinese name and definition, visibly marked
- axis and record type
- explicit scenes and medium bindings
- original English source definition
- source name, entry URL, license, revision, and retrieval date
- related exact aliases or folded Published Lexeme when present

It never renders `DemoFrame`, Agent prompt copy, Spec actions, or local implementation claims.

## 6. Empty and error states

- A zero-result search clears the old specimen instead of leaving Bento Grid visible.
- The empty state offers `按位置找` and `描述或截图鉴定` as the next actions.
- A missing atlas record returns a branded evidence-not-found view with a link back to the restored query state.
- Failure to load the thin atlas index leaves the 62 Published Lexemes usable and offers an explicit retry.

## 7. Performance

- The full 1.1 MB evidence artifact never enters the initial JavaScript bundle.
- Build tooling derives `public/data/visual-atlas-index.json` with list/search fields only; gzip target is at most 250 KB.
- Candidate details load from per-record JSON only when opened.
- At most 24 Candidate rows exist in the DOM at once.
- Search text is normalized once when the index loads, and query updates use deferred rendering.
- Only the selected Published specimen runs a live demo; Candidates load no media.

## 8. Responsive and accessibility rules

Desktop keeps a two-column discovery layout, but the left column contains entry points and counts rather than 419 rows.

At 390px the order is fixed:

1. search
2. scene selector
3. Scene Anatomy image
4. synchronized hotspot term list
5. selected hotspot detail

Five-axis filtering opens in a sheet instead of occupying the mobile first screen. All touch targets are at least 44px. Hotspots work with click, keyboard focus, and touch; hover is optional. Mobile shows hotspot numbers on the image and full labels in the synchronized list.

The page has one global `<main>` only. Every dialog or sheet restores focus. Reduced motion removes animated transitions without hiding state changes. All routes keep the top-level “词典” navigation item current.

## 9. Domain module boundary

```js
createAtlasCatalog({ lexemes: ENTRIES, records })
  .query(state)
  .get(id)
  .counts()
```

The module owns schema adaptation, exact-match folding, search ranking, facets, pagination, and lookup. React components receive normalized view models only.

Scene geometry is a separate domain module because a source tag cannot prove spatial coordinates.

## 10. File boundaries

Modify:

- `demo/src/views/Lexicon.jsx`
- `demo/src/router.js`
- `demo/src/App.jsx`
- Visual Atlas build scripts to emit a thin index and per-record JSON

Add:

- `demo/src/lib/atlas-catalog.js`
- `demo/src/lib/atlas-route-state.js`
- `demo/src/data/scene-anatomies.js`
- `demo/src/components/lexicon/SceneAnatomy.jsx`
- `demo/src/components/lexicon/AtlasExplorer.jsx`
- `demo/src/views/AtlasRecord.jsx`
- `demo/src/styles/lexicon-atlas.css`
- matching Node contract tests

Do not modify:

- `demo/src/views/IndexView.jsx`
- Oreo production header/card CSS
- `demo/src/views/Entry.jsx`

## 11. Acceptance tests

- Unified catalog returns 62 Published Lexemes and at least 400 Candidates after folding exact `localLexemeId` matches.
- Candidate records can never be promoted by machine translation or fuzzy similarity.
- Search ranking and all five facets intersect correctly.
- Twenty-four-item pagination has no duplicate or missing IDs; URL state round-trips.
- Agent GUI hotspot IDs are unique, normalized coordinates stay in `0..1`, and every target resolves.
- Candidate views contain no local demo, Spec, board, or Agent-delivery actions.
- A zero-result query never leaves a stale specimen visible.
- 1280px and 390px have no horizontal overflow; the 390px first screen contains Scene Anatomy, not the full directory tree.
- Full evidence data is absent from the initial production bundle.

## 12. Out of scope for the first UI slice

- Additional scenes beyond Agent GUI
- Screenshot identification or image embeddings
- Automatic spatial inference
- Promoting any new Candidate to Published without a local executable specimen and editorial review
- Redesigning curation, the Oreo header, Entry, Autopsy, Tools, or Submit
