import test from 'node:test'
import assert from 'node:assert/strict'

function element(name, ownerDocument) {
  return {
    name,
    disabled: false,
    hidden: false,
    tabIndex: 0,
    isConnected: true,
    focusCalls: 0,
    focus() {
      this.focusCalls += 1
      ownerDocument.activeElement = this
    },
    getAttribute() { return null },
  }
}

function fixture() {
  const ownerDocument = { activeElement: null }
  const controls = ['first', 'middle', 'last'].map((name) => element(name, ownerDocument))
  const dialog = element('dialog', ownerDocument)
  dialog.tabIndex = -1
  dialog.ownerDocument = ownerDocument
  dialog.querySelectorAll = () => controls
  dialog.contains = (candidate) => candidate === dialog || controls.includes(candidate)
  return { ownerDocument, controls, dialog }
}

function tabEvent(shiftKey = false) {
  return {
    key: 'Tab',
    shiftKey,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true },
  }
}

test('Tab wraps from the last focusable control to the first', async () => {
  const { trapTabKey } = await import('../src/lib/modal-focus.js')
  const { ownerDocument, controls, dialog } = fixture()
  ownerDocument.activeElement = controls[2]
  const event = tabEvent()

  trapTabKey(event, dialog)

  assert.equal(event.defaultPrevented, true)
  assert.equal(ownerDocument.activeElement, controls[0])
})

test('Shift+Tab wraps from the first focusable control to the last', async () => {
  const { trapTabKey } = await import('../src/lib/modal-focus.js')
  const { ownerDocument, controls, dialog } = fixture()
  ownerDocument.activeElement = controls[0]
  const event = tabEvent(true)

  trapTabKey(event, dialog)

  assert.equal(event.defaultPrevented, true)
  assert.equal(ownerDocument.activeElement, controls[2])
})

test('a modal focus session focuses its initial control and restores its opener', async () => {
  const { startModalFocusSession } = await import('../src/lib/modal-focus.js')
  const { ownerDocument, controls, dialog } = fixture()
  const opener = element('opener', ownerDocument)
  ownerDocument.activeElement = opener

  const finish = startModalFocusSession(dialog, controls[1])
  assert.equal(ownerDocument.activeElement, controls[1])

  finish()
  assert.equal(ownerDocument.activeElement, opener)
  assert.equal(opener.focusCalls, 1)
})

test('removing a focused middle or last item transfers focus to a surviving neighbor', async () => {
  const { focusRemovalNeighbor } = await import('../src/lib/modal-focus.js')

  {
    const { ownerDocument, controls } = fixture()
    const middle = controls[1]
    ownerDocument.activeElement = middle
    const target = focusRemovalNeighbor(controls, 1, null)
    middle.isConnected = false
    controls.splice(1, 1)
    assert.equal(target, controls[1])
    assert.equal(ownerDocument.activeElement, controls[1])
    assert.equal(ownerDocument.activeElement.isConnected, true)
  }

  {
    const { ownerDocument, controls } = fixture()
    const last = controls[2]
    ownerDocument.activeElement = last
    const target = focusRemovalNeighbor(controls, 2, null)
    last.isConnected = false
    controls.pop()
    assert.equal(target, controls[1])
    assert.equal(ownerDocument.activeElement, controls[1])
    assert.equal(ownerDocument.activeElement.isConnected, true)
  }
})

test('removing the only focused item transfers focus to the dialog fallback', async () => {
  const { focusRemovalNeighbor } = await import('../src/lib/modal-focus.js')
  const { ownerDocument, controls } = fixture()
  const only = controls[0]
  const fallback = element('close', ownerDocument)
  ownerDocument.activeElement = only

  const target = focusRemovalNeighbor([only], 0, fallback)
  only.isConnected = false

  assert.equal(target, fallback)
  assert.equal(ownerDocument.activeElement, fallback)
  assert.equal(ownerDocument.activeElement.isConnected, true)
})
