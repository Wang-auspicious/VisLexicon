import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {subjectOf, checkStyle, mixedAllowed} from './style-contract.mjs'
const FRONTEND=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..')

export function styleDigest(item, entry) {
  return crypto.createHash('sha256').update(JSON.stringify({entryId:item.entryId,subject:subjectOf(item),shots:(item.shots||[]).map(({src,page})=>({src,page})),style:entry||null})).digest('hex')
}

export function unresolvedStyle(item, entry) {
  return Boolean(subjectOf(item)) && (!entry || (!entry.unstyled && (entry.subjectVisible === false || Boolean(entry.failed) || !entry.styles?.length)))
}

/** Validation reads authoritative detail facets, even when the card index omits them. */
export function publishedStyleItems(index, detailDirectory = path.join(FRONTEND, 'public/data/site')) {
  return index.items.map(item => {
    const file = path.join(detailDirectory, `${item.entryId}.json`)
    if (!fs.existsSync(file)) return item
    const detail = JSON.parse(fs.readFileSync(file, 'utf8'))
    const shots=item.shots || (detail.pages || []).map(page => ({src:page.shot?.src,page:page.finalUrl || page.sourceUrl})).filter(shot=>shot.src)
    return {...item, shots, primaryCategory: detail.classification?.primaryCategory || item.primaryCategory, subcategory: detail.classification?.subcategory || item.subcategory, facets: detail.facets || item.facets}
  })
}

export function publicationStyleIssues(items, data, exemptions, now = new Date()) {
  const issues=[]
  for(const item of items) {
    if(!subjectOf(item))continue
    const entry=data.entries?.[item.entryId]
    if(unresolvedStyle(item,entry)) {
      const exception=exemptions.entries?.[item.entryId]
      if(!exception) {issues.push(`${item.entryId}: unresolved style requires an explicit pending-recapture exemption`);continue}
      if(exception.status!=='pending-recapture'||typeof exception.reason!=='string'||exception.reason.trim().length<12||!exception.nextAction||!exception.evidenceId)issues.push(`${item.entryId}: incomplete exemption`)
      if(exception.digest!==styleDigest(item,entry))issues.push(`${item.entryId}: exemption digest is stale`)
      if(!Number.isFinite(Date.parse(exception.expiresAt))||Date.parse(exception.expiresAt)<now.getTime())issues.push(`${item.entryId}: exemption expired`)
      continue
    }
    if(entry.unstyled) {
      if(subjectOf(item)!=='headless')issues.push(`${item.entryId}: unstyled exemption requires headless classification`)
      continue
    }
    const stats=(entry.subjectEvidence||[]).map(e=>({...e.stats,region:e.region,shellExcluded:e.shellExcluded,backgroundLuma:e.backgroundLuma}))
    for (const style of entry.styles || []) if (style.id === 'dark-neon') for (const i of style.images || []) {
      const evidence = entry.subjectEvidence?.[i - 1]
      if (evidence?.review !== 'accepted' || evidence?.colorScheme?.requested !== 'light' || !/^[a-f0-9]{64}$/.test(evidence?.sha256 || '') || !/^https?:\/\//.test(evidence?.url || '')) issues.push(`${item.entryId}: dark-neon crop ${i} lacks reviewed, light-preference capture provenance`)
    }
    // A stale signature may be removed while retaining independently cited tags.
    // Never fabricate a replacement sentence simply to satisfy a minimum length.
    for(const issue of checkStyle(entry,stats,subjectOf(item),mixedAllowed(item))) {
      if(issue==='signature-length'&&!entry.signatureZh)continue
      issues.push(`${item.entryId}: ${issue}`)
    }
  }
  return issues
}

async function main() {
  const args=Object.fromEntries(process.argv.slice(2).filter(value=>value.startsWith('--')).map(value=>{const [key,...parts]=value.slice(2).split('=');return [key,parts.join('=')||true]}))
  const read=(file)=>JSON.parse(fs.readFileSync(path.resolve(FRONTEND,file),'utf8'))
  const index=read(args.index||'public/data/site-index.json')
  const items=publishedStyleItems(index)
  const data=read(args.styles||'src/data/site-style.json')
  const exemptions=read(args.exemptions||'scripts/style/pending-recapture.json')
  const issues=publicationStyleIssues(items,data,exemptions)
  if(issues.length){console.error(`[style gate] ${issues.length} issue(s)\n${issues.join('\n')}`);process.exitCode=1;return}
  const applicable=items.filter(item=>subjectOf(item))
  const unresolved=applicable.filter(item=>unresolvedStyle(item,data.entries[item.entryId]))
  console.log(`[style gate] ${applicable.length} applicable; ${applicable.length-unresolved.length} resolved; ${unresolved.length} explicit, digest-bound pending-recapture exemptions; no public undecided labels`)
}
if(process.argv[1]&&import.meta.url.endsWith(path.basename(process.argv[1])))await main()
