import { labs } from './lab-catalog.js';
import { piPoints } from './explore-models.js';

export const connectionTrails = [
 {id:'guitar-photo',title:'ギターと写真、何が共通？',nodes:['guitar','wave','fourier','image-frequency','compression']},
 {id:'music-wifi',title:'音楽からWi-Fiへ、どうつながる？',nodes:['music','fourier','ofdm','wifi']},
 {id:'recipe-pi',title:'料理の人数換算から、円周率へ？',nodes:['recipe-scaling','proportion','ratio','monte-carlo-method']},
 {id:'camera-glasses',title:'カメラと眼鏡は、どこが似ている？',nodes:['camera','thin-lens','eyeglasses']},
 {id:'satellite',title:'人工衛星も「落ちる運動」？',nodes:['artificial-satellite','gravity','motion']},
 {id:'cooking-sound',title:'料理の熱と音色を、同じ数学で？',nodes:['cooking','heat-equation','fourier','sound-harmonics']},
];
export const edgeBetween=(edges,a,b)=>edges.find(e=>(e.from===a&&e.to===b)||(e.from===b&&e.to===a));
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const link=(text,href)=>{const a=el('a',text);a.href=href;return a;};
const button=(text,action)=>{const b=el('button',text);b.type='button';b.addEventListener('click',action);return b;};
const types={prerequisite:'学ぶ土台',develops:'発展',toolFor:'考える道具',usedIn:'使われる',application:'応用',example:'具体例',related:'関連'};

export function trailInvitation(root){
 const s=el('section',undefined,'map-play-invitation');s.append(el('strong','意外な2つを結んでみよう'),el('p','一つずつ道を開くと、共通する考え方が見えてくる。'));
 const ordered=[...connectionTrails].sort((a,b)=>Number(b.nodes.includes(root))-Number(a.nodes.includes(root)));
 for(const t of ordered)s.append(link(t.title,`#connections=${t.id}`));return s;
}

