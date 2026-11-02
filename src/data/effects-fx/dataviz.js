// Curated foundational patterns
const _atlasExpansion20260927_dataviz = {
  "id": "dataviz",
  "zh": "数据可视化",
  "en": "Data visualisation",
  "dz": "数字怎么变成看得懂的图形",
  "de": "Turning numbers into shapes people read",
  "items": [
    {
      "id": "bargrow",
      "zh": "柱子生长",
      "en": "Bars grow",
      "dz": "柱状图从底部长出来",
      "de": "Bars rise from the baseline",
      "pz": "transform-origin:bottom 的 scaleY(0→1)，别动 height 免得重排。",
      "pe": "scaleY(0→1) with transform-origin bottom, not height.",
      "demo": "chart",
      "css": "@keyframes fxk{from{transform:scaleY(0)}to{transform:scaleY(1)}}.fx{transform-origin:bottom;animation:fxk 1.1s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "barstagger",
      "zh": "柱子错峰",
      "en": "Bars stagger",
      "dz": "一根一根依次长出",
      "de": "Bars grow one after another",
      "pz": "delay = index × 70ms，读者的视线会跟着走。",
      "pe": "delay = index × 70ms — the eye follows the sequence.",
      "demo": "chart",
      "params": [
        {
          "k": "s",
          "zh": "间隔",
          "en": "Stagger",
          "min": 20,
          "max": 200,
          "step": 10,
          "def": 70,
          "unit": "ms"
        }
      ],
      "css": "@keyframes fxk{from{transform:scaleY(0)}to{transform:scaleY(1)}}.fx{transform-origin:bottom;animation:fxk .8s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*var(--s,70ms))}"
    },
    {
      "id": "hbar",
      "zh": "横向条形",
      "en": "Horizontal bars",
      "dz": "类别名长时用横条",
      "de": "Use horizontal bars when labels are long",
      "pz": "横条从左生长，标签左对齐、数值右对齐。",
      "pe": "Grow from the left; labels left, values right.",
      "demo": "chart",
      "css": "@keyframes fxk{from{transform:scaleX(0)}to{transform:scaleX(1)}}.fxchart{flex-direction:column;align-items:stretch;justify-content:center;width:min(420px,80%);gap:10px;height:auto}.fx{width:auto;height:26px;border-radius:4px;transform-origin:left;animation:fxk .9s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*70ms)}"
    },
    {
      "id": "linedraw",
      "zh": "折线描画",
      "en": "Line draw",
      "dz": "折线像被笔画出来",
      "de": "The line draws itself",
      "pz": "SVG path 的 stroke-dasharray/-dashoffset 从满到 0。",
      "pe": "Animate SVG stroke-dasharray/offset from full to zero.",
      "demo": "chart",
      "css": "@keyframes fxk{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0)}}.fxchart{width:min(440px,82%);position:relative}.fx{opacity:.12}.fxchart::after{content:'';position:absolute;inset:0;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40' preserveAspectRatio='none'%3E%3Cpolyline points='0,32 16,20 32,26 50,8 68,16 84,4 100,12' fill='none' stroke='%2323232f' stroke-width='1.6'/%3E%3C/svg%3E\") center/100% 100% no-repeat;animation:fxk 1.6s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "areafill",
      "zh": "面积填充",
      "en": "Area fill",
      "dz": "折线下方渐变填色",
      "de": "A gradient fills under the line",
      "pz": "线画完后面积层再淡入，两段动画错开 200ms。",
      "pe": "Fade the area in 200ms after the line finishes.",
      "demo": "chart",
      "css": "@keyframes fxk{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0)}}.fxchart{width:min(440px,82%);position:relative}.fx{display:none}.fxchart::after{content:'';position:absolute;inset:0;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40' preserveAspectRatio='none'%3E%3Cpolygon points='0,32 16,20 32,26 50,8 68,16 84,4 100,12 100,40 0,40' fill='%23365c31' fill-opacity='.18'/%3E%3Cpolyline points='0,32 16,20 32,26 50,8 68,16 84,4 100,12' fill='none' stroke='%23365c31' stroke-width='1.6'/%3E%3C/svg%3E\") center/100% 100% no-repeat;animation:fxk 1.8s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "donut",
      "zh": "环形扫出",
      "en": "Donut sweep",
      "dz": "圆环按比例扫一圈",
      "de": "The ring sweeps to its value",
      "pz": "conic-gradient 的角度动画，或 SVG circle 的 dashoffset。",
      "pe": "Animate the conic-gradient angle, or an SVG circle dashoffset.",
      "demo": "chart",
      "params": [
        {
          "k": "v",
          "zh": "数值",
          "en": "Value",
          "min": 0,
          "max": 100,
          "step": 1,
          "def": 68,
          "unit": ""
        }
      ],
      "css": ".fxchart{height:auto}.fx{width:200px;height:200px;border-radius:50%;background:conic-gradient(#4d8ba6 calc(var(--v,68)*1%),#eceef1 0);position:relative}.fx::after{content:'';position:absolute;inset:26px;border-radius:50%;background:#fcfcfb}.fx:nth-child(n+2){display:none}"
    },
    {
      "id": "ring",
      "zh": "进度圆环",
      "en": "Progress ring",
      "dz": "细环显示完成度",
      "de": "A thin ring shows completion",
      "pz": "SVG circle + stroke-dashoffset，round 线帽更友好。",
      "pe": "SVG circle with stroke-dashoffset and round caps.",
      "demo": "chart",
      "params": [
        {
          "k": "v",
          "zh": "进度",
          "en": "Progress",
          "min": 0,
          "max": 100,
          "step": 1,
          "def": 72,
          "unit": ""
        }
      ],
      "css": ".fxchart{height:auto}.fx{width:190px;height:190px;border-radius:50%;background:conic-gradient(#e8879c calc(var(--v,72)*1%),#eceee6 0);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 14px),#000 calc(100% - 13px))}.fx:nth-child(n+2){display:none}"
    },
    {
      "id": "gauge",
      "zh": "仪表盘",
      "en": "Gauge",
      "dz": "半圆表盘配指针",
      "de": "A half-dial with a needle",
      "pz": "半圆 conic-gradient + 指针 rotate，指针用 out-back 落定。",
      "pe": "Half conic-gradient plus a needle rotating with out-back.",
      "demo": "chart",
      "css": ".fxchart{height:auto}.fx{width:230px;height:115px;border-radius:115px 115px 0 0;background:conic-gradient(from 270deg,#7ab85a 0 33%,#f4dcb8 33% 66%,#e8879c 66% 100%);-webkit-mask:radial-gradient(farthest-side at 50% 100%,transparent calc(100% - 26px),#000 calc(100% - 25px))}.fx:nth-child(n+2){display:none}"
    },
    {
      "id": "stacked",
      "zh": "堆叠柱",
      "en": "Stacked bars",
      "dz": "一根柱里分几段",
      "de": "One bar split into segments",
      "pz": "每段单独动画，从下往上依次叠加。",
      "pe": "Animate segments bottom-up, one after another.",
      "demo": "chart",
      "css": "@keyframes fxk{from{transform:scaleY(0)}to{transform:scaleY(1)}}.fx{transform-origin:bottom;background:linear-gradient(#f4dcb8 0 30%,#7ab85a 30% 62%,#4d8ba6 62% 100%);animation:fxk 1s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*60ms)}"
    },
    {
      "id": "grouped",
      "zh": "分组柱",
      "en": "Grouped bars",
      "dz": "两组数据并排比较",
      "de": "Two series side by side",
      "pz": "组内间距小于组间间距，视觉才分得清。",
      "pe": "Inner gap must be smaller than the gap between groups.",
      "demo": "chart",
      "css": ".fxchart{gap:4px}.fx:nth-child(odd){background:#4d8ba6}.fx:nth-child(even){background:#f0c9a8;margin-right:18px}"
    },
    {
      "id": "dotplot",
      "zh": "点图",
      "en": "Dot plot",
      "dz": "用点代替柱，更轻",
      "de": "Dots instead of bars — lighter",
      "pz": "柱子替换为端点圆 + 细连接线，适合数据点少时。",
      "pe": "A dot at the value with a thin stem; best for few points.",
      "demo": "chart",
      "css": ".fx{width:6px;background:#e0e2e6;border-radius:3px;position:relative}.fx::after{content:'';position:absolute;top:-9px;left:50%;transform:translateX(-50%);width:18px;height:18px;border-radius:50%;background:#4d8ba6}"
    },
    {
      "id": "sparkline",
      "zh": "迷你趋势线",
      "en": "Sparkline",
      "dz": "嵌在文字旁的小趋势",
      "de": "A tiny trend that sits beside text",
      "pz": "无坐标轴、无标签，只表达方向，高度 20–32px。",
      "pe": "No axes or labels — direction only, 20–32px tall.",
      "demo": "chart",
      "css": ".fxchart{height:56px;gap:5px;align-items:flex-end}.fx{width:9px;border-radius:2px;background:#8b8e99}.fx:last-child{background:#e8879c}"
    },
    {
      "id": "heat",
      "zh": "热力格",
      "en": "Heat cells",
      "dz": "颜色深浅表示大小",
      "de": "Color depth encodes magnitude",
      "pz": "单色系明度阶梯，别用彩虹色，色阶控制在 5–7 级。",
      "pe": "A single-hue lightness ramp, 5–7 steps — never rainbow.",
      "demo": "chart",
      "css": ".fxchart{display:grid;grid-template-columns:repeat(7,34px);grid-auto-rows:34px;gap:6px;height:auto}.fx{width:auto;height:auto;border-radius:5px;background:#4d8ba6;opacity:calc(.2 + var(--i)*.11)}"
    },
    {
      "id": "waffle",
      "zh": "华夫格",
      "en": "Waffle chart",
      "dz": "一格格方块表示百分比",
      "de": "Squares stand in for a percentage",
      "pz": "10×10 网格，填充数量 = 百分比，比饼图更好读。",
      "pe": "A 10×10 grid filled to the percentage — easier than a pie.",
      "demo": "chart",
      "css": ".fxchart{display:grid;grid-template-columns:repeat(4,26px);grid-auto-rows:26px;gap:5px;height:auto}.fx{width:auto;height:auto;border-radius:3px;background:#eceef1}.fx:nth-child(-n+4){background:#4d8ba6}"
    },
    {
      "id": "bullet",
      "zh": "子弹图",
      "en": "Bullet chart",
      "dz": "实际值对着目标线",
      "de": "Actual value against a target line",
      "pz": "背景带表示区间，粗条是实际值，竖线是目标。",
      "pe": "Range band behind, thick bar for actual, tick for target.",
      "demo": "chart",
      "css": ".fxchart{flex-direction:column;align-items:stretch;justify-content:center;width:min(420px,80%);height:auto;gap:14px}.fx{width:auto;height:24px;background:#eceef1;border-radius:4px;position:relative}.fx::before{content:'';position:absolute;left:0;top:5px;bottom:5px;width:62%;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);border-radius:3px}.fx::after{content:'';position:absolute;left:78%;top:-3px;bottom:-3px;width:3px;background:#e8879c}"
    },
    {
      "id": "scatter",
      "zh": "散点",
      "en": "Scatter",
      "dz": "两维关系的点云",
      "de": "A cloud showing two dimensions",
      "pz": "点半透明避免重叠糊成一片，可加抖动。",
      "pe": "Semi-transparent dots (plus jitter) survive overplotting.",
      "demo": "chart",
      "css": ".fxchart{position:relative;width:min(420px,80%);height:250px;display:block;background:linear-gradient(#eceef1 1px,transparent 1px) 0 0/100% 50px}.fx{position:absolute;width:14px;height:14px;border-radius:50%;background:rgba(54,92,49,.55);left:calc(8% + var(--i)*13%);bottom:calc(12% + var(--i)*11%)}"
    },
    {
      "id": "threshold",
      "zh": "阈值线",
      "en": "Threshold line",
      "dz": "一条虚线标出警戒值",
      "de": "A dashed line marks the limit",
      "pz": "虚线 + 右侧标签，超过阈值的柱换成警示色。",
      "pe": "Dashed rule with a label; bars above it switch to the alert color.",
      "demo": "chart",
      "css": ".fxchart{position:relative}.fxchart::after{content:'';position:absolute;left:-10px;right:-10px;bottom:70%;border-top:2px dashed #e8879c}.fx:nth-child(4),.fx:nth-child(6){background:#e8879c}"
    },
    {
      "id": "hoverbar",
      "zh": "悬停高亮",
      "en": "Hover highlight",
      "dz": "指到哪根哪根变深，其余变淡",
      "de": "The hovered bar darkens, the rest recede",
      "pz": "父级 hover 降低所有条透明度，当前条恢复并显示数值。",
      "pe": "Dim all on parent hover; restore the hovered one and show its value.",
      "demo": "chart",
      "css": ".fx{transition:all .2s ease;cursor:pointer}.fxchart:hover .fx{opacity:.32}.fxchart .fx:hover{opacity:1;background:#e8879c;transform:scaleX(1.12)}"
    },
    {
      "id": "tooltipdv",
      "zh": "数值气泡",
      "en": "Value tooltip",
      "dz": "悬停时冒出精确数值",
      "de": "Exact numbers appear on hover",
      "pz": "气泡吸附到最近的数据点，不要跟着鼠标乱飘。",
      "pe": "Snap the tooltip to the nearest datum, do not float with the cursor.",
      "demo": "chart",
      "css": ".fx{position:relative;cursor:pointer}.fx::after{content:'42';position:absolute;bottom:calc(100% + 8px);left:50%;transform:translate(-50%,6px);background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:#fff;font:600 11px var(--sv-font-mono,monospace);padding:4px 7px;border-radius:5px;opacity:0;transition:all .18s ease}.fx:hover::after{opacity:1;transform:translate(-50%,0)}"
    },
    {
      "id": "sortmove",
      "zh": "排序位移",
      "en": "Sort transition",
      "dz": "重新排序时柱子平移到新位置",
      "de": "Bars slide to their new rank",
      "pz": "用 FLIP 保证每根柱从旧位置平滑移动到新位置。",
      "pe": "FLIP each bar from its old rect to the new one.",
      "demo": "chart",
      "css": ".fx{transition:transform .5s cubic-bezier(.22,1,.36,1)}.fxchart:hover .fx:nth-child(1){transform:translateX(240px)}.fxchart:hover .fx:nth-child(5){transform:translateX(-240px)}"
    },
    {
      "id": "axisfade",
      "zh": "坐标轴淡入",
      "en": "Axis fade",
      "dz": "网格线安静地先出现",
      "de": "Grid lines arrive quietly first",
      "pz": "轴线先于数据出现，透明度不超过 12%。",
      "pe": "Axes appear before the data, at 12% opacity or less.",
      "demo": "chart",
      "css": "@keyframes fxg{from{opacity:0}to{opacity:1}}@keyframes fxk{from{transform:scaleY(0)}to{transform:scaleY(1)}}.fxchart{position:relative;padding:0 10px}.fxchart::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(#e4e5e0 0 1px,transparent 1px 44px);animation:fxg .6s ease infinite alternate}.fx{transform-origin:bottom;animation:fxk 1.2s cubic-bezier(.22,1,.36,1) .3s infinite alternate}"
    },
    {
      "id": "delta",
      "zh": "涨跌对比",
      "en": "Delta bars",
      "dz": "正负分列基线两侧",
      "de": "Positive and negative split by the baseline",
      "pz": "基线居中，涨用品牌绿、跌用 Folly 粉，别用红绿撞色。",
      "pe": "Centre the baseline; brand green up, Folly down.",
      "demo": "chart",
      "css": ".fxchart{align-items:center;position:relative;height:240px}.fxchart::after{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:#c9ccd3}.fx{align-self:flex-start;background:#7ab85a}.fx:nth-child(even){align-self:flex-end;background:#e8879c}"
    },
    {
      "id": "countup",
      "zh": "大数字跳动",
      "en": "Big number count-up",
      "dz": "关键指标跳到目标值",
      "de": "The headline metric counts to its value",
      "pz": "用 ease-out 的计数曲线（先快后慢），保留千分位。",
      "pe": "Ease-out counting with thousand separators.",
      "demo": "chart",
      "css": "@keyframes fxk{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}.fxchart{height:auto}.fx{width:auto;height:auto;background:none;font:700 88px/1 var(--sv-font-mono,monospace);color:#23232f;animation:fxk .8s cubic-bezier(.22,1,.36,1) infinite alternate}.fx::after{content:'3,425'}.fx:nth-child(n+2){display:none}"
    },
    {
      "id": "radialbars",
      "zh": "环形条",
      "en": "Radial bars",
      "dz": "柱子绕成一圈",
      "de": "Bars wrapped into a circle",
      "pz": "按角度分布，只在类别少且需要装饰性时用。",
      "pe": "Distribute by angle — decorative, only for few categories.",
      "demo": "chart",
      "css": ".fxchart{position:relative;width:250px;height:250px;display:block}.fx{position:absolute;left:50%;bottom:50%;width:14px;border-radius:7px;transform-origin:bottom center;transform:rotate(calc(var(--i)*51deg));background:#4d8ba6;opacity:calc(.45 + var(--i)*.08)}"
    },
    {
      "id": "legend",
      "zh": "图例联动",
      "en": "Legend linking",
      "dz": "点图例可以过滤系列",
      "de": "Clicking the legend filters series",
      "pz": "图例即控件：点击切换显示，未选中降到 30% 透明。",
      "pe": "The legend is the control: toggle series, dim the unselected to 30%.",
      "demo": "chart",
      "css": ".fx{cursor:pointer;transition:opacity .2s}.fx:nth-child(3n){opacity:.28}.fx:hover{opacity:1;background:#e8879c}"
    },
    {
      "id": "axis-label",
      "zh": "坐标轴标签",
      "en": "Axis label",
      "dz": "坐标轴标签包含单位、范围和方向，不能只显示数字。",
      "de": "Axis labels include units, range, and direction.",
      "pz": "坐标轴标签包含单位、范围和方向，不能只显示数字。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Axis labels include units, range, and direction. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 4,
      "cells": ["0","25","50","75"],
      "css": ".fxcol{flex-direction:row;gap:0;align-items:flex-end;width:190px;border-bottom:1px solid #c5d0c8;padding-bottom:9px}.fx{width:auto;flex:1;height:18px;border:0;background:transparent;color:#8b8d84;font:500 9.5px/18px var(--fx-mono);text-align:center;animation:axl 4s ease-in-out infinite;animation-delay:calc(var(--i) * .16s)}@keyframes axl{0%,100%{opacity:.4;transform:translateY(3px)}48%,72%{opacity:1;transform:none}}"
    },
    {
      "id": "tick-density",
      "zh": "刻度密度",
      "en": "Tick density",
      "dz": "刻度根据空间和数据范围自适应，避免标签重叠。",
      "de": "Adapt ticks to space and data range to avoid overlap.",
      "pz": "刻度根据空间和数据范围自适应，避免标签重叠。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Adapt ticks to space and data range to avoid overlap. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 9,
      "css": ".fxcol{flex-direction:row;gap:0;align-items:flex-end;width:190px;height:74px;border-bottom:1px solid #c5d0c8}.fx{width:auto;flex:1;height:7px;border:0;background:#c5d0c8;animation:tkd 4.2s ease-in-out infinite;animation-delay:calc(var(--i) * .06s)}.fx:nth-child(2n){height:13px}@keyframes tkd{0%,100%{opacity:.28}48%,72%{opacity:1}}"
    },
    {
      "id": "zero-baseline",
      "zh": "零基线",
      "en": "Zero baseline",
      "dz": "柱状图明确零基线，截断轴要有视觉和文字提示。",
      "de": "Show zero baseline and disclose truncated axes.",
      "pz": "柱状图明确零基线，截断轴要有视觉和文字提示。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Show zero baseline and disclose truncated axes. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 5,
      "cells": ["","","","",""],
      "css": ".fxcol{flex-direction:row;gap:9px;align-items:flex-end;width:190px;height:100px;position:relative}.fx{width:20px;border-radius:5px 5px 0 0;background:linear-gradient(180deg,#7fa9c4,#3f6f92)}.fx:nth-child(1){height:34px}.fx:nth-child(2){height:62px}.fx:nth-child(3){height:88px}.fx:nth-child(4){height:52px}.fx:nth-child(5){height:26px}.fxcol::after{content:'0';position:absolute;left:0;bottom:-16px;font:500 9.5px/1 var(--fx-mono);color:#c0392b}.fxcol::before{content:'';position:absolute;left:0;right:0;bottom:0;height:1.5px;background:#c0392b;animation:zb 4s ease-in-out infinite}@keyframes zb{0%,100%{opacity:.4}50%{opacity:1}}"
    },
    {
      "id": "scale-type",
      "zh": "比例尺类型",
      "en": "Scale type",
      "dz": "线性、对数和分位比例尺在图例和说明中明确。",
      "de": "State linear, logarithmic, or quantile scales.",
      "pz": "线性、对数和分位比例尺在图例和说明中明确。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "State linear, logarithmic, or quantile scales. Validate scale, dark mode, print, and locale switching.",
      "demo": "panel",
      "n": 2,
      "css": ".fxstack{flex-direction:row;gap:18px;align-items:flex-end}.fx{width:70px;height:86px;border:0;background:transparent;position:relative}.fx:nth-child(1)::after{content:'';position:absolute;left:8px;right:8px;bottom:0;height:100%;background:repeating-linear-gradient(90deg,#3f6f92 0 7px,transparent 7px 14px);opacity:.75}.fx:nth-child(2)::after{content:'';position:absolute;left:50%;bottom:0;width:34px;height:34px;margin-left:-17px;border-radius:50%;background:radial-gradient(circle,#e8879c,#cf6b84)}.fx:nth-child(2)::before{content:'';position:absolute;left:50%;bottom:34px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:radial-gradient(circle,#e8879c,#cf6b84);opacity:.6}"
    },
    {
      "id": "missing-data",
      "zh": "缺失数据",
      "en": "Missing data",
      "dz": "缺失数据有独立符号，不和零值混淆。",
      "de": "Use a distinct mark for missing data rather than zero.",
      "pz": "缺失数据有独立符号，不和零值混淆。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Use a distinct mark for missing data rather than zero. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 9,
      "css": ".fxcol{flex-direction:row;gap:7px;align-items:flex-end;width:190px;height:96px}.fx{width:14px;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#7fa9c4,#3f6f92)}.fx:nth-child(1){height:40px}.fx:nth-child(2){height:66px}.fx:nth-child(3){height:0;background:repeating-linear-gradient(45deg,#dfe3db 0 4px,transparent 4px 8px);border:1px dashed #9fb0a0;height:66px}.fx:nth-child(4){height:52px}.fx:nth-child(5){height:0;background:repeating-linear-gradient(45deg,#dfe3db 0 4px,transparent 4px 8px);border:1px dashed #9fb0a0;height:80px}.fx:nth-child(6){height:74px}.fx:nth-child(7){height:44px}.fx:nth-child(8){height:60px}.fx:nth-child(9){height:30px}.fx{animation:md 4.4s ease-in-out infinite;animation-delay:calc(var(--i) * .08s)}@keyframes md{0%,100%{opacity:.55}48%,74%{opacity:1}}"
    },
    {
      "id": "uncertainty-band",
      "zh": "不确定区间",
      "en": "Uncertainty band",
      "dz": "不确定性用区间、误差线或文字说明表达。",
      "de": "Express uncertainty with bands, error bars, or text.",
      "pz": "不确定性用区间、误差线或文字说明表达。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Express uncertainty with bands, error bars, or text. Validate scale, dark mode, print, and locale switching.",
      "demo": "box",
      "cells": [""],
      "css": ".fx{width:190px;height:100px;border-radius:10px;background:linear-gradient(#fff,#f4f6f2);border:1px solid #e0e4dc;position:relative;overflow:hidden}.fx::before{content:'';position:absolute;left:14px;right:14px;top:34px;bottom:34px;background:linear-gradient(90deg,#3f6f9222,#3f6f9255,#3f6f9222);border-radius:20px;animation:ub 4.4s ease-in-out infinite}.fx::after{content:'';position:absolute;left:14px;right:14px;top:50%;height:2px;background:#3f6f92;transform:translateY(-1px)}@keyframes ub{0%,100%{transform:scaleY(.5)}50%{transform:scaleY(1.25)}}"
    },
    {
      "id": "data-source",
      "zh": "数据来源",
      "en": "Data source",
      "dz": "图表显示来源、时间范围和更新时间。",
      "de": "Show source, date range, and update time.",
      "pz": "图表显示来源、时间范围和更新时间。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Show source, date range, and update time. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 3,
      "cells": ["source: csv","rows: 1,204","updated: 09-10"],
      "css": ".fxcol{gap:5px;width:174px;align-items:flex-start}.fx{height:22px;border:0;background:transparent;color:#8b8d84;font:500 10px/1 var(--fx-mono);justify-content:flex-start;animation:dsrc 4s ease-in-out infinite;animation-delay:calc(var(--i) * .18s)}@keyframes dsrc{0%,100%{opacity:.35;transform:translateX(-4px)}46%,72%{opacity:1;transform:none}}"
    },
    {
      "id": "chart-caption",
      "zh": "图表说明",
      "en": "Chart caption",
      "dz": "说明先给结论和读法，再提供方法细节。",
      "de": "Lead with takeaway and reading guide before method detail.",
      "pz": "说明先给结论和读法，再提供方法细节。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Lead with takeaway and reading guide before method detail. Validate scale, dark mode, print, and locale switching.",
      "demo": "box",
      "cells": ["图 3 · 会话时长"],
      "css": ".fx{width:190px;height:96px;border-radius:10px;background:linear-gradient(#fff,#f4f6f2);border:1px solid #e0e4dc;color:#5d6b57;font:500 10.5px/1 var(--fx-sans);position:relative;justify-content:flex-end;padding-bottom:14px;overflow:hidden}.fx::after{content:'';position:absolute;left:16px;right:16px;top:18px;bottom:42px;background:repeating-linear-gradient(90deg,#3f6f92 0 12px,transparent 12px 22px);opacity:.55;animation:cc2 4.2s ease-in-out infinite}@keyframes cc2{0%,100%{opacity:.3}50%{opacity:.75}}"
    },
    {
      "id": "legend-toggle",
      "zh": "图例切换",
      "en": "Legend toggle",
      "dz": "图例可隐藏序列但保持颜色和数据状态一致。",
      "de": "Allow series toggling while keeping color and state consistent.",
      "pz": "图例可隐藏序列但保持颜色和数据状态一致。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Allow series toggling while keeping color and state consistent. Validate scale, dark mode, print, and locale switching.",
      "demo": "pill",
      "css": ".fxpill{gap:8px}.fx{width:auto;min-width:62px;height:32px;border-radius:999px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 10.5px/1 var(--fx-sans);position:relative;padding-left:22px;animation:lgt 4s ease-in-out infinite}.fx::before{content:'';position:absolute;left:9px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:#3f6f92}.fx:nth-child(2)::before{background:#e8879c}.fx:nth-child(2){animation-name:lgt2;animation-delay:.4s}.fx:nth-child(3)::before{background:#c9c05a}.fx:nth-child(3){animation-name:lgt2;animation-delay:.8s}.fx:nth-child(4)::before{background:#6a4a8f}.fx:nth-child(4){animation-name:lgt2;animation-delay:1.2s}.fx:nth-child(5)::before{background:#3d7a52}.fx:nth-child(5){animation-name:lgt2;animation-delay:1.6s}@keyframes lgt{0%,100%{opacity:1}50%{opacity:.85}}@keyframes lgt2{0%,100%{opacity:1}50%{opacity:.3;filter:grayscale(1)}}"
    },
    {
      "id": "series-highlight",
      "zh": "序列高亮",
      "en": "Series highlight",
      "dz": "高亮序列同时降低其他序列，不让关键数据消失。",
      "de": "Highlight a series while retaining context for others.",
      "pz": "高亮序列同时降低其他序列，不让关键数据消失。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Highlight a series while retaining context for others. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 7,
      "css": ".fxcol{flex-direction:row;gap:6px;align-items:flex-end;width:190px;height:96px}.fx{width:16px;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#a9c6d8,#7fa9c4);animation:sh 4s ease-in-out infinite;animation-delay:calc(var(--i) * .1s)}.fx:nth-child(1){height:36px}.fx:nth-child(2){height:58px}.fx:nth-child(3){height:44px}.fx:nth-child(4){height:82px;background:linear-gradient(180deg,#5f8fb0,#3f6f92)}.fx:nth-child(5){height:50px}.fx:nth-child(6){height:68px}.fx:nth-child(7){height:30px}@keyframes sh{0%,100%{opacity:.45}48%,72%{opacity:1}}.fx:nth-child(4){animation-name:sh4}@keyframes sh4{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.06)}}"
    },
    {
      "id": "crosshair",
      "zh": "十字线",
      "en": "Crosshair",
      "dz": "十字线显示精确值并跟随键盘或触摸。",
      "de": "Show exact values through pointer, keyboard, or touch.",
      "pz": "十字线显示精确值并跟随键盘或触摸。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Show exact values through pointer, keyboard, or touch. Validate scale, dark mode, print, and locale switching.",
      "demo": "box",
      "cells": [""],
      "css": ".fx{width:190px;height:110px;border-radius:10px;background:linear-gradient(#fff,#f4f6f2);border:1px solid #e0e4dc;position:relative;overflow:hidden}.fx::before{content:'';position:absolute;left:0;right:0;bottom:0;height:70%;background:repeating-linear-gradient(90deg,#3f6f9244 0 10px,transparent 10px 20px)}.fx::after{content:'';position:absolute;left:0;top:0;bottom:0;width:1.5px;background:#3f6f92;box-shadow:0 0 0 1px #fff;animation:ch 4s ease-in-out infinite}@keyframes ch{0%,100%{left:24px}50%{left:150px}}"
    },
    {
      "id": "chart-tooltip",
      "zh": "图表提示",
      "en": "Chart tooltip",
      "dz": "提示包含标题、系列、值、单位和时间。",
      "de": "Include title, series, value, unit, and time.",
      "pz": "提示包含标题、系列、值、单位和时间。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Include title, series, value, unit, and time. Validate scale, dark mode, print, and locale switching.",
      "demo": "box",
      "cells": [""],
      "css": ".fx{width:190px;height:110px;border-radius:10px;background:linear-gradient(#fff,#f4f6f2);border:1px solid #e0e4dc;position:relative;overflow:visible}.fx::before{content:'';position:absolute;left:14px;bottom:14px;width:80px;height:54px;background:repeating-linear-gradient(90deg,#3f6f92 0 8px,transparent 8px 16px);opacity:.5}.fx::after{content:'09-10 · 1,204';position:absolute;right:0;top:16px;padding:6px 9px;border-radius:7px;background:linear-gradient(#252a33,#1a1e25);color:#e7ecf1;font:600 9.5px/1 var(--fx-mono);white-space:nowrap;animation:ctt 4s ease-in-out infinite}@keyframes ctt{0%,100%{opacity:.15;transform:translateY(6px)}46%,74%{opacity:1;transform:none}}"
    },
    {
      "id": "zoom-brush",
      "zh": "缩放刷选",
      "en": "Zoom brush",
      "dz": "刷选范围有可见手柄、重置和键盘操作。",
      "de": "Provide visible handles, reset, and keyboard control.",
      "pz": "刷选范围有可见手柄、重置和键盘操作。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Provide visible handles, reset, and keyboard control. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 11,
      "css": ".fxcol{flex-direction:row;gap:4px;align-items:flex-end;width:190px;height:92px;position:relative}.fx{width:12px;border-radius:3px 3px 0 0;background:linear-gradient(180deg,#7fa9c4,#3f6f92)}.fx:nth-child(1){height:30px}.fx:nth-child(2){height:48px}.fx:nth-child(3){height:70px}.fx:nth-child(4){height:42px}.fx:nth-child(5){height:86px}.fx:nth-child(6){height:56px}.fx:nth-child(7){height:74px}.fx:nth-child(8){height:38px}.fx:nth-child(9){height:62px}.fx:nth-child(10){height:46px}.fx:nth-child(11){height:28px}.fxcol::after{content:'';position:absolute;left:32%;top:-6px;bottom:-6px;width:38%;border:1.5px solid #3f6f92;background:#3f6f9210;animation:zb2 4.2s ease-in-out infinite}@keyframes zb2{0%,100%{left:4%;width:24%}50%{left:32%;width:52%}}"
    },
    {
      "id": "pan-chart",
      "zh": "图表平移",
      "en": "Chart pan",
      "dz": "平移不丢失当前筛选，边界有明确反馈。",
      "de": "Keep filters during pan and signal boundaries.",
      "pz": "平移不丢失当前筛选，边界有明确反馈。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Keep filters during pan and signal boundaries. Validate scale, dark mode, print, and locale switching.",
      "demo": "box",
      "cells": [""],
      "css": ".fx{width:190px;height:100px;border-radius:10px;background:linear-gradient(#fff,#f4f6f2);border:1px solid #e0e4dc;position:relative;overflow:hidden}.fx::after{content:'';position:absolute;inset:14px;width:220px;background:repeating-linear-gradient(90deg,#3f6f9255 0 12px,transparent 12px 24px);background-size:auto 60%;background-repeat:repeat-x;background-position:0 100%;animation:pc2 5s ease-in-out infinite}@keyframes pc2{0%,100%{transform:translateX(0)}50%{transform:translateX(-40px)}}"
    },
    {
      "id": "chart-focus",
      "zh": "图表焦点",
      "en": "Chart focus",
      "dz": "图形元素提供可聚焦的摘要或数据表等价物。",
      "de": "Provide focusable summaries or table equivalents.",
      "pz": "图形元素提供可聚焦的摘要或数据表等价物。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Provide focusable summaries or table equivalents. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 6,
      "css": ".fxcol{flex-direction:row;gap:8px;align-items:flex-end;width:190px;height:92px}.fx{width:18px;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#7fa9c4,#3f6f92);position:relative}.fx:nth-child(1){height:40px}.fx:nth-child(2){height:64px}.fx:nth-child(3){height:80px}.fx:nth-child(4){height:52px}.fx:nth-child(5){height:70px}.fx:nth-child(6){height:34px}.fx:nth-child(3)::after{content:'';position:absolute;inset:-5px -5px 0 -5px;border:2px solid #3f6f92;border-radius:6px 6px 0 0;animation:cf 3.6s ease-in-out infinite}@keyframes cf{0%,100%{opacity:.4}48%,72%{opacity:1}}"
    },
    {
      "id": "chart-table",
      "zh": "图表表格",
      "en": "Chart table",
      "dz": "数据表和图表共享同一筛选、排序和语言状态。",
      "de": "Share filters, sort, and locale between chart and table.",
      "pz": "数据表和图表共享同一筛选、排序和语言状态。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Share filters, sort, and locale between chart and table. Validate scale, dark mode, print, and locale switching.",
      "demo": "table",
      "n": 6,
      "css": ".fxtable{display:grid;grid-template-columns:1.6fr 1fr;gap:0;width:186px;border:1px solid #e0e4dc;border-radius:9px;overflow:hidden;background:#fff}.fx{height:28px;border-radius:0;background:#fff;border-bottom:1px solid #eef1ec;color:#202824;font:500 10.5px/1 var(--fx-sans);justify-content:flex-start;padding-left:10px}.fx:nth-child(-n+2){background:linear-gradient(#f4f6f2,#ecefe9);font-weight:600}.fx:nth-child(2n){font-family:var(--fx-mono);color:#3f6f92}"
    },
    {
      "id": "color-series",
      "zh": "序列配色",
      "en": "Series color",
      "dz": "序列配色同时考虑色觉差异、打印和暗色主题。",
      "de": "Account for color vision, print, and dark themes.",
      "pz": "序列配色同时考虑色觉差异、打印和暗色主题。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Account for color vision, print, and dark themes. Validate scale, dark mode, print, and locale switching.",
      "demo": "grid",
      "n": 8,
      "css": ".fxgrid{grid-template-columns:repeat(4,1fr);gap:7px;width:186px}.fx{height:40px;border-radius:8px;animation:cos 4s ease-in-out infinite;animation-delay:calc(var(--i) * .12s)}.fx:nth-child(1){background:#3f6f92}.fx:nth-child(2){background:#5f8fb0}.fx:nth-child(3){background:#8fb6ce}.fx:nth-child(4){background:#bfd8e6}.fx:nth-child(5){background:#cf6b84}.fx:nth-child(6){background:#e8879c}.fx:nth-child(7){background:#f0b3c0}.fx:nth-child(8){background:#f8dbe2}@keyframes cos{0%,100%{opacity:.5}48%,72%{opacity:1}}"
    },
    {
      "id": "pattern-fill",
      "zh": "纹理填充",
      "en": "Pattern fill",
      "dz": "纹理补充颜色编码，适合打印和高对比场景。",
      "de": "Use patterns alongside color for print and high contrast.",
      "pz": "纹理补充颜色编码，适合打印和高对比场景。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Use patterns alongside color for print and high contrast. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 5,
      "css": ".fxcol{flex-direction:row;gap:8px;align-items:flex-end;width:188px;height:94px}.fx{width:24px;border:1px solid #3f6f92;border-bottom:0;border-radius:4px 4px 0 0}.fx:nth-child(1){height:76px;background:repeating-linear-gradient(45deg,#3f6f92 0 3px,#bfd8e6 3px 6px)}.fx:nth-child(2){height:52px;background:repeating-linear-gradient(-45deg,#3f6f92 0 3px,#bfd8e6 3px 6px)}.fx:nth-child(3){height:86px;background:radial-gradient(#3f6f92 1.5px,transparent 1.6px) 0 0/7px 7px,#dbe7ef}.fx:nth-child(4){height:44px;background:repeating-linear-gradient(90deg,#3f6f92 0 2px,#dbe7ef 2px 6px)}.fx:nth-child(5){height:66px;background:repeating-linear-gradient(0deg,#3f6f92 0 2px,#dbe7ef 2px 6px)}"
    },
    {
      "id": "chart-animation",
      "zh": "图表动画",
      "en": "Chart animation",
      "dz": "动画表达变化关系，减少动效时仍可读。",
      "de": "Use animation to explain change with a readable static fallback.",
      "pz": "动画表达变化关系，减少动效时仍可读。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Use animation to explain change with a readable static fallback. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 7,
      "css": ".fxcol{flex-direction:row;gap:6px;align-items:flex-end;width:190px;height:96px}.fx{width:16px;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#7fa9c4,#3f6f92);transform-origin:bottom;animation:cha 3.6s cubic-bezier(.2,1,.3,1) infinite;animation-delay:calc(var(--i) * .12s)}.fx:nth-child(1){height:36px}.fx:nth-child(2){height:58px}.fx:nth-child(3){height:44px}.fx:nth-child(4){height:82px}.fx:nth-child(5){height:50px}.fx:nth-child(6){height:68px}.fx:nth-child(7){height:30px}@keyframes cha{0%,8%{transform:scaleY(0);opacity:0}38%,86%{transform:scaleY(1);opacity:1}100%{transform:scaleY(0);opacity:0}}"
    },
    {
      "id": "live-chart",
      "zh": "实时图表",
      "en": "Live chart",
      "dz": "实时更新标出更新时间和暂停入口，不让数据移动造成误读。",
      "de": "Show update time and pause for moving data.",
      "pz": "实时更新标出更新时间和暂停入口，不让数据移动造成误读。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Show update time and pause for moving data. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 7,
      "css": ".fxcol{flex-direction:row;gap:6px;align-items:flex-end;width:190px;height:96px}.fx{width:16px;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#5f8fb0,#3f6f92);animation:lvc 2.4s ease-in-out infinite;animation-delay:calc(var(--i) * .12s)}@keyframes lvc{0%,100%{height:26px}50%{height:88px}}.fxcol::after{content:'';position:absolute;right:0;top:0;width:6px;height:6px;border-radius:50%;background:#3d7a52;animation:lvcd 1.6s ease-in-out infinite}@keyframes lvcd{0%,100%{opacity:.3;transform:scale(.7)}50%{opacity:1;transform:none}}"
    },
    {
      "id": "data-refresh",
      "zh": "数据刷新",
      "en": "Data refresh",
      "dz": "刷新失败保留旧数据并标记过期，而不是清空图表。",
      "de": "Keep stale data marked when refresh fails.",
      "pz": "刷新失败保留旧数据并标记过期，而不是清空图表。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Keep stale data marked when refresh fails. Validate scale, dark mode, print, and locale switching.",
      "demo": "box",
      "cells": ["刷新"],
      "css": ".fx{width:160px;height:64px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 11.5px/1 var(--fx-sans);position:relative;overflow:visible}.fx::after{content:'';position:absolute;left:50%;top:-22px;width:16px;height:16px;margin-left:-8px;border-radius:50%;border:2px solid transparent;border-top-color:#3f6f92;border-right-color:#3f6f92;animation:dr2 1.4s linear infinite}@keyframes dr2{to{transform:rotate(1turn)}}"
    },
    {
      "id": "chart-empty",
      "zh": "图表空状态",
      "en": "Chart empty state",
      "dz": "空图表说明没有数据、筛选无结果还是尚未加载。",
      "de": "Distinguish no data, filtered empty, and not loaded.",
      "pz": "空图表说明没有数据、筛选无结果还是尚未加载。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Distinguish no data, filtered empty, and not loaded. Validate scale, dark mode, print, and locale switching.",
      "demo": "box",
      "cells": ["暂无数据"],
      "css": ".fx{width:190px;height:110px;border-radius:10px;background:repeating-linear-gradient(180deg,#fff 0 22px,#f6f8f4 22px 23px);border:1px solid #e0e4dc;color:#a9ada3;font:600 11.5px/1 var(--fx-sans);position:relative;overflow:hidden}.fx::after{content:'';position:absolute;left:50%;top:34%;width:44px;height:30px;margin-left:-22px;border:1.5px dashed #c5d0c8;border-radius:6px;animation:che 4.4s ease-in-out infinite}@keyframes che{0%,100%{opacity:.5;transform:scale(.94)}48%,74%{opacity:1;transform:none}}"
    },
    {
      "id": "chart-error",
      "zh": "图表错误",
      "en": "Chart error",
      "dz": "错误状态提供重试和数据表回退。",
      "de": "Offer retry and table fallback.",
      "pz": "错误状态提供重试和数据表回退。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Offer retry and table fallback. Validate scale, dark mode, print, and locale switching.",
      "demo": "box",
      "cells": ["加载失败 · 重试"],
      "css": ".fx{width:196px;height:84px;border-radius:10px;background:linear-gradient(#fff6f6,#fdecec);border:1px solid #e0a8a0;color:#8e2a1f;font:600 11px/1 var(--fx-sans);position:relative;overflow:hidden}.fx::after{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#c0392b;animation:cer 3.4s ease-in-out infinite}@keyframes cer{0%,100%{opacity:.4}48%,72%{opacity:1}}"
    },
    {
      "id": "small-multiple",
      "zh": "小倍图",
      "en": "Small multiples",
      "dz": "小倍图共享比例尺和标题规则，便于比较。",
      "de": "Share scales and title rules for comparison.",
      "pz": "小倍图共享比例尺和标题规则，便于比较。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Share scales and title rules for comparison. Validate scale, dark mode, print, and locale switching.",
      "demo": "grid",
      "n": 6,
      "css": ".fxgrid{grid-template-columns:repeat(3,1fr);gap:8px;width:190px}.fx{height:44px;border-radius:7px;background:linear-gradient(#fff,#f4f6f2);border:1px solid #e6e9e1;background-image:repeating-linear-gradient(90deg,#3f6f9255 0 5px,transparent 5px 10px);background-size:auto 46%;background-position:4px 100%;background-repeat:repeat-x;animation:sm2 4.2s ease-in-out infinite;animation-delay:calc(var(--i) * .12s)}@keyframes sm2{0%,100%{opacity:.55}48%,74%{opacity:1}}"
    },
    {
      "id": "annotation",
      "zh": "图表标注",
      "en": "Chart annotation",
      "dz": "标注说明事件、来源和时间，不遮挡关键点。",
      "de": "Annotate events, source, and time without hiding points.",
      "pz": "标注说明事件、来源和时间，不遮挡关键点。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Annotate events, source, and time without hiding points. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 6,
      "css": ".fxcol{flex-direction:row;gap:9px;align-items:flex-end;width:190px;height:96px;position:relative}.fx{width:18px;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#7fa9c4,#3f6f92)}.fx:nth-child(1){height:38px}.fx:nth-child(2){height:60px}.fx:nth-child(3){height:46px}.fx:nth-child(4){height:84px}.fx:nth-child(5){height:54px}.fx:nth-child(6){height:32px}.fxcol::after{content:'峰值';position:absolute;left:50%;bottom:90px;font:600 9.5px/1 var(--fx-mono);color:#c0392b;animation:an2 4s ease-in-out infinite}@keyframes an2{0%,100%{opacity:0;transform:translateY(5px)}46%,74%{opacity:1;transform:none}}"
    },
    {
      "id": "responsive-chart",
      "zh": "响应式图表",
      "en": "Responsive chart",
      "dz": "窄屏减少维度或转为列表，保留关键洞察。",
      "de": "Reduce dimensions or switch to list on narrow screens.",
      "pz": "窄屏减少维度或转为列表，保留关键洞察。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Reduce dimensions or switch to list on narrow screens. Validate scale, dark mode, print, and locale switching.",
      "demo": "box",
      "cells": [""],
      "css": ".fx{width:190px;height:96px;border-radius:10px;background:linear-gradient(#fff,#f4f6f2);border:1px solid #e0e4dc;position:relative;overflow:hidden;animation:rsc 4.4s ease-in-out infinite}.fx::after{content:'';position:absolute;inset:14px;background:repeating-linear-gradient(90deg,#3f6f9266 0 10px,transparent 10px 20px)}@keyframes rsc{0%,100%{height:60px}50%{height:110px}}"
    },
    {
      "id": "export-chart",
      "zh": "图表导出",
      "en": "Chart export",
      "dz": "导出包含来源、单位、筛选和时间戳。",
      "de": "Include source, units, filters, and timestamp in exports.",
      "pz": "导出包含来源、单位、筛选和时间戳。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Include source, units, filters, and timestamp in exports. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 3,
      "cells": ["PNG","SVG","CSV"],
      "css": ".fxcol{gap:7px;width:150px}.fx{height:32px;border-radius:8px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#202824;font:600 11px/1 var(--fx-mono);justify-content:flex-start;padding-left:12px;animation:exc 3.8s ease-in-out infinite;animation-delay:calc(var(--i) * .2s)}@keyframes exc{0%,100%{border-color:#dfe3db;transform:none}46%,72%{border-color:#3f6f92;transform:translateX(6px)}}"
    },
    {
      "id": "chart-locale",
      "zh": "图表语言",
      "en": "Chart locale",
      "dz": "数字、日期、图例、说明和 prompt 完全跟随语言。",
      "de": "Numbers, dates, legends, descriptions, and prompts follow locale.",
      "pz": "数字、日期、图例、说明和 prompt 完全跟随语言。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Numbers, dates, legends, descriptions, and prompts follow locale. Validate scale, dark mode, print, and locale switching.",
      "demo": "box",
      "cells": ["1.234,56 €"],
      "css": ".fx{width:186px;height:74px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 15px/1 var(--fx-mono);animation:clc 4s steps(1,end) infinite}@keyframes clc{0%,49%{font-variant-numeric:normal}50%,100%{font-variant-numeric:tabular-nums}}"
    },
    {
      "id": "chart-performance",
      "zh": "图表性能",
      "en": "Chart performance",
      "dz": "大数据量使用抽样、聚合或渐进渲染，不阻塞输入。",
      "de": "Use sampling, aggregation, or progressive render at scale.",
      "pz": "大数据量使用抽样、聚合或渐进渲染，不阻塞输入。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Use sampling, aggregation, or progressive render at scale. Validate scale, dark mode, print, and locale switching.",
      "demo": "box",
      "cells": ["60 fps"],
      "css": ".fx{width:180px;height:80px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 13px/1 var(--fx-mono);position:relative;overflow:hidden}.fx::after{content:'';position:absolute;left:0;right:0;bottom:0;height:100%;background:linear-gradient(180deg,transparent,#3f6f9233);animation:cpf 1.2s ease-in-out infinite}@keyframes cpf{0%,100%{transform:scaleY(.6);transform-origin:bottom}50%{transform:scaleY(1);transform-origin:bottom}}"
    },
    {
      "id": "dataviz-audit",
      "zh": "可视化审查",
      "en": "Dataviz audit",
      "dz": "发布前检查准确性、来源、无障碍、性能和主题。",
      "de": "Audit accuracy, provenance, accessibility, performance, and theme.",
      "pz": "发布前检查准确性、来源、无障碍、性能和主题。 在大数据量、暗色、打印和中英文切换下复核。",
      "pe": "Audit accuracy, provenance, accessibility, performance, and theme. Validate scale, dark mode, print, and locale switching.",
      "demo": "list",
      "n": 4,
      "cells": ["坐标轴有单位","颜色不只靠色相","空状态有说明","读屏能读表"],
      "css": ".fxcol{gap:6px;width:196px}.fx{height:28px;border-radius:7px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#202824;font:500 10.5px/1 var(--fx-sans);justify-content:flex-start;padding:0 28px 0 11px;position:relative;animation:dva 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}.fx::after{content:'✓';position:absolute;right:10px;color:#3d7a52;font-family:var(--fx-mono);opacity:0;animation:dvac 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}@keyframes dva{0%,100%{opacity:.55}42%,66%{opacity:1}}@keyframes dvac{0%,100%{opacity:0}45%,72%{opacity:1}}"
    }
  ]
};

