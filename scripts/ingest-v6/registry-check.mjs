// Verify the complete local import against immutable raw HTTP observations.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {output,readJSON,sha,writeJSON,registryItems} from './registry-common.mjs';
const catalog=readJSON(path.join(output,'catalog.json'));
const observations=readJSON(path.join(output,'observations.json'));
const dispositions=readJSON(path.join(output,'dispositions.json'));
const summary=readJSON(path.join(output,'summary.json'));
const licenses=readJSON(path.join(output,'licenses.json'));
assert.equal(catalog.length,new Set(catalog.map(x=>x.id)).size,'Unique catalog IDs');
assert.equal(observations.length,dispositions.length,'Raw hit conservation');
assert.equal(observations.length,new Set(observations.map(x=>x.observationId)).size,'Unique observation IDs');
assert.equal(summary.rawObservations,observations.length);
assert.equal(summary.uniqueItems,catalog.length);
const rawDir=path.join(output,'raw/http');const byDigest=new Map();
for(const filename of fs.readdirSync(rawDir).filter(x=>x.endsWith('.json'))){const metadata=readJSON(path.join(rawDir,filename));if(metadata.status===200){const buf=fs.readFileSync(path.join(rawDir,filename.replace(/\.json$/,'.body')));assert.equal(sha(buf),metadata.sha,'Raw response hash '+metadata.url);byDigest.set(metadata.sha,buf);}}
let sourceRecords=0,sourceFiles=0;
for(const item of catalog){
 assert.equal(item.previewStatus,'unverified','Import must not claim rendered previews');
 assert.ok(item.sourceUrl.startsWith('https://'),'Direct source reference');
 assert.ok(item.status==='reference-only'||item.status==='fetch-failed'||item.status==='source-ready'||item.status==='support-resource');
 if(!item.license.redistributable)assert.equal(item.files.length,0,'No code without redistribution scope');
 if(item.status==='source-ready'||item.status==='support-resource'){
  sourceRecords++;assert.equal(item.license.redistributable,true);assert.ok(item.license.text.length>100);assert.ok(item.license.commit);assert.equal(sha(item.license.text),item.license.licenseDigest);
  assert.equal(item.license.licenseDigest,licenses[item.sourceId].licenseDigest,'Source license evidence matches policy');
  const bytes=byDigest.get(item.rawDigest);assert.ok(bytes,'Raw source preserved '+item.id);let original=JSON.parse(bytes.toString());
  if(original.name!==item.name)original=registryItems(original)?.find(x=>x.name===item.name);
  assert.ok(original,'Exact upstream registry item '+item.id);assert.equal(original.name,item.name,'Returned item identity');
  assert.equal(item.files.length,(original.files||[]).length,'Complete files '+item.id);
  for(let i=0;i<item.files.length;i++){const actual=item.files[i],expected=original.files[i];assert.equal(actual.path,expected.path??expected.target??expected.name);assert.equal(actual.content,expected.content,'Original file bytes preserved '+item.id+'/'+actual.path);assert.ok(actual.content.length>0);sourceFiles++;}
  assert.deepEqual(item.css,original.css||null,'Original CSS metadata');assert.deepEqual(item.cssVars,original.cssVars||null,'Original CSS vars');assert.deepEqual(item.registryDependencies,original.registryDependencies||[]);
 }
}
const report={checkedAt:new Date().toISOString(),catalogItems:catalog.length,rawObservations:observations.length,sourceRecords,sourceFiles,rawResponses:byDigest.size,passed:true,publishedPreviews:0};
writeJSON(path.join(output,'integrity-check.json'),report);console.log(JSON.stringify(report,null,2));
