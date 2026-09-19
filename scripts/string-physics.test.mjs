import test from 'node:test';
import assert from 'node:assert/strict';
import { WAVE_SPEED, stringFrequency, fundamentalShape, pitchName } from '../dist/string-physics.js';

test('長さ半分で振動数が2倍、音名は1オクターブ上がる', () => {
  assert.equal(stringFrequency(65), 110);
  assert.equal(stringFrequency(32.5), 220);
  assert.equal(pitchName(110), 'ラ2');
  assert.equal(pitchName(220), 'ラ3');
});

test('長さの全範囲で振動数は有限、短くするほど高くなる', () => {
  let previous = Infinity;
  for (let cm = 21.7; cm <= 65; cm += .1) {
    const f = stringFrequency(cm);
    assert.ok(Number.isFinite(f) && f > 0 && f < previous);
    previous = f;
  }
  for (const value of [0, -1, NaN, Infinity]) assert.throws(() => stringFrequency(value), RangeError);
});

test('基本振動の両端は常に固定され、1周期後に同じ形に戻る', () => {
  for (const t of [0, .125, .25, .5, 1.3]) {
    assert.ok(Math.abs(fundamentalShape(0, t)) < 1e-12);
    assert.ok(Math.abs(fundamentalShape(1, t)) < 1e-12);
    assert.ok(Math.abs(fundamentalShape(.3, t) - fundamentalShape(.3, t + 1)) < 1e-12);
  }
});

test('長さと振動数を組み合わせた変位が波動方程式を満たす', () => {
  for (const cm of [21.7, 32.5, 65]) {
    const length = cm / 100, f = stringFrequency(cm);
    const y = (x, t) => fundamentalShape(x / length, f * t);
    const x = length * .37, t = .0013, dx = .00001, dt = .000001;
    const dtt = (y(x, t + dt) - 2 * y(x, t) + y(x, t - dt)) / dt ** 2;
    const dxx = (y(x + dx, t) - 2 * y(x, t) + y(x - dx, t)) / dx ** 2;
    assert.ok(Math.abs(dtt - WAVE_SPEED ** 2 * dxx) / Math.max(1, Math.abs(dtt)) < .0001);
  }
});
