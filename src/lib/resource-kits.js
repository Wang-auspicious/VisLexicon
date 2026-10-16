import registry from '../data/resource-kits.json' with { type: 'json' }

export function projectKit(item) {
  const category = item.shelf === 'image' ? 'graphics' : item.shelf
  return {
    id: item.id, type: 'resource-kit', category, kit: item, resourceKind: item.kind === 'template' ? 'theme' : 'code',
    zh: item.name.zh, en: item.name.en, dz: item.summary.zh, de: item.summary.en,
    kz: item.tags || [], kw: (item.tags || []).filter(tag => !/[\u3400-\u9fff]/u.test(tag)),
    preview: item.previews[0]?.url,
    previewWidth: item.previews[0]?.width, previewHeight: item.previews[0]?.height,
    sourceName: item.provenance.author || 'VisLexicon', sourceUrl: item.provenance.sourceUrl,
    execution: { runtime: item.run.runtime }, offers: item.offers || [],
    practice: { caption: item.name },
  }
}

export const RESOURCE_KITS = registry.items.map(projectKit)
export function mergeResourceKits(items, kits = RESOURCE_KITS) {
  const ids = new Set(kits.map(item => item.id))
  return [...kits, ...items.filter(item => !ids.has(item.id))]
}
