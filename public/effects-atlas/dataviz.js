const P = (k, zh, en, min, max, step, def, unit) => ({ k, zh, en, min, max, step, def, unit: unit || '' });
const E = 'cubic-bezier(.22,1,.36,1)';
const ONE = '.fx:nth-child(n+2){display:none}';

export default {
  id: 'dataviz', zh: '数据可视化', en: 'Data visualisation',
  dz: '数字怎么变成看得懂的图形', de: 'Turning numbers into shapes people read',
  items: [
    { id: 'bargrow', zh: '柱子生长', en: 'Bars grow', dz: '柱状图从底部长出来', de: 'Bars rise from the baseline',
      pz: 'transform-origin:bottom 的 scaleY(0→1)，别动 height 免得重排。', pe: 'scaleY(0→1) with transform-origin bottom, not height.',
      demo: 'chart', css: `@keyframes fxk{from{transform:scaleY(0)}to{transform:scaleY(1)}}.fx{transform-origin:bottom;animation:fxk 1.1s ${E} infinite alternate}` },

    { id: 'barstagger', zh: '柱子错峰', en: 'Bars stagger', dz: '一根一根依次长出', de: 'Bars grow one after another',
      pz: 'delay = index × 70ms，读者的视线会跟着走。', pe: 'delay = index × 70ms — the eye follows the sequence.',
      demo: 'chart', params: [P('s', '间隔', 'Stagger', 20, 200, 10, 70, 'ms')],
      css: `@keyframes fxk{from{transform:scaleY(0)}to{transform:scaleY(1)}}.fx{transform-origin:bottom;animation:fxk .8s ${E} infinite alternate;animation-delay:calc(var(--i)*var(--s,70ms))}` },

    { id: 'hbar', zh: '横向条形', en: 'Horizontal bars', dz: '类别名长时用横条', de: 'Use horizontal bars when labels are long',
      pz: '横条从左生长，标签左对齐、数值右对齐。', pe: 'Grow from the left; labels left, values right.',
      demo: 'chart', css: `@keyframes fxk{from{transform:scaleX(0)}to{transform:scaleX(1)}}.fxchart{flex-direction:column;align-items:stretch;justify-content:center;width:min(420px,80%);gap:10px;height:auto}.fx{width:auto;height:26px;border-radius:4px;transform-origin:left;animation:fxk .9s ${E} infinite alternate;animation-delay:calc(var(--i)*70ms)}` },

    { id: 'linedraw', zh: '折线描画', en: 'Line draw', dz: '折线像被笔画出来', de: 'The line draws itself',
      pz: 'SVG path 的 stroke-dasharray/-dashoffset 从满到 0。', pe: 'Animate SVG stroke-dasharray/offset from full to zero.',
      demo: 'chart', css: `@keyframes fxk{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0)}}.fxchart{width:min(440px,82%);position:relative}.fx{opacity:.12}.fxchart::after{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40' preserveAspectRatio='none'%3E%3Cpolyline points='0,32 16,20 32,26 50,8 68,16 84,4 100,12' fill='none' stroke='%2323232f' stroke-width='1.6'/%3E%3C/svg%3E") center/100% 100% no-repeat;animation:fxk 1.6s ${E} infinite alternate}` },

    { id: 'areafill', zh: '面积填充', en: 'Area fill', dz: '折线下方渐变填色', de: 'A gradient fills under the line',
      pz: '线画完后面积层再淡入，两段动画错开 200ms。', pe: 'Fade the area in 200ms after the line finishes.',
      demo: 'chart', css: `@keyframes fxk{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0)}}.fxchart{width:min(440px,82%);position:relative}.fx{display:none}.fxchart::after{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40' preserveAspectRatio='none'%3E%3Cpolygon points='0,32 16,20 32,26 50,8 68,16 84,4 100,12 100,40 0,40' fill='%23365c31' fill-opacity='.18'/%3E%3Cpolyline points='0,32 16,20 32,26 50,8 68,16 84,4 100,12' fill='none' stroke='%23365c31' stroke-width='1.6'/%3E%3C/svg%3E") center/100% 100% no-repeat;animation:fxk 1.8s ${E} infinite alternate}` },

    { id: 'donut', zh: '环形扫出', en: 'Donut sweep', dz: '圆环按比例扫一圈', de: 'The ring sweeps to its value',
      pz: 'conic-gradient 的角度动画，或 SVG circle 的 dashoffset。', pe: 'Animate the conic-gradient angle, or an SVG circle dashoffset.',
      demo: 'chart', params: [P('v', '数值', 'Value', 0, 100, 1, 68, '')],
      css: `.fxchart{height:auto}.fx{width:200px;height:200px;border-radius:50%;background:conic-gradient(#4d8ba6 calc(var(--v,68)*1%),#eceef1 0);position:relative}.fx::after{content:'';position:absolute;inset:26px;border-radius:50%;background:#fcfcfb}${ONE}` },

    { id: 'ring', zh: '进度圆环', en: 'Progress ring', dz: '细环显示完成度', de: 'A thin ring shows completion',
      pz: 'SVG circle + stroke-dashoffset，round 线帽更友好。', pe: 'SVG circle with stroke-dashoffset and round caps.',
      demo: 'chart', params: [P('v', '进度', 'Progress', 0, 100, 1, 72, '')],
      css: `.fxchart{height:auto}.fx{width:190px;height:190px;border-radius:50%;background:conic-gradient(#e8879c calc(var(--v,72)*1%),#eceee6 0);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 14px),#000 calc(100% - 13px))}${ONE}` },

    { id: 'gauge', zh: '仪表盘', en: 'Gauge', dz: '半圆表盘配指针', de: 'A half-dial with a needle',
      pz: '半圆 conic-gradient + 指针 rotate，指针用 out-back 落定。', pe: 'Half conic-gradient plus a needle rotating with out-back.',
      demo: 'chart', css: `.fxchart{height:auto}.fx{width:230px;height:115px;border-radius:115px 115px 0 0;background:conic-gradient(from 270deg,#7ab85a 0 33%,#f4dcb8 33% 66%,#e8879c 66% 100%);-webkit-mask:radial-gradient(farthest-side at 50% 100%,transparent calc(100% - 26px),#000 calc(100% - 25px))}${ONE}` },

    { id: 'stacked', zh: '堆叠柱', en: 'Stacked bars', dz: '一根柱里分几段', de: 'One bar split into segments',
      pz: '每段单独动画，从下往上依次叠加。', pe: 'Animate segments bottom-up, one after another.',
      demo: 'chart', css: `@keyframes fxk{from{transform:scaleY(0)}to{transform:scaleY(1)}}.fx{transform-origin:bottom;background:linear-gradient(#f4dcb8 0 30%,#7ab85a 30% 62%,#4d8ba6 62% 100%);animation:fxk 1s ${E} infinite alternate;animation-delay:calc(var(--i)*60ms)}` },

    { id: 'grouped', zh: '分组柱', en: 'Grouped bars', dz: '两组数据并排比较', de: 'Two series side by side',
      pz: '组内间距小于组间间距，视觉才分得清。', pe: 'Inner gap must be smaller than the gap between groups.',
      demo: 'chart', css: `.fxchart{gap:4px}.fx:nth-child(odd){background:#4d8ba6}.fx:nth-child(even){background:#f0c9a8;margin-right:18px}` },

    { id: 'dotplot', zh: '点图', en: 'Dot plot', dz: '用点代替柱，更轻', de: 'Dots instead of bars — lighter',
      pz: '柱子替换为端点圆 + 细连接线，适合数据点少时。', pe: 'A dot at the value with a thin stem; best for few points.',
      demo: 'chart', css: `.fx{width:6px;background:#e0e2e6;border-radius:3px;position:relative}.fx::after{content:'';position:absolute;top:-9px;left:50%;transform:translateX(-50%);width:18px;height:18px;border-radius:50%;background:#4d8ba6}` },

    { id: 'sparkline', zh: '迷你趋势线', en: 'Sparkline', dz: '嵌在文字旁的小趋势', de: 'A tiny trend that sits beside text',
      pz: '无坐标轴、无标签，只表达方向，高度 20–32px。', pe: 'No axes or labels — direction only, 20–32px tall.',
      demo: 'chart', css: `.fxchart{height:56px;gap:5px;align-items:flex-end}.fx{width:9px;border-radius:2px;background:#8b8e99}.fx:last-child{background:#e8879c}` },

    { id: 'heat', zh: '热力格', en: 'Heat cells', dz: '颜色深浅表示大小', de: 'Color depth encodes magnitude',
      pz: '单色系明度阶梯，别用彩虹色，色阶控制在 5–7 级。', pe: 'A single-hue lightness ramp, 5–7 steps — never rainbow.',
      demo: 'chart', css: `.fxchart{display:grid;grid-template-columns:repeat(7,34px);grid-auto-rows:34px;gap:6px;height:auto}.fx{width:auto;height:auto;border-radius:5px;background:#4d8ba6;opacity:calc(.2 + var(--i)*.11)}` },

    { id: 'waffle', zh: '华夫格', en: 'Waffle chart', dz: '一格格方块表示百分比', de: 'Squares stand in for a percentage',
      pz: '10×10 网格，填充数量 = 百分比，比饼图更好读。', pe: 'A 10×10 grid filled to the percentage — easier than a pie.',
      demo: 'chart', css: `.fxchart{display:grid;grid-template-columns:repeat(4,26px);grid-auto-rows:26px;gap:5px;height:auto}.fx{width:auto;height:auto;border-radius:3px;background:#eceef1}.fx:nth-child(-n+4){background:#4d8ba6}` },

    { id: 'bullet', zh: '子弹图', en: 'Bullet chart', dz: '实际值对着目标线', de: 'Actual value against a target line',
      pz: '背景带表示区间，粗条是实际值，竖线是目标。', pe: 'Range band behind, thick bar for actual, tick for target.',
      demo: 'chart', css: `.fxchart{flex-direction:column;align-items:stretch;justify-content:center;width:min(420px,80%);height:auto;gap:14px}.fx{width:auto;height:24px;background:#eceef1;border-radius:4px;position:relative}.fx::before{content:'';position:absolute;left:0;top:5px;bottom:5px;width:62%;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);border-radius:3px}.fx::after{content:'';position:absolute;left:78%;top:-3px;bottom:-3px;width:3px;background:#e8879c}` },

    { id: 'scatter', zh: '散点', en: 'Scatter', dz: '两维关系的点云', de: 'A cloud showing two dimensions',
      pz: '点半透明避免重叠糊成一片，可加抖动。', pe: 'Semi-transparent dots (plus jitter) survive overplotting.',
      demo: 'chart', css: `.fxchart{position:relative;width:min(420px,80%);height:250px;display:block;background:linear-gradient(#eceef1 1px,transparent 1px) 0 0/100% 50px}.fx{position:absolute;width:14px;height:14px;border-radius:50%;background:rgba(54,92,49,.55);left:calc(8% + var(--i)*13%);bottom:calc(12% + var(--i)*11%)}` },

    { id: 'threshold', zh: '阈值线', en: 'Threshold line', dz: '一条虚线标出警戒值', de: 'A dashed line marks the limit',
      pz: '虚线 + 右侧标签，超过阈值的柱换成警示色。', pe: 'Dashed rule with a label; bars above it switch to the alert color.',
      demo: 'chart', css: `.fxchart{position:relative}.fxchart::after{content:'';position:absolute;left:-10px;right:-10px;bottom:70%;border-top:2px dashed #e8879c}.fx:nth-child(4),.fx:nth-child(6){background:#e8879c}` },

    { id: 'hoverbar', zh: '悬停高亮', en: 'Hover highlight', dz: '指到哪根哪根变深，其余变淡', de: 'The hovered bar darkens, the rest recede',
      pz: '父级 hover 降低所有条透明度，当前条恢复并显示数值。', pe: 'Dim all on parent hover; restore the hovered one and show its value.',
      demo: 'chart', css: `.fx{transition:all .2s ease;cursor:pointer}.fxchart:hover .fx{opacity:.32}.fxchart .fx:hover{opacity:1;background:#e8879c;transform:scaleX(1.12)}` },

    { id: 'tooltipdv', zh: '数值气泡', en: 'Value tooltip', dz: '悬停时冒出精确数值', de: 'Exact numbers appear on hover',
      pz: '气泡吸附到最近的数据点，不要跟着鼠标乱飘。', pe: 'Snap the tooltip to the nearest datum, do not float with the cursor.',
      demo: 'chart', css: `.fx{position:relative;cursor:pointer}.fx::after{content:'42';position:absolute;bottom:calc(100% + 8px);left:50%;transform:translate(-50%,6px);background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:#fff;font:600 11px var(--sv-font-mono,monospace);padding:4px 7px;border-radius:5px;opacity:0;transition:all .18s ease}.fx:hover::after{opacity:1;transform:translate(-50%,0)}` },

    { id: 'sortmove', zh: '排序位移', en: 'Sort transition', dz: '重新排序时柱子平移到新位置', de: 'Bars slide to their new rank',
      pz: '用 FLIP 保证每根柱从旧位置平滑移动到新位置。', pe: 'FLIP each bar from its old rect to the new one.',
      demo: 'chart', css: `.fx{transition:transform .5s ${E}}.fxchart:hover .fx:nth-child(1){transform:translateX(240px)}.fxchart:hover .fx:nth-child(5){transform:translateX(-240px)}` },

    { id: 'axisfade', zh: '坐标轴淡入', en: 'Axis fade', dz: '网格线安静地先出现', de: 'Grid lines arrive quietly first',
      pz: '轴线先于数据出现，透明度不超过 12%。', pe: 'Axes appear before the data, at 12% opacity or less.',
      demo: 'chart', css: `@keyframes fxg{from{opacity:0}to{opacity:1}}@keyframes fxk{from{transform:scaleY(0)}to{transform:scaleY(1)}}.fxchart{position:relative;padding:0 10px}.fxchart::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(#e4e5e0 0 1px,transparent 1px 44px);animation:fxg .6s ease infinite alternate}.fx{transform-origin:bottom;animation:fxk 1.2s ${E} .3s infinite alternate}` },

    { id: 'delta', zh: '涨跌对比', en: 'Delta bars', dz: '正负分列基线两侧', de: 'Positive and negative split by the baseline',
      pz: '基线居中，涨用品牌绿、跌用 Folly 粉，别用红绿撞色。', pe: 'Centre the baseline; brand green up, Folly down.',
      demo: 'chart', css: `.fxchart{align-items:center;position:relative;height:240px}.fxchart::after{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:#c9ccd3}.fx{align-self:flex-start;background:#7ab85a}.fx:nth-child(even){align-self:flex-end;background:#e8879c}` },

    { id: 'countup', zh: '大数字跳动', en: 'Big number count-up', dz: '关键指标跳到目标值', de: 'The headline metric counts to its value',
      pz: '用 ease-out 的计数曲线（先快后慢），保留千分位。', pe: 'Ease-out counting with thousand separators.',
      demo: 'chart', css: `@keyframes fxk{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}.fxchart{height:auto}.fx{width:auto;height:auto;background:none;font:700 88px/1 var(--sv-font-mono,monospace);color:#23232f;animation:fxk .8s ${E} infinite alternate}.fx::after{content:'3,425'}${ONE}` },

    { id: 'radialbars', zh: '环形条', en: 'Radial bars', dz: '柱子绕成一圈', de: 'Bars wrapped into a circle',
      pz: '按角度分布，只在类别少且需要装饰性时用。', pe: 'Distribute by angle — decorative, only for few categories.',
      demo: 'chart', css: `.fxchart{position:relative;width:250px;height:250px;display:block}.fx{position:absolute;left:50%;bottom:50%;width:14px;border-radius:7px;transform-origin:bottom center;transform:rotate(calc(var(--i)*51deg));background:#4d8ba6;opacity:calc(.45 + var(--i)*.08)}` },

    { id: 'legend', zh: '图例联动', en: 'Legend linking', dz: '点图例可以过滤系列', de: 'Clicking the legend filters series',
      pz: '图例即控件：点击切换显示，未选中降到 30% 透明。', pe: 'The legend is the control: toggle series, dim the unselected to 30%.',
      demo: 'chart', css: `.fx{cursor:pointer;transition:opacity .2s}.fx:nth-child(3n){opacity:.28}.fx:hover{opacity:1;background:#e8879c}` }
  ]
};
