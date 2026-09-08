// 效果库索引：分组懒加载；缺失的分类文件会被跳过
export const ATLAS_VERSION = 4;
export const CATEGORY_FILES = [
  'text', 'type', 'container', 'entrance', 'transition', 'easing', 'physics',
  'scroll', 'hover', 'cursor', 'gesture', 'toggle', 'form', 'dnd', 'keyboard',
  'layout', 'radial', 'list', 'nav', 'overlay', 'loading', 'table', 'gui',
  'background', 'gradient', 'filter', 'mask', 'shadow', 'threed',
  'svg', 'media', 'particle', 'marquee', 'number', 'dataviz',
  'color', 'grid', 'icon', 'photo', 'motionsys',
  'a11y', 'perf', 'responsive', 'i18n', 'theme', 'state', 'sync',
  'mobile', 'commerce', 'search', 'auth', 'onboard', 'editor', 'map', 'social', 'calendar', 'fintech',
  'webgl', 'shader', 'gsap', 'react', 'd3', 'canvas', 'scrolllib', 'simlib', 'generative', 'pretext', 'wapi',
  'cssnext', 'libs2',
  'ai', 'agent', 'pagestyle', 'ascii'
];

export const GROUPS = [
  { id: 'lang', zh: '设计语言', en: 'Design languages', of: ['pagestyle'] },
  { id: 'type', zh: '文字动效', en: 'Type in motion', of: ['text', 'type'] },
  { id: 'motion', zh: '动效基础', en: 'Motion basics', of: ['container', 'entrance', 'transition', 'easing', 'physics', 'motionsys'] },
  { id: 'inter', zh: '交互与输入', en: 'Interaction', of: ['scroll', 'hover', 'cursor', 'gesture', 'toggle', 'form', 'dnd', 'keyboard'] },
  { id: 'struct', zh: '结构与信息', en: 'Structure', of: ['layout', 'radial', 'list', 'nav', 'overlay', 'loading', 'table', 'gui'] },
  { id: 'material', zh: '材质与光色', en: 'Material & light', of: ['background', 'gradient', 'filter', 'mask', 'shadow', 'threed'] },
  { id: 'craft', zh: '图形与媒体', en: 'Graphics & media', of: ['svg', 'media', 'particle', 'marquee', 'number', 'dataviz', 'ascii'] },
  { id: 'basics', zh: '视觉基本功', en: 'Visual fundamentals', of: ['color', 'grid', 'icon', 'photo'] },
  { id: 'quality', zh: '工程与品质', en: 'Engineering & quality', of: ['a11y', 'perf', 'responsive', 'i18n', 'theme', 'state', 'sync'] },
  { id: 'scene', zh: '场景与业务', en: 'Scenes & domains', of: ['mobile', 'commerce', 'search', 'auth', 'onboard', 'editor', 'map', 'social', 'calendar', 'fintech'] },
  { id: 'libs', zh: '库与引擎', en: 'Libraries & engines', of: ['webgl', 'shader', 'gsap', 'react', 'd3', 'canvas', 'scrolllib', 'simlib', 'generative', 'pretext', 'wapi', 'cssnext', 'libs2'] },
  { id: 'product', zh: '产品语境', en: 'Product surfaces', of: ['ai', 'agent'] }
];

