import original from '../data/creative-practices.json' with { type: 'json' }
import expanded from '../data/resource-studies.json' with { type: 'json' }
import designDocuments from '../data/design-documents.json' with { type: 'json' }
import presentationResources from '../data/presentation-resources.json' with { type: 'json' }
import graphicsResources from '../data/graphics-resources.json' with { type: 'json' }

// New, source-backed studies share the existing reading and search interface.
export default [...original, ...expanded, ...designDocuments, ...presentationResources, ...graphicsResources]

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
