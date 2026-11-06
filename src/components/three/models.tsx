"use client";
/**
 * Procedural, stylized-realistic models (§6 — labelled as illustrations on the page).
 * Swap any of these for glTF + Draco/KTX2 assets from the 3D artist without touching
 * the scenes: each export keeps the same name and scale.
 */
import { RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { hibiscusLabel, kraftLabel, leafDecal } from "./textures";

type G = ThreeElements["group"];

/* ── Coffee bean ───────────────────────────────────────────────────────── */
export function makeBeanGeometry(detail = 36) {
  const g = new THREE.SphereGeometry(1, detail, Math.round(detail * 0.75));
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const taper = Math.sqrt(Math.max(0, 1 - v.y * v.y));
    v.x *= 0.7;
    v.z *= 0.52;
    if (v.z > 0) v.z *= 0.6; // flat face
    const cx = 0.08 * Math.sin(v.y * 2.6); // S-shaped crease
    const d = (v.x - cx) / 0.09;
    const front = THREE.MathUtils.smoothstep(v.z, 0.02, 0.12);
    v.z -= 0.17 * Math.exp(-d * d) * front * taper;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export const beanMaterial = () => new THREE.MeshStandardMaterial({ color: "#5a321b", roughness: 0.38, metalness: 0.04 });

/* ── HARC coffee bag ───────────────────────────────────────────────────── */
export function CoffeeBag({ origin = "Guatemala", roast = "Medium", ...props }: { origin?: string; roast?: string } & G) {
  const label = useMemo(() => hibiscusLabel(origin, roast), [origin, roast]);
  return (
    <group {...props}>
      <RoundedBox args={[1.5, 2.1, 0.62]} radius={0.08} smoothness={5} castShadow>
        <meshStandardMaterial color="#f8f6f1" roughness={0.82} />
      </RoundedBox>
      {/* side gussets */}
      {[-0.76, 0.76].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.02, 2.0, 0.5]} />
          <meshStandardMaterial color="#e9e5dc" roughness={0.9} />
        </mesh>
      ))}
      {/* crimped top seal */}
      <RoundedBox args={[1.54, 0.26, 0.14]} radius={0.04} position={[0, 1.15, 0]}>
        <meshStandardMaterial color="#efebe2" roughness={0.9} />
      </RoundedBox>
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[-0.7 + i * 0.108, 1.15, 0.072]}>
          <boxGeometry args={[0.02, 0.2, 0.005]} />
          <meshStandardMaterial color="#dcd6ca" />
        </mesh>
      ))}
      {/* degassing valve */}
      <mesh position={[0, 0.78, 0.315]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 24]} />
        <meshStandardMaterial color="#d9d4ca" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.12, 0.313]}>
        <planeGeometry args={[1.18, 1.35]} />
        <meshStandardMaterial map={label} roughness={0.65} />
      </mesh>
    </group>
  );
}