// 每个演示台：wrap = 容器类名，n = 单元数量，cls = 单元附加类，txt = 单元文案
export const STAGES = {
  text:    { wrap: 'fxtext', glyph: true },
  box:     { wrap: 'fxbox', n: 1, txt: ['Motion'] },
  shape:   { wrap: 'fxshape', n: 1 },
  cards:   { wrap: 'fxrow', n: 3, txt: ['One', 'Two', 'Three'] },
  list:    { wrap: 'fxcol', n: 6 },
  grid:    { wrap: 'fxgrid', n: 9 },
  panel:   { wrap: 'fxstack', n: 2, cls: ['fxa', 'fxb'], txt: ['A', 'B'] },
  scroll:  { wrap: 'fxscroll', n: 6, scrollable: true },
  chart:   { wrap: 'fxchart', n: 7, bars: [58, 82, 46, 96, 70, 88, 52] },
  loader:  { wrap: 'fxload', n: 3 },
  surface: { wrap: 'fxsurface', n: 1 },
  card:    { wrap: 'fxcard', n: 1 },
  field:   { wrap: 'fxfield', n: 1, txt: ['Type here'] },
  sw:      { wrap: 'fxsw', n: 3 },
  media:   { wrap: 'fxmedia', n: 1 },
  num:     { wrap: 'fxnum', n: 1, txt: ['2,048'] },
  nav:     { wrap: 'fxnav', n: 5, txt: ['Home', 'Work', 'Notes', 'Lab', 'About'] },
  table:   { wrap: 'fxtable', n: 5 },
  chat:    { wrap: 'fxchat', n: 3, txt: ['What does this effect feel like?', 'Springy, with a short settle.', 'Show me a calmer variant.'] },
  dots:    { wrap: 'fxdots', n: 24 },
  ring:    { wrap: 'fxring', n: 8 },
  table:   { wrap: 'fxtable', n: 5 },
  pill:    { wrap: 'fxpill', n: 5, txt: ['Design', 'Motion', 'Type', 'Color', 'Grid'] },
  marquee: { wrap: 'fxmarquee', n: 1, txt: ['MOTION \u00b7 ATLAS \u00b7 TYPE \u00b7 SCROLL \u00b7 MOTION \u00b7 ATLAS \u00b7 TYPE \u00b7 SCROLL \u00b7 '] },
  ascii:   { wrap: 'fxascii', n: 1, txt: ['\u2591\u2592\u2593\u2588'] },
  asciigrid: { wrap: 'fxagrid', n: 60, txt: Array.from({ length: 60 }, () => '\u2588') },
  page:    { wrap: 'fxpage', n: 6, cls: ['fxbar', 'fxnav2', 'fxhead', 'fxsub', 'fxcta', 'fxart'],
             txt: ['', 'LUMO      Product   About   Support', 'A calmer\ndigital life', '\u7b80\u6d01\u7684\u5de5\u5177\uff0c\u6210\u5c31\u66f4\u4e13\u6ce8\u7684\u4f60\u3002', '\u7acb\u5373\u4f53\u9a8c', ''] }
};

const SANS = 'var(--fx-sans,system-ui)';
const MONO = 'var(--fx-mono,ui-monospace,monospace)';

// 单元内部固定含 b / i / u 三个占位元素，默认隐藏，由各演示台按需开启
const RESET = `.fx>b,.fx>i,.fx>u{display:none}`;

