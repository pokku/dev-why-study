import { WAVE_SPEED, stringFrequency, fundamentalShape, pitchName } from './string-physics.js';
import { formulas, formulaMarkup } from './discoveries.js';

export function createStringLab() {
  const element = document.createElement('article');
  element.className = 'string-lab';
  element.innerHTML = `
    <a class="lab-back" href="#node=wave-equation">← 波動方程式のマップへ</a>
    <header class="lab-heading"><p class="micro-label">TOUCH THE EQUATION · 01</p>
      <h1>この式から、音楽が聞こえる。</h1>
      <p>弦を短くしたら、音はどう変わる？<br>長さを変えて、弾き比べてみよう。</p></header>
    <div class="lab-workbench">
      <section class="lab-stage" aria-label="弦の振動を観察">
        <div class="lab-stage-top"><span>ギターの弦のモデル</span><span>基本振動をスローで表示</span></div>
        <svg class="lab-string" viewBox="0 0 720 240" role="img" aria-label="両端を固定した弦の基本振動。実際より200倍遅く表示">
          <path d="M55 105H655" stroke="#526887" stroke-width="2" stroke-dasharray="5 7"/>
          <rect x="45" y="73" width="20" height="64" rx="5" fill="#6b83a5"/>
          <rect data-end x="645" y="73" width="20" height="64" rx="5" fill="#73d9c5"/>
          <path data-string fill="none" stroke="#ffd557" stroke-width="4" stroke-linecap="round"/>
          <circle data-dot r="7" fill="#fff4b8"/>
          <path data-measure fill="none" stroke="#7a91b1"/>
          <text data-length x="355" y="193" fill="#c8d7ed" text-anchor="middle" font-size="18"/>
          <text x="55" y="40" fill="#c8d7ed" font-size="16">固定端</text>
          <text data-end-label x="655" y="40" fill="#73d9c5" font-size="16" text-anchor="end">押さえる位置</text>
        </svg>
        <div class="lab-reading"><strong data-frequency></strong><span data-pitch></span></div>
        <p class="lab-stage-note">図は基本振動を200倍遅く、振幅を大きく表示。音は表示した周波数で鳴ります。</p>
      </section>
      <section class="lab-controls" aria-label="弦を変えて音を試す">
        <label for="string-length">振動する弦の長さ <output id="string-length-value" for="string-length"></output></label>
        <input id="string-length" type="range" min="21.7" max="65" step="0.1" value="65" aria-describedby="string-length-tip">
        <p id="string-length-tip">ギターの弦を指で押さえるように、振動する部分を短くします。張りの強さと弦の太さは同じです。</p>
        <button type="button" class="lab-play" data-play>▶ 弦を弾く</button>
        <div class="lab-compare"><button type="button" data-preset="65">65 cm を鳴らす</button><button type="button" data-preset="32.5">半分の長さを鳴らす</button></div>
        <label for="string-volume">音量 <output id="string-volume-value" for="string-volume">20%</output></label>
        <input id="string-volume" type="range" min="0" max="100" step="1" value="20">
        <button type="button" class="lab-stop" data-stop>■ 音と動きを止める</button>
        <p class="lab-status" data-status role="status">音はボタンを押したときだけ鳴ります。音量0でも動きを試せます。</p>
      </section>
    </div>
    <section class="lab-discovery" aria-labelledby="lab-discovery-title">
      <span class="micro-label">いま起きたこと</span><h2 id="lab-discovery-title" data-insight></h2>
      <p>同じ弦なら、長さを半分にすると振動数は2倍。音は1オクターブ高くなります。</p>
      <div class="lab-journey"><div><b>01　弦が振動する</b><p>短い弦ほど、同じ時間に多く振動します。</p></div><span aria-hidden="true">→</span><div><b>02　空気に伝わる</b><p>アコースティックギターでは、弦の振動が駒から胴へ伝わり、空気を揺らします。</p></div><span aria-hidden="true">→</span><div><b>03　音として聞こえる</b><p>空気の振動が耳に届くと音に。振動数の違いが音の高さの違いになります。</p></div></div>
    </section>
    <section class="lab-equation" aria-labelledby="lab-equation-title">
      <div><p class="micro-label">式と体験をつなぐ</p><h2 id="lab-equation-title">あの波動方程式が、弦の動きを表す。</h2>
      <p>両端が動かない弦の基本振動では、波長は弦の長さの2倍。この条件と波の速さから、音の高さが決まります。</p>
      <p class="lab-model-note">張力・線密度が一定の理想的な弦のモデルです。音は倍音を加えた合成音で、実物のギター音の再現ではありません。</p></div>
      <div class="lab-equations"><div class="lab-wave-equation">${formulaMarkup(formulas.find(f => f.nodeId === 'wave-equation'))}</div>
      <math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="振動数fは波の速さvを弦の長さLの2倍で割ったもの"><mi>f</mi><mo>=</mo><mfrac><mi>v</mi><mrow><mn>2</mn><mi>L</mi></mrow></mfrac></math>
      <p data-calculation></p><p>f：振動数　v：弦を伝わる波の速さ　L：弦の長さ</p></div>
    </section>
    <section class="lab-school" aria-labelledby="lab-school-title"><p class="micro-label">学校で習う、あの勉強へ</p><h2 id="lab-school-title">音楽の裏側に、数学と理科がいる。</h2>
      <div><a href="#node=inverse-proportion"><b>反比例</b><span>長さが半分、振動数が2倍になる関係を読む。</span></a><a href="#node=function"><b>関数</b><span>弦の長さを変えると、音の高さも変わる。</span></a><a href="#node=trigonometry"><b>三角関数</b><span>繰り返す振動を、sinやcosで表す。</span></a><a href="#node=wave"><b>波</b><span>振動が伝わる仕組みから、音や光へ。</span></a></div>
      <a class="lab-map-link" href="#node=guitar">ギターを中心に、知識のマップを広げる ↗</a>
    </section>`;

  const find = selector => element.querySelector(selector);
  const length = find('#string-length');
  const volume = find('#string-volume');
  const status = find('[data-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let context, master, voice, animation = 0, disposed = false, request = 0, started = 0;

  function draw(cycles = 0, amplitude = 0) {
    const width = 600 * Number(length.value) / 65;
    const end = 55 + width;
    const points = Array.from({ length: 101 }, (_, i) => {
      const x = i / 100;
      return `${i ? 'L' : 'M'}${55 + x * width},${105 - amplitude * fundamentalShape(x, cycles)}`;
    });
    find('[data-string]').setAttribute('d', points.join(' '));
    find('[data-dot]').setAttribute('cx', 55 + width / 2);
    find('[data-dot]').setAttribute('cy', 105 - amplitude * fundamentalShape(.5, cycles));
    find('[data-end]').setAttribute('x', end - 10);
    find('[data-end-label]').setAttribute('x', end);
    find('[data-measure]').setAttribute('d', `M55 158v12H${end}v-12`);
    find('[data-length]').setAttribute('x', 55 + width / 2);
    find('[data-length]').textContent = `${Number(length.value).toFixed(1)} cm`;
  }

  function stop(message) {
    request++;
    cancelAnimationFrame(animation);
    animation = 0;
    if (voice) {
      voice.oscillator.stop();
      voice.oscillator.disconnect();
      voice.envelope.disconnect();
      voice = null;
    }
    draw();
    if (message && !disposed) status.textContent = message;
  }

  function update() {
    const cm = Number(length.value), f = stringFrequency(cm), ratio = 65 / cm;
    find('#string-length-value').textContent = `${cm.toFixed(1)} cm`;
    find('[data-frequency]').textContent = `${f.toFixed(1)} Hz`;
    find('[data-pitch]').textContent = `近い音：${pitchName(f)} ／ 1秒間に約${Math.round(f)}回の振動`;
    find('[data-insight]').textContent = `${cm.toFixed(1)} cm にすると、振動数は基準の${ratio.toFixed(2)}倍。`;
    find('[data-calculation]').textContent = `${WAVE_SPEED} m/s ÷ (2 × ${(cm / 100).toFixed(3)} m) = ${f.toFixed(1)} Hz`;
    draw();
  }

  function animate(time) {
    const elapsed = (time - started) / 1000;
    if (disposed || elapsed >= 3) { stop('もう一度弾くか、長さを変えて比べてみよう。'); return; }
    const cycles = reducedMotion.matches ? 0 : elapsed * stringFrequency(Number(length.value)) / 200;
    draw(cycles, 40 * Math.exp(-elapsed * 1.3));
    animation = requestAnimationFrame(animate);
  }

  async function pluck() {
    stop();
    const token = request;
    let audioReady = false;
    if (Number(volume.value) > 0) {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) throw new Error('Web Audio unavailable');
        if (!context) {
          context = new Audio();
          master = context.createGain();
          master.gain.value = Number(volume.value) / 100 * .4;
          master.connect(context.destination);
        }
        await context.resume();
        if (disposed || token !== request || document.hidden) return;
        if (context.state !== 'running') throw new Error('Audio suspended');
        const oscillator = context.createOscillator();
        const real = new Float32Array(9), imag = new Float32Array(9);
        for (let n = 1; n < imag.length; n++) imag[n] = Math.sin(n * Math.PI * .23) / (n * n);
        oscillator.setPeriodicWave(context.createPeriodicWave(real, imag));
        oscillator.frequency.value = stringFrequency(Number(length.value));
        const envelope = context.createGain(), now = context.currentTime;
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(.65, now + .01);
        envelope.gain.exponentialRampToValueAtTime(.0001, now + 2.8);
        oscillator.connect(envelope).connect(master);
        voice = { oscillator, envelope };
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); if (voice?.oscillator === oscillator) voice = null; };
        oscillator.start();
        oscillator.stop(now + 3);
        audioReady = true;
      } catch {
        if (disposed || token !== request) return;
      }
    }
    if (disposed || token !== request || document.hidden) return;
    status.textContent = audioReady ? '弾いています。短い弦と長い弦を、聞き比べてみよう。' : Number(volume.value) === 0 ? '音量0で振動を表示しています。' : '音を開始できませんでした。振動は試せます。音はもう一度「弦を弾く」を押してください。';
    started = performance.now();
    animation = requestAnimationFrame(animate);
  }

  length.addEventListener('input', () => { stop('長さを変えました。「弦を弾く」で音を確かめよう。'); update(); });
  volume.addEventListener('input', () => {
    find('#string-volume-value').textContent = `${volume.value}%`;
    if (master) master.gain.setTargetAtTime(Number(volume.value) / 100 * .4, context.currentTime, .015);
  });
  find('[data-play]').addEventListener('click', pluck);
  find('[data-stop]').addEventListener('click', () => stop('停止しました。'));
  element.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    length.value = button.dataset.preset;
    update();
    pluck();
  }));
  const hidden = () => { if (document.hidden) stop('画面を離れたため停止しました。'); };
  const pagehide = () => stop();
  document.addEventListener('visibilitychange', hidden);
  window.addEventListener('pagehide', pagehide);
  update();
  return { element, dispose() {
    disposed = true;
    stop();
    document.removeEventListener('visibilitychange', hidden);
    window.removeEventListener('pagehide', pagehide);
    if (context && context.state !== 'closed') context.close().catch(() => {});
  } };
}
