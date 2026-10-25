import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const output = path.join(root, 'data/ingest-v6/registry');
export const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf8'));
export const readLines = file => fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse) : [];
export function writeJSON(file, object) { fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file+'.tmp', JSON.stringify(object,null,2)+'\n'); fs.renameSync(file+'.tmp',file); }
export function append(file,object) { fs.mkdirSync(path.dirname(file),{recursive:true}); fs.appendFileSync(file,JSON.stringify(object)+'\n'); }
export async function mapLimit(items,limit,fn) {let n=0;await Promise.all(Array.from({length:limit},async()=>{for(;;){const i=n++;if(i>=items.length)return;await fn(items[i],i);}}));}
const run=promisify(execFile);
export async function github(endpoint) {
 const key=sha(endpoint); const location=path.join(output,'raw/github',key+'.json');
 if(fs.existsSync(location)) return readJSON(location);
 let result;
 try {const {stdout}=await run('gh',['api',endpoint],{maxBuffer:32*1024*1024,windowsHide:true,timeout:45000});result=JSON.parse(stdout);}
 catch(e){result={error:String(e.stderr||e.message).slice(0,500)};}
 writeJSON(location,result);append(path.join(output,'github-requests.jsonl'),{endpoint,sha:sha(fs.readFileSync(location)),path:path.relative(output,location),at:new Date().toISOString(),ok:!result.error});
 return result;
}
export async function request(url,{retry=false}={}) {
 const key=sha(url);const metadata=path.join(output,'raw/http',key+'.json'); const bodyPath=path.join(output,'raw/http',key+'.body');
 if(fs.existsSync(metadata)){
  const cached=readJSON(metadata);const bytes=fs.existsSync(bodyPath)?fs.readFileSync(bodyPath):Buffer.alloc(0);
  const previousObject=path.join(output,'raw/objects',cached.sha+'.body');
  fs.mkdirSync(path.dirname(previousObject),{recursive:true});if(!fs.existsSync(previousObject))fs.writeFileSync(previousObject,bytes);
  if(!retry)return {...cached,body:bytes};
 }
 let record,body=Buffer.alloc(0);
 try {const r=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'user-agent':'VisLexicon/6 (component source inventory)','accept':'application/json,text/html;q=0.9,*/*;q=0.5'}});body=Buffer.from(await r.arrayBuffer());record={url,finalUrl:r.url,status:r.status,contentType:r.headers.get('content-type'),at:new Date().toISOString(),sha:sha(body),bytes:body.length};}
 catch(e){record={url,status:0,error:String(e.cause?.code||e.name),at:new Date().toISOString(),sha:sha(body),bytes:0};}
 // Keep every response body by digest even when an explicit refresh replaces the URL cache.
 const objectPath=path.join(output,'raw/objects',record.sha+'.body');
 fs.mkdirSync(path.dirname(objectPath),{recursive:true});if(!fs.existsSync(objectPath))fs.writeFileSync(objectPath,body);
 fs.mkdirSync(path.dirname(bodyPath),{recursive:true});fs.writeFileSync(bodyPath,body);writeJSON(metadata,record);append(path.join(output,'requests.jsonl'),{...record,objectPath:path.relative(output,objectPath)});
 return {...record,body};
}
export const parseJSON = body => {try{return JSON.parse(body.toString('utf8'));}catch{return null;}};
export function registryItems(body) {const items=Array.isArray(body?.items)?body.items:Array.isArray(body)?body:null;return items&&items.every(x=>x&&typeof x.name==='string')?items:null;}
export const siteKey = base => new URL(base).hostname.replace(/^www\./,'').replace(/[^a-z0-9.-]/g,'-');
