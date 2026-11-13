import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { L, FLOOR } from '../timeline.js';
import { glowTexture } from './textures.js';
import { store } from '../store.js';

const moonFrag = /* glsl */ `
varying vec3 vN;
varying vec2 vUv;
uniform float uTime;
uniform float uFade;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.1; a*=.5;} return v; }
void main(){
  float lit = clamp(dot(normalize(vN), normalize(vec3(-0.35, 0.45, 1.0))), 0.0, 1.0);
  float m = fbm(vUv*vec2(9.0, 5.0));
  float cr = smoothstep(0.55, 0.75, fbm(vUv*vec2(22.0, 12.0)));
  vec3 c = vec3(0.93, 0.93, 0.95) * (0.55 + 0.45*m - cr*0.18) * pow(lit, 0.9);
  float rim = pow(1.0 - clamp(dot(normalize(vN), vec3(0,0,1)), 0.0, 1.0), 2.5);
  c += rim * 0.18;
  gl_FragColor = vec4(c * 1.05 * uFade, 1.0);
}`;

export default function Horizon() {
  const root = useRef();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uFade: { value: 0 } },
        vertexShader: 'varying vec3 vN; varying vec2 vUv; void main(){ vN = normalMatrix*normal; vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
        fragmentShader: moonFrag,
        fog: false,
        toneMapped: false,
      }),
    []
  );
  const moon = useMemo(() => (store.mobile ? new THREE.Vector3(0, 16, L.moon.z) : new THREE.Vector3(20, 9, L.moon.z)), []);
  const glowRef = useRef();
  const streakRef = useRef();
  useFrame((s) => {
    root.current.visible = s.camera.position.z < L.certs.z + 20;
    if (!root.current.visible) return;
    const f = THREE.MathUtils.clamp((-s.camera.position.z + L.certs.z + 7) / 18, 0, 1);
    mat.uniforms.uFade.value = f;
    root.current.children[0].visible = f > 0.01;
    glowRef.current.opacity = 0.2 * f;
    streakRef.current.opacity = 0.45 * f;
    mat.uniforms.uTime.value = s.clock.elapsedTime;
    root.current.children[0].rotation.y = s.clock.elapsedTime * 0.01;
  });
  return (
    <group ref={root}>
      <mesh position={moon} material={mat}>
        <sphereGeometry args={[10, 64, 64]} />
      </mesh>
      <mesh position={[moon.x, moon.y, moon.z + 2]}>
        <planeGeometry args={[70, 70]} />
        <meshBasicMaterial ref={glowRef} map={glowTexture()} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </mesh>
      {/* horizon light streak */}
      <mesh position={[0, FLOOR + 0.6, L.moon.z + 20]}>
        <planeGeometry args={[240, 1.4]} />
        <meshBasicMaterial ref={streakRef} map={glowTexture()} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </mesh>
      <directionalLight position={[0, 6, L.moon.z + 10]} intensity={1.2} color="#e8e8f0" />
    </group>
  );
}
