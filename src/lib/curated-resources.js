/* Curated Ecosystem Resource Map
 * Maps taxonomy domains, sub-domains, and visual terms to globally recognized
 * specialized design tools, registries, and open-source libraries.
 */

export const DOMAIN_AUTHORITIES = {
  typography: [
    { name: 'Typewolf', url: 'https://www.typewolf.com', tag: '排版圣经', desc: '全球公认的网页排版趋势与真实网站最佳用字搭配指南' },
    { name: 'Fonts in Use', url: 'https://fontsinuse.com', tag: '真实用字归档', desc: '真实世界出版物、网站与包装设计中的字体分类鉴定与历史归档' },
    { name: 'Fontshare', url: 'https://www.fontshare.com', tag: '高品质开源字库', desc: '印度字体基金会 (ITF) 打造的 100% 免费可商用专业 Web 字族' },
    { name: 'Typescale', url: 'https://typescale.com', tag: '字阶计算器', desc: '在线可视化调节 Modular Scale 调和字阶并一键导出 CSS 变量' },
    { name: 'Uiverse Text Effects', url: 'https://uiverse.io/all?category=text', tag: 'CSS 艺术字库', desc: '收集数千种社区纯 CSS/SVG 实现的霓虹、金属、故障与镂空艺术字代码' },
    { name: 'Magic UI Text', url: 'https://magicui.design/docs/components/text-reveal', tag: '文字动效组件', desc: '收录 Blur Fade, Text Reveal, Sparkles, Number Ticker 等现代动效' },
  ],
  agentic: [
    { name: 'assistant-ui', url: 'https://www.assistant-ui.com', tag: 'AI 原生组件库', desc: '针对大模型与 Agent 交互的专业开源 React 组件原语标准' },
    { name: 'Vercel AI SDK Showcase', url: 'https://sdk.vercel.ai', tag: '生成式 UI 范式', desc: '流式文本、生成式 UI、Artifacts 画布与多模态交互的官方权威范式' },
    { name: 'Open-Pencil', url: 'https://github.com/open-pencil/open-pencil', tag: 'AI 编辑器架构', desc: 'AI-native 节点树驱动的设计编辑器，支持代码导出与精确无缝查询' },
    { name: '21st.dev (AI UI)', url: 'https://21st.dev', tag: 'AI 交互组件市场', desc: '收录全球前沿开发者构建的最新 Agent 与 Chat UI 交互开源件' },
  ],
  motion: [
    { name: '60fps.design', url: 'https://60fps.design', tag: '动效词典与录像', desc: '收录数百款主流 iOS/Web 真实 App 交互动效视频与权威参数拆解' },
    { name: 'Framer Motion', url: 'https://motion.dev', tag: '弹簧物理标准', desc: '全球最成熟的弹簧物理、Layout 连续形变与手势动效库' },
    { name: 'GSAP', url: 'https://gsap.com', tag: '高性能动画引擎', desc: '专业级时间轴编排 (Timeline) 与滚动视差驱动器标准' },
    { name: 'Animata', url: 'https://animata.design', tag: '微交互代码片段', desc: '专门收集纯净可复用的现代悬停、微交互、文字及按钮动效' },
  ],
  gestures: [
    { name: '@use-gesture', url: 'https://use-gesture.pmndrs.org', tag: '手势动力引擎', desc: '支持 Drag, Pinch, Wheel, Scroll 全模态，自带越界橡皮筋阻尼算法' },
    { name: 'React Aria Interactions', url: 'https://react-spectrum.adobe.com/react-aria/interactions.html', tag: '无障碍输入原语', desc: 'Adobe 工业级 usePress, useMove, useLongPress 行为层基石' },
    { name: 'WAI-ARIA APG', url: 'https://www.w3.org/WAI/ARIA/apg', tag: 'W3C 交互规范', desc: 'W3C 官方定义的全部界面组件键盘流转与屏幕阅读器标准' },
  ],
  surfaces: [
    { name: 'Realtime Colors', url: 'https://realtimecolors.com', tag: '全套色彩实时预览', desc: '在完整真实网页 UI 上实时预览一整套调色板的对比度与视觉效果' },
    { name: 'OKLCH.com', url: 'https://oklch.com', tag: '感知均匀色盘', desc: '最权威的现代感知均匀色盘工具，可视化色域与感知亮度' },
    { name: 'SmoothShadow', url: 'https://shadows.brumm.af', tag: '贝塞尔分层阴影', desc: '调节多重贝塞尔曲线分布的顶级自然分层漫反射阴影生成器' },
    { name: 'Neumorphism.io', url: 'https://neumorphism.io', tag: '新拟态工坊', desc: '可视化调节软阴影曲率、距离与凹凸模糊度的代码生成器' },
  ],
  layout: [
    { name: 'Bento Grids', url: 'https://bentogrids.com', tag: '便当盒网格案例', desc: '全球最大的 Bento Grid 便当盒设计案例与开源模板索引' },
    { name: 'The Component Gallery', url: 'https://component.gallery', tag: '组件命名圣经', desc: '收录全球各大知名设计系统的真实组件命名与结构变体' },
    { name: 'Land-book', url: 'https://land-book.com', tag: '精选落地页', desc: '精选全球最具设计感与商业转化力的经典与前沿落地页' },
  ],
}

export function getDomainAuthority(domainKey) {
  return DOMAIN_AUTHORITIES[domainKey] || []
}

export function getCuratedResourcesForTerm(term, stageId) {
  const results = []
  if (!term && !stageId) return results

  const text = `${term?.id || ''} ${term?.termEn || ''} ${term?.termZh || ''} ${(term?.tags || []).join(' ')}`.toLowerCase()

  if (stageId === 'text-reveal' || text.includes('text') || text.includes('font') || text.includes('type') || text.includes('blur') || text.includes('reveal')) {
    results.push(...DOMAIN_AUTHORITIES.typography)
  } else if (stageId === 'agent-composer' || text.includes('agent') || text.includes('composer') || text.includes('chat') || text.includes('message') || text.includes('prompt') || text.includes('reasoning') || text.includes('tool')) {
    results.push(...DOMAIN_AUTHORITIES.agentic)
  } else if (stageId === 'pointer-gestures' || text.includes('gesture') || text.includes('drag') || text.includes('pinch') || text.includes('press')) {
    results.push(...DOMAIN_AUTHORITIES.gestures)
  } else if (stageId === 'surface-transition' || text.includes('motion') || text.includes('transition') || text.includes('spring')) {
    results.push(...DOMAIN_AUTHORITIES.motion)
  } else if (stageId === 'form-anatomy' || stageId === 'data-display' || stageId === 'navigation') {
    results.push(...DOMAIN_AUTHORITIES.layout)
  } else {
    results.push(...DOMAIN_AUTHORITIES.surfaces)
  }

  // Deduplicate by URL
  const seen = new Set()
  return results.filter(item => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}
