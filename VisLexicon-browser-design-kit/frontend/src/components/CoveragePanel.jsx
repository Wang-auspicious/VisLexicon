import { useEffect, useState } from 'react'
import { coverageSourceOf, fetchLiveCoverage } from '../lib/live-coverage.js'
import { entryVoice, voiceText } from '../lib/entry-voice.js'
import { useLocale, useT } from '../i18n.js'

const PREVIEW = 16

function fallbackNames(data) {
  return [...new Set((data.curation?.atlasTerms ?? [])
    .map((term) => term.termEn || term.termZh)
    .filter(Boolean))]
}

export default function CoveragePanel({ data }) {
  const t = useT()
  const locale = useLocale()
  const [live, setLive] = useState(null)
  const canLive = Boolean(coverageSourceOf(data.entryId))
  const [ready, setReady] = useState(!canLive)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!canLive) return undefined
    const controller = new AbortController()
    fetchLiveCoverage(data.entryId, { signal: controller.signal })
      .then((result) => { if (result) setLive(result) })
      .catch(() => {})
      .finally(() => setReady(true))
    return () => controller.abort()
  }, [data.entryId, canLive])

  const names = live?.names || (ready ? fallbackNames(data) : [])
  const shown = open ? names : names.slice(0, PREVIEW)
  const overflow = names.length > PREVIEW
  const acquire = entryVoice(data.entryId)?.acquire?.[locale] || []
  const style = voiceText(data.entryId, 'style', locale)

  if (!ready && !style && acquire.length === 0) return null
  if (names.length === 0 && acquire.length === 0 && !style) return null

  return (
    <section className="sd-cover">
      {names.length > 0 ? (
        <div className="sd-cover-block">
          <h3 className="sd-cover-h">
            {t('catalog')}
            <span className="sd-cover-n">{names.length}</span>
          </h3>
          <p className="sd-cover-names">
            {shown.map((name) => (
              <span className="sd-tag" key={name}>{name}</span>
            ))}
            {overflow ? (
              <button
                type="button"
                className="sd-more"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
              >
                {open ? t('collapse') : '···'}
              </button>
            ) : null}
          </p>
        </div>
      ) : null}

      {acquire.length > 0 ? (
        <div className="sd-cover-block">
          <h3 className="sd-cover-h">{t('acquire')}</h3>
          <ul className="sd-acquire">
            {acquire.map((row) => (
              <li key={row.k}>
                <span className="sd-acquire-k">{row.k}</span>
                <span className="sd-acquire-v">{row.v}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {style ? (
        <div className="sd-cover-block">
          <h3 className="sd-cover-h">{t('style')}</h3>
          <p className="sd-cover-p">{style}</p>
        </div>
      ) : null}
    </section>
  )
}
