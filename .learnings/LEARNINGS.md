# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## [LRN-20260904-001] correction

**Logged**: 2026-09-04T15:20:00+08:00
**Priority**: high
**Status**: resolved
**Area**: docs

### Summary
When asked to recover recent work, keep the investigation scoped to the current workspace unless the user explicitly broadens it.

### Details
The user asked what had recently been done in the current VisLexicon folder and to resume the interrupted Claude work. I over-expanded the report to unrelated global Claude activity in Magic Pointer. The correct continuation point is the VisLexicon session after the user's 13:12 instruction: freeze layout work and continue exhaustive, evidence-backed Visual Atlas coverage.

### Suggested Action
Resolve “latest session” by matching the current workspace path first, then use the last substantive user instruction inside that workspace as the continuation boundary. Mention unrelated global sessions only when explicitly requested.

### Metadata
- Source: user_feedback
- Related Files: AGENTS.md, HANDOFF-2026-09-02.md, demo/scripts/categorize-unrouted.mjs, demo/scripts/match-unclaimed.mjs
- Tags: scope, session-recovery, current-workspace, visual-atlas

### Resolution
- **Resolved**: 2026-09-04T15:20:00+08:00
- **Notes**: Rescoped the task to VisLexicon and resumed from its interrupted atlas-coverage work.

---

## [LRN-20260904-002] knowledge_gap

**Logged**: 2026-09-04T16:15:00+08:00
**Priority**: high
**Status**: resolved
**Area**: backend

### Summary
Dated source-inventory counts are hypotheses until re-derived from a fixed current revision.

### Details
The 2026-08-31 Figma audit documented 82 selected plugin-typing options. The current first-party revision `9d38b4222b07c7499bc737fe148e85983ec3b95a` still exposes the same 14 namespaces but adds `SPACE_EVENLY` and `SPACE_AROUND` to `AutoLayoutMixin.primaryAxisAlignItems`, making the reproducible count 84. Forcing the old number would silently discard valid source observations.

### Suggested Action
Before importing any dated source inventory, fetch and pin the current first-party revision, derive per-namespace counts, record drift explicitly, and update tests to the observed source truth rather than filtering records to preserve an old total.

### Metadata
- Source: knowledge_gap
- Related Files: docs/research/2026-08-31-visual-atlas-source-candidates.json, demo/scripts/visual-atlas/source-parsers.mjs
- Tags: source-drift, count-conservation, figma, provenance

### Resolution
- **Resolved**: 2026-09-04T16:15:00+08:00
- **Notes**: Updated the Figma source contract from 82 to 84 before creating any raw snapshot.

---

## [LRN-20260902-001] correction

**Logged**: 2026-09-02T10:30:00+08:00
**Priority**: high
**Status**: pending
**Area**: docs

### Summary
The independent v2 design review correctly identifies a process failure: validated content discipline was not applied to product structure and scale decisions.

### Details
The earlier self-review named the symptoms (fixed taxonomy navigation, uniform cards, channel fragmentation, candidate-count leakage, and progress shown as user value), but did not make the sequencing rule explicit. The v2 review adds the missing constraint: stage-one scope must be a small, fully verified corpus (roughly 50–100 entries), while the 8,684 candidate corpus remains internal. The current 13/57 taxonomy can remain an internal classification and coverage instrument required by the evidence contract, but must not become a public navigation or ranking promise. Public records must remain entry-level, evidence-gated, and limited to real reviewed content.

### Suggested Action
Keep taxonomy/evidence/identity work backend-only; do not add public candidate counts, global scores, or taxonomy-first UI. Treat task routes and editorial reasons as future product work, and verify every public revision against the small reviewed set.

