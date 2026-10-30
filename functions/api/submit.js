// Cloudflare Pages Function: POST /api/submit — anonymous site submissions.
//
// Submissions land in the SUBMISSIONS KV namespace for editorial review; nothing
// is published from here. No IP addresses are stored (see the privacy page).
//
// Settings (Pages → Settings):
//   SUBMISSIONS        KV binding, required
//   TURNSTILE_SECRET   secret; when set, a valid Turnstile token is required
//                      (the page needs VITE_TURNSTILE_SITE_KEY at build time)
//   SUBMIT_DAILY_PER_IP  default 10
import { SUBMIT_KINDS } from '../../src/data/site-info.js'

const KINDS = new Set(SUBMIT_KINDS.map((kind) => kind.id))
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } })
const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

async function sha256(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function onRequestPost({ request, env }) {
  if (!env.SUBMISSIONS) return json(503, { error: 'SUBMIT_UNAVAILABLE' })
  const origin = request.headers.get('Origin')
  if (origin && origin !== new URL(request.url).origin) return json(403, { error: 'FORBIDDEN_ORIGIN' })
  const raw = await request.text()
  if (raw.length > 8000) return json(413, { error: 'REQUEST_TOO_LARGE' })
  let body
  try { body = JSON.parse(raw) } catch { return json(400, { error: 'INVALID_JSON' }) }
  // Honeypot: people never see this field; bots fill it. Pretend success.
  if (text(body.website, 200)) return json(200, { ok: true })

  const url = text(body.url, 500)
  let parsed
  try { parsed = new URL(url) } catch { return json(400, { error: 'INVALID_URL' }) }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname.includes('.')) return json(400, { error: 'INVALID_URL' })
  const email = text(body.email, 200)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: 'INVALID_EMAIL' })

  const ip = request.headers.get('CF-Connecting-IP') || ''
  if (env.TURNSTILE_SECRET) {
    const form = new FormData()
    form.append('secret', env.TURNSTILE_SECRET)
    form.append('response', text(body.turnstileToken, 2048))
    if (ip) form.append('remoteip', ip)
    const verdict = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form }).then((r) => r.json()).catch(() => ({}))
    if (!verdict.success) return json(400, { error: 'CAPTCHA_FAILED' })
  }

  // Per-IP daily cap, keyed by a salted hash so the raw IP is never written.
  const day = new Date().toISOString().slice(0, 10)
  const counterKey = `limit:${day}:${await sha256(`${day}:${ip}:${env.TURNSTILE_SECRET || 'vislexicon'}`)}`
  const used = Number(await env.SUBMISSIONS.get(counterKey)) || 0
  if (used >= Number(env.SUBMIT_DAILY_PER_IP || 10)) return json(429, { error: 'SUBMIT_RATE_LIMITED' })

  const record = {
    url: parsed.href,
    kind: KINDS.has(body.kind) ? body.kind : 'site',
    note: text(body.note, 1000),
    name: text(body.name, 80),
    email,
    country: request.cf?.country || null,
    submittedAt: new Date().toISOString(),
    status: 'new',
  }
  const id = `sub:${record.submittedAt}:${crypto.randomUUID().slice(0, 8)}`
  await env.SUBMISSIONS.put(id, JSON.stringify(record), { metadata: { url: record.url, kind: record.kind } })
  await env.SUBMISSIONS.put(counterKey, String(used + 1), { expirationTtl: 2 * 86400 })
  return json(200, { ok: true })
}
