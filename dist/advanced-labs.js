import { advancedLabs } from './advanced-catalog.js';
import { gpsSatellites,pseudoranges,solveGps,hammingEncode,hammingDecode,hammingCheck,smallPrimes,rsaKeys,modPow,factorByTrial,letterCode,codeLetter,findPath,makeDataset,createNetwork,trainStep,lossOf,accuracyOf,predict,pageGraphs,pageRank } from './advanced-models.js';
const TAU=2*Math.PI;
const GRID_W=24,GRID_H=14,START=[2,7],GOAL=[21,6];
const mazes={
 wall:[...Array.from({length:11},(_,y)=>y*GRID_W+11)],
 cup:[...Array.from({length:9},(_,i)=>(3+i)*GRID_W+15),...Array.from({length:6},(_,i)=>3*GRID_W+9+i),...Array.from({length:6},(_,i)=>11*GRID_W+9+i)],
 maze:[...Array.from({length:10},(_,y)=>y*GRID_W+6),...Array.from({length:10},(_,y)=>(y+4)*GRID_W+12),...Array.from({length:10},(_,y)=>y*GRID_W+17)],
};
export function createAdvancedLab(id,nodesById){
 const lab=advancedLabs.find(l=>l.id===id),element=document.createElement('article');element.className='string-lab science-lab radio-lab explore-lab advanced-lab';
 element.innerHTML=`<a class="lab-back" href="#labs">← 体験一覧へ</a><header class="lab-heading"><p class="micro-label">${lab.category}</p><h1>${lab.title}</h1><p>${lab.question}</p></header><div class="science-workbench"><section class="science-stage"><canvas width="1440" height="960" role="img" aria-label="${lab.title}。結果は図の下にも文章で表示します。"></canvas><p class="science-reading" data-reading></p></section><section class="lab-controls"><div data-controls></div><div class="advanced-extra" data-extra></div><div class="science-actions" data-actions></div><p role="status" data-status>設定を変えて、図と数式を比べてみよう。</p></section></div><section class="lab-discovery"><span class="micro-label">気づくヒント</span><h2>${lab.lesson}</h2><p>${lab.everyday}</p></section><section class="lab-equation"><div class="radio-formulas"><section><h3>仕組みを表す数式</h3><div class="radio-math-scroll"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow>${lab.formula}</mrow></math></div><p data-result></p></section><details class="radio-model-details"><summary>記号の意味と実験の条件</summary><p>${lab.limit}</p></details></div><div class="lab-school"><h2>学校の勉強へつなげる</h2><div data-links></div></div></section>`;
 const $=s=>element.querySelector(s),canvas=$('canvas'),ctx=canvas.getContext('2d'),status=$('[data-status]'),extra=$('[data-extra]');
 if(!ctx){status.textContent='このブラウザでは図を表示できません。';return{element,dispose(){}};}ctx.scale(2,2);
 const values={},inputs=new Map(),outputs=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const format={p:v=>`${smallPrimes[v]}`,q:v=>`${smallPrimes[v]}`};
 let disposed=false,running=false,frame=0,playButton;
 for(const[key,label,min,max,step,value,unit]of lab.controls){values[key]=value;const box=document.createElement('div');box.innerHTML=`<label for="adv-${key}">${label}<output for="adv-${key}"></output></label><input id="adv-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;const input=box.querySelector('input'),out=box.querySelector('output');inputs.set(key,input);outputs.set(key,()=>{out.textContent=format[key]?format[key](values[key]):`${Number(values[key].toFixed(2))}${unit}`;});outputs.get(key)();input.addEventListener('input',()=>{values[key]=Number(input.value);outputs.get(key)();changed(key);render();});$('[data-controls]').append(box);}
 for(const nodeId of lab.nodes){const a=document.createElement('a');a.href=`#node=${nodeId}`;a.textContent=nodesById.get(nodeId).name;$('[data-links]').append(a);}
 function button(label,fn,parent=$('[data-actions]')){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);parent.append(b);return b;}
 function set(key,value){values[key]=value;inputs.get(key).value=value;outputs.get(key)();}
 function text(s,x,y,color='#dceafa',size=16,align='left'){ctx.fillStyle=color;ctx.font=`${size}px sans-serif`;ctx.textAlign=align;ctx.fillText(s,x,y);ctx.textAlign='left';}
 function path(points,color,width=2,dash=[]){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.setLineDash(dash);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.setLineDash([]);}
 function dot(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=color;ctx.fill();}
 function ring(x,y,r,color,width=1.5,dash=[]){ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,TAU);ctx.setLineDash(dash);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.setLineDash([]);}
 function result(s){$('[data-reading]').textContent=s;$('[data-result]').textContent=s;}
 function pause(){running=false;cancelAnimationFrame(frame);if(playButton)playButton.textContent=playLabel;}
 let playLabel='▶ 動かす',advance=()=>false;
 function play(label,step){playLabel=label;advance=step;playButton=button(label,()=>{if(running)return pause();if(reduced.matches){advance();render();status.textContent='動きを減らす設定に合わせて1コマ進めました。';return;}running=true;playButton.textContent='Ⅱ 一時停止';const tick=()=>{if(!running||disposed)return;const more=advance();render();if(more===false){pause();return;}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);});}
 let changed=()=>{};

 // ---------- GPS ----------
 let withClock=true,gpsSeed=7;
 const gx=x=>360+x*20,gy=y=>405-y*20;
 function renderGps(){
  const truth=[values.rx,0],sats=gpsSatellites.slice(0,values.count),ranges=pseudoranges(truth,values.count,values.clock,values.noise,gpsSeed);
  const steps=solveGps(sats,ranges,{withClock}),shown=steps[Math.min(values.iter,steps.length-1)],err=Math.hypot(shown.x-truth[0],shown.y-truth[1]);
  path([[20,gy(0)],[700,gy(0)]],'#44607a',1);text('地面',24,gy(0)-8,'#7f97ad',13);
  ctx.save();ctx.beginPath();ctx.rect(0,0,720,480);ctx.clip();
  sats.forEach(([sx,sy],i)=>{ring(gx(sx),gy(sy),ranges[i]*20,'#ffca7c55',1.5);if(withClock&&values.iter>0)ring(gx(sx),gy(sy),(ranges[i]-shown.b)*20,'#77e3c7aa',1.2,[5,4]);});
  ctx.restore();
  sats.forEach(([sx,sy],i)=>{dot(gx(sx),gy(sy),7,'#ffca7c');text(`衛星${i+1}`,gx(sx)+10,gy(sy)-8,'#ffca7c',13);});
  path(steps.slice(0,values.iter+1).map(s=>[gx(s.x),gy(s.y)]),'#b6a0ef',2);steps.slice(0,values.iter+1).forEach(s=>dot(gx(s.x),gy(s.y),3,'#b6a0ef'));
  path([[gx(truth[0])-8,gy(0)-8],[gx(truth[0])+8,gy(0)+8]],'#fff',2.5);path([[gx(truth[0])-8,gy(0)+8],[gx(truth[0])+8,gy(0)-8]],'#fff',2.5);
  dot(gx(shown.x),gy(shown.y),7,'#77e3c7');
  text('橙の円：測った距離　緑の破線：時計のずれを引いた距離',20,26,'#dceafa',14);text('白×：本当の位置　緑●：推定位置　紫：解き直しの道のり',20,48,'#dceafa',14);
  text(`誤差 ${err.toFixed(3)}`,560,440,'#77e3c7',20);text(withClock?`推定した時計のずれ b = ${shown.b.toFixed(3)}`:'時計のずれを無視して解いています',20,470,withClock?'#77e3c7':'#f5a1a0',15);
  const unknowns=withClock?3:2,exact=values.count===unknowns;
  result(`衛星${values.count}機・未知数${unknowns}個（${withClock?'x, y, 時計のずれb':'x, yだけ'}）。${values.iter}回解き直した推定位置は(${shown.x.toFixed(2)}, ${shown.y.toFixed(2)})、本当の位置(${truth[0]}, 0)との誤差${err.toFixed(3)}。${withClock?`時計のずれの推定${shown.b.toFixed(3)}（本当は${values.clock}）。`:values.clock>0?'時計のずれを未知数に入れていないので、すべての距離が長すぎるまま無理に合わせています。':''}残差の大きさ${shown.rms.toFixed(3)}。${exact?'衛星の数と未知数が同じなので、誤差があっても式をぴったり満たしてしまい、誤差の有無を見分けられません。':'式が未知数より多いので、測定誤差を平均的にならす「最小二乗」の答えになります。'}`);
 }

 // ---------- Hamming ----------
 let message=[1,0,1,1],received=hammingEncode(message);
 const hamBits=document.createElement('div');
 function hamControls(){
  hamBits.replaceChildren();hamBits.className='bit-panel';
  const sent=hammingEncode(message);
  const row=(title,bits,onClick,cls)=>{const wrap=document.createElement('div');wrap.className='bit-row';const h=document.createElement('p');h.textContent=title;wrap.append(h);const list=document.createElement('div');list.className='bit-list';bits.forEach((b,i)=>{const btn=document.createElement('button');btn.type='button';btn.className=`bit ${cls(i)}`;btn.textContent=b;btn.setAttribute('aria-label',`${cls(i).includes('parity')?'検査':'情報'}ビット${i+1}: ${b}`);btn.addEventListener('click',()=>{onClick(i);hamControls();render();});const idx=document.createElement('small');idx.textContent=cls===dataClass?`d${i+1}`:String(i+1);const cell=document.createElement('span');cell.append(btn,idx);list.append(cell);});wrap.append(list);return wrap;};
  const dataClass=()=> 'is-data';
  hamBits.append(row('送りたい4ビット（押すと切り替え）',message,i=>{message[i]^=1;received=hammingEncode(message);status.textContent='新しい4ビットから7ビットを作り直しました。';},dataClass));
  hamBits.append(row('届いた7ビット（押すと途中で壊す）',received,i=>{received[i]^=1;status.textContent=`${i+1}番目を反転しました。`;},i=>`${[0,1,3].includes(i)?'is-parity':'is-data'}${received[i]!==sent[i]?' is-flipped':''}`));
 }
 const venn=[{x:215,y:185,label:'円A（1・3・5・7番）',color:'#6fd5ff'},{x:315,y:185,label:'円B（2・3・6・7番）',color:'#ffca7c'},{x:265,y:270,label:'円C（4・5・6・7番）',color:'#b6a0ef'}];
 const regions=[[150,160],[380,160],[265,140],[265,345],[210,262],[320,262],[265,215]];
 function renderHamming(){
  const sent=hammingEncode(message),{syndrome,fixed,data}=hammingDecode(received),errors=received.map((b,i)=>b!==sent[i]?i+1:0).filter(Boolean);
  const bad=hammingCheck.map(row=>row.reduce((a,h,i)=>a^(h&received[i]),0));
  venn.forEach((c,i)=>{ctx.beginPath();ctx.arc(c.x,c.y,105,0,TAU);ctx.fillStyle=bad[i]?'#ff6b7a22':'#ffffff06';ctx.fill();ring(c.x,c.y,105,bad[i]?'#ff8a95':c.color,bad[i]?3:1.5);});
  regions.forEach(([x,y],i)=>{const flipped=received[i]!==sent[i];ctx.fillStyle=flipped?'#ff8a95':[0,1,3].includes(i)?'#2f4a66':'#1d3a38';ctx.beginPath();ctx.arc(x,y,20,0,TAU);ctx.fill();text(String(received[i]),x,y+7,'#fff',20,'center');text(`${i+1}`,x+22,y-14,'#9fb4c8',11);});
  text('円の中の1の個数が奇数なら赤',20,28,'#dceafa',14);
  const px=470;text('検査の結果',px,70,'#dceafa',17);
  ['A','B','C'].forEach((n,i)=>text(`円${n}：${bad[i]?'奇数 → 1':'偶数 → 0'}`,px,110+i*30,bad[i]?'#ff8a95':'#77e3c7',16));
  text(`CBAを2進数で読む：${bad[2]}${bad[1]}${bad[0]}₂ = ${syndrome}`,px,215,'#ffca7c',17);
  text(syndrome?`→ ${syndrome}番目を反転して直す`:'→ 誤りは見つからない',px,245,'#ffca7c',16);
  text(`直した7ビット：${fixed.join('')}`,px,295,'#dceafa',15);text(`取り出した4ビット：${data.join('')}`,px,322,'#dceafa',15);
  const ok=data.every((b,i)=>b===message[i]);text(ok?'送った4ビットと一致 ✓':'送った4ビットと違う ✗',px,360,ok?'#77e3c7':'#ff8a95',19);
  text(`送った4ビット：${message.join('')}`,px,395,'#9fb4c8',14);
  result(`送った7ビット${sent.join('')}、届いた7ビット${received.join('')}（壊れた位置：${errors.length?errors.join('・')+'番目':'なし'}）。3つの円の偶奇を並べた症状は${syndrome}。${!errors.length?'誤りなしなので症状は0。':errors.length===1?`1か所の誤りなので、症状がそのまま壊れた位置${errors[0]}を指し、正しく直せます。`:ok?'複数の誤りですが、今回は取り出した4ビットが偶然一致しました。':`${errors.length}か所の誤りは、この符号の訂正能力を超えています。${syndrome?`症状は${syndrome}番目を指すので、正しいビットを反転してしまいました。`:'症状が0になり、誤りに気づけません。'}`}`);
 }

 // ---------- RSA ----------
 let word='WHY',cracked=null;
 function renderRsa(){
  if(values.p===values.q){set('q',(values.q+1)%smallPrimes.length);status.textContent='pとqは違う素数にする必要があるので、qを次の素数にしました。';}
  const k=rsaKeys(smallPrimes[values.p],smallPrimes[values.q]),letters=[...word].map(ch=>{const m=letterCode(ch),c=modPow(m,k.e,k.n);return{ch,m,c,back:modPow(c,k.d,k.n)};});
  text('① 秘密に作る',24,36,'#ffca7c',15);text(`p = ${k.p}　q = ${k.q}`,24,64,'#ffca7c',20);
  text('② みんなに公開する鍵',24,108,'#6fd5ff',15);text(`n = p × q = ${k.n}　e = ${k.e}`,24,136,'#6fd5ff',20);
  text('③ 自分だけが持つ鍵',24,180,'#77e3c7',15);text(`(p−1)(q−1) = ${k.phi}　d = ${k.d}`,24,208,'#77e3c7',20);text(`e × d = ${k.e*k.d} = ${k.phi} × ${Math.floor(k.e*k.d/k.phi)} + 1`,24,232,'#9fb4c8',13);
  text('④ 送る',24,276,'#dceafa',15);
  letters.forEach((l,i)=>{const y=305+i*30;text(`${l.ch} = ${l.m}`,24,y,'#dceafa',17);text(`→ ${l.m}^${k.e} mod ${k.n} = ${l.c}`,110,y,'#6fd5ff',17);text(`→ ${l.c}^d mod n = ${l.back} = ${codeLetter(l.back)}`,385,y,'#77e3c7',17);});
  const attacker=440;path([[430,24],[430,250]],'#30455f',1);
  text('盗み見る人に見えるもの',attacker+10,36,'#f5a1a0',15);text(`n = ${k.n}, e = ${k.e}`,attacker+10,64,'#f5a1a0',18);text(`暗号 ${letters.map(l=>l.c).join(' ')}`,attacker+10,92,'#f5a1a0',15);
  if(cracked){text(`試し割り${cracked.tries}回で`,attacker+10,136,'#ffca7c',16);text(`${k.n} = ${cracked.p} × ${cracked.q}`,attacker+10,162,'#ffca7c',18);text('→ dも計算できてしまう',attacker+10,188,'#ffca7c',15);}
  else text('「鍵を破ってみる」で試す',attacker+10,136,'#9fb4c8',14);
  text('実際のnは約617桁。試し割りでは',attacker+10,222,'#9fb4c8',12);text('宇宙の寿命でも終わらない回数',attacker+10,240,'#9fb4c8',12);
  result(`公開鍵(n=${k.n}, e=${k.e})で「${word}」を暗号化すると${letters.map(l=>l.c).join('・')}。秘密鍵d=${k.d}で戻すと${letters.map(l=>codeLetter(l.back)).join('')}。dを求めるには(p−1)(q−1)=${k.phi}が必要で、それにはnをpとqに分ける必要があります。${cracked?`この大きさなら試し割り${cracked.tries}回で分解できてしまいます。`:''}${new Set(word).size<word.length?' 同じ文字は同じ暗号になってしまうので、実用ではパディングで乱数を混ぜ、毎回違う暗号にします。':''}`);
 }

 // ---------- Pathfinding ----------
 let walls=[...mazes.wall],shownCount=Infinity;
 const cell=28,ox=24,oy=58;
 const pf=()=>findPath(GRID_W,GRID_H,walls,START,GOAL,values.weight);
 function renderPath(){
  const r=pf(),dijkstra=findPath(GRID_W,GRID_H,walls,START,GOAL,0),visible=Math.min(shownCount,r.order.length),done=visible>=r.order.length;
  const seen=new Map(r.order.slice(0,visible).map(([x,y],i)=>[y*GRID_W+x,i]));
  for(let y=0;y<GRID_H;y++)for(let x=0;x<GRID_W;x++){const k=y*GRID_W+x;ctx.fillStyle=walls.includes(k)?'#8193a8':seen.has(k)?`hsl(${190+seen.get(k)/Math.max(1,r.order.length)*80} 55% ${24+10*(1-seen.get(k)/Math.max(1,r.order.length))}%)`:'#13253b';ctx.fillRect(ox+x*cell+1,oy+y*cell+1,cell-2,cell-2);}
  if(done&&r.path.length)path(r.path.map(([x,y])=>[ox+x*cell+cell/2,oy+y*cell+cell/2]),'#ffca7c',4);
  for(const[[x,y],label,color]of[[START,'S','#77e3c7'],[GOAL,'G','#ff8a95']]){dot(ox+x*cell+cell/2,oy+y*cell+cell/2,11,color);text(label,ox+x*cell+cell/2,oy+y*cell+cell/2+6,'#102033',15,'center');}
  text(`調べたマス ${visible}${done?'':' …'}`,24,30,'#dceafa',17);text(done?(r.path.length?`道の長さ ${r.cost.toFixed(2)}`:'道がありません'):'探索中',250,30,'#ffca7c',17);text(`比較：ダイクストラ法は${dijkstra.order.length}マス・長さ${Number.isFinite(dijkstra.cost)?dijkstra.cost.toFixed(2):'—'}`,420,30,'#9fb4c8',13);
  text('マスを押すと壁を置く・消す',24,470,'#9fb4c8',13);
  const w=values.weight,name=w===0?'ダイクストラ法':w===1?'A*探索':w<1?'見積もりを弱めたA*':'重み付きA*';
  result(`${name}（w=${w}）。調べたマス${r.order.length}、道の長さ${Number.isFinite(r.cost)?r.cost.toFixed(2):'なし'}。ダイクストラ法は${dijkstra.order.length}マスを調べて長さ${Number.isFinite(dijkstra.cost)?dijkstra.cost.toFixed(2):'なし'}。${!Number.isFinite(r.cost)?'壁で完全にふさがれています。':Math.abs(r.cost-dijkstra.cost)<1e-9?'最短の長さは同じです。':`最短より${(r.cost-dijkstra.cost).toFixed(2)}長い道になりました。見積もりを実際より大きく扱うと、最短の保証がなくなります。`}`);
  return done;
 }
 function onCanvasClick(event){
  if(id!=='pathfinding')return;const box=canvas.getBoundingClientRect(),x=Math.floor(((event.clientX-box.left)/box.width*720-ox)/cell),y=Math.floor(((event.clientY-box.top)/box.height*480-oy)/cell);
  if(x<0||y<0||x>=GRID_W||y>=GRID_H||(x===START[0]&&y===START[1])||(x===GOAL[0]&&y===GOAL[1]))return;
  const k=y*GRID_W+x;walls=walls.includes(k)?walls.filter(v=>v!==k):[...walls,k];pause();shownCount=Infinity;render();
 }

 // ---------- Neural network ----------
 let datasetName='circle',data=makeDataset('circle'),net=createNetwork(values.hidden||0),epoch=0,losses=[];
 function resetNet(){net=createNetwork(values.hidden);epoch=0;losses=[lossOf(net,data)];}
 function renderNeural(){
  const size=360,left=20,top=60,res=36,px=size/res;
  for(let i=0;i<res;i++)for(let j=0;j<res;j++){const x=-1+(i+.5)*2/res,y=1-(j+.5)*2/res,p=predict(net,x,y);ctx.fillStyle=`rgb(${Math.round(240-160*p)},${Math.round(150+20*p)},${Math.round(150+100*p)})`;ctx.globalAlpha=.55;ctx.fillRect(left+i*px,top+j*px,px+.5,px+.5);}
  ctx.globalAlpha=1;
  for(const p of data){const x=left+(p.x+1)/2*size,y=top+(1-p.y)/2*size;dot(x,y,5,'#0c192b');dot(x,y,3.6,p.label?'#3f8cff':'#ff7a6b');}
  ctx.strokeStyle='#a9bbcf';ctx.lineWidth=1;ctx.strokeRect(left,top,size,size);
  text('背景：予測（青いほど「青の点」）',20,30,'#dceafa',14);
  const acc=accuracyOf(net,data),loss=losses.at(-1);
  const gx0=410,gy0=70,gw=290,gh=140,maxLoss=Math.max(.8,...losses);
  path([[gx0,gy0+gh],[gx0+gw,gy0+gh]],'#51667e',1);path([[gx0,gy0],[gx0,gy0+gh]],'#51667e',1);
  if(losses.length>1)path(losses.map((l,i)=>[gx0+i/(losses.length-1)*gw,gy0+gh-l/maxLoss*gh]),'#ffca7c',2);
  text('誤差 L の変化',gx0,gy0-12,'#ffca7c',14);text(`学習 ${epoch} 回`,gx0,gy0+gh+26,'#dceafa',16);text(`誤差 ${loss.toFixed(3)}`,gx0,gy0+gh+52,'#ffca7c',18);text(`正解率 ${(acc*100).toFixed(1)}%`,gx0+150,gy0+gh+52,'#77e3c7',18);
  // network diagram
  const H=values.hidden,ny=y=>y,inX=430,midX=555,outX=680,top2=330,span=120;
  const ins=[top2+30,top2+span-30].map(ny),mids=H?Array.from({length:H},(_,j)=>top2+(H===1?span/2:j*span/(H-1))):[],out=top2+span/2;
  if(H){mids.forEach((my,j)=>{ins.forEach((iy,i)=>{const w=net.w1[j][i];path([[inX,iy],[midX,my]],w>0?'#3f8cff':'#ff7a6b',Math.min(4,.4+Math.abs(w)*.8));});const w=net.w2[j];path([[midX,my],[outX,out]],w>0?'#3f8cff':'#ff7a6b',Math.min(4,.4+Math.abs(w)*.6));});mids.forEach(my=>dot(midX,my,7,'#dceafa'));}
  else ins.forEach((iy,i)=>path([[inX,iy],[outX,out]],net.w[i]>0?'#3f8cff':'#ff7a6b',Math.min(4,.4+Math.abs(net.w[i])*.8)));
  ins.forEach((iy,i)=>{dot(inX,iy,8,'#9fb4c8');text(i?'y':'x',inX-22,iy+5,'#9fb4c8',14);});dot(outX,out,9,'#77e3c7');text('入力',inX-16,top2+span+26,'#9fb4c8',12);if(H)text('中間層',midX-18,top2+span+26,'#9fb4c8',12);text('出力',outX-14,top2+span+26,'#9fb4c8',12);
  const names={line:'直線で分かれる',circle:'円の内と外',xor:'市松（XOR）'};
  result(`データ「${names[datasetName]}」、中間層${H}個、学習率${values.rate}。${epoch}回学習して誤差${loss.toFixed(3)}、正解率${(acc*100).toFixed(1)}%。${!H&&datasetName!=='line'?'中間層が0個だと境界は直線だけなので、この形は分けきれません。':H&&acc>.95?'曲がった境界で分けられています。線の太さは重みの大きさ、青は正・赤は負。':''}`);
 }

 // ---------- PageRank ----------
 let graphName='web',history=pageRank(pageGraphs.web,values.damping||.85,40);
 const labels=['A','B','C','D','E','F'];
 function renderPageRank(){
  const links=pageGraphs[graphName],rank=history[values.step],cx=210,cy=250,R=150;
  const pos=labels.map((_,i)=>[cx+R*Math.cos(-Math.PI/2+i*TAU/6),cy+R*Math.sin(-Math.PI/2+i*TAU/6)]);
  links.forEach((out,i)=>out.forEach(j=>{const[x1,y1]=pos[i],[x2,y2]=pos[j],a=Math.atan2(y2-y1,x2-x1),r2=18+rank[j]*70,sx=x1+Math.cos(a)*(18+rank[i]*70),sy=y1+Math.sin(a)*(18+rank[i]*70),ex=x2-Math.cos(a)*r2,ey=y2-Math.sin(a)*r2;path([[sx,sy],[ex,ey]],'#6f87a3',1.6);path([[ex-Math.cos(a-.4)*10,ey-Math.sin(a-.4)*10],[ex,ey],[ex-Math.cos(a+.4)*10,ey-Math.sin(a+.4)*10]],'#6f87a3',1.6);}));
  pos.forEach(([x,y],i)=>{dot(x,y,18+rank[i]*70,links[i].length?'#2c6f9e':'#8a5a2b');text(labels[i],x,y+6,'#fff',17,'center');});
  text(graphName==='dead'?'茶色：リンクを持たないページ':'円の大きさ＝今の値',20,30,'#dceafa',14);
  const bx=440,by=70,bw=250;text(`配り直し ${values.step} 回目`,bx,40,'#ffca7c',17);
  rank.forEach((v,i)=>{const y=by+i*52;ctx.fillStyle='#223b57';ctx.fillRect(bx+30,y,bw-30,26);ctx.fillStyle='#77e3c7';ctx.fillRect(bx+30,y,(bw-30)*Math.min(1,v/.5),26);text(labels[i],bx,y+19,'#dceafa',17);text(v.toFixed(3),bx+bw-2,y+19,'#0c192b',14,'right');});
  const prev=history[Math.max(0,values.step-1)],change=rank.reduce((s,v,i)=>s+Math.abs(v-prev[i]),0);
  text(`前回からの変化 ${change.toExponential(1)}`,bx,by+6*52+14,'#9fb4c8',14);
  const order=rank.map((v,i)=>[v,labels[i]]).sort((a,b)=>b[0]-a[0]);
  const inbound=labels.map((_,j)=>links.filter(out=>out.includes(j)).length);
  result(values.step?`d=${values.damping}、${values.step}回配り直した値は ${order.map(([v,l])=>`${l}:${v.toFixed(3)}`).join('、')}（合計1）。いちばん高いのは${order[0][1]}で、受けているリンクは${inbound[labels.indexOf(order[0][1])]}本。前回からの変化は${change.toExponential(1)}。${graphName==='web'&&values.step>=10?'Cはリンクを多く受け、そのCから唯一リンクされるAも高くなります。本数だけでなく、誰からのリンクかが効きます。':''}`:`最初は6ページとも同じ1/6（約0.167）から始めます。「▶ 配り直す」や「1回配る」で、リンクに沿って値を配り直そう。`);
  return values.step<40;
 }

 // ---------- wiring ----------
 if(id==='gps'){
  const clockBtn=button('時計のずれを無視して解く',()=>{withClock=!withClock;clockBtn.textContent=withClock?'時計のずれを無視して解く':'時計のずれも未知数にする';status.textContent=withClock?'x・yに加えて、時計のずれbも求めます。':'x・yだけを求めます。時計がずれていると誤差が残ります。';render();});
  button('反復を最初から見る',()=>{set('iter',0);render();status.textContent='「解き直した回数」を1つずつ増やして、推定位置の動きを見よう。';});
  button('測定誤差を振り直す',()=>{gpsSeed=(gpsSeed*7+13)%9973;render();});
  button('衛星3機・誤差あり',()=>{set('count',3);set('noise',.4);set('iter',8);render();});
 }
 if(id==='hamming'){
  extra.append(hamBits);hamControls();
  button('ランダムに1か所壊す',()=>{received=hammingEncode(message);received[Math.floor(Math.random()*7)]^=1;hamControls();render();});
  button('2か所壊す',()=>{received=hammingEncode(message);const a=Math.floor(Math.random()*7);let b=Math.floor(Math.random()*6);if(b>=a)b++;received[a]^=1;received[b]^=1;hamControls();render();});
  button('誤りを消す',()=>{received=hammingEncode(message);hamControls();render();});
 }
 if(id==='rsa'){
  for(const w of ['WHY','MATH','HELLO']){button(`「${w}」を送る`,()=>{word=w;render();});}
  button('鍵を破ってみる',()=>{const k=rsaKeys(smallPrimes[values.p],smallPrimes[values.q]);cracked=factorByTrial(k.n);render();status.textContent=`${k.n}を小さい数から順に割り、${cracked.tries}回目で見つけました。`;});
  changed=()=>{cracked=null;};
 }
 if(id==='pathfinding'){
  play('▶ 探索を再生',()=>{shownCount=Math.min(shownCount+3,pf().order.length);return shownCount<pf().order.length;});
  button('ダイクストラ法 w=0',()=>{set('weight',0);shownCount=Infinity;render();});button('A* w=1',()=>{set('weight',1);shownCount=Infinity;render();});button('急ぎすぎ w=3',()=>{set('weight',3);shownCount=Infinity;render();});
  for(const[name,label]of[['wall','壁1枚'],['cup','くぼみ'],['maze','迷路']])button(`地形：${label}`,()=>{pause();walls=[...mazes[name]];shownCount=Infinity;render();});
  const replay=button('最初から再生の準備',()=>{pause();shownCount=0;render();status.textContent='「探索を再生」で調べる順番を見よう。';});replay.classList.add('is-quiet');
  changed=()=>{pause();shownCount=Infinity;};canvas.addEventListener('click',onCanvasClick);canvas.style.cursor='pointer';
 }
 if(id==='neural'){
  resetNet();
  play('▶ 学習させる',()=>{for(let i=0;i<10;i++){trainStep(net,data,values.rate);epoch++;}losses.push(lossOf(net,data));if(epoch>=4000){status.textContent='4000回で止めました。「最初から」で学び直せます。';return false;}return true;});
  button('100回学習',()=>{pause();for(let i=0;i<100;i++){trainStep(net,data,values.rate);epoch++;if(i%10===9)losses.push(lossOf(net,data));}render();});
  button('最初から',()=>{pause();resetNet();render();});
  for(const[name,label]of[['line','直線'],['circle','円'],['xor','市松']])button(`データ：${label}`,()=>{pause();datasetName=name;data=makeDataset(name);resetNet();render();});
  changed=key=>{if(key==='hidden'){pause();resetNet();}};
 }
 if(id==='pagerank'){
  play('▶ 配り直す',()=>{if(values.step>=40)return false;set('step',values.step+1);return values.step<40;});
  button('1回配る',()=>{pause();set('step',Math.min(40,values.step+1));render();});button('最初から',()=>{pause();set('step',0);render();});
  for(const[name,label]of[['web','ふつうのリンク'],['hub','1ページに集中'],['dead','行き止まりあり']])button(`形：${label}`,()=>{pause();graphName=name;history=pageRank(pageGraphs[name],values.damping,40);set('step',0);render();});
  changed=key=>{if(key==='damping')history=pageRank(pageGraphs[graphName],values.damping,40);};
 }
 function render(){ctx.fillStyle='#0c192b';ctx.fillRect(0,0,720,480);
  if(id==='gps')renderGps();else if(id==='hamming')renderHamming();else if(id==='rsa')renderRsa();else if(id==='pathfinding')renderPath();else if(id==='neural')renderNeural();else renderPageRank();
 }
 const hidden=()=>{if(document.hidden)pause();},change=()=>{if(reduced.matches)pause();};document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',pause);reduced.addEventListener('change',change);render();
 return{element,dispose(){disposed=true;pause();document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',pause);reduced.removeEventListener('change',change);canvas.removeEventListener('click',onCanvasClick);}};
}
