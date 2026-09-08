# Savimbo Design System

> **Savimbo** is a social enterprise — made by, and for, Indigenous Peoples and local
> communities — that connects them directly to climate markets. They sell **fair-trade
> carbon credits** (and biodiversity, water, and ecotourism credits) sourced from
> subsistence farmers in tropical forests, with no middlemen.
>
> "Grow something great."

This folder is a working design system: brand foundations, typography, colors,
fonts, assets, content rules, and UI kits. Use it to design on-brand for Savimbo,
whether for production work or throwaway prototypes/decks.

---

## Quick index

| File / folder | What's in it |
|---|---|
| `README.md` | This file — content fundamentals, visual foundations, iconography |
| `SKILL.md` | Agent-skill manifest (works in Claude Code too) |
| `colors_and_type.css` | All brand tokens — colors, type, spacing, radii, shadows, motion |
| `fonts/` | Relative typeface family (Book / Medium / Bold + italics, Faux display, Mono 10/12 pitch) |
| `assets/` | Logos and brand imagery |
| `preview/` | HTML cards used by the Design System tab — palette, type, components, voice |
| `ui_kits/website/` | Marketing-site UI kit — `index.html` + JSX components (Header, Hero, StatStrip, ProjectCard, MethodologySteps, BuyForm, Footer). Click-through: Home → Methodology → Projects → Buy → Confirmation |
| `uploads/` | Original source materials (PDF style guide, logo) — **do not edit** |

## Sources

