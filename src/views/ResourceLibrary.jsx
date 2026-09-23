import { useJevSearch } from '../lib/use-jev-search.js'
import { useMemo, useState } from 'react'
import PRACTICES from '../data/creative-practices.json'
import IMAGE_PROMPTS from '../data/image-prompts.json'
import { imageResourcePresentation } from '../lib/image-prompts.js'
import { resourceSection, RESOURCE_SECTIONS } from '../lib/creative-resources.js'
import { useLocale } from '../i18n.js'
import { navigate as navigateTo } from '../router.js'
import '../styles/resource-library.css'

// Columns with no published entries yet keep a placeholder taxonomy.
const PLACEHOLDER_TOPICS = { design: ['全部', '设计规范', '布局规则', '交互规则'], image: ['全部', '构图', '光线', '材质'], science: ['全部', '统计图', '方法示意', '网络结构'] }

// The presentation column derives its topics from the entries themselves, so a
// topic can never drift away from the copy that actually carries it.
const topicPairs = () => {
  const seen = new Map()
  for (const item of PRACTICES.filter(entry => entry.category === 'ppt')) {
    ;(item.kz || []).forEach((zh, index) => {
      if (!seen.has(zh)) seen.set(zh, { zh, en: (item.kw || [])[index] || zh, n: 0 })
      seen.get(zh).n += 1
    })
  }
  return [...seen.values()].sort((a, b) => b.n - a.n)
}