;
// Reviewed original-source references, 2026-09-27. Existing entries remain unchanged.
_atlasExpansion20260927_dataviz.items.push(...[
  {
    "id": "metric-drilldown",
    "zh": "图表指标下钻",
    "en": "Chart metric drilldown",
    "dz": "从图表中的聚合指标进入更细的数据层级，并保留当前选择与返回路径。",
    "de": "Move from an aggregate chart metric to finer data while retaining the selected context and a way back.",
    "pz": "原站示意把选中指标的细分内容放进详情浮层，并提供继续查看明细的链接。局部图表筛选与全页筛选应明确区分，说明条件应用到哪里；普通悬停数值提示若没有进入细分层级，就不构成下钻。 预览为官方静态模式示意；业务行为以原站说明为准。",
    "pe": "The source illustration presents a selected metric's breakdown in a details popover, with links to further detail. Distinguish chart-local filters from page-wide filters. A hover value alone is not drilldown without a finer data level. Preview: an official static pattern illustration; consult the source for workflow behavior.",
    "kz": [
      "指标下钻",
      "数据细分",
      "图表明细"
    ],
    "kw": [
      "metric drilldown",
      "data breakdown",
      "chart detail"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927/metric-drilldown.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "Chart metric drill down - Cloudscape Design System",
        "u": "cloudscape.design/patterns/general/data-vis/chart-metric-drill-down/#types-of-metric-drill-down"
      }
    ],
    "previewKind": "image",
    "previewUrl": "/effects-atlas/assets/expansion-20260927/metric-drilldown.png",
    "previewOrigin": "source",
    "sourceUrl": "https://cloudscape.design/patterns/general/data-vis/chart-metric-drill-down/#types-of-metric-drill-down",
    "checkedAt": "2026-09-27T01:38:33.585Z",
    "sourceEvidence": {
      "sourceId": "cloudscape-chart-drilldown",
      "previewSha256": "b9edd2b41652df8914ff1f1f14c23a24ed451e962017c8ff8871599a96f62aa2",
      "method": "official-static-illustration"
    },
    "offers": [],
    "author": "atlas-expansion-curator"
  }
]);
const _atlasExpansion_f1dd93589e91ef8f_dataviz = _atlasExpansion20260927_dataviz;

