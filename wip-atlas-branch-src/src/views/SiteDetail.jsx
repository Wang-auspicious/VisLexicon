import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import atlasCorpus from '../data/visual-atlas.json'
import DomainMark from '../components/DomainMark.jsx'
import EvidenceTrio from '../components/EvidenceTrio.jsx'
import ArchiveDisclosure from '../components/ArchiveDisclosure.jsx'
import { useModalFocus } from '../lib/use-modal-focus.js'
import { facetLabel, isoDate, isUnknown, UNKNOWN_ZH } from '../lib/site-detail-labels.js'

/**
 * 站点详情：`#/site/<entryId>` 的路由页（方案 §4.6）。
 * 一个组件两种形态——桌面浮窗、手机底部抽屉，由 CSS 在 768px 处切换。
 *
 * 信息出场顺序是判断在前、字段在后：
 *   ① 通往源站的大链接（第一个元素）  ② 一句编辑判断  ③ 三张证据图
 *   ④ 你能拿走什么 · 权利边界        ⑤ 示范了哪些术语  ⑥ 为什么收录它
 *   ⑦ 折叠档案（全部事实、切面标签与 Agent 入口）
 * 切面标签只出现在 ⑦，页面上没有任何不可执行的假按钮。
 */

const ENTRY_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

/* 「拿得走」的动作：能把东西带离本站的那几个，其余（browse/search/learn…）不算。 */
const ACQUIRE_ACTIONS = ['copy', 'install', 'download', 'purchase']

let TERM_NAMES = null
/* 术语 id → 图鉴里的术语名。语料里没有这条 id 就原样显示 id，不猜名字。
   （termZh 是机器翻译，"Skeleton"→"骷髅" 这类不能上界面，所以取 termEn。） */
