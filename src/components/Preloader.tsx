"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { LeafMark } from "./ui/LeafMark";

/**
 * First-visit preloader, under 1.2 s: the leaf draws itself, then the panel wipes up.
 * Hidden before paint for returning visitors and reduced motion (see the inline
 * script + CSS in layout.tsx), so it never delays them.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("visited") || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    try {
      localStorage.setItem("cha:visited", "1");
    } catch {}
  }, []);

  const finish = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, { clipPath: "inset(0 0 100% 0)", duration: 0.35, ease: "expo.inOut", onComplete: () => setGone(true) });
  }, []);

  if (gone) return null;
  return (
    <div
      id="preloader"
      ref={ref}
      data-chrome
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-predawn text-paper"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <LeafMark size={84} draw duration={0.4} onDone={finish} />
      <span className="label text-[10px] tracking-[0.4em] text-sprout">Est. 2012 · Saipan</span>
    </div>
  );
}
