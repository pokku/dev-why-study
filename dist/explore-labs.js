import { exploreLabs } from './explore-catalog.js';
import { woundSignal,aliasFrequency,slitIntensity,flux,emf,lensImage,seededRandom,piPoints } from './explore-models.js';
const TAU=2*Math.PI;
export function createExploreLab(id,nodesById){
 const lab=exploreLabs.find(l=>l.id===id),element=document.createElement('article');element.className='string-lab science-lab radio-lab explore-lab';
 element.innerHTML=`<a class="lab-back" href="#labs">← 体験一覧へ</a><header class="lab-heading"><p class="micro-label">${lab.category}</p><h1>${lab.title}</h1><p>${lab.question}</p></header><div class="science-workbench"><section class="science-stage"><canvas width="1440" height="960" role="img" aria-label="${lab.title}。結果は図の下にも文章で表示します。"></canvas><p class="science-reading" data-reading></p></section><section class="lab-controls"><div data-controls></div><div class="science-actions" data-actions></div><p role="status" data-status>設定を変えて、図と数式を比べてみよう。</p></section></div><section class="lab-discovery"><span class="micro-label">気づくヒント</span><h2>${lab.lesson}</h2><p>${lab.everyday}</p></section><section class="lab-equation"><div class="radio-formulas"><section><h3>仕組みを表す数式</h3><div class="radio-math-scroll"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow>${lab.formula}</mrow></math></div><p data-result></p></section><details class="radio-model-details"><summary>記号の意味と実験の条件</summary><p>${lab.limit}</p></details></div><div class="lab-school"><h2>学校の勉強へつなげる</h2><div data-links></div></div></section>`;
 const $=s=>element.querySelector(s),ctx=$('canvas').getContext('2d'),status=$('[data-status]');
 if(!ctx){status.textContent='このブラウザでは図を表示できません。';return{element,dispose(){}};}ctx.scale(2,2);
 const values={},inputs=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let disposed=false,running=false,frame=0,last=0,elapsed=0,ended=false,playButton;
 let points=[],total=0,inside=0,history=[],random=seededRandom();
 for(const[key,label,min,max,step,value,unit]of lab.controls){values[key]=value;const box=document.createElement('div');box.innerHTML=`<label for="explore-${key}">${label}<output for="explore-${key}">${value}${unit}</output></label><input id="explore-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;const input=box.querySelector('input');inputs.set(key,input);input.addEventListener('input',()=>{values[key]=Number(input.value);box.querySelector('output').textContent=`${Number(values[key].toFixed(2))}${unit}`;ended=false;render();});$('[data-controls]').append(box);}
 for(const nodeId of lab.nodes){const a=document.createElement('a');a.href=`#node=${nodeId}`;a.textContent=nodesById.get(nodeId).name;$('[data-links]').append(a);}
 function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);$('[data-actions]').append(b);return b;}
 function set(key,value){inputs.get(key).value=value;inputs.get(key).dispatchEvent(new Event('input'));}
 function addPoints(count){const batch=piPoints(Math.min(count,50000-total),random);total+=batch.length;inside+=batch.filter(p=>p.inside).length;points=points.concat(batch).slice(-3000);if(total)history.push({n:total,estimate:4*inside/total});if(total>=50000){pause();status.textContent='5万点で停止しました。最初からで別の試行を試せます。';}}
 if(id==='winding'){button('3Hzを見つける',()=>set('frequency',3));button('5Hzを見つける',()=>set('frequency',5));button('間の4Hz',()=>set('frequency',4));}
 if(id==='sampling'){button('点が少ない',()=>{set('frequency',3);set('rate',4);});button('十分な回数',()=>{set('frequency',3);set('rate',12);});}
 if(id==='double-slit'){button('紫の光',()=>set('lambda',400));button('緑の光',()=>set('lambda',550));button('赤い光',()=>set('lambda',700));}
 if(id==='lens'){button('ピントを合わせる',()=>{const b=lensImage(values.focal,values.object);if(b>=5&&b<=100){set('screen',b);status.textContent='スクリーンを計算上の結像位置に合わせました。';}else status.textContent='今の物体位置では、5〜100cmのスクリーン上に結像しません。物体距離を変えてみよう。';});button('虚像を見る',()=>{set('focal',20);set('object',10);});button('焦点に置く',()=>set('object',values.focal));}
 if(id==='induction'||id==='monte-carlo'){
  playButton=button('▶ 動かす',()=>{if(running)pause();else if(reduced.matches){advance(.1);render();status.textContent='動きを減らす設定に合わせて1コマ進めました。';}else{running=true;last=performance.now();playButton.textContent='Ⅱ 一時停止';frame=requestAnimationFrame(tick);}});
  button('1コマ進める',()=>{pause();advance(.1);render();});button('最初から',()=>{pause();ended=false;if(id==='induction')set('position',-1.5);else{points=[];history=[];total=inside=0;random=seededRandom(Math.floor(Math.random()*4294967296));}render();status.textContent='初期化しました。';});
 }
 if(id==='induction'){button('磁石を止める',()=>{pause();set('velocity',0);});button('進む向きを逆に',()=>set('velocity',values.velocity===0?1:-values.velocity));}
 if(id==='monte-carlo'){button('100点落とす',()=>{addPoints(100);render();});button('1000点落とす',()=>{addPoints(1000);render();});}
 function pause(){running=false;cancelAnimationFrame(frame);if(playButton)playButton.textContent='▶ 動かす';}
 function advance(dt){if(id==='induction'){values.position=Math.max(-3,Math.min(3,values.position+values.velocity*dt));inputs.get('position').value=values.position;element.querySelector('output[for="explore-position"]').textContent=values.position.toFixed(2);if(Math.abs(values.position)>=3){ended=true;pause();status.textContent='端で停止しました。向きか位置を変えて再開できます。';}}else{elapsed+=dt;if(elapsed>=.1){addPoints(100);elapsed=0;}}}
 function tick(now){if(!running||disposed)return;advance(Math.min(.05,(now-last)/1000));last=now;render();if(running)frame=requestAnimationFrame(tick);}
 function text(s,x,y,color='#dceafa',size=17){ctx.fillStyle=color;ctx.font=`${size}px sans-serif`;ctx.fillText(s,x,y);}
 function path(points,color,width=2){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
 function dot(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=color;ctx.fill();}
 function curve(fn,left,top,width,height,color){path(Array.from({length:601},(_,i)=>[left+i/600*width,top-height*fn(i/600)]),color);}
 function result(s){$('[data-reading]').textContent=s;$('[data-result]').textContent=s;}
 function render(){ctx.fillStyle='#0c192b';ctx.fillRect(0,0,720,480);
  if(id==='winding'){
   text('元の波：3Hz ＋ 半分の大きさの5Hz',24,30);curve(t=>Math.cos(TAU*3*t*4)+.5*Math.cos(TAU*5*t*4),30,95,660,28,'#6fd5ff');
   const {points:wrapped,center}=woundSignal(values.frequency);dot(240,310,2,'#fff');path([[65,310],[415,310]],'#30455f',1);path([[240,150],[240,465]],'#30455f',1);path(wrapped.map(p=>[240+p.x*95,310-p.y*95]),'#70d9c2',1.4);path([[240,310],[240+center.x*95,310-center.y*95]],'#ffca7c',3);dot(240+center.x*95,310-center.y*95,6,'#ffca7c');
   text('緑：巻いた波',455,230,'#70d9c2');text('橙：点の平均',455,265,'#ffca7c');text(`中心から ${Math.hypot(center.x,center.y).toFixed(3)}`,455,315,'#ffca7c',22);
   result(`巻く速さ${values.frequency}Hz。点の平均の大きさ${Math.hypot(center.x,center.y).toFixed(3)}。3Hzなら0.5、5Hzなら0.25、4Hzではほぼ0。4秒間の波を一周ずつではなく時間に沿って巻いています。`);
  }else if(id==='sampling'){
   const f=values.frequency,fs=values.rate,alias=aliasFrequency(f,fs);text('青：元の波　橙：同じ点を通る低周波の候補',24,40);curve(t=>Math.cos(TAU*f*t*2),30,180,660,90,'#64c6ff');curve(t=>Math.cos(TAU*alias*t*2),30,180,660,90,'#ffca7c');
   for(let n=0;n<=fs*2;n++){const x=30+n/(fs*2)*660,y=180-90*Math.cos(TAU*f*n/fs);path([[x,290],[x,y]],'#425469',1);dot(x,y,4,'#ffffff');}
   text(`元は ${f}Hz`,40,360,'#64c6ff',26);text(`候補は ${alias.toFixed(2)}Hz`,355,360,'#ffca7c',26);text(`1秒に${fs}点 / 表示は2秒`,40,420);
   result(`${fs}回/秒で${f}Hzを読む。${fs>2*f?'この単音の周波数に対し、2倍を超える回数です。':fs===2*f?'ちょうど2倍では、一般の位相まで一意には決まりません。':'読む回数が不足しています。'}点だけを見ると${alias.toFixed(2)}Hzの候補とも区別できません。`);
  }else if(id==='double-slit'){
   const lambda=values.lambda*1e-9,d=values.gap*1e-3,L=values.distance,spacing=lambda*L/d*1000,hue=270-(values.lambda-400)*.9;
   text('スクリーンにできる明暗（中央 ±10mm）',24,38);
   for(let i=0;i<660;i++){const y=(i/659-.5)*.02,intensity=slitIntensity(y,lambda,d,L);ctx.fillStyle=`hsl(${hue} 90% ${3+intensity*60}%)`;ctx.fillRect(30+i,80,1,140);}
   curve(t=>slitIntensity((t-.5)*.02,lambda,d,L),30,375,660,100,'#e8eef7');text('−10mm',30,411);text('0',350,411);text('＋10mm',610,411);text('明るさの分布',30,260);
   result(`波長${values.lambda}nm、隙間の間隔${values.gap}mm、距離${L}m。明るい縞の間隔は約${spacing.toFixed(2)}mm。隙間を広げると、縞は細かくなります。`);
  }else if(id==='induction'){
   const x=values.position,v=ended?0:values.velocity,voltage=emf(x,v,values.turns);text('磁石とコイル（位置・電圧は相対量）',24,35);
   for(let i=0;i<values.turns;i++){ctx.beginPath();ctx.ellipse(340+i*4,175,14,62,0,0,TAU);ctx.strokeStyle='#e6b171';ctx.lineWidth=3;ctx.stroke();}
   const mx=350+x*85;ctx.fillStyle='#f4848d';ctx.fillRect(mx-36,158,36,32);ctx.fillStyle='#71bfff';ctx.fillRect(mx,158,36,32);text('N',mx-26,180,'#162336');text('S',mx+9,180,'#162336');
   text(`磁束 Φ = ${flux(x).toFixed(3)}`,30,275);text(`電圧 ε = ${voltage.toFixed(3)}`,370,275,'#77e3c7',24);
   path([[80,350],[640,350]],'#627990',2);const offset=Math.max(-1,Math.min(1,voltage/18))*260;path([[360,315],[360+offset,350]],'#77e3c7',4);text('−',75,382);text('0',353,382);text('＋',630,382);
   result(`位置${x.toFixed(2)}、速度${v.toFixed(1)}、${values.turns}巻。電圧は${voltage.toFixed(3)}（相対値）。${v===0?'磁石が止まっているので磁束は変化せず、電圧は0です。':'今の位置を指定した速さで通る瞬間の値。中央の前後で電圧の符号も変わります。'}`);
  }else if(id==='lens'){
   const f=values.focal,a=values.object,b=lensImage(f,a),s=values.screen,scale=Math.min(3,250/Math.max(a,Number.isFinite(b)?Math.abs(b):100,s)),cx=330,cy=220,ox=cx-a*scale,h=Number.isFinite(b)?Math.min(40,85*a/Math.abs(b)):40;
   text('黄：物体　青：レンズ　緑：像　白：スクリーン',20,30,undefined,16);path([[25,cy],[695,cy]],'#64738b',1);path([[cx,115],[cx,320]],'#72c8ff',5);path([[cx+s*scale,125],[cx+s*scale,310]],'#ffffff',2);
   const arrow=(x,y,color)=>{path([[x,cy],[x,y]],color,3);path([[x-6,y+(y<cy?8:-8)],[x,y],[x+6,y+(y<cy?8:-8)]],color,2);};arrow(ox,cy-h,'#ffca7c');
   for(const sign of [-1,1]){dot(cx+sign*f*scale,cy,3,'#fff');text('F',cx+sign*f*scale-4,cy+20);}
   ctx.save();ctx.beginPath();ctx.rect(20,50,680,275);ctx.clip();
   path([[ox,cy-h],[cx,cy-h],[695,cy-h+h*(695-cx)/(f*scale)]],'#f3a66b',1);
   path([[ox,cy-h],[cx,cy],[695,cy+h*(695-cx)/(a*scale)]],'#b6a0ef',1);
   if(Number.isFinite(b)){const ix=cx+b*scale,iy=cy+h*b/a;ctx.save();ctx.beginPath();ctx.rect(20,50,680,275);ctx.clip();arrow(ix,iy,'#77e3c7');if(b<0){ctx.setLineDash([5,5]);path([[ix,iy],[cx,cy-h]],'#f3a66b',1);path([[ix,iy],[cx,cy]],'#b6a0ef',1);}ctx.restore();}
   ctx.restore();text('スクリーンでの像（ぼけは模式表示）',24,355);if(b>0&&Number.isFinite(b)){ctx.save();ctx.filter=`blur(${Math.min(18,Math.abs(1-s/b)*14)}px)`;path([[550,382],[550,451],[539,439],[550,451],[561,439]],'#77e3c7',5);ctx.restore();}else text('この位置関係では結像しません',330,421,'#ffca7c',18);
   result(!Number.isFinite(b)?'物体が焦点上にあるため、出ていく光は平行。像は無限遠です。':b<0?`像距離${b.toFixed(2)}cm。物体と同じ側に正立の虚像ができ、スクリーンには映りません。`:`像距離${b.toFixed(2)}cm、倍率${(-b/a).toFixed(2)}（倒立）。スクリーンは${s.toFixed(2)}cm。${Math.abs(s-b)<.05?'ピントが合っています。':'スクリーンを像距離に合わせてみよう。'}`);
  }else{
   const left=35,top=65,size=340;ctx.strokeStyle='#a9bbcf';ctx.strokeRect(left,top,size,size);ctx.beginPath();ctx.arc(left+size/2,top+size/2,size/2,0,TAU);ctx.stroke();for(const p of points)dot(left+(p.x+1)*size/2,top+(p.y+1)*size/2,1.5,p.inside?'#72d9bf':'#f5a1a0');
   text('緑：円の中　桃：円の外',30,35);text(`${total.toLocaleString()} 点`,410,90,'#eaf3ff',25);text(total?`π ≈ ${(4*inside/total).toFixed(5)}`:'点を落としてみよう',410,145,'#77e3c7',24);text(`円の中 ${inside.toLocaleString()} 点`,410,190);
   path([[410,325],[690,325]],'#617994',1);text('3.14159…',410,350,'#a1b5c8',14);if(history.length>1)path(history.map(p=>[410+p.n/total*280,325-Math.max(-1,Math.min(1,p.estimate-Math.PI))*70]),'#ffca7c',2);
   text('推定値の変化（上下±1）',410,390,undefined,15);
   result(total?`4 × ${inside} ÷ ${total} = ${(4*inside/total).toFixed(6)}。πとの差は${Math.abs(4*inside/total-Math.PI).toFixed(6)}。点を増やすと誤差は一般に小さくなりますが、毎回改善するとは限りません。図は直近${points.length}点です。`:'半径1の円の面積はπ、正方形の面積は4。点が円に入る割合からπを推定します。');
  }
 }
 const hidden=()=>{if(document.hidden)pause();},change=()=>{if(reduced.matches)pause();};document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',pause);reduced.addEventListener('change',change);render();
 return{element,dispose(){disposed=true;pause();document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',pause);reduced.removeEventListener('change',change);}};
}
