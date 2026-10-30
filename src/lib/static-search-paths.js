// Shared by the static search build and the browser loader.
export const STATIC_SEARCH_BASE = '/search-data'

// IDs are URL-safe today; encode anything else so a file name can never escape u/.
export function unitFileName(id) {
  return `${String(id).replace(/[^A-Za-z0-9._-]/g, (c) => `~${c.charCodeAt(0).toString(16)}`)}.json`
}
