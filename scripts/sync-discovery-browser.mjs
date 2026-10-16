import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// The standalone atlas iframe cannot import application source at runtime.
// Generate its pure filter module from the same source used by React/server.
export async function syncDiscoveryBrowser(root = new URL('../', import.meta.url)) {
  const source = new URL('src/lib/discovery-scopes.js', root)
  const destination = new URL('public/effects-atlas/discovery-scopes.js', root)
  const bytes = await fs.readFile(source)
  if (/^import\s/m.test(bytes.toString('utf8'))) throw new Error('Browser discovery rules must remain self-contained')
  await fs.mkdir(new URL('public/effects-atlas/', root), { recursive: true })
  await fs.writeFile(destination, bytes)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await syncDiscoveryBrowser()
