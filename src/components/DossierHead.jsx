import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { facetLabel, isUnknown } from '../lib/site-detail-labels.js'
import { useLocale, useT } from '../i18n.js'
import { entryVoice, voiceText } from '../lib/entry-voice.js'
import { catalogNames } from '../lib/component-catalog.js'

function factOf(facts, field) {
  return (facts ?? []).find((fact) => fact.field === field) || null
}

function displayValue(value) {
  if (!value || isUnknown(value)) return null
  return value
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function stylePillsOf(entryId, locale) {
  const listed = entryVoice(entryId)?.stylePills?.[locale]
  if (Array.isArray(listed) && listed.length > 0) return listed
  const text = voiceText(entryId, 'style', locale)
  if (!text) return []
  return text.split(/[。.]/).map((part) => part.trim()).filter(Boolean)
}

function Pill({ tone, children }) {
  return <span className={`sd-pill sd-pill-${tone}`}>{children}</span>
}

/* 每行 tag 严格单行展示；超出容器宽度的项目在行末收进 `+N`，避免折入第二行。 */
function MetaGroup({ label, tone, items, empty }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const measureRef = useRef(null)
  const popoverRef = useRef(null)
  const buttonRef = useRef(null)

  const source = useMemo(
    () => (items.length > 0 ? items : (empty ? [empty] : [])),
    [items, empty],
  )
  const [visibleCount, setVisibleCount] = useState(source.length)

  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return undefined

    const compute = () => {
      const containerWidth = container.clientWidth
      if (containerWidth <= 0) return

      const pillEls = Array.from(measure.children)
      const plusEl = pillEls[pillEls.length - 1]
      const itemEls = pillEls.slice(0, pillEls.length - 1)
      if (itemEls.length === 0) return

      const gap = 8
      const widths = itemEls.map((el) => el.offsetWidth)
      const totalWidth = widths.reduce((sum, w) => sum + w, 0) + (widths.length - 1) * gap

      if (totalWidth <= containerWidth) {
        setVisibleCount(itemEls.length)
        return
      }

      const plusWidth = plusEl ? plusEl.offsetWidth : 48
      let currentWidth = 0
      let count = 0

      for (let i = 0; i < widths.length; i++) {
        const nextWidth = count === 0 ? widths[i] : currentWidth + gap + widths[i]
        if (i < widths.length - 1) {
          if (nextWidth + gap + plusWidth <= containerWidth) {
            currentWidth = nextWidth
            count++
          } else {
            break
          }
        } else {
          if (nextWidth <= containerWidth) {
            count++
          }
          break
        }
      }
      setVisibleCount(Math.max(1, count))
    }

    compute()

    let ro = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(compute)
      ro.observe(container)
    }
    return () => ro?.disconnect()
  }, [source, tone])

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (source.length === 0) return null

  const capped = source.length > visibleCount
  const shown = capped ? source.slice(0, visibleCount) : source
  const overflow = capped ? source.length - visibleCount : 0
  const overflowItems = capped ? source.slice(visibleCount) : []

  return (
    <div className="sd-meta-group">
      <span className="sd-meta-k">{label}</span>
      <div className="sd-pills" ref={containerRef}>
        {shown.map((item) => (
          <Pill key={item} tone={tone}>{item}</Pill>
        ))}
        {capped ? (
          <button
            ref={buttonRef}
            type="button"
            className={`sd-more sd-pill sd-pill-${tone}`}
            aria-expanded={open}
            title={overflowItems.join(', ')}
            onClick={() => setOpen((v) => !v)}
          >
            +{overflow}
          </button>
        ) : null}
      </div>

      <div ref={measureRef} className="sd-pills-measure" aria-hidden="true">
        {source.map((item) => (
          <Pill key={item} tone={tone}>{item}</Pill>
        ))}
        <span className={`sd-pill sd-pill-${tone}`}>+{source.length}</span>
      </div>

      {open && capped && (
        <div className="sd-pills-popover" role="dialog" aria-label={label} ref={popoverRef}>
          <div className="sd-pills-popover-head">
            <span className="sd-pills-popover-title">
              {label.replace(/[：:]$/, '')}（{source.length}）
            </span>
            <button
              type="button"
              className="sd-pills-popover-close"
              onClick={() => setOpen(false)}
              aria-label={t('close') || '关闭'}
            >
              ×
            </button>
          </div>
          <div className="sd-pills-popover-body">
            {source.map((item) => (
              <Pill key={item} tone={tone}>{item}</Pill>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DossierHead({ data }) {
  const t = useT()
  const locale = useLocale()
  const facets = data.facets || {}
  const facts = data.facts ?? []
  const voice = entryVoice(data.entryId)
  const summary = voiceText(data.entryId, 'summary', locale)
    || (locale === 'zh' ? data.editorial?.descriptionZh : null)
    || voiceText(data.entryId, 'lede', locale)

  const techOverride = voice?.tech?.[locale]
  const tech = unique(
    Array.isArray(techOverride) && techOverride.length > 0
      ? techOverride
      : [
          ...(facets.technologies ?? []).map((value) => facetLabel('technologies', value, locale)),
          (facets.platforms ?? []).includes('figma') ? 'Figma' : null,
        ],
  )

  const license = displayValue(factOf(facts, 'license')?.value)
    || displayValue((facets.licenses ?? [])[0])
  const access = facets.access ?? []
  const media = facets.media ?? []
  const accessPills = access.map((value) => facetLabel('access', value, locale)).filter(Boolean)
  const mediaPills = media.map((value) => {
    if (value === 'ui') return locale === 'zh' ? '网页界面' : 'Web UI'
    if (value === 'motion') return locale === 'zh' ? '动效' : 'Motion'
    return facetLabel('media', value, locale)
  }).filter(Boolean)
  const licenseMedia = unique([
    license,
    ...accessPills,
    ...mediaPills,
  ])

  const catalog = catalogNames(data.entryId, locale)
  const styles = stylePillsOf(data.entryId, locale)
  const colon = locale === 'zh' ? '：' : ':'
  const empty = t('unspecified')

  return (
    <section className="sd-dossier">
      {summary ? <p className="sd-lede">{summary}</p> : null}
      <div className="sd-headrow">
        <MetaGroup label={`${t('technologies')}${colon}`} tone="tech" items={tech} empty={empty} />
        <MetaGroup label={`${t('licenseMedia')}${colon}`} tone="meta" items={licenseMedia} empty={empty} />
        <MetaGroup
          label={`${t('catalog')}${colon}`}
          tone="comp"
          items={catalog}
          empty={null}
        />
        <MetaGroup label={`${t('style')}${colon}`} tone="style" items={styles} empty={empty} />
      </div>
    </section>
  )
}
