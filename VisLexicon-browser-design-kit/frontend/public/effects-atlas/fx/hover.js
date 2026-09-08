const P = (k, zh, en, min, max, step, def, unit) => ({ k, zh, en, min, max, step, def, unit: unit || '' });
const E = 'cubic-bezier(.22,1,.36,1)';
const HOV = '.fx{cursor:pointer;transition:all .28s ' + E + '}';

export default {
  id: 'hover', zh: '悬停 / 微交互', en: 'Hover & micro-interaction',
  dz: '鼠标碰到时的反馈（请把鼠标移上去）', de: 'Feedback on hover — move your cursor over the demo',
  items: [
    { id: 'lift', zh: '悬浮抬起', en: 'Lift', dz: '卡片微微升起、影子变深', de: 'The card lifts and its shadow deepens',
      pz: 'translateY(-4px) + 阴影加深，200–280ms。', pe: 'translateY(-4px) with a deeper shadow over 200–280ms.',
      demo: 'cards', params: [P('y', '抬起', 'Lift', 1, 20, 1, 6, 'px')],
      css: `${HOV}.fx:hover{transform:translateY(calc(var(--y,6px)*-1));box-shadow:0 14px 30px rgba(48,66,92,.14)}` },

    { id: 'tilt', zh: '3D 倾斜', en: '3D tilt', dz: '卡片跟着鼠标方向倾斜', de: 'The card tips toward your cursor',
      pz: '按鼠标在卡内的相对位置计算 rotateX/rotateY，父级 perspective。', pe: 'Map cursor position inside the card to rotateX/rotateY under a perspective parent.',
      demo: 'cards', css: `.fxrow{perspective:900px}${HOV}.fx:hover{transform:rotateX(9deg) rotateY(-11deg) translateZ(14px);box-shadow:0 20px 40px rgba(48,66,92,.18)}` },

    { id: 'glow', zh: '光晕外扩', en: 'Glow', dz: '边缘泛起一圈柔光', de: 'A soft halo blooms at the edge',
      pz: 'box-shadow 用品牌色低透明度大扩散，别用 filter:blur。', pe: 'A wide, low-opacity brand-color box-shadow — not filter:blur.',
      demo: 'box', css: `.fx{transition:box-shadow .3s ${E};cursor:pointer}.fx:hover{box-shadow:0 0 0 6px rgba(254,44,85,.12),0 0 42px rgba(254,44,85,.35)}` },

    { id: 'borderdraw', zh: '边框描画', en: 'Border draw', dz: '边框沿四周画出来', de: 'The border draws itself around the box',
      pz: '两个伪元素各画两条边，用 scaleX/scaleY 顺序展开。', pe: 'Two pseudo-elements draw two edges each, scaling in sequence.',
      demo: 'box', css: `.fx{position:relative;background:#fcfcfb;color:#23232f;border:1px solid #e4e5e0;cursor:pointer}.fx::before,.fx::after{content:'';position:absolute;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);transition:transform .3s ${E}}.fx::before{left:0;top:0;height:2px;width:100%;transform:scaleX(0);transform-origin:left}.fx::after{right:0;top:0;width:2px;height:100%;transform:scaleY(0);transform-origin:top;transition-delay:.28s}.fx:hover::before{transform:scaleX(1)}.fx:hover::after{transform:scaleY(1)}` },

    { id: 'gradborder', zh: '流转渐变边', en: 'Rotating gradient border', dz: '边框上的光一直在转', de: 'Light keeps travelling around the border',
      pz: 'conic-gradient 背景 + 内层遮罩留出 1–2px 边，旋转角度。', pe: 'A conic-gradient background masked by an inner panel, with the angle animating.',
      demo: 'box', css: `@keyframes fxsp{to{transform:rotate(1turn)}}.fx{position:relative;background:#fcfcfb;color:#23232f;overflow:hidden}.fx::before{content:'';position:absolute;width:300%;height:300%;background:conic-gradient(#e8879c,#f4dcb8,#75c4d4,#e8879c);animation:fxsp 4s linear infinite}.fx::after{content:'Hover';position:absolute;inset:2px;background:#fcfcfb;border-radius:14px;display:flex;align-items:center;justify-content:center}` },

    { id: 'sweep', zh: '背景扫入', en: 'Background sweep', dz: '颜色从左扫满按钮', de: 'Color sweeps across the button',
      pz: '伪元素 scaleX(0)→1，transform-origin 悬停时左、离开时右。', pe: 'Pseudo-element scaleX(0)→1; origin left on enter, right on leave.',
      demo: 'box', css: `.fx{position:relative;overflow:hidden;background:#fcfcfb;color:#23232f;border:1px solid #23232f;cursor:pointer;transition:color .3s}.fx::before{content:'';position:absolute;inset:0;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);transform:scaleX(0);transform-origin:right;transition:transform .35s ${E}}.fx:hover{color:#fff}.fx:hover::before{transform:scaleX(1);transform-origin:left}` },

    { id: 'arrow', zh: '箭头前移', en: 'Arrow nudge', dz: '悬停时箭头往前挪一格', de: 'The arrow nudges forward on hover',
      pz: '只位移箭头（4–6px），文字不动，短促 180ms。', pe: 'Move only the arrow 4–6px in 180ms; the label stays put.',
      demo: 'box', css: `.fx{background:#fcfcfb;color:#23232f;border:1px solid #e0e2e6;cursor:pointer;gap:8px}.fx::after{content:'→';display:inline-block;transition:transform .18s ${E}}.fx:hover::after{transform:translateX(7px)}` },

    { id: 'imgzoom', zh: '图片内缩放', en: 'Image zoom in frame', dz: '框不动，里面的图放大', de: 'The frame holds still while the image grows',
      pz: '外框 overflow:hidden，内图 scale(1.06)，400ms。', pe: 'Overflow-hidden frame, inner image scale(1.06) over 400ms.',
      demo: 'cards', css: `.fx{overflow:hidden;cursor:pointer}.fx b{background:linear-gradient(135deg,#4d8ba6,#e5a68f);transition:transform .45s ${E};height:110px}.fx:hover b{transform:scale(1.12)}` },

    { id: 'caption', zh: '说明层上滑', en: 'Caption slide up', dz: '悬停时底部滑出说明', de: 'A caption slides up from the bottom',
      pz: '覆盖层 translateY(100%)→0，带渐变遮罩保证文字可读。', pe: 'Overlay translateY(100%)→0 with a gradient scrim for legibility.',
      demo: 'cards', css: `.fx{position:relative;overflow:hidden;cursor:pointer}.fx::after{content:'Details';position:absolute;left:0;right:0;bottom:0;padding:14px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:#fff;font-size:12px;transform:translateY(100%);transition:transform .3s ${E}}.fx:hover::after{transform:none}` },

    { id: 'spotlight', zh: '聚光跟随', en: 'Cursor spotlight', dz: '鼠标位置亮起一团光', de: 'A soft light follows the cursor',
      pz: '把鼠标坐标写进 CSS 变量，radial-gradient 跟着变位置。', pe: 'Write cursor coords into CSS vars and position a radial-gradient with them.',
      demo: 'box', css: `.fx{position:relative;overflow:hidden;background:#1b1b26;cursor:pointer}.fx::after{content:'';position:absolute;inset:0;background:radial-gradient(160px circle at 30% 30%,rgba(254,44,85,.4),transparent 70%);opacity:0;transition:opacity .3s}.fx:hover::after{opacity:1}` },

    { id: 'press', zh: '按压回弹', en: 'Press', dz: '按下去有真实的下沉感', de: 'Real depression on press',
      pz: 'active 时 translateY(1px) + 内阴影，松开回弹要快。', pe: 'On :active translateY(1px) with an inset shadow; release fast.',
      demo: 'box', css: `.fx{background:#e8879c;cursor:pointer;transition:transform .12s ${E},box-shadow .12s;box-shadow:0 6px 0 #b81f3f}.fx:active{transform:translateY(5px);box-shadow:0 1px 0 #b81f3f}` },

    { id: 'ripple', zh: '水波扩散', en: 'Ripple', dz: '点击处扩散一圈波纹', de: 'A ripple spreads from the click point',
      pz: '在点击坐标插入一个圆并 scale+fade，动画结束移除。', pe: 'Insert a circle at the click point, scale + fade it, then remove.',
      demo: 'box', css: `@keyframes fxr{from{transform:scale(0);opacity:.45}to{transform:scale(3);opacity:0}}.fx{position:relative;overflow:hidden;cursor:pointer}.fx::after{content:'';position:absolute;width:120px;height:120px;border-radius:50%;background:#fcfcfb;opacity:0}.fx:hover::after{animation:fxr .7s ease-out infinite}` },

    { id: 'invert', zh: '反色翻转', en: 'Invert', dz: '黑白对调', de: 'Black and white swap',
      pz: '同时过渡 background 与 color，保持 4.5:1 对比。', pe: 'Transition background and color together, keeping 4.5:1 contrast.',
      demo: 'box', css: `.fx{background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:#fff;cursor:pointer;transition:background .25s,color .25s}.fx:hover{background:#f0c9a8;color:#23232f}` },

    { id: 'squeeze', zh: '挤压反馈', en: 'Squeeze', dz: '被按住时轻微缩小', de: 'Shrinks slightly while held',
      pz: ':active 时 scale(.96)，别超过 .94 否则廉价。', pe: 'scale(.96) on :active; below .94 starts to look cheap.',
      demo: 'box', css: `.fx{cursor:pointer;transition:transform .15s ${E}}.fx:active{transform:scale(.94)}` },

    { id: 'shadowspread', zh: '影子铺开', en: 'Shadow spread', dz: '影子变大变虚，元素不动', de: 'The shadow grows softer without moving the element',
      pz: '只过渡 box-shadow 的模糊与扩散半径。', pe: 'Transition only the shadow blur and spread.',
      demo: 'cards', css: `${HOV}.fx:hover{box-shadow:0 18px 50px -12px rgba(48,66,92,.3)}` },

    { id: 'siblingblur', zh: '兄弟元素退让', en: 'Siblings recede', dz: '悬停一张，其他张变淡', de: 'Hovering one card dims the others',
      pz: '父级 :hover 时给所有子项降透明度，被 hover 的恢复。', pe: 'On parent hover dim all children; restore the hovered one.',
      demo: 'cards', css: `.fxrow:hover .fx{opacity:.42;filter:saturate(.4);transform:scale(.97)}.fx{transition:all .3s ${E}}.fxrow .fx:hover{opacity:1;filter:none;transform:scale(1.03)}` },

    { id: 'saturate', zh: '灰度转彩色', en: 'Grayscale to color', dz: '悬停时照片恢复颜色', de: 'The photo regains its color on hover',
      pz: 'filter:grayscale(1)→0，400ms，配合轻微亮度提升。', pe: 'filter grayscale(1)→0 over 400ms with a small brightness bump.',
      demo: 'cards', css: `.fx b{background:linear-gradient(135deg,#e8879c,#f4dcb8);filter:grayscale(1);transition:filter .45s ease}.fx:hover b{filter:none}.fx{cursor:pointer}` },

    { id: 'textswap', zh: '文案上下替换', en: 'Label swap', dz: '悬停时标签整行换掉', de: 'The label rolls over to a second one',
      pz: '两行文字上下排列，容器高度固定，hover 时 translateY(-100%)。', pe: 'Two stacked labels in a fixed-height slot, translateY(-100%) on hover.',
      demo: 'box', css: `.fx{overflow:hidden;cursor:pointer;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}.fx::after{content:'Buy now';display:block;transition:transform .3s ${E}}.fx:hover::after{transform:translateY(-100%)}` },

    { id: 'checkbox', zh: '勾选打钩', en: 'Checkbox tick', dz: '打钩时线条被画出来', de: 'The tick draws itself',
      pz: 'SVG path 的 stroke-dashoffset 从满到 0。', pe: 'Animate an SVG path stroke-dashoffset from full to zero.',
      demo: 'box', css: `.fx{width:80px;height:80px;border-radius:20px;background:#fcfcfb;border:2px solid #d9d9d9;cursor:pointer;transition:all .25s ${E}}.fx::after{content:'✓';font-size:38px;color:#fff;transform:scale(0);transition:transform .25s cubic-bezier(.34,1.56,.64,1)}.fx:hover{background:#4d8ba6;border-color:#4d8ba6}.fx:hover::after{transform:scale(1)}` },

    { id: 'toggle', zh: '开关切换', en: 'Toggle switch', dz: '滑块滑到另一端并变色', de: 'The knob slides across and the track recolors',
      pz: '轨道背景色 + 滑块 translateX 同步过渡，200ms。', pe: 'Track color and knob translateX transition together in 200ms.',
      demo: 'box', css: `.fx{width:120px;height:64px;border-radius:32px;background:#d9d9d9;justify-content:flex-start;padding:6px;cursor:pointer;transition:background .22s}.fx::after{content:'';width:52px;height:52px;border-radius:50%;background:#fcfcfb;box-shadow:0 2px 6px rgba(0,0,0,.2);transition:transform .22s ${E}}.fx:hover{background:#4d8ba6}.fx:hover::after{transform:translateX(56px)}` },

    { id: 'star', zh: '星标点亮', en: 'Star fill', dz: '收藏时星星填色并弹一下', de: 'The star fills and pops',
      pz: '颜色过渡 + 一次 scale 过冲，可加细碎粒子。', pe: 'Color transition plus one scale overshoot; optional sparkle particles.',
      demo: 'box', css: `.fx{background:transparent;color:#d4d6dc;font-size:80px;cursor:pointer;transition:color .2s,transform .3s cubic-bezier(.34,1.56,.64,1)}.fx::after{content:'★'}.fx:hover{color:#f4dcb8;transform:scale(1.18) rotate(6deg)}` },

    { id: 'copyfb', zh: '复制反馈', en: 'Copy confirmation', dz: '点完变成“已复制”', de: 'The button turns into “Copied”',
      pz: '文案与图标切换 + 1.5s 后自动回退，别用弹窗。', pe: 'Swap label and icon, revert after 1.5s — no modal needed.',
      demo: 'box', css: `.fx{background:#fcfcfb;color:#23232f;border:1px solid #e0e2e6;cursor:pointer;transition:all .2s}.fx::after{content:'Copy'}.fx:hover{background:#eaf3e6;border-color:#4d8ba6;color:#4d8ba6}.fx:hover::after{content:'✓ Copied'}` },

    { id: 'chevron', zh: '箭头旋转展开', en: 'Chevron rotate', dz: '折叠箭头转 180 度', de: 'The chevron flips 180°',
      pz: 'rotate(180deg) 过渡，与内容展开同时长同缓动。', pe: 'rotate(180deg) matching the panel’s duration and easing.',
      demo: 'box', css: `.fx{background:#fcfcfb;color:#23232f;border:1px solid #e0e2e6;cursor:pointer}.fx::after{content:'⌄';font-size:34px;line-height:0;transition:transform .3s ${E}}.fx:hover::after{transform:rotate(180deg)}` },

    { id: 'tooltip', zh: '提示气泡', en: 'Tooltip', dz: '悬停 400ms 后浮出提示', de: 'A tip floats up after a 400ms delay',
      pz: '给显示加 transition-delay，隐藏不加，避免闪烁。', pe: 'Delay on show, none on hide, so it does not flicker.',
      demo: 'box', css: `.fx{position:relative;cursor:pointer;overflow:visible}.fx::after{content:'Tooltip';position:absolute;bottom:calc(100% + 10px);padding:7px 11px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:#fff;font-size:12px;border-radius:6px;white-space:nowrap;opacity:0;transform:translateY(6px);transition:all .2s ${E}}.fx:hover::after{opacity:1;transform:none;transition-delay:.35s}` },

    { id: 'magnet', zh: '磁吸按钮', en: 'Magnetic button', dz: '鼠标靠近时按钮被吸过去', de: 'The button leans toward the cursor',
      pz: '监听 mousemove，按距离把按钮位移 6–12px，离开回弹。', pe: 'On mousemove translate the button 6–12px toward the pointer; spring back on leave.',
      demo: 'box', css: `.fx{background:#e8879c;cursor:pointer;transition:transform .35s ${E}}.fx:hover{transform:translate(10px,-8px) scale(1.06)}` },

    { id: 'skelfill', zh: '骨架转内容', en: 'Skeleton to content', dz: '灰条被真实内容替换', de: 'Grey bars give way to real content',
      pz: '内容淡入时骨架淡出，两者高度一致避免跳动。', pe: 'Cross-fade with matching heights so nothing jumps.',
      demo: 'list', css: `.fx u{background:#e9eaee;transition:background .3s,width .3s}.fx:hover u{background:#4d8ba6;width:60%}.fx{cursor:pointer}` },

    { id: 'badgepop', zh: '角标弹出', en: 'Badge pop', dz: '数字角标弹一下提醒', de: 'The count badge pops',
      pz: 'scale(0)→1 用 out-back，数值变化时再弹一次。', pe: 'scale(0)→1 with out-back; re-pop whenever the value changes.',
      demo: 'box', css: `.fx{position:relative;overflow:visible;cursor:pointer}.fx::after{content:'3';position:absolute;top:-10px;right:-10px;width:30px;height:30px;border-radius:50%;background:#e8879c;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;transform:scale(0);transition:transform .3s cubic-bezier(.34,1.56,.64,1)}.fx:hover::after{transform:scale(1)}` },

    { id: 'focusring', zh: '键盘焦点环', en: 'Focus ring', dz: '键盘选中时的清晰外圈', de: 'A crisp ring for keyboard focus',
      pz: '用 :focus-visible + outline-offset，别删掉默认焦点样式。', pe: 'Use :focus-visible with outline-offset — never remove focus styles.',
      demo: 'box', css: `.fx{cursor:pointer;transition:box-shadow .15s}.fx:hover{box-shadow:0 0 0 3px #fff,0 0 0 6px #23232f}` },

    { id: 'underlinehov', zh: '下划线滑动', en: 'Underline slide', dz: '下划线从左进、从右出', de: 'The underline enters left and exits right',
      pz: '进入与离开切换 transform-origin，是细节感的关键。', pe: 'Swap transform-origin between enter and leave — that is the detail.',
      demo: 'box', css: `.fx{background:transparent;color:#23232f;font-size:22px;font-weight:700;position:relative;width:auto;height:auto;padding:6px 2px;cursor:pointer}.fx::after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:#e8879c;transform:scaleX(0);transform-origin:right;transition:transform .3s ${E}}.fx:hover::after{transform:scaleX(1);transform-origin:left}` },

    { id: 'cursorgrow', zh: '自定义光标放大', en: 'Custom cursor grow', dz: '光标在可点区域变大', de: 'The cursor swells over clickable areas',
      pz: '自绘光标元素跟随 mousemove，hover 目标时 scale 放大。', pe: 'A custom cursor element follows mousemove and scales up over targets.',
      demo: 'box', css: `.fx{position:relative;cursor:none;overflow:visible}.fx::after{content:'';position:absolute;width:18px;height:18px;border-radius:50%;background:#e8879c;transition:transform .25s ${E}}.fx:hover::after{transform:scale(3.4);opacity:.35}` }
  ]
};
