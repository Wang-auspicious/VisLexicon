const P = (k, zh, en, min, max, step, def, unit) => ({ k, zh, en, min, max, step, def, unit: unit || '' });
const E = 'cubic-bezier(.22,1,.36,1)';

export default {
  id: 'list', zh: '列表 / 卡片编排', en: 'Lists & card choreography',
  dz: '一堆条目怎么进场、排序、操作', de: 'How many items arrive, sort and respond',
  items: [
    { id: 'staggerin', zh: '逐行入场', en: 'Row stagger in', dz: '行一条条淡入', de: 'Rows fade in one by one',
      pz: 'delay = index × 60ms，超过 10 行后 delay 封顶。', pe: 'delay = index × 60ms, capped after ten rows.',
      demo: 'list', params: [P('s', '间隔', 'Stagger', 20, 200, 10, 70, 'ms')],
      css: `@keyframes fxk{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}.fx{animation:fxk .6s ${E} infinite alternate;animation-delay:calc(var(--i)*var(--s,70ms))}` },

    { id: 'cascade', zh: '侧向级联', en: 'Side cascade', dz: '行从左侧依次推入', de: 'Rows push in from the left in sequence',
      pz: 'translateX(-24px)→0，配合极短的 blur 更顺。', pe: 'translateX(-24px)→0, optionally with a tiny blur.',
      demo: 'list', css: `@keyframes fxk{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:none}}.fx{animation:fxk .55s ${E} infinite alternate;animation-delay:calc(var(--i)*90ms)}` },

    { id: 'hoverrow', zh: '行悬停', en: 'Row hover', dz: '整行轻微变色并右移', de: 'The row tints and nudges right',
      pz: '背景色 + 2px 右移，别加边框免得跳动。', pe: 'Background tint plus a 2px nudge — no border, it causes jitter.',
      demo: 'list', css: `.fx{transition:all .18s ease;cursor:pointer}.fx:hover{background:#f3f4f6;transform:translateX(4px);border-color:#dfe2e6}` },

    { id: 'stripes', zh: '斑马纹', en: 'Zebra rows', dz: '隔行浅色，方便横向读', de: 'Alternating tint helps you track across',
      pz: 'nth-child(even) 用最浅一档灰，别用边框分隔。', pe: 'nth-child(even) with the lightest grey; skip the borders.',
      demo: 'list', css: `.fx{border:0;border-radius:8px}.fx:nth-child(even){background:#f5f6f8}` },

    { id: 'expandrow', zh: '行内展开', en: 'Expand row', dz: '点开行在原地展开详情', de: 'The row opens in place',
      pz: 'grid-template-rows:0fr→1fr，箭头同步旋转。', pe: 'grid-template-rows 0fr→1fr with the chevron rotating in sync.',
      demo: 'list', css: `@keyframes fxk{0%,25%{height:52px}65%,100%{height:130px}}.fx:nth-child(2){align-items:flex-start;padding-top:16px;animation:fxk 3s ${E} infinite alternate}` },

    { id: 'swipe', zh: '滑动露出操作', en: 'Swipe actions', dz: '左滑露出删除按钮', de: 'Swipe left to expose delete',
      pz: '行 translateX，底层操作按钮固定；超过阈值直接执行。', pe: 'Translate the row over fixed action buttons; past a threshold, commit.',
      demo: 'list', css: `@keyframes fxk{0%,30%{transform:translateX(0)}70%,100%{transform:translateX(-88px)}}.fxcol{position:relative}.fx{position:relative;z-index:1}.fx:nth-child(3){animation:fxk 2.8s ${E} infinite alternate}.fxcol::after{content:'';position:absolute;right:0;top:110px;width:88px;height:52px;background:#e8879c;border-radius:10px}` },

    { id: 'reorder', zh: '拖拽排序', en: 'Drag to reorder', dz: '拖起来的行浮起，其他行让位', de: 'The dragged row lifts, the rest make room',
      pz: '拖起项加阴影与 scale(1.02)，其他行用 transform 让位（FLIP）。', pe: 'Lift with shadow and scale(1.02); shift siblings with FLIP transforms.',
      demo: 'list', css: `@keyframes fxk{0%,100%{transform:translateY(0) scale(1);box-shadow:none}50%{transform:translateY(62px) scale(1.03);box-shadow:0 12px 26px rgba(48,66,92,.18)}}.fx:nth-child(2){position:relative;z-index:2;animation:fxk 3s ${E} infinite}` },

    { id: 'removerow', zh: '删除塌陷', en: 'Remove & collapse', dz: '删掉的行收起，下面补位', de: 'The removed row collapses and the rest close up',
      pz: '先淡出 + 横移，再收 height，两段共 320ms。', pe: 'Fade and slide first, then collapse height — 320ms total.',
      demo: 'list', css: `@keyframes fxk{0%{opacity:1;height:52px;margin-bottom:0}50%{opacity:0;height:52px}100%{opacity:0;height:0;margin-bottom:-10px}}.fx:nth-child(3){overflow:hidden;animation:fxk 2.4s ${E} infinite alternate}` },

    { id: 'addrow', zh: '新增行长出', en: 'Add row', dz: '新行从零高度长出并高亮一下', de: 'A new row grows in and flashes once',
      pz: '高度展开 + 一次淡黄底闪现（500ms）标示“这是新的”。', pe: 'Grow the height, then flash a soft highlight for 500ms.',
      demo: 'list', css: `@keyframes fxk{0%{height:0;opacity:0;background:#f6f3d8}40%{height:52px;opacity:1;background:#f6f3d8}100%{height:52px;background:#fcfcfb}}.fx:first-child{overflow:hidden;animation:fxk 2.2s ${E} infinite alternate}` },

    { id: 'filtershuffle', zh: '筛选重排', en: 'Filter shuffle', dz: '过滤后剩下的项平滑归位', de: 'Survivors glide into their new places',
      pz: '离场项 fade+scale，留下项用 FLIP 平移，别整体重绘。', pe: 'Fade out the removed, FLIP the survivors — never re-render blind.',
      demo: 'list', css: `@keyframes fxo{0%,40%{opacity:1;transform:none}100%{opacity:0;transform:scale(.94)}}@keyframes fxm{0%,40%{transform:none}100%{transform:translateY(-62px)}}.fx:nth-child(2),.fx:nth-child(4){animation:fxo 2.4s ${E} infinite alternate}.fx:nth-child(3),.fx:nth-child(5){animation:fxm 2.4s ${E} infinite alternate}` },

    { id: 'sortlist', zh: '排序动画', en: 'Sort animation', dz: '排序时行互相交换位置', de: 'Rows swap places when sorted',
      pz: 'FLIP：记录旧位置，重排后反向补偿再播放。', pe: 'FLIP: record old rects, invert after the re-order, play.',
      demo: 'list', css: `@keyframes fxa{0%,30%{transform:none}70%,100%{transform:translateY(186px)}}@keyframes fxb{0%,30%{transform:none}70%,100%{transform:translateY(-62px)}}.fx:first-child{animation:fxa 3s ${E} infinite alternate;z-index:2;position:relative}.fx:nth-child(2),.fx:nth-child(3),.fx:nth-child(4){animation:fxb 3s ${E} infinite alternate}` },

    { id: 'groupsticky', zh: '分组吸顶', en: 'Sticky group header', dz: '分组标题贴住顶部直到下一组', de: 'Group headers pin until the next group',
      pz: 'position:sticky;top:0 给分组标题，注意层级与背景不透明。', pe: 'Sticky headers with an opaque background and a z-index.',
      demo: 'list', css: `.fx:nth-child(1),.fx:nth-child(4){position:sticky;top:0;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:#fff;z-index:2;height:38px;font-size:12px}.fx:nth-child(1) i,.fx:nth-child(4) i,.fx:nth-child(1) u,.fx:nth-child(4) u{display:none}` },

    { id: 'checklist', zh: '勾选完成', en: 'Check off', dz: '勾选后整行变淡加删除线', de: 'Checked rows dim and strike through',
      pz: '勾 + 文字划线 + 透明度 60%，200ms 内完成。', pe: 'Tick, strike-through and 60% opacity, all inside 200ms.',
      demo: 'list', css: `.fx{cursor:pointer;transition:all .2s}.fx i{border-radius:50%;transition:background .2s}.fx:nth-child(2),.fx:nth-child(5){opacity:.5}.fx:nth-child(2) i,.fx:nth-child(5) i{background:#4d8ba6}.fx:nth-child(2) u,.fx:nth-child(5) u{background:linear-gradient(#e4e5e0,#e4e5e0) center/100% 2px no-repeat,#eceee6}` },

    { id: 'avatars', zh: '头像叠放', en: 'Avatar stack', dz: '头像互相压边，悬停展开', de: 'Overlapping avatars fan out on hover',
      pz: '负 margin 叠放 + hover 时恢复间距，最多显示 4 个 + N。', pe: 'Negative margins, restored on hover; show four plus a count.',
      demo: 'list', css: `.fxcol{flex-direction:row;justify-content:center;gap:0;width:auto}.fx{width:56px;height:56px;border-radius:50%;padding:0;margin-left:-16px;border:3px solid #fff;background:#4d8ba6;transition:margin .3s ${E}}.fx i,.fx u{display:none}.fxcol:hover .fx{margin-left:6px}` },

    { id: 'density', zh: '密度切换', en: 'Density toggle', dz: '紧凑与宽松两档行高', de: 'Compact and comfortable row heights',
      pz: '只改 padding 与 font-size，别改结构，切换加 200ms 过渡。', pe: 'Change padding and font-size only, with a 200ms transition.',
      demo: 'list', css: `@keyframes fxk{0%,40%{height:38px;gap:8px}60%,100%{height:66px;gap:16px}}.fx{animation:fxk 3s ${E} infinite alternate}` },

    { id: 'cardgrid', zh: '卡片网格入场', en: 'Card grid entrance', dz: '卡片从左上角波浪式出现', de: 'Cards ripple in from the top-left',
      pz: 'delay 按行列距离计算，比单纯 index 更自然。', pe: 'Delay by grid distance rather than flat index.',
      demo: 'grid', css: `@keyframes fxk{from{opacity:0;transform:translateY(20px) scale(.94)}to{opacity:1;transform:none}}.fx{animation:fxk .6s ${E} infinite alternate;animation-delay:calc(var(--i)*80ms)}` },

    { id: 'flipgrid', zh: '卡片翻面网格', en: 'Flip grid', dz: '悬停单张卡翻到背面', de: 'Hovering flips a single card',
      pz: '每张卡独立 perspective，翻转 400–500ms。', pe: 'Per-card perspective, 400–500ms flip.',
      demo: 'grid', css: `.fxgrid{perspective:900px}.fx{transition:transform .5s ${E};cursor:pointer;transform-style:preserve-3d}.fx:hover{transform:rotateY(180deg);background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}` },

    { id: 'deck', zh: '堆叠卡组', en: 'Stacked deck', dz: '卡片像一叠牌错开', de: 'Cards fan like a deck',
      pz: '每层轻微位移 + scale 递减，最上层完全清晰。', pe: 'Each layer offsets and scales down slightly; the top one stays crisp.',
      demo: 'cards', css: `.fxrow{position:relative;width:200px;height:230px}.fx{position:absolute;inset:0;width:auto;transition:transform .35s ${E}}.fx:nth-child(1){transform:rotate(-6deg) translateY(6px)}.fx:nth-child(2){transform:rotate(3deg)}.fx:nth-child(3){transform:rotate(-1deg) translateY(-4px);box-shadow:0 12px 28px rgba(48,66,92,.16)}.fxrow:hover .fx:nth-child(1){transform:rotate(-14deg) translate(-40px,4px)}.fxrow:hover .fx:nth-child(2){transform:rotate(0) translateY(-8px)}.fxrow:hover .fx:nth-child(3){transform:rotate(12deg) translate(40px,4px)}` },

    { id: 'railsnap', zh: '横向卡片吸附', en: 'Snap rail', dz: '横滑一张一张停', de: 'Horizontal cards snap one at a time',
      pz: 'scroll-snap-align:start + 首尾 scroll-padding 做透出。', pe: 'scroll-snap-align:start with scroll-padding for peeking.',
      demo: 'cards', css: `.fxrow{width:min(520px,86%);overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:10px}.fx{flex:none;scroll-snap-align:start}` },

    { id: 'accordionlist', zh: '互斥折叠', en: 'Accordion list', dz: '打开一项自动关掉另一项', de: 'Opening one closes the other',
      pz: '两段动画共用时长，收起 ease-in、展开 ease-out。', pe: 'Shared duration; ease-in to close, ease-out to open.',
      demo: 'list', css: `@keyframes fxa{0%,45%{height:120px}55%,100%{height:52px}}@keyframes fxb{0%,45%{height:52px}55%,100%{height:120px}}.fx:nth-child(1){align-items:flex-start;padding-top:16px;animation:fxa 3.2s ${E} infinite alternate}.fx:nth-child(4){align-items:flex-start;padding-top:16px;animation:fxb 3.2s ${E} infinite alternate}` },

    { id: 'infinite', zh: '无限滚动补位', en: 'Infinite scroll', dz: '滚到底自动追加下一批', de: 'More items append at the bottom',
      pz: '底部放哨兵元素，进入视口就加载；先渲染骨架再替换。', pe: 'A sentinel at the bottom triggers the fetch; render skeletons first.',
      demo: 'list', css: `@keyframes fxk{0%,60%{opacity:.35;transform:translateY(10px)}100%{opacity:1;transform:none}}.fx:nth-child(5),.fx:nth-child(6){animation:fxk 1.8s ${E} infinite alternate}.fx:nth-child(6){animation-delay:.2s}` },

    { id: 'selectmulti', zh: '多选批量条', en: 'Multi-select bar', dz: '选中后底部弹出批量操作条', de: 'A batch action bar rises when rows are selected',
      pz: '选中行加左侧色条与浅底，底部条 translateY 弹入。', pe: 'Tint selected rows; slide the action bar up from the bottom.',
      demo: 'list', css: `@keyframes fxk{0%,30%{transform:translateY(70px);opacity:0}60%,100%{transform:none;opacity:1}}.fxcol{position:relative;padding-bottom:56px}.fx:nth-child(2),.fx:nth-child(3){background:#eaf1e5;border-color:#4d8ba6}.fxcol::after{content:'';position:absolute;left:0;right:0;bottom:0;height:46px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);border-radius:10px;animation:fxk 2.6s ${E} infinite alternate}` },

    { id: 'timelinegroup', zh: '时间分组', en: 'Time grouping', dz: '按今天/昨天分段', de: 'Grouped by today / yesterday',
      pz: '分组标题用小号大写 + 字距，行之间不加分割线。', pe: 'Small uppercase group labels with tracking; no rules between rows.',
      demo: 'list', css: `.fx:nth-child(1),.fx:nth-child(4){height:26px;background:none;border:0;font-size:11px;letter-spacing:.12em;color:#9a9ca6;padding-left:2px}.fx:nth-child(1) i,.fx:nth-child(4) i{display:none}.fx:nth-child(1) u,.fx:nth-child(4) u{max-width:70px;background:#e2e4e8}` },

    { id: 'pinrow', zh: '置顶行', en: 'Pinned row', dz: '置顶项永远在最上并带标记', de: 'Pinned items stay on top with a marker',
      pz: '置顶行加轻微底色与图标，与普通行有 8px 额外间距。', pe: 'Tint pinned rows, add an icon and 8px extra spacing.',
      demo: 'list', css: `.fx:first-child{background:#fdf1f3;border-color:#f4c3ce;margin-bottom:8px}.fx:first-child i{background:#e8879c}` },

    { id: 'countbadge', zh: '数量角标变化', en: 'Count badge change', dz: '数字变化时角标弹一下', de: 'The badge pops when its number changes',
      pz: '数值变化触发一次 scale 过冲，别用闪烁。', pe: 'One scale overshoot per change — no blinking.',
      demo: 'list', css: `@keyframes fxk{0%,70%{transform:scale(1)}80%{transform:scale(1.35)}100%{transform:scale(1)}}.fx i{border-radius:50%;background:#e8879c;animation:fxk 2s ${E} infinite;animation-delay:calc(var(--i)*200ms)}` }
  ]
};
