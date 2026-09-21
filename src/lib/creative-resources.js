/* These seed resources are an editorial reading list, separate from published Site Entries. */
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
    titleZh: 'PPT 制作', titleEn: 'Presentation making',
    descriptionZh: '从内容大纲到完整演示，收集幻灯片 Skill、模板与制作工具。',
    descriptionEn: 'Skills, templates, and tools for turning an outline into a presentation.',
    output: 'PPTX / HTML / PDF',
  },
  science: {
    channel: 'science', path: '#/science', code: '04 / SCIENTIFIC FIGURES',
    titleZh: '科研绘图', titleEn: 'Scientific figures',
    descriptionZh: '为论文和研究表达找工具：统计图、方法示意图、网络结构与科学可视化。',
    descriptionEn: 'Resources for research plots, method diagrams, network architectures, and scientific visualization.',
    output: 'SVG / PDF / PNG',
  },
}

export function resourceSection(channel, type) {
  return channel === 'skills' ? (type === 'image' ? 'image' : 'design') : channel
}

export function filterResources(resources, { category, kind = 'all', query = '' } = {}) {
  const words = String(query).normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean)
  return resources.filter((resource) => {
    if (category && resource.category !== category) return false
    if (kind !== 'all' && resource.type !== kind) return false
    const section = RESOURCE_SECTIONS[resource.category]
    // Practices carry the flat bilingual shape the atlas uses; library entries
    // carry title/descriptionZh/tags. Accept either so one search covers both.
    const text = [resource.title ?? resource.zh, resource.repo,
      resource.descriptionZh ?? resource.dz, resource.descriptionEn ?? resource.de,
      resource.principle ?? resource.pz, section?.titleZh, section?.titleEn,
      ...(resource.tags || []), ...(resource.kz || []), ...(resource.kw || [])].join(' ').normalize('NFKC').toLowerCase()
    return words.every((word) => text.includes(word))
  })
}

export function resourceHref(resource) {
  if (resource.type === 'prompt') return `#/skills/image?id=${encodeURIComponent(resource.id)}`
  if (resource.type === 'practice') return resource.category === 'atlas'
    ? `#/atlas?stageId=${resource.atlasCategory}&termId=${resource.id}`
    : `#/ppt?id=${resource.id}`
  return `${RESOURCE_SECTIONS[resource.category].path}?q=${encodeURIComponent(resource.title)}`
}
