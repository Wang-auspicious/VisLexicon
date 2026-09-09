export default {
  "id": "mask",
  "zh": "遮罩与裁切",
  "en": "Masks & clipping",
  "dz": "控制“露出多少”，reveal 的全部秘密",
  "de": "Controlling how much shows — the whole secret of a reveal",
  "items": [
    {
      "id": "wipe",
      "zh": "横向擦除",
      "en": "Wipe",
      "dz": "一条边推过去",
      "de": "One edge sweeps across",
      "pz": "clip-path:inset() 动画，比改宽度不会引起重排。",
      "pe": "Animate clip-path:inset() — no reflow, unlike width.",
      "demo": "media",
      "params": [
        {
          "k": "d",
          "zh": "方向",
          "en": "Direction",
          "opts": [
            {
              "v": "0 100% 0 0",
              "zh": "从左",
              "en": "From left"
            },
            {
              "v": "0 0 0 100%",
              "zh": "从右",
              "en": "From right"
            },
            {
              "v": "100% 0 0 0",
              "zh": "从上",
              "en": "From top"
            },
            {
              "v": "0 0 100% 0",
              "zh": "从下",
              "en": "From bottom"
            }
          ],
          "def": "0 100% 0 0"
        }
      ],
      "css": "@keyframes fxk{from{clip-path:inset(var(--d,0 100% 0 0))}to{clip-path:inset(0)}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);animation:fxk 1.4s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "splitwipe",
      "zh": "中缝开合",
      "en": "Split wipe",
      "dz": "从中间向两边打开",
      "de": "Opens outward from the centre",
      "pz": "两个 inset 从中线各自退开，或一层 mask 双向渐变。",
      "pe": "Two insets retreating from the centre line.",
      "demo": "media",
      "css": "@keyframes fxk{from{clip-path:inset(0 50%)}to{clip-path:inset(0)}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);animation:fxk 1.4s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "circlereveal",
      "zh": "圆形展开",
      "en": "Circle reveal",
      "dz": "从一点扩成整片",
      "de": "Grows from a point to the full frame",
      "pz": "clip-path:circle(r at x y)，配合 View Transitions 最惊艳。",
      "pe": "clip-path:circle(r at x y) — spectacular with View Transitions.",
      "demo": "media",
      "params": [
        {
          "k": "x",
          "zh": "圆心 X",
          "en": "Origin X",
          "min": 0,
          "max": 100,
          "step": 5,
          "def": 50,
          "unit": "%"
        }
      ],
      "css": "@keyframes fxk{from{clip-path:circle(0 at var(--x,50%) 50%)}to{clip-path:circle(140% at var(--x,50%) 50%)}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);animation:fxk 1.8s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "irisout",
      "zh": "光圈收拢",
      "en": "Iris close",
      "dz": "像相机快门合上",
      "de": "The shutter closes",
      "pz": "圆形 clip-path 半径归零，用 ease-in。",
      "pe": "Circle radius to zero with ease-in.",
      "demo": "media",
      "css": "@keyframes fxk{from{clip-path:circle(140%)}to{clip-path:circle(0)}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);animation:fxk 1.6s cubic-bezier(.55,0,1,.45) infinite alternate}"
    },
    {
      "id": "diagonalwipe",
      "zh": "斜切擦除",
      "en": "Diagonal wipe",
      "dz": "斜着推过去",
      "de": "A diagonal sweep",
      "pz": "polygon 的四点同时平移，保持斜率一致。",
      "pe": "Translate all four polygon points, keeping the slope.",
      "demo": "media",
      "css": "@keyframes fxk{from{clip-path:polygon(0 0,0 0,-30% 100%,-30% 100%)}to{clip-path:polygon(0 0,130% 0,100% 100%,0 100%)}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);animation:fxk 1.6s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "bandreveal",
      "zh": "百叶窗",
      "en": "Venetian blinds",
      "dz": "一条一条打开",
      "de": "Opens strip by strip",
      "pz": "多条横向 mask 同时展开，错峰 40ms。",
      "pe": "Parallel strips expanding with a 40ms stagger.",
      "demo": "media",
      "params": [
        {
          "k": "n",
          "zh": "条数",
          "en": "Strips",
          "min": 3,
          "max": 16,
          "step": 1,
          "def": 8,
          "unit": ""
        }
      ],
      "css": "@keyframes fxk{from{background-size:100% 0}to{background-size:100% 100%}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);mask-image:linear-gradient(#000,#000);mask-size:100% calc(100%/var(--n,8));mask-repeat:repeat-y;mask-position:0 0;animation:fxk 1.6s cubic-bezier(.22,1,.36,1) infinite alternate;mask-mode:alpha}.fx>b{-webkit-mask-image:linear-gradient(#000,#000)}"
    },
    {
      "id": "blockreveal",
      "zh": "色块先行",
      "en": "Block-then-content",
      "dz": "色块扫过之后留下内容",
      "de": "A slab sweeps past and leaves the content behind",
      "pz": "先让色块滑入覆盖，再滑出并显示内容，两段共 600ms。",
      "pe": "A slab slides in, then out revealing content — 600ms total.",
      "demo": "text",
      "css": "@keyframes fxk{0%{transform:scaleX(0);transform-origin:left}45%{transform:scaleX(1);transform-origin:left}55%{transform:scaleX(1);transform-origin:right}100%{transform:scaleX(0);transform-origin:right}}@keyframes fxt{0%,50%{opacity:0}55%,100%{opacity:1}}.fx{position:relative;animation:fxt 2.4s steps(1,end) infinite}.fx::after{content:'';position:absolute;inset:-4px -8px;background:var(--fx-accent,#e8879c);animation:fxk 2.4s cubic-bezier(.22,1,.36,1) infinite}"
    },
    {
      "id": "maskgradient",
      "zh": "渐变淡出",
      "en": "Gradient fade-out",
      "dz": "边缘柔和地消失",
      "de": "The edge dissolves softly",
      "pz": "mask-image 线性渐变，比 opacity 更精准控制范围。",
      "pe": "A linear-gradient mask beats opacity for controlling the falloff.",
      "demo": "media",
      "params": [
        {
          "k": "p",
          "zh": "渐隐起点",
          "en": "Fade start",
          "min": 0,
          "max": 90,
          "step": 5,
          "def": 45,
          "unit": "%"
        }
      ],
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);mask-image:linear-gradient(90deg,#000 var(--p,45%),transparent);-webkit-mask-image:linear-gradient(90deg,#000 var(--p,45%),transparent)}"
    },
    {
      "id": "fadeedges",
      "zh": "四边渐隐",
      "en": "Faded edges",
      "dz": "内容边界化开",
      "de": "Content melts at its bounds",
      "pz": "两个方向的渐变 mask 相交，避免出现硬边。",
      "pe": "Intersect two directional gradient masks.",
      "demo": "surface",
      "css": ".fx{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);mask-image:linear-gradient(90deg,transparent,#000 18%,#000 82%,transparent),linear-gradient(transparent,#000 18%,#000 82%,transparent);mask-composite:intersect;-webkit-mask-image:linear-gradient(90deg,transparent,#000 18%,#000 82%,transparent)}"
    },
    {
      "id": "scrollfade",
      "zh": "滚动列表渐隐",
      "en": "Scroll edge fade",
      "dz": "列表上下两端淡出",
      "de": "The list dissolves at both ends",
      "pz": "给滚动容器加 mask，不用假的渐变遮片。",
      "pe": "Mask the scroll container instead of faking it with overlays.",
      "demo": "scroll",
      "css": ".fxscroll{mask-image:linear-gradient(transparent,#000 12%,#000 88%,transparent);-webkit-mask-image:linear-gradient(transparent,#000 12%,#000 88%,transparent)}"
    },
    {
      "id": "textmaskimg",
      "zh": "文字里的图片",
      "en": "Image inside type",
      "dz": "字被素材填满",
      "de": "The letters are filled with imagery",
      "pz": "background-clip:text + 大图，字重要足够粗。",
      "pe": "background-clip:text with heavy weight so the image reads.",
      "demo": "text",
      "css": ".fx{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:800}"
    },
    {
      "id": "textmaskvideo",
      "zh": "文字里的动态",
      "en": "Motion inside type",
      "dz": "字里的画面在动",
      "de": "The picture inside the letters moves",
      "pz": "同上，但背景层做无限平移或 hue 变化。",
      "pe": "Same trick, but pan or hue-shift the background.",
      "demo": "text",
      "css": "@keyframes fxk{to{background-position:300% 50%}}.fx{background:linear-gradient(70deg,#2f5570,#e5a68f,#f4dcb8,#75c4d4,#2f5570);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxk 5s linear infinite;font-weight:800}"
    },
    {
      "id": "clipshapes",
      "zh": "几何裁切",
      "en": "Geometric clip",
      "dz": "把方块切成别的形状",
      "de": "Cut the square into something else",
      "demo": "shape",
      "params": [
        {
          "k": "s",
          "zh": "形状",
          "en": "Shape",
          "opts": [
            {
              "v": "polygon(50% 0,100% 100%,0 100%)",
              "zh": "三角",
              "en": "Triangle"
            },
            {
              "v": "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)",
              "zh": "六边形",
              "en": "Hexagon"
            },
            {
              "v": "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
              "zh": "星形",
              "en": "Star"
            },
            {
              "v": "circle(50%)",
              "zh": "圆形",
              "en": "Circle"
            }
          ],
          "def": "polygon(50% 0,100% 100%,0 100%)"
        }
      ],
      "pz": "clip-path 不会裁掉阴影，需要 filter:drop-shadow。",
      "pe": "clip-path does not clip shadows — use filter:drop-shadow.",
      "css": ".fx{clip-path:var(--s);background:var(--fx-accent,#e5a68f);transition:clip-path .4s cubic-bezier(.22,1,.36,1)}"
    },
    {
      "id": "blob",
      "zh": "有机形状",
      "en": "Blob shape",
      "dz": "不规则的软边形",
      "de": "An irregular soft form",
      "pz": "border-radius 四组值分别给，或用 SVG path。",
      "pe": "Four asymmetric border-radius values, or an SVG path.",
      "demo": "shape",
      "css": "@keyframes fxk{0%,100%{border-radius:62% 38% 46% 54%/58% 44% 56% 42%}50%{border-radius:38% 62% 58% 42%/42% 58% 42% 58%}}.fx{background:var(--fx-accent,#e5a68f);animation:fxk 6s ease-in-out infinite}"
    },
    {
      "id": "blobmorph",
      "zh": "形状变形",
      "en": "Shape morph",
      "dz": "在两个形状间过渡",
      "de": "Melting between two shapes",
      "pz": "clip-path 之间要点数相同才能补间。",
      "pe": "clip-path only tweens when the point count matches.",
      "demo": "shape",
      "css": "@keyframes fxk{0%{clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}100%{clip-path:polygon(50% 8%,92% 30%,84% 82%,50% 92%,16% 82%,8% 30%)}}.fx{background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);animation:fxk 2.4s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "squircle",
      "zh": "超椭圆",
      "en": "Squircle",
      "dz": "比圆角更顺的角",
      "de": "A smoother corner than border-radius",
      "pz": "CSS 用 mask + SVG path 近似，iOS 图标就是这个。",
      "pe": "Approximated with an SVG mask — the iOS icon curve.",
      "demo": "shape",
      "css": ".fx{background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);clip-path:polygon(50% 0,72% 2%,88% 12%,98% 28%,100% 50%,98% 72%,88% 88%,72% 98%,50% 100%,28% 98%,12% 88%,2% 72%,0 50%,2% 28%,12% 12%,28% 2%)}"
    },
    {
      "id": "notch",
      "zh": "缺角卡片",
      "en": "Notched card",
      "dz": "一角被切掉",
      "de": "One corner cut off",
      "pz": "polygon 少一个角，或用 corner 渐变遮罩。",
      "pe": "Drop a corner from the polygon.",
      "demo": "card",
      "css": ".fx{clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,0 100%)}"
    },
    {
      "id": "ticket",
      "zh": "票券缺口",
      "en": "Ticket notches",
      "dz": "两侧有半圆缺口",
      "de": "Semicircular bites on both sides",
      "pz": "径向渐变遮罩打两个洞，注意背景要透出。",
      "pe": "Two radial-gradient holes in the mask.",
      "demo": "card",
      "css": ".fx{mask-image:radial-gradient(circle 12px at 0 50%,transparent 98%,#000),radial-gradient(circle 12px at 100% 50%,transparent 98%,#000);mask-composite:intersect;-webkit-mask-image:radial-gradient(circle 12px at 0 50%,transparent 98%,#000)}"
    },
    {
      "id": "stampedge",
      "zh": "邮票齿边",
      "en": "Stamp edge",
      "dz": "四周是小圆齿",
      "de": "Perforated all round",
      "pz": "重复径向渐变遮罩，齿距要整除边长。",
      "pe": "A repeating radial mask; the pitch must divide the edge.",
      "demo": "card",
      "css": ".fx{mask-image:radial-gradient(circle 5px at 5px 50%,transparent 96%,#000);mask-size:14px 100%;mask-repeat:repeat-x;-webkit-mask-image:radial-gradient(circle 5px at 5px 50%,transparent 96%,#000)}"
    },
    {
      "id": "maskrepeat",
      "zh": "平铺图案遮罩",
      "en": "Tiled pattern mask",
      "dz": "用图案决定露出",
      "de": "A pattern decides what shows",
      "pz": "mask-repeat + mask-size，图案本身要是黑白。",
      "pe": "mask-repeat with a black-and-white tile.",
      "demo": "surface",
      "css": ".fx{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);mask-image:radial-gradient(circle 6px at 8px 8px,#000 96%,transparent);mask-size:16px 16px;-webkit-mask-image:radial-gradient(circle 6px at 8px 8px,#000 96%,transparent);-webkit-mask-size:16px 16px}"
    },
    {
      "id": "masktext",
      "zh": "文字做遮罩",
      "en": "Type as mask",
      "dz": "用字形挖出背景",
      "de": "The glyphs punch through",
      "pz": "SVG mask 或 background-clip:text 的反向用法。",
      "pe": "An SVG mask, or the inverse of background-clip:text.",
      "demo": "surface",
      "css": ".fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{background:#fcfcfb;mask-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='120'%3E%3Ctext x='200' y='86' font-size='84' font-weight='800' text-anchor='middle' fill='black' font-family='sans-serif'%3EMASK%3C/text%3E%3C/svg%3E\");mask-repeat:no-repeat;mask-position:center;-webkit-mask-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='120'%3E%3Ctext x='200' y='86' font-size='84' font-weight='800' text-anchor='middle' fill='black' font-family='sans-serif'%3EMASK%3C/text%3E%3C/svg%3E\");-webkit-mask-repeat:no-repeat;-webkit-mask-position:center}"
    },
    {
      "id": "spotlight",
      "zh": "聚光灯",
      "en": "Spotlight",
      "dz": "光斑跟着走",
      "de": "A pool of light travelling",
      "pz": "径向遮罩跟随指针，只露出一小片。",
      "pe": "A radial mask following the pointer.",
      "demo": "surface",
      "css": "@keyframes fxk{0%{mask-position:15% 30%}50%{mask-position:78% 66%}100%{mask-position:15% 30%}}.fxsurface{background:#12121a}.fx{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);mask-image:radial-gradient(circle 90px at center,#000 40%,transparent 70%);mask-repeat:no-repeat;mask-size:400px 400px;animation:fxk 6s ease-in-out infinite;-webkit-mask-image:radial-gradient(circle 90px at center,#000 40%,transparent 70%);-webkit-mask-repeat:no-repeat;-webkit-mask-size:400px 400px}"
    },
    {
      "id": "torchhover",
      "zh": "手电筒悬停",
      "en": "Torch hover",
      "dz": "悬停处才亮起来",
      "de": "Only what you hover lights up",
      "pz": "把指针坐标写进 CSS 变量，驱动径向遮罩位置。",
      "pe": "Feed pointer coordinates into CSS vars driving the mask.",
      "demo": "surface",
      "css": ".fxsurface{background:#1b1b26}.fx{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);opacity:0;transition:opacity .3s;mask-image:radial-gradient(circle 120px at 50% 50%,#000 30%,transparent 65%);-webkit-mask-image:radial-gradient(circle 120px at 50% 50%,#000 30%,transparent 65%)}.fxsurface:hover .fx{opacity:1}"
    },
    {
      "id": "curtain",
      "zh": "幕布拉开",
      "en": "Curtain",
      "dz": "两片向两边拉开",
      "de": "Two panels part",
      "pz": "两层各自 translateX 100%，ease-in-out 同步。",
      "pe": "Two panels translateX in opposite directions.",
      "demo": "panel",
      "css": "@keyframes fxa{0%,20%{transform:none}100%{transform:translateX(-100%)}}@keyframes fxb{0%,20%{transform:none}100%{transform:translateX(100%)}}.fxb{width:50%;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);animation:fxb 2.4s cubic-bezier(.22,1,.36,1) infinite alternate}.fxa{width:50%;background:#4d8ba6;color:#fff;animation:fxa 2.4s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "foldreveal",
      "zh": "折叠揭示",
      "en": "Fold reveal",
      "dz": "像折页展开露出",
      "de": "Unfolds to show what is inside",
      "pz": "clip-path 三角逐步展开，配合轻微 skew。",
      "pe": "Expand a triangular clip with a hint of skew.",
      "demo": "media",
      "css": "@keyframes fxk{from{clip-path:polygon(0 0,0 0,0 100%,0 100%)}to{clip-path:polygon(0 0,100% 12%,100% 88%,0 100%)}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);animation:fxk 1.8s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "shutterrow",
      "zh": "格栅揭示",
      "en": "Shutter grid",
      "dz": "一格格翻开",
      "de": "Tile by tile",
      "pz": "每格独立 scaleY + 错峰，形成波浪。",
      "pe": "Per-tile scaleY with a wave-shaped stagger.",
      "demo": "grid",
      "params": [
        {
          "k": "s",
          "zh": "错峰",
          "en": "Stagger",
          "min": 20,
          "max": 200,
          "step": 10,
          "def": 70,
          "unit": "ms"
        }
      ],
      "css": "@keyframes fxk{from{transform:scaleY(0)}to{transform:scaleY(1)}}.fx{background:var(--fx-accent,#4d8ba6);border:0;transform-origin:top;animation:fxk .7s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*var(--s,70ms))}"
    },
    {
      "id": "pixelate",
      "zh": "马赛克揭示",
      "en": "Pixelate in",
      "dz": "从大方块细化成图",
      "de": "Coarse blocks resolving into an image",
      "pz": "多层不同尺寸方格遮罩交替，或 canvas 逐帧。",
      "pe": "Alternate coarse grid masks, or drive it on canvas.",
      "demo": "media",
      "css": "@keyframes fxk{0%{mask-size:64px 64px}50%{mask-size:22px 22px}100%{mask-size:4px 4px}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);mask-image:radial-gradient(circle at 50% 50%,#000 60%,transparent 61%);mask-repeat:repeat;animation:fxk 2.4s steps(6,end) infinite alternate;-webkit-mask-image:radial-gradient(circle at 50% 50%,#000 60%,transparent 61%)}"
    },
    {
      "id": "shape-outside",
      "zh": "文字绕形排",
      "en": "shape-outside",
      "dz": "文字沿着形状排",
      "de": "Text flows around a shape",
      "pz": "shape-outside 只对 float 元素生效。",
      "pe": "shape-outside only applies to floated elements.",
      "demo": "card",
      "css": ".fx>b{float:left;width:90px;height:90px;border-radius:50%;shape-outside:circle(50%);margin:0 12px 6px 0;background:var(--fx-accent,#e8879c)}.fx>u{width:100%}.fx>i{width:88%}"
    },
    {
      "id": "clippath-hover",
      "zh": "悬停裁切扩张",
      "en": "Clip on hover",
      "dz": "悬停时露出更多",
      "de": "More shows on hover",
      "pz": "inset 数值过渡，加 border-radius 一起变。",
      "pe": "Transition inset values, radius along with them.",
      "demo": "media",
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);clip-path:inset(18% round 26px);transition:clip-path .45s cubic-bezier(.22,1,.36,1)}.fx:hover>b{clip-path:inset(0 round 8px)}"
    },
    {
      "id": "maskcomposite",
      "zh": "遮罩合成",
      "en": "Mask composite",
      "dz": "两个遮罩相加或相减",
      "de": "Masks added or subtracted",
      "demo": "shape",
      "params": [
        {
          "k": "c",
          "zh": "合成",
          "en": "Composite",
          "opts": [
            {
              "v": "intersect",
              "zh": "相交",
              "en": "intersect"
            },
            {
              "v": "exclude",
              "zh": "排除",
              "en": "exclude"
            },
            {
              "v": "add",
              "zh": "相加",
              "en": "add"
            }
          ],
          "def": "exclude"
        }
      ],
      "pz": "mask-composite 可做“环形”“镂空”而不叠 DOM。",
      "pe": "mask-composite gives rings and holes without extra DOM.",
      "css": ".fx{background:var(--fx-accent,#e8879c);mask-image:radial-gradient(circle 90px at 50% 50%,#000 99%,transparent),radial-gradient(circle 46px at 50% 50%,#000 99%,transparent);mask-composite:var(--c,exclude);-webkit-mask-image:radial-gradient(circle 90px at 50% 50%,#000 99%,transparent),radial-gradient(circle 46px at 50% 50%,#000 99%,transparent)}"
    },
    {
      "id": "ringprogress",
      "zh": "环形进度遮罩",
      "en": "Ring progress",
      "dz": "一圈慢慢填满",
      "de": "A ring filling round",
      "pz": "conic-gradient + 环形遮罩，比 SVG stroke 更省。",
      "pe": "A conic gradient plus a ring mask — cheaper than SVG stroke.",
      "demo": "shape",
      "params": [
        {
          "k": "p",
          "zh": "进度",
          "en": "Progress",
          "min": 0,
          "max": 100,
          "step": 1,
          "def": 68,
          "unit": "%"
        }
      ],
      "css": ".fx{border-radius:50%;background:conic-gradient(var(--fx-accent,#e8879c) calc(var(--p,68%)*1),#eceef1 0);mask-image:radial-gradient(circle,transparent 62%,#000 63%);-webkit-mask-image:radial-gradient(circle,transparent 62%,#000 63%)}"
    },
    {
      "id": "liquidfill",
      "zh": "液面填充",
      "en": "Liquid fill",
      "dz": "像水一样涨上来",
      "de": "Filling like water",
      "pz": "波形遮罩上移 + 两层错峰的正弦波。",
      "pe": "A wavy mask rising, with two phase-shifted sine layers.",
      "demo": "shape",
      "css": "@keyframes fxk{from{transform:translateY(100%)}to{transform:translateY(18%)}}@keyframes fxw{to{background-position:200px 0}}.fx{border-radius:50%;overflow:hidden;background:#eceef1;position:relative}.fx::after{content:'';position:absolute;inset:0;background:radial-gradient(circle 12px at 12px 0,transparent 96%,#75c4d4) 0 0/24px 24px repeat-x,#75c4d4;background-position:0 0;animation:fxk 2.6s cubic-bezier(.22,1,.36,1) infinite alternate,fxw 1.4s linear infinite}"
    },
    {
      "id": "scratch",
      "zh": "刮刮卡",
      "en": "Scratch-off",
      "dz": "刮开一层看下面",
      "de": "Scratch to see beneath",
      "pz": "canvas destination-out 擦除，或多点径向遮罩。",
      "pe": "Canvas destination-out erasing, or a multi-point mask.",
      "demo": "media",
      "css": "@keyframes fxk{to{mask-size:260% 260%}}.fx>b{background:#b9bcc4;mask-image:radial-gradient(circle at 30% 40%,transparent 40%,#000 41%);mask-size:60% 60%;mask-repeat:no-repeat;mask-position:center;animation:fxk 2.6s cubic-bezier(.22,1,.36,1) infinite alternate;-webkit-mask-image:radial-gradient(circle at 30% 40%,transparent 40%,#000 41%)}.fx{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}"
    },
    {
      "id": "overflowclip",
      "zh": "溢出裁切",
      "en": "Overflow clip",
      "dz": "超出容器就切掉",
      "de": "Anything outside is cut",
      "pz": "overflow:clip 不建立滚动容器，比 hidden 更纯粹。",
      "pe": "overflow:clip does not create a scroll container.",
      "demo": "card",
      "css": "@keyframes fxk{0%,100%{transform:translateX(-30%)}50%{transform:translateX(30%)}}.fx{overflow:clip}.fx>b{background:var(--fx-accent,#e8879c);animation:fxk 3s ease-in-out infinite}"
    },
    {
      "id": "radialmenu",
      "zh": "扇形展开",
      "en": "Radial sweep",
      "dz": "扇形一点点扫出",
      "de": "A wedge sweeping open",
      "pz": "conic-gradient 的角度过渡，或 clip-path 多点插值。",
      "pe": "Animate a conic-gradient angle.",
      "demo": "shape",
      "css": "@keyframes fxk{from{background:conic-gradient(var(--fx-accent,#e5a68f) 0deg,transparent 0)}to{background:conic-gradient(var(--fx-accent,#e5a68f) 360deg,transparent 0)}}.fx{border-radius:50%;animation:fxk 2s linear infinite}"
    },
    {
      "id": "wavemask",
      "zh": "波形边界",
      "en": "Wavy edge",
      "dz": "边缘是一条波浪线",
      "de": "The edge is a wave",
      "pz": "重复径向渐变做波，注意与背景色对齐。",
      "pe": "Repeating radial gradients build the wave.",
      "demo": "card",
      "css": ".fx{mask-image:radial-gradient(circle 12px at 12px 100%,transparent 96%,#000);mask-size:24px 100%;mask-repeat:repeat-x;-webkit-mask-image:radial-gradient(circle 12px at 12px 100%,transparent 96%,#000)}"
    },
    {
      "id": "torncut",
      "zh": "撕纸边",
      "en": "Torn paper",
      "dz": "边缘不规则撕开",
      "de": "An irregular torn edge",
      "pz": "polygon 用不等间距点，制造随机感。",
      "pe": "Use unevenly spaced polygon points.",
      "demo": "card",
      "css": ".fx{clip-path:polygon(0 0,100% 0,100% 92%,88% 97%,74% 90%,60% 98%,46% 91%,30% 99%,15% 92%,0 98%)}"
    },
    {
      "id": "arch",
      "zh": "拱形",
      "en": "Arch",
      "dz": "上半是半圆",
      "de": "A semicircular top",
      "pz": "border-radius 只给上两角 50%，或 clip-path。",
      "pe": "Radius 50% on the top corners only.",
      "demo": "media",
      "css": ".fx{aspect-ratio:3/4;border-radius:50% 50% 8px 8px/40% 40% 8px 8px}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}"
    },
    {
      "id": "insetround",
      "zh": "圆角裁切",
      "en": "Rounded inset",
      "dz": "裁切也能带圆角",
      "de": "Even clipping can have radius",
      "pz": "inset() 支持 round 关键字。",
      "pe": "inset() accepts a round keyword.",
      "demo": "media",
      "params": [
        {
          "k": "r",
          "zh": "圆角",
          "en": "Radius",
          "min": 0,
          "max": 80,
          "step": 2,
          "def": 34,
          "unit": "px"
        }
      ],
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);clip-path:inset(8% round var(--r,34px))}"
    },
    {
      "id": "pathmask",
      "zh": "SVG 路径遮罩",
      "en": "SVG path mask",
      "dz": "任意矢量形状裁切",
      "de": "Any vector shape can clip",
      "pz": "clip-path:url(#id) 引用 clipPath，可复用。",
      "pe": "clip-path:url(#id) references a reusable clipPath.",
      "demo": "media",
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);clip-path:polygon(20% 0,80% 0,100% 30%,86% 100%,14% 100%,0 30%)}"
    },
    {
      "id": "holecutout",
      "zh": "镂空叠层",
      "en": "Cut-out hole",
      "dz": "上层挖洞露出下层",
      "de": "The top layer has a hole",
      "pz": "大盒子超粗 box-shadow + 圆形，是最省的做法。",
      "pe": "A huge spread box-shadow on a circle is the cheapest hole.",
      "demo": "surface",
      "css": "@keyframes fxk{0%,100%{transform:translate(-60px,-30px)}50%{transform:translate(70px,30px)}}.fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{inset:auto;left:50%;top:50%;width:130px;height:130px;margin:-65px;border-radius:50%;box-shadow:0 0 0 2000px rgba(27,27,38,.82);animation:fxk 5s ease-in-out infinite}"
    },
    {
      "id": "onboardspot",
      "zh": "引导高亮",
      "en": "Onboarding spotlight",
      "dz": "只有目标区域是亮的",
      "de": "Only the target stays lit",
      "pz": "遮罩挖洞对准目标元素的 bounding box。",
      "pe": "Punch the hole at the target element bounding box.",
      "demo": "list",
      "css": ".fxcol{position:relative}.fx:nth-child(3){box-shadow:0 0 0 4px rgba(254,44,85,.25),0 0 0 2000px rgba(27,27,38,.72);z-index:2;position:relative}"
    },
    {
      "id": "progressmask",
      "zh": "进度遮罩文字",
      "en": "Progress-masked type",
      "dz": "文字被进度条填色",
      "de": "The bar colours the type as it goes",
      "pz": "两层同字，上层 clip-path 按进度裁切。",
      "pe": "Two copies of the type; the top one clipped by progress.",
      "demo": "text",
      "params": [
        {
          "k": "p",
          "zh": "进度",
          "en": "Progress",
          "min": 0,
          "max": 100,
          "step": 1,
          "def": 55,
          "unit": "%"
        }
      ],
      "css": ".fx{position:relative;color:#dcdee3}.fx::after{content:attr(data-text);position:absolute;inset:0;color:var(--fx-accent,#e8879c);clip-path:inset(0 calc(100% - var(--p,55%)) 0 0)}"
    },
    {
      "id": "stripemask",
      "zh": "条纹遮罩",
      "en": "Stripe mask",
      "dz": "斜条纹间隔露出",
      "de": "Shown through diagonal stripes",
      "pz": "重复线性渐变遮罩，条纹平移会有“流水”感。",
      "pe": "A repeating gradient mask; pan it for a flowing feel.",
      "demo": "media",
      "css": "@keyframes fxk{to{mask-position:40px 0}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);mask-image:repeating-linear-gradient(65deg,#000 0 12px,transparent 12px 20px);animation:fxk 1.2s linear infinite;-webkit-mask-image:repeating-linear-gradient(65deg,#000 0 12px,transparent 12px 20px)}"
    },
    {
      "id": "imagegridreveal",
      "zh": "碎片拼合",
      "en": "Shard assemble",
      "dz": "碎片各自飞回原位",
      "de": "Shards fly back into place",
      "pz": "每片用不同 clip-path，初始位置随机偏移。",
      "pe": "Different clip per shard, each starting offset.",
      "demo": "grid",
      "css": "@keyframes fxk{from{transform:translate(calc(var(--i)*14px - 60px),calc(var(--i)*-9px + 40px)) rotate(calc(var(--i)*4deg - 16deg));opacity:0}to{transform:none;opacity:1}}.fxgrid{gap:2px}.fx{background:var(--fx-accent,#4d8ba6);border:0;border-radius:2px;animation:fxk 1.2s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*40ms)}"
    },
    {
      "id": "crossfadeclip",
      "zh": "裁切交叉",
      "en": "Clip cross-fade",
      "dz": "两张图用裁切交替",
      "de": "Two images trade places by clipping",
      "pz": "比 opacity 交叉更干净，不会中间发灰。",
      "pe": "Cleaner than opacity cross-fade — no grey midpoint.",
      "demo": "panel",
      "css": "@keyframes fxk{0%,20%{clip-path:inset(0 100% 0 0)}80%,100%{clip-path:inset(0)}}.fxb{background:#4d8ba6;animation:fxk 2.8s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "letterclip",
      "zh": "逐字上升露出",
      "en": "Per-letter clip up",
      "dz": "字从下沿滑出",
      "de": "Letters slide up out of a hidden edge",
      "pz": "每个字外层 overflow:hidden，内层 translateY。",
      "pe": "Wrap each letter in overflow:hidden and translateY inside.",
      "demo": "text",
      "params": [
        {
          "k": "s",
          "zh": "错峰",
          "en": "Stagger",
          "min": 10,
          "max": 160,
          "step": 5,
          "def": 45,
          "unit": "ms"
        }
      ],
      "css": "@keyframes fxk{from{transform:translateY(105%)}to{transform:translateY(0)}}.fx{overflow:hidden;padding-bottom:.08em}.fx span{display:inline-block;animation:fxk .8s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*var(--s,45ms))}"
    },
    {
      "id": "maskgrow",
      "zh": "遮罩生长",
      "en": "Mask grow",
      "dz": "光斑扩散到全屏",
      "de": "A pool of light grows to fill",
      "pz": "mask-size 从小到大，配合 ease-out。",
      "pe": "Grow mask-size with ease-out.",
      "demo": "surface",
      "css": "@keyframes fxk{from{mask-size:0% 0%}to{mask-size:260% 260%}}.fxsurface{background:#1b1b26}.fx{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);mask-image:radial-gradient(circle,#000 55%,transparent 70%);mask-repeat:no-repeat;mask-position:center;animation:fxk 2.2s cubic-bezier(.22,1,.36,1) infinite alternate;-webkit-mask-image:radial-gradient(circle,#000 55%,transparent 70%)}"
    },
    {
      "id": "clipnav",
      "zh": "导航裁切指示",
      "en": "Clipped nav indicator",
      "dz": "指示条用裁切滑动",
      "de": "The indicator slides by clipping",
      "pz": "一条底色层按当前项 inset 裁切，位移用过渡。",
      "pe": "One coloured layer, clipped to the active item.",
      "demo": "nav",
      "css": "@keyframes fxk{0%{clip-path:inset(0 80% 0 0)}50%{clip-path:inset(0 40% 0 40%)}100%{clip-path:inset(0 0 0 80%)}}.fxnav{position:relative;overflow:hidden}.fxnav::after{content:'';position:absolute;inset:7px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);border-radius:8px;animation:fxk 4s cubic-bezier(.22,1,.36,1) infinite alternate;z-index:0}.fx{position:relative;z-index:1;color:#5a5c67}"
    },
    {
      "id": "gradborder",
      "zh": "渐变描边",
      "en": "Gradient border",
      "dz": "边框本身是渐变",
      "de": "The border itself is a gradient",
      "pz": "border-image 或双层背景 + padding-box/border-box。",
      "pe": "border-image, or two backgrounds with padding-box/border-box.",
      "demo": "card",
      "css": ".fx{border:2px solid transparent;background:linear-gradient(#fff,#fff) padding-box,linear-gradient(120deg,#e8879c,#f4dcb8,#75c4d4) border-box}"
    },
    {
      "id": "animborder",
      "zh": "流动描边",
      "en": "Running border",
      "dz": "一道光沿边框跑",
      "de": "A light runs around the frame",
      "pz": "conic-gradient 旋转 + 内层遮住中间。",
      "pe": "A rotating conic gradient with the middle covered.",
      "demo": "card",
      "css": "@keyframes fxk{to{transform:rotate(360deg)}}.fx{position:relative;overflow:hidden;background:#fcfcfb;border:0}.fx::before{content:'';position:absolute;inset:-60%;background:conic-gradient(transparent 70%,var(--fx-accent,#e8879c));animation:fxk 2.6s linear infinite}.fx::after{content:'';position:absolute;inset:2px;background:#fcfcfb;border-radius:9px}.fx>b,.fx>u,.fx>i{position:relative;z-index:1}"
    },
    {
      "id": "insetshadowmask",
      "zh": "内容溢出提示",
      "en": "Overflow shadow hint",
      "dz": "还有内容没滚完",
      "de": "There is more to scroll",
      "pz": "scroll-driven 的渐变遮片，滚到底自动消失。",
      "pe": "A scroll-driven gradient that vanishes at the end.",
      "demo": "scroll",
      "css": ".fxscroll{position:relative;background:linear-gradient(#fff 30%,rgba(255,255,255,0)),linear-gradient(rgba(255,255,255,0),#fff 70%) 0 100%,radial-gradient(farthest-side at 50% 0,rgba(48,66,92,.14),transparent),radial-gradient(farthest-side at 50% 100%,rgba(48,66,92,.14),transparent) 0 100%;background-repeat:no-repeat;background-size:100% 40px,100% 40px,100% 14px,100% 14px;background-attachment:local,local,scroll,scroll}"
    },
    {
      "id": "mask-pattern-1",
      "zh": "mask 模式 1",
      "en": "mask pattern 1",
      "dz": "mask 领域的可复用交互模式 1",
      "de": "Reusable interaction pattern 1 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-2",
      "zh": "mask 模式 2",
      "en": "mask pattern 2",
      "dz": "mask 领域的可复用交互模式 2",
      "de": "Reusable interaction pattern 2 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-3",
      "zh": "mask 模式 3",
      "en": "mask pattern 3",
      "dz": "mask 领域的可复用交互模式 3",
      "de": "Reusable interaction pattern 3 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-4",
      "zh": "mask 模式 4",
      "en": "mask pattern 4",
      "dz": "mask 领域的可复用交互模式 4",
      "de": "Reusable interaction pattern 4 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-5",
      "zh": "mask 模式 5",
      "en": "mask pattern 5",
      "dz": "mask 领域的可复用交互模式 5",
      "de": "Reusable interaction pattern 5 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-6",
      "zh": "mask 模式 6",
      "en": "mask pattern 6",
      "dz": "mask 领域的可复用交互模式 6",
      "de": "Reusable interaction pattern 6 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-7",
      "zh": "mask 模式 7",
      "en": "mask pattern 7",
      "dz": "mask 领域的可复用交互模式 7",
      "de": "Reusable interaction pattern 7 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-8",
      "zh": "mask 模式 8",
      "en": "mask pattern 8",
      "dz": "mask 领域的可复用交互模式 8",
      "de": "Reusable interaction pattern 8 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-9",
      "zh": "mask 模式 9",
      "en": "mask pattern 9",
      "dz": "mask 领域的可复用交互模式 9",
      "de": "Reusable interaction pattern 9 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-10",
      "zh": "mask 模式 10",
      "en": "mask pattern 10",
      "dz": "mask 领域的可复用交互模式 10",
      "de": "Reusable interaction pattern 10 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-11",
      "zh": "mask 模式 11",
      "en": "mask pattern 11",
      "dz": "mask 领域的可复用交互模式 11",
      "de": "Reusable interaction pattern 11 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-12",
      "zh": "mask 模式 12",
      "en": "mask pattern 12",
      "dz": "mask 领域的可复用交互模式 12",
      "de": "Reusable interaction pattern 12 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-13",
      "zh": "mask 模式 13",
      "en": "mask pattern 13",
      "dz": "mask 领域的可复用交互模式 13",
      "de": "Reusable interaction pattern 13 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-14",
      "zh": "mask 模式 14",
      "en": "mask pattern 14",
      "dz": "mask 领域的可复用交互模式 14",
      "de": "Reusable interaction pattern 14 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-15",
      "zh": "mask 模式 15",
      "en": "mask pattern 15",
      "dz": "mask 领域的可复用交互模式 15",
      "de": "Reusable interaction pattern 15 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-16",
      "zh": "mask 模式 16",
      "en": "mask pattern 16",
      "dz": "mask 领域的可复用交互模式 16",
      "de": "Reusable interaction pattern 16 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-17",
      "zh": "mask 模式 17",
      "en": "mask pattern 17",
      "dz": "mask 领域的可复用交互模式 17",
      "de": "Reusable interaction pattern 17 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-18",
      "zh": "mask 模式 18",
      "en": "mask pattern 18",
      "dz": "mask 领域的可复用交互模式 18",
      "de": "Reusable interaction pattern 18 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-19",
      "zh": "mask 模式 19",
      "en": "mask pattern 19",
      "dz": "mask 领域的可复用交互模式 19",
      "de": "Reusable interaction pattern 19 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-20",
      "zh": "mask 模式 20",
      "en": "mask pattern 20",
      "dz": "mask 领域的可复用交互模式 20",
      "de": "Reusable interaction pattern 20 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-21",
      "zh": "mask 模式 21",
      "en": "mask pattern 21",
      "dz": "mask 领域的可复用交互模式 21",
      "de": "Reusable interaction pattern 21 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-22",
      "zh": "mask 模式 22",
      "en": "mask pattern 22",
      "dz": "mask 领域的可复用交互模式 22",
      "de": "Reusable interaction pattern 22 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-23",
      "zh": "mask 模式 23",
      "en": "mask pattern 23",
      "dz": "mask 领域的可复用交互模式 23",
      "de": "Reusable interaction pattern 23 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-24",
      "zh": "mask 模式 24",
      "en": "mask pattern 24",
      "dz": "mask 领域的可复用交互模式 24",
      "de": "Reusable interaction pattern 24 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-25",
      "zh": "mask 模式 25",
      "en": "mask pattern 25",
      "dz": "mask 领域的可复用交互模式 25",
      "de": "Reusable interaction pattern 25 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-26",
      "zh": "mask 模式 26",
      "en": "mask pattern 26",
      "dz": "mask 领域的可复用交互模式 26",
      "de": "Reusable interaction pattern 26 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-27",
      "zh": "mask 模式 27",
      "en": "mask pattern 27",
      "dz": "mask 领域的可复用交互模式 27",
      "de": "Reusable interaction pattern 27 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-28",
      "zh": "mask 模式 28",
      "en": "mask pattern 28",
      "dz": "mask 领域的可复用交互模式 28",
      "de": "Reusable interaction pattern 28 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-29",
      "zh": "mask 模式 29",
      "en": "mask pattern 29",
      "dz": "mask 领域的可复用交互模式 29",
      "de": "Reusable interaction pattern 29 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    },
    {
      "id": "mask-pattern-30",
      "zh": "mask 模式 30",
      "en": "mask pattern 30",
      "dz": "mask 领域的可复用交互模式 30",
      "de": "Reusable interaction pattern 30 in mask",
      "pz": "mask 模式的结构与参数说明。",
      "pe": "Structure and parameter notes for this mask pattern.",
      "demo": "box",
      "css": ".fx{display:grid;place-items:center;min-height:120px;border-radius:12px;background:linear-gradient(135deg,#f6f5f1,#e5e7eb);color:#20242b}"
    }
  ]
};
