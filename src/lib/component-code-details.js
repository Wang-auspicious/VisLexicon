// One request per detail, shared across deep links, React StrictMode and panels.
// Bounded fulfilled entries avoid retaining a large imported catalogue in memory.
export function createComponentDetailCache({ fetcher = (...args) => fetch(...args), maxEntries = 24, maxBytes = 8 * 1024 * 1024 } = {}) {
  const entries = new Map()
  let bytes = 0
  const prune = () => {
    for (const [key, entry] of entries) {
      if (entries.size <= maxEntries && bytes <= maxBytes) break
      if (entry.value !== undefined) { entries.delete(key); bytes -= entry.bytes }
    }
  }
  function read(url, { fresh = false } = {}) {
    if (!/^\/data\/component-code\/items\/[a-zA-Z0-9_.-]+\.json$/.test(url)) return Promise.reject(new Error('INVALID_COMPONENT_DETAIL_URL'))
    if (fresh && entries.has(url)) { bytes -= entries.get(url).bytes ?? 0; entries.delete(url) }
    const cached = entries.get(url)
    if (cached) { entries.delete(url); entries.set(url, cached); return cached.promise }
    const entry = { bytes: 0 }
    entry.promise = fetcher(url).then(async response => {
      if (!response.ok) throw new Error('COMPONENT_DETAIL_UNAVAILABLE')
      const text = await response.text(), value = JSON.parse(text)
      entry.value = value; entry.bytes = text.length * 2; bytes += entry.bytes
      prune(); return value
    }).catch(error => { if (entries.get(url) === entry) entries.delete(url); throw error })
    entries.set(url, entry)
    prune()
    return entry.promise
  }
  return { read, clear() { entries.clear(); bytes = 0 }, stats: () => ({ entries: entries.size, bytes }) }
}
const cache = createComponentDetailCache()
export const readComponentDetail = (url, options) => cache.read(url, options)
