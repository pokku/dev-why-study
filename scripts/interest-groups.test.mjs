import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {interestGroups,interestPaths} from '../dist/interest-groups.js';
const data=JSON.parse(fs.readFileSync(new URL('../dist/data/knowledge.json',import.meta.url),'utf8'));
test('interest topics are all reachable in ten substantial groups',()=>{
 const paths=interestPaths(data.nodes);assert.equal(interestGroups.length,10);
 for(const group of interestGroups)assert.ok(new Set(paths.filter(p=>p.labels[0]===group.title).map(p=>p.node.id)).size>=6);
 for(const n of data.nodes.filter(n=>['interest','technology','career'].includes(n.kind)))assert.ok(paths.some(p=>p.node.id===n.id),n.id);
});
test('a cross-topic item is available from multiple entrances without duplication inside a group',()=>{
 const paths=interestPaths(data.nodes).filter(p=>p.node.id==='image-recognition');assert.equal(paths.length,2);assert.equal(new Set(paths.map(p=>p.labels[0])).size,2);
 assert.deepEqual(interestPaths([]),[]);
});