### Metadata
- Source: user_feedback
- Related Files: VisLexicon-独立设计评审反馈-2026-09-01-v2.md, HANDOFF-2026-09-02.md, docs/superpowers/specs/2026-09-01-site-entry-taxonomy-v3-design.md
- Tags: scope, evidence-first, taxonomy, product-sequencing
- Pattern-Key: product.validation-before-structure
- Recurrence-Count: 1
- First-Seen: 2026-09-02
- Last-Seen: 2026-09-02

---

## [LRN-20260901-004] best_practice

**Logged**: 2026-09-01T22:35:00+08:00
**Priority**: critical
**Status**: promoted
**Area**: backend

### Summary
Persist immutable source observations before any collector-level deduplication.

### Details
The historical report counted 14,843 raw query hits, but the retained raw source files contain only about 9,034 records and the reconstructed queue can preserve 9,029 source observations. Older collectors used maps or source-level consolidation before durable observation storage, so thousands of duplicate hits and their provenance cannot be reconstructed after the fact.

### Suggested Action
Every collector must write one observation per returned raw hit before normalizing or grouping, and retain request failures separately. Enforce `returned raw hits = observations` and `request attempts = successful requests + explicit failures`; build candidate identity groups only from that immutable ledger.

### Metadata
- Source: simplify-and-harden
- Related Files: demo/scripts/collect-npm-resources.mjs, demo/data/sources, demo/src/lib/curation-queue.js, docs/superpowers/specs/2026-09-01-site-entry-taxonomy-v3-design.md
- Tags: provenance, deduplication, collectors, count-conservation
- Pattern-Key: curation.persist_observation_before_dedup
- Recurrence-Count: 1
- First-Seen: 2026-09-01
- Last-Seen: 2026-09-01
- Promoted: CONTEXT.md and site-entry taxonomy v3 specification

---

## [LRN-20260831-003] correction

**Logged**: 2026-08-31T13:20:00+08:00
**Priority**: critical
**Status**: in_progress
**Area**: frontend

### Summary
A useful example scene must never be promoted into the default discovery architecture.

### Details
Agent GUI was introduced in the recovered Claude conversation only to demonstrate how Scene Anatomy can help someone discover the name “Prompt Composer.” Turning that example into the default lexicon view privileged one narrow design task and contradicted VisLexicon's broader cross-medium scope.

### Suggested Action
Make the default discovery page medium- and scenario-neutral. Scene Anatomy is one discovery method inside a scene library; Agent GUI is one scene among many. The root must route by what the user knows (name, scene, visual reference, or broad exploration) and what they are designing, without selecting a domain for them.

### Metadata
- Source: user_feedback
- Related Files: docs/superpowers/specs/2026-08-31-visual-atlas-discovery-ui-design.md, CONTEXT.md
- Tags: information-architecture, default-route, scene-anatomy, overfitting

---

## [LRN-20260831-002] best_practice

**Logged**: 2026-08-31T12:45:00+08:00
**Priority**: high
**Status**: in_progress
**Area**: backend

### Summary
Do not count coverage taxonomies as visual atlas entries.

### Details
AI Interaction Atlas exposes 194 tasks, actions, system operations, data types, constraints, and touchpoints and explicitly states that it is not a UI framework. Treating all 194 as Visual Atlas Records produced a technically valid 477-row file but inflated the user's “400 visual atlas items” goal with non-visual metadata.

### Suggested Action
Store these records as Coverage Dimensions outside the atlas count. Count only evidence-backed observable components, interactions, motion patterns, visual effects, scenes, or cross-medium phenomena. Enforce `countedAtlas=false` for coverage dimensions in the data contract.

### Metadata
- Source: error
- Related Files: CONTEXT.md, demo/src/data/visual-atlas.json
- Tags: taxonomy, honest-counting, visual-atlas, evidence

---

## [LRN-20260831-001] correction

**Logged**: 2026-08-31T11:00:00+08:00
**Priority**: high
**Status**: in_progress
**Area**: frontend

### Summary
A large catalog must expose its real scale and navigation model; a 30-item render window reads as a 30-item collection.