/* ── Croissant ─────────────────────────────────────────────────────────── */
export function Croissant(props: G) {
  const segs = useMemo(() => {
    const N = 9;
    return Array.from({ length: N }).map((_, i) => {
      const t = (i / (N - 1)) * 2 - 1; // -1..1
      const th = t * 1.25;
      const R = 1.25;
      const size = 0.16 + 0.5 * (1 - t * t) ** 1.2;
      return {
        pos: [R * Math.sin(th), R * Math.cos(th) - R * 0.55, 0] as [number, number, number],
        rot: -th,
        scale: [0.34 + size * 0.25, size, size * 0.82] as [number, number, number],
        color: i % 2 ? "#c9874a" : "#b06d33",
      };
    });
  }, []);
  return (
    <group {...props}>
      {segs.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={[0, 0, s.rot]} scale={s.scale} castShadow>
          <sphereGeometry args={[1, 40, 28]} />
          <meshStandardMaterial color={s.color} roughness={0.48} metalness={0.02} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Cha clear cup (shell only; liquids live in CupScene) ──────────────── */
export const CUP = { h: 2.3, rBottom: 0.62, rTop: 0.86, y0: -1.15 };
export const cupRadiusAt = (y: number) => CUP.rBottom + ((y - CUP.y0) / CUP.h) * (CUP.rTop - CUP.rBottom);

export function ClearCup({ straw = "#2f5d18", ...props }: { straw?: string } & G) {
  const shell = useMemo(() => {
    const pts = [new THREE.Vector2(0.0001, CUP.y0), new THREE.Vector2(CUP.rBottom, CUP.y0), new THREE.Vector2(CUP.rTop, CUP.y0 + CUP.h)];
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  const decal = useMemo(() => leafDecal(true), []);
  return (
    <group {...props}>
      <mesh geometry={shell} renderOrder={5}>
        <meshPhysicalMaterial color="#ffffff" roughness={0.05} metalness={0} transmission={0.92} thickness={0.12} ior={1.35} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* rim */}
      <mesh position={[0, CUP.y0 + CUP.h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[CUP.rTop, 0.025, 12, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} transparent opacity={0.8} />
      </mesh>
      {/* flat lid */}
      <mesh position={[0, CUP.y0 + CUP.h + 0.03, 0]}>
        <cylinderGeometry args={[CUP.rTop + 0.03, CUP.rTop + 0.03, 0.06, 64]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.1} transmission={0.85} transparent opacity={0.45} depthWrite={false} />
      </mesh>
      {/* straw */}
      <mesh position={[0.22, 0.75, 0.05]} rotation={[0, 0, -0.12]}>
        <cylinderGeometry args={[0.07, 0.07, 3.4, 20]} />
        <meshStandardMaterial color={straw} roughness={0.35} />
      </mesh>
      {/* leaf decal */}
      <mesh position={[0, 0.25, cupRadiusAt(0.25) + 0.012]} renderOrder={6}>
        <planeGeometry args={[0.75, 0.75]} />
        <meshBasicMaterial map={decal} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── Kraft cup carrier ─────────────────────────────────────────────────── */
export function Carrier(props: G) {
  const decal = useMemo(() => leafDecal(false), []);
  const kraft = "#b98a5a";
  return (
    <group {...props}>
      <RoundedBox args={[2.6, 0.32, 1.3]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial color={kraft} roughness={0.95} />
      </RoundedBox>
      {/* centre handle */}
      <RoundedBox args={[0.12, 1.1, 1.1]} radius={0.04} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#a77a4c" roughness={0.95} />
      </RoundedBox>
      {/* hot cup */}
      <group position={[-0.72, 0.85, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.46, 0.36, 1.35, 48]} />
          <meshStandardMaterial color="#fbfaf6" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.5, 0.48, 0.12, 48]} />
          <meshStandardMaterial color="#1b1b1b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.05, 0.43]} rotation={[-0.07, 0, 0]}>
          <planeGeometry args={[0.55, 0.55]} />
          <meshBasicMaterial map={decal} transparent />
        </mesh>
      </group>
      {/* iced latte */}
      <group position={[0.72, 0.85, 0]}>
        <mesh>
          <cylinderGeometry args={[0.48, 0.36, 1.35, 48, 1, true]} />
          <meshPhysicalMaterial color="#fff" transmission={0.9} roughness={0.05} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.4, 0.35, 0.8, 48]} />
          <meshStandardMaterial color="#c99a6c" roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.36, 0.34, 0.25, 48]} />
          <meshStandardMaterial color="#6b3d1f" roughness={0.3} />
        </mesh>
        <mesh position={[0.12, 0.6, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.05, 0.05, 1.5, 16]} />
          <meshStandardMaterial color="#2f5d18" />
        </mesh>
      </group>
    </group>
  );
}

/* ── Shop previews ─────────────────────────────────────────────────────── */
export function Tumbler(props: G) {
  const decal = useMemo(() => leafDecal(true, "#FAF8F3"), []);
  return (
    <group {...props}>
      <mesh castShadow>
        <cylinderGeometry args={[0.62, 0.5, 2.5, 64]} />
        <meshStandardMaterial color="#161616" roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.66, 0.64, 0.28, 64]} />
        <meshStandardMaterial color="#C9CCCE" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.1, 0.575]}>
        <planeGeometry args={[0.85, 0.85]} />
        <meshBasicMaterial map={decal} transparent />
      </mesh>
    </group>
  );
}

