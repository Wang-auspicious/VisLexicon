// Jev SystemOne wire protocol: request building, response reading and
// validation. No Node built-ins, so the Cloudflare rank function can use it;
// jev-provider.mjs adds the local transport (Kev tunnel, credentials, queueing).
export const FREE_MODEL = 'jev-1.13-free'
export const JEV_ENDPOINT = 'https://opencode.ai/zen/v1/systemone'
export const JEV_LIMITS = Object.freeze({ questions: 8, optionsPerQuestion: 16, options: 64, stateChars: 12000, requestBytes: 65536 })
export const record = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
export const probability = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
export const safeInt = value => Number.isSafeInteger(value) && value >= 0
export const failure = code => new Error(code)

// The H2 request API includes purpose. Its working wire format sends model,
// serialized state and questions; purpose remains local operation metadata.
export function systemOnePayload(request, model, provider = 'kev') {
  if (!record(request) || typeof request.purpose !== 'string' || !request.purpose.trim() || request.purpose.length > 160 || !record(request.questions)) throw failure('INVALID_JEV_REQUEST')
  const questions = Object.entries(request.questions)
  if (!questions.length || questions.length > JEV_LIMITS.questions) throw failure('JEV_REQUEST_TOO_LARGE')
  let options = 0
  for (const [id, question] of questions) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(id) || ['constructor', 'prototype'].includes(id) || !record(question) ||
      Object.keys(question).some(key => !['type', 'instructions', 'criteria'].includes(key)) ||
      typeof question.instructions !== 'string' || !question.instructions.trim() || question.instructions.length > 2048) throw failure('INVALID_JEV_REQUEST')
    const validText = text => typeof text === 'string' && Boolean(text.trim()) && text.length <= 512
    if (question.type === 'choice') {
      if (!record(question.criteria)) throw failure('INVALID_JEV_REQUEST')
      const choices = Object.entries(question.criteria)
      if (choices.length < 2 || choices.length > 16 || choices.some(([key, value]) => !/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,63}$/.test(key) || ['__proto__', 'constructor', 'prototype'].includes(key) || !validText(value))) throw failure('INVALID_JEV_REQUEST')
      options += choices.length
    } else if (question.type === 'score') {
      if (!Array.isArray(question.criteria) || question.criteria.length < 2 || question.criteria.length > 16 || question.criteria.some(value => !validText(value))) throw failure('INVALID_JEV_REQUEST')
      options += question.criteria.length
    } else if (question.type === 'noul') {
      if (question.criteria !== undefined && (!record(question.criteria) || Object.keys(question.criteria).length !== 2 || !validText(question.criteria.true) || !validText(question.criteria.false))) throw failure('INVALID_JEV_REQUEST')
      options += 2
    } else throw failure('INVALID_JEV_REQUEST')
  }
  if (options > JEV_LIMITS.options) throw failure('JEV_REQUEST_TOO_LARGE')
  let state
  try { state = typeof request.state === 'string' ? request.state : JSON.stringify(request.state) } catch { throw failure('INVALID_JEV_REQUEST') }
  if (typeof state !== 'string' || !state.trim()) throw failure('INVALID_JEV_REQUEST')
  if (state.length > JEV_LIMITS.stateChars) throw failure('JEV_REQUEST_TOO_LARGE')
  const body = JSON.stringify({ model, state: provider === 'kev' ? state : request.state, questions: request.questions })
  if (new TextEncoder().encode(body).length > JEV_LIMITS.requestBytes) throw failure('JEV_REQUEST_TOO_LARGE')
  return body
}

export async function readResponse(response) {
  const reader = response.body?.getReader()
  if (!reader) {
    const raw = await response.json()
    if (new TextEncoder().encode(JSON.stringify(raw)).length > 128 * 1024) throw failure('INVALID_MODEL_RESPONSE')
    return raw
  }
  const chunks = []; let bytes = 0
  for (;;) {
    const item = await reader.read()
    if (item.done) break
    bytes += item.value.byteLength
    if (bytes > 128 * 1024) { await reader.cancel(); throw failure('INVALID_MODEL_RESPONSE') }
    chunks.push(item.value)
  }
  const joined = new Uint8Array(bytes); let offset = 0
  for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength }
  try { return JSON.parse(new TextDecoder().decode(joined)) } catch { throw failure('INVALID_MODEL_RESPONSE') }
}
export function validateResponse(raw, request, config) {
  if (!record(raw)) throw failure('INVALID_MODEL_RESPONSE')
  if ((config.provider === 'kev' ? raw.deployment_model : raw.model) !== config.model) throw failure('UNEXPECTED_MODEL')
  // allowCost: the public site's dedicated paid account; local use stays free-only.
  if (config.provider === 'opencode' && !config.allowCost && raw.cost != null && Number(raw.cost) !== 0) throw failure('FREE_MODEL_COST_CHANGED')
  if (!record(raw.answers) || Object.keys(raw.answers).length !== Object.keys(request.questions).length) throw failure('INVALID_MODEL_RESPONSE')
  if (config.provider === 'kev' && (!record(raw.usage) || !safeInt(raw.usage.input_tokens) || !safeInt(raw.usage.output_tokens) || !Number.isFinite(raw.latency_ms) || raw.latency_ms < 0)) throw failure('INVALID_MODEL_RESPONSE')
  for (const [id, question] of Object.entries(request.questions)) {
    const answer = raw.answers[id]
    if (!record(answer) || answer.type !== question.type) throw failure('INVALID_MODEL_SCORE')
    if (question.type === 'noul') { if (!probability(answer.noul)) throw failure('INVALID_MODEL_RESPONSE'); continue }
    const keys = question.type === 'choice' ? Object.keys(question.criteria) : question.criteria.map((_, index) => String(index))
    if (question.type === 'score' && (!Number.isFinite(answer.score) || answer.score < 0 || answer.score > keys.length - 1)) throw failure('INVALID_MODEL_SCORE')
    if (question.type === 'choice' && !keys.includes(answer.choice)) throw failure('INVALID_MODEL_RESPONSE')
    if (config.provider === 'kev') {
      const distribution = answer.probabilities
      if (!probability(answer.confidence) || !record(distribution) || Object.keys(distribution).length !== keys.length || keys.some(key => !Object.hasOwn(distribution, key) || !probability(distribution[key])) || Math.abs(Object.values(distribution).reduce((a, b) => a + b, 0) - 1) > 0.02) throw failure('INVALID_MODEL_RESPONSE')
      if (question.type === 'choice' && distribution[answer.choice] + 0.00001 < Math.max(...Object.values(distribution))) throw failure('INVALID_MODEL_RESPONSE')
    }
  }
  return { answers: raw.answers, provider: config.provider, model: config.model, usage: raw.usage ?? null, cost: config.provider === 'kev' ? null : raw.cost ?? null, costStatus: config.provider === 'kev' ? 'unknown' : raw.cost == null ? 'unknown' : 'reported' }
}
