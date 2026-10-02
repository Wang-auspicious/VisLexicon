const P = (k, zh, en, min, max, step, def, unit) => ({ k, zh, en, min, max, step, def, unit: unit || '' });
const E = 'cubic-bezier(.22,1,.36,1)';
// 大部分条目使用 CSS 滚动驱动动画（animation-timeline），在画布里上下滚动即可看到效果

export default {
  id: 'scroll', zh: '滚动驱动', en: 'Scroll-driven',
  dz: '效果跟着滚动条走（请在画布里滚动）', de: 'Effects tied to the scrollbar — scroll inside the stage',
  items: [
    { id: 'revealview', zh: '进入视口显现', en: 'Reveal on enter', dz: '滚到才淡入上浮，最常用的一种', de: 'Blocks fade up as they scroll into view',
      pz: '用 IntersectionObserver 加类，或 CSS animation-timeline:view() 做进入动画。', pe: 'IntersectionObserver toggling a class, or CSS animation-timeline:view().',
      demo: 'scroll', css: `@keyframes fxk{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}.fx{animation:fxk linear both;animation-timeline:view();animation-range:entry 0% entry 90%}` },

    { id: 'revealonce', zh: '只播一次', en: 'Reveal once', dz: '出现过就不再重播，避免晕眩', de: 'Plays once and stays — no re-triggering',
      pz: 'IntersectionObserver 触发后 unobserve，状态写进 dataset。', pe: 'Unobserve after the first intersection and record it on the dataset.',
      demo: 'scroll', css: `@keyframes fxk{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}.fx{animation:fxk linear both;animation-timeline:view();animation-range:entry 10% entry 80%}` },

    { id: 'parallax', zh: '视差分层', en: 'Parallax layers', dz: '背景比前景滚得慢', de: 'The background scrolls slower than the foreground',
      pz: '按滚动进度给不同层不同的 translateY 速率（0.2×~0.6×）。', pe: 'Give each layer a different translateY rate against scroll (0.2×–0.6×).',
      demo: 'scroll', css: `@keyframes fxk{from{background-position:50% 0%}to{background-position:50% 100%}}.fx{background-image:linear-gradient(#f0c9a8,#4d8ba6);background-size:100% 260%;animation:fxk linear both;animation-timeline:view()}` },

    { id: 'imgscale', zh: '滚动缩放图片', en: 'Scale on scroll', dz: '图片随滚动缓缓放大', de: 'The image slowly scales as you scroll',
      pz: '滚动进度映射到 scale(1→1.15)，容器 overflow:hidden。', pe: 'Map scroll progress to scale(1→1.15) inside an overflow-hidden frame.',
      demo: 'scroll', css: `@keyframes fxk{from{transform:scale(1)}to{transform:scale(1.22)}}.fx{overflow:hidden;background:#dfe1e6;animation:fxk linear both;animation-timeline:view()}` },

    { id: 'progress', zh: '阅读进度条', en: 'Reading progress bar', dz: '顶部一条随滚动增长的线', de: 'A top bar that grows with the scroll',
      pz: 'scaleX 绑定 scroll() 时间线，transform-origin:left。', pe: 'scaleX bound to scroll() timeline with transform-origin left.',
      demo: 'scroll', css: `@keyframes fxk{from{transform:scaleX(0)}to{transform:scaleX(1)}}.fxscroll{position:relative}.fxscroll::before{content:'';position:sticky;top:0;display:block;height:4px;background:#e8879c;transform-origin:left;border-radius:2px;z-index:2;animation:fxk linear both;animation-timeline:scroll(nearest)}` },

    { id: 'stickyshrink', zh: '吸顶收缩头部', en: 'Sticky header shrink', dz: '头部滚动时变矮变紧凑', de: 'The header compresses as you scroll',
      pz: 'position:sticky + 滚动进度驱动高度/字号，或滚过阈值加类。', pe: 'Sticky header plus scroll progress driving height/size, or a class past a threshold.',
      demo: 'scroll', css: `@keyframes fxk{from{height:90px;font-size:20px}to{height:44px;font-size:13px}}.fxscroll::before{content:'Header';position:sticky;top:0;display:flex;align-items:center;padding:0 16px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:#fff;border-radius:10px;z-index:2;font-weight:600;animation:fxk linear both;animation-timeline:scroll(nearest);animation-range:0 160px}` },

    { id: 'stackcards', zh: '堆叠卡片', en: 'Sticky stacking cards', dz: '卡片一张叠一张停住', de: 'Cards stack up and pin one over another',
      pz: '每张卡 position:sticky;top 递增，配合轻微 scale 做纵深。', pe: 'Each card sticky with an increasing top offset plus a small scale for depth.',
      demo: 'scroll', css: `.fx{position:sticky;top:20px;box-shadow:0 -6px 22px rgba(48,66,92,.08);background:#fcfcfb;border:1px solid #e4e5e0}` },

    { id: 'pinned', zh: '钉住区块', en: 'Pinned section', dz: '内容钉住不动，里面继续演变', de: 'The section pins while its contents keep changing',
      pz: 'GSAP ScrollTrigger 的 pin，或 sticky 容器 + 高度撑开。', pe: 'GSAP ScrollTrigger pin, or a sticky child inside a tall spacer.',
      demo: 'scroll', css: `@keyframes fxk{from{filter:grayscale(1)}to{filter:none}}.fx:first-child{position:sticky;top:16px;height:200px;background:#4d8ba6;color:#fff;animation:fxk linear both;animation-timeline:scroll(nearest);animation-range:0 300px}` },

    { id: 'hscroll', zh: '横向滚动区', en: 'Horizontal scroll section', dz: '纵向滚动带动横向移动', de: 'Vertical scrolling drives horizontal travel',
      pz: '钉住外层，把滚动进度映射为内层 translateX。', pe: 'Pin the wrapper and map scroll progress onto the inner translateX.',
      demo: 'scroll', css: `@keyframes fxk{from{transform:translateX(0)}to{transform:translateX(-120px)}}.fx{animation:fxk linear both;animation-timeline:scroll(nearest)}` },

    { id: 'snap', zh: '滚动吸附', en: 'Scroll snap', dz: '一屏一屏地停住', de: 'Each block snaps into place',
      pz: '容器 scroll-snap-type:y mandatory，子项 scroll-snap-align:center。', pe: 'scroll-snap-type:y mandatory on the scroller, scroll-snap-align on the items.',
      demo: 'scroll', css: `.fxscroll{scroll-snap-type:y mandatory}.fx{scroll-snap-align:center;height:220px}` },

    { id: 'textfade', zh: '逐段点亮文字', en: 'Text lights up by scroll', dz: '文字随滚动由灰变黑', de: 'Copy brightens from grey to black as it passes',
      pz: '按滚动进度改变 color / opacity，可逐词做。', pe: 'Drive color/opacity from scroll progress, optionally per word.',
      demo: 'scroll', css: `@keyframes fxk{from{color:#d3d5da}to{color:#23232f}}.fx{background:#fcfcfb;border:1px solid #eceef1;font-weight:700;font-size:20px;animation:fxk linear both;animation-timeline:view();animation-range:entry 20% cover 55%}` },

    { id: 'rotatescroll', zh: '滚动旋转', en: 'Rotate with scroll', dz: '物体随滚动持续旋转', de: 'An object rotates as long as you scroll',
      pz: 'rotate 绑定 scroll() 进度，适合装饰元素。', pe: 'Bind rotate to scroll() progress — good for decorative objects.',
      demo: 'scroll', css: `@keyframes fxk{to{transform:rotate(180deg)}}.fx{animation:fxk linear both;animation-timeline:scroll(nearest)}` },

    { id: 'counterview', zh: '进入视口计数', en: 'Count up in view', dz: '数字滚到视口才开始跳动', de: 'The number starts counting when it enters view',
      pz: 'IntersectionObserver 触发 requestAnimationFrame 计数，缓出。', pe: 'IntersectionObserver kicks off a rAF counter with an ease-out curve.',
      demo: 'scroll', css: `@keyframes fxk{from{opacity:0;transform:translateY(14px) scale(.9)}to{opacity:1;transform:none}}.fx{font:700 40px/1 var(--sv-font-mono,monospace);color:#23232f;background:#fcfcfb;border:1px solid #eceef1;animation:fxk linear both;animation-timeline:view();animation-range:entry 0% entry 70%}` },

    { id: 'hidenav', zh: '下滚隐藏导航', en: 'Hide nav on scroll down', dz: '往下滚导航收起，往上滚回来', de: 'Nav hides scrolling down, returns scrolling up',
      pz: '比较上一次 scrollY 判断方向，切换 translateY(-100%)。', pe: 'Compare the previous scrollY for direction and toggle translateY(-100%).',
      demo: 'scroll', css: `@keyframes fxk{from{transform:translateY(0)}to{transform:translateY(-120%)}}.fxscroll::before{content:'Nav';position:sticky;top:0;display:flex;align-items:center;justify-content:center;height:44px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:#fff;border-radius:10px;z-index:2;animation:fxk linear both;animation-timeline:scroll(nearest);animation-range:0 180px}` },

    { id: 'bgchange', zh: '分段换背景', en: 'Background per section', dz: '滚到不同区块背景色渐变', de: 'The page tint changes section by section',
      pz: '每个 section 记录目标色，进入视口时过渡 body 背景。', pe: 'Each section carries a target color; transition the page background on enter.',
      demo: 'scroll', css: `@keyframes fxk{0%{background:#f3f4f6}33%{background:#e8f0e2}66%{background:#f7e6ea}100%{background:#e6eff2}}.fxscroll{animation:fxk linear both;animation-timeline:scroll(nearest)}` },

    { id: 'timeline', zh: '时间线描画', en: 'Timeline draw', dz: '一条竖线随滚动画下来', de: 'A vertical line draws itself as you scroll',
      pz: 'scaleY 或 SVG stroke-dashoffset 绑定滚动进度。', pe: 'Bind scaleY or SVG stroke-dashoffset to scroll progress.',
      demo: 'scroll', css: `@keyframes fxk{from{transform:scaleY(0)}to{transform:scaleY(1)}}.fxscroll{position:relative}.fxscroll::after{content:'';position:absolute;left:12px;top:24px;bottom:24px;width:3px;background:#4d8ba6;border-radius:2px;transform-origin:top;animation:fxk linear both;animation-timeline:scroll(nearest)}.fx{margin-left:26px}` },

    { id: 'blurfocus', zh: '进入视口对焦', en: 'Blur to focus', dz: '离视口中心越远越模糊', de: 'The further from centre, the blurrier',
      pz: '把与视口中心的距离映射为 blur 值。', pe: 'Map distance from viewport centre onto the blur radius.',
      demo: 'scroll', css: `@keyframes fxk{0%{filter:blur(9px);opacity:.4}50%{filter:none;opacity:1}100%{filter:blur(9px);opacity:.4}}.fx{animation:fxk linear both;animation-timeline:view();animation-range:cover 0% cover 100%}` },

    { id: 'zoompin', zh: '钉住放大', en: 'Pinned zoom', dz: '钉住时画面推近', de: 'The frame pushes in while pinned',
      pz: '钉住区间内把进度映射到 scale，退出时解钉。', pe: 'Within the pinned range map progress to scale, then unpin.',
      demo: 'scroll', css: `@keyframes fxk{from{transform:scale(.7);border-radius:24px}to{transform:scale(1);border-radius:8px}}.fx{animation:fxk linear both;animation-timeline:view();animation-range:entry 0% cover 60%}` },

    { id: 'speedmarquee', zh: '滚动加速跑马灯', en: 'Scroll-boosted marquee', dz: '滚得越快横条跑得越快', de: 'The ticker speeds up with your scrolling',
      pz: '记录滚动速度，映射到 marquee 的播放速率或 skew。', pe: 'Track scroll velocity and map it to the ticker rate or a skew.',
      demo: 'scroll', css: `@keyframes fxk{from{transform:translateX(40px) skewX(6deg)}to{transform:translateX(-40px) skewX(-6deg)}}.fx{animation:fxk linear both;animation-timeline:scroll(nearest)}` },

    { id: 'dotnav', zh: '章节指示点', en: 'Section dots', dz: '右侧圆点标出当前区块', de: 'Dots mark which section you are in',
      pz: 'IntersectionObserver 判断当前 section，高亮对应圆点。', pe: 'IntersectionObserver picks the active section and highlights its dot.',
      demo: 'scroll', css: `.fx{position:relative}.fx::after{content:'';position:absolute;right:14px;top:50%;width:8px;height:8px;border-radius:50%;background:#d4d6dc;transform:translateY(-50%)}.fx:hover::after{background:#e8879c}` },

    { id: 'stickyside', zh: '吸附侧栏', en: 'Sticky sidebar', dz: '侧栏跟随，主内容继续滚', de: 'The sidebar follows while content scrolls on',
      pz: 'position:sticky;top:24px，父级不要 overflow:hidden。', pe: 'position:sticky with a top offset; the parent must not clip overflow.',
      demo: 'scroll', css: `.fx:first-child{position:sticky;top:12px;height:120px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:#fff;z-index:2}` },

    { id: 'growbar', zh: '滚动生长条', en: 'Bars grow on scroll', dz: '数据条随滚动长出来', de: 'Data bars grow as they enter view',
      pz: '进入视口后 scaleX/height 由 0 到目标值，带 stagger。', pe: 'On enter, animate scaleX/height from 0 with a stagger.',
      demo: 'scroll', css: `@keyframes fxk{from{transform:scaleX(0)}to{transform:scaleX(1)}}.fx{transform-origin:left;background:#e5a68f;animation:fxk linear both;animation-timeline:view();animation-range:entry 0% entry 80%}` },

    { id: 'revealmask', zh: '遮罩滑过显图', en: 'Mask slide reveal', dz: '色块划过后露出图片', de: 'A color panel slides off to expose the image',
      pz: '覆盖层随滚动 translateX 移出，露出下面内容。', pe: 'The overlay translates away as scroll progresses.',
      demo: 'scroll', css: `@keyframes fxk{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(0 0 0 100%)}}.fx{position:relative;background:#dfe1e6}.fx::after{content:'';position:absolute;inset:0;background:#e8879c;border-radius:12px;animation:fxk linear both;animation-timeline:view();animation-range:entry 0% cover 50%}` },

    { id: 'depth', zh: '滚动纵深位移', en: 'Depth drift', dz: '不同卡片以不同速度掠过', de: 'Cards drift past at different speeds',
      pz: '给每个元素不同的视差系数，形成层次。', pe: 'Give each element its own parallax factor.',
      demo: 'scroll', params: [P('d', '幅度', 'Amount', 5, 80, 5, 30, 'px')],
      css: `@keyframes fxk{from{transform:translateY(var(--d,30px))}to{transform:translateY(calc(var(--d,30px)*-1))}}.fx{animation:fxk linear both;animation-timeline:view()}.fx:nth-child(even){animation-name:fxk;animation-direction:reverse}` },

    { id: 'endcta', zh: '滚到底显 CTA', en: 'CTA at the end', dz: '滚到底部按钮升起来', de: 'The button rises once you reach the bottom',
      pz: '监听滚动到底（或最后一个哨兵元素进入视口）再显示。', pe: 'Watch for a sentinel at the bottom entering view, then reveal.',
      demo: 'scroll', css: `@keyframes fxk{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}.fx:last-child{background:#e8879c;color:#fff;font-weight:700;animation:fxk linear both;animation-timeline:view();animation-range:entry 0% entry 100%}` }
  ]
};
