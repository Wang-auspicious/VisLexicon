// Keep navigation small; the full keyword list remains searchable.
const includes = (item, pattern) => pattern.test([item.zh, item.en, ...(item.kz || [])].join(' '))
export const USABLE_RESOURCE_TOPICS = {
  ppt: [
    { zh: '完整作品', en: 'Complete decks', matches: item => item.resourceKind === 'deck' },
    { zh: '完整 Skill', en: 'Complete Skills', matches: item => item.resourceKind === 'skill' },
    { zh: '主题模板', en: 'Themes', matches: item => item.resourceKind === 'theme' },
    { zh: '原始示例', en: 'Original examples', matches: item => item.resourceKind === 'example' },
    { zh: '原始代码', en: 'Source code', matches: item => item.resourceKind === 'code' },
  ],
  graphics: [
    { zh: '裁切与蒙版', en: 'Crop and mask', matches: item => includes(item, /裁切|蒙版|抠图|透明|剪贴|alpha|mask|crop|缩放|裁剪/iu) },
    { zh: '调色与滤镜', en: 'Color and filters', matches: item => includes(item, /调色|色调|映射|gamma|对比|噪|模糊|锐化|灰度|线稿|半色调|颗粒|网点|二值|阈值|油画|色阶|海报化|素描/iu) },
    { zh: '合成与修复', en: 'Composite and repair', matches: item => includes(item, /合成|修复|叠|水印|透视|去污/iu) },
    { zh: '文字与形变', en: 'Type and distortion', matches: item => includes(item, /文字|扭曲|置换|黏连|阴影|浮雕|波纹|位移|投影/iu) },
    { zh: 'PSD 图层', en: 'PSD layers', matches: item => includes(item, /psd|photopea/iu) },
    { zh: '矢量效果', en: 'Vector effects', matches: item => item.engine === 'SVG' },
  ],
}

export function matchesResourceTopic(item, topic) {
  if (!topic || topic === '全部') return true
  const group = USABLE_RESOURCE_TOPICS[item.category]?.find(entry => entry.zh === topic)
  return group ? group.matches(item) : (item.kz || []).includes(topic)
}

export function resourceRuntime(item, en) {
  const runtime = item.execution?.runtime
  if (!en) return runtime
  if (item.execution?.runtimeEn) return item.execution.runtimeEn
  if (item.engine === 'SVG') return 'SVG filter-capable browser'
  if (item.engine === 'Photopea') return 'Browser + online Photopea iframe'
  return runtime
}
