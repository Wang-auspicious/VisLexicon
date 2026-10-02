const DB_NAME = 'vl-curation-review-images-v1'
const STORE_NAME = 'images'
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'])

function openDatabase() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('当前浏览器不支持本地图片存储'))
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: 'key' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('无法打开本地图片存储'))
  })
}

async function digestBlob(blob) {
  const bytes = await blob.arrayBuffer()
  if (globalThis.crypto?.subtle) {
    const hash = await crypto.subtle.digest('SHA-256', bytes)
    return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }
  return `bytes-${bytes.byteLength}`
}

function decodeImage(blob) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(blob).then((bitmap) => {
      const dimensions = { width: bitmap.width, height: bitmap.height }
      bitmap.close()
      return dimensions
    })
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve({ width: image.naturalWidth, height: image.naturalHeight }) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片无法解码')) }
    image.src = url
  })
}

export async function validateReviewImage(blob) {
  if (!(blob instanceof Blob) || !IMAGE_TYPES.has(blob.type)) throw new Error('请粘贴 PNG、JPEG、WebP、GIF 或 AVIF 图片')
  if (blob.size < 16) throw new Error('图片字节过少，未接收到有效截图')
  const dimensions = await decodeImage(blob)
  if (!dimensions.width || !dimensions.height) throw new Error('图片没有可读的像素尺寸')
  return { blob, ...dimensions, bytes: blob.size, mime: blob.type, sha256: await digestBlob(blob) }
}

function imageKey(entryId, role) { return `${entryId}::${role}` }

export async function saveReviewImage(entryId, role, image) {
  const database = await openDatabase()
  const record = { key: imageKey(entryId, role), entryId, role, blob: image.blob, bytes: image.bytes, width: image.width, height: image.height, mime: image.mime, sha256: image.sha256, updatedAt: new Date().toISOString() }
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(record)
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error || new Error('图片保存失败'))
  })
  database.close()
  return record
}

export async function listReviewImages(entryId) {
  const database = await openDatabase()
  const records = await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => resolve(request.result.filter((record) => record.entryId === entryId))
    request.onerror = () => reject(request.error || new Error('图片读取失败'))
  })
  database.close()
  return records
}

export async function listAllReviewImages() {
  const database = await openDatabase()
  const records = await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('图片清单读取失败'))
  })
  database.close()
  return records
}

export async function deleteReviewImage(entryId, role) {
  const database = await openDatabase()
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).delete(imageKey(entryId, role))
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error || new Error('图片删除失败'))
  })
  database.close()
}

export function pastedImageFromEvent(event) {
  const items = [...(event.clipboardData?.items || [])]
  const item = items.find((candidate) => candidate.kind === 'file' && IMAGE_TYPES.has(candidate.type))
  return item?.getAsFile?.() || null
}

export async function readClipboardImage() {
  if (typeof navigator?.clipboard?.read !== 'function') return null
  const items = await navigator.clipboard.read()
  for (const item of items) {
    const type = IMAGE_TYPES.values().find((candidate) => item.types.includes(candidate))
    if (type) return item.getType(type)
  }
  return null
}
