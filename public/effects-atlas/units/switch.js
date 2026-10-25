import { range, seg, fillParam, accentParam, ACCENTS, applyTheme, shell, el, spring, springFromSpeed, composeUnitPrompt } from './kit.js';

// 开关：把“开关滑动 / 开关挤压 / 开关内图标 / 轨道文字”这些变体收成一个单元，用参数切换。
const unit = {
  id: 'switch',
  zh: '开关', en: 'Switch',
  dz: '一下切换两种状态，手感全在旋钮的那一下', de: 'Two states, one flick — the feel lives in the knob',
  componentTypes: ['switch', 'toggle'],
  size: { w: 120, h: 60 },
  params: [
    fillParam(),
    accentParam('green'),
    range('width', '宽度', 'Width', 36, 84, 1, 52, 'px'),
    seg('shape', '形状', 'Shape', [['pill', '胶囊', 'Pill'], ['round', '圆角', 'Rounded'], ['square', '方', 'Square']], 'pill'),
    range('speed', '速度', 'Speed', 1, 100, 1, 50),
    range('squash', '按压拉伸', 'Squash', 0, 40, 1, 18, '%'),
    seg('icon', '旋钮图标', 'Knob icon', [['none', '无', 'None'], ['check', '对勾', 'Check'], ['sun', '日/月', 'Sun/Moon']], 'none'),
    seg('label', '轨道文字', 'Track label', [['off', '不显示', 'Off'], ['on', '开/关', 'On/Off']], 'off'),
  ],
  spec(p) {
    const h = Math.round(p.width * 0.6);
    const inset = 2;
    const knob = h - inset * 2;
    const radius = p.shape === 'pill' ? h / 2 : p.shape === 'round' ? Math.round(h * 0.28) : 3;
    return {
      size: { width: p.width, height: h, knob, inset },
      radius: { track: radius, knob: Math.max(1, radius - inset) },
      color: { on: ACCENTS[p.accent].hex, off: p.fill === 'dark' ? '#3a3a3c' : '#e3e3e8', knob: '#ffffff' },
      motion: { type: 'spring', ...springFromSpeed(p.speed), pressStretch: p.squash / 100 },
      icon: p.icon, trackLabel: p.label === 'on',
    };
  },
  mount(host, initial) {
    const root = shell(host, `
      .wrap{display:flex;flex-direction:column;align-items:center;gap:22px}
      :host([data-bare]) .wrap{gap:0}
      .sw{position:relative;border:0;padding:0;cursor:pointer;background:var(--off);transition:background .22s;outline:none;-webkit-tap-highlight-color:transparent}
      .sw[aria-checked=true]{background:var(--on)}
      .sw:focus-visible{box-shadow:0 0 0 3px var(--bg),0 0 0 5px var(--on)}
      .knob{position:absolute;top:var(--inset);left:var(--inset);height:var(--knob);width:var(--knob);background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.18),0 0 0 .5px rgba(0,0,0,.04);display:flex;align-items:center;justify-content:center;transform-origin:center;will-change:transform}
      .knob svg{width:58%;height:58%;opacity:.9}
      .lbl{position:absolute;top:0;bottom:0;display:flex;align-items:center;font:600 calc(var(--knob)*.36)/1 inherit;letter-spacing:.04em;color:#fff;pointer-events:none;transition:opacity .2s}
      .lbl.on{left:calc(var(--inset)*4)}.lbl.off{right:calc(var(--inset)*4);color:var(--sub)}
      .cap{font-size:13px;color:var(--sub);letter-spacing:.01em}
    `);
    const knob = el('span', { class: 'knob' });
    const onL = el('span', { class: 'lbl on', text: 'ON' });
    const offL = el('span', { class: 'lbl off', text: 'OFF' });
    const btn = el('button', { class: 'sw', role: 'switch', 'aria-checked': 'true', 'aria-label': 'Switch' }, onL, offL, knob);
    const cap = el('div', { class: 'cap' });
    root.append(el('div', { class: 'wrap' }, btn, cap));

    let p = initial, s = unit.spec(p), on = true, pos = 1, stretch = 0, stop = () => {};
    const travel = () => s.size.width - s.size.knob - s.size.inset * 2;
    const paint = () => {
      const w = s.size.knob * (1 + stretch);
      const dx = pos * travel() - (on ? (w - s.size.knob) : 0) * (stretch ? 1 : 0);
      knob.style.width = `${w}px`;
      knob.style.transform = `translateX(${dx}px)`;
      onL.style.opacity = s.trackLabel ? String(pos) : '0';
      offL.style.opacity = s.trackLabel ? String(1 - pos) : '0';
      knob.innerHTML = s.icon === 'check'
        ? (on ? '<svg viewBox="0 0 24 24" fill="none" stroke="' + s.color.on + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="3" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>')
        : s.icon === 'sun'
          ? (on ? '<svg viewBox="0 0 24 24" fill="#ff9f0a"><circle cx="12" cy="12" r="5"/><g stroke="#ff9f0a" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g></svg>' : '<svg viewBox="0 0 24 24" fill="#5e5ce6"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>')
          : '';
    };
    const apply = () => {
      const t = applyTheme(host, p.fill);
      host.style.setProperty('--on', s.color.on);
      host.style.setProperty('--off', t.track);
      host.style.setProperty('--inset', `${s.size.inset}px`);
      host.style.setProperty('--knob', `${s.size.knob}px`);
      btn.style.width = `${s.size.width}px`;
      btn.style.height = `${s.size.height}px`;
      btn.style.borderRadius = `${s.radius.track}px`;
      knob.style.borderRadius = `${s.radius.knob}px`;
      cap.textContent = `${s.size.width}×${s.size.height} · spring ${s.motion.stiffness}/${s.motion.damping}`;
      paint();
    };
    const go = (next) => {
      on = next; btn.setAttribute('aria-checked', String(on));
      stop(); stop = spring({ from: pos, to: on ? 1 : 0, ...s.motion, onUpdate: v => { pos = v; paint(); } });
    };
    const press = (d) => { stretch = d ? s.motion.pressStretch : 0; paint(); };
    btn.addEventListener('pointerdown', () => press(true));
    btn.addEventListener('pointerup', () => press(false));
    btn.addEventListener('pointerleave', () => press(false));
    btn.addEventListener('click', () => go(!on));
    apply();
    return {
      update(next) { p = next; s = unit.spec(p); apply(); },
      destroy() { stop(); root.innerHTML = ''; },
    };
  },
  prompt(p, lang) {
    const s = unit.spec(p);
    return composeUnitPrompt(unit, p, lang, {
      zh: {
        look: `轨道 ${s.size.width}×${s.size.height}px，圆角 ${s.radius.track}px；关闭时轨道 ${s.color.off}，打开时 ${s.color.on}；白色旋钮内缩 ${s.size.inset}px，带一层很淡的投影${s.icon !== 'none' ? `，旋钮里画${s.icon === 'check' ? '对勾/叉' : '太阳/月亮'}图标` : ''}${s.trackLabel ? '，轨道上写 ON / OFF 随状态淡入淡出' : ''}。`,
        behave: '点击或空格切换；role="switch" 并同步 aria-checked；按下时旋钮朝运动方向拉宽，松手复原。',
        motion: `旋钮位移用弹簧（stiffness ${s.motion.stiffness}，damping ${s.motion.damping}），轨道颜色 220ms 渐变；按下拉伸 ${Math.round(s.motion.pressStretch * 100)}%。`,
      },
      en: {
        look: `Track ${s.size.width}×${s.size.height}px, radius ${s.radius.track}px; off ${s.color.off}, on ${s.color.on}; white knob inset ${s.size.inset}px with a faint shadow${s.icon !== 'none' ? `, with a ${s.icon === 'check' ? 'check/cross' : 'sun/moon'} glyph inside` : ''}${s.trackLabel ? '; ON / OFF labels on the track cross-fade with state' : ''}.`,
        behave: 'Click or Space toggles; role="switch" with aria-checked kept in sync; on press the knob stretches toward its travel direction and settles on release.',
        motion: `Knob travel uses a spring (stiffness ${s.motion.stiffness}, damping ${s.motion.damping}); track colour fades over 220ms; press stretch ${Math.round(s.motion.pressStretch * 100)}%.`,
      },
    });
  },
};

export default unit;
