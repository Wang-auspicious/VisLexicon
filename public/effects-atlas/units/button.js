import { range, seg, fillParam, accentParam, ACCENTS, applyTheme, shell, el, spring, springFromSpeed, composeUnitPrompt } from './kit.js';

// 按钮：实心 / 浅色 / 描边 / 纯文字 四种外观 + 按压、悬停抬起、磁吸三种手感，一个单元全包。
const unit = {
  id: 'button',
  zh: '按钮', en: 'Button',
  dz: '按下去要有“按到了”的反馈', de: 'A press should feel like it landed',
  componentTypes: ['button', 'shimmer-button', 'magnetic-button'],
  size: { w: 180, h: 64 },
  params: [
    fillParam(),
    accentParam('blue'),
    seg('variant', '外观', 'Variant', [['filled', '实心', 'Filled'], ['tinted', '浅色', 'Tinted'], ['outline', '描边', 'Outline'], ['plain', '纯文字', 'Plain']], 'filled'),
    seg('size', '尺寸', 'Size', [['sm', '小', 'S'], ['md', '中', 'M'], ['lg', '大', 'L']], 'md'),
    range('corner', '圆角', 'Corner', 0, 28, 1, 12, 'px'),
    range('press', '按压缩放', 'Press scale', 85, 100, 1, 96, '%'),
    range('lift', '悬停抬起', 'Hover lift', 0, 6, 1, 0, 'px'),
    range('magnet', '磁吸', 'Magnetic pull', 0, 24, 1, 0, 'px'),
    range('speed', '速度', 'Speed', 1, 100, 1, 60),
  ],
  spec(p) {
    const sizes = { sm: [32, 14, 13], md: [44, 20, 15], lg: [54, 26, 17] };
    const [height, padX, font] = sizes[p.size];
    const accent = ACCENTS[p.accent].hex;
    return {
      size: { height, paddingX: padX, fontSize: font, fontWeight: 600 },
      radius: Math.min(p.corner, height / 2),
      variant: p.variant, color: { accent },
      motion: { type: 'spring', ...springFromSpeed(p.speed), pressScale: p.press / 100, hoverLift: p.lift, magnet: p.magnet },
    };
  },
  mount(host, initial) {
    const root = shell(host, `
      .wrap{display:flex;flex-direction:column;align-items:center;gap:22px}
      .stage{padding:40px}
      :host([data-bare]) .stage{padding:0}
      :host([data-bare]) .wrap{gap:0}
      .b{border:0;cursor:pointer;display:inline-flex;align-items:center;gap:8px;letter-spacing:-.005em;outline:none;will-change:transform;transition:background .2s,box-shadow .2s,color .2s}
      .b:focus-visible{box-shadow:0 0 0 3px var(--bg),0 0 0 5px var(--accent)}
      .b.filled{background:var(--accent);color:var(--on);box-shadow:0 1px 2px rgba(0,0,0,.08),0 6px 16px -8px var(--accent)}
      .b.tinted{background:var(--tint);color:var(--accent)}
      .b.outline{background:transparent;color:var(--accent);box-shadow:inset 0 0 0 1.5px var(--accent)}
      .b.plain{background:transparent;color:var(--accent)}
      .b.plain:hover{background:var(--tint)}
      .b svg{width:1.05em;height:1.05em}
      .cap{font-size:13px;color:var(--sub)}
    `);
    const btn = el('button', { class: 'b' });
    btn.innerHTML = '<span>Continue</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
    const stage = el('div', { class: 'stage' }, btn);
    const cap = el('div', { class: 'cap' });
    root.append(el('div', { class: 'wrap' }, stage, cap));

    let p = initial, s = unit.spec(p);
    const st = { x: 0, y: 0, k: 1 }; const stops = {};
    const paint = () => { btn.style.transform = `translate(${st.x}px,${st.y}px) scale(${st.k})`; };
    const to = (key, target) => { stops[key]?.(); stops[key] = spring({ from: st[key], to: target, ...s.motion, onUpdate: v => { st[key] = v; paint(); } }); };
    let hover = false, down = false;
    const settleY = () => to('y', (hover ? -s.motion.hoverLift : 0));
    stage.addEventListener('pointermove', (e) => {
      if (!s.motion.magnet) return;
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2 + 40);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2 + 40);
      to('x', Math.max(-1, Math.min(1, dx)) * s.motion.magnet);
      if (!s.motion.hoverLift) to('y', Math.max(-1, Math.min(1, dy)) * s.motion.magnet * 0.5);
    });
    stage.addEventListener('pointerleave', () => { to('x', 0); hover = false; settleY(); });
    btn.addEventListener('pointerenter', () => { hover = true; settleY(); });
    btn.addEventListener('pointerleave', () => { hover = false; if (down) { down = false; to('k', 1); } });
    btn.addEventListener('pointerdown', () => { down = true; to('k', s.motion.pressScale); });
    btn.addEventListener('pointerup', () => { down = false; to('k', 1); });
    btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') to('k', s.motion.pressScale); });
    btn.addEventListener('keyup', () => to('k', 1));

    const apply = () => {
      applyTheme(host, p.fill);
      const dark = p.fill === 'dark';
      const accent = p.accent === 'ink' && dark ? '#f5f5f7' : s.color.accent;
      host.style.setProperty('--accent', accent);
      host.style.setProperty('--on', p.accent === 'ink' && dark ? '#1d1d1f' : '#ffffff');
      host.style.setProperty('--tint', `color-mix(in srgb, ${accent} ${dark ? 22 : 12}%, transparent)`);
      btn.className = `b ${s.variant}`;
      btn.style.height = `${s.size.height}px`; btn.style.padding = `0 ${s.size.paddingX}px`;
      btn.style.fontSize = `${s.size.fontSize}px`; btn.style.fontWeight = String(s.size.fontWeight);
      btn.style.borderRadius = `${s.radius}px`;
      cap.textContent = `${s.size.height}px · radius ${s.radius} · press ${Math.round(s.motion.pressScale * 100)}%`;
      paint();
    };
    apply();
    return {
      update(next) { p = next; s = unit.spec(p); apply(); },
      destroy() { Object.values(stops).forEach(f => f()); root.innerHTML = ''; },
    };
  },
  prompt(p, lang) {
    const s = unit.spec(p);
    const vz = { filled: '实心强调色底、白字', tinted: '强调色 12% 透明底、强调色字', outline: '1.5px 强调色描边、透明底', plain: '纯文字，悬停时出现浅色底' }[s.variant];
    const ve = { filled: 'solid accent fill with white text', tinted: 'accent at 12% as the fill with accent text', outline: '1.5px accent outline on transparent', plain: 'text only, a tinted fill appears on hover' }[s.variant];
    const extrasZ = [s.motion.hoverLift ? `悬停时上浮 ${s.motion.hoverLift}px` : '', s.motion.magnet ? `指针靠近时朝指针方向吸过去最多 ${s.motion.magnet}px，离开弹回` : ''].filter(Boolean).join('；');
    const extrasE = [s.motion.hoverLift ? `lift ${s.motion.hoverLift}px on hover` : '', s.motion.magnet ? `pulled up to ${s.motion.magnet}px toward a nearby pointer, springing back on leave` : ''].filter(Boolean).join('; ');
    return composeUnitPrompt(unit, p, lang, {
      zh: {
        look: `${vz}；高 ${s.size.height}px，左右内边距 ${s.size.paddingX}px，字号 ${s.size.fontSize}px / 600，圆角 ${s.radius}px，强调色 ${s.color.accent}；文字后跟一个小右箭头。`,
        behave: `按下缩到 ${Math.round(s.motion.pressScale * 100)}%，松开弹回${extrasZ ? '；' + extrasZ : ''}。键盘 Enter/空格 同样有按压反馈。`,
        motion: `所有位移和缩放都用弹簧（stiffness ${s.motion.stiffness}，damping ${s.motion.damping}），可被打断，不用固定时长的 transition。`,
      },
      en: {
        look: `${ve}; ${s.size.height}px tall, ${s.size.paddingX}px side padding, ${s.size.fontSize}px / 600 label, radius ${s.radius}px, accent ${s.color.accent}; a small chevron follows the label.`,
        behave: `Scales to ${Math.round(s.motion.pressScale * 100)}% on press and springs back on release${extrasE ? '; ' + extrasE : ''}. Enter/Space give the same press feedback.`,
        motion: `All translation and scale use an interruptible spring (stiffness ${s.motion.stiffness}, damping ${s.motion.damping}), not fixed-duration transitions.`,
      },
    });
  },
};

export default unit;
