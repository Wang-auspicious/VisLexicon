import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { once } from 'node:events'
import { createJevProvider, systemOnePayload, resolveJevConfig, withLoopbackNoProxy, FREE_MODEL } from '../server/jev-provider.mjs'
import { rankWithJev, discoveryPlugin, RANK_SCOPES } from '../server/discovery-api.mjs'
import { jevErrorMessage } from '../src/lib/jev-status.js'

const config = { baseUrl: 'http://127.0.0.1:18009', model: 'kev-test', apiKey: 'unit-test-credential', maxConcurrent: 2, maxQueued: 2, timeoutMs: 1000, queueTimeoutMs: 100 }
const candidate = id => ({ unit: { id: String(id), nameZh: '蓝色按钮', componentType: 'button', tags: ['button'] } })
const question = { type: 'score', instructions: 'Evaluate this candidate.', criteria: ['No', 'Partial', 'Useful', 'Exact'] }
const request = { purpose: 'Test ranking', state: { query: 'blue' }, questions: { candidate_0: question } }
function answerFor(body, overrides = {}) {
  return { deployment_model: config.model, usage: { input_tokens: 10, output_tokens: 2 }, latency_ms: 4,
    answers: Object.fromEntries(Object.entries(body.questions).map(([id, value]) => [id, value.type === 'noul' ? { type: 'noul', noul: 0.8 } : value.type === 'choice'
      ? { type: 'choice', choice: Object.keys(value.criteria)[0], confidence: 1, probabilities: Object.fromEntries(Object.keys(value.criteria).map((key, index) => [key, index ? 0 : 1])) }
      : { type: 'score', score: 2, confidence: 1, probabilities: Object.fromEntries(value.criteria.map((_, index) => [String(index), index === 2 ? 1 : 0])) }])), ...overrides }
}
const ok = raw => ({ ok: true, json: async () => raw })
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }

test('Kev uses the verified H2 wire protocol, configured deployment and unknown cost', async () => {
  const client = createJevProvider(config, { fetchImpl: async (url, options) => {
    assert.equal(url, `${config.baseUrl}/v1/systemone`)
    assert.equal(options.headers.Authorization, `Bearer ${config.apiKey}`)
    const body = JSON.parse(options.body)
    assert.deepEqual(Object.keys(body).sort(), ['model', 'questions', 'state'])
    assert.equal(body.model, config.model)
    assert.deepEqual(JSON.parse(body.state), request.state)
    assert.ok(!options.body.includes(config.apiKey))
    return ok(answerFor(body, { cost: '9.9' }))
  } })
  const result = await client.decide(request)
  assert.equal(result.model, config.model)
  assert.equal(result.provider, 'kev')
  assert.equal(result.cost, null)
  assert.equal(result.costStatus, 'unknown')
})

test('all three H2 question types validate and receive typed answers', async () => {
  const mixed = { ...request, questions: { score: question, pick: { type: 'choice', instructions: 'Pick one.', criteria: { yes: 'Yes', no: 'No' } }, check: { type: 'noul', instructions: 'Is this useful?' } } }
  const client = createJevProvider(config, { fetchImpl: async (_, options) => ok(answerFor(JSON.parse(options.body))) })
  assert.deepEqual(Object.keys((await client.decide(mixed)).answers), ['score', 'pick', 'check'])
})

test('Kev rejects response aliases, malformed probabilities, missing usage and mismatched answers', async () => {
  for (const overrides of [{ deployment_model: 'different-weights', model: config.model }, { usage: null }, { latency_ms: -1 }, { answers: {} },
    { answers: { candidate_0: { type: 'score', score: 2, confidence: 1, probabilities: { 0: 0, 1: 0, 2: 0, 3: 0 } } } }]) {
    const client = createJevProvider(config, { fetchImpl: async (_, options) => ok(answerFor(JSON.parse(options.body), overrides)) })
    await assert.rejects(client.decide(request), /UNEXPECTED_MODEL|INVALID_MODEL_RESPONSE/)
  }
})

