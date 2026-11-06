"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * The leaf as the motion motif (§Design 3). Two overlapping leaves, dark and light
 * green, as in Cha's logo. This is a motion stand-in for the leaf only — the logo
 * itself always renders Cha's supplied file (see Logo.tsx). Swap these paths for the
 * vector leaf once Cha supplies it [CONFIRM vector].
 */
export const LEAF_PATHS = {
  dark: "M31 58C26 40 34 17 58 7c2 23-8 41-27 51Z",
  light: "M31 58C22 47 9 39 6 20c17 2 27 16 25 38Z",
  ribDark: "M31 58Q43 33 56 10",
  ribLight: "M31 58Q19 40 8 22",
  stem: "M31 58v6",
};

interface Props {
  size?: number;
  className?: string;
  /** Animate the leaf drawing itself on mount (stroke draw → fill). */
  draw?: boolean;
  delay?: number;
  duration?: number;
  onDone?: () => void;
  mono?: string;
  title?: string;
}

export function LeafMark({ size = 48, className, draw = false, delay = 0, duration = 0.9, onDone, mono, title }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const dark = mono ?? "var(--leaf)";
  const light = mono ?? "var(--sprout)";

  useEffect(() => {
    if (!draw || !ref.current) return;
    const svg = ref.current;
    const strokes = svg.querySelectorAll<SVGPathElement>("[data-stroke]");
    const fills = svg.querySelectorAll<SVGPathElement>("[data-fill]");
    const ctx = gsap.context(() => {
      gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 1 });
      gsap.set(fills, { opacity: 0, scale: 0.86, transformOrigin: "31px 58px" });
      const tl = gsap.timeline({ delay, onComplete: onDone });
      tl.to(strokes, { strokeDashoffset: 0, duration, ease: "power2.inOut", stagger: 0.12 })
        .to(fills, { opacity: 1, scale: 1, duration: duration * 0.6, ease: "power3.out", stagger: 0.08 }, "-=0.35")
        .to(strokes, { opacity: 0, duration: 0.3 }, "-=0.2");
    }, svg);
    return () => ctx.revert();
  }, [draw, delay, duration, onDone]);

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 64 66"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path data-fill d={LEAF_PATHS.light} fill={light} />
      <path data-fill d={LEAF_PATHS.dark} fill={dark} style={{ mixBlendMode: "multiply" }} />
      <path data-fill d={LEAF_PATHS.ribDark} stroke="var(--white)" strokeOpacity={0.55} strokeWidth={1.4} fill="none" />
      {draw && (
        <g fill="none" stroke={dark} strokeWidth={2} strokeLinecap="round">
          <path data-stroke pathLength={1} d={LEAF_PATHS.light} opacity={0} />
          <path data-stroke pathLength={1} d={LEAF_PATHS.dark} opacity={0} />
          <path data-stroke pathLength={1} d={LEAF_PATHS.ribDark} opacity={0} />
          <path data-stroke pathLength={1} d={LEAF_PATHS.ribLight} opacity={0} />
        </g>
      )}
      <path d={LEAF_PATHS.stem} stroke={dark} strokeWidth={2.4} strokeLinecap="round" />
    </svg>
  );
}
