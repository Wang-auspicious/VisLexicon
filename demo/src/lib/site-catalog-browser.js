const ALL_CATEGORY = 'all'

export function siteUrl(site) {
  return site?.canonicalUrl || site?.url || ''
}

function searchableText(entry) {
  return [
    entry.name,
    entry.canonicalUrl,
    entry.descriptionZh,
    entry.category,
    ...(entry.subcategories ?? []),
    ...(entry.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
}

export function prepareCatalogEntries(entries) {
  return (Array.isArray(entries) ? entries : []).map((entry) => ({
    ...entry,
    searchText: searchableText(entry),
  }))
}

export function filterCatalogEntries(entries, filters = {}) {
  const source = Array.isArray(entries) ? entries : []
  const category = String(filters.category ?? ALL_CATEGORY).trim()
  const subcategory = String(filters.subcategory ?? ALL_CATEGORY).trim()
  const tag = String(filters.tag ?? ALL_CATEGORY).trim().toLocaleLowerCase('en-US')
  const pricing = String(filters.pricing ?? ALL_CATEGORY).trim()
  const sourceId = String(filters.source ?? ALL_CATEGORY).trim()
  const tokens = String(filters.query ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
    .trim()
    .split(/\s+/u)
    .filter(Boolean)

  return source.filter((entry) => {
    if (category && category !== ALL_CATEGORY && entry.category !== category) return false
    if (
      subcategory &&
      subcategory !== ALL_CATEGORY &&
      !(entry.subcategories ?? []).includes(subcategory)
    ) return false
    if (
      tag &&
      tag !== ALL_CATEGORY &&
      !(entry.tags ?? []).some((value) => String(value).toLocaleLowerCase('en-US') === tag)
    ) return false
    if (pricing && pricing !== ALL_CATEGORY && entry.pricing?.model !== pricing) return false
    if (sourceId && sourceId !== ALL_CATEGORY && !(entry.sourceIds ?? []).includes(sourceId)) {
      return false
    }
    if (tokens.length === 0) return true
    const haystack = entry.searchText ?? searchableText(entry)
    return tokens.every((token) => haystack.includes(token))
  })
}

export function nextVisibleCount(current, total, pageSize) {
  const safeTotal = Math.max(0, Number(total) || 0)
  const safeCurrent = Math.max(0, Number(current) || 0)
  const safePageSize = Math.max(1, Number(pageSize) || 1)
  return Math.min(safeTotal, safeCurrent + safePageSize)
}

export function catalogMetaLabels(entry) {
  return [...new Set([entry?.category, ...(entry?.subcategories ?? [])].filter(Boolean))].slice(0, 3)
}

function countedValues(entries, selectValues) {
  const counts = new Map()
  for (const entry of entries) {
    for (const value of new Set(selectValues(entry).filter(Boolean))) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-CN'),
  )
}

export function catalogFacets(entries, filters = {}) {
  const category = String(filters.category ?? ALL_CATEGORY).trim()
  const scoped = (Array.isArray(entries) ? entries : []).filter(
    (entry) => !category || category === ALL_CATEGORY || entry.category === category,
  )

  return {
    subcategories: countedValues(scoped, (entry) => entry.subcategories ?? []),
    tags: countedValues(scoped, (entry) => entry.tags ?? []),
    pricing: countedValues(scoped, (entry) => [entry.pricing?.model]),
    sources: countedValues(scoped, (entry) => entry.sourceIds ?? []),
  }
}

export function catalogPage(entries, requestedPage = 1, pageSize = 100) {
  const source = Array.isArray(entries) ? entries : []
  const safePageSize = Math.max(1, Math.floor(Number(pageSize) || 1))
  const pageCount = Math.max(1, Math.ceil(source.length / safePageSize))
  const page = Math.min(pageCount, Math.max(1, Math.floor(Number(requestedPage) || 1)))
  const start = (page - 1) * safePageSize
  const items = source.slice(start, start + safePageSize)

  return {
    items,
    page,
    pageCount,
    total: source.length,
    from: source.length === 0 ? 0 : start + 1,
    to: Math.min(source.length, start + items.length),
  }
}
