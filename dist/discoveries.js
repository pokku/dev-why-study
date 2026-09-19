// Locally authored presentation markup. No external formula renderer is required.
const mi = (x) => `<mi>${x}</mi>`;
const op = (x) => `<mo>${x}</mo>`;
const row = (x) => `<mrow>${x}</mrow>`;
const sq = (x) => `<msup>${x}<mn>2</mn></msup>`;
const frac = (a, b) => `<mfrac>${row(a)}${row(b)}</mfrac>`;
const vector = (x) => `<mover>${mi(x)}${op('→')}</mover>`;
const dt = (x) => frac(op('∂') + x, op('∂') + mi('t'));
const d2 = (x, v) => frac(sq(op('∂')) + mi(x), op('∂') + sq(mi(v)));
const lines = (...xs) => `<mtable>${xs.map((x) => `<mtr><mtd>${row(x)}</mtd></mtr>`).join('')}</mtable>`;

export const formulas = [
  { nodeId: 'mass-energy', expression: mi('E') + op('=') + mi('m') + sq(mi('c')), spoken: 'E = mc2', hook: '太陽が輝く理由に、この式がいる。', symbols: 'E：静止エネルギー、m：質量、c：真空中の光の速さ。', condition: '物体が静止しているときのエネルギーと質量の関係。', trail: ['mass-energy', 'nuclear-fusion', 'sun'], basics: ['equation', 'atom'] },
  { nodeId: 'wave-equation', expression: d2('y', 't') + op('=') + sq(mi('v')) + d2('y', 'x'), spoken: '∂²y/∂t² = v² ∂²y/∂x²', hook: 'ギターの弦も、波のルールで動く。', symbols: 'y：弦の変位、x：位置、t：時間、v：波の速さ。∂ は一つの変数に注目した微分。', condition: '一様な弦の小さな振動などを表す、速さが一定の1次元の波動方程式。', trail: ['wave-equation', 'guitar', 'music'], basics: ['function', 'calculus'] },
  { nodeId: 'navier-stokes', expression: lines(dt(vector('u')) + op('+') + row(op('(') + vector('u') + op('·') + op('∇') + op(')')) + vector('u') + op('='), op('−') + frac('<mn>1</mn>', mi('ρ')) + op('∇') + mi('p') + op('+') + mi('ν') + sq(op('∇')) + vector('u') + op('+') + vector('f'), op('∇') + op('·') + vector('u') + op('=') + '<mn>0</mn>'), spoken: '∂u/∂t + (u·∇)u = −∇p/ρ + ν∇²u + f, ∇·u = 0', hook: '風や水の流れを、数式で追いかける。', symbols: 'u：流速、p：圧力、ρ：密度、ν：動粘度、f：単位質量あたりの外力。∇ は空間的な変化を扱う記号。', condition: 'ここでは密度・粘性が一定の非圧縮性流体の形。実際の天気予報には、圧縮性・熱なども含む方程式を使う。', trail: ['navier-stokes', 'fluid', 'weather'], basics: ['vector', 'calculus'] },
  { nodeId: 'maxwell-equations', expression: lines(op('∇') + op('·') + vector('B') + op('=') + '<mn>0</mn>', op('∇') + op('×') + vector('E') + op('=') + op('−') + dt(vector('B')), op('∇') + op('·') + vector('D') + op('=') + mi('ρ'), op('∇') + op('×') + vector('H') + op('=') + vector('J') + op('+') + dt(vector('D'))), spoken: '∇·B = 0, ∇×E = −∂B/∂t, ∇·D = ρ, ∇×H = J + ∂D/∂t', hook: '見えない電波が、スマホに届くまで。', symbols: 'E：電場、B：磁束密度、D：電束密度、H：磁場、ρ：自由電荷密度、J：自由電流密度。', condition: '物質中の電磁場を扱う巨視的な形。DとE、BとHの関係は物質の性質による。', trail: ['maxwell-equations', 'communication-engineering', 'wifi', 'smartphone'], basics: ['vector', 'electromagnetism'] },
  { nodeId: 'schrodinger-equation', expression: mi('i') + mi('ℏ') + dt(mi('ψ')) + op('=') + op('−') + frac(sq(mi('ℏ')), '<mn>2</mn>' + mi('m')) + sq(op('∇')) + mi('ψ') + op('+') + mi('V') + mi('ψ'), spoken: 'iℏ ∂ψ/∂t = −ℏ²∇²ψ/(2m) + Vψ', hook: '電子の世界が、スマホの半導体につながる。', symbols: 'ψ：波動関数、i：虚数単位、ℏ：プランク定数を2πで割ったもの、m：質量、V：位置エネルギー。', condition: '非相対論的な1粒子をスカラーの位置エネルギーで扱う形。|ψ|²は位置の確率密度を表す。', trail: ['schrodinger-equation', 'semiconductor', 'smartphone'], basics: ['probability', 'calculus', 'atom'] },
  { nodeId: 'motion', expression: vector('F') + op('=') + mi('m') + vector('a'), spoken: 'F = ma', hook: 'ゲームのジャンプにも、力のルール。', symbols: 'F：合力、m：質量、a：加速度。矢印は向きも持つ量を表す。', condition: '質量が一定で、慣性系から見る古典力学の運動方程式。', trail: ['motion', 'game-physics', 'game'], basics: ['proportion', 'force'] },
  { nodeId: 'pythagorean', expression: sq(mi('a')) + op('+') + sq(mi('b')) + op('=') + sq(mi('c')), spoken: 'a2 + b2 = c2', hook: 'ゲーム画面の「距離」にも、この三角形。', symbols: 'a・b：直角をはさむ2辺、c：斜辺の長さ。', condition: '直角三角形で成り立つ辺の関係。', trail: ['pythagorean', 'computer-graphics', 'game'], basics: ['multiplication', 'equation'] },
  { nodeId: 'ohms-law', expression: mi('V') + op('=') + mi('I') + mi('R'), spoken: 'V = IR', hook: '電子工作の抵抗、どうやって選ぶ？', symbols: 'V：電圧、I：電流、R：抵抗。', condition: '温度などの条件が一定で、電圧と電流が比例する抵抗に適用する。', trail: ['ohms-law', 'electricity', 'semiconductor'], basics: ['proportion', 'equation'] },
];

