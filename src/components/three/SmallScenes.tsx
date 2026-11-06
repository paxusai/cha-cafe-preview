"use client";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Stage } from "./Stage";
import { Cake, type CakeKind, Carrier, CoffeeBag, KraftBox, Mug, Tumbler } from "./models";
import { LatteSwirl, Steam } from "./shaders";

const Spin = ({ speed = 0.4, children }: { speed?: number; children: React.ReactNode }) => {
  const g = useRef<THREE.Group>(null);
  useFrame((s, dt) => {
    if (g.current) g.current.rotation.y += dt * speed;
  });
  return <group ref={g}>{children}</group>;
};

/* 007 · A whole cake on a rotating white box. Switching cakes pops the new one in. */
function CakeOnBox({ kind }: { kind: CakeKind }) {
  const cake = useRef<THREE.Group>(null);
  const born = useRef(performance.now());
  useFrame(() => {
    const t = Math.min(1, (performance.now() - born.current) / 650);
    const s = 1 - Math.pow(1 - t, 3);
    cake.current?.scale.setScalar(0.6 + 0.4 * s);
    if (cake.current) cake.current.position.y = 0.55 + (1 - s) * 0.6;
  });
  return (
    <Spin speed={0.35}>
      <RoundedBox args={[2.5, 0.9, 2.5]} radius={0.06} smoothness={4} position={[0, -0.45, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.75} />
      </RoundedBox>
      <mesh position={[0, -0.45, 1.252]}>
        <boxGeometry args={[0.14, 0.92, 0.01]} />
        <meshStandardMaterial color="#D2373C" />
      </mesh>
      <group ref={cake} position={[0, 0.55, 0]}>
        <Cake kind={kind} />
      </group>
    </Spin>
  );
}

export function CakeScene({ kind }: { kind: CakeKind }) {
  return (
    <Stage className="absolute inset-0" label={`a ${kind.replace(/-/g, " ")} on a white Cha cake box`} camera={{ position: [0, 2.6, 6.2], fov: 34 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 4]} intensity={2} castShadow />
      <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#fff1dc" />
      <CakeOnBox key={kind} kind={kind} />
      <ContactShadows position={[0, -0.9, 0]} opacity={0.35} scale={8} blur={2.6} far={3} />
    </Stage>
  );
}

/* 008 · The kraft cup carrier slides in on scroll. */
function SlideCarrier({ progress }: { progress: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    const p = THREE.MathUtils.smoothstep(progress.current, 0.05, 0.55);
    if (!g.current) return;
    g.current.position.x = (1 - p) * 7;
    g.current.rotation.y = -0.5 + (1 - p) * 0.8 + Math.sin(s.clock.elapsedTime * 0.5) * 0.04;
    g.current.rotation.z = (1 - p) * -0.12;
  });
  return (
    <group ref={g}>
      <Carrier />
    </group>
  );
}

export function CarrierScene({ progress }: { progress: React.MutableRefObject<number> }) {
  return (
    <Stage className="absolute inset-0" label="a kraft cup carrier with a hot coffee and an iced latte" camera={{ position: [0, 1.6, 6], fov: 34 }}>
      <ambientLight intensity={0.45} />
      <spotLight position={[0, 6, 2]} angle={0.6} penumbra={0.7} intensity={80} color="#fff4e2" />
      <SlideCarrier progress={progress} />
      <ContactShadows position={[0, -0.17, 0]} opacity={0.6} scale={8} blur={2.2} far={2} color="#000" />
    </Stage>
  );
}

/* 009 · Shop hover previews */
export function ProductScene({ kind, label }: { kind: "bag" | "tumbler" | "mug" | "kit" | "box"; label: string }) {
  return (
    <Stage className="absolute inset-0" label={label} camera={{ position: [0, 0.4, 5.6], fov: 34 }} margin="0px">
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.8} />
      <Spin speed={0.8}>
        {kind === "bag" && <CoffeeBag origin={label.split(" ")[0]} roast={label.split(" ")[1] ?? "Roast"} scale={0.95} />}
        {kind === "tumbler" && <Tumbler scale={0.85} />}
        {kind === "mug" && <Mug scale={1.1} />}
        {kind === "kit" && <KraftBox title="Milk Tea" sub="Kit · since 2012" />}
        {kind === "box" && <KraftBox title="Bakery" sub="Sampler" color="#ffffff" ribbon />}
      </Spin>
      <ContactShadows position={[0, -1.3, 0]} opacity={0.3} scale={6} blur={2.4} far={2} />
    </Stage>
  );
}

/* Steam over the La Marzocco photo and in the final CTA */
export function SteamScene({ color = "#ffffff", strength = 0.9, columns = 3 }: { color?: string; strength?: number; columns?: number }) {
  return (
    <Stage className="pointer-events-none absolute inset-0" label="rising steam" camera={{ position: [0, 0, 1], fov: 90, near: 0.01 }} margin="100px">
      <Steam color={color} strength={strength} columns={columns} scale={[2.1, 2.1, 1]} />
    </Stage>
  );
}

/* Latte swirl — stir it with the pointer */
export function LatteScene() {
  return (
    <Stage className="absolute inset-0" label="latte art swirling in a cup seen from above" camera={{ position: [0, 0, 3.2], fov: 40 }}>
      <LatteSwirl />
    </Stage>
  );
}
