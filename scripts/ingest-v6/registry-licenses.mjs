import path from 'node:path';
import {root,output,readJSON,github,mapLimit,writeJSON,sha} from './registry-common.mjs';
const sources=readJSON(path.join(output,'sources.json'));
const explicit={
 'constructive-io.github.io':'constructive-io/blocks',
 'ivcap-works.github.io':'ivcap-works/pihanga-shadcn',
};
const restrictive=new Set(['ui.aceternity.com','reactbits.dev','shadcnblocks.com']);
const excluded=new Set(['plexui.com','designrevision.com']); // Documentation/legacy-library licenses do not license a distinct registry.
const allow=/^(MIT|Apache-2\.0|BSD-2-Clause|BSD-3-Clause|ISC|0BSD|Unlicense)$/;
const licenses={};
await mapLimit([...new Map(sources.map(s=>[s.sourceId,s])).values()],4,async s=>{
 const repo=explicit[s.sourceId]||s.githubCandidates[0];
 let out={spdx:'unknown',text:'',url:'',verifiedAt:new Date().toISOString(),redistributable:false,reason:'No verified source license',repo:repo||null,identityEvidence:s.githubCandidates.includes(repo)?s.homepage:repo?`https://github.com/${repo}`:s.homepage};
 if(repo){
  const [meta,license]=await Promise.all([github(`repos/${repo}`),github(`repos/${repo}/license`)]);
  if(!license.error&&license.content){
   const text=Buffer.from(license.content,'base64').toString('utf8');
   const commit=await github(`repos/${repo}/commits/${encodeURIComponent(meta.default_branch||'HEAD')}`);
   Object.assign(out,{spdx:license.license?.spdx_id||'unknown',text,url:commit.sha?`https://github.com/${repo}/blob/${commit.sha}/${license.path}`:license.html_url,commit:commit.sha||null,licenseDigest:sha(text),licensePath:license.path});
   out.redistributable=allow.test(out.spdx)&&!restrictive.has(s.sourceId)&&!excluded.has(s.sourceId);
   out.reason=out.redistributable?'Upstream permissive license verified':restrictive.has(s.sourceId)?'Custom or restricted distribution terms require item-specific review':excluded.has(s.sourceId)?'Verified license covers docs repository, component source scope unverified':'License is unknown or requires manual redistribution review';
  }
 }
 licenses[s.sourceId]=out;console.log(s.sourceId,repo,out.spdx,out.redistributable);
});
writeJSON(path.join(output,'licenses.json'),licenses);
