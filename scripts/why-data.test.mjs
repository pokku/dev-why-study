import test from 'node:test';import assert from 'node:assert/strict';import { readFileSync } from 'node:fs';
import { whyConnections, whyLabs, firstStage } from '../dist/why-data.js';
import { labs } from '../dist/lab-catalog.js';import { learning } from '../dist/learning-data.js';
const data=JSON.parse(readFileSync(new URL('../dist/data/knowledge.json',import.meta.url),'utf8'));
const byId=new Map(data.nodes.map(n=>[n.id,n]));
const linked=(a,b)=>data.edges.some(e=>(e.from===a&&e.to===b)||(e.from===b&&e.to===a));
test('every shown use and career follows existing edges and carries their reasons',()=>{
 for(const node of data.nodes.filter(n=>n.kind==='school')){const c=whyConnections(node.id,data.nodes,data.edges);
  for(const item of [...c.uses,...c.careers]){const chain=[node.id,...item.path.map(p=>p.id)];assert.equal(item.reasons.length,item.path.length);
   for(let i=1;i<chain.length;i++)assert.ok(linked(chain[i-1],chain[i]),`${chain.join('>')}`);assert.ok(item.reasons.every(Boolean));}
  assert.ok(c.careers.every(item=>item.node.kind==='career'));assert.ok(c.uses.every(item=>['technology','interest'].includes(item.node.kind)));}
});
test('career paths never pass through prerequisites or everyday topics',()=>{
 for(const node of data.nodes.filter(n=>n.kind==='school')){const c=whyConnections(node.id,data.nodes,data.edges),before=new Set(c.before.map(b=>b.node.id));
  for(const item of c.careers)for(const step of item.path.slice(0,-1)){assert.ok(!before.has(step.id));assert.notEqual(byId.get(step.id).kind,'interest');}}
});
test('direct uses come first and known examples are found',()=>{
 const p=whyConnections('pythagorean',data.nodes,data.edges);assert.ok(p.uses.some(u=>u.node.id==='gps'&&u.path.length===1));
 assert.ok(whyConnections('statistics',data.nodes,data.edges).careers.some(c=>c.node.id==='data-scientist'&&c.path.length===1));
 const firstIndirect=p.uses.findIndex(u=>u.path.length>1);if(firstIndirect>=0)assert.ok(p.uses.slice(firstIndirect).every(u=>u.path.length>1));
});
test('labs and stage are resolved for a unit',()=>{
 assert.ok(whyLabs('prime-factorization',labs,learning).some(l=>l.id==='rsa'));assert.deepEqual(firstStage('pythagorean'),{stage:'中学校',course:'中3・数学'});assert.equal(firstStage('gps'),null);
});
