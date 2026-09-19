// Ideal flexible string, fixed ends, constant tension and linear density.
export const WAVE_SPEED = 143; // m/s: 65 cm gives A2 (110 Hz).
export function stringFrequency(lengthCm) {
  if (!Number.isFinite(lengthCm) || lengthCm <= 0) throw new RangeError('弦の長さは正の数');
  return WAVE_SPEED / (2 * lengthCm / 100);
}
export function fundamentalShape(position, cycles) {
  return Math.sin(Math.PI * position) * Math.cos(2 * Math.PI * cycles);
}
export function pitchName(frequency) {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  return `${['ド', 'ド♯', 'レ', 'レ♯', 'ミ', 'ファ', 'ファ♯', 'ソ', 'ソ♯', 'ラ', 'ラ♯', 'シ'][((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}