function termName(termId) {
  if (!TERM_NAMES) {
    TERM_NAMES = new Map((atlasCorpus.entries || []).map((entry) => [entry.id, entry.termEn]))
  }
  return TERM_NAMES.get(termId) || termId
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* ---------- ④ 你能拿走什么 · 权利边界 ---------- */
function RightsBlock({ data }) {
  const facets = data.facets || {}
  const deliverables = facets.deliverables ?? []
  const acquire = (facets.actions ?? []).filter((action) => ACQUIRE_ACTIONS.includes(action))
  const access = facets.access ?? []
  const licenseFact = (data.facts ?? []).find((fact) => fact.field === 'license')
  const licenseValue = licenseFact?.value ?? (facets.licenses ?? [])[0] ?? null
  const pricing = data.editorial?.pricing

  return (
    <section className="sd-section sd-rights-block">
      <h3 className="sd-h">你能拿走什么 · 权利边界</h3>
      <p className="sd-take">
        {deliverables.length > 0 ? (
          <span className="sd-take-what">
            {deliverables.map((value) => facetLabel('deliverables', value)).join(' · ')}
          </span>
        ) : (
          <span className="sd-take-what sd-unknown">未标注可带走的产物</span>
        )}
        <span className="sd-take-sep" aria-hidden="true">—</span>
        {acquire.length > 0 ? (
          <span className="sd-take-how">
            可{acquire.map((value) => facetLabel('actions', value)).join('、')}
          </span>
        ) : (
          <span className="sd-take-how sd-unknown">未标注可复制、安装、下载或购买的动作</span>
        )}
      </p>
      <dl className="sd-rights">
        <div>
          <dt>许可</dt>
          <dd>
            {licenseValue && !isUnknown(licenseValue) ? (
              <span>{licenseValue}</span>
            ) : (
              <span className="sd-unknown">{UNKNOWN_ZH}</span>
            )}
            {licenseFact?.sourceUrl ? (
              <a
                className="sd-src"
                href={licenseFact.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="在新标签打开许可这条事实的来源"
              >
                来源 <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>取用条件</dt>
          <dd>
            {access.length > 0 ? (
              <span>{access.map((value) => facetLabel('access', value)).join(' · ')}</span>
            ) : (
              <span className="sd-unknown">{UNKNOWN_ZH}</span>
            )}
          </dd>
        </div>
        <div>
          <dt>定价</dt>
          <dd>
            {pricing && !isUnknown(pricing) ? (
              <span>{pricing}</span>
            ) : (
              <span className="sd-unknown">{UNKNOWN_ZH}</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  )
}

/* ---------- ⑤ 这个站示范了哪些术语（L3） ---------- */
function AtlasTerms({ curation }) {
  const terms = curation?.atlasTerms ?? []
  const draft = curation?.atlasTermsStatus === 'editor-draft'
  return (
    <section className="sd-section">
      <h3 className="sd-h">
        这个站示范了哪些术语
        {draft ? <span className="sd-flag">编辑草稿</span> : null}
      </h3>
      {terms.length === 0 ? (
        <p className="sd-empty-note">尚未标注</p>
      ) : (
        <ul className="sd-terms">
          {terms.map((term) => {
            const label = termName(term.termId)
            return (
              <li className="sd-term" key={`${term.stageId}/${term.termId}`}>
                <a className="sd-term-link" href={`#/atlas/${term.stageId}/${term.termId}`}>
                  {label}
                </a>
                {term.note ? <p className="sd-term-note">{term.note}</p> : null}
                {term.evidenceUrl ? (
                  <a
                    className="sd-src"
                    href={term.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`在新标签打开「${label}」这条标注的证据页`}
                  >
                    证据 <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/* ---------- ⑥ 为什么收录它 ---------- */
function Reasons({ reasons }) {
  const list = reasons ?? []
  if (list.length === 0) return null
  return (
    <section className="sd-section">
      <h3 className="sd-h">为什么收录它</h3>
      <ol className="sd-reasons">
        {list.map((reason, index) => (
          <li key={reason.evidenceUrl || index}>
            <span className="sd-reason-text">{reason.statement}</span>
            {reason.evidenceUrl ? (
              <a
                className="sd-src"
                href={reason.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`在新标签打开第 ${index + 1} 条收录理由的证据页`}
              >
                证据 <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

function Skeleton() {
  return (
    <div className="sd-skeleton" aria-hidden="true">
      <div className="sd-sk sd-sk-head" />
      <div className="sd-sk sd-sk-line" />
      <div className="sd-sk-row">
        <div className="sd-sk sd-sk-shot" />
        <div className="sd-sk sd-sk-shot" />
        <div className="sd-sk sd-sk-shot" />
      </div>
      <div className="sd-sk sd-sk-line" />
      <div className="sd-sk sd-sk-line" />
    </div>
  )
}

export default function SiteDetail({ entryId, onClose }) {
  const [state, setState] = useState({ status: 'loading', data: null })
  const [attempt, setAttempt] = useState(0)
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const [host] = useState(() =>
    typeof document === 'undefined' ? null : document.createElement('div'),
  )

  const close = useCallback(() => { onClose?.() }, [onClose])
  const onKeyDown = useModalFocus({ open: true, dialogRef, initialFocusRef: closeRef, onClose: close })

  /* Esc 与 Tab 陷阱挂在 document 上：点了浮窗里的正文（非可聚焦元素）之后
     activeElement 会退回 body，此时挂在浮窗节点上的 keydown 收不到事件。 */
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  /* 浮窗挂到 body 末尾；背景整体 inert（不可点、不可 Tab、不进无障碍树），
     同时锁 body 滚动并补上滚动条宽度，避免背景横向跳动。
     必须是 layout effect：它要在 useModalFocus 的 passive effect 之前把浮窗接进文档，
     否则首次聚焦发生在一棵游离的 DOM 树上，焦点会落空。 */
  useLayoutEffect(() => {
    if (!host) return undefined
    document.body.appendChild(host)
    const marked = []
    for (const child of Array.from(document.body.children)) {
      if (child === host || child.hasAttribute('inert')) continue
      child.setAttribute('inert', '')
      marked.push(child)
    }
    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
    return () => {
      for (const child of marked) child.removeAttribute('inert')
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
      host.remove()
    }
  }, [host])

  /* 关闭后归还焦点。useModalFocus 已经把焦点还给打开时的那个元素；
     若那个元素在这期间被卸载或替换（列表重渲染、路由切换），焦点会掉回 body——
     这时按 entryId 反查列表里的同一张卡：先认 [data-entry-id]，再认卡片链接本身
     （跨包契约：卡片是 <a href="#/site/<id>">）。 */
  useEffect(() => () => {
    window.requestAnimationFrame(() => {
      const active = document.activeElement
      if (active && active !== document.body && active !== document.documentElement) return
      const id = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(entryId) : entryId
      const card = document.querySelector(`[data-entry-id="${id}"]`)
        || document.querySelector(`a[href="#/site/${id}"]`)
      card?.focus?.()
    })
  }, [entryId])

  const validId = ENTRY_ID_RE.test(String(entryId ?? ''))

  useEffect(() => {
    if (!validId) return undefined
    const controller = new AbortController()
    setState({ status: 'loading', data: null })
    fetch(`/data/site/${entryId}.json`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) return { status: 'missing', data: null }
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const text = await response.text()
        try {
          const parsed = JSON.parse(text)
          /* 静态托管常把未知路径回落成 index.html（200 + HTML），
             解析失败或 entryId 对不上，都当作「没有这个条目」而不是「读不到」。 */
          if (parsed?.entryId !== entryId) return { status: 'missing', data: null }
          return { status: 'ready', data: parsed }
        } catch {
          return { status: 'missing', data: null }
        }
      })
      .then(setState)
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setState({ status: 'error', data: null })
      })
    return () => controller.abort()
  }, [entryId, attempt, validId])

  const data = state.data
  const titleId = `sd-title-${entryId}`
  const homepage = data?.official?.finalUrl
  const domain = useMemo(() => data?.domain || domainOf(homepage), [data, homepage])
  const name = data?.editorial?.name || entryId
  const checkedAt = isoDate(data?.official?.checkedAt)

  if (!host) return null

  let body = null
  const status = validId ? state.status : 'missing'
  if (status === 'loading') {
    body = (
      <div className="sd-scroll" aria-busy="true">
        <h2 className="sd-name" id={titleId}>正在读取这条记录</h2>
        <Skeleton />
      </div>
    )
  } else if (status === 'missing') {
    body = (
      <div className="sd-scroll">
        <div className="sd-state" role="alert">
          <h2 className="sd-name" id={titleId}>没有这个条目</h2>
          <p>站内没有 <code className="x-mono">{String(entryId)}</code> 这条记录。</p>
          <a className="sd-btn" href="#/sites">回全部站点</a>
        </div>
      </div>
    )
  } else if (status === 'error') {
    body = (
      <div className="sd-scroll">
        <div className="sd-state" role="alert">
          <h2 className="sd-name" id={titleId}>这条记录暂时读不到</h2>
          <p>详情数据没有取回来。可以重试，或先回到列表。</p>
          <div className="sd-state-actions">
            <button type="button" className="sd-btn" onClick={() => setAttempt((n) => n + 1)}>
              重试
            </button>
            <a className="sd-btn-ghost" href="#/sites">回全部站点</a>
          </div>
        </div>
      </div>
    )
  } else {
    body = (
      <div className="sd-scroll">
        {/* ① 第一个元素就是通往源站的大链接 */}
        <a
          className="sd-source"
          href={homepage}
          target="_blank"
          rel="noopener noreferrer"
        >
          <DomainMark url={homepage} name={name} />
          <span className="sd-source-text">
            <h2 className="sd-name" id={titleId}>{name}</h2>
            <span className="sd-domain x-mono">
              {domain} <span aria-hidden="true">↗</span>
            </span>
          </span>
        </a>
        {checkedAt ? (
          <p className="sd-checked">
            <span className="sd-checked-dot" aria-hidden="true" />
            我们在 {checkedAt} 进去看过
          </p>
        ) : null}

        {/* ② 一句编辑判断 */}
        <section className="sd-section">
          {data.editorial?.takeawayZh ? (
            <p className="sd-takeaway">{data.editorial.takeawayZh}</p>
          ) : (
            <p className="sd-takeaway sd-unknown">编辑判断：未写</p>
          )}
          {data.editorial?.descriptionZh ? (
            <p className="sd-desc">{data.editorial.descriptionZh}</p>
          ) : null}
        </section>

        {/* ③ 三张证据图 */}
        <section className="sd-section">
          <h3 className="sd-h">最值得先看的三个位置</h3>
          <EvidenceTrio pages={data.pages} name={name} homepage={homepage} />
        </section>

        {/* ④ ⑤ ⑥ */}
        <RightsBlock data={data} />
        <AtlasTerms curation={data.curation} />
        <Reasons reasons={data.classification?.reasons} />

        {/* ⑦ 档案：标签与字段只活在这里 */}
        <ArchiveDisclosure data={data} />
      </div>
    )
  }

  return createPortal(
    <div
      className="sd-layer"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}
    >
      <div
        className="sd-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        {/* 顶栏是实底的：内容滚动时从它下面走过，不会被关闭键压住 */}
        <div className="sd-bar">
          <span className="sd-grab" aria-hidden="true" />
          <button type="button" className="sd-close" onClick={close} ref={closeRef} aria-label="关闭详情">
            <CloseIcon />
          </button>
        </div>
        {body}
        {status === 'ready' && homepage ? (
          <div className="sd-foot">
            <a className="sd-visit" href={homepage} target="_blank" rel="noopener noreferrer">
              访问源站 <span aria-hidden="true">↗</span>
            </a>
          </div>
        ) : null}
      </div>
    </div>,
    host,
  )
}
