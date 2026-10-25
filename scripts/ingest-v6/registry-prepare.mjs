import path from 'node:path';
import {root,output,readLines,request,mapLimit,parseJSON,registryItems,siteKey,writeJSON} from './registry-common.mjs';
const probes=readLines(path.join(root,'data/registry-probe/results.jsonl')).filter(r=>r.index&&r.base!=='https://github.com');
const sources=[];
await mapLimit(probes,5,async p=>{
 const [index,home]=await Promise.all([request(p.indexUrl,{retry:process.argv.includes('--refresh')}),request(p.homepage,{retry:process.argv.includes('--refresh')})]);
 const body=parseJSON(index.body);const items=registryItems(body);
 const links=[...home.body.toString('utf8').matchAll(/https?:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/g)].map(m=>m[1].replace(/[.]+$/,''));
 const r={sourceId:siteKey(p.base),sourceName:body?.name||siteKey(p.base),base:p.base,homepage:home.finalUrl||p.homepage,indexUrl:p.indexUrl,finalIndexUrl:index.finalUrl,indexStatus:index.status,indexDigest:index.sha,indexCount:items?.length||0,previousCount:p.index.count,templates:p.directory?.map(d=>d.url)||[],sample:p.item,technologies:p.technologies,githubCandidates:[...new Set(links)].filter(x=>!x.startsWith('sponsors/')).slice(0,30),items:items||[]};
 sources.push(r);console.log(r.sourceId,r.indexStatus,r.indexCount,JSON.stringify(r.githubCandidates));
});
sources.sort((a,b)=>a.base.localeCompare(b.base));writeJSON(path.join(output,'sources.json'),sources);
writeJSON(path.join(output,'snapshots',new Date().toISOString().replace(/[:.]/g,'-')+'-sources.json'),sources);
console.log('sources',sources.length,'observations',sources.reduce((n,x)=>n+x.indexCount,0));
