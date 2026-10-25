// Queue identity is the exact normalized starting URL, not its entire host.
export function observeAnchorLinks(selector) {
  return [...document.querySelectorAll(selector)].map(anchor=>{
    const href=anchor.getAttribute('href');
    if(href===null)return {href,url:null};
    try{const url=new URL(href,document.baseURI);return {href,url:/^https?:$/.test(url.protocol)?url.href:null};}
    catch{return {href,url:null};}
  });
}

// Only identifiers attached to a native example boundary qualify, not control IDs.
export function nativeExampleAnchor(element) {
  for(let node=element;node;node=node.parentElement){
    const id=node.id || '';
    if(id && (/^(?:example|demo|preview)(?:[-_:]|$)/i.test(id) || /-demo-/.test(id) || node.classList?.contains('code-box')))return id;
    if(['MAIN','BODY','HTML'].includes(node.tagName))break;
  }
  return null;
}

export function sourceKey(source) {
  try { const url=new URL(source.url);return /^https?:$/.test(url.protocol)?url.href:null; }
  catch { return null; }
}

export function sourceInventory(candidates) {
  const byUrl=new Map(),dispositions=[];
  for(const [observationIndex,source] of candidates.entries()){
    const key=sourceKey(source),canonical=byUrl.get(key);
    if(key&&!canonical)byUrl.set(key,source);
    dispositions.push({observationIndex,id:source.id,url:source.url,key,
      status:!key?'invalid-url':canonical?'same-start-url':'distinct-start-url',
      canonicalId:canonical?.id||source.id});
  }
  return {sources:[...byUrl.values()],rawCandidates:candidates.length,
    uniqueStartUrls:byUrl.size,aliases:dispositions.filter(d=>d.status==='same-start-url').length,
    invalid:dispositions.filter(d=>d.status==='invalid-url').length,dispositions};
}
