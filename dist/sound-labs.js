import { soundLabs } from './sound-catalog.js';
import { SOUND_SPEED, TAU, doppler, synthesize, decompose, wavefront } from './sound-models.js';

const math = body => `<div class="radio-math-scroll"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow>${body}</mrow></math></div>`;
function equations(id) {
  if(id==='harmonics') return `<h3>音は、いくつもの波の足し算</h3>${math('<mi>y</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><munderover><mo>∑</mo><mrow><mi>n</mi><mo>=</mo><mn>1</mn></mrow><mn>6</mn></munderover><msub><mi>a</mi><mi>n</mi></msub><mi mathvariant="normal">sin</mi><mo>(</mo><mn>2</mn><mi>π</mi><mi>n</mi><msub><mi>f</mi><mn>0</mn></msub><mi>t</mi><mo>)</mo>')}<p>Σ（シグマ）は足し算。f₀ は基本の周波数、n は何倍の周波数か、aₙ はその波の大きさです。棒グラフは合成した波形を分析し直して求めています。</p><p>基本の波を消すと、音の高さの感じ方も変わることがあります。</p>`;
  return `<h3>波の間隔が、分母に現れる</h3>${math('<msub><mi>f</mi><mtext>聞こえる</mtext></msub><mo>=</mo><msub><mi>f</mi><mn>0</mn></msub><mo>×</mo><mfrac><mi>c</mi><mrow><mi>c</mi><mo>−</mo><mi>v</mi></mrow></mfrac>')}<div data-calculation></div><p>c は音速343m/s、f₀ は音源が出す周波数。v は聞き手に近づく向きを＋、遠ざかる向きを−とした速度です。</p><p>近づくと分母 c − v が小さくなり、音が高くなる。遠ざかると分母が大きくなり、低くなります。</p>`;
}

