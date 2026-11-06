"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // §7 motion system
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  // Refresh triggers in page order, not creation order. A pin rebuilt later (Story's
  // desktop-only pin after a resize) would otherwise leave every pin below it stale.
  ScrollTrigger.addEventListener("refreshInit", () => ScrollTrigger.sort());
}

export const EASE = { enter: "power3.out", wipe: "expo.inOut" } as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
