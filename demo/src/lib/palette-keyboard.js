export function handlePaletteNavigationKey(event, {
  searchInput,
  itemCount,
  selectedIndex,
  onSelect,
  onOpenSelected,
}) {
  if (event.target !== searchInput) return false

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (itemCount === 0) return true
    const nextIndex = selectedIndex < 0 ? 0 : (selectedIndex + 1) % itemCount
    onSelect(nextIndex)
    return true
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (itemCount === 0) return true
    const nextIndex = selectedIndex < 0 ? itemCount - 1 : (selectedIndex - 1 + itemCount) % itemCount
    onSelect(nextIndex)
    return true
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (selectedIndex >= 0 && selectedIndex < itemCount) onOpenSelected(selectedIndex)
    return true
  }

  return false
}

