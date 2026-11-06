"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis, setLenis } from "@/lib/scroll";
import { useApp } from "./AppProvider";

/** Lenis inertia synced with ScrollTrigger (§3). Off for reduced motion (§7). */
export function SmoothScroll() {
  const { cinematic, orderOpen, cartOpen } = useApp();

  useEffect(() => {
    if (!cinematic) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, anchors: false });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, [cinematic]);

  // Re-measure triggers when the page height changes without a window resize
  // (fonts, split headlines, the hero switching to its tall cinematic layout).
  useEffect(() => {
    let last = 0;
    let timer = 0;
    const ro = new ResizeObserver(([e]) => {
      const h = Math.round(e.contentRect.height);
      if (h === last) return;
      last = h;
      clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(document.body);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  // Freeze page scroll behind drawers.
  useEffect(() => {
    const locked = orderOpen || cartOpen;
    const l = getLenis();
    if (l) {
      if (locked) l.stop();
      else l.start();
    }
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }, [orderOpen, cartOpen]);

  return null;
}
