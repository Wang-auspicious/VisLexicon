// Shared with the main website in both research and flattened product layouts.
import fs from 'node:fs'
const sibling = new URL('../../frontend/server/component-bench-search.mjs', import.meta.url)
const module = await import(fs.existsSync(sibling) ? sibling : new URL('../../server/component-bench-search.mjs', import.meta.url))
export const { MAX_CANDIDATES, rankRequest, jevSearchPlugin } = module
