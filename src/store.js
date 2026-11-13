// Shared, mutable frame state (read inside render loops — never triggers React renders)
export const store = {
  target: 0, // raw scroll progress 0..1
  off: 0, // damped scroll progress used by the world
  mouse: { x: 0, y: 0 },
  smouse: { x: 0, y: 0 },
  mobile: false,
  ready: false, // fonts + sampling ready
  introT: 0, // seconds since intro start
  introDone: false,
  onIntroDone: null,
  skillGroup: null,
  hover3d: false,
  tl: null,
  labels: { skills: [], towers: [] },
};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10);
