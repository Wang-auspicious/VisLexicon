// Cache keys and snapshot digests only; collisions cost a cache miss at worst.
// Plain JS so it runs in Node, the browser and Cloudflare Workers alike.
export function fnvDigest(text) {
  let a=0x811c9dc5,b=0x01000193
  for(let i=0;i<text.length;i++){const c=text.charCodeAt(i);a=Math.imul(a^c,0x01000193)>>>0;b=Math.imul(b^c,0x5bd1e995)>>>0}
  return a.toString(16).padStart(8,'0')+b.toString(16).padStart(8,'0')+text.length.toString(16)
}
