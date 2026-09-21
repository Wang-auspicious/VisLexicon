const DB_NAME = 'vislexicon-local'
const STORE = 'favorites'
const memory = new Map()
function clean(row) { return { entryId: String(row.entryId), addedAt: row.addedAt || new Date().toISOString(), folders: [...new Set(row.folders || [])], tags: [...new Set(row.tags || [])], note: typeof row.note === 'string' ? row.note : '' } }
export function createFavoritesRepository({ indexedDB = globalThis.indexedDB } = {}) {
  if (!indexedDB) return memoryRepo()
  let dbPromise; let disabled = false
  const open = () => { if (!dbPromise) dbPromise = new Promise((resolve, reject) => { const req = indexedDB.open(DB_NAME, 1); req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'entryId' }); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error) }); return dbPromise }
  async function run(mode, op) { if (disabled) return undefined; try { const db = await open(); return await new Promise((resolve, reject) => { const tx = db.transaction(STORE, mode); const req = op(tx.objectStore(STORE)); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error) }) } catch { disabled = true; return undefined } }
  return { get persistent() { return !disabled }, async listFavorites() { return disabled ? memoryRepo().listFavorites() : ((await run('readonly', (s) => s.getAll())) || []) }, async getFavorite(id) { return disabled ? memoryRepo().getFavorite(id) : ((await run('readonly', (s) => s.get(String(id)))) || null) }, async upsertFavorite(row) { const next = clean(row); if (disabled || (await run('readwrite', (s) => s.put(next))) === undefined) { memory.set(next.entryId, next) } return next }, async removeFavorite(id) { if (disabled || (await run('readwrite', (s) => s.delete(String(id)))) === undefined) memory.delete(String(id)) } }
}
function memoryRepo() { return { persistent: false, async listFavorites() { return [...memory.values()] }, async getFavorite(id) { return memory.get(String(id)) || null }, async upsertFavorite(row) { const next = clean(row); memory.set(next.entryId, next); return next }, async removeFavorite(id) { memory.delete(String(id)) } } }
