export const promptTheme = (topic, allowedTopics) => topic && topic !== '全部' && (!allowedTopics || allowedTopics.includes(topic)) ? `image:${topic}` : 'image'

export function imageResourcePresentation(item) {
  const comparison = item.comparison || {}
  const isSkill = item.resourceType === 'skill'
  const prompt = typeof item.prompt === 'string' ? item.prompt.trim() : ''
  const images = comparison.kind === 'separate' && comparison.before && comparison.after
    ? [{ src: comparison.before, labelZh: '使用前', labelEn: 'Before' }, { src: comparison.after, labelZh: '使用后', labelEn: 'After' }]
    : comparison.kind === 'combined' && comparison.image
      ? [{ src: comparison.image, labelZh: '来源对比原图', labelEn: 'Original comparison' }]
      : comparison.kind === 'example' && comparison.image
        ? [{ src: comparison.image, labelZh: '来源效果示例', labelEn: 'Source example' }]
        : comparison.kind === 'source-only' ? [] : item.preview ? [{ src: item.preview, labelZh: '原作者效果示例', labelEn: 'Source example' }] : []
  return { isSkill, prompt, images, sourceOnly: comparison.kind === 'source-only', comparison,
    links: [
      item.sourceDocumentUrl && { href: item.sourceDocumentUrl, zh: '查看 Skill 原文', en: 'Read the Skill' },
      item.downloadUrl && { href: item.downloadUrl, zh: '获取 Skill', en: 'Get the Skill' },
      item.recommendationUrl && { href: item.recommendationUrl, zh: '查看分享出处', en: 'View the recommendation' },
    ].filter(Boolean),
  }
}

export function projectImagePrompt(item) {
  const { isSkill, prompt } = imageResourcePresentation(item)
  return {
    id: item.id, scope: 'skills', theme: 'image', themes: [promptTheme(item.topicZh)],
    kind: 'image-prompt', componentType: 'image-prompt',
    nameZh: item.titleZh, nameEn: item.titleEn,
    descriptionZh: item.descriptionZh, descriptionEn: item.descriptionEn || item.titleEn,
    sectionsZh: [{label:'效果',text:item.descriptionZh},{label:'使用',text:item.usageZh || (isSkill ? '查看 Skill 原文与获取入口，按原文说明使用。' : '上传参考照片，复制提示词到支持图像编辑的模型。效果图来自原始案例。')}],
    sectionsEn: [{label:'Effect',text:item.descriptionEn || item.titleEn},{label:'Use',text:isSkill ? 'Read the original Skill and follow its setup instructions.' : 'Upload a reference photo and use the prompt with an image editing model. The preview is the source example.'}],
    previewKind: 'image', previewUrl: item.preview,
    sourceUrl: item.sourceUrl, source: {name:item.sourceName},
    detailUrl: `#/skills/image?id=${encodeURIComponent(item.id)}`,
    prompt, resourceType: isSkill ? 'skill' : 'prompt', skillName: item.skillName,
    sourceDocumentUrl: item.sourceDocumentUrl, downloadUrl: item.downloadUrl, recommendationUrl: item.recommendationUrl,
    tags: [...new Set([item.topicZh,...item.tags])],
    offers: [], verification: item.originalSourceStatus === 'unverified' ? 'recommendation-only' : 'attributed-source-example',
    exampleQueries: item.exampleQueries || [], interaction: {},
    unknowns: ['Source example; output has not been independently regenerated. Model access fees and output rights are not inferred from prompt availability.'],
  }
}
