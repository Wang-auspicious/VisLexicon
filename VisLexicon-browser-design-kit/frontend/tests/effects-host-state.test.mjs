import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'

const html = await fs.readFile(new URL('../public/effects-atlas/index.html', import.meta.url), 'utf8')
// Exercise the actual initialization and message handler without starting the
// unrelated animation timers. Control the asynchronous category-load boundary.
const start = html.indexOf('  componentDidMount() {')
const end = html.indexOf('    this._keys =', start)
const body = html.slice(start + '  componentDidMount() {'.length, end)
  .replace("import('./fx/index.js')", 'moduleReady')

test('latest host locale wins while categories are loading', async () => {
  const parent = {}
  const handlers = new Map()
  let finishLoading
  let dark = false
  const component = {
    state: { lang: 'zh', mode: 'detail', itemId: 'example' },
    setState(next) { Object.assign(this.state, next) },
    sync() {},
  }
  const context = vm.createContext({
    component, URLSearchParams,
    window: {
      parent, location: { search: '?lang=zh&theme=light', origin: 'https://atlas.test' },
      addEventListener: (name, handler) => handlers.set(name, handler),
    },
    document: { getElementById: () => ({ classList: { toggle: (_, value) => { dark = value } } }) },
    moduleReady: Promise.resolve({ loadCategories: () => new Promise(resolve => { finishLoading = resolve }) }),
  })
  vm.runInContext(`(function(){${body}}).call(component)`, context)
  await Promise.resolve()
  const receive = handlers.get('message')
  receive({ source: parent, origin: 'https://atlas.test', data: { type: 'vislexicon-host-state', locale: 'en', theme: 'dark' } })
  assert.equal(component.state.lang, 'en')
  assert.equal(dark, true)
  finishLoading([{ id: 'text' }])
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(component.state.lang, 'en', 'initial URL must not override a newer host preference')
  assert.equal(component.state.mode, 'detail')
  assert.equal(component.state.itemId, 'example')
  receive({ source: {}, origin: 'https://atlas.test', data: { type: 'vislexicon-host-state', locale: 'zh', theme: 'light' } })
  assert.equal(component.state.lang, 'en', 'another same-origin window is not the host')
  assert.equal(dark, true)
})
