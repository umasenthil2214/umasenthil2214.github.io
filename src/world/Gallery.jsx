import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { L, FLOOR } from '../timeline.js';
import { store } from '../store.js';

const SW = 512;
const SH = 900;
const RES = 1.6; // supersampled screens

const header = (g, left, right) => {
  g.fillStyle = '#0b0b0c';
  g.fillRect(0, 0, SW, SH);
  g.font = '500 18px "JetBrains Mono"';
  g.fillStyle = 'rgba(255,255,255,.45)';
  g.textAlign = 'left';
  g.fillText(left, 48, 70);
  g.textAlign = 'right';
  g.fillText(right, SW - 48, 70);
  g.textAlign = 'left';
};

/* FASTER — an SOS hops from the wristband across the BLE Mesh to the gateway, then the ACK comes back */
const MESH = [
  [110, 640], [210, 520], [330, 590], [400, 450], [150, 380], [290, 330], [420, 240], [210, 200], [96, 250],
];
const LINKS = [[0, 1], [1, 2], [1, 4], [2, 3], [3, 5], [4, 5], [5, 6], [5, 7], [7, 8], [4, 8], [3, 6], [6, 7]];
const ROUTE = [0, 1, 4, 5, 6]; // band → … → gateway
function drawSOS(g, t) {
  header(g, 'BLE MESH  ·  SOS', 'FASTER');
  const cyc = t % 7;
  // links
  g.lineWidth = 1.5;
  LINKS.forEach(([a, b]) => {
    g.strokeStyle = 'rgba(255,255,255,.12)';
    g.beginPath();
    g.moveTo(...MESH[a]);
    g.lineTo(...MESH[b]);
    g.stroke();
  });
  // route progress: out (0→2.4s), ack back (2.6→3.6s)
  const out = Math.min(1, cyc / 2.4);
  const back = Math.max(0, Math.min(1, (cyc - 2.6) / 1.0));
  const seg = ROUTE.length - 1;
  const lit = (k) => out * seg >= k;
  for (let k = 0; k < seg; k++) {
    if (!lit(k + 1) && !(out * seg > k)) continue;
    const f = Math.min(1, out * seg - k);
    const [x0, y0] = MESH[ROUTE[k]];
    const [x1, y1] = MESH[ROUTE[k + 1]];
    g.strokeStyle = 'rgba(255,255,255,.85)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f);
    g.stroke();
  }
  // travelling packets
  const pkt = (p, alpha) => {
    const pos = p * seg;
    const k = Math.min(seg - 1, Math.floor(pos));
    const f = pos - k;
    const [x0, y0] = MESH[ROUTE[k]];
    const [x1, y1] = MESH[ROUTE[k + 1]];
    const x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f;
    const gr = g.createRadialGradient(x, y, 0, x, y, 26);
    gr.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(x - 26, y - 26, 52, 52);
  };
  if (cyc < 2.4) pkt(out, 1);
  if (cyc > 2.6 && cyc < 3.6) pkt(1 - back, 0.8);
  // nodes
  MESH.forEach(([x, y], i) => {
    const band = i === 0, gw = i === 6;
    const on = ROUTE.indexOf(i) >= 0 && lit(ROUTE.indexOf(i));
    g.fillStyle = on ? '#fff' : 'rgba(255,255,255,.35)';
    g.beginPath();
    g.arc(x, y, band || gw ? 11 : 7, 0, Math.PI * 2);
    g.fill();
    if (band && cyc < 2.6) {
      const r = 14 + ((t * 40) % 40);
      g.strokeStyle = `rgba(255,255,255,${1 - (r - 14) / 40})`;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.stroke();
    }
  });
  g.font = '500 13px "JetBrains Mono"';
  g.fillStyle = 'rgba(255,255,255,.5)';
  g.fillText('WRISTBAND', MESH[0][0] - 40, MESH[0][1] + 38);
  g.fillText('GATEWAY', MESH[6][0] - 50, MESH[6][1] - 24);
  // status line
  const steps = ['SOS RAISED', 'RELAYED OVER MESH', 'ACK  < 100 ms', 'RESPONDER EN ROUTE'];
  const st = cyc < 1.2 ? 0 : cyc < 2.6 ? 1 : cyc < 4.2 ? 2 : 3;
  steps.forEach((label, i) => {
    g.fillStyle = i === st ? '#fff' : i < st ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.14)';
    g.font = i === st ? '500 17px "JetBrains Mono"' : '500 14px "JetBrains Mono"';
    g.fillText(`${i < st ? '✓' : i === st ? '●' : '○'}  ${label}`, 48, 730 + i * 34);
  });
}

