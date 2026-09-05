import { facetLabel, isUnknown } from '../lib/site-detail-labels.js'
import { useLocale, useT } from '../i18n.js'
import { voiceText } from '../lib/entry-voice.js'

const SKIP_AXES = new Set(['languages', 'licenses', 'access', 'workflowStages', 'audiences', 'actions'])

function factOf(facts, field) {
  return (facts ?? []).find((fact) => fact.field === field) || null
}

function displayValue(value) {
  if (!value || isUnknown(value)) return null
  return value
}

function hostPath(url) {
  try {
    const parsed = new URL(url)
    return `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname}`.replace(/\/$/, '')
  } catch {
    return url
  }
}

function Tag({ axis, label, value, href }) {
  if (!value) return null
  const inner = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {value} <span aria-hidden="true">↗</span>
    </a>
  ) : value
  return (
    <span className={`sd-ktag sd-ktag-${axis}`}>
      <span className="sd-ktag-k">{label}</span>
      <span className="sd-ktag-v">{inner}</span>
    </span>
  )
}

export default function DossierHead({ data }) {
  const t = useT()
  const locale = useLocale()
  const facets = data.facets || {}
  const facts = data.facts ?? []
  const lede = voiceText(data.entryId, 'lede', locale)
    || (locale === 'zh' ? data.editorial?.descriptionZh : null)

  const license = displayValue(factOf(facts, 'license')?.value) || displayValue((facets.licenses ?? [])[0])
  const access = (facets.access ?? []).map((value) => facetLabel('access', value)).filter(Boolean)
  const author = factOf(facts, 'author')
  const org = factOf(facts, 'organization')
  const repo = factOf(facts, 'repository')
  const pkg = factOf(facts, 'package')

  const left = [
    license ? { axis: 'license', label: t('license'), value: license } : null,
    ...access.map((value) => ({ axis: 'access', label: t('access'), value })),
    author && displayValue(author.value) ? {
      axis: 'author',
      label: t('author'),
      value: displayValue(author.value),
    } : null,
    org && displayValue(org.value) ? {
      axis: 'organization',
      label: t('organization'),
      value: displayValue(org.value),
    } : null,
    repo && displayValue(repo.value) ? {
      axis: 'repository',
      label: t('repository'),
      value: hostPath(repo.value),
      href: /^https?:\/\//i.test(repo.value) ? repo.value : null,
    } : null,
    pkg && displayValue(pkg.value) ? {
      axis: 'package',
      label: t('package'),
      value: displayValue(pkg.value),
    } : null,
  ].filter(Boolean)

  const rightAxes = ['deliverables', 'technologies', 'platforms', 'scenarios', 'contentOrganization', 'media']
    .filter((axis) => {
      const values = facets[axis]
      if (!Array.isArray(values) || values.length === 0) return false
      if (SKIP_AXES.has(axis)) return false
      if (axis === 'media' && values.length === 1 && values[0] === 'ui') return false
      return true
    })

  const right = rightAxes.flatMap((axis) => (
    facets[axis].map((value) => ({
      axis,
      label: t(axis),
      value: facetLabel(axis, value),
    }))
  ))

  return (
    <section className="sd-dossier">
      {lede ? <p className="sd-lede">{lede}</p> : null}
      <div className="sd-headgrid">
        <div className="sd-facet-row">
          {left.map((item) => (
            <Tag key={`${item.axis}-${item.value}`} {...item} />
          ))}
        </div>
        <div className="sd-facet-row">
          {right.map((item) => (
            <Tag key={`${item.axis}-${item.value}`} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