function miniExperiment(edge){
 const box=el('section',undefined,'map-mini'),pair=[edge.from,edge.to];
 const canvas=el('canvas');canvas.width=600;canvas.height=240;canvas.setAttribute('role','img');
 const reading=el('p');reading.setAttribute('role','status');
 if(pair.includes('monte-carlo-method')){
  box.append(el('h3','小さく試す：ランダムに100点打つ'),canvas,reading);canvas.setAttribute('aria-label','一辺2の正方形に半径1の円。緑は円内、桃は円外。点数と結果は下に表示。');
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  let total=0,inside=0;const reset=()=>{total=inside=0;ctx.fillStyle='#10263d';ctx.fillRect(0,0,600,240);ctx.strokeStyle='#fff';ctx.strokeRect(20,20,200,200);ctx.beginPath();ctx.arc(120,120,100,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText('円：半径1 → 面積π',250,70);ctx.fillText('正方形：一辺2 → 面積4',250,115);ctx.fillText('円内の割合 × 4 ≈ π',250,170);reading.textContent='どの場所も同じ確率で選びます。円の面積πを、正方形の面積4と比べよう。';};reset();
  const add=button('100点打ってみる',()=>{for(const p of piPoints(100,Math.random)){total++;if(p.inside)inside++;ctx.fillStyle=p.inside?'#72dfbe':'#ff9ab4';ctx.fillRect(20+(p.x+1)*100,20+(p.y+1)*100,2,2);}reading.textContent=`${total}点中${inside}点が円内。割合 ${(inside/total).toFixed(3)} × 4 = ${(4*inside/total).toFixed(3)}。割合はπ/4に近づきます。毎回誤差が減るとは限りません。`;add.disabled=total>=5000;});box.append(add,button('最初から',()=>{reset();add.disabled=false;}));return box;
 }
 if(pair.includes('wave')||pair.includes('trigonometry')||pair.includes('interference')||pair.includes('sound-harmonics')){
  box.append(el('h3','小さく試す：波を重ねる'),canvas,reading);canvas.setAttribute('aria-label','青と桃の2つの波と、黄色の合計。位相を変えた結果は下に表示。');
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  const label=el('label','2つ目の波のずれ '),input=el('input');input.type='range';input.min=0;input.max=180;input.value=0;input.step=15;label.append(input);box.append(label);
  const draw=()=>{const phase=Number(input.value)*Math.PI/180;ctx.fillStyle='#10263d';ctx.fillRect(0,0,600,240);for(const [color,f] of [['#6cc9ff',x=>Math.sin(x)],['#ff9ab4',x=>Math.sin(x+phase)],['#ffe08b',x=>Math.sin(x)+Math.sin(x+phase)]]){ctx.beginPath();for(let x=0;x<=600;x++){const y=120-45*f(x/600*Math.PI*6);if(x)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();}reading.textContent=`ずれ${input.value}°。青＋桃＝黄色。${input.value==='180'?'山と谷が重なり、合計は0。':input.value==='0'?'山と山が重なり、合計の振幅は2倍。':'重なり方を変えると、合計の振幅も変わります。'}同じ周波数・同じ振幅を1点で足す例です。`;};input.addEventListener('input',draw);draw();return box;
 }
 return null;
}

export function createEdgeReason(edge,nodes){
 const s=el('section',undefined,'map-edge-reason');s.tabIndex=-1;
 s.append(el('p',types[edge.type]||edge.type,'micro-label'),el('h2',`${nodes.get(edge.from).name} → ${nodes.get(edge.to).name}`),el('p',edge.reason));
 s.append(el('p','矢印はこの関係の登録方向です。たどる向きと、因果関係は同じとは限りません。','learning-fine'));
 const mini=miniExperiment(edge);if(mini)s.append(mini);
 const related=labs.filter(l=>l.nodes.includes(edge.from)&&l.nodes.includes(edge.to));
 if(!related.length)related.push(...labs.filter(l=>l.nodes.includes(edge.from)||l.nodes.includes(edge.to)).slice(0,2));
 if(related.length){s.append(el('h3','体験で、もう少し確かめる'));for(const lab of related)s.append(link(lab.title,`#lab=${lab.id}`));}
 const nav=el('nav');nav.setAttribute('aria-label','このつながりの知識マップ');for(const id of [edge.from,edge.to])nav.append(link(`${nodes.get(id).name}の地図へ`,`#node=${id}`));s.append(nav);return s;
}

export function createConnectionTrail(id,stepValue,knowledge){
 const trail=connectionTrails.find(t=>t.id===id);if(!trail)return null;
 const nodes=new Map(knowledge.nodes.map(n=>[n.id,n]));
 const step=Math.min(trail.nodes.length-1,Math.max(0,Math.floor(Number(stepValue)||0)));
 const page=el('article',undefined,'string-lab connection-journey');page.append(link('← 最初の知識マップへ',`#node=${trail.nodes[0]}`),el('p','意外な2つを結ぶ道','micro-label'),el('h1',trail.title),el('p',`${nodes.get(trail.nodes[0]).name} と ${nodes.get(trail.nodes.at(-1)).name}。間には何があると思う？`));
 const chain=el('ol',undefined,'connection-chain');for(let i=0;i<trail.nodes.length;i++){const li=el('li');if(i<=step){li.append(link(nodes.get(trail.nodes[i]).name,`#node=${trail.nodes[i]}`));li.className='is-revealed';if(i===step)li.setAttribute('aria-current','step');}else li.textContent=i===trail.nodes.length-1?nodes.get(trail.nodes[i]).name:'？';chain.append(li);}page.append(chain,el('p',`${step} / ${trail.nodes.length-1} 本の理由を発見`));
 if(step){const edge=edgeBetween(knowledge.edges,trail.nodes[step-1],trail.nodes[step]);if(edge)page.append(createEdgeReason(edge,nodes));}
 const actions=el('nav',undefined,'connection-actions');actions.setAttribute('aria-label','道を進む');if(step)actions.append(link('ひとつ前の理由',`#connections=${id}&step=${step-1}`));if(step<trail.nodes.length-1)actions.append(link('次のつながりを開く →',`#connections=${id}&step=${step+1}`));else actions.append(el('strong','つながった！ 道の途中の知識も、地図で広げてみよう。'),link('もう一度たどる',`#connections=${id}`));page.append(actions,trailInvitation());return page;
}
