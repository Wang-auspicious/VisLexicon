/**
 * 仅拉取组件名。不含 block / theme / hook。
 */

function itemsOf(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.registry)) return payload.registry
  return []
}

function parseShadcnUi(payload) {
  const names = itemsOf(payload)
    .filter((item) => item?.type === 'registry:ui')
    .map((item) => String(item.name || '').trim())
    .filter((name) => name && name !== 'index')
  if (names.length === 0) return null
  return { names }
}

function parseGenericUi(payload) {
  const items = itemsOf(payload).filter((item) => {
    const type = String(item?.type || '')
    if (type.includes('block') || type.includes('theme') || type.includes('hook') || type.includes('example')) {
      return false
    }
    return true
  })
  const names = items
    .map((item) => String(item.name || item.title || item.slug || '').trim())
    .filter(Boolean)
  if (names.length === 0) return null
  return { names }
}

const SOURCES = {
  'shadcn-ui': {
    url: 'https://ui.shadcn.com/r/styles/new-york/registry.json',
    parse: parseShadcnUi,
  },
  'magic-ui': {
    url: 'https://magicui.design/registry.json',
    parse: parseGenericUi,
  },
  'origin-ui': {
    url: 'https://coss.com/ui/r/registry.json',
    parse: parseGenericUi,
  },
}

export function coverageSourceOf(entryId) {
  return SOURCES[entryId] || null
}

export async function fetchLiveCoverage(entryId, { signal } = {}) {
  const spec = SOURCES[entryId]
  if (!spec) return null
  const response = await fetch(spec.url, { signal })
  if (!response.ok) return null
  return spec.parse(await response.json())
}