export const BASE = {
  text: `${RESET}.fx{font:700 clamp(44px,8.4vw,96px)/1 ${SANS};letter-spacing:-.03em;color:#23232f;white-space:nowrap}`,
  box: `${RESET}.fx{width:clamp(150px,24vw,220px);height:clamp(150px,24vw,220px);border-radius:18px;background:radial-gradient(92% 72% at 22% 10%,rgba(255,255,255,.52),transparent 58%),radial-gradient(84% 72% at 86% 94%,rgba(240,201,168,.5),transparent 62%),linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);box-shadow:0 20px 44px -20px rgba(48,80,104,.5),inset 0 1px 0 rgba(255,255,255,.42);text-shadow:0 1px 3px rgba(30,50,80,.34);color:#fff;display:flex;align-items:center;justify-content:center;font:500 15px/1 ${SANS};letter-spacing:.02em}`,
  shape: `${RESET}.fxshape{perspective:900px;transform-style:preserve-3d;display:flex;align-items:center;justify-content:center}.fx{width:clamp(140px,22vw,200px);height:clamp(140px,22vw,200px);border-radius:16px;background:radial-gradient(92% 72% at 22% 10%,rgba(255,255,255,.52),transparent 58%),radial-gradient(84% 72% at 86% 94%,rgba(240,201,168,.5),transparent 62%),linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);box-shadow:0 20px 44px -20px rgba(48,80,104,.46),inset 0 1px 0 rgba(255,255,255,.4);transform-style:preserve-3d}`,
  cards: `${RESET}.fxrow{display:flex;gap:18px;align-items:stretch}.fx{width:150px;height:190px;border-radius:12px;background:#fcfcfb;border:1px solid #e4e5e0;box-shadow:0 1px 2px rgba(48,66,92,.05);display:flex;flex-direction:column;justify-content:flex-end;padding:14px;font:500 13px/1.3 ${SANS};color:#23232f}.fx>b{display:block;height:64px;border-radius:8px;background:linear-gradient(140deg,#eceee6,#e3e6dc);margin-bottom:auto}`,
  list: `${RESET}.fxcol{display:flex;flex-direction:column;gap:10px;width:min(420px,84%)}.fx{height:52px;border-radius:10px;background:#fcfcfb;border:1px solid #e4e5e0;display:flex;align-items:center;gap:12px;padding:0 14px;font:500 14px/1 ${SANS};color:#23232f}.fx>i{display:block;width:28px;height:28px;border-radius:8px;background:#eceee6;flex:none}.fx>u{display:block;flex:1;height:8px;border-radius:4px;background:#eceee6;text-decoration:none}`,
  grid: `${RESET}.fxgrid{display:grid;grid-template-columns:repeat(3,92px);gap:14px}.fx{height:92px;border-radius:12px;background:#fcfcfb;border:1px solid #e4e5e0}`,
  panel: `${RESET}.fxstack{position:relative;width:min(520px,84%);height:min(320px,46vh);border-radius:16px;overflow:hidden;background:#fcfcfb;border:1px solid #e4e5e0}.fxa,.fxb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:600 22px/1 ${SANS}}.fxa{background:#f4f5f1;color:#23232f}.fxb{background:radial-gradient(92% 72% at 22% 10%,rgba(255,255,255,.52),transparent 58%),radial-gradient(84% 72% at 86% 94%,rgba(240,201,168,.5),transparent 62%),linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:#fff}`,
  scroll: `${RESET}.fxscroll{width:min(440px,84%);height:min(340px,52vh);overflow:auto;border-radius:16px;background:#fcfcfb;border:1px solid #e4e5e0;padding:22px;display:flex;flex-direction:column;gap:18px;scroll-behavior:smooth}.fx{flex:none;height:140px;border-radius:12px;background:linear-gradient(140deg,#eceee6,#e4e7dd);display:flex;align-items:center;justify-content:center;font:500 12px ${MONO};color:#9a9d94}.fx::after{content:'scroll \u2195'}`,
  ring: `${RESET}.fxring{position:relative;width:min(340px,74%);aspect-ratio:1;display:flex;align-items:center;justify-content:center}.fx{position:absolute;left:50%;top:50%;width:74px;height:96px;margin:-48px 0 0 -37px;border-radius:10px;background:radial-gradient(80% 70% at 26% 14%,rgba(255,255,255,.45),transparent 60%),linear-gradient(150deg,#5fa2b8,#e5a68f);border:2px solid #fcfcfb;box-shadow:0 8px 20px -6px rgba(48,80,104,.32)}`,
  chart: `${RESET}.fxchart{display:flex;align-items:flex-end;gap:14px;height:min(260px,40vh)}.fx{width:44px;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,#7cb6c8,#4a7fa0 60%,#43679a)}`,
  loader: `${RESET}.fxload{display:flex;align-items:center;justify-content:center;gap:12px}.fx{width:16px;height:16px;border-radius:50%;background:#23232f}`,
  surface: `${RESET}.fxsurface{width:min(540px,88%);height:min(330px,48vh);border-radius:16px;overflow:hidden;position:relative;border:1px solid #e6e7ea;background:#fff}.fx{position:absolute;inset:0}`,
  card: `${RESET}.fxcard{width:min(320px,84%)}.fx{background:#fff;border:1px solid #e6e7ea;border-radius:10px;padding:16px;box-shadow:0 1px 2px rgba(48,66,92,.06)}.fx>b{display:block;height:110px;border-radius:6px;background:#eef0f2;margin-bottom:14px}.fx>u{display:block;height:9px;width:72%;border-radius:5px;background:#e5e7eb;text-decoration:none}.fx>i{display:block;height:9px;width:44%;border-radius:5px;background:#eef0f2;margin-top:9px}`,
  field: `${RESET}.fxfield{width:min(360px,84%)}.fx{height:48px;border:1px solid #d9dbe0;border-radius:8px;background:#fff;display:flex;align-items:center;gap:2px;padding:0 14px;font:400 15px/1 ${SANS};color:#9a9ca6}.fx>u{display:block;width:2px;height:20px;background:#3f6f92;text-decoration:none}`,
  sw: `${RESET}.fxsw{display:flex;flex-direction:column;gap:18px}.fx{width:54px;height:30px;border-radius:15px;background:#d9dbe0;position:relative}.fx>b{display:block;position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(48,66,92,.28)}`,
  media: `${RESET}.fxmedia{width:min(440px,86%)}.fx{aspect-ratio:16/9;border-radius:10px;overflow:hidden;position:relative;background:radial-gradient(70% 90% at 20% 8%,rgba(255,255,255,.38),transparent 60%),linear-gradient(135deg,#3f6f92,#5fa2b8 40%,#e5a68f 76%,#f4dcb8);box-shadow:0 16px 36px -18px rgba(48,80,104,.44)}.fx>b{display:block;position:absolute;inset:0}`,
  num: `${RESET}.fxnum{display:flex;align-items:baseline;gap:6px}.fx{font:700 clamp(52px,11vw,110px)/1 ${MONO};letter-spacing:-.04em;color:#23232f;font-variant-numeric:tabular-nums}`,
  nav: `${RESET}.fxnav{display:flex;gap:4px;background:#fff;border:1px solid #e6e7ea;border-radius:12px;padding:7px;position:relative}.fx{padding:9px 14px;border-radius:8px;font:500 14px/1 ${SANS};color:#5a5c67;position:relative}`,
  table: `${RESET}.fxtable{width:min(430px,86%);border:1px solid #e6e7ea;border-radius:10px;overflow:hidden;background:#fff}.fx{display:flex;align-items:center;gap:12px;height:44px;padding:0 14px;border-top:1px solid #f0f1f3;font:500 13px/1 ${SANS};color:#23232f}.fx:first-child{border-top:0;background:#fafbfc}.fx>i{display:block;width:22px;height:22px;border-radius:6px;background:#eef0f2;flex:none}.fx>u{display:block;flex:1;height:8px;border-radius:4px;background:#f0f1f3;text-decoration:none}`,
  chat: `${RESET}.fxchat{width:min(410px,86%);display:flex;flex-direction:column;gap:12px}.fx{max-width:84%;padding:12px 14px;border-radius:14px;background:#f2f3f5;font:400 14px/1.5 ${SANS};color:#23232f}.fx:nth-child(2){align-self:flex-end;background:linear-gradient(150deg,#5590ad,#3f6f92);color:#fff}`,
  dots: `${RESET}.fxdots{position:relative;width:min(440px,86%);height:min(280px,42vh)}.fx{position:absolute;width:8px;height:8px;border-radius:50%;background:linear-gradient(150deg,#7cb6c8,#4a6f9c);left:calc(4% + var(--i)*4%);top:calc(50% - 4px)}`,
  marquee: `${RESET}.fxmarquee{width:min(470px,90%);overflow:hidden;mask:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}.fx{width:max-content;font:700 clamp(24px,3.8vw,42px)/1.15 ${SANS};letter-spacing:-.025em;color:#3f6f92;white-space:nowrap}`,
  pill: `${RESET}.fxpill{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:400px}.fx{padding:9px 15px;border-radius:999px;border:1px solid #dcdee3;background:#fff;font:500 13px/1 ${SANS};color:#23232f}`,
  ascii: `${RESET}.fxascii{display:flex;align-items:center;justify-content:center}.fx{font-family:${MONO};white-space:pre;letter-spacing:0;color:#23232f;font-variant-ligatures:none}`,
  asciigrid: `${RESET}.fxagrid{display:grid;grid-template-columns:repeat(12,1.5em);justify-content:center;font:400 22px/1.1 ${MONO};color:#23232f}.fx{text-align:center}`,
  page: `${RESET}
@keyframes fxsheen{0%{transform:translate3d(-150%,0,0) skewX(-14deg)}62%,100%{transform:translate3d(280%,0,0) skewX(-14deg)}}
.fxpage{width:min(660px,97%);border:1px solid rgba(48,80,104,.1);border-radius:13px;overflow:hidden;background:#fff;display:grid;grid-template-columns:1fr 43%;grid-template-areas:"bar bar" "nav nav" "head art" "sub art" "cta art";align-content:start;position:relative;isolation:isolate;box-shadow:0 1px 2px rgba(48,80,104,.05),0 26px 54px -26px rgba(28,40,26,.34)}
.fxpage::after{content:'';position:absolute;top:-30%;bottom:-30%;left:0;width:26%;z-index:6;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(255,255,255,.42) 44%,rgba(255,255,255,.1) 64%,transparent);mix-blend-mode:soft-light;animation:fxsheen 7.5s cubic-bezier(.42,0,.2,1) infinite}
.fxbar{grid-area:bar;height:27px;background:#f4f4f1;border-bottom:1px solid #ebece5;display:flex;align-items:center;gap:9px;padding:0 11px;flex:none}
.fxbar::before{content:'';flex:none;width:6px;height:6px;border-radius:50%;background:#dcddd6;box-shadow:9px 0 0 #dcddd6,18px 0 0 #dcddd6}
.fxbar::after{content:'';flex:1;max-width:52%;margin-left:16px;height:13px;border-radius:7px;background:#fff;border:1px solid #ebece5}
.fxnav2{grid-area:nav;display:flex;align-items:center;height:33px;padding:0 17px;font:600 9.5px/1 ${SANS};letter-spacing:.01em;color:#23232f;border-bottom:1px solid #f0f1ea;white-space:pre;overflow:hidden}
.fxhead{grid-area:head;padding:26px 19px 0;font:700 27px/1.1 ${SANS};letter-spacing:-.03em;color:#23232f;white-space:pre-line}
.fxsub{grid-area:sub;padding:11px 19px 0;font:400 10.5px/1.62 ${SANS};color:#7c7e73;max-width:32ch}
.fxcta{grid-area:cta;margin:17px 19px 26px;justify-self:start;align-self:start;padding:8px 15px;border-radius:6px;background:#23232f;color:#fff;font:600 10px/1 ${SANS};white-space:nowrap}
.fxart{grid-area:art;background:linear-gradient(150deg,#eceee6,#e3e6dc);min-height:172px;position:relative;overflow:hidden}`
};

