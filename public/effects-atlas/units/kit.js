// 可调单元（Tunable Unit）共用工具。
// 一个单元 = 一类组件（不是某个库的某个组件）。单元模块导出：
//   { id, zh, en, dz, de, componentTypes, params, size, mount(host, params) -> {update, destroy}, spec(params), prompt(params, lang) }
// 图鉴详情页、Playground、MCP 都读同一份单元定义，参数和提示词只写一次。

export const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Hiragino Sans GB","Helvetica Neue","Microsoft YaHei",sans-serif';

export const ACCENTS = {
  green: { zh: '绿', en: 'Green', hex: '#34c759' },
  blue: { zh: '蓝', en: 'Blue', hex: '#0a84ff' },
  ink: { zh: '墨', en: 'Ink', hex: '#1d1d1f' },
  orange: { zh: '橙', en: 'Orange', hex: '#ff9f0a' },
  pink: { zh: '粉', en: 'Pink', hex: '#ff375f' },
};

export const THEMES = {
  light: { bg: '#f5f5f7', surface: '#ffffff', text: '#1d1d1f', sub: '#6e6e73', line: 'rgba(0,0,0,.08)', track: '#e3e3e8', knob: '#ffffff' },
  dark: { bg: '#161617', surface: '#2c2c2e', text: '#f5f5f7', sub: '#a1a1a6', line: 'rgba(255,255,255,.12)', track: '#3a3a3c', knob: '#f5f5f7' },
};

/** 参数工厂：range / seg（分段选项）。 */
export const range = (k, zh, en, min, max, step, def, unit = '') => ({ k, zh, en, kind: 'range', min, max, step, def, unit });
export const seg = (k, zh, en, opts, def) => ({ k, zh, en, kind: 'seg', opts: opts.map(([v, oz, oe]) => ({ v, zh: oz, en: oe })), def });
export const fillParam = () => seg('fill', '底色', 'Fill', [['light', '浅', 'Light'], ['dark', '深', 'Dark']], 'light');
export const accentParam = (def = 'blue') => seg('accent', '强调色', 'Accent', Object.entries(ACCENTS).map(([v, a]) => [v, a.zh, a.en]), def);

export function defaults(unit) {
  const out = {};
  for (const p of unit.params) out[p.k] = p.def;
  return out;
}

export function withDefaults(unit, params = {}) {
  const out = defaults(unit);
  for (const p of unit.params) {
    const v = params[p.k];
    if (v === undefined || v === null || v === '') continue;
    if (p.kind === 'range') {
      const n = Number(v);
      if (Number.isFinite(n)) out[p.k] = Math.min(p.max, Math.max(p.min, n));
    } else if (p.opts.some(o => o.v === v)) out[p.k] = v;
  }
  return out;
}

export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 速度 1–100 → 弹簧刚度/阻尼。50 ≈ iOS 默认手感。 */
export function springFromSpeed(speed) {
  const s = Math.max(1, Math.min(100, Number(speed) || 50));
  return { stiffness: Math.round(120 + s * 7), damping: Math.round(14 + s * 0.24) };
}

/** 临界附近的阻尼弹簧，返回取消函数。 */
export function spring({ from, to, stiffness = 470, damping = 26, velocity = 0, onUpdate, onDone }) {
  if (reducedMotion()) { onUpdate(to); onDone?.(); return () => {}; }
  let x = from, v = velocity, last = performance.now(), raf = 0, alive = true;
  const step = (now) => {
    if (!alive) return;
    const dt = Math.min(0.032, (now - last) / 1000); last = now;
    const f = -stiffness * (x - to) - damping * v;
    v += f * dt; x += v * dt;
    if (Math.abs(v) < 0.01 && Math.abs(x - to) < 0.001) { onUpdate(to); onDone?.(); return; }
    onUpdate(x); raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => { alive = false; cancelAnimationFrame(raf); };
}

/** 在 host 里挂一个 shadow root，样式互不污染。 */
export function shell(host, css) {
  const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
  root.innerHTML = '';
  const style = document.createElement('style');
  style.textContent = `:host{all:initial;display:flex;align-items:center;justify-content:center;width:100%;height:100%;min-height:340px;font-family:${FONT};-webkit-font-smoothing:antialiased;transition:background .3s}
:host([data-bare]){width:auto;height:auto;min-height:0;background:transparent!important}
:host([data-bare]) .cap{display:none}
*{box-sizing:border-box}button{font:inherit;color:inherit}
${css}`;
  root.append(style);
  return root;
}

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

export function applyTheme(host, fill) {
  const t = THEMES[fill] || THEMES.light;
  // data-bare：放在 Playground 画布上时不铺底色、不显示说明，只留组件本身
  if (!host.hasAttribute('data-bare')) host.style.background = t.bg;
  host.style.setProperty('--bg', t.bg);
  for (const [k, v] of Object.entries(t)) host.style.setProperty(`--${k}`, v);
  return t;
}

/** 把参数写成人能读的一行一行（提示词里的“参数”段）。 */
export function describeParams(unit, params, lang) {
  return unit.params.map(p => {
    const label = lang === 'zh' ? p.zh : p.en;
    const v = params[p.k];
    if (p.kind === 'seg') {
      const o = p.opts.find(x => x.v === v) || p.opts[0];
      return `- ${label}${lang === 'zh' ? '：' : ': '}${lang === 'zh' ? o.zh : o.en}`;
    }
    return `- ${label}${lang === 'zh' ? '：' : ': '}${v}${p.unit}`;
  }).join('\n');
}

/** 统一的提示词骨架：做什么 / 长什么样 / 怎么动 / 参数 / 底线。 */
export function composeUnitPrompt(unit, params, lang, body) {
  const b = body[lang] || body.zh;
  const head = lang === 'zh'
    ? `请做一个「${unit.zh}」组件（${unit.en}）。`
    : `Build a ${unit.en} component.`;
  const rules = lang === 'zh'
    ? '底线：只用 transform / opacity 做动画；尊重 prefers-reduced-motion（关掉弹簧，直接到终点）；键盘可操作、有清晰的焦点环；颜色对比度满足 WCAG AA。'
    : 'Baseline: animate only transform / opacity; respect prefers-reduced-motion (skip the spring, jump to the end); fully keyboard operable with a visible focus ring; colour contrast meets WCAG AA.';
  return [
    head,
    `${lang === 'zh' ? '长相：' : 'Look: '}${b.look}`,
    `${lang === 'zh' ? '交互：' : 'Behaviour: '}${b.behave}`,
    `${lang === 'zh' ? '动效：' : 'Motion: '}${b.motion}`,
    `${lang === 'zh' ? '参数：' : 'Parameters:'}\n${describeParams(unit, params, lang)}`,
    rules,
  ].join('\n');
}
