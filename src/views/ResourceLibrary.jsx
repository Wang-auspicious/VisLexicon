import { useDiscoverySearch } from '../lib/use-discovery-search.js'
import { discoveryResourceId } from '../lib/discovery-resource-ids.js'
import { jevErrorMessage } from '../lib/jev-status.js'
import { lazy, use, useEffect, useMemo, useRef, useState } from 'react'
const DesignDocumentDetail = lazy(() => import('../components/DesignDocumentDetail.jsx'))
const UsableResourceDetail = lazy(() => import('../components/UsableResourceDetail.jsx'))
const ImagePromptDetail = lazy(() => import('../components/resource-library/ImagePromptDetail.jsx'))
const PracticeDetail = lazy(() => import('../components/resource-library/PracticeDetail.jsx'))
import { KitDetail } from './ResourceKit.jsx'
import { DocumentCard, EmptyState, StudyCard } from '../components/resource-library/ResourceCards.jsx'
import { loadResourceEntries, resourceTopics } from '../lib/resource-data.js'
import { filterResources, resourceSection, RESOURCE_SECTIONS } from '../lib/creative-resources.js'
import { USABLE_RESOURCE_TOPICS, matchesResourceTopic } from '../lib/usable-resource-topics.js'
import { matchesRequirements } from '../lib/discovery-scopes.js'
import { useLocale } from '../i18n.js'
import { topicEnglish } from '../lib/localized-content.js'
import { navigate as navigateTo } from '../router.js'
import { progressiveWindow, RESOURCE_PAGE_SIZE } from '../lib/progressive-list.js'
import '../styles/resource-library.css'

// Columns with no published entries yet keep a placeholder taxonomy.
const PLACEHOLDER_TOPICS = { design: ['全部', '设计规范', '布局规则', '交互规则'], image: ['全部', '构图', '光线', '材质'], science: ['全部', '统计图', '方法示意', '网络结构'] }
const DESIGN_TOPICS = new Set(['项目规范', '项目设计规范', '设计 Skill', '设计参考', '设计系统', '交互动效', '无障碍', '移动端', 'Stitch'])

// The presentation column derives its topics from the entries themselves, so a
// topic can never drift away from the copy that actually carries it.
const topicPairs = (all, category, selectedTopic) => resourceTopics(all).filter(topic => category !== 'design' || DESIGN_TOPICS.has(topic.zh) || topic.zh === selectedTopic)

function topicsFor(category, all, selectedTopic) {
  if (USABLE_RESOURCE_TOPICS[category]) return [{ zh: '全部', en: 'All' }, ...USABLE_RESOURCE_TOPICS[category].filter(topic => all.some(item => topic.matches(item)))]
  if (category === 'image') return [{ zh: '全部', en: 'All' }, ...Array.from(new Set(all.map(item => item.topicZh))).map(zh => ({ zh, en: topicEnglish(zh) }))]
  if (all.length) return [{ zh: '全部', en: 'All', n: all.length }, ...topicPairs(all, category, selectedTopic)]
  return (PLACEHOLDER_TOPICS[category] || ['全部']).map((zh) => ({ zh, en: topicEnglish(zh), n: 0 }))
}

function introFor(category, section, en) {
  return {
    ppt: en ? 'Complete templates, original Skills, and presentation files ready to use.' : '完整模板、原始 Skill 与演示文件，找到就能取用。',
    graphics: en ? section.descriptionEn : section.descriptionZh,
    science: en ? 'Statistical plots and figure layouts with real examples, original code and documented limits.' : '统计图与多图排版，附真实示例、原始代码和适用边界。',
    image: en ? 'Start from the image and pull apart a reusable prompt for composition, light and material.' : '从画面出发，拆解可复用的构图、光线与材质提示。',
    design: en ? 'Original design specifications and Skills. Read, copy or download the complete Markdown.' : '来自原始项目与作者的设计规范和 Skill，完整 Markdown 可直接阅读、复制、下载。',
  }[category]
}

