/**
 * Keep large resource galleries cheap to mount. The view owns the limit and
 * grows it from an IntersectionObserver sentinel as the reader approaches the
 * end of the current window.
 */
export const RESOURCE_PAGE_SIZE = 48

export function progressiveWindow(items, limit = RESOURCE_PAGE_SIZE) {
  const source = Array.isArray(items) ? items : []
  const safeLimit = Math.max(0, Math.min(source.length, Number.isFinite(limit) ? Math.floor(limit) : RESOURCE_PAGE_SIZE))
  return {
    items: source.slice(0, safeLimit),
    hasMore: safeLimit < source.length,
    nextLimit: Math.min(source.length, safeLimit + RESOURCE_PAGE_SIZE),
  }
}
