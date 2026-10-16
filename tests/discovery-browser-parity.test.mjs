import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { syncDiscoveryBrowser } from '../scripts/sync-discovery-browser.mjs'
import { queryRequirements } from '../src/lib/discovery-scopes.js'

test('standalone atlas uses the authoritative rights filters byte for byte', async () => {
  await syncDiscoveryBrowser()
  const [source, browser] = await Promise.all([
    fs.readFile(new URL('../src/lib/discovery-scopes.js', import.meta.url)),
    fs.readFile(new URL('../public/effects-atlas/discovery-scopes.js', import.meta.url)),
  ])
  assert.deepEqual(browser, source)
  const { queryRequirements: browserRequirements } = await import('../public/effects-atlas/discovery-scopes.js')
  for (const query of ['免费按钮，收费也可以', '免费开源可商用的按钮', '免费按钮，源码可以收费', '开源按钮，不要求开源']) {
    assert.deepEqual(browserRequirements(query), queryRequirements(query))
  }
  assert.equal(browserRequirements('免费按钮，收费也可以').free, false)
})
