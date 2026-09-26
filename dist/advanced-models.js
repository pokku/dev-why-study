import { seededRandom } from './explore-models.js';

// Gaussian elimination with partial pivoting for the small systems used below.
export function solveLinear(matrix, vector) {
  const n = vector.length, a = matrix.map((row, i) => [...row, vector[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    if (Math.abs(a[pivot][col]) < 1e-12) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const k = a[r][col] / a[col][col];
      for (let c = col; c <= n; c++) a[r][c] -= k * a[col][c];
    }
  }
  return a.map((row, i) => row[n] / row[i]);
}

// GPS: a plane model. Satellites sit above the ground line; distances include the receiver clock error as a length.
export const gpsSatellites = [[-9, 11], [8, 12], [1, 14], [-15, 6], [15, 5], [-4, 13]];
export function pseudoranges(receiver, count, clock, noise, seed = 7) {
  const random = seededRandom(seed);
  return gpsSatellites.slice(0, count).map(([sx, sy]) => Math.hypot(receiver[0] - sx, receiver[1] - sy) + clock + noise * (2 * random() - 1));
}
// Gauss-Newton least squares. Returns every iterate so the UI can show the approach.
export function solveGps(satellites, ranges, { withClock = true, start = [0, 3], iterations = 8 } = {}) {
  let x = start[0], y = start[1], b = 0;
  const steps = [];
  for (let k = 0; k <= iterations; k++) {
    const rows = [], residuals = [];
    satellites.forEach(([sx, sy], i) => {
      const d = Math.hypot(x - sx, y - sy) || 1e-9;
      residuals.push(ranges[i] - (d + (withClock ? b : 0)));
      rows.push(withClock ? [(x - sx) / d, (y - sy) / d, 1] : [(x - sx) / d, (y - sy) / d]);
    });
    steps.push({ x, y, b, rms: Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / residuals.length) });
    if (k === iterations) break;
    const m = rows[0].length;
    const normal = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => rows.reduce((s, row) => s + row[i] * row[j], 0)));
    const rhs = Array.from({ length: m }, (_, i) => rows.reduce((s, row, r) => s + row[i] * residuals[r], 0));
    const delta = solveLinear(normal, rhs);
    if (!delta) break;
    x += delta[0]; y += delta[1]; if (withClock) b += delta[2];
  }
  return steps;
}

// Hamming(7,4). Positions 1..7; parity bits at 1, 2 and 4.
export function hammingEncode(data) {
  const [d1, d2, d3, d4] = data;
  const p1 = d1 ^ d2 ^ d4, p2 = d1 ^ d3 ^ d4, p4 = d2 ^ d3 ^ d4;
  return [p1, p2, d1, p4, d2, d3, d4];
}
export const hammingCheck = [[1, 0, 1, 0, 1, 0, 1], [0, 1, 1, 0, 0, 1, 1], [0, 0, 0, 1, 1, 1, 1]];
export function hammingSyndrome(code) {
  const s = hammingCheck.map(row => row.reduce((acc, h, i) => acc ^ (h & code[i]), 0));
  return s[0] + 2 * s[1] + 4 * s[2];
}
export function hammingDecode(code) {
  const syndrome = hammingSyndrome(code), fixed = [...code];
  if (syndrome) fixed[syndrome - 1] ^= 1;
  return { syndrome, fixed, data: [fixed[2], fixed[4], fixed[5], fixed[6]] };
}

