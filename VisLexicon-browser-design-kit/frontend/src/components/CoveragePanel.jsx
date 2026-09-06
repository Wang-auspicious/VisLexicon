import { entryVoice } from '../lib/entry-voice.js'
import { useLocale, useT } from '../i18n.js'

export default function CoveragePanel({ data }) {
  const t = useT()
  const locale = useLocale()
  const acquire = entryVoice(data.entryId)?.acquire?.[locale] || []

  if (acquire.length === 0) return null

  return (
    <section className="sd-cover">
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
    </section>
  )
}
