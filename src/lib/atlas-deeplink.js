export const STAGE_CATEGORY_MAP = Object.freeze({
  'text-reveal': 'text',
  'agent-composer': 'agent',
  'overlay-layers': 'overlay',
  'form-anatomy': 'form',
  'surface-transition': 'transition',
  'data-display': 'dataviz',
  'state-loading': 'loading',
  navigation: 'nav',
  'pointer-gestures': 'gesture',
})

export function stageCategoryFor(stageId) {
  const value = typeof stageId === 'string' ? stageId.trim() : ''
  return STAGE_CATEGORY_MAP[value] || value
}

export function termTail(termId) {
  const value = typeof termId === 'string' ? termId.trim().toLowerCase() : ''
  return value.replace(/^atlas-component-component-/, '').replace(/[-_]+/g, ' ').trim()
}

export function atlasFrameUrl({
  origin = '',
  locale = 'zh',
  theme = 'light',
  stageId = '',
  termId = '',
  query = '',
} = {}) {
  const params = new URLSearchParams({
    lang: locale === 'en' ? 'en' : 'zh',
    theme: theme === 'dark' ? 'dark' : 'light',
  })
  if (typeof stageId === 'string' && stageId.trim()) params.set('stageId', stageId.trim())
  if (typeof termId === 'string' && termId.trim()) params.set('termId', termId.trim())
  if (typeof query === 'string' && query.trim()) params.set('q', query.trim())
  const path = `/effects-atlas/index.html?${params.toString()}`
  return origin ? new URL(path, origin).toString() : path
}