;
// Reviewed original-source references, 2026-09-27. Existing entries remain unchanged.

_atlasExpansion_f1dd93589e91ef8f_dataviz.items.push(...[
  {
    "id": "box-plot",
    "zh": "箱线图",
    "en": "Box plot",
    "dz": "用箱体、中位线和须概括分布，将范围之外的点单独呈现。",
    "de": "Summarize a distribution with a quartile box, median line and whiskers, separating outlying points.",
    "pz": "原例按 Expt 对 Speed 值分组，能看到各组箱体、须和额外散点。读图时需说明须与异常值的判定口径，不把分布箱体误读为估计值的置信区间。 预览为原站静态截图；交互示例见来源链接。",
    "pe": "The source groups Speed values by Expt, showing boxes, whiskers and separate points. State the whisker and outlier convention when using the chart; a distribution box is not a confidence interval for an estimate. Preview: a static screenshot of the original example; use the source link for interaction.",
    "kz": [
      "分布摘要",
      "中位数",
      "异常值"
    ],
    "kw": [
      "Distribution summary",
      "Median",
      "Outliers"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927-second/box-plot.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "Boxplot · AntV G2",
        "u": "g2.antv.antgroup.com/examples/general/box#boxplot-outlier"
      }
    ],
    "previewKind": "image",
    "previewOrigin": "source",
    "previewUrl": "/effects-atlas/assets/expansion-20260927-second/box-plot.png",
    "sourceUrl": "https://g2.antv.antgroup.com/examples/general/box#boxplot-outlier",
    "checkedAt": "2026-09-27T04:05:59.558Z",
    "sourceEvidence": {
      "sourceId": "antv-g2-boxplot",
      "previewSha256": "86c861895b3679b0f6caff77b11384b387e795a02e1cc35b3c2ddaea0dfab4bd",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-second-source-curator"
  },
  {
    "id": "conversion-funnel",
    "zh": "漏斗图",
    "en": "Funnel chart",
    "dz": "沿有序流程排列不同宽度的截面，展示各阶段的数量及收缩关系。",
    "de": "Arrange variable-width sections along an ordered process to show stage quantities and their reduction.",
    "pz": "原例依次展示浏览网站、放入购物车、生成订单、支付订单和完成交易，并直接标注阶段量值。阶段顺序应来自流程含义；需要展示比例时，另行明确分母。 预览为原站静态截图；交互示例见来源链接。",
    "pe": "The example follows website visits, cart additions, order creation, payment and completed transactions, labeling each stage’s quantity. Keep the process order explicit and state the denominator separately when adding rates. Preview: a static screenshot of the original example; use the source link for interaction.",
    "kz": [
      "流程阶段",
      "阶段量值",
      "留存与减少"
    ],
    "kw": [
      "Process stages",
      "Stage quantities",
      "Retention and reduction"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927-second/conversion-funnel.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "Funnel · AntV G2",
        "u": "g2.antv.antgroup.com/examples/general/funnel#funnel"
      }
    ],
    "previewKind": "image",
    "previewOrigin": "source",
    "previewUrl": "/effects-atlas/assets/expansion-20260927-second/conversion-funnel.png",
    "sourceUrl": "https://g2.antv.antgroup.com/examples/general/funnel#funnel",
    "checkedAt": "2026-09-27T04:12:40.401Z",
    "sourceEvidence": {
      "sourceId": "antv-g2-funnel-simple",
      "previewSha256": "d8546a93782a9ac8428f3adc2ac30bffa5013beb5b83a9cb82773f8e736decb2",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-second-source-curator"
  },
  {
    "id": "violin-plot",
    "zh": "小提琴图",
    "en": "Violin plot",
    "dz": "把数值分布的估计密度镜像展开，比较不同分组的集中区域与形状。",
    "de": "Mirror estimated density around an axis to compare the concentration and shape of grouped distributions.",
    "pz": "原例叠放核密度层和箱线层，比较三类鸢尾花在四项特征上的分布。外形宽度是密度估计，不能直接当作样本人数；平滑参数也会影响形状。 预览为原站静态截图；交互示例见来源链接。",
    "pe": "The example overlays kernel-density and box-plot layers for three iris species across four features. Width represents estimated density, not a direct sample count; smoothing choices also affect the shape. Preview: a static screenshot of the original example; use the source link for interaction.",
    "kz": [
      "密度估计",
      "分组分布",
      "镜像轮廓"
    ],
    "kw": [
      "Density estimation",
      "Grouped distributions",
      "Mirrored outlines"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927-second/violin-plot.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "Violin · AntV G2",
        "u": "g2.antv.antgroup.com/examples/general/violin#violin"
      }
    ],
    "previewKind": "image",
    "previewOrigin": "source",
    "previewUrl": "/effects-atlas/assets/expansion-20260927-second/violin-plot.png",
    "sourceUrl": "https://g2.antv.antgroup.com/examples/general/violin#violin",
    "checkedAt": "2026-09-27T04:06:30.093Z",
    "sourceEvidence": {
      "sourceId": "antv-g2-violin",
      "previewSha256": "337ff19613eac0c0c27da034ad1c81da8118724fae664b51c33727cf04c9adf0",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-second-source-curator"
  },
  {
    "id": "mosaic-chart",
    "zh": "马赛克图（Marimekko）",
    "en": "Mosaic chart (Marimekko)",
    "dz": "用列宽表达主类别总量，再用列内分段高度表达该类别的组成比例。",
    "de": "Encode category totals with column widths and each category’s composition with stacked segment heights.",
    "pz": "原例按市场总量调整横向宽度，再在各列内堆叠并归一化分群数值。因此要同时看列宽与段高，不能把两个同高色块直接解释为数量相等。 预览为原站静态截图；交互示例见来源链接。",
    "pe": "The example sizes markets horizontally by their totals, then stacks and normalizes segments within each column. Read width and height together; equal segment heights do not imply equal quantities across different-width columns. Preview: a static screenshot of the original example; use the source link for interaction.",
    "kz": [
      "可变列宽",
      "组成比例",
      "面积编码"
    ],
    "kw": [
      "Variable column width",
      "Composition ratios",
      "Area encoding"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927-second/mosaic-chart.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "Marimekko · AntV G2",
        "u": "g2.antv.antgroup.com/examples/general/interval#bar-marimekko"
      }
    ],
    "previewKind": "image",
    "previewOrigin": "source",
    "previewUrl": "/effects-atlas/assets/expansion-20260927-second/mosaic-chart.png",
    "sourceUrl": "https://g2.antv.antgroup.com/examples/general/interval#bar-marimekko",
    "checkedAt": "2026-09-27T04:06:45.364Z",
    "sourceEvidence": {
      "sourceId": "antv-g2-mosaic",
      "previewSha256": "dde03e093dc8bf93c57f007733667e8c10754e9fad8d78073ccbe5148bc1a992",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-second-source-curator"
  }
]);
// Shared Atlas A material palette for the authored chart illustrations.
export const ATLAS_A_TOKENS = Object.freeze({
  marbleWhite: '#F6F7F5', mistBlue: '#BFDDF4', mistBlueInk: '#587A94',
  crystalPink: '#F2CBDD', crystalPinkInk: '#8A677A', lakeGreen: '#C5E2D7', lakeGreenInk: '#58766B',
  ink: '#23232f', muted: '#77796f', axis: '#55574f', axisStrong: '#60635c',
  grid: '#e2e5dc', gridFine: '#e6e8df', gridSoft: '#d9e2e1', neutral: '#bfc6ba', slate: '#31363a', slateMid: '#6c7378',
});

