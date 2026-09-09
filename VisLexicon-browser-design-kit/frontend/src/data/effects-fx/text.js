// Curated foundational patterns
export default {
  "id": "text",
  "zh": "文字效果",
  "en": "Text effects",
  "dz": "排版、着色与文字动效",
  "de": "Type, color & text motion",
  "items": [
    {
      "id": "grad",
      "zh": "渐变文字",
      "en": "Gradient text",
      "dz": "字体本身填充彩色渐变",
      "de": "Letters filled with a color gradient",
      "pz": "用 background-image 渐变 + background-clip:text + 透明文字色实现。",
      "pe": "Use a gradient background-image with background-clip:text and transparent text color.",
      "demo": "text",
      "params": [
        {
          "k": "a",
          "zh": "角度",
          "en": "Angle",
          "min": 0,
          "max": 360,
          "step": 1,
          "def": 100,
          "unit": "deg"
        }
      ],
      "css": ".fx{background:linear-gradient(var(--a,100deg),#2b7fd4,#7b3ff2 48%,#db3055);-webkit-background-clip:text;background-clip:text;color:transparent}"
    },
    {
      "id": "gradanim",
      "zh": "流动渐变文字",
      "en": "Animated gradient text",
      "dz": "渐变在字里缓缓流动",
      "de": "The gradient drifts across the letters",
      "pz": "把渐变做成 300% 宽，动画 background-position 循环平移。",
      "pe": "Make the gradient 300% wide and animate background-position in a loop.",
      "demo": "text",
      "params": [
        {
          "k": "t",
          "zh": "周期",
          "en": "Cycle",
          "min": 1,
          "max": 12,
          "step": 0.5,
          "def": 5,
          "unit": "s"
        }
      ],
      "css": "@keyframes fxflow{to{background-position:300% 50%}}.fx{background:linear-gradient(90deg,#db3055,#f4dcb8,#7ab85a,#75c4d4,#db3055);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxflow var(--t,5s) linear infinite}"
    },
    {
      "id": "stroke",
      "zh": "空心描边字",
      "en": "Outlined text",
      "dz": "只有轮廓、内部镂空",
      "de": "Only the outline, hollow inside",
      "pz": "用 -webkit-text-stroke 描边，color 设为 transparent。",
      "pe": "Use -webkit-text-stroke with a transparent fill color.",
      "demo": "text",
      "params": [
        {
          "k": "w",
          "zh": "描边粗细",
          "en": "Stroke",
          "min": 0.5,
          "max": 6,
          "step": 0.5,
          "def": 2,
          "unit": "px"
        }
      ],
      "css": ".fx{color:transparent;-webkit-text-stroke:var(--w,2px) #23232f}"
    },
    {
      "id": "dblstroke",
      "zh": "双层描边",
      "en": "Double stroke",
      "dz": "实心字外再套一圈轮廓",
      "de": "A solid word wrapped in a second outline",
      "pz": "文字实色，外层用 text-shadow 多方向堆叠或伪元素描边。",
      "pe": "Solid fill plus an offset outline built from a pseudo-element or layered text-shadow.",
      "demo": "text",
      "css": ".fx{color:#fff;-webkit-text-stroke:2px #23232f;text-shadow:0 0 0 #23232f,6px 6px 0 #e5a68f}"
    },
    {
      "id": "shadow",
      "zh": "柔和投影字",
      "en": "Drop shadow text",
      "dz": "文字轻轻浮起一层",
      "de": "Text lifted by a soft shadow",
      "pz": "用一到两层低透明度、大模糊的 text-shadow。",
      "pe": "One or two low-opacity, large-blur text-shadows.",
      "demo": "text",
      "params": [
        {
          "k": "b",
          "zh": "模糊",
          "en": "Blur",
          "min": 0,
          "max": 40,
          "step": 1,
          "def": 18,
          "unit": "px"
        }
      ],
      "css": ".fx{text-shadow:0 10px var(--b,18px) rgba(48,66,92,.35)}"
    },
    {
      "id": "hardshadow",
      "zh": "硬边偏移影",
      "en": "Hard offset shadow",
      "dz": "像贴纸一样的实心错位影",
      "de": "A crisp, sticker-like offset shadow",
      "pz": "text-shadow 不带模糊，只给 x/y 偏移和实色。",
      "pe": "text-shadow with zero blur — pure offset and a solid color.",
      "demo": "text",
      "params": [
        {
          "k": "o",
          "zh": "偏移",
          "en": "Offset",
          "min": 0,
          "max": 24,
          "step": 1,
          "def": 8,
          "unit": "px"
        }
      ],
      "css": ".fx{text-shadow:var(--o,8px) var(--o,8px) 0 #db3055}"
    },
    {
      "id": "longshadow",
      "zh": "长投影",
      "en": "Long shadow",
      "dz": "影子拉出一条长长的斜线",
      "de": "The shadow stretches into a long diagonal",
      "pz": "叠加几十层每层递增 1px 的 text-shadow，形成连续长影。",
      "pe": "Stack dozens of 1px-stepped text-shadows to form a continuous ramp.",
      "demo": "text",
      "css": ".fx{color:#23232f;text-shadow:1px 1px 0 #d9d9d9,2px 2px 0 #d7d7d7,3px 3px 0 #d5d5d5,4px 4px 0 #d3d3d3,5px 5px 0 #d1d1d1,6px 6px 0 #cfcfcf,7px 7px 0 #cdcdcd,8px 8px 0 #cbcbcb,9px 9px 0 #c9c9c9,10px 10px 0 #c7c7c7,11px 11px 0 #c5c5c5,12px 12px 0 #c3c3c3,14px 14px 0 #c1c1c1,16px 16px 0 #bfbfbf,18px 18px 0 #bdbdbd,20px 20px 0 #bbb,24px 24px 0 #b9b9b9,28px 28px 0 #b7b7b7}"
    },
    {
      "id": "extrude",
      "zh": "3D 立体字",
      "en": "3D extruded text",
      "dz": "字有厚度，像立起来",
      "de": "Letters with real thickness",
      "pz": "多层实色 text-shadow 沿同一方向递增，末层加暗投影。",
      "pe": "Many solid text-shadows stepping in one direction, ending with a dark cast shadow.",
      "demo": "text",
      "css": ".fx{color:#e5a68f;text-shadow:1px 1px 0 #6f8203,2px 2px 0 #6f8203,3px 3px 0 #647403,4px 4px 0 #5a6903,5px 5px 0 #4f5c02,6px 6px 0 #445002,7px 7px 0 #3a4402,8px 8px 0 #2f3701,10px 12px 18px rgba(48,66,92,.3)}"
    },
    {
      "id": "neon",
      "zh": "霓虹发光字",
      "en": "Neon glow text",
      "dz": "像霓虹灯管一样发亮",
      "de": "Glows like a neon tube",
      "pz": "多层同色 text-shadow 由小到大叠加出光晕，深色背景更明显。",
      "pe": "Stack same-hue text-shadows from tight to wide; works best on a dark surface.",
      "demo": "text",
      "params": [
        {
          "k": "g",
          "zh": "光晕",
          "en": "Glow",
          "min": 0,
          "max": 3,
          "step": 0.1,
          "def": 1,
          "unit": ""
        }
      ],
      "css": ".fxstage{background:#141420;border-radius:16px}.fx{color:#fff;text-shadow:0 0 calc(6px*var(--g,1)) #fff,0 0 calc(14px*var(--g,1)) #db3055,0 0 calc(40px*var(--g,1)) #db3055,0 0 calc(80px*var(--g,1)) #db3055}"
    },
    {
      "id": "emboss",
      "zh": "压印浮雕字",
      "en": "Letterpress",
      "dz": "像压进纸里一样",
      "de": "Pressed into the paper",
      "pz": "同色系背景上，一层浅色下偏移 + 一层深色上偏移的 text-shadow。",
      "pe": "On a tonal background, one light shadow below and one dark above.",
      "demo": "text",
      "css": ".fxstage{background:#e9eaee;border-radius:16px}.fx{color:#c9cbd2;text-shadow:0 1px 0 #fff,0 -1px 1px rgba(48,66,92,.45)}"
    },
    {
      "id": "glitch",
      "zh": "RGB 错位故障",
      "en": "RGB glitch",
      "dz": "红蓝分离的抖动故障感",
      "de": "Red/blue split with a nervous jitter",
      "pz": "用两个伪元素副本分别染红/青并做微小随机位移动画。",
      "pe": "Two pseudo-element copies tinted red/cyan, each jittering by a few pixels.",
      "demo": "text",
      "params": [
        {
          "k": "d",
          "zh": "错位",
          "en": "Split",
          "min": 0,
          "max": 12,
          "step": 1,
          "def": 4,
          "unit": "px"
        }
      ],
      "css": "@keyframes fxg1{0%,100%{transform:translate(0)}20%{transform:translate(calc(var(--d,4px)*-1),1px)}40%{transform:translate(var(--d,4px),-1px)}60%{transform:translate(-2px,0)}}.fx{position:relative;color:#23232f}.fx::before,.fx::after{content:attr(data-text);position:absolute;inset:0;mix-blend-mode:multiply}.fx::before{color:#ff2d55;animation:fxg1 .9s steps(2,end) infinite}.fx::after{color:#00c2ff;animation:fxg1 .9s steps(2,end) infinite reverse}"
    },
    {
      "id": "typewriter",
      "zh": "打字机",
      "en": "Typewriter",
      "dz": "一个字一个字敲出来，光标闪烁",
      "de": "Typed out character by character with a blinking caret",
      "pz": "固定宽度容器 + steps() 动画改变 width，右侧加闪烁边框当光标。",
      "pe": "Animate width in steps() over a clipped container, with a blinking right border as caret.",
      "demo": "text",
      "params": [
        {
          "k": "t",
          "zh": "时长",
          "en": "Duration",
          "min": 0.5,
          "max": 6,
          "step": 0.1,
          "def": 2,
          "unit": "s"
        }
      ],
      "css": "@keyframes fxtype{from{width:0}to{width:100%}}@keyframes fxcaret{50%{border-color:transparent}}.fx{width:max-content;overflow:hidden;border-right:4px solid #db3055;animation:fxtype var(--t,2s) steps(6,end) forwards,fxcaret .7s step-end infinite}"
    },
    {
      "id": "maskreveal",
      "zh": "遮罩上推显字",
      "en": "Mask reveal",
      "dz": "文字从下方推上来露出",
      "de": "Text slides up out of a clipping mask",
      "pz": "外层 overflow:hidden，内层 translateY(100%) → 0。",
      "pe": "Wrapper with overflow:hidden; inner text animates translateY(100%) → 0.",
      "demo": "text",
      "mode": "one",
      "params": [
        {
          "k": "t",
          "zh": "时长",
          "en": "Duration",
          "min": 0.2,
          "max": 2.5,
          "step": 0.1,
          "def": 0.9,
          "unit": "s"
        }
      ],
      "css": "@keyframes fxup{from{transform:translateY(110%)}to{transform:translateY(0)}}.fx{overflow:hidden;padding-bottom:.12em}.fx span{display:inline-block;animation:fxup var(--t,.9s) cubic-bezier(.22,1,.36,1) both}"
    },
    {
      "id": "letterfade",
      "zh": "逐字浮现",
      "en": "Letter stagger fade",
      "dz": "一个字母一个字母依次淡入上浮",
      "de": "Letters fade and rise one after another",
      "pz": "拆分字符，每个字符按 index 加 delay 做 opacity + translateY。",
      "pe": "Split into characters and stagger opacity + translateY by index.",
      "demo": "text",
      "params": [
        {
          "k": "s",
          "zh": "间隔",
          "en": "Stagger",
          "min": 10,
          "max": 200,
          "step": 5,
          "def": 60,
          "unit": "ms"
        }
      ],
      "css": "@keyframes fxlf{from{opacity:0;transform:translateY(.4em)}to{opacity:1;transform:none}}.fx span{display:inline-block;animation:fxlf .6s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--i)*var(--s,60ms))}"
    },
    {
      "id": "letterblur",
      "zh": "逐字失焦入场",
      "en": "Letter blur-in",
      "dz": "字母从模糊里聚焦出来",
      "de": "Letters resolve out of a blur",
      "pz": "逐字动画 filter:blur(12px)→0，配合轻微放大。",
      "pe": "Per-letter filter:blur(12px)→0 with a slight scale-down.",
      "demo": "text",
      "css": "@keyframes fxlb{from{opacity:0;filter:blur(14px);transform:scale(1.15)}to{opacity:1;filter:blur(0);transform:none}}.fx span{display:inline-block;animation:fxlb .8s ease-out both;animation-delay:calc(var(--i)*70ms)}"
    },
    {
      "id": "wave",
      "zh": "波浪浮动",
      "en": "Wave float",
      "dz": "字母像水面一样上下起伏",
      "de": "Letters bob like water",
      "pz": "逐字 translateY 正弦循环，delay 按 index 递增。",
      "pe": "Per-letter looping translateY, delay stepped by index.",
      "demo": "text",
      "css": "@keyframes fxwv{0%,100%{transform:translateY(0)}50%{transform:translateY(-.18em)}}.fx span{display:inline-block;animation:fxwv 1.6s ease-in-out infinite;animation-delay:calc(var(--i)*90ms)}"
    },
    {
      "id": "shine",
      "zh": "扫光高亮",
      "en": "Shine sweep",
      "dz": "一道高光从字上扫过",
      "de": "A highlight sweeps across the word",
      "pz": "在文字渐变里放一段白色亮带，循环平移 background-position。",
      "pe": "Put a white band inside the text gradient and loop background-position.",
      "demo": "text",
      "css": "@keyframes fxsh{to{background-position:-200% 0}}.fx{background:linear-gradient(100deg,#23232f 40%,#fff 50%,#23232f 60%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxsh 2.4s linear infinite}"
    },
    {
      "id": "marker",
      "zh": "马克笔高亮",
      "en": "Marker highlight",
      "dz": "像荧光笔从左划过",
      "de": "A highlighter stroke swipes left to right",
      "pz": "背景色带只覆盖文字下半部，动画 background-size 从 0 到 100%。",
      "pe": "A band covering the lower half of the line, animating background-size 0 → 100%.",
      "demo": "text",
      "css": "@keyframes fxmk{to{background-size:100% 42%}}.fx{background:linear-gradient(#f0c9a8,#f0c9a8) no-repeat 0 88%;background-size:0 42%;animation:fxmk .9s cubic-bezier(.22,1,.36,1) .2s forwards}"
    },
    {
      "id": "underline",
      "zh": "下划线生长",
      "en": "Underline grow",
      "dz": "悬停时下划线从左往右长出来",
      "de": "On hover the underline grows from the left",
      "pz": "伪元素 scaleX(0)→1，transform-origin 左侧。",
      "pe": "Pseudo-element scaleX(0)→1 with transform-origin left.",
      "demo": "text",
      "css": ".fx{position:relative;cursor:pointer}.fx::after{content:'';position:absolute;left:0;right:0;bottom:-.06em;height:.06em;background:#db3055;transform:scaleX(0);transform-origin:left;transition:transform .3s cubic-bezier(.22,1,.36,1)}.fx:hover::after{transform:scaleX(1)}"
    },
    {
      "id": "fillhover",
      "zh": "描边转实心",
      "en": "Outline to fill",
      "dz": "悬停时空心字被填满",
      "de": "Hover floods the hollow letters",
      "pz": "基础态 text-stroke + 透明填充，hover 时切换 color 并过渡。",
      "pe": "Base state uses text-stroke with transparent fill; hover transitions the color in.",
      "demo": "text",
      "css": ".fx{color:transparent;-webkit-text-stroke:2px #23232f;transition:color .35s cubic-bezier(.22,1,.36,1);cursor:pointer}.fx:hover{color:#db3055;-webkit-text-stroke-color:#db3055}"
    },
    {
      "id": "blend",
      "zh": "混合模式反色",
      "en": "Blend difference",
      "dz": "文字与背景相撞产生反色",
      "de": "Text inverts against whatever is behind it",
      "pz": "mix-blend-mode:difference，文字白色压在彩色块上。",
      "pe": "mix-blend-mode:difference on white text over a colored block.",
      "demo": "text",
      "css": ".fxstage{background:linear-gradient(90deg,#db3055 50%,#fff 50%);border-radius:16px}.fx{color:#fff;mix-blend-mode:difference}"
    },
    {
      "id": "clipimg",
      "zh": "图片填充字",
      "en": "Image-filled text",
      "dz": "字里是一张图/一片纹理",
      "de": "The letters are a window onto a texture",
      "pz": "把图片作为 background 并 background-clip:text。",
      "pe": "Set the image as background and clip it to the text.",
      "demo": "text",
      "css": ".fx{background:conic-gradient(from .2turn,#4d8ba6,#e5a68f,#f4dcb8,#75c4d4,#4d8ba6);-webkit-background-clip:text;background-clip:text;color:transparent}"
    },
    {
      "id": "tracking",
      "zh": "字距收拢入场",
      "en": "Tracking in",
      "dz": "字距由散到紧地收拢",
      "de": "Letter-spacing tightens as it lands",
      "pz": "动画 letter-spacing 从 .4em 到正常，配合 opacity。",
      "pe": "Animate letter-spacing from .4em to normal along with opacity.",
      "demo": "text",
      "css": "@keyframes fxtr{from{letter-spacing:.5em;opacity:0;filter:blur(4px)}to{letter-spacing:-.03em;opacity:1;filter:none}}.fx{animation:fxtr .9s cubic-bezier(.22,1,.36,1) both}"
    },
    {
      "id": "wordswap",
      "zh": "词条轮换",
      "en": "Rotating words",
      "dz": "一个词位上不断换词",
      "de": "One slot cycles through words",
      "pz": "固定容器高度，词组做 translateY 步进循环。",
      "pe": "Fixed-height slot, list of words stepping through translateY.",
      "demo": "text",
      "mode": "words",
      "words": [
        "Forest",
        "Rivers",
        "Canopy",
        "Forest"
      ],
      "css": "@keyframes fxrw{0%,26%{transform:translateY(0)}33%,59%{transform:translateY(-1.05em)}66%,92%{transform:translateY(-2.1em)}100%{transform:translateY(-3.15em)}}.fx{height:1.05em;overflow:hidden}.fx span{display:block;animation:fxrw 5s cubic-bezier(.76,0,.24,1) infinite}"
    },
    {
      "id": "shake",
      "zh": "抖动强调",
      "en": "Shake",
      "dz": "短促地抖一下，用于报错",
      "de": "A short nervous shake — good for errors",
      "pz": "短时长 translateX 往复关键帧，2~3 个来回后停止。",
      "pe": "Short translateX keyframes, two or three passes then stop.",
      "demo": "text",
      "css": "@keyframes fxsk{10%,90%{transform:translateX(-6px)}30%,70%{transform:translateX(8px)}50%{transform:translateX(-8px)}}.fx{color:#db3055;animation:fxsk .5s both}"
    },
    {
      "id": "counter",
      "zh": "数字滚动",
      "en": "Number roll",
      "dz": "数字像里程表一样滚上去",
      "de": "Digits roll like an odometer",
      "pz": "每位数字一列 0-9，用 translateY 定位到目标数字。",
      "pe": "One 0-9 column per digit, translateY into position.",
      "demo": "text",
      "mode": "one",
      "txt": "2,461",
      "css": "@keyframes fxnr{from{transform:translateY(.6em);opacity:0;filter:blur(6px)}to{transform:none;opacity:1;filter:none}}.fx{font-variant-numeric:tabular-nums;animation:fxnr .7s cubic-bezier(.22,1,.36,1) both}"
    },
    {
      "id": "cropreveal",
      "zh": "上下切割显字",
      "en": "Split crop reveal",
      "dz": "上下两半错开合拢成字",
      "de": "Two halves slide together into one word",
      "pz": "同一段文字两层，各裁一半，分别从左右滑入对齐。",
      "pe": "Two clipped copies of the same text sliding in from opposite sides.",
      "demo": "text",
      "css": "@keyframes fxc1{from{transform:translateX(-40px);opacity:0}to{transform:none;opacity:1}}@keyframes fxc2{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}.fx{position:relative}.fx::before,.fx::after{content:attr(data-text);position:absolute;left:0;top:0;overflow:hidden}.fx::before{clip-path:inset(0 0 50% 0);animation:fxc1 .7s cubic-bezier(.22,1,.36,1) both}.fx::after{clip-path:inset(50% 0 0 0);animation:fxc2 .7s cubic-bezier(.22,1,.36,1) both}.fx{color:transparent}"
    },
    {
      "id": "redact",
      "zh": "涂黑揭示",
      "en": "Redacted reveal",
      "dz": "先是涂黑块，再擦开露出字",
      "de": "A black bar wipes away to expose the word",
      "pz": "覆盖层色块用 transform-origin:right 的 scaleX 收起。",
      "pe": "A covering bar collapses with scaleX and transform-origin right.",
      "demo": "text",
      "css": "@keyframes fxrd{0%,45%{transform:scaleX(1)}100%{transform:scaleX(0)}}.fx{position:relative}.fx::after{content:'';position:absolute;inset:-.06em -.1em;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);transform-origin:right;animation:fxrd 1.1s cubic-bezier(.76,0,.24,1) both}"
    },
    {
      "id": "vargrade",
      "zh": "可变字重悬停",
      "en": "Variable weight hover",
      "dz": "悬停时字变粗变宽",
      "de": "Hover thickens and widens the letters",
      "pz": "用可变字体的 font-variation-settings 做 wght 过渡。",
      "pe": "Transition font-variation-settings wght on a variable font.",
      "demo": "text",
      "css": ".fx{font-weight:400;transition:font-weight .3s cubic-bezier(.22,1,.36,1),letter-spacing .3s;cursor:pointer}.fx:hover{font-weight:900;letter-spacing:0}"
    },
    {
      "id": "scalein",
      "zh": "重压入场",
      "en": "Heavy scale-in",
      "dz": "字从大到小“砸”定位",
      "de": "The word slams down into place",
      "pz": "scale(1.6)→1 配合 opacity 与短促的 out-quint 缓动。",
      "pe": "scale(1.6)→1 with opacity and a snappy out-quint ease.",
      "demo": "text",
      "css": "@keyframes fxsi{from{transform:scale(1.8);opacity:0;filter:blur(8px)}to{transform:none;opacity:1;filter:none}}.fx{animation:fxsi .55s cubic-bezier(.22,1,.36,1) both}"
    },
    {
      "id": "marquee",
      "zh": "跑马灯",
      "en": "Marquee",
      "dz": "横幅文字无缝循环滚动",
      "de": "Text scrolls endlessly like a ticker",
      "pz": "内容复制两份，容器 translateX 到 -50% 无缝循环。",
      "pe": "Duplicate the content and loop translateX to -50%.",
      "demo": "text",
      "mode": "words",
      "words": [
        "Aurora · Aurora · Aurora · ",
        "Aurora · Aurora · Aurora · "
      ],
      "params": [
        {
          "k": "t",
          "zh": "速度",
          "en": "Speed",
          "min": 2,
          "max": 20,
          "step": 0.5,
          "def": 8,
          "unit": "s"
        }
      ],
      "css": "@keyframes fxmq{to{transform:translateX(-50%)}}.fx{width:100%;overflow:hidden;text-align:left}.fx span{display:inline-block;padding-right:.4em;animation:fxmq var(--t,8s) linear infinite}"
    },
    {
      "id": "gradborder",
      "zh": "文字下渐变分割",
      "en": "Gradient rule under text",
      "dz": "标题下一道渐隐的细线",
      "de": "A fading hairline under the heading",
      "pz": "伪元素用 linear-gradient 从实色渐隐到透明。",
      "pe": "Pseudo-element with a linear-gradient fading to transparent.",
      "demo": "text",
      "css": ".fx{padding-bottom:.14em;border-bottom:0;position:relative}.fx::after{content:'';position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,#db3055,rgba(219,48,85,0))}"
    },
    {
      "id": "line-clamp",
      "zh": "行数截断",
      "en": "Line clamp",
      "dz": "截断显示行数并提供完整内容入口，不隐藏关键信息。",
      "de": "Clamp lines with a full-content path.",
      "pz": "截断显示行数并提供完整内容入口，不隐藏关键信息。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Clamp lines with a full-content path. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "text-overflow",
      "zh": "文本溢出",
      "en": "Text overflow",
      "dz": "省略号只用于可恢复的视觉截断，tooltip 不是唯一回退。",
      "de": "Use ellipsis only for recoverable truncation.",
      "pz": "省略号只用于可恢复的视觉截断，tooltip 不是唯一回退。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Use ellipsis only for recoverable truncation. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "wrap-balance",
      "zh": "标题平衡",
      "en": "Text wrap balance",
      "dz": "标题平衡行长但不为装饰牺牲阅读顺序。",
      "de": "Balance headings without sacrificing reading order.",
      "pz": "标题平衡行长但不为装饰牺牲阅读顺序。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Balance headings without sacrificing reading order. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "pretty-wrap",
      "zh": "孤行控制",
      "en": "Pretty wrapping",
      "dz": "短文案避免孤行和悬挂标点，长文仍保持自然流动。",
      "de": "Avoid orphans in short copy while keeping long text natural.",
      "pz": "短文案避免孤行和悬挂标点，长文仍保持自然流动。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Avoid orphans in short copy while keeping long text natural. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "hyphenation",
      "zh": "断词",
      "en": "Hyphenation",
      "dz": "断词遵循语言规则，中文不使用英语连字符逻辑。",
      "de": "Follow language hyphenation rules and do not apply English logic to CJK.",
      "pz": "断词遵循语言规则，中文不使用英语连字符逻辑。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Follow language hyphenation rules and do not apply English logic to CJK. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "word-break",
      "zh": "断行策略",
      "en": "Word break",
      "dz": "长 URL、代码和中文分别使用合适断行策略。",
      "de": "Use suitable breaks for URLs, code, and CJK.",
      "pz": "长 URL、代码和中文分别使用合适断行策略。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Use suitable breaks for URLs, code, and CJK. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "white-space",
      "zh": "空白策略",
      "en": "Whitespace handling",
      "dz": "代码和普通文字分别保留或折叠空白。",
      "de": "Preserve or collapse whitespace by content type.",
      "pz": "代码和普通文字分别保留或折叠空白。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Preserve or collapse whitespace by content type. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "variable-font",
      "zh": "可变字体",
      "en": "Variable font",
      "dz": "可变字体轴按用途调整，设置回退字体和性能边界。",
      "de": "Tune variable axes with fallback and performance bounds.",
      "pz": "可变字体轴按用途调整，设置回退字体和性能边界。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Tune variable axes with fallback and performance bounds. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "font-optical-size",
      "zh": "光学字号",
      "en": "Optical sizing",
      "dz": "光学字号让小号和大号文字保持清晰结构。",
      "de": "Optical sizing keeps small and large text structured.",
      "pz": "光学字号让小号和大号文字保持清晰结构。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Optical sizing keeps small and large text structured. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "font-weight",
      "zh": "字重系统",
      "en": "Font weight system",
      "dz": "字重令牌不依赖不存在的中间字重，回退时仍保留层级。",
      "de": "Use available weight tokens and preserve hierarchy in fallback.",
      "pz": "字重令牌不依赖不存在的中间字重，回退时仍保留层级。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Use available weight tokens and preserve hierarchy in fallback. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "font-stretch",
      "zh": "字体宽度",
      "en": "Font stretch",
      "dz": "字体宽度变化不让按钮和表格列意外溢出。",
      "de": "Stretch changes do not overflow controls or columns.",
      "pz": "字体宽度变化不让按钮和表格列意外溢出。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Stretch changes do not overflow controls or columns. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "font-feature",
      "zh": "OpenType 特性",
      "en": "OpenType features",
      "dz": "数字、连字和标点特性按语言和内容选择。",
      "de": "Choose numeral, ligature, and punctuation features by language.",
      "pz": "数字、连字和标点特性按语言和内容选择。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Choose numeral, ligature, and punctuation features by language. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "tabular-numeral",
      "zh": "等宽数字",
      "en": "Tabular numerals",
      "dz": "账单、表格和计时使用等宽数字便于纵向比较。",
      "de": "Use tabular numerals for aligned comparison.",
      "pz": "账单、表格和计时使用等宽数字便于纵向比较。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Use tabular numerals for aligned comparison. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "proportional-numeral",
      "zh": "比例数字",
      "en": "Proportional numerals",
      "dz": "正文使用比例数字减少视觉空隙，不把所有场景统一等宽。",
      "de": "Use proportional numerals in prose rather than one universal style.",
      "pz": "正文使用比例数字减少视觉空隙，不把所有场景统一等宽。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Use proportional numerals in prose rather than one universal style. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "numeric-alignment",
      "zh": "数字对齐",
      "en": "Numeric alignment",
      "dz": "带单位数字按小数点或末尾对齐，格式和语言同步。",
      "de": "Align numeric values by decimal or end with localized formatting.",
      "pz": "带单位数字按小数点或末尾对齐，格式和语言同步。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Align numeric values by decimal or end with localized formatting. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "cjk-spacing",
      "zh": "中日韩间距",
      "en": "CJK spacing",
      "dz": "中日韩与拉丁、数字之间的间距保持可读且不插入真实字符。",
      "de": "Keep CJK and Latin/number spacing readable without inserting characters.",
      "pz": "中日韩与拉丁、数字之间的间距保持可读且不插入真实字符。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Keep CJK and Latin/number spacing readable without inserting characters. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "bidi-isolation",
      "zh": "双向隔离",
      "en": "Bidi isolation",
      "dz": "混合语言、数字和 URL 使用双向隔离避免顺序错乱。",
      "de": "Isolate mixed-language text, numbers, and URLs.",
      "pz": "混合语言、数字和 URL 使用双向隔离避免顺序错乱。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Isolate mixed-language text, numbers, and URLs. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "text-direction",
      "zh": "文字方向",
      "en": "Text direction",
      "dz": "RTL 和 LTR 文本方向由语言和内容决定，不依赖页面默认。",
      "de": "Derive direction from language and content.",
      "pz": "RTL 和 LTR 文本方向由语言和内容决定，不依赖页面默认。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Derive direction from language and content. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "ruby-text",
      "zh": "注音文字",
      "en": "Ruby text",
      "dz": "注音与正文缩放和换行同步，读屏有等价读法。",
      "de": "Scale and wrap ruby with text and expose an accessible reading.",
      "pz": "注音与正文缩放和换行同步，读屏有等价读法。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Scale and wrap ruby with text and expose an accessible reading. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "vertical-writing",
      "zh": "竖排文字",
      "en": "Vertical writing",
      "dz": "竖排只用于适合的内容，并保留触摸和键盘阅读路径。",
      "de": "Use vertical writing selectively with touch and keyboard paths.",
      "pz": "竖排只用于适合的内容，并保留触摸和键盘阅读路径。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Use vertical writing selectively with touch and keyboard paths. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "longform-measure",
      "zh": "长文行宽",
      "en": "Longform measure",
      "dz": "长文限制行宽和段落间距，避免一行过长。",
      "de": "Limit measure and paragraph spacing for readable longform.",
      "pz": "长文限制行宽和段落间距，避免一行过长。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Limit measure and paragraph spacing for readable longform. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "drop-cap",
      "zh": "首字下沉",
      "en": "Drop cap",
      "dz": "首字下沉不改变读屏顺序，窄屏提供普通回退。",
      "de": "Drop caps do not alter reading order and have a narrow fallback.",
      "pz": "首字下沉不改变读屏顺序，窄屏提供普通回退。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Drop caps do not alter reading order and have a narrow fallback. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "quote-style",
      "zh": "引用样式",
      "en": "Quote style",
      "dz": "引用通过结构、边界和出处表达，不只依赖斜体或颜色。",
      "de": "Use structure, boundary, and attribution beyond italics or color.",
      "pz": "引用通过结构、边界和出处表达，不只依赖斜体或颜色。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Use structure, boundary, and attribution beyond italics or color. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "code-wrap",
      "zh": "代码换行",
      "en": "Code wrapping",
      "dz": "代码块支持横向滚动或软换行，复制内容不被改写。",
      "de": "Offer scroll or soft wrap without changing copied code.",
      "pz": "代码块支持横向滚动或软换行，复制内容不被改写。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Offer scroll or soft wrap without changing copied code. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "content-editable",
      "zh": "可编辑文本",
      "en": "Contenteditable text",
      "dz": "可编辑文本处理光标、组合输入、撤销和粘贴清理。",
      "de": "Handle caret, composition, undo, and paste cleanup.",
      "pz": "可编辑文本处理光标、组合输入、撤销和粘贴清理。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Handle caret, composition, undo, and paste cleanup. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "text-selection",
      "zh": "文本选择",
      "en": "Text selection",
      "dz": "自定义选中色保持对比，不阻止复制和键盘选择。",
      "de": "Keep selection contrast without blocking copy or keyboard selection.",
      "pz": "自定义选中色保持对比，不阻止复制和键盘选择。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Keep selection contrast without blocking copy or keyboard selection. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "font-loading",
      "zh": "字体加载",
      "en": "Font loading",
      "dz": "字体加载失败时避免布局跳变和不可读的隐藏文字。",
      "de": "Avoid layout shift and invisible text when fonts fail.",
      "pz": "字体加载失败时避免布局跳变和不可读的隐藏文字。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Avoid layout shift and invisible text when fonts fail. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "text-rendering",
      "zh": "文字渲染",
      "en": "Text rendering",
      "dz": "文字渲染优先清晰和跨平台一致，不为微小差异牺牲性能。",
      "de": "Prioritize clarity and cross-platform stability.",
      "pz": "文字渲染优先清晰和跨平台一致，不为微小差异牺牲性能。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Prioritize clarity and cross-platform stability. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "text-locale",
      "zh": "文字语言",
      "en": "Text locale",
      "dz": "标题、正文、数字和 prompt 完全跟随全局语言。",
      "de": "Titles, body, numbers, and prompts follow locale.",
      "pz": "标题、正文、数字和 prompt 完全跟随全局语言。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Titles, body, numbers, and prompts follow locale. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    },
    {
      "id": "text-audit",
      "zh": "文字审查",
      "en": "Text audit",
      "dz": "发布前检查语言、方向、缩放、截断、字体回退和复制。",
      "de": "Audit locale, direction, zoom, truncation, fallback, and copying.",
      "pz": "发布前检查语言、方向、缩放、截断、字体回退和复制。 在中英文、缩放、长内容和暗色主题下复核。",
      "pe": "Audit locale, direction, zoom, truncation, fallback, and copying. Validate Chinese/English, zoom, long content, and dark theme.",
      "demo": "box",
      "css": ".fx{background:#fbfaf7;color:#25231f;border:1px solid #d8d2c5;border-radius:10px;box-shadow:0 5px 16px #453b2714}"
    }
  ]
};
