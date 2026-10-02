import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CURATION_CATEGORIES, CURATION_SUBCATEGORIES } from '../data/curation-taxonomy.js'
import { REVIEW_AXIS_LABELS, REVIEW_AXIS_MODES, REVIEW_FACET_AXES } from '../data/curation-review-tags.js'
import { deleteReviewImage, listAllReviewImages, listReviewImages, pastedImageFromEvent, readClipboardImage, saveReviewImage, validateReviewImage } from '../lib/curation-review-images.js'

const DATA_URL = '/data/curation-review/site-catalog-index.json'
const STORAGE_KEY = 'vl-curation-review-v1'
const PAGE_SIZE = 40

const REVIEW_STATES = [
  ['unreviewed', '未审核'],
  ['keep', '保留'],
  ['exclude', '排除'],
  ['needs-review', '待复核'],
]

const OLD_CATEGORY_TO_V3 = {
  'UI 组件与设计系统': 'ui-implementation',
  '前端开发与动效': 'visual-implementation',
  '视觉素材与字体': 'visual-assets',
  '设计创作与原型': 'creation-tools',
  'UX 研究与学习': 'research-quality-tools',
  '灵感与案例': 'case-inspiration-collections',
  '品牌与营销': 'single-site-showcase',
  'AI 设计工具': 'creation-tools',
  '协作与效率': 'delivery-development-tools',
}

function emptyDecision() {
  return {
    status: 'unreviewed',
    primaryCategory: '',
    subcategory: '',
    facets: Object.fromEntries(Object.keys(REVIEW_FACET_AXES).map((axis) => [axis, []])),
    notes: '',
    evidenceUrl: '',
    evidenceTier: 'C',
    updatedAt: null,
  }
}

function readDecisions() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function normalizeEntry(entry) {
  return {
    ...entry,
    domain: entry.domain || (() => {
      try { return new URL(entry.canonicalUrl).hostname.replace(/^www\./u, '') } catch { return '' }
    })(),
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    subcategories: Array.isArray(entry.subcategories) ? entry.subcategories : [],
  }
}

