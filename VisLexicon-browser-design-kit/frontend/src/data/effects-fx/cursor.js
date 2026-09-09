export default {
  "id": "cursor",
  "zh": "光标与指针",
  "en": "Cursor & pointer",
  "dz": "指针本身就是一层界面",
  "de": "The pointer is a layer of interface",
  "items": [
    {
      "id": "cursorstate",
      "zh": "光标语义",
      "en": "Cursor semantics",
      "dz": "形状告诉你能干什么",
      "de": "The shape says what is possible",
      "pz": "可点用 pointer、禁用用 not-allowed、可拖用 grab。",
      "pe": "pointer for clickable, not-allowed for disabled, grab for draggable.",
      "demo": "grid",
      "params": [
        {
          "k": "c",
          "zh": "类型",
          "en": "Cursor",
          "opts": [
            {
              "v": "pointer",
              "zh": "可点",
              "en": "pointer"
            },
            {
              "v": "grab",
              "zh": "可拖",
              "en": "grab"
            },
            {
              "v": "not-allowed",
              "zh": "禁用",
              "en": "not-allowed"
            },
            {
              "v": "zoom-in",
              "zh": "放大",
              "en": "zoom-in"
            },
            {
              "v": "text",
              "zh": "文本",
              "en": "text"
            }
          ],
          "def": "pointer"
        }
      ],
      "css": ".fx{cursor:var(--c,pointer);background:#f4f5f1}.fx:hover{background:#fcfcfb;border-color:#23232f}"
    },
    {
      "id": "dotcursor",
      "zh": "圆点光标",
      "en": "Dot cursor",
      "dz": "一个小圆跟着走",
      "de": "A small dot follows",
      "pz": "隐藏系统光标要谨慎，键盘用户必须还能操作。",
      "pe": "Hiding the system cursor is risky — keep keyboard access.",
      "demo": "surface",
      "css": "@keyframes fxk{0%{left:22%;top:30%}35%{left:70%;top:38%}70%{left:48%;top:70%}100%{left:22%;top:30%}}.fxsurface{background:#fdfdfe}.fx{width:12px;height:12px;border-radius:50%;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);inset:auto;position:absolute;animation:fxk 5s cubic-bezier(.22,1,.36,1) infinite}"
    },
    {
      "id": "trailingring",
      "zh": "滞后光圈",
      "en": "Trailing ring",
      "dz": "外圈慢一拍跟上来",
      "de": "The ring lags a beat behind",
      "pz": "外圈用 lerp 0.15 跟随，内点即时，差速就是质感。",
      "pe": "Lerp the ring at 0.15 while the dot is instant.",
      "demo": "surface",
      "css": "@keyframes fxk{0%{left:24%;top:32%}35%{left:70%;top:40%}70%{left:46%;top:68%}100%{left:24%;top:32%}}.fxsurface{background:#fdfdfe}.fx{position:absolute;inset:auto;width:38px;height:38px;border-radius:50%;border:1.5px solid #23232f;background:transparent;animation:fxk 5s cubic-bezier(.4,0,.2,1) infinite;animation-delay:.12s}.fx::after{content:'';position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px;border-radius:50%;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}"
    },
    {
      "id": "cursorgrow",
      "zh": "光标放大",
      "en": "Cursor grows",
      "dz": "悬停可点元素时变大",
      "de": "It swells over anything clickable",
      "pz": "进入可点区域放大到 2.5×并降透明度。",
      "pe": "Scale to 2.5× and lower the alpha over targets.",
      "demo": "shape",
      "css": "@keyframes fxk{0%,45%{transform:scale(1);opacity:1}55%,100%{transform:scale(2.6);opacity:.28}}.fxshape{transform:scale(.3)}.fx{border-radius:50%;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);animation:fxk 2.6s cubic-bezier(.22,1,.36,1) infinite}"
    },
    {
      "id": "cursorlabel",
      "zh": "光标带文字",
      "en": "Cursor label",
      "dz": "光标里写着“查看”",
      "de": "“View” written in the cursor",
      "pz": "文字随光标移动，进入时 scale + fade 一起。",
      "pe": "The label rides the cursor, scaling and fading in together.",
      "demo": "shape",
      "css": "@keyframes fxk{0%,40%{transform:scale(0);opacity:0}55%,100%{transform:scale(1);opacity:1}}.fxshape{transform:scale(.6)}.fx{border-radius:50%;background:var(--fx-accent,#e8879c);display:flex;align-items:center;justify-content:center;color:#fff;font:600 15px/1 var(--fx-sans,system-ui);animation:fxk 2.6s cubic-bezier(.34,1.56,.64,1) infinite}.fx::after{content:'查看'}"
    },
    {
      "id": "magnetcursor",
      "zh": "磁吸光标",
      "en": "Magnetic cursor",
      "dz": "靠近按钮就被吸住",
      "de": "It gets caught by the button",
      "pz": "进入吸附半径后光标贴合元素形状。",
      "pe": "Inside the radius, the cursor morphs to the target shape.",
      "demo": "pill",
      "css": ".fx{transition:transform .2s cubic-bezier(.22,1,.36,1)}.fx:hover{transform:scale(1.08)}.fx:nth-child(2):hover{box-shadow:0 0 0 3px rgba(48,66,92,.1)}"
    },
    {
      "id": "blendcursor",
      "zh": "反色光标",
      "en": "Inverting cursor",
      "dz": "经过深色就自动反白",
      "de": "It inverts over dark areas",
      "pz": "mix-blend-mode:difference，一层解决所有底色。",
      "pe": "mix-blend-mode:difference handles every background.",
      "demo": "surface",
      "css": "@keyframes fxk{0%{left:16%}50%{left:74%}100%{left:16%}}.fxsurface{background:linear-gradient(90deg,#fff 0 50%,#23232f 50%)}.fx{position:absolute;inset:auto;top:42%;width:44px;height:44px;border-radius:50%;background:#fcfcfb;mix-blend-mode:difference;animation:fxk 4s ease-in-out infinite}"
    },
    {
      "id": "crosshair",
      "zh": "十字准线",
      "en": "Crosshair",
      "dz": "两条线跟着指针延伸",
      "de": "Two lines track the pointer",
      "pz": "图表取值、地图定位常用，线要 1px 且半透明。",
      "pe": "For charts and maps — 1px and semi-transparent.",
      "demo": "surface",
      "css": "@keyframes fxx{0%{left:24%}50%{left:70%}100%{left:24%}}@keyframes fxy{0%{top:34%}50%{top:64%}100%{top:34%}}.fxsurface{background:#fdfdfe}.fx{background:transparent}.fxsurface::before{content:'';position:absolute;top:0;bottom:0;width:1px;background:rgba(48,66,92,.35);animation:fxx 5s ease-in-out infinite}.fxsurface::after{content:'';position:absolute;left:0;right:0;height:1px;background:rgba(48,66,92,.35);animation:fxy 5s ease-in-out infinite}"
    },
    {
      "id": "spotlightcursor",
      "zh": "光标聚光",
      "en": "Cursor spotlight",
      "dz": "指针周围亮一圈",
      "de": "A pool of light round the pointer",
      "pz": "径向渐变随指针，半径 160–240px，强度别超 16%。",
      "pe": "A 160–240px radial that stays under 16% alpha.",
      "demo": "surface",
      "css": "@keyframes fxk{0%{background-position:24% 32%}50%{background-position:72% 62%}100%{background-position:24% 32%}}.fxsurface{background:#1b1b26}.fx{background:radial-gradient(circle 180px at center,rgba(254,44,85,.3),transparent 70%);background-repeat:no-repeat;background-size:600px 600px;animation:fxk 6s ease-in-out infinite}"
    },
    {
      "id": "hovercard3d",
      "zh": "指针驱动倾斜",
      "en": "Pointer-driven tilt",
      "dz": "整块跟着指针歪",
      "de": "The block leans with the pointer",
      "pz": "把指针相对中心归一化到 -1..1 再乘最大角度。",
      "pe": "Normalise the pointer offset to −1..1, then scale by max angle.",
      "demo": "card",
      "css": ".fxcard{perspective:900px}.fx{transition:transform .3s cubic-bezier(.22,1,.36,1)}.fx:hover{transform:rotateX(-7deg) rotateY(9deg)}"
    },
    {
      "id": "parallaxlayers",
      "zh": "指针视差层",
      "en": "Pointer parallax",
      "dz": "几层按不同幅度反向移动",
      "de": "Layers counter-move at different rates",
      "pz": "越靠前系数越大，背景层可以只动 2–4px。",
      "pe": "Bigger factor for nearer layers; the background only needs 2–4px.",
      "demo": "surface",
      "css": "@keyframes fxa{0%,100%{transform:translate(-8px,-4px)}50%{transform:translate(8px,4px)}}@keyframes fxb{0%,100%{transform:translate(16px,8px)}50%{transform:translate(-16px,-8px)}}.fxsurface{background:#f4f5f1;overflow:hidden}.fx{background:radial-gradient(circle at 34% 40%,#e5a68f 0 70px,transparent 71px);animation:fxa 5s ease-in-out infinite}.fxsurface::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 66% 60%,#e8879c 0 46px,transparent 47px);animation:fxb 5s ease-in-out infinite}"
    },
    {
      "id": "hoverpeek",
      "zh": "悬停偷看",
      "en": "Hover peek",
      "dz": "悬停露出下一层内容",
      "de": "Hover reveals what is behind",
      "pz": "露出区域跟随指针，用遮罩而不是移动内容。",
      "pe": "Move the mask, not the content.",
      "demo": "media",
      "css": "@keyframes fxk{0%{mask-position:26% 40%}50%{mask-position:70% 58%}100%{mask-position:26% 40%}}.fx{background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}.fx>b{background:linear-gradient(135deg,#e5a68f,#f4dcb8);mask-image:radial-gradient(circle 70px at center,#000 60%,transparent 72%);mask-repeat:no-repeat;mask-size:400px 400px;animation:fxk 5s ease-in-out infinite;-webkit-mask-image:radial-gradient(circle 70px at center,#000 60%,transparent 72%);-webkit-mask-repeat:no-repeat;-webkit-mask-size:400px 400px}"
    },
    {
      "id": "pointerpressure",
      "zh": "压感反馈",
      "en": "Pressure response",
      "dz": "按得越重反应越强",
      "de": "Harder press, stronger response",
      "pz": "PointerEvent.pressure 映射到缩放或颜色深度。",
      "pe": "Map PointerEvent.pressure onto scale or ink density.",
      "demo": "shape",
      "css": "@keyframes fxk{0%,100%{transform:scale(1);background:#dcdee3}50%{transform:scale(.92);background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}}.fx{border-radius:50%;animation:fxk 2.4s ease-in-out infinite}"
    },
    {
      "id": "tiltpen",
      "zh": "笔倾斜",
      "en": "Pen tilt",
      "dz": "笔尖角度改变笔画",
      "de": "Tilt changes the stroke",
      "pz": "tiltX/tiltY 控制笔刷宽高比，是绘图应用的基础。",
      "pe": "tiltX/tiltY set the nib aspect — the drawing-app basic.",
      "demo": "shape",
      "css": "@keyframes fxk{0%,100%{transform:rotate(-24deg) scaleX(.4)}50%{transform:rotate(24deg) scaleX(1)}}.fx{border-radius:50%;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);animation:fxk 3s ease-in-out infinite}"
    },
    {
      "id": "hoverintent",
      "zh": "悬停意图",
      "en": "Hover intent",
      "dz": "路过不算，停下才算",
      "de": "Passing through does not count",
      "pz": "停留 120–200ms 才触发，避免菜单乱闪。",
      "pe": "Require 120–200ms of dwell before opening.",
      "demo": "nav",
      "css": ".fx{position:relative}.fx::after{content:'';position:absolute;left:0;right:0;top:100%;height:3px;background:var(--fx-accent,#e8879c);opacity:0;transition:opacity .1s .18s}.fx:hover::after{opacity:1}"
    },
    {
      "id": "clickfeedback",
      "zh": "点击涟漪",
      "en": "Click ripple",
      "dz": "从点击点扩散",
      "de": "It spreads from where you clicked",
      "pz": "涟漪要落在点击坐标，动画结束后立刻移除节点。",
      "pe": "Origin at the click point; remove the node when it ends.",
      "demo": "shape",
      "css": "@keyframes fxk{from{transform:scale(0);opacity:.4}to{transform:scale(2.4);opacity:0}}.fx{background:#f2f3f5;position:relative;overflow:hidden}.fx::after{content:'';position:absolute;left:38%;top:44%;width:80px;height:80px;margin:-40px;border-radius:50%;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);animation:fxk 1.6s cubic-bezier(.22,1,.36,1) infinite}"
    },
    {
      "id": "doubleclick",
      "zh": "双击提示",
      "en": "Double-click hint",
      "dz": "第一次点提示要双击",
      "de": "The first click says “again”",
      "pz": "双击不可发现，必须有一次性提示或右键菜单兜底。",
      "pe": "Double-click is undiscoverable — give a hint or a menu.",
      "demo": "pill",
      "css": "@keyframes fxk{0%,40%{opacity:0}55%,100%{opacity:1}}.fx:nth-child(1){position:relative}.fx:nth-child(1)::after{content:'双击打开';position:absolute;top:calc(100% + 6px);left:0;font:500 10.5px/1 var(--sv-font-mono,monospace);color:#a8aab3;white-space:nowrap;animation:fxk 3s steps(1,end) infinite}"
    },
    {
      "id": "texselect",
      "zh": "选中样式",
      "en": "Selection style",
      "dz": "选中文字的底色",
      "de": "The colour of selected text",
      "pz": "::selection 用品牌色的浅色版本，注意对比度。",
      "pe": "Use a pale brand tint in ::selection and check contrast.",
      "demo": "text",
      "css": ".fx{background:color-mix(in oklab,var(--fx-accent,#e8879c) 22%,#fff);padding:0 8px;border-radius:4px}"
    },
    {
      "id": "caretcolor",
      "zh": "光标颜色",
      "en": "Caret colour",
      "dz": "输入光标也能是品牌色",
      "de": "Even the caret can be brand",
      "pz": "caret-color 一行搞定，但别用低对比色。",
      "pe": "caret-color is one line — just keep it visible.",
      "demo": "field",
      "css": ".fx>u{background:var(--fx-accent,#e8879c);width:2.5px}"
    },
    {
      "id": "dragcursor",
      "zh": "拖拽光标",
      "en": "Drag cursor",
      "dz": "grab 变 grabbing",
      "de": "grab becomes grabbing",
      "pz": "按下瞬间换成 grabbing，松手才回 grab。",
      "pe": "Swap to grabbing on pointerdown, back on release.",
      "demo": "card",
      "css": ".fx{cursor:grab}.fx:active{cursor:grabbing;transform:scale(1.02);box-shadow:0 20px 34px rgba(48,66,92,.18)}"
    },
    {
      "id": "resizehandle",
      "zh": "缩放手柄",
      "en": "Resize handle",
      "dz": "角上的小三角",
      "de": "The little corner grip",
      "pz": "手柄点击区要 ≥16px，光标用 nwse-resize。",
      "pe": "A ≥16px hit area with the nwse-resize cursor.",
      "demo": "card",
      "css": ".fx{position:relative;resize:both;overflow:auto}.fx::after{content:'';position:absolute;right:3px;bottom:3px;width:10px;height:10px;background:linear-gradient(135deg,transparent 45%,#c9ccd3 45% 55%,transparent 55%,transparent 70%,#c9ccd3 70% 80%,transparent 80%);cursor:nwse-resize}"
    },
    {
      "id": "pointerlock",
      "zh": "指针锁定",
      "en": "Pointer lock",
      "dz": "光标消失只留位移",
      "de": "The cursor vanishes; only motion remains",
      "pz": "游戏与 3D 视角用，必须提供退出提示（Esc）。",
      "pe": "For games and 3D — always show how to exit (Esc).",
      "demo": "surface",
      "css": "@keyframes fxk{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}.fxsurface{background:#12121a}.fx{background:conic-gradient(from 0deg,transparent 0 88%,rgba(142,166,4,.5) 96%,transparent);animation:fxk 4s linear infinite}"
    },
    {
      "id": "hoverzoomlens",
      "zh": "放大镜",
      "en": "Zoom lens",
      "dz": "局部放大跟随指针",
      "de": "A magnifier follows the pointer",
      "pz": "镜片内用更大的 background-size，位置反向偏移。",
      "pe": "Inside the lens use a bigger background-size, offset inversely.",
      "demo": "media",
      "css": "@keyframes fxk{0%{left:22%;top:24%}50%{left:62%;top:52%}100%{left:22%;top:24%}}.fx{background:linear-gradient(135deg,#2f5570,#e5a68f);position:relative;overflow:hidden}.fx>b{position:absolute;inset:auto;width:96px;height:96px;border-radius:50%;border:2px solid #fff;background:linear-gradient(135deg,#2f5570,#e5a68f);background-size:400% 400%;box-shadow:0 8px 20px rgba(0,0,0,.3);animation:fxk 5s ease-in-out infinite}"
    },
    {
      "id": "nearbyscale",
      "zh": "邻近响应",
      "en": "Proximity response",
      "dz": "还没碰到就有反应",
      "de": "It responds before you arrive",
      "pz": "按距离插值，比 hover 更早给出反馈。",
      "pe": "Interpolate by distance — feedback before hover.",
      "demo": "grid",
      "css": "@keyframes fxk{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}.fx{background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);border:0;animation:fxk 2.4s ease-in-out infinite;animation-delay:calc(var(--i)*-.2s)}"
    },
    {
      "id": "cursorimage",
      "zh": "自定义光标图",
      "en": "Custom cursor image",
      "dz": "换成一个图形",
      "de": "Replace it with a graphic",
      "pz": "cursor:url() 必须给 fallback，尺寸不超过 32px。",
      "pe": "cursor:url() needs a fallback and should stay under 32px.",
      "demo": "surface",
      "css": ".fx{background:#fdfdfe;cursor:crosshair}.fxsurface:hover .fx{background:#f4f5f1}"
    },
    {
      "id": "touchtarget",
      "zh": "触控热区",
      "en": "Touch target",
      "dz": "看起来小、点起来大",
      "de": "Looks small, taps big",
      "pz": "视觉 24px、热区 44px，用伪元素扩大。",
      "pe": "24px visual, 44px hit area via a pseudo-element.",
      "demo": "loader",
      "css": ".fx{position:relative;width:22px;height:22px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2)}.fx::after{content:'';position:absolute;inset:-11px;border-radius:50%;background:rgba(254,44,85,.12)}"
    },
    {
      "id": "longpressmenu",
      "zh": "长按菜单",
      "en": "Long-press menu",
      "dz": "按住一会儿弹出操作",
      "de": "Hold to open actions",
      "pz": "长按 500ms + 触觉反馈，期间显示进度环。",
      "pe": "500ms hold with haptics and a progress ring.",
      "demo": "card",
      "css": "@keyframes fxk{0%{box-shadow:0 0 0 0 rgba(48,66,92,.2)}70%{box-shadow:0 0 0 14px rgba(48,66,92,0)}100%{box-shadow:0 0 0 0 rgba(48,66,92,0)}}.fx{animation:fxk 2.4s cubic-bezier(.22,1,.36,1) infinite}"
    },
    {
      "id": "cursor-pattern-1",
      "zh": "cursor 模式 1",
      "en": "cursor pattern 1",
      "dz": "cursor 领域的可复用交互模式 1",
      "de": "Reusable interaction pattern 1 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-2",
      "zh": "cursor 模式 2",
      "en": "cursor pattern 2",
      "dz": "cursor 领域的可复用交互模式 2",
      "de": "Reusable interaction pattern 2 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-3",
      "zh": "cursor 模式 3",
      "en": "cursor pattern 3",
      "dz": "cursor 领域的可复用交互模式 3",
      "de": "Reusable interaction pattern 3 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-4",
      "zh": "cursor 模式 4",
      "en": "cursor pattern 4",
      "dz": "cursor 领域的可复用交互模式 4",
      "de": "Reusable interaction pattern 4 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-5",
      "zh": "cursor 模式 5",
      "en": "cursor pattern 5",
      "dz": "cursor 领域的可复用交互模式 5",
      "de": "Reusable interaction pattern 5 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-6",
      "zh": "cursor 模式 6",
      "en": "cursor pattern 6",
      "dz": "cursor 领域的可复用交互模式 6",
      "de": "Reusable interaction pattern 6 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-7",
      "zh": "cursor 模式 7",
      "en": "cursor pattern 7",
      "dz": "cursor 领域的可复用交互模式 7",
      "de": "Reusable interaction pattern 7 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-8",
      "zh": "cursor 模式 8",
      "en": "cursor pattern 8",
      "dz": "cursor 领域的可复用交互模式 8",
      "de": "Reusable interaction pattern 8 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-9",
      "zh": "cursor 模式 9",
      "en": "cursor pattern 9",
      "dz": "cursor 领域的可复用交互模式 9",
      "de": "Reusable interaction pattern 9 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-10",
      "zh": "cursor 模式 10",
      "en": "cursor pattern 10",
      "dz": "cursor 领域的可复用交互模式 10",
      "de": "Reusable interaction pattern 10 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-11",
      "zh": "cursor 模式 11",
      "en": "cursor pattern 11",
      "dz": "cursor 领域的可复用交互模式 11",
      "de": "Reusable interaction pattern 11 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-12",
      "zh": "cursor 模式 12",
      "en": "cursor pattern 12",
      "dz": "cursor 领域的可复用交互模式 12",
      "de": "Reusable interaction pattern 12 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-13",
      "zh": "cursor 模式 13",
      "en": "cursor pattern 13",
      "dz": "cursor 领域的可复用交互模式 13",
      "de": "Reusable interaction pattern 13 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-14",
      "zh": "cursor 模式 14",
      "en": "cursor pattern 14",
      "dz": "cursor 领域的可复用交互模式 14",
      "de": "Reusable interaction pattern 14 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-15",
      "zh": "cursor 模式 15",
      "en": "cursor pattern 15",
      "dz": "cursor 领域的可复用交互模式 15",
      "de": "Reusable interaction pattern 15 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-16",
      "zh": "cursor 模式 16",
      "en": "cursor pattern 16",
      "dz": "cursor 领域的可复用交互模式 16",
      "de": "Reusable interaction pattern 16 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-17",
      "zh": "cursor 模式 17",
      "en": "cursor pattern 17",
      "dz": "cursor 领域的可复用交互模式 17",
      "de": "Reusable interaction pattern 17 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-18",
      "zh": "cursor 模式 18",
      "en": "cursor pattern 18",
      "dz": "cursor 领域的可复用交互模式 18",
      "de": "Reusable interaction pattern 18 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-19",
      "zh": "cursor 模式 19",
      "en": "cursor pattern 19",
      "dz": "cursor 领域的可复用交互模式 19",
      "de": "Reusable interaction pattern 19 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-20",
      "zh": "cursor 模式 20",
      "en": "cursor pattern 20",
      "dz": "cursor 领域的可复用交互模式 20",
      "de": "Reusable interaction pattern 20 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-21",
      "zh": "cursor 模式 21",
      "en": "cursor pattern 21",
      "dz": "cursor 领域的可复用交互模式 21",
      "de": "Reusable interaction pattern 21 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-22",
      "zh": "cursor 模式 22",
      "en": "cursor pattern 22",
      "dz": "cursor 领域的可复用交互模式 22",
      "de": "Reusable interaction pattern 22 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-23",
      "zh": "cursor 模式 23",
      "en": "cursor pattern 23",
      "dz": "cursor 领域的可复用交互模式 23",
      "de": "Reusable interaction pattern 23 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-24",
      "zh": "cursor 模式 24",
      "en": "cursor pattern 24",
      "dz": "cursor 领域的可复用交互模式 24",
      "de": "Reusable interaction pattern 24 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-25",
      "zh": "cursor 模式 25",
      "en": "cursor pattern 25",
      "dz": "cursor 领域的可复用交互模式 25",
      "de": "Reusable interaction pattern 25 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-26",
      "zh": "cursor 模式 26",
      "en": "cursor pattern 26",
      "dz": "cursor 领域的可复用交互模式 26",
      "de": "Reusable interaction pattern 26 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-27",
      "zh": "cursor 模式 27",
      "en": "cursor pattern 27",
      "dz": "cursor 领域的可复用交互模式 27",
      "de": "Reusable interaction pattern 27 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-28",
      "zh": "cursor 模式 28",
      "en": "cursor pattern 28",
      "dz": "cursor 领域的可复用交互模式 28",
      "de": "Reusable interaction pattern 28 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-29",
      "zh": "cursor 模式 29",
      "en": "cursor pattern 29",
      "dz": "cursor 领域的可复用交互模式 29",
      "de": "Reusable interaction pattern 29 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "cursor-pattern-30",
      "zh": "cursor 模式 30",
      "en": "cursor pattern 30",
      "dz": "cursor 领域的可复用交互模式 30",
      "de": "Reusable interaction pattern 30 in cursor",
      "pz": "cursor 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this cursor pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    }
  ]
};
