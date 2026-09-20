import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {connectionTrails,edgeBetween} from '../dist/map-play.js';
const data=JSON.parse(readFileSync(new URL('../dist/data/knowledge.json',import.meta.url),'utf8'));
test('all six surprise trails use existing nodes and reasoned edges without loops',()=>{
 assert.equal(connectionTrails.length,6);
 assert.equal(new Set(connectionTrails.map(t=>t.id)).size,6);
 for(const t of connectionTrails){
  assert.ok(t.nodes.length>=3);assert.equal(new Set(t.nodes).size,t.nodes.length);
  for(const id of t.nodes)assert.ok(data.nodes.some(n=>n.id===id),id);
  for(let i=1;i<t.nodes.length;i++)assert.ok(edgeBetween(data.edges,t.nodes[i-1],t.nodes[i])?.reason,`${t.id}: ${i}`);
 }
});
test('backward exploration preserves relation direction and does not invent an edge',()=>{
 const forward=edgeBetween(data.edges,'ratio','monte-carlo-method');
 assert.equal(edgeBetween(data.edges,'monte-carlo-method','ratio'),forward);
 assert.equal(forward.from,'ratio');assert.equal(forward.to,'monte-carlo-method');
 assert.equal(edgeBetween(data.edges,'guitar','compression'),undefined);
});