export async function loadCategories() {
  const mods = await Promise.all(CATEGORY_FILES.map(async (f) => {
    try { const m = (await import(`./${f}.js`)).default; return m && m.items && m.items.length ? m : null; }
    catch (e) { console.warn('fx: skipped', f, e.message); return null; }
  }));
  return mods.filter(Boolean);
}

/* ---- CSS 作用域化：把条目 CSS 关进一个 .scope 里，供画廊墙同时播放数十个效果 ---- */
function splitBlocks(src) {
  const out = []; let depth = 0, start = 0, inStr = null;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inStr) { if (ch === inStr && src[i - 1] !== '\\') inStr = null; continue; }
    if (ch === '"' || ch === "'") { inStr = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { out.push(src.slice(start, i + 1)); start = i + 1; } }
  }
  if (start < src.length && src.slice(start).trim()) out.push(src.slice(start));
  return out;
}

export function scopeCss(css, scope, sim) {
  if (!css) return '';
  const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]);
  let src = css;
  names.forEach(n => { src = src.replace(new RegExp('\\b' + n + '\\b', 'g'), n + '_' + scope); });
  const pre = '.' + scope;
  const walk = (chunk) => splitBlocks(chunk).map(b => {
    const at = b.match(/^\s*(@[\w-]+)/);
    const head = b.slice(0, b.indexOf('{'));
    const body = b.slice(b.indexOf('{') + 1, b.lastIndexOf('}'));
    if (at) {
      const kw = at[1].toLowerCase();
      if (kw === '@keyframes' || kw === '@font-face' || kw === '@property') return b;
      if (kw === '@media' || kw === '@supports' || kw === '@container' || kw === '@layer') return head + '{' + walk(body) + '}';
      return b;
    }
    if (b.indexOf('{') < 0) return b;
    const one = (s) => {
      s = s.trim(); if (!s) return '';
      if (/^(html|body|:root)\b/.test(s)) return pre + s.replace(/^(html|body|:root)/, '');
      return pre + ' ' + s;
    };
    const parts = [];
    head.split(',').forEach(s => {
      const a = one(s); if (a) parts.push(a);
      // 画廊墙里没有真实指针：把交互态另外挂到宿主的 .fxsim 上（只需切一个 class）
      if (sim && /:hover|:active|:focus/.test(s)) {
        const cleaned = s.replace(/:hover|:active|:focus-visible|:focus/g, '').trim();
        if (cleaned) parts.push(pre + '.fxsim ' + (/^(html|body|:root)/.test(cleaned) ? '' : '') + cleaned);
        else parts.push(pre + '.fxsim');
      }
    });
    const sel = parts.join(',');
    return sel + '{' + body + '}';
  }).join('\n');
  return walk(src);
}

