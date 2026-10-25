// Provision exact, locally resolved preview dependencies without lifecycle scripts.
// Registry source bytes remain untouched; imports and metadata are observations.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import os from 'node:os';
import {promisify} from 'node:util';
import {root,readJSON,writeJSON,append,sha,mapLimit} from './registry-common.mjs';
const run=promisify(execFile);
const out=path.join(root,'data/ingest-v6/runtime');fs.mkdirSync(out,{recursive:true});
const completePath=path.join(out,'provisioning-complete.json');if(fs.existsSync(completePath)){const history=path.join(out,'history');fs.mkdirSync(history,{recursive:true});fs.renameSync(completePath,path.join(history,Date.now()+'-complete.json'));}
const npmCli=process.env.VISLEXICON_NPM_CLI||path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
const npmRequire=createRequire(npmCli),semver=npmRequire('semver');
const benchRequire=createRequire(path.join(root,'../component-bench/package.json')),ts=benchRequire('typescript');
const allow=new Set(['MIT','ISC','Apache-2.0','BSD-2-Clause','BSD-3-Clause','0BSD','Unlicense','CC0-1.0','BlueOak-1.0.0','Zlib','MIT-0']);
const canonicalLicense=new Map([...allow].map(value=>[value.toLowerCase(),value]));
const catalog=readJSON(path.join(root,'data/ingest-v6/registry/catalog.json'));
const observed=new Map();const skipped=[];
function splitSpec(value){
 if(typeof value!=='string'||!value||/^(?:[./~]|https?:|data:|node:|#|@\/)/.test(value))return null;
 const parts=value.split('/');const scoped=value.startsWith('@');let packageName=scoped?parts.slice(0,2).join('/'):parts[0];
 let spec=packageName,range='latest';const at=packageName.indexOf('@',scoped?1:0);if(at>=0){range=packageName.slice(at+1)||'latest';packageName=packageName.slice(0,at);}
 if(!/^(@[a-zA-Z0-9_.-]+\/)?[a-zA-Z0-9_.-]+$/.test(packageName))return null;
 spec=at>=0?packageName+'@'+range:packageName;
 return {packageName,spec,range,subpath:parts.slice(scoped?2:1).join('/')};
}
function observe(value,item,kind){const parsed=splitSpec(value);if(!parsed)return;
 if(parsed.packageName==='cn'){skipped.push({spec:value,reason:'Synthetic cn helper is provided by renderer',itemId:item.id});return;}
 if(['react','react-dom'].includes(parsed.packageName)){skipped.push({spec:value,reason:'Shared React graph pinned by host to 19.3.1',itemId:item.id});return;}
 const key=parsed.spec;const current=observed.get(key)??{...parsed,sourceIds:new Set(),itemIds:new Set(),imports:new Set(),kinds:new Set()};
 current.sourceIds.add(item.sourceId);current.itemIds.add(item.id);current.imports.add(value);current.kinds.add(kind);observed.set(key,current);
}
for(const item of catalog.filter(x=>x.license?.redistributable&&x.framework==='react')){
 for(const value of item.dependencies??[])observe(value,item,'declared');
 for(const file of item.files??[]){if(!/\.[cm]?[jt]sx?$/.test(file.path??file.target??file.name??''))continue;
  const source=ts.createSourceFile(file.path??file.target??file.name,file.content,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function visit(node){
   if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))observe(node.moduleSpecifier.text,item,'source-import');
   if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&node.arguments[0]&&ts.isStringLiteral(node.arguments[0]))observe(node.arguments[0].text,item,'dynamic-import');
   ts.forEachChild(node,visit);
  }visit(source);
 }
}
const inputs=[...observed.values()].map(x=>({...x,sourceIds:[...x.sourceIds],itemIds:[...x.itemIds],imports:[...x.imports],kinds:[...x.kinds]})).sort((a,b)=>a.spec.localeCompare(b.spec));
catalog.length=0; // Original source strings are no longer needed while npm installs.
writeJSON(path.join(out,'inputs.json'),inputs);writeJSON(path.join(out,'skipped.json'),skipped);
console.log('Observed unique npm specs',inputs.length,'package roots',new Set(inputs.map(x=>x.packageName)).size);
const metadata=new Map();
async function fetchMetadata(packageName){
 const cache=path.join(out,'metadata',sha(packageName)+'.json');
 if(fs.existsSync(cache))return readJSON(cache);
 const url='https://registry.npmjs.org/'+encodeURIComponent(packageName);let result;
 try{const response=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{accept:'application/json','user-agent':'VisLexicon/6 local preview dependency provisioner'}});const bytes=Buffer.from(await response.arrayBuffer()),digest=sha(bytes);const raw=path.join(out,'raw',digest+'.body');fs.mkdirSync(path.dirname(raw),{recursive:true});if(!fs.existsSync(raw))fs.writeFileSync(raw,bytes);
  append(path.join(out,'observations.jsonl'),{packageName,url,status:response.status,rawDigest:digest,rawPath:path.relative(out,raw),observedAt:new Date().toISOString()});
  result=response.status===200?JSON.parse(bytes.toString('utf8')):{error:'npm metadata HTTP '+response.status};
 }catch(e){result={error:String(e.name||e.message)};append(path.join(out,'observations.jsonl'),{packageName,url,status:0,error:result.error,observedAt:new Date().toISOString()});}
 writeJSON(cache,result);return result;
}
await mapLimit([...new Set(inputs.map(x=>x.packageName))],8,async name=>{metadata.set(name,await fetchMetadata(name));});
const resolutions=[];
for(const input of inputs){const pack=metadata.get(input.packageName);let version;
 if(pack?.error){resolutions.push({...input,status:'metadata-failed',reason:pack.error});continue;}
 if(pack['dist-tags']?.[input.range])version=pack['dist-tags'][input.range];
 else if(pack.versions?.[input.range])version=input.range;
 else if(semver.validRange(input.range))version=semver.maxSatisfying(Object.keys(pack.versions??{}),input.range);
 const selected=pack.versions?.[version];if(!selected){resolutions.push({...input,status:'version-unresolved',reason:'No published npm version satisfies '+input.range});continue;}
 const declaredLicense=typeof selected.license==='string'?selected.license:selected.license?.type;
 const license=canonicalLicense.get(declaredLicense?.toLowerCase())??declaredLicense;
 const reactPeer=selected.peerDependencies?.react;
 const compatibleReact=!reactPeer||Boolean(semver.validRange(reactPeer)&&semver.satisfies('19.3.1',reactPeer,{includePrerelease:true}));
 resolutions.push({...input,version,license,declaredLicense,reactPeer:reactPeer??null,compatibleReact,dist:{integrity:selected.dist?.integrity,shasum:selected.dist?.shasum,tarball:selected.dist?.tarball},status:allow.has(license)?'resolved':'license-review',reason:allow.has(license)?'Exact npm version and declared license recorded; installed license text still requires bundle audit':'npm license is absent or not in the initial redistribution allowlist'});
}
const byName=new Map();for(const r of resolutions.filter(r=>r.status==='resolved')){const list=byName.get(r.packageName)??[];list.push(r);byName.set(r.packageName,list);}
metadata.clear();global.gc?.(); // Packuments can exceed 300MB; release before npm's dependency graph.
const dependencies={};
for(const [name,list] of byName){const primary=list.find(r=>r.spec===name)??list.slice().sort((a,b)=>semver.rcompare(a.version,b.version))[0];
 for(const r of list){r.installedName=r.version===primary.version?name:'vxl-'+name.replace(/[^a-zA-Z0-9-]/g,'-').toLowerCase()+'-'+sha(r.version).slice(0,8);dependencies[r.installedName]=r.installedName===name?r.version:`npm:${name}@${r.version}`;}
}
writeJSON(path.join(out,'resolutions.json'),resolutions);
writeJSON(path.join(out,'package.json'),{name:'vislexicon-private-preview-runtime',version:'0.0.0',private:true,description:'Exact preview dependencies; no upstream lifecycle scripts are executed.',dependencies});
console.log('Initially permitted exact package installs',Object.keys(dependencies).length,'metadata/license/version unresolved',resolutions.filter(r=>r.status!=='resolved').length);
async function npmInstall(args){
 try {const result=await run(process.execPath,[npmCli,'install','--ignore-scripts','--legacy-peer-deps','--no-audit','--no-fund','--save-exact',...args],{cwd:out,maxBuffer:16*1024*1024,timeout:60*60*1000,windowsHide:true});append(path.join(out,'install-log.jsonl'),{at:new Date().toISOString(),args,ok:true,output:result.stdout.slice(-6000)});return true;}
 catch(e){append(path.join(out,'install-log.jsonl'),{at:new Date().toISOString(),args,ok:false,error:(e.stderr||e.stdout||e.message).slice(-6000)});return false;}
}
let installed=process.argv.includes('--audit-only')||await npmInstall([]);
if(!installed){
 // Keep one unavailable package from preventing unrelated, permitted packages.
 const previous=readJSON(path.join(out,'package.json'));writeJSON(path.join(out,'package.json'),{...previous,dependencies:{}});
 const packages=Object.entries(dependencies).map(([name,version])=>name+'@'+version);
 for(let start=0;start<packages.length;start+=12){const batch=packages.slice(start,start+12);if(!await npmInstall(batch))for(const spec of batch)await npmInstall([spec]);}
}
let lock;try{lock=readJSON(path.join(out,'package-lock.json'));}catch{lock={};}
const cacache=npmRequire('cacache'),ssri=npmRequire('ssri'),tar=npmRequire('tar');
const npmCache=process.env.npm_config_cache||process.env.NPM_CONFIG_CACHE||(process.platform==='win32'?path.join(process.env.LOCALAPPDATA||path.join(os.homedir(),'AppData/Local'),'npm-cache'):path.join(os.homedir(),'.npm'));
const tarballChecks=new Map();
async function verifyCachedPackage(r){
 if(tarballChecks.has(r.installedName))return tarballChecks.get(r.installedName);
 const packageRoot=path.resolve(out,'node_modules',r.installedName),proof={installedName:r.installedName,name:r.packageName,version:r.version,integrity:r.dist.integrity,checkedAt:new Date().toISOString(),files:0,mismatches:[],repairs:[]};
 try{
  let bytes;try{bytes=await cacache.get.byDigest(path.join(npmCache,'_cacache'),r.dist.integrity);}catch{
   const response=await fetch(r.dist.tarball,{signal:AbortSignal.timeout(15*60*1000)});bytes=Buffer.from(await response.arrayBuffer());if(response.status!==200)throw Error('Tarball HTTP '+response.status);
   const raw=path.join(out,'raw',sha(bytes)+'.tgz');if(!fs.existsSync(raw))fs.writeFileSync(raw,bytes);append(path.join(out,'observations.jsonl'),{url:r.dist.tarball,status:response.status,rawDigest:sha(bytes),rawPath:path.relative(out,raw),observedAt:new Date().toISOString()});
  }
  if(!ssri.checkData(bytes,r.dist.integrity))throw Error('Cached/fetched tarball SRI mismatch');
  const tree=[];
  await new Promise((resolve,reject)=>{
   const parser=new tar.Parser({onReadEntry(entry){
    if(entry.type!=='File'){entry.resume();return;}
    const relative=entry.path.replace(/^[^/]+\//,'');const file=path.resolve(packageRoot,relative);
    if(!file.startsWith(packageRoot+path.sep)){proof.mismatches.push({path:entry.path,reason:'Archive path leaves package root'});entry.resume();return;}
    const hash=createHash('sha256'),chunks=[];entry.on('data',chunk=>{hash.update(chunk);chunks.push(chunk);});entry.on('end',()=>{const expected=hash.digest('hex');proof.files++;
     try{
      let actualBytes;try{actualBytes=fs.readFileSync(file);}catch(e){if(e.code!=='ENOENT')throw e;}
      let actual=actualBytes?sha(actualBytes):null;
      if(actual!==expected){
       let ancestor=file;while(!fs.existsSync(ancestor)){const parent=path.dirname(ancestor);if(parent===ancestor)throw Error('No existing package ancestor');ancestor=parent;}
       const physical=fs.realpathSync(ancestor),physicalRoot=fs.realpathSync(packageRoot);
       if(physical!==physicalRoot&&!physical.startsWith(physicalRoot+path.sep))throw Error('Repair would follow a path outside package root');
       const repair={path:relative,previousDigest:actual,restoredDigest:expected};
       if(actualBytes){const backup=path.join(out,'repairs',actual+'.body');fs.mkdirSync(path.dirname(backup),{recursive:true});if(!fs.existsSync(backup))fs.writeFileSync(backup,actualBytes);repair.backupPath=path.relative(out,backup);}
       fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,Buffer.concat(chunks));actual=sha(fs.readFileSync(file));proof.repairs.push(repair);
      }
      tree.push([relative,expected,actual]);if(actual!==expected)proof.mismatches.push({path:relative,reason:'Installed bytes differ from original npm tarball after repair'});
     }catch(e){proof.mismatches.push({path:relative,reason:e.code||e.message});}
    });entry.on('error',reject);
   }});parser.on('error',reject);parser.on('end',resolve);parser.end(bytes);
  });
  proof.fileTreeDigest=sha(JSON.stringify(tree.sort((a,b)=>a[0].localeCompare(b[0]))));proof.passed=proof.files>0&&proof.mismatches.length===0;
 }catch(e){proof.passed=false;proof.reason=e.message;}
 tarballChecks.set(r.installedName,proof);append(path.join(out,'package-byte-audit.jsonl'),proof);return proof;
}
let checked=0;
for(const r of resolutions.filter(r=>r.status==='resolved')){
 const locked=lock.packages?.['node_modules/'+r.installedName];
 if(locked?.version===r.version&&r.dist?.integrity&&locked.integrity!==r.dist.integrity){
  const proof=await verifyCachedPackage(r);if(proof.passed){locked.integrity=r.dist.integrity;locked.resolved=r.dist.tarball;}
 }
 if(++checked%25===0){if(lock.packages)writeJSON(path.join(out,'package-lock.json'),lock);console.log('Audited/repaired lock metadata for',checked,'/',resolutions.filter(r=>r.status==='resolved').length);}
}
if(lock.packages)writeJSON(path.join(out,'package-lock.json'),lock);
for(const r of resolutions){if(r.status!=='resolved')continue;
 try{const p=path.join(out,'node_modules',r.installedName,'package.json'),pkg=readJSON(p);if(pkg.version!==r.version)throw Error('Installed version differs from resolved version');
  const locked=lock.packages?.['node_modules/'+r.installedName];if(!lock.packages?.['']?.dependencies?.[r.installedName]||locked?.version!==r.version)throw Error('Exact installed package is missing from reproducible root lockfile');
  if(r.dist?.integrity&&locked.integrity!==r.dist.integrity)throw Error('Lockfile integrity differs from observed npm distribution metadata');
  r.status='installed';r.installedPackageName=pkg.name;r.installedLicense=pkg.license;r.installedPackageDigest=sha(fs.readFileSync(p));r.packagePath=path.relative(out,p);r.previewEligible=r.compatibleReact;
  if(!r.compatibleReact)r.previewReason='React peer dependency '+r.reactPeer+' excludes shared host React19.3.1; keep dependent examples source-only';
 }catch(e){r.status='install-failed';r.reason=e.message;}
}
writeJSON(path.join(out,'resolutions.json'),resolutions);
const statuses={};for(const r of resolutions)statuses[r.status]=(statuses[r.status]||0)+1;
const summary={generatedAt:new Date().toISOString(),inputSpecs:inputs.length,packageRoots:new Set(inputs.map(x=>x.packageName)).size,exactInstalls:Object.keys(dependencies).length,statuses,reactPeerMismatch:resolutions.filter(r=>r.status==='installed'&&!r.compatibleReact).length,lifecycleScripts:false,packageLockDigest:fs.existsSync(path.join(out,'package-lock.json'))?sha(fs.readFileSync(path.join(out,'package-lock.json'))):null};
writeJSON(path.join(out,'summary.json'),summary);console.log(JSON.stringify(summary,null,2));
writeJSON(path.join(out,'provisioning-complete.json'),{...summary,resolutionsDigest:sha(fs.readFileSync(path.join(out,'resolutions.json'))),allInstalledRecordsMatchExactLock:true});
