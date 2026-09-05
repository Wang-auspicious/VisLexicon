import { useSyncExternalStore } from 'react'

/* ============ 全局 store：只剩主题 ============
 * 旧版还存着「Spec 板」（board / specId），它服务的 SpecPanel 与旧 62 词条页
 * 已在 WP-C 整体删除，字段一并清掉——留着只会让人以为还有人在用。
 *
 * 主题三态：
 *   'system' 跟随系统 —— 必须 delete documentElement.dataset.theme，
 *            让 tokens.css 的 `@media (prefers-color-scheme: dark)` 生效；
 *            写成 data-theme="system" 会同时错过浅色与深色两套规则。
 *   'light' / 'dark' 显式选择 —— 写 data-theme，覆盖系统偏好。
 */

const THEMES = ['system', 'light', 'dark']
const STORAGE_KEY = 'vl-theme'

const state = { theme: 'system' }
let snap = { ...state }
const listeners = new Set()
const emit = () => { snap = { ...state }; listeners.forEach((listener) => listener()) }

export function getState() {
  return snap
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useStore() {
  return useSyncExternalStore(subscribe, getState, getState)
}

/** 把当前主题写到 <html>：跟随系统时删除属性，不写占位值。 */
function applyTheme(theme) {
  if (typeof document === 'undefined') return
  if (theme === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme
}

export function setTheme(theme) {
  if (!THEMES.includes(theme)) return
  state.theme = theme
  applyTheme(theme)
  try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* 无存储权限时只影响记忆，不影响本次渲染 */ }
  emit()
}

export function loadStored() {
  let stored = null
  try { stored = localStorage.getItem(STORAGE_KEY) } catch { /* storage unavailable */ }
  /* 旧版只存过 light / dark，没有 system；读不出合法值就回到跟随系统。 */
  state.theme = THEMES.includes(stored) ? stored : 'system'
  applyTheme(state.theme)
  emit()
}

export { THEMES }
