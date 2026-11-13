import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { L } from '../timeline.js';
import { store, clamp } from '../store.js';
import { SKILLS } from '../content.js';
import { vis } from '../timeline.js';

const R = 4.3;

export default function Constellation() {
  const { size, gl } = useThree();
  const root = useRef();
  const spin = useRef();
  const nodes = useRef();
  const hiLines = useRef();
  const pulses = useRef();
  const core = useRef();
  const solid = useRef();

  const { pts, edges, lineGeo } = useMemo(() => {
    const n = SKILLS.length;
    const pts = SKILLS.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = Math.PI * (3 - Math.sqrt(5)) * i;
      const j = 0.82 + Math.random() * 0.3;
      return new THREE.Vector3(Math.cos(th) * r * R * j, y * R * j, Math.sin(th) * r * R * j);
    });
    const set = new Set();
    const edges = [];
    pts.forEach((p, i) => {
      const near = pts
        .map((q, j) => [j, p.distanceToSquared(q)])
        .filter(([j]) => j !== i)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3);
      near.forEach(([j]) => {
        const k = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!set.has(k)) {
          set.add(k);
          edges.push([i, j]);
        }
      });
    });
    // also connect every node faintly to the core
    const pos = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], k) => {
      pos.set([pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z], k * 6);
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { pts, edges, lineGeo };
  }, []);

  const hiGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SKILLS.length * 12), 3));
    g.setDrawRange(0, 0);
    return g;
  }, []);

  const pulseData = useMemo(() => {
    const N = 46;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    const list = Array.from({ length: N }, () => ({ e: Math.floor(Math.random() * edges.length), t: Math.random(), v: 0.25 + Math.random() * 0.5 }));
    return { geo, list };
  }, [edges]);

  const pulseMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uPR: { value: 1 } },
        vertexShader:
          'uniform float uPR; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=6.0*uPR*(10.0/-mv.z);} ',
        fragmentShader: 'void main(){ float d=length(gl_PointCoord-0.5); gl_FragColor=vec4(vec3(1.6), smoothstep(0.5,0.0,d)); }',
      }),
    []
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const lastGroup = useRef('init');

  useFrame((s, dt) => {
    const d = Math.abs(s.camera.position.z - L.skills.z);
    root.current.visible = d < 30;
    if (!root.current.visible) {
      // make sure no skill label lingers over other sections
      if (lastGroup.current !== 'hidden') {
        (store.labels.skills || []).forEach((el) => el && (el.style.opacity = '0'));
        lastGroup.current = 'hidden';
      }
      return;
    }
    const t = s.clock.elapsedTime;
    const g = spin.current;
    g.rotation.y += dt * 0.08;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, store.smouse.y * 0.35, 0.04);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -store.smouse.x * 0.2, 0.04);
    core.current.rotation.y = t * 0.3;
    core.current.rotation.x = t * 0.17;
    solid.current.rotation.y = -t * 0.5;
    const pulse = 1 + Math.sin(t * 1.6) * 0.04;
    core.current.scale.setScalar(pulse);

    const grp = store.skillGroup;
    // nodes
    pts.forEach((p, i) => {
      const on = grp && SKILLS[i].g === grp;
      dummy.position.copy(p);
      dummy.scale.setScalar(on ? 2.2 : grp ? 0.7 : 1);
      dummy.updateMatrix();
      nodes.current.setMatrixAt(i, dummy.matrix);
    });
    nodes.current.instanceMatrix.needsUpdate = true;

    // highlighted links among the active group
    if (lastGroup.current !== grp) {
      lastGroup.current = grp;
      const arr = hiGeo.attributes.position.array;
      let k = 0;
      if (grp) {
        const idx = SKILLS.map((s, i) => (s.g === grp ? i : -1)).filter((i) => i >= 0);
        for (let a = 0; a < idx.length; a++) {
          const P = pts[idx[a]];
          const Q = pts[idx[(a + 1) % idx.length]];
          arr.set([P.x, P.y, P.z, Q.x, Q.y, Q.z], k * 6);
          k++;
          arr.set([P.x, P.y, P.z, 0, 0, 0], k * 6);
          k++;
        }
      }
      hiGeo.attributes.position.needsUpdate = true;
      hiGeo.setDrawRange(0, k * 2);
    }

    // signals travelling along edges
    const parr = pulseData.geo.attributes.position.array;
    pulseData.list.forEach((pl, i) => {
      pl.t += dt * pl.v;
      if (pl.t > 1) {
        pl.t = 0;
        pl.e = Math.floor(Math.random() * edges.length);
      }
      const [a, b] = edges[pl.e];
      v.lerpVectors(pts[a], pts[b], pl.t);
      parr[i * 3] = v.x;
      parr[i * 3 + 1] = v.y;
      parr[i * 3 + 2] = v.z;
    });
    pulseData.geo.attributes.position.needsUpdate = true;
    pulseMat.uniforms.uPR.value = gl.getPixelRatio();

    // project labels into the HTML overlay
    const tl = store.tl;
    const sv = vis(tl, store.off, tl.index.skills, 0.5);
    const labels = store.labels.skills;
    const w = size.width, h = size.height;
    pts.forEach((p, i) => {
      const el = labels[i];
      if (!el) return;
      v.copy(p).applyMatrix4(g.matrixWorld);
      const dist = v.distanceTo(s.camera.position);
      v.project(s.camera);
      if (sv <= 0.01 || v.z > 1) {
        el.style.opacity = '0';
        return;
      }
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      const depth = clamp((18 - dist) / 8, 0, 1); // nearer = brighter
      const on = grp && SKILLS[i].g === grp;
      const front = depth > 0.45; // only the near hemisphere gets readable labels
      const o = sv * (grp ? (on ? 1 : 0.06) : front ? 0.35 + depth * 0.65 : 0.05);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -140%) scale(${0.8 + depth * 0.3 + (on ? 0.15 : 0)})`;
      el.style.opacity = o.toFixed(3);
      el.classList.toggle('hl', !!on);
    });
  });

  return (
    <group ref={root} position={L.skills}>
      <group ref={spin}>
        <lineSegments geometry={lineGeo}>
          <lineBasicMaterial color="#c8c8d0" transparent opacity={0.16} depthWrite={false} />
        </lineSegments>
        <lineSegments geometry={hiGeo} ref={hiLines}>
          <lineBasicMaterial color={[2, 2, 2.1]} toneMapped={false} transparent opacity={0.85} depthWrite={false} />
        </lineSegments>
        <instancedMesh ref={nodes} args={[null, null, SKILLS.length]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshBasicMaterial color={[2.4, 2.4, 2.5]} toneMapped={false} />
        </instancedMesh>
        <points geometry={pulseData.geo} material={pulseMat} ref={pulses} frustumCulled={false} />
        <group ref={core}>
          <lineSegments>
            <edgesGeometry args={[new THREE.IcosahedronGeometry(1.25, 1)]} />
            <lineBasicMaterial color="#d8d8e0" transparent opacity={0.45} />
          </lineSegments>
        </group>
        <mesh ref={solid}>
          <icosahedronGeometry args={[0.85, 0]} />
          <meshPhysicalMaterial color="#1a1a1d" metalness={0.95} roughness={0.18} clearcoat={1} flatShading />
        </mesh>
      </group>
      <pointLight position={[2.5, 3, 4]} intensity={40} distance={16} color="#ffffff" />
      <pointLight position={[-3, -2, -2]} intensity={25} distance={14} color="#b8b8c8" />
    </group>
  );
}