/* Private AI — a question, retrieved case-file chunks, and a cited answer */
function drawRAG(g, t) {
  header(g, 'PRIVATE  AI', '● ON-PREM');
  const cyc = t % 8;
  // question bubble
  g.fillStyle = 'rgba(255,255,255,.08)';
  g.beginPath();
  g.roundRect(120, 110, SW - 168, 74, 18);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,.85)';
  g.font = '400 20px "Inter Tight"';
  g.fillText('What did the 2021 filing say', 142, 142);
  g.fillText('about the lease terms?', 142, 168);
  // retrieved chunks
  g.font = '500 13px "JetBrains Mono"';
  g.fillStyle = 'rgba(255,255,255,.4)';
  g.fillText('SEMANTIC SEARCH  ·  CASE FILES', 48, 232);
  for (let i = 0; i < 6; i++) {
    const y = 256 + i * 56;
    const hit = i === 1 || i === 4;
    const scan = Math.min(1, Math.max(0, (cyc - 0.4 - i * 0.18) / 0.4));
    g.fillStyle = 'rgba(255,255,255,.05)';
    g.fillRect(48, y, SW - 96, 44);
    const a = hit ? 0.25 + 0.6 * scan : 0.1;
    g.fillStyle = `rgba(255,255,255,${a})`;
    g.fillRect(64, y + 12, (SW - 200) * (0.5 + ((i * 37) % 40) / 100), 6);
    g.fillRect(64, y + 26, (SW - 220) * (0.35 + ((i * 53) % 40) / 100), 6);
    if (hit && scan > 0.5) {
      g.fillStyle = '#fff';
      g.fillText(`[${i === 1 ? 1 : 2}]`, SW - 92, y + 27);
    }
  }
  // answer typing
  const k = Math.max(0, Math.min(1, (cyc - 2.0) / 2.8));
  g.fillStyle = 'rgba(255,255,255,.4)';
  g.fillText('ANSWER', 48, 618);
  const lines = [0.92, 0.84, 0.88, 0.6];
  lines.forEach((w, i) => {
    const f = Math.max(0, Math.min(1, k * lines.length - i));
    g.fillStyle = 'rgba(255,255,255,.75)';
    g.fillRect(48, 640 + i * 26, (SW - 96) * w * f, 8);
  });
  if (k >= 1) {
    g.font = '500 15px "JetBrains Mono"';
    g.fillStyle = '#fff';
    g.fillText('SOURCES  [1] [2]', 48, 770);
  }
  g.font = '500 13px "JetBrains Mono"';
  g.fillStyle = 'rgba(255,255,255,.4)';
  g.fillText('PRIVATE VPN  ·  ROLE-BASED ACCESS', 48, 830);
}

