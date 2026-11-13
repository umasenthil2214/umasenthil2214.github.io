import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { L, FLOOR, vis, local } from '../timeline.js';
import { store, clamp, easeOut } from '../store.js';
import { STATS } from '../content.js';

const X = [-4.5, -1.5, 1.5, 4.5];

export default function Towers() {
  const { size } = useThree();
  const root = useRef();
  const bodies = useRef([]);
  const caps = useRef([]);
  const edges = useRef([]);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.95, 1, 0.95)), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const xs = store.mobile ? X.map((x) => x * 0.62) : X;

  useFrame((s) => {
    const d = Math.abs(s.camera.position.z - L.towers);
    root.current.visible = d < 55;
    if (!root.current.visible) return;
    const tl = store.tl;
    const i0 = tl.index.numbers;
    // towers rise as you approach
    const seg = tl.segs[i0];
    const prev = tl.segs[i0 - 1];
    const approach = clamp((store.off - prev.he) / (seg.hs - prev.he));
    const t = s.clock.elapsedTime;
    const sv = vis(tl, store.off, i0, 0.5);
    STATS.forEach((st, i) => {
      const k = easeOut(clamp(approach * 1.5 - i * 0.12 + clamp(local(tl, store.off, i0)) * 0.3));
      const h = Math.max(0.001, st.h * k);
      const b = bodies.current[i];
      b.scale.y = h;
      b.position.y = FLOOR + h / 2;
      caps.current[i].position.y = FLOOR + h + 0.03;
      caps.current[i].material.color.setScalar(1.6 + Math.sin(t * 2 + i) * 0.4);
      const e = edges.current[i];
      e.scale.y = h;
      e.position.y = FLOOR + h / 2;

      const el = store.labels.towers[i];
      if (el) {
        v.set(xs[i], FLOOR + h + 0.55, L.towers).project(s.camera);
        const x = (v.x * 0.5 + 0.5) * size.width;
        const y = (-v.y * 0.5 + 0.5) * size.height;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
        el.style.opacity = v.z > 1 ? '0' : String(sv * clamp(k * 1.4));
        const num = el.querySelector('.tw-num');
        const val = Math.round(st.value * k).toLocaleString('en-US');
        if (num && num.textContent !== String(val)) num.textContent = String(val);
      }
    });
  });

  return (
    <group ref={root}>
      {STATS.map((st, i) => (
        <group key={i} position={[xs[i], 0, L.towers]}>
          <mesh ref={(el) => (bodies.current[i] = el)}>
            <boxGeometry args={[0.95, 1, 0.95]} />
            <meshPhysicalMaterial color="#121214" metalness={0.9} roughness={0.2} clearcoat={1} transparent opacity={0.92} />
          </mesh>
          <mesh ref={(el) => (caps.current[i] = el)}>
            <boxGeometry args={[0.97, 0.05, 0.97]} />
            <meshBasicMaterial color={[2, 2, 2]} toneMapped={false} />
          </mesh>
          <lineSegments ref={(el) => (edges.current[i] = el)} geometry={edgeGeo}>
            <lineBasicMaterial color="#d6d6de" transparent opacity={0.55} />
          </lineSegments>
        </group>
      ))}
      <pointLight position={[0, 4, L.towers + 4]} intensity={50} distance={20} color="#e8e8f0" />
      {/* floor grid ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR + 0.01, L.towers]}>
        <ringGeometry args={[7.5, 7.53, 128]} />
        <meshBasicMaterial color={[1.4, 1.4, 1.5]} toneMapped={false} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
