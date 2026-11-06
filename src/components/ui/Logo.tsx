"use client";
import { useState } from "react";
import { useApp } from "../AppProvider";
import { LeafMark } from "./LeafMark";

/**
 * Cha's real hand-drawn "cha" logo — always the supplied file, never redrawn (§2).
 * Source order: /public/brand/cha-logo.svg → .webp → Cha's published 300 px WebP.
 * If none can load (offline preview), a clearly-generic text fallback is shown.
 */
export function Logo({ size = 44, chip = false, className = "" }: { size?: number; chip?: boolean; className?: string }) {
  const { logo } = useApp();
  const [failed, setFailed] = useState(false);

  const inner = failed ? (
    <span className="inline-flex items-end gap-0.5" style={{ height: size }} aria-label="Cha">
      <span className="font-display font-extrabold lowercase leading-none text-leaf-text" style={{ fontSize: size * 0.62 }}>
        cha
      </span>
      <LeafMark size={size * 0.5} />
    </span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.src}
      alt={logo.alt}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
      onError={() => setFailed(true)}
      decoding="async"
    />
  );

  if (!chip) return <span className={`inline-flex ${className}`}>{inner}</span>;
  return <span className={`inline-flex rounded-2xl bg-paper p-1.5 shadow-sm ${className}`}>{inner}</span>;
}
