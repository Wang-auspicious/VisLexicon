import { useEffect, useState } from 'react'
import { facetLabel, isUnknown } from '../lib/site-detail-labels.js'
import { useLocale, useT } from '../i18n.js'
import { entryVoice, voiceText } from '../lib/entry-voice.js'
import { coverageSourceOf, fetchLiveCoverage } from '../lib/live-coverage.js'

const PREVIEW = 16

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

function MetaGroup({ area, label, tone, items, extra }) {
  return (
    <div className={`sd-meta-group sd-meta-${area}`}>
      <span className="sd-meta-k">{label}</span>
      <div className="sd-pills">
        {items.map((item) => (
          <Pill key={item} tone={tone}>{item}</Pill>
        ))}
        {extra}
      </div>
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

  const [liveNames, setLiveNames] = useState(null)
  const [open, setOpen] = useState(false)
  const canLive = Boolean(coverageSourceOf(data.entryId))

  useEffect(() => {
    if (!canLive) return undefined
    const controller = new AbortController()
    fetchLiveCoverage(data.entryId, { signal: controller.signal })
      .then((result) => { if (result?.names) setLiveNames(result.names) })
      .catch(() => {})
    return () => controller.abort()
  }, [data.entryId, canLive])

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
  const accessPills = access.includes('free') && access.includes('open-source')
    ? [locale === 'zh' ? '开源免费' : 'Free, open source']
    : access.map((value) => facetLabel('access', value, locale)).filter(Boolean)
  const mediaPills = media.map((value) => {
    if (value === 'ui') return locale === 'zh' ? '网页界面' : 'Web UI'
    if (value === 'motion') return locale === 'zh' ? '动效代码' : 'Motion code'
    return facetLabel('media', value, locale)
  }).filter(Boolean)
  const licenseMedia = unique([
    license,
    ...accessPills,
    ...mediaPills,
  ])

  const catalogOverride = voice?.components?.[locale]
  const catalog = Array.isArray(catalogOverride) && catalogOverride.length > 0
    ? catalogOverride
    : (liveNames || [])
  const shownCatalog = open ? catalog : catalog.slice(0, PREVIEW)
  const overflow = catalog.length > PREVIEW
  const catalogExtra = overflow ? (
    <button
      type="button"
      className="sd-more sd-pill sd-pill-comp"
      aria-expanded={open}
      onClick={() => setOpen((value) => !value)}
    >
      {open ? t('collapse') : '···'}
    </button>
  ) : null

  const styles = stylePillsOf(data.entryId, locale)
  const colon = locale === 'zh' ? '：' : ':'

  return (
    <section className="sd-dossier">
      {summary ? <p className="sd-lede">{summary}</p> : null}
      <div className="sd-headgrid">
        <MetaGroup area="tech" label={`${t('technologies')}${colon}`} tone="tech" items={tech} />
        <MetaGroup
          area="catalog"
          label={`${t('catalog')}${colon}`}
          tone="comp"
          items={shownCatalog}
          extra={catalogExtra}
        />
        <MetaGroup area="license" label={`${t('licenseMedia')}${colon}`} tone="meta" items={licenseMedia} />
        <MetaGroup area="style" label={`${t('style')}${colon}`} tone="style" items={styles} />
      </div>
    </section>
  )
}
