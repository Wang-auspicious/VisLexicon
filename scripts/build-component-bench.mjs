import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sibling = path.resolve(frontend, '../component-bench')
const bench = await fs.access(path.join(sibling, 'package.json')).then(() => sibling).catch(() => path.join(frontend, 'component-bench'))
const out = path.join(frontend, 'public/component-bench')
const require = createRequire(path.join(bench, 'package.json'))
const vite = path.join(path.dirname(require.resolve('vite/package.json')), 'bin/vite.js')
await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [vite, 'build'], { cwd: bench, stdio: 'inherit', windowsHide: true })
  child.on('error', reject)
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Component bench build failed (${code})`)))
})
// Copy new hashed assets before the entry document; open clients can keep using
// older chunks. The script never recursively deletes unrelated public content.
await fs.mkdir(out, { recursive: true })
await fs.cp(path.join(bench, 'dist'), out, { recursive: true, filter: file => path.basename(file) !== 'index.html' })
await fs.copyFile(path.join(bench, 'dist/index.html'), path.join(out, 'index.html'))
await fs.cp(path.join(bench, 'licenses'), path.join(out, 'licenses'), { recursive: true })
for (const file of ['THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.json']) await fs.copyFile(path.join(bench, file), path.join(out, file))
console.log(`Component bench built: ${out}`)
