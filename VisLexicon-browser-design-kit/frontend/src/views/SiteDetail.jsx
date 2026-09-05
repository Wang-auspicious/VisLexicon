import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import DomainMark from '../components/DomainMark.jsx'
import EvidenceTrio from '../components/EvidenceTrio.jsx'
import DossierHead from '../components/DossierHead.jsx'
import CoveragePanel from '../components/CoveragePanel.jsx'
import { useModalFocus } from '../lib/use-modal-focus.js'
import { useT } from '../i18n.js'

/**
 * 站点详情：`#/site/<entryId>` 的路由页。
 * 桌面浮窗、手机底部抽屉，由 CSS 在 768px 处切换。
 * 阅读顺序：身份 → 简介/切面 → 三图 → 目录与拿走方式。
 */

const ENTRY_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

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
  const t = useT()
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

  if (!host) return null

  let body = null
  const status = validId ? state.status : 'missing'
  if (status === 'loading') {
    body = (
      <div className="sd-scroll" aria-busy="true">
        <h2 className="sd-name" id={titleId}>{t('reading')}</h2>
        <Skeleton />
      </div>
    )
  } else if (status === 'missing') {
    body = (
      <div className="sd-scroll">
        <div className="sd-state" role="alert">
          <h2 className="sd-name" id={titleId}>{t('missingTitle')}</h2>
          <p>{t('missingBody')} <code className="x-mono">{String(entryId)}</code></p>
          <a className="sd-btn" href="#/sites">{t('backSites')}</a>
        </div>
      </div>
    )
  } else if (status === 'error') {
    body = (
      <div className="sd-scroll">
        <div className="sd-state" role="alert">
          <h2 className="sd-name" id={titleId}>{t('errorTitle')}</h2>
          <p>{t('errorBody')}</p>
          <div className="sd-state-actions">
            <button type="button" className="sd-btn" onClick={() => setAttempt((n) => n + 1)}>
              {t('retry')}
            </button>
            <a className="sd-btn-ghost" href="#/sites">{t('backSites')}</a>
          </div>
        </div>
      </div>
    )
  } else {
    body = (
      <div className="sd-scroll">
        <a
          className="sd-source"
          href={homepage}
          target="_blank"
          rel="noopener noreferrer"
        >
          <DomainMark url={homepage} name={name} variant="favicon" />
          <span className="sd-source-text">
            <h2 className="sd-name" id={titleId}>{name}</h2>
            <span className="sd-domain x-mono">
              {domain} <span aria-hidden="true">↗</span>
            </span>
          </span>
        </a>

        <DossierHead data={data} />

        <section className="sd-section">
          <EvidenceTrio pages={data.pages} name={name} homepage={homepage} />
        </section>

        <CoveragePanel data={data} />
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
        <span className="sd-orb sd-orb-a" aria-hidden="true" />
        <span className="sd-orb sd-orb-b" aria-hidden="true" />
        <span className="sd-orb sd-orb-c" aria-hidden="true" />
        <div className="sd-bar">
          <span className="sd-grab" aria-hidden="true" />
          <button type="button" className="sd-close" onClick={close} ref={closeRef} aria-label={t('close')}>
            <CloseIcon />
          </button>
        </div>
        {body}
        {status === 'ready' && homepage ? (
          <div className="sd-foot">
            <a className="sd-visit" href={homepage} target="_blank" rel="noopener noreferrer">
              {t('visit')} <span aria-hidden="true">↗</span>
            </a>
          </div>
        ) : null}
      </div>
    </div>,
    host,
  )
}
