import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { L, FLOOR } from '../timeline.js';

function Arch({ z, i }) {
  const ref = useRef();
  const glow = useRef();
  const W = 4.6;
  const H = 5.6;
  const T = 0.05;
  const cy = FLOOR + H / 2;
  useFrame((s) => {
    const d = s.camera.position.z - z;
    ref.current.visible = Math.abs(d) < 60;
    // light up when the camera reaches it, fade once passed
    const k = d > 0 ? THREE.MathUtils.clamp(1 - (d - 4) / 14, 0.25, 1) : THREE.MathUtils.clamp(1 + d / 3, 0, 1);
    const c = 0.35 + k * 1.15;
    glow.current.forEach((m) => m.color.setScalar(c));
    ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.2 + i) * 0.015 + (i - 1) * 0.04;
  });
  const mats = [];
  glow.current = mats;
  const bar = (pos, size, key) => (
    <mesh key={key} position={pos}>
      <boxGeometry args={size} />
      <meshBasicMaterial ref={(m) => m && mats.push(m)} color={[1, 1, 1]} toneMapped={false} />
    </mesh>
  );
  return (
    <group ref={ref} position={[0, 0, z]}>
      {bar([-W / 2, cy, 0], [T, H, T], 'l')}
      {bar([W / 2, cy, 0], [T, H, T], 'r')}
      {bar([0, FLOOR + H, 0], [W + T, T, T], 't')}
      {/* inner frame, thinner and offset in depth */}
      <mesh position={[0, cy, -0.6]}>
        <boxGeometry args={[W - 0.5, H - 0.4, 0.001]} />
        <meshBasicMaterial color="#000" transparent opacity={0} depthWrite={false} />
      </mesh>
      <lineSegments position={[0, cy - 0.2, -0.8]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(W - 0.7, H - 0.6)]} />
        <lineBasicMaterial color="#9a9aa2" transparent opacity={0.5} />
      </lineSegments>
      <pointLight position={[0, FLOOR + H - 0.4, 0.5]} intensity={16} distance={9} color="#ffffff" />
    </group>
  );
}

export default function Corridor() {
  return (
    <>
      {L.arches.map((z, i) => (
        <Arch key={i} z={z} i={i} />
      ))}
    </>
  );
}
