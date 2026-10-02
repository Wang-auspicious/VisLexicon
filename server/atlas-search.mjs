import { CATEGORY_FILES } from '../public/effects-atlas/fx/index.js'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
const cache=new Map()
export async function atlasSearchUnits(root) {
  if(!cache.has(root))cache.set(root,Promise.all(CATEGORY_FILES.map(async file=>(await import(pathToFileURL(path.join(root,'public/effects-atlas/fx',`${file}.js`)).href)).default)))
  return (await cache.get(root)).flatMap(category=>category.items.map(item=>({
    id:`atlas-term--${category.id}--${item.id}`,kind:'atlas-term',componentType:'term',scope:'atlas',theme:category.id,
    nameZh:item.zh,nameEn:item.en,descriptionZh:[item.dz,item.pz].filter(Boolean).join('。'),descriptionEn:[item.de,item.pe].filter(Boolean).join('. '),
    tags:[category.zh,category.en,item.zh,item.en],source:{name:'VisLexicon · 图鉴'},
    sourceUrl:`#/atlas/${encodeURIComponent(category.id)}/${encodeURIComponent(item.id)}`,
    detailUrl:`#/atlas/${encodeURIComponent(category.id)}/${encodeURIComponent(item.id)}`,
  })))
}
