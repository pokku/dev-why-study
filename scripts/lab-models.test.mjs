import test from 'node:test';
import assert from 'node:assert/strict';
import { prismRay, radians, interferenceAmplitude, orbitStart, orbitStep, orbitEnergy, pendulumStep, heatStep, dct2, inverseDct2 } from '../dist/lab-models.js';

test('プリズムの両面でスネルの法則を満たし、紫が赤より大きく曲がる', () => {
  for (const incidence of [45,50,65]) {
    for (const n of [1.51,1.5475]) {
      const ray=prismRay(n,incidence);
      assert.ok(ray && ray.exit.x > ray.entry.x);
      assert.ok(Math.abs(Math.sin(radians(incidence))-n*Math.sin(radians(30)-ray.internal))<1e-12);
      assert.ok(Math.abs(n*Math.sin(ray.internal+radians(30))-Math.sin(ray.outgoing+radians(30)))<1e-12);
    }
    assert.ok(prismRay(1.5475,incidence).outgoing>prismRay(1.51,incidence).outgoing);
  }
});

test('円軌道を長時間積分しても距離とエネルギーが保たれる', () => {
  let state=orbitStart(1);const energy=orbitEnergy(state);
  for(let i=0;i<12000;i++)state=orbitStep(state,.002);
  assert.ok(Math.abs(Math.hypot(state.x,state.y)-1)<.00001);
  assert.ok(Math.abs(orbitEnergy(state)-energy)<.000001);
  assert.ok(orbitEnergy(orbitStart(1.4))<0);
  assert.ok(orbitEnergy(orbitStart(1.45))>0);
});

test('十分遅い投射は中心天体に衝突し、高速投射は離れる', () => {
  let slow=orbitStart(.25),fast=orbitStart(1.6),hit=false;
  for(let i=0;i<5000;i++){
    if(Math.hypot(slow.x,slow.y)<=.18)hit=true;
    if(!hit)slow=orbitStep(slow,.002);
    fast=orbitStep(fast,.002);
  }
  assert.ok(hit);assert.ok(Math.hypot(fast.x,fast.y)>6);
});

test('同じ外力で固有振動に合わせたとき、ずれたリズムより振幅が育つ', () => {
  const amplitude=ratio=>{
    let s={angle:.015,velocity:0,t:0},peak=0;
    for(let i=0;i<12000;i++){s=pendulumStep(s,.005,ratio);if(i>10000)peak=Math.max(peak,Math.abs(s.angle));}
    return peak;
  };
  assert.ok(amplitude(1)>amplitude(1.4)*4);
  assert.ok(amplitude(1)<.4);
});

test('同振幅の波は0度で2倍、180度で消え、360度で戻る', () => {
  assert.equal(interferenceAmplitude(0),2);
  assert.ok(interferenceAmplitude(Math.PI)<1e-12);
  assert.equal(interferenceAmplitude(2*Math.PI),2);
});

test('断熱境界の熱拡散は総量を保存し、温度の範囲を超えない', () => {
  let field=new Float64Array(40*24);field[0]=1;field[480]=.5;
  for(let i=0;i<500;i++)field=heatStep(field,40,24,.24);
  assert.ok(Math.abs(field.reduce((a,b)=>a+b,0)-1.5)<1e-10);
  assert.ok(Math.min(...field)>=0 && Math.max(...field)<.5);
  const uniform=new Float64Array(40*24).fill(.4);
  assert.deepEqual(heatStep(uniform,40,24,.24),uniform);
  assert.throws(()=>heatStep(field,40,24,.26),RangeError);
});

test('32×32 DCTは全成分で元画像を復元し、直流だけなら平均になる', () => {
  const n=32,pixels=Float64Array.from({length:n*n},(_,i)=>(i*37+i%7*53)%256);
  const coefficients=dct2(pixels,n),full=inverseDct2(coefficients,n),dc=inverseDct2(coefficients,n,1);
  const mean=pixels.reduce((a,b)=>a+b,0)/pixels.length;
  assert.ok(Math.max(...pixels.map((v,i)=>Math.abs(v-full[i])))<1e-9);
  assert.ok(Math.max(...dc.map(v=>Math.abs(v-mean)))<1e-9);
  const energy=a=>a.reduce((s,v)=>s+v*v,0);
  assert.ok(Math.abs(energy(pixels)-energy(coefficients))/energy(pixels)<1e-12);
});

test('保持する周波数を増やすほど、復元誤差は増えない', () => {
  const n=16,pixels=Float64Array.from({length:n*n},(_,i)=>i%2?255:0),coefficients=dct2(pixels,n);
  let previous=Infinity;
  for(const cutoff of [1,2,4,8,16]){
    const result=inverseDct2(coefficients,n,cutoff);
    const error=pixels.reduce((s,v,i)=>s+(v-result[i])**2,0);
    assert.ok(error<=previous+1e-8);previous=error;
  }
});
