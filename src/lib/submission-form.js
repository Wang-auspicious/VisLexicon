import { resolveSubmittedUrl } from './site-identity.js'

export const SUBMISSION_TYPES = new Set(['term', 'component', 'wild', 'site'])
export const EMPTY_SUBMISSION = Object.freeze({ type: 'term', name: '', zh: '', url: '', note: '' })

export function validateSubmission(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = '请填写用于署名的名称。'
  if (!form.zh.trim() && !form.url.trim()) errors.content = '请至少填写术语或链接。'
  if (form.url.trim()) {
    try {
      const url = new URL(form.url)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') errors.url = '链接须使用 http:// 或 https://。'
    } catch {
      errors.url = '请输入完整有效的链接。'
    }
  }
  return errors
}

export function applySubmissionUpdate(form, errors, field, value) {
  const nextForm = { ...form, [field]: value }
  const nextErrors = { ...errors }
  delete nextErrors[field]

  if ((field === 'zh' || field === 'url') && (nextForm.zh.trim() || nextForm.url.trim())) {
    delete nextErrors.content
  }

  return { form: nextForm, errors: nextErrors }
}

const PREFLIGHT_MESSAGES = Object.freeze({
  published: '链接已对应已发布条目，可补充证据，不会新建重复条目。',
  'known-alias': '链接是已知实体的别名，可补充证据，不会新建重复条目。',
  candidate: '链接已有候选记录，可补充证据；这不代表已经发布。',
  'suspected-duplicate': '链接与现有条目疑似重复，请先核对匹配项。',
  'new-link': '未找到现有匹配，可保存为本机草稿；尚未发送。',
  unverifiable: '链接暂时无法安全核验，请检查协议、域名和输入内容。',
})

/**
 * Performs a read-only URL duplicate preflight against a published revision
 * resolver. It deliberately exposes no fake submission or queue state.
 */
export function preflightSiteSubmission(input, resolver) {
  const rows = Array.isArray(resolver) ? resolver : resolver?.rows
  if (!Array.isArray(rows)) {
    return {
      kind: 'unverifiable',
      reason: 'resolver rows are unavailable',
      message: PREFLIGHT_MESSAGES.unverifiable,
      canExportDraft: true,
      requiresEvidence: true,
    }
  }

  let result
  try {
    result = resolveSubmittedUrl(input, rows)
  } catch (error) {
    return {
      kind: 'unverifiable',
      reason: error instanceof Error ? error.message : 'resolver data is invalid',
      message: PREFLIGHT_MESSAGES.unverifiable,
      canExportDraft: true,
      requiresEvidence: true,
    }
  }

  const kind = result.kind in PREFLIGHT_MESSAGES ? result.kind : 'unverifiable'
  return {
    ...result,
    kind,
    message: PREFLIGHT_MESSAGES[kind],
    canExportDraft: true,
    requiresEvidence: kind !== 'new-link',
  }
}
