export const SOUND_SPEED = 343;
export const TAU = 2 * Math.PI;
export function doppler(frequency, towardSpeed) {
  return frequency * SOUND_SPEED / (SOUND_SPEED - towardSpeed);
}
export function synthesize(amplitudes, phase) {
  return amplitudes.reduce((sum, a, i) => sum + a * Math.sin(TAU * (i + 1) * phase), 0);
}
export function decompose(samples, count = 6) {
  return Array.from({length:count}, (_,i) => {
    let re = 0, im = 0;
    samples.forEach((value,n) => { const angle = TAU * (i + 1) * n / samples.length; re += value * Math.cos(angle); im += value * Math.sin(angle); });
    return 2 * Math.hypot(re,im) / samples.length;
  });
}
export function wavefront(emittedAt, now, speed) {
  return { x: 240 + .5 * speed * emittedAt, radius: .5 * SOUND_SPEED * (now - emittedAt) };
}
