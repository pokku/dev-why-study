export function videoSearchUrl(name, mode='入門 わかりやすく') {
 return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} ${mode}`)}`;
}
const element=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e;};

export function arrangeMapDesk(page,{node,inspector,reasonPanel,formula}){
 const original=[...inspector.children];
 const panels=new Map();
 const add=(id,title)=>{const section=element('section');section.id=`map-panel-${id}`;section.className='map-desk-panel';section.setAttribute('aria-label',title);panels.set(id,{title,section});return section;};
 const overview=add('overview','概要');
 original.slice(0,3).forEach(e=>overview.append(e));
 const why=original.find(e=>e.classList.contains('why-map-link'));if(why)overview.append(why);
 const meta=original.find(e=>e.tagName==='DL');if(meta)overview.append(meta);
 const relations=add('relations','つながり');
 if(reasonPanel)relations.append(reasonPanel);
 const list=original.find(e=>e.classList.contains('inspector-relations'));
 relations.append(element('h3','別のつながりも調べる'));if(list)relations.append(list);
 const experiments=add('experiments','体験');
 const invitation=page.querySelector('.lab-invitation.is-map');
 if(invitation)experiments.append(invitation);else experiments.append(element('p','この知識に直接対応する体験は、まだありません。線の先の知識からも探せます。'));
 const trails=page.querySelector('.map-play-invitation');if(trails)experiments.append(trails);
 if(formula){const math=add('formula','数式');for(const e of original.slice(3)){if(e!==meta&&e!==list&&e!==why&&e.tagName!=='H3')math.append(e);}const discovery=page.querySelector('.discovery-trail');if(discovery)math.append(discovery);}
 const videos=add('videos','動画');videos.append(element('h2',`${node.name}をもっと知る`),element('p','YouTubeで日本語の解説を探します。検索結果は外部サイトで開きます。'));
 for(const [label,query] of [['やさしい解説を探す','入門 わかりやすく'],['図や実験で見る','実験 図解'],['数式から詳しく学ぶ','数式 解説']]){const a=element('a',`${label} ↗`);a.href=videoSearchUrl(node.name,query);a.target='_blank';a.rel='noopener noreferrer';videos.append(a);}
 videos.append(element('p','特定の動画を推薦する一覧ではありません。式の条件や説明の根拠も確かめながら見てみよう。'));
 const params=new URLSearchParams(location.hash.slice(1));const requested=params.get('view');
 const active=panels.has(requested)?requested:reasonPanel?'relations':'overview';
 inspector.replaceChildren();inspector.classList.add('map-desk');
 const nav=element('nav');nav.className='map-desk-tabs';nav.setAttribute('aria-label','知識を掘り下げる');
 for(const [id,{title,section}] of panels){const a=element('a',title);const p=new URLSearchParams(location.hash.slice(1));p.set('view',id);a.href=`#${p}`;a.setAttribute('aria-controls',section.id);if(id===active)a.setAttribute('aria-current','page');nav.append(a);section.hidden=id!==active;}
 inspector.append(nav,...[...panels.values()].map(p=>p.section));
 const activeSection=panels.get(active).section;activeSection.tabIndex=-1;
 return activeSection;
}

// Long explanations remain available without pushing each subsequent section down.
export function compactLabDetails(page){
 const sections=[...page.children].filter(e=>e.matches('.intuition-guide,.lab-discovery,.lab-equation,.learning-connections'));
 if(!sections.length)return;
 const container=element('section');container.className='lab-detail-switch';
 const nav=element('nav');nav.setAttribute('aria-label','体験の説明を切り替える');
 const names={'intuition-guide':'なぜそうなる？','lab-discovery':'気づくヒント','lab-equation':'数式と条件','learning-connections':'つながり・記録'};
 const buttons=[];
 sections[0].before(container);container.append(nav);
 const show=index=>{sections.forEach((s,i)=>s.hidden=i!==index);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));};
 sections.forEach((s,i)=>{const b=element('button',names[[...s.classList].find(c=>names[c])]);b.type='button';b.addEventListener('click',()=>show(i));buttons.push(b);nav.append(b);container.append(s);});show(0);
}
