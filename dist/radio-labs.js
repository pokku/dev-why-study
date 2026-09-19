import { radioLabs } from './radio-catalog.js';
import { C, wavelength, polarizationPower, radioSignal, audioSamples } from './radio-models.js';

const TAU = Math.PI * 2;
const bands = ['電波', 'マイクロ波', '赤外線', '可視光', '紫外線', 'X線', 'ガンマ線'];
const bounds = [3e8, 3e11, 4e14, 7.5e14, 3e16, 3e19, Infinity];
const colors = ['#65bfff', '#6de5cc', '#fbaf73', '#c6ff83', '#c2a2ff', '#fb8db4', '#e2e9ff'];
function quantity(value, units) {
  const unit = units.find(([scale]) => value >= scale) || units.at(-1);
  return `${Number((value / unit[0]).toPrecision(4))} ${unit[1]}`;
}
const hz = f => quantity(f, [[1e18,'EHz'],[1e15,'PHz'],[1e12,'THz'],[1e9,'GHz'],[1e6,'MHz'],[1e3,'kHz'],[1,'Hz']]);
const meters = l => quantity(l, [[1e3,'km'],[1,'m'],[1e-2,'cm'],[1e-3,'mm'],[1e-6,'μm'],[1e-9,'nm'],[1e-12,'pm'],[1e-15,'fm']]);

function radioFormulas() {
  const mt = '<mi>m</mi><mo>(</mo><mi>t</mi><mo>)</mo>';
  const fc = '<msub><mi>f</mi><mi>c</mi></msub>';
  const ct = '<mi>c</mi><mo>(</mo><mi>t</mi><mo>)</mo>';
  const phase = '<mi>φ</mi><mo>(</mo><mi>t</mi><mo>)</mo>';
  const st = mode => `<msub><mi>s</mi><mtext>${mode}</mtext></msub><mo>(</mo><mi>t</mi><mo>)</mo>`;
  const math = (label, body) => `<div class="radio-math-scroll"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="${label}"><mrow>${body}</mrow></math></div>`;
  return `<div class="radio-formulas">
    <section><h3>まず、送りたい音を波で表す</h3>${math('音の信号 m(t) = sin(2πft)', `${mt}<mo>=</mo><mi mathvariant="normal">sin</mi><mo>(</mo><mn>2</mn><mi>π</mi><mi>f</mi><mi>t</mi><mo>)</mo>`)}<p><b>m(t)</b> は音の波。<b>f</b> は音の高さを決める周波数、<b>t</b> は時間です。</p></section>
    <section><h3>音を運ぶための波：搬送波</h3>${math('搬送波 c(t) = cos(2πfc t)', `${ct}<mo>=</mo><mi mathvariant="normal">cos</mi><mo>(</mo><mn>2</mn><mi>π</mi>${fc}<mi>t</mi><mo>)</mo>`)}<p><b>c(t)</b> は、まだ音を載せていない一定の波。<b>f<sub>c</sub></b> はその周波数です。この図では8kHzにしています。</p></section>
    <section><h3>AM：信号波で、搬送波の高さを変える</h3>${math('AMの変調波 sAM(t) = [1 + μ m(t)] c(t)', `${st('AM')}<mo>=</mo><mo>[</mo><mn>1</mn><mo>+</mo><mi>μ</mi>${mt}<mo>]</mo><mo>⁢</mo>${ct}`)}<p>搬送波 <b>c(t)</b> に、音に合わせて変わる高さ <b>1 + μm(t)</b> を掛けます。<b>μ</b>（ミュー）が変調の深さ。2つの波をそのまま足す仕組みではありません。</p></section>
    <section><h3>FM：信号波で、搬送波の間隔を変える</h3>${math('瞬間周波数 f瞬間(t) = fc + Δf m(t)', `<msub><mi>f</mi><mtext>瞬間</mtext></msub><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo>${fc}<mo>+</mo><mi>Δf</mi>${mt}`)}<p><b>Δf</b>（デルタ・エフ）は周波数を変える幅。高さは一定のまま、音に合わせて周波数を変えます。周波数が高い部分ほど、波の間隔が狭くなります。</p>
    <details class="radio-model-details"><summary>FMの変調波も数式で見る</summary>${math('FMの変調波 sFM(t) = cos φ(t)', `${st('FM')}<mo>=</mo><mi mathvariant="normal">cos</mi><mo>(</mo>${phase}<mo>)</mo>`)}${math('位相 φ(t) = 2πfc t + 2πΔf ∫0からt m(τ) dτ', `${phase}<mo>=</mo><mn>2</mn><mi>π</mi>${fc}<mi>t</mi><mo>+</mo><mn>2</mn><mi>π</mi><mi>Δf</mi><msubsup><mo>∫</mo><mn>0</mn><mi>t</mi></msubsup><mi>m</mi><mo>(</mo><mi>τ</mi><mo>)</mo><mspace width="0.2em"/><mi mathvariant="normal">d</mi><mi>τ</mi>`)}<p><b>φ(t)</b>（ファイ）は波の進み具合「位相」。周波数の変化を積分して位相に反映します。積分の中の <b>τ</b>（タウ）も時間を表します。式は雑音のない連続時間のモデルで、図は時間を細かく区切って計算しています。</p></details></section>
  </div>`;
}