function ImagePromptDetail({ item, back }) {
  const en = useLocale() === 'en'
  const [copyState, setCopyState] = useState('idle')
  const presentation = imageResourcePresentation(item)
  const { isSkill, prompt, images, comparison, sourceOnly, links } = presentation
  return <article className="rl-detail">
    <div className="rl-breadcrumb"><button type="button" onClick={back}>{en?'← All prompts':'← 返回提示词'}</button><span>{item.topicZh}</span></div>
    <div className="rl-detail-layout"><div>
      <div className={images.length > 1 ? 'rl-comparison-pair' : undefined}>{images.map(image=><figure className={comparison.kind ? 'rl-stage rl-comparison' : 'rl-stage'} key={image.src}><img src={image.src} alt={`${en?item.titleEn:item.titleZh} · ${en?image.labelEn:image.labelZh}`}/><figcaption>{en?image.labelEn:image.labelZh} · {item.imageCredit || item.sourceName}</figcaption></figure>)}</div>
      {(comparison.caption || sourceOnly)&&<p>{comparison.caption || (en?'View the comparison at its source.':'前后效果请查看来源原图。')}{(comparison.sourceUrl || sourceOnly)&&<> <a href={comparison.sourceUrl || item.sourceUrl} target="_blank" rel="noreferrer">{en?'View comparison source':'查看效果来源'}</a></>}</p>}
      <h1>{en?item.titleEn:item.titleZh}</h1><p className="rl-lead">{en?(item.descriptionEn || item.titleEn):item.descriptionZh}</p>
      {prompt&&<section><h2>{en?'Reusable prompt':'可复制提示词'}</h2><p>{isSkill ? (en?'Use this invocation according to the original Skill instructions.':'按 Skill 原文说明使用下方调用提示。') : (en?'Upload your reference photo, then use this adapted prompt. The source example was not generated with this adapted wording.':'先上传你的参考照片，再使用下方整理版提示词。上方为来源效果图，整理版尚未独立复现。')}</p>
        <textarea className="rl-prompt" aria-label={en?'Image editing prompt':'图像编辑提示词'} readOnly value={prompt}/>
        <button className="rl-copy" type="button" onClick={async()=>{try{await navigator.clipboard.writeText(prompt);setCopyState('copied')}catch{setCopyState('failed')}}}>{copyState==='copied'?(en?'Copied':'已复制'):(en?'Copy prompt':'复制提示词')}</button>
        <span role="status">{copyState==='failed'?(en?'Select the prompt above to copy it manually.':'复制未成功，可选中上方文本手动复制。'):copyState==='copied'?(en?'Prompt copied.':'提示词已复制。'):''}</span>
      </section>}
      {item.inputPreview&&<figure className="rl-stage"><img src={item.inputPreview} alt={en?'Original reference image':'来源参考原图'} loading="lazy"/><figcaption>{en?'Source input reference':'来源输入参考图'}</figcaption></figure>}
    </div><aside className="rl-detail-notes">
      <section><h2>{en?'How to use':'使用方法'}</h2>{isSkill ? <><p>{item.skillName}</p><p>{en ? (item.usageEn || 'Read the original Skill and follow its setup instructions.') : (item.usageZh || '打开 Skill 原文，按说明获取并使用。')}</p></> : <ol><li>{en?'Upload a photo you may use.':'上传你可以使用的人物、宠物或物品照片。'}</li><li>{en?'Copy the prompt into an image editing model and adjust bracketed subjects.':'复制提示词到支持图像编辑的模型，按需要替换对象与文字。'}</li><li>{en?'Check identity, composition and details in the output.':'检查主体辨识度、构图和细节，再按需调整。'}</li></ol>}</section>
      {links.length>0&&<section><h2>{en?'Skill and recommendation':'Skill 与分享出处'}</h2>{links.map(link=><p key={link.zh}><a href={link.href} target="_blank" rel="noreferrer">{en?link.en:link.zh}</a></p>)}</section>}
      <section><h2>{en?'Original source':'原始来源'}</h2><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName}</a>{item.authorUrl&&<p><a href={item.authorUrl} target="_blank" rel="noreferrer">{en?'Author / original post':'作者／原帖'}</a></p>}<p>{en?'Reference model':'来源标注模型'}：{item.model || (en?'Not specified':'未注明')}</p><p>{en?'Model usage fees depend on your provider.':'模型使用费用以你的服务商为准。'}</p></section>
      {item.publishedAt&&<p>{en?'Original post date':'原帖发布日期'}：<time dateTime={item.publishedAt}>{item.publishedAt.slice(0,10)}</time></p>}
      {item.collectorUrl&&<p><a href={item.collectorUrl} target="_blank" rel="noreferrer">{en?'Collected prompt and example':'收录原文与效果图'}</a></p>}
      {item.sourceVerification?.noteZh&&<p>{en ? (item.sourceVerification.noteEn || 'Source attribution checked through a public collection or mirror.') : item.sourceVerification.noteZh}</p>}
      <section><h2>{en?'Image attribution':'图片署名'}</h2><p>{item.imageCredit || item.sourceName}</p>{item.imageLicenseUrl&&<a href={item.imageLicenseUrl} target="_blank" rel="noreferrer">{item.imageLicense || (en?'Source license':'来源许可')}</a>}</section>
    </aside></div>
  </article>
}

function PracticeDetail({ item, back }) {
  const [copied, setCopied] = useState(false)
  const en = useLocale() === 'en'
  const practice = item.practice
  const copy = en ? item.en : item.zh
  const caption = en ? practice.caption.en : practice.caption.zh
  return <article className="rl-detail">
    <div className="rl-breadcrumb"><button type="button" onClick={back}>{en ? '← All entries' : '← 返回作品'}</button><span>{en ? 'PPT' : 'PPT 制作'} / {(en ? item.kw : item.kz)[0]}</span></div>
    <div className="rl-detail-layout"><div>
      <figure className="rl-stage"><img src={item.preview} alt={caption} /><figcaption>{en ? 'Original diagram' : '原创结构示意'} · {caption}</figcaption></figure>
      <h1>{copy}</h1><p className="rl-lead">{en ? item.de : item.dz}</p>
      <section><h2>{en ? 'Why it is laid out this way' : '为什么这样排'}</h2><p>{en ? item.pe : item.pz}</p></section>
      <section><h2>{en ? 'Work through it' : '动手做一遍'}</h2><ol className="rl-steps">{(en ? practice.steps.en : practice.steps.zh).map((step, i) => <li key={i}>{step}</li>)}</ol></section>
      <section><h2>{en ? 'Practise on another subject' : '换一个题目练习'}</h2><p>{en ? practice.exercise.en : practice.exercise.zh}</p></section>
    </div><aside className="rl-detail-notes">
      <section><h2>{en ? 'Check the result' : '检查画面'}</h2><ul>{(en ? practice.checklist.en : practice.checklist.zh).map((check) => <li key={check}>{check}</li>)}</ul></section>
      <section><h2>{en ? 'Where it stops working' : '使用边界'}</h2><p>{en ? practice.caution.en : practice.caution.zh}</p></section>
      <section><h2>{en ? 'What was observed' : '观察来源'}</h2><p>{en ? practice.observation.en : practice.observation.zh}</p><p className="rl-source-pages">{en ? 'Pages' : '图页'} {item.source.images.join('、')}</p></section>
      <button className="rl-copy" type="button" onClick={async () => { try { await navigator.clipboard.writeText(en ? practice.prompt.en : practice.prompt.zh); setCopied(true) } catch { setCopied(false) } }}>{copied ? (en ? 'Copied' : '已复制') : (en ? 'Copy prompt' : '复制提示词')}</button>
    </aside></div>
  </article>
}

