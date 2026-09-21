const P = (k, zh, en, min, max, step, def, unit) => ({ k, zh, en, min, max, step, def, unit: unit || '' });

export default {
  id: 'background', zh: '背景与材质', en: 'Backgrounds & texture',
  dz: '一整块面的质感', de: 'The texture of a whole surface',
  items: [
    { id: 'dotgrid', zh: '点阵网格', en: 'Dot grid', dz: '规律的小点，像方格纸', de: 'Regular dots, like graph paper',
      pz: 'radial-gradient 的圆点 + background-size 控制间距。', pe: 'A radial-gradient dot repeated via background-size.',
      demo: 'surface', params: [P('g', '间距', 'Spacing', 8, 48, 1, 22, 'px')],
      css: `.fx{background:#fff radial-gradient(#c9ccd3 1.3px,transparent 1.3px);background-size:var(--g,22px) var(--g,22px)}` },

    { id: 'linegrid', zh: '细线网格', en: 'Line grid', dz: '横竖细线组成的格子', de: 'A grid of hairlines',
      pz: '两层 linear-gradient 交叉，线宽 1px。', pe: 'Two crossed linear-gradients at 1px.',
      demo: 'surface', params: [P('g', '间距', 'Spacing', 12, 80, 2, 32, 'px')],
      css: `.fx{background:#fcfcfb;background-image:linear-gradient(#e4e5e0 1px,transparent 1px),linear-gradient(90deg,#e4e5e0 1px,transparent 1px);background-size:var(--g,32px) var(--g,32px)}` },

    { id: 'blueprint', zh: '蓝图纸', en: 'Blueprint', dz: '深蓝底白格，工程图感', de: 'White rules on deep blue — drafting paper',
      pz: '深色底 + 两级网格（细格 + 粗格）。', pe: 'Dark ground with a fine grid and a heavier one on top.',
      demo: 'surface', css: `.fx{background:#16324f;background-image:linear-gradient(rgba(255,255,255,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.14) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px);background-size:16px 16px,16px 16px,80px 80px,80px 80px}` },

    { id: 'noise', zh: '颗粒噪点', en: 'Grain', dz: '一层极细的噪点，去塑料感', de: 'Fine grain that kills the plastic look',
      pz: 'SVG feTurbulence 生成噪声图，低透明度叠在底色上。', pe: 'An SVG feTurbulence noise layer at low opacity over the base color.',
      demo: 'surface', params: [P('o', '强度', 'Amount', 0, 60, 1, 22, '%')],
      css: `.fx{background:#f2f2f0}.fx::after{content:'';position:absolute;inset:0;opacity:calc(var(--o,22)/100);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")}` },

    { id: 'mesh', zh: '网状渐变', en: 'Mesh gradient', dz: '几团颜色柔和地融在一起', de: 'Soft color blobs melting together',
      pz: '多个 radial-gradient 叠加，颜色数量控制在 3–4 个。', pe: 'Several stacked radial-gradients; keep to three or four hues.',
      demo: 'surface', css: `.fx{background:radial-gradient(at 18% 22%,#f0c9a8 0,transparent 55%),radial-gradient(at 82% 18%,#75c4d4 0,transparent 52%),radial-gradient(at 65% 85%,#e8879c 0,transparent 50%),#fff}` },

    { id: 'aurora', zh: '极光流动', en: 'Aurora blobs', dz: '色团缓慢漂移', de: 'Color clouds drifting slowly',
      pz: '两三个模糊色块做低速位移循环，父级 overflow:hidden。', pe: 'Two or three blurred blobs looping slowly inside a clipped parent.',
      demo: 'surface', css: `@keyframes fxa{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(90px,-50px) scale(1.25)}}@keyframes fxb{0%,100%{transform:translate(0,0)}50%{transform:translate(-80px,60px)}}.fx{background:#0f1117;overflow:hidden}.fx::before,.fx::after{content:'';position:absolute;width:320px;height:320px;border-radius:50%;filter:blur(70px)}.fx::before{background:#2f8f7a;left:-40px;top:-60px;animation:fxa 9s ease-in-out infinite}.fx::after{background:#6b3fa0;right:-40px;bottom:-70px;animation:fxb 11s ease-in-out infinite}` },

    { id: 'spotlight', zh: '中心聚光', en: 'Radial spotlight', dz: '中间亮、四周暗', de: 'Bright centre, dark edges',
      pz: '一层 radial-gradient 从透明到暗色，做视线聚焦。', pe: 'A radial-gradient from transparent to dark focuses the eye.',
      demo: 'surface', css: `.fx{background:radial-gradient(circle at 50% 42%,#3a3a4a 0,#16161f 62%)}` },

    { id: 'conic', zh: '锥形渐变', en: 'Conic gradient', dz: '像色轮一样绕一圈', de: 'Sweeps around like a color wheel',
      pz: 'conic-gradient(from angle, …)，可加 blur 柔化接缝。', pe: 'conic-gradient(from angle, …); blur the seam if needed.',
      demo: 'surface', params: [P('a', '起始角', 'From', 0, 360, 5, 40, 'deg')],
      css: `.fx{background:conic-gradient(from var(--a,40deg),#e8879c,#f4dcb8,#7ab85a,#75c4d4,#e8879c)}` },

    { id: 'stripes', zh: '斜条纹', en: 'Diagonal stripes', dz: '45 度重复条纹', de: 'Repeating 45° stripes',
      pz: 'repeating-linear-gradient(45deg, …) 控制条宽与间隔。', pe: 'repeating-linear-gradient(45deg, …) sets width and gap.',
      demo: 'surface', params: [P('w', '条宽', 'Width', 4, 40, 1, 12, 'px')],
      css: `.fx{background:repeating-linear-gradient(45deg,#eceee6 0,#eceee6 var(--w,12px),#fff var(--w,12px),#fff calc(var(--w,12px)*2))}` },

    { id: 'stripemove', zh: '流动条纹', en: 'Moving stripes', dz: '条纹持续平移，像进度条', de: 'Stripes travel — the barber-pole loader',
      pz: '动画 background-position，配 linear 缓动无限循环。', pe: 'Animate background-position linearly, forever.',
      demo: 'surface', css: `@keyframes fxs{to{background-position:56px 0}}.fx{background:repeating-linear-gradient(45deg,#4d8ba6 0 14px,#2c4b28 14px 28px);animation:fxs 1.2s linear infinite}` },

    { id: 'checker', zh: '棋盘格', en: 'Checkerboard', dz: '经典透明底格子', de: 'The classic transparency checker',
      pz: '两个 45/135 度 conic 或两层 linear-gradient 拼成。', pe: 'A conic-gradient repeated, or two offset linear-gradients.',
      demo: 'surface', css: `.fx{background:conic-gradient(#eceef1 0 25%,#fff 0 50%,#eceef1 0 75%,#fff 0);background-size:28px 28px}` },

    { id: 'topo', zh: '等高线', en: 'Topographic lines', dz: '像地形图的一圈圈线', de: 'Contour rings like a topo map',
      pz: '重复 radial-gradient 圆环 + 轻微偏移错位。', pe: 'Repeating radial-gradient rings, slightly offset.',
      demo: 'surface', css: `.fx{background:#f4f5f1;background-image:repeating-radial-gradient(circle at 30% 40%,transparent 0 18px,#dfe2e6 18px 19px),repeating-radial-gradient(circle at 78% 76%,transparent 0 22px,#e5e8eb 22px 23px)}` },

    { id: 'halftone', zh: '半调网点', en: 'Halftone dots', dz: '印刷网点，从密到疏', de: 'Print dots, dense to sparse',
      pz: 'radial-gradient 圆点 + mask 渐变控制疏密。', pe: 'A dot pattern masked by a gradient controls the density.',
      demo: 'surface', css: `.fx{background:#fcfcfb;background-image:radial-gradient(#23232f 2.6px,transparent 2.7px);background-size:12px 12px;-webkit-mask-image:linear-gradient(120deg,#000,transparent)}` },

    { id: 'paper', zh: '纸纹', en: 'Paper texture', dz: '微微不均的纸面', de: 'Slightly uneven paper',
      pz: '暖白底 + 极低透明度噪点 + 一点点纤维纹理。', pe: 'Warm white with very low-opacity grain and faint fibres.',
      demo: 'surface', css: `.fx{background:#faf8f4;background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.018) 0 1px,transparent 1px 4px),repeating-linear-gradient(rgba(0,0,0,.014) 0 1px,transparent 1px 3px)}` },

    { id: 'vignette', zh: '暗角', en: 'Vignette', dz: '四角压暗，把注意力收进来', de: 'Darkened corners pull the eye inward',
      pz: '一层 inset box-shadow 或 radial-gradient 覆盖。', pe: 'An inset box-shadow or radial overlay.',
      demo: 'surface', css: `.fx{background:#5c6a58;box-shadow:inset 0 0 120px 40px rgba(0,0,0,.55)}` },

    { id: 'glass', zh: '毛玻璃面板', en: 'Frosted panel', dz: '半透明模糊的浮层', de: 'A translucent blurred panel',
      pz: 'backdrop-filter:blur(16px) + 半透明底色 + 1px 亮边。', pe: 'backdrop-filter blur(16px), translucent fill, 1px light border.',
      demo: 'surface', css: `.fx{background:linear-gradient(135deg,#e8879c,#f4dcb8)}.fx::after{content:'';position:absolute;inset:60px 80px;border-radius:16px;background:rgba(255,255,255,.22);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.45)}` },

    { id: 'duotone', zh: '双色调照片', en: 'Duotone', dz: '照片只保留两种色调', de: 'A photo reduced to two tones',
      pz: 'grayscale 后叠一层混合模式为 screen/multiply 的双色。', pe: 'Grayscale, then two color layers in screen/multiply blend.',
      demo: 'surface', css: `.fx{background:linear-gradient(135deg,#2f5570,#f0c9a8);position:relative}.fx::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(75deg,rgba(0,0,0,.25) 0 6px,transparent 6px 14px);mix-blend-mode:multiply}` },

    { id: 'scanlines', zh: '扫描线', en: 'Scanlines', dz: 'CRT 屏幕的横纹', de: 'CRT screen lines',
      pz: '2px 一循环的横向渐变 + 缓慢下移动画。', pe: 'A 2px repeating horizontal gradient drifting slowly.',
      demo: 'surface', css: `@keyframes fxsl{to{background-position:0 8px}}.fx{background:#0d1a12;background-image:repeating-linear-gradient(rgba(255,255,255,.07) 0 1px,transparent 1px 4px);animation:fxsl 1.6s linear infinite}` },

    { id: 'starfield', zh: '星点', en: 'Starfield', dz: '深色底上零散亮点', de: 'Scattered points on a dark ground',
      pz: '多层不同尺寸的 radial-gradient 圆点 + 不同 background-size。', pe: 'Several dot layers at different sizes and densities.',
      demo: 'surface', css: `.fx{background:#0b0d16;background-image:radial-gradient(#fff 1px,transparent 1.2px),radial-gradient(rgba(255,255,255,.6) 1px,transparent 1.2px);background-size:90px 90px,50px 50px;background-position:0 0,25px 35px}` },

    { id: 'wave', zh: '波浪分隔', en: 'Wave divider', dz: '两块颜色之间是一条波浪', de: 'A wave separates two color fields',
      pz: '用 SVG path 或 radial-gradient 重复做波形边界。', pe: 'An SVG path, or repeated radial-gradients, forms the wavy edge.',
      demo: 'surface', css: `.fx{background:#4d8ba6}.fx::after{content:'';position:absolute;left:0;right:0;bottom:0;height:60%;background:#fcfcfb;-webkit-mask-image:radial-gradient(30px 30px at 30px 0,transparent 29px,#000 30px);-webkit-mask-size:60px 60px;-webkit-mask-repeat:repeat-x;background-clip:padding-box}` },

    { id: 'hex', zh: '蜂巢纹', en: 'Hex pattern', dz: '六边形密铺', de: 'Tiled hexagons',
      pz: '两层 60/120 度重复渐变叠出六边形错觉。', pe: 'Two 60/120° repeating gradients fake the hex tiling.',
      demo: 'surface', css: `.fx{background:#fcfcfb;background-image:repeating-linear-gradient(60deg,#eceef1 0 1px,transparent 1px 30px),repeating-linear-gradient(-60deg,#eceef1 0 1px,transparent 1px 30px),repeating-linear-gradient(0deg,#eceef1 0 1px,transparent 1px 26px)}` },

    { id: 'plus', zh: '十字点阵', en: 'Plus pattern', dz: '小加号排成阵列', de: 'A field of little plus signs',
      pz: '两条短线交叉 + background-size 重复。', pe: 'Two short crossing lines, repeated by background-size.',
      demo: 'surface', params: [P('g', '间距', 'Spacing', 16, 64, 2, 32, 'px')],
      css: `.fx{background:#fcfcfb;background-image:linear-gradient(#cfd2d8 1.5px,transparent 1.5px),linear-gradient(90deg,#cfd2d8 1.5px,transparent 1.5px);background-size:var(--g,32px) var(--g,32px);-webkit-mask-image:radial-gradient(circle,#000 3px,transparent 3.5px);-webkit-mask-size:var(--g,32px) var(--g,32px)}` },

    { id: 'gradientborder', zh: '渐变描边卡', en: 'Gradient-border card', dz: '边框是渐变而不是纯色', de: 'The border itself is a gradient',
      pz: 'border:1px solid transparent + background-origin/clip 双层背景。', pe: 'Transparent border with two backgrounds using background-origin/clip.',
      demo: 'surface', css: `.fx{background:#f4f5f1}.fx::after{content:'';position:absolute;inset:50px 70px;border-radius:16px;background:linear-gradient(#fff,#fff) padding-box,linear-gradient(120deg,#e8879c,#75c4d4) border-box;border:2px solid transparent}` },

    { id: 'softlight', zh: '柔光渐晕', en: 'Soft light wash', dz: '一侧被柔光照亮', de: 'One side is washed with soft light',
      pz: '大范围 linear-gradient 从品牌色淡到白，透明度别超 15%。', pe: 'A wide gradient from a brand tint to white, under 15% opacity.',
      demo: 'surface', css: `.fx{background:linear-gradient(120deg,rgba(254,44,85,.14),rgba(117,196,212,.14) 60%,#fff)}` },

    { id: 'gridfade', zh: '网格渐隐', en: 'Fading grid', dz: '网格向边缘淡出', de: 'The grid fades toward the edges',
      pz: '网格图案 + radial mask，避免网格顶到边框显脏。', pe: 'Grid pattern under a radial mask so it never hits the frame.',
      demo: 'surface', css: `.fx{background:#fcfcfb;background-image:linear-gradient(#e2e4e8 1px,transparent 1px),linear-gradient(90deg,#e2e4e8 1px,transparent 1px);background-size:28px 28px;-webkit-mask-image:radial-gradient(ellipse at center,#000 30%,transparent 78%)}` },

    { id: 'colorblock', zh: '双色分块', en: 'Two-block color field', dz: '两块纯色硬碰硬', de: 'Two flat color fields meeting hard',
      pz: '不用渐变，直接切两块饱和色，是最“部落”的一种底。', pe: 'No gradient — two saturated fields meeting at a hard edge.',
      demo: 'surface', css: `.fx{background:linear-gradient(105deg,#2f5570 0 46%,#f0c9a8 46% 100%)}` }
  ]
};
