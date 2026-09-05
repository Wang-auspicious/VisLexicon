const TEXT_FIELDS = ['id', 'name', 'site', 'scale', 'pricing', 'category']
const LIST_FIELDS = ['stacks', 'themes', 'keywords']

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
}

function parsedUrl(value) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

function isHttpsUrl(url) {
  return url?.protocol === 'https:'
}

function normalizeHostname(hostname) {
  return hostname.toLocaleLowerCase().replace(/^www\./, '')
}

function belongsToOfficialHostname(sourceUrl, siteUrl) {
  const sourceHostname = normalizeHostname(sourceUrl.hostname)
  const siteHostname = normalizeHostname(siteUrl.hostname)

  return (
    sourceHostname === siteHostname ||
    sourceHostname.endsWith(`.${siteHostname}`) ||
    siteHostname.endsWith(`.${sourceHostname}`)
  )
}

function isCanonicalShotPath(src, siteId) {
  if (!isNonEmptyText(src) || !isNonEmptyText(siteId)) return false

  const prefix = `/shots/${siteId}/`
  if (!src.startsWith(prefix)) return false

  const filename = src.slice(prefix.length)
  return (
    filename.length > 0 &&
    !filename.includes('/') &&
    !filename.includes('\\') &&
    !filename.includes('..') &&
    !/[\s%?#]/.test(filename) &&
    /\.(?:png|webp)$/i.test(filename)
  )
}

export function validateCuratedSites(sites) {
  if (!Array.isArray(sites)) return ['curated sites must be an array']

  const errors = []
  const seenIds = new Set()

  sites.forEach((site, siteIndex) => {
    const label = isNonEmptyText(site?.id) ? site.id : `site[${siteIndex}]`

    if (!site || typeof site !== 'object') {
      errors.push(`${label}: entry must be an object`)
      return
    }

    TEXT_FIELDS.forEach((field) => {
      if (!isNonEmptyText(site[field])) errors.push(`${label}: ${field} must be non-empty`)
    })

    LIST_FIELDS.forEach((field) => {
      if (
        !Array.isArray(site[field]) ||
        site[field].length === 0 ||
        site[field].some((value) => !isNonEmptyText(value))
      ) {
        errors.push(`${label}: ${field} must contain non-empty values`)
      }
    })

    if (isNonEmptyText(site.id)) {
      if (seenIds.has(site.id)) errors.push(`${label}: duplicate id`)
      seenIds.add(site.id)
    }

    const siteUrl = parsedUrl(site.site)
    if (!isHttpsUrl(siteUrl)) errors.push(`${label}: site must be a valid HTTPS URL`)

    if (!Array.isArray(site.shots) || site.shots.length !== 3) {
      errors.push(`${label}: shots must contain exactly three screenshots`)
      return
    }

    const shotPaths = new Set()
    site.shots.forEach((shot, shotIndex) => {
      const shotLabel = `${label}.shots[${shotIndex}]`

      if (!shot || typeof shot !== 'object') {
        errors.push(`${shotLabel}: screenshot must be an object`)
        return
      }

      if (!isNonEmptyText(shot.src)) {
        errors.push(`${shotLabel}: src must be non-empty`)
      } else {
        if (!isCanonicalShotPath(shot.src, site.id)) {
          errors.push(
            `${shotLabel}: src must use canonical /shots/${site.id}/<file> path`,
          )
        }
        if (shotPaths.has(shot.src)) errors.push(`${shotLabel}: screenshot paths must be unique`)
        shotPaths.add(shot.src)
      }

      if (!isNonEmptyText(shot.alt)) errors.push(`${shotLabel}: alt must be non-empty`)

      const sourceUrl = parsedUrl(shot.sourceUrl)
      if (!isHttpsUrl(sourceUrl)) {
        errors.push(`${shotLabel}: sourceUrl must be a valid HTTPS URL`)
      } else if (siteUrl && !belongsToOfficialHostname(sourceUrl, siteUrl)) {
        errors.push(`${shotLabel}: sourceUrl hostname must match the official site hostname`)
      }
    })
  })

  return errors
}

export function filterCuratedSites(sites, filters = {}) {
  const category = normalize(filters.category)
  const stack = normalize(filters.stack)
  const queryTerms = normalize(filters.query).split(/\s+/).filter(Boolean)

  return sites.filter((site) => {
    if (category && category !== 'all' && normalize(site.category) !== category) return false
    if (stack && stack !== 'all' && !site.stacks.some((value) => normalize(value) === stack)) {
      return false
    }

    if (queryTerms.length === 0) return true

    const haystack = normalize(
      [
        site.name,
        site.site,
        site.scale,
        site.pricing,
        site.category,
        ...site.stacks,
        ...site.themes,
        ...site.keywords,
      ].join(' '),
    )

    return queryTerms.every((term) => haystack.includes(term))
  })
}

export function curationFacets(sites) {
  const collator = new Intl.Collator('zh-CN', { sensitivity: 'base' })
  const categories = [...new Set(sites.map(({ category }) => category).filter(isNonEmptyText))]
  const stacks = [
    ...new Set(sites.flatMap(({ stacks: values }) => values ?? []).filter(isNonEmptyText)),
  ]

  return {
    categories: categories.sort(collator.compare),
    stacks: stacks.sort(collator.compare),
  }
}
