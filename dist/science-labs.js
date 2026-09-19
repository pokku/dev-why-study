import { labs } from './lab-catalog.js';
import { TAU, radians, prismRay, interferenceAmplitude, orbitStart, orbitStep, orbitEnergy, pendulumStep, PENDULUM_OMEGA, heatStep, dct2, inverseDct2 } from './lab-models.js';

export function createLabGallery() {
  const page = document.createElement('article');
  page.className = 'string-lab';
  page.innerHTML = '<a class="lab-back" href="#">← 知識の入口へ</a><header class="lab-heading"><p class="micro-label">PLAY · NOTICE · UNDERSTAND</p><h1>触ったら、勉強がつながった。</h1><p>光、音、宇宙、いつもの暮らし。気になる実験をひとつ、開いてみよう。</p></header><div class="lab-gallery"></div>';
  for (const lab of labs) {
    const card = document.createElement('a');
    card.className = `lab-gallery-card lab-color-${lab.id}`;
    card.href = `#lab=${lab.id}`;
    card.innerHTML = `<div class="lab-gallery-art" aria-hidden="true">${lab.icon}</div><div><small>${lab.category}</small><h2>${lab.title}</h2><p>${lab.question}</p><b>試してみる ↗</b></div>`;
    page.querySelector('.lab-gallery').append(card);
  }
  return page;
}

