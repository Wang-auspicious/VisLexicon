import test from 'node:test'
import assert from 'node:assert/strict'
import { discoveryPageState } from '../src/lib/discovery-pagination.js'
test('a fifth preliminary page clamps to the surviving confirmed page before slicing',()=>{
 assert.deepEqual(discoveryPageState(5,200),{page:5,pages:9,offset:96})
 const settled=discoveryPageState(5,3)
 assert.deepEqual(settled,{page:1,pages:1,offset:0})
 assert.deepEqual(['one','two','three'].slice(settled.offset,settled.offset+24),['one','two','three'])
})
test('deep-link pages wait for a known total and clamp only against that total',()=>{
 assert.deepEqual(discoveryPageState('5'),{page:5,pages:null,offset:96})
 assert.equal(discoveryPageState('5',200).page,5)
 assert.equal(discoveryPageState('5',0).page,1)
 assert.equal(discoveryPageState('5',49).page,3)
 for(const invalid of ['-1','1.5','Infinity','abc'])assert.equal(discoveryPageState(invalid,200).page,1)
})
