const P = (k, zh, en, min, max, step, def, unit) => ({ k, zh, en, min, max, step, def, unit: unit || '' });
const E = 'cubic-bezier(.22,1,.36,1)';

export default {
  id: 'loading', zh: '加载与状态', en: 'Loading & states',
  dz: '等待、成功、失败、空空如也', de: 'Waiting, success, failure, empty',
  items: [
    { id: 'spinner', zh: '转圈', en: 'Spinner', dz: '最常见的等待指示', de: 'The default wait indicator',
      pz: '一段圆弧无限 rotate，linear，1s 内一圈。', pe: 'An arc rotating linearly, about one turn per second.',
      demo: 'loader', params: [P('t', '周期', 'Cycle', .4, 3, .1, .9, 's')],
      css: `@keyframes fxk{to{transform:rotate(1turn)}}.fx{width:52px;height:52px;border-radius:50%;background:none;border:4px solid #e4e5e0;border-top-color:#23232f;animation:fxk var(--t,.9s) linear infinite}.fx:nth-child(n+2){display:none}` },

    { id: 'dots', zh: '三点跳动', en: 'Bouncing dots', dz: '三个点依次弹起', de: 'Three dots bounce in turn',
      pz: '每个点 delay 差 160ms，幅度不超过自身直径。', pe: 'Stagger by 160ms; travel no further than one dot diameter.',
      demo: 'loader', css: `@keyframes fxk{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-14px);opacity:1}}.fx{width:14px;height:14px;animation:fxk 1.1s ease-in-out infinite;animation-delay:calc(var(--i)*160ms)}` },

    { id: 'pulse', zh: '呼吸点', en: 'Pulsing dots', dz: '点在原地放大缩小', de: 'Dots swell in place',
      pz: 'scale + opacity 同步呼吸，比跳动更安静。', pe: 'scale with opacity — quieter than bouncing.',
      demo: 'loader', css: `@keyframes fxk{0%,100%{transform:scale(.6);opacity:.35}50%{transform:scale(1);opacity:1}}.fx{width:18px;height:18px;animation:fxk 1.2s ease-in-out infinite;animation-delay:calc(var(--i)*180ms)}` },

    { id: 'equalizer', zh: '音柱', en: 'Equalizer bars', dz: '几根柱子上下起伏', de: 'Bars rise and fall like a meter',
      pz: '每根柱不同 delay 与不同 duration，才不显得机械。', pe: 'Vary both delay and duration per bar so it is not robotic.',
      demo: 'loader', css: `@keyframes fxk{0%,100%{height:14px}50%{height:44px}}.fx{width:8px;height:14px;border-radius:4px;animation:fxk .9s ease-in-out infinite;animation-delay:calc(var(--i)*140ms)}` },

    { id: 'indeterminate', zh: '不确定进度条', en: 'Indeterminate bar', dz: '一段光在轨道里来回跑', de: 'A segment sweeps along the track',
      pz: '不知道进度时用它；知道进度就一定要用确定型。', pe: 'Only when progress is unknown — otherwise show real progress.',
      demo: 'loader', css: `@keyframes fxk{0%{left:-35%;width:35%}50%{width:55%}100%{left:100%;width:35%}}.fxload{width:min(360px,72%)}.fx{width:100%;height:6px;border-radius:3px;background:#eceef1;position:relative;overflow:hidden}.fx::after{content:'';position:absolute;top:0;bottom:0;background:#e8879c;border-radius:3px;animation:fxk 1.4s ${E} infinite}.fx:nth-child(n+2){display:none}` },

    { id: 'determinate', zh: '确定进度条', en: 'Determinate bar', dz: '按真实百分比推进', de: 'Advances by real percentage',
      pz: '过渡 width，别回退；到 100% 后停留一下再消失。', pe: 'Transition width, never backwards; hold at 100% before dismissing.',
      demo: 'loader', params: [P('v', '进度', 'Progress', 0, 100, 1, 64, '')],
      css: `.fxload{width:min(360px,72%)}.fx{width:100%;height:10px;border-radius:5px;background:#eceef1;position:relative}.fx::after{content:'';position:absolute;left:0;top:0;bottom:0;width:calc(var(--v,64)*1%);background:#4d8ba6;border-radius:5px;transition:width .4s ${E}}.fx:nth-child(n+2){display:none}` },

    { id: 'skeleton', zh: '骨架屏', en: 'Skeleton', dz: '内容形状的灰块占位', de: 'Grey blocks in the shape of the content',
      pz: '骨架要和真实内容同尺寸同位置，否则加载完会跳。', pe: 'Match the real content’s size and position or the page will jump.',
      demo: 'list', css: `.fx i,.fx u{background:#eceef1}.fx{border-color:#eceee6}` },

    { id: 'shimmer', zh: '骨架微光', en: 'Skeleton shimmer', dz: '灰块上有一道光扫过', de: 'A highlight sweeps across the grey',
      pz: '斜向高光带循环平移，速度别太快（1.4–1.8s）。', pe: 'A diagonal highlight looping at 1.4–1.8s.',
      demo: 'list', css: `@keyframes fxk{to{background-position:200% 0}}.fx i,.fx u{background:linear-gradient(100deg,#eceef1 30%,#f4f5f1 50%,#eceef1 70%);background-size:200% 100%;animation:fxk 1.6s linear infinite}` },

    { id: 'staggerskel', zh: '骨架错峰', en: 'Staggered skeleton', dz: '骨架行依次亮起', de: 'Skeleton rows pulse in sequence',
      pz: '每行 delay 递增，暗示内容正在陆续到达。', pe: 'Stagger the rows to suggest content streaming in.',
      demo: 'list', css: `@keyframes fxk{0%,100%{opacity:.45}50%{opacity:1}}.fx{animation:fxk 1.4s ease-in-out infinite;animation-delay:calc(var(--i)*120ms)}.fx i,.fx u{background:#eceef1}` },

    { id: 'blurup', zh: '模糊图占位', en: 'Blur-up image', dz: '先小糊图，再换清晰图', de: 'A tiny blurred image resolves into the real one',
      pz: '先加载 20px 缩略图放大模糊，真实图加载完淡入替换。', pe: 'Load a 20px thumbnail blurred up, then cross-fade the full image.',
      demo: 'cards', css: `@keyframes fxk{0%{filter:blur(14px)}100%{filter:blur(0)}}.fx b{height:110px;background:linear-gradient(135deg,#4d8ba6,#f0c9a8);animation:fxk 1.6s ease-out infinite alternate}` },

    { id: 'btnspin', zh: '按钮内加载', en: 'Loading button', dz: '按钮自己转起来，宽度不变', de: 'The button spins in place, width unchanged',
      pz: '锁定按钮宽度再换内容，避免布局跳动；同时 disabled。', pe: 'Lock the width before swapping content, and disable it.',
      demo: 'loader', css: `@keyframes fxk{to{transform:rotate(1turn)}}.fxload{gap:0}.fx{width:180px;height:52px;border-radius:26px;background:#e8879c;position:relative}.fx::after{content:'';position:absolute;left:50%;top:50%;width:20px;height:20px;margin:-10px 0 0 -10px;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:fxk .8s linear infinite}.fx:nth-child(n+2){display:none}` },

    { id: 'success', zh: '成功打钩', en: 'Success check', dz: '圆圈画完再打钩', de: 'The circle draws, then the tick',
      pz: '两段动画串联：环 800ms、钩 300ms，共 1.1s 内结束。', pe: 'Sequence: ring 800ms then tick 300ms, done inside 1.1s.',
      demo: 'loader', css: `@keyframes fxr{from{transform:rotate(0);clip-path:inset(0 0 0 50%)}to{transform:rotate(1turn);clip-path:inset(0)}}@keyframes fxc{0%,45%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}.fx{width:88px;height:88px;border-radius:50%;background:none;border:4px solid #4d8ba6;position:relative;animation:fxr 1.6s ${E} infinite}.fx::after{content:'✓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:42px;color:#4d8ba6;animation:fxc 1.6s ${E} infinite}.fx:nth-child(n+2){display:none}` },

    { id: 'errorshake', zh: '错误抖动', en: 'Error shake', dz: '输入框左右抖一下', de: 'The field shakes side to side',
      pz: '抖动 ≤ 3 个来回，同时把边框换成错误色并给出文字说明。', pe: 'Three passes max, plus an error border and a written reason.',
      demo: 'loader', css: `@keyframes fxk{10%,90%{transform:translateX(-6px)}30%,70%{transform:translateX(7px)}50%{transform:translateX(-7px)}}.fxload{gap:0}.fx{width:300px;height:52px;border-radius:10px;background:#fcfcfb;border:2px solid #e8879c;animation:fxk .55s both infinite}.fx:nth-child(n+2){display:none}` },

    { id: 'toast', zh: '轻提示滑入', en: 'Toast', dz: '角落滑出一条提示', de: 'A message slides in from the corner',
      pz: '从边缘 translate + fade 进入，4s 后自动消失，可堆叠。', pe: 'Slide and fade from the edge, auto-dismiss after 4s, stackable.',
      demo: 'loader', css: `@keyframes fxk{0%{transform:translateY(30px);opacity:0}15%,80%{transform:none;opacity:1}100%{transform:translateY(30px);opacity:0}}.fxload{gap:0}.fx{width:300px;height:56px;border-radius:12px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);box-shadow:0 12px 30px rgba(48,66,92,.25);animation:fxk 3.2s ${E} infinite}.fx:nth-child(n+2){display:none}` },

    { id: 'topbar', zh: '顶部加载条', en: 'Top page bar', dz: '页面顶部一条细进度', de: 'A thin bar across the top of the page',
      pz: '路由切换时出现，先冲到 80% 再等真实完成。', pe: 'Show on navigation, rush to 80%, then wait for the real finish.',
      demo: 'loader', css: `@keyframes fxk{0%{width:0}60%{width:80%}100%{width:100%}}.fxload{width:min(420px,80%)}.fx{width:100%;height:4px;background:#eceef1;position:relative;border-radius:2px}.fx::after{content:'';position:absolute;left:0;top:0;bottom:0;background:#e8879c;border-radius:2px;animation:fxk 2.4s ${E} infinite}.fx:nth-child(n+2){display:none}` },

    { id: 'typing', zh: '正在输入', en: 'Typing indicator', dz: '聊天气泡里的三个点', de: 'Three dots inside a chat bubble',
      pz: '气泡 + 三点跳动，收到消息后气泡原地变成内容。', pe: 'Bubble with bouncing dots; it morphs into the message on arrival.',
      demo: 'loader', css: `@keyframes fxk{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-7px);opacity:1}}.fxload{background:#eceee6;padding:16px 20px;border-radius:20px 20px 20px 6px}.fx{width:10px;height:10px;animation:fxk 1.1s ease-in-out infinite;animation-delay:calc(var(--i)*150ms)}` },

    { id: 'uploadring', zh: '上传圆环', en: 'Upload ring', dz: '环形显示上传百分比', de: 'A ring shows upload percentage',
      pz: 'conic-gradient 绑定真实进度，中间放取消按钮。', pe: 'Bind a conic-gradient to real progress, cancel button inside.',
      demo: 'loader', params: [P('v', '进度', 'Progress', 0, 100, 1, 45, '')],
      css: `.fx{width:110px;height:110px;border-radius:50%;background:conic-gradient(#4d8ba6 calc(var(--v,45)*1%),#eceef1 0);position:relative}.fx::after{content:'';position:absolute;inset:12px;border-radius:50%;background:#fcfcfb}.fx:nth-child(n+2){display:none}` },

    { id: 'pullrefresh', zh: '下拉刷新', en: 'Pull to refresh', dz: '下拉露出转圈图标', de: 'Pulling down reveals the spinner',
      pz: '下拉距离映射到图标旋转角度，松手后再进入无限旋转。', pe: 'Map pull distance to rotation, then switch to an endless spin on release.',
      demo: 'loader', css: `@keyframes fxk{0%{transform:translateY(-30px) rotate(0);opacity:0}50%{transform:translateY(0) rotate(180deg);opacity:1}100%{transform:translateY(-30px) rotate(360deg);opacity:0}}.fx{width:38px;height:38px;border-radius:50%;background:none;border:3px solid #e4e5e0;border-top-color:#4d8ba6;animation:fxk 2s ${E} infinite}.fx:nth-child(n+2){display:none}` },

    { id: 'countdown', zh: '倒计时环', en: 'Countdown ring', dz: '环随时间缩短', de: 'The ring drains with time',
      pz: 'conic 角度从 100% 到 0，最后 3 秒变为警示色。', pe: 'Conic angle 100% → 0, switching to the alert color in the last 3s.',
      demo: 'loader', css: `@keyframes fxk{from{background:conic-gradient(#4d8ba6 100%,#eceef1 0)}to{background:conic-gradient(#e8879c 0%,#eceef1 0)}}.fx{width:110px;height:110px;border-radius:50%;animation:fxk 4s linear infinite}.fx:nth-child(n+2){display:none}` },

    { id: 'empty', zh: '空状态', en: 'Empty state', dz: '什么都没有的时候说点什么', de: 'Say something when there is nothing',
      pz: '一句解释 + 一个明确的下一步动作，别只放个灰图。', pe: 'One line of explanation plus one clear next action.',
      demo: 'loader', css: `@keyframes fxk{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}.fxload{flex-direction:column;gap:14px}.fx{width:220px;height:12px;border-radius:6px;background:#eceef1;animation:fxk .8s ${E} infinite alternate;animation-delay:calc(var(--i)*140ms)}.fx:nth-child(3){width:130px;height:38px;border-radius:19px;background:#e8879c}` },

    { id: 'offline', zh: '离线横幅', en: 'Offline banner', dz: '断网时顶部压下来一条', de: 'A bar drops in when the network goes',
      pz: '从顶部 translateY 推入，恢复时自动收起并提示已重连。', pe: 'Push in from the top; retract automatically on reconnect.',
      demo: 'loader', css: `@keyframes fxk{0%{transform:translateY(-100%)}20%,80%{transform:none}100%{transform:translateY(-100%)}}.fxload{width:min(420px,80%);overflow:hidden}.fx{width:100%;height:44px;border-radius:8px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);animation:fxk 3.4s ${E} infinite}.fx:nth-child(n+2){display:none}` },

    { id: 'retry', zh: '重试脉冲', en: 'Retry pulse', dz: '失败后按钮轻轻呼吸提示可重试', de: 'The retry button breathes after a failure',
      pz: '低频 scale 脉冲（2s 一次），别做成闪烁。', pe: 'A slow 2s scale pulse — never a flash.',
      demo: 'loader', css: `@keyframes fxk{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(254,44,85,.4)}50%{transform:scale(1.04);box-shadow:0 0 0 14px rgba(254,44,85,0)}}.fx{width:150px;height:48px;border-radius:24px;background:#e8879c;animation:fxk 2s ease-in-out infinite}.fx:nth-child(n+2){display:none}` },

    { id: 'stepload', zh: '分步加载', en: 'Step loader', dz: '一步步告诉你在干什么', de: 'Tells you which step it is on',
      pz: '长任务把进度拆成有名字的步骤，比一个转圈更耐等。', pe: 'Name the steps for long jobs — far more tolerable than a spinner.',
      demo: 'loader', css: `@keyframes fxk{0%,100%{background:#eceef1}50%{background:#4d8ba6}}.fxload{flex-direction:column;align-items:flex-start;gap:12px}.fx{width:240px;height:10px;border-radius:5px;animation:fxk 2.4s ease-in-out infinite;animation-delay:calc(var(--i)*400ms)}` },

    { id: 'optimistic', zh: '乐观更新', en: 'Optimistic update', dz: '先当成功显示，失败再回退', de: 'Show success first, roll back on failure',
      pz: '立刻更新 UI 并轻微降透明度表示未确认，失败时回滚 + 提示。', pe: 'Update immediately at slight opacity; roll back with a message on failure.',
      demo: 'list', css: `@keyframes fxk{0%,60%{opacity:.5}100%{opacity:1}}.fx:first-child{animation:fxk 2s ease infinite alternate;border-color:#4d8ba6}` },

    { id: 'progresslist', zh: '批量进度', en: 'Batch progress', dz: '多个任务各自的进度', de: 'Per-item progress in a batch',
      pz: '每行一条小进度 + 总进度在顶部，失败行单独标红。', pe: 'A bar per row with an overall bar on top; failures flagged inline.',
      demo: 'list', css: `.fx u{background:linear-gradient(90deg,#4d8ba6 var(--w,40%),#eceef1 0)}.fx:nth-child(1) u{--w:80%}.fx:nth-child(2) u{--w:55%}.fx:nth-child(3) u{--w:32%}.fx:nth-child(4) u{--w:96%}.fx:nth-child(5) u{--w:12%}` }
  ]
};
