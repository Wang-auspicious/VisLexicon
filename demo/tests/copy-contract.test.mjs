import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const submit = readFileSync(new URL('../src/views/Submit.jsx', import.meta.url), 'utf8')
const specPanel = readFileSync(new URL('../src/SpecPanel.jsx', import.meta.url), 'utf8')
const palette = readFileSync(new URL('../src/Palette.jsx', import.meta.url), 'utf8')
const entry = readFileSync(new URL('../src/views/Entry.jsx', import.meta.url), 'utf8')
const compare = readFileSync(new URL('../src/views/Compare.jsx', import.meta.url), 'utf8')
const keyView = readFileSync(new URL('../src/views/KeyView.jsx', import.meta.url), 'utf8')
const modalFocusHook = readFileSync(new URL('../src/lib/use-modal-focus.js', import.meta.url), 'utf8')

test('submit copy describes local-only storage without claiming a backend result', () => {
  assert.doesNotMatch(submit, /已入队列|自动\s*listed|进审核队列|bot\s*代转|管理面板一键/iu)
  assert.match(submit, /已保存在本机，尚未发送/)
  assert.match(submit, /localStorage/)
  assert.match(submit, /复制 JSON/)
  assert.match(submit, /下载 JSON/)
  assert.match(submit, /真实审核发送暂不可用/)
})

test('spec panel offers portable artifacts without claiming a live Agent endpoint', () => {
  assert.doesNotMatch(specPanel, /已丢给 Agent|丢给 Agent →|端点随部署走|agent_instructions_url/)
  assert.match(specPanel, /removeBoardItem/)
  assert.match(specPanel, /复制 JSON/)
  assert.match(specPanel, /下载 JSON/)
  assert.match(specPanel, /复制 Agent prompt/)
  assert.match(specPanel, /尚未发送/)
  assert.match(specPanel, /role="dialog"/)
  assert.match(specPanel, /aria-modal="true"/)
  assert.match(specPanel, /useModalFocus/)
  assert.match(specPanel, /focusRemovalNeighbor/)
  assert.match(specPanel, /data-spec-remove/)
  assert.doesNotMatch(specPanel, /\[open,\s*onClose\]/)
})

test('palette exposes a guarded, focus-safe modal dialog contract', () => {
  assert.match(palette, /role="dialog"/)
  assert.match(palette, /aria-modal="true"/)
  assert.match(palette, /aria-labelledby=/)
  assert.match(palette, /useModalFocus/)
  assert.match(palette, /handlePaletteNavigationKey/)
  assert.doesNotMatch(palette, /%\s*items\.length/)
  assert.match(palette, /target === e\.currentTarget|target === event\.currentTarget/)
  assert.match(palette, /className="pal-foot-spec"[^>]*>Spec 板 →<\/button>/)
  assert.match(palette, /onFocus=\{\(\) => setSel\(i\)\}/)
  assert.doesNotMatch(palette, /onMouseEnter=\{\(\) => setSel\(i\)\}/)
})

test('modal focus lifecycle keeps unstable close callbacks behind a ref', () => {
  assert.match(modalFocusHook, /const onCloseRef = useRef\(onClose\)/)
  assert.match(modalFocusHook, /onCloseRef\.current = onClose/)
  assert.match(modalFocusHook, /\[open, dialogRef, initialFocusRef\]/)
  assert.doesNotMatch(modalFocusHook, /\[open,\s*onClose\]/)
})

test('entry surfaces save current parameters explicitly instead of toggling them away', () => {
  for (const source of [entry, compare, keyView]) {
    assert.match(source, /saveBoardItem/)
    assert.doesNotMatch(source, /toggleBoard/)
  }
})