export function createScienceLab(id, nodesById) {
  const lab = labs.find(item => item.id === id);
  const element = document.createElement('article');
  element.className = 'string-lab science-lab';
  element.innerHTML = `<a class="lab-back" href="#labs">← 体験一覧へ</a>
    <header class="lab-heading"><p class="micro-label">${lab.category}</p><h1>${lab.title}</h1><p>${lab.question}</p></header>
    <div class="science-workbench"><section class="science-stage"><canvas width="1440" height="800" role="img" aria-label="${lab.title}の図。操作結果は図の下にも文章で表示します。"></canvas><p class="science-reading" data-reading aria-live="off"></p></section>
    <section class="lab-controls" aria-label="実験の操作"><div data-sliders></div><div class="science-actions" data-actions></div><p class="lab-status" role="status" data-status>設定を変えて試してみよう。</p></section></div>
    <section class="lab-discovery"><span class="micro-label">気づくヒント</span><h2>${lab.lesson}</h2><p>${lab.everyday}</p></section>
    <section class="lab-equation"><div><p class="micro-label">仕組みの裏側</p><h2>${lab.formula}</h2><p class="lab-model-note">${lab.limit}</p></div><div class="lab-school"><h2>学校の勉強へつなげる</h2><div data-links></div></div></section>`;
  const query = selector => element.querySelector(selector);
  const status = query('[data-status]'), reading = query('[data-reading]'), canvas = query('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) { status.textContent = 'このブラウザでは図を表示できません。'; return { element, dispose() {} }; }
  ctx.scale(2, 2);
  const values = Object.fromEntries(lab.controls.map(([key,,,,,value]) => [key, value]));
  const inputs = new Map();
  for (const [key, label, min, max, step, value, unit] of lab.controls) {
    const holder = document.createElement('div');
    holder.innerHTML = `<label for="lab-${key}">${label}<output for="lab-${key}">${value}${unit}</output></label><input id="lab-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;
    const input = holder.querySelector('input');
    inputs.set(key, input);
    input.addEventListener('input', () => {
      values[key] = Number(input.value);
      holder.querySelector('output').textContent = `${input.value}${unit}`;
      stopAudio();
      if (id === 'orbit' || id === 'pendulum') resetState();
      if (id === 'image') reconstruction = inverseDct2(coefficients, 32, values.cutoff);
      render();
      status.textContent = lab.audio ? '設定を変更しました。「音を聞く」で確かめよう。' : '設定を変更しました。';
    });
    query('[data-sliders]').append(holder);
  }
  for (const nodeId of lab.nodes) {
    const a = document.createElement('a');
    a.href = `#node=${nodeId}`;
    a.textContent = nodesById.get(nodeId).name;
    query('[data-links]').append(a);
  }
  function button(label, handler) {
    const node = document.createElement('button');
    node.type = 'button'; node.textContent = label; node.addEventListener('click', handler);
    query('[data-actions]').append(node); return node;
  }
  const animated = !['prism', 'image'].includes(id);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let running = false, frame = 0, last = 0, time = 0, disposed = false, audioToken = 0, audioTimer = 0, loadToken = 0;
  let audio, master, voices = [], orbit, trail, pendulum, temperatures, heatClock = 0;
  let original, coefficients, reconstruction;
  let playButton;
  if (animated) {
    playButton = button('▶ 動かす', () => {
      if (running) pause();
      else if (reduced.matches) { advance(.1); render(); status.textContent = '動きを減らす設定に合わせて、1コマ進めました。'; }
      else { running = true; last = performance.now(); playButton.textContent = 'Ⅱ 一時停止'; frame = requestAnimationFrame(tick); }
    });
    button('1コマ進める', () => { pause(); advance(.1); render(); });
    button('最初から', () => { pause(); stopAudio(); resetState(); render(); status.textContent = '今の設定で最初に戻しました。'; });
  }
  if (lab.audio) {
    button('♪ 音を聞く（6秒）', playAudio);
    button('■ 音を止める', () => { stopAudio(); status.textContent = '音を停止しました。'; });
    const volume = document.createElement('div');
    volume.innerHTML = '<label for="science-volume">音量<output for="science-volume">20%</output></label><input id="science-volume" type="range" min="0" max="100" value="20">';
    volume.querySelector('input').addEventListener('input', event => {
      volume.querySelector('output').textContent = `${event.target.value}%`;
      if (master) master.gain.setTargetAtTime(Number(event.target.value) / 100 * .25, audio.currentTime, .015);
    });
    query('[data-actions]').after(volume);
  }
  if (id === 'orbit') {
    button('円軌道の速さ', () => setControl('speed', 1));
    button('脱出できる速さ', () => setControl('speed', 1.45));
  }
  if (id === 'pendulum') {
    button('同じリズム', () => setControl('rhythm', 1));
    button('リズムをずらす', () => setControl('rhythm', 1.4));
  }
  if (id === 'cancel') {
    button('強め合う 0°', () => setControl('phase', 0));
    button('打ち消す 180°', () => setControl('phase', 180));
  }
  if (id === 'heat') {
    button('中央を温める', () => { warm(20, 12); render(); });
    canvas.addEventListener('pointerdown', event => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * 720, y = (event.clientY - rect.top) / rect.height * 400;
      if (x >= 60 && x < 660 && y >= 35 && y < 347) { warm(Math.floor((x - 60) / 15), Math.floor((y - 35) / 13)); render(); }
    });
    canvas.setAttribute('aria-label', '温度分布。板をタップするか、中央を温めるボタンで熱を加えられます。');
  }
  if (id === 'image') {
    const upload = document.createElement('div');
    upload.innerHTML = '<label for="lab-photo">自分の写真で試す</label><input id="lab-photo" type="file" accept="image/png,image/jpeg,image/webp"><p>PNG・JPEG・WebP、10MBまで。画像は送信せず、端末内だけで処理します。</p>';
    upload.querySelector('input').addEventListener('change', async event => {
      const file = event.target.files[0];
      if (!file) return;
      const token = ++loadToken;
      if (file.size > 10 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { status.textContent = '10MB以下のPNG・JPEG・WebPを選んでください。'; return; }
      const url = URL.createObjectURL(file), image = new Image();
      try {
        image.src = url; await image.decode();
        if (disposed || token !== loadToken) return;
        if (image.naturalWidth * image.naturalHeight > 20000000) throw new Error('large');
        loadImage(image); render(); status.textContent = '写真を32×32の白黒画像として読み込みました。';
      } catch { if (!disposed && token === loadToken) status.textContent = '読み込めませんでした。2000万画素以下の画像を選んでください。'; }
      finally { URL.revokeObjectURL(url); }
    });
    query('[data-actions]').after(upload);
    button('サンプルに戻す', () => { loadToken++; sampleImage(); render(); status.textContent = 'サンプルに戻しました。'; });
  }

  function setControl(key, value) { inputs.get(key).value = value; inputs.get(key).dispatchEvent(new Event('input')); }
  function pause() { running = false; cancelAnimationFrame(frame); if (playButton) playButton.textContent = '▶ 動かす'; }
  function resetState() {
    time = 0; heatClock = 0;
    orbit = orbitStart(values.speed); trail = [{ ...orbit }];
    pendulum = { angle: .015, velocity: 0, t: 0 };
    temperatures = new Float64Array(40 * 24); warm(20, 12);
  }
  function warm(x, y) {
    for (let row = 0; row < 24; row++) for (let col = 0; col < 40; col++) {
      const i = row * 40 + col;
      temperatures[i] = Math.min(1, temperatures[i] + Math.exp(-((x - col) ** 2 + (y - row) ** 2) / 5));
    }
  }
  function advance(dt) {
    time += dt;
    if (id === 'orbit') {
      const steps = Math.ceil(dt * 2 / .004), h = dt * 2 / steps;
      for (let i = 0; i < steps; i++) {
        if (Math.hypot(orbit.x, orbit.y) <= .18 || Math.hypot(orbit.x, orbit.y) >= 6) { pause(); break; }
        orbit = orbitStep(orbit, h); trail.push({ ...orbit });
        if (trail.length > 3500) trail.shift();
      }
    }
    if (id === 'pendulum') {
      const steps = Math.ceil(dt / .004);
      for (let i = 0; i < steps; i++) pendulum = pendulumStep(pendulum, dt / steps, values.rhythm);
    }
    if (id === 'heat') {
      heatClock += dt * 60;
      while (heatClock >= 1) { temperatures = heatStep(temperatures, 40, 24, values.diffusion); heatClock--; }
    }
  }
  function tick(now) {
    if (!running || disposed) return;
    advance(Math.min(.05, (now - last) / 1000)); last = now; render();
    if (running) frame = requestAnimationFrame(tick);
  }
  function line(points, color, width = 2) {
    ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }
  function label(text, x, y, color = '#b9cce3', size = 16) { ctx.fillStyle = color; ctx.font = `${size}px sans-serif`; ctx.fillText(text, x, y); }
  function dot(x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.fill(); }
  function curve(base, fn, color, amplitude = 32) { line(Array.from({length: 661}, (_, i) => [30 + i, base - amplitude * fn(i / 660)]), color); }

  function render() {
    ctx.fillStyle = '#101d38'; ctx.fillRect(0,0,720,400);
    if (id === 'prism') {
      ctx.fillStyle = '#25496a'; ctx.beginPath(); ctx.moveTo(330,55); ctx.lineTo(185,306.15); ctx.lineTo(475,306.15); ctx.closePath(); ctx.fill();
      line([[330,55],[185,306.15],[475,306.15],[330,55]], '#91bada');
      const colors = ['#ff625f','#ffa54f','#ffe278','#7ee68c','#65d6ff','#8795ff','#cb8bff'];
      const rays = colors.map((_, i) => prismRay(1.51 + .025 * values.dispersion * i / 6, values.incidence));
      const entry = rays[0].entry, incoming = rays[0].incoming;
      line([[30, entry.y + (30 - entry.x) * Math.tan(incoming)], [entry.x, entry.y]], '#fff', 4);
      rays.forEach((ray, i) => {
        const targetX = Math.min(680, ray.exit.x + (355 - ray.exit.y) / Math.tan(ray.outgoing));
        line([[entry.x,entry.y],[ray.exit.x,ray.exit.y],[targetX,ray.exit.y + (targetX-ray.exit.x)*Math.tan(ray.outgoing)]], values.dispersion === 0 ? '#fff' : colors[i], 2.5);
      });
      label('白い光', 32, 75, '#fff'); label('プリズム', 275, 337);
      colors.forEach((c,i) => { ctx.fillStyle=c; ctx.fillRect(525+i*20,30,20,12); });
      label('赤 → 紫', 542, 64);
      reading.textContent = `赤と紫の出口の角度差：${((rays[6].outgoing - rays[0].outgoing) * 180 / Math.PI).toFixed(2)}°。${values.dispersion === 0 ? '屈折率が同じなので重なっています。' : '紫のほうが大きく曲がります。'}`;
    }
    if (id === 'beats') {
      const d = values.difference;
      label('青：220 Hz　黄：' + (220+d) + ' Hz ／ 横幅 0.04秒',30,36);
      curve(110, x=>Math.sin(TAU*220*(x*.04+time)), '#67d7ff');
      curve(110, x=>Math.sin(TAU*(220+d)*(x*.04+time)), '#ffd557');
      label('合成した波と包絡線 ／ 横幅 1秒',30,205);
      curve(285, x=>(Math.sin(TAU*220*(x+time))+Math.sin(TAU*(220+d)*(x+time)))/2, '#a6b6ce',48);
      curve(285, x=>Math.abs(Math.cos(Math.PI*d*(x+time))), '#6de0be',48);
      curve(285, x=>-Math.abs(Math.cos(Math.PI*d*(x+time))), '#6de0be',48);
      reading.textContent = d === 0 ? '周波数差0Hz：うなりはありません。' : `1秒間に${d}回のうなり。周波数の差が音の強弱のリズムになります。`;
    }
    if (id === 'cancel') {
      const phase = radians(values.phase);
      label('もとの波',30,32,'#67d7ff'); label('ずらした波',30,155,'#ffd557'); label('2つを足した波（同じ縦の尺度）',30,264,'#6de0be');
      const a=x=>Math.sin(TAU*(4*x-time*.6)), b=x=>Math.sin(TAU*(4*x-time*.6)+phase);
      curve(83,a,'#67d7ff'); curve(198,b,'#ffd557'); curve(327,x=>a(x)+b(x),'#6de0be');
      reading.textContent = `ずれ${values.phase}°：合成振幅は1つの波の${interferenceAmplitude(phase).toFixed(2)}倍。図はスローの模式表示、音は220Hzです。`;
    }
    if (id === 'orbit') {
      const radius = Math.hypot(orbit.x, orbit.y), maxR = Math.max(1.5,...trail.map(p=>Math.hypot(p.x,p.y))), scale = 155/maxR;
      for(let i=0;i<35;i++) dot((i*137+29)%720,(i*89+18)%400,1,'#405879');
      line(trail.map(p=>[360+p.x*scale,200-p.y*scale]),'#6de0be');
      dot(360,200,Math.max(5,.18*scale),'#ffd557'); dot(360+orbit.x*scale,200-orbit.y*scale,6,'#8ee5ff');
      label('中心天体',375,205); label('黄色：中心天体　青：投げた小天体',22,35);
      const energy = orbitEnergy(orbitStart(values.speed));
      reading.textContent = radius <= .18 ? '中心の天体に衝突しました。速さを変えてもう一度。' : radius >= 6 ? '表示の計算範囲の外まで進みました。' : `初速${values.speed.toFixed(2)}倍：${energy >= 0 ? '脱出可能なエネルギー' : Math.abs(values.speed-1)<.001 ? 'ほぼ円軌道' : '束縛された軌道（中心天体との衝突もあり得ます）'}。重力は常に中心向きです。`;
    }
    if (id === 'pendulum') {
      const x=360+230*Math.sin(pendulum.angle), y=60+230*Math.cos(pendulum.angle);
      line([[210,60],[510,60]],'#6e849e',7); line([[360,60],[360,302]],'#334967',1); line([[360,60],[x,y]],'#c5d6eb',3); dot(x,y,18,'#ffd557');
      const push = Math.sin(values.rhythm*PENDULUM_OMEGA*pendulum.t);
      line([[x,y+40],[x+push*85,y+40]], '#6de0be',5);
      label('緑：いま押す向きと強さ',30,37); label(`押すリズム ${values.rhythm.toFixed(2)}倍`,30,370);
      reading.textContent = `経過${pendulum.t.toFixed(1)}秒 ／ 傾き${(pendulum.angle*180/Math.PI).toFixed(1)}°。1倍付近で振れが育ちやすくなります。`;
    }
    if (id === 'heat') {
      for(let y=0;y<24;y++) for(let x=0;x<40;x++) { const t=temperatures[y*40+x]; ctx.fillStyle=`rgb(${Math.round(20+235*t)},${Math.round(40+155*Math.sqrt(t))},${Math.round(105*(1-t))})`;ctx.fillRect(60+x*15,35+y*13,15,13); }
      label('低温（青） → 高温（黄）　板をタップして加熱',60,380);
      const mean=temperatures.reduce((a,b)=>a+b,0)/temperatures.length;
      reading.textContent = `平均の相対温度 ${mean.toFixed(4)} ／ 最高 ${Math.max(...temperatures).toFixed(3)}。加熱していない間は平均を保ったまま広がります。`;
    }
    if (id === 'image') {
      const renderPixels = (pixels,left,residual=false) => {
        for(let y=0;y<32;y++) for(let x=0;x<32;x++) { const i=y*32+x, v=Math.max(0,Math.min(255,Math.round(residual?128+pixels[i]:pixels[i])));ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(left+x*6,95+y*6,6,6); }
      };
      renderPixels(original,30); renderPixels(reconstruction,264); renderPixels(original.map((v,i)=>v-reconstruction[i]),498,true);
      label('元の32×32画像',32,60); label('残した波で復元',265,60); label('取り除いた細部',498,60);
      label('粗い模様だけ ← 周波数の範囲 → 細部も残す',72,342);
      const error=Math.sqrt(original.reduce((s,v,i)=>s+(v-reconstruction[i])**2,0)/1024);
      reading.textContent = `残した成分 ${values.cutoff**2} / 1024 ／ 復元誤差 ${error.toFixed(2)}（明るさ0〜255）。${values.cutoff===32?'すべての成分を戻しました。':''}`;
    }
  }
  function loadImage(image) {
    const small=document.createElement('canvas');small.width=32;small.height=32;
    const g=small.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,32,32);
    const width=image.naturalWidth || image.width, height=image.naturalHeight || image.height, side=Math.min(width,height);
    g.drawImage(image,(width-side)/2,(height-side)/2,side,side,0,0,32,32);
    const pixels=g.getImageData(0,0,32,32).data;
    original=Float64Array.from({length:1024},(_,i)=>.2126*pixels[i*4]+.7152*pixels[i*4+1]+.0722*pixels[i*4+2]);
    coefficients=dct2(original,32); reconstruction=inverseDct2(coefficients,32,values.cutoff);
  }
  function sampleImage() {
    const sample=document.createElement('canvas');sample.width=256;sample.height=256;const g=sample.getContext('2d');
    const gradient=g.createLinearGradient(0,0,0,256);gradient.addColorStop(0,'#b8d9f5');gradient.addColorStop(1,'#31566b');g.fillStyle=gradient;g.fillRect(0,0,256,256);
    g.fillStyle='#fff1a0';g.beginPath();g.arc(190,65,30,0,TAU);g.fill();
    g.fillStyle='#233c42';g.beginPath();g.moveTo(0,210);g.lineTo(92,74);g.lineTo(160,178);g.lineTo(200,135);g.lineTo(256,205);g.lineTo(256,256);g.lineTo(0,256);g.fill();
    for(let i=0;i<9;i++){g.fillStyle=i%2?'#c4caca':'#688989';g.fillRect(0,219+i*4,256,2);}
    loadImage(sample);
  }
  function stopAudio() {
    audioToken++;clearTimeout(audioTimer);
    for(const voice of voices) { try { voice.stop(); } catch {} voice.disconnect(); }
    voices=[];
  }
  async function playAudio() {
    stopAudio();const token=audioToken;
    try {
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio) throw new Error('Audio unavailable');
      if(!audio){audio=new Audio();master=audio.createGain();master.connect(audio.destination);}
      await audio.resume(); if(disposed||token!==audioToken||document.hidden)return;
      if(audio.state!=='running')throw new Error('Audio suspended');
      const now=audio.currentTime+.03;
      master.gain.cancelScheduledValues(audio.currentTime);
      master.gain.setValueAtTime(0,audio.currentTime);
      master.gain.linearRampToValueAtTime(Number(query('#science-volume').value)/100*.25,now+.03);
      for(let i=0;i<2;i++) {
        const oscillator=audio.createOscillator();oscillator.frequency.value=220+(id==='beats'&&i?values.difference:0);
        const phase=id==='cancel'&&i?radians(values.phase):0;
        oscillator.setPeriodicWave(audio.createPeriodicWave(new Float32Array([0,Math.sin(phase)]),new Float32Array([0,Math.cos(phase)])));
        oscillator.connect(master);oscillator.start(now);oscillator.stop(now+6);oscillator.onended=()=>oscillator.disconnect();voices.push(oscillator);
      }
      status.textContent='6秒間、合成音を鳴らします。設定を変えると音は止まります。';
      audioTimer=setTimeout(()=>{stopAudio();if(!disposed)status.textContent='再生が終わりました。';},6100);
    } catch { if(!disposed&&token===audioToken)status.textContent='音を開始できませんでした。図はそのまま試せます。'; }
  }
  const hidden=()=>{if(document.hidden){pause();stopAudio();}};
  const leave=()=>{pause();stopAudio();};
  document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',leave);
  resetState();if(id==='image')sampleImage();render();
  return { element,dispose(){disposed=true;loadToken++;pause();stopAudio();document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',leave);if(audio&&audio.state!=='closed')audio.close().catch(()=>{});} };
}