/* Levven — device tiles toggle, a dimmer moves, connection switches local ↔ cloud */
function drawHome(g, t) {
  const away = Math.floor(t / 5) % 2 === 1;
  header(g, 'SMART  HOME', away ? '● AWS CLOUD' : '● LOCAL BLE');
  const devices = ['Kitchen lights', 'Living dimmer', 'Bedroom fan', 'Porch light', 'Office lights', 'Hall dimmer'];
  devices.forEach((name, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 48 + col * ((SW - 112) / 2 + 16);
    const y = 110 + row * 150;
    const w = (SW - 112) / 2, h = 132;
    const on = Math.sin(t * 0.9 + i * 1.7) > -0.2;
    g.fillStyle = on ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.04)';
    g.beginPath();
    g.roundRect(x, y, w, h, 18);
    g.fill();
    g.strokeStyle = on ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.1)';
    g.lineWidth = 1.5;
    g.stroke();
    // toggle
    g.fillStyle = on ? '#fff' : 'rgba(255,255,255,.25)';
    g.beginPath();
    g.roundRect(x + w - 70, y + 20, 48, 26, 13);
    g.fill();
    g.fillStyle = '#0b0b0c';
    g.beginPath();
    g.arc(on ? x + w - 35 : x + w - 57, y + 33, 9, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = on ? '#fff' : 'rgba(255,255,255,.4)';
    g.font = '400 20px "Inter Tight"';
    g.fillText(name, x + 20, y + h - 26);
  });
  // dimmer
  const lv = 0.5 + 0.45 * Math.sin(t * 0.6);
  g.font = '500 13px "JetBrains Mono"';
  g.fillStyle = 'rgba(255,255,255,.4)';
  g.fillText('LIVING DIMMER', 48, 600);
  g.fillStyle = 'rgba(255,255,255,.1)';
  g.fillRect(48, 620, SW - 96, 10);
  g.fillStyle = '#fff';
  g.fillRect(48, 620, (SW - 96) * lv, 10);
  g.beginPath();
  g.arc(48 + (SW - 96) * lv, 625, 13, 0, Math.PI * 2);
  g.fill();
  g.font = '300 54px "Inter Tight"';
  g.fillText(`${Math.round(lv * 100)}%`, 48, 710);
  // connection path
  g.font = '500 14px "JetBrains Mono"';
  const nodes = away ? ['PHONE', 'AWS', 'GATEWAY'] : ['PHONE', 'BLE / Wi-Fi', 'GATEWAY'];
  nodes.forEach((n, i) => {
    const x = 48 + i * ((SW - 96) / 2);
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(x + (i === 2 ? -6 : i === 0 ? 6 : 0), 790, 6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.textAlign = i === 0 ? 'left' : i === 2 ? 'right' : 'center';
    g.fillText(n, x, 826);
  });
  g.textAlign = 'left';
  g.strokeStyle = 'rgba(255,255,255,.3)';
  g.setLineDash([6, 8]);
  g.lineDashOffset = -t * 30;
  g.beginPath();
  g.moveTo(60, 790);
  g.lineTo(SW - 60, 790);
  g.stroke();
  g.setLineDash([]);
}

