// Run against the original integrated site. Owns only its headless browser.
// No provider/model calls, user-browser attachment, source ingestion or UI edits.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import os from 'node:os'
import { chromium } from 'playwright-core'
import { resolveChromium } from '../playwright.config.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=') || true] }))
const origin = args.origin || 'http://127.0.0.1:5291'
const phase = args.phase || 'current'
const cpuRate = Number(args.cpu || 1)
const out = path.join(root, 'data/bencho-reference/20261025', 'perf-' + phase)
const p95 = values => values.slice().sort((a,b) => a-b)[Math.max(0, Math.ceil(values.length * .95) - 1)] ?? 0
const round = n => Math.round(n * 10) / 10
await fs.mkdir(out, { recursive: true })
const report = { phase, origin, measuredAt: new Date().toISOString(), viewport: { width: 1440, height: 900 }, cpuRate, cpuScope: 'Main page before navigation; separate iframe targets additionally throttled on attachment for interaction probes when supported', network: 'local, unthrottled', failures: [], errors: [], requests: [] }
report.machine={platform:os.platform(),release:os.release(),cpuModel:os.cpus()[0]?.model,logicalCores:os.cpus().length,totalRamBytes:os.totalmem()}
const html=await fetch(origin+'/').then(response=>response.text())
report.document={sha256:createHash('sha256').update(html).digest('hex'),scripts:[...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map(match=>match[1])}
const check = (condition, message) => { if (!condition) report.failures.push(message) }
for (let i=0; i<4; i++) {
  const start=performance.now(), response=await fetch(origin + '/api/discovery/browse?page=1'), bytes=Buffer.from(await response.arrayBuffer())
  let data
  try { data=JSON.parse(bytes) } catch {
    report.failures.push(`Browse API returned non-JSON HTTP${response.status}; content-type=${response.headers.get('content-type')}; frontend-only preview is not an integrated production server`)
    report.passed=false
    await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2))
    console.log(JSON.stringify({passed:false,failures:report.failures}))
    process.exit(1)
  }
  ;(report.browse ??= []).push({ ms: round(performance.now()-start), bytes: bytes.length, status: response.status, allCount: data.allCount, pageItems: data.units?.length, sourceOnlyCards: data.units?.filter(u => !u.previewUrl).length })
}
check(report.browse.every(r => r.status===200 && r.pageItems<=24), 'Browse must return HTTP200 and ≤24 items')
check(report.browse.every(r => r.sourceOnlyCards===0), 'Visual component page contains source-only records')
check(p95(report.browse.slice(1).map(r=>r.ms))<500, 'Warm browse API p95 exceeds500ms')
const browser=await chromium.launch({ executablePath: resolveChromium(), headless: true, args: ['--disable-dev-shm-usage'] })
report.machine.browserVersion=browser.version()
try {
  const context=await browser.newContext({ viewport: report.viewport, deviceScaleFactor: 1, colorScheme:'dark' })
  await context.addInitScript(() => {
    // A fetch guard avoids provider calls without Playwright routing, which
    // disables HTTP caching and would invalidate the warm-reload measurement.
    const originalFetch=window.fetch
    window.fetch=function(input,...options){
      const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,location.href)
      if(url.pathname==='/api/discovery/search'||url.pathname.startsWith('/api/bench/jev'))return Promise.reject(new TypeError('Provider calls disabled in sample performance QA'))
      return originalFetch.call(this,input,...options)
    }
    window.__samplePerf={longTasks:[],inputs:[],usageEvents:[]}
    new PerformanceObserver(list => window.__samplePerf.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true})
    addEventListener('input',e=>{
      const entry={at:performance.now(),name:e.target.getAttribute('aria-label'),value:e.target.value}
      window.__samplePerf.inputs.push(entry)
      requestAnimationFrame(()=>{
        entry.controlFrameMs=performance.now()-entry.at
        entry.controlFill=e.target.closest('.dtl-bar')?.style.getPropertyValue('--fill')
        entry.controlValue=e.target.value
        entry.expectedFill=(Number(entry.value)-Number(e.target.min))/(Number(e.target.max)-Number(e.target.min))*100
      })
    },true)
    addEventListener('message',e=>{if(e.data?.type==='vislexicon:usage')window.__samplePerf.usageEvents.push({at:performance.now(),usage:e.data.usage})})
  })
  const page=await context.newPage()
  page.on('pageerror',e=>report.errors.push(e.message))
  page.on('request',r=>{if(r.url().startsWith(origin))report.requests.push({url:r.url().slice(origin.length),type:r.resourceType()})})
  const cdp=await context.newCDPSession(page)
  if(cpuRate!==1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpuRate})
  await cdp.send('Performance.enable')
  const loads=[]
  for(let i=0;i<2;i++){
    const started=performance.now()
    if(i===0)await page.goto(origin+'/#/components',{waitUntil:'domcontentloaded',timeout:60000})
    else await page.reload({waitUntil:'domcontentloaded',timeout:60000})
    await page.locator('.discovery-card').first().waitFor({timeout:60000})
    loads.push(round(performance.now()-started))
    ;(report.loads??=[]).push(await page.evaluate(()=>({longTasks:window.__samplePerf.longTasks.slice(),scripts:performance.getEntriesByType('resource').filter(e=>e.initiatorType==='script').map(e=>({url:e.name,decoded:e.decodedBodySize,transferred:e.transferSize}))})))
  }
