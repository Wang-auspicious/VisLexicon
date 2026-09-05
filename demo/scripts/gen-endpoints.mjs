/* 生成 L4 分发层的静态端点：llms.txt · llms-full.txt · lexicon manifest
 *  · 每词条 JSON · 示例 Spec JSON / agent.md
 * 运行：node scripts/gen-endpoints.mjs（构建前自动执行） */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { AXES, ENTRIES } from '../src/entries.js'
import { COMPONENTS, LIBRARIES } from '../src/index.js'
import { endpointFor } from '../src/lib/endpoints.js'

const here = dirname(fileURLToPath(import.meta.url))
const pub = join(here, '..', 'public')

function lexJson(e) {
  return {
    lever: 'lexicon', id: e.id, term_en: e.term, term_zh: e.zh, axis: e.axis,
    aliases: e.alias, definition_zh: e.def, notation: e.notation,
    genes: (e.genes || []).map((g) => ({ gene: g.g, value: g.v })),
    minimal_code: { css: e.code },
    params: (e.params || []).map((q) => ({ key: q.k, label: q.label, min: q.min, max: q.max, step: q.step, unit: q.unit, default: q.def })),
    anti_patterns: [e.anti].filter(Boolean),
    tech_notes: [e.tech].filter(Boolean),
    common_pairings: e.pair, related: e.contrast || [],
    wild: (e.wild || []).map((w) => ({ what: w.what, source: w.src, note: w.note })),
    media: { poster: `cdn://lexicon/${e.id}/poster@2x.png`, keyframes: ['f0.png', 'f1.png', 'f2.png', 'f3.png'] },
    /* 端点为部署相对路径：本仓库静态托管后 curl {origin}/lexicon/{id}.json 即得 */
    endpoint: endpointFor(e.id),
    license: 'CC BY-SA 4.0 (词条数据)',
  }
}

mkdirSync(join(pub, 'lexicon'), { recursive: true })
mkdirSync(join(pub, 'spec'), { recursive: true })
mkdirSync(join(pub, 'spec', 'sp_9f3k2'), { recursive: true })

for (const e of ENTRIES) {
  writeFileSync(join(pub, 'lexicon', `${e.id}.json`), JSON.stringify(lexJson(e), null, 2) + '\n')
}

const manifest = {
  spec_version: '1.0',
  totals: { terms: ENTRIES.length, libraries: LIBRARIES.length, components: COMPONENTS.length },
  axes: AXES.map((a) => ({ id: a.id, zh: a.zh, en: a.en, glyph: a.glyph })),
  endpoints: {
    lexicon: '/lexicon/{id}.json',
    llms: '/llms.txt',
    spec: '/spec/{id}.json',
  },
}
writeFileSync(join(pub, 'lexicon', 'index.json'), JSON.stringify(manifest, null, 2) + '\n')

/* llms.txt */
const lines = [
  '# VisLexicon（视元）',
  '',
  '> 给人类用的「前端视觉选型器」，给 Agent 用的「设计上下文供给站」。',
  '> 挑的结果是 Design Spec；词表可解引用；每词条/组件有稳定 JSON 端点。',
  '',
  '## 关键端点（部署根相对路径，静态托管即生效）',
  '- /llms.txt (本文件)',
  '- /llms-full.txt (全库数据)',
  '- /lexicon/index.json (词表清单)',
  '- /lexicon/{id}.json (单词条, 无鉴权)',
  '- /spec/{id}.json (Design Spec)',
  '- /spec/{id}/agent.md (Spec 使用指引, LLM 优化)',
  '',
  '## 生态接入（真实可用的组件级协议）',
  '- npx shadcn@latest mcp — shadcn 官方 MCP server，Agent 直连 Registry',
  '- npx shadcn@latest add "https://magicui.design/r/bento-grid.json" — Registry 端点直装',
  '- https://ui.shadcn.com/docs/mcp — MCP 配置文档',
  '',
  '## 五轴',
]
for (const a of AXES) lines.push(`- ${a.zh} (${a.en}, ${a.glyph}): ` + ENTRIES.filter((e) => e.axis === a.id).map((e) => `${e.term} (${e.id})`).join(', '))

