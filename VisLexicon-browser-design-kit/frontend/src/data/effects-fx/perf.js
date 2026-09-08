// 性能：用户感觉到的快，和指标上的快，是两件要一起做的事
const E = 'cubic-bezier(.22,1,.36,1)';
const I = (id, zh, en, dz, de, pz, pe, demo, css) => ({ id, zh, en, dz, de, pz, pe, demo, css });

export default {
  id: 'perf', zh: '性能与感知速度', en: 'Performance & perceived speed',
  dz: 'LCP、CLS、INP 这些能测的，和"感觉上快"这件不能测的，得一起做',
  de: 'The measurable side — LCP, CLS, INP — and the unmeasurable side of feeling fast, done together',
  items: [
    I('lcp', '最大内容渲染 LCP', 'Largest Contentful Paint', '首屏那块最大的东西多久出来', 'How long the biggest thing takes',
      '2.5s 以内。首屏主图不要懒加载、不要等 JS，给 fetchpriority="high" 与预载。',
      'Under 2.5s. Never lazy-load or JS-gate the hero image; give it fetchpriority="high" and a preload.',
      'media', `@keyframes fxk{0%{opacity:0;filter:blur(0)}100%{opacity:1}}.fx{animation:fxk 1.2s ${E} infinite alternate}.fx::after{content:'LCP 1.8s';position:absolute;left:10px;bottom:10px;padding:3px 7px;border-radius:4px;background:rgba(20,26,34,.8);color:#fff;font:600 10px var(--fx-mono,monospace)}`),

    I('cls', '布局位移 CLS', 'Cumulative Layout Shift', '正要点，内容跳走了', 'It jumps just as you reach for it',
      '0.1 以内。图片、广告、嵌入、字体、异步插入的横幅都要预留尺寸；不要在已有内容上方插东西。',
      'Under 0.1. Reserve space for images, ads, embeds, fonts and late banners — and never insert above existing content.',
      'list', `@keyframes fxk{0%,42%{transform:translateY(0)}50%,100%{transform:translateY(58px)}}.fxcol{position:relative;width:min(400px,88%)}.fxcol::before{content:'\u540e\u63d2\u5165\u7684\u6a2a\u5e45';position:absolute;left:0;right:0;top:0;height:48px;border-radius:10px;background:#f6e2e6;display:flex;align-items:center;padding:0 14px;font:600 11px var(--fx-sans,system-ui);color:#c04a63;opacity:0;animation:fxk 3.4s steps(1,end) infinite}.fx{animation:fxk 3.4s ${E} infinite}`),

    I('inp', '交互响应 INP', 'Interaction to Next Paint', '点下去到画面变，多久', 'From tap to the next frame',
      '200ms 以内。长任务切片（scheduler.yield / setTimeout），先画反馈再算数据。',
      'Under 200ms. Slice long tasks with scheduler.yield, and paint the feedback before computing the data.',
      'pill', `@keyframes fxk{0%,90%{transform:none;background:#fff}94%{transform:translateY(1px);background:#eceee6}100%{transform:none;background:#fff}}.fx:nth-child(2){animation:fxk 2.4s steps(1,end) infinite}`),

    I('ttfb', '首字节 TTFB', 'Time to First Byte', '服务器开口说话的时间', 'How long before the server speaks',
      '0.8s 以内。CDN 边缘缓存、避免串行数据库调用、HTML 先流出来再补数据。',
      'Under 0.8s. Cache at the edge, avoid serial database calls, and stream the HTML before the data.',
      'loader', `@keyframes fxk{0%{width:6%}100%{width:100%}}.fxload{width:min(340px,74%)}.fx{width:100%;height:6px;border-radius:3px;background:#eceef1;position:relative;overflow:hidden}.fx::after{content:'';position:absolute;inset:0 auto 0 0;background:#4d8ba6;animation:fxk 2.2s ${E} infinite}.fx:nth-child(n+2){display:none}`),

    I('skeletonmatch', '骨架同尺寸', 'Matching skeletons', '骨架和真内容不一样大就白做了', 'A mismatched skeleton causes the very jump it prevents',
      '骨架块的宽高、行数、间距要和真实内容一致；宁可少画几块，也不要尺寸对不上。',
      'Match the skeleton to the real width, height, line count and gaps. Fewer blocks beat wrong sizes.',
      'list', `.fx>i{background:#eceef1}.fx>u{background:#eceef1;width:64%}.fx{border-color:#eceee6}`),

    I('aspectratio', '图片占位比例', 'Aspect-ratio placeholder', '图还没来，位置先占住', 'Hold the space before the image arrives',
      'width/height 属性 + CSS aspect-ratio，容器高度不依赖图片本身；这是消除 CLS 最省事的一招。',
      'Set width/height attributes plus CSS aspect-ratio so the box does not depend on the image. The cheapest CLS fix there is.',
      'cards', `.fx>b{aspect-ratio:4/3;height:auto;background:repeating-linear-gradient(45deg,#eef1f4 0 8px,#e6ebf0 8px 16px)}`),

    I('fontdisplay', '字体加载策略', 'font-display', 'swap 会闪，optional 会不换', 'swap flashes, optional may never swap',
      '正文用 swap 保可读，品牌大标题可用 optional 避免跳字；配 size-adjust 让回退字体度量接近。',
      'swap keeps body text readable; optional avoids a headline reflow. Use size-adjust so the fallback metrics match.',
      'text', `@keyframes fxk{0%,45%{font-family:Georgia,serif;letter-spacing:0}55%,100%{font-family:var(--fx-sans,system-ui);letter-spacing:-.03em}}.fx{animation:fxk 3.4s steps(1,end) infinite;font-size:clamp(34px,6vw,62px)}`),

    I('foutfoit', 'FOUT 与 FOIT', 'FOUT vs FOIT', '先看到回退字，还是先看到空白', 'Fallback text first, or blank first',
      'FOIT（空白）比 FOUT（换字）更伤感知速度；默认选 FOUT，并把回退字体调到相近字宽。',
      'A blank flash hurts perceived speed more than a swap. Default to FOUT and tune the fallback width.',
      'text', `@keyframes fxk{0%,30%{opacity:0}40%,100%{opacity:1}}.fx{animation:fxk 2.6s steps(1,end) infinite;font-size:clamp(30px,5.4vw,54px)}`),

    I('fontsubset', '字体子集化', 'Font subsetting', '中文字体全量是几 MB', 'A full CJK font is megabytes',
      '按 unicode-range 分片，中文用动态子集或按首屏字符裁；一个字重能省下三个字重的体积。',
      'Split by unicode-range, and subset CJK dynamically or to the above-the-fold glyphs. One weight saves the cost of three.',
      'num', `.fx{font-size:clamp(38px,7vw,72px);color:#3f6f92}.fxnum::after{content:'\u5b57\u4f53 2.1 MB \u2192 46 KB';font:600 12px var(--fx-mono,monospace);color:#9b9d92}`),

    I('preload', '关键资源预载', 'Preload critical assets', '别等浏览器自己发现', 'Do not wait for discovery',
      '首屏字体与 LCP 图用 <link rel=preload>；预载超过 2–3 个就会互相抢带宽，反而更慢。',
      'Preload the above-the-fold font and the LCP image. More than two or three and they fight for bandwidth.',
      'loader', `.fxload{flex-direction:column;gap:8px;align-items:stretch;width:min(320px,74%)}.fx{width:auto;height:20px;border-radius:5px;background:#eceef1;position:relative}.fx:nth-child(1){background:#4d8ba6}.fx:nth-child(2){background:#7cb6c8}.fx:nth-child(3){background:#eceef1}`),

    I('preconnect', '预连接', 'Preconnect', '握手也要时间', 'The handshake costs too',
      '对确定会用到的第三方域名 preconnect（DNS + TCP + TLS 一次做完）；不确定的用 dns-prefetch。',
      'Preconnect to third-party origins you will certainly use; dns-prefetch the ones you might.',
      'dots', `@keyframes fxk{0%,100%{opacity:.25}50%{opacity:1}}.fxdots{height:min(160px,30vh)}.fx{width:10px;height:10px;animation:fxk 1.6s ease-in-out infinite;animation-delay:calc(var(--i)*70ms)}`),

    I('lazyimg', '图片懒加载', 'Lazy images', '首屏之外的图晚点再说', 'Off-screen images can wait',
      'loading="lazy" 只给首屏以下的图；首屏图加了反而拖慢 LCP。配合固定比例占位。',
      'loading="lazy" belongs below the fold only — on the hero it slows LCP. Pair it with a reserved ratio.',
      'grid', `@keyframes fxk{0%{opacity:0}100%{opacity:1}}.fx{background:linear-gradient(140deg,#e9eef2,#dde6ec);border:0;animation:fxk .8s ease both}.fx:nth-child(4){animation-delay:.2s}.fx:nth-child(7){animation-delay:.4s}`),

    I('priorityhints', '优先级提示', 'fetchpriority', '告诉浏览器谁更重要', 'Tell the browser what matters',
      'LCP 图 fetchpriority="high"，轮播第二张往后 low；脚本用 defer/async 分层。',
      'fetchpriority="high" on the LCP image, low on later carousel frames, and layer scripts with defer/async.',
      'chart', `.fx{background:#eceef1}.fx:nth-child(1){background:#3f6f92;height:96%}.fx:nth-child(2){background:#7cb6c8;height:62%}`),

    I('srcset', '响应式图片', 'srcset & sizes', '手机不该下载 2000px 的图', 'A phone should not fetch a 2000px image',
      'srcset 列宽度候选，sizes 描述真实渲染宽度；sizes 写错等于没做。',
      'srcset lists the widths, sizes describes the real rendered width — a wrong sizes value undoes the whole thing.',
      'media', `.fx::after{content:'srcset 480 / 960 / 1440w';position:absolute;left:10px;bottom:10px;padding:3px 7px;border-radius:4px;background:rgba(20,26,34,.8);color:#fff;font:600 10px var(--fx-mono,monospace)}`),

    I('modernformat', '现代图片格式', 'AVIF & WebP', '同样画质，体积少一半', 'Same quality, half the bytes',
      '<picture> 里 AVIF → WebP → JPEG 依次回退；照片走 AVIF，带透明与图形走 WebP/PNG。',
      'Inside picture, fall back AVIF → WebP → JPEG. Photos favour AVIF; transparency and flat art favour WebP or PNG.',
      'cards', `.fx{justify-content:center;text-align:center;font:600 12px var(--fx-mono,monospace)}.fx>b{display:none}.fx:nth-child(1)::after{content:'AVIF 38 KB'}.fx:nth-child(2)::after{content:'WebP 61 KB'}.fx:nth-child(3)::after{content:'JPEG 148 KB'}`),

    I('blurup', '低清占位放大', 'Blur-up placeholder', '先给一张糊的，再换清的', 'A blurry one first, then the sharp one',
      '20–40px 宽的缩略图内联为 data URI，放大模糊后作背景，真图加载完淡入替换。',
      'Inline a 20–40px thumbnail as a data URI, scale it up blurred, then cross-fade the real image in.',
      'media', `@keyframes fxk{0%,40%{filter:blur(12px) saturate(1.2);transform:scale(1.04)}70%,100%{filter:none;transform:none}}.fx{animation:fxk 3.6s ${E} infinite}`),

    I('lqip', '主色占位', 'Dominant-colour placeholder', '一块颜色就够了', 'One colour is enough',
      '提取图片平均色作背景，比灰块更不刺眼、也不像坏图；成本几乎为零。',
      'Use the image average colour as the ground — gentler than grey and it never looks broken. Nearly free.',
      'grid', `@keyframes fxk{0%,50%{opacity:0}100%{opacity:1}}.fx{border:0;background:#c6d3da;position:relative;overflow:hidden}.fx::after{content:'';position:absolute;inset:0;background:linear-gradient(140deg,#8fb6c8,#5f8298);animation:fxk 2.8s ease infinite}.fx:nth-child(3n){background:#d9cfc4}.fx:nth-child(3n)::after{background:linear-gradient(140deg,#c9ae90,#9a7f63)}`),

    I('contentvisibility', 'content-visibility', 'content-visibility', '看不见的区块干脆不排版', 'Skip layout for what is off-screen',
      'content-visibility:auto + contain-intrinsic-size 给长页面省下大量排版成本；尺寸估错会导致滚动条抖。',
      'content-visibility:auto with contain-intrinsic-size saves layout on long pages. A wrong estimate makes the scrollbar jitter.',
      'scroll', `.fx{content-visibility:auto;contain-intrinsic-size:auto 140px}.fx::after{content:'content-visibility:auto';font:600 10px var(--fx-mono,monospace)}`),

    I('virtualize', '虚拟列表', 'Virtualised list', '一万行只渲染看得见的二十行', 'Ten thousand rows, twenty rendered',
      '按滚动位置只渲染窗口内的项 + 上下缓冲；行高不定时要测量缓存，否则滚动条会跳。',
      'Render only the window plus a buffer. With variable row heights, measure and cache or the scrollbar will jump.',
      'scroll', `.fxscroll{gap:8px}.fx{height:52px}.fx:nth-child(1)::after{content:'\u2191 \u56de\u6536'}.fx:nth-child(2)::after,.fx:nth-child(3)::after,.fx:nth-child(4)::after{content:'\u6e32\u67d3\u4e2d'}.fx:nth-child(5)::after,.fx:nth-child(6)::after{content:'\u2193 \u672a\u6e32\u67d3'}`),

    I('windowing', '分页还是无限滚动', 'Pagination vs infinite', '能不能回到"第 7 页"', 'Can you get back to page 7?',
      '需要定位、分享、对比的内容用分页；消费型信息流用无限滚动，但要保留位置与"加载更多"兜底。',
      'Paginate anything you must cite, share or compare. Infinite scroll suits feeds — keep scroll restoration and a load-more fallback.',
      'nav', `.fx{padding:8px 12px;font-size:13px}.fx:nth-child(1)::after{content:''}.fxnav::after{content:'1 2 3 \u2026 12';margin-left:8px;align-self:center;font:600 12px var(--fx-mono,monospace);color:#65675f}`),

    I('willchange', 'will-change 的代价', 'will-change costs', '提前提层，但别一直提着', 'Promote early, but do not hold it',
      '只在交互即将开始时加，结束后移除；常驻 will-change 会一直占显存并让文字变糊。',
      'Add it just before the interaction and remove it after. A permanent will-change eats VRAM and softens text.',
      'box', `@keyframes fxk{0%,100%{transform:none}50%{transform:translateY(-18px)}}.fx{will-change:transform;animation:fxk 2.6s ${E} infinite}`),

    I('compositeonly', '只动合成属性', 'Composite-only animation', 'transform / opacity / filter 之外都会掉帧', 'Anything else drops frames',
      'width / height / top / margin / box-shadow 会触发排版或重绘；改用 transform 与 scale 等价实现。',
      'width, height, top, margin and box-shadow trigger layout or paint. Express the same motion with transform.',
      'cards', `@keyframes fxa{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.12)}}@keyframes fxb{0%,100%{width:150px}50%{width:168px}}.fx:nth-child(1){transform-origin:left;animation:fxa 2.4s ${E} infinite}.fx:nth-child(1)::after{content:'transform \u2713';font:600 11px var(--fx-mono,monospace);color:#3f6f92}.fx:nth-child(2){animation:fxb 2.4s ${E} infinite}.fx:nth-child(2)::after{content:'width \u2717';font:600 11px var(--fx-mono,monospace);color:#c04a63}.fx:nth-child(3){opacity:.4}`),

    I('layerexplosion', '图层爆炸', 'Layer explosion', '每个元素都提层就等于没提', 'Promote everything and you promote nothing',
      '合成层有内存与合成成本；用 DevTools 图层面板数一遍，几十层以上就要合并。',
      'Composited layers cost memory and compositing time. Count them in the layers panel and merge past a few dozen.',
      'grid', `.fx{transform:translateZ(0);border-color:#dbe4ea}.fx::after{content:'layer';display:flex;align-items:center;justify-content:center;height:100%;font:600 9px var(--fx-mono,monospace);color:#a9bcc7}`),

    I('reflowbatch', '读写分离', 'Batch reads and writes', '交替读写会逼浏览器反复排版', 'Interleaving forces layout again and again',
      '先把所有 offsetWidth 之类读完，再统一写样式；或用 requestAnimationFrame 分成读帧与写帧。',
      'Read every offsetWidth first, then write. Or split reads and writes across animation frames.',
      'list', `@keyframes fxk{0%,49%{background:#eef4f8}50%,100%{background:#fcfcfb}}.fxcol{width:min(400px,88%)}.fx{animation:fxk 1.6s steps(1,end) infinite;animation-delay:calc(var(--i)*120ms)}`),

    I('rafbudget', '每帧预算', 'Frame budget', '60fps 只有 16.7ms', '16.7ms per frame at 60fps',
      '实际留给自己的约 8–10ms；超了就切片、降频（每 2–3 帧算一次）或挪到 Worker。',
      'You get about 8–10ms of it. Past that, slice the work, run every second or third frame, or move it to a Worker.',
      'chart', `@keyframes fxk{0%{transform:scaleY(.2)}100%{transform:scaleY(1)}}.fx{transform-origin:bottom;animation:fxk 1.4s ${E} infinite alternate;animation-delay:calc(var(--i)*80ms)}`),

    I('debouncethrottle', '防抖与节流', 'Debounce vs throttle', '一个等你停下，一个按拍子来', 'One waits for a pause, one keeps a beat',
      '搜索输入用防抖（150–300ms），滚动与 resize 用节流或 rAF；两者混用是常见错误。',
      'Debounce search input at 150–300ms; throttle scroll and resize, or drive them with rAF. Mixing them up is the usual bug.',
      'field', `@keyframes fxk{0%,60%{opacity:0}75%,100%{opacity:1}}.fxfield{position:relative}.fx{color:#23232f}.fxfield::after{content:'debounce 240ms \u2192 \u53d1\u8bf7\u6c42';position:absolute;left:0;top:56px;font:500 11px var(--fx-mono,monospace);color:#4d8ba6;animation:fxk 2.4s steps(1,end) infinite}`),

    I('passivelistener', '被动监听', 'Passive listeners', '滚动监听别挡住滚动', 'Do not block the scroll you listen to',
      'touchstart / wheel / scroll 加 {passive:true}，浏览器就不必等你决定是否 preventDefault。',
      'Add passive:true to touchstart, wheel and scroll so the browser need not wait on preventDefault.',
      'scroll', `.fxscroll::after{content:'{passive:true}';position:sticky;bottom:0;padding:6px 10px;border-radius:6px;background:#23232f;color:#fff;font:600 10px var(--fx-mono,monospace);align-self:flex-start}`),

    I('iointersection', '交给 IntersectionObserver', 'IntersectionObserver', '别用 scroll 事件算可见性', 'Never compute visibility in a scroll handler',
      '可见性、懒加载、曝光埋点、动画触发全部交给 IO；rootMargin 用来提前触发。',
      'Visibility, lazy loading, impression tracking and animation triggers all belong to IO. rootMargin fires them early.',
      'scroll', `@keyframes fxk{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:none}}.fx{animation:fxk .7s ${E} both;animation-delay:calc(var(--i)*140ms)}`),

    I('cssanimvsjs', 'CSS 动画还是 JS 动画', 'CSS vs JS animation', '能写成 CSS 的就别写 JS', 'If CSS can express it, CSS should',
      '声明式过渡与循环用 CSS（可跑在合成线程）；需要打断、跟手、物理反馈的用 WAAPI 或动画库。',
      'Declarative transitions and loops go to CSS, which can run off-thread. Interruptible, gesture-following, physical motion needs WAAPI or a library.',
      'box', `@keyframes fxk{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}.fx{animation:fxk 3s ${E} infinite}`),

    I('offthread', '合成线程动画', 'Off-main-thread animation', '主线程卡了动画还在动', 'The animation survives a busy main thread',
      '只用 transform / opacity / filter 的 CSS 动画可交给合成线程；一旦读取布局或改颜色就掉回主线程。',
      'A CSS animation limited to transform, opacity and filter can run on the compositor. Touch layout or colour and it falls back.',
      'shape', `@keyframes fxk{to{transform:rotate3d(1,1,0,1turn)}}.fx{animation:fxk 8s linear infinite}`),

    I('transformorigin', '用 transform 代替布局动画', 'Transform instead of layout', '展开高度是最贵的动画', 'Animating height is the expensive one',
      'height:auto 无法过渡；用 grid-template-rows 0fr→1fr、scaleY + 反向补偿，或 max-height 上限法。',
      'height:auto cannot transition. Use grid-template-rows 0fr→1fr, a compensated scaleY, or a max-height cap.',
      'panel', `@keyframes fxk{0%,100%{transform:scaleY(.14)}50%{transform:scaleY(1)}}.fxa{background:#eceee6}.fxb{transform-origin:top;animation:fxk 3.2s ${E} infinite}`),

    I('imgdecode', '异步解码', 'Async decoding', '解码也会卡主线程', 'Decoding blocks the main thread too',
      '大图加 decoding="async"，或用 img.decode() 在换图前解好；轮播切换前预解码下一张。',
      'Add decoding="async", or await img.decode() before swapping. Pre-decode the next carousel frame.',
      'media', `@keyframes fxk{0%,50%{filter:blur(6px)}80%,100%{filter:none}}.fx{animation:fxk 3s ${E} infinite}`),

    I('spriteicons', '图标合并', 'Icon sprite', '几十个请求变一个', 'Dozens of requests become one',
      'SVG symbol sprite 或子集化图标字体；单色图标优先内联 SVG，避免额外往返。',
      'An SVG symbol sprite or a subset icon font. Inline single-colour SVG to avoid a round trip entirely.',
      'loader', `.fxload{gap:14px}.fx{width:22px;height:22px;border-radius:6px;background:#3f6f92}.fx:nth-child(2){background:#4d8ba6}.fx:nth-child(3){background:#7cb6c8}`),

    I('criticalcss', '首屏 CSS 内联', 'Critical CSS', '别让样式表挡住第一帧', 'Do not let a stylesheet block frame one',
      '首屏用到的规则内联进 <head>，其余异步加载；超过 14KB 就得重新审视首屏范围。',
      'Inline the above-the-fold rules and load the rest asynchronously. Past 14KB, rethink what "above the fold" means.',
      'page', `.fxpage{width:min(520px,94%)}.fxart{background:#eceef1}.fxsub{color:#9b9d92}`),

    I('codesplit', '按路由分包', 'Route-level code splitting', '首页不该下载后台的代码', 'The homepage should not ship the admin bundle',
      '按路由与交互边界动态 import；把重型依赖（图表、编辑器、3D）推到用它的那一屏。',
      'Dynamic-import per route and per interaction boundary, and push heavy dependencies onto the screen that uses them.',
      'grid', `@keyframes fxk{0%{opacity:0;transform:scale(.9)}100%{opacity:1;transform:none}}.fx{animation:fxk .6s ${E} both;animation-delay:calc(var(--i)*110ms)}`),

    I('treeshake', '摇树与副作用', 'Tree shaking', '导入一个函数拖进整个库', 'One import, the whole library',
      '用具名导入与 ESM 版本，package.json 标 sideEffects:false；moment、lodash 全量导入是经典陷阱。',
      'Named imports, ESM builds, sideEffects:false. Whole-library imports of moment or lodash are the classic trap.',
      'chart', `.fx{background:#eceef1}.fx:nth-child(1){background:#3f6f92;height:96%}.fx:nth-child(2){background:#7cb6c8;height:22%}`),

    I('hydration', '水合与孤岛', 'Hydration & islands', '静态内容不需要被"激活"', 'Static content needs no activation',
      '只让交互组件水合（岛屿架构），其余保持纯 HTML；全页水合是 INP 变差的头号原因。',
      'Hydrate only the interactive islands and leave the rest as HTML. Whole-page hydration is the top cause of bad INP.',
      'page', `@keyframes fxk{0%,100%{box-shadow:0 0 0 0 rgba(63,111,146,0)}50%{box-shadow:0 0 0 2px #3f6f92}}.fxpage{width:min(520px,94%)}.fxcta{animation:fxk 2.4s ease-in-out infinite}.fxart{background:#eceef1}`),

    I('streamssr', '流式渲染', 'Streaming SSR', '有多少先发多少', 'Send what you have',
      '外壳先流出来，慢数据用 Suspense 占位后补；用户看到骨架的时间点大幅提前。',
      'Stream the shell first and fill slow data behind a Suspense boundary. The skeleton appears far sooner.',
      'list', `@keyframes fxk{0%{opacity:0}100%{opacity:1}}.fxcol{width:min(400px,88%)}.fx{animation:fxk .5s ease both;animation-delay:calc(var(--i)*260ms)}`),

    I('prefetchhover', '悬停预取', 'Prefetch on intent', '在他点之前就开始下载', 'Start fetching before the click',
      '悬停 / 触摸开始 / 进入视口时预取下一页数据；用 speculationrules 或框架的 prefetch，注意别把流量打爆。',
      'Prefetch on hover, touchstart or viewport entry via speculation rules or your framework — but watch the bandwidth.',
      'nav', `@keyframes fxk{0%,60%{color:#5a5c67}70%,100%{color:#3f6f92}}.fx:nth-child(3){animation:fxk 2.6s steps(1,end) infinite}.fx:nth-child(3)::after{content:'\u00b7 prefetching';font:500 10px var(--fx-mono,monospace)}`),

    I('optimisticui', '乐观更新', 'Optimistic UI', '先当成功了再说', 'Assume it worked',
      '本地立刻应用变更并给可撤销入口，失败再回滚并说明；点赞、勾选、重命名最适合。',
      'Apply the change locally with an undo path, and roll back with an explanation on failure. Ideal for likes, checkboxes, renames.',
      'sw', `@keyframes fxk{0%,45%{background:#d9dbe0}50%,100%{background:#4d8ba6}}@keyframes fxb{0%,45%{left:3px}50%,100%{left:27px}}.fx:nth-child(1){animation:fxk 2.4s steps(1,end) infinite}.fx:nth-child(1)>b{animation:fxb 2.4s steps(1,end) infinite}`),

    I('skeletonvsspinner', '骨架还是转圈', 'Skeleton or spinner', '按等待时长选', 'Choose by how long the wait is',
      '<300ms 什么都不显示；300ms–1s 用转圈；>1s 且结构已知用骨架；>3s 要给进度或分步反馈。',
      'Under 300ms show nothing; to 1s a spinner; past 1s with known structure a skeleton; past 3s show progress or steps.',
      'loader', `@keyframes fxk{to{transform:rotate(1turn)}}.fxload{gap:22px}.fx{width:26px;height:26px;border-radius:50%;background:none;border:3px solid #e4e5e0;border-top-color:#23232f;animation:fxk .9s linear infinite}.fx:nth-child(2){border:0;border-radius:6px;width:60px;height:14px;background:#eceef1;animation:none}.fx:nth-child(3){border:0;width:44px;height:14px;border-radius:6px;background:#eceef1;animation:none}`),

    I('perceivedspeed', '感知速度', 'Perceived speed', '同样 2 秒，可以像 1 秒也可以像 5 秒', 'The same 2s can feel like 1 or 5',
      '立刻给反馈、先渲染框架、把等待填上有用信息、结束时别再多一次跳动；等待中的空白最长。',
      'Acknowledge instantly, render the frame first, fill the wait with something useful, and do not add a final jump. Blank waits feel longest.',
      'card', `@keyframes fxk{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:none}}.fx{animation:fxk .5s ${E} both}.fx>b{animation:fxk .5s ${E} both;animation-delay:.18s}.fx>u{animation:fxk .5s ${E} both;animation-delay:.3s}.fx>i{animation:fxk .5s ${E} both;animation-delay:.4s}`),

    I('progressillusion', '进度错觉', 'Progress illusion', '前快后慢比匀速更"快"', 'Fast then slow feels faster than linear',
      '进度条前段走快、后段放缓；条纹向前流动会让同样时长感觉更短。绝不倒退。',
      'Race the early progress and ease the tail. Forward-moving stripes make the same duration feel shorter. Never go backwards.',
      'loader', `@keyframes fxk{0%{width:0}30%{width:62%}70%{width:84%}100%{width:100%}}@keyframes fxs{to{background-position:22px 0}}.fxload{width:min(340px,74%)}.fx{width:100%;height:10px;border-radius:5px;background:#eceef1;position:relative;overflow:hidden}.fx::after{content:'';position:absolute;inset:0 auto 0 0;background:repeating-linear-gradient(115deg,#4d8ba6 0 8px,#5f9cb0 8px 16px);animation:fxk 3.4s ${E} infinite,fxs .7s linear infinite}.fx:nth-child(n+2){display:none}`),

    I('jankmeasure', '卡顿测量', 'Measuring jank', '别靠"感觉有点卡"', 'Never ship on "feels laggy"',
      '用 Long Animation Frames、performance.measure 与真实设备节流 4× CPU 复现；低端安卓才是基准线。',
      'Use Long Animation Frames, performance.measure and a 4× CPU throttle on a real device. A low-end Android is the baseline.',
      'chart', `.fx{background:#4d8ba6}.fx:nth-child(4){background:#c04a63;height:100%}.fx:nth-child(4)::after{content:'214ms';position:absolute;margin-top:-16px;font:600 9px var(--fx-mono,monospace);color:#c04a63}.fxchart{position:relative}`)
  ]
};