### Details
The data layer already contained 3,229 canonical candidates, but the first catalog UI presented “load 30 more” as its dominant scale cue and offered only one primary-category filter. The user requires at least 1,000 visibly accessible websites, detailed classification, and a visual lexicon of at least 400 entries.

### Suggested Action
Use explicit total/page indicators, 100-item pages, primary and fine-grained category filters, tag/pricing/source filters, and search across the full catalog. Keep DOM rendering bounded for performance while making every record directly reachable. Expand the lexicon data contract and sourced content to 400+ entries before treating the atlas as complete.

### Metadata
- Source: user_feedback
- Related Files: demo/src/SiteCatalog.jsx, demo/src/lib/site-catalog-browser.js, demo/src/data/site-catalog.json
- Tags: catalog-scale, pagination, taxonomy, lexicon

---

## [LRN-20260901-003] correction

**Logged**: 2026-09-01T21:00:00+08:00
**Priority**: critical
**Status**: in_progress
**Area**: backend

### Summary
Keep classification, but never promote a user's illustrative example into a privileged taxonomy branch.

### Details
The previous model overfit the user's mention of Agent UI and created a special `agent-ai-ui` category beside broad, vague buckets. The user wants a balanced classification system grounded in the full design-resource domain, with Agent interfaces treated like any other application-domain tag. Layout is user-owned and frozen; current priority is backend taxonomy/tagging, working source links, real screenshots, and descriptions based on actual site exploration.

### Suggested Action
Derive classification from broad corpus evidence and independent dimensions. Audit first-level categories for symmetry and comparable granularity; keep narrow examples as tags/facets unless the corpus justifies equivalent sibling categories. Freeze layout work until the user supplies it.

### Metadata
- Source: user_feedback
- Related Files: demo/src/data/curation-taxonomy.js, demo/src/data/site-catalog.json, demo/src/components/SiteDetailModal.jsx
- Tags: taxonomy, few-shot-overfitting, data-quality, scope

---

## [LRN-20260901-002] correction

**Logged**: 2026-09-01T20:30:00+08:00
**Priority**: high
**Status**: resolved
**Area**: docs

### Summary
When the user asks for a brief to send to their own reviewer, prepare the handoff text only; do not appoint or run an independent reviewer.

### Details
The user had arranged a design expert themselves. Creating an internal review agent and feedback file exceeded the requested role. The immediate deliverable is an approximately 100-character review request naming the exact allowed input file(s).

### Suggested Action
Distinguish “prepare a reviewer brief/prompt” from “perform or delegate the review.” Only delegate when the user explicitly asks Codex to choose or run the reviewer.

### Metadata
- Source: user_feedback
- Related Files: VisLexicon-设计评审完整简报-2026-09-01.md
- Tags: scope, delegation, review-handoff

### Resolution
- **Resolved**: 2026-09-01T20:30:00+08:00
- **Notes**: Returned only a short copyable instruction for the user's reviewer.

---

## [LRN-20260901-001] correction

**Logged**: 2026-09-01T00:30:00+08:00
**Priority**: critical
**Status**: in_progress
**Area**: frontend

### Summary
The curated presentation standard must cover the whole website catalog, not a small featured tier above a lower-quality directory.

### Details
Showing 9 richly presented sites while leaving thousands as compact list rows does not satisfy the product goal. Every published site must use the same discovery contract: evidence of a real visit, three meaningful screenshots, an intelligible description of what the site actually offers, organized tags, and the same card/detail interaction.

### Suggested Action
Replace the featured-versus-directory split with one unified catalog renderer and an evidence-gated publication state. Keep incomplete records out of the finished presentation until their three screenshots and editorial fields pass validation.

### Metadata
- Source: user_feedback
- Related Files: demo/src/IndexView.jsx, demo/src/SiteCatalog.jsx, demo/public/data/site-catalog-index.json
- Tags: curation, unified-catalog, screenshots, editorial-evidence, honest-publishing

---
