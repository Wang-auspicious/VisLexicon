import test from 'node:test'
import assert from 'node:assert/strict'
import { imageResourcePresentation, projectImagePrompt } from '../src/lib/image-prompts.js'

const skill = { id:'example-skill', resourceType:'skill', skillName:'example', titleZh:'示例', titleEn:'Example', topicZh:'视觉设计', descriptionZh:'来源示例', tags:[], sourceUrl:'https://example.com/skill', sourceName:'Author', preview:'/example.jpg', usageZh:'阅读原文并安装 Skill。', sourceDocumentUrl:'https://example.com/SKILL.md', downloadUrl:'https://example.com/download', recommendationUrl:'https://example.com/post' }

test('a Skill without a prompt retains original and acquisition links without an empty copy value',()=>{
  const view=imageResourcePresentation({...skill,prompt:'  '})
  assert.equal(view.isSkill,true)
  assert.equal(view.prompt,'')
  assert.deepEqual(view.links.map(link=>link.zh),['查看 Skill 原文','获取 Skill','查看分享出处'])
  const unit=projectImagePrompt(skill)
  assert.equal(unit.resourceType,'skill')
  assert.equal(unit.sectionsZh[1].text,skill.usageZh)
  assert.equal(unit.scope,'skills')
  assert.equal(unit.theme,'image')
  assert.deepEqual(unit.offers,[])
  assert.equal(unit.verification,'attributed-source-example')
  assert.equal(projectImagePrompt({...skill, originalSourceStatus:'unverified'}).verification,'recommendation-only')
})

test('comparisons retain exact source assets and do not invent before images from output-only evidence',()=>{
  const before='/before.jpg',after='/after.jpg',image='/combined.jpg'
  assert.deepEqual(imageResourcePresentation({...skill,comparison:{kind:'separate',before,after}}).images.map(entry=>entry.src),[before,after])
  assert.deepEqual(imageResourcePresentation({...skill,comparison:{kind:'combined',image}}).images.map(entry=>entry.src),[image])
  const example=imageResourcePresentation({...skill,comparison:{kind:'example',image}})
  assert.equal(example.images[0].src,image)
  assert.equal(example.images[0].labelZh,'来源效果示例')
  const unavailable=imageResourcePresentation({...skill,comparison:{kind:'source-only',caption:'原文提供演示，未取得可分离的前后图。'}})
  assert.deepEqual(unavailable.images,[])
  assert.equal(unavailable.sourceOnly,true)
  assert.equal(imageResourcePresentation({...skill,resourceType:'prompt',prompt:'可复制文本'}).prompt,'可复制文本')
})
