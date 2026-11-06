"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Stage } from "./Stage";
import { beanMaterial, CoffeeBag, makeBeanGeometry } from "./models";

const N = 90;

/**
 * 003 · Roasted fresh. A white HARC bag with the hibiscus label rotates with scroll,
 * tips, and pours beans as particles — lit by a single top spotlight (§6 dark panels).
 */
function Pour({ progress, origin, roast }: { progress: React.MutableRefObject<number>; origin: string; roast: string }) {
  const bag = useRef<THREE.Group>(null);
  const beans = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => makeBeanGeometry(20), []);
  const mat = useMemo(beanMaterial, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () => Array.from({ length: N }).map(() => ({ off: Math.random(), dx: (Math.random() - 0.5) * 0.5, dz: (Math.random() - 0.5) * 0.4, spin: Math.random() * 6, s: 0.07 + Math.random() * 0.04 })),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.current;
    const tip = THREE.MathUtils.smoothstep(p, 0.56, 0.78);
    if (bag.current) {
      bag.current.rotation.y = -0.6 + p * Math.PI * 1.4 * (1 - tip) + Math.sin(t * 0.5) * 0.05;
      bag.current.rotation.z = tip * 1.9;
      bag.current.position.set(-0.2 + tip * 0.9, 0.35 + tip * 0.9, 0);
    }
    const m = beans.current;
    if (!m) return;
    const pouring = tip > 0.6;
    // mouth of the bag in world space (top centre of the tipped bag)
    const mouthX = -0.2 + tip * 0.9 - Math.sin(tip * 1.9) * 1.15;
    const mouthY = 0.35 + tip * 0.9 + Math.cos(tip * 1.9) * 1.15;
    seeds.forEach((s, i) => {
      const life = (t * 0.55 + s.off) % 1;
      if (!pouring) {
        dummy.scale.setScalar(0.0001);
      } else {
        const y = mouthY - life * life * 5.2;
        dummy.position.set(mouthX + s.dx * life * 1.4 - life * 0.3, y, s.dz * life);
        dummy.rotation.set(s.spin * life * 4, s.spin * life * 3, 0);
        dummy.scale.setScalar(s.s * Math.min(1, life * 8));
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <group ref={bag}>
        <CoffeeBag origin={origin} roast={roast} />
      </group>
      <instancedMesh ref={beans} args={[geo, mat, N]} frustumCulled={false} />
      {/* bean pile */}
      <mesh position={[-0.35, -2.25, 0]} scale={[1.3, 0.28, 0.8]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4a2a17" roughness={0.6} />
      </mesh>
    </>
  );
}

export default function RoastScene({ progress, origin = "Guatemala", roast = "Medium" }: { progress: React.MutableRefObject<number>; origin?: string; roast?: string }) {
  return (
    <Stage className="absolute inset-0" label={`a white HARC coffee bag with a hibiscus label, ${origin} ${roast}, pouring beans`} camera={{ position: [0, 0, 7.5], fov: 34 }}>
      <ambientLight intensity={0.35} />
      <spotLight position={[0, 7, 2]} angle={0.5} penumbra={0.6} intensity={90} color="#fff4e2" />
      <directionalLight position={[3, 1, 4]} intensity={0.5} />
      <Pour progress={progress} origin={origin} roast={roast} />
    </Stage>
  );
}
