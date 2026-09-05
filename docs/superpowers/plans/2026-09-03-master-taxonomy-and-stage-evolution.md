# VisLexicon Master Taxonomy & Stage Evolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform VisLexicon's Atlas from an unpolished prototype into a world-class visual & interaction studio with comprehensive typography/art text support, a flagship Agent UI stage with real design-system aesthetics, laser-glow hotspot inspection, specialized resource mapping, and a production-grade code/spec exporter.

**Architecture:** 
1. Build an enhanced Stage & Resource Linking subsystem that connects taxonomy terms to specialized external platforms (Typewolf, Uiverse, assistant-ui, etc.).
2. Completely rewrite the Agent UI stage (`agent-composer`) with modern AI interaction primitives (Composer, Thinking Stream with luminescence, Tool Call Waterfall, Artifact Canvas, Action Dock).
3. Upgrade the Text & Typography domain with micro-metrics inspection (Baseline, Cap-height, Kerning) and Display Art Text treatments (Chrome, Neon, Liquid, Deboss).
4. Redesign Atlas inspection aesthetics (replacing black marching ants with Laser Border Glow & sleek HUD) and implement the "📦 Export Code / Design Spec" modal drawer.

**Tech Stack:** React 19, Vite, Tailwind-compatible CSS Variables & Modern CSS (OKLCH, Backdrop-filter, Subgrid, CSS animations), Node.js native test runner (`node --test`).

---

## File Structure & Responsibilities

| File Path | Responsibility |
| :--- | :--- |
| `demo/src/lib/curated-resources.js` | Maps taxonomy domains and term patterns to global curated authority platforms (Typewolf, Fonts in Use, Uiverse, assistant-ui, 60fps, etc.) |
| `demo/src/stages/agent-composer/Stage.jsx` | Full visual rewrite of Agent UI: Thinking disclosure, Tool Waterfall, Composer HUD, Artifact preview, Message Dock |
| `demo/src/stages/agent-composer/manifest.js` | Expands Agent UI claimed hotspots, variants, knobs and domain notes |
| `demo/src/stages/text-reveal/Stage.jsx` | Expands into full Typography & Art Text Workshop: baseline/metrics guides, display art styles (Chrome, Neon, Glitch, Deboss), kinetic text |
| `demo/src/stages/text-reveal/manifest.js` | Claims typography metrics and display art styles with proper slot types |
| `demo/src/components/CodeExportModal.jsx` | Interactive modal drawer for copying production React + Tailwind component and Design Tokens |
| `demo/src/views/Atlas.jsx` | Shell upgrade: integrates Curated Resources card, Export button, and sleek Inspector HUD |
| `demo/src/atlas.css` | Complete style enhancement: Laser Border Glow, Figma-grade scrubbable knobs, crystal surfaces, fluid type |
| `demo/tests/curated-resources.test.mjs` | Unit tests for domain resource matching and integrity |
| `demo/tests/stage-index.test.mjs` | Regression and expansion tests for stage claims and contracts |

---

### Task 1: Curated Ecosystem Resource Mapping Subsystem

**Files:**
- Create: `demo/src/lib/curated-resources.js`
- Create: `demo/tests/curated-resources.test.mjs`

- [ ] **Step 1: Write the failing test for curated resource matching**

Create `demo/tests/curated-resources.test.mjs`:
```javascript
import test from 'node:test'
import assert from 'node:assert/strict'
import { getCuratedResourcesForTerm, getDomainAuthority } from '../src/lib/curated-resources.js'

test('getDomainAuthority returns authoritative platforms for major domains', () => {
  const typoResources = getDomainAuthority('typography')
  assert.ok(typoResources.length >= 3)
  assert.ok(typoResources.some(r => r.name === 'Typewolf'))
  assert.ok(typoResources.some(r => r.name === 'Fontshare'))

  const agentResources = getDomainAuthority('agentic')
  assert.ok(agentResources.some(r => r.name === 'assistant-ui'))
})

test('getCuratedResourcesForTerm matches specific resources based on term attributes', () => {
  const artTerm = { id: 'atlas-art-text-chrome', termEn: 'Retro Chrome Text', tags: ['typography', 'display', 'art-text'] }
  const matched = getCuratedResourcesForTerm(artTerm, 'text-reveal')
  assert.ok(matched.length > 0)
  assert.ok(matched.some(r => r.name.includes('Uiverse') || r.name.includes('Typewolf') || r.name.includes('CodePen')))
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd "demo" && node --test tests/curated-resources.test.mjs
```
Expected: FAIL with module not found `curated-resources.js`.

- [ ] **Step 3: Implement curated-resources.js**

