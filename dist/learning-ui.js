import { labs } from './lab-catalog.js';
import { journeys,learning,everydayLinks,matchLabs,cleanProgress } from './learning-data.js';
const ids=labs.map(l=>l.id),key='why-study-discoveries-v1';
let progress={records:{},last:null},persistent=true;
try{progress=cleanProgress(JSON.parse(localStorage.getItem(key)),ids);}catch{persistent=false;}
function persist(){try{localStorage.setItem(key,JSON.stringify(progress));persistent=true;}catch{persistent=false;}}
const labById=id=>labs.find(l=>l.id===id);
const labUrl=(id,journey)=>`#lab=${id}${journey?`&journey=${journey}`:''}`;
const count=()=>Object.keys(progress.records).length;
function node(tag,className,text){const e=document.createElement(tag);e.className=className;if(text!==undefined)e.textContent=text;return e;}
function link(text,href,className='learning-link'){const a=node('a',className,text);a.href=href;return a;}
function button(text,fn,className='learning-button'){const b=node('button',className,text);b.type='button';b.addEventListener('click',fn);return b;}
function routeCard(j){const a=node('a','journey-card');a.href=`#journey=${j.id}`;const found=j.steps.filter(([id])=>progress.records[id]).length;a.innerHTML=`<span class="journey-symbol" aria-hidden="true">${j.icon}</span><small>${j.steps.length}の体験 · ${found}つの発見を記録</small><h3>${j.title}</h3><p>${j.intro}</p><span class="journey-school">${j.school}</span><b>疑問をたどる →</b>`;return a;}
function privacy(){return node('p','learning-fine',persistent?'記録はこのブラウザだけに保存します。外部送信やログインはありません。閲覧しただけでは発見済みになりません。':'このブラウザでは保存を利用できないため、記録はページを開いている間だけ保持します。');}
export function createHomePortal(){
 const section=node('section','learning-portal');section.innerHTML=`<div class="learning-hero"><div><p class="micro-label">ひとつの「なぜ？」から、世界がつながる。</p><h1>触ってみたら、<br>数式に意味が見えてきた。</h1><p>音、光、電波、宇宙。20の体験から、身近な仕組みと学校の勉強を行き来しよう。</p><div class="learning-nav"><a href="#journey=sound">音の正体を追いかける →</a><a href="#labs">20の体験から選ぶ</a><a href="#notebook">発見ノート ${count()}</a></div></div><div class="learning-hero-map" aria-hidden="true"><span>ギターの音</span><i>↓ なぜ音色が違う？</i><span>波を足す・分ける</span><i>↓ どう表せる？</i><span>sin · Σ · フーリエ</span><i>↓ 同じ考え方で</i><span>写真や電波へ</span></div></div><div class="learning-section-title"><h2>疑問でつながる、6つの探索ルート</h2><p>順番に進んでも、気になるところからでも。</p></div><div class="journey-grid"></div>`;
 const last=progress.last;if(last){const resume=node('div','learning-resume');resume.append(node('span','',`前に開いた体験：${labById(last.lab).title}`),link('続きから開く →',labUrl(last.lab,last.journey)));section.querySelector('.learning-hero').after(resume);}
 journeys.forEach(j=>section.querySelector('.journey-grid').append(routeCard(j)));return section;
}
export function createJourney(id){
 const journey=journeys.find(j=>j.id===id);if(!journey)return null;
 const page=node('article','string-lab learning-page');page.append(link('← 探索ルートへ','#'));
 const first=journey.steps.find(([id])=>!progress.records[id])?.[0]||journey.steps[0][0];
 const header=node('header','lab-heading');header.innerHTML=`<p class="micro-label">疑問をたどる · ${journey.steps.length}の体験</p><h1>${journey.title}</h1><p>${journey.intro}</p>`;header.append(link(journey.steps.every(([id])=>progress.records[id])?'もう一度、はじめから →':'未記録の体験から開く →',labUrl(first,id),'learning-cta'));page.append(header);
 const list=node('ol','journey-steps');journey.steps.forEach(([labId,question],index)=>{const lab=labById(labId),item=node('li','journey-step');item.append(node('span','journey-number',String(index+1)),node('p','journey-question',question),link(lab.title,labUrl(labId,id),'journey-step-title'),node('p','',learning[labId][2]),node('small','learning-fine',progress.records[labId]?'✓ 発見を記録済み':'まだ発見を記録していません'));list.append(item);});page.append(list,privacy(),link('別の体験も探す','#labs'));return page;
}
export function createLearningLibrary(){
 const page=node('article','string-lab learning-page');page.innerHTML='<a class="lab-back" href="#">← 探索ルートへ</a><header class="lab-heading"><p class="micro-label">PLAY · NOTICE · CONNECT</p><h1>今日は、何を確かめる？</h1><p>気になる言葉やテーマで、20の体験を探そう。</p></header><div class="library-controls"><label for="library-query">体験を検索<input id="library-query" type="search" placeholder="音色、光、分数、電波…"></label><label for="library-theme">テーマ<select id="library-theme"><option value="">すべてのテーマ</option></select></label><label class="library-check"><input type="checkbox" id="library-recorded">発見を記録した体験だけ</label></div><p data-library-count role="status"></p><div class="lab-gallery"></div>';
 const params=new URLSearchParams(location.hash.slice(1)),query=page.querySelector('#library-query'),theme=page.querySelector('#library-theme'),recorded=page.querySelector('#library-recorded');journeys.forEach(j=>{const option=node('option','',j.title);option.value=j.id;theme.append(option);});query.value=params.get('q')||'';theme.value=journeys.some(j=>j.id===params.get('theme'))?params.get('theme'):'';recorded.checked=params.get('recorded')==='1';
 function render(){const filtered=matchLabs(labs,query.value).filter(l=>!theme.value||journeys.find(j=>j.id===theme.value).steps.some(([id])=>id===l.id)).filter(l=>!recorded.checked||progress.records[l.id]);const grid=page.querySelector('.lab-gallery');grid.replaceChildren();page.querySelector('[data-library-count]').textContent=`${filtered.length} / ${labs.length}の体験`;
  for(const lab of filtered){const a=node('a',`lab-gallery-card lab-color-${lab.id}`);a.href=labUrl(lab.id,theme.value);a.innerHTML=`<div class="lab-gallery-art" aria-hidden="true">${lab.icon}</div><div><small>${lab.category}${progress.records[lab.id]?' · ✓ 発見を記録済み':''}</small><h2>${lab.title}</h2><p>${lab.question}</p><b>試してみる ↗</b></div>`;grid.append(a);}if(!filtered.length)grid.append(node('p','learning-empty','見つかりませんでした。検索語を短くするか、テーマを「すべて」に戻してみよう。'));
 }
 function filter(){const p=new URLSearchParams();p.set('labs','');if(query.value)p.set('q',query.value);if(theme.value)p.set('theme',theme.value);if(recorded.checked)p.set('recorded','1');history.replaceState(null,'',`#${p}`);render();}
 query.addEventListener('input',filter);theme.addEventListener('change',filter);recorded.addEventListener('change',filter);render();page.append(link('発見ノートを開く →','#notebook'),privacy());return page;
}
export function createNotebook(){
 const page=node('article','string-lab learning-page');page.append(link('← 探索ルートへ','#'));const header=node('header','lab-heading');header.innerHTML=`<p class="micro-label">MY DISCOVERIES</p><h1>自分の「なるほど」を残そう。</h1><p>${count()} / ${labs.length}の体験で発見を記録しています。理解度の採点ではなく、自分の気づきの記録です。</p>`;page.append(header,privacy());
 if(!count())page.append(node('p','learning-empty','体験画面の「発見を記録する」で、ここに残せます。短いメモも書けます。'),link('体験を選ぶ →','#labs'));
 for(const lab of labs){const record=progress.records[lab.id];if(!record)continue;const card=node('section','notebook-card');card.append(link(lab.title,labUrl(lab.id),'journey-step-title'),node('p','notebook-note',record.note||'発見を記録しました。メモはまだありません。'),link('もう一度試す・メモを編集する →',labUrl(lab.id)));page.append(card);}return page;
}
export function attachLearning(element,labId,journeyId,nodesById){
 const info=learning[labId];if(!info)return;
 const journey=journeys.find(j=>j.id===journeyId&&j.steps.some(([id])=>id===labId));progress.last={lab:labId,journey:journey?.id||null};persist();
 const related=journeys.filter(j=>j.steps.some(([id])=>id===labId));
 if(journey){const index=journey.steps.findIndex(([id])=>id===labId),nav=node('nav','learning-route-bar');nav.setAttribute('aria-label','探索ルート');nav.append(link(`← ${journey.title}`,`#journey=${journey.id}`),node('span','',`${index+1} / ${journey.steps.length}`));if(index>0)nav.append(link('前の体験',labUrl(journey.steps[index-1][0],journey.id)));if(index+1<journey.steps.length)nav.append(link('次の体験 →',labUrl(journey.steps[index+1][0],journey.id)));element.querySelector('.lab-heading').before(nav);}
 const mission=node('section','learning-mission');mission.innerHTML='<span class="micro-label">まず、ひとつ確かめよう</span>';mission.append(node('p','',info[0]));const hint=node('details','');hint.append(node('summary','','試したあとに、気づくポイントを見る'),node('p','',info[1]));mission.append(hint);element.querySelector('.lab-heading').after(mission);
 const footer=node('section','learning-connections');footer.innerHTML='<div class="learning-section-title"><h2>ここから、何につながる？</h2><p>今見た変化を、学校の言葉でも考えてみよう。</p></div>';
 const bridges=node('div','learning-bridges');const world=everydayLinks[labId];const everyday=node('div','learning-school-bridge');everyday.append(node('h3','','身近な世界へ'),node('p','',world[1]),link(`${nodesById.get(world[0]).name}へつなぐ →`,`#node=${world[0]}`));const school=node('div','learning-school-bridge');school.append(node('h3','','学校の勉強へ'),node('p','',info[2]),link(`${nodesById.get(info[3]).name}の知識マップへ →`,`#node=${info[3]}`));bridges.append(everyday,school);footer.append(bridges);
 const record=node('section','learning-record');record.innerHTML='<h3>自分の気づきを残す</h3><label for="discovery-note">何が変わった？ どんな疑問が残った？（任意・280文字まで）</label><textarea id="discovery-note" maxlength="280" rows="3" placeholder="例：長さを半分にしたら音が高くなった。太さでも変わるのかな？"></textarea><div class="learning-nav" data-record-actions></div><p role="status" data-record-status></p>';
 const textarea=record.querySelector('textarea'),recordStatus=record.querySelector('[data-record-status]');textarea.value=progress.records[labId]?.note||'';
 const save=button(progress.records[labId]?'記録を更新する':'発見を記録する',()=>{progress.records[labId]={discovered:true,note:textarea.value.slice(0,280)};persist();save.textContent='記録を更新する';recordStatus.textContent=persistent?'このブラウザに記録しました。':'保存を利用できないため、このページを開いている間だけ記録します。';});
 const clear=button('この体験の記録を消す',()=>{delete progress.records[labId];persist();textarea.value='';save.textContent='発見を記録する';recordStatus.textContent='この体験の記録を消しました。';},'learning-button is-secondary');record.querySelector('[data-record-actions]').append(save,clear,link('発見ノートへ','#notebook'));record.append(privacy());footer.append(record);
 const next=node('div','learning-next');next.append(node('p','micro-label','次の疑問'));
 const nextInJourney=journey?.steps[journey.steps.findIndex(([id])=>id===labId)+1];
 if(nextInJourney)next.append(link(nextInJourney[1],labUrl(nextInJourney[0],journey.id),'learning-next-card'));
 if(!nextInJourney||nextInJourney[0]!==info[4])next.append(link(info[5],labUrl(info[4]),'learning-next-card'));
 if(journey&&!nextInJourney)next.append(link('このルートを振り返る →',`#journey=${journey.id}`));footer.append(next);
 const routes=node('div','learning-route-links');routes.append(node('span','','この体験が登場するルート：'));related.forEach(j=>routes.append(link(j.title,`#journey=${j.id}`)));footer.append(routes);element.append(footer);
}
