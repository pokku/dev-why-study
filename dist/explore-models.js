const TAU=2*Math.PI;
export function woundSignal(frequency,count=800){
  const points=Array.from({length:count},(_,i)=>{const t=4*i/count,s=Math.cos(TAU*3*t)+.5*Math.cos(TAU*5*t),angle=-TAU*frequency*t;return{x:s*Math.cos(angle),y:s*Math.sin(angle)};});
  return{points,center:points.reduce((a,p)=>({x:a.x+p.x/count,y:a.y+p.y/count}),{x:0,y:0})};
}
export const aliasFrequency=(f,fs)=>Math.abs(f-Math.round(f/fs)*fs);
export const slitIntensity=(y,lambda,separation,distance)=>Math.cos(Math.PI*separation*y/(lambda*distance))**2;
export const flux=x=>(1+x*x)**-1.5;
export const emf=(x,v,turns)=>3*turns*x*v/(1+x*x)**2.5;
export function lensImage(f,d){return Math.abs(d-f)<1e-9?Infinity:f*d/(d-f);}
export function seededRandom(seed=12345){return()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}
export function piPoints(count,random){return Array.from({length:count},()=>{const x=random()*2-1,y=random()*2-1;return{x,y,inside:x*x+y*y<=1};});}
