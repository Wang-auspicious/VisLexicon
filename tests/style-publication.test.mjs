import test from 'node:test'
import assert from 'node:assert/strict'
import {styleDigest, publicationStyleIssues} from '../scripts/style/check-published.mjs'
import {checkStyle, salvage, PIXEL_RULES} from '../scripts/style/style-contract.mjs'


const item={entryId:'fixture',primaryCategory:'ui-implementation',subcategory:'general-ui-components',shots:[{src:'/one.webp'},{src:'/two.webp'},{src:'/three.webp'}]}
const pending={subject:'components',subjectVisible:false,styles:[]}
const known={subject:'components',subjectVisible:true,styles:[{id:'corporate',images:[1,2],evidenceZh:'白底蓝色按钮与规整表单'}],signatureZh:'白底蓝色按钮和灰边输入框整齐排列'}
const exemption=()=>({entries:{fixture:{status:'pending-recapture',reason:'原图未显示渲染组件，重拍尚未获得两张可用主体图',nextAction:'Open and photograph the actual live component',evidenceId:'fixture-attempt',digest:styleDigest(item,pending),expiresAt:'2099-01-01T00:00:00Z'}}})

test('published unresolved style fails unless an explicit current digest exemption exists',()=>{
  assert.match(publicationStyleIssues([item],{entries:{fixture:pending}},{entries:{}})[0],/requires an explicit/)
  assert.deepEqual(publicationStyleIssues([item],{entries:{fixture:pending}},exemption()),[])
  assert.match(publicationStyleIssues([item],{entries:{fixture:{...pending,failed:'new-failure'}}},exemption())[0],/stale/)
  const expired=exemption(); expired.entries.fixture.expiresAt='2020-01-01'
  assert.match(publicationStyleIssues([item],{entries:{fixture:pending}},expired)[0],/expired/)
})

test('mutating a resolved published entry into undetermined fails the production gate',()=>{
  assert.deepEqual(publicationStyleIssues([item],{entries:{fixture:known}},{entries:{}}),[])
  assert.ok(publicationStyleIssues([item],{entries:{fixture:{...known,styles:[]}}},{entries:{}}).length)
})

test('dark announcement pixels and dark docs themes cannot validate component neon',()=>{
  const neon={...known,styles:[{id:'dark-neon',images:[1,2],evidenceZh:'黑底青色发光描边'}]}
  const shell={luma:0.1,vivid:0.04,sat:0.5,backgroundLuma:0.1,region:'page',shellExcluded:false}
  const crop={...shell,region:'subject',shellExcluded:true}
  assert.notEqual(PIXEL_RULES['dark-neon'](shell),true)
  assert.equal(PIXEL_RULES['dark-neon'](crop),true)
  assert.notEqual(PIXEL_RULES['dark-neon']({...crop,backgroundLuma:0.95}),true)
  assert.ok(checkStyle(neon,[shell,shell]).some(issue=>issue.startsWith('pixels-contradict')))
  assert.ok(checkStyle(neon,[]).some(issue=>issue.startsWith('missing-subject-pixels')))
  assert.equal(salvage(neon,[shell,shell],'components',false).out,null)
  assert.deepEqual(checkStyle(neon,[crop,crop]),[])
})


