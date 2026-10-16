import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { withLoopbackNoProxy } from './jev-provider.mjs'
import { syncDiscoveryBrowser } from '../scripts/sync-discovery-browser.mjs'

await syncDiscoveryBrowser()

// Proxy selection is initialized when Node starts; set it before spawning Vite.
const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))
const child = spawn(process.execPath, [vite, ...process.argv.slice(2)], { env: withLoopbackNoProxy(), stdio: 'inherit', windowsHide: true })
child.on('error', () => { console.error('Unable to start the local development server.'); process.exitCode = 1 })
child.on('exit', code => { process.exitCode = code ?? 1 })
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
