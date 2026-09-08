// 响应式：断点从内容来，不从设备来；还包括打印与邮件这两个"另一种视口"
const E = 'cubic-bezier(.22,1,.36,1)';
const I = (id, zh, en, dz, de, pz, pe, demo, css) => ({ id, zh, en, dz, de, pz, pe, demo, css });

export default {
  id: 'responsive', zh: '响应式与跨媒介', en: 'Responsive & cross-medium',
  dz: '断点从内容来不从设备来：容器查询、流体字阶、安全区，一路到打印样式与邮件表格',
  de: 'Breakpoints come from content, not devices — container queries, fluid scales, safe areas, through to print styles and email tables',
  items: [
    I('mobilefirst', '移动优先', 'Mobile-first', '先写窄的，再往宽加', 'Write narrow first, then add',
      '基础样式面向最小屏，用 min-width 逐级增强；反过来写会留下一堆覆盖不掉的桌面假设。',
      'Base styles target the smallest screen and min-width queries add on. The reverse leaves desktop assumptions you cannot override.',
      'cards', `.fxrow{flex-wrap:wrap;max-width:340px}.fx{width:100%;height:56px}@media (min-width:520px){.fx{width:150px;height:190px}}`),

    I('breakpointstrategy', '断点从内容来', 'Content-driven breakpoints', '不是 768，是"这行开始难读了"', 'Not 768px — the width where the line breaks badly',
      '把窗口慢慢拉，在版式真正坏掉的位置设断点；设备尺寸每年都变，内容的临界宽度不变。',
      'Drag the window and put a breakpoint where the layout actually breaks. Device sizes change yearly; content thresholds do not.',
      'text', `.fx{white-space:normal;max-width:20ch;font-size:clamp(20px,3.4vw,34px);line-height:1.25;text-wrap:pretty}`),

    I('containerquery', '容器查询', 'Container queries', '组件问的是"我多宽"，不是"窗口多宽"', 'The component asks its own width, not the window\'s',
      'container-type:inline-size + @container；同一个卡片放侧栏和放主栏能各自变形，这是媒体查询做不到的。',
      'container-type:inline-size with @container lets one card adapt differently in a sidebar and in the main column. Media queries cannot.',
      'card', `.fxcard{container-type:inline-size;width:min(320px,84%)}.fx{display:flex;gap:12px}.fx>b{width:84px;height:64px;margin:0;flex:none}@container (max-width:260px){.fx{flex-direction:column}.fx>b{width:100%;height:90px}}`),

    I('fluidtype', '流体字阶', 'Fluid type', 'clamp 一次搞定所有中间尺寸', 'clamp covers every size in between',
      'clamp(最小, 计算式, 最大)，中间项混 rem 与 vw 保证可缩放；只用 vw 会让用户缩放失效。',
      'clamp(min, a rem+vw expression, max). Pure vw breaks user zoom, so always keep a rem term.',
      'text', `.fx{font-size:clamp(26px,3vw+14px,72px);letter-spacing:-.03em}`),

    I('modularscale', '响应式字阶', 'Responsive type scale', '小屏不该按同一个比例往下缩', 'Small screens need a tighter ratio',
      '窄屏用 1.2 左右的比例，宽屏放到 1.333–1.5；标题与正文的差距在小屏要收窄。',
      'Use about 1.2 on narrow screens and 1.333–1.5 on wide ones. Compress the heading-to-body jump when narrow.',
      'list', `.fxcol{gap:4px;width:min(400px,88%)}.fx{height:auto;padding:6px 14px;border:0;background:transparent}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'\u6bd4\u4f8b 1.2 \u00b7 \u7a84\u5c4f';font-size:19px;font-weight:600;color:#23232f}.fx:nth-child(2)::after{content:'\u6bd4\u4f8b 1.333 \u00b7 \u4e2d\u5c4f';font-size:24px;font-weight:600;color:#3f6f92}.fx:nth-child(3)::after{content:'\u6bd4\u4f8b 1.5 \u00b7 \u5bbd\u5c4f';font-size:31px;font-weight:600;color:#4d8ba6}.fx:nth-child(n+4){display:none}`),

    I('minmax0', '网格不溢出', 'minmax(0,1fr)', '1fr 会被长内容顶破', 'A long child bursts a plain 1fr',
      'grid 轨道写 minmax(0,1fr)，flex 子项加 min-width:0；这两句能解决八成"莫名横向滚动条"。',
      'Write minmax(0,1fr) for grid tracks and min-width:0 on flex children. That fixes most mystery horizontal scrollbars.',
      'grid', `.fxgrid{grid-template-columns:repeat(3,minmax(0,1fr));width:min(360px,86%)}.fx{height:80px;min-width:0}`),

    I('autofitfill', 'auto-fit 与 auto-fill', 'auto-fit vs auto-fill', '一个会撑开，一个会留空轨', 'One stretches, one keeps empty tracks',
      'repeat(auto-fit,minmax(240px,1fr)) 是无媒体查询的响应式网格；auto-fill 会保留空列，适合要对齐的场合。',
      'repeat(auto-fit,minmax(240px,1fr)) is a query-free responsive grid. auto-fill keeps the empty tracks, which suits fixed alignment.',
      'grid', `.fxgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(86px,1fr));width:min(340px,86%);gap:10px}.fx{height:76px}`),

    I('intrinsic', '内在布局', 'Intrinsic layout', '让元素自己说"我最少要多宽"', 'Let elements state their own minimum',
      'min-content / max-content / fit-content + flex-wrap，用元素的内在尺寸驱动换行，断点数量能砍一半。',
      'min-content, max-content, fit-content plus wrapping lets intrinsic sizes drive the reflow. It halves your breakpoint count.',
      'pill', `.fxpill{max-width:300px}.fx{width:fit-content}`),

    I('sidebarpattern', '侧栏塌陷', 'Collapsing sidebar', '够宽并排，不够就上下', 'Side by side when it fits, stacked when it does not',
      'flex-wrap + 侧栏 flex-basis 固定、主栏 flex:999 1 60%，主栏低于阈值时自动换行——不用媒体查询。',
      'Wrap plus a fixed sidebar basis and flex:999 1 60% on the main column. It folds on its own with no query.',
      'cards', `.fxrow{flex-wrap:wrap;max-width:420px}.fx:nth-child(1){flex:0 0 120px;height:150px}.fx:nth-child(2){flex:999 1 60%;width:auto;height:150px}.fx:nth-child(3){display:none}`),

    I('switcher', '单双列切换', 'The switcher', '过了阈值一次性从一列变多列', 'It flips all at once at a threshold',
      '用 flex-basis:calc((阈值 - 100%) * 999) 做零查询切换；比逐级断点更干净，也不会出现"半宽尴尬列"。',
      'flex-basis:calc((threshold - 100%) * 999) flips it with no query — cleaner than stepped breakpoints and no awkward half-columns.',
      'cards', `.fxrow{flex-wrap:wrap;max-width:400px;gap:12px}.fx{flex:1 1 calc((380px - 100%) * 999);height:130px;width:auto}`),

    I('clusterwrap', '簇状换行', 'Cluster', '一堆标签自己找地方排', 'A pile of chips finds its own arrangement',
      'flex-wrap + gap，不给固定列数；标签、面包屑、操作按钮组都属于这一类。',
      'Wrapping flex with a gap and no fixed column count. Tags, breadcrumbs and action groups all belong here.',
      'pill', `.fxpill{max-width:300px;justify-content:flex-start}`),

    I('reeltoscroll', '横滑卡片轨', 'Scroll reel', '小屏放不下就让它横着滑', 'If it will not fit, let it slide',
      'overflow-x:auto + scroll-snap-type:x mandatory + 首尾 scroll-padding；一定要露出下一张的边，暗示可滑。',
      'overflow-x:auto with x-mandatory snapping and scroll padding. Always reveal the next card\'s edge as an affordance.',
      'cards', `.fxrow{max-width:300px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px}.fx{flex:none;scroll-snap-align:start}`),

    I('tabletocard', '表格转卡片', 'Table to cards', '小屏的表格要变成一叠卡', 'On narrow screens a table becomes a stack',
      '每行变一张卡，表头下沉成每格的行内标签（data-label + ::before）；横滑表格是次优解。',
      'Each row becomes a card and the header sinks into per-cell labels via data-label. A horizontally scrolled table is second best.',
      'table', `.fxtable{width:min(300px,86%);border:0;background:transparent;display:flex;flex-direction:column;gap:10px}.fx{border:1px solid #e6e7ea;border-radius:10px;background:#fff;height:auto;padding:12px 14px;flex-direction:column;align-items:flex-start;gap:6px}.fx:first-child{display:none}.fx>i{display:none}.fx::before{content:'\u9879\u76ee\u540d\u79f0';font:600 10px var(--fx-mono,monospace);color:#9b9d92}`),

    I('navtobottom', '导航转底栏', 'Nav to bottom bar', '拇指能到的地方才是主导航', 'Primary nav lives where the thumb reaches',
      '桌面顶部横排，移动端 3–5 项落到底部 tab bar；超过 5 项的第五格放"更多"，不要挤。',
      'A top row on desktop, a three-to-five item bottom bar on mobile. Past five, the last slot becomes More.',
      'nav', `.fxnav{width:min(300px,86%);justify-content:space-between;border-radius:14px}.fx{flex:1;text-align:center;font-size:11px;padding:8px 4px}.fx:nth-child(1){color:#3f6f92;font-weight:600}.fx:nth-child(n+5){display:none}`),

    I('safearea', '安全区', 'Safe areas', '刘海、圆角、手势条都会吃掉边缘', 'Notches, corners and the home bar eat your edges',
      'viewport-fit=cover + env(safe-area-inset-*)；底部固定条要加 padding-bottom，否则被手势条压住。',
      'viewport-fit=cover with env(safe-area-inset-*). Fixed bottom bars need the padding or the home indicator covers them.',
      'page', `.fxpage{width:min(300px,86%);border-radius:26px;position:relative}.fxpage::before{content:'';position:absolute;left:50%;top:6px;transform:translateX(-50%);width:74px;height:16px;border-radius:10px;background:#23232f;z-index:7}.fxcta{margin-bottom:34px}.fxart{display:none}.fxpage{grid-template-columns:1fr}`),

    I('dvhsvh', '视口单位家族', 'dvh / svh / lvh', '100vh 在手机上永远不对', '100vh is always wrong on a phone',
      '地址栏会伸缩：全屏用 100dvh，最小可见用 svh，最大用 lvh；固定高度容器一律换掉 vh。',
      'The address bar moves. Use dvh for full height, svh for the smallest visible, lvh for the largest — and retire plain vh.',
      'panel', `@keyframes fxk{0%,100%{height:min(280px,42vh)}50%{height:min(320px,46vh)}}.fxstack{animation:fxk 4s ${E} infinite}.fxa{background:#eef4f8;color:#3f6f92;font:600 13px var(--fx-mono,monospace)}.fxa::after{content:'100dvh'}.fxb{display:none}`),

    I('keyboardavoid', '软键盘遮挡', 'Keyboard avoidance', '键盘一弹，输入框就没了', 'The keyboard swallows the field',
      '用 VirtualKeyboard API 或 visualViewport 事件把内容上移；不要靠 scrollIntoView 硬顶。',
      'Shift content with the VirtualKeyboard API or visualViewport events. Do not fight it with scrollIntoView.',
      'field', `@keyframes fxk{0%,45%{transform:none}55%,100%{transform:translateY(-46px)}}.fxfield{position:relative}.fx{animation:fxk 3.4s ${E} infinite}`),

    I('orientation', '横竖屏', 'Orientation', '横屏不是"变宽的竖屏"', 'Landscape is not just a wider portrait',
      '横屏可用高度骤减：把纵向堆叠改成左右分栏，弹层改成侧滑，别让主按钮掉到屏幕外。',
      'Landscape loses vertical room. Turn stacks into columns, sheets into side panels, and keep the primary action on screen.',
      'panel', `.fxstack{width:min(420px,86%);height:min(180px,28vh)}.fxa{background:#eef4f8;color:#3f6f92;font:600 12px var(--fx-mono,monospace)}.fxa::after{content:'landscape \u00b7 \u5de6\u53f3\u5206\u6805'}.fxb{display:none}`),

    I('foldable', '折叠屏与铰链', 'Foldables & hinge', '中间那道缝不能放按钮', 'Nothing important sits on the seam',
      'viewport-segments 与 env(viewport-segment-*) 拆成两块；把内容对齐到某一半，跨缝的表格要分段。',
      'Split with viewport-segments and env(viewport-segment-*). Align content to one half and break tables at the seam.',
      'panel', `.fxstack{width:min(420px,86%);position:relative}.fxa{background:#f4f5f1;color:#8b8d84}.fxa::after{content:''}.fxstack::after{content:'';position:absolute;left:50%;top:0;bottom:0;width:6px;transform:translateX(-50%);background:linear-gradient(90deg,rgba(0,0,0,.06),rgba(0,0,0,.14),rgba(0,0,0,.06));z-index:3}.fxb{display:none}`),

    I('hoverquery', '有没有悬停', 'hover capability', '触屏没有 hover，别把功能藏在里面', 'Touch has no hover — do not hide function there',
      '@media (hover:hover) 才挂悬停效果；触屏用长按或常驻按钮替代，绝不用 hover 承载唯一入口。',
      'Attach hover effects inside @media (hover:hover). On touch use long-press or a visible button — never hover as the only path.',
      'cards', `.fx{transition:transform .2s ${E}}@media (hover:hover){.fx:hover{transform:translateY(-6px)}}.fx:nth-child(3)::after{content:'hover:none \u2192 \u5e38\u9a7b\u6309\u94ae';font:500 10px var(--fx-mono,monospace);color:#9b9d92}`),

    I('pointercoarse', '粗指针与细指针', 'Coarse vs fine pointer', '手指要 44px，鼠标 24px 就够', '44px for a finger, 24px for a mouse',
      '@media (pointer:coarse) 放大命中区与间距，缩小密度；同一份 UI 两套密度比两套 UI 好维护。',
      'Grow targets and gaps under @media (pointer:coarse). Two densities of one UI beat two UIs.',
      'pill', `.fx{padding:6px 12px;font-size:12px}@media (pointer:coarse){.fx{padding:12px 18px;font-size:14px}}`),

    I('touchtargetscale', '密度切换', 'Density modes', '让用户自己选紧凑还是舒适', 'Let people pick compact or comfortable',
      '把行高、内边距、字号收进一组 token，用一个 data-density 切换；表格与列表最需要。',
      'Put row height, padding and size into one token set toggled by a data-density attribute. Tables and lists need it most.',
      'list', `.fxcol{width:min(400px,88%);gap:6px}.fx{height:38px;font-size:13px}.fx:nth-child(n+5){height:52px;font-size:14px}`),

    I('aspectcrop', '响应式裁切', 'Responsive cropping', '窄屏该换构图，不是压扁', 'Narrow screens need a new crop, not a squash',
      '宽屏 16:9、窄屏 4:5，配 object-position 保住主体；用 aspect-ratio 切换而不是缩放同一张。',
      '16:9 wide, 4:5 narrow, with object-position protecting the subject. Switch aspect-ratio rather than scaling one crop.',
      'media', `@keyframes fxk{0%,45%{aspect-ratio:16/9}55%,100%{aspect-ratio:4/5}}.fxmedia{width:min(240px,60%)}.fx{animation:fxk 4.4s ${E} infinite}`),

    I('artdirection', '艺术指导式响应', 'Art direction', '不只是换尺寸，是换照片', 'A different image, not a smaller one',
      '<picture> + media 换不同构图的源文件：宽屏给全景，窄屏给特写。srcset 只解决体积，解决不了构图。',
      'Use picture with media to swap crops: a panorama wide, a close-up narrow. srcset solves bytes, not composition.',
      'media', `.fxmedia{width:min(300px,72%)}.fx::after{content:'<picture> \u6362\u6784\u56fe';position:absolute;left:10px;bottom:10px;padding:3px 7px;border-radius:4px;background:rgba(20,26,34,.8);color:#fff;font:600 10px var(--fx-mono,monospace)}`),

    I('densitydpr', '高密度屏', 'Device pixel ratio', '2x 屏上 1x 图会糊', 'A 1x asset is mush on a 2x screen',
      'srcset 用 2x 描述符或宽度描述符；但别无脑上 3x——体积翻倍而肉眼几乎无差。',
      'Use 2x or width descriptors in srcset — but not 3x by reflex; it doubles bytes for almost no visible gain.',
      'grid', `.fxgrid{grid-template-columns:repeat(2,110px)}.fx{background:linear-gradient(140deg,#e9eef2,#dde6ec);border:0;display:flex;align-items:center;justify-content:center;font:600 11px var(--fx-mono,monospace);color:#7d97a6}.fx:nth-child(1)::after{content:'1x'}.fx:nth-child(2)::after{content:'2x'}.fx:nth-child(n+3){display:none}`),

    I('printstyle', '打印样式', 'Print stylesheet', '有人真的会按 Ctrl+P', 'People really do hit Ctrl+P',
      '@media print：去掉导航与固定条、展开折叠内容、链接后追加 URL、深底反白、图表改线稿。',
      'In @media print: drop nav and fixed bars, expand collapsed content, append link URLs, invert dark grounds, line-art the charts.',
      'page', `.fxpage{width:min(480px,92%);box-shadow:none;border:1px solid #d9d9d9}.fxbar{display:none}.fxnav2{display:none}.fxart{background:#fff;border-left:1px solid #d9d9d9}.fxcta{background:transparent;color:#23232f;border:1px solid #23232f}.fxsub::after{content:' [savimbo.com/report]';font-family:var(--fx-mono,monospace);color:#8b8d84}`),

    I('pagebreak', '分页控制', 'Page breaks', '标题不能孤零零留在页底', 'A heading must not be orphaned at the page foot',
      'break-inside:avoid 保住卡片与表格行，break-after:avoid 让标题跟住正文，orphans/widows 至少 2 行。',
      'break-inside:avoid keeps cards and rows whole, break-after:avoid keeps headings with their text, and orphans/widows at least 2.',
      'list', `.fxcol{width:min(400px,88%);gap:0}.fx{border-radius:0;border-top:0}.fx:nth-child(3){border-bottom:2px dashed #c9cbc0;position:relative}.fx:nth-child(3)::after{content:'\u2014 \u5206\u9875 \u2014';position:absolute;right:12px;bottom:-9px;padding:0 6px;background:#f6f6f2;font:600 9px var(--fx-mono,monospace);color:#9b9d92}`),

    I('emailtable', '邮件表格布局', 'Email table layout', '邮件客户端还活在 2005 年', 'Email clients still live in 2005',
      '外层 table 居中 + 内层 table 分栏，宽度写死 600px；Outlook 不认 flex/grid，也不认大部分现代 CSS。',
      'A centred outer table with nested column tables at a hard 600px. Outlook understands neither flex nor grid nor most modern CSS.',
      'page', `.fxpage{width:min(420px,90%);grid-template-columns:1fr;border-radius:0}.fxbar{display:none}.fxnav2{justify-content:center;border-bottom:0}.fxhead{padding:22px 22px 0;font-size:22px;text-align:center}.fxsub{padding:10px 22px 0;text-align:center;max-width:none}.fxcta{justify-self:center;margin:18px auto 26px}.fxart{display:none}`),

    I('emailinline', '邮件内联样式', 'Inlined email CSS', '<style> 会被吃掉', 'The style block gets stripped',
      '关键样式全部内联到 style 属性，只把媒体查询留在 <style>；不能用外链 CSS、不能用 class 兜底。',
      'Inline every critical declaration and keep only media queries in a style block. No external CSS, no class-only fallbacks.',
      'card', `.fx{padding:14px}.fx>b{height:80px}.fx::after{content:'style="font:600 14px Arial;color:#23232f"';display:block;margin-top:10px;font:400 9.5px var(--fx-mono,monospace);color:#9b9d92;word-break:break-all}`),

    I('emaildark', '邮件暗色模式', 'Email dark mode', '客户端会自己反色，反得很难看', 'Clients invert it for you, badly',
      '用 prefers-color-scheme + meta color-scheme，把 PNG 换成两版；白底 logo 要加浅色描边防止消失。',
      'Declare prefers-color-scheme and meta color-scheme, ship two PNGs, and outline a white logo so it does not vanish.',
      'cards', `.fx:nth-child(1){background:#fff;color:#23232f}.fx:nth-child(2){background:#1a1d21;border-color:#2b3038;color:#eef1f4}.fx:nth-child(2)>b{background:#262b33}.fx:nth-child(3){background:#1a1d21;border-color:#2b3038;color:#3a3f47}.fx:nth-child(3)::after{content:'\u2717 \u88ab\u81ea\u52a8\u53cd\u8272';font:600 10px var(--fx-mono,monospace);color:#c04a63}`),

    I('widescreen', '超宽屏收束', 'Ultra-wide containment', '2560px 上不该有 200 字一行', 'No 200-character lines at 2560px',
      '内容容器给 max-width，多出的宽度用来放侧栏、留白或加大图；不要让正文无限拉长。',
      'Cap the content container and spend the extra width on a rail, whitespace or bigger imagery — never on longer lines.',
      'text', `.fx{white-space:normal;max-width:34ch;font-size:clamp(15px,1.6vw,19px);line-height:1.6;color:#4c4e46;text-wrap:pretty}`),

    I('maxmeasure', '最大行宽', 'Measure', '一行 45–75 个字符最好读', '45–75 characters reads best',
      '用 ch 单位设 max-width（中文约 30–40 字）；行长与行高要一起调，长行需要更大行高。',
      'Cap max-width in ch — about 30–40 Han characters. Line length and line height move together; longer lines need more leading.',
      'text', `.fx{white-space:normal;max-width:62ch;font-size:16px;line-height:1.65;color:#4c4e46;font-weight:400;letter-spacing:0}`),

    I('zoomreflow', '缩放回流', 'Zoom reflow', '放大到 400% 不能出现两轴滚动', 'No two-axis scrolling at 400%',
      '一切用相对单位，允许所有容器换行；固定宽度的表格与代码块要能横滑，但页面本身不行。',
      'Relative units throughout and wrapping everywhere. Fixed-width tables and code may scroll horizontally; the page may not.',
      'card', `.fxcard{width:min(280px,74%)}.fx{padding:12px}.fx>b{height:64px}.fx::after{content:'400% \u00b7 \u65e0\u6a2a\u5411\u6eda\u52a8';display:block;margin-top:9px;font:600 10px var(--fx-mono,monospace);color:#4d8ba6}`),

    I('stickyresponsive', '小屏吸顶预算', 'Sticky budget on small screens', '吸顶条吃掉的是可读高度', 'Every sticky bar costs reading height',
      '移动端吸顶总高不超过视口 12%；多条吸顶要合并，或滚动时收起只留一行。',
      'Keep total sticky height under about 12% of the viewport. Merge multiple bars, or collapse to one line on scroll.',
      'scroll', `@keyframes fxk{0%,40%{height:56px}60%,100%{height:32px}}.fxscroll::before{content:'\u5438\u9876';position:sticky;top:0;display:flex;align-items:center;padding:0 14px;border-radius:8px;background:#23232f;color:#fff;font:600 11px var(--fx-sans,system-ui);flex:none;animation:fxk 3.6s ${E} infinite}`),

    I('modaltosheet', '模态转底部抽屉', 'Modal to bottom sheet', '小屏的对话框应该从下面上来', 'On small screens dialogs come from below',
      '桌面居中模态，移动端全宽底部抽屉 + 拖拽把手 + 多段吸附高度；顶部关闭按钮要在拇指区之外。',
      'A centred modal on desktop, a full-width bottom sheet with a grab handle and snap heights on mobile. Keep close out of the thumb zone.',
      'panel', `@keyframes fxk{0%{transform:translateY(100%)}100%{transform:translateY(0)}}.fxstack{width:min(300px,80%);height:min(300px,44vh)}.fxa{background:rgba(45,72,98,.34)}.fxa::after{content:''}.fxb{inset:44% 0 0;border-radius:18px 18px 0 0;background:#fff;color:#23232f;animation:fxk .55s ${E} infinite alternate-reverse}.fxb::before{content:'';position:absolute;left:50%;top:9px;transform:translateX(-50%);width:38px;height:4px;border-radius:2px;background:#d9dbe0}`),

    I('progressive', '小屏渐进披露', 'Progressive disclosure', '窄屏先给主线，细节收起来', 'Narrow screens get the spine, details fold',
      '把次要字段、筛选、元信息折进手风琴或"更多"；不要在小屏里靠横滑藏功能。',
      'Fold secondary fields, filters and metadata into an accordion or a More affordance. Do not hide function behind a horizontal swipe.',
      'list', `@keyframes fxk{0%,45%{max-height:52px}55%,100%{max-height:150px}}.fxcol{width:min(360px,86%)}.fx:nth-child(2){overflow:hidden;align-items:flex-start;flex-direction:column;padding:14px;height:auto;animation:fxk 4s ${E} infinite}.fx:nth-child(n+4){display:none}`),

    I('contentpriority', '内容优先级重排', 'Content reprioritising', '小屏的第一屏该放什么', 'What earns the first screen when narrow',
      '按任务优先级重排而不是等比缩小：价格与主按钮上移，导航与推荐下沉；用 order 但保住 DOM 阅读顺序。',
      'Reorder by task priority rather than scaling down — price and primary action rise, nav and recommendations sink. Keep DOM order sane.',
      'cards', `.fxrow{flex-direction:column;max-width:260px;gap:10px}.fx{width:100%;height:auto;padding:12px;flex-direction:row;align-items:center;justify-content:space-between}.fx>b{display:none}.fx:nth-child(1)::after{content:'\u00a5 128 \u00b7 \u7acb\u5373\u8d2d\u4e70';font-weight:700;color:#23232f}.fx:nth-child(2)::after{content:'\u89c4\u683c\u4e0e\u53c2\u6570';color:#65675f}.fx:nth-child(3)::after{content:'\u76f8\u5173\u63a8\u8350';color:#9b9d92}`),

    I('overflowhint', '溢出可滚提示', 'Overflow affordance', '看不出来能滑，就等于不能滑', 'If it does not look scrollable, it is not',
      '两端渐隐遮罩 + 露出下一项的边 + 到边时收掉遮罩；纯靠"用户会试试"是不成立的。',
      'Edge fade masks, a peeking next item, and masks that retract at the ends. Hoping people will try is not a design.',
      'cards', `.fxrow{max-width:290px;overflow-x:auto;mask:linear-gradient(90deg,transparent,#000 6%,#000 88%,transparent);padding-bottom:6px}.fx{flex:none}`),

    I('mediaquerylevel4', '能力查询而非设备查询', 'Capability queries', '问它能做什么，别猜它是什么', 'Ask what it can do, not what it is',
      'hover / pointer / prefers-* / dynamic-range / scripting 都是能力查询；设备判断（UA sniffing）年年失效。',
      'hover, pointer, prefers-*, dynamic-range and scripting are capability queries. UA sniffing breaks every year.',
      'pill', `.fxpill{max-width:340px;gap:8px}.fx{font:500 11px var(--fx-mono,monospace);padding:7px 11px}.fx:nth-child(1)::after{content:':hover'}.fx:nth-child(2)::after{content:':pointer'}.fx:nth-child(3)::after{content:':dynamic-range'}.fx:nth-child(4)::after{content:':scripting'}.fx:nth-child(5){opacity:.35;text-decoration:line-through}.fx:nth-child(5)::after{content:'UA sniff'}`)
  ]
};
