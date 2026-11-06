"use client";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Stage } from "./Stage";
import { beanMaterial, makeBeanGeometry } from "./models";
import { Beam, Dust } from "./shaders";

const COUNT = 140;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * 001 · Before Sunrise. A single bean spins in a light beam, splits into a swirl of
 * beans, and the beans fall as the page warms to bakery white. `progress` (0–1) is
 * scrubbed by the hero's ScrollTrigger.
 */
function Beans({ progress }: { progress: React.MutableRefObject<number> }) {
  const geo = useMemo(() => makeBeanGeometry(), []);
  const mat = useMemo(beanMaterial, []);
  const hero = useRef<THREE.Mesh>(null);
  const swarm = useRef<THREE.InstancedMesh>(null);
  const beamOpacity = useRef(1);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }).map((_, i) => {
        const a = (i / COUNT) * Math.PI * 2 * 3.2;
        return {
          angle: a,
          radius: 1.2 + (i % 7) * 0.35 + Math.random() * 0.6,
          height: (Math.random() - 0.5) * 3.2,
          spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
          speed: 0.6 + Math.random() * 1.4,
          scale: 0.16 + Math.random() * 0.14,
          fall: 0.7 + Math.random() * 0.9,
          delay: Math.random() * 0.25,
        };
      }),
    [],
  );

  useEffect(() => {
    // subtle per-bean roast variation
    const m = swarm.current;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < COUNT; i++) m.setColorAt(i, c.setHSL(0.07, 0.35, 0.7 + Math.random() * 0.3));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.current;
    const split = ease(clamp01(p / 0.32)); // 0 → 1 as the bean bursts into a swirl
    const fall = clamp01((p - 0.38) / 0.55); // then everything falls

    if (hero.current) {
      const h = hero.current;
      h.rotation.set(Math.sin(t * 0.6) * 0.35 + 0.5, t * 0.9, Math.sin(t * 0.4) * 0.2);
      const s = 0.85 * (1 - split * 0.75);
      h.scale.setScalar(Math.max(0.001, s));
      h.position.y = Math.sin(t * 1.2) * 0.08 - ease(fall) * 7;
    }

    beamOpacity.current = 1 - clamp01(p / 0.5);

    const m = swarm.current;
    if (!m) return;
    seeds.forEach((s, i) => {
      const local = clamp01((split - s.delay) / (1 - s.delay));
      const a = s.angle + t * 0.25 * s.speed + local * 1.4;
      const r = s.radius * ease(local);
      const fy = fall > 0 ? Math.pow(clamp01(fall * s.fall * 1.25), 2) * 9 : 0;
      dummy.position.set(Math.cos(a) * r, s.height * local - fy, Math.sin(a) * r * 0.6 - 0.4);
      dummy.rotation.set(s.spin.x * t * s.speed, s.spin.y * t * s.speed, s.spin.z * t);
      dummy.scale.setScalar(s.scale * Math.max(0.001, local));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <Beam position={[0, 2.6, -1]} opacityRef={beamOpacity} />
      <mesh ref={hero} geometry={geo} material={mat} castShadow />
      <instancedMesh ref={swarm} args={[geo, mat, COUNT]} frustumCulled={false} />
      <Dust count={260} spread={[9, 6, 4]} color="#ffe4b8" size={0.035} fall={0.03} opacity={0.6} opacityRef={beamOpacity} />
    </>
  );
}

export default function HeroScene({ progress }: { progress: React.MutableRefObject<number> }) {
  return (
    <Stage className="absolute inset-0" label="a coffee bean spinning in a beam of light, bursting into a swirl of beans" camera={{ position: [0, 0, 7], fov: 35 }} margin="0px">
      <ambientLight intensity={0.25} />
      <spotLight position={[1.9, 6, 2]} angle={0.45} penumbra={0.8} intensity={90} color="#ffe2b0" />
      <directionalLight position={[-4, 2, 4]} intensity={0.6} color="#9fb8ff" />
      <pointLight position={[3, -2, 3]} intensity={6} color="#f2b26b" />
      <group position={[1.9, 0.35, 0]}>
        <Beans progress={progress} />
      </group>
    </Stage>
  );
}