export function createSoundLab(id,nodesById) {
  const lab=soundLabs.find(item=>item.id===id), harmonics=id==='harmonics';
  const element=document.createElement('article');element.className='string-lab science-lab radio-lab sound-lab';
  element.innerHTML=`<a class="lab-back" href="#labs">← 体験一覧へ</a><header class="lab-heading"><p class="micro-label">${lab.category}</p><h1>${lab.title}</h1><p>${lab.question}</p></header>
  <div class="science-workbench"><section class="science-stage"><canvas width="1440" height="1000" role="img" aria-label="${lab.title}。結果は図の下の文章でも確認できます。"></canvas><p class="science-reading" data-reading></p></section><section class="lab-controls" aria-label="実験の操作"><div class="science-actions" data-presets></div><div data-controls></div><div data-extra></div><div class="science-actions" data-actions></div><label for="sound-volume">音量<output for="sound-volume">20%</output></label><input id="sound-volume" type="range" min="0" max="100" value="20"><p role="status" data-status>音はボタンを押したときだけ、3秒間鳴ります。</p></section></div>
  <section class="lab-discovery"><span class="micro-label">気づくヒント</span><h2>${lab.lesson}</h2><p>${lab.everyday}</p></section><section class="lab-equation"><div class="radio-formulas"><section>${equations(id)}</section><details class="radio-model-details"><summary>この実験の条件</summary><p>${lab.limit}</p></details></div><div class="lab-school"><h2>学校の勉強へつなげる</h2><div data-links></div></div></section>`;
  const $=selector=>element.querySelector(selector),ctx=$('canvas').getContext('2d'),status=$('[data-status]');
  if(!ctx){status.textContent='このブラウザでは図を表示できません。';return{element,dispose(){}};}
  ctx.scale(2,2);
  let amplitudes=[1,0,0,0,0,0], selected=1, disposed=false, audio,voice,gain,audioToken=0;
  let time=1.2,running=false,frame=0,last=0,playButton;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'), values={},inputs=new Map();
  function button(text,fn,parent=$('[data-actions]')){const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',fn);parent.append(b);return b;}
  function slider(key,label,min,max,step,value,unit,parent,onChange){
    const box=document.createElement('div');box.innerHTML=`<label for="sound-${key}">${label}<output for="sound-${key}">${value}${unit}</output></label><input id="sound-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;
    const input=box.querySelector('input');inputs.set(key,input);values[key]=value;
    input.addEventListener('input',()=>{values[key]=Number(input.value);box.querySelector('output').textContent=`${Number(Number(input.value).toFixed(2))}${unit}`;stopAudio();onChange?.(values[key]);render();status.textContent='設定を変更しました。音を聞いて比べよう。';});parent.append(box);
  }
  function set(key,value){inputs.get(key).value=value;inputs.get(key).dispatchEvent(new Event('input'));}
  for(const [key,label,min,max,step,value,unit] of lab.controls)slider(key,label,min,max,step,value,unit,$('[data-controls]'),()=>{if(!harmonics){pause();time=1.2;}});
  for(const nodeId of lab.nodes){const a=document.createElement('a');a.href=`#node=${nodeId}`;a.textContent=nodesById.get(nodeId).name;$('[data-links]').append(a);}
  if(harmonics){
    for(let i=0;i<6;i++)slider(`a${i}`,`${i+1}倍の波`,0,1,.01,amplitudes[i],'',$('[data-extra]'),v=>amplitudes[i]=v);
    for(const [label,recipe] of [['丸い波',[1,0,0,0,0,0]],['四角い波へ',[1,0,1/3,0,1/5,0]],['のこぎり波へ',[1,1/2,1/3,1/4,1/5,1/6]],['全部消す',[0,0,0,0,0,0]]])button(label,()=>{recipe.forEach((v,i)=>set(`a${i}`,v));},$('[data-presets]'));
    const choice=document.createElement('div');choice.innerHTML='<label for="sound-component">単独で聞く波</label><select id="sound-component">'+Array.from({length:6},(_,i)=>`<option value="${i+1}">${i+1}倍の波</option>`).join('')+'</select>';
    choice.querySelector('select').addEventListener('change',event=>{selected=Number(event.target.value);stopAudio();render();});$('[data-extra]').append(choice);
    button('♪ 足した音を聞く',()=>playAudio('sum'));button('♪ 選んだ波だけ聞く',()=>playAudio('part'));
  }else{
    for(const [label,v] of [['近づく',60],['止まる',0],['遠ざかる',-60]])button(label,()=>set('speed',v),$('[data-presets]'));
    playButton=button('▶ 動かす',()=>{if(running)pause();else if(reduced.matches){advance(.1);render();}else{if(atEnd())time=0;running=true;last=performance.now();playButton.textContent='Ⅱ 一時停止';frame=requestAnimationFrame(tick);}});
    button('1コマ進める',()=>{pause();if(atEnd())time=0;advance(.1);render();});button('最初から',()=>{pause();time=0;render();});
    button('♪ 音源の音',()=>playAudio('source'));button('♪ 聞き手に届く音',()=>playAudio('heard'));
  }
  button('■ 音を止める',()=>{stopAudio();status.textContent='音を停止しました。';});
  $('#sound-volume').addEventListener('input',event=>{element.querySelector('output[for="sound-volume"]').textContent=`${event.target.value}%`;if(gain)gain.gain.setTargetAtTime(Number(event.target.value)/100*.12,audio.currentTime,.015);});
  function stopAudio(){audioToken++;if(voice){voice.onended=null;try{voice.stop();}catch{}voice.disconnect();voice=null;}if(gain){gain.disconnect();gain=null;}}
  async function playAudio(kind){
    stopAudio();const token=audioToken;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('unsupported');audio ||= new Audio();await audio.resume();
      if(disposed||document.hidden||token!==audioToken)return;if(audio.state!=='running')throw new Error('suspended');
      const rate=44100,buffer=audio.createBuffer(1,rate*3,rate),samples=buffer.getChannelData(0),f=kind==='heard'?doppler(values.frequency,values.speed):values.frequency;
      for(let n=0;n<samples.length;n++){const phase=f*n/rate;const sample=harmonics?(kind==='part'?amplitudes[selected-1]*Math.sin(TAU*selected*phase):synthesize(amplitudes,phase)):Math.sin(TAU*phase);samples[n]=sample*Math.min(1,n/441,(samples.length-1-n)/441);}
      voice=audio.createBufferSource();voice.buffer=buffer;gain=audio.createGain();gain.gain.value=Number($('#sound-volume').value)/100*.12;voice.connect(gain);gain.connect(audio.destination);
      voice.onended=()=>{if(token===audioToken){stopAudio();status.textContent='再生が終わりました。設定を変えて聞き比べよう。';}};voice.start();status.textContent=harmonics&&kind==='part'?`${selected}倍の波を3秒再生。振幅0なら無音です。`:'3秒間再生します。';
    }catch{if(!disposed&&token===audioToken){stopAudio();status.textContent='音を再生できませんでした。図で比べてみよう。';}}
  }
  function pause(){running=false;cancelAnimationFrame(frame);if(playButton)playButton.textContent='▶ 動かす';}
  function maxTime(){return values.speed>0?Math.min(8,300/(values.speed*.5)):values.speed<0?Math.min(8,200/(-values.speed*.5)):8;}
  function atEnd(){return time>=maxTime();}
  function advance(dt){time=Math.min(maxTime(),time+dt);if(atEnd()){pause();status.textContent='表示範囲の端で停止しました。最初から、または速度を変えて試せます。';}}
  function tick(now){if(!running||disposed)return;advance(Math.min(.05,(now-last)/1000));last=now;render();if(running)frame=requestAnimationFrame(tick);}
  function text(s,x,y,color='#dceafa',size=17){ctx.fillStyle=color;ctx.font=`${size}px sans-serif`;ctx.fillText(s,x,y);}
  function line(points,color,width=2){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function render(){
    ctx.fillStyle='#0c192b';ctx.fillRect(0,0,720,500);
    if(harmonics){
      const colors=['#72d8ff','#ffd084','#cb9bff','#72e5bc','#fb9fad','#9cbdff'];
      text('① 材料の波：高さを変えて足してみよう',24,28);
      for(let i=0;i<6;i++){const y=60+i*28;line(Array.from({length:361},(_,n)=>[150+n/360*540,y-10*amplitudes[i]*Math.sin(TAU*(i+1)*n/360*2)]),colors[i],i+1===selected?2.5:1.2);text(`${i+1}倍 · ${values.frequency*(i+1)}Hz`,24,y+5,colors[i],14);}
      text('② 足し合わせた音の波形',24,252,'#79e1c0');
      line([[30,311],[690,311]],'#34465b',1);
      line(Array.from({length:601},(_,n)=>[30+n/600*660,311-8*synthesize(amplitudes,n/600*2)]),'#79e1c0',2);
      const samples=Array.from({length:512},(_,n)=>synthesize(amplitudes,n/512)),parts=decompose(samples);
      text('③ 合成した波を分解 → 含まれる成分の大きさ',24,392);
      parts.forEach((a,i)=>{const x=90+i*100;ctx.fillStyle=colors[i];ctx.fillRect(x,464-48*a,44,48*a);text(a.toFixed(2),x,405,colors[i],14);text(`${i+1}倍`,x,488,colors[i],15);});
      $('[data-reading]').textContent=`基本は${values.frequency}Hz。分解した振幅：${parts.map((a,i)=>`${i+1}倍=${a.toFixed(2)}`).join('、')}。波形は基本周期2つ分、縦の尺度は固定です。棒の高さは設定値の表示ではなく、合成した波を分析した結果です。`;
    }else{
      const speed=values.speed,f=doppler(values.frequency,speed),x=240+speed*.5*time;
      text('波は、出たときの場所を中心に広がる',24,30);
      ctx.save();ctx.beginPath();ctx.rect(15,45,690,325);ctx.clip();
      for(let n=0;n<=Math.floor(time/.2);n++){const w=wavefront(n*.2,time,speed);ctx.beginPath();ctx.arc(w.x,212,w.radius,0,TAU);ctx.strokeStyle='#427ba9';ctx.lineWidth=2;ctx.stroke();}
      ctx.restore();line([[30,252],[690,252]],'#728197',2);
      ctx.fillStyle='#ffca7c';ctx.fillRect(x-23,199,46,28);text('＋',x-8,219,'#813d31',21);
      for(const dx of [-13,13]){ctx.beginPath();ctx.arc(x+dx,230,6,0,TAU);ctx.fillStyle='#b2bacb';ctx.fill();}
      ctx.beginPath();ctx.arc(560,204,10,0,TAU);ctx.fillStyle='#77e3c7';ctx.fill();line([[560,214],[560,240]],'#77e3c7',3);
      text('音源',x-18,283,'#ffca7c');text('止まっている聞き手',487,307,'#77e3c7',16);
      text(speed===0?'停止中':speed>0?'→ 近づく':'← 遠ざかる',24,355,'#ffca7c');
      text(`出す音 ${values.frequency} Hz`,30,410,'#ffca7c',24);text(`届く音 ${f.toFixed(1)} Hz`,375,410,'#77e3c7',24);
      text(`速さ ${Math.abs(speed)} m/s　（${(Math.abs(speed)*3.6).toFixed(0)} km/h）`,30,462);
      $('[data-reading]').textContent=`${speed===0?'音源は停止':speed>0?'音源が聞き手に近づく':'音源が聞き手から遠ざかる'}。聞き手側の波長は${((SOUND_SPEED-speed)/values.frequency).toFixed(3)}m、届く音は${f.toFixed(1)}Hz。波紋は模式図で毎秒5回。音の比較は現在の速度での定常音です。`;
      $('[data-calculation]').innerHTML=math(`<mn>${values.frequency}</mn><mo>×</mo><mfrac><mn>343</mn><mrow><mn>343</mn><mo>${speed<0?'+':'−'}</mo><mn>${Math.abs(speed)}</mn></mrow></mfrac><mo>≈</mo><mn>${f.toFixed(1)}</mn><mtext> Hz</mtext>`);
    }
  }
  const hidden=()=>{if(document.hidden){pause();stopAudio();}},leave=()=>{pause();stopAudio();},change=()=>{if(reduced.matches)pause();};
  document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',leave);reduced.addEventListener('change',change);render();
  return{element,dispose(){disposed=true;leave();document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',leave);reduced.removeEventListener('change',change);if(audio)audio.close().catch(()=>{});}};
}
