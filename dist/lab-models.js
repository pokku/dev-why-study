export const TAU = 2 * Math.PI;
export const radians = degrees => degrees * Math.PI / 180;
export function prismRay(index, incidence = 50) {
  const angle = radians(30) - Math.asin(Math.sin(radians(incidence)) / index);
  const exitSine = index * Math.sin(angle + radians(30));
  if (Math.abs(exitSine) > 1) return null;
  const entry = { x: 265, y: 55 + 65 * Math.sqrt(3) };
  const dx = Math.cos(angle), dy = Math.sin(angle);
  const ex = 145, ey = 145 * Math.sqrt(3);
  const t = ((330 - entry.x) * ey - (55 - entry.y) * ex) / (dx * ey - dy * ex);
  return { entry, exit: { x: entry.x + t * dx, y: entry.y + t * dy }, incoming: radians(30 - incidence), outgoing: Math.asin(exitSine) - radians(30), internal: angle };
}
export function interferenceAmplitude(phase) { return 2 * Math.abs(Math.cos(phase / 2)); }
export function orbitStart(speed = 1) { return { x: 1, y: 0, vx: 0, vy: speed }; }
export function orbitEnergy(s) { return (s.vx ** 2 + s.vy ** 2) / 2 - 1 / Math.hypot(s.x, s.y); }
export function orbitStep(s, dt) {
  const a = (x, y) => { const r3 = Math.hypot(x, y) ** 3; return [-x / r3, -y / r3]; };
  const [ax, ay] = a(s.x, s.y);
  const x = s.x + s.vx * dt + .5 * ax * dt * dt, y = s.y + s.vy * dt + .5 * ay * dt * dt;
  const [bx, by] = a(x, y);
  return { x, y, vx: s.vx + (ax + bx) * dt / 2, vy: s.vy + (ay + by) * dt / 2 };
}
export const PENDULUM_OMEGA = Math.sqrt(9.81 / 1.5);
export function pendulumStep(s, dt, ratio) {
  const w = PENDULUM_OMEGA;
  const drive = .25 * Math.sin(ratio * w * s.t);
  const velocity = s.velocity + (drive - .12 * w * s.velocity - w * w * s.angle) * dt;
  return { angle: s.angle + velocity * dt, velocity, t: s.t + dt };
}
export function heatStep(grid, width, height, amount = .2) {
  if (amount < 0 || amount > .25) throw new RangeError('2D explicit diffusion must be in [0, .25]');
  const result = new Float64Array(grid.length);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = y * width + x, value = grid[i];
    result[i] = value + amount * ((x ? grid[i - 1] : value) + (x < width - 1 ? grid[i + 1] : value) + (y ? grid[i - width] : value) + (y < height - 1 ? grid[i + width] : value) - 4 * value);
  }
  return result;
}
export function cosineBasis(n) {
  return Array.from({ length: n }, (_, k) => Float64Array.from({ length: n }, (_, x) => Math.sqrt((k ? 2 : 1) / n) * Math.cos(Math.PI * (x + .5) * k / n)));
}
export function dct2(pixels, n) {
  const basis = cosineBasis(n), temp = new Float64Array(n * n), out = new Float64Array(n * n);
  for (let y = 0; y < n; y++) for (let u = 0; u < n; u++) for (let x = 0; x < n; x++) temp[y * n + u] += pixels[y * n + x] * basis[u][x];
  for (let v = 0; v < n; v++) for (let u = 0; u < n; u++) for (let y = 0; y < n; y++) out[v * n + u] += temp[y * n + u] * basis[v][y];
  return out;
}
export function inverseDct2(coefficients, n, cutoff = n) {
  const basis = cosineBasis(n), temp = new Float64Array(n * n), out = new Float64Array(n * n);
  for (let y = 0; y < n; y++) for (let u = 0; u < cutoff; u++) for (let v = 0; v < cutoff; v++) temp[y * n + u] += coefficients[v * n + u] * basis[v][y];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) for (let u = 0; u < cutoff; u++) out[y * n + x] += temp[y * n + u] * basis[u][x];
  return out;
}
