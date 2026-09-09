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
      "demo": "box",
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "scope-rule",
      "zh": "样式作用域",
      "en": "Scoped styles",
      "dz": "作用域规则限制样式传播，组件组合时减少意外选择器冲突。",
      "de": "Scope rules limit propagation and reduce selector collisions.",
      "pz": "作用域规则限制样式传播，组件组合时减少意外选择器冲突。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Scope rules limit propagation and reduce selector collisions. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "has-selector",
      "zh": "关系选择器",
      "en": "Relational selector",
      "dz": "关系选择器根据子状态更新父级，但要控制查询范围。",
      "de": "Relational selectors update parents from child state with bounded scope.",
      "pz": "关系选择器根据子状态更新父级，但要控制查询范围。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Relational selectors update parents from child state with bounded scope. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "subgrid",
      "zh": "子网格",
      "en": "Subgrid",
      "dz": "子网格继承父轨道，让独立卡片的标题和操作线对齐。",
      "de": "Subgrid inherits parent tracks for aligned card titles and actions.",
      "pz": "子网格继承父轨道，让独立卡片的标题和操作线对齐。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Subgrid inherits parent tracks for aligned card titles and actions. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "anchor-position",
      "zh": "锚点定位",
      "en": "Anchor positioning",
      "dz": "锚点定位让提示和菜单跟随触发元素，溢出时可翻转。",
      "de": "Anchor popovers to triggers and flip on overflow.",
      "pz": "锚点定位让提示和菜单跟随触发元素，溢出时可翻转。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Anchor popovers to triggers and flip on overflow. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "content-visibility",
      "zh": "内容可见性",
      "en": "Content visibility",
      "dz": "长列表跳过屏外渲染并预估尺寸，恢复滚动位置。",
      "de": "Skip offscreen rendering with estimated size and stable scroll.",
      "pz": "长列表跳过屏外渲染并预估尺寸，恢复滚动位置。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Skip offscreen rendering with estimated size and stable scroll. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "supports-query",
      "zh": "特性查询",
      "en": "Feature query",
      "dz": "特性查询为新能力提供渐进增强，不把旧浏览器当错误。",
      "de": "Use feature queries for progressive enhancement.",
      "pz": "特性查询为新能力提供渐进增强，不把旧浏览器当错误。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Use feature queries for progressive enhancement. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "css-audit",
      "zh": "CSS 审查",
      "en": "CSS audit",
      "dz": "发布前检查级联、主题、RTL、性能、兼容和无障碍。",
      "de": "Audit cascade, theme, RTL, performance, compatibility, and accessibility.",
      "pz": "发布前检查级联、主题、RTL、性能、兼容和无障碍。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Audit cascade, theme, RTL, performance, compatibility, and accessibility. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f5f7ff;color:#1e2d52;border:1px solid #b9c7e8;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    }
  ]
};