Create `demo/src/lib/curated-resources.js`:
```javascript
/* Curated Ecosystem Resource Map
 * Maps taxonomy domains, sub-domains, and visual terms to globally recognized
 * specialized design tools, registries, and open-source libraries.
 */

export const DOMAIN_AUTHORITIES = {
  typography: [
    { name: 'Typewolf', url: 'https://www.typewolf.com', tag: '排版圣经', desc: '全球公认的网页排版趋势与真实网站最佳用字搭配指南' },
    { name: 'Fonts in Use', url: 'https://fontsinuse.com', tag: '真实用字归档', desc: '真实世界出版物、网站与包装设计中的字体分类鉴定与历史归档' },
    { name: 'Fontshare', url: 'https://www.fontshare.com', tag: '高品质开源字库', desc: '印度字体基金会 (ITF) 打造的 100% 免费可商用专业 Web 字族' },
    { name: 'Typescale', url: 'https://typescale.com', tag: '字阶计算器', desc: '在线可视化调节 Modular Scale 调和字阶并一键导出 CSS 变量' },
    { name: 'Uiverse Text Effects', url: 'https://uiverse.io/all?category=text', tag: 'CSS 艺术字库', desc: '收集数千种社区纯 CSS/SVG 实现的霓虹、金属、故障与镂空艺术字代码' },
    { name: 'Magic UI Text', url: 'https://magicui.design/docs/components/text-reveal', tag: '文字动效组件', desc: '收录 Blur Fade, Text Reveal, Sparkles, Number Ticker 等现代动效' },
  ],
  agentic: [
    { name: 'assistant-ui', url: 'https://www.assistant-ui.com', tag: 'AI 原生组件库', desc: '针对大模型与 Agent 交互的专业开源 React 组件原语标准' },
    { name: 'Vercel AI SDK Showcase', url: 'https://sdk.vercel.ai', tag: '生成式 UI 范式', desc: '流式文本、生成式 UI、Artifacts 画布与多模态交互的官方权威范式' },
    { name: 'Open-Pencil', url: 'https://github.com/open-pencil/open-pencil', tag: 'AI 编辑器架构', desc: 'AI-native 节点树驱动的设计编辑器，支持代码导出与精确无缝查询' },
    { name: '21st.dev (AI UI)', url: 'https://21st.dev', tag: 'AI 交互组件市场', desc: '收录全球前沿开发者构建的最新 Agent 与 Chat UI 交互开源件' },
  ],
  motion: [
    { name: '60fps.design', url: 'https://60fps.design', tag: '动效词典与录像', desc: '收录数百款主流 iOS/Web 真实 App 交互动效视频与权威参数拆解' },
    { name: 'Framer Motion', url: 'https://motion.dev', tag: '弹簧物理标准', desc: '全球最成熟的弹簧物理、Layout 连续形变与手势动效库' },
    { name: 'GSAP', url: 'https://gsap.com', tag: '高性能动画引擎', desc: '专业级时间轴编排 (Timeline) 与滚动视差驱动器标准' },
    { name: 'Animata', url: 'https://animata.design', tag: '微交互代码片段', desc: '专门收集纯净可复用的现代悬停、微交互、文字及按钮动效' },
  ],
  gestures: [
    { name: '@use-gesture', url: 'https://use-gesture.pmndrs.org', tag: '手势动力引擎', desc: '支持 Drag, Pinch, Wheel, Scroll 全模态，自带越界橡皮筋阻尼算法' },
    { name: 'React Aria Interactions', url: 'https://react-spectrum.adobe.com/react-aria/interactions.html', tag: '无障碍输入原语', desc: 'Adobe 工业级 usePress, useMove, useLongPress 行为层基石' },
    { name: 'WAI-ARIA APG', url: 'https://www.w3.org/WAI/ARIA/apg', tag: 'W3C 交互规范', desc: 'W3C 官方定义的全部界面组件键盘流转与屏幕阅读器标准' },
  ],
  surfaces: [
    { name: 'Realtime Colors', url: 'https://realtimecolors.com', tag: '全套色彩实时预览', desc: '在完整真实网页 UI 上实时预览一整套调色板的对比度与视觉效果' },
    { name: 'OKLCH.com', url: 'https://oklch.com', tag: '感知均匀色盘', desc: '最权威的现代感知均匀色盘工具，可视化色域与感知亮度' },
    { name: 'SmoothShadow', url: 'https://shadows.brumm.af', tag: '贝塞尔分层阴影', desc: '调节多重贝塞尔曲线分布的顶级自然分层漫反射阴影生成器' },
    { name: 'Neumorphism.io', url: 'https://neumorphism.io', tag: '新拟态工坊', desc: '可视化调节软阴影曲率、距离与凹凸模糊度的代码生成器' },
  ],
  layout: [
    { name: 'Bento Grids', url: 'https://bentogrids.com', tag: '便当盒网格案例', desc: '全球最大的 Bento Grid 便当盒设计案例与开源模板索引' },
    { name: 'The Component Gallery', url: 'https://component.gallery', tag: '组件命名圣经', desc: '收录全球各大知名设计系统的真实组件命名与结构变体' },
    { name: 'Land-book', url: 'https://land-book.com', tag: '精选落地页', desc: '精选全球最具设计感与商业转化力的经典与前沿落地页' },
  ],
}

export function getDomainAuthority(domainKey) {
  return DOMAIN_AUTHORITIES[domainKey] || []
}

export function getCuratedResourcesForTerm(term, stageId) {
  const results = []
  if (!term) return results

  const text = `${term.id || ''} ${term.termEn || ''} ${term.termZh || ''} ${(term.tags || []).join(' ')}`.toLowerCase()

  if (stageId === 'text-reveal' || text.includes('text') || text.includes('font') || text.includes('type') || text.includes('blur') || text.includes('reveal')) {
    results.push(...DOMAIN_AUTHORITIES.typography)
  } else if (stageId === 'agent-composer' || text.includes('agent') || text.includes('composer') || text.includes('chat') || text.includes('message') || text.includes('prompt')) {
    results.push(...DOMAIN_AUTHORITIES.agentic)
  } else if (stageId === 'pointer-gestures' || text.includes('gesture') || text.includes('drag') || text.includes('pinch') || text.includes('press')) {
    results.push(...DOMAIN_AUTHORITIES.gestures)
  } else if (stageId === 'surface-transition' || text.includes('motion') || text.includes('transition') || text.includes('spring')) {
    results.push(...DOMAIN_AUTHORITIES.motion)
  } else if (stageId === 'form-anatomy' || stageId === 'data-display' || stageId === 'navigation') {
    results.push(...DOMAIN_AUTHORITIES.layout)
  } else {
    results.push(...DOMAIN_AUTHORITIES.surfaces)
  }

  // Deduplicate by URL
  const seen = new Set()
  return results.filter(item => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd "demo" && node --test tests/curated-resources.test.mjs
```
Expected: PASS with 2 passed tests.