export function formulaMarkup(formula) {
  return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${row(formula.expression)}</math>`;
}

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 240" aria-hidden="true" focusable="false">${body}</svg>`;
const emWave = () => {
  let electric = '', magnetic = '', bars = '';
  for (let i = 0; i <= 100; i++) {
    const x = 48 + i * 3.65, y = 130 - i * .12, a = Math.sin(i / 100 * Math.PI * 4) * 62;
    electric += `${i ? 'L' : 'M'}${x},${y - a} `;
    magnetic += `${i ? 'L' : 'M'}${x + a * .45},${y + a * .32} `;
    if (i % 4 === 0) bars += `<path d="M${x},${y}L${x},${y - a}" stroke="#67d7ff" opacity=".55"/><path d="M${x},${y}L${x + a * .45},${y + a * .32}" stroke="#ff97b5" opacity=".6"/>`;
  }
  return svg(`<path d="M30 131L445 117l-12 -5m12 5l-11 7" fill="none" stroke="#b4c5df"/>${bars}<path d="${electric}" fill="none" stroke="#67d7ff" stroke-width="3"/><path d="${magnetic}" fill="none" stroke="#ff97b5" stroke-width="3"/><g font-family="sans-serif" font-size="14"><text x="38" y="33" fill="#67d7ff">電場 E</text><text x="174" y="206" fill="#ff97b5">磁場 B</text><text x="365" y="92" fill="#d8e4f6">進む方向 →</text></g>`);
};
const flow = () => svg(`${[38, 59, 80, 101, 143, 164, 185, 206].map((y, i) => {
  const offset = i < 4 ? -14 : 14;
  return `<path d="M25 ${y} C150 ${y},165 ${y + offset},235 ${y + offset} S340 ${y},455 ${y}" fill="none" stroke="${i % 2 ? '#67d7ff' : '#69ebc4'}" opacity=".75" stroke-width="2"/>`;
}).join('')}<path d="M138 123Q195 88 295 127Q208 137 138 123" fill="#dce8f8"/><g font-family="sans-serif" font-size="14" fill="#d8e4f6"><text x="27" y="22">空気の流れ →</text><text x="177" y="227">翼のまわりの流線</text></g>`);
const stringWave = () => svg(`<path d="M50 124H430" stroke="#637592" stroke-dasharray="5 5"/><path d="M50 124C113 18 177 18 240 124S367 230 430 124" fill="none" stroke="#ffd557" stroke-width="4"/><circle cx="50" cy="124" r="7" fill="#c7d6ed"/><circle cx="430" cy="124" r="7" fill="#c7d6ed"/><path d="M145 108V55l-5 9m5-9l5 9" fill="none" stroke="#67d7ff" stroke-width="2"/><g font-family="sans-serif" font-size="14" fill="#d8e4f6"><text x="42" y="33">弦の振動</text><text x="160" y="74">変位 y</text><text x="307" y="42">位置 x →</text><text x="125" y="224">固定端の間にできる定常波</text></g>`);

export const scenes = [
  { id: 'electromagnetic-wave', nodeId: 'maxwell-equations', title: 'この波が、スマホに届いている。', caption: '電場と磁場が互いに直交する、平面電磁波の模式図。色の線は場の強さで、粒子の軌道ではありません。', hook: '電磁波 → 無線通信 → Wi-Fi', image: emWave() },
  { id: 'airflow', nodeId: 'navier-stokes', title: '目に見えない風を、見てみる。', caption: '翼のまわりの流れを描いた概念図。実際の計算結果や揚力の定量的な説明ではありません。', hook: '流体力学 → 飛行機・天気予報', image: flow() },
  { id: 'vibrating-string', nodeId: 'wave-equation', title: '一本の弦から、音楽が生まれる。', caption: '両端を固定した弦の定常波の、ある瞬間の形。弦の振動が周囲の空気を揺らして音になります。', hook: '波動方程式 → 波 → 音楽', image: stringWave() },
];
