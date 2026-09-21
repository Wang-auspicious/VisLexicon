import {
  assertNoInternalKeys,
  assertPublicDetail,
  assertPublicIndex,
  assertReleaseManifest,
} from './public-release.js'

export const RELEASE_URL = '/release.json'

function httpError(url, response) {
  const error = new Error(`公共数据加载失败：${url}（HTTP ${response.status}）`)
  error.status = response.status
  return error
}

function missingRecordError(entryId) {
  const error = new Error(`公共数据中没有条目：${entryId}`)
  error.code = 'MISSING_PUBLIC_RECORD'
  error.status = 404
  return error
}

function assertSameRelease(value, release, label) {
  if (value.releaseId !== release.releaseId) {
    throw new Error(`${label}.releaseId 与 release.json 不一致`)
  }
  return value
}

async function fetchJson(fetcher, url, options) {
  let response
  try {
    response = await fetcher(url, options)
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error(`公共数据请求失败：${url}（${error.message}）`)
  }
  if (!response?.ok) throw httpError(url, response || { status: 'unknown' })
  try {
    return await response.json()
  } catch (error) {
    throw new Error(`公共数据不是有效 JSON：${url}（${error.message}）`)
  }
}

export function createPublicDataClient({ fetcher = globalThis.fetch, basePath = '' } = {}) {
  if (typeof fetcher !== 'function') throw new Error('createPublicDataClient 需要 fetcher')
  let releasePromise = null
  let indexPromise = null
  const detailPromises = new Map()
  const registryPromises = new Map()
  const markdownPromises = new Map()
  const urlFor = (relativePath) => `${basePath}${relativePath}`

  const loadReleaseManifest = ({ reload = false } = {}) => {
    if (reload) releasePromise = null
    if (!releasePromise) {
      releasePromise = fetchJson(fetcher, urlFor(RELEASE_URL))
        .then(assertReleaseManifest)
        .catch((error) => {
          releasePromise = null
          throw error
        })
    }
    return releasePromise
  }

  const loadPublicSiteIndex = ({ reload = false } = {}) => {
    if (reload) indexPromise = null
    if (!indexPromise) {
      indexPromise = Promise.all([
        loadReleaseManifest({ reload }),
        fetchJson(fetcher, urlFor('/data/site-index.json')),
      ])
        .then(([release, index]) => assertSameRelease(assertPublicIndex(index), release, 'site-index'))
        .catch((error) => {
          indexPromise = null
          throw error
        })
    }
    return indexPromise
  }

  const loadPublicSiteDetail = (entryId, { reload = false, signal } = {}) => {
    const id = String(entryId || '')
    if (!id) return Promise.reject(missingRecordError(id))
    if (reload) detailPromises.delete(id)
    const fetchDetail = (requestSignal) => Promise.all([
        loadReleaseManifest({ reload }),
        fetchJson(fetcher, urlFor(`/data/site/${encodeURIComponent(id)}.json`), { signal: requestSignal }),
      ]).then(([release, detail]) => {
        if (detail?.entryId !== id) throw missingRecordError(id)
        return assertSameRelease(assertPublicDetail(detail), release, `site/${id}`)
      })
    // A view-owned AbortSignal must never poison the shared cache: React can
    // cancel the first effect during StrictMode re-mounting.
    if (signal) return fetchDetail(signal)
    if (!detailPromises.has(id)) {
      const promise = fetchDetail(undefined).catch((error) => {
        detailPromises.delete(id)
        throw error
      })
      detailPromises.set(id, promise)
    }
    return detailPromises.get(id)
  }

  const loadPublicRegistryItem = (entryId, { reload = false, signal } = {}) => {
    const id = String(entryId || '')
    if (!id) return Promise.reject(missingRecordError(id))
    if (reload) registryPromises.delete(id)
    const fetchRegistry = (requestSignal) => Promise.all([
        loadReleaseManifest({ reload }),
        fetchJson(fetcher, urlFor(`/r/${encodeURIComponent(id)}.json`), { signal: requestSignal }),
      ]).then(([release, item]) => {
        if (item?.entryId !== id) throw missingRecordError(id)
        assertNoInternalKeys(item)
        if (item.status !== 'APPROVED') throw new Error(`registry/${id}.status 不是 APPROVED`)
        if (typeof item.revision !== 'string' || item.revision.trim() === '') {
          throw new Error(`registry/${id}.revision 缺失`)
        }
        return assertSameRelease(item, release, `registry/${id}`)
      })
    if (signal) return fetchRegistry(signal)
    if (!registryPromises.has(id)) {
      const promise = fetchRegistry(undefined).catch((error) => {
        registryPromises.delete(id)
        throw error
      })
      registryPromises.set(id, promise)
    }
    return registryPromises.get(id)
  }

  const loadPublicDesignMarkdown = (entryId, { reload = false, signal } = {}) => {
    const id = String(entryId || '')
    if (!id) return Promise.reject(missingRecordError(id))
    if (reload) markdownPromises.delete(id)
    const fetchMarkdown = async (requestSignal) => {
      const release = await loadReleaseManifest({ reload })
      const url = urlFor(`/site/${encodeURIComponent(id)}.md`)
      let response
      try {
        response = await fetcher(url, { signal: requestSignal })
      } catch (error) {
        if (error?.name === 'AbortError') throw error
        throw new Error(`公共数据请求失败：${url}（${error.message}）`)
      }
      if (!response?.ok) throw httpError(url, response || { status: 'unknown' })
      const text = await response.text()
      const releaseMatch = text.match(/^releaseId:\s*(.+)$/m)
      const revisionMatch = text.match(/^revision:\s*(.+)$/m)
      const entryMatch = text.match(/^entryId:\s*(.+)$/m)
      if (entryMatch?.[1]?.trim() !== id) throw missingRecordError(id)
      if (releaseMatch?.[1]?.trim() !== release.releaseId) {
        throw new Error(`site/${id}.md.releaseId 与 release.json 不一致`)
      }
      if (!revisionMatch?.[1]?.trim()) throw new Error(`site/${id}.md.revision 缺失`)
      return text
    }
    if (signal) return fetchMarkdown(signal)
    if (!markdownPromises.has(id)) {
      const promise = fetchMarkdown(undefined).catch((error) => {
        markdownPromises.delete(id)
        throw error
      })
      markdownPromises.set(id, promise)
    }
    return markdownPromises.get(id)
  }

  return {
    loadReleaseManifest,
    loadPublicSiteIndex,
    loadPublicSiteDetail,
    loadPublicRegistryItem,
    loadPublicDesignMarkdown,
  }
}

const defaultClient = createPublicDataClient()

export const loadReleaseManifest = (options) => defaultClient.loadReleaseManifest(options)
export const loadPublicSiteIndex = (options) => defaultClient.loadPublicSiteIndex(options)
export const loadPublicSiteDetail = (entryId, options) => defaultClient.loadPublicSiteDetail(entryId, options)
export const loadPublicRegistryItem = (entryId, options) => defaultClient.loadPublicRegistryItem(entryId, options)
export const loadPublicDesignMarkdown = (entryId, options) => defaultClient.loadPublicDesignMarkdown(entryId, options)
