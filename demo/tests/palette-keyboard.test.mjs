import test from 'node:test'
import assert from 'node:assert/strict'

function keyEvent(key, target) {
  return {
    key,
    target,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true },
  }
}

test('result-button Arrow keys do not desynchronize selection from the focused button', async () => {
  const { handlePaletteNavigationKey } = await import('../src/lib/palette-keyboard.js')
  const searchInput = { name: 'search' }
  const focusedResult = { name: 'result-2' }
  const selections = []
  const opens = []

  const handled = handlePaletteNavigationKey(keyEvent('ArrowDown', focusedResult), {
    searchInput,
    itemCount: 4,
    selectedIndex: 2,
    onSelect: (index) => selections.push(index),
    onOpenSelected: (index) => opens.push(index),
  })

  assert.equal(handled, false)
  assert.deepEqual(selections, [])
  assert.deepEqual(opens, [])
})

test('Enter on a focused result remains a native click on that result', async () => {
  const { handlePaletteNavigationKey } = await import('../src/lib/palette-keyboard.js')
  const searchInput = { name: 'search' }
  const opens = []
  const focusedResult = { click: () => opens.push(2) }
  const event = keyEvent('Enter', focusedResult)

  const handled = handlePaletteNavigationKey(event, {
    searchInput,
    itemCount: 4,
    selectedIndex: 2,
    onSelect: () => {},
    onOpenSelected: (index) => opens.push(index),
  })
  if (!event.defaultPrevented) focusedResult.click()

  assert.equal(handled, false)
  assert.deepEqual(opens, [2])
})

test('Arrow and Enter navigation remains available from the search input', async () => {
  const { handlePaletteNavigationKey } = await import('../src/lib/palette-keyboard.js')
  const searchInput = { name: 'search' }
  let selectedIndex = 1
  const opens = []

  const down = keyEvent('ArrowDown', searchInput)
  handlePaletteNavigationKey(down, {
    searchInput,
    itemCount: 3,
    selectedIndex,
    onSelect: (index) => { selectedIndex = index },
    onOpenSelected: (index) => opens.push(index),
  })

  const enter = keyEvent('Enter', searchInput)
  handlePaletteNavigationKey(enter, {
    searchInput,
    itemCount: 3,
    selectedIndex,
    onSelect: (index) => { selectedIndex = index },
    onOpenSelected: (index) => opens.push(index),
  })

  assert.equal(down.defaultPrevented, true)
  assert.equal(enter.defaultPrevented, true)
  assert.equal(selectedIndex, 2)
  assert.deepEqual(opens, [2])
})