- **GitHub:** [`savimbo/brand`](https://github.com/savimbo/brand) — canonical
  brand constants in `savimbo_brand.py` (Drive snapshot, April 2026), plus the
  Relative font family. Imported here at `fonts/` and `assets/`.
- **PDF style guide:** "SV: Style Guide" (uploads/style_guide.pdf, 30 pages).
  Older but tone-rich; quoted heavily below.
- **Coolors palettes:**
  - Legacy logo palette — `coolors.co/20381d-365c31-8ea604-bcabae-f7f8f9-ffffff-ff3460-34252f`
  - Primary palette (canonical) — `coolors.co/db3055-23232f-52b8c2-94a528-bdd717-ffffff-ece5f0`
  - Rainbow / data-viz secondary — `coolors.co/23232f-75c4d4-8eb26e-dc924d-e0cd4e-f67b7d`
- **Public site:** savimbo.com (referenced in PDF for footer / link patterns).
- **Type reference:** the PDF says the font in use should "look like Carbonplan.org"
  — clean, scientific, generous leading.

---

## CONTENT FUNDAMENTALS

The single best summary of Savimbo's voice is from the style guide itself:

> *"Externally colorful, tribal, nature-focused, playful, and scientific, with a
> bit of dry, humorous innuendo (kind of a wry observation that nature is always
> 'getting it on'). … Internally we are disreputable fun. We like Artemis Fowl,
> Pippi Longstocking, The Bartimaeus Trilogy, The Saint, Ellen DeGeneres, and
> The Mentalist. Harmless, brilliant, anti-hero pranksters with a kind streak."*

That gives us two concentric voices:

- **External** — colorful, naturey, scientific, plain-spoken. A little wink, never
  smug. Confident about climate impact without preaching. Examples from the
  PDF/site: *"Grow something great!"*, *"Fair-trade carbon credits."*, *"No
  middlemen, fast and friendly, global good."*
- **Internal / blog / social** — dry, funny, anti-hero. "#sexy trees" is on-brand.
  References pop culture pranksters with a kind streak.

### Casing

- **Sentence case only**, everywhere. Headlines, buttons, nav, labels.
  Material Design rule. Never Title Case, never ALL CAPS in body or buttons.
- The one exception is **eyebrows / category tags** — small uppercase labels
  with wide tracking are OK as visual punctuation (`PROJECTS`, `2026`, `DRAFT`).
- Acronyms keep their caps: CO₂, COP, CME, ha.

### Person and tone

- **"We"** for Savimbo (we work with farmers, we sell credits). **"You"** when
  addressing the buyer or visitor. **"They" / proper names** for farmers — the
  PDF emphasizes "real photos of our farmers," so name them when possible
  (e.g. *"Jhony & Fernando's farm"*, *"81 families enrolled"*).
- Active voice. Short sentences. Specific numbers (*"3,425 ha · 87% primary
  forest"*) over vague claims.
- A wry aside is welcome — never a lecture. The PDF: *"Our normal presentation
  decks are intentionally crude to force people to focus on what we are saying."*

### Words to use

Carbon credit · biodiversity credit · water credit · ecotourism · agrobiodiversity
· biochar · primary forest · families enrolled · fair-trade · monthly micropayments
· co-owners · methodology · pipeline · retire (a credit) · Putumayo · Indigenous ·
local communities.

### Words to avoid

"Offsets" (Savimbo sells *credits*, not offsets — different politics) · "fortress
conservation" (explicitly rejected in the PDF) · "stakeholders" (corporate-y) ·
"sustainable solutions" / "synergy" / "leverage" · marketing fluff. No mystical /
spiritual framing — the PDF has an explicit *"NO Mystical stuff"* rule for press
imagery, and the same applies to copy.

### Emoji

**No emoji** in product UI, marketing copy, or decks. The brand uses real photography
and Colombian Gold-Museum animal motifs — that's the visual delight, not emoji.
Hashtags are fine in social contexts (*#sexytrees*).

### Five values to weave through long-form copy

**Consciousness · Now · Trust · Respect · Abundance.** Listed verbatim on the
style-guide values slide. They're not slogans, but they should resonate in
headlines and section openers.

### Example headlines & micro-copy (on-brand)

- *"Grow something great."* (tagline)
- *"Fair-trade carbon credits — direct from the farmers who grow them."*
- *"81 families enrolled · 3,425 ha · 87% primary forest."*
- *"Buy now"* (button — sentence case, nothing fancier)
- *"This methodology is restricted to local and Indigenous communities. It's
  not for fortress conservation."* (a confident, plain-spoken disclaimer)

---

## VISUAL FOUNDATIONS

### The through-line — a two-register brand

Savimbo runs **one voice through two visual registers held in deliberate
opposition**. The collision is the brand. Neither register dominates; they
alternate by surface, sometimes within a single surface.

| Cool register — **Swiss** | Hot register — **Tribal** |
|---|---|
| White space, Relative type, grid discipline | Magical-realism bestiary, saturated solid fields |
| Carbonplan / IKEA lineage | Colombian Gold Museum lineage |
| Web, decks, interfaces, science, email, docs | Press graphics, OG cards, social feed |
| *"We are rigorous"* | *"We are alive"* |

What ties them together: the **logo**, the **Relative** typeface, the **Folly-pink
CTA**, the Gold-Museum **sculptural sensibility**, and a load-bearing **refusal
of the sustainability-brochure middle ground** — no muted greens, no
soft-focus stock photography, no Manrope, no mystical staging.

> The deepest fact about Savimbo: every surface choice is calibrated against
> the climate-NGO default. *Solarpunk, not sustainability brochure. Bestiary,
> not case study. Disreputable fun, not corporate gravitas.* The brand's
> coherence comes from what it **consistently won't do**, as much as from what
> it does.

### Five surfaces, five visual jobs

| Surface | Register | Visual rule |
|---|---|---|
| **Press graphics** | Tribal | Magical-realism bestiary — single creature on a saturated solid field. No scene, no mystical staging. ≤2 characters per image. Executed across techniques: gold-leaf relief, hyperreal painting, sculptural ribbon-layering, camera-trap photography. |
| **OG / share cards** | Tribal | Sculptural-relief animals on flat or two-block color fields. 1200 × 630. Logo bottom-right. |
| **Social feed** | Tribal | High-cadence mosaic — field photography from Putumayo cut by AI tiles, montages, and repurposed press graphics. Voice carries as much load as image. Hashtag stacks mix taxonomic precision with internet idiom. |
| **Slide decks** | Swiss | *Intentionally crude.* Oversized Relative headline on a white field, single Citron `DRAFT` tag, vertical `www.savimbo.com` rule, logo bottom-right. The crudeness *is* the Swiss discipline — it forces attention on the argument. |
| **Interfaces / email / docs** | Swiss | Mostly white, green structural elements, Folly-pink CTAs (or pink→orange gradient where the surface supports it). Vast empty fields. Single sentences sitting alone. |
| **Scientific graphics** | Swiss (dark variant) | *"Unutterably simple."* Dark backgrounds, line-drawing trees, neon Citron / Folly accents, monospace labels. Carbonplan as reference. |

### Aggressive white space as palette (the Swiss principle)

The web surface — and decks, and interfaces, and emails — treats **white space
as a primary brand element, not background**. IKEA / Swiss negative space as a
statement. Vast empty fields. Single sentences sitting alone. Hero sections
that refuse to fill themselves. The emptiness is doing semantic work — it
signals **clarity, confidence, scientific rigor, and a refusal of the
climate-marketing reflex to fill every pixel with imagery and promise**.

When designing a Swiss-register surface:

- Pick the *one* sentence and let it own the screen.
- Generous margins beat decorative containers every time.
- If the layout feels uncomfortably empty, you're closer than if it feels full.
- Functional reduction, not minimalism for its own sake — only what's necessary,
  sized correctly, breathing.

### Recurring motifs across surfaces

- **Asymmetric montages with crisp white gutters.** *"Montages that make a
  composite pattern are especially Savimbo."*
- **Diagonal split layouts** — dark-green triangle ↔ aerial photo ↔ Citron
  crosshair markers (the Putumayo-deck device).
- **Coin iconography** — bronze / silver / gold tiered medallions for credit
  products, sculptural and tilted. Gold-Museum lineage. Use when displaying a
  credit-tier or product-tier list.
- **Colombian Gold Museum sculptural sensibility** — applied promiscuously
  across animal renders, credit coins, even the logo's entwined relief.

### Pink button on a white page

Most product UI is white + green structural + shadow grey, with **one bright
Folly-pink CTA** (Amaranth `#db3055`) per screen. The pink is the brand. Don't
dilute it with extra accents. *"Buttons are bright pink ('Folly') unless
there is a sophisticated enough interface to make a gradient."* (A Folly →
Toasted-Almond gradient is the sanctioned exception.)

### Voice (the spine that holds both registers together)

**Externally:** colorful, tribal, nature-focused, playful, scientific, with
dry innuendo. **Internally:** disreputable fun — Pippi Longstocking, Artemis
Fowl, The Mentalist. Anti-hero pranksters with a kind streak. **Multilingual
without translating itself.** First-person animal POV is welcome. Hashtag
stacks mix taxonomic precision (*Speothos*, *Dasyprocta*, *Heliconia*) with
internet idiom (*#influencer*, *#SexyTrees*).

### Rejection list (load-bearing)

These are not "avoid"s — they're **what Savimbo is, by negation**:

- No mystical / spiritual staging in press imagery.
- No more than 2 characters per press image.
- No green-on-green generic nature photography.
- No polished corporate one-pagers.
- **Manrope is dead.** Relative + Figtree fallback only.
- No Mode-2 drift (atmospheric scenes, painterly habitats) — breaks the press
  rule and dilutes the social feed.
- No muted-green / soft-focus / sans-serif-promise sustainability brochure
  tropes.

### Color

Primary palette (canonical, 2026) is **Folly pink · Phthalo green · Hunter
green · Citron · Shadow · warm greys · White**
(`coolors.co/20381d-365c31-8ea604-d9d9d9-f3f3f3-ffffff-fe2c55-23232f`). All hex
values + tonal scales live in `colors_and_type.css`. The rules:

- **Folly pink `#fe2c55` is THE call-to-action color.** One Folly CTA per screen
  (two max). *"Buttons are bright pink ('Folly') unless there is a sophisticated
  enough interface to make a gradient"* — the sanctioned exception is a
  Folly → orange hero/FAB gradient. Links are also Folly.
- **Greens are the brand.** Phthalo `#20381d` (dark surfaces, logo strokes),
  Hunter `#365c31` (primary green, forest CTA, success), Citron `#8ea604`
  (accent, highlights, logo background).
- **Grey, not black.** Body text is Shadow `#23232f`, never pure black.
- **Warm neutral greys** — `#f7f8f9` paper, `#f3f3f3` fills, `#d9d9d9` rules.
  No lavender, no cool/bluish greys.

The **Rainbow palette** keys ecosystem-service categories and data viz
(`coolors.co/23232f-75c4d4-7ab85a-dc924d-e0cd4e-f67b7d`): Carbon `#23232f` ·
Water `#75c4d4` · Trees `#7ab85a` · Ecotourism `#dc924d` · Agrobiodiversity
`#e0cd4e` · Biodiversity `#f67b7d`. Used as tags, chart series, and light stat-card
tints — never as the primary UI identity.

> **History:** an earlier April-2026 Drive snapshot used Amaranth `#db3055`,
> Tropical Teal, Lime Moss and a Lavender Mist neutral. That has been
> superseded. The old token names (`--sv-amaranth`, `--sv-tropical-teal`,
> `--sv-lavender-*`, etc.) survive only as backward-compat **aliases** pointing
> at the canonical palette above — don't use them in new work.

### Type

- **Relative** is the family. Book / Medium / Bold with italics. Loaded via
  `@font-face` from `fonts/`.
- **Relative Faux** is the *display* face — used for big poster-style headlines
  ("I'M A HEADLINE" in the PDF). Don't use it under ~24px.
- **Relative Mono 10/12 Pitch** for code, data tables, hectare counts.
- **Sentence case everywhere**, generous leading, low contrast between heading
  and body weights. The PDF reference is *carbonplan.org* — calm, scientific,
  not shouty.
- **Fallback stack** when Relative isn't loaded: Inter → Helvetica Neue →
  Helvetica → Arial. **Figtree** is the Google-Docs fallback called out in the PDF.

### Spacing & layout

- 4-pt grid. Tokens `--sv-space-1`…`--sv-space-10`.
- Generous margins. The PDF rule for the logo: *"on a White background with a
  20px margin and a 20px padding."* Treat that as a metaphor — give brand marks
  room.
- **Asymmetric montages** are a Savimbo signature: *"Montages are always
  separated by a white line and asymmetric. Montages that make a composite
  pattern are especially Savimbo."* When laying photo grids, vary tile sizes
  and keep crisp white gutters between them.

### Backgrounds

- **Mostly white.** Product UI, emails, documents — *"mostly white with green
  and bright buttons."*
- **Dark Shadow-Grey** sections for footers, hero overlays on photography, and
  data sections.
- **Lavender Mist** soft cards / footer fills — quiet, not lavender-y in the
  decorative sense, used as a near-white tint.
- **Photography** is the loudest background — bright tropical greens cut by
  vibrant accents. Real farmers, real forests, real animals. *No stock-photo
  feel; no AI-painted forests except as small accents in social queues.*
- No marketing-bro gradients. No glassmorphism. No purple-blue dashboards.

### Borders, radii, shadows

- **Radii:** default `4px` (`--sv-radius-sm` — matches `LAYOUT.border_radius_pt: 4`
  from the brand python). Cards `8px`. Pills/avatars only when round.
- **Borders:** hairline `0.5pt` rules per the brand spec; `1px` for cards. Use
  the lightest grey scale step, not pure black.
- **Shadows:** very restrained — `--sv-shadow-1` is the default card shadow.
  `--sv-shadow-pop` (a soft amaranth glow) is reserved for the *one* CTA on a
  hero. No big drop-shadows; this brand isn't dramatic that way.
- **No left-border-accent cards.** That's an AI-design tic, not a Savimbo
  pattern.

### Hover & press

- Links: color shift from Folly `#fe2c55` to `--sv-folly-dark` `#e62950`. Keep
  the underline.
- Buttons: hover lifts shadow one step + color goes one tonal step darker.
  Press is `transform: translateY(1px)` plus the inset `--sv-shadow-press`.
- Photo cards: gentle 1.02 scale on hover, 200ms `--sv-ease-out`. Don't fade
  to white or add gradients.

### Motion

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (out-quint feel). No bouncy springs.
- Duration: 120ms (micro), 200ms (default), 360ms (page-level).
- Fades and small translations only. No hero parallax, no Lottie celebrations,
  no flashy reveals. Plant analogy: things grow, they don't pop.

### Transparency & blur

- **Avoid blur effects.** The brand is sharp — photography is sharp, type is
  sharp, scientific graphics are sharp.
- Light tints (5–8% black) are the right tool for press states and subtle
  hovers, instead of opacity changes on the whole element.

### Cards

- White background, `--sv-shadow-1`, `8px` radius, `1px` `--sv-grey-900` border
  optional. Inside: a photo on top (full-bleed of the card), then label →
  number → small helper text. Numbers do the heavy lifting.

### "Unutterably simple" graphics

The PDF dedicates a slide to this: scientific diagrams should be **plain,
labeled, no decoration**. Black/grey lines on white. Numbered steps. One
accent color (usually amaranth or teal). Don't reach for chart libraries with
gradients and animated entrances.

---

## ICONOGRAPHY

Savimbo's brand assets repo contains **no icon font and no SVG icon set** — the
visual vocabulary is carried by **photography**, **logo / mark**, and **typography**,
not by little symbols. So our icon strategy here is by *substitution and
restraint*:

- **Default icon set: [Lucide](https://lucide.dev)** (loaded via CDN in UI-kit
  HTML). Reasoning: thin, clean line weight (1.5–2px), neutral, scientific.
  Matches the carbonplan.org reference the PDF calls out. *Flagged substitution
  — Savimbo has not committed to an official icon font; please confirm.*
- **Stroke / weight:** 1.75px stroke, rounded line-cap, no fill. Use them at
  `16px` or `20px` in UI; `24px` in marketing.
- **Color:** icons inherit text color (Shadow Grey for body, Amaranth for the
  one CTA, Tropical Teal for links). Never multi-color icons.
- **Sizes:** `--sv-text-body-size` × 1 (i.e. 16px) inline with text; 20–24px
  for buttons; 32–40px in feature cards.

### Logo

- `assets/SV_logo.png` — official mark from the GitHub brand repo. Tree of life
  on Citron green circle. Use on white with **20px margin + 20px padding** of
  clearspace per the style-guide rule.
- `assets/SV_logo_circle.png` — the upload-supplied version (same mark).
- The mark must always sit on white or a very light surface. Don't tint, don't
  re-color, don't drop on photography without a white plate behind it.
- Wordmark form (`Savimbo` in Relative Faux) is acceptable on dark surfaces in
  white.

### Imagery (in lieu of icons)

- **Real farmers, real forests.** The brand explicitly leans on photography,
  not illustration. Slot photos where you'd normally reach for a hero
  illustration.
- **Colombian Gold Museum animal motifs** are an approved illustrative source —
  we don't have those files locally, but flag any decorative slot as a candidate
  for them.
- **No emoji**, **no decorative SVGs hand-drawn by an AI**. If a slot calls for
  imagery and we don't have the asset, use a labeled photo placeholder rather
  than invent decoration.

### Unicode characters that ARE on-brand

- `→ ← ↑ ↓` for flow / step diagrams ("Plant trees → Grow trees → Track carbon
  …").
- `·` middle dot as a stat separator (*"81 families · 3,425 ha · 87% primary"*).
- Numerals in Relative Mono for hectares and credit counts.

---

## Open questions / flags for the user

- **Icon set.** No official set in the repo — I've picked Lucide as the placeholder.
  Please confirm or send a preferred set.
- **Photography library.** The brand leans hard on real photos of farmers and
  forests; we have **none** in this folder. If you can drop 5–10 representative
  photos into `assets/photos/`, the UI kit and slide previews will go from "good
  layout" to "actually Savimbo."
- **Two style sources disagree slightly.** The PDF (older) lists Phthalo /
  Hunter / Citron / Folly. The brand python (April 2026, canonical per its own
  docstring) lists Amaranth / Shadow Grey / Tropical Teal / Lime Moss / Lemon
  Lime. I've treated the python file as canonical and preserved the PDF palette
  as `--sv-legacy-*`. Confirm this is right.
- **Colombian Gold Museum motifs.** Mentioned as approved illustrative content —
  we don't have any. Please send if you want them used.