// Locally authored, data-labelled SVGs for sixteen concepts absent from the current Atlas inventory.
// The histogram uses explicit contiguous bins; the KDE is computed from the listed sample values.
export function createAtlasAChartArt(tokens = ATLAS_A_TOKENS) {
  const paletteStyle = `<style>:root{${Object.entries(tokens).map(([name,value]) => `--${name}:${value}`).join(';')}}</style>`;
  const uri = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const shell = (title, subtitle, xLabel, yLabel, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" role="img">${paletteStyle}<text x="28" y="28" fill="var(--ink)" font-family="Arial,sans-serif" font-size="16" font-weight="700">${title}</text><text x="28" y="47" fill="var(--muted)" font-family="Arial,sans-serif" font-size="10">${subtitle}</text>${body}<text x="238" y="286" text-anchor="middle" fill="var(--axis)" font-family="Arial,sans-serif" font-size="10">${xLabel}</text><text x="13" y="145" text-anchor="middle" transform="rotate(-90 13 145)" fill="var(--axis)" font-family="Arial,sans-serif" font-size="10">${yLabel}</text></svg>`;
  const hist = (zh) => {
    const bins = [2, 6, 11, 15, 12, 7, 3], left = 62, top = 74, width = 350, height = 158, max = 15, bw = width / bins.length;
    const grid = [0, 5, 10, 15].map(v => { const y = top + height - v / max * height; return `<line x1="${left}" y1="${y}" x2="${left+width}" y2="${y}" stroke="var(--gridFine)"/><text x="${left-9}" y="${y+3}" text-anchor="end" fill="var(--muted)" font-size="9">${v}</text>`; }).join('');
    const bars = bins.map((v,i) => { const h=v/max*height, x=left+i*bw, y=top+height-h; return `<rect x="${x}" y="${y}" width="${bw+0.5}" height="${h}" fill="var(--mistBlue)" stroke="var(--mistBlueInk)" stroke-width=".7"/><text x="${x+bw/2}" y="${y-5}" text-anchor="middle" fill="var(--axis)" font-size="9">${v}</text><text x="${x+bw/2}" y="${top+height+14}" text-anchor="middle" fill="var(--muted)" font-size="8">${i*10}–${(i+1)*10}</text>`; }).join('');
    const body=`${grid}${bars}<line x1="${left}" y1="${top+height}" x2="${left+width}" y2="${top+height}" stroke="var(--axisStrong)"/><line x1="${left}" y1="${top}" x2="${left}" y2="${top+height}" stroke="var(--axisStrong)"/><text x="${left+width}" y="${top-8}" text-anchor="end" fill="var(--muted)" font-size="9">n = 56</text>`;
    return uri(shell(zh?'直方图 · 示例频数':'Histogram · example counts',zh?'连续测量值按区间计数；相邻箱无缝相接':'Continuous measurements counted in intervals; adjacent bins touch',zh?'测量区间':'Measurement interval',zh?'频数':'Count',body));
  };
  const density = (zh) => {
    const samples=[3.6,4.2,4.5,4.8,4.9,5.1,5.3,5.5,5.9,6.3,6.6,7.0], h=.5, xs=Array.from({length:41},(_,i)=>3+i*.125);
    const ds=xs.map(x=>samples.reduce((sum,v)=>sum+Math.exp(-.5*((x-v)/h)**2),0)/(samples.length*h*Math.sqrt(2*Math.PI)));
    const max=Math.max(...ds)*1.12,left=58,top=72,width=360,height=158;
    const pts=ds.map((v,i)=>`${left+i/(ds.length-1)*width},${top+height-v/max*height}`);
    const path=`M ${left},${top+height} L ${pts.join(' L ')} L ${left+width},${top+height} Z`;
    const line=`M ${pts.join(' L ')}`;
    const grid=[0,.1,.2,.3,.4].map(v=>{const y=top+height-v/max*height;if(y<top)return '';return `<line x1="${left}" y1="${y}" x2="${left+width}" y2="${y}" stroke="var(--gridFine)"/><text x="${left-8}" y="${y+3}" text-anchor="end" fill="var(--muted)" font-size="9">${v.toFixed(1)}</text>`}).join('');
    const rug=samples.map(v=>{const x=left+(v-3)/5*width;return `<line x1="${x}" y1="${top+height+3}" x2="${x}" y2="${top+height+9}" stroke="var(--lakeGreenInk)" stroke-width="1.5"/>`}).join('');
    const body=`${grid}<path d="${path}" fill="var(--mistBlue)" fill-opacity=".62"/><path d="${line}" fill="none" stroke="var(--mistBlueInk)" stroke-width="2.5"/><line x1="${left}" y1="${top+height}" x2="${left+width}" y2="${top+height}" stroke="var(--axisStrong)"/>${rug}<text x="${left}" y="${top+height+21}" text-anchor="middle" fill="var(--muted)" font-size="9">3</text><text x="${left+width/2}" y="${top+height+21}" text-anchor="middle" fill="var(--muted)" font-size="9">5.5</text><text x="${left+width}" y="${top+height+21}" text-anchor="middle" fill="var(--muted)" font-size="9">8</text><text x="${left+width}" y="${top-8}" text-anchor="end" fill="var(--muted)" font-size="9">n = 12 · h = 0.5</text>`;
    return uri(shell(zh?'Density plot · Gaussian KDE':'Density plot · Gaussian KDE',zh?'由列出的 12 个样本与带宽 h = 0.5 计算；下方短线为观测值':'Computed from the 12 listed samples with bandwidth h = 0.5; rug marks show observations',zh?'观测值':'Observed value',zh?'概率密度':'Density',body));
  };
  const matrix = (zh) => {
    const values=Array.from({length:100},(_,i)=>i<46?0:i<80?1:2), colors=['var(--mistBlue)','var(--crystalPink)','var(--lakeGreen)'],strokes=['var(--mistBlueInk)','var(--crystalPinkInk)','var(--lakeGreenInk)'],labels=zh?['A · 46 (46%)','B · 34 (34%)','C · 20 (20%)']:['A · 46 (46%)','B · 34 (34%)','C · 20 (20%)'];
    const dots=values.map((v,i)=>{const x=82+(i%10)*28,y=82+Math.floor(i/10)*18;return `<circle cx="${x}" cy="${y}" r="5.5" fill="${colors[v]}" stroke="${strokes[v]}" stroke-width=".7"/>`}).join('');
    const legend=labels.map((label,i)=>{const x=70+i*132;return `<circle cx="${x}" cy="270" r="4" fill="${colors[i]}" stroke="${strokes[i]}" stroke-width=".7"/><text x="${x+9}" y="273" fill="var(--axis)" font-size="9">${label}</text>`}).join('');
    const body=`<text x="82" y="66" fill="var(--muted)" font-size="9">${zh?'每个圆点代表 1 个单位 · 总数 100':'1 dot = 1 unit · total 100'}</text>${dots}${legend}`;
    return uri(shell(zh?'点矩阵图 · 100 个单位':'Dot matrix chart · 100 units',zh?'类别按行读取；颜色编码类别，各点等权':'Read rows left to right; color encodes category and every dot has equal weight','','',body));
  };
  const errorBars = (zh) => {
    const rows=[{name:'A',mean:4.2,lo:3.6,hi:4.8},{name:'B',mean:5.1,lo:4.3,hi:5.9},{name:'C',mean:6.3,lo:5.5,hi:7.1}], left=80,top=86,width=340;
    const x=v=>left+v/10*width;
    const ticks=[0,2,4,6,8,10].map(v=>`<line x1="${x(v)}" y1="${top-14}" x2="${x(v)}" y2="${top+126}" stroke="var(--gridFine)"/><text x="${x(v)}" y="${top+143}" text-anchor="middle" fill="var(--muted)" font-size="9">${v}</text>`).join('');
    const marks=rows.map((r,i)=>{const y=top+i*44;return `<text x="64" y="${y+4}" text-anchor="end" fill="var(--axis)" font-size="10">${r.name}</text><line x1="${x(r.lo)}" y1="${y}" x2="${x(r.hi)}" y2="${y}" stroke="var(--mistBlueInk)" stroke-width="2.5"/><line x1="${x(r.lo)}" y1="${y-6}" x2="${x(r.lo)}" y2="${y+6}" stroke="var(--mistBlueInk)" stroke-width="2"/><line x1="${x(r.hi)}" y1="${y-6}" x2="${x(r.hi)}" y2="${y+6}" stroke="var(--mistBlueInk)" stroke-width="2"/><circle cx="${x(r.mean)}" cy="${y}" r="4.5" fill="var(--crystalPinkInk)"/><text x="${x(r.mean)}" y="${y-9}" text-anchor="middle" fill="var(--axis)" font-size="8">${r.mean.toFixed(1)}</text>`}).join('');
    const body=`${ticks}${marks}<text x="${left+width}" y="${top-22}" text-anchor="end" fill="var(--muted)" font-size="9">${zh?'● 均值　线段 = 95% CI':'● mean　line = 95% CI'}</text>`;
    return uri(shell(zh?'Error bars · illustrative estimates':'Error bars · illustrative estimates',zh?'区间含义已标注为 95% CI；示例数值并非来自实测':'Intervals are labeled 95% CI; example values are not measured data',zh?'估计值':'Estimate',zh?'组别':'Group',body));
  };

  const parallelSets = (zh) => {
    const flows=[
      {r:'N',d:'D',p:'B',n:18},{r:'N',d:'D',p:'P',n:12},{r:'N',d:'M',p:'B',n:14},{r:'N',d:'M',p:'P',n:16},
      {r:'S',d:'D',p:'B',n:8},{r:'S',d:'D',p:'P',n:7},{r:'S',d:'M',p:'B',n:9},{r:'S',d:'M',p:'P',n:16}
    ];
    const cats={r:['N','S'],d:['D','M'],p:['B','P']}, tops={r:88,d:88,p:88}, scale=1.35, gap=8;
    const sorters={r:(a,b)=>a.d.localeCompare(b.d)||a.p.localeCompare(b.p),d:(a,b)=>a.r.localeCompare(b.r)||a.p.localeCompare(b.p),p:(a,b)=>a.r.localeCompare(b.r)||a.d.localeCompare(b.d)};
    const blocks={};
    for(const k of ['r','d','p']){let y=tops[k];blocks[k]=[];for(const category of cats[k]){const group=flows.filter(f=>f[k]===category).sort(sorters[k]);const total=group.reduce((s,f)=>s+f.n,0);blocks[k].push({category,y,height:total*scale,total});for(const f of group){f['y'+k]=y;y+=f.n*scale}y+=gap}}
    const xs={r:120,d:245,p:370}, bw=14, regionColor={N:'var(--mistBlue)',S:'var(--crystalPink)'}, regionStroke={N:'var(--mistBlueInk)',S:'var(--crystalPinkInk)'};
    const ribbons=flows.map(f=>{const h=f.n*scale,c=regionColor[f.r],stroke=regionStroke[f.r];return ['r','d'].map((a,i)=>{const b=i?'p':'d',x0=xs[a]+bw,x1=xs[b],y0=f['y'+a],y1=f['y'+b],m=(x0+x1)/2;return `<path d="M ${x0} ${y0} C ${m} ${y0},${m} ${y1},${x1} ${y1} L ${x1} ${y1+h} C ${m} ${y1+h},${m} ${y0+h},${x0} ${y0+h} Z" fill="${c}" fill-opacity=".46" stroke="${stroke}" stroke-opacity=".42" stroke-width=".7"/>`}).join('')}).join('');
    const blocksSvg=['r','d','p'].map(k=>blocks[k].map(b=>{const c=k==='r'?regionColor[b.category]:'var(--marbleWhite)',x=xs[k];const label=k==='r'?(zh?(b.category==='N'?'北区':'南区'):(b.category==='N'?'North':'South')):k==='d'?(zh?(b.category==='D'?'桌面':'移动'):(b.category==='D'?'Desktop':'Mobile')):(zh?(b.category==='B'?'基础':'专业'):(b.category==='B'?'Basic':'Pro'));const side=k==='r'?-7: x+bw+7;const anchor=k==='r'?'end':'start';return `<rect x="${x}" y="${b.y}" width="${bw}" height="${b.height}" fill="${c}" stroke="var(--axisStrong)" stroke-width=".7"/><text x="${side}" y="${b.y+b.height/2+3}" text-anchor="${anchor}" fill="var(--axis)" font-size="9">${label} ${b.total}</text>`}).join('')).join('');
    const headers=(zh?[[xs.r,'地区'],[xs.d,'设备'],[xs.p,'方案']]:[[xs.r,'Region'],[xs.d,'Device'],[xs.p,'Plan']]).map(([x,t])=>`<text x="${x+bw/2}" y="75" text-anchor="middle" fill="var(--axis)" font-size="9" font-weight="600">${t}</text>`).join('');
    const body=`${headers}${ribbons}${blocksSvg}<text x="${xs.r}" y="259" fill="var(--axis)" font-size="9">● ${zh?'北区':'North'}　● ${zh?'南区':'South'}</text><circle cx="${xs.r+4}" cy="256" r="3" fill="var(--mistBlue)"/><circle cx="${xs.r+60}" cy="256" r="3" fill="var(--crystalPink)"/><text x="438" y="76" text-anchor="end" fill="var(--muted)" font-size="9">n = 100</text>`;
    return uri(shell(zh?'平行集 · 订单流量':'Parallel sets · order flows',zh?'三组分类维度；流带宽度随记录数变化，不使用箭头':'Three categorical dimensions; ribbon width tracks record count, with no arrows','','',body));
  };
  const populationPyramid = (zh) => {
    const ages=['60+','45–59','30–44','15–29','0–14'],male=[5,8,12,16,18],female=[7,10,13,15,17],center=240,zeroL=216,zeroR=264,scale=6.8,top=94,row=29;
    const bars=ages.map((age,i)=>{const y=top+i*row,wM=male[i]*scale,wF=female[i]*scale;return `<rect x="${zeroL-wM}" y="${y}" width="${wM}" height="18" fill="var(--mistBlue)" stroke="var(--mistBlueInk)" stroke-width=".6"/><rect x="${zeroR}" y="${y}" width="${wF*1.0}" height="18" fill="var(--crystalPink)" stroke="var(--crystalPinkInk)" stroke-width=".6"/><text x="${center}" y="${y+13}" text-anchor="middle" fill="var(--axis)" font-size="9">${age}</text><text x="${zeroL-wM-4}" y="${y+12}" text-anchor="end" fill="var(--mistBlueInk)" font-size="8">${male[i]}</text><text x="${zeroR+wF+4}" y="${y+12}" fill="var(--crystalPinkInk)" font-size="8">${female[i]}</text>`}).join('');
    const ticks=[0,10,20].map(v=>{const xl=zeroL-v*scale,xr=zeroR+v*scale;return `<line x1="${xl}" y1="85" x2="${xl}" y2="245" stroke="var(--gridFine)"/><line x1="${xr}" y1="85" x2="${xr}" y2="245" stroke="var(--gridFine)"/><text x="${xl}" y="254" text-anchor="middle" fill="var(--muted)" font-size="8">${v}</text><text x="${xr}" y="254" text-anchor="middle" fill="var(--muted)" font-size="8">${v}</text>`}).join('');
    const body=`<text x="${zeroL-55}" y="76" fill="var(--mistBlueInk)" font-size="9">${zh?'男性':'Male'}</text><text x="${zeroR+42}" y="76" fill="var(--crystalPinkInk)" font-size="9">${zh?'女性':'Female'}</text><text x="${zeroL}" y="76" text-anchor="middle" fill="var(--muted)" font-size="8">${zh?'千人':'thousands'}</text>${ticks}${bars}<line x1="${zeroL}" y1="84" x2="${zeroL}" y2="245" stroke="var(--axisStrong)"/><line x1="${zeroR}" y1="84" x2="${zeroR}" y2="245" stroke="var(--axisStrong)"/><text x="${center}" y="274" text-anchor="middle" fill="var(--muted)" font-size="9">${zh?'年龄组':'Age group'}</text><text x="440" y="75" text-anchor="end" fill="var(--muted)" font-size="8">n = 121k · ${zh?'示意':'illustrative'}</text>`;
    return uri(shell(zh?'人口金字塔 · 示例人口':'Population pyramid · example population',zh?'左右镜像展示年龄组人口；数值为示意，单位千人':'Mirror age-group population around a shared center; illustrative values in thousands','','',body));
  };
  const stemLeaf = (zh) => {
    const body=`<rect x="72" y="80" width="336" height="167" rx="8" fill="var(--marbleWhite)" stroke="var(--grid)"/><text x="120" y="105" text-anchor="middle" fill="var(--axis)" font-family="Arial,sans-serif" font-size="10" font-weight="600">${zh?'茎（十位）':'Stem (tens)'}</text><text x="280" y="105" text-anchor="middle" fill="var(--axis)" font-family="Arial,sans-serif" font-size="10" font-weight="600">${zh?'叶（个位）':'Leaf (ones)'}</text><line x1="194" y1="91" x2="194" y2="218" stroke="var(--neutral)"/><g fill="var(--ink)" font-family="ui-monospace,monospace" font-size="16"><text x="142" y="139" text-anchor="end">0</text><text x="142" y="171" text-anchor="end">1</text><text x="142" y="203" text-anchor="end">2</text><text x="216" y="139">2 4</text><text x="216" y="171">1 7</text><text x="216" y="203">0 3</text></g><text x="240" y="236" text-anchor="middle" fill="var(--muted)" font-family="Arial,sans-serif" font-size="9">${zh?'键：1 | 7 = 17　·　n = 6':'Key: 1 | 7 = 17　·　n = 6'}</text><text x="408" y="72" text-anchor="end" fill="var(--muted)" font-size="9">${zh?'排序后的原始值':'sorted raw values'}</text>`;
    return uri(shell(zh?'茎叶图 · 保留原始数值':'Stem-and-leaf plot · raw values retained',zh?'按十位分组，个位叶按升序排列；示例数据：2、4、11、17、20、23':'Group by tens and sort the ones digits; example data: 2, 4, 11, 17, 20, 23','','',body));
  };
  const venn = (zh) => {
    const universe='<rect x="88" y="60" width="332" height="234" rx="7" fill="none" stroke="var(--axisStrong)" stroke-width="1.5"/><text x="98" y="77" fill="var(--axisStrong)" font-size="10" font-weight="700">U</text>';
    const circles=`<circle cx="190" cy="158" r="70" fill="var(--mistBlue)" fill-opacity=".24" stroke="var(--mistBlueInk)" stroke-width="2"/><circle cx="290" cy="158" r="70" fill="var(--crystalPink)" fill-opacity=".24" stroke="var(--crystalPinkInk)" stroke-width="2"/><circle cx="240" cy="220" r="70" fill="var(--lakeGreen)" fill-opacity=".24" stroke="var(--lakeGreenInk)" stroke-width="2"/>`;
    const labels=`<text x="144" y="107" fill="var(--mistBlueInk)" font-size="11" font-weight="700">A</text><text x="326" y="107" fill="var(--crystalPinkInk)" font-size="11" font-weight="700">B</text><text x="240" y="296" text-anchor="middle" fill="var(--lakeGreenInk)" font-size="11" font-weight="700">C</text><g fill="var(--slate)" font-family="ui-monospace,monospace" font-size="10"><text x="157" y="162">a</text><text x="321" y="162">e</text><text x="240" y="269" text-anchor="middle">g</text><text x="240" y="122" text-anchor="middle">c</text><text x="201" y="211" text-anchor="middle">b</text><text x="279" y="211" text-anchor="middle">f</text><text x="240" y="182" text-anchor="middle" font-weight="700">d</text><text x="390" y="248" text-anchor="middle">h</text></g><text x="390" y="264" text-anchor="middle" fill="var(--muted)" font-size="8">${zh?'在 U 内、集合外':'in U, outside A/B/C'}</text>`;
    const body=`${universe}${circles}${labels}<text x="438" y="76" text-anchor="end" fill="var(--muted)" font-size="8">${zh?'集合成员示意，不按面积编码':'membership example; area is not quantitative'}</text>`;
    return uri(shell(zh?'维恩图 · 三集合关系':'Venn diagram · three-set relations',zh?'显示三组集合的全部交集；字母代表元素，不按区域面积表示数量':'Show all intersections of three sets; letters are elements, not area-scaled counts','','',body));
  };
  const arcDiagram = (zh) => {
    const nodes=[{x:84,label:'A'},{x:162,label:'B'},{x:240,label:'C'},{x:318,label:'D'},{x:396,label:'E'}], edges=[{a:0,b:1,n:4},{a:0,b:3,n:2},{a:1,b:2,n:3},{a:1,b:4,n:2},{a:2,b:4,n:1}];
    const arcs=edges.map((e,i)=>{const a=nodes[e.a],b=nodes[e.b],mid=(a.x+b.x)/2,span=b.x-a.x,peak=180-Math.min(92,span*.58),color=i%2?'var(--crystalPinkInk)':'var(--mistBlueInk)';return `<path d="M ${a.x} 190 Q ${mid} ${peak} ${b.x} 190" fill="none" stroke="${color}" stroke-width="${1+e.n*.55}" stroke-linecap="round"/><text x="${mid}" y="${peak+13}" text-anchor="middle" fill="var(--axis)" font-size="8">${e.n}</text>`}).join('');
    const marks=nodes.map(n=>`<circle cx="${n.x}" cy="190" r="5" fill="var(--lakeGreen)" stroke="var(--lakeGreenInk)" stroke-width="1.2"/><text x="${n.x}" y="210" text-anchor="middle" fill="var(--axis)" font-size="10" font-weight="700">${n.label}</text>`).join('');
    const body=`<text x="65" y="72" fill="var(--muted)" font-size="9">${zh?'节点沿一条线排列':'Nodes share one line'}</text>${arcs}<line x1="58" y1="190" x2="422" y2="190" stroke="var(--axisStrong)"/>${marks}<text x="240" y="244" text-anchor="middle" fill="var(--muted)" font-size="9">${zh?'线宽与数字 = 共现次数；无方向':'width and number = co-occurrences; undirected'}</text><text x="438" y="72" text-anchor="end" fill="var(--axis)" font-size="9">total = 12 co-occurrences</text>`;
    return uri(shell(zh?'弧线图 · 关系共现':'Arc diagram · co-occurrence',zh?'节点在一维轴上；弧线连接关系，线宽表示共现次数':'Nodes lie on one axis; arc width encodes co-occurrence','','',body));
  };
  const flowChart = (zh) => {
    const arrow='<defs><marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="var(--axisStrong)"/></marker></defs>';
    const body=`${arrow}<rect x="192" y="63" width="96" height="30" rx="15" fill="var(--lakeGreen)" stroke="var(--lakeGreenInk)"/><text x="240" y="82" text-anchor="middle" fill="var(--axis)" font-size="9" font-weight="700">${zh?'开始':'Start'}</text><path d="M240 93 V108" stroke="var(--axisStrong)" marker-end="url(#arr)"/><rect x="184" y="111" width="112" height="34" rx="2" fill="var(--mistBlue)" stroke="var(--mistBlueInk)"/><text x="240" y="132" text-anchor="middle" fill="var(--axis)" font-size="9">${zh?'检查输入':'Check input'}</text><path d="M240 145 V157" stroke="var(--axisStrong)" marker-end="url(#arr)"/><path d="M240 157 L292 188 L240 219 L188 188 Z" fill="var(--marbleWhite)" stroke="var(--crystalPinkInk)" stroke-width="1.3"/><text x="240" y="185" text-anchor="middle" fill="var(--axis)" font-size="8">${zh?'有效？':'Valid?'}</text><path d="M188 188 H112 V230" fill="none" stroke="var(--axisStrong)" marker-end="url(#arr)"/><text x="148" y="181" fill="var(--muted)" font-size="8">${zh?'是':'Yes'}</text><rect x="60" y="232" width="104" height="28" rx="14" fill="var(--lakeGreen)" stroke="var(--lakeGreenInk)"/><text x="112" y="250" text-anchor="middle" fill="var(--axis)" font-size="8">${zh?'通过 · 结束':'Accept · End'}</text><path d="M292 188 H366 V230" fill="none" stroke="var(--axisStrong)" marker-end="url(#arr)"/><text x="326" y="181" fill="var(--muted)" font-size="8">${zh?'否':'No'}</text><rect x="314" y="232" width="104" height="28" rx="2" fill="var(--crystalPink)" stroke="var(--crystalPinkInk)"/><text x="366" y="250" text-anchor="middle" fill="var(--axis)" font-size="8">${zh?'补充材料':'Add evidence'}</text><path d="M366 232 V128 H298" fill="none" stroke="var(--axisStrong)" marker-end="url(#arr)" stroke-dasharray="3 2"/>`;
    return uri(shell(zh?'流程图 · 输入检查':'Flow chart · input check',zh?'圆角框为起止；矩形为操作；菱形为判断，箭头标出方向':'Terminals, action rectangles and a decision diamond; arrows show direction','','',body));
  };
  const tallyChart = (zh) => {
    const rows=[['A',6],['B',8],['C',4],['D',7]], x0=132,top=101,row=37, step=9;
    const tally=(count,y)=>{let out='',groups=Math.floor(count/5),rest=count%5;for(let g=0;g<groups;g++){const x=x0+g*50;for(let i=0;i<4;i++)out+=`<line x1="${x+i*step}" y1="${y-12}" x2="${x+i*step}" y2="${y+5}" stroke="var(--mistBlueInk)" stroke-width="1.8"/>`;out+=`<line x1="${x-2}" y1="${y+5}" x2="${x+29}" y2="${y-12}" stroke="var(--crystalPinkInk)" stroke-width="2"/>`}const x=x0+groups*50;for(let i=0;i<rest;i++)out+=`<line x1="${x+i*step}" y1="${y-12}" x2="${x+i*step}" y2="${y+5}" stroke="var(--mistBlueInk)" stroke-width="1.8"/>`;return out};
    const body=`<text x="68" y="78" fill="var(--axis)" font-size="9" font-weight="700">${zh?'类别':'Category'}</text><text x="132" y="78" fill="var(--axis)" font-size="9" font-weight="700">${zh?'划记（每组五个）':'Tally marks (groups of five)'}</text><text x="414" y="78" text-anchor="end" fill="var(--axis)" font-size="9" font-weight="700">${zh?'总数':'Total'}</text>${rows.map(([label,count],i)=>{const y=top+i*row;return `<line x1="66" y1="${y+13}" x2="414" y2="${y+13}" stroke="var(--gridFine)"/><text x="72" y="${y}" fill="var(--axis)" font-size="10">${label}</text>${tally(count,y)}<text x="408" y="${y}" text-anchor="end" fill="var(--axis)" font-size="10" font-weight="700">${count}</text>`}).join('')}<text x="414" y="258" text-anchor="end" fill="var(--muted)" font-size="9">n = 25</text>`;
    return uri(shell(zh?'划记表 · 类别频数':'Tally chart · category counts',zh?'每个观测增加一划；第五划斜穿前四划，右侧列出合计':'One mark per observation; the fifth crosses four, with totals at right','','',body));
  };
  const wordCloud = (zh) => {
    const words=[{w:'mask',n:18,x:128,y:121,s:31,c:'var(--mistBlueInk)'},{w:'crop',n:13,x:294,y:111,s:25,c:'var(--crystalPinkInk)'},{w:'alpha',n:11,x:138,y:171,s:22,c:'var(--lakeGreenInk)'},{w:'vector',n:9,x:308,y:169,s:19,c:'var(--mistBlueInk)'},{w:'filter',n:7,x:115,y:216,s:16,c:'var(--crystalPinkInk)'},{w:'blend',n:6,x:254,y:216,s:15,c:'var(--lakeGreenInk)'},{w:'resize',n:4,x:362,y:216,s:13,c:'var(--mistBlueInk)'}];
    const body=`${words.map(a=>`<text x="${a.x}" y="${a.y}" text-anchor="middle" fill="${a.c}" font-family="Arial,sans-serif" font-size="${a.s}" font-weight="700">${a.w}<tspan dx="3" font-size="8" font-weight="400" fill="var(--muted)">${a.n}</tspan></text>`).join('')}<text x="240" y="256" text-anchor="middle" fill="var(--muted)" font-size="9">${zh?'字体大小随词频增加；颜色仅作装饰':'type size rises with frequency; color is decorative'}</text><text x="438" y="72" text-anchor="end" fill="var(--axis)" font-size="9">${zh?'示例提及次数':'example mentions'}</text>`;
    return uri(shell(zh?'词云 · 词频':'Word cloud · term frequency',zh?'关键词大小表示频次；颜色不承载第二个变量':'Keyword size encodes frequency; color carries no second variable','','',body));
  };
  const flowMap = (zh) => {
    const defs='<defs><marker id="flowArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="var(--slateMid)"/></marker></defs>';
    const land='<path d="M63 116 C90 76 160 71 201 90 C241 67 309 85 328 113 C380 110 420 148 402 197 C388 230 347 242 313 228 C271 252 218 235 193 221 C144 238 95 209 83 181 C61 165 52 139 63 116Z" fill="var(--marbleWhite)" stroke="var(--grid)" stroke-width="1.2"/><path d="M82 143 C160 123 238 151 386 124 M94 196 C174 168 262 192 382 211 M177 91 C187 135 197 183 214 232 M315 92 C302 138 323 189 347 229" fill="none" stroke="var(--gridFine)" stroke-width=".8"/>';
    const nodes=[{x:114,y:127,label:zh?'西港':'West'},{x:250,y:101,label:zh?'北湾':'North'},{x:211,y:210,label:zh?'中城':'Central'},{x:354,y:176,label:zh?'东港':'East'}];
    const routes=[{a:0,b:1,n:8},{a:0,b:2,n:6},{a:1,b:3,n:4},{a:2,b:3,n:2}], colors=['var(--mistBlueInk)','var(--crystalPinkInk)','var(--lakeGreenInk)','var(--slateMid)'];
    const paths=routes.map((r,i)=>{const a=nodes[r.a],b=nodes[r.b],mx=(a.x+b.x)/2,my=(a.y+b.y)/2-18;return `<path d="M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="${colors[i]}" stroke-width="${1+r.n*.42}" stroke-linecap="round" marker-end="url(#flowArrow)"/><text x="${mx}" y="${my-5}" text-anchor="middle" fill="var(--axis)" font-size="8">${r.n}</text>`}).join('');
    const dots=nodes.map(n=>`<circle cx="${n.x}" cy="${n.y}" r="8" fill="var(--lakeGreen)" stroke="var(--lakeGreenInk)" stroke-width="1.2"/><text x="${n.x}" y="${n.y+21}" text-anchor="middle" fill="var(--axis)" font-size="8">${n.label}</text>`).join('');
    const body=`${defs}${land}${paths}${dots}<text x="430" y="75" text-anchor="end" fill="var(--axis)" font-size="8">${zh?'示意地点；路线总量 20':'schematic places · route total 20'}</text><text x="240" y="267" text-anchor="middle" fill="var(--muted)" font-size="8">${zh?'线宽 = 路线数量　箭头 = 流向':'width = route volume · arrows = direction'}</text>`;
    return uri(shell(zh?'流向地图 · 路线迁移':'Flow map · route movement',zh?'在空间位置上绘制有方向的迁移路线；线宽表示路线数量':'Directional routes connect spatial locations; line width encodes volume','','',body));
  };
  const networkDiagram = (zh) => {
    const nodes=[{x:100,y:110,t:'A',c:'var(--mistBlue)'},{x:165,y:75,t:'B',c:'var(--mistBlue)'},{x:218,y:136,t:'C',c:'var(--mistBlue)'},{x:305,y:92,t:'D',c:'var(--crystalPink)'},{x:380,y:151,t:'E',c:'var(--crystalPink)'},{x:314,y:221,t:'F',c:'var(--crystalPink)'}];
    const edges=[[0,1],[0,2],[1,2],[2,3],[3,4],[3,5],[4,5]], lines=edges.map(([a,b])=>`<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke="var(--slateMid)" stroke-opacity=".7" stroke-width="1.4"/>`).join('');
    const circles=nodes.map(n=>`<circle cx="${n.x}" cy="${n.y}" r="13" fill="${n.c}" stroke="${n.c==='var(--mistBlue)'?'var(--mistBlueInk)':'var(--crystalPinkInk)'}" stroke-width="1.2"/><text x="${n.x}" y="${n.y+3}" text-anchor="middle" fill="var(--ink)" font-size="9" font-weight="700">${n.t}</text>`).join('');
    const body=`<rect x="61" y="57" width="183" height="198" rx="18" fill="var(--mistBlue)" fill-opacity=".12" stroke="var(--mistBlueInk)" stroke-opacity=".26" stroke-dasharray="3 3"/><rect x="268" y="57" width="164" height="198" rx="18" fill="var(--crystalPink)" fill-opacity=".13" stroke="var(--crystalPinkInk)" stroke-opacity=".24" stroke-dasharray="3 3"/>${lines}${circles}<text x="152" y="250" text-anchor="middle" fill="var(--mistBlueInk)" font-size="8">${zh?'群组 A':'Group A'}</text><text x="349" y="250" text-anchor="middle" fill="var(--crystalPinkInk)" font-size="8">${zh?'群组 B':'Group B'}</text><text x="438" y="72" text-anchor="end" fill="var(--muted)" font-size="8">${zh?'无向关系；C–D 为跨组连接':'undirected · C–D bridges groups'}</text>`;
    return uri(shell(zh?'网络图 · 节点关系':'Network diagram · node links',zh?'节点表示实体、连线表示关系；空间布局突出两个群组与跨组连接':'Nodes are entities and lines are relationships; layout shows two clusters and their bridge','','',body));
  };
  const sankey = (zh) => {
    const defs='<defs><marker id="sankeyArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--slateMid)"/></marker></defs>';
    const band=(x0,x1,y0,y1,h,color)=>{const m=(x0+x1)/2;return `<path d="M${x0} ${y0} C${m} ${y0},${m} ${y1},${x1} ${y1} L${x1} ${y1+h} C${m} ${y1+h},${m} ${y0+h},${x0} ${y0+h} Z" fill="${color}" fill-opacity=".48" stroke="${color}" stroke-opacity=".5" stroke-width=".65"/>`};
    const bands=band(150,205,105,87,78,'var(--mistBlueInk)')+band(150,205,183,195,42,'var(--crystalPinkInk)')+band(310,352,87,90,48,'var(--mistBlueInk)')+band(310,352,135,178,30,'var(--lakeGreenInk)');
    const arrows='<path d="M169 146 H187" stroke="var(--slateMid)" stroke-width="1.2" marker-end="url(#sankeyArrow)"/><path d="M169 204 H187" stroke="var(--slateMid)" stroke-width="1.2" marker-end="url(#sankeyArrow)"/><path d="M322 111 H339" stroke="var(--slateMid)" stroke-width="1.2" marker-end="url(#sankeyArrow)"/><path d="M322 150 H339" stroke="var(--slateMid)" stroke-width="1.2" marker-end="url(#sankeyArrow)"/>';
    const nodes=`<rect x="58" y="105" width="92" height="120" rx="3" fill="var(--marbleWhite)" stroke="var(--axisStrong)"/><text x="104" y="162" text-anchor="middle" fill="var(--axis)" font-size="10" font-weight="700">${zh?'访问 100':'Visit 100'}</text><rect x="205" y="87" width="105" height="78" rx="3" fill="var(--mistBlue)" stroke="var(--mistBlueInk)"/><text x="257" y="130" text-anchor="middle" fill="var(--axis)" font-size="9" font-weight="700">${zh?'继续 65':'Continue 65'}</text><rect x="205" y="195" width="105" height="42" rx="3" fill="var(--crystalPink)" stroke="var(--crystalPinkInk)"/><text x="257" y="220" text-anchor="middle" fill="var(--axis)" font-size="8">${zh?'退出 35':'Exit 35'}</text><rect x="352" y="90" width="94" height="48" rx="3" fill="var(--lakeGreen)" stroke="var(--lakeGreenInk)"/><text x="399" y="119" text-anchor="middle" fill="var(--axis)" font-size="8" font-weight="700">${zh?'完成 40':'Complete 40'}</text><rect x="352" y="178" width="94" height="30" rx="3" fill="var(--marbleWhite)" stroke="var(--axisStrong)"/><text x="399" y="197" text-anchor="middle" fill="var(--axis)" font-size="8">${zh?'离开 25':'Leave 25'}</text>`;
    const body=`${defs}<text x="104" y="74" text-anchor="middle" fill="var(--muted)" font-size="8">${zh?'入口':'Entry'}</text><text x="257" y="74" text-anchor="middle" fill="var(--muted)" font-size="8">${zh?'后续':'Next'}</text><text x="399" y="74" text-anchor="middle" fill="var(--muted)" font-size="8">${zh?'结果':'Outcome'}</text>${bands}${arrows}${nodes}<text x="438" y="253" text-anchor="end" fill="var(--muted)" font-size="8">${zh?'流带宽度 ∝ 数量；示例总量 100':'band width ∝ flow · example total 100'}</text>`;
    return uri(shell(zh?'桑基图 · 会话流量':'Sankey diagram · session flow',zh?'相邻阶段之间以带宽表示流量数量；分支可拆分，方向由左向右':'Band width encodes quantity between stages; flows split and move left to right','','',body));
  };
  const chordDiagram = (zh) => {
    const nodes=[{x:240,y:84,l:'A',c:'var(--mistBlue)'},{x:318,y:162,l:'B',c:'var(--crystalPink)'},{x:240,y:240,l:'C',c:'var(--lakeGreen)'},{x:162,y:162,l:'D',c:'var(--marbleWhite)'}];
    const links=[{a:0,b:1,n:8,c:'var(--mistBlueInk)'},{a:0,b:2,n:4,c:'var(--crystalPinkInk)'},{a:1,b:2,n:6,c:'var(--lakeGreenInk)'},{a:1,b:3,n:3,c:'var(--mistBlueInk)'},{a:2,b:3,n:2,c:'var(--crystalPinkInk)'}];
    const paths=links.map(e=>{const a=nodes[e.a],b=nodes[e.b],cx=240,cy=162,mx=(a.x+b.x)/2,my=(a.y+b.y)/2,controlX=cx+(mx-cx)*.2,controlY=cy+(my-cy)*.2;return `<path d="M${a.x} ${a.y} Q${controlX} ${controlY} ${b.x} ${b.y}" fill="none" stroke="${e.c}" stroke-opacity=".82" stroke-width="${Math.round(e.n*55)/100}" stroke-linecap="round"/>`}).join('');
    const marks=nodes.map(n=>`<circle cx="${n.x}" cy="${n.y}" r="14" fill="${n.c}" stroke="var(--axisStrong)" stroke-width="1.1"/><text x="${n.x}" y="${n.y+3}" text-anchor="middle" fill="var(--axis)" font-size="10" font-weight="700">${n.l}</text>`).join('');
    const body=`<circle cx="240" cy="162" r="78" fill="none" stroke="var(--grid)" stroke-dasharray="2 3"/>${paths}${marks}<text x="240" y="274" text-anchor="middle" fill="var(--muted)" font-size="8">A–B 8 · A–C 4 · B–C 6 · B–D 3 · C–D 2</text><text x="438" y="72" text-anchor="end" fill="var(--axis)" font-size="8">${zh?'线宽按关系值缩放；颜色仅装饰':'stroke width ∝ value · color is decorative'}</text>`;
    return uri(shell(zh?'和弦图 · 环形关系':'Chord diagram · circular relations',zh?'实体沿圆周排列；内部弦线连接关系，粗细按成对数值缩放':'Entities sit on a circle; chord width scales with pair values','','',body));
  };
  return {histogram:{zh:hist(true),en:hist(false)},density:{zh:density(true),en:density(false)},matrix:{zh:matrix(true),en:matrix(false)},errorBars:{zh:errorBars(true),en:errorBars(false)},parallelSets:{zh:parallelSets(true),en:parallelSets(false)},populationPyramid:{zh:populationPyramid(true),en:populationPyramid(false)},stemLeaf:{zh:stemLeaf(true),en:stemLeaf(false)},venn:{zh:venn(true),en:venn(false)},arcDiagram:{zh:arcDiagram(true),en:arcDiagram(false)},flowChart:{zh:flowChart(true),en:flowChart(false)},tallyChart:{zh:tallyChart(true),en:tallyChart(false)},wordCloud:{zh:wordCloud(true),en:wordCloud(false)},flowMap:{zh:flowMap(true),en:flowMap(false)},networkDiagram:{zh:networkDiagram(true),en:networkDiagram(false)},sankey:{zh:sankey(true),en:sankey(false)},chordDiagram:{zh:chordDiagram(true),en:chordDiagram(false)}};
}

const vlxChartArt20261102 = createAtlasAChartArt();
export function createAtlasBatch06ChartArt(tokens = ATLAS_A_TOKENS) {
  const paletteStyle = `<style>:root{${Object.entries(tokens).map(([name,value]) => `--${name}:${value}`).join(';')}}</style>`;
  const uri = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const shell = (title, subtitle, xLabel, yLabel, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" role="img">${paletteStyle}<text x="28" y="28" fill="var(--ink)" font-family="Arial,sans-serif" font-size="16" font-weight="700">${title}</text><text x="28" y="47" fill="var(--muted)" font-family="Arial,sans-serif" font-size="10">${subtitle}</text>${body}<text x="238" y="286" text-anchor="middle" fill="var(--axis)" font-family="Arial,sans-serif" font-size="10">${xLabel}</text><text x="13" y="145" text-anchor="middle" transform="rotate(-90 13 145)" fill="var(--axis)" font-family="Arial,sans-serif" font-size="10">${yLabel}</text></svg>`;
  const kagi = (zh) => {
    const y = price => 220 - (price - 100) * 4;
    const turns = [{x:88,price:100},{x:138,price:110},{x:188,price:105},{x:238,price:120},{x:288,price:111},{x:338,price:125},{x:388,price:99}];
    const neutral='var(--slateMid)', yang='var(--lakeGreenInk)', yin='var(--crystalPinkInk)';
    const segments=`<path d="M88 ${y(100)} V${y(110)} H138" fill="none" stroke="${neutral}" stroke-width="2.2" stroke-linejoin="round"/><path d="M138 ${y(110)} V${y(105)} H188" fill="none" stroke="${neutral}" stroke-width="2.2" stroke-linejoin="round"/><path d="M188 ${y(105)} V${y(110)}" fill="none" stroke="${neutral}" stroke-width="2.2"/><path d="M188 ${y(110)} V${y(120)} H238" fill="none" stroke="${yang}" stroke-width="4" stroke-linejoin="round"/><path d="M238 ${y(120)} V${y(111)} H288" fill="none" stroke="${yang}" stroke-width="4" stroke-linejoin="round"/><path d="M288 ${y(111)} V${y(125)} H338" fill="none" stroke="${yang}" stroke-width="4" stroke-linejoin="round"/><path d="M338 ${y(125)} V${y(105)}" fill="none" stroke="${yang}" stroke-width="4"/><path d="M338 ${y(105)} V${y(99)} H388" fill="none" stroke="${yin}" stroke-width="2.2" stroke-linejoin="round"/>${turns.slice(0,-1).map(t=>`<circle cx="${t.x}" cy="${y(t.price)}" r="2.8" fill="var(--marbleWhite)" stroke="var(--axisStrong)"/>`).join('')}<circle cx="188" cy="${y(110)}" r="3" fill="${yang}"/><circle cx="338" cy="${y(105)}" r="3" fill="${yin}"/>`;
    const grid=[100,105,110,115,120,125].map(price=>`<line x1="62" y1="${y(price)}" x2="410" y2="${y(price)}" stroke="var(--gridFine)"/><text x="55" y="${y(price)+3}" text-anchor="end" fill="var(--muted)" font-size="8">${price}</text>`).join('');
    const pivots=turns.slice(1,-1).map(t=>`<line x1="${t.x-4}" y1="${y(t.price)}" x2="${t.x+4}" y2="${y(t.price)}" stroke="var(--axisStrong)" stroke-width="1.2"/>`).join('');
    const labels=`<text x="144" y="${y(110)-8}" fill="var(--axis)" font-size="8">${zh?'肩 110':'Shoulder 110'}</text><text x="192" y="${y(105)+15}" fill="var(--axis)" font-size="8">${zh?'腰 105':'Waist 105'}</text><text x="356" y="${y(99)+14}" fill="var(--crystalPinkInk)" font-size="8" font-weight="700">${zh?'跌破前腰 → Yin':'below prior waist → Yin'}</text><text x="260" y="70" text-anchor="middle" fill="var(--lakeGreenInk)" font-size="8">${zh?'突破前肩 → Yang':'above prior shoulder → Yang'}</text>`;
    const body=`${grid}${segments}${pivots}${labels}<text x="400" y="74" text-anchor="end" fill="var(--muted)" font-size="8">${zh?'示意价格':'illustrative price'}</text>`;
    return uri(shell(zh?'Kagi 图 · 反转结构':'Kagi chart · reversal structure',zh?'达到反转阈值后折返；横轴按反转推进，不是等距时间轴':'Threshold reversals turn the line; horizontal steps are reversal events, not a time scale',zh?'反转事件':'reversal events',zh?'价格':'price',body));
  };
  const spiralPlot = (zh) => {
    const values=[[11,10,9,8,9,11,14,15,14,12,11,12],[12,10,9,9,10,12,15,16,14,13,12,13]];
    const labels=zh?['一月','四月','七月','十月']:['Jan','Apr','Jul','Oct'];
    const points=values.flatMap((year,yi)=>year.map((value,mi)=>{
      const i=yi*12+mi, theta=-Math.PI/2+i*Math.PI/6, radius=27+i*4.15+(value-12)*1.5;
      return {x:240+Math.cos(theta)*radius,y:158+Math.sin(theta)*radius,value,year:yi,month:mi};
    }));
    const paths=[0,1].map(year=>`<polyline points="${points.filter(p=>p.year===year||(year===1&&p.year===0&&p.month===11)).map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="none" stroke="${year?'var(--crystalPinkInk)':'var(--mistBlueInk)'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    const dots=points.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.4" fill="${p.year?'var(--crystalPinkInk)':'var(--mistBlueInk)'}"/>`).join('');
    const yearLabels=[0,1].map(year=>{const x=year?84:84,y=year?81:99;return `<text x="${x}" y="${y}" fill="${year?'var(--crystalPinkInk)':'var(--mistBlueInk)'}" font-size="8">${zh?`第 ${year+1} 年`:`Year ${year+1}`}</text>`}).join('');
    const monthMarks=points.filter(p=>p.month%3===0).map(p=>{const radius=Math.hypot(p.x-240,p.y-158),ox=(p.x-240)/radius*8,oy=(p.y-158)/radius*8;return `<text x="${(p.x+ox).toFixed(1)}" y="${(p.y+oy+2).toFixed(1)}" text-anchor="middle" fill="var(--axis)" font-size="6.5">${labels[p.month/3]}</text>`}).join('');
    const rings=[52,93,134].map(r=>`<circle cx="240" cy="158" r="${r}" fill="none" stroke="var(--gridFine)" stroke-dasharray="2 4"/>`).join('');
    const body=`${rings}${paths}${dots}${monthMarks}${yearLabels}<text x="240" y="156" text-anchor="middle" fill="var(--axis)" font-size="7">${zh?'时间向外':'time outward'}</text><text x="240" y="168" text-anchor="middle" fill="var(--muted)" font-size="6.5">${zh?'每圈 12 个月':'12 months / turn'}</text><text x="405" y="78" text-anchor="end" fill="var(--muted)" font-size="7">${zh?'示意月度值；颜色区分年份':'illustrative monthly values · color separates years'}</text>`;
    return uri(shell(zh?'螺旋图 · 两年月度周期':'Spiral plot · two-year monthly cycle',zh?'时间沿阿基米德螺线由中心向外推进；每圈为一年，径向偏移显示月度值':'Time advances outward on an Archimedean spiral; each turn is one year, with radial offset showing monthly value',zh?'时间（向外）':'time (outward)',zh?'月度值偏移':'monthly value offset',body));
  };
  const bubbleMap = (zh) => {
    const places=[{x:126,y:112,n:25,label:zh?'北港':'North'},{x:221,y:92,n:16,label:zh?'西湾':'West Bay'},{x:315,y:132,n:9,label:zh?'中城':'Central'},{x:183,y:208,n:4,label:zh?'南站':'South'},{x:347,y:210,n:12,label:zh?'东港':'East'}];
    const land='<path d="M74 113 C92 77 145 68 182 83 C222 64 276 76 295 100 C337 90 390 119 400 156 C408 191 380 229 344 233 C307 258 254 245 223 230 C184 245 131 225 114 200 C83 186 65 145 74 113Z" fill="var(--marbleWhite)" stroke="var(--grid)" stroke-width="1.2"/><path d="M89 134 C166 115 236 142 386 117 M98 190 C176 165 271 189 378 211 M173 78 C188 124 190 174 216 236 M310 91 C291 136 322 183 348 229" fill="none" stroke="var(--gridFine)" stroke-width=".8"/>';
    const bubbles=places.map(p=>{const r=(3*Math.sqrt(p.n)).toFixed(2);return `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="var(--mistBlue)" fill-opacity=".72" stroke="var(--mistBlueInk)" stroke-width="1.2"/><circle cx="${p.x}" cy="${p.y}" r="2" fill="var(--axisStrong)"/><text x="${p.x}" y="${p.y+Number(r)+11}" text-anchor="middle" fill="var(--axis)" font-size="7">${p.label} ${p.n}</text>`}).join('');
    const body=`${land}${bubbles}<text x="426" y="73" text-anchor="end" fill="var(--axis)" font-size="8">${zh?'圆面积 ∝ 数值':'circle area ∝ value'}</text><text x="240" y="263" text-anchor="middle" fill="var(--muted)" font-size="8">${zh?'示意区域；气泡不重叠':'schematic region · bubbles do not overlap'}</text>`;
    return uri(shell(zh?'气泡地图 · 地点数量':'Bubble map · counts by location',zh?'圆心标出地点，圆面积按地点数值缩放；地理形状为示意':'Bubble centers mark locations; circle area scales with each place value; geography is schematic',zh?'示意地理位置':'schematic location',zh?'地点数值':'value by location',body));
  };
  const nonRibbonChord = (zh) => {
    const nodes=[{x:240,y:79,l:'A'},{x:323,y:162,l:'B'},{x:240,y:245,l:'C'},{x:157,y:162,l:'D'}];
    const edges=[[0,1],[0,2],[1,2],[1,3],[2,3]];
    const lines=edges.map(([ai,bi])=>{const a=nodes[ai],b=nodes[bi];return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="var(--mistBlueInk)" stroke-width="1.7" stroke-linecap="round"/>`}).join('');
    const marks=nodes.map(n=>`<circle cx="${n.x}" cy="${n.y}" r="13" fill="var(--marbleWhite)" stroke="var(--lakeGreenInk)" stroke-width="1.5"/><text x="${n.x}" y="${n.y+3}" text-anchor="middle" fill="var(--axis)" font-size="9" font-weight="700">${n.l}</text>`).join('');
    const body=`<circle cx="240" cy="162" r="89" fill="none" stroke="var(--gridFine)" stroke-dasharray="2 4"/>${lines}${marks}<text x="240" y="266" text-anchor="middle" fill="var(--axis)" font-size="8">${zh?'5 条关系；固定线宽；无弦带':'5 relations · fixed line width · no ribbons'}</text><text x="438" y="73" text-anchor="end" fill="var(--muted)" font-size="7">${zh?'位置表示关系，不编码数量':'connections only · no value encoding'}</text>`;
    return uri(shell(zh?'非带状和弦图 · 关系网络':'Non-ribbon Chord Diagram · pair links',zh?'保留圆周节点与连接线，移除弦带以突出关系结构':'Keep circular nodes and connection lines; remove ribbons to emphasize relation structure',zh?'圆周节点与关系':'ring nodes and links',zh?'关系连接':'connection',body));
  };
  return { kagi: {zh:kagi(true),en:kagi(false)}, spiralPlot:{zh:spiralPlot(true),en:spiralPlot(false)}, bubbleMap:{zh:bubbleMap(true),en:bubbleMap(false)}, nonRibbonChord:{zh:nonRibbonChord(true),en:nonRibbonChord(false)} };
}
const vlxChartArtBatch06 = createAtlasBatch06ChartArt();

_atlasExpansion_f1dd93589e91ef8f_dataviz.items.push(...[
  {id:'histogram',zh:'直方图',en:'Histogram',dz:'连续数值按相邻区间分箱；每个柱高表示该区间的频数。',de:'Continuous values are grouped into adjacent intervals; each bar height encodes that interval’s frequency.',pz:'数据：56 个示例测量值；箱宽 10；柱间不留空隙。核对区间边界与各箱频数后再调整箱宽。',pe:'Example: 56 measurements, bin width 10, with no gaps between bins. Check interval boundaries and counts before changing bin width.',demo:'shape',n:1,chartSvg:vlxChartArt20261102.histogram,chartAlt:{zh:'直方图示例：56 个示例值分入七个连续的 10 单位区间，柱高标注频数。',en:'Histogram example: 56 example values in seven contiguous 10-unit intervals, with frequencies labeled.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'density-plot',zh:'密度图',en:'Density plot',dz:'用核平滑估计连续变量的分布形状；曲线峰值表示观测值较集中的区段。',de:'Kernel smoothing estimates the shape of a continuous distribution; peaks mark regions where observations concentrate.',pz:'用图中列出的 12 个样本和 Gaussian kernel 计算 KDE；带宽 h=0.5。带宽越大，曲线越平滑；这张图与柱形分箱计数不同。',pe:'Compute a KDE from the 12 listed samples with a Gaussian kernel and bandwidth h=0.5. Larger bandwidth smooths more; unlike a histogram, the curve is not a count of bins.',demo:'shape',n:1,chartSvg:vlxChartArt20261102.density,chartAlt:{zh:'密度图：以列出的 12 个样本和 h=0.5 计算 Gaussian KDE，并在轴下显示观测值。',en:'Density plot: Gaussian KDE computed from the 12 listed samples with h=0.5; observations are shown as rug marks.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'dot-matrix-chart',zh:'点矩阵图',en:'Dot matrix chart',dz:'把离散单位排列成矩阵，每个点等权，并用颜色编码类别以便比较数量或比例。',de:'Discrete units are arranged in a matrix; each dot has equal weight, and color encodes categories for count or proportion comparison.',pz:'示例共 100 个单位，A/B/C 分别为 46/34/20；每点代表一个单位。按行从左到右读取，先看数量再比较比例。',pe:'The example contains 100 units: A/B/C = 46/34/20; one dot equals one unit. Read left to right by row, then compare counts and proportions.',demo:'shape',n:1,chartSvg:vlxChartArt20261102.matrix,chartAlt:{zh:'点矩阵图：100 个点代表 100 个单位，A 类 46、B 类 34、C 类 20。',en:'Dot matrix chart: 100 dots represent 100 units, with 46 in A, 34 in B and 20 in C.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'error-bars',zh:'误差线',en:'Error bars',dz:'在估计值两侧绘制与定量轴平行的区间线和端帽；必须说明区间代表什么。',de:'Draw a capped interval parallel to a quantitative axis around an estimate; label what the interval represents.',pz:'示例绘制三组估计值及 95% 置信区间：圆点是均值，横线与端帽是区间。标准差、标准误、置信区间和极值范围含义不同，不能互换标签。',pe:'The example shows three estimates with 95% confidence intervals: dots are means; capped lines are intervals. Standard deviation, standard error, confidence intervals and min–max ranges mean different things and must not share labels.',demo:'shape',n:1,chartSvg:vlxChartArt20261102.errorBars,chartAlt:{zh:'误差线图示：三组示例均值以圆点标注，横向端帽线表示各自的 95% 置信区间。',en:'Error bars: dots show three example means and capped horizontal lines show their 95% confidence intervals.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'}
]);

_atlasExpansion_f1dd93589e91ef8f_dataviz.items.push(...[
  {id:'arc-diagram',zh:'弧线图',en:'Arc Diagram',dz:'把节点放在一条线上，用弧线连接相关节点；可用弧线粗细表示节点对的共现频次。',de:'Place nodes on one line and connect related pairs with arcs; arc thickness can encode pair frequency.',pz:'示例有五个节点与 12 次共现权重；节点不代表顺序流向，弧线无箭头。弧太多时容易交叠，不能呈现二维网络的空间结构。',pe:'Five nodes are linked with 12 co-occurrence counts. Nodes are not a process sequence and arcs are undirected. Dense links can clutter and do not retain a 2D network layout.',aliases:[],demo:'shape',n:1,chartSvg:vlxChartArt20261102.arcDiagram,chartAlt:{zh:'弧线图：五个线性排列节点通过五条无向弧线相连；线宽与标注次数表示共现频次。',en:'Arc diagram: five linearly ordered nodes are linked by five undirected arcs; width and labels encode co-occurrence counts.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'flow-chart',zh:'流程图',en:'Flow Chart',dz:'用连接的标准图形表示过程步骤；矩形表示操作，菱形表示判断，连线或箭头说明流程方向。',de:'Represent process steps with connected conventional symbols: rectangles for actions, diamonds for decisions, and lines or arrows for flow direction.',pz:'示例从开始进入“检查输入”，在“有效？”处分支；“是”进入通过，“否”补充材料后回到检查。流程图描述步骤与控制流，不表示分类数据的数量流。',pe:'The example starts at “Check input,” branches at “Valid?,” accepts on Yes, and loops from “Add evidence” back to checking on No. This models process and control flow, not quantities moving between categories.',aliases:[{term:'Flow Diagram',language:'en',scope:'Source-listed alternate name'},{term:'Flow Process Chart',language:'en',scope:'Source-listed alternate name'},{term:'Process Chart',language:'en',scope:'Source-listed alternate name'},{term:'Process Map',language:'en',scope:'Source-listed alternate name'},{term:'Process Model',language:'en',scope:'Source-listed alternate name'},{term:'Work Flow Diagram',language:'en',scope:'Source-listed alternate name'}],demo:'shape',n:1,chartSvg:vlxChartArt20261102.flowChart,chartAlt:{zh:'流程图：圆角起止框、操作矩形与判断菱形通过带箭头的连线相接，否分支回到检查步骤。',en:'Flow chart: rounded terminal, action rectangle, and decision diamond are connected by arrows; the No branch loops to the check step.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'tally-chart',zh:'划记表',en:'Tally Chart',dz:'通过逐次添加的划记记录各类别频数，并在行或列旁显示总数。',de:'Record category frequency with one tally mark per observation and show the total beside each group.',pz:'四类示例计数为 6、8、4、7，共 25；每满五个用一条斜线划过前四个。它保留离散计数记录；直方图则把连续量分箱并用相邻柱表示。',pe:'Four example categories count 6, 8, 4 and 7, totaling 25; every fifth mark crosses the previous four. It records discrete tallies, while a histogram bins a continuous variable into adjacent bars.',aliases:[],demo:'shape',n:1,chartSvg:vlxChartArt20261102.tallyChart,chartAlt:{zh:'划记表：A/B/C/D 类频数为 6/8/4/7，每五划成组，右侧总数相加为 25。',en:'Tally chart: A/B/C/D counts are 6/8/4/7, marks group by five, and the right-hand totals sum to 25.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'word-cloud',zh:'词云',en:'Word Cloud',dz:'以词语大小呈现其在文本或标签集合中的相对频次；排布形状可变化，颜色也可用于额外变量。',de:'Use word size to show relative frequency in text or tag collections; placement can vary, and color may encode another variable.',pz:'示例列出七个设计关键词与提及次数；字体大小按频次增加，颜色只作装饰。词云适合快速浏览关键词，不适合精确比较；长词和字形高度会影响视觉注意。',pe:'Seven design terms are shown with mention counts; type size rises with frequency while color is decorative. A cloud supports quick keyword scanning, not precise comparison; long words and glyph height can attract extra attention.',aliases:[{term:'Tag Cloud',language:'en',scope:'Source-listed alternate name'}],demo:'shape',n:1,chartSvg:vlxChartArt20261102.wordCloud,chartAlt:{zh:'词云：七个词标注示例提及次数，字体大小随词频增加；颜色没有编码第二个变量。',en:'Word cloud: seven terms show example mention counts; font size increases with frequency and color encodes no second variable.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'}
]);


_atlasExpansion_f1dd93589e91ef8f_dataviz.items.push(...[
  {id:'parallel-sets',zh:'平行集',en:'Parallel sets',dz:'用平行的分类维度与按类别比例分配宽度的流带，展示分类数据的流向与分布。',de:'Show categorical flow and distribution with parallel dimensions and ribbons sized by category proportion.',pz:'示例以 100 个订单串联地区、设备与方案三维；每条流带宽度按订单数缩放，不使用箭头。',pe:'The example links 100 orders across region, device and plan; each ribbon width scales with order count and uses no arrows.',demo:'shape',n:1,chartSvg:vlxChartArt20261102.parallelSets,chartAlt:{zh:'平行集图示：100 个订单从地区流向设备再到方案，带宽表示订单数量，未画箭头。',en:'Parallel sets: 100 orders flow across region, device and plan; ribbon width encodes count without arrows.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'population-pyramid',zh:'人口金字塔',en:'Population pyramid',dz:'把两组人口直方图背靠背排列，比较不同年龄组的人口数量。',de:'Place two population histograms back to back to compare counts across age groups.',pz:'年龄组纵向排列，男性与女性分别向中线两侧绘制，左右共用人数刻度；较年长年龄组置顶。此示例值为示意，不代表实际人口统计。',pe:'Stack age groups vertically with older groups at the top; draw male and female counts outward from a shared center using matching scales. Values are illustrative, not population statistics.',demo:'shape',n:1,chartSvg:vlxChartArt20261102.populationPyramid,chartAlt:{zh:'人口金字塔：最年长的 60+ 组在顶部，最年轻的 0–14 组在底部；示意人数绘制为镜像水平柱。',en:'Population pyramid: oldest 60+ group at the top and youngest 0–14 group at the bottom; illustrative counts shown as mirrored bars.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'stem-and-leaf-plot',zh:'茎叶图',en:'Stem & Leaf Plot',dz:'按数值位值分组，把茎放在左列、排序后的叶向右展开，从而保留原始数据。',de:'Group values by place value, placing stems at left and sorted leaves to the right to retain the original data.',pz:'示例数据 2、4、11、17、20、23：茎代表十位，叶代表个位；键 `1 | 7 = 17` 说明读法。避免与轴上点图或棒棒糖图混淆。',pe:'Example values 2, 4, 11, 17, 20, 23: stems are tens and leaves are ones; key `1 | 7 = 17` explains the encoding. This is distinct from an axis-based dot plot or lollipop chart.',aliases:[{term:'Stemplot',language:'en',scope:'Source-listed alternate name'},{term:'Stem & Leaf Display',language:'en',scope:'Source-listed alternate name'}],demo:'shape',n:1,chartSvg:vlxChartArt20261102.stemLeaf,chartAlt:{zh:'茎叶图：保留六个原始值，按十位分茎、按个位排序，并显示 1 | 7 = 17 的键。',en:'Stem-and-leaf plot: preserves six values, groups by tens, sorts ones, and shows the key 1 | 7 = 17.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'venn-diagram',zh:'维恩图',en:'Venn diagram',dz:'用相交的闭合区域表示集合，并呈现全部可能的交集关系。',de:'Represent sets with overlapping closed regions and show all possible intersection relationships.',pz:'U 矩形包含全集；三个相交圆表示 A、B、C 的七个内部成员区，h 位于 U 内但在三集合之外。字母是元素而非计数；图形面积不编码数量。',pe:'The rectangle marks universe U; three overlapping circles show the seven interior regions of A, B and C, while h is inside U but outside all three sets. Letters are elements, not counts; areas do not encode quantities.',aliases:[{term:'Set Diagram',language:'en',scope:'Source-listed alternate name for a Venn-style set relationship diagram'}],demo:'shape',n:1,chartSvg:vlxChartArt20261102.venn,chartAlt:{zh:'三集合维恩图：U 矩形内显示 A、B、C 的七个内部区域，以及位于 U 内但在三集合外的元素 h。',en:'Three-set Venn diagram: the U rectangle contains all seven inside regions for A, B and C plus h inside U but outside all three sets.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'}
]);

_atlasExpansion_f1dd93589e91ef8f_dataviz.items.push(...[
  {id:'flow-map',zh:'流向地图',en:'Flow Map',dz:'在地理位置上连接迁移或移动路线；线宽表示数量，箭头可标出方向。',de:'Connect migration or movement routes across geographic positions; line width encodes volume and arrows can show direction.',pz:'四条示意路线 A→B、A→C、B→D、C→D 的数量分别为 8、6、4、2，总量 20。线宽按路线数量增加；地点布局是示意图，不代表真实经纬度。',pe:'Four schematic routes A→B, A→C, B→D and C→D carry 8, 6, 4 and 2 trips (20 route totals). Line width rises with route volume; node positions are illustrative, not geographic coordinates.',aliases:[],demo:'shape',n:1,chartSvg:vlxChartArt20261102.flowMap,chartAlt:{zh:'流向地图：四个示意地点间有四条带箭头路线，线宽随 8、6、4、2 的路线数量变化。',en:'Flow map: four schematic places are joined by four directional routes whose widths track counts 8, 6, 4 and 2.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'network-diagram',zh:'网络图',en:'Network Diagram',dz:'用节点与连接线呈现实体之间的关系；布局可以显示群组、连接密度及跨群连接。',de:'Use nodes and links to show relationships between entities; layout can reveal clusters, link density and bridges.',pz:'示例将 A/B/C 与 D/E/F 排成两个群组，七条无向连接中 C–D 是唯一跨组连接。位置只服务于结构阅读，不代表地图坐标或时间顺序。',pe:'The example arranges A/B/C and D/E/F as two clusters; C–D is their only bridge among seven undirected links. Positions support topology reading and do not encode geography or sequence.',aliases:[{term:'Network Graph',language:'en',scope:'Source-listed alternate name'},{term:'Network Map',language:'en',scope:'Source-listed alternate name'},{term:'Node-Link Diagram',language:'en',scope:'Source-listed alternate name'}],demo:'shape',n:1,chartSvg:vlxChartArt20261102.networkDiagram,chartAlt:{zh:'网络图：六个节点排成两个群组，以七条无向边连接；C–D 是唯一跨群关系。',en:'Network diagram: six nodes form two clusters with seven undirected links; C–D is the only cross-cluster bridge.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'sankey-diagram',zh:'桑基图',en:'Sankey Diagram',dz:'以流带宽度表示阶段间流量的数量；流量可以在各阶段合并或拆分。',de:'Encode quantities between stages with band width; flows may combine or split at each stage.',pz:'100 个示例访问中，65 个继续、35 个退出；继续的 65 个又分成完成 40 个与离开 25 个。阶段值守恒，流带宽度按数量缩放并从左向右流动。',pe:'Of 100 example visits, 65 continue and 35 exit; the continuing 65 split into 40 completions and 25 departures. Stage totals conserve flow; bands scale with quantity and move left to right.',aliases:[],demo:'shape',n:1,chartSvg:vlxChartArt20261102.sankey,chartAlt:{zh:'桑基图：100 个访问分出继续 65 与退出 35；继续的 65 再分成完成 40 与离开 25，流带宽度表示数量。',en:'Sankey diagram: 100 visits split into 65 continuing and 35 exiting; the 65 then split into 40 completing and 25 leaving, with band width encoding quantity.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'chord-diagram',zh:'和弦图',en:'Chord Diagram',dz:'把实体排在圆周上，用内部弦线表示实体对的联系；弦线粗细可按关系数值缩放。',de:'Arrange entities around a circle and connect pairs with interior chords; chord width can scale to relationship values.',pz:'四个实体 A/B/C/D 的五组关系值分别为 8、4、6、3、2，共 23。四个节点都位于同一圆环上，线宽按关系值缩放；颜色只作装饰。',pe:'Five pair values among A/B/C/D are 8, 4, 6, 3 and 2 (23 total). All four nodes lie on one circle, stroke width tracks pair value, and color is decorative.',aliases:[],demo:'shape',n:1,chartSvg:vlxChartArt20261102.chordDiagram,chartAlt:{zh:'和弦图：A/B/C/D 四个圆周节点由五条弦线连接，关系值 8/4/6/3/2 映射到线宽，颜色仅装饰。',en:'Chord diagram: four nodes lie on one circle; five chords map values 8/4/6/3/2 to width and use decorative colors.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'}
]);

_atlasExpansion_f1dd93589e91ef8f_dataviz.items.push(...[
  {id:'kagi-chart',zh:'Kagi 图',en:'Kagi Chart',dz:'按价格反转结构显示供需变化，横向推进代表反转事件而非等距时间。',de:'Show supply-and-demand shifts through price reversals; horizontal steps mark reversal events, not evenly spaced time.',pz:'示意摆点价格为 100→110→105→120→111→125→99。达到预设反转幅度后折返；越过前肩 110 后转为较粗 Yang 线，跌破前腰 105 后转为较细 Yin 线。',pe:'Illustrative pivot prices: 100→110→105→120→111→125→99. The line reverses at its preset threshold, thickens after rising above the prior shoulder at 110, and thins after falling below the prior waist at 105.',aliases:[],demo:'shape',n:1,chartSvg:vlxChartArtBatch06.kagi,chartAlt:{zh:'Kagi 图：价格摆点 100、110、105、120、111、125、99；粗细变化标记突破前肩与跌破前腰，横向推进只表示反转顺序。',en:'Kagi chart: pivot prices 100, 110, 105, 120, 111, 125 and 99; line weight marks breaks above a shoulder and below a waist, while horizontal steps show reversal order.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'spiral-plot',zh:'螺旋图',en:'Spiral Plot',dz:'把时间序列沿阿基米德螺线从中心向外排列，以比较长周期中的重复模式。',de:'Place time-series observations along an outward Archimedean spiral to compare repeating patterns over long periods.',pz:'24 个示意月值分成两圈，每圈 12 个月；同一月份在相邻年份角度对应，颜色区分年份，偏离螺旋基线的距离表示月值。',pe:'Twenty-four illustrative monthly values form two turns of 12 months each. Matching months align by angle across years; color separates years and radial offset from the spiral baseline shows the monthly value.',aliases:[{term:'Time Series Spiral',language:'en',scope:'Source-listed alternate name'}],demo:'shape',n:1,chartSvg:vlxChartArtBatch06.spiralPlot,chartAlt:{zh:'螺旋图：24 个月值沿两圈螺线由内向外排列，每圈 12 个月；颜色区分两年，径向偏移显示月值。',en:'Spiral plot: 24 monthly values progress outward over two 12-month turns; color distinguishes the two years and radial offset shows each value.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'bubble-map',zh:'气泡地图',en:'Bubble Map',dz:'在地理位置上放置圆形标记，并用圆面积表示各地点的数值。',de:'Place circular marks at geographic locations and use each circle’s area to encode a location value.',pz:'五个示意地点的值为 25、16、12、9、4；半径按 3√value 缩放，因此圆面积与值成比例。底图和位置均为示意，地点标注数值单位为 visits。',pe:'Five schematic locations have values 25, 16, 12, 9 and 4 visits. Radius uses 3√value, so circle area is proportional to the value. The basemap and coordinates are illustrative.',aliases:[],demo:'shape',n:1,chartSvg:vlxChartArtBatch06.bubbleMap,chartAlt:{zh:'气泡地图：示意区域中五个地点分别为 25、16、12、9、4 次访问；半径按平方根缩放，使圆面积对应数值。',en:'Bubble map: five schematic places show 25, 16, 12, 9 and 4 visits; radius scales with the square root so circle area tracks value.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'},
  {id:'non-ribbon-chord-diagram',zh:'非带状和弦图',en:'Non-ribbon Chord Diagram',dz:'保留圆周节点和连接线，去掉弦带，以突出关系结构。',de:'Keep the circular nodes and connection lines but remove ribbons to emphasize the relationship structure.',pz:'A、B、C、D 四个节点分布在圆周上，五条等宽直线表示已有关联；本例不编码流量、权重或类别。与普通和弦图相比，边只画连接线，不绘制填充弦带。',pe:'Four nodes A, B, C and D sit around a circle; five fixed-width straight lines indicate relationships. This example does not encode flow, weight or category. Unlike a ribbon chord diagram, edges are lines without filled bands.',aliases:[],demo:'shape',n:1,chartSvg:vlxChartArtBatch06.nonRibbonChord,chartAlt:{zh:'非带状和弦图：四个圆周节点由五条等宽连接线相连；没有填充弦带，也没有数值编码。',en:'Non-ribbon chord diagram: four circularly arranged nodes share five fixed-width links, with no filled ribbons or quantitative encoding.'},css:'.fxshape{width:min(480px,96%);height:300px}.fx{width:100%;height:100%;border-radius:0;background:transparent;box-shadow:none}'}
]);

export default _atlasExpansion_f1dd93589e91ef8f_dataviz;
