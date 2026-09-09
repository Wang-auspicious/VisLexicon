// Curated foundational patterns
export default {
  "id": "filter",
  "zh": "滤镜与混合",
  "en": "Filters & blending",
  "dz": "同一素材，靠滤镜和混合模式换气质",
  "de": "Same pixels — filters and blend modes change the mood",
  "items": [
    {
      "id": "blur",
      "zh": "模糊",
      "en": "Blur",
      "dz": "失焦",
      "de": "Out of focus",
      "pz": "filter:blur() 会吃性能，大面积慎用。",
      "pe": "filter:blur() is expensive over large areas.",
      "demo": "media",
      "params": [
        {
          "k": "b",
          "zh": "半径",
          "en": "Radius",
          "min": 0,
          "max": 30,
          "step": 1,
          "def": 8,
          "unit": "px"
        }
      ],
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:blur(var(--b,8px))}"
    },
    {
      "id": "blurin",
      "zh": "模糊入场",
      "en": "Blur in",
      "dz": "从虚到实",
      "de": "From soft to sharp",
      "pz": "blur 与 opacity 同步收敛，最像相机对焦。",
      "pe": "Converge blur and opacity together — it reads as focusing.",
      "demo": "media",
      "css": "@keyframes fxk{from{filter:blur(18px);opacity:0}to{filter:blur(0);opacity:1}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);animation:fxk 1.6s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "progblur",
      "zh": "渐进模糊",
      "en": "Progressive blur",
      "dz": "越往下越虚",
      "de": "Softer toward the bottom",
      "pz": "多层 backdrop-filter + 渐变遮罩叠出梯度。",
      "pe": "Stack masked backdrop-filter layers to build the gradient.",
      "demo": "media",
      "css": ".fx{position:relative;background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx>b{backdrop-filter:blur(12px);mask-image:linear-gradient(transparent 35%,#000)}"
    },
    {
      "id": "backdrop",
      "zh": "背景模糊层",
      "en": "Backdrop blur",
      "dz": "玻璃片压在内容上",
      "de": "A glass sheet over the content",
      "pz": "backdrop-filter 作用于层后内容，需要半透明底色。",
      "pe": "backdrop-filter blurs what is behind it; keep the surface semi-transparent.",
      "demo": "surface",
      "params": [
        {
          "k": "b",
          "zh": "模糊",
          "en": "Blur",
          "min": 0,
          "max": 24,
          "step": 1,
          "def": 10,
          "unit": "px"
        }
      ],
      "css": ".fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{inset:22% 14%;background:rgba(255,255,255,.4);backdrop-filter:blur(var(--b,10px));border-radius:14px;border:1px solid rgba(255,255,255,.5)}"
    },
    {
      "id": "gray",
      "zh": "去色",
      "en": "Grayscale",
      "dz": "抽掉所有颜色",
      "de": "All colour drained",
      "pz": "grayscale(1) 常用于未选中或禁用态。",
      "pe": "grayscale(1) reads as inactive or disabled.",
      "demo": "media",
      "params": [
        {
          "k": "g",
          "zh": "程度",
          "en": "Amount",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "def": 1,
          "unit": ""
        }
      ],
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:grayscale(var(--g,1))}"
    },
    {
      "id": "grayhover",
      "zh": "去色到上色",
      "en": "Grayscale to colour",
      "dz": "悬停才有颜色",
      "de": "Colour arrives on hover",
      "pz": "grayscale 过渡 300ms，比 opacity 更有档次。",
      "pe": "Transition grayscale over 300ms — classier than fading opacity.",
      "demo": "media",
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:grayscale(1);transition:filter .4s cubic-bezier(.22,1,.36,1)}.fx:hover>b{filter:grayscale(0)}"
    },
    {
      "id": "sepia",
      "zh": "棕褐",
      "en": "Sepia",
      "dz": "旧照片的暖调",
      "de": "Old-photograph warmth",
      "pz": "sepia + 轻微 contrast 更像胶片。",
      "pe": "sepia with a little contrast reads more like film.",
      "demo": "media",
      "params": [
        {
          "k": "s",
          "zh": "程度",
          "en": "Amount",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "def": 0.8,
          "unit": ""
        }
      ],
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:sepia(var(--s,.8)) contrast(1.05)}"
    },
    {
      "id": "invert",
      "zh": "反相",
      "en": "Invert",
      "dz": "颜色全部翻过来",
      "de": "Every colour flipped",
      "pz": "invert(1) 可做暗色模式的暴力方案，但会毁图片。",
      "pe": "invert(1) is the brute-force dark mode — it ruins photos.",
      "demo": "media",
      "css": "@keyframes fxk{50%{filter:invert(1)}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);animation:fxk 3s steps(1,end) infinite}"
    },
    {
      "id": "saturate",
      "zh": "饱和度",
      "en": "Saturate",
      "dz": "颜色变浓或变淡",
      "de": "Colour turned up or down",
      "pz": "saturate(1.4) 让照片更有食欲；超过 2 就假了。",
      "pe": "saturate(1.4) makes photos appetising; past 2 it looks fake.",
      "demo": "media",
      "params": [
        {
          "k": "s",
          "zh": "饱和",
          "en": "Saturation",
          "min": 0,
          "max": 3,
          "step": 0.1,
          "def": 1.6,
          "unit": ""
        }
      ],
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:saturate(var(--s,1.6))}"
    },
    {
      "id": "contrast",
      "zh": "对比度",
      "en": "Contrast",
      "dz": "明暗拉开",
      "de": "Lights and darks pulled apart",
      "pz": "contrast 提高时高光容易溢出，配合 brightness 微调。",
      "pe": "Raising contrast blows out highlights — trim brightness to compensate.",
      "demo": "media",
      "params": [
        {
          "k": "c",
          "zh": "对比",
          "en": "Contrast",
          "min": 0.2,
          "max": 2.4,
          "step": 0.1,
          "def": 1.4,
          "unit": ""
        }
      ],
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:contrast(var(--c,1.4))}"
    },
    {
      "id": "bright",
      "zh": "亮度",
      "en": "Brightness",
      "dz": "整体提亮或压暗",
      "de": "Lifted or dimmed overall",
      "pz": "hover 时 brightness(1.06) 比换背景色更省事。",
      "pe": "brightness(1.06) on hover is cheaper than swapping colours.",
      "demo": "card",
      "params": [
        {
          "k": "b",
          "zh": "亮度",
          "en": "Brightness",
          "min": 0.3,
          "max": 1.6,
          "step": 0.05,
          "def": 1,
          "unit": ""
        }
      ],
      "css": ".fx{filter:brightness(var(--b,1))}"
    },
    {
      "id": "huerotate",
      "zh": "色相旋转",
      "en": "Hue rotate",
      "dz": "整套配色一起转",
      "de": "The whole palette rotates",
      "pz": "hue-rotate 循环可做“彩虹”而不必换素材。",
      "pe": "Loop hue-rotate for a rainbow without new assets.",
      "demo": "media",
      "params": [
        {
          "k": "h",
          "zh": "色相",
          "en": "Hue",
          "min": 0,
          "max": 360,
          "step": 5,
          "def": 0,
          "unit": "deg"
        }
      ],
      "css": "@keyframes fxk{to{filter:hue-rotate(360deg)}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:hue-rotate(var(--h,0deg));animation:fxk 6s linear infinite}"
    },
    {
      "id": "duotone",
      "zh": "双色调",
      "en": "Duotone",
      "dz": "只用两种颜色重绘",
      "de": "Redrawn in two colours",
      "pz": "grayscale 后叠两层 blend（multiply + screen）。",
      "pe": "Grayscale first, then two blended layers (multiply + screen).",
      "demo": "media",
      "css": ".fx{position:relative;background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:grayscale(1) contrast(1.2)}.fx>b{background:#e8879c;mix-blend-mode:screen;opacity:.65}"
    },
    {
      "id": "tritone",
      "zh": "三色调",
      "en": "Tritone",
      "dz": "暗、中、亮各给一色",
      "de": "A colour each for shadow, mid, highlight",
      "pz": "三层不同 blend 模式叠加，控制各自 opacity。",
      "pe": "Three layers, three blend modes, tuned opacities.",
      "demo": "media",
      "css": ".fx{position:relative;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);filter:none}.fx>b{background:linear-gradient(135deg,#2f5570,#e5a68f);mix-blend-mode:screen}.fx::after{content:'';position:absolute;inset:0;background:#e8879c;mix-blend-mode:overlay;opacity:.5}"
    },
    {
      "id": "multiply",
      "zh": "正片叠底",
      "en": "Multiply",
      "dz": "越叠越深",
      "de": "Overlaps get darker",
      "pz": "multiply 适合把文字压进照片，白色会消失。",
      "pe": "multiply presses ink into a photo; white disappears.",
      "demo": "surface",
      "css": ".fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{background:radial-gradient(circle at 35% 40%,#e8879c 0 30%,transparent 31%),radial-gradient(circle at 62% 62%,#f4dcb8 0 26%,transparent 27%);mix-blend-mode:multiply}"
    },
    {
      "id": "screen",
      "zh": "滤色",
      "en": "Screen",
      "dz": "越叠越亮",
      "de": "Overlaps get brighter",
      "pz": "screen 用于光效、烟雾，黑色会消失。",
      "pe": "screen suits light and smoke; black disappears.",
      "demo": "surface",
      "css": ".fxsurface{background:#12121a}.fx{background:radial-gradient(circle at 38% 42%,#e8879c 0 28%,transparent 29%),radial-gradient(circle at 62% 58%,#75c4d4 0 28%,transparent 29%);mix-blend-mode:screen}"
    },
    {
      "id": "overlay",
      "zh": "叠加",
      "en": "Overlay",
      "dz": "暗处更暗、亮处更亮",
      "de": "Darks darker, lights lighter",
      "pz": "overlay 是给照片“加质感”的默认选择。",
      "pe": "overlay is the default way to add texture to a photo.",
      "demo": "surface",
      "css": ".fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{background:repeating-linear-gradient(45deg,#fff 0 6px,#23232f 6px 12px);mix-blend-mode:overlay;opacity:.5}"
    },
    {
      "id": "difference",
      "zh": "差值",
      "en": "Difference",
      "dz": "重叠处颜色反转",
      "de": "Overlaps invert",
      "pz": "difference 让文字在任意底色上都可读。",
      "pe": "difference keeps type legible over anything.",
      "demo": "surface",
      "css": "@keyframes fxk{to{transform:translateX(60%)}}.fxsurface{background:#fcfcfb;display:flex;align-items:center;justify-content:center;font:700 46px/1 var(--fx-sans,system-ui)}.fxsurface::before{content:'DIFFERENCE';position:absolute;z-index:2;color:#fff;mix-blend-mode:difference}.fx{inset:auto 0 0 -60%;height:100%;width:70%;background:#e8879c;animation:fxk 3s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "exclusion",
      "zh": "排除",
      "en": "Exclusion",
      "dz": "比差值更柔和的反转",
      "de": "A softer inversion than difference",
      "pz": "exclusion 中灰重叠会变灰，适合柔和艺术效果。",
      "pe": "Mid greys cancel to grey — good for softer art direction.",
      "demo": "surface",
      "css": ".fxsurface{background:#4d8ba6}.fx{background:radial-gradient(circle at 45% 50%,#f4dcb8 0 34%,transparent 35%),radial-gradient(circle at 62% 52%,#75c4d4 0 34%,transparent 35%);mix-blend-mode:exclusion}"
    },
    {
      "id": "colordodge",
      "zh": "颜色减淡",
      "en": "Color dodge",
      "dz": "亮部被推爆",
      "de": "Highlights blown out",
      "pz": "color-dodge 做霓虹辉光比 box-shadow 更真。",
      "pe": "color-dodge glows read truer than box-shadow.",
      "demo": "surface",
      "css": "@keyframes fxk{0%,100%{opacity:.5}50%{opacity:1}}.fxsurface{background:#12121a}.fx{background:radial-gradient(circle at 50% 55%,#e5a68f,transparent 55%);mix-blend-mode:color-dodge;animation:fxk 2.4s ease-in-out infinite}"
    },
    {
      "id": "hardlight",
      "zh": "强光",
      "en": "Hard light",
      "dz": "强烈的高反差叠加",
      "de": "A hard, high-contrast overlay",
      "pz": "hard-light 常用于做“印刷错版”质感。",
      "pe": "hard-light gives that misprinted look.",
      "demo": "surface",
      "css": ".fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{background:linear-gradient(70deg,#e8879c,#23232f);mix-blend-mode:hard-light;opacity:.7}"
    },
    {
      "id": "softlight",
      "zh": "柔光",
      "en": "Soft light",
      "dz": "像打了一层柔光罩",
      "de": "Like a diffusion filter",
      "pz": "soft-light + 低不透明度是最安全的照片调色。",
      "pe": "soft-light at low opacity is the safest photo grade.",
      "demo": "media",
      "css": ".fx{position:relative;background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx>b{background:linear-gradient(#f4dcb8,#e8879c);mix-blend-mode:soft-light}"
    },
    {
      "id": "huemode",
      "zh": "色相混合",
      "en": "Hue blend",
      "dz": "只借上层的颜色",
      "de": "Borrows only the upper hue",
      "pz": "hue / saturation / color / luminosity 是四个分量混合。",
      "pe": "hue / saturation / color / luminosity blend one channel each.",
      "demo": "media",
      "params": [
        {
          "k": "m",
          "zh": "模式",
          "en": "Mode",
          "opts": [
            {
              "v": "hue",
              "zh": "色相",
              "en": "hue"
            },
            {
              "v": "saturation",
              "zh": "饱和度",
              "en": "saturation"
            },
            {
              "v": "color",
              "zh": "颜色",
              "en": "color"
            },
            {
              "v": "luminosity",
              "zh": "明度",
              "en": "luminosity"
            }
          ],
          "def": "hue"
        }
      ],
      "css": ".fx{position:relative;background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx>b{background:#e8879c;mix-blend-mode:var(--m,hue)}"
    },
    {
      "id": "bgblend",
      "zh": "背景层自混合",
      "en": "background-blend-mode",
      "dz": "一个元素内部的多层混合",
      "de": "Layers blending inside one element",
      "pz": "background-blend-mode 不影响下方元素，比 mix-blend 更安全。",
      "pe": "background-blend-mode stays inside the element — safer than mix-blend.",
      "demo": "surface",
      "css": ".fx{background:radial-gradient(circle at 30% 30%,#e8879c,transparent 60%),radial-gradient(circle at 70% 60%,#75c4d4,transparent 60%),#23232f;background-blend-mode:screen,screen,normal}"
    },
    {
      "id": "isolation",
      "zh": "混合隔离",
      "en": "Blend isolation",
      "dz": "把混合限制在一个组里",
      "de": "Blending kept inside one group",
      "pz": "isolation:isolate 建立新的堆叠上下文，防止混合穿透。",
      "pe": "isolation:isolate creates a new stacking context so blends do not leak.",
      "demo": "cards",
      "css": ".fxrow{isolation:isolate;background:#f2f3f5;padding:14px;border-radius:14px}.fx{mix-blend-mode:multiply;background:#e8879c;border:0}"
    },
    {
      "id": "dropshadowf",
      "zh": "滤镜投影",
      "en": "filter drop-shadow",
      "dz": "沿着形状轮廓的影子",
      "de": "A shadow that follows the real silhouette",
      "pz": "filter:drop-shadow 认得透明像素，box-shadow 不认。",
      "pe": "filter:drop-shadow respects alpha; box-shadow does not.",
      "demo": "shape",
      "css": ".fx{background:transparent;clip-path:polygon(50% 0,100% 100%,0 100%);box-shadow:none}.fxshape{filter:drop-shadow(0 18px 14px rgba(48,66,92,.35))}.fx{background:var(--fx-accent,#e5a68f)}"
    },
    {
      "id": "glowfilter",
      "zh": "辉光",
      "en": "Glow",
      "dz": "边缘发光",
      "de": "Edges emitting light",
      "pz": "多层 drop-shadow 同色叠加，半径递增。",
      "pe": "Stack same-colour drop-shadows with growing radii.",
      "demo": "text",
      "params": [
        {
          "k": "g",
          "zh": "强度",
          "en": "Glow",
          "min": 0,
          "max": 30,
          "step": 1,
          "def": 12,
          "unit": "px"
        }
      ],
      "css": ".fx{color:#fff;filter:drop-shadow(0 0 calc(var(--g,12px)*.5) #e5a68f) drop-shadow(0 0 var(--g,12px) #e5a68f)}"
    },
    {
      "id": "neon",
      "zh": "霓虹管",
      "en": "Neon tube",
      "dz": "像玻璃灯管一样通电",
      "de": "Glass tubing under current",
      "pz": "内白外彩的多层 text-shadow，配合轻微闪烁。",
      "pe": "White core, coloured halo, with a faint flicker.",
      "demo": "text",
      "css": "@keyframes fxk{0%,100%{opacity:1}47%{opacity:.82}49%{opacity:1}}.fx{color:#fff;text-shadow:0 0 4px #fff,0 0 12px #e8879c,0 0 30px #e8879c,0 0 60px #e8879c;animation:fxk 4s linear infinite}"
    },
    {
      "id": "chroma",
      "zh": "色差",
      "en": "Chromatic aberration",
      "dz": "边缘泛红蓝",
      "de": "Red/blue fringing at the edges",
      "pz": "文字用红青两层偏移，幅度 1–3px。",
      "pe": "Two tinted copies offset 1–3px.",
      "demo": "text",
      "params": [
        {
          "k": "o",
          "zh": "偏移",
          "en": "Offset",
          "min": 0,
          "max": 8,
          "step": 0.5,
          "def": 2,
          "unit": "px"
        }
      ],
      "css": ".fx{position:relative;color:#23232f}.fx::before,.fx::after{content:attr(data-text);position:absolute;inset:0;mix-blend-mode:screen}.fx::before{color:#ff2d2d;transform:translateX(calc(var(--o,2px)*-1))}.fx::after{color:#00e0ff;transform:translateX(var(--o,2px))}"
    },
    {
      "id": "glitchslice",
      "zh": "故障切片",
      "en": "Glitch slices",
      "dz": "被撕成几条错位",
      "de": "Torn into misaligned bands",
      "pz": "clip-path 分段 + 随机水平偏移，只在几帧出现。",
      "pe": "Clip into bands and jump them horizontally for a few frames only.",
      "demo": "text",
      "css": "@keyframes fxk{0%,92%,100%{clip-path:inset(0);transform:none}93%{clip-path:inset(20% 0 60% 0);transform:translateX(-12px)}95%{clip-path:inset(60% 0 12% 0);transform:translateX(10px)}97%{clip-path:inset(38% 0 40% 0);transform:translateX(-6px)}}.fx{animation:fxk 3.2s steps(1,end) infinite}"
    },
    {
      "id": "scanline",
      "zh": "扫描线",
      "en": "Scanlines",
      "dz": "CRT 显示器的横纹",
      "de": "CRT banding",
      "pz": "repeating-linear-gradient 加 overlay，线宽 2–3px。",
      "pe": "A repeating gradient in overlay, 2–3px pitch.",
      "demo": "surface",
      "css": "@keyframes fxk{to{background-position:0 4px}}.fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{background:repeating-linear-gradient(rgba(0,0,0,.28) 0 1px,transparent 1px 4px);animation:fxk .6s linear infinite}"
    },
    {
      "id": "crt",
      "zh": "CRT 弯曲",
      "en": "CRT curve",
      "dz": "屏幕四角向内弯",
      "de": "The screen bulges",
      "pz": "径向渐变压暗四角 + 轻微 border-radius 与内阴影。",
      "pe": "Darken corners with a radial gradient, add radius and inner shadow.",
      "demo": "surface",
      "css": ".fxsurface{border-radius:26px/40px;background:#12121a;box-shadow:inset 0 0 60px rgba(0,0,0,.9)}.fx{background:repeating-linear-gradient(rgba(255,255,255,.06) 0 1px,transparent 1px 3px),radial-gradient(circle at 50% 50%,#4d8ba6,#12121a 78%)}"
    },
    {
      "id": "halftone",
      "zh": "半调网点",
      "en": "Halftone",
      "dz": "像报纸印刷的网点",
      "de": "Newsprint dots",
      "pz": "径向渐变点阵 + multiply，点距决定“印刷精度”。",
      "pe": "A radial dot lattice in multiply; pitch sets the print resolution.",
      "demo": "surface",
      "params": [
        {
          "k": "s",
          "zh": "网点间距",
          "en": "Pitch",
          "min": 4,
          "max": 20,
          "step": 1,
          "def": 8,
          "unit": "px"
        }
      ],
      "css": ".fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{background-image:radial-gradient(#23232f 45%,transparent 46%);background-size:var(--s,8px) var(--s,8px);mix-blend-mode:multiply;opacity:.75}"
    },
    {
      "id": "dither",
      "zh": "抖动",
      "en": "Dither",
      "dz": "用有序噪点模拟灰阶",
      "de": "Ordered noise standing in for grey",
      "pz": "棋盘格 conic-gradient 平铺 2px，配合 contrast。",
      "pe": "A 2px conic checker tile plus contrast.",
      "demo": "surface",
      "css": ".fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:contrast(1.3)}.fx{background:conic-gradient(#000 0 25%,transparent 0 50%,#000 0 75%,transparent 0);background-size:3px 3px;mix-blend-mode:overlay;opacity:.8}"
    },
    {
      "id": "posterize",
      "zh": "色阶分离",
      "en": "Posterize",
      "dz": "颜色被压成几个台阶",
      "de": "Colour crushed into steps",
      "pz": "CSS 只能近似：高 contrast + 低饱和分层渐变。",
      "pe": "CSS approximates it: high contrast plus stepped gradients.",
      "demo": "media",
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570 0 25%,#4d8ba6 25% 50%,#e5a68f 50% 75%,#f4dcb8 75%);filter:contrast(1.4) saturate(1.2)}"
    },
    {
      "id": "bloom",
      "zh": "高光溢出",
      "en": "Bloom",
      "dz": "亮处糊出光晕",
      "de": "Highlights bleeding light",
      "pz": "复制一层做 blur + screen，只保留亮部。",
      "pe": "Duplicate, blur, screen — keep only the highlights.",
      "demo": "surface",
      "css": "@keyframes fxk{0%,100%{opacity:.6}50%{opacity:1}}.fxsurface{background:#12121a}.fx{background:radial-gradient(circle at 50% 50%,#f4dcb8 0 12%,transparent 40%);filter:blur(18px);mix-blend-mode:screen;animation:fxk 2.8s ease-in-out infinite}"
    },
    {
      "id": "vignette",
      "zh": "暗角",
      "en": "Vignette",
      "dz": "四周压暗，视线集中",
      "de": "Darkened edges pull the eye in",
      "pz": "inset box-shadow 或径向渐变，别超过 40% 透明度。",
      "pe": "An inset shadow or radial gradient — stay under 40% opacity.",
      "demo": "media",
      "params": [
        {
          "k": "v",
          "zh": "强度",
          "en": "Strength",
          "min": 0,
          "max": 0.9,
          "step": 0.05,
          "def": 0.45,
          "unit": ""
        }
      ],
      "css": ".fx{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);position:relative}.fx>b{background:radial-gradient(circle at 50% 45%,transparent 45%,rgba(0,0,0,var(--v,.45)))}"
    },
    {
      "id": "filmgrain",
      "zh": "胶片颗粒",
      "en": "Film grain",
      "dz": "细密噪点在跳",
      "de": "Fine noise dancing",
      "pz": "SVG feTurbulence 或平铺噪点图 + 轻微位移动画。",
      "pe": "feTurbulence or a tiled noise image, jittered slightly.",
      "demo": "surface",
      "css": "@keyframes fxk{0%{transform:translate(0,0)}25%{transform:translate(-2%,1%)}50%{transform:translate(1%,-2%)}75%{transform:translate(-1%,-1%)}100%{transform:translate(0,0)}}.fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{inset:-6%;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\");mix-blend-mode:overlay;animation:fxk .5s steps(1,end) infinite}"
    },
    {
      "id": "noisebg",
      "zh": "噪点底纹",
      "en": "Noise texture",
      "dz": "干净底色上一层细砂",
      "de": "Fine grit over a clean field",
      "pz": "静态噪点提升“材质感”，透明度 4–8% 足够。",
      "pe": "Static noise adds material; 4–8% opacity is plenty.",
      "demo": "surface",
      "css": ".fxsurface{background:#f4f5f1}.fx{background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.8'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\");opacity:.5}"
    },
    {
      "id": "frost",
      "zh": "磨砂玻璃",
      "en": "Frosted glass",
      "dz": "半透明磨砂片",
      "de": "A translucent frosted pane",
      "pz": "blur + 微弱噪点 + 1px 高光边，才不像塑料。",
      "pe": "Blur plus faint noise plus a 1px highlight edge — otherwise it looks plastic.",
      "demo": "surface",
      "css": ".fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{inset:20% 12%;border-radius:16px;background:rgba(255,255,255,.32);backdrop-filter:blur(14px) saturate(1.2);border:1px solid rgba(255,255,255,.6);box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}"
    },
    {
      "id": "glassrefract",
      "zh": "玻璃折射",
      "en": "Glass refraction",
      "dz": "边缘把背景挤歪",
      "de": "The rim bends what is behind it",
      "pz": "边缘用更强的 blur 与轻微放大，制造厚度。",
      "pe": "Stronger blur and slight scale at the rim fakes thickness.",
      "demo": "surface",
      "css": ".fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{inset:22% 16%;border-radius:24px;backdrop-filter:blur(3px) saturate(1.3);box-shadow:inset 0 0 0 1px rgba(255,255,255,.45),inset 8px 8px 24px rgba(255,255,255,.35),inset -8px -8px 24px rgba(0,0,0,.18)}"
    },
    {
      "id": "liquidglass",
      "zh": "流动玻璃",
      "en": "Liquid glass",
      "dz": "高光在玻璃上滑动",
      "de": "A highlight sliding across glass",
      "pz": "斜向高光条无限平移，叠在 backdrop-filter 之上。",
      "pe": "A diagonal highlight sweeping over the blurred surface.",
      "demo": "surface",
      "css": "@keyframes fxk{to{transform:translateX(160%)}}.fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{inset:22% 14%;border-radius:20px;background:rgba(255,255,255,.28);backdrop-filter:blur(10px);overflow:hidden;border:1px solid rgba(255,255,255,.5)}.fx::after{content:'';position:absolute;top:0;left:-60%;width:45%;height:100%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.75),transparent);animation:fxk 3s cubic-bezier(.22,1,.36,1) infinite}"
    },
    {
      "id": "metal",
      "zh": "金属拉丝",
      "en": "Brushed metal",
      "dz": "细纹反光面",
      "de": "Fine-brushed reflective surface",
      "pz": "细密线性渐变 + 一道高光扫过。",
      "pe": "Tight linear striping with one sweeping highlight.",
      "demo": "shape",
      "css": "@keyframes fxk{to{background-position:200% 0}}.fx{background:repeating-linear-gradient(100deg,#b9bcc4 0 2px,#d6d9df 2px 4px),linear-gradient(100deg,transparent 30%,rgba(255,255,255,.9) 50%,transparent 70%);background-size:auto,300% 100%;animation:fxk 3s linear infinite}"
    },
    {
      "id": "holo",
      "zh": "全息膜",
      "en": "Holographic foil",
      "dz": "角度一变颜色就变",
      "de": "Colour shifts with angle",
      "pz": "多彩 conic 渐变 + color-dodge，随 hover 平移。",
      "pe": "A rainbow conic gradient in color-dodge, panned on hover.",
      "demo": "card",
      "css": "@keyframes fxk{to{background-position:300% 50%}}.fx{position:relative;overflow:hidden;background:#1b1b26}.fx>b{background:linear-gradient(100deg,#ff2d95,#f4dcb8,#75c4d4,#e5a68f,#ff2d95);background-size:300% 100%;animation:fxk 4s linear infinite;mix-blend-mode:color-dodge;height:110px;border-radius:6px}"
    },
    {
      "id": "iridescent",
      "zh": "虹彩边缘",
      "en": "Iridescent edge",
      "dz": "只有边缘泛彩虹",
      "de": "Only the rim goes rainbow",
      "pz": "用 conic 渐变描边 + mask 只留 1px 环。",
      "pe": "A conic-gradient border masked down to 1px.",
      "demo": "shape",
      "css": "@keyframes fxk{to{transform:rotate(360deg)}}.fx{background:#1b1b26;position:relative;overflow:hidden}.fx::before{content:'';position:absolute;inset:-40%;background:conic-gradient(#ff2d95,#f4dcb8,#75c4d4,#e5a68f,#ff2d95);animation:fxk 4s linear infinite}.fx::after{content:'';position:absolute;inset:2px;border-radius:12px;background:#1b1b26}"
    },
    {
      "id": "thermal",
      "zh": "热成像",
      "en": "Thermal map",
      "dz": "按亮度映射成热力色",
      "de": "Brightness mapped to heat colours",
      "pz": "灰度化后叠彩色渐变，用 hue 或 color 混合。",
      "pe": "Grayscale, then blend a heat ramp with hue or color.",
      "demo": "media",
      "css": ".fx{position:relative;background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:grayscale(1) contrast(1.3)}.fx>b{background:linear-gradient(135deg,#0026ff,#00e0ff 30%,#f4dcb8 60%,#e8879c);mix-blend-mode:color}"
    },
    {
      "id": "xray",
      "zh": "X 光",
      "en": "X-ray",
      "dz": "反相加冷调",
      "de": "Inverted and cooled",
      "pz": "invert + hue-rotate + 高对比，常用于科技演示。",
      "pe": "invert plus hue-rotate plus contrast — the sci-demo look.",
      "demo": "media",
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:invert(1) hue-rotate(160deg) contrast(1.5) brightness(.9)}"
    },
    {
      "id": "edge",
      "zh": "边缘检测",
      "en": "Edge detect",
      "dz": "只留轮廓线",
      "de": "Only outlines remain",
      "pz": "SVG feConvolveMatrix 做卷积；CSS 只能近似。",
      "pe": "SVG feConvolveMatrix does it properly; CSS only approximates.",
      "demo": "media",
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:grayscale(1) contrast(6) invert(1)}"
    },
    {
      "id": "threshold",
      "zh": "二值化",
      "en": "Threshold",
      "dz": "只剩黑与白",
      "de": "Pure black and white",
      "pz": "grayscale + 极高 contrast，常用于印章、剪影。",
      "pe": "Grayscale plus extreme contrast — stamps and silhouettes.",
      "demo": "media",
      "params": [
        {
          "k": "c",
          "zh": "阈值强度",
          "en": "Threshold",
          "min": 2,
          "max": 30,
          "step": 1,
          "def": 12,
          "unit": ""
        }
      ],
      "css": ".fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);filter:grayscale(1) contrast(calc(var(--c,12)*1))}"
    },
    {
      "id": "blurshadowtext",
      "zh": "文字虚影",
      "en": "Ghosted type",
      "dz": "字后面拖一道虚影",
      "de": "A soft ghost trailing the letters",
      "pz": "同色低透明度 blur 副本，偏移 4–10px。",
      "pe": "A blurred low-opacity clone offset 4–10px.",
      "demo": "text",
      "css": ".fx{position:relative}.fx::before{content:attr(data-text);position:absolute;inset:0;filter:blur(10px);opacity:.5;color:#e8879c;transform:translate(6px,6px)}"
    },
    {
      "id": "filtertransition",
      "zh": "滤镜过渡",
      "en": "Filter transition",
      "dz": "滤镜也能平滑过渡",
      "de": "Filters transition too",
      "pz": "filter 可 transition，但要保持函数序列一致。",
      "pe": "filter transitions fine — keep the function list identical.",
      "demo": "card",
      "css": ".fx{filter:grayscale(1) brightness(1) saturate(1);transition:filter .5s cubic-bezier(.22,1,.36,1)}.fx:hover{filter:grayscale(0) brightness(1.05) saturate(1.3)}"
    },
    {
      "id": "blurmask",
      "zh": "模糊聚焦",
      "en": "Focus spotlight",
      "dz": "只有一处清晰",
      "de": "One spot stays sharp",
      "pz": "blur 层加径向 mask，中心镂空。",
      "pe": "A blurred layer with a radial hole in the mask.",
      "demo": "surface",
      "css": "@keyframes fxk{0%,100%{--x:32%}50%{--x:70%}}.fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8)}.fx{backdrop-filter:blur(10px);mask-image:radial-gradient(circle at 50% 50%,transparent 22%,#000 34%);animation:fxk 4s ease-in-out infinite}"
    },
    {
      "id": "shadowinner",
      "zh": "内阴影凹陷",
      "en": "Inset depth",
      "dz": "像被按进去一块",
      "de": "Pressed into the surface",
      "pz": "inset 阴影上深下浅，才符合顶光。",
      "pe": "Darker at the top edge — that matches overhead light.",
      "demo": "field",
      "css": ".fx{background:#f2f3f5;border-color:transparent;box-shadow:inset 0 2px 4px rgba(48,66,92,.18),inset 0 -1px 0 rgba(255,255,255,.9)}"
    },
    {
      "id": "colormatrix",
      "zh": "通道错位",
      "en": "Channel offset",
      "dz": "把红绿蓝拆开",
      "de": "RGB channels pulled apart",
      "pz": "SVG feColorMatrix 拆通道，再各自偏移。",
      "pe": "Split channels with feColorMatrix and offset each.",
      "demo": "text",
      "css": "@keyframes fxk{0%,100%{transform:translate(0)}50%{transform:translate(4px,-3px)}}.fx{position:relative;color:transparent}.fx::before,.fx::after{content:attr(data-text);position:absolute;inset:0;mix-blend-mode:screen;animation:fxk 2.4s ease-in-out infinite}.fx::before{color:#ff0055}.fx::after{color:#00ffcc;animation-direction:reverse}"
    },
    {
      "id": "blendtext",
      "zh": "文字混入图片",
      "en": "Type into image",
      "dz": "文字像印在照片上",
      "de": "Type printed onto the photo",
      "pz": "mix-blend-mode:overlay 或 soft-light，白字最稳。",
      "pe": "overlay or soft-light; white type is safest.",
      "demo": "surface",
      "css": ".fxsurface{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);display:flex;align-items:center;justify-content:center}.fxsurface::after{content:'SAVIMBO';position:absolute;font:700 54px/1 var(--fx-sans,system-ui);letter-spacing:-.03em;color:#fff;mix-blend-mode:overlay}.fx{background:transparent}"
    },
    {
      "id": "blurloading",
      "zh": "模糊占位图",
      "en": "Blur-up placeholder",
      "dz": "小图先糊着，大图到了才清",
      "de": "A tiny blurred proxy sharpens into the real image",
      "pz": "20px 缩略图放大 + blur，加载完成后交叉淡出。",
      "pe": "Upscale a 20px thumbnail with blur, then cross-fade.",
      "demo": "media",
      "css": "@keyframes fxk{0%,40%{filter:blur(16px) saturate(1.4);transform:scale(1.06)}100%{filter:none;transform:none}}.fx>b{background:linear-gradient(135deg,#2f5570,#4d8ba6 38%,#e5a68f 72%,#f4dcb8);animation:fxk 2.6s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "filter-chip",
      "zh": "筛选芯片",
      "en": "Filter chip",
      "dz": "筛选芯片显示字段和值，并提供单独清除。",
      "de": "Show field and value with individual clear.",
      "pz": "筛选芯片显示字段和值，并提供单独清除。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Show field and value with individual clear. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-builder",
      "zh": "筛选构建器",
      "en": "Filter builder",
      "dz": "筛选构建器支持条件、分组和括号优先级。",
      "de": "Support conditions, groups, and explicit precedence.",
      "pz": "筛选构建器支持条件、分组和括号优先级。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Support conditions, groups, and explicit precedence. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-operator",
      "zh": "筛选运算符",
      "en": "Filter operator",
      "dz": "等于、包含、范围和为空等运算符按字段类型提供。",
      "de": "Offer operators appropriate to field type.",
      "pz": "等于、包含、范围和为空等运算符按字段类型提供。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Offer operators appropriate to field type. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-saved-view",
      "zh": "保存视图",
      "en": "Saved view",
      "dz": "保存视图记录筛选、排序、列和权限范围。",
      "de": "Save filters, sort, columns, and permission scope.",
      "pz": "保存视图记录筛选、排序、列和权限范围。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Save filters, sort, columns, and permission scope. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-share",
      "zh": "分享筛选",
      "en": "Share filter",
      "dz": "分享筛选说明数据范围和是否包含私人条件。",
      "de": "State data scope and private conditions in shared filters.",
      "pz": "分享筛选说明数据范围和是否包含私人条件。 在大数据量、移动端和中英文切换下复核。",
      "pe": "State data scope and private conditions in shared filters. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-url",
      "zh": "URL 筛选",
      "en": "URL filter",
      "dz": "筛选状态编码到 URL，刷新和复制后可重现。",
      "de": "Encode filters in the URL for reproducibility.",
      "pz": "筛选状态编码到 URL，刷新和复制后可重现。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Encode filters in the URL for reproducibility. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-reset",
      "zh": "重置筛选",
      "en": "Reset filters",
      "dz": "重置只清理筛选，不误删搜索、收藏或编辑内容。",
      "de": "Reset filters without clearing search, favorites, or edits.",
      "pz": "重置只清理筛选，不误删搜索、收藏或编辑内容。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Reset filters without clearing search, favorites, or edits. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-count",
      "zh": "筛选计数",
      "en": "Filter count",
      "dz": "计数区分全部、已应用和命中结果。",
      "de": "Distinguish total, applied, and matched counts.",
      "pz": "计数区分全部、已应用和命中结果。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Distinguish total, applied, and matched counts. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-empty",
      "zh": "筛选空结果",
      "en": "Filtered empty",
      "dz": "空结果说明哪个条件排除了结果，并提供放宽入口。",
      "de": "Explain which condition excludes results and offer broaden.",
      "pz": "空结果说明哪个条件排除了结果，并提供放宽入口。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Explain which condition excludes results and offer broaden. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-loading",
      "zh": "筛选加载",
      "en": "Filter loading",
      "dz": "筛选更新保留当前结果，完成后平滑替换。",
      "de": "Keep current results while filters update.",
      "pz": "筛选更新保留当前结果，完成后平滑替换。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Keep current results while filters update. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-error",
      "zh": "筛选错误",
      "en": "Filter error",
      "dz": "筛选失败保留旧结果并显示重试，不显示为空。",
      "de": "Keep old results and retry on filter failure.",
      "pz": "筛选失败保留旧结果并显示重试，不显示为空。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Keep old results and retry on filter failure. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-debounce",
      "zh": "筛选防抖",
      "en": "Filter debounce",
      "dz": "输入型筛选防抖，但选择型筛选即时反馈。",
      "de": "Debounce text while applying discrete choices immediately.",
      "pz": "输入型筛选防抖，但选择型筛选即时反馈。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Debounce text while applying discrete choices immediately. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-dependent",
      "zh": "依赖筛选",
      "en": "Dependent filter",
      "dz": "上游条件变化时清理无效下游值并说明原因。",
      "de": "Clear invalid dependent values and explain why.",
      "pz": "上游条件变化时清理无效下游值并说明原因。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Clear invalid dependent values and explain why. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-multi-select",
      "zh": "多选筛选",
      "en": "Multi-select filter",
      "dz": "多选筛选显示已选数量和清除全部。",
      "de": "Show selected count and clear all.",
      "pz": "多选筛选显示已选数量和清除全部。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Show selected count and clear all. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-range",
      "zh": "范围筛选",
      "en": "Range filter",
      "dz": "范围筛选支持最小、最大和开放边界。",
      "de": "Support min, max, and open bounds.",
      "pz": "范围筛选支持最小、最大和开放边界。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Support min, max, and open bounds. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-date",
      "zh": "日期筛选",
      "en": "Date filter",
      "dz": "日期筛选明确时区、包含端点和自然语言范围。",
      "de": "State timezone, inclusivity, and natural ranges.",
      "pz": "日期筛选明确时区、包含端点和自然语言范围。 在大数据量、移动端和中英文切换下复核。",
      "pe": "State timezone, inclusivity, and natural ranges. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-search",
      "zh": "筛选搜索",
      "en": "Filter search",
      "dz": "大量选项可搜索，搜索不改变已选集合。",
      "de": "Search large options without changing selections.",
      "pz": "大量选项可搜索，搜索不改变已选集合。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Search large options without changing selections. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-group",
      "zh": "筛选分组",
      "en": "Filter group",
      "dz": "分组筛选显示组名、组内计数和折叠状态。",
      "de": "Show group, count, and collapse state.",
      "pz": "分组筛选显示组名、组内计数和折叠状态。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Show group, count, and collapse state. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-mobile",
      "zh": "移动筛选",
      "en": "Mobile filter",
      "dz": "移动端筛选使用底部面板，应用和取消路径明确。",
      "de": "Use a bottom sheet with clear apply and cancel.",
      "pz": "移动端筛选使用底部面板，应用和取消路径明确。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Use a bottom sheet with clear apply and cancel. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-keyboard",
      "zh": "筛选键盘",
      "en": "Filter keyboard",
      "dz": "筛选控件支持 Tab、方向键、Escape 和清除。",
      "de": "Support Tab, arrows, Escape, and clear.",
      "pz": "筛选控件支持 Tab、方向键、Escape 和清除。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Support Tab, arrows, Escape, and clear. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "sort-direction",
      "zh": "排序方向",
      "en": "Sort direction",
      "dz": "排序方向和当前字段始终可见。",
      "de": "Keep direction and field visible.",
      "pz": "排序方向和当前字段始终可见。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Keep direction and field visible. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "sort-multi",
      "zh": "多列排序",
      "en": "Multi-column sort",
      "dz": "多列排序显示优先级并可单独移除。",
      "de": "Show priority and individual removal.",
      "pz": "多列排序显示优先级并可单独移除。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Show priority and individual removal. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "sort-stable",
      "zh": "稳定排序",
      "en": "Stable sort",
      "dz": "并列值按稳定次序保持，不因刷新随机跳动。",
      "de": "Keep ties stable across refresh.",
      "pz": "并列值按稳定次序保持，不因刷新随机跳动。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Keep ties stable across refresh. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "sort-locale",
      "zh": "语言排序",
      "en": "Locale sort",
      "dz": "中文、英文和数字按对应语言规则排序。",
      "de": "Sort CJK, Latin, and numbers by locale rules.",
      "pz": "中文、英文和数字按对应语言规则排序。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Sort CJK, Latin, and numbers by locale rules. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "sort-null",
      "zh": "空值排序",
      "en": "Null sorting",
      "dz": "空值位置明确并可配置在前或后。",
      "de": "Define null placement explicitly.",
      "pz": "空值位置明确并可配置在前或后。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Define null placement explicitly. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "sort-toggle",
      "zh": "排序切换",
      "en": "Sort toggle",
      "dz": "点击字段循环升序、降序和未排序状态。",
      "de": "Cycle ascending, descending, and unsorted states.",
      "pz": "点击字段循环升序、降序和未排序状态。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Cycle ascending, descending, and unsorted states. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "sort-performance",
      "zh": "排序性能",
      "en": "Sort performance",
      "dz": "大数据量排序在 worker 或服务端执行，不阻塞输入。",
      "de": "Sort large data off the main thread or server-side.",
      "pz": "大数据量排序在 worker 或服务端执行，不阻塞输入。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Sort large data off the main thread or server-side. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-locale",
      "zh": "筛选语言",
      "en": "Filter locale",
      "dz": "筛选标签、运算符、错误和 prompt 完全跟随语言。",
      "de": "Filter labels, operators, errors, and prompts follow locale.",
      "pz": "筛选标签、运算符、错误和 prompt 完全跟随语言。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Filter labels, operators, errors, and prompts follow locale. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-theme",
      "zh": "筛选主题",
      "en": "Filter theme",
      "dz": "筛选和排序状态在暗色、高对比主题下仍可辨。",
      "de": "Keep filter and sort states visible in dark and high contrast.",
      "pz": "筛选和排序状态在暗色、高对比主题下仍可辨。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Keep filter and sort states visible in dark and high contrast. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    },
    {
      "id": "filter-audit",
      "zh": "筛选审查",
      "en": "Filter audit",
      "dz": "发布前检查复杂条件、URL、权限、性能、语言和错误恢复。",
      "de": "Audit conditions, URL, permissions, performance, locale, and recovery.",
      "pz": "发布前检查复杂条件、URL、权限、性能、语言和错误恢复。 在大数据量、移动端和中英文切换下复核。",
      "pe": "Audit conditions, URL, permissions, performance, locale, and recovery. Validate scale, mobile, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f8f6f2;color:#2f2b24;border:1px solid #d7cfc2;border-radius:10px;box-shadow:0 5px 16px #433a2a14}"
    }
  ]
};
