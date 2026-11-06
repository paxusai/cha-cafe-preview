"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Stage } from "./Stage";
import { Croissant } from "./models";
import { Dust } from "./shaders";

/**
 * 004 · Baked every morning. A dark 5 AM kitchen; the pendant lamp switches on with
 * scroll, flour dust drifts, a croissant turns while powdered sugar falls.
 */
function Kitchen({ progress }: { progress: React.MutableRefObject<number> }) {
  const lamp = useRef<THREE.SpotLight>(null);
  const bulb = useRef<THREE.MeshStandardMaterial>(null);
  const fill = useRef<THREE.AmbientLight>(null);
  const croissant = useRef<THREE.Group>(null);
  const lightOn = useRef(0);
  const target = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.current;
    // flicker-on between 10% and 30% of the pinned scroll
    const raw = THREE.MathUtils.smoothstep(p, 0.08, 0.3);
    const flicker = raw > 0 && raw < 1 ? (Math.sin(t * 60) > 0.2 ? 1 : 0.35) : 1;
    lightOn.current = raw * flicker;
    if (lamp.current) lamp.current.intensity = 120 * lightOn.current;
    if (bulb.current) bulb.current.emissiveIntensity = 0.2 + 3.5 * lightOn.current;
    if (fill.current) fill.current.intensity = 0.06 + 0.5 * lightOn.current;
    if (croissant.current) {
      croissant.current.rotation.y = t * 0.35 + p * Math.PI * 1.5;
      croissant.current.position.y = -0.75 + Math.sin(t * 0.9) * 0.05;
    }
  });

  return (
    <>
      <ambientLight ref={fill} intensity={0.06} />
      <primitive object={target} position={[1.7, -0.9, 0]} />
      <spotLight ref={lamp} target={target} position={[1.7, 2.3, 0.6]} angle={0.75} penumbra={0.7} intensity={0} color="#ffe6bf" distance={12} decay={1.4} />
      {/* pendant lamp, as in Cha's kitchen photos */}
      <group position={[1.7, 2.85, 0.6]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 3, 6]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh>
          <coneGeometry args={[0.55, 0.5, 48, 1, true]} />
          <meshStandardMaterial color="#141414" roughness={0.35} metalness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <sphereGeometry args={[0.13, 24, 16]} />
          <meshStandardMaterial ref={bulb} color="#fff1d6" emissive="#ffd9a0" emissiveIntensity={0.2} />
        </mesh>
      </group>
      <group position={[1.7, 0, 0]}>
        <group ref={croissant} scale={0.82}>
          <Croissant rotation={[-Math.PI / 2 + 0.5, 0, 0]} />
        </group>
      </group>
      {/* steel bench */}
      <mesh position={[0, -1.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#dfe2e3" roughness={0.45} metalness={0.15} />
      </mesh>
      {/* flour dust in the lamp beam + powdered sugar falling on the croissant */}
      <Dust count={420} spread={[5, 4.5, 3]} color="#fff6e6" size={0.03} fall={0.04} opacity={0.9} opacityRef={lightOn} />
      <Dust count={160} spread={[1.8, 3.2, 1.2]} color="#ffffff" size={0.05} fall={0.35} opacity={1} opacityRef={lightOn} position={[1.7, 0.6, 0.2]} />
    </>
  );
}

export default function BakeryScene({ progress }: { progress: React.MutableRefObject<number> }) {
  return (
    <Stage className="absolute inset-0" label="a croissant turning under a pendant lamp as powdered sugar falls" camera={{ position: [0, 0.4, 6.4], fov: 36 }}>
      <Kitchen progress={progress} />
    </Stage>
  );
}
