// 无障碍：不是"加个 aria"，而是一套可验收的交互契约
const E = 'cubic-bezier(.22,1,.36,1)';
const I = (id, zh, en, dz, de, pz, pe, demo, css, params) => ({ id, zh, en, dz, de, pz, pe, demo, css, params });

export default {
  id: 'a11y', zh: '无障碍', en: 'Accessibility',
  dz: '焦点、播报、对比、命中区、减弱动效——每条都能被验收，不是"加个 aria" 就完事',
  de: 'Focus, announcements, contrast, target size, reduced motion — each one testable, not just "add an aria attribute"',
  items: [
    I('focusring', '焦点环', 'Focus ring', '键盘走到哪，哪里有一圈', 'Wherever the keyboard lands, a ring appears',
      '2px 实心外环 + 2px 偏移，颜色要在深浅底上都够；绝不 outline:none 而不给替代。',
      'A 2px solid ring with a 2px offset, legible on light and dark. Never outline:none without a replacement.',
      'pill', `@keyframes fxk{0%,45%{outline-color:transparent;outline-offset:0}55%,100%{outline-color:#23232f;outline-offset:2px}}.fx:nth-child(2){outline:2px solid transparent;animation:fxk 2.6s steps(1,end) infinite}`),

    I('focusvisible', ':focus-visible 分流', 'focus-visible', '鼠标点不显环，键盘走才显', 'Mouse clicks show no ring; keyboard does',
      '交互样式挂 :focus-visible，:focus 只留作兜底；不要为了"好看"全局关掉。',
      'Style :focus-visible and keep :focus as a fallback. Never disable it globally for looks.',
      'pill', `@keyframes fxk{0%,40%{box-shadow:none}50%,100%{box-shadow:0 0 0 2px #fff,0 0 0 4px #3f6f92}}.fx:nth-child(3){animation:fxk 3s steps(1,end) infinite}`),

    I('focustrap', '焦点陷阱', 'Focus trap', '模态打开后 Tab 走不出去', 'Tab cannot escape an open modal',
      '循环首尾可聚焦元素，Esc 关闭；背景内容加 inert，不只是 aria-hidden。',
      'Cycle the first and last focusable nodes, Esc closes, and mark the background inert — not just aria-hidden.',
      'panel', `@keyframes fxk{0%,100%{transform:translateY(0)}25%{transform:translateY(26px)}50%{transform:translateY(52px)}75%{transform:translateY(0)}}.fxa{background:#f4f5f1;color:#8b8d84}.fxb{inset:16% 14%;border-radius:12px;background:#fff;color:#23232f;box-shadow:0 20px 44px -20px rgba(48,80,104,.4)}.fxb::after{content:'';position:absolute;left:14%;top:24%;width:34%;height:22px;border-radius:6px;outline:2px solid #3f6f92;outline-offset:2px;animation:fxk 3.6s steps(1,end) infinite}`),

    I('focusreturn', '焦点归还', 'Focus return', '关掉浮层后焦点回到原来那个按钮', 'Closing an overlay returns focus to its trigger',
      '打开前存住 document.activeElement，关闭后 focus() 回去；否则键盘用户直接被扔回页首。',
      'Store document.activeElement before opening and focus() it back on close, or keyboard users are dumped at the top.',
      'nav', `@keyframes fxk{0%,45%{box-shadow:0 0 0 2px #3f6f92}50%,100%{box-shadow:none}}.fx:nth-child(2){animation:fxk 3s steps(1,end) infinite}.fx:nth-child(4){animation:fxk 3s steps(1,end) infinite;animation-delay:1.5s}`),

    I('skiplink', '跳过导航', 'Skip link', '第一个 Tab 出现"跳到正文"', 'The first Tab reveals "skip to content"',
      '视觉隐藏但可聚焦，聚焦时滑出；目标容器要有 tabindex="-1"。',
      'Visually hidden but focusable; it slides in on focus. Give the target container tabindex="-1".',
      'list', `@keyframes fxk{0%,40%{transform:translateY(-120%);opacity:0}50%,90%{transform:none;opacity:1}100%{transform:translateY(-120%);opacity:0}}.fxcol{position:relative;padding-top:8px}.fxcol::before{content:'\u8df3\u5230\u6b63\u6587';position:absolute;left:0;top:-34px;padding:8px 14px;border-radius:8px;background:#23232f;color:#fff;font:600 12px/1 var(--fx-sans,system-ui);animation:fxk 4s ${E} infinite}`),

    I('roving', '游标式 tabindex', 'Roving tabindex', '一组控件只占一个 Tab 位', 'A whole group takes one Tab stop',
      '组内只有一个 tabindex="0"，其余 -1，方向键在组内移动；工具栏、单选组、日历必用。',
      'One tabindex="0" inside the group, the rest -1, arrows move within. Mandatory for toolbars, radio groups, calendars.',
      'nav', `@keyframes fxk{0%,100%{left:7px}25%{left:79px}50%{left:151px}75%{left:223px}}.fxnav{position:relative}.fxnav::after{content:'';position:absolute;top:7px;height:32px;width:64px;border-radius:8px;outline:2px solid #3f6f92;outline-offset:1px;animation:fxk 4.4s steps(1,end) infinite}`),

    I('taborder', '阅读顺序 = DOM 顺序', 'Reading order', '看起来在左边，Tab 却最后到', 'It looks first but Tab reaches it last',
      'flex order / grid 定位 / 绝对定位都会把视觉顺序和 DOM 顺序拆开；用 DOM 顺序对齐视觉，别用正 tabindex 打补丁。',
      'order, grid placement and absolute positioning split visual from DOM order. Fix the DOM — never patch with positive tabindex.',
      'grid', `@keyframes fxk{0%,100%{outline-color:#3f6f92}50%{outline-color:transparent}}.fxgrid{grid-template-columns:repeat(3,92px)}.fx{display:flex;align-items:center;justify-content:center;font:600 13px var(--fx-mono,monospace);color:#9b9d92}.fx:nth-child(1)::after{content:'1'}.fx:nth-child(2)::after{content:'5'}.fx:nth-child(3)::after{content:'2'}.fx:nth-child(4)::after{content:'9'}.fx:nth-child(5)::after{content:'3'}.fx:nth-child(6)::after{content:'7'}.fx:nth-child(7)::after{content:'4'}.fx:nth-child(8)::after{content:'8'}.fx:nth-child(9)::after{content:'6'}.fx:nth-child(2){outline:2px solid #3f6f92;outline-offset:2px;animation:fxk 1.8s steps(1,end) infinite}`),

    I('sronly', '仅读屏可见', 'Screen-reader only', '屏幕上看不见，读屏能读到', 'Invisible on screen, present to a reader',
      '1px 裁切 + clip-path，不用 display:none 也不用 visibility:hidden（那两个读屏也读不到）。',
      'A 1px clipped box — never display:none or visibility:hidden, which hide it from readers too.',
      'card', `.fx>b{background:#eceef1}.fx>u{width:58%}.fx::after{content:'sr-only: \u5220\u9664\u201c\u5b63\u5ea6\u62a5\u544a\u201d';display:block;margin-top:10px;padding:6px 9px;border:1px dashed #c9cbc0;border-radius:6px;font:400 11px var(--fx-mono,monospace);color:#9b9d92}`),

    I('liveregion', '实时区域播报', 'Live region', '内容变了要说一声', 'Say it out loud when content changes',
      'aria-live 容器必须在变更前就存在于 DOM；文本要完整成句，不要只播报数字。',
      'The aria-live container must exist in the DOM before the change. Announce a whole sentence, not a bare number.',
      'chat', `@keyframes fxk{0%,30%{opacity:0;transform:translateY(6px)}40%,90%{opacity:1;transform:none}100%{opacity:0}}.fx:nth-child(3){background:#eef4f8;color:#23232f;align-self:flex-start;animation:fxk 4s ${E} infinite}`),

    I('politeassert', 'polite 与 assertive', 'polite vs assertive', '插话还是排队', 'Interrupt, or wait your turn',
      '状态更新用 polite（排队），只有错误与危险用 assertive（打断）；滥用 assertive 等于一直喊。',
      'Status updates are polite (queued); only errors and danger are assertive (interrupting). Overusing assertive means shouting.',
      'list', `.fxcol{width:min(400px,88%)}.fx:nth-child(odd){border-left:0}.fx:nth-child(1)::after{content:'polite \u00b7 \u5df2\u4fdd\u5b58';font:500 11px var(--fx-mono,monospace);color:#4d8ba6}.fx:nth-child(2)::after{content:'assertive \u00b7 \u4fdd\u5b58\u5931\u8d25';font:500 11px var(--fx-mono,monospace);color:#e8879c}.fx>u{display:none}`),

    I('labelfor', '标签绑定', 'Label association', '点标签能聚焦到输入框', 'Clicking the label focuses the field',
      'label[for] 对应 input[id]，或把 input 包进 label；placeholder 永远不能当标签用。',
      'label[for] matched to input[id], or wrap the input in the label. A placeholder is never a label.',
      'field', `@keyframes fxk{0%,49%{opacity:1}50%,100%{opacity:0}}.fxfield{position:relative;padding-top:22px}.fxfield::before{content:'\u90ae\u7bb1\u5730\u5740';position:absolute;top:0;left:0;font:500 12px var(--fx-sans,system-ui);color:#65675f}.fx{color:#23232f}.fx>u{animation:fxk 1.1s steps(1,end) infinite}`),

    I('namerole', '名称·角色·值', 'Name, role, value', '每个控件都要能被这三样描述', 'Every control needs all three',
      '可访问名称来自 label / aria-label / 内容；角色来自语义标签优先；值用 aria-valuenow 之类。缺一个就等于不可用。',
      'The name comes from a label or content, the role from a semantic element first, the value from aria-value*. Missing one makes it unusable.',
      'sw', `.fxsw{position:relative}.fx{background:#d9dbe0}.fx:nth-child(1)::after{content:'switch \u00b7 \u90ae\u4ef6\u901a\u77e5 \u00b7 off';position:absolute;left:66px;white-space:nowrap;font:500 11px var(--fx-mono,monospace);color:#9b9d92;line-height:30px}.fx:nth-child(2){background:#4d8ba6}.fx:nth-child(2)>b{left:27px}.fx:nth-child(2)::after{content:'switch \u00b7 \u90ae\u4ef6\u901a\u77e5 \u00b7 on';position:absolute;left:66px;white-space:nowrap;font:500 11px var(--fx-mono,monospace);color:#4d8ba6;line-height:30px}.fx:nth-child(3){opacity:.35}.fx:nth-child(3)::after{content:'\u2717 \u65e0\u540d\u79f0';position:absolute;left:66px;white-space:nowrap;font:500 11px var(--fx-mono,monospace);color:#e8879c;line-height:30px}`),

    I('landmark', '地标区域', 'Landmarks', '读屏用户靠它跳章节', 'Readers jump between them',
      'header / nav / main / aside / footer 各一个，main 只能有一个；多个同类要加 aria-label 区分。',
      'One each of header, nav, main, aside, footer — exactly one main. Label duplicates to tell them apart.',
      'page', `.fxpage{width:min(520px,94%)}.fxbar::after{content:'header';flex:none;max-width:none;margin-left:12px;height:auto;border:0;background:none;font:500 9px var(--fx-mono,monospace);color:#9b9d92}.fxnav2{color:#4d8ba6}.fxhead{font-size:20px}.fxart{background:#f4f5f1;position:relative}.fxart::after{content:'aside';position:absolute;left:12px;top:12px;font:500 9px var(--fx-mono,monospace);color:#9b9d92}`),

    I('headingorder', '标题层级', 'Heading order', 'h1 到 h6 不能跳级', 'No skipped heading levels',
      '一页一个 h1，往下不跳级；标题大小是视觉决定，层级是结构决定，两件事分开。',
      'One h1 per page and no level skipping. Size is a visual decision, level is a structural one — keep them separate.',
      'list', `.fxcol{width:min(400px,88%);gap:6px}.fx{height:auto;padding:9px 14px;border:0;background:transparent;font-family:var(--fx-mono,monospace)}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'h1 \u9875\u9762\u6807\u9898';font-size:15px;font-weight:700;color:#23232f}.fx:nth-child(2)::after{content:'\u00a0\u00a0h2 \u4e00\u7ea7\u5c0f\u8282';font-size:13px;color:#3f6f92}.fx:nth-child(3)::after{content:'\u00a0\u00a0\u00a0\u00a0h3 \u4e8c\u7ea7';font-size:12px;color:#65675f}.fx:nth-child(4)::after{content:'\u00a0\u00a0h2 \u4e0b\u4e00\u8282';font-size:13px;color:#3f6f92}.fx:nth-child(5)::after{content:'\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0h5 \u2717 \u8df3\u7ea7';font-size:11px;color:#e8879c}.fx:nth-child(6){display:none}`),

    I('altdecide', '替代文本决策', 'Alt text decisions', '有信息就写，纯装饰就留空', 'Informative gets text, decorative gets empty',
      '装饰图 alt=""，信息图写清"说了什么"而不是"画了什么"，图表要在正文给出数据。',
      'Decorative images get alt="", informative ones say what it means (not what it depicts), and charts need the data in prose.',
      'cards', `.fx>b{background:linear-gradient(140deg,#e9eef2,#dde6ec)}.fx:nth-child(1)::after{content:'alt="" \u88c5\u9970';font:500 11px var(--fx-mono,monospace);color:#9b9d92}.fx:nth-child(2)::after{content:'alt="\u4e09\u540d\u519c\u6237\u5728\u6d4b\u91cf\u80f8\u5f84"';font:500 10px var(--fx-mono,monospace);color:#4d8ba6}.fx:nth-child(3)::after{content:'alt="\u56fe\u7247" \u2717';font:500 11px var(--fx-mono,monospace);color:#e8879c}`),

    I('captions', '字幕与文字稿', 'Captions & transcripts', '有声音就要有字', 'If it makes sound, it needs text',
      '字幕含说话人与关键音效，位置避开画面下方 UI；长视频再另配可搜索文字稿。',
      'Captions carry speaker labels and key sound effects, placed clear of bottom UI. Long video also needs a searchable transcript.',
      'media', `@keyframes fxk{0%,30%{opacity:0}40%,90%{opacity:1}100%{opacity:0}}.fx::after{content:'[\u65c1\u767d] \u96e8\u5b63\u521a\u8fc7\uff0c\u6797\u5b50\u91cc\u5f88\u5b89\u9759\u3002';position:absolute;left:8%;right:8%;bottom:12%;padding:6px 10px;border-radius:6px;background:rgba(20,26,34,.82);color:#fff;font:500 11px/1.5 var(--fx-sans,system-ui);text-align:center;animation:fxk 5s ${E} infinite}`),

    I('audiodesc', '音频描述', 'Audio description', '把画面里的信息念出来', 'Narrate what only the picture says',
      '给纯视觉信息（表情、图表、文字卡）配一条描述音轨或扩展描述版本。',
      'Add a description track — or an extended-description cut — for information carried only by the image.',
      'media', `.fx::before{content:'AD';position:absolute;right:10px;top:10px;padding:3px 7px;border-radius:4px;background:#23232f;color:#fff;font:700 10px var(--fx-mono,monospace);z-index:2}`),

    I('contrast', '文字对比度', 'Text contrast', '正文 4.5:1，大字 3:1', '4.5:1 for body, 3:1 for large',
      '算的是文字与其"真实背景"的比；半透明文字、图上文字、渐变上文字都要按最差点算。',
      'Measure against the real backdrop. Alpha text, text on photos and text on gradients are all judged at the worst point.',
      'cards', `.fx{justify-content:center;text-align:center;font-size:12px}.fx>b{display:none}.fx:nth-child(1){background:#23232f;color:#fff}.fx:nth-child(1)::after{content:'16.1:1 \u2713'}.fx:nth-child(2){background:#4d8ba6;color:#fff}.fx:nth-child(2)::after{content:'3.4:1 \u2014 \u4ec5\u5927\u5b57'}.fx:nth-child(3){background:#eceef1;color:#b6b8b0}.fx:nth-child(3)::after{content:'1.6:1 \u2717'}`),

    I('nontextcontrast', '非文字对比度', 'Non-text contrast', '边框和图标也要够', 'Borders and icons need it too',
      '输入框边框、开关轨道、图标、焦点环对相邻色至少 3:1；"极淡的灰线"是最常见的失败点。',
      'Field borders, switch tracks, icons and focus rings need 3:1 against neighbours. Hairline greys are the usual failure.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:12px}.fx{border-color:#8b8d84}.fx::after{content:'\u8fb9\u6846 3.2:1 \u2713';margin-left:auto;font:500 11px var(--fx-mono,monospace);color:#4d8ba6}`),

    I('colorblind', '色觉友好', 'Colour-vision safe', '红绿色盲看不出你的"红涨绿跌"', 'Red-green cannot read your up-down colours',
      '成对色改用蓝橙轴，或在色相之外再加明度差、形状、标签；用模拟器验收三种类型。',
      'Swap red-green pairs for a blue-orange axis, and add a lightness, shape or label difference. Verify with a simulator.',
      'chart', `.fx{background:#3f6f92}.fx:nth-child(even){background:#e5a68f}.fx:nth-child(3n){background:#3f6f92;background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.5) 0 3px,transparent 3px 7px)}`),

    I('coloralone', '不只靠颜色', 'Never colour alone', '把颜色遮掉还看得懂吗', 'Would it still read in greyscale?',
      '状态、必填、错误、图例都要有第二编码：图标、下划线、文案、纹理。',
      'States, required marks, errors and legends need a second encoding: an icon, an underline, a word, a texture.',
      'list', `.fxcol{width:min(400px,88%)}.fx>u{display:none}.fx:nth-child(1)::after{content:'\u2713 \u5df2\u901a\u8fc7';color:#3f6f92;font-weight:600}.fx:nth-child(2)::after{content:'\u26a0 \u5f85\u5904\u7406';color:#c07a3a;font-weight:600}.fx:nth-child(3)::after{content:'\u2717 \u5df2\u62d2\u7edd';color:#c04a63;font-weight:600}.fx:nth-child(n+4){display:none}`),

    I('targetsize', '命中区尺寸', 'Target size', '视觉可以小，命中区不能小', 'It can look small; it cannot be small',
      '移动端 44×44px、桌面 24×24px 起；用 padding 或伪元素撑开命中区，不要放大图标本身。',
      'From 44×44px on touch, 24×24px on desktop. Grow the hit area with padding or a pseudo-element, not the icon.',
      'pill', `.fxpill{gap:6px}.fx{position:relative;padding:6px 10px;font-size:12px}.fx::after{content:'';position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border:1px dashed #b9c9d4;border-radius:8px}`),

    I('spacingtarget', '目标间距', 'Target spacing', '两个小按钮之间要留手指的余量', 'Leave room for a fingertip between them',
      '命中区不足时，相邻目标中心距至少 44px；密集图标行是最容易误触的地方。',
      'When targets are undersized, keep 44px between centres. Dense icon rows are where mis-taps happen.',
      'loader', `.fxload{gap:28px}.fx{width:26px;height:26px;border-radius:8px;background:#eceef1;position:relative}.fx::after{content:'';position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border:1px dashed #b9c9d4;border-radius:10px}`),

    I('reducedmotion', '减弱动效', 'Reduced motion', '有人一看视差就晕', 'Parallax makes some people ill',
      'prefers-reduced-motion:reduce 时去掉视差、缩放、旋转、自动轮播，保留淡入与瞬时状态变化。',
      'Under prefers-reduced-motion, drop parallax, scale, rotation and autoplay — keep fades and instant state changes.',
      'box', `@keyframes fxk{0%,100%{transform:none}50%{transform:translateX(34px) rotate(8deg) scale(1.08)}}.fx{animation:fxk 3.2s ${E} infinite}@media (prefers-reduced-motion:reduce){.fx{animation:none}}`),

    I('reducedtransparency', '减弱透明', 'Reduced transparency', '毛玻璃对某些人就是一团糊', 'Frosted glass reads as mud to some',
      'prefers-reduced-transparency 时把半透明面板换成实色，去掉 backdrop-filter。',
      'Under prefers-reduced-transparency, swap translucent panels for solid fills and drop backdrop-filter.',
      'panel', `.fxa{background:linear-gradient(150deg,#6ba9bd,#3f6f92)}.fxb{background:rgba(255,255,255,.34);backdrop-filter:blur(8px);color:#1f2b36;inset:18%;border-radius:12px;border:1px solid rgba(255,255,255,.6)}@media (prefers-reduced-transparency:reduce){.fxb{background:#fff;backdrop-filter:none}}`),

    I('forcedcolors', '强制颜色模式', 'Forced colors', 'Windows 高对比下你的界面还在吗', 'Does your UI survive Windows high contrast?',
      'forced-colors:active 时系统接管颜色；用 CanvasText / ButtonFace 等系统色，给纯色块加 border 才不会消失。',
      'When forced-colors is active the system owns colour. Use system keywords and give solid blocks a border or they vanish.',
      'pill', `.fx{border-color:#c9cbc0}@media (forced-colors:active){.fx{border-color:ButtonBorder;background:ButtonFace;color:ButtonText;forced-color-adjust:none}}`),

    I('zoom400', '400% 缩放', 'Zoom to 400%', '放大四倍不能出现横向滚动', 'No horizontal scroll at 400%',
      '等价于 320px 宽视口：用相对单位、允许换行、避免固定宽容器与两轴滚动。',
      'It equals a 320px viewport — relative units, allowed wrapping, no fixed-width containers or two-axis scrolling.',
      'card', `.fxcard{width:min(300px,80%)}.fx{padding:12px;font-size:13px}.fx>b{height:70px}.fx::after{content:'320px \u7b49\u6548\u5bbd\u5ea6';display:block;margin-top:10px;font:500 10px var(--fx-mono,monospace);color:#9b9d92}`),

    I('textspacing', '文本间距可调', 'Text spacing override', '用户拉大行距不能把字压掉', 'User line-height must not clip text',
      '行高 1.5×、段距 2×、字距 0.12em、词距 0.16em 时仍不能截断；给文本容器留可增长的高度。',
      'Survive line-height 1.5, paragraph spacing 2×, letter-spacing .12em, word-spacing .16em without clipping. Let text boxes grow.',
      'card', `.fx{padding:14px}.fx>b{display:none}.fx::after{content:'\u884c\u9ad8 1.5 \u00b7 \u5b57\u8ddd .12em \u00b7 \u4ecd\u4e0d\u6ea2\u51fa';display:block;font:400 12px/1.5 var(--fx-sans,system-ui);letter-spacing:.12em;word-spacing:.16em;color:#65675f}.fx>u,.fx>i{display:none}`),

    I('orientationfree', '不锁方向', 'No forced orientation', '轮椅上装的平板转不过来', 'A mounted tablet cannot be rotated',
      '除游戏等本质需求外不要锁 orientation；横竖两种布局都要能用。',
      'Do not lock orientation unless it is essential. Both portrait and landscape must work.',
      'grid', `.fxgrid{grid-template-columns:repeat(3,92px)}@media (orientation:landscape){.fxgrid{grid-template-columns:repeat(3,92px)}}.fx::after{content:'\u2194';display:flex;align-items:center;justify-content:center;height:100%;color:#b6b8b0;font-size:20px}`),

    I('timeoutwarn', '超时提醒', 'Timeout warning', '会话要过期得先问一句', 'Warn before the session dies',
      '至少提前 20 秒提示，并提供"延长"；表单内容要能恢复，不能一刷新全没。',
      'Warn at least 20 seconds ahead with an extend action, and preserve form content across the refresh.',
      'card', `@keyframes fxk{0%,100%{border-color:#e4e5e0}50%{border-color:#e8879c}}.fx{animation:fxk 2.4s ease-in-out infinite}.fx>b{display:none}.fx::after{content:'\u4f1a\u8bdd\u5c06\u5728 60 \u79d2\u540e\u8fc7\u671f\u3002[\u7ee7\u7eed\u505c\u7559]';display:block;font:500 12px/1.6 var(--fx-sans,system-ui);color:#23232f}.fx>u,.fx>i{display:none}`),

    I('autoplaystop', '自动播放可停', 'Pausable autoplay', '超过 5 秒的自动动作必须能停', 'Anything auto over 5s needs a stop',
      '轮播、跑马灯、动图都要有暂停控件，且默认不自动播放声音。',
      'Carousels, marquees and animated media need a pause control, and never autoplay audio.',
      'marquee', `@keyframes fxk{to{transform:translateX(-50%)}}.fxmarquee{position:relative}.fx{animation:fxk 9s linear infinite;font-size:26px}.fxmarquee::after{content:'\u23f8';position:absolute;right:0;top:50%;transform:translateY(-50%);width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#23232f;color:#fff;font-size:11px}`),

    I('flashsafe', '闪烁安全阈值', 'Flash safety', '闪太快会诱发癫痫', 'Fast flashing can trigger seizures',
      '任何区域每秒闪烁不超过 3 次，且不要大面积红色闪动；故障风、霓虹风尤其要收着。',
      'No more than three flashes per second in any region, and never large-area red flashing. Glitch and neon styles need restraint.',
      'box', `@keyframes fxk{0%,100%{opacity:1}50%{opacity:.55}}.fx{animation:fxk 1.4s steps(1,end) infinite}.fx::after{content:'\u2264 3 Hz'}`),

    I('errorid', '错误识别', 'Error identification', '错在哪、是哪条', 'Which field, and which rule',
      '错误要文字化并与字段关联（aria-describedby），聚焦到第一个错误；不要只把边框变红。',
      'Errors are text, linked to the field with aria-describedby, and focus moves to the first one. A red border alone is not an error message.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:7px}.fx{border-color:#c04a63;color:#23232f}.fxfield::after{content:'\u2717 \u90ae\u7bb1\u7f3a\u5c11 @\uff0c\u4f8b\uff1aname@site.com';font:500 11.5px var(--fx-sans,system-ui);color:#c04a63}`),

    I('errorsuggest', '错误建议', 'Error suggestion', '别只说错了，说怎么改', 'Say how to fix it, not just that it broke',
      '给出示例、允许值域或一键修正；金融与法律场景还要给撤销窗口。',
      'Offer an example, the allowed range, or a one-tap fix. Financial and legal flows also need an undo window.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:7px}.fx{border-color:#c07a3a}.fxfield::after{content:'\u65e5\u671f\u5e94\u4e3a YYYY-MM-DD\u3002\u4f60\u662f\u60f3\u5199 2026-09-08 \u5417\uff1f[\u4f7f\u7528]';font:500 11.5px/1.5 var(--fx-sans,system-ui);color:#65675f}`),

    I('formhelp', '上下文帮助', 'Contextual help', '把说明放在需要它的地方', 'Put the hint where the doubt is',
      '帮助文本放在标签下、输入前，常驻而不是悬停才出；tooltip 里的关键信息等于没有。',
      'Help sits under the label, before the field, and stays visible. Critical information inside a tooltip is invisible.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:6px}.fxfield::before{content:'\u7a0e\u53f7';font:500 12px var(--fx-sans,system-ui);color:#23232f}.fxfield::after{content:'\u5728\u53d1\u7968\u53f3\u4e0a\u89d2\uff0c12 \u4f4d\u6570\u5b57';font:400 11.5px var(--fx-sans,system-ui);color:#8b8d84;order:-1}`),

    I('autocompletehint', 'autocomplete 语义', 'autocomplete tokens', '让浏览器和密码管理器帮上忙', 'Let the browser and password manager help',
      '按规范写 autocomplete（name / email / one-time-code / new-password），对认知障碍与运动障碍用户帮助最大。',
      'Use the standard tokens (name, email, one-time-code, new-password). It helps cognitive and motor users the most.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:10px}.fx::after{content:'autocomplete="one-time-code"';margin-left:auto;font:500 10px var(--fx-mono,monospace);color:#4d8ba6}`),

    I('requiredmark', '必填标记', 'Required marks', '星号之外还要有话', 'An asterisk is not a sentence',
      '用 required 属性 + 文字"必填"，并在表单顶部说明标记含义；反过来标"选填"往往更清楚。',
      'Use the required attribute plus the word, and explain the mark at the top. Marking the optional fields is often clearer.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:6px}.fxfield::before{content:'\u624b\u673a\u53f7\uff08\u5fc5\u586b\uff09';font:500 12px var(--fx-sans,system-ui);color:#23232f}`),

    I('groupfieldset', '分组与图例', 'Fieldset & legend', '一组单选要有一个组名', 'A radio group needs a group name',
      '用 fieldset + legend 或 role="group" + aria-labelledby，否则读屏只念得到"选项一"。',
      'Use fieldset with legend, or role="group" with aria-labelledby, or a reader only hears "option one".',
      'pill', `.fxpill{position:relative;padding-top:24px;border:1px solid #d9dbe0;border-radius:10px;padding:26px 14px 14px;max-width:340px}.fxpill::before{content:'\u914d\u9001\u65b9\u5f0f';position:absolute;left:12px;top:-8px;padding:0 6px;background:#f6f6f2;font:600 11px var(--fx-sans,system-ui);color:#65675f}`),

    I('modaldialog', '对话框语义', 'Dialog semantics', '用原生 dialog，别自己搭', 'Use the native dialog, do not rebuild it',
      '<dialog> + showModal() 自带焦点管理、Esc、inert 背景与顶层渲染；自造的 div 十有八九漏一样。',
      'dialog with showModal() gives focus handling, Esc, an inert background and top-layer rendering. A hand-rolled div misses at least one.',
      'panel', `@keyframes fxk{0%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:none}}.fxa{background:#f4f5f1;color:#a5a79e}.fxb{inset:18% 16%;border-radius:14px;background:#fff;color:#23232f;box-shadow:0 22px 50px -22px rgba(48,80,104,.4);animation:fxk .5s ${E} both}.fxb::after{content:'role="dialog" aria-modal="true"';position:absolute;bottom:14px;left:0;right:0;text-align:center;font:500 10px var(--fx-mono,monospace);color:#9b9d92}`),

    I('disclosurearia', '展开器语义', 'Disclosure semantics', 'aria-expanded 必须跟着变', 'aria-expanded has to actually change',
      '触发器是 button，带 aria-expanded 与 aria-controls；箭头旋转只是视觉，状态在属性里。',
      'The trigger is a button with aria-expanded and aria-controls. The rotating caret is decoration; the state lives in the attribute.',
      'list', `@keyframes fxk{0%,45%{transform:rotate(0)}55%,100%{transform:rotate(90deg)}}.fxcol{width:min(400px,88%)}.fx:nth-child(1)::before{content:'\u25b8';margin-right:8px;display:inline-block;animation:fxk 3s steps(1,end) infinite}.fx:nth-child(n+4){display:none}`),

    I('tabsaria', '标签页语义', 'Tabs semantics', 'tablist / tab / tabpanel 三件套', 'The tablist, tab and tabpanel triad',
      'aria-selected 标当前项，方向键切换（roving tabindex），面板用 aria-labelledby 指回标签。',
      'aria-selected marks the current tab, arrows switch with roving tabindex, and the panel points back with aria-labelledby.',
      'nav', `@keyframes fxk{0%,100%{left:7px}50%{left:151px}}.fxnav{position:relative}.fxnav::before{content:'';position:absolute;top:7px;height:32px;width:64px;border-radius:8px;background:#eceee6;animation:fxk 4s ${E} infinite}.fx{position:relative;z-index:1}`),

    I('comboaria', '组合框语义', 'Combobox semantics', '能打字也能选，语义最容易写错', 'Type or pick — the easiest pattern to get wrong',
      'input[role=combobox] + aria-expanded + aria-activedescendant，列表是 listbox；候选变化要通过 live region 报数量。',
      'input with role=combobox, aria-expanded and aria-activedescendant over a listbox; announce the result count in a live region.',
      'field', `@keyframes fxk{0%{opacity:0;transform:translateY(-6px)}100%{opacity:1;transform:none}}.fxfield{position:relative}.fx{color:#23232f}.fxfield::after{content:'\u627e\u5230 3 \u4e2a\u7ed3\u679c';position:absolute;left:0;right:0;top:56px;padding:10px 14px;border:1px solid #e4e5e0;border-radius:8px;background:#fff;font:500 12px var(--fx-sans,system-ui);color:#65675f;box-shadow:0 12px 26px -14px rgba(48,80,104,.34);animation:fxk .5s ${E} both}`),

    I('tablearia', '表格语义', 'Table semantics', '表头必须是 th', 'Headers must be th',
      'th + scope="col|row"，caption 说明表在讲什么；用 div 拼的表格要补 role=table/row/cell。',
      'th with a scope, plus a caption saying what the table is. A div-built grid needs role=table/row/cell added back.',
      'table', `.fx:first-child{background:#eef4f8;font-weight:700}.fx:first-child>i{display:none}.fx:first-child::before{content:'th scope=col';font:600 10px var(--fx-mono,monospace);color:#3f6f92}`),

    I('sortaria', '排序状态播报', 'Sort announcement', '点了表头要说"已按日期升序"', 'Say "sorted by date, ascending"',
      'th 上写 aria-sort，切换后用 live region 播报完整句子；箭头图标不构成播报。',
      'Put aria-sort on the th and announce a whole sentence in a live region. An arrow glyph is not an announcement.',
      'table', `@keyframes fxk{0%,45%{transform:rotate(0)}55%,100%{transform:rotate(180deg)}}.fx:first-child{background:#eef4f8}.fx:first-child::after{content:'\u25b4';margin-left:auto;display:inline-block;color:#3f6f92;animation:fxk 3s steps(1,end) infinite}`),

    I('loadingaria', '加载状态播报', 'Loading announcement', '转圈对读屏是一片安静', 'A spinner is silence to a reader',
      '给忙碌区域 aria-busy="true"，完成后在 live region 播报"已加载 12 条"；骨架屏同理。',
      'Mark the busy region aria-busy and announce "12 items loaded" when done. Skeletons need the same.',
      'loader', `@keyframes fxk{to{transform:rotate(1turn)}}.fxload{flex-direction:column;gap:14px}.fx{width:34px;height:34px;border-radius:50%;background:none;border:3px solid #e4e5e0;border-top-color:#23232f;animation:fxk .9s linear infinite}.fx:nth-child(n+2){width:auto;height:auto;border:0;animation:none}.fx:nth-child(2)::after{content:'aria-busy="true"';font:500 11px var(--fx-mono,monospace);color:#9b9d92}.fx:nth-child(3){display:none}`),

    I('dragalt', '拖放的键盘替代', 'Keyboard alternative to drag', '拖不动的人也要能排序', 'Sorting must work without dragging',
      '每个可拖项提供"上移/下移"或"剪切—粘贴到此"；单指拖动也要有非拖动路径。',
      'Give every draggable an up/down action or a cut-and-place path. Single-pointer drag needs a non-drag route too.',
      'list', `.fxcol{width:min(400px,88%)}.fx>u{display:none}.fx::after{content:'\u2191 \u2193';margin-left:auto;font:600 13px var(--fx-mono,monospace);color:#4d8ba6;letter-spacing:4px}`),

    I('gesturealt', '手势的单点替代', 'Single-pointer alternative', '捏合、长按、划动都要有按钮版', 'Pinch, long-press and swipe all need a button',
      '多点与路径手势必须有单点等价操作，且可撤销；边缘划动更要给可见入口。',
      'Multipoint and path gestures need a single-pointer equivalent that is undoable. Edge swipes especially need a visible entry.',
      'pill', `.fxpill{gap:8px;max-width:360px}.fx:nth-child(1)::after{content:' \u2192 \u53cc\u6307\u7f29\u653e'}.fx:nth-child(2)::after{content:' \u2192 +/\u2212 \u6309\u94ae'}.fx:nth-child(n+3){display:none}.fx{font-size:12px}`),

    I('undoable', '可撤销优先于确认', 'Undo over confirm', '"确定要删除吗"是懒惰的设计', '"Are you sure?" is the lazy option',
      '低风险操作直接执行 + 提供撤销条；只有不可逆且高代价的操作才用二次确认，并要求输入名称。',
      'Execute low-risk actions and offer undo. Reserve confirmation for irreversible, costly actions — and make them type the name.',
      'card', `@keyframes fxk{0%{opacity:0;transform:translateY(14px)}12%,80%{opacity:1;transform:none}100%{opacity:0}}.fx{background:#23232f;border:0;color:#fff;animation:fxk 4.4s ${E} infinite}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u5df2\u5220\u9664 1 \u9879\u3002\u3000\u6492\u9500';display:flex;justify-content:space-between;font:600 12px var(--fx-sans,system-ui)}`)
  ]
};
