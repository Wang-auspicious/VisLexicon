import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { DISCOVERY_SCOPES, inTheme } from '../src/lib/discovery-scopes.js'
import { verifyPublicRelations } from './published-relations.mjs'
export async function loadDiscoveryIndex(root,scope,theme='') {
  if(!Object.hasOwn(DISCOVERY_SCOPES,scope))throw new Error('INVALID_SCOPE')
  const read=p=>fs.readFile(path.join(root,p),'utf8').then(JSON.parse)
  const [base,captures,relations]=await Promise.all([read(`public/data/discovery/scopes/${scope}.json`),read('public/data/discovery/index.json'),read('public/data/discovery/relations.json').catch(error=>{if(error.code==='ENOENT')return {relations:[]};throw error})])
  if(relations.revision || relations.relations?.length)verifyPublicRelations(root)
  const additions=captures.units.filter(x=>scope==='atlas'?x.kind==='atlas-effect':scope==='curation'&&x.kind==='website-component').map(unit=>({...unit,scope,theme:unit.familyId?.split('/')[1]||unit.componentType,relatedSites:(relations.relations||[]).filter(x=>x.unitId===unit.id).map(x=>x.site)}))
  const units=[...additions,...base.units].filter(unit=>unit.scope===scope)
  const themes=[...new Set(units.flatMap(x=>[x.theme,...(x.themes||[])]).filter(Boolean))].sort()
  if(theme&&!themes.includes(theme))throw new Error('INVALID_THEME')
  const selected=units.filter(unit=>inTheme(unit,theme))
  const generatedAt=crypto.createHash('sha256').update(JSON.stringify({base,captures: additions,relations})).digest('hex')
  return {schemaVersion:'scoped-discovery/1.0',generatedAt,scope,theme,themes,units:selected,counts:{indexedInstances:selected.length,reviewedCaptures:selected.filter(x=>x.verification==='capture-v2-reviewed').length},examples:scope==='curation'?['有源码的免费组件库','适合做网站动效的工具','开源的按钮组件']:selected.flatMap(x=>x.exampleQueries||[]).slice(0,4)}
}
