import * as THREE from 'three';
import { clamp, smooth } from './store.js';

/* World layout — every room lives somewhere along -Z */
export const FLOOR = -2.2;
export const L = {
  gate: new THREE.Vector3(0, 1, -34),
  m: [new THREE.Vector3(-1.9, 0, -62), new THREE.Vector3(1.9, 0, -80), new THREE.Vector3(-1.9, 0, -98), new THREE.Vector3(1.9, 0, -116)],
  skills: new THREE.Vector3(0, 1, -146),
  towers: -178,
  arches: [-203, -218, -233, -248, -263, -278], // one doorway per role
  certs: new THREE.Vector3(0, 0.55, -308),
  moon: new THREE.Vector3(0, 3.5, -393),
};

const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function buildTimeline(mobile) {
  const S = [];
  const add = (id, pos, look, hold, travel, dolly = V(0, 0, -0.8)) => S.push({ id, pos, look, hold, travel, dolly });

  add('hero', V(0, 0, 8), V(0, 0, 0), 0.5, 1.5, V(0, 0, -0.4));
  add('about', V(0, 0.8, -19), V(0, 1, -34), 1.1, 1.7, V(0, 0, -1.6));
  L.m.forEach((m, i) => {
    const side = m.x < 0 ? 1 : -1; // camera sits on the opposite side
    if (mobile) add(`work${i}`, V(side * 1.4, 0.6, m.z + 10), V(m.x, m.y - 1.25, m.z), 1, 1.05, V(0, 0, -0.8));
    else add(`work${i}`, V(side * 3.4, 0.5, m.z + 7.5), V(m.x + side * 2.1, m.y + 0.6, m.z), 1, 1.05, V(-side * 0.4, 0, -0.7));
  });
  S[S.length - 1].travel = 1.6;
  if (mobile) add('skills', V(0, 1, -128.5), V(0, -1.5, -146), 1.4, 1.4);
  else add('skills', V(0, 1, -132.5), V(-2.5, 1, -146), 1.4, 1.4);
  if (mobile) add('numbers', V(0, 2.2, -161), V(0, 0.6, -178), 1.1, 1.5);
  else add('numbers', V(0, 1.7, -163), V(0, 2.3, -178), 1.1, 1.5);
  L.arches.forEach((z, i) => {
    if (mobile) add(`journey${i}`, V(0, 0.5, z + 9.5), V(0, -0.9, z - 12), 0.85, i === L.arches.length - 1 ? 1.4 : 1.0, V(0, 0, -1.2));
    else add(`journey${i}`, V(0, 0.5, z + 8.8), V(-2.1, 0.7, z - 12), 0.85, i === L.arches.length - 1 ? 1.4 : 1.0, V(0, 0, -1.2));
  });
  add('certs', V(0, 1.8, mobile ? -291.5 : -295), V(0, mobile ? 2.6 : 2.15, -308), 1.3, 1.7, V(0, 0, -0.6));
  if (mobile) add('contact', V(0, 0.6, -325), V(0, 3.6, -363), 1.1, 0, V(0, 0.3, -2.2));
  else add('contact', V(0, 0.6, -325), V(2.5, 2.6, -363), 1.1, 0, V(0, 0.3, -2.2));

  // normalise into 0..1 segments
  let acc = 0;
  const raw = S.map((s, i) => {
    const hs = acc;
    acc += s.hold;
    const he = acc;
    if (i < S.length - 1) acc += s.travel;
    return { hs, he };
  });
  const total = acc;
  const segs = raw.map((r) => ({ hs: r.hs / total, he: r.he / total }));
  const index = Object.fromEntries(S.map((s, i) => [s.id, i]));
  return { shots: S, segs, total, index };
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

/* camera pose for scroll progress u */
export function sample(tl, u, outPos, outLook) {
  const { shots, segs } = tl;
  const n = shots.length;
  for (let i = 0; i < n; i++) {
    const s = segs[i];
    if (u <= s.he || i === n - 1) {
      if (u >= s.hs || i === 0) {
        const lp = clamp((u - s.hs) / Math.max(1e-6, s.he - s.hs));
        outPos.copy(shots[i].pos).addScaledVector(shots[i].dolly, lp - 0.5);
        outLook.copy(shots[i].look);
        return { i, travel: false, t: lp, dir: 0 };
      }
      // travelling from i-1 to i
      const p = segs[i - 1];
      const t = smooth(clamp((u - p.he) / (s.hs - p.he)));
      _a.copy(shots[i - 1].pos).addScaledVector(shots[i - 1].dolly, 0.5);
      _b.copy(shots[i].pos).addScaledVector(shots[i].dolly, -0.5);
      outPos.lerpVectors(_a, _b, t);
      outLook.lerpVectors(shots[i - 1].look, shots[i].look, t);
      return { i: i - 1, travel: true, t, dir: Math.sign(shots[i].pos.x - shots[i - 1].pos.x) };
    }
  }
  return { i: n - 1, travel: false, t: 1, dir: 0 };
}

/* how present a shot is (1 inside its hold, fading across neighbouring travel) */
export function vis(tl, u, i, fade = 0.32) {
  const { segs } = tl;
  const n = segs.length;
  const s = segs[i];
  if (u >= s.hs && u <= s.he) return 1;
  if (u < s.hs) {
    if (i === 0) return 1;
    const tr = s.hs - segs[i - 1].he;
    return clamp(1 - (s.hs - u) / (tr * fade));
  }
  if (i === n - 1) return 1;
  const tr = segs[i + 1].hs - s.he;
  return clamp(1 - (u - s.he) / (tr * fade));
}

/* signed: <0 approaching, 0 holding, >0 leaving (−1..1 across fade window) */
export function phase(tl, u, i, fade = 0.32) {
  const { segs } = tl;
  const s = segs[i];
  if (u >= s.hs && u <= s.he) return 0;
  if (u < s.hs) {
    if (i === 0) return 0;
    return -clamp((s.hs - u) / ((s.hs - segs[i - 1].he) * fade));
  }
  if (i === segs.length - 1) return 0;
  return clamp((u - s.he) / ((segs[i + 1].hs - s.he) * fade));
}

export const local = (tl, u, i) => {
  const s = tl.segs[i];
  return (u - s.hs) / Math.max(1e-6, s.he - s.hs);
};
export const centerU = (tl, i) => (tl.segs[i].hs + tl.segs[i].he) / 2;
