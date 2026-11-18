/** Small deterministic helpers: every "random" shape is driven by a seed so renders repeat. */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** 1-D value noise in [-1, 1] sampled at `x` with features `wavelength` apart. */
export const makeNoise1D = (seed: number) => {
  const rnd = mulberry32(seed);
  const table = Array.from({length: 512}, () => rnd() * 2 - 1);
  return (x: number, wavelength: number) => {
    const t = x / wavelength;
    const i = Math.floor(t);
    const f = t - i;
    const s = f * f * (3 - 2 * f);
    const a = table[((i % 512) + 512) % 512];
    const b = table[(((i + 1) % 512) + 512) % 512];
    return a + (b - a) * s;
  };
};

/** Multi-octave jitter: octaves = [[wavelengthPx, amplitudePx], ...]. */
export const makeJitter = (seed: number, octaves: Array<[number, number]>) => {
  const fns = octaves.map((_, i) => makeNoise1D(seed * 31 + i * 7 + 1));
  return (x: number) => octaves.reduce((acc, [wl, amp], i) => acc + fns[i](x, wl) * amp, 0);
};
