import test from 'node:test';
import assert from 'node:assert/strict';
import {SOUND_SPEED,TAU,doppler,synthesize,decompose,wavefront} from '../dist/sound-models.js';
test('Fourier analysis recovers the actual synthesized harmonic amplitudes',()=>{
  for(const amplitudes of [[1,0,0,0,0,0],[1,0,1/3,0,1/5,0],[1,.5,1/3,.25,.2,1/6],[0,0,0,0,0,0],[.2,.8,.4,.1,.3,.7]]){
    const samples=Array.from({length:512},(_,n)=>synthesize(amplitudes,n/512));
    decompose(samples).forEach((a,i)=>assert.ok(Math.abs(a-amplitudes[i])<1e-12));
  }
});
test('Fourier magnitudes also recover a shifted wave and reject DC',()=>{
  const parts=decompose(Array.from({length:512},(_,n)=>2+.6*Math.cos(TAU*3*n/512+.8)));
  parts.forEach((a,i)=>assert.ok(Math.abs(a-(i===2?.6:0))<1e-12));
});
test('Doppler frequency is unchanged at rest and increases monotonically toward listener',()=>{
  assert.equal(doppler(600,0),600);
  let previous=0;for(let v=-170;v<=170;v+=5){const f=doppler(600,v);assert.ok(f>previous);previous=f;assert.ok(Math.abs(f*(SOUND_SPEED-v)/600-SOUND_SPEED)<1e-10);}
});
test('Emission centers stay fixed and wavefront arrival spacing gives the Doppler ratio',()=>{
  for(const speed of [-170,0,170]){
    const a=wavefront(.2,1,speed),b=wavefront(.4,1,speed),later=wavefront(.2,2,speed);
    assert.equal(a.x,later.x);assert.ok(Math.abs(later.radius-a.radius-SOUND_SPEED*.5)<1e-10);
    const arrival1=.2+(560-a.x)/(.5*SOUND_SPEED),arrival2=.4+(560-b.x)/(.5*SOUND_SPEED);
    assert.ok(Math.abs((arrival2-arrival1)-.2*600/doppler(600,speed))<1e-12);
  }
});
