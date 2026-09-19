import test from 'node:test';import assert from 'node:assert/strict';
import {labs} from '../dist/lab-catalog.js';
import {cleanProgress,matchLabs,journeys,learning} from '../dist/learning-data.js';
const ids=labs.map(l=>l.id);
test('stored discoveries accept only known labs and bounded text, not visits',()=>{
 const clean=cleanProgress({records:{radio:{discovered:true,note:'x'.repeat(1000)},fake:{discovered:true},string:{discovered:false},lens:{discovered:true,note:42}},last:{lab:'fake',journey:'radio'}},ids);
 assert.deepEqual(Object.keys(clean.records).sort(),['lens','radio']);assert.equal(clean.records.radio.note.length,280);assert.equal(clean.records.lens.note,'');assert.equal(clean.last,null);
 assert.deepEqual(cleanProgress(null,ids),{records:{},last:null});
});
test('resume data keeps valid labs and discards unknown routes',()=>{
 assert.deepEqual(cleanProgress({last:{lab:'radio',journey:'fake'}},ids).last,{lab:'radio',journey:null});
 assert.deepEqual(cleanProgress({last:{lab:'string',journey:'sound'}},ids).last,{lab:'string',journey:'sound'});
});
test('search finds experiments from questions and normalizes full width',()=>{
 assert.ok(matchLabs(labs,'ＡＭ').some(l=>l.id==='radio'));assert.ok(matchLabs(labs,'音色').some(l=>l.id==='harmonics'));assert.ok(matchLabs(labs,'分数').some(l=>l.id==='doppler'));assert.equal(matchLabs(labs,'ありえない検索語123').length,0);
});
test('all twenty experiences have learning guidance and appear in a route',()=>{
 const covered=new Set(journeys.flatMap(j=>j.steps.map(([id])=>id)));assert.equal(covered.size,ids.length);
 for(const id of ids){assert.ok(covered.has(id));assert.equal(learning[id].length,6);assert.ok(ids.includes(learning[id][4]));}
});
