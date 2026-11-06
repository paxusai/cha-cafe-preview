"use client";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Stage } from "./Stage";
import { ClearCup, CUP, cupRadiusAt } from "./models";
import { Dust } from "./shaders";

export type DrinkId = "sea-salt-americano" | "milk-tea" | "honeydew-milk-tea" | "taro-milk-tea" | "matcha-frappe" | "mango-snow" | "lemonade-charger";
type Pearls = "fresh" | "popping" | "both" | null;

interface Drink {
  base: string;
  baseH: number;
  float?: { color: string; h: number };
  pearls: Pearls;
  ice?: boolean;
  foam?: boolean;
  lemon?: boolean;
  fx?: "salt" | "fizz";
  popColor?: string;
}

/** Liquid recipes for the 005 showcase (stylized; labelled as an illustration). */
export const DRINKS: Record<DrinkId, Drink> = {
  "sea-salt-americano": { base: "#2a160b", baseH: 1.35, float: { color: "#efe5d3", h: 0.42 }, pearls: null, ice: true, fx: "salt" },
  "milk-tea": { base: "#c49a6c", baseH: 1.82, pearls: "fresh", ice: true },
  "honeydew-milk-tea": { base: "#cfe3a6", baseH: 1.82, pearls: "fresh", ice: true },
  "taro-milk-tea": { base: "#c3a6d8", baseH: 1.82, pearls: "fresh", ice: true },
  "matcha-frappe": { base: "#8fb860", baseH: 1.72, pearls: null, foam: true },
  "mango-snow": { base: "#f6b13b", baseH: 1.78, pearls: "both", popColor: "#ffd34d", foam: false },
  "lemonade-charger": { base: "#f3dc63", baseH: 1.8, pearls: null, ice: true, lemon: true, fx: "fizz" },
};

const FLOOR = CUP.y0 + 0.05;
const PEARLS = 34;
const WALL = 0.035;

function layerGeo(y0: number, h: number) {
  const hh = Math.max(0.0001, h);
  const g = new THREE.CylinderGeometry(cupRadiusAt(y0 + hh) - WALL, cupRadiusAt(y0) - WALL, hh, 56, 1);
  g.translate(0, y0 + hh / 2, 0);
  return g;
}