// RSA with textbook-sized primes (educational only: no padding, tiny keys).
export const smallPrimes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
export const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
export function modInverse(a, m) {
  let [r0, r1, s0, s1] = [m, a % m, 0, 1];
  while (r1) { const q = Math.floor(r0 / r1); [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; }
  return r0 === 1 ? ((s0 % m) + m) % m : null;
}
export function modPow(base, exponent, modulus) {
  let result = 1n, b = BigInt(base) % BigInt(modulus), e = BigInt(exponent);
  const m = BigInt(modulus);
  while (e > 0n) { if (e & 1n) result = result * b % m; b = b * b % m; e >>= 1n; }
  return Number(result);
}
export function rsaKeys(p, q) {
  const n = p * q, phi = (p - 1) * (q - 1);
  // A moderately large e so that m^e always wraps around n; tiny e such as 3 can be undone by a plain cube root.
  const e = [17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 5, 7, 11, 13, 3].find(v => v < phi && gcd(v, phi) === 1);
  return { p, q, n, phi, e, d: modInverse(e, phi) };
}
export function factorByTrial(n) {
  let tries = 0;
  for (let k = 2; k * k <= n; k++) { tries++; if (n % k === 0) return { p: k, q: n / k, tries }; }
  return { p: n, q: 1, tries };
}
export const letterCode = ch => ch.charCodeAt(0) - 64;
export const codeLetter = v => (v >= 1 && v <= 26 ? String.fromCharCode(v + 64) : '?');

// Shortest paths on an 8-neighbour grid. weight 0 = Dijkstra, 1 = A*, >1 = weighted A* (faster, not guaranteed shortest).
export function findPath(width, height, walls, start, goal, weight = 1) {
  const idx = (x, y) => y * width + x, blocked = new Set(walls);
  const g = new Map([[idx(...start), 0]]), parent = new Map(), closed = new Set(), order = [];
  const h = (x, y) => Math.hypot(goal[0] - x, goal[1] - y);
  const open = [{ x: start[0], y: start[1], f: weight * h(...start), g: 0, t: 0 }];
  let tick = 0;
  while (open.length) {
    let best = 0;
    for (let i = 1; i < open.length; i++) {
      const a = open[i], b = open[best];
      if (a.f < b.f - 1e-9 || (Math.abs(a.f - b.f) <= 1e-9 && (a.g > b.g + 1e-9 || (Math.abs(a.g - b.g) <= 1e-9 && a.t < b.t)))) best = i;
    }
    const cur = open.splice(best, 1)[0], key = idx(cur.x, cur.y);
    if (closed.has(key)) continue;
    closed.add(key); order.push([cur.x, cur.y]);
    if (cur.x === goal[0] && cur.y === goal[1]) {
      const path = [[cur.x, cur.y]];
      let k = key;
      while (parent.has(k)) { k = parent.get(k); path.unshift([k % width, Math.floor(k / width)]); }
      return { order, path, cost: g.get(key) };
    }
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue;
      const nx = cur.x + dx, ny = cur.y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height || blocked.has(idx(nx, ny))) continue;
      if (dx && dy && (blocked.has(idx(cur.x + dx, cur.y)) || blocked.has(idx(cur.x, cur.y + dy)))) continue; // no corner cutting
      const ng = cur.g + (dx && dy ? Math.SQRT2 : 1), nk = idx(nx, ny);
      if (closed.has(nk) || ng >= (g.get(nk) ?? Infinity) - 1e-12) continue;
      g.set(nk, ng); parent.set(nk, key);
      open.push({ x: nx, y: ny, g: ng, f: ng + weight * h(nx, ny), t: ++tick });
    }
  }
  return { order, path: [], cost: Infinity };
}