test('free legacy provider refuses costs and non-free deployment without another model call', async () => {
  let calls = 0
  const client = createJevProvider({ ...config, provider: 'opencode', model: FREE_MODEL }, { fetchImpl: async () => { calls++; return ok({ model: FREE_MODEL, cost: '0.01' }) } })
  await assert.rejects(client.decide(request), /FREE_MODEL_COST_CHANGED/)
  assert.equal(calls, 1)
  assert.throws(() => createJevProvider({ ...config, provider: 'opencode', model: 'paid-model' }), /JEV_CONFIG_INVALID/)
})

test('payload enforces H2 caps without silently truncating candidate state', () => {
  const many = count => Object.fromEntries(Array.from({ length: count }, (_, i) => [`candidate_${i}`, question]))
  assert.doesNotThrow(() => systemOnePayload({ ...request, state: 'x'.repeat(12000), questions: many(8) }, config.model))
  assert.throws(() => systemOnePayload({ ...request, state: 'x'.repeat(12001) }, config.model), /JEV_REQUEST_TOO_LARGE/)
  assert.throws(() => systemOnePayload({ ...request, questions: many(9) }, config.model), /JEV_REQUEST_TOO_LARGE/)
  assert.throws(() => systemOnePayload({ ...request, questions: { a: { ...question, criteria: ['only one'] } } }, config.model), /INVALID_JEV_REQUEST/)
  assert.throws(() => systemOnePayload({ ...request, questions: { a: { ...question, criteria: Array(17).fill('option') } } }, config.model), /INVALID_JEV_REQUEST/)
  const questions = Object.fromEntries(Array.from({ length: 5 }, (_, i) => [`candidate_${i}`, { ...question, criteria: Array(16).fill('option') }]))
  assert.throws(() => systemOnePayload({ ...request, questions }, config.model), /JEV_REQUEST_TOO_LARGE/)
})

test('rank splits 77 candidates by question and state caps, preserving every ID and token totals', async () => {
  const sent = []
  const client = createJevProvider(config, { fetchImpl: async (_, options) => {
    const body = JSON.parse(options.body), state = JSON.parse(body.state)
    assert.ok(body.state.length <= 12000)
    assert.ok(Object.keys(body.questions).length <= 8)
    assert.ok(Object.values(body.questions).reduce((sum, value) => sum + value.criteria.length, 0) <= 64)
    sent.push(state.candidates.map(value => value.id))
    return ok(answerFor(body))
  } })
  const candidates = Array.from({ length: 77 }, (_, index) => candidate(index))
  const result = await rankWithJev('蓝色按钮', candidates, { provider: client })
  assert.equal(sent.length, 10)
  assert.deepEqual(result.rows.map(row => row.id), candidates.map(({ unit }) => unit.id))
  assert.equal(result.usage.input_tokens, 100)
  assert.equal(result.cost, null)
  const large = Array.from({ length: 8 }, (_, index) => ({ unit: { ...candidate(index).unit, tagFacets: Object.fromEntries(Array.from({ length: 10 }, (_, j) => [`facet${j}`, Array(4).fill('x'.repeat(80))])) } }))
  const largeResult = await rankWithJev('blue', large, { provider: client })
  assert.ok(largeResult.usage.batches > 1)
  assert.equal(largeResult.rows.length, 8)
})

test('Kev deployment token limit returned as HTTP 422 splits batches without losing evidence', async () => {
  const calls=[]
  const client=createJevProvider(config,{fetchImpl:async (_,options)=>{
    const body=JSON.parse(options.body),state=JSON.parse(body.state)
    calls.push(state.candidates.length)
    if(state.candidates.length>2)return {ok:false,status:422,text:async()=>JSON.stringify({detail:state.candidates.length===8?'state is 3,297 tokens, over the 2,048-token limit (the <state> token included): shorten the document or split it across requests':'total question-row work exceeds 12288 tokens; split questions across requests'})}
    return ok(answerFor(body))
  }})
  const result=await rankWithJev('blue',Array.from({length:8},(_,index)=>candidate(index)),{provider:client})
  assert.deepEqual(calls,[8,4,2,2,4,2,2])
  assert.deepEqual(result.rows.map(row=>row.id),Array.from({length:8},(_,index)=>String(index)))
  assert.equal(result.usage.batches,4)
})

