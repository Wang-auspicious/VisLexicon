// Curated foundational patterns
export default {
  "id": "cssnext",
  "zh": "现代 CSS 能力",
  "en": "Modern CSS capabilities",
  "dz": "现代 CSS 能力覆盖容器、级联、颜色、查询、性能和渐进增强。",
  "de": "Modern CSS capabilities cover containers, cascade, color, queries, performance, and progressive enhancement.",
  "items": [
    {
      "id": "cascade-layers",
      "zh": "级联层",
      "en": "Cascade layers",
      "dz": "级联层按重置、基础、组件和工具组织覆盖顺序。",
      "de": "Organize reset, base, component, and utility precedence with cascade layers.",
      "pz": "级联层按重置、基础、组件和工具组织覆盖顺序。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Organize reset, base, component, and utility precedence with cascade layers. Validate real data, failure recovery, and locale switching.",
      "demo": "list",
      "n": 3,
      "cells": ["@layer reset","@layer base","@layer app"],
      "css": ".fxcol{gap:0;width:186px}.fx{height:34px;border-radius:0;background:linear-gradient(#fff,#f3f5f1);border-bottom:1px solid #e6e9e1;border-left:3px solid #dfe3db;color:#5d6b57;font:600 10.5px/1 var(--fx-mono);justify-content:flex-start;padding-left:12px;animation:cl3 4s ease-in-out infinite;animation-delay:calc(var(--i) * .25s)}.fx:nth-child(3){font-weight:700}@keyframes cl3{0%,100%{border-left-color:#dfe3db;background:linear-gradient(#fff,#f3f5f1)}45%,70%{border-left-color:#3f6f92;background:linear-gradient(#eef2f5,#e2ebf0)}}"
    },
    {
      "id": "scope-rule",
      "zh": "样式作用域",
      "en": "Scoped styles",
      "dz": "作用域规则限制样式传播，组件组合时减少意外选择器冲突。",
      "de": "Scope rules limit propagation and reduce selector collisions.",
      "pz": "作用域规则限制样式传播，组件组合时减少意外选择器冲突。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Scope rules limit propagation and reduce selector collisions. Validate real data, failure recovery, and locale switching.",
      "demo": "panel",
      "n": 2,
      "css": ".fxstack{flex-direction:row;gap:14px;position:relative}.fx{width:80px;height:66px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db}.fx:nth-child(1),.fx:nth-child(2){color:#8b8d84;font:600 9.5px/1 var(--fx-mono)}.fx:nth-child(2){animation:sr2 3.8s ease-in-out infinite}.fxstack::after{content:'';position:absolute;left:8px;right:8px;top:8px;bottom:8px;border-radius:8px;border:1.5px dashed #3f6f92;opacity:0;animation:srb 3.8s ease-in-out infinite}@keyframes sr2{0%,100%{background:linear-gradient(#fff,#f2f4f0)}50%{background:linear-gradient(#eaf0f5,#dde9f0)}}@keyframes srb{0%,100%{opacity:0;transform:scale(.94)}48%,72%{opacity:1;transform:none}}"
    },
    {
      "id": "container-style-query",
      "zh": "容器样式查询",
      "en": "Container style query",
      "dz": "组件根据容器样式令牌变化，而不是读取全局类名。",
      "de": "Components respond to container style tokens instead of global classes.",
      "pz": "组件根据容器样式令牌变化，而不是读取全局类名。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Components respond to container style tokens instead of global classes. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": [""],
      "css": ".fx{width:64px;height:120px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;position:relative;overflow:hidden;animation:csq 4.4s ease-in-out infinite}.fx::after{content:'';position:absolute;inset:10px;border-radius:7px;background:linear-gradient(#3f6f92,#31597a)}@keyframes csq{0%,100%{width:64px}.55%,80%{width:186px}}"
    },
    {
      "id": "has-selector",
      "zh": "关系选择器",
      "en": "Relational selector",
      "dz": "关系选择器根据子状态更新父级，但要控制查询范围。",
      "de": "Relational selectors update parents from child state with bounded scope.",
      "pz": "关系选择器根据子状态更新父级，但要控制查询范围。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Relational selectors update parents from child state with bounded scope. Validate real data, failure recovery, and locale switching.",
      "demo": "field",
      "cells": [""],
      "css": ".fxfield .fx{width:180px;height:44px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1.5px solid #c5d0c8;position:relative;overflow:visible}.fx::after{content:'父级变了';position:absolute;left:0;top:52px;font:600 10px/1 var(--fx-mono);color:#3f6f92;white-space:nowrap;opacity:0;animation:hs 3.8s ease-in-out infinite}.fx{animation:hsf 3.8s ease-in-out infinite}@keyframes hsf{0%,100%{border-color:#c5d0c8;box-shadow:none}48%,74%{border-color:#3f6f92;box-shadow:0 0 0 4px #3f6f9214}}@keyframes hs{0%,100%{opacity:0}48%,74%{opacity:1}}"
    },
    {
      "id": "nesting",
      "zh": "原生嵌套",
      "en": "Native nesting",
      "dz": "原生嵌套表达组件状态，避免过深选择器和隐式级联。",
      "de": "Native nesting expresses states without deep selectors.",
      "pz": "原生嵌套表达组件状态，避免过深选择器和隐式级联。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Native nesting expresses states without deep selectors. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": ["&:hover"],
      "css": ".fx{width:186px;height:88px;border-radius:12px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 12px/1 var(--fx-mono);position:relative;overflow:hidden}.fx::before{content:'';position:absolute;left:0;right:0;top:0;height:3px;background:#dfe3db;transform-origin:left;animation:ne 3.8s ease-in-out infinite}@keyframes ne{0%,100%{transform:scaleX(0);background:#dfe3db}48%,74%{transform:scaleX(1);background:#3f6f92}}"
    },
    {
      "id": "subgrid",
      "zh": "子网格",
      "en": "Subgrid",
      "dz": "子网格继承父轨道，让独立卡片的标题和操作线对齐。",
      "de": "Subgrid inherits parent tracks for aligned card titles and actions.",
      "pz": "子网格继承父轨道，让独立卡片的标题和操作线对齐。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Subgrid inherits parent tracks for aligned card titles and actions. Validate real data, failure recovery, and locale switching.",
      "demo": "grid",
      "n": 9,
      "css": ".fxgrid{grid-template-columns:repeat(3,1fr);gap:6px;width:188px;padding:6px;border-radius:10px;background:#eef1ec;animation:sg 4.2s ease-in-out infinite}.fx{height:34px;border-radius:7px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db}@keyframes sg{0%,34%{padding:6px}52%,82%{padding:6px 6px 6px 6px;grid-template-columns:repeat(3,1fr)}}"
    },
    {
      "id": "style-query",
      "zh": "样式查询",
      "en": "Style query",
      "dz": "样式查询为可复用组件提供主题变体入口。",
      "de": "Style queries provide theme variant entry points for reusable components.",
      "pz": "样式查询为可复用组件提供主题变体入口。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Style queries provide theme variant entry points for reusable components. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": ["prefers-color-scheme"],
      "css": ".fx{width:196px;height:82px;border-radius:12px;background:linear-gradient(#f7f8f5,#eceee8);color:#202824;border:1px solid #c5d0c8;font:600 10.5px/1 var(--fx-mono);position:relative;overflow:hidden;animation:sqy 4s steps(1,end) infinite}@keyframes sqy{0%,49%{background:linear-gradient(#f7f8f5,#eceee8);color:#202824}50%,100%{background:linear-gradient(#20242b,#16191f);color:#f2f4ef;border-color:#2c323b}}"
    },
    {
      "id": "color-mix",
      "zh": "颜色混合",
      "en": "Color mix",
      "dz": "颜色混合明确色彩空间和比例，主题变化可追踪。",
      "de": "Define color space and ratio for traceable theme mixing.",
      "pz": "颜色混合明确色彩空间和比例，主题变化可追踪。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Define color space and ratio for traceable theme mixing. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": ["mix 50%"],
      "css": ".fx{width:180px;height:80px;border-radius:12px;color:#202824;border:1px solid #c5d0c8;font:600 11px/1 var(--fx-mono);position:relative;overflow:hidden;background:#3f6f92;animation:cmx 4s ease-in-out infinite}@keyframes cmx{0%,100%{background:#3f6f92;color:#fff}50%{background:#bfd8e6;color:#26485c}}.fx::after{content:'';position:absolute;left:0;right:0;bottom:0;height:14px;background:#e8879c;animation:cmx2 4s ease-in-out infinite}@keyframes cmx2{0%,100%{transform:scaleX(1);transform-origin:left}50%{transform:scaleX(.4);transform-origin:left}}"
    },
    {
      "id": "oklch",
      "zh": "OKLCH",
      "en": "OKLCH",
      "dz": "OKLCH 分离明度和色度，生成感知更均匀的调色板。",
      "de": "Separate lightness and chroma for perceptually even palettes.",
      "pz": "OKLCH 分离明度和色度，生成感知更均匀的调色板。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Separate lightness and chroma for perceptually even palettes. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": ["L 0.62 C 0.14 H 25"],
      "css": ".fx{width:186px;height:92px;border-radius:12px;color:#1b1f26;border:1px solid #c5d0c8;font:600 10.5px/1 var(--fx-mono);animation:ok 4.4s ease-in-out infinite}@keyframes ok{0%{background:oklch(0.72 0.13 25)}25%{background:oklch(0.72 0.13 145)}50%{background:oklch(0.72 0.13 250)}75%{background:oklch(0.72 0.13 320)}100%{background:oklch(0.72 0.13 25)}}"
    },
    {
      "id": "light-dark",
      "zh": "明暗颜色",
      "en": "Light-dark colors",
      "dz": "light-dark 减少主题重复声明，同时保留对比度检查。",
      "de": "Reduce theme duplication while retaining contrast checks.",
      "pz": "light-dark 减少主题重复声明，同时保留对比度检查。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Reduce theme duplication while retaining contrast checks. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": ["light-dark()"],
      "css": ".fx{width:196px;height:86px;border-radius:12px;border:1px solid #c5d0c8;font:600 11px/1 var(--fx-mono);position:relative;overflow:hidden;animation:ld 4s steps(1,end) infinite;background:light-dark(#f7f8f5,#20242b);color:light-dark(#202824,#f2f4ef)}@keyframes ld{0%,49%{filter:none}50%,100%{filter:invert(1)}}"
    },
    {
      "id": "relative-color",
      "zh": "相对颜色",
      "en": "Relative color",
      "dz": "相对颜色从令牌计算状态变体，避免硬编码多套色值。",
      "de": "Compute state variants from tokens instead of hardcoding sets.",
      "pz": "相对颜色从令牌计算状态变体，避免硬编码多套色值。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Compute state variants from tokens instead of hardcoding sets. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": ["rgb(from …)"],
      "css": ".fx{width:182px;height:88px;border-radius:12px;background:#3f6f92;color:#fff;border:1px solid #31597a;font:600 10.5px/1 var(--fx-mono);animation:rlc 4s ease-in-out infinite}@keyframes rlc{0%,100%{background:rgb(from #3f6f92 r g b / 1)}48%,72%{background:rgb(from #3f6f92 r g b / .35)}}"
    },
    {
      "id": "logical-properties",
      "zh": "逻辑属性",
      "en": "Logical properties",
      "dz": "逻辑属性支持 RTL 和书写模式，不把 left/right 写死。",
      "de": "Use logical properties for RTL and writing modes.",
      "pz": "逻辑属性支持 RTL 和书写模式，不把 left/right 写死。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Use logical properties for RTL and writing modes. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": ["逻辑侧"],
      "css": ".fx{width:186px;height:86px;border-radius:12px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 11.5px/1 var(--fx-sans);position:relative;overflow:hidden;padding-inline-start:34px;justify-content:flex-start}.fx::before{content:'';position:absolute;inset-block:0;inset-inline-start:0;inline-size:8px;background:#3f6f92;animation:lp 4.2s ease-in-out infinite}@keyframes lp{0%,100%{inline-size:8px}50%,100%{inline-size:34px}}"
    },
    {
      "id": "anchor-position",
      "zh": "锚点定位",
      "en": "Anchor positioning",
      "dz": "锚点定位让提示和菜单跟随触发元素，溢出时可翻转。",
      "de": "Anchor popovers to triggers and flip on overflow.",
      "pz": "锚点定位让提示和菜单跟随触发元素，溢出时可翻转。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Anchor popovers to triggers and flip on overflow. Validate real data, failure recovery, and locale switching.",
      "demo": "panel",
      "n": 2,
      "css": ".fxstack{position:relative;width:186px;height:120px}.fx:nth-child(1){position:absolute;left:12px;bottom:14px;width:54px;height:34px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8}.fx:nth-child(2){position:absolute;left:12px;bottom:54px;width:120px;height:34px;border-radius:8px;background:linear-gradient(#252a33,#1a1e25);color:#e7ecf1;font:600 10.5px/1 var(--fx-mono);animation:ap 3.8s ease-in-out infinite}@keyframes ap{0%,100%{transform:translateY(10px);opacity:.25}45%,72%{transform:none;opacity:1}}"
    },
    {
      "id": "popover",
      "zh": "原生弹出层",
      "en": "Popover",
      "dz": "原生 popover 提供轻量打开、关闭和 light-dismiss 行为。",
      "de": "Use native popover for lightweight open, close, and light-dismiss behavior.",
      "pz": "原生 popover 提供轻量打开、关闭和 light-dismiss 行为。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Use native popover for lightweight open, close, and light-dismiss behavior. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": ["popover"],
      "css": ".fx{width:170px;height:70px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 11.5px/1 var(--fx-mono);position:relative;overflow:visible}.fx::after{content:'';position:absolute;inset:-10px -14px 10px 14px;border-radius:10px;background:linear-gradient(#fbfcf9,#eef1ec);border:1px solid #c5d0c8;box-shadow:0 22px 34px -22px #2b3a4488;animation:po 3.8s ease-in-out infinite;z-index:-1}@keyframes po{0%,100%{transform:translate(12px,-14px) scale(.94);opacity:.2}45%,72%{transform:none;opacity:1}}"
    },
    {
      "id": "scroll-driven",
      "zh": "滚动驱动",
      "en": "Scroll-driven animation",
      "dz": "滚动驱动动画与视口关联并提供 reduced-motion 回退。",
      "de": "Link motion to scroll with a reduced-motion fallback.",
      "pz": "滚动驱动动画与视口关联并提供 reduced-motion 回退。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Link motion to scroll with a reduced-motion fallback. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": ["scroll()"],
      "css": ".fx{width:186px;height:86px;border-radius:12px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 11.5px/1 var(--fx-mono);position:relative;overflow:hidden}.fx::after{content:'';position:absolute;left:0;right:0;bottom:0;height:100%;background:linear-gradient(180deg,#3f6f9200,#3f6f9244);transform-origin:bottom;animation:sd 4s linear infinite}@keyframes sd{0%{transform:scaleY(0)}100%{transform:scaleY(1)}}"
    },
    {
      "id": "view-transition",
      "zh": "视图过渡",
      "en": "View transition",
      "dz": "视图过渡命名共享元素，失败时不阻塞导航。",
      "de": "Name shared elements without blocking navigation on failure.",
      "pz": "视图过渡命名共享元素，失败时不阻塞导航。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Name shared elements without blocking navigation on failure. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": ["::view-transition"],
      "css": ".fx{width:186px;height:88px;border-radius:12px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 10.5px/1 var(--fx-mono);position:relative;overflow:hidden}.fx::after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,#3f6f92,#5f8fb0);transform:translateY(100%);animation:vt 4s cubic-bezier(.2,.9,.3,1) infinite}@keyframes vt{0%,12%{transform:translateY(100%)}48%,70%{transform:translateY(0)}94%,100%{transform:translateY(-100%)}}"
    },
    {
      "id": "content-visibility",
      "zh": "内容可见性",
      "en": "Content visibility",
      "dz": "长列表跳过屏外渲染并预估尺寸，恢复滚动位置。",
      "de": "Skip offscreen rendering with estimated size and stable scroll.",
      "pz": "长列表跳过屏外渲染并预估尺寸，恢复滚动位置。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Skip offscreen rendering with estimated size and stable scroll. Validate real data, failure recovery, and locale switching.",
      "demo": "list",
      "n": 4,
      "cells": ["首屏","屏外","屏外","屏外"],
      "css": ".fxcol{gap:7px;width:170px}.fx{height:30px;border-radius:7px;background:linear-gradient(#fff,#f3f5f1);border:1px solid #dfe3db;color:#202824;font:500 11px/1 var(--fx-sans);justify-content:flex-start;padding-left:11px;animation:cvx 4.2s ease-in-out infinite;animation-delay:calc(var(--i) * .16s)}.fx:nth-child(n+2){color:#b0b3a9}@keyframes cvx{0%,100%{opacity:.45}46%,70%{opacity:1}}"
    },
    {
      "id": "contain",
      "zh": "布局隔离",
      "en": "CSS containment",
      "dz": "contain 隔离布局、绘制和尺寸影响，减少大范围重排。",
      "de": "Isolate layout, paint, and size effects to reduce reflow.",
      "pz": "contain 隔离布局、绘制和尺寸影响，减少大范围重排。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Isolate layout, paint, and size effects to reduce reflow. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "cells": ["contain"],
      "css": ".fx{width:186px;height:86px;border-radius:12px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 12px/1 var(--fx-mono);position:relative;overflow:visible;contain:layout paint}.fx::after{content:'';position:absolute;inset:-10px;border-radius:16px;border:1.5px dashed #3f6f92;animation:cn 4.2s ease-in-out infinite}@keyframes cn{0%,100%{opacity:.3;transform:scale(.96)}48%,72%{opacity:1;transform:none}}"
    },
    {
      "id": "supports-query",
      "zh": "特性查询",
      "en": "Feature query",
      "dz": "特性查询为新能力提供渐进增强，不把旧浏览器当错误。",
      "de": "Use feature queries for progressive enhancement.",
      "pz": "特性查询为新能力提供渐进增强，不把旧浏览器当错误。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Use feature queries for progressive enhancement. Validate real data, failure recovery, and locale switching.",
      "demo": "panel",
      "n": 2,
      "css": ".fxstack{flex-direction:row;gap:10px;align-items:center}.fx:nth-child(1){width:56px;height:40px;border-radius:9px;background:linear-gradient(#3d7a52,#2f6440);color:#fff;font:700 14px/1 var(--fx-mono)}.fx:nth-child(2){width:110px;height:40px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 10px/1 var(--fx-mono);animation:sp 3.6s ease-in-out infinite}@keyframes sp{0%,100%{opacity:.45}48%,72%{opacity:1}}"
    },
    {
      "id": "css-audit",
      "zh": "CSS 审查",
      "en": "CSS audit",
      "dz": "发布前检查级联、主题、RTL、性能、兼容和无障碍。",
      "de": "Audit cascade, theme, RTL, performance, compatibility, and accessibility.",
      "pz": "发布前检查级联、主题、RTL、性能、兼容和无障碍。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Audit cascade, theme, RTL, performance, compatibility, and accessibility. Validate real data, failure recovery, and locale switching.",
      "demo": "list",
      "n": 4,
      "cells": ["未用选择器 0","重复声明 2","层级 ≤ 3","对比度达标"],
      "css": ".fxcol{gap:6px;width:188px}.fx{height:28px;border-radius:7px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#202824;font:500 10.5px/1 var(--fx-mono);justify-content:flex-start;padding:0 28px 0 10px;position:relative;animation:csa 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}.fx::after{content:'✓';position:absolute;right:10px;color:#3d7a52;font-family:var(--fx-mono);opacity:0;animation:csac 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}@keyframes csa{0%,100%{opacity:.55}42%,66%{opacity:1}}@keyframes csac{0%,100%{opacity:0}45%,72%{opacity:1}}"
    }
  ,
{
 "id": "clamp-function",
 "zh": "流值夹紧",
 "en": "clamp()",
 "dz": "一个值被限制在上下界之间，随中间项流动。",
 "de": "A value flows with its middle term but never leaves the floor and ceiling.",
 "pz": "font-size:clamp(14px,4vw,40px)：中项随视口流动，上下界封死极值。指挥 AI 说「用 clamp 夹紧字号」即此机制。",
 "pe": "font-size:clamp(14px,4vw,40px) — the middle term flows, the bounds cap the extremes.",
 "aliases": [],
 "demo": "box",
 "css": "@property --sweep{syntax:'<length>';inherits:false;initial-value:0px}@keyframes fxk{from{--sweep:0px}to{--sweep:520px}}.fx{width:clamp(90px,var(--sweep),240px);height:64px;border-radius:12px;background:#BFDDF4;border:1px solid #587A94;display:flex;align-items:center;justify-content:center;font:600 12px/1 var(--fx-sans,system-ui);color:#23232f;animation:fxk 4.5s ease-in-out infinite alternate}.fx::before{content:'clamp(90, sweep, 240)'}"
},
{
 "id": "min-function",
 "zh": "多值取小",
 "en": "min()",
 "dz": "一组值里总是取最小的一个。",
 "de": "Resolves to the smallest of the given values.",
 "pz": "width:min(80%, 320px)：让元素不超过 320px 又能随容器收缩。说「宽度用 min 封顶」即此。",
 "pe": "width:min(80%, 320px) caps the width while still allowing it to shrink.",
 "aliases": [],
 "demo": "box",
 "css": "@property --sweep{syntax:'<length>';inherits:false;initial-value:0px}@keyframes fxk{from{--sweep:60px}to{--sweep:400px}}.fx{width:min(var(--sweep),200px);height:56px;border-radius:12px;background:#BFDDF4;border:1px solid #587A94;display:flex;align-items:center;justify-content:center;font:600 12px/1 var(--fx-sans,system-ui);color:#23232f;animation:fxk 4s ease-in-out infinite alternate}.fx::before{content:'min(sweep, 200)'}"
},
{
 "id": "max-function",
 "zh": "多值取大",
 "en": "max()",
 "dz": "一组值里总是取最大的一个。",
 "de": "Resolves to the largest of the given values.",
 "pz": "width:max(120px, 30%)：给元素保底宽度。说「用 max 保底」即此。",
 "pe": "width:max(120px, 30%) gives the element a guaranteed minimum width.",
 "aliases": [],
 "demo": "box",
 "css": "@property --sweep{syntax:'<length>';inherits:false;initial-value:400px}@keyframes fxk{from{--sweep:400px}to{--sweep:60px}}.fx{width:max(var(--sweep),140px);height:56px;border-radius:12px;background:#C5E2D7;border:1px solid #58766B;display:flex;align-items:center;justify-content:center;font:600 12px/1 var(--fx-sans,system-ui);color:#23232f;animation:fxk 4s ease-in-out infinite alternate}.fx::before{content:'max(sweep, 140)'}"
},
{
 "id": "calc-function",
 "zh": "表达式尺寸",
 "en": "calc()",
 "dz": "长度、百分比与数可以在一个表达式里加减乘除。",
 "de": "Lengths, percentages and numbers combine in one arithmetic expression.",
 "pz": "width:calc(50% - 24px)：混合单位做减法是 calc 的招牌。说「留出 24px 用 calc 算」即此。",
 "pe": "width:calc(50% - 24px) mixes units with subtraction — calc's signature move.",
 "aliases": [],
 "demo": "box",
 "css": "@property --sweep{syntax:'<length>';inherits:false;initial-value:0px}@keyframes fxk{from{--sweep:0px}to{--sweep:300px}}.fx{width:calc(var(--sweep) * 0.5 + 48px);height:56px;border-radius:12px;background:#BFDDF4;border:1px solid #587A94;display:flex;align-items:center;justify-content:center;font:600 12px/1 var(--fx-sans,system-ui);color:#23232f;animation:fxk 4s ease-in-out infinite alternate}.fx::before{content:'calc(sweep*.5 + 48px)'}"
},
{
 "id": "border-box-sizing",
 "zh": "边盒计算",
 "en": "box-sizing: border-box",
 "dz": "padding 与 border 算进声明的宽高之内。",
 "de": "Padding and border are counted inside the declared width and height.",
 "pz": "全局 * { box-sizing:border-box } 是现代布局起点；内撑 padding 不再撑破宽度。说「用 border-box」即此。",
 "pe": "* { box-sizing:border-box } is the modern default: padding no longer grows the box.",
 "aliases": [],
 "demo": "box",
 "css": "@keyframes fxk{from{padding:6px}to{padding:44px}}.fx{box-sizing:border-box;width:220px;height:150px;padding:6px;border:10px solid #587A94;border-radius:14px;background:#BFDDF4;animation:fxk 3.2s ease-in-out infinite alternate;display:flex;align-items:flex-end;justify-content:center;font:600 11px/1 var(--fx-sans,system-ui);color:#23232f}.fx::before{content:'外框恒 220px，内腔被 padding 挤小'}"
},
{
 "id": "text-box-trim",
 "zh": "前导修剪",
 "en": "text-box-trim",
 "dz": "把文字块首行上方与末行下方的多余空隙裁掉。",
 "de": "Trims the space above the first line and below the last line of a text block.",
 "pz": "text-box:trim-both cap alphabetic：标题在卡片里顶到视觉边缘。说「修剪文字上下空隙」即此。",
 "pe": "text-box:trim-both cap alphabetic pulls headings flush to the visual edge.",
 "aliases": [
  {
   "term": "text-box",
   "language": "en",
   "scope": "text-box 是 trim+edge 的简写形式"
  }
 ],
 "demo": "text",
 "css": ".fx{display:block;font:700 clamp(34px,6vw,58px)/1.35 var(--fx-sans,system-ui);letter-spacing:-.02em;color:#23232f;text-box:trim-both cap alphabetic;background:linear-gradient(#BFDDF4,#BFDDF4) 0 0/100% 100% no-repeat;border-block:2px dashed #587A94;padding-block:2px}"
},
{
 "id": "text-box-edge",
 "zh": "修剪边缘",
 "en": "text-box-edge",
 "dz": "决定按字体的哪个度量线来修剪（cap 高度、x 高度等）。",
 "de": "Chooses which font metric line the trim uses (cap height, x-height, …).",
 "pz": "text-box-edge:cap alphabetic 对齐大写字顶；ex alphabetic 对齐 x 高度，中英文混排可选不同基准。说「按 cap 修剪」即此。",
 "pe": "text-box-edge:cap alphabetic trims to the top of capitals; ex alphabetic trims to the x-height.",
 "aliases": [],
 "demo": "text",
 "css": ".fx{display:block;font:700 clamp(30px,5.4vw,52px)/1.5 var(--fx-sans,system-ui);color:#23232f}.fx::before{content:'CAP 修剪 cap alphabetic';display:block;font-size:.62em;color:#587A94;text-box:trim-both cap alphabetic;background:#BFDDF4;border-block:2px solid #587A94}.fx::after{content:'X 修剪 ex alphabetic';display:block;font-size:.62em;color:#58766B;text-box:trim-both ex alphabetic;background:#C5E2D7;border-block:2px solid #58766B}"
},
{
 "id": "overflow-clip",
 "zh": "溢出裁剪",
 "en": "overflow: clip",
 "dz": "内容在盒边缘被直接裁断，且不产生滚动容器。",
 "de": "Content is cut at the box edge without creating a scroll container.",
 "pz": "overflow:clip 让元素保持非滚动容器（sticky/锚点等行为不受影响），还能配 overflow-clip-margin 留出溢出带。说「裁掉但别变滚动盒」即此。",
 "pe": "overflow:clip clips without making the box a scroll container.",
 "aliases": [],
 "demo": "box",
 "css": "@keyframes fxk{from{transform:translateX(0)}to{transform:translateX(120px)}}.fx{overflow:clip;overflow-clip-margin:0px;position:relative;width:230px;height:120px;border-radius:14px;background:#BFDDF4;border:1px solid #587A94}.fx::before{content:'';position:absolute;top:24px;left:12px;width:180px;height:34px;border-radius:8px;background:#F2CBDD;border:1px solid #8A677A;animation:fxk 3s ease-in-out infinite alternate}.fx::after{content:'clip：粉色块越界部分被裁断，盒子不成为滚动容器';position:absolute;bottom:8px;left:12px;right:12px;font:600 10px/1.5 var(--fx-sans,system-ui);color:#587A94}"
},
{
 "id": "zoom-property",
 "zh": "等比缩放",
 "en": "zoom",
 "dz": "直接缩放元素及其布局尺寸，后续内容跟着让位。",
 "de": "Scales the element and its layout box, pushing later content aside.",
 "pz": "zoom:1.25 会改变布局流（与 transform 不同，后者不影响布局）。需要「真的变大占位」用 zoom。说「整体放大 1.25 倍」即此。",
 "pe": "zoom:1.25 changes layout, unlike transform:scale which only paints bigger.",
 "aliases": [],
 "demo": "box",
 "css": "@keyframes fxk{from{zoom:1}to{zoom:1.45}}.fx{display:block;animation:fxk 3.4s ease-in-out infinite alternate}.fx::before{content:'zoom（参与布局，下方让位）';display:block;width:150px;height:44px;border-radius:10px;background:#BFDDF4;border:1px solid #587A94;font:600 10px/44px var(--fx-sans,system-ui);color:#23232f;text-align:center;margin-bottom:10px}.fx::after{content:'transform（只画不变占）';display:block;width:150px;height:44px;border-radius:10px;background:#F2CBDD;border:1px solid #8A677A;font:600 10px/44px var(--fx-sans,system-ui);color:#23232f;text-align:center;transform:scale(1.45);transform-origin:left top}"
},
{
 "id": "inset-shorthand",
 "zh": "四边内嵌",
 "en": "inset",
 "dz": "一条声明同时设定上下左右四个偏移。",
 "de": "One declaration sets all four offsets.",
 "pz": "inset:0 让浮层铺满定位父级；inset:14px 四边留 14px。说「四边内嵌」即此。",
 "pe": "inset:0 fills the positioned ancestor; inset:14px leaves a 14px frame.",
 "aliases": [],
 "demo": "box",
 "css": ".fxbox{position:relative;width:min(300px,88%);height:200px}.fx{position:absolute;inset:16px;width:auto;height:auto;border-radius:12px;background:#BFDDF4;border:1px dashed #587A94;display:flex;align-items:center;justify-content:center;font:600 11px/1 var(--fx-sans,system-ui);color:#587A94}.fx::before{content:'inset:16px — 四边等距让位'}"
},
{
 "id": "logical-inset",
 "zh": "逻辑内嵌",
 "en": "inset-block / inset-inline",
 "dz": "按书写方向的逻辑轴设偏移，RTL 自动翻转。",
 "de": "Offsets follow writing direction and flip automatically in RTL.",
 "pz": "inset-inline-start:16px 在阿语界面自动变成右侧。逻辑属性是国际化布局的默认选择。说「跟书写方向走」即此。",
 "pe": "inset-inline-start:16px lands on the right in RTL automatically.",
 "aliases": [],
 "demo": "box",
 "css": ".fxbox{position:relative;width:min(300px,88%);height:200px}.fx{position:absolute;inset-block-start:16px;inset-inline-start:16px;inset-block-end:auto;inset-inline-end:auto;width:auto;height:auto;padding:10px 16px;border-radius:12px;background:#C5E2D7;border:1px dashed #58766B;display:flex;align-items:center;justify-content:center;font:600 11px/1 var(--fx-sans,system-ui);color:#58766B}.fx::before{content:'仅逻辑起点内嵌：LTR 在左，RTL 自动到右'}"
},
{
 "id": "logical-radius",
 "zh": "逻辑圆角",
 "en": "border-start-start-radius",
 "dz": "圆角跟着书写方向走：起点角在 RTL 里自动换边。",
 "de": "The corner follows writing direction and lands on the other side in RTL.",
 "pz": "气泡组件用 border-start-start-radius:18px，阿语里圆角自动出现在右上。说「起点角大圆角」即此。",
 "pe": "border-start-start-radius:18px moves the round corner to the top-right in RTL.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{width:210px;height:110px;background:#BFDDF4;border:1px solid #587A94;border-start-start-radius:36px;border-end-end-radius:12px;display:flex;align-items:flex-end;justify-content:flex-start;padding:12px;font:600 10px/1.5 var(--fx-sans,system-ui);color:#587A94;box-sizing:border-box}.fx::before{content:'起点角 36px：LTR 在左上，RTL 自动到右上'}"
},
{
 "id": "shape-margin",
 "zh": "形状外边距",
 "en": "shape-margin",
 "dz": "在环绕形状外再撑出一圈空隙。",
 "de": "Pushes a margin outside the wrap shape.",
 "pz": "shape-margin:16px 让文字离圆形轮廓再远 16px。它是 shape-outside 的具名配套属性。说「环绕再退一圈」即此。",
 "pe": "shape-margin:16px pushes text 16px off the wrap shape.",
 "aliases": [],
 "demo": "box",
 "css": "@keyframes fxk{from{shape-margin:4px}to{shape-margin:34px}}.fx{display:block;overflow:hidden;height:150px;font:500 10.5px/1.75 var(--fx-sans,system-ui);color:#23232f}.fx::before{content:'';float:left;width:104px;height:104px;margin:6px;border-radius:50%;background:#BFDDF4;border:1px solid #587A94;shape-outside:circle(50%);shape-margin:4px;animation:fxk 3.6s ease-in-out infinite alternate}.fx::after{content:'环形文字随 shape-margin 动画被不断推离圆形轮廓，行盒重新计算但不改变浮动框本身。';display:block}"
},
{
 "id": "shape-image-threshold",
 "zh": "形状透明阈值",
 "en": "shape-image-threshold",
 "dz": "用图像的 alpha 通道定义环绕边界，阈值决定算不算形。",
 "de": "Uses the alpha channel as the shape; the threshold sets what counts.",
 "pz": "shape-image-threshold:.5 表示 alpha≥0.5 的像素参与环绕。渐变图配阈值动画可看到边界滑动。说「按透明度绕」即此。",
 "pe": "shape-image-threshold:.5 wraps around pixels with alpha >= .5.",
 "aliases": [],
 "demo": "box",
 "css": "@keyframes fxk{from{shape-image-threshold:.15}to{shape-image-threshold:.85}}.fx{display:block;overflow:hidden;height:150px;font:500 10.5px/1.7 var(--fx-sans,system-ui);color:#23232f}.fx::before{content:'';float:left;width:120px;height:120px;margin:4px;background:linear-gradient(135deg,rgba(191,221,244,1) 0%,rgba(191,221,244,0) 100%);shape-outside:linear-gradient(135deg,rgba(0,0,0,1) 0%,rgba(0,0,0,0) 100%);shape-image-threshold:.5;animation:fxk 3.8s ease-in-out infinite alternate}.fx::after{content:'阈值动画让环绕边界沿渐变来回滑动：同一张渐变，alpha 达标区在变。';display:block}"
},
{
 "id": "image-set",
 "zh": "分辨率图像候选",
 "en": "image-set()",
 "dz": "为不同像素密度声明多张候选图，浏览器自选。",
 "de": "Declares density-tagged image candidates; the browser picks one.",
 "pz": "background:image-set('a.png' 1x,'a@2x.png' 2x)。说「按密度换图」即此。",
 "pe": "image-set('a.png' 1x,'a@2x.png' 2x) swaps by device density.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{width:230px;height:130px;border-radius:12px;border:1px solid #587A94;background-image:image-set(url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23BFDDF4'/%3E%3Ctext x='20' y='26' font-size='12' text-anchor='middle' fill='%23587A94'%3E1x%3C/text%3E%3C/svg%3E\") 1x, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23F2CBDD'/%3E%3Ctext x='20' y='26' font-size='12' text-anchor='middle' fill='%238A677A'%3E2x%3C/text%3E%3C/svg%3E\") 2x);background-size:cover;background-position:center;display:flex;align-items:flex-end;justify-content:center}.fx::before{content:'当前屏幕密度选中的候选图（1x 屏显示雾蓝，2x 屏显示晶粉）';font:600 10px/1.5 var(--fx-sans,system-ui);color:#587A94;padding:8px;text-align:center}"
},
{
 "id": "resize-handle",
 "zh": "手动调整手柄",
 "en": "resize",
 "dz": "让用户拖动元素右下角直接改尺寸。",
 "de": "Lets users drag the corner to resize the box.",
 "pz": "resize:vertical 配 overflow:auto 出现拖拽手柄，常用于文本域。说「允许拖拽调高」即此。",
 "pe": "resize:vertical with overflow:auto adds a drag handle.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{width:230px;height:130px;min-height:90px;resize:vertical;overflow:auto;background:#BFDDF4;border:1px solid #587A94;border-radius:12px;padding:12px;box-sizing:border-box;font:600 10.5px/1.7 var(--fx-sans,system-ui);color:#587A94}.fx::before{content:'抓住右下角手柄拖动：只有高度可调（resize:vertical）'}"
},
{
 "id": "animation-composition",
 "zh": "动画合成方式",
 "en": "animation-composition",
 "dz": "多个动画作用于同一属性时：替换、累加还是叠加。",
 "de": "Chooses replace, add or add-underlying when animations stack.",
 "pz": "animation-composition:add 让第二段动画在第一段结果上继续累加位移。说「在原动画上累加」即此。",
 "pe": "animation-composition:add stacks the second animation on the first.",
 "aliases": [],
 "demo": "box",
 "css": "@keyframes fxk{from{translate:0 0}to{translate:60px 0}}@keyframes fxj{from{translate:0 0}to{translate:0 -44px}}.fx{display:block}.fx::before{content:'add：两段位移叠加走斜线';display:block;width:46px;height:46px;border-radius:10px;background:#F2CBDD;border:1px solid #8A677A;font:600 9px/1.4 var(--fx-sans,system-ui);color:#8A677A;text-align:center;animation:fxk 2.2s ease-in-out infinite alternate,fxj 2.2s ease-in-out infinite alternate;animation-composition:add;margin-bottom:14px}.fx::after{content:'replace：后段覆盖前段只走竖线';display:block;width:46px;height:46px;border-radius:10px;background:#BFDDF4;border:1px solid #587A94;font:600 9px/1.4 var(--fx-sans,system-ui);color:#587A94;text-align:center;animation:fxk 2.2s ease-in-out infinite alternate,fxj 2.2s ease-in-out infinite alternate}"
},
{
 "id": "currentcolor-keyword",
 "zh": "随动文字色",
 "en": "currentColor",
 "dz": "颜色关键字取当前元素的 color 值。",
 "de": "Resolves to the element's own color value.",
 "pz": "border-color:currentColor 让边框跟文字同色，改一处全跟。说「跟文字色」即此。",
 "pe": "border-color:currentColor keeps the border matched to the text color.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{width:210px;height:110px;border-radius:12px;color:#587A94;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;font:600 11px/1.6 var(--fx-sans,system-ui);text-align:center;box-sizing:border-box;transition:color .8s;animation:fxk 3.2s ease-in-out infinite alternate}@keyframes fxk{from{color:#587A94}to{color:#8A677A}}.fx::before{content:'边框与文字同色：currentColor 随 color 动画一起变'}"
},
{
 "id": "font-size-adjust",
 "zh": "x高比校正",
 "en": "font-size-adjust",
 "dz": "以 x 高度而非字号为基准对齐备选字体的视觉大小。",
 "de": "Matches fallback fonts by x-height instead of em size.",
 "pz": "font-size-adjust:0.52 让中英混排的备选字体看起来一样大。说「按 x 高对齐字体」即此。",
 "pe": "font-size-adjust:0.52 equalizes visual size across fallback fonts.",
 "aliases": [],
 "demo": "text",
 "css": ".fx{display:block;font-size:clamp(13px,2.2vw,19px);color:#23232f;padding:8px;overflow:hidden}.fx::before{content:'Monaco：未校正';display:block;font-family:Monaco,monospace;border-bottom:2px solid #8A677A;margin-bottom:10px}.fx::after{content:'Monaco：adjust 校正后';display:block;font-family:Monaco,monospace;font-size-adjust:0.54;border-bottom:2px solid #58766B;color:#58766B}"
}
,
{
 "id": "first-child",
 "zh": "首子匹配",
 "en": ":first-child",
 "dz": "只命中作为第一个子元素的节点。",
 "de": "Matches only elements that are the first child of their parent.",
 "pz": ".item:first-child 选中列表第一项，无需 JS 打标。说「第一项特殊样式」即此。",
 "pe": ".item:first-child styles the first item without JS flags.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:40px;border-radius:8px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box}.fx:first-child{background:#F2CBDD;border-color:#8A677A}.fx:first-child::after{content:'我是第一个孩子 → 命中 :first-child';font:600 10px/40px var(--fx-sans,system-ui);color:#8A677A;padding-left:12px}"
},
{
 "id": "last-child",
 "zh": "末子匹配",
 "en": ":last-child",
 "dz": "只命中作为最后一个子元素的节点。",
 "de": "Matches only the last child of its parent.",
 "pz": "列表末项去分隔线：.item:last-child{border-bottom:0}。说「最后一项」即此。",
 "pe": ".item:last-child{border-bottom:0} drops the final divider.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:40px;border-radius:8px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box}.fx:last-child{background:#C5E2D7;border-color:#58766B}.fx:last-child::after{content:'我是最后一个孩子 → 命中 :last-child';font:600 10px/40px var(--fx-sans,system-ui);color:#58766B;padding-left:12px}"
},
{
 "id": "only-child",
 "zh": "独子匹配",
 "en": ":only-child",
 "dz": "命中没有任何兄弟的元素。",
 "de": "Matches elements with no siblings at all.",
 "pz": "单卡片布局与多卡片布局的样式分叉：.card:only-child{max-width:480px}。说「只有一个孩子时」即此。",
 "pe": ".card:only-child{max-width:480px} adapts single-card layouts.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:40px;border-radius:8px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box}.fx:only-child{background:#F2CBDD;border-color:#8A677A}.fx:only-child::after{content:'整个列表只有我 → 命中 :only-child';font:600 10px/40px var(--fx-sans,system-ui);color:#8A677A;padding-left:12px}"
},
{
 "id": "nth-child",
 "zh": "序位公式匹配",
 "en": ":nth-child()",
 "dz": "用 An+B 公式按位置批量选中兄弟。",
 "de": "Selects siblings by position with the An+B micro-syntax.",
 "pz": "斑马纹 li:nth-child(2n)；隔行高亮 nth-child(4n+1)。说「偶数行」「隔三选一」即此。",
 "pe": "li:nth-child(2n) zebra-stripes lists; An+B encodes any rhythm.",
 "aliases": [
  {
   "term": "An+B",
   "language": "en",
   "scope": "位置微语法的规范名"
  }
 ],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:38px;border-radius:8px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box}.fx:nth-child(2n){background:#F2CBDD;border-color:#8A677A}.fx:nth-child(2n)::after{content:'偶数位 → nth-child(2n)';font:600 10px/38px var(--fx-sans,system-ui);color:#8A677A;padding-left:12px}"
},
{
 "id": "nth-last-child",
 "zh": "逆序位匹配",
 "en": ":nth-last-child()",
 "dz": "从末尾往前数的 An+B 位置匹配。",
 "de": "An+B position matching counted from the end.",
 "pz": "最后两项特殊处理：.item:nth-last-child(-n+2){color:...}。说「从后往前数」即此。",
 "pe": ".item:nth-last-child(-n+2) targets the final two items.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:38px;border-radius:8px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box}.fx:nth-last-child(-n+2){background:#C5E2D7;border-color:#58766B}.fx:nth-last-child(-n+2)::after{content:'从末尾数前两个 → nth-last-child(-n+2)';font:600 10px/38px var(--fx-sans,system-ui);color:#58766B;padding-left:12px}"
},
{
 "id": "nth-of-type",
 "zh": "同类序匹配",
 "en": ":nth-of-type()",
 "dz": "只统计同类型标签的序号做 An+B 匹配。",
 "de": "An+B matching indexed among same-type siblings only.",
 "pz": "文章里隔段插图：img:nth-of-type(2n){margin-inline:auto}。说「同类里第几个」即此。",
 "pe": "img:nth-of-type(2n) targets every second image among siblings.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:38px;border-radius:8px;background:#d9dde2;border:1px dashed #77796f;box-sizing:border-box}.fx:nth-of-type(2n){background:#F2CBDD;border:1px solid #8A677A}.fx:nth-of-type(2n)::after{content:'同类偶数位 → nth-of-type(2n)（虚线是其他类型兄弟）';font:600 10px/38px var(--fx-sans,system-ui);color:#8A677A;padding-left:10px}.fx:nth-of-type(odd){border-style:dashed}"
},
{
 "id": "only-of-type",
 "zh": "同类独子",
 "en": ":only-of-type",
 "dz": "命中同类型兄弟中唯一的那个。",
 "de": "Matches elements that are the only one of their type among siblings.",
 "pz": "一篇文章唯一的 <img> 特殊排版：img:only-of-type{width:100%}。说「同类型里唯一」即此。",
 "pe": "img:only-of-type{width:100%} styles the lone image in an article.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:38px;border-radius:8px;background:#d9dde2;border:1px dashed #77796f;box-sizing:border-box}.fx:nth-child(3){background:#C5E2D7;border:1px solid #58766B}.fx:nth-child(3)::after{content:'同类唯一 → :only-of-type（虚线是其他类型）';font:600 10px/38px var(--fx-sans,system-ui);color:#58766B;padding-left:10px}"
},
{
 "id": "empty-pseudo",
 "zh": "空内容匹配",
 "en": ":empty",
 "dz": "命中没有任何子节点（含文本）的元素。",
 "de": "Matches elements with no children at all, not even text.",
 "pz": "空购物车占位：.badge:empty{display:none} 隐藏零计数气泡。说「空的时候藏掉」即此。",
 "pe": ".badge:empty{display:none} hides empty counter badges.",
 "aliases": [],
 "demo": "grid",
 "css": ".fxgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:12px;background:#eceee6;border-radius:12px;width:min(340px,90%);box-sizing:border-box}.fx{height:64px;border-radius:10px;background:#BFDDF4;border:1px solid #587A94;display:flex;align-items:center;justify-content:center;font:600 10px/1.4 var(--fx-sans,system-ui);color:#587A94}.fx:nth-child(2){background:#F2CBDD;border-color:#8A677A;color:#8A677A}.fx:nth-child(2)::after{content:'我有文本 → 不算空'}"
},
{
 "id": "root-pseudo",
 "zh": "文档根匹配",
 "en": ":root",
 "dz": "命中文档树根元素，也是自定义属性的默认家。",
 "de": "Matches the document root; the default home for design tokens.",
 "pz": ":root{--brand:...} 存全局设计变量，特异性高于 html 选择器。说「全局变量挂根上」即此。",
 "pe": ":root{--brand:...} hosts global tokens with higher specificity than html.",
 "aliases": [],
 "demo": "box",
 "css": ":root{--demo-ink:#587A94}.fx{width:300px;height:150px;border-radius:12px;background:#F6F7F5;border:3px solid var(--demo-ink);display:flex;align-items:center;justify-content:center;font:600 11px/1.8 var(--fx-mono,ui-monospace,monospace);color:var(--demo-ink);text-align:center;box-sizing:border-box;padding:12px}.fx::before{content':root 声明 --demo-ink：本卡的边框与文字色都从它取值'}"
},
{
 "id": "hover-pseudo",
 "zh": "悬停匹配",
 "en": ":hover",
 "dz": "指针悬停在元素上时命中。",
 "de": "Matches while the pointer rests over the element.",
 "pz": "触屏没有 hover：配合 @media (hover:hover) 包住悬停样式才是完整写法。说「悬停高亮」即此。",
 "pe": "Wrap hover styles in @media (hover:hover) for touch safety.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{width:220px;height:110px;border-radius:12px;background:#BFDDF4;border:1px solid #587A94;display:flex;align-items:center;justify-content:center;font:600 11px/1.6 var(--fx-sans,system-ui);color:#587A94;text-align:center;transition:background-color .25s,border-color .25s,color .25s;box-sizing:border-box;padding:10px}.fx::before{content:'把指针移到我身上 → 命中 :hover'}@media (hover:hover){.fx:hover{background:#F2CBDD;border-color:#8A677A;color:#8A677A}}"
},
{
 "id": "active-state-press",
 "zh": "按压匹配",
 "en": ":active",
 "dz": "元素被按住（鼠标按下到松开之间）时命中。",
 "de": "Matches between pointer-down and pointer-up on the element.",
 "pz": "按钮按下下沉 1px：.btn:active{transform:translateY(1px)}。说「按下去有反馈」即此。",
 "pe": ".btn:active{transform:translateY(1px)} gives press feedback.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{width:220px;height:110px;border-radius:12px;background:#C5E2D7;border:1px solid #58766B;display:flex;align-items:center;justify-content:center;font:600 11px/1.6 var(--fx-sans,system-ui);color:#58766B;text-align:center;transition:transform .12s,box-shadow .12s;box-shadow:0 3px 0 #58766B;box-sizing:border-box;padding:10px;user-select:none}.fx::before{content:'按住我不松手 → 命中 :active'}@media (hover:hover){.fx:active{transform:translateY(3px);box-shadow:0 0 0 #58766B}}"
},
{
 "id": "is-pseudo",
 "zh": "集合并匹配",
 "en": ":is()",
 "dz": "把一串选择器打包成一个，任一命中即命中，特异性取最高者。",
 "de": "Packs a selector list; matches if any argument matches and takes the highest specificity.",
 "pz": ":is(h1,h2,h3){margin:0 0 .5em} 代替重复书写。说「合并这几类」即此。",
 "pe": ":is(h1,h2,h3){margin:0 0 .5em} replaces repetition.",
 "aliases": [
  {
   "term": ":matches",
   "language": "en",
   "scope": "历史曾用名"
  }
 ],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:38px;border-radius:8px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box}.fx:is(:nth-child(1),:nth-child(4),:nth-child(6)){background:#F2CBDD;border-color:#8A677A}.fx:is(:nth-child(1),:nth-child(4),:nth-child(6))::after{content':is(1,4,6 号位) 一条搞定';font:600 10px/38px var(--fx-sans,system-ui);color:#8A677A;padding-left:12px}"
},
{
 "id": "where-pseudo",
 "zh": "零特异性匹配",
 "en": ":where()",
 "dz": "与 :is 同样的集合匹配，但对特异性贡献恒为 0。",
 "de": "Same matching as :is() but contributes zero specificity.",
 "pz": "主题默认样式用 :where 包一层，用户一条类名就能覆盖。说「零权重兜底」即此。",
 "pe": ":where() defaults lose to any single class — perfect overridable baselines.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:38px;border-radius:8px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box}.fx:where(:nth-child(2)){background:#F2CBDD;border-color:#8A677A}.fx:where(:nth-child(2))::after{content':where 命中 2 号位，但特异性为 0 可被任意覆盖';font:600 10px/38px var(--fx-sans,system-ui);color:#8A677A;padding-left:10px}"
},
{
 "id": "has-pseudo",
 "zh": "后向匹配",
 "en": ":has()",
 "dz": "按后代/兄弟的存在与否反选父级与前级。",
 "de": "Selects ancestors and predecessors by what they contain.",
 "pz": "卡片含图时换布局：.card:has(img){grid-template-columns:120px 1fr}。说「有图就走这套」即此。",
 "pe": ".card:has(img) switches the card layout when it contains an image.",
 "aliases": [
  {
   "term": "parent selector",
   "language": "en",
   "scope": "社区俗称"
  }
 ],
 "demo": "panel",
 "css": ".fxstack{width:270px;height:190px;border-radius:12px;background:#eceee6;position:relative;padding:12px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}.fxa{flex:1;border-radius:10px;background:#BFDDF4;border:1px solid #587A94;display:flex;align-items:center;justify-content:center;font:600 10px/1.5 var(--fx-sans,system-ui);color:#587A94;text-align:center;padding:6px}.fxb{position:absolute;top:14px;right:14px;width:70px;height:44px;border-radius:8px;background:#F2CBDD;border:1px solid #8A677A;font:600 9px/44px var(--fx-sans,system-ui);color:#8A677A;text-align:center}.fxa:has(+ .fxb){background:#C5E2D7;border-color:#58766B;color:#58766B}.fxa:has(+ .fxb)::before{content:'我后面跟着粉色块 → :has(+ .fxb) 命中，绿色就是反选证据'}"
},
{
 "id": "not-pseudo",
 "zh": "排除匹配",
 "en": ":not()",
 "dz": "命中不满足括号内选择器的元素。",
 "de": "Matches elements that fail the argument selector.",
 "pz": "除最后一项都加线：.item:not(:last-child){border-bottom:1px solid ...}。说「除了它都算」即此。",
 "pe": ".item:not(:last-child) styles everything except the last.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:38px;border-radius:8px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box;border-bottom-width:3px;border-bottom-color:#587A94}.fx:not(:last-child){border-bottom-color:#8A677A;background:#F6F7F5}.fx:not(:last-child)::before{content:'非末项 → :not(:last-child)（末项保持雾蓝薄边）';font:600 10px/38px var(--fx-sans,system-ui);color:#8A677A;padding-left:12px}"
},
{
 "id": "before-pseudo",
 "zh": "前置生成内容",
 "en": "::before",
 "dz": "在元素内容前生成一个可样式的伪元素盒子。",
 "de": "Generates a stylable box before the element's content.",
 "pz": "content 是必填项（可为空串）。图标、徽标、装饰线全靠它，不用改 HTML。说「前面加个东西」即此。",
 "pe": "content is mandatory (can be ''); decoration without touching HTML.",
 "aliases": [
  {
   "term": ":before",
   "language": "en",
   "scope": "CSS2 单冒号旧写法"
  }
 ],
 "demo": "box",
 "css": ".fx{width:240px;height:120px;border-radius:12px;background:#F6F7F5;border:1px solid #77796f;display:flex;align-items:center;justify-content:center;font:600 12px/1 var(--fx-sans,system-ui);color:#23232f;box-sizing:border-box}.fx::before{content:'★ 生成的徽标';background:#BFDDF4;border:1px solid #587A94;color:#587A94;border-radius:999px;padding:6px 12px;margin-right:10px;font-size:10px}"
},
{
 "id": "after-pseudo",
 "zh": "后置生成内容",
 "en": "::after",
 "dz": "在元素内容后生成可样式化的伪元素盒子。",
 "de": "Generates a stylable box after the element's content.",
 "pz": "必填链接后缀 a[href^=http]::after{content:' ↗'}；清除浮动的经典载体。说「尾部补个东西」即此。",
 "pe": "a[href^=http]::after{content:' ↗'} marks external links.",
 "aliases": [
  {
   "term": ":after",
   "language": "en",
   "scope": "CSS2 单冒号旧写法"
  }
 ],
 "demo": "box",
 "css": ".fx{width:240px;height:120px;border-radius:12px;background:#F6F7F5;border:1px solid #77796f;display:flex;align-items:center;justify-content:center;font:600 12px/1 var(--fx-sans,system-ui);color:#23232f;box-sizing:border-box}.fx::after{content:'↗ 外链';background:#C5E2D7;border:1px solid #58766B;color:#58766B;border-radius:999px;padding:6px 12px;margin-left:10px;font-size:10px}"
},
{
 "id": "first-line-pseudo",
 "zh": "首行样式",
 "en": "::first-line",
 "dz": "只作用于块的首个排版行，随换行自动伸缩。",
 "de": "Styles only the first typeset line, however it wraps.",
 "pz": "p::first-line{font-variant-caps:small-caps} 首行小型大写。窗口变窄行数变，样式永远只跟第一行。说「只给第一行」即此。",
 "pe": "p::first-line{font-variant-caps:small-caps} follows the first line across resizes.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{display:block;width:min(320px,88%);height:150px;overflow:hidden;border-radius:12px;background:#F6F7F5;border:1px solid #77796f;padding:16px;box-sizing:border-box;font:500 11px/1.8 var(--fx-sans,system-ui);color:#77796f;text-align:justify}.fx::before{content:'首行采用小型大写并加深颜色：本段文字在窄容器里折行，::first-line 永远只命中排版后的第一行。其余文字保持默认灰绿色与常规字重，与首行形成清晰的编辑层级。';color:#23232f}.fx::first-line{font-variant-caps:small-caps;color:#587A94;font-weight:700;letter-spacing:.04em}"
},
{
 "id": "first-letter-pseudo",
 "zh": "首字下沉样式",
 "en": "::first-letter",
 "dz": "作用于块内第一个字形，可做杂志式首字下沉。",
 "de": "Targets the first glyph of a block for drop caps.",
 "pz": "p::first-letter{float:left;font-size:3.2em;line-height:.9} 经典首字下沉。说「首字放大」即此。",
 "pe": "p::first-letter{float:left;font-size:3.2em} — the classic drop cap.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{display:block;width:min(320px,88%);height:160px;overflow:hidden;border-radius:12px;background:#F6F7F5;border:1px solid #77796f;padding:14px 16px;box-sizing:border-box;font:500 11px/1.8 var(--fx-sans,system-ui);color:#77796f;text-align:justify}.fx::before{content:'首字下沉把段首字形放大并浮动，正文绕其右侧行进。这一手法源自中世纪抄本，是版面仪式感最便宜的来源。'}.fx::first-letter{float:left;font-size:3.4em;line-height:.85;padding:4px 8px 0 0;font-weight:700;color:#587A94}"
},
{
 "id": "selection-pseudo",
 "zh": "选区样式",
 "en": "::selection",
 "dz": "用户拖选文本时的高亮配色可完全定制。",
 "de": "Customizes the highlight when the user selects text.",
 "pz": "::selection{background:#BFDDF4;color:#23232f} 品牌化选区。只有少数属性生效（色系系）。说「选中文字的颜色」即此。",
 "pe": "::selection{background:#BFDDF4;color:#23232f} brands the highlight.",
 "aliases": [],
 "demo": "text",
 "css": ".fx{font:700 clamp(30px,5.6vw,52px)/1.2 var(--fx-sans,system-ui);letter-spacing:-.02em;color:#23232f}.fx::selection{background:#587A94;color:#F6F7F5}"
},
{
 "id": "marker-pseudo",
 "zh": "列表标记样式",
 "en": "::marker",
 "dz": "列表项前面的圆点/编号盒子可以单独配色换字。",
 "de": "The bullet or number box of a list item is independently styleable.",
 "pz": "li::marker{color:#587A94;font-weight:700} 换标记色。可用属性少（色与字体系）。说「改列表点颜色」即此。",
 "pe": "li::marker{color:#587A94} re-colors bullets.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{padding:12px 12px 12px 34px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{display:list-item;list-style:disc;min-height:34px;border-radius:8px;background:#F6F7F5;border:1px solid #77796f;box-sizing:border-box;padding:6px 12px;font:500 11px/1.6 var(--fx-sans,system-ui);color:#23232f;margin-bottom:8px}.fx::marker{color:#587A94;font-weight:700;font-size:1.2em}"
},
{
 "id": "descendant-combinator",
 "zh": "后代组合器",
 "en": "Descendant combinator",
 "dz": "空格连接：命中任意深度的后代。",
 "de": "A space: matches descendants at any depth.",
 "pz": ".card img{border-radius:8px} 卡内所有图。任意层级都算——太宽时用 > 收紧。说「里面的所有」即此。",
 "pe": ".card img{border-radius:8px} covers every nested image.",
 "aliases": [
  {
   "term": "space combinator",
   "language": "en",
   "scope": "记法俗称"
  }
 ],
 "demo": "panel",
 "css": ".fxstack{width:260px;height:190px;border-radius:12px;background:#eceee6;padding:14px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}.fxa{flex:1;border-radius:10px;background:#BFDDF4;border:1px solid #587A94;padding:10px;box-sizing:border-box;display:flex;gap:8px}.fxa::after{content:'容器 .fxa：其所有 .dot 后代都变粉';font:600 10px/1.5 var(--fx-sans,system-ui);color:#587A94;align-self:center}.fxb{flex:1;border-radius:10px;background:#F6F7F5;border:1px solid #77796f}.fxa>u{display:block;width:34px;height:34px;border-radius:8px;background:#8A677A;text-decoration:none}.fxa>u{background:#F2CBDD;border:1px solid #8A677A}"
},
{
 "id": "child-combinator",
 "zh": "子代组合器",
 "en": "Child combinator",
 "dz": "> 连接：只命中直接子元素。",
 "de": "The > combinator matches direct children only.",
 "pz": ".nav>li 只管一级菜单，二级不受影响。控制作用域首选。说「只管儿子这层」即此。",
 "pe": ".nav>li scopes to the first level only.",
 "aliases": [],
 "demo": "panel",
 "css": ".fxstack{width:260px;height:190px;border-radius:12px;background:#eceee6;padding:14px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}.fxa{flex:1;border-radius:10px;background:#BFDDF4;border:1px solid #587A94;padding:10px;box-sizing:border-box;display:flex;gap:8px;align-items:center}.fxa::after{content:'只有直接子块变粉，孙块保持灰绿';font:600 10px/1.5 var(--fx-sans,system-ui);color:#587A94;flex:1}.fxa>u{display:block;width:34px;height:34px;border-radius:8px;background:#F2CBDD;border:1px solid #8A677A;text-decoration:none;position:relative}.fxa>u::before{content:'';position:absolute;inset:8px;border-radius:6px;background:#C5E2D7;border:1px solid #58766B}"
},
{
 "id": "adjacent-sibling",
 "zh": "相邻兄弟组合器",
 "en": "Adjacent sibling combinator",
 "dz": "+ 连接：命中紧跟其后的那个兄弟。",
 "de": "The + combinator matches the immediately following sibling.",
 "pz": "标题后第一段：h2+p{margin-top:.5em}。表单错误提示紧贴输入框时用它。说「紧跟的那个」即此。",
 "pe": "h2+p{margin-top:.5em} touches only the first paragraph after a heading.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:36px;border-radius:8px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box;margin-bottom:8px}.fx:nth-child(2){background:#F2CBDD;border-color:#8A677A}.fx:nth-child(2)::after{content:'我紧跟 1 号 → 1 号 + 我 命中；3 号不受影响';font:600 10px/36px var(--fx-sans,system-ui);color:#8A677A;padding-left:12px}"
},
{
 "id": "general-sibling",
 "zh": "通用兄弟组合器",
 "en": "General sibling combinator",
 "dz": "~ 连接：命中其后所有符合条件的兄弟。",
 "de": "The ~ combinator matches every later qualifying sibling.",
 "pz": "复选框 checked 后联动后面所有行：.chk:checked ~ .row{...}。说「后面的都算」即此。",
 "pe": ".chk:checked ~ .row lights every later row.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{padding:12px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{height:36px;border-radius:8px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box;margin-bottom:8px}.fx:nth-child(2)~.fx{background:#C5E2D7;border-color:#58766B}.fx:nth-child(2)~.fx::after{content:'2 号之后的所有兄弟 → ~ 命中';font:600 10px/36px var(--fx-sans,system-ui);color:#58766B;padding-left:12px}"
},
{
 "id": "universal-selector",
 "zh": "通配选择器",
 "en": "Universal selector",
 "dz": "* 命中所有元素，常做全局重置与治理。",
 "de": "* matches every element — resets and governance.",
 "pz": "*,*::before,*::after{box-sizing:border-box} 现代重置第一行。说「所有元素」即此。",
 "pe": "*,*::before,*::after{box-sizing:border-box} opens every reset.",
 "aliases": [],
 "demo": "grid",
 "css": ".fxgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:12px;background:#eceee6;border-radius:12px;width:min(330px,90%);box-sizing:border-box}.fx{height:52px;border-radius:10px;background:#BFDDF4;outline:2px solid #587A94;outline-offset:2px}.fx::after{content:'*';font:700 14px/52px var(--fx-mono,ui-monospace,monospace);color:#587A94;text-align:center;display:block}"
},
{
 "id": "specificity-cascade",
 "zh": "特异性权重",
 "en": "Specificity",
 "dz": "三元组权重 (ID,类,类型) 决定谁说了算。",
 "de": "The (ID, class, type) triple decides which rule wins.",
 "pz": "比较规则：比高位，平局看出现顺序；:where 记 0、:is 记最高参。别再加 !important，先降特异性。说「权重打架」即此。",
 "pe": "Compare position by position, then source order; lower specificity beats !important refactors.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{width:min(310px,86%);height:150px;border-radius:12px;background:#F6F7F5;border:1px solid #77796f;box-sizing:border-box;padding:12px;display:flex;flex-direction:column;gap:6px;justify-content:center;font:600 10.5px/1.5 var(--fx-mono,ui-monospace,monospace);color:#23232f}.fx::before{content:'#id → (1,0,0) 最重';color:#8A677A}.fx::after{content:'.class → (0,1,0) 中量';color:#587A94}.fx>b{display:block;font:600 10.5px/1.5 var(--fx-mono,ui-monospace,monospace);color:#58766B;text-decoration:none}.fx>b::before{content:'div → (0,0,1) 最轻'}"
},
{
 "id": "css-inheritance",
 "zh": "属性继承",
 "en": "Inheritance",
 "dz": "部分属性自动传给后代，其余默认不传。",
 "de": "Some properties flow to descendants by default; others don't.",
 "pz": "color/font 继承、border/margin 不继承——理解这条就明白为何「框要每个都画」。控制用 inherit/initial/unset。说「让子元素也用」即此。",
 "pe": "color/font inherit; borders don't — hence explicit resets.",
 "aliases": [],
 "demo": "panel",
 "css": ".fxstack{width:270px;height:190px;border-radius:12px;background:#eceee6;padding:14px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;color:#587A94}.fxa{flex:1;border-radius:10px;background:#BFDDF4;border:2px solid #587A94;display:flex;align-items:center;justify-content:center;font:700 12px/1.6 var(--fx-sans,system-ui)}.fxa::before{content:'父：color 雾蓝 + 边框'}.fxb{flex:1;border-radius:10px;background:#F6F7F5;display:flex;align-items:center;justify-content:center;font:700 11px/1.6 var(--fx-sans,system-ui);text-align:center}.fxb::before{content:'子：颜色继承了（雾蓝字），边框没继承（无框）'}"
},
{
 "id": "media-query-rule",
 "zh": "媒体查询",
 "en": "@media",
 "dz": "按视口、偏好等条件包一层样式，条件外完全不生效。",
 "de": "Wraps styles in a device/preference condition.",
 "pz": "@media (max-width:640px) 是移动分支；@media (hover:none) 判断触屏。说「窄屏时」即此。",
 "pe": "@media (max-width:640px) branches for small screens.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{width:min(310px,86%);height:150px;border-radius:12px;background:#BFDDF4;border:1px solid #587A94;display:flex;align-items:center;justify-content:center;font:600 11px/1.7 var(--fx-sans,system-ui);color:#587A94;text-align:center;box-sizing:border-box;padding:12px}.fx::before{content:'当前视口 ≥ 560px：显示宽屏分支样式'}@media (max-width:559px){.fx{background:#F2CBDD;border-color:#8A677A;color:#8A677A}.fx::before{content:'视口 < 560px：切换为窄屏分支样式'}}"
},
{
 "id": "env-function",
 "zh": "安全区环境值",
 "en": "env()",
 "dz": "读浏览器/系统注入的环境变量，如刘海屏安全区。",
 "de": "Reads UA-injected environment variables like safe-area insets.",
 "pz": "padding-bottom:env(safe-area-inset-bottom) 适配 iPhone 底部横条；viewport-fit=cover 是前提。说「避开小黑条」即此。",
 "pe": "env(safe-area-inset-bottom) clears the home indicator.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{width:min(300px,86%);height:150px;border-radius:12px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font:600 11px/1.6 var(--fx-sans,system-ui);color:#587A94;text-align:center;padding:12px 12px max(12px, env(safe-area-inset-bottom))}.fx::before{content:'env(safe-area-inset-bottom) 当前值：本机为 0px（无刘海）'}"
},
{
 "id": "custom-properties",
 "zh": "自定义属性变量",
 "en": "Custom properties",
 "dz": "以 -- 开头的属性可声明、继承并由 var() 消费。",
 "de": "--prefixed properties are declared, inherited and consumed via var().",
 "pz": "--brand:#587A94 声明一次，var(--brand, #ccc) 处处消费，带兜底值。主题换色只改一处。说「用变量」即此。",
 "pe": "--brand once, var(--brand, #ccc) everywhere, with fallback.",
 "aliases": [
  {
   "term": "CSS variables",
   "language": "en",
   "scope": "社区俗称"
  }
 ],
 "demo": "box",
 "css": ".fx{--brand:#587A94;width:min(300px,86%);height:140px;border-radius:12px;background:var(--brand);border:1px solid var(--brand);display:flex;align-items:center;justify-content:center;font:600 11px/1.7 var(--fx-sans,system-ui);color:#F6F7F5;text-align:center;box-sizing:border-box;padding:10px;transition:background-color .8s;animation:fxk 3.4s ease-in-out infinite alternate}@keyframes fxk{from{--brand:#587A94}to{--brand:#8A677A}}.fx::before{content:'背景、边框、文字色全部引用 --brand：改一处全联动'}"
},
{
 "id": "keyframes-rule",
 "zh": "关键帧规则",
 "en": "@keyframes",
 "dz": "把动画沿时间轴的采样点写成命名规则，animation 引用播放。",
 "de": "Named keyframe rules sampled along the timeline, played by animation.",
 "pz": "@keyframes fxk{from{...}to{...}} 配 animation:fxk 1s infinite。中间可插任意百分比帧。说「按帧编排」即此。",
 "pe": "@keyframes fxk{from{}to{}} referenced by the animation shorthand.",
 "aliases": [],
 "demo": "box",
 "css": "@keyframes fxk{0%{transform:translateX(0);background:#BFDDF4}45%{transform:translateX(180px);background:#F2CBDD}60%{transform:translateX(180px);background:#F2CBDD}100%{transform:translateX(0);background:#BFDDF4}}.fx{width:64px;height:64px;border-radius:14px;border:1px solid #587A94;animation:fxk 3.6s ease-in-out infinite;margin:0 auto}"
},
{
 "id": "font-face-rule",
 "zh": "字体面声明",
 "en": "@font-face",
 "dz": "声明一个可下载的自定义字体面，供 font-family 引用。",
 "de": "Declares a downloadable font face referenced by font-family.",
 "pz": "@font-face{font-family:'A';src:url(a.woff2) format('woff2');font-display:swap}；swap 先显示回退再换装。说「用这个字体文件」即此。",
 "pe": "@font-face with font-display:swap keeps text visible during load.",
 "aliases": [],
 "demo": "text",
 "css": "@font-face{font-family:'AtlasFaceDemo';src:local('Arial')}.fx{font:700 clamp(30px,5.4vw,50px)/1.2 'AtlasFaceDemo',var(--fx-sans,system-ui);letter-spacing:-.02em;color:#23232f}"
},
{
 "id": "units-em-rem",
 "zh": "根相对字号单位",
 "en": "em / rem",
 "dz": "em 随父级字号缩放，rem 锚定根字号。",
 "de": "em scales with the parent font size; rem anchors to the root.",
 "pz": "组件内节奏用 em 跟随字号，全局排版尺度用 rem。说「随字号缩放」即此。",
 "pe": "em for component-local rhythm; rem for global scale.",
 "aliases": [],
 "demo": "box",
 "css": ".fx{width:min(300px,86%);height:150px;border-radius:12px;background:#BFDDF4;border:1px solid #587A94;box-sizing:border-box;padding:12px;display:flex;flex-direction:column;gap:1em;justify-content:center;font:600 12px/1.4 var(--fx-sans,system-ui);color:#23232f}.fx::before{content:'rem 行：根基准 ×1.5';font-size:1.5rem;color:#587A94}.fx::after{content:'em 行：本块 12px ×1.5';font-size:1.5em;color:#58766B}"
},
{
 "id": "read-only-pseudo",
 "zh": "只读匹配",
 "en": ":read-only",
 "dz": "不可编辑的元素命中 :read-only，可编辑的命中 :read-write——普通 div 也在前者之列。",
 "de": "Non-editable elements match :read-only — plain divs included.",
 "pz": "表单与内容页统一处理：input:read-write 加输入态样式，div:read-only 天然命中做只读版式。说「不可编辑的就是只读」即此。",
 "pe": "div:read-only matches by default; input:read-write marks editable fields.",
 "aliases": [],
 "demo": "grid",
 "css": ".fxgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:12px;background:#eceee6;border-radius:12px;width:min(330px,90%);box-sizing:border-box}.fx{height:56px;border-radius:10px;background:#F6F7F5;border:1px solid #77796f;display:flex;align-items:center;justify-content:center;font:600 9px/1.5 var(--fx-sans,system-ui);color:#77796f;text-align:center;padding:4px}.fx:read-only{background:#BFDDF4;border-color:#587A94;color:#587A94}.fx:read-only::after{content':read-only 命中（div 默认不可编辑）'}"
},
{
 "id": "counter-mechanism",
 "zh": "CSS 计数器",
 "en": "CSS counters",
 "dz": "计数器在元素流中累加，content/counter() 读出编号。",
 "de": "Counters accumulate through the element flow; counter() reads them.",
 "pz": "counter-reset 立账、counter-increment 计数、counter() 读数——章节编号不用 JS。说「自动编号」即此。",
 "pe": "counter-reset/increment plus counter() numbers sections without JS.",
 "aliases": [],
 "demo": "list",
 "css": ".fxcol{counter-reset:demo;padding:12px 12px 12px 40px;background:#eceee6;border-radius:12px;width:min(320px,84%)}.fx{min-height:34px;border-radius:8px;background:#F6F7F5;border:1px solid #77796f;box-sizing:border-box;padding:6px 12px;font:500 11px/1.6 var(--fx-sans,system-ui);color:#23232f;margin-bottom:8px;counter-increment:demo}.fx::before{content:'§ ' counter(demo) ' · ';color:#587A94;font-weight:700}"
},
{
 "id": "important-declarations",
 "zh": "重要声明",
 "en": "!important",
 "dz": "把一条声明抬进“重要”轨道，常规权重全都不敌。",
 "de": "Lifts a declaration into the important origin track.",
 "pz": "急救通道：工具类的 .hidden{display:none !important}。能用特异性解决的不要用 important——它连用户样式都会压过。说「这条必须赢」即此。",
 "pe": "Utility classes justify !important; specificity should be the first tool.",
 "aliases": [],
 "demo": "panel",
 "css": ".fxstack{width:270px;height:190px;border-radius:12px;background:#eceee6;padding:14px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}.fxa{flex:1;border-radius:10px;border:1px solid #8A677A;display:flex;align-items:center;justify-content:center;font:600 10px/1.5 var(--fx-sans,system-ui);color:#8A677A;text-align:center;padding:6px;background:#F2CBDD}.fxstack .fxa{background:#C5E2D7;border-color:#58766B;color:#58766B}.fxa{background:#BFDDF4 !important}.fxa::before{content:'高特异性想给绿底，!important 把雾蓝抬进重要轨道 → 雾蓝赢'}"
},
{
 "id": "css-wide-keywords",
 "zh": "全局关键字",
 "en": "inherit / initial / unset",
 "dz": "inherit 强继、initial 归零、unset 顺着本性来。",
 "de": "inherit forces, initial resets, unset follows the property's nature.",
 "pz": "unset 最常用：继承属性表现为 inherit、非继承属性表现为 initial。all:unset 是组件隔离的核武器。说「恢复默认」即此。",
 "pe": "unset inherits when the property inherits, resets otherwise; all:unset nukes everything.",
 "aliases": [
  {
   "term": "revert",
   "language": "en",
   "scope": "同族第四个关键字"
  }
 ],
 "demo": "panel",
 "css": ".fxstack{width:270px;height:190px;border-radius:12px;background:#eceee6;border:3px solid #8A677A;padding:14px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}.fxa{flex:1;border-radius:10px;background:#F6F7F5;border:3px solid;border-color:inherit;display:flex;align-items:center;justify-content:center;font:600 9.5px/1.5 var(--fx-sans,system-ui);color:#58766B;text-align:center;padding:6px}.fxa::before{content:'border-color:inherit → 强行继承父边色（同为墨粉）'}.fxb{flex:1;border-radius:10px;background:#F6F7F5;border:3px solid;border-color:unset;display:flex;align-items:center;justify-content:center;font:600 9.5px/1.5 var(--fx-sans,system-ui);color:#587A94;text-align:center;padding:6px}.fxb::before{content:'border-color:unset → 非继承属性归初值（= 文字色湖绿）'}"
}
]
};
