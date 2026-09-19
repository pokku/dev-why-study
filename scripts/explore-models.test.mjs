import test from 'node:test';import assert from 'node:assert/strict';
import {woundSignal,aliasFrequency,slitIntensity,flux,emf,lensImage,seededRandom,piPoints} from '../dist/explore-models.js';
test('winding detects the two signal components and rejects the intervening integer frequency',()=>{
 for(const[f,value]of [[3,.5],[5,.25],[4,0]]){const c=woundSignal(f).center;assert.ok(Math.abs(c.x-value)<1e-12);assert.ok(Math.abs(c.y)<1e-12);}
});
test('alias candidate and original cosine agree at every sample',()=>{
 for(const f of [1,3,7.5,12])for(const fs of [2,4,12,30]){const a=aliasFrequency(f,fs);assert.ok(a<=fs/2);for(let n=0;n<fs*2;n++)assert.ok(Math.abs(Math.cos(2*Math.PI*f*n/fs)-Math.cos(2*Math.PI*a*n/fs))<1e-12);}
});
test('double slit maxima repeat at lambda L/d and minima occur halfway',()=>{
 const lambda=550e-9,L=1.5,d=.0003,spacing=lambda*L/d;
 assert.equal(slitIntensity(0,lambda,d,L),1);assert.ok(slitIntensity(spacing/2,lambda,d,L)<1e-25);assert.ok(Math.abs(slitIntensity(spacing,lambda,d,L)-1)<1e-12);
});
test('induction is the negative time derivative of flux, reverses with motion and vanishes at rest',()=>{
 for(const x of [-2,-.5,0,.5,2])for(const v of [-2,0,2]){const h=1e-6,derivative=(flux(x+v*h)-flux(x-v*h))/(2*h);assert.ok(Math.abs(emf(x,v,3)+3*derivative)<1e-8);assert.equal(Math.abs(emf(x,0,3)),0);}
});
test('thin lens handles real image, virtual image and focus singularity',()=>{
 assert.equal(lensImage(15,40),24);assert.equal(lensImage(20,10),-20);assert.equal(lensImage(20,20),Infinity);
 for(const[f,a]of [[5,100],[30,5],[15,40]])assert.ok(Math.abs(1/f-1/a-1/lensImage(f,a))<1e-12);
});
test('Monte Carlo uses all classifications and converges reproducibly for a fixed large sample',()=>{
 const p=piPoints(50000,seededRandom(12345));assert.ok(p.every(p=>p.x>=-1&&p.x<1&&p.y>=-1&&p.y<1&&p.inside===(p.x*p.x+p.y*p.y<=1)));
 const estimate=4*p.filter(p=>p.inside).length/p.length;assert.ok(Math.abs(estimate-Math.PI)<.03);assert.deepEqual(piPoints(5,seededRandom(99)),piPoints(5,seededRandom(99)));
});