---

### Task 2: Flagship Agent UI Stage Aesthetic & Primitives Rewrite

**Files:**
- Modify: `demo/src/stages/agent-composer/Stage.jsx`
- Modify: `demo/src/stages/agent-composer/manifest.js`
- Modify: `demo/src/atlas.css`

- [ ] **Step 1: Update Agent Composer manifest with comprehensive hotspots & knobs**

Edit `demo/src/stages/agent-composer/manifest.js` to enrich claimed hotspots, fine-grained notes, and add dedicated knobs for:
- `themeMode`: 'dark' | 'light'
- `glowIntensity`: 0.1 to 1.0
- `thinkingExpanded`: boolean
- `showArtifact`: boolean

- [ ] **Step 2: Rewrite Agent Composer Stage component (`Stage.jsx`)**

Rebuild `demo/src/stages/agent-composer/Stage.jsx`:
- Replace crude elements with crystal-like, beautifully crafted UI cards.
- Add **Thinking Disclosure** with breathing amber/blue luminescence and millisecond ticker.
- Add **Tool Call Waterfall** showing real tool arguments, collapsed payload, and execution badges.
- Add **Composer HUD Surface**:
  * Auto-expanding multiline prompt body.
  * Model cascade selector with thinking budget indicator.
  * Multi-modal attachment chip with file icon, size badge, and remove trigger.
  * Token/context capacity pill meter.
  * Voice stream wave orb.
- Add **Artifact Split Canvas** (when `showArtifact` is toggled or clicked) showing rendered interactive component and source code tab.
- Add **Message Action Dock** (copy, regenerate, pin, share) on hover.

- [ ] **Step 3: Add CSS for Flagship Agent UI in `atlas.css`**

Add styling in `demo/src/atlas.css`:
- Crystal surfaces with `backdrop-filter: blur(16px)` and subtle `rgba(255,255,255,0.08)` borders.
- Thinking block pulsing glow animation (`@keyframes thinkingBreath`).
- Tool waterfall status badges.
- Laser border glow highlight style (`.sn-on` replaces marching ants with fluid rim-glow).

- [ ] **Step 4: Run existing test suite to ensure zero regressions**

Run:
```bash
cd "demo" && node --test tests/stage-index.test.mjs
```
Expected: All 13 tests in stage-index pass.

---

### Task 3: Typography & Display Art Text Stage Evolution

**Files:**
- Modify: `demo/src/stages/text-reveal/Stage.jsx`
- Modify: `demo/src/stages/text-reveal/manifest.js`
- Modify: `demo/src/atlas.css`

- [ ] **Step 1: Expand manifest.js with Art Text and Anatomy variants**

