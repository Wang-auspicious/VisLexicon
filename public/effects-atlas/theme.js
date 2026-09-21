// 主题与暗色：暗色不是把颜色反过来，是另一套光照模型
const E = 'cubic-bezier(.22,1,.36,1)';
const I = (id, zh, en, dz, de, pz, pe, demo, css) => ({ id, zh, en, dz, de, pz, pe, demo, css });

export default {
  id: 'theme', zh: '主题与暗色模式', en: 'Theming & dark mode',
  dz: '暗色不是把颜色反过来，是另一套光照模型；再加上 token 分层、品牌切换与首屏防闪',
  de: 'Dark mode is a different lighting model, not an inversion — plus token tiers, brand switching and no first-paint flash',
  items: [
    I('semantictoken', '语义色 token', 'Semantic tokens', '别叫 grey-400，叫 border-subtle', 'Not grey-400 — border-subtle',
      '三层：原始色阶 → 语义角色（surface / border / text-muted）→ 组件专用；组件只许用语义层。',
      'Three tiers: raw ramp → semantic role (surface, border, text-muted) → component alias. Components may only touch the semantic tier.',
      'list', `.fxcol{width:min(400px,88%);gap:6px}.fx{height:auto;padding:9px 14px;font:500 12px var(--fx-mono,monospace)}.fx>i{width:20px;height:20px;border-radius:5px}.fx>u{display:none}.fx:nth-child(1)>i{background:#fff;border:1px solid #e4e5e0}.fx:nth-child(1)::after{content:'surface/base'}.fx:nth-child(2)>i{background:#f4f5f1}.fx:nth-child(2)::after{content:'surface/raised'}.fx:nth-child(3)>i{background:#e4e5e0}.fx:nth-child(3)::after{content:'border/subtle'}.fx:nth-child(4)>i{background:#8b8d84}.fx:nth-child(4)::after{content:'text/muted'}.fx:nth-child(5)>i{background:#23232f}.fx:nth-child(5)::after{content:'text/strong'}.fx:nth-child(6){display:none}`),

    I('tokentier', 'token 分层', 'Token tiers', '改一个原始色不该改遍全站', 'Changing one raw colour should not ripple everywhere',
      'raw 只被 semantic 引用，semantic 只被 component 引用；跨层直引是维护地狱的起点。',
      'Raw feeds semantic, semantic feeds component. A cross-tier reference is where the maintenance debt begins.',
      'cards', `.fx{justify-content:center;text-align:center;font:600 11px var(--fx-mono,monospace)}.fx>b{display:none}.fx:nth-child(1){background:#eef4f8;border-color:#d3e2ea}.fx:nth-child(1)::after{content:'raw\\A teal-600';white-space:pre;color:#3f6f92}.fx:nth-child(2){background:#f4f5f1}.fx:nth-child(2)::after{content:'semantic\\A accent/default';white-space:pre;color:#65675f}.fx:nth-child(3){background:#fff}.fx:nth-child(3)::after{content:'component\\A button/bg';white-space:pre;color:#23232f}`),

    I('aliastoken', '别名层', 'Alias tokens', '让改版只改一层', 'A redesign should touch one layer',
      '组件写 button-bg 而不是 accent-600；换品牌或换主题时只重新指向别名，组件代码一行不动。',
      'Components read button-bg, not accent-600. Rebranding repoints the aliases and leaves component code untouched.',
      'pill', `.fx:nth-child(1){background:#23232f;color:#fff;border-color:#23232f}.fx:nth-child(2){background:#3f6f92;color:#fff;border-color:#3f6f92}.fx:nth-child(3){background:#e8879c;color:#fff;border-color:#e8879c}.fx{font:600 11px var(--fx-mono,monospace)}.fx:nth-child(n+4){display:none}`),

    I('colorscheme', 'color-scheme 声明', 'color-scheme', '一行就修好滚动条和表单控件', 'One line fixes scrollbars and form controls',
      ':root{color-scheme:light dark} 让原生控件、滚动条、系统对话框跟着主题；漏了它暗色下会露出白条。',
      'color-scheme:light dark makes native controls, scrollbars and system dialogs follow. Skip it and white bars show through.',
      'field', `.fxfield{color-scheme:dark}.fx{background:#1a1d21;border-color:#333a44;color:#a8b0ba}.fx>u{background:#a8b0ba}`),

    I('darkinvert', '不要直接反色', 'Never just invert', '纯白变纯黑会刺眼到发光', 'Pure white to pure black glares',
      '暗色底用 #12151a 一类而非 #000，文字用 #e8ecf1 而非 #fff；对比拉满会产生光晕（halation）。',
      'Use about #12151a rather than pure black, and #e8ecf1 rather than pure white. Maxed contrast causes halation.',
      'cards', `.fx{justify-content:center;text-align:center;font:600 11px var(--fx-mono,monospace)}.fx>b{display:none}.fx:nth-child(1){background:#000;color:#fff;border-color:#000}.fx:nth-child(1)::after{content:'#000 / #fff \u2717'}.fx:nth-child(2){background:#12151a;color:#e8ecf1;border-color:#242a33}.fx:nth-child(2)::after{content:'#12151a / #e8ecf1 \u2713'}.fx:nth-child(3){opacity:.3}`),

    I('darkelevation', '暗色的层级', 'Elevation in dark', '暗色里越高越亮，不是越暗', 'Higher means lighter, not darker',
      '亮色靠阴影表示层级，暗色靠"表面变亮"；每升一级底色提亮 3–5%，阴影只做辅助。',
      'Light mode encodes depth with shadow; dark mode encodes it with a lighter surface — about 3–5% per step.',
      'panel', `.fxstack{background:#12151a;border-color:#242a33}.fxa{background:#12151a;color:#8b93a0;font:600 11px var(--fx-mono,monospace)}.fxa::after{content:'base #12151a'}.fxb{inset:22% 18%;border-radius:12px;background:#1d222a;border:1px solid #2c333d;color:#e8ecf1;font:600 11px var(--fx-mono,monospace)}.fxb::after{content:'+1 #1d222a'}`),

    I('darkdesat', '暗色降饱和', 'Desaturate for dark', '亮色的饱和色在暗底上会震动', 'Saturated hues vibrate on dark',
      '暗色主题的强调色要降饱和、提明度；同一个品牌色在两个主题下应该是两个数值。',
      'Dark themes need less saturation and more lightness. One brand hue means two different values across themes.',
      'loader', `.fxload{gap:0}.fx{width:56px;height:56px;border-radius:0}.fx:nth-child(1){background:#e8879c}.fx:nth-child(2){background:#12151a;box-shadow:inset 0 0 0 12px #e8879c}.fx:nth-child(3){background:#12151a;box-shadow:inset 0 0 0 12px #d99caa}`),

    I('darkimage', '图片压暗', 'Dimming imagery', '暗色里一张亮照片像手电筒', 'A bright photo is a torch in dark mode',
      '给图片加 filter:brightness(.86) 或半透明遮罩；纯白背景的产品图要换成透明或深底版本。',
      'Apply brightness(.86) or a scrim. Product shots on white need a transparent or dark-ground variant.',
      'grid', `.fxgrid{grid-template-columns:repeat(2,110px)}.fx{border:0;background:linear-gradient(140deg,#f6efe2,#e4d3b8)}.fx:nth-child(2){filter:brightness(.82) saturate(.9)}.fx:nth-child(n+3){display:none}`),

    I('darkshadow', '暗色用高光而不是阴影', 'Light instead of shadow', '黑底上的黑影看不见', 'A black shadow is invisible on black',
      '用 inset 顶部 1px 高光 + 边框透明白（rgba(255,255,255,.08)）代替投影；投影只在极亮元素下保留。',
      'Use a 1px inset top highlight and a translucent white border instead. Keep drop shadows only under very light elements.',
      'card', `.fxcard{width:min(300px,80%)}.fx{background:#1d222a;border:1px solid rgba(255,255,255,.09);box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}.fx>b{background:#262c36}.fx>u{background:#2f3641}.fx>i{background:#262c36}`),

    I('darkbrand', '品牌色在暗色', 'Brand colour in dark', '品牌色可能在暗底上根本不合格', 'Your brand hue may simply fail on dark',
      '先测对比度，不合格就在暗色里换成品牌色的亮阶，或者只把它用在大字与图形上。',
      'Measure first. If it fails, use a lighter step of the brand ramp in dark, or restrict it to large type and graphics.',
      'pill', `.fxpill{background:#12151a;padding:16px;border-radius:12px;max-width:320px}.fx{background:#1d222a;border-color:#2c333d}.fx:nth-child(1){background:#e8879c;color:#12151a;border-color:#e8879c}.fx:nth-child(1)::after{content:' 8.1:1 \u2713'}.fx:nth-child(2){color:#8c5e6a;border-color:#2c333d}.fx:nth-child(2)::after{content:' 2.4:1 \u2717'}.fx:nth-child(n+3){display:none}`),

    I('themetoggle', '三态切换', 'Three-state toggle', '亮 / 暗 / 跟随系统', 'Light, dark, system',
      '默认"跟随系统"，用户显式选择后才写入存储；二态切换会让用户失去跟随能力。',
      'Default to system and only persist an explicit choice. A two-state toggle takes away the ability to follow.',
      'nav', `@keyframes fxk{0%,100%{left:7px}33%{left:79px}66%{left:151px}}.fxnav{position:relative}.fxnav::before{content:'';position:absolute;top:7px;height:32px;width:64px;border-radius:8px;background:#eceee6;animation:fxk 5s steps(1,end) infinite}.fx{position:relative;z-index:1;font-size:12px}.fx:nth-child(1)::after{content:''}.fx:nth-child(n+4){display:none}`),

    I('systemsync', '跟随系统', 'Follow the system', '用户在系统里切了，你要跟着变', 'They switch at the OS; you follow',
      '监听 prefers-color-scheme 查询的 change 事件，而不是只在加载时读一次。',
      'Listen to the change event on the prefers-color-scheme query — do not read it once at load.',
      'sw', `@keyframes fxk{0%,45%{background:#d9dbe0}55%,100%{background:#3f6f92}}@keyframes fxb{0%,45%{left:3px}55%,100%{left:27px}}.fx{animation:fxk 3.4s steps(1,end) infinite}.fx>b{animation:fxb 3.4s ${E} infinite}`),

    I('flashprevent', '首屏防闪', 'No theme flash', '刷新一下白光闪一下眼', 'A white flash on every refresh',
      '在 <head> 里用一段阻塞小脚本读存储并给 html 打 class；等 React 挂载再改就一定会闪。',
      'Read storage in a tiny blocking script in head and set a class on html. Waiting for React guarantees a flash.',
      'page', `@keyframes fxk{0%,12%{background:#fff}20%,100%{background:#12151a}}.fxpage{border-color:#242a33;animation:fxk 3s steps(1,end) infinite}.fxbar{background:#171b21;border-bottom-color:#242a33}.fxnav2{border-bottom-color:#242a33;color:#8b93a0}.fxhead{color:#e8ecf1}.fxsub{color:#7e8794}.fxart{background:#1d222a}.fxcta{background:#e8ecf1;color:#12151a}`),

    I('lightdarkfn', 'light-dark() 函数', 'light-dark()', '一个属性写两个值', 'One property, both values',
      'color:light-dark(#23232f,#e8ecf1) 省掉整套媒体查询；需要 color-scheme 已声明才生效。',
      'color:light-dark(#23232f,#e8ecf1) removes a whole media-query layer — it needs color-scheme declared.',
      'card', `.fxcard{color-scheme:light dark}.fx{background:light-dark(#fff,#1d222a);border-color:light-dark(#e6e7ea,#2c333d);color:light-dark(#23232f,#e8ecf1)}.fx>b{background:light-dark(#eef0f2,#262c36)}.fx>u{background:light-dark(#e5e7eb,#2f3641)}.fx>i{background:light-dark(#eef0f2,#262c36)}`),

    I('contrasttheme', '高对比主题', 'High-contrast theme', '除了亮暗，还有"看得清"这一档', 'Beyond light and dark: legible',
      'prefers-contrast:more 时加粗边框、去掉浅灰、提高文字对比；不是把所有东西变黑白。',
      'Under prefers-contrast:more, thicken borders, drop pale greys and raise text contrast — not a black-and-white dump.',
      'card', `.fx{border-width:1px}@media (prefers-contrast:more){.fx{border-width:2px;border-color:#23232f}.fx>u,.fx>i{background:#8b8d84}}.fx::after{content:'prefers-contrast:more';display:block;margin-top:10px;font:600 10px var(--fx-mono,monospace);color:#9b9d92}`),

    I('themepersist', '主题持久化', 'Persisting the theme', '选了就要记住，跨标签也一致', 'Remember it, and across tabs',
      'localStorage 存显式选择 + storage 事件同步其他标签；服务端渲染时用 cookie 才能首屏就对。',
      'Store the explicit choice and sync tabs with the storage event. Server rendering needs a cookie to get frame one right.',
      'list', `.fxcol{width:min(380px,88%);gap:8px}.fx{font:500 12px var(--fx-mono,monospace)}.fx>u{display:none}.fx:nth-child(1)::after{content:'theme=dark \u00b7 localStorage'}.fx:nth-child(2)::after{content:'theme=dark \u00b7 cookie (SSR)'}.fx:nth-child(3)::after{content:'storage event \u2192 \u540c\u6b65\u5176\u4ed6\u6807\u7b7e'}.fx:nth-child(n+4){display:none}`),

    I('perpagetheme', '局部主题', 'Scoped theming', '一个暗色区块嵌在亮色页里', 'One dark block inside a light page',
      '把 token 定义挂在容器上而不是 :root，容器内自成主题；页脚、代码块、演示区最常用。',
      'Declare tokens on a container rather than :root so it themes itself. Footers, code blocks and demo areas want this.',
      'panel', `.fxstack{background:#fcfcfb}.fxa{background:#fcfcfb;color:#23232f;align-items:flex-start;justify-content:flex-start;padding:20px;font:600 14px var(--fx-sans,system-ui)}.fxa::after{content:'\u4eae\u8272\u9875\u9762'}.fxb{inset:auto 0 0 0;height:52%;background:#12151a;color:#e8ecf1;font:600 13px var(--fx-sans,system-ui)}.fxb::after{content:'[data-theme=dark] \u5c40\u90e8'}`),

    I('brandtheme', '多品牌主题', 'Multi-brand theming', '同一套组件跑五个品牌', 'One component set, five brands',
      '品牌差异只允许存在于 token 值（色、圆角、字体、密度）；一旦落到组件结构上就无法扩展。',
      'Brand differences live only in token values — colour, radius, type, density. Once they reach component structure it stops scaling.',
      'cards', `.fx{justify-content:flex-end;font:600 12px var(--fx-sans,system-ui)}.fx:nth-child(1){border-radius:4px}.fx:nth-child(1)>b{border-radius:2px;background:#e4e9ec}.fx:nth-child(2){border-radius:14px}.fx:nth-child(2)>b{border-radius:10px;background:#f3e6e9}.fx:nth-child(3){border-radius:0}.fx:nth-child(3)>b{border-radius:0;background:#e9e9e4}`),

    I('themeanim', '主题切换过渡', 'Theme transition', '突变刺眼，全局过渡会卡', 'A hard cut jars; a global transition janks',
      '用 View Transitions 做一次圆形揭开，或只给 background/color 加 120ms 过渡；不要给所有属性加 transition:all。',
      'Do one circular reveal with View Transitions, or transition only background and color for 120ms. Never transition:all.',
      'box', `@keyframes fxk{0%,45%{background:#f4f5f1;color:#23232f}55%,100%{background:#12151a;color:#e8ecf1}}.fx{background:none;box-shadow:none;text-shadow:none;border:1px solid #d9dbe0;animation:fxk 3.4s ${E} infinite}`),

    I('iconontheme', '图标随主题', 'Icons across themes', '线性图标在暗底要更细一点', 'Line icons need to be thinner on dark',
      '暗底上同样线宽看起来更粗（光渗）；把 stroke 从 1.75 调到 1.5，或用 currentColor 让它自然跟随。',
      'The same stroke looks heavier on dark because of bloom. Drop 1.75 to 1.5, and use currentColor so it follows the text.',
      'loader', `.fxload{gap:18px;background:#12151a;padding:18px 24px;border-radius:12px}.fx{width:26px;height:26px;border-radius:50%;background:none;border:2px solid #e8ecf1}.fx:nth-child(2){border-width:1.5px}.fx:nth-child(3){border-width:1px}`),

    I('illusontheme', '插画双版本', 'Two illustration sets', '插画不能靠 filter 反色', 'You cannot invert illustration with a filter',
      '插画与图表要出亮暗两版资产，或用 currentColor + CSS 变量画；PNG 插画在暗色里一定露白边。',
      'Ship two asset sets, or draw with currentColor and variables. PNG illustration always leaks a white fringe on dark.',
      'cards', `.fx>b{background:linear-gradient(140deg,#dfe9ef,#c6d6e0)}.fx:nth-child(2){background:#1d222a;border-color:#2c333d;color:#e8ecf1}.fx:nth-child(2)>b{background:linear-gradient(140deg,#2d3a46,#1f2b34)}.fx:nth-child(3){background:#1d222a;border-color:#2c333d;color:#e8ecf1}.fx:nth-child(3)>b{background:linear-gradient(140deg,#dfe9ef,#c6d6e0)}.fx:nth-child(3)::after{content:'\u2717 \u4eae\u7248\u8d34\u6697\u5e95';font:600 10px var(--fx-mono,monospace);color:#c04a63}`),

    I('codetheme', '代码高亮主题', 'Syntax theme', '代码块要跟着换配色', 'Code blocks switch schemes too',
      '亮暗各选一个成熟主题（如 GitHub Light/Dark、One Light/Dark），别自己配；注释色最容易不合格。',
      'Pick a mature pair — GitHub or One, light and dark — rather than inventing one. Comment colour is the usual contrast failure.',
      'card', `.fx{background:#12151a;border-color:#242a33;padding:14px;font:400 11px/1.8 var(--fx-mono,monospace)}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'const atlas = load(\\'fx\\')  // 3000 \u9879';white-space:pre;color:#8fd0a8}`),

    I('chartontheme', '图表配色随主题', 'Chart palettes per theme', '数据色不能两套主题共用一份', 'One data palette cannot serve both',
      '暗色下数据色要提亮降饱和，网格线用透明白，标注要重新测对比度；序列顺序保持一致以免读错。',
      'Lighten and desaturate data hues for dark, switch gridlines to translucent white, and re-measure labels. Keep the series order stable.',
      'chart', `.fxchart{background:#12151a;padding:18px 22px;border-radius:12px;height:min(220px,34vh)}.fx{background:#7cb6c8;width:34px}.fx:nth-child(even){background:#e5b08f}.fx:nth-child(3n){background:#9fd3b4}`),

    I('mapontheme', '地图底图', 'Map basemaps', '地图不换底图就毁掉整页暗色', 'A light basemap ruins the whole dark page',
      '底图、道路、水体、标注要整套换；标注描边在暗底上要改成深色 halo 而不是白色。',
      'Swap the whole basemap — roads, water, labels — and change label halos from white to dark.',
      'surface', `.fxsurface{background:#12151a;border-color:#242a33}.fx{background:radial-gradient(120% 100% at 30% 20%,#1e2a33,#12151a 66%)}.fx::after{content:'';position:absolute;left:14%;right:20%;top:38%;height:2px;background:#3f6f92;box-shadow:0 26px 0 #2f5570,0 -30px 0 #4d8ba6}`),

    I('glasstheme', '玻璃在暗色', 'Glass in dark', '暗底毛玻璃要靠边框才看得出边界', 'On dark, glass needs a border to have an edge',
      '暗色玻璃用 rgba(255,255,255,.06) 填充 + .12 顶部高光 + .1 边框；亮色那套 alpha 直接搬过来会消失。',
      'Dark glass wants a .06 white fill, a .12 top highlight and a .1 border. Reusing the light-mode alphas makes it vanish.',
      'panel', `.fxstack{background:linear-gradient(150deg,#1c2b38,#12151a)}.fxa{background:none}.fxa::after{content:''}.fxb{inset:20%;border-radius:14px;background:rgba(255,255,255,.06);backdrop-filter:blur(9px);border:1px solid rgba(255,255,255,.11);box-shadow:inset 0 1px 0 rgba(255,255,255,.13);color:#e8ecf1;font:600 12px var(--fx-sans,system-ui)}`),

    I('borderdark', '暗色边框', 'Dark-mode borders', '边框用透明白，不用固定灰', 'Translucent white, not a fixed grey',
      'rgba(255,255,255,.08–.14) 会随底色自动适配层级；写死的 #2a2a2a 在不同海拔上会时隐时现。',
      'rgba(255,255,255,.08–.14) adapts to whatever surface it sits on. A hard-coded #2a2a2a appears and disappears by elevation.',
      'list', `.fxcol{background:#12151a;padding:16px;border-radius:12px;width:min(360px,86%)}.fx{background:#1d222a;border:1px solid rgba(255,255,255,.1);color:#e8ecf1}.fx>i{background:#2a313b}.fx>u{background:#2a313b}.fx:nth-child(n+5){display:none}`),

    I('focusdark', '暗色焦点环', 'Focus ring in dark', '深色焦点环在深底上等于没有', 'A dark ring on dark is no ring',
      '用双层环：内圈底色、外圈亮色，两种主题都成立；或直接用 outline-color:currentColor。',
      'Use a two-layer ring — an inner ring in the surface colour, an outer bright one — so it works in both themes.',
      'pill', `@keyframes fxk{0%,45%{box-shadow:none}55%,100%{box-shadow:0 0 0 2px #12151a,0 0 0 4px #7cb6c8}}.fxpill{background:#12151a;padding:16px;border-radius:12px;max-width:320px}.fx{background:#1d222a;border-color:#2c333d;color:#e8ecf1}.fx:nth-child(2){animation:fxk 3s steps(1,end) infinite}`),

    I('selectiondark', '选中态', 'Selection colour', '::selection 不换就会看不清被选的字', 'Unchanged ::selection hides the selected text',
      '两个主题各给一组 ::selection 背景与前景；浅色高亮块（mark）在暗色里也要重配。',
      'Give each theme its own ::selection pair, and re-tune mark highlights for dark too.',
      'text', `.fx{font-size:clamp(24px,4vw,40px);background:#12151a;color:#e8ecf1;padding:18px 24px;border-radius:12px}.fx::selection{background:#3f6f92;color:#fff}.fx span:nth-child(-n+6){background:#3f6f92;color:#fff}`),

    I('scrollbardark', '滚动条', 'Scrollbars', '亮色滚动条在暗色页面上像一道伤口', 'A light scrollbar scars a dark page',
      'color-scheme 解决大部分；要精细控制用 scrollbar-color: thumb track，别整个 ::-webkit-scrollbar 重画。',
      'color-scheme covers most of it. For fine control use scrollbar-color rather than repainting the whole webkit scrollbar.',
      'scroll', `.fxscroll{background:#12151a;border-color:#242a33;color-scheme:dark;scrollbar-color:#3a424e #12151a}.fx{background:#1d222a;color:#7e8794}`),

    I('emailtheme', '邮件主题', 'Email theming', '客户端会替你反色', 'The client will invert it for you',
      'meta name=color-scheme + supported-color-schemes，关键色写死并用表格背景色兜底；Gmail 只会部分尊重。',
      'Declare color-scheme and supported-color-schemes, hard-code critical colours and back them with table bgcolor. Gmail only partly complies.',
      'card', `.fx{background:#1d222a;border-color:#2c333d;padding:14px}.fx>b{background:#262c36}.fx>u{background:#2f3641}.fx>i{background:#262c36}.fx::after{content:'meta color-scheme:light dark';display:block;margin-top:10px;font:600 9.5px var(--fx-mono,monospace);color:#7e8794}`),

    I('ogtheme', '分享图双版本', 'OG cards per theme', 'OG 图不会跟随用户主题', 'Share cards never follow the user theme',
      '分享图固定一套（通常深底），不要指望它响应主题；文字要足够大，1200×630 会被压缩到很小。',
      'Fix one treatment — usually dark — and do not expect it to adapt. Set type large; 1200×630 gets shown tiny.',
      'media', `.fxmedia{width:min(360px,84%)}.fx{aspect-ratio:1200/630;background:radial-gradient(120% 110% at 24% 16%,#243444,#12151a 62%);display:flex;align-items:center;justify-content:center;font:700 18px var(--fx-sans,system-ui);color:#e8ecf1;letter-spacing:-.02em}.fx::after{content:'1200 \u00d7 630'}`),

    I('dynamiccolor', '取图主色', 'Colour from content', '让主题跟着封面走', 'Let the theme follow the artwork',
      '提取封面主色生成一组和谐色（Material You 那一套）；必须钳制饱和与明度，否则某些图会毁掉可读性。',
      'Extract a seed colour and generate a harmonised set. Clamp saturation and lightness or some artwork destroys legibility.',
      'panel', `@keyframes fxk{0%,100%{background:linear-gradient(150deg,#2a3a4a,#16202a)}33%{background:linear-gradient(150deg,#4a3a2a,#2a1e16)}66%{background:linear-gradient(150deg,#3a2a44,#20162a)}}.fxstack{animation:fxk 9s ${E} infinite}.fxa{background:none;color:#e8ecf1;font:600 13px var(--fx-sans,system-ui)}.fxa::after{content:'seed \u2192 \u8c03\u548c\u8272\u7ec4'}.fxb{display:none}`),

    I('accenttoken', '用户自选强调色', 'User accent colour', '让用户挑一个颜色，但要兜住对比度', 'Let them pick — then guarantee contrast',
      '只暴露强调色一个变量，前景色用 oklch 亮度判断自动取黑或白；不要让用户能配出不可读的组合。',
      'Expose one accent variable and derive the foreground from its oklch lightness. Never let a user configure an unreadable pair.',
      'pill', `.fx{color:#fff;border:0;font-weight:600}.fx:nth-child(1){background:#3f6f92}.fx:nth-child(2){background:#e8879c}.fx:nth-child(3){background:#4d8ba6}.fx:nth-child(4){background:#e5a68f;color:#23232f}.fx:nth-child(5){background:#c9d76a;color:#23232f}`),

    I('themeaudit', '主题审计', 'Theme audit', '每个 token 在每个主题下都要过一遍', 'Every token, every theme, checked',
      '生成对比度矩阵：每个 text token × 每个 surface token；CI 里跑，新增颜色不合格就拦下来。',
      'Generate a contrast matrix of every text token against every surface token, and gate it in CI.',
      'grid', `.fxgrid{grid-template-columns:repeat(4,minmax(0,1fr));width:min(320px,86%);gap:5px}.fx{height:44px;display:flex;align-items:center;justify-content:center;font:600 9px var(--fx-mono,monospace);color:#4d8ba6;border-color:#dbe4ea}.fx::after{content:'\u2713'}.fx:nth-child(6),.fx:nth-child(11){color:#c04a63}.fx:nth-child(6)::after,.fx:nth-child(11)::after{content:'\u2717'}`),

    I('forcedcolorstheme', '强制颜色下的主题', 'Theme under forced colors', '系统会把你的主题整个接管', 'The OS takes your theme away entirely',
      'forced-colors:active 时放弃自定义色，改用系统关键字并保证结构可辨；这时"主题"变成"结构"。',
      'Under forced-colors, drop custom colour for system keywords and let structure carry meaning. Theme becomes layout.',
      'card', `.fx{background:#fff}@media (forced-colors:active){.fx{background:Canvas;color:CanvasText;border:1px solid CanvasText;forced-color-adjust:none}.fx>b,.fx>u,.fx>i{background:GrayText}}.fx::after{content:'forced-colors:active';display:block;margin-top:10px;font:600 10px var(--fx-mono,monospace);color:#9b9d92}`)
  ]
};