lines.push('', '## 词表全目录（lex: 前缀可解引用）')
for (const e of ENTRIES) {
  lines.push(`- lex:${e.id} — ${e.term} / ${e.zh} — ${e.def} — ${e.notation || ''} — ${endpointFor(e.id)}`)
}
lines.push('', '## 生态索引（组件级，Registry 超集）')
for (const c of COMPONENTS) lines.push(`- ${c.id} — ${c.title} — ${c.note} — ${c.site}`)

writeFileSync(join(pub, 'llms.txt'), lines.join('\n') + '\n')

/* llms-full.txt */
const full = [
  '# VisLexicon 全库数据（机器可读索引）',
  '',
  '## 词条 JSON',
  ...ENTRIES.map((e) => `- ${endpointFor(e.id)}`),
  '',
  '## 词条完整内容',
]
for (const e of ENTRIES) {
  full.push('', `### lex:${e.id} — ${e.term} (${e.zh})`, `- 轴: ${e.axis}`, `- 定义: ${e.def}`, `- 记谱: ${e.notation || '—'}`, `- 别名: ${e.alias.join(' / ')}`, `- 最小实现: ${e.code.split('\n')[0]}…`, `- 端点: ${endpointFor(e.id)}`)
}
writeFileSync(join(pub, 'llms-full.txt'), full.join('\n') + '\n')

/* 示例 Spec 端点 */
const spec = {
  spec_version: '1.0',
  spec_id: 'sp_9f3k2',
  intent: 'landing page, dark, dev-tool vibe',
  target: { framework: 'react', style: 'tailwind', motion: 'css' },
  lexicon: {
    aesthetic: ['lex:aurora-gradient', 'lex:glassmorphism'],
    layout: ['lex:bento-grid'],
    interaction: ['lex:magnetic-button'],
    motion: ['lex:spring'],
  },
  interactions: [{ target: 'cta-button', pattern: 'lex:magnetic-button', params: { strength: 0.4 } }],
  tokens: { colors: { bg: '#0B0B0E', accent: '#6E56CF' }, radius: '14px', breakpoints: ['sm:640', 'md:768', 'lg:1024', 'xl:1280'] },
  acceptance: ['bento grid 在 md 断点降为单列', 'magnetic button 使用 spring 物理而非 linear ease', '对比度满足 WCAG AA'],
  assets: [{ id: 'i/abc123', fetch_via: 'vislexicon-reader', fallback_thumb: 'cdn://…' }],
  agent_instructions_url: '/spec/sp_9f3k2/agent.md',
}
writeFileSync(join(pub, 'spec', 'sp_9f3k2.json'), JSON.stringify(spec, null, 2) + '\n')
const agentMd = [
  '# Agent 指引：sp_9f3k2',
  '',
  '按本 Spec 实现目标页面。阅读顺序与要点：',
  '',
  '1. **先读要点中的 lex: 词条**：GET {origin}/lexicon/{id}.json 取定义、minimal_code、参数域与关键帧（VLM 无法看视频时用 keyframes 字段）。',
  '2. **构图**：aesthetic 词条定基调 → layout 词条定分块 → interaction/motion 词条挂到具体元素。',
  '3. **参数即验收**：interactions.params 与演示参数一致；acceptance 是自检清单，逐项核对。',
  '4. **取图**：assets 用 vislexicon-reader 用户侧取回；失败时以 spec 字段为准，不用低清图猜。',
  '5. **失败回退**：某词条实现不了时，保留结构、优先保证 acceptance 中层级与间距两项。',
].join('\n')
writeFileSync(join(pub, 'spec', 'sp_9f3k2', 'agent.md'), agentMd + '\n')

console.log(`[gen-endpoints] ${ENTRIES.length} lexicon json · llms.txt · llms-full.txt · spec/sp_9f3k2.*`)