/* ---- 提示词 ---- */
export function composePrompt(item, cat, lang, params, motion) {
  const ps = (item.params || []).map(p => {
    const v = params[p.k] ?? p.def;
    const label = lang === 'zh' ? p.zh : p.en;
    if (p.opts) { const o = p.opts.find(o => o.v === v) || p.opts[0]; return `${label}=${lang === 'zh' ? o.zh : o.en}`; }
    return `${label}=${v}${p.unit || ''}`;
  });
  const m = motion || {};
  if (m.ease) ps.push(lang === 'zh' ? `缓动曲线=cubic-bezier(${m.ease})` : `easing=cubic-bezier(${m.ease})`);
  if (m.speed && m.speed !== 1) ps.push(lang === 'zh' ? `整体节奏=${m.speed}×` : `tempo=${m.speed}×`);
  const vals = ps.join(lang === 'zh' ? '，' : ', ');
  if (lang === 'zh') {
    return [
      `请实现一个前端效果：「${item.zh}」（${item.en}），属于「${cat.zh}」。`,
      `想要的感觉：${item.dz}。`,
      `做法：${item.pz}`,
      vals ? `参数：${vals}。` : '',
      `落地要求：只动视觉与动效，不改内容结构；只动画 transform / opacity / filter 这类合成属性；遵循 prefers-reduced-motion；移动端能优雅降级。`
    ].filter(Boolean).join('\n');
  }
  return [
    `Build a front-end effect called "${item.en}" (${item.zh}), from the "${cat.en}" family.`,
    `Feel: ${item.de}.`,
    `How: ${item.pe}`,
    vals ? `Params: ${vals}.` : '',
    `Constraints: visuals and motion only, keep the content structure; animate compositable properties (transform / opacity / filter); respect prefers-reduced-motion; degrade gracefully on mobile.`
  ].filter(Boolean).join('\n');
}
