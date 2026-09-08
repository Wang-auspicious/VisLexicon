const G = (tpl, extra) => `.fxgrid{display:grid;width:min(560px,88%);gap:12px;${tpl}}.fx{height:auto;min-height:52px;background:#fcfcfb;border:1px solid #e4e5e0;border-radius:10px}${extra || ''}`;

export default {
  id: 'layout', zh: '布局模式', en: 'Layout patterns',
  dz: '内容在页面上怎么摆', de: 'How content is arranged on the page',
  items: [
    { id: 'bento', zh: '便当盒网格', en: 'Bento grid', dz: '大小格子拼成一整块', de: 'Tiles of mixed size locked into one block',
      pz: 'grid-template-areas 或 span，给 1–2 个大格作视觉锚点。', pe: 'grid-template-areas or spans, with one or two large anchor tiles.',
      demo: 'grid', css: G('grid-template-columns:repeat(4,1fr);grid-auto-rows:76px', `.fx:nth-child(1){grid-column:span 2;grid-row:span 2;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}.fx:nth-child(4){grid-column:span 2}.fx:nth-child(7){grid-column:span 3;background:#eaf1e5}`) },

    { id: 'masonry', zh: '瀑布流', en: 'Masonry', dz: '不等高卡片错落排列', de: 'Unequal-height cards interlock',
      pz: 'CSS columns 或 grid-template-rows:masonry；注意顺序会变列优先。', pe: 'CSS columns or grid masonry — note that column flow reorders items.',
      demo: 'grid', css: `.fxgrid{display:block;column-count:3;column-gap:12px;width:min(520px,88%)}.fx{height:auto;break-inside:avoid;margin-bottom:12px;background:#fcfcfb;border:1px solid #e4e5e0;border-radius:10px}.fx:nth-child(3n+1){height:120px}.fx:nth-child(3n+2){height:78px}.fx:nth-child(3n){height:160px}` },

    { id: 'split', zh: '左右对分', en: 'Split screen', dz: '一半图一半字', de: 'Half image, half words',
      pz: 'grid-template-columns:1fr 1fr，小屏堆叠为一列。', pe: '1fr 1fr grid that stacks to one column on small screens.',
      demo: 'grid', css: G('grid-template-columns:1fr 1fr;grid-auto-rows:200px', `.fx:nth-child(n+3){display:none}.fx:first-child{background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}`) },

    { id: 'sidebar', zh: '侧栏加主区', en: 'Sidebar + canvas', dz: '固定侧栏 + 自适应主区', de: 'Fixed sidebar with a fluid main area',
      pz: 'grid-template-columns:260px minmax(0,1fr)，主区必须 minmax(0,1fr)。', pe: '260px minmax(0,1fr) — the minmax(0,…) is what stops overflow.',
      demo: 'grid', css: G('grid-template-columns:150px minmax(0,1fr);grid-auto-rows:200px', `.fx:nth-child(n+3){display:none}.fx:first-child{background:#1b1b26}`) },

    { id: 'holygrail', zh: '三栏经典', en: 'Holy grail', dz: '头 + 三栏 + 脚', de: 'Header, three columns, footer',
      pz: 'grid-template-areas 明确命名区域，最稳。', pe: 'Named grid-template-areas is the sturdiest version.',
      demo: 'grid', css: G('grid-template-columns:90px 1fr 90px;grid-auto-rows:56px', `.fx:first-child{grid-column:1/-1;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}.fx:nth-child(5){grid-column:1/-1;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}.fx:nth-child(n+6){display:none}.fx:nth-child(3){grid-row:span 1}`) },

    { id: 'montage', zh: '非对称蒙太奇', en: 'Asymmetric montage', dz: '大小不一、白缝分割的拼贴', de: 'Mismatched tiles split by crisp white gutters',
      pz: '刻意打破对称，缝隙保持一致的纯白，是最有性格的一种拼图。', pe: 'Break symmetry on purpose and keep the white gutters even.',
      demo: 'grid', css: G('grid-template-columns:repeat(6,1fr);grid-auto-rows:60px;gap:6px', `.fx:nth-child(1){grid-column:span 4;grid-row:span 2;background:#4d8ba6}.fx:nth-child(2){grid-column:span 2}.fx:nth-child(3){grid-column:span 2;background:#f0c9a8}.fx:nth-child(4){grid-column:span 3}.fx:nth-child(5){grid-column:span 3;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}.fx:nth-child(n+6){display:none}`) },

    { id: 'hero', zh: '通栏主视觉', en: 'Full-bleed hero', dz: '整屏一句话', de: 'One sentence owning the screen',
      pz: '给主视觉留大量留白，一句话 + 一个 CTA 就够。', pe: 'Leave a lot of air: one sentence and one CTA is enough.',
      demo: 'grid', css: G('grid-template-columns:1fr;grid-auto-rows:240px', `.fx:nth-child(n+2){display:none}.fx:first-child{background:#f3f4f6;position:relative}.fx:first-child::after{content:'Grow something great.';position:absolute;left:32px;top:50%;transform:translateY(-50%);font:700 26px var(--fx-sans,system-ui);color:#23232f}`) },

    { id: 'overlap', zh: '重叠错位', en: 'Overlapping blocks', dz: '图文互相压住一角', de: 'Blocks deliberately overlap at a corner',
      pz: '让两个 grid item 落在同一格并用 z-index/margin 错开。', pe: 'Place two items in the same cell and offset with margin/z-index.',
      demo: 'grid', css: G('grid-template-columns:1fr 1fr;grid-auto-rows:180px', `.fx:nth-child(n+3){display:none}.fx:first-child{background:#4d8ba6;z-index:1}.fx:nth-child(2){margin:36px 0 -36px -60px;background:#fcfcfb;box-shadow:0 16px 40px rgba(48,66,92,.14)}`) },

    { id: 'editorial', zh: '双栏正文', en: 'Editorial two-column', dz: '长文两栏排版', de: 'Long-form set in two columns',
      pz: '正文列宽 60–75 字符，column-gap 至少 2rem。', pe: 'Measure of 60–75 characters, column-gap at least 2rem.',
      demo: 'grid', css: G('grid-template-columns:1.4fr 1fr;grid-auto-rows:auto', `.fx{min-height:0;padding:0;border:0;background:repeating-linear-gradient(#e9eaee 0 8px,transparent 8px 20px);height:180px}.fx:nth-child(n+3){display:none}`) },

    { id: 'autofit', zh: '自适应卡片网格', en: 'Auto-fit card grid', dz: '按容器宽度自动换行', de: 'Cards rewrap to the container width',
      pz: 'repeat(auto-fit,minmax(220px,1fr))，无需媒体查询。', pe: 'repeat(auto-fit,minmax(220px,1fr)) — no media queries needed.',
      demo: 'grid', css: G('grid-template-columns:repeat(auto-fit,minmax(140px,1fr));grid-auto-rows:110px') },

    { id: 'ztile', zh: '定比瓦片', en: 'Fixed-ratio tiles', dz: '所有格子保持同一比例', de: 'Every tile keeps the same ratio',
      pz: 'aspect-ratio 而不是写死高度，图片用 object-fit:cover。', pe: 'aspect-ratio instead of fixed heights; images object-fit:cover.',
      demo: 'grid', css: G('grid-template-columns:repeat(3,1fr)', `.fx{aspect-ratio:4/3;min-height:0}`) },

    { id: 'diagonal', zh: '对角切分', en: 'Diagonal split', dz: '斜线把版面分成两块', de: 'A diagonal cuts the layout in two',
      pz: 'clip-path polygon 做斜切，注意内容避让斜边。', pe: 'clip-path polygon for the cut; keep content clear of the angle.',
      demo: 'grid', css: G('grid-template-columns:1fr;grid-auto-rows:240px', `.fx:nth-child(n+2){display:none}.fx:first-child{background:#f3f4f6;position:relative;overflow:hidden}.fx:first-child::after{content:'';position:absolute;inset:0;background:#2f5570;clip-path:polygon(0 0,46% 0,26% 100%,0 100%)}`) },

    { id: 'dash12', zh: '仪表盘 12 栅格', en: 'Dashboard 12-col', dz: '统计卡按栅格排布', de: 'Stat cards on a 12-column grid',
      pz: '12 栅格 + span 组合，卡片高度用行数控制而非固定值。', pe: '12 columns with spans; control height by row count, not pixels.',
      demo: 'grid', css: G('grid-template-columns:repeat(12,1fr);grid-auto-rows:64px', `.fx:nth-child(-n+3){grid-column:span 4}.fx:nth-child(4){grid-column:span 8;grid-row:span 2}.fx:nth-child(5){grid-column:span 4;grid-row:span 2}.fx:nth-child(n+6){display:none}`) },

    { id: 'timeline', zh: '纵向时间线', en: 'Vertical timeline', dz: '一条线串起事件', de: 'Events threaded on one line',
      pz: '左侧一条线 + 节点，内容右侧对齐，节点用伪元素。', pe: 'A rule with pseudo-element nodes on the left, content right.',
      demo: 'grid', css: `.fxgrid{display:flex;flex-direction:column;gap:14px;width:min(420px,84%);position:relative;padding-left:26px}.fxgrid::before{content:'';position:absolute;left:7px;top:6px;bottom:6px;width:2px;background:#d9d9d9}.fx{height:52px;background:#fcfcfb;border:1px solid #e4e5e0;border-radius:10px;position:relative}.fx::before{content:'';position:absolute;left:-24px;top:20px;width:10px;height:10px;border-radius:50%;background:#4d8ba6}.fx:nth-child(n+6){display:none}` },

    { id: 'stepper', zh: '横向步骤条', en: 'Horizontal stepper', dz: '流程分步指示', de: 'Step-by-step progress',
      pz: '等分 flex + 连接线用伪元素，当前步高亮。', pe: 'Equal flex items joined by pseudo-element rules; highlight the active step.',
      demo: 'grid', css: `.fxgrid{display:flex;align-items:center;gap:0;width:min(520px,88%)}.fx{flex:1;height:8px;border-radius:4px;background:#e4e5e0;border:0;position:relative;margin:0 4px}.fx:nth-child(-n+2){background:#4d8ba6}.fx:nth-child(n+5){display:none}` },

    { id: 'sticky', zh: '吸附侧栏布局', en: 'Sticky sidebar layout', dz: '目录固定、正文滚动', de: 'Pinned table of contents, scrolling body',
      pz: 'sticky 元素的父级不能有 overflow:hidden。', pe: 'A sticky child needs a parent without overflow clipping.',
      demo: 'grid', css: G('grid-template-columns:120px minmax(0,1fr);grid-auto-rows:auto', `.fx:first-child{height:96px;background:#f3f4f6}.fx:nth-child(2){height:220px}.fx:nth-child(n+3){display:none}`) },

    { id: 'compare', zh: '对比表', en: 'Comparison table', dz: '并排比较几个方案', de: 'Options compared side by side',
      pz: '列宽等分、突出推荐列，行高统一避免锯齿。', pe: 'Equal columns, one highlighted; keep row heights uniform.',
      demo: 'grid', css: G('grid-template-columns:repeat(3,1fr);grid-auto-rows:44px', `.fx:nth-child(2){background:#eaf1e5;border-color:#4d8ba6}.fx:nth-child(n+7){display:none}`) },

    { id: 'heroside', zh: '图文并排主视觉', en: 'Hero with side image', dz: '左字右图的经典首屏', de: 'Copy left, image right',
      pz: '文字列 45–55% 宽，图片列出血到边。', pe: 'Copy column 45–55%, image bleeding to the edge.',
      demo: 'grid', css: G('grid-template-columns:1fr 1.1fr;grid-auto-rows:230px', `.fx:nth-child(n+3){display:none}.fx:nth-child(2){background:linear-gradient(135deg,#4d8ba6,#e5a68f);border:0}`) },

    { id: 'mosaic', zh: '相册马赛克', en: 'Gallery mosaic', dz: '一大多小的图片墙', de: 'One large image with small ones around it',
      pz: '第一张 span 2×2，其余自动填充。', pe: 'First tile spans 2×2, the rest auto-fill.',
      demo: 'grid', css: G('grid-template-columns:repeat(4,1fr);grid-auto-rows:76px;gap:8px', `.fx:first-child{grid-column:span 2;grid-row:span 2;background:#dfe1e6}`) },

    { id: 'narrow', zh: '居中窄栏', en: 'Centered measure', dz: '正文只占中间一条', de: 'Body copy in one centred column',
      pz: 'max-width:68ch + margin:auto，两侧留白比内容更重要。', pe: 'max-width:68ch with auto margins — the air matters more than the text.',
      demo: 'grid', css: `.fxgrid{display:flex;flex-direction:column;gap:12px;width:min(360px,70%)}.fx{height:16px;background:#e9eaee;border:0}.fx:first-child{height:34px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}.fx:nth-child(n+6){display:none}` },

    { id: 'carousel', zh: '横向卡片轨道', en: 'Card rail', dz: '一行可横滑的卡片', de: 'A horizontally scrollable row of cards',
      pz: 'overflow-x:auto + scroll-snap，首尾留 padding 做透出。', pe: 'overflow-x auto with scroll-snap and edge padding for peeking.',
      demo: 'grid', css: `.fxgrid{display:flex;gap:12px;width:min(520px,88%);overflow-x:auto;padding-bottom:8px}.fx{flex:none;width:150px;height:110px;background:#fcfcfb;border:1px solid #e4e5e0;border-radius:10px}` },

    { id: 'stickycta', zh: '底部常驻 CTA', en: 'Sticky bottom CTA', dz: '按钮一直贴在底部', de: 'The action bar stays at the bottom',
      pz: 'position:sticky;bottom:0 + 安全区 padding-bottom。', pe: 'position:sticky;bottom:0 plus safe-area padding.',
      demo: 'grid', css: `.fxgrid{display:flex;flex-direction:column;gap:10px;width:min(360px,72%)}.fx{height:60px;background:#f3f4f6;border:0}.fx:last-child{background:#e8879c;position:sticky;bottom:0;height:52px;border-radius:26px}` },

    { id: 'zpattern', zh: 'Z 型交错', en: 'Z-pattern sections', dz: '图文左右交替往下走', de: 'Text and image alternate sides down the page',
      pz: '奇偶行用 direction 或 order 交换左右，节奏一致。', pe: 'Swap sides on odd/even rows with order; keep the rhythm even.',
      demo: 'grid', css: G('grid-template-columns:1fr 1fr;grid-auto-rows:96px', `.fx:nth-child(4n+1),.fx:nth-child(4n+4){background:#eceef1}.fx:nth-child(n+7){display:none}`) },

    { id: 'mobilestack', zh: '移动端单列', en: 'Mobile stack', dz: '小屏一切都变一列', de: 'Everything becomes one column on mobile',
      pz: '先写单列，再在断点上升级为多列（mobile first）。', pe: 'Write the single column first, then upgrade at breakpoints.',
      demo: 'grid', css: `.fxgrid{display:flex;flex-direction:column;gap:10px;width:min(280px,64%)}.fx{height:56px;background:#fcfcfb;border:1px solid #e4e5e0;border-radius:10px}.fx:nth-child(n+6){display:none}` },

    { id: 'ratio', zh: '黄金比例分栏', en: 'Golden split', dz: '不对称但舒服的比例', de: 'Asymmetric but comfortable proportions',
      pz: '用 1.618:1 或 2:3 这样的比例，比 50/50 更有张力。', pe: 'Use 1.618:1 or 2:3 — more tension than a flat 50/50.',
      demo: 'grid', css: G('grid-template-columns:1.618fr 1fr;grid-auto-rows:210px', `.fx:nth-child(n+3){display:none}.fx:first-child{background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}`) }
  ]
};
