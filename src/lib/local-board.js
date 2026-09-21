import { parseDesignSpec, serializeDesignSpec } from './spec-contract.js'

export const BOARD_VERSION = 'vislexicon.board.v1'
export const BOARD_STORAGE_KEY = 'vislexicon-board-v1'

const memory = { value: [] }

function getStorage(storage) {
  if (storage) return storage
  try { return globalThis.localStorage } catch { return null }
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object' || typeof item.key !== 'string' || !item.key.trim()) return null
  if (!item.spec) return null
  return { key: item.key, addedAt: typeof item.addedAt === 'string' ? item.addedAt : new Date().toISOString(), spec: parseDesignSpec(JSON.stringify(item.spec)) }
}

export function normalizeBoard(value) {
  const items = Array.isArray(value) ? value : Array.isArray(value?.items) ? value.items : []
  return items.map(normalizeItem).filter(Boolean)
}

export function readBoard({ storage } = {}) {
  const target = getStorage(storage)
  if (!target) return [...memory.value]
  try {
    const raw = target.getItem(BOARD_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const next = normalizeBoard(parsed)
    memory.value = next
    return next
  } catch {
    return [...memory.value]
  }
}

export function writeBoard(board, { storage } = {}) {
  const next = normalizeBoard(board)
  memory.value = next
  const target = getStorage(storage)
  if (target) {
    try { target.setItem(BOARD_STORAGE_KEY, JSON.stringify({ version: BOARD_VERSION, items: next })) } catch { /* local fallback remains authoritative for this session */ }
  }
  return next
}

export function addBoardItem(board, item) {
  const next = normalizeBoard(board)
  const clean = normalizeItem(item)
  if (!clean) throw new Error('Board 项必须包含 key 和有效 Design Spec')
  const index = next.findIndex((current) => current.key === clean.key)
  if (index < 0) return [...next, clean]
  return next.map((current, currentIndex) => currentIndex === index ? clean : current)
}

export function removeBoardItem(board, key) {
  return normalizeBoard(board).filter((item) => item.key !== key)
}

export function exportBoard(board) {
  const next = normalizeBoard(board)
  return `${JSON.stringify({ version: BOARD_VERSION, items: next }, null, 2)}\n`
}

export function importBoard(text) {
  let parsed
  try { parsed = JSON.parse(text) } catch (error) { throw new Error(`Board 文件不是有效 JSON：${error.message}`) }
  if (parsed?.version !== BOARD_VERSION) throw new Error('Board 文件版本不受支持')
  return normalizeBoard(parsed.items)
}

export { serializeDesignSpec }