export function Mug(props: G) {
  const decal = useMemo(() => leafDecal(false), []);
  return (
    <group {...props}>
      <mesh castShadow>
        <cylinderGeometry args={[0.8, 0.75, 1.5, 64]} />
        <meshStandardMaterial color="#fbfaf6" roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.74, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.72, 48]} />
        <meshStandardMaterial color="#5a3519" roughness={0.2} />
      </mesh>
      <mesh position={[0.86, 0, 0]}>
        <torusGeometry args={[0.36, 0.09, 16, 40]} />
        <meshStandardMaterial color="#fbfaf6" roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.785]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshBasicMaterial map={decal} transparent />
      </mesh>
    </group>
  );
}

export function KraftBox({ title, sub, color = "#c7a072", ribbon, ...props }: { title: string; sub: string; color?: string; ribbon?: boolean } & G) {
  const label = useMemo(() => kraftLabel(title, sub), [title, sub]);
  return (
    <group {...props}>
      <RoundedBox args={[2, 1.4, 1.4]} radius={0.05} smoothness={4} castShadow>
        <meshStandardMaterial color={color} roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, 0, 0.705]}>
        <planeGeometry args={[1.4, 0.88]} />
        <meshStandardMaterial map={label} roughness={0.7} />
      </mesh>
      {ribbon && (
        <>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.14, 1.42, 1.42]} />
            <meshStandardMaterial color="#D2373C" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.18, 0.05, 12, 24]} />
            <meshStandardMaterial color="#D2373C" />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ── Premium cakes ─────────────────────────────────────────────────────── */
export type CakeKind =
  | "seasonal-fruit-cake"
  | "dark-chocolate-cake"
  | "strawberry-cream-cake"
  | "shine-muscat-cake"
  | "chocolate-drip-cake"
  | "basque-cheesecake"
  | "tiramisu"
  | "blueberry-cheesecake";

function Berry({ color, r = 0.12, ...p }: { color: string; r?: number } & G) {
  return (
    <group {...p}>
      <mesh castShadow>
        <sphereGeometry args={[r, 20, 16]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Strawberry(p: G) {
  return (
    <group {...p}>
      <mesh rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.13, 0.26, 18]} />
        <meshStandardMaterial color="#D2373C" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 0.03, 12]} />
        <meshStandardMaterial color="#4E7D24" />
      </mesh>
    </group>
  );
}

const ring = (n: number, r: number, y: number) =>
  Array.from({ length: n }).map((_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * r, y, Math.sin(a) * r] as [number, number, number];
  });

