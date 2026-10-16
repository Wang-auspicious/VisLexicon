import { mergeResourceKits, RESOURCE_KITS } from './resource-kits.js'
import { hasHan, topicEnglish } from './localized-content.js'

const loaders = {
  science: () => import('../data/resource-studies.json'),
  ppt: () => import('../data/presentation-resources.json'),
  graphics: () => import('../data/graphics-resources.json'),
  design: () => import('../data/design-documents.json'),
  image: () => import('../data/image-prompts.json'),
}
const promises = new Map()
export function loadResourceEntries(category) {
  if (!promises.has(category)) promises.set(category, loaders[category]().then(({ default: entries }) => {
    if (category !== 'image') return mergeResourceKits(entries, RESOURCE_KITS.filter(item => item.category === category))
    return entries.map(item => ({ ...item, zh: item.titleZh, en: item.titleEn, dz: item.descriptionZh, de: item.descriptionEn || item.titleEn,
      kz: [...new Set([item.topicZh, ...item.tags])], kw: [...new Set([topicEnglish(item.topicZh), ...(item.tagsEn || item.tags.filter(tag => !hasHan(tag)))])],
      practice: { caption: { zh: item.titleZh, en: item.titleEn } } }))
  }))
  return promises.get(category)
}

export function resourceTopics(items) {
  const seen = new Map()
  for (const item of items) (item.kz || []).forEach((zh, index) => {
    if (!seen.has(zh)) seen.set(zh, { zh, en: item.kw?.[index] || 'Other', n: 0 })
    seen.get(zh).n++
  })
  return [...seen.values()].sort((a, b) => b.n - a.n)
}
