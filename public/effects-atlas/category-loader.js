// Overview metadata and search prose are separate from executable previews.
// Cache promises as well as results so a hover, deep link and click share work.
export function createAtlasLoader({
  readJson = async url => { const response = await fetch(url); if (!response.ok) throw Error(`Atlas data unavailable: ${response.status}`); return response.json(); },
  importCategory = file => import(`./fx/${file}.js`).then(module => module.default),
  enrich = categories => import('./card-samples.js').then(module => module.enrichCardSamples(categories)),
  practices = categories => import('./practices.js').then(module => module.addPractices(categories)),
} = {}) {
  let catalogPromise, searchPromise, lexiconPromise, searchUrl
  const pending = new Map()
  const loadCategories = () => catalogPromise ||= readJson('/effects-atlas/catalog.json').then(data => { searchUrl = data.searchIndex; return data.categories }).catch(error => { catalogPromise = null; throw error })
  const loadSearchIndex = () => searchPromise ||= loadCategories().then(() => readJson(searchUrl)).catch(error => { searchPromise = null; throw error })
  const loadLexicon = () => lexiconPromise ||= readJson('/effects-atlas/lexicon.json').then(data => Object.fromEntries(Object.entries(data.entries || {}).filter(([, record]) => record.reviewStatus === 'approved'))).catch(error => { lexiconPromise = null; throw error })
  const loadCategory = id => {
    if (pending.has(id)) return pending.get(id)
    const promise = loadCategories().then(async catalog => {
      const entry = catalog.find(category => category.id === id)
      if (!entry) throw Error(`Unknown atlas category: ${id}`)
      const [sourceCategories, lexicon] = await Promise.all([
        entry.file ? enrich([await importCategory(entry.file)]) : Promise.resolve([{ ...entry, items: [] }]),
        loadLexicon(),
      ])
      let categories = sourceCategories.map(category => ({
        ...category,
        items: category.items.map(item => ({ ...item, ...(lexicon[`${category.id}/${item.id}`] || {}) })),
      }))
      if (entry.hasPractices) categories = await practices(categories)
      const category = categories.find(category => category.id === id)
      if (!category) throw Error(`Atlas category unavailable: ${id}`)
      return { ...category, itemCount: category.items.length, loaded: true }
    }).catch(error => { pending.delete(id); throw error })
    pending.set(id, promise)
    return promise
  }
  return { loadCategories, loadCategory, loadSearchIndex }
}

export const atlasLoader = createAtlasLoader()
