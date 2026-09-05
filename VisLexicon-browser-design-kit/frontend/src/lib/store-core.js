const isPlainRecord = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
)

const copyParams = (params) => isPlainRecord(params) ? { ...params } : {}

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

