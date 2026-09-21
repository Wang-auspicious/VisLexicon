import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

// Pin the reviewed public snapshot without distributing private capture records.
const reviewedSnapshot = 'abcbb1b934f7c2314ef48e53d59c3b5d2178d7eb53853c63a5463402996b0f00'
export function verifyPublicRelations(root) {
  const bytes = fs.readFileSync(path.join(root, 'public/data/discovery/relations.json'))
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== reviewedSnapshot) {
    throw new Error('Published source relations differ from the reviewed demo snapshot')
  }
  return true
}