export default function ResourceLibrary({ channel, resourceType, query = {} }) {
  const en = useLocale() === 'en'
  const category = resourceSection(channel, resourceType)
  const section = RESOURCE_SECTIONS[category]
  const keyword = query.q || ''
  const [searchRevision,setSearchRevision]=useState(0)
  const all = useMemo(()=>category === 'image' ? IMAGE_PROMPTS.map(item=>({...item,zh:item.titleZh,en:item.titleEn,dz:item.descriptionZh,de:item.descriptionEn||item.titleEn,kz:[...new Set([item.topicZh,...item.tags])],kw:[...new Set([item.topicZh,...item.tags])],practice:{caption:{zh:item.titleZh,en:item.titleEn}}})) : PRACTICES.filter((item) => item.category === category),[category])
  const topics = category === 'image' ? [{zh:'全部',en:'All'},...Array.from(new Set(all.map(item=>item.topicZh))).map(zh=>({zh,en:zh}))] : category === 'ppt'
    ? [{ zh: '全部', en: 'All', n: all.length }, ...topicPairs()]
    : (PLACEHOLDER_TOPICS[category] || ['全部']).map((zh) => ({ zh, en: zh, n: 0 }))
  const topic = topics.some((entry) => entry.zh === query.topic) ? query.topic : '全部'
  const candidates=useMemo(()=>all.filter(item=>topic==='全部'||(en?item.kw:item.kz).includes(topic)),[all,topic,en])
  const jev=useJevSearch(keyword,candidates,'resource-list',searchRevision)
  const visible=jev.items
  const selected = all.find((item) => item.id === query.id)
  const navigate = (patch, replace = false) => {
    const next = { q: keyword, topic, ...patch }
    if(keyword&&(!next.q.startsWith(keyword)||next.q.length<keyword.length))setSearchRevision(value=>value+1)
    const params = new URLSearchParams()
    Object.entries(next).forEach(([key, value]) => { if (value && value !== '全部') params.set(key, value) })
    const href = `${section.path}${params.size ? `?${params}` : ''}`
    if (replace) { window.history.replaceState(null, '', href); window.dispatchEvent(new HashChangeEvent('hashchange')) }
    else navigateTo(href)
  }
  const intro = { ppt: en ? 'Start from the structure of a single page. Read the composition, take the method, make the practice your own.' : '从一页的结构开始。看构图、读方法，把练习变成自己的幻灯片。', science: en ? 'Make data, method and relationship legible.' : '让数据、方法与关系变得清楚。', image: en ? 'Start from the image and pull apart a reusable prompt for composition, light and material.' : '从画面出发，拆解可复用的构图、光线与材质提示。', design: en ? 'Visible design rules and creative methods you can reuse.' : '看得见的设计规则，能够复用的创作方法。' }[category]
  return <div className="rl-shell">
    <aside className="rl-sidebar"><p className="rl-sidebar-label">{en ? 'VISUAL LIBRARY' : '创作图谱'}</p><h2>{channel === 'skills' ? 'Skill' : en ? section.titleEn : section.titleZh}</h2>
      {channel === 'skills' && <nav className="rl-skill-types" aria-label={en ? 'Skill types' : 'Skill 类型'}><a href="#/skills/design" aria-current={category === 'design' ? 'page' : undefined}>{en ? 'Design rules' : '设计规范'}</a><a href="#/skills/image" aria-current={category === 'image' ? 'page' : undefined}>{en ? 'Image prompts' : '生图 Prompt'}</a></nav>}
      <nav className="rl-topic-nav" aria-label={en ? 'Entry topics' : '作品分类'}>{topics.map((entry) => <button type="button" key={entry.zh} aria-pressed={topic === entry.zh} onClick={() => navigate({ topic: entry.zh })}><span>{en ? entry.en : entry.zh}</span><small>{entry.zh === '全部' ? all.length : all.filter((item) => (en ? item.kw : item.kz).includes(entry.zh)).length}</small></button>)}</nav>
      <a className="rl-atlas-link" href="#/atlas">{en ? 'Browse the atlas' : '浏览图鉴'} <span>↗</span></a>
    </aside>
    <div className="rl-content">{selected ? (category==='image'?<ImagePromptDetail key={selected.id} item={selected} back={() => navigate({})}/>:<PracticeDetail key={selected.id} item={selected} back={() => navigate({})} />) : <>
      <header className="rl-header"><p className="rl-eyebrow">VISLEXICON / {category === 'ppt' ? 'PRESENTATION STUDIES' : section.code}</p><h1>{en ? section.titleEn : section.titleZh}</h1><p className="rl-intro">{intro}</p></header>
      <div className="rl-gallery-toolbar"><span role="status">{keyword.trim()?jev.status+' · ':''}{en ? `${visible.length} entries` : `${visible.length} 个${category === 'ppt' ? '版式练习' : '条目'}`}</span><label className="rl-search"><span className="sr-only">{en ? 'Search this column' : '搜索当前栏目'}</span><input type="search" placeholder={en ? 'Search title, composition, method…' : '搜索标题、构图、方法…'} value={keyword} onChange={(event) => navigate({ q: event.target.value }, true)} /></label></div>
      {query.id && <p role="status">{en ? 'That entry was not found. Pick another below.' : '未找到这个条目，请从下方重新选择。'}</p>}
      {visible.length ? <div className="rl-gallery">{visible.map((item, i) => <button type="button" className="rl-study" key={item.id} onClick={() => navigate({ id: item.id })}><div className="rl-study-image">{item.preview ? <img src={item.preview} alt={en ? item.practice.caption.en : item.practice.caption.zh} loading="lazy" /> : <span className="rl-study-source-only">{en ? 'View examples at the source' : '到原文查看效果'}</span>}</div><div className="rl-study-caption"><span className="rl-study-number">{String(i + 1).padStart(2, '0')}</span><div><h2>{en ? item.en : item.zh}</h2><p>{(en ? item.kw : item.kz).slice(0, 2).join(' / ')}</p></div><span aria-hidden="true">↗</span></div></button>)}</div> : <div className="rl-empty"><span className="rl-empty-mark" aria-hidden="true">＋</span><h2>{all.length ? (en ? 'Nothing matches' : '没有匹配的作品') : (en ? 'Nothing here yet' : '这里还没有收录作品')}</h2><p>{all.length ? (en ? 'Try another keyword, or go back to all topics.' : '试试其他关键词，或回到全部分类。') : (en ? 'Finished composition and typography studies are browsable in the atlas and in PPT.' : '已整理的构图与排版练习，可以在图鉴和 PPT 制作中浏览。')}</p><a href={all.length ? section.path : '#/atlas'}>{all.length ? (en ? 'View all' : '查看全部') : (en ? 'Open the atlas' : '去看图鉴')} →</a></div>}
    </>}</div>
  </div>
}
