import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { store } from '../store.js';
import { FLOOR } from '../timeline.js';

export function Floor() {
  const mobile = store.mobile;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR, -200]}>
      <planeGeometry args={[140, 460]} />
      {mobile ? (
        <meshStandardMaterial color="#0b0b0c" metalness={0.85} roughness={0.42} />
      ) : (
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={512}
          mixBlur={1}
          mixStrength={3.2}
          roughness={1}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0c0c0d"
          metalness={0.6}
          mirror={0.6}
        />
      )}
    </mesh>
  );
}

const dustVert = /* glsl */ `
attribute float aRand;
uniform float uTime, uPR;
varying float vA;
void main(){
  vec3 p = position;
  p.y += sin(uTime*0.2 + aRand*40.0)*0.35;
  p.x += cos(uTime*0.15 + aRand*30.0)*0.35;
  vec4 mv = modelViewMatrix * vec4(p,1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.0 + aRand*2.2) * uPR * (10.0 / -mv.z);
  vA = smoothstep(60.0, 4.0, -mv.z) * (0.25 + aRand*0.6) * smoothstep(0.3, 2.0, -mv.z);
}`;
const dustFrag = /* glsl */ `
varying float vA;
void main(){ float d = length(gl_PointCoord-0.5); gl_FragColor = vec4(vec3(1.0), smoothstep(0.5,0.0,d)*vA); }`;

export function Dust() {
  const { gl } = useThree();
  const geo = useMemo(() => {
    const N = store.mobile ? 2800 : 5200;
    const p = new Float32Array(N * 3);
    const r = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      p[i * 3] = (Math.random() - 0.5) * 30;
      p[i * 3 + 1] = FLOOR + Math.random() * 11;
      p[i * 3 + 2] = 12 - Math.random() * 380;
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
        vertexShader: dustVert,
        fragmentShader: dustFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPR: { value: 1 } },
      }),
    []
  );
  useFrame((s) => {
    mat.uniforms.uTime.value = s.clock.elapsedTime;
    mat.uniforms.uPR.value = gl.getPixelRatio();
  });
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

/* soft ground mist that travels with the camera — no hard sprite edges */
const mistFrag = /* glsl */ `
uniform float uTime, uOpacity;
uniform vec3 uCam;
varying vec3 vW;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.02+vec2(1.3,7.1); a*=.5;} return v; }
void main(){
  vec2 p = vW.xz * 0.11;
  float t = uTime * 0.03;
  float n = fbm(p + vec2(t, -t*0.6) + fbm(p*1.7 - t)*0.8);
  n = smoothstep(0.35, 0.85, n);
  float d = length(vW.xz - uCam.xz);
  float fade = smoothstep(42.0, 10.0, d) * smoothstep(1.2, 4.0, d);
  gl_FragColor = vec4(vec3(0.72, 0.72, 0.76), n * fade * uOpacity);
}`;

export function GroundMist() {
  const refs = useRef([]);
  const layers = useMemo(
    () =>
      [
        { y: FLOOR + 0.35, o: 0.26 },
        { y: FLOOR + 1.1, o: 0.12 },
      ].map((l) => ({
        ...l,
        mat: new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { uTime: { value: 0 }, uOpacity: { value: l.o }, uCam: { value: new THREE.Vector3() } },
          vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
          fragmentShader: mistFrag,
        }),
      })),
    []
  );
  useFrame((s) => {
    layers.forEach((l, i) => {
      const m = refs.current[i];
      if (!m) return;
      m.position.x = s.camera.position.x;
      m.position.z = s.camera.position.z - 20;
      l.mat.uniforms.uTime.value = s.clock.elapsedTime * (1 + i * 0.4);
      l.mat.uniforms.uCam.value.copy(s.camera.position);
    });
  });
  return layers.map((l, i) => (
    <mesh key={i} ref={(el) => (refs.current[i] = el)} rotation={[-Math.PI / 2, 0, 0]} position={[0, l.y, 0]} material={l.mat} renderOrder={2}>
      <planeGeometry args={[110, 110]} />
    </mesh>
  ));
}

/* helper: hide a group when the camera is far away (fog hides it anyway) */
export function useCull(ref, z, range = 55) {
  const { camera } = useThree();
  useFrame(() => {
    if (ref.current) ref.current.visible = Math.abs(camera.position.z - z) < range;
  });
}