In `demo/src/stages/text-reveal/manifest.js`:
Add claims and knobs for:
- Micro-metrics inspection: `baselineGuide` (toggle showing red Baseline, X-height, Cap-height guides).
- Art styles: `retroChrome` (80s metallic chrome), `neonGlow` (cyberpunk neon glow), `deboss` (letterpress engraved text), `liquidGlass` (refractive liquid text), `glitchRgb` (chromatic split).
- Kinetic animations: `scramble` (hacker matrix decrypt), `typewriter`, `blurFade`, `streaming`.
- Knobs: `fontSize`, `kerning`, `tracking`, `guideColor`.

- [ ] **Step 2: Implement Typography & Art Text in Stage.jsx**

In `demo/src/stages/text-reveal/Stage.jsx`:
- Render interactive text specimen (default "VisLexicon" or user editable).
- Render metric overlay lines when `baselineGuide` is on:
  * Baseline (Red solid line)
  * X-height (Blue dotted line)
  * Cap-height (Green dashed line)
  * Descender line (Amber line)
- Apply modern CSS shaders/gradients for Art Text variants:
  * Chrome: metallic gradient + text-shadow
  * Neon: multiple layered drop-shadows with vibrant OKLCH cyan/magenta
  * Deboss: inset shadow illusion with highlight edge
  * Glitch: RGB split clip-path displacement
- Implement live hacker matrix `Text Scramble` decrypt cycle on variant selection or replay.

- [ ] **Step 3: Update CSS for Typography Art & Guides in `atlas.css`**

Add CSS classes: `.tr-chrome`, `.tr-neon`, `.tr-deboss`, `.tr-glitch`, `.tr-metric-line`, etc.

- [ ] **Step 4: Run test suite**

Run:
```bash
cd "demo" && node --test tests/stage-index.test.mjs
```
Expected: PASS.

---

### Task 4: Interactive Code & Design Spec Exporter Drawer

**Files:**
- Create: `demo/src/components/CodeExportModal.jsx`
- Modify: `demo/src/views/Atlas.jsx`
- Modify: `demo/src/atlas.css`

- [ ] **Step 1: Create CodeExportModal component**

Create `demo/src/components/CodeExportModal.jsx`:
- Takes current `stage`, `variant`, `values`, `activeTerm`.
- Generates:
  1. **React + Tailwind TSX Component Code**: Ready to paste directly into a modern Next.js/Vite project.
  2. **Design Tokens / CSS Variables**: Color, padding, border-radius, font-size, stiffness/damping.
  3. **Agent Prompt Directive**: Formatted prompt instructing Claude Code / Cursor to build this exact component with the exported specs.
- Includes "Copy Code", "Copy Tokens", "Copy AI Prompt" buttons with instant checkmark feedback.
- Accessible dialog overlay with Escape key listener and backdrop click to close.

- [ ] **Step 2: Integrate Exporter and Curated Ecosystem into Atlas.jsx**

In `demo/src/views/Atlas.jsx`:
- Add a prominent top-right button: `[ 📦 导出组件代码 ]` with badge.
- In the right-hand panel (`ax-panel`):
  * Render **"📚 专精领域资源与标杆库"** (Curated Ecosystem Map) powered by `getCuratedResourcesForTerm()`.
  * Display each resource with name, tag badge, URL, and purpose description.
  * Render **"📐 规范参数实时面板"** (Active Config Summary).

- [ ] **Step 3: Style the Exporter modal in atlas.css**

Add styles for:
- Glassmorphic modal backdrop and window (`.ax-modal-overlay`, `.ax-modal-box`).
- Syntax-highlighted dark container for code display.
- One-click copy tabs and action bar.

- [ ] **Step 4: Verify build and syntax**

Run:
```bash
cd "demo" && npx oxlint src && npm run build
```
Expected: Exit code 0, clean build.

---

### Task 5: Full Regression Testing & Headless Verification

**Files:**
- Modify: `demo/scripts/verify-atlas.mjs`
- Test: `demo/tests/*.test.mjs`

- [ ] **Step 1: Run all unit tests**

Run:
```bash
cd "demo" && node --test tests/*.test.mjs
```
Expected: All tests pass (435+ existing tests + new curated resources test).

- [ ] **Step 2: Run headless browser verification script**

Run:
```bash
cd "demo" && node scripts/verify-atlas.mjs
```
Expected: Headless browser verification captures updated screenshots and passes all contract checks.

- [ ] **Step 3: Final self-review & report findings**

Verify:
- Typography stage supports baseline guides, art text, and kinetic animation.
- Agent UI displays flagship layout with thinking traces, tools, composer HUD, and artifact split.
- Export modal copies working Tailwind/React code.
- Curated resources display specialized links for every term.
