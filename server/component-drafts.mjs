import fs from 'node:fs/promises'
import path from 'node:path'

// Private working material. Never included in the published index or model candidates.
export async function loadComponentDrafts(root) {
  let archive
  try { archive=JSON.parse(await fs.readFile(path.join(root,'data/discovery/legacy-index.json'),'utf8')) }
  catch(error) { if(error.code==='ENOENT')return {units:[],count:0,variants:0}; throw error }
  const units=archive.units.filter(unit=>unit.kind==='website-component').map(unit=>({
    id:unit.id,kind:unit.kind,componentType:unit.componentType,theme:unit.componentType,themes:['ui-implementation'],scope:'curation',
    nameZh:unit.nameZh,nameEn:unit.nameEn,descriptionZh:unit.descriptionZh,descriptionEn:unit.descriptionEn,
    tags:unit.tags,sourceUrl:unit.sourceUrl,source:{name:unit.sourceEntity},
    dimension:unit.dimension,visual:unit.visual,interaction:unit.interaction,
    previewUrl:unit.previewUrl,previewKind:unit.previewKind,
    verification:'draft',unknowns:unit.unknowns||[],variantId:unit.variantId,
  }))
  return {units,count:units.length,variants:new Set(units.map(unit=>unit.variantId)).size}
}
