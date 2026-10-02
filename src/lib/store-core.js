const isPlainRecord = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
)

const copyParams = (params) => isPlainRecord(params) ? { ...params } : {}

/* 新的公开 Board/Spec 契约从 local-board.js 导出；保留本文件的旧纯函数出口，
 * 让未迁移的旧调用方不会突然改变行为。 */
export {
  BOARD_STORAGE_KEY,
  BOARD_VERSION,
  addBoardItem,
  exportBoard,
  importBoard,
  normalizeBoard,
  readBoard,
  removeBoardItem,
  writeBoard,
} from './local-board.js'

export function upsertBoard(board, id, params) {
  const source = Array.isArray(board) ? board : []
  const index = source.findIndex((item) => item?.id === id)
  const item = { id, params: copyParams(params) }

  if (index < 0) return [...source, item]
  return source.map((current, currentIndex) => currentIndex === index ? item : current)
}

export function removeBoard(board, id) {
  const source = Array.isArray(board) ? board : []
  return source.filter((item) => item?.id !== id)
}

export function normalizeStoredState(storedBoard, storedTheme) {
  let parsed = []
  try {
    parsed = typeof storedBoard === 'string' ? JSON.parse(storedBoard) : storedBoard
  } catch {
    parsed = []
  }

  const board = (Array.isArray(parsed) ? parsed : []).reduce((clean, item) => {
    if (!isPlainRecord(item) || typeof item.id !== 'string' || !item.id.trim()) return clean
    return upsertBoard(clean, item.id, item.params)
  }, [])

  return {
    board,
    theme: storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light',
  }
}
