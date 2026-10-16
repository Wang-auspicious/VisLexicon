import * as mod from './fx/index.js'

// Start the catalog before mounting the DC document. Its first render can then
// use the complete navigation instead of laying out an empty shell first.
const [cats] = await Promise.all([
  mod.loadCategories(),
  // Use the existing face for the first layout; otherwise its late discovery
  // triggers a second layout of the same navigation as fallback text swaps.
  document.fonts.load('400 16px "Anthropic Serif"').catch(() => []),
])
window.__atlasBoot = { mod, cats }
// This document uses the runtime's encoded select wrapper, so the DOM retains
// the original template. It does not need the standalone editor's self-fetch.
window.__resources ||= {}
await import('./support.js')
