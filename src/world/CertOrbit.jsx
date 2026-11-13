import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { L, local } from '../timeline.js';
import { store } from '../store.js';
import { BUILDS as CERTS } from '../content.js';
import { wrap, glowTexture } from './textures.js';

const CW = 512;
const CH = 716;
const RES = 1.6;

function cardTexture(issuer, title, i) {
  const c = document.createElement('canvas');
  c.width = CW * RES;
  c.height = CH * RES;
  const g = c.getContext('2d');
  g.setTransform(RES, 0, 0, RES, 0, 0);
  const grd = g.createLinearGradient(0, 0, CW, CH);
  grd.addColorStop(0, '#222226');
  grd.addColorStop(0.6, '#101012');
  grd.addColorStop(1, '#0b0b0c');
  g.fillStyle = grd;
  g.beginPath();
  g.roundRect(4, 4, CW - 8, CH - 8, 34);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,.22)';
  g.lineWidth = 3;
  g.stroke();
  // subtle holo lines
  g.strokeStyle = 'rgba(255,255,255,.04)';
  g.lineWidth = 1;
  for (let k = -CH; k < CW; k += 22) {
    g.beginPath();
    g.moveTo(k, CH);
    g.lineTo(k + CH, 0);
    g.stroke();
  }
  g.fillStyle = 'rgba(255,255,255,.55)';
  g.font = '500 22px "JetBrains Mono"';
  g.fillText(issuer.toUpperCase(), 44, 76);
  g.textAlign = 'right';
  g.fillText(`0${i + 1}`, CW - 44, 76);
  g.textAlign = 'left';
  g.fillStyle = '#f4f4f6';
  g.font = '400 58px "Instrument Serif"';
  const lines = wrap(g, title, CW - 88);
  lines.forEach((l, k) => g.fillText(l, 44, CH - 120 - (lines.length - 1 - k) * 60));
  g.fillStyle = 'rgba(255,255,255,.4)';
  g.font = '500 18px "JetBrains Mono"';
  g.fillText('✦  BUILT', 44, CH - 50);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export default function CertOrbit() {
  const root = useRef();
  const ring = useRef();
  const cards = useRef([]);
  const [hover, setHover] = useState(-1);
  const texes = useMemo(() => CERTS.map(([a, b], i) => cardTexture(a, b, i)), []);
  const R = store.mobile ? 3.1 : 5.2;
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const lift = useRef(CERTS.map(() => 0));

  useFrame((s, dt) => {
    const d = Math.abs(s.camera.position.z - L.certs.z);
    root.current.visible = d < 55;
    if (!root.current.visible) return;
    const t = s.clock.elapsedTime;
    const tl = store.tl;
    const lp = local(tl, store.off, tl.index.certs);
    const base = t * 0.12 + lp * Math.PI * 0.9;
    cards.current.forEach((m, i) => {
      if (!m) return;
      const a = base + (i / CERTS.length) * Math.PI * 2;
      lift.current[i] += ((hover === i ? 1 : 0) - lift.current[i]) * Math.min(1, dt * 8);
      const L_ = lift.current[i];
      const r = R + L_ * 0.6;
      m.position.set(Math.cos(a) * r, Math.sin(a) * 0.55 + L_ * 0.35, Math.sin(a) * r);
      tmp.copy(s.camera.position).sub(root.current.position);
      m.lookAt(tmp.x, m.position.y, tmp.z);
      m.rotateZ(Math.sin(a) * 0.08);
      const sc = 1 + L_ * 0.35;
      m.scale.setScalar(sc);
    });
    ring.current.rotation.z = t * 0.1;
  });

  return (
    <group ref={root} position={L.certs}>
      {texes.map((tx, i) => (
        <mesh
          key={i}
          ref={(el) => (cards.current[i] = el)}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(i);
            store.hover3d = true;
          }}
          onPointerOut={() => {
            setHover(-1);
            store.hover3d = false;
          }}
          onClick={(e) => {
            e.stopPropagation();
            setHover((h) => (h === i ? -1 : i));
          }}
        >
          <planeGeometry args={[1.62, 2.27]} />
          <meshBasicMaterial map={tx} transparent side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
      {/* core light */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color={[3, 3, 3.1]} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial map={glowTexture()} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group ref={ring} rotation={[Math.PI / 2.25, 0, 0]}>
        <mesh>
          <torusGeometry args={[R, 0.006, 6, 200]} />
          <meshBasicMaterial color={[1.3, 1.3, 1.4]} toneMapped={false} transparent opacity={0.6} />
        </mesh>
        <mesh>
          <torusGeometry args={[R * 0.55, 0.005, 6, 160]} />
          <meshBasicMaterial color="#8d8d95" transparent opacity={0.5} />
        </mesh>
      </group>
      <pointLight intensity={30} distance={14} color="#ffffff" />
    </group>
  );
}
