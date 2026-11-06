"use client";
import { useEffect, useRef } from "react";
import { useApp } from "./AppProvider";
import { LEAF_PATHS } from "./ui/LeafMark";

const INTERACTIVE = "a, button, [role=tab], [role=button], label, select, summary, [data-cursor]";

/** A small dot that becomes a leaf over interactive items. Desktop pointer only. */
export function Cursor() {
  const { cinematic } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cinematic || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ref.current!;
    const root = document.documentElement;
    root.classList.add("has-leaf-cursor");
    let x = innerWidth / 2,
      y = innerHeight / 2,
      cx = x,
      cy = y,
      raf = 0,
      visible = false;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
      const t = e.target as Element | null;
      const field = t?.closest("input, textarea, [contenteditable]");
      const hot = !field && t?.closest(INTERACTIVE);
      el.dataset.state = field ? "hidden" : hot ? "leaf" : "dot";
      root.style.cursor = field ? "auto" : "";
    };
    const leave = () => {
      visible = false;
      el.style.opacity = "0";
    };
    const loop = () => {
      cx += (x - cx) * 0.32;
      cy += (y - cy) * 0.32;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      root.classList.remove("has-leaf-cursor");
    };
  }, [cinematic]);

  if (!cinematic) return null;
  return (
    <div
      ref={ref}
      data-chrome
      data-state="dot"
      aria-hidden
      className="group pointer-events-none fixed left-0 top-0 z-[90] opacity-0 transition-opacity duration-300 [@media(pointer:coarse)]:hidden"
    >
      <span className="absolute -left-[5px] -top-[5px] block h-[10px] w-[10px] rounded-full bg-ink ring-2 ring-paper transition-transform duration-300 group-data-[state=hidden]:scale-0 group-data-[state=leaf]:scale-0" />
      <svg
        width="30"
        height="30"
        viewBox="0 0 64 66"
        className="absolute -left-[6px] -top-[26px] origin-bottom-left scale-0 transition-transform duration-300 group-data-[state=leaf]:scale-100"
        style={{ transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
      >
        <path d={LEAF_PATHS.light} fill="var(--sprout)" stroke="var(--ink)" strokeWidth="2.5" />
        <path d={LEAF_PATHS.dark} fill="var(--leaf)" stroke="var(--ink)" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