test('configured concurrency and queue budgets are shared and queued cancellation releases its slot', async () => {
  const started = deferred(), release = deferred()
  let calls = 0
  const client = createJevProvider({ ...config, maxConcurrent: 1, maxQueued: 1 }, { fetchImpl: async (_, options) => { calls++; started.resolve(); await release.promise; return ok(answerFor(JSON.parse(options.body))) } })
  const active = client.decide(request)
  await started.promise
  const controller = new AbortController()
  const waiting = client.decide(request, { signal: controller.signal })
  const rejected = assert.rejects(waiting, /cancel queued/)
  await assert.rejects(client.decide(request), /MODEL_BUSY/)
  assert.equal((await client.status()).queued, 1)
  controller.abort(new Error('cancel queued'))
  await rejected
  assert.equal((await client.status()).queued, 0)
  const next = client.decide(request)
  release.resolve()
  await Promise.all([active, next])
  assert.equal(calls, 2)
  assert.equal((await client.status()).active, 0)
})

test('queue expiry and request timeout release admission', async () => {
  const started = deferred(), release = deferred()
  const client = createJevProvider({ ...config, maxConcurrent: 1, queueTimeoutMs: 10 }, { fetchImpl: async (_, options) => { started.resolve(); await release.promise; return ok(answerFor(JSON.parse(options.body))) } })
  const active = client.decide(request)
  await started.promise
  await assert.rejects(client.decide(request), /JEV_QUEUE_TIMEOUT/)
  release.resolve(); await active
  assert.equal((await client.status()).queued, 0)
  const timed = createJevProvider({ ...config, timeoutMs: 10 }, { fetchImpl: async (_, options) => new Promise((_, reject) => { const timer=setTimeout(()=>reject(new Error('timeout did not propagate')),1000); options.signal.addEventListener('abort', () => {clearTimeout(timer);reject(options.signal.reason)}, { once: true }) }) })
  await assert.rejects(timed.decide(request), /timeout|aborted/i)
  assert.equal((await timed.status()).active, 0)
})

test('cancellation reaches fetch and stops all later batches', async () => {
  const started = deferred(), controller = new AbortController()
  let calls = 0
  const client = createJevProvider(config, { fetchImpl: async (_, options) => new Promise((_, reject) => { calls++; started.resolve(); options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true }) }) })
  const ranking = rankWithJev('blue', Array.from({ length: 17 }, (_, index) => candidate(index)), { provider: client, signal: controller.signal })
  const rejected = assert.rejects(ranking, /cancel ranking/)
  await started.promise
  controller.abort(new Error('cancel ranking'))
  await rejected
  assert.equal(calls, 1)
  assert.equal((await client.status()).active, 0)
})

test('a closed tunnel is explicit and never triggers a fallback or leaks connection details', async () => {
  let calls = 0
  const client = createJevProvider({ ...config, ssh: { host: 'private.invalid', user: 'fixture', localPort: 18009, remotePort: 8009 } }, { transport: async () => false, probe: async () => false, fetchImpl: async () => { calls++ } })
  await assert.rejects(client.decide(request), /JEV_TUNNEL_DISCONNECTED/)
  const status = await client.status()
  assert.equal(status.tunnel, 'disconnected')
  assert.equal(calls, 0)
  assert.doesNotMatch(JSON.stringify(status), /private\.invalid|fixture|unit-test-credential|18009|8009/)
  assert.equal(jevErrorMessage('JEV_TUNNEL_DISCONNECTED'), 'Jev 未连接（隧道未开）')
  assert.doesNotMatch(jevErrorMessage('unknown sensitive error'), /sensitive/)
})

