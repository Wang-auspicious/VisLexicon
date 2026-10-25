import fs from 'node:fs/promises'
import path from 'node:path'

export async function componentCodeIndexFile(root) {
  const local = path.join(root, 'data/ingest-v6/visual-discovery.json')
  try { await fs.access(local); return local } catch (error) { if (error.code !== 'ENOENT') throw error }
  return path.join(root, 'public/data/component-code/discovery.json')
}

export async function componentCodeUnits(root) {
  const units = new Map()
  for (const filename of [path.join(root, 'public/data/component-code/discovery.json'), path.join(root, 'data/ingest-v6/visual-discovery.json')]) try {
    const result = JSON.parse(await fs.readFile(filename, 'utf8'))
    // The user's visual collection only contains real previews. Archived source
    // without a verified render/poster remains in the private intake database.
    for (const unit of result.units ?? []) if (['verified', 'screenshot'].includes(unit.codeResource?.previewStatus) && unit.previewKind === 'image' && unit.previewUrl) units.set(unit.id, unit)
  } catch (error) { if (error.code !== 'ENOENT') throw error }
  return [...units.values()]
}
