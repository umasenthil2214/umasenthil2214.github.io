import * as THREE from 'three';

let _smoke = null;
export function smokeTexture() {
  if (_smoke) return _smoke;
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  // many soft blobs => cloudy puff
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.pow(rnd(), 1.6) * s * 0.28;
    const x = s / 2 + Math.cos(a) * d;
    const y = s / 2 + Math.sin(a) * d;
    const r = s * (0.08 + rnd() * 0.2);
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const al = 0.05 + rnd() * 0.07;
    grd.addColorStop(0, `rgba(255,255,255,${al})`);
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
  }
  // radial falloff mask
  g.globalCompositeOperation = 'destination-in';
  const m = g.createRadialGradient(s / 2, s / 2, s * 0.1, s / 2, s / 2, s / 2);
  m.addColorStop(0, 'rgba(0,0,0,1)');
  m.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = m;
  g.fillRect(0, 0, s, s);
  _smoke = new THREE.CanvasTexture(c);
  _smoke.colorSpace = THREE.SRGBColorSpace;
  return _smoke;
}

let _glow = null;
export function glowTexture() {
  if (_glow) return _glow;
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  _glow = new THREE.CanvasTexture(c);
  return _glow;
}

/* Sample points that fill a word, normalised so that `normWidth` px === 1 unit */
export function sampleWord(word, count, normWidth, font = '900 220px "Inter Tight"') {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  g.font = font;
  const w = Math.ceil(g.measureText(word).width) + 40;
  const h = 300;
  c.width = w;
  c.height = h;
  g.font = font;
  g.fillStyle = '#fff';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.fillText(word, w / 2, h / 2 + 10);
  const data = g.getImageData(0, 0, w, h).data;
  const pts = [];
  for (let y = 0; y < h; y += 2)
    for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 140) pts.push([x, y]);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = pts[Math.floor(Math.random() * pts.length)] || [w / 2, h / 2];
    out[i * 3] = (p[0] + Math.random() * 2 - w / 2) / normWidth;
    out[i * 3 + 1] = -(p[1] + Math.random() * 2 - h / 2) / normWidth;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.025;
  }
  return out;
}

export function measure(word, font = '900 220px "Inter Tight"') {
  const g = document.createElement('canvas').getContext('2d');
  g.font = font;
  return g.measureText(word).width;
}

export function wrap(g, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((w) => {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  });
  if (line) lines.push(line);
  return lines;
}
