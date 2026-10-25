// Actual transparent screenshots of the approved fourteen live sample renders.
// No image synthesis, background erasure, source-site reconstruction or crop.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { chromium } from 'playwright-core'
import { resolveChromium } from '../playwright.config.js'

const run=promisify(execFile)
const frontend=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const sibling=path.resolve(frontend,'../component-bench')
const bench=await fs.access(path.join(sibling,'package.json')).then(()=>sibling).catch(()=>path.join(frontend,'component-bench'))
const { CATALOG }=await import(pathToFileURL(path.join(bench,'src/catalog.js')))
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const[k,...v]=a.replace(/^--/,'').split('=');return[k,v.join('=')||true]}))
const origin=args.origin||'http://127.0.0.1:5291'
const captureBase=path.join(frontend,'data/bencho-reference/20261025/posters')
const captureRoot=path.join(captureBase,'runs',new Date().toISOString().replace(/[:.]/g,'-'))
const destination=path.join(bench,'public/posters')
await Promise.all([fs.mkdir(captureRoot,{recursive:true}),fs.mkdir(destination,{recursive:true})])
const entries=CATALOG.filter(entry=>entry.lane!=='screenshot')
const browser=await chromium.launch({executablePath:resolveChromium(),headless:true,args:['--disable-dev-shm-usage']})
const screenshots=[]
try{
  const context=await browser.newContext({viewport:{width:800,height:500},deviceScaleFactor:1,reducedMotion:'no-preference',colorScheme:'dark'})
  const page=await context.newPage()
  for(const entry of entries){
    const errors=[]
    const onError=error=>errors.push(error.message)
    page.on('pageerror',onError)
    const sourceUrl=`${origin}/component-bench/?solo=${encodeURIComponent(entry.id)}&embed=1`
    for(let attempt=0;;attempt++){
      try{await page.goto(sourceUrl,{waitUntil:'domcontentloaded',timeout:20000});break}
      catch(error){if(attempt>=3||!String(error.message).includes('ERR_CONNECTION_REFUSED'))throw error;await page.waitForTimeout(500*(attempt+1))}
    }
    await page.waitForFunction(()=>window.__benchReady===true,null,{timeout:20000})
    await page.evaluate(()=>document.fonts.ready)
    const transparent=await page.evaluate(()=>[document.documentElement,document.body,document.getElementById('root'),...document.querySelectorAll('.bench-stage')].map(el=>getComputedStyle(el).backgroundColor))
    if(transparent.some(color=>!['transparent','rgba(0, 0, 0, 0)'].includes(color)))throw Error(`${entry.id}: embed wrapper is not transparent: ${transparent.join(',')}`)
    // Source-defined entrance/spring animations may continue after the first
    // real commit. Capture a visible settled sample, never the Suspense fallback.
    await page.waitForTimeout(2300)
    if(errors.length)throw Error(`${entry.id}: ${errors.join(';')}`)
    const png=path.join(captureRoot,`${entry.id}.png`)
    await page.screenshot({path:png,type:'png',omitBackground:true})
    screenshots.push({id:entry.id,sourceUrl,png,target:path.join(destination,`${entry.id}.webp`)})
    page.off('pageerror',onError)
    console.log(`captured actual transparent render: ${entry.id}`)
  }
  await context.close()
}finally{await browser.close()}
const captureList=path.join(captureRoot,'captures.json')
await fs.writeFile(captureList,JSON.stringify(screenshots))
const python=`import sys,json,pathlib,hashlib\nfrom PIL import Image\nrows=json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))\nresult={}\nfor row in rows:\n image=Image.open(row['png']);image.load();image=image.convert('RGBA')\n alpha=image.getchannel('A')\n if not alpha.getbbox():raise ValueError(row['id']+': entirely transparent/empty preview')\n image.save(row['target'],format='WEBP',lossless=True,method=6,exact=True)\n saved=Image.open(row['target']);saved.load()\n if saved.convert('RGBA').tobytes()!=image.tobytes():raise ValueError(row['id']+': lossless pixel verification failed')\n data=pathlib.Path(row['target']).read_bytes()\n result[row['id']]={'url':'posters/'+row['id']+'.webp','sha256':hashlib.sha256(data).hexdigest(),'width':image.width,'height':image.height,'bytes':len(data),'transparent':alpha.getextrema()[0]<255}\npathlib.Path(sys.argv[2]).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\\n',encoding='utf-8')\nprint(json.dumps({'images':len(result),'bytes':sum(x['bytes'] for x in result.values()),'transparent':sum(x['transparent'] for x in result.values())}))`
const manifest=path.join(bench,'src/generated/posters.json')
const temporary=path.join(captureRoot,'posters.json')
const converted=await run(process.env.VISLEXICON_PYTHON||'python',['-c',python,captureList,temporary],{windowsHide:true,maxBuffer:1<<20})
const result=JSON.parse(await fs.readFile(temporary,'utf8'))
if(Object.keys(result).length!==entries.length)throw Error('Poster count does not match live sample count')
for(const entry of entries){const metadata=result[entry.id],bytes=await fs.readFile(path.join(destination,entry.id+'.webp'));if(createHash('sha256').update(bytes).digest('hex')!==metadata.sha256)throw Error('Poster digest changed:'+entry.id)}
await fs.copyFile(temporary,manifest+'.tmp')
await fs.rename(manifest+'.tmp',manifest)
await fs.writeFile(path.join(captureRoot,'verification.json'),JSON.stringify({capturedAt:new Date().toISOString(),viewport:{width:800,height:500,dpr:1},entries:screenshots,manifest:result,decodedAndLosslessVerified:true},null,2))
await fs.writeFile(path.join(captureBase,'latest.json'),JSON.stringify({run:path.relative(captureBase,captureRoot),verification:path.relative(captureBase,path.join(captureRoot,'verification.json'))},null,2))
console.log(converted.stdout.trim())
