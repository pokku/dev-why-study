import test from 'node:test';
import assert from 'node:assert/strict';
import { C, wavelength, polarizationPower, radioSignal, audioSamples } from '../dist/radio-models.js';
const mse=(a,b)=>a.reduce((sum,v,i)=>sum+(v-b[i])**2,0)/a.length;
test('AM and FM recover the original without noise over the control range',()=>{
 for(const mode of ['am','fm']) for(const frequency of [80,220,800]) for(const depth of [.1,.7,.95]) {
  const s=radioSignal({mode,frequency,depth,duration:.1}); assert.ok(mse(s.original,s.recovered)<1e-10);
 }
});
test('positive amplitude fluctuations cancel in ideal FM but remain in AM',()=>{
 const fm=radioSignal({mode:'fm',noise:.8,duration:.1}),am=radioSignal({mode:'am',noise:.8,duration:.1});
 assert.ok(mse(fm.original,fm.recovered)<1e-10); assert.ok(mse(am.original,am.recovered)>.01);
});
test('additive noise damages both modes and is deterministic',()=>{
 for(const mode of ['am','fm']) {
  const s=radioSignal({mode,noise:.8,noiseType:'additive'}); assert.ok(mse(s.original,s.recovered)>.01);
  assert.deepEqual(s,radioSignal({mode,noise:.8,noiseType:'additive'}));
 }
});
test('playback is finite, bounded, and faded at both ends even at worst controls',()=>{
 for(const mode of ['am','fm']) {
  const s=radioSignal({mode,noise:.8,noiseType:'additive',depth:.1,duration:3});const a=audioSamples(s.recovered);
  assert.equal(a.length,288000);assert.equal(Math.abs(a[0]),0);assert.equal(Math.abs(a.at(-1)),0);
  assert.ok(a.every(v=>Number.isFinite(v)&&Math.abs(v)<=2));
 }
});
test('vacuum frequency and wavelength are inversely proportional',()=>{
 assert.equal(wavelength(1),C);assert.ok(Math.abs(wavelength(1e8)-2.99792458)<1e-10);
 assert.equal(wavelength(1e8)/wavelength(1e9),10);
});
test('linear polarization power is symmetric and has a perpendicular null',()=>{
 assert.equal(polarizationPower(0),1);assert.ok(Math.abs(polarizationPower(45)-.5)<1e-15);
 assert.ok(polarizationPower(90)<1e-30);assert.equal(polarizationPower(180),1);
});
