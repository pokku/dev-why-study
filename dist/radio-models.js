export const C = 299792458;
const TAU = 2 * Math.PI;
export const wavelength = frequency => C / frequency;
export const polarizationPower = degrees => Math.cos(degrees * Math.PI / 180) ** 2;

// Ideal complex-baseband transmitter and envelope / phase-difference receivers.
export function radioSignal({ mode = 'am', frequency = 220, depth = .7, noise = 0, noiseType = 'amplitude', duration = .025, sampleRate = 96000, seed = 42 } = {}) {
  const length = Math.ceil(duration * sampleRate);
  const original = new Float32Array(length), carrier = new Float32Array(length), received = new Float32Array(length), recovered = new Float32Array(length);
  let phase = 0, prevI = 1, prevQ = 0;
  function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; }
  for (let n = 0; n < length; n++) {
    const t = n / sampleRate, m = Math.sin(TAU * frequency * t);
    original[n] = m;
    carrier[n] = Math.cos(TAU * 8000 * t);
    phase += TAU * 2000 * depth * m / sampleRate;
    let i = mode === 'am' ? 1 + depth * m : Math.cos(phase);
    let q = mode === 'am' ? 0 : Math.sin(phase);
    if (noiseType === 'amplitude') {
      const gain = 1 + noise * (.55 * Math.sin(TAU * 70 * t) + .45 * Math.sin(TAU * 120 * t));
      i *= gain; q *= gain;
    } else { i += noise * random(); q += noise * random(); }
    received[n] = i * Math.cos(TAU * 8000 * t) - q * Math.sin(TAU * 8000 * t);
    recovered[n] = mode === 'am' ? (Math.hypot(i, q) - 1) / depth : Math.atan2(q * prevI - i * prevQ, i * prevI + q * prevQ) * sampleRate / (TAU * 2000 * depth);
    prevI = i; prevQ = q;
  }
  return { original, carrier, received, recovered };
}

export function audioSamples(samples, sampleRate = 96000) {
  // Forward/backward low-pass avoids shifting the comparison; playback is bounded.
  const out = Float32Array.from(samples), a = 1 - Math.exp(-TAU * 2500 / sampleRate);
  for (let n = 1; n < out.length; n++) out[n] = out[n - 1] + a * (out[n] - out[n - 1]);
  for (let n = out.length - 2; n >= 0; n--) out[n] = out[n + 1] + a * (out[n] - out[n + 1]);
  return out.map((value, n) => Math.max(-2, Math.min(2, value)) * Math.min(1, n / (sampleRate * .01), (out.length - 1 - n) / (sampleRate * .01)));
}
