import test from 'node:test'
import assert from 'node:assert/strict'
import { getCuratedResourcesForTerm, getDomainAuthority } from '../src/lib/curated-resources.js'

test('getDomainAuthority returns authoritative platforms for major domains', () => {
  const typoResources = getDomainAuthority('typography')
  assert.ok(typoResources.length >= 3)
  assert.ok(typoResources.some(r => r.name === 'Typewolf'))
  assert.ok(typoResources.some(r => r.name === 'Fontshare'))

  const agentResources = getDomainAuthority('agentic')
  assert.ok(agentResources.some(r => r.name === 'assistant-ui'))
})

test('getCuratedResourcesForTerm matches specific resources based on term attributes', () => {
  const artTerm = { id: 'atlas-art-text-chrome', termEn: 'Retro Chrome Text', tags: ['typography', 'display', 'art-text'] }
  const matched = getCuratedResourcesForTerm(artTerm, 'text-reveal')
  assert.ok(matched.length > 0)
  assert.ok(matched.some(r => r.name.includes('Uiverse') || r.name.includes('Typewolf') || r.name.includes('CodePen')))
})
