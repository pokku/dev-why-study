import test from 'node:test';import assert from 'node:assert/strict';
import {solveLinear,gpsSatellites,pseudoranges,solveGps,hammingEncode,hammingSyndrome,hammingDecode,smallPrimes,rsaKeys,modPow,modInverse,factorByTrial,findPath,makeDataset,createNetwork,trainStep,lossOf,accuracyOf,pageRank,pageGraphs,pageRankStep} from '../dist/advanced-models.js';
test('linear solver returns the exact solution and rejects a singular system',()=>{
 const x=solveLinear([[2,1,0],[1,3,1],[0,1,4]],[3,5,5]);[1,1,1].forEach((v,i)=>assert.ok(Math.abs(x[i]-v)<1e-12));
 assert.equal(solveLinear([[1,2],[2,4]],[1,2]),null);
});
test('GPS least squares recovers position and clock error when the clock is estimated',()=>{
 const truth=[2.5,-1],clock=1.8,sats=gpsSatellites.slice(0,4);
 const last=solveGps(sats,pseudoranges(truth,4,clock,0)).at(-1);
 assert.ok(Math.hypot(last.x-truth[0],last.y-truth[1])<1e-6);assert.ok(Math.abs(last.b-clock)<1e-6);assert.ok(last.rms<1e-9);
});
test('ignoring the clock leaves a position error, and measurement noise stays bounded',()=>{
 const truth=[-3,1],sats=gpsSatellites.slice(0,5);
 const naive=solveGps(sats,pseudoranges(truth,5,2,0),{withClock:false}).at(-1);assert.ok(Math.hypot(naive.x-truth[0],naive.y-truth[1])>1);
 const noisy=solveGps(sats,pseudoranges(truth,5,2,.2,4)).at(-1);assert.ok(Math.hypot(noisy.x-truth[0],noisy.y-truth[1])<2);
});
test('Hamming(7,4) corrects every single-bit error for every message',()=>{
 for(let m=0;m<16;m++){const data=[m>>3&1,m>>2&1,m>>1&1,m&1],code=hammingEncode(data);assert.equal(hammingSyndrome(code),0);
  for(let i=0;i<7;i++){const bad=[...code];bad[i]^=1;const r=hammingDecode(bad);assert.equal(r.syndrome,i+1);assert.deepEqual(r.data,data);}}
});
test('Hamming(7,4) cannot distinguish some two-bit errors from one-bit errors',()=>{
 const code=hammingEncode([1,0,1,1]),bad=[...code];bad[0]^=1;bad[1]^=1;const r=hammingDecode(bad);assert.notEqual(r.syndrome,0);assert.notDeepEqual(r.fixed,code);
});
test('RSA keys decrypt every letter for every pair of distinct small primes',()=>{
 for(const p of smallPrimes)for(const q of smallPrimes){if(p===q)continue;const k=rsaKeys(p,q);assert.equal(k.e*k.d%k.phi,1);
  for(let m=1;m<=26;m++)assert.equal(modPow(modPow(m,k.e,k.n),k.d,k.n),m);}
 assert.equal(modInverse(6,9),null);assert.deepEqual(factorByTrial(61*53).p,53);
});
test('Dijkstra and A* find equally short paths; A* explores fewer cells; weighted A* is never shorter',()=>{
 const W=20,H=12,walls=[];for(let y=0;y<9;y++)walls.push(y*W+10);
 const d=findPath(W,H,walls,[1,1],[18,2],0),a=findPath(W,H,walls,[1,1],[18,2],1),w=findPath(W,H,walls,[1,1],[18,2],2.5);
 assert.ok(Math.abs(d.cost-a.cost)<1e-9);assert.ok(a.order.length<d.order.length);assert.ok(w.cost>=a.cost-1e-9);
 for(let i=1;i<a.path.length;i++){const[dx,dy]=[a.path[i][0]-a.path[i-1][0],a.path[i][1]-a.path[i-1][1]];assert.ok(Math.max(Math.abs(dx),Math.abs(dy))===1);assert.ok(!walls.includes(a.path[i][1]*W+a.path[i][0]));}
 const blocked=findPath(5,5,[2,7,12,17,22],[0,0],[4,4],1);assert.equal(blocked.cost,Infinity);assert.equal(blocked.path.length,0);
});
test('gradient descent lowers the loss; hidden units are needed for XOR',()=>{
 const xor=makeDataset('xor'),linear=createNetwork(0),deep=createNetwork(6);const before=lossOf(deep,xor);
 for(let i=0;i<1500;i++){trainStep(linear,xor,.5);trainStep(deep,xor,.5);}
 assert.ok(lossOf(deep,xor)<before);assert.ok(accuracyOf(deep,xor)>.9);assert.ok(accuracyOf(linear,xor)<.75);
 const line=makeDataset('line'),logistic=createNetwork(0);for(let i=0;i<800;i++)trainStep(logistic,line,1);assert.ok(accuracyOf(logistic,line)>.93);
});
test('PageRank stays a probability distribution and reaches a fixed point',()=>{
 for(const links of Object.values(pageGraphs))for(const d of [.5,.85,.95]){const h=pageRank(links,d,800),r=h.at(-1);
  assert.ok(h.every(v=>Math.abs(v.reduce((a,b)=>a+b,0)-1)<1e-12));const next=pageRankStep(links,r,d);next.forEach((v,i)=>assert.ok(Math.abs(v-r[i])<1e-9));}
 const hub=pageRank(pageGraphs.hub,.85,200).at(-1);assert.equal(hub.indexOf(Math.max(...hub)),5);
});
