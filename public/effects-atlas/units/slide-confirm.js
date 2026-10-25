import { range, seg, fillParam, accentParam, ACCENTS, applyTheme, shell, el, spring, springFromSpeed, composeUnitPrompt } from './kit.js';

// 滑动确认：拖过阈值后自己滑完并变成“已确认”。
const unit = {
  id: 'slide-confirm',
  zh: '滑动确认', en: 'Slide to confirm',
  dz: '把手推过那条线，剩下的它自己完成', de: 'Push the handle past the mark and it finishes on its own',
  componentTypes: ['slider', 'button', 'slide-to-confirm'],
  size: { w: 320, h: 80 },
  params: [
    fillParam(),
    accentParam('ink'),
    seg('stroke', '描边', 'Stroke', [['off', '无', 'Off'], ['on', '有', 'On']], 'off'),
    range('width', '宽度', 'Width', 200, 380, 2, 280, 'px'),
    range('corner', '圆角', 'Corner', 0, 32, 1, 28, 'px'),
    range('speed', '速度', 'Speed', 1, 100, 1, 50),
    range('threshold', '触发位置', 'Threshold', 50, 95, 1, 75, '%'),
  ],
  spec(p) {
    const height = 56, inset = 4, handle = height - inset * 2;
    return {
      size: { width: p.width, height, handle, inset },
      radius: { track: Math.min(p.corner, height / 2), handle: Math.max(0, Math.min(p.corner, height / 2) - inset) },
      color: { handle: ACCENTS[p.accent].hex, track: p.fill === 'dark' ? '#2c2c2e' : '#ffffff', stroke: p.stroke === 'on' },
      motion: { type: 'spring', ...springFromSpeed(p.speed) },
      threshold: p.threshold / 100,
    };
  },
  mount(host, initial) {
    const root = shell(host, `
      .wrap{display:flex;flex-direction:column;align-items:center;gap:22px}
      :host([data-bare]) .wrap{gap:0}
      .track{position:relative;overflow:hidden;background:var(--track);box-shadow:0 1px 2px rgba(0,0,0,.05),0 8px 24px -12px rgba(0,0,0,.18);user-select:none;touch-action:none}
      .track.stroke{box-shadow:inset 0 0 0 1px var(--line)}
      .fillbar{position:absolute;inset:0;background:var(--accent);opacity:.08;transform-origin:left;pointer-events:none}
      .text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding-left:var(--h);font-size:15px;font-weight:500;color:var(--sub);pointer-events:none;letter-spacing:.005em}
      .text b{font-weight:500;background:linear-gradient(90deg,var(--sub) 0%,var(--sub) 40%,var(--text) 50%,var(--sub) 60%,var(--sub) 100%);background-size:240% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sheen 2.6s linear infinite}
      @keyframes sheen{from{background-position:100% 0}to{background-position:-140% 0}}
      @media (prefers-reduced-motion:reduce){.text b{animation:none;color:var(--sub)}}
      .handle{position:absolute;top:var(--inset);left:var(--inset);width:var(--h);height:var(--h);background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;cursor:grab;border:0;outline:none;will-change:transform}
      .handle:active{cursor:grabbing}
      .handle:focus-visible{box-shadow:0 0 0 3px var(--track),0 0 0 5px var(--accent)}
      .handle svg{width:20px;height:20px}
      .done{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;font-size:15px;font-weight:600;color:#fff;background:var(--accent);opacity:0;pointer-events:none}
      .cap{font-size:13px;color:var(--sub)}
    `);
    const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    const check = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    const fillbar = el('div', { class: 'fillbar' });
    const text = el('div', { class: 'text' }); text.innerHTML = '<b>Slide to confirm</b>';
    const handle = el('button', { class: 'handle', 'aria-label': 'Slide to confirm', role: 'slider', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' }); handle.innerHTML = arrow;
    const done = el('div', { class: 'done' }); done.innerHTML = `${check}<span>Confirmed</span>`;
    const track = el('div', { class: 'track' }, fillbar, text, done, handle);
    const cap = el('div', { class: 'cap' });
    root.append(el('div', { class: 'wrap' }, track, cap));

    let p = initial, s = unit.spec(p), x = 0, stop = () => {}, drag = null, locked = false, timer = 0;
    const max = () => s.size.width - s.size.handle - s.size.inset * 2;
    const paint = () => {
      const k = max() ? x / max() : 0;
      handle.style.transform = `translateX(${x}px)`;
      fillbar.style.transform = `scaleX(${k})`;
      text.style.opacity = String(Math.max(0, 1 - k * 1.6));
      handle.setAttribute('aria-valuenow', String(Math.round(k * 100)));
    };
    const animate = (to, then) => { stop(); stop = spring({ from: x, to, ...s.motion, onUpdate: v => { x = v; paint(); }, onDone: then }); };
    const confirm = () => {
      locked = true;
      animate(max(), () => {
        done.style.transition = 'opacity .22s'; done.style.opacity = '1';
        timer = setTimeout(() => { done.style.opacity = '0'; locked = false; animate(0); }, 1600);
      });
    };
    const release = () => { if (!drag) return; drag = null; if (x / max() >= s.threshold) confirm(); else animate(0); };
    handle.addEventListener('pointerdown', (e) => { if (locked) return; stop(); drag = { start: e.clientX - x }; handle.setPointerCapture(e.pointerId); });
    handle.addEventListener('pointermove', (e) => { if (!drag) return; x = Math.max(0, Math.min(max(), e.clientX - drag.start)); paint(); });
    handle.addEventListener('pointerup', release);
    handle.addEventListener('pointercancel', release);
    handle.addEventListener('keydown', (e) => { if (!locked && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')) { e.preventDefault(); e.stopPropagation(); confirm(); } });

    const apply = () => {
      const t = applyTheme(host, p.fill);
      host.style.setProperty('--accent', s.color.handle);
      host.style.setProperty('--track', s.color.track);
      host.style.setProperty('--h', `${s.size.handle}px`);
      host.style.setProperty('--inset', `${s.size.inset}px`);
      track.style.width = `${s.size.width}px`; track.style.height = `${s.size.height}px`;
      track.style.borderRadius = `${s.radius.track}px`; handle.style.borderRadius = `${s.radius.handle}px`;
      track.classList.toggle('stroke', s.color.stroke);
      // 深底上的“墨”色把手反转成浅色，箭头随之变深
      const inverted = p.accent === 'ink' && p.fill === 'dark';
      if (inverted) host.style.setProperty('--accent', '#f5f5f7');
      handle.style.color = inverted ? t.bg : '#fff';
      x = Math.min(x, max()); paint();
      cap.textContent = `${s.size.width}×${s.size.height} · threshold ${Math.round(s.threshold * 100)}%`;
    };
    apply();
    return {
      update(next) { p = next; s = unit.spec(p); apply(); },
      destroy() { stop(); clearTimeout(timer); root.innerHTML = ''; },
    };
  },
  prompt(p, lang) {
    const s = unit.spec(p);
    const pct = Math.round(s.threshold * 100);
    return composeUnitPrompt(unit, p, lang, {
      zh: {
        look: `横条 ${s.size.width}×${s.size.height}px，圆角 ${s.radius.track}px，底色 ${s.color.track}${s.color.stroke ? '，1px 细描边' : '，柔和投影无描边'}；左端是 ${s.size.handle}px 见方、圆角 ${s.radius.handle}px 的 ${s.color.handle} 把手，里面一个白色右箭头；中间提示文字带一道缓慢扫过的高光。`,
        behave: `拖动把手；松手时超过 ${pct}% 就自动滑到底并整条变成「已确认 ✓」，1.6 秒后复位；不足则弹回起点。键盘 Enter/→ 直接确认。拖动时提示文字随进度淡出。`,
        motion: `回弹和自动滑完都用弹簧（stiffness ${s.motion.stiffness}，damping ${s.motion.damping}）；拖动过程 1:1 跟手，不加缓动。`,
      },
      en: {
        look: `A ${s.size.width}×${s.size.height}px bar, radius ${s.radius.track}px, fill ${s.color.track}${s.color.stroke ? ' with a 1px hairline stroke' : ', soft shadow, no stroke'}; a ${s.size.handle}px square ${s.color.handle} handle (radius ${s.radius.handle}px) on the left with a white arrow; the hint text has a slow travelling sheen.`,
        behave: `Drag the handle; past ${pct}% on release it completes by itself and the whole bar becomes "Confirmed ✓", resetting after 1.6s; otherwise it springs back. Enter/→ confirms from the keyboard. The hint fades with progress.`,
        motion: `Snap-back and auto-complete use a spring (stiffness ${s.motion.stiffness}, damping ${s.motion.damping}); dragging tracks the pointer 1:1 with no easing.`,
      },
    });
  },
};

export default unit;
