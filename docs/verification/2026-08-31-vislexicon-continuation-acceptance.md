# VisLexicon continuation acceptance record

**Date:** 2026-08-31  
**Predecessor task:** `01a052ee-ae66-70e0-9bd0-7b992bead5ee`  
**Fact baseline:** `Claude-最新完整对话整理.md`  
**Status:** in progress — curation layout verified; large catalog integration still running

## 1. Recovered continuation boundary

- The Oreo-style global header was already implemented and independently audited in the predecessor task.
- The curation surface still used token-only assertions while its real geometry differed from the approved values.
- The large Toools.design + outside-source catalog had been delegated but had not produced an importable artifact.
- This continuation therefore keeps the header stable, repairs the real curation geometry, and resumes the catalog data line separately.

## 2. Curation geometry: before and after

| Measurement at 1280px | Before continuation | Current | Approved target |
|---|---:|---:|---:|
| White board width | 1225px | 1174px | 1174px |
| Board radius | 36px | 32px | 32px |
| Board inner padding | 20px 22px 32px | 8px | 8px |
| Card size | 383.66 × 319.74px | 380 × 330px | 380 × 330px |
| Grid gap | 14px | 9px columns / 8px rows | 9px / 8px |
| Page background | `#f7f7f5` | `#f9f9f8` | `#f9f9f8` |
| Screenshot edge treatment | radial mask | 149px right fade + 171px bottom fade | directional fades |

The title and filters now live on the warm outer canvas. The white rounded board contains only the measured card grid, matching the approved information hierarchy.

## 3. Responsive browser evidence

Saved evidence:

- `docs/verification/images/curation-1280x900.png`
- `docs/verification/images/curation-768x1024.png`
- `docs/verification/images/curation-390x844.png`

### 1280 × 900

- Header: `1174 × 107.04px` at `x=45.5`.
- Board: `1174px` wide, `32px` radius, `8px` padding.
- Grid: `380px 380px 380px`, `9px` column gap, `8px` row gap.
- Cards: exactly `380 × 330px`.
- Search, stack filter, and purpose filters occupy two controlled rows rather than wrapping into the board.

### 768 × 1024

- Global header collapses to the measured `60px` mobile header.
- Board: `705px` wide.
- Grid: two `340 × 330px` cards with `9px / 8px` gaps.
- Document width remains inside the browser content width; no horizontal page overflow.

### 390 × 844

- Board: `347px` wide, `6px` padding.
- Grid: one `335px` column.
- Cards: `335 × 338px`.
- Purpose filters become a deliberate horizontal scroller; the page itself does not overflow horizontally.

### Interaction check

- A deliberately unmatched search produced the composed empty state.
- Activating “重置筛选” restored all 6 published cards and cleared the search value.

## 4. Published screenshot provenance

Only the six sites that already pass the curated publication contract remain in the visual grid. Every card uses three distinct local captures and one source URL per capture.

| Site | Local assets | Source URLs |
|---|---|---|
| Magic UI | `/shots/magic-ui/01.png`, `02.png`, `03.png` | `https://magicui.design/`; `/docs/components`; `/docs/components/glyph-matrix` |
| Coss UI | `/shots/origin-ui/01.png`, `02.png`, `03.png` | `https://coss.com/ui`; `/ui/particles`; `/ui/docs/components/calendar` |
| Hover.dev | `/shots/hover-dev/01.png`, `02.png`, `03.png` | `https://www.hover.dev/`; `/components/buttons`; `/components/three-d` |
| shadcn/ui | `/shots/shadcn-ui/01.png`, `02.png`, `03.png` | `https://ui.shadcn.com/`; `/docs/components`; `/blocks` |
| Uiverse | `/shots/uiverse/01.png`, `02.png`, `03.png` | `https://uiverse.io/`; `/elements`; `/kennyotsu/fresh-lizard-20` |
| 21st.dev | `/shots/21st-dev/01.png`, `02.png`, `03.png` | `https://21st.dev/`; `/community/components`; `/community/themes` |

Aceternity UI and Animata remain unpublished because the earlier human screenshot review rejected one asset from each site. Their files are not reused by published cards.

## 5. Verification commands so far

- Baseline before continuation: `node --test tests/*.test.mjs` → 65 passed, 0 failed.
- Baseline lint: exit 0 with pre-existing Fast Refresh warnings in `demos.jsx` / `variants.jsx`.
- Baseline production build: success; 62 lexicon JSON endpoints generated.
- Curation red/green checkpoint: `node --test tests/shell-contract.test.mjs tests/curation.test.mjs` → 33 passed, 0 failed.
- Focused lint for the edited view/tests: exit 0.

Fresh full-suite, lint, and build evidence will replace this section after the site catalog data line finishes.

## 6. Remaining acceptance gates

- Finish and validate the complete Toools.design ingestion and outside-source expansion.
- Record final canonical/de-duplicated entry counts, category coverage, Chinese-description coverage, and source evidence.
- Run the fresh full test suite, lint, and production build after integration.
- Re-run the final 1280 / 768 / 390 visual pass after all shared-file activity is complete.
