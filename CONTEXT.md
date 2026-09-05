# VisLexicon Domain Glossary (CONTEXT.md)

This document defines the canonical ubiquitous language for the VisLexicon platform. It contains strict definitions devoid of implementation details.

---

### Core Entities & Concepts

#### 1. Effect Genome (效果基因组)
The orthogonal, multi-channel parameter representation of any visual interaction or motion phenomenon (e.g., shape-morph, corner-radius, spatial-continuity, easing, stagger). An effect is not an isolated enumerated token, but a coordinate in this multi-dimensional space.

#### 2. Effect Notation (效果记谱法)
A compact, human-readable, and machine-executable formal grammar representing an Effect Genome instance (e.g., `CT[circle→pill] · corner:continuous · spring(0.85, 22)`).

#### 3. Controlled Vocabulary (受控词表)
The standardized, curated taxonomy spanning 5 primary axes (Layout, Interaction, Aesthetic, Motion, Component) with bidirectional alias mappings (Chinese colloquial terms $\leftrightarrow$ canonical industry terms).

#### 4. Design Spec (设计规格)
A deterministic, machine-readable specification bundle (JSON + tokens + acceptance checklist + asset endpoints) produced by user curation and consumed directly by downstream AI Agents for visual coding.

#### 5. Dichotomous Key (二叉检索表)
A step-by-step visual decision tree that guides users to identify and name unknown UI phenomena through pairwise visual comparisons without requiring prior terminology knowledge.

#### 6. Motion Autopsy (动效解剖台)
An inspection environment for motion specimens providing sub-frame scrubbing, layer-separation X-ray rendering, easing curve synchronization, and single-variable genetic diffing.

#### 7. Curated Site Entry (策展站内入口)
An evidence-backed Site Entry selected for design discovery. It represents one stable user-facing role of a source, not every capability of the whole domain.
_Avoid_: Whole website, external link row, showcase card

#### 8. Evidence Trio (三页证据组)
Three distinct source pages that establish identity, breadth, and one concrete proof of what a Site Entry actually offers.
_Avoid_: Three decorative screenshots, thumbnail collage

#### 9. Design Phenomenon (设计现象)
A medium-independent perceptual, structural, or behavioral pattern that can be recognized across Web, mobile, Figma, presentation, image, and motion tools.
_Avoid_: Web effect, component effect

#### 10. Medium Binding (媒介实现绑定)
The named realization of one Design Phenomenon in a specific medium or tool, such as View Transitions on the Web, Smart Animate in Figma, or Morph in PowerPoint.
_Avoid_: Duplicate term, platform copy

#### 11. Visual Atlas Record (视觉图鉴记录)
A sourced discovery record that names and classifies a component, pattern, interaction, style, motion concept, or cross-medium phenomenon. It may point to an external visual demonstration without yet carrying a complete local implementation.
_Avoid_: Published lexicon entry, finished demo

#### 12. Published Lexeme (正式词条)
A fully curated Visual Atlas Record with a stable ID, controlled aliases, local executable demonstration, implementation guidance, and acceptance evidence.
_Avoid_: Candidate, raw imported term

#### 13. Atlas Candidate (图鉴候选)
A Visual Atlas Record supported by source evidence but still awaiting editorial de-duplication, Chinese naming review, and/or a local executable demonstration.
_Avoid_: Published, verified lexeme

#### 14. Scene Anatomy (场景解剖图)
A spatial map of a familiar product scene that lets a person discover canonical names by locating where an unknown thing appears, rather than already knowing what to search for.
_Avoid_: Category list, scrolling gallery

#### 15. Coverage Dimension (覆盖维度)
A non-visual taxonomy used to test whether the atlas covers relevant tasks, actions, constraints, channels, and data shapes. Coverage Dimensions never count toward the number of Visual Atlas Records.
_Avoid_: Visual entry, atlas count, published lexeme

### Site Curation Language

#### 16. Source Entity (来源实体)
A stable organization, person, product, or project that owns or provides one or more Site Entries. A Source Entity has identity but no single primary category.
_Avoid_: Website category, domain row

#### 17. Site Entry (站内入口)
A stable user-facing entrance through which a person performs one primary action or obtains one primary kind of deliverable. Different entries of one Source Entity may have different categories.
_Avoid_: Entire domain, arbitrary URL path

#### 18. Content Unit (内容单元)
One concrete component, template, asset, article, case, or other item contained by a Site Entry. It is classified by its own substance rather than by the community, directory, or market that contains it.
_Avoid_: Container category, inherited listing type

#### 19. Source Observation (来源观测)
An immutable record that a collector, directory, package registry, or user submission exposed a URL or identity claim at a particular time.
_Avoid_: Verified entity, approved site

#### 20. Provisional Identity Group (临时身份组)
A conservative cluster of observations joined only by strong identity signals while its final Entity, Entry, or Unit boundary remains unresolved.
_Avoid_: Unique website, final entity

#### 21. Dedup Decision (去重决策)
An auditable decision to merge, keep distinct, split, or undo an identity relationship, together with the evidence and reviewer responsible for it.
_Avoid_: Silent deletion, same-name merge

#### 22. Evidence Attempt (证据尝试)
An immutable account of one real exploration, page selection, capture, editorial description, fact check, and review cycle for a Site Entry.
_Avoid_: Site status, permanent failure

#### 23. Approved Entry (已批准入口)
A Site Entry whose identity, classification, description, Evidence Trio, rights facts, and independent review all satisfy the publication contract.
_Avoid_: Candidate with screenshots, visited URL

#### 24. Quarantined Candidate (隔离候选)
A candidate retained for provenance but blocked from publication because its identity, link, evidence, description, rights, or capture state is unsafe or incomplete.
_Avoid_: Deleted record, published site

#### 25. Primary Category (主分类)
The single stable class that describes the main action or deliverable of one Site Entry or Content Unit. It never encodes technology, scenario, platform, price, or quality.
_Avoid_: Resource essence, popularity tier, AI category

#### 26. Facet (正交标签)
A controlled multi-value descriptor for scenario, deliverable, action, medium, platform, technology, workflow stage, audience, access, license, organization, or language.
_Avoid_: Secondary category, free-form tag

#### 27. Quality Fact (质量事实)
A stable, evidenced statement about identity verification, link health, evidence completeness, capture quality, editorial quality, rights status, or freshness.
_Avoid_: Category score, permanent usefulness score

#### 28. Task Relevance (任务相关性)
The context-dependent usefulness of an Entry or Unit for the user's present design task. It is derived at discovery time and is never stored as a global value ranking.
_Avoid_: Universal score, category weight
