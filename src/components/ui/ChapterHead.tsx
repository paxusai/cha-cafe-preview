"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useApp } from "../AppProvider";
import { DateStack } from "./DateStack";

/** Departure-board digits: each column rolls 0→9 to its value. */
export function DigitRoll({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span className={`inline-flex overflow-hidden tnum ${className}`} aria-label={value} role="text">
      {value.split("").map((d, i) => (
        <span key={i} className="relative inline-block h-[1em] w-[0.62em] overflow-hidden leading-none" aria-hidden>
          <span
            className="absolute left-0 top-0 flex flex-col transition-transform duration-700"
            style={{ transform: `translateY(-${Number(d) * 10}%)`, transitionTimingFunction: "var(--ease-wipe)", transitionDelay: `${i * 70}ms` }}
          >
            {Array.from({ length: 10 }).map((_, n) => (
              <span key={n} className="block h-[1em] leading-none">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * The numbered-panel system from Cha's posters, done on purpose: chapter number,
 * kicker and the "20 12 – 20 26" date stack. Enters with a horizontal ink wipe.
 */
export function ChapterHead({ n, kicker, tone = "ink", className = "" }: { n: string; kicker: string; tone?: "ink" | "white"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { cinematic, ready } = useApp();

  useGSAP(
    () => {
      if (!ready || !ref.current) return;
      const wipe = ref.current.querySelector("[data-wipe]");
      const text = ref.current.querySelector("[data-text]");
      if (!cinematic) {
        gsap.set(wipe, { scaleX: 0 });
        return;
      }
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } });
      tl.set(text, { opacity: 0 })
        .fromTo(wipe, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.55, ease: "expo.inOut" })
        .set(text, { opacity: 1 })
        .set(wipe, { transformOrigin: "100% 50%" })
        .to(wipe, { scaleX: 0, duration: 0.6, ease: "expo.inOut" });
    },
    { dependencies: [cinematic, ready], scope: ref },
  );

  const fg = tone === "white" ? "text-paper" : "text-ink";
  const wipeBg = tone === "white" ? "bg-paper" : "bg-ink";
  return (
    <div ref={ref} className={`flex items-start justify-between gap-6 ${fg} ${className}`}>
      <div className="relative inline-flex items-center gap-3 overflow-hidden py-1 pr-2">
        <span data-text className="label flex items-center gap-3">
          <span className="font-bold">{n}</span>
          <span aria-hidden className="h-px w-8 bg-current opacity-50" />
          <span className="opacity-80">{kicker}</span>
        </span>
        <span data-wipe aria-hidden className={`absolute inset-0 origin-left scale-x-0 ${wipeBg}`} />
      </div>
      <DateStack tone={tone} />
    </div>
  );
}
