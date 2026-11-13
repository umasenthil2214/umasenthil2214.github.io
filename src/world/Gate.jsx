import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { L } from '../timeline.js';
import { store } from '../store.js';
import { glowTexture } from './textures.js';
import { useCull } from './Environment.jsx';

const vert = /* glsl */ `
attribute float aRand;
uniform float uTime, uPR, uPulse;
varying float vA;
void main(){
  vec3 p = position;
  float ang = atan(p.y, p.x);
  float wave = sin(ang*6.0 - uTime*1.4 + aRand*2.0);
  p.xy *= 1.0 + wave*0.012 + uPulse*0.05*sin(aRand*20.0 + uTime*3.0);
  p.z += wave*0.15;
  vec4 mv = modelViewMatrix * vec4(p,1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.2 + aRand*2.6) * uPR * (14.0 / -mv.z);
  vA = 0.25 + 0.75*smoothstep(0.2, 1.0, wave*0.5+0.5);
}`;
const frag = /* glsl */ `
varying float vA;
void main(){ float d=length(gl_PointCoord-0.5); gl_FragColor = vec4(vec3(1.05), smoothstep(0.5,0.0,d)*vA*0.85); }`;

export default function Gate() {
  const { gl } = useThree();
  const root = useRef();
  const ringA = useRef();
  const ringB = useRef();
  useCull(root, L.gate.z, 31);

  const geo = useMemo(() => {
    const N = store.mobile ? 4000 : 7000;
    const p = new Float32Array(N * 3);
    const r = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const tube = Math.pow(Math.random(), 2) * 0.55;
      const b = Math.random() * Math.PI * 2;
      const R = 6.2 + Math.cos(b) * tube;
      p[i * 3] = Math.cos(a) * R;
      p[i * 3 + 1] = Math.sin(a) * R;
      p[i * 3 + 2] = Math.sin(b) * tube;
      r[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(r, 1));
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPR: { value: 1 }, uPulse: { value: 0 } },
      }),
    []
  );

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    mat.uniforms.uTime.value = t;
    mat.uniforms.uPR.value = gl.getPixelRatio();
    // ring breathes harder as you approach it
    const d = Math.abs(s.camera.position.z - L.gate.z);
    mat.uniforms.uPulse.value = THREE.MathUtils.clamp(1 - d / 14, 0, 1);
    ringA.current.rotation.z = t * 0.05;
    ringB.current.rotation.z = -t * 0.08;
    ringB.current.rotation.x = Math.sin(t * 0.3) * 0.15;
  });

  return (
    <group ref={root} position={L.gate}>
      <group ref={ringA}>
        <points geometry={geo} material={mat} frustumCulled={false} />
      </group>
      <mesh>
        <torusGeometry args={[6.2, 0.018, 8, 200]} />
        <meshBasicMaterial color={[2.2, 2.2, 2.3]} toneMapped={false} />
      </mesh>
      <group ref={ringB}>
        <mesh>
          <torusGeometry args={[7.4, 0.01, 6, 200]} />
          <meshBasicMaterial color="#9a9aa0" transparent opacity={0.5} />
        </mesh>
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 7.4, Math.sin(a) * 7.4, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.02, 0.38, 0.02]} />
              <meshBasicMaterial color={[1.6, 1.6, 1.7]} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      {/* portal haze */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial map={glowTexture()} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight position={[0, 0, 2]} intensity={30} distance={22} color="#dedee6" />
    </group>
  );
}
