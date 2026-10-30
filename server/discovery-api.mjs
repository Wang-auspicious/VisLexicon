import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadDiscoveryIndex, discoveryIndexFiles } from './discovery-index.mjs'
import { getJevProvider, jevStatus } from './jev-provider.mjs'
export { FREE_MODEL, JEV_ENDPOINT, localCredential } from './jev-provider.mjs'
import { discoveryPreviewAssets } from './discovery-preview-assets.mjs'
import { createDiscoveryHandler, createIndexContexts, MAX_BODY_BYTES } from './discovery-handler.mjs'
import { rankWithClient } from './jev-rank-core.mjs'
export { queryConstraints, modelRequest } from './jev-rank-core.mjs'
export { RANK_SCOPES } from './discovery-handler.mjs'

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
export async function rankWithJev(query, candidates, { fetchImpl, signal, key, provider }={}) {
  return rankWithClient(query,candidates,provider || await getJevProvider({key,fetchImpl}),{signal})
}
export function localRequestAllowed(req) {
  const ip=req.socket?.remoteAddress
  if(!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(ip))return false
  const host=req.headers.host || ''
  if(!/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host))return false
  if(req.headers.origin && req.headers.origin!==`http://${host}` && req.headers.origin!==`https://${host}`)return false
  return !req.headers['sec-fetch-site'] || ['same-origin','none'].includes(req.headers['sec-fetch-site'])
}
function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body))}
export function discoveryPlugin({ranker=rankWithJev,statusReader=jevStatus,indexLoader=loadDiscoveryIndex}={}) {
  const getIndex=createIndexContexts(scope=>indexLoader(ROOT,scope,''),{stampOf:async scope=>{
    const files=await discoveryIndexFiles(ROOT,scope)
    const stamps=await Promise.all(files.map(file=>fs.stat(file).then(stat=>`${stat.mtimeMs}/${stat.ctimeMs}/${stat.size}`).catch(error=>{
      if(error.code==='ENOENT')return 'missing'
      throw error
    })))
    return stamps.join('|')
  }})
  const handle=createDiscoveryHandler({getIndex,ranker,statusReader})
  const middleware=async(req,res,next)=>{
    const url=new URL(req.url||'/','http://localhost')
    if(!url.pathname.startsWith('/api/discovery/'))return next()
    if(!localRequestAllowed(req))return json(res,403,{error:'LOCAL_ONLY'})
    let body=''
    if(req.method==='POST'&&String(req.headers['content-type']).startsWith('application/json')) {
      const limit=url.pathname==='/api/discovery/rank'?MAX_BODY_BYTES.rank:MAX_BODY_BYTES.other
      try{for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>limit)return json(res,413,{error:'REQUEST_TOO_LARGE'})}}
      catch{return}
    }
    const controller=new AbortController(),disconnect=()=>controller.abort()
    res.on('close',disconnect)
    try {
      const result=await handle({method:req.method,pathname:url.pathname,params:url.searchParams,body,contentType:req.headers['content-type']||'',signal:controller.signal,closed:()=>res.destroyed})
      if(result&&!res.destroyed)json(res,result.status,result.body)
    } finally {res.off('close',disconnect)}
  }
  return {name:'vislexicon-local-discovery',configureServer(server){server.middlewares.use(middleware)},configurePreviewServer(server){
    if(process.env.VISLEXICON_PREVIEW_API!=='1')return
    server.middlewares.use(discoveryPreviewAssets({root:ROOT,loadIndex:async()=>(await getIndex('curation')).index,isLocalRequest:localRequestAllowed}))
    server.middlewares.use(middleware)
  }}
}
