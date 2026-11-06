import type { IllustrationKey } from "@/lib/types";
import { LEAF_PATHS } from "./LeafMark";

/**
 * Labelled line illustrations (§4.6: "a real photo where one exists, otherwise a
 * labelled illustration"). Also used as stills when 3D is off (mobile / reduced motion).
 */
const S = { stroke: "var(--ink)", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Leaf({ x, y, s = 0.28 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={LEAF_PATHS.light} fill="var(--sprout)" />
      <path d={LEAF_PATHS.dark} fill="var(--leaf)" />
    </g>
  );
}

function Steam({ x = 60, y = 22 }: { x?: number; y?: number }) {
  return (
    <g fill="none" {...S} strokeWidth={2} opacity={0.55}>
      <path d={`M${x - 10} ${y + 12}c-4-5 4-8 0-13`} />
      <path d={`M${x} ${y + 10}c-4-5 4-8 0-13`} />
      <path d={`M${x + 10} ${y + 12}c-4-5 4-8 0-13`} />
    </g>
  );
}

function ClearCup({ fill, top, children, lid = "flat" }: { fill: string; top?: string; children?: React.ReactNode; lid?: "flat" | "dome" }) {
  return (
    <g>
      <path d="M38 34h44l-5 66a5 5 0 0 1-5 4.5H48a5 5 0 0 1-5-4.5L38 34Z" fill={fill} />
      {top && <path d="M38.8 34h42.4l-1.4 16H40.2L38.8 34Z" fill={top} />}
      {children}
      <path d="M38 34h44l-5 66a5 5 0 0 1-5 4.5H48a5 5 0 0 1-5-4.5L38 34Z" fill="none" {...S} />
      {lid === "dome" ? (
        <path d="M34 34h52M38 34c2-14 42-14 44 0" fill="var(--white)" {...S} />
      ) : (
        <path d="M34 30h52v4H34z" fill="var(--white)" {...S} />
      )}
      <path d="M66 30 74 8" {...S} strokeWidth={5} stroke="var(--ink)" />
      <Leaf x={52} y={66} />
    </g>
  );
}

const ART: Record<IllustrationKey, React.ReactNode> = {
  espresso: (
    <g>
      <Steam x={56} y={20} />
      <ellipse cx="58" cy="94" rx="40" ry="8" fill="var(--white)" {...S} />
      <path d="M28 46h60l-6 36a12 12 0 0 1-12 10H46a12 12 0 0 1-12-10l-6-36Z" fill="var(--white)" {...S} />
      <path d="M88 54h4a10 10 0 0 1 0 20h-7" fill="none" {...S} />
      <ellipse cx="58" cy="46" rx="30" ry="6" fill="var(--crema)" {...S} />
      <path d="M58 49c-6-4-8-6-6-8s4 0 6 2c2-2 4-4 6-2s0 4-6 8Z" fill="var(--white)" />
      <Leaf x={50} y={60} />
    </g>
  ),
  iced: (
    <ClearCup fill="#e9dcc8" top="#c99a6c">
      <rect x="47" y="56" width="11" height="11" rx="2" fill="#fff" opacity={0.8} transform="rotate(-12 52 61)" />
      <rect x="61" y="70" width="11" height="11" rx="2" fill="#fff" opacity={0.8} transform="rotate(10 66 75)" />
      <path d="M42.4 80h35.2l-1.6 20a5 5 0 0 1-5 4.5H49a5 5 0 0 1-5-4.5Z" fill="var(--crema)" opacity={0.9} />
    </ClearCup>
  ),
  milktea: (
    <ClearCup fill="#d9bf9c">
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={i} cx={47 + (i % 5) * 6.5 + (i > 4 ? 3 : 0)} cy={i > 4 ? 90 : 97} r={3.4} fill="var(--ink)" />
      ))}
    </ClearCup>
  ),
  blended: (
    <ClearCup fill="#f2c45a" lid="dome">
      <path d="M40 34c6-8 34-8 40 0" fill="#fff" />
      <circle cx="50" cy="92" r="3" fill="#f59e0b" />
      <circle cx="60" cy="96" r="3" fill="#f59e0b" />
      <circle cx="68" cy="91" r="3" fill="#f59e0b" />
    </ClearCup>
  ),
  lemonade: (
    <ClearCup fill="#f6e27a">
      <circle cx="70" cy="48" r="9" fill="#fff3a6" {...S} strokeWidth={2} />
      <path d="M70 39v18M61 48h18M64 42l12 12M76 42 64 54" stroke="#e8c220" strokeWidth={1.4} />
    </ClearCup>
  ),
  croissant: (
    <g fill="var(--crema)" {...S}>
      <path d="M14 78c4-18 14-28 22-30l6 30c-10 4-20 6-28 0Z" />
      <path d="M106 78c-4-18-14-28-22-30l-6 30c10 4 20 6 28 0Z" />
      <path d="M34 50c6-10 14-14 20-14l2 44c-8 2-14 2-18 0Z" fill="#c78e58" />
      <path d="M86 50c-6-10-14-14-20-14l-2 44c8 2 14 2 18 0Z" fill="#c78e58" />
      <path d="M52 34c4-4 12-4 16 0l2 48c-6 2-14 2-20 0Z" fill="#d49a63" />
    </g>
  ),
  bread: (
    <g>
      <path d="M16 82c0-24 20-40 44-40s44 16 44 40v8a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6v-8Z" fill="#c9a6d6" {...S} />
      <path d="M34 60c6-6 12-8 18-8M52 54c6-4 14-4 20 0M70 56c6 0 12 4 16 10" fill="none" {...S} stroke="#7d5a91" />
      <path d="M16 84h88" {...S} />
    </g>
  ),
  pastry: (
    <g>
      <circle cx="60" cy="64" r="38" fill="var(--crema)" {...S} />
      <path d="M60 64m-24 0a24 24 0 1 0 48 0a24 24 0 1 0-48 0" fill="#e2b07c" />
      <path d="M60 64c0-4 4-6 7-4 5 3 3 12-5 13-10 1-15-9-11-17 5-9 18-10 25-2" fill="none" {...S} stroke="#7a4b25" />
      <circle cx="44" cy="46" r="4" fill="#3b4a9c" />
      <circle cx="78" cy="80" r="4" fill="#3b4a9c" />
    </g>
  ),
  cookie: (
    <g>
      <path d="M60 22c22 0 40 18 40 40s-18 40-40 40-40-18-40-40 18-40 40-40Z" fill="#d9a46a" {...S} />
      {[
        [44, 46],
        [70, 40],
        [56, 64],
        [80, 66],
        [42, 78],
        [64, 86],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y}l5-2 3 4-4 4-5-2Z`} fill="#3a2414" />
      ))}
    </g>
  ),
  bagel: (
    <g>
      <circle cx="60" cy="62" r="40" fill="#c98b4f" {...S} />
      <circle cx="60" cy="62" r="12" fill="var(--white)" {...S} />
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 27 + (i % 2) * 5;
        return <ellipse key={i} cx={60 + Math.cos(a) * r} cy={62 + Math.sin(a) * r} rx={2.2} ry={1.2} fill="#fff4dc" transform={`rotate(${(a * 180) / Math.PI} ${60 + Math.cos(a) * r} ${62 + Math.sin(a) * r})`} />;
      })}
    </g>
  ),
  macaron: (
    <g {...S}>
      <path d="M22 54c0-14 17-22 38-22s38 8 38 22H22Z" fill="#f2b6c4" />
      <rect x="24" y="54" width="72" height="12" rx="6" fill="#fff2f4" />
      <path d="M22 66h76c0 14-17 22-38 22S22 80 22 66Z" fill="#f2b6c4" />
    </g>
  ),
  cake: (
    <g>
      <ellipse cx="60" cy="98" rx="46" ry="7" fill="var(--steel)" opacity={0.7} />
      <path d="M20 50v38c0 6 18 10 40 10s40-4 40-10V50" fill="var(--white)" {...S} />
      <ellipse cx="60" cy="50" rx="40" ry="10" fill="#fff" {...S} />
      <path d="M20 70c0 6 18 10 40 10s40-4 40-10" fill="none" {...S} stroke="#e7b8b4" />
      {[30, 46, 60, 74, 90].map((x, i) => (
        <path key={i} d={`M${x} ${44 + (i % 2) * 6}c-5-1-6 7 0 9 6-2 5-10 0-9Z`} fill="var(--hibiscus)" />
      ))}
    </g>
  ),
  sandwich: (
    <g {...S}>
      <path d="M18 56c0-14 18-24 42-24s42 10 42 24H18Z" fill="#d9a46a" />
      <path d="M16 62c10 6 18-4 28 2s16-4 28 2 20-4 32 0" fill="none" stroke="var(--leaf)" strokeWidth={6} />
      <rect x="18" y="64" width="84" height="10" rx="4" fill="#f7c948" />
      <path d="M18 78h84v6a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8v-6Z" fill="#d9a46a" />
    </g>
  ),
  burrito: (
    <g {...S}>
      <path d="M22 84 70 28c10-6 26 8 22 20L38 100c-10 6-22-6-16-16Z" fill="#ead2a4" />
      <path d="M70 28c10-6 26 8 22 20-8 4-20-6-22-20Z" fill="#f7c948" />
      <path d="M44 68l20-22M52 78l20-22" fill="none" stroke="#c9a56d" />
    </g>
  ),
  soup: (
    <g>
      <Steam x={60} y={16} />
      <path d="M16 52h88c0 26-18 44-44 44S16 78 16 52Z" fill="var(--white)" {...S} />
      <ellipse cx="60" cy="52" rx="44" ry="9" fill="#d0533a" {...S} />
      <path d="M48 50c4-2 8 2 12 0" stroke="#fff" strokeWidth={2} fill="none" />
    </g>
  ),
  bag: (
    <g>
      <path d="M32 26h56l6 72a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6l6-72Z" fill="#fff" {...S} />
      <path d="M32 26l8-10h40l8 10" fill="#f4f2ec" {...S} />
      <rect x="38" y="48" width="44" height="40" rx="4" fill="#fff" stroke="var(--hibiscus)" strokeWidth={2} />
      <circle cx="60" cy="64" r="9" fill="var(--hibiscus)" />
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="60" cy="56" rx="5" ry="8" fill="var(--hibiscus)" transform={`rotate(${r} 60 64)`} />
      ))}
      <circle cx="60" cy="64" r="2.5" fill="#f7c948" />
      <path d="M44 80h32" stroke="var(--ink)" strokeWidth={2} />
    </g>
  ),
  tumbler: (
    <g>
      <path d="M40 22h40l-4 80a6 6 0 0 1-6 6H50a6 6 0 0 1-6-6l-4-80Z" fill="var(--ink)" {...S} />
      <rect x="37" y="14" width="46" height="10" rx="3" fill="var(--steel)" {...S} />
      <Leaf x={51} y={56} s={0.3} />
    </g>
  ),
  mug: (
    <g>
      <path d="M26 34h56v50a14 14 0 0 1-14 14H40a14 14 0 0 1-14-14V34Z" fill="var(--white)" {...S} />
      <path d="M82 46h6a12 12 0 0 1 0 24h-6" fill="none" {...S} />
      <Leaf x={45} y={52} s={0.3} />
    </g>
  ),
  kit: (
    <g {...S}>
      <path d="M20 44 60 28l40 16v46L60 106 20 90V44Z" fill="#d6b48a" />
      <path d="M20 44l40 16 40-16M60 60v46" fill="none" />
      <circle cx="40" cy="72" r="3" fill="var(--ink)" stroke="none" />
      <circle cx="46" cy="80" r="3" fill="var(--ink)" stroke="none" />
      <circle cx="36" cy="82" r="3" fill="var(--ink)" stroke="none" />
    </g>
  ),
  box: (
    <g {...S}>
      <path d="M18 46h84v52a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V46Z" fill="#fff" />
      <path d="M14 36h92v12H14z" fill="#f4f2ec" />
      <path d="M60 36v66" stroke="var(--hibiscus)" strokeWidth={4} />
      <path d="M60 36c-10-12-22-8-16 0M60 36c10-12 22-8 16 0" fill="none" stroke="var(--hibiscus)" strokeWidth={3} />
    </g>
  ),
};

export function Illus({ k, className = "", label }: { k: IllustrationKey; className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={label ? `Illustration: ${label}` : "Illustration"}>
      {ART[k]}
    </svg>
  );
}
