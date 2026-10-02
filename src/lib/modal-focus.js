const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function canReceiveFocus(element) {
  if (!element || typeof element.focus !== 'function') return false
  if (element.disabled || element.hidden || element.tabIndex < 0) return false
  return element.getAttribute?.('aria-hidden') !== 'true'
}

export function getFocusableElements(container) {
  if (!container?.querySelectorAll) return []
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(canReceiveFocus)
}

export function trapTabKey(event, container) {
  if (event.key !== 'Tab' || !container) return false

  const focusable = getFocusableElements(container)
  const ownerDocument = container.ownerDocument
  const active = ownerDocument?.activeElement

  if (focusable.length === 0) {
    event.preventDefault()
    container.focus?.()
    return true
  }

  const currentIndex = focusable.indexOf(active)
  const shouldWrapBackward = event.shiftKey && currentIndex <= 0
  const shouldWrapForward = !event.shiftKey && (currentIndex < 0 || currentIndex === focusable.length - 1)
  if (!shouldWrapBackward && !shouldWrapForward) return false

  event.preventDefault()
  const target = shouldWrapBackward ? focusable[focusable.length - 1] : focusable[0]
  target.focus()
  return true
}

export function restoreFocus(opener) {
  if (!opener?.isConnected || typeof opener.focus !== 'function') return false
  opener.focus()
  return true
}

export function focusRemovalNeighbor(elements, removedIndex, fallback) {
  const controls = Array.from(elements || [])
  const candidates = [controls[removedIndex + 1], controls[removedIndex - 1], fallback]
  const target = candidates.find((candidate) => candidate?.isConnected !== false && canReceiveFocus(candidate))
  target?.focus()
  return target ?? null
}

export function startModalFocusSession(container, preferredFocus) {
  const ownerDocument = container?.ownerDocument
  const opener = ownerDocument?.activeElement ?? null
  const preferredIsInside = preferredFocus && container?.contains?.(preferredFocus)
  const initial = preferredIsInside && canReceiveFocus(preferredFocus)
    ? preferredFocus
    : getFocusableElements(container)[0]

  if (initial) initial.focus()
  else container?.focus?.()

  let finished = false
  return () => {
    if (finished) return
    finished = true
    restoreFocus(opener)
  }
}
