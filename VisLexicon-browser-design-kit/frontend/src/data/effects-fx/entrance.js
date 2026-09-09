export default {
  "id": "entrance",
  "zh": "入场 / 出场",
  "en": "Entrance & exit",
  "dz": "元素怎么出现，又怎么退场",
  "de": "How things arrive, and how they leave",
  "items": [
    {
      "id": "fade",
      "zh": "淡入",
      "en": "Fade in",
      "dz": "最基础的透明度渐显",
      "de": "The plainest opacity fade",
      "pz": "opacity 0→1，200–300ms，ease-out。",
      "pe": "opacity 0→1 over 200–300ms with ease-out.",
      "demo": "box",
      "params": [
        {
          "k": "t",
          "zh": "时长",
          "en": "Duration",
          "min": 0.1,
          "max": 1.5,
          "step": 0.05,
          "def": 0.4,
          "unit": "s"
        }
      ],
      "css": "@keyframes fxk{from{opacity:0}to{opacity:1}}.fx{animation:fxk var(--t,.4s) ease-out infinite alternate}"
    },
    {
      "id": "fadeup",
      "zh": "上浮淡入",
      "en": "Fade up",
      "dz": "轻轻往上抬一点点出现",
      "de": "Rises a little as it fades in",
      "pz": "opacity + translateY(16px)→0，位移别超过 24px。",
      "pe": "opacity plus translateY(16px)→0; keep the travel under 24px.",
      "demo": "box",
      "params": [
        {
          "k": "d",
          "zh": "距离",
          "en": "Distance",
          "min": 4,
          "max": 80,
          "step": 2,
          "def": 24,
          "unit": "px"
        }
      ],
      "css": "@keyframes fxk{from{opacity:0;transform:translateY(var(--d,24px))}to{opacity:1;transform:none}}.fx{animation:fxk 1s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "fadedown",
      "zh": "下沉淡入",
      "en": "Fade down",
      "dz": "从上方落下出现",
      "de": "Drops in from above",
      "pz": "translateY(-20px)→0 配合 opacity，常用于顶部通知。",
      "pe": "translateY(-20px)→0 with opacity — good for top notifications.",
      "demo": "box",
      "css": "@keyframes fxk{from{opacity:0;transform:translateY(-28px)}to{opacity:1;transform:none}}.fx{animation:fxk 1s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "fadeleft",
      "zh": "左滑淡入",
      "en": "Slide in from left",
      "dz": "从左侧滑入",
      "de": "Slides in from the left",
      "pz": "translateX(-32px)→0 + opacity。",
      "pe": "translateX(-32px)→0 with opacity.",
      "demo": "box",
      "css": "@keyframes fxk{from{opacity:0;transform:translateX(-48px)}to{opacity:1;transform:none}}.fx{animation:fxk 1s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "faderight",
      "zh": "右滑淡入",
      "en": "Slide in from right",
      "dz": "从右侧滑入",
      "de": "Slides in from the right",
      "pz": "translateX(32px)→0 + opacity。",
      "pe": "translateX(32px)→0 with opacity.",
      "demo": "box",
      "css": "@keyframes fxk{from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:none}}.fx{animation:fxk 1s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "scalein",
      "zh": "缩放入场",
      "en": "Scale in",
      "dz": "由小到大出现",
      "de": "Grows into place",
      "pz": "scale(.92)→1 + opacity，起始别小于 .8 否则显廉价。",
      "pe": "scale(.92)→1 with opacity; starting below .8 looks cheap.",
      "demo": "box",
      "params": [
        {
          "k": "s",
          "zh": "起始",
          "en": "From",
          "min": 0.5,
          "max": 0.98,
          "step": 0.02,
          "def": 0.9,
          "unit": ""
        }
      ],
      "css": "@keyframes fxk{from{opacity:0;transform:scale(var(--s,.9))}to{opacity:1;transform:none}}.fx{animation:fxk 1s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "pop",
      "zh": "过冲弹出",
      "en": "Pop (overshoot)",
      "dz": "弹出时略微超过再回落",
      "de": "Overshoots a touch, then settles",
      "pz": "用 out-back 缓动 cubic-bezier(.34,1.56,.64,1)，只过冲一次。",
      "pe": "out-back easing cubic-bezier(.34,1.56,.64,1) — one overshoot only.",
      "demo": "box",
      "css": "@keyframes fxk{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}.fx{animation:fxk 1.1s cubic-bezier(.34,1.56,.64,1) infinite alternate}"
    },
    {
      "id": "spring",
      "zh": "弹簧落定",
      "en": "Spring settle",
      "dz": "来回抖两下才停",
      "de": "Wobbles twice before it stops",
      "pz": "用多关键帧模拟阻尼振荡，或用 spring 物理动画库。",
      "pe": "Fake damped oscillation with keyframes, or use a spring physics library.",
      "demo": "box",
      "css": "@keyframes fxk{0%{transform:scale(.3);opacity:0}45%{transform:scale(1.12);opacity:1}68%{transform:scale(.95)}84%{transform:scale(1.03)}100%{transform:scale(1)}}.fx{animation:fxk 1.4s ease-out infinite}"
    },
    {
      "id": "blurin",
      "zh": "失焦聚焦",
      "en": "Blur in",
      "dz": "从模糊里对焦出来",
      "de": "Focuses out of a blur",
      "pz": "filter:blur(14px)→0 配合轻微 scale，注意性能开销。",
      "pe": "filter blur(14px)→0 plus a slight scale; watch the paint cost.",
      "demo": "box",
      "params": [
        {
          "k": "b",
          "zh": "模糊",
          "en": "Blur",
          "min": 2,
          "max": 40,
          "step": 1,
          "def": 16,
          "unit": "px"
        }
      ],
      "css": "@keyframes fxk{from{opacity:0;filter:blur(var(--b,16px));transform:scale(1.06)}to{opacity:1;filter:none;transform:none}}.fx{animation:fxk 1.2s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "clipup",
      "zh": "向上揭幕",
      "en": "Clip reveal up",
      "dz": "像卷帘一样自下而上露出",
      "de": "Uncovers upward like a blind",
      "pz": "clip-path:inset(100% 0 0 0)→inset(0)。",
      "pe": "clip-path inset(100% 0 0 0) → inset(0).",
      "demo": "box",
      "css": "@keyframes fxk{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0)}}.fx{animation:fxk 1.1s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "curtain",
      "zh": "色块擦除入场",
      "en": "Curtain wipe",
      "dz": "一块颜色扫过后留下内容",
      "de": "A color bar sweeps past and leaves the content",
      "pz": "覆盖层从左进右出，内容在覆盖层经过时切换可见。",
      "pe": "An overlay enters left and exits right; the content appears as it passes.",
      "demo": "box",
      "css": "@keyframes fxk{0%{transform:translateX(-105%)}45%{transform:translateX(0)}100%{transform:translateX(105%)}}@keyframes fxo{0%,44%{opacity:0}46%,100%{opacity:1}}.fx{position:relative;overflow:hidden;animation:fxo 1.6s linear infinite}.fx::after{content:'';position:absolute;inset:0;background:#e8879c;animation:fxk 1.6s cubic-bezier(.22,1,.36,1) infinite}"
    },
    {
      "id": "iris",
      "zh": "光圈展开",
      "en": "Iris reveal",
      "dz": "从中心圆形张开",
      "de": "Opens as a circle from the centre",
      "pz": "clip-path:circle(0)→circle(75%)。",
      "pe": "clip-path circle(0) → circle(75%).",
      "demo": "box",
      "css": "@keyframes fxk{from{clip-path:circle(0 at 50% 50%)}to{clip-path:circle(78% at 50% 50%)}}.fx{animation:fxk 1.2s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "letterbox",
      "zh": "上下开幕",
      "en": "Letterbox open",
      "dz": "上下两条黑边向外拉开",
      "de": "Two bars pull apart, cinema style",
      "pz": "clip-path:inset(50% 0)→inset(0)，像电影开幕。",
      "pe": "clip-path inset(50% 0) → inset(0).",
      "demo": "box",
      "css": "@keyframes fxk{from{clip-path:inset(50% 0 50% 0)}to{clip-path:inset(0)}}.fx{animation:fxk 1.1s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "flipx",
      "zh": "X 轴翻入",
      "en": "Flip in X",
      "dz": "沿水平轴翻转进入",
      "de": "Flips in around the horizontal axis",
      "pz": "perspective + rotateX(-90deg)→0，transform-origin 居中。",
      "pe": "perspective with rotateX(-90deg)→0, origin centred.",
      "demo": "box",
      "css": "@keyframes fxk{from{opacity:0;transform:rotateX(-90deg)}to{opacity:1;transform:none}}.fxstage{perspective:900px}.fx{animation:fxk 1.2s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "flipy",
      "zh": "Y 轴翻入",
      "en": "Flip in Y",
      "dz": "沿竖直轴翻转进入",
      "de": "Flips in around the vertical axis",
      "pz": "perspective + rotateY(90deg)→0。",
      "pe": "perspective with rotateY(90deg)→0.",
      "demo": "box",
      "css": "@keyframes fxk{from{opacity:0;transform:rotateY(90deg)}to{opacity:1;transform:none}}.fxstage{perspective:900px}.fx{animation:fxk 1.2s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "rotatein",
      "zh": "旋转入场",
      "en": "Rotate in",
      "dz": "一边转一边出现",
      "de": "Spins as it appears",
      "pz": "rotate(-12deg)→0 + scale + opacity，角度要小。",
      "pe": "rotate(-12deg)→0 with scale and opacity; keep the angle small.",
      "demo": "box",
      "css": "@keyframes fxk{from{opacity:0;transform:rotate(-14deg) scale(.85)}to{opacity:1;transform:none}}.fx{animation:fxk 1.1s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "swing",
      "zh": "悬挂摆动",
      "en": "Swing in",
      "dz": "像挂牌一样晃两下",
      "de": "Swings like a hanging sign",
      "pz": "transform-origin:top center，rotate 阻尼递减。",
      "pe": "transform-origin top center with a decaying rotate.",
      "demo": "box",
      "css": "@keyframes fxk{0%{transform:rotate(-16deg);opacity:0}40%{opacity:1}55%{transform:rotate(9deg)}75%{transform:rotate(-4deg)}100%{transform:rotate(0)}}.fx{transform-origin:top center;animation:fxk 1.6s ease-out infinite}"
    },
    {
      "id": "drop",
      "zh": "落地回弹",
      "en": "Drop & bounce",
      "dz": "从上方掉下来弹一下",
      "de": "Falls in and bounces once",
      "pz": "下落用 ease-in，触底后 scaleY 压扁再恢复。",
      "pe": "ease-in on the fall, then a squash on landing.",
      "demo": "box",
      "css": "@keyframes fxk{0%{transform:translateY(-220px);opacity:0}55%{transform:translateY(0);opacity:1}68%{transform:translateY(0) scale(1.14,.86)}82%{transform:translateY(-22px) scale(.97,1.03)}100%{transform:translateY(0) scale(1)}}.fx{animation:fxk 1.5s cubic-bezier(.5,0,.75,.5) infinite}"
    },
    {
      "id": "unfold",
      "zh": "展开铺陈",
      "en": "Unfold",
      "dz": "像折纸一样打开",
      "de": "Unfolds like paper",
      "pz": "rotateX(90deg)→0，transform-origin:top，父级 perspective。",
      "pe": "rotateX(90deg)→0 with origin top and parent perspective.",
      "demo": "box",
      "css": "@keyframes fxk{from{transform:rotateX(92deg);opacity:.3}to{transform:none;opacity:1}}.fxstage{perspective:1100px}.fx{transform-origin:top center;animation:fxk 1.2s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "zoomblur",
      "zh": "冲击变焦",
      "en": "Zoom blur in",
      "dz": "像镜头猛推上来",
      "de": "Like a lens punching in",
      "pz": "scale(1.4)→1 配合 blur 递减，时长要短（<400ms）。",
      "pe": "scale(1.4)→1 with decreasing blur; keep it under 400ms.",
      "demo": "box",
      "css": "@keyframes fxk{from{transform:scale(1.5);filter:blur(14px);opacity:0}to{transform:none;filter:none;opacity:1}}.fx{animation:fxk .9s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "skewslide",
      "zh": "斜切滑入",
      "en": "Skew slide",
      "dz": "带一点倾斜地冲进来",
      "de": "Slides in with a lean",
      "pz": "translateX 与 skewX 同步回零，落定瞬间摆正。",
      "pe": "translateX and skewX return to zero together.",
      "demo": "box",
      "css": "@keyframes fxk{from{transform:translateX(-90px) skewX(-14deg);opacity:0}to{transform:none;opacity:1}}.fx{animation:fxk 1s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "stagger",
      "zh": "错峰级联",
      "en": "Stagger cascade",
      "dz": "一组元素依次出现",
      "de": "A group arrives one after another",
      "pz": "每个元素 delay = index × 60~80ms，超过 8 个要压缩间隔。",
      "pe": "delay = index × 60–80ms; compress the step past eight items.",
      "demo": "cards",
      "params": [
        {
          "k": "s",
          "zh": "间隔",
          "en": "Stagger",
          "min": 20,
          "max": 260,
          "step": 10,
          "def": 90,
          "unit": "ms"
        }
      ],
      "css": "@keyframes fxk{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}.fx{animation:fxk .6s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*var(--s,90ms))}"
    },
    {
      "id": "deal",
      "zh": "发牌铺开",
      "en": "Deal out",
      "dz": "卡片像发牌一样甩出来",
      "de": "Cards are dealt onto the table",
      "pz": "从同一堆叠位置出发，位移 + 旋转 + delay 展开。",
      "pe": "All start from one stack, then translate and rotate out with a delay.",
      "demo": "cards",
      "css": "@keyframes fxk{from{opacity:0;transform:translate(-140px,-30px) rotate(-18deg)}to{opacity:1;transform:none}}.fx{animation:fxk .7s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*140ms)}"
    },
    {
      "id": "rollin",
      "zh": "滚入",
      "en": "Roll in",
      "dz": "边滚边进来",
      "de": "Rolls in from the side",
      "pz": "translateX 与 rotate 同步，模拟滚动的物体。",
      "pe": "translateX paired with rotate to fake rolling.",
      "demo": "box",
      "css": "@keyframes fxk{from{transform:translateX(-260px) rotate(-240deg);opacity:0}to{transform:none;opacity:1}}.fx{border-radius:50%;animation:fxk 1.3s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "maskrows",
      "zh": "分行揭示",
      "en": "Row-by-row reveal",
      "dz": "内容一行一行擦出来",
      "de": "The content reveals line by line",
      "pz": "每行独立 mask 上移，delay 递增。",
      "pe": "Each row has its own mask sliding up, delayed by index.",
      "demo": "list",
      "css": "@keyframes fxk{from{clip-path:inset(0 100% 0 0);opacity:.2}to{clip-path:inset(0);opacity:1}}.fx{animation:fxk .55s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*110ms)}"
    },
    {
      "id": "fadeout",
      "zh": "淡出退场",
      "en": "Fade out",
      "dz": "安静地消失",
      "de": "Quietly disappears",
      "pz": "出场比入场快 20–30%，用 ease-in。",
      "pe": "Exit 20–30% faster than the entrance, with ease-in.",
      "demo": "box",
      "css": "@keyframes fxk{from{opacity:1}to{opacity:0}}.fx{animation:fxk .8s ease-in infinite alternate}"
    },
    {
      "id": "exitdown",
      "zh": "下沉退场",
      "en": "Exit down",
      "dz": "往下沉着消失",
      "de": "Sinks away downward",
      "pz": "translateY(0→24px) + opacity→0，ease-in。",
      "pe": "translateY 0→24px with opacity→0, ease-in.",
      "demo": "box",
      "css": "@keyframes fxk{from{transform:none;opacity:1}to{transform:translateY(40px);opacity:0}}.fx{animation:fxk .9s ease-in infinite alternate}"
    },
    {
      "id": "exitscale",
      "zh": "缩小消散",
      "en": "Shrink away",
      "dz": "缩小并模糊地散掉",
      "de": "Shrinks and blurs away",
      "pz": "scale(1→.88) + blur(0→8px) + opacity→0。",
      "pe": "scale 1→.88, blur 0→8px, opacity→0.",
      "demo": "box",
      "css": "@keyframes fxk{from{transform:none;filter:none;opacity:1}to{transform:scale(.86);filter:blur(8px);opacity:0}}.fx{animation:fxk 1s ease-in infinite alternate}"
    },
    {
      "id": "topoint",
      "zh": "收进一点",
      "en": "Collapse to point",
      "dz": "被吸回原来的按钮位置",
      "de": "Sucked back into the button it came from",
      "pz": "逆向 FLIP：缩放并位移回触发元素的中心。",
      "pe": "Reverse FLIP: scale and translate back to the trigger centre.",
      "demo": "box",
      "css": "@keyframes fxk{from{transform:none;opacity:1}to{transform:translate(-150px,110px) scale(.12);opacity:0}}.fx{animation:fxk 1.1s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "dissolve",
      "zh": "颗粒消散",
      "en": "Grain dissolve",
      "dz": "像沙子一样碎掉消失",
      "de": "Crumbles away like sand",
      "pz": "用噪声 mask 配合 mask-position/opacity 动画做溶解。",
      "pe": "A noise mask animated over mask-position/opacity gives the dissolve.",
      "demo": "box",
      "css": "@keyframes fxk{from{opacity:1;-webkit-mask-size:100% 100%}to{opacity:0;-webkit-mask-size:600% 600%}}.fx{-webkit-mask-image:radial-gradient(circle at 30% 30%,#000 40%,transparent 41%),radial-gradient(circle at 70% 60%,#000 40%,transparent 41%);-webkit-mask-size:14px 14px;animation:fxk 1.6s ease-in infinite alternate}"
    },
    {
      "id": "entrance-pattern-1",
      "zh": "entrance 模式 1",
      "en": "entrance pattern 1",
      "dz": "entrance 领域的可复用交互模式 1",
      "de": "Reusable interaction pattern 1 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-2",
      "zh": "entrance 模式 2",
      "en": "entrance pattern 2",
      "dz": "entrance 领域的可复用交互模式 2",
      "de": "Reusable interaction pattern 2 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-3",
      "zh": "entrance 模式 3",
      "en": "entrance pattern 3",
      "dz": "entrance 领域的可复用交互模式 3",
      "de": "Reusable interaction pattern 3 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-4",
      "zh": "entrance 模式 4",
      "en": "entrance pattern 4",
      "dz": "entrance 领域的可复用交互模式 4",
      "de": "Reusable interaction pattern 4 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-5",
      "zh": "entrance 模式 5",
      "en": "entrance pattern 5",
      "dz": "entrance 领域的可复用交互模式 5",
      "de": "Reusable interaction pattern 5 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-6",
      "zh": "entrance 模式 6",
      "en": "entrance pattern 6",
      "dz": "entrance 领域的可复用交互模式 6",
      "de": "Reusable interaction pattern 6 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-7",
      "zh": "entrance 模式 7",
      "en": "entrance pattern 7",
      "dz": "entrance 领域的可复用交互模式 7",
      "de": "Reusable interaction pattern 7 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-8",
      "zh": "entrance 模式 8",
      "en": "entrance pattern 8",
      "dz": "entrance 领域的可复用交互模式 8",
      "de": "Reusable interaction pattern 8 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-9",
      "zh": "entrance 模式 9",
      "en": "entrance pattern 9",
      "dz": "entrance 领域的可复用交互模式 9",
      "de": "Reusable interaction pattern 9 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-10",
      "zh": "entrance 模式 10",
      "en": "entrance pattern 10",
      "dz": "entrance 领域的可复用交互模式 10",
      "de": "Reusable interaction pattern 10 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-11",
      "zh": "entrance 模式 11",
      "en": "entrance pattern 11",
      "dz": "entrance 领域的可复用交互模式 11",
      "de": "Reusable interaction pattern 11 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-12",
      "zh": "entrance 模式 12",
      "en": "entrance pattern 12",
      "dz": "entrance 领域的可复用交互模式 12",
      "de": "Reusable interaction pattern 12 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-13",
      "zh": "entrance 模式 13",
      "en": "entrance pattern 13",
      "dz": "entrance 领域的可复用交互模式 13",
      "de": "Reusable interaction pattern 13 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-14",
      "zh": "entrance 模式 14",
      "en": "entrance pattern 14",
      "dz": "entrance 领域的可复用交互模式 14",
      "de": "Reusable interaction pattern 14 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-15",
      "zh": "entrance 模式 15",
      "en": "entrance pattern 15",
      "dz": "entrance 领域的可复用交互模式 15",
      "de": "Reusable interaction pattern 15 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-16",
      "zh": "entrance 模式 16",
      "en": "entrance pattern 16",
      "dz": "entrance 领域的可复用交互模式 16",
      "de": "Reusable interaction pattern 16 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-17",
      "zh": "entrance 模式 17",
      "en": "entrance pattern 17",
      "dz": "entrance 领域的可复用交互模式 17",
      "de": "Reusable interaction pattern 17 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-18",
      "zh": "entrance 模式 18",
      "en": "entrance pattern 18",
      "dz": "entrance 领域的可复用交互模式 18",
      "de": "Reusable interaction pattern 18 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-19",
      "zh": "entrance 模式 19",
      "en": "entrance pattern 19",
      "dz": "entrance 领域的可复用交互模式 19",
      "de": "Reusable interaction pattern 19 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-20",
      "zh": "entrance 模式 20",
      "en": "entrance pattern 20",
      "dz": "entrance 领域的可复用交互模式 20",
      "de": "Reusable interaction pattern 20 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-21",
      "zh": "entrance 模式 21",
      "en": "entrance pattern 21",
      "dz": "entrance 领域的可复用交互模式 21",
      "de": "Reusable interaction pattern 21 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-22",
      "zh": "entrance 模式 22",
      "en": "entrance pattern 22",
      "dz": "entrance 领域的可复用交互模式 22",
      "de": "Reusable interaction pattern 22 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-23",
      "zh": "entrance 模式 23",
      "en": "entrance pattern 23",
      "dz": "entrance 领域的可复用交互模式 23",
      "de": "Reusable interaction pattern 23 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-24",
      "zh": "entrance 模式 24",
      "en": "entrance pattern 24",
      "dz": "entrance 领域的可复用交互模式 24",
      "de": "Reusable interaction pattern 24 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-25",
      "zh": "entrance 模式 25",
      "en": "entrance pattern 25",
      "dz": "entrance 领域的可复用交互模式 25",
      "de": "Reusable interaction pattern 25 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-26",
      "zh": "entrance 模式 26",
      "en": "entrance pattern 26",
      "dz": "entrance 领域的可复用交互模式 26",
      "de": "Reusable interaction pattern 26 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-27",
      "zh": "entrance 模式 27",
      "en": "entrance pattern 27",
      "dz": "entrance 领域的可复用交互模式 27",
      "de": "Reusable interaction pattern 27 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-28",
      "zh": "entrance 模式 28",
      "en": "entrance pattern 28",
      "dz": "entrance 领域的可复用交互模式 28",
      "de": "Reusable interaction pattern 28 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-29",
      "zh": "entrance 模式 29",
      "en": "entrance pattern 29",
      "dz": "entrance 领域的可复用交互模式 29",
      "de": "Reusable interaction pattern 29 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "entrance-pattern-30",
      "zh": "entrance 模式 30",
      "en": "entrance pattern 30",
      "dz": "entrance 领域的可复用交互模式 30",
      "de": "Reusable interaction pattern 30 in entrance",
      "pz": "entrance 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this entrance pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    }
  ]
};
