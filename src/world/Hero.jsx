import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import portraitUrl from '../assets/uma.webp';
import { store, clamp, lerp, ease, easeOut } from '../store.js';
import { sampleWord, measure, glowTexture } from './textures.js';

/* ---------------- Particle word: ENGINEER → SENTHIL ---------------- */
const pointsVert = /* glsl */ `
attribute vec3 aA;
attribute vec3 aB;
attribute vec3 aR;
attribute float aRand;
uniform float uAssemble, uMorph, uDisperse, uTime, uSize, uPR;
uniform vec2 uMouse;
varying float vAlpha;
varying float vBright;
void main(){
  float a = smoothstep(aRand*0.45, aRand*0.45+0.55, uAssemble);
  vec3 p = mix(aR, aA, a);
  // swirl while assembling
  float sw = (1.0-a);
  p.xy += vec2(sin(uTime*1.3+aRand*30.0), cos(uTime*1.1+aRand*21.0))*0.08*sw;

  float m = smoothstep(aRand*0.4, aRand*0.4+0.6, uMorph);
  vec3 mid = (p + aB)*0.5 + vec3(sin(aRand*40.0)*0.18, cos(aRand*33.0)*0.22, sin(aRand*12.0)*0.9);
  vec3 q = mix(mix(p, mid, m), mix(mid, aB, m), m);

  // breathing shimmer
  q += vec3(sin(uTime*1.7+aRand*50.0), cos(uTime*1.3+aRand*70.0), sin(uTime+aRand*9.0))*0.0035;

  // pointer repel
  vec2 d = q.xy - uMouse;
  float f = smoothstep(0.11, 0.0, length(d));
  q.xy += normalize(d+1e-5)*f*0.05;
  q.z += f*0.12;

  // scroll: dissolve into drifting dust
  q += (aR*1.6 + vec3(0.0, 0.35 + aRand*0.8, 0.6)) * uDisperse * (0.6 + aRand);

  vec4 mv = modelViewMatrix * vec4(q, 1.0);
  gl_Position = projectionMatrix * mv;
  float s = uSize * (0.55 + aRand*0.9) * (1.0 + f*0.6);
  gl_PointSize = s * uPR * (8.0 / -mv.z);
  vAlpha = (0.45 + 0.55*fract(aRand*7.13)) * (1.0 - uDisperse*0.85);
  vBright = 0.75 + 0.25*sin(uTime*2.0 + aRand*60.0) + f*0.5;
}`;
const pointsFrag = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor;
varying float vAlpha;
varying float vBright;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor * vBright, a * a * vAlpha * uOpacity);
}`;

/* ---------------- Portrait materialising from smoke ---------------- */
const portraitVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const portraitFrag = /* glsl */ `
uniform sampler2D uTex;
uniform float uProgress, uTime;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(3.1,1.7); a*=.5;} return v; }
void main(){
  vec2 uv = vUv;
  float t = uTime*0.12;
  float n = fbm(uv*vec2(3.2, 4.5) + vec2(t*0.6, -t));
  float n2 = fbm(uv*9.0 - vec2(0.0, t*2.0));
  // smoke condenses from the face outward, rising wisps
  float d = n*0.62 + n2*0.18 + length((uv - vec2(0.5, 0.72))*vec2(1.0, 0.8))*0.62;
  float thr = uProgress * 1.35 - 0.05;
  float edge = thr - d;                       // >0 means visible
  vec2 warp = vec2(n - 0.5, n2 - 0.5) * 0.06 * (1.0 - smoothstep(0.0, 0.25, edge));
  warp.y -= 0.03 * (1.0 - smoothstep(0.0, 0.3, edge));
  vec4 tex = texture2D(uTex, uv + warp);
  float solid = smoothstep(0.0, 0.16, edge);
  float wisp  = smoothstep(-0.14, 0.0, edge) * (1.0 - solid);
  vec3 smoke = vec3(0.78, 0.78, 0.82) * (0.55 + n2*0.9);
  vec3 col = mix(smoke, tex.rgb, solid);
  float alpha = tex.a * (solid + wisp * 0.75 * n2);
  // rim of light where smoke becomes skin
  col += vec3(1.0) * wisp * 0.35;
  alpha *= smoothstep(0.0, 0.07, uv.y);       // fade into the floor smoke
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(col, alpha);
}`;

const veilFrag = /* glsl */ `
uniform float uTime, uAmount, uLow, uSeed;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<6;i++){ v+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=.5;} return v; }
void main(){
  vec2 p = vUv * vec2(3.4, 2.4) + uSeed;
  float t = uTime * 0.09;
  vec2 q = vec2(fbm(p + vec2(0.0, -t*2.0)), fbm(p + vec2(5.2, 1.3) - vec2(t*0.4, t*1.6)));
  vec2 r = vec2(fbm(p + 2.4*q + vec2(1.7, 9.2) - vec2(0.0, t*2.6)), fbm(p + 2.4*q + vec2(8.3, 2.8)));
  float n = fbm(p + 2.6*r);
  float dens = smoothstep(0.38, 0.95, n);
  float sx = smoothstep(0.5, 0.18, abs(vUv.x - 0.5));
  float sy = smoothstep(1.0, 0.72, vUv.y);
  float low = mix(1.0, smoothstep(0.32, 0.04, vUv.y), uLow);
  vec3 col = vec3(0.70, 0.70, 0.74) * (0.55 + 0.75*n);
  gl_FragColor = vec4(col, dens * sx * sy * low * uAmount);
}`;

const wordRatio = { v: 0.78 };
const WORD_A = 'ENGINEER'; // forms first
const WORD_B = 'SENTHIL'; // settles behind the portrait

export default function Hero() {
  const { size, camera, gl } = useThree();
  const [data, setData] = useState(null);
  const tex = useTexture(portraitUrl);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const textGroup = useRef();
  const portrait = useRef();
  const halo = useRef();
  const rootRef = useRef();
  const mouseLocal = useMemo(() => new THREE.Vector2(9, 9), []);

  // sample the two words once fonts are in
  useEffect(() => {
    let alive = true;
    const font = '900 220px "Inter Tight"';
    const timeout = new Promise((r) => setTimeout(r, 2500));
    Promise.race([Promise.all([document.fonts.load(font), document.fonts.load('400 40px "Instrument Serif"'), document.fonts.load('500 20px "JetBrains Mono"')]), timeout]).then(() => {
      if (!alive) return;
      const N = store.mobile ? 9000 : 22000;
      const norm = measure(WORD_A, font);
      const A = sampleWord(WORD_A, N, norm, font);
      const B = sampleWord(WORD_B, N, norm, font);
      wordRatio.v = measure(WORD_B, font) / norm;
      const R = new Float32Array(N * 3);
      const rnd = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const r = 0.6 + Math.random() * 1.4;
        R[i * 3] = Math.sin(ph) * Math.cos(th) * r * 1.3;
        R[i * 3 + 1] = Math.cos(ph) * r * 0.7;
        R[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r;
        rnd[i] = Math.random();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(B.slice(), 3));
      geo.setAttribute('aA', new THREE.BufferAttribute(A, 3));
      geo.setAttribute('aB', new THREE.BufferAttribute(B, 3));
      geo.setAttribute('aR', new THREE.BufferAttribute(R, 3));
      geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
      setData({ geo });
      store.ready = true;
    });
    return () => {
      alive = false;
    };
  }, []);

  const pointsMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pointsVert,
        fragmentShader: pointsFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uAssemble: { value: 0 },
          uMorph: { value: 0 },
          uDisperse: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: store.mobile ? 3.0 : 2.7 },
          uPR: { value: 1 },
          uMouse: { value: new THREE.Vector2(9, 9) },
          uOpacity: { value: 1 },
          uColor: { value: new THREE.Color(1.5, 1.5, 1.56) },
        },
      }),
    []
  );

  const portraitMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: portraitVert,
        fragmentShader: portraitFrag,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: { uTex: { value: tex }, uProgress: { value: 0 }, uTime: { value: 0 } },
      }),
    [tex]
  );

  /* responsive layout (units at camera distance 8) */
  const lay = useMemo(() => {
    const aspect = size.width / size.height;
    const visH = 2 * 8 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * aspect;
    const mobile = size.width < 760;
    const H = mobile ? Math.min(0.98 * visH, 2.15 * visW) : Math.min(1.14 * visH, 1.62 * visW);
    const W = H * (880 / 941);
    const bottom = -visH / 2 - H * (mobile ? 0.09 : 0.13);
    const k = (8 + 2.6) / 8; // depth compensation for text pushed back
    return {
      W,
      H,
      py: bottom + H / 2,
      s0: (mobile ? 0.92 : 0.76) * visW,
      sF: (mobile ? 0.9 : 0.8) * visW * k,
      yF: (bottom + H * (mobile ? 0.9 : 0.77)) * k,
      visW,
      visH,
    };
  }, [size, camera.fov]);

  // animated smoke veils, one in front of her and one behind
  const veils = useMemo(
    () =>
      [0.0, 3.7].map(
        (seed) =>
          new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uLow: { value: 0 }, uSeed: { value: seed } },
            vertexShader: portraitVert,
            fragmentShader: veilFrag,
          })
      ),
    []
  );

  useFrame((state, dt) => {
    if (!data) return;
    const tl = store.tl;
    if (!store.introDone) {
      store.introT += Math.min(dt, 0.05) * (store.reduced ? 3 : 1);
      if (store.introT > 6.7) {
        store.introDone = true;
        store.onIntroDone?.();
      }
    }
    const t = store.introT;
    const time = state.clock.elapsedTime;
    const u = store.off;
    const s0 = tl.segs[0];
    const s1 = tl.segs[1];
    const exit = clamp((u - s0.he) / (s1.hs - s0.he));
    rootRef.current.visible = exit < 0.999;
    if (!rootRef.current.visible) return;

    const assemble = easeOut(clamp((t - 0.25) / 1.9));
    const morph = ease(clamp((t - 2.5) / 1.6));
    const settle = ease(clamp((t - 3.9) / 1.8));
    const reveal = clamp((t - 4.1) / 2.4);
    const smokeIn = ease(clamp((t - 3.3) / 1.2));
    const smokeOut = ease(clamp((t - 5.4) / 1.4));

    const u_ = pointsMat.uniforms;
    u_.uAssemble.value = assemble;
    u_.uMorph.value = morph;
    u_.uDisperse.value = ease(exit);
    u_.uTime.value = time;
    u_.uPR.value = gl.getPixelRatio();
    u_.uOpacity.value = clamp(t / 0.6);

    const g = textGroup.current;
    const sc = lerp(lay.s0, lay.sF / wordRatio.v, settle);
    g.scale.setScalar(sc);
    g.position.set(0, lerp(0.15, lay.yF, settle), lerp(0, -2.6, settle));

    // pointer in text-local coords
    const depth = 8 - g.position.z;
    const halfH = depth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const mx = store.smouse.x * halfH * (size.width / size.height);
    const my = -store.smouse.y * halfH;
    mouseLocal.set((mx - g.position.x) / sc, (my - g.position.y) / sc);
    if (store.hasPointer) u_.uMouse.value.copy(mouseLocal);
    else u_.uMouse.value.set(99, 99);

    portraitMat.uniforms.uProgress.value = ease(reveal) * (1 - ease(clamp(exit * 2.4)));
    portraitMat.uniforms.uTime.value = time;
    portrait.current.position.y = lay.py + Math.sin(time * 0.6) * 0.02;
    halo.current.material.opacity = 0.16 * ease(reveal) * (1 - clamp(exit * 2.4));

    // smoke: billows in as she forms, settles to her feet, swallows her again on scroll
    const burst = Math.sin(clamp(exit * 2.0) * Math.PI) * (1 - clamp(exit * 1.6 - 0.6));
    const amount = smokeIn * 0.95 - smokeOut * 0.8 + burst * 0.9;
    const low = clamp(smokeOut - burst * 1.4);
    veils.forEach((m, i) => {
      m.uniforms.uTime.value = time * (i ? 0.8 : 1);
      m.uniforms.uAmount.value = Math.max(0, amount) * (i ? 0.7 : 1) * (1 - clamp((exit - 0.7) / 0.3));
      m.uniforms.uLow.value = low;
    });
  });

  return (
    <group ref={rootRef}>
      <group ref={textGroup}>{data && <points geometry={data.geo} material={pointsMat} frustumCulled={false} />}</group>
      <mesh ref={halo} position={[0, lay.py + lay.H * 0.12, -0.4]} renderOrder={3}>
        <planeGeometry args={[lay.W * 1.6, lay.H * 1.1]} />
        <meshBasicMaterial map={glowTexture()} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={portrait} material={portraitMat} renderOrder={5} position={[0, lay.py, 0]}>
        <planeGeometry args={[lay.W, lay.H]} />
      </mesh>
      <mesh material={veils[1]} position={[0, lay.py - lay.H * 0.2, -0.7]} renderOrder={4}>
        <planeGeometry args={[lay.visW * 1.3, lay.H * 1.55]} />
      </mesh>
      <mesh material={veils[0]} position={[0, lay.py - lay.H * 0.25, 0.5]} renderOrder={6}>
        <planeGeometry args={[lay.visW * 1.2, lay.H * 1.5]} />
      </mesh>
    </group>
  );
}
