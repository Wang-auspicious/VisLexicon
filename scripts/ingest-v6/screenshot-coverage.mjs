// Coverage of the original Claude probe denominator, not a claim that captures
// from an arbitrary number of source hosts exhaust all screenshot-lane entries.
import fs from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {root,sha,readJSON,readLines,writeJSON} from './registry-common.mjs';
const run=promisify(execFile);
const out=path.join(root,'data/ingest-v6');
const snapshotCommit='26c1f532';
const {stdout}=await run('git',['show',`${snapshotCommit}:VisLexicon-browser-design-kit/frontend/public/data/site-index.json`],{encoding:'buffer',maxBuffer:32*1024*1024,windowsHide:true});
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'screenshot-source-site-index.raw.json'),stdout);
const original=JSON.parse(stdout.toString('utf8'));
const entries=(original.items??original).filter(e=>(e.facets?.deliverables??[]).includes('component'));
const probe=path.join(root,'data/registry-probe');
const sites=readLines(path.join(probe,'results.jsonl')),repos=readLines(path.join(probe,'github.jsonl')),npm=readJSON(path.join(probe,'npm.json'));
const lanes=new Map();
for(const s of sites)if(s.index&&s.base!=='https://github.com')for(const id of s.entries)lanes.set(id,'registry');
for(const r of repos)for(const id of r.entries)if(!lanes.has(id))lanes.set(id,r.error?'github-unreachable':r.archived?'github-archived':'github');
for(const s of sites.filter(s=>s.base!=='https://github.com'&&!s.index&&s.packages?.length)){
 const resolved=s.packages.slice(0,3).some(name=>npm[name]?.latest);if(!resolved)continue;
 for(const id of s.entries)if(!lanes.has(id))lanes.set(id,'npm');
}
for(const e of entries)if(!lanes.has(e.entryId))lanes.set(e.entryId,'screenshot');
const counts={};for(const e of entries)counts[lanes.get(e.entryId)]=(counts[lanes.get(e.entryId)]||0)+1;
if(entries.length!==1153||counts.screenshot!==474)throw Error('Original probe denominator changed: '+JSON.stringify({entries:entries.length,counts}));

const collection=readJSON(path.join(root,'data/discovery/local-public/index.json'));
const captures=(collection.units??[]).filter(u=>u.kind==='website-component'&&u.previewKind==='image');
const urls=[...new Set(captures.flatMap(u=>[u.previewUrl,u.hoverPreviewUrl]).filter(u=>typeof u==='string'))];
const requests=urls.map(url=>{
 if(!url.startsWith('/data/discovery/')||url.includes('..'))return {url,path:null,reason:'Invalid discovery image URL'};
 const relative=url.slice('/data/discovery/'.length);
 const file=[path.join(root,'data/discovery/local-public',relative),path.join(root,'public/data/discovery',relative)].find(f=>fs.existsSync(f));
 return {url,path:file??null,reason:file?null:'Image file missing from both active discovery roots'};
});
const requestPath=path.join(out,'screenshot-image-requests.json');writeJSON(requestPath,requests);
console.log('original entries',entries.length,'screenshot lane',counts.screenshot,'existing capture rows',captures.length,'unique images',requests.length);
const py=String.raw`
import json,sys,pathlib,hashlib,concurrent.futures
from PIL import Image
rows=json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))
def inspect(r):
 if not r['path']:return {"url":r['url'],"status":"missing","reason":r['reason']}
 try:
  p=pathlib.Path(r['path']);data=p.read_bytes()
  with Image.open(p) as im:
   im.load();w,h=im.size;fmt=im.format
  return {"url":r['url'],"status":"valid","bytes":len(data),"sha256":hashlib.sha256(data).hexdigest(),"width":w,"height":h,"format":fmt}
 except Exception as e:return {"url":r['url'],"status":"invalid","reason":str(e)[:300]}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:result=list(pool.map(inspect,rows))
pathlib.Path(sys.argv[2]).write_text(json.dumps(result,separators=(',',':')),encoding='utf-8')
print(json.dumps({"images":len(result),"valid":sum(r['status']=='valid' for r in result)}))
`;
const imagesPath=path.join(out,'screenshot-images.json');
const decoded=await run(process.env.VISLEXICON_PYTHON||'python',['-c',py,requestPath,imagesPath],{maxBuffer:1024*1024,windowsHide:true});console.log(decoded.stdout.trim());
const images=new Map(readJSON(imagesPath).map(r=>[r.url,r]));
const byEntry=new Map();for(const capture of captures){const group=byEntry.get(capture.entryId)??[];group.push(capture);byEntry.set(capture.entryId,group);}
const originalIds=new Set(entries.map(e=>e.entryId));
const mapped=entries.map(entry=>{
 const rows=(byEntry.get(entry.entryId)??[]).map(c=>({id:c.id,sourceUrl:c.sourceUrl,capturedAt:c.capturedAt,default:images.get(c.previewUrl),hover:c.hoverPreviewUrl?images.get(c.hoverPreviewUrl):null}));
 const valid=rows.filter(c=>c.default?.status==='valid');
 return {entryId:entry.entryId,name:entry.name,homepage:entry.homepage,lane:lanes.get(entry.entryId),status:valid.length?'has-existing-captures':'pending',captureRows:rows.length,validCaptureRows:valid.length,invalidOrMissingCaptureRows:rows.length-valid.length,sourceCoverageComplete:false,reason:valid.length?'Existing exact-entry captures verified by image decode; full source frontier not proven exhausted':rows.length?'Existing capture records have missing or invalid default images':'No existing capture with this exact original entryId',captures:rows};
});
const screenshotEntries=mapped.filter(e=>e.lane==='screenshot');
const imageCounts={};for(const im of images.values())imageCounts[im.status]=(imageCounts[im.status]||0)+1;
const report={generatedAt:new Date().toISOString(),snapshot:{commit:snapshotCommit,rawDigest:sha(stdout),componentEntries:entries.length,lanes:counts},
 collection:{generatedAt:collection.generatedAt,rawDigest:sha(fs.readFileSync(path.join(root,'data/discovery/local-public/index.json'))),captureRows:captures.length,distinctEntryIds:byEntry.size,uniqueImages:images.size,imageCounts},
 screenshotLane:{entries:screenshotEntries.length,withExistingCaptures:screenshotEntries.filter(e=>e.validCaptureRows>0).length,pending:screenshotEntries.filter(e=>e.validCaptureRows===0).length,validCaptureRows:screenshotEntries.reduce((n,e)=>n+e.validCaptureRows,0),fullyEnumeratedSources:0},
 allOriginalEntries:{entries:mapped.length,withExistingCaptures:mapped.filter(e=>e.validCaptureRows>0).length,pending:mapped.filter(e=>e.validCaptureRows===0).length},
 entries:screenshotEntries,allEntryCoverage:mapped.map(({captures,...e})=>e),unmatchedCaptureEntries:[...byEntry].filter(([id])=>!originalIds.has(id)).map(([entryId,rows])=>({entryId,captureRows:rows.length})),
 countConserved:screenshotEntries.length===474&&mapped.length===1153};
writeJSON(path.join(out,'screenshot-coverage.json'),report);
console.log(JSON.stringify({snapshot:report.snapshot,collection:report.collection,screenshotLane:report.screenshotLane,allOriginalEntries:report.allOriginalEntries,countConserved:report.countConserved},null,2));
