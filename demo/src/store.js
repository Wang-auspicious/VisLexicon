import { useSyncExternalStore } from 'react'
import { normalizeStoredState, removeBoard, upsertBoard } from './lib/store-core.js'

/* 极简全局 store：Spec 板 + 主题。
 * useSyncExternalStore 要求 getSnapshot 在两次变更间返回同一引用，
 * 变更时换新快照 → 触发重渲染。 */
const state = {
  board: [],      // [{ id, params }]  params 记录用户在词条页调好的参数
  theme: 'light',  // light | dark
  specId: 'sp_9f3k2',
}
let snap = { ...state }
const listeners = new Set()
const emit = () => { snap = { ...state }; listeners.forEach((l) => l()) }

export function getState() {
  return snap
}
export function subscribe(l) {
  listeners.add(l)
  return () => listeners.delete(l)
}
export function useStore() {
  return useSyncExternalStore(subscribe, getState)
}

export function toggleBoard(id, params) {
  if (inBoard(id)) state.board = removeBoard(state.board, id)
  else state.board = upsertBoard(state.board, id, params)
  persistBoard()
  emit()
}
export function saveBoardItem(id, params) {
  state.board = upsertBoard(state.board, id, params)
  persistBoard()
  emit()
}
export function removeBoardItem(id) {
  state.board = removeBoard(state.board, id)
  persistBoard()
  emit()
}
export function inBoard(id) {
  return state.board.some((b) => b.id === id)
}
export function setTheme(t) {
  if (t !== 'light' && t !== 'dark') return
  state.theme = t
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = t
  persistBoard()
  emit()
}
export function nextSpecId() {
  return 'sp_' + Math.random().toString(36).slice(2, 8)
}
export function persistBoard() {
  try {
    localStorage.setItem('vl-board', JSON.stringify(state.board))
    localStorage.setItem('vl-theme', state.theme)
  } catch { /* ignore quota */ }
}
export function loadStored() {
  let storedBoard = null
  let storedTheme = null
  try { storedBoard = localStorage.getItem('vl-board') } catch { /* storage unavailable */ }
  try { storedTheme = localStorage.getItem('vl-theme') } catch { /* storage unavailable */ }
  const normalized = normalizeStoredState(storedBoard, storedTheme)
  state.board = normalized.board
  state.theme = normalized.theme
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = state.theme
  persistBoard()
  emit()
}
export function clearBoard() {
  state.board = []
  persistBoard()
  emit()
}
