export const EFFECTS_HOST_PROTOCOL = 'v1'
export const EFFECTS_HOST_MESSAGE = 'vislexicon.host-state'

const isText = (value) => typeof value === 'string' && value.trim().length > 0

export function createHostState({
  releaseId = 'unknown',
  locale = 'zh',
  theme = 'light',
  stageId,
  termId,
  query,
} = {}) {
  return {
    type: EFFECTS_HOST_MESSAGE,
    protocol: EFFECTS_HOST_PROTOCOL,
    releaseId: isText(releaseId) ? releaseId : 'unknown',
    locale: locale === 'en' ? 'en' : 'zh',
    theme: theme === 'dark' ? 'dark' : 'light',
    ...(isText(stageId) ? { stageId } : {}),
    ...(isText(termId) ? { termId } : {}),
    ...(isText(query) ? { query } : {}),
  }
}

export function isHostState(value) {
  if (!value || typeof value !== 'object') return false
  if (value.type !== EFFECTS_HOST_MESSAGE || value.protocol !== EFFECTS_HOST_PROTOCOL) return false
  if (!isText(value.releaseId)) return false
  if (!['zh', 'en'].includes(value.locale)) return false
  if (!['light', 'dark'].includes(value.theme)) return false
  if (value.stageId !== undefined && !isText(value.stageId)) return false
  if (value.termId !== undefined && !isText(value.termId)) return false
  if (value.query !== undefined && !isText(value.query)) return false
  return true
}

export function targetOriginForFrame(src, fallback = typeof window === 'undefined' ? '' : window.location.origin) {
  try {
    return new URL(src || fallback, fallback || undefined).origin
  } catch {
    return fallback || '*'
  }
}

