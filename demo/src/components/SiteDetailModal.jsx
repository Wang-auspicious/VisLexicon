import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { siteUrl } from '../lib/site-catalog-browser.js'

/* 悬浮详情小窗：点击站点卡片后浮于当前页面之上，展示作者 / GitHub / 三行介绍等。 */
function DomainMark({ url }) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    const initial = host.charAt(0).toUpperCase()
    return (
      <span className="site-modal-domain-mark" aria-hidden="true">
        {initial}
      </span>
    )
  } catch {
    return null
  }
}

function ShotTrio({ shots, name, compact }) {
  const usable = (shots ?? []).filter((shot) => shot?.src)
  if (usable.length === 0) {
    return (
      <div className={`site-modal-trio site-modal-trio-empty ${compact ? 'is-compact' : ''}`}>
        <span>该站点暂无法直接预览（可能位于 GitHub 托管或存在访问限制）</span>
      </div>
    )
  }
  return (
    <div className={`site-modal-trio ${compact ? 'is-compact' : ''}`}>
      <div className="site-modal-trio-main">
        <img src={usable[0].src} alt={usable[0].alt || name} loading="lazy" decoding="async" />
      </div>
      <div className="site-modal-trio-subs">
        {usable.slice(1, 3).map((shot) => (
          <div className="site-modal-trio-sub" key={shot.src}>
            <img src={shot.src} alt={shot.alt || name} loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SiteDetailModal({ site, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const previous = document.activeElement
    dialogRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [onClose])

  if (!site) return null

  const url = siteUrl(site)
  const domain = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return ''
    }
  })()
  const description = site.descriptionZh || site.about || site.description || ''
  const liveDescription = site.liveDescription || ''
  const github = site.github || site.repo
  const author = site.author?.author || site.authorName || ''
  const tags = site.tags ?? []
  const pricing = site.pricing?.model || site.pricing
  const pricingLabel = {
    free: '免费',
    freemium: '免费增值',
    trial: '可试用',
    paid: '付费',
    beta: '测试中',
    unknown: '价格待核验',
  }[pricing] || (typeof pricing === 'string' ? pricing : '')

  return createPortal(
    <div className="site-modal-layer" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <div
        className="site-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${site.name} 详情`}
        ref={dialogRef}
        tabIndex={-1}
      >
        <button type="button" className="site-modal-close" onClick={onClose} aria-label="关闭详情">
          <span aria-hidden="true">✕</span>
        </button>

        <div className="site-modal-head">
          <DomainMark url={url} />
          <div className="site-modal-title-wrap">
            <h2>{site.name}</h2>
            <a
              className="site-modal-domain"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              {domain}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <ShotTrio shots={site.shots} name={site.name} />

        <div className="site-modal-body">
          {description ? <p className="site-modal-desc">{description}</p> : null}

          {liveDescription && liveDescription !== description ? (
            <p className="site-modal-live">
              <strong>站方自述</strong> {liveDescription}
            </p>
          ) : null}

          <dl className="site-modal-meta">
            {author ? (
              <div className="site-modal-meta-item">
                <dt>作者</dt>
                <dd>{author}</dd>
              </div>
            ) : null}
            {github ? (
              <div className="site-modal-meta-item">
                <dt>源码</dt>
                <dd>
                  <a href={typeof github === 'string' && /^https?:\/\//.test(github) ? github : `https://github.com/${github}`} target="_blank" rel="noopener noreferrer">
                    {typeof github === 'string' && /^https?:\/\//.test(github)
                      ? github.replace(/^https?:\/\/(www\.)?/, '')
                      : github}
                    <span aria-hidden="true">↗</span>
                  </a>
                </dd>
              </div>
            ) : null}
            {pricingLabel ? (
              <div className="site-modal-meta-item">
                <dt>定价</dt>
                <dd>{pricingLabel}</dd>
              </div>
            ) : null}
          </dl>

          {tags.length > 0 ? (
            <div className="site-modal-tags">
              {tags.map((tag) => (
                <span key={tag} className="site-modal-tag">{tag}</span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="site-modal-foot">
          <a className="site-modal-visit" href={url} target="_blank" rel="noopener noreferrer">
            访问源站 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>,
    document.body)
}
