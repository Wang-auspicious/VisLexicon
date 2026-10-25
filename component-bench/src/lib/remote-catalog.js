import { CATEGORIES } from '../catalog.js'

const categoryIds = new Set(CATEGORIES.map(c => c.id))
const text = (value, lang = 'zh') => typeof value === 'string' ? value : value?.[lang] ?? value?.en ?? value?.zh ?? ''
const safeUrl = value => typeof value === 'string' && (/^https?:\/\//.test(value) || /^\/(?!\/)/.test(value)) ? value : null

export function categoryFor(item) {
  if (categoryIds.has(item.category)) return item.category
  const name = `${item.name ?? ''} ${item.type ?? ''}`.toLowerCase()
  if (/registry:(block|page)|hero|pricing|testimonial|landing/.test(name)) return 'section'
  if (/button/.test(name)) return 'button'
  if (/input|form|select|switch|checkbox|radio|slider|calendar|date|combobox/.test(name)) return 'input'
  if (/nav|menu|dock|breadcrumb|tabs|pagination|sidebar/.test(name)) return 'nav'
  if (/spinner|loader|loading|toast|alert|progress|skeleton/.test(name)) return 'feedback'
  if (/chart|table|stat|number|counter|ticker|badge|avatar/.test(name)) return 'data'
  if (/background|border|beam|grid|gradient|particle/.test(name)) return 'surface'
  if (/layout|panel|resize|masonry|split|flex/.test(name)) return 'layout'
  return 'content'
}

export function normalizeRemoteEntry(item, index = 0) {
  const preview = item.preview ?? {}
  const verified = preview.status === 'verified'
  const controls = verified ? (preview.controls ?? item.controls ?? []) : []
  const lane = ['registry', 'github', 'npm', 'screenshot'].includes(item.lane) ? item.lane : item.registryUrl ? 'registry' : 'github'
  const title = item.title ?? item.name ?? item.id
  const sourceUrl = safeUrl(item.sourceUrl ?? item.source?.page)
  const sourceName = item.sourceName ?? item.source?.site ?? item.sourceId ?? ''
  const license = item.license && typeof item.license === 'object' ? item.license : { spdx: item.license ?? null }
  const zh = text(item.nameZh ?? title, 'zh')
  const en = text(item.nameEn ?? title, 'en')
  const frames = item.frames ?? item.shot?.frames ?? []
  const poster = safeUrl(preview.posterUrl ?? item.poster ?? item.posterUrl ?? (lane === 'screenshot' ? item.previewUrl : null) ?? frames[0]?.src)
  const sourceAvailable = item.sourceAvailable ?? (item.status === 'source-ready' || Boolean(item.files?.length || item.fileCount || item.filesCount))
  return {
    ...item, id: String(item.id), index, remote: true, lane, sourceAvailable,
    category: categoryFor(item), zh, en,
    summaryZh: text(item.description ?? item.summaryZh, 'zh'),
    summaryEn: text(item.description ?? item.summaryEn, 'en'),
    tags: [...new Set([...(item.tags ?? []), item.framework, item.type, sourceName].filter(Boolean))],
    poster, previewUrl: verified ? safeUrl(preview.url ?? item.previewUrl) : null,
    preview, controls: controls.map(c => ({ ...c, kind: c.kind ?? ({ select: 'segmented', boolean: 'toggle', number: 'number' }[c.control] ?? c.control ?? 'text'), labelZh: c.labelZh ?? c.key, labelEn: c.labelEn ?? c.key })),
    licenseRecord: license, frames,
    source: { ...item.source, site: sourceName, page: sourceUrl, home: sourceUrl, license: license.spdx ?? null, licenseUrl: safeUrl(license.url), install: item.install ?? (item.registryUrl ? `npx shadcn@latest add "${item.registryUrl}"` : '') },
    detailUrl: safeUrl(item.detailUrl) ?? `/data/component-code/items/${encodeURIComponent(item.id)}.json`,
  }
}

export function availabilityOf(entry) {
  if (entry.lane === 'screenshot') return 'screenshot'
  if (!entry.remote || entry.previewUrl) return 'live'
  return entry.sourceAvailable ? 'source' : 'reference'
}

export function mergeCatalog(seed, payload) {
  const rows = Array.isArray(payload) ? payload : payload.items ?? payload.entries ?? []
  const seen = new Set(seed.map(e => e.id))
  return [...seed, ...rows.filter(e => e && e.id != null && !seen.has(String(e.id)) && seen.add(String(e.id))).map((e, i) => normalizeRemoteEntry(e, seed.length + i))]
}

export async function readCatalog(signal) {
  const response = await fetch('/data/component-code/index.json', { signal })
  if (!response.ok) throw new Error(`CATALOG_HTTP_${response.status}`)
  return response.json()
}

/** Fetch metadata in small batches so a large corpus never blocks first paint. */
export async function readCatalogShards(manifest, { signal, onChunk, onProgress } = {}) {
  const shards = Array.isArray(manifest.shards) ? manifest.shards : []
  let loaded = (manifest.items ?? manifest.entries ?? []).length
  const total = manifest.total ?? loaded + shards.reduce((sum, shard) => sum + (shard.count ?? 0), 0)
  const failed = []
  let cursor = 0
  onProgress?.({ loaded, total, failed: 0 })
  await Promise.all(Array.from({ length: Math.min(2, shards.length) }, async () => {
    for (;;) {
      const index = cursor++
      if (index >= shards.length) break
      const shard = shards[index]
      let error
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (!/^\/data\/component-code\/catalog\/[a-zA-Z0-9_.-]+\.json$/.test(shard.url)) throw new Error('INVALID_CATALOG_SHARD_URL')
          const response = await fetch(shard.url, { signal })
          if (!response.ok) throw new Error(`CATALOG_HTTP_${response.status}`)
          const bytes = await response.arrayBuffer()
          if (shard.sha256) {
            const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2, '0')).join('')
            if (hash !== shard.sha256) throw new Error('CATALOG_SHARD_DIGEST_MISMATCH')
          }
          const payload = JSON.parse(new TextDecoder().decode(bytes))
          const rows = Array.isArray(payload) ? payload : payload.items ?? payload.entries
          if (!Array.isArray(rows) || (shard.count != null && rows.length !== shard.count)) throw new Error('CATALOG_SHARD_COUNT_MISMATCH')
          onChunk?.(rows)
          loaded += rows.length
          error = null
          break
        } catch (caught) {
          if (signal?.aborted) throw caught
          error = caught
        }
      }
      if (error) failed.push({ url: shard.url, error: error.message })
      onProgress?.({ loaded, total, failed: failed.length })
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }))
  return { loaded, total, failed }
}

export async function readDetail(entry, signal) {
  const response = await fetch(entry.detailUrl, { signal })
  if (!response.ok) throw new Error(`DETAIL_HTTP_${response.status}`)
  return normalizeRemoteEntry({ ...entry, ...await response.json() }, entry.index)
}
