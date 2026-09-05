import { useState } from 'react'
import { flushSync } from 'react-dom'
import DomainMark from './DomainMark.jsx'
import { useT } from '../i18n.js'

/**
 * 三张页面预览：左侧主图 + 右侧上下两张。
 * 点右侧图时，该图与主图互换位置（View Transition / 即时切换）。
 * 简介只写在主图下方，用页面 title，不用导览句。
 */

function altFor(page, name) {
  if (page?.shot?.alt) return page.shot.alt
  return `${name} 页面预览`
}

function captionFor(page) {
  const title = typeof page?.title === 'string' ? page.title.trim() : ''
  return title || null
}

function ShotFrame({ page, name, homepage, featured }) {
  const shot = page?.shot
  const transitionName = page?.role ? `vl-shot-${page.role}` : undefined
  return (
    <div className={featured ? 'sd-ev-frame sd-ev-frame-hero' : 'sd-ev-frame'}>
      {shot?.src ? (
        <img
          src={shot.src}
          alt={altFor(page, name)}
          width={shot.width || undefined}
          height={shot.height || undefined}
          loading={featured ? 'eager' : 'lazy'}
          decoding="async"
          style={transitionName ? { viewTransitionName: transitionName } : undefined}
        />
      ) : (
        <div className="sd-ev-empty">
          <DomainMark url={page?.sourceUrl || homepage} name={name} />
          <span>该页面暂无法直接预览</span>
        </div>
      )}
    </div>
  )
}

export default function EvidenceTrio({ pages, name, homepage }) {
  const t = useT()
  const list = (pages ?? []).filter(Boolean)
  const [heroIndex, setHeroIndex] = useState(0)

  if (list.length === 0) {
    return <p className="sd-empty-note">{t('noPreview')}</p>
  }

  const safeHero = Math.min(heroIndex, list.length - 1)
  const hero = list[safeHero]
  const rest = list.filter((_, index) => index !== safeHero)
  const caption = captionFor(hero)

  const promote = (absoluteIndex) => {
    if (absoluteIndex === safeHero) return
    const reduce = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = typeof document !== 'undefined' ? document.startViewTransition : null
    if (reduce || typeof start !== 'function') {
      setHeroIndex(absoluteIndex)
      return
    }
    start.call(document, () => {
      flushSync(() => setHeroIndex(absoluteIndex))
    })
  }

  return (
    <div className="sd-ev-block">
      <div className="sd-ev-stage">
        <div className="sd-ev-hero">
          <ShotFrame page={hero} name={name} homepage={homepage} featured />
        </div>
        {rest.length > 0 ? (
          <div className="sd-ev-thumbs">
            {rest.map((page) => {
              const absoluteIndex = list.indexOf(page)
              const label = captionFor(page) || altFor(page, name)
              return (
                <button
                  type="button"
                  className="sd-ev-thumb"
                  key={page.sourceUrl || page.role || absoluteIndex}
                  onClick={() => promote(absoluteIndex)}
                  aria-label={`将「${label}」放到主预览`}
                >
                  <ShotFrame page={page} name={name} homepage={homepage} featured={false} />
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
      {caption ? <p className="sd-ev-cap">{caption}</p> : null}
    </div>
  )
}
