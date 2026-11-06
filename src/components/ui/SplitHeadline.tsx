"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useApp } from "../AppProvider";

interface Props {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Start immediately instead of on scroll (hero). */
  immediate?: boolean;
  delay?: number;
  stagger?: number;
  id?: string;
}

/**
 * Kinetic headline: SplitText chars rise from masked lines, 0.03–0.06 s stagger (§7).
 * Reduced motion: plain fade.
 */
export function SplitHeadline({ as: Tag = "h2", children, className = "", immediate, delay = 0, stagger = 0.035, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { cinematic, ready } = useApp();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !ready) return;
      if (!cinematic) {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: immediate ? delay : 0, scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true } });
        return;
      }
      let split: SplitText | null = null;
      document.fonts.ready.then(() => {
        if (!ref.current) return;
        split = SplitText.create(el, { type: "lines,words,chars", linesClass: "split-line", wordsClass: "split-word", mask: "lines", aria: "auto" });
        gsap.set(el, { opacity: 1 });
        gsap.from(split.chars, {
          yPercent: 115,
          rotate: 4,
          duration: 1,
          ease: "power3.out",
          stagger,
          delay,
          scrollTrigger: immediate ? undefined : { trigger: el, start: "top 86%", once: true },
        });
      });
      return () => split?.revert();
    },
    { dependencies: [cinematic, ready], scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className} style={{ opacity: 0 }} data-split>
      {children}
    </Tag>
  );
}
