// Imported only into this batch's approved v4 description worker. One quota or
// authorization response stops the worker instead of repeatedly spending calls.
import fs from 'node:fs'
import path from 'node:path'

const originalFetch = globalThis.fetch
const stop = new AbortController()
globalThis.fetch = async (input, options = {}) => {
  if (!String(input).startsWith('https://opencode.ai/zen/go/')) return originalFetch(input, options)
  const response = await originalFetch(input, { ...options, signal: options.signal ? AbortSignal.any([options.signal, stop.signal]) : stop.signal })
  if ([401, 402, 403, 429].includes(response.status)) {
    stop.abort()
    const out = process.env.VISLEXICON_SCREENSHOT_BATCH
    if (out) fs.writeFileSync(path.join(out, 'describe-provider-stop.json'), JSON.stringify({ at: new Date().toISOString(), status: response.status, model: 'deepseek-v4.1-flash', reason: response.status === 429 ? 'Provider rate or quota limit; no automatic retry' : 'Provider authorization or billing rejected; no automatic retry' }))
    console.log(`Description worker stopped on provider HTTP ${response.status}; no further requests.`)
    process.exit(75)
  }
  return response
}
