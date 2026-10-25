// DesignSpec 组装：Playground（浏览器）和 MCP（Node）共用这一份，保证两边产出完全一致。
import { UNIT_BY_ID, UNITS, describeUnit } from './index.js';

export function composeDesignSpec(args = {}) {
  const theme = args.theme === 'dark' ? 'dark' : 'light';
  const width = args.width || 1440, height = args.height || 900;
  const parts = (args.parts || []).map((p, i) => {
    const unit = UNIT_BY_ID[p.unitId];
    if (!unit) throw new Error(`未知单元 ${p.unitId}；可用：${UNITS.map(x => x.id).join(', ')}`);
    const d = describeUnit(unit, { ...(p.values || {}), fill: theme });
    return { n: i + 1, unitId: unit.id, name: d.name, values: d.values, tokens: d.tokens, prompt: d.prompt, frame: p.frame, note: p.note };
  });

  const color = {}, radius = {}, motion = {};
  for (const p of parts) {
    const key = parts.filter(q => q.unitId === p.unitId).length > 1 ? `${p.unitId}#${p.n}` : p.unitId;
    const t = p.tokens;
    for (const [k, v] of Object.entries(t.color || {})) if (typeof v === 'string') color[`${key}.${k}`] = v;
    if (typeof t.radius === 'number') radius[key] = t.radius;
    else for (const [k, v] of Object.entries(t.radius || {})) radius[`${key}.${k}`] = v;
    if (t.motion) motion[key] = t.motion;
  }

  const where = (f, lang) => {
    if (!f) return '';
    const x = Math.round(f.x), y = Math.round(f.y);
    return lang === 'zh' ? `，放在画布 (${x}, ${y})` : `, placed at (${x}, ${y})`;
  };
  const compose = (lang) => [
    `# ${args.title || (lang === 'zh' ? '未命名界面' : 'Untitled screen')}`,
    args.intent ? (lang === 'zh' ? `目标：${args.intent}` : `Goal: ${args.intent}`) : '',
    lang === 'zh'
      ? `画布 ${width}×${height}，${theme === 'dark' ? '深色' : '浅色'}主题。下面每一节是一块界面，按顺序实现，位置是左上角坐标（px）。`
      : `Canvas ${width}×${height}, ${theme} theme. Each section below is one part; implement in order. Positions are top-left coordinates in px.`,
    ...parts.map(p => `\n## ${p.n}. ${p.name[lang] || p.name.zh}${where(p.frame, lang)}${p.note ? (lang === 'zh' ? `。用途：${p.note}` : `. Purpose: ${p.note}`) : ''}\n${p.prompt[lang]}`),
    (args.references || []).length
      ? `\n${lang === 'zh' ? '参考' : 'References'}:\n${args.references.map(r => `- ${r.url}${r.why ? ` — ${r.why}` : ''}`).join('\n')}`
      : '',
  ].filter(Boolean).join('\n');

  const acceptance = [];
  for (const p of parts) {
    const t = p.tokens, k = `${p.n}. ${p.name.en}`;
    if (t.size?.width && t.size?.height) acceptance.push(`${k}: ${t.size.width}×${t.size.height}px`);
    else if (t.size?.height) acceptance.push(`${k}: height ${t.size.height}px`);
    if (typeof t.radius === 'number') acceptance.push(`${k}: radius ${t.radius}px`);
    if (t.motion?.stiffness) acceptance.push(`${k}: spring stiffness ${t.motion.stiffness} / damping ${t.motion.damping}`);
  }
  acceptance.push('prefers-reduced-motion: springs are skipped', 'every control is reachable and operable by keyboard with a visible focus ring', 'text contrast ≥ 4.5:1 (WCAG AA)');

  return {
    specVersion: '1',
    id: `spec-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    title: args.title || 'Untitled screen',
    ...(args.intent ? { intent: { zh: args.intent } } : {}),
    canvas: { width, height, theme },
    styles: args.styles || [],
    tokens: { color, radius, motion },
    parts: parts.map(({ n, name, prompt, ...rest }) => rest),
    references: args.references || [],
    prompt: { zh: compose('zh'), en: compose('en') },
    acceptance,
  };
}
