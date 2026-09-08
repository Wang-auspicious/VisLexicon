const E = 'cubic-bezier(.22,1,.36,1)';
const LOOP = (dur) => `${dur} ${E} infinite alternate`;

export default {
  id: 'transition', zh: '页面与视图转场', en: 'Page & view transitions',
  dz: '从一屏到另一屏之间发生了什么', de: 'What happens between one screen and the next',
  items: [
    { id: 'crossfade', zh: '交叉淡化', en: 'Crossfade', dz: 'A 淡出的同时 B 淡入', de: 'A fades out while B fades in',
      pz: '用 View Transitions API 的默认过渡即可，200–300ms。', pe: 'The default View Transitions cross-fade, 200–300ms.',
      demo: 'panel', css: `@keyframes fxb{from{opacity:0}to{opacity:1}}.fxb{animation:fxb ${LOOP('1.4s')}}` },

    { id: 'slideover', zh: '覆盖滑入', en: 'Slide over', dz: 'B 从右侧盖在 A 上面', de: 'B slides in on top of A',
      pz: '新页 translateX(100%)→0，旧页不动，加一层暗色遮罩。', pe: 'New view translateX(100%)→0 over a static old view plus a scrim.',
      demo: 'panel', css: `@keyframes fxb{from{transform:translateX(100%)}to{transform:none}}.fxb{box-shadow:-20px 0 40px rgba(0,0,0,.2);animation:fxb ${LOOP('1.4s')}}` },

    { id: 'push', zh: '推挤转场', en: 'Push', dz: 'B 把 A 推出屏幕', de: 'B pushes A off screen',
      pz: '两页同速同向位移 100%，像胶片一样连着走。', pe: 'Both views translate 100% at the same speed, like film frames.',
      demo: 'panel', css: `@keyframes fxa{from{transform:none}to{transform:translateX(-100%)}}@keyframes fxb{from{transform:translateX(100%)}to{transform:none}}.fxa{animation:fxa ${LOOP('1.4s')}}.fxb{animation:fxb ${LOOP('1.4s')}}` },

    { id: 'iospush', zh: 'iOS 层级推进', en: 'iOS stack push', dz: '旧页轻微后退，新页盖上', de: 'The old view recedes as the new one covers it',
      pz: '旧页 translateX(-30%) + 变暗，新页 translateX(100%)→0。', pe: 'Old view translateX(-30%) and dims; new view slides fully in.',
      demo: 'panel', css: `@keyframes fxa{from{transform:none;filter:none}to{transform:translateX(-28%);filter:brightness(.72)}}@keyframes fxb{from{transform:translateX(100%)}to{transform:none}}.fxa{animation:fxa ${LOOP('1.5s')}}.fxb{animation:fxb ${LOOP('1.5s')}}` },

    { id: 'cover', zh: '揭幕转场', en: 'Reveal (uncover)', dz: 'A 滑走，露出下面的 B', de: 'A slides away to uncover B',
      pz: 'B 固定在底层，A 位移出画，注意 z-index。', pe: 'B sits underneath; A translates out. Mind the z-index.',
      demo: 'panel', css: `@keyframes fxa{from{transform:none}to{transform:translateY(-100%)}}.fxa{z-index:2;animation:fxa ${LOOP('1.4s')}}` },

    { id: 'shared', zh: '共享元素转场', en: 'Shared element', dz: '同一个元素跨页连续移动', de: 'One element carries across both views',
      pz: 'View Transitions 里给两侧同名 view-transition-name。', pe: 'Give both sides the same view-transition-name.',
      demo: 'panel', css: `@keyframes fxs{0%{left:24px;top:24px;width:80px;height:60px;border-radius:8px}100%{left:0;top:0;width:100%;height:150px;border-radius:0}}.fxa::after{content:'';position:absolute;background:#e8879c;animation:fxs ${LOOP('1.6s')}}` },

    { id: 'zoomin', zh: '放大进入详情', en: 'Zoom into card', dz: '点哪张卡就从哪张放大进去', de: 'The tapped card expands into the detail view',
      pz: '以点击点为 transform-origin 做 scale + 淡入。', pe: 'scale and fade with transform-origin at the click point.',
      demo: 'panel', css: `@keyframes fxb{from{transform:scale(.25);opacity:0;border-radius:24px}to{transform:none;opacity:1;border-radius:0}}.fxb{transform-origin:22% 78%;animation:fxb ${LOOP('1.5s')}}` },

    { id: 'irisview', zh: '圆形扩散转场', en: 'Circle expand', dz: '从点击处圆形扩开新页', de: 'The new view opens as a circle from the tap',
      pz: 'clip-path:circle(0 at 点击点)→circle(150%)。', pe: 'clip-path circle(0 at click) → circle(150%).',
      demo: 'panel', css: `@keyframes fxb{from{clip-path:circle(0 at 78% 82%)}to{clip-path:circle(150% at 78% 82%)}}.fxb{animation:fxb ${LOOP('1.5s')}}` },

    { id: 'curtainsplit', zh: '对开幕布', en: 'Curtain split', dz: '画面从中间分开露出新页', de: 'The old view parts down the middle',
      pz: 'A 用两半 clip-path 向两侧移出。', pe: 'Clip A into two halves and move them apart.',
      demo: 'panel', css: `@keyframes fxa{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(0 50% 0 50%);opacity:.4}}.fxa{z-index:2;animation:fxa ${LOOP('1.4s')}}` },

    { id: 'wipe', zh: '斜线擦除', en: 'Diagonal wipe', dz: '一道斜线扫过换页', de: 'A diagonal edge sweeps the page over',
      pz: '用带角度的 clip-path polygon 做扫除。', pe: 'An angled clip-path polygon does the wipe.',
      demo: 'panel', css: `@keyframes fxb{from{clip-path:polygon(0 0,0 0,-30% 100%,-30% 100%)}to{clip-path:polygon(0 0,130% 0,100% 100%,0 100%)}}.fxb{animation:fxb ${LOOP('1.4s')}}` },

    { id: 'flipview', zh: '整页翻转', en: 'Page flip', dz: '像卡片一样翻到背面', de: 'The whole view flips like a card',
      pz: '容器 perspective，A/B 分别 rotateY 0/180 并隐藏背面。', pe: 'Perspective on the wrapper; A and B at rotateY 0/180 with hidden backfaces.',
      demo: 'panel', css: `@keyframes fxs{from{transform:rotateY(0)}to{transform:rotateY(180deg)}}.fxstack{perspective:1200px}.fxa,.fxb{backface-visibility:hidden}.fxb{transform:rotateY(180deg)}.fxstack{animation:fxs ${LOOP('1.8s')};transform-style:preserve-3d}` },

    { id: 'modal', zh: '弹窗浮起', en: 'Dialog scale-fade', dz: '弹窗从 96% 放大浮现', de: 'The dialog scales up from 96%',
      pz: '遮罩淡入 + 弹窗 scale(.96)→1，退出更快。', pe: 'Scrim fades in; dialog scale(.96)→1. Exit faster than enter.',
      demo: 'panel', css: `@keyframes fxb{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}.fxb{inset:40px;border-radius:16px;box-shadow:0 30px 70px rgba(0,0,0,.35);animation:fxb ${LOOP('1.2s')}}.fxa{background:#e9eaee}` },

    { id: 'bottomsheet', zh: '底部弹层', en: 'Bottom sheet', dz: '从底部拉起的半屏面板', de: 'A half-height panel pulled up from the bottom',
      pz: 'translateY(100%)→0，支持拖拽回落与惯性。', pe: 'translateY(100%)→0, with drag-to-dismiss and momentum.',
      demo: 'panel', css: `@keyframes fxb{from{transform:translateY(100%)}to{transform:translateY(35%)}}.fxb{border-radius:20px 20px 0 0;animation:fxb ${LOOP('1.4s')}}` },

    { id: 'tabslide', zh: '标签下划线滑动', en: 'Tab indicator slide', dz: '下划线滑到新标签', de: 'The indicator slides to the new tab',
      pz: '一个共享指示条，用 transform 移动到目标 tab 的位置和宽度。', pe: 'One shared bar, moved and resized with transform to the active tab.',
      demo: 'panel', css: `@keyframes fxs{from{transform:translateX(0);width:110px}to{transform:translateX(150px);width:150px}}.fxa::after{content:'';position:absolute;bottom:0;left:40px;height:4px;background:#e8879c;border-radius:2px;animation:fxs ${LOOP('1.2s')}}` },

    { id: 'tabfade', zh: '标签内容交替', en: 'Tab content crossfade', dz: '内容换的同时轻微上移', de: 'Panels cross-fade with a small rise',
      pz: '旧内容 fade+下移出，新内容 fade+上移入，错开 60ms。', pe: 'Old panel fades down and out, new one rises in, offset by 60ms.',
      demo: 'panel', css: `@keyframes fxb{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes fxa{from{opacity:1}to{opacity:0}}.fxb{animation:fxb ${LOOP('1.2s')}}.fxa{animation:fxa ${LOOP('1.2s')}}` },

    { id: 'wizard', zh: '分步流程滑动', en: 'Wizard step slide', dz: '下一步从右进，上一步从左回', de: 'Next slides in from the right, back returns from the left',
      pz: '记录方向，正反向用同一套动画传入 direction 参数。', pe: 'Track direction and feed it into one shared animation.',
      demo: 'panel', css: `@keyframes fxb{0%{transform:translateX(60%);opacity:0}100%{transform:none;opacity:1}}.fxb{animation:fxb ${LOOP('1.2s')}}` },

    { id: 'routefade', zh: '路由淡入上移', en: 'Route fade up', dz: '换页时轻轻上抬淡入', de: 'Routes fade up gently',
      pz: '页面级过渡 300–360ms，位移别超过 16px。', pe: 'Page-level 300–360ms, travel under 16px.',
      demo: 'panel', css: `@keyframes fxb{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}.fxb{animation:fxb ${LOOP('1.2s')}}` },

    { id: 'colorbridge', zh: '色块中转', en: 'Color bridge', dz: '中间闪过一块品牌色再进新页', de: 'A brand-color panel bridges the two views',
      pz: '色块从下方覆盖再撤走，两段动画之间切换路由。', pe: 'A panel covers, the route swaps behind it, then it leaves.',
      demo: 'panel', css: `@keyframes fxb{0%{transform:translateY(100%)}45%,55%{transform:none}100%{transform:translateY(-100%)}}.fxb{background:#e8879c;animation:fxb 1.8s ${E} infinite}` },

    { id: 'listdetail', zh: '列表展开为详情', en: 'List row to detail', dz: '点击的行原地长成整页', de: 'The tapped row grows into the full page',
      pz: '行的 rect 作为起点，FLIP 到详情页的 rect。', pe: 'Use the row rect as the FLIP origin for the detail page.',
      demo: 'panel', css: `@keyframes fxb{from{transform:translateY(90px) scaleY(.18);opacity:.4;border-radius:12px}to{transform:none;opacity:1;border-radius:0}}.fxb{transform-origin:top;animation:fxb ${LOOP('1.5s')}}` },

    { id: 'stackswipe', zh: '卡片堆滑走', en: 'Card deck swipe', dz: '当前卡甩出，下一张顶上来', de: 'The top card flies out and the next steps up',
      pz: '甩出用 translateX + rotate，下层卡 scale 从 .94 到 1。', pe: 'Fling with translateX + rotate; the card below scales .94 → 1.',
      demo: 'panel', css: `@keyframes fxa{0%{transform:none;opacity:1}100%{transform:translateX(120%) rotate(14deg);opacity:0}}@keyframes fxb{0%{transform:scale(.92)}100%{transform:none}}.fxa{z-index:2;border-radius:16px;animation:fxa ${LOOP('1.5s')}}.fxb{border-radius:16px;animation:fxb ${LOOP('1.5s')}}` },

    { id: 'accordionview', zh: '面板互斥展开', en: 'Panels swap open', dz: '一个收起、另一个同时展开', de: 'One collapses exactly as the other opens',
      pz: '两段动画共用时长，收起用 ease-in、展开用 ease-out。', pe: 'Shared duration; ease-in on the collapse, ease-out on the open.',
      demo: 'panel', css: `@keyframes fxa{from{height:100%}to{height:30%}}@keyframes fxb{from{height:0%}to{height:70%}}.fxa{top:0;bottom:auto;animation:fxa ${LOOP('1.3s')}}.fxb{top:auto;bottom:0;height:0;animation:fxb ${LOOP('1.3s')}}` },

    { id: 'blurswap', zh: '虚化换页', en: 'Blur swap', dz: '旧页虚掉，新页对焦', de: 'The old view blurs out, the new one focuses',
      pz: 'A blur+scale 放大淡出，B blur→0 缩回，营造纵深。', pe: 'A blurs and scales up out; B focuses and scales down in.',
      demo: 'panel', css: `@keyframes fxa{from{filter:none;transform:none;opacity:1}to{filter:blur(14px);transform:scale(1.1);opacity:0}}@keyframes fxb{from{filter:blur(14px);transform:scale(.94);opacity:0}to{filter:none;transform:none;opacity:1}}.fxa{animation:fxa ${LOOP('1.4s')}}.fxb{animation:fxb ${LOOP('1.4s')}}` },

    { id: 'splitopen', zh: '双开门', en: 'Split doors', dz: '上下两块向外拉开', de: 'Two halves pull apart top and bottom',
      pz: '两个覆盖层分别向上下移出，中间露出内容。', pe: 'Two covers move out vertically, exposing the content.',
      demo: 'panel', css: `@keyframes fxa{from{clip-path:inset(0)}to{clip-path:inset(0 0 100% 0)}}.fxa{z-index:2;animation:fxa ${LOOP('1.4s')}}` },

    { id: 'peel', zh: '层叠后退', en: 'Stack recede', dz: '旧页缩小退到后面', de: 'The old view shrinks back into depth',
      pz: 'A scale(.9)+圆角+变暗，B 从底部升起。', pe: 'A scales to .9 with rounded corners and dims; B rises from below.',
      demo: 'panel', css: `@keyframes fxa{from{transform:none;border-radius:0}to{transform:scale(.88) translateY(-16px);border-radius:16px;filter:brightness(.8)}}@keyframes fxb{from{transform:translateY(100%)}to{transform:translateY(18%)}}.fxa{animation:fxa ${LOOP('1.5s')}}.fxb{border-radius:18px 18px 0 0;animation:fxb ${LOOP('1.5s')}}` },

    { id: 'loadbridge', zh: '加载中转', en: 'Loading bridge', dz: '换页时先出骨架再填内容', de: 'A skeleton bridges the wait before content lands',
      pz: '路由切换先渲染 skeleton，数据到位后交叉淡入。', pe: 'Render the skeleton on navigation, cross-fade when data lands.',
      demo: 'panel', css: `@keyframes fxsk{0%,45%{opacity:1}55%,100%{opacity:0}}@keyframes fxb{0%,45%{opacity:0}55%,100%{opacity:1}}.fxa{background:repeating-linear-gradient(#eceef1 0 20px,#fff 20px 34px);animation:fxsk 2.4s linear infinite alternate}.fxb{animation:fxb 2.4s linear infinite alternate}` }
  ]
};