export default function CurationReview() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [decisions, setDecisions] = useState(readDecisions)
  const [query, setQuery] = useState('')
  const [sourceCategory, setSourceCategory] = useState('')
  const [reviewFilter, setReviewFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let alive = true
    fetch(DATA_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`候选索引加载失败（${response.status}）`)
        return response.json()
      })
      .then((data) => alive && setState({ status: 'ready', data, error: null }))
      .catch((error) => alive && setState({ status: 'error', data: null, error }))
    return () => { alive = false }
  }, [])

  const entries = useMemo(() => (state.data?.entries || []).map(normalizeEntry), [state.data])
  const sourceCategories = useMemo(() => [...new Set(entries.map((entry) => entry.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN')), [entries])
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('zh-CN')
    return entries.filter((entry) => {
      const decision = decisions[entry.id]
      const review = decision?.status || 'unreviewed'
      if (reviewFilter && review !== reviewFilter) return false
      if (sourceCategory && entry.category !== sourceCategory) return false
      if (!needle) return true
      const haystack = [entry.name, entry.domain, entry.canonicalUrl, entry.descriptionZh, entry.category, ...entry.tags, ...entry.subcategories].filter(Boolean).join(' ').toLocaleLowerCase('zh-CN')
      return haystack.includes(needle)
    })
  }, [decisions, entries, query, reviewFilter, sourceCategory])

  useEffect(() => { setPage(1) }, [query, sourceCategory, reviewFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const reviewedCount = useMemo(() => entries.reduce((count, entry) => {
    const status = decisions[entry.id]?.status
    return count + (status && status !== 'unreviewed' ? 1 : 0)
  }, 0), [decisions, entries])
  const updateDecision = useCallback((id, patch) => {
    setDecisions((current) => {
      const next = { ...current, [id]: { ...emptyDecision(), ...(current[id] || {}), ...patch, updatedAt: new Date().toISOString() } }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* private browsing: keep this session usable */ }
      return next
    })
  }, [])

  const exportDecisions = async () => {
    let imageManifest = []
    try {
      imageManifest = (await listAllReviewImages()).map((record) => {
        const metadata = { ...record }
        delete metadata.blob
        return metadata
      })
    } catch { /* keep decision export usable if IndexedDB is unavailable */ }
    downloadJson(`vislexicon-curation-review-${new Date().toISOString().slice(0, 10)}.json`, {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      source: DATA_URL,
      candidateCount: entries.length,
      decisions,
      imageManifest,
    })
  }

  if (state.status === 'loading') return <section className="vl-review"><p role="status">正在加载候选索引…</p></section>
  if (state.status === 'error') return <section className="vl-review"><p className="vl-review-error" role="alert">{state.error?.message || '候选索引加载失败'} <button type="button" onClick={() => window.location.reload()}>重试</button></p></section>

  return (
    <section className="vl-review" aria-labelledby="vl-review-title">
      <header className="vl-review-head">
        <div>
          <p className="x-mono vl-review-kicker">PRIVATE CURATION WORKBENCH</p>
          <h1 id="vl-review-title">网站审核面板</h1>
          <p className="vl-review-intro">逐条打开原站，按 v3 对象层级、主分类和正交标签做人工决定。这里的候选仍是目录线索，不会自动进入公开索引。</p>
        </div>
        <div className="vl-review-actions">
          <button type="button" className="vl-review-button is-primary" onClick={exportDecisions}>导出审核 JSON</button>
          <span className="vl-review-save">已保存 {reviewedCount.toLocaleString()} 条决定</span>
        </div>
      </header>

      <div className="vl-review-stats" aria-label="候选统计">
        <div><strong>{entries.length.toLocaleString()}</strong><span>候选网站</span></div>
        <div><strong>{filtered.length.toLocaleString()}</strong><span>当前结果</span></div>
        <div><strong>{(entries.length - reviewedCount).toLocaleString()}</strong><span>尚未审核</span></div>
        <div><strong>{currentPage}/{pageCount}</strong><span>当前页</span></div>
      </div>

      <div className="vl-review-toolbar">
        <label className="vl-review-search"><span className="sr-only">搜索</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜名称、域名、描述、旧标签…" /></label>
        <label><span className="sr-only">原始类别</span><select value={sourceCategory} onChange={(event) => setSourceCategory(event.target.value)}><option value="">全部原始类别</option>{sourceCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label><span className="sr-only">审核状态</span><select value={reviewFilter} onChange={(event) => setReviewFilter(event.target.value)}><option value="">全部审核状态</option>{REVIEW_STATES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <button type="button" className="vl-review-button" onClick={() => { setQuery(''); setSourceCategory(''); setReviewFilter('') }}>清除筛选</button>
      </div>

      <p className="vl-review-help">每行保存到本机浏览器。打开原站使用新标签页，先决定保留 / 排除，再选一个主类；多轴标签只添加你看见或查到的事实。</p>

      <div className="vl-review-list">
        {visible.map((entry) => <ReviewRow key={entry.id} entry={entry} decision={decisions[entry.id]} onChange={updateDecision} />)}
      </div>

      <nav className="vl-review-pagination" aria-label="候选分页">
        <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>上一页</button>
        <span>第 {currentPage} / {pageCount} 页 · 每页 {PAGE_SIZE} 条</span>
        <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>下一页</button>
      </nav>
    </section>
  )
}

function ReviewRow({ entry, decision, onChange }) {
  const defaults = emptyDecision()
  const current = { ...defaults, ...(decision || {}), facets: { ...defaults.facets, ...(decision?.facets || {}) } }
  const suggestedCategoryId = OLD_CATEGORY_TO_V3[entry.category] || ''
  const categoryId = current.primaryCategory || ''
  const subcategories = categoryId ? (CURATION_SUBCATEGORIES[categoryId] || []) : []
  const setFacet = (axis, value) => {
    const values = Array.isArray(current.facets[axis]) ? current.facets[axis] : []
    const nextValues = REVIEW_AXIS_MODES[axis] === 'one'
      ? (values.includes(value) ? [] : [value])
      : (values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
    onChange(entry.id, { facets: { ...current.facets, [axis]: nextValues } })
  }
  return (
    <article className={`vl-review-row is-${current.status}`}>
      <div className="vl-review-row-main">
        <div className="vl-review-row-title">
          <span className="x-mono">{entry.id}</span>
          <h2>{entry.name || entry.id}</h2>
          <a href={entry.canonicalUrl} target="_blank" rel="noreferrer">打开原站 ↗</a>
        </div>
        <p className="vl-review-url">{entry.canonicalUrl}</p>
        <p className="vl-review-description">{entry.descriptionZh || '暂无描述。'} </p>
        <div className="vl-review-source-tags"><span>{entry.category || '原始类别未知'}</span>{entry.subcategories.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}{entry.tags.slice(0, 8).map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
      <div className="vl-review-row-controls">
        <label><span>审核状态</span><select value={current.status} onChange={(event) => onChange(entry.id, { status: event.target.value })}>{REVIEW_STATES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <div className="vl-review-classification">
          <label><span>v3 主分类{suggestedCategoryId ? ` · 来源建议：${CURATION_CATEGORIES.find((category) => category.id === suggestedCategoryId)?.label || suggestedCategoryId}` : ''}</span><select value={current.primaryCategory} onChange={(event) => onChange(entry.id, { primaryCategory: event.target.value, subcategory: '' })}><option value="">未决定（需人工选择）</option>{CURATION_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label>
          <label><span>小类</span><select value={current.subcategory} onChange={(event) => onChange(entry.id, { primaryCategory: current.primaryCategory || categoryId, subcategory: event.target.value })} disabled={!categoryId}><option value="">未决定</option>{subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.label}</option>)}</select></label>
        </div>
        <details className="vl-review-facets"><summary>多轴标签（已选 {Object.values(current.facets).flat().length}）</summary><div className="vl-review-facet-grid">{Object.entries(REVIEW_FACET_AXES).map(([axis, values]) => <fieldset key={axis}><legend>{REVIEW_AXIS_LABELS[axis] || axis}{REVIEW_AXIS_MODES[axis] === 'one' ? ' · 单选' : ' · 多选'}</legend><div>{values.map((facet) => <label key={facet.id} className={current.facets[axis]?.includes(facet.id) ? 'is-selected' : ''}><input type={REVIEW_AXIS_MODES[axis] === 'one' ? 'radio' : 'checkbox'} name={`${entry.id}-${axis}`} checked={current.facets[axis]?.includes(facet.id) || false} onChange={() => setFacet(axis, facet.id)} />{facet.label}</label>)}</div></fieldset>)}</div></details>
        <div className="vl-review-evidence">
          <label><span>直接证据 URL</span><input type="url" value={current.evidenceUrl} onChange={(event) => onChange(entry.id, { evidenceUrl: event.target.value })} placeholder="https://…（看过后再填）" /></label>
          <label><span>证据等级</span><select value={current.evidenceTier} onChange={(event) => onChange(entry.id, { evidenceTier: event.target.value })}><option value="A">A · 入口功能 / 条款</option><option value="B">B · 官方仓库 / 包</option><option value="C">C · 目录线索</option><option value="X">X · 阻塞 / 失败</option></select></label>
        </div>
        <label className="vl-review-notes"><span>备注</span><textarea rows="2" value={current.notes} onChange={(event) => onChange(entry.id, { notes: event.target.value })} placeholder="记录入口粒度、去重疑点、下一步…" /></label>
        <EvidenceImages entryId={entry.id} />
      </div>
    </article>
  )
}

const IMAGE_ROLES = [
  ['identity', '身份'],
  ['breadth', '范围'],
  ['proof', '事实证明'],
]

function EvidenceImages({ entryId }) {
  const [records, setRecords] = useState({})
  const [previews, setPreviews] = useState({})
  const [error, setError] = useState('')
  const previewUrlsRef = useRef({})

  useEffect(() => {
    let alive = true
    listReviewImages(entryId).then((items) => {
      if (!alive) return
      setRecords(Object.fromEntries(items.map((item) => [item.role, item])))
      const urls = Object.fromEntries(items.map((item) => [item.role, URL.createObjectURL(item.blob)]))
      previewUrlsRef.current = urls
      setPreviews(urls)
    }).catch(() => { if (alive) setError('本机图片存储不可用') })
    return () => {
      alive = false
      Object.values(previewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url))
    }
  // One row owns one stable entryId; changing the preview URL map should not reopen the database.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId])

  const receive = async (role, blob) => {
    if (!blob) return
    setError('')
    try {
      const image = await validateReviewImage(blob)
      const record = await saveReviewImage(entryId, role, image)
      setRecords((current) => ({ ...current, [role]: record }))
      setPreviews((current) => {
        if (current[role]) URL.revokeObjectURL(current[role])
        const next = { ...current, [role]: URL.createObjectURL(record.blob) }
        previewUrlsRef.current = next
        return next
      })
    } catch (receiveError) {
      setError(receiveError.message || '图片接收失败')
    }
  }

  const remove = async (role) => {
    try {
      await deleteReviewImage(entryId, role)
      if (previews[role]) URL.revokeObjectURL(previews[role])
      setRecords((current) => { const next = { ...current }; delete next[role]; return next })
      setPreviews((current) => { const next = { ...current }; delete next[role]; previewUrlsRef.current = next; return next })
    } catch (removeError) { setError(removeError.message || '图片删除失败') }
  }

  return <section className="vl-review-images" aria-label="三张证据截图">
    <div className="vl-review-images-head"><strong>三张证据截图</strong><span>在槽位内按 Alt+V 粘贴，或选择图片文件；每张都会做真实解码和 SHA-256 校验。</span></div>
    <div className="vl-review-image-grid">
      {IMAGE_ROLES.map(([role, label]) => {
        const record = records[role]
        return <div className={`vl-review-image-slot${record ? ' is-filled' : ''}`} key={role} tabIndex="0" onKeyDown={(event) => { if (event.altKey && event.key.toLowerCase() === 'v') { event.preventDefault(); readClipboardImage().then((image) => receive(role, image)).catch(() => setError('浏览器拒绝读取剪贴板，请改用 Ctrl+V 或选择文件')) } }} onPaste={(event) => { const image = pastedImageFromEvent(event); if (image) { event.preventDefault(); void receive(role, image) } }}>
          <div className="vl-review-image-slot-head"><span>{label}</span><span className="x-mono">{role}</span></div>
          {record ? <>
            <img src={previews[role]} alt={`${label}截图缩略图`} />
            <p>{record.width} × {record.height} px · {(record.bytes / 1024).toFixed(1)} KB</p>
            <p className="x-mono">sha256 {record.sha256.slice(0, 12)}…</p>
            <button type="button" onClick={() => void remove(role)}>移除并重贴</button>
          </> : <>
            <p className="vl-review-image-placeholder">点击此处后粘贴截图</p>
            <label className="vl-review-image-file">选择文件<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={(event) => { void receive(role, event.target.files?.[0]); event.target.value = '' }} /></label>
          </>}
        </div>
      })}
    </div>
    {error ? <p className="vl-review-image-error" role="status">{error}</p> : null}
  </section>
}
