import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'src/data', `${name}.json`), 'utf8'))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const issues = []
function asset(url, id, digest, gitBlob) {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) { issues.push(`${id}: expected a delivered local asset`); return }
  const publicRoot = path.join(root, 'public')
  const file = path.resolve(publicRoot, url.slice(1).split(/[?#]/)[0])
  if (!file.startsWith(publicRoot + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { issues.push(`${id}: missing ${url}`); return }
  const bytes = fs.readFileSync(file)
  if (!bytes.length || (digest && hash(bytes) !== digest)) issues.push(`${id}: empty or changed original ${url}`)
  if (gitBlob && createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') !== gitBlob) issues.push(`${id}: original Git blob differs ${url}`)
}
const practices = read('resource-studies')
for (const row of practices) {
  asset(row.preview, row.id)
  if (row.demoUrl) asset(row.demoUrl, row.id)
  if (row.source?.localCodeUrl) asset(row.source.localCodeUrl, row.id)
  if (row.source?.downloadUrl?.startsWith('/')) asset(row.source.downloadUrl, row.id)
  for (const language of ['zh', 'en']) {
    if (!row.practice?.steps?.[language]?.length || !row.practice?.caption?.[language]) issues.push(`${row.id}: missing ${language} instructions or caption`)
  }
}
const prompts = read('image-prompts')
for (const row of prompts) {
  if (row.preview) asset(row.preview, row.id)
  else if (!row.originalDocument) issues.push(`${row.id}: neither an example image nor a complete original document`)
  const doc = row.originalDocument
  if (doc) {
    asset(doc.asset, row.id, doc.sha256)
    asset(doc.licenseAsset, row.id, doc.licenseSha256)
    if (!/^[a-f0-9]{40}$/.test(doc.commit) || !doc.unmodified || !doc.excerpt) issues.push(`${row.id}: incomplete original document provenance`)
  }
}
const documents = read('design-documents')
for (const row of documents) {
  asset(row.document.asset, row.id, row.document.sha256, row.document.gitBlobSha1)
  asset(row.document.licenseAsset, row.id, row.document.licenseSha256, row.document.licenseGitBlobSha1)
}
const presentations = read('presentation-resources')
const graphics = read('graphics-resources')
for (const row of [...presentations, ...graphics]) {
  if (!row.zh || !row.en || !row.dz || !row.de || !row.kz?.length || !row.kw?.length || !row.sourceUrl?.startsWith('https://')) issues.push(`${row.id}: incomplete resource metadata`)
  if (row.practice) issues.push(`${row.id}: obsolete exercise content`)
  if (row.preview) asset(row.preview, row.id)
  for (const file of row.files || []) if (file.url.startsWith('/')) asset(file.url, row.id, file.sha256)
  if (row.document) {
    asset(row.document.asset, row.id, row.document.sha256, row.document.gitBlobSha1)
    asset(row.document.licenseAsset, row.id, row.document.licenseSha256, row.document.licenseGitBlobSha1)
  }
  if (row.category === 'graphics' && (!row.execution?.code || !row.execution?.filename || !['documented', 'verified'].includes(row.execution.status))) issues.push(`${row.id}: incomplete execution record`)
}
if (issues.length) throw new Error(`Resource content is incomplete:\n${issues.join('\n')}`)
console.log(JSON.stringify({ practices: practices.length, presentationResources: presentations.length, graphicsResources: graphics.length, imageResources: prompts.length, completeImageSkills: prompts.filter(row => row.originalDocument).length, designDocuments: documents.length, issues: 0 }))
