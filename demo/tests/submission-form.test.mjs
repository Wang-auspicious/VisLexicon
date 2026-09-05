import test from 'node:test'
import assert from 'node:assert/strict'

const emptyForm = { type: 'term', name: '', zh: '', url: '', note: '' }

test('editing name keeps the missing term-or-link error from the last validation', async () => {
  const { applySubmissionUpdate, validateSubmission } = await import('../src/lib/submission-form.js')
  const errors = validateSubmission(emptyForm)

  const next = applySubmissionUpdate(emptyForm, errors, 'name', 'Ada')

  assert.equal(next.errors.name, undefined)
  assert.equal(next.errors.content, '请至少填写术语或链接。')
})

test('editing term or URL clears the content error only once the condition is satisfied', async () => {
  const { applySubmissionUpdate, validateSubmission } = await import('../src/lib/submission-form.js')
  const errors = validateSubmission(emptyForm)

  const stillEmpty = applySubmissionUpdate(emptyForm, errors, 'zh', '   ')
  assert.equal(stillEmpty.errors.content, '请至少填写术语或链接。')

  const withTerm = applySubmissionUpdate(emptyForm, errors, 'zh', 'magnetic button')
  assert.equal(withTerm.errors.content, undefined)

  const withUrl = applySubmissionUpdate(emptyForm, errors, 'url', 'https://example.com')
  assert.equal(withUrl.errors.content, undefined)
})

test('site preflight exposes honest published, alias, candidate, duplicate, new-link, and unverifiable states', async () => {
  const { preflightSiteSubmission } = await import('../src/lib/submission-form.js')
  const resolver = [
    {
      entityId: 'entity-lucide',
      status: 'published',
      primaryUrl: 'https://lucide.dev',
      aliases: ['https://lucide.netlify.app'],
    },
    {
      entityId: 'entity-bits',
      status: 'candidate',
      primaryUrl: 'https://bits-ui.com',
      aliases: ['https://github.com/huntabyte/bits-ui'],
    },
  ]

  assert.equal(preflightSiteSubmission('https://lucide.dev', resolver).kind, 'published')
  assert.equal(preflightSiteSubmission('https://lucide.netlify.app', resolver).kind, 'known-alias')
  assert.equal(preflightSiteSubmission('https://bits-ui.com', resolver).kind, 'candidate')
  assert.equal(preflightSiteSubmission('https://github.com/huntabyte/bits-ui', resolver).kind, 'known-alias')
  assert.equal(preflightSiteSubmission('https://new.example', resolver).kind, 'new-link')
  assert.equal(preflightSiteSubmission('not a url', resolver).kind, 'unverifiable')
  for (const value of Object.values(resolver)) {
    assert.notEqual(value, 'submitted')
    assert.notEqual(value, 'queued')
  }
})

test('site preflight accepts a published revision resolver object and preserves duplicate matches', async () => {
  const { preflightSiteSubmission } = await import('../src/lib/submission-form.js')
  const result = preflightSiteSubmission('https://shared.example/path', {
    revision: 'abc123abc123',
    rows: [
      { entityId: 'entity-a', status: 'published', primaryUrl: 'https://shared.example', aliases: [] },
    ],
  })
  assert.equal(result.kind, 'suspected-duplicate')
  assert.equal(result.matches[0].entityId, 'entity-a')
  assert.match(result.message, /补充证据|疑似重复/u)
})