/* Red Cross demo — bands move between three zones; staff screen shows nearest station + confidence */
const ZONES = [
  { name: 'ENTRY', x: 48, y: 150 },
  { name: 'ROOM A', x: 48, y: 330 },
  { name: 'ROOM B', x: 48, y: 510 },
];
const PLAN = [
  [0, 1, 1, 2, 0],
  [0, 0, 2, 2, 1],
  [0, 2, 1, 0, 0],
  [0, 0, 0, 1, 2],
];
function drawZones(g, t) {
  header(g, 'STAFF VIEW  ·  LIVE', 'RED CROSS');
  const step = Math.floor(t / 3.2);
  const frac = (t % 3.2) / 3.2;
  const zw = SW - 96, zh = 150;
  const counts = [0, 0, 0];
  const bands = PLAN.map((p, b) => {
    const z = p[step % p.length];
    const prev = p[(step + p.length - 1) % p.length];
    counts[z]++;
    return { b, z, moving: z !== prev && frac < 0.45 };
  });
  ZONES.forEach((zn, zi) => {
    g.strokeStyle = 'rgba(255,255,255,.22)';
    g.lineWidth = 1.5;
    g.strokeRect(zn.x, zn.y, zw, zh);
    g.font = '500 15px "JetBrains Mono"';
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.fillText(zn.name, zn.x + 16, zn.y + 30);
    g.textAlign = 'right';
    g.fillText(`${counts[zi]} BAND${counts[zi] === 1 ? '' : 'S'}`, zn.x + zw - 16, zn.y + 30);
    g.textAlign = 'left';
    // gateway station
    const gx = zn.x + zw - 40, gy = zn.y + zh - 36;
    const pulse = (t * 0.8 + zi * 0.3) % 1;
    g.strokeStyle = `rgba(255,255,255,${0.4 * (1 - pulse)})`;
    g.beginPath();
    g.arc(gx, gy, 8 + pulse * 26, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#fff';
    g.fillRect(gx - 6, gy - 6, 12, 12);
  });
  bands.forEach(({ b, z, moving }) => {
    const zn = ZONES[z];
    const bx = zn.x + 40 + b * 62 + Math.sin(t * 1.3 + b) * 4;
    const by = zn.y + 88 + Math.cos(t * 1.1 + b * 2) * 6;
    g.globalAlpha = moving ? 0.35 + 0.35 * Math.abs(Math.sin(t * 6)) : 1;
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(bx, by, 11, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#0b0b0c';
    g.font = '600 12px "JetBrains Mono"';
    g.textAlign = 'center';
    g.fillText(`${b + 1}`, bx, by + 4);
    g.textAlign = 'left';
    g.globalAlpha = 1;
  });
  // confidence list
  g.font = '500 14px "JetBrains Mono"';
  bands.forEach(({ b, z, moving }, k) => {
    const conf = moving ? 'UNCERTAIN' : frac < 0.7 ? 'MEDIUM' : 'HIGH';
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.fillText(`BAND ${b + 1}  →  ${ZONES[z].name}`, 48, 718 + k * 30);
    g.textAlign = 'right';
    g.fillStyle = moving ? 'rgba(255,255,255,.35)' : '#fff';
    g.fillText(conf, SW - 48, 718 + k * 30);
    g.textAlign = 'left';
  });
  g.font = '500 12px "JetBrains Mono"';
  g.fillStyle = 'rgba(255,255,255,.35)';
  g.fillText('ESTIMATE · NEAREST STATION, NOT EXACT ROOM', 48, 862);
}

const DRAW = [drawSOS, drawZones, drawRAG, drawHome]; // same order as PROJECTS

function Monolith({ i, pos }) {
  const root = useRef();
  const body = useRef();
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = SW * RES;
    c.height = SH * RES;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { canvas: c, tex: t };
  }, []);
  const ctx = useMemo(() => {
    const g = canvas.getContext('2d');
    g.setTransform(RES, 0, 0, RES, 0, 0);
    return g;
  }, [canvas]);
  const shot = useMemo(() => store.tl.shots[store.tl.index[`work${i}`]], [i]);
  const yaw = useMemo(() => Math.atan2(shot.pos.x - pos.x, shot.pos.z - pos.z), [shot, pos]);
  const beamMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uO: { value: 0.0 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
        fragmentShader:
          'varying vec2 vUv; uniform float uO; void main(){ float a = pow(vUv.y,2.2)*0.13*uO; a*= 0.6+0.4*sin(vUv.x*6.2832*3.0); gl_FragColor=vec4(vec3(1.0),a);} ',
      }),
    []
  );
  let frame = 0;

  useFrame((s) => {
    const d = Math.abs(s.camera.position.z - pos.z);
    root.current.visible = d < 50;
    if (!root.current.visible) return;
    const t = s.clock.elapsedTime;
    if (d < 32 && frame++ % 2 === 0) {
      DRAW[i](ctx, t);
      tex.needsUpdate = true;
    }
    body.current.position.y = Math.sin(t * 0.7 + i) * 0.06;
    body.current.rotation.y = yaw + Math.sin(t * 0.35 + i) * 0.05;
    beamMat.uniforms.uO.value = THREE.MathUtils.clamp(1.4 - d / 18, 0.15, 1);
  });

  const W = 2.5, H = 4.3, D = 0.22;
  return (
    <group ref={root} position={[pos.x, 0, pos.z]}>
      <group ref={body}>
        <mesh>
          <boxGeometry args={[W, H, D]} />
          <meshPhysicalMaterial color="#0d0d0f" metalness={0.9} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(W, H, D)]} />
          <lineBasicMaterial color="#cfcfd6" transparent opacity={0.55} />
        </lineSegments>
        <mesh position={[0, 0, D / 2 + 0.004]}>
          <planeGeometry args={[W - 0.16, H - 0.16]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
      {/* light shaft from above */}
      <mesh position={[0, FLOOR + 6.5, 0]} material={beamMat}>
        <cylinderGeometry args={[0.35, 2.6, 13, 32, 1, true]} />
      </mesh>
      <spotLight position={[0, 7, 1.5]} angle={0.45} penumbra={0.9} intensity={60} distance={16} color="#e6e6ee" />
    </group>
  );
}

export default function Gallery() {
  return (
    <>
      {L.m.map((p, i) => (
        <Monolith key={i} i={i} pos={p} />
      ))}
    </>
  );
}