test('configuration precedence is explicit path, H2 default, optional free legacy; invalid chosen config never falls back', async () => {
  const filenames = []
  const readConfig = async filename => { filenames.push(filename); return JSON.stringify({ ...config, enabled: true, projects: ['another-project'] }) }
  assert.equal((await resolveJevConfig({ env: { VISLEXICON_JEV_CONFIG: '/explicit.json', EASY_WORKFLOW_DECISION_MODEL_CONFIG: '/h2.json' }, readFile: readConfig })).provider, 'kev')
  assert.equal(filenames.pop(), '/explicit.json')
  await resolveJevConfig({ env: { EASY_WORKFLOW_DECISION_MODEL_CONFIG: '/h2.json' }, readFile: readConfig })
  assert.equal(filenames.pop(), '/h2.json')
  await resolveJevConfig({ env: {}, home: '/home/fixture', readFile: readConfig })
  assert.match(filenames.pop().replaceAll('\\', '/'), /\.pi\/agent\/easy-workflow\/decision-model.json$/)
  const missing = async () => { throw Object.assign(new Error('private path'), { code: 'ENOENT' }) }
  assert.equal((await resolveJevConfig({ env: { OPENCODE_API_KEY: config.apiKey }, readFile: missing })).provider, 'opencode')
  await assert.rejects(resolveJevConfig({ env: { VISLEXICON_JEV_CONFIG: '/missing.json', OPENCODE_API_KEY: config.apiKey }, readFile: missing }), /JEV_CONFIG_UNAVAILABLE/)
  await assert.rejects(resolveJevConfig({ env: {}, readFile: async () => JSON.stringify({ ...config, enabled: false }) }), /JEV_DISABLED/)
  await assert.rejects(resolveJevConfig({ env: {}, readFile: async () => '{invalid' }), /JEV_CONFIG_INVALID/)
})

test('external proxy startup preserves existing exclusions and adds every loopback form', () => {
  const env = withLoopbackNoProxy({ NO_PROXY: 'example.test', no_proxy: 'internal.test', HTTP_PROXY: 'http://proxy.test:8080' })
  assert.equal(env.NODE_USE_ENV_PROXY, '1')
  assert.equal(env.HTTP_PROXY, 'http://proxy.test:8080')
  for (const host of ['example.test', 'internal.test', '127.0.0.1', 'localhost', '::1', '[::1]']) assert.ok(env.NO_PROXY.split(',').includes(host))
  assert.equal(env.NO_PROXY, env.no_proxy)
})

test('rank API accepts the four actual UI scopes and preserves tunnel errors', async t => {
  let middleware
  discoveryPlugin({ ranker: async () => { throw new Error('JEV_TUNNEL_DISCONNECTED') } }).configureServer({ middlewares: { use(value) { middleware=value } } })
  const server = http.createServer((req, res) => middleware(req, res, () => { res.writeHead(404); res.end() }))
  server.listen(0, '127.0.0.1'); await once(server, 'listening'); t.after(() => server.close())
  for (const scope of [...RANK_SCOPES, 'curation']) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/discovery/rank`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'blue', scope, candidates: [candidate('one').unit] }) })
    const data = await response.json()
    assert.equal(response.status, scope === 'curation' ? 400 : 503)
    assert.equal(data.error, scope === 'curation' ? 'INVALID_SCOPE' : 'JEV_TUNNEL_DISCONNECTED')
  }
})

test('disconnecting rank HTTP request cancels the provider request', async t => {
  let middleware
  const started = deferred(), cancelled = deferred()
  discoveryPlugin({ ranker: async (_, __, { signal }) => new Promise((_, reject) => { started.resolve(); signal.addEventListener('abort', () => { cancelled.resolve(); reject(signal.reason) }, { once: true }) }) }).configureServer({ middlewares: { use(value) { middleware=value } } })
  const server = http.createServer((req, res) => middleware(req, res, () => { res.writeHead(404); res.end() }))
  server.listen(0, '127.0.0.1'); await once(server, 'listening'); t.after(() => server.close())
  const controller = new AbortController()
  const response = fetch(`http://127.0.0.1:${server.address().port}/api/discovery/rank`, { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'blue', scope: 'global', candidates: [candidate('one').unit] }) })
  const rejected = assert.rejects(response, /abort/i)
  await started.promise; controller.abort(); await rejected
  await Promise.race([cancelled.promise, new Promise((_, reject) => { const timer=setTimeout(() => reject(new Error('disconnect not propagated')), 1000);timer.unref() })])
})