function Liquid({ drink, pearlMode }: { drink: Drink; pearlMode: Pearls }) {
  const baseMesh = useRef<THREE.Mesh>(null);
  const floatMesh = useRef<THREE.Mesh>(null);
  const stream = useRef<THREE.Mesh>(null);
  const foam = useRef<THREE.Mesh>(null);
  const pearls = useRef<THREE.InstancedMesh>(null);
  const ice = useRef<THREE.Group>(null);
  const lemon = useRef<THREE.Mesh>(null);
  const fizz = useRef<THREE.InstancedMesh>(null);
  const state = useRef({ baseH: 0.05, floatH: 0, drained: false, start: 0, last: { b: -1, f: -1 } });
  const baseColor = useMemo(() => new THREE.Color(drink.base), []); // eslint-disable-line react-hooks/exhaustive-deps
  const floatColor = useMemo(() => new THREE.Color("#efe5d3"), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const initBase = useMemo(() => layerGeo(FLOOR, 0.05), []);
  const initFloat = useMemo(() => layerGeo(FLOOR, 0.01), []);
  const pearlSeeds = useMemo(
    () =>
      Array.from({ length: PEARLS }).map((_, i) => {
        const ringI = i < 12 ? 0 : i < 24 ? 1 : 2;
        const a = i * 2.39996;
        const r = ringI === 0 ? 0.42 * Math.sqrt((i + 0.5) / 12) : 0.15 + Math.random() * 0.35;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, restY: FLOOR + 0.09 + ringI * 0.15 + Math.random() * 0.03, delay: i * 0.025 + Math.random() * 0.12, startY: 1.6 + Math.random() * 0.8, popping: i % 2 === 0 };
      }),
    [],
  );

  // Drink switch: drain a little, then refill; pearls drop again.
  useEffect(() => {
    state.current.drained = false;
    state.current.start = performance.now() / 1000;
  }, [drink, pearlMode]);

  useFrame((_, dt) => {
    const s = state.current;
    const now = performance.now() / 1000;
    const since = now - s.start;
    const k = 1 - Math.pow(0.0015, dt);

    // drain-to-0.35, then fill
    const targetBase = since < 0.35 ? Math.min(s.baseH, 0.35) : drink.baseH;
    s.baseH += (targetBase - s.baseH) * k * (since < 0.35 ? 1.6 : 1);
    if (baseMesh.current) (baseMesh.current.material as THREE.MeshStandardMaterial).color.lerp(tmp.set(drink.base), k * 0.8);

    const floatTarget = drink.float && since > 1.1 ? drink.float.h : 0;
    s.floatH += (floatTarget - s.floatH) * k * 0.9;
    if (drink.float && floatMesh.current) (floatMesh.current.material as THREE.MeshStandardMaterial).color.lerp(tmp.set(drink.float.color), k);

    if (baseMesh.current && Math.abs(s.baseH - s.last.b) > 0.002) {
      baseMesh.current.geometry.dispose();
      baseMesh.current.geometry = layerGeo(FLOOR, s.baseH);
      s.last.b = s.baseH;
    }
    if (floatMesh.current) {
      floatMesh.current.visible = s.floatH > 0.01;
      if (Math.abs(s.floatH - s.last.f) > 0.002) {
        floatMesh.current.geometry.dispose();
        floatMesh.current.geometry = layerGeo(FLOOR + s.baseH, s.floatH);
        s.last.f = s.floatH;
      }
    }
    const top = FLOOR + s.baseH + s.floatH;
    if (stream.current) {
      const pouring = !!drink.float && since > 0.9 && since < 2.4;
      stream.current.visible = pouring;
      stream.current.scale.y = Math.max(0.01, 2.4 - top);
      stream.current.position.y = top + (2.4 - top) / 2;
    }
    if (foam.current) {
      const f = drink.foam ? THREE.MathUtils.smoothstep(since, 0.9, 1.6) : 0;
      foam.current.visible = f > 0.01;
      foam.current.scale.set(cupRadiusAt(top) - WALL, 0.35 * f + 0.001, cupRadiusAt(top) - WALL);
      foam.current.position.y = top - 0.01;
    }
    if (ice.current) {
      ice.current.visible = !!drink.ice;
      ice.current.position.y = top - 0.22 + Math.sin(now * 1.4) * 0.02;
    }
    if (lemon.current) {
      lemon.current.visible = !!drink.lemon;
      lemon.current.position.y = top - 0.05;
    }

    const pm = pearls.current;
    if (pm) {
      pearlSeeds.forEach((p, i) => {
        const mode = pearlMode;
        const local = THREE.MathUtils.clamp((since - 0.4 - p.delay) / 0.9, 0, 1);
        // fall with a little bounce on landing
        const fallT = Math.min(1, local * 1.25);
        const bounce = local > 0.8 ? Math.sin(((local - 0.8) / 0.2) * Math.PI) * 0.05 : 0;
        const y = THREE.MathUtils.lerp(p.startY, p.restY, fallT * fallT) + bounce;
        dummy.position.set(p.x, y, p.z);
        dummy.scale.setScalar(mode ? 0.085 : 0.0001);
        dummy.updateMatrix();
        pm.setMatrixAt(i, dummy.matrix);
        const popping = mode === "popping" || (mode === "both" && p.popping);
        pm.setColorAt(i, new THREE.Color(popping ? drink.popColor ?? "#f4a73b" : "#24150c"));
      });
      pm.instanceMatrix.needsUpdate = true;
      if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
    }

    const fm = fizz.current;
    if (fm) {
      for (let i = 0; i < 30; i++) {
        const life = (now * 0.35 + i * 0.137) % 1;
        const a = i * 2.1;
        const r = 0.15 + ((i * 53) % 10) / 22;
        dummy.position.set(Math.cos(a) * r, FLOOR + life * (top - FLOOR), Math.sin(a) * r);
        dummy.scale.setScalar(drink.fx === "fizz" ? 0.025 + (i % 3) * 0.008 : 0.0001);
        dummy.updateMatrix();
        fm.setMatrixAt(i, dummy.matrix);
      }
      fm.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh ref={baseMesh} geometry={initBase} renderOrder={1}>
        <meshStandardMaterial color={baseColor} roughness={0.15} transparent opacity={0.94} />
      </mesh>
      <mesh ref={floatMesh} geometry={initFloat} renderOrder={2}>
        <meshStandardMaterial color={floatColor} roughness={0.5} />
      </mesh>
      <mesh ref={stream} visible={false}>
        <cylinderGeometry args={[0.05, 0.05, 1, 12]} />
        <meshStandardMaterial color="#f2eadc" roughness={0.4} />
      </mesh>
      <mesh ref={foam} visible={false}>
        <sphereGeometry args={[1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fffaf1" roughness={0.9} />
      </mesh>
      <instancedMesh ref={pearls} args={[undefined, undefined, PEARLS]} frustumCulled={false}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshPhysicalMaterial roughness={0.12} clearcoat={1} transmission={0.25} />
      </instancedMesh>
      <group ref={ice}>
        {[
          [-0.3, 0, 0.12, 0.3],
          [0.25, 0.05, -0.18, -0.4],
          [0.05, -0.08, 0.3, 0.8],
        ].map(([x, y, z, r], i) => (
          <RoundedBox key={i} args={[0.34, 0.34, 0.34]} radius={0.06} position={[x, y, z]} rotation={[r, r * 1.3, 0]}>
            <meshPhysicalMaterial color="#ffffff" transmission={1} roughness={0.08} thickness={0.3} transparent opacity={0.7} />
          </RoundedBox>
        ))}
      </group>
      <mesh ref={lemon} position={[0.42, 0.7, 0.3]} rotation={[0.4, 0, 1.2]} visible={false}>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 32]} />
        <meshStandardMaterial color="#ffe55c" roughness={0.4} />
      </mesh>
      <instancedMesh ref={fizz} args={[undefined, undefined, 30]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
      </instancedMesh>
      {drink.fx === "salt" && <Dust count={60} spread={[1.2, 0.8, 1.2]} color="#ffffff" size={0.03} fall={0.02} opacity={0.9} position={[0, 1.55, 0]} />}
    </group>
  );
}

function Turntable({ drink, pearls }: { drink: DrinkId; pearls: "fresh" | "popping" | "none" }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (g.current) g.current.rotation.y = s.clock.elapsedTime * 0.35;
  });
  const d = DRINKS[drink];
  const mode: Pearls = d.pearls === "fresh" ? (pearls === "none" ? null : pearls) : d.pearls === "both" && pearls === "none" ? null : d.pearls;
  return (
    <group position={[0, -0.15, 0]}>
      <group ref={g}>
        <Liquid drink={d} pearlMode={mode} />
        <ClearCup />
      </group>
      <mesh position={[0, CUP.y0 - 0.09, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.55, 0.16, 72]} />
        <meshStandardMaterial color="#FAF8F3" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function CupScene({ drink, pearls }: { drink: DrinkId; pearls: "fresh" | "popping" | "none" }) {
  return (
    <Stage className="absolute inset-0" label="a clear Cha cup on a turntable, its drink layers changing" camera={{ position: [0, 0.9, 6.8], fov: 34 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <directionalLight position={[-4, 2, -2]} intensity={0.6} color="#dff0c8" />
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={2.5} position={[0, 4, 3]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-4, 1, 2]} rotation-y={Math.PI / 3} scale={[3, 5, 1]} color="#fff2df" />
        <Lightformer form="ring" intensity={1} position={[3, 2, -3]} scale={2} color="#A9CB7F" />
      </Environment>
      <Turntable drink={drink} pearls={pearls} />
    </Stage>
  );
}
