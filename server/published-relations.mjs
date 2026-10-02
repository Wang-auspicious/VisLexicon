import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

// Pin the reviewed public snapshot without distributing private capture records.
const reviewedSnapshot = 'ff186d935089d431c1ac26a486f2b6b4419eead4aa9d28931a53caa01ec53ecb'
export function verifyPublicRelations(root) {
  const bytes = fs.readFileSync(path.join(root, 'public/data/discovery/relations.json'))
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== reviewedSnapshot) {
    throw new Error('Published source relations differ from the reviewed demo snapshot')
  }
  return true
}