// A tiny neural network: 2 inputs -> H tanh units -> sigmoid output, trained by full-batch gradient descent.
export function makeDataset(kind, count = 120, seed = 3) {
  const random = seededRandom(seed), points = [];
  for (let i = 0; i < count; i++) {
    const x = random() * 2 - 1, y = random() * 2 - 1;
    const label = kind === 'line' ? Number(y > 0.6 * x - 0.1)
      : kind === 'circle' ? Number(x * x + y * y < 0.42)
      : Number(x * y > 0);
    if (kind === 'xor' && Math.abs(x) < 0.08 || kind === 'xor' && Math.abs(y) < 0.08) continue;
    points.push({ x, y, label });
  }
  return points;
}
export function createNetwork(hidden, seed = 11) {
  const random = seededRandom(seed), r = () => (random() * 2 - 1) * 0.9;
  return hidden
    ? { hidden, w1: Array.from({ length: hidden }, () => [r() * 2, r() * 2]), b1: Array.from({ length: hidden }, r), w2: Array.from({ length: hidden }, r), b2: 0 }
    : { hidden: 0, w: [r(), r()], b: 0 };
}
const sigmoid = z => 1 / (1 + Math.exp(-z));
export function predict(net, x, y) {
  if (!net.hidden) return sigmoid(net.w[0] * x + net.w[1] * y + net.b);
  let z = net.b2;
  for (let j = 0; j < net.hidden; j++) z += net.w2[j] * Math.tanh(net.w1[j][0] * x + net.w1[j][1] * y + net.b1[j]);
  return sigmoid(z);
}
export function lossOf(net, data) {
  return data.reduce((s, p) => { const q = Math.min(1 - 1e-12, Math.max(1e-12, predict(net, p.x, p.y))); return s - (p.label ? Math.log(q) : Math.log(1 - q)); }, 0) / data.length;
}
export const accuracyOf = (net, data) => data.filter(p => (predict(net, p.x, p.y) >= 0.5) === Boolean(p.label)).length / data.length;
// One gradient-descent step on the mean cross-entropy (backpropagation written out by hand).
export function trainStep(net, data, rate) {
  const n = data.length;
  if (!net.hidden) {
    let gw0 = 0, gw1 = 0, gb = 0;
    for (const p of data) { const e = predict(net, p.x, p.y) - p.label; gw0 += e * p.x; gw1 += e * p.y; gb += e; }
    net.w[0] -= rate * gw0 / n; net.w[1] -= rate * gw1 / n; net.b -= rate * gb / n;
    return net;
  }
  const H = net.hidden, gw1 = Array.from({ length: H }, () => [0, 0]), gb1 = Array(H).fill(0), gw2 = Array(H).fill(0);
  let gb2 = 0;
  for (const p of data) {
    const h = net.w1.map((w, j) => Math.tanh(w[0] * p.x + w[1] * p.y + net.b1[j]));
    const out = sigmoid(net.b2 + h.reduce((s, v, j) => s + v * net.w2[j], 0)), e = out - p.label;
    gb2 += e;
    for (let j = 0; j < H; j++) {
      gw2[j] += e * h[j];
      const back = e * net.w2[j] * (1 - h[j] * h[j]);
      gw1[j][0] += back * p.x; gw1[j][1] += back * p.y; gb1[j] += back;
    }
  }
  for (let j = 0; j < H; j++) {
    net.w2[j] -= rate * gw2[j] / n; net.w1[j][0] -= rate * gw1[j][0] / n; net.w1[j][1] -= rate * gw1[j][1] / n; net.b1[j] -= rate * gb1[j] / n;
  }
  net.b2 -= rate * gb2 / n;
  return net;
}

// PageRank by power iteration. Pages without outgoing links spread their share evenly.
export const pageGraphs = {
  web: [[1, 2], [2], [0], [0, 2], [2, 5], [4]],
  hub: [[5], [5], [5], [5], [5], [0, 1, 2, 3, 4]],
  dead: [[1, 2], [3], [3], [], [3, 5], [4]],
};
export function pageRankStep(links, rank, damping) {
  const n = links.length, next = Array(n).fill((1 - damping) / n);
  links.forEach((out, i) => {
    if (out.length) for (const j of out) next[j] += damping * rank[i] / out.length;
    else for (let j = 0; j < n; j++) next[j] += damping * rank[i] / n;
  });
  return next;
}
export function pageRank(links, damping, iterations = 60) {
  let rank = Array(links.length).fill(1 / links.length);
  const history = [rank];
  for (let k = 0; k < iterations; k++) { rank = pageRankStep(links, rank, damping); history.push(rank); }
  return history;
}
