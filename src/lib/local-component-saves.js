const KEY = 'vl-component-saved'
const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_.-]{1,180}$/.test(id)

export function readComponentSaves(storage = globalThis.localStorage) {
  try {
    const rows = JSON.parse(storage.getItem(KEY) || '[]')
    if (!Array.isArray(rows)) return []
    return [...new Map(rows.map(row => typeof row === 'string' ? { id: row } : row).filter(row => row && validId(row.id)).map(row => [row.id, row])).values()]
  } catch { return [] }
}

export function componentSaveRecord(unit) {
  if (!validId(unit.id)) throw Error('Invalid component ID')
  return Object.fromEntries(Object.entries({
    id: unit.id, nameZh: unit.nameZh, nameEn: unit.nameEn, name: unit.name,
    descriptionZh: unit.descriptionZh, descriptionEn: unit.descriptionEn,
    previewUrl: unit.previewUrl || unit.codeResource?.poster, sourceUrl: unit.sourceUrl,
    addedAt: new Date().toISOString(),
  }).filter(([, value]) => typeof value === 'string'))
}

export function toggleComponentSave(unit, storage = globalThis.localStorage) {
  const rows = readComponentSaves(storage)
  const exists = rows.some(row => row.id === unit.id)
  const next = exists ? rows.filter(row => row.id !== unit.id) : [componentSaveRecord(unit), ...rows]
  // Let persistence failures reach the caller; never confirm a save that failed.
  storage.setItem(KEY, JSON.stringify(next))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('vl-component-saves-change'))
  return !exists
}
