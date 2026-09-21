import { CHAR_MAP } from './mapdata.js';

// ASCII / 文本模式图形：把字符当像素用。地图与地球由 Natural Earth 真实地理数据生成
const P = (k, zh, en, min, max, step, def, unit) => ({ k, zh, en, min, max, step, def, unit: unit || '' });
const E = 'cubic-bezier(.22,1,.36,1)';
const I = (id, zh, en, dz, de, pz, pe, demo, cells, css, params) => ({ id, zh, en, dz, de, pz, pe, demo, cells, css, params });
const A = (id, zh, en, dz, de, pz, pe, cells, css, params) => I(id, zh, en, dz, de, pz, pe, 'ascii', cells, css, params);
const G = (id, zh, en, dz, de, pz, pe, css) => I(id, zh, en, dz, de, pz, pe, 'asciigrid', null, css);

const PLATE = '.fxascii{background:#fbfbf8;border:1px solid #e8e9e2;border-radius:12px;padding:22px 24px}';
const TERM = '.fxascii{background:#11161a;border-radius:12px;padding:22px 26px}';

export default {
  id: 'ascii', zh: 'ASCII 与点阵', en: 'ASCII & dot-matrix',
  dz: '用字符和点当像素：真实地理数据生成的字符地球与点阵地图、抖动灰阶、终端图形',
  de: 'Characters and dots used as pixels — a real-geometry ASCII globe and dot-matrix map, dithered ramps, terminal graphics',
  items: [
    A('globe', '点阵地球（正射自转）', 'Dot-matrix globe', '真实的大陆在自转，不是贴图', 'Real continents, actually rotating',
      '正射投影（orthographic）逐帧把经纬网格投到圆盘上：每个屏幕点反解出经纬度，查陆海掩膜决定画不画，再按 cos(角距) 做球面明暗。这里把 36 帧（每 10° 经度）烤成一张 6×6 精灵图，用 steps() 切帧——横向步进列、纵向步进行，两条动画各管一个 background-position 分量。',
      'Orthographic projection, frame by frame: invert each screen point to lon/lat, test it against a land mask, then shade by cos of the angular distance. Here 36 frames (10° of longitude each) are baked into a 6×6 sprite and stepped with steps() — one animation walks the columns, another the rows.',
      [''],
      `@keyframes fxk{from{background-position-x:0px}to{background-position-x:-1560px}}
@keyframes fxg{from{background-position-y:0px}to{background-position-y:-1560px}}
.fxascii{width:260px;height:260px}
.fx{width:260px;height:260px;background-image:url(assets/globe-sprite.png);background-size:1560px 1560px;background-repeat:no-repeat;animation:fxk var(--t,1.5s) steps(6,end) infinite,fxg calc(var(--t,1.5s)*6) steps(6,end) infinite}`,
      [P('t', '每 6 帧用时', 'Frame block', 0.6, 4, .1, 1.5, 's')]),

    A('dotmatrix', '点阵地图 · 节点与航线', 'Dot map with nodes & arc', '干净的点阵底图，上面跑一条航线', 'A clean dot plate with one route drawn across it',
      '底图是等距圆柱投影的规则点阵：先把陆地栅格化，再按单元格覆盖率（≥34%）决定是否落点，孤点剔除，南极裁掉——点距约为点径的四倍才够干净。节点用同心 box-shadow 做脉冲环，航线用 border-radius 的一段圆弧配 clip-path 逐段画出。',
      'The plate is a regular grid in equirectangular projection: rasterise the land, keep a cell only if ≥34% covered, drop orphans, clip Antarctica. Pitch should be about four times the dot radius. Nodes pulse with concentric box-shadows; the route is an arc of a rounded box revealed by clip-path.',
      [''],
      `@keyframes fxk{0%{box-shadow:0 0 0 0 rgba(107,78,240,.42)}70%,100%{box-shadow:0 0 0 14px rgba(107,78,240,0)}}
@keyframes fxa{0%{clip-path:inset(0 100% 0 0)}60%,100%{clip-path:inset(0 0 0 0)}}
@keyframes fxp{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
.fxascii{width:min(560px,94%);background:#fff;border:1px solid #eceee6;border-radius:12px;padding:16px}
.fx{position:relative;width:100%;aspect-ratio:76/36}
.fx::before{content:'';position:absolute;inset:0;background:#aeb2a6;-webkit-mask:url(assets/world-dots.png) center/contain no-repeat;mask:url(assets/world-dots.png) center/contain no-repeat}
.fx>b,.fx>i,.fx>u{display:block;position:absolute;z-index:2}
.fx>b{left:23.5%;top:37%;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:#6b4ef0;animation:fxk 2.4s ease-out infinite}
.fx>i{left:78%;top:70%;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:#e8879c;animation:fxp 2.4s ease-in-out infinite}
.fx>u{left:23.5%;top:22%;width:54.5%;height:30%;border-top:2.5px solid #e8879c;border-radius:50%;transform:rotate(16deg);transform-origin:0 50%;text-decoration:none;animation:fxa 3.6s cubic-bezier(.22,1,.36,1) infinite}`),

    A('worldmap', '字符世界地图', 'ASCII world map', '同一份地理数据，落到字符网格上', 'The same geometry, resampled onto a character grid',
      '字符格不是正方形（约 1:2），所以纵向要多压一倍才不变形。每格取陆地覆盖率，≥42% 给 █，≥18% 给 ·，其余留空——两级就够，三级以上开始显脏。',
      'Character cells are about 1:2, so squash twice as much vertically. Take land coverage per cell: ≥42% gets █, ≥18% gets ·, the rest stays blank. Two levels is enough — three starts to look dirty.',
      [CHAR_MAP],
      `@keyframes fxk{0%{clip-path:inset(0 62% 0 0)}55%,100%{clip-path:inset(0 0 0 0)}}
${PLATE}
.fx{font-size:8.5px;line-height:1.15;color:#3f4149;animation:fxk 6s ${E} infinite}`),

    G('wavegrid', '字符网格波', 'Character grid wave', '一道斜波扫过整片字符', 'One diagonal wave sweeping the field',
      '整片同一个字形，只用 animation-delay 沿索引递增制造相位差；delay 用负值动画就不必等第一轮跑完。',
      'One glyph everywhere; phase comes from an animation-delay that grows with the cell index. Negative delays start the field mid-cycle.',
      `@keyframes fxk{0%,100%{opacity:.14;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}
.fxagrid{color:#2f5570}
.fx{animation:fxk 2.6s ease-in-out infinite;animation-delay:calc(var(--i) * -42ms)}`),

    G('densitygrid', '密度梯度网格', 'Density ramp grid', '从左到右越来越"重"', 'Ink weight climbing left to right',
      '按列给不同的字重与透明度，就得到一条可读的密度梯度——字符版的灰阶条。',
      'Weight and alpha per column give a readable density ramp — the character-grid version of a greyscale wedge.',
      `@keyframes fxk{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.fxagrid{color:#23232f;animation:fxk 6s ease-in-out infinite}
.fx{opacity:.1}
.fx:nth-child(12n+2){opacity:.2}
.fx:nth-child(12n+3){opacity:.3}
.fx:nth-child(12n+4){opacity:.42}
.fx:nth-child(12n+5){opacity:.52}
.fx:nth-child(12n+6){opacity:.6}
.fx:nth-child(12n+7){opacity:.68}
.fx:nth-child(12n+8){opacity:.76}
.fx:nth-child(12n+9){opacity:.84}
.fx:nth-child(12n+10){opacity:.9}
.fx:nth-child(12n+11){opacity:.96}
.fx:nth-child(12n){opacity:1}`),

    A('ramp', '灰阶字符表', 'Luminance ramp', '越暗的地方字符越"重"', 'Darker areas take heavier glyphs',
      '把亮度 0–255 映射到一张按笔画密度排序的字符表（" .:-=+*#%@"），这一步叫 luminance ramp。表的单调性比长度重要。',
      'Map luminance 0–255 onto a glyph table ordered by ink density (" .:-=+*#%@") — the luminance ramp. Monotonicity matters more than length.',
      [' . : - = + * # % @'],
      `@keyframes fxk{0%,100%{opacity:.42}50%{opacity:1}}
.fx{font-size:30px;letter-spacing:.16em;color:#23232f}
.fx>b{display:inline;animation:fxk 5s ease-in-out infinite}`),

    A('dither', '有序抖动（Bayer）', 'Ordered dithering', '只有四级墨，看着是连续渐变', 'Four ink levels reading as a smooth gradient',
      '4×4 Bayer 矩阵做阈值抖动，用 ░▒▓█ 表现灰阶。它的花纹是确定性的，所以放大不会像噪点抖动那样"沙沙"。',
      'A 4×4 Bayer threshold matrix over ░▒▓█. The pattern is deterministic, so it never fizzes the way noise dithering does when scaled.',
      ['░░░░▒▒▒▒▓▓▓▓████\n░░▒▒▒▒▓▓▓▓██████\n░▒▒▒▓▓▓▓████████\n▒▒▒▓▓▓▓█████████'],
      `@keyframes fxk{to{transform:translateX(-2ch)}}
${PLATE}
.fx{font-size:22px;line-height:1.12;color:#2f5570;animation:fxk 3s steps(2,end) infinite}`),

    A('braille', '盲文点阵', 'Braille dot-matrix', '同样一格字符，四倍分辨率', 'Four times the resolution per cell',
      'U+2800 盲文块每格 2×4 点，是终端里能拿到的最高有效分辨率；btop、gnuplot 的字符图都靠它。',
      'U+2800 braille cells pack 2×4 dots — the highest usable resolution in a terminal. btop and gnuplot lean on it.',
      ['⣀⣤⣶⣿⣿⣶⣤⣀⣀⣤⣶⣿⣿⣶⣤⣀\n⠉⠛⠿⣿⣿⠿⠛⠉⠉⠛⠿⣿⣿⠿⠛⠉'],
      `@keyframes fxk{0%,100%{transform:translateY(-3px)}50%{transform:translateY(3px)}}
.fx{font-size:26px;line-height:1.2;color:#4d8ba6;animation:fxk 2.8s ease-in-out infinite}`),

    A('matrix', '字符雨', 'Character rain', '一列列字符往下掉', 'Columns of glyphs falling',
      '每列一个独立速度与偏移的字符流，头部最亮、尾部指数衰减；尾迹用一层 mask 渐变，比逐字设透明度便宜得多。',
      'One stream per column, each with its own speed and offset: bright head, exponential tail. A single gradient mask is far cheaper than per-glyph opacity.',
      ['ｱ7ﬄ2ｷ\nﾂ4ｻ9ﬃ\n1ｳﬂ6ﾜ\nｼ3ｦ8ﬅ\n5ﾉｹ0ﬄ\nﾊ2ﬃ7ｲ'],
      `@keyframes fxk{to{transform:translateY(-50%)}}
.fxascii{height:220px;overflow:hidden;background:#0d150f;border-radius:12px;padding:0 24px;mask:linear-gradient(180deg,#000,#000 58%,transparent)}
.fx{font-size:16px;line-height:1.6;color:#e5a68f;letter-spacing:.34em;animation:fxk 4s linear infinite}`),

    A('figlet', 'FIGlet 大字横幅', 'FIGlet banner', '用字符拼出的巨大标题', 'A headline built out of characters',
      'FIGlet / toilet 字体把每个字母展开成多行字符网格，标准 banner 高 6 行；CI 日志与 CLI 欢迎页的常见开场。',
      'FIGlet fonts expand each letter into a multi-row grid; the standard banner is six rows. Ubiquitous in CI logs and CLI splash screens.',
      ['   _  _____ _        _   ___\n  /_\\|_   _| |      /_\\ / __|\n / _ \\ | | | |__   / _ \\\\__ \\\n/_/ \\_\\|_| |____| /_/ \\_\\___/'],
      `@keyframes fxk{0%{clip-path:inset(0 70% 0 0)}55%,100%{clip-path:inset(0 0 0 0)}}
.fx{font-size:14px;line-height:1.18;color:#23232f;animation:fxk 3.4s steps(28,end) infinite}`),

    A('boxdraw', '制表符界面', 'Box-drawing TUI', '纯字符画出来的面板', 'A panel drawn entirely in glyphs',
      'U+2500 制表符（─│┌┐└┘├┤┬┴┼）拼边框与分栏，是 ncurses / TUI 的基本材料；宽度必须按字符数算，不能按像素。',
      'The U+2500 box-drawing range builds frames and splits — the raw material of ncurses and every TUI. Size everything in characters, never pixels.',
      ['┌────────────────┬──────────────┐\n│ effects        │        1 877 │\n│ families       │           46 │\n├────────────────┼──────────────┤\n│ ascii          │ ████████░░░░ │\n│ page languages │ ██████████░░ │\n└────────────────┴──────────────┘'],
      `@keyframes fxk{0%,100%{opacity:.4}50%{opacity:1}}
${TERM}
.fx{font-size:14px;line-height:1.55;color:#f0c9a8}
.fx::after{content:'';animation:fxk 2.2s ease-in-out infinite}`),

    A('spinner', '字符转轮', 'Spinner frames', '一个字符位上的旋转', 'Rotation inside a single cell',
      '一组等宽帧（⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ 或 |/-\\）用 steps() 逐帧切换，80–120ms 一帧最不晃眼。',
      'A ring of equal-width frames stepped with steps(); 80–120ms per frame reads best.',
      ['  building'],
      `@keyframes fxk{0%{content:'⠋'}12%{content:'⠙'}25%{content:'⠹'}37%{content:'⠸'}50%{content:'⠼'}62%{content:'⠴'}75%{content:'⠦'}87%{content:'⠧'}100%{content:'⠇'}}
.fx{font-size:22px;color:#65675f;position:relative}
.fx::before{content:'⠋';position:absolute;left:0;color:#e8879c;animation:fxk 1s steps(1,end) infinite}`),

    A('progress', '字符进度条', 'Text progress bar', '方块一格一格填满', 'Blocks filling one cell at a time',
      '整格用 █，余数用 ▏▎▍▌▋▊▉ 做八分之一细分——tqdm / pv 就是这么画的，比像素条更容易对齐日志。',
      'Full cells in █, the remainder in the ▏▎▍▌▋▊▉ eighths — how tqdm and pv draw it, and it aligns with log text.',
      ['[·························]'],
      `@keyframes fxk{0%{clip-path:inset(0 96% 0 0)}92%,100%{clip-path:inset(0 0 0 0)}}
.fx{font-size:18px;color:#c9cbc0;position:relative;letter-spacing:.02em}
.fx::after{content:'[████████████████████████]';position:absolute;left:0;top:0;color:#4d8ba6;animation:fxk 4.4s steps(24,end) infinite}`),

    A('cursor', '块状光标', 'Block cursor', '那个方块一直在呼吸', 'The block that never stops blinking',
      'VT100 光标是 530ms 硬切（steps(1)），不是淡入淡出；软光标才用 opacity 过渡。',
      'A VT100 cursor hard-switches about every 530ms with steps(1) — only soft cursors fade.',
      ['$ ready'],
      `@keyframes fxk{0%,49%{opacity:1}50%,100%{opacity:0}}
.fx{font-size:24px;color:#23232f}
.fx::after{content:'▊';color:#e8879c;animation:fxk 1.06s steps(1,end) infinite}`),

    A('bootlog', '启动日志滚动', 'Boot log scroll', '一行行日志自己往上走', 'Log lines climbing on their own',
      '定高容器 + 整体 translateY，进入时给一档 opacity 台阶；时间戳与数字用等宽对齐，日志才不抖。',
      'A fixed-height box, one translateY on the block, an opacity step as rows enter. Tabular figures keep timestamps from jittering.',
      ['$ npm create atlas\n✓ resolving 1 877 effects\n✓ building index\n✓ ready on :3000\n$ npm run build\n✓ 46 modules\n✓ done in 1.24s\n$ '],
      `@keyframes fxk{0%{transform:translateY(26%)}100%{transform:translateY(-38%)}}
.fxascii{height:200px;overflow:hidden;background:#11161a;border-radius:12px;padding:0 26px;display:flex;align-items:center;mask:linear-gradient(180deg,transparent,#000 18%,#000 82%,transparent)}
.fx{font-size:14px;line-height:2;color:#c2c4bc;animation:fxk 9s linear infinite}`),

    A('sparkline', '字符迷你折线', 'Glyph sparkline', '一行字符里的趋势线', 'A trend line inside one line of text',
      '把序列归一化到 ▁▂▃▄▅▆▇█ 八级块字符，一行字就是一张图；状态栏里最省地方的可视化。',
      'Normalise the series onto the ▁▂▃▄▅▆▇█ eighths — one line of text becomes a chart. The cheapest viz in any status bar.',
      ['▁▂▄▃▅▇▆█▅▃▂▄▆▇█▆▄▂▁▃▅▆▇'],
      `@keyframes fxk{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.45)}}
.fx{font-size:36px;line-height:1;color:#4d8ba6;transform-origin:bottom;animation:fxk 4s ${E} infinite}`),

    A('barchart', '字符柱状图', 'Text bar chart', '用方块排出来的排行榜', 'A ranking drawn in blocks',
      '标签左对齐、条形用 █ 重复、数值右对齐等宽——CLI 报表的标准三栏，宽度按最长标签定。',
      'Left-aligned labels, repeated █ bars, right-aligned tabular values — the standard three columns of a CLI report, sized by the longest label.',
      ['pagestyle  ████████████████  49\ntext       ████████████      32\nascii      ██████████        24\nscroll     ████████          25'],
      `@keyframes fxk{0%{clip-path:inset(0 62% 0 0)}60%,100%{clip-path:inset(0 0 0 0)}}
${PLATE}
.fx{font-size:14px;line-height:2;color:#23232f;animation:fxk 4.4s ${E} infinite}`),

    A('plasma', '等离子场', 'Plasma field', '字符组成的流动色场', 'A flowing colour field made of glyphs',
      '多个正弦叠加（sin(x)+sin(y)+sin(x+y+t)）求值后查字符表，是 demoscene 的入门题；这里用一层渐变裁进字里。',
      'Sum a few sines — sin(x)+sin(y)+sin(x+y+t) — and look the value up in the ramp. The demoscene starter exercise; here a gradient is clipped into the glyphs.',
      ['░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░\n▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░\n▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒\n█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓'],
      `@keyframes fxk{to{background-position:220px 0}}
.fx{font-size:24px;line-height:1.1;background:linear-gradient(92deg,#2f5570,#e5a68f,#75c4d4,#2f5570);background-size:220px 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxk 5s linear infinite}`),

    A('crt', 'CRT 扫描线', 'CRT scanlines', '像老显示器那样有横纹和辉光', 'Old-monitor stripes and phosphor glow',
      '偶数行叠半透明黑（repeating-linear-gradient），再加 text-shadow 磷光与极轻的桶形畸变；扫描线间距必须是整像素，否则会摩尔纹。',
      'Overlay a repeating-linear-gradient on alternate rows, add a phosphor text-shadow and a touch of barrel distortion. Keep the stripe pitch on whole pixels or it moirés.',
      ['SAVIMBO TERMINAL v2.6\n─────────────────────\n> LOADING ATLAS ...\n> 1 877 EFFECTS OK\n> READY ▊'],
      `@keyframes fxk{0%,100%{opacity:.9}50%{opacity:1}}
.fxascii{position:relative;background:#0c1410;border-radius:12px;padding:24px 28px;overflow:hidden}
.fxascii::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(0,0,0,.4) 0 1px,transparent 1px 3px);pointer-events:none}
.fx{font-size:15px;line-height:1.7;color:#a5d66b;text-shadow:0 0 7px rgba(142,166,4,.7);animation:fxk 2.4s ease-in-out infinite}`),

    A('typewriter', '打字机逐字', 'Typewriter reveal', '一个字一个字打出来', 'One character at a time',
      '等宽字体 + ch 单位宽度配 steps(n)，才不会露出半个字；变宽字体必须改成逐字 span。',
      'Monospace plus a ch-unit width stepped with steps(n) — anything else shows half a glyph. Proportional type needs per-character spans.',
      ['> describe the effect you want_'],
      `@keyframes fxk{0%{width:5ch}70%,100%{width:30ch}}
.fx{font-size:19px;color:#23232f;white-space:nowrap;overflow:hidden;border-right:2px solid #e8879c;width:30ch;animation:fxk 4.4s steps(25,end) infinite}`),

    A('glitch', '字符错位故障', 'Glyph corruption', '字符被替换成乱码再复原', 'Glyphs corrupt into noise, then resolve',
      '随机替换（scramble）配 steps 抽帧，替换池只取同宽字符，字段宽度才不会跳。',
      'Scramble on stepped frames, drawing only from same-width glyphs so the field never reflows.',
      ['ATLAS ▓ 9M@R#A'],
      `@keyframes fxk{0%,100%{clip-path:inset(0 0 0 0);transform:none}20%{clip-path:inset(30% 0 44% 0);transform:translateX(-4px)}40%{clip-path:inset(58% 0 14% 0);transform:translateX(5px)}60%{clip-path:inset(8% 0 68% 0);transform:translateX(-3px)}}
.fx{font-size:30px;letter-spacing:.06em;color:#23232f;position:relative}
.fx::after{content:'A#R@M9 ▓ ATLAS';position:absolute;left:0;top:0;color:#e8879c;mix-blend-mode:multiply;animation:fxk 2.6s steps(1,end) infinite}`),

    A('gauge', '字符仪表', 'Text gauge', '半圆表盘也能用字符画', 'Even a dial can be typed',
      '半圆刻度用 ╱╲│ 排布，指针一格反色；htop / btop 的资源表就是这套，读数必须等宽。',
      'Arrange ╱╲│ into a half-circle scale and invert one cell for the needle — the htop / btop resource dial. Keep the readout tabular.',
      ['   ╱▔▔▔╲\n  │  62 │\n   ╲▁▁▁╱\n  0     100'],
      `@keyframes fxk{0%,100%{color:#4d8ba6}50%{color:#e8879c}}
${PLATE}
.fx{font-size:20px;line-height:1.5;color:#4d8ba6;text-align:center;animation:fxk 4s ease-in-out infinite}`),

    A('gitgraph', '提交图谱', 'Commit graph', 'git log --graph 那种分叉线', 'The branching lines of git log --graph',
      '用 │╱╲├ 表示分支与合并，节点 ● ○；顺序由拓扑排序决定，不是时间——这也是它常让人看错的原因。',
      'Branches and merges in │╱╲├ with ● ○ nodes, ordered topologically rather than chronologically — which is exactly why people misread it.',
      ['● atlas: real dot-matrix globe\n│╲\n│ ● style: 49 page languages\n│╱\n● index: regroup navigation\n│\n● init'],
      `@keyframes fxk{0%{clip-path:inset(0 0 62% 0)}60%,100%{clip-path:inset(0 0 0 0)}}
${PLATE}
.fx{font-size:14px;line-height:1.9;color:#23232f;animation:fxk 5s ${E} infinite}`)
  ]
};
