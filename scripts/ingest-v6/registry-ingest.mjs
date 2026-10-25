import fs from 'node:fs';
import path from 'node:path';
import {root,output,readJSON,readLines,request,mapLimit,parseJSON,writeJSON,append,sha,github} from './registry-common.mjs';

const sources=readJSON(path.join(output,'sources.json'));
const licenses=readJSON(path.join(output,'licenses.json'));
const samples=new Map(readLines(path.join(root,'data/registry-probe/items.jsonl')).map(x=>[x.base,x]));
const ledger=path.join(output,'items.jsonl');
const done=new Map(readLines(ledger).map(x=>[x.id,x]));
const observations=[];const candidates=new Map();
const repositoryTrees=new Map();
async function repositoryItem(source,item){
 const license=licenses[source.sourceId];if(!license?.repo||!license.commit||!license.redistributable)return [];
 if(!repositoryTrees.has(source.sourceId))repositoryTrees.set(source.sourceId,github(`repos/${license.repo}/git/trees/${license.commit}?recursive=1`));
 const tree=await repositoryTrees.get(source.sourceId);if(tree.truncated||!Array.isArray(tree.tree))return [];
 const matches=tree.tree.filter(f=>f.type==='blob'&&f.path.endsWith('/'+item.name+'.json')&&/(?:public\/r|registry)\//.test(f.path));
 // Never silently choose one theme/style when the repository contains several.
 return matches.length===1?[`https://raw.githubusercontent.com/${license.repo}/${license.commit}/${matches[0].path}`]:[];
}
for(const source of sources){
 for(let ordinal=0;ordinal<source.items.length;ordinal++){
  const item=source.items[ordinal];const rawDigest=sha(JSON.stringify(item));
  const id='registry-'+source.sourceId.replace(/[^a-z0-9]/g,'-')+'-'+item.name.replace(/[^a-zA-Z0-9-]/g,'-').toLowerCase()+'-'+sha(source.sourceId+'/'+item.name).slice(0,8);
  const observation={observationId:sha(source.indexUrl+'#'+ordinal),id,indexUrl:source.indexUrl,indexDigest:source.indexDigest,ordinal,name:item.name,itemDigest:rawDigest};
  observations.push(observation);
  const previous=candidates.get(id);
  if(previous){
   observation.disposition=previous.rawDigest===rawDigest?'duplicate-observation':'identity-conflict';
   observation.duplicateOf=previous.observationId;observation.reason=previous.rawDigest===rawDigest?'Same registry host, exact item name and byte-equivalent index item':'Same registry host/name with conflicting item bytes; retained in raw ledger';
  }else{observation.disposition='candidate';candidates.set(id,{id,source,item,rawDigest,observationId:observation.observationId});}
 }
}
writeJSON(path.join(output,'observations.json'),observations); // Persist every hit before normalization.
writeJSON(path.join(output,'snapshots',sha(JSON.stringify(observations))+'-observations.json'),observations);

function urlsFor(source,item){
 const sample=samples.get(source.base);const name=encodeURIComponent(item.name);const out=[];
 if(sample?.found?.url&&sample.sample){const u=sample.found.url;out.push(u.replace(encodeURIComponent(sample.sample),name).replace(sample.sample,name));}
 for(const template of source.templates||[]){if(template.includes('{name}'))out.push(template.replace('{name}',name).replace('{style}','default'));}
 const root=source.indexUrl.replace(/\/[^/]+$/,'');out.push(root+'/'+name+'.json');
 return [...new Set(out)].slice(0,4);
}
const supports=new Set(['registry:lib','registry:hook','registry:style','registry:theme','registry:font','registry:base']);
function framework(item,source){
 const paths=(item.files||[]).map(f=>typeof f==='string'?f:f.path||'').join(' ');
 if(/\.svelte\b/.test(paths))return 'svelte';if(/\.vue\b/.test(paths))return 'vue';if(item.framework==='ng'||source.sourceId==='zardui.com')return 'angular';
 if(/\.(tsx|jsx)\b/.test(paths))return 'react';if(source.technologies?.includes('react'))return 'react';
 return source.technologies?.find(t=>['svelte','vue','angular','html'].includes(t))||'unknown';
}
function licenseFor(source,item){const lic=licenses[source.sourceId]||{spdx:'unknown',text:'',url:'',redistributable:false};
 const itemSpdx=item.license||item.meta?.license;
 if(itemSpdx&&itemSpdx!==lic.spdx)return {...lic,redistributable:false,reason:'Item-specific license differs from verified upstream license',itemLicense:itemSpdx};
 return lic;
}
function normalize(c,body,response,status,reason){
 const item=body||c.item;const license=licenseFor(c.source,item);const sourceUrl=typeof item.docs==='string'&&/^https?:/.test(item.docs)?item.docs:response?.finalUrl||response?.url||c.source.indexUrl;
 return {id:c.id,name:item.name||c.item.name,title:item.title||c.item.title||item.name||c.item.name,description:item.description||c.item.description||'',sourceId:c.source.sourceId,sourceName:c.source.sourceName,sourceUrl,registryUrl:response?.finalUrl||response?.url||null,indexUrl:c.source.indexUrl,
  type:item.type||c.item.type||'registry:item',framework:framework(item,c.source),dependencies:item.dependencies||[],devDependencies:item.devDependencies||[],registryDependencies:item.registryDependencies||[],
  files:license.redistributable?(item.files||[]).filter(f=>f&&typeof f==='object'&&typeof f.content==='string').map(f=>({...f,upstreamPath:f.path??null,path:f.path??f.target??f.name,content:f.content})):[],
  css:item.css||null,cssVars:item.cssVars||null,meta:item.meta||null,categories:item.categories||[],author:item.author||null,
  license,status,reason,supportResource:supports.has(item.type),rawDigest:response?.sha||c.rawDigest,indexItemDigest:c.rawDigest,observationId:c.observationId,
  retrievedAt:response?.at||new Date().toISOString(),previewStatus:'unverified',origin:'registry'};
}
let completed=0;
const queue=[...candidates.values()].filter(c=>!done.has(c.id)||(process.argv.includes('--retry-failed')&&done.get(c.id).status==='fetch-failed'));
console.log('raw observations',observations.length,'unique identities',candidates.size,'remaining',queue.length);
await mapLimit(queue,12,async c=>{
 const license=licenseFor(c.source,c.item);let result;
 if(!license.redistributable){result=normalize(c,null,null,'reference-only',license.reason||'License scope unverified');}
 else{
  let body,response;const attempts=[];
  if(Array.isArray(c.item.files)&&c.item.files.length&&c.item.files.every(f=>typeof f.content==='string')){body=c.item;response={url:c.source.indexUrl,finalUrl:c.source.finalIndexUrl,sha:c.source.indexDigest};}
  else for(const url of urlsFor(c.source,c.item)){
   let res=await request(url);if(res.status===0&&process.argv.includes('--retry-failed'))res=await request(url,{retry:true});attempts.push({url,status:res.status,error:res.error});const parsed=parseJSON(res.body);
   if(res.status===200&&parsed&&parsed.name===c.item.name&&String(parsed.type||'').startsWith('registry:')&&(Array.isArray(parsed.files)||parsed.css||parsed.cssVars||parsed.registryDependencies)){body=parsed;response=res;break;}
   if(res.status===401||res.status===403)break; // Do not circumvent access controls.
  }
  if(!body&&!attempts.some(a=>a.status===401||a.status===403))for(const url of await repositoryItem(c.source,c.item)){
   const res=await request(url);attempts.push({url,status:res.status,error:res.error});const parsed=parseJSON(res.body);
   if(res.status===200&&parsed?.name===c.item.name&&String(parsed.type||'').startsWith('registry:')&&(Array.isArray(parsed.files)||parsed.css||parsed.cssVars||parsed.registryDependencies)){body=parsed;response=res;break;}
  }
  if(body){
   const files=body.files||[];const allContent=files.length>0&&files.every(f=>typeof f?.content==='string'&&f.content.length>0);
   const bundle=files.length===0&&Boolean(body.css||body.cssVars||body.registryDependencies?.length);
   result=normalize(c,body,response,allContent?(supports.has(body.type)?'support-resource':'source-ready'):bundle?'support-resource':'fetch-failed',allContent?'Complete upstream source retrieved; preview not yet verified':bundle?'Upstream style/dependency bundle; no standalone component':'Upstream item does not contain complete files[].content');
   if(bundle){result.supportResource=true;result.supportKind='metadata-bundle';}
  }else result=normalize(c,null,null,'fetch-failed','No accessible complete registry item found');
  result.attempts=attempts;
 }
 done.set(c.id,result);append(ledger,result);
 if(++completed%100===0)console.log('processed',completed,'/',queue.length,'source-ready',[...done.values()].filter(x=>x.status==='source-ready').length);
});

const catalog=[...candidates.keys()].map(id=>done.get(id)).filter(Boolean).map(item=>({...item,registryUrl:item.status==='reference-only'?null:item.registryUrl,files:item.files.map(f=>({...f,upstreamPath:Object.hasOwn(f,'upstreamPath')?f.upstreamPath:f.path??null,path:f.path??f.target??f.name}))})).sort((a,b)=>a.id.localeCompare(b.id));
writeJSON(path.join(output,'catalog.json'),catalog);
const perStatus={};const perSource={};for(const item of catalog){perStatus[item.status]=(perStatus[item.status]||0)+1;const s=perSource[item.sourceId]??={total:0,statuses:{}};s.total++;s.statuses[item.status]=(s.statuses[item.status]||0)+1;}
const dispositions=observations.map(o=>({...o,disposition:o.disposition==='candidate'?done.get(o.id)?.status||'pending':o.disposition}));
writeJSON(path.join(output,'dispositions.json'),dispositions);
const dispositionCounts={};for(const o of dispositions)dispositionCounts[o.disposition]=(dispositionCounts[o.disposition]||0)+1;
const summary={generatedAt:new Date().toISOString(),sourceEndpoints:sources.length,uniqueSources:new Set(sources.map(s=>s.sourceId)).size,rawObservations:observations.length,uniqueItems:candidates.size,duplicateObservations:observations.filter(x=>x.disposition==='duplicate-observation').length,conflicts:observations.filter(x=>x.disposition==='identity-conflict').length,statuses:perStatus,dispositions:dispositionCounts,countConserved:Object.values(dispositionCounts).reduce((a,b)=>a+b,0)===observations.length,catalogComplete:catalog.length===candidates.size,publishedPreviews:0,perSource};
writeJSON(path.join(output,'summary.json'),summary);console.log(JSON.stringify(summary,null,2));