export function Cake({ kind, ...props }: { kind: CakeKind } & G) {
  const H = 0.85;
  const top = H / 2;
  const square = kind === "tiramisu";
  const body: Record<CakeKind, string> = {
    "seasonal-fruit-cake": "#fbf6ec",
    "dark-chocolate-cake": "#3a1f12",
    "strawberry-cream-cake": "#fff8f3",
    "shine-muscat-cake": "#fbf7ee",
    "chocolate-drip-cake": "#f3e2cf",
    "basque-cheesecake": "#e9c58e",
    tiramisu: "#e8d5b8",
    "blueberry-cheesecake": "#f7ecd6",
  };
  return (
    <group {...props}>
      {square ? (
        <>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, -top + 0.11 + i * 0.21, 0]} castShadow>
              <boxGeometry args={[1.7, 0.2, 1.7]} />
              <meshStandardMaterial color={i % 2 ? "#f2e6d0" : "#9a6a3e"} roughness={0.8} />
            </mesh>
          ))}
          <mesh position={[0, top + 0.02, 0]}>
            <boxGeometry args={[1.71, 0.04, 1.71]} />
            <meshStandardMaterial color="#5b3a22" roughness={1} />
          </mesh>
        </>
      ) : (
        <mesh castShadow>
          <cylinderGeometry args={[1, 1, kind === "basque-cheesecake" ? H * 0.85 : H, 72]} />
          <meshStandardMaterial color={body[kind]} roughness={kind === "dark-chocolate-cake" ? 0.25 : 0.7} />
        </mesh>
      )}

      {kind === "basque-cheesecake" && (
        <mesh position={[0, top * 0.85 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.0, 72]} />
          <meshStandardMaterial color="#3d2412" roughness={0.9} />
        </mesh>
      )}
      {kind === "dark-chocolate-cake" &&
        ring(10, 0.75, top + 0.05).map((p, i) => (
          <mesh key={i} position={p} rotation={[0.4, i, 0.3]}>
            <boxGeometry args={[0.22, 0.04, 0.1]} />
            <meshStandardMaterial color="#1e0f08" roughness={0.3} />
          </mesh>
        ))}
      {kind === "chocolate-drip-cake" && (
        <>
          <mesh position={[0, top, 0]}>
            <cylinderGeometry args={[1.02, 1.02, 0.08, 72]} />
            <meshStandardMaterial color="#3a1f12" roughness={0.15} />
          </mesh>
          {ring(22, 1.01, top - 0.15).map((p, i) => (
            <mesh key={i} position={p} scale={[1, 0.6 + ((i * 37) % 10) / 12, 1]}>
              <capsuleGeometry args={[0.045, 0.22, 6, 10]} />
              <meshStandardMaterial color="#3a1f12" roughness={0.15} />
            </mesh>
          ))}
          {ring(6, 0.55, top + 0.12).map((p, i) => (
            <Strawberry key={i} position={p} />
          ))}
        </>
      )}
      {kind === "strawberry-cream-cake" && ring(12, 0.78, top + 0.12).map((p, i) => <Strawberry key={i} position={p} />)}
      {kind === "shine-muscat-cake" && ring(14, 0.78, top + 0.12).map((p, i) => <Berry key={i} position={p} color="#b7d36b" r={0.13} />)}
      {kind === "blueberry-cheesecake" && (
        <>
          <mesh position={[0, top + 0.02, 0]}>
            <cylinderGeometry args={[0.96, 0.96, 0.06, 72]} />
            <meshStandardMaterial color="#3b3f8f" roughness={0.2} />
          </mesh>
          {ring(16, 0.7, top + 0.09).map((p, i) => (
            <Berry key={i} position={p} color="#2c2f6b" r={0.08} />
          ))}
        </>
      )}
      {kind === "seasonal-fruit-cake" && (
        <>
          {ring(8, 0.8, top + 0.12).map((p, i) => (
            <Strawberry key={`s${i}`} position={p} />
          ))}
          {ring(7, 0.45, top + 0.1).map((p, i) => (
            <Berry key={`g${i}`} position={p} color={i % 2 ? "#b7d36b" : "#6c2a5e"} r={0.11} />
          ))}
          {ring(5, 0.18, top + 0.08).map((p, i) => (
            <mesh key={`k${i}`} position={p} rotation={[-Math.PI / 2 + 0.3, 0, i]}>
              <cylinderGeometry args={[0.14, 0.14, 0.03, 20]} />
              <meshStandardMaterial color="#8bbf3a" />
            </mesh>
          ))}
        </>
      )}
      {kind === "tiramisu" &&
        ring(4, 0.45, top + 0.08).map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.08, 12, 10]} />
            <meshStandardMaterial color="#3a2414" />
          </mesh>
        ))}
    </group>
  );
}
