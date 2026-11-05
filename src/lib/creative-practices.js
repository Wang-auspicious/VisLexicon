import original from '../data/creative-practices.json' with { type: 'json' }
import expanded from '../data/resource-studies.json' with { type: 'json' }
import designDocuments from '../data/design-documents.json' with { type: 'json' }
import presentationResources from '../data/presentation-resources.json' with { type: 'json' }
import graphicsEffects from '../data/graphics-effects.json' with { type: 'json' }
import { mergeResourceKits, RESOURCE_KITS } from './resource-kits.js'

const imageEffects = graphicsEffects.map(item => ({ ...item,
  zh: item.titleZh, en: item.titleEn, dz: item.descriptionZh, de: item.descriptionEn,
  kz: [item.topicZh, ...item.tags], kw: [item.topicEn, ...(item.tagsEn || [])],
}))

// Image-processing search exposes reviewed visual examples and prompts only.
export default mergeResourceKits([...original, ...expanded, ...designDocuments, ...presentationResources, ...imageEffects], RESOURCE_KITS.filter(item => item.category !== 'graphics'))

export function practiceTopics(practices, category) {
  const seen = new Map()
  for (const item of practices.filter(entry => entry.category === category)) {
    ;(item.kz || []).forEach((zh, index) => {
      if (!seen.has(zh)) seen.set(zh, { zh, en: item.kw?.[index] || 'Other', n: 0 })
      seen.get(zh).n += 1
    })
  }
  return [...seen.values()].sort((a, b) => b.n - a.n)
}
