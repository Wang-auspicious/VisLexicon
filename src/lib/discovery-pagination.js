/** Clamp the displayed page synchronously, before a shrinking result set paints.
 * An unknown total keeps a requested deep-link page until the first response. */
export function discoveryPageState(requestedPage = 1, total, pageSize = 24) {
  const numeric = Number(requestedPage)
  const requested = Number.isSafeInteger(numeric) && numeric > 0 ? numeric : 1
  if (total == null) return { page: requested, pages: null, offset: (requested - 1) * pageSize }
  const count = Math.max(0, Number(total) || 0)
  const pages = Math.max(1, Math.ceil(count / pageSize))
  const page = Math.min(requested, pages)
  return { page, pages, offset: (page - 1) * pageSize }
}
