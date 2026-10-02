import { matchesRequirements, queryRequirements } from './discovery-scopes.js'

/* These resources are independent content units, separate from published Site Entries. */
export const RESOURCE_SECTIONS = {
  design: {
    channel: 'skills', path: '#/skills/design', code: '01 / DESIGN',
    titleZh: 'DESIGN.md 设计规范', titleEn: 'DESIGN.md & design skills',
    descriptionZh: '把配色、字体、布局与交互规则交给 Agent，让设计有据可循。',
    descriptionEn: 'Give agents a shared reference for color, typography, layout, and interaction.',
    output: 'DESIGN.md / SKILL.md',
  },
  image: {
    channel: 'skills', path: '#/skills/image', code: '02 / IMAGE',
    titleZh: '生图 Prompt', titleEn: 'Image prompts',
    descriptionZh: '从具体画面出发，找构图、材质、光线与风格的提示词参考。',
    descriptionEn: 'Find prompts for composition, materials, lighting, and visual style.',
    output: 'PROMPT / IMAGE',
  },
  ppt: {
    channel: 'ppt', path: '#/ppt', code: '03 / PRESENTATION',
    titleZh: 'PPT 资源', titleEn: 'Presentation resources',
    descriptionZh: '完整模板、原始 Skill 与演示文件，找到就能取用。',
    descriptionEn: 'Complete templates, original Skills, and presentation files ready to use.',
    output: 'PPTX / HTML / PDF',
  },
  science: {
    channel: 'science', path: '#/science', code: '04 / SCIENTIFIC FIGURES',
    titleZh: '科研绘图', titleEn: 'Scientific figures',
    descriptionZh: '为论文和研究表达找工具：统计图、方法示意图、网络结构与科学可视化。',
    descriptionEn: 'Resources for research plots, method diagrams, network architectures, and scientific visualization.',
    output: 'SVG / PDF / PNG',
  },
  graphics: {
    channel: 'graphics', path: '#/graphics', code: '05 / IMAGE PROCESSING',
    titleZh: '图像处理', titleEn: 'Image processing',
    descriptionZh: '把蒙版、调色、合成与 PSD 图层操作交给 Agent。按效果查找，直接取用代码。',
    descriptionEn: 'Masks, color, compositing, and PSD layers for agents. Find an effect and use the code.',
    output: 'PNG / SVG / PSD',
  },
}

export function resourceSection(channel, type) {
  return channel === 'skills' ? (type === 'image' ? 'image' : 'design') : channel
}

export function filterResources(resources, { category, kind = 'all', query = '' } = {}) {
  const normalized = String(query).normalize('NFKC').toLowerCase()
  const hasRequirements = Object.values(queryRequirements(query)).some(Boolean)
  const lexical = hasRequirements ? normalized.replace(/免费|不花钱|不收费|零成本|可商用|商业使用|商用|开源|源代码|源码|能改代码|\bfree\b|no[- ]cost|open[- ]source|source[- ]?code|commercial(?:\s+use)?/giu, ' ') : normalized
  const words = lexical.trim().split(/\s+/).filter(Boolean)
  return resources.filter((resource) => {
    if (category && resource.category !== category) return false
    if (kind !== 'all' && resource.type !== kind) return false
    if (!matchesRequirements(query, resource)) return false
    const section = RESOURCE_SECTIONS[resource.category]
    // Practices carry the flat bilingual shape the atlas uses; library entries
    // carry title/descriptionZh/tags. Accept either so one search covers both.
    const text = [resource.title, resource.titleZh, resource.titleEn, resource.zh, resource.en, resource.repo, resource.sourceName, resource.document?.repository, resource.document?.fileName,
      resource.descriptionZh ?? resource.dz, resource.descriptionEn ?? resource.de,
      resource.principle ?? resource.pz, section?.titleZh, section?.titleEn,
      resource.execution?.runtime, resource.execution?.filename, resource.outputFormat, ...(resource.inputs || []), ...(resource.outputs || []), ...(resource.inputsEn || []), ...(resource.outputsEn || []),
      ...(resource.tags || []), ...(resource.kz || []), ...(resource.kw || [])].join(' ').normalize('NFKC').toLowerCase()
    return words.every((word) => text.includes(word))
  })
}

export function resourceHref(resource) {
  if (resource.type === 'prompt') return `#/skills/image?id=${encodeURIComponent(resource.id)}`
  if (['practice', 'markdown', 'presentation-resource', 'recipe', 'tool', 'file-api'].includes(resource.type)) return resource.category === 'atlas'
    ? `#/atlas?stageId=${resource.atlasCategory}&termId=${resource.id}`
    : `${RESOURCE_SECTIONS[resource.category].path}?id=${encodeURIComponent(resource.id)}`
  return `${RESOURCE_SECTIONS[resource.category].path}?q=${encodeURIComponent(resource.title)}`
}
