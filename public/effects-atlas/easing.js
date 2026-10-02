const P = (k, zh, en, min, max, step, def, unit) => ({ k, zh, en, min, max, step, def, unit: unit || '' });
const RUN = (ease, dur) => `@keyframes fxk{from{transform:translateX(-150px)}to{transform:translateX(150px)}}.fx{width:84px;height:84px;border-radius:18px;animation:fxk ${dur || '1.4s'} ${ease} infinite alternate}`;

export default {
  id: 'easing', zh: '缓动与节奏', en: 'Easing & timing',
  dz: '同样的位移，快慢曲线决定气质', de: 'Same move — the curve decides the character',
  items: [
    { id: 'linear', zh: '匀速', en: 'Linear', dz: '机械、没有生命感', de: 'Mechanical, lifeless',
      pz: 'linear 只适合无限循环（旋转、跑马灯），别用在 UI 位移上。', pe: 'linear suits endless loops (spinners, tickers) — not UI movement.',
      demo: 'box', css: RUN('linear') },

    { id: 'ease', zh: '默认 ease', en: 'Default ease', dz: '浏览器默认，安全但平庸', de: 'The browser default — safe, unremarkable',
      pz: 'ease = cubic-bezier(.25,.1,.25,1)，够用但没有性格。', pe: 'ease = cubic-bezier(.25,.1,.25,1): fine, but characterless.',
      demo: 'box', css: RUN('ease') },

    { id: 'easein', zh: '缓入（加速）', en: 'Ease-in', dz: '起步慢、越走越快，适合退场', de: 'Starts slow, speeds up — good for exits',
      pz: '元素离开画面时用 ease-in，符合“加速离去”的直觉。', pe: 'Use ease-in when something leaves the screen.',
      demo: 'box', css: RUN('cubic-bezier(.55,0,1,.45)') },

    { id: 'easeout', zh: '缓出（减速）', en: 'Ease-out', dz: '冲出来再稳稳停下，适合入场', de: 'Bursts in and settles — the entrance curve',
      pz: '90% 的界面动效都应该是 ease-out，元素进入要“到位即停”。', pe: 'Most UI motion should be ease-out: arrive fast, land softly.',
      demo: 'box', css: RUN('cubic-bezier(0,.55,.45,1)') },

    { id: 'easeinout', zh: '缓入缓出', en: 'Ease-in-out', dz: '两头慢中间快，适合往返', de: 'Slow at both ends — good for round trips',
      pz: '用于同一元素在两个状态间来回，比如开关、折叠。', pe: 'For elements moving between two states, like toggles.',
      demo: 'box', css: RUN('cubic-bezier(.65,0,.35,1)') },

    { id: 'outquint', zh: '五次方缓出', en: 'Out-quint', dz: '非常干脆的减速，高级感', de: 'A very decisive deceleration — feels expensive',
      pz: 'cubic-bezier(.22,1,.36,1)，Savimbo 的默认曲线。', pe: 'cubic-bezier(.22,1,.36,1) — the house curve.',
      demo: 'box', css: RUN('cubic-bezier(.22,1,.36,1)') },

    { id: 'outexpo', zh: '指数缓出', en: 'Out-expo', dz: '开头极快，尾巴极长', de: 'Explosive start, very long tail',
      pz: 'cubic-bezier(.16,1,.3,1)，适合大位移的入场。', pe: 'cubic-bezier(.16,1,.3,1) — good for large entrances.',
      demo: 'box', css: RUN('cubic-bezier(.16,1,.3,1)', '1.8s') },

    { id: 'outback', zh: '过冲回落', en: 'Out-back', dz: '冲过头一点再退回来', de: 'Overshoots, then pulls back',
      pz: 'cubic-bezier(.34,1.56,.64,1)，只用于小元素、小幅度。', pe: 'cubic-bezier(.34,1.56,.64,1) — small elements, small amounts.',
      demo: 'box', css: RUN('cubic-bezier(.34,1.56,.64,1)') },

    { id: 'anticipate', zh: '预备动作', en: 'Anticipation', dz: '先后撤一点再出发', de: 'Pulls back before it goes',
      pz: '起手反向 8–10%，动画立刻有了重量。', pe: 'A reverse of 8–10% at the start gives the move weight.',
      demo: 'box', css: `@keyframes fxk{0%{transform:translateX(-150px)}18%{transform:translateX(-186px)}100%{transform:translateX(150px)}}.fx{width:84px;height:84px;border-radius:18px;animation:fxk 1.6s cubic-bezier(.3,0,.2,1) infinite alternate}` },

    { id: 'spring', zh: '弹簧阻尼', en: 'Spring', dz: '来回振荡逐渐停住', de: 'Oscillates and damps out',
      pz: '用物理弹簧（stiffness/damping）而不是固定时长，交互跟手。', pe: 'Physical spring (stiffness/damping) instead of a fixed duration.',
      demo: 'box', css: `@keyframes fxk{0%{transform:translateX(-150px)}45%{transform:translateX(160px)}62%{transform:translateX(120px)}76%{transform:translateX(146px)}88%{transform:translateX(136px)}100%{transform:translateX(142px)}}.fx{width:84px;height:84px;border-radius:18px;animation:fxk 1.8s linear infinite alternate}` },

    { id: 'elastic', zh: '橡皮筋', en: 'Elastic', dz: '夸张的弹性，卡通感', de: 'Exaggerated elasticity — cartoon energy',
      pz: '振幅大、频率高，慎用，只适合玩具型产品。', pe: 'High amplitude and frequency — reserve it for playful products.',
      demo: 'box', css: `@keyframes fxk{0%{transform:translateX(-150px) scaleX(1)}30%{transform:translateX(60px) scaleX(1.3)}50%{transform:translateX(180px) scaleX(.8)}70%{transform:translateX(110px) scaleX(1.15)}85%{transform:translateX(160px) scaleX(.94)}100%{transform:translateX(145px) scaleX(1)}}.fx{width:84px;height:84px;border-radius:18px;animation:fxk 1.9s linear infinite alternate}` },

    { id: 'bounce', zh: '落地弹跳', en: 'Bounce', dz: '掉下来弹几下', de: 'Drops and bounces a few times',
      pz: '每次弹跳高度衰减 40–50%，触底压扁一帧。', pe: 'Each bounce loses 40–50% height, with a squash at contact.',
      demo: 'box', css: `@keyframes fxk{0%{transform:translateY(-170px)}30%{transform:translateY(0) scaleY(.82)}45%{transform:translateY(-80px) scaleY(1.05)}62%{transform:translateY(0) scaleY(.9)}75%{transform:translateY(-32px)}88%{transform:translateY(0) scaleY(.96)}100%{transform:translateY(0)}}.fx{width:84px;height:84px;border-radius:50%;animation:fxk 1.8s linear infinite}` },

    { id: 'steps', zh: '阶跃动画', en: 'Steps', dz: '一格一格跳，像秒针', de: 'Jumps frame by frame, like a second hand',
      pz: 'steps(n) 用于精灵图、打字机、秒表。', pe: 'steps(n) is for sprite sheets, typewriters, tickers.',
      demo: 'box', css: RUN('steps(6,end)', '1.8s') },

    { id: 'duration', zh: '时长对比', en: 'Duration matters', dz: '同一曲线，快慢完全两种性格', de: 'Same curve, two totally different personalities',
      pz: '微交互 120ms、常规 200–300ms、页面级 360–500ms。', pe: 'Micro 120ms, standard 200–300ms, page-level 360–500ms.',
      demo: 'box', params: [P('t', '时长', 'Duration', .1, 2, .05, .3, 's')],
      css: `@keyframes fxk{from{transform:translateX(-150px)}to{transform:translateX(150px)}}.fx{width:84px;height:84px;border-radius:18px;animation:fxk var(--t,.3s) cubic-bezier(.22,1,.36,1) infinite alternate}` },

    { id: 'delaychain', zh: '延迟链', en: 'Delay chain', dz: '一个接一个地启动', de: 'Each one starts after the last',
      pz: 'delay = index × 步长，步长 50–90ms 最舒服。', pe: 'delay = index × step, 50–90ms feels best.',
      demo: 'cards', params: [P('s', '步长', 'Step', 20, 240, 10, 80, 'ms')],
      css: `@keyframes fxk{from{transform:translateY(30px);opacity:.3}to{transform:none;opacity:1}}.fx{animation:fxk .6s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*var(--s,80ms))}` },

    { id: 'overlap', zh: '重叠动作', en: 'Overlapping action', dz: '后一个动作在前一个结束前就开始', de: 'The next move starts before the last one ends',
      pz: '相邻动画重叠 30–50%，整体更连贯不拖沓。', pe: 'Overlap neighbouring animations by 30–50% to keep it fluid.',
      demo: 'cards', css: `@keyframes fxk{0%{transform:translateY(40px) scale(.9);opacity:0}60%{opacity:1}100%{transform:none;opacity:1}}.fx{animation:fxk 1s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*-160ms)}` },

    { id: 'follow', zh: '跟随与拖尾', en: 'Follow-through', dz: '主体停了，附属还在动', de: 'The body stops, the trailing part keeps going',
      pz: '子元素比父元素晚 60–120ms 停，动画立刻有质感。', pe: 'Let children settle 60–120ms after the parent.',
      demo: 'cards', css: `@keyframes fxk{from{transform:translateX(-90px)}to{transform:none}}.fx{animation:fxk .8s cubic-bezier(.22,1,.36,1) infinite alternate}.fx b{animation:fxk .8s cubic-bezier(.22,1,.36,1) .12s infinite alternate}` },

    { id: 'secondary', zh: '次级动作', en: 'Secondary motion', dz: '主动作之外的一点点附加运动', de: 'A small extra motion riding on the main one',
      pz: '主体位移时给内部元素反向微移，制造惯性。', pe: 'Counter-move the contents slightly to fake inertia.',
      demo: 'box', css: `@keyframes fxk{from{transform:translateX(-140px)}to{transform:translateX(140px)}}@keyframes fxs{from{transform:translateX(14px) rotate(6deg)}to{transform:translateX(-14px) rotate(-6deg)}}.fx{width:120px;height:120px;border-radius:22px;animation:fxk 1.5s cubic-bezier(.45,0,.55,1) infinite alternate}.fx::after{content:'';width:34px;height:34px;border-radius:50%;background:#f0c9a8;animation:fxs 1.5s cubic-bezier(.3,0,.2,1) .08s infinite alternate}` },

    { id: 'skewvel', zh: '速度带斜切', en: 'Velocity skew', dz: '越快越斜，停下就正', de: 'Faster means more lean; it straightens on stop',
      pz: '把速度映射到 skewX，速度归零时角度归零。', pe: 'Map velocity onto skewX; zero velocity, zero angle.',
      demo: 'box', css: `@keyframes fxk{0%{transform:translateX(-150px) skewX(0)}30%{transform:translateX(-40px) skewX(-16deg)}70%{transform:translateX(80px) skewX(-16deg)}100%{transform:translateX(150px) skewX(0)}}.fx{width:84px;height:84px;border-radius:18px;animation:fxk 1.5s cubic-bezier(.45,0,.55,1) infinite alternate}` },

    { id: 'pingpong', zh: '往返循环', en: 'Ping-pong loop', dz: '来回摆动不间断', de: 'Swings back and forth forever',
      pz: 'animation-direction:alternate，别用两段动画拼。', pe: 'Use animation-direction:alternate rather than two chained animations.',
      demo: 'box', css: RUN('cubic-bezier(.45,0,.55,1)', '1.2s') },

    { id: 'pause', zh: '带停顿的循环', en: 'Loop with pause', dz: '动一下、停一会儿、再动', de: 'Move, hold, move again',
      pz: '在关键帧里留 30–40% 的静止段，比加 delay 更可控。', pe: 'Hold for 30–40% of the keyframes instead of adding a delay.',
      demo: 'box', css: `@keyframes fxk{0%,25%{transform:translateX(-150px)}75%,100%{transform:translateX(150px)}}.fx{width:84px;height:84px;border-radius:18px;animation:fxk 2.4s cubic-bezier(.22,1,.36,1) infinite alternate}` },

    { id: 'motionpath', zh: '路径运动', en: 'Motion path', dz: '沿一条曲线走，而不是直线', de: 'Follows a curve rather than a straight line',
      pz: 'CSS offset-path:path(...) + offset-distance 动画。', pe: 'CSS offset-path:path(...) animated via offset-distance.',
      demo: 'box', css: `@keyframes fxk{to{offset-distance:100%}}.fx{width:44px;height:44px;border-radius:50%;offset-path:path('M0,0 C80,-120 240,120 320,0');animation:fxk 2.4s cubic-bezier(.45,0,.55,1) infinite alternate}` },

    { id: 'reduced', zh: '尊重减弱动效', en: 'Reduced motion', dz: '系统开了“减弱动效”就只留淡入', de: 'With reduced-motion on, keep only a fade',
      pz: '@media (prefers-reduced-motion:reduce){动画时长设为 .01ms 或只留 opacity}。', pe: 'Under prefers-reduced-motion, drop to opacity-only or 0.01ms.',
      demo: 'box', css: `@keyframes fxk{from{transform:translateX(-150px)}to{transform:translateX(150px)}}@keyframes fxf{from{opacity:.35}to{opacity:1}}.fx{width:84px;height:84px;border-radius:18px;animation:fxk 1.4s cubic-bezier(.22,1,.36,1) infinite alternate}@media (prefers-reduced-motion:reduce){.fx{animation:fxf 1s ease infinite alternate}}` },

    { id: 'stagger2d', zh: '二维波纹错峰', en: '2D stagger', dz: '从一角扩散到整个网格', de: 'Ripples across a grid from one corner',
      pz: 'delay 由行列距离决定（曼哈顿距离或欧氏距离）。', pe: 'Delay from grid distance — Manhattan or Euclidean.',
      demo: 'grid', css: `@keyframes fxk{from{transform:scale(.6);opacity:.25}to{transform:none;opacity:1}}.fxgrid{grid-template-columns:repeat(3,96px)}.fx{animation:fxk .7s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*70ms);background:#4d8ba6;border:0}` },

    { id: 'chained', zh: '编排时间线', en: 'Choreographed timeline', dz: '多个元素按剧本先后出场', de: 'Several elements enter on a script',
      pz: '用时间线工具（GSAP timeline / Web Animations）统一编排，别各写各的 delay。', pe: 'Use a timeline (GSAP / WAAPI) instead of scattering delays.',
      demo: 'list', css: `@keyframes fxk{0%{opacity:0;transform:translateX(-24px)}100%{opacity:1;transform:none}}.fx{animation:fxk .5s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*120ms)}` }
  ]
};