report.pageReadyMs={browserCold:loads[0],browserWarm:loads[1],warmMethod:'page.reload, not same-hash SPA navigation',serverCache:'not reset; current running server'}
  report.initial=await page.evaluate(()=>({cards:document.querySelectorAll('.discovery-card').length,iframes:document.querySelectorAll('iframe').length,images:[...document.querySelectorAll('.discovery-card img')].map(i=>({lazy:i.loading==='lazy',loaded:i.complete&&i.naturalWidth>0})),scripts:performance.getEntriesByType('resource').filter(e=>e.initiatorType==='script').map(e=>({url:e.name,decoded:e.decodedBodySize,transferred:e.transferSize})),longTasks:window.__samplePerf.longTasks.slice()}))
  check(report.initial.cards<=24,'Listing mounts more than24cards')
  check(report.initial.iframes===0,'Listing eagerly mounts live iframe previews')
  check(report.initial.images.every(i=>i.lazy),'Listing images must be lazy-loaded')
  const pagination=page.locator('.component-pagination')
  if(await pagination.count()){
  await page.evaluate(()=>{
    window.__samplePerf.paginationMaxCards=document.querySelectorAll('.discovery-card').length
    window.__samplePerf.cardObserver=new MutationObserver(()=>{window.__samplePerf.paginationMaxCards=Math.max(window.__samplePerf.paginationMaxCards,document.querySelectorAll('.discovery-card').length)})
    window.__samplePerf.cardObserver.observe(document.body,{childList:true,subtree:true})
  })
  const paginationStart=performance.now()
  await pagination.locator('button').last().click()
  await page.waitForFunction(()=>document.querySelector('.component-pagination input')?.value==='2')
  report.pagination=await page.evaluate(()=>({page:Number(document.querySelector('.component-pagination input').value),cards:document.querySelectorAll('.discovery-card').length,maxCards:window.__samplePerf.paginationMaxCards,iframes:document.querySelectorAll('iframe').length}))
  report.pagination.readyMs=round(performance.now()-paginationStart)
  check(report.pagination.cards<=24&&report.pagination.maxCards<=24&&report.pagination.iframes===0,'Pagination mounts more than24cards or a liveiframe')
  await pagination.locator('button').first().click()
  await page.waitForFunction(()=>document.querySelector('.component-pagination input')?.value==='1')
  await page.evaluate(()=>{window.__samplePerf.cardObserver.disconnect();scrollTo(0,0)})
  }else report.pagination={applicable:false,reason:'Published sample fits one page',cards:report.initial.cards}
  report.scroll=await page.evaluate(async()=>{
    const intervals=[];let last=performance.now(),start=last
    await new Promise(resolve=>{const frame=now=>{intervals.push(now-last);last=now;scrollTo(0,(now-start)*1.3);if(now-start<1400)requestAnimationFrame(frame);else resolve()};requestAnimationFrame(frame)})
    scrollTo(0,0);return{frames:intervals.length,intervals,longTasks:window.__samplePerf.longTasks.filter(t=>t.start>=start)}
  })
  report.scroll.p95FrameMs=round(p95(report.scroll.intervals));report.scroll.maxFrameMs=round(Math.max(...report.scroll.intervals))
  check(report.scroll.p95FrameMs<34,'Scroll p95 frame interval exceeds34ms')
  report.details=[]
  const childProfiles=new Map()
  const openDetail=async id=>{
    await page.evaluate(()=>{location.hash='#/components'})
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
    await page.evaluate(id=>{location.hash='#/components?component=seed-'+id},id)
    await page.locator(':is(.vl-component-detail, dialog[open]) iframe').waitFor({timeout:20000})
    let frame
    const deadline=Date.now()+10000
    while(!frame&&Date.now()<deadline){frame=page.frames().find(f=>f.url().includes('?solo='+id));if(!frame)await page.waitForTimeout(25)}
    if(!frame)throw Error('Missing isolated renderer for '+id+'; actual frames: '+JSON.stringify(page.frames().map(f=>f.url())))
    if(cpuRate!==1||args.profileChild){
      try{const child=await context.newCDPSession(frame);if(cpuRate!==1)await child.send('Emulation.setCPUThrottlingRate',{rate:cpuRate});(report.childThrottle??=[]).push({id,applied:cpuRate!==1});if(args.profileChild&&!childProfiles.has(id)){await child.send('Profiler.enable');await child.send('Profiler.start');childProfiles.set(id,child)}}
      catch(error){(report.childThrottle??=[]).push({id,applied:false,reason:error.message})}
    }
    return frame
  }
  for(const [id,selector,control] of [['stacked-bars','.recharts-surface','radius'],['flow-canvas','.react-flow__node','gap']]){
    if(args.profile){await cdp.send('Profiler.enable');await cdp.send('Profiler.start')}
    const started=performance.now(),loadStart=report.requests.length
    const frame=await openDetail(id)
    await frame.locator(selector).first().waitFor({timeout:20000})
    const detail={id,readyMs:round(performance.now()-started),newRequests:report.requests.slice(loadStart),responseMs:[],controlFrames:[],closeFrameCounts:[],latencyMeaning:'Input event to matching usage emitted by the live renderer after React commit, not compositor presentation',controlFrameMeaning:'Input to first parent rAF; verifies controlled value and slider fill, not compositor presentation timestamp'}
    report.details.push(detail)
    const input=page.locator(`:is(.vl-component-detail, dialog[open]) input[aria-label="${control}"]`)
    await input.waitFor({timeout:10000})
    for(let n=0;n<12;n++){
      await page.evaluate(()=>{window.__samplePerf.inputs=[];window.__samplePerf.usageEvents=[]})
      await input.press(n%2===0?'ArrowRight':'ArrowLeft')
      await page.waitForFunction(key=>window.__samplePerf.inputs.length&&window.__samplePerf.usageEvents.some(e=>e.at>=window.__samplePerf.inputs[0].at&&e.usage.includes(`${key}={${window.__samplePerf.inputs[0].value}}`)),control,{timeout:4000})
      const ms=await page.evaluate(key=>{const input=window.__samplePerf.inputs[0];return window.__samplePerf.usageEvents.find(e=>e.at>=input.at&&e.usage.includes(`${key}={${input.value}}`)).at-input.at},control)
      detail.responseMs.push(round(ms))
      await page.waitForFunction(()=>window.__samplePerf.inputs[0]?.controlFrameMs!==undefined)
      detail.controlFrames.push(await page.evaluate(()=>window.__samplePerf.inputs[0]))
    }
    detail.responseP95Ms=round(p95(detail.responseMs))
    detail.controlFrameP95Ms=round(p95(detail.controlFrames.map(input=>input.controlFrameMs)))
    check(detail.controlFrames.every(input=>input.controlValue===input.value&&(!input.controlFill||Math.abs(parseFloat(input.controlFill)-input.expectedFill)<.1)),`${id} control value/fill is stale at its first animationframe`)
    check(detail.controlFrameP95Ms<100,`${id} input-to-control-frame p95 exceeds100ms`)
    check(detail.responseP95Ms<100,`${id} input-to-real-usage p95 exceeds100ms`)
    if(args.profile){const{profile}=await cdp.send('Profiler.stop');await fs.writeFile(path.join(out,id+'.cpuprofile'),JSON.stringify(profile))}
    if(args.profileChild){const{profile}=await childProfiles.get(id).send('Profiler.stop');await fs.writeFile(path.join(out,id+'-child.cpuprofile'),JSON.stringify(profile))}
    const codeTab=page.getByRole('tab',{name:'Code',exact:true})
    if(await codeTab.count()){
      await codeTab.click()
      if(!frame.isDetached())await frame.locator(selector).first().waitFor({state:'detached',timeout:5000})
      detail.previewPausedInCode=frame.isDetached()||await frame.locator(selector).count()===0
      check(detail.previewPausedInCode,`${id} keeps its live component active inCode mode`)
    }
    for(let n=0;n<4;n++){
      const modernClose=page.locator('.vl-component-detail .dtl-x')
      await (await modernClose.count()?modernClose:page.locator('dialog[open] header button').first()).click()
      await page.waitForFunction(()=>document.querySelectorAll('iframe').length===0)
      detail.closeFrameCounts.push(await page.locator('iframe').count())
      if(n<3){await openDetail(id);await page.waitForTimeout(100)}
    }
    check(detail.closeFrameCounts.every(n=>n===0),`${id} leaves iframe running afterclose`)
  }
  report.final=await page.evaluate(()=>({cards:document.querySelectorAll('.discovery-card').length,iframes:document.querySelectorAll('iframe').length,domNodes:document.querySelectorAll('*').length,heap:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null,longTasks:window.__samplePerf.longTasks}))
  report.cdpMetrics=(await cdp.send('Performance.getMetrics')).metrics.filter(m=>['JSHeapUsedSize','JSHeapTotalSize','Nodes','Documents','JSEventListeners','LayoutCount','RecalcStyleCount','TaskDuration','ScriptDuration'].includes(m.name))
  await cdp.send('HeapProfiler.collectGarbage')
  report.afterGarbageCollection=(await cdp.send('Performance.getMetrics')).metrics.filter(m=>['JSHeapUsedSize','Nodes','Documents','JSEventListeners'].includes(m.name))
  await page.screenshot({path:path.join(out,'final.png')})
  await context.close()
}catch(error){report.failures.push(error.message);report.exception=error.stack}
finally{await browser.close()}
report.requestCounts=Object.fromEntries([...new Set(report.requests.map(r=>r.type))].map(type=>[type,report.requests.filter(r=>r.type===type).length]))
check(report.errors.length===0,'Integrated page produced uncaught JavaScript errors')
report.detailRequests=Object.fromEntries([...new Set(report.requests.filter(r=>/\/items\//.test(r.url)).map(r=>r.url))].map(url=>[url,report.requests.filter(r=>r.url===url).length]))
for(const[url,count]of Object.entries(report.detailRequests))check(count<=4,`Repeated full-detail downloads: ${url} requested${count}times for4opens`)
report.passed=report.failures.length===0
await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2))
console.log(JSON.stringify({passed:report.passed,browse:report.browse,pageReadyMs:report.pageReadyMs,scroll:report.scroll?{p95:report.scroll.p95FrameMs,max:report.scroll.maxFrameMs}:null,details:report.details?.map(d=>({id:d.id,readyMs:d.readyMs,responseP95Ms:d.responseP95Ms,closedFrames:d.closeFrameCounts})),failures:report.failures},null,2))
if(!report.passed)process.exitCode=1