export function createRadioLab(id, nodesById) {
  const lab = radioLabs.find(item => item.id === id);
  const element = document.createElement('article');
  element.className = 'string-lab science-lab radio-lab';
  element.innerHTML = `<a class="lab-back" href="#labs">← 体験一覧へ</a>
    <header class="lab-heading"><p class="micro-label">${lab.category}</p><h1>${lab.title}</h1><p>${lab.question}</p></header>
    <div class="science-workbench"><section class="science-stage"><canvas width="1440" height="${id === 'radio' ? 1000 : 800}" role="img" aria-label="${lab.title}。操作結果は図の下にも表示します。"></canvas><p class="science-reading" data-reading></p></section>
    <section class="lab-controls" aria-label="実験の操作"><div class="radio-switch" data-switch></div><div data-controls></div><div class="science-actions" data-actions></div><p class="lab-status" data-status role="status">設定を変えて試してみよう。</p></section></div>
    <section class="lab-discovery"><span class="micro-label">気づくヒント</span><h2>${lab.lesson}</h2><p>${lab.everyday}</p></section>
    <section class="lab-equation"><div><p class="micro-label">仕組みの裏側</p>${id === 'radio' ? radioFormulas() : `<h2>${lab.formula}</h2>`}<details class="radio-model-details"><summary>この実験の条件・省略していること</summary><p>${lab.limit}</p></details></div><div class="lab-school"><h2>学校の勉強へつなげる</h2><div data-links></div></div></section>`;
  const $ = selector => element.querySelector(selector);
  const ctx = $('canvas').getContext('2d'), status = $('[data-status]'), reading = $('[data-reading]');
  if (!ctx) { status.textContent = 'このブラウザでは図を表示できません。'; return { element, dispose() {} }; }
  ctx.scale(2, 2);
  const values = Object.fromEntries(lab.controls.map(([key,,,,,value]) => [key,value]));
  const inputs = new Map();
  let mode = 'am', noiseType = 'amplitude', disposed = false, audio, source, gain, token = 0;
  let running = false, frame = 0, last = 0, time = 0, playButton;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  for (const [key,label,min,max,step,value,unit] of lab.controls) {
    const holder = document.createElement('div');
    holder.innerHTML = `<label for="radio-${key}">${label}<output for="radio-${key}">${value}${unit}</output></label><input id="radio-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;
    const input = holder.querySelector('input'); inputs.set(key,input);
    input.addEventListener('input', () => {
      values[key] = Number(input.value); holder.querySelector('output').textContent = `${Number(values[key].toFixed(2))}${unit}`;
      stopAudio(); render(); status.textContent = '設定を変更しました。';
    });
    $('[data-controls]').append(holder);
  }
  for (const nodeId of lab.nodes) {
    const a = document.createElement('a'); a.href = `#node=${nodeId}`; a.textContent = nodesById.get(nodeId).name; $('[data-links]').append(a);
  }
  function button(label, handler, parent = $('[data-actions]')) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click',handler); parent.append(b); return b;
  }
  function set(key,value) { const input = inputs.get(key); input.value = value; input.dispatchEvent(new Event('input')); }
  if (id === 'radio') {
    const buttons = ['am','fm'].map(type => {
      const b = button(type === 'am' ? 'AM · 高さにのせる' : 'FM · 間隔にのせる', () => {
        mode = type; stopAudio(); buttons.forEach((item,i) => item.setAttribute('aria-pressed', String(['am','fm'][i] === mode)));
        render(); status.textContent = `${mode.toUpperCase()}に切り替えました。`;
      }, $('[data-switch]'));
      b.setAttribute('aria-pressed', String(type === mode)); return b;
    });
    const choice = document.createElement('div');
    choice.innerHTML = '<label for="radio-noise-type">電波に加える乱れ</label><select id="radio-noise-type"><option value="amplitude">電波の高さが揺れる</option><option value="additive">別の電気信号が混ざる</option></select><p data-noise-help></p>';
    choice.querySelector('select').addEventListener('change', event => { noiseType = event.target.value; stopAudio(); render(); status.textContent = '雑音の種類を変更しました。'; });
    $('[data-controls]').append(choice);
    button('① 元の音（3秒）', () => playAudio(false)); button('④ 取り出した音（3秒）', () => playAudio(true));
    button('■ 音を止める', () => { stopAudio(); status.textContent = '音を停止しました。'; });
    const volume = document.createElement('div');
    volume.innerHTML = '<label for="radio-volume">音量<output for="radio-volume">20%</output></label><input id="radio-volume" type="range" min="0" max="100" value="20">';
    volume.querySelector('input').addEventListener('input', event => {
      volume.querySelector('output').textContent = `${event.target.value}%`;
      if (gain) gain.gain.setTargetAtTime(Number(event.target.value) / 100 * .12, audio.currentTime, .015);
    });
    $('[data-actions]').after(volume);
  } else if (id === 'em-wave') {
    playButton = button('▶ 動かす', () => {
      if (running) pause();
      else if (reduced.matches) { time += .15; render(); status.textContent = '動きを減らす設定に合わせて1コマ進めました。'; }
      else { running = true; last = performance.now(); playButton.textContent = 'Ⅱ 一時停止'; frame = requestAnimationFrame(tick); }
    });
    button('1コマ進める', () => { pause(); time += .15; render(); });
    button('最初から', () => { pause(); time = 0; render(); });
  } else if (id === 'spectrum') {
    for (const [label,f] of [['AM 1MHz',1e6],['FM 100MHz',1e8],['Wi-Fi 2.4GHz',2.4e9],['緑の光 550nm',C / 550e-9],['X線 0.1nm',C / 1e-10]]) button(label, () => set('exponent',Math.log10(f)));
  } else for (const angle of [0,45,90,180]) button(`${angle}°`, () => set('angle',angle));

  function stopAudio() {
    token++;
    if (source) { source.onended = null; try { source.stop(); } catch {} source.disconnect(); source = null; }
    if (gain) { gain.disconnect(); gain = null; }
  }
  async function playAudio(received) {
    stopAudio(); const attempt = token;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('unsupported');
      audio ||= new Audio(); await audio.resume();
      if (disposed || document.hidden || token !== attempt) return;
      const signal = radioSignal({ ...values, mode, noiseType, duration: 3 });
      const samples = audioSamples(received ? signal.recovered : signal.original);
      const buffer = audio.createBuffer(1,samples.length,96000); buffer.copyToChannel(samples,0);
      source = audio.createBufferSource(); source.buffer = buffer; gain = audio.createGain();
      gain.gain.value = Number($('#radio-volume').value) / 100 * .12;
      source.connect(gain); gain.connect(audio.destination);
      source.onended = () => { if (token === attempt) { stopAudio(); status.textContent = '再生が終わりました。もう一方の音と比べてみよう。'; } };
      source.start(); status.textContent = `${received ? '受信した音' : '元の音'}を3秒間再生します。`;
    } catch { if (!disposed && token === attempt) { stopAudio(); status.textContent = '音を再生できませんでした。波形で比べてみよう。'; } }
  }
  function pause() { running = false; cancelAnimationFrame(frame); if (playButton) playButton.textContent = '▶ 動かす'; }
  function tick(now) {
    if (!running || disposed) return;
    time += Math.min(.05,(now-last)/1000); last = now; render(); frame = requestAnimationFrame(tick);
  }
  function text(label,x,y,color = '#eaf3ff',size = 17) { ctx.fillStyle = color; ctx.font = `${size}px sans-serif`; ctx.fillText(label,x,y); }
  function line(x1,y1,x2,y2,color,width = 2) { ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke(); }
  function path(points,color,width = 2) { ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke(); }
  function render() {
    ctx.fillStyle = '#0c192b'; ctx.fillRect(0,0,720,id === 'radio' ? 500 : 400);
    if (id === 'radio') {
      const signal = radioSignal({...values,mode,noiseType,duration:.005});
      text(`${mode.toUpperCase()}  音 → 変調 → 受信 → 復調（5ms）`,26,32,'#b9d4ed',19);
      const receivedLabel = values.noise === 0 ? '③ 音を載せた電波（受信側・雑音なし）' : noiseType === 'amplitude' ? '③ 音を載せた電波（受信側・高さが揺れた）' : '③ 音を載せた電波（受信側・雑音が混ざった）';
      $('[data-noise-help]').textContent = values.noise === 0 ? '今は雑音0。送った電波が、そのまま届いた状態です。強さを上げると、途中で電波が乱れた場合を試せます。' : noiseType === 'amplitude' ? '届く電波の高さが、送りたい音とは関係なく揺れる状態を再現しています。' : '送りたい音とは無関係な電気信号が、届く電波に混ざる状態を再現しています。';
      const rows = [['① 信号波：送りたい音',signal.original,100,'#77e3c7',29],['② 搬送波：音を運ぶための波',signal.carrier,210,'#bba3ff',22],[receivedLabel,signal.received,320,'#6fbaff',22],['④ 電波から取り出した音',signal.recovered,430,'#ffca7e',29]];
      ctx.save(); ctx.beginPath(); ctx.rect(24,45,672,445); ctx.clip();
      for (const [label,samples,y,color,scale] of rows) {
        text(label,26,y-39,color,15); line(26,y,694,y,'#304259',1);
        path(Array.from(samples,(v,n) => [26+n/(samples.length-1)*668,y-Math.max(-1.3,Math.min(1.3,v*scale/35))*35]),color,1.4);
      }
      ctx.restore();
      reading.textContent = `${mode.toUpperCase()}：${values.frequency}Hzの音。${mode === 'am' ? '音に合わせて電波の高さが変わります。' : '音に合わせて電波の間隔が変わります。'} ${values.noise === 0 ? '①と④の波を比べよう。電波から元の音を取り出せています。' : noiseType === 'amplitude' && mode === 'fm' ? 'この理想的なFMの受信では、高さだけの揺れは取り出した音に現れません。' : '電波の乱れが、取り出した音にも現れます。'} ④は音を整えるフィルターを通す前の波形。図の大きさは固定で、はみ出す振幅は切り詰めています。`;
    } else if (id === 'em-wave') {
      text('青：電場 E　赤：磁場 B',26,34); text('進行方向 →',548,364,'#94eac6');
      line(35,210,685,210,'#879ab2');
      const electric = [],magnetic = [];
      for (let n=0;n<=240;n++) {
        const x=65+n/240*580, s=Math.sin(TAU*(values.cycles*(n/240-.25*time)))*values.amplitude;
        electric.push([x,210-95*s]); magnetic.push([x+38*s,210+55*s]);
        if(n%12===0) { line(x,210,x,210-95*s,'#3274a5',1); line(x,210,x+38*s,210+55*s,'#8b3e62',1); }
      }
      path(magnetic,'#ff88b4',3); path(electric,'#64c7ff',3);
      text('同位相 · 互いに直角 · 真空中の平面波',26,389,'#a7bdd2',15);
      reading.textContent = `電場と磁場は同じ位置で一緒に0になり、一緒に最大になります。画面内に${values.cycles}波。赤い波は奥行き方向の揺れを斜めに表示しています。`;
    } else if (id === 'spectrum') {
      const f=10**values.exponent,l=wavelength(f),index=bounds.findIndex(b=>f<b);
      text(bands[index],30,52,colors[index],31); text(`周波数 ${hz(f)}`,30,99); text(`波長 ${meters(l)}`,30,136);
      let previous=4;
      bounds.forEach((b,i)=>{ const next=Math.min(21,Math.log10(b)); ctx.fillStyle=colors[i]; ctx.fillRect(30+(previous-4)/17*660,174,(next-previous)/17*660,28); previous=next; });
      const x=30+(values.exponent-4)/17*660; line(x,162,x,218,'#ffffff',3);
      text('電波 → 赤外線 → 可視光 → 紫外線 → X線 → γ線',30,247,'#b5c9dc',17);
      path(Array.from({length:241},(_,n)=>[60+n/240*600,308-32*Math.sin(TAU*n/240)]),colors[index],3);
      line(60,365,660,365,'#809bb7'); text(`← 1波長 = ${meters(l)} →`,210,389,colors[index]);
      reading.textContent = `${hz(f)}の${bands[index]}。真空中の波長は${meters(l)}。${index<=1?'マイクロ波も電波の一部です。':''}下の波は常に1周期を表示しています。`;
    } else {
      const a=values.angle*Math.PI/180,p=polarizationPower(values.angle);
      text('電波を正面から見る',28,35); text('電場 E ↕',45,80,'#69c4ff');
      line(235,83,235,323,'#69c4ff',4);
      const dx=110*Math.sin(a),dy=110*Math.cos(a); line(235-dx,203+dy,235+dx,203-dy,'#ffcf79',9);
      text(`アンテナ ${values.angle}°`,355,121,'#ffcf79'); text(`受信電力 ${(100*p).toFixed(1)}%`,355,178,'#eaf3ff',25);
      ctx.fillStyle='#273e52';ctx.fillRect(355,205,300,26);ctx.fillStyle='#77e3c7';ctx.fillRect(355,205,300*p,26);
      text('青：電場の向き',30,360,'#69c4ff');text('黄：アンテナの向き',290,360,'#ffcf79');
      reading.textContent = `向きのずれ${values.angle}°。偏波による受信電力の比は${(100*p).toFixed(1)}%。${p<1e-10?'直交するので、この理想モデルでは受信できません。':'アンテナ方向の電場成分を二乗すると、電力の比になります。'}`;
    }
  }
  function visibility() { if(document.hidden) { pause(); stopAudio(); status.textContent='画面が隠れたので停止しました。'; } }
  function leave() { pause(); stopAudio(); }
  function reducedChange() { if(reduced.matches) pause(); }
  document.addEventListener('visibilitychange',visibility); window.addEventListener('pagehide',leave); reduced.addEventListener('change',reducedChange);
  render();
  return {element,dispose() { disposed=true; leave(); document.removeEventListener('visibilitychange',visibility); window.removeEventListener('pagehide',leave); reduced.removeEventListener('change',reducedChange); if(audio) audio.close().catch(()=>{}); }};
}
