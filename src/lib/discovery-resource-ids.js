/** IDs are the canonical records emitted by build-discovery-scopes.mjs. */
export function discoveryResourceId(item, category) {
  if (category === 'image') return item.id
  if (category === 'design') return `study--${item.id}`
  if (category === 'science' && item.type !== 'resource-kit') return `study--${item.id}`
  return `resource--${item.id}`
}
