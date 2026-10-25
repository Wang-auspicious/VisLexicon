import fs from 'node:fs/promises'
import path from 'node:path'

const connections = new Map()
export async function componentCodeDocument(root, id) {
  const filename = path.join(root, 'data/ingest-v6/public/catalog.sqlite')
  try { await fs.access(filename) } catch (error) { if (error.code === 'ENOENT') return undefined; throw error }
  if (!connections.has(filename)) {
    const { DatabaseSync } = await import('node:sqlite')
    const db = new DatabaseSync(filename, { readOnly: true })
    connections.set(filename, db)
  }
  const db = connections.get(filename)
  try { return db.prepare('SELECT document FROM entries WHERE id = ? AND revision = (SELECT value FROM metadata WHERE key = ?)').get(id, 'active-revision')?.document ?? null }
  catch (error) { if (/no such table/.test(error.message)) return null; throw error }
}
