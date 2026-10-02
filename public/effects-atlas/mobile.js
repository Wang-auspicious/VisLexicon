// 移动端：不是"窄一点的网页"，而是另一套手势、导航与物理规则
const E = 'cubic-bezier(.22,1,.36,1)';
const I = (id, zh, en, dz, de, pz, pe, demo, css) => ({ id, zh, en, dz, de, pz, pe, demo, css });

export default {
  id: 'mobile', zh: '移动端模式', en: 'Mobile patterns',
  dz: '底部抽屉、下拉刷新、侧滑操作、拇指区、共享元素转场——原生 App 的那套词汇',
  de: 'Bottom sheets, pull-to-refresh, swipe actions, thumb zones, shared-element transitions — the native app vocabulary',
  items: [
    I('bottomsheet', '底部抽屉', 'Bottom sheet', '从下面推上来的一层', 'A layer pushed up from below',
      '拖拽把手 + 多段吸附高度（30/60/95%）+ 下拉关闭；内容可滚时要区分"滚内容"与"拖抽屉"。',
      'A grab handle, snap heights around 30/60/95%, and swipe-down to close. Distinguish scrolling content from dragging the sheet.',
      'panel', `@keyframes fxk{0%,100%{top:58%}50%{top:26%}}.fxstack{width:min(300px,80%);height:min(320px,46vh)}.fxa{background:rgba(45,72,98,.3)}.fxa::after{content:''}.fxb{inset:58% 0 0;border-radius:18px 18px 0 0;background:#fff;color:#23232f;animation:fxk 5s ${E} infinite}.fxb::before{content:'';position:absolute;left:50%;top:9px;transform:translateX(-50%);width:38px;height:4px;border-radius:2px;background:#d9dbe0}`),

    I('pulltorefresh', '下拉刷新', 'Pull to refresh', '往下拽一下松手', 'Drag down and let go',
      '有阻尼、有阈值、有越过阈值的形变反馈；overscroll-behavior:contain 防止连带滚动祖先。',
      'Damped drag, a threshold, and a shape change once crossed. overscroll-behavior:contain stops the ancestor from scrolling.',
      'scroll', `@keyframes fxk{0%,100%{transform:translateY(0)}40%{transform:translateY(46px)}}@keyframes fxr{to{transform:rotate(1turn)}}.fxscroll{position:relative;overscroll-behavior:contain}.fxscroll::before{content:'';position:absolute;left:50%;top:8px;margin-left:-10px;width:20px;height:20px;border-radius:50%;border:2px solid #d9dbe0;border-top-color:#3f6f92;animation:fxr .9s linear infinite}.fx{animation:fxk 3.4s ${E} infinite}`),

    I('swipeaction', '侧滑操作', 'Swipe actions', '往左滑露出删除', 'Swipe left to reveal delete',
      '滑动露出 1–3 个动作，破坏性动作放最外侧并需要二次确认或完全划过；一定要有非滑动入口。',
      'Reveal one to three actions with the destructive one outermost, needing a full swipe or confirm. Always keep a non-swipe path.',
      'list', `@keyframes fxk{0%,100%{transform:translateX(0)}45%,65%{transform:translateX(-84px)}}.fxcol{overflow:hidden}.fx:nth-child(2){position:relative;animation:fxk 4s ${E} infinite}.fxcol::before{content:'\u5220\u9664';position:absolute;right:0;top:62px;width:84px;height:52px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#c04a63;color:#fff;font:600 12px var(--fx-sans,system-ui)}`),

    I('tabbar', '底部标签栏', 'Tab bar', '三到五个平级入口', 'Three to five peer destinations',
      '图标 + 文字（纯图标记不住），当前项要有形状差异不只变色；标签栏不承载"更多操作"。',
      'Icon plus label — icon-only is unmemorable — and mark the current tab with shape, not only colour.',
      'nav', `.fxnav{width:min(300px,86%);justify-content:space-between;border-radius:0;border-left:0;border-right:0;border-bottom:0;padding:8px 4px}.fx{flex:1;text-align:center;font-size:10px;padding:4px 2px;position:relative}.fx::before{content:'';display:block;width:20px;height:20px;margin:0 auto 4px;border-radius:6px;background:#e4e5e0}.fx:nth-child(1){color:#3f6f92;font-weight:600}.fx:nth-child(1)::before{background:#3f6f92}.fx:nth-child(n+5){display:none}`),

    I('thumbzone', '拇指区', 'Thumb zone', '屏幕上半部分是"够不到"的', 'The top half is out of reach',
      '主操作放底部 1/3，破坏性操作放顶部（防误触）；6.7 寸屏上顶部按钮需要换手。',
      'Primary actions in the bottom third, destructive ones up top where mis-taps are unlikely. A 6.7-inch screen needs a hand change to reach the top.',
      'page', `.fxpage{width:min(280px,80%);grid-template-columns:1fr;border-radius:24px;position:relative}.fxart{display:none}.fxbar{height:22px}.fxhead{font-size:19px;padding:20px 18px 0}.fxcta{margin:auto 18px 22px}.fxpage::after{content:'';position:absolute;left:0;right:0;bottom:0;height:34%;background:radial-gradient(120% 100% at 50% 120%,rgba(63,111,146,.16),transparent 70%);pointer-events:none;z-index:5}`),

    I('backswipe', '边缘返回', 'Edge back swipe', '从左边缘划回去', 'Swipe from the left edge to go back',
      '系统手势会和你的横滑组件冲突：给横滑轨留出边缘 24px，或用 touch-action 明确让路。',
      'The system gesture fights your horizontal carousel. Leave a 24px edge gutter or yield with touch-action.',
      'panel', `@keyframes fxk{0%,100%{transform:translateX(0)}50%{transform:translateX(72%)}}.fxstack{width:min(300px,80%);overflow:hidden}.fxa{background:#f4f5f1;color:#a5a79e}.fxa::after{content:'\u4e0a\u4e00\u9875'}.fxb{background:#fff;color:#23232f;box-shadow:-8px 0 22px rgba(45,72,98,.16);animation:fxk 4.4s ${E} infinite}.fxb::after{content:'\u5f53\u524d\u9875'}`),

    I('sharedelement', '共享元素转场', 'Shared element transition', '列表里那张图长成详情页的头图', 'The thumbnail grows into the hero',
      'View Transitions API 的 view-transition-name 对上同一个元素；比例要一致，否则会看到形变。',
      'Match one view-transition-name across both views. Keep the aspect ratio or you will see it warp.',
      'panel', `@keyframes fxk{0%,100%{inset:62% 58% 12% 12%;border-radius:10px}50%{inset:0;border-radius:0}}.fxstack{width:min(320px,84%)}.fxa{background:#f4f5f1}.fxa::after{content:''}.fxb{background:linear-gradient(150deg,#7cb6c8,#3f6f92);animation:fxk 4.6s ${E} infinite}.fxb::after{content:''}`),

    I('pagepush', '页面推入', 'Push navigation', '新页从右边推进来，旧页往左走一点', 'The new page pushes in, the old one eases left',
      '前进右进左出、返回反向；旧页要有轻微视差（-30%）与压暗，才有层次。',
      'Forward comes from the right; back reverses it. The outgoing page parallaxes about 30% and dims slightly.',
      'panel', `@keyframes fxa{0%,45%{transform:none;filter:brightness(1)}55%,100%{transform:translateX(-30%);filter:brightness(.92)}}@keyframes fxb{0%,45%{transform:translateX(100%)}55%,100%{transform:none}}.fxstack{width:min(300px,80%);overflow:hidden}.fxa{background:#f4f5f1;color:#8b8d84;animation:fxa 4s ${E} infinite}.fxb{background:#fff;color:#23232f;box-shadow:-8px 0 20px rgba(45,72,98,.14);animation:fxb 4s ${E} infinite}`),

    I('modalpresent', '模态呈现', 'Modal presentation', '从底部整页升起来', 'A full page rising from the bottom',
      '模态是"另一个任务"，转场从下往上、圆角变大、背后页缩小；退出必须能下滑。',
      'A modal is a separate task: it rises, gains corner radius, and shrinks the page behind. Swipe-down must dismiss it.',
      'panel', `@keyframes fxa{0%,45%{transform:none;border-radius:0}55%,100%{transform:scale(.94);border-radius:12px;filter:brightness(.9)}}@keyframes fxb{0%,45%{transform:translateY(100%)}55%,100%{transform:translateY(6%)}}.fxstack{width:min(300px,80%);overflow:hidden;background:#dfe3e8}.fxa{background:#f4f5f1;color:#8b8d84;animation:fxa 4.4s ${E} infinite}.fxb{background:#fff;color:#23232f;border-radius:18px 18px 0 0;animation:fxb 4.4s ${E} infinite}`),

    I('haptic', '触感反馈', 'Haptics', '轻震一下比动画更快被感知', 'A tap of vibration lands faster than animation',
      '选择用轻（selection）、成功用中、错误用双击式；不要给滚动与悬停加震动。',
      'Light for selection, medium for success, a double pattern for errors. Never on scroll or hover.',
      'sw', `@keyframes fxk{0%,88%{transform:none}92%{transform:translateX(-1.5px)}96%{transform:translateX(1.5px)}100%{transform:none}}.fx:nth-child(1){background:#4d8ba6;animation:fxk 2.4s steps(1,end) infinite}.fx:nth-child(1)>b{left:27px}`),

    I('longpressmenu', '长按菜单', 'Long-press menu', '按住 500ms 弹出上下文', 'Hold 500ms for context',
      '长按要有渐进反馈（缩放 + 触感），菜单从按压点长出；必须另有可见入口（"…"按钮）。',
      'Give progressive feedback while holding — scale plus haptics — and grow the menu from the press point. Also ship a visible "…".',
      'cards', `@keyframes fxk{0%,40%{transform:none}55%{transform:scale(.96)}70%,100%{transform:scale(1.02)}}.fx:nth-child(2){animation:fxk 4s ${E} infinite;position:relative}.fx:nth-child(2)::after{content:'\u590d\u5236 \u00b7 \u5206\u4eab \u00b7 \u5220\u9664';position:absolute;left:0;right:0;bottom:-30px;padding:7px;border-radius:8px;background:#23232f;color:#fff;font:600 10px var(--fx-sans,system-ui);text-align:center}`),

    I('scrollsnapfeed', '整屏吸附信息流', 'Snap feed', '一屏一条，划过去就定住', 'One item per screen, snapped',
      'scroll-snap-type:y mandatory + 每项 100dvh；要保证内部可滚元素不被吞掉手势。',
      'y-mandatory snapping with 100dvh items — and make sure inner scrollables still get the gesture.',
      'scroll', `.fxscroll{scroll-snap-type:y mandatory;gap:0;padding:0}.fx{scroll-snap-align:start;height:100%;min-height:180px;border-radius:0}`),

    I('stickyheadercollapse', '标题栏收缩', 'Collapsing header', '大标题滚上去变成小标题', 'The large title shrinks into the bar',
      '大标题在内容里，滚动时淡出并把文字交给顶栏；两者要在同一水平位置对齐才不突兀。',
      'The large title lives in the content and hands its text to the bar on scroll. Align them horizontally or it jars.',
      'scroll', `@keyframes fxk{0%,35%{font-size:24px;opacity:1}65%,100%{font-size:13px;opacity:1}}.fxscroll::before{content:'\u9879\u76ee';position:sticky;top:0;display:flex;align-items:flex-end;height:52px;padding:0 4px 8px;font-weight:700;color:#23232f;background:linear-gradient(#fcfcfb 70%,transparent);flex:none;animation:fxk 4s ${E} infinite}`),

    I('segmentedmobile', '分段控件', 'Segmented control', '两到四个互斥视图', 'Two to four exclusive views',
      '滑块跟随选中项移动，宽度按最长文案统一；超过四项改用下拉或标签滚动。',
      'The thumb slides to the selection and every segment shares the widest label. Past four, use a select.',
      'nav', `@keyframes fxk{0%,100%{left:5px}50%{left:calc(50% + 1px)}}.fxnav{width:min(260px,80%);padding:5px;background:#eceee6;border:0;position:relative}.fx{flex:1;text-align:center;font-size:12px;z-index:1;padding:7px 0}.fxnav::before{content:'';position:absolute;top:5px;bottom:5px;width:calc(50% - 6px);border-radius:7px;background:#fff;box-shadow:0 1px 3px rgba(45,72,98,.16);animation:fxk 4s ${E} infinite}.fx:nth-child(n+3){display:none}`),

    I('actionsheet', '动作面板', 'Action sheet', '从底部弹出的一列动作', 'A column of actions from below',
      '破坏性动作单独一组并用红色，取消永远单独一块在最下方；不要超过 6 项。',
      'Destructive actions get their own group in red, and Cancel always sits alone at the bottom. Six items maximum.',
      'list', `.fxcol{width:min(280px,80%);gap:8px}.fx{border-radius:12px;justify-content:center;font-size:14px}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'\u5206\u4eab'}.fx:nth-child(2)::after{content:'\u590d\u5236\u94fe\u63a5'}.fx:nth-child(3){color:#c04a63;font-weight:600}.fx:nth-child(3)::after{content:'\u5220\u9664'}.fx:nth-child(4){margin-top:6px;font-weight:600}.fx:nth-child(4)::after{content:'\u53d6\u6d88'}.fx:nth-child(n+5){display:none}`),

    I('toastmobile', '移动端轻提示', 'Mobile toast', '别挡住底部标签栏', 'Keep clear of the tab bar',
      '出现在标签栏之上、安全区之内，宽度留边距；带撤销的提示要延长到 8 秒。',
      'Sit above the tab bar and inside the safe area with side margins. Extend to eight seconds when it carries an undo.',
      'card', `@keyframes fxk{0%{opacity:0;transform:translateY(16px)}14%,82%{opacity:1;transform:none}100%{opacity:0}}.fxcard{width:min(280px,78%)}.fx{background:#23232f;border:0;color:#fff;border-radius:12px;animation:fxk 4.4s ${E} infinite}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u5df2\u52a0\u5165\u6536\u85cf\u3000\u6492\u9500';display:flex;justify-content:space-between;font:600 12px var(--fx-sans,system-ui)}`),

    I('fab', '悬浮主按钮', 'Floating action button', '一个屏幕只配一个', 'One per screen, at most',
      '固定在右下（RTL 翻到左下），滚动时可缩成图标；不要用它承载多个动作除非能展开。',
      'Bottom-trailing corner, shrinking to the icon on scroll. Do not overload it unless it expands.',
      'panel', `@keyframes fxk{0%,100%{transform:none}50%{transform:translateY(-4px)}}.fxstack{width:min(280px,78%);height:min(220px,34vh)}.fxa{background:#f4f5f1;color:#c4c6bd}.fxa::after{content:''}.fxb{inset:auto 18px 18px auto;width:52px;height:52px;border-radius:50%;background:linear-gradient(150deg,#5f9cb0,#3f6f92);box-shadow:0 10px 22px -8px rgba(48,80,104,.6);color:#fff;font:300 26px/1 var(--fx-sans,system-ui);animation:fxk 3.4s ease-in-out infinite}.fxb::after{content:'+'}`),

    I('skeletonmobile', '移动端骨架', 'Mobile skeleton', '窄屏骨架要按卡片来', 'Skeletons follow the card, not the table',
      '一屏放 3–4 个骨架卡就够，再多也看不见；高度要和真实卡一致。',
      'Three or four skeleton cards fill the screen; more is invisible. Match the real card height exactly.',
      'list', `@keyframes fxk{to{background-position:200% 0}}.fxcol{width:min(280px,80%)}.fx{height:72px;flex-direction:column;align-items:flex-start;justify-content:center;gap:8px;padding:0 14px}.fx>i{width:56%;height:10px;border-radius:5px;background:linear-gradient(100deg,#eceef1 30%,#f6f7f4 50%,#eceef1 70%);background-size:200% 100%;animation:fxk 1.6s linear infinite}.fx>u{width:84%;height:8px;flex:none;background:linear-gradient(100deg,#eceef1 30%,#f6f7f4 50%,#eceef1 70%);background-size:200% 100%;animation:fxk 1.6s linear infinite}.fx:nth-child(n+4){display:none}`),

    I('inputmodemobile', '键盘类型', 'Keyboard type', '输数字就别弹字母键盘', 'Numbers should not summon letters',
      'inputmode=numeric/decimal/tel/email/search，配 enterkeyhint 改回车键文案；type=number 会带上没用的步进器。',
      'inputmode plus enterkeyhint. type=number drags along a stepper nobody wants.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:8px}.fx::after{content:'inputmode="decimal"';margin-left:auto;font:500 10px var(--fx-mono,monospace);color:#4d8ba6}`),

    I('otpmobile', '验证码输入', 'OTP input', '六个格子，能粘贴也能自动填', 'Six boxes that accept a paste and an autofill',
      '用一个真实 input 加视觉分格（别用六个 input），autocomplete="one-time-code"，满位自动提交。',
      'One real input with visual boxes — never six inputs — plus autocomplete="one-time-code" and auto-submit when full.',
      'loader', `@keyframes fxk{0%,49%{border-color:#3f6f92}50%,100%{border-color:#d9dbe0}}.fxload{gap:8px}.fx{width:38px;height:46px;border-radius:9px;background:#fff;border:1.5px solid #d9dbe0;display:flex;align-items:center;justify-content:center;font:600 18px var(--fx-mono,monospace);color:#23232f}.fx:nth-child(1)::after{content:'4'}.fx:nth-child(2)::after{content:'7'}.fx:nth-child(3){animation:fxk 1.1s steps(1,end) infinite}`),

    I('nativepicker', '原生选择器', 'Native pickers', '日期与时间用系统的那一套', 'Dates and times belong to the OS',
      '移动端优先 input[type=date/time]：自带无障碍、本地格式与惯性滚轮；自造滚轮几乎总是更差。',
      'Prefer input type date and time on mobile — accessibility, locale format and momentum come free. Hand-rolled wheels lose.',
      'field', `.fx::after{content:'2026-09-08  \u25be';margin-left:auto;font:500 13px var(--fx-mono,monospace);color:#23232f}.fx>u{display:none}`),

    I('safeareamobile', '安全区内边距', 'Safe-area padding', '底部条要加 env() 才不被压', 'Bottom bars need env() or they get covered',
      'padding-bottom:max(16px, env(safe-area-inset-bottom))；横屏时左右也要加。',
      'padding-bottom:max(16px, env(safe-area-inset-bottom)) — and the inline insets too in landscape.',
      'nav', `.fxnav{width:min(280px,80%);padding-bottom:26px;border-radius:0;border:0;border-top:1px solid #e6e7ea;position:relative}.fxnav::after{content:'';position:absolute;left:50%;bottom:8px;transform:translateX(-50%);width:100px;height:4px;border-radius:2px;background:#23232f}.fx{flex:1;text-align:center;font-size:11px}.fx:nth-child(n+4){display:none}`),

    I('doubletap', '双击点赞', 'Double-tap to like', '在图上双击，心跳一下', 'Double-tap the photo; a heart beats',
      '要和单击（打开）与缩放（双击放大）区分：内容型双击点赞，图片查看器双击缩放，二者别混在同一屏。',
      'Separate it from single-tap open and double-tap zoom. Content feeds like; viewers zoom. Never both on one screen.',
      'media', `@keyframes fxk{0%,60%{opacity:0;transform:scale(.4)}72%{opacity:1;transform:scale(1.25)}84%,100%{opacity:0;transform:scale(1)}}.fx::after{content:'\u2665';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:52px;color:#fff;text-shadow:0 4px 14px rgba(0,0,0,.34);animation:fxk 3.4s ${E} infinite}`),

    I('storyring', '故事环', 'Story ring', '头像外面那圈渐变', 'The gradient ring around the avatar',
      '未读用渐变环、已读用灰环、正在上传用旋转虚线；环宽 2–3px，与头像留 2px 白隙。',
      'Unread gets the gradient, read gets grey, uploading gets a spinning dash. A 2–3px ring with a 2px white gap.',
      'loader', `@keyframes fxk{to{transform:rotate(1turn)}}.fxload{gap:16px}.fx{width:52px;height:52px;border-radius:50%;background:#e5a68f;position:relative;border:2px solid #fff;box-shadow:0 0 0 2.5px #e8879c}.fx:nth-child(2){box-shadow:0 0 0 2.5px #d9dbe0}.fx:nth-child(3){box-shadow:none}.fx:nth-child(3)::after{content:'';position:absolute;inset:-5px;border-radius:50%;border:2.5px dashed #4d8ba6;animation:fxk 2.4s linear infinite}`),

    I('carouselpeek', '轮播露边', 'Peeking carousel', '露出下一张的一角', 'Show a sliver of the next',
      '首项左侧留 padding、末项右侧留 padding（scroll-padding），让"还有更多"变成视觉事实。',
      'Pad the first and last items with scroll-padding so "there is more" becomes visible fact.',
      'cards', `.fxrow{max-width:280px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:16px;padding-inline:16px}.fx{flex:none;scroll-snap-align:start;width:170px}`),

    I('pageindicator', '页点指示器', 'Page dots', '几页、第几页', 'How many, and which',
      '超过 8 页改用"3/12"数字或缩略进度条；当前点放大而不只是变色。',
      'Past eight pages switch to "3/12" or a bar. Enlarge the active dot rather than only recolouring it.',
      'loader', `@keyframes fxk{0%,100%{transform:scale(1);background:#d9dbe0}33%{transform:scale(1.5);background:#3f6f92}}.fxload{gap:7px}.fx{width:7px;height:7px;animation:fxk 4.5s ${E} infinite}.fx:nth-child(2){animation-delay:1.5s}.fx:nth-child(3){animation-delay:3s}`),

    I('keyboardtoolbar', '键盘上方工具条', 'Keyboard accessory bar', '键盘一弹，工具条贴在它上面', 'A bar riding on top of the keyboard',
      '放"完成/上一个/下一个"或格式按钮，用 visualViewport 跟随键盘高度；表单跨字段跳转靠它。',
      'Done, previous and next, or formatting buttons, tracking the keyboard with visualViewport. It is how people move between fields.',
      'nav', `@keyframes fxk{0%,45%{transform:translateY(30px);opacity:0}55%,100%{transform:none;opacity:1}}.fxnav{width:min(280px,80%);border-radius:0;border:0;border-top:1px solid #e6e7ea;background:#f4f5f1;animation:fxk 3.6s ${E} infinite}.fx{font-size:12px}.fx:nth-child(1)::after{content:''}.fx:nth-child(n+4){display:none}.fx:last-of-type{margin-left:auto;color:#3f6f92;font-weight:600}`),

    I('scrolltotop', '点顶栏回顶', 'Tap status bar to top', '点顶部就回到最上面', 'Tap the top to return to the start',
      '滚过一屏后出现"回到顶部"按钮，或让顶栏可点；长列表没有这个就是残废。',
      'Show a back-to-top affordance after one screen, or make the header tappable. Long lists without it are broken.',
      'scroll', `@keyframes fxk{0%,40%{opacity:0;transform:translateY(8px)}55%,100%{opacity:1;transform:none}}.fxscroll{position:relative}.fxscroll::after{content:'\u2191 \u56de\u5230\u9876\u90e8';position:sticky;bottom:6px;align-self:center;padding:7px 13px;border-radius:999px;background:#23232f;color:#fff;font:600 11px var(--fx-sans,system-ui);animation:fxk 4s ${E} infinite}`),

    I('offlinemobile', '弱网提示', 'Weak network', '不是断网，是很慢', 'Not offline — just slow',
      '超过 3 秒给"网络较慢"提示与"仅加载文字"选项；把图片降级成占位。',
      'Past three seconds, offer a slow-network notice and a text-only option, downgrading images to placeholders.',
      'card', `.fxcard{width:min(280px,78%)}.fx{background:#fdfaf4;border-color:#e0d7c4;padding:13px}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u7f51\u7edc\u8f83\u6162 \u00b7 [\u4ec5\u52a0\u8f7d\u6587\u5b57]';font:500 12px var(--fx-sans,system-ui);color:#65675f}`),

    I('appclip', '免安装入口', 'Instant experience', '不装 App 也能用一小段', 'A slice that runs without installing',
      '把单个任务（扫码点单、看票）做成免安装片段，只在必要时引导安装；不要一进来就拦装。',
      'Ship a single task as an install-free slice and only prompt when necessary. An immediate install wall loses everyone.',
      'card', `.fxcard{width:min(280px,78%)}.fx{padding:16px;text-align:center}.fx>b{width:44px;height:44px;border-radius:11px;margin:0 auto 12px;background:linear-gradient(150deg,#7cb6c8,#3f6f92)}.fx>u,.fx>i{display:none}.fx::after{content:'\u65e0\u9700\u5b89\u88c5 \u00b7 \u76f4\u63a5\u67e5\u770b\u51ed\u8bc1';font:500 12px var(--fx-sans,system-ui);color:#65675f}`),

    I('permissionprime', '权限预告', 'Permission priming', '先说为什么，再弹系统框', 'Explain before the system asks',
      '自建一屏说明用途与收益，用户同意后才触发系统弹窗；系统弹窗被拒一次就很难再要回来。',
      'Show your own screen explaining the benefit first — a system prompt refused once is nearly unrecoverable.',
      'card', `.fxcard{width:min(280px,78%)}.fx{padding:18px;text-align:center}.fx>b{width:40px;height:40px;border-radius:50%;margin:0 auto 12px;background:#eef4f8}.fx>u,.fx>i{display:none}.fx::after{content:'\u5f00\u542f\u5b9a\u4f4d\u53ef\u81ea\u52a8\u5339\u914d\u4f60\u7684\u5730\u5757\u3002\\A [\u597d\uff0c\u5f00\u542f]  [\u4ee5\u540e\u518d\u8bf4]';white-space:pre-line;font:400 12px/1.8 var(--fx-sans,system-ui);color:#65675f}`),

    I('biometric', '生物识别', 'Biometric unlock', '指纹或面容代替密码', 'A fingerprint instead of a password',
      '失败要有密码兜底路径，且不能暴露"账号存在"；不要在每次前台切换都要求验证。',
      'Always keep a password fallback, never leak account existence, and do not re-prompt on every foreground.',
      'loader', `@keyframes fxk{0%,100%{box-shadow:0 0 0 0 rgba(63,111,146,.4)}50%{box-shadow:0 0 0 10px rgba(63,111,146,0)}}.fxload{gap:0}.fx{width:56px;height:56px;border-radius:50%;background:#eef4f8;border:2px solid #3f6f92;animation:fxk 2.2s ease-out infinite}.fx:nth-child(n+2){display:none}`),

    I('deeplink', '深链落地', 'Deep link landing', '从链接进来要落到对的那一屏', 'A link must land on the right screen',
      '未登录时先记住目标再走登录，登录后直达；App 未装时回落到网页版同一内容。',
      'Remember the destination through login, and fall back to the same web content when the app is absent.',
      'nav', `.fxnav{width:min(300px,86%)}.fx{font-size:11px}.fx:nth-child(1)::after{content:'\u2192'}.fx:nth-child(2)::after{content:'\u2192'}.fx:nth-child(3){color:#3f6f92;font-weight:600}.fx:nth-child(n+4){display:none}`),

    I('gesturenav', '手势导航冲突', 'Gesture conflicts', '你的滑动和系统的滑动打起来了', 'Your swipe fights the system swipe',
      '用 touch-action 明确让出方向；地图与画布这类需要全权手势的区域要显式声明 none 并给退出手势。',
      'Declare touch-action to yield an axis. Maps and canvases that need full control declare none — and provide an exit.',
      'surface', `.fxsurface{width:min(300px,80%);height:min(200px,32vh);touch-action:none}.fx{background:radial-gradient(120% 100% at 30% 20%,#e9eef2,#d6e0e6)}.fx::after{content:'touch-action:none';position:absolute;left:12px;bottom:12px;font:600 10px var(--fx-mono,monospace);color:#7d97a6}`),

    I('overscrollbounce', '过滚回弹', 'Overscroll bounce', '到底了还能拽一点，然后弹回来', 'It gives a little at the end, then springs back',
      'iOS 原生行为要保留（它是"到底了"的反馈）；只在需要防止连带滚动时用 overscroll-behavior。',
      'Keep the native bounce — it is the end-of-list signal. Use overscroll-behavior only to stop chaining.',
      'scroll', `@keyframes fxk{0%,70%{transform:translateY(0)}82%{transform:translateY(-14px)}100%{transform:translateY(0)}}.fx{animation:fxk 3.4s ${E} infinite}`),

    I('appbarscrollhide', '滚动隐藏顶栏', 'Hide bar on scroll', '往下滚把顶栏收走', 'Scrolling down takes the bar away',
      '下滚隐藏、上滚立刻回来（不必滚到顶）；隐藏要有阈值防抖，且吸顶筛选条不能一起藏。',
      'Hide on down, return immediately on up. Add a threshold against jitter, and never hide the sticky filter bar with it.',
      'scroll', `@keyframes fxk{0%,40%{transform:none}60%,100%{transform:translateY(-100%)}}.fxscroll::before{content:'\u9879\u76ee';position:sticky;top:0;display:flex;align-items:center;height:44px;padding:0 14px;background:#fff;border-bottom:1px solid #eceef1;font:600 13px var(--fx-sans,system-ui);color:#23232f;flex:none;animation:fxk 4s ${E} infinite}`),

    I('inlinevalidate', '就地校验', 'Inline validation', '离开字段才报错，不是每敲一下', 'Validate on blur, not on every keystroke',
      'blur 时校验、输入时清除错误；提交前统一再校验一次并聚焦第一个错误。',
      'Validate on blur and clear on input. Re-validate on submit and focus the first failure.',
      'field', `@keyframes fxk{0%,45%{border-color:#d9dbe0}55%,100%{border-color:#c04a63}}.fxfield{display:flex;flex-direction:column;gap:6px}.fx{animation:fxk 3.4s steps(1,end) infinite}.fxfield::after{content:'\u624b\u673a\u53f7\u5e94\u4e3a 11 \u4f4d';font:500 11px var(--fx-sans,system-ui);color:#c04a63}`),

    I('steppermobile', '数量步进器', 'Quantity stepper', '加减号要够大，中间数字可直接输', 'Big plus and minus, editable middle',
      '按钮 44px 起，中间数字可点开键盘；长按连续加减要有加速度。',
      'Buttons from 44px with a tappable numeric middle, and acceleration on hold.',
      'nav', `.fxnav{width:auto;gap:0;padding:0;border-radius:10px;overflow:hidden}.fx{width:46px;height:46px;display:flex;align-items:center;justify-content:center;padding:0;border-radius:0;font-size:18px;color:#23232f}.fx:nth-child(2){width:56px;font:600 15px var(--fx-mono,monospace);border-left:1px solid #e6e7ea;border-right:1px solid #e6e7ea}.fx:nth-child(1)::after{content:'\u2212'}.fx:nth-child(2)::after{content:'3'}.fx:nth-child(3)::after{content:'+'}.fx:nth-child(n+4){display:none}`),

    I('bottomcta', '底部固定主按钮', 'Sticky bottom CTA', '价格与按钮一起钉在底部', 'Price and button pinned together',
      '滚动到内容底部时解除吸附并入内容流，避免遮挡最后一段；安全区内边距必须加。',
      'Release it into the flow at the end of the content so it stops covering the last paragraph. Safe-area padding required.',
      'page', `.fxpage{width:min(280px,80%);grid-template-columns:1fr;border-radius:22px}.fxart{display:none}.fxhead{font-size:19px;padding:20px 18px 0}.fxcta{margin:14px 0 0;justify-self:stretch;align-self:end;text-align:center;border-radius:0;padding:15px 0 26px;font-size:13px}`),

    I('splitgesture', '手势与滚动分流', 'Gesture vs scroll', '同一块区域既要横滑又要纵滚', 'One area, both a horizontal swipe and a vertical scroll',
      '先按首次位移角度锁定主轴（超过 30° 判纵向），锁定后不再切换；否则会出现"滑不动"。',
      'Lock the axis from the first movement angle — past about 30° it is vertical — and never switch mid-gesture.',
      'surface', `.fxsurface{width:min(300px,80%);height:min(200px,32vh);touch-action:pan-y}.fx{background:linear-gradient(150deg,#eef2f5,#dde5ea);display:flex;align-items:center;justify-content:center;font:600 11px var(--fx-mono,monospace);color:#7d97a6}.fx::after{content:'touch-action:pan-y'}`),

    I('lightbox', '图片查看器', 'Image viewer', '双指缩放、单指拖动、下滑关闭', 'Pinch, pan, swipe down to close',
      '缩放上限 3–4×、双击在 1× 与 2× 间切换、下滑时背景渐透并跟手缩小。',
      'Cap zoom at three or four, double-tap toggles 1× and 2×, and a downward drag shrinks the image as the backdrop fades.',
      'panel', `@keyframes fxk{0%,100%{transform:scale(1)}50%{transform:scale(1.5)}}.fxstack{width:min(300px,80%)}.fxa{background:#12151a}.fxa::after{content:''}.fxb{inset:20% 8%;background:linear-gradient(150deg,#7cb6c8,#3f6f92);border-radius:6px;animation:fxk 4.4s ${E} infinite}.fxb::after{content:''}`),

    I('badgeapp', '应用角标', 'App icon badge', '桌面上那个红点', 'The red dot on the home screen',
      '只对需要用户行动的事计数；进入应用后要按实际已读收敛，不能只在打开时清零。',
      'Count only what needs action, and reconcile it with real read state rather than zeroing on launch.',
      'loader', `.fxload{gap:0}.fx{width:56px;height:56px;border-radius:14px;background:linear-gradient(150deg,#5f9cb0,#3f6f92);position:relative}.fx:nth-child(n+2){display:none}.fx::after{content:'3';position:absolute;top:-5px;right:-5px;width:22px;height:22px;border-radius:11px;background:#e8879c;border:2px solid #f6f6f2;color:#fff;font:700 11px/18px var(--fx-mono,monospace);text-align:center}`),

    I('sheetstack', '抽屉层叠', 'Stacked sheets', '抽屉上面又开一个抽屉', 'A sheet on top of a sheet',
      '最多两层，下层要缩小并压暗表示"在后面"；第三层就该换成整页导航。',
      'Two layers maximum, with the lower one scaled and dimmed. A third layer should become full-page navigation.',
      'panel', `.fxstack{width:min(300px,80%);height:min(300px,44vh);background:rgba(45,72,98,.3)}.fxa{inset:22% 6% 0;border-radius:16px 16px 0 0;background:#e6eaee;color:#8b8d84;transform:scale(.96)}.fxa::after{content:''}.fxb{inset:38% 0 0;border-radius:18px 18px 0 0;background:#fff;color:#23232f;box-shadow:0 -12px 30px -14px rgba(45,72,98,.4)}.fxb::after{content:''}`),

    I('scrollrestore', '滚动位置恢复', 'Scroll restoration', '返回列表要回到原来那一行', 'Going back returns you to the same row',
      '记录滚动位置与列表项 id，返回时按 id 定位（分页数据可能已变）；不要只存像素值。',
      'Store the position and the anchor item id, and restore by id — paged data may have shifted under you.',
      'scroll', `.fxscroll{scroll-behavior:auto}.fx:nth-child(4){outline:2px solid #3f6f92;outline-offset:2px}.fx:nth-child(4)::after{content:'\u8fd4\u56de\u65f6\u5b9a\u4f4d\u5230\u8fd9\u91cc'}`),

    I('offlinefirst', '本地优先', 'Local-first mobile', '先写本地，再慢慢同步', 'Write locally, sync eventually',
      '所有写操作先落本地库并立刻反映在 UI，后台队列上传；网络只是同步通道而不是前置条件。',
      'Every write hits local storage and the UI immediately, with a background upload queue. The network is a sync channel, not a gate.',
      'list', `.fxcol{width:min(280px,80%)}.fx>u{display:none}.fx:nth-child(1)::after{content:'\u5df2\u540c\u6b65';color:#4d8ba6;font:500 11px var(--fx-mono,monospace)}.fx:nth-child(2)::after{content:'\u5f85\u540c\u6b65 \u2191';color:#c07a3a;font:500 11px var(--fx-mono,monospace)}.fx:nth-child(3)::after{content:'\u4ec5\u672c\u5730';color:#8b8d84;font:500 11px var(--fx-mono,monospace)}.fx:nth-child(n+4){display:none}`)
  ]
};