function DetailFor({ category, item, back }) {
  const en = useLocale() === 'en'
  if (item.type === 'resource-kit') return <KitDetail key={item.id} item={item.kit} en={en} back={back} />
  if (category === 'design') return <DesignDocumentDetail key={item.id} item={item} back={back} />
  if (category === 'image') return <ImagePromptDetail key={item.id} item={item} back={back} />
  if (['ppt', 'graphics'].includes(category)) return <UsableResourceDetail key={item.id} item={item} back={back} />
  return <PracticeDetail key={item.id} item={item} back={back} />
}

export default function ResourceLibrary({ channel, resourceType, query = {} }) {
  const en = useLocale() === 'en'
  const category = resourceSection(channel, resourceType)
  const section = RESOURCE_SECTIONS[category]
  const keyword = query.q || ''
  const [composing, setComposing] = useState(false)
  const all = use(loadResourceEntries(category))
  const topics = topicsFor(category, all, query.topic)
  const topic = topics.some((entry) => entry.zh === query.topic) ? query.topic : '全部'
  const candidates = useMemo(() => all.filter(item => matchesResourceTopic(item, topic)), [all, topic])
  const allowedIds = useMemo(() => candidates.map(item => discoveryResourceId(item, category)), [candidates, category])
  const byId = useMemo(() => new Map(candidates.map(item => [discoveryResourceId(item, category), item])), [candidates, category])
  const jev = useDiscoverySearch({query:keyword,scope:channel,theme:channel==='skills'?category:'',allowedIds,composing,pageSize:48})
  const loadMore=jev.loadMore
  const localFallback=Boolean(keyword.trim()&&!jev.response)
  const localMatches=useMemo(()=>filterResources(candidates,{query:keyword}).filter(item=>matchesRequirements(keyword,item)),[candidates,keyword])
  const visible = keyword.trim() ? (localFallback?localMatches:(jev.displayResponse?.units||[]).map(unit=>byId.get(unit.id)).filter(Boolean)) : candidates
  /* Keep the DOM small on large resource columns. The old list mounted every
   * card (and every image node) at once, which made route changes and scrolling
   * compete with hundreds of layout/paint tasks. More cards are appended as
   * the user approaches the end, so the existing grid and ordering stay intact. */
  const viewKey = `${category}|${topic}|${keyword}`
  const [visibleState, setVisibleState] = useState({ key: '', count: RESOURCE_PAGE_SIZE })
  const visibleCount = visibleState.key === viewKey ? visibleState.count : RESOURCE_PAGE_SIZE
  const { items: renderedVisible, hasMore: hasLocalMore } = progressiveWindow(visible, visibleCount)
  const hasRemoteMore = Boolean(keyword.trim() && jev.response?.query === keyword.trim() && visible.length < jev.displayResponse.matchCount)
  const hasMore = hasLocalMore || hasRemoteMore
  const loadMoreRef = useRef(null)
  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel || !hasMore || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      if (!hasLocalMore && hasRemoteMore) { if(!jev.loadingMore&&!jev.pageError)loadMore(); return }
      setVisibleState((previous) => {
        const count = previous.key === viewKey ? previous.count : RESOURCE_PAGE_SIZE
        return { key: viewKey, count: Math.min(count + RESOURCE_PAGE_SIZE, visible.length) }
      })
    }, { rootMargin: '720px 0px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [viewKey, visible.length, visibleCount, hasMore, hasLocalMore, hasRemoteMore, jev.response?.refineToken, jev.loadingMore,jev.pageError,loadMore])
  const selected = all.find((item) => item.id === query.id)
  const navigate = (patch, replace = false) => {
    const next = { q: keyword, topic, ...patch }
    if (Object.hasOwn(patch, 'q')) jev.updateQuery(next.q)
    const params = new URLSearchParams()
    Object.entries(next).forEach(([key, value]) => { if (value && value !== '全部') params.set(key, value) })
    const href = `${section.path}${params.size ? `?${params}` : ''}`
    if (replace) { window.history.replaceState(null, '', href); window.dispatchEvent(new HashChangeEvent('hashchange')) }
    else navigateTo(href)
  }
  const isFileCard = (item) => category === 'design' || (['ppt', 'graphics'].includes(category) && !item.preview)
  const status = localFallback ? (en?`${visible.length} local keyword matches · ${jev.error?'Jev is not connected':'Jev is checking…'}`:`本地关键词筛选 ${visible.length} 条 · ${jev.error?'Jev 未连接':'Jev 正在判断…'}`) : keyword.trim() ? `${jev.statusText(en)}${jev.error ? ' · '+jevErrorMessage(jev.error,en) : ''}` : (en ? `${visible.length} ${category === 'design' ? 'Markdown files' : 'entries'}` : category === 'design' ? `${visible.length} 份 Markdown` : `${visible.length} 个条目`)
  const placeholder = category === 'design'
    ? (en ? 'Search documents, projects, authors…' : '搜索规范、项目、作者…')
    : (en ? 'Search title, composition, method…' : '搜索标题、构图、方法…')

  return <div className="rl-shell">
    <aside className="rl-sidebar">
      <p className="rl-sidebar-label">{en ? 'VISUAL LIBRARY' : '创作图谱'}</p>
      <h2>{channel === 'skills' ? 'Skill' : en ? section.titleEn : section.titleZh}</h2>
      {channel === 'skills' && <nav className="rl-skill-types" aria-label={en ? 'Skill types' : 'Skill 类型'}>
        <a href="#/skills/design" aria-current={category === 'design' ? 'page' : undefined}>{en ? 'Design rules' : '设计规范'}</a>
        <a href="#/skills/image" aria-current={category === 'image' ? 'page' : undefined}>{en ? 'Image prompts' : '生图 Prompt'}</a>
      </nav>}
      <nav className="rl-topic-nav" aria-label={en ? 'Entry topics' : '作品分类'}>
        {topics.map((entry) => <button type="button" key={entry.zh} aria-pressed={topic === entry.zh} onClick={() => navigate({ topic: entry.zh })}>
          <span>{en ? entry.en : entry.zh}</span>
          <small>{entry.zh === '全部' ? all.length : all.filter((item) => matchesResourceTopic(item, entry.zh)).length}</small>
        </button>)}
      </nav>
      <a className="rl-atlas-link" href="#/atlas">{en ? 'Browse the atlas' : '浏览图鉴'} <span>↗</span></a>
    </aside>
    <div className="rl-content">
      {selected ? <DetailFor category={category} item={selected} back={() => navigate({})} /> : <>
        <header className="rl-header">
          <p className="rl-eyebrow">VISLEXICON / {section.code}</p>
          <h1>{en ? section.titleEn : section.titleZh}</h1>
          <p className="rl-intro">{introFor(category, section, en)}</p>
        </header>
        <div className="rl-gallery-toolbar">
          <span role="status">{status}</span>
          <label className="rl-search">
            <span className="sr-only">{en ? 'Search this column' : '搜索当前栏目'}</span>
            <input type="search" placeholder={placeholder} value={keyword} onCompositionStart={()=>{jev.setComposing(true);setComposing(true)}} onCompositionEnd={event=>{jev.setComposing(false);setComposing(false);navigate({q:event.currentTarget.value},true)}} onChange={(event) => navigate({ q: event.target.value }, true)} />
          </label>
        </div>
        {query.id && <p role="status">{en ? 'That entry was not found. Pick another below.' : '未找到这个条目，请从下方重新选择。'}</p>}
        {visible.length
          ? <div className="rl-gallery">{renderedVisible.map((item, i) => (isFileCard(item)
            ? <DocumentCard key={item.id} item={item} en={en} onOpen={() => navigate({ id: item.id })} />
            : <StudyCard key={item.id} item={item} index={i} en={en} showSummary={['ppt', 'graphics'].includes(category)} onOpen={() => navigate({ id: item.id })} />))}</div>
          : keyword.trim() && (['idle','waiting','preparing','ranking'].includes(jev.status)||jev.response?.remainingCount>0) ? <p role="status">{status}</p> : <EmptyState hasEntries={all.length > 0} en={en} allPath={section.path} />}
        {jev.error && keyword.trim() && <button type="button" onClick={jev.retry}>{en?'Retry Jev':'重试 Jev'}</button>}
        {jev.pageError && <button type="button" onClick={jev.loadMore}>{en?'Retry loading':'重试加载'}</button>}
        {hasMore && <div ref={loadMoreRef} className="rl-gallery-sentinel" aria-hidden="true" />}
      </>}
    </div>
  </div>
}
