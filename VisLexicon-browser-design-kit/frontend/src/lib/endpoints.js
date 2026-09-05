export function endpointFor(id) {
  if (typeof id !== 'string' || !id.trim()) throw new TypeError('endpoint id must be a non-empty string')
  return `/lexicon/${encodeURIComponent(id.trim())}.json`
}
