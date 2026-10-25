import { range, seg, fillParam, accentParam, ACCENTS, applyTheme, shell, el, spring, springFromSpeed, composeUnitPrompt } from './kit.js';

// 分段控件：选中块在选项之间滑动。滑块形态（浮起的胶囊 / 底部下划线 / 强调色块）用参数切换。
const LABELS = { zh: ['日', '周', '月', '年', '全部'], en: ['Day', 'Week', 'Month', 'Year', 'All'] };

const unit = {
  id: 'segmented',
  zh: '分段控件', en: 'Segmented control',
  dz: '选中块像被手推过去一样滑到新位置', de: 'The selection glides over as if pushed by hand',
  componentTypes: ['segmented-control', 'tabs', 'toggle-group'],
  size: { w: 340, h: 60 },
  params: [
    fillParam(),
    accentParam('ink'),
    seg('indicator', '选中样式', 'Indicator', [['lifted', '浮起', 'Lifted'], ['solid', '色块', 'Solid'], ['underline', '下划线', 'Underline']], 'lifted'),
    range('count', '选项数', 'Options', 2, 5, 1, 4),
    range('corner', '圆角', 'Corner', 0, 20, 1, 10, 'px'),
    range('speed', '速度', 'Speed', 1, 100, 1, 55),
  ],
  spec(p) {
    return {
      size: { height: 36, segmentMinWidth: 64, padding: 3, fontSize: 13 },
      radius: { group: p.corner, indicator: Math.max(0, p.corner - 3) },
      indicator: p.indicator, count: p.count, color: { accent: ACCENTS[p.accent].hex },
      motion: { type: 'spring', ...springFromSpeed(p.speed) },
    };
  },
  mount(host, initial, ctx = {}) {
    const root = shell(host, `
      .wrap{display:flex;flex-direction:column;align-items:center;gap:22px}
      :host([data-bare]) .wrap{gap:0}
      .group{position:relative;display:inline-flex;padding:var(--pad);background:var(--groupbg)}
      .group.underline{background:transparent;box-shadow:inset 0 -1px 0 var(--line)}
      .ind{position:absolute;top:var(--pad);bottom:var(--pad);left:0;pointer-events:none;will-change:transform,width}
      .lifted .ind{background:var(--surface);box-shadow:0 1px 2px rgba(0,0,0,.08),0 3px 8px -2px rgba(0,0,0,.12)}
      .solid .ind{background:var(--accent)}
      .underline .ind{top:auto;bottom:0;height:2px;background:var(--accent);border-radius:2px!important}
      .opt{position:relative;z-index:1;border:0;background:transparent;cursor:pointer;min-width:64px;height:30px;padding:0 14px;font-size:13px;font-weight:500;color:var(--sub);transition:color .2s;outline:none}
      .opt[aria-selected=true]{color:var(--text);font-weight:600}
      .solid .opt[aria-selected=true]{color:var(--on)}
      .opt:focus-visible{box-shadow:0 0 0 2px var(--accent);border-radius:6px}
      .cap{font-size:13px;color:var(--sub)}
    `);
    const lang = ctx.lang === 'en' ? 'en' : 'zh';
    const ind = el('span', { class: 'ind' });
    const group = el('div', { class: 'group', role: 'tablist' }, ind);
    const cap = el('div', { class: 'cap' });
    root.append(el('div', { class: 'wrap' }, group, cap));
    let p = initial, s = unit.spec(p), idx = 1, opts = [], cur = { x: 0, w: 0 }, stops = [];
    const paint = () => { ind.style.transform = `translateX(${cur.x}px)`; ind.style.width = `${cur.w}px`; };
    const target = () => { const o = opts[idx]; return o ? { x: o.offsetLeft, w: o.offsetWidth } : { x: 0, w: 0 }; };
    const move = (instant) => {
      const t = target(); stops.forEach(f => f());
      if (instant) { cur = t; paint(); return; }
      stops = ['x', 'w'].map(k => spring({ from: cur[k], to: t[k], ...s.motion, onUpdate: v => { cur[k] = v; paint(); } }));
    };
    const select = (i) => { idx = i; opts.forEach((o, j) => { o.setAttribute('aria-selected', String(j === i)); o.tabIndex = j === i ? 0 : -1; }); move(false); };
    const build = () => {
      opts.forEach(o => o.remove());
      idx = Math.min(idx, s.count - 1);
      opts = LABELS[lang].slice(0, s.count).map((t, i) => {
        const b = el('button', { class: 'opt', role: 'tab', text: t });
        b.addEventListener('click', () => select(i));
        b.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); const n = (idx + (e.key === 'ArrowRight' ? 1 : -1) + s.count) % s.count; select(n); opts[n].focus(); }
        });
        group.append(b); return b;
      });
      opts.forEach((o, j) => { o.setAttribute('aria-selected', String(j === idx)); o.tabIndex = j === idx ? 0 : -1; });
    };
    const apply = () => {
      const dark = p.fill === 'dark';
      applyTheme(host, p.fill);
      const accent = p.accent === 'ink' && dark ? '#f5f5f7' : s.color.accent;
      host.style.setProperty('--accent', accent);
      host.style.setProperty('--on', p.accent === 'ink' && dark ? '#1d1d1f' : '#ffffff');
      host.style.setProperty('--pad', `${s.size.padding}px`);
      host.style.setProperty('--groupbg', dark ? '#2c2c2e' : '#e8e8ed');
      if (dark) host.style.setProperty('--surface', '#636366');
      group.className = `group ${s.indicator}`;
      group.style.borderRadius = `${s.radius.group}px`; ind.style.borderRadius = `${s.radius.indicator}px`;
      build();
      requestAnimationFrame(() => move(true));
      cap.textContent = `${s.count} options · spring ${s.motion.stiffness}/${s.motion.damping}`;
    };
    apply();
    return {
      update(next) { p = next; s = unit.spec(p); apply(); },
      destroy() { stops.forEach(f => f()); root.innerHTML = ''; },
    };
  },
  prompt(p, lang) {
    const s = unit.spec(p);
    const iz = { lifted: '白色浮起胶囊，带两层轻投影', solid: `强调色 ${s.color.accent} 实心块，选中文字反白`, underline: `底部 2px 强调色下划线，整组无底色` }[s.indicator];
    const ie = { lifted: 'a white lifted capsule with two soft shadows', solid: `a solid ${s.color.accent} block with inverted text`, underline: 'a 2px accent underline, no group fill' }[s.indicator];
    return composeUnitPrompt(unit, p, lang, {
      zh: {
        look: `${s.count} 个等高选项排成一组，组圆角 ${s.radius.group}px、内边距 ${s.size.padding}px、浅灰底；选中块是${iz}；字号 ${s.size.fontSize}px，未选中灰色、选中加粗。`,
        behave: '点击切换；role="tablist" / "tab"，左右方向键在选项间移动并循环；选中块的位置和宽度都要跟随目标选项（选项宽度可以不同）。',
        motion: `选中块的 translateX 与宽度分别用弹簧（stiffness ${s.motion.stiffness}，damping ${s.motion.damping}）过渡，连续快速点击时可被打断、不跳帧。`,
      },
      en: {
        look: `${s.count} equal-height options in one group, group radius ${s.radius.group}px, ${s.size.padding}px padding, light grey fill; the selection is ${ie}; ${s.size.fontSize}px labels, grey when idle, bold when selected.`,
        behave: 'Click to switch; role="tablist" / "tab"; Left/Right arrows move and wrap; the indicator matches the target option’s position and width (options may differ in width).',
        motion: `Indicator translateX and width each follow a spring (stiffness ${s.motion.stiffness}, damping ${s.motion.damping}); rapid clicks interrupt cleanly without jumps.`,
      },
    });
  },
};

export default unit;
